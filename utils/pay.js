// 微信支付流程（小程序端）。
//   1. 向服务端要支付参数（服务端按订单算金额，小程序不传金额）
//   2. wx.requestPayment 拉起微信收银台
//   3. 不相信收银台的「成功」回调——向服务端确认订单状态（服务端会向微信查单），确认已付款才算成功
// 返回：'success' 已付款 / 'cancel' 用户取消 / 'unavailable' 商户还没开通或微信支付暂时不可用 / 'fail' 失败 /
//       'pending' 付了但还没确认到（让用户稍后看订单）
import { createPay, confirmPay } from '@/api/shop.js';
import { logError } from '@/utils/logger.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const requestPayment = (p) =>
  new Promise((resolve, reject) => {
    uni.requestPayment({
      provider: 'wxpay',
      timeStamp: p.timeStamp,
      nonceStr: p.nonceStr,
      package: p.package,
      signType: p.signType,
      paySign: p.paySign,
      success: resolve,
      fail: reject
    });
  });

// 向服务端确认订单是否已付款。微信的通知可能比小程序回来得晚，所以多问几次
async function waitPaid(orderId) {
  for (let i = 0; i < 4; i++) {
    const { data } = await confirmPay(orderId);
    if (data.code === 0 && data.data.status !== 'pending_payment') return true;
    await sleep(1500);
  }
  return false;
}

export async function payWithWechat(orderId) {
  try {
    const { data } = await createPay(orderId);
    if (data.code !== 0) return data.errorCode === 'PAY_NOT_ENABLED' || data.errorCode === 'PAY_UNAVAILABLE' ? 'unavailable' : 'fail';
    try {
      await requestPayment(data.data.payment);
    } catch (e) {
      // 用户在收银台点了取消，errMsg 形如 "requestPayment:fail cancel"
      if (e && /cancel/i.test(e.errMsg || '')) return 'cancel';
      logError('pay.requestPayment', { error: (e && (e.errMsg || e.message)) || String(e) });
      return 'fail';
    }
    return (await waitPaid(orderId)) ? 'success' : 'pending';
  } catch (e) {
    logError('pay.flow', { error: (e && (e.errMsg || e.message)) || String(e) });
    return 'fail';
  }
}
