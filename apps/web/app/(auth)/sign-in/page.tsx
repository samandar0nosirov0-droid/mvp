'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Button, Card, CardContent, CardFooter, CardHeader, Input, Label } from '@aidvokat/ui';
import { loginSchema } from '@aidvokat/contracts';
import { useUserStore } from '../../../lib/store/user-store';
import { AuthApiError, login } from '../../../lib/api/auth';

export default function SignInPage() {
  const tSignIn = useTranslations('auth.signIn');
  const tFields = useTranslations('auth.fields');
  const tErrors = useTranslations('auth.errors');
  const locale = useLocale();
  const setUser = useUserStore((state) => state.setUser);
  const router = useRouter();
  const [formState, setFormState] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = loginSchema.safeParse({
      ...formState,
      locale
    });

    if (!result.success) {
      setError(tErrors('invalid'));
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await login(result.data);
      setUser(response.user);
      setSuccess(tSignIn('success'));
      router.push('/dashboard');
    } catch (apiError) {
      if (apiError instanceof AuthApiError) {
        if (apiError.status === 400) {
          setError(tErrors('invalid'));
        } else if (apiError.status === 401) {
          setError(tErrors('invalidCredentials'));
        } else {
          setError(tErrors('server'));
        }
      } else {
        setError(tErrors('network'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-xl font-semibold">{tSignIn('title')}</h1>
          <p className="text-sm text-muted-foreground">{tSignIn('description')}</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">{tFields('email')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formState.email}
                onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{tFields('password')}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={formState.password}
                onChange={(event) => setFormState((prev) => ({ ...prev, password: event.target.value }))}
                required
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
            <Button type="submit" className="w-full">
              {isSubmitting ? tSignIn('loading') : tSignIn('submit')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            {tSignIn('noAccount')}{' '}
            <Button asChild variant="link" className="px-0">
              <Link href="/sign-up">{tSignIn('registerCta')}</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
