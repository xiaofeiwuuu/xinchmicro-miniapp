import { logError } from '@/utils/logger.js';
import { getPlatform } from '@/utils/system.js';
import { getLang } from '@/utils/i18n.js';

// 微信云托管配置（换环境/服务只需改这里）
const CLOUD_ENV = 'prod-3gdwxhfn933cdfa7'; // 微信云托管的环境ID
const CLOUD_SERVICE = 'express-036x'; // 微信云托管 - 服务管理 - 服务列表 - 服务名称

// 本地调试：在微信开发者工具里开发时默认连本机服务端（先在服务端目录执行 npm run dev:local）。
// 同时满足下面两条才连本机，真机、发行版一律走云托管：
//   1. 运行平台是开发者工具（getPlatform() === 'devtools'；真机调试/预览是 ios/android，不会连本机）
//   2. 是开发构建（HBuilderX「运行」，process.env.NODE_ENV === 'development'），或本地存储 useLocalApi 为真
// 开发时想临时改连云托管：在开发者工具控制台执行 wx.setStorageSync('useCloudApi', true) 后重新编译（wx.removeStorageSync 取消）。
// 还需在开发者工具「详情 → 本地设置」勾选「不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书」，
// 否则 http://127.0.0.1 会被拦下。启动后第一次请求时会在控制台打印当前连的是哪里。
const LOCAL_API_BASE = 'http://127.0.0.1:80';
const useLocalApi = () => {
  try {
    if (getPlatform() !== 'devtools') return false;
    if (uni.getStorageSync('useCloudApi')) return false;
    return process.env.NODE_ENV === 'development' || !!uni.getStorageSync('useLocalApi');
  } catch (e) {
    return false;
  }
};
const LOCAL_FAIL_HINT = `请求本机服务端失败：请确认 ① 服务端已启动（npm run dev:local，端口 80）② 开发者工具「详情 → 本地设置」已勾选「不校验合法域名…」`;
let announced = false;
const announce = (local) => {
  if (announced) return;
  announced = true;
  if (getPlatform() !== 'devtools') return; // 真机不输出
  console.log(local ? `[api] 本地调试：请求发往 ${LOCAL_API_BASE}` : '[api] 请求走云托管（要连本机服务端：编译为开发构建，并确认 useCloudApi 没有设置）');
};
const callLocal = (path, method, data) =>
  new Promise((resolve, reject) => {
    wx.request({
      url: LOCAL_API_BASE + path,
      method,
      ...(data ? { data } : {}),
      success: resolve,
      fail: (e) => {
        console.error('[api] ' + LOCAL_FAIL_HINT, e && e.errMsg);
        reject(e);
      }
    });
  });

const RETRY_DELAY = 600; // 重试前等待（毫秒）
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 统一的云托管请求封装
// - 云托管实例缩容后的首个请求容易失败，幂等请求（GET，或显式声明 idempotent）失败后自动重试一次
// - HTTP 5xx 视为失败；4xx 原样返回，由调用方按 data.code 处理
// - 请求失败与业务错误（data.code 非 0）都会记入实时日志
const request = async (path, method, data, { idempotent = method === 'GET' } = {}) => {
  const attempts = idempotent ? 2 : 1;
  for (let attempt = 1; ; attempt++) {
    try {
      const local = useLocalApi();
      announce(local);
      const res = local
        ? await callLocal(path, method, data)
        : await wx.cloud.callContainer({
          config: { env: CLOUD_ENV },
          path,
          method,
          header: { 'X-WX-SERVICE': CLOUD_SERVICE },
          ...(data ? { data } : {})
        });
      if (res && res.statusCode >= 500) throw new Error('HTTP ' + res.statusCode);
      const body = res && res.data;
      if (body && typeof body === 'object' && body.code !== undefined && body.code !== 0) {
        logError('api.business', { path, method, code: body.code, message: body.message });
      }
      return res;
    } catch (e) {
      logError('api.fail', { path, method, attempt, error: (e && (e.errMsg || e.message)) || String(e) });
      if (attempt >= attempts) throw e;
      await sleep(RETRY_DELAY);
    }
  }
};

// 同一时刻对同一个 GET 地址的并发请求只发一次，调用方共用结果
// （例如启动时 App 和公司页都会请求公司信息）。请求结束后立即清除，不做缓存。
const inflight = new Map();

// GET 请求按当前语言取数据：英文带 lang=en（服务端把显示字段换成英文，缺英文的回退中文）。
// 中文不带参数：服务端不带 lang 返回原始中文数据，和旧版完全一致。
// POST（如获取下载链接）不带语言。
export const withLang = (path, lang = getLang()) =>
  lang === 'en' ? path + (path.includes('?') ? '&' : '?') + 'lang=en' : path;

const callApi = (path, method = 'GET', data, options) => {
  if (method !== 'GET') return request(path, method, data, options);
  // 合并并发请求要按带语言的完整地址区分，否则切换语言的瞬间会拿到另一种语言的结果。
  // options.lang 可以指定语言（例如检查另一种语言有没有内容），默认用当前语言
  const url = withLang(path, options && options.lang);
  if (!inflight.has(url)) {
    inflight.set(url, request(url, method, data, options).finally(() => inflight.delete(url)));
  }
  return inflight.get(url);
};

// 获取所有产品分类
export const getCategories = () => callApi('/api/categories');

// 获取产品目录
export const getCatalogs = (params = {}) =>
  callApi('/api/catalogs?categoryId=' + params.categoryId);

// 获取产品列表
export const getProducts = (params = {}) =>
  callApi(params.catalogId ? '/api/products?catalogId=' + params.catalogId : '/api/products');

// 获取单个产品详情
export const getProductDetail = (id) => callApi('/api/products/' + id);

// 获取公司信息
export const getCompanyInfo = () => callApi('/api/company');

// 获取轮播图列表（默认只获取状态为 active 的）
export const getCarousels = (params = {}) =>
  callApi(`/api/carousels?status=${params.status || 'active'}`);

// 获取产品手册列表
// params.lang 指定语言（zh/en），不传用当前语言；手册按语言是独立记录，所以可以用它查另一种语言有没有手册
export const getManuals = (params = {}) =>
  callApi(`/api/manuals?page=${params.page || 1}&pageSize=${params.pageSize || 10}`, 'GET', undefined, { lang: params.lang });

// 获取文件下载链接（有效期 1 小时），返回 download_url；拿不到链接时抛错
// 虽然是 POST，但只是生成链接、没有副作用，可以安全重试
export const getDownloadUrl = async (fileId) => {
  const res = await callApi('/api/files/download', 'POST', {
    file_list: [{ fileid: fileId, max_age: 60 * 60 }]
  }, { idempotent: true });
  const item = res && res.data && res.data.data && res.data.data.file_list && res.data.data.file_list[0];
  if (!item || !item.download_url) throw new Error('NO_DOWNLOAD_URL');
  return item.download_url;
};
