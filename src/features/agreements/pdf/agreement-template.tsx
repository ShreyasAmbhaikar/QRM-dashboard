import React from 'react';
import { Document, Page, Text, View, StyleSheet, Svg, Polygon, Path, Circle, Image } from '@react-pdf/renderer';
import { parseHtmlToPdf } from './html-to-pdf-parser';

const styles = StyleSheet.create({
  page: {
    paddingTop: 95,
    paddingBottom: 55,
    paddingLeft: 35,
    paddingRight: 35,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  headerContainer: {
    position: 'absolute',
    top: 20,
    left: 35,
    right: 35,
    borderBottomWidth: 1,
    borderBottomColor: '#a78bfa',
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    height: 36,
  },
  logoTextContainer: {
    marginLeft: 10,
  },
  logoTextTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#581c87',
  },
  logoTextSub: {
    fontSize: 8,
    letterSpacing: 2,
    color: '#7c3aed',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
  },
  headerContact: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginRight: 80, // clear the top-right triangle
  },
  contactItem: {
    fontSize: 8,
    color: '#475569',
    fontFamily: 'Helvetica',
    marginBottom: 2,
  },
  body: {
    flex: 1,
  },
  titleContainer: {
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#581c87',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  signatureSection: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    flexDirection: 'column',
  },
  signatureRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
  },
  signatureRowLast: {
    flexDirection: 'row',
  },
  signatureHeaderCell: {
    flex: 1,
    padding: 6,
    backgroundColor: '#faf5ff',
  },
  signatureHeaderCellLeft: {
    borderRightWidth: 1,
    borderRightColor: '#cbd5e1',
  },
  signatureTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#581c87',
    textTransform: 'uppercase',
  },
  signatureCell: {
    flex: 1,
    padding: 6,
  },
  signatureCellLeft: {
    borderRightWidth: 1,
    borderRightColor: '#cbd5e1',
  },
  signatureText: {
    fontSize: 8,
    color: '#334155',
    fontFamily: 'Helvetica-Bold',
  },
  signatureImageContainer: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signatureImage: {
    maxHeight: 40,
    maxWidth: 180,
  },
  signaturePlaceholder: {
    fontSize: 8,
    fontFamily: 'Helvetica-Oblique',
    color: '#94a3b8',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 35,
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 35,
    paddingRight: 35,
  },
  footerText: {
    fontSize: 7.5,
    color: '#94a3b8',
    fontFamily: 'Helvetica-Bold',
  },
  pageNumber: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#581c87',
  },
});

const GLOBE_PATH = "M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z M12 2v20 M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0";
const PHONE_PATH = "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z";
const MAIL_PATH = "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6";

const PdfContactItem = ({ text, path }: { text: string; path: string }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 2.5 }}>
    <Text style={{ fontSize: 8.5, color: '#475569', marginRight: 5, fontFamily: 'Helvetica' }}>{text}</Text>
    <Svg width="12" height="12" viewBox="0 0 24 24" style={{ backgroundColor: '#581c87', borderRadius: 2.5, padding: 1.8 }}>
      <Path d={path} fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  </View>
);

export interface AgreementPdfProps {
  title: string;
  clientName: string;
  clientDomain: string;
  startDate: string;
  endDate?: string | null;
  content: string;
  clientSignature?: string | null;
  clientSignedName?: string | null;
  clientSignedAt?: string | Date | null;
  providerSignature?: string | null;
  providerSignedName?: string | null;
  providerSignedAt?: string | Date | null;
  companyName?: string | null;
  companyEmail?: string | null;
  companyPhone?: string | null;
  companyWebsite?: string | null;
}

export function AgreementPdfDocument({
  title,
  clientName,
  clientDomain,
  startDate,
  endDate,
  content,
  clientSignature,
  clientSignedName,
  clientSignedAt,
  providerSignature,
  providerSignedName,
  providerSignedAt,
  companyName = 'Quantum Reach Media',
  companyEmail = 'tushar7738812028@gmail.com',
  companyPhone = '+91 77388 12028',
  companyWebsite = 'quantumreachmedia.com',
}: AgreementPdfProps) {
  // Split HTML content by <hr> tags to distribute content into different pages
  const pagesHtml = content.split(/<hr\b[^>]*>/i);

  // Format date helper for react-pdf
  const formatDateString = (dateInput: any) => {
    if (!dateInput) return '__________';
    try {
      const d = new Date(dateInput);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return '__________';
    }
  };

  return (
    <Document>
      {pagesHtml.map((pageHtml, index) => {
        const pageNumber = index + 1;
        const totalPages = pagesHtml.length;
        const isLastPage = pageNumber === totalPages;

        return (
          <Page key={index} size="A4" style={styles.page}>
            {/* Top-Right Decorative Triangled Corner (fixed header asset) */}
            <Svg style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120 }}>
              <Polygon points="120,0 120,120 0,0" fill="#581c87" />
            </Svg>

            {/* Header (repeats on every page) */}
            <View style={styles.headerContainer} fixed>
              {/* Logo Area */}
              <View style={styles.logoSection}>
                <Image src="public/qrm-logo.png" style={styles.logoImage} />
                <View style={styles.logoTextContainer}>
                  <Text style={styles.logoTextTitle}>Quantum Reach</Text>
                  <Text style={styles.logoTextSub}>Media</Text>
                </View>
              </View>

              {/* Company Info */}
              <View style={styles.headerContact}>
                <PdfContactItem text={companyWebsite || 'quantumreachmedia.com'} path={GLOBE_PATH} />
                <PdfContactItem text={companyPhone || '+91 77388 12028'} path={PHONE_PATH} />
                <PdfContactItem text={companyEmail || 'tushar7738812028@gmail.com'} path={MAIL_PATH} />
              </View>
            </View>

            {/* Content Area */}
            <View style={styles.body}>
              {pageNumber === 1 && (
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>Service Agreement</Text>
                </View>
              )}

              {/* Render dynamic HTML parsed elements */}
              {parseHtmlToPdf(pageHtml)}

              {/* Signatures at the bottom of the final page */}
              {isLastPage && (
                <View style={styles.signatureSection}>
                  {/* Header Row */}
                  <View style={styles.signatureRow}>
                    <View style={[styles.signatureHeaderCell, styles.signatureHeaderCellLeft]}>
                      <Text style={styles.signatureTitle}>Client Signature</Text>
                    </View>
                    <View style={styles.signatureHeaderCell}>
                      <Text style={styles.signatureTitle}>Service Provider Signature</Text>
                    </View>
                  </View>

                  {/* Name Row */}
                  <View style={styles.signatureRow}>
                    <View style={[styles.signatureCell, styles.signatureCellLeft]}>
                      <Text style={styles.signatureText}>Name: {clientSignedName || clientName}</Text>
                    </View>
                    <View style={styles.signatureCell}>
                      <Text style={styles.signatureText}>Name: {providerSignedName || companyName || 'Quantum Reach Media'}</Text>
                    </View>
                  </View>

                  {/* Signature Image Row */}
                  <View style={styles.signatureRow}>
                    <View style={[styles.signatureCell, styles.signatureCellLeft, styles.signatureImageContainer]}>
                      {clientSignature ? (
                        <Image src={clientSignature} style={styles.signatureImage} />
                      ) : (
                        <Text style={styles.signaturePlaceholder}>Awaiting Signature</Text>
                      )}
                    </View>
                    <View style={[styles.signatureCell, styles.signatureImageContainer]}>
                      {providerSignature ? (
                        <Image src={providerSignature} style={styles.signatureImage} />
                      ) : (
                        <Text style={styles.signaturePlaceholder}>Awaiting Signature</Text>
                      )}
                    </View>
                  </View>

                  {/* Date Row */}
                  <View style={styles.signatureRowLast}>
                    <View style={[styles.signatureCell, styles.signatureCellLeft]}>
                      <Text style={styles.signatureText}>Date: {formatDateString(clientSignedAt)}</Text>
                    </View>
                    <View style={styles.signatureCell}>
                      <Text style={styles.signatureText}>Date: {formatDateString(providerSignedAt)}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Bottom Footer (repeats on every page) */}
            <View style={styles.footerContainer} fixed>
              {/* Decorative Diagonal Stripes */}
              <Svg style={{ position: 'absolute', left: 35, bottom: 0, width: 160, height: 14 }}>
                <Polygon points="20,14 40,0 80,0 60,14" fill="#7c3aed" opacity={0.8} />
                <Polygon points="70,14 90,0 130,0 110,14" fill="#581c87" />
              </Svg>

              <Text style={styles.footerText}>
                Quantum Reach Media • Confidential Service Agreement
              </Text>
              
              {/* Page Number Evaluator (Evaluates dynamically in PDF) */}
              <Text 
                style={styles.pageNumber} 
                render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} 
              />
            </View>
          </Page>
        );
      })}
    </Document>
  );
}
