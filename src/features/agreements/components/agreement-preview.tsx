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
    <div className="relative flex justify-between items-end border-b border-[#a78bfa] pb-4 mb-6 z-20">
      {/* Top-Right Decorative Slanted Triangle (Matches the PNG style) */}
      <div 
        className="absolute top-[-40px] right-[-40px] w-[140px] h-[140px] bg-[#581c87]" 
        style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }}
      />
      
      {/* Logo Area */}
      <div className="flex items-center gap-3">
        {/* Quantum Reach Media Stylized Q&R Logo */}
        <svg width="46" height="46" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-purple-700">
          <circle cx="100" cy="100" r="75" stroke="#581c87" strokeWidth="18" />
          <path d="M100 25 A75 75 0 0 1 175 100 L140 100 A40 40 0 0 0 100 60 Z" fill="#581c87" />
          <circle cx="100" cy="100" r="32" fill="#7c3aed" />
          <path d="M125 125 L175 175" stroke="#581c87" strokeWidth="22" strokeLinecap="round" />
        </svg>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#581c87] leading-none">Quantum Reach</h2>
          <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-semibold">Media</span>
        </div>
      </div>

      {/* Brand Contact details */}
      <div className="flex flex-col gap-1 text-[10px] text-[#475569] font-medium mr-28">
        <div className="flex items-center gap-1.5 justify-end">
          <span>{agreement.companyWebsite || 'quantumreachmedia.com'}</span>
          <div className="p-0.5 rounded bg-[#581c87] text-white">
            <Globe className="h-2.5 w-2.5" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 justify-end">
          <span>{agreement.companyPhone || '+91 77388 12028'}</span>
          <div className="p-0.5 rounded bg-[#581c87] text-white">
            <Phone className="h-2.5 w-2.5" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 justify-end">
          <span>{agreement.companyEmail || 'tushar7738812028@gmail.com'}</span>
          <div className="p-0.5 rounded bg-[#581c87] text-white">
            <Mail className="h-2.5 w-2.5" />
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
    <div className="space-y-8 select-none py-6 bg-[#09090b] rounded-2xl border border-border p-4 sm:p-8 flex flex-col items-center w-full overflow-x-auto">
      <div className="min-w-[800px] flex flex-col items-center gap-8">
        {pagesHtml.map((pageHtml, index) => {
        const pageNumber = index + 1;
        const totalPages = pagesHtml.length;
        const isLastPage = pageNumber === totalPages;

        return (
          <div
            key={index}
            className="relative w-[794px] h-[1123px] mx-auto bg-white text-slate-800 border border-slate-200 shadow-xl rounded-xl p-10 pb-20 flex flex-col justify-between overflow-hidden"
          >
            {/* Top Area (Header + Main Text) */}
            <div className="space-y-4">
              <BrandHeader />

              {/* Title Header */}
              {pageNumber === 1 && (
                <div className="text-center py-2">
                  <h1 className="text-2xl font-extrabold text-[#581c87] tracking-wider uppercase">
                    Service Agreement
                  </h1>
                </div>
              )}

              {/* Dynamic Rich Text Content for this page */}
              <div 
                className="prose dark:prose-invert max-w-none text-[11px] leading-relaxed text-[#334155]"
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
    </div>
  );
}
