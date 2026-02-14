import { ITool } from '@/models/Tool';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

function createApi(tool: ITool) {
  return new WooCommerceRestApi({
    url: tool.credentials.storeUrl,
    consumerKey: tool.credentials.consumerKey,
    consumerSecret: tool.credentials.consumerSecret,
    version: 'wc/v3',
  });
}

/* ---------------------------------------
   Order
--------------------------------------- */
export async function get_order(
  args: { orderId: string },
  tool: ITool
) {
  const api = createApi(tool);

  const { data } = await api.get(`orders/${args.orderId}`);
  // console.log(`data: ${JSON.stringify(data, null, 2)}`)
  return {
    id: data.id,
    status: data.status,
    total: data.total,
    items: data.line_items?.map((i: any) => i.name),
    payment_method: data.payment_method_title,
  };
}

/* ---------------------------------------
   Product by URL
--------------------------------------- */
export async function get_product_by_url(
  args: { url: string },
  tool: ITool
) {
  const api = createApi(tool);

  // extract slug from URL
  const cleanUrl = args.url.split('?')[0].replace(/\/$/, '');
  const slug = cleanUrl.substring(cleanUrl.lastIndexOf('/') + 1);

  if (!slug) {
    return { error: 'Invalid product URL' };
  }

  const { data } = await api.get('products', {
    slug,
  });

  const p = data?.[0];
  if (!p) return { error: 'Product not found' };

  return {
    name: p.name,
    price: p.price,
    stock: p.stock_status,
    description: p.short_description,
    url: p.permalink,
  };
}


/* ---------------------------------------
   Search many products
--------------------------------------- */
export async function search_products(
  args: { query?: string; limit?: number },
  tool: ITool
) {
  const api = createApi(tool);

  const { data } = await api.get('products', {
    search: args.query || '',
    per_page: Math.min(args.limit || 5, 5), // safety limit
  });

  return data.map((p: any) => ({
    name: p.name,
    price: p.price,
    stock: p.stock_status,
    description: p.short_description,
    url: p.permalink,
  }));
}

/* ---------------------------------------
   Get many coupons
--------------------------------------- */
export async function get_coupons(
  args: { code?: string; limit?: number },
  tool: ITool
) {
  const api = createApi(tool);

  const { data } = await api.get("coupons", {
    search: args.code || "",              // search by coupon code
    per_page: Math.min(args.limit || 5, 10), // safety limit
  });

  return data.map((c: any) => ({
    id: c.id,
    code: c.code,
    amount: c.amount,
    type: c.discount_type, // percent | fixed_cart | fixed_product
    description: c.description,
    usage_count: c.usage_count,
    expiry_date: c.date_expires,
    free_shipping: c.free_shipping,
  }));
}

/* ---------------------------------------
   Get payment methods
--------------------------------------- */
export async function get_payment_methods(
  _args: {},
  tool: ITool
) {
  const api = createApi(tool);

  const { data } = await api.get("payment_gateways");

  return data.map((p: any) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    enabled: p.enabled,
    method_title: p.method_title,
  }));
}

/* ---------------------------------------
   Cancel order (with proper note)
--------------------------------------- */
export async function cancel_order(
  args: { order_id: number; reason?: string },
  tool: ITool
) {
  const api = createApi(tool);

  if (!args.order_id) {
    throw new Error("order_id is required");
  }

  /* 1️⃣ Cancel order */
  const { data } = await api.put(`orders/${args.order_id}`, {
    status: "cancelled",
  });

  /* 2️⃣ Add note (correct way) */
  if (args.reason) {
    await api.post(`orders/${args.order_id}/notes`, {
      note: args.reason,
      customer_note: false, // true = visible to customer
    });
  }

  return {
    id: data.id,
    status: data.status,
    total: data.total,
    currency: data.currency,
    cancelled_at: data.date_modified,
  };
}

/* ---------------------------------------
   Add customer note to order
--------------------------------------- */
export async function add_customer_note(
  args: {
    order_id: number;
    note: string;
    visible_to_customer?: boolean;
  },
  tool: ITool
) {
  const api = createApi(tool);

  if (!args.order_id) {
    throw new Error("order_id is required");
  }

  if (!args.note) {
    throw new Error("note is required");
  }

  const { data } = await api.post(`orders/${args.order_id}/notes`, {
    note: args.note,
    customer_note: args.visible_to_customer ?? true, // default visible
  });

  return {
    order_id: args.order_id,
    note_id: data.id,
    note: data.note,
    visible_to_customer: data.customer_note,
    created_at: data.date_created,
  };
}
