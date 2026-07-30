import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { AuditReportPdfDocument } from './audit-report-template';
import { uploadFile } from '@/lib/storage';

export async function generateAndUploadAuditPdf(data: {
  clientName: string;
  domain: string;
  healthScore: number;
  pagesCrawled: number;
  issues: any[];
}): Promise<string> {
  const element = React.createElement(AuditReportPdfDocument, data);
  const pdfBuffer = await renderToBuffer(element);

  const fileName = `audit-${Date.now()}.pdf`;
  const uploadResult = await uploadFile(
    {
      fileName,
      fileType: 'application/pdf',
      fileSize: pdfBuffer.length,
    },
    'audit-reports'
  );

  return uploadResult.uploadUrl;
}
