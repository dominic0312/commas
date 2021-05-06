import * as util from 'util'
import { computed, unref } from '@vue/reactivity'
import { shell } from 'electron'
import type { IpcMainInvokeEvent } from 'electron'
import { useSettings } from '../../lib/settings'

export interface CommandModule {
  command: string,
  handler: (argv: string[], event: IpcMainInvokeEvent) => any,
}

export function resolveCommandAliases(args: string[], aliases: Record<string, string>) {
  let command = args[0]
  while (aliases[command]) {
    command = aliases[command].trim()
  }
  return [command, ...args.slice(1)]
}

export async function executeCommand(event: IpcMainInvokeEvent, args: string[], commands: CommandModule[]) {
  const [command, ...argv] = args
  const controller = commands.find(item => item.command === command)
  try {
    if (!controller) {
      throw new Error(`command not found: ${command}`)
    }
    const stdout = await controller.handler(argv, event)
    return { code: 0, stdout: typeof stdout === 'string' ? stdout : undefined }
  } catch (err) {
    return { code: 1, stderr: String(err) }
  }
}

const externalURLCommandsRef = computed<CommandModule[]>(() => {
  const settings = unref(useSettings())
  const entries: ({ command: string, url: string })[] | undefined = settings['shell.command.externalURLs']
  return entries ? entries.map(entry => {
    const { url, command } = entry
    return {
      command,
      handler(argv: string[]) {
        const finalURL = util.format(url, encodeURIComponent(argv.join(' ')))
        shell.openExternal(finalURL)
        return finalURL
      },
    }
  }) : []
})

export function useExternalURLCommands() {
  return externalURLCommandsRef
}