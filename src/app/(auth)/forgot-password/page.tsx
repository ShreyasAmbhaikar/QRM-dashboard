'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { KeyRound, Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';
import { forgotPassword } from '@/features/auth/actions';

export default function ForgotPasswordPage() {
  const { success, error: toastError } = useToast();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

  useEffect(() => {
    (window as any).onTurnstileSuccess = (token: string) => {
      setTurnstileToken(token);
    };

    return () => {
      delete (window as any).onTurnstileSuccess;
      if (typeof window !== 'undefined' && (window as any).turnstile) {
        try {
          (window as any).turnstile.remove();
        } catch (e) {}
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await forgotPassword({ email }, turnstileToken);

      if (res.success) {
        success('Instructions Sent', res.message);
        setSubmitted(true);
      } else {
        setErrorMsg(res.message);
        toastError('Request Failed', res.message);
      }
    } catch {
      setErrorMsg('Failed to send recovery instructions. Please try again.');
      toastError('Recovery Error', 'An unexpected network error occurred.');
    } finally {
      setLoading(false);
      if ((window as any).turnstile) {
        (window as any).turnstile.reset();
        setTurnstileToken('');
      }
    }
  };

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />

      <div className="min-h-screen flex items-center justify-center bg-background px-4 select-none">
        <Card className="border-border/80 bg-card/90 text-card-foreground shadow-2xl backdrop-blur-xl w-full max-w-md mx-auto rounded-lg">
          <CardHeader className="space-y-3 text-center pb-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-primary/15 text-primary border border-primary/30 shadow-lg shadow-primary/20">
              <KeyRound className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10 px-2 py-0.5 text-[10px] rounded-md">
                Password Recovery
              </Badge>
              <CardTitle className="text-2xl font-bold tracking-tight">Reset Password</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Enter your registered agency email to receive a password reset token
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="space-y-4 text-center">
                <div className="p-3.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center gap-2 text-xs font-semibold">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span className="truncate">Instructions sent to {email}</span>
                </div>
                <Link href="/login" className="block">
                  <Button variant="outline" className="w-full text-xs font-semibold gap-2 border-border h-10 rounded-md">
                    <ArrowLeft className="h-4 w-4" /> Back to Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20 animate-in fade-in">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Agency Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="admin@quantumreachmedia.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-9 h-9 text-xs bg-muted/30 border-border focus-visible:ring-primary rounded-md"
                    />
                  </div>
                </div>

                {/* Cloudflare Turnstile Verification Container */}
                {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                  <div className="flex justify-center py-1">
                    <div
                      className="cf-turnstile"
                      data-sitekey={siteKey}
                      data-callback="onTurnstileSuccess"
                      data-theme="dark"
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full font-semibold h-10 text-xs shadow-lg shadow-primary/20 rounded-md"
                >
                  {loading ? 'Sending Instructions...' : 'Send Reset Instructions'}
                </Button>
                <div className="text-center pt-2">
                  <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium">
                    Remember your password? Sign in
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
