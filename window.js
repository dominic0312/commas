const {app, BrowserWindow, Menu, ipcMain, dialog} = require('electron')
const {resolve} = require('path')
const {format} = require('url')
const {readFileSync} = require('fs')
const {parse} = require('json5')

const frames = []

function createWindow(args) {
  const options = {
    show: false,
    title: app.getName(),
    width: (8 * 80) + (2 * 8) + 180,
    minWidth: (8 * 40) + (2 * 8) + 180,
    height: (17 * 25) + (2 * 4) + 36,
    frame: false,
    titleBarStyle: 'hiddenInset',
    transparent: true,
    acceptFirstMouse: true,
    affinity: 'default',
    webPreferences: {
      nodeIntegration: true,
    },
  }
  // frame offset
  if (frames.length) {
    const rect = frames[frames.length - 1].getBounds()
    Object.assign(options, {
      x: rect.x + 30,
      y: rect.y + 30,
    })
  }
  const frame = new BrowserWindow(options)
  loadHTMLFile(frame, 'src/index.html')
  if (process.platform !== 'darwin') {
    createWindowMenu(frame)
  }
  // gracefully show window
  frame.once('ready-to-show', () => {
    frame.show()
  })
  // these handler must be binded in main process
  transferEvents(frame)
  // reference to avoid GC
  collectWindow(frame)
  // additional arguments for renderer
  if (args) {
    frame.additionalArguments = args
  }
}

function loadHTMLFile(frame, path) {
  frame.loadURL(format({
    protocol: 'file',
    slashes: true,
    pathname: resolve(__dirname, path),
  }))
}

function collectWindow(frame) {
  frames.push(frame)
  frame.on('closed', () => {
    const index = frames.indexOf(frame)
    if (index !== -1) {
      frames.splice(index, 1)
    }
  })
}

function execCommand(command, frame) {
  if (!frame) {
    frame = BrowserWindow.getFocusedWindow() || frames[frames.length - 1]
    if (!frame) return
  }
  frame.webContents.send('command', command)
}

function getSharedWindowMenu() {
  return [
    {
      label: 'New Tab',
      accelerator: 'CmdOrCtrl+T',
      click(self, frame) {
        execCommand('open-tab', frame)
      },
    },
    {
      label: 'New Window',
      accelerator: 'CmdOrCtrl+N',
      click(self, frame) {
        execCommand('open-window', frame)
      },
    },
    {type: 'separator'},
    {
      label: 'Select Previous Tab',
      accelerator: 'CmdOrCtrl+Shift+[',
      click(self, frame) {
        execCommand('previous-tab', frame)
      },
    },
    {
      label: 'Select Next Tab',
      accelerator: 'CmdOrCtrl+Shift+]',
      click(self, frame) {
        execCommand('next-tab', frame)
      },
    },
    {type: 'separator'},
    {
      label: 'Find',
      accelerator: 'CmdOrCtrl+F',
      click(self, frame) {
        execCommand('find', frame)
      },
    },
    {type: 'separator'},
    {
      label: 'Close Tab',
      accelerator: 'CmdOrCtrl+W',
      click(self, frame) {
        execCommand('close-tab', frame)
      },
    },
    {
      label: 'Close Window',
      accelerator: 'CmdOrCtrl+Shift+W',
      click(self, frame) {
        execCommand('close-window', frame)
      },
    },
  ]
}

function getUserCustomMenu() {
  const userdata = app.isPackaged ?
    app.getPath('userData') : resolve(__dirname, 'userdata')
  const path = resolve(userdata, 'keybindings.json')
  try {
    const keybindings = parse(readFileSync(path))
    return keybindings.map(item => {
      item.click = (self, frame) => {
        execCommand(item.command, frame)
      }
      return item
    })
  } catch (err) {
    return []
  }
}

function createApplicationMenu() {
  const menu = Menu.buildFromTemplate([
    {
      label: app.getName(),
      submenu: [
        {role: 'about'},
        {type: 'separator'},
        {
          label: 'Preferences...',
          accelerator: 'Command+,',
          click(self, frame) {
            execCommand('interact-settings', frame)
          },
        },
        {type: 'separator'},
        {role: 'services'},
        {type: 'separator'},
        {role: 'hide'},
        {role: 'hideothers'},
        {role: 'unhide'},
        {type: 'separator'},
        {role: 'quit'},
      ],
    },
    {
      label: 'Shell',
      submenu: getSharedWindowMenu(),
    },
    {role: 'editMenu'},
    {role: 'windowMenu'},
    {
      label: 'User',
      submenu: getUserCustomMenu(),
    },
    {
      role: 'help',
      submenu: [
        {role: 'toggledevtools'},
        {
          label: 'Reload All Windows',
          accelerator: 'CmdOrCtrl+Shift+R',
          click() {
            frames.forEach(window => window.reload())
          },
        },
      ],
    },
  ])
  Menu.setApplicationMenu(menu)
}

function createWindowMenu(frame) {
  const menu = Menu.buildFromTemplate([
    {
      label: 'Shell',
      submenu: getSharedWindowMenu(),
    },
    {role: 'editMenu'},
    {role: 'windowMenu'},
    {
      label: 'User',
      submenu: getUserCustomMenu(),
    },
    {
      label: 'Help',
      submenu: [
        {role: 'toggledevtools'},
        {
          label: 'Reload All Windows',
          accelerator: 'CmdOrCtrl+Shift+R',
          click() {
            frames.forEach(window => window.reload())
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
      label: 'New Window',
      accelerator: 'CmdOrCtrl+N',
      click(self, frame) {
        execCommand('open-window', frame)
      },
    },
  ])
  app.dock.setMenu(menu)
}

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
  app.on('before-quit', () => {
    frames.forEach(frame => frame.webContents.send('before-quit'))
  })
  ipcMain.on('confirm', (event, args) => {
    const {sender} = event
    const window = BrowserWindow.fromWebContents(sender)
    dialog.showMessageBox(window, args, response => {
      sender.send('confirm', response)
    })
  })
  ipcMain.on('open-window', () => {
    createWindow()
  })
}

let cwd
app.on('ready', () => {
  if (process.platform === 'darwin') {
    createApplicationMenu()
    createDockMenu()
  }
  transferInvoking()
  createWindow(cwd && {path: cwd})
})

app.on('activate', () => {
  if (!frames.length && app.isReady()) {
    createWindow()
  }
})

app.on('will-finish-launching', () => {
  // handle opening outside
  app.on('open-file', (event, path) => {
    event.preventDefault()
    // for Windows
    if (!path) {
      path = process.argv[process.argv.length - 1]
    }
    if (!app.isReady()) {
      cwd = path
    } else if (frames.length) {
      const last = frames[frames.length - 1]
      last.webContents.send('open-path', path)
    } else {
      createWindow({path})
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
