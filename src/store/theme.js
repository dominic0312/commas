import defaultTheme from '../assets/themes/oceanic-next.json'
import tomorrowTheme from '../assets/themes/tomorrow.json'
import {FileStorage} from '../plugins/storage'

const themes = {
  'oceanic-next': defaultTheme,
  'tomorrow': tomorrowTheme,
}

export default {
  states: {
    default: defaultTheme,
    user: {},
  },
  accessors: {
    xterm({state}) {
      // Apply transparency background color
      let theme = state.get([this, 'user'])
      let allowTransparency = false
      if (theme.background.match(/^(?:#[0-9A-Fa-f]{8}$)|rgba/)) {
        allowTransparency = true
        theme = {...theme, background: 'transparent'}
      }
      return {allowTransparency, theme}
    },
  },
  actions: {
    load({state, action}) {
      const theme = defaultTheme
      const settings = state.get('settings.user')
      const specified = settings['terminal.theme.name']
      if (specified && specified !== 'oceanic-next') {
        const file = themes[specified] || FileStorage.require(`themes/${specified}.json`)
        if (file) Object.assign(theme, file)
      }
      state.set([this, 'user'], theme)
      action.dispatch([this, 'inject'])
      return defaultTheme
    },
    inject({state}) {
      const theme = state.get([this, 'user'])
      const element = document.createElement('style')
      const properties = Object.keys(theme)
        .map(key => `--theme-${key.toLowerCase()}: ${theme[key]}`).join('; ')
      element.appendChild(document.createTextNode(`#main { ${properties} }`))
      document.head.appendChild(element)
    },
  }
}