// 商城接口：全部走服务端的 /api/shop/*（客户令牌认证，见服务端 routes/shopRoutes.js）。
// 页面只依赖返回的 { data: { code, data } } 形状，和 callApi 一致。
//
// 登录：进入小程序时静默登录（utils/customer.js → shopLogin：wx.login 拿 code，服务端用 AppSecret 向微信换 openid），
// 之后每个请求（不只是商城）在 Authorization 头里带客户令牌，见 api/index.js 的 callApi。
import { callApi, rawCall } from '@/api/index.js';
import { t } from '@/utils/i18n.js';

// 商城接口和其它接口一样，认证（带令牌、401 重新登录、拉黑切页面）都在 api/index.js 的 callApi 里统一做
// 注意不能写成 const shop = callApi：api/index.js 和 utils/customer.js、本文件互相引用，模块初始化时 callApi 可能还没就绪，必须调用时才取
const shop = (...args) => callApi(...args);

// 把服务端的错误码转成当前语言的提示。没有对应提示的返回空字符串，调用方用自己的通用提示
export const errorText = (body) => {
  if (!body || body.code === 0) return '';
  switch (body.errorCode) {
    case 'STOCK': return t('err.stock', { n: body.stock });
    case 'MIN_QTY': return t('shop.minQty', { n: body.minOrderQty });
    case 'MAX_QTY': return t('err.maxQty', { n: body.maxOrderQty });
    case 'OFF_SALE': return t('err.offSale');
    case 'NO_PRICE': return t('err.noPrice');
    case 'STATE': return t('err.state');
    case 'EXPIRING': return t('err.expiring');
    case 'TOO_MANY_PENDING': return t('err.tooManyPending', { n: body.current });
    case 'RATE_LIMIT': return t('err.rateLimit');
    case 'TOO_MANY_EXPIRED': return t('err.tooManyExpired');
    case 'AFTER_SALES_ACTIVE': return t('err.asActive');
    case 'AFTER_SALES_EXPIRED': return t('err.asExpired', { n: body.max });
    case 'ALREADY_REFUNDED': return t('err.alreadyRefunded');
    case 'CANCEL_PENDING': return t('cancel.pendingErr');
    case 'INVOICE_AFTER_SALES': return t('inv.block.afterSales');
    case 'FULLY_REFUNDED': return t('inv.block.fullyRefunded');
    case 'INVOICE_PERSONAL': return t('inv.personalNoSpecial');
    case 'CONTENT_RISKY': return t('err.contentRisky');
    case 'PAY_NOT_ENABLED': return t('pay.notEnabled');
    case 'PAY_UNAVAILABLE': return t('pay.unavailable');
    default: return '';
  }
};

// ---- 登录 ----
const wxLoginCode = () =>
  new Promise((resolve, reject) => {
    uni.login({ provider: 'weixin', success: (r) => (r && r.code ? resolve(r.code) : reject(new Error('no login code'))), fail: reject });
  });

// 静默登录：返回 { data: { code, data: { token, customer } } }。
// 每次都要新的 code（code 只能用一次），所以网络失败时重新取 code 再试一次，不能原样重发
export const shopLogin = async () => {
  let last;
  for (let i = 0; i < 2; i++) {
    try {
      const code = await wxLoginCode();
      return await rawCall('/api/shop/login', 'POST', { code }, { idempotent: false });
    } catch (e) {
      last = e;
    }
  }
  throw last;
};

// ---- 商品目录 ----
// 服务端返回 { priceVisible, categories }：只含已上架、已定价的产品；价格、库存、起订量都是真实数据
export const getShopCatalog = async () => {
  const res = await shop('/api/shop/catalog');
  const body = res && res.data;
  if (body && body.code === 0) return { data: { code: 0, data: (body.data && body.data.categories) || [] } };
  return res;
};

// 单个商品的销售信息（价格、库存、起订量）。没上架、没定价返回 404，商品详情页据此决定显示不显示购买栏
export const getProductSale = (id) => shop('/api/shop/products/' + id);

// ---- 收货地址（最多 10 个，和服务端一致） ----
export const MAX_ADDRESSES = 10;
export const getAddresses = () => shop('/api/shop/addresses');
export const saveAddress = (addr) => {
  const body = { consignee: addr.consignee, phone: addr.phone, region: addr.region, detail: addr.detail, isDefault: !!addr.isDefault };
  return addr.id ? shop('/api/shop/addresses/' + addr.id, 'PUT', body, { idempotent: false }) : shop('/api/shop/addresses', 'POST', body, { idempotent: false });
};
export const deleteAddress = (id) => shop('/api/shop/addresses/' + id, 'DELETE', undefined, { idempotent: false });

// ---- 订单 ----
// lines：[{ item, qty }]，只把产品 id 和数量交给服务端——名称、价格都由服务端按数据库重新算，小程序算的合计只用于显示。
// requestId 是客户端生成的请求号，同一个请求号重复提交只会生成一个订单，所以网络失败时可以放心重试
export const createOrder = ({ lines, addressId, remark, requestId }) =>
  shop('/api/shop/orders', 'POST', { items: (lines || []).map((l) => ({ productId: l.item.id, qty: l.qty })), addressId, remark, requestId }, { idempotent: true });

// 筛选：status 单个状态；statuses 多个状态；invoice 按开票状态。一次最多取 100 单
export const getOrders = async ({ status, statuses, invoice, afterSales } = {}) => {
  const q = ['pageSize=100'];
  if (status) q.push('status=' + status);
  if (statuses && statuses.length) q.push('statuses=' + statuses.join(','));
  if (invoice) q.push('invoice=' + invoice);
  if (afterSales) q.push('afterSales=1');
  const res = await shop('/api/shop/orders?' + q.join('&'));
  const body = res && res.data;
  if (body && body.code === 0) return { data: { code: 0, data: (body.data && body.data.list) || [] } };
  return res;
};
// 「我的」页角标：服务端数好各状态的订单数
// 注销账号：先查有没有没完成的事（canDelete / blockers），再确认注销（成功后令牌立刻失效）
export const getDeleteCheck = () => shop('/api/shop/account/delete-check');
export const deleteAccount = () => shop('/api/shop/account/delete', 'POST', {}, { idempotent: false });
export const getOrderSummary = () => shop('/api/shop/orders/summary');
export const getOrderDetail = (id) => shop('/api/shop/orders/' + id);
// 客户只能取消还没付款的订单；付过款的由后台取消（自动退款）
export const cancelOrder = (id, reason) => shop(`/api/shop/orders/${id}/cancel`, 'POST', { reason }, { idempotent: false });
// 待发货（已付款、还没发货）的订单申请取消：要后台同意，同意后原路退款
export const requestCancelOrder = (id, reason) => shop(`/api/shop/orders/${id}/cancel-request`, 'POST', { reason }, { idempotent: false });
export const confirmReceipt = (id) => shop(`/api/shop/orders/${id}/receive`, 'POST', {}, { idempotent: false });

// ---- 订阅消息（发货通知）：模板 ID 由服务端配置，客户点了「允许」后告诉服务端记一次 ----
export const getSubscribeConfig = () => shop('/api/shop/subscribe');
export const grantSubscribe = (kind, accepted) => shop('/api/shop/subscribe', 'POST', { kind, accepted: !!accepted }, { idempotent: false });

// ---- 售后：申请（发货后）、撤销、填写退货快递。都返回最新的订单（带 afterSales） ----
export const applyAfterSales = (orderId, { type, reason, description }) => shop(`/api/shop/orders/${orderId}/after-sales`, 'POST', { type, reason, description }, { idempotent: false });
export const cancelAfterSales = (id) => shop(`/api/shop/after-sales/${id}/cancel`, 'POST', {}, { idempotent: false });
export const returnAfterSales = (id, { company, no }) => shop(`/api/shop/after-sales/${id}/return`, 'POST', { company, no }, { idempotent: false });

// ---- 发票抬头（最多 10 个，可设默认）和申请开票 ----
export const MAX_INVOICE_TITLES = 10;
export const getInvoiceTitles = () => shop('/api/shop/invoice-titles');
export const saveInvoiceTitle = (input) => {
  const body = {
    kind: input.kind === 'personal' ? 'personal' : 'company', title: input.title, taxId: input.taxId, address: input.address, phone: input.phone,
    bank: input.bank, account: input.account, isDefault: !!input.isDefault
  };
  return input.id ? shop('/api/shop/invoice-titles/' + input.id, 'PUT', body, { idempotent: false }) : shop('/api/shop/invoice-titles', 'POST', body, { idempotent: false });
};
export const deleteInvoiceTitle = (id) => shop('/api/shop/invoice-titles/' + id, 'DELETE', undefined, { idempotent: false });
// 专票要求抬头里有注册地址、电话、开户银行和账号（服务端也会检查）
// 个人抬头没有这些信息，只能开普票
export const titleComplete = (t) => !!(t && t.kind !== 'personal' && t.address && t.phone && t.bank && t.account);
// 申请开票：选一个抬头 + 发票类型（normal 普票 / special 专票）。发货后才能申请
export const applyInvoice = (id, { titleId, type } = {}) => shop(`/api/shop/orders/${id}/invoice`, 'POST', { titleId, type }, { idempotent: false });
// 下载发票：返回 { url, name }（1 小时有效的临时下载链接；服务端不会把云存储文件 ID 交给小程序）
// 物流状态（微信物流查询组件的运单状态；只有传过运单的订单有；查不到返回 { status: null }）
export const getLogisticsStatus = (id) => shop(`/api/shop/orders/${id}/logistics`);
export const getInvoiceFile = (id) => shop(`/api/shop/orders/${id}/invoice-file`);

// ---- 个人资料 ----
// 头像：微信给的是本机临时路径，要先向服务端要上传授权、传到云存储，再把文件 ID 交给服务端保存（服务端核对文件确实是这个客户自己传的）
const AVATAR_MAX = 1024 * 1024; // 服务端限制 1MB
const fileSize = (filePath) =>
  new Promise((resolve, reject) => {
    uni.getFileSystemManager().getFileInfo({ filePath, success: (r) => resolve(r.size), fail: reject });
  });
const compress = (src) =>
  new Promise((resolve, reject) => {
    uni.compressImage({ src, quality: 60, success: (r) => resolve(r.tempFilePath), fail: reject });
  });
const putToCos = (filePath, d) =>
  new Promise((resolve, reject) => {
    uni.uploadFile({
      url: d.url,
      filePath,
      name: 'file',
      formData: { key: d.key, Signature: d.authorization, 'x-cos-security-token': d.token, 'x-cos-meta-fileid': d.cos_file_id },
      success: (r) => (r.statusCode >= 200 && r.statusCode < 300 ? resolve() : reject(new Error('upload HTTP ' + r.statusCode))),
      fail: reject
    });
  });

// 返回云存储文件 ID；失败抛错
async function uploadAvatar(path) {
  let filePath = path;
  let size = await fileSize(filePath);
  if (size > AVATAR_MAX) {
    filePath = await compress(filePath);
    size = await fileSize(filePath);
    if (size > AVATAR_MAX) throw new Error('avatar too large');
  }
  const m = String(path).match(/\.(jpe?g|png)$/i);
  const ext = m ? m[1].toLowerCase() : 'jpg';
  const { data } = await shop('/api/shop/uploads/auth', 'POST', { purpose: 'avatar', path: 'avatar.' + ext, size }, { idempotent: false });
  if (!data || data.code !== 0) throw new Error((data && data.message) || 'upload auth failed');
  await putToCos(filePath, data.data);
  return data.data.file_id;
}

// avatarPath：这次新选的头像（本机临时路径）；没换头像就不传。手机号不在这里保存——只能用 bindPhone 授权得到
export const saveProfile = async ({ nickname, avatarPath }) => {
  const body = { nickname };
  if (avatarPath) body.avatarFileID = await uploadAvatar(avatarPath);
  return shop('/api/shop/profile', 'PUT', body, { idempotent: false });
};

// 用 getPhoneNumber 拿到的 code 换手机号并绑定。小程序只传 code，号码由服务端向微信换，不接受小程序直接提交号码。
// code 只能用一次，所以不自动重试
export const bindPhone = (code) => shop('/api/shop/phone', 'POST', { code }, { idempotent: false });

// ---- 微信支付 ----
// 服务端按订单算金额（整数分），小程序不传金额。返回 { payment, outTradeNo }，payment 原样交给 wx.requestPayment，只能用一次
// 微信支付没开通或微信暂时不可用时，服务端返回 502/503；请求层把 5xx 当成异常抛出，这里接住并转成明确的错误码，
// 不然用户只会看到笼统的「支付失败」
export const createPay = async (orderId) => {
  try {
    return await shop(`/api/shop/orders/${orderId}/pay`, 'POST', {}, { idempotent: false });
  } catch (e) {
    if (/^HTTP 50[23]$/.test((e && e.message) || '')) return { data: { code: -1, message: 'pay unavailable', errorCode: 'PAY_UNAVAILABLE' } };
    throw e;
  }
};
// 支付后向服务端确认：服务端向微信查单，返回最新订单（不依赖微信回调到达的先后）
export const confirmPay = (orderId) => shop(`/api/shop/orders/${orderId}/pay/confirm`, 'POST', {}, { idempotent: true });

// ---- 教学视频 ----
export const getVideoCourses = () => shop('/api/shop/video/courses', 'GET');
export const getVideoCourse = (id) => shop(`/api/shop/video/courses/${id}`, 'GET');
export const setVideoFavorite = (id, on) => shop(`/api/shop/video/videos/${id}/favorite`, 'PUT', { on });
export const getVideoFavorites = () => shop('/api/shop/video/favorites', 'GET');
// 购买：下单（按身份算价，不传金额）→ 取支付参数 → 拉起收银台 → 确认（服务端向微信查单）
export const createVideoOrder = (id) => shop(`/api/shop/video/videos/${id}/orders`, 'POST', {}, { idempotent: false });
export const createVideoPay = async (orderNo) => {
  try {
    return await shop(`/api/shop/video/orders/${orderNo}/pay`, 'POST', {}, { idempotent: false });
  } catch (e) {
    if (/^HTTP 50[23]$/.test((e && e.message) || '')) return { data: { code: -1, message: 'pay unavailable', errorCode: 'PAY_UNAVAILABLE' } };
    throw e;
  }
};
export const confirmVideoPay = (orderNo) => shop(`/api/shop/video/orders/${orderNo}/pay/confirm`, 'POST', {}, { idempotent: true });
export const getVideoOrders = (status) => shop('/api/shop/video/orders' + (status ? `?status=${status}` : ''), 'GET');
export const getVideoDetail = (id) => shop(`/api/shop/video/videos/${id}`, 'GET');
// 播放地址只在点播放时取（带有效期）；没绑手机号返回 PHONE_REQUIRED，没买返回 NOT_PURCHASED
export const getVideoPlay = (id) => shop(`/api/shop/video/videos/${id}/play`, 'GET');
