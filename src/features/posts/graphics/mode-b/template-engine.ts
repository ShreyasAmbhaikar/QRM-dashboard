import satori from 'satori';

export interface GraphicTemplateOptions {
  headline: string;
  subheadline?: string;
  brandColor?: string;
  badgeText?: string;
}

export async function renderTemplateSvg(options: GraphicTemplateOptions): Promise<string> {
  const { headline, subheadline = 'Limited Time Offer', brandColor = '#3b82f6', badgeText = 'SPECIAL' } = options;

  const templateElement: any = {
    type: 'div',
    props: {
      style: {
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        padding: '40px',
        fontFamily: 'sans-serif',
        border: `8px solid ${brandColor}`,
        borderRadius: '16px',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              backgroundColor: brandColor,
              color: '#ffffff',
              padding: '6px 16px',
              borderRadius: '9999px',
              fontSize: '16px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
            },
            children: badgeText,
          },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', gap: '12px' },
            children: [
              {
                type: 'h1',
                props: {
                  style: { fontSize: '48px', fontWeight: '900', margin: 0, lineHeight: 1.1 },
                  children: headline,
                },
              },
              {
                type: 'p',
                props: {
                  style: { fontSize: '20px', color: '#94a3b8', margin: 0 },
                  children: subheadline,
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              borderTop: '1px solid #334155',
              paddingTop: '20px',
              fontSize: '14px',
              color: '#64748b',
            },
            children: 'Quantum Reach Media Branded Engine',
          },
        },
      ],
    },
  };

  const svg = await satori(templateElement, {
    width: 1200,
    height: 900,
    fonts: [],
  });

  return svg;
}
