import React from 'react';
import { Html, Head, Body, Container, Text, Heading, Section, Hr } from '@react-email/components';

export interface DailyDigestProps {
  userName: string;
  tasksDueTodayCount: number;
  tasksOverdueCount: number;
}

export function DailyDigestEmail({
  userName = 'SEO Team Member',
  tasksDueTodayCount = 3,
  tasksOverdueCount = 0,
}: DailyDigestProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#090d16', color: '#f8fafc', padding: '20px' }}>
        <Container style={{ backgroundColor: '#0f172a', borderRadius: '12px', padding: '30px', border: '1px solid #1e293b' }}>
          <Heading style={{ color: '#38bdf8', fontSize: '20px', margin: '0 0 10px 0' }}>
            Quantum Reach Media — Morning Digest
          </Heading>
          <Text style={{ fontSize: '14px', color: '#94a3b8' }}>
            Good morning, {userName}! Here is your daily task execution summary.
          </Text>
          <Hr style={{ borderColor: '#334155', margin: '20px 0' }} />

          <Section style={{ marginBottom: '20px' }}>
            <Text style={{ fontSize: '14px', color: '#f8fafc' }}>
              • <strong>Tasks Due Today:</strong> {tasksDueTodayCount}
            </Text>
            <Text style={{ fontSize: '14px', color: tasksOverdueCount > 0 ? '#ef4444' : '#10b981' }}>
              • <strong>Overdue Tasks:</strong> {tasksOverdueCount}
            </Text>
          </Section>

          <Text style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', marginTop: '30px' }}>
            Quantum Reach Media Automation Engine • Powered by BullMQ & Resend
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default DailyDigestEmail;
