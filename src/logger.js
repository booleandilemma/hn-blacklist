class Logger {
  /**
   * Logs an info message to the console.
   * @param {string} message - Specifies the message to log.
   */
  logInfo(message) {
    console.info(`${UserScriptName}: ${message}`);
  }

  /**
   * Logs a warning message to the console.
   * @param {string} message - Specifies the message to log.
   */
  logWarning(message) {
    console.warn(`${UserScriptName}: ${message}`);
  }

  /**
   * Logs an error message to the console.
   * @param {string} message - Specifies the message to log.
   */
  logError(message) {
    console.error(`${UserScriptName}: ${message}`);
  }
}

export default Logger;
