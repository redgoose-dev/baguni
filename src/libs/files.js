/**
 * file uploader
 * @param {string} [options.accept]
 * @param {boolean} [options.multiple]
 * @return {Promise<FileList|array>}
 */
export function fileUploader(options = {})
{
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    if (options.accept) input.accept = options.accept
    if (options.multiple === true) input.multiple = true
    input.addEventListener('change', e => {
      const files = Object.assign([], e.target.files)
      if (files.length <= 0) return resolve([])
      input.value = null
      resolve((options.multiple === true) ? files : files[0])
    })
    input.addEventListener('cancel', () => {
      resolve((options.multiple === true) ? [] : null)
    })
    input.click()
  })
}

/**
 * get image size
 * @param {File|string} file
 * @return {Promise<object>}
 */
export function getImageSize(file)
{
  return new Promise(resolve => {
    if (!file) return resolve()
    let img = new Image()
    img.onload = function()
    {
      resolve({
        width: this.width,
        height: this.height,
      })
    }
    img.src = (file instanceof File) ? URL.createObjectURL(file) : file
  })
}

/**
 * blob to file
 * @param {Blob} blob
 * @param {string} name
 * @param {string} type
 * @return {File}
 */
export function blobToFile(blob, name, type)
{
  return new File([blob], name, { type })
}
