export interface RazorpayCreateOrderRequest {
  amount: number;
  currency: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface CreatedOrderResponse {
  id: string;
  currency: string;
  amount: number;
  user?: {
    name: string;
    email: string;
    phone: string;
  }
};

export interface RazorpayHandlerResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayOptions {
  key: string | undefined;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  handler: (response: RazorpayHandlerResponse) => void | Promise<void>;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  notes?: Record<string, string>;
}

export interface RazorpayInstance {
  open(): void;
  on(
    event: 'payment.failed',
    handler: (response: {
      error: {
        description: string;
      };
    }) => void
  ): void;
}
