import { computed, unref } from '@vue/reactivity'
import type { MenuItemConstructorOptions, PopupOptions } from 'electron'
import { app, Menu, ipcMain, BrowserWindow } from 'electron'
import type { KeyBinding } from '../../typings/keybinding'
import { resources } from '../utils/directory'
import { useFocusedWindow } from './frame'
import { translate } from './i18n'
import { useAddonKeyBindings, useUserKeyBindings } from './keybinding'
import { createWindow } from './window'

const terminalMenuItems = resources.require<KeyBinding[]>('terminal.menu.json')!

function resolveBindingCommand(binding: KeyBinding) {
  const focusedWindow = unref(useFocusedWindow())
  const result: MenuItemConstructorOptions = { ...binding }
  if (binding.label) {
    result.label = translate(binding.label)
  }
  if (binding.command) {
    result.click = (self, frame: BrowserWindow) => {
      frame.webContents.send(binding.command!, binding.args)
    }
    result.enabled = Boolean(focusedWindow)
  }
  if (binding.submenu) {
    result.submenu = binding.submenu.map(resolveBindingCommand)
  }
  return result
}

function getTerminalMenuItems() {
  return terminalMenuItems.map(resolveBindingCommand)
}

const customMenuItemsRef = computed(async () => {
  // Implicitly depends on `useFocusedWindow()`
  const loadingUserKeyBindings = unref(useUserKeyBindings())
  const userKeyBindings = await loadingUserKeyBindings
  return userKeyBindings
    .filter(item => item.command && !item.command.startsWith('xterm:'))
    .map(resolveBindingCommand)
})

const addonMenuItemsRef = computed(async () => {
  // Implicitly depends on `useFocusedWindow()`
  const addonKeyBindings = unref(useAddonKeyBindings())
  return addonKeyBindings
    .filter(item => item.command && !item.command.startsWith('xterm:'))
    .map(resolveBindingCommand)
})

async function createApplicationMenu() {
  const loadingCustomMenuItems = unref(customMenuItemsRef)
  const loadingAddonMenuItems = unref(addonMenuItemsRef)
  const focusedWindow = unref(useFocusedWindow())
  const menu = Menu.buildFromTemplate([
    {
      label: app.name,
      submenu: [
        { role: 'about', label: translate('About %A#!menu.about', { A: app.name }) },
        { type: 'separator' },
        {
          label: translate('Preferences...#!menu.preference'),
          enabled: Boolean(focusedWindow),
          accelerator: 'Command+,',
          click(self, frame: BrowserWindow) {
            frame.webContents.send('invoke', 'open-settings')
          },
        },
        { type: 'separator' },
        { role: 'services', label: translate('Services#!menu.services') },
        { type: 'separator' },
        { role: 'hide', label: translate('Hide %A#!menu.hide', { A: app.name }) },
        { role: 'hideOthers', label: translate('Hide Others#!menu.hideothers') },
        { role: 'unhide', label: translate('Show All#!menu.unhide') },
        { type: 'separator' },
        { role: 'quit', label: translate('Quit %A#!menu.quit', { A: app.name }) },
      ],
    },
    {
      label: translate('Terminal#!menu.terminal'),
      submenu: getTerminalMenuItems(),
    },
    { role: 'editMenu', label: translate('Edit#!menu.edit') },
    { role: 'windowMenu', label: translate('Window#!menu.window') },
    {
      label: translate('User#!menu.user'),
      submenu: await loadingCustomMenuItems,
    },
    {
      label: translate('Addon#!menu.addon'),
      submenu: await loadingAddonMenuItems,
    },
    {
      label: translate('Help#!menu.help'),
      role: 'help',
      submenu: [
        { role: 'toggleDevTools', label: translate('Toggle Developer Tools#!toggledevtools') },
        {
          label: translate('Relaunch %A#!menu.relaunch', { A: app.name }),
          accelerator: 'CmdOrCtrl+Shift+R',
          click() {
            app.relaunch()
          },
        },
      ],
    },
  ])
  Menu.setApplicationMenu(menu)
}

async function createWindowMenu(frame: BrowserWindow) {
  const loadingCustomMenuItems = unref(customMenuItemsRef)
  const loadingAddonMenuItems = unref(addonMenuItemsRef)
  const menu = Menu.buildFromTemplate([
    {
      label: translate('Terminal#!menu.terminal'),
      submenu: getTerminalMenuItems(),
    },
    { role: 'editMenu' },
    { role: 'windowMenu' },
    {
      label: translate('User#!menu.user'),
      submenu: await loadingCustomMenuItems,
    },
    {
      label: translate('Addon#!menu.addon'),
      submenu: await loadingAddonMenuItems,
    },
    {
      label: translate('Help#!menu.help'),
      submenu: [
        { role: 'toggleDevTools' },
        {
          label: translate('Relaunch %A#!menu.relaunch', { A: app.name }),
          accelerator: 'CmdOrCtrl+Shift+R',
          click() {
            app.relaunch()
          },
        },
      ],
    },
  ])
  frame.setMenu(menu)
  frame.setMenuBarVisibility(false)
}

function createDockMenu() {
  const menu = Menu.buildFromTemplate([
    {
      label: translate('New Window#!menu.newwindow'),
      accelerator: 'CmdOrCtrl+N',
      click() {
        createWindow()
      },
    },
  ])
  app.dock.setMenu(menu)
}

function handleMenuMessages() {
  ipcMain.handle('contextmenu', (event, template: KeyBinding[], options: PopupOptions) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    const menu = Menu.buildFromTemplate(
      template.map(resolveBindingCommand)
    )
    menu.popup({
      ...options,
      window: frame ?? undefined,
    })
  })
}

export {
  createApplicationMenu,
  createWindowMenu,
  createDockMenu,
  handleMenuMessages,
}
