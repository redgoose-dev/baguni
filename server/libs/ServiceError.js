import { addLog } from './log.js'

class ServiceError extends Error {

  /**
   * @param {string} message
   * @param {number} code
   */
  constructor(message, code = 500)
  {
    super(message)
    this.code = code
  }

}

export default ServiceError
