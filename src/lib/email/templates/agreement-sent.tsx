import React from 'react';
import { Html, Head, Body, Container, Text, Heading, Section, Hr, Button } from '@react-email/components';

export interface AgreementSentProps {
  clientName: string;
  agreementTitle: string;
  monthlyFee: number;
  agreementUrl: string;
}

export function AgreementSentEmail({
  clientName = 'Valued Client',
  agreementTitle = 'SEO Retainer Agreement',
  monthlyFee = 1500,
  agreementUrl = 'https://dashboard.quantumreachmedia.com/agreements/preview',
}: AgreementSentProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#090d16', color: '#f8fafc', padding: '20px' }}>
        <Container style={{ backgroundColor: '#0f172a', borderRadius: '12px', padding: '30px', border: '1px solid #1e293b' }}>
          <Heading style={{ color: '#38bdf8', fontSize: '20px', margin: '0 0 10px 0' }}>
            Quantum Reach Media — Service Retainer Proposal
          </Heading>
          <Text style={{ fontSize: '14px', color: '#94a3b8' }}>
            Dear {clientName},
          </Text>
          <Text style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.5' }}>
            We have prepared your custom digital marketing & position optimization contract: <strong>{agreementTitle}</strong>.
          </Text>
          <Hr style={{ borderColor: '#334155', margin: '20px 0' }} />

          <Section style={{ marginBottom: '20px' }}>
            <Text style={{ fontSize: '14px', color: '#f8fafc' }}>
              • <strong>Monthly Retainer Fee:</strong> ${monthlyFee.toLocaleString()}/mo
            </Text>
          </Section>

          <Button
            href={agreementUrl}
            style={{
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '14px',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Review & Sign Agreement
          </Button>

          <Text style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', marginTop: '30px' }}>
            Quantum Reach Media • Client Retainer Services
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default AgreementSentEmail;
