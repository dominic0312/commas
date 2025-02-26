import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { computed, customRef, effect, ref, unref } from '@vue/reactivity'
import { ipcMain, shell } from 'electron'
import { cloneDeep, isEqual } from 'lodash'
import YAML from 'yaml'
import { surface } from '../../shared/compositions'
import { createDeferred } from '../../shared/helper'
import type { Settings, SettingsSpec } from '../../typings/settings'
import { provideIPC, useYAMLFile } from '../utils/compositions'
import { resourceFile, userFile } from '../utils/directory'
import { writeFile } from '../utils/file'
import { globalHandler } from '../utils/handler'
import { translate } from './i18n'

const defaultSpecs: SettingsSpec[] = require(resourceFile('settings.spec.json'))

const specsRef = ref(defaultSpecs)

function useSettingsSpecs() {
  return specsRef
}

function generateSettingsSource() {
  const currentSpecs = unref(specsRef)
  const sources: string[] = []
  for (const spec of currentSpecs) {
    if (spec.comments) {
      for (let i = 0; i < spec.comments.length; i += 1) {
        sources.push(`# ${translate(`${spec.comments[i]}#!settings.comments.${i}.${spec.key}`)}`)
      }
    }
    const defaultValue = spec.default
    const value = YAML.stringify(defaultValue).trim()
    if (defaultValue && typeof defaultValue === 'object' && Object.keys(defaultValue).length) {
      sources.push(`${spec.key}:`, ...value.split('\n').map(line => '  ' + line))
    } else {
      sources.push(`${spec.key}: ${value}`)
    }
    sources.push('')
  }
  return ['---', ...sources]
    .join('\n')
}

const defaultSettingsRef = computed(() => {
  const currentSpecs = unref(specsRef)
  return Object.fromEntries(currentSpecs.map(spec => [spec.key, spec.default])) as Settings
})

const reactiveDefaultSettings = surface(defaultSettingsRef)

function useDefaultSettings() {
  return reactiveDefaultSettings
}

const deferredSettings = createDeferred()

function whenSettingsReady() {
  return deferredSettings.promise
}

const userSettingsRef = useYAMLFile(userFile('settings.yaml'), {} as Settings, {
  onTrigger() {
    deferredSettings.resolve()
  },
})

let oldSettings: Settings | undefined
const settingsRef = computed<Settings>({
  get() {
    const defaultSettings = unref(defaultSettingsRef)
    const userSettings = unref(userSettingsRef)
    const settings = cloneDeep({
      ...defaultSettings,
      ...userSettings,
    })
    let actualSettings = {} as Settings
    if (oldSettings) {
      const specs = unref(specsRef)
      for (const spec of specs) {
        if (settings[spec.key] !== oldSettings[spec.key] && spec.reload) {
          actualSettings[spec.key] = oldSettings[spec.key]
        } else {
          actualSettings[spec.key] = settings[spec.key]
        }
      }
    } else {
      actualSettings = settings
    }
    if (deferredSettings.resolved) {
      oldSettings = actualSettings
    }
    return actualSettings
  },
  set(data) {
    const defaultSettings = unref(defaultSettingsRef)
    userSettingsRef.value = Object.fromEntries(
      Object.entries(data).filter(
        ([key, value]) => !isEqual(value, defaultSettings[key]),
      ),
    ) as Settings
  },
})

const reactiveSettings = surface(settingsRef)

function useSettings() {
  return reactiveSettings
}

const enabledAddonsRef = customRef<string[]>((track, trigger) => {
  let addons: string[] = []
  whenSettingsReady().then(() => {
    effect(() => {
      addons = reactiveSettings['terminal.addon.includes']
      trigger()
    })
  })
  return {
    get() {
      track()
      return addons
    },
    set(value) {
      reactiveSettings['terminal.addon.includes'] = value
    },
  }
})

function useEnabledAddons() {
  return enabledAddonsRef
}

async function prepareSettingsFile() {
  const file = userFile('settings.yaml')
  try {
    await fs.promises.access(file)
  } catch {
    await writeFile(file, generateSettingsSource())
  }
  return file
}

async function prepareDefaultSettings() {
  const file = path.join(os.tmpdir(), 'commas-default-settings.yaml')
  await writeFile(file, generateSettingsSource())
  return file
}

async function prepareUserFile(file: string, example?: string) {
  const filePath = userFile(file)
  try {
    await fs.promises.access(filePath)
  } catch {
    if (!example) {
      example = resourceFile('examples', file)
    }
    await fs.promises.copyFile(example, filePath)
  }
  return filePath
}

async function openSettingsFile() {
  const file = await prepareSettingsFile()
  return shell.openPath(file)
}

function openUserDirectory() {
  return shell.openPath(userFile())
}

export function writeUserFile(file: string, content?: string) {
  const filePath = userFile(file)
  return writeFile(filePath, content)
}

function handleSettingsMessages() {
  provideIPC('settings-specs', specsRef)
  provideIPC('settings', settingsRef)
  ipcMain.handle('open-settings', () => {
    return openSettingsFile()
  })
  globalHandler.handle('global:open-settings', () => {
    return openSettingsFile()
  })
  ipcMain.handle('open-user-directory', () => {
    return openUserDirectory()
  })
  ipcMain.handle('prepare-settings-file', () => {
    return prepareSettingsFile()
  })
  ipcMain.handle('prepare-default-settings', () => {
    return prepareDefaultSettings()
  })
  ipcMain.handle('prepare-user-file', (event, file: string, example?: string) => {
    return prepareUserFile(file, example)
  })
  ipcMain.handle('write-user-file', (event, file: string, content?: string) => {
    return writeUserFile(file, content)
  })
}

export {
  whenSettingsReady,
  useSettings,
  useDefaultSettings,
  useSettingsSpecs,
  useEnabledAddons,
  openSettingsFile,
  openUserDirectory,
  handleSettingsMessages,
}
