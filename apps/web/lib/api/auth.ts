import { LoginInput, RegisterInput, UserContract, userSchema } from '@aidvokat/contracts';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export class AuthApiError extends Error {
  constructor(public readonly status: number, public readonly code?: string, message?: string) {
    super(message ?? 'Auth API error');
    this.name = 'AuthApiError';
  }
}

interface AuthSuccessResponse {
  user: UserContract;
  accessToken?: string;
  refreshToken?: string;
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {})
    },
    credentials: 'include'
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new AuthApiError(response.status, data?.code, data?.message ?? data?.error);
  }

  return data as T;
}

export async function login(payload: LoginInput): Promise<AuthSuccessResponse> {
  const result = await request<AuthSuccessResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  return {
    ...result,
    user: userSchema.parse(result.user)
  };
}

export async function register(payload: RegisterInput): Promise<AuthSuccessResponse> {
  const result = await request<AuthSuccessResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  return {
    ...result,
    user: userSchema.parse(result.user)
  };
}

export async function logout() {
  await request<{ success: boolean }>('/auth/logout', {
    method: 'POST'
  });
}

export async function refresh() {
  const result = await request<AuthSuccessResponse>('/auth/refresh', {
    method: 'POST'
  });

  return {
    ...result,
    user: userSchema.parse(result.user)
  };
}
