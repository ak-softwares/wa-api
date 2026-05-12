'use client';

import { useState } from 'react';
import { ApiResponse } from '@/types/apiResponse';
import { CreatedSubscriptionResponse, RazorpayHandlerResponse, RazorpayOptions } from '@/types/Razorpay-web';
import { loadRazorpayScript } from '@/utiles/scripts/loadRazorpayScript';
import { razorpayHandler } from './useRazorpayPayment';

interface UseRazorpaySubscriptionParams {
  tier: string;      // "STARTER" | "GROWTH"
  billing: string;   // "MONTHLY" | "YEARLY"
  currency: string;  // "INR" | "USD"
  onSuccess?: (data: CreatedSubscriptionResponse) => void;
  onFailure?: (error: string) => void;
}

export function useRazorpaySubscription() {
  const [loading, setLoading] = useState(false);

  const initiateSubscription = async ({
    tier,
    billing,
    currency,
    onSuccess,
    onFailure,
  }: UseRazorpaySubscriptionParams) => {
    setLoading(true);

    try {
      const subscriptionResponse = await fetch('/api/razorpay/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, billing, currency }),
      });

      const subscriptionBody: ApiResponse<CreatedSubscriptionResponse> = await subscriptionResponse.json();

      if (!subscriptionResponse.ok || !subscriptionBody.success || !subscriptionBody.data) {
        throw new Error(subscriptionBody.message || 'Unable to create subscription');
      }

      const subscriptionData = subscriptionBody.data;
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Unable to load Razorpay Checkout');
      }

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        name: 'WA API',
        description: `${subscriptionData.tier} ${subscriptionData.billing} subscription`,
        subscription_id: subscriptionData.id,
        prefill: {
          name: subscriptionData.user.name ?? 'User',
          email: subscriptionData.user.email ?? 'customer@example.com',
          contact: subscriptionData.user.phone ?? '919999999999',
        },
        theme: { color: '#3399cc' },
        // notes: {
        //     address: "Razorpay Corporate Office"
        // },
        // callback_url: 'https://yourapp.com/payment-success',
        handler: (response: RazorpayHandlerResponse) => razorpayHandler({
            response,
            onSuccess: () => {
                // onSuccess?.();
                // console.log('Paid:', );
            },
            onFailure: (error) => {
                onFailure?.(error);
                // console.error('Failed:', error);
            },
        })
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on('payment.failed', (response: { error: { description: string } }) => {
        onFailure?.(response.error.description || 'Subscription payment failed');
      });

      paymentObject.open();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'There was an error creating subscription';
      onFailure?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { initiateSubscription, loading };
}
