'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, CardContent, CardHeader } from '@aidvokat/ui';
import {
  CaseDetailDto,
  CaseMessageDto,
  fetchCaseDetail,
  fetchCaseMessages,
  sendCaseMessage
} from '../lib/api/cases';
import { AppLocale } from '../lib/i18n-config';
import { formatDate } from '../lib/format';

export interface CaseChatProps {
  caseId: string;
}

function MessageBubble({ message }: { message: CaseMessageDto }) {
  const t = useTranslations('caseDetail');
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error('Clipboard error', error);
    }
  }, [message.content]);

  const handleFeedback = useCallback(() => {
    // TODO: заменить на модальное окно с отправкой отзыва
    alert(t('feedback.placeholder'));
  }, [t]);

  return (
    <div
      className={`rounded-lg border p-4 shadow-sm ${
        message.role === 'assistant' ? 'bg-muted' : 'bg-background'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">
            {t(`roles.${message.role}`)}
          </p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? t('actions.copied') : t('actions.copy')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleFeedback}>
            {t('actions.feedback')}
          </Button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span>{t('meta.locale', { locale: message.locale })}</span>
        {message.traceId ? <span>{t('meta.trace', { trace: message.traceId })}</span> : null}
        {typeof message.promptTokens === 'number' || typeof message.completionTokens === 'number' ? (
          <span>
            {t('meta.tokens', {
              prompt: message.promptTokens ?? 0,
              completion: message.completionTokens ?? 0
            })}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function LocaleSelector({ value, onChange }: { value: AppLocale; onChange: (next: AppLocale) => void }) {
  const t = useTranslations('caseDetail');

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">{t('actions.language')}</span>
      <div className="flex gap-1">
        {(['ru', 'uz'] as AppLocale[]).map((locale) => (
          <Button
            key={locale}
            type="button"
            variant={value === locale ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange(locale)}
          >
            {t(`locales.${locale}`)}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function CaseChat({ caseId }: CaseChatProps) {
  const t = useTranslations('caseDetail');
  const locale = useLocale();
  const [message, setMessage] = useState('');
  const [selectedLocale, setSelectedLocale] = useState<AppLocale>('ru');
  const [localeInitialized, setLocaleInitialized] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: caseDetail,
    isLoading: caseLoading,
    isError: caseError
  } = useQuery<CaseDetailDto>({
    queryKey: ['case', caseId],
    queryFn: () => fetchCaseDetail(caseId)
  });

  const {
    data: messages,
    isLoading: messagesLoading,
    isError: messagesError
  } = useQuery<CaseMessageDto[]>({
    queryKey: ['case', caseId, 'messages'],
    queryFn: () => fetchCaseMessages(caseId),
    enabled: !caseLoading && !caseError
  });

  const mutation = useMutation({
    mutationFn: () => sendCaseMessage(caseId, { content: message, locale: selectedLocale }),
    onSuccess: (result) => {
      queryClient.setQueryData<CaseMessageDto[]>(['case', caseId, 'messages'], (previous) => [
        ...(previous ?? []),
        result.userMessage,
        result.assistantMessage
      ]);
      setMessage('');
    }
  });

  const isDisabled = mutation.isPending || message.trim().length === 0;

  const sortedMessages = useMemo(() => {
    return [...(messages ?? [])].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [messages]);

  useEffect(() => {
    if (!localeInitialized && caseDetail?.language) {
      setSelectedLocale(caseDetail.language);
      setLocaleInitialized(true);
    }
  }, [caseDetail?.language, localeInitialized]);

  if (caseLoading) {
    return <p className="text-sm text-muted-foreground">{t('loading')}</p>;
  }

  if (caseError || !caseDetail) {
    return <p className="text-sm text-destructive">{t('notFound')}</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold">{caseDetail.title}</h1>
          <p className="text-sm text-muted-foreground">
            {t('lastUpdated', { date: formatDate(caseDetail.updatedAt, locale) })}
          </p>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{caseDetail.description}</p>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold">{t('chat.title')}</h2>
          <LocaleSelector value={selectedLocale} onChange={setSelectedLocale} />
        </header>

        {messagesLoading ? (
          <p className="text-sm text-muted-foreground">{t('chat.loading')}</p>
        ) : messagesError ? (
          <p className="text-sm text-destructive">{t('chat.error')}</p>
        ) : (
          <div className="space-y-3">
            {sortedMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('chat.empty')}</p>
            ) : (
              sortedMessages.map((item) => <MessageBubble key={item.id} message={item} />)
            )}
          </div>
        )}

        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (isDisabled) {
              return;
            }
            mutation.mutate();
          }}
        >
          <label className="block text-sm font-medium" htmlFor="chat-message">
            {t('chat.inputLabel')}
          </label>
          <textarea
            id="chat-message"
            className="w-full rounded-md border bg-background p-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            rows={4}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={t('chat.placeholder')}
          />
          <div className="flex items-center justify-between gap-2">
            {mutation.isError ? (
              <span className="text-sm text-destructive">{t('chat.sendError')}</span>
            ) : (
              <span className="text-sm text-muted-foreground">
                {t('chat.hint', { locale: selectedLocale.toUpperCase() })}
              </span>
            )}
            <Button type="submit" disabled={isDisabled}>
              {mutation.isPending ? t('chat.sending') : t('chat.submit')}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
