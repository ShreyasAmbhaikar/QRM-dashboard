import { NextRequest, NextResponse } from 'next/server';
import { getPublicAgreementById } from '@/features/agreements/actions';
import { generateAgreementPdfBuffer } from '@/features/agreements/pdf/generate-pdf';
import { createAuditLog } from '@/lib/audit';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Retrieve agreement using public helper
    const res = await getPublicAgreementById(id);
    if (!res.success || !res.data) {
      return new NextResponse('Agreement not found', { status: 404 });
    }

    const agreement = res.data;

    // Build props for the PDF
    const pdfProps = {
      title: agreement.title,
      clientName: agreement.client.name,
      clientDomain: agreement.client.domain,
      startDate: agreement.startDate.toISOString(),
      endDate: agreement.endDate ? agreement.endDate.toISOString() : null,
      content: agreement.content,
      clientSignature: agreement.clientSignature,
      clientSignedName: agreement.clientSignedName,
      clientSignedAt: agreement.clientSignedAt ? agreement.clientSignedAt.toISOString() : null,
      providerSignature: agreement.providerSignature,
      providerSignedName: agreement.providerSignedName,
      providerSignedAt: agreement.providerSignedAt ? agreement.providerSignedAt.toISOString() : null,
      companyName: agreement.companyName,
      companyEmail: agreement.companyEmail,
      companyPhone: agreement.companyPhone,
      companyWebsite: agreement.companyWebsite,
    };

    // Generate the PDF Buffer
    const pdfBuffer = await generateAgreementPdfBuffer(pdfProps);

    // Build the filename
    const sanitizedTitle = agreement.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `Agreement_${sanitizedTitle}_${id.substring(0, 8)}.pdf`;

    // Record audit log for tracking download history
    const session = await auth();
    const fallbackUser = await db.user.findFirst();
    const activeUserId = session?.user?.id || agreement.createdById || fallbackUser?.id || '';
    if (activeUserId) {
      await createAuditLog({
        userId: activeUserId,
        action: 'EXPORT',
        resource: 'Agreement',
        resourceId: id,
        newData: { 
          filename, 
          downloadedAt: new Date().toISOString(),
          downloader: session?.user?.id ? 'PROVIDER' : 'CLIENT'
        },
      });
    }

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Error generating agreement PDF:', error);
    return new NextResponse('Failed to generate PDF', { status: 500 });
  }
}
