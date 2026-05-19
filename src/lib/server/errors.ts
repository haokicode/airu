import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logError } from "@/lib/server/logger";

export class ApiError extends Error {
  code: string;
  details?: unknown;
  status: number;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function validationError(error: ZodError) {
  return new ApiError(
    400,
    "VALIDATION_FAILED",
    "Request validation failed",
    error.issues.map((issue) => ({
      code: issue.code,
      message: issue.message,
      path: issue.path.join("."),
    })),
  );
}

export function handleApiError(service: string, error: unknown) {
  if (error instanceof ApiError) {
    if (error.status >= 500) {
      logError(service, error, { code: error.code, status: error.status });
    }

    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.status },
    );
  }

  logError(service, error);
  return NextResponse.json(
    {
      error: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    },
    { status: 500 },
  );
}
