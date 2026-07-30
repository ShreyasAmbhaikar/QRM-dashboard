import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Search,
  TrendingUp,
  UserPlus,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Globe,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardHomePage() {
  return (
    <div className="space-y-8 select-none">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-lg bg-card border border-border p-6 md:p-8 shadow-sm">
        {/* Ambient Radial Accent Glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2.5">
              <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold rounded-md">
                Agency Command Center
              </Badge>
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live System Active
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Quantum Reach Media Overview
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Real-time multi-tenant SEO intelligence, Google Business Profile ranking grid, and AI content automation.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/dashboard/clients">
              <Button size="sm" className="gap-2 shadow-sm text-xs font-semibold h-9 px-4 rounded-md">
                <Users className="h-4 w-4" />
                Manage Clients
              </Button>
            </Link>
            <Link href="/dashboard/leads">
              <Button size="sm" variant="outline" className="gap-2 border-border text-xs font-medium h-9 px-4 rounded-md">
                <UserPlus className="h-4 w-4" />
                Lead Pipeline
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-border bg-card shadow-sm hover:border-primary/50 transition-all group rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Active Clients
            </CardTitle>
            <div className="h-8 w-8 rounded-md bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tracking-tight">2</div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mt-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+100% this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm hover:border-purple-500/50 transition-all group rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Tracked Keywords
            </CardTitle>
            <div className="h-8 w-8 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Search className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tracking-tight">5</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-purple-500/30 text-purple-300 rounded-md">
                Avg Position: #3.2
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm hover:border-amber-500/50 transition-all group rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Active Leads
            </CardTitle>
            <div className="h-8 w-8 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <UserPlus className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tracking-tight">3</div>
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium mt-1">
              <span>1 Proposal Pending</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm hover:border-emerald-500/50 transition-all group rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              System Health
            </CardTitle>
            <div className="h-8 w-8 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tracking-tight text-emerald-400">98%</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
              <span>All APIs Operational</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Client Health Portfolio */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-border shadow-sm overflow-hidden rounded-lg">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Client Health Portfolio
                </CardTitle>
                <CardDescription className="text-xs">Real-time SEO performance metrics & GBP health scores</CardDescription>
              </div>
              <Link href="/dashboard/clients">
                <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground hover:text-foreground rounded-md">
                  View All Clients <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {/* Client Card 1 */}
              <div className="p-4 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                <div className="flex items-center gap-3.5">
                  <div className="h-10 w-10 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-400 font-bold flex items-center justify-center text-sm shrink-0">
                    AP
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                        Apex Plumbing NYC
                      </h4>
                      <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.2 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Ready
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Globe className="h-3 w-3" /> apexplumbingnyc.com • Plumbing & HVAC
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-xs rounded-md">
                    Health: 92/100
                  </Badge>
                  <Badge variant="outline" className="text-xs border-border rounded-md">
                    3 Keywords (#3 avg)
                  </Badge>
                </div>
              </div>

              {/* Client Card 2 */}
              <div className="p-4 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                <div className="flex items-center gap-3.5">
                  <div className="h-10 w-10 rounded-md bg-teal-500/15 border border-teal-500/30 text-teal-400 font-bold flex items-center justify-center text-sm shrink-0">
                    MS
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-foreground group-hover:text-teal-400 transition-colors">
                        Metro Smiles Dental Care
                      </h4>
                      <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.2 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Ready
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Globe className="h-3 w-3" /> metrosmilesdental.com • Dental
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-xs rounded-md">
                    Health: 88/100
                  </Badge>
                  <Badge variant="outline" className="text-xs border-border rounded-md">
                    2 Keywords (#2.5 avg)
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Urgent Action Items */}
          <Card className="border-border shadow-sm rounded-lg">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-400" /> Urgent Action Items
                </CardTitle>
                <CardDescription className="text-xs">High priority SEO issues requiring agency attention</CardDescription>
              </div>
              <Link href="/dashboard/tasks">
                <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground hover:text-foreground rounded-md">
                  Task Board <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5">
              <div className="p-3.5 rounded-lg border border-amber-500/30 bg-amber-500/10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-medium truncate">Fix broken canonical tags for Apex Plumbing</span>
                </div>
                <Badge variant="warning" className="text-[10px] shrink-0 rounded-md">High Priority</Badge>
              </div>
              <div className="p-3.5 rounded-lg border border-border bg-muted/20 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-xs font-medium truncate">Generate monthly GBP post calendar for Metro Smiles</span>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0 border-border rounded-md">Medium</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Column: Quick Action Launchpad */}
        <div className="space-y-8">
          <Card className="border-border shadow-sm rounded-lg">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Zap className="h-4 w-4 text-primary" />
                Quick SEO Launchpad
              </CardTitle>
              <CardDescription className="text-xs">Launch automated agency optimization tools</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <Link href="/dashboard/keywords">
                <Button variant="outline" className="w-full justify-start gap-3 h-11 text-xs border-border hover:border-primary/50 hover:bg-primary/5 transition-all rounded-md">
                  <Search className="h-4 w-4 text-primary" />
                  <div className="flex flex-col items-start text-left">
                    <span className="font-semibold">Run Keyword Research</span>
                    <span className="text-[10px] text-muted-foreground">Discover high-volume local terms</span>
                  </div>
                </Button>
              </Link>
              <Link href="/dashboard/posts">
                <Button variant="outline" className="w-full justify-start gap-3 h-11 text-xs border-border hover:border-purple-500/50 hover:bg-purple-500/5 transition-all rounded-md">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <div className="flex flex-col items-start text-left">
                    <span className="font-semibold">Generate AI GBP Post</span>
                    <span className="text-[10px] text-muted-foreground">Create local posts & graphics</span>
                  </div>
                </Button>
              </Link>
              <Link href="/dashboard/seo-audit">
                <Button variant="outline" className="w-full justify-start gap-3 h-11 text-xs border-border hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all rounded-md">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <div className="flex flex-col items-start text-left">
                    <span className="font-semibold">Trigger Website SEO Audit</span>
                    <span className="text-[10px] text-muted-foreground">Lighthouse scan & audit checklist</span>
                  </div>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
