import React from 'react';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAgreements } from '@/features/agreements/actions';
import { AgreementList } from '@/features/agreements/components/agreement-list';

export default async function AgreementsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  // Get agreements
  const response = await getAgreements();
  let agreements = response.success ? response.data : [];

  if (!agreements || agreements.length === 0) {
    // If no agreements exist, find or create a default client
    let client = await db.client.findFirst();
    if (!client) {
      client = await db.client.create({
        data: {
          name: 'Dr. Chintan Gujarathi',
          domain: 'drchintangujarathi.com',
          industry: 'Medical/Cosmetic',
          status: 'ACTIVE',
        },
      });
    }

    // Create default template agreement
    const DEFAULT_AGREEMENT_TEMPLATE = `<p>This Agreement is made on <strong>____________________</strong> between:</p>
<table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; margin-bottom: 16px; table-layout: fixed;">
  <thead>
    <tr style="background-color: #faf5ff; border-bottom: 1px solid #cbd5e1;">
      <th style="width: 50%; border-right: 1px solid #cbd5e1; padding: 8px; text-align: left; font-weight: bold; color: #581c87; font-size: 9.5px; text-transform: uppercase;">Service Provider</th>
      <th style="width: 50%; padding: 8px; text-align: left; font-weight: bold; color: #581c87; font-size: 9.5px; text-transform: uppercase;">Client Details</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="width: 50%; border-right: 1px solid #cbd5e1; padding: 10px; vertical-align: top; color: #334155; font-size: 9px; line-height: 1.4;">
        <strong>Company Name:</strong> Quantum Reach Media<br />
        <strong>Address:</strong> _________________________________
      </td>
      <td style="width: 50%; padding: 10px; vertical-align: top; color: #334155; font-size: 9px; line-height: 1.4;">
        <strong>Client Name:</strong> Dr. Chintan Gujarathi<br />
        <strong>Business Name:</strong> Dr. Chintan Gujarathi – Plastic & Cosmetic Surgery Clinic<br />
        <strong>Address:</strong> _________________________________
      </td>
    </tr>
  </tbody>
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
<table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; margin-bottom: 12px; background-color: #faf5ff; table-layout: fixed;">
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

    const newAgreement = await db.agreement.create({
      data: {
        title: 'Dr. Chintan Gujarathi — Plastic & Cosmetic Surgery Clinic Service Agreement',
        clientId: client.id,
        monthlyFee: 8000,
        startDate: new Date(),
        content: DEFAULT_AGREEMENT_TEMPLATE,
        companyName: 'Quantum Reach Media',
        companyEmail: 'tushar7738812028@gmail.com',
        companyPhone: '+91 77388 12028',
        companyWebsite: 'quantumreachmedia.com',
        deliverables: [
          'Google My Business (GMB) Optimization',
          'SEO-Friendly Website Development',
          '12 Months Continuous GMB Maintenance',
        ],
        createdById: session.user.id,
      },
      include: { client: true },
    });

    agreements = [newAgreement as any];
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <AgreementList initialAgreements={agreements} />
    </div>
  );
}
