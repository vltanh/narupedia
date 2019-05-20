import Vue from 'vue'
import './plugins/bootstrap-vue'
import './plugins/axios'
import VueChatScroll from 'vue-chat-scroll'
import vueNiceScrollbar from 'vue-nice-scrollbar'
import App from './App.vue'

Vue.config.productionTip = false
Vue.use(VueChatScroll);
Vue.use(vueNiceScrollbar);

new Vue({
  render: h => h(App),
}).$mount('#app')