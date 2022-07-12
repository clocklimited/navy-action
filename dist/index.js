var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// node_modules/ws/lib/constants.js
var require_constants = __commonJS({
  "node_modules/ws/lib/constants.js"(exports, module2) {
    "use strict";
    module2.exports = {
      BINARY_TYPES: ["nodebuffer", "arraybuffer", "fragments"],
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      kForOnEventAttribute: Symbol("kIsForOnEventAttribute"),
      kListener: Symbol("kListener"),
      kStatusCode: Symbol("status-code"),
      kWebSocket: Symbol("websocket"),
      NOOP: () => {
      }
    };
  }
});

// node_modules/ws/lib/buffer-util.js
var require_buffer_util = __commonJS({
  "node_modules/ws/lib/buffer-util.js"(exports, module2) {
    "use strict";
    var { EMPTY_BUFFER } = require_constants();
    function concat(list, totalLength) {
      if (list.length === 0)
        return EMPTY_BUFFER;
      if (list.length === 1)
        return list[0];
      const target = Buffer.allocUnsafe(totalLength);
      let offset = 0;
      for (let i = 0; i < list.length; i++) {
        const buf = list[i];
        target.set(buf, offset);
        offset += buf.length;
      }
      if (offset < totalLength)
        return target.slice(0, offset);
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
      if (buf.byteLength === buf.buffer.byteLength) {
        return buf.buffer;
      }
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    }
    function toBuffer(data) {
      toBuffer.readOnly = true;
      if (Buffer.isBuffer(data))
        return data;
      let buf;
      if (data instanceof ArrayBuffer) {
        buf = Buffer.from(data);
      } else if (ArrayBuffer.isView(data)) {
        buf = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
      } else {
        buf = Buffer.from(data);
        toBuffer.readOnly = false;
      }
      return buf;
    }
    module2.exports = {
      concat,
      mask: _mask,
      toArrayBuffer,
      toBuffer,
      unmask: _unmask
    };
    if (!process.env.WS_NO_BUFFER_UTIL) {
      try {
        const bufferUtil = require("bufferutil");
        module2.exports.mask = function(source, mask, output, offset, length) {
          if (length < 48)
            _mask(source, mask, output, offset, length);
          else
            bufferUtil.mask(source, mask, output, offset, length);
        };
        module2.exports.unmask = function(buffer, mask) {
          if (buffer.length < 32)
            _unmask(buffer, mask);
          else
            bufferUtil.unmask(buffer, mask);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/ws/lib/limiter.js
var require_limiter = __commonJS({
  "node_modules/ws/lib/limiter.js"(exports, module2) {
    "use strict";
    var kDone = Symbol("kDone");
    var kRun = Symbol("kRun");
    var Limiter = class {
      constructor(concurrency) {
        this[kDone] = () => {
          this.pending--;
          this[kRun]();
        };
        this.concurrency = concurrency || Infinity;
        this.jobs = [];
        this.pending = 0;
      }
      add(job) {
        this.jobs.push(job);
        this[kRun]();
      }
      [kRun]() {
        if (this.pending === this.concurrency)
          return;
        if (this.jobs.length) {
          const job = this.jobs.shift();
          this.pending++;
          job(this[kDone]);
        }
      }
    };
    module2.exports = Limiter;
  }
});

// node_modules/ws/lib/permessage-deflate.js
var require_permessage_deflate = __commonJS({
  "node_modules/ws/lib/permessage-deflate.js"(exports, module2) {
    "use strict";
    var zlib = require("zlib");
    var bufferUtil = require_buffer_util();
    var Limiter = require_limiter();
    var { kStatusCode } = require_constants();
    var TRAILER = Buffer.from([0, 0, 255, 255]);
    var kPerMessageDeflate = Symbol("permessage-deflate");
    var kTotalLength = Symbol("total-length");
    var kCallback = Symbol("callback");
    var kBuffers = Symbol("buffers");
    var kError = Symbol("error");
    var zlibLimiter;
    var PerMessageDeflate = class {
      constructor(options, isServer, maxPayload) {
        this._maxPayload = maxPayload | 0;
        this._options = options || {};
        this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
        this._isServer = !!isServer;
        this._deflate = null;
        this._inflate = null;
        this.params = null;
        if (!zlibLimiter) {
          const concurrency = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
          zlibLimiter = new Limiter(concurrency);
        }
      }
      static get extensionName() {
        return "permessage-deflate";
      }
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
      accept(configurations) {
        configurations = this.normalizeParams(configurations);
        this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
        return this.params;
      }
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
            callback(new Error("The deflate stream was closed while data was being processed"));
          }
        }
      }
      acceptAsServer(offers) {
        const opts = this._options;
        const accepted = offers.find((params) => {
          if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && !params.client_max_window_bits) {
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
          throw new Error('Unexpected or invalid parameter "client_max_window_bits"');
        }
        return params;
      }
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
                  throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
                }
                value = num;
              } else if (!this._isServer) {
                throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
              }
            } else if (key === "server_max_window_bits") {
              const num = +value;
              if (!Number.isInteger(num) || num < 8 || num > 15) {
                throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
              }
              value = num;
            } else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
              if (value !== true) {
                throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
              }
            } else {
              throw new Error(`Unknown parameter "${key}"`);
            }
            params[key] = value;
          });
        });
        return configurations;
      }
      decompress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._decompress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      compress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._compress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
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
        if (fin)
          this._inflate.write(TRAILER);
        this._inflate.flush(() => {
          const err = this._inflate[kError];
          if (err) {
            this._inflate.close();
            this._inflate = null;
            callback(err);
            return;
          }
          const data2 = bufferUtil.concat(this._inflate[kBuffers], this._inflate[kTotalLength]);
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
          let data2 = bufferUtil.concat(this._deflate[kBuffers], this._deflate[kTotalLength]);
          if (fin)
            data2 = data2.slice(0, data2.length - 4);
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
    module2.exports = PerMessageDeflate;
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
      err[kStatusCode] = 1007;
      this[kCallback](err);
    }
  }
});

// node_modules/ws/lib/validation.js
var require_validation = __commonJS({
  "node_modules/ws/lib/validation.js"(exports, module2) {
    "use strict";
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
          if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || buf[i] === 237 && (buf[i + 1] & 224) === 160) {
            return false;
          }
          i += 3;
        } else if ((buf[i] & 248) === 240) {
          if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
            return false;
          }
          i += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    module2.exports = {
      isValidStatusCode,
      isValidUTF8: _isValidUTF8,
      tokenChars
    };
    if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const isValidUTF8 = require("utf-8-validate");
        module2.exports.isValidUTF8 = function(buf) {
          return buf.length < 150 ? _isValidUTF8(buf) : isValidUTF8(buf);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/ws/lib/receiver.js
var require_receiver = __commonJS({
  "node_modules/ws/lib/receiver.js"(exports, module2) {
    "use strict";
    var { Writable } = require("stream");
    var PerMessageDeflate = require_permessage_deflate();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      kStatusCode,
      kWebSocket
    } = require_constants();
    var { concat, toArrayBuffer, unmask } = require_buffer_util();
    var { isValidStatusCode, isValidUTF8 } = require_validation();
    var GET_INFO = 0;
    var GET_PAYLOAD_LENGTH_16 = 1;
    var GET_PAYLOAD_LENGTH_64 = 2;
    var GET_MASK = 3;
    var GET_DATA = 4;
    var INFLATING = 5;
    var Receiver = class extends Writable {
      constructor(options = {}) {
        super();
        this._binaryType = options.binaryType || BINARY_TYPES[0];
        this._extensions = options.extensions || {};
        this._isServer = !!options.isServer;
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
        this._fragments = [];
        this._state = GET_INFO;
        this._loop = false;
      }
      _write(chunk, encoding, cb) {
        if (this._opcode === 8 && this._state == GET_INFO)
          return cb();
        this._bufferedBytes += chunk.length;
        this._buffers.push(chunk);
        this.startLoop(cb);
      }
      consume(n) {
        this._bufferedBytes -= n;
        if (n === this._buffers[0].length)
          return this._buffers.shift();
        if (n < this._buffers[0].length) {
          const buf = this._buffers[0];
          this._buffers[0] = buf.slice(n);
          return buf.slice(0, n);
        }
        const dst = Buffer.allocUnsafe(n);
        do {
          const buf = this._buffers[0];
          const offset = dst.length - n;
          if (n >= buf.length) {
            dst.set(this._buffers.shift(), offset);
          } else {
            dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
            this._buffers[0] = buf.slice(n);
          }
          n -= buf.length;
        } while (n > 0);
        return dst;
      }
      startLoop(cb) {
        let err;
        this._loop = true;
        do {
          switch (this._state) {
            case GET_INFO:
              err = this.getInfo();
              break;
            case GET_PAYLOAD_LENGTH_16:
              err = this.getPayloadLength16();
              break;
            case GET_PAYLOAD_LENGTH_64:
              err = this.getPayloadLength64();
              break;
            case GET_MASK:
              this.getMask();
              break;
            case GET_DATA:
              err = this.getData(cb);
              break;
            default:
              this._loop = false;
              return;
          }
        } while (this._loop);
        cb(err);
      }
      getInfo() {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        const buf = this.consume(2);
        if ((buf[0] & 48) !== 0) {
          this._loop = false;
          return error(RangeError, "RSV2 and RSV3 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_2_3");
        }
        const compressed = (buf[0] & 64) === 64;
        if (compressed && !this._extensions[PerMessageDeflate.extensionName]) {
          this._loop = false;
          return error(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1");
        }
        this._fin = (buf[0] & 128) === 128;
        this._opcode = buf[0] & 15;
        this._payloadLength = buf[1] & 127;
        if (this._opcode === 0) {
          if (compressed) {
            this._loop = false;
            return error(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1");
          }
          if (!this._fragmented) {
            this._loop = false;
            return error(RangeError, "invalid opcode 0", true, 1002, "WS_ERR_INVALID_OPCODE");
          }
          this._opcode = this._fragmented;
        } else if (this._opcode === 1 || this._opcode === 2) {
          if (this._fragmented) {
            this._loop = false;
            return error(RangeError, `invalid opcode ${this._opcode}`, true, 1002, "WS_ERR_INVALID_OPCODE");
          }
          this._compressed = compressed;
        } else if (this._opcode > 7 && this._opcode < 11) {
          if (!this._fin) {
            this._loop = false;
            return error(RangeError, "FIN must be set", true, 1002, "WS_ERR_EXPECTED_FIN");
          }
          if (compressed) {
            this._loop = false;
            return error(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1");
          }
          if (this._payloadLength > 125) {
            this._loop = false;
            return error(RangeError, `invalid payload length ${this._payloadLength}`, true, 1002, "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH");
          }
        } else {
          this._loop = false;
          return error(RangeError, `invalid opcode ${this._opcode}`, true, 1002, "WS_ERR_INVALID_OPCODE");
        }
        if (!this._fin && !this._fragmented)
          this._fragmented = this._opcode;
        this._masked = (buf[1] & 128) === 128;
        if (this._isServer) {
          if (!this._masked) {
            this._loop = false;
            return error(RangeError, "MASK must be set", true, 1002, "WS_ERR_EXPECTED_MASK");
          }
        } else if (this._masked) {
          this._loop = false;
          return error(RangeError, "MASK must be clear", true, 1002, "WS_ERR_UNEXPECTED_MASK");
        }
        if (this._payloadLength === 126)
          this._state = GET_PAYLOAD_LENGTH_16;
        else if (this._payloadLength === 127)
          this._state = GET_PAYLOAD_LENGTH_64;
        else
          return this.haveLength();
      }
      getPayloadLength16() {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        this._payloadLength = this.consume(2).readUInt16BE(0);
        return this.haveLength();
      }
      getPayloadLength64() {
        if (this._bufferedBytes < 8) {
          this._loop = false;
          return;
        }
        const buf = this.consume(8);
        const num = buf.readUInt32BE(0);
        if (num > Math.pow(2, 53 - 32) - 1) {
          this._loop = false;
          return error(RangeError, "Unsupported WebSocket frame: payload length > 2^53 - 1", false, 1009, "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH");
        }
        this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
        return this.haveLength();
      }
      haveLength() {
        if (this._payloadLength && this._opcode < 8) {
          this._totalPayloadLength += this._payloadLength;
          if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
            this._loop = false;
            return error(RangeError, "Max payload size exceeded", false, 1009, "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH");
          }
        }
        if (this._masked)
          this._state = GET_MASK;
        else
          this._state = GET_DATA;
      }
      getMask() {
        if (this._bufferedBytes < 4) {
          this._loop = false;
          return;
        }
        this._mask = this.consume(4);
        this._state = GET_DATA;
      }
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
        if (this._opcode > 7)
          return this.controlMessage(data);
        if (this._compressed) {
          this._state = INFLATING;
          this.decompress(data, cb);
          return;
        }
        if (data.length) {
          this._messageLength = this._totalPayloadLength;
          this._fragments.push(data);
        }
        return this.dataMessage();
      }
      decompress(data, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
        perMessageDeflate.decompress(data, this._fin, (err, buf) => {
          if (err)
            return cb(err);
          if (buf.length) {
            this._messageLength += buf.length;
            if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
              return cb(error(RangeError, "Max payload size exceeded", false, 1009, "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"));
            }
            this._fragments.push(buf);
          }
          const er = this.dataMessage();
          if (er)
            return cb(er);
          this.startLoop(cb);
        });
      }
      dataMessage() {
        if (this._fin) {
          const messageLength = this._messageLength;
          const fragments = this._fragments;
          this._totalPayloadLength = 0;
          this._messageLength = 0;
          this._fragmented = 0;
          this._fragments = [];
          if (this._opcode === 2) {
            let data;
            if (this._binaryType === "nodebuffer") {
              data = concat(fragments, messageLength);
            } else if (this._binaryType === "arraybuffer") {
              data = toArrayBuffer(concat(fragments, messageLength));
            } else {
              data = fragments;
            }
            this.emit("message", data, true);
          } else {
            const buf = concat(fragments, messageLength);
            if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
              this._loop = false;
              return error(Error, "invalid UTF-8 sequence", true, 1007, "WS_ERR_INVALID_UTF8");
            }
            this.emit("message", buf, false);
          }
        }
        this._state = GET_INFO;
      }
      controlMessage(data) {
        if (this._opcode === 8) {
          this._loop = false;
          if (data.length === 0) {
            this.emit("conclude", 1005, EMPTY_BUFFER);
            this.end();
          } else if (data.length === 1) {
            return error(RangeError, "invalid payload length 1", true, 1002, "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH");
          } else {
            const code = data.readUInt16BE(0);
            if (!isValidStatusCode(code)) {
              return error(RangeError, `invalid status code ${code}`, true, 1002, "WS_ERR_INVALID_CLOSE_CODE");
            }
            const buf = data.slice(2);
            if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
              return error(Error, "invalid UTF-8 sequence", true, 1007, "WS_ERR_INVALID_UTF8");
            }
            this.emit("conclude", code, buf);
            this.end();
          }
        } else if (this._opcode === 9) {
          this.emit("ping", data);
        } else {
          this.emit("pong", data);
        }
        this._state = GET_INFO;
      }
    };
    module2.exports = Receiver;
    function error(ErrorCtor, message, prefix, statusCode, errorCode) {
      const err = new ErrorCtor(prefix ? `Invalid WebSocket frame: ${message}` : message);
      Error.captureStackTrace(err, error);
      err.code = errorCode;
      err[kStatusCode] = statusCode;
      return err;
    }
  }
});

// node_modules/ws/lib/sender.js
var require_sender = __commonJS({
  "node_modules/ws/lib/sender.js"(exports, module2) {
    "use strict";
    var net = require("net");
    var tls = require("tls");
    var { randomFillSync } = require("crypto");
    var PerMessageDeflate = require_permessage_deflate();
    var { EMPTY_BUFFER } = require_constants();
    var { isValidStatusCode } = require_validation();
    var { mask: applyMask, toBuffer } = require_buffer_util();
    var kByteLength = Symbol("kByteLength");
    var maskBuffer = Buffer.alloc(4);
    var Sender = class {
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
        this._deflating = false;
        this._queue = [];
      }
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
            randomFillSync(mask, 0, 4);
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
        if (options.rsv1)
          target[0] |= 64;
        target[1] = payloadLength;
        if (payloadLength === 126) {
          target.writeUInt16BE(dataLength, 2);
        } else if (payloadLength === 127) {
          target[2] = target[3] = 0;
          target.writeUIntBE(dataLength, 4, 6);
        }
        if (!options.mask)
          return [target, data];
        target[1] |= 128;
        target[offset - 4] = mask[0];
        target[offset - 3] = mask[1];
        target[offset - 2] = mask[2];
        target[offset - 1] = mask[3];
        if (skipMasking)
          return [target, data];
        if (merge) {
          applyMask(data, mask, target, offset, dataLength);
          return [target];
        }
        applyMask(data, mask, data, 0, dataLength);
        return [target, data];
      }
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
          } else {
            buf.set(data, 2);
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
        if (this._deflating) {
          this.enqueue([this.dispatch, buf, false, options, cb]);
        } else {
          this.sendFrame(Sender.frame(buf, options), cb);
        }
      }
      ping(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
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
        if (this._deflating) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(Sender.frame(data, options), cb);
        }
      }
      pong(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
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
        if (this._deflating) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(Sender.frame(data, options), cb);
        }
      }
      send(data, options, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
        let opcode = options.binary ? 2 : 1;
        let rsv1 = options.compress;
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
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
        if (options.fin)
          this._firstFragment = true;
        if (perMessageDeflate) {
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
          if (this._deflating) {
            this.enqueue([this.dispatch, data, this._compress, opts, cb]);
          } else {
            this.dispatch(data, this._compress, opts, cb);
          }
        } else {
          this.sendFrame(Sender.frame(data, {
            [kByteLength]: byteLength,
            fin: options.fin,
            generateMask: this._generateMask,
            mask: options.mask,
            maskBuffer: this._maskBuffer,
            opcode,
            readOnly,
            rsv1: false
          }), cb);
        }
      }
      dispatch(data, compress, options, cb) {
        if (!compress) {
          this.sendFrame(Sender.frame(data, options), cb);
          return;
        }
        const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
        this._bufferedBytes += options[kByteLength];
        this._deflating = true;
        perMessageDeflate.compress(data, options.fin, (_, buf) => {
          if (this._socket.destroyed) {
            const err = new Error("The socket was closed while data was being compressed");
            if (typeof cb === "function")
              cb(err);
            for (let i = 0; i < this._queue.length; i++) {
              const params = this._queue[i];
              const callback = params[params.length - 1];
              if (typeof callback === "function")
                callback(err);
            }
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          this._deflating = false;
          options.readOnly = false;
          this.sendFrame(Sender.frame(buf, options), cb);
          this.dequeue();
        });
      }
      dequeue() {
        while (!this._deflating && this._queue.length) {
          const params = this._queue.shift();
          this._bufferedBytes -= params[3][kByteLength];
          Reflect.apply(params[0], this, params.slice(1));
        }
      }
      enqueue(params) {
        this._bufferedBytes += params[3][kByteLength];
        this._queue.push(params);
      }
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
    module2.exports = Sender;
  }
});

// node_modules/ws/lib/event-target.js
var require_event_target = __commonJS({
  "node_modules/ws/lib/event-target.js"(exports, module2) {
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
      constructor(type) {
        this[kTarget] = null;
        this[kType] = type;
      }
      get target() {
        return this[kTarget];
      }
      get type() {
        return this[kType];
      }
    };
    Object.defineProperty(Event.prototype, "target", { enumerable: true });
    Object.defineProperty(Event.prototype, "type", { enumerable: true });
    var CloseEvent = class extends Event {
      constructor(type, options = {}) {
        super(type);
        this[kCode] = options.code === void 0 ? 0 : options.code;
        this[kReason] = options.reason === void 0 ? "" : options.reason;
        this[kWasClean] = options.wasClean === void 0 ? false : options.wasClean;
      }
      get code() {
        return this[kCode];
      }
      get reason() {
        return this[kReason];
      }
      get wasClean() {
        return this[kWasClean];
      }
    };
    Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });
    var ErrorEvent = class extends Event {
      constructor(type, options = {}) {
        super(type);
        this[kError] = options.error === void 0 ? null : options.error;
        this[kMessage] = options.message === void 0 ? "" : options.message;
      }
      get error() {
        return this[kError];
      }
      get message() {
        return this[kMessage];
      }
    };
    Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
    Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });
    var MessageEvent = class extends Event {
      constructor(type, options = {}) {
        super(type);
        this[kData] = options.data === void 0 ? null : options.data;
      }
      get data() {
        return this[kData];
      }
    };
    Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
    var EventTarget = {
      addEventListener(type, listener, options = {}) {
        let wrapper;
        if (type === "message") {
          wrapper = function onMessage(data, isBinary) {
            const event = new MessageEvent("message", {
              data: isBinary ? data : data.toString()
            });
            event[kTarget] = this;
            listener.call(this, event);
          };
        } else if (type === "close") {
          wrapper = function onClose(code, message) {
            const event = new CloseEvent("close", {
              code,
              reason: message.toString(),
              wasClean: this._closeFrameReceived && this._closeFrameSent
            });
            event[kTarget] = this;
            listener.call(this, event);
          };
        } else if (type === "error") {
          wrapper = function onError(error) {
            const event = new ErrorEvent("error", {
              error,
              message: error.message
            });
            event[kTarget] = this;
            listener.call(this, event);
          };
        } else if (type === "open") {
          wrapper = function onOpen() {
            const event = new Event("open");
            event[kTarget] = this;
            listener.call(this, event);
          };
        } else {
          return;
        }
        wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
        wrapper[kListener] = listener;
        if (options.once) {
          this.once(type, wrapper);
        } else {
          this.on(type, wrapper);
        }
      },
      removeEventListener(type, handler) {
        for (const listener of this.listeners(type)) {
          if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            this.removeListener(type, listener);
            break;
          }
        }
      }
    };
    module2.exports = {
      CloseEvent,
      ErrorEvent,
      Event,
      EventTarget,
      MessageEvent
    };
  }
});

// node_modules/ws/lib/extension.js
var require_extension = __commonJS({
  "node_modules/ws/lib/extension.js"(exports, module2) {
    "use strict";
    var { tokenChars } = require_validation();
    function push(dest, name, elem) {
      if (dest[name] === void 0)
        dest[name] = [elem];
      else
        dest[name].push(elem);
    }
    function parse(header) {
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
            if (start === -1)
              start = i;
          } else if (i !== 0 && (code === 32 || code === 9)) {
            if (end === -1 && start !== -1)
              end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1)
              end = i;
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
            if (start === -1)
              start = i;
          } else if (code === 32 || code === 9) {
            if (end === -1 && start !== -1)
              end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1)
              end = i;
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
            if (start === -1)
              start = i;
            else if (!mustUnescape)
              mustUnescape = true;
            isEscaping = false;
          } else if (inQuotes) {
            if (tokenChars[code] === 1) {
              if (start === -1)
                start = i;
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
            if (start === -1)
              start = i;
          } else if (start !== -1 && (code === 32 || code === 9)) {
            if (end === -1)
              end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1)
              end = i;
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
      if (end === -1)
        end = i;
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
      return Object.keys(extensions).map((extension) => {
        let configurations = extensions[extension];
        if (!Array.isArray(configurations))
          configurations = [configurations];
        return configurations.map((params) => {
          return [extension].concat(Object.keys(params).map((k) => {
            let values = params[k];
            if (!Array.isArray(values))
              values = [values];
            return values.map((v) => v === true ? k : `${k}=${v}`).join("; ");
          })).join("; ");
        }).join(", ");
      }).join(", ");
    }
    module2.exports = { format, parse };
  }
});

// node_modules/ws/lib/websocket.js
var require_websocket = __commonJS({
  "node_modules/ws/lib/websocket.js"(exports, module2) {
    "use strict";
    var EventEmitter = require("events");
    var https = require("https");
    var http = require("http");
    var net = require("net");
    var tls = require("tls");
    var { randomBytes, createHash } = require("crypto");
    var { Readable } = require("stream");
    var { URL: URL2 } = require("url");
    var PerMessageDeflate = require_permessage_deflate();
    var Receiver = require_receiver();
    var Sender = require_sender();
    var {
      BINARY_TYPES,
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
    var { format, parse } = require_extension();
    var { toBuffer } = require_buffer_util();
    var closeTimeout = 30 * 1e3;
    var kAborted = Symbol("kAborted");
    var protocolVersions = [8, 13];
    var readyStates = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
    var subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
    var WebSocket2 = class extends EventEmitter {
      constructor(address, protocols, options) {
        super();
        this._binaryType = BINARY_TYPES[0];
        this._closeCode = 1006;
        this._closeFrameReceived = false;
        this._closeFrameSent = false;
        this._closeMessage = EMPTY_BUFFER;
        this._closeTimer = null;
        this._extensions = {};
        this._paused = false;
        this._protocol = "";
        this._readyState = WebSocket2.CONNECTING;
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
          this._isServer = true;
        }
      }
      get binaryType() {
        return this._binaryType;
      }
      set binaryType(type) {
        if (!BINARY_TYPES.includes(type))
          return;
        this._binaryType = type;
        if (this._receiver)
          this._receiver._binaryType = type;
      }
      get bufferedAmount() {
        if (!this._socket)
          return this._bufferedAmount;
        return this._socket._writableState.length + this._sender._bufferedBytes;
      }
      get extensions() {
        return Object.keys(this._extensions).join();
      }
      get isPaused() {
        return this._paused;
      }
      get onclose() {
        return null;
      }
      get onerror() {
        return null;
      }
      get onopen() {
        return null;
      }
      get onmessage() {
        return null;
      }
      get protocol() {
        return this._protocol;
      }
      get readyState() {
        return this._readyState;
      }
      get url() {
        return this._url;
      }
      setSocket(socket, head, options) {
        const receiver = new Receiver({
          binaryType: this.binaryType,
          extensions: this._extensions,
          isServer: this._isServer,
          maxPayload: options.maxPayload,
          skipUTF8Validation: options.skipUTF8Validation
        });
        this._sender = new Sender(socket, this._extensions, options.generateMask);
        this._receiver = receiver;
        this._socket = socket;
        receiver[kWebSocket] = this;
        socket[kWebSocket] = this;
        receiver.on("conclude", receiverOnConclude);
        receiver.on("drain", receiverOnDrain);
        receiver.on("error", receiverOnError);
        receiver.on("message", receiverOnMessage);
        receiver.on("ping", receiverOnPing);
        receiver.on("pong", receiverOnPong);
        socket.setTimeout(0);
        socket.setNoDelay();
        if (head.length > 0)
          socket.unshift(head);
        socket.on("close", socketOnClose);
        socket.on("data", socketOnData);
        socket.on("end", socketOnEnd);
        socket.on("error", socketOnError);
        this._readyState = WebSocket2.OPEN;
        this.emit("open");
      }
      emitClose() {
        if (!this._socket) {
          this._readyState = WebSocket2.CLOSED;
          this.emit("close", this._closeCode, this._closeMessage);
          return;
        }
        if (this._extensions[PerMessageDeflate.extensionName]) {
          this._extensions[PerMessageDeflate.extensionName].cleanup();
        }
        this._receiver.removeAllListeners();
        this._readyState = WebSocket2.CLOSED;
        this.emit("close", this._closeCode, this._closeMessage);
      }
      close(code, data) {
        if (this.readyState === WebSocket2.CLOSED)
          return;
        if (this.readyState === WebSocket2.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          return abortHandshake(this, this._req, msg);
        }
        if (this.readyState === WebSocket2.CLOSING) {
          if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) {
            this._socket.end();
          }
          return;
        }
        this._readyState = WebSocket2.CLOSING;
        this._sender.close(code, data, !this._isServer, (err) => {
          if (err)
            return;
          this._closeFrameSent = true;
          if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) {
            this._socket.end();
          }
        });
        this._closeTimer = setTimeout(this._socket.destroy.bind(this._socket), closeTimeout);
      }
      pause() {
        if (this.readyState === WebSocket2.CONNECTING || this.readyState === WebSocket2.CLOSED) {
          return;
        }
        this._paused = true;
        this._socket.pause();
      }
      ping(data, mask, cb) {
        if (this.readyState === WebSocket2.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number")
          data = data.toString();
        if (this.readyState !== WebSocket2.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0)
          mask = !this._isServer;
        this._sender.ping(data || EMPTY_BUFFER, mask, cb);
      }
      pong(data, mask, cb) {
        if (this.readyState === WebSocket2.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number")
          data = data.toString();
        if (this.readyState !== WebSocket2.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0)
          mask = !this._isServer;
        this._sender.pong(data || EMPTY_BUFFER, mask, cb);
      }
      resume() {
        if (this.readyState === WebSocket2.CONNECTING || this.readyState === WebSocket2.CLOSED) {
          return;
        }
        this._paused = false;
        if (!this._receiver._writableState.needDrain)
          this._socket.resume();
      }
      send(data, options, cb) {
        if (this.readyState === WebSocket2.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof options === "function") {
          cb = options;
          options = {};
        }
        if (typeof data === "number")
          data = data.toString();
        if (this.readyState !== WebSocket2.OPEN) {
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
        if (!this._extensions[PerMessageDeflate.extensionName]) {
          opts.compress = false;
        }
        this._sender.send(data || EMPTY_BUFFER, opts, cb);
      }
      terminate() {
        if (this.readyState === WebSocket2.CLOSED)
          return;
        if (this.readyState === WebSocket2.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          return abortHandshake(this, this._req, msg);
        }
        if (this._socket) {
          this._readyState = WebSocket2.CLOSING;
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
            if (listener[kForOnEventAttribute])
              return listener[kListener];
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
          if (typeof handler !== "function")
            return;
          this.addEventListener(method, handler, {
            [kForOnEventAttribute]: true
          });
        }
      });
    });
    WebSocket2.prototype.addEventListener = addEventListener;
    WebSocket2.prototype.removeEventListener = removeEventListener;
    module2.exports = WebSocket2;
    function initAsClient(websocket, address, protocols, options) {
      const opts = {
        protocolVersion: protocolVersions[1],
        maxPayload: 100 * 1024 * 1024,
        skipUTF8Validation: false,
        perMessageDeflate: true,
        followRedirects: false,
        maxRedirects: 10,
        ...options,
        createConnection: void 0,
        socketPath: void 0,
        hostname: void 0,
        protocol: void 0,
        timeout: void 0,
        method: "GET",
        host: void 0,
        path: void 0,
        port: void 0
      };
      if (!protocolVersions.includes(opts.protocolVersion)) {
        throw new RangeError(`Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`);
      }
      let parsedUrl;
      if (address instanceof URL2) {
        parsedUrl = address;
        websocket._url = address.href;
      } else {
        try {
          parsedUrl = new URL2(address);
        } catch (e) {
          throw new SyntaxError(`Invalid URL: ${address}`);
        }
        websocket._url = address;
      }
      const isSecure = parsedUrl.protocol === "wss:";
      const isUnixSocket = parsedUrl.protocol === "ws+unix:";
      let invalidURLMessage;
      if (parsedUrl.protocol !== "ws:" && !isSecure && !isUnixSocket) {
        invalidURLMessage = `The URL's protocol must be one of "ws:", "wss:", or "ws+unix:"`;
      } else if (isUnixSocket && !parsedUrl.pathname) {
        invalidURLMessage = "The URL's pathname is empty";
      } else if (parsedUrl.hash) {
        invalidURLMessage = "The URL contains a fragment identifier";
      }
      if (invalidURLMessage) {
        const err = new SyntaxError(invalidURLMessage);
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
      opts.createConnection = isSecure ? tlsConnect : netConnect;
      opts.defaultPort = opts.defaultPort || defaultPort;
      opts.port = parsedUrl.port || defaultPort;
      opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
      opts.headers = {
        "Sec-WebSocket-Version": opts.protocolVersion,
        "Sec-WebSocket-Key": key,
        Connection: "Upgrade",
        Upgrade: "websocket",
        ...opts.headers
      };
      opts.path = parsedUrl.pathname + parsedUrl.search;
      opts.timeout = opts.handshakeTimeout;
      if (opts.perMessageDeflate) {
        perMessageDeflate = new PerMessageDeflate(opts.perMessageDeflate !== true ? opts.perMessageDeflate : {}, false, opts.maxPayload);
        opts.headers["Sec-WebSocket-Extensions"] = format({
          [PerMessageDeflate.extensionName]: perMessageDeflate.offer()
        });
      }
      if (protocols.length) {
        for (const protocol of protocols) {
          if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) {
            throw new SyntaxError("An invalid or duplicated subprotocol was specified");
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
      if (isUnixSocket) {
        const parts = opts.path.split(":");
        opts.socketPath = parts[0];
        opts.path = parts[1];
      }
      let req;
      if (opts.followRedirects) {
        if (websocket._redirects === 0) {
          websocket._originalSecure = isSecure;
          websocket._originalHost = parsedUrl.host;
          const headers = options && options.headers;
          options = { ...options, headers: {} };
          if (headers) {
            for (const [key2, value] of Object.entries(headers)) {
              options.headers[key2.toLowerCase()] = value;
            }
          }
        } else if (websocket.listenerCount("redirect") === 0) {
          const isSameHost = parsedUrl.host === websocket._originalHost;
          if (!isSameHost || websocket._originalSecure && !isSecure) {
            delete opts.headers.authorization;
            delete opts.headers.cookie;
            if (!isSameHost)
              delete opts.headers.host;
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
        if (req === null || req[kAborted])
          return;
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
          abortHandshake(websocket, req, `Unexpected server response: ${res.statusCode}`);
        }
      });
      req.on("upgrade", (res, socket, head) => {
        websocket.emit("upgrade", res);
        if (websocket.readyState !== WebSocket2.CONNECTING)
          return;
        req = websocket._req = null;
        if (res.headers.upgrade.toLowerCase() !== "websocket") {
          abortHandshake(websocket, socket, "Invalid Upgrade header");
          return;
        }
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        if (res.headers["sec-websocket-accept"] !== digest) {
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
        if (serverProt)
          websocket._protocol = serverProt;
        const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
        if (secWebSocketExtensions !== void 0) {
          if (!perMessageDeflate) {
            const message = "Server sent a Sec-WebSocket-Extensions header but no extension was requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          let extensions;
          try {
            extensions = parse(secWebSocketExtensions);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          const extensionNames = Object.keys(extensions);
          if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate.extensionName) {
            const message = "Server indicated an extension that was not requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          try {
            perMessageDeflate.accept(extensions[PerMessageDeflate.extensionName]);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          websocket._extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
        }
        websocket.setSocket(socket, head, {
          generateMask: opts.generateMask,
          maxPayload: opts.maxPayload,
          skipUTF8Validation: opts.skipUTF8Validation
        });
      });
      req.end();
    }
    function emitErrorAndClose(websocket, err) {
      websocket._readyState = WebSocket2.CLOSING;
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
        const length = toBuffer(data).length;
        if (websocket._socket)
          websocket._sender._bufferedBytes += length;
        else
          websocket._bufferedAmount += length;
      }
      if (cb) {
        const err = new Error(`WebSocket is not open: readyState ${websocket.readyState} (${readyStates[websocket.readyState]})`);
        cb(err);
      }
    }
    function receiverOnConclude(code, reason) {
      const websocket = this[kWebSocket];
      websocket._closeFrameReceived = true;
      websocket._closeMessage = reason;
      websocket._closeCode = code;
      if (websocket._socket[kWebSocket] === void 0)
        return;
      websocket._socket.removeListener("data", socketOnData);
      process.nextTick(resume, websocket._socket);
      if (code === 1005)
        websocket.close();
      else
        websocket.close(code, reason);
    }
    function receiverOnDrain() {
      const websocket = this[kWebSocket];
      if (!websocket.isPaused)
        websocket._socket.resume();
    }
    function receiverOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket._socket[kWebSocket] !== void 0) {
        websocket._socket.removeListener("data", socketOnData);
        process.nextTick(resume, websocket._socket);
        websocket.close(err[kStatusCode]);
      }
      websocket.emit("error", err);
    }
    function receiverOnFinish() {
      this[kWebSocket].emitClose();
    }
    function receiverOnMessage(data, isBinary) {
      this[kWebSocket].emit("message", data, isBinary);
    }
    function receiverOnPing(data) {
      const websocket = this[kWebSocket];
      websocket.pong(data, !websocket._isServer, NOOP);
      websocket.emit("ping", data);
    }
    function receiverOnPong(data) {
      this[kWebSocket].emit("pong", data);
    }
    function resume(stream) {
      stream.resume();
    }
    function socketOnClose() {
      const websocket = this[kWebSocket];
      this.removeListener("close", socketOnClose);
      this.removeListener("data", socketOnData);
      this.removeListener("end", socketOnEnd);
      websocket._readyState = WebSocket2.CLOSING;
      let chunk;
      if (!this._readableState.endEmitted && !websocket._closeFrameReceived && !websocket._receiver._writableState.errorEmitted && (chunk = websocket._socket.read()) !== null) {
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

// node_modules/ws/lib/stream.js
var require_stream = __commonJS({
  "node_modules/ws/lib/stream.js"(exports, module2) {
    "use strict";
    var { Duplex } = require("stream");
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
    function createWebSocketStream(ws2, options) {
      let terminateOnDestroy = true;
      const duplex = new Duplex({
        ...options,
        autoDestroy: false,
        emitClose: false,
        objectMode: false,
        writableObjectMode: false
      });
      ws2.on("message", function message(msg, isBinary) {
        const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
        if (!duplex.push(data))
          ws2.pause();
      });
      ws2.once("error", function error(err) {
        if (duplex.destroyed)
          return;
        terminateOnDestroy = false;
        duplex.destroy(err);
      });
      ws2.once("close", function close() {
        if (duplex.destroyed)
          return;
        duplex.push(null);
      });
      duplex._destroy = function(err, callback) {
        if (ws2.readyState === ws2.CLOSED) {
          callback(err);
          process.nextTick(emitClose, duplex);
          return;
        }
        let called = false;
        ws2.once("error", function error(err2) {
          called = true;
          callback(err2);
        });
        ws2.once("close", function close() {
          if (!called)
            callback(err);
          process.nextTick(emitClose, duplex);
        });
        if (terminateOnDestroy)
          ws2.terminate();
      };
      duplex._final = function(callback) {
        if (ws2.readyState === ws2.CONNECTING) {
          ws2.once("open", function open() {
            duplex._final(callback);
          });
          return;
        }
        if (ws2._socket === null)
          return;
        if (ws2._socket._writableState.finished) {
          callback();
          if (duplex._readableState.endEmitted)
            duplex.destroy();
        } else {
          ws2._socket.once("finish", function finish() {
            callback();
          });
          ws2.close();
        }
      };
      duplex._read = function() {
        if (ws2.isPaused)
          ws2.resume();
      };
      duplex._write = function(chunk, encoding, callback) {
        if (ws2.readyState === ws2.CONNECTING) {
          ws2.once("open", function open() {
            duplex._write(chunk, encoding, callback);
          });
          return;
        }
        ws2.send(chunk, callback);
      };
      duplex.on("end", duplexOnEnd);
      duplex.on("error", duplexOnError);
      return duplex;
    }
    module2.exports = createWebSocketStream;
  }
});

// node_modules/ws/lib/subprotocol.js
var require_subprotocol = __commonJS({
  "node_modules/ws/lib/subprotocol.js"(exports, module2) {
    "use strict";
    var { tokenChars } = require_validation();
    function parse(header) {
      const protocols = /* @__PURE__ */ new Set();
      let start = -1;
      let end = -1;
      let i = 0;
      for (i; i < header.length; i++) {
        const code = header.charCodeAt(i);
        if (end === -1 && tokenChars[code] === 1) {
          if (start === -1)
            start = i;
        } else if (i !== 0 && (code === 32 || code === 9)) {
          if (end === -1 && start !== -1)
            end = i;
        } else if (code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1)
            end = i;
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
    module2.exports = { parse };
  }
});

// node_modules/ws/lib/websocket-server.js
var require_websocket_server = __commonJS({
  "node_modules/ws/lib/websocket-server.js"(exports, module2) {
    "use strict";
    var EventEmitter = require("events");
    var http = require("http");
    var https = require("https");
    var net = require("net");
    var tls = require("tls");
    var { createHash } = require("crypto");
    var extension = require_extension();
    var PerMessageDeflate = require_permessage_deflate();
    var subprotocol = require_subprotocol();
    var WebSocket2 = require_websocket();
    var { GUID, kWebSocket } = require_constants();
    var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
    var RUNNING = 0;
    var CLOSING = 1;
    var CLOSED = 2;
    var WebSocketServer = class extends EventEmitter {
      constructor(options, callback) {
        super();
        options = {
          maxPayload: 100 * 1024 * 1024,
          skipUTF8Validation: false,
          perMessageDeflate: false,
          handleProtocols: null,
          clientTracking: true,
          verifyClient: null,
          noServer: false,
          backlog: null,
          server: null,
          host: null,
          path: null,
          port: null,
          WebSocket: WebSocket2,
          ...options
        };
        if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) {
          throw new TypeError('One and only one of the "port", "server", or "noServer" options must be specified');
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
          this._server.listen(options.port, options.host, options.backlog, callback);
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
        if (options.perMessageDeflate === true)
          options.perMessageDeflate = {};
        if (options.clientTracking) {
          this.clients = /* @__PURE__ */ new Set();
          this._shouldEmitClose = false;
        }
        this.options = options;
        this._state = RUNNING;
      }
      address() {
        if (this.options.noServer) {
          throw new Error('The server is operating in "noServer" mode');
        }
        if (!this._server)
          return null;
        return this._server.address();
      }
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
        if (cb)
          this.once("close", cb);
        if (this._state === CLOSING)
          return;
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
      shouldHandle(req) {
        if (this.options.path) {
          const index = req.url.indexOf("?");
          const pathname = index !== -1 ? req.url.slice(0, index) : req.url;
          if (pathname !== this.options.path)
            return false;
        }
        return true;
      }
      handleUpgrade(req, socket, head, cb) {
        socket.on("error", socketOnError);
        const key = req.headers["sec-websocket-key"];
        const version2 = +req.headers["sec-websocket-version"];
        if (req.method !== "GET") {
          const message = "Invalid HTTP method";
          abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
          return;
        }
        if (req.headers.upgrade.toLowerCase() !== "websocket") {
          const message = "Invalid Upgrade header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (!key || !keyRegex.test(key)) {
          const message = "Missing or invalid Sec-WebSocket-Key header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (version2 !== 8 && version2 !== 13) {
          const message = "Missing or invalid Sec-WebSocket-Version header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
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
            protocols = subprotocol.parse(secWebSocketProtocol);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Protocol header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
        const extensions = {};
        if (this.options.perMessageDeflate && secWebSocketExtensions !== void 0) {
          const perMessageDeflate = new PerMessageDeflate(this.options.perMessageDeflate, true, this.options.maxPayload);
          try {
            const offers = extension.parse(secWebSocketExtensions);
            if (offers[PerMessageDeflate.extensionName]) {
              perMessageDeflate.accept(offers[PerMessageDeflate.extensionName]);
              extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
            }
          } catch (err) {
            const message = "Invalid or unacceptable Sec-WebSocket-Extensions header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        if (this.options.verifyClient) {
          const info = {
            origin: req.headers[`${version2 === 8 ? "sec-websocket-origin" : "origin"}`],
            secure: !!(req.socket.authorized || req.socket.encrypted),
            req
          };
          if (this.options.verifyClient.length === 2) {
            this.options.verifyClient(info, (verified, code, message, headers) => {
              if (!verified) {
                return abortHandshake(socket, code || 401, message, headers);
              }
              this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
            });
            return;
          }
          if (!this.options.verifyClient(info))
            return abortHandshake(socket, 401);
        }
        this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
      }
      completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
        if (!socket.readable || !socket.writable)
          return socket.destroy();
        if (socket[kWebSocket]) {
          throw new Error("server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration");
        }
        if (this._state > RUNNING)
          return abortHandshake(socket, 503);
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        const headers = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Accept: ${digest}`
        ];
        const ws2 = new this.options.WebSocket(null);
        if (protocols.size) {
          const protocol = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
          if (protocol) {
            headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
            ws2._protocol = protocol;
          }
        }
        if (extensions[PerMessageDeflate.extensionName]) {
          const params = extensions[PerMessageDeflate.extensionName].params;
          const value = extension.format({
            [PerMessageDeflate.extensionName]: [params]
          });
          headers.push(`Sec-WebSocket-Extensions: ${value}`);
          ws2._extensions = extensions;
        }
        this.emit("headers", headers, req);
        socket.write(headers.concat("\r\n").join("\r\n"));
        socket.removeListener("error", socketOnError);
        ws2.setSocket(socket, head, {
          maxPayload: this.options.maxPayload,
          skipUTF8Validation: this.options.skipUTF8Validation
        });
        if (this.clients) {
          this.clients.add(ws2);
          ws2.on("close", () => {
            this.clients.delete(ws2);
            if (this._shouldEmitClose && !this.clients.size) {
              process.nextTick(emitClose, this);
            }
          });
        }
        cb(ws2, req);
      }
    };
    module2.exports = WebSocketServer;
    function addListeners(server, map) {
      for (const event of Object.keys(map))
        server.on(event, map[event]);
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
      socket.end(`HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r
` + Object.keys(headers).map((h) => `${h}: ${headers[h]}`).join("\r\n") + "\r\n\r\n" + message);
    }
    function abortHandshakeOrEmitwsClientError(server, req, socket, code, message) {
      if (server.listenerCount("wsClientError")) {
        const err = new Error(message);
        Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);
        server.emit("wsClientError", err, socket, req);
      } else {
        abortHandshake(socket, code, message);
      }
    }
  }
});

// node_modules/ws/index.js
var require_ws = __commonJS({
  "node_modules/ws/index.js"(exports, module2) {
    "use strict";
    var WebSocket2 = require_websocket();
    WebSocket2.createWebSocketStream = require_stream();
    WebSocket2.Server = require_websocket_server();
    WebSocket2.Receiver = require_receiver();
    WebSocket2.Sender = require_sender();
    WebSocket2.WebSocket = WebSocket2;
    WebSocket2.WebSocketServer = WebSocket2.Server;
    module2.exports = WebSocket2;
  }
});

// node_modules/primus/parsers/json.js
var require_json = __commonJS({
  "node_modules/primus/parsers/json.js"(exports) {
    "use strict";
    exports.encoder = function encoder(data, fn) {
      var err;
      try {
        data = JSON.stringify(data);
      } catch (e) {
        err = e;
      }
      fn(err, data);
    };
    exports.decoder = function decoder(data, fn) {
      var err;
      if ("string" !== typeof data)
        return fn(err, data);
      try {
        data = JSON.parse(data);
      } catch (e) {
        err = e;
      }
      fn(err, data);
    };
  }
});

// node_modules/diagnostics/diagnostics.js
var require_diagnostics = __commonJS({
  "node_modules/diagnostics/diagnostics.js"(exports, module2) {
    var adapters = [];
    var modifiers = [];
    var logger = function devnull() {
    };
    function use(adapter) {
      if (~adapters.indexOf(adapter))
        return false;
      adapters.push(adapter);
      return true;
    }
    function set(custom) {
      logger = custom;
    }
    function enabled(namespace) {
      var async = [];
      for (var i = 0; i < adapters.length; i++) {
        if (adapters[i].async) {
          async.push(adapters[i]);
          continue;
        }
        if (adapters[i](namespace))
          return true;
      }
      if (!async.length)
        return false;
      return new Promise(function pinky(resolve) {
        Promise.all(async.map(function prebind(fn) {
          return fn(namespace);
        })).then(function resolved(values) {
          resolve(values.some(Boolean));
        });
      });
    }
    function modify(fn) {
      if (~modifiers.indexOf(fn))
        return false;
      modifiers.push(fn);
      return true;
    }
    function write() {
      logger.apply(logger, arguments);
    }
    function process2(message) {
      for (var i = 0; i < modifiers.length; i++) {
        message = modifiers[i].apply(modifiers[i], arguments);
      }
      return message;
    }
    function introduce(fn, options) {
      var has = Object.prototype.hasOwnProperty;
      for (var key in options) {
        if (has.call(options, key)) {
          fn[key] = options[key];
        }
      }
      return fn;
    }
    function nope(options) {
      options.enabled = false;
      options.modify = modify;
      options.set = set;
      options.use = use;
      return introduce(function diagnopes() {
        return false;
      }, options);
    }
    function yep(options) {
      function diagnostics() {
        var args = Array.prototype.slice.call(arguments, 0);
        write.call(write, options, process2(args, options));
        return true;
      }
      options.enabled = true;
      options.modify = modify;
      options.set = set;
      options.use = use;
      return introduce(diagnostics, options);
    }
    module2.exports = function create(diagnostics) {
      diagnostics.introduce = introduce;
      diagnostics.enabled = enabled;
      diagnostics.process = process2;
      diagnostics.modify = modify;
      diagnostics.write = write;
      diagnostics.nope = nope;
      diagnostics.yep = yep;
      diagnostics.set = set;
      diagnostics.use = use;
      return diagnostics;
    };
  }
});

// node_modules/diagnostics/node/production.js
var require_production = __commonJS({
  "node_modules/diagnostics/node/production.js"(exports, module2) {
    var create = require_diagnostics();
    var diagnostics = create(function prod(namespace, options) {
      options = options || {};
      options.namespace = namespace;
      options.prod = true;
      options.dev = false;
      if (!(options.force || prod.force))
        return prod.nope(options);
      return prod.yep(options);
    });
    module2.exports = diagnostics;
  }
});

// node_modules/color-name/index.js
var require_color_name = __commonJS({
  "node_modules/color-name/index.js"(exports, module2) {
    "use strict";
    module2.exports = {
      "aliceblue": [240, 248, 255],
      "antiquewhite": [250, 235, 215],
      "aqua": [0, 255, 255],
      "aquamarine": [127, 255, 212],
      "azure": [240, 255, 255],
      "beige": [245, 245, 220],
      "bisque": [255, 228, 196],
      "black": [0, 0, 0],
      "blanchedalmond": [255, 235, 205],
      "blue": [0, 0, 255],
      "blueviolet": [138, 43, 226],
      "brown": [165, 42, 42],
      "burlywood": [222, 184, 135],
      "cadetblue": [95, 158, 160],
      "chartreuse": [127, 255, 0],
      "chocolate": [210, 105, 30],
      "coral": [255, 127, 80],
      "cornflowerblue": [100, 149, 237],
      "cornsilk": [255, 248, 220],
      "crimson": [220, 20, 60],
      "cyan": [0, 255, 255],
      "darkblue": [0, 0, 139],
      "darkcyan": [0, 139, 139],
      "darkgoldenrod": [184, 134, 11],
      "darkgray": [169, 169, 169],
      "darkgreen": [0, 100, 0],
      "darkgrey": [169, 169, 169],
      "darkkhaki": [189, 183, 107],
      "darkmagenta": [139, 0, 139],
      "darkolivegreen": [85, 107, 47],
      "darkorange": [255, 140, 0],
      "darkorchid": [153, 50, 204],
      "darkred": [139, 0, 0],
      "darksalmon": [233, 150, 122],
      "darkseagreen": [143, 188, 143],
      "darkslateblue": [72, 61, 139],
      "darkslategray": [47, 79, 79],
      "darkslategrey": [47, 79, 79],
      "darkturquoise": [0, 206, 209],
      "darkviolet": [148, 0, 211],
      "deeppink": [255, 20, 147],
      "deepskyblue": [0, 191, 255],
      "dimgray": [105, 105, 105],
      "dimgrey": [105, 105, 105],
      "dodgerblue": [30, 144, 255],
      "firebrick": [178, 34, 34],
      "floralwhite": [255, 250, 240],
      "forestgreen": [34, 139, 34],
      "fuchsia": [255, 0, 255],
      "gainsboro": [220, 220, 220],
      "ghostwhite": [248, 248, 255],
      "gold": [255, 215, 0],
      "goldenrod": [218, 165, 32],
      "gray": [128, 128, 128],
      "green": [0, 128, 0],
      "greenyellow": [173, 255, 47],
      "grey": [128, 128, 128],
      "honeydew": [240, 255, 240],
      "hotpink": [255, 105, 180],
      "indianred": [205, 92, 92],
      "indigo": [75, 0, 130],
      "ivory": [255, 255, 240],
      "khaki": [240, 230, 140],
      "lavender": [230, 230, 250],
      "lavenderblush": [255, 240, 245],
      "lawngreen": [124, 252, 0],
      "lemonchiffon": [255, 250, 205],
      "lightblue": [173, 216, 230],
      "lightcoral": [240, 128, 128],
      "lightcyan": [224, 255, 255],
      "lightgoldenrodyellow": [250, 250, 210],
      "lightgray": [211, 211, 211],
      "lightgreen": [144, 238, 144],
      "lightgrey": [211, 211, 211],
      "lightpink": [255, 182, 193],
      "lightsalmon": [255, 160, 122],
      "lightseagreen": [32, 178, 170],
      "lightskyblue": [135, 206, 250],
      "lightslategray": [119, 136, 153],
      "lightslategrey": [119, 136, 153],
      "lightsteelblue": [176, 196, 222],
      "lightyellow": [255, 255, 224],
      "lime": [0, 255, 0],
      "limegreen": [50, 205, 50],
      "linen": [250, 240, 230],
      "magenta": [255, 0, 255],
      "maroon": [128, 0, 0],
      "mediumaquamarine": [102, 205, 170],
      "mediumblue": [0, 0, 205],
      "mediumorchid": [186, 85, 211],
      "mediumpurple": [147, 112, 219],
      "mediumseagreen": [60, 179, 113],
      "mediumslateblue": [123, 104, 238],
      "mediumspringgreen": [0, 250, 154],
      "mediumturquoise": [72, 209, 204],
      "mediumvioletred": [199, 21, 133],
      "midnightblue": [25, 25, 112],
      "mintcream": [245, 255, 250],
      "mistyrose": [255, 228, 225],
      "moccasin": [255, 228, 181],
      "navajowhite": [255, 222, 173],
      "navy": [0, 0, 128],
      "oldlace": [253, 245, 230],
      "olive": [128, 128, 0],
      "olivedrab": [107, 142, 35],
      "orange": [255, 165, 0],
      "orangered": [255, 69, 0],
      "orchid": [218, 112, 214],
      "palegoldenrod": [238, 232, 170],
      "palegreen": [152, 251, 152],
      "paleturquoise": [175, 238, 238],
      "palevioletred": [219, 112, 147],
      "papayawhip": [255, 239, 213],
      "peachpuff": [255, 218, 185],
      "peru": [205, 133, 63],
      "pink": [255, 192, 203],
      "plum": [221, 160, 221],
      "powderblue": [176, 224, 230],
      "purple": [128, 0, 128],
      "rebeccapurple": [102, 51, 153],
      "red": [255, 0, 0],
      "rosybrown": [188, 143, 143],
      "royalblue": [65, 105, 225],
      "saddlebrown": [139, 69, 19],
      "salmon": [250, 128, 114],
      "sandybrown": [244, 164, 96],
      "seagreen": [46, 139, 87],
      "seashell": [255, 245, 238],
      "sienna": [160, 82, 45],
      "silver": [192, 192, 192],
      "skyblue": [135, 206, 235],
      "slateblue": [106, 90, 205],
      "slategray": [112, 128, 144],
      "slategrey": [112, 128, 144],
      "snow": [255, 250, 250],
      "springgreen": [0, 255, 127],
      "steelblue": [70, 130, 180],
      "tan": [210, 180, 140],
      "teal": [0, 128, 128],
      "thistle": [216, 191, 216],
      "tomato": [255, 99, 71],
      "turquoise": [64, 224, 208],
      "violet": [238, 130, 238],
      "wheat": [245, 222, 179],
      "white": [255, 255, 255],
      "whitesmoke": [245, 245, 245],
      "yellow": [255, 255, 0],
      "yellowgreen": [154, 205, 50]
    };
  }
});

// node_modules/simple-swizzle/node_modules/is-arrayish/index.js
var require_is_arrayish = __commonJS({
  "node_modules/simple-swizzle/node_modules/is-arrayish/index.js"(exports, module2) {
    module2.exports = function isArrayish(obj) {
      if (!obj || typeof obj === "string") {
        return false;
      }
      return obj instanceof Array || Array.isArray(obj) || obj.length >= 0 && (obj.splice instanceof Function || Object.getOwnPropertyDescriptor(obj, obj.length - 1) && obj.constructor.name !== "String");
    };
  }
});

// node_modules/simple-swizzle/index.js
var require_simple_swizzle = __commonJS({
  "node_modules/simple-swizzle/index.js"(exports, module2) {
    "use strict";
    var isArrayish = require_is_arrayish();
    var concat = Array.prototype.concat;
    var slice = Array.prototype.slice;
    var swizzle = module2.exports = function swizzle2(args) {
      var results = [];
      for (var i = 0, len = args.length; i < len; i++) {
        var arg = args[i];
        if (isArrayish(arg)) {
          results = concat.call(results, slice.call(arg));
        } else {
          results.push(arg);
        }
      }
      return results;
    };
    swizzle.wrap = function(fn) {
      return function() {
        return fn(swizzle(arguments));
      };
    };
  }
});

// node_modules/color-string/index.js
var require_color_string = __commonJS({
  "node_modules/color-string/index.js"(exports, module2) {
    var colorNames = require_color_name();
    var swizzle = require_simple_swizzle();
    var hasOwnProperty = Object.hasOwnProperty;
    var reverseNames = /* @__PURE__ */ Object.create(null);
    for (name in colorNames) {
      if (hasOwnProperty.call(colorNames, name)) {
        reverseNames[colorNames[name]] = name;
      }
    }
    var name;
    var cs = module2.exports = {
      to: {},
      get: {}
    };
    cs.get = function(string) {
      var prefix = string.substring(0, 3).toLowerCase();
      var val;
      var model;
      switch (prefix) {
        case "hsl":
          val = cs.get.hsl(string);
          model = "hsl";
          break;
        case "hwb":
          val = cs.get.hwb(string);
          model = "hwb";
          break;
        default:
          val = cs.get.rgb(string);
          model = "rgb";
          break;
      }
      if (!val) {
        return null;
      }
      return { model, value: val };
    };
    cs.get.rgb = function(string) {
      if (!string) {
        return null;
      }
      var abbr = /^#([a-f0-9]{3,4})$/i;
      var hex = /^#([a-f0-9]{6})([a-f0-9]{2})?$/i;
      var rgba = /^rgba?\(\s*([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)\s*(?:[,|\/]\s*([+-]?[\d\.]+)(%?)\s*)?\)$/;
      var per = /^rgba?\(\s*([+-]?[\d\.]+)\%\s*,?\s*([+-]?[\d\.]+)\%\s*,?\s*([+-]?[\d\.]+)\%\s*(?:[,|\/]\s*([+-]?[\d\.]+)(%?)\s*)?\)$/;
      var keyword = /^(\w+)$/;
      var rgb = [0, 0, 0, 1];
      var match;
      var i;
      var hexAlpha;
      if (match = string.match(hex)) {
        hexAlpha = match[2];
        match = match[1];
        for (i = 0; i < 3; i++) {
          var i2 = i * 2;
          rgb[i] = parseInt(match.slice(i2, i2 + 2), 16);
        }
        if (hexAlpha) {
          rgb[3] = parseInt(hexAlpha, 16) / 255;
        }
      } else if (match = string.match(abbr)) {
        match = match[1];
        hexAlpha = match[3];
        for (i = 0; i < 3; i++) {
          rgb[i] = parseInt(match[i] + match[i], 16);
        }
        if (hexAlpha) {
          rgb[3] = parseInt(hexAlpha + hexAlpha, 16) / 255;
        }
      } else if (match = string.match(rgba)) {
        for (i = 0; i < 3; i++) {
          rgb[i] = parseInt(match[i + 1], 0);
        }
        if (match[4]) {
          if (match[5]) {
            rgb[3] = parseFloat(match[4]) * 0.01;
          } else {
            rgb[3] = parseFloat(match[4]);
          }
        }
      } else if (match = string.match(per)) {
        for (i = 0; i < 3; i++) {
          rgb[i] = Math.round(parseFloat(match[i + 1]) * 2.55);
        }
        if (match[4]) {
          if (match[5]) {
            rgb[3] = parseFloat(match[4]) * 0.01;
          } else {
            rgb[3] = parseFloat(match[4]);
          }
        }
      } else if (match = string.match(keyword)) {
        if (match[1] === "transparent") {
          return [0, 0, 0, 0];
        }
        if (!hasOwnProperty.call(colorNames, match[1])) {
          return null;
        }
        rgb = colorNames[match[1]];
        rgb[3] = 1;
        return rgb;
      } else {
        return null;
      }
      for (i = 0; i < 3; i++) {
        rgb[i] = clamp(rgb[i], 0, 255);
      }
      rgb[3] = clamp(rgb[3], 0, 1);
      return rgb;
    };
    cs.get.hsl = function(string) {
      if (!string) {
        return null;
      }
      var hsl = /^hsla?\(\s*([+-]?(?:\d{0,3}\.)?\d+)(?:deg)?\s*,?\s*([+-]?[\d\.]+)%\s*,?\s*([+-]?[\d\.]+)%\s*(?:[,|\/]\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/;
      var match = string.match(hsl);
      if (match) {
        var alpha = parseFloat(match[4]);
        var h = (parseFloat(match[1]) % 360 + 360) % 360;
        var s = clamp(parseFloat(match[2]), 0, 100);
        var l = clamp(parseFloat(match[3]), 0, 100);
        var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);
        return [h, s, l, a];
      }
      return null;
    };
    cs.get.hwb = function(string) {
      if (!string) {
        return null;
      }
      var hwb = /^hwb\(\s*([+-]?\d{0,3}(?:\.\d+)?)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/;
      var match = string.match(hwb);
      if (match) {
        var alpha = parseFloat(match[4]);
        var h = (parseFloat(match[1]) % 360 + 360) % 360;
        var w = clamp(parseFloat(match[2]), 0, 100);
        var b = clamp(parseFloat(match[3]), 0, 100);
        var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);
        return [h, w, b, a];
      }
      return null;
    };
    cs.to.hex = function() {
      var rgba = swizzle(arguments);
      return "#" + hexDouble(rgba[0]) + hexDouble(rgba[1]) + hexDouble(rgba[2]) + (rgba[3] < 1 ? hexDouble(Math.round(rgba[3] * 255)) : "");
    };
    cs.to.rgb = function() {
      var rgba = swizzle(arguments);
      return rgba.length < 4 || rgba[3] === 1 ? "rgb(" + Math.round(rgba[0]) + ", " + Math.round(rgba[1]) + ", " + Math.round(rgba[2]) + ")" : "rgba(" + Math.round(rgba[0]) + ", " + Math.round(rgba[1]) + ", " + Math.round(rgba[2]) + ", " + rgba[3] + ")";
    };
    cs.to.rgb.percent = function() {
      var rgba = swizzle(arguments);
      var r = Math.round(rgba[0] / 255 * 100);
      var g = Math.round(rgba[1] / 255 * 100);
      var b = Math.round(rgba[2] / 255 * 100);
      return rgba.length < 4 || rgba[3] === 1 ? "rgb(" + r + "%, " + g + "%, " + b + "%)" : "rgba(" + r + "%, " + g + "%, " + b + "%, " + rgba[3] + ")";
    };
    cs.to.hsl = function() {
      var hsla = swizzle(arguments);
      return hsla.length < 4 || hsla[3] === 1 ? "hsl(" + hsla[0] + ", " + hsla[1] + "%, " + hsla[2] + "%)" : "hsla(" + hsla[0] + ", " + hsla[1] + "%, " + hsla[2] + "%, " + hsla[3] + ")";
    };
    cs.to.hwb = function() {
      var hwba = swizzle(arguments);
      var a = "";
      if (hwba.length >= 4 && hwba[3] !== 1) {
        a = ", " + hwba[3];
      }
      return "hwb(" + hwba[0] + ", " + hwba[1] + "%, " + hwba[2] + "%" + a + ")";
    };
    cs.to.keyword = function(rgb) {
      return reverseNames[rgb.slice(0, 3)];
    };
    function clamp(num, min, max) {
      return Math.min(Math.max(min, num), max);
    }
    function hexDouble(num) {
      var str = Math.round(num).toString(16).toUpperCase();
      return str.length < 2 ? "0" + str : str;
    }
  }
});

// node_modules/color-convert/node_modules/color-name/index.js
var require_color_name2 = __commonJS({
  "node_modules/color-convert/node_modules/color-name/index.js"(exports, module2) {
    "use strict";
    module2.exports = {
      "aliceblue": [240, 248, 255],
      "antiquewhite": [250, 235, 215],
      "aqua": [0, 255, 255],
      "aquamarine": [127, 255, 212],
      "azure": [240, 255, 255],
      "beige": [245, 245, 220],
      "bisque": [255, 228, 196],
      "black": [0, 0, 0],
      "blanchedalmond": [255, 235, 205],
      "blue": [0, 0, 255],
      "blueviolet": [138, 43, 226],
      "brown": [165, 42, 42],
      "burlywood": [222, 184, 135],
      "cadetblue": [95, 158, 160],
      "chartreuse": [127, 255, 0],
      "chocolate": [210, 105, 30],
      "coral": [255, 127, 80],
      "cornflowerblue": [100, 149, 237],
      "cornsilk": [255, 248, 220],
      "crimson": [220, 20, 60],
      "cyan": [0, 255, 255],
      "darkblue": [0, 0, 139],
      "darkcyan": [0, 139, 139],
      "darkgoldenrod": [184, 134, 11],
      "darkgray": [169, 169, 169],
      "darkgreen": [0, 100, 0],
      "darkgrey": [169, 169, 169],
      "darkkhaki": [189, 183, 107],
      "darkmagenta": [139, 0, 139],
      "darkolivegreen": [85, 107, 47],
      "darkorange": [255, 140, 0],
      "darkorchid": [153, 50, 204],
      "darkred": [139, 0, 0],
      "darksalmon": [233, 150, 122],
      "darkseagreen": [143, 188, 143],
      "darkslateblue": [72, 61, 139],
      "darkslategray": [47, 79, 79],
      "darkslategrey": [47, 79, 79],
      "darkturquoise": [0, 206, 209],
      "darkviolet": [148, 0, 211],
      "deeppink": [255, 20, 147],
      "deepskyblue": [0, 191, 255],
      "dimgray": [105, 105, 105],
      "dimgrey": [105, 105, 105],
      "dodgerblue": [30, 144, 255],
      "firebrick": [178, 34, 34],
      "floralwhite": [255, 250, 240],
      "forestgreen": [34, 139, 34],
      "fuchsia": [255, 0, 255],
      "gainsboro": [220, 220, 220],
      "ghostwhite": [248, 248, 255],
      "gold": [255, 215, 0],
      "goldenrod": [218, 165, 32],
      "gray": [128, 128, 128],
      "green": [0, 128, 0],
      "greenyellow": [173, 255, 47],
      "grey": [128, 128, 128],
      "honeydew": [240, 255, 240],
      "hotpink": [255, 105, 180],
      "indianred": [205, 92, 92],
      "indigo": [75, 0, 130],
      "ivory": [255, 255, 240],
      "khaki": [240, 230, 140],
      "lavender": [230, 230, 250],
      "lavenderblush": [255, 240, 245],
      "lawngreen": [124, 252, 0],
      "lemonchiffon": [255, 250, 205],
      "lightblue": [173, 216, 230],
      "lightcoral": [240, 128, 128],
      "lightcyan": [224, 255, 255],
      "lightgoldenrodyellow": [250, 250, 210],
      "lightgray": [211, 211, 211],
      "lightgreen": [144, 238, 144],
      "lightgrey": [211, 211, 211],
      "lightpink": [255, 182, 193],
      "lightsalmon": [255, 160, 122],
      "lightseagreen": [32, 178, 170],
      "lightskyblue": [135, 206, 250],
      "lightslategray": [119, 136, 153],
      "lightslategrey": [119, 136, 153],
      "lightsteelblue": [176, 196, 222],
      "lightyellow": [255, 255, 224],
      "lime": [0, 255, 0],
      "limegreen": [50, 205, 50],
      "linen": [250, 240, 230],
      "magenta": [255, 0, 255],
      "maroon": [128, 0, 0],
      "mediumaquamarine": [102, 205, 170],
      "mediumblue": [0, 0, 205],
      "mediumorchid": [186, 85, 211],
      "mediumpurple": [147, 112, 219],
      "mediumseagreen": [60, 179, 113],
      "mediumslateblue": [123, 104, 238],
      "mediumspringgreen": [0, 250, 154],
      "mediumturquoise": [72, 209, 204],
      "mediumvioletred": [199, 21, 133],
      "midnightblue": [25, 25, 112],
      "mintcream": [245, 255, 250],
      "mistyrose": [255, 228, 225],
      "moccasin": [255, 228, 181],
      "navajowhite": [255, 222, 173],
      "navy": [0, 0, 128],
      "oldlace": [253, 245, 230],
      "olive": [128, 128, 0],
      "olivedrab": [107, 142, 35],
      "orange": [255, 165, 0],
      "orangered": [255, 69, 0],
      "orchid": [218, 112, 214],
      "palegoldenrod": [238, 232, 170],
      "palegreen": [152, 251, 152],
      "paleturquoise": [175, 238, 238],
      "palevioletred": [219, 112, 147],
      "papayawhip": [255, 239, 213],
      "peachpuff": [255, 218, 185],
      "peru": [205, 133, 63],
      "pink": [255, 192, 203],
      "plum": [221, 160, 221],
      "powderblue": [176, 224, 230],
      "purple": [128, 0, 128],
      "rebeccapurple": [102, 51, 153],
      "red": [255, 0, 0],
      "rosybrown": [188, 143, 143],
      "royalblue": [65, 105, 225],
      "saddlebrown": [139, 69, 19],
      "salmon": [250, 128, 114],
      "sandybrown": [244, 164, 96],
      "seagreen": [46, 139, 87],
      "seashell": [255, 245, 238],
      "sienna": [160, 82, 45],
      "silver": [192, 192, 192],
      "skyblue": [135, 206, 235],
      "slateblue": [106, 90, 205],
      "slategray": [112, 128, 144],
      "slategrey": [112, 128, 144],
      "snow": [255, 250, 250],
      "springgreen": [0, 255, 127],
      "steelblue": [70, 130, 180],
      "tan": [210, 180, 140],
      "teal": [0, 128, 128],
      "thistle": [216, 191, 216],
      "tomato": [255, 99, 71],
      "turquoise": [64, 224, 208],
      "violet": [238, 130, 238],
      "wheat": [245, 222, 179],
      "white": [255, 255, 255],
      "whitesmoke": [245, 245, 245],
      "yellow": [255, 255, 0],
      "yellowgreen": [154, 205, 50]
    };
  }
});

// node_modules/color-convert/conversions.js
var require_conversions = __commonJS({
  "node_modules/color-convert/conversions.js"(exports, module2) {
    var cssKeywords = require_color_name2();
    var reverseKeywords = {};
    for (key in cssKeywords) {
      if (cssKeywords.hasOwnProperty(key)) {
        reverseKeywords[cssKeywords[key]] = key;
      }
    }
    var key;
    var convert = module2.exports = {
      rgb: { channels: 3, labels: "rgb" },
      hsl: { channels: 3, labels: "hsl" },
      hsv: { channels: 3, labels: "hsv" },
      hwb: { channels: 3, labels: "hwb" },
      cmyk: { channels: 4, labels: "cmyk" },
      xyz: { channels: 3, labels: "xyz" },
      lab: { channels: 3, labels: "lab" },
      lch: { channels: 3, labels: "lch" },
      hex: { channels: 1, labels: ["hex"] },
      keyword: { channels: 1, labels: ["keyword"] },
      ansi16: { channels: 1, labels: ["ansi16"] },
      ansi256: { channels: 1, labels: ["ansi256"] },
      hcg: { channels: 3, labels: ["h", "c", "g"] },
      apple: { channels: 3, labels: ["r16", "g16", "b16"] },
      gray: { channels: 1, labels: ["gray"] }
    };
    for (model in convert) {
      if (convert.hasOwnProperty(model)) {
        if (!("channels" in convert[model])) {
          throw new Error("missing channels property: " + model);
        }
        if (!("labels" in convert[model])) {
          throw new Error("missing channel labels property: " + model);
        }
        if (convert[model].labels.length !== convert[model].channels) {
          throw new Error("channel and label counts mismatch: " + model);
        }
        channels = convert[model].channels;
        labels = convert[model].labels;
        delete convert[model].channels;
        delete convert[model].labels;
        Object.defineProperty(convert[model], "channels", { value: channels });
        Object.defineProperty(convert[model], "labels", { value: labels });
      }
    }
    var channels;
    var labels;
    var model;
    convert.rgb.hsl = function(rgb) {
      var r = rgb[0] / 255;
      var g = rgb[1] / 255;
      var b = rgb[2] / 255;
      var min = Math.min(r, g, b);
      var max = Math.max(r, g, b);
      var delta = max - min;
      var h;
      var s;
      var l;
      if (max === min) {
        h = 0;
      } else if (r === max) {
        h = (g - b) / delta;
      } else if (g === max) {
        h = 2 + (b - r) / delta;
      } else if (b === max) {
        h = 4 + (r - g) / delta;
      }
      h = Math.min(h * 60, 360);
      if (h < 0) {
        h += 360;
      }
      l = (min + max) / 2;
      if (max === min) {
        s = 0;
      } else if (l <= 0.5) {
        s = delta / (max + min);
      } else {
        s = delta / (2 - max - min);
      }
      return [h, s * 100, l * 100];
    };
    convert.rgb.hsv = function(rgb) {
      var rdif;
      var gdif;
      var bdif;
      var h;
      var s;
      var r = rgb[0] / 255;
      var g = rgb[1] / 255;
      var b = rgb[2] / 255;
      var v = Math.max(r, g, b);
      var diff = v - Math.min(r, g, b);
      var diffc = function(c) {
        return (v - c) / 6 / diff + 1 / 2;
      };
      if (diff === 0) {
        h = s = 0;
      } else {
        s = diff / v;
        rdif = diffc(r);
        gdif = diffc(g);
        bdif = diffc(b);
        if (r === v) {
          h = bdif - gdif;
        } else if (g === v) {
          h = 1 / 3 + rdif - bdif;
        } else if (b === v) {
          h = 2 / 3 + gdif - rdif;
        }
        if (h < 0) {
          h += 1;
        } else if (h > 1) {
          h -= 1;
        }
      }
      return [
        h * 360,
        s * 100,
        v * 100
      ];
    };
    convert.rgb.hwb = function(rgb) {
      var r = rgb[0];
      var g = rgb[1];
      var b = rgb[2];
      var h = convert.rgb.hsl(rgb)[0];
      var w = 1 / 255 * Math.min(r, Math.min(g, b));
      b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));
      return [h, w * 100, b * 100];
    };
    convert.rgb.cmyk = function(rgb) {
      var r = rgb[0] / 255;
      var g = rgb[1] / 255;
      var b = rgb[2] / 255;
      var c;
      var m;
      var y;
      var k;
      k = Math.min(1 - r, 1 - g, 1 - b);
      c = (1 - r - k) / (1 - k) || 0;
      m = (1 - g - k) / (1 - k) || 0;
      y = (1 - b - k) / (1 - k) || 0;
      return [c * 100, m * 100, y * 100, k * 100];
    };
    function comparativeDistance(x, y) {
      return Math.pow(x[0] - y[0], 2) + Math.pow(x[1] - y[1], 2) + Math.pow(x[2] - y[2], 2);
    }
    convert.rgb.keyword = function(rgb) {
      var reversed = reverseKeywords[rgb];
      if (reversed) {
        return reversed;
      }
      var currentClosestDistance = Infinity;
      var currentClosestKeyword;
      for (var keyword in cssKeywords) {
        if (cssKeywords.hasOwnProperty(keyword)) {
          var value = cssKeywords[keyword];
          var distance = comparativeDistance(rgb, value);
          if (distance < currentClosestDistance) {
            currentClosestDistance = distance;
            currentClosestKeyword = keyword;
          }
        }
      }
      return currentClosestKeyword;
    };
    convert.keyword.rgb = function(keyword) {
      return cssKeywords[keyword];
    };
    convert.rgb.xyz = function(rgb) {
      var r = rgb[0] / 255;
      var g = rgb[1] / 255;
      var b = rgb[2] / 255;
      r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
      g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
      b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
      var x = r * 0.4124 + g * 0.3576 + b * 0.1805;
      var y = r * 0.2126 + g * 0.7152 + b * 0.0722;
      var z = r * 0.0193 + g * 0.1192 + b * 0.9505;
      return [x * 100, y * 100, z * 100];
    };
    convert.rgb.lab = function(rgb) {
      var xyz = convert.rgb.xyz(rgb);
      var x = xyz[0];
      var y = xyz[1];
      var z = xyz[2];
      var l;
      var a;
      var b;
      x /= 95.047;
      y /= 100;
      z /= 108.883;
      x = x > 8856e-6 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
      y = y > 8856e-6 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
      z = z > 8856e-6 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;
      l = 116 * y - 16;
      a = 500 * (x - y);
      b = 200 * (y - z);
      return [l, a, b];
    };
    convert.hsl.rgb = function(hsl) {
      var h = hsl[0] / 360;
      var s = hsl[1] / 100;
      var l = hsl[2] / 100;
      var t1;
      var t2;
      var t3;
      var rgb;
      var val;
      if (s === 0) {
        val = l * 255;
        return [val, val, val];
      }
      if (l < 0.5) {
        t2 = l * (1 + s);
      } else {
        t2 = l + s - l * s;
      }
      t1 = 2 * l - t2;
      rgb = [0, 0, 0];
      for (var i = 0; i < 3; i++) {
        t3 = h + 1 / 3 * -(i - 1);
        if (t3 < 0) {
          t3++;
        }
        if (t3 > 1) {
          t3--;
        }
        if (6 * t3 < 1) {
          val = t1 + (t2 - t1) * 6 * t3;
        } else if (2 * t3 < 1) {
          val = t2;
        } else if (3 * t3 < 2) {
          val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
        } else {
          val = t1;
        }
        rgb[i] = val * 255;
      }
      return rgb;
    };
    convert.hsl.hsv = function(hsl) {
      var h = hsl[0];
      var s = hsl[1] / 100;
      var l = hsl[2] / 100;
      var smin = s;
      var lmin = Math.max(l, 0.01);
      var sv;
      var v;
      l *= 2;
      s *= l <= 1 ? l : 2 - l;
      smin *= lmin <= 1 ? lmin : 2 - lmin;
      v = (l + s) / 2;
      sv = l === 0 ? 2 * smin / (lmin + smin) : 2 * s / (l + s);
      return [h, sv * 100, v * 100];
    };
    convert.hsv.rgb = function(hsv) {
      var h = hsv[0] / 60;
      var s = hsv[1] / 100;
      var v = hsv[2] / 100;
      var hi = Math.floor(h) % 6;
      var f = h - Math.floor(h);
      var p = 255 * v * (1 - s);
      var q = 255 * v * (1 - s * f);
      var t = 255 * v * (1 - s * (1 - f));
      v *= 255;
      switch (hi) {
        case 0:
          return [v, t, p];
        case 1:
          return [q, v, p];
        case 2:
          return [p, v, t];
        case 3:
          return [p, q, v];
        case 4:
          return [t, p, v];
        case 5:
          return [v, p, q];
      }
    };
    convert.hsv.hsl = function(hsv) {
      var h = hsv[0];
      var s = hsv[1] / 100;
      var v = hsv[2] / 100;
      var vmin = Math.max(v, 0.01);
      var lmin;
      var sl;
      var l;
      l = (2 - s) * v;
      lmin = (2 - s) * vmin;
      sl = s * vmin;
      sl /= lmin <= 1 ? lmin : 2 - lmin;
      sl = sl || 0;
      l /= 2;
      return [h, sl * 100, l * 100];
    };
    convert.hwb.rgb = function(hwb) {
      var h = hwb[0] / 360;
      var wh = hwb[1] / 100;
      var bl = hwb[2] / 100;
      var ratio = wh + bl;
      var i;
      var v;
      var f;
      var n;
      if (ratio > 1) {
        wh /= ratio;
        bl /= ratio;
      }
      i = Math.floor(6 * h);
      v = 1 - bl;
      f = 6 * h - i;
      if ((i & 1) !== 0) {
        f = 1 - f;
      }
      n = wh + f * (v - wh);
      var r;
      var g;
      var b;
      switch (i) {
        default:
        case 6:
        case 0:
          r = v;
          g = n;
          b = wh;
          break;
        case 1:
          r = n;
          g = v;
          b = wh;
          break;
        case 2:
          r = wh;
          g = v;
          b = n;
          break;
        case 3:
          r = wh;
          g = n;
          b = v;
          break;
        case 4:
          r = n;
          g = wh;
          b = v;
          break;
        case 5:
          r = v;
          g = wh;
          b = n;
          break;
      }
      return [r * 255, g * 255, b * 255];
    };
    convert.cmyk.rgb = function(cmyk) {
      var c = cmyk[0] / 100;
      var m = cmyk[1] / 100;
      var y = cmyk[2] / 100;
      var k = cmyk[3] / 100;
      var r;
      var g;
      var b;
      r = 1 - Math.min(1, c * (1 - k) + k);
      g = 1 - Math.min(1, m * (1 - k) + k);
      b = 1 - Math.min(1, y * (1 - k) + k);
      return [r * 255, g * 255, b * 255];
    };
    convert.xyz.rgb = function(xyz) {
      var x = xyz[0] / 100;
      var y = xyz[1] / 100;
      var z = xyz[2] / 100;
      var r;
      var g;
      var b;
      r = x * 3.2406 + y * -1.5372 + z * -0.4986;
      g = x * -0.9689 + y * 1.8758 + z * 0.0415;
      b = x * 0.0557 + y * -0.204 + z * 1.057;
      r = r > 31308e-7 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : r * 12.92;
      g = g > 31308e-7 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : g * 12.92;
      b = b > 31308e-7 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : b * 12.92;
      r = Math.min(Math.max(0, r), 1);
      g = Math.min(Math.max(0, g), 1);
      b = Math.min(Math.max(0, b), 1);
      return [r * 255, g * 255, b * 255];
    };
    convert.xyz.lab = function(xyz) {
      var x = xyz[0];
      var y = xyz[1];
      var z = xyz[2];
      var l;
      var a;
      var b;
      x /= 95.047;
      y /= 100;
      z /= 108.883;
      x = x > 8856e-6 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
      y = y > 8856e-6 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
      z = z > 8856e-6 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;
      l = 116 * y - 16;
      a = 500 * (x - y);
      b = 200 * (y - z);
      return [l, a, b];
    };
    convert.lab.xyz = function(lab) {
      var l = lab[0];
      var a = lab[1];
      var b = lab[2];
      var x;
      var y;
      var z;
      y = (l + 16) / 116;
      x = a / 500 + y;
      z = y - b / 200;
      var y2 = Math.pow(y, 3);
      var x2 = Math.pow(x, 3);
      var z2 = Math.pow(z, 3);
      y = y2 > 8856e-6 ? y2 : (y - 16 / 116) / 7.787;
      x = x2 > 8856e-6 ? x2 : (x - 16 / 116) / 7.787;
      z = z2 > 8856e-6 ? z2 : (z - 16 / 116) / 7.787;
      x *= 95.047;
      y *= 100;
      z *= 108.883;
      return [x, y, z];
    };
    convert.lab.lch = function(lab) {
      var l = lab[0];
      var a = lab[1];
      var b = lab[2];
      var hr;
      var h;
      var c;
      hr = Math.atan2(b, a);
      h = hr * 360 / 2 / Math.PI;
      if (h < 0) {
        h += 360;
      }
      c = Math.sqrt(a * a + b * b);
      return [l, c, h];
    };
    convert.lch.lab = function(lch) {
      var l = lch[0];
      var c = lch[1];
      var h = lch[2];
      var a;
      var b;
      var hr;
      hr = h / 360 * 2 * Math.PI;
      a = c * Math.cos(hr);
      b = c * Math.sin(hr);
      return [l, a, b];
    };
    convert.rgb.ansi16 = function(args) {
      var r = args[0];
      var g = args[1];
      var b = args[2];
      var value = 1 in arguments ? arguments[1] : convert.rgb.hsv(args)[2];
      value = Math.round(value / 50);
      if (value === 0) {
        return 30;
      }
      var ansi = 30 + (Math.round(b / 255) << 2 | Math.round(g / 255) << 1 | Math.round(r / 255));
      if (value === 2) {
        ansi += 60;
      }
      return ansi;
    };
    convert.hsv.ansi16 = function(args) {
      return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
    };
    convert.rgb.ansi256 = function(args) {
      var r = args[0];
      var g = args[1];
      var b = args[2];
      if (r === g && g === b) {
        if (r < 8) {
          return 16;
        }
        if (r > 248) {
          return 231;
        }
        return Math.round((r - 8) / 247 * 24) + 232;
      }
      var ansi = 16 + 36 * Math.round(r / 255 * 5) + 6 * Math.round(g / 255 * 5) + Math.round(b / 255 * 5);
      return ansi;
    };
    convert.ansi16.rgb = function(args) {
      var color = args % 10;
      if (color === 0 || color === 7) {
        if (args > 50) {
          color += 3.5;
        }
        color = color / 10.5 * 255;
        return [color, color, color];
      }
      var mult = (~~(args > 50) + 1) * 0.5;
      var r = (color & 1) * mult * 255;
      var g = (color >> 1 & 1) * mult * 255;
      var b = (color >> 2 & 1) * mult * 255;
      return [r, g, b];
    };
    convert.ansi256.rgb = function(args) {
      if (args >= 232) {
        var c = (args - 232) * 10 + 8;
        return [c, c, c];
      }
      args -= 16;
      var rem;
      var r = Math.floor(args / 36) / 5 * 255;
      var g = Math.floor((rem = args % 36) / 6) / 5 * 255;
      var b = rem % 6 / 5 * 255;
      return [r, g, b];
    };
    convert.rgb.hex = function(args) {
      var integer = ((Math.round(args[0]) & 255) << 16) + ((Math.round(args[1]) & 255) << 8) + (Math.round(args[2]) & 255);
      var string = integer.toString(16).toUpperCase();
      return "000000".substring(string.length) + string;
    };
    convert.hex.rgb = function(args) {
      var match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
      if (!match) {
        return [0, 0, 0];
      }
      var colorString = match[0];
      if (match[0].length === 3) {
        colorString = colorString.split("").map(function(char) {
          return char + char;
        }).join("");
      }
      var integer = parseInt(colorString, 16);
      var r = integer >> 16 & 255;
      var g = integer >> 8 & 255;
      var b = integer & 255;
      return [r, g, b];
    };
    convert.rgb.hcg = function(rgb) {
      var r = rgb[0] / 255;
      var g = rgb[1] / 255;
      var b = rgb[2] / 255;
      var max = Math.max(Math.max(r, g), b);
      var min = Math.min(Math.min(r, g), b);
      var chroma = max - min;
      var grayscale;
      var hue;
      if (chroma < 1) {
        grayscale = min / (1 - chroma);
      } else {
        grayscale = 0;
      }
      if (chroma <= 0) {
        hue = 0;
      } else if (max === r) {
        hue = (g - b) / chroma % 6;
      } else if (max === g) {
        hue = 2 + (b - r) / chroma;
      } else {
        hue = 4 + (r - g) / chroma + 4;
      }
      hue /= 6;
      hue %= 1;
      return [hue * 360, chroma * 100, grayscale * 100];
    };
    convert.hsl.hcg = function(hsl) {
      var s = hsl[1] / 100;
      var l = hsl[2] / 100;
      var c = 1;
      var f = 0;
      if (l < 0.5) {
        c = 2 * s * l;
      } else {
        c = 2 * s * (1 - l);
      }
      if (c < 1) {
        f = (l - 0.5 * c) / (1 - c);
      }
      return [hsl[0], c * 100, f * 100];
    };
    convert.hsv.hcg = function(hsv) {
      var s = hsv[1] / 100;
      var v = hsv[2] / 100;
      var c = s * v;
      var f = 0;
      if (c < 1) {
        f = (v - c) / (1 - c);
      }
      return [hsv[0], c * 100, f * 100];
    };
    convert.hcg.rgb = function(hcg) {
      var h = hcg[0] / 360;
      var c = hcg[1] / 100;
      var g = hcg[2] / 100;
      if (c === 0) {
        return [g * 255, g * 255, g * 255];
      }
      var pure = [0, 0, 0];
      var hi = h % 1 * 6;
      var v = hi % 1;
      var w = 1 - v;
      var mg = 0;
      switch (Math.floor(hi)) {
        case 0:
          pure[0] = 1;
          pure[1] = v;
          pure[2] = 0;
          break;
        case 1:
          pure[0] = w;
          pure[1] = 1;
          pure[2] = 0;
          break;
        case 2:
          pure[0] = 0;
          pure[1] = 1;
          pure[2] = v;
          break;
        case 3:
          pure[0] = 0;
          pure[1] = w;
          pure[2] = 1;
          break;
        case 4:
          pure[0] = v;
          pure[1] = 0;
          pure[2] = 1;
          break;
        default:
          pure[0] = 1;
          pure[1] = 0;
          pure[2] = w;
      }
      mg = (1 - c) * g;
      return [
        (c * pure[0] + mg) * 255,
        (c * pure[1] + mg) * 255,
        (c * pure[2] + mg) * 255
      ];
    };
    convert.hcg.hsv = function(hcg) {
      var c = hcg[1] / 100;
      var g = hcg[2] / 100;
      var v = c + g * (1 - c);
      var f = 0;
      if (v > 0) {
        f = c / v;
      }
      return [hcg[0], f * 100, v * 100];
    };
    convert.hcg.hsl = function(hcg) {
      var c = hcg[1] / 100;
      var g = hcg[2] / 100;
      var l = g * (1 - c) + 0.5 * c;
      var s = 0;
      if (l > 0 && l < 0.5) {
        s = c / (2 * l);
      } else if (l >= 0.5 && l < 1) {
        s = c / (2 * (1 - l));
      }
      return [hcg[0], s * 100, l * 100];
    };
    convert.hcg.hwb = function(hcg) {
      var c = hcg[1] / 100;
      var g = hcg[2] / 100;
      var v = c + g * (1 - c);
      return [hcg[0], (v - c) * 100, (1 - v) * 100];
    };
    convert.hwb.hcg = function(hwb) {
      var w = hwb[1] / 100;
      var b = hwb[2] / 100;
      var v = 1 - b;
      var c = v - w;
      var g = 0;
      if (c < 1) {
        g = (v - c) / (1 - c);
      }
      return [hwb[0], c * 100, g * 100];
    };
    convert.apple.rgb = function(apple) {
      return [apple[0] / 65535 * 255, apple[1] / 65535 * 255, apple[2] / 65535 * 255];
    };
    convert.rgb.apple = function(rgb) {
      return [rgb[0] / 255 * 65535, rgb[1] / 255 * 65535, rgb[2] / 255 * 65535];
    };
    convert.gray.rgb = function(args) {
      return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
    };
    convert.gray.hsl = convert.gray.hsv = function(args) {
      return [0, 0, args[0]];
    };
    convert.gray.hwb = function(gray) {
      return [0, 100, gray[0]];
    };
    convert.gray.cmyk = function(gray) {
      return [0, 0, 0, gray[0]];
    };
    convert.gray.lab = function(gray) {
      return [gray[0], 0, 0];
    };
    convert.gray.hex = function(gray) {
      var val = Math.round(gray[0] / 100 * 255) & 255;
      var integer = (val << 16) + (val << 8) + val;
      var string = integer.toString(16).toUpperCase();
      return "000000".substring(string.length) + string;
    };
    convert.rgb.gray = function(rgb) {
      var val = (rgb[0] + rgb[1] + rgb[2]) / 3;
      return [val / 255 * 100];
    };
  }
});

// node_modules/color-convert/route.js
var require_route = __commonJS({
  "node_modules/color-convert/route.js"(exports, module2) {
    var conversions = require_conversions();
    function buildGraph() {
      var graph = {};
      var models = Object.keys(conversions);
      for (var len = models.length, i = 0; i < len; i++) {
        graph[models[i]] = {
          distance: -1,
          parent: null
        };
      }
      return graph;
    }
    function deriveBFS(fromModel) {
      var graph = buildGraph();
      var queue = [fromModel];
      graph[fromModel].distance = 0;
      while (queue.length) {
        var current = queue.pop();
        var adjacents = Object.keys(conversions[current]);
        for (var len = adjacents.length, i = 0; i < len; i++) {
          var adjacent = adjacents[i];
          var node = graph[adjacent];
          if (node.distance === -1) {
            node.distance = graph[current].distance + 1;
            node.parent = current;
            queue.unshift(adjacent);
          }
        }
      }
      return graph;
    }
    function link(from, to) {
      return function(args) {
        return to(from(args));
      };
    }
    function wrapConversion(toModel, graph) {
      var path = [graph[toModel].parent, toModel];
      var fn = conversions[graph[toModel].parent][toModel];
      var cur = graph[toModel].parent;
      while (graph[cur].parent) {
        path.unshift(graph[cur].parent);
        fn = link(conversions[graph[cur].parent][cur], fn);
        cur = graph[cur].parent;
      }
      fn.conversion = path;
      return fn;
    }
    module2.exports = function(fromModel) {
      var graph = deriveBFS(fromModel);
      var conversion = {};
      var models = Object.keys(graph);
      for (var len = models.length, i = 0; i < len; i++) {
        var toModel = models[i];
        var node = graph[toModel];
        if (node.parent === null) {
          continue;
        }
        conversion[toModel] = wrapConversion(toModel, graph);
      }
      return conversion;
    };
  }
});

// node_modules/color-convert/index.js
var require_color_convert = __commonJS({
  "node_modules/color-convert/index.js"(exports, module2) {
    var conversions = require_conversions();
    var route = require_route();
    var convert = {};
    var models = Object.keys(conversions);
    function wrapRaw(fn) {
      var wrappedFn = function(args) {
        if (args === void 0 || args === null) {
          return args;
        }
        if (arguments.length > 1) {
          args = Array.prototype.slice.call(arguments);
        }
        return fn(args);
      };
      if ("conversion" in fn) {
        wrappedFn.conversion = fn.conversion;
      }
      return wrappedFn;
    }
    function wrapRounded(fn) {
      var wrappedFn = function(args) {
        if (args === void 0 || args === null) {
          return args;
        }
        if (arguments.length > 1) {
          args = Array.prototype.slice.call(arguments);
        }
        var result = fn(args);
        if (typeof result === "object") {
          for (var len = result.length, i = 0; i < len; i++) {
            result[i] = Math.round(result[i]);
          }
        }
        return result;
      };
      if ("conversion" in fn) {
        wrappedFn.conversion = fn.conversion;
      }
      return wrappedFn;
    }
    models.forEach(function(fromModel) {
      convert[fromModel] = {};
      Object.defineProperty(convert[fromModel], "channels", { value: conversions[fromModel].channels });
      Object.defineProperty(convert[fromModel], "labels", { value: conversions[fromModel].labels });
      var routes = route(fromModel);
      var routeModels = Object.keys(routes);
      routeModels.forEach(function(toModel) {
        var fn = routes[toModel];
        convert[fromModel][toModel] = wrapRounded(fn);
        convert[fromModel][toModel].raw = wrapRaw(fn);
      });
    });
    module2.exports = convert;
  }
});

// node_modules/color/index.js
var require_color = __commonJS({
  "node_modules/color/index.js"(exports, module2) {
    "use strict";
    var colorString = require_color_string();
    var convert = require_color_convert();
    var _slice = [].slice;
    var skippedModels = [
      "keyword",
      "gray",
      "hex"
    ];
    var hashedModelKeys = {};
    Object.keys(convert).forEach(function(model) {
      hashedModelKeys[_slice.call(convert[model].labels).sort().join("")] = model;
    });
    var limiters = {};
    function Color(obj, model) {
      if (!(this instanceof Color)) {
        return new Color(obj, model);
      }
      if (model && model in skippedModels) {
        model = null;
      }
      if (model && !(model in convert)) {
        throw new Error("Unknown model: " + model);
      }
      var i;
      var channels;
      if (obj == null) {
        this.model = "rgb";
        this.color = [0, 0, 0];
        this.valpha = 1;
      } else if (obj instanceof Color) {
        this.model = obj.model;
        this.color = obj.color.slice();
        this.valpha = obj.valpha;
      } else if (typeof obj === "string") {
        var result = colorString.get(obj);
        if (result === null) {
          throw new Error("Unable to parse color from string: " + obj);
        }
        this.model = result.model;
        channels = convert[this.model].channels;
        this.color = result.value.slice(0, channels);
        this.valpha = typeof result.value[channels] === "number" ? result.value[channels] : 1;
      } else if (obj.length) {
        this.model = model || "rgb";
        channels = convert[this.model].channels;
        var newArr = _slice.call(obj, 0, channels);
        this.color = zeroArray(newArr, channels);
        this.valpha = typeof obj[channels] === "number" ? obj[channels] : 1;
      } else if (typeof obj === "number") {
        obj &= 16777215;
        this.model = "rgb";
        this.color = [
          obj >> 16 & 255,
          obj >> 8 & 255,
          obj & 255
        ];
        this.valpha = 1;
      } else {
        this.valpha = 1;
        var keys = Object.keys(obj);
        if ("alpha" in obj) {
          keys.splice(keys.indexOf("alpha"), 1);
          this.valpha = typeof obj.alpha === "number" ? obj.alpha : 0;
        }
        var hashedKeys = keys.sort().join("");
        if (!(hashedKeys in hashedModelKeys)) {
          throw new Error("Unable to parse color from object: " + JSON.stringify(obj));
        }
        this.model = hashedModelKeys[hashedKeys];
        var labels = convert[this.model].labels;
        var color = [];
        for (i = 0; i < labels.length; i++) {
          color.push(obj[labels[i]]);
        }
        this.color = zeroArray(color);
      }
      if (limiters[this.model]) {
        channels = convert[this.model].channels;
        for (i = 0; i < channels; i++) {
          var limit = limiters[this.model][i];
          if (limit) {
            this.color[i] = limit(this.color[i]);
          }
        }
      }
      this.valpha = Math.max(0, Math.min(1, this.valpha));
      if (Object.freeze) {
        Object.freeze(this);
      }
    }
    Color.prototype = {
      toString: function() {
        return this.string();
      },
      toJSON: function() {
        return this[this.model]();
      },
      string: function(places) {
        var self = this.model in colorString.to ? this : this.rgb();
        self = self.round(typeof places === "number" ? places : 1);
        var args = self.valpha === 1 ? self.color : self.color.concat(this.valpha);
        return colorString.to[self.model](args);
      },
      percentString: function(places) {
        var self = this.rgb().round(typeof places === "number" ? places : 1);
        var args = self.valpha === 1 ? self.color : self.color.concat(this.valpha);
        return colorString.to.rgb.percent(args);
      },
      array: function() {
        return this.valpha === 1 ? this.color.slice() : this.color.concat(this.valpha);
      },
      object: function() {
        var result = {};
        var channels = convert[this.model].channels;
        var labels = convert[this.model].labels;
        for (var i = 0; i < channels; i++) {
          result[labels[i]] = this.color[i];
        }
        if (this.valpha !== 1) {
          result.alpha = this.valpha;
        }
        return result;
      },
      unitArray: function() {
        var rgb = this.rgb().color;
        rgb[0] /= 255;
        rgb[1] /= 255;
        rgb[2] /= 255;
        if (this.valpha !== 1) {
          rgb.push(this.valpha);
        }
        return rgb;
      },
      unitObject: function() {
        var rgb = this.rgb().object();
        rgb.r /= 255;
        rgb.g /= 255;
        rgb.b /= 255;
        if (this.valpha !== 1) {
          rgb.alpha = this.valpha;
        }
        return rgb;
      },
      round: function(places) {
        places = Math.max(places || 0, 0);
        return new Color(this.color.map(roundToPlace(places)).concat(this.valpha), this.model);
      },
      alpha: function(val) {
        if (arguments.length) {
          return new Color(this.color.concat(Math.max(0, Math.min(1, val))), this.model);
        }
        return this.valpha;
      },
      red: getset("rgb", 0, maxfn(255)),
      green: getset("rgb", 1, maxfn(255)),
      blue: getset("rgb", 2, maxfn(255)),
      hue: getset(["hsl", "hsv", "hsl", "hwb", "hcg"], 0, function(val) {
        return (val % 360 + 360) % 360;
      }),
      saturationl: getset("hsl", 1, maxfn(100)),
      lightness: getset("hsl", 2, maxfn(100)),
      saturationv: getset("hsv", 1, maxfn(100)),
      value: getset("hsv", 2, maxfn(100)),
      chroma: getset("hcg", 1, maxfn(100)),
      gray: getset("hcg", 2, maxfn(100)),
      white: getset("hwb", 1, maxfn(100)),
      wblack: getset("hwb", 2, maxfn(100)),
      cyan: getset("cmyk", 0, maxfn(100)),
      magenta: getset("cmyk", 1, maxfn(100)),
      yellow: getset("cmyk", 2, maxfn(100)),
      black: getset("cmyk", 3, maxfn(100)),
      x: getset("xyz", 0, maxfn(100)),
      y: getset("xyz", 1, maxfn(100)),
      z: getset("xyz", 2, maxfn(100)),
      l: getset("lab", 0, maxfn(100)),
      a: getset("lab", 1),
      b: getset("lab", 2),
      keyword: function(val) {
        if (arguments.length) {
          return new Color(val);
        }
        return convert[this.model].keyword(this.color);
      },
      hex: function(val) {
        if (arguments.length) {
          return new Color(val);
        }
        return colorString.to.hex(this.rgb().round().color);
      },
      rgbNumber: function() {
        var rgb = this.rgb().color;
        return (rgb[0] & 255) << 16 | (rgb[1] & 255) << 8 | rgb[2] & 255;
      },
      luminosity: function() {
        var rgb = this.rgb().color;
        var lum = [];
        for (var i = 0; i < rgb.length; i++) {
          var chan = rgb[i] / 255;
          lum[i] = chan <= 0.03928 ? chan / 12.92 : Math.pow((chan + 0.055) / 1.055, 2.4);
        }
        return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
      },
      contrast: function(color2) {
        var lum1 = this.luminosity();
        var lum2 = color2.luminosity();
        if (lum1 > lum2) {
          return (lum1 + 0.05) / (lum2 + 0.05);
        }
        return (lum2 + 0.05) / (lum1 + 0.05);
      },
      level: function(color2) {
        var contrastRatio = this.contrast(color2);
        if (contrastRatio >= 7.1) {
          return "AAA";
        }
        return contrastRatio >= 4.5 ? "AA" : "";
      },
      isDark: function() {
        var rgb = this.rgb().color;
        var yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1e3;
        return yiq < 128;
      },
      isLight: function() {
        return !this.isDark();
      },
      negate: function() {
        var rgb = this.rgb();
        for (var i = 0; i < 3; i++) {
          rgb.color[i] = 255 - rgb.color[i];
        }
        return rgb;
      },
      lighten: function(ratio) {
        var hsl = this.hsl();
        hsl.color[2] += hsl.color[2] * ratio;
        return hsl;
      },
      darken: function(ratio) {
        var hsl = this.hsl();
        hsl.color[2] -= hsl.color[2] * ratio;
        return hsl;
      },
      saturate: function(ratio) {
        var hsl = this.hsl();
        hsl.color[1] += hsl.color[1] * ratio;
        return hsl;
      },
      desaturate: function(ratio) {
        var hsl = this.hsl();
        hsl.color[1] -= hsl.color[1] * ratio;
        return hsl;
      },
      whiten: function(ratio) {
        var hwb = this.hwb();
        hwb.color[1] += hwb.color[1] * ratio;
        return hwb;
      },
      blacken: function(ratio) {
        var hwb = this.hwb();
        hwb.color[2] += hwb.color[2] * ratio;
        return hwb;
      },
      grayscale: function() {
        var rgb = this.rgb().color;
        var val = rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11;
        return Color.rgb(val, val, val);
      },
      fade: function(ratio) {
        return this.alpha(this.valpha - this.valpha * ratio);
      },
      opaquer: function(ratio) {
        return this.alpha(this.valpha + this.valpha * ratio);
      },
      rotate: function(degrees) {
        var hsl = this.hsl();
        var hue = hsl.color[0];
        hue = (hue + degrees) % 360;
        hue = hue < 0 ? 360 + hue : hue;
        hsl.color[0] = hue;
        return hsl;
      },
      mix: function(mixinColor, weight) {
        if (!mixinColor || !mixinColor.rgb) {
          throw new Error('Argument to "mix" was not a Color instance, but rather an instance of ' + typeof mixinColor);
        }
        var color1 = mixinColor.rgb();
        var color2 = this.rgb();
        var p = weight === void 0 ? 0.5 : weight;
        var w = 2 * p - 1;
        var a = color1.alpha() - color2.alpha();
        var w1 = ((w * a === -1 ? w : (w + a) / (1 + w * a)) + 1) / 2;
        var w2 = 1 - w1;
        return Color.rgb(w1 * color1.red() + w2 * color2.red(), w1 * color1.green() + w2 * color2.green(), w1 * color1.blue() + w2 * color2.blue(), color1.alpha() * p + color2.alpha() * (1 - p));
      }
    };
    Object.keys(convert).forEach(function(model) {
      if (skippedModels.indexOf(model) !== -1) {
        return;
      }
      var channels = convert[model].channels;
      Color.prototype[model] = function() {
        if (this.model === model) {
          return new Color(this);
        }
        if (arguments.length) {
          return new Color(arguments, model);
        }
        var newAlpha = typeof arguments[channels] === "number" ? channels : this.valpha;
        return new Color(assertArray(convert[this.model][model].raw(this.color)).concat(newAlpha), model);
      };
      Color[model] = function(color) {
        if (typeof color === "number") {
          color = zeroArray(_slice.call(arguments), channels);
        }
        return new Color(color, model);
      };
    });
    function roundTo(num, places) {
      return Number(num.toFixed(places));
    }
    function roundToPlace(places) {
      return function(num) {
        return roundTo(num, places);
      };
    }
    function getset(model, channel, modifier) {
      model = Array.isArray(model) ? model : [model];
      model.forEach(function(m) {
        (limiters[m] || (limiters[m] = []))[channel] = modifier;
      });
      model = model[0];
      return function(val) {
        var result;
        if (arguments.length) {
          if (modifier) {
            val = modifier(val);
          }
          result = this[model]();
          result.color[channel] = val;
          return result;
        }
        result = this[model]().color[channel];
        if (modifier) {
          result = modifier(result);
        }
        return result;
      };
    }
    function maxfn(max) {
      return function(v) {
        return Math.max(0, Math.min(max, v));
      };
    }
    function assertArray(val) {
      return Array.isArray(val) ? val : [val];
    }
    function zeroArray(arr, length) {
      for (var i = 0; i < length; i++) {
        if (typeof arr[i] !== "number") {
          arr[i] = 0;
        }
      }
      return arr;
    }
    module2.exports = Color;
  }
});

// node_modules/text-hex/index.js
var require_text_hex = __commonJS({
  "node_modules/text-hex/index.js"(exports, module2) {
    "use strict";
    module2.exports = function hex(str) {
      for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash))
        ;
      var color = Math.floor(Math.abs(Math.sin(hash) * 1e4 % 1 * 16777216)).toString(16);
      return "#" + Array(6 - color.length + 1).join("0") + color;
    };
  }
});

// node_modules/colorspace/index.js
var require_colorspace = __commonJS({
  "node_modules/colorspace/index.js"(exports, module2) {
    "use strict";
    var color = require_color();
    var hex = require_text_hex();
    module2.exports = function colorspace(namespace, delimiter) {
      var split = namespace.split(delimiter || ":");
      var base = hex(split[0]);
      if (!split.length)
        return base;
      for (var i = 0, l = split.length - 1; i < l; i++) {
        base = color(base).mix(color(hex(split[i + 1]))).saturate(1).hex();
      }
      return base;
    };
  }
});

// node_modules/kuler/index.js
var require_kuler = __commonJS({
  "node_modules/kuler/index.js"(exports, module2) {
    "use strict";
    function Kuler(text, color) {
      if (color)
        return new Kuler(text).style(color);
      if (!(this instanceof Kuler))
        return new Kuler(text);
      this.text = text;
    }
    Kuler.prototype.prefix = "\x1B[";
    Kuler.prototype.suffix = "m";
    Kuler.prototype.hex = function hex(color) {
      color = color[0] === "#" ? color.substring(1) : color;
      if (color.length === 3) {
        color = color.split("");
        color[5] = color[2];
        color[4] = color[2];
        color[3] = color[1];
        color[2] = color[1];
        color[1] = color[0];
        color = color.join("");
      }
      var r = color.substring(0, 2), g = color.substring(2, 4), b = color.substring(4, 6);
      return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16)];
    };
    Kuler.prototype.rgb = function rgb(r, g, b) {
      var red = r / 255 * 5, green = g / 255 * 5, blue = b / 255 * 5;
      return this.ansi(red, green, blue);
    };
    Kuler.prototype.ansi = function ansi(r, g, b) {
      var red = Math.round(r), green = Math.round(g), blue = Math.round(b);
      return 16 + red * 36 + green * 6 + blue;
    };
    Kuler.prototype.reset = function reset() {
      return this.prefix + "39;49" + this.suffix;
    };
    Kuler.prototype.style = function style(color) {
      return this.prefix + "38;5;" + this.rgb.apply(this, this.hex(color)) + this.suffix + this.text + this.reset();
    };
    module2.exports = Kuler;
  }
});

// node_modules/diagnostics/modifiers/namespace-ansi.js
var require_namespace_ansi = __commonJS({
  "node_modules/diagnostics/modifiers/namespace-ansi.js"(exports, module2) {
    var colorspace = require_colorspace();
    var kuler = require_kuler();
    module2.exports = function ansiModifier(args, options) {
      var namespace = options.namespace;
      var ansi = options.colors !== false ? kuler(namespace + ":", colorspace(namespace)) : namespace + ":";
      args[0] = ansi + " " + args[0];
      return args;
    };
  }
});

// node_modules/enabled/index.js
var require_enabled = __commonJS({
  "node_modules/enabled/index.js"(exports, module2) {
    "use strict";
    module2.exports = function enabled(name, variable) {
      if (!variable)
        return false;
      var variables = variable.split(/[\s,]+/), i = 0;
      for (; i < variables.length; i++) {
        variable = variables[i].replace("*", ".*?");
        if ("-" === variable.charAt(0)) {
          if (new RegExp("^" + variable.substr(1) + "$").test(name)) {
            return false;
          }
          continue;
        }
        if (new RegExp("^" + variable + "$").test(name)) {
          return true;
        }
      }
      return false;
    };
  }
});

// node_modules/diagnostics/adapters/index.js
var require_adapters = __commonJS({
  "node_modules/diagnostics/adapters/index.js"(exports, module2) {
    var enabled = require_enabled();
    module2.exports = function create(fn) {
      return function adapter(namespace) {
        try {
          return enabled(namespace, fn());
        } catch (e) {
        }
        return false;
      };
    };
  }
});

// node_modules/diagnostics/adapters/process.env.js
var require_process_env = __commonJS({
  "node_modules/diagnostics/adapters/process.env.js"(exports, module2) {
    var adapter = require_adapters();
    module2.exports = adapter(function processenv() {
      return process.env.DEBUG || process.env.DIAGNOSTICS;
    });
  }
});

// node_modules/diagnostics/logger/console.js
var require_console = __commonJS({
  "node_modules/diagnostics/logger/console.js"(exports, module2) {
    module2.exports = function(meta, messages) {
      try {
        Function.prototype.apply.call(console.log, console, messages);
      } catch (e) {
      }
    };
  }
});

// node_modules/diagnostics/node/development.js
var require_development = __commonJS({
  "node_modules/diagnostics/node/development.js"(exports, module2) {
    var create = require_diagnostics();
    var tty = require("tty").isatty(1);
    var diagnostics = create(function dev(namespace, options) {
      options = options || {};
      options.colors = "colors" in options ? options.colors : tty;
      options.namespace = namespace;
      options.prod = false;
      options.dev = true;
      if (!dev.enabled(namespace) && !(options.force || dev.force)) {
        return dev.nope(options);
      }
      return dev.yep(options);
    });
    diagnostics.modify(require_namespace_ansi());
    diagnostics.use(require_process_env());
    diagnostics.set(require_console());
    module2.exports = diagnostics;
  }
});

// node_modules/diagnostics/node/index.js
var require_node = __commonJS({
  "node_modules/diagnostics/node/index.js"(exports, module2) {
    if (process.env.NODE_ENV === "production") {
      module2.exports = require_production();
    } else {
      module2.exports = require_development();
    }
  }
});

// node_modules/primus/middleware/error.js
var require_error = __commonJS({
  "node_modules/primus/middleware/error.js"(exports, module2) {
    "use strict";
    var http = require("http");
    module2.exports = function error(err, req, res) {
      const message = JSON.stringify({ error: err.message || err });
      const length = Buffer.byteLength(message);
      const code = err.statusCode || 500;
      if (res.setHeader) {
        res.statusCode = code;
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Length", length);
        return res.end(message);
      }
      res.write(`HTTP/${req.httpVersion} ${code} ${http.STATUS_CODES[code]}\r
Connection: close\r
Content-Type: application/json\r
Content-Length: ${length}\r
\r
` + message);
      res.destroy();
    };
  }
});

// node_modules/ultron/index.js
var require_ultron = __commonJS({
  "node_modules/ultron/index.js"(exports, module2) {
    "use strict";
    var has = Object.prototype.hasOwnProperty;
    var id = 0;
    function Ultron(ee) {
      if (!(this instanceof Ultron))
        return new Ultron(ee);
      this.id = id++;
      this.ee = ee;
    }
    Ultron.prototype.on = function on(event, fn, context) {
      fn.__ultron = this.id;
      this.ee.on(event, fn, context);
      return this;
    };
    Ultron.prototype.once = function once(event, fn, context) {
      fn.__ultron = this.id;
      this.ee.once(event, fn, context);
      return this;
    };
    Ultron.prototype.remove = function remove() {
      var args = arguments, ee = this.ee, event;
      if (args.length === 1 && "string" === typeof args[0]) {
        args = args[0].split(/[, ]+/);
      } else if (!args.length) {
        if (ee.eventNames) {
          args = ee.eventNames();
        } else if (ee._events) {
          args = [];
          for (event in ee._events) {
            if (has.call(ee._events, event))
              args.push(event);
          }
          if (Object.getOwnPropertySymbols) {
            args = args.concat(Object.getOwnPropertySymbols(ee._events));
          }
        }
      }
      for (var i = 0; i < args.length; i++) {
        var listeners = ee.listeners(args[i]);
        for (var j = 0; j < listeners.length; j++) {
          event = listeners[j];
          if (event.listener) {
            if (event.listener.__ultron !== this.id)
              continue;
          } else if (event.__ultron !== this.id) {
            continue;
          }
          ee.removeListener(args[i], event);
        }
      }
      return this;
    };
    Ultron.prototype.destroy = function destroy() {
      if (!this.ee)
        return false;
      this.remove();
      this.ee = null;
      return true;
    };
    module2.exports = Ultron;
  }
});

// node_modules/extendible/index.js
var require_extendible = __commonJS({
  "node_modules/extendible/index.js"(exports, module2) {
    var has = Object.prototype.hasOwnProperty;
    var slice = Array.prototype.slice;
    function copypaste(obj) {
      var args = slice.call(arguments, 1), i = 0, prop;
      for (; i < args.length; i++) {
        if (!args[i])
          continue;
        for (prop in args[i]) {
          if (!has.call(args[i], prop))
            continue;
          obj[prop] = args[i][prop];
        }
      }
      return obj;
    }
    function mixin(obj) {
      if ("function" !== typeof Object.getOwnPropertyNames || "function" !== typeof Object.defineProperty || "function" !== typeof Object.getOwnPropertyDescriptor) {
        return copypaste.apply(null, arguments);
      }
      slice.call(arguments, 1).forEach(function forEach(o) {
        Object.getOwnPropertyNames(o).forEach(function eachAttr(attr) {
          Object.defineProperty(obj, attr, Object.getOwnPropertyDescriptor(o, attr));
        });
      });
      return obj;
    }
    function mode(parent) {
      try {
        var e = parent.caller || parent.arguments || parent.callee;
        return function child() {
          return parent.apply(this, arguments);
        };
      } catch (e2) {
      }
      return function child() {
        "use strict";
        return parent.apply(this, arguments);
      };
    }
    module2.exports = function extend(protoProps, staticProps) {
      var parent = this, child;
      if (protoProps && has.call(protoProps, "constructor")) {
        child = protoProps.constructor;
      } else {
        child = mode(parent);
      }
      function Surrogate() {
        this.constructor = child;
      }
      Surrogate.prototype = parent.prototype;
      child.prototype = new Surrogate();
      if (protoProps)
        mixin(child.prototype, protoProps);
      copypaste(child, parent, staticProps);
      child.__super__ = parent.prototype;
      return child;
    };
  }
});

// node_modules/predefine/index.js
var require_predefine = __commonJS({
  "node_modules/predefine/index.js"(exports, module2) {
    "use strict";
    var toString = Object.prototype.toString;
    var description = {
      configurable: "boolean",
      enumerable: "boolean",
      get: "function",
      set: "function",
      value: void 0,
      writable: "boolean"
    };
    function descriptor(obj) {
      if (!obj || "object" !== typeof obj || Array.isArray(obj))
        return false;
      var keys = Object.keys(obj);
      if (("value" in obj || "writable" in obj) && ("function" === typeof obj.set || "function" === typeof obj.get))
        return false;
      return !!keys.length && keys.every(function allowed(key) {
        var type = description[key], valid = type === void 0 || is(obj[key], type);
        return key in description && valid;
      });
    }
    function is(thing, type) {
      return toString.call(thing).toLowerCase().slice(8, -1) === type;
    }
    function predefine(obj, pattern) {
      pattern = pattern || predefine.READABLE;
      return function predefined(method, description2, clean) {
        if (!predefine.descriptor(description2) || is(description2, "object") && !clean && !predefine.descriptor(predefine.mixin({}, pattern, description2))) {
          description2 = {
            value: description2
          };
        }
        var described = Object.getOwnPropertyDescriptor(obj, method);
        if (described && !described.configurable) {
          return predefined;
        }
        Object.defineProperty(obj, method, !clean ? predefine.mixin({}, pattern, description2) : description2);
        return predefined;
      };
    }
    function lazy(obj, prop, fn) {
      Object.defineProperty(obj, prop, {
        configurable: true,
        get: function get() {
          return Object.defineProperty(this, prop, {
            value: fn.call(this)
          })[prop];
        },
        set: function set(value) {
          return Object.defineProperty(this, prop, {
            value
          })[prop];
        }
      });
    }
    var has = Object.prototype.hasOwnProperty;
    function remove(obj, keep) {
      if (!obj)
        return false;
      keep = keep || [];
      for (var prop in obj) {
        if (has.call(obj, prop) && !~keep.indexOf(prop)) {
          delete obj[prop];
        }
      }
      return true;
    }
    function create(property, description2, pattern) {
      pattern = pattern || {};
      if (!predefine.descriptor(description2))
        description2 = {
          enumberable: false,
          value: description2
        };
      var definition = {};
      definition[property] = predefine.mixin(pattern, description2);
      return definition;
    }
    function mixin(target) {
      Array.prototype.slice.call(arguments, 1).forEach(function forEach(o) {
        Object.getOwnPropertyNames(o).forEach(function eachAttr(attr) {
          Object.defineProperty(target, attr, Object.getOwnPropertyDescriptor(o, attr));
        });
      });
      return target;
    }
    function each(collection, iterator, context) {
      if (arguments.length === 1) {
        iterator = collection;
        collection = this;
      }
      var isArray = Array.isArray(collection || this), length = collection.length, i = 0, value;
      if (context) {
        if (isArray) {
          for (; i < length; i++) {
            value = iterator.apply(collection[i], context);
            if (value === false)
              break;
          }
        } else {
          for (i in collection) {
            value = iterator.apply(collection[i], context);
            if (value === false)
              break;
          }
        }
      } else {
        if (isArray) {
          for (; i < length; i++) {
            value = iterator.call(collection[i], i, collection[i]);
            if (value === false)
              break;
          }
        } else {
          for (i in collection) {
            value = iterator.call(collection[i], i, collection[i]);
            if (value === false)
              break;
          }
        }
      }
      return this;
    }
    function merge(target, additional) {
      var result = target, undefined2;
      if (Array.isArray(target)) {
        each(additional, function arrayForEach(index) {
          if (JSON.stringify(target).indexOf(JSON.stringify(additional[index])) === -1) {
            result.push(additional[index]);
          }
        });
      } else if ("object" === typeof target) {
        each(additional, function objectForEach(key, value) {
          if (target[key] === undefined2) {
            result[key] = value;
          } else if (has.call(target, key)) {
            result[key] = merge(target[key], additional[key]);
          }
        });
      } else {
        result = additional;
      }
      return result;
    }
    predefine.extend = require_extendible();
    predefine.descriptor = descriptor;
    predefine.create = create;
    predefine.remove = remove;
    predefine.merge = merge;
    predefine.mixin = mixin;
    predefine.each = each;
    predefine.lazy = lazy;
    predefine.WRITABLE = {
      configurable: true,
      enumerable: false,
      writable: true
    };
    predefine.READABLE = {
      enumerable: false,
      writable: false
    };
    module2.exports = predefine;
  }
});

// node_modules/emits/index.js
var require_emits = __commonJS({
  "node_modules/emits/index.js"(exports, module2) {
    "use strict";
    module2.exports = function emits() {
      var self = this, parser;
      for (var i = 0, l = arguments.length, args = new Array(l); i < l; i++) {
        args[i] = arguments[i];
      }
      if ("function" !== typeof args[args.length - 1])
        return function emitter() {
          for (var i2 = 0, l2 = arguments.length, arg = new Array(l2); i2 < l2; i2++) {
            arg[i2] = arguments[i2];
          }
          return self.emit.apply(self, args.concat(arg));
        };
      parser = args.pop();
      return function emitter() {
        for (var i2 = 0, l2 = arguments.length, arg = new Array(l2 + 1); i2 < l2; i2++) {
          arg[i2 + 1] = arguments[i2];
        }
        arg[0] = function next(err, returned) {
          if (err)
            return self.emit("error", err);
          arg = returned === void 0 ? arg.slice(1) : returned === null ? [] : returned;
          self.emit.apply(self, args.concat(arg));
        };
        parser.apply(self, arg);
        return true;
      };
    };
  }
});

// node_modules/fusing/index.js
var require_fusing = __commonJS({
  "node_modules/fusing/index.js"(exports, module2) {
    "use strict";
    var predefine = require_predefine();
    var slice = Array.prototype.slice;
    var emits = require_emits();
    var path = require("path");
    module2.exports = function fuse(Base, inherits, options) {
      options = options || {};
      if ("function" === typeof inherits) {
        Base.prototype.__proto__ = inherits.prototype;
      } else if ("object" === typeof inherits) {
        options = inherits;
        inherits = null;
      }
      Base.writable = predefine(Base.prototype, predefine.WRITABLE);
      Base.readable = predefine(Base.prototype, {
        configurable: false,
        enumerable: false,
        writable: false
      });
      Base.get = function get(method, getter) {
        Object.defineProperty(Base.prototype, method, {
          configurable: false,
          enumerable: false,
          get: getter
        });
        return get;
      };
      Base.set = function set(method, getter, setter) {
        Object.defineProperty(Base.prototype, method, {
          configurable: false,
          enumerable: false,
          get: getter,
          set: setter
        });
        return set;
      };
      Base.writable("constructor", Base);
      var fused = Base.prototype.fuse;
      Base.writable("fuse", function fuse2(args) {
        var writable = predefine(this, predefine.WRITABLE);
        if (!this.writable)
          writable("writable", writable);
        if (!this.readable)
          writable("readable", predefine(this));
        if (fused)
          this.fuse = fused;
        if ("function" === typeof inherits) {
          inherits.apply(this, args || arguments);
        }
      });
      Base.extend = predefine.extend;
      Base.predefine = predefine;
      if (options.defaults === false)
        return Base;
      if (options.mixin !== false)
        Base.readable("mixin", predefine.mixin);
      if (options.merge !== false)
        Base.readable("merge", predefine.merge);
      if (options.emits !== false)
        Base.readable("emits", emits);
      return Base;
    };
  }
});

// node_modules/eventemitter3/index.js
var require_eventemitter3 = __commonJS({
  "node_modules/eventemitter3/index.js"(exports, module2) {
    "use strict";
    var has = Object.prototype.hasOwnProperty;
    var prefix = "~";
    function Events() {
    }
    if (Object.create) {
      Events.prototype = /* @__PURE__ */ Object.create(null);
      if (!new Events().__proto__)
        prefix = false;
    }
    function EE(fn, context, once) {
      this.fn = fn;
      this.context = context;
      this.once = once || false;
    }
    function addListener(emitter, event, fn, context, once) {
      if (typeof fn !== "function") {
        throw new TypeError("The listener must be a function");
      }
      var listener = new EE(fn, context || emitter, once), evt = prefix ? prefix + event : event;
      if (!emitter._events[evt])
        emitter._events[evt] = listener, emitter._eventsCount++;
      else if (!emitter._events[evt].fn)
        emitter._events[evt].push(listener);
      else
        emitter._events[evt] = [emitter._events[evt], listener];
      return emitter;
    }
    function clearEvent(emitter, evt) {
      if (--emitter._eventsCount === 0)
        emitter._events = new Events();
      else
        delete emitter._events[evt];
    }
    function EventEmitter() {
      this._events = new Events();
      this._eventsCount = 0;
    }
    EventEmitter.prototype.eventNames = function eventNames() {
      var names = [], events, name;
      if (this._eventsCount === 0)
        return names;
      for (name in events = this._events) {
        if (has.call(events, name))
          names.push(prefix ? name.slice(1) : name);
      }
      if (Object.getOwnPropertySymbols) {
        return names.concat(Object.getOwnPropertySymbols(events));
      }
      return names;
    };
    EventEmitter.prototype.listeners = function listeners(event) {
      var evt = prefix ? prefix + event : event, handlers = this._events[evt];
      if (!handlers)
        return [];
      if (handlers.fn)
        return [handlers.fn];
      for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
        ee[i] = handlers[i].fn;
      }
      return ee;
    };
    EventEmitter.prototype.listenerCount = function listenerCount(event) {
      var evt = prefix ? prefix + event : event, listeners = this._events[evt];
      if (!listeners)
        return 0;
      if (listeners.fn)
        return 1;
      return listeners.length;
    };
    EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
      var evt = prefix ? prefix + event : event;
      if (!this._events[evt])
        return false;
      var listeners = this._events[evt], len = arguments.length, args, i;
      if (listeners.fn) {
        if (listeners.once)
          this.removeListener(event, listeners.fn, void 0, true);
        switch (len) {
          case 1:
            return listeners.fn.call(listeners.context), true;
          case 2:
            return listeners.fn.call(listeners.context, a1), true;
          case 3:
            return listeners.fn.call(listeners.context, a1, a2), true;
          case 4:
            return listeners.fn.call(listeners.context, a1, a2, a3), true;
          case 5:
            return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
          case 6:
            return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
        }
        for (i = 1, args = new Array(len - 1); i < len; i++) {
          args[i - 1] = arguments[i];
        }
        listeners.fn.apply(listeners.context, args);
      } else {
        var length = listeners.length, j;
        for (i = 0; i < length; i++) {
          if (listeners[i].once)
            this.removeListener(event, listeners[i].fn, void 0, true);
          switch (len) {
            case 1:
              listeners[i].fn.call(listeners[i].context);
              break;
            case 2:
              listeners[i].fn.call(listeners[i].context, a1);
              break;
            case 3:
              listeners[i].fn.call(listeners[i].context, a1, a2);
              break;
            case 4:
              listeners[i].fn.call(listeners[i].context, a1, a2, a3);
              break;
            default:
              if (!args)
                for (j = 1, args = new Array(len - 1); j < len; j++) {
                  args[j - 1] = arguments[j];
                }
              listeners[i].fn.apply(listeners[i].context, args);
          }
        }
      }
      return true;
    };
    EventEmitter.prototype.on = function on(event, fn, context) {
      return addListener(this, event, fn, context, false);
    };
    EventEmitter.prototype.once = function once(event, fn, context) {
      return addListener(this, event, fn, context, true);
    };
    EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
      var evt = prefix ? prefix + event : event;
      if (!this._events[evt])
        return this;
      if (!fn) {
        clearEvent(this, evt);
        return this;
      }
      var listeners = this._events[evt];
      if (listeners.fn) {
        if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
          clearEvent(this, evt);
        }
      } else {
        for (var i = 0, events = [], length = listeners.length; i < length; i++) {
          if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
            events.push(listeners[i]);
          }
        }
        if (events.length)
          this._events[evt] = events.length === 1 ? events[0] : events;
        else
          clearEvent(this, evt);
      }
      return this;
    };
    EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
      var evt;
      if (event) {
        evt = prefix ? prefix + event : event;
        if (this._events[evt])
          clearEvent(this, evt);
      } else {
        this._events = new Events();
        this._eventsCount = 0;
      }
      return this;
    };
    EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
    EventEmitter.prototype.addListener = EventEmitter.prototype.on;
    EventEmitter.prefixed = prefix;
    EventEmitter.EventEmitter = EventEmitter;
    if ("undefined" !== typeof module2) {
      module2.exports = EventEmitter;
    }
  }
});

// node_modules/primus/transformer.js
var require_transformer = __commonJS({
  "node_modules/primus/transformer.js"(exports, module2) {
    "use strict";
    var log = require_node()("primus:transformer");
    var middlewareError = require_error();
    var url = require("url").parse;
    var Ultron = require_ultron();
    var fuse = require_fusing();
    function noop() {
    }
    function Transformer(primus) {
      this.fuse();
      this.ultron = new Ultron(primus.server);
      this.Spark = primus.Spark;
      this.primus = primus;
      this.service = null;
      this.initialise();
    }
    fuse(Transformer, require_eventemitter3());
    Object.defineProperty(Transformer.prototype, "logger", {
      get: function logger() {
        return {
          error: this.primus.emits("log", "error"),
          warn: this.primus.emits("log", "warn"),
          info: this.primus.emits("log", "info"),
          debug: this.primus.emits("log", "debug"),
          log: this.primus.emits("log", "log"),
          plain: this.primus.emits("log", "log")
        };
      }
    });
    Transformer.readable("initialise", function initialise() {
      if (this.server)
        this.server();
      var server = this.primus.server, transformer = this;
      server.listeners("request").forEach(function each(fn) {
        log("found existing request handlers on the HTTP server, moving Primus as first");
        transformer.on("previous::request", fn, server);
      });
      server.listeners("upgrade").forEach(function each(fn) {
        log("found existing upgrade handlers on the HTTP server, moving Primus as first");
        transformer.on("previous::upgrade", fn, server);
      });
      server.removeAllListeners("request");
      server.removeAllListeners("upgrade");
      this.ultron.on("close", function close() {
        log("the HTTP server is closing");
        transformer.emit("close");
      });
      if (this.listeners("request").length || this.listeners("previous::request").length) {
        server.on("request", this.request.bind(this));
      }
      if (this.listeners("upgrade").length || this.listeners("previous::upgrade").length) {
        server.on("upgrade", this.upgrade.bind(this));
      }
    });
    Transformer.readable("forEach", function forEach(type, req, res, next) {
      var transformer = this, layers = transformer.primus.layers, primus = transformer.primus;
      req.query = req.uri.query || {};
      req.originalUrl = req.url;
      if (!layers.length) {
        next();
        return transformer;
      }
      (function iterate(index) {
        var layer = layers[index++];
        if (!layer)
          return next();
        if (!layer.enabled || layer.fn[type] === false)
          return iterate(index);
        if (layer.length === 2) {
          log("executing middleware (%s) synchronously", layer.name);
          if (layer.fn.call(primus, req, res))
            return;
          return iterate(index);
        }
        log("executing middleware (%s) asynchronously", layer.name);
        layer.fn.call(primus, req, res, function done(err) {
          if (err)
            return middlewareError(err, req, res);
          iterate(index);
        });
      })(0);
      return transformer;
    });
    Transformer.readable("request", function request(req, res) {
      if (!this.test(req))
        return this.emit("previous::request", req, res);
      req.headers["primus::req::backup"] = req;
      res.once("end", function gc() {
        delete req.headers["primus::req::backup"];
      });
      log("handling HTTP request for url: %s", req.url);
      this.forEach("http", req, res, this.emits("request", req, res));
    });
    Transformer.readable("upgrade", function upgrade(req, socket, head) {
      if (!this.test(req))
        return this.emit("previous::upgrade", req, socket, head);
      req.headers["primus::req::backup"] = req;
      socket.once("end", function gc() {
        delete req.headers["primus::req::backup"];
      });
      log("handling HTTP upgrade for url: %s", req.url);
      socket.on("error", noop);
      this.forEach("upgrade", req, socket, () => {
        socket.removeListener("error", noop);
        this.emit("upgrade", req, socket, head);
      });
    });
    Transformer.readable("test", function test(req) {
      req.uri = url(req.url, true);
      var pathname = req.uri.pathname || "/", route = this.primus.pathname;
      return pathname.slice(0, route.length) === route;
    });
    module2.exports = Transformer;
  }
});

// node_modules/primus/transformers/websockets/server.js
var require_server = __commonJS({
  "node_modules/primus/transformers/websockets/server.js"(exports, module2) {
    "use strict";
    var http = require("http");
    var url = require("url");
    var ws2 = require_ws();
    module2.exports = function server() {
      this.service = new ws2.Server(Object.assign({
        perMessageDeflate: !!this.primus.options.compression,
        maxPayload: this.primus.options.maxLength
      }, this.primus.options.transport, {
        clientTracking: false,
        noServer: true
      }));
      const noop = (err) => err && this.logger.error(err);
      this.on("upgrade", (req, socket, head) => {
        this.service.handleUpgrade(req, socket, head, (socket2) => {
          const spark = new this.Spark(req.headers, req, url.parse(req.url).query, null, req, socket2);
          spark.on("outgoing::end", () => socket2 && socket2.close());
          spark.on("outgoing::data", (data) => {
            if (socket2.readyState !== socket2.OPEN)
              return;
            socket2.send(data, noop);
          });
          socket2.on("message", spark.emits("incoming::data", (next, data, isBinary) => {
            next(void 0, isBinary === false ? data.toString() : data);
          }));
          socket2.on("error", spark.emits("incoming::error"));
          socket2.on("ping", spark.emits("incoming::pong", (next) => {
            next(void 0, null);
          }));
          socket2.on("close", spark.emits("incoming::end", (next) => {
            socket2.removeAllListeners();
            socket2 = null;
            next();
          }));
        });
      });
      this.on("request", (req, res) => {
        res.writeHead(426, { "content-type": "text/plain" });
        res.end(http.STATUS_CODES[426]);
      });
      this.once("close", () => this.service.close());
    };
  }
});

// node_modules/primus/transformers/websockets/client.js
var require_client = __commonJS({
  "node_modules/primus/transformers/websockets/client.js"(exports, module2) {
    "use strict";
    module2.exports = function client2() {
      var primus = this, socket;
      var Factory = function factory() {
        if ("undefined" !== typeof WebSocket)
          return WebSocket;
        if ("undefined" !== typeof MozWebSocket)
          return MozWebSocket;
        try {
          return Primus.requires("ws");
        } catch (e) {
        }
        return void 0;
      }();
      if (!Factory)
        return primus.critical(new Error("Missing required `ws` module. Please run `npm install --save ws`"));
      primus.on("outgoing::open", function opening() {
        primus.emit("outgoing::end");
        try {
          var options = {
            protocol: primus.url.protocol === "ws+unix:" ? "ws+unix:" : "ws:",
            query: true
          };
          if (Factory.length === 3) {
            if ("ws+unix:" === options.protocol) {
              options.pathname = "/" + primus.url.hostname + primus.url.pathname + ":" + primus.pathname;
            }
            primus.socket = socket = new Factory(primus.uri(options), [], primus.transport);
          } else {
            primus.socket = socket = new Factory(primus.uri(options));
            socket.binaryType = "arraybuffer";
          }
        } catch (e) {
          return primus.emit("error", e);
        }
        socket.onopen = primus.emits("incoming::open");
        socket.onerror = primus.emits("incoming::error");
        socket.onclose = primus.emits("incoming::end");
        socket.onmessage = primus.emits("incoming::data", function parse(next, evt) {
          next(void 0, evt.data);
        });
      });
      primus.on("outgoing::data", function write(message) {
        if (!socket || socket.readyState !== Factory.OPEN)
          return;
        try {
          socket.send(message);
        } catch (e) {
          primus.emit("incoming::error", e);
        }
      });
      primus.on("outgoing::reconnect", function reconnect() {
        primus.emit("outgoing::open");
      });
      primus.on("outgoing::end", function close() {
        if (!socket)
          return;
        socket.onerror = socket.onopen = socket.onclose = socket.onmessage = function() {
        };
        socket.close();
        socket = null;
      });
    };
  }
});

// node_modules/primus/transformers/websockets/index.js
var require_websockets = __commonJS({
  "node_modules/primus/transformers/websockets/index.js"(exports, module2) {
    "use strict";
    module2.exports = require_transformer().extend({
      server: require_server(),
      client: require_client()
    });
  }
});

// node_modules/@actions/core/lib/utils.js
var require_utils = __commonJS({
  "node_modules/@actions/core/lib/utils.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toCommandProperties = exports.toCommandValue = void 0;
    function toCommandValue(input) {
      if (input === null || input === void 0) {
        return "";
      } else if (typeof input === "string" || input instanceof String) {
        return input;
      }
      return JSON.stringify(input);
    }
    exports.toCommandValue = toCommandValue;
    function toCommandProperties(annotationProperties) {
      if (!Object.keys(annotationProperties).length) {
        return {};
      }
      return {
        title: annotationProperties.title,
        file: annotationProperties.file,
        line: annotationProperties.startLine,
        endLine: annotationProperties.endLine,
        col: annotationProperties.startColumn,
        endColumn: annotationProperties.endColumn
      };
    }
    exports.toCommandProperties = toCommandProperties;
  }
});

// node_modules/@actions/core/lib/command.js
var require_command = __commonJS({
  "node_modules/@actions/core/lib/command.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.issue = exports.issueCommand = void 0;
    var os = __importStar(require("os"));
    var utils_1 = require_utils();
    function issueCommand(command, properties, message) {
      const cmd = new Command(command, properties, message);
      process.stdout.write(cmd.toString() + os.EOL);
    }
    exports.issueCommand = issueCommand;
    function issue(name, message = "") {
      issueCommand(name, {}, message);
    }
    exports.issue = issue;
    var CMD_STRING = "::";
    var Command = class {
      constructor(command, properties, message) {
        if (!command) {
          command = "missing.command";
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
      }
      toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
          cmdStr += " ";
          let first = true;
          for (const key in this.properties) {
            if (this.properties.hasOwnProperty(key)) {
              const val = this.properties[key];
              if (val) {
                if (first) {
                  first = false;
                } else {
                  cmdStr += ",";
                }
                cmdStr += `${key}=${escapeProperty(val)}`;
              }
            }
          }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
      }
    };
    function escapeData(s) {
      return utils_1.toCommandValue(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
    }
    function escapeProperty(s) {
      return utils_1.toCommandValue(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A").replace(/:/g, "%3A").replace(/,/g, "%2C");
    }
  }
});

// node_modules/@actions/core/lib/file-command.js
var require_file_command = __commonJS({
  "node_modules/@actions/core/lib/file-command.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.issueCommand = void 0;
    var fs = __importStar(require("fs"));
    var os = __importStar(require("os"));
    var utils_1 = require_utils();
    function issueCommand(command, message) {
      const filePath = process.env[`GITHUB_${command}`];
      if (!filePath) {
        throw new Error(`Unable to find environment variable for file command ${command}`);
      }
      if (!fs.existsSync(filePath)) {
        throw new Error(`Missing file at path: ${filePath}`);
      }
      fs.appendFileSync(filePath, `${utils_1.toCommandValue(message)}${os.EOL}`, {
        encoding: "utf8"
      });
    }
    exports.issueCommand = issueCommand;
  }
});

// node_modules/@actions/http-client/lib/proxy.js
var require_proxy = __commonJS({
  "node_modules/@actions/http-client/lib/proxy.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkBypass = exports.getProxyUrl = void 0;
    function getProxyUrl(reqUrl) {
      const usingSsl = reqUrl.protocol === "https:";
      if (checkBypass(reqUrl)) {
        return void 0;
      }
      const proxyVar = (() => {
        if (usingSsl) {
          return process.env["https_proxy"] || process.env["HTTPS_PROXY"];
        } else {
          return process.env["http_proxy"] || process.env["HTTP_PROXY"];
        }
      })();
      if (proxyVar) {
        return new URL(proxyVar);
      } else {
        return void 0;
      }
    }
    exports.getProxyUrl = getProxyUrl;
    function checkBypass(reqUrl) {
      if (!reqUrl.hostname) {
        return false;
      }
      const noProxy = process.env["no_proxy"] || process.env["NO_PROXY"] || "";
      if (!noProxy) {
        return false;
      }
      let reqPort;
      if (reqUrl.port) {
        reqPort = Number(reqUrl.port);
      } else if (reqUrl.protocol === "http:") {
        reqPort = 80;
      } else if (reqUrl.protocol === "https:") {
        reqPort = 443;
      }
      const upperReqHosts = [reqUrl.hostname.toUpperCase()];
      if (typeof reqPort === "number") {
        upperReqHosts.push(`${upperReqHosts[0]}:${reqPort}`);
      }
      for (const upperNoProxyItem of noProxy.split(",").map((x) => x.trim().toUpperCase()).filter((x) => x)) {
        if (upperReqHosts.some((x) => x === upperNoProxyItem)) {
          return true;
        }
      }
      return false;
    }
    exports.checkBypass = checkBypass;
  }
});

// node_modules/tunnel/lib/tunnel.js
var require_tunnel = __commonJS({
  "node_modules/tunnel/lib/tunnel.js"(exports) {
    "use strict";
    var net = require("net");
    var tls = require("tls");
    var http = require("http");
    var https = require("https");
    var events = require("events");
    var assert = require("assert");
    var util = require("util");
    exports.httpOverHttp = httpOverHttp;
    exports.httpsOverHttp = httpsOverHttp;
    exports.httpOverHttps = httpOverHttps;
    exports.httpsOverHttps = httpsOverHttps;
    function httpOverHttp(options) {
      var agent = new TunnelingAgent(options);
      agent.request = http.request;
      return agent;
    }
    function httpsOverHttp(options) {
      var agent = new TunnelingAgent(options);
      agent.request = http.request;
      agent.createSocket = createSecureSocket;
      agent.defaultPort = 443;
      return agent;
    }
    function httpOverHttps(options) {
      var agent = new TunnelingAgent(options);
      agent.request = https.request;
      return agent;
    }
    function httpsOverHttps(options) {
      var agent = new TunnelingAgent(options);
      agent.request = https.request;
      agent.createSocket = createSecureSocket;
      agent.defaultPort = 443;
      return agent;
    }
    function TunnelingAgent(options) {
      var self = this;
      self.options = options || {};
      self.proxyOptions = self.options.proxy || {};
      self.maxSockets = self.options.maxSockets || http.Agent.defaultMaxSockets;
      self.requests = [];
      self.sockets = [];
      self.on("free", function onFree(socket, host, port, localAddress) {
        var options2 = toOptions(host, port, localAddress);
        for (var i = 0, len = self.requests.length; i < len; ++i) {
          var pending = self.requests[i];
          if (pending.host === options2.host && pending.port === options2.port) {
            self.requests.splice(i, 1);
            pending.request.onSocket(socket);
            return;
          }
        }
        socket.destroy();
        self.removeSocket(socket);
      });
    }
    util.inherits(TunnelingAgent, events.EventEmitter);
    TunnelingAgent.prototype.addRequest = function addRequest(req, host, port, localAddress) {
      var self = this;
      var options = mergeOptions({ request: req }, self.options, toOptions(host, port, localAddress));
      if (self.sockets.length >= this.maxSockets) {
        self.requests.push(options);
        return;
      }
      self.createSocket(options, function(socket) {
        socket.on("free", onFree);
        socket.on("close", onCloseOrRemove);
        socket.on("agentRemove", onCloseOrRemove);
        req.onSocket(socket);
        function onFree() {
          self.emit("free", socket, options);
        }
        function onCloseOrRemove(err) {
          self.removeSocket(socket);
          socket.removeListener("free", onFree);
          socket.removeListener("close", onCloseOrRemove);
          socket.removeListener("agentRemove", onCloseOrRemove);
        }
      });
    };
    TunnelingAgent.prototype.createSocket = function createSocket(options, cb) {
      var self = this;
      var placeholder = {};
      self.sockets.push(placeholder);
      var connectOptions = mergeOptions({}, self.proxyOptions, {
        method: "CONNECT",
        path: options.host + ":" + options.port,
        agent: false,
        headers: {
          host: options.host + ":" + options.port
        }
      });
      if (options.localAddress) {
        connectOptions.localAddress = options.localAddress;
      }
      if (connectOptions.proxyAuth) {
        connectOptions.headers = connectOptions.headers || {};
        connectOptions.headers["Proxy-Authorization"] = "Basic " + new Buffer(connectOptions.proxyAuth).toString("base64");
      }
      debug("making CONNECT request");
      var connectReq = self.request(connectOptions);
      connectReq.useChunkedEncodingByDefault = false;
      connectReq.once("response", onResponse);
      connectReq.once("upgrade", onUpgrade);
      connectReq.once("connect", onConnect);
      connectReq.once("error", onError);
      connectReq.end();
      function onResponse(res) {
        res.upgrade = true;
      }
      function onUpgrade(res, socket, head) {
        process.nextTick(function() {
          onConnect(res, socket, head);
        });
      }
      function onConnect(res, socket, head) {
        connectReq.removeAllListeners();
        socket.removeAllListeners();
        if (res.statusCode !== 200) {
          debug("tunneling socket could not be established, statusCode=%d", res.statusCode);
          socket.destroy();
          var error = new Error("tunneling socket could not be established, statusCode=" + res.statusCode);
          error.code = "ECONNRESET";
          options.request.emit("error", error);
          self.removeSocket(placeholder);
          return;
        }
        if (head.length > 0) {
          debug("got illegal response body from proxy");
          socket.destroy();
          var error = new Error("got illegal response body from proxy");
          error.code = "ECONNRESET";
          options.request.emit("error", error);
          self.removeSocket(placeholder);
          return;
        }
        debug("tunneling connection has established");
        self.sockets[self.sockets.indexOf(placeholder)] = socket;
        return cb(socket);
      }
      function onError(cause) {
        connectReq.removeAllListeners();
        debug("tunneling socket could not be established, cause=%s\n", cause.message, cause.stack);
        var error = new Error("tunneling socket could not be established, cause=" + cause.message);
        error.code = "ECONNRESET";
        options.request.emit("error", error);
        self.removeSocket(placeholder);
      }
    };
    TunnelingAgent.prototype.removeSocket = function removeSocket(socket) {
      var pos = this.sockets.indexOf(socket);
      if (pos === -1) {
        return;
      }
      this.sockets.splice(pos, 1);
      var pending = this.requests.shift();
      if (pending) {
        this.createSocket(pending, function(socket2) {
          pending.request.onSocket(socket2);
        });
      }
    };
    function createSecureSocket(options, cb) {
      var self = this;
      TunnelingAgent.prototype.createSocket.call(self, options, function(socket) {
        var hostHeader = options.request.getHeader("host");
        var tlsOptions = mergeOptions({}, self.options, {
          socket,
          servername: hostHeader ? hostHeader.replace(/:.*$/, "") : options.host
        });
        var secureSocket = tls.connect(0, tlsOptions);
        self.sockets[self.sockets.indexOf(socket)] = secureSocket;
        cb(secureSocket);
      });
    }
    function toOptions(host, port, localAddress) {
      if (typeof host === "string") {
        return {
          host,
          port,
          localAddress
        };
      }
      return host;
    }
    function mergeOptions(target) {
      for (var i = 1, len = arguments.length; i < len; ++i) {
        var overrides = arguments[i];
        if (typeof overrides === "object") {
          var keys = Object.keys(overrides);
          for (var j = 0, keyLen = keys.length; j < keyLen; ++j) {
            var k = keys[j];
            if (overrides[k] !== void 0) {
              target[k] = overrides[k];
            }
          }
        }
      }
      return target;
    }
    var debug;
    if (process.env.NODE_DEBUG && /\btunnel\b/.test(process.env.NODE_DEBUG)) {
      debug = function() {
        var args = Array.prototype.slice.call(arguments);
        if (typeof args[0] === "string") {
          args[0] = "TUNNEL: " + args[0];
        } else {
          args.unshift("TUNNEL:");
        }
        console.error.apply(console, args);
      };
    } else {
      debug = function() {
      };
    }
    exports.debug = debug;
  }
});

// node_modules/tunnel/index.js
var require_tunnel2 = __commonJS({
  "node_modules/tunnel/index.js"(exports, module2) {
    module2.exports = require_tunnel();
  }
});

// node_modules/@actions/http-client/lib/index.js
var require_lib = __commonJS({
  "node_modules/@actions/http-client/lib/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HttpClient = exports.isHttps = exports.HttpClientResponse = exports.HttpClientError = exports.getProxyUrl = exports.MediaTypes = exports.Headers = exports.HttpCodes = void 0;
    var http = __importStar(require("http"));
    var https = __importStar(require("https"));
    var pm = __importStar(require_proxy());
    var tunnel = __importStar(require_tunnel2());
    var HttpCodes;
    (function(HttpCodes2) {
      HttpCodes2[HttpCodes2["OK"] = 200] = "OK";
      HttpCodes2[HttpCodes2["MultipleChoices"] = 300] = "MultipleChoices";
      HttpCodes2[HttpCodes2["MovedPermanently"] = 301] = "MovedPermanently";
      HttpCodes2[HttpCodes2["ResourceMoved"] = 302] = "ResourceMoved";
      HttpCodes2[HttpCodes2["SeeOther"] = 303] = "SeeOther";
      HttpCodes2[HttpCodes2["NotModified"] = 304] = "NotModified";
      HttpCodes2[HttpCodes2["UseProxy"] = 305] = "UseProxy";
      HttpCodes2[HttpCodes2["SwitchProxy"] = 306] = "SwitchProxy";
      HttpCodes2[HttpCodes2["TemporaryRedirect"] = 307] = "TemporaryRedirect";
      HttpCodes2[HttpCodes2["PermanentRedirect"] = 308] = "PermanentRedirect";
      HttpCodes2[HttpCodes2["BadRequest"] = 400] = "BadRequest";
      HttpCodes2[HttpCodes2["Unauthorized"] = 401] = "Unauthorized";
      HttpCodes2[HttpCodes2["PaymentRequired"] = 402] = "PaymentRequired";
      HttpCodes2[HttpCodes2["Forbidden"] = 403] = "Forbidden";
      HttpCodes2[HttpCodes2["NotFound"] = 404] = "NotFound";
      HttpCodes2[HttpCodes2["MethodNotAllowed"] = 405] = "MethodNotAllowed";
      HttpCodes2[HttpCodes2["NotAcceptable"] = 406] = "NotAcceptable";
      HttpCodes2[HttpCodes2["ProxyAuthenticationRequired"] = 407] = "ProxyAuthenticationRequired";
      HttpCodes2[HttpCodes2["RequestTimeout"] = 408] = "RequestTimeout";
      HttpCodes2[HttpCodes2["Conflict"] = 409] = "Conflict";
      HttpCodes2[HttpCodes2["Gone"] = 410] = "Gone";
      HttpCodes2[HttpCodes2["TooManyRequests"] = 429] = "TooManyRequests";
      HttpCodes2[HttpCodes2["InternalServerError"] = 500] = "InternalServerError";
      HttpCodes2[HttpCodes2["NotImplemented"] = 501] = "NotImplemented";
      HttpCodes2[HttpCodes2["BadGateway"] = 502] = "BadGateway";
      HttpCodes2[HttpCodes2["ServiceUnavailable"] = 503] = "ServiceUnavailable";
      HttpCodes2[HttpCodes2["GatewayTimeout"] = 504] = "GatewayTimeout";
    })(HttpCodes = exports.HttpCodes || (exports.HttpCodes = {}));
    var Headers;
    (function(Headers2) {
      Headers2["Accept"] = "accept";
      Headers2["ContentType"] = "content-type";
    })(Headers = exports.Headers || (exports.Headers = {}));
    var MediaTypes;
    (function(MediaTypes2) {
      MediaTypes2["ApplicationJson"] = "application/json";
    })(MediaTypes = exports.MediaTypes || (exports.MediaTypes = {}));
    function getProxyUrl(serverUrl) {
      const proxyUrl = pm.getProxyUrl(new URL(serverUrl));
      return proxyUrl ? proxyUrl.href : "";
    }
    exports.getProxyUrl = getProxyUrl;
    var HttpRedirectCodes = [
      HttpCodes.MovedPermanently,
      HttpCodes.ResourceMoved,
      HttpCodes.SeeOther,
      HttpCodes.TemporaryRedirect,
      HttpCodes.PermanentRedirect
    ];
    var HttpResponseRetryCodes = [
      HttpCodes.BadGateway,
      HttpCodes.ServiceUnavailable,
      HttpCodes.GatewayTimeout
    ];
    var RetryableHttpVerbs = ["OPTIONS", "GET", "DELETE", "HEAD"];
    var ExponentialBackoffCeiling = 10;
    var ExponentialBackoffTimeSlice = 5;
    var HttpClientError = class extends Error {
      constructor(message, statusCode) {
        super(message);
        this.name = "HttpClientError";
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, HttpClientError.prototype);
      }
    };
    exports.HttpClientError = HttpClientError;
    var HttpClientResponse = class {
      constructor(message) {
        this.message = message;
      }
      readBody() {
        return __awaiter(this, void 0, void 0, function* () {
          return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            let output = Buffer.alloc(0);
            this.message.on("data", (chunk) => {
              output = Buffer.concat([output, chunk]);
            });
            this.message.on("end", () => {
              resolve(output.toString());
            });
          }));
        });
      }
    };
    exports.HttpClientResponse = HttpClientResponse;
    function isHttps(requestUrl) {
      const parsedUrl = new URL(requestUrl);
      return parsedUrl.protocol === "https:";
    }
    exports.isHttps = isHttps;
    var HttpClient = class {
      constructor(userAgent, handlers, requestOptions) {
        this._ignoreSslError = false;
        this._allowRedirects = true;
        this._allowRedirectDowngrade = false;
        this._maxRedirects = 50;
        this._allowRetries = false;
        this._maxRetries = 1;
        this._keepAlive = false;
        this._disposed = false;
        this.userAgent = userAgent;
        this.handlers = handlers || [];
        this.requestOptions = requestOptions;
        if (requestOptions) {
          if (requestOptions.ignoreSslError != null) {
            this._ignoreSslError = requestOptions.ignoreSslError;
          }
          this._socketTimeout = requestOptions.socketTimeout;
          if (requestOptions.allowRedirects != null) {
            this._allowRedirects = requestOptions.allowRedirects;
          }
          if (requestOptions.allowRedirectDowngrade != null) {
            this._allowRedirectDowngrade = requestOptions.allowRedirectDowngrade;
          }
          if (requestOptions.maxRedirects != null) {
            this._maxRedirects = Math.max(requestOptions.maxRedirects, 0);
          }
          if (requestOptions.keepAlive != null) {
            this._keepAlive = requestOptions.keepAlive;
          }
          if (requestOptions.allowRetries != null) {
            this._allowRetries = requestOptions.allowRetries;
          }
          if (requestOptions.maxRetries != null) {
            this._maxRetries = requestOptions.maxRetries;
          }
        }
      }
      options(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.request("OPTIONS", requestUrl, null, additionalHeaders || {});
        });
      }
      get(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.request("GET", requestUrl, null, additionalHeaders || {});
        });
      }
      del(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.request("DELETE", requestUrl, null, additionalHeaders || {});
        });
      }
      post(requestUrl, data, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.request("POST", requestUrl, data, additionalHeaders || {});
        });
      }
      patch(requestUrl, data, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.request("PATCH", requestUrl, data, additionalHeaders || {});
        });
      }
      put(requestUrl, data, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.request("PUT", requestUrl, data, additionalHeaders || {});
        });
      }
      head(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.request("HEAD", requestUrl, null, additionalHeaders || {});
        });
      }
      sendStream(verb, requestUrl, stream, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.request(verb, requestUrl, stream, additionalHeaders);
        });
      }
      getJson(requestUrl, additionalHeaders = {}) {
        return __awaiter(this, void 0, void 0, function* () {
          additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
          const res = yield this.get(requestUrl, additionalHeaders);
          return this._processResponse(res, this.requestOptions);
        });
      }
      postJson(requestUrl, obj, additionalHeaders = {}) {
        return __awaiter(this, void 0, void 0, function* () {
          const data = JSON.stringify(obj, null, 2);
          additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
          additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
          const res = yield this.post(requestUrl, data, additionalHeaders);
          return this._processResponse(res, this.requestOptions);
        });
      }
      putJson(requestUrl, obj, additionalHeaders = {}) {
        return __awaiter(this, void 0, void 0, function* () {
          const data = JSON.stringify(obj, null, 2);
          additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
          additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
          const res = yield this.put(requestUrl, data, additionalHeaders);
          return this._processResponse(res, this.requestOptions);
        });
      }
      patchJson(requestUrl, obj, additionalHeaders = {}) {
        return __awaiter(this, void 0, void 0, function* () {
          const data = JSON.stringify(obj, null, 2);
          additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
          additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
          const res = yield this.patch(requestUrl, data, additionalHeaders);
          return this._processResponse(res, this.requestOptions);
        });
      }
      request(verb, requestUrl, data, headers) {
        return __awaiter(this, void 0, void 0, function* () {
          if (this._disposed) {
            throw new Error("Client has already been disposed.");
          }
          const parsedUrl = new URL(requestUrl);
          let info = this._prepareRequest(verb, parsedUrl, headers);
          const maxTries = this._allowRetries && RetryableHttpVerbs.includes(verb) ? this._maxRetries + 1 : 1;
          let numTries = 0;
          let response;
          do {
            response = yield this.requestRaw(info, data);
            if (response && response.message && response.message.statusCode === HttpCodes.Unauthorized) {
              let authenticationHandler;
              for (const handler of this.handlers) {
                if (handler.canHandleAuthentication(response)) {
                  authenticationHandler = handler;
                  break;
                }
              }
              if (authenticationHandler) {
                return authenticationHandler.handleAuthentication(this, info, data);
              } else {
                return response;
              }
            }
            let redirectsRemaining = this._maxRedirects;
            while (response.message.statusCode && HttpRedirectCodes.includes(response.message.statusCode) && this._allowRedirects && redirectsRemaining > 0) {
              const redirectUrl = response.message.headers["location"];
              if (!redirectUrl) {
                break;
              }
              const parsedRedirectUrl = new URL(redirectUrl);
              if (parsedUrl.protocol === "https:" && parsedUrl.protocol !== parsedRedirectUrl.protocol && !this._allowRedirectDowngrade) {
                throw new Error("Redirect from HTTPS to HTTP protocol. This downgrade is not allowed for security reasons. If you want to allow this behavior, set the allowRedirectDowngrade option to true.");
              }
              yield response.readBody();
              if (parsedRedirectUrl.hostname !== parsedUrl.hostname) {
                for (const header in headers) {
                  if (header.toLowerCase() === "authorization") {
                    delete headers[header];
                  }
                }
              }
              info = this._prepareRequest(verb, parsedRedirectUrl, headers);
              response = yield this.requestRaw(info, data);
              redirectsRemaining--;
            }
            if (!response.message.statusCode || !HttpResponseRetryCodes.includes(response.message.statusCode)) {
              return response;
            }
            numTries += 1;
            if (numTries < maxTries) {
              yield response.readBody();
              yield this._performExponentialBackoff(numTries);
            }
          } while (numTries < maxTries);
          return response;
        });
      }
      dispose() {
        if (this._agent) {
          this._agent.destroy();
        }
        this._disposed = true;
      }
      requestRaw(info, data) {
        return __awaiter(this, void 0, void 0, function* () {
          return new Promise((resolve, reject) => {
            function callbackForResult(err, res) {
              if (err) {
                reject(err);
              } else if (!res) {
                reject(new Error("Unknown error"));
              } else {
                resolve(res);
              }
            }
            this.requestRawWithCallback(info, data, callbackForResult);
          });
        });
      }
      requestRawWithCallback(info, data, onResult) {
        if (typeof data === "string") {
          if (!info.options.headers) {
            info.options.headers = {};
          }
          info.options.headers["Content-Length"] = Buffer.byteLength(data, "utf8");
        }
        let callbackCalled = false;
        function handleResult(err, res) {
          if (!callbackCalled) {
            callbackCalled = true;
            onResult(err, res);
          }
        }
        const req = info.httpModule.request(info.options, (msg) => {
          const res = new HttpClientResponse(msg);
          handleResult(void 0, res);
        });
        let socket;
        req.on("socket", (sock) => {
          socket = sock;
        });
        req.setTimeout(this._socketTimeout || 3 * 6e4, () => {
          if (socket) {
            socket.end();
          }
          handleResult(new Error(`Request timeout: ${info.options.path}`));
        });
        req.on("error", function(err) {
          handleResult(err);
        });
        if (data && typeof data === "string") {
          req.write(data, "utf8");
        }
        if (data && typeof data !== "string") {
          data.on("close", function() {
            req.end();
          });
          data.pipe(req);
        } else {
          req.end();
        }
      }
      getAgent(serverUrl) {
        const parsedUrl = new URL(serverUrl);
        return this._getAgent(parsedUrl);
      }
      _prepareRequest(method, requestUrl, headers) {
        const info = {};
        info.parsedUrl = requestUrl;
        const usingSsl = info.parsedUrl.protocol === "https:";
        info.httpModule = usingSsl ? https : http;
        const defaultPort = usingSsl ? 443 : 80;
        info.options = {};
        info.options.host = info.parsedUrl.hostname;
        info.options.port = info.parsedUrl.port ? parseInt(info.parsedUrl.port) : defaultPort;
        info.options.path = (info.parsedUrl.pathname || "") + (info.parsedUrl.search || "");
        info.options.method = method;
        info.options.headers = this._mergeHeaders(headers);
        if (this.userAgent != null) {
          info.options.headers["user-agent"] = this.userAgent;
        }
        info.options.agent = this._getAgent(info.parsedUrl);
        if (this.handlers) {
          for (const handler of this.handlers) {
            handler.prepareRequest(info.options);
          }
        }
        return info;
      }
      _mergeHeaders(headers) {
        if (this.requestOptions && this.requestOptions.headers) {
          return Object.assign({}, lowercaseKeys(this.requestOptions.headers), lowercaseKeys(headers || {}));
        }
        return lowercaseKeys(headers || {});
      }
      _getExistingOrDefaultHeader(additionalHeaders, header, _default) {
        let clientHeader;
        if (this.requestOptions && this.requestOptions.headers) {
          clientHeader = lowercaseKeys(this.requestOptions.headers)[header];
        }
        return additionalHeaders[header] || clientHeader || _default;
      }
      _getAgent(parsedUrl) {
        let agent;
        const proxyUrl = pm.getProxyUrl(parsedUrl);
        const useProxy = proxyUrl && proxyUrl.hostname;
        if (this._keepAlive && useProxy) {
          agent = this._proxyAgent;
        }
        if (this._keepAlive && !useProxy) {
          agent = this._agent;
        }
        if (agent) {
          return agent;
        }
        const usingSsl = parsedUrl.protocol === "https:";
        let maxSockets = 100;
        if (this.requestOptions) {
          maxSockets = this.requestOptions.maxSockets || http.globalAgent.maxSockets;
        }
        if (proxyUrl && proxyUrl.hostname) {
          const agentOptions = {
            maxSockets,
            keepAlive: this._keepAlive,
            proxy: Object.assign(Object.assign({}, (proxyUrl.username || proxyUrl.password) && {
              proxyAuth: `${proxyUrl.username}:${proxyUrl.password}`
            }), { host: proxyUrl.hostname, port: proxyUrl.port })
          };
          let tunnelAgent;
          const overHttps = proxyUrl.protocol === "https:";
          if (usingSsl) {
            tunnelAgent = overHttps ? tunnel.httpsOverHttps : tunnel.httpsOverHttp;
          } else {
            tunnelAgent = overHttps ? tunnel.httpOverHttps : tunnel.httpOverHttp;
          }
          agent = tunnelAgent(agentOptions);
          this._proxyAgent = agent;
        }
        if (this._keepAlive && !agent) {
          const options = { keepAlive: this._keepAlive, maxSockets };
          agent = usingSsl ? new https.Agent(options) : new http.Agent(options);
          this._agent = agent;
        }
        if (!agent) {
          agent = usingSsl ? https.globalAgent : http.globalAgent;
        }
        if (usingSsl && this._ignoreSslError) {
          agent.options = Object.assign(agent.options || {}, {
            rejectUnauthorized: false
          });
        }
        return agent;
      }
      _performExponentialBackoff(retryNumber) {
        return __awaiter(this, void 0, void 0, function* () {
          retryNumber = Math.min(ExponentialBackoffCeiling, retryNumber);
          const ms = ExponentialBackoffTimeSlice * Math.pow(2, retryNumber);
          return new Promise((resolve) => setTimeout(() => resolve(), ms));
        });
      }
      _processResponse(res, options) {
        return __awaiter(this, void 0, void 0, function* () {
          return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const statusCode = res.message.statusCode || 0;
            const response = {
              statusCode,
              result: null,
              headers: {}
            };
            if (statusCode === HttpCodes.NotFound) {
              resolve(response);
            }
            function dateTimeDeserializer(key, value) {
              if (typeof value === "string") {
                const a = new Date(value);
                if (!isNaN(a.valueOf())) {
                  return a;
                }
              }
              return value;
            }
            let obj;
            let contents;
            try {
              contents = yield res.readBody();
              if (contents && contents.length > 0) {
                if (options && options.deserializeDates) {
                  obj = JSON.parse(contents, dateTimeDeserializer);
                } else {
                  obj = JSON.parse(contents);
                }
                response.result = obj;
              }
              response.headers = res.message.headers;
            } catch (err) {
            }
            if (statusCode > 299) {
              let msg;
              if (obj && obj.message) {
                msg = obj.message;
              } else if (contents && contents.length > 0) {
                msg = contents;
              } else {
                msg = `Failed request: (${statusCode})`;
              }
              const err = new HttpClientError(msg, statusCode);
              err.result = response.result;
              reject(err);
            } else {
              resolve(response);
            }
          }));
        });
      }
    };
    exports.HttpClient = HttpClient;
    var lowercaseKeys = (obj) => Object.keys(obj).reduce((c, k) => (c[k.toLowerCase()] = obj[k], c), {});
  }
});

// node_modules/@actions/http-client/lib/auth.js
var require_auth = __commonJS({
  "node_modules/@actions/http-client/lib/auth.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PersonalAccessTokenCredentialHandler = exports.BearerCredentialHandler = exports.BasicCredentialHandler = void 0;
    var BasicCredentialHandler = class {
      constructor(username, password) {
        this.username = username;
        this.password = password;
      }
      prepareRequest(options) {
        if (!options.headers) {
          throw Error("The request has no headers");
        }
        options.headers["Authorization"] = `Basic ${Buffer.from(`${this.username}:${this.password}`).toString("base64")}`;
      }
      canHandleAuthentication() {
        return false;
      }
      handleAuthentication() {
        return __awaiter(this, void 0, void 0, function* () {
          throw new Error("not implemented");
        });
      }
    };
    exports.BasicCredentialHandler = BasicCredentialHandler;
    var BearerCredentialHandler = class {
      constructor(token) {
        this.token = token;
      }
      prepareRequest(options) {
        if (!options.headers) {
          throw Error("The request has no headers");
        }
        options.headers["Authorization"] = `Bearer ${this.token}`;
      }
      canHandleAuthentication() {
        return false;
      }
      handleAuthentication() {
        return __awaiter(this, void 0, void 0, function* () {
          throw new Error("not implemented");
        });
      }
    };
    exports.BearerCredentialHandler = BearerCredentialHandler;
    var PersonalAccessTokenCredentialHandler = class {
      constructor(token) {
        this.token = token;
      }
      prepareRequest(options) {
        if (!options.headers) {
          throw Error("The request has no headers");
        }
        options.headers["Authorization"] = `Basic ${Buffer.from(`PAT:${this.token}`).toString("base64")}`;
      }
      canHandleAuthentication() {
        return false;
      }
      handleAuthentication() {
        return __awaiter(this, void 0, void 0, function* () {
          throw new Error("not implemented");
        });
      }
    };
    exports.PersonalAccessTokenCredentialHandler = PersonalAccessTokenCredentialHandler;
  }
});

// node_modules/@actions/core/lib/oidc-utils.js
var require_oidc_utils = __commonJS({
  "node_modules/@actions/core/lib/oidc-utils.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OidcClient = void 0;
    var http_client_1 = require_lib();
    var auth_1 = require_auth();
    var core_1 = require_core();
    var OidcClient = class {
      static createHttpClient(allowRetry = true, maxRetry = 10) {
        const requestOptions = {
          allowRetries: allowRetry,
          maxRetries: maxRetry
        };
        return new http_client_1.HttpClient("actions/oidc-client", [new auth_1.BearerCredentialHandler(OidcClient.getRequestToken())], requestOptions);
      }
      static getRequestToken() {
        const token = process.env["ACTIONS_ID_TOKEN_REQUEST_TOKEN"];
        if (!token) {
          throw new Error("Unable to get ACTIONS_ID_TOKEN_REQUEST_TOKEN env variable");
        }
        return token;
      }
      static getIDTokenUrl() {
        const runtimeUrl = process.env["ACTIONS_ID_TOKEN_REQUEST_URL"];
        if (!runtimeUrl) {
          throw new Error("Unable to get ACTIONS_ID_TOKEN_REQUEST_URL env variable");
        }
        return runtimeUrl;
      }
      static getCall(id_token_url) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
          const httpclient = OidcClient.createHttpClient();
          const res = yield httpclient.getJson(id_token_url).catch((error) => {
            throw new Error(`Failed to get ID Token. 
 
        Error Code : ${error.statusCode}
 
        Error Message: ${error.result.message}`);
          });
          const id_token = (_a = res.result) === null || _a === void 0 ? void 0 : _a.value;
          if (!id_token) {
            throw new Error("Response json body do not have ID Token field");
          }
          return id_token;
        });
      }
      static getIDToken(audience) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            let id_token_url = OidcClient.getIDTokenUrl();
            if (audience) {
              const encodedAudience = encodeURIComponent(audience);
              id_token_url = `${id_token_url}&audience=${encodedAudience}`;
            }
            core_1.debug(`ID token url is ${id_token_url}`);
            const id_token = yield OidcClient.getCall(id_token_url);
            core_1.setSecret(id_token);
            return id_token;
          } catch (error) {
            throw new Error(`Error message: ${error.message}`);
          }
        });
      }
    };
    exports.OidcClient = OidcClient;
  }
});

// node_modules/@actions/core/lib/summary.js
var require_summary = __commonJS({
  "node_modules/@actions/core/lib/summary.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.summary = exports.markdownSummary = exports.SUMMARY_DOCS_URL = exports.SUMMARY_ENV_VAR = void 0;
    var os_1 = require("os");
    var fs_1 = require("fs");
    var { access, appendFile, writeFile } = fs_1.promises;
    exports.SUMMARY_ENV_VAR = "GITHUB_STEP_SUMMARY";
    exports.SUMMARY_DOCS_URL = "https://docs.github.com/actions/using-workflows/workflow-commands-for-github-actions#adding-a-job-summary";
    var Summary = class {
      constructor() {
        this._buffer = "";
      }
      filePath() {
        return __awaiter(this, void 0, void 0, function* () {
          if (this._filePath) {
            return this._filePath;
          }
          const pathFromEnv = process.env[exports.SUMMARY_ENV_VAR];
          if (!pathFromEnv) {
            throw new Error(`Unable to find environment variable for $${exports.SUMMARY_ENV_VAR}. Check if your runtime environment supports job summaries.`);
          }
          try {
            yield access(pathFromEnv, fs_1.constants.R_OK | fs_1.constants.W_OK);
          } catch (_a) {
            throw new Error(`Unable to access summary file: '${pathFromEnv}'. Check if the file has correct read/write permissions.`);
          }
          this._filePath = pathFromEnv;
          return this._filePath;
        });
      }
      wrap(tag, content, attrs = {}) {
        const htmlAttrs = Object.entries(attrs).map(([key, value]) => ` ${key}="${value}"`).join("");
        if (!content) {
          return `<${tag}${htmlAttrs}>`;
        }
        return `<${tag}${htmlAttrs}>${content}</${tag}>`;
      }
      write(options) {
        return __awaiter(this, void 0, void 0, function* () {
          const overwrite = !!(options === null || options === void 0 ? void 0 : options.overwrite);
          const filePath = yield this.filePath();
          const writeFunc = overwrite ? writeFile : appendFile;
          yield writeFunc(filePath, this._buffer, { encoding: "utf8" });
          return this.emptyBuffer();
        });
      }
      clear() {
        return __awaiter(this, void 0, void 0, function* () {
          return this.emptyBuffer().write({ overwrite: true });
        });
      }
      stringify() {
        return this._buffer;
      }
      isEmptyBuffer() {
        return this._buffer.length === 0;
      }
      emptyBuffer() {
        this._buffer = "";
        return this;
      }
      addRaw(text, addEOL = false) {
        this._buffer += text;
        return addEOL ? this.addEOL() : this;
      }
      addEOL() {
        return this.addRaw(os_1.EOL);
      }
      addCodeBlock(code, lang) {
        const attrs = Object.assign({}, lang && { lang });
        const element = this.wrap("pre", this.wrap("code", code), attrs);
        return this.addRaw(element).addEOL();
      }
      addList(items, ordered = false) {
        const tag = ordered ? "ol" : "ul";
        const listItems = items.map((item) => this.wrap("li", item)).join("");
        const element = this.wrap(tag, listItems);
        return this.addRaw(element).addEOL();
      }
      addTable(rows) {
        const tableBody = rows.map((row) => {
          const cells = row.map((cell) => {
            if (typeof cell === "string") {
              return this.wrap("td", cell);
            }
            const { header, data, colspan, rowspan } = cell;
            const tag = header ? "th" : "td";
            const attrs = Object.assign(Object.assign({}, colspan && { colspan }), rowspan && { rowspan });
            return this.wrap(tag, data, attrs);
          }).join("");
          return this.wrap("tr", cells);
        }).join("");
        const element = this.wrap("table", tableBody);
        return this.addRaw(element).addEOL();
      }
      addDetails(label, content) {
        const element = this.wrap("details", this.wrap("summary", label) + content);
        return this.addRaw(element).addEOL();
      }
      addImage(src, alt, options) {
        const { width, height } = options || {};
        const attrs = Object.assign(Object.assign({}, width && { width }), height && { height });
        const element = this.wrap("img", null, Object.assign({ src, alt }, attrs));
        return this.addRaw(element).addEOL();
      }
      addHeading(text, level) {
        const tag = `h${level}`;
        const allowedTag = ["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag) ? tag : "h1";
        const element = this.wrap(allowedTag, text);
        return this.addRaw(element).addEOL();
      }
      addSeparator() {
        const element = this.wrap("hr", null);
        return this.addRaw(element).addEOL();
      }
      addBreak() {
        const element = this.wrap("br", null);
        return this.addRaw(element).addEOL();
      }
      addQuote(text, cite) {
        const attrs = Object.assign({}, cite && { cite });
        const element = this.wrap("blockquote", text, attrs);
        return this.addRaw(element).addEOL();
      }
      addLink(text, href) {
        const element = this.wrap("a", text, { href });
        return this.addRaw(element).addEOL();
      }
    };
    var _summary = new Summary();
    exports.markdownSummary = _summary;
    exports.summary = _summary;
  }
});

// node_modules/@actions/core/lib/path-utils.js
var require_path_utils = __commonJS({
  "node_modules/@actions/core/lib/path-utils.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toPlatformPath = exports.toWin32Path = exports.toPosixPath = void 0;
    var path = __importStar(require("path"));
    function toPosixPath(pth) {
      return pth.replace(/[\\]/g, "/");
    }
    exports.toPosixPath = toPosixPath;
    function toWin32Path(pth) {
      return pth.replace(/[/]/g, "\\");
    }
    exports.toWin32Path = toWin32Path;
    function toPlatformPath(pth) {
      return pth.replace(/[/\\]/g, path.sep);
    }
    exports.toPlatformPath = toPlatformPath;
  }
});

// node_modules/@actions/core/lib/core.js
var require_core = __commonJS({
  "node_modules/@actions/core/lib/core.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getIDToken = exports.getState = exports.saveState = exports.group = exports.endGroup = exports.startGroup = exports.info = exports.notice = exports.warning = exports.error = exports.debug = exports.isDebug = exports.setFailed = exports.setCommandEcho = exports.setOutput = exports.getBooleanInput = exports.getMultilineInput = exports.getInput = exports.addPath = exports.setSecret = exports.exportVariable = exports.ExitCode = void 0;
    var command_1 = require_command();
    var file_command_1 = require_file_command();
    var utils_1 = require_utils();
    var os = __importStar(require("os"));
    var path = __importStar(require("path"));
    var oidc_utils_1 = require_oidc_utils();
    var ExitCode;
    (function(ExitCode2) {
      ExitCode2[ExitCode2["Success"] = 0] = "Success";
      ExitCode2[ExitCode2["Failure"] = 1] = "Failure";
    })(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
    function exportVariable(name, val) {
      const convertedVal = utils_1.toCommandValue(val);
      process.env[name] = convertedVal;
      const filePath = process.env["GITHUB_ENV"] || "";
      if (filePath) {
        const delimiter = "_GitHubActionsFileCommandDelimeter_";
        const commandValue = `${name}<<${delimiter}${os.EOL}${convertedVal}${os.EOL}${delimiter}`;
        file_command_1.issueCommand("ENV", commandValue);
      } else {
        command_1.issueCommand("set-env", { name }, convertedVal);
      }
    }
    exports.exportVariable = exportVariable;
    function setSecret(secret) {
      command_1.issueCommand("add-mask", {}, secret);
    }
    exports.setSecret = setSecret;
    function addPath(inputPath) {
      const filePath = process.env["GITHUB_PATH"] || "";
      if (filePath) {
        file_command_1.issueCommand("PATH", inputPath);
      } else {
        command_1.issueCommand("add-path", {}, inputPath);
      }
      process.env["PATH"] = `${inputPath}${path.delimiter}${process.env["PATH"]}`;
    }
    exports.addPath = addPath;
    function getInput(name, options) {
      const val = process.env[`INPUT_${name.replace(/ /g, "_").toUpperCase()}`] || "";
      if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
      }
      if (options && options.trimWhitespace === false) {
        return val;
      }
      return val.trim();
    }
    exports.getInput = getInput;
    function getMultilineInput(name, options) {
      const inputs = getInput(name, options).split("\n").filter((x) => x !== "");
      return inputs;
    }
    exports.getMultilineInput = getMultilineInput;
    function getBooleanInput(name, options) {
      const trueValue = ["true", "True", "TRUE"];
      const falseValue = ["false", "False", "FALSE"];
      const val = getInput(name, options);
      if (trueValue.includes(val))
        return true;
      if (falseValue.includes(val))
        return false;
      throw new TypeError(`Input does not meet YAML 1.2 "Core Schema" specification: ${name}
Support boolean input list: \`true | True | TRUE | false | False | FALSE\``);
    }
    exports.getBooleanInput = getBooleanInput;
    function setOutput(name, value) {
      process.stdout.write(os.EOL);
      command_1.issueCommand("set-output", { name }, value);
    }
    exports.setOutput = setOutput;
    function setCommandEcho(enabled) {
      command_1.issue("echo", enabled ? "on" : "off");
    }
    exports.setCommandEcho = setCommandEcho;
    function setFailed(message) {
      process.exitCode = ExitCode.Failure;
      error(message);
    }
    exports.setFailed = setFailed;
    function isDebug() {
      return process.env["RUNNER_DEBUG"] === "1";
    }
    exports.isDebug = isDebug;
    function debug(message) {
      command_1.issueCommand("debug", {}, message);
    }
    exports.debug = debug;
    function error(message, properties = {}) {
      command_1.issueCommand("error", utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
    }
    exports.error = error;
    function warning(message, properties = {}) {
      command_1.issueCommand("warning", utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
    }
    exports.warning = warning;
    function notice(message, properties = {}) {
      command_1.issueCommand("notice", utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
    }
    exports.notice = notice;
    function info(message) {
      process.stdout.write(message + os.EOL);
    }
    exports.info = info;
    function startGroup(name) {
      command_1.issue("group", name);
    }
    exports.startGroup = startGroup;
    function endGroup() {
      command_1.issue("endgroup");
    }
    exports.endGroup = endGroup;
    function group(name, fn) {
      return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
          result = yield fn();
        } finally {
          endGroup();
        }
        return result;
      });
    }
    exports.group = group;
    function saveState(name, value) {
      command_1.issueCommand("save-state", { name }, value);
    }
    exports.saveState = saveState;
    function getState(name) {
      return process.env[`STATE_${name}`] || "";
    }
    exports.getState = getState;
    function getIDToken(aud) {
      return __awaiter(this, void 0, void 0, function* () {
        return yield oidc_utils_1.OidcClient.getIDToken(aud);
      });
    }
    exports.getIDToken = getIDToken;
    var summary_1 = require_summary();
    Object.defineProperty(exports, "summary", { enumerable: true, get: function() {
      return summary_1.summary;
    } });
    var summary_2 = require_summary();
    Object.defineProperty(exports, "markdownSummary", { enumerable: true, get: function() {
      return summary_2.markdownSummary;
    } });
    var path_utils_1 = require_path_utils();
    Object.defineProperty(exports, "toPosixPath", { enumerable: true, get: function() {
      return path_utils_1.toPosixPath;
    } });
    Object.defineProperty(exports, "toWin32Path", { enumerable: true, get: function() {
      return path_utils_1.toWin32Path;
    } });
    Object.defineProperty(exports, "toPlatformPath", { enumerable: true, get: function() {
      return path_utils_1.toPlatformPath;
    } });
  }
});

// node_modules/primus/errors.js
var require_errors = __commonJS({
  "node_modules/primus/errors.js"(exports) {
    "use strict";
    var util = require("util");
    function PrimusError(message, logger) {
      Error.captureStackTrace(this, this.constructor);
      this.message = message;
      this.name = this.constructor.name;
      if (logger) {
        logger.emit("log", "error", this);
      }
    }
    util.inherits(PrimusError, Error);
    function ParserError(message, spark) {
      Error.captureStackTrace(this, this.constructor);
      this.message = message;
      this.name = this.constructor.name;
      if (spark) {
        if (spark.listeners("error").length)
          spark.emit("error", this);
        spark.primus.emit("log", "error", this);
      }
    }
    util.inherits(ParserError, Error);
    exports.PrimusError = PrimusError;
    exports.ParserError = ParserError;
  }
});

// node_modules/forwarded-for/index.js
var require_forwarded_for = __commonJS({
  "node_modules/forwarded-for/index.js"(exports, module2) {
    "use strict";
    var net = require("net");
    function Forwarded(ip, port, secured) {
      this.ip = ip || "127.0.0.1";
      this.secure = !!secured;
      this.port = +port || 0;
    }
    var proxies = [
      {
        ip: "fastly-client-ip",
        port: "fastly-client-port",
        proto: "fastly-ssl"
      },
      {
        ip: "x-forwarded-for",
        port: "x-forwarded-port",
        proto: "x-forwarded-proto"
      },
      {
        ip: "z-forwarded-for",
        port: "z-forwarded-port",
        proto: "z-forwarded-proto"
      },
      {
        ip: "forwarded",
        port: "forwarded-port",
        proto: "forwarded-proto"
      },
      {
        ip: "x-real-ip",
        port: "x-real-port",
        proto: "x-real-proto"
      }
    ];
    function forwarded(headers, whitelist) {
      var parts, ports, port, proto, ips, ip, length = proxies.length, i = 0;
      for (; i < length; i++) {
        if (!(proxies[i].ip in headers))
          continue;
        ports = (headers[proxies[i].port] || "").split(",");
        ips = (headers[proxies[i].ip] || "").split(",").map((entry, j) => {
          if (net.isIPv6(entry))
            return entry.trim();
          else {
            parts = entry.split(":");
            if (parts[1]) {
              ports.length = Math.max(j + 1, ports.length);
              ports[j] = parts[1].trim();
            }
            return parts[0].trim();
          }
        });
        proto = headers[proxies[i].proto] || "http";
        if (!ips || !ips.every(net.isIP))
          return;
        port = ports.shift();
        ip = ips.shift();
        if (whitelist && whitelist.length && !ips.every(function every(ip2) {
          return ~whitelist.indexOf(ip2);
        }))
          return;
        if (i !== 0) {
          proxies.unshift(proxies.splice(i, 1)[0]);
        }
        return new Forwarded(ip, port, proto === "1" || proto === "https");
      }
    }
    function parse(obj, headers, whitelist) {
      var proxied = forwarded(headers || {}, whitelist), connection = obj.connection, socket = connection ? connection.socket : obj.socket;
      if (proxied)
        return proxied;
      if ("object" === typeof obj) {
        if ("remoteAddress" in obj) {
          return new Forwarded(obj.remoteAddress, obj.remotePort, "secure" in obj ? obj.secure : obj.encrypted);
        }
        if ("object" === typeof obj.address && obj.address.address) {
          return new Forwarded(obj.address.address, obj.address.port, "secure" in obj ? obj.secure : obj.encrypted);
        }
      }
      if ("object" === typeof connection && "remoteAddress" in connection) {
        return new Forwarded(connection.remoteAddress, connection.remotePort, "secure" in connection ? connection.secure : connection.encrypted);
      }
      if ("object" === typeof socket && "remoteAddress" in socket) {
        return new Forwarded(socket.remoteAddress, socket.remoteAddress, "secure" in socket ? socket.secure : socket.encrypted);
      }
      return new Forwarded();
    }
    parse.Forwarded = Forwarded;
    parse.forwarded = forwarded;
    parse.proxies = proxies;
    module2.exports = parse;
  }
});

// node_modules/nanoid/url-alphabet/index.cjs
var require_url_alphabet = __commonJS({
  "node_modules/nanoid/url-alphabet/index.cjs"(exports, module2) {
    var urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
    module2.exports = { urlAlphabet };
  }
});

// node_modules/nanoid/index.cjs
var require_nanoid = __commonJS({
  "node_modules/nanoid/index.cjs"(exports, module2) {
    var crypto = require("crypto");
    var { urlAlphabet } = require_url_alphabet();
    var POOL_SIZE_MULTIPLIER = 128;
    var pool;
    var poolOffset;
    var fillPool = (bytes) => {
      if (!pool || pool.length < bytes) {
        pool = Buffer.allocUnsafe(bytes * POOL_SIZE_MULTIPLIER);
        crypto.randomFillSync(pool);
        poolOffset = 0;
      } else if (poolOffset + bytes > pool.length) {
        crypto.randomFillSync(pool);
        poolOffset = 0;
      }
      poolOffset += bytes;
    };
    var random = (bytes) => {
      fillPool(bytes -= 0);
      return pool.subarray(poolOffset - bytes, poolOffset);
    };
    var customRandom = (alphabet, defaultSize, getRandom) => {
      let mask = (2 << 31 - Math.clz32(alphabet.length - 1 | 1)) - 1;
      let step = Math.ceil(1.6 * mask * defaultSize / alphabet.length);
      return (size = defaultSize) => {
        let id = "";
        while (true) {
          let bytes = getRandom(step);
          let i = step;
          while (i--) {
            id += alphabet[bytes[i] & mask] || "";
            if (id.length === size)
              return id;
          }
        }
      };
    };
    var customAlphabet = (alphabet, size = 21) => customRandom(alphabet, size, random);
    var nanoid = (size = 21) => {
      fillPool(size -= 0);
      let id = "";
      for (let i = poolOffset - size; i < poolOffset; i++) {
        id += urlAlphabet[pool[i] & 63];
      }
      return id;
    };
    module2.exports = { nanoid, customAlphabet, customRandom, urlAlphabet, random };
  }
});

// node_modules/primus/spark.js
var require_spark = __commonJS({
  "node_modules/primus/spark.js"(exports, module2) {
    "use strict";
    var ParserError = require_errors().ParserError;
    var log = require_node()("primus:spark");
    var parse = require("querystring").parse;
    var forwarded = require_forwarded_for();
    var nanoid = require_nanoid().nanoid;
    var Ultron = require_ultron();
    var fuse = require_fusing();
    var u2028 = /\u2028/g;
    var u2029 = /\u2029/g;
    function Spark(primus, headers, address, query, id, request, socket) {
      this.fuse();
      var writable = this.writable, spark = this, idgen = primus.options.idGenerator;
      query = query || {};
      id = idgen ? idgen() : id || nanoid();
      headers = headers || {};
      address = address || {};
      request = request || headers["primus::req::backup"];
      writable("id", id);
      writable("primus", primus);
      writable("remote", address);
      writable("headers", headers);
      writable("request", request);
      writable("socket", socket);
      writable("writable", true);
      writable("readable", true);
      writable("queue", []);
      writable("query", query);
      writable("ultron", new Ultron(this));
      writable("alive", true);
      if ("string" === typeof this.query) {
        this.query = parse(this.query);
      }
      this.__initialise.forEach(function execute(initialise) {
        initialise.call(spark);
      });
    }
    fuse(Spark, require("stream"), { merge: false, mixin: false });
    Spark.OPENING = 1;
    Spark.CLOSED = 2;
    Spark.OPEN = 3;
    Spark.readable("readyState", {
      get: function get() {
        return this.__readyState;
      },
      set: function set(readyState) {
        if (this.__readyState === readyState)
          return readyState;
        this.__readyState = readyState;
        this.emit("readyStateChange");
        return readyState;
      }
    }, true);
    Spark.writable("__readyState", Spark.OPEN);
    Spark.get("address", function address() {
      return this.request.forwarded || forwarded(this.remote, this.headers, this.primus.whitelist);
    });
    Spark.readable("reserved", function reserved(evt) {
      return /^(incoming|outgoing)::/.test(evt) || evt in reserved.events;
    });
    Spark.prototype.reserved.events = {
      readyStateChange: 1,
      heartbeat: 1,
      error: 1,
      data: 1,
      end: 1
    };
    Spark.readable("initialise", {
      get: function get() {
        return this.__initialise[this.__initialise.length - 1];
      },
      set: function set(initialise) {
        if ("function" === typeof initialise)
          this.__initialise.push(initialise);
      }
    }, true);
    Spark.writable("heartbeat", function heartbeat() {
      var spark = this;
      if (!spark.alive) {
        spark.end(void 0, { reconnect: true });
      } else {
        const now = Date.now();
        spark.alive = false;
        spark.emit("outgoing::ping", now);
        spark._write(`primus::ping::${now}`);
      }
    });
    Spark.readable("__initialise", [function initialise() {
      var primus = this.primus, ultron = this.ultron, spark = this;
      if (this.listeners("incoming::data").length) {
        return log("already has incoming::data listeners, bailing out");
      }
      ultron.on("incoming::data", function message(raw) {
        primus.decoder.call(spark, raw, function decoding(err, data) {
          if (err) {
            log("failed to decode the incoming data for %s", spark.id);
            return new ParserError("Failed to decode incoming data: " + err.message, spark, err);
          }
          if (spark.protocol(data))
            return;
          spark.transforms(primus, spark, "incoming", data, raw);
        });
      });
      ultron.on("incoming::pong", function pong() {
        spark.alive = true;
        spark.emit("heartbeat");
      });
      ultron.on("incoming::end", function disconnect() {
        log("transformer closed connection for %s", spark.id);
        spark.end(void 0, { reconnect: true });
      });
      ultron.on("incoming::error", function error(err) {
        if ("string" === typeof err) {
          err = new Error(err);
        }
        if (spark.listeners("error").length)
          spark.emit("error", err);
        spark.primus.emit("log", "error", err);
        log("transformer received error `%s` for %s", err.message, spark.id);
        spark.end();
      });
      ultron.on("end", function end() {
        primus.emit("disconnection", spark);
      });
      process.nextTick(function tick() {
        primus.asyncemit("connection", spark, function damn(err) {
          if (!err) {
            if (spark.queue)
              spark.queue.forEach(function each(packet) {
                spark.emit("data", packet.data, packet.raw);
              });
            spark.queue = null;
            return;
          }
          spark.emit("incoming::error", err);
        });
      });
    }]);
    Spark.readable("transforms", function transforms(primus, connection, type, data, raw) {
      var packet = { data, raw }, fns = primus.transformers[type];
      (function transform(index, done) {
        var transformer = fns[index++];
        if (!transformer)
          return done();
        if (1 === transformer.length) {
          if (false === transformer.call(connection, packet)) {
            return;
          }
          return transform(index, done);
        }
        transformer.call(connection, packet, function finished(err, arg) {
          if (err)
            return connection.emit("error", err);
          if (false === arg)
            return;
          transform(index, done);
        });
      })(0, function done() {
        if ("incoming" === type) {
          if (connection.queue)
            return connection.queue.push(packet);
          return connection.emit("data", packet.data, packet.raw);
        }
        connection._write(packet.data);
      });
      return this;
    });
    Spark.readable("protocol", function protocol(msg) {
      if ("string" !== typeof msg || msg.indexOf("primus::") !== 0)
        return false;
      var last = msg.indexOf(":", 8), value = msg.slice(last + 2);
      switch (msg.slice(8, last)) {
        case "pong":
          this.emit("incoming::pong", +value);
          break;
        case "id":
          this._write("primus::id::" + this.id);
          break;
        default:
          log("message `%s` was prefixed with primus:: but not supported", msg);
          return false;
      }
      log("processed a primus protocol message `%s`", msg);
      return true;
    });
    Spark.readable("write", function write(data) {
      var primus = this.primus;
      if (Spark.CLOSED === this.readyState) {
        log("attempted to write but readyState was already set to CLOSED for %s", this.id);
        return false;
      }
      this.transforms(primus, this, "outgoing", data);
      return true;
    });
    Spark.readable("_write", function _write(data) {
      var primus = this.primus, spark = this;
      if (Spark.CLOSED === spark.readyState) {
        log("attempted to _write but readyState was already set to CLOSED for %s", spark.id);
        return false;
      }
      primus.encoder.call(spark, data, function encoded(err, packet) {
        if (err)
          return new ParserError("Failed to encode outgoing data: " + err.message, spark, err);
        if (!packet)
          return log("nothing to write, bailing out for %s", spark.id);
        if ("string" === typeof packet) {
          if (~packet.indexOf("\u2028"))
            packet = packet.replace(u2028, "\\u2028");
          if (~packet.indexOf("\u2029"))
            packet = packet.replace(u2029, "\\u2029");
        }
        spark.emit("outgoing::data", packet);
      });
      return true;
    });
    Spark.readable("end", function end(data, options) {
      if (Spark.CLOSED === this.readyState)
        return this;
      options = options || {};
      if (data !== void 0)
        this.write(data);
      if (!options.reconnect)
        this._write("primus::server::close");
      if (Spark.CLOSED === this.readyState)
        return this;
      log("emitting final events for spark %s", this.id);
      this.readyState = Spark.CLOSED;
      this.emit("outgoing::end");
      this.emit("end");
      this.ultron.destroy();
      this.ultron = this.queue = null;
      return this;
    });
    module2.exports = Spark;
  }
});

// node_modules/primus/package.json
var require_package = __commonJS({
  "node_modules/primus/package.json"(exports, module2) {
    module2.exports = {
      name: "primus",
      version: "8.0.6",
      description: "Primus is a simple abstraction around real-time frameworks. It allows you to easily switch between different frameworks without any code changes.",
      main: "index.js",
      scripts: {
        build: "mkdir -p dist && browserify primus.js -s Primus -p deumdify | derequire > dist/primus.js",
        update: "find transformers -name update.sh -exec bash {} \\;",
        integration: "npm run build && mocha test/*.integration.js --exit",
        test: "npm run build && mocha test/*.test.js",
        prepublishOnly: "npm run build"
      },
      homepage: "https://github.com/primus/primus#readme",
      repository: {
        type: "git",
        url: "git://github.com/primus/primus.git"
      },
      keywords: [
        "abstraction",
        "browserchannel",
        "engine.io",
        "framework",
        "comet",
        "streaming",
        "pubsub",
        "pub",
        "sub",
        "ajax",
        "xhr",
        "polling",
        "http",
        "faye",
        "io",
        "primus",
        "prumus",
        "real-time",
        "realtime",
        "socket",
        "socket.io",
        "sockets",
        "sockjs",
        "spark",
        "transformer",
        "transformers",
        "websocket",
        "websockets",
        "ws",
        "uws"
      ],
      author: "Arnout Kazemier",
      license: "MIT",
      dependencies: {
        "access-control": "~1.0.0",
        asyncemit: "~3.0.1",
        "create-server": "~1.0.1",
        diagnostics: "~2.0.0",
        eventemitter3: "~4.0.0",
        "forwarded-for": "~1.1.0",
        fusing: "~1.0.0",
        nanoid: "~3.3.3",
        setheader: "~1.0.2",
        ultron: "~1.1.0"
      },
      devDependencies: {
        "@babel/core": "~7.17.9",
        "@babel/plugin-transform-object-assign": "~7.16.7",
        "@babel/preset-env": "~7.16.11",
        "@rollup/plugin-babel": "~5.3.1",
        "@rollup/plugin-commonjs": "~22.0.0",
        "@rollup/plugin-node-resolve": "~13.2.1",
        "binary-pack": "~1.0.2",
        browserchannel: "~2.1.0",
        browserify: "~17.0.0",
        chai: "~4.3.4",
        condenseify: "~1.1.1",
        demolish: "~1.0.2",
        derequire: "~2.1.1",
        deumdify: "~1.2.3",
        ejson: "~2.2.0",
        emits: "~3.0.0",
        "engine.io": "~6.2.0",
        "engine.io-client": "~6.2.1",
        "faye-websocket": "~0.11.0",
        inherits: "~2.0.3",
        mocha: "~9.2.2",
        "pre-commit": "~1.2.0",
        "primus-msgpack": "~1.0.2",
        pumpify: "~2.0.0",
        querystringify: "~2.2.0",
        recovery: "~0.2.6",
        request: "~2.88.0",
        rocambole: "~0.7.0",
        "rocambole-node-remove": "~3.0.0",
        rollup: "~2.70.2",
        sockjs: "~0.3.18",
        "sockjs-client": "~1.6.0",
        through2: "~4.0.2",
        "tick-tock": "~1.0.0",
        "url-parse": "~1.5.1",
        uws: "10.148.1",
        ws: "~8.5.0",
        yeast: "~0.1.2"
      },
      "pre-commit": "test, integration"
    };
  }
});

// node_modules/primus/transformers.json
var require_transformers = __commonJS({
  "node_modules/primus/transformers.json"(exports, module2) {
    module2.exports = {
      websockets: {
        server: "ws",
        client: "ws"
      },
      "engine.io": {
        server: "engine.io",
        client: "engine.io-client"
      },
      browserchannel: {
        server: "browserchannel",
        client: "browserchannel"
      },
      sockjs: {
        server: "sockjs",
        client: "sockjs-client"
      },
      faye: {
        server: "faye-websocket",
        client: "faye-websocket"
      },
      uws: {
        server: "uws",
        client: "ws"
      }
    };
  }
});

// node_modules/primus/parsers.json
var require_parsers = __commonJS({
  "node_modules/primus/parsers.json"(exports, module2) {
    module2.exports = {
      json: {},
      ejson: {
        server: "ejson"
      },
      binary: {
        server: "binary-pack"
      },
      msgpack: {
        server: "primus-msgpack"
      }
    };
  }
});

// node_modules/primus/middleware/forwarded.js
var require_forwarded = __commonJS({
  "node_modules/primus/middleware/forwarded.js"(exports, module2) {
    "use strict";
    var forwarded = require_forwarded_for();
    module2.exports = function configure() {
      var primus = this;
      return function ipaddress(req, res) {
        req.forwarded = forwarded(req, req.headers || {}, primus.whitelist);
      };
    };
  }
});

// node_modules/env-variable/index.js
var require_env_variable = __commonJS({
  "node_modules/env-variable/index.js"(exports, module2) {
    "use strict";
    var has = Object.prototype.hasOwnProperty;
    function env(environment2) {
      environment2 = environment2 || {};
      if ("object" === typeof process && "object" === typeof process.env) {
        env.merge(environment2, process.env);
      }
      if ("undefined" !== typeof window) {
        if ("string" === window.name && window.name.length) {
          env.merge(environment2, env.parse(window.name));
        }
        try {
          if (window.localStorage) {
            env.merge(environment2, env.parse(window.localStorage.env || window.localStorage.debug));
          }
        } catch (e) {
        }
        if ("object" === typeof window.location && "string" === typeof window.location.hash && window.location.hash.length) {
          env.merge(environment2, env.parse(window.location.hash.charAt(0) === "#" ? window.location.hash.slice(1) : window.location.hash));
        }
      }
      var key, lower;
      for (key in environment2) {
        lower = key.toLowerCase();
        if (!(lower in environment2)) {
          environment2[lower] = environment2[key];
        }
      }
      return environment2;
    }
    env.merge = function merge(base, add) {
      for (var key in add) {
        if (has.call(add, key)) {
          base[key] = add[key];
        }
      }
      return base;
    };
    env.parse = function parse(query) {
      var parser = /([^=?&]+)=([^&]*)/g, result = {}, part;
      if (!query)
        return result;
      for (; part = parser.exec(query); result[decodeURIComponent(part[1])] = decodeURIComponent(part[2]))
        ;
      return result.env || result;
    };
    module2.exports = env;
  }
});

// node_modules/setheader/node_modules/enabled/index.js
var require_enabled2 = __commonJS({
  "node_modules/setheader/node_modules/enabled/index.js"(exports, module2) {
    "use strict";
    var env = require_env_variable();
    module2.exports = function enabled(name, variables) {
      var envy = env(), variable, i = 0;
      variables = variables || ["diagnostics", "debug"];
      for (; i < variables.length; i++) {
        if (variable = envy[variables[i]])
          break;
      }
      if (!variable)
        return false;
      variables = variable.split(/[\s,]+/);
      i = 0;
      for (; i < variables.length; i++) {
        variable = variables[i].replace("*", ".*?");
        if ("-" === variable.charAt(0)) {
          if (new RegExp("^" + variable.substr(1) + "$").test(name)) {
            return false;
          }
          continue;
        }
        if (new RegExp("^" + variable + "$").test(name)) {
          return true;
        }
      }
      return false;
    };
  }
});

// node_modules/colornames/colors.js
var require_colors = __commonJS({
  "node_modules/colornames/colors.js"(exports, module2) {
    module2.exports = [
      {
        "value": "#B0171F",
        "name": "indian red"
      },
      {
        "value": "#DC143C",
        "css": true,
        "name": "crimson"
      },
      {
        "value": "#FFB6C1",
        "css": true,
        "name": "lightpink"
      },
      {
        "value": "#FFAEB9",
        "name": "lightpink 1"
      },
      {
        "value": "#EEA2AD",
        "name": "lightpink 2"
      },
      {
        "value": "#CD8C95",
        "name": "lightpink 3"
      },
      {
        "value": "#8B5F65",
        "name": "lightpink 4"
      },
      {
        "value": "#FFC0CB",
        "css": true,
        "name": "pink"
      },
      {
        "value": "#FFB5C5",
        "name": "pink 1"
      },
      {
        "value": "#EEA9B8",
        "name": "pink 2"
      },
      {
        "value": "#CD919E",
        "name": "pink 3"
      },
      {
        "value": "#8B636C",
        "name": "pink 4"
      },
      {
        "value": "#DB7093",
        "css": true,
        "name": "palevioletred"
      },
      {
        "value": "#FF82AB",
        "name": "palevioletred 1"
      },
      {
        "value": "#EE799F",
        "name": "palevioletred 2"
      },
      {
        "value": "#CD6889",
        "name": "palevioletred 3"
      },
      {
        "value": "#8B475D",
        "name": "palevioletred 4"
      },
      {
        "value": "#FFF0F5",
        "name": "lavenderblush 1"
      },
      {
        "value": "#FFF0F5",
        "css": true,
        "name": "lavenderblush"
      },
      {
        "value": "#EEE0E5",
        "name": "lavenderblush 2"
      },
      {
        "value": "#CDC1C5",
        "name": "lavenderblush 3"
      },
      {
        "value": "#8B8386",
        "name": "lavenderblush 4"
      },
      {
        "value": "#FF3E96",
        "name": "violetred 1"
      },
      {
        "value": "#EE3A8C",
        "name": "violetred 2"
      },
      {
        "value": "#CD3278",
        "name": "violetred 3"
      },
      {
        "value": "#8B2252",
        "name": "violetred 4"
      },
      {
        "value": "#FF69B4",
        "css": true,
        "name": "hotpink"
      },
      {
        "value": "#FF6EB4",
        "name": "hotpink 1"
      },
      {
        "value": "#EE6AA7",
        "name": "hotpink 2"
      },
      {
        "value": "#CD6090",
        "name": "hotpink 3"
      },
      {
        "value": "#8B3A62",
        "name": "hotpink 4"
      },
      {
        "value": "#872657",
        "name": "raspberry"
      },
      {
        "value": "#FF1493",
        "name": "deeppink 1"
      },
      {
        "value": "#FF1493",
        "css": true,
        "name": "deeppink"
      },
      {
        "value": "#EE1289",
        "name": "deeppink 2"
      },
      {
        "value": "#CD1076",
        "name": "deeppink 3"
      },
      {
        "value": "#8B0A50",
        "name": "deeppink 4"
      },
      {
        "value": "#FF34B3",
        "name": "maroon 1"
      },
      {
        "value": "#EE30A7",
        "name": "maroon 2"
      },
      {
        "value": "#CD2990",
        "name": "maroon 3"
      },
      {
        "value": "#8B1C62",
        "name": "maroon 4"
      },
      {
        "value": "#C71585",
        "css": true,
        "name": "mediumvioletred"
      },
      {
        "value": "#D02090",
        "name": "violetred"
      },
      {
        "value": "#DA70D6",
        "css": true,
        "name": "orchid"
      },
      {
        "value": "#FF83FA",
        "name": "orchid 1"
      },
      {
        "value": "#EE7AE9",
        "name": "orchid 2"
      },
      {
        "value": "#CD69C9",
        "name": "orchid 3"
      },
      {
        "value": "#8B4789",
        "name": "orchid 4"
      },
      {
        "value": "#D8BFD8",
        "css": true,
        "name": "thistle"
      },
      {
        "value": "#FFE1FF",
        "name": "thistle 1"
      },
      {
        "value": "#EED2EE",
        "name": "thistle 2"
      },
      {
        "value": "#CDB5CD",
        "name": "thistle 3"
      },
      {
        "value": "#8B7B8B",
        "name": "thistle 4"
      },
      {
        "value": "#FFBBFF",
        "name": "plum 1"
      },
      {
        "value": "#EEAEEE",
        "name": "plum 2"
      },
      {
        "value": "#CD96CD",
        "name": "plum 3"
      },
      {
        "value": "#8B668B",
        "name": "plum 4"
      },
      {
        "value": "#DDA0DD",
        "css": true,
        "name": "plum"
      },
      {
        "value": "#EE82EE",
        "css": true,
        "name": "violet"
      },
      {
        "value": "#FF00FF",
        "vga": true,
        "name": "magenta"
      },
      {
        "value": "#FF00FF",
        "vga": true,
        "css": true,
        "name": "fuchsia"
      },
      {
        "value": "#EE00EE",
        "name": "magenta 2"
      },
      {
        "value": "#CD00CD",
        "name": "magenta 3"
      },
      {
        "value": "#8B008B",
        "name": "magenta 4"
      },
      {
        "value": "#8B008B",
        "css": true,
        "name": "darkmagenta"
      },
      {
        "value": "#800080",
        "vga": true,
        "css": true,
        "name": "purple"
      },
      {
        "value": "#BA55D3",
        "css": true,
        "name": "mediumorchid"
      },
      {
        "value": "#E066FF",
        "name": "mediumorchid 1"
      },
      {
        "value": "#D15FEE",
        "name": "mediumorchid 2"
      },
      {
        "value": "#B452CD",
        "name": "mediumorchid 3"
      },
      {
        "value": "#7A378B",
        "name": "mediumorchid 4"
      },
      {
        "value": "#9400D3",
        "css": true,
        "name": "darkviolet"
      },
      {
        "value": "#9932CC",
        "css": true,
        "name": "darkorchid"
      },
      {
        "value": "#BF3EFF",
        "name": "darkorchid 1"
      },
      {
        "value": "#B23AEE",
        "name": "darkorchid 2"
      },
      {
        "value": "#9A32CD",
        "name": "darkorchid 3"
      },
      {
        "value": "#68228B",
        "name": "darkorchid 4"
      },
      {
        "value": "#4B0082",
        "css": true,
        "name": "indigo"
      },
      {
        "value": "#8A2BE2",
        "css": true,
        "name": "blueviolet"
      },
      {
        "value": "#9B30FF",
        "name": "purple 1"
      },
      {
        "value": "#912CEE",
        "name": "purple 2"
      },
      {
        "value": "#7D26CD",
        "name": "purple 3"
      },
      {
        "value": "#551A8B",
        "name": "purple 4"
      },
      {
        "value": "#9370DB",
        "css": true,
        "name": "mediumpurple"
      },
      {
        "value": "#AB82FF",
        "name": "mediumpurple 1"
      },
      {
        "value": "#9F79EE",
        "name": "mediumpurple 2"
      },
      {
        "value": "#8968CD",
        "name": "mediumpurple 3"
      },
      {
        "value": "#5D478B",
        "name": "mediumpurple 4"
      },
      {
        "value": "#483D8B",
        "css": true,
        "name": "darkslateblue"
      },
      {
        "value": "#8470FF",
        "name": "lightslateblue"
      },
      {
        "value": "#7B68EE",
        "css": true,
        "name": "mediumslateblue"
      },
      {
        "value": "#6A5ACD",
        "css": true,
        "name": "slateblue"
      },
      {
        "value": "#836FFF",
        "name": "slateblue 1"
      },
      {
        "value": "#7A67EE",
        "name": "slateblue 2"
      },
      {
        "value": "#6959CD",
        "name": "slateblue 3"
      },
      {
        "value": "#473C8B",
        "name": "slateblue 4"
      },
      {
        "value": "#F8F8FF",
        "css": true,
        "name": "ghostwhite"
      },
      {
        "value": "#E6E6FA",
        "css": true,
        "name": "lavender"
      },
      {
        "value": "#0000FF",
        "vga": true,
        "css": true,
        "name": "blue"
      },
      {
        "value": "#0000EE",
        "name": "blue 2"
      },
      {
        "value": "#0000CD",
        "name": "blue 3"
      },
      {
        "value": "#0000CD",
        "css": true,
        "name": "mediumblue"
      },
      {
        "value": "#00008B",
        "name": "blue 4"
      },
      {
        "value": "#00008B",
        "css": true,
        "name": "darkblue"
      },
      {
        "value": "#000080",
        "vga": true,
        "css": true,
        "name": "navy"
      },
      {
        "value": "#191970",
        "css": true,
        "name": "midnightblue"
      },
      {
        "value": "#3D59AB",
        "name": "cobalt"
      },
      {
        "value": "#4169E1",
        "css": true,
        "name": "royalblue"
      },
      {
        "value": "#4876FF",
        "name": "royalblue 1"
      },
      {
        "value": "#436EEE",
        "name": "royalblue 2"
      },
      {
        "value": "#3A5FCD",
        "name": "royalblue 3"
      },
      {
        "value": "#27408B",
        "name": "royalblue 4"
      },
      {
        "value": "#6495ED",
        "css": true,
        "name": "cornflowerblue"
      },
      {
        "value": "#B0C4DE",
        "css": true,
        "name": "lightsteelblue"
      },
      {
        "value": "#CAE1FF",
        "name": "lightsteelblue 1"
      },
      {
        "value": "#BCD2EE",
        "name": "lightsteelblue 2"
      },
      {
        "value": "#A2B5CD",
        "name": "lightsteelblue 3"
      },
      {
        "value": "#6E7B8B",
        "name": "lightsteelblue 4"
      },
      {
        "value": "#778899",
        "css": true,
        "name": "lightslategray"
      },
      {
        "value": "#708090",
        "css": true,
        "name": "slategray"
      },
      {
        "value": "#C6E2FF",
        "name": "slategray 1"
      },
      {
        "value": "#B9D3EE",
        "name": "slategray 2"
      },
      {
        "value": "#9FB6CD",
        "name": "slategray 3"
      },
      {
        "value": "#6C7B8B",
        "name": "slategray 4"
      },
      {
        "value": "#1E90FF",
        "name": "dodgerblue 1"
      },
      {
        "value": "#1E90FF",
        "css": true,
        "name": "dodgerblue"
      },
      {
        "value": "#1C86EE",
        "name": "dodgerblue 2"
      },
      {
        "value": "#1874CD",
        "name": "dodgerblue 3"
      },
      {
        "value": "#104E8B",
        "name": "dodgerblue 4"
      },
      {
        "value": "#F0F8FF",
        "css": true,
        "name": "aliceblue"
      },
      {
        "value": "#4682B4",
        "css": true,
        "name": "steelblue"
      },
      {
        "value": "#63B8FF",
        "name": "steelblue 1"
      },
      {
        "value": "#5CACEE",
        "name": "steelblue 2"
      },
      {
        "value": "#4F94CD",
        "name": "steelblue 3"
      },
      {
        "value": "#36648B",
        "name": "steelblue 4"
      },
      {
        "value": "#87CEFA",
        "css": true,
        "name": "lightskyblue"
      },
      {
        "value": "#B0E2FF",
        "name": "lightskyblue 1"
      },
      {
        "value": "#A4D3EE",
        "name": "lightskyblue 2"
      },
      {
        "value": "#8DB6CD",
        "name": "lightskyblue 3"
      },
      {
        "value": "#607B8B",
        "name": "lightskyblue 4"
      },
      {
        "value": "#87CEFF",
        "name": "skyblue 1"
      },
      {
        "value": "#7EC0EE",
        "name": "skyblue 2"
      },
      {
        "value": "#6CA6CD",
        "name": "skyblue 3"
      },
      {
        "value": "#4A708B",
        "name": "skyblue 4"
      },
      {
        "value": "#87CEEB",
        "css": true,
        "name": "skyblue"
      },
      {
        "value": "#00BFFF",
        "name": "deepskyblue 1"
      },
      {
        "value": "#00BFFF",
        "css": true,
        "name": "deepskyblue"
      },
      {
        "value": "#00B2EE",
        "name": "deepskyblue 2"
      },
      {
        "value": "#009ACD",
        "name": "deepskyblue 3"
      },
      {
        "value": "#00688B",
        "name": "deepskyblue 4"
      },
      {
        "value": "#33A1C9",
        "name": "peacock"
      },
      {
        "value": "#ADD8E6",
        "css": true,
        "name": "lightblue"
      },
      {
        "value": "#BFEFFF",
        "name": "lightblue 1"
      },
      {
        "value": "#B2DFEE",
        "name": "lightblue 2"
      },
      {
        "value": "#9AC0CD",
        "name": "lightblue 3"
      },
      {
        "value": "#68838B",
        "name": "lightblue 4"
      },
      {
        "value": "#B0E0E6",
        "css": true,
        "name": "powderblue"
      },
      {
        "value": "#98F5FF",
        "name": "cadetblue 1"
      },
      {
        "value": "#8EE5EE",
        "name": "cadetblue 2"
      },
      {
        "value": "#7AC5CD",
        "name": "cadetblue 3"
      },
      {
        "value": "#53868B",
        "name": "cadetblue 4"
      },
      {
        "value": "#00F5FF",
        "name": "turquoise 1"
      },
      {
        "value": "#00E5EE",
        "name": "turquoise 2"
      },
      {
        "value": "#00C5CD",
        "name": "turquoise 3"
      },
      {
        "value": "#00868B",
        "name": "turquoise 4"
      },
      {
        "value": "#5F9EA0",
        "css": true,
        "name": "cadetblue"
      },
      {
        "value": "#00CED1",
        "css": true,
        "name": "darkturquoise"
      },
      {
        "value": "#F0FFFF",
        "name": "azure 1"
      },
      {
        "value": "#F0FFFF",
        "css": true,
        "name": "azure"
      },
      {
        "value": "#E0EEEE",
        "name": "azure 2"
      },
      {
        "value": "#C1CDCD",
        "name": "azure 3"
      },
      {
        "value": "#838B8B",
        "name": "azure 4"
      },
      {
        "value": "#E0FFFF",
        "name": "lightcyan 1"
      },
      {
        "value": "#E0FFFF",
        "css": true,
        "name": "lightcyan"
      },
      {
        "value": "#D1EEEE",
        "name": "lightcyan 2"
      },
      {
        "value": "#B4CDCD",
        "name": "lightcyan 3"
      },
      {
        "value": "#7A8B8B",
        "name": "lightcyan 4"
      },
      {
        "value": "#BBFFFF",
        "name": "paleturquoise 1"
      },
      {
        "value": "#AEEEEE",
        "name": "paleturquoise 2"
      },
      {
        "value": "#AEEEEE",
        "css": true,
        "name": "paleturquoise"
      },
      {
        "value": "#96CDCD",
        "name": "paleturquoise 3"
      },
      {
        "value": "#668B8B",
        "name": "paleturquoise 4"
      },
      {
        "value": "#2F4F4F",
        "css": true,
        "name": "darkslategray"
      },
      {
        "value": "#97FFFF",
        "name": "darkslategray 1"
      },
      {
        "value": "#8DEEEE",
        "name": "darkslategray 2"
      },
      {
        "value": "#79CDCD",
        "name": "darkslategray 3"
      },
      {
        "value": "#528B8B",
        "name": "darkslategray 4"
      },
      {
        "value": "#00FFFF",
        "name": "cyan"
      },
      {
        "value": "#00FFFF",
        "css": true,
        "name": "aqua"
      },
      {
        "value": "#00EEEE",
        "name": "cyan 2"
      },
      {
        "value": "#00CDCD",
        "name": "cyan 3"
      },
      {
        "value": "#008B8B",
        "name": "cyan 4"
      },
      {
        "value": "#008B8B",
        "css": true,
        "name": "darkcyan"
      },
      {
        "value": "#008080",
        "vga": true,
        "css": true,
        "name": "teal"
      },
      {
        "value": "#48D1CC",
        "css": true,
        "name": "mediumturquoise"
      },
      {
        "value": "#20B2AA",
        "css": true,
        "name": "lightseagreen"
      },
      {
        "value": "#03A89E",
        "name": "manganeseblue"
      },
      {
        "value": "#40E0D0",
        "css": true,
        "name": "turquoise"
      },
      {
        "value": "#808A87",
        "name": "coldgrey"
      },
      {
        "value": "#00C78C",
        "name": "turquoiseblue"
      },
      {
        "value": "#7FFFD4",
        "name": "aquamarine 1"
      },
      {
        "value": "#7FFFD4",
        "css": true,
        "name": "aquamarine"
      },
      {
        "value": "#76EEC6",
        "name": "aquamarine 2"
      },
      {
        "value": "#66CDAA",
        "name": "aquamarine 3"
      },
      {
        "value": "#66CDAA",
        "css": true,
        "name": "mediumaquamarine"
      },
      {
        "value": "#458B74",
        "name": "aquamarine 4"
      },
      {
        "value": "#00FA9A",
        "css": true,
        "name": "mediumspringgreen"
      },
      {
        "value": "#F5FFFA",
        "css": true,
        "name": "mintcream"
      },
      {
        "value": "#00FF7F",
        "css": true,
        "name": "springgreen"
      },
      {
        "value": "#00EE76",
        "name": "springgreen 1"
      },
      {
        "value": "#00CD66",
        "name": "springgreen 2"
      },
      {
        "value": "#008B45",
        "name": "springgreen 3"
      },
      {
        "value": "#3CB371",
        "css": true,
        "name": "mediumseagreen"
      },
      {
        "value": "#54FF9F",
        "name": "seagreen 1"
      },
      {
        "value": "#4EEE94",
        "name": "seagreen 2"
      },
      {
        "value": "#43CD80",
        "name": "seagreen 3"
      },
      {
        "value": "#2E8B57",
        "name": "seagreen 4"
      },
      {
        "value": "#2E8B57",
        "css": true,
        "name": "seagreen"
      },
      {
        "value": "#00C957",
        "name": "emeraldgreen"
      },
      {
        "value": "#BDFCC9",
        "name": "mint"
      },
      {
        "value": "#3D9140",
        "name": "cobaltgreen"
      },
      {
        "value": "#F0FFF0",
        "name": "honeydew 1"
      },
      {
        "value": "#F0FFF0",
        "css": true,
        "name": "honeydew"
      },
      {
        "value": "#E0EEE0",
        "name": "honeydew 2"
      },
      {
        "value": "#C1CDC1",
        "name": "honeydew 3"
      },
      {
        "value": "#838B83",
        "name": "honeydew 4"
      },
      {
        "value": "#8FBC8F",
        "css": true,
        "name": "darkseagreen"
      },
      {
        "value": "#C1FFC1",
        "name": "darkseagreen 1"
      },
      {
        "value": "#B4EEB4",
        "name": "darkseagreen 2"
      },
      {
        "value": "#9BCD9B",
        "name": "darkseagreen 3"
      },
      {
        "value": "#698B69",
        "name": "darkseagreen 4"
      },
      {
        "value": "#98FB98",
        "css": true,
        "name": "palegreen"
      },
      {
        "value": "#9AFF9A",
        "name": "palegreen 1"
      },
      {
        "value": "#90EE90",
        "name": "palegreen 2"
      },
      {
        "value": "#90EE90",
        "css": true,
        "name": "lightgreen"
      },
      {
        "value": "#7CCD7C",
        "name": "palegreen 3"
      },
      {
        "value": "#548B54",
        "name": "palegreen 4"
      },
      {
        "value": "#32CD32",
        "css": true,
        "name": "limegreen"
      },
      {
        "value": "#228B22",
        "css": true,
        "name": "forestgreen"
      },
      {
        "value": "#00FF00",
        "vga": true,
        "name": "green 1"
      },
      {
        "value": "#00FF00",
        "vga": true,
        "css": true,
        "name": "lime"
      },
      {
        "value": "#00EE00",
        "name": "green 2"
      },
      {
        "value": "#00CD00",
        "name": "green 3"
      },
      {
        "value": "#008B00",
        "name": "green 4"
      },
      {
        "value": "#008000",
        "vga": true,
        "css": true,
        "name": "green"
      },
      {
        "value": "#006400",
        "css": true,
        "name": "darkgreen"
      },
      {
        "value": "#308014",
        "name": "sapgreen"
      },
      {
        "value": "#7CFC00",
        "css": true,
        "name": "lawngreen"
      },
      {
        "value": "#7FFF00",
        "name": "chartreuse 1"
      },
      {
        "value": "#7FFF00",
        "css": true,
        "name": "chartreuse"
      },
      {
        "value": "#76EE00",
        "name": "chartreuse 2"
      },
      {
        "value": "#66CD00",
        "name": "chartreuse 3"
      },
      {
        "value": "#458B00",
        "name": "chartreuse 4"
      },
      {
        "value": "#ADFF2F",
        "css": true,
        "name": "greenyellow"
      },
      {
        "value": "#CAFF70",
        "name": "darkolivegreen 1"
      },
      {
        "value": "#BCEE68",
        "name": "darkolivegreen 2"
      },
      {
        "value": "#A2CD5A",
        "name": "darkolivegreen 3"
      },
      {
        "value": "#6E8B3D",
        "name": "darkolivegreen 4"
      },
      {
        "value": "#556B2F",
        "css": true,
        "name": "darkolivegreen"
      },
      {
        "value": "#6B8E23",
        "css": true,
        "name": "olivedrab"
      },
      {
        "value": "#C0FF3E",
        "name": "olivedrab 1"
      },
      {
        "value": "#B3EE3A",
        "name": "olivedrab 2"
      },
      {
        "value": "#9ACD32",
        "name": "olivedrab 3"
      },
      {
        "value": "#9ACD32",
        "css": true,
        "name": "yellowgreen"
      },
      {
        "value": "#698B22",
        "name": "olivedrab 4"
      },
      {
        "value": "#FFFFF0",
        "name": "ivory 1"
      },
      {
        "value": "#FFFFF0",
        "css": true,
        "name": "ivory"
      },
      {
        "value": "#EEEEE0",
        "name": "ivory 2"
      },
      {
        "value": "#CDCDC1",
        "name": "ivory 3"
      },
      {
        "value": "#8B8B83",
        "name": "ivory 4"
      },
      {
        "value": "#F5F5DC",
        "css": true,
        "name": "beige"
      },
      {
        "value": "#FFFFE0",
        "name": "lightyellow 1"
      },
      {
        "value": "#FFFFE0",
        "css": true,
        "name": "lightyellow"
      },
      {
        "value": "#EEEED1",
        "name": "lightyellow 2"
      },
      {
        "value": "#CDCDB4",
        "name": "lightyellow 3"
      },
      {
        "value": "#8B8B7A",
        "name": "lightyellow 4"
      },
      {
        "value": "#FAFAD2",
        "css": true,
        "name": "lightgoldenrodyellow"
      },
      {
        "value": "#FFFF00",
        "vga": true,
        "name": "yellow 1"
      },
      {
        "value": "#FFFF00",
        "vga": true,
        "css": true,
        "name": "yellow"
      },
      {
        "value": "#EEEE00",
        "name": "yellow 2"
      },
      {
        "value": "#CDCD00",
        "name": "yellow 3"
      },
      {
        "value": "#8B8B00",
        "name": "yellow 4"
      },
      {
        "value": "#808069",
        "name": "warmgrey"
      },
      {
        "value": "#808000",
        "vga": true,
        "css": true,
        "name": "olive"
      },
      {
        "value": "#BDB76B",
        "css": true,
        "name": "darkkhaki"
      },
      {
        "value": "#FFF68F",
        "name": "khaki 1"
      },
      {
        "value": "#EEE685",
        "name": "khaki 2"
      },
      {
        "value": "#CDC673",
        "name": "khaki 3"
      },
      {
        "value": "#8B864E",
        "name": "khaki 4"
      },
      {
        "value": "#F0E68C",
        "css": true,
        "name": "khaki"
      },
      {
        "value": "#EEE8AA",
        "css": true,
        "name": "palegoldenrod"
      },
      {
        "value": "#FFFACD",
        "name": "lemonchiffon 1"
      },
      {
        "value": "#FFFACD",
        "css": true,
        "name": "lemonchiffon"
      },
      {
        "value": "#EEE9BF",
        "name": "lemonchiffon 2"
      },
      {
        "value": "#CDC9A5",
        "name": "lemonchiffon 3"
      },
      {
        "value": "#8B8970",
        "name": "lemonchiffon 4"
      },
      {
        "value": "#FFEC8B",
        "name": "lightgoldenrod 1"
      },
      {
        "value": "#EEDC82",
        "name": "lightgoldenrod 2"
      },
      {
        "value": "#CDBE70",
        "name": "lightgoldenrod 3"
      },
      {
        "value": "#8B814C",
        "name": "lightgoldenrod 4"
      },
      {
        "value": "#E3CF57",
        "name": "banana"
      },
      {
        "value": "#FFD700",
        "name": "gold 1"
      },
      {
        "value": "#FFD700",
        "css": true,
        "name": "gold"
      },
      {
        "value": "#EEC900",
        "name": "gold 2"
      },
      {
        "value": "#CDAD00",
        "name": "gold 3"
      },
      {
        "value": "#8B7500",
        "name": "gold 4"
      },
      {
        "value": "#FFF8DC",
        "name": "cornsilk 1"
      },
      {
        "value": "#FFF8DC",
        "css": true,
        "name": "cornsilk"
      },
      {
        "value": "#EEE8CD",
        "name": "cornsilk 2"
      },
      {
        "value": "#CDC8B1",
        "name": "cornsilk 3"
      },
      {
        "value": "#8B8878",
        "name": "cornsilk 4"
      },
      {
        "value": "#DAA520",
        "css": true,
        "name": "goldenrod"
      },
      {
        "value": "#FFC125",
        "name": "goldenrod 1"
      },
      {
        "value": "#EEB422",
        "name": "goldenrod 2"
      },
      {
        "value": "#CD9B1D",
        "name": "goldenrod 3"
      },
      {
        "value": "#8B6914",
        "name": "goldenrod 4"
      },
      {
        "value": "#B8860B",
        "css": true,
        "name": "darkgoldenrod"
      },
      {
        "value": "#FFB90F",
        "name": "darkgoldenrod 1"
      },
      {
        "value": "#EEAD0E",
        "name": "darkgoldenrod 2"
      },
      {
        "value": "#CD950C",
        "name": "darkgoldenrod 3"
      },
      {
        "value": "#8B6508",
        "name": "darkgoldenrod 4"
      },
      {
        "value": "#FFA500",
        "name": "orange 1"
      },
      {
        "value": "#FF8000",
        "css": true,
        "name": "orange"
      },
      {
        "value": "#EE9A00",
        "name": "orange 2"
      },
      {
        "value": "#CD8500",
        "name": "orange 3"
      },
      {
        "value": "#8B5A00",
        "name": "orange 4"
      },
      {
        "value": "#FFFAF0",
        "css": true,
        "name": "floralwhite"
      },
      {
        "value": "#FDF5E6",
        "css": true,
        "name": "oldlace"
      },
      {
        "value": "#F5DEB3",
        "css": true,
        "name": "wheat"
      },
      {
        "value": "#FFE7BA",
        "name": "wheat 1"
      },
      {
        "value": "#EED8AE",
        "name": "wheat 2"
      },
      {
        "value": "#CDBA96",
        "name": "wheat 3"
      },
      {
        "value": "#8B7E66",
        "name": "wheat 4"
      },
      {
        "value": "#FFE4B5",
        "css": true,
        "name": "moccasin"
      },
      {
        "value": "#FFEFD5",
        "css": true,
        "name": "papayawhip"
      },
      {
        "value": "#FFEBCD",
        "css": true,
        "name": "blanchedalmond"
      },
      {
        "value": "#FFDEAD",
        "name": "navajowhite 1"
      },
      {
        "value": "#FFDEAD",
        "css": true,
        "name": "navajowhite"
      },
      {
        "value": "#EECFA1",
        "name": "navajowhite 2"
      },
      {
        "value": "#CDB38B",
        "name": "navajowhite 3"
      },
      {
        "value": "#8B795E",
        "name": "navajowhite 4"
      },
      {
        "value": "#FCE6C9",
        "name": "eggshell"
      },
      {
        "value": "#D2B48C",
        "css": true,
        "name": "tan"
      },
      {
        "value": "#9C661F",
        "name": "brick"
      },
      {
        "value": "#FF9912",
        "name": "cadmiumyellow"
      },
      {
        "value": "#FAEBD7",
        "css": true,
        "name": "antiquewhite"
      },
      {
        "value": "#FFEFDB",
        "name": "antiquewhite 1"
      },
      {
        "value": "#EEDFCC",
        "name": "antiquewhite 2"
      },
      {
        "value": "#CDC0B0",
        "name": "antiquewhite 3"
      },
      {
        "value": "#8B8378",
        "name": "antiquewhite 4"
      },
      {
        "value": "#DEB887",
        "css": true,
        "name": "burlywood"
      },
      {
        "value": "#FFD39B",
        "name": "burlywood 1"
      },
      {
        "value": "#EEC591",
        "name": "burlywood 2"
      },
      {
        "value": "#CDAA7D",
        "name": "burlywood 3"
      },
      {
        "value": "#8B7355",
        "name": "burlywood 4"
      },
      {
        "value": "#FFE4C4",
        "name": "bisque 1"
      },
      {
        "value": "#FFE4C4",
        "css": true,
        "name": "bisque"
      },
      {
        "value": "#EED5B7",
        "name": "bisque 2"
      },
      {
        "value": "#CDB79E",
        "name": "bisque 3"
      },
      {
        "value": "#8B7D6B",
        "name": "bisque 4"
      },
      {
        "value": "#E3A869",
        "name": "melon"
      },
      {
        "value": "#ED9121",
        "name": "carrot"
      },
      {
        "value": "#FF8C00",
        "css": true,
        "name": "darkorange"
      },
      {
        "value": "#FF7F00",
        "name": "darkorange 1"
      },
      {
        "value": "#EE7600",
        "name": "darkorange 2"
      },
      {
        "value": "#CD6600",
        "name": "darkorange 3"
      },
      {
        "value": "#8B4500",
        "name": "darkorange 4"
      },
      {
        "value": "#FFA54F",
        "name": "tan 1"
      },
      {
        "value": "#EE9A49",
        "name": "tan 2"
      },
      {
        "value": "#CD853F",
        "name": "tan 3"
      },
      {
        "value": "#CD853F",
        "css": true,
        "name": "peru"
      },
      {
        "value": "#8B5A2B",
        "name": "tan 4"
      },
      {
        "value": "#FAF0E6",
        "css": true,
        "name": "linen"
      },
      {
        "value": "#FFDAB9",
        "name": "peachpuff 1"
      },
      {
        "value": "#FFDAB9",
        "css": true,
        "name": "peachpuff"
      },
      {
        "value": "#EECBAD",
        "name": "peachpuff 2"
      },
      {
        "value": "#CDAF95",
        "name": "peachpuff 3"
      },
      {
        "value": "#8B7765",
        "name": "peachpuff 4"
      },
      {
        "value": "#FFF5EE",
        "name": "seashell 1"
      },
      {
        "value": "#FFF5EE",
        "css": true,
        "name": "seashell"
      },
      {
        "value": "#EEE5DE",
        "name": "seashell 2"
      },
      {
        "value": "#CDC5BF",
        "name": "seashell 3"
      },
      {
        "value": "#8B8682",
        "name": "seashell 4"
      },
      {
        "value": "#F4A460",
        "css": true,
        "name": "sandybrown"
      },
      {
        "value": "#C76114",
        "name": "rawsienna"
      },
      {
        "value": "#D2691E",
        "css": true,
        "name": "chocolate"
      },
      {
        "value": "#FF7F24",
        "name": "chocolate 1"
      },
      {
        "value": "#EE7621",
        "name": "chocolate 2"
      },
      {
        "value": "#CD661D",
        "name": "chocolate 3"
      },
      {
        "value": "#8B4513",
        "name": "chocolate 4"
      },
      {
        "value": "#8B4513",
        "css": true,
        "name": "saddlebrown"
      },
      {
        "value": "#292421",
        "name": "ivoryblack"
      },
      {
        "value": "#FF7D40",
        "name": "flesh"
      },
      {
        "value": "#FF6103",
        "name": "cadmiumorange"
      },
      {
        "value": "#8A360F",
        "name": "burntsienna"
      },
      {
        "value": "#A0522D",
        "css": true,
        "name": "sienna"
      },
      {
        "value": "#FF8247",
        "name": "sienna 1"
      },
      {
        "value": "#EE7942",
        "name": "sienna 2"
      },
      {
        "value": "#CD6839",
        "name": "sienna 3"
      },
      {
        "value": "#8B4726",
        "name": "sienna 4"
      },
      {
        "value": "#FFA07A",
        "name": "lightsalmon 1"
      },
      {
        "value": "#FFA07A",
        "css": true,
        "name": "lightsalmon"
      },
      {
        "value": "#EE9572",
        "name": "lightsalmon 2"
      },
      {
        "value": "#CD8162",
        "name": "lightsalmon 3"
      },
      {
        "value": "#8B5742",
        "name": "lightsalmon 4"
      },
      {
        "value": "#FF7F50",
        "css": true,
        "name": "coral"
      },
      {
        "value": "#FF4500",
        "name": "orangered 1"
      },
      {
        "value": "#FF4500",
        "css": true,
        "name": "orangered"
      },
      {
        "value": "#EE4000",
        "name": "orangered 2"
      },
      {
        "value": "#CD3700",
        "name": "orangered 3"
      },
      {
        "value": "#8B2500",
        "name": "orangered 4"
      },
      {
        "value": "#5E2612",
        "name": "sepia"
      },
      {
        "value": "#E9967A",
        "css": true,
        "name": "darksalmon"
      },
      {
        "value": "#FF8C69",
        "name": "salmon 1"
      },
      {
        "value": "#EE8262",
        "name": "salmon 2"
      },
      {
        "value": "#CD7054",
        "name": "salmon 3"
      },
      {
        "value": "#8B4C39",
        "name": "salmon 4"
      },
      {
        "value": "#FF7256",
        "name": "coral 1"
      },
      {
        "value": "#EE6A50",
        "name": "coral 2"
      },
      {
        "value": "#CD5B45",
        "name": "coral 3"
      },
      {
        "value": "#8B3E2F",
        "name": "coral 4"
      },
      {
        "value": "#8A3324",
        "name": "burntumber"
      },
      {
        "value": "#FF6347",
        "name": "tomato 1"
      },
      {
        "value": "#FF6347",
        "css": true,
        "name": "tomato"
      },
      {
        "value": "#EE5C42",
        "name": "tomato 2"
      },
      {
        "value": "#CD4F39",
        "name": "tomato 3"
      },
      {
        "value": "#8B3626",
        "name": "tomato 4"
      },
      {
        "value": "#FA8072",
        "css": true,
        "name": "salmon"
      },
      {
        "value": "#FFE4E1",
        "name": "mistyrose 1"
      },
      {
        "value": "#FFE4E1",
        "css": true,
        "name": "mistyrose"
      },
      {
        "value": "#EED5D2",
        "name": "mistyrose 2"
      },
      {
        "value": "#CDB7B5",
        "name": "mistyrose 3"
      },
      {
        "value": "#8B7D7B",
        "name": "mistyrose 4"
      },
      {
        "value": "#FFFAFA",
        "name": "snow 1"
      },
      {
        "value": "#FFFAFA",
        "css": true,
        "name": "snow"
      },
      {
        "value": "#EEE9E9",
        "name": "snow 2"
      },
      {
        "value": "#CDC9C9",
        "name": "snow 3"
      },
      {
        "value": "#8B8989",
        "name": "snow 4"
      },
      {
        "value": "#BC8F8F",
        "css": true,
        "name": "rosybrown"
      },
      {
        "value": "#FFC1C1",
        "name": "rosybrown 1"
      },
      {
        "value": "#EEB4B4",
        "name": "rosybrown 2"
      },
      {
        "value": "#CD9B9B",
        "name": "rosybrown 3"
      },
      {
        "value": "#8B6969",
        "name": "rosybrown 4"
      },
      {
        "value": "#F08080",
        "css": true,
        "name": "lightcoral"
      },
      {
        "value": "#CD5C5C",
        "css": true,
        "name": "indianred"
      },
      {
        "value": "#FF6A6A",
        "name": "indianred 1"
      },
      {
        "value": "#EE6363",
        "name": "indianred 2"
      },
      {
        "value": "#8B3A3A",
        "name": "indianred 4"
      },
      {
        "value": "#CD5555",
        "name": "indianred 3"
      },
      {
        "value": "#A52A2A",
        "css": true,
        "name": "brown"
      },
      {
        "value": "#FF4040",
        "name": "brown 1"
      },
      {
        "value": "#EE3B3B",
        "name": "brown 2"
      },
      {
        "value": "#CD3333",
        "name": "brown 3"
      },
      {
        "value": "#8B2323",
        "name": "brown 4"
      },
      {
        "value": "#B22222",
        "css": true,
        "name": "firebrick"
      },
      {
        "value": "#FF3030",
        "name": "firebrick 1"
      },
      {
        "value": "#EE2C2C",
        "name": "firebrick 2"
      },
      {
        "value": "#CD2626",
        "name": "firebrick 3"
      },
      {
        "value": "#8B1A1A",
        "name": "firebrick 4"
      },
      {
        "value": "#FF0000",
        "vga": true,
        "name": "red 1"
      },
      {
        "value": "#FF0000",
        "vga": true,
        "css": true,
        "name": "red"
      },
      {
        "value": "#EE0000",
        "name": "red 2"
      },
      {
        "value": "#CD0000",
        "name": "red 3"
      },
      {
        "value": "#8B0000",
        "name": "red 4"
      },
      {
        "value": "#8B0000",
        "css": true,
        "name": "darkred"
      },
      {
        "value": "#800000",
        "vga": true,
        "css": true,
        "name": "maroon"
      },
      {
        "value": "#8E388E",
        "name": "sgi beet"
      },
      {
        "value": "#7171C6",
        "name": "sgi slateblue"
      },
      {
        "value": "#7D9EC0",
        "name": "sgi lightblue"
      },
      {
        "value": "#388E8E",
        "name": "sgi teal"
      },
      {
        "value": "#71C671",
        "name": "sgi chartreuse"
      },
      {
        "value": "#8E8E38",
        "name": "sgi olivedrab"
      },
      {
        "value": "#C5C1AA",
        "name": "sgi brightgray"
      },
      {
        "value": "#C67171",
        "name": "sgi salmon"
      },
      {
        "value": "#555555",
        "name": "sgi darkgray"
      },
      {
        "value": "#1E1E1E",
        "name": "sgi gray 12"
      },
      {
        "value": "#282828",
        "name": "sgi gray 16"
      },
      {
        "value": "#515151",
        "name": "sgi gray 32"
      },
      {
        "value": "#5B5B5B",
        "name": "sgi gray 36"
      },
      {
        "value": "#848484",
        "name": "sgi gray 52"
      },
      {
        "value": "#8E8E8E",
        "name": "sgi gray 56"
      },
      {
        "value": "#AAAAAA",
        "name": "sgi lightgray"
      },
      {
        "value": "#B7B7B7",
        "name": "sgi gray 72"
      },
      {
        "value": "#C1C1C1",
        "name": "sgi gray 76"
      },
      {
        "value": "#EAEAEA",
        "name": "sgi gray 92"
      },
      {
        "value": "#F4F4F4",
        "name": "sgi gray 96"
      },
      {
        "value": "#FFFFFF",
        "vga": true,
        "css": true,
        "name": "white"
      },
      {
        "value": "#F5F5F5",
        "name": "white smoke"
      },
      {
        "value": "#F5F5F5",
        "name": "gray 96"
      },
      {
        "value": "#DCDCDC",
        "css": true,
        "name": "gainsboro"
      },
      {
        "value": "#D3D3D3",
        "css": true,
        "name": "lightgrey"
      },
      {
        "value": "#C0C0C0",
        "vga": true,
        "css": true,
        "name": "silver"
      },
      {
        "value": "#A9A9A9",
        "css": true,
        "name": "darkgray"
      },
      {
        "value": "#808080",
        "vga": true,
        "css": true,
        "name": "gray"
      },
      {
        "value": "#696969",
        "css": true,
        "name": "dimgray"
      },
      {
        "value": "#696969",
        "name": "gray 42"
      },
      {
        "value": "#000000",
        "vga": true,
        "css": true,
        "name": "black"
      },
      {
        "value": "#FCFCFC",
        "name": "gray 99"
      },
      {
        "value": "#FAFAFA",
        "name": "gray 98"
      },
      {
        "value": "#F7F7F7",
        "name": "gray 97"
      },
      {
        "value": "#F2F2F2",
        "name": "gray 95"
      },
      {
        "value": "#F0F0F0",
        "name": "gray 94"
      },
      {
        "value": "#EDEDED",
        "name": "gray 93"
      },
      {
        "value": "#EBEBEB",
        "name": "gray 92"
      },
      {
        "value": "#E8E8E8",
        "name": "gray 91"
      },
      {
        "value": "#E5E5E5",
        "name": "gray 90"
      },
      {
        "value": "#E3E3E3",
        "name": "gray 89"
      },
      {
        "value": "#E0E0E0",
        "name": "gray 88"
      },
      {
        "value": "#DEDEDE",
        "name": "gray 87"
      },
      {
        "value": "#DBDBDB",
        "name": "gray 86"
      },
      {
        "value": "#D9D9D9",
        "name": "gray 85"
      },
      {
        "value": "#D6D6D6",
        "name": "gray 84"
      },
      {
        "value": "#D4D4D4",
        "name": "gray 83"
      },
      {
        "value": "#D1D1D1",
        "name": "gray 82"
      },
      {
        "value": "#CFCFCF",
        "name": "gray 81"
      },
      {
        "value": "#CCCCCC",
        "name": "gray 80"
      },
      {
        "value": "#C9C9C9",
        "name": "gray 79"
      },
      {
        "value": "#C7C7C7",
        "name": "gray 78"
      },
      {
        "value": "#C4C4C4",
        "name": "gray 77"
      },
      {
        "value": "#C2C2C2",
        "name": "gray 76"
      },
      {
        "value": "#BFBFBF",
        "name": "gray 75"
      },
      {
        "value": "#BDBDBD",
        "name": "gray 74"
      },
      {
        "value": "#BABABA",
        "name": "gray 73"
      },
      {
        "value": "#B8B8B8",
        "name": "gray 72"
      },
      {
        "value": "#B5B5B5",
        "name": "gray 71"
      },
      {
        "value": "#B3B3B3",
        "name": "gray 70"
      },
      {
        "value": "#B0B0B0",
        "name": "gray 69"
      },
      {
        "value": "#ADADAD",
        "name": "gray 68"
      },
      {
        "value": "#ABABAB",
        "name": "gray 67"
      },
      {
        "value": "#A8A8A8",
        "name": "gray 66"
      },
      {
        "value": "#A6A6A6",
        "name": "gray 65"
      },
      {
        "value": "#A3A3A3",
        "name": "gray 64"
      },
      {
        "value": "#A1A1A1",
        "name": "gray 63"
      },
      {
        "value": "#9E9E9E",
        "name": "gray 62"
      },
      {
        "value": "#9C9C9C",
        "name": "gray 61"
      },
      {
        "value": "#999999",
        "name": "gray 60"
      },
      {
        "value": "#969696",
        "name": "gray 59"
      },
      {
        "value": "#949494",
        "name": "gray 58"
      },
      {
        "value": "#919191",
        "name": "gray 57"
      },
      {
        "value": "#8F8F8F",
        "name": "gray 56"
      },
      {
        "value": "#8C8C8C",
        "name": "gray 55"
      },
      {
        "value": "#8A8A8A",
        "name": "gray 54"
      },
      {
        "value": "#878787",
        "name": "gray 53"
      },
      {
        "value": "#858585",
        "name": "gray 52"
      },
      {
        "value": "#828282",
        "name": "gray 51"
      },
      {
        "value": "#7F7F7F",
        "name": "gray 50"
      },
      {
        "value": "#7D7D7D",
        "name": "gray 49"
      },
      {
        "value": "#7A7A7A",
        "name": "gray 48"
      },
      {
        "value": "#787878",
        "name": "gray 47"
      },
      {
        "value": "#757575",
        "name": "gray 46"
      },
      {
        "value": "#737373",
        "name": "gray 45"
      },
      {
        "value": "#707070",
        "name": "gray 44"
      },
      {
        "value": "#6E6E6E",
        "name": "gray 43"
      },
      {
        "value": "#666666",
        "name": "gray 40"
      },
      {
        "value": "#636363",
        "name": "gray 39"
      },
      {
        "value": "#616161",
        "name": "gray 38"
      },
      {
        "value": "#5E5E5E",
        "name": "gray 37"
      },
      {
        "value": "#5C5C5C",
        "name": "gray 36"
      },
      {
        "value": "#595959",
        "name": "gray 35"
      },
      {
        "value": "#575757",
        "name": "gray 34"
      },
      {
        "value": "#545454",
        "name": "gray 33"
      },
      {
        "value": "#525252",
        "name": "gray 32"
      },
      {
        "value": "#4F4F4F",
        "name": "gray 31"
      },
      {
        "value": "#4D4D4D",
        "name": "gray 30"
      },
      {
        "value": "#4A4A4A",
        "name": "gray 29"
      },
      {
        "value": "#474747",
        "name": "gray 28"
      },
      {
        "value": "#454545",
        "name": "gray 27"
      },
      {
        "value": "#424242",
        "name": "gray 26"
      },
      {
        "value": "#404040",
        "name": "gray 25"
      },
      {
        "value": "#3D3D3D",
        "name": "gray 24"
      },
      {
        "value": "#3B3B3B",
        "name": "gray 23"
      },
      {
        "value": "#383838",
        "name": "gray 22"
      },
      {
        "value": "#363636",
        "name": "gray 21"
      },
      {
        "value": "#333333",
        "name": "gray 20"
      },
      {
        "value": "#303030",
        "name": "gray 19"
      },
      {
        "value": "#2E2E2E",
        "name": "gray 18"
      },
      {
        "value": "#2B2B2B",
        "name": "gray 17"
      },
      {
        "value": "#292929",
        "name": "gray 16"
      },
      {
        "value": "#262626",
        "name": "gray 15"
      },
      {
        "value": "#242424",
        "name": "gray 14"
      },
      {
        "value": "#212121",
        "name": "gray 13"
      },
      {
        "value": "#1F1F1F",
        "name": "gray 12"
      },
      {
        "value": "#1C1C1C",
        "name": "gray 11"
      },
      {
        "value": "#1A1A1A",
        "name": "gray 10"
      },
      {
        "value": "#171717",
        "name": "gray 9"
      },
      {
        "value": "#141414",
        "name": "gray 8"
      },
      {
        "value": "#121212",
        "name": "gray 7"
      },
      {
        "value": "#0F0F0F",
        "name": "gray 6"
      },
      {
        "value": "#0D0D0D",
        "name": "gray 5"
      },
      {
        "value": "#0A0A0A",
        "name": "gray 4"
      },
      {
        "value": "#080808",
        "name": "gray 3"
      },
      {
        "value": "#050505",
        "name": "gray 2"
      },
      {
        "value": "#030303",
        "name": "gray 1"
      },
      {
        "value": "#F5F5F5",
        "css": true,
        "name": "whitesmoke"
      }
    ];
  }
});

// node_modules/colornames/index.js
var require_colornames = __commonJS({
  "node_modules/colornames/index.js"(exports, module2) {
    var colors = require_colors();
    var cssColors = colors.filter(function(color) {
      return !!color.css;
    });
    var vgaColors = colors.filter(function(color) {
      return !!color.vga;
    });
    module2.exports = function(name) {
      var color = module2.exports.get(name);
      return color && color.value;
    };
    module2.exports.get = function(name) {
      name = name || "";
      name = name.trim().toLowerCase();
      return colors.filter(function(color) {
        return color.name.toLowerCase() === name;
      }).pop();
    };
    module2.exports.all = module2.exports.get.all = function() {
      return colors;
    };
    module2.exports.get.css = function(name) {
      if (!name)
        return cssColors;
      name = name || "";
      name = name.trim().toLowerCase();
      return cssColors.filter(function(color) {
        return color.name.toLowerCase() === name;
      }).pop();
    };
    module2.exports.get.vga = function(name) {
      if (!name)
        return vgaColors;
      name = name || "";
      name = name.trim().toLowerCase();
      return vgaColors.filter(function(color) {
        return color.name.toLowerCase() === name;
      }).pop();
    };
  }
});

// node_modules/setheader/node_modules/kuler/index.js
var require_kuler2 = __commonJS({
  "node_modules/setheader/node_modules/kuler/index.js"(exports, module2) {
    "use strict";
    var colornames = require_colornames();
    function Kuler(text, color) {
      if (color)
        return new Kuler(text).style(color);
      if (!(this instanceof Kuler))
        return new Kuler(text);
      this.text = text;
    }
    Kuler.prototype.prefix = "\x1B[";
    Kuler.prototype.suffix = "m";
    Kuler.prototype.hex = function hex(color) {
      color = color[0] === "#" ? color.substring(1) : color;
      if (color.length === 3) {
        color = color.split("");
        color[5] = color[2];
        color[4] = color[2];
        color[3] = color[1];
        color[2] = color[1];
        color[1] = color[0];
        color = color.join("");
      }
      var r = color.substring(0, 2), g = color.substring(2, 4), b = color.substring(4, 6);
      return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16)];
    };
    Kuler.prototype.rgb = function rgb(r, g, b) {
      var red = r / 255 * 5, green = g / 255 * 5, blue = b / 255 * 5;
      return this.ansi(red, green, blue);
    };
    Kuler.prototype.ansi = function ansi(r, g, b) {
      var red = Math.round(r), green = Math.round(g), blue = Math.round(b);
      return 16 + red * 36 + green * 6 + blue;
    };
    Kuler.prototype.reset = function reset() {
      return this.prefix + "39;49" + this.suffix;
    };
    Kuler.prototype.style = function style(color) {
      if (!/^#?(?:[0-9a-fA-F]{3}){1,2}$/.test(color)) {
        color = colornames(color);
      }
      return this.prefix + "38;5;" + this.rgb.apply(this, this.hex(color)) + this.suffix + this.text + this.reset();
    };
    module2.exports = Kuler;
  }
});

// node_modules/setheader/node_modules/diagnostics/index.js
var require_diagnostics2 = __commonJS({
  "node_modules/setheader/node_modules/diagnostics/index.js"(exports, module2) {
    "use strict";
    var colorspace = require_colorspace();
    var enabled = require_enabled2();
    var kuler = require_kuler2();
    var util = require("util");
    var tty = require("tty").isatty(1);
    var stream = process.stdout;
    function factory(name, options) {
      if (!enabled(name))
        return function diagnopes() {
        };
      options = options || {};
      options.colors = "colors" in options ? options.colors : tty;
      options.ansi = options.colors ? kuler(name, colorspace(name)) : name;
      options.stream = options.stream || stream;
      if (!Array.isArray(options.stream)) {
        options.stream = [options.stream];
      }
      return function debug(line) {
        if (line instanceof Error)
          line = line.stack || line.message || line;
        line = [
          options.ansi,
          " ",
          line
        ].join("");
        line = util.format.apply(this, [line].concat(Array.prototype.slice.call(arguments, 1))) + "\n";
        options.stream.forEach(function each(stream2) {
          stream2.write(line);
        });
      };
    }
    factory.to = function to(output) {
      stream = output;
      return factory;
    };
    module2.exports = factory;
  }
});

// node_modules/setheader/index.js
var require_setheader = __commonJS({
  "node_modules/setheader/index.js"(exports, module2) {
    "use strict";
    var debug = require_diagnostics2()("setHeader");
    module2.exports = function setHeader(res, name, value) {
      if (!res || !name || !value || res._header) {
        return false;
      }
      var key = name.toLowerCase();
      res.setHeader(name, value);
      var symbols = Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(res) : [];
      var symbol;
      if (symbols.length) {
        for (var i = 0; i < symbols.length; i++) {
          var str = String(symbols[i]);
          if (str === "Symbol(outHeadersKey)" || str === "Symbol(kOutHeaders)") {
            symbol = symbols[i];
            break;
          }
        }
      } else {
        symbol = "_headers";
      }
      var described = Object.getOwnPropertyDescriptor(res[symbol], key);
      if (described && !described.configurable) {
        return false;
      }
      Object.defineProperty(res[symbol], key, {
        configurable: false,
        enumerable: true,
        get: function get() {
          return typeof symbol === "symbol" ? [key, value] : value;
        },
        set: function set(val) {
          debug("attempt to override header %s:%s with %s", name, value, val);
          return value;
        }
      });
      return true;
    };
  }
});

// node_modules/millisecond/index.js
var require_millisecond = __commonJS({
  "node_modules/millisecond/index.js"(exports, module2) {
    "use strict";
    var regex = new RegExp("^((?:\\d+)?\\.?\\d+) *(" + [
      "milliseconds?",
      "msecs?",
      "ms",
      "seconds?",
      "secs?",
      "s",
      "minutes?",
      "mins?",
      "m",
      "hours?",
      "hrs?",
      "h",
      "days?",
      "d",
      "weeks?",
      "wks?",
      "w",
      "years?",
      "yrs?",
      "y"
    ].join("|") + ")?$", "i");
    var second = 1e3;
    var minute = second * 60;
    var hour = minute * 60;
    var day = hour * 24;
    var week = day * 7;
    var year = day * 365;
    module2.exports = function millisecond(ms) {
      var type = typeof ms, amount, match;
      if ("number" === type)
        return ms;
      else if ("string" !== type || "0" === ms || !ms)
        return 0;
      else if (+ms)
        return +ms;
      if (ms.length > 1e4 || !(match = regex.exec(ms)))
        return 0;
      amount = parseFloat(match[1]);
      switch (match[2].toLowerCase()) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return amount * year;
        case "weeks":
        case "week":
        case "wks":
        case "wk":
        case "w":
          return amount * week;
        case "days":
        case "day":
        case "d":
          return amount * day;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return amount * hour;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return amount * minute;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return amount * second;
        default:
          return amount;
      }
    };
  }
});

// node_modules/vary/index.js
var require_vary = __commonJS({
  "node_modules/vary/index.js"(exports, module2) {
    "use strict";
    module2.exports = vary;
    module2.exports.append = append;
    var FIELD_NAME_REGEXP = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
    function append(header, field) {
      if (typeof header !== "string") {
        throw new TypeError("header argument is required");
      }
      if (!field) {
        throw new TypeError("field argument is required");
      }
      var fields = !Array.isArray(field) ? parse(String(field)) : field;
      for (var j = 0; j < fields.length; j++) {
        if (!FIELD_NAME_REGEXP.test(fields[j])) {
          throw new TypeError("field argument contains an invalid header name");
        }
      }
      if (header === "*") {
        return header;
      }
      var val = header;
      var vals = parse(header.toLowerCase());
      if (fields.indexOf("*") !== -1 || vals.indexOf("*") !== -1) {
        return "*";
      }
      for (var i = 0; i < fields.length; i++) {
        var fld = fields[i].toLowerCase();
        if (vals.indexOf(fld) === -1) {
          vals.push(fld);
          val = val ? val + ", " + fields[i] : fields[i];
        }
      }
      return val;
    }
    function parse(header) {
      var end = 0;
      var list = [];
      var start = 0;
      for (var i = 0, len = header.length; i < len; i++) {
        switch (header.charCodeAt(i)) {
          case 32:
            if (start === end) {
              start = end = i + 1;
            }
            break;
          case 44:
            list.push(header.substring(start, end));
            start = end = i + 1;
            break;
          default:
            end = i + 1;
            break;
        }
      }
      list.push(header.substring(start, end));
      return list;
    }
    function vary(res, field) {
      if (!res || !res.getHeader || !res.setHeader) {
        throw new TypeError("res argument is required");
      }
      var val = res.getHeader("Vary") || "";
      var header = Array.isArray(val) ? val.join(", ") : String(val);
      if (val = append(header, field)) {
        res.setHeader("Vary", val);
      }
    }
  }
});

// node_modules/access-control/index.js
var require_access_control = __commonJS({
  "node_modules/access-control/index.js"(exports, module2) {
    "use strict";
    var setHeader = require_setheader();
    var parse = require("url").parse;
    var ms = require_millisecond();
    var vary = require_vary();
    function access(options) {
      options = options || {};
      options.origins = "origins" in options ? options.origins : "*";
      options.methods = "methods" in options ? options.methods : ["GET", "HEAD", "PUT", "POST", "DELETE", "OPTIONS"];
      options.credentials = "credentials" in options ? options.credentials : true;
      options.maxAge = "maxAge" in options ? options.maxAge : "30 days";
      options.headers = "headers" in options ? options.headers : "";
      options.exposed = "exposed" in options ? options.exposed : "";
      ["methods", "headers", "exposed", "origins"].forEach(function cleanup(key) {
        if (Array.isArray(options[key]))
          options[key] = options[key].join(", ");
      });
      if ("string" === typeof options.maxAge) {
        options.maxAge = ms(options.maxAge) / 1e3;
      }
      var separator = /[, ]+/, methods = options.methods.toUpperCase().split(separator).filter(Boolean), headers = options.headers.toLowerCase().split(separator).filter(Boolean), origins = options.origins.toLowerCase().split(separator).filter(Boolean);
      return function control(req, res, next) {
        var origin = (req.headers.origin || "").toLowerCase().trim(), credentials = options.credentials;
        if (!("origin" in req.headers)) {
          if ("function" === typeof next)
            next();
          return false;
        }
        if (~origin.indexOf("%") || origin !== "null" && !parse(origin).protocol || options.origins !== "*" && !~origins.indexOf(origin) || methods.length && !~methods.indexOf(req.method)) {
          res.statusCode = 403;
          res.setHeader("Content-Type", "text/plain");
          res.end([
            "Invalid HTTP Access Control (CORS) request:",
            "  Origin: " + req.headers.origin,
            "  Method: " + req.method
          ].join("\n"));
          return true;
        }
        if (options.origins !== "*" || credentials) {
          setHeader(res, "Access-Control-Allow-Origin", req.headers.origin);
          vary(res, "Origin");
        } else {
          setHeader(res, "Access-Control-Allow-Origin", "*");
        }
        if (credentials) {
          setHeader(res, "Access-Control-Allow-Credentials", "true");
        }
        if ("OPTIONS" === req.method && req.headers["access-control-request-method"]) {
          if (options.maxAge) {
            setHeader(res, "Access-Control-Max-Age", options.maxAge);
          }
          if (options.methods) {
            setHeader(res, "Access-Control-Allow-Methods", methods.join(", "));
          }
          if (options.headers) {
            setHeader(res, "Access-Control-Allow-Headers", options.headers);
          } else if (req.headers["access-control-request-headers"]) {
            setHeader(res, "Access-Control-Allow-Headers", req.headers["access-control-request-headers"]);
          }
          res.statusCode = 200;
          res.setHeader("Content-Length", 0);
          res.end("");
          return true;
        }
        if (options.exposed) {
          setHeader(res, "Access-Control-Expose-Headers", options.exposed);
        }
        if ("function" === typeof next)
          next();
        return false;
      };
    }
    module2.exports = access;
  }
});

// node_modules/primus/middleware/access-control.js
var require_access_control2 = __commonJS({
  "node_modules/primus/middleware/access-control.js"(exports, module2) {
    "use strict";
    var access = require_access_control();
    module2.exports = function configure() {
      var control = access(this.options);
      control.upgrade = false;
      return control;
    };
  }
});

// node_modules/primus/middleware/primus.js
var require_primus = __commonJS({
  "node_modules/primus/middleware/primus.js"(exports, module2) {
    "use strict";
    module2.exports = function configure() {
      var primusjs = this.pathname + "/primus.js", primus = this, library, length;
      function client2(req, res) {
        if (req.uri.pathname !== primusjs)
          return;
        library = library || Buffer.from(primus.library());
        length = length || library.length;
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/javascript; charset=utf-8");
        res.setHeader("Content-Length", length);
        res.end(library);
        return true;
      }
      client2.upgrade = false;
      return client2;
    };
  }
});

// node_modules/primus/middleware/spec.js
var require_spec = __commonJS({
  "node_modules/primus/middleware/spec.js"(exports, module2) {
    "use strict";
    module2.exports = function configure() {
      var specification = this.pathname + "/spec", primus = this;
      function spec(req, res) {
        if (req.uri.pathname !== specification)
          return;
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(primus.spec));
        return true;
      }
      spec.upgrade = false;
      return spec;
    };
  }
});

// node_modules/primus/middleware/xss.js
var require_xss = __commonJS({
  "node_modules/primus/middleware/xss.js"(exports, module2) {
    "use strict";
    var setHeader = require_setheader();
    function xss(req, res) {
      var agent = (req.headers["user-agent"] || "").toLowerCase();
      if (agent && (~agent.indexOf(";msie") || ~agent.indexOf("trident/"))) {
        setHeader(res, "X-XSS-Protection", "0");
      }
    }
    xss.upgrade = false;
    module2.exports = xss;
  }
});

// node_modules/primus/middleware/no-cache.js
var require_no_cache = __commonJS({
  "node_modules/primus/middleware/no-cache.js"(exports, module2) {
    "use strict";
    var setHeader = require_setheader();
    function nocache(req, res) {
      setHeader(res, "Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      setHeader(res, "Pragma", "no-cache");
    }
    nocache.upgrade = false;
    module2.exports = nocache;
  }
});

// node_modules/primus/middleware/authorization.js
var require_authorization = __commonJS({
  "node_modules/primus/middleware/authorization.js"(exports, module2) {
    "use strict";
    module2.exports = function configuration() {
      return function client2(req, res, next) {
        if ("function" !== typeof this.auth)
          return next();
        this.auth(req, function authorized(err) {
          if (!err)
            return next();
          var message = JSON.stringify({ error: err.message || err }), length = Buffer.byteLength(message), code = err.statusCode || 401;
          if (res.setHeader) {
            res.statusCode = code;
            res.setHeader("Content-Type", "application/json");
            res.setHeader("Content-Length", length);
            if (code === 401 && err.authenticate) {
              res.setHeader("WWW-Authenticate", err.authenticate);
            }
          } else {
            res.write("HTTP/" + req.httpVersion + " ");
            res.write(code + " " + require("http").STATUS_CODES[code] + "\r\n");
            res.write("Connection: close\r\n");
            res.write("Content-Type: application/json\r\n");
            res.write("Content-Length: " + length + "\r\n");
            if (code === 401 && err.authenticate) {
              res.write("WWW-Authenticate: " + err.authenticate + "\r\n");
            }
            res.write("\r\n");
          }
          res.end(message);
        });
      };
    };
  }
});

// node_modules/asyncemit/index.js
var require_asyncemit = __commonJS({
  "node_modules/asyncemit/index.js"(exports, module2) {
    "use strict";
    var prefix = require_eventemitter3().prefixed;
    var toString = Object.prototype.toString;
    var slice = Array.prototype.slice;
    function type(what) {
      return toString.call(what).slice(8, -1).toLowerCase();
    }
    module2.exports = function asyncemit() {
      var args = slice.call(arguments, 0), event = args.shift(), async = args.length, fn = args.pop(), selfie = this, listeners;
      listeners = (this._events || {})[prefix ? prefix + event : event];
      if (!listeners)
        return fn(), this;
      if (type(listeners) !== "array")
        listeners = [listeners];
      (function each(stack) {
        if (!stack.length)
          return fn();
        var listener = stack.shift();
        if (listener.once) {
          selfie.removeListener(event, listener.fn);
        }
        if (listener.fn.length !== async) {
          listener.fn.apply(listener.context, args);
          return each(stack);
        }
        listener.fn.apply(listener.context, args.concat(function done(err) {
          if (err)
            return fn(err);
          each(stack);
        }));
      })(listeners.slice());
      return this;
    };
  }
});

// node_modules/connected/index.js
var require_connected = __commonJS({
  "node_modules/connected/index.js"(exports, module2) {
    "use strict";
    module2.exports = function listen() {
      var args = Array.prototype.slice.call(arguments, 0), server = args.shift(), fn = args.pop();
      function collector(err) {
        server.removeListener("error", collector);
        server.removeListener("listening", collector);
        if (fn)
          fn.apply(server, arguments);
        else if (err)
          throw err;
      }
      if ("function" !== typeof fn) {
        args.push(fn);
        fn = null;
      }
      server.once("listening", collector);
      server.once("error", collector);
      return server.listen.apply(server, args);
    };
  }
});

// node_modules/create-server/index.js
var require_create_server = __commonJS({
  "node_modules/create-server/index.js"(exports, module2) {
    "use strict";
    var listen = require_connected();
    var parse = require("url").parse;
    var path = require("path");
    var fs = require("fs");
    function is(obj) {
      return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
    }
    function create(server, fn) {
      var type = is(server), options;
      if ("object" === type)
        options = server;
      else if ("number" === type)
        options = { port: server };
      else
        options = {};
      fn = create.fns(fn || options);
      var certs = options.key && options.cert, hostname = options.hostname, port = options.port || 443, secure = certs || 443 === port, spdy = "spdy" in options;
      if (spdy)
        type = "spdy";
      else if (secure)
        type = "https";
      else
        type = "http";
      if ((secure || spdy) && !certs) {
        throw new Error("Missing the SSL key or certificate files in the options.");
      }
      if (secure && options.root) {
        ["cert", "key", "ca", "pfx", "crl"].filter(function filter(key) {
          return key in options;
        }).forEach(function parse2(key) {
          var data = options[key];
          if (Array.isArray(data)) {
            options[key] = data.map(function read(file) {
              return fs.readFileSync(path.join(options.root, file));
            });
          } else {
            options[key] = fs.readFileSync(path.join(options.root, data));
          }
        });
      }
      if (secure) {
        options.secureProtocol = options.secureProtocol || "SSLv23_method";
        options.secureOptions = options.secureOptions || require("constants").SSL_OP_NO_SSLv3;
        options.ciphers = options.ciphers || [
          "ECDHE-RSA-AES256-SHA384",
          "DHE-RSA-AES256-SHA384",
          "ECDHE-RSA-AES256-SHA256",
          "DHE-RSA-AES256-SHA256",
          "ECDHE-RSA-AES128-SHA256",
          "DHE-RSA-AES128-SHA256",
          "HIGH",
          "!aNULL",
          "!eNULL",
          "!EXPORT",
          "!DES",
          "!RC4",
          "!MD5",
          "!PSK",
          "!SRP",
          "!CAMELLIA"
        ].join(":");
      }
      server = require(type).createServer("http" !== type ? options : void 0);
      if (+options.redirect) {
        var redirect = require("http").createServer(function handle(req, res) {
          res.statusCode = 404;
          if (req.headers.host) {
            var url = parse("http://" + req.headers.host);
            res.statusCode = 301;
            res.setHeader("Location", "http" + (secure ? "s" : "") + "://" + url.hostname + ":" + port + req.url);
          }
          if (secure)
            res.setHeader("Strict-Transport-Security", "max-age=8640000; includeSubDomains");
          res.end("");
        }).listen(+options.redirect, hostname);
        server.once("close", function close() {
          try {
            redirect.close();
          } catch (e) {
          }
        });
      }
      if (fn.close)
        server.once("close", fn.close);
      ["request", "upgrade", "error"].forEach(function each(event) {
        if (fn[event])
          server.on(event, fn[event]);
      });
      if (fn[type])
        fn[type]();
      if (options.listen !== false) {
        listen(server, port, hostname, fn.listening);
      } else if (fn.listening) {
        server.once("listening", fn.listening);
      }
      return server;
    }
    create.fns = function fns(fn) {
      var callbacks = {};
      if ("function" === typeof fn) {
        callbacks.listening = fn;
        return callbacks;
      }
      [
        "close",
        "request",
        "listening",
        "upgrade",
        "error",
        "http",
        "https",
        "spdy"
      ].forEach(function each(name) {
        if ("function" !== typeof fn[name])
          return;
        callbacks[name] = fn[name];
      });
      return callbacks;
    };
    module2.exports = create;
  }
});

// node_modules/primus/index.js
var require_primus2 = __commonJS({
  "node_modules/primus/index.js"(exports, module2) {
    "use strict";
    var PrimusError = require_errors().PrimusError;
    var EventEmitter = require_eventemitter3();
    var Transformer = require_transformer();
    var log = require_node()("primus");
    var Spark = require_spark();
    var fuse = require_fusing();
    var fs = require("fs");
    var vm = require("vm");
    function Primus3(server, options) {
      if (!(this instanceof Primus3))
        return new Primus3(server, options);
      this.fuse();
      if ("object" !== typeof server) {
        var message = "The first argument of the constructor must be an HTTP or HTTPS server instance";
        throw new PrimusError(message, this);
      }
      options = options || {};
      options.maxLength = options.maxLength || 10485760;
      options.transport = options.transport || {};
      options.pingInterval = "pingInterval" in options ? options.pingInterval : 3e4;
      if ("timeout" in options) {
        throw new PrimusError("The `timeout` option has been removed", this);
      }
      var primus = this, key;
      this.auth = options.authorization || null;
      this.connections = /* @__PURE__ */ Object.create(null);
      this.ark = /* @__PURE__ */ Object.create(null);
      this.layers = [];
      this.heartbeatInterval = null;
      this.transformer = null;
      this.encoder = null;
      this.decoder = null;
      this.connected = 0;
      this.whitelist = [];
      this.options = options;
      this.transformers = {
        outgoing: [],
        incoming: []
      };
      this.server = server;
      this.pathname = "string" === typeof options.pathname ? options.pathname.charAt(0) !== "/" ? "/" + options.pathname : options.pathname : "/primus";
      this.spec = {
        pingInterval: options.pingInterval,
        pathname: this.pathname,
        version: this.version
      };
      this.Spark = function Sparky(headers, address, query, id, request, socket) {
        Spark.call(this, primus, headers, address, query, id, request, socket);
      };
      this.Spark.prototype = Object.create(Spark.prototype, {
        constructor: {
          configurable: true,
          value: this.Spark,
          writable: true
        },
        __initialise: {
          value: Spark.prototype.__initialise.slice(),
          configurable: true,
          writable: true
        }
      });
      for (key in Spark) {
        this.Spark[key] = Spark[key];
      }
      this.parsers(options.parser);
      this.initialise(options.transformer, options);
      if ("string" === typeof options.plugin) {
        options.plugin.split(/[, ]+/).forEach(function register(name) {
          primus.plugin(name, name);
        });
      } else if ("object" === typeof options.plugin) {
        for (key in options.plugin) {
          this.plugin(key, options.plugin[key]);
        }
      }
      if (!options.iknowclusterwillbreakconnections && require("cluster").isWorker)
        [
          "",
          "The `cluster` module does not implement sticky sessions. Learn more about",
          "this issue at:",
          "",
          "http://github.com/primus/primus#can-i-use-cluster",
          ""
        ].forEach(function warn(line) {
          console.error("Primus: " + line);
        });
    }
    fuse(Primus3, EventEmitter);
    Object.defineProperty(Primus3.prototype, "client", {
      get: function read() {
        if (!read.primus) {
          read.primus = fs.readFileSync(__dirname + "/dist/primus.js", "utf-8");
        }
        return read.primus;
      }
    });
    Object.defineProperty(Primus3.prototype, "Socket", {
      get: function() {
        const sandbox = Object.keys(global).reduce((acc, key) => {
          if (key !== "global" && key !== "require")
            acc[key] = global[key];
          return acc;
        }, {
          __dirname: process.cwd(),
          __filename: "primus.js",
          require,
          Uint8Array,
          Object,
          RegExp,
          Array,
          Error,
          Date
        });
        vm.runInNewContext(this.library(true), sandbox, { filename: "primus.js" });
        return sandbox[this.options.global || "Primus"];
      }
    });
    Primus3.prototype.version = require_package().version;
    Primus3.transformers = require_transformers();
    Primus3.parsers = require_parsers();
    Primus3.readable("is", function is(what, where) {
      var missing = Primus3.parsers !== where ? "transformer" : "parser", dependency = where[what];
      return {
        missing: function write() {
          console.error("Primus:");
          console.error("Primus: Missing required npm dependency for " + what);
          console.error("Primus: Please run the following command and try again:");
          console.error("Primus:");
          console.error("Primus:   npm install --save %s", dependency.server);
          console.error("Primus:");
          return "Missing dependencies for " + missing + ': "' + what + '"';
        },
        unknown: function write() {
          console.error("Primus:");
          console.error('Primus: Unsupported %s: "%s"', missing, what);
          console.error("Primus: We only support the following %ss:", missing);
          console.error("Primus:");
          console.error("Primus:   %s", Object.keys(where).join(", "));
          console.error("Primus:");
          return "Unsupported " + missing + ': "' + what + '"';
        }
      };
    });
    Primus3.readable("initialise", function initialise(Transformer2, options) {
      Transformer2 = Transformer2 || "websockets";
      var primus = this, transformer;
      if ("string" === typeof Transformer2) {
        log("transformer `%s` is a string, attempting to resolve location", Transformer2);
        Transformer2 = transformer = Transformer2.toLowerCase();
        this.spec.transformer = transformer;
        if (!(Transformer2 in Primus3.transformers)) {
          log("the supplied transformer %s is not supported, please use %s", transformer, Primus3.transformers);
          throw new PrimusError(this.is(Transformer2, Primus3.transformers).unknown(), this);
        }
        try {
          Transformer2 = require("./transformers/" + transformer);
          this.transformer = new Transformer2(this);
        } catch (e) {
          if (e.code === "MODULE_NOT_FOUND") {
            log("the supplied transformer `%s` is missing", transformer);
            throw new PrimusError(this.is(transformer, Primus3.transformers).missing(), this);
          } else {
            log(e);
            throw e;
          }
        }
      } else {
        log("received a custom transformer");
        this.spec.transformer = "custom";
      }
      if ("function" !== typeof Transformer2) {
        throw new PrimusError("The given transformer is not a constructor", this);
      }
      this.transformer = this.transformer || new Transformer2(this);
      this.on("connection", function connection(stream) {
        this.connected++;
        this.connections[stream.id] = stream;
        log("connection: %s currently serving %d concurrent", stream.id, this.connected);
      });
      this.on("disconnection", function disconnected(stream) {
        this.connected--;
        delete this.connections[stream.id];
        log("disconnection: %s currently serving %d concurrent", stream.id, this.connected);
      });
      this.use("forwarded", require_forwarded());
      this.use("cors", require_access_control2());
      this.use("primus.js", require_primus());
      this.use("spec", require_spec());
      this.use("x-xss", require_xss());
      this.use("no-cache", require_no_cache());
      this.use("authorization", require_authorization());
      if (options.pingInterval) {
        this.heartbeatInterval = setInterval(this.heartbeat.bind(this), options.pingInterval);
      }
      process.nextTick(function tock() {
        primus.emit("initialised", primus.transformer, primus.parser, options);
      });
    });
    Primus3.readable("authorize", function authorize(auth) {
      if ("function" !== typeof auth) {
        throw new PrimusError("Authorize only accepts functions", this);
      }
      if (auth.length < 2) {
        throw new PrimusError("Authorize function requires more arguments", this);
      }
      log("setting an authorization function");
      this.auth = auth;
      return this;
    });
    Primus3.readable("forEach", function forEach(fn, done) {
      if (!done) {
        for (var id in this.connections) {
          if (fn(this.spark(id), id, this.connections) === false)
            break;
        }
        return this;
      }
      var ids = Object.keys(this.connections), primus = this;
      log("iterating over %d connections", ids.length);
      function pushId(spark) {
        ids.push(spark.id);
      }
      primus.on("connection", pushId);
      (function iterate() {
        var id2 = ids.shift(), spark;
        if (!id2) {
          primus.removeListener("connection", pushId);
          return done();
        }
        spark = primus.spark(id2);
        if (!spark)
          return iterate();
        fn(spark, function next(err, forward) {
          if (err || forward === false) {
            primus.removeListener("connection", pushId);
            return done(err);
          }
          iterate();
        });
      })();
      return this;
    });
    Primus3.readable("heartbeat", function heartbeat() {
      this.forEach(function forEach(spark) {
        spark.heartbeat();
      });
      return this;
    });
    Primus3.readable("write", function write(data) {
      this.forEach(function forEach(spark) {
        spark.write(data);
      });
      return this;
    });
    Primus3.readable("parsers", function parsers(parser) {
      parser = parser || "json";
      if ("string" === typeof parser) {
        log("transformer `%s` is a string, attempting to resolve location", parser);
        parser = parser.toLowerCase();
        this.spec.parser = parser;
        if (!(parser in Primus3.parsers)) {
          log("the supplied parser `%s` is not supported please use %s", parser, Primus3.parsers);
          throw new PrimusError(this.is(parser, Primus3.parsers).unknown(), this);
        }
        try {
          parser = require("./parsers/" + parser);
        } catch (e) {
          if (e.code === "MODULE_NOT_FOUND") {
            log("the supplied parser `%s` is missing", parser);
            throw new PrimusError(this.is(parser, Primus3.parsers).missing(), this);
          } else {
            log(e);
            throw e;
          }
        }
      } else {
        this.spec.parser = "custom";
      }
      if ("object" !== typeof parser) {
        throw new PrimusError("The given parser is not an Object", this);
      }
      this.encoder = parser.encoder;
      this.decoder = parser.decoder;
      this.parser = parser;
      return this;
    });
    Primus3.readable("transform", function transform(type, fn) {
      if (!(type in this.transformers)) {
        throw new PrimusError("Invalid transformer type", this);
      }
      if (~this.transformers[type].indexOf(fn)) {
        log("the %s message transformer already exists, not adding it", type);
        return this;
      }
      this.transformers[type].push(fn);
      return this;
    });
    Primus3.readable("spark", function spark(id) {
      return this.connections[id];
    });
    Primus3.readable("library", function compile(nodejs) {
      var library = [!nodejs ? this.transformer.library : null], global2 = this.options.global || "Primus", parser = this.parser.library || "", client2 = this.client;
      client2 = [
        "(function UMDish(name, context, definition, plugins) {",
        "  context[name] = definition.call(context);",
        "  for (var i = 0; i < plugins.length; i++) {",
        "    plugins[i](context[name])",
        "  }",
        '  if (typeof module !== "undefined" && module.exports) {',
        "    module.exports = context[name];",
        '  } else if (typeof define === "function" && define.amd) {',
        "    define(function reference() { return context[name]; });",
        "  }",
        '})("' + global2 + '", this || {}, function wrapper() {',
        "  var define, module, exports",
        "    , Primus = " + client2.slice(client2.indexOf("return ") + 7, -4) + ";",
        ""
      ].join("\n");
      client2 = client2.replace("null; // @import {primus::pathname}", '"' + this.pathname.toString() + '"').replace("null; // @import {primus::version}", '"' + this.version + '"').replace("null; // @import {primus::client}", this.transformer.client.toString()).replace("null; // @import {primus::auth}", (!!this.auth).toString()).replace("null; // @import {primus::encoder}", this.encoder.toString()).replace("null; // @import {primus::decoder}", this.decoder.toString());
      if (this.options.pingInterval) {
        const value = this.options.pingInterval + Math.round(this.options.pingInterval / 2);
        log("updating the default value of the client `pingTimeout` option");
        client2 = client2.replace("options.pingTimeout : 45e3;", `options.pingTimeout : ${value};`);
      } else {
        log("setting the default value of the client `pingTimeout` option to `false`");
        client2 = client2.replace("options.pingTimeout : 45e3;", "options.pingTimeout : false;");
      }
      if (parser && parser.length) {
        log("adding parser to the client file");
        client2 += parser;
      }
      var name, plugin;
      for (name in this.ark) {
        plugin = this.ark[name];
        name = JSON.stringify(name);
        if (plugin.library) {
          log("adding the library of the %s plugin to the client file", name);
          library.push(plugin.library);
        }
        if (!plugin.client)
          continue;
        log("adding the client code of the %s plugin to the client file", name);
        client2 += "Primus.prototype.ark[" + name + "] = " + plugin.client.toString() + ";\n";
      }
      return client2 + [
        "  return Primus;",
        "},",
        "["
      ].concat(library.filter(Boolean).map(function expose(library2) {
        return [
          "function (Primus) {",
          library2,
          "}"
        ].join("\n");
      }).join(",\n")).concat("]);").join("\n");
    });
    Primus3.readable("save", function save(path, fn) {
      if (!fn)
        fs.writeFileSync(path, this.library(), "utf-8");
      else
        fs.writeFile(path, this.library(), "utf-8", fn);
      return this;
    });
    Primus3.readable("plugin", function plugin(name, energon) {
      if (!name)
        return this.ark;
      if (!energon) {
        if ("string" === typeof name)
          return this.ark[name];
        if ("object" === typeof name) {
          energon = name;
          name = energon.name;
        }
      }
      if ("string" !== typeof name || !name) {
        throw new PrimusError("Plugin name must be a non empty string", this);
      }
      if ("string" === typeof energon) {
        log("plugin was passed as a string, attempting to require %s", energon);
        energon = require(energon);
      }
      if (!/^(object|function)$/.test(typeof energon)) {
        throw new PrimusError("Plugin should be an object or function", this);
      }
      if (!energon.server && !energon.client) {
        throw new PrimusError("Plugin is missing a client or server function", this);
      }
      if (name in this.ark) {
        throw new PrimusError("Plugin name already defined", this);
      }
      log("adding %s as new plugin", name);
      this.ark[name] = energon;
      this.emit("plugin", name, energon);
      if (!energon.server)
        return this;
      log("calling the %s plugin's server code", name);
      energon.server.call(this, this, this.options);
      return this;
    });
    Primus3.readable("plugout", function plugout(name) {
      if (!(name in this.ark))
        return false;
      this.emit("plugout", name, this.ark[name]);
      delete this.ark[name];
      return true;
    });
    Primus3.readable("use", function use(name, fn, options, level) {
      if ("function" === typeof name) {
        level = options;
        options = fn;
        fn = name;
        name = fn.name || "pid_" + Date.now();
      }
      if (!level && "number" === typeof options) {
        level = options;
        options = {};
      }
      options = options || {};
      if (fn.length < 2) {
        log("automatically configuring middleware `%s`", name);
        fn = fn.call(this, options);
      }
      if ("function" !== typeof fn || fn.length < 2) {
        throw new PrimusError("Middleware should be a function that accepts at least 2 args");
      }
      var layer = {
        length: fn.length,
        enabled: true,
        name,
        fn
      }, index = this.indexOfLayer(name);
      if (!~index) {
        if (level >= 0 && level < this.layers.length) {
          log("adding middleware `%s` to the supplied index at %d", name, level);
          this.layers.splice(level, 0, layer);
        } else {
          this.layers.push(layer);
        }
      } else {
        this.layers[index] = layer;
      }
      return this;
    });
    Primus3.readable("remove", function remove(name) {
      var index = this.indexOfLayer(name);
      if (~index) {
        log("removing middleware `%s`", name);
        this.layers.splice(index, 1);
      }
      return this;
    });
    Primus3.readable("enable", function enable(name) {
      var index = this.indexOfLayer(name);
      if (~index) {
        log("enabling middleware `%s`", name);
        this.layers[index].enabled = true;
      }
      return this;
    });
    Primus3.readable("disable", function disable(name) {
      var index = this.indexOfLayer(name);
      if (~index) {
        log("disabling middleware `%s`", name);
        this.layers[index].enabled = false;
      }
      return this;
    });
    Primus3.readable("indexOfLayer", function indexOfLayer(name) {
      for (var i = 0, length = this.layers.length; i < length; i++) {
        if (this.layers[i].name === name)
          return i;
      }
      return -1;
    });
    Primus3.readable("destroy", function destroy(options, fn) {
      if ("function" === typeof options) {
        fn = options;
        options = null;
      }
      options = options || {};
      if (options.reconnect)
        options.close = true;
      var primus = this;
      clearInterval(primus.heartbeatInterval);
      setTimeout(function close() {
        var transformer = primus.transformer;
        if (transformer)
          transformer.ultron.destroy();
        primus.forEach(function shutdown(spark) {
          spark.end(void 0, { reconnect: options.reconnect });
        });
        if (options.close !== false) {
          try {
            primus.server.close(function closed() {
              primus.close(options, fn);
            });
            return;
          } catch (e) {
          }
        }
        primus.close(options, fn);
      }, +options.timeout || 0);
      return this;
    });
    Primus3.readable("close", function close(options, fn) {
      var primus = this;
      primus.asyncemit("close", options, function done(err) {
        if (err) {
          if (fn)
            return fn(err);
          throw err;
        }
        var transformer = primus.transformer, server = primus.server;
        if (!server)
          return fn && fn();
        server.removeAllListeners("request");
        server.removeAllListeners("upgrade");
        transformer.listeners("previous::request").forEach(function add(listener) {
          server.on("request", listener);
        });
        transformer.listeners("previous::upgrade").forEach(function add(listener) {
          server.on("upgrade", listener);
        });
        transformer.emit("close", options);
        transformer.removeAllListeners();
        primus.removeAllListeners();
        primus.transformers.outgoing.length = primus.transformers.incoming.length = 0;
        primus.transformer = primus.encoder = primus.decoder = primus.server = null;
        primus.connected = 0;
        primus.connections = /* @__PURE__ */ Object.create(null);
        primus.ark = /* @__PURE__ */ Object.create(null);
        if (fn)
          fn();
      });
      return this;
    });
    Primus3.readable("asyncemit", require_asyncemit());
    Primus3.readable("end", Primus3.prototype.destroy);
    Primus3.readable("reserved", function reserved(evt) {
      return /^(incoming|outgoing)::/.test(evt) || evt in reserved.events;
    });
    Primus3.prototype.reserved.events = {
      "disconnection": 1,
      "initialised": 1,
      "connection": 1,
      "plugout": 1,
      "plugin": 1,
      "close": 1,
      "log": 1
    };
    Primus3.createSocket = function createSocket(options) {
      options = Object.assign({}, options, { pingInterval: false });
      var primus = new Primus3(new EventEmitter(), options);
      return primus.Socket;
    };
    Primus3.createServer = function createServer(fn, options) {
      if ("object" === typeof fn) {
        options = fn;
        fn = null;
      }
      options = options || {};
      var server = require_create_server()(Primus3.prototype.merge.call(Primus3, {
        http: function warn() {
          if (!options.iknowhttpsisbetter)
            [
              "",
              "We've detected that you're using a HTTP instead of a HTTPS server.",
              "Please be aware that real-time connections have less chance of being blocked",
              "by firewalls and anti-virus scanners if they are encrypted (using SSL). If",
              "you run your server behind a reverse and HTTPS terminating proxy ignore",
              "this message, if not, you've been warned.",
              ""
            ].forEach(function each(line) {
              console.log("primus: " + line);
            });
        }
      }, options));
      var application = new Primus3(server, options);
      if (fn)
        application.on("connection", fn);
      return application;
    };
    Primus3.Transformer = Transformer;
    Primus3.Spark = Spark;
    module2.exports = Primus3;
  }
});

// node_modules/primus-emitter/lib/spark.js
var require_spark2 = __commonJS({
  "node_modules/primus-emitter/lib/spark.js"(exports, module2) {
    module2.exports = function spark(Spark, Emitter2) {
      "use strict";
      var initialise = Spark.prototype.initialise;
      Spark.prototype.initialise = function init() {
        if (!this.emitter)
          this.emitter = new Emitter2(this);
        if (!this.__initialise)
          initialise.apply(this, arguments);
      };
      if (!Spark.readable)
        Spark.prototype.send = send;
      else if (!Spark.prototype.send)
        Spark.readable("send", send);
      function send(ev, data, fn) {
        if (/^(newListener|removeListener)/.test(ev))
          return this;
        this.emitter.send.apply(this.emitter, arguments);
        return this;
      }
    };
  }
});

// node_modules/primus-emitter/lib/emitter.js
var require_emitter = __commonJS({
  "node_modules/primus-emitter/lib/emitter.js"(exports, module2) {
    module2.exports = function emitter() {
      "use strict";
      var toString = Object.prototype.toString, slice = Array.prototype.slice;
      var isArray = Array.isArray || function isArray2(value) {
        return "[object Array]" === toString.call(value);
      };
      var packets = {
        EVENT: 0,
        ACK: 1
      };
      function Emitter2(conn) {
        if (!(this instanceof Emitter2))
          return new Emitter2(conn);
        this.ids = 1;
        this.acks = {};
        this.conn = conn;
        if (this.conn)
          this.bind();
      }
      Emitter2.prototype.bind = function bind() {
        var em = this;
        this.conn.on("data", function ondata(packet) {
          em.ondata.call(em, packet);
        });
        return this;
      };
      Emitter2.prototype.ondata = function ondata(packet) {
        if (!isArray(packet.data) || packet.id && "number" !== typeof packet.id) {
          return this;
        }
        switch (packet.type) {
          case packets.EVENT:
            this.onevent(packet);
            break;
          case packets.ACK:
            this.onack(packet);
        }
        return this;
      };
      Emitter2.prototype.send = function send() {
        var args = slice.call(arguments);
        this.conn.write(this.packet(args));
        return this;
      };
      Emitter2.prototype.packet = function pack(args) {
        var packet = { type: packets.EVENT, data: args };
        if ("function" === typeof args[args.length - 1]) {
          var id = this.ids++;
          this.acks[id] = args.pop();
          packet.id = id;
        }
        return packet;
      };
      Emitter2.prototype.onevent = function onevent(packet) {
        var args = packet.data;
        if (this.conn.reserved(args[0]))
          return this;
        if (packet.id)
          args.push(this.ack(packet.id));
        this.conn.emit.apply(this.conn, args);
        return this;
      };
      Emitter2.prototype.ack = function ack(id) {
        var conn = this.conn, sent = false;
        return function() {
          if (sent)
            return;
          sent = true;
          conn.write({
            id,
            type: packets.ACK,
            data: slice.call(arguments)
          });
        };
      };
      Emitter2.prototype.onack = function onack(packet) {
        var ack = this.acks[packet.id];
        if ("function" === typeof ack) {
          ack.apply(this, packet.data);
          delete this.acks[packet.id];
        }
        return this;
      };
      Emitter2.packets = packets;
      return Emitter2;
    };
  }
});

// node_modules/primus-emitter/lib/index.js
var require_lib2 = __commonJS({
  "node_modules/primus-emitter/lib/index.js"(exports, module2) {
    "use strict";
    var spark = require_spark2();
    var emitter = require_emitter();
    var Emitter2 = emitter();
    var noop = function() {
    };
    module2.exports = PrimusEmitter;
    function PrimusEmitter(primus) {
      primus.$ = primus.$ || {};
      primus.$.emitter = {};
      primus.$.emitter.spark = spark;
      primus.$.emitter.emitter = emitter;
      primus.$.emitter.Emitter = Emitter2;
      primus.send = function send(ev, data, fn) {
        var args = arguments;
        primus.forEach(function each(spark2) {
          spark2.send.apply(spark2, args);
        });
        return this;
      };
      return spark(primus.Spark, Emitter2);
    }
    PrimusEmitter.library = [
      ";(function (Primus, undefined) {",
      spark.toString(),
      emitter.toString(),
      " if (undefined === Primus) return;",
      " Primus.$ = Primus.$ || {};",
      " Primus.$.emitter = {};",
      " Primus.$.emitter.spark = spark;",
      " Primus.$.emitter.emitter = emitter;",
      " spark(Primus, emitter());",
      "})(Primus);"
    ].join("\n");
    PrimusEmitter.server = PrimusEmitter;
    PrimusEmitter.client = noop;
    PrimusEmitter.spark = spark;
    PrimusEmitter.Emitter = Emitter2;
  }
});

// node_modules/primus-emitter/index.js
var require_primus_emitter = __commonJS({
  "node_modules/primus-emitter/index.js"(exports, module2) {
    module2.exports = require_lib2();
  }
});

// index.js
var ws = require_ws();
var jsonParser = require_json();
var wsTransformer = require_websockets();
var core = require_core();
var Primus2 = require_primus2();
var Emitter = require_primus_emitter();
var Socket = Primus2.createSocket({
  transformer: wsTransformer,
  parser: jsonParser,
  plugin: { emitter: Emitter },
  noop: [ws]
});
var admiralHost = core.getInput("admiralHost");
var appId = core.getInput("appId");
var order = core.getInput("order");
var version = core.getInput("version");
var explicitEnvironment = core.getInput("environment");
core.info("INPUT:", appId, order, version, explicitEnvironment);
if (!admiralHost || !appId || !order || !version) {
  core.setFailed("admiralHost, appId, order and version must all be set");
  process.exit(1);
}
var environment = explicitEnvironment || (version.includes("-") ? "staging" : "production");
core.info("Chosen Environment:", environment);
var client = new Socket(admiralHost, { strategy: false });
client.on("error", (error) => {
  core.info(error);
  client.end();
});
client.on("open", () => {
  client.on("serverMessage", (data) => {
    const msg = "Admiral: " + data.message;
    core.info(msg);
  });
  client.on("captainMessage", (data) => {
    const msg = data.captainName + ": " + data.message;
    core.info(msg);
  });
  client.send("register", null, (response) => {
    const data = {
      appId,
      environment,
      order,
      orderArgs: [version],
      clientId: response.clientId,
      username: "GitHub Actions"
    };
    client.send("executeOrder", data, (response2) => {
      if (response2.success) {
        core.info("ORDER EXECUTED");
        core.setOutput("success", true);
      } else {
        if (response2.message)
          core.info(response2.message);
        core.setOutput("success", false);
        core.setFailed(response2.message);
        process.exit(1);
      }
      client.end();
    });
  });
});
/*!
 * vary
 * Copyright(c) 2014-2017 Douglas Christopher Wilson
 * MIT Licensed
 */
//# sourceMappingURL=index.js.map
