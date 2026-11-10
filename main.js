import '@/utils/runtimeShim' // 必须第一行：先声明全局 regeneratorRuntime，微信物流插件才不会报 Function(...) is not a function
import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import { t, applyChrome, applyTitleOnLoad, getLang } from '@/utils/i18n'
import { isBlocked, goBlocked } from '@/utils/customer'
Vue.config.productionTip = false
Vue.prototype.$t = t
// 每个页面显示时同步 tabBar 与导航栏标题的语言
Vue.mixin({
  // 比 onShow 更早：页面显示之前就把导航栏标题和标签栏文字设成当前语言（先于页面自己的 onLoad，页面设置的标题会覆盖它）
  onLoad() {
    applyTitleOnLoad()
    applyChrome()
  },
  onShow() {
    // 被后台拉黑的客户：任何页面显示时都切到「账号已被限制」页面（登录结果回来得比页面显示晚，所以这里和登录处两处都要检查）
    if (isBlocked()) goBlocked()
    applyChrome()
  },
  created() {
    // 页面/组件里定义了 reloadForLang 方法，切换语言时就会被调用，用来按新语言重新取数。
    // 底部标签页的页面切换后仍然存活（不会重新 onLoad），所以必须主动通知
    if (typeof this.reloadForLang === 'function') {
      this.$watch(() => getLang(), () => this.reloadForLang())
    }
  }
})
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif