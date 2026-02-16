import type { AuthTokenStorage } from "../../../application/auth/ports/AuthTokenStorage";

export type HttpClientOptions = {
  baseUrl?: string;
  tokenStorage: AuthTokenStorage;
  onUnauthorized?: () => void;
};

export class HttpClient {
  private readonly baseUrl: string;
  private readonly tokenStorage: AuthTokenStorage;
  private onUnauthorized?: () => void;

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl ?? "";
    this.tokenStorage = options.tokenStorage;
    this.onUnauthorized = options.onUnauthorized;
  }

  async post<TResponse>(path: string, body?: unknown): Promise<TResponse> {
    return this.request<TResponse>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async postWithAuthToken<TResponse>(
    path: string,
    body: unknown,
    token: string,
  ): Promise<TResponse> {
    return this.request<TResponse>(path, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async get<TResponse>(path: string): Promise<TResponse> {
    return this.request<TResponse>(path, {
      method: "GET",
    });
  }

  private async request<TResponse>(
    path: string,
    init: RequestInit,
  ): Promise<TResponse> {
    const token = this.tokenStorage.get();
    const headers = new Headers(init.headers);

    headers.set("Content-Type", "application/json");

    if (!headers.has("Authorization") && token && !token.isExpired()) {
      headers.set("Authorization", `Bearer ${token.value}`);
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers,
    });

    if (response.status === 401) {
      this.onUnauthorized?.();
    }

    if (!response.ok) {
      const errorBody = (await this.safeJson(response)) as {
        message?: string;
      } | null;
      const message =
        typeof errorBody?.message === "string"
          ? errorBody.message
          : `Request failed with status ${response.status}`;

      throw new Error(message);
    }

    if (response.status === 204) {
      return undefined as TResponse;
    }

    return (await response.json()) as TResponse;
  }

  private async safeJson(response: Response): Promise<unknown | null> {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  setUnauthorizedHandler(handler?: () => void): void {
    this.onUnauthorized = handler;
  }
}
