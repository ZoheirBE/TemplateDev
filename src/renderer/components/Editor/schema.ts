import * as monaco from 'monaco-editor';
import { ErrorService } from '../../services';

interface SchemaDocumentation {
  path: string;
  description?: string;
  attributes?: Record<string, {
    required: boolean;
    description?: string;
  }>;
}

interface SchemaDocumentationElement {
  element: string;
  description?: string;
  attributes?: Array<{
    name: string;
    description?: string;
    type?: string;
    required?: boolean;
  }>;
  children?: Array<{
    name: string;
    minOccurs?: number;
    maxOccurs?: number;
  }>;
}

export class SchemaService {
  private static instance: SchemaService;
  private documentationCache: Map<string, string> = new Map();
  private schema: SchemaDocumentation[] = [];
  private static readonly XML_TAG_PATTERN = /<([a-zA-Z][a-zA-Z0-9]*)?$/;
  private static readonly XML_ATTR_PATTERN = /<([a-zA-Z][a-zA-Z0-9]*)[^>]*\s([a-zA-Z][a-zA-Z0-9]*)?$/;

  private constructor() {
    this.registerCompletionProviders();
  }

  public static getInstance(): SchemaService {
    if (!SchemaService.instance) {
      SchemaService.instance = new SchemaService();
    }
    return SchemaService.instance;
  }

  private registerCompletionProviders(): void {
    try {
      this.registerElementCompletionProvider();
      this.registerAttributeCompletionProvider();
      this.registerHoverProvider();
    } catch (error) {
      ErrorService.getInstance().logError(
        error instanceof Error ? error : String(error),
        'PROVIDER_REGISTRATION_FAILED'
      );
    }
  }

  private registerElementCompletionProvider(): void {
    monaco.languages.registerCompletionItemProvider('xml', {
      triggerCharacters: ['<'],
      provideCompletionItems: (model, position) => {
        try {
          const textUntilPosition = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column
          });

          const elementMatch = textUntilPosition.match(SchemaService.XML_TAG_PATTERN);
          if (elementMatch) {
            const word = model.getWordUntilPosition(position);
            const range = {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endColumn: word.endColumn
            };

            const suggestions = this.getElementCompletions(elementMatch[1] || '');
            suggestions.forEach(suggestion => {
              suggestion.range = range;
            });

            return { suggestions };
          }

          return { suggestions: [] };
        } catch (error) {
          ErrorService.getInstance().logError(
            error instanceof Error ? error : String(error),
            'ELEMENT_COMPLETION_PROVIDER_FAILED'
          );
          return { suggestions: [] };
        }
      }
    });
  }

  private registerAttributeCompletionProvider(): void {
    monaco.languages.registerCompletionItemProvider('xml', {
      triggerCharacters: [' ', '='],
      provideCompletionItems: (model, position) => {
        try {
          const textUntilPosition = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column
          });

          const attributeMatch = textUntilPosition.match(SchemaService.XML_ATTR_PATTERN);
          if (attributeMatch) {
            const word = model.getWordUntilPosition(position);
            const range = {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endColumn: word.endColumn
            };

            const suggestions = this.getAttributeCompletions(attributeMatch[1], attributeMatch[2] || '');
            suggestions.forEach(suggestion => {
              suggestion.range = range;
            });

            return { suggestions };
          }

          return { suggestions: [] };
        } catch (error) {
          ErrorService.getInstance().logError(
            error instanceof Error ? error : String(error),
            'ATTRIBUTE_COMPLETION_PROVIDER_FAILED'
          );
          return { suggestions: [] };
        }
      }
    });
  }

  private registerHoverProvider(): void {
    monaco.languages.registerHoverProvider('xml', {
      provideHover: (model, position) => {
        const word = model.getWordAtPosition(position);
        if (!word) return null;

        // Check for element documentation
        const elementDoc = this.getElementDocumentation(word.word) as SchemaDocumentation | SchemaDocumentationElement;
        if (elementDoc) {
          const displayName = 'element' in elementDoc ? elementDoc.element : elementDoc.path;
          const docForFormatting: SchemaDocumentation = 'element' in elementDoc 
            ? {
                path: elementDoc.element,
                description: elementDoc.description
              }
            : elementDoc;

          return {
            contents: [
              { value: `**${displayName}**` },
              { value: elementDoc.description || '' },
              { value: this.formatElementDocumentation(docForFormatting) }
            ]
          };
        }

        // Check for attribute documentation
        const line = model.getLineContent(position.lineNumber);
        const elementMatch = line.match(/<([a-zA-Z][a-zA-Z0-9]*)/);
        if (elementMatch) {
          const elementName = elementMatch[1];
          const elementDoc = this.getElementDocumentation(elementName);
          const attrDoc = elementDoc?.attributes?.find(attr => attr.name === word.word);
          
          if (attrDoc) {
            return {
              contents: [
                { value: `**${attrDoc.name}**${attrDoc.required ? ' _(required)_' : ''}` },
                { value: attrDoc.type ? `Type: \`${attrDoc.type}\`` : '' },
                { value: attrDoc.description || '' }
              ]
            };
          }
        }

        return null;
      }
    });
  }

  private getElementCompletions(prefix: string): monaco.languages.CompletionItem[] {
    try {
      const suggestions: monaco.languages.CompletionItem[] = [];

      // Add schema elements to suggestions
      this.schema.forEach(doc => {
        if (!prefix || doc.path.toLowerCase().startsWith(prefix.toLowerCase())) {
          suggestions.push({
            label: doc.path,
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: this.generateElementSnippet(doc),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: this.formatElementDetail(doc),
            documentation: {
              value: this.formatElementDocumentation(doc),
              isTrusted: true,
              supportThemeIcons: true
            },
            sortText: '0' + doc.path.toLowerCase(),
            filterText: doc.path.toLowerCase(),
            commitCharacters: ['>'],
            command: { id: 'editor.action.triggerSuggest', title: 'Trigger Suggest' },
            range: {
              startLineNumber: 0,
              endLineNumber: 0,
              startColumn: 0,
              endColumn: 0
            }
          });
        }
      });

      return suggestions;
    } catch (error) {
      ErrorService.getInstance().logError(
        error instanceof Error ? error : String(error),
        'ELEMENT_COMPLETION_FAILED'
      );
      return [];
    }
  }

  private getAttributeCompletions(
    element: string,
    prefix: string
  ): monaco.languages.CompletionItem[] {
    try {
      const suggestions: monaco.languages.CompletionItem[] = [];

      // Add schema attributes to suggestions
      const elementDoc = this.schema.find(doc => doc.path === element);
      if (elementDoc?.attributes) {
        const attributes = elementDoc.attributes;
        Object.keys(attributes).forEach(attr => {
          if (!prefix || attr.toLowerCase().startsWith(prefix.toLowerCase())) {
            suggestions.push({
              label: {
                label: attr,
                detail: '',
                description: attributes[attr].required ? '(required)' : undefined
              },
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: `${attr}="\${1}"`,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: {
                value: this.formatAttributeDocumentation(attributes[attr]),
                isTrusted: true
              },
              sortText: attributes[attr].required ? '0' + attr : '1' + attr,
              filterText: attr.toLowerCase(),
              command: { id: 'editor.action.triggerSuggest', title: 'Trigger Suggest' },
              range: {
                startLineNumber: 0,
                endLineNumber: 0,
                startColumn: 0,
                endColumn: 0
              }
            });
          }
        });
      }

      return suggestions;
    } catch (error) {
      ErrorService.getInstance().logError(
        error instanceof Error ? error : String(error),
        'ATTRIBUTE_COMPLETION_FAILED'
      );
      return [];
    }
  }

  private generateElementSnippet(doc: SchemaDocumentation): string {
    const requiredAttrs = doc.attributes ? Object.entries(doc.attributes)
      .filter(([, attr]) => attr.required)
      .map(([name]) => name) : [];

    if (requiredAttrs.length === 0) {
      return `${doc.path}>\${0}</\${1:${doc.path}}>`;
    }

    const attrs = requiredAttrs
      .map((attr, index) => `${attr}="\${${index + 1}}"`)
      .join(' ');

    return `${doc.path} ${attrs}>\${${requiredAttrs.length + 1}}</\${${requiredAttrs.length + 2}:${doc.path}}>`;
  }

  private formatAttributeDocumentation(attr: { required: boolean; description?: string }): string {
    const parts: string[] = [];
    
    if (attr.description) {
      parts.push(attr.description);
    }
    
    if (attr.required) {
      parts.push('\n\n**Required attribute**');
    }
    
    return parts.join('');
  }

  private getElementDocumentation(element: string): SchemaDocumentationElement | null {
    try {
      const doc = this.schema.find(doc => doc.path === element);
      if (!doc) return null;
      
      return {
        element: doc.path,
        description: doc.description,
        attributes: doc.attributes ? Object.entries(doc.attributes).map(([name, attr]) => ({
          name,
          description: attr.description,
          required: attr.required
        })) : undefined
      };
    } catch (error) {
      ErrorService.getInstance().logError(
        error instanceof Error ? error : String(error),
        'ELEMENT_DOCUMENTATION_FAILED'
      );
      return null;
    }
  }

  private formatAttributesMarkdown(attributes: Record<string, any>): string {
    if (!attributes || Object.keys(attributes).length === 0) return '';
    return '\n\n**Attributes:**\n' + Object.keys(attributes)
      .map(attr => `- ${attr}${attributes[attr].required ? ' (required)' : ''}: ${attributes[attr].description || ''}`)
      .join('\n');
  }

  public getDocumentation(nodePath: string): string {
    if (this.documentationCache.has(nodePath)) {
      return this.documentationCache.get(nodePath) || '';
    }

    const nodeDoc = this.schema.find(doc => doc.path === nodePath);
    if (!nodeDoc) return '';

    const doc = `${nodeDoc.description || ''}\n${this.formatAttributesMarkdown(nodeDoc.attributes || {})}`;
    this.documentationCache.set(nodePath, doc);
    return doc;
  }

  private formatElementDetail(doc: SchemaDocumentation): string {
    const attributes = doc.attributes ?? {};
    const required = Object.entries(attributes)
      .filter(([, attr]) => attr.required)
      .map(([name]) => name);
    return `XML Element${required.length ? ` (Required attrs: ${required.join(', ')})` : ''}`;
  }

  private formatElementDocumentation(doc: SchemaDocumentation): string {
    const parts: string[] = [];
    
    // Add description
    if (doc.description) {
      parts.push(`${doc.description}\n\n`);
    }

    // Add attributes section if there are any
    const attributes = doc.attributes ?? {};
    const attributeEntries = Object.entries(attributes);
    if (attributeEntries.length > 0) {
      parts.push('**Attributes:**\n');
      attributeEntries.forEach(([attr, info]) => {
        const required = info.required ? ' _(required)_' : '';
        parts.push(`- \`${attr}\`${required}${info.description ? ` - ${info.description}` : ''}`);
      });
      parts.push('\n');
    }

    return parts.join('\n');
  }

  public async loadSchemaDocumentation(schemaPath: string): Promise<void> {
    try {
      // Cache the schema path to avoid reloading
      const cached = this.documentationCache.get(schemaPath);
      if (cached) {
        this.schema = JSON.parse(cached);
        return;
      }

      // Load schema from file
      const response = await fetch(schemaPath);
      const documentation: SchemaDocumentation[] = await response.json();
      
      // Cache the loaded schema
      this.documentationCache.set(schemaPath, JSON.stringify(documentation));
      this.schema = documentation;
    } catch (error) {
      ErrorService.getInstance().logError(
        error instanceof Error ? error : String(error),
        'SCHEMA_LOADING_FAILED'
      );
      this.schema = [];
    }
  }

  public clearCache(): void {
    this.documentationCache.clear();
  }
}

export const formatAttributesMarkdown = (attributes: Record<string, any>): string => {
  if (!attributes || Object.keys(attributes).length === 0) return '';
  return '\n\n**Attributes:**\n' + Object.keys(attributes)
    .map(attr => `- ${attr}${attributes[attr].required ? ' (required)' : ''}: ${attributes[attr].description || ''}`)
    .join('\n');
};
