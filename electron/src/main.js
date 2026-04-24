const { app, BrowserWindow, Menu, shell } = require('electron')
const path = require('path')
let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440, height: 900, minWidth: 1024, minHeight: 700,
    backgroundColor: '#0f1729',
    titleBarStyle: 'default',
    title: 'The Condition of Man',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    show: false,
  })

  mainWindow.loadURL('https://syllabus-script-space.vercel.app')

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDesc, url) => {
    console.error('Failed to load:', url, errorCode, errorDesc)
    mainWindow.webContents.openDevTools()
  })

mainWindow.once('ready-to-show', () => mainWindow.show())

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.includes('theconditionofman.com') && !url.includes('vercel.app')) {
      shell.openExternal(url)
      return { action: 'deny' }
    }
    return { action: 'allow' }
  })

  mainWindow.on('closed', () => { mainWindow = null })
}
app.whenReady().then(() => {
  Menu.setApplicationMenu(null)
  createWindow()
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
})
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
