import { effect } from '@vue/reactivity'
import { app } from 'electron'
import * as commas from '../../api/core-main'
import { handleAddonMessages, loadAddons, loadCustomJS } from './lib/addon'
import { hasWindow, getLastWindow } from './lib/frame'
import { loadTranslations, handleI18NMessages } from './lib/i18n'
import { handleKeyBindingMessages } from './lib/keybinding'
import { createApplicationMenu, createDockMenu, handleMenuMessages } from './lib/menu'
import { handleMessages } from './lib/message'
import { handleSettingsMessages, useSettings, whenSettingsReady } from './lib/settings'
import { handleTerminalMessages } from './lib/terminal'
import { handleThemeMessages } from './lib/theme'
import { createWindow, handleWindowMessages } from './lib/window'

handleMessages()
handleI18NMessages()
handleMenuMessages()
handleWindowMessages()
handleAddonMessages()
handleSettingsMessages()
handleThemeMessages()
handleTerminalMessages()
handleKeyBindingMessages()

let cwd
async function initialize() {
  loadAddons()
  loadCustomJS()
  await loadTranslations()
  await app.whenReady()
  commas.proxy.app.events.emit('ready')
  app.setAsDefaultProtocolClient('commas')
  if (process.platform === 'darwin') {
    effect(() => {
      createApplicationMenu()
      createDockMenu()
    })
  }
  createWindow(cwd)
}

initialize()

app.on('activate', (event, hasVisibleWindows) => {
  if (!hasVisibleWindows && app.isReady()) {
    createWindow()
  }
})

app.on('will-finish-launching', () => {
  // handle opening outside
  app.on('open-file', async (event, file) => {
    event.preventDefault()
    await whenSettingsReady()
    const settings = useSettings()
    // for Windows
    if (!file) {
      file = process.argv[process.argv.length - 1]
    }
    if (!app.isReady()) {
      cwd = file
      return
    }
    if (settings['terminal.external.openPathIn'] === 'new-window' || !hasWindow()) {
      createWindow(file)
      return
    }
    const frame = getLastWindow()
    frame.webContents.send('open-tab', { cwd: file })
  })
  app.on('open-url', async (event, url) => {
    event.preventDefault()
    await app.whenReady()
    if (!hasWindow()) {
      createWindow()
    }
    const frame = getLastWindow()
    frame.webContents.send('open-url', url)
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  commas.addon.unloadAddons()
  commas.proxy.app.events.emit('unload')
})
