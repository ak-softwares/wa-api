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

  return {
    id: data.id,
    status: data.status,
    total: data.total,
    items: data.line_items?.map((i: any) => i.name),
    payment_method: data.payment_method_title,
  };
}

/* ---------------------------------------
   Product by slug
--------------------------------------- */
export async function get_product_by_slug(
  args: { slug: string },
  tool: ITool
) {
  const api = createApi(tool);

  const { data } = await api.get('products', {
    slug: args.slug,
  });

  const p = data?.[0];
  if (!p) return { error: 'Product not found' };

  return {
    id: p.id,
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
    id: p.id,
    name: p.name,
    price: p.price,
    stock: p.stock_status,
    url: p.permalink,
  }));
}
