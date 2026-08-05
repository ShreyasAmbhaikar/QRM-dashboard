'use server';

import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { withPermission } from '@/lib/auth/permissions';
import { createAuditLog } from '@/lib/audit';
import { createNotification } from '@/lib/notifications';
import { successResponse, errorResponse, ApiResponse } from '@/lib/api/response';
import { createAgreementSchema, updateAgreementSchema, CreateAgreementInput, UpdateAgreementInput } from './schemas';
import { Agreement, AgreementStatus, Prisma } from '@prisma/client';
import { headers } from 'next/headers';

export type AgreementWithClient = Prisma.AgreementGetPayload<{
  include: { client: true };
}>;

export async function getAgreements(): Promise<ApiResponse<AgreementWithClient[]>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('agreements', 'read')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Permission denied for agreements module');
  }

  try {
    const agreements = await db.agreement.findMany({
      include: { client: true },
      orderBy: { updatedAt: 'desc' },
    });
    return successResponse(agreements as AgreementWithClient[]);
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to fetch agreements', err);
  }
}

export async function getAgreementById(id: string): Promise<ApiResponse<AgreementWithClient>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('agreements', 'read')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Permission denied for agreements module');
  }

  try {
    const agreement = await db.agreement.findUnique({
      where: { id },
      include: { client: true },
    });
    if (!agreement) return errorResponse('NOT_FOUND', 'Agreement not found');
    return successResponse(agreement as AgreementWithClient);
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to fetch agreement details', err);
  }
}

export async function getPublicAgreementById(id: string): Promise<ApiResponse<AgreementWithClient>> {
  try {
    const agreement = await db.agreement.findUnique({
      where: { id },
      include: { client: true },
    });
    if (!agreement) return errorResponse('NOT_FOUND', 'Agreement not found');
    return successResponse(agreement as AgreementWithClient);
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to fetch agreement details', err);
  }
}

export async function createAgreement(input: CreateAgreementInput): Promise<ApiResponse<Agreement>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('agreements', 'full')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Full permission required to create agreements');
  }

  const parseResult = createAgreementSchema.safeParse(input);
  if (!parseResult.success) {
    return errorResponse('VALIDATION_ERROR', 'Invalid agreement input', parseResult.error.format());
  }

  try {
    const agreement = await db.agreement.create({
      data: {
        title: parseResult.data.title,
        clientId: parseResult.data.clientId,
        monthlyFee: parseResult.data.monthlyFee,
        startDate: new Date(parseResult.data.startDate),
        endDate: parseResult.data.endDate ? new Date(parseResult.data.endDate) : undefined,
        deliverables: parseResult.data.deliverables as unknown as Prisma.InputJsonValue,
        content: parseResult.data.content,
        companyName: parseResult.data.companyName || "Quantum Reach Media",
        companyEmail: parseResult.data.companyEmail || "tushar7738812028@gmail.com",
        companyPhone: parseResult.data.companyPhone || "+91 77388 12028",
        companyWebsite: parseResult.data.companyWebsite || "quantumreachmedia.com",
        createdById: session.user.id,
      },
    });

    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE',
      resource: 'Agreement',
      resourceId: agreement.id,
      newData: agreement,
    });

    return successResponse(agreement);
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to create agreement', err);
  }
}

export async function updateAgreement(input: UpdateAgreementInput): Promise<ApiResponse<Agreement>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('agreements', 'full')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Full permission required to update agreements');
  }

  const parseResult = updateAgreementSchema.safeParse(input);
  if (!parseResult.success) {
    return errorResponse('VALIDATION_ERROR', 'Invalid agreement update details', parseResult.error.format());
  }

  const { id, ...data } = parseResult.data;

  try {
    const existing = await db.agreement.findUnique({ where: { id } });
    if (!existing) return errorResponse('NOT_FOUND', 'Agreement not found');

    const updated = await db.agreement.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        deliverables: data.deliverables ? (data.deliverables as unknown as Prisma.InputJsonValue) : undefined,
      },
    });

    await createAuditLog({
      userId: session.user.id,
      action: 'UPDATE',
      resource: 'Agreement',
      resourceId: id,
      previousData: existing,
      newData: updated,
    });

    return successResponse(updated);
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to update agreement details', err);
  }
}

export async function signAgreementAction(
  id: string,
  role: 'CLIENT' | 'PROVIDER',
  signatureBase64: string,
  signedName: string
): Promise<ApiResponse<Agreement>> {
  // Audit metadata
  const reqHeaders = await headers();
  const ip = reqHeaders.get('x-forwarded-for') || reqHeaders.get('x-real-ip') || 'unknown';
  const userAgent = reqHeaders.get('user-agent') || 'unknown';

  let currentUserId = 'CLIENT_ACTION';
  if (role === 'PROVIDER') {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', 'Authentication required to sign as provider');
    }
    const hasPermission = await withPermission('agreements', 'full')(session.user.id);
    if (!hasPermission) {
      return errorResponse('FORBIDDEN', 'Full permission required to sign agreement');
    }
    currentUserId = session.user.id;
  }

  try {
    const existing = await db.agreement.findUnique({ where: { id } });
    if (!existing) return errorResponse('NOT_FOUND', 'Agreement not found');

    let updateData: Prisma.AgreementUpdateInput = {};

    if (role === 'CLIENT') {
      updateData = {
        clientSignature: signatureBase64,
        clientSignedName: signedName,
        clientSignedAt: new Date(),
      };
    } else {
      updateData = {
        providerSignature: signatureBase64,
        providerSignedName: signedName,
        providerSignedAt: new Date(),
      };
    }

    // Determine status: if both signature fields are populated (either already existing or updated now)
    const clientSig = role === 'CLIENT' ? signatureBase64 : existing.clientSignature;
    const providerSig = role === 'PROVIDER' ? signatureBase64 : existing.providerSignature;
    
    if (clientSig && providerSig) {
      updateData.status = AgreementStatus.SIGNED;
    } else {
      updateData.status = AgreementStatus.SENT;
    }

    const updated = await db.agreement.update({
      where: { id },
      data: updateData,
    });

    const fallbackUser = await db.user.findFirst();
    const systemUserId = existing.createdById || fallbackUser?.id || '';

    // Record audit log
    await db.auditLog.create({
      data: {
        userId: currentUserId === 'CLIENT_ACTION' ? systemUserId : currentUserId,
        action: 'UPDATE',
        resource: `AgreementSignature:${role}`,
        resourceId: id,
        newData: {
          signedName,
          role,
          ipAddress: ip,
          userAgent,
        } as unknown as Prisma.InputJsonValue,
      },
    });

    if (currentUserId !== 'CLIENT_ACTION') {
      await createNotification({
        userId: currentUserId,
        type: 'INFO',
        title: 'Agreement Signed',
        message: `${role === 'CLIENT' ? 'Client' : 'Provider'} signed contract "${existing.title}"`,
        actionUrl: `/dashboard/agreements/${id}`,
      });
    }

    return successResponse(updated);
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to save signature', err);
  }
}

export async function updateAgreementStatus(id: string, status: AgreementStatus): Promise<ApiResponse<Agreement>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('agreements', 'full')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Full permission required to update agreement status');
  }

  try {
    const existing = await db.agreement.findUnique({ where: { id } });
    if (!existing) return errorResponse('NOT_FOUND', 'Agreement not found');

    const updated = await db.agreement.update({
      where: { id },
      data: { status },
    });

    await createAuditLog({
      userId: session.user.id,
      action: 'UPDATE',
      resource: 'Agreement',
      resourceId: id,
      previousData: { status: existing.status },
      newData: { status },
    });

    await createNotification({
      userId: session.user.id,
      type: 'INFO',
      title: 'Agreement Status Updated',
      message: `Agreement "${existing.title}" status changed to ${status}`,
      actionUrl: `/dashboard/agreements/${id}`,
    });

    return successResponse(updated);
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to update agreement status', err);
  }
}

export async function createDefaultAgreementAction(): Promise<ApiResponse<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('agreements', 'full')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Full permission required to create agreements');
  }

  try {
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

    const count = await db.agreement.count();
    const title = `Dr. Chintan Gujarathi — Plastic & Cosmetic Surgery Clinic Service Agreement #${count + 1}`;

    const DEFAULT_AGREEMENT_TEMPLATE = `<p>This Agreement is made on <strong>____________________</strong> between:</p>
<table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; margin-bottom: 16px;">
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

    const agreement = await db.agreement.create({
      data: {
        title,
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
    });

    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE',
      resource: 'Agreement',
      resourceId: agreement.id,
      newData: { title },
    });

    return successResponse({ id: agreement.id });
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to create new agreement', err);
  }
}

export async function getAgreementHistoryAction(id: string): Promise<ApiResponse<any[]>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  try {
    const logs = await db.auditLog.findMany({
      where: {
        resourceId: id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    return successResponse(logs);
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to fetch agreement audit history', err);
  }
}

export async function deleteAgreementSignatureAction(
  id: string,
  role: 'CLIENT' | 'PROVIDER'
): Promise<ApiResponse<Agreement>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  try {
    const existing = await db.agreement.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('NOT_FOUND', 'Agreement not found');
    }

    let updateData: any = {};
    if (role === 'CLIENT') {
      updateData = {
        clientSignature: null,
        clientSignedName: null,
        clientSignedAt: null,
      };
    } else {
      updateData = {
        providerSignature: null,
        providerSignedName: null,
        providerSignedAt: null,
      };
    }

    const clientSig = role === 'CLIENT' ? null : existing.clientSignature;
    const providerSig = role === 'PROVIDER' ? null : existing.providerSignature;

    if (!clientSig && !providerSig) {
      updateData.status = AgreementStatus.DRAFT;
    } else {
      updateData.status = AgreementStatus.SENT;
    }

    const updated = await db.agreement.update({
      where: { id },
      data: updateData,
    });

    await createAuditLog({
      userId: session.user.id,
      action: 'UPDATE',
      resource: `AgreementSignatureReset:${role}`,
      resourceId: id,
      newData: { role, resetAt: new Date().toISOString() },
    });

    return successResponse(updated);
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to delete agreement signature', err);
  }
}
