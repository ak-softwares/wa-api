import { ActionConfig } from '@/types/Tool';
import { SHOPIFY_ACTIONS } from '../executors/shopify/shopify-actions';
import { WOOCOMMERCE_ACTIONS } from '../executors/woocommerce/woocommerce-action';
import { WA_API } from '../executors/wa-api/wa-api-action';
import { GOOGLE_CALENDAR } from '../executors/googleCalendar/actions';
import { GOOGLE_CONTACTS } from '../executors/googleContacts/actions';

export const ACTION_REGISTRY: Record<
  string,
  Record<string, ActionConfig>
> = {
  shopify: SHOPIFY_ACTIONS,
  woocommerce: WOOCOMMERCE_ACTIONS,
  wa_api: WA_API,
  google_calendar: GOOGLE_CALENDAR,
  google_contacts: GOOGLE_CONTACTS,
};
