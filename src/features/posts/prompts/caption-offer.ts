export function buildOfferPrompt(businessName: string, offerDetails: string, keywords?: string[]) {
  return `Write a Special Discount / Offer GBP post for ${businessName}.
Offer Details: ${offerDetails}.
Include keywords: ${keywords?.join(', ') || 'limited time offer'}.
Tone: Urgent, exciting, action-oriented.`;
}
