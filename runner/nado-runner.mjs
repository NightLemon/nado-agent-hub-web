#!/usr/bin/env node
import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/.pnpm/ws@8.21.3/node_modules/ws/lib/constants.js
var require_constants = __commonJS({
  "node_modules/.pnpm/ws@8.21.3/node_modules/ws/lib/constants.js"(exports, module) {
    "use strict";
    var BINARY_TYPES = ["nodebuffer", "arraybuffer", "fragments"];
    var hasBlob = typeof Blob !== "undefined";
    if (hasBlob) BINARY_TYPES.push("blob");
    module.exports = {
      BINARY_TYPES,
      CLOSE_TIMEOUT: 3e4,
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      hasBlob,
      kForOnEventAttribute: Symbol("kIsForOnEventAttribute"),
      kListener: Symbol("kListener"),
      kStatusCode: Symbol("status-code"),
      kWebSocket: Symbol("websocket"),
      NOOP: () => {
      }
    };
  }
});

// node_modules/.pnpm/ws@8.21.3/node_modules/ws/lib/buffer-util.js
var require_buffer_util = __commonJS({
  "node_modules/.pnpm/ws@8.21.3/node_modules/ws/lib/buffer-util.js"(exports, module) {
    "use strict";
    var { EMPTY_BUFFER } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    function concat(list, totalLength) {
      if (list.length === 0) return EMPTY_BUFFER;
      if (list.length === 1) return list[0];
      const target = Buffer.allocUnsafe(totalLength);
      let offset = 0;
      for (let i = 0; i < list.length; i++) {
        const buf = list[i];
        target.set(buf, offset);
        offset += buf.length;
      }
      if (offset < totalLength) {
        return new FastBuffer(target.buffer, target.byteOffset, offset);
      }
      return target;
    }
    function _mask(source, mask, output, offset, length) {
      for (let i = 0; i < length; i++) {
        output[offset + i] = source[i] ^ mask[i & 3];
      }
    }
    function _unmask(buffer, mask) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] ^= mask[i & 3];
      }
    }
    function toArrayBuffer(buf) {
      if (buf.length === buf.buffer.byteLength) {
        return buf.buffer;
      }
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
    }
    function toBuffer(data) {
      toBuffer.readOnly = true;
      if (Buffer.isBuffer(data)) return data;
      let buf;
      if (data instanceof ArrayBuffer) {
        buf = new FastBuffer(data);
      } else if (ArrayBuffer.isView(data)) {
        buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
      } else {
        buf = Buffer.from(data);
        toBuffer.readOnly = false;
      }
      return buf;
    }
    module.exports = {
      concat,
      mask: _mask,
      toArrayBuffer,
      toBuffer,
      unmask: _unmask
    };
    if (!process.env.WS_NO_BUFFER_UTIL) {
      try {
        const bufferUtil = __require("bufferutil");
        module.exports.mask = function(source, mask, output, offset, length) {
          if (length < 48) _mask(source, mask, output, offset, length);
          else bufferUtil.mask(source, mask, output, offset, length);
        };
        module.exports.unmask = function(buffer, mask) {
          if (buffer.length < 32) _unmask(buffer, mask);
          else bufferUtil.unmask(buffer, mask);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/.pnpm/ws@8.21.3/node_modules/ws/lib/limiter.js
var require_limiter = __commonJS({
  "node_modules/.pnpm/ws@8.21.3/node_modules/ws/lib/limiter.js"(exports, module) {
    "use strict";
    var kDone = Symbol("kDone");
    var kRun = Symbol("kRun");
    var Limiter = class {
      /**
       * Creates a new `Limiter`.
       *
       * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
       *     to run concurrently
       */
      constructor(concurrency) {
        this[kDone] = () => {
          this.pending--;
          this[kRun]();
        };
        this.concurrency = concurrency || Infinity;
        this.jobs = [];
        this.pending = 0;
      }
      /**
       * Adds a job to the queue.
       *
       * @param {Function} job The job to run
       * @public
       */
      add(job) {
        this.jobs.push(job);
        this[kRun]();
      }
      /**
       * Removes a job from the queue and runs it if possible.
       *
       * @private
       */
      [kRun]() {
        if (this.pending === this.concurrency) return;
        if (this.jobs.length) {
          const job = this.jobs.shift();
          this.pending++;
          job(this[kDone]);
        }
      }
    };
    module.exports = Limiter;
  }
});

// node_modules/.pnpm/ws@8.21.3/node_modules/ws/lib/permessage-deflate.js
var require_permessage_deflate = __commonJS({
  "node_modules/.pnpm/ws@8.21.3/node_modules/ws/lib/permessage-deflate.js"(exports, module) {
    "use strict";
    var zlib = __require("zlib");
    var bufferUtil = require_buffer_util();
    var Limiter = require_limiter();
    var { kStatusCode } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    var TRAILER = Buffer.from([0, 0, 255, 255]);
    var kPerMessageDeflate = Symbol("permessage-deflate");
    var kTotalLength = Symbol("total-length");
    var kCallback = Symbol("callback");
    var kBuffers = Symbol("buffers");
    var kError = Symbol("error");
    var zlibLimiter;
    var PerMessageDeflate2 = class {
      /**
       * Creates a PerMessageDeflate instance.
       *
       * @param {Object} [options] Configuration options
       * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
       *     for, or request, a custom client window size
       * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
       *     acknowledge disabling of client context takeover
       * @param {Number} [options.concurrencyLimit=10] The number of concurrent
       *     calls to zlib
       * @param {Boolean} [options.isServer=false] Create the instance in either
       *     server or client mode
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
       *     use of a custom server window size
       * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
       *     disabling of server context takeover
       * @param {Number} [options.threshold=1024] Size (in bytes) below which
       *     messages should not be compressed if context takeover is disabled
       * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
       *     deflate
       * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
       *     inflate
       */
      constructor(options) {
        this._options = options || {};
        this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
        this._maxPayload = this._options.maxPayload | 0;
        this._isServer = !!this._options.isServer;
        this._deflate = null;
        this._inflate = null;
        this.params = null;
        if (!zlibLimiter) {
          const concurrency = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
          zlibLimiter = new Limiter(concurrency);
        }
      }
      /**
       * @type {String}
       */
      static get extensionName() {
        return "permessage-deflate";
      }
      /**
       * Create an extension negotiation offer.
       *
       * @return {Object} Extension parameters
       * @public
       */
      offer() {
        const params = {};
        if (this._options.serverNoContextTakeover) {
          params.server_no_context_takeover = true;
        }
        if (this._options.clientNoContextTakeover) {
          params.client_no_context_takeover = true;
        }
        if (this._options.serverMaxWindowBits) {
          params.server_max_window_bits = this._options.serverMaxWindowBits;
        }
        if (this._options.clientMaxWindowBits) {
          params.client_max_window_bits = this._options.clientMaxWindowBits;
        } else if (this._options.clientMaxWindowBits == null) {
          params.client_max_window_bits = true;
        }
        return params;
      }
      /**
       * Accept an extension negotiation offer/response.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Object} Accepted configuration
       * @public
       */
      accept(configurations) {
        configurations = this.normalizeParams(configurations);
        this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
        return this.params;
      }
      /**
       * Releases all resources used by the extension.
       *
       * @public
       */
      cleanup() {
        if (this._inflate) {
          this._inflate.close();
          this._inflate = null;
        }
        if (this._deflate) {
          const callback = this._deflate[kCallback];
          this._deflate.close();
          this._deflate = null;
          if (callback) {
            callback(
              new Error(
                "The deflate stream was closed while data was being processed"
              )
            );
          }
        }
      }
      /**
       *  Accept an extension negotiation offer.
       *
       * @param {Array} offers The extension negotiation offers
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsServer(offers) {
        const opts = this._options;
        const accepted = offers.find((params) => {
          if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && (typeof params.client_max_window_bits === "number" ? opts.clientMaxWindowBits > params.client_max_window_bits : !params.client_max_window_bits)) {
            return false;
          }
          return true;
        });
        if (!accepted) {
          throw new Error("None of the extension offers can be accepted");
        }
        if (opts.serverNoContextTakeover) {
          accepted.server_no_context_takeover = true;
        }
        if (opts.clientNoContextTakeover) {
          accepted.client_no_context_takeover = true;
        }
        if (typeof opts.serverMaxWindowBits === "number") {
          accepted.server_max_window_bits = opts.serverMaxWindowBits;
        }
        if (typeof opts.clientMaxWindowBits === "number") {
          accepted.client_max_window_bits = opts.clientMaxWindowBits;
        } else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) {
          delete accepted.client_max_window_bits;
        }
        return accepted;
      }
      /**
       * Accept the extension negotiation response.
       *
       * @param {Array} response The extension negotiation response
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsClient(response) {
        const params = response[0];
        if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
          throw new Error('Unexpected parameter "client_no_context_takeover"');
        }
        if (!params.client_max_window_bits) {
          if (typeof this._options.clientMaxWindowBits === "number") {
            params.client_max_window_bits = this._options.clientMaxWindowBits;
          }
        } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) {
          throw new Error(
            'Unexpected or invalid parameter "client_max_window_bits"'
          );
        }
        return params;
      }
      /**
       * Normalize parameters.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Array} The offers/response with normalized parameters
       * @private
       */
      normalizeParams(configurations) {
        configurations.forEach((params) => {
          Object.keys(params).forEach((key) => {
            let value = params[key];
            if (value.length > 1) {
              throw new Error(`Parameter "${key}" must have only a single value`);
            }
            value = value[0];
            if (key === "client_max_window_bits") {
              if (value !== true) {
                const num = +value;
                if (!Number.isInteger(num) || num < 8 || num > 15) {
                  throw new TypeError(
                    `Invalid value for parameter "${key}": ${value}`
                  );
                }
                value = num;
              } else if (!this._isServer) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else if (key === "server_max_window_bits") {
              const num = +value;
              if (!Number.isInteger(num) || num < 8 || num > 15) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
              value = num;
            } else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
              if (value !== true) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else {
              throw new Error(`Unknown parameter "${key}"`);
            }
            params[key] = value;
          });
        });
        return configurations;
      }
      /**
       * Decompress data. Concurrency limited.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      decompress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._decompress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Compress data. Concurrency limited.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      compress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._compress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Decompress data.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _decompress(data, fin, callback) {
        const endpoint = this._isServer ? "client" : "server";
        if (!this._inflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._inflate = zlib.createInflateRaw({
            ...this._options.zlibInflateOptions,
            windowBits
          });
          this._inflate[kPerMessageDeflate] = this;
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
          this._inflate.on("error", inflateOnError);
          this._inflate.on("data", inflateOnData);
        }
        this._inflate[kCallback] = callback;
        this._inflate.write(data);
        if (fin) this._inflate.write(TRAILER);
        this._inflate.flush(() => {
          const err = this._inflate[kError];
          if (err) {
            this._inflate.close();
            this._inflate = null;
            callback(err);
            return;
          }
          const data2 = bufferUtil.concat(
            this._inflate[kBuffers],
            this._inflate[kTotalLength]
          );
          if (this._inflate._readableState.endEmitted) {
            this._inflate.close();
            this._inflate = null;
          } else {
            this._inflate[kTotalLength] = 0;
            this._inflate[kBuffers] = [];
            if (fin && this.params[`${endpoint}_no_context_takeover`]) {
              this._inflate.reset();
            }
          }
          callback(null, data2);
        });
      }
      /**
       * Compress data.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _compress(data, fin, callback) {
        const endpoint = this._isServer ? "server" : "client";
        if (!this._deflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._deflate = zlib.createDeflateRaw({
            ...this._options.zlibDeflateOptions,
            windowBits
          });
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          this._deflate.on("data", deflateOnData);
        }
        this._deflate[kCallback] = callback;
        this._deflate.write(data);
        this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
          if (!this._deflate) {
            return;
          }
          let data2 = bufferUtil.concat(
            this._deflate[kBuffers],
            this._deflate[kTotalLength]
          );
          if (fin) {
            data2 = new FastBuffer(data2.buffer, data2.byteOffset, data2.length - 4);
          }
          this._deflate[kCallback] = null;
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          if (fin && this.params[`${endpoint}_no_context_takeover`]) {
            this._deflate.reset();
          }
          callback(null, data2);
        });
      }
    };
    module.exports = PerMessageDeflate2;
    function deflateOnData(chunk) {
      this[kBuffers].push(chunk);
      this[kTotalLength] += chunk.length;
    }
    function inflateOnData(chunk) {
      this[kTotalLength] += chunk.length;
      if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
        this[kBuffers].push(chunk);
        return;
      }
      this[kError] = new RangeError("Max payload size exceeded");
      this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
      this[kError][kStatusCode] = 1009;
      this.removeListener("data", inflateOnData);
      this.reset();
    }
    function inflateOnError(err) {
      this[kPerMessageDeflate]._inflate = null;
      if (this[kError]) {
        this[kCallback](this[kError]);
        return;
      }
      err[kStatusCode] = 1007;
      this[kCallback](err);
    }
  }
});

// node_modules/.pnpm/ws@8.21.3/node_modules/ws/lib/validation.js
var require_validation = __commonJS({
  "node_modules/.pnpm/ws@8.21.3/node_modules/ws/lib/validation.js"(exports, module) {
    "use strict";
    var { isUtf8 } = __require("buffer");
    var { hasBlob } = require_constants();
    var tokenChars = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 0 - 15
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 16 - 31
      0,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      0,
      // 32 - 47
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      // 48 - 63
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 64 - 79
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      1,
      1,
      // 80 - 95
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 96 - 111
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      0,
      1,
      0
      // 112 - 127
    ];
    function isValidStatusCode(code) {
      return code >= 1e3 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3e3 && code <= 4999;
    }
    function _isValidUTF8(buf) {
      const len = buf.length;
      let i = 0;
      while (i < len) {
        if ((buf[i] & 128) === 0) {
          i++;
        } else if ((buf[i] & 224) === 192) {
          if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
            return false;
          }
          i += 2;
        } else if ((buf[i] & 240) === 224) {
          if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || // Overlong
          buf[i] === 237 && (buf[i + 1] & 224) === 160) {
            return false;
          }
          i += 3;
        } else if ((buf[i] & 248) === 240) {
          if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || // Overlong
          buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
            return false;
          }
          i += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    function isBlob(value) {
      return hasBlob && typeof value === "object" && typeof value.arrayBuffer === "function" && typeof value.type === "string" && typeof value.stream === "function" && (value[Symbol.toStringTag] === "Blob" || value[Symbol.toStringTag] === "File");
    }
    module.exports = {
      isBlob,
      isValidStatusCode,
      isValidUTF8: _isValidUTF8,
      tokenChars
    };
    if (isUtf8) {
      module.exports.isValidUTF8 = function(buf) {
        return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const isValidUTF8 = __require("utf-8-validate");
        module.exports.isValidUTF8 = function(buf) {
          return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/.pnpm/ws@8.21.3/node_modules/ws/lib/receiver.js
var require_receiver = __commonJS({
  "node_modules/.pnpm/ws@8.21.3/node_modules/ws/lib/receiver.js"(exports, module) {
    "use strict";
    var { Writable } = __require("stream");
    var PerMessageDeflate2 = require_permessage_deflate();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      kStatusCode,
      kWebSocket
    } = require_constants();
    var { concat, toArrayBuffer, unmask } = require_buffer_util();
    var { isValidStatusCode, isValidUTF8 } = require_validation();
    var FastBuffer = Buffer[Symbol.species];
    var GET_INFO = 0;
    var GET_PAYLOAD_LENGTH_16 = 1;
    var GET_PAYLOAD_LENGTH_64 = 2;
    var GET_MASK = 3;
    var GET_DATA = 4;
    var INFLATING = 5;
    var DEFER_EVENT = 6;
    var Receiver2 = class extends Writable {
      /**
       * Creates a Receiver instance.
       *
       * @param {Object} [options] Options object
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {String} [options.binaryType=nodebuffer] The type for binary data
       * @param {Object} [options.extensions] An object containing the negotiated
       *     extensions
       * @param {Boolean} [options.isServer=false] Specifies whether to operate in
       *     client or server mode
       * @param {Number} [options.maxBufferedChunks=0] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=0] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       */
      constructor(options = {}) {
        super();
        this._allowSynchronousEvents = options.allowSynchronousEvents !== void 0 ? options.allowSynchronousEvents : true;
        this._binaryType = options.binaryType || BINARY_TYPES[0];
        this._extensions = options.extensions || {};
        this._isServer = !!options.isServer;
        this._maxBufferedChunks = options.maxBufferedChunks | 0;
        this._maxFragments = options.maxFragments | 0;
        this._maxPayload = options.maxPayload | 0;
        this._skipUTF8Validation = !!options.skipUTF8Validation;
        this[kWebSocket] = void 0;
        this._bufferedBytes = 0;
        this._buffers = [];
        this._compressed = false;
        this._payloadLength = 0;
        this._mask = void 0;
        this._fragmented = 0;
        this._masked = false;
        this._fin = false;
        this._opcode = 0;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._numFragments = 0;
        this._fragments = [];
        this._errored = false;
        this._loop = false;
        this._state = GET_INFO;
      }
      /**
       * Implements `Writable.prototype._write()`.
       *
       * @param {Buffer} chunk The chunk of data to write
       * @param {String} encoding The character encoding of `chunk`
       * @param {Function} cb Callback
       * @private
       */
      _write(chunk, encoding, cb) {
        if (this._opcode === 8 && this._state == GET_INFO) return cb();
        if (this._maxBufferedChunks > 0 && this._buffers.length >= this._maxBufferedChunks) {
          cb(
            this.createError(
              RangeError,
              "Too many buffered chunks",
              false,
              1008,
              "WS_ERR_TOO_MANY_BUFFERED_PARTS"
            )
          );
          return;
        }
        this._bufferedBytes += chunk.length;
        this._buffers.push(chunk);
        this.startLoop(cb);
      }
      /**
       * Consumes `n` bytes from the buffered data.
       *
       * @param {Number} n The number of bytes to consume
       * @return {Buffer} The consumed bytes
       * @private
       */
      consume(n) {
        this._bufferedBytes -= n;
        if (n === this._buffers[0].length) return this._buffers.shift();
        if (n < this._buffers[0].length) {
          const buf = this._buffers[0];
          this._buffers[0] = new FastBuffer(
            buf.buffer,
            buf.byteOffset + n,
            buf.length - n
          );
          return new FastBuffer(buf.buffer, buf.byteOffset, n);
        }
        const dst = Buffer.allocUnsafe(n);
        do {
          const buf = this._buffers[0];
          const offset = dst.length - n;
          if (n >= buf.length) {
            dst.set(this._buffers.shift(), offset);
          } else {
            dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
            this._buffers[0] = new FastBuffer(
              buf.buffer,
              buf.byteOffset + n,
              buf.length - n
            );
          }
          n -= buf.length;
        } while (n > 0);
        return dst;
      }
      /**
       * Starts the parsing loop.
       *
       * @param {Function} cb Callback
       * @private
       */
      startLoop(cb) {
        this._loop = true;
        do {
          switch (this._state) {
            case GET_INFO:
              this.getInfo(cb);
              break;
            case GET_PAYLOAD_LENGTH_16:
              this.getPayloadLength16(cb);
              break;
            case GET_PAYLOAD_LENGTH_64:
              this.getPayloadLength64(cb);
              break;
            case GET_MASK:
              this.getMask();
              break;
            case GET_DATA:
              this.getData(cb);
              break;
            case INFLATING:
            case DEFER_EVENT:
              this._loop = false;
              return;
          }
        } while (this._loop);
        if (!this._errored) cb();
      }
      /**
       * Reads the first two bytes of a frame.
       *
       * @param {Function} cb Callback
       * @private
       */
      getInfo(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        const buf = this.consume(2);
        if ((buf[0] & 48) !== 0) {
          const error = this.createError(
            RangeError,
            "RSV2 and RSV3 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_2_3"
          );
          cb(error);
          return;
        }
        const compressed = (buf[0] & 64) === 64;
        if (compressed && !this._extensions[PerMessageDeflate2.extensionName]) {
          const error = this.createError(
            RangeError,
            "RSV1 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_1"
          );
          cb(error);
          return;
        }
        this._fin = (buf[0] & 128) === 128;
        this._opcode = buf[0] & 15;
        this._payloadLength = buf[1] & 127;
        if (this._opcode === 0) {
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (!this._fragmented) {
            const error = this.createError(
              RangeError,
              "invalid opcode 0",
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._opcode = this._fragmented;
        } else if (this._opcode === 1 || this._opcode === 2) {
          if (this._fragmented) {
            const error = this.createError(
              RangeError,
              `invalid opcode ${this._opcode}`,
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._compressed = compressed;
        } else if (this._opcode > 7 && this._opcode < 11) {
          if (!this._fin) {
            const error = this.createError(
              RangeError,
              "FIN must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_FIN"
            );
            cb(error);
            return;
          }
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
            const error = this.createError(
              RangeError,
              `invalid payload length ${this._payloadLength}`,
              true,
              1002,
              "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH"
            );
            cb(error);
            return;
          }
        } else {
          const error = this.createError(
            RangeError,
            `invalid opcode ${this._opcode}`,
            true,
            1002,
            "WS_ERR_INVALID_OPCODE"
          );
          cb(error);
          return;
        }
        if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
        this._masked = (buf[1] & 128) === 128;
        if (this._isServer) {
          if (!this._masked) {
            const error = this.createError(
              RangeError,
              "MASK must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_MASK"
            );
            cb(error);
            return;
          }
        } else if (this._masked) {
          const error = this.createError(
            RangeError,
            "MASK must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_MASK"
          );
          cb(error);
          return;
        }
        if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
        else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
        else this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+16).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength16(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        this._payloadLength = this.consume(2).readUInt16BE(0);
        this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+64).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength64(cb) {
        if (this._bufferedBytes < 8) {
          this._loop = false;
          return;
        }
        const buf = this.consume(8);
        const num = buf.readUInt32BE(0);
        if (num > Math.pow(2, 53 - 32) - 1) {
          const error = this.createError(
            RangeError,
            "Unsupported WebSocket frame: payload length > 2^53 - 1",
            false,
            1009,
            "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH"
          );
          cb(error);
          return;
        }
        this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
        this.haveLength(cb);
      }
      /**
       * Payload length has been read.
       *
       * @param {Function} cb Callback
       * @private
       */
      haveLength(cb) {
        if (this._payloadLength && this._opcode < 8) {
          this._totalPayloadLength += this._payloadLength;
          if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
            const error = this.createError(
              RangeError,
              "Max payload size exceeded",
              false,
              1009,
              "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
            );
            cb(error);
            return;
          }
        }
        if (this._masked) this._state = GET_MASK;
        else this._state = GET_DATA;
      }
      /**
       * Reads mask bytes.
       *
       * @private
       */
      getMask() {
        if (this._bufferedBytes < 4) {
          this._loop = false;
          return;
        }
        this._mask = this.consume(4);
        this._state = GET_DATA;
      }
      /**
       * Reads data bytes.
       *
       * @param {Function} cb Callback
       * @private
       */
      getData(cb) {
        let data = EMPTY_BUFFER;
        if (this._payloadLength) {
          if (this._bufferedBytes < this._payloadLength) {
            this._loop = false;
            return;
          }
          data = this.consume(this._payloadLength);
          if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
            unmask(data, this._mask);
          }
        }
        if (this._opcode > 7) {
          this.controlMessage(data, cb);
          return;
        }
        if (this._maxFragments > 0 && ++this._numFragments > this._maxFragments) {
          const error = this.createError(
            RangeError,
            "Too many message fragments",
            false,
            1008,
            "WS_ERR_TOO_MANY_BUFFERED_PARTS"
          );
          cb(error);
          return;
        }
        if (this._compressed) {
          this._state = INFLATING;
          this.decompress(data, cb);
          return;
        }
        if (data.length) {
          this._messageLength = this._totalPayloadLength;
          this._fragments.push(data);
        }
        this.dataMessage(cb);
      }
      /**
       * Decompresses data.
       *
       * @param {Buffer} data Compressed data
       * @param {Function} cb Callback
       * @private
       */
      decompress(data, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        perMessageDeflate.decompress(data, this._fin, (err, buf) => {
          if (err) return cb(err);
          if (buf.length) {
            this._messageLength += buf.length;
            if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
              const error = this.createError(
                RangeError,
                "Max payload size exceeded",
                false,
                1009,
                "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
              );
              cb(error);
              return;
            }
            this._fragments.push(buf);
          }
          this.dataMessage(cb);
          if (this._state === GET_INFO) this.startLoop(cb);
        });
      }
      /**
       * Handles a data message.
       *
       * @param {Function} cb Callback
       * @private
       */
      dataMessage(cb) {
        if (!this._fin) {
          this._state = GET_INFO;
          return;
        }
        const messageLength = this._messageLength;
        const fragments = this._fragments;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragmented = 0;
        this._numFragments = 0;
        this._fragments = [];
        if (this._opcode === 2) {
          let data;
          if (this._binaryType === "nodebuffer") {
            data = concat(fragments, messageLength);
          } else if (this._binaryType === "arraybuffer") {
            data = toArrayBuffer(concat(fragments, messageLength));
          } else if (this._binaryType === "blob") {
            data = new Blob(fragments);
          } else {
            data = fragments;
          }
          if (this._allowSynchronousEvents) {
            this.emit("message", data, true);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", data, true);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        } else {
          const buf = concat(fragments, messageLength);
          if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
            const error = this.createError(
              Error,
              "invalid UTF-8 sequence",
              true,
              1007,
              "WS_ERR_INVALID_UTF8"
            );
            cb(error);
            return;
          }
          if (this._state === INFLATING || this._allowSynchronousEvents) {
            this.emit("message", buf, false);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", buf, false);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        }
      }
      /**
       * Handles a control message.
       *
       * @param {Buffer} data Data to handle
       * @return {(Error|RangeError|undefined)} A possible error
       * @private
       */
      controlMessage(data, cb) {
        if (this._opcode === 8) {
          if (data.length === 0) {
            this._loop = false;
            this.emit("conclude", 1005, EMPTY_BUFFER);
            this.end();
          } else {
            const code = data.readUInt16BE(0);
            if (!isValidStatusCode(code)) {
              const error = this.createError(
                RangeError,
                `invalid status code ${code}`,
                true,
                1002,
                "WS_ERR_INVALID_CLOSE_CODE"
              );
              cb(error);
              return;
            }
            const buf = new FastBuffer(
              data.buffer,
              data.byteOffset + 2,
              data.length - 2
            );
            if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
              const error = this.createError(
                Error,
                "invalid UTF-8 sequence",
                true,
                1007,
                "WS_ERR_INVALID_UTF8"
              );
              cb(error);
              return;
            }
            this._loop = false;
            this.emit("conclude", code, buf);
            this.end();
          }
          this._state = GET_INFO;
          return;
        }
        if (this._allowSynchronousEvents) {
          this.emit(this._opcode === 9 ? "ping" : "pong", data);
          this._state = GET_INFO;
        } else {
          this._state = DEFER_EVENT;
          setImmediate(() => {
            this.emit(this._opcode === 9 ? "ping" : "pong", data);
            this._state = GET_INFO;
            this.startLoop(cb);
          });
        }
      }
      /**
       * Builds an error object.
       *
       * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
       * @param {String} message The error message
       * @param {Boolean} prefix Specifies whether or not to add a default prefix to
       *     `message`
       * @param {Number} statusCode The status code
       * @param {String} errorCode The exposed error code
       * @return {(Error|RangeError)} The error
       * @private
       */
      createError(ErrorCtor, message, prefix, statusCode, errorCode) {
        this._loop = false;
        this._errored = true;
        const err = new ErrorCtor(
          prefix ? `Invalid WebSocket frame: ${message}` : message
        );
        Error.captureStackTrace(err, this.createError);
        err.code = errorCode;
        err[kStatusCode] = statusCode;
        return err;
      }
    };
    module.exports = Receiver2;
  }
});

// node_modules/.pnpm/ws@8.21.3/node_modules/ws/lib/sender.js
var require_sender = __commonJS({
  "node_modules/.pnpm/ws@8.21.3/node_modules/ws/lib/sender.js"(exports, module) {
    "use strict";
    var { Duplex } = __require("stream");
    var { randomFillSync } = __require("crypto");
    var {
      types: { isUint8Array }
    } = __require("util");
    var PerMessageDeflate2 = require_permessage_deflate();
    var { EMPTY_BUFFER, kWebSocket, NOOP } = require_constants();
    var { isBlob, isValidStatusCode } = require_validation();
    var { mask: applyMask, toBuffer } = require_buffer_util();
    var kByteLength = Symbol("kByteLength");
    var maskBuffer = Buffer.alloc(4);
    var RANDOM_POOL_SIZE = 8 * 1024;
    var randomPool;
    var randomPoolPointer = RANDOM_POOL_SIZE;
    var DEFAULT = 0;
    var DEFLATING = 1;
    var GET_BLOB_DATA = 2;
    var Sender2 = class _Sender {
      /**
       * Creates a Sender instance.
       *
       * @param {Duplex} socket The connection socket
       * @param {Object} [extensions] An object containing the negotiated extensions
       * @param {Function} [generateMask] The function used to generate the masking
       *     key
       */
      constructor(socket, extensions, generateMask) {
        this._extensions = extensions || {};
        if (generateMask) {
          this._generateMask = generateMask;
          this._maskBuffer = Buffer.alloc(4);
        }
        this._socket = socket;
        this._firstFragment = true;
        this._compress = false;
        this._bufferedBytes = 0;
        this._queue = [];
        this._state = DEFAULT;
        this.onerror = NOOP;
        this[kWebSocket] = void 0;
      }
      /**
       * Frames a piece of data according to the HyBi WebSocket protocol.
       *
       * @param {(Buffer|String)} data The data to frame
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @return {(Buffer|String)[]} The framed data
       * @public
       */
      static frame(data, options) {
        let mask;
        let merge = false;
        let offset = 2;
        let skipMasking = false;
        if (options.mask) {
          mask = options.maskBuffer || maskBuffer;
          if (options.generateMask) {
            options.generateMask(mask);
          } else {
            if (randomPoolPointer === RANDOM_POOL_SIZE) {
              if (randomPool === void 0) {
                randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
              }
              randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
              randomPoolPointer = 0;
            }
            mask[0] = randomPool[randomPoolPointer++];
            mask[1] = randomPool[randomPoolPointer++];
            mask[2] = randomPool[randomPoolPointer++];
            mask[3] = randomPool[randomPoolPointer++];
          }
          skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
          offset = 6;
        }
        let dataLength;
        if (typeof data === "string") {
          if ((!options.mask || skipMasking) && options[kByteLength] !== void 0) {
            dataLength = options[kByteLength];
          } else {
            data = Buffer.from(data);
            dataLength = data.length;
          }
        } else {
          dataLength = data.length;
          merge = options.mask && options.readOnly && !skipMasking;
        }
        let payloadLength = dataLength;
        if (dataLength >= 65536) {
          offset += 8;
          payloadLength = 127;
        } else if (dataLength > 125) {
          offset += 2;
          payloadLength = 126;
        }
        const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);
        target[0] = options.fin ? options.opcode | 128 : options.opcode;
        if (options.rsv1) target[0] |= 64;
        target[1] = payloadLength;
        if (payloadLength === 126) {
          target.writeUInt16BE(dataLength, 2);
        } else if (payloadLength === 127) {
          target[2] = target[3] = 0;
          target.writeUIntBE(dataLength, 4, 6);
        }
        if (!options.mask) return [target, data];
        target[1] |= 128;
        target[offset - 4] = mask[0];
        target[offset - 3] = mask[1];
        target[offset - 2] = mask[2];
        target[offset - 1] = mask[3];
        if (skipMasking) return [target, data];
        if (merge) {
          applyMask(data, mask, target, offset, dataLength);
          return [target];
        }
        applyMask(data, mask, data, 0, dataLength);
        return [target, data];
      }
      /**
       * Sends a close message to the other peer.
       *
       * @param {Number} [code] The status code component of the body
       * @param {(String|Buffer)} [data] The message component of the body
       * @param {Boolean} [mask=false] Specifies whether or not to mask the message
       * @param {Function} [cb] Callback
       * @public
       */
      close(code, data, mask, cb) {
        let buf;
        if (code === void 0) {
          buf = EMPTY_BUFFER;
        } else if (typeof code !== "number" || !isValidStatusCode(code)) {
          throw new TypeError("First argument must be a valid error code number");
        } else if (data === void 0 || !data.length) {
          buf = Buffer.allocUnsafe(2);
          buf.writeUInt16BE(code, 0);
        } else {
          const length = Buffer.byteLength(data);
          if (length > 123) {
            throw new RangeError("The message must not be greater than 123 bytes");
          }
          buf = Buffer.allocUnsafe(2 + length);
          buf.writeUInt16BE(code, 0);
          if (typeof data === "string") {
            buf.write(data, 2);
          } else if (isUint8Array(data)) {
            buf.set(data, 2);
          } else {
            throw new TypeError("Second argument must be a string or a Uint8Array");
          }
        }
        const options = {
          [kByteLength]: buf.length,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 8,
          readOnly: false,
          rsv1: false
        };
        if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, buf, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(buf, options), cb);
        }
      }
      /**
       * Sends a ping message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      ping(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 9,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a pong message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      pong(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 10,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a data message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Object} options Options object
       * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
       *     or text
       * @param {Boolean} [options.compress=false] Specifies whether or not to
       *     compress `data`
       * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Function} [cb] Callback
       * @public
       */
      send(data, options, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        let opcode = options.binary ? 2 : 1;
        let rsv1 = options.compress;
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (this._firstFragment) {
          this._firstFragment = false;
          if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) {
            rsv1 = byteLength >= perMessageDeflate._threshold;
          }
          this._compress = rsv1;
        } else {
          rsv1 = false;
          opcode = 0;
        }
        if (options.fin) this._firstFragment = true;
        const opts = {
          [kByteLength]: byteLength,
          fin: options.fin,
          generateMask: this._generateMask,
          mask: options.mask,
          maskBuffer: this._maskBuffer,
          opcode,
          readOnly,
          rsv1
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, this._compress, opts, cb]);
          } else {
            this.getBlobData(data, this._compress, opts, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, this._compress, opts, cb]);
        } else {
          this.dispatch(data, this._compress, opts, cb);
        }
      }
      /**
       * Gets the contents of a blob as binary data.
       *
       * @param {Blob} blob The blob
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     the data
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      getBlobData(blob, compress, options, cb) {
        this._bufferedBytes += options[kByteLength];
        this._state = GET_BLOB_DATA;
        blob.arrayBuffer().then((arrayBuffer) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while the blob was being read"
            );
            process.nextTick(callCallbacks, this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          const data = toBuffer(arrayBuffer);
          if (!compress) {
            this._state = DEFAULT;
            this.sendFrame(_Sender.frame(data, options), cb);
            this.dequeue();
          } else {
            this.dispatch(data, compress, options, cb);
          }
        }).catch((err) => {
          process.nextTick(onError, this, err, cb);
        });
      }
      /**
       * Dispatches a message.
       *
       * @param {(Buffer|String)} data The message to send
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     `data`
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      dispatch(data, compress, options, cb) {
        if (!compress) {
          this.sendFrame(_Sender.frame(data, options), cb);
          return;
        }
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        this._bufferedBytes += options[kByteLength];
        this._state = DEFLATING;
        perMessageDeflate.compress(data, options.fin, (_, buf) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while data was being compressed"
            );
            callCallbacks(this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          this._state = DEFAULT;
          options.readOnly = false;
          this.sendFrame(_Sender.frame(buf, options), cb);
          this.dequeue();
        });
      }
      /**
       * Executes queued send operations.
       *
       * @private
       */
      dequeue() {
        while (this._state === DEFAULT && this._queue.length) {
          const params = this._queue.shift();
          this._bufferedBytes -= params[3][kByteLength];
          Reflect.apply(params[0], this, params.slice(1));
        }
      }
      /**
       * Enqueues a send operation.
       *
       * @param {Array} params Send operation parameters.
       * @private
       */
      enqueue(params) {
        this._bufferedBytes += params[3][kByteLength];
        this._queue.push(params);
      }
      /**
       * Sends a frame.
       *
       * @param {(Buffer | String)[]} list The frame to send
       * @param {Function} [cb] Callback
       * @private
       */
      sendFrame(list, cb) {
        if (list.length === 2) {
          this._socket.cork();
          this._socket.write(list[0]);
          this._socket.write(list[1], cb);
          this._socket.uncork();
        } else {
          this._socket.write(list[0], cb);
        }
      }
    };
    module.exports = Sender2;
    function callCallbacks(sender, err, cb) {
      if (typeof cb === "function") cb(err);
      for (let i = 0; i < sender._queue.length; i++) {
        const params = sender._queue[i];
        const callback = params[params.length - 1];
        if (typeof callback === "function") callback(err);
      }
    }
    function onError(sender, err, cb) {
      callCallbacks(sender, err, cb);
      sender.onerror(err);
    }
  }
});

// node_modules/.pnpm/ws@8.21.3/node_modules/ws/lib/event-target.js
var require_event_target = __commonJS({
  "node_modules/.pnpm/ws@8.21.3/node_modules/ws/lib/event-target.js"(exports, module) {
    "use strict";
    var { kForOnEventAttribute, kListener } = require_constants();
    var kCode = Symbol("kCode");
    var kData = Symbol("kData");
    var kError = Symbol("kError");
    var kMessage = Symbol("kMessage");
    var kReason = Symbol("kReason");
    var kTarget = Symbol("kTarget");
    var kType = Symbol("kType");
    var kWasClean = Symbol("kWasClean");
    var Event = class {
      /**
       * Create a new `Event`.
       *
       * @param {String} type The name of the event
       * @throws {TypeError} If the `type` argument is not specified
       */
      constructor(type) {
        this[kTarget] = null;
        this[kType] = type;
      }
      /**
       * @type {*}
       */
      get target() {
        return this[kTarget];
      }
      /**
       * @type {String}
       */
      get type() {
        return this[kType];
      }
    };
    Object.defineProperty(Event.prototype, "target", { enumerable: true });
    Object.defineProperty(Event.prototype, "type", { enumerable: true });
    var CloseEvent = class extends Event {
      /**
       * Create a new `CloseEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {Number} [options.code=0] The status code explaining why the
       *     connection was closed
       * @param {String} [options.reason=''] A human-readable string explaining why
       *     the connection was closed
       * @param {Boolean} [options.wasClean=false] Indicates whether or not the
       *     connection was cleanly closed
       */
      constructor(type, options = {}) {
        super(type);
        this[kCode] = options.code === void 0 ? 0 : options.code;
        this[kReason] = options.reason === void 0 ? "" : options.reason;
        this[kWasClean] = options.wasClean === void 0 ? false : options.wasClean;
      }
      /**
       * @type {Number}
       */
      get code() {
        return this[kCode];
      }
      /**
       * @type {String}
       */
      get reason() {
        return this[kReason];
      }
      /**
       * @type {Boolean}
       */
      get wasClean() {
        return this[kWasClean];
      }
    };
    Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });
    var ErrorEvent = class extends Event {
      /**
       * Create a new `ErrorEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.error=null] The error that generated this event
       * @param {String} [options.message=''] The error message
       */
      constructor(type, options = {}) {
        super(type);
        this[kError] = options.error === void 0 ? null : options.error;
        this[kMessage] = options.message === void 0 ? "" : options.message;
      }
      /**
       * @type {*}
       */
      get error() {
        return this[kError];
      }
      /**
       * @type {String}
       */
      get message() {
        return this[kMessage];
      }
    };
    Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
    Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });
    var MessageEvent = class extends Event {
      /**
       * Create a new `MessageEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.data=null] The message content
       */
      constructor(type, options = {}) {
        super(type);
        this[kData] = options.data === void 0 ? null : options.data;
      }
      /**
       * @type {*}
       */
      get data() {
        return this[kData];
      }
    };
    Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
    var EventTarget = {
      /**
       * Register an event listener.
       *
       * @param {String} type A string representing the event type to listen for
       * @param {(Function|Object)} handler The listener to add
       * @param {Object} [options] An options object specifies characteristics about
       *     the event listener
       * @param {Boolean} [options.once=false] A `Boolean` indicating that the
       *     listener should be invoked at most once after being added. If `true`,
       *     the listener would be automatically removed when invoked.
       * @public
       */
      addEventListener(type, handler, options = {}) {
        for (const listener of this.listeners(type)) {
          if (!options[kForOnEventAttribute] && listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            return;
          }
        }
        let wrapper;
        if (type === "message") {
          wrapper = function onMessage(data, isBinary) {
            const event = new MessageEvent("message", {
              data: isBinary ? data : data.toString()
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "close") {
          wrapper = function onClose(code, message) {
            const event = new CloseEvent("close", {
              code,
              reason: message.toString(),
              wasClean: this._closeFrameReceived && this._closeFrameSent
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "error") {
          wrapper = function onError(error) {
            const event = new ErrorEvent("error", {
              error,
              message: error.message
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "open") {
          wrapper = function onOpen() {
            const event = new Event("open");
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else {
          return;
        }
        wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
        wrapper[kListener] = handler;
        if (options.once) {
          this.once(type, wrapper);
        } else {
          this.on(type, wrapper);
        }
      },
      /**
       * Remove an event listener.
       *
       * @param {String} type A string representing the event type to remove
       * @param {(Function|Object)} handler The listener to remove
       * @public
       */
      removeEventListener(type, handler) {
        for (const listener of this.listeners(type)) {
          if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            this.removeListener(type, listener);
            break;
          }
        }
      }
    };
    module.exports = {
      CloseEvent,
      ErrorEvent,
      Event,
      EventTarget,
      MessageEvent
    };
    function callListener(listener, thisArg, event) {
      if (typeof listener === "object" && listener.handleEvent) {
        listener.handleEvent.call(listener, event);
      } else {
        listener.call(thisArg, event);
      }
    }
  }
});

// node_modules/.pnpm/ws@8.21.3/node_modules/ws/lib/extension.js
var require_extension = __commonJS({
  "node_modules/.pnpm/ws@8.21.3/node_modules/ws/lib/extension.js"(exports, module) {
    "use strict";
    var { tokenChars } = require_validation();
    function push(dest, name, elem) {
      if (dest[name] === void 0) dest[name] = [elem];
      else dest[name].push(elem);
    }
    function parse2(header) {
      const offers = /* @__PURE__ */ Object.create(null);
      let params = /* @__PURE__ */ Object.create(null);
      let mustUnescape = false;
      let isEscaping = false;
      let inQuotes = false;
      let extensionName;
      let paramName;
      let start = -1;
      let code = -1;
      let end = -1;
      let i = 0;
      for (; i < header.length; i++) {
        code = header.charCodeAt(i);
        if (extensionName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (i !== 0 && (code === 32 || code === 9)) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            const name = header.slice(start, end);
            if (code === 44) {
              push(offers, name, params);
              params = /* @__PURE__ */ Object.create(null);
            } else {
              extensionName = name;
            }
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else if (paramName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (code === 32 || code === 9) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            push(params, header.slice(start, end), true);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            start = end = -1;
          } else if (code === 61 && start !== -1 && end === -1) {
            paramName = header.slice(start, i);
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else {
          if (isEscaping) {
            if (tokenChars[code] !== 1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (start === -1) start = i;
            else if (!mustUnescape) mustUnescape = true;
            isEscaping = false;
          } else if (inQuotes) {
            if (tokenChars[code] === 1) {
              if (start === -1) start = i;
            } else if (code === 34 && start !== -1) {
              inQuotes = false;
              end = i;
            } else if (code === 92) {
              isEscaping = true;
            } else {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
          } else if (code === 34 && header.charCodeAt(i - 1) === 61) {
            inQuotes = true;
          } else if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (start !== -1 && (code === 32 || code === 9)) {
            if (end === -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            let value = header.slice(start, end);
            if (mustUnescape) {
              value = value.replace(/\\/g, "");
              mustUnescape = false;
            }
            push(params, paramName, value);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            paramName = void 0;
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        }
      }
      if (start === -1 || inQuotes || code === 32 || code === 9) {
        throw new SyntaxError("Unexpected end of input");
      }
      if (end === -1) end = i;
      const token = header.slice(start, end);
      if (extensionName === void 0) {
        push(offers, token, params);
      } else {
        if (paramName === void 0) {
          push(params, token, true);
        } else if (mustUnescape) {
          push(params, paramName, token.replace(/\\/g, ""));
        } else {
          push(params, paramName, token);
        }
        push(offers, extensionName, params);
      }
      return offers;
    }
    function format(extensions) {
      return Object.keys(extensions).map((extension2) => {
        let configurations = extensions[extension2];
        if (!Array.isArray(configurations)) configurations = [configurations];
        return configurations.map((params) => {
          return [extension2].concat(
            Object.keys(params).map((k) => {
              let values2 = params[k];
              if (!Array.isArray(values2)) values2 = [values2];
              return values2.map((v) => v === true ? k : `${k}=${v}`).join("; ");
            })
          ).join("; ");
        }).join(", ");
      }).join(", ");
    }
    module.exports = { format, parse: parse2 };
  }
});

// node_modules/.pnpm/ws@8.21.3/node_modules/ws/lib/websocket.js
var require_websocket = __commonJS({
  "node_modules/.pnpm/ws@8.21.3/node_modules/ws/lib/websocket.js"(exports, module) {
    "use strict";
    var EventEmitter = __require("events");
    var https = __require("https");
    var http = __require("http");
    var net = __require("net");
    var tls = __require("tls");
    var { randomBytes, createHash: createHash13 } = __require("crypto");
    var { Duplex, Readable } = __require("stream");
    var { URL: URL2 } = __require("url");
    var PerMessageDeflate2 = require_permessage_deflate();
    var Receiver2 = require_receiver();
    var Sender2 = require_sender();
    var { isBlob } = require_validation();
    var {
      BINARY_TYPES,
      CLOSE_TIMEOUT,
      EMPTY_BUFFER,
      GUID,
      kForOnEventAttribute,
      kListener,
      kStatusCode,
      kWebSocket,
      NOOP
    } = require_constants();
    var {
      EventTarget: { addEventListener, removeEventListener }
    } = require_event_target();
    var { format, parse: parse2 } = require_extension();
    var { toBuffer } = require_buffer_util();
    var kAborted = Symbol("kAborted");
    var protocolVersions = [8, 13];
    var readyStates = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
    var subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
    var WebSocket2 = class _WebSocket extends EventEmitter {
      /**
       * Create a new `WebSocket`.
       *
       * @param {(String|URL)} address The URL to which to connect
       * @param {(String|String[])} [protocols] The subprotocols
       * @param {Object} [options] Connection options
       */
      constructor(address, protocols, options) {
        super();
        this._binaryType = BINARY_TYPES[0];
        this._closeCode = 1006;
        this._closeFrameReceived = false;
        this._closeFrameSent = false;
        this._closeMessage = EMPTY_BUFFER;
        this._closeTimer = null;
        this._errorEmitted = false;
        this._extensions = {};
        this._paused = false;
        this._protocol = "";
        this._readyState = _WebSocket.CONNECTING;
        this._receiver = null;
        this._sender = null;
        this._socket = null;
        if (address !== null) {
          this._bufferedAmount = 0;
          this._isServer = false;
          this._redirects = 0;
          if (protocols === void 0) {
            protocols = [];
          } else if (!Array.isArray(protocols)) {
            if (typeof protocols === "object" && protocols !== null) {
              options = protocols;
              protocols = [];
            } else {
              protocols = [protocols];
            }
          }
          initAsClient(this, address, protocols, options);
        } else {
          this._autoPong = options.autoPong;
          this._closeTimeout = options.closeTimeout;
          this._isServer = true;
        }
      }
      /**
       * For historical reasons, the custom "nodebuffer" type is used by the default
       * instead of "blob".
       *
       * @type {String}
       */
      get binaryType() {
        return this._binaryType;
      }
      set binaryType(type) {
        if (!BINARY_TYPES.includes(type)) return;
        this._binaryType = type;
        if (this._receiver) this._receiver._binaryType = type;
      }
      /**
       * @type {Number}
       */
      get bufferedAmount() {
        if (!this._socket) return this._bufferedAmount;
        return this._socket._writableState.length + this._sender._bufferedBytes;
      }
      /**
       * @type {String}
       */
      get extensions() {
        return Object.keys(this._extensions).join();
      }
      /**
       * @type {Boolean}
       */
      get isPaused() {
        return this._paused;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onclose() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onerror() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onopen() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onmessage() {
        return null;
      }
      /**
       * @type {String}
       */
      get protocol() {
        return this._protocol;
      }
      /**
       * @type {Number}
       */
      get readyState() {
        return this._readyState;
      }
      /**
       * @type {String}
       */
      get url() {
        return this._url;
      }
      /**
       * Set up the socket and the internal resources.
       *
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Object} options Options object
       * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Number} [options.maxBufferedChunks=0] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=0] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=0] The maximum allowed message size
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @private
       */
      setSocket(socket, head, options) {
        const receiver = new Receiver2({
          allowSynchronousEvents: options.allowSynchronousEvents,
          binaryType: this.binaryType,
          extensions: this._extensions,
          isServer: this._isServer,
          maxBufferedChunks: options.maxBufferedChunks,
          maxFragments: options.maxFragments,
          maxPayload: options.maxPayload,
          skipUTF8Validation: options.skipUTF8Validation
        });
        const sender = new Sender2(socket, this._extensions, options.generateMask);
        this._receiver = receiver;
        this._sender = sender;
        this._socket = socket;
        receiver[kWebSocket] = this;
        sender[kWebSocket] = this;
        socket[kWebSocket] = this;
        receiver.on("conclude", receiverOnConclude);
        receiver.on("drain", receiverOnDrain);
        receiver.on("error", receiverOnError);
        receiver.on("message", receiverOnMessage);
        receiver.on("ping", receiverOnPing);
        receiver.on("pong", receiverOnPong);
        sender.onerror = senderOnError;
        if (socket.setTimeout) socket.setTimeout(0);
        if (socket.setNoDelay) socket.setNoDelay();
        if (head.length > 0) socket.unshift(head);
        socket.on("close", socketOnClose);
        socket.on("data", socketOnData);
        socket.on("end", socketOnEnd);
        socket.on("error", socketOnError);
        this._readyState = _WebSocket.OPEN;
        this.emit("open");
      }
      /**
       * Emit the `'close'` event.
       *
       * @private
       */
      emitClose() {
        if (!this._socket) {
          this._readyState = _WebSocket.CLOSED;
          this.emit("close", this._closeCode, this._closeMessage);
          return;
        }
        if (this._extensions[PerMessageDeflate2.extensionName]) {
          this._extensions[PerMessageDeflate2.extensionName].cleanup();
        }
        this._receiver.removeAllListeners();
        this._readyState = _WebSocket.CLOSED;
        this.emit("close", this._closeCode, this._closeMessage);
      }
      /**
       * Start a closing handshake.
       *
       *          +----------+   +-----------+   +----------+
       *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
       *    |     +----------+   +-----------+   +----------+     |
       *          +----------+   +-----------+         |
       * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
       *          +----------+   +-----------+   |
       *    |           |                        |   +---+        |
       *                +------------------------+-->|fin| - - - -
       *    |         +---+                      |   +---+
       *     - - - - -|fin|<---------------------+
       *              +---+
       *
       * @param {Number} [code] Status code explaining why the connection is closing
       * @param {(String|Buffer)} [data] The reason why the connection is
       *     closing
       * @public
       */
      close(code, data) {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this.readyState === _WebSocket.CLOSING) {
          if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) {
            this._socket.end();
          }
          return;
        }
        this._readyState = _WebSocket.CLOSING;
        this._sender.close(code, data, !this._isServer, (err) => {
          if (err) return;
          this._closeFrameSent = true;
          if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) {
            this._socket.end();
          }
        });
        setCloseTimer(this);
      }
      /**
       * Pause the socket.
       *
       * @public
       */
      pause() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = true;
        this._socket.pause();
      }
      /**
       * Send a ping.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the ping is sent
       * @public
       */
      ping(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.ping(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Send a pong.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the pong is sent
       * @public
       */
      pong(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.pong(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Resume the socket.
       *
       * @public
       */
      resume() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = false;
        if (!this._receiver._writableState.needDrain) this._socket.resume();
      }
      /**
       * Send a data message.
       *
       * @param {*} data The message to send
       * @param {Object} [options] Options object
       * @param {Boolean} [options.binary] Specifies whether `data` is binary or
       *     text
       * @param {Boolean} [options.compress] Specifies whether or not to compress
       *     `data`
       * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when data is written out
       * @public
       */
      send(data, options, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof options === "function") {
          cb = options;
          options = {};
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        const opts = {
          binary: typeof data !== "string",
          mask: !this._isServer,
          compress: true,
          fin: true,
          ...options
        };
        if (!this._extensions[PerMessageDeflate2.extensionName]) {
          opts.compress = false;
        }
        this._sender.send(data || EMPTY_BUFFER, opts, cb);
      }
      /**
       * Forcibly close the connection.
       *
       * @public
       */
      terminate() {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this._socket) {
          this._readyState = _WebSocket.CLOSING;
          this._socket.destroy();
        }
      }
    };
    Object.defineProperty(WebSocket2, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2.prototype, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2.prototype, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    [
      "binaryType",
      "bufferedAmount",
      "extensions",
      "isPaused",
      "protocol",
      "readyState",
      "url"
    ].forEach((property) => {
      Object.defineProperty(WebSocket2.prototype, property, { enumerable: true });
    });
    ["open", "error", "close", "message"].forEach((method) => {
      Object.defineProperty(WebSocket2.prototype, `on${method}`, {
        enumerable: true,
        get() {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) return listener[kListener];
          }
          return null;
        },
        set(handler) {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) {
              this.removeListener(method, listener);
              break;
            }
          }
          if (typeof handler !== "function") return;
          this.addEventListener(method, handler, {
            [kForOnEventAttribute]: true
          });
        }
      });
    });
    WebSocket2.prototype.addEventListener = addEventListener;
    WebSocket2.prototype.removeEventListener = removeEventListener;
    module.exports = WebSocket2;
    function initAsClient(websocket, address, protocols, options) {
      const opts = {
        allowSynchronousEvents: true,
        autoPong: true,
        closeTimeout: CLOSE_TIMEOUT,
        protocolVersion: protocolVersions[1],
        maxBufferedChunks: 256 * 1024,
        maxFragments: 16 * 1024,
        maxPayload: 100 * 1024 * 1024,
        skipUTF8Validation: false,
        perMessageDeflate: true,
        followRedirects: false,
        maxRedirects: 10,
        ...options,
        socketPath: void 0,
        hostname: void 0,
        protocol: void 0,
        timeout: void 0,
        method: "GET",
        host: void 0,
        path: void 0,
        port: void 0
      };
      websocket._autoPong = opts.autoPong;
      websocket._closeTimeout = opts.closeTimeout;
      if (!protocolVersions.includes(opts.protocolVersion)) {
        throw new RangeError(
          `Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`
        );
      }
      let parsedUrl;
      if (address instanceof URL2) {
        parsedUrl = address;
      } else {
        try {
          parsedUrl = new URL2(address);
        } catch {
          throw new SyntaxError(`Invalid URL: ${address}`);
        }
      }
      if (parsedUrl.protocol === "http:") {
        parsedUrl.protocol = "ws:";
      } else if (parsedUrl.protocol === "https:") {
        parsedUrl.protocol = "wss:";
      }
      websocket._url = parsedUrl.href;
      const isSecure = parsedUrl.protocol === "wss:";
      const isIpcUrl = parsedUrl.protocol === "ws+unix:";
      let invalidUrlMessage;
      if (parsedUrl.protocol !== "ws:" && !isSecure && !isIpcUrl) {
        invalidUrlMessage = `The URL's protocol must be one of "ws:", "wss:", "http:", "https:", or "ws+unix:"`;
      } else if (isIpcUrl && !parsedUrl.pathname) {
        invalidUrlMessage = "The URL's pathname is empty";
      } else if (parsedUrl.hash) {
        invalidUrlMessage = "The URL contains a fragment identifier";
      }
      if (invalidUrlMessage) {
        const err = new SyntaxError(invalidUrlMessage);
        if (websocket._redirects === 0) {
          throw err;
        } else {
          emitErrorAndClose(websocket, err);
          return;
        }
      }
      const defaultPort = isSecure ? 443 : 80;
      const key = randomBytes(16).toString("base64");
      const request = isSecure ? https.request : http.request;
      const protocolSet = /* @__PURE__ */ new Set();
      let perMessageDeflate;
      opts.createConnection = opts.createConnection || (isSecure ? tlsConnect : netConnect);
      opts.defaultPort = opts.defaultPort || defaultPort;
      opts.port = parsedUrl.port || defaultPort;
      opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
      opts.headers = {
        ...opts.headers,
        "Sec-WebSocket-Version": opts.protocolVersion,
        "Sec-WebSocket-Key": key,
        Connection: "Upgrade",
        Upgrade: "websocket"
      };
      opts.path = parsedUrl.pathname + parsedUrl.search;
      opts.timeout = opts.handshakeTimeout;
      if (opts.perMessageDeflate) {
        perMessageDeflate = new PerMessageDeflate2({
          ...opts.perMessageDeflate,
          isServer: false,
          maxPayload: opts.maxPayload
        });
        opts.headers["Sec-WebSocket-Extensions"] = format({
          [PerMessageDeflate2.extensionName]: perMessageDeflate.offer()
        });
      }
      if (protocols.length) {
        for (const protocol of protocols) {
          if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) {
            throw new SyntaxError(
              "An invalid or duplicated subprotocol was specified"
            );
          }
          protocolSet.add(protocol);
        }
        opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
      }
      if (opts.origin) {
        if (opts.protocolVersion < 13) {
          opts.headers["Sec-WebSocket-Origin"] = opts.origin;
        } else {
          opts.headers.Origin = opts.origin;
        }
      }
      if (parsedUrl.username || parsedUrl.password) {
        opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
      }
      if (isIpcUrl) {
        const parts = opts.path.split(":");
        opts.socketPath = parts[0];
        opts.path = parts[1];
      }
      let req;
      if (opts.followRedirects) {
        if (websocket._redirects === 0) {
          websocket._originalIpc = isIpcUrl;
          websocket._originalSecure = isSecure;
          websocket._originalHostOrSocketPath = isIpcUrl ? opts.socketPath : parsedUrl.host;
          const headers = options && options.headers;
          options = { ...options, headers: {} };
          if (headers) {
            for (const [key2, value] of Object.entries(headers)) {
              options.headers[key2.toLowerCase()] = value;
            }
          }
        } else if (websocket.listenerCount("redirect") === 0) {
          const isSameHost = isIpcUrl ? websocket._originalIpc ? opts.socketPath === websocket._originalHostOrSocketPath : false : websocket._originalIpc ? false : parsedUrl.host === websocket._originalHostOrSocketPath;
          if (!isSameHost || websocket._originalSecure && !isSecure) {
            delete opts.headers.authorization;
            delete opts.headers.cookie;
            if (!isSameHost) delete opts.headers.host;
            opts.auth = void 0;
          }
        }
        if (opts.auth && !options.headers.authorization) {
          options.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
        }
        req = websocket._req = request(opts);
        if (websocket._redirects) {
          websocket.emit("redirect", websocket.url, req);
        }
      } else {
        req = websocket._req = request(opts);
      }
      if (opts.timeout) {
        req.on("timeout", () => {
          abortHandshake(websocket, req, "Opening handshake has timed out");
        });
      }
      req.on("error", (err) => {
        if (req === null || req[kAborted]) return;
        req = websocket._req = null;
        emitErrorAndClose(websocket, err);
      });
      req.on("response", (res) => {
        const location = res.headers.location;
        const statusCode = res.statusCode;
        if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
          if (++websocket._redirects > opts.maxRedirects) {
            abortHandshake(websocket, req, "Maximum redirects exceeded");
            return;
          }
          req.abort();
          let addr;
          try {
            addr = new URL2(location, address);
          } catch (e) {
            const err = new SyntaxError(`Invalid URL: ${location}`);
            emitErrorAndClose(websocket, err);
            return;
          }
          initAsClient(websocket, addr, protocols, options);
        } else if (!websocket.emit("unexpected-response", req, res)) {
          abortHandshake(
            websocket,
            req,
            `Unexpected server response: ${res.statusCode}`
          );
        }
      });
      req.on("upgrade", (res, socket, head) => {
        websocket.emit("upgrade", res);
        if (websocket.readyState !== WebSocket2.CONNECTING) return;
        req = websocket._req = null;
        const upgrade = res.headers.upgrade;
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          abortHandshake(websocket, socket, "Invalid Upgrade header");
          return;
        }
        const digest5 = createHash13("sha1").update(key + GUID).digest("base64");
        if (res.headers["sec-websocket-accept"] !== digest5) {
          abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Accept header");
          return;
        }
        const serverProt = res.headers["sec-websocket-protocol"];
        let protError;
        if (serverProt !== void 0) {
          if (!protocolSet.size) {
            protError = "Server sent a subprotocol but none was requested";
          } else if (!protocolSet.has(serverProt)) {
            protError = "Server sent an invalid subprotocol";
          }
        } else if (protocolSet.size) {
          protError = "Server sent no subprotocol";
        }
        if (protError) {
          abortHandshake(websocket, socket, protError);
          return;
        }
        if (serverProt) websocket._protocol = serverProt;
        const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
        if (secWebSocketExtensions !== void 0) {
          if (!perMessageDeflate) {
            const message = "Server sent a Sec-WebSocket-Extensions header but no extension was requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          let extensions;
          try {
            extensions = parse2(secWebSocketExtensions);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          const extensionNames = Object.keys(extensions);
          if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate2.extensionName) {
            const message = "Server indicated an extension that was not requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          try {
            perMessageDeflate.accept(extensions[PerMessageDeflate2.extensionName]);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          websocket._extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
        }
        websocket.setSocket(socket, head, {
          allowSynchronousEvents: opts.allowSynchronousEvents,
          generateMask: opts.generateMask,
          maxBufferedChunks: opts.maxBufferedChunks,
          maxFragments: opts.maxFragments,
          maxPayload: opts.maxPayload,
          skipUTF8Validation: opts.skipUTF8Validation
        });
      });
      if (opts.finishRequest) {
        opts.finishRequest(req, websocket);
      } else {
        req.end();
      }
    }
    function emitErrorAndClose(websocket, err) {
      websocket._readyState = WebSocket2.CLOSING;
      websocket._errorEmitted = true;
      websocket.emit("error", err);
      websocket.emitClose();
    }
    function netConnect(options) {
      options.path = options.socketPath;
      return net.connect(options);
    }
    function tlsConnect(options) {
      options.path = void 0;
      if (!options.servername && options.servername !== "") {
        options.servername = net.isIP(options.host) ? "" : options.host;
      }
      return tls.connect(options);
    }
    function abortHandshake(websocket, stream, message) {
      websocket._readyState = WebSocket2.CLOSING;
      const err = new Error(message);
      Error.captureStackTrace(err, abortHandshake);
      if (stream.setHeader) {
        stream[kAborted] = true;
        stream.abort();
        if (stream.socket && !stream.socket.destroyed) {
          stream.socket.destroy();
        }
        process.nextTick(emitErrorAndClose, websocket, err);
      } else {
        stream.destroy(err);
        stream.once("error", websocket.emit.bind(websocket, "error"));
        stream.once("close", websocket.emitClose.bind(websocket));
      }
    }
    function sendAfterClose(websocket, data, cb) {
      if (data) {
        const length = isBlob(data) ? data.size : toBuffer(data).length;
        if (websocket._socket) websocket._sender._bufferedBytes += length;
        else websocket._bufferedAmount += length;
      }
      if (cb) {
        const err = new Error(
          `WebSocket is not open: readyState ${websocket.readyState} (${readyStates[websocket.readyState]})`
        );
        process.nextTick(cb, err);
      }
    }
    function receiverOnConclude(code, reason) {
      const websocket = this[kWebSocket];
      websocket._closeFrameReceived = true;
      websocket._closeMessage = reason;
      websocket._closeCode = code;
      if (websocket._socket[kWebSocket] === void 0) return;
      websocket._socket.removeListener("data", socketOnData);
      process.nextTick(resume, websocket._socket);
      if (code === 1005) websocket.close();
      else websocket.close(code, reason);
    }
    function receiverOnDrain() {
      const websocket = this[kWebSocket];
      if (!websocket.isPaused) websocket._socket.resume();
    }
    function receiverOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket._socket[kWebSocket] !== void 0) {
        websocket._socket.removeListener("data", socketOnData);
        process.nextTick(resume, websocket._socket);
        websocket.close(err[kStatusCode]);
      }
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function receiverOnFinish() {
      this[kWebSocket].emitClose();
    }
    function receiverOnMessage(data, isBinary) {
      this[kWebSocket].emit("message", data, isBinary);
    }
    function receiverOnPing(data) {
      const websocket = this[kWebSocket];
      if (websocket._autoPong) websocket.pong(data, !this._isServer, NOOP);
      websocket.emit("ping", data);
    }
    function receiverOnPong(data) {
      this[kWebSocket].emit("pong", data);
    }
    function resume(stream) {
      stream.resume();
    }
    function senderOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket.readyState === WebSocket2.CLOSED) return;
      if (websocket.readyState === WebSocket2.OPEN) {
        websocket._readyState = WebSocket2.CLOSING;
        setCloseTimer(websocket);
      }
      this._socket.end();
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function setCloseTimer(websocket) {
      websocket._closeTimer = setTimeout(
        websocket._socket.destroy.bind(websocket._socket),
        websocket._closeTimeout
      );
    }
    function socketOnClose() {
      const websocket = this[kWebSocket];
      this.removeListener("close", socketOnClose);
      this.removeListener("data", socketOnData);
      this.removeListener("end", socketOnEnd);
      websocket._readyState = WebSocket2.CLOSING;
      if (!this._readableState.endEmitted && !websocket._closeFrameReceived && !websocket._receiver._writableState.errorEmitted && this._readableState.length !== 0) {
        const chunk = this.read(this._readableState.length);
        websocket._receiver.write(chunk);
      }
      websocket._receiver.end();
      this[kWebSocket] = void 0;
      clearTimeout(websocket._closeTimer);
      if (websocket._receiver._writableState.finished || websocket._receiver._writableState.errorEmitted) {
        websocket.emitClose();
      } else {
        websocket._receiver.on("error", receiverOnFinish);
        websocket._receiver.on("finish", receiverOnFinish);
      }
    }
    function socketOnData(chunk) {
      if (!this[kWebSocket]._receiver.write(chunk)) {
        this.pause();
      }
    }
    function socketOnEnd() {
      const websocket = this[kWebSocket];
      websocket._readyState = WebSocket2.CLOSING;
      websocket._receiver.end();
      this.end();
    }
    function socketOnError() {
      const websocket = this[kWebSocket];
      this.removeListener("error", socketOnError);
      this.on("error", NOOP);
      if (websocket) {
        websocket._readyState = WebSocket2.CLOSING;
        this.destroy();
      }
    }
  }
});

// node_modules/.pnpm/ws@8.21.3/node_modules/ws/lib/stream.js
var require_stream = __commonJS({
  "node_modules/.pnpm/ws@8.21.3/node_modules/ws/lib/stream.js"(exports, module) {
    "use strict";
    var WebSocket2 = require_websocket();
    var { Duplex } = __require("stream");
    function emitClose(stream) {
      stream.emit("close");
    }
    function duplexOnEnd() {
      if (!this.destroyed && this._writableState.finished) {
        this.destroy();
      }
    }
    function duplexOnError(err) {
      this.removeListener("error", duplexOnError);
      this.destroy();
      if (this.listenerCount("error") === 0) {
        this.emit("error", err);
      }
    }
    function createWebSocketStream2(ws, options) {
      let terminateOnDestroy = true;
      const duplex = new Duplex({
        ...options,
        autoDestroy: false,
        emitClose: false,
        objectMode: false,
        writableObjectMode: false
      });
      ws.on("message", function message(msg, isBinary) {
        const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
        if (!duplex.push(data)) ws.pause();
      });
      ws.once("error", function error(err) {
        if (duplex.destroyed) return;
        terminateOnDestroy = false;
        duplex.destroy(err);
      });
      ws.once("close", function close() {
        if (duplex.destroyed) return;
        duplex.push(null);
      });
      duplex._destroy = function(err, callback) {
        if (ws.readyState === ws.CLOSED) {
          callback(err);
          process.nextTick(emitClose, duplex);
          return;
        }
        let called = false;
        ws.once("error", function error(err2) {
          called = true;
          callback(err2);
        });
        ws.once("close", function close() {
          if (!called) callback(err);
          process.nextTick(emitClose, duplex);
        });
        if (terminateOnDestroy) ws.terminate();
      };
      duplex._final = function(callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open6() {
            duplex._final(callback);
          });
          return;
        }
        if (ws._socket === null) return;
        if (ws._socket._writableState.finished) {
          callback();
          if (duplex._readableState.endEmitted) duplex.destroy();
        } else {
          ws._socket.once("finish", function finish() {
            callback();
          });
          ws.close();
        }
      };
      duplex._read = function() {
        if (ws.isPaused) ws.resume();
      };
      duplex._write = function(chunk, encoding, callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open6() {
            duplex._write(chunk, encoding, callback);
          });
          return;
        }
        ws.send(chunk, callback);
      };
      duplex.on("end", duplexOnEnd);
      duplex.on("error", duplexOnError);
      return duplex;
    }
    module.exports = createWebSocketStream2;
  }
});

// node_modules/.pnpm/ws@8.21.3/node_modules/ws/lib/subprotocol.js
var require_subprotocol = __commonJS({
  "node_modules/.pnpm/ws@8.21.3/node_modules/ws/lib/subprotocol.js"(exports, module) {
    "use strict";
    var { tokenChars } = require_validation();
    function parse2(header) {
      const protocols = /* @__PURE__ */ new Set();
      let start = -1;
      let end = -1;
      let i = 0;
      for (i; i < header.length; i++) {
        const code = header.charCodeAt(i);
        if (end === -1 && tokenChars[code] === 1) {
          if (start === -1) start = i;
        } else if (i !== 0 && (code === 32 || code === 9)) {
          if (end === -1 && start !== -1) end = i;
        } else if (code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1) end = i;
          const protocol2 = header.slice(start, end);
          if (protocols.has(protocol2)) {
            throw new SyntaxError(`The "${protocol2}" subprotocol is duplicated`);
          }
          protocols.add(protocol2);
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      }
      if (start === -1 || end !== -1) {
        throw new SyntaxError("Unexpected end of input");
      }
      const protocol = header.slice(start, i);
      if (protocols.has(protocol)) {
        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
      }
      protocols.add(protocol);
      return protocols;
    }
    module.exports = { parse: parse2 };
  }
});

// node_modules/.pnpm/ws@8.21.3/node_modules/ws/lib/websocket-server.js
var require_websocket_server = __commonJS({
  "node_modules/.pnpm/ws@8.21.3/node_modules/ws/lib/websocket-server.js"(exports, module) {
    "use strict";
    var EventEmitter = __require("events");
    var http = __require("http");
    var { Duplex } = __require("stream");
    var { createHash: createHash13 } = __require("crypto");
    var extension2 = require_extension();
    var PerMessageDeflate2 = require_permessage_deflate();
    var subprotocol2 = require_subprotocol();
    var WebSocket2 = require_websocket();
    var { CLOSE_TIMEOUT, GUID, kWebSocket } = require_constants();
    var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
    var RUNNING = 0;
    var CLOSING = 1;
    var CLOSED = 2;
    var WebSocketServer2 = class extends EventEmitter {
      /**
       * Create a `WebSocketServer` instance.
       *
       * @param {Object} options Configuration options
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Boolean} [options.autoPong=true] Specifies whether or not to
       *     automatically send a pong in response to a ping
       * @param {Number} [options.backlog=511] The maximum length of the queue of
       *     pending connections
       * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
       *     track clients
       * @param {Number} [options.closeTimeout=30000] Duration in milliseconds to
       *     wait for the closing handshake to finish after `websocket.close()` is
       *     called
       * @param {Function} [options.handleProtocols] A hook to handle protocols
       * @param {String} [options.host] The hostname where to bind the server
       * @param {Number} [options.maxBufferedChunks=262144] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=16384] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=104857600] The maximum allowed message
       *     size
       * @param {Boolean} [options.noServer=false] Enable no server mode
       * @param {String} [options.path] Accept only connections matching this path
       * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
       *     permessage-deflate
       * @param {Number} [options.port] The port where to bind the server
       * @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
       *     server to use
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @param {Function} [options.verifyClient] A hook to reject connections
       * @param {Function} [options.WebSocket=WebSocket] Specifies the `WebSocket`
       *     class to use. It must be the `WebSocket` class or class that extends it
       * @param {Function} [callback] A listener for the `listening` event
       */
      constructor(options, callback) {
        super();
        options = {
          allowSynchronousEvents: true,
          autoPong: true,
          maxBufferedChunks: 256 * 1024,
          maxFragments: 16 * 1024,
          maxPayload: 100 * 1024 * 1024,
          skipUTF8Validation: false,
          perMessageDeflate: false,
          handleProtocols: null,
          clientTracking: true,
          closeTimeout: CLOSE_TIMEOUT,
          verifyClient: null,
          noServer: false,
          backlog: null,
          // use default (511 as implemented in net.js)
          server: null,
          host: null,
          path: null,
          port: null,
          WebSocket: WebSocket2,
          ...options
        };
        if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) {
          throw new TypeError(
            'One and only one of the "port", "server", or "noServer" options must be specified'
          );
        }
        if (options.port != null) {
          this._server = http.createServer((req, res) => {
            const body = http.STATUS_CODES[426];
            res.writeHead(426, {
              "Content-Length": body.length,
              "Content-Type": "text/plain"
            });
            res.end(body);
          });
          this._server.listen(
            options.port,
            options.host,
            options.backlog,
            callback
          );
        } else if (options.server) {
          this._server = options.server;
        }
        if (this._server) {
          const emitConnection = this.emit.bind(this, "connection");
          this._removeListeners = addListeners(this._server, {
            listening: this.emit.bind(this, "listening"),
            error: this.emit.bind(this, "error"),
            upgrade: (req, socket, head) => {
              this.handleUpgrade(req, socket, head, emitConnection);
            }
          });
        }
        if (options.perMessageDeflate === true) options.perMessageDeflate = {};
        if (options.clientTracking) {
          this.clients = /* @__PURE__ */ new Set();
          this._shouldEmitClose = false;
        }
        this.options = options;
        this._state = RUNNING;
      }
      /**
       * Returns the bound address, the address family name, and port of the server
       * as reported by the operating system if listening on an IP socket.
       * If the server is listening on a pipe or UNIX domain socket, the name is
       * returned as a string.
       *
       * @return {(Object|String|null)} The address of the server
       * @public
       */
      address() {
        if (this.options.noServer) {
          throw new Error('The server is operating in "noServer" mode');
        }
        if (!this._server) return null;
        return this._server.address();
      }
      /**
       * Stop the server from accepting new connections and emit the `'close'` event
       * when all existing connections are closed.
       *
       * @param {Function} [cb] A one-time listener for the `'close'` event
       * @public
       */
      close(cb) {
        if (this._state === CLOSED) {
          if (cb) {
            this.once("close", () => {
              cb(new Error("The server is not running"));
            });
          }
          process.nextTick(emitClose, this);
          return;
        }
        if (cb) this.once("close", cb);
        if (this._state === CLOSING) return;
        this._state = CLOSING;
        if (this.options.noServer || this.options.server) {
          if (this._server) {
            this._removeListeners();
            this._removeListeners = this._server = null;
          }
          if (this.clients) {
            if (!this.clients.size) {
              process.nextTick(emitClose, this);
            } else {
              this._shouldEmitClose = true;
            }
          } else {
            process.nextTick(emitClose, this);
          }
        } else {
          const server = this._server;
          this._removeListeners();
          this._removeListeners = this._server = null;
          server.close(() => {
            emitClose(this);
          });
        }
      }
      /**
       * See if a given request should be handled by this server instance.
       *
       * @param {http.IncomingMessage} req Request object to inspect
       * @return {Boolean} `true` if the request is valid, else `false`
       * @public
       */
      shouldHandle(req) {
        if (this.options.path) {
          const index = req.url.indexOf("?");
          const pathname = index !== -1 ? req.url.slice(0, index) : req.url;
          if (pathname !== this.options.path) return false;
        }
        return true;
      }
      /**
       * Handle a HTTP Upgrade request.
       *
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @public
       */
      handleUpgrade(req, socket, head, cb) {
        socket.on("error", socketOnError);
        const key = req.headers["sec-websocket-key"];
        const upgrade = req.headers.upgrade;
        const version = +req.headers["sec-websocket-version"];
        if (req.method !== "GET") {
          const message = "Invalid HTTP method";
          abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
          return;
        }
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          const message = "Invalid Upgrade header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (key === void 0 || !keyRegex.test(key)) {
          const message = "Missing or invalid Sec-WebSocket-Key header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (version !== 13 && version !== 8) {
          const message = "Missing or invalid Sec-WebSocket-Version header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message, {
            "Sec-WebSocket-Version": "13, 8"
          });
          return;
        }
        if (!this.shouldHandle(req)) {
          abortHandshake(socket, 400);
          return;
        }
        const secWebSocketProtocol = req.headers["sec-websocket-protocol"];
        let protocols = /* @__PURE__ */ new Set();
        if (secWebSocketProtocol !== void 0) {
          try {
            protocols = subprotocol2.parse(secWebSocketProtocol);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Protocol header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
        const extensions = {};
        if (this.options.perMessageDeflate && secWebSocketExtensions !== void 0) {
          const perMessageDeflate = new PerMessageDeflate2({
            ...this.options.perMessageDeflate,
            isServer: true,
            maxPayload: this.options.maxPayload
          });
          try {
            const offers = extension2.parse(secWebSocketExtensions);
            if (offers[PerMessageDeflate2.extensionName]) {
              perMessageDeflate.accept(offers[PerMessageDeflate2.extensionName]);
              extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
            }
          } catch (err) {
            const message = "Invalid or unacceptable Sec-WebSocket-Extensions header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        if (this.options.verifyClient) {
          const info = {
            origin: req.headers[`${version === 8 ? "sec-websocket-origin" : "origin"}`],
            secure: !!(req.socket.authorized || req.socket.encrypted),
            req
          };
          if (this.options.verifyClient.length === 2) {
            this.options.verifyClient(info, (verified, code, message, headers) => {
              if (!verified) {
                return abortHandshake(socket, code || 401, message, headers);
              }
              this.completeUpgrade(
                extensions,
                key,
                protocols,
                req,
                socket,
                head,
                cb
              );
            });
            return;
          }
          if (!this.options.verifyClient(info)) return abortHandshake(socket, 401);
        }
        this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
      }
      /**
       * Upgrade the connection to WebSocket.
       *
       * @param {Object} extensions The accepted extensions
       * @param {String} key The value of the `Sec-WebSocket-Key` header
       * @param {Set} protocols The subprotocols
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @throws {Error} If called more than once with the same socket
       * @private
       */
      completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
        if (!socket.readable || !socket.writable) return socket.destroy();
        if (socket[kWebSocket]) {
          throw new Error(
            "server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration"
          );
        }
        if (this._state > RUNNING) return abortHandshake(socket, 503);
        const digest5 = createHash13("sha1").update(key + GUID).digest("base64");
        const headers = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Accept: ${digest5}`
        ];
        const ws = new this.options.WebSocket(null, void 0, this.options);
        if (protocols.size) {
          const protocol = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
          if (protocol) {
            headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
            ws._protocol = protocol;
          }
        }
        if (extensions[PerMessageDeflate2.extensionName]) {
          const params = extensions[PerMessageDeflate2.extensionName].params;
          const value = extension2.format({
            [PerMessageDeflate2.extensionName]: [params]
          });
          headers.push(`Sec-WebSocket-Extensions: ${value}`);
          ws._extensions = extensions;
        }
        this.emit("headers", headers, req);
        socket.write(headers.concat("\r\n").join("\r\n"));
        socket.removeListener("error", socketOnError);
        ws.setSocket(socket, head, {
          allowSynchronousEvents: this.options.allowSynchronousEvents,
          maxBufferedChunks: this.options.maxBufferedChunks,
          maxFragments: this.options.maxFragments,
          maxPayload: this.options.maxPayload,
          skipUTF8Validation: this.options.skipUTF8Validation
        });
        if (this.clients) {
          this.clients.add(ws);
          ws.on("close", () => {
            this.clients.delete(ws);
            if (this._shouldEmitClose && !this.clients.size) {
              process.nextTick(emitClose, this);
            }
          });
        }
        cb(ws, req);
      }
    };
    module.exports = WebSocketServer2;
    function addListeners(server, map) {
      for (const event of Object.keys(map)) server.on(event, map[event]);
      return function removeListeners() {
        for (const event of Object.keys(map)) {
          server.removeListener(event, map[event]);
        }
      };
    }
    function emitClose(server) {
      server._state = CLOSED;
      server.emit("close");
    }
    function socketOnError() {
      this.destroy();
    }
    function abortHandshake(socket, code, message, headers) {
      message = message || http.STATUS_CODES[code];
      headers = {
        Connection: "close",
        "Content-Type": "text/html",
        "Content-Length": Buffer.byteLength(message),
        ...headers
      };
      socket.once("finish", socket.destroy);
      socket.end(
        `HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r
` + Object.keys(headers).map((h) => `${h}: ${headers[h]}`).join("\r\n") + "\r\n\r\n" + message
      );
    }
    function abortHandshakeOrEmitwsClientError(server, req, socket, code, message, headers) {
      if (server.listenerCount("wsClientError")) {
        const err = new Error(message);
        Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);
        server.emit("wsClientError", err, socket, req);
      } else {
        abortHandshake(socket, code, message, headers);
      }
    }
  }
});

// packages/runner/src/cli.ts
import { parseArgs } from "node:util";
import { join as join17 } from "node:path";
import { existsSync as existsSync11 } from "node:fs";

// packages/protocol/src/diagnostics.ts
import { appendFileSync, existsSync, mkdirSync, renameSync, rmSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
var DIAGNOSTIC_MAX_BYTES = 10 * 1024 * 1024;
var DIAGNOSTIC_FILES = 5;
function assertSupportedNodeRuntime(version = process.versions.node) {
  const [major = 0, minor = 0] = version.split(".").map(Number);
  if (!(major >= 24 || major === 22 && minor >= 16)) {
    throw new Error(`Node 22.16+ LTS or 24+ is required; found ${version}`);
  }
}
function createDiagnosticLogger(file, options = {}) {
  const path = resolve(file);
  const maxBytes = options.maxBytes ?? DIAGNOSTIC_MAX_BYTES;
  const files = options.files ?? DIAGNOSTIC_FILES;
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 128 || !Number.isSafeInteger(files) || files < 1 || files > 100) {
    throw new Error("invalid diagnostic rotation limits");
  }
  mkdirSync(dirname(path), { recursive: true, mode: 448 });
  let errorReported = false;
  return (message) => {
    let text = message.replace(/Bearer\s+[^\s"']+/gi, "Bearer <redacted>");
    for (const secret of options.secrets ?? []) if (secret) text = text.replaceAll(secret, "<redacted>");
    let line = `${(/* @__PURE__ */ new Date()).toISOString()} ${text.replaceAll("\r", "").replaceAll("\n", "\\n")}
`;
    if (Buffer.byteLength(line) > maxBytes) line = `${(/* @__PURE__ */ new Date()).toISOString()} [diagnostic message exceeds ${maxBytes} bytes; see durable execution records]
`;
    try {
      const size = existsSync(path) ? statSync(path).size : 0;
      if (size + Buffer.byteLength(line) > maxBytes) {
        const oldest = files === 1 ? path : `${path}.${files - 1}`;
        if (existsSync(oldest)) rmSync(oldest);
        for (let index = files - 2; index >= 1; index--) {
          if (existsSync(`${path}.${index}`)) renameSync(`${path}.${index}`, `${path}.${index + 1}`);
        }
        if (files > 1 && existsSync(path)) renameSync(path, `${path}.1`);
      }
      appendFileSync(path, line, { mode: 384 });
      errorReported = false;
    } catch (error) {
      if (!errorReported) {
        errorReported = true;
        const failure2 = error instanceof Error ? error : new Error(String(error));
        if (options.onError) options.onError(failure2);
        else process.stderr.write(`[diagnostics] write failed: ${failure2.message}
`);
      }
    }
    options.mirror?.(line.trimEnd());
  };
}

// packages/runner/src/config.ts
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve as resolve2, isAbsolute as isAbsolute3 } from "node:path";

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/external.js
var external_exports = {};
__export(external_exports, {
  BRAND: () => BRAND,
  DIRTY: () => DIRTY,
  EMPTY_PATH: () => EMPTY_PATH,
  INVALID: () => INVALID,
  NEVER: () => NEVER,
  OK: () => OK,
  ParseStatus: () => ParseStatus,
  Schema: () => ZodType,
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBigInt: () => ZodBigInt,
  ZodBoolean: () => ZodBoolean,
  ZodBranded: () => ZodBranded,
  ZodCatch: () => ZodCatch,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodEffects: () => ZodEffects,
  ZodEnum: () => ZodEnum,
  ZodError: () => ZodError,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodFunction: () => ZodFunction,
  ZodIntersection: () => ZodIntersection,
  ZodIssueCode: () => ZodIssueCode,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNativeEnum: () => ZodNativeEnum,
  ZodNever: () => ZodNever,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodParsedType: () => ZodParsedType,
  ZodPipeline: () => ZodPipeline,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRecord: () => ZodRecord,
  ZodSchema: () => ZodType,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodSymbol: () => ZodSymbol,
  ZodTransformer: () => ZodEffects,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  addIssueToContext: () => addIssueToContext,
  any: () => anyType,
  array: () => arrayType,
  bigint: () => bigIntType,
  boolean: () => booleanType,
  coerce: () => coerce,
  custom: () => custom,
  date: () => dateType,
  datetimeRegex: () => datetimeRegex,
  defaultErrorMap: () => en_default,
  discriminatedUnion: () => discriminatedUnionType,
  effect: () => effectsType,
  enum: () => enumType,
  function: () => functionType,
  getErrorMap: () => getErrorMap,
  getParsedType: () => getParsedType,
  instanceof: () => instanceOfType,
  intersection: () => intersectionType,
  isAborted: () => isAborted,
  isAsync: () => isAsync,
  isDirty: () => isDirty,
  isValid: () => isValid,
  late: () => late,
  lazy: () => lazyType,
  literal: () => literalType,
  makeIssue: () => makeIssue,
  map: () => mapType,
  nan: () => nanType,
  nativeEnum: () => nativeEnumType,
  never: () => neverType,
  null: () => nullType,
  nullable: () => nullableType,
  number: () => numberType,
  object: () => objectType,
  objectUtil: () => objectUtil,
  oboolean: () => oboolean,
  onumber: () => onumber,
  optional: () => optionalType,
  ostring: () => ostring,
  pipeline: () => pipelineType,
  preprocess: () => preprocessType,
  promise: () => promiseType,
  quotelessJson: () => quotelessJson,
  record: () => recordType,
  set: () => setType,
  setErrorMap: () => setErrorMap,
  strictObject: () => strictObjectType,
  string: () => stringType,
  symbol: () => symbolType,
  transformer: () => effectsType,
  tuple: () => tupleType,
  undefined: () => undefinedType,
  union: () => unionType,
  unknown: () => unknownType,
  util: () => util,
  void: () => voidType
});

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/util.js
var util;
(function(util2) {
  util2.assertEqual = (_) => {
  };
  function assertIs(_arg) {
  }
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error();
  }
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object2) => {
    const keys = [];
    for (const key in object2) {
      if (Object.prototype.hasOwnProperty.call(object2, key)) {
        keys.push(key);
      }
    }
    return keys;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return void 0;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
      // second overwrites first
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = (data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
};

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/ZodError.js
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var quotelessJson = (obj) => {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(/"([^"]+)":/g, "$1:");
};
var ZodError = class _ZodError extends Error {
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    };
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof _ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        const firstEl = sub.path[0];
        fieldErrors[firstEl] = fieldErrors[firstEl] || [];
        fieldErrors[firstEl].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
};
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/locales/en.js
var errorMap = (issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "bigint")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};
var en_default = errorMap;

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/errors.js
var overrideErrorMap = en_default;
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/parseUtil.js
var makeIssue = (params) => {
  const { data, path, errorMaps, issueData } = params;
  const fullPath = [...path, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== void 0) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage = "";
  const maps = errorMaps.filter((m) => !!m).slice().reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage
  };
};
var EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === en_default ? void 0 : en_default
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
var ParseStatus = class _ParseStatus {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted")
        return INVALID;
      if (s.status === "dirty")
        status.dirty();
      arrayValue.push(s.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key,
        value
      });
    }
    return _ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
};
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = (value) => ({ status: "dirty", value });
var OK = (value) => ({ status: "valid", value });
var isAborted = (x) => x.status === "aborted";
var isDirty = (x) => x.status === "dirty";
var isValid = (x) => x.status === "valid";
var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
})(errorUtil || (errorUtil = {}));

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/types.js
var ParseInputLazyPath = class {
  constructor(parent, value, path, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (Array.isArray(this._key)) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
};
var handleResult = (ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error = new ZodError(ctx.common.issues);
        this._error = error;
        return this._error;
      }
    };
  }
};
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
var ZodType = class {
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus(),
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    const ctx = {
      common: {
        issues: [],
        async: params?.async ?? false,
        contextualErrorMap: params?.errorMap
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  "~validate"(data) {
    const ctx = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    if (!this["~standard"].async) {
      try {
        const result = this._parseSync({ data, path: [], parent: ctx });
        return isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        };
      } catch (err) {
        if (err?.message?.toLowerCase()?.includes("encountered")) {
          this["~standard"].async = true;
        }
        ctx.common = {
          issues: [],
          async: true
        };
      }
    }
    return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
      value: result.value
    } : {
      issues: ctx.common.issues
    });
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params?.errorMap,
        async: true
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message) {
    const getIssueProperties = (val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    };
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = () => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      });
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (data) => this["~validate"](data)
    };
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
};
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
var emojiRegex;
var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version) {
  if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
var ZodString = class _ZodString extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "jwt") {
        if (!isValidJWT(input.data, check.alg)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cidr") {
        if (!isValidCidr(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cidr",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64url") {
        if (!base64urlRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
  }
  _addCheck(check) {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
  }
  base64url(message) {
    return this._addCheck({
      kind: "base64url",
      ...errorUtil.errToObj(message)
    });
  }
  jwt(options) {
    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  cidr(options) {
    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      offset: options?.offset ?? false,
      local: options?.local ?? false,
      ...errorUtil.errToObj(options?.message)
    });
  }
  date(message) {
    return this._addCheck({ kind: "date", message });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      ...errorUtil.errToObj(options?.message)
    });
  }
  duration(message) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options?.position,
      ...errorUtil.errToObj(options?.message)
    });
  }
  startsWith(value, message) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value, message) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(message) {
    return this.min(1, errorUtil.errToObj(message));
  }
  trim() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((ch) => ch.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((ch) => ch.kind === "base64url");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodString.create = (params) => {
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
var ZodNumber = class _ZodNumber extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null;
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
};
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodBigInt = class _ZodBigInt extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      try {
        input.data = BigInt(input.data);
      } catch {
        return this._getInvalidInput(input);
      }
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return this._getInvalidInput(input);
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _getInvalidInput(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.bigint,
      received: ctx.parsedType
    });
    return INVALID;
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodBigInt.create = (params) => {
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
var ZodBoolean = class extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodDate = class _ZodDate extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (Number.isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new _ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
};
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: params?.coerce || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};
var ZodSymbol = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};
var ZodUndefined = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};
var ZodNull = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};
var ZodAny = class extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};
var ZodUnknown = class extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};
var ZodNever = class extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
};
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};
var ZodVoid = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};
var ZodArray = class _ZodArray extends ZodType {
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : void 0,
          maximum: tooBig ? def.exactLength.value : void 0,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      })).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new _ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new _ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new _ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
var ZodObject = class _ZodObject extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    this._cached = { shape, keys };
    return this._cached;
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip") {
      } else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value, ctx.path, key)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message !== void 0 ? {
        errorMap: (issue, ctx) => {
          const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: errorUtil.errToObj(message).message ?? defaultError
            };
          return {
            message: defaultError
          };
        }
      } : {}
    });
  }
  strip() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(augmentation) {
    return new _ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(merging) {
    const merged = new _ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(index) {
    return new _ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    for (const key of util.objectKeys(mask)) {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
};
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
var ZodUnion = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = void 0;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
};
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = (type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [void 0];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [void 0, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
};
var ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create(discriminator, options, params) {
    const optionsMap = /* @__PURE__ */ new Map();
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
      }
    }
    return new _ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
};
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
var ZodIntersection = class extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = (parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    };
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
};
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};
var ZodTuple = class _ZodTuple extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x) => !!x);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new _ZodTuple({
      ...this._def,
      rest
    });
  }
};
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};
var ZodRecord = class _ZodRecord extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new _ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new _ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
};
var ZodMap = class extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = /* @__PURE__ */ new Map();
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
};
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};
var ZodSet = class _ZodSet extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = /* @__PURE__ */ new Set();
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new _ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new _ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size, message) {
    return this.min(size, message).max(size, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};
var ZodFunction = class _ZodFunction extends ZodType {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error
        }
      });
    }
    function makeReturnsIssue(returns, error) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error
        }
      });
    }
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
          error.addIssue(makeArgsIssue(args, e));
          throw error;
        });
        const result = await Reflect.apply(fn, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
          error.addIssue(makeReturnsIssue(result, e));
          throw error;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new _ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new _ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new _ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
};
var ZodLazy = class extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
};
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};
var ZodLiteral = class extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
};
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values2, params) {
  return new ZodEnum({
    values: values2,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
var ZodEnum = class _ZodEnum extends ZodType {
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(this._def.values);
    }
    if (!this._cache.has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values2, newDef = this._def) {
    return _ZodEnum.create(values2, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values2, newDef = this._def) {
    return _ZodEnum.create(this.options.filter((opt) => !values2.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
};
ZodEnum.create = createZodEnum;
var ZodNativeEnum = class extends ZodType {
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(util.getValidEnumValues(this._def.values));
    }
    if (!this._cache.has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
};
ZodNativeEnum.create = (values2, params) => {
  return new ZodNativeEnum({
    values: values2,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};
var ZodPromise = class extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
};
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};
var ZodEffects = class extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: (arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      },
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status.value === "aborted")
            return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        });
      } else {
        if (status.value === "aborted")
          return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted")
          return INVALID;
        if (result.status === "dirty")
          return DIRTY(result.value);
        if (status.value === "dirty")
          return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = (acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      };
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base2 = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base2))
          return INVALID;
        const result = effect.transform(base2.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base2) => {
          if (!isValid(base2))
            return INVALID;
          return Promise.resolve(effect.transform(base2.value, checkCtx)).then((result) => ({
            status: status.value,
            value: result
          }));
        });
      }
    }
    util.assertNever(effect);
  }
};
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
var ZodOptional = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(void 0);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};
var ZodNullable = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};
var ZodDefault = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
};
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};
var ZodCatch = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
};
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};
var ZodNaN = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
};
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var BRAND = Symbol("zod_brand");
var ZodBranded = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
};
var ZodPipeline = class _ZodPipeline extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      };
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a, b) {
    return new _ZodPipeline({
      in: a,
      out: b,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
};
var ZodReadonly = class extends ZodType {
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = (data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    };
    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
function cleanParams(params, data) {
  const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p2 = typeof p === "string" ? { message: p } : p;
  return p2;
}
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      const r = check(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var instanceOfType = (cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params);
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
var ostring = () => stringType().optional();
var onumber = () => numberType().optional();
var oboolean = () => booleanType().optional();
var coerce = {
  string: ((arg) => ZodString.create({ ...arg, coerce: true })),
  number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
  boolean: ((arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  })),
  bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
  date: ((arg) => ZodDate.create({ ...arg, coerce: true }))
};
var NEVER = INVALID;

// packages/protocol/src/recovery.ts
var id = external_exports.string().min(1).max(200);
var CheckpointRequestSchema = external_exports.object({
  requestId: id,
  attemptId: id,
  epoch: external_exports.number().int().positive(),
  expectedVersion: external_exports.number().int().nonnegative(),
  phase: external_exports.enum(["model_before", "model_result", "tool_before", "tool_result", "final"]),
  tool: external_exports.string().max(128).optional(),
  operationId: id.optional(),
  callId: external_exports.string().min(1).max(256).optional(),
  actionHash: external_exports.string().regex(/^[a-f0-9]{64}$/).optional(),
  payload: external_exports.record(external_exports.string(), external_exports.unknown()).refine((v) => new TextEncoder().encode(JSON.stringify(v)).length <= 48e3, "checkpoint exceeds 48000 bytes")
}).strict().refine((v) => v.phase.startsWith("tool_") ? !!(v.tool && v.operationId && v.callId && v.actionHash) : ![v.tool, v.operationId, v.callId, v.actionHash].some((x) => x !== void 0), "tool checkpoint metadata does not match phase");
var CheckpointDecisionSchema = external_exports.object({ requestId: id, attemptId: id, epoch: external_exports.number().int(), approved: external_exports.boolean(), reason: external_exports.string(), version: external_exports.number().int(), remainingMs: external_exports.number().int().nonnegative() }).strict();
var RecoveryContextSchema = external_exports.object({
  version: external_exports.literal(1),
  roundId: id,
  attemptId: id,
  epoch: external_exports.number().int().positive(),
  checkpointVersion: external_exports.number().int().nonnegative(),
  remainingMs: external_exports.number().int().nonnegative(),
  checkpoint: external_exports.record(external_exports.string(), external_exports.unknown()).nullable()
}).strict();
var RecoverySummarySchema = external_exports.object({ roundId: id, attemptNumber: external_exports.number().int(), maxAttempts: external_exports.number().int(), epoch: external_exports.number().int(), state: external_exports.string(), reason: external_exports.string().nullable(), checkpointVersion: external_exports.number().int(), phase: external_exports.string().nullable(), leaseExpiresAt: external_exports.number().nullable() });

// packages/protocol/src/transfers.ts
var TRANSFER_CHUNK_BYTES = 256 * 1024;
var TRANSFER_PROTOCOL = "runner-transfer-v1";
var transferCapabilityId = (role) => `capability:transfer:${role}`;
var TransferHashSchema = external_exports.string().regex(/^[a-f0-9]{64}$/);
var TransferIdSchema = external_exports.string().regex(/^[A-Za-z0-9_-]{1,128}$/);
var TransferSourceSchema = external_exports.object({ deviceId: external_exports.string().min(1).max(128), resourceId: external_exports.string().min(1).max(128), rootId: external_exports.string().min(1).max(128), generation: TransferHashSchema, path: external_exports.string().min(1).max(512).refine((p) => !p.includes("\\") && !p.includes(":") && !p.startsWith("/") && p.split("/").every((s) => s && s !== "." && s !== ".."), "invalid relative file path"), fileVersion: TransferHashSchema, sizeBytes: external_exports.number().int().nonnegative() }).strict();
var TransferStepSchema = external_exports.object({ tool: external_exports.literal("files.transfer"), deviceId: external_exports.string().min(1).max(128), source: external_exports.object({ deviceId: external_exports.string().min(1).max(128), resourceId: external_exports.string().min(1).max(128) }).strict(), args: external_exports.object({}).strict().default({}) }).strict();
var TransferFileSchema = external_exports.object({ transferId: TransferIdSchema, taskId: TransferIdSchema, sha256: TransferHashSchema, sizeBytes: external_exports.number().int().nonnegative() }).strict();
var PlanInputReferenceSchema = external_exports.object({ version: external_exports.number().int().min(1).max(16), step: external_exports.number().int().min(1).max(16) }).strict();
var oneFileInput = (v) => [v.transferStep ?? v.inputStep, v.inputFile, v.inputFrom].filter((x) => x !== void 0).length === 1;
var ReadInputStepSchema = external_exports.object({ tool: external_exports.literal("files.read-input"), deviceId: external_exports.string().min(1).max(128), transferStep: external_exports.number().int().min(1).max(16).optional(), inputFile: TransferFileSchema.optional(), inputFrom: PlanInputReferenceSchema.optional(), args: external_exports.object({ maxBytes: external_exports.number().int().min(1).max(2048).default(2048) }).strict().default({}) }).strict().refine(oneFileInput, "exactly one committed input or earlier transfer is required");
var TransferPinSchema = external_exports.object({ expectedVersion: external_exports.number().int().positive(), sha256: TransferHashSchema, sizeBytes: external_exports.number().int().nonnegative() }).strict();

// packages/protocol/src/compute.ts
var id2 = external_exports.string().regex(/^[A-Za-z0-9_.:-]{1,128}$/);
var WorkspacePathSchema = external_exports.string().min(1).max(240).refine((p) => !p.includes("\\") && !p.startsWith("/") && p.split("/").every((s) => s && !s.startsWith(".") && !/[<>:"|?*\x00-\x1f]/.test(s) && !/[. ]$/.test(s) && !/^(con|prn|aux|nul|clock\$|com[0-9¹²³]|lpt[0-9¹²³])(?:\.|$)/i.test(s)), "unsafe task-relative path");
var WorkspaceActionSchema = external_exports.discriminatedUnion("action", [
  external_exports.object({ action: external_exports.literal("inspect") }).strict(),
  external_exports.object({ action: external_exports.literal("write"), path: WorkspacePathSchema, text: external_exports.string().max(16e3) }).strict(),
  external_exports.object({ action: external_exports.literal("read"), path: WorkspacePathSchema, maxBytes: external_exports.number().int().min(1).max(3e3).default(3e3) }).strict(),
  external_exports.object({ action: external_exports.literal("import"), path: WorkspacePathSchema }).strict(),
  external_exports.object({ action: external_exports.literal("run"), command: id2, args: external_exports.array(external_exports.string().max(16e3)).max(64), timeoutSeconds: external_exports.number().int().min(1).max(300).default(60) }).strict(),
  external_exports.object({ action: external_exports.literal("prepare"), requirements: external_exports.array(external_exports.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.-]*(?:==[A-Za-z0-9_.+!-]+)?$/)).max(32).default([]) }).strict(),
  external_exports.object({ action: external_exports.literal("publish"), paths: external_exports.array(WorkspacePathSchema).min(1).max(8).refine((v) => new Set(v).size === v.length && v.every((p) => p.startsWith("output/")), "unique output/ paths required") }).strict()
]);
var WorkspaceDescriptorSchema = external_exports.object({ mode: external_exports.literal("trusted-host"), network: external_exports.literal("host"), commands: external_exports.array(id2).min(1).max(16), packageInstall: external_exports.boolean(), maxDurationMs: external_exports.number().int().min(1e3).max(3e5) }).strict();

// packages/protocol/src/operations.ts
var id3 = external_exports.string().regex(/^[A-Za-z0-9_.:-]{1,128}$/);
var hash = external_exports.string().regex(/^[a-f0-9]{64}$/);
var OperationValueSchema = external_exports.union([external_exports.string().max(4096), external_exports.number().finite(), external_exports.boolean(), external_exports.null()]);
var OperationValuesSchema = external_exports.record(external_exports.string().regex(/^[A-Za-z][A-Za-z0-9_]{0,63}$/), OperationValueSchema).refine((v) => Object.keys(v).length <= 32 && JSON.stringify(v).length <= 8192, "operation payload too large");
var OperationFieldSchema = external_exports.object({ type: external_exports.enum(["string", "number", "boolean"]), required: external_exports.boolean().default(true), maxLength: external_exports.number().int().min(1).max(4096).optional() }).strict();
var OperationActionSchema = external_exports.object({ name: id3, fields: external_exports.record(external_exports.string().regex(/^[A-Za-z][A-Za-z0-9_]{0,63}$/), OperationFieldSchema).refine((v) => Object.keys(v).length <= 32) }).strict();
var OperationDescriptorSchema = external_exports.object({ version: external_exports.literal(1), kind: external_exports.enum(["archive", "service", "workspace"]), generation: hash, semantics: external_exports.enum(["idempotent-queryable", "query-only", "unqueryable"]), cancelable: external_exports.literal(false), actions: external_exports.array(OperationActionSchema).min(1).max(16), workspace: WorkspaceDescriptorSchema.optional() }).strict();
var OperationStepSchema = external_exports.discriminatedUnion("tool", [
  external_exports.object({ tool: external_exports.literal("service.invoke"), deviceId: id3, capabilityId: id3, businessKey: id3, args: external_exports.object({ action: id3, payload: OperationValuesSchema }).strict() }).strict(),
  external_exports.object({ tool: external_exports.literal("files.archive"), deviceId: id3, capabilityId: id3, businessKey: id3, inputStep: external_exports.number().int().min(1).max(16).optional(), inputFile: TransferFileSchema.optional(), inputFrom: PlanInputReferenceSchema.optional(), args: external_exports.object({ name: external_exports.string().min(1).max(200) }).strict() }).strict(),
  external_exports.object({ tool: external_exports.literal("workspace.execute"), deviceId: id3, capabilityId: id3, businessKey: id3, args: WorkspaceActionSchema, inputStep: external_exports.number().int().min(1).max(16).optional(), inputFile: TransferFileSchema.optional(), inputFrom: PlanInputReferenceSchema.optional() }).strict()
]).refine((s) => s.tool === "files.archive" || s.tool === "workspace.execute" && s.args.action === "import" ? oneFileInput(s) : s.tool !== "workspace.execute" || !s.inputStep && !s.inputFile && !s.inputFrom, "exactly one input is required for import/archive, and no input for other workspace actions");
var OperationIntentSchema = external_exports.union([
  external_exports.object({ kind: external_exports.enum(["archive", "service"]), action: id3, args: OperationValuesSchema, file: external_exports.object({ sha256: hash, sizeBytes: external_exports.number().int().nonnegative() }).strict().optional() }).strict(),
  external_exports.object({ kind: external_exports.literal("workspace"), action: id3, args: WorkspaceActionSchema, workspaceId: id3, file: external_exports.object({ sha256: hash, sizeBytes: external_exports.number().int().nonnegative() }).strict().optional() }).strict().refine((v) => v.action === v.args.action, "workspace action mismatch")
]);
var OperationObservationSchema = external_exports.object({ operationId: id3, intentHash: hash, status: external_exports.enum(["applied", "not_applied", "absent", "pending", "unknown", "not_started"]), effectId: external_exports.string().min(1).max(200).optional(), output: OperationValuesSchema.optional(), reason: external_exports.string().max(200).optional() }).strict().refine((v) => v.status !== "applied" || !!v.effectId, "applied observation requires effect identity");
var OperationRequestSchema = external_exports.object({
  version: external_exports.literal(1),
  taskId: id3,
  stepId: id3,
  operationId: id3,
  attemptId: id3,
  epoch: external_exports.number().int().positive(),
  requestId: id3,
  turnId: id3,
  runId: id3,
  sessionId: id3,
  nativeResourceKey: external_exports.string().min(1).max(4096),
  requestHash: hash,
  deviceId: id3,
  connectionId: id3,
  capabilityId: id3,
  descriptor: OperationDescriptorSchema,
  intent: OperationIntentSchema,
  intentHash: hash,
  inputFile: TransferFileSchema.optional(),
  tenantId: id3,
  phase: external_exports.enum(["execute", "query"]),
  expectedVersion: external_exports.number().int().positive(),
  capability: hash,
  remainingMs: external_exports.number().int().min(1).max(3e5),
  expiresAt: external_exports.number().int().positive()
}).strict();
var operationRequestPayload = (r) => ({ ...OperationRequestSchema.parse(r), requestHash: void 0 });
var OperationResultSchema = external_exports.object({ operationId: id3, attemptId: id3, epoch: external_exports.number().int().positive(), requestId: id3, runId: id3, requestHash: hash, observation: OperationObservationSchema }).strict().refine((v) => new TextEncoder().encode(JSON.stringify(v)).length <= 32768, "operation result exceeds grant");
var OperationClaimSchema = external_exports.object({ attemptId: id3, epoch: external_exports.number().int().positive(), requestId: id3, requestHash: hash, expectedVersion: external_exports.number().int().positive(), connectionId: id3 }).strict();
var OperationResolveSchema = external_exports.object({ clientId: id3, expectedVersion: external_exports.number().int().positive(), disposition: external_exports.enum(["applied", "not_applied"]), evidence: external_exports.string().min(1).max(2e3), effectId: external_exports.string().min(1).max(200).optional() }).strict();
var operationCapabilityId = (kind, name) => `operation:${kind}:${name}`;
function operationCanonical(value) {
  return JSON.stringify(value, (_k, v) => v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, v[k]])) : v);
}

// packages/protocol/src/remote.ts
var READONLY_TOOLS = ["device.info", "files.list", "files.read"];
var ReadonlyToolSchema = external_exports.enum(READONLY_TOOLS);
var REMOTE_RESULT_BYTES = 32768;
var id4 = external_exports.string().regex(/^[A-Za-z0-9_.:-]{1,128}$/);
var hash2 = external_exports.string().regex(/^[a-f0-9]{64}$/);
var RelativeResourcePath = external_exports.string().max(512).refine((p) => p === "" || !p.includes("\\") && !p.startsWith("/") && !p.includes(":") && p.split("/").every((s) => s && s !== "." && s !== ".."), "invalid relative resource path");
var ReadonlyDataSchemas = {
  "device.info": external_exports.object({ platform: external_exports.string().max(40), arch: external_exports.string().max(40), cpus: external_exports.number().int().nonnegative(), memoryMiB: external_exports.number().int().nonnegative(), tools: external_exports.array(ReadonlyToolSchema).max(3) }).strict(),
  "files.list": external_exports.object({ rootId: id4, generation: hash2, path: RelativeResourcePath, entries: external_exports.array(external_exports.object({ name: external_exports.string().min(1).max(200), kind: external_exports.enum(["file", "directory"]), sizeBytes: external_exports.number().int().nonnegative().optional() }).strict()).max(20), nextCursor: external_exports.string().max(200).nullable(), truncated: external_exports.boolean() }).strict(),
  "files.read": external_exports.object({ rootId: id4, generation: hash2, path: RelativeResourcePath, fileVersion: hash2, encoding: external_exports.literal("utf-8"), text: external_exports.string().max(4096), bytesRead: external_exports.number().int().min(0).max(2048), sourceSize: external_exports.number().int().nonnegative(), complete: external_exports.boolean(), sha256: hash2.optional() }).strict()
};
var RemoteStepInputSchema = external_exports.discriminatedUnion("tool", [
  external_exports.object({ deviceId: id4, tool: external_exports.literal("device.info"), args: external_exports.object({}).strict().default({}) }).strict(),
  external_exports.object({ deviceId: id4, tool: external_exports.literal("files.list"), resourceId: id4, args: external_exports.object({ path: RelativeResourcePath.default(""), after: external_exports.string().max(200).optional(), limit: external_exports.number().int().min(1).max(20).default(20) }).strict().default({}) }).strict(),
  external_exports.object({ deviceId: id4, tool: external_exports.literal("files.read"), resourceId: id4, args: external_exports.object({ maxBytes: external_exports.number().int().min(1).max(2048).default(2048) }).strict().default({}) }).strict()
]);
var RemoteWorkflowStepSchema = external_exports.union([RemoteStepInputSchema, TransferStepSchema, ReadInputStepSchema, OperationStepSchema]);
var RemoteTaskInputSchema = external_exports.object({
  version: external_exports.literal(3),
  clientId: id4,
  title: external_exports.string().min(1).max(200),
  steps: external_exports.array(RemoteWorkflowStepSchema).min(1).max(16),
  budget: external_exports.object({ maxToolCalls: external_exports.number().int().min(1).max(100).default(20), maxResultBytes: external_exports.number().int().min(REMOTE_RESULT_BYTES).max(16 * 1024 * 1024).default(1024 * 1024), deadlineSeconds: external_exports.number().int().min(1).max(3600).default(300) }).strict().default({})
}).strict();
var RemoteRequestSchema = external_exports.object({
  version: external_exports.literal(1),
  taskId: id4,
  stepId: id4,
  attemptId: id4,
  epoch: external_exports.number().int().positive(),
  requestId: id4,
  turnId: id4,
  runId: id4,
  sessionId: id4,
  nativeResourceKey: external_exports.string().min(1).max(4096),
  requestHash: hash2,
  remainingMs: external_exports.number().int().min(1).max(3e5),
  expiresAt: external_exports.number().int().positive(),
  call: RemoteStepInputSchema,
  priorInputTaskId: id4.optional(),
  inputFile: TransferFileSchema.optional(),
  root: external_exports.object({ id: id4, generation: hash2, path: RelativeResourcePath, fileVersion: hash2.optional() }).strict().optional()
}).strict();
var remoteRequestPayload = (request) => ({ ...RemoteRequestSchema.parse(request), requestHash: void 0 });
var RemoteResultSchema = external_exports.object({
  taskId: id4,
  stepId: id4,
  attemptId: id4,
  epoch: external_exports.number().int().positive(),
  requestId: id4,
  runId: id4,
  requestHash: hash2,
  ok: external_exports.boolean(),
  data: external_exports.record(external_exports.string(), external_exports.unknown()).optional(),
  error: external_exports.enum(["invalid_request", "root_not_authorized", "input_changed", "binary_input", "io_error", "deadline", "output_limit"]).optional()
}).strict().refine((v) => v.ok ? v.data !== void 0 && v.error === void 0 : v.error !== void 0 && v.data === void 0, "invalid result disposition").refine((v) => new TextEncoder().encode(JSON.stringify(v)).length <= REMOTE_RESULT_BYTES, "remote result exceeds output grant");
var readonlyCapabilityId = (tool) => `capability:readonly:${tool}`;

// packages/protocol/src/planner.ts
var id5 = external_exports.string().regex(/^[A-Za-z0-9_.:-]{1,128}$/);
var ModelDescriptorSchema = external_exports.object({ model: external_exports.string().min(1).max(128), generation: external_exports.string().regex(/^[a-f0-9]{64}$/), protocol: external_exports.literal("chat-completions"), verified: external_exports.literal(false) }).strict();
var ModelServiceConfigSchema = external_exports.object({ id: id5, label: external_exports.string().min(1).max(100), model: external_exports.string().min(1).max(128), endpoint: external_exports.string().url(), apiKeyEnv: external_exports.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/).optional(), allowInsecureLoopback: external_exports.boolean().default(false) }).strict().superRefine((c, ctx) => {
  const u = new URL(c.endpoint);
  if (u.username || u.password || u.search || u.hash || !(u.protocol === "https:" || c.allowInsecureLoopback && u.protocol === "http:" && ["127.0.0.1", "localhost", "[::1]"].includes(u.hostname))) ctx.addIssue({ code: "custom", message: "model endpoint requires HTTPS, or explicit insecure loopback; embedded credentials/query are forbidden" });
});
var ChatToolSchema = external_exports.object({ type: external_exports.literal("function"), function: external_exports.object({ name: external_exports.string().min(1).max(64), description: external_exports.string().max(3e3), parameters: external_exports.record(external_exports.unknown()) }).strict() }).strict();
var ChatToolCallSchema = external_exports.object({ id: external_exports.string().min(1).max(128), type: external_exports.literal("function"), function: external_exports.object({ name: external_exports.string().min(1).max(64), arguments: external_exports.string().max(64e3) }).strict() }).strict();
var ChatMessageSchema = external_exports.object({ role: external_exports.enum(["system", "user", "assistant", "tool"]), content: external_exports.string().max(256e3).nullable(), tool_call_id: external_exports.string().max(128).optional(), tool_calls: external_exports.array(ChatToolCallSchema).max(8).optional() }).strict();
var ChatPayloadSchema = external_exports.object({ messages: external_exports.array(ChatMessageSchema).min(1).max(128), tools: external_exports.array(ChatToolSchema).max(16), max_tokens: external_exports.number().int().min(64).max(8192) }).strict();
var ChatReplySchema = external_exports.object({ message: ChatMessageSchema.refine((v) => v.role === "assistant", "assistant response required"), usage: external_exports.object({ prompt_tokens: external_exports.number().int().nonnegative(), completion_tokens: external_exports.number().int().nonnegative() }).strict().nullable() }).strict();
var ModelStartSchema = external_exports.object({ t: external_exports.literal("model.start"), requestId: id5, connectionId: id5, capabilityId: id5, generation: external_exports.string().regex(/^[a-f0-9]{64}$/), remainingMs: external_exports.number().int().min(1).max(3e5), payload: ChatPayloadSchema }).strict();
var ModelResultSchema = external_exports.object({ t: external_exports.literal("model.result"), requestId: id5, connectionId: id5, reply: ChatReplySchema.optional(), error: external_exports.enum(["unavailable", "canceled", "transport", "invalid-response", "duplicate"]).optional() }).strict();
var AgentTaskInputSchema = external_exports.object({ version: external_exports.literal(4), clientId: id5, goal: external_exports.string().min(1).max(16e3), provider: external_exports.object({ deviceId: id5, capabilityId: id5 }).strict(), constraints: external_exports.object({ deviceIds: external_exports.array(id5).min(1).max(64).optional(), readOnly: external_exports.boolean().default(false) }).strict().default({}), budget: external_exports.object({ maxModelRequests: external_exports.number().int().min(1).max(50).default(10), maxToolCalls: external_exports.number().int().min(1).max(100).default(20), maxTokens: external_exports.number().int().min(1024).max(2e6).default(2e5), maxOutputTokens: external_exports.number().int().min(64).max(8192).default(2048), deadlineSeconds: external_exports.number().int().min(10).max(3600).default(300) }).strict().default({}) }).strict();

// packages/protocol/src/workspace.ts
var InputRootSchema = external_exports.object({ id: external_exports.string().regex(/^[a-zA-Z0-9_-]{1,64}$/), label: external_exports.string().min(1).max(100), generation: external_exports.string().regex(/^[a-f0-9]{64}$/).optional() }).strict();
var InputRefSchema = external_exports.object({
  id: external_exports.string().min(1).max(100),
  machineId: external_exports.string().min(1).max(100),
  rootId: InputRootSchema.shape.id,
  path: external_exports.string().min(1).max(512),
  name: external_exports.string().min(1).max(255),
  sha256: external_exports.string().regex(/^[a-f0-9]{64}$/),
  sizeBytes: external_exports.number().int().min(0).max(256 * 1024 * 1024),
  modifiedAt: external_exports.number().finite(),
  rootGeneration: InputRootSchema.shape.generation
}).strict();
var WorkspaceSpecSchema = external_exports.object({ profile: external_exports.enum(["workspace", "trusted-host"]), inputRefs: external_exports.array(InputRefSchema).max(16), trustedHostConsent: external_exports.boolean() }).strict();
var CreateInputRefSchema = external_exports.object({ clientId: external_exports.string().min(1).max(100), machineId: external_exports.string().min(1).max(100), rootId: InputRootSchema.shape.id, path: external_exports.string().min(1).max(512) }).strict();
var ApprovalDecisionSchema = external_exports.object({ requestId: external_exports.string().min(1).max(100), expectedVersion: external_exports.number().int().positive(), decision: external_exports.enum(["approved", "denied"]) }).strict();

// packages/protocol/src/resources.ts
var INPUT_INSPECTION_LIMITS = { global: 32, tenant: 4, machine: 2 };
var ResourceRequestSchema = external_exports.object({
  cpuSlots: external_exports.number().int().min(1).max(1024).default(1),
  memoryMiB: external_exports.number().int().min(0).max(16 * 1024 * 1024).default(0),
  gpuCount: external_exports.number().int().min(0).max(16).default(0),
  gpuIds: external_exports.array(external_exports.string().regex(/^[A-Za-z0-9_.:-]{1,128}$/)).max(16).default([]),
  minGpuMemoryMiB: external_exports.number().int().min(0).max(1024 * 1024).default(0)
}).strict().refine((r) => new Set(r.gpuIds).size === r.gpuIds.length && (!r.gpuIds.length || r.gpuIds.length === r.gpuCount) && (!r.minGpuMemoryMiB || r.gpuCount > 0), "inconsistent GPU requirements");
var PlacementSchema = external_exports.object({ platform: external_exports.enum(["win32", "linux", "darwin"]).optional(), labels: external_exports.array(external_exports.string().min(1).max(100)).max(16).default([]) }).strict();
var ResourceInventorySchema = external_exports.object({
  version: external_exports.literal(1),
  observedAt: external_exports.number().int().nonnegative(),
  platform: external_exports.string().min(1).max(30),
  cpuSlots: external_exports.number().int().min(1).max(1024),
  memoryMiB: external_exports.number().int().positive(),
  gpuPolicy: external_exports.enum(["exclusive", "disabled"]),
  gpus: external_exports.array(external_exports.object({ id: external_exports.string().regex(/^[A-Za-z0-9_.:-]{1,128}$/), vendor: external_exports.literal("nvidia"), name: external_exports.string().min(1).max(200), memoryMiB: external_exports.number().int().positive() }).strict()).max(32)
}).strict().refine((r) => new Set(r.gpus.map((g) => g.id)).size === r.gpus.length, "duplicate GPU identity");
var ResourceAllocationSchema = external_exports.object({ version: external_exports.literal(1), cpuSlots: external_exports.number().int().positive(), memoryMiB: external_exports.number().int().nonnegative(), gpuIds: external_exports.array(external_exports.string().regex(/^[A-Za-z0-9_.:-]{1,128}$/)).max(16) }).strict();

// packages/protocol/src/budgets.ts
var integer = (max) => external_exports.number().int().min(0).max(max);
var StorageBudgetSchema = external_exports.object({
  maxTaskBytes: integer(16 * 1024 ** 3).default(4 * 1024 ** 3),
  maxInputBytes: integer(4 * 1024 ** 3).default(1024 ** 3),
  maxWorkBytes: integer(1024 ** 3).default(16 * 1024 ** 2),
  maxEnvironmentBytes: integer(16 * 1024 ** 3).default(2 * 1024 ** 3)
}).strict();
var TaskBudgetSchema = external_exports.object({
  maxModelRequests: integer(1e3).default(10),
  maxToolCalls: integer(2e3).default(20),
  deadlineSeconds: external_exports.number().int().min(1).max(86400).default(300),
  // Monetary values use micro-USD and administrator-declared, versioned rates.
  maxTokens: integer(1e9).nullable().default(null),
  maxCostMicros: integer(1e12).nullable().default(null),
  maxOutputTokens: external_exports.number().int().min(1).max(32768).default(4096),
  maxInputBytes: external_exports.number().int().min(1).max(512 * 1024).default(128 * 1024),
  pricing: external_exports.object({
    version: external_exports.string().min(1).max(100),
    model: external_exports.string().min(1).max(200),
    inputMicrosPerMillion: integer(1e9),
    outputMicrosPerMillion: integer(1e9)
  }).strict().nullable().default(null),
  storage: StorageBudgetSchema.default({})
}).strict().refine((p) => p.maxCostMicros === null || p.pricing !== null, "cost budget requires explicit versioned pricing");
var BudgetContextSchema = external_exports.object({
  version: external_exports.literal(1),
  attemptId: external_exports.string().min(1),
  epoch: external_exports.number().int().positive(),
  policy: TaskBudgetSchema,
  remainingMs: external_exports.number().int().nonnegative()
}).strict();
var BudgetRequestSchema = external_exports.object({
  requestId: external_exports.string().regex(/^[\w-]{1,100}$/),
  epoch: external_exports.number().int().nonnegative(),
  kind: external_exports.enum(["model", "tools"]),
  actionHash: external_exports.string().regex(/^[a-f0-9]{64}$/),
  inputBytes: integer(512 * 1024).default(0),
  maxOutputTokens: integer(32768).default(0),
  model: external_exports.string().max(200).default(""),
  toolCalls: integer(2e3).default(0)
}).strict();
var BudgetDecisionSchema = external_exports.object({
  requestId: external_exports.string().max(100),
  approved: external_exports.boolean(),
  reason: external_exports.string().max(100),
  epoch: external_exports.number().int().nonnegative(),
  remainingMs: external_exports.number().int().nonnegative()
}).strict();
var NativeStorageReportSchema = external_exports.object({
  taskId: external_exports.string().max(100),
  turnId: external_exports.string().max(200),
  runId: external_exports.string().max(200),
  revision: external_exports.number().int().positive(),
  state: external_exports.enum(["active", "retained", "unknown", "over-budget"]),
  reservedBytes: external_exports.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  observedBytes: external_exports.number().int().nonnegative().nullable(),
  retainedUntil: external_exports.number().int().nonnegative().nullable()
}).strict();

// packages/protocol/src/tasks.ts
var TaskStatusSchema = external_exports.enum(["queued", "running", "recovering", "cancel_requested", "needs_reconciliation", "succeeded", "failed", "canceled"]);
var CreateTenantBodySchema = external_exports.object({ name: external_exports.string().trim().min(1).max(100) }).strict();
var CreateTaskBodySchema = external_exports.object({
  clientId: external_exports.string().min(1).max(100).regex(/^[^\x00-\x20\x7f]+$/),
  prompt: external_exports.string().min(1).max(32768).refine((text) => /\S/.test(text), "prompt must not be blank"),
  title: external_exports.string().trim().min(1).max(200).optional(),
  machineId: external_exports.string().min(1).max(100).optional(),
  scenario: external_exports.enum(["normal", "invalid-args", "duplicate-call-id", "waiting-model"]).default("normal")
}).strict();
var CreateGeneralTaskBodySchema = CreateTaskBodySchema.omit({ scenario: true }).extend({
  machineId: external_exports.string().min(1).max(100).optional(),
  resources: ResourceRequestSchema.optional(),
  placement: PlacementSchema.optional(),
  budget: TaskBudgetSchema.optional(),
  prompt: external_exports.string().min(1).max(32768).refine((text) => /\S/.test(text) && new TextEncoder().encode(text).length <= 32768, "prompt exceeds UTF-8 limit or is blank"),
  executionProfile: external_exports.enum(["conversation", "workspace", "trusted-host"]).optional(),
  inputRefIds: external_exports.array(external_exports.string().min(1).max(100)).max(16).optional(),
  trustedHostConsent: external_exports.boolean().optional()
}).strict();
var FollowupTaskBodySchema = external_exports.object({
  clientId: external_exports.string().min(1).max(100).regex(/^[^\x00-\x20\x7f]+$/),
  expectedVersion: external_exports.number().int().positive(),
  prompt: external_exports.string().min(1).max(32768).refine((text) => /\S/.test(text) && new TextEncoder().encode(text).length <= 32768, "prompt exceeds UTF-8 limit or is blank")
}).strict();
var NativeContextSchema = external_exports.object({
  taskId: external_exports.string().regex(/^task_[\w-]{1,100}$/),
  traceId: external_exports.string().regex(/^[a-f0-9]{32}$/),
  messages: external_exports.array(external_exports.object({ role: external_exports.enum(["user", "assistant"]), content: external_exports.string().min(1).max(32768) }).strict()).max(32),
  workspace: WorkspaceSpecSchema.optional(),
  budget: BudgetContextSchema.optional(),
  delivery: external_exports.object({ version: external_exports.literal(1), extensions: external_exports.array(external_exports.string().regex(/^\.[a-z0-9]+$/)).max(64) }).strict().optional(),
  recovery: RecoveryContextSchema.optional()
}).strict();

// packages/protocol/src/catalog.ts
var CATALOG_LIMITS = { pageEntries: 100, deviceEntries: 1e4, ttlMs: 12e4, uploadMs: 6e4 };
var id6 = external_exports.string().regex(/^[A-Za-z0-9_.:-]{1,128}$/);
var generation = external_exports.string().regex(/^[a-f0-9]{64}$/);
var relativePath = external_exports.string().min(1).max(512).refine((p) => !p.includes("\\") && !p.startsWith("/") && !p.includes(":") && p.split("/").every((s) => s !== ".." && s !== "." && s.length > 0), "invalid relative path");
var base = { id: id6, label: external_exports.string().min(1).max(200) };
var CatalogEntrySchema = external_exports.discriminatedUnion("kind", [
  external_exports.object({ ...base, kind: external_exports.literal("hardware"), resourceType: external_exports.enum(["cpu", "memory", "gpu", "npu", "storage"]), capacity: external_exports.number().finite().nonnegative(), availableCapacity: external_exports.number().finite().nonnegative().optional(), hardwareId: external_exports.string().min(1).max(128).optional(), unit: external_exports.enum(["slots", "MiB", "bytes", "devices"]), vendor: external_exports.string().max(40).optional(), evidence: external_exports.enum(["probed", "declared"]), observedAt: external_exports.number().int().nonnegative() }).strict(),
  external_exports.object({ ...base, kind: external_exports.literal("capability"), protocol: external_exports.enum(["catalog-metadata-v1", "legacy-session-v2", "runner-readonly-v1", "runner-transfer-v1", "runner-operation-v1", "runner-model-v1"]), operation: OperationDescriptorSchema.optional(), model: ModelDescriptorSchema.optional(), name: external_exports.string().min(1).max(100), version: external_exports.string().max(100).optional(), readiness: external_exports.enum(["available", "unknown", "unavailable"]), evidence: external_exports.enum(["probed", "declared"]) }).strict(),
  external_exports.object({ ...base, kind: external_exports.literal("root"), rootId: id6, generation: generation.nullable(), storageId: id6.optional(), access: external_exports.literal("read-only") }).strict(),
  external_exports.object({ ...base, kind: external_exports.literal("file"), rootId: id6, generation, path: relativePath, sizeBytes: external_exports.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER), modifiedAt: external_exports.number().nonnegative(), fileVersion: generation, versionBasis: external_exports.literal("stat") }).strict()
]);
var CatalogRootScanSchema = external_exports.object({ rootId: id6, generation: generation.nullable(), state: external_exports.enum(["complete", "partial", "error"]), reason: external_exports.enum(["entry-limit", "depth-limit", "deadline", "io-error", "root-changed", "unsupported-path"]).optional() }).strict();
var catalogUpload = { connectionId: id6, snapshotId: id6, mode: external_exports.enum(["snapshot", "delta"]) };
var CatalogBeginSchema = external_exports.union([
  external_exports.object({ ...catalogUpload, expectedContentId: id6.nullable() }).strict(),
  // Compatibility for installed v1 Runners. This value now carries a change timestamp.
  external_exports.object({ ...catalogUpload, expectedVersion: external_exports.number().int().nonnegative() }).strict()
]);
var CatalogRenewSchema = external_exports.object({ connectionId: id6, contentId: id6, observations: external_exports.array(CatalogEntrySchema.options[0]).max(CATALOG_LIMITS.deviceEntries).default([]) }).strict();
var CatalogPageSchema = external_exports.object({ connectionId: id6, snapshotId: id6, page: external_exports.number().int().min(0).max(200), entries: external_exports.array(CatalogEntrySchema).max(CATALOG_LIMITS.pageEntries), deletedIds: external_exports.array(id6).max(CATALOG_LIMITS.pageEntries).default([]) }).strict();
var CatalogCommitSchema = external_exports.object({ connectionId: id6, snapshotId: id6, pageCount: external_exports.number().int().min(1).max(201), roots: external_exports.array(CatalogRootScanSchema).max(32) }).strict().refine((v) => new Set(v.roots.map((r) => r.rootId)).size === v.roots.length, "duplicate root").refine((v) => v.roots.every((r) => r.generation !== null || r.state === "error"), "unknown root generation requires error state");
function catalogDefinition(entries, roots) {
  const definitions = entries.map((entry) => {
    if (entry.kind !== "hardware") return entry;
    const { observedAt: _time, availableCapacity: _available, ...definition } = entry;
    return definition;
  }).sort((a, b) => a.id.localeCompare(b.id));
  return JSON.stringify({ entries: definitions, roots: [...roots].sort((a, b) => a.rootId.localeCompare(b.rootId)) }, (_key, value) => value && typeof value === "object" && !Array.isArray(value) ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b))) : value);
}

// packages/protocol/src/artifacts.ts
var DEFAULT_ARTIFACT_MAX_FILE_BYTES = 50 * 1024 * 1024;
var DEFAULT_ARTIFACT_MAX_TOTAL_BYTES = 1024 * 1024 * 1024;
var ARTIFACT_CHUNK_BYTES = 256 * 1024;
var ARTIFACT_MAX_FILES = 30;
var CONTENT_TYPES = {
  ".bin": "application/octet-stream",
  ".pdf": "application/pdf",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".txt": "text/plain; charset=utf-8",
  ".srt": "application/x-subrip",
  ".md": "text/markdown; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".zip": "application/zip"
};
var ARTIFACT_EXTENSIONS = Object.keys(CONTENT_TYPES);
var LEGACY_ARTIFACT_EXTENSIONS = ARTIFACT_EXTENSIONS.filter((x) => x !== ".srt" && x !== ".bin");
function artifactContentType(path) {
  const extension2 = path.slice(path.lastIndexOf(".")).toLowerCase();
  return Object.hasOwn(CONTENT_TYPES, extension2) ? CONTENT_TYPES[extension2] : void 0;
}
var ArtifactRelativePathSchema = external_exports.string().min(8).max(400).refine((path) => {
  try {
    encodeURIComponent(path);
  } catch {
    return false;
  }
  return path.startsWith("output/") && !/[\\:\x00-\x1f\x7f]/.test(path) && path.split("/").every((part) => !!part && !part.startsWith(".") && !/[. ]$/.test(part)) && !!artifactContentType(path);
}, "expected a supported regular file under output/, without hidden or parent path components");
var Timestamp = external_exports.number().int().safe().nonnegative();
var ArtifactFailureCodeSchema = external_exports.enum([
  "file-too-large",
  "quota-exceeded",
  "source-changed",
  "source-unavailable",
  "unsafe-path",
  "too-many-files",
  "queue-expired",
  "upload-stalled",
  "checksum-mismatch",
  "stored-file-unavailable",
  "cleanup-failed",
  "offset-mismatch",
  "collection-finished",
  "unauthorized",
  "network-unavailable",
  "invalid-request",
  "internal-error"
]);
var ArtifactFailureSchema = external_exports.object({
  code: ArtifactFailureCodeSchema,
  message: external_exports.string().min(1).max(1e3),
  retryable: external_exports.boolean(),
  relativePath: ArtifactRelativePathSchema.optional(),
  limitBytes: external_exports.number().int().safe().nonnegative().optional(),
  sizeBytes: external_exports.number().int().safe().nonnegative().optional(),
  usedBytes: external_exports.number().int().safe().nonnegative().optional()
}).strict();
var ArtifactErrorResponseSchema = external_exports.object({
  error: external_exports.string().min(1).max(1e3),
  failure: ArtifactFailureSchema
});
var ArtifactDtoSchema = external_exports.object({
  id: external_exports.string().min(1).max(100),
  sessionId: external_exports.string().min(1).max(100),
  turnId: external_exports.string().min(1).max(100),
  relativePath: ArtifactRelativePathSchema,
  fileName: external_exports.string().min(1).max(400),
  contentType: external_exports.string().max(200),
  sizeBytes: external_exports.number().int().safe().positive(),
  sha256: external_exports.string().regex(/^[a-f0-9]{64}$/),
  status: external_exports.enum(["uploading", "ready", "failed", "expired"]),
  createdAt: Timestamp,
  uploadedAt: Timestamp.nullable(),
  expiresAt: Timestamp.nullable(),
  error: external_exports.string().max(1e3).nullable(),
  failure: ArtifactFailureSchema.nullable().optional(),
  cleanupError: external_exports.string().max(1e3).nullable().optional()
});
var ArtifactCollectionSchema = external_exports.object({
  manifestVersion: external_exports.number().int().min(0).max(1).optional(),
  id: external_exports.string().min(1).max(100),
  sessionId: external_exports.string().min(1).max(100),
  turnId: external_exports.string().min(1).max(100),
  mode: external_exports.enum(["auto", "manual"]),
  status: external_exports.enum(["queued", "collecting", "complete", "failed"]),
  createdAt: Timestamp,
  updatedAt: Timestamp,
  completedAt: Timestamp.nullable(),
  startedAt: Timestamp.nullable().optional(),
  lastProgressAt: Timestamp.nullable().optional(),
  queueExpiresAt: Timestamp.nullable().optional(),
  error: external_exports.string().max(1e3).nullable(),
  warnings: external_exports.array(external_exports.string().max(500)).max(100),
  failure: ArtifactFailureSchema.nullable().optional()
});
var RunnerArtifactJobSchema = ArtifactCollectionSchema.extend({
  extensions: external_exports.array(external_exports.string().regex(/^\.[a-z0-9]+$/)).max(64).optional(),
  workdir: external_exports.string().min(1).max(1e3),
  maxFileBytes: external_exports.number().int().safe().positive(),
  chunkBytes: external_exports.number().int().positive().max(ARTIFACT_CHUNK_BYTES),
  maxFiles: external_exports.number().int().positive().max(ARTIFACT_MAX_FILES)
});
var ArtifactListSchema = external_exports.object({
  items: external_exports.array(ArtifactDtoSchema),
  nextCursor: external_exports.string().nullable(),
  collection: ArtifactCollectionSchema.nullable(),
  retentionDays: external_exports.number().positive(),
  queueRetentionDays: external_exports.number().positive().optional(),
  idleTimeoutMinutes: external_exports.number().positive().optional(),
  maxFileBytes: external_exports.number().int().safe().positive(),
  maxTotalBytes: external_exports.number().int().safe().positive(),
  canCollect: external_exports.boolean()
});
var TaskDeliverySchema = external_exports.object({
  state: external_exports.enum(["waiting-execution", "waiting-close", "queued", "uploading", "ready", "empty", "failed", "expired", "unavailable", "not-collected", "legacy"]),
  turnId: external_exports.string().nullable(),
  attemptId: external_exports.string().nullable(),
  machineOnline: external_exports.boolean(),
  collection: ArtifactCollectionSchema.nullable()
});
var TaskArtifactListSchema = ArtifactListSchema.extend({
  taskId: external_exports.string(),
  delivery: TaskDeliverySchema,
  files: external_exports.array(external_exports.object({ artifactId: external_exports.string(), relativePath: ArtifactRelativePathSchema, status: ArtifactDtoSchema.shape.status, sourceTurnId: external_exports.string(), attemptId: external_exports.string().nullable() }))
});
var ArtifactInitBodySchema = external_exports.object({
  relativePath: ArtifactRelativePathSchema,
  sizeBytes: external_exports.number().int().safe().positive(),
  sha256: external_exports.string().regex(/^[a-f0-9]{64}$/)
}).strict();
var ArtifactUploadSchema = external_exports.object({
  artifact: ArtifactDtoSchema,
  offset: external_exports.number().int().safe().nonnegative(),
  skip: external_exports.boolean()
});
var ArtifactCompleteBodySchema = external_exports.object({
  warnings: external_exports.array(external_exports.string().max(500)).max(100).default([]),
  error: external_exports.string().min(1).max(1e3).optional(),
  failure: ArtifactFailureSchema.optional()
}).strict();
var CollectArtifactsBodySchema = external_exports.object({ turnId: external_exports.string().min(1).max(100).optional() }).strict();

// packages/protocol/src/planner-budget.ts
var BudgetTemplateSchema = external_exports.enum(["light", "standard", "extended"]);
var PlannerBudgetPolicySchema = external_exports.object({
  maxTemplate: BudgetTemplateSchema.default("standard"),
  conversationModelRequests: external_exports.number().int().min(1).max(1e4).default(200),
  conversationTokens: external_exports.number().int().min(1024).max(1e8).default(4e6),
  maxTaskCostMicros: external_exports.number().int().min(1).max(1e12).nullable().default(null),
  conversationCostMicros: external_exports.number().int().min(1).max(1e12).nullable().default(null),
  pricing: external_exports.object({
    version: external_exports.string().min(1).max(100),
    model: external_exports.string().min(1).max(128),
    inputMicrosPerMillion: external_exports.number().int().nonnegative().max(1e12),
    outputMicrosPerMillion: external_exports.number().int().nonnegative().max(1e12)
  }).strict().nullable().default(null)
}).strict().refine((v) => v.maxTaskCostMicros === null && v.conversationCostMicros === null || v.pricing !== null, "\u8D39\u7528\u4E0A\u9650\u9700\u8981\u660E\u786E\u7684\u6A21\u578B\u548C\u7248\u672C\u5316\u4EF7\u683C");
var ExtendPlannerBudgetSchema = external_exports.object({
  requestId: external_exports.string().min(1).max(128),
  expectedVersion: external_exports.number().int().nonnegative(),
  template: BudgetTemplateSchema,
  extraSeconds: external_exports.number().int().min(0).max(1800).default(0),
  maxTaskCostMicros: external_exports.number().int().min(1).max(1e12).optional()
}).strict();

// packages/protocol/src/conversations.ts
var ConversationSettingsSchema = external_exports.object({
  model: external_exports.string().min(1).max(128).default("auto"),
  budget: AgentTaskInputSchema.shape.budget,
  constraints: AgentTaskInputSchema.shape.constraints,
  budgetPolicy: PlannerBudgetPolicySchema.optional()
}).strict();
var CreateConversationSchema = external_exports.object({
  clientId: external_exports.string().min(1).max(128),
  title: external_exports.string().trim().max(200).optional(),
  settings: ConversationSettingsSchema.default({})
}).strict();
var ConversationMessageSchema = external_exports.object({
  clientId: external_exports.string().min(1).max(128),
  text: external_exports.string().trim().min(1).max(16e3),
  replyToTurnId: external_exports.string().min(1).max(128).optional(),
  newGoal: external_exports.boolean().optional()
}).strict();

// packages/protocol/src/index.ts
var PROTOCOL_VERSION = 2;
var ExecutionStateSchema = external_exports.enum(["none", "starting", "running", "stopping", "recovering", "closed", "unconfirmed"]);
var ResultStateSchema = external_exports.enum(["pending", "succeeded", "failed", "canceled", "lost"]);
var AdapterCapabilitiesSchema = external_exports.object({
  streaming: external_exports.boolean(),
  resume: external_exports.boolean(),
  executionOwnership: external_exports.enum(["child", "remote"]),
  cancel: external_exports.enum(["process-tree", "unconfirmed"])
});
var DEFAULT_MACHINE_CONCURRENCY = 2;
var RUNNER_HEARTBEAT_TIMEOUT_MS = 75e3;
var RUNNER_WELCOME_TIMEOUT_MS = 3e4;
var RUNNER_WATCHDOG_INTERVAL_MS = 5e3;
var MAX_WS_BUFFER_BYTES = 4 * 1024 * 1024;
var MAX_EXTERNAL_BATCH_BYTES = 4 * 1024 * 1024;
var AgentEventSchema = external_exports.discriminatedUnion("type", [
  external_exports.object({ type: external_exports.literal("turn.started"), nativeSessionId: external_exports.string().optional() }),
  external_exports.object({ type: external_exports.literal("native.metadata"), sessionFile: external_exports.string().optional(), sourceRunId: external_exports.string().optional() }),
  external_exports.object({ type: external_exports.literal("text.delta"), text: external_exports.string(), messageId: external_exports.string().optional() }),
  external_exports.object({ type: external_exports.literal("text"), text: external_exports.string(), messageId: external_exports.string().optional() }),
  external_exports.object({ type: external_exports.literal("reasoning"), text: external_exports.string() }),
  external_exports.object({ type: external_exports.literal("tool.call"), id: external_exports.string(), name: external_exports.string(), input: external_exports.unknown() }),
  external_exports.object({ type: external_exports.literal("tool.result"), id: external_exports.string(), output: external_exports.string(), isError: external_exports.boolean().optional() }),
  external_exports.object({
    type: external_exports.literal("usage"),
    inputTokens: external_exports.number().optional(),
    outputTokens: external_exports.number().optional(),
    cacheTokens: external_exports.number().optional(),
    costUsd: external_exports.number().optional()
  }),
  external_exports.object({ type: external_exports.literal("stderr"), text: external_exports.string() }),
  external_exports.object({ type: external_exports.literal("raw"), data: external_exports.unknown() }),
  external_exports.object({
    type: external_exports.literal("turn.completed"),
    nativeSessionId: external_exports.string().optional(),
    finalText: external_exports.string().optional()
  }),
  external_exports.object({ type: external_exports.literal("turn.failed"), error: external_exports.string(), exitCode: external_exports.number().nullable().optional() }),
  external_exports.object({ type: external_exports.literal("turn.canceled") })
]);
var TERMINAL_EVENT_TYPES = ["turn.completed", "turn.failed", "turn.canceled"];
function isTerminalEvent(e) {
  return TERMINAL_EVENT_TYPES.includes(e.type);
}
var SUPPORTED_ADAPTER_NAMES = ["codex", "copilot", "pi", "openclaw", "fake", "native"];
var SupportedAdapterNameSchema = external_exports.enum(SUPPORTED_ADAPTER_NAMES);
var ADAPTER_NAMES = ["claude", ...SUPPORTED_ADAPTER_NAMES];
var AdapterNameSchema = external_exports.enum(ADAPTER_NAMES);
function isSupportedAdapter(name) {
  return SUPPORTED_ADAPTER_NAMES.includes(name);
}
var SessionOptionsSchema = external_exports.object({
  nativeScenario: external_exports.enum(["normal", "invalid-args", "duplicate-call-id", "waiting-model"]).optional(),
  nativeTaskVersion: external_exports.literal(2).optional(),
  model: external_exports.string().max(200).optional(),
  /** Extra CLI args appended verbatim. */
  extraArgs: external_exports.array(external_exports.string().max(1e3)).max(50).optional(),
  /** openclaw: agent id (default main). */
  agent: external_exports.string().max(100).optional(),
  /** openclaw: channel the native session is bound to (telegram, ...), if any. */
  channel: external_exports.string().max(100).optional(),
  /** openclaw: display name of the channel peer. */
  peer: external_exports.string().max(200).optional(),
  /** openclaw: also deliver replies to the bound channel. Off by default. */
  deliver: external_exports.boolean().optional(),
  /** openclaw: hub session this one was branched from; its recent context is prepended to the first turn. */
  forkOf: external_exports.string().max(100).optional(),
  /** Set once the user explicitly chose to write into a channel-bound shared context. */
  takeover: external_exports.boolean().optional()
}).strict();
var DEFAULT_HTTP_PAGE_BYTES = 2 * 1024 * 1024;
var MAX_HTTP_PAGE_BYTES = 4 * 1024 * 1024;
var EVENT_CHUNK_BYTES = 128 * 1024;
var TranscriptQuerySchema = external_exports.object({
  limit: external_exports.coerce.number().int().min(1).max(100).default(50),
  beforeTurnSeq: external_exports.coerce.number().int().safe().positive().optional(),
  snapshotSeq: external_exports.coerce.number().int().safe().nonnegative().optional(),
  maxBytes: external_exports.coerce.number().int().min(1024).max(MAX_HTTP_PAGE_BYTES).optional()
}).strict();
var CreateSessionBodySchema = external_exports.object({
  machineId: external_exports.string().min(1),
  adapter: SupportedAdapterNameSchema,
  workdir: external_exports.string().min(1).max(1e3),
  /** Opt-in for API callers; Web defaults to isolated, existing requests preserve their exact directory. */
  workdirMode: external_exports.enum(["isolated", "existing"]).optional(),
  title: external_exports.string().max(200).optional(),
  options: SessionOptionsSchema.optional()
}).strict();
var CreateMachineBodySchema = external_exports.object({
  name: external_exports.string().min(1).max(64).regex(/^[\w.-]+$/, 'letters, digits, "_", "-" and "." only')
}).strict();
var PatchSessionBodySchema = external_exports.object({
  title: external_exports.string().min(1).max(200).optional(),
  archived: external_exports.boolean().optional(),
  options: SessionOptionsSchema.optional()
}).strict();
var CreateTurnBodySchema = external_exports.object({
  prompt: external_exports.string().min(1).max(2e5),
  clientId: external_exports.string().min(1).max(100)
}).strict();
var AdapterInfoSchema = external_exports.object({
  name: AdapterNameSchema,
  available: external_exports.boolean(),
  version: external_exports.string().optional(),
  path: external_exports.string().optional(),
  error: external_exports.string().optional(),
  capabilities: AdapterCapabilitiesSchema.optional(),
  authentication: external_exports.enum(["unknown", "verified", "failed"]).optional(),
  nativeTaskApiVersions: external_exports.array(external_exports.union([external_exports.literal(1), external_exports.literal(2)])).max(2).optional(),
  nativeWorkspace: external_exports.object({ version: external_exports.literal(1), trustedHost: external_exports.boolean(), inputRoots: external_exports.array(InputRootSchema).max(32) }).strict().optional(),
  nativeResourceVersion: external_exports.literal(1).optional(),
  nativeBudgetVersion: external_exports.literal(1).optional(),
  nativeDeliveryVersion: external_exports.literal(1).optional(),
  nativeRecoveryVersion: external_exports.literal(1).optional()
});
var MachineInfoSchema = external_exports.object({
  readonlyExecutionVersion: external_exports.literal(1).optional(),
  remoteInputReferences: external_exports.literal(1).optional(),
  operationArtifactVersion: external_exports.literal(1).optional(),
  workspaceExecutionVersion: external_exports.literal(1).optional(),
  resourceCatalogVersion: external_exports.literal(1).optional(),
  resources: ResourceInventorySchema.optional(),
  os: external_exports.string().optional(),
  arch: external_exports.string().optional(),
  hostname: external_exports.string().optional(),
  cpus: external_exports.number().optional(),
  memoryGb: external_exports.number().optional(),
  gpus: external_exports.array(external_exports.string()).optional(),
  npus: external_exports.array(external_exports.string()).optional(),
  runnerVersion: external_exports.string().optional(),
  workspaceRoots: external_exports.array(external_exports.string()).optional(),
  artifactVersion: external_exports.literal(1).optional(),
  artifactFormats: external_exports.array(external_exports.string().regex(/^\.[a-z0-9]+$/)).max(64).optional(),
  maxConcurrentRuns: external_exports.number().int().min(1).max(64).optional()
}).passthrough();
var FsEntrySchema = external_exports.object({ name: external_exports.string(), dir: external_exports.boolean() });
var ExternalExchangeSchema = external_exports.object({
  clientId: external_exports.string().min(1).max(100),
  prompt: external_exports.string().max(2e5),
  sender: external_exports.string().max(200).optional(),
  at: external_exports.number(),
  endedAt: external_exports.number(),
  events: external_exports.array(AgentEventSchema).max(2e3),
  sourceId: external_exports.string().optional(),
  sourceRunId: external_exports.string().optional(),
  sourceIdentity: external_exports.enum(["stable", "unverified"]).optional()
});
var ExternalSessionSchema = external_exports.object({
  nativeSessionId: external_exports.string().min(1).max(500),
  title: external_exports.string().max(200),
  workdir: external_exports.string().max(1e3),
  options: SessionOptionsSchema,
  updatedAt: external_exports.number(),
  exchanges: external_exports.array(ExternalExchangeSchema).max(1e3)
});
var RunInventorySchema = external_exports.object({
  turnId: external_exports.string().min(1),
  runId: external_exports.string().min(1),
  sessionId: external_exports.string().nullable(),
  nativeResourceKey: external_exports.string().nullable(),
  executionState: ExecutionStateSchema,
  lastRseq: external_exports.number().int().min(-1),
  ackedRseq: external_exports.number().int().min(-1),
  cancelRequested: external_exports.boolean(),
  /** An explicit Hub-authorized risk release. Never means cleanup was confirmed. */
  resourceReleasedAt: external_exports.number().int().nonnegative().nullable().optional(),
  legacy: external_exports.boolean().optional()
});
var ResumeRunSchema = external_exports.object({
  turnId: external_exports.string().min(1),
  runId: external_exports.string().min(1),
  sessionId: external_exports.string(),
  nativeResourceKey: external_exports.string(),
  lastRseq: external_exports.number().int().min(-1),
  cancelRequested: external_exports.boolean(),
  executionState: ExecutionStateSchema,
  resourceReleasedAt: external_exports.number().int().nonnegative().nullable().optional()
});
var TurnStartSessionSchema = external_exports.object({
  id: external_exports.string().min(1),
  adapter: AdapterNameSchema,
  workdir: external_exports.string().min(1),
  options: SessionOptionsSchema,
  nativeSessionId: external_exports.string().nullable()
});
var RunnerToHubSchema = external_exports.discriminatedUnion("t", [
  ModelResultSchema,
  external_exports.object({
    t: external_exports.literal("hello"),
    protocol: external_exports.number(),
    labels: external_exports.array(external_exports.string()),
    adapters: external_exports.array(AdapterInfoSchema),
    info: MachineInfoSchema,
    /** Turns the runner still knows about (live process or unacked spool). */
    knownTurns: external_exports.array(external_exports.string()),
    runs: external_exports.array(RunInventorySchema)
  }),
  external_exports.object({
    t: external_exports.literal("event"),
    turnId: external_exports.string(),
    runId: external_exports.string().min(1),
    rseq: external_exports.number().int().nonnegative(),
    event: AgentEventSchema,
    executionState: ExecutionStateSchema
  }),
  external_exports.object({ t: external_exports.literal("reconcile.done"), reconcileId: external_exports.string().min(1), runs: external_exports.array(RunInventorySchema) }),
  external_exports.object({
    t: external_exports.literal("fs.result"),
    reqId: external_exports.string(),
    path: external_exports.string().optional(),
    entries: external_exports.array(FsEntrySchema).optional(),
    error: external_exports.string().optional()
  }),
  external_exports.object({ t: external_exports.literal("pong") }),
  external_exports.object({ t: external_exports.literal("native.heartbeat"), requestId: external_exports.string().min(1).max(100), runs: external_exports.array(external_exports.object({ turnId: external_exports.string(), runId: external_exports.string() })).max(64) }),
  external_exports.object({ t: external_exports.literal("native.storage"), reports: external_exports.array(NativeStorageReportSchema).min(1).max(32) }),
  external_exports.object({
    t: external_exports.literal("native.input.result"),
    reqId: external_exports.string().min(1).max(100),
    input: InputRefSchema.omit({ id: true, machineId: true, rootId: true, path: true }).optional(),
    error: external_exports.enum(["invalid_input", "unavailable"]).optional()
  }),
  external_exports.object({
    t: external_exports.literal("external.sync"),
    batchId: external_exports.string().min(1).max(200),
    adapter: AdapterNameSchema,
    sessions: external_exports.array(ExternalSessionSchema).min(1).max(1)
  })
]);
var HubToRunnerSchema = external_exports.discriminatedUnion("t", [
  ModelStartSchema,
  external_exports.object({ t: external_exports.literal("model.cancel"), requestId: external_exports.string(), connectionId: external_exports.string() }).strict(),
  external_exports.object({ t: external_exports.literal("operation.start"), request: OperationRequestSchema }).strict(),
  external_exports.object({ t: external_exports.literal("remote.start"), request: RemoteRequestSchema }).strict(),
  external_exports.object({ t: external_exports.literal("catalog.refresh") }).strict(),
  external_exports.object({
    t: external_exports.literal("welcome"),
    protocol: external_exports.literal(PROTOCOL_VERSION),
    machineId: external_exports.string(),
    name: external_exports.string(),
    reconcileId: external_exports.string().min(1),
    resume: external_exports.array(ResumeRunSchema),
    orphanRuns: external_exports.array(external_exports.string()),
    fullSync: external_exports.boolean().optional()
  }),
  external_exports.object({
    t: external_exports.literal("turn.start"),
    turnId: external_exports.string(),
    runId: external_exports.string().min(1),
    nativeResourceKey: external_exports.string(),
    session: TurnStartSessionSchema,
    prompt: external_exports.string().min(1).max(22e4),
    nativeContext: NativeContextSchema.optional(),
    resources: ResourceAllocationSchema.optional()
  }),
  external_exports.object({ t: external_exports.literal("native.input.inspect"), reqId: external_exports.string().min(1).max(100), rootId: InputRootSchema.shape.id, path: external_exports.string().min(1).max(512) }),
  external_exports.object({ t: external_exports.literal("native.approval"), turnId: external_exports.string(), runId: external_exports.string(), callId: external_exports.string().min(1).max(256), actionHash: external_exports.string().regex(/^[a-f0-9]{64}$/), decision: external_exports.enum(["approved", "denied", "canceled"]) }),
  external_exports.object({ t: external_exports.literal("native.budget"), turnId: external_exports.string(), runId: external_exports.string(), decision: BudgetDecisionSchema }),
  external_exports.object({ t: external_exports.literal("native.checkpoint"), turnId: external_exports.string(), runId: external_exports.string(), decision: CheckpointDecisionSchema }),
  external_exports.object({ t: external_exports.literal("native.lease"), turnId: external_exports.string(), runId: external_exports.string(), requestId: external_exports.string(), attemptId: external_exports.string(), epoch: external_exports.number().int(), remainingMs: external_exports.number().int().nonnegative(), valid: external_exports.boolean() }),
  external_exports.object({ t: external_exports.literal("turn.cancel"), turnId: external_exports.string(), runId: external_exports.string().min(1) }),
  external_exports.object({ t: external_exports.literal("run.release"), turnId: external_exports.string(), runId: external_exports.string().min(1), resourceReleasedAt: external_exports.number().int().nonnegative(), reason: external_exports.string().min(1).max(1e3) }),
  external_exports.object({ t: external_exports.literal("ack"), turnId: external_exports.string(), runId: external_exports.string().min(1), rseq: external_exports.number().int().min(-1) }),
  external_exports.object({ t: external_exports.literal("external.ack"), batchId: external_exports.string(), disposition: external_exports.enum(["imported", "discarded"]) }),
  external_exports.object({ t: external_exports.literal("fs.list"), reqId: external_exports.string(), path: external_exports.string().nullable() }),
  external_exports.object({ t: external_exports.literal("ping") }),
  external_exports.object({ t: external_exports.literal("error"), message: external_exports.string() })
]);
var OverrideRunBodySchema = external_exports.object({
  acceptUnknown: external_exports.literal(true),
  reason: external_exports.string().min(1).max(1e3)
}).strict();

// packages/runner/src/operation-config.ts
import { isAbsolute as isAbsolute2 } from "node:path";

// packages/runner/src/compute-config.ts
import { isAbsolute } from "node:path";
var ComputeConfigSchema = external_exports.object({
  id: external_exports.string().regex(/^[A-Za-z0-9_-]{1,40}$/),
  directory: external_exports.string().refine(isAbsolute),
  python: external_exports.string().refine(isAbsolute),
  commands: external_exports.record(external_exports.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,39}$/), external_exports.string().refine(isAbsolute)).default({}),
  allowTrustedHost: external_exports.literal(true),
  allowPackageInstall: external_exports.boolean().default(false),
  packageIndex: external_exports.string().url().default("https://pypi.org/simple").refine((v) => {
    const u = new URL(v);
    return u.protocol === "https:" && !u.username && !u.password && !u.search && !u.hash;
  }, "HTTPS package index without credentials required"),
  maxDurationMs: external_exports.number().int().min(1e3).max(3e5).default(18e4),
  maxFileBytes: external_exports.number().int().positive().max(1024 ** 3).default(50 * 1024 ** 2),
  maxManagedBytes: external_exports.number().int().positive().default(2 * 1024 ** 3)
}).strict().refine((v) => !Object.hasOwn(v.commands, "python") && Object.keys(v.commands).length <= 15, "python is reserved; at most 15 extra commands");

// packages/runner/src/operation-config.ts
var id7 = external_exports.string().regex(/^[A-Za-z0-9_-]{1,64}$/);
var OperationServiceSchema = external_exports.object({ id: id7, url: external_exports.string().url(), semantics: external_exports.enum(["idempotent-queryable", "query-only", "unqueryable"]), actions: external_exports.array(OperationActionSchema).min(1).max(16).refine((a) => new Set(a.map((v) => v.name)).size === a.length, "duplicate operation action"), tokenEnv: external_exports.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/).optional(), allowInsecureLoopback: external_exports.boolean().default(false), requestTimeoutMs: external_exports.number().int().min(100).max(1e4).default(3e3) }).strict().refine((s) => {
  const u = new URL(s.url);
  return !u.username && !u.password && !u.search && !u.hash && (u.protocol === "https:" || s.allowInsecureLoopback && u.protocol === "http:" && ["127.0.0.1", "localhost", "[::1]"].includes(u.hostname));
}, "operation service requires HTTPS or explicitly allowed loopback HTTP");
var OperationArchiveRootSchema = external_exports.object({ id: id7, path: external_exports.string().refine(isAbsolute2), maxManagedBytes: external_exports.number().int().positive().default(1024 ** 3) }).strict();
var OperationsConfigSchema = external_exports.object({ enabled: external_exports.boolean().default(true), services: external_exports.array(OperationServiceSchema.refine((s) => Buffer.byteLength(JSON.stringify(s.actions)) <= 14e3, "service schemas exceed 14 KiB")).max(16).default([]), archiveRoots: external_exports.array(OperationArchiveRootSchema).max(16).default([]), workspaces: external_exports.array(ComputeConfigSchema).max(4).optional() }).strict().refine((v) => new Set(v.services.map((s) => s.id)).size === v.services.length && new Set(v.archiveRoots.map((s) => s.id)).size === v.archiveRoots.length && new Set((v.workspaces ?? []).map((s) => s.id)).size === (v.workspaces ?? []).length, "duplicate operation scope");

// packages/runner/src/config.ts
var AdapterConfigSchema = external_exports.object({
  path: external_exports.string().optional(),
  env: external_exports.record(external_exports.string()).optional(),
  args: external_exports.array(external_exports.string()).optional(),
  disabled: external_exports.boolean().optional()
}).strict();
var WorkspaceConfigSchema = external_exports.object({
  enabled: external_exports.boolean().default(true),
  allowTrustedHost: external_exports.boolean().default(false),
  inputRoots: external_exports.array(external_exports.object({ id: external_exports.string().regex(/^[a-zA-Z0-9_-]{1,64}$/), label: external_exports.string().min(1).max(100), path: external_exports.string().refine(isAbsolute3, "input root must be absolute") }).strict()).max(32).refine((items) => new Set(items.map((i) => i.id)).size === items.length, "duplicate input root ID").default([]),
  packagePins: external_exports.record(external_exports.string().regex(/^[a-zA-Z0-9_.+-]{1,64}$/)).default({}),
  wheelhouse: external_exports.string().refine(isAbsolute3, "wheelhouse must be absolute").optional(),
  allowPackageNetwork: external_exports.boolean().default(false),
  indexUrl: external_exports.string().url().refine((v) => new URL(v).protocol === "https:" && !new URL(v).username && !new URL(v).password, "package index must use HTTPS without credentials").default("https://pypi.org/simple")
}).strict();
var RunnerConfigSchema = external_exports.object({
  /** ws(s)://host[:port][/base] — `/runner/ws` is appended. */
  hub: external_exports.string().url(),
  token: external_exports.string().min(10),
  labels: external_exports.array(external_exports.string()).default([]),
  modelServices: external_exports.array(ModelServiceConfigSchema).max(8).refine((v) => new Set(v.map((x) => x.id)).size === v.length, "duplicate model service").optional(),
  operations: OperationsConfigSchema.optional(),
  /** Fixed task-input writer; does not authorize writes to catalog roots. */
  transfers: external_exports.object({ enabled: external_exports.boolean().default(true), directory: external_exports.string().refine(isAbsolute3), roles: external_exports.array(external_exports.enum(["source", "target"])).min(1).max(2).refine((v) => new Set(v).size === v.length).default(["source", "target"]), maxManagedBytes: external_exports.number().int().positive().default(1024 ** 3), retentionDays: external_exports.number().int().min(1).max(365).default(7) }).strict().optional(),
  remoteExecution: external_exports.object({ enabled: external_exports.boolean().default(true), tools: external_exports.array(ReadonlyToolSchema).min(1).max(3).refine((v) => new Set(v).size === v.length, "duplicate remote tool").default(["device.info", "files.list", "files.read"]) }).strict().optional(),
  /** Independent discovery opt-in: neither native runtime nor model credentials are required. */
  catalog: external_exports.object({
    enabled: external_exports.boolean().default(true),
    roots: external_exports.array(external_exports.object({ id: external_exports.string().regex(/^[A-Za-z0-9_.:-]{1,128}$/), label: external_exports.string().min(1).max(100), path: external_exports.string().refine(isAbsolute3, "catalog root must be absolute") }).strict()).max(32).refine((v) => new Set(v.map((r) => r.id)).size === v.length, "duplicate catalog root").default([]),
    refreshMs: external_exports.number().int().min(1e3).max(6e4).default(3e4),
    maxEntries: external_exports.number().int().min(128).max(1e4).default(2e3),
    maxDepth: external_exports.number().int().min(0).max(32).default(12),
    scanTimeoutMs: external_exports.number().int().min(100).max(3e4).default(1e4)
  }).strict().optional(),
  /** Session workdirs must live under one of these. Empty = anywhere. */
  workspaceRoots: external_exports.array(external_exports.string()).default([]),
  spoolDir: external_exports.string().optional(),
  turnTimeoutMs: external_exports.number().int().positive().optional(),
  supervisorStartupTimeoutMs: external_exports.number().int().positive().optional(),
  maxConcurrentRuns: external_exports.number().int().min(1).max(64).optional(),
  resources: external_exports.object({ cpuSlots: external_exports.number().int().min(1).max(1024).optional(), memoryMiB: external_exports.number().int().positive().optional(), gpuPolicy: external_exports.enum(["exclusive", "disabled"]).default("exclusive") }).strict().optional(),
  nativeStorage: external_exports.object({ maxManagedBytes: external_exports.number().int().nonnegative().max(1024 ** 5).optional(), maxTaskBytes: external_exports.number().int().nonnegative().max(16 * 1024 ** 3).optional(), minFreeBytes: external_exports.number().int().nonnegative().optional(), retentionDays: external_exports.number().int().min(1).max(365).optional() }).strict().optional(),
  /** Mirror OpenClaw sessions into the hub when openclaw is available. Default on. */
  openclawSync: external_exports.boolean().optional(),
  adapters: external_exports.object({
    // Accepted only so upgrades can still load other configured CLIs.
    // Probe and execution ignore this retired adapter's path/env/args.
    claude: AdapterConfigSchema.optional(),
    codex: AdapterConfigSchema.optional(),
    copilot: AdapterConfigSchema.optional(),
    pi: AdapterConfigSchema.optional(),
    openclaw: AdapterConfigSchema.optional(),
    fake: AdapterConfigSchema.optional(),
    native: AdapterConfigSchema.extend({ fixtureRoot: external_exports.string().min(1).optional(), scenarioDir: external_exports.string().min(1).optional(), providerConfig: external_exports.string().min(1).refine(isAbsolute3, "providerConfig must be absolute").optional(), workspace: WorkspaceConfigSchema.optional() }).optional()
  }).strict().default({})
}).strict();
function defaultConfigPath() {
  return join(homedir(), ".nado-runner", "config.json");
}
function loadConfig(path) {
  const file = path ?? defaultConfigPath();
  let raw = {};
  try {
    raw = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    if (e.code !== "ENOENT" || path) throw new Error(`cannot read config ${file}: ${e.message}`);
  }
  if (process.env.NADO_HUB_URL) raw.hub = process.env.NADO_HUB_URL;
  if (process.env.NADO_MACHINE_TOKEN) raw.token = process.env.NADO_MACHINE_TOKEN;
  if (process.env.NADO_WORKSPACE_ROOTS) raw.workspaceRoots = process.env.NADO_WORKSPACE_ROOTS.split(/[;,]/).filter(Boolean);
  if (process.env.NADO_LABELS) raw.labels = process.env.NADO_LABELS.split(",").filter(Boolean);
  const parsed = RunnerConfigSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`invalid runner config (${file}): ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
  }
  const c = parsed.data;
  return {
    ...c,
    workspaceRoots: c.workspaceRoots.map((r) => resolve2(r)),
    spoolDir: resolve2(c.spoolDir ?? join(homedir(), ".nado-runner", "spool"))
  };
}

// packages/runner/src/probe.ts
import { execFile } from "node:child_process";
import { existsSync as existsSync3, readdirSync as readdirSync2, readFileSync as readFileSync3 } from "node:fs";
import os from "node:os";

// packages/adapters/src/types.ts
function tryJson(line) {
  const t = line.trim();
  if (!t.startsWith("{")) return void 0;
  try {
    return JSON.parse(t);
  } catch {
    return void 0;
  }
}
function asString(v) {
  if (typeof v === "string") return v;
  if (v === void 0 || v === null) return "";
  if (Array.isArray(v)) return v.map(asString).join("\n");
  if (typeof v === "object") {
    const o = v;
    if (typeof o.text === "string") return o.text;
    if (typeof o.content === "string") return o.content;
  }
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}
var TerminalTracker = class {
  done = false;
  lastText = "";
  nativeSessionId;
  errorText;
  stderrTail = "";
  emit(events) {
    for (const e of events) {
      if (e.type === "turn.completed" || e.type === "turn.failed" || e.type === "turn.canceled") this.done = true;
      if (e.type === "text") this.lastText = e.text;
    }
    return events;
  }
  stderr(chunk) {
    this.stderrTail = (this.stderrTail + chunk).slice(-4e3);
    return [{ type: "stderr", text: chunk }];
  }
  exit(code, signal, canceled) {
    if (this.done) return [];
    this.done = true;
    if (canceled) return [{ type: "turn.canceled" }];
    if (code === 0 && !this.errorText) {
      return [{ type: "turn.completed", nativeSessionId: this.nativeSessionId, finalText: this.lastText || void 0 }];
    }
    const tail = this.stderrTail.trim().split("\n").slice(-5).join("\n");
    return [
      {
        type: "turn.failed",
        error: this.errorText ?? (tail || `process exited with ${signal ? `signal ${signal}` : `code ${code}`}`),
        exitCode: code
      }
    ];
  }
};

// packages/adapters/src/codex.ts
var codexAdapter = {
  name: "codex",
  capabilities: { streaming: true, resume: true, executionOwnership: "child", cancel: "process-tree" },
  defaultCommand: "codex",
  versionArgs: ["--version"],
  build(input, config) {
    const common = ["--json", "--skip-git-repo-check", "--dangerously-bypass-approvals-and-sandbox"];
    if (input.options.model) common.push("-m", input.options.model);
    common.push(...input.options.extraArgs ?? []);
    const args = input.nativeSessionId ? [...config.args ?? [], "exec", "resume", ...common, input.nativeSessionId, "-"] : [...config.args ?? [], "exec", ...common, "-"];
    return { cmd: config.path ?? "codex", args, env: config.env, stdin: input.prompt };
  },
  createParser() {
    const tt = new TerminalTracker();
    let started = false;
    return {
      onStdoutLine(line) {
        const o = tryJson(line);
        if (!o) return line.trim() ? [{ type: "raw", data: line }] : [];
        const out = [];
        const item = o.item ?? {};
        switch (o.type) {
          case "thread.started":
            tt.nativeSessionId = o.thread_id;
            started = true;
            out.push({ type: "turn.started", nativeSessionId: o.thread_id });
            break;
          case "turn.started":
            if (!started) {
              started = true;
              out.push({ type: "turn.started" });
            }
            break;
          case "item.started":
            if (item.type === "command_execution") {
              out.push({ type: "tool.call", id: item.id, name: "shell", input: { command: item.command } });
            } else if (item.type === "mcp_tool_call") {
              out.push({ type: "tool.call", id: item.id, name: `${item.server}.${item.tool}`, input: item.arguments });
            } else if (item.type === "web_search") {
              out.push({ type: "tool.call", id: item.id, name: "web_search", input: { query: item.query } });
            }
            break;
          case "item.completed":
            switch (item.type) {
              case "agent_message":
                if (item.text) out.push({ type: "text", text: item.text, messageId: item.id });
                break;
              case "reasoning":
                if (item.text) out.push({ type: "reasoning", text: item.text });
                break;
              case "command_execution":
                out.push({
                  type: "tool.result",
                  id: item.id,
                  output: asString(item.aggregated_output),
                  isError: item.status === "failed" || typeof item.exit_code === "number" && item.exit_code !== 0
                });
                break;
              case "file_change":
                out.push({ type: "tool.call", id: item.id, name: "file_change", input: item.changes });
                out.push({ type: "tool.result", id: item.id, output: item.status ?? "completed", isError: item.status === "failed" });
                break;
              case "mcp_tool_call":
              case "web_search":
                out.push({ type: "tool.result", id: item.id, output: asString(item.result ?? item.error ?? item.status), isError: item.status === "failed" });
                break;
              case "error":
                out.push({ type: "stderr", text: asString(item.message) });
                break;
              default:
                out.push({ type: "raw", data: o });
            }
            break;
          case "turn.completed": {
            const u = o.usage ?? {};
            out.push({ type: "usage", inputTokens: u.input_tokens, outputTokens: u.output_tokens, cacheTokens: u.cached_input_tokens });
            break;
          }
          case "turn.failed":
            tt.errorText = asString(o.error?.message ?? o.error) || "codex turn failed";
            break;
          case "error":
            tt.errorText = asString(o.message) || "codex error";
            out.push({ type: "stderr", text: tt.errorText });
            break;
          default:
            out.push({ type: "raw", data: o });
        }
        return tt.emit(out);
      },
      onStderr: (c) => tt.stderr(c),
      onExit: (code, signal, canceled) => tt.exit(code, signal, canceled)
    };
  }
};

// packages/adapters/src/copilot.ts
var copilotAdapter = {
  name: "copilot",
  capabilities: { streaming: true, resume: true, executionOwnership: "child", cancel: "process-tree" },
  defaultCommand: "copilot",
  versionArgs: ["--version"],
  build(input, config) {
    const args = [...config.args ?? [], "-p", input.prompt, "--output-format", "json", "--allow-all", "--no-color"];
    if (input.nativeSessionId) args.push(`--resume=${input.nativeSessionId}`);
    if (input.options.model) args.push("--model", input.options.model);
    args.push(...input.options.extraArgs ?? []);
    return { cmd: config.path ?? "copilot", args, env: config.env };
  },
  createParser() {
    const tt = new TerminalTracker();
    let started = false;
    return {
      onStdoutLine(line) {
        const o = tryJson(line);
        if (!o) return line.trim() ? [{ type: "raw", data: line }] : [];
        const d = o.data ?? {};
        const out = [];
        if (!started && o.type !== "result") {
          started = true;
          out.push({ type: "turn.started" });
        }
        switch (o.type) {
          case "assistant.message_delta":
            if (d.deltaContent) out.push({ type: "text.delta", text: d.deltaContent, messageId: d.messageId });
            break;
          case "assistant.message":
            if (d.content) out.push({ type: "text", text: d.content, messageId: d.messageId });
            break;
          case "assistant.reasoning":
            if (typeof d.content === "string" && d.content) out.push({ type: "reasoning", text: d.content });
            break;
          case "tool.execution_start":
            out.push({ type: "tool.call", id: d.toolCallId, name: d.toolName, input: d.arguments });
            break;
          case "tool.execution_complete":
            out.push({
              type: "tool.result",
              id: d.toolCallId,
              output: asString(d.result?.content ?? d.error ?? ""),
              isError: d.success === false
            });
            break;
          case "session.error":
          case "error":
            tt.errorText = asString(d.message ?? d.error ?? d);
            out.push({ type: "stderr", text: tt.errorText });
            break;
          case "result": {
            if (o.sessionId) tt.nativeSessionId = o.sessionId;
            if (o.exitCode === 0 && !tt.errorText) {
              out.push({ type: "turn.completed", nativeSessionId: o.sessionId, finalText: tt.lastText || void 0 });
            } else {
              out.push({ type: "turn.failed", error: tt.errorText ?? `copilot exited with ${o.exitCode}`, exitCode: o.exitCode });
            }
            break;
          }
          default:
            if (!o.ephemeral && !String(o.type).startsWith("session.") && !["user.message", "assistant.turn_start", "assistant.turn_end", "assistant.message_start"].includes(o.type)) {
              out.push({ type: "raw", data: o });
            }
        }
        return tt.emit(out);
      },
      onStderr: (c) => tt.stderr(c),
      onExit: (code, signal, canceled) => tt.exit(code, signal, canceled)
    };
  }
};

// packages/adapters/src/fake.ts
import { fileURLToPath } from "node:url";
var SCRIPT = fileURLToPath(new URL("../bin/fake-agent.mjs", import.meta.url));
var fakeAdapter = {
  name: "fake",
  capabilities: { streaming: true, resume: true, executionOwnership: "child", cancel: "process-tree" },
  defaultCommand: process.execPath,
  versionArgs: ["--version"],
  build(input, config) {
    const args = [...config.args ?? [], SCRIPT];
    if (input.nativeSessionId) args.push("--session", input.nativeSessionId);
    args.push(...input.options.extraArgs ?? []);
    return { cmd: config.path ?? process.execPath, args, env: config.env, stdin: input.prompt };
  },
  createParser() {
    const tt = new TerminalTracker();
    return {
      onStdoutLine(line) {
        const o = tryJson(line);
        if (!o) return [];
        const out = [];
        switch (o.type) {
          case "start":
            tt.nativeSessionId = o.session;
            out.push({ type: "turn.started", nativeSessionId: o.session });
            break;
          case "delta":
            out.push({ type: "text.delta", text: o.text });
            break;
          case "tool":
            out.push({ type: "tool.call", id: o.id, name: o.name, input: o.input });
            break;
          case "tool_result":
            out.push({ type: "tool.result", id: o.id, output: o.output });
            break;
          case "message":
            out.push({ type: "text", text: o.text });
            break;
          case "end":
            out.push({ type: "usage", inputTokens: o.usage?.input, outputTokens: o.usage?.output });
            out.push({ type: "turn.completed", nativeSessionId: o.session, finalText: tt.lastText || void 0 });
            break;
        }
        return tt.emit(out);
      },
      onStderr: (c) => tt.stderr(c),
      onExit: (code, signal, canceled) => tt.exit(code, signal, canceled)
    };
  }
};

// packages/adapters/src/openclaw.ts
import { createHash } from "node:crypto";
var object = (value) => !!value && typeof value === "object" && !Array.isArray(value);
var nonempty = (value) => typeof value === "string" && value.trim().length > 0;
var count = (value) => value === void 0 || typeof value === "number" && Number.isFinite(value) && value >= 0;
function completedDocument(doc) {
  if (!object(doc) || doc.status !== "ok" || doc.summary !== "completed" || !nonempty(doc.runId) || doc.queued === true) return false;
  const result = doc.result;
  if (!object(result) || result.queued === true || result.status !== void 0 && result.status !== "completed") return false;
  if (!Array.isArray(result.payloads) || !result.payloads.length || !result.payloads.every((p) => object(p) && (p.text == null || typeof p.text === "string") && (p.mediaUrl == null || typeof p.mediaUrl === "string")) || !result.payloads.some((p) => nonempty(p.text) || nonempty(p.mediaUrl))) return false;
  const meta = result.meta;
  if (!object(meta) || typeof meta.durationMs !== "number" || !count(meta.durationMs) || meta.status !== void 0 && meta.status !== "completed" || !object(meta.agentMeta)) return false;
  const agent = meta.agentMeta;
  if (!nonempty(agent.sessionId) || agent.sessionFile !== void 0 && typeof agent.sessionFile !== "string") return false;
  if (agent.usage !== void 0) {
    const usage = agent.usage;
    if (!object(usage) || !["input", "output", "cacheRead", "cacheWrite"].every((k) => count(usage[k]))) return false;
    if (usage.cost !== void 0 && (!object(usage.cost) || !count(usage.cost.total))) return false;
  }
  return true;
}
var openclawAdapter = {
  name: "openclaw",
  capabilities: { streaming: false, resume: true, executionOwnership: "remote", cancel: "unconfirmed" },
  defaultCommand: "openclaw",
  versionArgs: ["--version"],
  build(input, config) {
    if (!input.nativeSessionId) throw new Error("OpenClaw requires a Hub-persisted native session key before dispatch");
    const key = input.nativeSessionId;
    const args = [...config.args ?? [], "agent", "--session-key", key, "--json"];
    if (input.options.agent) args.push("--agent", input.options.agent);
    if (input.options.deliver) args.push("--deliver");
    if (input.options.model) args.push("--model", input.options.model);
    args.push(...input.options.extraArgs ?? [], "-m", input.prompt);
    return { cmd: config.path ?? "openclaw", args, env: config.env };
  },
  createParser() {
    const tt = new TerminalTracker();
    let out = "";
    return {
      onStdoutLine(line) {
        out += line + "\n";
        return [];
      },
      onStderr: (c) => tt.stderr(c),
      onExit(code, signal, canceled) {
        const events = [];
        const start = out.indexOf("{");
        let doc;
        try {
          doc = start >= 0 ? JSON.parse(out.slice(start)) : void 0;
        } catch {
          doc = void 0;
        }
        if (completedDocument(doc)) {
          const meta = doc.result.meta.agentMeta;
          if (typeof meta.sessionFile === "string" || typeof doc.runId === "string") {
            events.push({
              type: "native.metadata",
              ...typeof meta.sessionFile === "string" ? { sessionFile: meta.sessionFile } : {},
              ...typeof doc.runId === "string" ? { sourceRunId: doc.runId } : {}
            });
          }
          const text = doc.result.payloads.map((p) => [p.text, p.mediaUrl ? `![](${p.mediaUrl})` : ""].filter(Boolean).join("\n")).filter(Boolean).join("\n\n");
          if (text) events.push({ type: "text", text });
          const u = meta.usage;
          if (u) {
            events.push({
              type: "usage",
              inputTokens: u.input,
              outputTokens: u.output,
              cacheTokens: (u.cacheRead ?? 0) + (u.cacheWrite ?? 0) || void 0,
              costUsd: u.cost?.total
            });
          }
        } else {
          tt.errorText = object(doc) && typeof doc.status === "string" && doc.status !== "ok" ? `OpenClaw remote status ${doc.status}: ${asString(doc.error ?? doc.summary ?? "")}` : "OpenClaw response did not provide verified remote completion evidence";
          if (out.trim()) events.push({ type: "raw", data: out.trim() });
        }
        return [...tt.emit(events), ...tt.exit(code, signal, canceled)];
      }
    };
  }
};
var shortId = (id8) => String(id8 ?? "").split("|")[0] || "tool";
function textOf(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return asString(content);
  return content.filter((c) => c?.type === "text").map((c) => c.text).join("");
}
function cleanPrompt(s) {
  return s.replace(/^\s*\[[^\]\n]{0,200}\]\s*/, (m) => /telegram|message_id|from:/i.test(m) ? "" : m).trim();
}
function exchangesFromHistory(messages) {
  const out = [];
  let cur;
  let anonymousScope;
  for (const [index, m] of messages.entries()) {
    if (m.role === "user") {
      const seq = m.__openclaw?.seq ?? 0;
      const at = m.timestamp ?? 0;
      const sourceId = seq > 0 ? `seq:${seq}` : m.idempotencyKey || void 0;
      if (!sourceId) anonymousScope ??= createHash("sha256").update(JSON.stringify(messages)).digest("hex").slice(0, 32);
      const clientId = seq > 0 ? `oc:${seq}` : m.idempotencyKey ? `oc:id:${createHash("sha256").update(m.idempotencyKey).digest("hex")}` : `oc:unverified:${anonymousScope}:${index}`;
      cur = {
        clientId,
        ...sourceId ? { sourceId, sourceIdentity: "stable" } : { sourceIdentity: "unverified" },
        ...m.__openclaw?.runId ? { sourceRunId: m.__openclaw.runId } : {},
        seq,
        prompt: cleanPrompt(textOf(m.content)),
        sender: m.__openclaw?.senderName,
        at,
        endedAt: at,
        events: sourceId ? [] : [{ type: "raw", data: { type: "openclaw.provenance", sourceIdentity: "unverified", possibleDuplicate: true } }],
        done: false
      };
      out.push(cur);
      continue;
    }
    if (!cur) continue;
    if (m.timestamp) cur.endedAt = Math.max(cur.endedAt, m.timestamp);
    if (m.role === "assistant") {
      const parts = Array.isArray(m.content) ? m.content : [{ type: "text", text: textOf(m.content) }];
      let hasCall = false;
      let text = "";
      for (const p of parts) {
        if (p?.type === "thinking" && p.thinking) cur.events.push({ type: "reasoning", text: p.thinking });
        else if (p?.type === "toolCall") {
          hasCall = true;
          cur.events.push({ type: "tool.call", id: shortId(p.id), name: String(p.name ?? "tool"), input: p.arguments ?? p.input ?? null });
        } else if (p?.type === "text" && p.text) text += p.text;
      }
      if (text) cur.events.push({ type: "text", text });
      cur.done = !!text && !hasCall;
    } else if (m.role === "toolResult") {
      cur.events.push({ type: "tool.result", id: shortId(m.toolCallId), output: textOf(m.content), isError: !!m.isError });
      cur.done = false;
    }
  }
  return out.filter((x) => x.done).map(({ done: _d, ...x }) => {
    const finalText = [...x.events].reverse().find((e) => e.type === "text");
    x.events.push({ type: "turn.completed", finalText: finalText?.text });
    return x;
  });
}

// packages/adapters/src/pi.ts
var piAdapter = {
  name: "pi",
  capabilities: { streaming: true, resume: true, executionOwnership: "child", cancel: "process-tree" },
  defaultCommand: "pi",
  versionArgs: ["--version"],
  build(input, config) {
    const args = [...config.args ?? [], "-p", "--mode", "json"];
    if (input.nativeSessionId) args.push("--session", input.nativeSessionId);
    if (input.options.model) args.push("--model", input.options.model);
    args.push(...input.options.extraArgs ?? [], input.prompt);
    return { cmd: config.path ?? "pi", args, env: config.env };
  },
  createParser() {
    const tt = new TerminalTracker();
    let started = false;
    return {
      onStdoutLine(line) {
        const o = tryJson(line);
        if (!o) return line.trim() ? [{ type: "raw", data: line }] : [];
        const out = [];
        if (o.type === "session" && typeof o.id === "string") tt.nativeSessionId = o.id;
        if (!started) {
          started = true;
          out.push({ type: "turn.started", nativeSessionId: tt.nativeSessionId });
        }
        const ame = o.assistantMessageEvent;
        if (o.type === "message_update" && ame?.type === "text_delta" && ame.delta) {
          out.push({ type: "text.delta", text: ame.delta });
        } else if (o.type === "message_end" && o.message?.role === "assistant") {
          const text = (o.message.content ?? []).filter((c) => c.type === "text").map((c) => c.text).join("");
          if (text) out.push({ type: "text", text });
        } else if (o.type === "tool_execution_start") {
          out.push({ type: "tool.call", id: o.toolCallId, name: o.toolName, input: o.args });
        } else if (o.type === "tool_execution_end") {
          out.push({ type: "tool.result", id: o.toolCallId, output: asString(o.result), isError: !!o.isError });
        } else if (o.type !== "message_update") {
          out.push({ type: "raw", data: o });
        }
        return tt.emit(out);
      },
      onStderr: (c) => tt.stderr(c),
      onExit: (code, signal, canceled) => tt.exit(code, signal, canceled)
    };
  }
};

// packages/adapters/src/native.ts
import { isAbsolute as isAbsolute4, join as join2 } from "node:path";

// packages/adapters/src/input-roots.ts
import { createHash as createHash2 } from "node:crypto";
import { realpathSync, statSync as statSync2 } from "node:fs";
function inputRootGeneration(path) {
  const canonical = realpathSync(path).replaceAll("\\", "/"), info = statSync2(path, { bigint: true });
  if (!info.isDirectory()) throw Error("input root is not a directory");
  const identity = [process.platform === "win32" ? canonical.toLowerCase() : canonical, process.platform === "win32" ? "" : String(info.dev), String(info.ino)].join("\0");
  return createHash2("sha256").update(identity).digest("hex");
}

// packages/adapters/src/native.ts
var nativeAdapter = {
  name: "native",
  capabilities: { streaming: false, resume: false, executionOwnership: "child", cancel: "process-tree" },
  defaultCommand: "python",
  versionArgs: ["-I", "-m", "nado_native_agent", "--version"],
  build(input, config) {
    if (input.options.nativeTaskVersion === 2) {
      if (!config.path || !isAbsolute4(config.path) || !config.providerConfig || !isAbsolute4(config.providerConfig) || !input.nativeContext || !input.execution || input.nativeSessionId || input.options.extraArgs?.length || config.args?.length)
        throw new Error("general native requires explicit Python, Responses config and correlated input");
      const { taskId, traceId, messages } = input.nativeContext;
      const { runId, turnId, sessionId } = input.execution;
      const spec = input.nativeContext.workspace, execution = input.nativeExecution;
      const budget = input.nativeContext.budget;
      if (budget && !input.nativeBudgetControl) throw Error("persistent budget control is missing");
      if (spec && (!execution?.config.enabled || spec.profile === "trusted-host" && (!execution.config.allowTrustedHost || !spec.trustedHostConsent))) throw Error("workspace execution is not authorized");
      const workspace = spec && execution ? {
        profile: spec.profile,
        workdir: input.workdir,
        control_dir: execution.controlDir,
        run_id: runId,
        inputs: spec.inputRefs.map((ref) => {
          const root = execution.config.inputRoots.find((r) => r.id === ref.rootId);
          if (!root) throw Error("input root was removed");
          if (ref.rootGeneration && ref.rootGeneration !== inputRootGeneration(root.path)) throw Error("input root generation changed");
          return { ...ref, source_root: root.path };
        }),
        package_pins: execution.config.packagePins,
        wheelhouse: execution.config.wheelhouse ?? null,
        allow_package_network: execution.config.allowPackageNetwork,
        index_url: execution.config.indexUrl,
        ...budget ? { storage_policy: budget.policy.storage } : {},
        ...input.nativeContext.delivery ? { delivery_extensions: input.nativeContext.delivery.extensions } : {}
      } : void 0;
      return {
        cmd: config.path,
        args: ["-I", "-m", "nado_native_agent", "--provider", "configured", "--config", config.providerConfig, "--input-json"],
        stdin: JSON.stringify({ prompt: input.prompt, messages, ...workspace ? { workspace } : {}, ...budget ? { budget: { ...budget, control_dir: input.nativeBudgetControl.controlDir } } : {}, ...input.nativeContext.recovery ? { recovery: { ...input.nativeContext.recovery, control_dir: input.nativeBudgetControl.controlDir, task_dir: input.workdir, storage_policy: budget?.policy.storage } } : {}, correlation: { task_id: taskId, trace_id: traceId, run_id: runId, turn_id: turnId, session_id: sessionId } }),
        env: { ...config.env, ...input.resources ? { NADO_RUN_ALLOCATION: JSON.stringify(input.resources), CUDA_VISIBLE_DEVICES: input.resources.gpuIds.join(",") || "-1", OMP_NUM_THREADS: String(input.resources.cpuSlots), MKL_NUM_THREADS: String(input.resources.cpuSlots), OPENBLAS_NUM_THREADS: String(input.resources.cpuSlots) } : {} },
        unsetEnv: ["PYTHONPATH", "PYTHONHOME", "PYTHONSTARTUP", "VIRTUAL_ENV", "UV_PROJECT_ENVIRONMENT"]
      };
    }
    if (!config.path || !isAbsolute4(config.path) || !config.fixtureRoot || !isAbsolute4(config.fixtureRoot) || !config.scenarioDir || !isAbsolute4(config.scenarioDir)) throw new Error("native requires explicit Python, fixtureRoot and scenarioDir paths");
    if (input.nativeSessionId || input.options.extraArgs?.length || config.args?.length) throw new Error("native does not accept resume or extra arguments");
    const scenario = input.options.nativeScenario ?? "normal";
    if (!["normal", "invalid-args", "duplicate-call-id", "waiting-model"].includes(scenario)) throw new Error("unsupported native scenario");
    return {
      cmd: config.path,
      args: [
        "-I",
        "-m",
        "nado_native_agent",
        "--provider",
        "scripted",
        "--scenario",
        join2(config.scenarioDir, `${scenario}.json`),
        "--fixture-root",
        config.fixtureRoot,
        "--prompt",
        input.prompt
      ],
      env: config.env,
      unsetEnv: ["PYTHONPATH", "PYTHONHOME", "PYTHONSTARTUP", "VIRTUAL_ENV", "UV_PROJECT_ENVIRONMENT"]
    };
  },
  createParser(input) {
    const general = input?.options.nativeTaskVersion === 2;
    let seq = 0, runId, broken = false, terminal;
    return {
      onStdoutLine(line) {
        if (!line.trim()) return [];
        const event = tryJson(line);
        if (broken || terminal || !event || event.event_version !== (general ? 2 : 1) || event.seq !== seq || typeof event.run_id !== "string" || runId && event.run_id !== runId || typeof event.type !== "string" || seq === 0 && event.type !== "run.started" || Buffer.byteLength(line) > 64 * 1024) {
          broken = true;
          return [];
        }
        if (general && (!input?.nativeContext || !input.execution || event.run_id !== input.execution.runId || event.task_id !== input.nativeContext.taskId || event.trace_id !== input.nativeContext.traceId || event.turn_id !== input.execution.turnId || event.session_id !== input.execution.sessionId || typeof event.span_id !== "string" || !/^[a-f0-9]{16}$/.test(event.span_id) || event.parent_span_id !== null && (typeof event.parent_span_id !== "string" || !/^[a-f0-9]{16}$/.test(event.parent_span_id)))) {
          broken = true;
          return [];
        }
        runId = event.run_id;
        seq++;
        const out = [{ type: "raw", data: { native: event } }];
        switch (event.type) {
          case "tool.call":
            if (typeof event.call_id !== "string" || typeof event.tool_name !== "string") {
              broken = true;
              break;
            }
            out.push({ type: "tool.call", id: event.call_id, name: event.tool_name, input: general ? event.input : { disclosure: "arguments omitted by runtime event format" } });
            break;
          case "tool.result":
            if (typeof event.call_id !== "string" || typeof event.ok !== "boolean") {
              broken = true;
              break;
            }
            out.push({ type: "tool.result", id: event.call_id, output: JSON.stringify({ ok: event.ok, error_code: event.error_code, ...general ? { data: event.data, ...event.status ? { executionStatus: event.status } : {} } : {} }), isError: !event.ok || event.status === "failed" });
            break;
          case "run.completed":
            if (general) {
              if (event.provider_closed !== true || typeof event.answer?.message !== "string" || !event.answer.message.trim() || Buffer.byteLength(event.answer.message) > 32768 || !Array.isArray(event.answer.artifact_refs) || event.answer.artifact_refs.length > 30 || new Set(event.answer.artifact_refs).size !== event.answer.artifact_refs.length || !event.answer.artifact_refs.every((path) => ArtifactRelativePathSchema.safeParse(path).success)) {
                broken = true;
                break;
              }
              terminal = { type: "turn.completed", finalText: event.answer.message };
              break;
            }
            if (event.provider_closed !== true || !event.answer || typeof event.answer !== "object" || !Array.isArray(event.answer.candidate_device_ids) || !event.answer.candidate_device_ids.every((id8) => typeof id8 === "string") || !Array.isArray(event.answer.evidence_note_ids) || !event.answer.evidence_note_ids.every((id8) => typeof id8 === "string") || event.answer.availability_verified !== false || typeof event.answer.summary !== "string") {
              broken = true;
              break;
            }
            terminal = { type: "turn.completed", finalText: JSON.stringify(event.answer, null, 2) };
            break;
          case "run.failed":
            terminal = { type: "turn.failed", error: String(event.error_code ?? "runtime_failed") };
            break;
          case "run.canceled":
            terminal = { type: "turn.canceled" };
            break;
          case "run.started":
            if (seq !== 1) broken = true;
            break;
          case "model.started":
            break;
          case "budget.requested":
          case "budget.settled":
          case "budget.denied":
          case "budget.admitted":
            if (!general) broken = true;
            break;
          case "storage.observed":
            if (!general) broken = true;
            break;
          case "output.references_unavailable":
            if (!general) broken = true;
            break;
          case "checkpoint.requested":
          case "checkpoint.committed":
          case "recovery.restored":
            if (!general) broken = true;
            break;
          case "workspace.ready":
          case "input.prepared":
          case "approval.requested":
          case "approval.resolved":
          case "environment.ready":
          case "process.finished":
            if (!general) broken = true;
            break;
          case "model.finished":
            if (general && event.usage && event.usage !== "unknown") {
              const u = event.usage;
              if (!["input_tokens", "output_tokens", "total_tokens"].every((k) => Number.isSafeInteger(u[k]) && u[k] >= 0)) {
                broken = true;
                break;
              }
              out.push({ type: "usage", inputTokens: u.input_tokens, outputTokens: u.output_tokens });
            }
            break;
          default:
            broken = true;
        }
        return out;
      },
      onStderr: (text) => [{ type: "stderr", text }],
      onExit(code, signal, canceled) {
        if (canceled) return [{ type: "turn.canceled" }];
        if (broken || !terminal) return [{ type: "turn.failed", error: "invalid or incomplete native JSONL stream", exitCode: code }];
        if (terminal.type === "turn.completed" && code !== 0) return [{ type: "turn.failed", error: `native process exited with ${signal ?? code}`, exitCode: code }];
        return [terminal];
      }
    };
  }
};

// packages/adapters/src/index.ts
var ADAPTERS = {
  codex: codexAdapter,
  copilot: copilotAdapter,
  pi: piAdapter,
  openclaw: openclawAdapter,
  fake: fakeAdapter,
  native: nativeAdapter
};

// packages/runner/src/resolve.ts
import { existsSync as existsSync2, readdirSync, readFileSync as readFileSync2, statSync as statSync3 } from "node:fs";
import { delimiter, dirname as dirname2, extname, isAbsolute as isAbsolute5, join as join3, resolve as resolve3 } from "node:path";
function isFile(p) {
  try {
    return statSync3(p).isFile();
  } catch {
    return false;
  }
}
function which(cmd, env = process.env) {
  const isWin = process.platform === "win32";
  const exts = isWin ? (env.PATHEXT ?? ".EXE;.CMD;.BAT;.COM").split(";").filter(Boolean) : [""];
  const candidates = (base2) => {
    if (!isWin || extname(base2)) return isWin ? [base2, ...exts.map((e) => base2 + e)] : [base2];
    return exts.map((e) => base2 + e);
  };
  if (isAbsolute5(cmd) || cmd.includes("/") || cmd.includes("\\")) {
    for (const c of candidates(resolve3(cmd))) if (isFile(c)) return c;
    return null;
  }
  const pathVar = env.PATH ?? env.Path ?? "";
  for (const dir of pathVar.split(delimiter)) {
    if (!dir) continue;
    for (const c of candidates(join3(dir, cmd))) if (isFile(c)) return c;
  }
  return null;
}
function knownLocation(cmd, env) {
  if (process.platform !== "win32" || cmd !== "codex" || !env.LOCALAPPDATA) return null;
  const root = join3(env.LOCALAPPDATA, "OpenAI", "Codex", "bin");
  let best = null;
  try {
    for (const d of readdirSync(root)) {
      const file = join3(root, d, "codex.exe");
      try {
        const mtime = statSync3(file).mtimeMs;
        if (!best || mtime > best.mtime) best = { file, mtime };
      } catch {
      }
    }
  } catch {
    return null;
  }
  return best?.file ?? null;
}
function resolveCommand(cmd, env = process.env) {
  const found = which(cmd, env) ?? knownLocation(cmd, env);
  if (!found) throw new Error(`command not found: ${cmd}`);
  if (process.platform !== "win32" || !/\.(cmd|bat)$/i.test(found)) return { file: found, prefixArgs: [] };
  const text = readFileSync2(found, "utf8");
  const m = /"%(?:~?dp0%?)\\?([^"]+?\.(?:js|mjs|cjs))"/i.exec(text);
  if (m) {
    const script = join3(dirname2(found), m[1]);
    if (existsSync2(script)) return { file: process.execPath, prefixArgs: [script] };
  }
  const exe = /"%(?:~?dp0%?)\\?([^"]+?\.exe)"/i.exec(text);
  if (exe) {
    const bin = join3(dirname2(found), exe[1]);
    if (existsSync2(bin)) return { file: bin, prefixArgs: [] };
  }
  throw new Error(`cannot run ${found} without a shell; set an explicit "path" to the real executable`);
}

// packages/runner/src/proc.ts
function buildEnv(cmd, base2 = process.env) {
  const env = { ...base2 };
  for (const pat of cmd.unsetEnv ?? []) {
    if (pat.endsWith("*")) {
      const prefix = pat.slice(0, -1);
      for (const k of Object.keys(env)) if (k.startsWith(prefix)) delete env[k];
    } else delete env[pat];
  }
  return { ...env, ...cmd.env };
}

// packages/runner/src/probe.ts
function run(file, args, env, timeout = 8e3) {
  return new Promise((resolve10) => {
    execFile(file, args, { timeout, windowsHide: true, env }, (err, stdout) => resolve10(err ? null : stdout.toString()));
  });
}
var defaultAdapterProbeDependencies = { resolveCommand, runVersion: run };
function versionProbeEnv(source) {
  const keep = [
    "PATH",
    "Path",
    "PATHEXT",
    "SystemRoot",
    "SYSTEMROOT",
    "SystemDrive",
    "WINDIR",
    "ComSpec",
    "COMSPEC",
    "TEMP",
    "TMP",
    "TMPDIR",
    "LOCALAPPDATA",
    "APPDATA",
    "ProgramFiles",
    "ProgramFiles(x86)",
    "LANG",
    "LC_ALL"
  ];
  return Object.fromEntries(keep.flatMap((key) => source[key] === void 0 ? [] : [[key, source[key]]]));
}
function versionExecutionEnv(env) {
  const { LOCALAPPDATA: _localAppData, APPDATA: _appData, ...executionEnv } = env;
  return executionEnv;
}
async function probeGpus() {
  const gpus = [];
  const nv = await run("nvidia-smi", ["--query-gpu=name,memory.total", "--format=csv,noheader"]);
  if (nv) gpus.push(...nv.trim().split("\n").filter(Boolean).map((l) => `NVIDIA ${l.trim()}`));
  const rocm = await run("rocm-smi", ["--showproductname", "--csv"]);
  if (rocm) {
    for (const l of rocm.trim().split("\n").slice(1)) {
      const name = l.split(",")[2];
      if (name) gpus.push(`AMD ${name.trim()}`);
    }
  }
  if (!gpus.length && process.platform === "darwin" && os.arch() === "arm64") gpus.push("Apple Silicon GPU (Metal)");
  return gpus;
}
async function probeNpus() {
  const npus = [];
  const ascend = await run("npu-smi", ["info", "-l"]);
  if (ascend) npus.push(`Ascend (${(ascend.match(/NPU ID/g) ?? []).length || "?"} devices)`);
  if (process.platform === "linux" && existsSync3("/dev/accel")) {
    const devs = readdirSync2("/dev/accel").filter((d) => d.startsWith("accel"));
    if (devs.length) npus.push(`accel devices: ${devs.join(", ")} (Intel/AMD NPU)`);
  }
  if (process.platform === "darwin" && os.arch() === "arm64") npus.push("Apple Neural Engine");
  return npus;
}
function parseNvidiaResources(output) {
  return output.trim().split(/\r?\n/).flatMap((line) => {
    const m = line.match(/^([^,]+),(.+),\s*(\d+)\s*$/);
    return m ? [{ id: m[1].trim(), vendor: "nvidia", name: m[2].trim(), memoryMiB: Number(m[3]) }] : [];
  });
}
async function probeMachine(extra, config) {
  const [gpus, npus, nv] = await Promise.all([probeGpus(), probeNpus(), run("nvidia-smi", ["--query-gpu=uuid,name,memory.total", "--format=csv,noheader,nounits"])]);
  const resources = ResourceInventorySchema.parse({
    version: 1,
    observedAt: Date.now(),
    platform: process.platform,
    cpuSlots: Math.min(config?.cpuSlots ?? os.cpus().length, os.cpus().length),
    memoryMiB: Math.min(config?.memoryMiB ?? Math.floor(os.totalmem() / 1024 ** 2), Math.floor(os.totalmem() / 1024 ** 2)),
    gpuPolicy: config?.gpuPolicy ?? "exclusive",
    gpus: nv ? parseNvidiaResources(nv) : []
  });
  return {
    os: `${os.type()} ${os.release()}`,
    arch: os.arch(),
    hostname: os.hostname(),
    cpus: os.cpus().length,
    memoryGb: Math.round(os.totalmem() / 1024 ** 3 * 10) / 10,
    gpus,
    npus,
    resources,
    ...extra
  };
}
async function probeAdapters(configs, dependencies = defaultAdapterProbeDependencies) {
  const names = SUPPORTED_ADAPTER_NAMES.filter((n) => (n !== "fake" || configs.fake) && (n !== "native" || configs.native));
  const supported = await Promise.all(
    names.map(async (name) => {
      const cfg = configs[name] ?? {};
      const adapter = ADAPTERS[name];
      const metadata = { capabilities: adapter.capabilities, authentication: "unknown" };
      if (cfg.disabled) return { name, ...metadata, available: false, error: "disabled in config" };
      if (name === "native" && (!cfg.path || !(cfg.fixtureRoot && cfg.scenarioDir || cfg.providerConfig))) return { name, ...metadata, available: false, error: "native requires explicit Python and fixture paths or Responses configuration" };
      const cmdName = cfg.path ?? adapter.defaultCommand;
      const env = versionProbeEnv(buildEnv({ cmd: cmdName, args: [], env: cfg.env, unsetEnv: ["CLAUDECODE", "CLAUDE_CODE_*"] }));
      try {
        const r = dependencies.resolveCommand(cmdName, env);
        const out = await dependencies.runVersion(r.file, [...r.prefixArgs, ...adapter.versionArgs], versionExecutionEnv(env));
        if (out === null) return { name, ...metadata, available: false, path: r.file, error: "version check failed" };
        if (name === "native" && cfg.providerConfig) {
          const versions = cfg.fixtureRoot && cfg.scenarioDir ? [1] : [];
          let workspaceReady = false, resourcesReady = false, budgetsReady = false, deliveryReady = false, recoveryReady = false;
          try {
            const profile = JSON.parse(readFileSync3(cfg.providerConfig, "utf8"));
            const credential = profile.api_key_env;
            const source = buildEnv({ cmd: cmdName, args: [], env: cfg.env });
            const checkEnv = { ...versionExecutionEnv(env), .../^[A-Za-z_][A-Za-z0-9_]{0,127}$/.test(credential) && source[credential] ? { [credential]: source[credential] } : {} };
            const checked = await dependencies.runVersion(r.file, [...r.prefixArgs, "-I", "-m", "nado_native_agent", "--check-config", cfg.providerConfig], checkEnv);
            if (checked && JSON.parse(checked).ready === true) {
              versions.push(2);
              workspaceReady = JSON.parse(checked).toolVersion === 1;
              resourcesReady = JSON.parse(checked).resourceVersion === 1;
              budgetsReady = JSON.parse(checked).budgetVersion === 1;
              deliveryReady = JSON.parse(checked).deliveryVersion === 1;
              recoveryReady = JSON.parse(checked).recoveryVersion === 1;
            }
          } catch {
          }
          return {
            name,
            ...metadata,
            available: versions.length > 0,
            path: r.prefixArgs[0] ?? r.file,
            version: out.trim().split("\n")[0]?.slice(0, 100),
            nativeTaskApiVersions: versions,
            ...resourcesReady ? { nativeResourceVersion: 1 } : {},
            ...budgetsReady ? { nativeBudgetVersion: 1 } : {},
            ...deliveryReady ? { nativeDeliveryVersion: 1 } : {},
            ...recoveryReady ? { nativeRecoveryVersion: 1 } : {},
            ...workspaceReady && cfg.workspace?.enabled ? { nativeWorkspace: { version: 1, trustedHost: cfg.workspace.allowTrustedHost, inputRoots: cfg.workspace.inputRoots.flatMap(({ id: id8, label, path }) => {
              try {
                return [{ id: id8, label, generation: inputRootGeneration(path) }];
              } catch {
                return [];
              }
            }) } } : {},
            ...!versions.includes(2) ? { error: "general provider configuration is not ready" } : {}
          };
        }
        return { name, ...metadata, available: true, path: r.prefixArgs[0] ?? r.file, version: out.trim().split("\n")[0]?.slice(0, 100) };
      } catch (e) {
        return { name, ...metadata, available: false, error: e.message };
      }
    })
  );
  return configs.claude === void 0 ? supported : [...supported, {
    name: "claude",
    available: false,
    authentication: "unknown",
    error: "Claude support has been removed; legacy adapter configuration is ignored"
  }];
}

// packages/runner/src/model-services.ts
import { createHash as createHash3 } from "node:crypto";

// packages/protocol/src/chat-client.ts
async function callChat(config, payload, signal) {
  ChatPayloadSchema.parse(payload);
  const token = config.apiKeyEnv ? process.env[config.apiKeyEnv] : void 0;
  if (config.apiKeyEnv && !token) throw Error("model credential unavailable");
  const response = await fetch(config.endpoint, { method: "POST", headers: { "content-type": "application/json", ...token ? { authorization: `Bearer ${token}` } : {} }, body: JSON.stringify({ model: config.model, ...payload, stream: false }), signal, redirect: "error" });
  if (!response.ok) {
    await response.body?.cancel();
    throw Error("model transport rejected");
  }
  const reader = response.body?.getReader();
  if (!reader) throw Error("empty model response");
  const chunks = [];
  let size = 0;
  try {
    for (; ; ) {
      const p = await reader.read();
      if (p.done) break;
      size += p.value.length;
      if (size > 256e3) throw Error("model response exceeds limit");
      chunks.push(p.value);
    }
  } finally {
    await reader.cancel().catch(() => {
    });
    reader.releaseLock();
  }
  const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  const m = body.choices?.[0]?.message;
  return ChatReplySchema.parse({ message: { role: m?.role, content: m?.content ?? null, ...m?.tool_calls ? { tool_calls: m.tool_calls.map((c) => ({ id: c.id, type: c.type, function: c.function })) } : {} }, usage: body.usage ? { prompt_tokens: body.usage.prompt_tokens, completion_tokens: body.usage.completion_tokens } : null });
}

// packages/runner/src/model-services.ts
var generation2 = (c) => createHash3("sha256").update(JSON.stringify(c)).update(c.apiKeyEnv ? process.env[c.apiKeyEnv] ?? "" : "").digest("hex");
var ModelServices = class {
  constructor(services, send) {
    this.services = services;
    this.send = send;
  }
  active = /* @__PURE__ */ new Map();
  seen = /* @__PURE__ */ new Set();
  entries() {
    return this.services.map((c) => ({ id: `model.${c.id}`, kind: "capability", label: c.label, name: "model.complete", protocol: "runner-model-v1", readiness: c.apiKeyEnv && !process.env[c.apiKeyEnv] ? "unavailable" : "available", evidence: "declared", model: { model: c.model, generation: generation2(c), protocol: "chat-completions", verified: false } }));
  }
  start(m) {
    const send = (data) => this.send({ t: "model.result", requestId: m.requestId, connectionId: m.connectionId, ...data });
    if (this.seen.has(m.requestId)) {
      if (!this.active.has(m.requestId)) send({ error: "duplicate" });
      return;
    }
    const c = this.services.find((c2) => `model.${c2.id}` === m.capabilityId);
    if (!c || generation2(c) !== m.generation || this.active.size >= 1 || this.seen.size >= 1e4) {
      send({ error: "unavailable" });
      return;
    }
    this.seen.add(m.requestId);
    const controller = new AbortController();
    const done = (async () => {
      try {
        const reply = await callChat(c, m.payload, AbortSignal.any([controller.signal, AbortSignal.timeout(m.remainingMs)]));
        send({ reply });
      } catch {
        send({ error: controller.signal.aborted ? "canceled" : "transport" });
      } finally {
        this.active.delete(m.requestId);
      }
    })();
    this.active.set(m.requestId, { controller, done });
  }
  cancel(id8) {
    this.active.get(id8)?.controller.abort();
  }
  async stop() {
    for (const a of this.active.values()) a.controller.abort();
    await Promise.all([...this.active.values()].map((a) => a.done));
  }
};

// packages/runner/src/operation-artifacts.ts
import { constants as constants3 } from "node:fs";
import { copyFile as copyFile2 } from "node:fs/promises";
import { join as join8 } from "node:path";

// packages/runner/src/native-inputs.ts
import { createHash as createHash4, randomUUID } from "node:crypto";
import { open, lstat, realpath } from "node:fs/promises";
import { constants, mkdirSync as mkdirSync2, lstatSync, writeFileSync, renameSync as renameSync2, readdirSync as readdirSync3, existsSync as existsSync4, readFileSync as readFileSync4 } from "node:fs";
import { join as join4, resolve as resolve4, relative, sep, isAbsolute as isAbsolute6 } from "node:path";
function inputParts(path) {
  const parts = path.split("/");
  if (path.length > 512 || parts.some((p) => !p || p === ".." || p.startsWith(".") || /[\\:\x00-\x1f]/.test(p) || /[. ]$/.test(p) || /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)/i.test(p))) throw Error("invalid_input");
  return parts;
}
async function inspectNativeInput(config, rootId, path) {
  const root = config?.enabled && config.inputRoots.find((r) => r.id === rootId);
  if (!root) throw Error("invalid_input");
  const rootGeneration = inputRootGeneration(root.path);
  const base2 = await realpath(root.path), parts = inputParts(path);
  let current = base2;
  for (const part of parts) {
    current = join4(current, part);
    if ((await lstat(current)).isSymbolicLink()) throw Error("invalid_input");
  }
  const canonical = await realpath(current), rel = relative(base2, canonical);
  if (isAbsolute6(rel) || rel === ".." || rel.startsWith(".." + sep) || resolve4(base2, rel) !== canonical) throw Error("invalid_input");
  const fd = await open(current, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
  try {
    const before = await fd.stat();
    if (!before.isFile() || before.nlink !== 1 || before.size > 256 * 1024 * 1024) throw Error("invalid_input");
    const hash3 = createHash4("sha256"), buffer = Buffer.alloc(256 * 1024);
    let position = 0;
    for (; ; ) {
      const { bytesRead } = await fd.read(buffer, 0, buffer.length, position);
      if (!bytesRead) break;
      position += bytesRead;
      if (position > 256 * 1024 * 1024) throw Error("invalid_input");
      hash3.update(buffer.subarray(0, bytesRead));
    }
    const after = await fd.stat(), atPath = await lstat(current);
    if (after.nlink !== 1 || atPath.nlink !== 1 || before.size !== position || before.size !== after.size || before.mtimeMs !== after.mtimeMs || before.ino !== atPath.ino || before.dev !== atPath.dev || atPath.isSymbolicLink()) throw Error("invalid_input");
    if (inputRootGeneration(root.path) !== rootGeneration) throw Error("invalid_input");
    return { name: parts.at(-1), sha256: hash3.digest("hex"), sizeBytes: position, modifiedAt: after.mtimeMs, rootGeneration };
  } finally {
    await fd.close();
  }
}
function nativeControlDir(spoolDir, runId) {
  const root = join4(resolve4(spoolDir), "native-control"), run2 = join4(root, createHash4("sha256").update(runId).digest("hex"));
  for (const path of [root, run2]) {
    mkdirSync2(path, { recursive: true });
    if (lstatSync(path).isSymbolicLink()) throw Error("linked native control directory");
  }
  return run2;
}
function writeNativeDecision(spoolDir, message) {
  const root = nativeControlDir(spoolDir, message.runId), path = join4(root, createHash4("sha256").update(message.callId).digest("hex") + ".json");
  const temporary = path + "." + randomUUID() + ".tmp";
  writeFileSync(temporary, JSON.stringify(message), { flag: "wx", mode: 384 });
  renameSync2(temporary, path);
}
function writeBudgetDecision(spoolDir, message) {
  const root = nativeControlDir(spoolDir, message.runId), path = join4(root, "budget-" + createHash4("sha256").update(message.decision.requestId).digest("hex") + ".json");
  const temporary = path + "." + randomUUID() + ".tmp";
  writeFileSync(temporary, JSON.stringify(message), { flag: "wx", mode: 384 });
  renameSync2(temporary, path);
}
function writeCheckpointDecision(spoolDir, message) {
  const root = nativeControlDir(spoolDir, message.runId), path = join4(root, "checkpoint-" + createHash4("sha256").update(message.decision.requestId).digest("hex") + ".json");
  if (existsSync4(path)) {
    if (readFileSync4(path, "utf8") !== JSON.stringify(message)) throw Error("checkpoint decision replay changed");
    return;
  }
  const temporary = path + "." + randomUUID() + ".tmp";
  writeFileSync(temporary, JSON.stringify(message), { flag: "wx", mode: 384 });
  renameSync2(temporary, path);
}
function writeLeaseDecision(spoolDir, message, sentAt) {
  const root = nativeControlDir(spoolDir, message.runId), previous = readdirSync3(root).filter((n) => /^lease-\d{16}\.json$/.test(n)).sort().at(-1);
  const number = previous ? Number(previous.slice(6, 22)) + 1 : 1;
  const path = join4(root, "lease-" + String(number).padStart(16, "0") + ".json"), temporary = path + "." + randomUUID() + ".tmp";
  writeFileSync(temporary, JSON.stringify({ ...message, validUntil: sentAt + message.remainingMs }), { flag: "wx", mode: 384 });
  renameSync2(temporary, path);
}

// packages/runner/src/operation-capabilities.ts
import { createHash as createHash8, randomUUID as randomUUID2 } from "node:crypto";
import { readdir as readdir3, unlink as unlink2 } from "node:fs/promises";
import { join as join7 } from "node:path";

// packages/runner/src/transfer-files.ts
import { createHash as createHash6 } from "node:crypto";
import { constants as constants2 } from "node:fs";
import { lstat as lstat2, mkdir, open as open2, realpath as realpath2, rename, unlink, readdir } from "node:fs/promises";
import { isAbsolute as isAbsolute8, join as join5, relative as relative3, resolve as resolve6, sep as sep3 } from "node:path";

// packages/runner/src/readonly-tools.ts
import { createHash as createHash5 } from "node:crypto";
import { isAbsolute as isAbsolute7, relative as relative2, resolve as resolve5, sep as sep2 } from "node:path";
var ReadonlyJobSchema = external_exports.object({ request: RemoteRequestSchema, roots: external_exports.array(external_exports.object({ id: external_exports.string(), path: external_exports.string().refine(isAbsolute7) }).strict()).max(32), input: external_exports.object({ path: external_exports.string().refine(isAbsolute7), receipt: external_exports.string().refine(isAbsolute7) }).strict().optional(), tools: external_exports.array(ReadonlyToolSchema).max(3), deadlineAt: external_exports.number().int().positive() }).strict();
var digest = (value) => createHash5("sha256").update(value).digest("hex");
function fileStatVersion(generation3, path, st) {
  return digest([generation3, path, st.dev, st.ino, st.size, st.mtimeMs, st.ctimeMs].join("\0"));
}

// packages/runner/src/transfer-files.ts
var TransferFileError = class extends Error {
  constructor(reason) {
    super(reason);
    this.reason = reason;
  }
};
var unsafe = () => new TransferFileError("unsafe-path");
var inside = (base2, path) => {
  const p = relative3(base2, path);
  return p === "" || p !== ".." && !p.startsWith(".." + sep3) && !isAbsolute8(p);
};
async function privateDirectory(path) {
  const parent = resolve6(path, "..");
  if (parent !== path) {
    try {
      const st2 = await lstat2(parent);
      if (st2.isSymbolicLink()) throw unsafe();
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
      await privateDirectory(parent);
    }
  }
  await mkdir(path, { recursive: true, mode: 448 });
  const st = await lstat2(path);
  if (st.isSymbolicLink() || !st.isDirectory()) throw unsafe();
  const canonical = await realpath2(path), normalize = (p) => process.platform === "win32" ? resolve6(p).toLowerCase() : resolve6(p);
  if (normalize(canonical) !== normalize(path)) throw unsafe();
  return canonical;
}
async function safeRegular(path) {
  const st = await lstat2(path);
  if (!st.isFile() || st.isSymbolicLink() || st.nlink !== 1) throw unsafe();
  return st;
}
async function atomicJson(path, value) {
  const tmp = path + ".new";
  try {
    await unlink(tmp);
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  const h = await open2(tmp, "wx", 384);
  try {
    await h.writeFile(JSON.stringify(value));
    await h.sync();
  } finally {
    await h.close();
  }
  await rename(tmp, path);
}
async function readJson(path) {
  await safeRegular(path);
  const h = await open2(path, constants2.O_RDONLY | (constants2.O_NOFOLLOW ?? 0));
  try {
    const st = await h.stat();
    if (st.size > 8192 || st.nlink !== 1) throw unsafe();
    return JSON.parse(await h.readFile("utf8"));
  } finally {
    await h.close();
  }
}
async function hashFile(path, signal, expectedBytes) {
  const before = await safeRegular(path), h = await open2(path, constants2.O_RDONLY | (constants2.O_NOFOLLOW ?? 0)), hash3 = createHash6("sha256");
  try {
    const st = await h.stat();
    if (st.ino !== before.ino || st.dev !== before.dev || st.nlink !== 1) throw unsafe();
    if (expectedBytes !== void 0 && st.size !== expectedBytes) throw new TransferFileError("input-changed");
    const b = Buffer.alloc(256 * 1024);
    let n = 0;
    while (n < st.size) {
      signal?.throwIfAborted();
      const r = await h.read(b, 0, Math.min(b.length, st.size - n), n);
      if (!r.bytesRead) throw new TransferFileError("input-changed");
      hash3.update(b.subarray(0, r.bytesRead));
      n += r.bytesRead;
    }
    const after = await h.stat(), link = await safeRegular(path);
    if (after.size !== st.size || after.mtimeMs !== st.mtimeMs || after.ctimeMs !== st.ctimeMs || link.ino !== st.ino || link.dev !== st.dev || link.size !== st.size || link.mtimeMs !== st.mtimeMs || link.ctimeMs !== st.ctimeMs) throw new TransferFileError("input-changed");
    return { sha256: hash3.digest("hex"), sizeBytes: n };
  } finally {
    await h.close();
  }
}
async function snapshotSource(source, roots, directory, signal) {
  const configured = roots.find((r) => r.id === source.rootId);
  if (!configured) throw unsafe();
  if ((await lstat2(configured.path)).isSymbolicLink()) throw unsafe();
  const base2 = await realpath2(configured.path);
  if (inputRootGeneration(base2) !== source.generation) throw new TransferFileError("input-changed");
  let file = base2;
  for (const part2 of source.path.split("/")) {
    if (!part2 || part2 === "." || part2 === ".." || part2.includes("\\") || part2.includes(":")) throw unsafe();
    file = resolve6(file, part2);
    if ((await lstat2(file)).isSymbolicLink() || !inside(base2, await realpath2(file))) throw unsafe();
  }
  const st = await safeRegular(file);
  if (fileStatVersion(source.generation, source.path, st) !== source.fileVersion || st.size !== source.sizeBytes) throw new TransferFileError("input-changed");
  await privateDirectory(directory);
  const target = join5(directory, "snapshot.bin"), part = target + ".part";
  const src = await open2(file, constants2.O_RDONLY | (constants2.O_NOFOLLOW ?? 0));
  let out;
  try {
    const opened = await src.stat();
    if (fileStatVersion(source.generation, source.path, opened) !== source.fileVersion || opened.nlink !== 1) throw new TransferFileError("input-changed");
    try {
      await unlink(part);
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
    }
    out = await open2(part, "wx", 384);
    const h = createHash6("sha256"), buffer = Buffer.alloc(256 * 1024);
    let offset = 0;
    while (offset < st.size) {
      signal.throwIfAborted();
      const r = await src.read(buffer, 0, Math.min(buffer.length, st.size - offset), offset);
      if (!r.bytesRead) throw new TransferFileError("input-changed");
      h.update(buffer.subarray(0, r.bytesRead));
      let n = 0;
      while (n < r.bytesRead) {
        const w = await out.write(buffer, n, r.bytesRead - n, offset + n);
        if (!w.bytesWritten) throw Error("snapshot write stalled");
        n += w.bytesWritten;
      }
      offset += r.bytesRead;
    }
    if (fileStatVersion(source.generation, source.path, await src.stat()) !== source.fileVersion || fileStatVersion(source.generation, source.path, await safeRegular(file)) !== source.fileVersion || inputRootGeneration(configured.path) !== source.generation) throw new TransferFileError("input-changed");
    await out.sync();
    await out.close();
    out = void 0;
    await rename(part, target);
    return { path: target, sha256: h.digest("hex"), sizeBytes: offset };
  } finally {
    await src.close();
    await out?.close();
  }
}
function inputPaths(directory, file) {
  TransferFileSchema.parse(file);
  const root = join5(directory, file.taskId, file.transferId), staging = root + ".pending";
  return { root, staging, part: join5(staging, "input.part"), stagedBlob: join5(staging, "input.bin"), blob: join5(root, "input.bin"), receipt: join5(root, "receipt.json"), stagedReceipt: join5(staging, "receipt.json"), offset: join5(staging, "offset.json") };
}
async function committedInput(directory, file) {
  const p = inputPaths(directory, file);
  const st = await lstat2(p.root);
  if (!st.isDirectory() || st.isSymbolicLink()) throw unsafe();
  await privateDirectory(p.root);
  const receipt = TransferFileSchema.parse(await readJson(p.receipt));
  if (JSON.stringify(receipt) !== JSON.stringify(TransferFileSchema.parse(file))) throw new TransferFileError("input-changed");
  const actual = await hashFile(p.blob, void 0, file.sizeBytes);
  if (actual.sha256 !== file.sha256 || actual.sizeBytes !== file.sizeBytes) throw new TransferFileError("checksum-mismatch");
  return p.blob;
}
async function treeBytes(directory) {
  let total = 0;
  let count2 = 0;
  const walk = async (path) => {
    for (const e of await readdir(path, { withFileTypes: true })) {
      if (++count2 > 2e4) throw new TransferFileError("local-quota");
      const f = join5(path, e.name), st = await lstat2(f);
      if (st.isSymbolicLink() || st.isFile() && st.nlink !== 1) throw unsafe();
      if (st.isDirectory()) await walk(f);
      else if (st.isFile()) total += st.size;
      else throw unsafe();
    }
  };
  await walk(directory);
  return total;
}

// packages/runner/src/compute.ts
import { createHash as createHash7 } from "node:crypto";
import { spawn } from "node:child_process";
import { copyFile, lstat as lstat3, open as open3, readdir as readdir2, rename as rename2, realpath as realpath3, stat } from "node:fs/promises";
import { dirname as dirname3, join as join6 } from "node:path";
var digest2 = (v) => createHash7("sha256").update(operationCanonical(v)).digest("hex");
var missing = (e) => e.code === "ENOENT";
var computeOutputRoot = (c) => ({ id: "workspace-" + c.id + "-outputs", label: "Published task files " + c.id, path: join6(c.directory, "published") });
async function computeDescriptor(c) {
  await privateDirectory(c.directory);
  await privateDirectory(computeOutputRoot(c).path);
  const generation3 = digest2({ config: c, directoryGeneration: inputRootGeneration(c.directory), executables: await Promise.all([c.python, ...Object.values(c.commands)].map(async (p) => {
    const canonical = await realpath3(p), st = await stat(canonical);
    if (!st.isFile()) throw Error("configured executable is not a file");
    return { path: canonical, size: st.size, mtime: st.mtimeMs, ino: st.ino };
  })) });
  return { version: 1, kind: "workspace", semantics: "query-only", cancelable: false, generation: generation3, actions: ["inspect", "write", "read", "import", "run", ...c.allowPackageInstall ? ["prepare"] : [], "publish"].map((name) => ({ name, fields: {} })), workspace: { mode: "trusted-host", network: "host", commands: ["python", ...Object.keys(c.commands)], packageInstall: c.allowPackageInstall, maxDurationMs: c.maxDurationMs } };
}
async function command(cmd, args, cwd, timeoutMs) {
  return new Promise((resolve10, reject) => {
    const startedAt = Date.now();
    const keys = ["PATH", "Path", "PATHEXT", "SystemRoot", "WINDIR", "ComSpec", "TEMP", "TMP", "LANG", "LC_ALL", "ProgramFiles", "ProgramW6432"];
    const env = Object.fromEntries(keys.flatMap((k) => process.env[k] === void 0 ? [] : [[k, process.env[k]]]));
    const child = spawn(cmd, args, { cwd, env, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    const output = [[], []], sizes = [0, 0];
    let truncated = false, timedOut = false;
    const collect = (index, b) => {
      const n = Math.min(b.length, 3e3 - sizes[index]);
      if (n > 0) {
        output[index].push(b.subarray(0, n));
        sizes[index] += n;
      }
      if (n < b.length) truncated = true;
    };
    child.stdout.on("data", (b) => collect(0, b));
    child.stderr.on("data", (b) => collect(1, b));
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, Math.max(1, timeoutMs));
    child.once("error", (e) => {
      clearTimeout(timer);
      reject(e);
    });
    child.once("close", (code) => {
      clearTimeout(timer);
      resolve10({ exitCode: code ?? -1, stdout: Buffer.concat(output[0]).toString("utf8"), stderr: Buffer.concat(output[1]).toString("utf8"), truncated, timedOut, startedAt, finishedAt: Date.now() });
    });
  });
}
async function probeCompute(c) {
  const descriptor = await computeDescriptor(c);
  const version = await command(c.python, ["-I", "--version"], c.directory, 3e3);
  if (version.exitCode !== 0 || !/^Python 3\./.test(version.stdout + version.stderr)) throw Error("configured Python is not executable");
  return descriptor;
}
async function ownedDirectory(path, identity) {
  await privateDirectory(path);
  const owner = join6(path, ".owner.json");
  try {
    if (operationCanonical(await readJson(owner)) !== operationCanonical(identity)) throw Error("workspace ownership changed");
  } catch (e) {
    if (!missing(e)) throw e;
    if ((await readdir2(path)).length) throw Error("workspace directory is not owned");
    await atomicJson(owner, identity);
  }
  return path;
}
async function taskPath(root, relative7, create = false) {
  const parts = WorkspacePathSchema.parse(relative7).split("/");
  let current = root;
  for (const [index, part] of parts.entries()) {
    current = join6(current, part);
    if (index < parts.length - 1) {
      if (create) await privateDirectory(current);
      else {
        const st = await lstat3(current);
        if (!st.isDirectory() || st.isSymbolicLink()) throw Error("unsafe task path");
      }
    } else {
      try {
        await safeRegular(current);
      } catch (e) {
        if (!create || !missing(e)) throw e;
      }
    }
  }
  return current;
}
async function computeScope(c, r, hub) {
  if (r.intent.kind !== "workspace" || r.descriptor.kind !== "workspace" || digest2(await computeDescriptor(c)) !== digest2(r.descriptor)) throw Error("workspace capability changed");
  const namespace = digest2(new URL(hub.replace(/^ws/, "http")).href), tenant = join6(c.directory, "tasks", namespace, r.tenantId);
  await privateDirectory(tenant);
  const root = await ownedDirectory(join6(tenant, r.intent.workspaceId), { purpose: "nado-task-workspace-v1", namespace, tenant: r.tenantId, workspaceId: r.intent.workspaceId, generation: r.descriptor.generation });
  for (const directory of ["inputs", "work", "output"]) await privateDirectory(join6(root, directory));
  return { root, namespace };
}
async function computePublished(c, r, hub) {
  if (r.intent.kind !== "workspace" || r.intent.args.action !== "publish") throw Error("not a publication");
  const { namespace } = await computeScope(c, r, hub), suffix = [namespace, r.tenantId, r.intent.workspaceId, r.operationId];
  let root = join6(computeOutputRoot(c).path, ...suffix);
  try {
    await lstat3(root);
  } catch (e) {
    if (!missing(e)) throw e;
    root = join6(c.directory, "staged-publications", ...suffix);
  }
  await privateDirectory(root);
  const receipt = OperationObservationSchema.parse(await readJson(join6(root, ".receipt.json")));
  if (receipt.operationId !== r.operationId || receipt.intentHash !== r.intentHash || receipt.status !== "applied") throw Error("publication receipt changed");
  const files = JSON.parse(String(receipt.output?.files));
  if (!Array.isArray(files) || files.length !== r.intent.args.paths.length) throw Error("invalid publication manifest");
  for (const [index, f] of files.entries()) {
    if (f.path !== r.intent.args.paths[index]) throw Error("publication path changed");
    const actual = await hashFile(await taskPath(root, f.path), void 0, f.sizeBytes);
    if (actual.sha256 !== f.sha256) throw Error("published file changed");
  }
  return { root, files, receipt };
}
async function activateComputePublication(c, r, hub) {
  const publication = await computePublished(c, r, hub);
  if (r.intent.kind !== "workspace") throw Error("invalid publication");
  const { namespace } = await computeScope(c, r, hub), target = join6(computeOutputRoot(c).path, namespace, r.tenantId, r.intent.workspaceId, r.operationId);
  if (publication.root !== target) {
    await privateDirectory(dirname3(target));
    await rename2(publication.root, target);
  }
  return { ...publication, root: target };
}

// packages/runner/src/operation-capabilities.ts
var digestOperation = (v) => createHash8("sha256").update(operationCanonical(v)).digest("hex");
function serviceDescriptor(service) {
  const credential = service.tokenEnv ? process.env[service.tokenEnv] : void 0;
  if (service.tokenEnv && !credential) throw Error("operation service credential is not available");
  return { version: 1, kind: "service", semantics: service.semantics, cancelable: false, actions: service.actions, generation: digestOperation({ service, credentialDigest: credential ? createHash8("sha256").update(credential).digest("hex") : null }) };
}
async function archiveScope(root) {
  await privateDirectory(root.path);
  const generation3 = inputRootGeneration(root.path), directory = join7(root.path, ".nado-operations-v1");
  await privateDirectory(directory);
  const owner = join7(directory, "owner.json");
  try {
    const old = await readJson(owner);
    if (old.purpose !== "nado-operation-archive-v1" || old.generation !== generation3) throw Error("archive scope ownership changed");
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
    if ((await readdir3(directory)).length) throw Error("unowned archive directory is not empty");
    await atomicJson(owner, { purpose: "nado-operation-archive-v1", generation: generation3 });
  }
  return { directory, descriptor: OperationDescriptorSchema.parse({ version: 1, kind: "archive", semantics: "idempotent-queryable", cancelable: false, actions: [{ name: "archive", fields: { name: { type: "string", required: true, maxLength: 200 } } }], generation: digestOperation({ root: root.id, generation: generation3 }) }) };
}
async function boundedJson(response, signal) {
  const parts = [];
  let bytes = 0;
  for await (const b of response.body) {
    signal?.throwIfAborted();
    bytes += b.length;
    if (bytes > 16384) throw Error("operation response exceeds 16 KiB");
    parts.push(b);
  }
  return JSON.parse(Buffer.concat(parts).toString("utf8"));
}
function serviceHeaders(s) {
  return s.tokenEnv ? { Authorization: `Bearer ${process.env[s.tokenEnv] ?? ""}` } : {};
}
function serviceUrl(s, path) {
  return s.url.replace(/\/+$/, "") + "/" + path;
}
async function probeOperationCapabilities(config, signal, workspaces = false) {
  const entries = [];
  if (workspaces) for (const c of config.workspaces ?? []) {
    try {
      const descriptor = await probeCompute(c);
      entries.push({ id: operationCapabilityId("workspace", c.id), kind: "capability", name: "workspace.execute", label: "Task workspace " + c.id, protocol: "runner-operation-v1", operation: descriptor, version: "1", readiness: "available", evidence: "probed" });
    } catch {
    }
  }
  for (const root of config.archiveRoots) {
    try {
      const { directory, descriptor } = await archiveScope(root), probe = join7(directory, "probe-" + randomUUID2() + ".json");
      await atomicJson(probe, { probe: true });
      await unlink2(probe);
      entries.push({ id: operationCapabilityId("archive", root.id), kind: "capability", name: "files.archive", label: "Archive " + root.id, protocol: "runner-operation-v1", operation: descriptor, version: "1", readiness: "available", evidence: "probed" });
    } catch {
    }
  }
  await Promise.all(config.services.map(async (service) => {
    try {
      const descriptor = serviceDescriptor(service), r = await fetch(serviceUrl(service, "capabilities"), { headers: serviceHeaders(service), signal: AbortSignal.any([AbortSignal.timeout(service.requestTimeoutMs), ...signal ? [signal] : []]), redirect: "error" });
      if (!r.ok) {
        await r.body?.cancel();
        return;
      }
      const actual = OperationDescriptorSchema.omit({ kind: true, generation: true }).parse(await boundedJson(r));
      if (actual.semantics !== descriptor.semantics || descriptor.actions.some((a) => !actual.actions.some((v) => digestOperation(v) === digestOperation(a)))) return;
      entries.push({ id: operationCapabilityId("service", service.id), kind: "capability", name: "service.invoke", label: "Service " + service.id, protocol: "runner-operation-v1", operation: descriptor, version: "1", readiness: "available", evidence: "probed" });
    } catch {
    }
  }));
  signal?.throwIfAborted();
  return entries.sort((a, b) => a.id.localeCompare(b.id));
}

// packages/runner/src/operation-artifacts.ts
async function operationArtifactScope(config, spool, job) {
  if (!job.workdir.startsWith("operation:")) return;
  const run2 = spool.get(job.turnId);
  if (!run2?.terminal || !run2.cleanupConfirmed || run2.executionState !== "closed" || run2.sessionId !== job.sessionId) throw Error("archive export requires owned closed execution");
  const control = nativeControlDir(config.spoolDir, run2.runId);
  await privateDirectory(control);
  const grant = OperationRequestSchema.parse(await readJson(join8(control, "operation-grant.json")));
  if (grant.turnId !== job.turnId || grant.runId !== run2.runId || grant.sessionId !== job.sessionId || job.workdir !== "operation:" + grant.operationId || digestOperation(operationRequestPayload(grant)) !== grant.requestHash) throw Error("operation export grant identity mismatch");
  if (!config.operations?.enabled) throw Error("archive export is disabled");
  if (grant.descriptor.kind === "workspace") {
    const workspace = config.operations.workspaces?.find((c) => "operation:workspace:" + c.id === grant.capabilityId);
    if (!workspace) throw Error("workspace export is not configured");
    const publication = await activateComputePublication(workspace, grant, config.hub);
    return { workdir: publication.root, workspaceRoots: [publication.root] };
  }
  if (grant.descriptor.kind !== "archive" || grant.intent.kind !== "archive" || !grant.inputFile) throw Error("archive export scope mismatch");
  const root = config.operations.archiveRoots.find((r) => "operation:archive:" + r.id === grant.capabilityId);
  if (!root) throw Error("archive export not configured");
  const scope = await archiveScope(root);
  if (digestOperation(scope.descriptor) !== digestOperation(grant.descriptor)) throw Error("archive export generation changed");
  const archive = join8(scope.directory, grant.tenantId, grant.operationId);
  await privateDirectory(archive);
  const receipt = OperationObservationSchema.parse(await readJson(join8(archive, "receipt.json")));
  if (receipt.operationId !== grant.operationId || receipt.intentHash !== grant.intentHash || receipt.status !== "applied") throw Error("archive export has no matching receipt");
  const source = join8(archive, "input.bin"), before = await hashFile(source, void 0, grant.inputFile.sizeBytes);
  if (before.sha256 !== grant.inputFile.sha256) throw Error("archive export checksum mismatch");
  const workdir = join8(control, "delivery"), output = join8(workdir, "output");
  await privateDirectory(output);
  const name = String(grant.intent.args.name), reserved = /^(con|prn|aux|nul|clock\$|com[0-9¹²³]|lpt[0-9¹²³])$/i.test(name.split(".")[0].trimEnd());
  const filename = ArtifactRelativePathSchema.safeParse("output/" + name).success && !/[\\/<>:"|?*]/.test(name) && !reserved ? name : "archive.bin", target = join8(output, filename);
  try {
    await copyFile2(source, target, constants3.COPYFILE_EXCL);
  } catch (e) {
    if (e.code !== "EEXIST") throw e;
  }
  const copied = await hashFile(target, void 0, before.sizeBytes), after = await hashFile(source, void 0, before.sizeBytes);
  if (copied.sha256 !== before.sha256 || after.sha256 !== before.sha256) throw Error("archive export source or copy changed");
  return { workdir, workspaceRoots: [workdir] };
}

// packages/runner/src/runner.ts
import { existsSync as existsSync9, mkdirSync as mkdirSync6, readdirSync as readdirSync6, realpathSync as realpathSync2, readFileSync as readFileSync7, writeFileSync as writeFileSync3 } from "node:fs";
import { createHash as createHash12 } from "node:crypto";
import { fileURLToPath as fileURLToPath3 } from "node:url";
import { join as join15 } from "node:path";
import { dirname as dirname4, isAbsolute as isAbsolute11, relative as relative6, resolve as resolve9 } from "node:path";

// node_modules/.pnpm/ws@8.21.3/node_modules/ws/wrapper.mjs
var import_stream = __toESM(require_stream(), 1);
var import_extension = __toESM(require_extension(), 1);
var import_permessage_deflate = __toESM(require_permessage_deflate(), 1);
var import_receiver = __toESM(require_receiver(), 1);
var import_sender = __toESM(require_sender(), 1);
var import_subprotocol = __toESM(require_subprotocol(), 1);
var import_websocket = __toESM(require_websocket(), 1);
var import_websocket_server = __toESM(require_websocket_server(), 1);
var wrapper_default = import_websocket.default;

// packages/runner/src/supervised.ts
import { fork } from "node:child_process";
import { existsSync as existsSync5 } from "node:fs";
import { randomUUID as randomUUID3 } from "node:crypto";
import { fileURLToPath as fileURLToPath2, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
var DEFAULT_SUPERVISOR_STARTUP_TIMEOUT_MS = 3e4;
var SUPERVISOR_STOP_GRACE_MS = 12e3;
function supervise(spool, turnId, adapter, config, input, onProgress, opts = {}) {
  const run2 = spool.get(turnId);
  if (!run2) throw new Error("supervisor requires committed start intent");
  const bundled = fileURLToPath2(new URL("./nado-supervisor.mjs", import.meta.url));
  const entry = opts.entryPath ?? (existsSync5(bundled) ? bundled : fileURLToPath2(new URL("./supervisor-entry.ts", import.meta.url)));
  const spec = { spoolDir: spool.dir, turnId, runId: run2.runId, token: randomUUID3(), adapter, config, input, timeoutMs: opts.timeoutMs, deadlineAt: opts.deadlineAt, readonlyJob: opts.readonlyJob, readonlyWorkerEntry: opts.readonlyWorkerEntry, operationJob: opts.operationJob, operationWorkerEntry: opts.operationWorkerEntry };
  const startupTimeoutMs = opts.startupTimeoutMs ?? DEFAULT_SUPERVISOR_STARTUP_TIMEOUT_MS;
  if (!Number.isSafeInteger(startupTimeoutMs) || startupTimeoutMs <= 0) throw new Error("supervisor startup timeout must be a positive integer");
  const startupDeadline = performance.now() + startupTimeoutMs;
  const child = fork(entry, [], {
    // Do not inherit vitest flags, inspector ports, or eval/loader arguments.
    execArgv: entry.endsWith(".ts") ? ["--import", pathToFileURL(createRequire(import.meta.url).resolve("tsx")).href] : [],
    stdio: ["ignore", "ignore", "pipe", "ipc"],
    windowsHide: true,
    detached: true
  });
  let stderr = "", failure2;
  let startup = "waiting";
  let startupTimer, forceTimer;
  const reportFault = (error) => opts.onFault?.(error instanceof Error ? error : new Error(String(error)));
  function stopSupervisor(reason) {
    forceTimer ??= setTimeout(() => {
      if (startup === "closed" || child.exitCode !== null || child.signalCode !== null) return;
      try {
        if (!child.kill("SIGKILL")) failure2 ??= "cannot terminate supervisor through its original process handle";
      } catch (e) {
        failure2 ??= e.message;
      }
    }, SUPERVISOR_STOP_GRACE_MS);
    forceTimer.unref();
    try {
      if (child.connected) child.send({ t: "abort", reason, disconnect: true }, () => {
      });
    } catch (e) {
      failure2 ??= e.message;
    }
  }
  function expireStartup() {
    if (startup !== "waiting") return;
    startup = "expired";
    clearTimeout(startupTimer);
    const reason = `supervisor startup timed out after ${startupTimeoutMs}ms; CLI cleanup remains unconfirmed`;
    failure2 = reason;
    try {
      const current = spool.get(turnId);
      if (!current.cleanupConfirmed) {
        spool.markUnconfirmed(turnId, reason);
        spool.append(turnId, { type: "raw", data: { type: "runner.supervisor_startup_timeout", startupTimeoutMs, reason } });
      }
      onProgress();
    } catch (e) {
      reportFault(e);
    } finally {
      stopSupervisor(reason);
    }
  }
  function startupFailed(error) {
    failure2 = error.message;
    if (startup !== "waiting") return;
    startup = "failed";
    clearTimeout(startupTimer);
    stopSupervisor(failure2);
  }
  startupTimer = setTimeout(expireStartup, Math.max(0, startupDeadline - performance.now()));
  child.stderr?.on("data", (chunk) => {
    stderr = (stderr + String(chunk)).slice(-8e3);
  });
  child.on("error", (e) => {
    failure2 = e.message;
  });
  child.on("message", (message) => {
    if (!message || typeof message !== "object") return;
    if (message.t === "started" && startup === "waiting" && message.runId === spec.runId && message.token === spec.token) {
      if (performance.now() >= startupDeadline) expireStartup();
      else {
        startup = "started";
        clearTimeout(startupTimer);
      }
    }
    if (message.t === "fault") {
      failure2 = `supervisor persistence failure: ${message.error ?? "unknown storage fault"}`;
      reportFault(new Error(failure2));
    }
    try {
      onProgress();
    } catch (e) {
      reportFault(e);
      stopSupervisor("Runner progress/persistence failure");
    }
  });
  const done = new Promise((resolve10) => {
    child.once("close", (code) => {
      startup = "closed";
      clearTimeout(startupTimer);
      clearTimeout(forceTimer);
      try {
        const current = spool.get(turnId);
        if (!current.terminal) {
          const reason = `supervisor exited without durable close (${failure2 ?? code}): ${stderr}`;
          spool.markUnconfirmed(turnId, reason);
          spool.append(turnId, { type: "turn.failed", error: reason }, "unconfirmed");
        }
        onProgress();
        const record = spool.get(turnId);
        resolve10({ cleanupConfirmed: record.cleanupConfirmed, reason: record.cleanupReason ?? "supervisor cleanup unknown" });
      } catch (e) {
        reportFault(e);
        resolve10({ cleanupConfirmed: false, reason: e.message });
      }
    });
  });
  try {
    child.send({ t: "start", spec }, (e) => {
      if (e) startupFailed(e);
    });
  } catch (e) {
    startupFailed(e);
  }
  return {
    done,
    cancel() {
      spool.requestCancel(turnId, run2.runId);
      if (child.connected) child.send({ t: "cancel" }, () => {
      });
    },
    abort(reason) {
      if (child.connected) child.send({ t: "abort", reason }, () => {
      });
    }
  };
}

// packages/runner/src/spool.ts
import { existsSync as existsSync6, mkdirSync as mkdirSync3, readdirSync as readdirSync4, readFileSync as readFileSync5 } from "node:fs";
import { join as join9 } from "node:path";
import { DatabaseSync } from "node:sqlite";
var OUTBOX_SCHEMA_VERSION = 3;
var REPLAY_MAX_EVENTS = 256;
var INVENTORY_WHERE = "(next_rseq-1>acked_rseq OR (resource_released_at IS NULL AND state NOT IN ('closed','none')))=1";
var SCHEMA = `
CREATE TABLE runs (
 run_id TEXT PRIMARY KEY, turn_id TEXT NOT NULL UNIQUE, session_id TEXT, native_key TEXT,
 state TEXT NOT NULL, next_rseq INTEGER NOT NULL DEFAULT 0, acked_rseq INTEGER NOT NULL DEFAULT -1,
 cancel_requested INTEGER NOT NULL DEFAULT 0, legacy INTEGER NOT NULL DEFAULT 0,
 terminal INTEGER NOT NULL DEFAULT 0, cleanup_confirmed INTEGER NOT NULL DEFAULT 0,
 supervisor_token TEXT, supervisor_pid INTEGER, cleanup_reason TEXT, created_at INTEGER NOT NULL,
 resource_released_at INTEGER, release_reason TEXT
);
CREATE TABLE outbox (
 run_id TEXT NOT NULL REFERENCES runs(run_id) ON UPDATE CASCADE,
 rseq INTEGER NOT NULL, event TEXT NOT NULL, execution_state TEXT NOT NULL,
 PRIMARY KEY(run_id, rseq)
);
CREATE TABLE imports (filename TEXT PRIMARY KEY, imported_at INTEGER NOT NULL);
`;
var Spool = class {
  constructor(dir) {
    this.dir = dir;
    mkdirSync3(dir, { recursive: true });
    this.file = join9(dir, "outbox.sqlite");
    const existed = existsSync6(this.file);
    this.db = new DatabaseSync(this.file);
    try {
      this.db.exec("PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON;");
      const version = Number(this.db.prepare("PRAGMA user_version").get().user_version);
      if (version > OUTBOX_SCHEMA_VERSION) throw new Error(`unsupported outbox schema ${version}; refusing downgrade`);
      if (this.db.prepare("PRAGMA quick_check").get().quick_check !== "ok") throw new Error("outbox integrity check failed");
      if (version < OUTBOX_SCHEMA_VERSION) {
        if (existed) this.db.exec(`VACUUM INTO '${this.file.replaceAll("'", "''")}.pre-v${version}-${Date.now()}.sqlite'`);
        this.write(() => {
          if (version === 0) {
            if (this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").get()) throw new Error("unknown unversioned outbox schema");
            this.db.exec(SCHEMA);
          } else if (version === 1) {
            this.db.exec("ALTER TABLE runs ADD COLUMN resource_released_at INTEGER; ALTER TABLE runs ADD COLUMN release_reason TEXT;");
          }
          this.db.exec(`CREATE INDEX runs_inventory ON runs(created_at,run_id) WHERE ${INVENTORY_WHERE}`);
          this.db.exec(`PRAGMA user_version=${OUTBOX_SCHEMA_VERSION}`);
        });
      }
      this.db.exec("PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;");
      this.importLegacy();
    } catch (e) {
      this.db.close();
      throw e;
    }
  }
  file;
  db;
  failure;
  get healthy() {
    return !this.failure;
  }
  close() {
    this.db.close();
  }
  write(fn) {
    if (this.failure) throw this.failure;
    try {
      this.db.exec("BEGIN IMMEDIATE");
      const result = fn();
      this.db.exec("COMMIT");
      return result;
    } catch (e) {
      try {
        this.db.exec("ROLLBACK");
      } catch {
      }
      this.failure = new Error(`outbox write failed; execution disabled: ${e.message}`);
      throw this.failure;
    }
  }
  record(r) {
    return {
      turnId: String(r.turn_id),
      runId: String(r.run_id),
      sessionId: r.session_id,
      nativeResourceKey: r.native_key,
      executionState: r.state,
      lastRseq: Number(r.next_rseq) - 1,
      ackedRseq: Number(r.acked_rseq),
      cancelRequested: !!r.cancel_requested,
      legacy: !!r.legacy,
      terminal: !!r.terminal,
      cleanupConfirmed: !!r.cleanup_confirmed,
      supervisorToken: r.supervisor_token,
      supervisorPid: r.supervisor_pid,
      cleanupReason: r.cleanup_reason,
      resourceReleasedAt: r.resource_released_at
    };
  }
  runs() {
    return this.db.prepare("SELECT * FROM runs ORDER BY created_at, run_id").all().map((r) => this.record(r));
  }
  inventory() {
    const rows = this.db.prepare(`SELECT * FROM runs WHERE ${INVENTORY_WHERE} ORDER BY created_at,run_id`).all();
    return rows.map((row) => {
      const { terminal: _t, cleanupConfirmed: _c, supervisorToken: _o, supervisorPid: _p, cleanupReason: _r, ...r } = this.record(row);
      return r;
    });
  }
  get(turnId) {
    const r = this.db.prepare("SELECT * FROM runs WHERE turn_id=?").get(turnId);
    return r && this.record(r);
  }
  turnIds() {
    return this.runs().map((r) => r.turnId);
  }
  has(turnId) {
    return !!this.get(turnId);
  }
  hasTerminal(turnId) {
    return this.get(turnId)?.terminal ?? false;
  }
  /** The intent is committed before any fork/spawn. False denotes an existing execution. */
  register(turnId, runId, sessionId, nativeResourceKey) {
    const prior = this.get(turnId);
    if (prior) {
      if (prior.runId !== runId) throw new Error(`turn ${turnId} already belongs to run ${prior.runId}`);
      return false;
    }
    return this.write(() => {
      this.db.prepare("INSERT INTO runs(run_id,turn_id,session_id,native_key,state,created_at) VALUES(?,?,?,?,?,?)").run(runId, turnId, sessionId, nativeResourceKey, "starting", Date.now());
      return true;
    });
  }
  /** Bind old files to Hub identity and high-water BEFORE producing any restart event. */
  reconcile(remote) {
    this.write(() => {
      const local = this.get(remote.turnId);
      if (!local) {
        this.db.prepare("INSERT INTO runs(run_id,turn_id,session_id,native_key,state,next_rseq,acked_rseq,cancel_requested,created_at) VALUES(?,?,?,?,?,?,?,?,?)").run(remote.runId, remote.turnId, remote.sessionId, remote.nativeResourceKey, "recovering", remote.lastRseq + 1, remote.lastRseq, Number(remote.cancelRequested), Date.now());
      } else {
        if (!local.legacy && local.runId !== remote.runId) throw new Error("Hub/local run identity mismatch");
        if (!local.legacy && remote.lastRseq > local.lastRseq) throw new Error("Hub high-water exceeds durable local high-water");
        if (!local.legacy && remote.lastRseq < local.ackedRseq) throw new Error("Hub high-water regressed below pruned ACK; recovery requires retained Hub data");
        this.db.prepare("UPDATE runs SET run_id=?,session_id=?,native_key=?,next_rseq=MAX(next_rseq,?),acked_rseq=MAX(acked_rseq,?),cancel_requested=MAX(cancel_requested,?),legacy=0 WHERE turn_id=?").run(remote.runId, remote.sessionId, remote.nativeResourceKey, remote.lastRseq + 1, remote.lastRseq, Number(remote.cancelRequested), remote.turnId);
        this.db.prepare("DELETE FROM outbox WHERE run_id=? AND rseq<=?").run(remote.runId, remote.lastRseq);
      }
      if (remote.resourceReleasedAt != null) this.db.prepare("UPDATE runs SET resource_released_at=COALESCE(resource_released_at,?) WHERE turn_id=?").run(remote.resourceReleasedAt, remote.turnId);
    });
    return this.get(remote.turnId);
  }
  claim(turnId, runId, token, pid) {
    this.write(() => {
      const r = this.get(turnId);
      if (!r || r.runId !== runId || r.supervisorToken || r.terminal) throw new Error("run cannot be claimed twice");
      this.db.prepare("UPDATE runs SET supervisor_token=?,supervisor_pid=?,state=? WHERE run_id=?").run(token, pid, "starting", runId);
    });
  }
  requestCancel(turnId, runId) {
    this.write(() => {
      this.db.prepare("UPDATE runs SET cancel_requested=1,state=CASE WHEN cleanup_confirmed=1 THEN state ELSE 'stopping' END WHERE turn_id=? AND run_id=? AND terminal=0").run(turnId, runId);
    });
  }
  release(turnId, runId, at, reason) {
    this.write(() => {
      const run2 = this.get(turnId);
      if (!run2 || run2.runId !== runId) throw new Error("resource release identity mismatch");
      this.db.prepare("UPDATE runs SET resource_released_at=COALESCE(resource_released_at,?),release_reason=? WHERE run_id=?").run(at, reason, runId);
    });
  }
  markUnconfirmed(turnId, reason) {
    this.write(() => {
      this.db.prepare("UPDATE runs SET state='unconfirmed',cleanup_reason=? WHERE turn_id=? AND cleanup_confirmed=0").run(reason, turnId);
    });
  }
  recover(turnId) {
    this.write(() => {
      const r = this.get(turnId);
      if (r.legacy || r.cleanupConfirmed || r.resourceReleasedAt != null || r.executionState === "unconfirmed") return;
      if (r.terminal) {
        if (!r.cleanupConfirmed && !r.supervisorToken) this.db.prepare("UPDATE runs SET state='unconfirmed' WHERE turn_id=?").run(turnId);
        return;
      }
      if (r.supervisorToken) {
        this.db.prepare("UPDATE runs SET state='recovering' WHERE turn_id=? AND cleanup_confirmed=0").run(turnId);
        return;
      }
      this.appendTx(turnId, { type: "turn.failed", error: "Runner restarted; no process cleanup evidence is available" }, "unconfirmed");
    });
  }
  /** No PID observation can prove cleanup. Only a durable close can prevent expiry. */
  expireRecovery(turnId, runId, graceMs) {
    return this.write(() => {
      const run2 = this.get(turnId);
      if (!run2 || run2.runId !== runId || run2.executionState !== "recovering" || !run2.supervisorToken || run2.cleanupConfirmed || run2.resourceReleasedAt != null) return;
      const reason = `No durable supervisor close was recorded within the ${graceMs}ms restart recovery grace; execution remains unconfirmed`;
      this.db.prepare("UPDATE runs SET cleanup_reason=? WHERE run_id=?").run(reason, runId);
      return this.appendTx(turnId, { type: "raw", data: { type: "runner.recovery_unconfirmed", graceMs, reason } }, "unconfirmed");
    });
  }
  append(turnId, event, executionState) {
    AgentEventSchema.parse(event);
    return this.write(() => this.appendTx(turnId, event, executionState));
  }
  appendTx(turnId, event, state) {
    const r = this.get(turnId);
    if (!r || r.legacy) throw new Error("run must be registered and reconciled before events");
    if (isTerminalEvent(event) && r.terminal) throw new Error("terminal already persisted");
    const executionState = r.executionState === "unconfirmed" && !isTerminalEvent(event) ? "unconfirmed" : state ?? r.executionState;
    const entry = { rseq: r.lastRseq + 1, event, executionState };
    this.db.prepare("INSERT INTO outbox(run_id,rseq,event,execution_state) VALUES(?,?,?,?)").run(r.runId, entry.rseq, JSON.stringify(event), executionState);
    this.db.prepare("UPDATE runs SET next_rseq=?,state=?,terminal=MAX(terminal,?) WHERE run_id=?").run(entry.rseq + 1, executionState, Number(isTerminalEvent(event)), r.runId);
    return entry;
  }
  /** Cleanup evidence and the only terminal event share one durable commit. */
  finish(turnId, event, cleanupConfirmed, reason, remoteUnconfirmed = false) {
    return this.write(() => {
      if (!isTerminalEvent(event)) throw new Error("finish requires terminal");
      const r = this.get(turnId);
      const terminal = r.cancelRequested ? { type: "turn.canceled" } : event;
      const closed = cleanupConfirmed && !remoteUnconfirmed;
      this.db.prepare("UPDATE runs SET cleanup_confirmed=?,cleanup_reason=? WHERE turn_id=?").run(Number(closed), reason, turnId);
      return this.appendTx(turnId, terminal, closed ? "closed" : "unconfirmed");
    });
  }
  pending(turnId, afterRseq = -1) {
    const r = this.get(turnId);
    if (!r) return [];
    return this.db.prepare("SELECT rseq,event,execution_state FROM outbox WHERE run_id=? AND rseq>? ORDER BY rseq").all(r.runId, Math.max(afterRseq, r.ackedRseq)).map((row) => ({ rseq: Number(row.rseq), event: AgentEventSchema.parse(JSON.parse(String(row.event))), executionState: row.execution_state }));
  }
  /** Runtime replay materializes only a bounded prefix; only a committed ACK prunes it. */
  pendingBatch(turnId, afterRseq = -1, limits = {}) {
    const maxEvents = limits.maxEvents ?? REPLAY_MAX_EVENTS;
    const maxBytes = limits.maxBytes ?? MAX_WS_BUFFER_BYTES;
    if (!Number.isSafeInteger(afterRseq) || afterRseq < -1 || !Number.isSafeInteger(maxEvents) || maxEvents < 1 || maxEvents > 5e3 || !Number.isSafeInteger(maxBytes) || maxBytes < 1 || maxBytes > MAX_WS_BUFFER_BYTES) throw new Error("invalid outbox replay limits");
    const run2 = this.get(turnId);
    if (!run2) return [];
    const entries = [];
    let bytes = 0;
    const rows = this.db.prepare("SELECT rseq,event,execution_state FROM outbox WHERE run_id=? AND rseq>? ORDER BY rseq LIMIT ?").iterate(run2.runId, Math.max(afterRseq, run2.ackedRseq), maxEvents);
    for (const row of rows) {
      const raw = String(row.event), rseq = Number(row.rseq), executionState = row.execution_state;
      const envelopeBytes = Buffer.byteLength(JSON.stringify({ t: "event", turnId, runId: run2.runId, rseq, executionState, event: null })) - 4;
      const eventBytes = envelopeBytes + Buffer.byteLength(raw);
      if (eventBytes > maxBytes) {
        if (entries.length) break;
        throw new Error(`outbox event at rseq ${rseq} exceeds ${maxBytes}-byte replay budget; event retained`);
      }
      if (bytes + eventBytes > maxBytes) break;
      entries.push({ rseq, executionState, event: AgentEventSchema.parse(JSON.parse(raw)) });
      bytes += eventBytes;
    }
    return entries;
  }
  ack(turnId, rseq, runId) {
    const r = this.get(turnId);
    if (!r || runId && r.runId !== runId || rseq <= r.ackedRseq) return;
    if (rseq > r.lastRseq) throw new Error("ACK beyond local high-water");
    this.write(() => {
      this.db.prepare("UPDATE runs SET acked_rseq=? WHERE run_id=?").run(rseq, r.runId);
      this.db.prepare("DELETE FROM outbox WHERE run_id=? AND rseq<=?").run(r.runId, rseq);
    });
  }
  importLegacy() {
    for (const filename of readdirSync4(this.dir).filter((f) => f.endsWith(".jsonl")).sort()) {
      if (this.db.prepare("SELECT 1 FROM imports WHERE filename=?").get(filename)) continue;
      const turnId = filename.slice(0, -6);
      const raw = readFileSync5(join9(this.dir, filename), "utf8");
      const lines = raw.split("\n");
      const entries = [];
      for (let i = 0; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        let parsed;
        try {
          parsed = JSON.parse(lines[i]);
        } catch (e) {
          throw new Error(`corrupt or torn legacy spool ${filename}:${i + 1}; source retained, explicit repair required`);
        }
        if (!Number.isSafeInteger(parsed.rseq) || parsed.rseq < 0 || entries.length && parsed.rseq !== entries.at(-1).rseq + 1) throw new Error(`non-contiguous legacy spool ${filename}:${i + 1}`);
        entries.push({ rseq: parsed.rseq, event: AgentEventSchema.parse(parsed.event) });
      }
      this.write(() => {
        const runId = `legacy:${turnId}`;
        if (this.get(turnId)) throw new Error(`legacy file conflicts with durable run ${turnId}`);
        this.db.prepare("INSERT INTO runs(run_id,turn_id,state,next_rseq,legacy,terminal,created_at) VALUES(?,?,?,?,1,?,?)").run(runId, turnId, "recovering", (entries.at(-1)?.rseq ?? -1) + 1, Number(entries.some((e) => isTerminalEvent(e.event))), Date.now());
        const insert = this.db.prepare("INSERT INTO outbox(run_id,rseq,event,execution_state) VALUES(?,?,?,?)");
        for (const e of entries) insert.run(runId, e.rseq, JSON.stringify(e.event), "recovering");
        this.db.prepare("INSERT INTO imports(filename,imported_at) VALUES(?,?)").run(filename, Date.now());
      });
    }
  }
};

// packages/runner/src/openclaw-sync.ts
import { execFile as execFile2 } from "node:child_process";
import { randomUUID as randomUUID4 } from "node:crypto";

// packages/runner/src/openclaw-store.ts
import { existsSync as existsSync7, mkdirSync as mkdirSync4, readFileSync as readFileSync6 } from "node:fs";
import { join as join10 } from "node:path";
import { DatabaseSync as DatabaseSync2 } from "node:sqlite";
var OPENCLAW_SCHEMA_VERSION = 1;
var OpenclawStorageError = class extends Error {
};
function parseMirrorBlock(value) {
  if (value === null) return null;
  try {
    const b = JSON.parse(value);
    if (b?.version === 1 && typeof b.reason === "string") {
      if (b.kind === "observation") return b;
      if (b.kind === "exchange" && typeof b.clientId === "string" && b.clientId && (b.sourceIdentity === "stable" && typeof b.sourceId === "string" && b.sourceId || b.sourceIdentity === "unverified" && b.sourceId === void 0)) return b;
    }
  } catch {
  }
  return { kind: "legacy", reason: `Unidentified durable mirror blocker requires explicit reset: ${value}` };
}
var SCHEMA2 = `
CREATE TABLE cursors (
 native_key TEXT PRIMARY KEY, generation INTEGER NOT NULL DEFAULT 0,
 seq INTEGER NOT NULL DEFAULT -1, updated_at INTEGER NOT NULL DEFAULT -1,
 reset_requested INTEGER NOT NULL DEFAULT 0, legacy_seq INTEGER,
 coverage_gap TEXT, blocked TEXT, last_disposition TEXT
);
CREATE TABLE pending (
 native_key TEXT PRIMARY KEY REFERENCES cursors(native_key), batch_id TEXT NOT NULL UNIQUE,
 payload TEXT NOT NULL, target TEXT NOT NULL, created_at INTEGER NOT NULL
);
CREATE TABLE seen (
 native_key TEXT NOT NULL REFERENCES cursors(native_key), generation INTEGER NOT NULL, client_id TEXT NOT NULL,
 PRIMARY KEY(native_key,generation,client_id)
);
CREATE TABLE metadata (key TEXT PRIMARY KEY,value TEXT NOT NULL);
`;
var OpenclawStore = class {
  constructor(spoolDir) {
    this.spoolDir = spoolDir;
    mkdirSync4(spoolDir, { recursive: true });
    this.file = join10(spoolDir, "openclaw.sqlite");
    const existed = existsSync7(this.file);
    this.db = new DatabaseSync2(this.file);
    try {
      this.db.exec("PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON;");
      const version = Number(this.db.prepare("PRAGMA user_version").get().user_version);
      if (version > OPENCLAW_SCHEMA_VERSION) throw new OpenclawStorageError(`unsupported OpenClaw store schema ${version}; refusing downgrade`);
      if (this.db.prepare("PRAGMA quick_check").get().quick_check !== "ok") throw new OpenclawStorageError("OpenClaw store integrity check failed");
      if (version < OPENCLAW_SCHEMA_VERSION) {
        if (existed) this.db.exec(`VACUUM INTO '${this.file.replaceAll("'", "''")}.pre-v${version}-${Date.now()}.sqlite'`);
        this.write(() => {
          if (this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").get()) throw new Error("unknown unversioned OpenClaw schema");
          this.db.exec(SCHEMA2);
          this.db.exec(`PRAGMA user_version=${OPENCLAW_SCHEMA_VERSION}`);
        });
      }
      this.db.exec("PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;");
      this.importLegacy();
    } catch (e) {
      this.db.close();
      throw e;
    }
  }
  file;
  db;
  failure;
  closed = false;
  get healthy() {
    return !this.failure && !this.closed;
  }
  close() {
    if (!this.closed) {
      this.closed = true;
      this.db.close();
    }
  }
  write(fn) {
    if (this.failure) throw this.failure;
    if (this.closed) throw new OpenclawStorageError("OpenClaw store is closed");
    try {
      this.db.exec("BEGIN IMMEDIATE");
      const value = fn();
      this.db.exec("COMMIT");
      return value;
    } catch (e) {
      try {
        this.db.exec("ROLLBACK");
      } catch {
      }
      this.failure = new OpenclawStorageError(`OpenClaw durable write failed; execution must stop: ${e.message}`);
      throw this.failure;
    }
  }
  read(fn) {
    try {
      return fn();
    } catch (e) {
      this.failure ??= new OpenclawStorageError(`OpenClaw durable read failed; execution must stop: ${e.message}`);
      throw this.failure;
    }
  }
  cursor(row) {
    return {
      nativeKey: String(row.native_key),
      generation: Number(row.generation),
      seq: Number(row.seq),
      updatedAt: Number(row.updated_at),
      resetRequested: !!row.reset_requested,
      legacySeq: row.legacy_seq,
      coverageGap: row.coverage_gap,
      blocked: row.blocked,
      lastDisposition: row.last_disposition
    };
  }
  get(nativeKey) {
    return this.read(() => {
      const row = this.db.prepare("SELECT * FROM cursors WHERE native_key=?").get(nativeKey);
      return row && this.cursor(row);
    });
  }
  ensure(nativeKey) {
    if (!this.get(nativeKey)) this.write(() => this.db.prepare("INSERT OR IGNORE INTO cursors(native_key) VALUES(?)").run(nativeKey));
    return this.get(nativeKey);
  }
  seen(nativeKey, generation3) {
    return this.read(() => new Set(this.db.prepare("SELECT client_id FROM seen WHERE native_key=? AND generation=?").all(nativeKey, generation3).map((r) => String(r.client_id))));
  }
  batch(row) {
    const serialized = String(row.payload), payload = RunnerToHubSchema.parse(JSON.parse(serialized));
    if (payload.t !== "external.sync" || payload.batchId !== row.batch_id || payload.sessions[0]?.nativeSessionId !== row.native_key) throw new OpenclawStorageError("corrupt OpenClaw pending identity");
    const target = JSON.parse(String(row.target));
    if (!Number.isSafeInteger(target.generation) || target.generation < 0 || !Number.isSafeInteger(target.seq) || target.seq < -1 || !Number.isFinite(target.updatedAt) || JSON.stringify(target.clientIds) !== JSON.stringify(payload.sessions[0].exchanges.map((e) => e.clientId))) throw new OpenclawStorageError("corrupt OpenClaw pending cursor");
    return { nativeKey: String(row.native_key), batchId: String(row.batch_id), serialized, payload, target };
  }
  pending(nativeKey) {
    return this.read(() => {
      const rows = nativeKey === void 0 ? this.db.prepare("SELECT * FROM pending ORDER BY created_at,batch_id").all() : this.db.prepare("SELECT * FROM pending WHERE native_key=?").all(nativeKey);
      return rows.map((row) => this.batch(row));
    });
  }
  stage(payload, target, blocker) {
    const parsed = RunnerToHubSchema.parse(payload);
    if (parsed.t !== "external.sync" || parsed.adapter !== "openclaw") throw new Error("only OpenClaw external batches are supported");
    const serialized = JSON.stringify(parsed);
    if (Buffer.byteLength(serialized, "utf8") > MAX_EXTERNAL_BATCH_BYTES) throw new Error("complete OpenClaw batch exceeds UTF-8 byte limit");
    const nativeKey = parsed.sessions[0].nativeSessionId;
    this.write(() => {
      const cursor = this.get(nativeKey);
      if (!cursor || cursor.generation !== target.generation) throw new Error("OpenClaw batch generation mismatch");
      if (this.db.prepare("SELECT 1 FROM pending WHERE native_key=?").get(nativeKey)) throw new Error("OpenClaw native key already has an immutable pending batch");
      const existing = parseMirrorBlock(cursor.blocked);
      if (existing?.kind === "legacy") throw new Error("legacy mirror blocker requires explicit reset");
      if (existing?.kind === "exchange") {
        const exchanges = parsed.sessions[0].exchanges;
        if (blocker || target.resolvesBlock !== cursor.blocked || existing.sourceIdentity !== "stable" || exchanges.length !== 1 || !exchanges.some((e) => e.clientId === existing.clientId && e.sourceId === existing.sourceId && e.sourceIdentity === "stable")) {
          throw new Error("pending batch does not repair the durable blocked source");
        }
      } else if (target.resolvesBlock !== void 0) throw new Error("batch attempts to resolve a missing source blocker");
      this.db.prepare("INSERT INTO pending(native_key,batch_id,payload,target,created_at) VALUES(?,?,?,?,?)").run(nativeKey, parsed.batchId, serialized, JSON.stringify(target), Date.now());
      this.db.prepare("UPDATE cursors SET blocked=? WHERE native_key=?").run(blocker ? JSON.stringify(blocker) : existing?.kind === "exchange" ? cursor.blocked : null, nativeKey);
    });
    return this.pending(nativeKey)[0];
  }
  /** Identity mismatch/duplicate ACK is a no-op. Cursor + seen IDs + deletion commit together. */
  ack(batchId, disposition) {
    const row = this.read(() => this.db.prepare("SELECT * FROM pending WHERE batch_id=?").get(batchId));
    if (!row) return false;
    const batch = this.read(() => this.batch(row));
    return this.write(() => {
      const cursor = this.get(batch.nativeKey);
      if (cursor.generation !== batch.target.generation) throw new Error("pending ACK generation mismatch");
      const insert = this.db.prepare("INSERT OR IGNORE INTO seen(native_key,generation,client_id) VALUES(?,?,?)");
      for (const id8 of batch.target.clientIds) insert.run(batch.nativeKey, batch.target.generation, id8);
      this.db.prepare("UPDATE cursors SET seq=MAX(seq,?),updated_at=?,last_disposition=? WHERE native_key=?").run(batch.target.seq, batch.target.updatedAt, disposition, batch.nativeKey);
      if (batch.target.resolvesBlock !== void 0 && batch.target.resolvesBlock === cursor.blocked) {
        this.db.prepare("UPDATE cursors SET blocked=NULL WHERE native_key=?").run(batch.nativeKey);
      }
      this.db.prepare("DELETE FROM pending WHERE batch_id=?").run(batchId);
      if (cursor.resetRequested) this.resetCursor(batch.nativeKey);
      return true;
    });
  }
  resetCursor(nativeKey) {
    this.db.prepare("UPDATE cursors SET generation=generation+1,seq=-1,updated_at=-1,reset_requested=0,blocked=NULL WHERE native_key=?").run(nativeKey);
  }
  /** Automatic Hub fullSync is a request to replay visible history, not authority
   * to discard a known gap. Preserve every blocked cursor and pending repair as-is. */
  rescan() {
    return this.write(() => {
      let retained = 0;
      for (const row of this.db.prepare("SELECT native_key,blocked FROM cursors").all()) {
        if (row.blocked !== null) {
          retained++;
          continue;
        }
        const key = String(row.native_key);
        if (this.db.prepare("SELECT 1 FROM pending WHERE native_key=?").get(key)) this.db.prepare("UPDATE cursors SET reset_requested=1 WHERE native_key=?").run(key);
        else this.resetCursor(key);
      }
      return retained;
    });
  }
  /** Explicit operator reset may discard a blocker; automatic fullSync uses rescan(). */
  reset() {
    this.write(() => {
      for (const row of this.db.prepare("SELECT native_key FROM cursors").all()) {
        const key = String(row.native_key);
        if (this.db.prepare("SELECT 1 FROM pending WHERE native_key=?").get(key)) this.db.prepare("UPDATE cursors SET reset_requested=1 WHERE native_key=?").run(key);
        else this.resetCursor(key);
      }
    });
  }
  markBlocked(nativeKey, reason) {
    this.ensure(nativeKey);
    this.write(() => {
      const existing = parseMirrorBlock(this.get(nativeKey).blocked);
      if (existing?.kind === "exchange" || existing?.kind === "legacy") return;
      this.db.prepare("UPDATE cursors SET blocked=? WHERE native_key=?").run(JSON.stringify({ version: 1, kind: "observation", reason }), nativeKey);
    });
  }
  markSourceBlocked(nativeKey, blocker) {
    this.ensure(nativeKey);
    this.write(() => {
      const existing = parseMirrorBlock(this.get(nativeKey).blocked);
      if (existing?.kind === "exchange" || existing?.kind === "legacy") return;
      this.db.prepare("UPDATE cursors SET blocked=? WHERE native_key=?").run(JSON.stringify(blocker), nativeKey);
    });
  }
  clearObservationBlock(nativeKey) {
    this.write(() => {
      if (parseMirrorBlock(this.get(nativeKey)?.blocked ?? null)?.kind === "observation") {
        this.db.prepare("UPDATE cursors SET blocked=NULL WHERE native_key=?").run(nativeKey);
      }
    });
  }
  markGap(nativeKey, reason) {
    this.ensure(nativeKey);
    this.write(() => this.db.prepare("UPDATE cursors SET coverage_gap=? WHERE native_key=?").run(reason, nativeKey));
  }
  importLegacy() {
    const legacy = join10(this.spoolDir, "..", "openclaw-sync.json");
    if (!existsSync7(legacy) || this.db.prepare("SELECT 1 FROM metadata WHERE key='legacy-imported'").get()) return;
    let parsed;
    try {
      parsed = JSON.parse(readFileSync6(legacy, "utf8"));
    } catch (e) {
      throw new OpenclawStorageError(`invalid legacy OpenClaw cursor; source retained, explicit repair required: ${e.message}`);
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new OpenclawStorageError("invalid legacy OpenClaw cursor map");
    const rows = Object.entries(parsed);
    for (const [key, value] of rows) {
      if (!key || !value || typeof value !== "object" || !Number.isSafeInteger(value.seq) || !Number.isFinite(value.updatedAt)) throw new OpenclawStorageError(`invalid legacy OpenClaw cursor for ${key}`);
    }
    this.write(() => {
      for (const [key, value] of rows) {
        const sent = value;
        this.db.prepare("INSERT OR IGNORE INTO cursors(native_key,legacy_seq,coverage_gap) VALUES(?,?,?)").run(
          key,
          sent.seq,
          `Legacy cursor only proves sent, not acknowledged (seq ${sent.seq}, updatedAt ${sent.updatedAt}); replay visible history; coverage outside the returned window is unverified`
        );
      }
      this.db.prepare("INSERT INTO metadata(key,value) VALUES('legacy-imported',?)").run(JSON.stringify({ path: legacy, importedAt: Date.now() }));
    });
  }
};

// packages/runner/src/openclaw-sync.ts
var DEFAULT_HISTORY_REQUESTS_PER_PASS = 16;
var DEFAULT_PASS_MS = 1e4;
var DEFAULT_GATEWAY_RESPONSE_BYTES = 16 * 1024 * 1024;
var DEFAULT_FORCE_RESCAN_MS = 5 * 6e4;
var DEFAULT_RETRY_INITIAL_MS = 1e3;
var DEFAULT_RETRY_MAX_MS = 6e4;
function positiveOption(value, fallback) {
  return value !== void 0 && Number.isFinite(value) && value > 0 ? value : fallback;
}
function titleFor(key, agent, info, row) {
  const rest = key.split(":").slice(2), thread = key.match(/:thread:[^:]+:([^:]+)$/)?.[1];
  const who = (info?.displayName ?? row.displayName ?? "").replace(/\s+id:\S+$/, ""), channel = info?.channel ?? row.channel;
  let base2;
  if (who && channel) base2 = `${who} \xB7 ${channel}`;
  else if (rest[0] === "cron") base2 = `\u5B9A\u65F6\u4EFB\u52A1 ${rest[1]?.slice(0, 8) ?? ""}`;
  else if (rest[0] === "subagent") base2 = `\u5B50\u4EE3\u7406 ${rest[1]?.slice(0, 8) ?? ""}`;
  else if (thread && channel) base2 = `${channel} \u8BDD\u9898`;
  else base2 = row.label ?? rest.join(":");
  return `[${agent}] ${base2}${thread ? ` #${thread}` : ""}`.slice(0, 200);
}
var OpenclawSync = class {
  constructor(spoolDir, config, send, _busy, log, options = {}) {
    this.config = config;
    this.send = send;
    this.log = log;
    this.options = options;
    this.store = new OpenclawStore(spoolDir);
    this.now = options.now ?? Date.now;
    this.maxHistoryRequestsPerPass = Math.floor(positiveOption(options.maxHistoryRequestsPerPass, DEFAULT_HISTORY_REQUESTS_PER_PASS));
    this.maxPassMs = positiveOption(options.maxPassMs, DEFAULT_PASS_MS);
    this.maxGatewayResponseBytes = Math.floor(positiveOption(options.maxGatewayResponseBytes, DEFAULT_GATEWAY_RESPONSE_BYTES));
    this.forceRescanMs = positiveOption(options.forceRescanMs, DEFAULT_FORCE_RESCAN_MS);
    this.retryInitialMs = positiveOption(options.retryInitialMs, DEFAULT_RETRY_INITIAL_MS);
    this.retryMaxMs = Math.max(this.retryInitialMs, positiveOption(options.retryMaxMs, DEFAULT_RETRY_MAX_MS));
    this.nextForceRescanAt = this.now() + this.forceRescanMs;
  }
  store;
  inFlight;
  stopping = false;
  faulted = false;
  abort = new AbortController();
  now;
  maxHistoryRequestsPerPass;
  maxPassMs;
  maxGatewayResponseBytes;
  forceRescanMs;
  retryInitialMs;
  retryMaxMs;
  roundAfterKey;
  forceEpoch = 0;
  forceRescanActive = false;
  nextForceRescanAt;
  forceScanned = /* @__PURE__ */ new Map();
  retry = /* @__PURE__ */ new Map();
  listFailures = 0;
  nextListAttemptAt = 0;
  get file() {
    return this.store.file;
  }
  status(nativeKey) {
    return this.store.get(nativeKey);
  }
  storageFault(error) {
    if (!this.faulted) {
      this.faulted = true;
      this.options.onFault?.(error);
    }
    throw error;
  }
  reset() {
    if (this.stopping) return;
    try {
      this.store.reset();
      this.retry.clear();
      this.nextListAttemptAt = 0;
      this.nextForceRescanAt = 0;
      this.forceRescanActive = false;
    } catch (e) {
      this.storageFault(e);
    }
  }
  rescan() {
    if (this.stopping) return;
    try {
      const retained = this.store.rescan();
      this.retry.clear();
      this.nextListAttemptAt = 0;
      this.nextForceRescanAt = 0;
      this.forceRescanActive = false;
      if (retained) this.log(`openclaw automatic rescan retained ${retained} blocked native cursor(s); history coverage remains incomplete`);
    } catch (e) {
      this.storageFault(e);
    }
  }
  ack(batchId, disposition) {
    if (this.stopping) return false;
    try {
      return this.store.ack(batchId, disposition);
    } catch (e) {
      return this.storageFault(e);
    }
  }
  async stop() {
    this.stopping = true;
    this.abort.abort();
    try {
      await this.inFlight;
    } catch {
    }
    this.store.close();
  }
  call(args, signal, timeout) {
    if (this.options.call) return this.options.call(args, signal);
    const cmd = { cmd: this.config.path ?? "openclaw", args, env: this.config.env }, env = buildEnv(cmd), r = resolveCommand(cmd.cmd, env);
    return new Promise((res, rej) => execFile2(r.file, [...r.prefixArgs, ...this.config.args ?? [], ...args], {
      // A full session list is the only documented source. Bound its transport
      // response instead of inventing an unverified pagination/incremental API.
      env,
      maxBuffer: this.maxGatewayResponseBytes,
      timeout: Math.max(1, Math.min(12e4, timeout)),
      windowsHide: true,
      signal
    }, (error, stdout) => {
      if (error) return rej(error);
      try {
        const text = stdout.toString();
        res(JSON.parse(text.slice(text.indexOf("{"))));
      } catch (e) {
        rej(e);
      }
    }));
  }
  pass() {
    if (this.stopping) return Promise.resolve();
    if (this.faulted) return Promise.reject(new OpenclawStorageError("OpenClaw mirror is faulted; restart after repairing storage"));
    if (this.inFlight) return this.inFlight;
    this.inFlight = this.runPass().finally(() => {
      this.inFlight = void 0;
    });
    return this.inFlight;
  }
  retryDelay(failures) {
    return Math.min(this.retryMaxMs, this.retryInitialMs * 2 ** Math.min(failures - 1, 30));
  }
  defer(key) {
    const previous = this.retry.get(key), failures = (previous?.failures ?? 0) + 1;
    this.retry.set(key, { failures, nextAttemptAt: this.now() + this.retryDelay(failures) });
  }
  deferList() {
    this.listFailures++;
    this.nextListAttemptAt = this.now() + this.retryDelay(this.listFailures);
  }
  beginForcedRescan(now) {
    if (this.forceRescanActive || now < this.nextForceRescanAt) return;
    this.forceEpoch++;
    this.forceRescanActive = true;
  }
  forceComplete(rows) {
    return rows.every((row) => this.forceScanned.get(row.key) === this.forceEpoch);
  }
  shouldFetch(row, eagerSmallList) {
    const cursor = this.store.get(row.key);
    if (!cursor || cursor.blocked !== null || row.updatedAt === void 0 || !Number.isFinite(row.updatedAt)) return true;
    if (this.forceRescanActive && this.forceScanned.get(row.key) !== this.forceEpoch) return true;
    if (eagerSmallList) return true;
    return cursor.updatedAt !== row.updatedAt;
  }
  historyArgs(row) {
    return ["gateway", "call", "chat.history", "--params", JSON.stringify({ sessionKey: row.key, limit: 1e3 }), "--json"];
  }
  async history(row, signal, deadline) {
    try {
      const result = await this.call(this.historyArgs(row), signal, deadline - this.now());
      if (Buffer.byteLength(JSON.stringify(result), "utf8") > this.maxGatewayResponseBytes) {
        throw new Error(`Gateway history response exceeds ${this.maxGatewayResponseBytes}-byte memory budget`);
      }
      return result;
    } catch (e) {
      throw e;
    }
  }
  async runPass() {
    const started = this.now(), deadline = started + this.maxPassMs, passAbort = new AbortController();
    const timeout = setTimeout(() => passAbort.abort(), this.maxPassMs);
    timeout.unref();
    const signal = AbortSignal.any([this.abort.signal, passAbort.signal]);
    try {
      const sent = /* @__PURE__ */ new Set();
      for (const pending of this.store.pending()) {
        if (this.stopping) return;
        this.send(pending.payload);
        sent.add(pending.nativeKey);
      }
      if (this.now() < this.nextListAttemptAt) return;
      let list;
      try {
        list = await this.call(["sessions", "--all-agents", "--json", "--limit", "all"], signal, deadline - this.now());
        if (!list || !Array.isArray(list.sessions)) throw new Error("Gateway session list has no sessions array");
        if (Buffer.byteLength(JSON.stringify(list), "utf8") > this.maxGatewayResponseBytes) throw new Error("Gateway session list exceeds memory budget");
        this.listFailures = 0;
        this.nextListAttemptAt = 0;
      } catch (e) {
        if (!this.stopping) this.deferList();
        throw e;
      }
      if (this.stopping) return;
      if (!list || !Array.isArray(list.sessions)) throw new Error("Gateway session list has no sessions array");
      const visited = /* @__PURE__ */ new Set(), rows = [];
      for (const row of list.sessions) {
        if (!row || typeof row.key !== "string" || !row.key) {
          this.log("openclaw sync blocked: invalid native key in session list");
          continue;
        }
        if (visited.has(row.key)) continue;
        visited.add(row.key);
        rows.push(row);
      }
      for (const key of this.forceScanned.keys()) if (!visited.has(key)) this.forceScanned.delete(key);
      for (const key of this.retry.keys()) if (!visited.has(key)) this.retry.delete(key);
      const now = this.now();
      this.beginForcedRescan(now);
      rows.sort((a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0);
      const after = this.roundAfterKey === void 0 ? 0 : rows.findIndex((row) => row.key > this.roundAfterKey);
      const start = Math.max(0, after);
      let historyRequests = 0;
      const eagerSmallList = rows.length <= this.maxHistoryRequestsPerPass;
      for (let offset = 0; offset < rows.length && historyRequests < this.maxHistoryRequestsPerPass; offset++) {
        if (this.stopping || signal.aborted || this.now() >= deadline) return;
        const row = rows[(start + offset) % rows.length];
        this.roundAfterKey = row.key;
        if (sent.has(row.key) || !this.shouldFetch(row, eagerSmallList)) continue;
        if (this.now() < (this.retry.get(row.key)?.nextAttemptAt ?? 0)) continue;
        historyRequests++;
        let synchronized = false;
        try {
          await this.syncOne(row, signal, deadline);
          synchronized = true;
        } catch (e) {
          if (e instanceof OpenclawStorageError || !this.store.healthy) this.storageFault(e);
          if (!this.stopping) this.defer(row.key);
          if (this.stopping || signal.aborted) return;
          const reason = e.message;
          this.store.markBlocked(row.key, reason);
          this.log(`openclaw sync ${row.key} blocked: ${reason}`);
        }
        if (synchronized && !signal.aborted) {
          this.retry.delete(row.key);
          if (this.forceRescanActive) this.forceScanned.set(row.key, this.forceEpoch);
        }
      }
      if (this.forceRescanActive && this.forceComplete(rows)) {
        this.forceRescanActive = false;
        this.nextForceRescanAt = this.now() + this.forceRescanMs;
      }
    } catch (e) {
      if (e instanceof OpenclawStorageError || !this.store.healthy) this.storageFault(e);
      if (!this.stopping && !signal.aborted) this.log(`openclaw sync fetch failed: ${e.message}`);
    } finally {
      clearTimeout(timeout);
    }
  }
  async syncOne(row, signal, deadline) {
    const h = await this.history(row, signal, deadline);
    if (this.stopping) return;
    if (!h || !Array.isArray(h.messages)) throw new Error("Gateway history has no messages array");
    if (h.sessionKey !== void 0 && h.sessionKey !== row.key) throw new Error(`history native identity drift: requested ${row.key}, received ${h.sessionKey}`);
    const cursor = this.store.ensure(row.key);
    const gap = cursor.legacySeq !== null ? `Legacy send cursor ${cursor.legacySeq} is not an ACK; replaying visible history only. Earlier/window-excluded history coverage is unverified.` : h.messages.length >= 1e3 || h.messages[0] && h.messages[0].role !== "user" ? "Returned history is a bounded/compacted window; leading or older exchanges may be outside this mirror coverage." : void 0;
    if (gap && cursor.coverageGap !== gap) {
      this.store.markGap(row.key, gap);
      this.log(`openclaw sync ${row.key} coverage gap: ${gap}`);
    }
    const all = exchangesFromHistory(h.messages), seen = this.store.seen(row.key, cursor.generation);
    const fresh = all.filter((x) => !seen.has(x.clientId));
    const blocked = parseMirrorBlock(cursor.blocked);
    if (blocked?.kind === "legacy" || blocked?.kind === "exchange" && blocked.sourceIdentity !== "stable") return;
    const repair = blocked?.kind === "exchange" ? fresh.find((x) => x.clientId === blocked.clientId && x.sourceId === blocked.sourceId && x.sourceIdentity === "stable") : void 0;
    if (blocked?.kind === "exchange" && !repair) return;
    const candidates = repair ? [repair] : fresh;
    const agent = h.sessionInfo?.agentId ?? row.agentId ?? row.key.split(":")[1] ?? "main";
    const channel = h.sessionInfo?.channel ?? row.channel, peer = (h.sessionInfo?.displayName ?? row.displayName)?.replace(/\s+id:\S+$/, "");
    const base2 = ExternalSessionSchema.parse({
      nativeSessionId: row.key,
      title: titleFor(row.key, agent, h.sessionInfo, row),
      workdir: `openclaw:${agent}`,
      options: { agent, ...channel ? { channel } : {}, ...peer && channel ? { peer } : {} },
      updatedAt: row.updatedAt ?? 0,
      exchanges: []
    });
    const batch = { t: "external.sync", adapter: "openclaw", batchId: randomUUID4(), sessions: [base2] };
    const envelopeBytes = Buffer.byteLength(JSON.stringify(batch), "utf8");
    let bytes = envelopeBytes, lastSeq = cursor.seq;
    const clientIds = [];
    let newBlock;
    let batchFull = false;
    for (const item of candidates) {
      const { seq, ...exchange } = item;
      const parsed = ExternalExchangeSchema.safeParse(exchange);
      const itemBytes = parsed.success ? Buffer.byteLength(JSON.stringify(parsed.data), "utf8") : 0;
      const reason = !Number.isSafeInteger(seq) || seq < 0 ? `exchange ${item.clientId} has an invalid source sequence` : !parsed.success ? `exchange ${item.clientId} violates schema: ${parsed.error.message}` : envelopeBytes + itemBytes > MAX_EXTERNAL_BATCH_BYTES ? `single exchange ${item.clientId} exceeds complete ${MAX_EXTERNAL_BATCH_BYTES}-byte UTF-8 batch limit; cursor not advanced` : void 0;
      if (reason) {
        newBlock = {
          version: 1,
          kind: "exchange",
          clientId: item.clientId,
          sourceIdentity: item.sourceIdentity ?? "unverified",
          ...item.sourceId ? { sourceId: item.sourceId } : {},
          reason
        };
        this.log(`openclaw sync ${row.key} blocked: ${reason}`);
        break;
      }
      if (!parsed.success) throw new Error("unreachable invalid exchange");
      const size = itemBytes + (base2.exchanges.length ? 1 : 0);
      if (batchFull || bytes + size > MAX_EXTERNAL_BATCH_BYTES || base2.exchanges.length >= 1e3) {
        batchFull = true;
        continue;
      }
      base2.exchanges.push(parsed.data);
      clientIds.push(parsed.data.clientId);
      lastSeq = Math.max(lastSeq, seq);
      bytes += size;
    }
    if (newBlock && !base2.exchanges.length) {
      this.store.markSourceBlocked(row.key, newBlock);
      return;
    }
    if (!base2.exchanges.length && (cursor.updatedAt === base2.updatedAt || fresh.length)) {
      if (blocked?.kind === "observation") this.store.clearObservationBlock(row.key);
      return;
    }
    const complete = base2.exchanges.length === fresh.length;
    const pending = this.store.stage(batch, {
      generation: cursor.generation,
      seq: lastSeq,
      updatedAt: complete ? base2.updatedAt : -1,
      clientIds,
      ...repair ? { resolvesBlock: cursor.blocked } : {}
    }, newBlock);
    this.send(pending.payload);
  }
};

// packages/runner/src/artifacts.ts
import { createHash as createHash9 } from "node:crypto";
import { constants as constants4 } from "node:fs";
import { lstat as lstat4, open as open4, opendir, realpath as realpath4 } from "node:fs/promises";
import { isAbsolute as isAbsolute9, join as join11, parse, relative as relative4, sep as sep4 } from "node:path";
var MAX_DEPTH = 16;
var MAX_ENTRIES = 1e4;
var MAX_JOBS = 100;
var MAX_RESPONSE_BYTES = 1024 * 1024;
var EXCLUDED = /* @__PURE__ */ new Set(["inputs", "node_modules"]);
var ArtifactPublicationError = class extends Error {
  constructor(failure2) {
    super(failure2.message);
    this.failure = failure2;
  }
};
function failure(code, message, details = {}) {
  return new ArtifactPublicationError({ code, message, retryable: false, ...details });
}
function filesystemCode(error) {
  if (!error || typeof error !== "object" || !("code" in error) || typeof error.code !== "string") return;
  if (["ENOENT", "ENOTDIR", "EACCES", "EPERM", "EIO", "EBUSY", "ESTALE", "EMFILE", "ENFILE", "ELOOP", "EINVAL", "ENAMETOOLONG"].includes(error.code)) {
    return error.code;
  }
}
function samePath(a, b) {
  return process.platform === "win32" ? a.toLowerCase() === b.toLowerCase() : a === b;
}
function contains(root, path) {
  const rel = relative4(root, path);
  return !rel || rel !== ".." && !rel.startsWith(`..${sep4}`) && !isAbsolute9(rel);
}
function sameIdentity(a, b) {
  return a.dev === b.dev && a.ino === b.ino && a.birthtimeNs === b.birthtimeNs;
}
function sameFile(a, b) {
  return sameIdentity(a, b) && a.size === b.size && a.mtimeNs === b.mtimeNs && a.ctimeNs === b.ctimeNs;
}
function regular(stat2, label) {
  if (stat2.isSymbolicLink()) throw failure("unsafe-path", `symlink/junction rejected: ${label}`);
  if (!stat2.isFile()) throw failure("unsafe-path", `not a regular file: ${label}`);
  if (stat2.nlink !== 1n) throw failure("unsafe-path", `hardlink rejected: ${label}`);
}
var ArtifactPublisher = class {
  constructor(config, options = {}) {
    this.config = config;
    this.options = options;
  }
  abort = new AbortController();
  inFlight;
  timer;
  stopped = false;
  finished = /* @__PURE__ */ new Set();
  start() {
    if (this.stopped) return;
    if (!this.timer) {
      this.timer = setInterval(() => {
        void this.pass();
      }, this.options.pollIntervalMs ?? 15e3);
      this.timer.unref();
    }
    void this.pass();
  }
  pass() {
    if (this.stopped || this.options.connected?.() === false) return Promise.resolve();
    if (this.inFlight) return this.inFlight;
    this.inFlight = this.collect().catch((error) => {
      if (!this.stopped) this.log(`poll failed; jobs remain pending: ${this.message(error)}`);
    }).finally(() => {
      this.inFlight = void 0;
    });
    return this.inFlight;
  }
  async stop() {
    this.stopped = true;
    clearInterval(this.timer);
    this.timer = void 0;
    this.abort.abort();
    await this.inFlight;
  }
  clean(text, limit) {
    return (this.config.token ? text.replaceAll(this.config.token, "[redacted]") : text).replace(/[\x00-\x1f\x7f-\x9f]/g, " ").replace(/\bbearer\s+[^\s"'<>;,]+/gi, "Bearer [redacted]").slice(0, limit);
  }
  safeFailure(value) {
    const { relativePath: relativePath2, ...details } = value;
    const path = relativePath2 === void 0 ? void 0 : this.clean(relativePath2, 400);
    return {
      ...details,
      message: this.clean(value.message, 1e3) || "artifact collection failed",
      ...path && ArtifactRelativePathSchema.safeParse(path).success && !/[<>]/.test(path) ? { relativePath: path } : {}
    };
  }
  errorFailure(error) {
    if (error instanceof ArtifactPublicationError) return this.safeFailure(error.failure);
    const code = filesystemCode(error);
    if (code) return {
      code: code === "ELOOP" || code === "ENAMETOOLONG" || code === "EINVAL" ? "unsafe-path" : "source-unavailable",
      message: `local filesystem error (${code})`,
      retryable: false
    };
    return { code: "internal-error", message: "unexpected artifact collection error", retryable: false };
  }
  message(error) {
    return this.errorFailure(error).message;
  }
  log(message) {
    try {
      this.options.log?.(`[artifacts] ${this.clean(message, 1500)}`);
    } catch {
    }
  }
  warn(warnings, message) {
    const clean = this.clean(message, 500);
    if (warnings.includes(clean)) return;
    if (warnings.length < 100) warnings.push(clean);
    else if (clean === "no output directory/files") warnings[99] = clean;
    else return;
    this.log(clean);
  }
  checkAbort() {
    this.abort.signal.throwIfAborted();
  }
  url(path) {
    const url = new URL(this.config.hub);
    if (url.protocol === "ws:") url.protocol = "http:";
    if (url.protocol === "wss:") url.protocol = "https:";
    if (url.protocol !== "http:" && url.protocol !== "https:") throw failure("invalid-request", "unsupported Hub URL protocol");
    url.username = "";
    url.password = "";
    url.hash = "";
    url.search = "";
    url.pathname = `${url.pathname.replace(/\/+$/, "")}/api/runner/${path.split("?")[0]}`;
    const query = path.indexOf("?");
    if (query !== -1) url.search = path.slice(query);
    return url;
  }
  async responseJson(response) {
    const reader = response.body?.getReader();
    if (!reader) throw failure("invalid-request", "empty Hub artifact response");
    const buffers = [];
    let size = 0;
    try {
      for (; ; ) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > MAX_RESPONSE_BYTES) throw failure("invalid-request", "Hub artifact response exceeds limit");
        buffers.push(value);
      }
    } finally {
      await reader.cancel().catch(() => {
      });
      reader.releaseLock();
    }
    try {
      return JSON.parse(Buffer.concat(buffers).toString("utf8"));
    } catch {
      throw failure("invalid-request", "invalid Hub artifact JSON response");
    }
  }
  httpFailure(status, value) {
    const message = `Hub artifact HTTP ${status}`;
    const parsed = ArtifactErrorResponseSchema.safeParse(value);
    if (!parsed.success) return failure(
      status >= 500 ? "internal-error" : status === 409 ? "offset-mismatch" : status === 401 || status === 403 ? "unauthorized" : "invalid-request",
      message,
      { retryable: status >= 500 || status === 409 }
    );
    const detail = this.safeFailure(parsed.data.failure);
    if (/[<>]|[a-z]:[\\/]|\\\\|(?:^|[^a-z0-9])\//i.test(detail.message)) detail.message = message;
    detail.retryable = detail.code === "collection-finished" ? false : status >= 500 || status === 409 && detail.code === "offset-mismatch" || detail.retryable;
    return new ArtifactPublicationError(detail);
  }
  async request(path, method = "GET", body) {
    this.checkAbort();
    const timeout = new AbortController();
    const timer = setTimeout(() => timeout.abort(), this.options.requestTimeoutMs ?? 3e4);
    timer.unref();
    try {
      const headers = { authorization: `Bearer ${this.config.token}` };
      if (body !== void 0) headers["content-type"] = typeof body === "string" ? "application/json" : "application/octet-stream";
      const response = await fetch(this.url(path), {
        method,
        headers,
        body: Buffer.isBuffer(body) ? new Uint8Array(body) : body,
        redirect: "manual",
        signal: AbortSignal.any([this.abort.signal, timeout.signal])
      });
      if (!response.ok) {
        let value;
        try {
          value = await this.responseJson(response);
        } catch (error) {
          if (!(error instanceof ArtifactPublicationError)) throw error;
        }
        throw this.httpFailure(response.status, value);
      }
      return await this.responseJson(response);
    } catch (error) {
      this.checkAbort();
      if (timeout.signal.aborted || error instanceof TypeError) {
        throw failure("network-unavailable", "artifact HTTP network failure/timeout", { retryable: true });
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }
  async collect() {
    const response = await this.request("artifact-collections");
    if (!response || typeof response !== "object" || !("jobs" in response) || !Array.isArray(response.jobs) || response.jobs.length > MAX_JOBS) {
      throw failure("invalid-request", "invalid Hub artifact job list");
    }
    for (const value of response.jobs) {
      this.checkAbort();
      if (this.options.connected?.() === false) return;
      const parsed = RunnerArtifactJobSchema.safeParse(value);
      if (!parsed.success) {
        this.log("invalid Hub artifact job; not collected");
        continue;
      }
      const job = parsed.data;
      if (job.status !== "queued" && job.status !== "collecting" || this.finished.has(job.id)) continue;
      await this.collectJob(job);
    }
  }
  async startCollection(job) {
    if (job.status !== "queued") return;
    const response = await this.request(`artifact-collections/${encodeURIComponent(job.id)}/start`, "POST");
    const parsed = ArtifactCollectionSchema.safeParse(response);
    if (!parsed.success || parsed.data.id !== job.id || parsed.data.sessionId !== job.sessionId || parsed.data.turnId !== job.turnId) {
      throw failure("invalid-request", "invalid Hub artifact collection start response");
    }
    if (parsed.data.status === "complete" || parsed.data.status === "failed") {
      throw failure("collection-finished", "Hub artifact collection already finished");
    }
    if (parsed.data.status !== "collecting") throw failure("invalid-request", "Hub did not confirm artifact collection start");
  }
  rememberFinished(id8) {
    if (this.finished.size >= MAX_JOBS) this.finished.delete(this.finished.values().next().value);
    this.finished.add(id8);
  }
  async complete(job, warnings, error) {
    const detail = error && this.safeFailure(error);
    const body = ArtifactCompleteBodySchema.parse({ warnings, ...detail ? { error: detail.message, failure: detail } : {} });
    const response = await this.request(`artifact-collections/${encodeURIComponent(job.id)}/complete`, "POST", JSON.stringify(body));
    const parsed = ArtifactCollectionSchema.safeParse(response);
    if (!parsed.success || parsed.data.id !== job.id || parsed.data.status !== (error ? "failed" : "complete")) {
      throw failure("invalid-request", "Hub did not confirm artifact collection completion");
    }
  }
  async collectJob(job) {
    const warnings = [];
    try {
      await this.startCollection(job);
      const scope = await this.scope(job);
      if (!scope) this.warn(warnings, "no output directory/files");
      else {
        const files = await this.discover(scope, job, warnings);
        if (!files.length) this.warn(warnings, "no output directory/files");
        for (const file of files) {
          this.checkAbort();
          await this.publish(scope, job, file, warnings);
        }
        await this.checkScope(scope);
      }
      this.checkAbort();
      await this.complete(job, warnings);
      this.log(`collection ${job.id} complete`);
    } catch (error) {
      this.checkAbort();
      const detail = this.errorFailure(error);
      if (detail.retryable) {
        this.log(`collection ${job.id} pending; will re-initialize uploads: ${detail.code}: ${detail.message}`);
        return;
      }
      if (detail.code === "collection-finished") this.rememberFinished(job.id);
      this.log(`collection ${job.id} failed: ${detail.code}: ${detail.message}`);
      try {
        await this.complete(job, warnings, detail);
      } catch (completionError) {
        this.checkAbort();
        if (this.errorFailure(completionError).code === "collection-finished") this.rememberFinished(job.id);
        const state = this.finished.has(job.id) ? "already finished; will not retry" : "remains pending";
        this.log(`collection ${job.id} failure could not be recorded; ${state}: ${this.message(completionError)}`);
      }
    }
  }
  async scope(job) {
    const configured = await this.options.resolveScope?.(job) ?? { workdir: job.workdir, workspaceRoots: this.config.workspaceRoots };
    const root = parse(configured.workdir).root;
    if (!isAbsolute9(configured.workdir) || /(?:^|[\\/])\.\.(?:[\\/]|$)/.test(configured.workdir) || configured.workdir.slice(root.length).includes(":")) {
      throw failure("unsafe-path", "invalid artifact workdir path");
    }
    const workdir = await realpath4(configured.workdir);
    const roots = await Promise.all(configured.workspaceRoots.map(async (path) => {
      try {
        return await realpath4(path);
      } catch (error) {
        if (["ENOENT", "ENOTDIR"].includes(filesystemCode(error) ?? "")) return void 0;
        throw error;
      }
    }));
    if (configured.workspaceRoots.length && !roots.some((path) => path !== void 0 && contains(path, workdir))) {
      throw failure("unsafe-path", "artifact workdir outside workspaceRoots");
    }
    const workdirStat = await lstat4(workdir, { bigint: true });
    if (!workdirStat.isDirectory() || workdirStat.isSymbolicLink()) throw failure("unsafe-path", "invalid artifact workdir");
    const output = join11(workdir, "output");
    let outputStat;
    try {
      outputStat = await lstat4(output, { bigint: true });
    } catch (error) {
      if (filesystemCode(error) === "ENOENT") {
        await this.checkDirectory(workdir, workdirStat);
        return;
      }
      throw error;
    }
    if (outputStat.isSymbolicLink()) throw failure("unsafe-path", "symlink/junction rejected: output");
    if (!outputStat.isDirectory()) throw failure("unsafe-path", "output is not a directory");
    const scope = { workdir, output, workdirStat, outputStat };
    await this.checkScope(scope);
    return scope;
  }
  async checkDirectory(path, expected) {
    const stat2 = await lstat4(path, { bigint: true });
    if (stat2.isSymbolicLink()) throw failure("unsafe-path", "symlink/junction rejected in output path");
    if (!stat2.isDirectory() || expected && !sameIdentity(stat2, expected) || !samePath(await realpath4(path), path)) {
      throw failure("source-changed", "output directory identity/path changed");
    }
  }
  async checkScope(scope) {
    this.checkAbort();
    await this.checkDirectory(scope.workdir, scope.workdirStat);
    await this.checkDirectory(scope.output, scope.outputStat);
  }
  async discover(scope, job, warnings) {
    const files = [];
    let entries = 0;
    const walk = async (directory, depth) => {
      this.checkAbort();
      await this.checkScope(scope);
      await this.checkDirectory(directory);
      const handle = await opendir(directory, { bufferSize: 32 });
      for await (const entry of handle) {
        this.checkAbort();
        if (++entries > MAX_ENTRIES) throw failure("too-many-files", `output enumeration exceeds ${MAX_ENTRIES} entries`);
        const path = join11(directory, entry.name);
        const label = relative4(scope.workdir, path).split(sep4).join("/");
        const stat2 = await lstat4(path, { bigint: true });
        if (stat2.isSymbolicLink()) throw failure("unsafe-path", `symlink/junction rejected: ${label}`);
        if (stat2.isFile() && stat2.nlink !== 1n) throw failure("unsafe-path", `hardlink rejected: ${label}`);
        if (entry.name.startsWith(".") || EXCLUDED.has(entry.name.toLowerCase())) continue;
        if (!contains(scope.output, path)) throw failure("unsafe-path", "file outside exact output root");
        if (stat2.isDirectory()) {
          if (depth >= MAX_DEPTH) throw failure("too-many-files", `output nesting exceeds ${MAX_DEPTH} directories`);
          await walk(path, depth + 1);
          continue;
        }
        if (!artifactContentType(label) || !(job.extensions ?? LEGACY_ARTIFACT_EXTENSIONS).includes(label.slice(label.lastIndexOf(".")).toLowerCase())) {
          this.warn(warnings, `unsupported artifact skipped: ${label}`);
          continue;
        }
        if (!ArtifactRelativePathSchema.safeParse(label).success) throw failure("unsafe-path", `invalid artifact relative path: ${label}`);
        regular(stat2, label);
        if (stat2.size === 0n) throw failure("invalid-request", `empty artifact file: ${label}`, { relativePath: label, sizeBytes: 0 });
        if (stat2.size > BigInt(job.maxFileBytes)) throw failure("file-too-large", `artifact exceeds ${job.maxFileBytes} byte limit: ${label}`, {
          relativePath: label,
          limitBytes: job.maxFileBytes,
          ...stat2.size <= BigInt(Number.MAX_SAFE_INTEGER) ? { sizeBytes: Number(stat2.size) } : {}
        });
        if (files.length >= job.maxFiles) throw failure("too-many-files", `output exceeds ${job.maxFiles} eligible files`);
        files.push({ path, relativePath: label, stat: stat2 });
      }
      await this.checkDirectory(directory);
    };
    await walk(scope.output, 0);
    return files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  }
  async checkFile(scope, file, handle) {
    this.checkAbort();
    await this.checkScope(scope);
    const components = file.relativePath.split("/").slice(1, -1);
    let directory = scope.output;
    for (const component of components) {
      directory = join11(directory, component);
      await this.checkDirectory(directory);
    }
    const [held, current] = await Promise.all([handle.stat({ bigint: true }), lstat4(file.path, { bigint: true })]);
    regular(held, file.relativePath);
    regular(current, file.relativePath);
    if (!sameFile(file.stat, held) || !sameFile(held, current) || !samePath(await realpath4(file.path), file.path)) {
      throw failure("source-changed", `artifact file changed during collection: ${file.relativePath}`, { relativePath: file.relativePath });
    }
  }
  async read(handle, buffer, offset, length) {
    let read = 0;
    while (read < length) {
      this.checkAbort();
      const { bytesRead } = await handle.read(buffer, read, length - read, offset + read);
      if (!bytesRead) throw failure("source-changed", "artifact file truncated during collection");
      read += bytesRead;
    }
  }
  uploadResponse(value, job, body) {
    const parsed = ArtifactUploadSchema.safeParse(value);
    if (!parsed.success) throw failure("invalid-request", "invalid Hub artifact upload response");
    const upload = parsed.data, artifact = upload.artifact;
    if (artifact.sessionId !== job.sessionId || artifact.relativePath !== body.relativePath || artifact.sizeBytes !== body.sizeBytes || artifact.sha256 !== body.sha256 || upload.offset > body.sizeBytes || (upload.skip ? !["ready", "expired"].includes(artifact.status) : artifact.status !== (upload.offset === body.sizeBytes ? "ready" : "uploading"))) {
      throw failure("invalid-request", "inconsistent Hub artifact upload response");
    }
    return upload;
  }
  async publish(scope, job, file, warnings) {
    await this.checkScope(scope);
    const handle = await open4(file.path, constants4.O_RDONLY | (constants4.O_NOFOLLOW ?? 0) | (constants4.O_NONBLOCK ?? 0));
    try {
      await this.checkFile(scope, file, handle);
      const size = Number(file.stat.size), buffer = Buffer.alloc(Math.min(ARTIFACT_CHUNK_BYTES, size));
      const hash3 = createHash9("sha256");
      for (let offset = 0; offset < size; ) {
        const length = Math.min(buffer.length, size - offset);
        await this.read(handle, buffer, offset, length);
        hash3.update(buffer.subarray(0, length));
        offset += length;
      }
      await this.checkFile(scope, file, handle);
      const body = { relativePath: file.relativePath, sizeBytes: size, sha256: hash3.digest("hex") };
      let upload = this.uploadResponse(await this.request(
        `artifact-collections/${encodeURIComponent(job.id)}/files`,
        "POST",
        JSON.stringify(body)
      ), job, body);
      if (upload.skip && upload.artifact.status === "expired") {
        this.warn(warnings, `unchanged expired artifact skipped; not automatically restored: ${file.relativePath}`);
      }
      while (!upload.skip && upload.offset < size) {
        await this.checkFile(scope, file, handle);
        const offset = upload.offset, length = Math.min(job.chunkBytes, size - offset);
        await this.read(handle, buffer, offset, length);
        const next = this.uploadResponse(await this.request(
          `artifacts/${encodeURIComponent(upload.artifact.id)}/content?offset=${offset}`,
          "PUT",
          buffer.subarray(0, length)
        ), job, body);
        if (next.artifact.id !== upload.artifact.id || next.offset !== offset + length || next.skip) {
          throw failure("invalid-request", "Hub returned an unexpected committed artifact offset");
        }
        upload = next;
      }
      await this.checkFile(scope, file, handle);
    } finally {
      await handle.close();
    }
  }
};

// packages/runner/src/connection-liveness.ts
var ConnectionLiveness = class {
  constructor(timing = {}) {
    this.timing = timing;
    this.heartbeatTimeoutMs = timing.heartbeatTimeoutMs ?? RUNNER_HEARTBEAT_TIMEOUT_MS;
    this.welcomeTimeoutMs = timing.welcomeTimeoutMs ?? RUNNER_WELCOME_TIMEOUT_MS;
    this.intervalMs = timing.watchdogIntervalMs ?? RUNNER_WATCHDOG_INTERVAL_MS;
    for (const milliseconds of [this.heartbeatTimeoutMs, this.welcomeTimeoutMs, this.intervalMs]) {
      if (!Number.isFinite(milliseconds) || milliseconds <= 0) throw new Error("Connection deadlines must be positive finite milliseconds");
    }
    this.opened = this.stamp();
    this.received = this.opened;
  }
  heartbeatTimeoutMs;
  welcomeTimeoutMs;
  intervalMs;
  opened;
  received;
  stamp() {
    return { wall: this.timing.wallNow?.() ?? Date.now(), monotonic: this.timing.monotonicNow?.() ?? performance.now() };
  }
  expired(welcomed) {
    const current = this.stamp(), previous = welcomed ? this.received : this.opened;
    const elapsed = Math.max(0, current.wall - previous.wall, current.monotonic - previous.monotonic);
    return elapsed >= (welcomed ? this.heartbeatTimeoutMs : this.welcomeTimeoutMs) ? welcomed ? "heartbeat timeout" : "welcome timeout" : null;
  }
  receivedMessage() {
    this.received = this.stamp();
  }
};

// packages/runner/src/runner.ts
import { homedir as homedir2 } from "node:os";

// packages/runner/src/native-storage.ts
import { DatabaseSync as DatabaseSync3 } from "node:sqlite";
import { mkdirSync as mkdirSync5, lstatSync as lstatSync2, readdirSync as readdirSync5, statfsSync, existsSync as existsSync8, writeFileSync as writeFileSync2 } from "node:fs";
import { join as join12, resolve as resolve8 } from "node:path";
var DEFAULT_NATIVE_STORAGE = { maxManagedBytes: 20 * 1024 ** 3, maxTaskBytes: 4 * 1024 ** 3, minFreeBytes: 1024 ** 3, retentionDays: 7 };
function managedBytes(root) {
  let count2 = 0, total = 0;
  const pending = [root];
  while (pending.length) {
    const dir = pending.pop();
    for (const name of readdirSync5(dir)) {
      if (++count2 > 1e5) throw Error("native storage inventory exceeds scan limit");
      const path = join12(dir, name), stat2 = lstatSync2(path);
      if (stat2.isDirectory() && !stat2.isSymbolicLink()) pending.push(path);
      else total += stat2.size;
    }
  }
  return total;
}
var NativeStorage = class {
  constructor(spoolDir, policy = {}, free = (path) => {
    const s = statfsSync(path);
    return s.bavail * s.bsize;
  }, now = Date.now) {
    this.free = free;
    this.now = now;
    mkdirSync5(spoolDir, { recursive: true });
    this.policy = { ...DEFAULT_NATIVE_STORAGE, ...policy };
    const file = join12(spoolDir, "native-storage.sqlite"), marker = join12(spoolDir, "native-storage.initialized");
    if (existsSync8(marker) && !existsSync8(file)) {
      this.problem = "managed storage ledger is missing";
      return;
    }
    try {
      this.database = new DatabaseSync3(file);
      const version = Number(this.db.prepare("PRAGMA user_version").get().user_version);
      if (version > 1 || this.db.prepare("PRAGMA quick_check").get().quick_check !== "ok") throw Error("unsupported or corrupt managed storage ledger");
      if (version === 0 && this.db.prepare("SELECT name FROM sqlite_master WHERE type='table'").get()) throw Error("unknown unversioned managed storage ledger");
      this.db.exec(`PRAGMA busy_timeout=5000;PRAGMA synchronous=FULL;
   CREATE TABLE IF NOT EXISTS directories(task_id TEXT PRIMARY KEY,turn_id TEXT NOT NULL,run_id TEXT NOT NULL,path TEXT UNIQUE NOT NULL,
    policy_json TEXT NOT NULL,reserved_bytes INTEGER NOT NULL,observed_bytes INTEGER,state TEXT NOT NULL CHECK(state IN('active','retained','unknown','over-budget')),
    retained_until INTEGER,updated_at INTEGER NOT NULL,revision INTEGER NOT NULL);PRAGMA user_version=1;`);
      if (!existsSync8(marker)) writeFileSync2(marker, "managed-storage-v1\n", { flag: "wx", mode: 384 });
    } catch {
      this.database?.close();
      this.database = void 0;
      this.problem = "managed storage ledger requires recovery";
    }
  }
  database;
  policy;
  problem;
  get healthy() {
    return !!this.database;
  }
  get db() {
    if (!this.database) throw Error("native storage ledger is unavailable; restore it before admitting tasks");
    return this.database;
  }
  reserve(taskId, turnId, runId, path, policy) {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const canonical = resolve8(path), old = this.db.prepare("SELECT * FROM directories WHERE task_id=?").get(taskId);
      if (old && old.path !== canonical) throw Error("native storage task directory changed");
      if (old && old.state !== "retained") {
        if (old.run_id === runId && old.policy_json === JSON.stringify(policy)) {
          this.db.exec("COMMIT");
          return;
        }
        throw Error("native storage previous execution is not safely closed");
      }
      const used = Number(this.db.prepare("SELECT COALESCE(SUM(reserved_bytes),0) n FROM directories WHERE task_id<>?").get(taskId).n);
      if (policy.maxTaskBytes > this.policy.maxTaskBytes || used + policy.maxTaskBytes > this.policy.maxManagedBytes) throw Error("native storage admission budget exhausted");
      const observed = managedBytes(canonical);
      if (observed > policy.maxTaskBytes) throw Error("native storage task already exceeds budget");
      const outstanding = Number(this.db.prepare("SELECT COALESCE(SUM(MAX(0,reserved_bytes-COALESCE(observed_bytes,0))),0) n FROM directories WHERE task_id<>?").get(taskId).n);
      if (this.free(canonical) < Math.max(0, policy.maxTaskBytes - observed) + outstanding + this.policy.minFreeBytes) throw Error("native storage minimum free space would be exceeded");
      this.db.prepare(`INSERT INTO directories VALUES(?,?,?,?,?,?,?,?,?,?,1) ON CONFLICT(task_id) DO UPDATE SET
    turn_id=excluded.turn_id,run_id=excluded.run_id,policy_json=excluded.policy_json,reserved_bytes=excluded.reserved_bytes,
    observed_bytes=excluded.observed_bytes,state='active',retained_until=NULL,updated_at=excluded.updated_at,revision=directories.revision+1`).run(taskId, turnId, runId, canonical, JSON.stringify(policy), policy.maxTaskBytes, observed, "active", null, this.now());
      this.db.exec("COMMIT");
    } catch (e) {
      this.db.exec("ROLLBACK");
      throw e;
    }
  }
  reconcile(closed) {
    if (!this.healthy) return;
    for (const row of this.db.prepare("SELECT * FROM directories WHERE state<>'retained'").all()) {
      if (!closed(row.turn_id, row.run_id)) continue;
      try {
        const bytes = managedBytes(row.path), ceiling = JSON.parse(row.policy_json).maxTaskBytes;
        if (row.state === "over-budget" && bytes > ceiling && row.observed_bytes === bytes) continue;
        this.db.prepare("UPDATE directories SET state='retained',observed_bytes=?,reserved_bytes=?,retained_until=?,updated_at=?,revision=revision+1 WHERE task_id=? AND run_id=?").run(bytes, bytes, this.now() + this.policy.retentionDays * 864e5, this.now(), row.task_id, row.run_id);
        if (bytes > ceiling) this.db.prepare("UPDATE directories SET state='over-budget' WHERE task_id=?").run(row.task_id);
      } catch {
        if (row.state !== "unknown") this.db.prepare("UPDATE directories SET state='unknown',updated_at=?,revision=revision+1 WHERE task_id=?").run(this.now(), row.task_id);
      }
    }
  }
  snapshot() {
    const row = this.db.prepare(`SELECT COUNT(*) tasks,COALESCE(SUM(reserved_bytes),0) reservedBytes,
  COALESCE(SUM(state<>'retained'),0) uncertainTasks,COALESCE(SUM(retained_until IS NOT NULL AND retained_until<=?),0) cleanupDue FROM directories`).get(this.now());
    return { tasks: Number(row.tasks), reservedBytes: Number(row.reservedBytes), uncertainTasks: Number(row.uncertainTasks), cleanupDue: Number(row.cleanupDue), policy: this.policy };
  }
  reports() {
    if (!this.healthy) return [];
    return this.db.prepare("SELECT * FROM directories").all().map((r) => ({
      taskId: r.task_id,
      turnId: r.turn_id,
      runId: r.run_id,
      revision: r.revision,
      state: r.state,
      reservedBytes: r.reserved_bytes,
      observedBytes: r.observed_bytes,
      retainedUntil: r.retained_until
    }));
  }
  close() {
    this.database?.close();
  }
};

// packages/runner/src/catalog-publisher.ts
import { randomUUID as randomUUID5 } from "node:crypto";

// packages/runner/src/catalog-scan.ts
import { createHash as createHash10 } from "node:crypto";
import { lstat as lstat5, opendir as opendir2, realpath as realpath5, statfs } from "node:fs/promises";
import { isAbsolute as isAbsolute10, join as join13, relative as relative5, sep as sep5 } from "node:path";
var digest3 = (v) => createHash10("sha256").update(v).digest("hex");
var catalogEntryId = (kind, key) => `${kind}:${digest3(key)}`;
var inside2 = (base2, file) => {
  const p = relative5(base2, file);
  return p === "" || p !== ".." && !p.startsWith(".." + sep5) && !isAbsolute10(p);
};
async function scanCatalog(config, info, adapters, signal, tools = []) {
  const entries = [], roots = [], deadline = Date.now() + config.scanTimeoutMs;
  const add = (entry) => entries.push(CatalogEntrySchema.parse(entry));
  const inventory = info.resources;
  if (inventory) {
    add({ id: "hardware:cpu", kind: "hardware", label: "CPU", resourceType: "cpu", capacity: inventory.cpuSlots, unit: "slots", evidence: "probed", observedAt: inventory.observedAt });
    add({ id: "hardware:memory", kind: "hardware", label: "Memory", resourceType: "memory", capacity: inventory.memoryMiB, unit: "MiB", evidence: "probed", observedAt: inventory.observedAt });
    for (const gpu of inventory.gpus) add({ id: catalogEntryId("hardware", gpu.id), kind: "hardware", label: gpu.name, resourceType: "gpu", capacity: gpu.memoryMiB, hardwareId: gpu.id, unit: "MiB", vendor: gpu.vendor, evidence: "probed", observedAt: inventory.observedAt });
  }
  add({ id: "capability:catalog", kind: "capability", label: "\u6388\u6743\u6587\u4EF6\u5143\u6570\u636E\u767B\u8BB0", name: "catalog.metadata", protocol: "catalog-metadata-v1", readiness: "available", evidence: "probed" });
  for (const tool of tools) add({ id: readonlyCapabilityId(tool), kind: "capability", label: tool, name: tool, protocol: "runner-readonly-v1", version: "1", readiness: "available", evidence: "probed" });
  for (const adapter of adapters) {
    if (adapter.name === "claude") continue;
    add({ id: catalogEntryId("capability", adapter.name), kind: "capability", label: adapter.name, name: adapter.name, protocol: "legacy-session-v2", ...adapter.version ? { version: adapter.version.slice(0, 100) } : {}, readiness: !adapter.available ? "unavailable" : adapter.authentication === "verified" ? "available" : "unknown", evidence: "probed" });
  }
  for (const [rootIndex, root] of config.roots.entries()) {
    signal?.throwIfAborted();
    const entryId = catalogEntryId("root", root.id);
    let generation3 = null;
    let storageId;
    let canonical = "";
    try {
      const st = await lstat5(root.path);
      if (st.isSymbolicLink() || !st.isDirectory()) throw Error("invalid root");
      canonical = await realpath5(root.path);
      generation3 = inputRootGeneration(canonical);
      try {
        const fs = await statfs(canonical);
        storageId = catalogEntryId("hardware", "volume:" + st.dev);
        if (!entries.some((e) => e.id === storageId)) add({ id: storageId, kind: "hardware", label: "Storage volume", resourceType: "storage", capacity: fs.bsize * fs.blocks, availableCapacity: fs.bsize * fs.bavail, unit: "bytes", evidence: "probed", observedAt: Date.now() });
      } catch {
        storageId = void 0;
      }
    } catch {
    }
    add({ id: entryId, kind: "root", label: root.label, rootId: root.id, generation: generation3, ...storageId ? { storageId } : {}, access: "read-only" });
    const scan = { rootId: root.id, generation: generation3, state: generation3 ? "complete" : "error", ...!generation3 ? { reason: "io-error" } : {} };
    roots.push(scan);
    if (!generation3) continue;
    const start = entries.length;
    const queue = [{ path: canonical, depth: 0 }];
    for (let pos = 0; pos < queue.length; pos++) {
      signal?.throwIfAborted();
      if (Date.now() >= deadline) {
        scan.state = "partial";
        scan.reason = "deadline";
        break;
      }
      const dir = queue[pos];
      try {
        const check = await lstat5(dir.path);
        if (check.isSymbolicLink() || !check.isDirectory() || !inside2(canonical, await realpath5(dir.path))) {
          scan.state = "partial";
          scan.reason = "io-error";
          continue;
        }
        const handle = await opendir2(dir.path);
        for await (const child of handle) {
          signal?.throwIfAborted();
          if (Date.now() >= deadline || entries.length + 2 * (config.roots.length - rootIndex - 1) >= config.maxEntries) {
            scan.state = "partial";
            scan.reason = Date.now() >= deadline ? "deadline" : "entry-limit";
            break;
          }
          const file = join13(dir.path, child.name), st = await lstat5(file);
          if (st.isSymbolicLink() || !inside2(canonical, await realpath5(file))) continue;
          if (st.isDirectory()) {
            if (dir.depth >= config.maxDepth) {
              scan.state = "partial";
              scan.reason = "depth-limit";
            } else if (queue.length < config.maxEntries) queue.push({ path: file, depth: dir.depth + 1 });
            else {
              scan.state = "partial";
              scan.reason = "entry-limit";
            }
          } else if (st.isFile() && st.nlink === 1) {
            const path = relative5(canonical, file).split(sep5).join("/");
            const candidate = { id: catalogEntryId("file", root.id + "\0" + path), kind: "file", label: child.name, rootId: root.id, generation: generation3, path, sizeBytes: st.size, modifiedAt: st.mtimeMs, fileVersion: fileStatVersion(generation3, path, st), versionBasis: "stat" };
            const parsed = CatalogEntrySchema.safeParse(candidate);
            if (parsed.success) entries.push(parsed.data);
            else {
              scan.state = "partial";
              scan.reason = "unsupported-path";
            }
          }
        }
      } catch (error) {
        signal?.throwIfAborted();
        scan.state = "partial";
        scan.reason = "io-error";
      }
      if (scan.reason === "entry-limit" || scan.reason === "deadline") break;
    }
    try {
      if (inputRootGeneration(root.path) !== generation3) throw Error("root changed");
    } catch {
      entries.splice(start);
      scan.state = "error";
      scan.reason = "root-changed";
    }
  }
  return { entries, roots };
}

// packages/runner/src/catalog-publisher.ts
var CatalogPublisher = class {
  constructor(config, probe, adapters, connected, log, probeAdapters2 = async () => adapters, tools = () => [], transferRoles = () => [], operationEntries = async () => []) {
    this.config = config;
    this.probe = probe;
    this.adapters = adapters;
    this.connected = connected;
    this.log = log;
    this.probeAdapters = probeAdapters2;
    this.tools = tools;
    this.transferRoles = transferRoles;
    this.operationEntries = operationEntries;
  }
  timer;
  controller;
  running;
  stopped = true;
  previous;
  start() {
    if (!this.stopped) return;
    this.stopped = false;
    this.timer = setInterval(() => void this.refresh(), this.config.catalog.refreshMs);
    this.timer.unref();
    void this.refresh();
  }
  async stop() {
    this.stopped = true;
    clearInterval(this.timer);
    this.controller?.abort();
    await this.running;
    this.previous = void 0;
  }
  refresh() {
    if (this.stopped || !this.connected()) return Promise.resolve();
    if (this.running) return this.running;
    this.controller = new AbortController();
    const signal = this.controller.signal;
    this.running = this.publish(signal).catch((error) => {
      if (!signal.aborted) this.log(`resource catalog refresh failed: ${error instanceof Error ? error.message : "unavailable"}`);
    }).finally(() => {
      this.running = void 0;
    });
    return this.running;
  }
  async request(path, signal, body) {
    const response = await fetch(this.config.hub.replace(/^ws/, "http").replace(/\/+$/, "") + "/api/runner/resource-catalog" + path, {
      method: body === void 0 ? "GET" : "POST",
      headers: { Authorization: `Bearer ${this.config.token}`, ...body === void 0 ? {} : { "content-type": "application/json" } },
      ...body === void 0 ? {} : { body: JSON.stringify(body) },
      signal: AbortSignal.any([signal, AbortSignal.timeout(1e4)]),
      redirect: "error"
    });
    if (!response.ok) {
      await response.body?.cancel();
      if (response.status === 404) {
        this.stopped = true;
        clearInterval(this.timer);
      }
      throw Error(`HTTP ${response.status}${response.status === 404 ? ": Hub has no resource catalog; discovery disabled until reconnect" : ""}`);
    }
    return await response.json();
  }
  async publish(signal) {
    const current = await this.request("", signal);
    if (current.version !== 1) throw Error("unsupported registry version");
    const [info, adapters] = await Promise.all([this.probe(), this.probeAdapters()]);
    signal.throwIfAborted();
    const additional = [...await this.operationEntries(signal), ...this.transferRoles().map((role) => ({ id: transferCapabilityId(role), kind: "capability", label: `Task file ${role}`, name: `files.transfer.${role}`, protocol: TRANSFER_PROTOCOL, version: "1", readiness: "available", evidence: "probed" }))];
    const roots = [...this.config.catalog.roots, ...(this.config.operations?.workspaces ?? []).filter((c) => additional.some((e) => e.kind === "capability" && e.id === "operation:workspace:" + c.id)).map(computeOutputRoot)];
    if (roots.length > 32 || new Set(roots.map((r) => r.id)).size !== roots.length) throw Error("workspace publication roots conflict with configured catalog");
    const observed = await scanCatalog({ ...this.config.catalog, roots, maxEntries: Math.max(64, this.config.catalog.maxEntries - additional.length) }, info, adapters, signal, this.tools());
    observed.entries.push(...additional);
    signal.throwIfAborted();
    const previous = this.previous;
    const modern = current.contentIdentity === 1;
    const sameBase = previous?.connectionId === current.connectionId && (modern ? previous.contentId === current.contentId : previous.legacyStamp === current.currentVersion);
    const map = new Map(observed.entries.map((e) => [e.id, e]));
    if (modern && sameBase && catalogDefinition([...previous.entries.values()], previous.roots) === catalogDefinition(observed.entries, observed.roots)) {
      await this.request("/renew", signal, { connectionId: current.connectionId, contentId: current.contentId, observations: observed.entries.filter((e) => e.kind === "hardware") });
      this.previous = { ...previous, entries: map, roots: observed.roots };
      return;
    }
    let delta = sameBase && previous.roots.every((r) => r.state === "complete") && observed.roots.every((r) => r.state === "complete");
    let entries = delta ? observed.entries.filter((e) => JSON.stringify(previous.entries.get(e.id)) !== JSON.stringify(e)) : observed.entries;
    let deletedIds = delta ? [...previous.entries.keys()].filter((id8) => !map.has(id8)) : [];
    if (entries.length + deletedIds.length > CATALOG_LIMITS.deviceEntries) {
      delta = false;
      entries = observed.entries;
      deletedIds = [];
    }
    const snapshotId = randomUUID5(), identity = { connectionId: current.connectionId, snapshotId };
    await this.request("/begin", signal, { ...identity, ...modern ? { expectedContentId: current.contentId ?? null } : { expectedVersion: current.currentVersion }, mode: delta ? "delta" : "snapshot" });
    let page = 0;
    const pageSize = Math.min(CATALOG_LIMITS.pageEntries, 50);
    let entryOffset = 0, deletedOffset = 0;
    do {
      const pageEntries = [], pageDeleted = deletedIds.slice(deletedOffset, deletedOffset + pageSize);
      deletedOffset += pageDeleted.length;
      while (entryOffset < entries.length && pageEntries.length < pageSize) {
        const entry = entries[entryOffset];
        if (Buffer.byteLength(JSON.stringify({ entries: [...pageEntries, entry], deletedIds: pageDeleted })) > 24e4) {
          if (!pageEntries.length) throw Error("registered capability exceeds catalog page limit");
          break;
        }
        pageEntries.push(entry);
        entryOffset++;
      }
      await this.request("/pages", signal, { ...identity, page: page++, entries: pageEntries, deletedIds: pageDeleted });
    } while (entryOffset < entries.length || deletedOffset < deletedIds.length);
    const result = await this.request("/commit", signal, { ...identity, pageCount: page, roots: observed.roots });
    this.previous = { connectionId: current.connectionId, contentId: result.contentId, legacyStamp: result.version, entries: map, roots: observed.roots };
    if (previous?.connectionId !== current.connectionId) this.log(`resource catalog registered: ${map.size} entries, ${observed.roots.filter((r) => r.state !== "complete").length} incomplete roots`);
  }
};

// packages/runner/src/transfers.ts
import { createHash as createHash11 } from "node:crypto";
import { lstat as lstat6, open as open5, readdir as readdir4, rename as rename3, rmdir, unlink as unlink3 } from "node:fs/promises";
import { join as join14 } from "node:path";
var RetryTransfer = class extends Error {
};
var missing2 = (e) => e.code === "ENOENT";
var digest4 = (b) => createHash11("sha256").update(b).digest("hex");
var stopped = (t) => t.cancelRequestedAt !== null || ["canceled", "failed", "needs_reconciliation"].includes(t.status);
var TransferAgent = class {
  constructor(config, deps) {
    this.config = config;
    this.deps = deps;
    this.snapshots = join14(config.spoolDir, "file-transfer-sources");
    this.request = deps.fetch ?? fetch;
  }
  timer;
  running;
  controller;
  stopped = true;
  request;
  snapshots;
  start() {
    if (!this.stopped) return;
    this.stopped = false;
    this.timer = setInterval(() => void this.poll(), 500);
    this.timer.unref();
    void this.poll();
  }
  async stop() {
    this.stopped = true;
    clearInterval(this.timer);
    this.controller?.abort();
    await this.running;
  }
  refresh() {
    return this.poll();
  }
  base() {
    return this.config.hub.replace(/^ws/, "http").replace(/\/+$/, "");
  }
  async http(path, signal, job, method = "GET", body, binary = false, checksum) {
    if (!this.deps.connected() || !this.deps.ready()) throw new RetryTransfer("device is disconnected");
    const response = await this.request(this.base() + "/api/runner/" + path, { method, redirect: "error", signal: AbortSignal.any([signal, AbortSignal.timeout(1e4)]), headers: { Authorization: `Bearer ${this.config.token}`, ...job ? { "x-nado-connection": job.connectionId, "x-nado-transfer": job.capability } : {}, ...body !== void 0 ? { "content-type": binary ? "application/octet-stream" : "application/json" } : {}, ...checksum ? { "x-nado-sha256": checksum } : {} }, body: body === void 0 ? void 0 : binary ? Uint8Array.from(body).buffer : JSON.stringify(body) });
    if (!response.ok) {
      await response.body?.cancel().catch(() => {
      });
      throw new RetryTransfer(`transfer HTTP ${response.status}`);
    }
    return response;
  }
  async json(path, signal, job, method = "GET", body) {
    const r = await this.http(path, signal, job, method, body);
    return await r.json();
  }
  state(job, signal) {
    return this.json(`transfers/${job.transfer.id}?role=${job.role}`, signal, job);
  }
  poll() {
    if (this.stopped || !this.deps.connected() || !this.deps.ready()) return Promise.resolve();
    if (this.running) return this.running;
    this.controller = new AbortController();
    const signal = this.controller.signal;
    this.running = (async () => {
      await privateDirectory(this.snapshots);
      await privateDirectory(this.config.transfers.directory);
      const current = await this.json("resource-catalog", signal);
      const jobs = await this.json(`transfers?connectionId=${encodeURIComponent(current.connectionId)}`, signal);
      for (const job of jobs.jobs) {
        signal.throwIfAborted();
        if (!this.config.transfers.roles.includes(job.role)) continue;
        if (!TransferIdSchema.safeParse(job.transfer.id).success || !TransferIdSchema.safeParse(job.transfer.taskId).success || !TransferSourceSchema.safeParse(job.transfer.source).success || job.chunkBytes !== TRANSFER_CHUNK_BYTES || !/^[a-f0-9]{64}$/.test(job.capability)) {
          this.deps.log("rejected malformed file transfer grant");
          continue;
        }
        try {
          if (job.role === "source") await this.upload(job, signal);
          else await this.receive(job, signal);
        } catch (e) {
          if (signal.aborted) throw e;
          const failure2 = e instanceof TransferFileError ? e : job.role === "source" && missing2(e) ? new TransferFileError("input-changed") : void 0;
          if (failure2) {
            let safeToAbort = true;
            if (job.role === "target" && job.transfer.sha256) {
              const file = TransferFileSchema.parse({ transferId: job.transfer.id, taskId: job.transfer.taskId, sha256: job.transfer.sha256, sizeBytes: job.transfer.source.sizeBytes }), p = inputPaths(this.config.transfers.directory, file);
              try {
                await lstat6(p.root);
                safeToAbort = false;
              } catch (error) {
                if (!missing2(error)) safeToAbort = false;
              }
              if (safeToAbort) try {
                await this.removeStaging(file);
              } catch {
                safeToAbort = false;
              }
              if (!safeToAbort) await this.json(`transfers/${job.transfer.id}/inspection`, signal, job, "POST", {}).catch(() => {
              });
            }
            if (safeToAbort) await this.json(`transfers/${job.transfer.id}/abort`, signal, job, "POST", { role: job.role, reason: failure2.reason }).catch(() => {
            });
            if (job.role === "source") try {
              await this.removeSource(join14(this.snapshots, job.transfer.id));
            } catch {
              this.deps.log(`transfer ${job.transfer.id}: source snapshot cleanup requires inspection`);
            }
            this.deps.log(`transfer ${job.transfer.id}: ${failure2.reason}`);
          } else if (!(e instanceof RetryTransfer)) this.deps.log(`transfer ${job.transfer.id}: local IO interrupted; will reconcile`);
        }
      }
      await this.cleanupSources(current.connectionId, signal);
      await this.cleanupInputs();
    })().catch((e) => {
      if (!signal.aborted && !(e instanceof RetryTransfer)) this.deps.log("file transfer poll interrupted; will retry");
    }).finally(() => {
      this.running = void 0;
    });
    return this.running;
  }
  async quota(required, already = 0) {
    const usage = await treeBytes(this.snapshots) + await treeBytes(this.config.transfers.directory);
    if (usage + Math.max(0, required - already) > this.config.transfers.maxManagedBytes) throw new TransferFileError("local-quota");
  }
  async upload(job, signal) {
    let t = await this.state(job, signal);
    if (stopped(t)) return;
    const root = join14(this.snapshots, t.id);
    await privateDirectory(root);
    const manifest = join14(root, "manifest.json");
    let snapshot;
    const intent = { transferId: t.id, source: t.source, capability: job.capability, createdAt: t.createdAt };
    try {
      const saved = await readJson(manifest);
      if (saved.transferId !== t.id || JSON.stringify(saved.source) !== JSON.stringify(t.source)) throw new TransferFileError("input-changed");
      if (!saved.sha256) throw Object.assign(Error("snapshot not committed"), { code: "ENOENT" });
      const actual = await hashFile(join14(root, "snapshot.bin"), signal, t.source.sizeBytes);
      if (actual.sha256 !== saved.sha256 || actual.sizeBytes !== t.source.sizeBytes) throw new TransferFileError("checksum-mismatch");
      snapshot = { ...actual, path: join14(root, "snapshot.bin") };
    } catch (e) {
      if (!missing2(e)) throw e;
      const owned = await treeBytes(root);
      await this.quota(t.source.sizeBytes + 16384, owned);
      await atomicJson(manifest, intent);
      snapshot = await snapshotSource(t.source, [...this.config.catalog.roots, ...(this.config.operations?.enabled ? this.config.operations.workspaces ?? [] : []).map(computeOutputRoot)], root, signal);
      await atomicJson(manifest, { ...intent, sha256: snapshot.sha256 });
    }
    t = await this.json(`transfers/${t.id}/pin`, signal, job, "POST", { expectedVersion: t.version, sha256: snapshot.sha256, sizeBytes: snapshot.sizeBytes });
    const handle = await open5(snapshot.path, "r");
    try {
      while (t.status === "uploading" && t.receivedBytes < snapshot.sizeBytes) {
        signal.throwIfAborted();
        const bytes = Buffer.alloc(Math.min(job.chunkBytes, snapshot.sizeBytes - t.receivedBytes));
        const r = await handle.read(bytes, 0, bytes.length, t.receivedBytes);
        if (r.bytesRead !== bytes.length) throw new TransferFileError("input-changed");
        const response = await this.http(`transfers/${t.id}/content?offset=${t.receivedBytes}`, signal, job, "PUT", bytes, true, digest4(bytes));
        t = await response.json();
        await this.deps.afterChunk?.("source", t.receivedBytes);
      }
    } finally {
      await handle.close();
    }
    if (t.status === "relayed" || t.status === "receiving" || t.status === "committed") await this.removeSource(root);
  }
  async acknowledge(job, file, signal) {
    await this.json(`transfers/${file.transferId}/receipt`, signal, job, "POST", file);
  }
  async removeStaging(file) {
    const p = inputPaths(this.config.transfers.directory, file);
    try {
      await privateDirectory(p.staging);
      for (const name of ["input.part", "input.bin", "receipt.json", "offset.json", "offset.json.new", "receipt.json.new"]) {
        try {
          await unlink3(join14(p.staging, name));
        } catch (e) {
          if (!missing2(e)) throw e;
        }
      }
      await rmdir(p.staging);
    } catch (e) {
      if (!missing2(e)) throw e;
    }
  }
  async receive(job, signal) {
    const t = job.transfer;
    if (!t.sha256) throw new RetryTransfer("content identity is not pinned");
    const file = TransferFileSchema.parse({ transferId: t.id, taskId: t.taskId, sha256: t.sha256, sizeBytes: t.source.sizeBytes }), p = inputPaths(this.config.transfers.directory, file);
    await privateDirectory(join14(this.config.transfers.directory, file.taskId));
    let existing = false;
    try {
      await lstat6(p.root);
      existing = true;
    } catch (e) {
      if (!missing2(e)) throw e;
    }
    if (existing) {
      try {
        await committedInput(this.config.transfers.directory, file);
      } catch (e) {
        if (missing2(e)) throw new TransferFileError("unsafe-path");
        throw e;
      }
      await this.acknowledge(job, file, signal);
      return;
    }
    let current = await this.state(job, signal);
    if (stopped(current)) {
      await this.removeStaging(file);
      await this.json(`transfers/${t.id}/abort`, signal, job, "POST", { role: "target", reason: "canceled" });
      return;
    }
    current = await this.json(`transfers/${t.id}/receive`, signal, job, "POST", { expectedVersion: current.version });
    await privateDirectory(p.staging);
    let offset = 0;
    try {
      const meta = await readJson(p.offset);
      if (meta.sha256 !== file.sha256 || !Number.isSafeInteger(meta.offset) || meta.offset < 0 || meta.offset > file.sizeBytes) throw new TransferFileError("input-changed");
      offset = meta.offset;
    } catch (e) {
      if (!missing2(e)) throw e;
    }
    let info;
    try {
      info = await safeRegular(p.part);
    } catch (e) {
      if (!missing2(e)) throw e;
    }
    if (info && info.size < offset || !info && offset !== 0) {
      try {
        const actual2 = await hashFile(p.stagedBlob, signal, file.sizeBytes);
        if (actual2.sha256 !== file.sha256 || actual2.sizeBytes !== file.sizeBytes) throw new TransferFileError("checksum-mismatch");
        offset = file.sizeBytes;
      } catch (e) {
        if (missing2(e)) throw new TransferFileError("input-changed");
        throw e;
      }
    }
    await this.quota(file.sizeBytes + 16384, info?.size ?? (offset === file.sizeBytes ? file.sizeBytes : 0));
    if (offset < file.sizeBytes || file.sizeBytes === 0) {
      let handle;
      try {
        handle = await open5(p.part, "r+");
      } catch (e) {
        if (!missing2(e)) throw e;
        handle = await open5(p.part, "wx+", 384);
      }
      try {
        const st = await handle.stat();
        if (st.nlink !== 1 || !st.isFile() || st.size < offset) throw new TransferFileError("unsafe-path");
        await handle.truncate(offset);
        while (offset < file.sizeBytes) {
          signal.throwIfAborted();
          current = await this.state(job, signal);
          if (stopped(current)) throw new RetryTransfer("cancellation will reconcile on next poll");
          const r = await this.http(`transfers/${t.id}/content?offset=${offset}`, signal, job);
          const max = Math.min(job.chunkBytes, file.sizeBytes - offset), parts = [];
          let n = 0;
          for await (const b of r.body) {
            n += b.length;
            if (n > max) {
              await r.body?.cancel().catch(() => {
              });
              throw new TransferFileError("checksum-mismatch");
            }
            parts.push(b);
          }
          const bytes = Buffer.concat(parts);
          if (bytes.length !== max || digest4(bytes) !== r.headers.get("x-nado-sha256")) throw new TransferFileError("checksum-mismatch");
          let written = 0;
          while (written < bytes.length) {
            const w = await handle.write(bytes, written, bytes.length - written, offset + written);
            if (!w.bytesWritten) throw Error("destination write stalled");
            written += w.bytesWritten;
          }
          await handle.sync();
          offset += bytes.length;
          await atomicJson(p.offset, { sha256: file.sha256, offset });
          await this.deps.afterChunk?.("target", offset);
        }
      } finally {
        await handle.close();
      }
    }
    let staged = p.part;
    try {
      await lstat6(staged);
    } catch (e) {
      if (!missing2(e)) throw e;
      staged = p.stagedBlob;
    }
    const actual = await hashFile(staged, signal, file.sizeBytes);
    if (actual.sha256 !== file.sha256 || actual.sizeBytes !== file.sizeBytes) throw new TransferFileError("checksum-mismatch");
    current = await this.state(job, signal);
    if (stopped(current)) return;
    if (staged !== p.stagedBlob) await rename3(staged, p.stagedBlob);
    await atomicJson(p.stagedReceipt, file);
    try {
      await rename3(p.staging, p.root);
    } catch {
      await committedInput(this.config.transfers.directory, file);
    }
    await this.deps.afterCommit?.(file);
    await this.acknowledge(job, file, signal);
  }
  async input(file) {
    if (!this.config.transfers?.enabled || !this.config.transfers.roles.includes("target")) throw new TransferFileError("unsafe-path");
    return committedInput(this.config.transfers.directory, file);
  }
  async removeSource(root) {
    await privateDirectory(root);
    for (const name of ["snapshot.bin", "snapshot.bin.part", "manifest.json", "manifest.json.new"]) {
      try {
        await unlink3(join14(root, name));
      } catch (e) {
        if (!missing2(e)) throw e;
      }
    }
    await rmdir(root);
  }
  async cleanupSources(connectionId, signal) {
    for (const e of await readdir4(this.snapshots, { withFileTypes: true })) {
      if (!/^transfer_[A-Za-z0-9_-]+$/.test(e.name) || !e.isDirectory() || e.isSymbolicLink()) continue;
      const root = join14(this.snapshots, e.name);
      let meta;
      try {
        meta = await readJson(join14(root, "manifest.json"));
      } catch {
        continue;
      }
      try {
        const state = await this.state({ role: "source", connectionId, capability: meta.capability, transfer: { id: e.name }, chunkBytes: 0 }, signal);
        if (["committed", "canceled", "failed", "relayed", "receiving"].includes(state.status)) await this.removeSource(root);
      } catch {
      }
    }
  }
  async cleanupInputs() {
    for (const task of await readdir4(this.config.transfers.directory, { withFileTypes: true })) {
      if (!/^rtask_[A-Za-z0-9_-]+$/.test(task.name) || !task.isDirectory() || task.isSymbolicLink()) continue;
      const base2 = join14(this.config.transfers.directory, task.name);
      for (const entry of await readdir4(base2, { withFileTypes: true })) {
        if (!/^transfer_[A-Za-z0-9_-]+$/.test(entry.name) || !entry.isDirectory() || entry.isSymbolicLink()) continue;
        const root = join14(base2, entry.name), st = await lstat6(root);
        if (Date.now() - st.mtimeMs < this.config.transfers.retentionDays * 864e5) continue;
        try {
          const f = TransferFileSchema.parse(await readJson(join14(root, "receipt.json")));
          if (f.taskId !== task.name || f.transferId !== entry.name) continue;
          await committedInput(this.config.transfers.directory, f);
          for (const name of ["input.bin", "receipt.json", "offset.json"]) {
            try {
              await unlink3(join14(root, name));
            } catch (e) {
              if (!missing2(e)) throw e;
            }
          }
          await rmdir(root);
        } catch {
          this.deps.log(`transfer ${entry.name}: retained local resource requires inspection`);
        }
      }
    }
  }
};

// packages/runner/src/runner.ts
var RUNNER_VERSION = "0.2.18";
function configRemoteReady(config) {
  return !!config.remoteExecution?.enabled && (existsSync9(fileURLToPath3(new URL("./nado-readonly.mjs", import.meta.url))) || existsSync9(fileURLToPath3(new URL("./readonly-entry.ts", import.meta.url))));
}
function samePath2(a, b) {
  return process.platform === "win32" ? a.toLowerCase() === b.toLowerCase() : a === b;
}
function prospectiveRealpath(path) {
  const abs = resolve9(path);
  let ancestor = abs;
  while (!existsSync9(ancestor)) {
    const parent = dirname4(ancestor);
    if (parent === ancestor) throw new Error("no existing workdir ancestor");
    ancestor = parent;
  }
  return resolve9(realpathSync2(ancestor), relative6(ancestor, abs));
}
function isUnderRoots(p, roots) {
  if (!roots.length) return true;
  const abs = resolve9(p);
  return roots.some((root) => {
    const base2 = resolve9(root);
    if (samePath2(abs, base2)) return true;
    const rel = relative6(base2, abs);
    return !!rel && rel !== ".." && !rel.startsWith(".." + (process.platform === "win32" ? "\\" : "/")) && !isAbsolute11(rel);
  });
}
var Runner = class {
  constructor(config, deps) {
    this.config = config;
    this.deps = deps;
    this.retryInitialMs = deps.connectionTiming?.retryInitialMs ?? 1e3;
    this.retryMaxMs = deps.connectionTiming?.retryMaxMs ?? 3e4;
    if (!Number.isFinite(this.retryInitialMs) || this.retryInitialMs <= 0 || !Number.isFinite(this.retryMaxMs) || this.retryMaxMs < this.retryInitialMs) throw new Error("Invalid connection retry timing");
    new ConnectionLiveness(deps.connectionTiming);
    if (config.remoteExecution?.enabled && !config.catalog?.enabled) throw Error("remote execution requires explicit catalog registration");
    if (config.transfers?.enabled && !config.catalog?.enabled) throw Error("file transfers require explicit catalog registration");
    if (config.operations?.enabled && !config.catalog?.enabled) throw Error("operations require explicit catalog registration");
    if (config.modelServices?.length && !config.catalog?.enabled) throw Error("model services require explicit catalog registration");
    this.models = new ModelServices(config.modelServices ?? [], (m) => this.send(m));
    this.backoff = this.retryInitialMs;
    this.log = deps.log ?? ((m) => console.log(`[runner] ${(/* @__PURE__ */ new Date()).toISOString()} ${m}`));
    if (config.adapters.claude !== void 0) this.log("Claude support has been removed; legacy adapter configuration is ignored");
    this.spool = new Spool(config.spoolDir);
    this.nativeStorage = new NativeStorage(config.spoolDir, config.nativeStorage);
    if (config.catalog?.enabled) this.catalog = new CatalogPublisher(config, deps.catalogProbe ?? (() => probeMachine({}, config.resources)), deps.adapters, () => this.connected, this.log, deps.catalogAdapters ?? (() => probeAdapters(config.adapters)), () => this.remoteNegotiated ? config.remoteExecution.tools : [], () => this.transfersNegotiated ? config.transfers.roles : [], async (signal) => [...this.modelsNegotiated ? this.models.entries() : [], ...this.operationsNegotiated ? await probeOperationCapabilities(config.operations, signal, this.workspacesNegotiated) : []]);
    if (config.transfers?.enabled) this.transfers = new TransferAgent(config, { ...deps.transfers, connected: () => this.connected, ready: () => this.transfersNegotiated, log: this.log });
    if (deps.artifacts !== false) {
      this.artifacts = new ArtifactPublisher(config, { ...deps.artifacts, log: this.log, connected: () => this.connected, resolveScope: async (job) => {
        const scope = await operationArtifactScope(config, this.spool, job);
        if (scope) void this.catalog?.refresh();
        return scope;
      } });
    }
    const oc = deps.adapters.find((a) => a.name === "openclaw");
    const ocCfg = config.adapters.openclaw ?? {};
    if (oc?.available && !ocCfg.disabled && config.openclawSync !== false) {
      this.oc = new OpenclawSync(config.spoolDir, ocCfg, (batch) => {
        if (!this.connected) return false;
        return this.send(batch);
      }, () => false, this.log, { onFault: (e) => this.failClosed(e) });
    }
  }
  ws = null;
  live = /* @__PURE__ */ new Map();
  inputInspections = /* @__PURE__ */ new Set();
  spool;
  nativeStorage;
  storageSent = /* @__PURE__ */ new Map();
  stopped = false;
  backoff = 1e3;
  retry;
  log;
  welcomed = false;
  nativeNegotiated = false;
  budgetNegotiated = false;
  recoveryNegotiated = false;
  recoveryHeartbeat = { id: "", at: 0 };
  nativeTaskVersions = [];
  faulted = false;
  sent = /* @__PURE__ */ new Map();
  oc;
  ocTimer;
  replayTimer;
  recoveryTimers = /* @__PURE__ */ new Map();
  artifacts;
  catalog;
  catalogNegotiated = false;
  transfers;
  transfersNegotiated = false;
  operationsNegotiated = false;
  workspacesNegotiated = false;
  modelsNegotiated = false;
  modelConnectionId = "";
  models;
  remoteNegotiated = false;
  remoteInputReferences = false;
  remoteMachineId = null;
  remoteClock;
  liveness = null;
  watchdog;
  retryInitialMs;
  retryMaxMs;
  start() {
    this.stopped = false;
    this.replayTimer = setInterval(() => {
      try {
        if (this.connected) this.replay();
      } catch (e) {
        this.failClosed(e);
      }
    }, 250);
    this.replayTimer.unref();
    this.connect();
  }
  async stop() {
    this.stopped = true;
    await this.models.stop();
    clearTimeout(this.retry);
    clearInterval(this.watchdog);
    clearInterval(this.ocTimer);
    clearInterval(this.replayTimer);
    for (const timer of this.recoveryTimers.values()) clearTimeout(timer);
    this.recoveryTimers.clear();
    const mirrorStopped = this.oc?.stop();
    const artifactsStopped = this.artifacts?.stop();
    const catalogStopped = this.catalog?.stop();
    const transfersStopped = this.transfers?.stop();
    for (const turn of this.live.values()) {
      try {
        turn.cancel();
      } catch {
        turn.abort?.("Runner stopping after persistence failure");
      }
    }
    await Promise.all([mirrorStopped, artifactsStopped, catalogStopped, transfersStopped, ...[...this.live.values()].map((t) => t.done)]);
    const ws = this.ws;
    if (ws && ws.readyState !== wrapper_default.CLOSED) {
      await new Promise((resolve10) => {
        const deadline = setTimeout(() => ws.terminate(), 1e3);
        ws.once("close", () => {
          clearTimeout(deadline);
          resolve10();
        });
        if (ws.readyState === wrapper_default.CONNECTING) ws.terminate();
        else ws.close();
      });
    }
    this.ws = null;
    this.welcomed = false;
    this.liveness = null;
    this.spool.close();
    this.nativeStorage.close();
  }
  get connected() {
    return !this.stopped && this.welcomed && !this.faulted && this.ws?.readyState === wrapper_default.OPEN && this.liveness !== null && !this.liveness.expired(true);
  }
  url() {
    return this.config.hub.replace(/\/+$/, "") + "/runner/ws";
  }
  failClosed(error) {
    this.faulted = true;
    clearInterval(this.watchdog);
    this.log(`execution disabled: ${error.message}`);
    for (const running of this.live.values()) running.abort?.("Runner persistence/validation failure");
    this.ws?.terminate();
  }
  connect() {
    if (this.stopped || this.faulted || this.ws) return;
    clearTimeout(this.retry);
    this.retry = void 0;
    const ws = new wrapper_default(this.url(), { headers: { authorization: `Bearer ${this.config.token}` }, handshakeTimeout: 15e3, maxPayload: MAX_WS_BUFFER_BYTES });
    this.ws = ws;
    this.welcomed = false;
    this.sent.clear();
    this.storageSent.clear();
    const liveness = new ConnectionLiveness(this.deps.connectionTiming);
    this.liveness = liveness;
    this.watchdog = setInterval(() => {
      if (this.ws !== ws || this.stopped || this.faulted) return;
      const reason = liveness.expired(this.welcomed);
      if (reason) this.disconnect(ws, reason);
    }, liveness.intervalMs);
    ws.on("open", async () => {
      if (this.ws !== ws || this.stopped || this.faulted) return;
      const reason = liveness.expired(false);
      if (reason) {
        this.disconnect(ws, reason);
        return;
      }
      this.log(`connected to ${this.url()}`);
      let nativeNegotiated = false;
      this.budgetNegotiated = false;
      this.recoveryNegotiated = false;
      this.catalogNegotiated = false;
      this.transfersNegotiated = false;
      this.operationsNegotiated = false;
      this.workspacesNegotiated = false;
      this.modelsNegotiated = false;
      this.remoteNegotiated = false;
      this.remoteInputReferences = false;
      this.remoteClock = void 0;
      if (this.catalog || this.deps.adapters.some((a) => a.name === "native")) {
        try {
          const endpoint = this.config.hub.replace(/^ws/, "http").replace(/\/+$/, "") + "/api/runner/capabilities";
          const sentWall = Date.now(), sentMono = performance.now();
          const response = await fetch(endpoint, {
            headers: { Authorization: `Bearer ${this.config.token}` },
            signal: AbortSignal.timeout(5e3),
            redirect: "error"
          });
          if (response.ok) {
            const capabilities = await response.json();
            if (Number.isSafeInteger(capabilities.serverTime) && capabilities.serverTime > 0) this.remoteClock = { serverAt: capabilities.serverTime, wall: Date.now(), mono: performance.now(), rtt: Math.max(0, Date.now() - sentWall, performance.now() - sentMono) };
            this.catalogNegotiated = !!this.catalog && capabilities.resourceCatalog?.version === 1;
            this.transfersNegotiated = this.catalogNegotiated && !!this.config.transfers?.enabled && capabilities.fileTransfers?.version === 1 && capabilities.fileTransfers.available === true;
            this.modelsNegotiated = this.catalogNegotiated && capabilities.agentPlanner?.version === 1 && capabilities.agentPlanner.available === true;
            this.operationsNegotiated = this.catalogNegotiated && !!this.remoteClock && !!this.config.operations?.enabled && capabilities.operations?.version === 1 && (capabilities.operations.available === true || capabilities.operations.reconciliation === true) && (existsSync9(fileURLToPath3(new URL("./nado-operation.mjs", import.meta.url))) || existsSync9(fileURLToPath3(new URL("./operation-entry.ts", import.meta.url))));
            this.workspacesNegotiated = this.operationsNegotiated && capabilities.operations?.workspaceExecution === 1;
            this.remoteNegotiated = this.catalogNegotiated && !!this.remoteClock && configRemoteReady(this.config) && capabilities.remoteExecution?.version === 1 && capabilities.remoteExecution.available === true;
            this.remoteInputReferences = this.remoteNegotiated && capabilities.remoteExecution?.inputReferences === 1;
            nativeNegotiated = capabilities.nativeRuntime?.available === true;
            this.nativeTaskVersions = nativeNegotiated ? [1, ...capabilities.nativeRuntime?.taskApiVersions?.includes(2) ? [2] : []] : [];
            this.budgetNegotiated = nativeNegotiated && capabilities.nativeRuntime?.persistentBudget === 1;
            this.recoveryNegotiated = nativeNegotiated && capabilities.nativeRuntime?.recovery === 1;
          }
          await response.body?.cancel().catch(() => {
          });
        } catch {
          this.log("native capability unavailable; advertising legacy adapters only");
        }
      }
      if (this.ws !== ws || this.stopped || this.faulted) return;
      this.nativeNegotiated = nativeNegotiated;
      this.send({
        t: "hello",
        protocol: PROTOCOL_VERSION,
        labels: this.config.labels,
        adapters: this.deps.adapters.filter((a) => a.name !== "native" || this.nativeNegotiated && (a.nativeTaskApiVersions ?? [1]).some((v) => this.nativeTaskVersions.includes(v))).map((a) => isSupportedAdapter(a.name) ? a.name === "native" && a.nativeTaskApiVersions ? { ...a, nativeTaskApiVersions: a.nativeTaskApiVersions.filter((v) => this.nativeTaskVersions.includes(v)) } : a : {
          name: a.name,
          available: false,
          authentication: "unknown",
          error: "adapter support has been removed"
        }).map((a) => a.name === "native" ? { ...a, ...!this.recoveryNegotiated ? { nativeRecoveryVersion: void 0 } : {}, ...!this.nativeStorage.healthy ? { nativeBudgetVersion: void 0, error: "managed storage ledger requires recovery" } : {} } : a),
        info: { ...this.deps.info, ...this.catalogNegotiated ? { resourceCatalogVersion: 1 } : {}, ...this.remoteNegotiated ? { readonlyExecutionVersion: 1 } : {}, ...this.remoteInputReferences ? { remoteInputReferences: 1 } : {}, ...this.workspacesNegotiated ? { workspaceExecutionVersion: 1 } : {}, runnerVersion: RUNNER_VERSION, workspaceRoots: this.config.workspaceRoots, maxConcurrentRuns: this.config.maxConcurrentRuns ?? DEFAULT_MACHINE_CONCURRENCY, artifactVersion: 1, ...this.artifacts && this.config.operations?.enabled ? { operationArtifactVersion: 1 } : {}, artifactFormats: ARTIFACT_EXTENSIONS },
        knownTurns: this.spool.inventory().map((r) => r.turnId),
        runs: this.spool.inventory()
      });
    });
    ws.on("message", (data) => {
      if (this.ws !== ws || this.faulted) return;
      const reason = liveness.expired(this.welcomed);
      if (reason) {
        this.disconnect(ws, reason);
        return;
      }
      try {
        const parsed = HubToRunnerSchema.safeParse(JSON.parse(data.toString()));
        if (!parsed.success) {
          this.log(`invalid Hub v2 message: ${parsed.error.message}`);
          this.disconnect(ws, "invalid protocol v2 message");
          return;
        }
        if (this.stopped && parsed.data.t === "welcome") return;
        liveness.receivedMessage();
        this.onMessage(parsed.data);
        if (parsed.data.t === "welcome" && this.ws === ws && !this.faulted) this.backoff = this.retryInitialMs;
      } catch (e) {
        this.failClosed(e);
      }
    });
    ws.on("unexpected-response", (_req, res) => {
      this.log(`hub rejected connection: HTTP ${res.statusCode}`);
      res.resume();
      ws.terminate();
    });
    ws.on("error", (e) => this.log(`ws error: ${e.message}`));
    ws.on("close", (code, reason) => {
      this.disconnect(ws, `${code} ${reason.toString()}`);
    });
  }
  disconnect(ws, reason) {
    if (this.ws !== ws) return;
    this.ws = null;
    this.welcomed = false;
    this.liveness = null;
    this.sent.clear();
    clearInterval(this.watchdog);
    this.watchdog = void 0;
    ws.terminate();
    if (this.stopped || this.faulted) return;
    const wait = this.backoff;
    this.backoff = Math.min(this.backoff * 2, this.retryMaxMs);
    this.log(`disconnected (${reason}), retrying in ${wait}ms; live executions and durable outbox retained`);
    clearTimeout(this.retry);
    this.retry = setTimeout(() => this.connect(), wait);
  }
  send(msg) {
    const ws = this.ws;
    if (this.faulted || ws?.readyState !== wrapper_default.OPEN) return false;
    const reason = this.liveness?.expired(this.welcomed);
    if (reason) {
      this.disconnect(ws, reason);
      return false;
    }
    const text = JSON.stringify(msg), bytes = Buffer.byteLength(text);
    if (bytes > MAX_WS_BUFFER_BYTES || ws.bufferedAmount + bytes > MAX_WS_BUFFER_BYTES) {
      this.disconnect(ws, "WS buffer limit reached");
      return false;
    }
    ws.send(text, (e) => {
      if (e) this.disconnect(ws, `send failed: ${e.message}`);
    });
    return true;
  }
  replay(turnId) {
    this.nativeStorage.reconcile((turn, runId) => {
      const record = this.spool.get(turn);
      return record?.runId === runId && record.cleanupConfirmed && record.executionState === "closed";
    });
    if (!this.welcomed) return;
    if ((this.recoveryNegotiated || this.remoteNegotiated) && Date.now() - this.recoveryHeartbeat.at >= (this.deps.nativeHeartbeatMs ?? 5e3)) {
      const requestId = crypto.randomUUID();
      this.recoveryHeartbeat = { id: requestId, at: Date.now() };
      this.send({ t: "native.heartbeat", requestId, runs: this.spool.inventory().filter((r) => r.executionState !== "closed").slice(0, 64).map((r) => ({ turnId: r.turnId, runId: r.runId })) });
    }
    const reports = this.budgetNegotiated ? this.nativeStorage.reports().filter((r) => this.storageSent.get(r.taskId) !== JSON.stringify(r)) : [];
    for (let i = 0; i < reports.length; i += 32) {
      const batch = reports.slice(i, i + 32);
      if (!this.send({ t: "native.storage", reports: batch })) return;
      for (const r of batch) this.storageSent.set(r.taskId, JSON.stringify(r));
    }
    for (const run2 of turnId ? [this.spool.get(turnId)] : this.spool.inventory()) {
      if (run2.legacy) continue;
      for (const entry of this.spool.pendingBatch(run2.turnId, this.sent.get(run2.runId))) {
        if (!this.send({ t: "event", turnId: run2.turnId, runId: run2.runId, ...entry })) return;
        this.sent.set(run2.runId, entry.rseq);
      }
    }
  }
  onMessage(msg) {
    if (!this.welcomed && msg.t !== "welcome" && msg.t !== "error" && msg.t !== "ping") throw new Error("Hub dispatched before reconciliation");
    switch (msg.t) {
      case "operation.start":
        return this.startOperation(msg.request);
      case "model.start":
        if (this.modelsNegotiated && msg.connectionId === this.modelConnectionId) this.models.start(msg);
        return;
      case "model.cancel":
        if (msg.connectionId === this.modelConnectionId) this.models.cancel(msg.requestId);
        return;
      case "remote.start":
        return this.startRemote(msg.request);
      case "catalog.refresh":
        void this.catalog?.refresh();
        return;
      case "welcome": {
        this.welcomed = true;
        this.remoteMachineId = msg.machineId;
        this.modelConnectionId = msg.reconcileId;
        this.log(`registered as ${msg.name} (${msg.machineId})`);
        for (const remote of msg.resume) {
          this.spool.reconcile(remote);
          this.sent.set(remote.runId, remote.lastRseq);
          if (remote.cancelRequested) {
            this.spool.requestCancel(remote.turnId, remote.runId);
            this.live.get(remote.turnId)?.cancel();
          }
          if (!this.live.has(remote.turnId)) {
            this.spool.recover(remote.turnId);
            this.watchRecovery(remote.turnId);
          }
        }
        for (const runId of msg.orphanRuns) {
          const run2 = this.spool.runs().find((r) => r.runId === runId);
          if (!run2 || run2.cleanupConfirmed) continue;
          this.spool.requestCancel(run2.turnId, run2.runId);
          this.live.get(run2.turnId)?.cancel();
          if (!this.live.has(run2.turnId)) this.spool.markUnconfirmed(run2.turnId, "Hub orphan; no cleanup evidence");
        }
        this.replay();
        this.send({ t: "reconcile.done", reconcileId: msg.reconcileId, runs: this.spool.inventory() });
        this.artifacts?.start();
        if (this.catalogNegotiated) {
          this.catalog?.start();
          void this.catalog?.refresh();
        }
        if (this.transfersNegotiated) this.transfers?.start();
        if (this.oc) {
          if (msg.fullSync) this.oc.rescan();
          this.pollOpenclaw();
          clearInterval(this.ocTimer);
          this.ocTimer = setInterval(() => this.pollOpenclaw(), 3e4);
          this.ocTimer.unref();
        }
        return;
      }
      case "native.input.inspect":
        if (this.inputInspections.has(msg.reqId)) return;
        if (this.inputInspections.size >= INPUT_INSPECTION_LIMITS.machine) {
          this.send({ t: "native.input.result", reqId: msg.reqId, error: "unavailable" });
          return;
        }
        this.inputInspections.add(msg.reqId);
        void inspectNativeInput(this.config.adapters.native?.workspace, msg.rootId, msg.path).then((input) => this.send({ t: "native.input.result", reqId: msg.reqId, input })).catch(() => this.send({ t: "native.input.result", reqId: msg.reqId, error: "invalid_input" })).finally(() => this.inputInspections.delete(msg.reqId));
        return;
      case "native.approval": {
        const run2 = this.spool.get(msg.turnId);
        if (run2?.runId === msg.runId && run2.executionState !== "closed" && run2.resourceReleasedAt == null)
          writeNativeDecision(this.config.spoolDir, msg);
        return;
      }
      case "native.budget": {
        const run2 = this.spool.get(msg.turnId);
        if (run2?.runId === msg.runId && run2.executionState !== "closed" && run2.resourceReleasedAt == null) writeBudgetDecision(this.config.spoolDir, msg);
        return;
      }
      case "native.checkpoint": {
        const run2 = this.spool.get(msg.turnId);
        if (run2?.runId === msg.runId && run2.executionState !== "closed" && run2.resourceReleasedAt == null) writeCheckpointDecision(this.config.spoolDir, msg);
        return;
      }
      case "native.lease": {
        const run2 = this.spool.get(msg.turnId);
        if (msg.requestId === this.recoveryHeartbeat.id && run2?.runId === msg.runId && run2.executionState !== "closed" && run2.resourceReleasedAt == null) writeLeaseDecision(this.config.spoolDir, msg, this.recoveryHeartbeat.at);
        return;
      }
      case "turn.start":
        return this.startTurn(msg);
      case "run.release":
        this.spool.release(msg.turnId, msg.runId, msg.resourceReleasedAt, msg.reason);
        return;
      case "turn.cancel":
        this.spool.requestCancel(msg.turnId, msg.runId);
        if (this.spool.get(msg.turnId)?.runId === msg.runId) this.live.get(msg.turnId)?.cancel();
        return;
      case "ack":
        this.spool.ack(msg.turnId, msg.rseq, msg.runId);
        if (this.spool.get(msg.turnId)?.executionState === "closed") void this.artifacts?.pass();
        return;
      case "external.ack":
        this.oc?.ack(msg.batchId, msg.disposition);
        return;
      case "fs.list":
        return this.fsList(msg.reqId, msg.path);
      case "ping":
        this.send({ t: "pong" });
        return;
      case "error":
        this.log(`hub error: ${msg.message}`);
        return;
    }
  }
  pollOpenclaw() {
    void this.oc?.pass().catch((e) => this.failClosed(e));
  }
  watchRecovery(turnId) {
    const run2 = this.spool.get(turnId);
    if (!run2 || this.live.has(turnId) || !run2.supervisorToken || run2.cleanupConfirmed || run2.resourceReleasedAt != null || run2.executionState !== "recovering" || this.recoveryTimers.has(run2.runId)) return;
    const graceMs = this.deps.recoveryGraceMs ?? 3e4;
    const timer = setTimeout(() => {
      this.recoveryTimers.delete(run2.runId);
      if (this.stopped || this.faulted || this.live.has(turnId)) return;
      try {
        if (this.spool.expireRecovery(turnId, run2.runId, graceMs)) {
          this.log(`turn ${turnId} recovery grace expired; cleanup remains unconfirmed`);
          this.replay(turnId);
        }
      } catch (e) {
        this.failClosed(e);
      }
    }, Math.max(0, graceMs));
    timer.unref();
    this.recoveryTimers.set(run2.runId, timer);
  }
  startOperation(input) {
    if (this.stopped || this.faulted) return;
    const request = OperationRequestSchema.parse(input), { turnId, runId } = request;
    if (digestOperation(operationRequestPayload(request)) !== request.requestHash || request.deviceId !== this.remoteMachineId || !/^op_[A-Za-z0-9_-]+$/.test(request.operationId)) {
      this.failClosed(Error("operation execution identity mismatch"));
      return;
    }
    if (!this.spool.register(turnId, runId, request.sessionId, request.nativeResourceKey)) {
      this.replay(turnId);
      return;
    }
    const fail = (reason) => {
      this.spool.finish(turnId, { type: "turn.failed", error: reason }, true, "operation rejected before process creation");
      this.replay(turnId);
    };
    if (!this.operationsNegotiated || !this.config.operations?.enabled) return fail("operation capability not negotiated");
    const service = this.config.operations.services.find((s) => operationCapabilityId("service", s.id) === request.capabilityId), archiveRoot = this.config.operations.archiveRoots.find((s) => operationCapabilityId("archive", s.id) === request.capabilityId), workspace = (this.config.operations.workspaces ?? []).find((s) => operationCapabilityId("workspace", s.id) === request.capabilityId);
    if (request.descriptor.kind === "service" && !service || request.descriptor.kind === "archive" && !archiveRoot || request.descriptor.kind === "workspace" && (!workspace || !this.workspacesNegotiated)) return fail("operation scope is not configured");
    if (request.inputFile && (!this.config.transfers?.enabled || !this.config.transfers.roles.includes("target"))) return fail("task input access is not configured");
    const occupied = this.spool.inventory().filter((r) => r.runId !== runId && r.resourceReleasedAt == null && !["none", "closed"].includes(r.executionState));
    if (occupied.length >= (this.config.maxConcurrentRuns ?? DEFAULT_MACHINE_CONCURRENCY)) return fail("local execution concurrency limit reached");
    const clock = this.remoteClock;
    if (!clock) return fail("operation clock calibration unavailable");
    const upper = clock.serverAt + clock.rtt + Math.max(0, Date.now() - clock.wall, performance.now() - clock.mono), remainingMs = Math.floor(Math.min(request.remainingMs, request.expiresAt - upper));
    if (remainingMs <= 0) return fail("operation grant expired");
    const control = nativeControlDir(this.config.spoolDir, runId), grant = join15(control, "operation-grant.json");
    if (existsSync9(grant) && readFileSync7(grant, "utf8") !== JSON.stringify(request)) {
      this.failClosed(Error("operation grant identity changed"));
      return;
    }
    writeFileSync3(grant, JSON.stringify(request), { flag: "wx", mode: 384 });
    const workdir = join15(control, "work");
    mkdirSync6(workdir, { recursive: true });
    const deadlineAt = Date.now() + remainingMs;
    const running = supervise(this.spool, turnId, "native", {}, { prompt: "", workdir, nativeSessionId: null, options: {} }, () => {
      try {
        this.replay(turnId);
      } catch (e) {
        this.failClosed(e);
      }
    }, { ...this.deps.supervisor, deadlineAt, timeoutMs: remainingMs, startupTimeoutMs: this.config.supervisorStartupTimeoutMs ?? this.deps.supervisor?.startupTimeoutMs, onFault: (e) => this.failClosed(e), operationJob: { request, hub: this.config.hub.replace(/^ws/, "http"), directory: join15(this.config.spoolDir, "operation-journal", request.operationId), deadlineAt, ...service ? { service } : {}, ...archiveRoot ? { archiveRoot } : {}, ...workspace ? { workspace } : {}, ...request.inputFile ? { input: { path: inputPaths(this.config.transfers.directory, request.inputFile).blob, receipt: inputPaths(this.config.transfers.directory, request.inputFile).receipt } } : {} } });
    this.live.set(turnId, running);
    void running.done.then(() => this.live.delete(turnId));
  }
  startRemote(input) {
    if (this.stopped || this.faulted) return;
    const request = RemoteRequestSchema.parse(input), { turnId, runId } = request;
    const fingerprint = createHash12("sha256").update(JSON.stringify(remoteRequestPayload(request))).digest("hex");
    if (fingerprint !== request.requestHash) {
      this.failClosed(Error("remote grant identity mismatch"));
      return;
    }
    if (request.call.deviceId !== this.remoteMachineId) {
      this.failClosed(Error("remote grant targets another device"));
      return;
    }
    const control = nativeControlDir(this.config.spoolDir, runId), grant = join15(control, "remote-grant.json");
    if (existsSync9(grant) && readFileSync7(grant, "utf8") !== JSON.stringify(request)) {
      this.failClosed(Error("remote grant identity was reused with different parameters"));
      return;
    }
    if (!this.spool.register(turnId, runId, request.sessionId, request.nativeResourceKey)) {
      this.replay(turnId);
      return;
    }
    const fail = (reason) => {
      this.spool.finish(turnId, { type: "turn.failed", error: reason }, true, "remote request rejected before process creation");
      this.replay(turnId);
    };
    if (!this.remoteNegotiated || !this.config.remoteExecution?.tools.includes(request.call.tool)) return fail("remote readonly capability is not allowed");
    if (request.inputFile && (!this.transfersNegotiated || !this.config.transfers?.roles.includes("target") || request.inputFile.taskId !== request.taskId && (!this.remoteInputReferences || request.priorInputTaskId !== request.inputFile.taskId) || request.call.tool !== "files.read")) return fail("task input capability is not allowed");
    const occupied = this.spool.inventory().filter((r) => r.runId !== runId && r.resourceReleasedAt == null && r.executionState !== "closed" && r.executionState !== "none");
    if (occupied.length >= (this.config.maxConcurrentRuns ?? DEFAULT_MACHINE_CONCURRENCY)) return fail("local execution concurrency limit reached");
    writeFileSync3(grant, JSON.stringify(request), { encoding: "utf8", flag: "wx", mode: 384 });
    const workdir = join15(control, "work");
    mkdirSync6(workdir, { recursive: true });
    const clock = this.remoteClock;
    if (!clock) return fail("remote clock calibration is unavailable");
    const hubNowUpper = clock.serverAt + clock.rtt + Math.max(0, Date.now() - clock.wall, performance.now() - clock.mono);
    const remainingMs = Math.floor(Math.min(request.remainingMs, request.expiresAt - hubNowUpper));
    if (remainingMs <= 0) return fail("remote grant expired before process creation");
    const deadlineAt = Date.now() + remainingMs;
    const running = supervise(this.spool, turnId, "native", {}, { prompt: "", workdir, nativeSessionId: null, options: {} }, () => {
      try {
        this.replay(turnId);
      } catch (e) {
        this.failClosed(e);
      }
    }, {
      ...this.deps.supervisor,
      deadlineAt,
      timeoutMs: remainingMs,
      readonlyJob: {
        request,
        roots: [...this.config.catalog.roots, ...(this.workspacesNegotiated ? this.config.operations?.workspaces ?? [] : []).map(computeOutputRoot)].filter((r) => request.root?.id === r.id).map((r) => ({ id: r.id, path: r.path })),
        tools: this.config.remoteExecution.tools,
        deadlineAt,
        ...request.inputFile ? { input: { path: inputPaths(this.config.transfers.directory, request.inputFile).blob, receipt: inputPaths(this.config.transfers.directory, request.inputFile).receipt } } : {}
      },
      startupTimeoutMs: this.config.supervisorStartupTimeoutMs ?? this.deps.supervisor?.startupTimeoutMs,
      onFault: (e) => this.failClosed(e)
    });
    this.live.set(turnId, running);
    void running.done.then(() => {
      this.live.delete(turnId);
      if (!this.spool.healthy) this.failClosed(Error("remote execution evidence could not be persisted"));
    });
  }
  startTurn(msg) {
    const deadlineAt = msg.nativeContext?.budget ? Date.now() + msg.nativeContext.budget.remainingMs : void 0;
    if (this.stopped || this.faulted) return;
    const { turnId, runId, nativeResourceKey, session } = msg;
    if (!this.spool.register(turnId, runId, session.id, nativeResourceKey)) {
      this.replay(turnId);
      return;
    }
    const fail = (error) => {
      this.spool.finish(turnId, { type: "turn.failed", error }, true, "rejected before supervisor spawn");
      this.replay(turnId);
    };
    if (!isSupportedAdapter(session.adapter)) return fail(`adapter ${session.adapter} support has been removed`);
    if (session.adapter === "native" && !this.nativeNegotiated) return fail("native capability was not negotiated with this Hub");
    if (session.adapter === "native" && session.options.nativeTaskVersion === 2 && !this.nativeTaskVersions.includes(2)) return fail("general native capability was not negotiated");
    const occupied = this.spool.inventory().filter((r) => r.runId !== runId && r.resourceReleasedAt == null && r.executionState !== "closed" && r.executionState !== "none");
    if (occupied.length >= (this.config.maxConcurrentRuns ?? DEFAULT_MACHINE_CONCURRENCY)) return fail("local execution concurrency limit reached");
    if (occupied.some((r) => r.sessionId === session.id || r.nativeResourceKey === nativeResourceKey)) return fail("session/native resource is still occupied");
    const adapter = ADAPTERS[session.adapter], cfg = this.config.adapters[session.adapter] ?? {};
    const info = this.deps.adapters.find((a) => a.name === session.adapter);
    if (!adapter || cfg.disabled || !info?.available) return fail(`adapter ${session.adapter} is not available on this machine`);
    const virtual = session.adapter === "openclaw";
    let workdir = virtual ? homedir2() : session.workdir;
    if (!virtual && !isUnderRoots(workdir, this.config.workspaceRoots)) return fail("workdir is outside workspaceRoots");
    try {
      if (!virtual) {
        const canonicalRoots = this.config.workspaceRoots.map(prospectiveRealpath);
        if (!isUnderRoots(prospectiveRealpath(workdir), canonicalRoots)) return fail("canonical workdir is outside workspaceRoots");
        mkdirSync6(workdir, { recursive: true });
        workdir = realpathSync2(workdir);
        if (!isUnderRoots(workdir, canonicalRoots)) return fail("canonical workdir is outside workspaceRoots");
      }
    } catch (e) {
      return fail(`cannot prepare workdir: ${e.message}`);
    }
    this.log(`turn ${turnId} start (${session.adapter} in ${session.workdir})`);
    const workspace = msg.nativeContext?.workspace;
    if (session.adapter === "native" && msg.resources?.gpuIds.length && info.nativeResourceVersion !== 1) return fail("native runtime does not support assigned GPU resources");
    if (msg.resources && this.deps.info.resources && (msg.resources.cpuSlots > this.deps.info.resources.cpuSlots || msg.resources.memoryMiB > this.deps.info.resources.memoryMiB)) return fail("assigned resources exceed device capacity");
    if (msg.resources?.gpuIds.length && (!this.deps.info.resources || this.deps.info.resources.gpuPolicy !== "exclusive" || msg.resources.gpuIds.some((id8) => !this.deps.info.resources.gpus.some((g) => g.id === id8)))) return fail("assigned GPU is unavailable on this device");
    if (workspace && (!cfg.workspace?.enabled || workspace.profile === "trusted-host" && (!cfg.workspace.allowTrustedHost || !workspace.trustedHostConsent))) return fail("workspace profile not permitted by device");
    const nativeExecution = workspace ? { controlDir: nativeControlDir(this.config.spoolDir, runId), config: cfg.workspace } : void 0;
    if (msg.nativeContext?.budget && !this.deps.adapters.some((a) => a.name === "native" && a.nativeBudgetVersion === 1)) return fail("runtime does not support persistent budgets");
    const nativeBudgetControl = msg.nativeContext?.budget ? { controlDir: nativeControlDir(this.config.spoolDir, runId) } : void 0;
    if (msg.nativeContext?.budget) {
      try {
        this.nativeStorage.reserve(msg.nativeContext.taskId, turnId, runId, workdir, msg.nativeContext.budget.policy.storage);
      } catch (error) {
        return fail(error instanceof Error && error.message.startsWith("native storage ") ? error.message : "native storage inventory could not be verified");
      }
    }
    const running = supervise(
      this.spool,
      turnId,
      session.adapter,
      cfg,
      {
        prompt: msg.prompt,
        workdir,
        nativeSessionId: session.nativeSessionId,
        options: session.options,
        ...session.options.nativeTaskVersion === 2 ? { nativeContext: msg.nativeContext, execution: { runId, turnId, sessionId: session.id }, nativeExecution, nativeBudgetControl, resources: msg.resources } : {}
      },
      () => {
        try {
          this.replay(turnId);
        } catch (e) {
          this.failClosed(e);
        }
      },
      {
        ...this.deps.supervisor,
        timeoutMs: this.config.turnTimeoutMs,
        deadlineAt,
        startupTimeoutMs: this.config.supervisorStartupTimeoutMs ?? this.deps.supervisor?.startupTimeoutMs,
        onFault: (e) => this.failClosed(e)
      }
    );
    this.live.set(turnId, running);
    void running.done.then(() => {
      this.live.delete(turnId);
      if (!this.spool.healthy) this.failClosed(new Error("supervisor could not persist execution evidence"));
      this.log(`turn ${turnId} supervisor closed`);
    });
  }
  fsList(reqId, path) {
    const roots = this.config.workspaceRoots;
    try {
      if (!path) {
        if (roots.length) {
          this.send({ t: "fs.result", reqId, path: "", entries: roots.map((r) => ({ name: r, dir: true })) });
          return;
        }
        path = process.cwd();
      }
      const abs = realpathSync2(resolve9(path));
      if (!isUnderRoots(abs, roots.map((r) => realpathSync2(r)))) throw new Error("path is outside workspaceRoots");
      const entries = readdirSync6(abs, { withFileTypes: true }).filter((d) => !d.name.startsWith(".")).map((d) => ({ name: d.name, dir: d.isDirectory() })).sort((a, b) => Number(b.dir) - Number(a.dir) || a.name.localeCompare(b.name)).slice(0, 500);
      this.send({ t: "fs.result", reqId, path: abs, entries });
    } catch (e) {
      this.send({ t: "fs.result", reqId, error: e.message });
    }
  }
};

// packages/runner/src/storage-status.ts
import { existsSync as existsSync10, statSync as statSync4 } from "node:fs";
import { join as join16 } from "node:path";
import { DatabaseSync as DatabaseSync4 } from "node:sqlite";
function readRunnerStorageStatus(spoolDir) {
  const file = join16(spoolDir, "outbox.sqlite");
  if (!existsSync10(file)) return { status: "missing", reason: "No durable outbox exists at the configured spool directory." };
  let db;
  try {
    db = new DatabaseSync4(file, { readOnly: true });
    db.exec("PRAGMA busy_timeout=1000; BEGIN");
    const schemaVersion = Number(db.prepare("PRAGMA user_version").get().user_version);
    if (schemaVersion < 1 || schemaVersion > OUTBOX_SCHEMA_VERSION) {
      return { status: "unsupported", schemaVersion, reason: "Outbox schema is not supported; inspection did not migrate it." };
    }
    const released = schemaVersion >= 2 ? "resource_released_at IS NULL AND " : "";
    const counts = db.prepare(`SELECT COUNT(*) AS retained,
      COALESCE(SUM(${released}state NOT IN ('none','closed')),0) AS occupied,
      COALESCE(SUM(${released}state='unconfirmed'),0) AS unconfirmed,
      COALESCE(SUM(${released}state='recovering'),0) AS recovering FROM runs`).get();
    const pending = db.prepare(`SELECT COUNT(*) AS events, COALESCE(SUM(length(CAST(o.event AS BLOB))),0) AS bytes,
      MIN(r.created_at) AS oldest_run FROM outbox o JOIN runs r ON r.run_id=o.run_id`).get();
    db.exec("COMMIT");
    return {
      status: "observed",
      schemaVersion,
      integrity: "not_checked",
      retainedRuns: Number(counts.retained),
      occupiedRuns: Number(counts.occupied),
      unconfirmedRuns: Number(counts.unconfirmed),
      recoveringRuns: Number(counts.recovering),
      pendingEvents: Number(pending.events),
      pendingBytes: Number(pending.bytes),
      oldestPendingRunAt: pending.oldest_run === null ? null : Number(pending.oldest_run),
      databaseBytes: statSync4(file).size,
      walBytes: existsSync10(`${file}-wal`) ? statSync4(`${file}-wal`).size : 0
    };
  } catch {
    return { status: "unavailable", reason: "Outbox inspection failed; check database access/schema separately. No repair was attempted." };
  } finally {
    db?.close();
  }
}

// packages/runner/src/cli.ts
var HELP = `nado-runner <command> [--config <file>]

Commands:
  start     Connect to the hub and run agent turns
  doctor    Print detected hardware and agent CLIs, then exit
  status    Read outbox capacity/recovery counters; no CLI or network probes

Config: ${defaultConfigPath()} (JSON). Env overrides:
  NADO_HUB_URL, NADO_MACHINE_TOKEN, NADO_WORKSPACE_ROOTS, NADO_LABELS
`;
assertSupportedNodeRuntime();
var { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { config: { type: "string", short: "c" } }
});
async function main() {
  const cmd = positionals[0];
  if (cmd === "doctor" || cmd === "status") {
    let config2;
    let configuration = { status: "loaded" };
    try {
      config2 = loadConfig(values.config);
    } catch {
      const missing3 = !values.config && !existsSync11(defaultConfigPath());
      configuration = { status: missing3 ? "missing" : "invalid", reason: "Runner configuration could not be loaded; check required fields and JSON syntax. Contents withheld." };
    }
    const storage = config2 ? readRunnerStorageStatus(config2.spoolDir) : { status: "not_checked", reason: "No valid spool configuration." };
    const connection = { status: "not_observed", reason: "Offline storage inspection does not prove the running Runner is connected." };
    if (cmd === "status") {
      console.log(JSON.stringify({ configuration, storage, connection }, null, 2));
    } else {
      const [info2, adapters2] = await Promise.all([probeMachine({}, config2?.resources), configuration.status === "invalid" ? Promise.resolve([]) : probeAdapters(config2?.adapters ?? {})]);
      console.log(JSON.stringify({ configuration, info: info2, adapters: adapters2, storage, connection }, null, 2));
    }
    if (configuration.status === "invalid" || cmd === "status" && !config2 || ["unsupported", "unavailable"].includes(storage.status)) process.exitCode = 1;
    return;
  }
  if (cmd !== "start") {
    console.log(HELP);
    process.exit(cmd ? 1 : 0);
  }
  const config = loadConfig(values.config);
  const log = createDiagnosticLogger(
    process.env.NADO_RUNNER_LOG ?? join17(config.spoolDir, "..", "logs", "runner.log"),
    { secrets: [config.token], mirror: console.log }
  );
  const [info, adapters] = await Promise.all([probeMachine({}, config.resources), probeAdapters(config.adapters)]);
  for (const a of adapters) log(`[runner] adapter ${a.name}: ${a.available ? `installed ${a.version ?? ""}; authentication unknown` : `unavailable (${a.error})`}`);
  const runner = new Runner(config, { adapters, info, log: (message) => log("[runner] " + message) });
  runner.start();
  const shutdown = async () => {
    await runner.stop();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
