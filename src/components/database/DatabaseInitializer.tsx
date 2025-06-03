
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, CheckCircle, AlertCircle } from 'lucide-react';

interface TableStatus {
  name: string;
  exists: boolean;
  error?: string;
}

const DatabaseInitializer = () => {
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const requiredTables = [
    'profiles',
    'dog_listings', 
    'conversations',
    'messages',
    'favorites',
    'verification_requests',
    'verification_documents',
    'notifications',
    'reviews'
  ];

  const checkTablesExist = async () => {
    setIsChecking(true);
    const tableStatuses: TableStatus[] = [];

    for (const tableName of requiredTables) {
      try {
        // Try to query the table with a simple count to check if it exists
        const { error } = await supabase
          .rpc('check_table_exists', { table_name: tableName })
          .single();

        if (error && error.code === '42883') {
          // RPC function doesn't exist, fall back to direct table query
          try {
            const { error: queryError } = await supabase
              .from(tableName as 'profiles')
              .select('count')
              .limit(0);

            tableStatuses.push({
              name: tableName,
              exists: !queryError,
              error: queryError?.message
            });
          } catch (fallbackError) {
            tableStatuses.push({
              name: tableName,
              exists: false,
              error: 'Table not accessible'
            });
          }
        } else {
          tableStatuses.push({
            name: tableName,
            exists: !error,
            error: error?.message
          });
        }
      } catch (err) {
        tableStatuses.push({
          name: tableName,
          exists: false,
          error: 'Connection error'
        });
      }
    }

    setTables(tableStatuses);
    setIsChecking(false);
  };

  useEffect(() => {
    checkTablesExist();
  }, []);

  const missingTables = tables.filter(t => !t.exists);
  const existingTables = tables.filter(t => t.exists);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Database Schema Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={checkTablesExist} 
            disabled={isChecking}
            className="w-full"
          >
            {isChecking ? 'Checking...' : 'Refresh Status'}
          </Button>

          {existingTables.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Existing Tables ({existingTables.length})
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {existingTables.map(table => (
                  <div key={table.name} className="text-sm bg-green-50 p-2 rounded">
                    {table.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {missingTables.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Missing Tables ({missingTables.length})
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {missingTables.map(table => (
                  <div key={table.name} className="text-sm bg-red-50 p-2 rounded">
                    {table.name}
                    {table.error && (
                      <div className="text-xs text-red-600 mt-1">{table.error}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 mt-4">
            Schema completion: {Math.round((existingTables.length / requiredTables.length) * 100)}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseInitializer;
