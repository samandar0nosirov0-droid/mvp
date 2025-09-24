import { caseMessageCreateSchema } from '@aidvokat/contracts';
import { AppLocale } from '../i18n-config';

const DEFAULT_API_URL = 'http://localhost:3001';

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'API_ERROR');
  }

  return response.json() as Promise<T>;
}

export interface CaseDetailDto {
  id: string;
  title: string;
  description: string;
  category: string;
  language: AppLocale;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface CaseMessageDto {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  locale: AppLocale;
  createdAt: string;
  traceId?: string | null;
  promptTokens?: number | null;
  completionTokens?: number | null;
}

export interface SendMessageResponse {
  userMessage: CaseMessageDto;
  assistantMessage: CaseMessageDto;
}

export async function fetchCaseDetail(caseId: string): Promise<CaseDetailDto> {
  const response = await fetch(`${getApiBaseUrl()}/cases/${caseId}`, {
    credentials: 'include'
  });

  return handleResponse<CaseDetailDto>(response);
}

export async function fetchCaseMessages(caseId: string): Promise<CaseMessageDto[]> {
  const response = await fetch(`${getApiBaseUrl()}/cases/${caseId}/messages`, {
    credentials: 'include'
  });

  return handleResponse<CaseMessageDto[]>(response);
}

export interface SendCaseMessageInput {
  content: string;
  locale: AppLocale;
}

export async function sendCaseMessage(
  caseId: string,
  input: SendCaseMessageInput
): Promise<SendMessageResponse> {
  const payload = caseMessageCreateSchema.parse({
    caseId,
    content: input.content,
    locale: input.locale,
    role: 'user'
  });

  const response = await fetch(`${getApiBaseUrl()}/cases/${caseId}/messages`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content: payload.content, locale: payload.locale, role: payload.role })
  });

  return handleResponse<SendMessageResponse>(response);
}
