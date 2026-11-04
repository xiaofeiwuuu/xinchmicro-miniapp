// 页面跳转：短时间内连续点击只跳一次，避免页面栈里叠出两个相同页面
const GUARD_MS = 600;
let lastTime = 0;

// 解码页面参数。微信/uni-app 不会自动解码 onLoad 的 options，
// 所以带文字参数的跳转（encodeURIComponent 编码）在接收端必须解码。
// 值本来就是解码后的（含单独的 % 等）会解码失败，此时原样返回。
export function decodeParam(value) {
  if (typeof value !== 'string') return value;
  try {
    return decodeURIComponent(value);
  } catch (e) {
    return value;
  }
}

// 底部标签页（pages.json 的 tabBar）：navigateTo 跳不过去，必须用 switchTab，且路径不能带参数
const TAB_PAGES = ['/pages/home/index', '/pages/search/index', '/pages/about/index', '/pages/mine/index'];

export function isTabPage(url) {
  if (typeof url !== 'string') return false;
  const path = url.split('?')[0];
  return TAB_PAGES.includes(path.startsWith('/') ? path : '/' + path);
}

export function safeNavigate(url) {
  const now = Date.now();
  if (now - lastTime < GUARD_MS) return;
  lastTime = now;
  if (isTabPage(url)) {
    const path = url.split('?')[0];
    uni.switchTab({ url: path.startsWith('/') ? path : '/' + path });
    return;
  }
  uni.navigateTo({ url });
}
