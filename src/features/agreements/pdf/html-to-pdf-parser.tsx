import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  paragraph: {
    marginBottom: 3,
    fontSize: 8.0,
    lineHeight: 1.2,
    color: '#334155',
    fontFamily: 'Helvetica',
  },
  heading1: {
    fontSize: 11.0,
    color: '#581c87',
    fontFamily: 'Helvetica-Bold',
    marginTop: 6,
    marginBottom: 3,
  },
  heading2: {
    fontSize: 9.5,
    color: '#581c87',
    fontFamily: 'Helvetica-Bold',
    marginTop: 5,
    marginBottom: 2.5,
  },
  heading3: {
    fontSize: 9.0,
    color: '#7e22ce',
    fontFamily: 'Helvetica-Bold',
    marginTop: 4,
    marginBottom: 2,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 2,
    paddingLeft: 10,
  },
  listBullet: {
    width: 10,
    fontSize: 8.0,
    color: '#7c3aed',
  },
  listContent: {
    flex: 1,
    fontSize: 8.0,
    lineHeight: 1.2,
    color: '#334155',
  },
  boldText: {
    fontFamily: 'Helvetica-Bold',
  },
  italicText: {
    fontFamily: 'Helvetica-Oblique',
  },
  boldItalicText: {
    fontFamily: 'Helvetica-BoldOblique',
  },
  underlineText: {
    textDecoration: 'underline',
  },
});

interface StyleContext {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  color?: string;
  fontSize?: number;
}

export function parseHtmlToPdf(html: string): React.ReactNode[] {
  if (!html) return [];

  // Clean raw spacing and split the HTML into tags and text chunks
  const cleanedHtml = html.replace(/\r?\n|\r/g, ' ');
  const tokens = cleanedHtml.split(/(<\/?[a-zA-Z1-6]+(?:\s+[^>]*?)?>)/);

  const elements: React.ReactNode[] = [];
  const styleStack: StyleContext[] = [{ bold: false, italic: false, underline: false }];
  
  let currentBlockType: 'p' | 'h1' | 'h2' | 'h3' | 'li' | null = null;
  let listType: 'ul' | 'ol' | null = null;
  let listIndex = 0;
  let currentBlockChildren: React.ReactNode[] = [];

  const getActiveStyle = (): StyleContext => {
    return styleStack[styleStack.length - 1] || { bold: false, italic: false, underline: false };
  };

  const getReactPdfTextStyles = (context: StyleContext) => {
    const textStyle: any = {
      color: context.color || '#334155',
    };

    if (context.fontSize) {
      textStyle.fontSize = context.fontSize;
    }

    if (context.bold && context.italic) {
      textStyle.fontFamily = 'Helvetica-BoldOblique';
    } else if (context.bold) {
      textStyle.fontFamily = 'Helvetica-Bold';
    } else if (context.italic) {
      textStyle.fontFamily = 'Helvetica-Oblique';
    } else {
      textStyle.fontFamily = 'Helvetica';
    }

    if (context.underline) {
      textStyle.textDecoration = 'underline';
    }

    return textStyle;
  };

  const closeCurrentBlock = (key: string | number) => {
    if (currentBlockChildren.length === 0) return;

    if (currentBlockType === 'li') {
      elements.push(
        <View key={key} style={styles.listItem}>
          <Text style={styles.listBullet}>
            {listType === 'ol' ? `${listIndex}.` : '•'}
          </Text>
          <Text style={styles.listContent}>
            {currentBlockChildren}
          </Text>
        </View>
      );
    } else if (currentBlockType === 'h1') {
      elements.push(
        <Text key={key} style={styles.heading1}>
          {currentBlockChildren}
        </Text>
      );
    } else if (currentBlockType === 'h2') {
      elements.push(
        <Text key={key} style={styles.heading2}>
          {currentBlockChildren}
        </Text>
      );
    } else if (currentBlockType === 'h3') {
      elements.push(
        <Text key={key} style={styles.heading3}>
          {currentBlockChildren}
        </Text>
      );
    } else {
      // Default to paragraph style
      elements.push(
        <Text key={key} style={styles.paragraph}>
          {currentBlockChildren}
        </Text>
      );
    }

    currentBlockChildren = [];
  };

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token) continue;

    if (token.startsWith('<') && token.endsWith('>')) {
      // It is a tag
      const isClosing = token.startsWith('</');
      const tagContent = token.replace(/[<>]/g, '').trim();
      const splitContent = tagContent.split(/\s+/);
      const tagName = (splitContent[0] || '').toLowerCase();

      if (isClosing) {
        if (['p', 'h1', 'h2', 'h3', 'li'].includes(tagName)) {
          closeCurrentBlock(`block-${i}`);
          currentBlockType = null;
        } else if (['strong', 'b'].includes(tagName)) {
          const current = getActiveStyle();
          styleStack.push({ ...current, bold: false });
        } else if (['em', 'i'].includes(tagName)) {
          const current = getActiveStyle();
          styleStack.push({ ...current, italic: false });
        } else if (['u'].includes(tagName)) {
          const current = getActiveStyle();
          styleStack.push({ ...current, underline: false });
        } else if (tagName === 'span') {
          if (styleStack.length > 1) {
            styleStack.pop();
          }
        } else if (tagName === 'ul' || tagName === 'ol') {
          listType = null;
          listIndex = 0;
        }
      } else {
        // Opening tag
        if (tagName === 'p') {
          closeCurrentBlock(`block-${i}`);
          currentBlockType = 'p';
        } else if (tagName === 'h1') {
          closeCurrentBlock(`block-${i}`);
          currentBlockType = 'h1';
        } else if (tagName === 'h2') {
          closeCurrentBlock(`block-${i}`);
          currentBlockType = 'h2';
        } else if (tagName === 'h3') {
          closeCurrentBlock(`block-${i}`);
          currentBlockType = 'h3';
        } else if (tagName === 'ul') {
          listType = 'ul';
          listIndex = 0;
        } else if (tagName === 'ol') {
          listType = 'ol';
          listIndex = 0;
        } else if (tagName === 'li') {
          closeCurrentBlock(`block-${i}`);
          currentBlockType = 'li';
          listIndex++;
        } else if (['strong', 'b'].includes(tagName)) {
          const current = getActiveStyle();
          styleStack.push({ ...current, bold: true });
        } else if (['em', 'i'].includes(tagName)) {
          const current = getActiveStyle();
          styleStack.push({ ...current, italic: true });
        } else if (['u'].includes(tagName)) {
          const current = getActiveStyle();
          styleStack.push({ ...current, underline: true });
        } else if (tagName === 'span') {
          const current = getActiveStyle();
          const nextStyle = { ...current };

          // Extract color attribute from style
          const colorMatch = tagContent.match(/color:\s*(#[0-9a-fA-F]{3,6}|[a-zA-Z()0-9, ]+)/i);
          if (colorMatch && colorMatch[1]) {
            nextStyle.color = colorMatch[1];
          }

          // Extract font-size attribute from style
          const sizeMatch = tagContent.match(/font-size:\s*([0-9.]+)px/i);
          if (sizeMatch && sizeMatch[1]) {
            nextStyle.fontSize = parseFloat(sizeMatch[1]) * 0.75; // standard scaling factor from px to pt
          }

          styleStack.push(nextStyle);
        } else if (tagName === 'br') {
          currentBlockChildren.push(<Text key={`br-${i}`}>{'\n'}</Text>);
        }
      }
    } else {
      // It is plain text
      const styleContext = getActiveStyle();
      const textStyle = getReactPdfTextStyles(styleContext);
      
      // Decode HTML entities
      const text = token
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

      currentBlockChildren.push(
        <Text key={`text-${i}`} style={textStyle}>
          {text}
        </Text>
      );
    }
  }

  // Close any remaining block
  closeCurrentBlock('block-final');

  return elements;
}
