import os from 'os'
import { getWindowsProxy } from './get-windows-proxy'

function _copyLowercaseEnvToUppercase (name: string) {
  // uppercase environment variables are used throughout Cypress and dependencies
  // but users sometimes supply these vars as lowercase
  const lowerEnv = process.env[name.toLowerCase()]
  if (lowerEnv) {
    process.env[name.toUpperCase()] = lowerEnv
  }
}

function _normalizeEnvironmentProxy () {
  if (!process.env.HTTPS_PROXY) {
    // request library will use HTTP_PROXY as a fallback for HTTPS urls, but
    // proxy-from-env will not, so let's just force it to fall back like this
    process.env.HTTPS_PROXY = process.env.HTTP_PROXY
  }

  if (!process.env.NO_PROXY) {
    // don't proxy localhost, to match Chrome's default behavior and user expectation
    process.env.NO_PROXY = 'localhost'
  }
}

// @ts-ignore: Not all code paths return a value
export function loadSystemProxySettings () {
  ['NO_PROXY', 'HTTP_PROXY', 'HTTPS_PROXY'].forEach(_copyLowercaseEnvToUppercase)

  if (process.env.HTTP_PROXY !== undefined) {
    _normalizeEnvironmentProxy()

    return
  }

  if (os.platform() === 'win32') {
    const windowsProxy = getWindowsProxy()

    if (windowsProxy) {
      process.env.HTTP_PROXY = process.env.HTTPS_PROXY = windowsProxy.httpProxy
      process.env.NO_PROXY = process.env.NO_PROXY || windowsProxy.noProxy
    }

    _normalizeEnvironmentProxy()

    return 'win32'
  }
}
