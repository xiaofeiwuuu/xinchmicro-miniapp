import { t, getPageTitle } from '@/utils/i18n.js';
import { decodeParam } from '@/utils/nav.js';

// 当前页面的路由与查询串。options 里的值可能还是编码状态，先解码再编码，避免二次编码
function currentPage() {
  const pages = getCurrentPages();
  const current = pages[pages.length - 1];
  const options = (current && current.options) || {};
  const query = Object.keys(options)
    .map((key) => `${key}=${encodeURIComponent(decodeParam(options[key]))}`)
    .join('&');
  return { route: current ? current.route : '', query };
}

// 分享标题：产品名 > 分类名/目录名 > 页面标题 > 默认
function shareTitle(vm) {
  return (vm.product && vm.product.name) || vm.categoryName || vm.catalogName || getPageTitle() || t('share.title');
}

export default {
  onShow() {
    // 让右上角菜单同时提供"发送给朋友"和"分享到朋友圈"
    try {
      wx.showShareMenu({ menus: ['shareAppMessage', 'shareTimeline'] });
    } catch (e) {}
  },
  onShareAppMessage() {
    const { route, query } = currentPage();
    return {
      title: shareTitle(this),
      path: query ? `/${route}?${query}` : `/${route}`
    };
  },
  // 朋友圈分享：query 不带问号
  onShareTimeline() {
    return {
      title: shareTitle(this),
      query: currentPage().query
    };
  }
};
