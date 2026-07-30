export function buildEducationalPrompt(businessName: string, topic: string, keywords?: string[]) {
  return `Write an Educational / Informational GBP tip post for ${businessName}.
Topic: ${topic}.
Include keywords: ${keywords?.join(', ') || 'expert advice'}.
Tone: Helpful, authoritative, educational.`;
}
