import { Connection } from "mongoose"
import type {
  RazorpayOptions,
  RazorpayInstance,
} from '@/types/razorpay';

declare global {
    var mongoose: {
        conn: Connection | null
        promise: Promise<Connection> | null
    }

    // Razorpay typings
    interface Window {
        Razorpay: RazorpayConstructor;
    }

    interface RazorpayConstructor {
        new (options: RazorpayOptions): RazorpayInstance;
    }

}

export {}

