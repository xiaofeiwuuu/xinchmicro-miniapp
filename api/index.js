// 微信云托管配置（换环境/服务只需改这里）
const CLOUD_ENV = 'prod-3gdwxhfn933cdfa7'; // 微信云托管的环境ID
const CLOUD_SERVICE = 'express-036x'; // 微信云托管 - 服务管理 - 服务列表 - 服务名称

// 统一的云托管请求封装
const callApi = (path, method = 'GET', data) => {
  return wx.cloud.callContainer({
    config: { env: CLOUD_ENV },
    path,
    method,
    header: { 'X-WX-SERVICE': CLOUD_SERVICE },
    ...(data ? { data } : {})
  });
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
export const getManuals = (params = {}) =>
  callApi(`/api/manuals?page=${params.page || 1}&pageSize=${params.pageSize || 10}`);

// 获取文件下载链接（有效期 1 小时），返回 download_url；拿不到链接时抛错
export const getDownloadUrl = async (fileId) => {
  const res = await callApi('/api/files/download', 'POST', {
    file_list: [{ fileid: fileId, max_age: 60 * 60 }]
  });
  const item = res && res.data && res.data.data && res.data.data.file_list && res.data.data.file_list[0];
  if (!item || !item.download_url) throw new Error('NO_DOWNLOAD_URL');
  return item.download_url;
};
