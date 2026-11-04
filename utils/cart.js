// 购物车（目前只在内存里，假数据阶段用；接服务端后改成调购物车接口，函数签名不变）。
// 数量规则：从 0 第一次加就加到起订量；之后每次加 1，最多到库存；
// 减到起订量以下就直接移除（不允许买比起订量还少的数量）。
// 勾选：新加进购物车的商品默认勾选；结算只算勾选的商品。
import Vue from 'vue';

export const cartState = Vue.observable({ items: {}, unselected: {} });

export const qtyOf = (id) => cartState.items[id] || 0;

// 能不能买：有库存，且库存不少于起订量
export const canBuy = (p) => p.stock > 0 && p.stock >= (p.minOrderQty || 1);

export const isSelected = (id) => !cartState.unselected[id];

// 返回 'max' 表示已到库存上限，没有增加
export function addItem(p) {
  if (!canBuy(p)) return 'unavailable';
  const cur = qtyOf(p.id);
  const next = cur === 0 ? p.minOrderQty || 1 : cur + 1;
  if (next > p.stock) return 'max';
  if (cur === 0) Vue.delete(cartState.unselected, p.id); // 重新加入的商品默认勾选
  Vue.set(cartState.items, p.id, next);
  return 'ok';
}

export function reduceItem(p) {
  const cur = qtyOf(p.id);
  if (cur <= 0) return;
  const next = cur - 1;
  if (next < (p.minOrderQty || 1)) {
    Vue.delete(cartState.items, p.id);
    Vue.delete(cartState.unselected, p.id);
  } else Vue.set(cartState.items, p.id, next);
}

// 手动输入数量。返回实际生效的数量和原因：
//   'ok' 原样接受；'min' 低于起订量，按起订量；'max' 超过库存，按库存；'invalid' 不是正整数，数量不变
// （清空输入框或输入 0 不会删除商品，删除请用「−」减到起订量以下，避免改数字时误删）
export function setQty(p, raw) {
  const cur = qtyOf(p.id);
  const n = parseInt(raw, 10);
  if (!canBuy(p) || !(n > 0)) return { qty: cur, reason: 'invalid' };
  const min = p.minOrderQty || 1;
  let qty = n;
  let reason = 'ok';
  if (n < min) {
    qty = min;
    reason = 'min';
  } else if (n > p.stock) {
    qty = p.stock;
    reason = 'max';
  }
  if (cur === 0) Vue.delete(cartState.unselected, p.id);
  Vue.set(cartState.items, p.id, qty);
  return { qty, reason };
}

export function toggleSelect(id) {
  if (isSelected(id)) Vue.set(cartState.unselected, id, true);
  else Vue.delete(cartState.unselected, id);
}

// 全选 / 全不选（ids 是购物车里当前所有商品的 id）
export function selectAll(ids, selected) {
  ids.forEach((id) => {
    if (selected) Vue.delete(cartState.unselected, id);
    else Vue.set(cartState.unselected, id, true);
  });
}

export function clearCart() {
  Object.keys(cartState.items).forEach((id) => Vue.delete(cartState.items, id));
  Object.keys(cartState.unselected).forEach((id) => Vue.delete(cartState.unselected, id));
}

// 下单成功后，把已经买下的商品从购物车移除
export function removeItems(ids) {
  ids.forEach((id) => {
    Vue.delete(cartState.items, id);
    Vue.delete(cartState.unselected, id);
  });
}
