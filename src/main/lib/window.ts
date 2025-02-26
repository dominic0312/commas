import * as path from 'path'
import { effect, stop, unref } from '@vue/reactivity'
import type { BrowserWindowConstructorOptions } from 'electron'
import { app, BrowserWindow, ipcMain } from 'electron'
import { globalHandler } from '../utils/handler'
import { loadCustomCSS } from './addon'
import { hasWindow, getLastWindow } from './frame'
import { createTouchBar, createWindowMenu } from './menu'
import { handleEvents } from './message'
import { useSettings, whenSettingsReady } from './settings'
import { useThemeOptions } from './theme'

async function createWindow(...args: string[]) {
  await whenSettingsReady()
  const settings = useSettings()
  const frameType = settings['terminal.view.frameType']
  const options: Partial<BrowserWindowConstructorOptions> = {
    show: false,
    title: app.name,
    width: (8 * 80) + (2 * 8) + 180,
    minWidth: (8 * 40) + (2 * 8) + 180,
    height: (18 * 24) + (2 * 4) + 36 + 32,
    acceptFirstMouse: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      additionalArguments: [
        '--',
        ...args.filter(arg => (arg as string | undefined) !== undefined),
      ],
    },
  }
  if (frameType === 'immersive') {
    options.titleBarStyle = process.platform === 'darwin' ? 'hiddenInset' : 'hidden'
    if (process.platform === 'win32') {
      options.titleBarOverlay = true
    } else {
      // Transparent window on Windows will lose border and shadow
      options.transparent = true
    }
  }
  // frame offset
  if (hasWindow()) {
    const rect = getLastWindow().getBounds()
    Object.assign(options, {
      x: rect.x + 30,
      y: rect.y + 30,
    })
  }
  const frame = new BrowserWindow(options)
  frame.loadFile(path.resolve(__dirname, '../renderer/index.html'))
  // Gracefully show window
  // Fix shadow issue on macOS
  if (process.platform === 'darwin') {
    /** {@link https://github.com/electron/electron/issues/4472} */
    frame.webContents.once('dom-ready', () => {
      frame.show()
    })
  } else {
    frame.once('ready-to-show', () => {
      frame.show()
    })
  }
  // insert custom css
  loadCustomCSS(frame)
  // these handler must be bound in main process
  handleEvents(frame)
  // reactive effects
  const themeOptionsRef = useThemeOptions()
  const menuEffect = effect(() => {
    if (process.platform === 'darwin') {
      createTouchBar(frame)
    } else {
      createWindowMenu(frame)
      const latestFrameType = settings['terminal.view.frameType']
      frame.setMenuBarVisibility(latestFrameType === 'system-with-menu')
    }
  })
  const themeEffect = effect(() => {
    const themeOptions = unref(themeOptionsRef)
    frame.setBackgroundColor(themeOptions.backgroundColor)
    frame.setVibrancy(themeOptions.vibrancy ?? null)
    if (process.platform === 'win32' && frameType === 'immersive') {
      frame.setTitleBarOverlay(themeOptions.titleBarOverlay)
    }
  })
  frame.on('closed', () => {
    stop(menuEffect)
    stop(themeEffect)
  })
  return frame
}

function handleWindowMessages() {
  ipcMain.handle('open-window', () => {
    createWindow()
  })
  globalHandler.handle('global:open-window', () => {
    createWindow()
  })
}

export {
  createWindow,
  handleWindowMessages,
}
