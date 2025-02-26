import * as path from 'path'
import { app } from 'electron'

const rootDir = path.join(__dirname, '../../')

const userDataDir = app.isPackaged
  ? app.getPath('userData') : path.join(rootDir, 'userdata/')
const resourcesDir = path.join(rootDir, 'resources/')

function userFile(...paths: string[]) {
  return path.join(userDataDir, ...paths)
}

function resourceFile(...paths: string[]) {
  return path.join(resourcesDir, ...paths)
}

export {
  userFile,
  resourceFile,
}
