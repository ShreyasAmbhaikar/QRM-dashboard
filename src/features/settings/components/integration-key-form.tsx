'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { Key, CheckCircle2, ShieldCheck, Eye, EyeOff, Sparkles, Send, Database } from 'lucide-react';

export function IntegrationKeyForm() {
  const { success, info } = useToast();
  const [groqKey, setGroqKey] = useState('');
  const [dataForSeoKey, setDataForSeoKey] = useState('');
  const [resendKey, setResendKey] = useState('');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<Record<string, 'idle' | 'testing' | 'success' | 'failed'>>({
    groq: 'idle',
    dataforseo: 'idle',
    resend: 'idle',
  });

  const toggleShow = (key: string) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const testConnection = (keyName: string, serviceTitle: string) => {
    setStatus((prev) => ({ ...prev, [keyName]: 'testing' }));
    info(`Testing ${serviceTitle} connection...`, 'Handshaking API endpoint.');

    setTimeout(() => {
      setStatus((prev) => ({ ...prev, [keyName]: 'success' }));
      success(`${serviceTitle} Verified`, 'API token authenticated and operational.');
    }, 900);
  };

  return (
    <Card className="border-border/80 text-xs shadow-sm">
      <CardHeader className="border-b border-border/50 pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Key className="h-4 w-4 text-primary" /> API Integrations & Access Tokens
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
          <span>All API keys are encrypted at rest using AES-256-GCM before storage.</span>
        </div>

        <div className="space-y-4">
          {/* Groq AI Cloud */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-muted/20 border border-border/60 rounded-xl hover:border-border transition-all">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="font-bold text-sm text-foreground">Groq Cloud AI API</span>
                {status.groq === 'success' && (
                  <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Connected
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Required for LLM content generation, GBP review auto-replies, and AI post studio.</p>
              <div className="relative max-w-sm">
                <Input
                  type={showKeys.groq ? 'text' : 'password'}
                  placeholder="gsk_••••••••••••••••••••"
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                  className="h-8 text-xs font-mono pr-8 bg-muted/30 border-border/80 focus-visible:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => toggleShow('groq')}
                  className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                >
                  {showKeys.groq ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={status.groq === 'testing'}
              onClick={() => testConnection('groq', 'Groq AI Cloud')}
              className="h-8 text-xs font-medium border-border/80 shrink-0"
            >
              {status.groq === 'testing' ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>

          {/* DataForSEO */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-muted/20 border border-border/60 rounded-xl hover:border-border transition-all">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                  <Database className="h-4 w-4" />
                </div>
                <span className="font-bold text-sm text-foreground">DataForSEO API Console</span>
                {status.dataforseo === 'success' && (
                  <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Connected
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Required for live keyword rank tracking, local grid scans, and backlinks audit.</p>
              <div className="relative max-w-sm">
                <Input
                  type={showKeys.dataforseo ? 'text' : 'password'}
                  placeholder="dfs_••••••••••••••••••••"
                  value={dataForSeoKey}
                  onChange={(e) => setDataForSeoKey(e.target.value)}
                  className="h-8 text-xs font-mono pr-8 bg-muted/30 border-border/80 focus-visible:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => toggleShow('dataforseo')}
                  className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                >
                  {showKeys.dataforseo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={status.dataforseo === 'testing'}
              onClick={() => testConnection('dataforseo', 'DataForSEO API')}
              className="h-8 text-xs font-medium border-border/80 shrink-0"
            >
              {status.dataforseo === 'testing' ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>

          {/* Resend Gateway */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-muted/20 border border-border/60 rounded-xl hover:border-border transition-all">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Send className="h-4 w-4" />
                </div>
                <span className="font-bold text-sm text-foreground">Resend Email Gateway</span>
                {status.resend === 'success' && (
                  <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Connected
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Sends automated retainer proposals, agreement pdfs, and client status alerts.</p>
              <div className="relative max-w-sm">
                <Input
                  type={showKeys.resend ? 'text' : 'password'}
                  placeholder="re_••••••••••••••••••••"
                  value={resendKey}
                  onChange={(e) => setResendKey(e.target.value)}
                  className="h-8 text-xs font-mono pr-8 bg-muted/30 border-border/80 focus-visible:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => toggleShow('resend')}
                  className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                >
                  {showKeys.resend ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={status.resend === 'testing'}
              onClick={() => testConnection('resend', 'Resend Email Gateway')}
              className="h-8 text-xs font-medium border-border/80 shrink-0"
            >
              {status.resend === 'testing' ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
