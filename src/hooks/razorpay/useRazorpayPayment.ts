'use client';

import { useState } from 'react';
import type { CreatedOrderResponse, RazorpayHandlerResponse, RazorpayOptions } from '@/types/Razorpay';
import { loadRazorpayScript } from '@/utiles/scripts/loadRazorpayScript';
import { ApiResponse } from '@/types/apiResponse';

interface RazorpayHandlerParams {
  response: RazorpayHandlerResponse;
  onSuccess?: () => void;
  onFailure?: (error: string) => void;
}

export async function razorpayHandler({
  response,
  onSuccess,
  onFailure,
}: RazorpayHandlerParams): Promise<void> {
  try {
    const verifyRes = await fetch('/api/razorpay/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response),
    });

    const verifyBody: ApiResponse = await verifyRes.json();

    if (verifyBody.success) {
      onSuccess?.();
    } else {
      onFailure?.(verifyBody.message || 'Verification failed');
    }
  } catch (err) {
    onFailure?.('Verification request failed');
  }
}



interface UseRazorpayPaymentParams {
  amount: number;
  currency?: string;
  name?: string;
  description?: string;
  onSuccess?: () => void;
  onFailure?: (error: string) => void;
}

export function useRazorpayPayment() {
  const [loading, setLoading] = useState(false);

  const initiatePayment = async ({
    amount,
    currency = 'USD',
    name = 'WA API',
    description = 'Payment',
    onSuccess,
    onFailure,
  }: UseRazorpayPaymentParams) => {
    setLoading(true);

    try {
      await loadRazorpayScript();

      const orderResponse = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency }),
      });

      const orderBody: ApiResponse = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(orderBody.message);
      const orderData: CreatedOrderResponse = orderBody.data;

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name,
        description,
        order_id: orderData.id,
        prefill: {
          name: orderData.user?.name ?? "User",
          email: orderData.user?.email ?? 'customer@example.com',
          contact: orderData.user?.phone ?? '919999999999',
        },
        theme: { color: '#3399cc' },
        // notes: {
        //     address: "Razorpay Corporate Office"
        // },
        // callback_url: 'https://yourapp.com/payment-success',
        handler: (response: RazorpayHandlerResponse) => razorpayHandler({
            response,
            onSuccess: () => {
                onSuccess?.();
                // console.log('Paid:', );
            },
            onFailure: (error) => {
                onFailure?.(error);
                // console.error('Failed:', error);
            },
        })
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      onFailure?.("there something error");
    } finally {
      setLoading(false);
    }
  };

  return { initiatePayment, loading };
}
