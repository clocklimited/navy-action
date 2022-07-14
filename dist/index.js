require('./sourcemap-register.js');/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 7351:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.issue = exports.issueCommand = void 0;
const os = __importStar(__nccwpck_require__(2037));
const utils_1 = __nccwpck_require__(5278);
/**
 * Commands
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * Examples:
 *   ::warning::This is the message
 *   ::set-env name=MY_VAR::some value
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
function escapeData(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 2186:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getIDToken = exports.getState = exports.saveState = exports.group = exports.endGroup = exports.startGroup = exports.info = exports.notice = exports.warning = exports.error = exports.debug = exports.isDebug = exports.setFailed = exports.setCommandEcho = exports.setOutput = exports.getBooleanInput = exports.getMultilineInput = exports.getInput = exports.addPath = exports.setSecret = exports.exportVariable = exports.ExitCode = void 0;
const command_1 = __nccwpck_require__(7351);
const file_command_1 = __nccwpck_require__(717);
const utils_1 = __nccwpck_require__(5278);
const os = __importStar(__nccwpck_require__(2037));
const path = __importStar(__nccwpck_require__(1017));
const oidc_utils_1 = __nccwpck_require__(8041);
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportVariable(name, val) {
    const convertedVal = utils_1.toCommandValue(val);
    process.env[name] = convertedVal;
    const filePath = process.env['GITHUB_ENV'] || '';
    if (filePath) {
        const delimiter = '_GitHubActionsFileCommandDelimeter_';
        const commandValue = `${name}<<${delimiter}${os.EOL}${convertedVal}${os.EOL}${delimiter}`;
        file_command_1.issueCommand('ENV', commandValue);
    }
    else {
        command_1.issueCommand('set-env', { name }, convertedVal);
    }
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    const filePath = process.env['GITHUB_PATH'] || '';
    if (filePath) {
        file_command_1.issueCommand('PATH', inputPath);
    }
    else {
        command_1.issueCommand('add-path', {}, inputPath);
    }
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.
 * Unless trimWhitespace is set to false in InputOptions, the value is also trimmed.
 * Returns an empty string if the value is not defined.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    if (options && options.trimWhitespace === false) {
        return val;
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Gets the values of an multiline input.  Each value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string[]
 *
 */
function getMultilineInput(name, options) {
    const inputs = getInput(name, options)
        .split('\n')
        .filter(x => x !== '');
    return inputs;
}
exports.getMultilineInput = getMultilineInput;
/**
 * Gets the input value of the boolean type in the YAML 1.2 "core schema" specification.
 * Support boolean input list: `true | True | TRUE | false | False | FALSE` .
 * The return value is also in boolean type.
 * ref: https://yaml.org/spec/1.2/spec.html#id2804923
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   boolean
 */
function getBooleanInput(name, options) {
    const trueValue = ['true', 'True', 'TRUE'];
    const falseValue = ['false', 'False', 'FALSE'];
    const val = getInput(name, options);
    if (trueValue.includes(val))
        return true;
    if (falseValue.includes(val))
        return false;
    throw new TypeError(`Input does not meet YAML 1.2 "Core Schema" specification: ${name}\n` +
        `Support boolean input list: \`true | True | TRUE | false | False | FALSE\``);
}
exports.getBooleanInput = getBooleanInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setOutput(name, value) {
    process.stdout.write(os.EOL);
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
/**
 * Enables or disables the echoing of commands into stdout for the rest of the step.
 * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
 *
 */
function setCommandEcho(enabled) {
    command_1.issue('echo', enabled ? 'on' : 'off');
}
exports.setCommandEcho = setCommandEcho;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Gets whether Actions Step Debug is on or not
 */
function isDebug() {
    return process.env['RUNNER_DEBUG'] === '1';
}
exports.isDebug = isDebug;
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message. Errors will be converted to string via toString()
 * @param properties optional properties to add to the annotation.
 */
function error(message, properties = {}) {
    command_1.issueCommand('error', utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
}
exports.error = error;
/**
 * Adds a warning issue
 * @param message warning issue message. Errors will be converted to string via toString()
 * @param properties optional properties to add to the annotation.
 */
function warning(message, properties = {}) {
    command_1.issueCommand('warning', utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
}
exports.warning = warning;
/**
 * Adds a notice issue
 * @param message notice issue message. Errors will be converted to string via toString()
 * @param properties optional properties to add to the annotation.
 */
function notice(message, properties = {}) {
    command_1.issueCommand('notice', utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
}
exports.notice = notice;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveState(name, value) {
    command_1.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
function getIDToken(aud) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield oidc_utils_1.OidcClient.getIDToken(aud);
    });
}
exports.getIDToken = getIDToken;
/**
 * Summary exports
 */
var summary_1 = __nccwpck_require__(1327);
Object.defineProperty(exports, "summary", ({ enumerable: true, get: function () { return summary_1.summary; } }));
/**
 * @deprecated use core.summary
 */
var summary_2 = __nccwpck_require__(1327);
Object.defineProperty(exports, "markdownSummary", ({ enumerable: true, get: function () { return summary_2.markdownSummary; } }));
/**
 * Path exports
 */
var path_utils_1 = __nccwpck_require__(2981);
Object.defineProperty(exports, "toPosixPath", ({ enumerable: true, get: function () { return path_utils_1.toPosixPath; } }));
Object.defineProperty(exports, "toWin32Path", ({ enumerable: true, get: function () { return path_utils_1.toWin32Path; } }));
Object.defineProperty(exports, "toPlatformPath", ({ enumerable: true, get: function () { return path_utils_1.toPlatformPath; } }));
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 717:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

// For internal use, subject to change.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.issueCommand = void 0;
// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
const fs = __importStar(__nccwpck_require__(7147));
const os = __importStar(__nccwpck_require__(2037));
const utils_1 = __nccwpck_require__(5278);
function issueCommand(command, message) {
    const filePath = process.env[`GITHUB_${command}`];
    if (!filePath) {
        throw new Error(`Unable to find environment variable for file command ${command}`);
    }
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing file at path: ${filePath}`);
    }
    fs.appendFileSync(filePath, `${utils_1.toCommandValue(message)}${os.EOL}`, {
        encoding: 'utf8'
    });
}
exports.issueCommand = issueCommand;
//# sourceMappingURL=file-command.js.map

/***/ }),

/***/ 8041:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OidcClient = void 0;
const http_client_1 = __nccwpck_require__(6255);
const auth_1 = __nccwpck_require__(5526);
const core_1 = __nccwpck_require__(2186);
class OidcClient {
    static createHttpClient(allowRetry = true, maxRetry = 10) {
        const requestOptions = {
            allowRetries: allowRetry,
            maxRetries: maxRetry
        };
        return new http_client_1.HttpClient('actions/oidc-client', [new auth_1.BearerCredentialHandler(OidcClient.getRequestToken())], requestOptions);
    }
    static getRequestToken() {
        const token = process.env['ACTIONS_ID_TOKEN_REQUEST_TOKEN'];
        if (!token) {
            throw new Error('Unable to get ACTIONS_ID_TOKEN_REQUEST_TOKEN env variable');
        }
        return token;
    }
    static getIDTokenUrl() {
        const runtimeUrl = process.env['ACTIONS_ID_TOKEN_REQUEST_URL'];
        if (!runtimeUrl) {
            throw new Error('Unable to get ACTIONS_ID_TOKEN_REQUEST_URL env variable');
        }
        return runtimeUrl;
    }
    static getCall(id_token_url) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const httpclient = OidcClient.createHttpClient();
            const res = yield httpclient
                .getJson(id_token_url)
                .catch(error => {
                throw new Error(`Failed to get ID Token. \n 
        Error Code : ${error.statusCode}\n 
        Error Message: ${error.result.message}`);
            });
            const id_token = (_a = res.result) === null || _a === void 0 ? void 0 : _a.value;
            if (!id_token) {
                throw new Error('Response json body do not have ID Token field');
            }
            return id_token;
        });
    }
    static getIDToken(audience) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // New ID Token is requested from action service
                let id_token_url = OidcClient.getIDTokenUrl();
                if (audience) {
                    const encodedAudience = encodeURIComponent(audience);
                    id_token_url = `${id_token_url}&audience=${encodedAudience}`;
                }
                core_1.debug(`ID token url is ${id_token_url}`);
                const id_token = yield OidcClient.getCall(id_token_url);
                core_1.setSecret(id_token);
                return id_token;
            }
            catch (error) {
                throw new Error(`Error message: ${error.message}`);
            }
        });
    }
}
exports.OidcClient = OidcClient;
//# sourceMappingURL=oidc-utils.js.map

/***/ }),

/***/ 2981:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.toPlatformPath = exports.toWin32Path = exports.toPosixPath = void 0;
const path = __importStar(__nccwpck_require__(1017));
/**
 * toPosixPath converts the given path to the posix form. On Windows, \\ will be
 * replaced with /.
 *
 * @param pth. Path to transform.
 * @return string Posix path.
 */
function toPosixPath(pth) {
    return pth.replace(/[\\]/g, '/');
}
exports.toPosixPath = toPosixPath;
/**
 * toWin32Path converts the given path to the win32 form. On Linux, / will be
 * replaced with \\.
 *
 * @param pth. Path to transform.
 * @return string Win32 path.
 */
function toWin32Path(pth) {
    return pth.replace(/[/]/g, '\\');
}
exports.toWin32Path = toWin32Path;
/**
 * toPlatformPath converts the given path to a platform-specific path. It does
 * this by replacing instances of / and \ with the platform-specific path
 * separator.
 *
 * @param pth The path to platformize.
 * @return string The platform-specific path.
 */
function toPlatformPath(pth) {
    return pth.replace(/[/\\]/g, path.sep);
}
exports.toPlatformPath = toPlatformPath;
//# sourceMappingURL=path-utils.js.map

/***/ }),

/***/ 1327:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.summary = exports.markdownSummary = exports.SUMMARY_DOCS_URL = exports.SUMMARY_ENV_VAR = void 0;
const os_1 = __nccwpck_require__(2037);
const fs_1 = __nccwpck_require__(7147);
const { access, appendFile, writeFile } = fs_1.promises;
exports.SUMMARY_ENV_VAR = 'GITHUB_STEP_SUMMARY';
exports.SUMMARY_DOCS_URL = 'https://docs.github.com/actions/using-workflows/workflow-commands-for-github-actions#adding-a-job-summary';
class Summary {
    constructor() {
        this._buffer = '';
    }
    /**
     * Finds the summary file path from the environment, rejects if env var is not found or file does not exist
     * Also checks r/w permissions.
     *
     * @returns step summary file path
     */
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
            }
            catch (_a) {
                throw new Error(`Unable to access summary file: '${pathFromEnv}'. Check if the file has correct read/write permissions.`);
            }
            this._filePath = pathFromEnv;
            return this._filePath;
        });
    }
    /**
     * Wraps content in an HTML tag, adding any HTML attributes
     *
     * @param {string} tag HTML tag to wrap
     * @param {string | null} content content within the tag
     * @param {[attribute: string]: string} attrs key-value list of HTML attributes to add
     *
     * @returns {string} content wrapped in HTML element
     */
    wrap(tag, content, attrs = {}) {
        const htmlAttrs = Object.entries(attrs)
            .map(([key, value]) => ` ${key}="${value}"`)
            .join('');
        if (!content) {
            return `<${tag}${htmlAttrs}>`;
        }
        return `<${tag}${htmlAttrs}>${content}</${tag}>`;
    }
    /**
     * Writes text in the buffer to the summary buffer file and empties buffer. Will append by default.
     *
     * @param {SummaryWriteOptions} [options] (optional) options for write operation
     *
     * @returns {Promise<Summary>} summary instance
     */
    write(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const overwrite = !!(options === null || options === void 0 ? void 0 : options.overwrite);
            const filePath = yield this.filePath();
            const writeFunc = overwrite ? writeFile : appendFile;
            yield writeFunc(filePath, this._buffer, { encoding: 'utf8' });
            return this.emptyBuffer();
        });
    }
    /**
     * Clears the summary buffer and wipes the summary file
     *
     * @returns {Summary} summary instance
     */
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.emptyBuffer().write({ overwrite: true });
        });
    }
    /**
     * Returns the current summary buffer as a string
     *
     * @returns {string} string of summary buffer
     */
    stringify() {
        return this._buffer;
    }
    /**
     * If the summary buffer is empty
     *
     * @returns {boolen} true if the buffer is empty
     */
    isEmptyBuffer() {
        return this._buffer.length === 0;
    }
    /**
     * Resets the summary buffer without writing to summary file
     *
     * @returns {Summary} summary instance
     */
    emptyBuffer() {
        this._buffer = '';
        return this;
    }
    /**
     * Adds raw text to the summary buffer
     *
     * @param {string} text content to add
     * @param {boolean} [addEOL=false] (optional) append an EOL to the raw text (default: false)
     *
     * @returns {Summary} summary instance
     */
    addRaw(text, addEOL = false) {
        this._buffer += text;
        return addEOL ? this.addEOL() : this;
    }
    /**
     * Adds the operating system-specific end-of-line marker to the buffer
     *
     * @returns {Summary} summary instance
     */
    addEOL() {
        return this.addRaw(os_1.EOL);
    }
    /**
     * Adds an HTML codeblock to the summary buffer
     *
     * @param {string} code content to render within fenced code block
     * @param {string} lang (optional) language to syntax highlight code
     *
     * @returns {Summary} summary instance
     */
    addCodeBlock(code, lang) {
        const attrs = Object.assign({}, (lang && { lang }));
        const element = this.wrap('pre', this.wrap('code', code), attrs);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML list to the summary buffer
     *
     * @param {string[]} items list of items to render
     * @param {boolean} [ordered=false] (optional) if the rendered list should be ordered or not (default: false)
     *
     * @returns {Summary} summary instance
     */
    addList(items, ordered = false) {
        const tag = ordered ? 'ol' : 'ul';
        const listItems = items.map(item => this.wrap('li', item)).join('');
        const element = this.wrap(tag, listItems);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML table to the summary buffer
     *
     * @param {SummaryTableCell[]} rows table rows
     *
     * @returns {Summary} summary instance
     */
    addTable(rows) {
        const tableBody = rows
            .map(row => {
            const cells = row
                .map(cell => {
                if (typeof cell === 'string') {
                    return this.wrap('td', cell);
                }
                const { header, data, colspan, rowspan } = cell;
                const tag = header ? 'th' : 'td';
                const attrs = Object.assign(Object.assign({}, (colspan && { colspan })), (rowspan && { rowspan }));
                return this.wrap(tag, data, attrs);
            })
                .join('');
            return this.wrap('tr', cells);
        })
            .join('');
        const element = this.wrap('table', tableBody);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds a collapsable HTML details element to the summary buffer
     *
     * @param {string} label text for the closed state
     * @param {string} content collapsable content
     *
     * @returns {Summary} summary instance
     */
    addDetails(label, content) {
        const element = this.wrap('details', this.wrap('summary', label) + content);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML image tag to the summary buffer
     *
     * @param {string} src path to the image you to embed
     * @param {string} alt text description of the image
     * @param {SummaryImageOptions} options (optional) addition image attributes
     *
     * @returns {Summary} summary instance
     */
    addImage(src, alt, options) {
        const { width, height } = options || {};
        const attrs = Object.assign(Object.assign({}, (width && { width })), (height && { height }));
        const element = this.wrap('img', null, Object.assign({ src, alt }, attrs));
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML section heading element
     *
     * @param {string} text heading text
     * @param {number | string} [level=1] (optional) the heading level, default: 1
     *
     * @returns {Summary} summary instance
     */
    addHeading(text, level) {
        const tag = `h${level}`;
        const allowedTag = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)
            ? tag
            : 'h1';
        const element = this.wrap(allowedTag, text);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML thematic break (<hr>) to the summary buffer
     *
     * @returns {Summary} summary instance
     */
    addSeparator() {
        const element = this.wrap('hr', null);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML line break (<br>) to the summary buffer
     *
     * @returns {Summary} summary instance
     */
    addBreak() {
        const element = this.wrap('br', null);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML blockquote to the summary buffer
     *
     * @param {string} text quote text
     * @param {string} cite (optional) citation url
     *
     * @returns {Summary} summary instance
     */
    addQuote(text, cite) {
        const attrs = Object.assign({}, (cite && { cite }));
        const element = this.wrap('blockquote', text, attrs);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML anchor tag to the summary buffer
     *
     * @param {string} text link text/content
     * @param {string} href hyperlink
     *
     * @returns {Summary} summary instance
     */
    addLink(text, href) {
        const element = this.wrap('a', text, { href });
        return this.addRaw(element).addEOL();
    }
}
const _summary = new Summary();
/**
 * @deprecated use `core.summary`
 */
exports.markdownSummary = _summary;
exports.summary = _summary;
//# sourceMappingURL=summary.js.map

/***/ }),

/***/ 5278:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.toCommandProperties = exports.toCommandValue = void 0;
/**
 * Sanitizes an input into a string so it can be passed into issueCommand safely
 * @param input input to sanitize into a string
 */
function toCommandValue(input) {
    if (input === null || input === undefined) {
        return '';
    }
    else if (typeof input === 'string' || input instanceof String) {
        return input;
    }
    return JSON.stringify(input);
}
exports.toCommandValue = toCommandValue;
/**
 *
 * @param annotationProperties
 * @returns The command properties to send with the actual annotation command
 * See IssueCommandProperties: https://github.com/actions/runner/blob/main/src/Runner.Worker/ActionCommandManager.cs#L646
 */
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
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 5526:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PersonalAccessTokenCredentialHandler = exports.BearerCredentialHandler = exports.BasicCredentialHandler = void 0;
class BasicCredentialHandler {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }
    prepareRequest(options) {
        if (!options.headers) {
            throw Error('The request has no headers');
        }
        options.headers['Authorization'] = `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`;
    }
    // This handler cannot handle 401
    canHandleAuthentication() {
        return false;
    }
    handleAuthentication() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('not implemented');
        });
    }
}
exports.BasicCredentialHandler = BasicCredentialHandler;
class BearerCredentialHandler {
    constructor(token) {
        this.token = token;
    }
    // currently implements pre-authorization
    // TODO: support preAuth = false where it hooks on 401
    prepareRequest(options) {
        if (!options.headers) {
            throw Error('The request has no headers');
        }
        options.headers['Authorization'] = `Bearer ${this.token}`;
    }
    // This handler cannot handle 401
    canHandleAuthentication() {
        return false;
    }
    handleAuthentication() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('not implemented');
        });
    }
}
exports.BearerCredentialHandler = BearerCredentialHandler;
class PersonalAccessTokenCredentialHandler {
    constructor(token) {
        this.token = token;
    }
    // currently implements pre-authorization
    // TODO: support preAuth = false where it hooks on 401
    prepareRequest(options) {
        if (!options.headers) {
            throw Error('The request has no headers');
        }
        options.headers['Authorization'] = `Basic ${Buffer.from(`PAT:${this.token}`).toString('base64')}`;
    }
    // This handler cannot handle 401
    canHandleAuthentication() {
        return false;
    }
    handleAuthentication() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('not implemented');
        });
    }
}
exports.PersonalAccessTokenCredentialHandler = PersonalAccessTokenCredentialHandler;
//# sourceMappingURL=auth.js.map

/***/ }),

/***/ 6255:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

/* eslint-disable @typescript-eslint/no-explicit-any */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HttpClient = exports.isHttps = exports.HttpClientResponse = exports.HttpClientError = exports.getProxyUrl = exports.MediaTypes = exports.Headers = exports.HttpCodes = void 0;
const http = __importStar(__nccwpck_require__(3685));
const https = __importStar(__nccwpck_require__(5687));
const pm = __importStar(__nccwpck_require__(9835));
const tunnel = __importStar(__nccwpck_require__(4294));
var HttpCodes;
(function (HttpCodes) {
    HttpCodes[HttpCodes["OK"] = 200] = "OK";
    HttpCodes[HttpCodes["MultipleChoices"] = 300] = "MultipleChoices";
    HttpCodes[HttpCodes["MovedPermanently"] = 301] = "MovedPermanently";
    HttpCodes[HttpCodes["ResourceMoved"] = 302] = "ResourceMoved";
    HttpCodes[HttpCodes["SeeOther"] = 303] = "SeeOther";
    HttpCodes[HttpCodes["NotModified"] = 304] = "NotModified";
    HttpCodes[HttpCodes["UseProxy"] = 305] = "UseProxy";
    HttpCodes[HttpCodes["SwitchProxy"] = 306] = "SwitchProxy";
    HttpCodes[HttpCodes["TemporaryRedirect"] = 307] = "TemporaryRedirect";
    HttpCodes[HttpCodes["PermanentRedirect"] = 308] = "PermanentRedirect";
    HttpCodes[HttpCodes["BadRequest"] = 400] = "BadRequest";
    HttpCodes[HttpCodes["Unauthorized"] = 401] = "Unauthorized";
    HttpCodes[HttpCodes["PaymentRequired"] = 402] = "PaymentRequired";
    HttpCodes[HttpCodes["Forbidden"] = 403] = "Forbidden";
    HttpCodes[HttpCodes["NotFound"] = 404] = "NotFound";
    HttpCodes[HttpCodes["MethodNotAllowed"] = 405] = "MethodNotAllowed";
    HttpCodes[HttpCodes["NotAcceptable"] = 406] = "NotAcceptable";
    HttpCodes[HttpCodes["ProxyAuthenticationRequired"] = 407] = "ProxyAuthenticationRequired";
    HttpCodes[HttpCodes["RequestTimeout"] = 408] = "RequestTimeout";
    HttpCodes[HttpCodes["Conflict"] = 409] = "Conflict";
    HttpCodes[HttpCodes["Gone"] = 410] = "Gone";
    HttpCodes[HttpCodes["TooManyRequests"] = 429] = "TooManyRequests";
    HttpCodes[HttpCodes["InternalServerError"] = 500] = "InternalServerError";
    HttpCodes[HttpCodes["NotImplemented"] = 501] = "NotImplemented";
    HttpCodes[HttpCodes["BadGateway"] = 502] = "BadGateway";
    HttpCodes[HttpCodes["ServiceUnavailable"] = 503] = "ServiceUnavailable";
    HttpCodes[HttpCodes["GatewayTimeout"] = 504] = "GatewayTimeout";
})(HttpCodes = exports.HttpCodes || (exports.HttpCodes = {}));
var Headers;
(function (Headers) {
    Headers["Accept"] = "accept";
    Headers["ContentType"] = "content-type";
})(Headers = exports.Headers || (exports.Headers = {}));
var MediaTypes;
(function (MediaTypes) {
    MediaTypes["ApplicationJson"] = "application/json";
})(MediaTypes = exports.MediaTypes || (exports.MediaTypes = {}));
/**
 * Returns the proxy URL, depending upon the supplied url and proxy environment variables.
 * @param serverUrl  The server URL where the request will be sent. For example, https://api.github.com
 */
function getProxyUrl(serverUrl) {
    const proxyUrl = pm.getProxyUrl(new URL(serverUrl));
    return proxyUrl ? proxyUrl.href : '';
}
exports.getProxyUrl = getProxyUrl;
const HttpRedirectCodes = [
    HttpCodes.MovedPermanently,
    HttpCodes.ResourceMoved,
    HttpCodes.SeeOther,
    HttpCodes.TemporaryRedirect,
    HttpCodes.PermanentRedirect
];
const HttpResponseRetryCodes = [
    HttpCodes.BadGateway,
    HttpCodes.ServiceUnavailable,
    HttpCodes.GatewayTimeout
];
const RetryableHttpVerbs = ['OPTIONS', 'GET', 'DELETE', 'HEAD'];
const ExponentialBackoffCeiling = 10;
const ExponentialBackoffTimeSlice = 5;
class HttpClientError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = 'HttpClientError';
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, HttpClientError.prototype);
    }
}
exports.HttpClientError = HttpClientError;
class HttpClientResponse {
    constructor(message) {
        this.message = message;
    }
    readBody() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                let output = Buffer.alloc(0);
                this.message.on('data', (chunk) => {
                    output = Buffer.concat([output, chunk]);
                });
                this.message.on('end', () => {
                    resolve(output.toString());
                });
            }));
        });
    }
}
exports.HttpClientResponse = HttpClientResponse;
function isHttps(requestUrl) {
    const parsedUrl = new URL(requestUrl);
    return parsedUrl.protocol === 'https:';
}
exports.isHttps = isHttps;
class HttpClient {
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
            return this.request('OPTIONS', requestUrl, null, additionalHeaders || {});
        });
    }
    get(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('GET', requestUrl, null, additionalHeaders || {});
        });
    }
    del(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('DELETE', requestUrl, null, additionalHeaders || {});
        });
    }
    post(requestUrl, data, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('POST', requestUrl, data, additionalHeaders || {});
        });
    }
    patch(requestUrl, data, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('PATCH', requestUrl, data, additionalHeaders || {});
        });
    }
    put(requestUrl, data, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('PUT', requestUrl, data, additionalHeaders || {});
        });
    }
    head(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('HEAD', requestUrl, null, additionalHeaders || {});
        });
    }
    sendStream(verb, requestUrl, stream, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request(verb, requestUrl, stream, additionalHeaders);
        });
    }
    /**
     * Gets a typed object from an endpoint
     * Be aware that not found returns a null.  Other errors (4xx, 5xx) reject the promise
     */
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
    /**
     * Makes a raw http request.
     * All other methods such as get, post, patch, and request ultimately call this.
     * Prefer get, del, post and patch
     */
    request(verb, requestUrl, data, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._disposed) {
                throw new Error('Client has already been disposed.');
            }
            const parsedUrl = new URL(requestUrl);
            let info = this._prepareRequest(verb, parsedUrl, headers);
            // Only perform retries on reads since writes may not be idempotent.
            const maxTries = this._allowRetries && RetryableHttpVerbs.includes(verb)
                ? this._maxRetries + 1
                : 1;
            let numTries = 0;
            let response;
            do {
                response = yield this.requestRaw(info, data);
                // Check if it's an authentication challenge
                if (response &&
                    response.message &&
                    response.message.statusCode === HttpCodes.Unauthorized) {
                    let authenticationHandler;
                    for (const handler of this.handlers) {
                        if (handler.canHandleAuthentication(response)) {
                            authenticationHandler = handler;
                            break;
                        }
                    }
                    if (authenticationHandler) {
                        return authenticationHandler.handleAuthentication(this, info, data);
                    }
                    else {
                        // We have received an unauthorized response but have no handlers to handle it.
                        // Let the response return to the caller.
                        return response;
                    }
                }
                let redirectsRemaining = this._maxRedirects;
                while (response.message.statusCode &&
                    HttpRedirectCodes.includes(response.message.statusCode) &&
                    this._allowRedirects &&
                    redirectsRemaining > 0) {
                    const redirectUrl = response.message.headers['location'];
                    if (!redirectUrl) {
                        // if there's no location to redirect to, we won't
                        break;
                    }
                    const parsedRedirectUrl = new URL(redirectUrl);
                    if (parsedUrl.protocol === 'https:' &&
                        parsedUrl.protocol !== parsedRedirectUrl.protocol &&
                        !this._allowRedirectDowngrade) {
                        throw new Error('Redirect from HTTPS to HTTP protocol. This downgrade is not allowed for security reasons. If you want to allow this behavior, set the allowRedirectDowngrade option to true.');
                    }
                    // we need to finish reading the response before reassigning response
                    // which will leak the open socket.
                    yield response.readBody();
                    // strip authorization header if redirected to a different hostname
                    if (parsedRedirectUrl.hostname !== parsedUrl.hostname) {
                        for (const header in headers) {
                            // header names are case insensitive
                            if (header.toLowerCase() === 'authorization') {
                                delete headers[header];
                            }
                        }
                    }
                    // let's make the request with the new redirectUrl
                    info = this._prepareRequest(verb, parsedRedirectUrl, headers);
                    response = yield this.requestRaw(info, data);
                    redirectsRemaining--;
                }
                if (!response.message.statusCode ||
                    !HttpResponseRetryCodes.includes(response.message.statusCode)) {
                    // If not a retry code, return immediately instead of retrying
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
    /**
     * Needs to be called if keepAlive is set to true in request options.
     */
    dispose() {
        if (this._agent) {
            this._agent.destroy();
        }
        this._disposed = true;
    }
    /**
     * Raw request.
     * @param info
     * @param data
     */
    requestRaw(info, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                function callbackForResult(err, res) {
                    if (err) {
                        reject(err);
                    }
                    else if (!res) {
                        // If `err` is not passed, then `res` must be passed.
                        reject(new Error('Unknown error'));
                    }
                    else {
                        resolve(res);
                    }
                }
                this.requestRawWithCallback(info, data, callbackForResult);
            });
        });
    }
    /**
     * Raw request with callback.
     * @param info
     * @param data
     * @param onResult
     */
    requestRawWithCallback(info, data, onResult) {
        if (typeof data === 'string') {
            if (!info.options.headers) {
                info.options.headers = {};
            }
            info.options.headers['Content-Length'] = Buffer.byteLength(data, 'utf8');
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
            handleResult(undefined, res);
        });
        let socket;
        req.on('socket', sock => {
            socket = sock;
        });
        // If we ever get disconnected, we want the socket to timeout eventually
        req.setTimeout(this._socketTimeout || 3 * 60000, () => {
            if (socket) {
                socket.end();
            }
            handleResult(new Error(`Request timeout: ${info.options.path}`));
        });
        req.on('error', function (err) {
            // err has statusCode property
            // res should have headers
            handleResult(err);
        });
        if (data && typeof data === 'string') {
            req.write(data, 'utf8');
        }
        if (data && typeof data !== 'string') {
            data.on('close', function () {
                req.end();
            });
            data.pipe(req);
        }
        else {
            req.end();
        }
    }
    /**
     * Gets an http agent. This function is useful when you need an http agent that handles
     * routing through a proxy server - depending upon the url and proxy environment variables.
     * @param serverUrl  The server URL where the request will be sent. For example, https://api.github.com
     */
    getAgent(serverUrl) {
        const parsedUrl = new URL(serverUrl);
        return this._getAgent(parsedUrl);
    }
    _prepareRequest(method, requestUrl, headers) {
        const info = {};
        info.parsedUrl = requestUrl;
        const usingSsl = info.parsedUrl.protocol === 'https:';
        info.httpModule = usingSsl ? https : http;
        const defaultPort = usingSsl ? 443 : 80;
        info.options = {};
        info.options.host = info.parsedUrl.hostname;
        info.options.port = info.parsedUrl.port
            ? parseInt(info.parsedUrl.port)
            : defaultPort;
        info.options.path =
            (info.parsedUrl.pathname || '') + (info.parsedUrl.search || '');
        info.options.method = method;
        info.options.headers = this._mergeHeaders(headers);
        if (this.userAgent != null) {
            info.options.headers['user-agent'] = this.userAgent;
        }
        info.options.agent = this._getAgent(info.parsedUrl);
        // gives handlers an opportunity to participate
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
        // if agent is already assigned use that agent.
        if (agent) {
            return agent;
        }
        const usingSsl = parsedUrl.protocol === 'https:';
        let maxSockets = 100;
        if (this.requestOptions) {
            maxSockets = this.requestOptions.maxSockets || http.globalAgent.maxSockets;
        }
        // This is `useProxy` again, but we need to check `proxyURl` directly for TypeScripts's flow analysis.
        if (proxyUrl && proxyUrl.hostname) {
            const agentOptions = {
                maxSockets,
                keepAlive: this._keepAlive,
                proxy: Object.assign(Object.assign({}, ((proxyUrl.username || proxyUrl.password) && {
                    proxyAuth: `${proxyUrl.username}:${proxyUrl.password}`
                })), { host: proxyUrl.hostname, port: proxyUrl.port })
            };
            let tunnelAgent;
            const overHttps = proxyUrl.protocol === 'https:';
            if (usingSsl) {
                tunnelAgent = overHttps ? tunnel.httpsOverHttps : tunnel.httpsOverHttp;
            }
            else {
                tunnelAgent = overHttps ? tunnel.httpOverHttps : tunnel.httpOverHttp;
            }
            agent = tunnelAgent(agentOptions);
            this._proxyAgent = agent;
        }
        // if reusing agent across request and tunneling agent isn't assigned create a new agent
        if (this._keepAlive && !agent) {
            const options = { keepAlive: this._keepAlive, maxSockets };
            agent = usingSsl ? new https.Agent(options) : new http.Agent(options);
            this._agent = agent;
        }
        // if not using private agent and tunnel agent isn't setup then use global agent
        if (!agent) {
            agent = usingSsl ? https.globalAgent : http.globalAgent;
        }
        if (usingSsl && this._ignoreSslError) {
            // we don't want to set NODE_TLS_REJECT_UNAUTHORIZED=0 since that will affect request for entire process
            // http.RequestOptions doesn't expose a way to modify RequestOptions.agent.options
            // we have to cast it to any and change it directly
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
            return new Promise(resolve => setTimeout(() => resolve(), ms));
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
                // not found leads to null obj returned
                if (statusCode === HttpCodes.NotFound) {
                    resolve(response);
                }
                // get the result from the body
                function dateTimeDeserializer(key, value) {
                    if (typeof value === 'string') {
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
                        }
                        else {
                            obj = JSON.parse(contents);
                        }
                        response.result = obj;
                    }
                    response.headers = res.message.headers;
                }
                catch (err) {
                    // Invalid resource (contents not json);  leaving result obj null
                }
                // note that 3xx redirects are handled by the http layer.
                if (statusCode > 299) {
                    let msg;
                    // if exception/error in body, attempt to get better error
                    if (obj && obj.message) {
                        msg = obj.message;
                    }
                    else if (contents && contents.length > 0) {
                        // it may be the case that the exception is in the body message as string
                        msg = contents;
                    }
                    else {
                        msg = `Failed request: (${statusCode})`;
                    }
                    const err = new HttpClientError(msg, statusCode);
                    err.result = response.result;
                    reject(err);
                }
                else {
                    resolve(response);
                }
            }));
        });
    }
}
exports.HttpClient = HttpClient;
const lowercaseKeys = (obj) => Object.keys(obj).reduce((c, k) => ((c[k.toLowerCase()] = obj[k]), c), {});
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 9835:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.checkBypass = exports.getProxyUrl = void 0;
function getProxyUrl(reqUrl) {
    const usingSsl = reqUrl.protocol === 'https:';
    if (checkBypass(reqUrl)) {
        return undefined;
    }
    const proxyVar = (() => {
        if (usingSsl) {
            return process.env['https_proxy'] || process.env['HTTPS_PROXY'];
        }
        else {
            return process.env['http_proxy'] || process.env['HTTP_PROXY'];
        }
    })();
    if (proxyVar) {
        return new URL(proxyVar);
    }
    else {
        return undefined;
    }
}
exports.getProxyUrl = getProxyUrl;
function checkBypass(reqUrl) {
    if (!reqUrl.hostname) {
        return false;
    }
    const noProxy = process.env['no_proxy'] || process.env['NO_PROXY'] || '';
    if (!noProxy) {
        return false;
    }
    // Determine the request port
    let reqPort;
    if (reqUrl.port) {
        reqPort = Number(reqUrl.port);
    }
    else if (reqUrl.protocol === 'http:') {
        reqPort = 80;
    }
    else if (reqUrl.protocol === 'https:') {
        reqPort = 443;
    }
    // Format the request hostname and hostname with port
    const upperReqHosts = [reqUrl.hostname.toUpperCase()];
    if (typeof reqPort === 'number') {
        upperReqHosts.push(`${upperReqHosts[0]}:${reqPort}`);
    }
    // Compare request host against noproxy
    for (const upperNoProxyItem of noProxy
        .split(',')
        .map(x => x.trim().toUpperCase())
        .filter(x => x)) {
        if (upperReqHosts.some(x => x === upperNoProxyItem)) {
            return true;
        }
    }
    return false;
}
exports.checkBypass = checkBypass;
//# sourceMappingURL=proxy.js.map

/***/ }),

/***/ 6007:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


var setHeader = __nccwpck_require__(4461)
  , parse = (__nccwpck_require__(7310).parse)
  , ms = __nccwpck_require__(8899)
  , vary = __nccwpck_require__(5931);

/**
 * Configure the CORS / Access Control headers.
 *
 * @param {Object} options Configuration
 * @returns {Function}
 * @api public
 */
function access(options) {
  options = options || {};

  // The allowed origins of the request.
  options.origins = 'origins' in options
    ? options.origins
    : '*';

  // The allowed methods for the request.
  options.methods = 'methods' in options
    ? options.methods
    : ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'OPTIONS'];

  // Allow sending of authorization and cookie information.
  options.credentials = 'credentials' in options
    ? options.credentials
    : true;

  // Cache duration of the preflight/OPTIONS request.
  options.maxAge = 'maxAge' in options
    ? options.maxAge
    : '30 days';

  // The allowed request headers.
  options.headers = 'headers' in options
    ? options.headers
    : '';

  // Server headers exposed to the user agent.
  options.exposed = 'exposed' in options
    ? options.exposed
    : '';

  //
  // Be a bit flexible in the way the arguments are supplied, transform Array's
  // in to strings and human readable numbers strings in to numbers.
  //
  ['methods', 'headers', 'exposed', 'origins'].forEach(function cleanup(key) {
    if (Array.isArray(options[key])) options[key] = options[key].join(', ');
  });

  //
  // The maxAge header value must be expressed in seconds so we need to convert
  // the milliseconds returned by the `millisecond` module in seconds.
  //
  if ('string' === typeof options.maxAge) {
    options.maxAge = ms(options.maxAge) / 1000;
  }

  var separator = /[, ]+/
    , methods = options.methods.toUpperCase().split(separator).filter(Boolean)
    , headers = options.headers.toLowerCase().split(separator).filter(Boolean)
    , origins = options.origins.toLowerCase().split(separator).filter(Boolean);

  /**
   * The actual function that handles the setting of the requests and answering
   * of the OPTIONS method.
   *
   * @param {Request} req The incoming HTTP request.
   * @param {Response} res The outgoing HTTP response.
   * @param {Function} next Optional callback for middleware support.
   * @returns {Boolean}
   * @api public
   */
  return function control(req, res, next) {
    var origin = (req.headers.origin || '').toLowerCase().trim()
      , credentials = options.credentials;

    //
    // The `origin` header WILL always be send for browsers that support CORS.
    // If it's in the request headers, we should not be sending the headers as
    // it would only be pointless overhead.
    //
    // @see https://developer.mozilla.org/en/docs/HTTP/Access_control_CORS#Origin
    //
    if (!('origin' in req.headers)) {
      if ('function' === typeof next) next();
      return false;
    }

    //
    // Validate the current request to ensure that proper headers are being sent
    // and that we don't answer with bullshit.
    //
    if (
         ~origin.indexOf('%')
      || (origin !== 'null' && !parse(origin).protocol)
      || options.origins !== '*' && !~origins.indexOf(origin)
      || (methods.length && !~methods.indexOf(req.method))
      // @TODO header validation
    ) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'text/plain');
      res.end([
        'Invalid HTTP Access Control (CORS) request:',
        '  Origin: '+ req.headers.origin,
        '  Method: '+ req.method
      ].join('\n'));

      return true;
    }

    //
    // GET requests are not preflighted for CORS but the browser WILL reject the
    // response if the request is made with the `withCredentials` flag enabled
    // and the `Access-Control-Allow-Origin` header is set to `*`. In addition to
    // this, if the server specifies an origin host rather than `*`, the it must
    // be either a SINGLE origin or the string `null`.
    //
    if (options.origins !== '*' || credentials) {
      setHeader(res, 'Access-Control-Allow-Origin', req.headers.origin);
      vary(res, 'Origin');
    } else {
      setHeader(res, 'Access-Control-Allow-Origin', '*');
    }

    if (credentials) {
      setHeader(res, 'Access-Control-Allow-Credentials', 'true');
    }

    //
    // The HTTP Access Control (CORS) uses the OPTIONS method for preflight
    // requests so it can get approval before doing the actual request. So it's
    // vital that these requests are handled first and as soon as possible. But
    // as OPTIONS requests can also be made for other types of requests, we need
    // to explicitly check if the `Access-Control-Request-Method` header has been
    // sent to ensure that this is a preflight request.
    //
    if (
         'OPTIONS' === req.method
      && req.headers['access-control-request-method']
    ) {
      if (options.maxAge) {
        setHeader(res, 'Access-Control-Max-Age', options.maxAge);
      }

      if (options.methods) {
        setHeader(res, 'Access-Control-Allow-Methods', methods.join(', '));
      }

      if (options.headers) {
        setHeader(res, 'Access-Control-Allow-Headers', options.headers);
      } else if (req.headers['access-control-request-headers']) {
        setHeader(res, 'Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
      }

      //
      // OPTION methods SHOULD be answered with a 200 status code so we're
      // correctly following the RFC 2616
      //
      // @see http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html
      //
      res.statusCode = 200;
      res.setHeader('Content-Length', 0);
      res.end('');

      return true;
    }

    if (options.exposed) {
      setHeader(res, 'Access-Control-Expose-Headers', options.exposed);
    }

    if ('function' === typeof next) next();
    return false;
  };
}

//
// Expose the module.
//
module.exports = access;


/***/ }),

/***/ 7667:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


var prefix = (__nccwpck_require__(1848).prefixed)
  , toString = Object.prototype.toString
  , slice = Array.prototype.slice;

/**
 * Get an accurate type description of whatever we receive.
 *
 * @param {Mixed} what What ever we receive
 * @returns {String} Description of what ever it is.
 * @api private
 */
function type(what) {
  return toString.call(what).slice(8, -1).toLowerCase();
}

/**
 * Asynchronously emit an event.
 *
 * @param {String} event Name of the event that should be emitted.
 * @param {Arguments} .. Arguments for the emit function.
 * @param {Function} fn Completion callback for when all is emitted.
 * @returns {Self}
 * @api public
 */
module.exports = function asyncemit() {
  var args = slice.call(arguments, 0)
    , event = args.shift()
    , async = args.length
    , fn = args.pop()
    , selfie = this
    , listeners;

  listeners = (this._events || {})[prefix ? prefix + event : event];

  if (!listeners) return fn(), this;
  if (type(listeners) !== 'array') listeners = [ listeners ];

  /**
   * Simple async helper utility.
   *
   * @param {Array} stack The listeners for the specified event.
   * @api private
   */
  (function each(stack) {
    if (!stack.length) return fn();

    var listener = stack.shift();

    if (listener.once) {
      selfie.removeListener(event, listener.fn);
    }

    if (listener.fn.length !== async) {
      listener.fn.apply(listener.context, args);
      return each(stack);
    }

    //
    // Async operation
    //
    listener.fn.apply(
      listener.context,
      args.concat(function done(err) {
        if (err) return fn(err);

        each(stack);
      })
    );
  })(listeners.slice());

  return this;
};


/***/ }),

/***/ 7391:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/* MIT license */
var cssKeywords = __nccwpck_require__(188);

// NOTE: conversions should only return primitive values (i.e. arrays, or
//       values that give correct `typeof` results).
//       do not use box values types (i.e. Number(), String(), etc.)

var reverseKeywords = {};
for (var key in cssKeywords) {
	if (cssKeywords.hasOwnProperty(key)) {
		reverseKeywords[cssKeywords[key]] = key;
	}
}

var convert = module.exports = {
	rgb: {channels: 3, labels: 'rgb'},
	hsl: {channels: 3, labels: 'hsl'},
	hsv: {channels: 3, labels: 'hsv'},
	hwb: {channels: 3, labels: 'hwb'},
	cmyk: {channels: 4, labels: 'cmyk'},
	xyz: {channels: 3, labels: 'xyz'},
	lab: {channels: 3, labels: 'lab'},
	lch: {channels: 3, labels: 'lch'},
	hex: {channels: 1, labels: ['hex']},
	keyword: {channels: 1, labels: ['keyword']},
	ansi16: {channels: 1, labels: ['ansi16']},
	ansi256: {channels: 1, labels: ['ansi256']},
	hcg: {channels: 3, labels: ['h', 'c', 'g']},
	apple: {channels: 3, labels: ['r16', 'g16', 'b16']},
	gray: {channels: 1, labels: ['gray']}
};

// hide .channels and .labels properties
for (var model in convert) {
	if (convert.hasOwnProperty(model)) {
		if (!('channels' in convert[model])) {
			throw new Error('missing channels property: ' + model);
		}

		if (!('labels' in convert[model])) {
			throw new Error('missing channel labels property: ' + model);
		}

		if (convert[model].labels.length !== convert[model].channels) {
			throw new Error('channel and label counts mismatch: ' + model);
		}

		var channels = convert[model].channels;
		var labels = convert[model].labels;
		delete convert[model].channels;
		delete convert[model].labels;
		Object.defineProperty(convert[model], 'channels', {value: channels});
		Object.defineProperty(convert[model], 'labels', {value: labels});
	}
}

convert.rgb.hsl = function (rgb) {
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

convert.rgb.hsv = function (rgb) {
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
	var diffc = function (c) {
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
			h = (1 / 3) + rdif - bdif;
		} else if (b === v) {
			h = (2 / 3) + gdif - rdif;
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

convert.rgb.hwb = function (rgb) {
	var r = rgb[0];
	var g = rgb[1];
	var b = rgb[2];
	var h = convert.rgb.hsl(rgb)[0];
	var w = 1 / 255 * Math.min(r, Math.min(g, b));

	b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));

	return [h, w * 100, b * 100];
};

convert.rgb.cmyk = function (rgb) {
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

/**
 * See https://en.m.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance
 * */
function comparativeDistance(x, y) {
	return (
		Math.pow(x[0] - y[0], 2) +
		Math.pow(x[1] - y[1], 2) +
		Math.pow(x[2] - y[2], 2)
	);
}

convert.rgb.keyword = function (rgb) {
	var reversed = reverseKeywords[rgb];
	if (reversed) {
		return reversed;
	}

	var currentClosestDistance = Infinity;
	var currentClosestKeyword;

	for (var keyword in cssKeywords) {
		if (cssKeywords.hasOwnProperty(keyword)) {
			var value = cssKeywords[keyword];

			// Compute comparative distance
			var distance = comparativeDistance(rgb, value);

			// Check if its less, if so set as closest
			if (distance < currentClosestDistance) {
				currentClosestDistance = distance;
				currentClosestKeyword = keyword;
			}
		}
	}

	return currentClosestKeyword;
};

convert.keyword.rgb = function (keyword) {
	return cssKeywords[keyword];
};

convert.rgb.xyz = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;

	// assume sRGB
	r = r > 0.04045 ? Math.pow(((r + 0.055) / 1.055), 2.4) : (r / 12.92);
	g = g > 0.04045 ? Math.pow(((g + 0.055) / 1.055), 2.4) : (g / 12.92);
	b = b > 0.04045 ? Math.pow(((b + 0.055) / 1.055), 2.4) : (b / 12.92);

	var x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
	var y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
	var z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

	return [x * 100, y * 100, z * 100];
};

convert.rgb.lab = function (rgb) {
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

	x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

	l = (116 * y) - 16;
	a = 500 * (x - y);
	b = 200 * (y - z);

	return [l, a, b];
};

convert.hsl.rgb = function (hsl) {
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

convert.hsl.hsv = function (hsl) {
	var h = hsl[0];
	var s = hsl[1] / 100;
	var l = hsl[2] / 100;
	var smin = s;
	var lmin = Math.max(l, 0.01);
	var sv;
	var v;

	l *= 2;
	s *= (l <= 1) ? l : 2 - l;
	smin *= lmin <= 1 ? lmin : 2 - lmin;
	v = (l + s) / 2;
	sv = l === 0 ? (2 * smin) / (lmin + smin) : (2 * s) / (l + s);

	return [h, sv * 100, v * 100];
};

convert.hsv.rgb = function (hsv) {
	var h = hsv[0] / 60;
	var s = hsv[1] / 100;
	var v = hsv[2] / 100;
	var hi = Math.floor(h) % 6;

	var f = h - Math.floor(h);
	var p = 255 * v * (1 - s);
	var q = 255 * v * (1 - (s * f));
	var t = 255 * v * (1 - (s * (1 - f)));
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

convert.hsv.hsl = function (hsv) {
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
	sl /= (lmin <= 1) ? lmin : 2 - lmin;
	sl = sl || 0;
	l /= 2;

	return [h, sl * 100, l * 100];
};

// http://dev.w3.org/csswg/css-color/#hwb-to-rgb
convert.hwb.rgb = function (hwb) {
	var h = hwb[0] / 360;
	var wh = hwb[1] / 100;
	var bl = hwb[2] / 100;
	var ratio = wh + bl;
	var i;
	var v;
	var f;
	var n;

	// wh + bl cant be > 1
	if (ratio > 1) {
		wh /= ratio;
		bl /= ratio;
	}

	i = Math.floor(6 * h);
	v = 1 - bl;
	f = 6 * h - i;

	if ((i & 0x01) !== 0) {
		f = 1 - f;
	}

	n = wh + f * (v - wh); // linear interpolation

	var r;
	var g;
	var b;
	switch (i) {
		default:
		case 6:
		case 0: r = v; g = n; b = wh; break;
		case 1: r = n; g = v; b = wh; break;
		case 2: r = wh; g = v; b = n; break;
		case 3: r = wh; g = n; b = v; break;
		case 4: r = n; g = wh; b = v; break;
		case 5: r = v; g = wh; b = n; break;
	}

	return [r * 255, g * 255, b * 255];
};

convert.cmyk.rgb = function (cmyk) {
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

convert.xyz.rgb = function (xyz) {
	var x = xyz[0] / 100;
	var y = xyz[1] / 100;
	var z = xyz[2] / 100;
	var r;
	var g;
	var b;

	r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
	g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
	b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

	// assume sRGB
	r = r > 0.0031308
		? ((1.055 * Math.pow(r, 1.0 / 2.4)) - 0.055)
		: r * 12.92;

	g = g > 0.0031308
		? ((1.055 * Math.pow(g, 1.0 / 2.4)) - 0.055)
		: g * 12.92;

	b = b > 0.0031308
		? ((1.055 * Math.pow(b, 1.0 / 2.4)) - 0.055)
		: b * 12.92;

	r = Math.min(Math.max(0, r), 1);
	g = Math.min(Math.max(0, g), 1);
	b = Math.min(Math.max(0, b), 1);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.lab = function (xyz) {
	var x = xyz[0];
	var y = xyz[1];
	var z = xyz[2];
	var l;
	var a;
	var b;

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

	l = (116 * y) - 16;
	a = 500 * (x - y);
	b = 200 * (y - z);

	return [l, a, b];
};

convert.lab.xyz = function (lab) {
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
	y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
	x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
	z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;

	x *= 95.047;
	y *= 100;
	z *= 108.883;

	return [x, y, z];
};

convert.lab.lch = function (lab) {
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

convert.lch.lab = function (lch) {
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

convert.rgb.ansi16 = function (args) {
	var r = args[0];
	var g = args[1];
	var b = args[2];
	var value = 1 in arguments ? arguments[1] : convert.rgb.hsv(args)[2]; // hsv -> ansi16 optimization

	value = Math.round(value / 50);

	if (value === 0) {
		return 30;
	}

	var ansi = 30
		+ ((Math.round(b / 255) << 2)
		| (Math.round(g / 255) << 1)
		| Math.round(r / 255));

	if (value === 2) {
		ansi += 60;
	}

	return ansi;
};

convert.hsv.ansi16 = function (args) {
	// optimization here; we already know the value and don't need to get
	// it converted for us.
	return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
};

convert.rgb.ansi256 = function (args) {
	var r = args[0];
	var g = args[1];
	var b = args[2];

	// we use the extended greyscale palette here, with the exception of
	// black and white. normal palette only has 4 greyscale shades.
	if (r === g && g === b) {
		if (r < 8) {
			return 16;
		}

		if (r > 248) {
			return 231;
		}

		return Math.round(((r - 8) / 247) * 24) + 232;
	}

	var ansi = 16
		+ (36 * Math.round(r / 255 * 5))
		+ (6 * Math.round(g / 255 * 5))
		+ Math.round(b / 255 * 5);

	return ansi;
};

convert.ansi16.rgb = function (args) {
	var color = args % 10;

	// handle greyscale
	if (color === 0 || color === 7) {
		if (args > 50) {
			color += 3.5;
		}

		color = color / 10.5 * 255;

		return [color, color, color];
	}

	var mult = (~~(args > 50) + 1) * 0.5;
	var r = ((color & 1) * mult) * 255;
	var g = (((color >> 1) & 1) * mult) * 255;
	var b = (((color >> 2) & 1) * mult) * 255;

	return [r, g, b];
};

convert.ansi256.rgb = function (args) {
	// handle greyscale
	if (args >= 232) {
		var c = (args - 232) * 10 + 8;
		return [c, c, c];
	}

	args -= 16;

	var rem;
	var r = Math.floor(args / 36) / 5 * 255;
	var g = Math.floor((rem = args % 36) / 6) / 5 * 255;
	var b = (rem % 6) / 5 * 255;

	return [r, g, b];
};

convert.rgb.hex = function (args) {
	var integer = ((Math.round(args[0]) & 0xFF) << 16)
		+ ((Math.round(args[1]) & 0xFF) << 8)
		+ (Math.round(args[2]) & 0xFF);

	var string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.hex.rgb = function (args) {
	var match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
	if (!match) {
		return [0, 0, 0];
	}

	var colorString = match[0];

	if (match[0].length === 3) {
		colorString = colorString.split('').map(function (char) {
			return char + char;
		}).join('');
	}

	var integer = parseInt(colorString, 16);
	var r = (integer >> 16) & 0xFF;
	var g = (integer >> 8) & 0xFF;
	var b = integer & 0xFF;

	return [r, g, b];
};

convert.rgb.hcg = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var max = Math.max(Math.max(r, g), b);
	var min = Math.min(Math.min(r, g), b);
	var chroma = (max - min);
	var grayscale;
	var hue;

	if (chroma < 1) {
		grayscale = min / (1 - chroma);
	} else {
		grayscale = 0;
	}

	if (chroma <= 0) {
		hue = 0;
	} else
	if (max === r) {
		hue = ((g - b) / chroma) % 6;
	} else
	if (max === g) {
		hue = 2 + (b - r) / chroma;
	} else {
		hue = 4 + (r - g) / chroma + 4;
	}

	hue /= 6;
	hue %= 1;

	return [hue * 360, chroma * 100, grayscale * 100];
};

convert.hsl.hcg = function (hsl) {
	var s = hsl[1] / 100;
	var l = hsl[2] / 100;
	var c = 1;
	var f = 0;

	if (l < 0.5) {
		c = 2.0 * s * l;
	} else {
		c = 2.0 * s * (1.0 - l);
	}

	if (c < 1.0) {
		f = (l - 0.5 * c) / (1.0 - c);
	}

	return [hsl[0], c * 100, f * 100];
};

convert.hsv.hcg = function (hsv) {
	var s = hsv[1] / 100;
	var v = hsv[2] / 100;

	var c = s * v;
	var f = 0;

	if (c < 1.0) {
		f = (v - c) / (1 - c);
	}

	return [hsv[0], c * 100, f * 100];
};

convert.hcg.rgb = function (hcg) {
	var h = hcg[0] / 360;
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;

	if (c === 0.0) {
		return [g * 255, g * 255, g * 255];
	}

	var pure = [0, 0, 0];
	var hi = (h % 1) * 6;
	var v = hi % 1;
	var w = 1 - v;
	var mg = 0;

	switch (Math.floor(hi)) {
		case 0:
			pure[0] = 1; pure[1] = v; pure[2] = 0; break;
		case 1:
			pure[0] = w; pure[1] = 1; pure[2] = 0; break;
		case 2:
			pure[0] = 0; pure[1] = 1; pure[2] = v; break;
		case 3:
			pure[0] = 0; pure[1] = w; pure[2] = 1; break;
		case 4:
			pure[0] = v; pure[1] = 0; pure[2] = 1; break;
		default:
			pure[0] = 1; pure[1] = 0; pure[2] = w;
	}

	mg = (1.0 - c) * g;

	return [
		(c * pure[0] + mg) * 255,
		(c * pure[1] + mg) * 255,
		(c * pure[2] + mg) * 255
	];
};

convert.hcg.hsv = function (hcg) {
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;

	var v = c + g * (1.0 - c);
	var f = 0;

	if (v > 0.0) {
		f = c / v;
	}

	return [hcg[0], f * 100, v * 100];
};

convert.hcg.hsl = function (hcg) {
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;

	var l = g * (1.0 - c) + 0.5 * c;
	var s = 0;

	if (l > 0.0 && l < 0.5) {
		s = c / (2 * l);
	} else
	if (l >= 0.5 && l < 1.0) {
		s = c / (2 * (1 - l));
	}

	return [hcg[0], s * 100, l * 100];
};

convert.hcg.hwb = function (hcg) {
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;
	var v = c + g * (1.0 - c);
	return [hcg[0], (v - c) * 100, (1 - v) * 100];
};

convert.hwb.hcg = function (hwb) {
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

convert.apple.rgb = function (apple) {
	return [(apple[0] / 65535) * 255, (apple[1] / 65535) * 255, (apple[2] / 65535) * 255];
};

convert.rgb.apple = function (rgb) {
	return [(rgb[0] / 255) * 65535, (rgb[1] / 255) * 65535, (rgb[2] / 255) * 65535];
};

convert.gray.rgb = function (args) {
	return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
};

convert.gray.hsl = convert.gray.hsv = function (args) {
	return [0, 0, args[0]];
};

convert.gray.hwb = function (gray) {
	return [0, 100, gray[0]];
};

convert.gray.cmyk = function (gray) {
	return [0, 0, 0, gray[0]];
};

convert.gray.lab = function (gray) {
	return [gray[0], 0, 0];
};

convert.gray.hex = function (gray) {
	var val = Math.round(gray[0] / 100 * 255) & 0xFF;
	var integer = (val << 16) + (val << 8) + val;

	var string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.rgb.gray = function (rgb) {
	var val = (rgb[0] + rgb[1] + rgb[2]) / 3;
	return [val / 255 * 100];
};


/***/ }),

/***/ 6931:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var conversions = __nccwpck_require__(7391);
var route = __nccwpck_require__(880);

var convert = {};

var models = Object.keys(conversions);

function wrapRaw(fn) {
	var wrappedFn = function (args) {
		if (args === undefined || args === null) {
			return args;
		}

		if (arguments.length > 1) {
			args = Array.prototype.slice.call(arguments);
		}

		return fn(args);
	};

	// preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

function wrapRounded(fn) {
	var wrappedFn = function (args) {
		if (args === undefined || args === null) {
			return args;
		}

		if (arguments.length > 1) {
			args = Array.prototype.slice.call(arguments);
		}

		var result = fn(args);

		// we're assuming the result is an array here.
		// see notice in conversions.js; don't use box types
		// in conversion functions.
		if (typeof result === 'object') {
			for (var len = result.length, i = 0; i < len; i++) {
				result[i] = Math.round(result[i]);
			}
		}

		return result;
	};

	// preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

models.forEach(function (fromModel) {
	convert[fromModel] = {};

	Object.defineProperty(convert[fromModel], 'channels', {value: conversions[fromModel].channels});
	Object.defineProperty(convert[fromModel], 'labels', {value: conversions[fromModel].labels});

	var routes = route(fromModel);
	var routeModels = Object.keys(routes);

	routeModels.forEach(function (toModel) {
		var fn = routes[toModel];

		convert[fromModel][toModel] = wrapRounded(fn);
		convert[fromModel][toModel].raw = wrapRaw(fn);
	});
});

module.exports = convert;


/***/ }),

/***/ 188:
/***/ ((module) => {

"use strict";


module.exports = {
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


/***/ }),

/***/ 880:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var conversions = __nccwpck_require__(7391);

/*
	this function routes a model to all other models.

	all functions that are routed have a property `.conversion` attached
	to the returned synthetic function. This property is an array
	of strings, each with the steps in between the 'from' and 'to'
	color models (inclusive).

	conversions that are not possible simply are not included.
*/

function buildGraph() {
	var graph = {};
	// https://jsperf.com/object-keys-vs-for-in-with-closure/3
	var models = Object.keys(conversions);

	for (var len = models.length, i = 0; i < len; i++) {
		graph[models[i]] = {
			// http://jsperf.com/1-vs-infinity
			// micro-opt, but this is simple.
			distance: -1,
			parent: null
		};
	}

	return graph;
}

// https://en.wikipedia.org/wiki/Breadth-first_search
function deriveBFS(fromModel) {
	var graph = buildGraph();
	var queue = [fromModel]; // unshift -> queue -> pop

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
	return function (args) {
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

module.exports = function (fromModel) {
	var graph = deriveBFS(fromModel);
	var conversion = {};

	var models = Object.keys(graph);
	for (var len = models.length, i = 0; i < len; i++) {
		var toModel = models[i];
		var node = graph[toModel];

		if (node.parent === null) {
			// no possible conversion, or this node is the source model.
			continue;
		}

		conversion[toModel] = wrapConversion(toModel, graph);
	}

	return conversion;
};



/***/ }),

/***/ 8510:
/***/ ((module) => {

"use strict";


module.exports = {
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


/***/ }),

/***/ 1069:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/* MIT license */
var colorNames = __nccwpck_require__(8510);
var swizzle = __nccwpck_require__(8679);
var hasOwnProperty = Object.hasOwnProperty;

var reverseNames = Object.create(null);

// create a list of reverse color names
for (var name in colorNames) {
	if (hasOwnProperty.call(colorNames, name)) {
		reverseNames[colorNames[name]] = name;
	}
}

var cs = module.exports = {
	to: {},
	get: {}
};

cs.get = function (string) {
	var prefix = string.substring(0, 3).toLowerCase();
	var val;
	var model;
	switch (prefix) {
		case 'hsl':
			val = cs.get.hsl(string);
			model = 'hsl';
			break;
		case 'hwb':
			val = cs.get.hwb(string);
			model = 'hwb';
			break;
		default:
			val = cs.get.rgb(string);
			model = 'rgb';
			break;
	}

	if (!val) {
		return null;
	}

	return {model: model, value: val};
};

cs.get.rgb = function (string) {
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
			// https://jsperf.com/slice-vs-substr-vs-substring-methods-long-string/19
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
		if (match[1] === 'transparent') {
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

cs.get.hsl = function (string) {
	if (!string) {
		return null;
	}

	var hsl = /^hsla?\(\s*([+-]?(?:\d{0,3}\.)?\d+)(?:deg)?\s*,?\s*([+-]?[\d\.]+)%\s*,?\s*([+-]?[\d\.]+)%\s*(?:[,|\/]\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/;
	var match = string.match(hsl);

	if (match) {
		var alpha = parseFloat(match[4]);
		var h = ((parseFloat(match[1]) % 360) + 360) % 360;
		var s = clamp(parseFloat(match[2]), 0, 100);
		var l = clamp(parseFloat(match[3]), 0, 100);
		var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);

		return [h, s, l, a];
	}

	return null;
};

cs.get.hwb = function (string) {
	if (!string) {
		return null;
	}

	var hwb = /^hwb\(\s*([+-]?\d{0,3}(?:\.\d+)?)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/;
	var match = string.match(hwb);

	if (match) {
		var alpha = parseFloat(match[4]);
		var h = ((parseFloat(match[1]) % 360) + 360) % 360;
		var w = clamp(parseFloat(match[2]), 0, 100);
		var b = clamp(parseFloat(match[3]), 0, 100);
		var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);
		return [h, w, b, a];
	}

	return null;
};

cs.to.hex = function () {
	var rgba = swizzle(arguments);

	return (
		'#' +
		hexDouble(rgba[0]) +
		hexDouble(rgba[1]) +
		hexDouble(rgba[2]) +
		(rgba[3] < 1
			? (hexDouble(Math.round(rgba[3] * 255)))
			: '')
	);
};

cs.to.rgb = function () {
	var rgba = swizzle(arguments);

	return rgba.length < 4 || rgba[3] === 1
		? 'rgb(' + Math.round(rgba[0]) + ', ' + Math.round(rgba[1]) + ', ' + Math.round(rgba[2]) + ')'
		: 'rgba(' + Math.round(rgba[0]) + ', ' + Math.round(rgba[1]) + ', ' + Math.round(rgba[2]) + ', ' + rgba[3] + ')';
};

cs.to.rgb.percent = function () {
	var rgba = swizzle(arguments);

	var r = Math.round(rgba[0] / 255 * 100);
	var g = Math.round(rgba[1] / 255 * 100);
	var b = Math.round(rgba[2] / 255 * 100);

	return rgba.length < 4 || rgba[3] === 1
		? 'rgb(' + r + '%, ' + g + '%, ' + b + '%)'
		: 'rgba(' + r + '%, ' + g + '%, ' + b + '%, ' + rgba[3] + ')';
};

cs.to.hsl = function () {
	var hsla = swizzle(arguments);
	return hsla.length < 4 || hsla[3] === 1
		? 'hsl(' + hsla[0] + ', ' + hsla[1] + '%, ' + hsla[2] + '%)'
		: 'hsla(' + hsla[0] + ', ' + hsla[1] + '%, ' + hsla[2] + '%, ' + hsla[3] + ')';
};

// hwb is a bit different than rgb(a) & hsl(a) since there is no alpha specific syntax
// (hwb have alpha optional & 1 is default value)
cs.to.hwb = function () {
	var hwba = swizzle(arguments);

	var a = '';
	if (hwba.length >= 4 && hwba[3] !== 1) {
		a = ', ' + hwba[3];
	}

	return 'hwb(' + hwba[0] + ', ' + hwba[1] + '%, ' + hwba[2] + '%' + a + ')';
};

cs.to.keyword = function (rgb) {
	return reverseNames[rgb.slice(0, 3)];
};

// helpers
function clamp(num, min, max) {
	return Math.min(Math.max(min, num), max);
}

function hexDouble(num) {
	var str = Math.round(num).toString(16).toUpperCase();
	return (str.length < 2) ? '0' + str : str;
}


/***/ }),

/***/ 7177:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


var colorString = __nccwpck_require__(1069);
var convert = __nccwpck_require__(6931);

var _slice = [].slice;

var skippedModels = [
	// to be honest, I don't really feel like keyword belongs in color convert, but eh.
	'keyword',

	// gray conflicts with some method names, and has its own method defined.
	'gray',

	// shouldn't really be in color-convert either...
	'hex'
];

var hashedModelKeys = {};
Object.keys(convert).forEach(function (model) {
	hashedModelKeys[_slice.call(convert[model].labels).sort().join('')] = model;
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
		throw new Error('Unknown model: ' + model);
	}

	var i;
	var channels;

	if (obj == null) { // eslint-disable-line no-eq-null,eqeqeq
		this.model = 'rgb';
		this.color = [0, 0, 0];
		this.valpha = 1;
	} else if (obj instanceof Color) {
		this.model = obj.model;
		this.color = obj.color.slice();
		this.valpha = obj.valpha;
	} else if (typeof obj === 'string') {
		var result = colorString.get(obj);
		if (result === null) {
			throw new Error('Unable to parse color from string: ' + obj);
		}

		this.model = result.model;
		channels = convert[this.model].channels;
		this.color = result.value.slice(0, channels);
		this.valpha = typeof result.value[channels] === 'number' ? result.value[channels] : 1;
	} else if (obj.length) {
		this.model = model || 'rgb';
		channels = convert[this.model].channels;
		var newArr = _slice.call(obj, 0, channels);
		this.color = zeroArray(newArr, channels);
		this.valpha = typeof obj[channels] === 'number' ? obj[channels] : 1;
	} else if (typeof obj === 'number') {
		// this is always RGB - can be converted later on.
		obj &= 0xFFFFFF;
		this.model = 'rgb';
		this.color = [
			(obj >> 16) & 0xFF,
			(obj >> 8) & 0xFF,
			obj & 0xFF
		];
		this.valpha = 1;
	} else {
		this.valpha = 1;

		var keys = Object.keys(obj);
		if ('alpha' in obj) {
			keys.splice(keys.indexOf('alpha'), 1);
			this.valpha = typeof obj.alpha === 'number' ? obj.alpha : 0;
		}

		var hashedKeys = keys.sort().join('');
		if (!(hashedKeys in hashedModelKeys)) {
			throw new Error('Unable to parse color from object: ' + JSON.stringify(obj));
		}

		this.model = hashedModelKeys[hashedKeys];

		var labels = convert[this.model].labels;
		var color = [];
		for (i = 0; i < labels.length; i++) {
			color.push(obj[labels[i]]);
		}

		this.color = zeroArray(color);
	}

	// perform limitations (clamping, etc.)
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
	toString: function () {
		return this.string();
	},

	toJSON: function () {
		return this[this.model]();
	},

	string: function (places) {
		var self = this.model in colorString.to ? this : this.rgb();
		self = self.round(typeof places === 'number' ? places : 1);
		var args = self.valpha === 1 ? self.color : self.color.concat(this.valpha);
		return colorString.to[self.model](args);
	},

	percentString: function (places) {
		var self = this.rgb().round(typeof places === 'number' ? places : 1);
		var args = self.valpha === 1 ? self.color : self.color.concat(this.valpha);
		return colorString.to.rgb.percent(args);
	},

	array: function () {
		return this.valpha === 1 ? this.color.slice() : this.color.concat(this.valpha);
	},

	object: function () {
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

	unitArray: function () {
		var rgb = this.rgb().color;
		rgb[0] /= 255;
		rgb[1] /= 255;
		rgb[2] /= 255;

		if (this.valpha !== 1) {
			rgb.push(this.valpha);
		}

		return rgb;
	},

	unitObject: function () {
		var rgb = this.rgb().object();
		rgb.r /= 255;
		rgb.g /= 255;
		rgb.b /= 255;

		if (this.valpha !== 1) {
			rgb.alpha = this.valpha;
		}

		return rgb;
	},

	round: function (places) {
		places = Math.max(places || 0, 0);
		return new Color(this.color.map(roundToPlace(places)).concat(this.valpha), this.model);
	},

	alpha: function (val) {
		if (arguments.length) {
			return new Color(this.color.concat(Math.max(0, Math.min(1, val))), this.model);
		}

		return this.valpha;
	},

	// rgb
	red: getset('rgb', 0, maxfn(255)),
	green: getset('rgb', 1, maxfn(255)),
	blue: getset('rgb', 2, maxfn(255)),

	hue: getset(['hsl', 'hsv', 'hsl', 'hwb', 'hcg'], 0, function (val) { return ((val % 360) + 360) % 360; }), // eslint-disable-line brace-style

	saturationl: getset('hsl', 1, maxfn(100)),
	lightness: getset('hsl', 2, maxfn(100)),

	saturationv: getset('hsv', 1, maxfn(100)),
	value: getset('hsv', 2, maxfn(100)),

	chroma: getset('hcg', 1, maxfn(100)),
	gray: getset('hcg', 2, maxfn(100)),

	white: getset('hwb', 1, maxfn(100)),
	wblack: getset('hwb', 2, maxfn(100)),

	cyan: getset('cmyk', 0, maxfn(100)),
	magenta: getset('cmyk', 1, maxfn(100)),
	yellow: getset('cmyk', 2, maxfn(100)),
	black: getset('cmyk', 3, maxfn(100)),

	x: getset('xyz', 0, maxfn(100)),
	y: getset('xyz', 1, maxfn(100)),
	z: getset('xyz', 2, maxfn(100)),

	l: getset('lab', 0, maxfn(100)),
	a: getset('lab', 1),
	b: getset('lab', 2),

	keyword: function (val) {
		if (arguments.length) {
			return new Color(val);
		}

		return convert[this.model].keyword(this.color);
	},

	hex: function (val) {
		if (arguments.length) {
			return new Color(val);
		}

		return colorString.to.hex(this.rgb().round().color);
	},

	rgbNumber: function () {
		var rgb = this.rgb().color;
		return ((rgb[0] & 0xFF) << 16) | ((rgb[1] & 0xFF) << 8) | (rgb[2] & 0xFF);
	},

	luminosity: function () {
		// http://www.w3.org/TR/WCAG20/#relativeluminancedef
		var rgb = this.rgb().color;

		var lum = [];
		for (var i = 0; i < rgb.length; i++) {
			var chan = rgb[i] / 255;
			lum[i] = (chan <= 0.03928) ? chan / 12.92 : Math.pow(((chan + 0.055) / 1.055), 2.4);
		}

		return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
	},

	contrast: function (color2) {
		// http://www.w3.org/TR/WCAG20/#contrast-ratiodef
		var lum1 = this.luminosity();
		var lum2 = color2.luminosity();

		if (lum1 > lum2) {
			return (lum1 + 0.05) / (lum2 + 0.05);
		}

		return (lum2 + 0.05) / (lum1 + 0.05);
	},

	level: function (color2) {
		var contrastRatio = this.contrast(color2);
		if (contrastRatio >= 7.1) {
			return 'AAA';
		}

		return (contrastRatio >= 4.5) ? 'AA' : '';
	},

	isDark: function () {
		// YIQ equation from http://24ways.org/2010/calculating-color-contrast
		var rgb = this.rgb().color;
		var yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
		return yiq < 128;
	},

	isLight: function () {
		return !this.isDark();
	},

	negate: function () {
		var rgb = this.rgb();
		for (var i = 0; i < 3; i++) {
			rgb.color[i] = 255 - rgb.color[i];
		}
		return rgb;
	},

	lighten: function (ratio) {
		var hsl = this.hsl();
		hsl.color[2] += hsl.color[2] * ratio;
		return hsl;
	},

	darken: function (ratio) {
		var hsl = this.hsl();
		hsl.color[2] -= hsl.color[2] * ratio;
		return hsl;
	},

	saturate: function (ratio) {
		var hsl = this.hsl();
		hsl.color[1] += hsl.color[1] * ratio;
		return hsl;
	},

	desaturate: function (ratio) {
		var hsl = this.hsl();
		hsl.color[1] -= hsl.color[1] * ratio;
		return hsl;
	},

	whiten: function (ratio) {
		var hwb = this.hwb();
		hwb.color[1] += hwb.color[1] * ratio;
		return hwb;
	},

	blacken: function (ratio) {
		var hwb = this.hwb();
		hwb.color[2] += hwb.color[2] * ratio;
		return hwb;
	},

	grayscale: function () {
		// http://en.wikipedia.org/wiki/Grayscale#Converting_color_to_grayscale
		var rgb = this.rgb().color;
		var val = rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11;
		return Color.rgb(val, val, val);
	},

	fade: function (ratio) {
		return this.alpha(this.valpha - (this.valpha * ratio));
	},

	opaquer: function (ratio) {
		return this.alpha(this.valpha + (this.valpha * ratio));
	},

	rotate: function (degrees) {
		var hsl = this.hsl();
		var hue = hsl.color[0];
		hue = (hue + degrees) % 360;
		hue = hue < 0 ? 360 + hue : hue;
		hsl.color[0] = hue;
		return hsl;
	},

	mix: function (mixinColor, weight) {
		// ported from sass implementation in C
		// https://github.com/sass/libsass/blob/0e6b4a2850092356aa3ece07c6b249f0221caced/functions.cpp#L209
		if (!mixinColor || !mixinColor.rgb) {
			throw new Error('Argument to "mix" was not a Color instance, but rather an instance of ' + typeof mixinColor);
		}
		var color1 = mixinColor.rgb();
		var color2 = this.rgb();
		var p = weight === undefined ? 0.5 : weight;

		var w = 2 * p - 1;
		var a = color1.alpha() - color2.alpha();

		var w1 = (((w * a === -1) ? w : (w + a) / (1 + w * a)) + 1) / 2.0;
		var w2 = 1 - w1;

		return Color.rgb(
				w1 * color1.red() + w2 * color2.red(),
				w1 * color1.green() + w2 * color2.green(),
				w1 * color1.blue() + w2 * color2.blue(),
				color1.alpha() * p + color2.alpha() * (1 - p));
	}
};

// model conversion methods and static constructors
Object.keys(convert).forEach(function (model) {
	if (skippedModels.indexOf(model) !== -1) {
		return;
	}

	var channels = convert[model].channels;

	// conversion methods
	Color.prototype[model] = function () {
		if (this.model === model) {
			return new Color(this);
		}

		if (arguments.length) {
			return new Color(arguments, model);
		}

		var newAlpha = typeof arguments[channels] === 'number' ? channels : this.valpha;
		return new Color(assertArray(convert[this.model][model].raw(this.color)).concat(newAlpha), model);
	};

	// 'static' construction methods
	Color[model] = function (color) {
		if (typeof color === 'number') {
			color = zeroArray(_slice.call(arguments), channels);
		}
		return new Color(color, model);
	};
});

function roundTo(num, places) {
	return Number(num.toFixed(places));
}

function roundToPlace(places) {
	return function (num) {
		return roundTo(num, places);
	};
}

function getset(model, channel, modifier) {
	model = Array.isArray(model) ? model : [model];

	model.forEach(function (m) {
		(limiters[m] || (limiters[m] = []))[channel] = modifier;
	});

	model = model[0];

	return function (val) {
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
	return function (v) {
		return Math.max(0, Math.min(max, v));
	};
}

function assertArray(val) {
	return Array.isArray(val) ? val : [val];
}

function zeroArray(arr, length) {
	for (var i = 0; i < length; i++) {
		if (typeof arr[i] !== 'number') {
			arr[i] = 0;
		}
	}

	return arr;
}

module.exports = Color;


/***/ }),

/***/ 7740:
/***/ ((module) => {

module.exports = [
  {
    "value":"#B0171F",
    "name":"indian red"
  },
  {
    "value":"#DC143C",
    "css":true,
    "name":"crimson"
  },
  {
    "value":"#FFB6C1",
    "css":true,
    "name":"lightpink"
  },
  {
    "value":"#FFAEB9",
    "name":"lightpink 1"
  },
  {
    "value":"#EEA2AD",
    "name":"lightpink 2"
  },
  {
    "value":"#CD8C95",
    "name":"lightpink 3"
  },
  {
    "value":"#8B5F65",
    "name":"lightpink 4"
  },
  {
    "value":"#FFC0CB",
    "css":true,
    "name":"pink"
  },
  {
    "value":"#FFB5C5",
    "name":"pink 1"
  },
  {
    "value":"#EEA9B8",
    "name":"pink 2"
  },
  {
    "value":"#CD919E",
    "name":"pink 3"
  },
  {
    "value":"#8B636C",
    "name":"pink 4"
  },
  {
    "value":"#DB7093",
    "css":true,
    "name":"palevioletred"
  },
  {
    "value":"#FF82AB",
    "name":"palevioletred 1"
  },
  {
    "value":"#EE799F",
    "name":"palevioletred 2"
  },
  {
    "value":"#CD6889",
    "name":"palevioletred 3"
  },
  {
    "value":"#8B475D",
    "name":"palevioletred 4"
  },
  {
    "value":"#FFF0F5",
    "name":"lavenderblush 1"
  },
  {
    "value":"#FFF0F5",
    "css":true,
    "name":"lavenderblush"
  },
  {
    "value":"#EEE0E5",
    "name":"lavenderblush 2"
  },
  {
    "value":"#CDC1C5",
    "name":"lavenderblush 3"
  },
  {
    "value":"#8B8386",
    "name":"lavenderblush 4"
  },
  {
    "value":"#FF3E96",
    "name":"violetred 1"
  },
  {
    "value":"#EE3A8C",
    "name":"violetred 2"
  },
  {
    "value":"#CD3278",
    "name":"violetred 3"
  },
  {
    "value":"#8B2252",
    "name":"violetred 4"
  },
  {
    "value":"#FF69B4",
    "css":true,
    "name":"hotpink"
  },
  {
    "value":"#FF6EB4",
    "name":"hotpink 1"
  },
  {
    "value":"#EE6AA7",
    "name":"hotpink 2"
  },
  {
    "value":"#CD6090",
    "name":"hotpink 3"
  },
  {
    "value":"#8B3A62",
    "name":"hotpink 4"
  },
  {
    "value":"#872657",
    "name":"raspberry"
  },
  {
    "value":"#FF1493",
    "name":"deeppink 1"
  },
  {
    "value":"#FF1493",
    "css":true,
    "name":"deeppink"
  },
  {
    "value":"#EE1289",
    "name":"deeppink 2"
  },
  {
    "value":"#CD1076",
    "name":"deeppink 3"
  },
  {
    "value":"#8B0A50",
    "name":"deeppink 4"
  },
  {
    "value":"#FF34B3",
    "name":"maroon 1"
  },
  {
    "value":"#EE30A7",
    "name":"maroon 2"
  },
  {
    "value":"#CD2990",
    "name":"maroon 3"
  },
  {
    "value":"#8B1C62",
    "name":"maroon 4"
  },
  {
    "value":"#C71585",
    "css":true,
    "name":"mediumvioletred"
  },
  {
    "value":"#D02090",
    "name":"violetred"
  },
  {
    "value":"#DA70D6",
    "css":true,
    "name":"orchid"
  },
  {
    "value":"#FF83FA",
    "name":"orchid 1"
  },
  {
    "value":"#EE7AE9",
    "name":"orchid 2"
  },
  {
    "value":"#CD69C9",
    "name":"orchid 3"
  },
  {
    "value":"#8B4789",
    "name":"orchid 4"
  },
  {
    "value":"#D8BFD8",
    "css":true,
    "name":"thistle"
  },
  {
    "value":"#FFE1FF",
    "name":"thistle 1"
  },
  {
    "value":"#EED2EE",
    "name":"thistle 2"
  },
  {
    "value":"#CDB5CD",
    "name":"thistle 3"
  },
  {
    "value":"#8B7B8B",
    "name":"thistle 4"
  },
  {
    "value":"#FFBBFF",
    "name":"plum 1"
  },
  {
    "value":"#EEAEEE",
    "name":"plum 2"
  },
  {
    "value":"#CD96CD",
    "name":"plum 3"
  },
  {
    "value":"#8B668B",
    "name":"plum 4"
  },
  {
    "value":"#DDA0DD",
    "css":true,
    "name":"plum"
  },
  {
    "value":"#EE82EE",
    "css":true,
    "name":"violet"
  },
  {
    "value":"#FF00FF",
    "vga":true,
    "name":"magenta"
  },
  {
    "value":"#FF00FF",
    "vga":true,
    "css":true,
    "name":"fuchsia"
  },
  {
    "value":"#EE00EE",
    "name":"magenta 2"
  },
  {
    "value":"#CD00CD",
    "name":"magenta 3"
  },
  {
    "value":"#8B008B",
    "name":"magenta 4"
  },
  {
    "value":"#8B008B",
    "css":true,
    "name":"darkmagenta"
  },
  {
    "value":"#800080",
    "vga":true,
    "css":true,
    "name":"purple"
  },
  {
    "value":"#BA55D3",
    "css":true,
    "name":"mediumorchid"
  },
  {
    "value":"#E066FF",
    "name":"mediumorchid 1"
  },
  {
    "value":"#D15FEE",
    "name":"mediumorchid 2"
  },
  {
    "value":"#B452CD",
    "name":"mediumorchid 3"
  },
  {
    "value":"#7A378B",
    "name":"mediumorchid 4"
  },
  {
    "value":"#9400D3",
    "css":true,
    "name":"darkviolet"
  },
  {
    "value":"#9932CC",
    "css":true,
    "name":"darkorchid"
  },
  {
    "value":"#BF3EFF",
    "name":"darkorchid 1"
  },
  {
    "value":"#B23AEE",
    "name":"darkorchid 2"
  },
  {
    "value":"#9A32CD",
    "name":"darkorchid 3"
  },
  {
    "value":"#68228B",
    "name":"darkorchid 4"
  },
  {
    "value":"#4B0082",
    "css":true,
    "name":"indigo"
  },
  {
    "value":"#8A2BE2",
    "css":true,
    "name":"blueviolet"
  },
  {
    "value":"#9B30FF",
    "name":"purple 1"
  },
  {
    "value":"#912CEE",
    "name":"purple 2"
  },
  {
    "value":"#7D26CD",
    "name":"purple 3"
  },
  {
    "value":"#551A8B",
    "name":"purple 4"
  },
  {
    "value":"#9370DB",
    "css":true,
    "name":"mediumpurple"
  },
  {
    "value":"#AB82FF",
    "name":"mediumpurple 1"
  },
  {
    "value":"#9F79EE",
    "name":"mediumpurple 2"
  },
  {
    "value":"#8968CD",
    "name":"mediumpurple 3"
  },
  {
    "value":"#5D478B",
    "name":"mediumpurple 4"
  },
  {
    "value":"#483D8B",
    "css":true,
    "name":"darkslateblue"
  },
  {
    "value":"#8470FF",
    "name":"lightslateblue"
  },
  {
    "value":"#7B68EE",
    "css":true,
    "name":"mediumslateblue"
  },
  {
    "value":"#6A5ACD",
    "css":true,
    "name":"slateblue"
  },
  {
    "value":"#836FFF",
    "name":"slateblue 1"
  },
  {
    "value":"#7A67EE",
    "name":"slateblue 2"
  },
  {
    "value":"#6959CD",
    "name":"slateblue 3"
  },
  {
    "value":"#473C8B",
    "name":"slateblue 4"
  },
  {
    "value":"#F8F8FF",
    "css":true,
    "name":"ghostwhite"
  },
  {
    "value":"#E6E6FA",
    "css":true,
    "name":"lavender"
  },
  {
    "value":"#0000FF",
    "vga":true,
    "css":true,
    "name":"blue"
  },
  {
    "value":"#0000EE",
    "name":"blue 2"
  },
  {
    "value":"#0000CD",
    "name":"blue 3"
  },
  {
    "value":"#0000CD",
    "css":true,
    "name":"mediumblue"
  },
  {
    "value":"#00008B",
    "name":"blue 4"
  },
  {
    "value":"#00008B",
    "css":true,
    "name":"darkblue"
  },
  {
    "value":"#000080",
    "vga":true,
    "css":true,
    "name":"navy"
  },
  {
    "value":"#191970",
    "css":true,
    "name":"midnightblue"
  },
  {
    "value":"#3D59AB",
    "name":"cobalt"
  },
  {
    "value":"#4169E1",
    "css":true,
    "name":"royalblue"
  },
  {
    "value":"#4876FF",
    "name":"royalblue 1"
  },
  {
    "value":"#436EEE",
    "name":"royalblue 2"
  },
  {
    "value":"#3A5FCD",
    "name":"royalblue 3"
  },
  {
    "value":"#27408B",
    "name":"royalblue 4"
  },
  {
    "value":"#6495ED",
    "css":true,
    "name":"cornflowerblue"
  },
  {
    "value":"#B0C4DE",
    "css":true,
    "name":"lightsteelblue"
  },
  {
    "value":"#CAE1FF",
    "name":"lightsteelblue 1"
  },
  {
    "value":"#BCD2EE",
    "name":"lightsteelblue 2"
  },
  {
    "value":"#A2B5CD",
    "name":"lightsteelblue 3"
  },
  {
    "value":"#6E7B8B",
    "name":"lightsteelblue 4"
  },
  {
    "value":"#778899",
    "css":true,
    "name":"lightslategray"
  },
  {
    "value":"#708090",
    "css":true,
    "name":"slategray"
  },
  {
    "value":"#C6E2FF",
    "name":"slategray 1"
  },
  {
    "value":"#B9D3EE",
    "name":"slategray 2"
  },
  {
    "value":"#9FB6CD",
    "name":"slategray 3"
  },
  {
    "value":"#6C7B8B",
    "name":"slategray 4"
  },
  {
    "value":"#1E90FF",
    "name":"dodgerblue 1"
  },
  {
    "value":"#1E90FF",
    "css":true,
    "name":"dodgerblue"
  },
  {
    "value":"#1C86EE",
    "name":"dodgerblue 2"
  },
  {
    "value":"#1874CD",
    "name":"dodgerblue 3"
  },
  {
    "value":"#104E8B",
    "name":"dodgerblue 4"
  },
  {
    "value":"#F0F8FF",
    "css":true,
    "name":"aliceblue"
  },
  {
    "value":"#4682B4",
    "css":true,
    "name":"steelblue"
  },
  {
    "value":"#63B8FF",
    "name":"steelblue 1"
  },
  {
    "value":"#5CACEE",
    "name":"steelblue 2"
  },
  {
    "value":"#4F94CD",
    "name":"steelblue 3"
  },
  {
    "value":"#36648B",
    "name":"steelblue 4"
  },
  {
    "value":"#87CEFA",
    "css":true,
    "name":"lightskyblue"
  },
  {
    "value":"#B0E2FF",
    "name":"lightskyblue 1"
  },
  {
    "value":"#A4D3EE",
    "name":"lightskyblue 2"
  },
  {
    "value":"#8DB6CD",
    "name":"lightskyblue 3"
  },
  {
    "value":"#607B8B",
    "name":"lightskyblue 4"
  },
  {
    "value":"#87CEFF",
    "name":"skyblue 1"
  },
  {
    "value":"#7EC0EE",
    "name":"skyblue 2"
  },
  {
    "value":"#6CA6CD",
    "name":"skyblue 3"
  },
  {
    "value":"#4A708B",
    "name":"skyblue 4"
  },
  {
    "value":"#87CEEB",
    "css":true,
    "name":"skyblue"
  },
  {
    "value":"#00BFFF",
    "name":"deepskyblue 1"
  },
  {
    "value":"#00BFFF",
    "css":true,
    "name":"deepskyblue"
  },
  {
    "value":"#00B2EE",
    "name":"deepskyblue 2"
  },
  {
    "value":"#009ACD",
    "name":"deepskyblue 3"
  },
  {
    "value":"#00688B",
    "name":"deepskyblue 4"
  },
  {
    "value":"#33A1C9",
    "name":"peacock"
  },
  {
    "value":"#ADD8E6",
    "css":true,
    "name":"lightblue"
  },
  {
    "value":"#BFEFFF",
    "name":"lightblue 1"
  },
  {
    "value":"#B2DFEE",
    "name":"lightblue 2"
  },
  {
    "value":"#9AC0CD",
    "name":"lightblue 3"
  },
  {
    "value":"#68838B",
    "name":"lightblue 4"
  },
  {
    "value":"#B0E0E6",
    "css":true,
    "name":"powderblue"
  },
  {
    "value":"#98F5FF",
    "name":"cadetblue 1"
  },
  {
    "value":"#8EE5EE",
    "name":"cadetblue 2"
  },
  {
    "value":"#7AC5CD",
    "name":"cadetblue 3"
  },
  {
    "value":"#53868B",
    "name":"cadetblue 4"
  },
  {
    "value":"#00F5FF",
    "name":"turquoise 1"
  },
  {
    "value":"#00E5EE",
    "name":"turquoise 2"
  },
  {
    "value":"#00C5CD",
    "name":"turquoise 3"
  },
  {
    "value":"#00868B",
    "name":"turquoise 4"
  },
  {
    "value":"#5F9EA0",
    "css":true,
    "name":"cadetblue"
  },
  {
    "value":"#00CED1",
    "css":true,
    "name":"darkturquoise"
  },
  {
    "value":"#F0FFFF",
    "name":"azure 1"
  },
  {
    "value":"#F0FFFF",
    "css":true,
    "name":"azure"
  },
  {
    "value":"#E0EEEE",
    "name":"azure 2"
  },
  {
    "value":"#C1CDCD",
    "name":"azure 3"
  },
  {
    "value":"#838B8B",
    "name":"azure 4"
  },
  {
    "value":"#E0FFFF",
    "name":"lightcyan 1"
  },
  {
    "value":"#E0FFFF",
    "css":true,
    "name":"lightcyan"
  },
  {
    "value":"#D1EEEE",
    "name":"lightcyan 2"
  },
  {
    "value":"#B4CDCD",
    "name":"lightcyan 3"
  },
  {
    "value":"#7A8B8B",
    "name":"lightcyan 4"
  },
  {
    "value":"#BBFFFF",
    "name":"paleturquoise 1"
  },
  {
    "value":"#AEEEEE",
    "name":"paleturquoise 2"
  },
  {
    "value":"#AEEEEE",
    "css":true,
    "name":"paleturquoise"
  },
  {
    "value":"#96CDCD",
    "name":"paleturquoise 3"
  },
  {
    "value":"#668B8B",
    "name":"paleturquoise 4"
  },
  {
    "value":"#2F4F4F",
    "css":true,
    "name":"darkslategray"
  },
  {
    "value":"#97FFFF",
    "name":"darkslategray 1"
  },
  {
    "value":"#8DEEEE",
    "name":"darkslategray 2"
  },
  {
    "value":"#79CDCD",
    "name":"darkslategray 3"
  },
  {
    "value":"#528B8B",
    "name":"darkslategray 4"
  },
  {
    "value":"#00FFFF",
    "name":"cyan"
  },
  {
    "value":"#00FFFF",
    "css":true,
    "name":"aqua"
  },
  {
    "value":"#00EEEE",
    "name":"cyan 2"
  },
  {
    "value":"#00CDCD",
    "name":"cyan 3"
  },
  {
    "value":"#008B8B",
    "name":"cyan 4"
  },
  {
    "value":"#008B8B",
    "css":true,
    "name":"darkcyan"
  },
  {
    "value":"#008080",
    "vga":true,
    "css":true,
    "name":"teal"
  },
  {
    "value":"#48D1CC",
    "css":true,
    "name":"mediumturquoise"
  },
  {
    "value":"#20B2AA",
    "css":true,
    "name":"lightseagreen"
  },
  {
    "value":"#03A89E",
    "name":"manganeseblue"
  },
  {
    "value":"#40E0D0",
    "css":true,
    "name":"turquoise"
  },
  {
    "value":"#808A87",
    "name":"coldgrey"
  },
  {
    "value":"#00C78C",
    "name":"turquoiseblue"
  },
  {
    "value":"#7FFFD4",
    "name":"aquamarine 1"
  },
  {
    "value":"#7FFFD4",
    "css":true,
    "name":"aquamarine"
  },
  {
    "value":"#76EEC6",
    "name":"aquamarine 2"
  },
  {
    "value":"#66CDAA",
    "name":"aquamarine 3"
  },
  {
    "value":"#66CDAA",
    "css":true,
    "name":"mediumaquamarine"
  },
  {
    "value":"#458B74",
    "name":"aquamarine 4"
  },
  {
    "value":"#00FA9A",
    "css":true,
    "name":"mediumspringgreen"
  },
  {
    "value":"#F5FFFA",
    "css":true,
    "name":"mintcream"
  },
  {
    "value":"#00FF7F",
    "css":true,
    "name":"springgreen"
  },
  {
    "value":"#00EE76",
    "name":"springgreen 1"
  },
  {
    "value":"#00CD66",
    "name":"springgreen 2"
  },
  {
    "value":"#008B45",
    "name":"springgreen 3"
  },
  {
    "value":"#3CB371",
    "css":true,
    "name":"mediumseagreen"
  },
  {
    "value":"#54FF9F",
    "name":"seagreen 1"
  },
  {
    "value":"#4EEE94",
    "name":"seagreen 2"
  },
  {
    "value":"#43CD80",
    "name":"seagreen 3"
  },
  {
    "value":"#2E8B57",
    "name":"seagreen 4"
  },
  {
    "value":"#2E8B57",
    "css":true,
    "name":"seagreen"
  },
  {
    "value":"#00C957",
    "name":"emeraldgreen"
  },
  {
    "value":"#BDFCC9",
    "name":"mint"
  },
  {
    "value":"#3D9140",
    "name":"cobaltgreen"
  },
  {
    "value":"#F0FFF0",
    "name":"honeydew 1"
  },
  {
    "value":"#F0FFF0",
    "css":true,
    "name":"honeydew"
  },
  {
    "value":"#E0EEE0",
    "name":"honeydew 2"
  },
  {
    "value":"#C1CDC1",
    "name":"honeydew 3"
  },
  {
    "value":"#838B83",
    "name":"honeydew 4"
  },
  {
    "value":"#8FBC8F",
    "css":true,
    "name":"darkseagreen"
  },
  {
    "value":"#C1FFC1",
    "name":"darkseagreen 1"
  },
  {
    "value":"#B4EEB4",
    "name":"darkseagreen 2"
  },
  {
    "value":"#9BCD9B",
    "name":"darkseagreen 3"
  },
  {
    "value":"#698B69",
    "name":"darkseagreen 4"
  },
  {
    "value":"#98FB98",
    "css":true,
    "name":"palegreen"
  },
  {
    "value":"#9AFF9A",
    "name":"palegreen 1"
  },
  {
    "value":"#90EE90",
    "name":"palegreen 2"
  },
  {
    "value":"#90EE90",
    "css":true,
    "name":"lightgreen"
  },
  {
    "value":"#7CCD7C",
    "name":"palegreen 3"
  },
  {
    "value":"#548B54",
    "name":"palegreen 4"
  },
  {
    "value":"#32CD32",
    "css":true,
    "name":"limegreen"
  },
  {
    "value":"#228B22",
    "css":true,
    "name":"forestgreen"
  },
  {
    "value":"#00FF00",
    "vga":true,
    "name":"green 1"
  },
  {
    "value":"#00FF00",
    "vga":true,
    "css":true,
    "name":"lime"
  },
  {
    "value":"#00EE00",
    "name":"green 2"
  },
  {
    "value":"#00CD00",
    "name":"green 3"
  },
  {
    "value":"#008B00",
    "name":"green 4"
  },
  {
    "value":"#008000",
    "vga":true,
    "css":true,
    "name":"green"
  },
  {
    "value":"#006400",
    "css":true,
    "name":"darkgreen"
  },
  {
    "value":"#308014",
    "name":"sapgreen"
  },
  {
    "value":"#7CFC00",
    "css":true,
    "name":"lawngreen"
  },
  {
    "value":"#7FFF00",
    "name":"chartreuse 1"
  },
  {
    "value":"#7FFF00",
    "css":true,
    "name":"chartreuse"
  },
  {
    "value":"#76EE00",
    "name":"chartreuse 2"
  },
  {
    "value":"#66CD00",
    "name":"chartreuse 3"
  },
  {
    "value":"#458B00",
    "name":"chartreuse 4"
  },
  {
    "value":"#ADFF2F",
    "css":true,
    "name":"greenyellow"
  },
  {
    "value":"#CAFF70",
    "name":"darkolivegreen 1"
  },
  {
    "value":"#BCEE68",
    "name":"darkolivegreen 2"
  },
  {
    "value":"#A2CD5A",
    "name":"darkolivegreen 3"
  },
  {
    "value":"#6E8B3D",
    "name":"darkolivegreen 4"
  },
  {
    "value":"#556B2F",
    "css":true,
    "name":"darkolivegreen"
  },
  {
    "value":"#6B8E23",
    "css":true,
    "name":"olivedrab"
  },
  {
    "value":"#C0FF3E",
    "name":"olivedrab 1"
  },
  {
    "value":"#B3EE3A",
    "name":"olivedrab 2"
  },
  {
    "value":"#9ACD32",
    "name":"olivedrab 3"
  },
  {
    "value":"#9ACD32",
    "css":true,
    "name":"yellowgreen"
  },
  {
    "value":"#698B22",
    "name":"olivedrab 4"
  },
  {
    "value":"#FFFFF0",
    "name":"ivory 1"
  },
  {
    "value":"#FFFFF0",
    "css":true,
    "name":"ivory"
  },
  {
    "value":"#EEEEE0",
    "name":"ivory 2"
  },
  {
    "value":"#CDCDC1",
    "name":"ivory 3"
  },
  {
    "value":"#8B8B83",
    "name":"ivory 4"
  },
  {
    "value":"#F5F5DC",
    "css":true,
    "name":"beige"
  },
  {
    "value":"#FFFFE0",
    "name":"lightyellow 1"
  },
  {
    "value":"#FFFFE0",
    "css":true,
    "name":"lightyellow"
  },
  {
    "value":"#EEEED1",
    "name":"lightyellow 2"
  },
  {
    "value":"#CDCDB4",
    "name":"lightyellow 3"
  },
  {
    "value":"#8B8B7A",
    "name":"lightyellow 4"
  },
  {
    "value":"#FAFAD2",
    "css":true,
    "name":"lightgoldenrodyellow"
  },
  {
    "value":"#FFFF00",
    "vga":true,
    "name":"yellow 1"
  },
  {
    "value":"#FFFF00",
    "vga":true,
    "css":true,
    "name":"yellow"
  },
  {
    "value":"#EEEE00",
    "name":"yellow 2"
  },
  {
    "value":"#CDCD00",
    "name":"yellow 3"
  },
  {
    "value":"#8B8B00",
    "name":"yellow 4"
  },
  {
    "value":"#808069",
    "name":"warmgrey"
  },
  {
    "value":"#808000",
    "vga":true,
    "css":true,
    "name":"olive"
  },
  {
    "value":"#BDB76B",
    "css":true,
    "name":"darkkhaki"
  },
  {
    "value":"#FFF68F",
    "name":"khaki 1"
  },
  {
    "value":"#EEE685",
    "name":"khaki 2"
  },
  {
    "value":"#CDC673",
    "name":"khaki 3"
  },
  {
    "value":"#8B864E",
    "name":"khaki 4"
  },
  {
    "value":"#F0E68C",
    "css":true,
    "name":"khaki"
  },
  {
    "value":"#EEE8AA",
    "css":true,
    "name":"palegoldenrod"
  },
  {
    "value":"#FFFACD",
    "name":"lemonchiffon 1"
  },
  {
    "value":"#FFFACD",
    "css":true,
    "name":"lemonchiffon"
  },
  {
    "value":"#EEE9BF",
    "name":"lemonchiffon 2"
  },
  {
    "value":"#CDC9A5",
    "name":"lemonchiffon 3"
  },
  {
    "value":"#8B8970",
    "name":"lemonchiffon 4"
  },
  {
    "value":"#FFEC8B",
    "name":"lightgoldenrod 1"
  },
  {
    "value":"#EEDC82",
    "name":"lightgoldenrod 2"
  },
  {
    "value":"#CDBE70",
    "name":"lightgoldenrod 3"
  },
  {
    "value":"#8B814C",
    "name":"lightgoldenrod 4"
  },
  {
    "value":"#E3CF57",
    "name":"banana"
  },
  {
    "value":"#FFD700",
    "name":"gold 1"
  },
  {
    "value":"#FFD700",
    "css":true,
    "name":"gold"
  },
  {
    "value":"#EEC900",
    "name":"gold 2"
  },
  {
    "value":"#CDAD00",
    "name":"gold 3"
  },
  {
    "value":"#8B7500",
    "name":"gold 4"
  },
  {
    "value":"#FFF8DC",
    "name":"cornsilk 1"
  },
  {
    "value":"#FFF8DC",
    "css":true,
    "name":"cornsilk"
  },
  {
    "value":"#EEE8CD",
    "name":"cornsilk 2"
  },
  {
    "value":"#CDC8B1",
    "name":"cornsilk 3"
  },
  {
    "value":"#8B8878",
    "name":"cornsilk 4"
  },
  {
    "value":"#DAA520",
    "css":true,
    "name":"goldenrod"
  },
  {
    "value":"#FFC125",
    "name":"goldenrod 1"
  },
  {
    "value":"#EEB422",
    "name":"goldenrod 2"
  },
  {
    "value":"#CD9B1D",
    "name":"goldenrod 3"
  },
  {
    "value":"#8B6914",
    "name":"goldenrod 4"
  },
  {
    "value":"#B8860B",
    "css":true,
    "name":"darkgoldenrod"
  },
  {
    "value":"#FFB90F",
    "name":"darkgoldenrod 1"
  },
  {
    "value":"#EEAD0E",
    "name":"darkgoldenrod 2"
  },
  {
    "value":"#CD950C",
    "name":"darkgoldenrod 3"
  },
  {
    "value":"#8B6508",
    "name":"darkgoldenrod 4"
  },
  {
    "value":"#FFA500",
    "name":"orange 1"
  },
  {
    "value":"#FF8000",
    "css":true,
    "name":"orange"
  },
  {
    "value":"#EE9A00",
    "name":"orange 2"
  },
  {
    "value":"#CD8500",
    "name":"orange 3"
  },
  {
    "value":"#8B5A00",
    "name":"orange 4"
  },
  {
    "value":"#FFFAF0",
    "css":true,
    "name":"floralwhite"
  },
  {
    "value":"#FDF5E6",
    "css":true,
    "name":"oldlace"
  },
  {
    "value":"#F5DEB3",
    "css":true,
    "name":"wheat"
  },
  {
    "value":"#FFE7BA",
    "name":"wheat 1"
  },
  {
    "value":"#EED8AE",
    "name":"wheat 2"
  },
  {
    "value":"#CDBA96",
    "name":"wheat 3"
  },
  {
    "value":"#8B7E66",
    "name":"wheat 4"
  },
  {
    "value":"#FFE4B5",
    "css":true,
    "name":"moccasin"
  },
  {
    "value":"#FFEFD5",
    "css":true,
    "name":"papayawhip"
  },
  {
    "value":"#FFEBCD",
    "css":true,
    "name":"blanchedalmond"
  },
  {
    "value":"#FFDEAD",
    "name":"navajowhite 1"
  },
  {
    "value":"#FFDEAD",
    "css":true,
    "name":"navajowhite"
  },
  {
    "value":"#EECFA1",
    "name":"navajowhite 2"
  },
  {
    "value":"#CDB38B",
    "name":"navajowhite 3"
  },
  {
    "value":"#8B795E",
    "name":"navajowhite 4"
  },
  {
    "value":"#FCE6C9",
    "name":"eggshell"
  },
  {
    "value":"#D2B48C",
    "css":true,
    "name":"tan"
  },
  {
    "value":"#9C661F",
    "name":"brick"
  },
  {
    "value":"#FF9912",
    "name":"cadmiumyellow"
  },
  {
    "value":"#FAEBD7",
    "css":true,
    "name":"antiquewhite"
  },
  {
    "value":"#FFEFDB",
    "name":"antiquewhite 1"
  },
  {
    "value":"#EEDFCC",
    "name":"antiquewhite 2"
  },
  {
    "value":"#CDC0B0",
    "name":"antiquewhite 3"
  },
  {
    "value":"#8B8378",
    "name":"antiquewhite 4"
  },
  {
    "value":"#DEB887",
    "css":true,
    "name":"burlywood"
  },
  {
    "value":"#FFD39B",
    "name":"burlywood 1"
  },
  {
    "value":"#EEC591",
    "name":"burlywood 2"
  },
  {
    "value":"#CDAA7D",
    "name":"burlywood 3"
  },
  {
    "value":"#8B7355",
    "name":"burlywood 4"
  },
  {
    "value":"#FFE4C4",
    "name":"bisque 1"
  },
  {
    "value":"#FFE4C4",
    "css":true,
    "name":"bisque"
  },
  {
    "value":"#EED5B7",
    "name":"bisque 2"
  },
  {
    "value":"#CDB79E",
    "name":"bisque 3"
  },
  {
    "value":"#8B7D6B",
    "name":"bisque 4"
  },
  {
    "value":"#E3A869",
    "name":"melon"
  },
  {
    "value":"#ED9121",
    "name":"carrot"
  },
  {
    "value":"#FF8C00",
    "css":true,
    "name":"darkorange"
  },
  {
    "value":"#FF7F00",
    "name":"darkorange 1"
  },
  {
    "value":"#EE7600",
    "name":"darkorange 2"
  },
  {
    "value":"#CD6600",
    "name":"darkorange 3"
  },
  {
    "value":"#8B4500",
    "name":"darkorange 4"
  },
  {
    "value":"#FFA54F",
    "name":"tan 1"
  },
  {
    "value":"#EE9A49",
    "name":"tan 2"
  },
  {
    "value":"#CD853F",
    "name":"tan 3"
  },
  {
    "value":"#CD853F",
    "css":true,
    "name":"peru"
  },
  {
    "value":"#8B5A2B",
    "name":"tan 4"
  },
  {
    "value":"#FAF0E6",
    "css":true,
    "name":"linen"
  },
  {
    "value":"#FFDAB9",
    "name":"peachpuff 1"
  },
  {
    "value":"#FFDAB9",
    "css":true,
    "name":"peachpuff"
  },
  {
    "value":"#EECBAD",
    "name":"peachpuff 2"
  },
  {
    "value":"#CDAF95",
    "name":"peachpuff 3"
  },
  {
    "value":"#8B7765",
    "name":"peachpuff 4"
  },
  {
    "value":"#FFF5EE",
    "name":"seashell 1"
  },
  {
    "value":"#FFF5EE",
    "css":true,
    "name":"seashell"
  },
  {
    "value":"#EEE5DE",
    "name":"seashell 2"
  },
  {
    "value":"#CDC5BF",
    "name":"seashell 3"
  },
  {
    "value":"#8B8682",
    "name":"seashell 4"
  },
  {
    "value":"#F4A460",
    "css":true,
    "name":"sandybrown"
  },
  {
    "value":"#C76114",
    "name":"rawsienna"
  },
  {
    "value":"#D2691E",
    "css":true,
    "name":"chocolate"
  },
  {
    "value":"#FF7F24",
    "name":"chocolate 1"
  },
  {
    "value":"#EE7621",
    "name":"chocolate 2"
  },
  {
    "value":"#CD661D",
    "name":"chocolate 3"
  },
  {
    "value":"#8B4513",
    "name":"chocolate 4"
  },
  {
    "value":"#8B4513",
    "css":true,
    "name":"saddlebrown"
  },
  {
    "value":"#292421",
    "name":"ivoryblack"
  },
  {
    "value":"#FF7D40",
    "name":"flesh"
  },
  {
    "value":"#FF6103",
    "name":"cadmiumorange"
  },
  {
    "value":"#8A360F",
    "name":"burntsienna"
  },
  {
    "value":"#A0522D",
    "css":true,
    "name":"sienna"
  },
  {
    "value":"#FF8247",
    "name":"sienna 1"
  },
  {
    "value":"#EE7942",
    "name":"sienna 2"
  },
  {
    "value":"#CD6839",
    "name":"sienna 3"
  },
  {
    "value":"#8B4726",
    "name":"sienna 4"
  },
  {
    "value":"#FFA07A",
    "name":"lightsalmon 1"
  },
  {
    "value":"#FFA07A",
    "css":true,
    "name":"lightsalmon"
  },
  {
    "value":"#EE9572",
    "name":"lightsalmon 2"
  },
  {
    "value":"#CD8162",
    "name":"lightsalmon 3"
  },
  {
    "value":"#8B5742",
    "name":"lightsalmon 4"
  },
  {
    "value":"#FF7F50",
    "css":true,
    "name":"coral"
  },
  {
    "value":"#FF4500",
    "name":"orangered 1"
  },
  {
    "value":"#FF4500",
    "css":true,
    "name":"orangered"
  },
  {
    "value":"#EE4000",
    "name":"orangered 2"
  },
  {
    "value":"#CD3700",
    "name":"orangered 3"
  },
  {
    "value":"#8B2500",
    "name":"orangered 4"
  },
  {
    "value":"#5E2612",
    "name":"sepia"
  },
  {
    "value":"#E9967A",
    "css":true,
    "name":"darksalmon"
  },
  {
    "value":"#FF8C69",
    "name":"salmon 1"
  },
  {
    "value":"#EE8262",
    "name":"salmon 2"
  },
  {
    "value":"#CD7054",
    "name":"salmon 3"
  },
  {
    "value":"#8B4C39",
    "name":"salmon 4"
  },
  {
    "value":"#FF7256",
    "name":"coral 1"
  },
  {
    "value":"#EE6A50",
    "name":"coral 2"
  },
  {
    "value":"#CD5B45",
    "name":"coral 3"
  },
  {
    "value":"#8B3E2F",
    "name":"coral 4"
  },
  {
    "value":"#8A3324",
    "name":"burntumber"
  },
  {
    "value":"#FF6347",
    "name":"tomato 1"
  },
  {
    "value":"#FF6347",
    "css":true,
    "name":"tomato"
  },
  {
    "value":"#EE5C42",
    "name":"tomato 2"
  },
  {
    "value":"#CD4F39",
    "name":"tomato 3"
  },
  {
    "value":"#8B3626",
    "name":"tomato 4"
  },
  {
    "value":"#FA8072",
    "css":true,
    "name":"salmon"
  },
  {
    "value":"#FFE4E1",
    "name":"mistyrose 1"
  },
  {
    "value":"#FFE4E1",
    "css":true,
    "name":"mistyrose"
  },
  {
    "value":"#EED5D2",
    "name":"mistyrose 2"
  },
  {
    "value":"#CDB7B5",
    "name":"mistyrose 3"
  },
  {
    "value":"#8B7D7B",
    "name":"mistyrose 4"
  },
  {
    "value":"#FFFAFA",
    "name":"snow 1"
  },
  {
    "value":"#FFFAFA",
    "css":true,
    "name":"snow"
  },
  {
    "value":"#EEE9E9",
    "name":"snow 2"
  },
  {
    "value":"#CDC9C9",
    "name":"snow 3"
  },
  {
    "value":"#8B8989",
    "name":"snow 4"
  },
  {
    "value":"#BC8F8F",
    "css":true,
    "name":"rosybrown"
  },
  {
    "value":"#FFC1C1",
    "name":"rosybrown 1"
  },
  {
    "value":"#EEB4B4",
    "name":"rosybrown 2"
  },
  {
    "value":"#CD9B9B",
    "name":"rosybrown 3"
  },
  {
    "value":"#8B6969",
    "name":"rosybrown 4"
  },
  {
    "value":"#F08080",
    "css":true,
    "name":"lightcoral"
  },
  {
    "value":"#CD5C5C",
    "css":true,
    "name":"indianred"
  },
  {
    "value":"#FF6A6A",
    "name":"indianred 1"
  },
  {
    "value":"#EE6363",
    "name":"indianred 2"
  },
  {
    "value":"#8B3A3A",
    "name":"indianred 4"
  },
  {
    "value":"#CD5555",
    "name":"indianred 3"
  },
  {
    "value":"#A52A2A",
    "css":true,
    "name":"brown"
  },
  {
    "value":"#FF4040",
    "name":"brown 1"
  },
  {
    "value":"#EE3B3B",
    "name":"brown 2"
  },
  {
    "value":"#CD3333",
    "name":"brown 3"
  },
  {
    "value":"#8B2323",
    "name":"brown 4"
  },
  {
    "value":"#B22222",
    "css":true,
    "name":"firebrick"
  },
  {
    "value":"#FF3030",
    "name":"firebrick 1"
  },
  {
    "value":"#EE2C2C",
    "name":"firebrick 2"
  },
  {
    "value":"#CD2626",
    "name":"firebrick 3"
  },
  {
    "value":"#8B1A1A",
    "name":"firebrick 4"
  },
  {
    "value":"#FF0000",
    "vga":true,
    "name":"red 1"
  },
  {
    "value":"#FF0000",
    "vga":true,
    "css":true,
    "name":"red"
  },
  {
    "value":"#EE0000",
    "name":"red 2"
  },
  {
    "value":"#CD0000",
    "name":"red 3"
  },
  {
    "value":"#8B0000",
    "name":"red 4"
  },
  {
    "value":"#8B0000",
    "css":true,
    "name":"darkred"
  },
  {
    "value":"#800000",
    "vga":true,
    "css":true,
    "name":"maroon"
  },
  {
    "value":"#8E388E",
    "name":"sgi beet"
  },
  {
    "value":"#7171C6",
    "name":"sgi slateblue"
  },
  {
    "value":"#7D9EC0",
    "name":"sgi lightblue"
  },
  {
    "value":"#388E8E",
    "name":"sgi teal"
  },
  {
    "value":"#71C671",
    "name":"sgi chartreuse"
  },
  {
    "value":"#8E8E38",
    "name":"sgi olivedrab"
  },
  {
    "value":"#C5C1AA",
    "name":"sgi brightgray"
  },
  {
    "value":"#C67171",
    "name":"sgi salmon"
  },
  {
    "value":"#555555",
    "name":"sgi darkgray"
  },
  {
    "value":"#1E1E1E",
    "name":"sgi gray 12"
  },
  {
    "value":"#282828",
    "name":"sgi gray 16"
  },
  {
    "value":"#515151",
    "name":"sgi gray 32"
  },
  {
    "value":"#5B5B5B",
    "name":"sgi gray 36"
  },
  {
    "value":"#848484",
    "name":"sgi gray 52"
  },
  {
    "value":"#8E8E8E",
    "name":"sgi gray 56"
  },
  {
    "value":"#AAAAAA",
    "name":"sgi lightgray"
  },
  {
    "value":"#B7B7B7",
    "name":"sgi gray 72"
  },
  {
    "value":"#C1C1C1",
    "name":"sgi gray 76"
  },
  {
    "value":"#EAEAEA",
    "name":"sgi gray 92"
  },
  {
    "value":"#F4F4F4",
    "name":"sgi gray 96"
  },
  {
    "value":"#FFFFFF",
    "vga":true,
    "css":true,
    "name":"white"
  },
  {
    "value":"#F5F5F5",
    "name":"white smoke"
  },
  {
    "value":"#F5F5F5",
    "name":"gray 96"
  },
  {
    "value":"#DCDCDC",
    "css":true,
    "name":"gainsboro"
  },
  {
    "value":"#D3D3D3",
    "css":true,
    "name":"lightgrey"
  },
  {
    "value":"#C0C0C0",
    "vga":true,
    "css":true,
    "name":"silver"
  },
  {
    "value":"#A9A9A9",
    "css":true,
    "name":"darkgray"
  },
  {
    "value":"#808080",
    "vga":true,
    "css":true,
    "name":"gray"
  },
  {
    "value":"#696969",
    "css":true,
    "name":"dimgray"
  },
  {
    "value":"#696969",
    "name":"gray 42"
  },
  {
    "value":"#000000",
    "vga":true,
    "css":true,
    "name":"black"
  },
  {
    "value":"#FCFCFC",
    "name":"gray 99"
  },
  {
    "value":"#FAFAFA",
    "name":"gray 98"
  },
  {
    "value":"#F7F7F7",
    "name":"gray 97"
  },
  {
    "value":"#F2F2F2",
    "name":"gray 95"
  },
  {
    "value":"#F0F0F0",
    "name":"gray 94"
  },
  {
    "value":"#EDEDED",
    "name":"gray 93"
  },
  {
    "value":"#EBEBEB",
    "name":"gray 92"
  },
  {
    "value":"#E8E8E8",
    "name":"gray 91"
  },
  {
    "value":"#E5E5E5",
    "name":"gray 90"
  },
  {
    "value":"#E3E3E3",
    "name":"gray 89"
  },
  {
    "value":"#E0E0E0",
    "name":"gray 88"
  },
  {
    "value":"#DEDEDE",
    "name":"gray 87"
  },
  {
    "value":"#DBDBDB",
    "name":"gray 86"
  },
  {
    "value":"#D9D9D9",
    "name":"gray 85"
  },
  {
    "value":"#D6D6D6",
    "name":"gray 84"
  },
  {
    "value":"#D4D4D4",
    "name":"gray 83"
  },
  {
    "value":"#D1D1D1",
    "name":"gray 82"
  },
  {
    "value":"#CFCFCF",
    "name":"gray 81"
  },
  {
    "value":"#CCCCCC",
    "name":"gray 80"
  },
  {
    "value":"#C9C9C9",
    "name":"gray 79"
  },
  {
    "value":"#C7C7C7",
    "name":"gray 78"
  },
  {
    "value":"#C4C4C4",
    "name":"gray 77"
  },
  {
    "value":"#C2C2C2",
    "name":"gray 76"
  },
  {
    "value":"#BFBFBF",
    "name":"gray 75"
  },
  {
    "value":"#BDBDBD",
    "name":"gray 74"
  },
  {
    "value":"#BABABA",
    "name":"gray 73"
  },
  {
    "value":"#B8B8B8",
    "name":"gray 72"
  },
  {
    "value":"#B5B5B5",
    "name":"gray 71"
  },
  {
    "value":"#B3B3B3",
    "name":"gray 70"
  },
  {
    "value":"#B0B0B0",
    "name":"gray 69"
  },
  {
    "value":"#ADADAD",
    "name":"gray 68"
  },
  {
    "value":"#ABABAB",
    "name":"gray 67"
  },
  {
    "value":"#A8A8A8",
    "name":"gray 66"
  },
  {
    "value":"#A6A6A6",
    "name":"gray 65"
  },
  {
    "value":"#A3A3A3",
    "name":"gray 64"
  },
  {
    "value":"#A1A1A1",
    "name":"gray 63"
  },
  {
    "value":"#9E9E9E",
    "name":"gray 62"
  },
  {
    "value":"#9C9C9C",
    "name":"gray 61"
  },
  {
    "value":"#999999",
    "name":"gray 60"
  },
  {
    "value":"#969696",
    "name":"gray 59"
  },
  {
    "value":"#949494",
    "name":"gray 58"
  },
  {
    "value":"#919191",
    "name":"gray 57"
  },
  {
    "value":"#8F8F8F",
    "name":"gray 56"
  },
  {
    "value":"#8C8C8C",
    "name":"gray 55"
  },
  {
    "value":"#8A8A8A",
    "name":"gray 54"
  },
  {
    "value":"#878787",
    "name":"gray 53"
  },
  {
    "value":"#858585",
    "name":"gray 52"
  },
  {
    "value":"#828282",
    "name":"gray 51"
  },
  {
    "value":"#7F7F7F",
    "name":"gray 50"
  },
  {
    "value":"#7D7D7D",
    "name":"gray 49"
  },
  {
    "value":"#7A7A7A",
    "name":"gray 48"
  },
  {
    "value":"#787878",
    "name":"gray 47"
  },
  {
    "value":"#757575",
    "name":"gray 46"
  },
  {
    "value":"#737373",
    "name":"gray 45"
  },
  {
    "value":"#707070",
    "name":"gray 44"
  },
  {
    "value":"#6E6E6E",
    "name":"gray 43"
  },
  {
    "value":"#666666",
    "name":"gray 40"
  },
  {
    "value":"#636363",
    "name":"gray 39"
  },
  {
    "value":"#616161",
    "name":"gray 38"
  },
  {
    "value":"#5E5E5E",
    "name":"gray 37"
  },
  {
    "value":"#5C5C5C",
    "name":"gray 36"
  },
  {
    "value":"#595959",
    "name":"gray 35"
  },
  {
    "value":"#575757",
    "name":"gray 34"
  },
  {
    "value":"#545454",
    "name":"gray 33"
  },
  {
    "value":"#525252",
    "name":"gray 32"
  },
  {
    "value":"#4F4F4F",
    "name":"gray 31"
  },
  {
    "value":"#4D4D4D",
    "name":"gray 30"
  },
  {
    "value":"#4A4A4A",
    "name":"gray 29"
  },
  {
    "value":"#474747",
    "name":"gray 28"
  },
  {
    "value":"#454545",
    "name":"gray 27"
  },
  {
    "value":"#424242",
    "name":"gray 26"
  },
  {
    "value":"#404040",
    "name":"gray 25"
  },
  {
    "value":"#3D3D3D",
    "name":"gray 24"
  },
  {
    "value":"#3B3B3B",
    "name":"gray 23"
  },
  {
    "value":"#383838",
    "name":"gray 22"
  },
  {
    "value":"#363636",
    "name":"gray 21"
  },
  {
    "value":"#333333",
    "name":"gray 20"
  },
  {
    "value":"#303030",
    "name":"gray 19"
  },
  {
    "value":"#2E2E2E",
    "name":"gray 18"
  },
  {
    "value":"#2B2B2B",
    "name":"gray 17"
  },
  {
    "value":"#292929",
    "name":"gray 16"
  },
  {
    "value":"#262626",
    "name":"gray 15"
  },
  {
    "value":"#242424",
    "name":"gray 14"
  },
  {
    "value":"#212121",
    "name":"gray 13"
  },
  {
    "value":"#1F1F1F",
    "name":"gray 12"
  },
  {
    "value":"#1C1C1C",
    "name":"gray 11"
  },
  {
    "value":"#1A1A1A",
    "name":"gray 10"
  },
  {
    "value":"#171717",
    "name":"gray 9"
  },
  {
    "value":"#141414",
    "name":"gray 8"
  },
  {
    "value":"#121212",
    "name":"gray 7"
  },
  {
    "value":"#0F0F0F",
    "name":"gray 6"
  },
  {
    "value":"#0D0D0D",
    "name":"gray 5"
  },
  {
    "value":"#0A0A0A",
    "name":"gray 4"
  },
  {
    "value":"#080808",
    "name":"gray 3"
  },
  {
    "value":"#050505",
    "name":"gray 2"
  },
  {
    "value":"#030303",
    "name":"gray 1"
  },
  {
    "value":"#F5F5F5",
    "css":true,
    "name":"whitesmoke"
  }
]


/***/ }),

/***/ 697:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/**
 * Module dependencies
 */
var colors = __nccwpck_require__(7740)

var cssColors = colors.filter(function(color){
  return !! color.css
})

var vgaColors = colors.filter(function(color){
  return !! color.vga
})


/**
 * Get color value for a certain name.
 * @param name {String}
 * @return {String} Hex color value
 * @api public
 */

module.exports = function(name) {
  var color = module.exports.get(name)
  return color && color.value
}

/**
 * Get color object.
 *
 * @param name {String}
 * @return {Object} Color object
 * @api public
 */

module.exports.get = function(name) {
  name = name || ''
  name = name.trim().toLowerCase()
  return colors.filter(function(color){
    return color.name.toLowerCase() === name
  }).pop()
}

/**
 * Get all color object.
 *
 * @return {Array}
 * @api public
 */

module.exports.all = module.exports.get.all = function() {
 return colors
}

/**
 * Get color object compatible with CSS.
 *
 * @return {Array}
 * @api public
 */

module.exports.get.css = function(name) {
  if (!name) return cssColors
  name = name || ''
  name = name.trim().toLowerCase()
  return cssColors.filter(function(color){
    return color.name.toLowerCase() === name
  }).pop()
}



module.exports.get.vga = function(name) {
  if (!name) return vgaColors
  name = name || ''
  name = name.trim().toLowerCase()
  return vgaColors.filter(function(color){
    return color.name.toLowerCase() === name
  }).pop()
}


/***/ }),

/***/ 5917:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


var color = __nccwpck_require__(7177)
  , hex = __nccwpck_require__(7014);

/**
 * Generate a color for a given name. But be reasonably smart about it by
 * understanding name spaces and coloring each namespace a bit lighter so they
 * still have the same base color as the root.
 *
 * @param {string} namespace The namespace
 * @param {string} [delimiter] The delimiter
 * @returns {string} color
 */
module.exports = function colorspace(namespace, delimiter) {
  var split = namespace.split(delimiter || ':');
  var base = hex(split[0]);

  if (!split.length) return base;

  for (var i = 0, l = split.length - 1; i < l; i++) {
    base = color(base)
    .mix(color(hex(split[i + 1])))
    .saturate(1)
    .hex();
  }

  return base;
};


/***/ }),

/***/ 7529:
/***/ ((module) => {

"use strict";


/**
 * Simple abstraction to merge the awfully emitted `error` events for listening
 * to a callback.
 *
 * ```js
 * var app = require('net').createServer();
 * require('listening')(app, function (err) {
 *   .. handle listen errors here ..
 * });
 * ```
 *
 * @api public
 */
module.exports = function listen() {
  var args = Array.prototype.slice.call(arguments, 0)
    , server = args.shift()
    , fn = args.pop();

  /**
   * The actual callback method that is passed in to the server which collects
   * the different events and passes it to the given callback method.
   *
   * @param {Error}
   * @api private
   */
  function collector(err) {
    server.removeListener('error', collector);
    server.removeListener('listening', collector);

    if (fn) fn.apply(server, arguments);
    else if (err) throw err;
  }

  //
  // Allow people to supply the server with no callback function.
  //
  if ('function' !== typeof fn) {
    args.push(fn);
    fn = null;
  }

  server.once('listening', collector);
  server.once('error', collector);

  return server.listen.apply(server, args);
};


/***/ }),

/***/ 5485:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


var listen = __nccwpck_require__(7529)
  , parse = (__nccwpck_require__(7310).parse)
  , path = __nccwpck_require__(1017)
  , fs = __nccwpck_require__(7147);

/**
 * Get an accurate type check for the given Object.
 *
 * @param {Mixed} obj The object that needs to be detected.
 * @returns {String} The object type.
 * @api public
 */
function is(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
}

/**
 * Create a HTTP server.
 *
 * @param {Mixed} server Different ways of constructing a server.
 * @param {Object} fn Callback or callbacks.
 * @returns {Server} The created server.
 */
function create(server, fn) {
  var type = is(server)
    , options;

  if ('object' === type) options = server;
  else if ('number' === type) options = { port: server };
  else options = {};

  fn = create.fns(fn || options);

  var certs = options.key && options.cert       // Check HTTPS certs.
    , hostname = options.hostname               // Bind address.
    , port = options.port || 443                // Force HTTPS by default.
    , secure = certs || 443 === port            // Check for true HTTPS.
    , spdy = 'spdy' in options;                 // Or are we spdy.

  //
  // Determine which type of server we need to create.
  //
  if (spdy) type = 'spdy';
  else if (secure) type = 'https';
  else type = 'http';

  //
  // We need to have SSL certs for SPDY and secure servers.
  //
  if ((secure || spdy) && !certs) {
    throw new Error('Missing the SSL key or certificate files in the options.');
  }

  //
  // When given a `options.root` assume that our SSL certs and keys are path
  // references that still needs to be read. This allows a much more human
  // readable interface for SSL.
  //
  if (secure && options.root) {
    ['cert', 'key', 'ca', 'pfx', 'crl'].filter(function filter(key) {
      return key in options;
    }).forEach(function parse(key) {
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

  //
  // Provide additional protection for HTTPS server by supplying a safer cypher
  // set and prevent POODLE attacks on the servers.
  //
  if (secure) {
    //
    // Protection against POODLE attacks.
    //
    options.secureProtocol = options.secureProtocol || 'SSLv23_method';
    options.secureOptions = options.secureOptions || (__nccwpck_require__(2057).SSL_OP_NO_SSLv3);

    //
    // Optimized cipher list.
    //
    options.ciphers = options.ciphers || [
      'ECDHE-RSA-AES256-SHA384',
      'DHE-RSA-AES256-SHA384',
      'ECDHE-RSA-AES256-SHA256',
      'DHE-RSA-AES256-SHA256',
      'ECDHE-RSA-AES128-SHA256',
      'DHE-RSA-AES128-SHA256',
      'HIGH',
      '!aNULL',
      '!eNULL',
      '!EXPORT',
      '!DES',
      '!RC4',
      '!MD5',
      '!PSK',
      '!SRP',
      '!CAMELLIA'
    ].join(':');
  }

  //
  // Create the correct server instance and pass in the options object for those
  // who require it (spoiler: all non http servers).
  //
  server = (__nccwpck_require__(3685).createServer)('http' !== type ? options : undefined);

  //
  // Setup an addition redirect server which redirects people to the correct
  // HTTP or HTTPS server.
  //
  if (+options.redirect) {
    var redirect = (__nccwpck_require__(3685).createServer)(function handle(req, res) {
      res.statusCode = 404;

      if (req.headers.host) {
        var url = parse('http://'+ req.headers.host);

        res.statusCode = 301;
        res.setHeader(
          'Location',
          'http'+ (secure ? 's' : '') +'://'+ url.hostname +':'+ port + req.url
        );
      }

      if (secure) res.setHeader(
        'Strict-Transport-Security',
        'max-age=8640000; includeSubDomains'
      );

      res.end('');
    }).listen(+options.redirect, hostname);

    //
    // Close the redirect server when the main server is closed.
    //
    server.once('close', function close() {
      try { redirect.close(); }
      catch (e) {}
    });
  }

  //
  // Assign the last callbacks.
  //
  if (fn.close) server.once('close', fn.close);
  ['request', 'upgrade', 'error'].forEach(function each(event) {
    if (fn[event]) server.on(event, fn[event]);
  });

  //
  // Things are completed, call callback.
  //
  if (fn[type]) fn[type]();

  if (options.listen !== false) {
    listen(server, port, hostname, fn.listening);
  } else if (fn.listening) {
    server.once('listening', fn.listening);
  }

  return server;
}

/**
 * Create callbacks.
 *
 * @param {Object} fn Callback hooks.
 * @returns {Object} The callbacks
 * @api private
 */
create.fns = function fns(fn) {
  var callbacks = {};

  if ('function' === typeof fn) {
    callbacks.listening = fn;
    return callbacks;
  }

  [
    'close', 'request', 'listening', 'upgrade', 'error',
    'http', 'https', 'spdy'
  ].forEach(function each(name) {
    if ('function' !== typeof fn[name]) return;

    callbacks[name] = fn[name];
  });

  return callbacks;
};

//
// Expose the create server method.
//
module.exports = create;


/***/ }),

/***/ 4842:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var enabled = __nccwpck_require__(3495);

/**
 * Creates a new Adapter.
 *
 * @param {Function} fn Function that returns the value.
 * @returns {Function} The adapter logic.
 * @public
 */
module.exports = function create(fn) {
  return function adapter(namespace) {
    try {
      return enabled(namespace, fn());
    } catch (e) { /* Any failure means that we found nothing */ }

    return false;
  };
}


/***/ }),

/***/ 4357:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var adapter = __nccwpck_require__(4842);

/**
 * Extracts the values from process.env.
 *
 * @type {Function}
 * @public
 */
module.exports = adapter(function processenv() {
  return process.env.DEBUG || process.env.DIAGNOSTICS;
});


/***/ }),

/***/ 440:
/***/ ((module) => {

/**
 * Contains all configured adapters for the given environment.
 *
 * @type {Array}
 * @public
 */
var adapters = [];

/**
 * Contains all modifier functions.
 *
 * @typs {Array}
 * @public
 */
var modifiers = [];

/**
 * Our default logger.
 *
 * @public
 */
var logger = function devnull() {};

/**
 * Register a new adapter that will used to find environments.
 *
 * @param {Function} adapter A function that will return the possible env.
 * @returns {Boolean} Indication of a successful add.
 * @public
 */
function use(adapter) {
  if (~adapters.indexOf(adapter)) return false;

  adapters.push(adapter);
  return true;
}

/**
 * Assign a new log method.
 *
 * @param {Function} custom The log method.
 * @public
 */
function set(custom) {
  logger = custom;
}

/**
 * Check if the namespace is allowed by any of our adapters.
 *
 * @param {String} namespace The namespace that needs to be enabled
 * @returns {Boolean|Promise} Indication if the namespace is enabled by our adapters.
 * @public
 */
function enabled(namespace) {
  var async = [];

  for (var i = 0; i < adapters.length; i++) {
    if (adapters[i].async) {
      async.push(adapters[i]);
      continue;
    }

    if (adapters[i](namespace)) return true;
  }

  if (!async.length) return false;

  //
  // Now that we know that we Async functions, we know we run in an ES6
  // environment and can use all the API's that they offer, in this case
  // we want to return a Promise so that we can `await` in React-Native
  // for an async adapter.
  //
  return new Promise(function pinky(resolve) {
    Promise.all(
      async.map(function prebind(fn) {
        return fn(namespace);
      })
    ).then(function resolved(values) {
      resolve(values.some(Boolean));
    });
  });
}

/**
 * Add a new message modifier to the debugger.
 *
 * @param {Function} fn Modification function.
 * @returns {Boolean} Indication of a successful add.
 * @public
 */
function modify(fn) {
  if (~modifiers.indexOf(fn)) return false;

  modifiers.push(fn);
  return true;
}

/**
 * Write data to the supplied logger.
 *
 * @param {Object} meta Meta information about the log.
 * @param {Array} args Arguments for console.log.
 * @public
 */
function write() {
  logger.apply(logger, arguments);
}

/**
 * Process the message with the modifiers.
 *
 * @param {Mixed} message The message to be transformed by modifers.
 * @returns {String} Transformed message.
 * @public
 */
function process(message) {
  for (var i = 0; i < modifiers.length; i++) {
    message = modifiers[i].apply(modifiers[i], arguments);
  }

  return message;
}

/**
 * Introduce options to the logger function.
 *
 * @param {Function} fn Calback function.
 * @param {Object} options Properties to introduce on fn.
 * @returns {Function} The passed function
 * @public
 */
function introduce(fn, options) {
  var has = Object.prototype.hasOwnProperty;

  for (var key in options) {
    if (has.call(options, key)) {
      fn[key] = options[key];
    }
  }

  return fn;
}

/**
 * Nope, we're not allowed to write messages.
 *
 * @returns {Boolean} false
 * @public
 */
function nope(options) {
  options.enabled = false;
  options.modify = modify;
  options.set = set;
  options.use = use;

  return introduce(function diagnopes() {
    return false;
  }, options);
}

/**
 * Yep, we're allowed to write debug messages.
 *
 * @param {Object} options The options for the process.
 * @returns {Function} The function that does the logging.
 * @public
 */
function yep(options) {
  /**
   * The function that receives the actual debug information.
   *
   * @returns {Boolean} indication that we're logging.
   * @public
   */
  function diagnostics() {
    var args = Array.prototype.slice.call(arguments, 0);

    write.call(write, options, process(args, options));
    return true;
  }

  options.enabled = true;
  options.modify = modify;
  options.set = set;
  options.use = use;

  return introduce(diagnostics, options);
}

/**
 * Simple helper function to introduce various of helper methods to our given
 * diagnostics function.
 *
 * @param {Function} diagnostics The diagnostics function.
 * @returns {Function} diagnostics
 * @public
 */
module.exports = function create(diagnostics) {
  diagnostics.introduce = introduce;
  diagnostics.enabled = enabled;
  diagnostics.process = process;
  diagnostics.modify = modify;
  diagnostics.write = write;
  diagnostics.nope = nope;
  diagnostics.yep = yep;
  diagnostics.set = set;
  diagnostics.use = use;

  return diagnostics;
}


/***/ }),

/***/ 3190:
/***/ ((module) => {

/**
 * An idiot proof logger to be used as default. We've wrapped it in a try/catch
 * statement to ensure the environments without the `console` API do not crash
 * as well as an additional fix for ancient browsers like IE8 where the
 * `console.log` API doesn't have an `apply`, so we need to use the Function's
 * apply functionality to apply the arguments.
 *
 * @param {Object} meta Options of the logger.
 * @param {Array} messages The actuall message that needs to be logged.
 * @public
 */
module.exports = function (meta, messages) {
  //
  // So yea. IE8 doesn't have an apply so we need a work around to puke the
  // arguments in place.
  //
  try { Function.prototype.apply.call(console.log, console, messages); }
  catch (e) {}
}


/***/ }),

/***/ 9293:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var colorspace = __nccwpck_require__(5917);
var kuler = __nccwpck_require__(6287);

/**
 * Prefix the messages with a colored namespace.
 *
 * @param {Array} args The messages array that is getting written.
 * @param {Object} options Options for diagnostics.
 * @returns {Array} Altered messages array.
 * @public
 */
module.exports = function ansiModifier(args, options) {
  var namespace = options.namespace;
  var ansi = options.colors !== false
  ? kuler(namespace +':', colorspace(namespace))
  : namespace +':';

  args[0] = ansi +' '+ args[0];
  return args;
};


/***/ }),

/***/ 7498:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var create = __nccwpck_require__(440);
var tty = (__nccwpck_require__(6224).isatty)(1);

/**
 * Create a new diagnostics logger.
 *
 * @param {String} namespace The namespace it should enable.
 * @param {Object} options Additional options.
 * @returns {Function} The logger.
 * @public
 */
var diagnostics = create(function dev(namespace, options) {
  options = options || {};
  options.colors = 'colors' in options ? options.colors : tty;
  options.namespace = namespace;
  options.prod = false;
  options.dev = true;

  if (!dev.enabled(namespace) && !(options.force || dev.force)) {
    return dev.nope(options);
  }
  
  return dev.yep(options);
});

//
// Configure the logger for the given environment.
//
diagnostics.modify(__nccwpck_require__(9293));
diagnostics.use(__nccwpck_require__(4357));
diagnostics.set(__nccwpck_require__(3190));

//
// Expose the diagnostics logger.
//
module.exports = diagnostics;


/***/ }),

/***/ 685:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

//
// Select the correct build version depending on the environment.
//
if (process.env.NODE_ENV === 'production') {
  module.exports = __nccwpck_require__(4415);
} else {
  module.exports = __nccwpck_require__(7498);
}


/***/ }),

/***/ 4415:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var create = __nccwpck_require__(440);

/**
 * Create a new diagnostics logger.
 *
 * @param {String} namespace The namespace it should enable.
 * @param {Object} options Additional options.
 * @returns {Function} The logger.
 * @public
 */
var diagnostics = create(function prod(namespace, options) {
  options = options || {};
  options.namespace = namespace;
  options.prod = true;
  options.dev = false;

  if (!(options.force || prod.force)) return prod.nope(options);
  return prod.yep(options);
});

//
// Expose the diagnostics logger.
//
module.exports = diagnostics;


/***/ }),

/***/ 1043:
/***/ ((module) => {

"use strict";


/**
 * Returns a function that when invoked executes all the listeners of the
 * given event with the given arguments.
 *
 * @returns {Function} The function that emits all the things.
 * @api public
 */
module.exports = function emits() {
  var self = this
    , parser;

  for (var i = 0, l = arguments.length, args = new Array(l); i < l; i++) {
    args[i] = arguments[i];
  }

  //
  // If the last argument is a function, assume that it's a parser.
  //
  if ('function' !== typeof args[args.length - 1]) return function emitter() {
    for (var i = 0, l = arguments.length, arg = new Array(l); i < l; i++) {
      arg[i] = arguments[i];
    }

    return self.emit.apply(self, args.concat(arg));
  };

  parser = args.pop();

  /**
   * The actual function that emits the given event. It returns a boolean
   * indicating if the event was emitted.
   *
   * @returns {Boolean}
   * @api public
   */
  return function emitter() {
    for (var i = 0, l = arguments.length, arg = new Array(l + 1); i < l; i++) {
      arg[i + 1] = arguments[i];
    }

    /**
     * Async completion method for the parser.
     *
     * @param {Error} err Optional error when parsing failed.
     * @param {Mixed} returned Emit instructions.
     * @api private
     */
    arg[0] = function next(err, returned) {
      if (err) return self.emit('error', err);

      arg = returned === undefined
        ? arg.slice(1) : returned === null
          ? [] : returned;

      self.emit.apply(self, args.concat(arg));
    };

    parser.apply(self, arg);
    return true;
  };
};


/***/ }),

/***/ 3495:
/***/ ((module) => {

"use strict";


/**
 * Checks if a given namespace is allowed by the given variable.
 *
 * @param {String} name namespace that should be included.
 * @param {String} variable Value that needs to be tested.
 * @returns {Boolean} Indication if namespace is enabled.
 * @public
 */
module.exports = function enabled(name, variable) {
  if (!variable) return false;

  var variables = variable.split(/[\s,]+/)
    , i = 0;

  for (; i < variables.length; i++) {
    variable = variables[i].replace('*', '.*?');

    if ('-' === variable.charAt(0)) {
      if ((new RegExp('^'+ variable.substr(1) +'$')).test(name)) {
        return false;
      }

      continue;
    }

    if ((new RegExp('^'+ variable +'$')).test(name)) {
      return true;
    }
  }

  return false;
};


/***/ }),

/***/ 4819:
/***/ ((module) => {

"use strict";


var has = Object.prototype.hasOwnProperty;

/**
 * Gather environment variables from various locations.
 *
 * @param {Object} environment The default environment variables.
 * @returns {Object} environment.
 * @api public
 */
function env(environment) {
  environment = environment || {};

  if ('object' === typeof process && 'object' === typeof process.env) {
    env.merge(environment, process.env);
  }

  if ('undefined' !== typeof window) {
    if ('string' === window.name && window.name.length) {
      env.merge(environment, env.parse(window.name));
    }

    try {
      if (window.localStorage) {
        env.merge(environment, env.parse(window.localStorage.env || window.localStorage.debug));
      }
    } catch (e) {}

    if (
         'object' === typeof window.location
      && 'string' === typeof window.location.hash
      && window.location.hash.length
    ) {
      env.merge(environment, env.parse(window.location.hash.charAt(0) === '#'
        ? window.location.hash.slice(1)
        : window.location.hash
      ));
    }
  }

  //
  // Also add lower case variants to the object for easy access.
  //
  var key, lower;
  for (key in environment) {
    lower = key.toLowerCase();

    if (!(lower in environment)) {
      environment[lower] = environment[key];
    }
  }

  return environment;
}

/**
 * A poor man's merge utility.
 *
 * @param {Object} base Object where the add object is merged in.
 * @param {Object} add Object that needs to be added to the base object.
 * @returns {Object} base
 * @api private
 */
env.merge = function merge(base, add) {
  for (var key in add) {
    if (has.call(add, key)) {
      base[key] = add[key];
    }
  }

  return base;
};

/**
 * A poor man's query string parser.
 *
 * @param {String} query The query string that needs to be parsed.
 * @returns {Object} Key value mapped query string.
 * @api private
 */
env.parse = function parse(query) {
  var parser = /([^=?&]+)=([^&]*)/g
    , result = {}
    , part;

  if (!query) return result;

  for (;
    part = parser.exec(query);
    result[decodeURIComponent(part[1])] = decodeURIComponent(part[2])
  );

  return result.env || result;
};

//
// Expose the module
//
module.exports = env;


/***/ }),

/***/ 1848:
/***/ ((module) => {

"use strict";


var has = Object.prototype.hasOwnProperty
  , prefix = '~';

/**
 * Constructor to create a storage for our `EE` objects.
 * An `Events` instance is a plain object whose properties are event names.
 *
 * @constructor
 * @private
 */
function Events() {}

//
// We try to not inherit from `Object.prototype`. In some engines creating an
// instance in this way is faster than calling `Object.create(null)` directly.
// If `Object.create(null)` is not supported we prefix the event names with a
// character to make sure that the built-in object properties are not
// overridden or used as an attack vector.
//
if (Object.create) {
  Events.prototype = Object.create(null);

  //
  // This hack is needed because the `__proto__` property is still inherited in
  // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
  //
  if (!new Events().__proto__) prefix = false;
}

/**
 * Representation of a single event listener.
 *
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
 * @constructor
 * @private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Add a listener for a given event.
 *
 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} once Specify if the listener is a one-time listener.
 * @returns {EventEmitter}
 * @private
 */
function addListener(emitter, event, fn, context, once) {
  if (typeof fn !== 'function') {
    throw new TypeError('The listener must be a function');
  }

  var listener = new EE(fn, context || emitter, once)
    , evt = prefix ? prefix + event : event;

  if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
  else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
  else emitter._events[evt] = [emitter._events[evt], listener];

  return emitter;
}

/**
 * Clear event by name.
 *
 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
 * @param {(String|Symbol)} evt The Event name.
 * @private
 */
function clearEvent(emitter, evt) {
  if (--emitter._eventsCount === 0) emitter._events = new Events();
  else delete emitter._events[evt];
}

/**
 * Minimal `EventEmitter` interface that is molded against the Node.js
 * `EventEmitter` interface.
 *
 * @constructor
 * @public
 */
function EventEmitter() {
  this._events = new Events();
  this._eventsCount = 0;
}

/**
 * Return an array listing the events for which the emitter has registered
 * listeners.
 *
 * @returns {Array}
 * @public
 */
EventEmitter.prototype.eventNames = function eventNames() {
  var names = []
    , events
    , name;

  if (this._eventsCount === 0) return names;

  for (name in (events = this._events)) {
    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
  }

  if (Object.getOwnPropertySymbols) {
    return names.concat(Object.getOwnPropertySymbols(events));
  }

  return names;
};

/**
 * Return the listeners registered for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Array} The registered listeners.
 * @public
 */
EventEmitter.prototype.listeners = function listeners(event) {
  var evt = prefix ? prefix + event : event
    , handlers = this._events[evt];

  if (!handlers) return [];
  if (handlers.fn) return [handlers.fn];

  for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
    ee[i] = handlers[i].fn;
  }

  return ee;
};

/**
 * Return the number of listeners listening to a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Number} The number of listeners.
 * @public
 */
EventEmitter.prototype.listenerCount = function listenerCount(event) {
  var evt = prefix ? prefix + event : event
    , listeners = this._events[evt];

  if (!listeners) return 0;
  if (listeners.fn) return 1;
  return listeners.length;
};

/**
 * Calls each of the listeners registered for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Boolean} `true` if the event had listeners, else `false`.
 * @public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if (listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Add a listener for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  return addListener(this, event, fn, context, false);
};

/**
 * Add a one-time listener for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  return addListener(this, event, fn, context, true);
};

/**
 * Remove the listeners of a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn Only remove the listeners that match this function.
 * @param {*} context Only remove the listeners that have this context.
 * @param {Boolean} once Only remove one-time listeners.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return this;
  if (!fn) {
    clearEvent(this, evt);
    return this;
  }

  var listeners = this._events[evt];

  if (listeners.fn) {
    if (
      listeners.fn === fn &&
      (!once || listeners.once) &&
      (!context || listeners.context === context)
    ) {
      clearEvent(this, evt);
    }
  } else {
    for (var i = 0, events = [], length = listeners.length; i < length; i++) {
      if (
        listeners[i].fn !== fn ||
        (once && !listeners[i].once) ||
        (context && listeners[i].context !== context)
      ) {
        events.push(listeners[i]);
      }
    }

    //
    // Reset the array, or remove it completely if we have no more listeners.
    //
    if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
    else clearEvent(this, evt);
  }

  return this;
};

/**
 * Remove all listeners, or those of the specified event.
 *
 * @param {(String|Symbol)} [event] The event name.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  var evt;

  if (event) {
    evt = prefix ? prefix + event : event;
    if (this._events[evt]) clearEvent(this, evt);
  } else {
    this._events = new Events();
    this._eventsCount = 0;
  }

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Allow `EventEmitter` to be imported as module namespace.
//
EventEmitter.EventEmitter = EventEmitter;

//
// Expose the module.
//
if (true) {
  module.exports = EventEmitter;
}


/***/ }),

/***/ 5645:
/***/ ((module) => {

// 'use strict'; //<-- Root of all evil, causes thrown errors on readyOnly props.

var has = Object.prototype.hasOwnProperty
  , slice = Array.prototype.slice;

/**
 * Copy all readable properties from an Object or function and past them on the
 * object.
 *
 * @param {Object} obj The object we should paste everything on.
 * @returns {Object} obj
 * @api private
 */
function copypaste(obj) {
  var args = slice.call(arguments, 1)
    , i = 0
    , prop;

  for (; i < args.length; i++) {
    if (!args[i]) continue;

    for (prop in args[i]) {
      if (!has.call(args[i], prop)) continue;

      obj[prop] = args[i][prop];
    }
  }

  return obj;
}

/**
 * A proper mixin function that respects getters and setters.
 *
 * @param {Object} obj The object that should receive all properties.
 * @returns {Object} obj
 * @api private
 */
function mixin(obj) {
  if (
       'function' !== typeof Object.getOwnPropertyNames
    || 'function' !== typeof Object.defineProperty
    || 'function' !== typeof Object.getOwnPropertyDescriptor
  ) {
    return copypaste.apply(null, arguments);
  }

  //
  // We can safely assume that if the methods we specify above are supported
  // that it's also save to use Array.forEach for iteration purposes.
  //
  slice.call(arguments, 1).forEach(function forEach(o) {
    Object.getOwnPropertyNames(o).forEach(function eachAttr(attr) {
      Object.defineProperty(obj, attr, Object.getOwnPropertyDescriptor(o, attr));
    });
  });

  return obj;
}

/**
 * Detect if a given parent is constructed in strict mode so we can force the
 * child in to the same mode. It detects the strict mode by accessing properties
 * on the function that are forbidden in strict mode:
 *
 * - `caller`
 * - `callee`
 * - `arguments`
 *
 * Forcing the a thrown TypeError.
 *
 * @param {Function} parent Parent constructor
 * @returns {Function} The child constructor
 * @api private
 */
function mode(parent) {
  try {
    var e = parent.caller || parent.arguments || parent.callee;

    return function child() {
      return parent.apply(this, arguments);
    };
  } catch(e) {}

  return function child() {
    'use strict';

    return parent.apply(this, arguments);
  };
}

//
// Helper function to correctly set up the prototype chain, for subclasses.
// Similar to `goog.inherits`, but uses a hash of prototype properties and
// class properties to be extended.
//
module.exports = function extend(protoProps, staticProps) {
  var parent = this
    , child;

  //
  // The constructor function for the new subclass is either defined by you
  // (the "constructor" property in your `extend` definition), or defaulted
  // by us to simply call the parent's constructor.
  //
  if (protoProps && has.call(protoProps, 'constructor')) {
    child = protoProps.constructor;
  } else {
    child = mode(parent);
  }

  //
  // Set the prototype chain to inherit from `parent`, without calling
  // `parent`'s constructor function.
  //
  function Surrogate() {
    this.constructor = child;
  }

  Surrogate.prototype = parent.prototype;
  child.prototype = new Surrogate;

  //
  // Add prototype properties (instance properties) to the subclass,
  // if supplied.
  //
  if (protoProps) mixin(child.prototype, protoProps);

  //
  // Add static properties to the constructor function, if supplied.
  //
  copypaste(child, parent, staticProps);

  //
  // Set a convenience property in case the parent's prototype is needed later.
  //
  child.__super__ = parent.prototype;

  return child;
};


/***/ }),

/***/ 6578:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


var net = __nccwpck_require__(1808);

/**
 * Forwarded instance.
 *
 * @constructor
 * @param {String} ip The IP address.
 * @param {Number} port The port number.
 * @param {Boolean} secured The connection was secured.
 * @api private
 */
function Forwarded(ip, port, secured) {
  this.ip = ip || '127.0.0.1';
  this.secure = !!secured;
  this.port = +port || 0;
}

/**
 * List of possible proxy headers that should be checked for the original client
 * IP address and forwarded port.
 *
 * @type {Array}
 * @private
 */
var proxies = [
  {
    ip: 'fastly-client-ip',
    port: 'fastly-client-port', // Estimated guess, no standard header available.
    proto: 'fastly-ssl'
  },
  {
    ip: 'x-forwarded-for',
    port: 'x-forwarded-port',
    proto: 'x-forwarded-proto'
  }, {
    ip: 'z-forwarded-for',
    port: 'z-forwarded-port',   // Estimated guess, no standard header available.
    proto: 'z-forwarded-proto'  // Estimated guess, no standard header available.
  }, {
    ip: 'forwarded',
    port: 'forwarded-port',
    proto: 'forwarded-proto'    // Estimated guess, no standard header available.
  }, {
    ip: 'x-real-ip',
    port: 'x-real-port',        // Estimated guess, no standard header available.
    proto: 'x-real-proto'       // Estimated guess, no standard header available.
  }
];

/**
 * Search the headers for a possible match against a known proxy header.
 *
 * @param {Object} headers The received HTTP headers.
 * @param {Array} whitelist White list of proxies that should be checked.
 * @returns {Forwarded|Undefined} A Forwarded address object or nothing.
 * @api private
 */
function forwarded(headers, whitelist) {
  var parts, ports, port, proto, ips, ip, length = proxies.length, i = 0;

  for (; i < length; i++) {
    if (!(proxies[i].ip in headers)) continue;

    ports = (headers[proxies[i].port] || '').split(',');
    ips = (headers[proxies[i].ip] || '')
      .split(',')
      .map((entry, j) => {
        if (net.isIPv6(entry))
          return entry.trim();
        else {
          parts = entry.split(':');
            if (parts[1]) {
              ports.length = Math.max(j+1, ports.length);
              ports[j] = parts[1].trim();
            }
          return parts[0].trim();
        }
      });
    proto = (headers[proxies[i].proto] || 'http');

    //
    // As these headers can potentially be set by a 1337H4X0R we need to ensure
    // that all supplied values are valid IP addresses. If we receive a none
    // IP value inside the IP header field we are going to assume that this
    // header has been compromised and should be ignored
    //
    if (!ips || !ips.every(net.isIP)) return;

    port = ports.shift();   // Extract the first port as it's the "source" port.
    ip = ips.shift();       // Extract the first IP as it's the "source" IP.

    //
    // If we were given a white list, we need to ensure that the proxies that
    // we're given are known and allowed.
    //
    if (whitelist && whitelist.length && !ips.every(function every(ip) {
      return ~whitelist.indexOf(ip);
    })) return;

    //
    // Shift the most recently found proxy header to the front of the proxies
    // array. This optimizes future calls, placing the most commonly found headers
    // near the front of the array.
    //
    if (i !== 0) {
      proxies.unshift(proxies.splice(i, 1)[0]);
    }

    //
    // We've gotten a match on a HTTP header, we need to parse it further as it
    // could consist of multiple hops. The pattern for multiple hops is:
    //
    //   client, proxy, proxy, proxy, etc.
    //
    // So extracting the first IP should be sufficient. There are SSL
    // terminators like the once's that is used by `fastly.com` which set their
    // HTTPS header to `1` as an indication that the connection was secure.
    // (This reduces bandwidth)
    //
    return new Forwarded(ip, port, proto === '1' || proto === 'https');
  }
}

/**
 * Parse out the address information..
 *
 * @param {Object} obj A socket like object that could contain a `remoteAddress`.
 * @param {Object} headers The received HTTP headers.
 * @param {Array} whitelist White list
 * @returns {Forwarded} A Forwarded address object.
 * @api private
 */
function parse(obj, headers, whitelist) {
  var proxied = forwarded(headers || {}, whitelist)
    , connection = obj.connection
    , socket = connection
      ? connection.socket
      : obj.socket;

  //
  // We should always be testing for HTTP headers as remoteAddress would point
  // to proxies.
  //
  if (proxied) return proxied;

  // Check for the property on our given object.
  if ('object' === typeof obj) {
    if ('remoteAddress' in obj) {
      return new Forwarded(
        obj.remoteAddress,
        obj.remotePort,
        'secure' in obj ? obj.secure : obj.encrypted
      );
    }

    // Edge case for Socket.IO 0.9
    if ('object' === typeof obj.address && obj.address.address) {
      return new Forwarded(
        obj.address.address,
        obj.address.port,
        'secure' in obj ? obj.secure : obj.encrypted
      );
    }
  }

  if ('object' === typeof connection && 'remoteAddress' in connection) {
    return new Forwarded(
      connection.remoteAddress,
      connection.remotePort,
      'secure' in connection ? connection.secure : connection.encrypted
    );
  }

  if ('object' === typeof socket && 'remoteAddress' in socket) {
    return new Forwarded(
      socket.remoteAddress,
      socket.remoteAddress,
      'secure' in socket ? socket.secure : socket.encrypted
    );
  }

  return new Forwarded();
}

//
// Expose the module and all of it's interfaces.
//
parse.Forwarded = Forwarded;
parse.forwarded = forwarded;
parse.proxies = proxies;
module.exports = parse;


/***/ }),

/***/ 8327:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


var predefine = __nccwpck_require__(2074)
  , slice = Array.prototype.slice
  , emits = __nccwpck_require__(1043)
  , path = __nccwpck_require__(1017);

/**
 * Fuses the prototypes of two base classes in to one single class.
 *
 * @param {Function} Base Base function.
 * @param {Function} inherits The function where the base needs to inherit from.
 * @param {Object} options Configure how the inheritance is done.
 * @returns {Function} Base.
 * @api private
 */
module.exports = function fuse(Base, inherits, options) {
  options = options || {};

  if ('function' === typeof inherits) {
    Base.prototype.__proto__ = inherits.prototype;
  } else if ('object' === typeof inherits) {
    options = inherits;
    inherits = null;
  }

  /**
   * Add a new property to the prototype which is not enumerable but still
   * writable.
   *
   * @type {Function}
   * @public
   */
  Base.writable = predefine(Base.prototype, predefine.WRITABLE);

  /**
   * Add a new property to the prototype which is not enumerable but only
   * readable.
   *
   * @type {Function}
   * @public
   */
  Base.readable = predefine(Base.prototype, {
    configurable: false,
    enumerable: false,
    writable: false
  });

  /**
   * Add a new property to the prototype which is not enumerable but only
   * a getter.
   *
   * @type {Function}
   * @public
   */
  Base.get = function get(method, getter) {
    Object.defineProperty(Base.prototype, method, {
      configurable: false,
      enumerable: false,
      get: getter
    });

    return get;
  };

  /**
   * Add a new property to the prototype which is not enumerable but only
   * a getter and setter.
   *
   * @type {Function}
   * @public
   */
  Base.set = function set(method, getter, setter) {
    Object.defineProperty(Base.prototype, method, {
      configurable: false,
      enumerable: false,
      get: getter,
      set: setter
    });

    return set;
  };

  /**
   * Reset the constructor so it points to the Base class.
   *
   * @type {Function}
   * @api public
   */
  Base.writable('constructor', Base);

  /**
   * Spice up
   *
   * @api public
   */
  var fused = Base.prototype.fuse;
  Base.writable('fuse', function fuse(args) {
    var writable = predefine(this, predefine.WRITABLE);

    if (!this.writable) writable('writable', writable);
    if (!this.readable) writable('readable', predefine(this));

    if (fused) this.fuse = fused;

    //
    // Inheritance is optional, so only execute it when it's an actual function.
    //
    if ('function' === typeof inherits) {
      inherits.apply(this, args || arguments);
    }
  });

  /**
   * Make the Base class extendable using Backbone's .extend pattern.
   *
   * @type {Function}
   * @api public
   */
  Base.extend = predefine.extend;

  /**
   * Expose the predefine.
   *
   * @type {Function}
   * @api public
   */
  Base.predefine = predefine;

  //
  // Allow inheritance without adding additional default methods to the
  // prototype.
  //
  if (options.defaults === false) return Base;

  //
  // Inherit some methods from common module we use.
  //
  if (options.mixin !== false) Base.readable('mixin', predefine.mixin);
  if (options.merge !== false) Base.readable('merge', predefine.merge);
  if (options.emits !== false) Base.readable('emits', emits);

  return Base;
};


/***/ }),

/***/ 6287:
/***/ ((module) => {

"use strict";


/**
 * Kuler: Color text using CSS colors
 *
 * @constructor
 * @param {String} text The text that needs to be styled
 * @param {String} color Optional color for alternate API.
 * @api public
 */
function Kuler(text, color) {
  if (color) return (new Kuler(text)).style(color);
  if (!(this instanceof Kuler)) return new Kuler(text);

  this.text = text;
}

/**
 * ANSI color codes.
 *
 * @type {String}
 * @private
 */
Kuler.prototype.prefix = '\x1b[';
Kuler.prototype.suffix = 'm';

/**
 * Parse a hex color string and parse it to it's RGB equiv.
 *
 * @param {String} color
 * @returns {Array}
 * @api private
 */
Kuler.prototype.hex = function hex(color) {
  color = color[0] === '#' ? color.substring(1) : color;

  //
  // Pre-parse for shorthand hex colors.
  //
  if (color.length === 3) {
    color = color.split('');

    color[5] = color[2]; // F60##0
    color[4] = color[2]; // F60#00
    color[3] = color[1]; // F60600
    color[2] = color[1]; // F66600
    color[1] = color[0]; // FF6600

    color = color.join('');
  }

  var r = color.substring(0, 2)
    , g = color.substring(2, 4)
    , b = color.substring(4, 6);

  return [ parseInt(r, 16), parseInt(g, 16), parseInt(b, 16) ];
};

/**
 * Transform a 255 RGB value to an RGV code.
 *
 * @param {Number} r Red color channel.
 * @param {Number} g Green color channel.
 * @param {Number} b Blue color channel.
 * @returns {String}
 * @api public
 */
Kuler.prototype.rgb = function rgb(r, g, b) {
  var red = r / 255 * 5
    , green = g / 255 * 5
    , blue = b / 255 * 5;

  return this.ansi(red, green, blue);
};

/**
 * Turns RGB 0-5 values into a single ANSI code.
 *
 * @param {Number} r Red color channel.
 * @param {Number} g Green color channel.
 * @param {Number} b Blue color channel.
 * @returns {String}
 * @api public
 */
Kuler.prototype.ansi = function ansi(r, g, b) {
  var red = Math.round(r)
    , green = Math.round(g)
    , blue = Math.round(b);

  return 16 + (red * 36) + (green * 6) + blue;
};

/**
 * Marks an end of color sequence.
 *
 * @returns {String} Reset sequence.
 * @api public
 */
Kuler.prototype.reset = function reset() {
  return this.prefix +'39;49'+ this.suffix;
};

/**
 * Colour the terminal using CSS.
 *
 * @param {String} color The HEX color code.
 * @returns {String} the escape code.
 * @api public
 */
Kuler.prototype.style = function style(color) {
  return this.prefix +'38;5;'+ this.rgb.apply(this, this.hex(color)) + this.suffix + this.text + this.reset();
};


//
// Expose the actual interface.
//
module.exports = Kuler;


/***/ }),

/***/ 8899:
/***/ ((module) => {

"use strict";


var regex = new RegExp('^((?:\\d+)?\\.?\\d+) *('+ [
  'milliseconds?',
  'msecs?',
  'ms',
  'seconds?',
  'secs?',
  's',
  'minutes?',
  'mins?',
  'm',
  'hours?',
  'hrs?',
  'h',
  'days?',
  'd',
  'weeks?',
  'wks?',
  'w',
  'years?',
  'yrs?',
  'y'
].join('|') +')?$', 'i');

var second = 1000
  , minute = second * 60
  , hour = minute * 60
  , day = hour * 24
  , week = day * 7
  , year = day * 365;

/**
 * Parse a time string and return the number value of it.
 *
 * @param {String} ms Time string.
 * @returns {Number}
 * @api private
 */
module.exports = function millisecond(ms) {
  var type = typeof ms
    , amount
    , match;

  if ('number' === type) return ms;
  else if ('string' !== type || '0' === ms || !ms) return 0;
  else if (+ms) return +ms;

  //
  // We are vulnerable to the regular expression denial of service (ReDoS).
  // In order to mitigate this we don't parse the input string if it is too long.
  // See https://nodesecurity.io/advisories/46.
  //
  if (ms.length > 10000 || !(match = regex.exec(ms))) return 0;

  amount = parseFloat(match[1]);

  switch (match[2].toLowerCase()) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return amount * year;

    case 'weeks':
    case 'week':
    case 'wks':
    case 'wk':
    case 'w':
      return amount * week;

    case 'days':
    case 'day':
    case 'd':
      return amount * day;

    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return amount * hour;

    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return amount * minute;

    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return amount * second;

    default:
      return amount;
  }
};


/***/ }),

/***/ 2074:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


var toString = Object.prototype.toString;

/**
 * The properties that need should be on a valid description object. As defined
 * in the specification.
 *
 * @type {Object}
 * @private
 */
var description = {
  configurable: 'boolean',  // Property may be changed or deleted.
  enumerable: 'boolean',    // Shows up in enumeration of the properties.
  get: 'function',          // A function that serves as a getter.
  set: 'function',          // A function that serves as a setter.
  value: undefined,         // Value associated with the property.
  writable: 'boolean'       // Property may be changed using assignment.
};

/**
 * Check if a given object is valid as an descriptor.
 *
 * @param {Object} obj The object with a possible description.
 * @returns {Boolean}
 * @api public
 */
function descriptor(obj) {
  if (!obj || 'object' !== typeof obj || Array.isArray(obj)) return false;

  var keys = Object.keys(obj);

  //
  // A descriptor can only be a data or accessor descriptor, never both.
  // An data descriptor can only specify:
  //
  // - configurable
  // - enumerable
  // - (optional) value
  // - (optional) writable
  //
  // And an accessor descriptor can only specify;
  //
  // - configurable
  // - enumerable
  // - (optional) get
  // - (optional) set
  //
  if (
       ('value' in obj || 'writable' in obj)
    && ('function' === typeof obj.set || 'function' === typeof obj.get)
  ) return false;

  return !!keys.length && keys.every(function allowed(key) {
    var type = description[key]
      , valid = type === undefined || is(obj[key], type);

    return key in description && valid;
  });
}

/**
 * Get accurate type information for a given JavaScript thing.
 *
 * @param {Mixed} thing The thing we want to know.
 * @param {String} type The class
 * @returns {Boolean}
 * @api private
 */
function is(thing, type) {
  return toString.call(thing).toLowerCase().slice(8, -1) === type;
}

/**
 * Predefine, preconfigure an Object.defineProperty.
 *
 * @param {Object} obj The context, prototype or object we define on.
 * @param {Object} pattern The default description.
 * @param {Boolean} override Override the pattern.
 * @returns {Function} The function definition.
 * @api public
 */
function predefine(obj, pattern) {
  pattern = pattern || predefine.READABLE;

  return function predefined(method, description, clean) {
    //
    // If we are given a description compatible Object, use that instead of
    // setting it as value. This allows easy creation of getters and setters.
    //
    if (
         !predefine.descriptor(description)
      || is(description, 'object')
         && !clean
         && !predefine.descriptor(predefine.mixin({}, pattern, description))
    ) { description = {
        value: description
      };
    }

    //
    // Prevent thrown errors when we attempt to override a readonly
    // property
    //
    var described = Object.getOwnPropertyDescriptor(obj, method);
    if (described && !described.configurable) {
      return predefined;
    }

    Object.defineProperty(obj, method, !clean
      ? predefine.mixin({}, pattern, description)
      : description
    );

    return predefined;
  };
}

/**
 * Lazy initialization pattern.
 *
 * @param {Object} obj The object where we need to add lazy loading prop.
 * @param {String} prop The name of the property that should lazy load.
 * @param {Function} fn The function that returns the lazy laoded value.
 * @api public
 */
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
        value: value
      })[prop];
    }
  });
}

/**
 * A Object could override the `hasOwnProperty` method so we cannot blindly
 * trust the value of `obj.hasOwnProperty` so instead we get `hasOwnProperty`
 * directly from the Object.
 *
 * @type {Function}
 * @api private
 */
var has = Object.prototype.hasOwnProperty;

/**
 * Remove all enumerable properties from an given object.
 *
 * @param {Object} obj The object that needs cleaning.
 * @param {Array} keep Properties that should be kept.
 * @api public
 */
function remove(obj, keep) {
  if (!obj) return false;
  keep = keep || [];

  for (var prop in obj) {
    if (has.call(obj, prop) && !~keep.indexOf(prop)) {
      delete obj[prop];
    }
  }

  return true;
}

/**
 * Create a description that can be used for Object.create(null, definition) or
 * Object.defineProperties.
 *
 * @param {String} property The name of the property we are going to define.
 * @param {Object} description The object's description.
 * @param {Object} pattern Optional pattern that needs to be merged in.
 * @returns {Object} A object compatible with Object.create & defineProperties.
 */
function create(property, description, pattern) {
  pattern = pattern || {};

  if (!predefine.descriptor(description)) description = {
    enumberable: false,
    value: description
  };

  var definition = {};
  definition[property] = predefine.mixin(pattern, description);

  return definition;
}

/**
 * Mix multiple objects in to one single object that contains the properties of
 * all given objects. This assumes objects that are not nested deeply and it
 * correctly transfers objects that were created using `Object.defineProperty`.
 *
 * @returns {Object} target
 * @api public
 */
function mixin(target) {
  Array.prototype.slice.call(arguments, 1).forEach(function forEach(o) {
    Object.getOwnPropertyNames(o).forEach(function eachAttr(attr) {
      Object.defineProperty(target, attr, Object.getOwnPropertyDescriptor(o, attr));
    });
  });

  return target;
}
/**
 * Iterate over a collection. When you return false, it will stop the iteration.
 *
 * @param {Mixed} collection Either an Array or Object.
 * @param {Function} iterator Function to be called for each item.
 * @param {Mixed} context The context for the iterator.
 * @api public
 */
function each(collection, iterator, context) {
  if (arguments.length === 1) {
    iterator = collection;
    collection = this;
  }

  var isArray = Array.isArray(collection || this)
    , length = collection.length
    , i = 0
    , value;

  if (context) {
    if (isArray) {
      for (; i < length; i++) {
        value = iterator.apply(collection[ i ], context);
        if (value === false) break;
      }
    } else {
      for (i in collection) {
        value = iterator.apply(collection[ i ], context);
        if (value === false) break;
      }
    }
  } else {
    if (isArray) {
      for (; i < length; i++) {
        value = iterator.call(collection[i], i, collection[i]);
        if (value === false) break;
      }
    } else {
      for (i in collection) {
        value = iterator.call(collection[i], i, collection[i]);
        if (value === false) break;
      }
    }
  }

  return this;
}

/**
 * Merge in objects, deeply nested objects.
 *
 * @param {Object} target The object that receives the props.
 * @param {Object} additional Extra object that needs to be merged in the target.
 * @returns {Object} The first argument, target, which is fully merged.
 * @api public
 */
function merge(target, additional) {
  var result = target
    , undefined;

  if (Array.isArray(target)) {
    each(additional, function arrayForEach(index) {
      if (JSON.stringify(target).indexOf(JSON.stringify(additional[index])) === -1) {
        result.push(additional[index]);
      }
    });
  } else if ('object' === typeof target) {
    each(additional, function objectForEach(key, value) {
      if (target[key] === undefined) {
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

//
// Attach some convenience functions.
//
predefine.extend = __nccwpck_require__(5645);
predefine.descriptor = descriptor;
predefine.create = create;
predefine.remove = remove;
predefine.merge = merge;
predefine.mixin = mixin;
predefine.each = each;
predefine.lazy = lazy;

//
// Predefined description templates.
//
predefine.WRITABLE = {
  configurable: true,
  enumerable: false,
  writable: true
};

predefine.READABLE = {
  enumerable: false,
  writable: false
};

//
// Expose the module.
//
module.exports = predefine;


/***/ }),

/***/ 4116:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/**
 * Module dependencies.
 */

module.exports = __nccwpck_require__(4953);


/***/ }),

/***/ 7636:
/***/ ((module) => {

module.exports = function emitter() {
  'use strict';

  var toString = Object.prototype.toString
    , slice = Array.prototype.slice;

  /**
   * Check if the given `value` is an `Array`.
   *
   * @param {*} value The value to check
   * @return {Boolean}
   */

  var isArray = Array.isArray || function isArray(value) {
    return '[object Array]' === toString.call(value);
  };

  /**
   * Event packets.
   */

  var packets = {
    EVENT:  0,
    ACK:    1
  };

  /**
   * Initialize a new `Emitter`.
   *
   * @param {Primus|Spark} conn
   * @return {Emitter} `Emitter` instance
   * @api public
   */

  function Emitter(conn) {
    if (!(this instanceof Emitter)) return new Emitter(conn);
    this.ids = 1;
    this.acks = {};
    this.conn = conn;
    if (this.conn) this.bind();
  }

  /**
   * Bind `Emitter` events.
   *
   * @return {Emitter} self
   * @api private
   */

  Emitter.prototype.bind = function bind() {
    var em = this;
    this.conn.on('data', function ondata(packet) {
      em.ondata.call(em, packet);
    });
    return this;
  };

  /**
   * Called with incoming transport data.
   *
   * @param {Object} packet
   * @return {Emitter} self
   * @api private
   */

  Emitter.prototype.ondata = function ondata(packet) {
    if (!isArray(packet.data) || packet.id && 'number' !== typeof packet.id) {
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

  /**
   * Send a message to client.
   *
   * @return {Emitter} self
   * @api public
   */

  Emitter.prototype.send = function send() {
    var args = slice.call(arguments);
    this.conn.write(this.packet(args));
    return this;
  };

  /**
   * Prepare packet for emitting.
   *
   * @param {Array} arguments
   * @return {Object} packet
   * @api private
   */

  Emitter.prototype.packet = function pack(args) {
    var packet = { type: packets.EVENT, data: args };
    // access last argument to see if it's an ACK callback
    if ('function' === typeof args[args.length - 1]) {
      var id = this.ids++;
      this.acks[id] = args.pop();
      packet.id = id;
    }
    return packet;
  };

  /**
   * Called upon event packet.
   *
   * @param {Object} packet object
   * @return {Emitter} self
   * @api private
   */

  Emitter.prototype.onevent = function onevent(packet) {
    var args = packet.data;
    if (this.conn.reserved(args[0])) return this;
    if (packet.id) args.push(this.ack(packet.id));
    this.conn.emit.apply(this.conn, args);
    return this;
  };

  /**
   * Produces an ack callback to emit with an event.
   *
   * @param {Number} packet id
   * @return {Function}
   * @api private
   */

  Emitter.prototype.ack = function ack(id) {
    var conn = this.conn
      , sent = false;
    return function () {
      if (sent) return; // prevent double callbacks
      sent = true;
      conn.write({
        id: id,
        type: packets.ACK,
        data: slice.call(arguments)
      });
    };
  };

  /**
   * Called upon ack packet.
   *
   * @param {Object} packet object
   * @return {Emitter} self
   * @api private
   */

  Emitter.prototype.onack = function onack(packet) {
    var ack = this.acks[packet.id];
    if ('function' === typeof ack) {
      ack.apply(this, packet.data);
      delete this.acks[packet.id];
    }
    return this;
  };

  // Expose packets
  Emitter.packets = packets;

  return Emitter;
};


/***/ }),

/***/ 4953:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


/**
 * Module dependencies.
 */

var spark = __nccwpck_require__(1167)
  , emitter = __nccwpck_require__(7636)
  , Emitter = emitter()
  , noop = function () {};

/**
 * Export `PrimusEmitter`.
 */

module.exports = PrimusEmitter;

/**
 * Constructor.
 *
 * @param {Primus} primus The primus instance
 * @api public
 */

function PrimusEmitter(primus) {
  primus.$ = primus.$ || {};
  primus.$.emitter = {};
  primus.$.emitter.spark = spark;
  primus.$.emitter.emitter = emitter;
  primus.$.emitter.Emitter = Emitter;

  /**
   * Broadcast the message to all connections.
   *
   * @param {String} ev The event
   * @param {Mixed} [data] The data to broadcast
   * @param {Function} [fn] The callback function
   * @api public
   */

  primus.send = function send(ev, data, fn) {
    var args = arguments;
    primus.forEach(function each(spark) {
      spark.send.apply(spark, args);
    });

    return this;
  };

  return spark(primus.Spark, Emitter);
}

/**
 * Source code for plugin library.
 *
 * @type {String}
 * @api public
 */

PrimusEmitter.library = [
  ';(function (Primus, undefined) {',
    spark.toString(),
    emitter.toString(),
  ' if (undefined === Primus) return;',
  ' Primus.$ = Primus.$ || {};',
  ' Primus.$.emitter = {};',
  ' Primus.$.emitter.spark = spark;',
  ' Primus.$.emitter.emitter = emitter;',
  ' spark(Primus, emitter());',
  '})(Primus);'
].join('\n');

/**
 * Expose server.
 */

PrimusEmitter.server = PrimusEmitter;

/**
 * Expose client.
 */

PrimusEmitter.client = noop;

/**
 * Expose `spark` extend method.
 */

PrimusEmitter.spark = spark;

/**
 * Expose `Emitter`.
 */

PrimusEmitter.Emitter = Emitter;


/***/ }),

/***/ 1167:
/***/ ((module) => {

module.exports = function spark(Spark, Emitter) {
  'use strict';

  /**
   * `Primus#initialise` reference.
   */

  var initialise = Spark.prototype.initialise;

  /**
   * Initialise the Primus and setup all
   * parsers and internal listeners.
   *
   * @api private
   */

  Spark.prototype.initialise = function init() {
    if (!this.emitter) this.emitter = new Emitter(this);
    if (!this.__initialise) initialise.apply(this, arguments);
  };

  // Extend the Spark to add the send method. If `Spark.readable`
  // is not supported then we set the method on the prototype instead.
  if (!Spark.readable) Spark.prototype.send = send;
  else if (!Spark.prototype.send) Spark.readable('send', send);

  /**
   * Emits to this Spark.
   *
   * @param {String} ev The event
   * @param {Mixed} [data] The data to broadcast
   * @param {Function} [fn] The callback function
   * @return {Primus|Spark} this
   * @api public
   */

  function send(ev, data, fn) {
    /* jshint validthis: true */
    // ignore newListener event to avoid this error in node 0.8
    // https://github.com/cayasso/primus-emitter/issues/3
    if (/^(newListener|removeListener)/.test(ev)) return this;
    this.emitter.send.apply(this.emitter, arguments);
    return this;
  }
};


/***/ }),

/***/ 1175:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


var util = __nccwpck_require__(3837);

/**
 * Generic Primus error.
 *
 * @constructor
 * @param {String} message The reason for the error
 * @param {EventEmitter} logger Optional EventEmitter to emit a `log` event on.
 * @api public
 */
function PrimusError(message, logger) {
  Error.captureStackTrace(this, this.constructor);

  this.message = message;
  this.name = this.constructor.name;

  if (logger) {
    logger.emit('log', 'error', this);
  }
}

util.inherits(PrimusError, Error);

/**
 * There was an error while parsing incoming or outgoing data.
 *
 * @param {String} message The reason for the error.
 * @param {Spark} spark The spark that caused the error.
 * @api public
 */
function ParserError(message, spark) {
  Error.captureStackTrace(this, this.constructor);

  this.message = message;
  this.name = this.constructor.name;

  if (spark) {
    if (spark.listeners('error').length) spark.emit('error', this);
    spark.primus.emit('log', 'error', this);
  }
}

util.inherits(ParserError, Error);

//
// Expose our custom events.
//
exports.n = PrimusError;
exports.z = ParserError;


/***/ }),

/***/ 5480:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

function __ncc_wildcard$0 (arg) {
  if (arg === "binary.js" || arg === "binary") return __nccwpck_require__(7809);
  else if (arg === "ejson.js" || arg === "ejson") return __nccwpck_require__(9632);
  else if (arg === "json.js" || arg === "json") return __nccwpck_require__(6834);
  else if (arg === "msgpack.js" || arg === "msgpack") return __nccwpck_require__(3807);
}
'use strict';

var PrimusError = (__nccwpck_require__(1175)/* .PrimusError */ .n)
  , EventEmitter = __nccwpck_require__(1848)
  , Transformer = __nccwpck_require__(3688)
  , log = __nccwpck_require__(685)('primus')
  , Spark = __nccwpck_require__(6741)
  , fuse = __nccwpck_require__(8327)
  , fs = __nccwpck_require__(7147)
  , vm = __nccwpck_require__(6144);

/**
 * Primus is a universal wrapper for real-time frameworks that provides a common
 * interface for server and client interaction.
 *
 * @constructor
 * @param {HTTP.Server} server HTTP or HTTPS server instance.
 * @param {Object} options Configuration
 * @api public
 */
function Primus(server, options) {
  if (!(this instanceof Primus)) return new Primus(server, options);

  this.fuse();

  if ('object' !== typeof server) {
    var message = 'The first argument of the constructor must be ' +
      'an HTTP or HTTPS server instance';
    throw new PrimusError(message, this);
  }

  options = options || {};
  options.maxLength = options.maxLength || 10485760;  // Maximum allowed packet size.
  options.transport = options.transport || {};        // Transformer specific options.
  options.pingInterval = 'pingInterval' in options    // Heartbeat interval.
    ? options.pingInterval
    : 30000;

  if ('timeout' in options) {
    throw new PrimusError('The `timeout` option has been removed', this);
  }

  var primus = this
    , key;

  this.auth = options.authorization || null;  // Do we have an authorization handler.
  this.connections = Object.create(null);     // Connection storage.
  this.ark = Object.create(null);             // Plugin storage.
  this.layers = [];                           // Middleware layers.
  this.heartbeatInterval = null;              // The heartbeat interval.
  this.transformer = null;                    // Reference to the real-time engine instance.
  this.encoder = null;                        // Shorthand to the parser's encoder.
  this.decoder = null;                        // Shorthand to the parser's decoder.
  this.connected = 0;                         // Connection counter.
  this.whitelist = [];                        // Forwarded-for white listing.
  this.options = options;                     // The configuration.
  this.transformers = {                       // Message transformers.
    outgoing: [],
    incoming: []
  };

  this.server = server;
  this.pathname = 'string' === typeof options.pathname
    ? options.pathname.charAt(0) !== '/'
      ? '/'+ options.pathname
      : options.pathname
    : '/primus';

  //
  // Create a specification file with the information that people might need to
  // connect to the server.
  //
  this.spec = {
    pingInterval: options.pingInterval,
    pathname: this.pathname,
    version: this.version
  };

  //
  // Create a pre-bound Spark constructor. Doing a Spark.bind(Spark, this) doesn't
  // work as we cannot extend the constructor of it anymore. The added benefit of
  // approach listed below is that the prototype extensions are only applied to
  // the Spark of this Primus instance.
  //
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

  //
  // Copy over the original Spark static properties and methods so readable and
  // writable can also be used.
  //
  for (key in Spark) {
    this.Spark[key] = Spark[key];
  }

  this.parsers(options.parser);
  this.initialise(options.transformer, options);

  //
  // If the plugins are supplied through the options, also initialise them.
  // This also allows us to use plugins when creating a client constructor
  // with the `Primus.createSocket({})` method.
  //
  if ('string' === typeof options.plugin) {
    options.plugin.split(/[, ]+/).forEach(function register(name) {
      primus.plugin(name, name);
    });
  } else if ('object' === typeof options.plugin) {
    for (key in options.plugin) {
      this.plugin(key, options.plugin[key]);
    }
  }

  //
  // - Cluster node 0.10 lets the Operating System decide to which worker a request
  //   goes. This can result in a not even distribution where some workers are
  //   used at 10% while others at 90%. In addition to that the load balancing
  //   isn't sticky.
  //
  // - Cluster node 0.12 implements a custom round robin algorithm. This solves the
  //   not even distribution of work but it does not address our sticky session
  //   requirement.
  //
  // Projects like `sticky-session` attempt to implement sticky sessions but they
  // are using `net` server instead of a HTTP server in combination with the
  // remoteAddress of the connection to load balance. This does not work when you
  // address your servers behind a load balancer as the IP is set to the load
  // balancer, not the connecting clients. All in all, it only causes more
  // scalability problems. So we've opted-in to warn users about the
  // risks of using Primus in a cluster.
  //
  if (!options.iknowclusterwillbreakconnections && (__nccwpck_require__(5001).isWorker)) [
    '',
    'The `cluster` module does not implement sticky sessions. Learn more about',
    'this issue at:',
    '',
    'http://github.com/primus/primus#can-i-use-cluster',
    ''
  ].forEach(function warn(line) {
    console.error('Primus: '+ line);
  });
}

//
// Fuse and spice-up the Primus prototype with EventEmitter and predefine
// awesomeness.
//
fuse(Primus, EventEmitter);

//
// Lazy read the primus.js JavaScript client.
//
Object.defineProperty(Primus.prototype, 'client', {
  get: function read() {
    if (!read.primus) {
      read.primus = fs.readFileSync(__nccwpck_require__.ab + "primus.js", 'utf-8');
    }

    return read.primus;
  }
});

//
// Lazy compile the primus.js JavaScript client for Node.js
//
Object.defineProperty(Primus.prototype, 'Socket', {
  get: function () {
    const sandbox = Object.keys(global).reduce((acc, key) => {
      if (key !== 'global' && key !== 'require') acc[key] = global[key];
      return acc;
    }, {
      __dirname: process.cwd(),
      __filename: 'primus.js',
      require: require,

      //
      // The following globals are introduced so libraries that use `instanceof`
      // checks for type checking do not fail as the code is run in a new
      // context.
      //
      Uint8Array: Uint8Array,
      Object: Object,
      RegExp: RegExp,
      Array: Array,
      Error: Error,
      Date: Date
    });

    vm.runInNewContext(this.library(true), sandbox, { filename: 'primus.js' });
    return sandbox[this.options.global || 'Primus'];
  }
});

//
// Expose the current version number.
//
Primus.prototype.version = (__nccwpck_require__(5580)/* .version */ .i8);

//
// A list of supported transformers and the required Node.js modules.
//
Primus.transformers = __nccwpck_require__(4644);
Primus.parsers = __nccwpck_require__(4580);

/**
 * Simple function to output common errors.
 *
 * @param {String} what What is missing.
 * @param {Object} where Either Primus.parsers or Primus.transformers.
 * @returns {Object}
 * @api private
 */
Primus.readable('is', function is(what, where) {
  var missing = Primus.parsers !== where
      ? 'transformer'
      : 'parser'
    , dependency = where[what];

  return {
    missing: function write() {
      console.error('Primus:');
      console.error('Primus: Missing required npm dependency for '+ what);
      console.error('Primus: Please run the following command and try again:');
      console.error('Primus:');
      console.error('Primus:   npm install --save %s', dependency.server);
      console.error('Primus:');

      return 'Missing dependencies for '+ missing +': "'+ what + '"';
    },

    unknown: function write() {
      console.error('Primus:');
      console.error('Primus: Unsupported %s: "%s"', missing, what);
      console.error('Primus: We only support the following %ss:', missing);
      console.error('Primus:');
      console.error('Primus:   %s', Object.keys(where).join(', '));
      console.error('Primus:');

      return 'Unsupported '+ missing +': "'+ what +'"';
    }
  };
});

/**
 * Initialise the real-time engine that was chosen.
 *
 * @param {Mixed} Transformer The name of the transformer or a constructor;
 * @param {Object} options Options.
 * @api private
 */
Primus.readable('initialise', function initialise(Transformer, options) {
  Transformer = Transformer || 'websockets';

  var primus = this
    , transformer;

  if ('string' === typeof Transformer) {
    log('transformer `%s` is a string, attempting to resolve location', Transformer);
    Transformer = transformer = Transformer.toLowerCase();
    this.spec.transformer = transformer;

    //
    // This is a unknown transformer, it could be people made a typo.
    //
    if (!(Transformer in Primus.transformers)) {
      log('the supplied transformer %s is not supported, please use %s', transformer, Primus.transformers);
      throw new PrimusError(this.is(Transformer, Primus.transformers).unknown(), this);
    }

    try {
      Transformer = require('./transformers/'+ transformer);
      this.transformer = new Transformer(this);
    } catch (e) {
      if (e.code === 'MODULE_NOT_FOUND') {
        log('the supplied transformer `%s` is missing', transformer);
        throw new PrimusError(this.is(transformer, Primus.transformers).missing(), this);
      } else {
        log(e);
        throw e;
      }
    }
  } else {
    log('received a custom transformer');
    this.spec.transformer = 'custom';
  }

  if ('function' !== typeof Transformer) {
    throw new PrimusError('The given transformer is not a constructor', this);
  }

  this.transformer = this.transformer || new Transformer(this);

  this.on('connection', function connection(stream) {
    this.connected++;
    this.connections[stream.id] = stream;

    log('connection: %s currently serving %d concurrent', stream.id, this.connected);
  });

  this.on('disconnection', function disconnected(stream) {
    this.connected--;
    delete this.connections[stream.id];

    log('disconnection: %s currently serving %d concurrent', stream.id, this.connected);
  });

  //
  // Add our default middleware layers.
  //
  this.use('forwarded', __nccwpck_require__(1021));
  this.use('cors', __nccwpck_require__(604));
  this.use('primus.js', __nccwpck_require__(1366));
  this.use('spec', __nccwpck_require__(1940));
  this.use('x-xss', __nccwpck_require__(5300));
  this.use('no-cache', __nccwpck_require__(1221));
  this.use('authorization', __nccwpck_require__(1738));

  //
  // Set the heartbeat interval.
  //
  if (options.pingInterval) {
    this.heartbeatInterval = setInterval(
      this.heartbeat.bind(this),
      options.pingInterval
    );
  }

  //
  // Emit the initialised event after the next tick so we have some time to
  // attach listeners.
  //
  process.nextTick(function tock() {
    primus.emit('initialised', primus.transformer, primus.parser, options);
  });
});

/**
 * Add a new authorization handler.
 *
 * @param {Function} auth The authorization handler.
 * @returns {Primus}
 * @api public
 */
Primus.readable('authorize', function authorize(auth) {
  if ('function' !== typeof auth) {
    throw new PrimusError('Authorize only accepts functions', this);
  }

  if (auth.length < 2) {
    throw new PrimusError('Authorize function requires more arguments', this);
  }

  log('setting an authorization function');
  this.auth = auth;
  return this;
});

/**
 * Iterate over the connections.
 *
 * @param {Function} fn The function that is called every iteration.
 * @param {Function} done Optional callback, if you want to iterate asynchronously.
 * @returns {Primus}
 * @api public
 */
Primus.readable('forEach', function forEach(fn, done) {
  if (!done) {
    for (var id in this.connections) {
      if (fn(this.spark(id), id, this.connections) === false) break;
    }

    return this;
  }

  var ids = Object.keys(this.connections)
    , primus = this;

  log('iterating over %d connections', ids.length);

  function pushId(spark) {
    ids.push(spark.id);
  }

  //
  // We are going to iterate through the connections asynchronously so
  // we should handle new connections as they come in.
  //
  primus.on('connection', pushId);

  (function iterate() {
    var id = ids.shift()
      , spark;

    if (!id) {
      primus.removeListener('connection', pushId);
      return done();
    }

    spark = primus.spark(id);

    //
    // The connection may have already been closed.
    //
    if (!spark) return iterate();

    fn(spark, function next(err, forward) {
      if (err || forward === false) {
        primus.removeListener('connection', pushId);
        return done(err);
      }

      iterate();
    });
  }());

  return this;
});

/**
 * Send a ping packet to all clients to ensure that they are still connected.
 *
 * @returns {Primus}
 * @api private
 */
Primus.readable('heartbeat', function heartbeat() {
  this.forEach(function forEach(spark) {
    spark.heartbeat();
  });

  return this;
});

/**
 * Broadcast the message to all connections.
 *
 * @param {Mixed} data The data you want to send.
 * @returns {Primus}
 * @api public
 */
Primus.readable('write', function write(data) {
  this.forEach(function forEach(spark) {
    spark.write(data);
  });

  return this;
});

/**
 * Install message parsers.
 *
 * @param {Mixed} parser Parse name or parser Object.
 * @returns {Primus}
 * @api private
 */
Primus.readable('parsers', function parsers(parser) {
  parser = parser || 'json';

  if ('string' === typeof parser) {
    log('transformer `%s` is a string, attempting to resolve location', parser);
    parser = parser.toLowerCase();
    this.spec.parser = parser;

    //
    // This is a unknown parser, it could be people made a typo.
    //
    if (!(parser in Primus.parsers)) {
      log('the supplied parser `%s` is not supported please use %s', parser, Primus.parsers);
      throw new PrimusError(this.is(parser, Primus.parsers).unknown(), this);
    }

    try { parser = __ncc_wildcard$0(parser); }
    catch (e) {
      if (e.code === 'MODULE_NOT_FOUND') {
        log('the supplied parser `%s` is missing', parser);
        throw new PrimusError(this.is(parser, Primus.parsers).missing(), this);
      } else {
        log(e);
        throw e;
      }
    }
  } else {
    this.spec.parser = 'custom';
  }

  if ('object' !== typeof parser) {
    throw new PrimusError('The given parser is not an Object', this);
  }

  this.encoder = parser.encoder;
  this.decoder = parser.decoder;
  this.parser = parser;

  return this;
});

/**
 * Register a new message transformer. This allows you to easily manipulate incoming
 * and outgoing data which is particularity handy for plugins that want to send
 * meta data together with the messages.
 *
 * @param {String} type Incoming or outgoing
 * @param {Function} fn A new message transformer.
 * @returns {Primus}
 * @api public
 */
Primus.readable('transform', function transform(type, fn) {
  if (!(type in this.transformers)) {
    throw new PrimusError('Invalid transformer type', this);
  }

  if (~this.transformers[type].indexOf(fn)) {
    log('the %s message transformer already exists, not adding it', type);
    return this;
  }

  this.transformers[type].push(fn);
  return this;
});

/**
 * Gets a spark by its id.
 *
 * @param {String} id The spark's id.
 * @returns {Spark}
 * @api private
 */
Primus.readable('spark', function spark(id) {
  return this.connections[id];
});

/**
 * Generate a client library.
 *
 * @param {Boolean} nodejs Don't include the library, as we're running on Node.js.
 * @returns {String} The client library.
 * @api public
 */
Primus.readable('library', function compile(nodejs) {
  var library = [ !nodejs ? this.transformer.library : null ]
    , global = this.options.global || 'Primus'
    , parser = this.parser.library || ''
    , client = this.client;

  //
  // Add a simple export wrapper so it can be used as Node.js, AMD or browser
  // client.
  //
  client = [
    '(function UMDish(name, context, definition, plugins) {',
    '  context[name] = definition.call(context);',
    '  for (var i = 0; i < plugins.length; i++) {',
    '    plugins[i](context[name])',
    '  }',
    '  if (typeof module !== "undefined" && module.exports) {',
    '    module.exports = context[name];',
    '  } else if (typeof define === "function" && define.amd) {',
    '    define(function reference() { return context[name]; });',
    '  }',
    '})("'+ global +'", this || {}, function wrapper() {',
    '  var define, module, exports',
    '    , Primus = '+ client.slice(client.indexOf('return ') + 7, -4) +';',
    ''
  ].join('\n');

  //
  // Replace some basic content.
  //
  client = client
    .replace('null; // @import {primus::pathname}', '"'+ this.pathname.toString() +'"')
    .replace('null; // @import {primus::version}', '"'+ this.version +'"')
    .replace('null; // @import {primus::client}', this.transformer.client.toString())
    .replace('null; // @import {primus::auth}', (!!this.auth).toString())
    .replace('null; // @import {primus::encoder}', this.encoder.toString())
    .replace('null; // @import {primus::decoder}', this.decoder.toString());

  //
  // As we're given a `pingInterval` value on the server side, we need to update
  // the `pingTimeout` on the client.
  //
  if (this.options.pingInterval) {
    const value = this.options.pingInterval + Math.round(this.options.pingInterval / 2);

    log('updating the default value of the client `pingTimeout` option');
    client = client.replace(
      'options.pingTimeout : 45e3;',
      `options.pingTimeout : ${value};`
    );
  } else {
    log('setting the default value of the client `pingTimeout` option to `false`');
    client = client.replace(
      'options.pingTimeout : 45e3;',
      'options.pingTimeout : false;'
    );
  }

  //
  // Add the parser inside the closure, to prevent global leaking.
  //
  if (parser && parser.length) {
    log('adding parser to the client file');
    client += parser;
  }

  //
  // Iterate over the parsers, and register the client side plugins. If there's
  // a library bundled, add it the library array as there were some issues with
  // frameworks that get included in module wrapper as it forces strict mode.
  //
  var name, plugin;

  for (name in this.ark) {
    plugin = this.ark[name];
    name = JSON.stringify(name);

    if (plugin.library) {
      log('adding the library of the %s plugin to the client file', name);
      library.push(plugin.library);
    }

    if (!plugin.client) continue;

    log('adding the client code of the %s plugin to the client file', name);
    client += 'Primus.prototype.ark['+ name +'] = '+ plugin.client.toString() +';\n';
  }

  //
  // Close the export wrapper and return the client. If we need to add
  // a library, we should add them after we've created our closure and module
  // exports. Some libraries seem to fail hard once they are wrapped in our
  // closure so I'll rather expose a global variable instead of having to monkey
  // patch too much code.
  //
  return client + [
    '  return Primus;',
    '},',
    '['
  ].concat(library.filter(Boolean).map(function expose(library) {
    return [
      'function (Primus) {',
      library,
      '}'
    ].join('\n');
  }).join(',\n'))
  .concat(']);')
  .join('\n');
});

/**
 * Save the library to disk.
 *
 * @param {String} dir The location that we need to save the library.
 * @param {function} fn Optional callback, if you want an async save.
 * @returns {Primus}
 * @api public
 */
Primus.readable('save', function save(path, fn) {
  if (!fn) fs.writeFileSync(path, this.library(), 'utf-8');
  else fs.writeFile(path, this.library(), 'utf-8', fn);

  return this;
});

/**
 * Register a new Primus plugin.
 *
 * ```js
 * primus.plugin('ack', {
 *   //
 *   // Only ran on the server.
 *   //
 *   server: function (primus, options) {
 *      // do stuff
 *   },
 *
 *   //
 *   // Runs on the client, it's automatically bundled.
 *   //
 *   client: function (primus, options) {
 *      // do client stuff
 *   },
 *
 *   //
 *   // Optional library that needs to be bundled on the client (should be a string)
 *   //
 *   library: ''
 * });
 * ```
 *
 * @param {String} name The name of the plugin.
 * @param {Object} energon The plugin that contains client and server extensions.
 * @returns {Mixed}
 * @api public
 */
Primus.readable('plugin', function plugin(name, energon) {
  if (!name) return this.ark;

  if (!energon) {
    if ('string' === typeof name) return this.ark[name];
    if ('object' === typeof name) {
      energon = name;
      name = energon.name;
    }
  }

  if ('string' !== typeof name || !name) {
    throw new PrimusError('Plugin name must be a non empty string', this);
  }

  if ('string' === typeof energon) {
    log('plugin was passed as a string, attempting to require %s', energon);
    energon = require(energon);
  }

  //
  // Plugin accepts an object or a function only.
  //
  if (!/^(object|function)$/.test(typeof energon)) {
    throw new PrimusError('Plugin should be an object or function', this);
  }

  //
  // Plugin require a client, server or both to be specified in the object.
  //
  if (!energon.server && !energon.client) {
    throw new PrimusError('Plugin is missing a client or server function', this);
  }

  //
  // Don't allow duplicate plugins or plugin override as this is most likely
  // unintentional.
  //
  if (name in this.ark) {
    throw new PrimusError('Plugin name already defined', this);
  }

  log('adding %s as new plugin', name);
  this.ark[name] = energon;
  this.emit('plugin', name, energon);

  if (!energon.server) return this;

  log('calling the %s plugin\'s server code', name);
  energon.server.call(this, this, this.options);

  return this;
});

/**
 * Remove plugin from the ark.
 *
 * @param {String} name Name of the plugin we need to remove from the ark.
 * @returns {Boolean} Successful removal of the plugin.
 * @api public
 */
Primus.readable('plugout', function plugout(name) {
  if (!(name in this.ark)) return false;

  this.emit('plugout', name, this.ark[name]);
  delete this.ark[name];

  return true;
});

/**
 * Add a new middleware layer. If no middleware name has been provided we will
 * attempt to take the name of the supplied function. If that fails, well fuck,
 * just random id it.
 *
 * @param {String} name The name of the middleware.
 * @param {Function} fn The middleware that's called each time.
 * @param {Object} options Middleware configuration.
 * @param {Number} level 0 based optional index for the middleware.
 * @returns {Primus}
 * @api public
 */
Primus.readable('use', function use(name, fn, options, level) {
  if ('function' === typeof name) {
    level = options;
    options = fn;
    fn = name;
    name = fn.name || 'pid_'+ Date.now();
  }

  if (!level && 'number' === typeof options) {
    level = options;
    options = {};
  }

  options = options || {};

  //
  // No or only 1 argument means that we need to initialise the middleware, this
  // is a special initialisation process where we pass in a reference to the
  // initialised Primus instance so a pre-compiling process can be done.
  //
  if (fn.length < 2) {
    log('automatically configuring middleware `%s`', name);
    fn = fn.call(this, options);
  }

  //
  // Make sure that we have a function that takes at least 2 arguments.
  //
  if ('function' !== typeof fn || fn.length < 2) {
    throw new PrimusError('Middleware should be a function that accepts at least 2 args');
  }

  var layer = {
    length: fn.length,                // Amount of arguments indicates if it's async.
    enabled: true,                    // Middleware is enabled by default.
    name: name,                       // Used for lookups.
    fn: fn                            // The actual middleware.
  }, index = this.indexOfLayer(name);

  //
  // Override middleware layer if we already have a middleware layer with
  // exactly the same name.
  //
  if (!~index) {
    if (level >= 0 && level < this.layers.length) {
      log('adding middleware `%s` to the supplied index at %d', name, level);
      this.layers.splice(level, 0, layer);
    } else {
      this.layers.push(layer);
    }
  } else {
    this.layers[index] = layer;
  }

  return this;
});

/**
 * Remove a middleware layer from the stack.
 *
 * @param {String} name The name of the middleware.
 * @returns {Primus}
 * @api public
 */
Primus.readable('remove', function remove(name) {
  var index = this.indexOfLayer(name);

  if (~index) {
    log('removing middleware `%s`', name);
    this.layers.splice(index, 1);
  }

  return this;
});

/**
 * Enable a given middleware layer.
 *
 * @param {String} name The name of the middleware.
 * @returns {Primus}
 * @api public
 */
Primus.readable('enable', function enable(name) {
  var index = this.indexOfLayer(name);

  if (~index) {
    log('enabling middleware `%s`', name);
    this.layers[index].enabled = true;
  }
  return this;
});

/**
 * Disable a given middleware layer.
 *
 * @param {String} name The name of the middleware.
 * @returns {Primus}
 * @api public
 */
Primus.readable('disable', function disable(name) {
  var index = this.indexOfLayer(name);

  if (~index) {
    log('disabling middleware `%s`', name);
    this.layers[index].enabled = false;
  }

  return this;
});

/**
 * Find the index of a given middleware layer by name.
 *
 * @param {String} name The name of the layer.
 * @returns {Number}
 * @api private
 */
Primus.readable('indexOfLayer', function indexOfLayer(name) {
  for (var i = 0, length = this.layers.length; i < length; i++) {
    if (this.layers[i].name === name) return i;
  }

  return -1;
});

/**
 * Destroy the created Primus instance.
 *
 * Options:
 * - close (boolean) Close the given server.
 * - reconnect (boolean) Trigger a client-side reconnect.
 * - timeout (number) Close all active connections after x milliseconds.
 *
 * @param {Object} options Destruction instructions.
 * @param {Function} fn Callback.
 * @returns {Primus}
 * @api public
 */
Primus.readable('destroy', function destroy(options, fn) {
  if ('function' === typeof options) {
    fn = options;
    options = null;
  }

  options = options || {};
  if (options.reconnect) options.close = true;

  var primus = this;

  clearInterval(primus.heartbeatInterval);

  setTimeout(function close() {
    var transformer = primus.transformer;

    //
    // Ensure that the transformer receives the `close` event only once.
    //
    if (transformer) transformer.ultron.destroy();

    //
    // Close the connections that are left open.
    //
    primus.forEach(function shutdown(spark) {
      spark.end(undefined, { reconnect: options.reconnect });
    });

    if (options.close !== false) {
      //
      // Closing a server that isn't started yet would throw an error.
      //
      try {
        primus.server.close(function closed() {
          primus.close(options, fn);
        });
        return;
      }
      catch (e) {}
    }

    primus.close(options, fn);
  }, +options.timeout || 0);

  return this;
});

/**
 * Free resources after emitting a final `close` event.
 *
 * @param {Object} options Destruction instructions.
 * @param {Function} fn Callback.
 * @returns {Primus}
 * @api private
 */
Primus.readable('close', function close(options, fn) {
  var primus = this;
  //
  // Emit a final `close` event before removing all the listeners
  // from all the event emitters.
  //
  primus.asyncemit('close', options, function done(err) {
    if (err) {
      if (fn) return fn(err);
      throw err;
    }

    var transformer = primus.transformer
      , server = primus.server;

    //
    // If we don't have a server we are most likely destroying an already
    // destroyed Primus instance.
    //
    if (!server) return fn && fn();

    server.removeAllListeners('request');
    server.removeAllListeners('upgrade');

    //
    // Re-add the original listeners so that the server can be used again.
    //
    transformer.listeners('previous::request').forEach(function add(listener) {
      server.on('request', listener);
    });
    transformer.listeners('previous::upgrade').forEach(function add(listener) {
      server.on('upgrade', listener);
    });

    transformer.emit('close', options);
    transformer.removeAllListeners();

    primus.removeAllListeners();

    //
    // Null some potentially heavy objects to free some more memory instantly.
    //
    primus.transformers.outgoing.length = primus.transformers.incoming.length = 0;
    primus.transformer = primus.encoder = primus.decoder = primus.server = null;
    primus.connected = 0;

    primus.connections = Object.create(null);
    primus.ark = Object.create(null);

    if (fn) fn();
  });

  return this;
});

/**
 * Async emit an event. We make a really broad assumption here and that is they
 * have the same amount of arguments as the supplied arguments (excluding the
 * event name).
 *
 * @returns {Primus}
 * @api private
 */
Primus.readable('asyncemit', __nccwpck_require__(7667));

//
// Alias for destroy.
//
Primus.readable('end', Primus.prototype.destroy);

/**
 * Checks if the given event is an emitted event by Primus.
 *
 * @param {String} evt The event name.
 * @returns {Boolean}
 * @api public
 */
Primus.readable('reserved', function reserved(evt) {
  return (/^(incoming|outgoing)::/).test(evt)
  || evt in reserved.events;
});

/**
 * The actual events that are used by Primus.
 *
 * @type {Object}
 * @api public
 */
Primus.prototype.reserved.events = {
  'disconnection': 1,
  'initialised': 1,
  'connection': 1,
  'plugout': 1,
  'plugin': 1,
  'close': 1,
  'log': 1
};

/**
 * Add a createSocket interface so we can create a Server client with the
 * specified `transformer` and `parser`.
 *
 * ```js
 * var Socket = Primus.createSocket({ transformer: transformer, parser: parser })
 *   , socket = new Socket(url);
 * ```
 *
 * @param {Object} options The transformer / parser we need.
 * @returns {Socket}
 * @api public
 */
Primus.createSocket = function createSocket(options) {
  // Make sure the temporary Primus we create below doesn't start a heartbeat
  options = Object.assign({}, options, { pingInterval: false });

  var primus = new Primus(new EventEmitter(), options);
  return primus.Socket;
};

/**
 * Create a new Primus server.
 *
 * @param {Function} fn Request listener.
 * @param {Object} options Configuration.
 * @returns {Pipe}
 * @api public
 */
Primus.createServer = function createServer(fn, options) {
  if ('object' === typeof fn) {
    options = fn;
    fn = null;
  }

  options = options || {};

  var server = __nccwpck_require__(5485)(Primus.prototype.merge.call(Primus, {
    http: function warn() {
      if (!options.iknowhttpsisbetter) [
        '',
        'We\'ve detected that you\'re using a HTTP instead of a HTTPS server.',
        'Please be aware that real-time connections have less chance of being blocked',
        'by firewalls and anti-virus scanners if they are encrypted (using SSL). If',
        'you run your server behind a reverse and HTTPS terminating proxy ignore',
        'this message, if not, you\'ve been warned.',
        ''
      ].forEach(function each(line) {
        console.log('primus: '+ line);
      });
    }
  }, options));

  //
  // Now that we've got a server, we can setup the Primus and start listening.
  //
  var application = new Primus(server, options);

  if (fn) application.on('connection', fn);
  return application;
};

//
// Expose the constructors of our Spark and Transformer so it can be extended by
// a third party if needed.
//
Primus.Transformer = Transformer;
Primus.Spark = Spark;

//
// Expose the module.
//
module.exports = Primus;


/***/ }),

/***/ 604:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


var access = __nccwpck_require__(6007);

/**
 * Add Access-Control to each request.
 *
 * @returns {Function}
 * @api public
 */
module.exports = function configure() {
  var control = access(this.options);

  //
  // We don't add Access-Control headers for HTTP upgrades.
  //
  control.upgrade = false;

  return control;
};


/***/ }),

/***/ 1738:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


/**
 * Authorization middleware for Primus which would accept or deny requests.
 *
 * @returns {Function}
 * @api public
 */
module.exports = function configuration() {
  /**
   * The actual HTTP middleware.
   *
   * @param {Request} req HTTP request.
   * @param {Response} res HTTP response.
   * @param {Function} next Continuation.
   * @api private
   */
  return function client(req, res, next) {
    if ('function' !== typeof this.auth) return next();

    this.auth(req, function authorized(err) {
      if (!err) return next();

      var message = JSON.stringify({ error: err.message || err })
        , length = Buffer.byteLength(message)
        , code = err.statusCode || 401;

      //
      // We need to handle two cases here, authentication for regular HTTP
      // requests as well as authentication of WebSocket (upgrade) requests.
      //
      if (res.setHeader) {
        res.statusCode = code;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Length', length);

        if (code === 401 && err.authenticate) {
          res.setHeader('WWW-Authenticate', err.authenticate);
        }
      } else {
        res.write('HTTP/'+ req.httpVersion +' ');
        res.write(code +' '+ (__nccwpck_require__(3685).STATUS_CODES)[code] +'\r\n');
        res.write('Connection: close\r\n');
        res.write('Content-Type: application/json\r\n');
        res.write('Content-Length: '+ length +'\r\n');

        if (code === 401 && err.authenticate) {
          res.write('WWW-Authenticate: ' + err.authenticate + '\r\n');
        }

        res.write('\r\n');
      }

      res.end(message);
    });
  };
};


/***/ }),

/***/ 1485:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const http = __nccwpck_require__(3685);

/**
 * WARNING: this middleware is only used internally and does not follow the
 * pattern of the other middleware. You should not use it.
 *
 * Handle async middleware errors.
 *
 * @param {Error} err Error returned by the middleware.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @api private
 */
module.exports = function error(err, req, res) {
  const message = JSON.stringify({ error: err.message || err });
  const length = Buffer.byteLength(message);
  const code = err.statusCode || 500;

  //
  // As in the authorization middleware we need to handle two cases here:
  // regular HTTP requests and upgrade requests.
  //
  if (res.setHeader) {
    res.statusCode = code;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Length', length);

    return res.end(message);
  }

  res.write(
    `HTTP/${req.httpVersion} ${code} ${http.STATUS_CODES[code]}\r\n` +
      'Connection: close\r\n' +
      'Content-Type: application/json\r\n' +
      `Content-Length: ${length}\r\n\r\n` +
      message
  );
  res.destroy();
};


/***/ }),

/***/ 1021:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


var forwarded = __nccwpck_require__(6578);

/**
 * Add the `forwarded` property.
 *
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @api private
 */
module.exports = function configure() {
  var primus = this;

  return function ipaddress(req, res) {
    req.forwarded = forwarded(req, req.headers || {}, primus.whitelist);
  };
};


/***/ }),

/***/ 1221:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


var setHeader = __nccwpck_require__(4461);

/**
 * Forcefully add no-cache headers to HTTP responses.
 *
 * @param {Request} req The incoming HTTP request.
 * @param {Response} res The outgoing HTTP response.
 * @api public
 */
function nocache(req, res) {
  setHeader(res, 'Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  setHeader(res, 'Pragma', 'no-cache');
}

//
// We don't need no-cache headers for HTTP upgrades.
//
nocache.upgrade = false;

//
// Expose the module.
//
module.exports = nocache;


/***/ }),

/***/ 1366:
/***/ ((module) => {

"use strict";


/**
 * Serve the client library that is shipped and compiled within Primus.
 *
 * @returns {Function}
 * @api public
 */
module.exports = function configure() {
  var primusjs = this.pathname +'/primus.js'
    , primus = this
    , library
    , length;

  /**
   * The actual HTTP middleware.
   *
   * @param {Request} req HTTP request.
   * @param {Response} res HTTP response.
   * @api private
   */
  function client(req, res) {
    if (req.uri.pathname !== primusjs) return;

    //
    // Lazy include and compile the library so we give our server some time to
    // add plugins or we will compile the client library without plugins, which
    // is sad :(
    //
    library = library || Buffer.from(primus.library());
    length = length || library.length;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
    res.setHeader('Content-Length', length);
    res.end(library);

    return true;
  }

  //
  // We don't serve our client-side library over HTTP upgrades.
  //
  client.upgrade = false;

  return client;
};


/***/ }),

/***/ 1940:
/***/ ((module) => {

"use strict";


/**
 * Answer HTTP requests with the server specification when requested.
 *
 * @returns {Function}
 * @api public
 */
module.exports = function configure() {
  var specification = this.pathname +'/spec'
    , primus = this;

  /**
   * The actual HTTP middleware.
   *
   * @param {Request} req HTTP request.
   * @param {Response} res HTTP response.
   * @api private
   */
  function spec(req, res) {
    if (req.uri.pathname !== specification) return;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(primus.spec));

    return true;
  }

  //
  // Don't run a specification test for HTTP upgrades.
  //
  spec.upgrade = false;

  return spec;
};


/***/ }),

/***/ 5300:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


var setHeader = __nccwpck_require__(4461);

/**
 * Forcefully add x-xss-protection headers.
 *
 * @param {Request} req The incoming HTTP request.
 * @param {Response} res The outgoing HTTP response.
 * @api public
 */
function xss(req, res) {
  var agent = (req.headers['user-agent'] || '').toLowerCase();

  if (agent && (~agent.indexOf(';msie') || ~agent.indexOf('trident/'))) {
    setHeader(res, 'X-XSS-Protection', '0');
  }
}

//
// We don't need protection headers for HTTP upgrades.
//
xss.upgrade = false;

//
// Expose the module.
//
module.exports = xss;


/***/ }),

/***/ 7809:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


const BinaryPack = __nccwpck_require__(2427);

/**
 * Message encoder.
 *
 * @param {Mixed} data The data that needs to be transformed.
 * @param {Function} fn Completion callback.
 * @api public
 */
exports.encoder = function encoder(data, fn) {
  var err;

  try { data = BinaryPack.pack(data); }
  catch (e) { err = e; }

  fn(err, data);
};

/**
 * Message decoder.
 *
 * @param {Mixed} data The data that needs to be transformed.
 * @param {Function} fn Completion callback.
 * @api public
 */
exports.decoder = function decoder(data, fn) {
  var err;

  try { data = BinaryPack.unpack(data); }
  catch (e) { err = e; }

  fn(err, data);
};

//
// Expose the library so it can be added in our Primus module.
//
exports.library = `var BinaryPack = (function () {
  var exports, bp;

  try { bp = Primus.requires('binary-pack'); }
  catch (e) {}

  if (bp) return bp;

  exports = {};
  (function () {
    ${BinaryPack.BrowserSource}
  }).call(exports);
  return exports.BinaryPack;
})();
`;


/***/ }),

/***/ 9632:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


var EJSON = __nccwpck_require__(9374);

/**
 * Message encoder.
 *
 * @param {Mixed} data The data that needs to be transformed into a string.
 * @param {Function} fn Completion callback.
 * @api public
 */
exports.encoder = function encoder(data, fn) {
  var err;

  try { data = EJSON.stringify(data); }
  catch (e) { err = e; }

  fn(err, data);
};

/**
 * Message decoder.
 *
 * @param {Mixed} data The data that needs to be parsed from a string.
 * @param {Function} fn Completion callback.
 * @api public
 */
exports.decoder = function decoder(data, fn) {
  var err;

  try { data = EJSON.parse(data); }
  catch (e) { err = e; }

  fn(err, data);
};

//
// Expose the library which is compiled for global consumption instead of
// browserify.
//
exports.library = __nccwpck_require__(7778);


/***/ }),

/***/ 6834:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


/**
 * Message encoder.
 *
 * @param {Mixed} data The data that needs to be transformed into a string.
 * @param {Function} fn Completion callback.
 * @api public
 */
exports.encoder = function encoder(data, fn) {
  var err;

  try { data = JSON.stringify(data); }
  catch (e) { err = e; }

  fn(err, data);
};

/**
 * Message decoder.
 *
 * @param {Mixed} data The data that needs to be parsed from a string.
 * @param {Function} fn Completion callback.
 * @api public
 */
exports.decoder = function decoder(data, fn) {
  var err;

  if ('string' !== typeof data) return fn(err, data);

  try { data = JSON.parse(data); }
  catch (e) { err = e; }

  fn(err, data);
};


/***/ }),

/***/ 3807:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


const msgpack = __nccwpck_require__(7787);

/**
 * Message encoder.
 *
 * @param {Mixed} data The data that needs to be transformed.
 * @param {Function} fn Completion callback.
 * @api public
 */
exports.encoder = function encoder(data, fn) {
  var err;

  try { data = msgpack.encode(data); }
  catch (e) { err = e; }

  fn(err, data);
};

/**
 * Message decoder.
 *
 * @param {Mixed} data The data that needs to be transformed.
 * @param {Function} fn Completion callback.
 * @api public
 */
exports.decoder = function decoder(data, fn) {
  var err;

  try {
    data = msgpack.decode(data instanceof ArrayBuffer ? new Uint8Array(data) : data);
  } catch (e) {
    err = e;
  }

  fn(err, data);
};

//
// Expose the library so it can be added in our Primus module.
//
exports.library = `var msgpack = (function () {
  var exports, mp;

  try { mp = Primus.requires('primus-msgpack'); }
  catch (e) {}

  if (mp) return mp;

  exports = {};
  ${msgpack.BrowserSource}
  return exports.msgpack;
})();
`;


/***/ }),

/***/ 6741:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


var ParserError = (__nccwpck_require__(1175)/* .ParserError */ .z)
  , log = __nccwpck_require__(685)('primus:spark')
  , parse = (__nccwpck_require__(3477).parse)
  , forwarded = __nccwpck_require__(6578)
  , nanoid = (__nccwpck_require__(7592).nanoid)
  , Ultron = __nccwpck_require__(4328)
  , fuse = __nccwpck_require__(8327)
  , u2028 = /\u2028/g
  , u2029 = /\u2029/g;

/**
 * The Spark is an indefinable, indescribable energy or soul of a transformer
 * which can be used to create new transformers. In our case, it's a simple
 * wrapping interface.
 *
 * @constructor
 * @param {Primus} primus Reference to the Primus server. (Set using .bind)
 * @param {Object} headers The request headers for this connection.
 * @param {Object} address The object that holds the remoteAddress and port.
 * @param {Object} query The query string of request.
 * @param {String} id An optional id of the socket, or we will generate one.
 * @param {Request} request The HTTP Request instance that initialised the spark.
 * @param {Mixed} socket Reference to the transformer socket.
 * @api public
 */
function Spark(primus, headers, address, query, id, request, socket) {
  this.fuse();

  var writable = this.writable
    , spark = this
    , idgen = primus.options.idGenerator;

  query = query || {};
  id = idgen ? idgen() : (id || nanoid());
  headers = headers || {};
  address = address || {};
  request = request || headers['primus::req::backup'];

  writable('id', id);                   // Unique id for socket.
  writable('primus', primus);           // References to Primus.
  writable('remote', address);          // The remote address location.
  writable('headers', headers);         // The request headers.
  writable('request', request);         // Reference to an HTTP request.
  writable('socket', socket);           // Reference to the transformer's socket
  writable('writable', true);           // Silly stream compatibility.
  writable('readable', true);           // Silly stream compatibility.
  writable('queue', []);                // Data queue for data events.
  writable('query', query);             // The query string.
  writable('ultron', new Ultron(this)); // Our event listening cleanup.
  writable('alive', true);              // Flag used to detect zombie sparks.

  //
  // Parse our query string.
  //
  if ('string' === typeof this.query) {
    this.query = parse(this.query);
  }

  this.__initialise.forEach(function execute(initialise) {
    initialise.call(spark);
  });
}

fuse(Spark, __nccwpck_require__(2781), { merge: false, mixin: false });

//
// Internal readyState's to prevent writes against close sockets.
//
Spark.OPENING = 1;    // Only here for primus.js readyState number compatibility.
Spark.CLOSED  = 2;    // The connection is closed.
Spark.OPEN    = 3;    // The connection is open.

//
// Make sure that we emit `readyState` change events when a new readyState is
// checked. This way plugins can correctly act according to this.
//
Spark.readable('readyState', {
  get: function get() {
    return this.__readyState;
  },
  set: function set(readyState) {
    if (this.__readyState === readyState) return readyState;

    this.__readyState = readyState;
    this.emit('readyStateChange');

    return readyState;
  }
}, true);

Spark.writable('__readyState', Spark.OPEN);

//
// Lazy parse interface for IP address information. As nobody is always
// interested in this, we're going to defer parsing until it's actually needed.
//
Spark.get('address', function address() {
  return this.request.forwarded || forwarded(this.remote, this.headers, this.primus.whitelist);
});

/**
 * Checks if the given event is an emitted event by Primus.
 *
 * @param {String} evt The event name.
 * @returns {Boolean}
 * @api public
 */
Spark.readable('reserved', function reserved(evt) {
  return (/^(incoming|outgoing)::/).test(evt)
  || evt in reserved.events;
});

/**
 * The actual events that are used by the Spark.
 *
 * @type {Object}
 * @api public
 */
Spark.prototype.reserved.events = {
  readyStateChange: 1,
  heartbeat: 1,
  error: 1,
  data: 1,
  end: 1
};

/**
 * Allows for adding initialise listeners without people overriding our default
 * initializer. If they are feeling adventures and really want want to hack it
 * up, they can remove it from the __initialise array.
 *
 * @returns {Function} The last added initialise hook.
 * @api public
 */
Spark.readable('initialise', {
  get: function get() {
    return this.__initialise[this.__initialise.length - 1];
  },

  set: function set(initialise) {
    if ('function' === typeof initialise) this.__initialise.push(initialise);
  }
}, true);

/**
 * Send a heartbeat to the client.
 *
 * Checks if any message has been received from the client before sending
 * another heartbeat. If not, we can assume it's dead (no response to our last
 * ping), so we should close.
 *
 * This is intentionally writable so it can be overwritten for custom heartbeat
 * policies.
 *
 * @returns {undefined}
 * @api public
 */
Spark.writable('heartbeat', function heartbeat() {
  var spark = this;
  if (!spark.alive) {
    //
    // Set the `reconnect` option to `true` so we don't send a
    // `primus::server::close` packet to an already broken connection.
    //
    spark.end(undefined, { reconnect: true });
  } else {
    const now = Date.now();

    spark.alive = false;
    spark.emit('outgoing::ping', now);
    spark._write(`primus::ping::${now}`);
  }
});

/**
 * Attach hooks and automatically announce a new connection.
 *
 * @type {Array}
 * @api private
 */
Spark.readable('__initialise', [function initialise() {
  var primus = this.primus
    , ultron = this.ultron
    , spark = this;

  //
  // Prevent double initialization of the spark. If we already have an
  // `incoming::data` handler we assume that all other cases are handled as well.
  //
  if (this.listeners('incoming::data').length) {
    return log('already has incoming::data listeners, bailing out');
  }

  //
  // We've received new data from our client, decode and emit it.
  //
  ultron.on('incoming::data', function message(raw) {
    primus.decoder.call(spark, raw, function decoding(err, data) {
      //
      // Do a "save" emit('error') when we fail to parse a message. We don't
      // want to throw here as listening to errors should be optional.
      //
      if (err) {
        log('failed to decode the incoming data for %s', spark.id);
        return new ParserError('Failed to decode incoming data: '+ err.message, spark, err);
      }

      //
      // Handle "primus::" prefixed protocol messages.
      //
      if (spark.protocol(data)) return;

      spark.transforms(primus, spark, 'incoming', data, raw);
    });
  });

  //
  // We've received a pong event. This is fired upon receipt of a
  // `pimus::pong::<timestamp>` message.
  //
  ultron.on('incoming::pong', function pong() {
    spark.alive = true;
    spark.emit('heartbeat');
  });

  //
  // The client has disconnected.
  //
  ultron.on('incoming::end', function disconnect() {
    //
    // The socket is closed, sending data over it will throw an error.
    //
    log('transformer closed connection for %s', spark.id);
    spark.end(undefined, { reconnect: true });
  });

  ultron.on('incoming::error', function error(err) {
    //
    // Ensure that the error we emit is always an Error instance. There are
    // transformers that used to emit only strings. A string is not an Error.
    //
    if ('string' === typeof err) {
      err = new Error(err);
    }

    if (spark.listeners('error').length) spark.emit('error', err);
    spark.primus.emit('log', 'error', err);

    log('transformer received error `%s` for %s', err.message, spark.id);
    spark.end();
  });

  //
  // End is triggered by both incoming and outgoing events.
  //
  ultron.on('end', function end() {
    primus.emit('disconnection', spark);
  });

  //
  // Announce a new connection. This allows the transformers to change or listen
  // to events before we announce it.
  //
  process.nextTick(function tick() {
    primus.asyncemit('connection', spark, function damn(err) {
      if (!err) {
        if (spark.queue) spark.queue.forEach(function each(packet) {
          spark.emit('data', packet.data, packet.raw);
        });

        spark.queue = null;
        return;
      }

      spark.emit('incoming::error', err);
    });
  });
}]);

/**
 * Execute the set of message transformers from Primus on the incoming or
 * outgoing message.
 * This function and it's content should be in sync with Primus#transforms in
 * primus.js.
 *
 * @param {Primus} primus Reference to the Primus instance with message transformers.
 * @param {Spark|Primus} connection Connection that receives or sends data.
 * @param {String} type The type of message, 'incoming' or 'outgoing'.
 * @param {Mixed} data The data to send or that has been received.
 * @param {String} raw The raw encoded data.
 * @returns {Spark}
 * @api public
 */
Spark.readable('transforms', function transforms(primus, connection, type, data, raw) {
  var packet = { data: data, raw: raw }
    , fns = primus.transformers[type];

  //
  // Iterate in series over the message transformers so we can allow optional
  // asynchronous execution of message transformers which could for example
  // retrieve additional data from the server, do extra decoding or even
  // message validation.
  //
  (function transform(index, done) {
    var transformer = fns[index++];

    if (!transformer) return done();

    if (1 === transformer.length) {
      if (false === transformer.call(connection, packet)) {
        //
        // When false is returned by an incoming transformer it means that's
        // being handled by the transformer and we should not emit the `data`
        // event.
        //
        return;
      }

      return transform(index, done);
    }

    transformer.call(connection, packet, function finished(err, arg) {
      if (err) return connection.emit('error', err);
      if (false === arg) return;

      transform(index, done);
    });
  }(0, function done() {
    //
    // We always emit 2 arguments for the data event, the first argument is the
    // parsed data and the second argument is the raw string that we received.
    // This allows you, for example, to do some validation on the parsed data
    // and then save the raw string in your database without the stringify
    // overhead.
    //
    if ('incoming' === type) {
      //
      // This is pretty bad edge case, it's possible that the async version of
      // the `connection` event listener takes so long that we cannot assign
      // `data` handlers and we are already receiving data as the connection is
      // already established. In this edge case we need to queue the data and
      // pass it to the data event once we're listening.
      //
      if (connection.queue) return connection.queue.push(packet);
      return connection.emit('data', packet.data, packet.raw);
    }

    connection._write(packet.data);
  }));

  return this;
});

/**
 * Really dead simple protocol parser. We simply assume that every message that
 * is prefixed with `primus::` could be used as some sort of protocol definition
 * for Primus.
 *
 * @param {String} msg The data.
 * @returns {Boolean} Is a protocol message.
 * @api private
 */
Spark.readable('protocol', function protocol(msg) {
  if (
       'string' !== typeof msg
    || msg.indexOf('primus::') !== 0
  ) return false;

  var last = msg.indexOf(':', 8)
    , value = msg.slice(last + 2);

  switch (msg.slice(8,  last)) {
    case 'pong':
      this.emit('incoming::pong', +value);
      break;

    case 'id':
      this._write('primus::id::'+ this.id);
      break;

    //
    // Unknown protocol, somebody is probably sending `primus::` prefixed
    // messages.
    //
    default:
      log('message `%s` was prefixed with primus:: but not supported', msg);
      return false;
  }

  log('processed a primus protocol message `%s`', msg);
  return true;
});

/**
 * Send a new message to a given spark.
 *
 * @param {Mixed} data The data that needs to be written.
 * @returns {Boolean} Always returns true.
 * @api public
 */
Spark.readable('write', function write(data) {
  var primus = this.primus;

  //
  // The connection is closed, return false.
  //
  if (Spark.CLOSED === this.readyState) {
    log('attempted to write but readyState was already set to CLOSED for %s', this.id);
    return false;
  }

  this.transforms(primus, this, 'outgoing', data);

  return true;
});

/**
 * The actual message writer.
 *
 * @param {Mixed} data The message that needs to be written.
 * @returns {Boolean}
 * @api private
 */
Spark.readable('_write', function _write(data) {
  var primus = this.primus
    , spark = this;

  //
  // The connection is closed, normally this would already be done in the
  // `spark.write` method, but as `_write` is used internally, we should also
  // add the same check here to prevent potential crashes by writing to a dead
  // socket.
  //
  if (Spark.CLOSED === spark.readyState) {
    log('attempted to _write but readyState was already set to CLOSED for %s', spark.id);
    return false;
  }

  primus.encoder.call(spark, data, function encoded(err, packet) {
    //
    // Do a "safe" emit('error') when we fail to parse a message. We don't
    // want to throw here as listening to errors should be optional.
    //
    if (err) return new ParserError('Failed to encode outgoing data: '+ err.message, spark, err);
    if (!packet) return log('nothing to write, bailing out for %s', spark.id);

    //
    // Hack 1: \u2028 and \u2029 are allowed inside a JSON string, but JavaScript
    // defines them as newline separators. Unescaped control characters are not
    // allowed inside JSON strings, so this causes an error at parse time. We
    // work around this issue by escaping these characters. This can cause
    // errors with JSONP requests or if the string is just evaluated.
    //
    if ('string' === typeof packet) {
      if (~packet.indexOf('\u2028')) packet = packet.replace(u2028, '\\u2028');
      if (~packet.indexOf('\u2029')) packet = packet.replace(u2029, '\\u2029');
    }

    spark.emit('outgoing::data', packet);
  });

  return true;
});

/**
 * End the connection.
 *
 * Options:
 * - reconnect (boolean) Trigger client-side reconnect.
 *
 * @param {Mixed} data Optional closing data.
 * @param {Object} options End instructions.
 * @api public
 */
Spark.readable('end', function end(data, options) {
  if (Spark.CLOSED === this.readyState) return this;

  options = options || {};
  if (data !== undefined) this.write(data);

  //
  // If we want to trigger a reconnect do not send
  // `primus::server::close`, otherwise bypass the .write method
  // as this message should not be transformed.
  //
  if (!options.reconnect) this._write('primus::server::close');

  //
  // This seems redundant but there are cases where the above writes
  // can trigger another `end` call. An example is with Engine.IO
  // when calling `end` on the client and `end` on the spark right
  // after. The `end` call on the spark comes before the `incoming::end`
  // event and the result is an attempt of writing to a closed socket.
  // When this happens Engine.IO closes the connection and without
  // this check the following instructions could be executed twice.
  //
  if (Spark.CLOSED === this.readyState) return this;

  log('emitting final events for spark %s', this.id);

  this.readyState = Spark.CLOSED;
  this.emit('outgoing::end');
  this.emit('end');
  this.ultron.destroy();
  this.ultron = this.queue = null;

  return this;
});

//
// Expose the module.
//
module.exports = Spark;


/***/ }),

/***/ 3688:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


var log = __nccwpck_require__(685)('primus:transformer')
  , middlewareError = __nccwpck_require__(1485)
  , url = (__nccwpck_require__(7310).parse)
  , Ultron = __nccwpck_require__(4328)
  , fuse = __nccwpck_require__(8327);

function noop() {}

/**
 * Transformer skeleton
 *
 * @constructor
 * @param {Primus} primus Reference to the Primus instance.
 * @api public
 */
function Transformer(primus) {
  this.fuse();

  this.ultron = new Ultron(primus.server);  // Handles listeners with ease.
  this.Spark = primus.Spark;                // Reference to the Spark constructor.
  this.primus = primus;                     // Reference to the Primus instance.
  this.service = null;                      // Stores the real-time service.

  this.initialise();
}

fuse(Transformer, __nccwpck_require__(1848));

//
// Simple logger shortcut.
//
Object.defineProperty(Transformer.prototype, 'logger', {
  get: function logger() {
    return {
      error: this.primus.emits('log', 'error'), // Log error <line>.
      warn:  this.primus.emits('log', 'warn'),  // Log warn <line>.
      info:  this.primus.emits('log', 'info'),  // Log info <line>.
      debug: this.primus.emits('log', 'debug'), // Log debug <line>.
      log:   this.primus.emits('log', 'log'),   // Log log <line>.
      plain: this.primus.emits('log', 'log')    // Log log <line>.
    };
  }
});

/**
 * Create the server and attach the appropriate event listeners.
 *
 * @api private
 */
Transformer.readable('initialise', function initialise() {
  if (this.server) this.server();

  var server = this.primus.server
    , transformer = this;

  server.listeners('request').forEach(function each(fn) {
    log('found existing request handlers on the HTTP server, moving Primus as first');
    transformer.on('previous::request', fn, server);
  });

  server.listeners('upgrade').forEach(function each(fn) {
    log('found existing upgrade handlers on the HTTP server, moving Primus as first');
    transformer.on('previous::upgrade', fn, server);
  });

  //
  // Remove the old listeners as we want to be the first request handler for all
  // events.
  //
  server.removeAllListeners('request');
  server.removeAllListeners('upgrade');

  //
  // Emit a close event.
  //
  this.ultron.on('close', function close() {
    log('the HTTP server is closing');
    transformer.emit('close');
  });

  //
  // Start listening for incoming requests if we have a listener assigned to us.
  //
  if (this.listeners('request').length || this.listeners('previous::request').length) {
    server.on('request', this.request.bind(this));
  }

  if (this.listeners('upgrade').length || this.listeners('previous::upgrade').length) {
    server.on('upgrade', this.upgrade.bind(this));
  }
});

/**
 * Iterate all the middleware layers that we're set on our Primus instance.
 *
 * @param {String} type Either `http` or `upgrade`
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} next Continuation callback.
 * @api private
 */
Transformer.readable('forEach', function forEach(type, req, res, next) {
  var transformer = this
    , layers = transformer.primus.layers
    , primus = transformer.primus;

  req.query = req.uri.query || {};

  //
  // Add some silly HTTP properties for connect.js compatibility.
  //
  req.originalUrl = req.url;

  if (!layers.length) {
    next();
    return transformer;
  }

  //
  // Async or sync call the middleware layer.
  //
  (function iterate(index) {
    var layer = layers[index++];

    if (!layer) return next();
    if (!layer.enabled || layer.fn[type] === false) return iterate(index);

    if (layer.length === 2) {
      log('executing middleware (%s) synchronously', layer.name);

      if (layer.fn.call(primus, req, res)) return;
      return iterate(index);
    }

    log('executing middleware (%s) asynchronously', layer.name);
    layer.fn.call(primus, req, res, function done(err) {
      if (err) return middlewareError(err, req, res);

      iterate(index);
    });
  }(0));

  return transformer;
});

/**
 * Start listening for incoming requests and check if we need to forward them to
 * the transformers.
 *
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @api private
 */
Transformer.readable('request', function request(req, res) {
  if (!this.test(req)) return this.emit('previous::request', req, res);

  req.headers['primus::req::backup'] = req;
  res.once('end', function gc() {
    delete req.headers['primus::req::backup'];
  });

  //
  // I want to see you're face when you're looking at the lines of code above
  // while you think, WTF what is this shit, you mad bro!? Let me take a moment
  // to explain this mad and sadness.
  //
  // There are some real-time transformers that do not give us access to the
  // HTTP request that initiated their `socket` connection. They only give us
  // access to the information that they think is useful, we're greedy, we want
  // everything and let developers decide what they want to use instead and
  // therefor want to expose this HTTP request on our `spark` object.
  //
  // The reason it's added to the headers is because it's currently the only
  // field that is accessible through all transformers.
  //

  log('handling HTTP request for url: %s', req.url);
  this.forEach('http', req, res, this.emits('request', req, res));
});

/**
 * Starting listening for incoming upgrade requests and check if we need to
 * forward them to the transformers.
 *
 * @param {Request} req HTTP request.
 * @param {Socket} socket Socket.
 * @param {Buffer} head Buffered data.
 * @api private
 */
Transformer.readable('upgrade', function upgrade(req, socket, head) {
  if (!this.test(req)) return this.emit('previous::upgrade', req, socket, head);

  //
  // See Transformer#request for an explanation of this madness.
  //
  req.headers['primus::req::backup'] = req;
  socket.once('end', function gc() {
    delete req.headers['primus::req::backup'];
  });

  log('handling HTTP upgrade for url: %s', req.url);

  //
  // Add a listener for the `'error'` event before running middleware as there
  // isn't a default one in Node.js >= 10. The socket is destroyed when an error
  // occurs so there is no need to do anything.
  //
  socket.on('error', noop);

  this.forEach('upgrade', req, socket, () => {
    socket.removeListener('error', noop);
    this.emit('upgrade', req, socket, head);
  });
});

/**
 * Check if we should accept this request.
 *
 * @param {Request} req HTTP Request.
 * @returns {Boolean} Do we need to accept this request.
 * @api private
 */
Transformer.readable('test', function test(req) {
  req.uri = url(req.url, true);

  var pathname = req.uri.pathname || '/'
    , route = this.primus.pathname;

  return pathname.slice(0, route.length) === route;
});

//
// Expose the transformer's skeleton.
//
module.exports = Transformer;


/***/ }),

/***/ 5482:
/***/ ((module) => {

"use strict";

/*globals MozWebSocket */

/**
 * Minimum viable WebSocket client. This function is stringified and added
 * in our client-side library.
 *
 * @runat client
 * @api private
 */
module.exports = function client() {
  var primus = this
    , socket;

  //
  // Select an available WebSocket factory.
  //
  var Factory = (function factory() {
    if ('undefined' !== typeof WebSocket) return WebSocket;
    if ('undefined' !== typeof MozWebSocket) return MozWebSocket;

    try { return Primus.requires('ws'); }
    catch (e) {}

    return undefined;
  })();

  if (!Factory) return primus.critical(new Error(
    'Missing required `ws` module. Please run `npm install --save ws`'
  ));

  //
  // Connect to the given URL.
  //
  primus.on('outgoing::open', function opening() {
    primus.emit('outgoing::end');

    //
    // FireFox will throw an error when we try to establish a connection from
    // a secure page to an unsecured WebSocket connection. This is inconsistent
    // behaviour between different browsers. This should ideally be solved in
    // Primus when we connect.
    //
    try {
      var options = {
        protocol: primus.url.protocol === 'ws+unix:' ? 'ws+unix:' : 'ws:',
        query: true
      };

      //
      // Only allow primus.transport object in Node.js, it will throw in
      // browsers with a TypeError if we supply to much arguments.
      //
      if (Factory.length === 3) {
        if ('ws+unix:' === options.protocol) {
          options.pathname =
            '/' +
            primus.url.hostname +
            primus.url.pathname +
            ':' +
            primus.pathname;
        }
        primus.socket = socket = new Factory(
          primus.uri(options),  // URL
          [],                   // Sub protocols
          primus.transport      // options.
        );
      } else {
        primus.socket = socket = new Factory(primus.uri(options));
        socket.binaryType = 'arraybuffer';
      }
    } catch (e) { return primus.emit('error', e); }

    //
    // Setup the Event handlers.
    //
    socket.onopen = primus.emits('incoming::open');
    socket.onerror = primus.emits('incoming::error');
    socket.onclose = primus.emits('incoming::end');
    socket.onmessage = primus.emits('incoming::data', function parse(next, evt) {
      next(undefined, evt.data);
    });
  });

  //
  // We need to write a new message to the socket.
  //
  primus.on('outgoing::data', function write(message) {
    if (!socket || socket.readyState !== Factory.OPEN) return;

    try { socket.send(message); }
    catch (e) { primus.emit('incoming::error', e); }
  });

  //
  // Attempt to reconnect the socket.
  //
  primus.on('outgoing::reconnect', function reconnect() {
    primus.emit('outgoing::open');
  });

  //
  // We need to close the socket.
  //
  primus.on('outgoing::end', function close() {
    if (!socket) return;

    socket.onerror = socket.onopen = socket.onclose = socket.onmessage = function () {};
    socket.close();
    socket = null;
  });
};


/***/ }),

/***/ 5173:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


//
// Expose the module as new Transformer instance.
//
module.exports = (__nccwpck_require__(3688).extend)({
  // Creating a new real-time server.
  server: __nccwpck_require__(9562),

  // The client-logic to connect with the server.
  client: __nccwpck_require__(5482)
});


/***/ }),

/***/ 9562:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const http = __nccwpck_require__(3685);
const url = __nccwpck_require__(7310);
const ws = __nccwpck_require__(8867);

/**
 * Minimum viable WebSocket server for Node.js that works through the Primus
 * interface.
 *
 * @runat server
 * @api private
 */
module.exports = function server() {
  this.service = new ws.Server(Object.assign({
    perMessageDeflate: !!this.primus.options.compression,
    maxPayload: this.primus.options.maxLength
  }, this.primus.options.transport, {
    clientTracking: false,
    noServer: true
  }));

  /**
   * Noop! Pointless, empty function that will actually be really useful.
   *
   * @param {Error} err We failed at something.
   * @api private
   */
  const noop = (err) => err && this.logger.error(err);

  //
  // Listen to upgrade requests.
  //
  this.on('upgrade', (req, socket, head) => {
    this.service.handleUpgrade(req, socket, head, (socket) => {
      const spark = new this.Spark(
          req.headers               // HTTP request headers.
        , req                       // IP address location.
        , url.parse(req.url).query  // Optional query string.
        , null                      // We don't have an unique id.
        , req                       // Reference to the HTTP req.
        , socket                    // Reference to the WebSocket.
      );

      spark.on('outgoing::end', () => socket && socket.close());
      spark.on('outgoing::data', (data) => {
        if (socket.readyState !== socket.OPEN) return;
        socket.send(data, noop);
      });

      socket.on('message',
        spark.emits('incoming::data', (next, data, isBinary) => {
          next(undefined, isBinary === false ? data.toString() : data);
        })
      );
      socket.on('error', spark.emits('incoming::error'));
      socket.on('ping', spark.emits('incoming::pong', (next) => {
        next(undefined, null);
      }));
      socket.on('close', spark.emits('incoming::end', (next) => {
        socket.removeAllListeners();
        socket = null;
        next();
      }));
    });
  });

  //
  // Listen to non-upgrade requests.
  //
  this.on('request', (req, res) => {
    res.writeHead(426, { 'content-type': 'text/plain' });
    res.end(http.STATUS_CODES[426]);
  });

  this.once('close',  () => this.service.close());
};


/***/ }),

/***/ 4461:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


var debug = __nccwpck_require__(7784)('setHeader');

/**
 * This code mimics the internals of the setHeader methods that is found in the
 * _http_outgoing.js file which node uses as response object. The only big
 * difference is that we don't throw and crash your application and ensure that
 * the headers you set using this function CANNOT be removed.
 *
 * @param {Response} res The HTTP Outgoing response instance.
 * @param {String} name The header name.
 * @param {String} value The value of the header.
 * @returns {Boolean} The header was set.
 * @api public
 */
module.exports = function setHeader(res, name, value) {
  if (!res || !name || !value || res._header) {
    return false;
  }

  var key = name.toLowerCase();

  //
  // Delegate the header setting magic first to the default setHeader method as
  // it can also be used to remove automatically injected headers.
  //
  res.setHeader(name, value);

  var symbols = Object.getOwnPropertySymbols
    ? Object.getOwnPropertySymbols(res)
    : [];
  var symbol;

  if (symbols.length) {
    for (var i = 0; i < symbols.length; i++) {
      var str = String(symbols[i]);

      if (str === 'Symbol(outHeadersKey)' || str === 'Symbol(kOutHeaders)') {
        symbol = symbols[i];
        break;
      }
    }
  } else {
    symbol = '_headers';
  }

  //
  // Prevent thrown errors when we want to set the same header again using our
  // own `setHeader` method.
  //
  var described = Object.getOwnPropertyDescriptor(res[symbol], key);

  if (described && !described.configurable) {
    return false;
  }

  //
  // Internally, the `res.setHeader` stores the lowercase name and it's value in
  // a private `_headers` object. We're going to override the value that got set
  // using the Object.defineProperty so nobody can set the same header again.
  //
  Object.defineProperty(res[symbol], key, {
    configurable: false,
    enumerable: true,

    //
    // Return the value that got set using our `setHeader` method.
    //
    get: function get() {
      return typeof symbol === 'symbol' ? [key, value] : value;
    },

    //
    // Log an override attempt on our protected header.
    //
    set: function set(val) {
      debug('attempt to override header %s:%s with %s', name, value, val);
      return value;
    }
  });

  return true;
};


/***/ }),

/***/ 7784:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


var colorspace = __nccwpck_require__(5917)
  , enabled = __nccwpck_require__(1936)
  , kuler = __nccwpck_require__(1409)
  , util = __nccwpck_require__(3837);

/**
 * Check if the terminal we're using allows the use of colors.
 *
 * @type {Boolean}
 * @private
 */
var tty = (__nccwpck_require__(6224).isatty)(1);

/**
 * The default stream instance we should be writing against.
 *
 * @type {Stream}
 * @public
 */
var stream = process.stdout;

/**
 * A simple environment based logger.
 *
 * Options:
 *
 * - colors: Force the use of colors or forcefully disable them. If this option
 *   is not supplied the colors will be based on your terminal.
 * - stream: The Stream instance we should write our logs to, defaults to
 *   process.stdout but can be anything you like.
 *
 * @param {String} name The namespace of your log function.
 * @param {Object} options Logger configuration.
 * @returns {Function} Configured logging method.
 * @api public
 */
function factory(name, options) {
  if (!enabled(name)) return function diagnopes() {};

  options = options || {};
  options.colors = 'colors' in options ? options.colors : tty;
  options.ansi = options.colors ? kuler(name, colorspace(name)) : name;
  options.stream = options.stream || stream;

  //
  // Allow multiple streams, so make sure it's an array which makes iteration
  // easier.
  //
  if (!Array.isArray(options.stream)) {
    options.stream = [options.stream];
  }

  //
  // The actual debug function which does the logging magic.
  //
  return function debug(line) {
    //
    // Better formatting for error instances.
    //
    if (line instanceof Error) line = line.stack || line.message || line;

    line = [
      //
      // Add the colorized namespace.
      //
      options.ansi,

      //
      // The total time we took to execute the next debug statement.
      //
      ' ',
      line
    ].join('');

    //
    // Use util.format so we can follow the same API as console.log.
    //
    line = util.format.apply(this, [line].concat(
        Array.prototype.slice.call(arguments, 1)
    )) + '\n';

    options.stream.forEach(function each(stream) {
      stream.write(line);
    });
  };
}

/**
 * Override the "default" stream that we write to. This allows you to globally
 * configure the steams.
 *
 * @param {Stream} output
 * @returns {function} Factory
 * @api private
 */
factory.to = function to(output) {
  stream = output;
  return factory;
};

//
// Expose the module.
//
module.exports = factory;


/***/ }),

/***/ 1936:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


var env = __nccwpck_require__(4819);

/**
 * Checks if a given namespace is allowed by the environment variables.
 *
 * @param {String} name namespace that should be included.
 * @param {Array} variables
 * @returns {Boolean}
 * @api public
 */
module.exports = function enabled(name, variables) {
  var envy = env()
    , variable
    , i = 0;

  variables = variables || ['diagnostics', 'debug'];

  for (; i < variables.length; i++) {
    if ((variable = envy[variables[i]])) break;
  }

  if (!variable) return false;

  variables = variable.split(/[\s,]+/);
  i = 0;

  for (; i < variables.length; i++) {
    variable = variables[i].replace('*', '.*?');

    if ('-' === variable.charAt(0)) {
      if ((new RegExp('^'+ variable.substr(1) +'$')).test(name)) {
        return false;
      }

      continue;
    }

    if ((new RegExp('^'+ variable +'$')).test(name)) {
      return true;
    }
  }

  return false;
};


/***/ }),

/***/ 1409:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


var colornames = __nccwpck_require__(697);

/**
 * Kuler: Color text using CSS colors
 *
 * @constructor
 * @param {String} text The text that needs to be styled
 * @param {String} color Optional color for alternate API.
 * @api public
 */
function Kuler(text, color) {
  if (color) return (new Kuler(text)).style(color);
  if (!(this instanceof Kuler)) return new Kuler(text);

  this.text = text;
}

/**
 * ANSI color codes.
 *
 * @type {String}
 * @private
 */
Kuler.prototype.prefix = '\x1b[';
Kuler.prototype.suffix = 'm';

/**
 * Parse a hex color string and parse it to it's RGB equiv.
 *
 * @param {String} color
 * @returns {Array}
 * @api private
 */
Kuler.prototype.hex = function hex(color) {
  color = color[0] === '#' ? color.substring(1) : color;

  //
  // Pre-parse for shorthand hex colors.
  //
  if (color.length === 3) {
    color = color.split('');

    color[5] = color[2]; // F60##0
    color[4] = color[2]; // F60#00
    color[3] = color[1]; // F60600
    color[2] = color[1]; // F66600
    color[1] = color[0]; // FF6600

    color = color.join('');
  }

  var r = color.substring(0, 2)
    , g = color.substring(2, 4)
    , b = color.substring(4, 6);

  return [ parseInt(r, 16), parseInt(g, 16), parseInt(b, 16) ];
};

/**
 * Transform a 255 RGB value to an RGV code.
 *
 * @param {Number} r Red color channel.
 * @param {Number} g Green color channel.
 * @param {Number} b Blue color channel.
 * @returns {String}
 * @api public
 */
Kuler.prototype.rgb = function rgb(r, g, b) {
  var red = r / 255 * 5
    , green = g / 255 * 5
    , blue = b / 255 * 5;

  return this.ansi(red, green, blue);
};

/**
 * Turns RGB 0-5 values into a single ANSI code.
 *
 * @param {Number} r Red color channel.
 * @param {Number} g Green color channel.
 * @param {Number} b Blue color channel.
 * @returns {String}
 * @api public
 */
Kuler.prototype.ansi = function ansi(r, g, b) {
  var red = Math.round(r)
    , green = Math.round(g)
    , blue = Math.round(b);

  return 16 + (red * 36) + (green * 6) + blue;
};

/**
 * Marks an end of color sequence.
 *
 * @returns {String} Reset sequence.
 * @api public
 */
Kuler.prototype.reset = function reset() {
  return this.prefix +'39;49'+ this.suffix;
};

/**
 * Colour the terminal using CSS.
 *
 * @param {String} color The HEX color code.
 * @returns {String} the escape code.
 * @api public
 */
Kuler.prototype.style = function style(color) {
  //
  // We've been supplied a CSS color name instead of a hex color format so we
  // need to transform it to proper CSS color and continue with our execution
  // flow.
  //
  if (!/^#?(?:[0-9a-fA-F]{3}){1,2}$/.test(color)) {
    color = colornames(color);
  }

  return this.prefix +'38;5;'+ this.rgb.apply(this, this.hex(color)) + this.suffix + this.text + this.reset();
};


//
// Expose the actual interface.
//
module.exports = Kuler;


/***/ }),

/***/ 8679:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


var isArrayish = __nccwpck_require__(8542);

var concat = Array.prototype.concat;
var slice = Array.prototype.slice;

var swizzle = module.exports = function swizzle(args) {
	var results = [];

	for (var i = 0, len = args.length; i < len; i++) {
		var arg = args[i];

		if (isArrayish(arg)) {
			// http://jsperf.com/javascript-array-concat-vs-push/98
			results = concat.call(results, slice.call(arg));
		} else {
			results.push(arg);
		}
	}

	return results;
};

swizzle.wrap = function (fn) {
	return function () {
		return fn(swizzle(arguments));
	};
};


/***/ }),

/***/ 8542:
/***/ ((module) => {

module.exports = function isArrayish(obj) {
	if (!obj || typeof obj === 'string') {
		return false;
	}

	return obj instanceof Array || Array.isArray(obj) ||
		(obj.length >= 0 && (obj.splice instanceof Function ||
			(Object.getOwnPropertyDescriptor(obj, (obj.length - 1)) && obj.constructor.name !== 'String')));
};


/***/ }),

/***/ 7014:
/***/ ((module) => {

"use strict";


/***
 * Convert string to hex color.
 *
 * @param {String} str Text to hash and convert to hex.
 * @returns {String}
 * @api public
 */
module.exports = function hex(str) {
  for (
    var i = 0, hash = 0;
    i < str.length;
    hash = str.charCodeAt(i++) + ((hash << 5) - hash)
  );

  var color = Math.floor(
    Math.abs(
      (Math.sin(hash) * 10000) % 1 * 16777216
    )
  ).toString(16);

  return '#' + Array(6 - color.length + 1).join('0') + color;
};


/***/ }),

/***/ 4294:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

module.exports = __nccwpck_require__(4219);


/***/ }),

/***/ 4219:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


var net = __nccwpck_require__(1808);
var tls = __nccwpck_require__(4404);
var http = __nccwpck_require__(3685);
var https = __nccwpck_require__(5687);
var events = __nccwpck_require__(2361);
var assert = __nccwpck_require__(9491);
var util = __nccwpck_require__(3837);


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

  self.on('free', function onFree(socket, host, port, localAddress) {
    var options = toOptions(host, port, localAddress);
    for (var i = 0, len = self.requests.length; i < len; ++i) {
      var pending = self.requests[i];
      if (pending.host === options.host && pending.port === options.port) {
        // Detect the request to connect same origin server,
        // reuse the connection.
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
  var options = mergeOptions({request: req}, self.options, toOptions(host, port, localAddress));

  if (self.sockets.length >= this.maxSockets) {
    // We are over limit so we'll add it to the queue.
    self.requests.push(options);
    return;
  }

  // If we are under maxSockets create a new one.
  self.createSocket(options, function(socket) {
    socket.on('free', onFree);
    socket.on('close', onCloseOrRemove);
    socket.on('agentRemove', onCloseOrRemove);
    req.onSocket(socket);

    function onFree() {
      self.emit('free', socket, options);
    }

    function onCloseOrRemove(err) {
      self.removeSocket(socket);
      socket.removeListener('free', onFree);
      socket.removeListener('close', onCloseOrRemove);
      socket.removeListener('agentRemove', onCloseOrRemove);
    }
  });
};

TunnelingAgent.prototype.createSocket = function createSocket(options, cb) {
  var self = this;
  var placeholder = {};
  self.sockets.push(placeholder);

  var connectOptions = mergeOptions({}, self.proxyOptions, {
    method: 'CONNECT',
    path: options.host + ':' + options.port,
    agent: false,
    headers: {
      host: options.host + ':' + options.port
    }
  });
  if (options.localAddress) {
    connectOptions.localAddress = options.localAddress;
  }
  if (connectOptions.proxyAuth) {
    connectOptions.headers = connectOptions.headers || {};
    connectOptions.headers['Proxy-Authorization'] = 'Basic ' +
        new Buffer(connectOptions.proxyAuth).toString('base64');
  }

  debug('making CONNECT request');
  var connectReq = self.request(connectOptions);
  connectReq.useChunkedEncodingByDefault = false; // for v0.6
  connectReq.once('response', onResponse); // for v0.6
  connectReq.once('upgrade', onUpgrade);   // for v0.6
  connectReq.once('connect', onConnect);   // for v0.7 or later
  connectReq.once('error', onError);
  connectReq.end();

  function onResponse(res) {
    // Very hacky. This is necessary to avoid http-parser leaks.
    res.upgrade = true;
  }

  function onUpgrade(res, socket, head) {
    // Hacky.
    process.nextTick(function() {
      onConnect(res, socket, head);
    });
  }

  function onConnect(res, socket, head) {
    connectReq.removeAllListeners();
    socket.removeAllListeners();

    if (res.statusCode !== 200) {
      debug('tunneling socket could not be established, statusCode=%d',
        res.statusCode);
      socket.destroy();
      var error = new Error('tunneling socket could not be established, ' +
        'statusCode=' + res.statusCode);
      error.code = 'ECONNRESET';
      options.request.emit('error', error);
      self.removeSocket(placeholder);
      return;
    }
    if (head.length > 0) {
      debug('got illegal response body from proxy');
      socket.destroy();
      var error = new Error('got illegal response body from proxy');
      error.code = 'ECONNRESET';
      options.request.emit('error', error);
      self.removeSocket(placeholder);
      return;
    }
    debug('tunneling connection has established');
    self.sockets[self.sockets.indexOf(placeholder)] = socket;
    return cb(socket);
  }

  function onError(cause) {
    connectReq.removeAllListeners();

    debug('tunneling socket could not be established, cause=%s\n',
          cause.message, cause.stack);
    var error = new Error('tunneling socket could not be established, ' +
                          'cause=' + cause.message);
    error.code = 'ECONNRESET';
    options.request.emit('error', error);
    self.removeSocket(placeholder);
  }
};

TunnelingAgent.prototype.removeSocket = function removeSocket(socket) {
  var pos = this.sockets.indexOf(socket)
  if (pos === -1) {
    return;
  }
  this.sockets.splice(pos, 1);

  var pending = this.requests.shift();
  if (pending) {
    // If we have pending requests and a socket gets closed a new one
    // needs to be created to take over in the pool for the one that closed.
    this.createSocket(pending, function(socket) {
      pending.request.onSocket(socket);
    });
  }
};

function createSecureSocket(options, cb) {
  var self = this;
  TunnelingAgent.prototype.createSocket.call(self, options, function(socket) {
    var hostHeader = options.request.getHeader('host');
    var tlsOptions = mergeOptions({}, self.options, {
      socket: socket,
      servername: hostHeader ? hostHeader.replace(/:.*$/, '') : options.host
    });

    // 0 is dummy port for v0.6
    var secureSocket = tls.connect(0, tlsOptions);
    self.sockets[self.sockets.indexOf(socket)] = secureSocket;
    cb(secureSocket);
  });
}


function toOptions(host, port, localAddress) {
  if (typeof host === 'string') { // since v0.10
    return {
      host: host,
      port: port,
      localAddress: localAddress
    };
  }
  return host; // for v0.11 or later
}

function mergeOptions(target) {
  for (var i = 1, len = arguments.length; i < len; ++i) {
    var overrides = arguments[i];
    if (typeof overrides === 'object') {
      var keys = Object.keys(overrides);
      for (var j = 0, keyLen = keys.length; j < keyLen; ++j) {
        var k = keys[j];
        if (overrides[k] !== undefined) {
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
    if (typeof args[0] === 'string') {
      args[0] = 'TUNNEL: ' + args[0];
    } else {
      args.unshift('TUNNEL:');
    }
    console.error.apply(console, args);
  }
} else {
  debug = function() {};
}
exports.debug = debug; // for test


/***/ }),

/***/ 4328:
/***/ ((module) => {

"use strict";


var has = Object.prototype.hasOwnProperty;

/**
 * An auto incrementing id which we can use to create "unique" Ultron instances
 * so we can track the event emitters that are added through the Ultron
 * interface.
 *
 * @type {Number}
 * @private
 */
var id = 0;

/**
 * Ultron is high-intelligence robot. It gathers intelligence so it can start improving
 * upon his rudimentary design. It will learn from your EventEmitting patterns
 * and exterminate them.
 *
 * @constructor
 * @param {EventEmitter} ee EventEmitter instance we need to wrap.
 * @api public
 */
function Ultron(ee) {
  if (!(this instanceof Ultron)) return new Ultron(ee);

  this.id = id++;
  this.ee = ee;
}

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @returns {Ultron}
 * @api public
 */
Ultron.prototype.on = function on(event, fn, context) {
  fn.__ultron = this.id;
  this.ee.on(event, fn, context);

  return this;
};
/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @returns {Ultron}
 * @api public
 */
Ultron.prototype.once = function once(event, fn, context) {
  fn.__ultron = this.id;
  this.ee.once(event, fn, context);

  return this;
};

/**
 * Remove the listeners we assigned for the given event.
 *
 * @returns {Ultron}
 * @api public
 */
Ultron.prototype.remove = function remove() {
  var args = arguments
    , ee = this.ee
    , event;

  //
  // When no event names are provided we assume that we need to clear all the
  // events that were assigned through us.
  //
  if (args.length === 1 && 'string' === typeof args[0]) {
    args = args[0].split(/[, ]+/);
  } else if (!args.length) {
    if (ee.eventNames) {
      args = ee.eventNames();
    } else if (ee._events) {
      args = [];

      for (event in ee._events) {
        if (has.call(ee._events, event)) args.push(event);
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

      //
      // Once listeners have a `listener` property that stores the real listener
      // in the EventEmitter that ships with Node.js.
      //
      if (event.listener) {
        if (event.listener.__ultron !== this.id) continue;
      } else if (event.__ultron !== this.id) {
        continue;
      }

      ee.removeListener(args[i], event);
    }
  }

  return this;
};

/**
 * Destroy the Ultron instance, remove all listeners and release all references.
 *
 * @returns {Boolean}
 * @api public
 */
Ultron.prototype.destroy = function destroy() {
  if (!this.ee) return false;

  this.remove();
  this.ee = null;

  return true;
};

//
// Expose the module.
//
module.exports = Ultron;


/***/ }),

/***/ 5931:
/***/ ((module) => {

"use strict";
/*!
 * vary
 * Copyright(c) 2014-2017 Douglas Christopher Wilson
 * MIT Licensed
 */



/**
 * Module exports.
 */

module.exports = vary
module.exports.append = append

/**
 * RegExp to match field-name in RFC 7230 sec 3.2
 *
 * field-name    = token
 * token         = 1*tchar
 * tchar         = "!" / "#" / "$" / "%" / "&" / "'" / "*"
 *               / "+" / "-" / "." / "^" / "_" / "`" / "|" / "~"
 *               / DIGIT / ALPHA
 *               ; any VCHAR, except delimiters
 */

var FIELD_NAME_REGEXP = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/

/**
 * Append a field to a vary header.
 *
 * @param {String} header
 * @param {String|Array} field
 * @return {String}
 * @public
 */

function append (header, field) {
  if (typeof header !== 'string') {
    throw new TypeError('header argument is required')
  }

  if (!field) {
    throw new TypeError('field argument is required')
  }

  // get fields array
  var fields = !Array.isArray(field)
    ? parse(String(field))
    : field

  // assert on invalid field names
  for (var j = 0; j < fields.length; j++) {
    if (!FIELD_NAME_REGEXP.test(fields[j])) {
      throw new TypeError('field argument contains an invalid header name')
    }
  }

  // existing, unspecified vary
  if (header === '*') {
    return header
  }

  // enumerate current values
  var val = header
  var vals = parse(header.toLowerCase())

  // unspecified vary
  if (fields.indexOf('*') !== -1 || vals.indexOf('*') !== -1) {
    return '*'
  }

  for (var i = 0; i < fields.length; i++) {
    var fld = fields[i].toLowerCase()

    // append value (case-preserving)
    if (vals.indexOf(fld) === -1) {
      vals.push(fld)
      val = val
        ? val + ', ' + fields[i]
        : fields[i]
    }
  }

  return val
}

/**
 * Parse a vary header into an array.
 *
 * @param {String} header
 * @return {Array}
 * @private
 */

function parse (header) {
  var end = 0
  var list = []
  var start = 0

  // gather tokens
  for (var i = 0, len = header.length; i < len; i++) {
    switch (header.charCodeAt(i)) {
      case 0x20: /*   */
        if (start === end) {
          start = end = i + 1
        }
        break
      case 0x2c: /* , */
        list.push(header.substring(start, end))
        start = end = i + 1
        break
      default:
        end = i + 1
        break
    }
  }

  // final token
  list.push(header.substring(start, end))

  return list
}

/**
 * Mark that a request is varied on a header field.
 *
 * @param {Object} res
 * @param {String|Array} field
 * @public
 */

function vary (res, field) {
  if (!res || !res.getHeader || !res.setHeader) {
    // quack quack
    throw new TypeError('res argument is required')
  }

  // get existing header
  var val = res.getHeader('Vary') || ''
  var header = Array.isArray(val)
    ? val.join(', ')
    : String(val)

  // set new header
  if ((val = append(header, field))) {
    res.setHeader('Vary', val)
  }
}


/***/ }),

/***/ 8867:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const WebSocket = __nccwpck_require__(1518);

WebSocket.createWebSocketStream = __nccwpck_require__(1658);
WebSocket.Server = __nccwpck_require__(8887);
WebSocket.Receiver = __nccwpck_require__(5066);
WebSocket.Sender = __nccwpck_require__(6947);

WebSocket.WebSocket = WebSocket;
WebSocket.WebSocketServer = WebSocket.Server;

module.exports = WebSocket;


/***/ }),

/***/ 9436:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const { EMPTY_BUFFER } = __nccwpck_require__(5949);

/**
 * Merges an array of buffers into a new buffer.
 *
 * @param {Buffer[]} list The array of buffers to concat
 * @param {Number} totalLength The total length of buffers in the list
 * @return {Buffer} The resulting buffer
 * @public
 */
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

  if (offset < totalLength) return target.slice(0, offset);

  return target;
}

/**
 * Masks a buffer using the given mask.
 *
 * @param {Buffer} source The buffer to mask
 * @param {Buffer} mask The mask to use
 * @param {Buffer} output The buffer where to store the result
 * @param {Number} offset The offset at which to start writing
 * @param {Number} length The number of bytes to mask.
 * @public
 */
function _mask(source, mask, output, offset, length) {
  for (let i = 0; i < length; i++) {
    output[offset + i] = source[i] ^ mask[i & 3];
  }
}

/**
 * Unmasks a buffer using the given mask.
 *
 * @param {Buffer} buffer The buffer to unmask
 * @param {Buffer} mask The mask to use
 * @public
 */
function _unmask(buffer, mask) {
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] ^= mask[i & 3];
  }
}

/**
 * Converts a buffer to an `ArrayBuffer`.
 *
 * @param {Buffer} buf The buffer to convert
 * @return {ArrayBuffer} Converted buffer
 * @public
 */
function toArrayBuffer(buf) {
  if (buf.byteLength === buf.buffer.byteLength) {
    return buf.buffer;
  }

  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

/**
 * Converts `data` to a `Buffer`.
 *
 * @param {*} data The data to convert
 * @return {Buffer} The buffer
 * @throws {TypeError}
 * @public
 */
function toBuffer(data) {
  toBuffer.readOnly = true;

  if (Buffer.isBuffer(data)) return data;

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

module.exports = {
  concat,
  mask: _mask,
  toArrayBuffer,
  toBuffer,
  unmask: _unmask
};

/* istanbul ignore else  */
if (!process.env.WS_NO_BUFFER_UTIL) {
  try {
    const bufferUtil = __nccwpck_require__(1269);

    module.exports.mask = function (source, mask, output, offset, length) {
      if (length < 48) _mask(source, mask, output, offset, length);
      else bufferUtil.mask(source, mask, output, offset, length);
    };

    module.exports.unmask = function (buffer, mask) {
      if (buffer.length < 32) _unmask(buffer, mask);
      else bufferUtil.unmask(buffer, mask);
    };
  } catch (e) {
    // Continue regardless of the error.
  }
}


/***/ }),

/***/ 5949:
/***/ ((module) => {

"use strict";


module.exports = {
  BINARY_TYPES: ['nodebuffer', 'arraybuffer', 'fragments'],
  EMPTY_BUFFER: Buffer.alloc(0),
  GUID: '258EAFA5-E914-47DA-95CA-C5AB0DC85B11',
  kForOnEventAttribute: Symbol('kIsForOnEventAttribute'),
  kListener: Symbol('kListener'),
  kStatusCode: Symbol('status-code'),
  kWebSocket: Symbol('websocket'),
  NOOP: () => {}
};


/***/ }),

/***/ 4561:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const { kForOnEventAttribute, kListener } = __nccwpck_require__(5949);

const kCode = Symbol('kCode');
const kData = Symbol('kData');
const kError = Symbol('kError');
const kMessage = Symbol('kMessage');
const kReason = Symbol('kReason');
const kTarget = Symbol('kTarget');
const kType = Symbol('kType');
const kWasClean = Symbol('kWasClean');

/**
 * Class representing an event.
 */
class Event {
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
}

Object.defineProperty(Event.prototype, 'target', { enumerable: true });
Object.defineProperty(Event.prototype, 'type', { enumerable: true });

/**
 * Class representing a close event.
 *
 * @extends Event
 */
class CloseEvent extends Event {
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

    this[kCode] = options.code === undefined ? 0 : options.code;
    this[kReason] = options.reason === undefined ? '' : options.reason;
    this[kWasClean] = options.wasClean === undefined ? false : options.wasClean;
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
}

Object.defineProperty(CloseEvent.prototype, 'code', { enumerable: true });
Object.defineProperty(CloseEvent.prototype, 'reason', { enumerable: true });
Object.defineProperty(CloseEvent.prototype, 'wasClean', { enumerable: true });

/**
 * Class representing an error event.
 *
 * @extends Event
 */
class ErrorEvent extends Event {
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

    this[kError] = options.error === undefined ? null : options.error;
    this[kMessage] = options.message === undefined ? '' : options.message;
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
}

Object.defineProperty(ErrorEvent.prototype, 'error', { enumerable: true });
Object.defineProperty(ErrorEvent.prototype, 'message', { enumerable: true });

/**
 * Class representing a message event.
 *
 * @extends Event
 */
class MessageEvent extends Event {
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

    this[kData] = options.data === undefined ? null : options.data;
  }

  /**
   * @type {*}
   */
  get data() {
    return this[kData];
  }
}

Object.defineProperty(MessageEvent.prototype, 'data', { enumerable: true });

/**
 * This provides methods for emulating the `EventTarget` interface. It's not
 * meant to be used directly.
 *
 * @mixin
 */
const EventTarget = {
  /**
   * Register an event listener.
   *
   * @param {String} type A string representing the event type to listen for
   * @param {Function} listener The listener to add
   * @param {Object} [options] An options object specifies characteristics about
   *     the event listener
   * @param {Boolean} [options.once=false] A `Boolean` indicating that the
   *     listener should be invoked at most once after being added. If `true`,
   *     the listener would be automatically removed when invoked.
   * @public
   */
  addEventListener(type, listener, options = {}) {
    let wrapper;

    if (type === 'message') {
      wrapper = function onMessage(data, isBinary) {
        const event = new MessageEvent('message', {
          data: isBinary ? data : data.toString()
        });

        event[kTarget] = this;
        listener.call(this, event);
      };
    } else if (type === 'close') {
      wrapper = function onClose(code, message) {
        const event = new CloseEvent('close', {
          code,
          reason: message.toString(),
          wasClean: this._closeFrameReceived && this._closeFrameSent
        });

        event[kTarget] = this;
        listener.call(this, event);
      };
    } else if (type === 'error') {
      wrapper = function onError(error) {
        const event = new ErrorEvent('error', {
          error,
          message: error.message
        });

        event[kTarget] = this;
        listener.call(this, event);
      };
    } else if (type === 'open') {
      wrapper = function onOpen() {
        const event = new Event('open');

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

  /**
   * Remove an event listener.
   *
   * @param {String} type A string representing the event type to remove
   * @param {Function} handler The listener to remove
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


/***/ }),

/***/ 2035:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const { tokenChars } = __nccwpck_require__(6279);

/**
 * Adds an offer to the map of extension offers or a parameter to the map of
 * parameters.
 *
 * @param {Object} dest The map of extension offers or parameters
 * @param {String} name The extension or parameter name
 * @param {(Object|Boolean|String)} elem The extension parameters or the
 *     parameter value
 * @private
 */
function push(dest, name, elem) {
  if (dest[name] === undefined) dest[name] = [elem];
  else dest[name].push(elem);
}

/**
 * Parses the `Sec-WebSocket-Extensions` header into an object.
 *
 * @param {String} header The field value of the header
 * @return {Object} The parsed object
 * @public
 */
function parse(header) {
  const offers = Object.create(null);
  let params = Object.create(null);
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

    if (extensionName === undefined) {
      if (end === -1 && tokenChars[code] === 1) {
        if (start === -1) start = i;
      } else if (
        i !== 0 &&
        (code === 0x20 /* ' ' */ || code === 0x09) /* '\t' */
      ) {
        if (end === -1 && start !== -1) end = i;
      } else if (code === 0x3b /* ';' */ || code === 0x2c /* ',' */) {
        if (start === -1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }

        if (end === -1) end = i;
        const name = header.slice(start, end);
        if (code === 0x2c) {
          push(offers, name, params);
          params = Object.create(null);
        } else {
          extensionName = name;
        }

        start = end = -1;
      } else {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }
    } else if (paramName === undefined) {
      if (end === -1 && tokenChars[code] === 1) {
        if (start === -1) start = i;
      } else if (code === 0x20 || code === 0x09) {
        if (end === -1 && start !== -1) end = i;
      } else if (code === 0x3b || code === 0x2c) {
        if (start === -1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }

        if (end === -1) end = i;
        push(params, header.slice(start, end), true);
        if (code === 0x2c) {
          push(offers, extensionName, params);
          params = Object.create(null);
          extensionName = undefined;
        }

        start = end = -1;
      } else if (code === 0x3d /* '=' */ && start !== -1 && end === -1) {
        paramName = header.slice(start, i);
        start = end = -1;
      } else {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }
    } else {
      //
      // The value of a quoted-string after unescaping must conform to the
      // token ABNF, so only token characters are valid.
      // Ref: https://tools.ietf.org/html/rfc6455#section-9.1
      //
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
        } else if (code === 0x22 /* '"' */ && start !== -1) {
          inQuotes = false;
          end = i;
        } else if (code === 0x5c /* '\' */) {
          isEscaping = true;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      } else if (code === 0x22 && header.charCodeAt(i - 1) === 0x3d) {
        inQuotes = true;
      } else if (end === -1 && tokenChars[code] === 1) {
        if (start === -1) start = i;
      } else if (start !== -1 && (code === 0x20 || code === 0x09)) {
        if (end === -1) end = i;
      } else if (code === 0x3b || code === 0x2c) {
        if (start === -1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }

        if (end === -1) end = i;
        let value = header.slice(start, end);
        if (mustUnescape) {
          value = value.replace(/\\/g, '');
          mustUnescape = false;
        }
        push(params, paramName, value);
        if (code === 0x2c) {
          push(offers, extensionName, params);
          params = Object.create(null);
          extensionName = undefined;
        }

        paramName = undefined;
        start = end = -1;
      } else {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }
    }
  }

  if (start === -1 || inQuotes || code === 0x20 || code === 0x09) {
    throw new SyntaxError('Unexpected end of input');
  }

  if (end === -1) end = i;
  const token = header.slice(start, end);
  if (extensionName === undefined) {
    push(offers, token, params);
  } else {
    if (paramName === undefined) {
      push(params, token, true);
    } else if (mustUnescape) {
      push(params, paramName, token.replace(/\\/g, ''));
    } else {
      push(params, paramName, token);
    }
    push(offers, extensionName, params);
  }

  return offers;
}

/**
 * Builds the `Sec-WebSocket-Extensions` header field value.
 *
 * @param {Object} extensions The map of extensions and parameters to format
 * @return {String} A string representing the given object
 * @public
 */
function format(extensions) {
  return Object.keys(extensions)
    .map((extension) => {
      let configurations = extensions[extension];
      if (!Array.isArray(configurations)) configurations = [configurations];
      return configurations
        .map((params) => {
          return [extension]
            .concat(
              Object.keys(params).map((k) => {
                let values = params[k];
                if (!Array.isArray(values)) values = [values];
                return values
                  .map((v) => (v === true ? k : `${k}=${v}`))
                  .join('; ');
              })
            )
            .join('; ');
        })
        .join(', ');
    })
    .join(', ');
}

module.exports = { format, parse };


/***/ }),

/***/ 1356:
/***/ ((module) => {

"use strict";


const kDone = Symbol('kDone');
const kRun = Symbol('kRun');

/**
 * A very simple job queue with adjustable concurrency. Adapted from
 * https://github.com/STRML/async-limiter
 */
class Limiter {
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
}

module.exports = Limiter;


/***/ }),

/***/ 6684:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const zlib = __nccwpck_require__(9796);

const bufferUtil = __nccwpck_require__(9436);
const Limiter = __nccwpck_require__(1356);
const { kStatusCode } = __nccwpck_require__(5949);

const TRAILER = Buffer.from([0x00, 0x00, 0xff, 0xff]);
const kPerMessageDeflate = Symbol('permessage-deflate');
const kTotalLength = Symbol('total-length');
const kCallback = Symbol('callback');
const kBuffers = Symbol('buffers');
const kError = Symbol('error');

//
// We limit zlib concurrency, which prevents severe memory fragmentation
// as documented in https://github.com/nodejs/node/issues/8871#issuecomment-250915913
// and https://github.com/websockets/ws/issues/1202
//
// Intentionally global; it's the global thread pool that's an issue.
//
let zlibLimiter;

/**
 * permessage-deflate implementation.
 */
class PerMessageDeflate {
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
   * @param {Boolean} [isServer=false] Create the instance in either server or
   *     client mode
   * @param {Number} [maxPayload=0] The maximum allowed message length
   */
  constructor(options, isServer, maxPayload) {
    this._maxPayload = maxPayload | 0;
    this._options = options || {};
    this._threshold =
      this._options.threshold !== undefined ? this._options.threshold : 1024;
    this._isServer = !!isServer;
    this._deflate = null;
    this._inflate = null;

    this.params = null;

    if (!zlibLimiter) {
      const concurrency =
        this._options.concurrencyLimit !== undefined
          ? this._options.concurrencyLimit
          : 10;
      zlibLimiter = new Limiter(concurrency);
    }
  }

  /**
   * @type {String}
   */
  static get extensionName() {
    return 'permessage-deflate';
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

    this.params = this._isServer
      ? this.acceptAsServer(configurations)
      : this.acceptAsClient(configurations);

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
            'The deflate stream was closed while data was being processed'
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
      if (
        (opts.serverNoContextTakeover === false &&
          params.server_no_context_takeover) ||
        (params.server_max_window_bits &&
          (opts.serverMaxWindowBits === false ||
            (typeof opts.serverMaxWindowBits === 'number' &&
              opts.serverMaxWindowBits > params.server_max_window_bits))) ||
        (typeof opts.clientMaxWindowBits === 'number' &&
          !params.client_max_window_bits)
      ) {
        return false;
      }

      return true;
    });

    if (!accepted) {
      throw new Error('None of the extension offers can be accepted');
    }

    if (opts.serverNoContextTakeover) {
      accepted.server_no_context_takeover = true;
    }
    if (opts.clientNoContextTakeover) {
      accepted.client_no_context_takeover = true;
    }
    if (typeof opts.serverMaxWindowBits === 'number') {
      accepted.server_max_window_bits = opts.serverMaxWindowBits;
    }
    if (typeof opts.clientMaxWindowBits === 'number') {
      accepted.client_max_window_bits = opts.clientMaxWindowBits;
    } else if (
      accepted.client_max_window_bits === true ||
      opts.clientMaxWindowBits === false
    ) {
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

    if (
      this._options.clientNoContextTakeover === false &&
      params.client_no_context_takeover
    ) {
      throw new Error('Unexpected parameter "client_no_context_takeover"');
    }

    if (!params.client_max_window_bits) {
      if (typeof this._options.clientMaxWindowBits === 'number') {
        params.client_max_window_bits = this._options.clientMaxWindowBits;
      }
    } else if (
      this._options.clientMaxWindowBits === false ||
      (typeof this._options.clientMaxWindowBits === 'number' &&
        params.client_max_window_bits > this._options.clientMaxWindowBits)
    ) {
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

        if (key === 'client_max_window_bits') {
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
        } else if (key === 'server_max_window_bits') {
          const num = +value;
          if (!Number.isInteger(num) || num < 8 || num > 15) {
            throw new TypeError(
              `Invalid value for parameter "${key}": ${value}`
            );
          }
          value = num;
        } else if (
          key === 'client_no_context_takeover' ||
          key === 'server_no_context_takeover'
        ) {
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
    const endpoint = this._isServer ? 'client' : 'server';

    if (!this._inflate) {
      const key = `${endpoint}_max_window_bits`;
      const windowBits =
        typeof this.params[key] !== 'number'
          ? zlib.Z_DEFAULT_WINDOWBITS
          : this.params[key];

      this._inflate = zlib.createInflateRaw({
        ...this._options.zlibInflateOptions,
        windowBits
      });
      this._inflate[kPerMessageDeflate] = this;
      this._inflate[kTotalLength] = 0;
      this._inflate[kBuffers] = [];
      this._inflate.on('error', inflateOnError);
      this._inflate.on('data', inflateOnData);
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

      const data = bufferUtil.concat(
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

      callback(null, data);
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
    const endpoint = this._isServer ? 'server' : 'client';

    if (!this._deflate) {
      const key = `${endpoint}_max_window_bits`;
      const windowBits =
        typeof this.params[key] !== 'number'
          ? zlib.Z_DEFAULT_WINDOWBITS
          : this.params[key];

      this._deflate = zlib.createDeflateRaw({
        ...this._options.zlibDeflateOptions,
        windowBits
      });

      this._deflate[kTotalLength] = 0;
      this._deflate[kBuffers] = [];

      this._deflate.on('data', deflateOnData);
    }

    this._deflate[kCallback] = callback;

    this._deflate.write(data);
    this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
      if (!this._deflate) {
        //
        // The deflate stream was closed while data was being processed.
        //
        return;
      }

      let data = bufferUtil.concat(
        this._deflate[kBuffers],
        this._deflate[kTotalLength]
      );

      if (fin) data = data.slice(0, data.length - 4);

      //
      // Ensure that the callback will not be called again in
      // `PerMessageDeflate#cleanup()`.
      //
      this._deflate[kCallback] = null;

      this._deflate[kTotalLength] = 0;
      this._deflate[kBuffers] = [];

      if (fin && this.params[`${endpoint}_no_context_takeover`]) {
        this._deflate.reset();
      }

      callback(null, data);
    });
  }
}

module.exports = PerMessageDeflate;

/**
 * The listener of the `zlib.DeflateRaw` stream `'data'` event.
 *
 * @param {Buffer} chunk A chunk of data
 * @private
 */
function deflateOnData(chunk) {
  this[kBuffers].push(chunk);
  this[kTotalLength] += chunk.length;
}

/**
 * The listener of the `zlib.InflateRaw` stream `'data'` event.
 *
 * @param {Buffer} chunk A chunk of data
 * @private
 */
function inflateOnData(chunk) {
  this[kTotalLength] += chunk.length;

  if (
    this[kPerMessageDeflate]._maxPayload < 1 ||
    this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload
  ) {
    this[kBuffers].push(chunk);
    return;
  }

  this[kError] = new RangeError('Max payload size exceeded');
  this[kError].code = 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH';
  this[kError][kStatusCode] = 1009;
  this.removeListener('data', inflateOnData);
  this.reset();
}

/**
 * The listener of the `zlib.InflateRaw` stream `'error'` event.
 *
 * @param {Error} err The emitted error
 * @private
 */
function inflateOnError(err) {
  //
  // There is no need to call `Zlib#close()` as the handle is automatically
  // closed when an error is emitted.
  //
  this[kPerMessageDeflate]._inflate = null;
  err[kStatusCode] = 1007;
  this[kCallback](err);
}


/***/ }),

/***/ 5066:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const { Writable } = __nccwpck_require__(2781);

const PerMessageDeflate = __nccwpck_require__(6684);
const {
  BINARY_TYPES,
  EMPTY_BUFFER,
  kStatusCode,
  kWebSocket
} = __nccwpck_require__(5949);
const { concat, toArrayBuffer, unmask } = __nccwpck_require__(9436);
const { isValidStatusCode, isValidUTF8 } = __nccwpck_require__(6279);

const GET_INFO = 0;
const GET_PAYLOAD_LENGTH_16 = 1;
const GET_PAYLOAD_LENGTH_64 = 2;
const GET_MASK = 3;
const GET_DATA = 4;
const INFLATING = 5;

/**
 * HyBi Receiver implementation.
 *
 * @extends Writable
 */
class Receiver extends Writable {
  /**
   * Creates a Receiver instance.
   *
   * @param {Object} [options] Options object
   * @param {String} [options.binaryType=nodebuffer] The type for binary data
   * @param {Object} [options.extensions] An object containing the negotiated
   *     extensions
   * @param {Boolean} [options.isServer=false] Specifies whether to operate in
   *     client or server mode
   * @param {Number} [options.maxPayload=0] The maximum allowed message length
   * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
   *     not to skip UTF-8 validation for text and close messages
   */
  constructor(options = {}) {
    super();

    this._binaryType = options.binaryType || BINARY_TYPES[0];
    this._extensions = options.extensions || {};
    this._isServer = !!options.isServer;
    this._maxPayload = options.maxPayload | 0;
    this._skipUTF8Validation = !!options.skipUTF8Validation;
    this[kWebSocket] = undefined;

    this._bufferedBytes = 0;
    this._buffers = [];

    this._compressed = false;
    this._payloadLength = 0;
    this._mask = undefined;
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

  /**
   * Implements `Writable.prototype._write()`.
   *
   * @param {Buffer} chunk The chunk of data to write
   * @param {String} encoding The character encoding of `chunk`
   * @param {Function} cb Callback
   * @private
   */
  _write(chunk, encoding, cb) {
    if (this._opcode === 0x08 && this._state == GET_INFO) return cb();

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

  /**
   * Starts the parsing loop.
   *
   * @param {Function} cb Callback
   * @private
   */
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
          // `INFLATING`
          this._loop = false;
          return;
      }
    } while (this._loop);

    cb(err);
  }

  /**
   * Reads the first two bytes of a frame.
   *
   * @return {(RangeError|undefined)} A possible error
   * @private
   */
  getInfo() {
    if (this._bufferedBytes < 2) {
      this._loop = false;
      return;
    }

    const buf = this.consume(2);

    if ((buf[0] & 0x30) !== 0x00) {
      this._loop = false;
      return error(
        RangeError,
        'RSV2 and RSV3 must be clear',
        true,
        1002,
        'WS_ERR_UNEXPECTED_RSV_2_3'
      );
    }

    const compressed = (buf[0] & 0x40) === 0x40;

    if (compressed && !this._extensions[PerMessageDeflate.extensionName]) {
      this._loop = false;
      return error(
        RangeError,
        'RSV1 must be clear',
        true,
        1002,
        'WS_ERR_UNEXPECTED_RSV_1'
      );
    }

    this._fin = (buf[0] & 0x80) === 0x80;
    this._opcode = buf[0] & 0x0f;
    this._payloadLength = buf[1] & 0x7f;

    if (this._opcode === 0x00) {
      if (compressed) {
        this._loop = false;
        return error(
          RangeError,
          'RSV1 must be clear',
          true,
          1002,
          'WS_ERR_UNEXPECTED_RSV_1'
        );
      }

      if (!this._fragmented) {
        this._loop = false;
        return error(
          RangeError,
          'invalid opcode 0',
          true,
          1002,
          'WS_ERR_INVALID_OPCODE'
        );
      }

      this._opcode = this._fragmented;
    } else if (this._opcode === 0x01 || this._opcode === 0x02) {
      if (this._fragmented) {
        this._loop = false;
        return error(
          RangeError,
          `invalid opcode ${this._opcode}`,
          true,
          1002,
          'WS_ERR_INVALID_OPCODE'
        );
      }

      this._compressed = compressed;
    } else if (this._opcode > 0x07 && this._opcode < 0x0b) {
      if (!this._fin) {
        this._loop = false;
        return error(
          RangeError,
          'FIN must be set',
          true,
          1002,
          'WS_ERR_EXPECTED_FIN'
        );
      }

      if (compressed) {
        this._loop = false;
        return error(
          RangeError,
          'RSV1 must be clear',
          true,
          1002,
          'WS_ERR_UNEXPECTED_RSV_1'
        );
      }

      if (this._payloadLength > 0x7d) {
        this._loop = false;
        return error(
          RangeError,
          `invalid payload length ${this._payloadLength}`,
          true,
          1002,
          'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH'
        );
      }
    } else {
      this._loop = false;
      return error(
        RangeError,
        `invalid opcode ${this._opcode}`,
        true,
        1002,
        'WS_ERR_INVALID_OPCODE'
      );
    }

    if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
    this._masked = (buf[1] & 0x80) === 0x80;

    if (this._isServer) {
      if (!this._masked) {
        this._loop = false;
        return error(
          RangeError,
          'MASK must be set',
          true,
          1002,
          'WS_ERR_EXPECTED_MASK'
        );
      }
    } else if (this._masked) {
      this._loop = false;
      return error(
        RangeError,
        'MASK must be clear',
        true,
        1002,
        'WS_ERR_UNEXPECTED_MASK'
      );
    }

    if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
    else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
    else return this.haveLength();
  }

  /**
   * Gets extended payload length (7+16).
   *
   * @return {(RangeError|undefined)} A possible error
   * @private
   */
  getPayloadLength16() {
    if (this._bufferedBytes < 2) {
      this._loop = false;
      return;
    }

    this._payloadLength = this.consume(2).readUInt16BE(0);
    return this.haveLength();
  }

  /**
   * Gets extended payload length (7+64).
   *
   * @return {(RangeError|undefined)} A possible error
   * @private
   */
  getPayloadLength64() {
    if (this._bufferedBytes < 8) {
      this._loop = false;
      return;
    }

    const buf = this.consume(8);
    const num = buf.readUInt32BE(0);

    //
    // The maximum safe integer in JavaScript is 2^53 - 1. An error is returned
    // if payload length is greater than this number.
    //
    if (num > Math.pow(2, 53 - 32) - 1) {
      this._loop = false;
      return error(
        RangeError,
        'Unsupported WebSocket frame: payload length > 2^53 - 1',
        false,
        1009,
        'WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH'
      );
    }

    this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
    return this.haveLength();
  }

  /**
   * Payload length has been read.
   *
   * @return {(RangeError|undefined)} A possible error
   * @private
   */
  haveLength() {
    if (this._payloadLength && this._opcode < 0x08) {
      this._totalPayloadLength += this._payloadLength;
      if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
        this._loop = false;
        return error(
          RangeError,
          'Max payload size exceeded',
          false,
          1009,
          'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'
        );
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
   * @return {(Error|RangeError|undefined)} A possible error
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

      if (
        this._masked &&
        (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0
      ) {
        unmask(data, this._mask);
      }
    }

    if (this._opcode > 0x07) return this.controlMessage(data);

    if (this._compressed) {
      this._state = INFLATING;
      this.decompress(data, cb);
      return;
    }

    if (data.length) {
      //
      // This message is not compressed so its length is the sum of the payload
      // length of all fragments.
      //
      this._messageLength = this._totalPayloadLength;
      this._fragments.push(data);
    }

    return this.dataMessage();
  }

  /**
   * Decompresses data.
   *
   * @param {Buffer} data Compressed data
   * @param {Function} cb Callback
   * @private
   */
  decompress(data, cb) {
    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];

    perMessageDeflate.decompress(data, this._fin, (err, buf) => {
      if (err) return cb(err);

      if (buf.length) {
        this._messageLength += buf.length;
        if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
          return cb(
            error(
              RangeError,
              'Max payload size exceeded',
              false,
              1009,
              'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'
            )
          );
        }

        this._fragments.push(buf);
      }

      const er = this.dataMessage();
      if (er) return cb(er);

      this.startLoop(cb);
    });
  }

  /**
   * Handles a data message.
   *
   * @return {(Error|undefined)} A possible error
   * @private
   */
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

        if (this._binaryType === 'nodebuffer') {
          data = concat(fragments, messageLength);
        } else if (this._binaryType === 'arraybuffer') {
          data = toArrayBuffer(concat(fragments, messageLength));
        } else {
          data = fragments;
        }

        this.emit('message', data, true);
      } else {
        const buf = concat(fragments, messageLength);

        if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
          this._loop = false;
          return error(
            Error,
            'invalid UTF-8 sequence',
            true,
            1007,
            'WS_ERR_INVALID_UTF8'
          );
        }

        this.emit('message', buf, false);
      }
    }

    this._state = GET_INFO;
  }

  /**
   * Handles a control message.
   *
   * @param {Buffer} data Data to handle
   * @return {(Error|RangeError|undefined)} A possible error
   * @private
   */
  controlMessage(data) {
    if (this._opcode === 0x08) {
      this._loop = false;

      if (data.length === 0) {
        this.emit('conclude', 1005, EMPTY_BUFFER);
        this.end();
      } else if (data.length === 1) {
        return error(
          RangeError,
          'invalid payload length 1',
          true,
          1002,
          'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH'
        );
      } else {
        const code = data.readUInt16BE(0);

        if (!isValidStatusCode(code)) {
          return error(
            RangeError,
            `invalid status code ${code}`,
            true,
            1002,
            'WS_ERR_INVALID_CLOSE_CODE'
          );
        }

        const buf = data.slice(2);

        if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
          return error(
            Error,
            'invalid UTF-8 sequence',
            true,
            1007,
            'WS_ERR_INVALID_UTF8'
          );
        }

        this.emit('conclude', code, buf);
        this.end();
      }
    } else if (this._opcode === 0x09) {
      this.emit('ping', data);
    } else {
      this.emit('pong', data);
    }

    this._state = GET_INFO;
  }
}

module.exports = Receiver;

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
function error(ErrorCtor, message, prefix, statusCode, errorCode) {
  const err = new ErrorCtor(
    prefix ? `Invalid WebSocket frame: ${message}` : message
  );

  Error.captureStackTrace(err, error);
  err.code = errorCode;
  err[kStatusCode] = statusCode;
  return err;
}


/***/ }),

/***/ 6947:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^net|tls$" }] */



const net = __nccwpck_require__(1808);
const tls = __nccwpck_require__(4404);
const { randomFillSync } = __nccwpck_require__(6113);

const PerMessageDeflate = __nccwpck_require__(6684);
const { EMPTY_BUFFER } = __nccwpck_require__(5949);
const { isValidStatusCode } = __nccwpck_require__(6279);
const { mask: applyMask, toBuffer } = __nccwpck_require__(9436);

const kByteLength = Symbol('kByteLength');
const maskBuffer = Buffer.alloc(4);

/**
 * HyBi Sender implementation.
 */
class Sender {
  /**
   * Creates a Sender instance.
   *
   * @param {(net.Socket|tls.Socket)} socket The connection socket
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
    this._deflating = false;
    this._queue = [];
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
        randomFillSync(mask, 0, 4);
      }

      skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
      offset = 6;
    }

    let dataLength;

    if (typeof data === 'string') {
      if (
        (!options.mask || skipMasking) &&
        options[kByteLength] !== undefined
      ) {
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

    target[0] = options.fin ? options.opcode | 0x80 : options.opcode;
    if (options.rsv1) target[0] |= 0x40;

    target[1] = payloadLength;

    if (payloadLength === 126) {
      target.writeUInt16BE(dataLength, 2);
    } else if (payloadLength === 127) {
      target[2] = target[3] = 0;
      target.writeUIntBE(dataLength, 4, 6);
    }

    if (!options.mask) return [target, data];

    target[1] |= 0x80;
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

    if (code === undefined) {
      buf = EMPTY_BUFFER;
    } else if (typeof code !== 'number' || !isValidStatusCode(code)) {
      throw new TypeError('First argument must be a valid error code number');
    } else if (data === undefined || !data.length) {
      buf = Buffer.allocUnsafe(2);
      buf.writeUInt16BE(code, 0);
    } else {
      const length = Buffer.byteLength(data);

      if (length > 123) {
        throw new RangeError('The message must not be greater than 123 bytes');
      }

      buf = Buffer.allocUnsafe(2 + length);
      buf.writeUInt16BE(code, 0);

      if (typeof data === 'string') {
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
      opcode: 0x08,
      readOnly: false,
      rsv1: false
    };

    if (this._deflating) {
      this.enqueue([this.dispatch, buf, false, options, cb]);
    } else {
      this.sendFrame(Sender.frame(buf, options), cb);
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

    if (typeof data === 'string') {
      byteLength = Buffer.byteLength(data);
      readOnly = false;
    } else {
      data = toBuffer(data);
      byteLength = data.length;
      readOnly = toBuffer.readOnly;
    }

    if (byteLength > 125) {
      throw new RangeError('The data size must not be greater than 125 bytes');
    }

    const options = {
      [kByteLength]: byteLength,
      fin: true,
      generateMask: this._generateMask,
      mask,
      maskBuffer: this._maskBuffer,
      opcode: 0x09,
      readOnly,
      rsv1: false
    };

    if (this._deflating) {
      this.enqueue([this.dispatch, data, false, options, cb]);
    } else {
      this.sendFrame(Sender.frame(data, options), cb);
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

    if (typeof data === 'string') {
      byteLength = Buffer.byteLength(data);
      readOnly = false;
    } else {
      data = toBuffer(data);
      byteLength = data.length;
      readOnly = toBuffer.readOnly;
    }

    if (byteLength > 125) {
      throw new RangeError('The data size must not be greater than 125 bytes');
    }

    const options = {
      [kByteLength]: byteLength,
      fin: true,
      generateMask: this._generateMask,
      mask,
      maskBuffer: this._maskBuffer,
      opcode: 0x0a,
      readOnly,
      rsv1: false
    };

    if (this._deflating) {
      this.enqueue([this.dispatch, data, false, options, cb]);
    } else {
      this.sendFrame(Sender.frame(data, options), cb);
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
    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
    let opcode = options.binary ? 2 : 1;
    let rsv1 = options.compress;

    let byteLength;
    let readOnly;

    if (typeof data === 'string') {
      byteLength = Buffer.byteLength(data);
      readOnly = false;
    } else {
      data = toBuffer(data);
      byteLength = data.length;
      readOnly = toBuffer.readOnly;
    }

    if (this._firstFragment) {
      this._firstFragment = false;
      if (
        rsv1 &&
        perMessageDeflate &&
        perMessageDeflate.params[
          perMessageDeflate._isServer
            ? 'server_no_context_takeover'
            : 'client_no_context_takeover'
        ]
      ) {
        rsv1 = byteLength >= perMessageDeflate._threshold;
      }
      this._compress = rsv1;
    } else {
      rsv1 = false;
      opcode = 0;
    }

    if (options.fin) this._firstFragment = true;

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
      this.sendFrame(
        Sender.frame(data, {
          [kByteLength]: byteLength,
          fin: options.fin,
          generateMask: this._generateMask,
          mask: options.mask,
          maskBuffer: this._maskBuffer,
          opcode,
          readOnly,
          rsv1: false
        }),
        cb
      );
    }
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
      this.sendFrame(Sender.frame(data, options), cb);
      return;
    }

    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];

    this._bufferedBytes += options[kByteLength];
    this._deflating = true;
    perMessageDeflate.compress(data, options.fin, (_, buf) => {
      if (this._socket.destroyed) {
        const err = new Error(
          'The socket was closed while data was being compressed'
        );

        if (typeof cb === 'function') cb(err);

        for (let i = 0; i < this._queue.length; i++) {
          const params = this._queue[i];
          const callback = params[params.length - 1];

          if (typeof callback === 'function') callback(err);
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

  /**
   * Executes queued send operations.
   *
   * @private
   */
  dequeue() {
    while (!this._deflating && this._queue.length) {
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
   * @param {Buffer[]} list The frame to send
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
}

module.exports = Sender;


/***/ }),

/***/ 1658:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const { Duplex } = __nccwpck_require__(2781);

/**
 * Emits the `'close'` event on a stream.
 *
 * @param {Duplex} stream The stream.
 * @private
 */
function emitClose(stream) {
  stream.emit('close');
}

/**
 * The listener of the `'end'` event.
 *
 * @private
 */
function duplexOnEnd() {
  if (!this.destroyed && this._writableState.finished) {
    this.destroy();
  }
}

/**
 * The listener of the `'error'` event.
 *
 * @param {Error} err The error
 * @private
 */
function duplexOnError(err) {
  this.removeListener('error', duplexOnError);
  this.destroy();
  if (this.listenerCount('error') === 0) {
    // Do not suppress the throwing behavior.
    this.emit('error', err);
  }
}

/**
 * Wraps a `WebSocket` in a duplex stream.
 *
 * @param {WebSocket} ws The `WebSocket` to wrap
 * @param {Object} [options] The options for the `Duplex` constructor
 * @return {Duplex} The duplex stream
 * @public
 */
function createWebSocketStream(ws, options) {
  let terminateOnDestroy = true;

  const duplex = new Duplex({
    ...options,
    autoDestroy: false,
    emitClose: false,
    objectMode: false,
    writableObjectMode: false
  });

  ws.on('message', function message(msg, isBinary) {
    const data =
      !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;

    if (!duplex.push(data)) ws.pause();
  });

  ws.once('error', function error(err) {
    if (duplex.destroyed) return;

    // Prevent `ws.terminate()` from being called by `duplex._destroy()`.
    //
    // - If the `'error'` event is emitted before the `'open'` event, then
    //   `ws.terminate()` is a noop as no socket is assigned.
    // - Otherwise, the error is re-emitted by the listener of the `'error'`
    //   event of the `Receiver` object. The listener already closes the
    //   connection by calling `ws.close()`. This allows a close frame to be
    //   sent to the other peer. If `ws.terminate()` is called right after this,
    //   then the close frame might not be sent.
    terminateOnDestroy = false;
    duplex.destroy(err);
  });

  ws.once('close', function close() {
    if (duplex.destroyed) return;

    duplex.push(null);
  });

  duplex._destroy = function (err, callback) {
    if (ws.readyState === ws.CLOSED) {
      callback(err);
      process.nextTick(emitClose, duplex);
      return;
    }

    let called = false;

    ws.once('error', function error(err) {
      called = true;
      callback(err);
    });

    ws.once('close', function close() {
      if (!called) callback(err);
      process.nextTick(emitClose, duplex);
    });

    if (terminateOnDestroy) ws.terminate();
  };

  duplex._final = function (callback) {
    if (ws.readyState === ws.CONNECTING) {
      ws.once('open', function open() {
        duplex._final(callback);
      });
      return;
    }

    // If the value of the `_socket` property is `null` it means that `ws` is a
    // client websocket and the handshake failed. In fact, when this happens, a
    // socket is never assigned to the websocket. Wait for the `'error'` event
    // that will be emitted by the websocket.
    if (ws._socket === null) return;

    if (ws._socket._writableState.finished) {
      callback();
      if (duplex._readableState.endEmitted) duplex.destroy();
    } else {
      ws._socket.once('finish', function finish() {
        // `duplex` is not destroyed here because the `'end'` event will be
        // emitted on `duplex` after this `'finish'` event. The EOF signaling
        // `null` chunk is, in fact, pushed when the websocket emits `'close'`.
        callback();
      });
      ws.close();
    }
  };

  duplex._read = function () {
    if (ws.isPaused) ws.resume();
  };

  duplex._write = function (chunk, encoding, callback) {
    if (ws.readyState === ws.CONNECTING) {
      ws.once('open', function open() {
        duplex._write(chunk, encoding, callback);
      });
      return;
    }

    ws.send(chunk, callback);
  };

  duplex.on('end', duplexOnEnd);
  duplex.on('error', duplexOnError);
  return duplex;
}

module.exports = createWebSocketStream;


/***/ }),

/***/ 6668:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const { tokenChars } = __nccwpck_require__(6279);

/**
 * Parses the `Sec-WebSocket-Protocol` header into a set of subprotocol names.
 *
 * @param {String} header The field value of the header
 * @return {Set} The subprotocol names
 * @public
 */
function parse(header) {
  const protocols = new Set();
  let start = -1;
  let end = -1;
  let i = 0;

  for (i; i < header.length; i++) {
    const code = header.charCodeAt(i);

    if (end === -1 && tokenChars[code] === 1) {
      if (start === -1) start = i;
    } else if (
      i !== 0 &&
      (code === 0x20 /* ' ' */ || code === 0x09) /* '\t' */
    ) {
      if (end === -1 && start !== -1) end = i;
    } else if (code === 0x2c /* ',' */) {
      if (start === -1) {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }

      if (end === -1) end = i;

      const protocol = header.slice(start, end);

      if (protocols.has(protocol)) {
        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
      }

      protocols.add(protocol);
      start = end = -1;
    } else {
      throw new SyntaxError(`Unexpected character at index ${i}`);
    }
  }

  if (start === -1 || end !== -1) {
    throw new SyntaxError('Unexpected end of input');
  }

  const protocol = header.slice(start, i);

  if (protocols.has(protocol)) {
    throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
  }

  protocols.add(protocol);
  return protocols;
}

module.exports = { parse };


/***/ }),

/***/ 6279:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


//
// Allowed token characters:
//
// '!', '#', '$', '%', '&', ''', '*', '+', '-',
// '.', 0-9, A-Z, '^', '_', '`', a-z, '|', '~'
//
// tokenChars[32] === 0 // ' '
// tokenChars[33] === 1 // '!'
// tokenChars[34] === 0 // '"'
// ...
//
// prettier-ignore
const tokenChars = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 0 - 15
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 16 - 31
  0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, // 32 - 47
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, // 48 - 63
  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 64 - 79
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, // 80 - 95
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 96 - 111
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0 // 112 - 127
];

/**
 * Checks if a status code is allowed in a close frame.
 *
 * @param {Number} code The status code
 * @return {Boolean} `true` if the status code is valid, else `false`
 * @public
 */
function isValidStatusCode(code) {
  return (
    (code >= 1000 &&
      code <= 1014 &&
      code !== 1004 &&
      code !== 1005 &&
      code !== 1006) ||
    (code >= 3000 && code <= 4999)
  );
}

/**
 * Checks if a given buffer contains only correct UTF-8.
 * Ported from https://www.cl.cam.ac.uk/%7Emgk25/ucs/utf8_check.c by
 * Markus Kuhn.
 *
 * @param {Buffer} buf The buffer to check
 * @return {Boolean} `true` if `buf` contains only correct UTF-8, else `false`
 * @public
 */
function _isValidUTF8(buf) {
  const len = buf.length;
  let i = 0;

  while (i < len) {
    if ((buf[i] & 0x80) === 0) {
      // 0xxxxxxx
      i++;
    } else if ((buf[i] & 0xe0) === 0xc0) {
      // 110xxxxx 10xxxxxx
      if (
        i + 1 === len ||
        (buf[i + 1] & 0xc0) !== 0x80 ||
        (buf[i] & 0xfe) === 0xc0 // Overlong
      ) {
        return false;
      }

      i += 2;
    } else if ((buf[i] & 0xf0) === 0xe0) {
      // 1110xxxx 10xxxxxx 10xxxxxx
      if (
        i + 2 >= len ||
        (buf[i + 1] & 0xc0) !== 0x80 ||
        (buf[i + 2] & 0xc0) !== 0x80 ||
        (buf[i] === 0xe0 && (buf[i + 1] & 0xe0) === 0x80) || // Overlong
        (buf[i] === 0xed && (buf[i + 1] & 0xe0) === 0xa0) // Surrogate (U+D800 - U+DFFF)
      ) {
        return false;
      }

      i += 3;
    } else if ((buf[i] & 0xf8) === 0xf0) {
      // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
      if (
        i + 3 >= len ||
        (buf[i + 1] & 0xc0) !== 0x80 ||
        (buf[i + 2] & 0xc0) !== 0x80 ||
        (buf[i + 3] & 0xc0) !== 0x80 ||
        (buf[i] === 0xf0 && (buf[i + 1] & 0xf0) === 0x80) || // Overlong
        (buf[i] === 0xf4 && buf[i + 1] > 0x8f) ||
        buf[i] > 0xf4 // > U+10FFFF
      ) {
        return false;
      }

      i += 4;
    } else {
      return false;
    }
  }

  return true;
}

module.exports = {
  isValidStatusCode,
  isValidUTF8: _isValidUTF8,
  tokenChars
};

/* istanbul ignore else  */
if (!process.env.WS_NO_UTF_8_VALIDATE) {
  try {
    const isValidUTF8 = __nccwpck_require__(4592);

    module.exports.isValidUTF8 = function (buf) {
      return buf.length < 150 ? _isValidUTF8(buf) : isValidUTF8(buf);
    };
  } catch (e) {
    // Continue regardless of the error.
  }
}


/***/ }),

/***/ 8887:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^net|tls|https$" }] */



const EventEmitter = __nccwpck_require__(2361);
const http = __nccwpck_require__(3685);
const https = __nccwpck_require__(5687);
const net = __nccwpck_require__(1808);
const tls = __nccwpck_require__(4404);
const { createHash } = __nccwpck_require__(6113);

const extension = __nccwpck_require__(2035);
const PerMessageDeflate = __nccwpck_require__(6684);
const subprotocol = __nccwpck_require__(6668);
const WebSocket = __nccwpck_require__(1518);
const { GUID, kWebSocket } = __nccwpck_require__(5949);

const keyRegex = /^[+/0-9A-Za-z]{22}==$/;

const RUNNING = 0;
const CLOSING = 1;
const CLOSED = 2;

/**
 * Class representing a WebSocket server.
 *
 * @extends EventEmitter
 */
class WebSocketServer extends EventEmitter {
  /**
   * Create a `WebSocketServer` instance.
   *
   * @param {Object} options Configuration options
   * @param {Number} [options.backlog=511] The maximum length of the queue of
   *     pending connections
   * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
   *     track clients
   * @param {Function} [options.handleProtocols] A hook to handle protocols
   * @param {String} [options.host] The hostname where to bind the server
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
      maxPayload: 100 * 1024 * 1024,
      skipUTF8Validation: false,
      perMessageDeflate: false,
      handleProtocols: null,
      clientTracking: true,
      verifyClient: null,
      noServer: false,
      backlog: null, // use default (511 as implemented in net.js)
      server: null,
      host: null,
      path: null,
      port: null,
      WebSocket,
      ...options
    };

    if (
      (options.port == null && !options.server && !options.noServer) ||
      (options.port != null && (options.server || options.noServer)) ||
      (options.server && options.noServer)
    ) {
      throw new TypeError(
        'One and only one of the "port", "server", or "noServer" options ' +
          'must be specified'
      );
    }

    if (options.port != null) {
      this._server = http.createServer((req, res) => {
        const body = http.STATUS_CODES[426];

        res.writeHead(426, {
          'Content-Length': body.length,
          'Content-Type': 'text/plain'
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
      const emitConnection = this.emit.bind(this, 'connection');

      this._removeListeners = addListeners(this._server, {
        listening: this.emit.bind(this, 'listening'),
        error: this.emit.bind(this, 'error'),
        upgrade: (req, socket, head) => {
          this.handleUpgrade(req, socket, head, emitConnection);
        }
      });
    }

    if (options.perMessageDeflate === true) options.perMessageDeflate = {};
    if (options.clientTracking) {
      this.clients = new Set();
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
        this.once('close', () => {
          cb(new Error('The server is not running'));
        });
      }

      process.nextTick(emitClose, this);
      return;
    }

    if (cb) this.once('close', cb);

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

      //
      // The HTTP/S server was created internally. Close it, and rely on its
      // `'close'` event.
      //
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
      const index = req.url.indexOf('?');
      const pathname = index !== -1 ? req.url.slice(0, index) : req.url;

      if (pathname !== this.options.path) return false;
    }

    return true;
  }

  /**
   * Handle a HTTP Upgrade request.
   *
   * @param {http.IncomingMessage} req The request object
   * @param {(net.Socket|tls.Socket)} socket The network socket between the
   *     server and client
   * @param {Buffer} head The first packet of the upgraded stream
   * @param {Function} cb Callback
   * @public
   */
  handleUpgrade(req, socket, head, cb) {
    socket.on('error', socketOnError);

    const key = req.headers['sec-websocket-key'];
    const version = +req.headers['sec-websocket-version'];

    if (req.method !== 'GET') {
      const message = 'Invalid HTTP method';
      abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
      return;
    }

    if (req.headers.upgrade.toLowerCase() !== 'websocket') {
      const message = 'Invalid Upgrade header';
      abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
      return;
    }

    if (!key || !keyRegex.test(key)) {
      const message = 'Missing or invalid Sec-WebSocket-Key header';
      abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
      return;
    }

    if (version !== 8 && version !== 13) {
      const message = 'Missing or invalid Sec-WebSocket-Version header';
      abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
      return;
    }

    if (!this.shouldHandle(req)) {
      abortHandshake(socket, 400);
      return;
    }

    const secWebSocketProtocol = req.headers['sec-websocket-protocol'];
    let protocols = new Set();

    if (secWebSocketProtocol !== undefined) {
      try {
        protocols = subprotocol.parse(secWebSocketProtocol);
      } catch (err) {
        const message = 'Invalid Sec-WebSocket-Protocol header';
        abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
        return;
      }
    }

    const secWebSocketExtensions = req.headers['sec-websocket-extensions'];
    const extensions = {};

    if (
      this.options.perMessageDeflate &&
      secWebSocketExtensions !== undefined
    ) {
      const perMessageDeflate = new PerMessageDeflate(
        this.options.perMessageDeflate,
        true,
        this.options.maxPayload
      );

      try {
        const offers = extension.parse(secWebSocketExtensions);

        if (offers[PerMessageDeflate.extensionName]) {
          perMessageDeflate.accept(offers[PerMessageDeflate.extensionName]);
          extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
        }
      } catch (err) {
        const message =
          'Invalid or unacceptable Sec-WebSocket-Extensions header';
        abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
        return;
      }
    }

    //
    // Optionally call external client verification handler.
    //
    if (this.options.verifyClient) {
      const info = {
        origin:
          req.headers[`${version === 8 ? 'sec-websocket-origin' : 'origin'}`],
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
   * @param {(net.Socket|tls.Socket)} socket The network socket between the
   *     server and client
   * @param {Buffer} head The first packet of the upgraded stream
   * @param {Function} cb Callback
   * @throws {Error} If called more than once with the same socket
   * @private
   */
  completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
    //
    // Destroy the socket if the client has already sent a FIN packet.
    //
    if (!socket.readable || !socket.writable) return socket.destroy();

    if (socket[kWebSocket]) {
      throw new Error(
        'server.handleUpgrade() was called more than once with the same ' +
          'socket, possibly due to a misconfiguration'
      );
    }

    if (this._state > RUNNING) return abortHandshake(socket, 503);

    const digest = createHash('sha1')
      .update(key + GUID)
      .digest('base64');

    const headers = [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${digest}`
    ];

    const ws = new this.options.WebSocket(null);

    if (protocols.size) {
      //
      // Optionally call external protocol selection handler.
      //
      const protocol = this.options.handleProtocols
        ? this.options.handleProtocols(protocols, req)
        : protocols.values().next().value;

      if (protocol) {
        headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
        ws._protocol = protocol;
      }
    }

    if (extensions[PerMessageDeflate.extensionName]) {
      const params = extensions[PerMessageDeflate.extensionName].params;
      const value = extension.format({
        [PerMessageDeflate.extensionName]: [params]
      });
      headers.push(`Sec-WebSocket-Extensions: ${value}`);
      ws._extensions = extensions;
    }

    //
    // Allow external modification/inspection of handshake headers.
    //
    this.emit('headers', headers, req);

    socket.write(headers.concat('\r\n').join('\r\n'));
    socket.removeListener('error', socketOnError);

    ws.setSocket(socket, head, {
      maxPayload: this.options.maxPayload,
      skipUTF8Validation: this.options.skipUTF8Validation
    });

    if (this.clients) {
      this.clients.add(ws);
      ws.on('close', () => {
        this.clients.delete(ws);

        if (this._shouldEmitClose && !this.clients.size) {
          process.nextTick(emitClose, this);
        }
      });
    }

    cb(ws, req);
  }
}

module.exports = WebSocketServer;

/**
 * Add event listeners on an `EventEmitter` using a map of <event, listener>
 * pairs.
 *
 * @param {EventEmitter} server The event emitter
 * @param {Object.<String, Function>} map The listeners to add
 * @return {Function} A function that will remove the added listeners when
 *     called
 * @private
 */
function addListeners(server, map) {
  for (const event of Object.keys(map)) server.on(event, map[event]);

  return function removeListeners() {
    for (const event of Object.keys(map)) {
      server.removeListener(event, map[event]);
    }
  };
}

/**
 * Emit a `'close'` event on an `EventEmitter`.
 *
 * @param {EventEmitter} server The event emitter
 * @private
 */
function emitClose(server) {
  server._state = CLOSED;
  server.emit('close');
}

/**
 * Handle socket errors.
 *
 * @private
 */
function socketOnError() {
  this.destroy();
}

/**
 * Close the connection when preconditions are not fulfilled.
 *
 * @param {(net.Socket|tls.Socket)} socket The socket of the upgrade request
 * @param {Number} code The HTTP response status code
 * @param {String} [message] The HTTP response body
 * @param {Object} [headers] Additional HTTP response headers
 * @private
 */
function abortHandshake(socket, code, message, headers) {
  //
  // The socket is writable unless the user destroyed or ended it before calling
  // `server.handleUpgrade()` or in the `verifyClient` function, which is a user
  // error. Handling this does not make much sense as the worst that can happen
  // is that some of the data written by the user might be discarded due to the
  // call to `socket.end()` below, which triggers an `'error'` event that in
  // turn causes the socket to be destroyed.
  //
  message = message || http.STATUS_CODES[code];
  headers = {
    Connection: 'close',
    'Content-Type': 'text/html',
    'Content-Length': Buffer.byteLength(message),
    ...headers
  };

  socket.once('finish', socket.destroy);

  socket.end(
    `HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r\n` +
      Object.keys(headers)
        .map((h) => `${h}: ${headers[h]}`)
        .join('\r\n') +
      '\r\n\r\n' +
      message
  );
}

/**
 * Emit a `'wsClientError'` event on a `WebSocketServer` if there is at least
 * one listener for it, otherwise call `abortHandshake()`.
 *
 * @param {WebSocketServer} server The WebSocket server
 * @param {http.IncomingMessage} req The request object
 * @param {(net.Socket|tls.Socket)} socket The socket of the upgrade request
 * @param {Number} code The HTTP response status code
 * @param {String} message The HTTP response body
 * @private
 */
function abortHandshakeOrEmitwsClientError(server, req, socket, code, message) {
  if (server.listenerCount('wsClientError')) {
    const err = new Error(message);
    Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);

    server.emit('wsClientError', err, socket, req);
  } else {
    abortHandshake(socket, code, message);
  }
}


/***/ }),

/***/ 1518:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^Readable$" }] */



const EventEmitter = __nccwpck_require__(2361);
const https = __nccwpck_require__(5687);
const http = __nccwpck_require__(3685);
const net = __nccwpck_require__(1808);
const tls = __nccwpck_require__(4404);
const { randomBytes, createHash } = __nccwpck_require__(6113);
const { Readable } = __nccwpck_require__(2781);
const { URL } = __nccwpck_require__(7310);

const PerMessageDeflate = __nccwpck_require__(6684);
const Receiver = __nccwpck_require__(5066);
const Sender = __nccwpck_require__(6947);
const {
  BINARY_TYPES,
  EMPTY_BUFFER,
  GUID,
  kForOnEventAttribute,
  kListener,
  kStatusCode,
  kWebSocket,
  NOOP
} = __nccwpck_require__(5949);
const {
  EventTarget: { addEventListener, removeEventListener }
} = __nccwpck_require__(4561);
const { format, parse } = __nccwpck_require__(2035);
const { toBuffer } = __nccwpck_require__(9436);

const closeTimeout = 30 * 1000;
const kAborted = Symbol('kAborted');
const protocolVersions = [8, 13];
const readyStates = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];
const subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;

/**
 * Class representing a WebSocket.
 *
 * @extends EventEmitter
 */
class WebSocket extends EventEmitter {
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
    this._extensions = {};
    this._paused = false;
    this._protocol = '';
    this._readyState = WebSocket.CONNECTING;
    this._receiver = null;
    this._sender = null;
    this._socket = null;

    if (address !== null) {
      this._bufferedAmount = 0;
      this._isServer = false;
      this._redirects = 0;

      if (protocols === undefined) {
        protocols = [];
      } else if (!Array.isArray(protocols)) {
        if (typeof protocols === 'object' && protocols !== null) {
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

  /**
   * This deviates from the WHATWG interface since ws doesn't support the
   * required default "blob" type (instead we define a custom "nodebuffer"
   * type).
   *
   * @type {String}
   */
  get binaryType() {
    return this._binaryType;
  }

  set binaryType(type) {
    if (!BINARY_TYPES.includes(type)) return;

    this._binaryType = type;

    //
    // Allow to change `binaryType` on the fly.
    //
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
   * @param {(net.Socket|tls.Socket)} socket The network socket between the
   *     server and client
   * @param {Buffer} head The first packet of the upgraded stream
   * @param {Object} options Options object
   * @param {Function} [options.generateMask] The function used to generate the
   *     masking key
   * @param {Number} [options.maxPayload=0] The maximum allowed message size
   * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
   *     not to skip UTF-8 validation for text and close messages
   * @private
   */
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

    receiver.on('conclude', receiverOnConclude);
    receiver.on('drain', receiverOnDrain);
    receiver.on('error', receiverOnError);
    receiver.on('message', receiverOnMessage);
    receiver.on('ping', receiverOnPing);
    receiver.on('pong', receiverOnPong);

    socket.setTimeout(0);
    socket.setNoDelay();

    if (head.length > 0) socket.unshift(head);

    socket.on('close', socketOnClose);
    socket.on('data', socketOnData);
    socket.on('end', socketOnEnd);
    socket.on('error', socketOnError);

    this._readyState = WebSocket.OPEN;
    this.emit('open');
  }

  /**
   * Emit the `'close'` event.
   *
   * @private
   */
  emitClose() {
    if (!this._socket) {
      this._readyState = WebSocket.CLOSED;
      this.emit('close', this._closeCode, this._closeMessage);
      return;
    }

    if (this._extensions[PerMessageDeflate.extensionName]) {
      this._extensions[PerMessageDeflate.extensionName].cleanup();
    }

    this._receiver.removeAllListeners();
    this._readyState = WebSocket.CLOSED;
    this.emit('close', this._closeCode, this._closeMessage);
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
    if (this.readyState === WebSocket.CLOSED) return;
    if (this.readyState === WebSocket.CONNECTING) {
      const msg = 'WebSocket was closed before the connection was established';
      return abortHandshake(this, this._req, msg);
    }

    if (this.readyState === WebSocket.CLOSING) {
      if (
        this._closeFrameSent &&
        (this._closeFrameReceived || this._receiver._writableState.errorEmitted)
      ) {
        this._socket.end();
      }

      return;
    }

    this._readyState = WebSocket.CLOSING;
    this._sender.close(code, data, !this._isServer, (err) => {
      //
      // This error is handled by the `'error'` listener on the socket. We only
      // want to know if the close frame has been sent here.
      //
      if (err) return;

      this._closeFrameSent = true;

      if (
        this._closeFrameReceived ||
        this._receiver._writableState.errorEmitted
      ) {
        this._socket.end();
      }
    });

    //
    // Specify a timeout for the closing handshake to complete.
    //
    this._closeTimer = setTimeout(
      this._socket.destroy.bind(this._socket),
      closeTimeout
    );
  }

  /**
   * Pause the socket.
   *
   * @public
   */
  pause() {
    if (
      this.readyState === WebSocket.CONNECTING ||
      this.readyState === WebSocket.CLOSED
    ) {
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
    if (this.readyState === WebSocket.CONNECTING) {
      throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
    }

    if (typeof data === 'function') {
      cb = data;
      data = mask = undefined;
    } else if (typeof mask === 'function') {
      cb = mask;
      mask = undefined;
    }

    if (typeof data === 'number') data = data.toString();

    if (this.readyState !== WebSocket.OPEN) {
      sendAfterClose(this, data, cb);
      return;
    }

    if (mask === undefined) mask = !this._isServer;
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
    if (this.readyState === WebSocket.CONNECTING) {
      throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
    }

    if (typeof data === 'function') {
      cb = data;
      data = mask = undefined;
    } else if (typeof mask === 'function') {
      cb = mask;
      mask = undefined;
    }

    if (typeof data === 'number') data = data.toString();

    if (this.readyState !== WebSocket.OPEN) {
      sendAfterClose(this, data, cb);
      return;
    }

    if (mask === undefined) mask = !this._isServer;
    this._sender.pong(data || EMPTY_BUFFER, mask, cb);
  }

  /**
   * Resume the socket.
   *
   * @public
   */
  resume() {
    if (
      this.readyState === WebSocket.CONNECTING ||
      this.readyState === WebSocket.CLOSED
    ) {
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
    if (this.readyState === WebSocket.CONNECTING) {
      throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
    }

    if (typeof options === 'function') {
      cb = options;
      options = {};
    }

    if (typeof data === 'number') data = data.toString();

    if (this.readyState !== WebSocket.OPEN) {
      sendAfterClose(this, data, cb);
      return;
    }

    const opts = {
      binary: typeof data !== 'string',
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

  /**
   * Forcibly close the connection.
   *
   * @public
   */
  terminate() {
    if (this.readyState === WebSocket.CLOSED) return;
    if (this.readyState === WebSocket.CONNECTING) {
      const msg = 'WebSocket was closed before the connection was established';
      return abortHandshake(this, this._req, msg);
    }

    if (this._socket) {
      this._readyState = WebSocket.CLOSING;
      this._socket.destroy();
    }
  }
}

/**
 * @constant {Number} CONNECTING
 * @memberof WebSocket
 */
Object.defineProperty(WebSocket, 'CONNECTING', {
  enumerable: true,
  value: readyStates.indexOf('CONNECTING')
});

/**
 * @constant {Number} CONNECTING
 * @memberof WebSocket.prototype
 */
Object.defineProperty(WebSocket.prototype, 'CONNECTING', {
  enumerable: true,
  value: readyStates.indexOf('CONNECTING')
});

/**
 * @constant {Number} OPEN
 * @memberof WebSocket
 */
Object.defineProperty(WebSocket, 'OPEN', {
  enumerable: true,
  value: readyStates.indexOf('OPEN')
});

/**
 * @constant {Number} OPEN
 * @memberof WebSocket.prototype
 */
Object.defineProperty(WebSocket.prototype, 'OPEN', {
  enumerable: true,
  value: readyStates.indexOf('OPEN')
});

/**
 * @constant {Number} CLOSING
 * @memberof WebSocket
 */
Object.defineProperty(WebSocket, 'CLOSING', {
  enumerable: true,
  value: readyStates.indexOf('CLOSING')
});

/**
 * @constant {Number} CLOSING
 * @memberof WebSocket.prototype
 */
Object.defineProperty(WebSocket.prototype, 'CLOSING', {
  enumerable: true,
  value: readyStates.indexOf('CLOSING')
});

/**
 * @constant {Number} CLOSED
 * @memberof WebSocket
 */
Object.defineProperty(WebSocket, 'CLOSED', {
  enumerable: true,
  value: readyStates.indexOf('CLOSED')
});

/**
 * @constant {Number} CLOSED
 * @memberof WebSocket.prototype
 */
Object.defineProperty(WebSocket.prototype, 'CLOSED', {
  enumerable: true,
  value: readyStates.indexOf('CLOSED')
});

[
  'binaryType',
  'bufferedAmount',
  'extensions',
  'isPaused',
  'protocol',
  'readyState',
  'url'
].forEach((property) => {
  Object.defineProperty(WebSocket.prototype, property, { enumerable: true });
});

//
// Add the `onopen`, `onerror`, `onclose`, and `onmessage` attributes.
// See https://html.spec.whatwg.org/multipage/comms.html#the-websocket-interface
//
['open', 'error', 'close', 'message'].forEach((method) => {
  Object.defineProperty(WebSocket.prototype, `on${method}`, {
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

      if (typeof handler !== 'function') return;

      this.addEventListener(method, handler, {
        [kForOnEventAttribute]: true
      });
    }
  });
});

WebSocket.prototype.addEventListener = addEventListener;
WebSocket.prototype.removeEventListener = removeEventListener;

module.exports = WebSocket;

/**
 * Initialize a WebSocket client.
 *
 * @param {WebSocket} websocket The client to initialize
 * @param {(String|URL)} address The URL to which to connect
 * @param {Array} protocols The subprotocols
 * @param {Object} [options] Connection options
 * @param {Boolean} [options.followRedirects=false] Whether or not to follow
 *     redirects
 * @param {Function} [options.generateMask] The function used to generate the
 *     masking key
 * @param {Number} [options.handshakeTimeout] Timeout in milliseconds for the
 *     handshake request
 * @param {Number} [options.maxPayload=104857600] The maximum allowed message
 *     size
 * @param {Number} [options.maxRedirects=10] The maximum number of redirects
 *     allowed
 * @param {String} [options.origin] Value of the `Origin` or
 *     `Sec-WebSocket-Origin` header
 * @param {(Boolean|Object)} [options.perMessageDeflate=true] Enable/disable
 *     permessage-deflate
 * @param {Number} [options.protocolVersion=13] Value of the
 *     `Sec-WebSocket-Version` header
 * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
 *     not to skip UTF-8 validation for text and close messages
 * @private
 */
function initAsClient(websocket, address, protocols, options) {
  const opts = {
    protocolVersion: protocolVersions[1],
    maxPayload: 100 * 1024 * 1024,
    skipUTF8Validation: false,
    perMessageDeflate: true,
    followRedirects: false,
    maxRedirects: 10,
    ...options,
    createConnection: undefined,
    socketPath: undefined,
    hostname: undefined,
    protocol: undefined,
    timeout: undefined,
    method: 'GET',
    host: undefined,
    path: undefined,
    port: undefined
  };

  if (!protocolVersions.includes(opts.protocolVersion)) {
    throw new RangeError(
      `Unsupported protocol version: ${opts.protocolVersion} ` +
        `(supported versions: ${protocolVersions.join(', ')})`
    );
  }

  let parsedUrl;

  if (address instanceof URL) {
    parsedUrl = address;
    websocket._url = address.href;
  } else {
    try {
      parsedUrl = new URL(address);
    } catch (e) {
      throw new SyntaxError(`Invalid URL: ${address}`);
    }

    websocket._url = address;
  }

  const isSecure = parsedUrl.protocol === 'wss:';
  const isUnixSocket = parsedUrl.protocol === 'ws+unix:';
  let invalidURLMessage;

  if (parsedUrl.protocol !== 'ws:' && !isSecure && !isUnixSocket) {
    invalidURLMessage =
      'The URL\'s protocol must be one of "ws:", "wss:", or "ws+unix:"';
  } else if (isUnixSocket && !parsedUrl.pathname) {
    invalidURLMessage = "The URL's pathname is empty";
  } else if (parsedUrl.hash) {
    invalidURLMessage = 'The URL contains a fragment identifier';
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
  const key = randomBytes(16).toString('base64');
  const request = isSecure ? https.request : http.request;
  const protocolSet = new Set();
  let perMessageDeflate;

  opts.createConnection = isSecure ? tlsConnect : netConnect;
  opts.defaultPort = opts.defaultPort || defaultPort;
  opts.port = parsedUrl.port || defaultPort;
  opts.host = parsedUrl.hostname.startsWith('[')
    ? parsedUrl.hostname.slice(1, -1)
    : parsedUrl.hostname;
  opts.headers = {
    'Sec-WebSocket-Version': opts.protocolVersion,
    'Sec-WebSocket-Key': key,
    Connection: 'Upgrade',
    Upgrade: 'websocket',
    ...opts.headers
  };
  opts.path = parsedUrl.pathname + parsedUrl.search;
  opts.timeout = opts.handshakeTimeout;

  if (opts.perMessageDeflate) {
    perMessageDeflate = new PerMessageDeflate(
      opts.perMessageDeflate !== true ? opts.perMessageDeflate : {},
      false,
      opts.maxPayload
    );
    opts.headers['Sec-WebSocket-Extensions'] = format({
      [PerMessageDeflate.extensionName]: perMessageDeflate.offer()
    });
  }
  if (protocols.length) {
    for (const protocol of protocols) {
      if (
        typeof protocol !== 'string' ||
        !subprotocolRegex.test(protocol) ||
        protocolSet.has(protocol)
      ) {
        throw new SyntaxError(
          'An invalid or duplicated subprotocol was specified'
        );
      }

      protocolSet.add(protocol);
    }

    opts.headers['Sec-WebSocket-Protocol'] = protocols.join(',');
  }
  if (opts.origin) {
    if (opts.protocolVersion < 13) {
      opts.headers['Sec-WebSocket-Origin'] = opts.origin;
    } else {
      opts.headers.Origin = opts.origin;
    }
  }
  if (parsedUrl.username || parsedUrl.password) {
    opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
  }

  if (isUnixSocket) {
    const parts = opts.path.split(':');

    opts.socketPath = parts[0];
    opts.path = parts[1];
  }

  let req;

  if (opts.followRedirects) {
    if (websocket._redirects === 0) {
      websocket._originalSecure = isSecure;
      websocket._originalHost = parsedUrl.host;

      const headers = options && options.headers;

      //
      // Shallow copy the user provided options so that headers can be changed
      // without mutating the original object.
      //
      options = { ...options, headers: {} };

      if (headers) {
        for (const [key, value] of Object.entries(headers)) {
          options.headers[key.toLowerCase()] = value;
        }
      }
    } else if (websocket.listenerCount('redirect') === 0) {
      const isSameHost = parsedUrl.host === websocket._originalHost;

      if (!isSameHost || (websocket._originalSecure && !isSecure)) {
        //
        // Match curl 7.77.0 behavior and drop the following headers. These
        // headers are also dropped when following a redirect to a subdomain.
        //
        delete opts.headers.authorization;
        delete opts.headers.cookie;

        if (!isSameHost) delete opts.headers.host;

        opts.auth = undefined;
      }
    }

    //
    // Match curl 7.77.0 behavior and make the first `Authorization` header win.
    // If the `Authorization` header is set, then there is nothing to do as it
    // will take precedence.
    //
    if (opts.auth && !options.headers.authorization) {
      options.headers.authorization =
        'Basic ' + Buffer.from(opts.auth).toString('base64');
    }

    req = websocket._req = request(opts);

    if (websocket._redirects) {
      //
      // Unlike what is done for the `'upgrade'` event, no early exit is
      // triggered here if the user calls `websocket.close()` or
      // `websocket.terminate()` from a listener of the `'redirect'` event. This
      // is because the user can also call `request.destroy()` with an error
      // before calling `websocket.close()` or `websocket.terminate()` and this
      // would result in an error being emitted on the `request` object with no
      // `'error'` event listeners attached.
      //
      websocket.emit('redirect', websocket.url, req);
    }
  } else {
    req = websocket._req = request(opts);
  }

  if (opts.timeout) {
    req.on('timeout', () => {
      abortHandshake(websocket, req, 'Opening handshake has timed out');
    });
  }

  req.on('error', (err) => {
    if (req === null || req[kAborted]) return;

    req = websocket._req = null;
    emitErrorAndClose(websocket, err);
  });

  req.on('response', (res) => {
    const location = res.headers.location;
    const statusCode = res.statusCode;

    if (
      location &&
      opts.followRedirects &&
      statusCode >= 300 &&
      statusCode < 400
    ) {
      if (++websocket._redirects > opts.maxRedirects) {
        abortHandshake(websocket, req, 'Maximum redirects exceeded');
        return;
      }

      req.abort();

      let addr;

      try {
        addr = new URL(location, address);
      } catch (e) {
        const err = new SyntaxError(`Invalid URL: ${location}`);
        emitErrorAndClose(websocket, err);
        return;
      }

      initAsClient(websocket, addr, protocols, options);
    } else if (!websocket.emit('unexpected-response', req, res)) {
      abortHandshake(
        websocket,
        req,
        `Unexpected server response: ${res.statusCode}`
      );
    }
  });

  req.on('upgrade', (res, socket, head) => {
    websocket.emit('upgrade', res);

    //
    // The user may have closed the connection from a listener of the
    // `'upgrade'` event.
    //
    if (websocket.readyState !== WebSocket.CONNECTING) return;

    req = websocket._req = null;

    if (res.headers.upgrade.toLowerCase() !== 'websocket') {
      abortHandshake(websocket, socket, 'Invalid Upgrade header');
      return;
    }

    const digest = createHash('sha1')
      .update(key + GUID)
      .digest('base64');

    if (res.headers['sec-websocket-accept'] !== digest) {
      abortHandshake(websocket, socket, 'Invalid Sec-WebSocket-Accept header');
      return;
    }

    const serverProt = res.headers['sec-websocket-protocol'];
    let protError;

    if (serverProt !== undefined) {
      if (!protocolSet.size) {
        protError = 'Server sent a subprotocol but none was requested';
      } else if (!protocolSet.has(serverProt)) {
        protError = 'Server sent an invalid subprotocol';
      }
    } else if (protocolSet.size) {
      protError = 'Server sent no subprotocol';
    }

    if (protError) {
      abortHandshake(websocket, socket, protError);
      return;
    }

    if (serverProt) websocket._protocol = serverProt;

    const secWebSocketExtensions = res.headers['sec-websocket-extensions'];

    if (secWebSocketExtensions !== undefined) {
      if (!perMessageDeflate) {
        const message =
          'Server sent a Sec-WebSocket-Extensions header but no extension ' +
          'was requested';
        abortHandshake(websocket, socket, message);
        return;
      }

      let extensions;

      try {
        extensions = parse(secWebSocketExtensions);
      } catch (err) {
        const message = 'Invalid Sec-WebSocket-Extensions header';
        abortHandshake(websocket, socket, message);
        return;
      }

      const extensionNames = Object.keys(extensions);

      if (
        extensionNames.length !== 1 ||
        extensionNames[0] !== PerMessageDeflate.extensionName
      ) {
        const message = 'Server indicated an extension that was not requested';
        abortHandshake(websocket, socket, message);
        return;
      }

      try {
        perMessageDeflate.accept(extensions[PerMessageDeflate.extensionName]);
      } catch (err) {
        const message = 'Invalid Sec-WebSocket-Extensions header';
        abortHandshake(websocket, socket, message);
        return;
      }

      websocket._extensions[PerMessageDeflate.extensionName] =
        perMessageDeflate;
    }

    websocket.setSocket(socket, head, {
      generateMask: opts.generateMask,
      maxPayload: opts.maxPayload,
      skipUTF8Validation: opts.skipUTF8Validation
    });
  });

  req.end();
}

/**
 * Emit the `'error'` and `'close'` events.
 *
 * @param {WebSocket} websocket The WebSocket instance
 * @param {Error} The error to emit
 * @private
 */
function emitErrorAndClose(websocket, err) {
  websocket._readyState = WebSocket.CLOSING;
  websocket.emit('error', err);
  websocket.emitClose();
}

/**
 * Create a `net.Socket` and initiate a connection.
 *
 * @param {Object} options Connection options
 * @return {net.Socket} The newly created socket used to start the connection
 * @private
 */
function netConnect(options) {
  options.path = options.socketPath;
  return net.connect(options);
}

/**
 * Create a `tls.TLSSocket` and initiate a connection.
 *
 * @param {Object} options Connection options
 * @return {tls.TLSSocket} The newly created socket used to start the connection
 * @private
 */
function tlsConnect(options) {
  options.path = undefined;

  if (!options.servername && options.servername !== '') {
    options.servername = net.isIP(options.host) ? '' : options.host;
  }

  return tls.connect(options);
}

/**
 * Abort the handshake and emit an error.
 *
 * @param {WebSocket} websocket The WebSocket instance
 * @param {(http.ClientRequest|net.Socket|tls.Socket)} stream The request to
 *     abort or the socket to destroy
 * @param {String} message The error message
 * @private
 */
function abortHandshake(websocket, stream, message) {
  websocket._readyState = WebSocket.CLOSING;

  const err = new Error(message);
  Error.captureStackTrace(err, abortHandshake);

  if (stream.setHeader) {
    stream[kAborted] = true;
    stream.abort();

    if (stream.socket && !stream.socket.destroyed) {
      //
      // On Node.js >= 14.3.0 `request.abort()` does not destroy the socket if
      // called after the request completed. See
      // https://github.com/websockets/ws/issues/1869.
      //
      stream.socket.destroy();
    }

    process.nextTick(emitErrorAndClose, websocket, err);
  } else {
    stream.destroy(err);
    stream.once('error', websocket.emit.bind(websocket, 'error'));
    stream.once('close', websocket.emitClose.bind(websocket));
  }
}

/**
 * Handle cases where the `ping()`, `pong()`, or `send()` methods are called
 * when the `readyState` attribute is `CLOSING` or `CLOSED`.
 *
 * @param {WebSocket} websocket The WebSocket instance
 * @param {*} [data] The data to send
 * @param {Function} [cb] Callback
 * @private
 */
function sendAfterClose(websocket, data, cb) {
  if (data) {
    const length = toBuffer(data).length;

    //
    // The `_bufferedAmount` property is used only when the peer is a client and
    // the opening handshake fails. Under these circumstances, in fact, the
    // `setSocket()` method is not called, so the `_socket` and `_sender`
    // properties are set to `null`.
    //
    if (websocket._socket) websocket._sender._bufferedBytes += length;
    else websocket._bufferedAmount += length;
  }

  if (cb) {
    const err = new Error(
      `WebSocket is not open: readyState ${websocket.readyState} ` +
        `(${readyStates[websocket.readyState]})`
    );
    cb(err);
  }
}

/**
 * The listener of the `Receiver` `'conclude'` event.
 *
 * @param {Number} code The status code
 * @param {Buffer} reason The reason for closing
 * @private
 */
function receiverOnConclude(code, reason) {
  const websocket = this[kWebSocket];

  websocket._closeFrameReceived = true;
  websocket._closeMessage = reason;
  websocket._closeCode = code;

  if (websocket._socket[kWebSocket] === undefined) return;

  websocket._socket.removeListener('data', socketOnData);
  process.nextTick(resume, websocket._socket);

  if (code === 1005) websocket.close();
  else websocket.close(code, reason);
}

/**
 * The listener of the `Receiver` `'drain'` event.
 *
 * @private
 */
function receiverOnDrain() {
  const websocket = this[kWebSocket];

  if (!websocket.isPaused) websocket._socket.resume();
}

/**
 * The listener of the `Receiver` `'error'` event.
 *
 * @param {(RangeError|Error)} err The emitted error
 * @private
 */
function receiverOnError(err) {
  const websocket = this[kWebSocket];

  if (websocket._socket[kWebSocket] !== undefined) {
    websocket._socket.removeListener('data', socketOnData);

    //
    // On Node.js < 14.0.0 the `'error'` event is emitted synchronously. See
    // https://github.com/websockets/ws/issues/1940.
    //
    process.nextTick(resume, websocket._socket);

    websocket.close(err[kStatusCode]);
  }

  websocket.emit('error', err);
}

/**
 * The listener of the `Receiver` `'finish'` event.
 *
 * @private
 */
function receiverOnFinish() {
  this[kWebSocket].emitClose();
}

/**
 * The listener of the `Receiver` `'message'` event.
 *
 * @param {Buffer|ArrayBuffer|Buffer[])} data The message
 * @param {Boolean} isBinary Specifies whether the message is binary or not
 * @private
 */
function receiverOnMessage(data, isBinary) {
  this[kWebSocket].emit('message', data, isBinary);
}

/**
 * The listener of the `Receiver` `'ping'` event.
 *
 * @param {Buffer} data The data included in the ping frame
 * @private
 */
function receiverOnPing(data) {
  const websocket = this[kWebSocket];

  websocket.pong(data, !websocket._isServer, NOOP);
  websocket.emit('ping', data);
}

/**
 * The listener of the `Receiver` `'pong'` event.
 *
 * @param {Buffer} data The data included in the pong frame
 * @private
 */
function receiverOnPong(data) {
  this[kWebSocket].emit('pong', data);
}

/**
 * Resume a readable stream
 *
 * @param {Readable} stream The readable stream
 * @private
 */
function resume(stream) {
  stream.resume();
}

/**
 * The listener of the `net.Socket` `'close'` event.
 *
 * @private
 */
function socketOnClose() {
  const websocket = this[kWebSocket];

  this.removeListener('close', socketOnClose);
  this.removeListener('data', socketOnData);
  this.removeListener('end', socketOnEnd);

  websocket._readyState = WebSocket.CLOSING;

  let chunk;

  //
  // The close frame might not have been received or the `'end'` event emitted,
  // for example, if the socket was destroyed due to an error. Ensure that the
  // `receiver` stream is closed after writing any remaining buffered data to
  // it. If the readable side of the socket is in flowing mode then there is no
  // buffered data as everything has been already written and `readable.read()`
  // will return `null`. If instead, the socket is paused, any possible buffered
  // data will be read as a single chunk.
  //
  if (
    !this._readableState.endEmitted &&
    !websocket._closeFrameReceived &&
    !websocket._receiver._writableState.errorEmitted &&
    (chunk = websocket._socket.read()) !== null
  ) {
    websocket._receiver.write(chunk);
  }

  websocket._receiver.end();

  this[kWebSocket] = undefined;

  clearTimeout(websocket._closeTimer);

  if (
    websocket._receiver._writableState.finished ||
    websocket._receiver._writableState.errorEmitted
  ) {
    websocket.emitClose();
  } else {
    websocket._receiver.on('error', receiverOnFinish);
    websocket._receiver.on('finish', receiverOnFinish);
  }
}

/**
 * The listener of the `net.Socket` `'data'` event.
 *
 * @param {Buffer} chunk A chunk of data
 * @private
 */
function socketOnData(chunk) {
  if (!this[kWebSocket]._receiver.write(chunk)) {
    this.pause();
  }
}

/**
 * The listener of the `net.Socket` `'end'` event.
 *
 * @private
 */
function socketOnEnd() {
  const websocket = this[kWebSocket];

  websocket._readyState = WebSocket.CLOSING;
  websocket._receiver.end();
  this.end();
}

/**
 * The listener of the `net.Socket` `'error'` event.
 *
 * @private
 */
function socketOnError() {
  const websocket = this[kWebSocket];

  this.removeListener('error', socketOnError);
  this.on('error', NOOP);

  if (websocket) {
    websocket._readyState = WebSocket.CLOSING;
    this.destroy();
  }
}


/***/ }),

/***/ 2427:
/***/ ((module) => {

module.exports = eval("require")("binary-pack");


/***/ }),

/***/ 1269:
/***/ ((module) => {

module.exports = eval("require")("bufferutil");


/***/ }),

/***/ 9374:
/***/ ((module) => {

module.exports = eval("require")("ejson");


/***/ }),

/***/ 7778:
/***/ ((module) => {

module.exports = eval("require")("ejson/source");


/***/ }),

/***/ 7787:
/***/ ((module) => {

module.exports = eval("require")("primus-msgpack");


/***/ }),

/***/ 4592:
/***/ ((module) => {

module.exports = eval("require")("utf-8-validate");


/***/ }),

/***/ 9491:
/***/ ((module) => {

"use strict";
module.exports = require("assert");

/***/ }),

/***/ 5001:
/***/ ((module) => {

"use strict";
module.exports = require("cluster");

/***/ }),

/***/ 2057:
/***/ ((module) => {

"use strict";
module.exports = require("constants");

/***/ }),

/***/ 6113:
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ 2361:
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ 7147:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 3685:
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ 5687:
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ 1808:
/***/ ((module) => {

"use strict";
module.exports = require("net");

/***/ }),

/***/ 2037:
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ 1017:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ 3477:
/***/ ((module) => {

"use strict";
module.exports = require("querystring");

/***/ }),

/***/ 2781:
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ 4404:
/***/ ((module) => {

"use strict";
module.exports = require("tls");

/***/ }),

/***/ 6224:
/***/ ((module) => {

"use strict";
module.exports = require("tty");

/***/ }),

/***/ 7310:
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ 3837:
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ }),

/***/ 6144:
/***/ ((module) => {

"use strict";
module.exports = require("vm");

/***/ }),

/***/ 9796:
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ }),

/***/ 7592:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

let crypto = __nccwpck_require__(6113)
let { urlAlphabet } = __nccwpck_require__(7651)
const POOL_SIZE_MULTIPLIER = 128
let pool, poolOffset
let fillPool = bytes => {
  if (!pool || pool.length < bytes) {
    pool = Buffer.allocUnsafe(bytes * POOL_SIZE_MULTIPLIER)
    crypto.randomFillSync(pool)
    poolOffset = 0
  } else if (poolOffset + bytes > pool.length) {
    crypto.randomFillSync(pool)
    poolOffset = 0
  }
  poolOffset += bytes
}
let random = bytes => {
  fillPool((bytes -= 0))
  return pool.subarray(poolOffset - bytes, poolOffset)
}
let customRandom = (alphabet, defaultSize, getRandom) => {
  let mask = (2 << (31 - Math.clz32((alphabet.length - 1) | 1))) - 1
  let step = Math.ceil((1.6 * mask * defaultSize) / alphabet.length)
  return (size = defaultSize) => {
    let id = ''
    while (true) {
      let bytes = getRandom(step)
      let i = step
      while (i--) {
        id += alphabet[bytes[i] & mask] || ''
        if (id.length === size) return id
      }
    }
  }
}
let customAlphabet = (alphabet, size = 21) =>
  customRandom(alphabet, size, random)
let nanoid = (size = 21) => {
  fillPool((size -= 0))
  let id = ''
  for (let i = poolOffset - size; i < poolOffset; i++) {
    id += urlAlphabet[pool[i] & 63]
  }
  return id
}
module.exports = { nanoid, customAlphabet, customRandom, urlAlphabet, random }


/***/ }),

/***/ 7651:
/***/ ((module) => {

let urlAlphabet =
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict'
module.exports = { urlAlphabet }


/***/ }),

/***/ 5580:
/***/ ((module) => {

"use strict";
module.exports = {"i8":"8.0.6"};

/***/ }),

/***/ 4580:
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"json":{},"ejson":{"server":"ejson"},"binary":{"server":"binary-pack"},"msgpack":{"server":"primus-msgpack"}}');

/***/ }),

/***/ 4644:
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"websockets":{"server":"ws","client":"ws"},"engine.io":{"server":"engine.io","client":"engine.io-client"},"browserchannel":{"server":"browserchannel","client":"browserchannel"},"sockjs":{"server":"sockjs","client":"sockjs-client"},"faye":{"server":"faye-websocket","client":"faye-websocket"},"uws":{"server":"uws","client":"ws"}}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
// bundlers can't detect that this is used in primus
// as it is a non-static require
const ws = __nccwpck_require__(8867)
const jsonParser = __nccwpck_require__(6834)
const wsTransformer = __nccwpck_require__(5173)
const core = __nccwpck_require__(2186);
const Primus = __nccwpck_require__(5480)
const Emitter = __nccwpck_require__(4116)
const Socket = Primus.createSocket({
  transformer: wsTransformer,
  parser: jsonParser,
  plugin: { emitter: Emitter },
  noop: [ws]
})

const admiralHost = core.getInput('admiralHost')
const appId = core.getInput('appId')
const order = core.getInput('order')
const version = core.getInput('version')
const explicitEnvironment = core.getInput('environment')

core.info('INPUT: ' + JSON.stringify({appId, order, version, explicitEnvironment}))

if (!admiralHost || !appId || !order || !version) {
  core.setFailed('admiralHost, appId, order and version must all be set')
  core.setOutput('success', 'false')
  process.exit(1)
}

const environment =
  explicitEnvironment || (version.includes('-') ? 'staging' : 'production')

core.info('Chosen Environment: ' + environment)

const client = new Socket(admiralHost, { strategy: false })

// We need to let Node know that we're doing something long lived
// You will need to set a timeout on the action or this risks using
// all your minutes!
setInterval(() => {}, 5000)

client.on('error', (error) => {
  core.setFailed('Client error: '+ error)
  core.setOutput('success', 'false')
  client.end()
  process.exit(1)
})

client.on('open', () => {
  client.on('serverMessage', (data) => {
    const msg = 'Admiral: ' + data.message
    core.info(msg)
  })

  client.on('captainMessage', (data) => {
    const msg = data.captainName + ': ' + data.message
    core.info(msg)
  })

  client.send('register', null, (response) => {
    const data = {
      appId: appId,
      environment: environment,
      order: order,
      orderArgs: [version],
      clientId: response.clientId,
      username: 'GitHub Actions'
    }
    client.send('executeOrder', data, (response) => {
      if (response.success) {
        core.info('ORDER EXECUTED')
        core.setOutput('success', true)
      } else {
        if (response.message) core.info(response.message)
        core.setOutput('success', false)
        core.setFailed(response.message)
        process.exit(1)
      }
      client.end()
    })
  })
})

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=index.js.map