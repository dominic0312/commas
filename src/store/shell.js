import {remote} from 'electron'

export default {
  states: {
    multitabs: true,
    finding: false,
  },
  actions: {
    closing({state}, {event, i18n}) {
      const tabs = state.get('terminal.tabs')
      if (tabs.length <= 1) return
      const args = {
        message: i18n('Close Window?#!1'),
        detail: i18n('All tabs in this window will be closed.#!2'),
        buttons: [
          i18n('Confirm#!3'),
          i18n('Cancel#!4'),
        ],
        cancelId: 1,
        defaultId: 0,
      }
      const frame = remote.getCurrentWindow()
      remote.dialog.showMessageBox(frame, args, response => {
        if (response === 0) frame.destroy()
      })
      event.returnValue = false
    },
    drop({action}, {tab, files}) {
      const paths = Array.from(files).map(({path}) => {
        if (path.indexOf(' ') !== -1) return `"${path}"`
        return path
      })
      action.dispatch('terminal.input', {
        tab,
        data: paths.join(' '),
      })
    },
    open(Maye, uri) {
      remote.shell.openExternal(uri)
    },
  }
}
