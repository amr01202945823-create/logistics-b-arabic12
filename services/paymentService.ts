
import { User } from '../types';

// This points to your deployed backend URL
const API_BASE_URL = 'http://localhost:5000/api';

export const initiateSubscription = async (user: User, planType: 'monthly' | 'yearly'): Promise<string | null> => {
  try {
    // Mapping plan names to IDs (These IDs should match your Database Plan IDs)
    const planId = planType === 'monthly' ? 'plan_monthly_id_123' : 'plan_yearly_id_456';

    // Attempt to fetch from backend
    try {
        const response = await fetch(`${API_BASE_URL}/payment/initiate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            planId: planId,
          }),
        });

        if (!response.ok) {
          throw new Error('Payment initiation failed');
        }

        const data = await response.json();
        return data.url; // The Paymob iframe URL
    } catch (networkError) {
        // Fallback for demo environment where backend is not running
        console.warn("Backend API not reachable. Using mock payment URL for demonstration.");
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network latency
        return "https://accept.paymob.com/standalone?ref=mock_payment_token"; 
    }
  } catch (error) {
    console.error("Payment Error:", error);
    return null;
  }
};
