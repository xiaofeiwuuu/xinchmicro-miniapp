import { t } from '@/utils/i18n.js';

// 订单状态流转（只支持微信支付）：待付款 → 待发货（微信支付成功）→ 已发货 → 已完成；
// 待付款超时会自动取消。状态只能由服务端按固定流转改变，页面不能直接设置状态。
export const STATUS_COLOR = {
  pending_payment: '#ffb74d',
  pending_ship: '#4fc3f7',
  shipped: '#81c784',
  completed: '#81c784',
  cancelled: 'rgba(255,255,255,0.4)'
};

export const statusText = (status) => t('os.' + status);

// 已付款、可以开票的订单状态
export const PAID_STATUSES = ['pending_ship', 'shipped', 'completed'];
export const invoiceStatusOf = (o) => o.invoiceStatus || 'none';
// 发货后才能申请开票（发货后订单不能再取消，不会出现开了发票又退款）
export const INVOICEABLE_STATUSES = ['shipped', 'completed'];
export const canInvoice = (o) => INVOICEABLE_STATUSES.includes(o.status) && invoiceStatusOf(o) === 'none';
export const invoiceText = (st) => t('inv.' + st);
export const INVOICE_COLOR = { none: 'rgba(255,255,255,0.5)', requesting: '#4fc3f7', issued: '#81c784' };

// 「待付款」：只支持微信支付，付款结果由服务端向微信确认
export const UNPAID_STATUSES = ['pending_payment'];

// 客户自己只能取消还没付款的订单；付过款的订单要联系我们（后台取消会自动退款）
export const canCancel = (o) => o.status === 'pending_payment';

// 金额按「分」累加，避免小数误差
// 客户取消订单时可选的原因。key 用来取多语言文案（cancel.<key>）；zh 是真正存进订单、后台看到的中文原因（不随界面语言变）。
// 选「其他原因」要手填，存成「其他原因：xxx」
export const CANCEL_REASONS = [
  { key: 'wrong', zh: '买错了（商品或数量选错）' },
  { key: 'dontWant', zh: '不想要了' },
  { key: 'expensive', zh: '价格太贵' },
  { key: 'infoWrong', zh: '收货信息填错了' },
  { key: 'duplicate', zh: '重复下单' },
  { key: 'other', zh: '其他原因' }
];

// 秒数 → mm:ss（倒计时用）
export const formatCountdown = (sec) => {
  const s = Math.max(0, Math.floor(sec));
  const pad = (n) => (n < 10 ? '0' + n : '' + n);
  return pad(Math.floor(s / 60)) + ':' + pad(s % 60);
};

export const sumAmount = (lines) => lines.reduce((s, l) => s + Math.round(l.price * 100) * l.qty, 0) / 100;

const pad = (n) => (n < 10 ? '0' + n : '' + n);
export const formatTime = (iso) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
