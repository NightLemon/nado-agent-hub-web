import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);
var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

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
    let started2 = false;
    return {
      onStdoutLine(line) {
        const o = tryJson(line);
        if (!o) return line.trim() ? [{ type: "raw", data: line }] : [];
        const out = [];
        const item = o.item ?? {};
        switch (o.type) {
          case "thread.started":
            tt.nativeSessionId = o.thread_id;
            started2 = true;
            out.push({ type: "turn.started", nativeSessionId: o.thread_id });
            break;
          case "turn.started":
            if (!started2) {
              started2 = true;
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
    let started2 = false;
    return {
      onStdoutLine(line) {
        const o = tryJson(line);
        if (!o) return line.trim() ? [{ type: "raw", data: line }] : [];
        const d = o.data ?? {};
        const out = [];
        if (!started2 && o.type !== "result") {
          started2 = true;
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
    let started2 = false;
    return {
      onStdoutLine(line) {
        const o = tryJson(line);
        if (!o) return line.trim() ? [{ type: "raw", data: line }] : [];
        const out = [];
        if (o.type === "session" && typeof o.id === "string") tt.nativeSessionId = o.id;
        if (!started2) {
          started2 = true;
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

// packages/adapters/src/index.ts
var ADAPTERS = {
  codex: codexAdapter,
  copilot: copilotAdapter,
  pi: piAdapter,
  openclaw: openclawAdapter,
  fake: fakeAdapter
};

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
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return INVALID;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return INVALID;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
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

// packages/protocol/src/artifacts.ts
var DEFAULT_ARTIFACT_MAX_FILE_BYTES = 50 * 1024 * 1024;
var DEFAULT_ARTIFACT_MAX_TOTAL_BYTES = 1024 * 1024 * 1024;
var ARTIFACT_CHUNK_BYTES = 256 * 1024;
var ARTIFACT_MAX_FILES = 30;
var CONTENT_TYPES = {
  ".pdf": "application/pdf",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".zip": "application/zip"
};
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
var TERMINAL_EVENT_TYPES = ["turn.completed", "turn.failed", "turn.canceled"];
function isTerminalEvent(e) {
  return TERMINAL_EVENT_TYPES.includes(e.type);
}
var SUPPORTED_ADAPTER_NAMES = ["codex", "copilot", "pi", "openclaw", "fake"];
var SupportedAdapterNameSchema = external_exports.enum(SUPPORTED_ADAPTER_NAMES);
var ADAPTER_NAMES = ["claude", ...SUPPORTED_ADAPTER_NAMES];
var AdapterNameSchema = external_exports.enum(ADAPTER_NAMES);
function isSupportedAdapter(name) {
  return SUPPORTED_ADAPTER_NAMES.includes(name);
}
var SessionOptionsSchema = external_exports.object({
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
  authentication: external_exports.enum(["unknown", "verified", "failed"]).optional()
});
var MachineInfoSchema = external_exports.object({
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
  external_exports.object({
    t: external_exports.literal("external.sync"),
    batchId: external_exports.string().min(1).max(200),
    adapter: AdapterNameSchema,
    sessions: external_exports.array(ExternalSessionSchema).min(1).max(1)
  })
]);
var HubToRunnerSchema = external_exports.discriminatedUnion("t", [
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
    prompt: external_exports.string().min(1).max(22e4)
  }),
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

// packages/runner/src/proc.ts
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join as join2 } from "node:path";

// packages/runner/src/resolve.ts
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { delimiter, dirname, extname, isAbsolute, join, resolve } from "node:path";
function isFile(p) {
  try {
    return statSync(p).isFile();
  } catch {
    return false;
  }
}
function which(cmd, env = process.env) {
  const isWin = process.platform === "win32";
  const exts = isWin ? (env.PATHEXT ?? ".EXE;.CMD;.BAT;.COM").split(";").filter(Boolean) : [""];
  const candidates = (base) => {
    if (!isWin || extname(base)) return isWin ? [base, ...exts.map((e) => base + e)] : [base];
    return exts.map((e) => base + e);
  };
  if (isAbsolute(cmd) || cmd.includes("/") || cmd.includes("\\")) {
    for (const c of candidates(resolve(cmd))) if (isFile(c)) return c;
    return null;
  }
  const pathVar = env.PATH ?? env.Path ?? "";
  for (const dir of pathVar.split(delimiter)) {
    if (!dir) continue;
    for (const c of candidates(join(dir, cmd))) if (isFile(c)) return c;
  }
  return null;
}
function knownLocation(cmd, env) {
  if (process.platform !== "win32" || cmd !== "codex" || !env.LOCALAPPDATA) return null;
  const root = join(env.LOCALAPPDATA, "OpenAI", "Codex", "bin");
  let best = null;
  try {
    for (const d of readdirSync(root)) {
      const file = join(root, d, "codex.exe");
      try {
        const mtime = statSync(file).mtimeMs;
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
  const text = readFileSync(found, "utf8");
  const m = /"%(?:~?dp0%?)\\?([^"]+?\.(?:js|mjs|cjs))"/i.exec(text);
  if (m) {
    const script = join(dirname(found), m[1]);
    if (existsSync(script)) return { file: process.execPath, prefixArgs: [script] };
  }
  const exe = /"%(?:~?dp0%?)\\?([^"]+?\.exe)"/i.exec(text);
  if (exe) {
    const bin = join(dirname(found), exe[1]);
    if (existsSync(bin)) return { file: bin, prefixArgs: [] };
  }
  throw new Error(`cannot run ${found} without a shell; set an explicit "path" to the real executable`);
}

// packages/runner/src/win-job.ts
function windowsJob(file, args, token, cancelFile, diagnostics) {
  const quote = (value) => '"' + value.replace(/(\\*)"/g, '$1$1\\"').replace(/(\\+)$/g, "$1$1") + '"';
  const command = Buffer.from([file, ...args].map(quote).join(" "), "utf8").toString("base64");
  const source = String.raw`
using System;
using System.Text;
using System.IO;
using System.Globalization;
using System.Runtime.InteropServices;
public static class NadoJob {
 [StructLayout(LayoutKind.Sequential)] struct SI { public int cb; public IntPtr reserved, desktop, title; public int x,y,xs,ys,xc,yc,fill,flags; public short show,reserved2; public IntPtr reserved3,input,output,error; }
 [StructLayout(LayoutKind.Sequential)] struct PI { public IntPtr process,thread; public uint pid,tid; }
 [StructLayout(LayoutKind.Sequential)] struct FT { public uint low,high; }
 [StructLayout(LayoutKind.Sequential)] struct BASIC { public long a,b; public uint flags; public UIntPtr min,max; public uint active; public UIntPtr affinity; public uint priority,scheduling; }
 [StructLayout(LayoutKind.Sequential)] struct IO { public ulong a,b,c,d,e,f; }
 [StructLayout(LayoutKind.Sequential)] struct EXT { public BASIC basic; public IO io; public UIntPtr a,b,c,d; }
 [StructLayout(LayoutKind.Sequential)] struct ACCOUNT { public long a,b,c,d; public uint faults,total,active,terminated; }
 [DllImport("kernel32",SetLastError=true,CharSet=CharSet.Unicode)] static extern IntPtr CreateJobObject(IntPtr a,string b);
 [DllImport("kernel32",SetLastError=true)] static extern bool SetInformationJobObject(IntPtr j,int c,ref EXT p,int n);
 [DllImport("kernel32",SetLastError=true)] static extern bool QueryInformationJobObject(IntPtr j,int c,ref ACCOUNT p,int n,IntPtr r);
 [DllImport("kernel32",SetLastError=true)] static extern bool AssignProcessToJobObject(IntPtr j,IntPtr p);
 [DllImport("kernel32",SetLastError=true,CharSet=CharSet.Unicode)] static extern bool CreateProcess(string app,StringBuilder cmd,IntPtr pa,IntPtr ta,bool inherit,uint flags,IntPtr env,string cwd,ref SI si,out PI pi);
 [DllImport("kernel32")] static extern IntPtr GetStdHandle(int n);
 [DllImport("kernel32")] static extern uint ResumeThread(IntPtr h);
 [DllImport("kernel32",SetLastError=true)] static extern uint WaitForSingleObject(IntPtr h,uint ms);
 [DllImport("kernel32",SetLastError=true)] static extern bool GetExitCodeProcess(IntPtr h,out uint code);
 [DllImport("kernel32",SetLastError=true)] static extern bool GetProcessTimes(IntPtr h,out FT created,out FT exited,out FT kernel,out FT user);
 [DllImport("kernel32")] static extern bool TerminateProcess(IntPtr h,uint code);
 [DllImport("kernel32")] static extern bool TerminateJobObject(IntPtr j,uint code);
 [DllImport("kernel32")] static extern bool CloseHandle(IntPtr h);
 static Exception Error(string operation) { return new Exception(operation + ": " + Marshal.GetLastWin32Error()); }
 static string Number(ulong value) { return value.ToString(CultureInfo.InvariantCulture); }
 static string CreationTime(IntPtr process) {
  FT creation,exited,kernel,user;
  if(!GetProcessTimes(process,out creation,out exited,out kernel,out user)) throw Error("GetProcessTimes");
  return Number(((ulong)creation.high<<32)|creation.low);
 }
 static void Record(string file,string phase,uint pid,string created,string outcome) {
  if(file==null) return;
  try { File.AppendAllText(file,"{\"phase\":\""+phase+"\",\"pid\":"+Number(pid)+",\"creationTime\":\""+created+"\""+outcome+"}\n",new UTF8Encoding(false)); }
  catch { throw new Exception("Windows Job diagnostic write failed"); }
 }
 public static int Run(string b64,string token,string cancel64,string diagnostic64) {
  string cancelFile=Encoding.UTF8.GetString(Convert.FromBase64String(cancel64));
  string diagnosticFile=diagnostic64.Length==0 ? null : Encoding.UTF8.GetString(Convert.FromBase64String(diagnostic64));
  string created=null;
  IntPtr job=CreateJobObject(IntPtr.Zero,null); PI pi=new PI();
  if(job==IntPtr.Zero) throw Error("CreateJobObject");
  try {
   EXT limits=new EXT(); limits.basic.flags=0x2000;
   if(!SetInformationJobObject(job,9,ref limits,Marshal.SizeOf(limits))) throw Error("SetInformationJobObject");
   SI si=new SI(); si.cb=Marshal.SizeOf(si); si.flags=0x100; si.input=GetStdHandle(-10); si.output=GetStdHandle(-11); si.error=GetStdHandle(-12);
   var command=new StringBuilder(Encoding.UTF8.GetString(Convert.FromBase64String(b64)));
   if(!CreateProcess(null,command,IntPtr.Zero,IntPtr.Zero,true,0x08000004,IntPtr.Zero,null,ref si,out pi)) throw Error("CreateProcess");
   if(!AssignProcessToJobObject(job,pi.process)) { TerminateProcess(pi.process,1); throw Error("AssignProcessToJobObject"); }
   if(diagnosticFile!=null) {
    created=CreationTime(pi.process);
    Record(diagnosticFile,"started",pi.pid,created,"");
   }
   Console.Error.WriteLine("NADO_JOB_READY:"+token);
   if(File.Exists(cancelFile)) { if(!TerminateJobObject(job,1)) throw Error("TerminateJobObject"); }
   else if(ResumeThread(pi.thread)==0xffffffff) throw Error("ResumeThread");
   uint waitResult;
   while((waitResult=WaitForSingleObject(pi.process,25))!=0) {
    if(waitResult!=258) throw Error("WaitForSingleObject");
    if(File.Exists(cancelFile) && !TerminateJobObject(job,1)) throw Error("TerminateJobObject");
   }
   uint code; if(!GetExitCodeProcess(pi.process,out code)) throw Error("GetExitCodeProcess");
   if(!TerminateJobObject(job,1)) throw Error("TerminateJobObject");
   ACCOUNT account=new ACCOUNT();
   for(int i=0;i<500;i++) {
    if(!QueryInformationJobObject(job,1,ref account,Marshal.SizeOf(account),IntPtr.Zero)) throw Error("QueryInformationJobObject");
    // A CLI may leave stderr without a trailing newline. Separate the control
    // record after all owned writers have stopped, so it cannot join that tail.
    if(account.active==0) {
     if(diagnosticFile!=null && CreationTime(pi.process)!=created) throw new Exception("Windows Job process identity changed");
     Record(diagnosticFile,"closed",pi.pid,created,",\"waitResult\":"+Number(waitResult)+",\"exitCode\":"+Number(code)+",\"activeProcesses\":"+Number(account.active));
     Console.Error.WriteLine("\nNADO_JOB_CLOSED:"+token); return unchecked((int)code);
    }
    System.Threading.Thread.Sleep(10);
   }
   throw new Exception("job cleanup did not complete");
  } finally { if(pi.thread!=IntPtr.Zero) CloseHandle(pi.thread); if(pi.process!=IntPtr.Zero) CloseHandle(pi.process); CloseHandle(job); }
 }
}`;
  const script = `$ErrorActionPreference='Stop'; $ProgressPreference='SilentlyContinue'; try { Add-Type -TypeDefinition ([Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${Buffer.from(source, "utf8").toString("base64")}'))); exit [NadoJob]::Run('${command}','${token}','${Buffer.from(cancelFile, "utf8").toString("base64")}','${Buffer.from(diagnostics?.diagnosticFile ?? "", "utf8").toString("base64")}') } catch { [Console]::Error.WriteLine($_.Exception.ToString()); exit 1 }`;
  return { file: "powershell.exe", args: ["-NoLogo", "-NoProfile", "-NonInteractive", "-EncodedCommand", Buffer.from(script, "utf16le").toString("base64")] };
}

// packages/runner/src/proc.ts
function buildEnv(cmd, base = process.env) {
  const env = { ...base };
  for (const pat of cmd.unsetEnv ?? []) {
    if (pat.endsWith("*")) {
      const prefix = pat.slice(0, -1);
      for (const k of Object.keys(env)) if (k.startsWith(prefix)) delete env[k];
    } else delete env[pat];
  }
  return { ...env, ...cmd.env };
}
function runTurn(adapter, config, input, onEvent, opts = {}) {
  const parser = adapter.createParser();
  let canceled = false, finished = false, closing = false;
  let fatal, candidate;
  let child;
  let jobReady = false, jobClosed = false;
  let jobDir, cancelFile;
  let buf = "", stderrBuf = "", outputBytes = 0;
  let forceTimer, timer;
  const token = randomUUID();
  let resolveDone;
  const done = new Promise((r) => resolveDone = r);
  function complete(event, completion) {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    clearTimeout(forceTimer);
    if (jobDir) {
      try {
        rmSync(jobDir, { recursive: true, force: true });
      } catch {
      }
    }
    try {
      if (opts.onTerminal) opts.onTerminal(event, completion);
      else onEvent(event);
    } catch (e) {
      completion = { cleanupConfirmed: completion.cleanupConfirmed, reason: `terminal persistence failed: ${e.message}` };
    }
    resolveDone(completion);
  }
  function events(list) {
    for (const e of list) {
      if (finished) return;
      if (Buffer.byteLength(JSON.stringify(e)) > 3 * 1024 * 1024) {
        abort("normalized event exceeded byte limit; output is incomplete");
        continue;
      }
      if (isTerminalEvent(e)) {
        candidate ??= e;
        continue;
      }
      try {
        onEvent(e);
      } catch (e2) {
        abort(`event persistence failed: ${e2.message}`);
        break;
      }
    }
  }
  function parse(fn) {
    try {
      events(fn());
    } catch (e) {
      abort(`adapter parser error: ${e.message}`);
    }
  }
  function kill(force) {
    if (!child?.pid || finished) return;
    if (process.platform === "win32") {
      if (child.exitCode !== null || child.signalCode !== null) return;
      if (!force && cancelFile) {
        try {
          writeFileSync(cancelFile, token, { flag: "w" });
          return;
        } catch (e) {
          fatal ??= `cannot request Job cleanup: ${e.message}`;
        }
      }
      try {
        if (!child.kill("SIGKILL")) fatal ??= "cannot terminate Job wrapper through its original process handle";
      } catch (e) {
        fatal ??= `cannot terminate Job wrapper: ${e.message}`;
      }
    } else {
      try {
        process.kill(-child.pid, force ? "SIGKILL" : "SIGTERM");
      } catch {
        try {
          child.kill(force ? "SIGKILL" : "SIGTERM");
        } catch {
        }
      }
    }
  }
  function stop() {
    kill(false);
    forceTimer ??= setTimeout(() => kill(true), process.platform === "win32" ? 1e4 : 2e3);
    forceTimer.unref();
  }
  function cancel() {
    if (!finished) {
      canceled = true;
      stop();
    }
  }
  function abort(reason) {
    if (!finished) {
      fatal ??= reason;
      stop();
    }
  }
  function acceptChunk(chunk) {
    outputBytes += Buffer.byteLength(chunk, "utf8");
    if (outputBytes > (opts.maxOutputBytes ?? 64 * 1024 * 1024)) {
      abort("CLI output exceeded byte limit; output is incomplete");
      return false;
    }
    return true;
  }
  function stderrLine(line) {
    if (line.trim() === `NADO_JOB_READY:${token}`) {
      jobReady = true;
      if (canceled || fatal) stop();
      return;
    }
    if (line.trim() === `NADO_JOB_CLOSED:${token}`) {
      jobClosed = true;
      return;
    }
    if (!acceptChunk(line)) return;
    parse(() => parser.onStderr(line));
  }
  try {
    const cmd = adapter.build(input, config);
    const env = buildEnv(cmd);
    const resolved = resolveCommand(cmd.cmd, env);
    if (process.platform === "win32") {
      jobDir = mkdtempSync(join2(tmpdir(), "nado-job-"));
      cancelFile = join2(jobDir, `${token}.cancel`);
    }
    const actual = process.platform === "win32" ? windowsJob(resolved.file, [...resolved.prefixArgs, ...cmd.args], token, cancelFile) : { file: resolved.file, args: [...resolved.prefixArgs, ...cmd.args] };
    child = spawn(actual.file, actual.args, { cwd: input.workdir, env, stdio: ["pipe", "pipe", "pipe"], windowsHide: true, detached: process.platform !== "win32" });
    child.stdin.on("error", () => {
    });
    child.once("spawn", () => events([{ type: "turn.started" }]));
    child.stdin.end(cmd.stdin);
  } catch (e) {
    complete({ type: "turn.failed", error: `failed to start ${adapter.name}: ${e.message}` }, { cleanupConfirmed: true, reason: "spawn not attempted or synchronously failed" });
    return { cancel, abort, done };
  }
  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (chunk) => {
    if (!acceptChunk(chunk) || fatal) return;
    buf += chunk;
    let i;
    while ((i = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, i).replace(/\r$/, "");
      buf = buf.slice(i + 1);
      if (Buffer.byteLength(line) > (opts.maxLineBytes ?? 2 * 1024 * 1024)) {
        abort("CLI line exceeded byte limit; output is incomplete");
        buf = "";
        return;
      }
      parse(() => parser.onStdoutLine(line));
    }
    if (Buffer.byteLength(buf) > (opts.maxLineBytes ?? 2 * 1024 * 1024)) {
      abort("CLI line exceeded byte limit; output is incomplete");
      buf = "";
    }
  });
  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (chunk) => {
    if (process.platform !== "win32") {
      if (acceptChunk(chunk)) parse(() => parser.onStderr(chunk));
      return;
    }
    stderrBuf += chunk;
    let i;
    while ((i = stderrBuf.indexOf("\n")) >= 0) {
      const line = stderrBuf.slice(0, i + 1);
      stderrBuf = stderrBuf.slice(i + 1);
      stderrLine(line);
    }
    if (Buffer.byteLength(stderrBuf) > (opts.maxLineBytes ?? 2 * 1024 * 1024)) {
      abort("CLI stderr line exceeded byte limit; output is incomplete");
      stderrBuf = "";
    }
  });
  let spawnError;
  child.on("error", (e) => {
    spawnError = e;
  });
  child.on("exit", () => {
    if (process.platform !== "win32" && child?.pid) {
      try {
        process.kill(-child.pid, "SIGKILL");
      } catch {
      }
    }
  });
  child.on("close", async (code, signal) => {
    if (closing) return;
    closing = true;
    clearTimeout(timer);
    clearTimeout(forceTimer);
    if (buf && !fatal) parse(() => parser.onStdoutLine(buf));
    if (stderrBuf) stderrLine(stderrBuf);
    parse(() => parser.onExit(code, signal, canceled));
    let cleanupConfirmed = !child?.pid || process.platform === "win32" && jobClosed;
    if (process.platform !== "win32" && child?.pid) {
      for (let i = 0; i < 100; i++) {
        try {
          process.kill(-child.pid, 0);
        } catch (e) {
          cleanupConfirmed = e.code === "ESRCH";
          break;
        }
        await new Promise((r) => setTimeout(r, 10));
      }
    }
    const terminal = canceled ? { type: "turn.canceled" } : fatal || spawnError || code !== 0 ? { type: "turn.failed", error: fatal ?? spawnError?.message ?? (candidate?.type === "turn.failed" ? candidate.error : void 0) ?? `process exited with ${signal ? `signal ${signal}` : `code ${code}`}`, exitCode: code } : candidate ?? { type: "turn.failed", error: "process closed without a terminal result", exitCode: code };
    complete(terminal, { cleanupConfirmed, reason: cleanupConfirmed ? "owned process tree closed" : "process closed; tree cleanup unconfirmed" });
  });
  if (opts.timeoutMs) timer = setTimeout(() => abort(`turn timed out after ${opts.timeoutMs}ms`), opts.timeoutMs);
  return { cancel, abort, done };
}

// packages/runner/src/spool.ts
import { existsSync as existsSync2, mkdirSync, readdirSync as readdirSync2, readFileSync as readFileSync2 } from "node:fs";
import { join as join3 } from "node:path";
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
    mkdirSync(dir, { recursive: true });
    this.file = join3(dir, "outbox.sqlite");
    const existed = existsSync2(this.file);
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
      const run = this.get(turnId);
      if (!run || run.runId !== runId) throw new Error("resource release identity mismatch");
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
      const run = this.get(turnId);
      if (!run || run.runId !== runId || run.executionState !== "recovering" || !run.supervisorToken || run.cleanupConfirmed || run.resourceReleasedAt != null) return;
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
    const run = this.get(turnId);
    if (!run) return [];
    const entries = [];
    let bytes = 0;
    const rows = this.db.prepare("SELECT rseq,event,execution_state FROM outbox WHERE run_id=? AND rseq>? ORDER BY rseq LIMIT ?").iterate(run.runId, Math.max(afterRseq, run.ackedRseq), maxEvents);
    for (const row of rows) {
      const raw = String(row.event), rseq = Number(row.rseq), executionState = row.execution_state;
      const envelopeBytes = Buffer.byteLength(JSON.stringify({ t: "event", turnId, runId: run.runId, rseq, executionState, event: null })) - 4;
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
    for (const filename of readdirSync2(this.dir).filter((f) => f.endsWith(".jsonl")).sort()) {
      if (this.db.prepare("SELECT 1 FROM imports WHERE filename=?").get(filename)) continue;
      const turnId = filename.slice(0, -6);
      const raw = readFileSync2(join3(this.dir, filename), "utf8");
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

// packages/runner/src/supervisor-entry.ts
var started = false;
var disconnected = false;
var ended = false;
var running;
var spool;
var spec;
var notify = () => {
  if (process.connected) process.send?.({ t: "progress" }, () => {
  });
};
var fault = (error) => {
  console.error(`supervisor persistence failed: ${error.message}`);
  if (process.connected) process.send?.({ t: "fault", error: error.message }, () => {
  });
};
process.on("disconnect", () => {
  disconnected = true;
  running?.abort?.("Runner IPC disconnected; supervisor cleaned its owned process tree");
  if (!started) process.exitCode = 1;
});
process.on("message", (message) => {
  if (message.t === "cancel") {
    if (ended) return;
    try {
      if (spool && spec) spool.requestCancel(spec.turnId, spec.runId);
    } catch (e) {
      fault(e);
      running?.abort?.("cancel persistence failed");
      return;
    }
    running?.cancel();
    return;
  }
  if (message.t === "abort") {
    running?.abort?.(message.reason ?? "Runner requested cleanup");
    if (message.disconnect) {
      disconnected = true;
      if (process.connected) process.disconnect();
    }
    return;
  }
  if (message.t !== "start" || started || !message.spec) return;
  started = true;
  spec = message.spec;
  try {
    spool = new Spool(spec.spoolDir);
    spool.claim(spec.turnId, spec.runId, spec.token, process.pid);
    const local = spec, store = spool;
    if (!isSupportedAdapter(local.adapter) || !ADAPTERS[local.adapter]) {
      store.finish(local.turnId, { type: "turn.failed", error: `adapter ${local.adapter} support has been removed` }, true, "rejected before CLI spawn");
      ended = true;
      notify();
      store.close();
      if (process.connected) process.disconnect();
      return;
    }
    if (store.get(local.turnId).cancelRequested || disconnected) {
      store.finish(local.turnId, { type: "turn.failed", error: "Runner disconnected before CLI spawn" }, true, "canceled/disconnected before spawn");
      notify();
      store.close();
      if (process.connected) process.disconnect();
      return;
    }
    running = runTurn(ADAPTERS[local.adapter], local.config, local.input, (event) => {
      try {
        store.append(local.turnId, event, store.get(local.turnId).cancelRequested ? "stopping" : "running");
      } catch (e) {
        fault(e);
        throw e;
      }
      notify();
    }, {
      timeoutMs: local.timeoutMs,
      onTerminal(event, completion) {
        const canceled = store.get(local.turnId).cancelRequested;
        try {
          store.finish(local.turnId, event, completion.cleanupConfirmed, completion.reason, local.adapter === "openclaw" && (canceled || event.type !== "turn.completed"));
        } catch (e) {
          fault(e);
          throw e;
        }
        notify();
      }
    });
    if (store.get(local.turnId).cancelRequested) running.cancel();
    else if (disconnected) running.abort?.("Runner disconnected before CLI startup completed");
    void running.done.then(() => {
      ended = true;
      store.close();
      if (process.connected) process.disconnect();
    });
    if (process.connected) process.send?.({ t: "started", runId: local.runId, token: local.token }, () => {
    });
  } catch (e) {
    if (spool && !spool.healthy) fault(e);
    console.error(`supervisor refused execution: ${e.message}`);
    try {
      spool?.close();
    } catch {
    }
    process.exitCode = 1;
    if (process.connected) process.disconnect();
  }
});
