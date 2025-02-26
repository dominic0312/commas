import commas from 'commas:api/main'

export default () => {

  commas.context.provide('cli.command', {
    command: 'power',
    usage: '[off]',
    async handler({ sender, argv }) {
      const [status] = argv
      const enabled = status !== 'off'
      sender.send('toggle-power-mode', enabled)
      if (enabled) {
        return `
Power mode is turned on. Enter

    commas power off

to exit power mode.
`.trim()
      }
    },
  })

}
