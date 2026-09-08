// Thin fetch wrapper. Every exported function is an async arrow.
const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:3000';
const DEV_USER_ID = (import.meta.env.VITE_DEV_USER_ID as string | undefined) ?? '';

export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const parse = async <T>(res: Response): Promise<T> => {
  const text = await res.text();
  const body: unknown = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message =
      body && typeof body === 'object' && 'error' in body
        ? String((body as { error: unknown }).error)
        : res.statusText;
    throw new ApiError(res.status, message);
  }
  return body as T;
};

type Method = 'GET' | 'POST' | 'DELETE';

const send = async <T>(path: string, method: Method, body?: unknown): Promise<T> => {
  const init: RequestInit = {
    method,
    headers: {
      'content-type': 'application/json',
      'x-user-id': DEV_USER_ID,
    },
  };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE}${path}`, init);
  return parse<T>(res);
};

export const httpGet = async <T>(path: string): Promise<T> => send<T>(path, 'GET');

export const httpPost = async <T>(path: string, body?: unknown): Promise<T> =>
  send<T>(path, 'POST', body);

export const httpDelete = async <T>(path: string): Promise<T> => send<T>(path, 'DELETE');

// Multipart POST — no content-type header so the browser sets the boundary.
export const httpUpload = async <T>(path: string, form: FormData): Promise<T> => {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'x-user-id': DEV_USER_ID },
    body: form,
  });
  return parse<T>(res);
};

export { DEV_USER_ID };
