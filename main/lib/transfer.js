const {app, ipcMain, BrowserWindow} = require('electron')
const {forEachWindow} = require('./frame')
const {createWindow} = require('./window')
const {createMenu} = require('./menu')
const {toggleAutoUpdater} = require('./updater')

function transferEvents(frame) {
  frame.on('maximize', () => {
    frame.webContents.send('maximize')
  })
  frame.on('unmaximize', () => {
    frame.webContents.send('unmaximize')
  })
  frame.on('enter-full-screen', () => {
    frame.webContents.send('enter-full-screen')
  })
  frame.on('leave-full-screen', () => {
    frame.webContents.send('leave-full-screen')
  })
}

function transferInvoking() {
  process.on('uncaughtException', error => {
    forEachWindow(frame => frame.webContents.send('uncaught-error', String(error)))
  })
  app.on('before-quit', () => {
    forEachWindow(frame => frame.webContents.send('before-quit'))
  })
  ipcMain.on('open-window', () => {
    createWindow()
  })
  ipcMain.on('contextmenu', (event, data) => {
    const menu = createMenu(data.template)
    menu.popup({
      window: BrowserWindow.fromWebContents(event.sender),
      x: data.position.x,
      y: data.position.y,
    })
  })
  ipcMain.on('toggle-auto-updater', (event, data) => {
    toggleAutoUpdater(data)
  })
}

module.exports = {
  transferEvents,
  transferInvoking,
}