import { z } from 'zod';
import { get_coupons, get_order, get_payment_methods, get_product_by_url, search_products, cancel_order, add_customer_note } from './executors/woocommerce';
import { ITool } from '@/models/Tool';

type ToolExecutor = (args: any, tool: ITool) => Promise<any>;

export type ActionConfig = {
  title?: string;
  description?: string;
  schema: z.ZodTypeAny;
  execute: ToolExecutor;
};

export const ACTION_REGISTRY: Record<
  string,                      // provider (woocommerce, shopify...)
  Record<string, ActionConfig> // actions
> = {
  woocommerce: {
    get_order: {
      title: 'Get Order',
      description: 'Fetch order details using order ID',
      schema: z.object({
        orderId: z.string(),
      }),
      execute: get_order,
    },

    get_product_by_url: {
      title: 'Get Product',
      description: 'Fetch product details by URL',
      schema: z.object({
        url: z.string().url(),
      }),
      execute: get_product_by_url,
    },

    search_products: {
      title: 'Search Products',
      description: 'Search WooCommerce products',
      schema: z.object({
        query: z.string().optional(),
        limit: z.number().optional(),
      }),
      execute: search_products,
    },

    get_coupons: {
      schema: z.object({
        code: z.string().optional(),
        limit: z.number().optional(),
      }),
      execute: get_coupons,
    },

    get_payment_methods: {
      schema: z.object({}),
      execute: get_payment_methods,
    },

    cancel_order: {
      schema: z.object({
        order_id: z.number(),
        reason: z.string().optional(),
      }),
      execute: cancel_order,
    },

    add_customer_note: {
      schema: z.object({
        order_id: z.number(),
        note: z.string(),
        visible_to_customer: z.boolean().optional(),
      }),
      execute: add_customer_note,
    },

  },
};
