import React from 'react';
import { Html, Head, Body, Container, Text, Heading, Hr } from '@react-email/components';

export interface NotificationAlertProps {
  title: string;
  message: string;
}

export function NotificationAlertEmail({
  title = 'System Alert',
  message = 'An important system event has occurred.',
}: NotificationAlertProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#090d16', color: '#f8fafc', padding: '20px' }}>
        <Container style={{ backgroundColor: '#0f172a', borderRadius: '12px', padding: '30px', border: '1px solid #1e293b' }}>
          <Heading style={{ color: '#f43f5e', fontSize: '18px', margin: '0 0 10px 0' }}>
            {title}
          </Heading>
          <Text style={{ fontSize: '14px', color: '#cbd5e1' }}>
            {message}
          </Text>
          <Hr style={{ borderColor: '#334155', margin: '20px 0' }} />
          <Text style={{ fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
            Quantum Reach Media Administrative Telemetry
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default NotificationAlertEmail;
