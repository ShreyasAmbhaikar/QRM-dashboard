export interface LocalBusinessSchemaInput {
  businessName: string;
  serviceName: string;
  city: string;
  phone?: string;
  url?: string;
}

export function generateLocalBusinessJsonLd(input: LocalBusinessSchemaInput): object {
  const { businessName, serviceName, city, phone = '(555) 000-0000', url = 'https://example.com' } = input;

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: serviceName,
    provider: {
      '@type': 'LocalBusiness',
      name: businessName,
      telephone: phone,
      url,
      address: {
        '@type': 'PostalAddress',
        addressLocality: city,
      },
    },
    areaServed: {
      '@type': 'City',
      name: city,
    },
  };
}
