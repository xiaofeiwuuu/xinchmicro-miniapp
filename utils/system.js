// 读取系统信息。wx.getSystemInfoSync 已废弃，优先用新接口，老基础库再回退。

// 系统语言，如 "zh_CN"、"en"；取不到返回空串
export function getSystemLanguage() {
  try {
    if (typeof wx !== 'undefined' && wx.getAppBaseInfo) return wx.getAppBaseInfo().language || '';
  } catch (e) {}
  try {
    return uni.getSystemInfoSync().language || '';
  } catch (e) {}
  return '';
}

// 设备像素比，取不到按 2 处理
export function getPixelRatio() {
  try {
    if (typeof wx !== 'undefined' && wx.getWindowInfo) return wx.getWindowInfo().pixelRatio || 2;
  } catch (e) {}
  try {
    return uni.getSystemInfoSync().pixelRatio || 2;
  } catch (e) {}
  return 2;
}

// 运行平台：微信开发者工具里是 "devtools"，真机是 "ios" / "android"；取不到返回空串
export function getPlatform() {
  try {
    if (typeof wx !== 'undefined' && wx.getDeviceInfo) return wx.getDeviceInfo().platform || '';
  } catch (e) {}
  try {
    return uni.getSystemInfoSync().platform || '';
  } catch (e) {}
  return '';
}

// 当前窗口宽度（px）。横屏页转屏后宽度会变，要在转屏之后再取。取不到返回 0
export function getWindowWidth() {
  try {
    if (typeof wx !== 'undefined' && wx.getWindowInfo) return wx.getWindowInfo().windowWidth || 0;
  } catch (e) {}
  try {
    return uni.getSystemInfoSync().windowWidth || 0;
  } catch (e) {}
  return 0;
}

// 微信右上角的胶囊按钮（「···｜◎」，◎ 是关闭小程序）的位置。用了自定义导航栏的页面，这个胶囊还在，是系统的、去不掉、不能挪，自己的按钮要躲开它。
// 返回 { right, top, height }：right 是「从窗口右边算起，要留多宽才不压到胶囊」（px，含 8px 间隙），top/height 是胶囊的上边和高度；取不到按常见尺寸估一个
export function getCapsuleSpace() {
  const fallback = { right: 104, top: 12, height: 32 };
  try {
    const m = uni.getMenuButtonBoundingClientRect();
    const w = getWindowWidth();
    if (m && m.width && m.height && w && m.left > 0) return { right: Math.max(12, Math.round(w - m.left + 8)), top: Math.round(m.top), height: Math.round(m.height) };
  } catch (e) {}
  return fallback;
}
