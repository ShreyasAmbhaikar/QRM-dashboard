'use client';

import React from 'react';
import { AgreementWithClient } from '../actions';
import { Globe, Phone, Mail, Trash } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface AgreementPreviewProps {
  agreement: AgreementWithClient;
  htmlContent: string;
  onSignClick?: (role: 'CLIENT' | 'PROVIDER') => void;
  onDeleteSignature?: (role: 'CLIENT' | 'PROVIDER') => void;
  showSignatureActions?: boolean;
}

export function AgreementPreview({
  agreement,
  htmlContent,
  onSignClick,
  onDeleteSignature,
  showSignatureActions = false,
}: AgreementPreviewProps) {
  const convertPlainTextToTable = (html: string) => {
    if (html.includes('Service Provider:') && !html.includes('Service Provider</th>')) {
      const targetRegex = /This Agreement is made on[\s\S]*?Address: ____________________/i;
      
      const tableHtml = `<table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; margin-top: 10px; margin-bottom: 16px;">
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
</table>`;

      return html.replace(targetRegex, `This Agreement is made on <strong>____________________</strong> between:${tableHtml}`);
    }
    return html;
  };

  const fixedContent = convertPlainTextToTable(htmlContent);
  const pagesHtml = fixedContent.split(/<hr\b[^>]*>/i);

  // Reusable Brand Header Component
  const BrandHeader = () => (
    <div className="relative flex justify-between items-center border-b border-[#a78bfa] pb-3 mb-4 z-20">
      
      {/* Logo Area */}
      <div className="flex items-center gap-4">
        <img src="/qrm-logo.png" alt="QRM Logo" className="h-12 object-contain shrink-0" />
        <div className="flex flex-col text-left">
          <span className="font-extrabold text-[15px] leading-none tracking-tight text-[#581c87] font-sans">
            Quantum Reach
          </span>
          <span className="font-bold text-[9px] leading-none tracking-[0.25em] text-[#7c3aed] uppercase mt-1 font-sans">
            Media
          </span>
        </div>
      </div>

      {/* Brand Contact details */}
      <div className="flex flex-col gap-0.5 text-[8.5px] text-[#475569] font-medium mr-24">
        <div className="flex items-center gap-1 justify-end">
          <span>{agreement.companyWebsite || 'quantumreachmedia.com'}</span>
          <div className="p-0.5 rounded bg-[#581c87] text-white">
            <Globe className="h-2 w-2" />
          </div>
        </div>
        <div className="flex items-center gap-1 justify-end">
          <span>{agreement.companyPhone || '+91 77388 12028'}</span>
          <div className="p-0.5 rounded bg-[#581c87] text-white">
            <Phone className="h-2 w-2" />
          </div>
        </div>
        <div className="flex items-center gap-1 justify-end">
          <span>{agreement.companyEmail || 'tushar7738812028@gmail.com'}</span>
          <div className="p-0.5 rounded bg-[#581c87] text-white">
            <Mail className="h-2 w-2" />
          </div>
        </div>
      </div>
    </div>
  );

  // Reusable Brand Footer Component
  const BrandFooter = ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => (
    <div className="absolute bottom-0 left-0 right-0 h-[60px] flex items-center justify-between px-10 border-t border-border bg-white z-20 overflow-hidden">
      {/* Decorative Slanted Bars at the bottom (Matches the purple stripes in the PNG) */}
      <svg className="absolute left-10 bottom-0 h-4 w-40 overflow-visible" viewBox="0 0 160 16">
        <polygon points="20 16, 40 0, 80 0, 60 16" fill="#7c3aed" opacity="0.8" />
        <polygon points="70 16, 90 0, 130 0, 110 16" fill="#581c87" />
      </svg>
      
      <span className="text-[9px] text-[#94a3b8] font-semibold tracking-wider">
        Quantum Reach Media • Confidential Service Agreement
      </span>
      <span className="text-[10px] font-bold text-[#581c87]">
        Page {pageNumber} of {totalPages}
      </span>
    </div>
  );

  return (
    <div className="space-y-8 select-none py-8 bg-[#020205] rounded-2xl border border-border/80 p-4 flex flex-col items-center w-full overflow-x-auto">
      <div className="flex flex-col items-center gap-8 w-fit">
        {pagesHtml.map((pageHtml, index) => {
          const pageNumber = index + 1;
          const totalPages = pagesHtml.length;
          const isLastPage = pageNumber === totalPages;

          return (
            <div 
              key={index} 
              className="relative w-[794px] h-[1123px] bg-white text-slate-800 border border-slate-200 shadow-2xl rounded-xl p-12 pb-20 flex flex-col justify-between overflow-hidden shrink-0"
            >
                {/* Top-Right Decorative Slanted Triangle */}
                <div 
                  className="absolute top-0 right-0 w-[120px] h-[120px] bg-[#581c87] z-10" 
                  style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }}
                />

                {/* Top Area (Header + Main Text) */}
                <div className="space-y-4">
                  <BrandHeader />

                  {/* Title Header */}
                  {pageNumber === 1 && (
                    <div className="text-center py-2">
                      <h1 className="text-xl font-extrabold text-[#581c87] tracking-wider uppercase">
                        Service Agreement
                      </h1>
                    </div>
                  )}

                  {/* Dynamic Rich Text Content for this page */}
                  <div 
                    className="agreement-body text-[9px] leading-normal text-[#334155]"
                    dangerouslySetInnerHTML={{ __html: pageHtml }}
                  />

                  {/* Render the signature blocks side-by-side if it is the final page */}
                  {isLastPage && (
                    <div className="mt-8 space-y-3">
                      <h3 className="text-xs font-bold text-[#581c87] border-b border-border pb-1 uppercase tracking-wider">
                        Acceptance of Terms
                      </h3>
                      
                      <table className="w-full border-collapse border border-[#cbd5e1] text-[9.5px] text-[#334155]">
                        <thead>
                          <tr className="bg-[#faf5ff] text-[#581c87] border-b border-[#cbd5e1]">
                            <th className="border-r border-[#cbd5e1] p-2 text-left font-bold uppercase tracking-wider w-1/2">Client Signature</th>
                            <th className="p-2 text-left font-bold uppercase tracking-wider w-1/2">Service Provider Signature</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-[#cbd5e1]">
                            <td className="border-r border-[#cbd5e1] p-2 font-semibold">
                              <div className="flex justify-between items-center">
                                <span>Name: {agreement.clientSignedName || agreement.client.name}</span>
                                {showSignatureActions && agreement.clientSignature && onDeleteSignature && (
                                  <button
                                    onClick={() => onDeleteSignature('CLIENT')}
                                    className="h-5 w-5 text-red-500 hover:text-red-700 pointer-events-auto flex items-center justify-center border border-transparent rounded hover:bg-red-50 transition-colors"
                                    title="Delete Client Signature"
                                  >
                                    <Trash className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="p-2 font-semibold">
                              <div className="flex justify-between items-center">
                                <span>Name: {agreement.providerSignedName || agreement.companyName || 'Quantum Reach Media'}</span>
                                {showSignatureActions && agreement.providerSignature && onDeleteSignature && (
                                  <button
                                    onClick={() => onDeleteSignature('PROVIDER')}
                                    className="h-5 w-5 text-red-500 hover:text-red-700 pointer-events-auto flex items-center justify-center border border-transparent rounded hover:bg-red-50 transition-colors"
                                    title="Delete Provider Signature"
                                  >
                                    <Trash className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                          <tr className="border-b border-[#cbd5e1] h-[60px]">
                            <td 
                              className={`border-r border-[#cbd5e1] p-2 text-center ${
                                showSignatureActions && !agreement.clientSignature ? 'cursor-pointer hover:bg-purple-100/30 transition-all' : ''
                              }`}
                              onClick={() => showSignatureActions && !agreement.clientSignature && onSignClick?.('CLIENT')}
                            >
                              {agreement.clientSignature ? (
                                <img
                                  src={agreement.clientSignature}
                                  alt="Client Signature"
                                  className="max-h-[45px] mx-auto object-contain"
                                />
                              ) : (
                                <span className="text-purple-400 italic text-[9px]">
                                  {showSignatureActions ? 'Click here to sign' : 'Awaiting Signature'}
                                </span>
                              )}
                            </td>
                            <td 
                              className={`p-2 text-center ${
                                showSignatureActions && !agreement.providerSignature ? 'cursor-pointer hover:bg-purple-100/30 transition-all' : ''
                              }`}
                              onClick={() => showSignatureActions && !agreement.providerSignature && onSignClick?.('PROVIDER')}
                            >
                              {agreement.providerSignature ? (
                                <img
                                  src={agreement.providerSignature}
                                  alt="Service Provider Signature"
                                  className="max-h-[45px] mx-auto object-contain"
                                />
                              ) : (
                                <span className="text-purple-400 italic text-[9px]">
                                  {showSignatureActions ? 'Click here to sign' : 'Awaiting Signature'}
                                </span>
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td className="border-r border-[#cbd5e1] p-2 font-semibold">
                              Date: {agreement.clientSignedAt ? formatDate(agreement.clientSignedAt) : '__________'}
                            </td>
                            <td className="p-2 font-semibold">
                              Date: {agreement.providerSignedAt ? formatDate(agreement.providerSignedAt) : '__________'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Bottom Page Footer */}
                <BrandFooter pageNumber={pageNumber} totalPages={totalPages} />
            </div>
          );
        })}
      </div>

      <style jsx global>{`
        .agreement-body h1 {
          font-size: 14.66px !important;
          font-weight: bold;
          margin-top: 13.33px !important;
          margin-bottom: 4px !important;
          color: #581c87 !important;
          text-transform: uppercase;
        }
        .agreement-body h2 {
          font-size: 12.66px !important;
          font-weight: bold;
          margin-top: 10.66px !important;
          margin-bottom: 3px !important;
          color: #581c87 !important;
        }
        .agreement-body h3 {
          font-size: 12.00px !important;
          font-weight: bold;
          margin-top: 5px !important;
          margin-bottom: 2px !important;
          color: #7e22ce !important;
        }
        .agreement-body p {
          margin-bottom: 4px !important;
          color: #334155 !important;
          font-size: 10.66px !important;
          line-height: 1.25 !important;
          font-family: Arial, Helvetica, sans-serif !important;
        }
        .agreement-body ul {
          list-style-type: disc !important;
          padding-left: 16px !important;
          margin-bottom: 4px !important;
        }
        .agreement-body ol {
          list-style-type: decimal !important;
          padding-left: 16px !important;
          margin-bottom: 4px !important;
        }
        .agreement-body li {
          margin-bottom: 2px !important;
          color: #334155 !important;
          font-size: 10.66px !important;
          line-height: 1.25 !important;
        }
        .agreement-body table {
          width: 100%;
          border-collapse: collapse !important;
          border: 1px solid #cbd5e1 !important;
          margin-bottom: 10px !important;
          table-layout: fixed !important;
        }
        .agreement-body td:first-child:nth-last-child(2),
        .agreement-body td:first-child:nth-last-child(2) ~ td,
        .agreement-body th:first-child:nth-last-child(2),
        .agreement-body th:first-child:nth-last-child(2) ~ th {
          width: 50% !important;
        }
        .agreement-body td {
          padding: 6px !important;
          border: 1px solid #cbd5e1 !important;
          vertical-align: top;
          color: #334155 !important;
        }
        .agreement-body th {
          padding: 6px !important;
          border: 1px solid #cbd5e1 !important;
          border-bottom: 1px solid #cbd5e1 !important;
          background-color: #faf5ff;
          font-weight: bold;
          text-align: left;
          color: #581c87 !important;
        }
      `}</style>
    </div>
  );
}
