// 「去结算」到「确认订单页」之间交接数据：要买的商品行，以及从地址列表里选中的地址。
// 不放进页面 URL：商品行里有名称、价格快照，URL 有长度限制，也不该把价格放进地址栏参数。
let lines = []; // [{ item, qty }]
let picked = null; // 在地址列表里选中的地址

export const setCheckout = (list) => {
  lines = list || [];
};
export const getCheckout = () => lines;
export const clearCheckout = () => {
  lines = [];
  picked = null;
};
export const setPickedAddress = (addr) => {
  picked = addr;
};
// 取走选中的地址（只取一次）
export const takePickedAddress = () => {
  const a = picked;
  picked = null;
  return a;
};
