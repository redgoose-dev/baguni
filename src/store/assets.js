import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { authStore } from './auth.js'
import { pureObject } from '../libs/objects.js'
import { STORAGE_KEYS, getStorage, setStorage } from '../libs/storage.js'

const defaultAssetsIndexFilter = {
  dateStart: undefined,
  dateEnd: undefined,
  fileType: 'all',
  order: 'id',
  sort: 'desc',
  q: undefined,
  tags: [],
  indexTheme: 'thumbnail', // list,thumbnail
}

export const assetStore =  defineStore('filter', () => {
  const auth = authStore()
  const indexSize = ref(auth.user?.json?.asset?.index_size || 24)
  const paginateSize = ref(auth.user?.json?.asset?.index_pageRange || 8)
  const filter = reactive({
    ...pureObject(defaultAssetsIndexFilter),
    ...(getStorage(STORAGE_KEYS.ASSETS_FILTER) || {}),
  })
  function resetFilter()
  {
    Object.entries(defaultAssetsIndexFilter).forEach(([ key, value ]) => {
      filter[key] = value
    })
    saveFilter()
  }
  function saveFilter()
  {
    setStorage(STORAGE_KEYS.ASSETS_FILTER, pureObject(filter))
  }
  function updateAll()
  {
    indexSize.value = auth.user?.json?.asset?.index_size || 24
    paginateSize.value = auth.user?.json?.asset?.index_pageRange || 8
  }
  return {
    indexSize,
    paginateSize,
    filter,
    resetFilter,
    saveFilter,
    updateAll,
  }
})
