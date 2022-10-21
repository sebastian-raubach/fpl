import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import {
  ButtonPlugin,
  ButtonGroupPlugin,
  LayoutPlugin,
  JumbotronPlugin,
  NavbarPlugin,
  CardPlugin,
  TabsPlugin,
  TablePlugin,
  FormSelectPlugin,
  FormGroupPlugin
} from 'bootstrap-vue'

Vue.config.productionTip = false

Vue.use(ButtonPlugin)
Vue.use(ButtonGroupPlugin)
Vue.use(FormGroupPlugin)
Vue.use(FormSelectPlugin)
Vue.use(CardPlugin)
Vue.use(LayoutPlugin)
Vue.use(JumbotronPlugin)
Vue.use(NavbarPlugin)
Vue.use(TabsPlugin)
Vue.use(TablePlugin)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
