// 商城接口。
// 商品目录已经走真实接口（现有的分类和产品），价格/库存/起订量是演示数据；登录还是假的。
// 页面只依赖返回的 { code, data } 形状，和 callApi 一致，换成真实商城接口时页面不用改。
import { getCategories, getProducts } from '@/api/index.js';

const MOCK = true; // 登录、地址、订单、支付都是假的（服务端的商城接口还没做）
export const IS_MOCK = MOCK;

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// ---- 商城目录：用现有的真实接口（分类、产品），价格/库存/起订量是临时的演示数据 ----
// 现有产品没有价格、库存、起订量，这三项由产品 id 算出一个固定的「伪随机」值，同一个产品每次一样。
// 接服务端的真实价格后，删掉 demoPrice 和 withDemoSale，直接用接口返回的字段。
const rand = (id, salt) => {
  const x = Math.sin(Number(id) * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const MIN_QTYS = [1, 1, 10, 50, 100];
const withDemoSale = (p) => ({
  ...p,
  desc: '',
  price: Math.round((1 + rand(p.id, 1) * 99) * 100) / 100, // 1.00 ~ 100.00
  stock: rand(p.id, 2) < 0.1 ? 0 : Math.floor(rand(p.id, 3) * 5000) + 20, // 约 10% 售罄
  minOrderQty: MIN_QTYS[Math.floor(rand(p.id, 4) * MIN_QTYS.length)],
  onSale: true
});

// 把「分类 + 产品列表」拼成 分类 → 目录 → 产品。
// 产品自带所属目录和分类，所以只会出现有产品的分类和目录（空的不显示）；
// 分类按 getCategories 的顺序，目录和产品按产品接口的顺序。
const buildTree = (categories, products) => {
  const byCat = new Map();
  products.forEach((p) => {
    const catalog = p.catalog;
    const category = catalog && catalog.category;
    if (!catalog || !category) return;
    if (!byCat.has(category.id)) byCat.set(category.id, { id: category.id, name: category.name, catalogs: new Map() });
    const cat = byCat.get(category.id);
    if (!cat.catalogs.has(catalog.id)) cat.catalogs.set(catalog.id, { id: catalog.id, name: catalog.name, products: [] });
    cat.catalogs.get(catalog.id).products.push(withDemoSale(p));
  });
  const order = categories.map((c) => c.id);
  return [...byCat.values()]
    .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
    .map((c) => ({ ...c, catalogs: [...c.catalogs.values()] }));
};

// 静默登录：返回客户令牌与客户信息。
// 真实实现：服务端从云托管请求头取 openid（需先核实该头不可伪造），没有则自动创建客户，不需要用户操作。
export const shopLogin = async () => {
  if (MOCK) {
    await delay(200);
    // 演示被拉黑：在开发者工具控制台执行 wx.setStorageSync('mock:blocked', true)，重新编译后打开会看到「账号已被限制」页面；wx.removeStorageSync('mock:blocked') 恢复
    if (uni.getStorageSync('mock:blocked')) return { data: { code: -1, message: '账号已被限制使用，请联系客服', errorCode: 'DISABLED' } };
    const profile = readObj('profile') || {};
    return { data: { code: 0, data: { token: 'mock-customer-token', customer: { id: 1, nickname: '', phone: '', avatar: '', ...profile } } } };
  }
  throw new Error('shopLogin 未接入服务端');
};

export const getShopCatalog = async () => {
  const [cats, prods] = await Promise.all([getCategories(), getProducts()]);
  if (cats.data.code !== 0 || prods.data.code !== 0) {
    return { data: { code: -1, message: 'load failed' } };
  }
  const list = Array.isArray(prods.data.data && prods.data.data.list) ? prods.data.data.list : prods.data.data || [];
  return { data: { code: 0, data: buildTree(cats.data.data || [], list) } };
};

// ---- 收货地址 / 订单：假数据，存在本机 storage（key 前缀 mock:），删除小程序就没了 ----
// 真实接口里：地址和订单在服务端，价格由服务端按产品重新查（不信任小程序传的价格），库存在事务里扣减，
// 订单状态只能按固定流转由服务端改变。这里为了能完整演示流程，状态由下面的函数直接改。
const ok = (data) => ({ data: { code: 0, data } });
const fail = (message) => ({ data: { code: -1, message } });
const LEGACY_STATUS = { pending_transfer: 'pending_payment', pending_review: 'pending_payment' }; // 之前版本的假数据里有转账流程的状态
const read = (key) => {
  try {
    const v = uni.getStorageSync('mock:' + key) || [];
    return key === 'orders' ? v.map((o) => (LEGACY_STATUS[o.status] ? { ...o, status: LEGACY_STATUS[o.status] } : o)) : v;
  } catch (e) {
    return [];
  }
};
const readObj = (key) => {
  try {
    return uni.getStorageSync('mock:' + key) || null;
  } catch (e) {
    return null;
  }
};
const write = (key, value) => {
  try {
    uni.setStorageSync('mock:' + key, value);
  } catch (e) {}
};

export const getAddresses = async () => {
  await delay(150);
  const list = read('addresses');
  return ok([...list].sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || b.id - a.id));
};

// 客户能保存多条的东西（收货地址、发票抬头）每种最多 10 条，和服务端一致
export const MAX_ADDRESSES = 10;
export const saveAddress = async (addr) => {
  await delay(150);
  let list = read('addresses');
  let saved;
  if (addr.id) {
    list = list.map((a) => (a.id === addr.id ? (saved = { ...a, ...addr }) : a));
    if (!saved) return fail('not found');
  } else {
    if (list.length >= MAX_ADDRESSES) return fail('limit');
    saved = { ...addr, id: Date.now() };
    list.push(saved);
  }
  // 第一个地址自动成为默认；设为默认时，其它的取消默认
  if (list.length === 1) saved.isDefault = true;
  if (saved.isDefault) list = list.map((a) => ({ ...a, isDefault: a.id === saved.id }));
  write('addresses', list);
  return ok(saved);
};

export const deleteAddress = async (id) => {
  await delay(150);
  let list = read('addresses').filter((a) => a.id !== id);
  if (list.length && !list.some((a) => a.isDefault)) list[0].isDefault = true;
  write('addresses', list);
  return ok(true);
};

const orderNo = () => {
  const d = new Date();
  const pad = (n) => (n < 10 ? '0' + n : '' + n);
  return `XC${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${Math.floor(1000 + Math.random() * 9000)}`;
};

// lines：[{ item, qty }]。真实接口只收 [{ id, qty }]，名称和价格由服务端查，这里为了演示才传快照。
// requestId：客户端生成的请求号，同一个请求号重复提交只会生成一个订单（防止连点、重试下出两单）。
export const createOrder = async ({ lines, addressId, remark, requestId }) => {
  await delay(400);
  const orders = read('orders');
  const dup = requestId && orders.find((o) => o.requestId === requestId);
  if (dup) return ok(dup);
  const address = read('addresses').find((a) => a.id === addressId);
  if (!address) return fail('address');
  if (!lines || !lines.length) return fail('empty');
  const items = lines.map((l) => ({
    productId: l.item.id,
    name: l.item.name,
    price: l.item.price,
    qty: l.qty,
    subtotal: Math.round(l.item.price * 100) * l.qty / 100
  }));
  const order = {
    id: Date.now(),
    requestId,
    orderNo: orderNo(),
    status: 'pending_payment',
    items,
    totalAmount: items.reduce((s, i) => s + Math.round(i.subtotal * 100), 0) / 100,
    remark: remark || '',
    address: { ...address },
    invoiceStatus: 'none', // none 未开票 / requesting 开票中 / issued 已开票
    invoice: null,
    expressCompany: '',
    expressNo: '',
    createdAt: new Date().toISOString()
  };
  orders.unshift(order);
  write('orders', orders);
  return ok(order);
};

// 筛选：status 单个状态；statuses 多个状态（「待付款」= 待转账 + 待核对）；
// invoice 按开票状态（「未开票」只算已经付款、可以开票的订单；已取消的不算）
export const getOrders = async ({ status, statuses, invoice } = {}) => {
  await delay(200);
  let list = read('orders');
  if (status) list = list.filter((o) => o.status === status);
  if (statuses) list = list.filter((o) => statuses.includes(o.status));
  if (invoice) {
    list = list.filter((o) => {
      const st = o.invoiceStatus || 'none';
      if (st !== invoice || o.status === 'cancelled') return false;
      return invoice !== 'none' || ['shipped', 'completed'].includes(o.status); // 「未开票」只算已发货、现在能申请的
    });
  }
  return ok(list);
};

export const getOrderDetail = async (id) => {
  await delay(150);
  const o = read('orders').find((x) => x.id === id);
  return o ? ok(o) : fail('not found');
};

// 修改一个订单：只允许 allow 里的状态（模拟服务端的状态流转校验）
const change = (id, allow, patch) => {
  const orders = read('orders');
  const o = orders.find((x) => x.id === id);
  if (!o) return fail('not found');
  if (!allow.includes(o.status)) return fail('status');
  Object.assign(o, typeof patch === 'function' ? patch(o) : patch);
  write('orders', orders);
  return ok(o);
};

export const cancelOrder = async (id) => {
  await delay(200);
  // 真实接口：客户只能取消还没付款的订单；付过款的由后台取消（自动退款）
  return change(id, ['pending_payment'], { status: 'cancelled' });
};
export const confirmReceipt = async (id) => {
  await delay(200);
  return change(id, ['shipped'], { status: 'completed' });
};
// 仅演示：模拟后台发货（待发货 → 已发货）
export const demoAdvance = async (id) => {
  await delay(200);
  return change(id, ['pending_ship'], { status: 'shipped', expressCompany: '顺丰速运（示例）', expressNo: 'SF0000000000' });
};

// ---- 发票抬头（最多 10 个，可设默认）和申请开票 ----
// 真实接口：GET/POST/PUT/DELETE /api/shop/invoice-titles；申请开票 POST /api/shop/orders/:id/invoice { titleId, type }；
// 下载发票 GET /api/shop/orders/:id/invoice-file（返回临时下载链接，不返回云存储文件 ID）。
export const MAX_INVOICE_TITLES = 10;
export const getInvoiceTitles = async () => {
  await delay(120);
  const list = read('invoiceTitles');
  return ok([...list].sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || b.id - a.id));
};
export const saveInvoiceTitle = async (input) => {
  await delay(150);
  let list = read('invoiceTitles');
  let saved;
  if (input.id) {
    list = list.map((t) => (t.id === input.id ? (saved = { ...t, ...input }) : t));
    if (!saved) return fail('not found');
  } else {
    if (list.length >= MAX_INVOICE_TITLES) return fail('limit');
    saved = { ...input, id: Date.now() };
    list.push(saved);
  }
  // 第一个抬头自动成为默认；设为默认时，其它的取消默认
  if (list.length === 1) saved.isDefault = true;
  if (saved.isDefault) list = list.map((t) => ({ ...t, isDefault: t.id === saved.id }));
  write('invoiceTitles', list);
  return ok(saved);
};
export const deleteInvoiceTitle = async (id) => {
  await delay(150);
  const list = read('invoiceTitles').filter((t) => t.id !== id);
  if (list.length && !list.some((t) => t.isDefault)) list[0].isDefault = true;
  write('invoiceTitles', list);
  return ok(true);
};
// 专票要求抬头里有注册地址、电话、开户银行和账号（和服务端的检查一致）
export const titleComplete = (t) => !!(t && t.address && t.phone && t.bank && t.account);
// 申请开票：选一个抬头 + 发票类型（normal 普票 / special 专票）。只有已付款（待发货/已发货/已完成）、还没申请过的订单可以；
// 申请时把抬头和类型复制进订单，之后改动或删除抬头不影响这张订单
export const applyInvoice = async (id, { titleId, type } = {}) => {
  await delay(200);
  const titles = read('invoiceTitles');
  if (!titles.length) return fail('no_invoice_info');
  const t = titleId ? titles.find((x) => x.id === titleId) : titles.find((x) => x.isDefault) || titles[0];
  if (!t) return fail('not found');
  const kind = type === 'special' ? 'special' : 'normal';
  if (kind === 'special' && !titleComplete(t)) return fail('invoice_incomplete');
  const { id: _id, isDefault: _d, ...snap } = t;
  return change(id, ['shipped', 'completed'], (o) => // 发货后才能申请开票
    (o.invoiceStatus || 'none') === 'none' ? { invoiceStatus: 'requesting', invoice: { ...snap, type: kind } } : {}
  );
};
// 下载发票：真实接口返回 { url, name }（临时下载链接，1 小时有效）。演示里没有真实文件，url 为空
export const getInvoiceFile = async (id) => {
  await delay(200);
  const o = read('orders').find((x) => x.id === id);
  if (!o || o.invoiceStatus !== 'issued' || !o.invoiceFile) return fail('not found');
  return ok({ url: '', name: o.invoiceFile.name });
};
// 仅演示：模拟财务开具发票（带发票文件）
export const demoIssueInvoice = async (id) => {
  await delay(200);
  const orders = read('orders');
  const o = orders.find((x) => x.id === id);
  if (!o || o.invoiceStatus !== 'requesting') return fail('status');
  o.invoiceStatus = 'issued';
  o.invoiceNo = '25442000000012345678';
  o.invoiceFile = { name: `电子发票-${o.orderNo}.pdf` };
  write('orders', orders);
  return ok(o);
};

// ---- 个人资料（头像、昵称、手机号） ----
// 真实接口里：头像要先上传到云存储（客户专用的上传授权，限制图片类型和大小），数据库只存文件 ID；
// 这里为了演示，直接存微信给的临时路径（过一阵会失效，只在演示时用）。
export const saveProfile = async ({ nickname, phone, avatar }) => {
  await delay(200);
  const profile = { nickname, phone, avatar };
  write('profile', profile);
  return ok(profile);
};

// 用 getPhoneNumber 拿到的 code 换手机号并绑定。
// 真实接口：小程序只传 code；服务端调微信接口（getuserphonenumber，在云托管里可能不需要 access_token，需核实）换出号码，
// 存到客户记录里。号码绝不能由小程序传给服务端（否则等于手填）。每次成功调用微信收费（约 0.03 元），服务端要限频，
// 已经绑定过且用户没点「更换」时不要重复调。
export const bindPhone = async (code) => {
  await delay(300);
  if (!code) return fail('no code');
  const phone = '138****8000（演示）'; // 假的：真实号码要服务端用 code 去微信换，小程序自己拿不到
  const profile = { ...(readObj('profile') || {}), phone };
  write('profile', profile);
  return ok({ phone });
};

// ---- 微信支付 ----
// 真实接口：
//   POST /api/shop/orders/:id/pay          服务端按订单算金额（整数分）→ payment.createPayment，返回 { payment }（小程序原样交给 wx.requestPayment）
//   POST /api/shop/orders/:id/pay/confirm  服务端 payment.confirmPayment 向微信查单，返回最新订单（不依赖微信回调到达的先后）
// 小程序不传金额。支付按钮点击后拿到的 payment 只能用一次，失败重试要重新调用 createPay。
export const createPay = async (orderId) => {
  await delay(300);
  const o = read('orders').find((x) => x.id === orderId);
  if (!o) return fail('not found');
  if (o.status !== 'pending_payment') return fail('status');
  return ok({
    payment: { timeStamp: String(Math.floor(Date.now() / 1000)), nonceStr: 'mocknonce', package: 'prepay_id=mock', signType: 'MD5', paySign: 'MOCK' }
  });
};

export const confirmPay = async (orderId) => {
  await delay(300);
  const o = read('orders').find((x) => x.id === orderId);
  return o ? ok(o) : fail('not found');
};

// 仅演示：模拟「用户在微信里付款成功」，订单直接变成已付款（待发货）
export const demoWechatPaid = async (orderId) => {
  await delay(200);
  return change(orderId, ['pending_payment'], { status: 'pending_ship', paidBy: 'wechat', paidAt: new Date().toISOString() });
};
