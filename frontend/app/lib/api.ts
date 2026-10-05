const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public data: unknown
  ) {
    super(`API error ${status}`);
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

export function setToken(token: string) {
  localStorage.setItem("auth_token", token);
}

export function clearToken() {
  localStorage.removeItem("auth_token");
}

export async function api<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(customHeaders as Record<string, string>),
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new ApiError(response.status, data);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

// Auth
export interface User {
  id: number;
  fullName: string;
  email: string;
  initials: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  data: {
    token: string;
    user: User;
  };
}

interface ProfileResponse {
  data: User;
}

export async function signup(data: {
  fullName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}) {
  const res = await api<AuthResponse>("/api/v1/auth/signup", {
    method: "POST",
    body: data,
  });
  setToken(res.data.token);
  return res.data;
}

export async function login(data: { email: string; password: string }) {
  const res = await api<AuthResponse>("/api/v1/auth/login", {
    method: "POST",
    body: data,
  });
  setToken(res.data.token);
  return res.data;
}

export async function logout() {
  await api("/api/v1/account/logout", { method: "POST" });
  clearToken();
}

export async function getProfile() {
  const res = await api<ProfileResponse>("/api/v1/account/profile");
  return res.data;
}

// Links
export interface Link {
  id: number;
  slug: string;
  destinationUrl: string;
  title: string;
  description: string | null;
  teamId: number | null;
  userId: number;
  clickCount: number;
  healthStatus: "healthy" | "degraded" | "broken";
  isActive: boolean | number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  team: { id: number; name: string; slug: string } | null;
  tags: { id: number; name: string }[];
}

export async function getLinks(params?: { query?: string; tag?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.query) searchParams.set("query", params.query);
  if (params?.tag) searchParams.set("tag", params.tag);
  const qs = searchParams.toString();
  return api<Link[]>(`/api/v1/links${qs ? `?${qs}` : ""}`);
}

export async function getLink(id: number) {
  return api<Link>(`/api/v1/links/${id}`);
}

export async function createLink(data: {
  slug: string;
  destinationUrl: string;
  title: string;
  description?: string;
  teamId?: number;
  tags?: string[];
}) {
  return api<Link>("/api/v1/links", { method: "POST", body: data });
}

export async function deleteLink(id: number) {
  return api<{ message: string }>(`/api/v1/links/${id}`, {
    method: "DELETE",
  });
}
