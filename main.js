import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import { t, applyChrome } from '@/utils/i18n'
Vue.config.productionTip = false
Vue.prototype.$t = t
// 每个页面显示时同步 tabBar 与导航栏标题的语言
Vue.mixin({
  onShow() {
    applyChrome()
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