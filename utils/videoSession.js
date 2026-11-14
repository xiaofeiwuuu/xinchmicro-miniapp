// 竖屏播放页 → 横屏全屏页的交接：把已经取到的播放数据（水印、各档地址）和当前进度、清晰度直接交给全屏页，
// 不用再向服务端要一次（再要一次会多算一次播放量）。只用一次：全屏页取走就清掉。
let session = null;
export const setVideoSession = (s) => { session = s; };
export const takeVideoSession = (id) => {
  const s = session && session.id === id ? session : null;
  session = null;
  return s;
};
