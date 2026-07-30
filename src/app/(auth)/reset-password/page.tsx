'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { KeyRound, Lock, ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';
import { useSearchParams, useRouter } from 'next/navigation';
import { resetPassword } from '@/features/auth/actions';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  
  const { success, error: toastError } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

  useEffect(() => {
    (window as any).onTurnstileSuccess = (t: string) => {
      setTurnstileToken(t);
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

  const validateForm = () => {
    const tempErrors: Record<string, string> = {};
    if (password.length < 8) tempErrors.password = 'Password must be at least 8 characters';
    if (!password.match(/[A-Z]/)) tempErrors.password = 'Must contain at least one uppercase letter';
    if (!password.match(/[a-z]/)) tempErrors.password = 'Must contain at least one lowercase letter';
    if (!password.match(/[0-9]/)) tempErrors.password = 'Must contain at least one number';
    if (!password.match(/[@$!%*?&]/)) tempErrors.password = 'Must contain at least one special character';
    if (password !== confirmPassword) tempErrors.confirmPassword = 'Passwords do not match';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg('Invalid or expired reset token. Please request a new recovery link.');
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await resetPassword(token, { password, confirmPassword }, turnstileToken);

      if (res.success) {
        success('Password Updated', res.message);
        setSubmitted(true);
      } else {
        setErrorMsg(res.message);
        if (res.errors) {
          setErrors(res.errors);
        }
        toastError('Reset Failed', res.message);
      }
    } catch {
      setErrorMsg('Failed to update password. Please try again.');
      toastError('Reset Error', 'An unexpected error occurred.');
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
                Secure Reset
              </Badge>
              <CardTitle className="text-2xl font-bold tracking-tight">Configure Password</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Set a secure password for your Quantum Reach Media workspace
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="space-y-4 text-center">
                <div className="p-3.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center gap-2 text-xs font-semibold">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Password updated successfully!</span>
                </div>
                <Link href="/login" className="block">
                  <Button variant="outline" className="w-full text-xs font-semibold gap-2 border-border h-10 rounded-md">
                    Proceed to Sign In
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

                 {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-9 pr-10 h-9 text-xs bg-muted/30 border-border focus-visible:ring-primary rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <span className="text-[10px] text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3 shrink-0" />{errors.password}</span>}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pl-9 pr-10 h-9 text-xs bg-muted/30 border-border focus-visible:ring-primary rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="text-[10px] text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.confirmPassword}</span>}
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
                  {loading ? 'Updating Password...' : 'Save New Password'}
                </Button>
                <div className="text-center pt-2">
                  <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium">
                    Back to Sign In
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center text-muted-foreground text-xs py-12">Loading reset page...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
