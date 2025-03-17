const { contextBridge, ipcRenderer } = require('electron')

// 安全地暴露Electron API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 文件操作
  loadFile: (fileId) => ipcRenderer.invoke('load-file', fileId),
  saveFile: (fileId, content) => ipcRenderer.invoke('save-file', fileId, content),
  
  // 配置操作
  loadConfig: () => ipcRenderer.invoke('load-config'),
  updateConfig: (files) => ipcRenderer.invoke('update-config', files)
})