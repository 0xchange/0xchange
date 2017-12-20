// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

import Vue from 'vue'

import Vuetify from 'vuetify'

import App from './App'
import router from './router'
router.afterEach((to, from, next) => {
  if (typeof window.ga !== 'undefined') ga('send', 'pageview')
})
import { sync } from 'vuex-router-sync'

import store from './store'
sync(store, router)

Vue.use(Vuetify)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
