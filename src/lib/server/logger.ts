type LogLevel = "info" | "warn" | "error";

type LogFields = Record<string, string | number | boolean | null | undefined>;

function writeLog(level: LogLevel, service: string, message: string, fields: LogFields = {}) {
  const payload = {
    level,
    service,
    message,
    ...fields,
  };

  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.log(line);
}

export function logInfo(service: string, message: string, fields?: LogFields) {
  writeLog("info", service, message, fields);
}

export function logWarn(service: string, message: string, fields?: LogFields) {
  writeLog("warn", service, message, fields);
}

export function logError(service: string, error: unknown, fields: LogFields = {}) {
  writeLog("error", service, error instanceof Error ? error.message : String(error), {
    ...fields,
    stack: error instanceof Error ? error.stack : undefined,
  });
}
