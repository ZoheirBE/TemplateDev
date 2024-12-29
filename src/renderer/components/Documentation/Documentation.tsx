import React, { useEffect, useState } from 'react';
import { useEditor } from '../../services/editorService';
import { schemaService, type SchemaDocumentation } from '../../services/schemaService';
import { Card } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';

export const Documentation: React.FC = () => {
  const { state } = useEditor();
  const [documentation, setDocumentation] = useState<SchemaDocumentation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const updateDocumentation = async () => {
      if (!state.selectedFile?.content) {
        setDocumentation(null);
        return;
      }

      try {
        setIsLoading(true);
        const cursorLine = state.cursorPosition?.line ?? 1;
        const content = state.selectedFile.content;
        const lines = content.split('\n');
        const currentLine = lines[cursorLine - 1] || '';

        // Extract element and attribute under cursor
        const elementMatch = currentLine.match(/<(\/?[^\s>]+)/);
        const attributeMatch = currentLine.match(/\s([^\s=]+)=/);

        if (elementMatch) {
          const element = elementMatch[1].replace('/', '');
          const attribute = attributeMatch ? attributeMatch[1] : undefined;
          
          const doc = await schemaService.findDocumentation(element, attribute);
          setDocumentation(doc);
        } else {
          setDocumentation(null);
        }
      } catch (error) {
        console.error('[Documentation] Error updating documentation:', error);
        setDocumentation(null);
      } finally {
        setIsLoading(false);
      }
    };

    updateDocumentation();
  }, [state.selectedFile?.content, state.cursorPosition]);

  if (isLoading) {
    return (
      <Card className="h-full w-full p-4 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-3/4 bg-muted rounded" />
          <div className="h-4 w-1/2 bg-muted rounded" />
          <div className="h-20 w-full bg-muted rounded" />
        </div>
      </Card>
    );
  }

  if (!documentation) {
    return (
      <Card className="h-full w-full p-4">
        <div className="text-muted-foreground text-sm">
          No documentation available for the current selection.
          <br /><br />
          Move your cursor to an XML element or attribute to view its documentation.
        </div>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-full w-full">
      <Card className="p-4 space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">
            {documentation.element}
            {documentation.attribute && 
              <span className="text-muted-foreground">
                .{documentation.attribute}
              </span>
            }
          </h3>
          
          {/* Metadata badges */}
          <div className="flex flex-wrap gap-2">
            {documentation.type && (
              <Badge variant="secondary">
                Type: {documentation.type}
              </Badge>
            )}
            {documentation.required !== undefined && (
              <Badge variant={documentation.required ? "destructive" : "outline"}>
                {documentation.required ? "Required" : "Optional"}
              </Badge>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="text-sm text-muted-foreground whitespace-pre-wrap">
          {documentation.description || "No description available."}
        </div>

        {/* Possible values */}
        {documentation.values && documentation.values.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Possible Values:</h4>
            <div className="flex flex-wrap gap-2">
              {documentation.values.map((value, index) => (
                <Badge key={index} variant="secondary">
                  {value}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>
    </ScrollArea>
  );
};
