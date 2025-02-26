import { EventEmitter } from 'events'
import { app, ipcRenderer } from 'electron'
import type { APIContext } from '../types'

const events = new EventEmitter()
events.setMaxListeners(0)

function isMainProcess() {
  return process.type === 'browser'
}

function isPackaged() {
  return isMainProcess()
    ? app.isPackaged
    : process.argv.some(arg => arg.startsWith('--app-path=') && arg.endsWith('app.asar'))
}

function getPath(name: Parameters<typeof app['getPath']>[0]) {
  return isMainProcess()
    ? app.getPath(name)
    : ipcRenderer.sendSync('get-path', name) as string
}

function getVersion() {
  return isMainProcess()
    ? app.getVersion()
    : ipcRenderer.sendSync('get-version') as string
}

function onCleanup(this: APIContext, callback: () => void) {
  events.once(`unload:${this.__name__}`, callback)
}

export * from '../shim'

export {
  events,
  isMainProcess,
  isPackaged,
  getPath,
  getVersion,
  onCleanup,
}
