import React from 'react';
import { useEditor } from '../../services/editorService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';

export const Properties: React.FC = () => {
  const { state } = useEditor();
  const { selectedFile, schema } = state;

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Properties</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
          <Tabs defaultValue="documentation" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="documentation" className="flex-1">Documentation</TabsTrigger>
              <TabsTrigger value="validation" className="flex-1">Validation</TabsTrigger>
            </TabsList>
            <TabsContent value="documentation">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {selectedFile?.name || 'No file selected'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  {schema?.documentation || 'No documentation available'}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="validation">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Validation Status</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  {schema?.validationStatus || 'No validation information available'}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Properties;
