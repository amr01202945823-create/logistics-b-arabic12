
const axios = require('axios');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PAYMOB_API_URL = "https://accept.paymob.com/api";

// 1. Initiate Payment (Start flow)
exports.initiatePayment = async (req, res) => {
  const { userId, planId } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const plan = await prisma.plan.findUnique({ where: { id: planId } });

    if (!user || !plan) return res.status(404).json({ error: "User or Plan not found" });

    // Step 1: Auth
    const authResponse = await axios.post(`${PAYMOB_API_URL}/auth/tokens`, {
      api_key: process.env.PAYMOB_API_KEY
    });
    const token = authResponse.data.token;

    // Step 2: Order Registration
    const orderResponse = await axios.post(`${PAYMOB_API_URL}/ecommerce/orders`, {
      auth_token: token,
      delivery_needed: "false",
      amount_cents: plan.price,
      currency: "EGP",
      items: [],
    });
    const orderId = orderResponse.data.id;

    // Step 3: Payment Key Request
    const keyResponse = await axios.post(`${PAYMOB_API_URL}/acceptance/payment_keys`, {
      auth_token: token,
      amount_cents: plan.price,
      expiration: 3600,
      order_id: orderId,
      billing_data: {
        first_name: user.name.split(" ")[0] || "User",
        last_name: user.name.split(" ")[1] || "Name",
        email: user.email,
        phone_number: user.phone || "NA",
        apartment: "NA", floor: "NA", street: "NA", building: "NA",
        shipping_method: "NA", postal_code: "NA", city: "Cairo", country: "EG", state: "NA"
      },
      currency: "EGP",
      integration_id: process.env.PAYMOB_INTEGRATION_ID_CARD // Switch ID for Wallet if needed
    });

    const paymentKey = keyResponse.data.token;

    // Save pending transaction
    await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: plan.price,
        status: "PENDING",
        gatewayRefId: orderId.toString(),
        paymentMethod: "card"
      }
    });

    // Return iframe URL
    return res.json({ 
      url: `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKey}` 
    });

  } catch (error) {
    console.error("Payment Init Error:", error);
    res.status(500).json({ error: "Payment initiation failed" });
  }
};

// 2. Webhook Handler (Process Callback)
exports.paymobWebhook = async (req, res) => {
  try {
    const data = req.body.obj;
    const hmac = req.query.hmac;

    // HMAC Validation (Critical Security Step)
    const fields = [
      "amount_cents", "created_at", "currency", "error_occured", "has_parent_transaction",
      "id", "integration_id", "is_3d_secure", "is_auth", "is_capture", "is_refunded",
      "is_standalone_payment", "is_voided", "order", "owner", "pending", "source_data.pan",
      "source_data.sub_type", "source_data.type", "success"
    ];
    
    const concatenatedValues = fields.map(field => {
       if(field.includes('.')) {
           const [parent, child] = field.split('.');
           return data[parent][child];
       }
       return data[field];
    }).join("");

    const calculatedHmac = crypto.createHmac('sha512', process.env.PAYMOB_HMAC_SECRET)
      .update(concatenatedValues)
      .digest('hex');

    if (calculatedHmac !== hmac) {
      return res.status(403).send("Forbidden");
    }

    // Process Successful Payment
    if (data.success === true) {
      const orderId = data.order.id.toString();
      
      const transaction = await prisma.transaction.findFirst({
        where: { gatewayRefId: orderId }
      });

      if (transaction && transaction.status !== 'SUCCESS') {
        // Update Transaction
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { status: 'SUCCESS' }
        });

        // Find Plan based on price
        const plan = await prisma.plan.findFirst({ where: { price: data.amount_cents } });

        if (plan) {
          const startDate = new Date();
          const endDate = new Date();
          endDate.setDate(startDate.getDate() + plan.durationInDays);

          // Activate Subscription
          await prisma.$transaction([
            prisma.subscription.create({
              data: {
                userId: transaction.userId,
                planId: plan.id,
                startDate: startDate,
                endDate: endDate,
                status: 'ACTIVE'
              }
            ]),
            prisma.user.update({
              where: { id: transaction.userId },
              data: { subscriptionStatus: 'ACTIVE' }
            })
          ]);
        }
      }
    } else {
       // Handle failure...
    }

    res.status(200).send("Webhook Received");
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).send("Error");
  }
};
