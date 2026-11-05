// 公告弹窗的「看过没有」记录（纯逻辑，方便单独测试）。
// 本地存一张表 { 公告id: 看过的版本 }，版本是服务端给的 version（公告内容一改就变）：
// 没看过，或看过的是旧版本，就要弹；看过当前版本就不弹。
// 存储键不带 dc: 前缀，「清除缓存」不会清掉它，否则清一次缓存所有公告又弹一遍。
const SEEN_KEY = 'annSeen';
const MAX_SEEN = 100; // 记录最多留 100 条，老公告早就删了，没必要永远留着

export function readSeen() {
  try {
    const v = uni.getStorageSync(SEEN_KEY);
    return v && typeof v === 'object' ? v : {};
  } catch (e) {
    return {};
  }
}

export function writeSeen(map) {
  try {
    const keys = Object.keys(map);
    // 超过上限时丢掉 id 最小（最老）的
    if (keys.length > MAX_SEEN) keys.sort((a, b) => Number(a) - Number(b)).slice(0, keys.length - MAX_SEEN).forEach((k) => delete map[k]);
    uni.setStorageSync(SEEN_KEY, map);
  } catch (e) {}
}

// 需要弹的公告：服务端返回的顺序（新的在前）里，没看过当前版本的
export function pickUnseen(list, seen) {
  return (Array.isArray(list) ? list : []).filter((a) => a && a.id != null && seen[a.id] !== a.version);
}
