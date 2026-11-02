// 页面跳转：短时间内连续点击只跳一次，避免页面栈里叠出两个相同页面
const GUARD_MS = 600;
let lastTime = 0;

export function safeNavigate(url) {
  const now = Date.now();
  if (now - lastTime < GUARD_MS) return;
  lastTime = now;
  uni.navigateTo({ url });
}
