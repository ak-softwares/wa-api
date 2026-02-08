import { ITool } from '@/models/Tool';
import { shopifyApi, ApiVersion } from '@shopify/shopify-api';

function createClient(tool: ITool) {
  const shop = tool.credentials.storeUrl.replace(/^https?:\/\//, '');

  return shopifyApi({
    apiKey: tool.credentials.apiKey,
    apiSecretKey: tool.credentials.apiSecret,
    scopes: ['read_orders', 'read_products', 'read_discounts'],
    hostName: shop,
    apiVersion: ApiVersion.January26,
    isEmbeddedApp: false,
  });
}

/* ---------------------------------------
   Order
--------------------------------------- */
export async function get_order(args: { orderId: string }, tool: ITool) {
  const client = createClient(tool);

  const session = {
    shop: tool.credentials.storeUrl,
    accessToken: tool.credentials.accessToken,
  } as any;

  const res = await client.rest.Order.find({
    session,
    id: args.orderId,
  });

  const o: any = res.data;

  return {
    id: o.id,
    status: o.financial_status,
    total: o.total_price,
    items: o.line_items?.map((i: any) => i.name),
    payment_method: o.gateway,
  };
}

/* ---------------------------------------
   Product by URL
--------------------------------------- */
export async function get_product_by_url(
  args: { url: string },
  tool: ITool
) {
  const client = createClient(tool);

  const handle = args.url.split('/products/')[1]?.split('?')[0];

  if (!handle) return { error: 'Invalid product URL' };

  const session = {
    shop: tool.credentials.storeUrl,
    accessToken: tool.credentials.accessToken,
  } as any;

  const res = await client.rest.Product.all({
    session,
    handle,
  });

  const p: any = res.data?.[0];
  if (!p) return { error: 'Product not found' };

  return {
    name: p.title,
    price: p.variants?.[0]?.price,
    stock: p.variants?.[0]?.inventory_quantity,
    description: p.body_html,
    url: `https://${tool.credentials.storeUrl}/products/${p.handle}`,
  };
}

/* ---------------------------------------
   Search products
--------------------------------------- */
export async function search_products(
  args: { query?: string; limit?: number },
  tool: ITool
) {
  const client = createClient(tool);

  const session = {
    shop: tool.credentials.storeUrl,
    accessToken: tool.credentials.accessToken,
  } as any;

  const res = await client.rest.Product.all({
    session,
    limit: Math.min(args.limit || 5, 5),
    title: args.query,
  });

  return res.data.map((p: any) => ({
    name: p.title,
    price: p.variants?.[0]?.price,
    stock: p.variants?.[0]?.inventory_quantity,
    description: p.body_html,
    url: `https://${tool.credentials.storeUrl}/products/${p.handle}`,
  }));
}

/* ---------------------------------------
   Discounts (coupons)
--------------------------------------- */
export async function get_coupons(
  _args: {},
  tool: ITool
) {
  const client = createClient(tool);

  const session = {
    shop: tool.credentials.storeUrl,
    accessToken: tool.credentials.accessToken,
  } as any;

  const res = await client.rest.PriceRule.all({ session });

  return res.data.map((c: any) => ({
    id: c.id,
    code: c.title,
    amount: c.value,
    type: c.value_type,
  }));
}

/* ---------------------------------------
   Payment methods
--------------------------------------- */
export async function get_payment_methods(
  _args: {},
  tool: ITool
) {
  const client = createClient(tool);

  const session = {
    shop: tool.credentials.storeUrl,
    accessToken: tool.credentials.accessToken,
  } as any;

  const res = await client.rest.PaymentGateway.all({ session });

  return res.data.map((p: any) => ({
    id: p.id,
    title: p.name,
    enabled: true,
  }));
}

/* ---------------------------------------
   Cancel order
--------------------------------------- */
export async function cancel_order(
  args: { order_id: number; reason?: string },
  tool: ITool
) {
  const client = createClient(tool);

  const session = {
    shop: tool.credentials.storeUrl,
    accessToken: tool.credentials.accessToken,
  } as any;

  await client.rest.Order.cancel({
    session,
    id: args.order_id,
    reason: args.reason,
  });

  return {
    id: args.order_id,
    status: 'cancelled',
  };
}

/* ---------------------------------------
   Add customer note
--------------------------------------- */
export async function add_customer_note(
  args: { order_id: number; note: string },
  tool: ITool
) {
  const client = createClient(tool);

  const session = {
    shop: tool.credentials.storeUrl,
    accessToken: tool.credentials.accessToken,
  } as any;

  const order = await client.rest.Order.find({
    session,
    id: args.order_id,
  });

  order.data.note = args.note;
  await order.save({ session });

  return {
    order_id: args.order_id,
    note: args.note,
  };
}
