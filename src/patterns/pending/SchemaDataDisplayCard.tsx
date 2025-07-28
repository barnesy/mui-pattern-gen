import React, { useMemo } from 'react';
import { DataDisplayCard, DataDisplayCardProps } from './DataDisplayCard';
import { withSchemaConfig } from '../../components/schema/ConfigurableComponent';
import { DataSourceSchema } from '../../schemas/types';
import { useSchemaData } from '../../hooks/useSchemaData';
import { DataDisplayCardSchema } from './DataDisplayCard.schema';
import { registerComponent } from '../../schemas/registry';

export interface SchemaDataDisplayCardProps
  extends Omit<DataDisplayCardProps, 'stats' | 'listItems' | 'tableData' | 'workflowSteps'> {
  dataSource?: DataSourceSchema;
  onDataLoad?: (data: any) => void;
  onDataError?: (error: Error) => void;
}

/**
 * Schema-enabled version of DataDisplayCard
 */
export const SchemaDataDisplayCard: React.FC<SchemaDataDisplayCardProps> = ({
  dataSource,
  onDataLoad,
  onDataError,
  variant = 'stats',
  ...props
}) => {
  // Fetch data if data source is provided
  const { data, loading, error } = useSchemaData(dataSource, DataDisplayCardSchema.dataShape, {
    onSuccess: onDataLoad,
    onError: onDataError,
  });

  // Map data to component props based on variant
  const mappedProps = useMemo(() => {
    if (!data) {return {};}

    // If data is already in the correct format
    if (data.stats || data.listItems || data.tableData || data.workflowSteps) {
      return data;
    }

    // Auto-detect format based on data shape
    if (Array.isArray(data)) {
      // Check if it's stats data
      if (data.length > 0 && data[0].label && data[0].value) {
        return { stats: data };
      }
      // Check if it's list data
      if (data.length > 0 && (data[0].primary || data[0].title)) {
        return { listItems: data };
      }
      // Default to table data
      return { tableData: data };
    }

    // If data is an object with specific keys
    if (typeof data === 'object') {
      // Check for table structure
      if (data.columns && data.rows) {
        return {
          tableColumns: data.columns,
          tableData: data.rows,
        };
      }
      // Check for workflow data
      if (data.steps) {
        return { workflowSteps: data.steps };
      }
    }

    return {};
  }, [data]);

  return (
    <DataDisplayCard
      variant={variant}
      loading={loading || props.loading}
      error={error?.message || props.error}
      {...props}
      {...mappedProps}
    />
  );
};

// Register the schema-enabled component
registerComponent('SchemaDataDisplayCard', SchemaDataDisplayCard, DataDisplayCardSchema);

// Export the wrapped version with schema config support
export const ConfigurableDataDisplayCard = withSchemaConfig(
  SchemaDataDisplayCard,
  DataDisplayCardSchema
);
