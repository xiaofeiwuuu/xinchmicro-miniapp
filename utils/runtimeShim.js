// 微信物流查询插件（logisticsPlugin）内部打包了老版本的 regenerator-runtime：它在严格模式下找不到全局变量 regeneratorRuntime 时，
// 会走兜底代码 Function("r", "regeneratorRuntime = r")(...)，而小程序不允许用 Function 动态执行代码，于是报
// 「TypeError: Function(...) is not a function」，「查看物流轨迹」打不开。
// 先声明一个全局的 regeneratorRuntime，插件里那句赋值就不会抛错，也就走不到兜底。必须在 main.js 的第一行引入（先于别的模块）。
// 已在真机验证有效；官方文档里没有这个说明，是按社区的已知原因做的。
// #ifdef MP-WEIXIN
try {
  const g = typeof globalThis !== 'undefined' ? globalThis : typeof global !== 'undefined' ? global : null;
  if (g && typeof g.regeneratorRuntime === 'undefined') g.regeneratorRuntime = {};
} catch (e) {
  // 设置不了就算了，不影响小程序本身
}
// #endif
export default true;
