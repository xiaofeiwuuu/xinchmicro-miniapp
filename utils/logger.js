// 线上日志：写入微信"实时日志"，在小程序后台 → 开发管理 → 运维中心 → 实时日志 查看。
// 用于排查线上接口失败、下载失败等问题；老基础库没有该能力时静默忽略。
// 注意不要记录带签名的下载链接、用户信息等敏感内容。
let manager; // undefined = 还没取过；null = 不支持

function getManager() {
  if (manager !== undefined) return manager;
  try {
    manager = typeof wx !== 'undefined' && wx.getRealtimeLogManager ? wx.getRealtimeLogManager() : null;
  } catch (e) {
    manager = null;
  }
  return manager;
}

export function logError(tag, info) {
  const m = getManager();
  if (!m) return;
  try {
    m.error(tag, info);
  } catch (e) {}
}
