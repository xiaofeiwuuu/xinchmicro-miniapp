// 多语言：zh / en
// 模板中用 {{ $t('key') }}，脚本中用 this.$t('key', { n: 1 }) 或直接 import { t }
import Vue from 'vue';

const STORAGE_KEY = 'lang';
export const SUPPORTED = ['zh', 'en'];

const messages = {
  zh: {
    'tab.home': '首页',
    'tab.search': '搜索',
    'tab.about': '公司',

    'nav.home': '芯辰微电子',
    'nav.search': '搜索',
    'nav.about': '关于我们',
    'nav.catalog': '产品目录',
    'nav.list': '产品列表',
    'nav.detail': '产品详情',

    'share.title': '产品中心',
    'share.ok': '分享成功',
    'share.fail': '分享失败',

    'common.noData': '暂无数据',
    'common.noProduct': '暂无产品',
    'common.loadFail': '加载失败',
    'common.retry': '点击重试',
    'common.confirm': '确定',
    'common.cancel': '取消',

    'home.categoryFail': '获取分类失败',
    'home.linkCopied': '链接已复制，请在浏览器中打开',

    'catalog.loading': '请求数据中...',
    'catalog.empty': '暂无产品目录',
    'catalog.loadFail': '获取目录失败',

    'about.defaultName': '芯辰微',
    'about.defaultDesc': '厦门芯辰微电子有限公司成立于2020年，总公司位于厦门，在石家庄、成都设有分公司',
    'about.defaultAddress': '中国（福建）自由贸易试验区厦门片区港中路1694号',
    'about.phone': '联系电话',
    'about.email': '电子邮箱',
    'about.website': '官方网站',
    'about.address': '公司地址',
    'about.noPhone': '暂无联系方式',
    'about.noEmail': '暂无邮箱',
    'about.noWebsite': '暂无网站',
    'about.noAddress': '暂无地址',
    'about.emailCopied': '邮箱已复制',
    'about.websiteCopied': '网址复制成功',
    'about.addressCopied': '地址已复制',
    'about.language': '语言 / Language',
    'about.clearCache': '清除缓存',
    'about.clearConfirm': '将删除已下载的文档和本地缓存数据，确定吗？',
    'about.cleared': '缓存已清除',

    'doc.preparing': '准备文档...',
    'doc.linkFail': '获取文档链接失败',
    'doc.waitPreparing': '正在准备文档，请稍后再试',
    'doc.notExist': '文档不存在',
    'doc.opening': '正在打开...',
    'doc.waitDownloading': '文档正在下载中，请稍候',
    'doc.downloading': '正在下载文档...',
    'doc.downloadFail': '下载文件失败',
    'doc.openFail': '打开文档失败',
    'doc.linkCopied': '链接复制成功',

    'detail.params': '产品参数',
    'detail.techDocs': '技术文档',
    'detail.preparing': '正在准备文档...',
    'detail.datasheet': '产品数据手册',
    'detail.viewDoc': '查看文档',
    'detail.copyLink': '复制链接',
    'detail.tip': '点击复制按钮可分享好友或在浏览器粘贴链接进行下载,点击查看按钮可查看PDF,右上角保存或转发文件',
    'detail.loadFail': '获取产品详情失败',

    'search.tabModel': '型号搜索',
    'search.tabParam': '参数搜索',
    'search.tabDocs': '资料下载',
    'search.modelPlaceholder': '请输入产品型号搜索',
    'search.notFound': '未找到相关产品',
    'search.min': '最小值',
    'search.max': '最大值',
    'search.inputParam': '请输入{title}',
    'search.docs': '产品资料',
    'search.docsTip': '点击下载按钮可分享好友或在浏览器粘贴链接进行下载,点击查看按钮可查看PDF,右上角保存或转发文件,文件较大，请在wifi环境下载查看',
    'search.view': '查看',
    'search.download': '下载',
    'search.total': '共 {n} 条',
    'search.noManuals': '暂无产品手册',
    'search.releaseCancel': '松手取消',
    'search.holdCancel': '长按3秒取消',
    'search.unknownCatalog': '未知目录',
    'search.selectCategory': '选择产品分类',
    'search.selectCatalog': '选择产品目录',
    'search.selectPlaceholder': '选择分类/目录',
    'search.shareTitle': '产品搜索',
    'search.shareKeyword': '搜索：{keyword}',
    'search.cancelled': '已取消下载',
    'search.manualMissing': '手册文件不存在',
    'search.gettingLink': '正在获取链接...',
    'search.linkFail': '获取下载链接失败',
    'search.downloading': '正在下载...',
    'search.copyOk': '复制成功'
  },

  en: {
    'tab.home': 'Home',
    'tab.search': 'Search',
    'tab.about': 'Company',

    'nav.home': 'Xinchenwei Electronics',
    'nav.search': 'Search',
    'nav.about': 'About Us',
    'nav.catalog': 'Catalog',
    'nav.list': 'Products',
    'nav.detail': 'Product Details',

    'share.title': 'Product Center',
    'share.ok': 'Shared',
    'share.fail': 'Share failed',

    'common.noData': 'No data',
    'common.noProduct': 'No products',
    'common.loadFail': 'Failed to load',
    'common.retry': 'Tap to retry',
    'common.confirm': 'OK',
    'common.cancel': 'Cancel',

    'home.categoryFail': 'Failed to load categories',
    'home.linkCopied': 'Link copied. Please open it in a browser',

    'catalog.loading': 'Loading...',
    'catalog.empty': 'No catalogs',
    'catalog.loadFail': 'Failed to load catalogs',

    'about.defaultName': 'Xinchenwei',
    'about.defaultDesc': 'Xiamen Xinchenwei Electronics Co., Ltd. was founded in 2020. Headquartered in Xiamen, with branch offices in Shijiazhuang and Chengdu.',
    'about.defaultAddress': 'No. 1694 Gangzhong Road, Xiamen Area, China (Fujian) Pilot Free Trade Zone',
    'about.phone': 'Phone',
    'about.email': 'Email',
    'about.website': 'Website',
    'about.address': 'Address',
    'about.noPhone': 'Not available',
    'about.noEmail': 'Not available',
    'about.noWebsite': 'Not available',
    'about.noAddress': 'Not available',
    'about.emailCopied': 'Email copied',
    'about.websiteCopied': 'Website copied',
    'about.addressCopied': 'Address copied',
    'about.language': '语言 / Language',
    'about.clearCache': 'Clear cache',
    'about.clearConfirm': 'This will delete downloaded documents and locally cached data. Continue?',
    'about.cleared': 'Cache cleared',

    'doc.preparing': 'Preparing...',
    'doc.linkFail': 'Failed to get document link',
    'doc.waitPreparing': 'Preparing document, please try again later',
    'doc.notExist': 'Document not found',
    'doc.opening': 'Opening...',
    'doc.waitDownloading': 'Downloading, please wait',
    'doc.downloading': 'Downloading...',
    'doc.downloadFail': 'Download failed',
    'doc.openFail': 'Failed to open document',
    'doc.linkCopied': 'Link copied',

    'detail.params': 'Parameters',
    'detail.techDocs': 'Documents',
    'detail.preparing': 'Preparing document...',
    'detail.datasheet': 'Datasheet',
    'detail.viewDoc': 'View',
    'detail.copyLink': 'Copy link',
    'detail.tip': 'Tap "Copy link" to share with friends or paste it into a browser to download. Tap "View" to open the PDF, then save or forward it from the top-right menu.',
    'detail.loadFail': 'Failed to load product details',

    'search.tabModel': 'By Model',
    'search.tabParam': 'By Parameter',
    'search.tabDocs': 'Downloads',
    'search.modelPlaceholder': 'Enter a product model',
    'search.notFound': 'No matching products',
    'search.min': 'Min',
    'search.max': 'Max',
    'search.inputParam': 'Enter {title}',
    'search.docs': 'Documents',
    'search.docsTip': 'Tap "Download" to share with friends or paste the link into a browser. Tap "View" to open the PDF, then save or forward it from the top-right menu. Files may be large; Wi-Fi is recommended.',
    'search.view': 'View',
    'search.download': 'Download',
    'search.total': '{n} items',
    'search.noManuals': 'No documents',
    'search.releaseCancel': 'Release to cancel',
    'search.holdCancel': 'Hold 3s to cancel',
    'search.unknownCatalog': 'Unknown catalog',
    'search.selectCategory': 'Select category',
    'search.selectCatalog': 'Select catalog',
    'search.selectPlaceholder': 'Select category / catalog',
    'search.shareTitle': 'Product Search',
    'search.shareKeyword': 'Search: {keyword}',
    'search.cancelled': 'Download cancelled',
    'search.manualMissing': 'Document file not found',
    'search.gettingLink': 'Getting link...',
    'search.linkFail': 'Failed to get download link',
    'search.downloading': 'Downloading...',
    'search.copyOk': 'Copied'
  }
};

// 页面路由 -> 导航栏标题 key（catalog/detail 的标题来自数据，不在此列）
const NAV_TITLE = {
  'pages/home/index': 'nav.home',
  'pages/search/index': 'nav.search',
  'pages/about/index': 'nav.about',
  'pages/product/list': 'nav.list'
};

const TAB_KEYS = ['tab.home', 'tab.search', 'tab.about'];

function detectLang() {
  try {
    const saved = uni.getStorageSync(STORAGE_KEY);
    if (SUPPORTED.includes(saved)) return saved;
  } catch (e) {}
  try {
    const sys = (uni.getSystemInfoSync().language || '').toLowerCase();
    return sys.startsWith('zh') ? 'zh' : 'en';
  } catch (e) {}
  return 'zh';
}

// 响应式状态：模板里调用 $t 会依赖 state.lang，切换后自动刷新
const state = Vue.observable({ lang: detectLang() });

export const getLang = () => state.lang;

export function t(key, params) {
  const dict = messages[state.lang] || messages.zh;
  let text = dict[key] !== undefined ? dict[key] : (messages.zh[key] !== undefined ? messages.zh[key] : key);
  if (params) {
    Object.keys(params).forEach((k) => {
      text = text.split('{' + k + '}').join(params[k]);
    });
  }
  return text;
}

// 当前页面的本地化标题（没有登记的页面返回空串）
export function getPageTitle() {
  try {
    const pages = getCurrentPages();
    const current = pages[pages.length - 1];
    const key = current && NAV_TITLE[current.route];
    return key ? t(key) : '';
  } catch (e) {
    return '';
  }
}

// 同步原生部分：tabBar 文字、当前页导航栏标题（这两处不是 Vue 模板，不会自动刷新）
export function applyChrome() {
  TAB_KEYS.forEach((key, index) => {
    uni.setTabBarItem({ index, text: t(key), fail() {} });
  });
  try {
    const pages = getCurrentPages();
    const current = pages[pages.length - 1];
    const titleKey = current && NAV_TITLE[current.route];
    if (titleKey) uni.setNavigationBarTitle({ title: t(titleKey) });
  } catch (e) {}
}

export function setLang(lang) {
  if (!SUPPORTED.includes(lang) || lang === state.lang) return;
  state.lang = lang;
  try {
    uni.setStorageSync(STORAGE_KEY, lang);
  } catch (e) {}
  applyChrome();
}

export default { t, getLang, setLang, applyChrome, getPageTitle };
