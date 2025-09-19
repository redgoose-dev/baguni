import { tables, getItem } from '../../libs/db.js'

export const ASSET_MODE = {
  PUBLIC: 'public',
  PRIVATE: 'private',
}

export function checkAssetMode(mode)
{
  switch (mode)
  {
    case ASSET_MODE.PUBLIC:
    case ASSET_MODE.PRIVATE:
      return mode
    default:
      return ASSET_MODE.PRIVATE
  }
}
