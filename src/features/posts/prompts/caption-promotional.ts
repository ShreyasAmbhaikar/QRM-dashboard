export function buildPromotionalPrompt(businessName: string, topic: string, keywords?: string[]) {
  return `Write a Promotional GBP post for ${businessName}.
Highlight feature topic: ${topic}.
Include keywords: ${keywords?.join(', ') || 'top local service'}.
Tone: Energetic, professional, persuasive.`;
}
