import axios, { AxiosInstance } from 'axios';
import { ITool } from '@/models/Tool';

const SHOPIFY_API_VERSION = '2026-01';

function normalizeDomain(domain: string) {
  return domain
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');
}

function createApi(tool: ITool): AxiosInstance {
  const domain = normalizeDomain(tool.credentials.shopDomain || '');

  if (!domain || !tool.credentials.accessToken) {
    throw new Error('Missing Shopify credentials: shopDomain or accessToken');
  }

  return axios.create({
    baseURL: `https://${domain}/admin/api/${SHOPIFY_API_VERSION}`,
    headers: {
      'X-Shopify-Access-Token': tool.credentials.accessToken,
      'Content-Type': 'application/json',
    },
  });
}

export async function get_order(args: { orderId: string }, tool: ITool) {
  const api = createApi(tool);
  const { data } = await api.get(`/orders/${args.orderId}.json`);
  const order = data?.order;

  return {
    id: order?.id,
    status: order?.cancelled_at ? 'cancelled' : order?.financial_status,
    total: order?.total_price,
    items: order?.line_items?.map((i: any) => i.name),
    payment_method: order?.gateway,
  };
}

export async function get_product_by_url(args: { url: string }, tool: ITool) {
  const api = createApi(tool);

  const cleanUrl = args.url.split('?')[0].replace(/\/$/, '');
  const handle = cleanUrl.substring(cleanUrl.lastIndexOf('/') + 1);

  if (!handle) {
    return { error: 'Invalid product URL' };
  }

  const { data } = await api.get('/products.json', {
    params: { handle, limit: 1 },
  });

  const product = data?.products?.[0];
  if (!product) return { error: 'Product not found' };

  return {
    name: product.title,
    price: product.variants?.[0]?.price,
    stock: product.status,
    description: product.body_html,
    url: `https://${normalizeDomain(tool.credentials.shopDomain || '')}/products/${product.handle}`,
  };
}

export async function search_products(
  args: { query?: string; limit?: number },
  tool: ITool
) {
  const api = createApi(tool);

  const { data } = await api.get('/products.json', {
    params: {
      title: args.query || undefined,
      limit: Math.min(args.limit || 5, 5),
    },
  });

  return (data?.products || []).map((p: any) => ({
    name: p.title,
    price: p.variants?.[0]?.price,
    stock: p.status,
    description: p.body_html,
    url: `https://${normalizeDomain(tool.credentials.shopDomain || '')}/products/${p.handle}`,
  }));
}

export async function get_coupons(
  args: { code?: string; limit?: number },
  tool: ITool
) {
  const api = createApi(tool);
  const perPage = Math.min(args.limit || 5, 10);

  const { data } = await api.get('/price_rules.json', {
    params: { limit: perPage },
  });

  const rules = data?.price_rules || [];
  const coupons: any[] = [];

  for (const rule of rules) {
    const response = await api.get(`/price_rules/${rule.id}/discount_codes.json`, {
      params: { limit: 250 },
    });

    for (const discount of response.data?.discount_codes || []) {
      if (args.code && !discount.code.toLowerCase().includes(args.code.toLowerCase())) {
        continue;
      }

      coupons.push({
        id: discount.id,
        code: discount.code,
        amount: Math.abs(Number(rule.value || 0)).toString(),
        type: rule.value_type,
        description: rule.title,
        usage_count: rule.usage_count,
        expiry_date: rule.ends_at,
        free_shipping: rule.target_type === 'shipping_line',
      });

      if (coupons.length >= perPage) {
        return coupons;
      }
    }
  }

  return coupons;
}

export async function get_payment_methods(_args: {}, tool: ITool) {
  const api = createApi(tool);
  const { data } = await api.get('/payment_gateways.json');

  return (data?.payment_gateways || []).map((p: any) => ({
    id: p.id,
    title: p.name,
    description: p.provider,
    enabled: true,
    method_title: p.payment_method_name,
  }));
}

export async function cancel_order(
  args: { order_id: number; reason?: string },
  tool: ITool
) {
  const api = createApi(tool);

  if (!args.order_id) {
    throw new Error('order_id is required');
  }

  const { data } = await api.post(`/orders/${args.order_id}/cancel.json`, {
    reason: args.reason || 'other',
    email: false,
  });

  const order = data?.order;

  return {
    id: order?.id,
    status: order?.cancelled_at ? 'cancelled' : order?.financial_status,
    total: order?.total_price,
    currency: order?.currency,
    cancelled_at: order?.cancelled_at,
  };
}

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
    throw new Error('order_id is required');
  }

  if (!args.note) {
    throw new Error('note is required');
  }

  const { data } = await api.put(`/orders/${args.order_id}.json`, {
    order: {
      id: args.order_id,
      note: args.note,
    },
  });

  const order = data?.order;

  return {
    order_id: args.order_id,
    note_id: order?.id,
    note: order?.note,
    visible_to_customer: args.visible_to_customer ?? false,
    created_at: order?.updated_at,
  };
}
