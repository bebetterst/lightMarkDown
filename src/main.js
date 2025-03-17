import { createApp } from 'vue'
import App from './App.vue'

import clickOutside from './directives/clickOutside.js'

// 创建一个模拟的electronAPI，用于在非Electron环境中使用
if (typeof window.electronAPI === 'undefined') {
  console.log('Running in browser mode, using mock electronAPI')
  window.electronAPI = {
    loadFile: (fileId) => Promise.resolve(''),
    saveFile: (fileId, content) => Promise.resolve(true),
    loadConfig: () => Promise.resolve({ path: '', files: [] }),
    updateConfig: (files) => Promise.resolve(true)
  }
}

const app = createApp(App)

// 同步注册指令
app.directive('click-outside', clickOutside)

app.mount('#app')