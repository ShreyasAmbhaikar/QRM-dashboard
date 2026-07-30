import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1e293b',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    borderBottomStyle: 'solid',
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    marginVertical: 10,
  },
  heading: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#0f172a',
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.4,
    color: '#334155',
    marginBottom: 8,
  },
  deliverablesList: {
    marginTop: 6,
    paddingLeft: 10,
  },
  deliverableItem: {
    fontSize: 9,
    marginBottom: 4,
    color: '#1e293b',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    borderTopStyle: 'solid',
    paddingTop: 10,
  },
});

export interface AgreementPdfProps {
  title: string;
  clientName: string;
  clientDomain: string;
  monthlyFee: number;
  startDate: string;
  deliverables: string[];
}

export function AgreementPdfDocument({
  title,
  clientName,
  clientDomain,
  monthlyFee,
  startDate,
  deliverables,
}: AgreementPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Quantum Reach Media</Text>
          <Text style={styles.subtitle}>Professional SEO & Digital Marketing Services Agreement</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>{title}</Text>
          <Text style={styles.paragraph}>
            This Agreement is entered into on {startDate} by and between Quantum Reach Media ("Agency") and {clientName} ("Client", domain: {clientDomain}).
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Financial Terms</Text>
          <Text style={styles.paragraph}>
            Client agrees to pay a recurring monthly fee of ${monthlyFee.toLocaleString()} USD due on the first day of each billing cycle.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Included Monthly Deliverables</Text>
          <View style={styles.deliverablesList}>
            {deliverables.map((item, index) => (
              <Text key={index} style={styles.deliverableItem}>
                • {item}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Quantum Reach Media • Confidential Service Agreement • Page 1 of 1</Text>
        </View>
      </Page>
    </Document>
  );
}
