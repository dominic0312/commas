import Vue from 'vue'
import {remote} from 'electron'
import App from './components/app'
import store from './store'
import {loadTranslation, translateElement} from '../common/i18n'

loadTranslation(remote.app.getLocale())
Vue.directive('i18n', translateElement)

new Vue({
  store,
  el: '#app',
  functional: true,
  render: h => h(App),
})