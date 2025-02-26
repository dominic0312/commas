import { ipcRenderer } from 'electron'
import { diligent } from '../../shared/helper'
import { injectIPC } from '../utils/compositions'

export function useFile(file: string) {
  return injectIPC('file', '', file)
}

export const useMinimized = diligent(() => {
  return injectIPC('minimized', false)
})

export const useMaximized = diligent(() => {
  return injectIPC('maximized', false)
})

export const useFullscreen = diligent(() => {
  return injectIPC('fullscreen', false)
})

export function handleFrameMessages() {
  ipcRenderer.on('open-window', () => {
    ipcRenderer.invoke('open-window')
  })
  ipcRenderer.on('close-window', () => {
    window.close()
  })
}
