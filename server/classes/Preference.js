import pkg from '../../package.json'
import { fileTypes } from '../libs/assets.js'
import { existFile } from '../routes/file/_lib.js'

const { DATA_PATH } = Bun.env

class Preference {

  path = `${DATA_PATH}/preference.json`
  appName = 'BAGUNI'
  version = pkg.version
  token = {}
  asset = {}
  collection = {}
  file = {}
  server
  dev = Bun.env.NODE_ENV === 'development'
  build = !!Bun.env.USE_BUILD
  installed = false

  constructor()
  {}

  async setup()
  {
    const data = await this.load()
    if (data)
    {
      this.appName = data.appName
      this.token = data.token
      this.asset = data.asset
      this.collection = data.collection
      this.file = data.file
      this.installed = true
    }
  }

  get output()
  {
    return {
      appName: this.appName,
      asset: this.asset,
      collection: this.collection,
      file: this.file,
    }
  }

  async load()
  {
    const file = Bun.file(this.path)
    if (await file.exists())
    {
      return await file.json()
    }
    else
    {
      return undefined
    }
  }

  async update(src)
  {
    const origin = await this.load()
    if (!origin) return
    if (src.token) delete src.token
    const compare = {
      ...origin,
      ...src,
    }
    await Bun.write(this.path, JSON.stringify(compare, null, 2))
    this.appName = compare.appName
    this.asset = compare.asset
    this.collection = compare.collection
    this.file = compare.file
  }

  /**
   * get file limit size
   * @param {string} mode fileTypes
   * @return {number} size (byte)
   */
  getFileLimitSize(mode)
  {
    switch (mode)
    {
      case fileTypes.main:
      case fileTypes.coverOrigin:
        return this.file.limit.main
      case fileTypes.body:
        return this.file.limit.body
      case fileTypes.coverCreate:
        return this.file.limit.cover
      default:
        return 0
    }
  }

  async checkInstall()
  {
    const paths = [
      `${DATA_PATH}/preference.json`,
      `${DATA_PATH}/db.sqlite`,
    ]
    for (const path of paths)
    {
      if (!(await existFile(path))) return false
    }
    return true
  }

}

export default Preference
export const pref = new Preference()
