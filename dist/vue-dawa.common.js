module.exports =
/******/ (function (modules) { // webpackBootstrap
    /******/ 	// The module cache
    /******/ 	var installedModules = {}
    /******/
    /******/ 	// The require function
    /******/ 	function __webpack_require__ (moduleId) {
      /******/
      /******/ 		// Check if module is in cache
      /******/ 		if (installedModules[moduleId]) {
        /******/ 			return installedModules[moduleId].exports
        /******/ 		}
      /******/ 		// Create a new module (and put it into the cache)
      /******/ 		var module = installedModules[moduleId] = {
        /******/ 			i: moduleId,
        /******/ 			l: false,
        /******/ 			exports: {}
        /******/ 		}
      /******/
      /******/ 		// Execute the module function
      /******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__)
      /******/
      /******/ 		// Flag the module as loaded
      /******/ 		module.l = true
      /******/
      /******/ 		// Return the exports of the module
      /******/ 		return module.exports
      /******/ 	}
    /******/
    /******/
    /******/ 	// expose the modules object (__webpack_modules__)
    /******/ 	__webpack_require__.m = modules
    /******/
    /******/ 	// expose the module cache
    /******/ 	__webpack_require__.c = installedModules
    /******/
    /******/ 	// define getter function for harmony exports
    /******/ 	__webpack_require__.d = function (exports, name, getter) {
      /******/ 		if (!__webpack_require__.o(exports, name)) {
        /******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter })
        /******/ 		}
      /******/ 	}
    /******/
    /******/ 	// define __esModule on exports
    /******/ 	__webpack_require__.r = function (exports) {
      /******/ 		if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
        /******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })
        /******/ 		}
      /******/ 		Object.defineProperty(exports, '__esModule', { value: true })
      /******/ 	}
    /******/
    /******/ 	// create a fake namespace object
    /******/ 	// mode & 1: value is a module id, require it
    /******/ 	// mode & 2: merge all properties of value into the ns
    /******/ 	// mode & 4: return value when already ns object
    /******/ 	// mode & 8|1: behave like require
    /******/ 	__webpack_require__.t = function (value, mode) {
      /******/ 		if (mode & 1) value = __webpack_require__(value)
      /******/ 		if (mode & 8) return value
      /******/ 		if ((mode & 4) && typeof value === 'object' && value && value.__esModule) return value
      /******/ 		var ns = Object.create(null)
      /******/ 		__webpack_require__.r(ns)
      /******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value })
      /******/ 		if (mode & 2 && typeof value !== 'string') for (var key in value) __webpack_require__.d(ns, key, function (key) { return value[key] }.bind(null, key))
      /******/ 		return ns
      /******/ 	}
    /******/
    /******/ 	// getDefaultExport function for compatibility with non-harmony modules
    /******/ 	__webpack_require__.n = function (module) {
      /******/ 		var getter = module && module.__esModule
      /******/ 			? function getDefault () { return module.default }
      /******/ 			: function getModuleExports () { return module }
      /******/ 		__webpack_require__.d(getter, 'a', getter)
      /******/ 		return getter
      /******/ 	}
    /******/
    /******/ 	// Object.prototype.hasOwnProperty.call
    /******/ 	__webpack_require__.o = function (object, property) { return Object.prototype.hasOwnProperty.call(object, property) }
    /******/
    /******/ 	// __webpack_public_path__
    /******/ 	__webpack_require__.p = ''
    /******/
    /******/
    /******/ 	// Load entry module and return exports
    /******/ 	return __webpack_require__(__webpack_require__.s = 'fb15')
    /******/ })
  /************************************************************************/
  /******/ ({

    /***/ '0a06':
    /***/ function (module, exports, __webpack_require__) {
      'use strict'

      var utils = __webpack_require__('c532')
      var buildURL = __webpack_require__('30b5')
      var InterceptorManager = __webpack_require__('f6b4')
      var dispatchRequest = __webpack_require__('5270')
      var mergeConfig = __webpack_require__('4a7b')

      /**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
      function Axios (instanceConfig) {
        this.defaults = instanceConfig
        this.interceptors = {
          request: new InterceptorManager(),
          response: new InterceptorManager()
        }
      }

      /**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
      Axios.prototype.request = function request (config) {
        /* eslint no-param-reassign:0 */
        // Allow for axios('example/url'[, config]) a la fetch API
        if (typeof config === 'string') {
          config = arguments[1] || {}
          config.url = arguments[0]
        } else {
          config = config || {}
        }

        config = mergeConfig(this.defaults, config)

        // Set config.method
        if (config.method) {
          config.method = config.method.toLowerCase()
        } else if (this.defaults.method) {
          config.method = this.defaults.method.toLowerCase()
        } else {
          config.method = 'get'
        }

        // Hook up interceptors middleware
        var chain = [dispatchRequest, undefined]
        var promise = Promise.resolve(config)

        this.interceptors.request.forEach(function unshiftRequestInterceptors (interceptor) {
          chain.unshift(interceptor.fulfilled, interceptor.rejected)
        })

        this.interceptors.response.forEach(function pushResponseInterceptors (interceptor) {
          chain.push(interceptor.fulfilled, interceptor.rejected)
        })

        while (chain.length) {
          promise = promise.then(chain.shift(), chain.shift())
        }

        return promise
      }

      Axios.prototype.getUri = function getUri (config) {
        config = mergeConfig(this.defaults, config)
        return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '')
      }

      // Provide aliases for supported request methods
      utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData (method) {
        /* eslint func-names:0 */
        Axios.prototype[method] = function (url, config) {
          return this.request(mergeConfig(config || {}, {
            method: method,
            url: url,
            data: (config || {}).data
          }))
        }
      })

      utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData (method) {
        /* eslint func-names:0 */
        Axios.prototype[method] = function (url, data, config) {
          return this.request(mergeConfig(config || {}, {
            method: method,
            url: url,
            data: data
          }))
        }
      })

      module.exports = Axios
      /***/ },

    /***/ '0df6':
    /***/ function (module, exports, __webpack_require__) {
      'use strict'

      /**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
      module.exports = function spread (callback) {
        return function wrap (arr) {
          return callback.apply(null, arr)
        }
      }
      /***/ },

    /***/ '1d2b':
    /***/ function (module, exports, __webpack_require__) {
      'use strict'

      module.exports = function bind (fn, thisArg) {
        return function wrap () {
          var args = new Array(arguments.length)
          for (var i = 0; i < args.length; i++) {
            args[i] = arguments[i]
          }
          return fn.apply(thisArg, args)
        }
      }
      /***/ },

    /***/ 2444:
    /***/ function (module, exports, __webpack_require__) {
      'use strict';
      /* WEBPACK VAR INJECTION */(function (process) {
        var utils = __webpack_require__('c532')
        var normalizeHeaderName = __webpack_require__('c8af')

        var DEFAULT_CONTENT_TYPE = {
          'Content-Type': 'application/x-www-form-urlencoded'
        }

        function setContentTypeIfUnset (headers, value) {
          if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
            headers['Content-Type'] = value
          }
        }

        function getDefaultAdapter () {
          var adapter
          if (typeof XMLHttpRequest !== 'undefined') {
            // For browsers use XHR adapter
            adapter = __webpack_require__('b50d')
          } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
            // For node use HTTP adapter
            adapter = __webpack_require__('b50d')
          }
          return adapter
        }

        var defaults = {
          adapter: getDefaultAdapter(),

          transformRequest: [function transformRequest (data, headers) {
            normalizeHeaderName(headers, 'Accept')
            normalizeHeaderName(headers, 'Content-Type')
            if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
            ) {
              return data
            }
            if (utils.isArrayBufferView(data)) {
              return data.buffer
            }
            if (utils.isURLSearchParams(data)) {
              setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8')
              return data.toString()
            }
            if (utils.isObject(data)) {
              setContentTypeIfUnset(headers, 'application/json;charset=utf-8')
              return JSON.stringify(data)
            }
            return data
          }],

          transformResponse: [function transformResponse (data) {
            /* eslint no-param-reassign:0 */
            if (typeof data === 'string') {
              try {
                data = JSON.parse(data)
              } catch (e) { /* Ignore */ }
            }
            return data
          }],

          /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
          timeout: 0,

          xsrfCookieName: 'XSRF-TOKEN',
          xsrfHeaderName: 'X-XSRF-TOKEN',

          maxContentLength: -1,
          maxBodyLength: -1,

          validateStatus: function validateStatus (status) {
            return status >= 200 && status < 300
          }
        }

        defaults.headers = {
          common: {
            Accept: 'application/json, text/plain, */*'
          }
        }

        utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData (method) {
          defaults.headers[method] = {}
        })

        utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData (method) {
          defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE)
        })

        module.exports = defaults
        /* WEBPACK VAR INJECTION */ }.call(this, __webpack_require__('4362')))
      /***/ },

    /***/ '2d83':
    /***/ function (module, exports, __webpack_require__) {
      'use strict'

      var enhanceError = __webpack_require__('387f')

      /**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
      module.exports = function createError (message, config, code, request, response) {
        var error = new Error(message)
        return enhanceError(error, config, code, request, response)
      }
      /***/ },

    /***/ '2e67':
    /***/ function (module, exports, __webpack_require__) {
      'use strict'

      module.exports = function isCancel (value) {
        return !!(value && value.__CANCEL__)
      }
      /***/ },

    /***/ '30b5':
    /***/ function (module, exports, __webpack_require__) {
      'use strict'

      var utils = __webpack_require__('c532')

      function encode (val) {
        return encodeURIComponent(val)
          .replace(/%3A/gi, ':')
          .replace(/%24/g, '$')
          .replace(/%2C/gi, ',')
          .replace(/%20/g, '+')
          .replace(/%5B/gi, '[')
          .replace(/%5D/gi, ']')
      }

      /**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
      module.exports = function buildURL (url, params, paramsSerializer) {
        /* eslint no-param-reassign:0 */
        if (!params) {
          return url
        }

        var serializedParams
        if (paramsSerializer) {
          serializedParams = paramsSerializer(params)
        } else if (utils.isURLSearchParams(params)) {
          serializedParams = params.toString()
        } else {
          var parts = []

          utils.forEach(params, function serialize (val, key) {
            if (val === null || typeof val === 'undefined') {
              return
            }

            if (utils.isArray(val)) {
              key = key + '[]'
            } else {
              val = [val]
            }

            utils.forEach(val, function parseValue (v) {
              if (utils.isDate(v)) {
                v = v.toISOString()
              } else if (utils.isObject(v)) {
                v = JSON.stringify(v)
              }
              parts.push(encode(key) + '=' + encode(v))
            })
          })

          serializedParams = parts.join('&')
        }

        if (serializedParams) {
          var hashmarkIndex = url.indexOf('#')
          if (hashmarkIndex !== -1) {
            url = url.slice(0, hashmarkIndex)
          }

          url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams
        }

        return url
      }
      /***/ },

    /***/ '387f':
    /***/ function (module, exports, __webpack_require__) {
      'use strict'

      /**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
      module.exports = function enhanceError (error, config, code, request, response) {
        error.config = config
        if (code) {
          error.code = code
        }

        error.request = request
        error.response = response
        error.isAxiosError = true

        error.toJSON = function toJSON () {
          return {
            // Standard
            message: this.message,
            name: this.name,
            // Microsoft
            description: this.description,
            number: this.number,
            // Mozilla
            fileName: this.fileName,
            lineNumber: this.lineNumber,
            columnNumber: this.columnNumber,
            stack: this.stack,
            // Axios
            config: this.config,
            code: this.code
          }
        }
        return error
      }
      /***/ },

    /***/ 3934:
    /***/ function (module, exports, __webpack_require__) {
      'use strict'

      var utils = __webpack_require__('c532')

      module.exports = (
        utils.isStandardBrowserEnv()

        // Standard browser envs have full support of the APIs needed to test
        // whether the request URL is of the same origin as current location.
          ? (function standardBrowserEnv () {
            var msie = /(msie|trident)/i.test(navigator.userAgent)
            var urlParsingNode = document.createElement('a')
            var originURL

            /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
            function resolveURL (url) {
              var href = url

              if (msie) {
                // IE needs attribute set twice to normalize properties
                urlParsingNode.setAttribute('href', href)
                href = urlParsingNode.href
              }

              urlParsingNode.setAttribute('href', href)

              // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
              return {
                href: urlParsingNode.href,
                protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
                host: urlParsingNode.host,
                search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
                hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
                hostname: urlParsingNode.hostname,
                port: urlParsingNode.port,
                pathname: (urlParsingNode.pathname.charAt(0) === '/')
                  ? urlParsingNode.pathname
                  : '/' + urlParsingNode.pathname
              }
            }

            originURL = resolveURL(window.location.href)

            /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
            return function isURLSameOrigin (requestURL) {
              var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL
              return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host)
            }
          })()

        // Non standard browser envs (web workers, react-native) lack needed support.
          : (function nonStandardBrowserEnv () {
            return function isURLSameOrigin () {
              return true
            }
          })()
      )
      /***/ },

    /***/ 4362:
    /***/ function (module, exports, __webpack_require__) {
      exports.nextTick = function nextTick (fn) {
        var args = Array.prototype.slice.call(arguments)
        args.shift()
        setTimeout(function () {
          fn.apply(null, args)
        }, 0)
      }

      exports.platform = exports.arch =
exports.execPath = exports.title = 'browser'
      exports.pid = 1
      exports.browser = true
      exports.env = {}
      exports.argv = []

      exports.binding = function (name) {
        throw new Error('No such module. (Possibly not yet loaded)')
      };

      (function () {
        var cwd = '/'
        var path
        exports.cwd = function () { return cwd }
        exports.chdir = function (dir) {
          if (!path) path = __webpack_require__('df7c')
          cwd = path.resolve(dir, cwd)
        }
      })()

      exports.exit = exports.kill =
exports.umask = exports.dlopen =
exports.uptime = exports.memoryUsage =
exports.uvCounters = function () {}
      exports.features = {}
      /***/ },

    /***/ '467f':
    /***/ function (module, exports, __webpack_require__) {
      'use strict'

      var createError = __webpack_require__('2d83')

      /**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
      module.exports = function settle (resolve, reject, response) {
        var validateStatus = response.config.validateStatus
        if (!response.status || !validateStatus || validateStatus(response.status)) {
          resolve(response)
        } else {
          reject(createError(
            'Request failed with status code ' + response.status,
            response.config,
            null,
            response.request,
            response
          ))
        }
      }
      /***/ },

    /***/ '4a7b':
    /***/ function (module, exports, __webpack_require__) {
      'use strict'

      var utils = __webpack_require__('c532')

      /**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
      module.exports = function mergeConfig (config1, config2) {
        // eslint-disable-next-line no-param-reassign
        config2 = config2 || {}
        var config = {}

        var valueFromConfig2Keys = ['url', 'method', 'data']
        var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params']
        var defaultToConfig2Keys = [
          'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
          'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
          'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
          'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
          'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
        ]
        var directMergeKeys = ['validateStatus']

        function getMergedValue (target, source) {
          if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
            return utils.merge(target, source)
          } else if (utils.isPlainObject(source)) {
            return utils.merge({}, source)
          } else if (utils.isArray(source)) {
            return source.slice()
          }
          return source
        }

        function mergeDeepProperties (prop) {
          if (!utils.isUndefined(config2[prop])) {
            config[prop] = getMergedValue(config1[prop], config2[prop])
          } else if (!utils.isUndefined(config1[prop])) {
            config[prop] = getMergedValue(undefined, config1[prop])
          }
        }

        utils.forEach(valueFromConfig2Keys, function valueFromConfig2 (prop) {
          if (!utils.isUndefined(config2[prop])) {
            config[prop] = getMergedValue(undefined, config2[prop])
          }
        })

        utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties)

        utils.forEach(defaultToConfig2Keys, function defaultToConfig2 (prop) {
          if (!utils.isUndefined(config2[prop])) {
            config[prop] = getMergedValue(undefined, config2[prop])
          } else if (!utils.isUndefined(config1[prop])) {
            config[prop] = getMergedValue(undefined, config1[prop])
          }
        })

        utils.forEach(directMergeKeys, function merge (prop) {
          if (prop in config2) {
            config[prop] = getMergedValue(config1[prop], config2[prop])
          } else if (prop in config1) {
            config[prop] = getMergedValue(undefined, config1[prop])
          }
        })

        var axiosKeys = valueFromConfig2Keys
          .concat(mergeDeepPropertiesKeys)
          .concat(defaultToConfig2Keys)
          .concat(directMergeKeys)

        var otherKeys = Object
          .keys(config1)
          .concat(Object.keys(config2))
          .filter(function filterAxiosKeys (key) {
            return axiosKeys.indexOf(key) === -1
          })

        utils.forEach(otherKeys, mergeDeepProperties)

        return config
      }
      /***/ },

    /***/ 5270:
    /***/ function (module, exports, __webpack_require__) {
      'use strict'

      var utils = __webpack_require__('c532')
      var transformData = __webpack_require__('c401')
      var isCancel = __webpack_require__('2e67')
      var defaults = __webpack_require__('2444')

      /**
 * Throws a `Cancel` if cancellation has been requested.
 */
      function throwIfCancellationRequested (config) {
        if (config.cancelToken) {
          config.cancelToken.throwIfRequested()
        }
      }

      /**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
      module.exports = function dispatchRequest (config) {
        throwIfCancellationRequested(config)

        // Ensure headers exist
        config.headers = config.headers || {}

        // Transform request data
        config.data = transformData(
          config.data,
          config.headers,
          config.transformRequest
        )

        // Flatten headers
        config.headers = utils.merge(
          config.headers.common || {},
          config.headers[config.method] || {},
          config.headers
        )

        utils.forEach(
          ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
          function cleanHeaderConfig (method) {
            delete config.headers[method]
          }
        )

        var adapter = config.adapter || defaults.adapter

        return adapter(config).then(function onAdapterResolution (response) {
          throwIfCancellationRequested(config)

          // Transform response data
          response.data = transformData(
            response.data,
            response.headers,
            config.transformResponse
          )

          return response
        }, function onAdapterRejection (reason) {
          if (!isCancel(reason)) {
            throwIfCancellationRequested(config)

            // Transform response data
            if (reason && reason.response) {
              reason.response.data = transformData(
                reason.response.data,
                reason.response.headers,
                config.transformResponse
              )
            }
          }

          return Promise.reject(reason)
        })
      }
      /***/ },

    /***/ '5f02':
    /***/ function (module, exports, __webpack_require__) {
      'use strict'

      /**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
      module.exports = function isAxiosError (payload) {
        return (typeof payload === 'object') && (payload.isAxiosError === true)
      }
      /***/ },

    /***/ '7a77':
    /***/ function (module, exports, __webpack_require__) {
      'use strict'

      /**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
      function Cancel (message) {
        this.message = message
      }

      Cancel.prototype.toString = function toString () {
        return 'Cancel' + (this.message ? ': ' + this.message : '')
      }

      Cancel.prototype.__CANCEL__ = true

      module.exports = Cancel
      /***/ },

    /***/ '7aac':
    /***/ function (module, exports, __webpack_require__) {
      'use strict'

      var utils = __webpack_require__('c532')

      module.exports = (
        utils.isStandardBrowserEnv()

        // Standard browser envs support document.cookie
          ? (function standardBrowserEnv () {
            return {
              write: function write (name, value, expires, path, domain, secure) {
                var cookie = []
                cookie.push(name + '=' + encodeURIComponent(value))

                if (utils.isNumber(expires)) {
                  cookie.push('expires=' + new Date(expires).toGMTString())
                }

                if (utils.isString(path)) {
                  cookie.push('path=' + path)
                }

                if (utils.isString(domain)) {
                  cookie.push('domain=' + domain)
                }

                if (secure === true) {
                  cookie.push('secure')
                }

                document.cookie = cookie.join('; ')
              },

              read: function read (name) {
                var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'))
                return (match ? decodeURIComponent(match[3]) : null)
              },

              remove: function remove (name) {
                this.write(name, '', Date.now() - 86400000)
              }
            }
          })()

        // Non standard browser env (web workers, react-native) lack needed support.
          : (function nonStandardBrowserEnv () {
            return {
              write: function write () {},
              read: function read () { return null },
              remove: function remove () {}
            }
          })()
      )
      /***/ },

    /***/ '83b9':
    /***/ function (module, exports, __webpack_require__) {
      'use strict'

      var isAbsoluteURL = __webpack_require__('d925')
      var combineURLs = __webpack_require__('e683')

      /**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
      module.exports = function buildFullPath (baseURL, requestedURL) {
        if (baseURL && !isAbsoluteURL(requestedURL)) {
          return combineURLs(baseURL, requestedURL)
        }
        return requestedURL
      }
      /***/ },

    /***/ 8875:
    /***/ function (module, exports, __webpack_require__) {
      var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// addapted from the document.currentScript polyfill by Adam Miller
      // MIT license
      // source: https://github.com/amiller-gh/currentScript-polyfill

      // added support for Firefox https://bugzilla.mozilla.org/show_bug.cgi?id=1620505

      (function (root, factory) {
        if (true) {
          !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
          __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function'
            ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
          __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))
        } else {}
      }(typeof self !== 'undefined' ? self : this, function () {
        function getCurrentScript () {
          var descriptor = Object.getOwnPropertyDescriptor(document, 'currentScript')
          // for chrome
          if (!descriptor && 'currentScript' in document && document.currentScript) {
            return document.currentScript
          }

          // for other browsers with native support for currentScript
          if (descriptor && descriptor.get !== getCurrentScript && document.currentScript) {
            return document.currentScript
          }

          // IE 8-10 support script readyState
          // IE 11+ & Firefox support stack trace
          try {
            throw new Error()
          } catch (err) {
            // Find the second match for the "at" string to get file src url from stack.
            var ieStackRegExp = /.*at [^(]*\((.*):(.+):(.+)\)$/ig
            var ffStackRegExp = /@([^@]*):(\d+):(\d+)\s*$/ig
            var stackDetails = ieStackRegExp.exec(err.stack) || ffStackRegExp.exec(err.stack)
            var scriptLocation = (stackDetails && stackDetails[1]) || false
            var line = (stackDetails && stackDetails[2]) || false
            var currentLocation = document.location.href.replace(document.location.hash, '')
            var pageSource
            var inlineScriptSourceRegExp
            var inlineScriptSource
            var scripts = document.getElementsByTagName('script') // Live NodeList collection

            if (scriptLocation === currentLocation) {
              pageSource = document.documentElement.outerHTML
              inlineScriptSourceRegExp = new RegExp('(?:[^\\n]+?\\n){0,' + (line - 2) + '}[^<]*<script>([\\d\\D]*?)<\\/script>[\\d\\D]*', 'i')
              inlineScriptSource = pageSource.replace(inlineScriptSourceRegExp, '$1').trim()
            }

            for (var i = 0; i < scripts.length; i++) {
              // If ready state is interactive, return the script tag
              if (scripts[i].readyState === 'interactive') {
                return scripts[i]
              }

              // If src matches, return the script tag
              if (scripts[i].src === scriptLocation) {
                return scripts[i]
              }

              // If inline source matches, return the script tag
              if (
                scriptLocation === currentLocation &&
          scripts[i].innerHTML &&
          scripts[i].innerHTML.trim() === inlineScriptSource
              ) {
                return scripts[i]
              }
            }

            // If no match, return null
            return null
          }
        };

        return getCurrentScript
      }))
      /***/ },

    /***/ '8df4':
    /***/ function (module, exports, __webpack_require__) {
      'use strict'

      var Cancel = __webpack_require__('7a77')

      /**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
      function CancelToken (executor) {
        if (typeof executor !== 'function') {
          throw new TypeError('executor must be a function.')
        }

        var resolvePromise
        this.promise = new Promise(function promiseExecutor (resolve) {
          resolvePromise = resolve
        })

        var token = this
        executor(function cancel (message) {
          if (token.reason) {
            // Cancellation has already been requested
            return
          }

          token.reason = new Cancel(message)
          resolvePromise(token.reason)
        })
      }

      /**
 * Throws a `Cancel` if cancellation has been requested.
 */
      CancelToken.prototype.throwIfRequested = function throwIfRequested () {
        if (this.reason) {
          throw this.reason
        }
      }

      /**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
      CancelToken.source = function source () {
        var cancel
        var token = new CancelToken(function executor (c) {
          cancel = c
        })
        return {
          token: token,
          cancel: cancel
        }
      }

      module.exports = CancelToken
      /***/ },

    /***/ '956c':
    /***/ function (module, __webpack_exports__, __webpack_require__) {
      'use strict'
      /* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_2_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_VueDawa_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__('9b84')
      /* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_2_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_VueDawa_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0___default = /* #__PURE__ */__webpack_require__.n(_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_2_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_VueDawa_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__)
      /* unused harmony reexport * */
      /***/ },

    /***/ '9b84':
    /***/ function (module, exports, __webpack_require__) {

      // extracted by mini-css-extract-plugin

      /***/ },

    /***/ b50d:
    /***/ function (module, exports, __webpack_require__) {
      'use strict'

      var utils = __webpack_require__('c532')
      var settle = __webpack_require__('467f')
      var cookies = __webpack_require__('7aac')
      var buildURL = __webpack_require__('30b5')
      var buildFullPath = __webpack_require__('83b9')
      var parseHeaders = __webpack_require__('c345')
      var isURLSameOrigin = __webpack_require__('3934')
      var createError = __webpack_require__('2d83')

      module.exports = function xhrAdapter (config) {
        return new Promise(function dispatchXhrRequest (resolve, reject) {
          var requestData = config.data
          var requestHeaders = config.headers

          if (utils.isFormData(requestData)) {
            delete requestHeaders['Content-Type'] // Let the browser set it
          }

          var request = new XMLHttpRequest()

          // HTTP basic authentication
          if (config.auth) {
            var username = config.auth.username || ''
            var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : ''
            requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password)
          }

          var fullPath = buildFullPath(config.baseURL, config.url)
          request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true)

          // Set the request timeout in MS
          request.timeout = config.timeout

          // Listen for ready state
          request.onreadystatechange = function handleLoad () {
            if (!request || request.readyState !== 4) {
              return
            }

            // The request errored out and we didn't get a response, this will be
            // handled by onerror instead
            // With one exception: request that using file: protocol, most browsers
            // will return status as 0 even though it's a successful request
            if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
              return
            }

            // Prepare the response
            var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null
            var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response
            var response = {
              data: responseData,
              status: request.status,
              statusText: request.statusText,
              headers: responseHeaders,
              config: config,
              request: request
            }

            settle(resolve, reject, response)

            // Clean up request
            request = null
          }

          // Handle browser request cancellation (as opposed to a manual cancellation)
          request.onabort = function handleAbort () {
            if (!request) {
              return
            }

            reject(createError('Request aborted', config, 'ECONNABORTED', request))

            // Clean up request
            request = null
          }

          // Handle low level network errors
          request.onerror = function handleError () {
            // Real errors are hidden from us by the browser
            // onerror should only fire if it's a network error
            reject(createError('Network Error', config, null, request))

            // Clean up request
            request = null
          }

          // Handle timeout
          request.ontimeout = function handleTimeout () {
            var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded'
            if (config.timeoutErrorMessage) {
              timeoutErrorMessage = config.timeoutErrorMessage
            }
            reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
              request))

            // Clean up request
            request = null
          }

          // Add xsrf header
          // This is only done if running in a standard browser environment.
          // Specifically not if we're in a web worker, or react-native.
          if (utils.isStandardBrowserEnv()) {
            // Add xsrf header
            var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName
              ? cookies.read(config.xsrfCookieName)
              : undefined

            if (xsrfValue) {
              requestHeaders[config.xsrfHeaderName] = xsrfValue
            }
          }

          // Add headers to the request
          if ('setRequestHeader' in request) {
            utils.forEach(requestHeaders, function setRequestHeader (val, key) {
              if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
                // Remove Content-Type if data is undefined
                delete requestHeaders[key]
              } else {
                // Otherwise add header to the request
                request.setRequestHeader(key, val)
              }
            })
          }

          // Add withCredentials to request if needed
          if (!utils.isUndefined(config.withCredentials)) {
            request.withCredentials = !!config.withCredentials
          }

          // Add responseType to request if needed
          if (config.responseType) {
            try {
              request.responseType = config.responseType
            } catch (e) {
              // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
              // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
              if (config.responseType !== 'json') {
                throw e
              }
            }
          }

          // Handle progress if needed
          if (typeof config.onDownloadProgress === 'function') {
            request.addEventListener('progress', config.onDownloadProgress)
          }

          // Not all browsers support upload events
          if (typeof config.onUploadProgress === 'function' && request.upload) {
            request.upload.addEventListener('progress', config.onUploadProgress)
          }

          if (config.cancelToken) {
            // Handle cancellation
            config.cancelToken.promise.then(function onCanceled (cancel) {
              if (!request) {
                return
              }

              request.abort()
              reject(cancel)
              // Clean up request
              request = null
            })
          }

          if (!requestData) {
            requestData = null
          }

          // Send the request
          request.send(requestData)
        })
      }
      /***/ },

    /***/ bc3a:
    /***/ function (module, exports, __webpack_require__) {
      module.exports = __webpack_require__('cee4')
      /***/ },

    /***/ c345:
    /***/ function (module, exports, __webpack_require__) {
      'use strict'

      var utils = __webpack_require__('c532')

      // Headers whose duplicates are ignored by node
      // c.f. https://nodejs.org/api/http.html#http_message_headers
      var ignoreDuplicateOf = [
        'age', 'authorization', 'content-length', 'content-type', 'etag',
        'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
        'last-modified', 'location', 'max-forwards', 'proxy-authorization',
        'referer', 'retry-after', 'user-agent'
      ]

      /**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
      module.exports = function parseHeaders (headers) {
        var parsed = {}
        var key
        var val
        var i

        if (!headers) { return parsed }

        utils.forEach(headers.split('\n'), function parser (line) {
          i = line.indexOf(':')
          key = utils.trim(line.substr(0, i)).toLowerCase()
          val = utils.trim(line.substr(i + 1))

          if (key) {
            if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
              return
            }
            if (key === 'set-cookie') {
              parsed[key] = (parsed[key] ? parsed[key] : []).concat([val])
            } else {
              parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val
            }
          }
        })

        return parsed
      }
      /***/ },

    /***/ c401:
    /***/ function (module, exports, __webpack_require__) {
      'use strict'

      var utils = __webpack_require__('c532')

      /**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
      module.exports = function transformData (data, headers, fns) {
        /* eslint no-param-reassign:0 */
        utils.forEach(fns, function transform (fn) {
          data = fn(data, headers)
        })

        return data
      }
      /***/ },

    /***/ c532:
    /***/ function (module, exports, __webpack_require__) {
      'use strict'

      var bind = __webpack_require__('1d2b')

      /* global toString:true */

      // utils is a library of generic helper functions non-specific to axios

      var toString = Object.prototype.toString

      /**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
      function isArray (val) {
        return toString.call(val) === '[object Array]'
      }

      /**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
      function isUndefined (val) {
        return typeof val === 'undefined'
      }

      /**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
      function isBuffer (val) {
        return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) &&
    typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val)
      }

      /**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
      function isArrayBuffer (val) {
        return toString.call(val) === '[object ArrayBuffer]'
      }

      /**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
      function isFormData (val) {
        return (typeof FormData !== 'undefined') && (val instanceof FormData)
      }

      /**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
      function isArrayBufferView (val) {
        var result
        if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
          result = ArrayBuffer.isView(val)
        } else {
          result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer)
        }
        return result
      }

      /**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
      function isString (val) {
        return typeof val === 'string'
      }

      /**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
      function isNumber (val) {
        return typeof val === 'number'
      }

      /**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
      function isObject (val) {
        return val !== null && typeof val === 'object'
      }

      /**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
      function isPlainObject (val) {
        if (toString.call(val) !== '[object Object]') {
          return false
        }

        var prototype = Object.getPrototypeOf(val)
        return prototype === null || prototype === Object.prototype
      }

      /**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
      function isDate (val) {
        return toString.call(val) === '[object Date]'
      }

      /**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
      function isFile (val) {
        return toString.call(val) === '[object File]'
      }

      /**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
      function isBlob (val) {
        return toString.call(val) === '[object Blob]'
      }

      /**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
      function isFunction (val) {
        return toString.call(val) === '[object Function]'
      }

      /**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
      function isStream (val) {
        return isObject(val) && isFunction(val.pipe)
      }

      /**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
      function isURLSearchParams (val) {
        return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams
      }

      /**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
      function trim (str) {
        return str.replace(/^\s*/, '').replace(/\s*$/, '')
      }

      /**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
      function isStandardBrowserEnv () {
        if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
          return false
        }
        return (
          typeof window !== 'undefined' &&
    typeof document !== 'undefined'
        )
      }

      /**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
      function forEach (obj, fn) {
        // Don't bother if no value provided
        if (obj === null || typeof obj === 'undefined') {
          return
        }

        // Force an array if not already something iterable
        if (typeof obj !== 'object') {
          /* eslint no-param-reassign:0 */
          obj = [obj]
        }

        if (isArray(obj)) {
          // Iterate over array values
          for (var i = 0, l = obj.length; i < l; i++) {
            fn.call(null, obj[i], i, obj)
          }
        } else {
          // Iterate over object keys
          for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
              fn.call(null, obj[key], key, obj)
            }
          }
        }
      }

      /**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
      function merge (/* obj1, obj2, obj3, ... */) {
        var result = {}
        function assignValue (val, key) {
          if (isPlainObject(result[key]) && isPlainObject(val)) {
            result[key] = merge(result[key], val)
          } else if (isPlainObject(val)) {
            result[key] = merge({}, val)
          } else if (isArray(val)) {
            result[key] = val.slice()
          } else {
            result[key] = val
          }
        }

        for (var i = 0, l = arguments.length; i < l; i++) {
          forEach(arguments[i], assignValue)
        }
        return result
      }

      /**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
      function extend (a, b, thisArg) {
        forEach(b, function assignValue (val, key) {
          if (thisArg && typeof val === 'function') {
            a[key] = bind(val, thisArg)
          } else {
            a[key] = val
          }
        })
        return a
      }

      /**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
      function stripBOM (content) {
        if (content.charCodeAt(0) === 0xFEFF) {
          content = content.slice(1)
        }
        return content
      }

      module.exports = {
        isArray: isArray,
        isArrayBuffer: isArrayBuffer,
        isBuffer: isBuffer,
        isFormData: isFormData,
        isArrayBufferView: isArrayBufferView,
        isString: isString,
        isNumber: isNumber,
        isObject: isObject,
        isPlainObject: isPlainObject,
        isUndefined: isUndefined,
        isDate: isDate,
        isFile: isFile,
        isBlob: isBlob,
        isFunction: isFunction,
        isStream: isStream,
        isURLSearchParams: isURLSearchParams,
        isStandardBrowserEnv: isStandardBrowserEnv,
        forEach: forEach,
        merge: merge,
        extend: extend,
        trim: trim,
        stripBOM: stripBOM
      }
      /***/ },

    /***/ c8af:
    /***/ function (module, exports, __webpack_require__) {
      'use strict'

      var utils = __webpack_require__('c532')

      module.exports = function normalizeHeaderName (headers, normalizedName) {
        utils.forEach(headers, function processHeader (value, name) {
          if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
            headers[normalizedName] = value
            delete headers[name]
          }
        })
      }
      /***/ },

    /***/ cee4:
    /***/ function (module, exports, __webpack_require__) {
      'use strict'

      var utils = __webpack_require__('c532')
      var bind = __webpack_require__('1d2b')
      var Axios = __webpack_require__('0a06')
      var mergeConfig = __webpack_require__('4a7b')
      var defaults = __webpack_require__('2444')

      /**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
      function createInstance (defaultConfig) {
        var context = new Axios(defaultConfig)
        var instance = bind(Axios.prototype.request, context)

        // Copy axios.prototype to instance
        utils.extend(instance, Axios.prototype, context)

        // Copy context to instance
        utils.extend(instance, context)

        return instance
      }

      // Create the default instance to be exported
      var axios = createInstance(defaults)

      // Expose Axios class to allow class inheritance
      axios.Axios = Axios

      // Factory for creating new instances
      axios.create = function create (instanceConfig) {
        return createInstance(mergeConfig(axios.defaults, instanceConfig))
      }

      // Expose Cancel & CancelToken
      axios.Cancel = __webpack_require__('7a77')
      axios.CancelToken = __webpack_require__('8df4')
      axios.isCancel = __webpack_require__('2e67')

      // Expose all/spread
      axios.all = function all (promises) {
        return Promise.all(promises)
      }
      axios.spread = __webpack_require__('0df6')

      // Expose isAxiosError
      axios.isAxiosError = __webpack_require__('5f02')

      module.exports = axios

      // Allow use of default import syntax in TypeScript
      module.exports.default = axios
      /***/ },

    /***/ d925:
    /***/ function (module, exports, __webpack_require__) {
      'use strict'

      /**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
      module.exports = function isAbsoluteURL (url) {
        // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
        // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
        // by any combination of letters, digits, plus, period, or hyphen.
        return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url)
      }
      /***/ },

    /***/ df7c:
    /***/ function (module, exports, __webpack_require__) {
      /* WEBPACK VAR INJECTION */(function (process) { // .dirname, .basename, and .extname methods are extracted from Node.js v8.11.1,
        // backported and transplited with Babel, with backwards-compat fixes

        // Copyright Joyent, Inc. and other Node contributors.
        //
        // Permission is hereby granted, free of charge, to any person obtaining a
        // copy of this software and associated documentation files (the
        // "Software"), to deal in the Software without restriction, including
        // without limitation the rights to use, copy, modify, merge, publish,
        // distribute, sublicense, and/or sell copies of the Software, and to permit
        // persons to whom the Software is furnished to do so, subject to the
        // following conditions:
        //
        // The above copyright notice and this permission notice shall be included
        // in all copies or substantial portions of the Software.
        //
        // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
        // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
        // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
        // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
        // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
        // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
        // USE OR OTHER DEALINGS IN THE SOFTWARE.

        // resolves . and .. elements in a path array with directory names there
        // must be no slashes, empty elements, or device names (c:\) in the array
        // (so also no leading and trailing slashes - it does not distinguish
        // relative and absolute paths)
        function normalizeArray (parts, allowAboveRoot) {
          // if the path tries to go above the root, `up` ends up > 0
          var up = 0
          for (var i = parts.length - 1; i >= 0; i--) {
            var last = parts[i]
            if (last === '.') {
              parts.splice(i, 1)
            } else if (last === '..') {
              parts.splice(i, 1)
              up++
            } else if (up) {
              parts.splice(i, 1)
              up--
            }
          }

          // if the path is allowed to go above the root, restore leading ..s
          if (allowAboveRoot) {
            for (; up--; up) {
              parts.unshift('..')
            }
          }

          return parts
        }

        // path.resolve([from ...], to)
        // posix version
        exports.resolve = function () {
          var resolvedPath = ''
          var resolvedAbsolute = false

          for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
            var path = (i >= 0) ? arguments[i] : process.cwd()

            // Skip empty and invalid entries
            if (typeof path !== 'string') {
              throw new TypeError('Arguments to path.resolve must be strings')
            } else if (!path) {
              continue
            }

            resolvedPath = path + '/' + resolvedPath
            resolvedAbsolute = path.charAt(0) === '/'
          }

          // At this point the path should be resolved to a full absolute path, but
          // handle relative paths to be safe (might happen when process.cwd() fails)

          // Normalize the path
          resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function (p) {
            return !!p
          }), !resolvedAbsolute).join('/')

          return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.'
        }

        // path.normalize(path)
        // posix version
        exports.normalize = function (path) {
          var isAbsolute = exports.isAbsolute(path)
          var trailingSlash = substr(path, -1) === '/'

          // Normalize the path
          path = normalizeArray(filter(path.split('/'), function (p) {
            return !!p
          }), !isAbsolute).join('/')

          if (!path && !isAbsolute) {
            path = '.'
          }
          if (path && trailingSlash) {
            path += '/'
          }

          return (isAbsolute ? '/' : '') + path
        }

        // posix version
        exports.isAbsolute = function (path) {
          return path.charAt(0) === '/'
        }

        // posix version
        exports.join = function () {
          var paths = Array.prototype.slice.call(arguments, 0)
          return exports.normalize(filter(paths, function (p, index) {
            if (typeof p !== 'string') {
              throw new TypeError('Arguments to path.join must be strings')
            }
            return p
          }).join('/'))
        }

        // path.relative(from, to)
        // posix version
        exports.relative = function (from, to) {
          from = exports.resolve(from).substr(1)
          to = exports.resolve(to).substr(1)

          function trim (arr) {
            var start = 0
            for (; start < arr.length; start++) {
              if (arr[start] !== '') break
            }

            var end = arr.length - 1
            for (; end >= 0; end--) {
              if (arr[end] !== '') break
            }

            if (start > end) return []
            return arr.slice(start, end - start + 1)
          }

          var fromParts = trim(from.split('/'))
          var toParts = trim(to.split('/'))

          var length = Math.min(fromParts.length, toParts.length)
          var samePartsLength = length
          for (var i = 0; i < length; i++) {
            if (fromParts[i] !== toParts[i]) {
              samePartsLength = i
              break
            }
          }

          var outputParts = []
          for (var i = samePartsLength; i < fromParts.length; i++) {
            outputParts.push('..')
          }

          outputParts = outputParts.concat(toParts.slice(samePartsLength))

          return outputParts.join('/')
        }

        exports.sep = '/'
        exports.delimiter = ':'

        exports.dirname = function (path) {
          if (typeof path !== 'string') path = path + ''
          if (path.length === 0) return '.'
          var code = path.charCodeAt(0)
          var hasRoot = code === 47 /* / */
          var end = -1
          var matchedSlash = true
          for (var i = path.length - 1; i >= 1; --i) {
            code = path.charCodeAt(i)
            if (code === 47 /* / */) {
              if (!matchedSlash) {
                end = i
                break
              }
            } else {
              // We saw the first non-path separator
              matchedSlash = false
            }
          }

          if (end === -1) return hasRoot ? '/' : '.'
          if (hasRoot && end === 1) {
            // return '//';
            // Backwards-compat fix:
            return '/'
          }
          return path.slice(0, end)
        }

        function basename (path) {
          if (typeof path !== 'string') path = path + ''

          var start = 0
          var end = -1
          var matchedSlash = true
          var i

          for (i = path.length - 1; i >= 0; --i) {
            if (path.charCodeAt(i) === 47 /* / */) {
              // If we reached a path separator that was not part of a set of path
              // separators at the end of the string, stop now
              if (!matchedSlash) {
                start = i + 1
                break
              }
            } else if (end === -1) {
              // We saw the first non-path separator, mark this as the end of our
              // path component
              matchedSlash = false
              end = i + 1
            }
          }

          if (end === -1) return ''
          return path.slice(start, end)
        }

        // Uses a mixed approach for backwards-compatibility, as ext behavior changed
        // in new Node.js versions, so only basename() above is backported here
        exports.basename = function (path, ext) {
          var f = basename(path)
          if (ext && f.substr(-1 * ext.length) === ext) {
            f = f.substr(0, f.length - ext.length)
          }
          return f
        }

        exports.extname = function (path) {
          if (typeof path !== 'string') path = path + ''
          var startDot = -1
          var startPart = 0
          var end = -1
          var matchedSlash = true
          // Track the state of characters (if any) we see before our first dot and
          // after any path separator we find
          var preDotState = 0
          for (var i = path.length - 1; i >= 0; --i) {
            var code = path.charCodeAt(i)
            if (code === 47 /* / */) {
              // If we reached a path separator that was not part of a set of path
              // separators at the end of the string, stop now
              if (!matchedSlash) {
                startPart = i + 1
                break
              }
              continue
            }
            if (end === -1) {
              // We saw the first non-path separator, mark this as the end of our
              // extension
              matchedSlash = false
              end = i + 1
            }
            if (code === 46 /* . */) {
              // If this is our first dot, mark it as the start of our extension
              if (startDot === -1) { startDot = i } else if (preDotState !== 1) { preDotState = 1 }
            } else if (startDot !== -1) {
              // We saw a non-dot and non-path separator before our dot, so we should
              // have a good chance at having a non-empty extension
              preDotState = -1
            }
          }

          if (startDot === -1 || end === -1 ||
      // We saw a non-dot character immediately before the dot
      preDotState === 0 ||
      // The (right-most) trimmed path component is exactly '..'
      preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
            return ''
          }
          return path.slice(startDot, end)
        }

        function filter (xs, f) {
          if (xs.filter) return xs.filter(f)
          var res = []
          for (var i = 0; i < xs.length; i++) {
            if (f(xs[i], i, xs)) res.push(xs[i])
          }
          return res
        }

        // String.prototype.substr - negative index don't work in IE8
        var substr = 'ab'.substr(-1) === 'b'
          ? function (str, start, len) { return str.substr(start, len) }
          : function (str, start, len) {
            if (start < 0) start = str.length + start
            return str.substr(start, len)
          }
        /* WEBPACK VAR INJECTION */ }.call(this, __webpack_require__('4362')))
      /***/ },

    /***/ e683:
    /***/ function (module, exports, __webpack_require__) {
      'use strict'

      /**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
      module.exports = function combineURLs (baseURL, relativeURL) {
        return relativeURL
          ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
          : baseURL
      }
      /***/ },

    /***/ f6b4:
    /***/ function (module, exports, __webpack_require__) {
      'use strict'

      var utils = __webpack_require__('c532')

      function InterceptorManager () {
        this.handlers = []
      }

      /**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
      InterceptorManager.prototype.use = function use (fulfilled, rejected) {
        this.handlers.push({
          fulfilled: fulfilled,
          rejected: rejected
        })
        return this.handlers.length - 1
      }

      /**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
      InterceptorManager.prototype.eject = function eject (id) {
        if (this.handlers[id]) {
          this.handlers[id] = null
        }
      }

      /**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
      InterceptorManager.prototype.forEach = function forEach (fn) {
        utils.forEach(this.handlers, function forEachHandler (h) {
          if (h !== null) {
            fn(h)
          }
        })
      }

      module.exports = InterceptorManager
      /***/ },

    /***/ fb15:
    /***/ function (module, __webpack_exports__, __webpack_require__) {
      'use strict'
      // ESM COMPAT FLAG
      __webpack_require__.r(__webpack_exports__)

      // CONCATENATED MODULE: ./node_modules/@vue/cli-service/lib/commands/build/setPublicPath.js
      // This file is imported into lib/wc client bundles.

      if (typeof window !== 'undefined') {
        var currentScript = window.document.currentScript
        if (true) {
          var getCurrentScript = __webpack_require__('8875')
          currentScript = getCurrentScript()

          // for backward compatibility, because previously we directly included the polyfill
          if (!('currentScript' in document)) {
            Object.defineProperty(document, 'currentScript', { get: getCurrentScript })
          }
        }

        var src = currentScript && currentScript.src.match(/(.+\/)[^/]+\.js(\?.*)?$/)
        if (src) {
    __webpack_require__.p = src[1] // eslint-disable-line
        }
      }

      // Indicate to webpack that this file can be concatenated
      /* harmony default export */ var setPublicPath = (null)

      // CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"62411d1c-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/VueDawa.vue?vue&type=template&id=231e8566&
      var render = function () {
        var _vm = this; var _h = _vm.$createElement; var _c = _vm._self._c || _h; return _c('div', { ref: 'container', staticClass: 'autocomplete-container', class: _vm.containerClasses, attrs: { id: _vm.containerId } }, [_vm._t('label-top'), _c('input', { directives: [{ name: 'model', rawName: 'v-model', value: (_vm.terms), expression: 'terms' }, { name: 'focus', rawName: 'v-focus.lazy', value: (_vm.inputFocused), expression: 'inputFocused', modifiers: { lazy: true } }], ref: 'input', class: _vm.fieldClasses, attrs: { id: _vm.fieldId, type: 'search', placeholder: _vm.placeholder, name: _vm.fieldName, cursor: _vm.caretPos, disabled: _vm.disabled }, domProps: { value: (_vm.terms) }, on: { input: [function ($event) { if ($event.target.composing) { return }_vm.terms = $event.target.value }, function ($event) { return _vm.search() }], focus: function ($event) { return _vm.search() }, keydown: [function ($event) { if (!$event.type.indexOf('key') && _vm._k($event.keyCode, 'left', 37, $event.key, ['Left', 'ArrowLeft'])) { return null } if ('button' in $event && $event.button !== 0) { return null } return _vm.search() }, function ($event) { if (!$event.type.indexOf('key') && _vm._k($event.keyCode, 'right', 39, $event.key, ['Right', 'ArrowRight'])) { return null } if ('button' in $event && $event.button !== 2) { return null } return _vm.search() }, function ($event) { if (!$event.type.indexOf('key') && _vm._k($event.keyCode, 'down', 40, $event.key, ['Down', 'ArrowDown'])) { return null } return _vm.down() }, function ($event) { if (!$event.type.indexOf('key') && _vm._k($event.keyCode, 'up', 38, $event.key, ['Up', 'ArrowUp'])) { return null } return _vm.up() }, function ($event) { if (!$event.type.indexOf('key') && _vm._k($event.keyCode, 'esc', 27, $event.key, ['Esc', 'Escape'])) { return null } return _vm.emptyResultsList() }], keyup: function ($event) { if (!$event.type.indexOf('key') && _vm._k($event.keyCode, 'enter', 13, $event.key, 'Enter')) { return null } return _vm.enter() }, blur: function ($event) { _vm.inputFocused = false } } }), _vm._t('label-bottom'), (_vm.results &&
      _vm.results.length > 0) ? _c('ul', { ref: 'resultsList', staticClass: 'dawa-autocomplete-suggestions', class: _vm.listClasses, style: (_vm.resultsListStyle), attrs: { id: _vm.containerId + '_' + 'results' } }, _vm._l((_vm.results), function (result, index) { return _c('li', { key: index, ref: 'result_' + index, refInFor: true, staticClass: 'dawa-autocomplete-suggestion', class: _vm.computedListItemClasses(index), attrs: { id: 'result_' + index }, on: { click: function ($event) { $event.preventDefault(); return _vm.select(result) }, enter: function ($event) { $event.preventDefault(); return _vm.select(result) } } }, [_vm._v(' ' + _vm._s(result.oneLineAddress) + ' ')]) }), 0) : _vm._e()], 2)
      }
      var staticRenderFns = []

      // CONCATENATED MODULE: ./src/components/VueDawa.vue?vue&type=template&id=231e8566&

      // CONCATENATED MODULE: ./src/utils/utils.js

      var getInputSelection = function getInputSelection (el) {
        var start = 0
        var end = 0
        var normalizedValue
        var range
        var textInputRange
        var len
        var endRange

        if (typeof el.selectionStart === 'number' && typeof el.selectionEnd === 'number') {
          start = el.selectionStart
          end = el.selectionEnd
        } else {
          range = document.selection.createRange()

          if (range && range.parentElement() === el) {
            len = el.value.length
            normalizedValue = el.value.replace(/\r\n/g, '\n') // Create a working TextRange that lives only in the input

            textInputRange = el.createTextRange()
            textInputRange.moveToBookmark(range.getBookmark()) // Check if the start and end of the selection are at the very end
            // of the input, since moveStart/moveEnd doesn't return what we want
            // in those cases

            endRange = el.createTextRange()
            endRange.collapse(false)

            if (textInputRange.compareEndPoints('StartToEnd', endRange) > -1) {
              start = end = len
            } else {
              start = -textInputRange.moveStart('character', -len)
              start += normalizedValue.slice(0, start).split('\n').length - 1

              if (textInputRange.compareEndPoints('EndToEnd', endRange) > -1) {
                end = len
              } else {
                end = -textInputRange.moveEnd('character', -len)
                end += normalizedValue.slice(0, end).split('\n').length - 1
              }
            }
          }
        }

        return {
          start: start,
          end: end
        }
      }
      var formatParams = function formatParams (params) {
        return Object.keys(params).map(function (paramName) {
          var paramValue = params[paramName]
          return ''.concat(paramName, '=').concat(encodeURIComponent(paramValue))
        }).join('&')
      }
      var delay = function delay (ms) {
        return new Promise(function (resolve) {
          return setTimeout(resolve, ms)
        })
      }
      // EXTERNAL MODULE: ./node_modules/axios/index.js
      var axios = __webpack_require__('bc3a')
      var axios_default = /* #__PURE__ */__webpack_require__.n(axios)

      // CONCATENATED MODULE: ./src/services/dawa.service.js

      function _classCallCheck (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function') } }

      function _defineProperties (target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor) } }

      function _createClass (Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor }

      var defaultOptions = {
        params: {},
        minLength: 2,
        retryDelay: 500,
        renderCallback: function renderCallback () {
          /* eslint no-console: 0 */
          console.error('No renderCallback supplied')
        },
        initialRenderCallback: function initialRenderCallback () {
          /* eslint no-console: 0 */
          console.error('No initialRenderCallback supplied')
        },
        type: 'adresse',
        baseUrl: 'https://dawa.aws.dk',
        adgangsadresserOnly: false,
        stormodtagerpostnumre: true,
        supplerendebynavn: true,
        fuzzy: true,
        fetchImpl: function fetchImpl (url, params) {
          return axios_default.a.get(''.concat(url, '?').concat(formatParams(params)), {
            mode: 'no-cors'
          }).then(function (result) {
            return result.data
          })
        }
      }
      var dawa_service_DawaService = /* #__PURE__ */(function () {
        function DawaService (options, callback) {
          _classCallCheck(this, DawaService)

          this.options = Object.assign({}, defaultOptions, options || {})

          if (this.options.adgangsadresserOnly) {
            this.options.type = 'adgangsadresse'
          }

          this.state = {
            currentRequest: null,
            pendingRequest: null
          }
          this.selected = null
          this.setInitialRenderCallback(callback)
          this.setRenderCallback(callback)
          this.setSelectCallback(callback)
        }

        _createClass(DawaService, [{
          key: '_getAutocompleteResponse',
          value: function _getAutocompleteResponse (text, caretpos, skipVejnavn, adgangsadresseid, supplerendebynavn, stormodtagerpostnumre) {
            var params = Object.assign({}, {
              q: text,
              type: this.options.type,
              caretpos: caretpos,
              supplerendebynavn: supplerendebynavn,
              stormodtagerpostnumre: stormodtagerpostnumre,
              multilinje: true
            }, this.options.params)

            if (this.options.fuzzy) {
              params.fuzzy = ''
            }

            if (adgangsadresseid) {
              params.adgangsadresseid = adgangsadresseid
            }

            if (skipVejnavn) {
              params.startfra = 'adgangsadresse'
            }

            return this.options.fetchImpl(''.concat(this.options.baseUrl, '/autocomplete'), params)
          }
        }, {
          key: '_scheduleRequest',
          value: function _scheduleRequest (request) {
            if (this.state.currentRequest !== null) {
              this.state.pendingRequest = request
            } else {
              this.state.currentRequest = request

              this._executeRequest()
            }
          }
        }, {
          key: '_executeRequest',
          value: function _executeRequest () {
            var _this = this

            var request = this.state.currentRequest
            var adgangsadresseid = null
            var skipVejnavn = false
            var text, caretpos

            if (request.selected) {
              var item = request.selected

              if (item.type !== this.options.type) {
                adgangsadresseid = item.type === 'adgangsadresse' ? item.data.id : null
                skipVejnavn = item.type === 'vejnavn'
                text = item.tekst
                caretpos = item.caretpos
              } else {
                this.options.selectCallback(item)
                this.selected = item

                this._requestCompleted()
              }
            } else {
              text = request.text
              caretpos = request.caretpos
            }

            if (request.selectedId) {
              var params = {
                id: request.selectedId,
                type: this.options.type
              }
              return this.options.fetchImpl(''.concat(this.options.baseUrl, '/autocomplete'), params).then(function (result) {
                return _this._handleResponse(request, result)
              }, function (error) {
                return _this._handleFailedRequest(request, error)
              })
            } else if (request.selected || request.text && request.text.length >= this.options.minLength) {
              this._getAutocompleteResponse(text, caretpos, skipVejnavn, adgangsadresseid, this.options.supplerendebynavn, this.options.stormodtagerpostnumre).then(function (result) {
                return _this._handleResponse(request, result)
              }, function (error) {
                return _this._handleFailedRequest(request, error)
              })
            } else {
              this._handleResponse(request, [])
            }
          }
        }, {
          key: '_handleFailedRequest',
          value: function _handleFailedRequest (request, error) {
            var _this2 = this

            console.error('DAWA request failed', error)
            return delay(this.options.retryDelay).then(function () {
              if (!_this2.state.pendingRequest) {
                _this2._scheduleRequest(request)
              }

              _this2._requestCompleted()
            })
          }
        }, {
          key: '_handleResponse',
          value: function _handleResponse (request, result) {
            if (request.selected) {
              if (result.length === 1) {
                var item = result[0]

                if (item.type === this.options.type) {
                  this.options.selectCallback(item)
                } else {
                  if (!this.state.pendingRequest) {
                    this.state.pendingRequest = {
                      selected: item
                    }
                  }
                }
              } else if (this.options.renderCallback) {
                this.options.renderCallback(result)
              }
            } else if (request.selectedId) {
              if (result.length === 1) {
                this.selected = result[0]
                this.options.initialRenderCallback(result)
              }
            } else {
              if (this.options.renderCallback) {
                this.options.renderCallback(result)
              }
            }

            this._requestCompleted()
          }
        }, {
          key: '_requestCompleted',
          value: function _requestCompleted () {
            this.state.currentRequest = this.state.pendingRequest
            this.state.pendingRequest = null

            if (this.state.currentRequest) {
              this._executeRequest()
            }
          }
        }, {
          key: 'setRenderCallback',
          value: function setRenderCallback (renderCallback) {
            this.options.renderCallback = renderCallback
          }
        }, {
          key: 'setInitialRenderCallback',
          value: function setInitialRenderCallback (renderCallback) {
            this.options.initialRenderCallback = renderCallback
          }
        }, {
          key: 'setSelectCallback',
          value: function setSelectCallback (selectCallback) {
            this.options.selectCallback = selectCallback
          }
        }, {
          key: 'update',
          value: function update (text, caretpos) {
            var request = {
              text: text,
              caretpos: caretpos
            }

            this._scheduleRequest(request)
          }
        }, {
          key: 'select',
          value: function select (item) {
            var request = {
              selected: item
            }

            this._scheduleRequest(request)
          }
        }, {
          key: 'selectInitial',
          value: function selectInitial (id) {
            var request = {
              selectedId: id
            }

            this._scheduleRequest(request)
          }
        }])

        return DawaService
      }())
      // CONCATENATED MODULE: ./src/directives/focus.directive.js

      var focus_directive_focus = {
        inserted: function inserted (el, binding) {
          if (binding.value) el.focus(); else el.blur()
        },
        componentUpdated: function componentUpdated (el, binding) {
          if (binding.modifiers.lazy) {
            if (Boolean(binding.value) === Boolean(binding.oldValue)) {
              return
            }
          }

          if (binding.value) {
            el.focus()
          } else {
            el.blur()
          }
        }
      }
      var mixin = {
        directives: {
          focus: focus_directive_focus
        }
      }
      // CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/VueDawa.vue?vue&type=script&lang=js&
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //
      //

      function _createForOfIteratorHelper (o, allowArrayLike) { var it; if (typeof Symbol === 'undefined' || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === 'number') { if (it) o = it; var i = 0; var F = function F () {}; return { s: F, n: function n () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] } }, e: function e (_e) { throw _e }, f: F } } throw new TypeError('Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.') } var normalCompletion = true; var didErr = false; var err; return { s: function s () { it = o[Symbol.iterator]() }, n: function n () { var step = it.next(); normalCompletion = step.done; return step }, e: function e (_e2) { didErr = true; err = _e2 }, f: function f () { try { if (!normalCompletion && it.return != null) it.return() } finally { if (didErr) throw err } } } }

      function _unsupportedIterableToArray (o, minLen) { if (!o) return; if (typeof o === 'string') return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === 'Object' && o.constructor) n = o.constructor.name; if (n === 'Map' || n === 'Set') return Array.from(o); if (n === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen) }

      function _arrayLikeToArray (arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i] } return arr2 }

      /* harmony default export */ var VueDawavue_type_script_lang_js_ = ({
        name: 'VueDawa',
        mixins: [mixin],
        props: {
          // optional placeholder
          placeholder: {
            required: false,
            type: String,
            default: ''
          },
          // better targetting
          containerId: {
            required: true,
            type: String
          },
          containerClasses: {
            type: [String, Object],
            default: ''
          },
          // for improved accessibility when used with label
          fieldId: {
            required: true,
            type: String
          },
          fieldClasses: {
            type: [String, Object],
            default: ''
          },
          // for use with form validation
          fieldName: {
            type: String,
            default: ''
          },
          listClasses: {
            type: [String, Object],
            default: ''
          },
          listItemClasses: {
            type: [String, Object],
            default: ''
          },
          // describe the field (optional)
          label: {
            required: false,
            type: String,
            default: ''
          },
          // determines the initial value of the field
          val: {
            required: false,
            type: String,
            default: ''
          },
          addressId: {
            required: false,
            type: String,
            default: ''
          },
          options: {
            type: Object,
            required: false,
            default: function _default () {
              return {}
            }
          },
          disabled: {
            type: Boolean,
            required: false,
            default: false
          },
          showMax: {
            type: Number,
            required: false,
            default: 5
          },
          resultsListStyle: {
            type: Object,
            default: function _default () {
              return {}
            }
          },
          listScrollBehavior: {
            type: Object,
            default: function _default () {
              return {
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
              }
            }
          }
        },
        data: function data () {
          return {
            results: [],
            selectedResult: null,
            terms: this.val || '',
            defaultCaretPos: 2,
            caretPos: 2,
            oldCaretPos: null,
            dawaService: null,
            inputFocused: false,
            currentIndex: 0,
            initActions: true,
            listHeight: 0
          }
        },
        computed: {
          maxResults: function maxResults () {
            return this.showMax || this.results.length
          }
        },
        watch: {
          val: function val (newVal) {
            this.terms = newVal
            this.setCaretPosition(this.caretPos)
          },
          terms: function terms (newVal) {
            this.$emit('inputChanged', newVal)
          },
          listHeight: function listHeight (newVal) {
            this.$emit('listHeightUpdated', newVal)
          },
          results: {
            handler: function handler (newVal) {
              if (this.addressId) {
                this.select(newVal[0])
              }
            },
            immediate: true
          }
        },
        created: function created () {
          this.dawaService = new dawa_service_DawaService(this.options, this.handleResults)

          if (this.addressId && this.initActions) {
            this.dawaService.selectInitial(this.addressId)
            this.initActions = false
          }
        },
        mounted: function mounted () {
          document.addEventListener('click', this.handleClickOutside, true)
          document.addEventListener('focus', this.handleClickOutside, true)
        },
        beforeDestroy: function beforeDestroy () {
          document.removeEventListener('click', this.handleClickOutside, true)
          document.removeEventListener('focus', this.handleClickOutside, true)
        },
        methods: {
          computedListItemClasses: function computedListItemClasses (index) {
            return Object.assign({
              active: this.isActive(index)
            }, this.listItemClasses)
          },
          search: function search () {
            var _this = this

            this.inputFocused = true
            this.currentIndex = 0

            if (this.terms && this.terms.length < this.dawaService.options.minLength) {
              this.$set(this, 'results', [])
              this.listHeight = 0
            }

            this.getCaretPosition().then(function () {
              if (_this.caretPos !== _this.oldCaretPos && _this.terms && _this.terms.length >= _this.dawaService.options.minLength) {
                // caret position is now updated, proceed with search
                _this.dawaService.update(_this.terms, _this.caretPos)
              }
            })
          },
          handleResults: function handleResults (response) {
            var _this2 = this

            this.emptyResultsList()
            var results = []

            if (response.length) {
              var _iterator = _createForOfIteratorHelper(response)
              var _step

              try {
                for (_iterator.s(); !(_step = _iterator.n()).done;) {
                  var item = _step.value
                  var rows = item.forslagstekst.split('\n')
                  rows = rows.map(function (row) {
                    return row.replace(/ /g, '\xA0')
                  })
                  item.oneLineAddress = rows.join(', ')
                  results.push(item)
                }
              } catch (err) {
                _iterator.e(err)
              } finally {
                _iterator.f()
              }
            }

            var max = this.showMax ? this.showMax : results.length
            this.$set(this, 'results', results.slice(0, max))
            this.$nextTick(function () {
              var resultsList = document.getElementById(_this2.containerId + '_' + 'results')

              if (resultsList) {
                _this2.listHeight = resultsList.getBoundingClientRect().height
              }
            })
          },
          select: function select (item) {
            if (!item) {
              return
            }

            this.$emit('select', item)
            this.$set(this, 'selectedResult', item)
            this.terms = this.selectedResult.tekst
            this.caretPos = item.caretpos
            this.inputFocused = true
            this.setCaretPosition(this.caretPos)
            this.currentIndex = 0
            this.emptyResultsList() // results aren't yet narrowed down to a full address, search again

            if (this.terms.length >= this.defaultCaretPos && this.caretPos !== this.terms.length || item.type !== this.dawaService.options.type || this.results.length > 1) {
              this.dawaService.select(item)
            }
          },
          enter: function enter () {
            this.select(this.results[this.currentIndex])
          },
          // When up pressed while suggestions are open
          up: function up () {
            if (this.currentIndex > 0) {
              this.currentIndex--
            }

            this.scrollToResult(this.currentIndex)
          },
          // When up pressed while suggestions are open
          down: function down () {
            if (this.currentIndex < this.results.length - 1) {
              this.currentIndex++
            }

            this.scrollToResult(this.currentIndex)
          },
          scrollToResult: function scrollToResult (index) {
            var el = document.getElementById('result_'.concat(index))
            el.scrollIntoView(this.listScrollBehavior)
          },
          // For highlighting element
          isActive: function isActive (index) {
            return index === this.currentIndex
          },
          emptyResultsList: function emptyResultsList () {
            this.listHeight = 0
            this.$set(this, 'results', [])
          },
          getCaretPosition: function getCaretPosition () {
            var _this3 = this

            return new Promise(function (resolve) {
              setTimeout(function () {
                var position = getInputSelection(document.getElementById(_this3.fieldId)).start
                _this3.oldCaretPos = _this3.caretPos
                _this3.caretPos = position > _this3.defaultCaretPos ? position : _this3.defaultCaretPos
                resolve()
              }, 5)
            })
          },
          setCaretPosition: function setCaretPosition (pos) {
            var elem = document.getElementById(this.fieldId)

            if (elem.setSelectionRange) {
              this.getCaretPosition()
              elem.setSelectionRange(pos, pos)
            } else if (elem.createTextRange) {
              var range = elem.createTextRange()
              range.collapse(true)
              range.moveEnd('character', pos)
              range.moveStart('character', pos)
              range.select()
            }
          },
          handleClickOutside: function handleClickOutside (e) {
            var el = this.$refs.container

            if (e.target !== this.$refs.input && e.target !== this.$refs.resultsList || !el.contains(e.target)) {
              this.emptyResultsList()
            }
          }
        }
      })
      // CONCATENATED MODULE: ./src/components/VueDawa.vue?vue&type=script&lang=js&
      /* harmony default export */ var components_VueDawavue_type_script_lang_js_ = (VueDawavue_type_script_lang_js_)
      // EXTERNAL MODULE: ./src/components/VueDawa.vue?vue&type=style&index=0&lang=css&
      var VueDawavue_type_style_index_0_lang_css_ = __webpack_require__('956c')

      // CONCATENATED MODULE: ./node_modules/vue-loader/lib/runtime/componentNormalizer.js
      /* globals __VUE_SSR_CONTEXT__ */

      // IMPORTANT: Do NOT use ES2015 features in this file (except for modules).
      // This module is a runtime utility for cleaner component module output and will
      // be included in the final webpack user bundle.

      function normalizeComponent (
        scriptExports,
        render,
        staticRenderFns,
        functionalTemplate,
        injectStyles,
        scopeId,
        moduleIdentifier, /* server only */
        shadowMode /* vue-cli only */
      ) {
        // Vue.extend constructor export interop
        var options = typeof scriptExports === 'function'
          ? scriptExports.options
          : scriptExports

        // render functions
        if (render) {
          options.render = render
          options.staticRenderFns = staticRenderFns
          options._compiled = true
        }

        // functional template
        if (functionalTemplate) {
          options.functional = true
        }

        // scopedId
        if (scopeId) {
          options._scopeId = 'data-v-' + scopeId
        }

        var hook
        if (moduleIdentifier) { // server build
          hook = function (context) {
            // 2.3 injection
            context =
        context || // cached call
        (this.$vnode && this.$vnode.ssrContext) || // stateful
        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
              context = __VUE_SSR_CONTEXT__
            }
            // inject component styles
            if (injectStyles) {
              injectStyles.call(this, context)
            }
            // register component module identifier for async chunk inferrence
            if (context && context._registeredComponents) {
              context._registeredComponents.add(moduleIdentifier)
            }
          }
          // used by ssr in case component is cached and beforeCreate
          // never gets called
          options._ssrRegister = hook
        } else if (injectStyles) {
          hook = shadowMode
            ? function () {
              injectStyles.call(
                this,
                (options.functional ? this.parent : this).$root.$options.shadowRoot
              )
            }
            : injectStyles
        }

        if (hook) {
          if (options.functional) {
            // for template-only hot-reload because in that case the render fn doesn't
            // go through the normalizer
            options._injectStyles = hook
            // register for functional component in vue file
            var originalRender = options.render
            options.render = function renderWithStyleInjection (h, context) {
              hook.call(context)
              return originalRender(h, context)
            }
          } else {
            // inject component registration as beforeCreate hook
            var existing = options.beforeCreate
            options.beforeCreate = existing
              ? [].concat(existing, hook)
              : [hook]
          }
        }

        return {
          exports: scriptExports,
          options: options
        }
      }

      // CONCATENATED MODULE: ./src/components/VueDawa.vue

      /* normalize component */

      var component = normalizeComponent(
        components_VueDawavue_type_script_lang_js_,
        render,
        staticRenderFns,
        false,
        null,
        null,
        null

      )

      /* harmony default export */ var VueDawa = (component.exports)
      // CONCATENATED MODULE: ./node_modules/@vue/cli-service/lib/commands/build/entry-lib.js

      /* harmony default export */ var entry_lib = __webpack_exports__.default = (VueDawa)
      /***/ }

    /******/ }).default
// # sourceMappingURL=vue-dawa.common.js.map
