import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);
var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// packages/runner/src/operation-tools.ts
import { createHash as createHash5 } from "node:crypto";
import { lstat as lstat3, open as open3, rename as rename3, unlink as unlink3 } from "node:fs/promises";
import { dirname as dirname2, join as join4, isAbsolute as isAbsolute5 } from "node:path";

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
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
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
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
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
  extract(values, newDef = this._def) {
    return _ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
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
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
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
function operationArguments(action, args) {
  const values = OperationValuesSchema.parse(args);
  for (const [name, f] of Object.entries(action.fields)) {
    if (!(name in values)) {
      if (f.required) throw Error(`missing operation argument: ${name}`);
      continue;
    }
    if (typeof values[name] !== f.type || typeof values[name] === "string" && values[name].length > (f.maxLength ?? 4096)) throw Error(`invalid operation argument: ${name}`);
  }
  if (Object.keys(values).some((name) => !Object.hasOwn(action.fields, name))) throw Error("unknown operation argument");
  return values;
}
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

// packages/protocol/src/catalog.ts
var CATALOG_LIMITS = { pageEntries: 100, deviceEntries: 1e4, ttlMs: 12e4, uploadMs: 6e4 };
var id6 = external_exports.string().regex(/^[A-Za-z0-9_.:-]{1,128}$/);
var generation = external_exports.string().regex(/^[a-f0-9]{64}$/);
var relativePath = external_exports.string().min(1).max(512).refine((p) => !p.includes("\\") && !p.startsWith("/") && !p.includes(":") && p.split("/").every((s) => s !== ".." && s !== "." && s.length > 0), "invalid relative path");
var base = { id: id6, label: external_exports.string().min(1).max(200) };
var NativeDelegationReadinessSchema = external_exports.discriminatedUnion("runtimeReady", [
  external_exports.object({
    version: external_exports.literal(1),
    backend: external_exports.literal("native-task-v2"),
    runtimeReady: external_exports.literal(true),
    executionEnabled: external_exports.literal(false),
    reason: external_exports.literal("ready-for-integration"),
    contextVersion: external_exports.literal(1).optional(),
    features: external_exports.array(external_exports.enum(["permission-request", "report-publication"])).max(2).refine((items) => new Set(items).size === items.length, "duplicate delegation feature").optional()
  }).strict(),
  external_exports.object({ version: external_exports.literal(1), backend: external_exports.literal("native-task-v2"), runtimeReady: external_exports.literal(false), executionEnabled: external_exports.literal(false), reason: external_exports.enum(["runtime-not-configured", "runtime-missing", "config-not-ready", "incompatible-runtime", "workspace-not-ready"]) }).strict()
]);
var CatalogEntrySchema = external_exports.discriminatedUnion("kind", [
  external_exports.object({ ...base, kind: external_exports.literal("hardware"), resourceType: external_exports.enum(["cpu", "memory", "gpu", "npu", "storage"]), capacity: external_exports.number().finite().nonnegative(), availableCapacity: external_exports.number().finite().nonnegative().optional(), hardwareId: external_exports.string().min(1).max(128).optional(), unit: external_exports.enum(["slots", "MiB", "bytes", "devices"]), vendor: external_exports.string().max(40).optional(), evidence: external_exports.enum(["probed", "declared"]), observedAt: external_exports.number().int().nonnegative() }).strict(),
  external_exports.object({ ...base, kind: external_exports.literal("capability"), protocol: external_exports.enum(["catalog-metadata-v1", "legacy-session-v2", "runner-readonly-v1", "runner-transfer-v1", "runner-operation-v1", "runner-model-v1", "runner-agent-v1"]), operation: OperationDescriptorSchema.optional(), model: ModelDescriptorSchema.optional(), delegation: NativeDelegationReadinessSchema.optional(), name: external_exports.string().min(1).max(100), version: external_exports.string().max(100).optional(), readiness: external_exports.enum(["available", "unknown", "unavailable"]), evidence: external_exports.enum(["probed", "declared"]) }).strict(),
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

// packages/protocol/src/execution-feedback.ts
var id7 = external_exports.string().regex(/^[A-Za-z0-9_.:-]{1,128}$/);
var ExecutionFeedbackSchema = external_exports.object({
  version: external_exports.literal(1),
  id: id7,
  taskId: id7,
  executionTaskId: id7,
  planVersion: external_exports.number().int().positive(),
  step: external_exports.number().int().positive(),
  stepId: id7,
  actionId: id7,
  deviceId: id7,
  operationId: id7,
  sourceRevision: external_exports.number().int().positive(),
  effect: external_exports.enum(["applied", "not_applied"]),
  outcome: external_exports.literal("failed"),
  closure: external_exports.literal("confirmed"),
  diagnostic: external_exports.object({
    code: external_exports.string().min(1).max(100),
    summary: external_exports.string().min(1).max(300),
    exitCode: external_exports.number().int().optional(),
    stderr: external_exports.string().max(2048).optional()
  }).strict(),
  evidenceRef: external_exports.object({ kind: external_exports.literal("operation"), taskId: id7, operationId: id7, resultAvailable: external_exports.boolean() }).strict()
}).strict();

// packages/protocol/src/task-interaction.ts
var id8 = external_exports.string().regex(/^[A-Za-z0-9_.:-]{1,128}$/);
var TaskSourceFeedbackSchema = external_exports.object({
  version: external_exports.literal(1),
  id: id8,
  taskId: id8,
  kind: external_exports.enum(["delegation", "model", "delivery"]),
  source: external_exports.object({ kind: external_exports.enum(["delegation", "model", "delivery"]), id: id8, revision: external_exports.string().min(1).max(128) }).strict(),
  outcome: external_exports.enum(["failed", "blocked", "unknown"]),
  closure: external_exports.enum(["confirmed", "unconfirmed", "not_applicable"]),
  diagnostic: external_exports.object({ code: external_exports.string().min(1).max(100), summary: external_exports.string().min(1).max(300), details: external_exports.string().max(2048).optional() }).strict(),
  evidenceRef: external_exports.discriminatedUnion("kind", [
    external_exports.object({ kind: external_exports.literal("delegation"), taskId: id8, delegationId: id8, childTaskId: id8.optional(), attemptId: id8.optional() }).strict(),
    external_exports.object({ kind: external_exports.literal("model"), taskId: id8, callId: id8 }).strict(),
    external_exports.object({ kind: external_exports.literal("delivery"), taskId: id8, operationId: id8, collectionId: id8.optional() }).strict()
  ])
}).strict();
var TaskIncidentFeedbackSchema = external_exports.union([ExecutionFeedbackSchema, TaskSourceFeedbackSchema]);
var TaskInteractionViewSchema = external_exports.object({
  schemaVersion: external_exports.literal(1),
  taskId: id8,
  revision: external_exports.number().int().nonnegative(),
  snapshotSeq: external_exports.number().int().nonnegative(),
  status: external_exports.string(),
  phase: external_exports.enum(["planning", "correcting", "executing", "awaiting_approval", "waiting", "reconciling", "stopping", "delivering", "delivery_blocked", "succeeded", "failed", "canceled"]),
  summary: external_exports.string(),
  blockerSummary: external_exports.string().nullable(),
  reason: external_exports.string().nullable(),
  lastProgressAt: external_exports.number().int().nonnegative(),
  currentAction: external_exports.object({ planVersion: external_exports.number().int().positive(), step: external_exports.number().int().positive(), actionId: id8, tool: external_exports.string(), deviceId: id8, status: external_exports.string() }).strict().nullable(),
  resultSummary: external_exports.string().nullable(),
  deliveryStates: external_exports.array(external_exports.object({ operationId: id8, state: external_exports.string(), sourceRevision: external_exports.string().min(1).max(128) }).strict()).optional(),
  incidents: external_exports.array(external_exports.object({ id: id8, state: external_exports.enum(["active", "recovered"]), feedback: TaskIncidentFeedbackSchema }).strict()),
  availableActions: external_exports.object({
    cancel: external_exports.boolean(),
    continue: external_exports.boolean(),
    reply: external_exports.boolean(),
    approvals: external_exports.array(external_exports.object({ version: external_exports.number().int().positive(), hash: external_exports.string() }).strict()),
    deliveries: external_exports.array(external_exports.object({ operationId: id8, sourceRevision: external_exports.string().min(1).max(128), collectionId: id8.optional() }).strict()).default([]),
    modelResolutions: external_exports.array(external_exports.object({ callId: id8 }).strict()).default([])
  }).strict()
}).strict();
var decisionBase = { id: external_exports.string().min(1).max(512), taskId: id8, available: external_exports.boolean(), unavailableReason: external_exports.string().nullable(), deferExecution: external_exports.literal(false) };
var InteractionDecisionSchema = external_exports.discriminatedUnion("kind", [
  external_exports.object({ ...decisionBase, kind: external_exports.literal("plan_approval"), version: external_exports.number().int().positive(), hash: external_exports.string() }).strict(),
  external_exports.object({ ...decisionBase, kind: external_exports.literal("delegation_approval"), requestId: id8, hash: external_exports.string(), reason: external_exports.string() }).strict(),
  external_exports.object({ ...decisionBase, kind: external_exports.literal("budget"), expectedVersion: external_exports.number().int().nonnegative(), template: external_exports.string() }).strict(),
  external_exports.object({ ...decisionBase, kind: external_exports.literal("input"), turnId: id8, intent: external_exports.enum(["reply", "resume"]) }).strict(),
  external_exports.object({ ...decisionBase, kind: external_exports.literal("delivery"), operationId: id8, sourceRevision: external_exports.string(), collectionId: id8.optional() }).strict(),
  external_exports.object({ ...decisionBase, kind: external_exports.literal("model_resolution"), callId: id8, acceptUnknown: external_exports.literal(true), noteMinLength: external_exports.literal(10), noteMaxLength: external_exports.literal(1e3) }).strict()
]);
var InteractionSemanticsSchema = external_exports.object({
  policyVersion: external_exports.literal(1),
  continuation: external_exports.enum(["advancing", "waiting_external", "waiting_user", "blocked", "terminal"]),
  presentation: external_exports.enum(["status", "decision", "result"]),
  reasonCode: external_exports.string(),
  nextStep: external_exports.string().nullable(),
  activity: external_exports.object({ lastObservedAt: external_exports.number().nonnegative(), lastMeaningfulProgressAt: external_exports.number().nonnegative().nullable() }).strict(),
  decisions: external_exports.array(InteractionDecisionSchema)
}).strict();
var TaskInteractionV2Schema = external_exports.object({ schemaVersion: external_exports.literal(2), base: TaskInteractionViewSchema, semantics: InteractionSemanticsSchema }).strict();

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

// packages/protocol/src/delegation.ts
var id9 = external_exports.string().regex(/^[A-Za-z0-9_.:-]{1,128}$/);
var hash3 = external_exports.string().regex(/^[a-f0-9]{64}$/);
var text = external_exports.string().trim().min(1).max(4e3);
var unique = (items) => new Set(items).size === items.length;
var limit = (max) => external_exports.number().int().nonnegative().max(max);
var relativeInputPath = (path) => !/[\x00-\x1f\x7f:\\]/.test(path) && path.split("/").every((part) => part.length > 0 && part !== "." && part !== "..");
var fixedInput = InputRefSchema.extend({
  rootGeneration: hash3,
  path: InputRefSchema.shape.path.refine(relativeInputPath, "input path must be relative to the registered root"),
  name: InputRefSchema.shape.name.refine((name) => relativeInputPath(name) && !name.includes("/"), "invalid snapshot filename")
});
var DelegationBudgetSchema = external_exports.object({
  maxModelRequests: limit(1e3),
  maxToolCalls: limit(2e3),
  maxTokens: limit(1e9),
  maxCostMicros: limit(1e12),
  maxOutputTokens: external_exports.number().int().positive().max(32768),
  deadlineSeconds: external_exports.number().int().positive().max(3600)
}).strict();
var DelegationContractSchema = external_exports.object({
  version: external_exports.literal(1),
  id: id9,
  parentTaskId: id9,
  parentPlanId: id9.nullable(),
  parentStepId: id9,
  goal: text,
  workspace: external_exports.object({
    profile: external_exports.literal("workspace"),
    trustedHostConsent: external_exports.literal(false),
    inputRefs: external_exports.array(fixedInput).min(1).max(16)
  }).strict(),
  permissions: external_exports.object({
    tools: external_exports.array(external_exports.enum(["list_inputs", "list_files", "read_file", "task_finish", "request_permission"])).min(1).max(5).refine(unique, "duplicate tool"),
    network: external_exports.literal("none"),
    write: external_exports.literal("none"),
    redelegate: external_exports.literal(false)
  }).strict(),
  /** Trusted publication of the validated report does not grant model write tools. */
  publication: external_exports.object({ format: external_exports.literal("delegation-report-v1"), path: external_exports.literal("output/delegation-result.json") }).strict().optional(),
  budget: DelegationBudgetSchema,
  completion: external_exports.object({
    requiredFindings: external_exports.array(id9).min(1).max(16).refine(unique, "duplicate finding"),
    requireInputEvidence: external_exports.literal(true),
    criteria: external_exports.array(text).min(1).max(16)
  }).strict()
}).strict().superRefine((contract, ctx) => {
  const refs = contract.workspace.inputRefs;
  if (!unique(refs.map((ref) => ref.id))) ctx.addIssue({ code: "custom", message: "duplicate input reference" });
  if (new Set(refs.map((ref) => ref.machineId)).size !== 1) ctx.addIssue({ code: "custom", message: "initial delegation requires one input device" });
});
var DelegationContextSchema = external_exports.object({
  version: external_exports.literal(1),
  contract: DelegationContractSchema,
  inputHash: hash3,
  machineId: id9,
  attemptId: id9,
  epoch: external_exports.number().int().positive()
}).strict().refine(
  (context) => context.contract.workspace.inputRefs.every((ref) => ref.machineId === context.machineId),
  "delegation input device does not match execution device"
);
var DelegationEvidenceSchema = external_exports.object({
  inputRefId: id9,
  sha256: hash3,
  locator: text
}).strict();
var DelegationOutcomeSchema = external_exports.discriminatedUnion("status", [
  external_exports.object({
    status: external_exports.literal("completed"),
    summary: text,
    findings: external_exports.array(external_exports.object({ key: id9, value: text, evidence: external_exports.array(DelegationEvidenceSchema).min(1).max(16) }).strict()).min(1).max(16)
  }).strict(),
  external_exports.object({ status: external_exports.literal("failed"), reason: external_exports.enum(["invalid-input", "runtime-error", "verification-failed", "budget-exhausted", "canceled"]), detail: text }).strict(),
  external_exports.object({ status: external_exports.literal("blocked"), reason: external_exports.enum(["missing-input", "permission-required", "runtime-unavailable"]), detail: text }).strict()
]);
var DelegationResultSchema = external_exports.object({
  version: external_exports.literal(1),
  delegationId: id9,
  parentTaskId: id9,
  childTaskId: id9,
  inputHash: hash3,
  attemptId: id9,
  epoch: external_exports.number().int().positive(),
  turnId: id9,
  runId: id9,
  machineId: id9,
  outcome: DelegationOutcomeSchema,
  artifactRefs: external_exports.array(external_exports.literal("output/delegation-result.json")).max(1).optional(),
  permissionRequest: external_exports.object({ kind: external_exports.literal("publish-report"), reason: text }).strict().optional()
}).strict();

// packages/protocol/src/tasks.ts
var TaskStatusSchema = external_exports.enum(["queued", "running", "recovering", "cancel_requested", "needs_reconciliation", "succeeded", "failed", "canceled"]);
var CreateTenantBodySchema = external_exports.object({ name: external_exports.string().trim().min(1).max(100) }).strict();
var CreateTaskBodySchema = external_exports.object({
  clientId: external_exports.string().min(1).max(100).regex(/^[^\x00-\x20\x7f]+$/),
  prompt: external_exports.string().min(1).max(32768).refine((text3) => /\S/.test(text3), "prompt must not be blank"),
  title: external_exports.string().trim().min(1).max(200).optional(),
  machineId: external_exports.string().min(1).max(100).optional(),
  scenario: external_exports.enum(["normal", "invalid-args", "duplicate-call-id", "waiting-model"]).default("normal")
}).strict();
var CreateGeneralTaskBodySchema = CreateTaskBodySchema.omit({ scenario: true }).extend({
  machineId: external_exports.string().min(1).max(100).optional(),
  resources: ResourceRequestSchema.optional(),
  placement: PlacementSchema.optional(),
  budget: TaskBudgetSchema.optional(),
  prompt: external_exports.string().min(1).max(32768).refine((text3) => /\S/.test(text3) && new TextEncoder().encode(text3).length <= 32768, "prompt exceeds UTF-8 limit or is blank"),
  executionProfile: external_exports.enum(["conversation", "workspace", "trusted-host"]).optional(),
  inputRefIds: external_exports.array(external_exports.string().min(1).max(100)).max(16).optional(),
  trustedHostConsent: external_exports.boolean().optional()
}).strict();
var FollowupTaskBodySchema = external_exports.object({
  clientId: external_exports.string().min(1).max(100).regex(/^[^\x00-\x20\x7f]+$/),
  expectedVersion: external_exports.number().int().positive(),
  prompt: external_exports.string().min(1).max(32768).refine((text3) => /\S/.test(text3) && new TextEncoder().encode(text3).length <= 32768, "prompt exceeds UTF-8 limit or is blank")
}).strict();
var NativeContextSchema = external_exports.object({
  taskId: external_exports.string().regex(/^task_[\w-]{1,100}$/),
  traceId: external_exports.string().regex(/^[a-f0-9]{32}$/),
  messages: external_exports.array(external_exports.object({ role: external_exports.enum(["user", "assistant"]), content: external_exports.string().min(1).max(32768) }).strict()).max(32),
  workspace: WorkspaceSpecSchema.optional(),
  budget: BudgetContextSchema.optional(),
  delivery: external_exports.object({ version: external_exports.literal(1), extensions: external_exports.array(external_exports.string().regex(/^\.[a-z0-9]+$/)).max(64) }).strict().optional(),
  recovery: RecoveryContextSchema.optional(),
  delegation: DelegationContextSchema.optional()
}).strict();

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
  const extension = path.slice(path.lastIndexOf(".")).toLowerCase();
  return Object.hasOwn(CONTENT_TYPES, extension) ? CONTENT_TYPES[extension] : void 0;
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
var SUPPORTED_ADAPTER_NAMES = ["codex", "copilot", "pi", "openclaw", "fake", "native"];
var SupportedAdapterNameSchema = external_exports.enum(SUPPORTED_ADAPTER_NAMES);
var ADAPTER_NAMES = ["claude", ...SUPPORTED_ADAPTER_NAMES];
var AdapterNameSchema = external_exports.enum(ADAPTER_NAMES);
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
  nativeDelegation: NativeDelegationReadinessSchema.optional(),
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
var id10 = external_exports.string().regex(/^[A-Za-z0-9_-]{1,64}$/);
var OperationServiceSchema = external_exports.object({ id: id10, url: external_exports.string().url(), semantics: external_exports.enum(["idempotent-queryable", "query-only", "unqueryable"]), actions: external_exports.array(OperationActionSchema).min(1).max(16).refine((a) => new Set(a.map((v) => v.name)).size === a.length, "duplicate operation action"), tokenEnv: external_exports.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/).optional(), allowInsecureLoopback: external_exports.boolean().default(false), requestTimeoutMs: external_exports.number().int().min(100).max(1e4).default(3e3) }).strict().refine((s) => {
  const u = new URL(s.url);
  return !u.username && !u.password && !u.search && !u.hash && (u.protocol === "https:" || s.allowInsecureLoopback && u.protocol === "http:" && ["127.0.0.1", "localhost", "[::1]"].includes(u.hostname));
}, "operation service requires HTTPS or explicitly allowed loopback HTTP");
var OperationArchiveRootSchema = external_exports.object({ id: id10, path: external_exports.string().refine(isAbsolute2), maxManagedBytes: external_exports.number().int().positive().default(1024 ** 3) }).strict();
var OperationsConfigSchema = external_exports.object({ enabled: external_exports.boolean().default(true), services: external_exports.array(OperationServiceSchema.refine((s) => Buffer.byteLength(JSON.stringify(s.actions)) <= 14e3, "service schemas exceed 14 KiB")).max(16).default([]), archiveRoots: external_exports.array(OperationArchiveRootSchema).max(16).default([]), workspaces: external_exports.array(ComputeConfigSchema).max(4).optional() }).strict().refine((v) => new Set(v.services.map((s) => s.id)).size === v.services.length && new Set(v.archiveRoots.map((s) => s.id)).size === v.archiveRoots.length && new Set((v.workspaces ?? []).map((s) => s.id)).size === (v.workspaces ?? []).length, "duplicate operation scope");

// packages/runner/src/operation-capabilities.ts
import { createHash as createHash4, randomUUID } from "node:crypto";
import { readdir as readdir3, unlink as unlink2 } from "node:fs/promises";
import { join as join3 } from "node:path";

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

// packages/adapters/src/input-roots.ts
import { createHash } from "node:crypto";
import { realpathSync, statSync } from "node:fs";
function inputRootGeneration(path) {
  const canonical = realpathSync(path).replaceAll("\\", "/"), info = statSync(path, { bigint: true });
  if (!info.isDirectory()) throw Error("input root is not a directory");
  const identity = [process.platform === "win32" ? canonical.toLowerCase() : canonical, process.platform === "win32" ? "" : String(info.dev), String(info.ino)].join("\0");
  return createHash("sha256").update(identity).digest("hex");
}

// packages/runner/src/transfer-files.ts
import { createHash as createHash2 } from "node:crypto";
import { constants } from "node:fs";
import { lstat, mkdir, open, realpath, rename, unlink, readdir } from "node:fs/promises";
import { isAbsolute as isAbsolute4, join, relative as relative2, resolve as resolve2, sep as sep2 } from "node:path";

// packages/runner/src/readonly-tools.ts
import { isAbsolute as isAbsolute3, relative, resolve, sep } from "node:path";
var ReadonlyJobSchema = external_exports.object({ request: RemoteRequestSchema, roots: external_exports.array(external_exports.object({ id: external_exports.string(), path: external_exports.string().refine(isAbsolute3) }).strict()).max(32), input: external_exports.object({ path: external_exports.string().refine(isAbsolute3), receipt: external_exports.string().refine(isAbsolute3) }).strict().optional(), tools: external_exports.array(ReadonlyToolSchema).max(3), deadlineAt: external_exports.number().int().positive() }).strict();

// packages/runner/src/transfer-files.ts
var TransferFileError = class extends Error {
  constructor(reason) {
    super(reason);
    this.reason = reason;
  }
};
var unsafe = () => new TransferFileError("unsafe-path");
async function privateDirectory(path) {
  const parent = resolve2(path, "..");
  if (parent !== path) {
    try {
      const st2 = await lstat(parent);
      if (st2.isSymbolicLink()) throw unsafe();
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
      await privateDirectory(parent);
    }
  }
  await mkdir(path, { recursive: true, mode: 448 });
  const st = await lstat(path);
  if (st.isSymbolicLink() || !st.isDirectory()) throw unsafe();
  const canonical = await realpath(path), normalize = (p) => process.platform === "win32" ? resolve2(p).toLowerCase() : resolve2(p);
  if (normalize(canonical) !== normalize(path)) throw unsafe();
  return canonical;
}
async function safeRegular(path) {
  const st = await lstat(path);
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
  const h = await open(tmp, "wx", 384);
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
  const h = await open(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
  try {
    const st = await h.stat();
    if (st.size > 8192 || st.nlink !== 1) throw unsafe();
    return JSON.parse(await h.readFile("utf8"));
  } finally {
    await h.close();
  }
}
async function hashFile(path, signal, expectedBytes) {
  const before = await safeRegular(path), h = await open(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0)), hash4 = createHash2("sha256");
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
      hash4.update(b.subarray(0, r.bytesRead));
      n += r.bytesRead;
    }
    const after = await h.stat(), link = await safeRegular(path);
    if (after.size !== st.size || after.mtimeMs !== st.mtimeMs || after.ctimeMs !== st.ctimeMs || link.ino !== st.ino || link.dev !== st.dev || link.size !== st.size || link.mtimeMs !== st.mtimeMs || link.ctimeMs !== st.ctimeMs) throw new TransferFileError("input-changed");
    return { sha256: hash4.digest("hex"), sizeBytes: n };
  } finally {
    await h.close();
  }
}
async function treeBytes(directory) {
  let total = 0;
  let count = 0;
  const walk = async (path) => {
    for (const e of await readdir(path, { withFileTypes: true })) {
      if (++count > 2e4) throw new TransferFileError("local-quota");
      const f = join(path, e.name), st = await lstat(f);
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
import { createHash as createHash3 } from "node:crypto";
import { spawn } from "node:child_process";
import { constants as constants2 } from "node:fs";
import { copyFile, lstat as lstat2, open as open2, readdir as readdir2, rename as rename2, realpath as realpath2, stat } from "node:fs/promises";
import { dirname, join as join2 } from "node:path";
var digest = (v) => createHash3("sha256").update(operationCanonical(v)).digest("hex");
var missing = (e) => e.code === "ENOENT";
async function managedBytes(directory) {
  let bytes = 0, entries = 0;
  const walk = async (path) => {
    for (const name of await readdir2(path)) {
      if (++entries > 2e4) throw Error("workspace entry limit exceeded");
      const file = join2(path, name), st = await lstat2(file);
      if (st.isSymbolicLink() || st.isFile()) bytes += st.size;
      else if (st.isDirectory()) await walk(file);
      else throw Error("unsupported workspace filesystem entry");
    }
  };
  await walk(directory);
  return bytes;
}
var computeOutputRoot = (c) => ({ id: "workspace-" + c.id + "-outputs", label: "Published task files " + c.id, path: join2(c.directory, "published") });
async function computeDescriptor(c) {
  await privateDirectory(c.directory);
  await privateDirectory(computeOutputRoot(c).path);
  const generation2 = digest({ config: c, directoryGeneration: inputRootGeneration(c.directory), executables: await Promise.all([c.python, ...Object.values(c.commands)].map(async (p) => {
    const canonical = await realpath2(p), st = await stat(canonical);
    if (!st.isFile()) throw Error("configured executable is not a file");
    return { path: canonical, size: st.size, mtime: st.mtimeMs, ino: st.ino };
  })) });
  return { version: 1, kind: "workspace", semantics: "query-only", cancelable: false, generation: generation2, actions: ["inspect", "write", "read", "import", "run", ...c.allowPackageInstall ? ["prepare"] : [], "publish"].map((name) => ({ name, fields: {} })), workspace: { mode: "trusted-host", network: "host", commands: ["python", ...Object.keys(c.commands)], packageInstall: c.allowPackageInstall, maxDurationMs: c.maxDurationMs } };
}
async function command(cmd, args, cwd, timeoutMs) {
  return new Promise((resolve3, reject) => {
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
      resolve3({ exitCode: code ?? -1, stdout: Buffer.concat(output[0]).toString("utf8"), stderr: Buffer.concat(output[1]).toString("utf8"), truncated, timedOut, startedAt, finishedAt: Date.now() });
    });
  });
}
async function ownedDirectory(path, identity) {
  await privateDirectory(path);
  const owner = join2(path, ".owner.json");
  try {
    if (operationCanonical(await readJson(owner)) !== operationCanonical(identity)) throw Error("workspace ownership changed");
  } catch (e) {
    if (!missing(e)) throw e;
    if ((await readdir2(path)).length) throw Error("workspace directory is not owned");
    await atomicJson(owner, identity);
  }
  return path;
}
async function taskPath(root, relative3, create = false) {
  const parts = WorkspacePathSchema.parse(relative3).split("/");
  let current = root;
  for (const [index, part] of parts.entries()) {
    current = join2(current, part);
    if (index < parts.length - 1) {
      if (create) await privateDirectory(current);
      else {
        const st = await lstat2(current);
        if (st.isSymbolicLink()) throw Error("unsafe task path");
        if (!st.isDirectory()) throw Object.assign(Error("task path component is not a directory"), { code: "ENOTDIR" });
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
  if (r.intent.kind !== "workspace" || r.descriptor.kind !== "workspace" || digest(await computeDescriptor(c)) !== digest(r.descriptor)) throw Error("workspace capability changed");
  const namespace = digest(new URL(hub.replace(/^ws/, "http")).href), tenant = join2(c.directory, "tasks", namespace, r.tenantId);
  await privateDirectory(tenant);
  const root = await ownedDirectory(join2(tenant, r.intent.workspaceId), { purpose: "nado-task-workspace-v1", namespace, tenant: r.tenantId, workspaceId: r.intent.workspaceId, generation: r.descriptor.generation });
  for (const directory of ["inputs", "work", "output"]) await privateDirectory(join2(root, directory));
  return { root, namespace };
}
async function executeCompute(c, r, hub, deadlineAt, input) {
  const { root, namespace } = await computeScope(c, r, hub);
  if (r.intent.kind !== "workspace") throw Error("invalid workspace intent");
  const args = WorkspaceActionSchema.parse(r.intent.args), result = (output) => {
    const bounded = { ...output };
    while (JSON.stringify(bounded).length > 7800) {
      const key = ["stdout", "stderr", "text"].filter((k) => typeof bounded[k] === "string" && String(bounded[k]).length > 100).sort((a, b) => String(bounded[b]).length - String(bounded[a]).length)[0];
      if (!key) throw Error("workspace result exceeds output grant");
      bounded[key] = String(bounded[key]).slice(0, Math.floor(String(bounded[key]).length / 2));
      bounded.truncated = true;
    }
    return { operationId: r.operationId, intentHash: r.intentHash, status: "applied", effectId: r.capabilityId + "/" + r.tenantId + "/" + r.operationId, output: bounded };
  };
  if (r.phase === "query") return { operationId: r.operationId, intentHash: r.intentHash, status: "unknown", reason: "workspace-result-receipt-unavailable" };
  if (Date.now() >= deadlineAt) throw Error("workspace deadline exceeded");
  const used = await managedBytes(c.directory);
  if (used >= c.maxManagedBytes) throw Error("workspace byte limit exceeded");
  if (args.action === "inspect") return result({ mode: "trusted-host", network: "host", commands: JSON.stringify(r.descriptor.workspace.commands), packageInstall: c.allowPackageInstall, python: JSON.stringify(await command(c.python, ["-I", "--version"], root, Math.min(3e3, deadlineAt - Date.now()))) });
  if (args.action === "write") {
    const bytes = Buffer.byteLength(args.text);
    if (bytes > c.maxFileBytes || used + bytes > c.maxManagedBytes) throw Error("workspace byte limit exceeded");
    const path = await taskPath(root, args.path, true), temporary = path + ".nado-write";
    const h = await open2(temporary, "wx", 384);
    try {
      await h.writeFile(args.text);
      await h.sync();
    } finally {
      await h.close();
    }
    await rename2(temporary, path);
    return result({ path: args.path, ...await hashFile(path) });
  }
  if (args.action === "read") {
    let prepared;
    try {
      const path = await taskPath(root, args.path), st2 = await safeRegular(path), h2 = await open2(path, constants2.O_RDONLY | (constants2.O_NOFOLLOW ?? 0));
      prepared = { st: st2, h: h2 };
    } catch (error) {
      const errno = error.code;
      if (errno === "ENOENT" || errno === "ENOTDIR") return { operationId: r.operationId, intentHash: r.intentHash, status: "not_applied", reason: "workspace-read-unavailable", output: { action: "read", path: args.path, errno } };
      throw error;
    }
    const { st, h } = prepared;
    try {
      const bytes = Buffer.alloc(Math.min(args.maxBytes, st.size));
      const read = await h.read(bytes, 0, bytes.length, 0);
      return result({ path: args.path, text: new TextDecoder("utf8", { fatal: true }).decode(bytes.subarray(0, read.bytesRead), { stream: read.bytesRead < st.size }), truncated: read.bytesRead < st.size });
    } finally {
      await h.close();
    }
  }
  if (args.action === "import") {
    if (!r.inputFile || !input || operationCanonical(await readJson(input.receipt)) !== operationCanonical(r.inputFile)) throw Error("workspace input receipt changed");
    const source = await hashFile(input.path, void 0, r.inputFile.sizeBytes);
    if (source.sha256 !== r.inputFile.sha256 || source.sizeBytes > c.maxFileBytes || used + source.sizeBytes > c.maxManagedBytes) throw Error("workspace input version or quota changed");
    const destination = await taskPath(root, args.path, true);
    await copyFile(input.path, destination, constants2.COPYFILE_EXCL);
    const actual = await hashFile(destination, void 0, source.sizeBytes);
    if (actual.sha256 !== source.sha256) throw Error("workspace input changed while copying");
    return result({ path: args.path, ...actual });
  }
  const python = join2(root, ".venv", process.platform === "win32" ? "Scripts/python.exe" : "bin/python");
  if (args.action === "prepare") {
    if (!c.allowPackageInstall) throw Error("package installation is not authorized");
    try {
      await safeRegular(join2(root, ".environment.json"));
    } catch (e) {
      if (!missing(e)) throw e;
      try {
        await lstat2(join2(root, ".venv"));
        throw Error("incomplete environment requires owner cleanup");
      } catch (e2) {
        if (!missing(e2)) throw e2;
      }
      if (used + 32 * 1024 ** 2 > c.maxManagedBytes) throw Error("environment reservation exceeds workspace limit");
      const created = await command(c.python, ["-I", "-m", "venv", join2(root, ".venv")], root, deadlineAt - Date.now());
      if (created.exitCode !== 0) return result({ ...created, ok: false });
      await atomicJson(join2(root, ".environment.json"), { ready: true });
    }
    const installed = args.requirements.length ? await command(python, ["-I", "-m", "pip", "--isolated", "install", "--disable-pip-version-check", "--no-input", "--no-cache-dir", "--only-binary=:all:", "--index-url", c.packageIndex, ...args.requirements], root, deadlineAt - Date.now()) : { exitCode: 0, stdout: "", stderr: "", timedOut: false, truncated: false };
    return result({ ...installed, ok: installed.exitCode === 0 });
  }
  if (args.action === "run") {
    let executable = args.command === "python" ? c.python : c.commands[args.command];
    if (!executable) throw Error("command not registered");
    if (args.command === "python") {
      try {
        await safeRegular(join2(root, ".environment.json"));
        executable = python;
      } catch (e) {
        if (!missing(e)) throw e;
      }
    }
    const executed = await command(executable, args.args, root, Math.min(args.timeoutSeconds * 1e3, deadlineAt - Date.now()));
    return result({ ...executed, ok: executed.exitCode === 0 });
  }
  if (args.action === "publish") {
    const publication = join2(c.directory, "staged-publications", namespace, r.tenantId, r.intent.workspaceId, r.operationId), pending = publication + ".pending";
    await privateDirectory(dirname(publication));
    await privateDirectory(pending);
    const files = [];
    let bytes = 0;
    for (const path of args.paths) {
      const source = await taskPath(root, path), before = await hashFile(source);
      bytes += before.sizeBytes;
      if (before.sizeBytes > c.maxFileBytes || used + bytes > c.maxManagedBytes) throw Error("publication exceeds byte limit");
      const target = await taskPath(pending, path, true);
      await copyFile(source, target, constants2.COPYFILE_EXCL);
      const after = await hashFile(target, void 0, before.sizeBytes);
      if (after.sha256 !== before.sha256) throw Error("publication source changed");
      files.push({ path, ...after, registeredPath: [namespace, r.tenantId, r.intent.workspaceId, r.operationId, path].join("/") });
    }
    const output = { rootId: computeOutputRoot(c).id, files: JSON.stringify(files) };
    if (Buffer.byteLength(output.files) > 4096) throw Error("publication manifest too large");
    const receipt = result(output);
    await atomicJson(join2(pending, ".receipt.json"), receipt);
    await rename2(pending, publication);
    return receipt;
  }
  throw Error("unknown workspace action");
}

// packages/runner/src/operation-capabilities.ts
var digestOperation = (v) => createHash4("sha256").update(operationCanonical(v)).digest("hex");
function serviceDescriptor(service) {
  const credential = service.tokenEnv ? process.env[service.tokenEnv] : void 0;
  if (service.tokenEnv && !credential) throw Error("operation service credential is not available");
  return { version: 1, kind: "service", semantics: service.semantics, cancelable: false, actions: service.actions, generation: digestOperation({ service, credentialDigest: credential ? createHash4("sha256").update(credential).digest("hex") : null }) };
}
async function archiveScope(root) {
  await privateDirectory(root.path);
  const generation2 = inputRootGeneration(root.path), directory = join3(root.path, ".nado-operations-v1");
  await privateDirectory(directory);
  const owner = join3(directory, "owner.json");
  try {
    const old = await readJson(owner);
    if (old.purpose !== "nado-operation-archive-v1" || old.generation !== generation2) throw Error("archive scope ownership changed");
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
    if ((await readdir3(directory)).length) throw Error("unowned archive directory is not empty");
    await atomicJson(owner, { purpose: "nado-operation-archive-v1", generation: generation2 });
  }
  return { directory, descriptor: OperationDescriptorSchema.parse({ version: 1, kind: "archive", semantics: "idempotent-queryable", cancelable: false, actions: [{ name: "archive", fields: { name: { type: "string", required: true, maxLength: 200 } } }], generation: digestOperation({ root: root.id, generation: generation2 }) }) };
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

// packages/runner/src/operation-tools.ts
var OperationJobSchema = external_exports.object({ request: OperationRequestSchema, hub: external_exports.string().url(), directory: external_exports.string().refine(isAbsolute5), deadlineAt: external_exports.number().int().positive(), service: OperationServiceSchema.optional(), archiveRoot: OperationArchiveRootSchema.optional(), workspace: ComputeConfigSchema.optional(), input: external_exports.object({ path: external_exports.string().refine(isAbsolute5), receipt: external_exports.string().refine(isAbsolute5) }).strict().optional() }).strict();
var missing2 = (e) => e.code === "ENOENT";
async function archive(job) {
  const r = job.request, root = job.archiveRoot;
  if (!root || !r.inputFile || !job.input || r.intent.kind !== "archive") throw Error("archive scope not configured");
  const scope = await archiveScope(root);
  if (digestOperation(scope.descriptor) !== digestOperation(r.descriptor)) throw Error("archive generation changed");
  const tenant = join4(scope.directory, r.tenantId), destination = join4(tenant, r.operationId), pending = destination + ".pending", receipt = join4(destination, "receipt.json");
  await privateDirectory(tenant);
  try {
    const st = await lstat3(destination);
    if (!st.isDirectory() || st.isSymbolicLink()) throw Error("unsafe archive object");
    await privateDirectory(destination);
    const old = OperationObservationSchema.parse(await readJson(receipt));
    if (old.operationId !== r.operationId || old.intentHash !== r.intentHash || old.status !== "applied") throw Error("archive object identity changed");
    const data = await hashFile(join4(destination, "input.bin"), void 0, r.inputFile.sizeBytes);
    if (data.sha256 !== r.inputFile.sha256) throw Error("archive checksum changed");
    return old;
  } catch (e) {
    if (!missing2(e)) throw e;
  }
  if (r.phase === "query") return { operationId: r.operationId, intentHash: r.intentHash, status: "absent" };
  await privateDirectory(dirname2(job.input.path));
  const inputReceipt = await readJson(job.input.receipt);
  if (operationCanonical(inputReceipt) !== operationCanonical(r.inputFile)) throw Error("input receipt changed");
  const actual = await hashFile(job.input.path, void 0, r.inputFile.sizeBytes);
  if (actual.sha256 !== r.inputFile.sha256) throw Error("input bytes changed");
  let owned = 0;
  try {
    owned = await treeBytes(pending);
  } catch (e) {
    if (!missing2(e)) throw e;
  }
  if (await treeBytes(scope.directory) + r.inputFile.sizeBytes + 16384 - owned > root.maxManagedBytes) throw Error("archive quota exceeded");
  await privateDirectory(pending);
  const part = join4(pending, "input.bin");
  try {
    await unlink3(part);
  } catch (e) {
    if (!missing2(e)) throw e;
  }
  const source = await open3(job.input.path, "r"), target = await open3(part, "wx", 384), hash4 = createHash5("sha256");
  try {
    let offset = 0;
    const b = Buffer.alloc(256 * 1024);
    while (offset < r.inputFile.sizeBytes) {
      if (Date.now() >= job.deadlineAt) throw Error("archive deadline");
      const got = await source.read(b, 0, Math.min(b.length, r.inputFile.sizeBytes - offset), offset);
      if (!got.bytesRead) throw Error("archive input truncated");
      hash4.update(b.subarray(0, got.bytesRead));
      let n = 0;
      while (n < got.bytesRead) {
        const w = await target.write(b, n, got.bytesRead - n, offset + n);
        if (!w.bytesWritten) throw Error("archive write stalled");
        n += w.bytesWritten;
      }
      offset += got.bytesRead;
    }
    if (hash4.digest("hex") !== r.inputFile.sha256) throw Error("archive input changed");
    await target.sync();
  } finally {
    await source.close();
    await target.close();
  }
  const result = { operationId: r.operationId, intentHash: r.intentHash, status: "applied", effectId: r.capabilityId + "/" + r.tenantId + "/" + r.operationId, output: { name: r.intent.args.name, sha256: r.inputFile.sha256, sizeBytes: r.inputFile.sizeBytes, archiveId: r.operationId } };
  await atomicJson(join4(pending, "receipt.json"), result);
  try {
    await rename3(pending, destination);
  } catch {
    const old = OperationObservationSchema.parse(await readJson(receipt));
    if (old.intentHash !== r.intentHash) throw Error("archive commit conflict");
    return old;
  }
  return result;
}
async function executeOperation(input) {
  const job = OperationJobSchema.parse(input), r = job.request, identity = { operationId: r.operationId, attemptId: r.attemptId, epoch: r.epoch, requestId: r.requestId, runId: r.runId, requestHash: r.requestHash };
  let observation = { operationId: r.operationId, intentHash: r.intentHash, status: "not_started", reason: "operation-not-started" };
  let authorized = false;
  try {
    if (!/^op_[A-Za-z0-9_-]+$/.test(r.operationId) || !/^[A-Za-z0-9_-]+$/.test(r.tenantId) || digestOperation(operationRequestPayload(r)) !== r.requestHash || digestOperation({ descriptor: r.descriptor, intent: r.intent }) !== r.intentHash || Date.now() >= job.deadlineAt) throw Error("invalid operation scope");
    if (r.descriptor.kind === "service") {
      if (!job.service || digestOperation(serviceDescriptor(job.service)) !== digestOperation(r.descriptor)) throw Error("service scope changed");
      const action = r.descriptor.actions.find((a) => a.name === r.intent.action);
      if (!action) throw Error("unknown service action");
      operationArguments(action, r.intent.args);
    }
    if (r.descriptor.kind === "workspace" && (!job.workspace || r.intent.kind !== "workspace" || digestOperation(await computeDescriptor(job.workspace)) !== digestOperation(r.descriptor))) throw Error("workspace scope changed");
    if (r.descriptor.kind === "archive") {
      if (!job.archiveRoot || !r.inputFile || !job.input) throw Error("archive scope missing");
      const scope = await archiveScope(job.archiveRoot);
      if (digestOperation(scope.descriptor) !== digestOperation(r.descriptor)) throw Error("archive root generation changed");
      if (r.phase === "execute") {
        await privateDirectory(dirname2(job.input.path));
        if (operationCanonical(await readJson(job.input.receipt)) !== operationCanonical(r.inputFile)) throw Error("input receipt changed");
        const before = await hashFile(job.input.path, void 0, r.inputFile.sizeBytes);
        if (before.sha256 !== r.inputFile.sha256) throw Error("archive input changed");
      }
    }
    await privateDirectory(job.directory);
    const intentFile = join4(job.directory, "intent.json");
    try {
      const old = await readJson(intentFile);
      if (old.operationId !== r.operationId || old.intentHash !== r.intentHash) throw Error("local operation identity conflict");
    } catch (e) {
      if (!missing2(e)) throw e;
      await atomicJson(intentFile, { operationId: r.operationId, intentHash: r.intentHash });
    }
    const claim = await fetch(job.hub.replace(/\/+$/, "") + "/api/runtime/operations/" + r.operationId + "/claim", { method: "POST", headers: { Authorization: `Bearer ${r.capability}`, "content-type": "application/json" }, body: JSON.stringify({ attemptId: r.attemptId, epoch: r.epoch, requestId: r.requestId, requestHash: r.requestHash, expectedVersion: r.expectedVersion, connectionId: r.connectionId }), redirect: "error", signal: AbortSignal.timeout(Math.max(1, Math.min(5e3, job.deadlineAt - Date.now()))) });
    if (!claim.ok) {
      await claim.body?.cancel();
      throw Error("operation claim rejected");
    }
    const decision = external_exports.object({ decision: external_exports.enum(["execute", "query", "stop"]), operationId: external_exports.string(), attemptId: external_exports.string(), epoch: external_exports.number() }).strict().parse(await boundedJson(claim));
    if (decision.operationId !== r.operationId || decision.attemptId !== r.attemptId || decision.epoch !== r.epoch || decision.decision !== r.phase) throw Error("operation start prevented");
    authorized = true;
    const previous = join4(job.directory, "result.json");
    try {
      const old = OperationObservationSchema.parse(await readJson(previous));
      if (old.operationId !== r.operationId || old.intentHash !== r.intentHash) throw Error("local result identity changed");
      if (old.status === "applied" || old.status === "not_applied") return OperationResultSchema.parse({ ...identity, observation: old });
    } catch (e) {
      if (!missing2(e)) throw e;
    }
    if (r.phase === "execute") {
      const marker = join4(job.directory, "write.json");
      try {
        const old = await readJson(marker);
        if (r.descriptor.semantics !== "idempotent-queryable" || old.attemptId === r.attemptId) throw Error("local write intent exists; query required");
      } catch (e) {
        if (!missing2(e)) throw e;
      }
      await atomicJson(marker, { attemptId: r.attemptId, intentHash: r.intentHash });
    }
    if (r.descriptor.kind === "workspace") observation = await executeCompute(job.workspace, r, job.hub, job.deadlineAt, job.input);
    else if (r.descriptor.kind === "archive") observation = await archive(job);
    else {
      const s = job.service;
      if (r.phase === "query" && s.semantics === "unqueryable") throw Error("service has no result query");
      const response = await fetch(serviceUrl(s, "operations/" + encodeURIComponent(r.operationId)), { method: r.phase === "execute" ? "POST" : "GET", headers: { ...serviceHeaders(s), "x-nado-intent-hash": r.intentHash, ...r.phase === "execute" ? { "content-type": "application/json", "idempotency-key": r.operationId } : {} }, ...r.phase === "execute" ? { body: JSON.stringify({ operationId: r.operationId, intentHash: r.intentHash, action: r.intent.action, args: r.intent.args }) } : {}, redirect: "error", signal: AbortSignal.timeout(Math.max(1, Math.min(s.requestTimeoutMs, job.deadlineAt - Date.now()))) });
      if (!response.ok) {
        await response.body?.cancel();
        throw Error("service response unavailable");
      }
      observation = OperationObservationSchema.parse(await boundedJson(response));
      if (observation.operationId !== r.operationId || observation.intentHash !== r.intentHash) throw Error("service response identity mismatch");
    }
    await atomicJson(previous, observation);
  } catch {
    observation = { operationId: r.operationId, intentHash: r.intentHash, status: authorized ? "unknown" : "not_started", reason: authorized ? "operation-response-or-local-result-unknown" : "operation-not-started" };
  }
  return OperationResultSchema.parse({ ...identity, observation });
}

// packages/runner/src/operation-entry.ts
var text2 = "";
for await (const part of process.stdin) {
  text2 += String(part);
  if (Buffer.byteLength(text2) > 65536) throw Error("operation job exceeds limit");
}
process.stdout.write(JSON.stringify(await executeOperation(JSON.parse(text2))) + "\n");
