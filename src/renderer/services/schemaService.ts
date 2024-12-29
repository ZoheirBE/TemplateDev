import { ipcService } from './ipcService';

export interface SchemaDocumentation {
  element?: string;
  attribute?: string;
  description: string;
  type?: string;
  required?: boolean;
  values?: string[];
}

class SchemaService {
  private schemaCache: Map<string, Document> = new Map();
  private documentationCache: Map<string, SchemaDocumentation> = new Map();

  async loadSchema(schemaPath: string): Promise<Document | null> {
    try {
      // Check cache first
      if (this.schemaCache.has(schemaPath)) {
        return this.schemaCache.get(schemaPath)!;
      }

      // Load schema file through IPC
      const content = await ipcService.readFile(schemaPath);
      if (typeof content !== 'string') {
        throw new Error('Invalid schema content received');
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'application/xml');

      // Cache the schema
      this.schemaCache.set(schemaPath, doc);
      return doc;
    } catch (error) {
      console.error('[SchemaService] Error loading schema:', error);
      return null;
    }
  }

  async findDocumentation(element: string, attribute?: string): Promise<SchemaDocumentation | null> {
    const cacheKey = `${element}${attribute ? '.' + attribute : ''}`;
    
    // Check cache first
    if (this.documentationCache.has(cacheKey)) {
      return this.documentationCache.get(cacheKey)!;
    }

    try {
      // Get XSD files from resources through IPC
      const files = await ipcService.readDir('src/resources');
      if (!Array.isArray(files)) {
        throw new Error('Invalid directory listing received');
      }

      const xsdFiles = files.filter(file => typeof file === 'string' && file.endsWith('.xsd'));

      for (const xsdFile of xsdFiles) {
        const schema = await this.loadSchema(`src/resources/${xsdFile}`);
        if (!schema) continue;

        const documentation = this.extractDocumentation(schema, element, attribute);
        if (documentation) {
          // Cache the documentation
          this.documentationCache.set(cacheKey, documentation);
          return documentation;
        }
      }

      return null;
    } catch (error) {
      console.error('[SchemaService] Error finding documentation:', error);
      return null;
    }
  }

  private extractDocumentation(schema: Document, element: string, attribute?: string): SchemaDocumentation | null {
    try {
      let elementNode: Element | null = null;
      
      // Find element definition
      if (attribute) {
        elementNode = schema.querySelector(`element[name="${element}"]`);
      } else {
        elementNode = schema.querySelector(`element[name="${element}"]`);
      }

      if (!elementNode) return null;

      const documentation: SchemaDocumentation = {
        element,
        description: '',
      };

      // Extract element documentation
      const annotationNode = elementNode.querySelector('annotation > documentation');
      if (annotationNode) {
        documentation.description = annotationNode.textContent?.trim() || '';
      }

      if (attribute) {
        // Find attribute documentation
        const attributeNode = elementNode.querySelector(`attribute[name="${attribute}"]`);
        if (attributeNode) {
          documentation.attribute = attribute;
          const attrAnnotation = attributeNode.querySelector('annotation > documentation');
          if (attrAnnotation) {
            documentation.description = attrAnnotation.textContent?.trim() || '';
          }
          documentation.required = attributeNode.getAttribute('use') === 'required';
          documentation.type = attributeNode.getAttribute('type') || undefined;

          // Extract possible values for enums
          const simpleType = attributeNode.querySelector('simpleType');
          if (simpleType) {
            const enums = Array.from(simpleType.querySelectorAll('enumeration'))
              .map(enumNode => enumNode.getAttribute('value'))
              .filter((value): value is string => value !== null);
            if (enums.length > 0) {
              documentation.values = enums;
            }
          }
        }
      }

      return documentation;
    } catch (error) {
      console.error('[SchemaService] Error extracting documentation:', error);
      return null;
    }
  }

  clearCache() {
    this.schemaCache.clear();
    this.documentationCache.clear();
  }
}

export const schemaService = new SchemaService();
