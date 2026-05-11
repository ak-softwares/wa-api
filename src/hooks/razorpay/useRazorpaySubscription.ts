'use client';

import { useState } from 'react';
import { ApiResponse } from '@/types/apiResponse';
import { CreatedSubscriptionResponse } from '@/types/Razorpay-web';

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
      onSuccess?.(subscriptionData);

      if (subscriptionData.short_url) {
        window.location.href = subscriptionData.short_url;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'There was an error creating subscription';
      onFailure?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { initiateSubscription, loading };
}
