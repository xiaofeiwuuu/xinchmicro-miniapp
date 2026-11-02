import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import { t, applyChrome, getLang } from '@/utils/i18n'
Vue.config.productionTip = false
Vue.prototype.$t = t
// 每个页面显示时同步 tabBar 与导航栏标题的语言
Vue.mixin({
  onShow() {
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