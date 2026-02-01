import { z } from 'zod';
import { get_order, get_product_by_slug, search_products } from './executors/woocommerce';
import { ITool } from '@/models/Tool';

type ToolExecutor = (args: any, tool: ITool) => Promise<any>;

type ActionConfig = {
  schema: z.ZodTypeAny;
  execute: ToolExecutor;
};

export const ACTION_REGISTRY: Record<
  string,                    // provider (woocommerce, shopify...)
  Record<string, ActionConfig> // actions
> = {
  woocommerce: {
    get_order: {
      schema: z.object({
        orderId: z.string(),
      }),
      execute: get_order,
    },

    get_product_by_slug: {
      schema: z.object({
        slug: z.string(),
      }),
      execute: get_product_by_slug,
    },

    search_products: {
      schema: z.object({
        query: z.string().optional(),
        limit: z.number().optional(),
      }),
      execute: search_products,
    },
  },
};
