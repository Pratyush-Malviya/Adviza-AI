/**
 * Adviza AI - Frontend API Client
 * Wraps all requests to the standalone adviza-backend API (or Next.js proxy)
 * Automatically attaches Supabase session Bearer tokens.
 */

import { createClient } from "./supabase/client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiClient {
  private async getAuthHeader(): Promise<Record<string, string>> {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        return { Authorization: `Bearer ${session.access_token}` };
      }
    } catch {
      // In SSR or when unauthenticated, proceed without bearer token
    }
    return {};
  }

  private buildUrl(path: string, params?: Record<string, any>): string {
    // If path starts with http/https, use as-is
    let url = path.startsWith("http") ? path : `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          queryParams.append(key, String(val));
        }
      });
      const queryString = queryParams.toString();
      if (queryString) {
        url += (url.includes("?") ? "&" : "?") + queryString;
      }
    }

    return url;
  }

  async request<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers = {}, ...rest } = options;
    const authHeaders = await this.getAuthHeader();
    const url = this.buildUrl(path, params);

    const response = await fetch(url, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
        ...headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `API Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // Fall back to default error text
      }
      throw new Error(errorMessage);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  }

  get<T = any>(path: string, options?: RequestOptions) {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  post<T = any>(path: string, body?: any, options?: RequestOptions) {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  put<T = any>(path: string, body?: any, options?: RequestOptions) {
    return this.request<T>(path, {
      ...options,
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  delete<T = any>(path: string, options?: RequestOptions) {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}

export const api = new ApiClient();
