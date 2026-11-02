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
