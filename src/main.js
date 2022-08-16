import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import {
  LayoutPlugin,
  JumbotronPlugin,
  NavbarPlugin,
  CardPlugin,
  TabsPlugin
} from 'bootstrap-vue'

Vue.config.productionTip = false

Vue.use(CardPlugin)
Vue.use(LayoutPlugin)
Vue.use(JumbotronPlugin)
Vue.use(NavbarPlugin)
Vue.use(TabsPlugin)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
