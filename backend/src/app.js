
const express = require('express');
const cors = require('cors');
const paymentController = require('./controllers/paymentController');
const adminController = require('./controllers/adminController');

const app = express();
app.use(express.json());
app.use(cors());

// Public Routes
app.post('/api/payment/initiate', paymentController.initiatePayment);
app.post('/api/payment/webhook', paymentController.paymobWebhook);
app.get('/api/payment/webhook', paymentController.paymobWebhook); // Sometimes Paymob sends GET to check existence

// Admin Routes (Should be protected with Middleware in prod)
app.get('/api/admin/stats', adminController.getDashboardStats);
app.post('/api/admin/activate', adminController.manualActivate);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
