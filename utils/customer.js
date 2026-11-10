// 客户登录状态（商城）。
// 进入小程序时静默登录，用户不需要点任何东西；登录失败不影响浏览产品、搜索、公司页，
// 只有需要登录的操作（加购物车、下单、我的订单）才要求登录成功，失败时让用户点一下重试。
//
// 被后台拉黑的客户：服务端登录或任何商城接口都返回 403 + errorCode DISABLED，
// 这里把状态记成 blocked，并把整个小程序切到「账号已被限制」页面（pages/blocked），其它页面进不去。
// 注意这只是界面层面的拦截：产品、公司这些现有接口本来就是公开的（不带身份），服务端没法按人拦。
import Vue from 'vue';
import { shopLogin } from '@/api/shop.js';
import { logError } from '@/utils/logger.js';

const TOKEN_KEY = 'customerToken';
const BLOCKED_PAGE = 'pages/blocked/index';

export const customerState = Vue.observable({
  token: '',
  customer: null,
  status: 'idle' // idle | loading | ok | fail | blocked
});

let inflight = null;

export const getCustomerToken = () => customerState.token;
export const isBlocked = () => customerState.status === 'blocked';

// 把小程序切到「账号已被限制」页面（已经在这个页面就不动）。reLaunch 会清掉页面栈，用户没有返回键可以绕开
export function goBlocked() {
  try {
    const pages = getCurrentPages();
    const cur = pages[pages.length - 1];
    if (cur && cur.route === BLOCKED_PAGE) return;
  } catch (e) {}
  uni.reLaunch({
    url: '/' + BLOCKED_PAGE,
    // 刚启动时第一个页面还没准备好，reLaunch 可能失败，稍后再试一次
    fail() {
      setTimeout(() => uni.reLaunch({ url: '/' + BLOCKED_PAGE }), 300);
    }
  });
}

// 注销账号成功后：把登录状态和令牌清掉（服务端令牌已经失效），下次打开会作为全新的客户登录
export function clearSession() {
  customerState.status = 'idle';
  customerState.token = '';
  customerState.customer = null;
  inflight = null;
  try {
    uni.removeStorageSync(TOKEN_KEY);
  } catch (e) {}
}

export function markBlocked() {
  customerState.status = 'blocked';
  customerState.token = '';
  customerState.customer = null;
  try {
    uni.removeStorageSync(TOKEN_KEY);
  } catch (e) {}
  goBlocked();
}

// 商城接口返回后统一检查：是「被拉黑」就切到限制页面并返回 true，调用方不要再继续处理
export function handleShopResponse(data) {
  if (data && data.errorCode === 'DISABLED') {
    markBlocked();
    return true;
  }
  return false;
}

// 保证已登录：并发调用共用一次请求；已登录直接返回 true；被拉黑后不再重试（force 才会重新检查，用于「重新检查」按钮）
export function ensureLogin(force = false) {
  if (customerState.status === 'ok' && !force) return Promise.resolve(true);
  if (customerState.status === 'blocked' && !force) return Promise.resolve(false);
  if (inflight) return inflight;
  customerState.status = 'loading';
  inflight = (async () => {
    try {
      const { data } = await shopLogin();
      if (handleShopResponse(data)) return false;
      if (data.code !== 0) throw new Error(data.message || 'login failed');
      customerState.token = data.data.token;
      customerState.customer = data.data.customer;
      customerState.status = 'ok';
      try {
        uni.setStorageSync(TOKEN_KEY, data.data.token);
      } catch (e) {}
      return true;
    } catch (e) {
      customerState.status = 'fail';
      logError('customer.login', { error: (e && (e.errMsg || e.message)) || String(e) });
      return false;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}
