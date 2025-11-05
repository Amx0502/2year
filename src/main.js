import Vue from 'vue'
import App from './App.vue'
import router from './router'

// 全局导入樱花特效
import '@/js/sakura.js'

Vue.config.productionTip = false
Vue.config.devtools = false;

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
