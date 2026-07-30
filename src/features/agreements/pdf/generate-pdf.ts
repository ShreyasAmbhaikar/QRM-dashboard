import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { AgreementPdfDocument, AgreementPdfProps } from './agreement-template';

export async function generateAgreementPdfBuffer(props: AgreementPdfProps): Promise<Buffer> {
  const element = React.createElement(AgreementPdfDocument, props);
  const buffer = await renderToBuffer(element as any);
  return buffer;
}
