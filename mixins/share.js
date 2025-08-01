export default {
  onShareAppMessage(res) {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const route = currentPage.route;
    const options = currentPage.options;
    
    // 将 options 转换为 query string
    const queryString = Object.keys(options)
      .map(key => `${key}=${options[key]}`)
      .join('&');
      
    // 构建完整的分享路径
    const path = queryString ? `/${route}?${queryString}` : `/${route}`;
    
    // 获取页面标题
    const title = uni.getNavigationBarTitle().title || '产品中心';
    
    return {
      title: title,
      path: path,
      success: function(res) {
        uni.showToast({
          title: '分享成功',
          icon: 'success'
        });
      },
      fail: function(res) {
        uni.showToast({
          title: '分享失败',
          icon: 'none'
        });
      }
    };
  }
} 