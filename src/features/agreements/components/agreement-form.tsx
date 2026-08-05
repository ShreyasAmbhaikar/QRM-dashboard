'use client';

import React, { useState } from 'react';
import { createAgreement } from '../actions';
import { CreateAgreementInput } from '../schemas';
import { DeliverableChecklist } from './deliverable-checklist';
import { AgreementEditor } from './agreement-editor';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Save, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AgreementStatus } from '@prisma/client';
import Link from 'next/link';

interface AgreementFormProps {
  clients: { id: string; name: string; domain: string }[];
}

const DEFAULT_AGREEMENT_TEMPLATE = `<p>This Agreement is made on <strong>____________________</strong> between:</p>
<table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; margin-bottom: 16px;">
  <tr>
    <td style="width: 50%; border: 1px solid #cbd5e1; padding: 8px; vertical-align: top;">
      <strong>Service Provider:</strong> Quantum Reach Media<br />
      <strong>Address:</strong> _________________________________
    </td>
    <td style="width: 50%; border: 1px solid #cbd5e1; padding: 8px; vertical-align: top;">
      <strong>Client:</strong> Dr. Chintan Gujarathi<br />
      <strong>Business Name:</strong> Dr. Chintan Gujarathi – Plastic & Cosmetic Surgery Clinic<br />
      <strong>Address:</strong> _________________________________
    </td>
  </tr>
</table>

<h1>PURPOSE OF AGREEMENT</h1>
<p>The purpose of this agreement is to provide Google My Business (GMB) Optimization and Website Development services for the promotion and digital growth of Dr. Chintan Gujarathi’s clinic.</p>

<h1>SCOPE OF SERVICES</h1>
<p>The Service Provider agrees to provide the following services:</p>
<h2>A. Google My Business (GMB) Optimization</h2>
<ul>
  <li>Optimization of Google My Business Profile</li>
  <li>Area-wise listing and targeting</li>
  <li>Category keyword listing optimization</li>
  <li>High-intent keyword targeting based on location and pin code (Example: Plastic Surgeon in 411001)</li>
  <li>Relevant address targeting for improved local visibility</li>
  <li>Improvement in local search visibility and Google rankings</li>
  <li>Patient traffic and footfall growth strategies for relevant categories such as Plastic Surgeon and Cosmetic Surgeon</li>
  <li>Continuous maintenance and optimization for a duration of 12 months</li>
</ul>
<h2>B. Website Development</h2>
<ul>
  <li>SEO-friendly website development</li>
  <li>Mobile responsive and user-friendly design</li>
  <li>Service pages optimization</li>
  <li>Basic on-page SEO implementation</li>
  <li>Contact and appointment inquiry integration</li>
  <li>Performance and visibility optimization</li>
</ul>

<h1>PERFORMANCE OBJECTIVES</h1>
<p>The Service Provider will work towards:</p>
<ul>
  <li>Achieving first-page visibility on Google for targeted keywords</li>
  <li>Improving online presence and local search rankings</li>
  <li>Generating higher patient inquiries and clinic visibility</li>
  <li>Delivering an estimated 3 to 4 times return on investment through digital growth strategies</li>
</ul>

<h1>DURATION</h1>
<p>This agreement shall remain valid for a period of One (1) Year from the date of commencement.</p>

<hr />

<h1>SERVICE FEES</h1>
<table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; margin-bottom: 12px; background-color: #faf5ff;">
  <tr>
    <td style="padding: 10px; border: 1px solid #cbd5e1;">
      <strong>Total Service Amount:</strong> INR 96,000/- (Ninety-Six Thousand Rupees Only)
    </td>
  </tr>
</table>
<p><strong>Services Included:</strong></p>
<ul>
  <li>Google My Business (GMB) Optimization</li>
  <li>Website Development</li>
  <li>Maintenance for One Year</li>
</ul>

<h1>PAYMENT TERMS</h1>
<ul>
  <li>Payment terms shall be mutually agreed upon by both parties.</li>
  <li>Any additional services outside the agreed scope may be charged separately.</li>
</ul>

<h1>CLIENT RESPONSIBILITIES</h1>
<p>The Client agrees to provide:</p>
<ul>
  <li>Required clinic information, images, branding materials, and approvals on time</li>
  <li>Timely communication and cooperation for successful project execution</li>
</ul>

<h1>LIMITATION OF GUARANTEE</h1>
<p>While the Service Provider will implement professional SEO and marketing practices, Google rankings and business growth may vary based on competition, market conditions, and algorithm updates. No absolute ranking guarantee is implied.</p>

<h1>TERMINATION</h1>
<p>Either party may terminate this agreement with prior written notice if terms are violated or services cannot continue due to unforeseen circumstances.</p>

<h1>ACCEPTANCE</h1>
<p>By signing below, both parties agree to the terms and conditions mentioned in this agreement.</p>`;

export function AgreementForm({ clients }: AgreementFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateAgreementInput>>({
    title: 'Dr. Chintan Gujarathi — Plastic & Cosmetic Surgery Clinic Service Agreement',
    clientId: clients[0]?.id || '',
    monthlyFee: 8000, // INR 96,000 / 12
    startDate: new Date().toISOString().split('T')[0],
    endDate: undefined,
    status: AgreementStatus.DRAFT,
    content: DEFAULT_AGREEMENT_TEMPLATE,
    companyName: 'Quantum Reach Media',
    companyEmail: 'tushar7738812028@gmail.com',
    companyPhone: '+91 77388 12028',
    companyWebsite: 'quantumreachmedia.com',
    deliverables: [
      'Google My Business (GMB) Optimization',
      'SEO-Friendly Website Development',
      '12 Months Continuous GMB Maintenance',
      'Basic On-Page SEO & Service Pages Optimization',
    ],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.clientId || !formData.monthlyFee || !formData.startDate) return;

    setLoading(true);
    try {
      const res = await createAgreement({
        title: formData.title,
        clientId: formData.clientId,
        monthlyFee: Number(formData.monthlyFee),
        startDate: formData.startDate.toString(),
        endDate: formData.endDate ? formData.endDate.toString() : undefined,
        status: formData.status || AgreementStatus.DRAFT,
        content: formData.content || 'Default Agreement Terms',
        deliverables: formData.deliverables || [],
        companyName: formData.companyName,
        companyEmail: formData.companyEmail,
        companyPhone: formData.companyPhone,
        companyWebsite: formData.companyWebsite,
      });

      if (res.success && res.data) {
        router.push(`/dashboard/agreements/${res.data.id}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/agreements">
            <Button type="button" variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Create Service Agreement</h1>
        </div>
        <Button type="submit" disabled={loading} className="gap-2 shadow bg-purple-700 hover:bg-purple-800 text-white">
          <Save className="h-4 w-4" /> {loading ? 'Saving...' : 'Create & Generate Contract'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 columns: Agreement Content and Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-foreground font-bold">
                <FileText className="h-4 w-4 text-purple-700" /> Contract Custom Services Content
              </CardTitle>
              <CardDescription className="text-xs">
                Write the full contract details below. Click "Insert Page Break" to add a hard page split.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AgreementEditor
                value={formData.content || ''}
                onChange={(html) => setFormData({ ...formData, content: html })}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right column: Contract Settings & Branding */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-foreground font-bold">Agreement Settings</CardTitle>
              <CardDescription className="text-xs">Client matching and pricing retainer terms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Contract Title *</label>
                <Input
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="h-8 text-xs text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Target Client *</label>
                <select
                  className="w-full h-8 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.domain})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Monthly Fee / Value *</label>
                  <Input
                    required
                    type="number"
                    value={formData.monthlyFee || ''}
                    onChange={(e) => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
                    className="h-8 text-xs font-mono text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Start Date *</label>
                  <Input
                    required
                    type="date"
                    value={formData.startDate ? formData.startDate.toString() : ''}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="h-8 text-xs text-foreground"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base text-foreground font-bold">Company Branding & Info</CardTitle>
              <CardDescription className="text-xs">Printed header credentials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Company Name</label>
                <Input
                  value={formData.companyName || ''}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="h-8 text-xs text-foreground"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Company Website</label>
                <Input
                  value={formData.companyWebsite || ''}
                  onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                  className="h-8 text-xs text-foreground"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Contact Email</label>
                <Input
                  type="email"
                  value={formData.companyEmail || ''}
                  onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                  className="h-8 text-xs text-foreground"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Contact Phone</label>
                <Input
                  value={formData.companyPhone || ''}
                  onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                  className="h-8 text-xs text-foreground"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base text-foreground font-bold">Deliverables Summary</CardTitle>
              <CardDescription className="text-xs">Checklist tags for search filter indexing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <DeliverableChecklist
                items={formData.deliverables || []}
                onChange={(items) => setFormData({ ...formData, deliverables: items })}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
