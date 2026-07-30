import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#ffffff' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginBottom: 10 },
  subtitle: { fontSize: 12, color: '#64748b', marginBottom: 20 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 4 },
  text: { fontSize: 10, color: '#334155', lineHeight: 1.5 },
  scoreBox: { padding: 15, backgroundColor: '#f8fafc', borderRadius: 8, textAlign: 'center', marginBottom: 15 },
  scoreNumber: { fontSize: 32, fontWeight: 'bold', color: '#2563eb' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, textAlign: 'center', color: '#94a3b8' },
});

export function AuditReportPdfDocument({ clientName, domain, healthScore, pagesCrawled, issues }: any) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>Technical SEO Audit Report</Text>
        </View>
        <Text style={styles.subtitle}>Prepared for {clientName} ({domain}) — {new Date().toLocaleDateString()}</Text>

        <View style={styles.scoreBox}>
          <Text style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase' }}>Overall Health Score</Text>
          <Text style={styles.scoreNumber}>{healthScore} / 100</Text>
          <Text style={{ fontSize: 9, color: '#475569' }}>Crawled {pagesCrawled} pages</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary & Findings</Text>
          {issues.map((iss: any, idx: number) => (
            <View key={idx} style={{ marginBottom: 10 }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#0f172a' }}>
                [{iss.severity}] {iss.title}
              </Text>
              <Text style={styles.text}>{iss.description}</Text>
              <Text style={{ fontSize: 9, color: '#2563eb', marginTop: 2 }}>Recommendation: {iss.recommendation}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>Powered by Quantum Reach Media SEO Engine</Text>
      </Page>
    </Document>
  );
}
