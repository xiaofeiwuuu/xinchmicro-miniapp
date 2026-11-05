// 购物车。存在本机（storage 的 cart:v1：只存 商品 id → 数量 和勾选状态，退出小程序再进来还在），
// 价格、库存、起订量不存——这些每次都以服务端为准：商城页取到最新商品后调 reconcileCart，
// 把已下架的从购物车移除、数量超过库存或低于起订量的改成合法数量。
// （没有放服务端：购物车不是订单，放本机足够，也不用多一套接口和并发处理。）
// 数量规则：从 0 第一次加就加到起订量；之后每次加 1，最多到库存；
// 减到起订量以下就直接移除（不允许买比起订量还少的数量）。
// 勾选：新加进购物车的商品默认勾选；结算只算勾选的商品。
import Vue from 'vue';

const KEY = 'cart:v1';
const MAX_LINES = 100; // 和服务端一次最多下 100 种商品一致

// 从本机读：只接受「正整数 id → 正整数数量」，坏数据直接丢掉，不能因为存储里有脏数据让整个商城打不开
function load() {
  const out = { items: {}, unselected: {} };
  try {
    const v = uni.getStorageSync(KEY);
    if (!v || typeof v !== 'object') return out;
    Object.keys(v.items || {}).slice(0, MAX_LINES).forEach((id) => {
      const n = Number(v.items[id]);
      if (/^\d+$/.test(id) && Number.isInteger(n) && n > 0 && n <= 100000) out.items[id] = n;
    });
    Object.keys(v.unselected || {}).forEach((id) => {
      if (out.items[id]) out.unselected[id] = true;
    });
  } catch (e) {}
  return out;
}

export const cartState = Vue.observable(load());

function persist() {
  try {
    uni.setStorageSync(KEY, { items: { ...cartState.items }, unselected: { ...cartState.unselected } });
  } catch (e) {}
}

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
  persist();
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
  persist();
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
  persist();
  return { qty, reason };
}

export function toggleSelect(id) {
  if (isSelected(id)) Vue.set(cartState.unselected, id, true);
  else Vue.delete(cartState.unselected, id);
  persist();
}

// 全选 / 全不选（ids 是购物车里当前所有商品的 id）
export function selectAll(ids, selected) {
  ids.forEach((id) => {
    if (selected) Vue.delete(cartState.unselected, id);
    else Vue.set(cartState.unselected, id, true);
  });
  persist();
}

export function clearCart() {
  Object.keys(cartState.items).forEach((id) => Vue.delete(cartState.items, id));
  Object.keys(cartState.unselected).forEach((id) => Vue.delete(cartState.unselected, id));
  persist();
}

// 下单成功后，把已经买下的商品从购物车移除
export function removeItems(ids) {
  ids.forEach((id) => {
    Vue.delete(cartState.items, id);
    Vue.delete(cartState.unselected, id);
  });
  persist();
}

// 商城页取到最新商品后调用：products 是当前能买的全部商品（服务端已按上架、定价过滤）。
//   - 不在 products 里的（已下架、被删）从购物车移除
//   - 库存为 0 或库存不够起订量的：移除（买不了）
//   - 数量超过库存：改成库存；低于起订量：改成起订量
// 返回 { removed, adjusted }，调用方可以提示用户。只在成功取到商品时调用（取失败时 products 为空，不能据此清空购物车）
export function reconcileCart(products) {
  const map = {};
  products.forEach((p) => {
    map[p.id] = p;
  });
  let removed = 0;
  let adjusted = 0;
  Object.keys(cartState.items).forEach((id) => {
    const p = map[id];
    if (!p || !canBuy(p)) {
      Vue.delete(cartState.items, id);
      Vue.delete(cartState.unselected, id);
      removed++;
      return;
    }
    const min = p.minOrderQty || 1;
    const qty = cartState.items[id];
    const fixed = qty > p.stock ? p.stock : qty < min ? min : qty;
    if (fixed !== qty) {
      Vue.set(cartState.items, id, fixed);
      adjusted++;
    }
  });
  if (removed || adjusted) persist();
  return { removed, adjusted };
}
