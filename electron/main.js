const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

// 获取应用程序的根目录
const APP_ROOT = path.join(__dirname, '..')
const MD_FILES_DIR = path.join(APP_ROOT, 'mdfiles')

// 确保mdfiles目录存在
if (!fs.existsSync(MD_FILES_DIR)) {
  fs.mkdirSync(MD_FILES_DIR, { recursive: true })
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // 在开发环境中加载Vite开发服务器
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:3000')
    // 打开开发者工具
    win.webContents.openDevTools()
  } else {
    win.loadFile('dist/index.html')
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 处理文件加载请求
ipcMain.handle('load-file', async (event, fileId) => {
  try {
    const filePath = path.join(MD_FILES_DIR, fileId + '.md')
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8')
    }
    return ''
  } catch (error) {
    console.error('Error loading file:', error)
    return ''
  }
})

// 处理文件保存请求
ipcMain.handle('save-file', async (event, fileId, content) => {
  try {
    if (!fileId) {
      console.error('Error saving file: Invalid fileId')
      return false
    }
    
    // 添加路径合法性校验
    if (!/^[\w\-]+$/.test(fileId)) {
      throw new Error('文件名包含非法字符')
    }
    
    // 创建完整保存路径
    const savePath = path.join(MD_FILES_DIR, fileId + '.md')
    
    // 确保目录存在
    fs.mkdirSync(path.dirname(savePath), { recursive: true })
    
    // 添加文件写入权限检查
    try {
      fs.accessSync(path.dirname(savePath), fs.constants.W_OK)
    } catch (err) {
      throw new Error('无文件写入权限')
    }
    
    // 使用异步写入并添加重试机制
    let retries = 3
    while (retries-- > 0) {
      try {
        await fs.promises.writeFile(savePath, content, 'utf8')
        console.log(`文件保存成功: ${savePath}`)
        return true
      } catch (error) {
        if (retries === 0) {
          throw error
        }
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
  } catch (error) {
    console.error('Error saving file:', error)
    return false
  }
})

// 加载配置文件
ipcMain.handle('load-config', async () => {
  try {
    const configPath = path.join(MD_FILES_DIR, 'config.json')
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
      return { path: MD_FILES_DIR, files: config.files || [] }
    }
    return { path: MD_FILES_DIR, files: [] }
  } catch (error) {
    console.error('Error loading config:', error)
    return { path: MD_FILES_DIR, files: [] }
  }
})

// 更新配置文件
ipcMain.handle('update-config', async (event, files) => {
  try {
    const configPath = path.join(MD_FILES_DIR, 'config.json')
    fs.writeFileSync(configPath, JSON.stringify({ files }, null, 2), 'utf8')
    return true
  } catch (error) {
    console.error('Error updating config:', error)
    return false
  }
})