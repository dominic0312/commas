import {readFile, readFileSync, writeFile, mkdir, access, watch} from 'fs'
import {dirname, resolve} from 'path'
import {promisify} from 'util'
import * as JSON from 'json5'
import {debounce} from 'lodash'
import {app, src} from './electron'

const promises = {
  readFile: promisify(readFile),
  access: promisify(access),
  mkdir: promisify(mkdir),
  writeFile: promisify(writeFile),
}

const PATH = app.isPackaged ?
  app.getPath('userData') : resolve(src, '..', 'userdata')

export default {
  async load(basename) {
    try {
      return JSON.parse(await this.read(basename))
    } catch (err) {
      return null
    }
  },
  loadSync(basename) {
    try {
      return JSON.parse(this.readSync(basename))
    } catch (err) {
      return null
    }
  },
  save(basename, data) {
    return this.write(basename, JSON.stringify(data, null, 2))
  },
  async read(basename) {
    try {
      return await promises.readFile(this.filename(basename))
    } catch (err) {
      return null
    }
  },
  async write(basename, content) {
    const filename = this.filename(basename)
    try {
      await promises.mkdir(dirname(filename))
    } catch (err) {
      // ignore error
    }
    return promises.writeFile(filename, content)
  },
  watch(basename, updater) {
    // `chokidar` is too large; `gaze` seems to be OK. Use native currently.
    try {
      return watch(this.filename(basename), debounce(updater, 500))
    } catch (err) {
      return null
    }
  },
  readSync(basename) {
    try {
      return readFileSync(this.filename(basename))
    } catch (err) {
      return null
    }
  },
  require(basename) {
    const filename = this.filename(basename)
    try {
      return global.require(filename)
    } catch (err) {
      return null
    }
  },
  filename(basename) {
    return resolve(PATH, basename)
  },
}
