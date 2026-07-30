'use server';

import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { withPermission } from '@/lib/auth/permissions';
import { createAuditLog } from '@/lib/audit';
import { llmClient } from '@/lib/api/llm';
import { successResponse, errorResponse, ApiResponse } from '@/lib/api/response';
import { generateServicePageSchema, GenerateServicePageInput } from './schemas';
import { generateLocalBusinessJsonLd } from './json-ld-generator';
import { ServicePage } from '@prisma/client';

export async function generateServicePageContent(input: GenerateServicePageInput): Promise<ApiResponse<ServicePage>> {
  const session = await auth();
  if (!session?.user?.id) return errorResponse('UNAUTHORIZED', 'Auth required');

  const hasPermission = await withPermission('servicePages', 'full')(session.user.id);
  if (!hasPermission) return errorResponse('FORBIDDEN', 'Permission denied');

  const parseResult = generateServicePageSchema.safeParse(input);
  if (!parseResult.success) return errorResponse('VALIDATION_ERROR', 'Invalid page input', parseResult.error.format());

  const { clientId, serviceName, targetCity, primaryKeyword } = parseResult.data;

  try {
    const client = await db.client.findUnique({ where: { id: clientId } });
    if (!client) return errorResponse('NOT_FOUND', 'Client not found');

    const prompt = `Write a high-converting 1,200+ word localized SEO service page for "${client.name}" offering "${serviceName}" in "${targetCity}". 
Primary Keyword: ${primaryKeyword}. 
Structure with H1 title, H2 subheadings, benefits, process steps, FAQs, and strong local CTA. Format as clean HTML.`;

    const result = await llmClient.generate({
      prompt,
      systemPrompt: 'You are a senior SEO copywriter writing location-specific service landing pages.',
    });

    const jsonLdObject = generateLocalBusinessJsonLd({
      businessName: client.name,
      serviceName,
      city: targetCity,
      url: `https://${client.domain}`,
    });

    const page = await db.servicePage.create({
      data: {
        clientId,
        serviceName,
        targetCity,
        primaryKeyword,
        htmlContent: result.content,
        jsonLdSchema: JSON.stringify(jsonLdObject),
      },
    });

    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE',
      resource: 'ServicePage',
      resourceId: page.id,
      newData: { serviceName, targetCity },
    });

    return successResponse(page);
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to generate service page', err);
  }
}
