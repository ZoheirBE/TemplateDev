import * as monaco from 'monaco-editor';
import { ErrorService } from '../../services';

interface ValidationError {
  message: string;
  line: number;
  column: number;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export class XmlValidationService {
  private static instance: XmlValidationService;
  private schemaCache: Map<string, string> = new Map();

  private constructor() {}

  public static getInstance(): XmlValidationService {
    if (!XmlValidationService.instance) {
      XmlValidationService.instance = new XmlValidationService();
    }
    return XmlValidationService.instance;
  }

  public async validateWithSchema(
    editor: monaco.editor.IStandaloneCodeEditor,
    content?: string,
    schemaPath?: string
  ): Promise<void> {
    try {
      const model = editor.getModel();
      if (!model) {
        ErrorService.getInstance().logError('Editor model is null', 'EDITOR_MODEL_NULL');
        return;
      }

      const currentContent = content || model.getValue();
      const errors = this.validateWellFormedness(currentContent);
      
      if (schemaPath) {
        const schema = await this.loadSchema(schemaPath);
        if (schema) {
          const schemaErrors = await this.validateAgainstSchema(currentContent, schema);
          errors.push(...schemaErrors);
        }
      }

      this.setEditorMarkers(editor, errors);
    } catch (error) {
      ErrorService.getInstance().logError(
        error instanceof Error ? error : String(error),
        'VALIDATION_ERROR'
      );
    }
  }

  public async validateXml(content: string): Promise<ValidationError[]> {
    try {
      const schema = await this.getSchema();
      const result = await this.validateContent(content, schema);
      return result.errors;
    } catch (error) {
      console.error('Error validating XML:', error);
      return [];
    }
  }

  private validateWellFormedness(content: string): ValidationError[] {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'application/xml');
      const errors = Array.from(doc.getElementsByTagName('parsererror'));
      
      if (errors.length > 0) {
        // Basic error location extraction from error message
        const errorMessage = errors[0].textContent || 'XML parsing error';
        const lineMatch = errorMessage.match(/line (\d+)/);
        const columnMatch = errorMessage.match(/column (\d+)/);
        
        return [{
          message: errorMessage,
          line: lineMatch ? parseInt(lineMatch[1]) : 1,
          column: columnMatch ? parseInt(columnMatch[1]) : 1
        }];
      }
      
      return [];
    } catch (error) {
      ErrorService.getInstance().logError(
        error instanceof Error ? error : String(error),
        'WELL_FORMEDNESS_ERROR'
      );
      return [{
        message: 'Failed to validate XML well-formedness',
        line: 1,
        column: 1
      }];
    }
  }

  private async loadSchema(schemaPath: string): Promise<string | null> {
    try {
      // Check cache first
      if (this.schemaCache.has(schemaPath)) {
        return this.schemaCache.get(schemaPath)!;
      }

      // Load schema from resources folder first
      const response = await fetch(`file://${schemaPath}`);
      if (response.ok) {
        const schemaContent = await response.text();
        this.schemaCache.set(schemaPath, schemaContent);
        return schemaContent;
      }

      // If local file not found, try as URL
      if (schemaPath.startsWith('http')) {
        const urlResponse = await fetch(schemaPath);
        if (urlResponse.ok) {
          const schemaContent = await urlResponse.text();
          this.schemaCache.set(schemaPath, schemaContent);
          return schemaContent;
        }
      }

      ErrorService.getInstance().logError(
        `Failed to load schema from ${schemaPath}`,
        'SCHEMA_LOAD_ERROR'
      );
      return null;
    } catch (error) {
      ErrorService.getInstance().logError(
        error instanceof Error ? error : String(error),
        'SCHEMA_LOAD_ERROR'
      );
      return null;
    }
  }

  private async validateAgainstSchema(content: string, schema: string): Promise<ValidationError[]> {
    try {
      // Parse the XML content
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(content, 'application/xml');
      
      // Parse the schema
      const schemaDoc = parser.parseFromString(schema, 'application/xml');
      
      // Basic validation checks
      const errors: ValidationError[] = [];
      
      // Check root element matches schema
      const rootElement = xmlDoc.documentElement;
      const schemaRoot = schemaDoc.documentElement;
      
      if (rootElement.tagName !== schemaRoot.tagName) {
        errors.push({
          message: `Root element "${rootElement.tagName}" does not match schema root "${schemaRoot.tagName}"`,
          line: 1,
          column: 1
        });
      }
      
      // Validate required attributes
      const requiredAttrs = Array.from(schemaRoot.attributes)
        .filter(attr => attr.value === 'required')
        .map(attr => attr.name);
        
      requiredAttrs.forEach(attrName => {
        if (!rootElement.hasAttribute(attrName)) {
          errors.push({
            message: `Missing required attribute "${attrName}"`,
            line: 1,
            column: rootElement.tagName.length + 2
          });
        }
      });
      
      return errors;
    } catch (error) {
      ErrorService.getInstance().logError(
        error instanceof Error ? error : String(error),
        'SCHEMA_VALIDATION_ERROR'
      );
      return [{
        message: `Schema validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        line: 1,
        column: 1
      }];
    }
  }

  private async validateContent(content: string, schema: any): Promise<ValidationResult> {
    try {
      // Basic XML validation
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(content, 'text/xml');
      const parseError = xmlDoc.getElementsByTagName('parsererror');
      
      if (parseError.length > 0) {
        const errorText = parseError[0].textContent || 'XML parsing error';
        return {
          isValid: false,
          errors: [{
            message: errorText,
            line: 1,
            column: 1
          }]
        };
      }

      // Add schema validation if schema is provided
      if (schema && Object.keys(schema).length > 0) {
        // Here you would implement schema validation
        // For now, we'll just do basic XML validation
        const errors: ValidationError[] = [];
        const elements = xmlDoc.getElementsByTagName('*');
        
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          const elementName = element.tagName;
          
          // Example validation: check if element exists in schema
          if (!schema[elementName]) {
            errors.push({
              message: `Unknown element: ${elementName}`,
              line: 1, // You would need to calculate actual line numbers
              column: 1
            });
          }
        }
        
        return {
          isValid: errors.length === 0,
          errors
        };
      }

      return {
        isValid: true,
        errors: []
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [{
          message: error instanceof Error ? error.message : 'Unknown error',
          line: 1,
          column: 1
        }]
      };
    }
  }

  private setEditorMarkers(
    editor: monaco.editor.IStandaloneCodeEditor,
    errors: ValidationError[]
  ): void {
    const model = editor.getModel();
    if (!model) {
      ErrorService.getInstance().logError('Editor model is null', 'EDITOR_MODEL_NULL');
      return;
    }

    const markers = errors.map(error => ({
      severity: monaco.MarkerSeverity.Error,
      message: error.message,
      startLineNumber: error.line,
      startColumn: error.column,
      endLineNumber: error.line,
      endColumn: error.column + 1
    }));

    monaco.editor.setModelMarkers(model, 'xml', markers);
  }

  private async getSchema(): Promise<any> {
    // Add implementation to get schema
    return {};
  }

  public clearCache(): void {
    this.schemaCache.clear();
  }
}
