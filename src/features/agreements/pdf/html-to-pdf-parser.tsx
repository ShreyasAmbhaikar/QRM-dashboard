import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  paragraph: {
    fontSize: 8.0,
    lineHeight: 1.25,
    color: '#334155',
    fontFamily: 'Helvetica',
    marginBottom: 3,
  },
  heading1: {
    fontSize: 11.0,
    color: '#581c87',
    fontFamily: 'Helvetica-Bold',
    marginTop: 10,
    marginBottom: 4,
  },
  heading2: {
    fontSize: 9.5,
    color: '#581c87',
    fontFamily: 'Helvetica-Bold',
    marginTop: 8,
    marginBottom: 3,
  },
  heading3: {
    fontSize: 9.0,
    color: '#7e22ce',
    fontFamily: 'Helvetica-Bold',
    marginTop: 6,
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
    lineHeight: 1.25,
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

const getReactPdfTextStyles = (context: StyleContext) => {
  const textStyle: any = {};

  if (context.color) {
    textStyle.color = context.color;
  }

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

function parseStandardHtmlToPdf(
  html: string,
  defaultContext?: { fontSize?: number; color?: string }
): React.ReactNode[] {
  if (!html) return [];

  const cleanedHtml = html.replace(/\r?\n|\r/g, ' ');
  const tokens = cleanedHtml.split(/(<\/?[a-zA-Z1-6]+(?:\s+[^>]*?)?>)/);

  const elements: React.ReactNode[] = [];
  const styleStack: StyleContext[] = [{ 
    bold: false, 
    italic: false, 
    underline: false,
    fontSize: defaultContext?.fontSize,
    color: defaultContext?.color
  }];
  
  let currentBlockType: 'p' | 'h1' | 'h2' | 'h3' | 'li' | null = null;
  let listType: 'ul' | 'ol' | null = null;
  let listIndex = 0;
  let currentBlockChildren: React.ReactNode[] = [];

  const getActiveStyle = (): StyleContext => {
    return styleStack[styleStack.length - 1] || { 
      bold: false, 
      italic: false, 
      underline: false,
      fontSize: defaultContext?.fontSize,
      color: defaultContext?.color
    };
  };

  const closeCurrentBlock = (key: string | number) => {
    if (currentBlockChildren.length === 0) return;

    if (currentBlockType === 'li') {
      elements.push(
        <View key={key} style={styles.listItem}>
          <Text style={styles.listBullet}>
            {listType === 'ol' ? `${listIndex}.` : '•'}
          </Text>
          <Text style={defaultContext?.fontSize ? { ...styles.listContent, fontSize: defaultContext.fontSize } : styles.listContent}>
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
      const blockStyle = {
        fontSize: defaultContext?.fontSize || 8.0,
        lineHeight: 1.25,
        color: defaultContext?.color || '#334155',
        fontFamily: 'Helvetica',
        marginBottom: 3,
      };
      elements.push(
        <Text key={key} style={blockStyle}>
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

          const colorMatch = tagContent.match(/color:\s*(#[0-9a-fA-F]{3,6}|[a-zA-Z()0-9, ]+)/i);
          if (colorMatch && colorMatch[1]) {
            nextStyle.color = colorMatch[1];
          }

          const sizeMatch = tagContent.match(/font-size:\s*([0-9.]+)px/i);
          if (sizeMatch && sizeMatch[1]) {
            nextStyle.fontSize = parseFloat(sizeMatch[1]) * 0.75;
          }

          styleStack.push(nextStyle);
        } else if (tagName === 'br') {
          currentBlockChildren.push(<Text key={`br-${i}`}>{'\n'}</Text>);
        }
      }
    } else {
      const styleContext = getActiveStyle();
      const textStyle = getReactPdfTextStyles(styleContext);
      
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

  closeCurrentBlock('block-final');
  return elements;
}

function parseTableToPdf(tableHtml: string, key: string): React.ReactNode {
  const trMatches = tableHtml.match(/<tr[\s\S]*?<\/tr>/gi) || [];
  
  const tableBgColorMatch = tableHtml.match(/background-color:\s*(#[0-9a-fA-F]{3,6}|[a-zA-Z()0-9, ]+)/i);
  const tableBgColor = (tableBgColorMatch && tableBgColorMatch[1]) ? tableBgColorMatch[1] : undefined;

  const rows = trMatches.map((trHtml, rowIndex) => {
    const isHeaderRow = trHtml.includes('background-color: #faf5ff') || trHtml.toLowerCase().includes('<th');
    const cellMatches = trHtml.match(/<(th|td)[\s\S]*?<\/\1>/gi) || [];
    
    const cells = cellMatches.map((cellHtml, cellIndex) => {
      const isTh = cellHtml.toLowerCase().startsWith('<th');
      
      const cellBgColorMatch = cellHtml.match(/background-color:\s*(#[0-9a-fA-F]{3,6}|[a-zA-Z()0-9, ]+)/i);
      const cellBgColor = (cellBgColorMatch && cellBgColorMatch[1]) ? cellBgColorMatch[1] : (isHeaderRow ? '#faf5ff' : undefined) || tableBgColor;

      const paddingMatch = cellHtml.match(/padding:\s*([0-9.]+)px/i);
      const cellPadding = (paddingMatch && paddingMatch[1]) ? parseFloat(paddingMatch[1]) * 0.75 : (isTh ? 6 : 7.5);

      const sizeMatch = cellHtml.match(/font-size:\s*([0-9.]+)px/i);
      const cellFontSize = (sizeMatch && sizeMatch[1]) ? parseFloat(sizeMatch[1]) * 0.75 : (isTh ? 7.1 : 6.75);

      const colorMatch = cellHtml.match(/color:\s*(#[0-9a-fA-F]{3,6}|[a-zA-Z()0-9, ]+)/i);
      const cellColor = (colorMatch && colorMatch[1]) ? colorMatch[1] : (isTh ? '#581c87' : '#334155');

      const innerHtml = cellHtml.replace(/^<(th|td)[^>]*>/i, '').replace(/<\/(th|td)>$/i, '');
      const hasRightBorder = cellIndex < cellMatches.length - 1;
      
      const content = parseStandardHtmlToPdf(innerHtml, { fontSize: cellFontSize, color: cellColor });
      
      return (
        <View 
          key={`cell-${rowIndex}-${cellIndex}`} 
          style={{
            flex: 1,
            padding: cellPadding,
            backgroundColor: cellBgColor,
            borderRightWidth: hasRightBorder ? 1 : 0,
            borderRightColor: '#cbd5e1',
            flexDirection: 'column',
          }}
        >
          {content}
        </View>
      );
    });

    const isLastRow = rowIndex === trMatches.length - 1;
    
    return (
      <View 
        key={`row-${rowIndex}`} 
        style={{
          flexDirection: 'row',
          borderBottomWidth: isLastRow ? 0 : 1,
          borderBottomColor: '#cbd5e1',
        }}
      >
        {cells}
      </View>
    );
  });

  return (
    <View 
      key={key} 
      style={{
        width: '100%',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        marginTop: 8,
        marginBottom: 14,
        flexDirection: 'column',
        borderRadius: 4,
      }}
    >
      {rows}
    </View>
  );
}

export function parseHtmlToPdf(html: string): React.ReactNode[] {
  if (!html) return [];

  const parts = html.split(/(<table[\s\S]*?<\/table>)/i);
  const elements: React.ReactNode[] = [];

  parts.forEach((part, index) => {
    if (!part) return;

    if (part.toLowerCase().startsWith('<table')) {
      elements.push(parseTableToPdf(part, `table-${index}`));
    } else {
      elements.push(...parseStandardHtmlToPdf(part));
    }
  });

  return elements;
}
