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

// 自定义导航栏的尺寸（单位 px）。
// 原生导航栏的内容区高度 = 胶囊按钮高度 + 上下各一份"胶囊到状态栏的间距"，这里按同样的算法，才能和其它页面的原生导航栏等高、
// 标题与右上角的微信胶囊按钮垂直对齐。胶囊按钮取不到（老基础库、个别环境返回 0）时用常见的默认值。
// win: { windowWidth, statusBarHeight }；cap: wx.getMenuButtonBoundingClientRect() 的结果
export function computeNavMetrics(win, cap) {
  const windowWidth = (win && win.windowWidth) || 375;
  const statusBar = (win && win.statusBarHeight) || 20;
  const valid = cap && cap.height > 0 && cap.width > 0 && cap.top >= statusBar;
  const c = valid ? cap : { top: statusBar + 4, height: 32, width: 87, left: windowWidth - 87 - 10 };
  const navHeight = Math.max(44, (c.top - statusBar) * 2 + c.height);
  return {
    statusBar,
    windowWidth,
    capTop: c.top, // 胶囊按钮顶部到屏幕顶部的距离：自定义栏里的内容行与它对齐
    capHeight: c.height,
    navHeight, // 导航栏内容区高度（不含状态栏）
    totalHeight: statusBar + navHeight,
    // 左右两侧各留出同样宽的安全区（右侧是胶囊按钮），标题在安全区之间居中，不会被胶囊压住
    safeSide: Math.max(0, windowWidth - c.left + 8)
  };
}

export function getNavBarMetrics() {
  let win = {};
  try {
    if (typeof wx !== 'undefined' && wx.getWindowInfo) win = wx.getWindowInfo();
  } catch (e) {}
  if (!win.windowWidth) {
    try {
      win = uni.getSystemInfoSync();
    } catch (e) {}
  }
  let cap = null;
  try {
    if (typeof wx !== 'undefined' && wx.getMenuButtonBoundingClientRect) cap = wx.getMenuButtonBoundingClientRect();
  } catch (e) {}
  return computeNavMetrics(win, cap);
}
