import { computed, unref } from '@vue/reactivity'
import * as commas from 'commas:api/main'
// TODO: make it shareable
import { createIDGenerator } from '../../../../main/utils/helper'
import type { Launcher } from '../../typings/launcher'

const userData = commas.directory.userData

const generateID = createIDGenerator()

function fillLauncherIDs(launchers: Omit<Launcher, 'id'>[], old: Launcher[] | null) {
  const oldValues = old ? [...old] : []
  return launchers.map<Launcher>(launcher => {
    const index = oldValues.findIndex(item => {
      return item.remote === launcher.remote && (item.name === launcher.name || (
        item.directory === launcher.directory && item.command === launcher.command
      ))
    })
    let matched: Launcher | undefined
    if (index !== -1) {
      matched = oldValues[index]
      oldValues.splice(index, 1)
    }
    return {
      ...launcher,
      id: matched ? matched.id : generateID(),
    }
  })
}

const rawLaunchersRef = userData.useYAML<Omit<Launcher, 'id'>[]>('launchers.yaml', [])

let oldValue: Launcher[]
const launchersRef = computed(() => {
  const value = unref(rawLaunchersRef)
  const launchers = fillLauncherIDs(value, oldValue)
  oldValue = launchers
  return launchers
})

function useLaunchers() {
  return launchersRef
}

export {
  useLaunchers,
}