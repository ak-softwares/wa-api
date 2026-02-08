import { ActionConfig } from '@/types/Tool';
import { SHOPIFY_ACTIONS } from './executors/shopify/shopify-actions';
import { WOOCOMMERCE_ACTIONS } from './executors/woocommerce/woocommerce-action';

export const ACTION_REGISTRY: Record<
  string,
  Record<string, ActionConfig>
> = {
  shopify: SHOPIFY_ACTIONS,
  woocommerce: WOOCOMMERCE_ACTIONS,
};
