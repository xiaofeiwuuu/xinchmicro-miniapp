// 订阅消息（发货通知）。微信规定：客户在小程序里点一次「允许」，服务端才能给他发一条；而且 wx.requestSubscribeMessage
// 必须直接在「点击」的处理函数里调用——中间隔了异步请求（比如现取模板 ID）就会被微信拒绝。
// 所以模板 ID 要提前取好（prefetchSubscribeConfig，页面加载时调），点击时 askShipNotify 立刻用缓存的 ID 弹授权。
// 服务端没配置模板 ID 时（getSubscribeConfig 返回空）整个功能是关的，什么都不弹。
import { getSubscribeConfig, grantSubscribe } from '@/api/shop.js';
import { logError } from '@/utils/logger.js';

let config = null; // { ship: 模板ID 或 '' }；null = 还没取过

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
export const shipNotifyEnabled = () => !!(config && config.ship);

// 必须在点击处理函数里直接调用。返回 true 表示客户点了允许。任何失败都当没开，不影响后面的流程（比如支付）
export function askShipNotify() {
  const id = config && config.ship;
  if (!id || typeof uni.requestSubscribeMessage !== 'function') return Promise.resolve(false);
  return new Promise((resolve) => {
    uni.requestSubscribeMessage({
      tmplIds: [id],
      success: (res) => {
        const accepted = res && res[id] === 'accept';
        if (accepted) grantSubscribe('ship', true).catch((e) => logError('subscribe.grant', { error: (e && (e.errMsg || e.message)) || String(e) }));
        resolve(accepted);
      },
      fail: () => resolve(false)
    });
  });
}
