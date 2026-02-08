import { z } from 'zod';
import * as woocommerce from './woocommerce';
import { ActionConfig } from '@/types/Tool';

export const WOOCOMMERCE_ACTIONS: Record<string, ActionConfig> = {
  get_order: {
    title: 'Get Order',
    description: 'Fetch order details using order ID',
    schema: z.object({
      orderId: z.string(),
    }),
    execute: woocommerce.get_order,
  },

  get_product_by_url: {
    title: 'Get Product',
    description: 'Fetch product details by URL',
    schema: z.object({
      url: z.string().url(),
    }),
    execute: woocommerce.get_product_by_url,
  },

  search_products: {
    title: 'Search Products',
    description: 'Search WooCommerce products',
    schema: z.object({
      query: z.string().optional(),
      limit: z.number().optional(),
    }),
    execute: woocommerce.search_products,
  },

  get_coupons: {
    title: 'Get Coupons',
    description: 'Fetch WooCommerce coupons',
    schema: z.object({
      code: z.string().optional(),
      limit: z.number().optional(),
    }),
    execute: woocommerce.get_coupons,
  },

  get_payment_methods: {
    title: 'Get Payment Methods',
    description: 'Fetch WooCommerce payment methods',
    schema: z.object({}),
    execute: woocommerce.get_payment_methods,
  },

  cancel_order: {
    title: 'Cancel Order',
    description: 'Cancel an order with optional reason',
    schema: z.object({
      order_id: z.number(),
      reason: z.string().optional(),
    }),
    execute: woocommerce.cancel_order,
  },

  add_customer_note: {
    title: 'Add Customer Note',
    description: 'Add a note to the customer order',
    schema: z.object({
      order_id: z.number(),
      note: z.string(),
      visible_to_customer: z.boolean().optional(),
    }),
    execute: woocommerce.add_customer_note,
  },
};
