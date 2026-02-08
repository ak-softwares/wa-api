import { z } from 'zod';
import * as shopify from './shopify-access-token';
import { ActionConfig } from '@/types/Tool';

export const SHOPIFY_ACTIONS: Record<string, ActionConfig> = {
  get_order: {
    title: 'Get Order',
    description: 'Fetch order details using order ID',
    schema: z.object({ orderId: z.string() }),
    execute: shopify.get_order,
  },

  get_product_by_url: {
    title: 'Get Product',
    description: 'Fetch product details by URL',
    schema: z.object({ url: z.string().url() }),
    execute: shopify.get_product_by_url,
  },

  search_products: {
    title: 'Search Products',
    description: 'Search Shopify products',
    schema: z.object({
      query: z.string().optional(),
      limit: z.number().optional(),
    }),
    execute: shopify.search_products,
  },

  get_coupons: {
    title: 'Get Coupons',
    description: 'Fetch Shopify coupons',
    schema: z.object({}),
    execute: shopify.get_coupons,
  },

  get_payment_methods: {
    title: 'Get Payment Methods',
    description: 'Fetch Shopify payment methods',
    schema: z.object({}),
    execute: shopify.get_payment_methods,
  },

  cancel_order: {
    title: 'Cancel Order',
    description: 'Cancel an order with optional reason',
    schema: z.object({
      order_id: z.number(),
      reason: z.string().optional(),
    }),
    execute: shopify.cancel_order,
  },

  add_customer_note: {
    title: 'Add Customer Note',
    description: 'Add a note to the customer order',
    schema: z.object({
      order_id: z.number(),
      note: z.string(),
    }),
    execute: shopify.add_customer_note,
  },
};
