'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  Zap,
  Globe,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/features/auth/actions';
import { signIn } from 'next-auth/react';

export default function SignupPage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [turnstileToken, setTurnstileToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

  useEffect(() => {
    // Expose callback for Cloudflare Turnstile token
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

  // Validate form client-side using simple rules
  const validateForm = () => {
    const tempErrors: Record<string, string> = {};
    if (!name) tempErrors.name = 'Name is required';
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) tempErrors.email = 'Invalid email address';
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
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await registerUser({ name, email, password, confirmPassword }, turnstileToken);

      if (res.success) {
        success('Account Created', res.message);
        router.push('/login');
      } else {
        if (res.errors) {
          setErrors(res.errors);
        }
        toastError('Registration Failed', res.message);
      }
    } catch {
      toastError('Registration Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
      // Reset Turnstile widget if window.turnstile exists
      if ((window as any).turnstile) {
        (window as any).turnstile.reset();
        setTurnstileToken('');
      }
    }
  };

  const handleOAuthLogin = (provider: string) => {
    signIn(provider, { callbackUrl: '/dashboard' });
  };

  return (
    <>
      {/* Turnstile CDN Script */}
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />

      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-background select-none">
        {/* Left Side: Signup Form Column */}
        <div className="lg:col-span-5 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-12 z-10">
          <Card className="border-border/80 bg-card/90 text-card-foreground shadow-2xl backdrop-blur-xl w-full max-w-md mx-auto">
            <CardHeader className="space-y-3 text-center pb-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/15 text-primary border border-primary/30 shadow-lg shadow-primary/20 animate-pulse">
                <Zap className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10 px-2 py-0.5 text-[10px]">
                    Quantum Reach Media
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">Create Agency Account</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Register for an automated multi-tenant SEO & GBP workspace
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* OAuth Providers Row */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => handleOAuthLogin('google')}
                  className="h-9 text-xs border-border/80 hover:bg-muted/40 font-semibold flex items-center justify-center gap-2"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => handleOAuthLogin('github')}
                  className="h-9 text-xs border-border/80 hover:bg-muted/40 font-semibold flex items-center justify-center gap-2"
                >
                  <svg className="h-4 w-4 fill-foreground" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  GitHub
                </Button>
              </div>

              {/* Separator Divider */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/80" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                  <span className="bg-card px-2 text-muted-foreground">Or register with email</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="pl-9 h-9 text-xs bg-muted/30 border-border/80 focus-visible:ring-primary"
                    />
                  </div>
                  {errors.name && <span className="text-[10px] text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.name}</span>}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="agency@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-9 h-9 text-xs bg-muted/30 border-border/80 focus-visible:ring-primary"
                    />
                  </div>
                  {errors.email && <span className="text-[10px] text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.email}</span>}
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-9 pr-10 h-9 text-xs bg-muted/30 border-border/80 focus-visible:ring-primary"
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
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pl-9 pr-10 h-9 text-xs bg-muted/30 border-border/80 focus-visible:ring-primary"
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
                <div className="flex justify-center py-1">
                  <div
                    className="cf-turnstile"
                    data-sitekey={siteKey}
                    data-callback="onTurnstileSuccess"
                    data-theme="dark"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full font-semibold h-10 text-xs transition-all shadow-lg shadow-primary/20 gap-2 mt-2"
                >
                  {loading ? 'Creating Account...' : 'Sign Up to Dashboard'}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </Button>

                <div className="text-center pt-2">
                  <span className="text-xs text-muted-foreground">Already have an account? </span>
                  <Link href="/login" className="text-xs text-primary hover:underline font-semibold">
                    Sign In
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Visual Mockup / Copy Pane */}
        <div className="hidden lg:grid lg:col-span-7 relative overflow-hidden bg-zinc-950/80 border-l border-border flex items-center justify-center p-12">
          {/* Subtle Radial Glow */}
          <div className="absolute inset-0 bg-radial-gradient from-primary/15 to-transparent blur-3xl pointer-events-none" />

          <div className="relative space-y-6 text-center max-w-lg z-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
                <Globe className="h-8 w-8 text-primary animate-spin-slow" />
                Quantum Reach Enterprise
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Automated GBP Rank Scanning, Multi-tenant Client Reporting, and high-performance AI Optimization.
              </p>
            </div>

            {/* Generated Marketing Visual Image */}
            <div className="relative border border-border bg-card/60 p-1.5 rounded-lg shadow-2xl overflow-hidden group">
              <Image
                src="/auth-visual.jpg"
                alt="Quantum Reach SEO Analytics Command Center Platform Illustration"
                width={800}
                height={533}
                priority
                className="rounded-md object-cover filter brightness-95 contrast-105 group-hover:scale-[1.01] transition-transform duration-500"
              />
              <div className="absolute inset-0 rounded-md border border-white/5 pointer-events-none" />
            </div>

            <div className="flex justify-center gap-6 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-purple-400" /> AI Content Suite
              </span>
              <span>•</span>
              <span>18-Module RBAC</span>
              <span>•</span>
              <span>Real-Time Audit Logs</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
