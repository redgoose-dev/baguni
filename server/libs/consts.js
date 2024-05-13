const { VITE_DATA_PATH } = import.meta.env

export const basePath = VITE_DATA_PATH || 'data'
