const {app, autoUpdater, dialog} = require('electron')
const {translate} = require('../build/main')

let autoUpdateChecker

function checkForUpdates() {
  if (!app.isPackaged || !['darwin', 'win32'].includes(process.platform)) return
  autoUpdater.on('update-available', () => {
    clearInterval(autoUpdateChecker)
  })
  autoUpdater.on('update-downloaded', (event, notes, name) => {
    const options = {
      message: name,
      detail: translate('A new version has been downloaded. Restart the application to apply the updates.#!16'),
      buttons: [
        translate('Restart#!17'),
        translate('Later#!18'),
      ],
      defaultId: 0,
      cancelId: 1,
    }
    // const {response} = await dialog.showMessageBox(options)
    // if (response === 0) autoUpdater.quitAndInstall()
    dialog.showMessageBox(options, response => {
      if (response === 0) autoUpdater.quitAndInstall()
    })
  })
  // Electron official feed URL
  const repo = 'CyanSalt/commas'
  const host = 'https://update.electronjs.org'
  const feedURL = `${host}/${repo}/${process.platform}-${process.arch}/${app.getVersion()}`
  autoUpdater.setFeedURL(feedURL)
  // Check for updates endlessly
  autoUpdateChecker = setInterval(() => {
    autoUpdater.checkForUpdates()
  }, 3600 * 1e3)
  autoUpdater.checkForUpdates()
}

module.exports = {
  checkForUpdates,
}
