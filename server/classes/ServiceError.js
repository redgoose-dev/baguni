/**
 * ServerError class
 *
 * @example
 * ```
 * throw new ServerError('오류 메시지', { status, text, err })
 * ```
 */
class ServiceError {

  message
  status = 500
  statusText
  url
  error
  file

  /**
   * Constructor
   * @param {string} message
   * @param {object} options
   * @param {number} [options.status] http status code
   * @param {string} [options.text] statusText
   * @param {string} [options.url] url
   * @param {Error} [options.err]
   * @param {string} [options.file] file path
   */
  constructor(message, options = {})
  {
    const { status, text, url, err, file } = options
    this.message = message
    this.status = status || 500
    this.statusText = text || message
    if (url) this.url = url
    if (err) this.error = err
    if (file) this.file = file
  }

}

export default ServiceError
