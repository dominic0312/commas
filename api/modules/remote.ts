import { ipcRenderer } from 'electron'
import { useFile } from '../../src/renderer/compositions/frame'
import { getAddonManifest, useLanguage } from '../../src/renderer/compositions/i18n'
import {
  useAddons,
  useSettings,
  useSettingsSpecs,
} from '../../src/renderer/compositions/settings'
import { openCodeEditorTab } from '../../src/renderer/compositions/terminal'
import { useTheme } from '../../src/renderer/compositions/theme'
import { translate } from '../../src/renderer/utils/i18n'

export * from '../shim'

function openUserDirectory() {
  return ipcRenderer.invoke('open-user-directory')
}

async function openDefaultSettings() {
  const filePath: string = await ipcRenderer.invoke('prepare-default-settings')
  openCodeEditorTab(filePath)
}

async function openSettingsFile() {
  const filePath: string = await ipcRenderer.invoke('prepare-settings-file')
  openCodeEditorTab(filePath)
}

async function openUserFile(file: string, example?: string) {
  const filePath: string = await ipcRenderer.invoke('prepare-user-file', file, example)
  openCodeEditorTab(filePath)
}

function writeUserFile(file: string, content?: string) {
  return ipcRenderer.invoke('write-user-file', file, content)
}

export {
  useAddons,
  useLanguage,
  useSettings,
  useSettingsSpecs,
  useTheme,
  useFile,
  getAddonManifest,
  openUserDirectory,
  openDefaultSettings,
  openSettingsFile,
  openUserFile,
  writeUserFile,
  translate,
}
