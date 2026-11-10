// 「再来一单」：把一个老订单里的商品按当前的价格库存重新加进购物车。
// 价格、库存、起订量都以现在的为准：已经下架、没库存的跳过；数量不够起订量补到起订量，超过库存的改成库存。
import { canBuy, setQty, capOf } from '@/utils/cart.js';
import { getShopCatalog } from '@/api/shop.js';

// 纯逻辑：order 里的每一行配上现在能买的商品。返回 { lines: [{ item, qty }], skipped }
export function planReorder(order, products) {
  const byId = {};
  products.forEach((p) => {
    byId[p.id] = p;
  });
  const lines = [];
  let skipped = 0;
  (order.items || []).forEach((i) => {
    const p = byId[i.productId];
    if (!p || !canBuy(p)) {
      skipped++;
      return;
    }
    const min = p.minOrderQty || 1;
    lines.push({ item: p, qty: Math.min(Math.max(i.qty, min), capOf(p)) });
  });
  return { lines, skipped };
}

// 加进购物车。返回 { added, skipped }；取不到商品（没网、没登录）抛错，调用方提示重试
export async function reorder(order) {
  const { data } = await getShopCatalog();
  if (data.code !== 0) throw new Error(data.message || 'catalog failed');
  const products = (data.data || []).flatMap((c) => c.catalogs).flatMap((k) => k.products);
  const { lines, skipped } = planReorder(order, products);
  lines.forEach((l) => setQty(l.item, l.qty));
  return { added: lines.length, skipped };
}
