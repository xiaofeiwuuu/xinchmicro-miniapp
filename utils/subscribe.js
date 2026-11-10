// 订阅消息（发货通知 + 订单取消通知，付款时一次点击里一起问；开票结果通知，提交开票申请时问）。微信规定：客户在小程序里点一次「允许」，服务端才能给他发一条；而且 wx.requestSubscribeMessage
// 必须直接在「点击」的处理函数里调用——中间隔了异步请求（比如现取模板 ID）就会被微信拒绝。
// 所以模板 ID 要提前取好（prefetchSubscribeConfig，页面加载时调），点击时 askNotify 立刻用缓存的 ID 弹授权。
// 服务端没配置模板 ID 时（getSubscribeConfig 返回空）整个功能是关的，什么都不弹。
import { getSubscribeConfig, grantSubscribe } from '@/api/shop.js';
import { logError } from '@/utils/logger.js';

let config = null; // { ship, cancel, invoice: 模板ID 或 '' }；null = 还没取过

export async function prefetchSubscribeConfig() {
  if (config) return config;
  try {
    const { data } = await getSubscribeConfig();
    if (data && data.code === 0) config = data.data || {};
  } catch (e) {
    logError('subscribe.config', { error: (e && (e.errMsg || e.message)) || String(e) });
  }
  return config || {};
}

// 发货通知有没有开（页面据此决定显不显示「开启发货通知」）
export const shipNotifyEnabled = () => !!(config && (config.ship || config.cancel));

// 必须在点击处理函数里直接调用。kinds 不传 = 发货、取消两个模板一起问（微信一次最多 3 个），客户可以只勾其中一个；
// 提交开票申请时传 ['invoice']。返回 true 表示至少有一个点了允许。任何失败都当没开，不影响后面的流程（比如支付）
export function askNotify(want = ['ship', 'cancel']) {
  const kinds = want.filter((k) => config && config[k]);
  if (!kinds.length || typeof uni.requestSubscribeMessage !== 'function') return Promise.resolve(false);
  return new Promise((resolve) => {
    uni.requestSubscribeMessage({
      tmplIds: kinds.map((k) => config[k]),
      success: (res) => {
        let any = false;
        kinds.forEach((k) => {
          if (res && res[config[k]] === 'accept') {
            any = true;
            grantSubscribe(k, true).catch((e) => logError('subscribe.grant', { kind: k, error: (e && (e.errMsg || e.message)) || String(e) }));
          }
        });
        resolve(any);
      },
      fail: () => resolve(false)
    });
  });
}
