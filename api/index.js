// 获取所有产品分类
export const getCategories = (params = {}) => {
  return wx.cloud.callContainer({
    config: {
      env: 'prod-3gdwxhfn933cdfa7', // 微信云托管的环境ID
    },
    path: '/api/categories', // 填入业务自定义路径和参数，根目录，就是 / 
    method: 'GET', // 按照自己的业务开发，选择对应的方法
    header: {
      'X-WX-SERVICE': 'express-036x', // xxx中填入服务名称（微信云托管 - 服务管理 - 服务列表 - 服务名称）
    }
  })
};

// 获取产品目录
export const getCatalogs = (params = {}) => {
  return wx.cloud.callContainer({
    config: {
      env: 'prod-3gdwxhfn933cdfa7', // 微信云托管的环境ID
    },
    path: '/api/catalogs?categoryId=' + params.categoryId, // 填入业务自定义路径和参数，根目录，就是 / 
    method: 'GET', // 按照自己的业务开发，选择对应的方法
    header: {
      'X-WX-SERVICE': 'express-036x', // xxx中填入服务名称（微信云托管 - 服务管理 - 服务列表 - 服务名称）
    }
  })
};

// 获取产品列表
export const getProducts = (params = {}) => {
	const url = params.catalogId ? '/api/products?catalogId=' +params.catalogId : '/api/products'
  return wx.cloud.callContainer({
    config: {
      env: 'prod-3gdwxhfn933cdfa7', // 微信云托管的环境ID
    },
    path: url, // 填入业务自定义路径和参数，根目录，就是 / 
    method: 'GET', // 按照自己的业务开发，选择对应的方法
    params: params,
    header: {
      'X-WX-SERVICE': 'express-036x', // xxx中填入服务名称（微信云托管 - 服务管理 - 服务列表 - 服务名称）
    }
  })
};

// 获取单个产品详情
export const getProductDetail = (id) => {
  return wx.cloud.callContainer({
    config: {
      env: 'prod-3gdwxhfn933cdfa7', // 微信云托管的环境ID
    },
    path: '/api/products/' + id, // 填入业务自定义路径和参数，根目录，就是 / 
    method: 'GET', // 按照自己的业务开发，选择对应的方法
    header: {
      'X-WX-SERVICE': 'express-036x', // xxx中填入服务名称（微信云托管 - 服务管理 - 服务列表 - 服务名称）
    }
  })
};

// 获取公司信息
export const getCompanyInfo = () => {
  return wx.cloud.callContainer({
    config: {
      env: 'prod-3gdwxhfn933cdfa7', // 微信云托管的环境ID
    },
    path: '/api/company', // 公司信息接口
    method: 'GET',
    header: {
      'X-WX-SERVICE': 'express-036x', // 服务名称
    }
  })
};

// 获取轮播图列表
export const getCarousels = (params = {}) => {
  // 默认只获取状态为active的轮播图
  const status = params.status || 'active';
  return wx.cloud.callContainer({
    config: {
      env: 'prod-3gdwxhfn933cdfa7', // 微信云托管的环境ID
    },
    path: `/api/carousels?status=${status}`, // 轮播图接口
    method: 'GET',
    header: {
      'X-WX-SERVICE': 'express-036x', // 服务名称
    }
  })
};

// 获取产品手册列表
export const getManuals = (params = {}) => {
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  return wx.cloud.callContainer({
    config: {
      env: 'prod-3gdwxhfn933cdfa7', // 微信云托管的环境ID
    },
    path: `/api/manuals?page=${page}&pageSize=${pageSize}`, // 产品手册接口
    method: 'GET',
    header: {
      'X-WX-SERVICE': 'express-036x', // 服务名称
    }
  })
};