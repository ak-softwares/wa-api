import { z } from 'zod';
import { get_order, get_product_by_slug, search_products } from './executors/woocommerce';
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

    get_product_by_slug: {
      title: 'Get Product',
      description: 'Fetch product details by slug',
      schema: z.object({
        slug: z.string(),
      }),
      execute: get_product_by_slug,
    },

    search_products: {
      title: 'Search Products',
      description: 'Search WooCommerce products',
      schema: z.object({
        query: z.string().optional(),
        limit: z.number().optional(),
      }),
      execute: search_products,
    }
  },
};
