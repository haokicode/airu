export class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

export async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const response = await fetch(input, {
    ...init,
    headers,
  });
  const text = await response.text();

  if (!response.ok) {
    throw new ApiRequestError(text || response.statusText, response.status);
  }

  if (!text) {
    return {} as T;
  }

  const parsed = JSON.parse(text) as unknown;
  if (parsed && typeof parsed === "object" && "data" in parsed) {
    return (parsed as { data: T }).data;
  }

  return parsed as T;
}
