'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Button, Card, CardContent, CardFooter, CardHeader, Input, Label } from '@aidvokat/ui';
import { registerSchema } from '@aidvokat/contracts';
import { useUserStore } from '../../../lib/store/user-store';
import { AuthApiError, register } from '../../../lib/api/auth';

interface SignUpFormState {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const initialState: SignUpFormState = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: ''
};

export default function SignUpPage() {
  const tSignUp = useTranslations('auth.signUp');
  const tFields = useTranslations('auth.fields');
  const tErrors = useTranslations('auth.errors');
  const locale = useLocale();
  const setUser = useUserStore((state) => state.setUser);
  const router = useRouter();
  const [formState, setFormState] = useState<SignUpFormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = registerSchema.safeParse({
      ...formState,
      locale
    });

    if (!result.success) {
      const confirmIssue = result.error.issues.find((issue) => issue.path.includes('confirmPassword'));
      setError(confirmIssue ? tErrors('passwordMismatch') : tErrors('invalid'));
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await register(result.data);
      setUser(response.user);
      setSuccess(tSignUp('success'));
      router.push('/dashboard');
    } catch (apiError) {
      if (apiError instanceof AuthApiError) {
        if (apiError.status === 400) {
          setError(tErrors('invalid'));
        } else if (apiError.status === 409) {
          setError(tErrors('emailExists'));
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
      <Card className="w-full max-w-lg">
        <CardHeader>
          <h1 className="text-xl font-semibold">{tSignUp('title')}</h1>
          <p className="text-sm text-muted-foreground">{tSignUp('description')}</p>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="fullName">{tFields('fullName')}</Label>
              <Input
                id="fullName"
                name="fullName"
                autoComplete="name"
                value={formState.fullName}
                onChange={(event) => setFormState((prev) => ({ ...prev, fullName: event.target.value }))}
                required
              />
            </div>
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
                autoComplete="new-password"
                value={formState.password}
                onChange={(event) => setFormState((prev) => ({ ...prev, password: event.target.value }))}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{tFields('confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={formState.confirmPassword}
                onChange={(event) => setFormState((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                required
                minLength={8}
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
            <Button type="submit" className="w-full">
              {isSubmitting ? tSignUp('loading') : tSignUp('submit')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            {tSignUp('haveAccount')}{' '}
            <Button asChild variant="link" className="px-0">
              <Link href="/sign-in">{tSignUp('signInCta')}</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
