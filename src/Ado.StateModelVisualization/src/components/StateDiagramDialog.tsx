import React, { useEffect, useState } from 'react';
import * as SDK from 'azure-devops-extension-sdk';
import { StateGraph } from './StateGraph';
import { 
  WorkItemType, 
  WorkItemTrackingRestClient
} from 'azure-devops-extension-api/WorkItemTracking';
import { getClient } from 'azure-devops-extension-api';

interface DialogConfiguration {
  workItemId?: any;
  workItemTypeName?: string;
  projectId?: string;
}

const StateDiagramDialog: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [workItemType, setWorkItemType] = useState<WorkItemType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initializeDialog();
  }, []);

  const initializeDialog = async () => {
    try {
      // Initialize SDK
      await SDK.init();
      await SDK.ready();

      // Get the configuration passed from the button
      const config = SDK.getConfiguration();

      // If we have work item information, use it
      if (config?.workItemTypeName) {
        // Load the actual WorkItemType object
        await loadWorkItemType(config);
      }

      setIsInitialized(true);
      
    } catch (error) {
      console.error('StateDiagramDialog: Initialization error:', error);
    }
  };

  const loadWorkItemType = async (dialogConfig: DialogConfiguration) => {
    try {
      setIsLoading(true);
      
      const witClient = getClient(WorkItemTrackingRestClient);

      if (!dialogConfig.projectId || !dialogConfig.workItemTypeName) {
        console.error('StateDiagramDialog: No project ID or workItemTypeName available');
        return;
      }
      
      // Get all work item types and find the matching one
      const matchingWorkItemType = await witClient.getWorkItemType(dialogConfig.projectId, dialogConfig.workItemTypeName);
      
      if (matchingWorkItemType) {
        setWorkItemType(matchingWorkItemType);
      } else {
        console.warn('StateDiagramDialog: Could not find work item type:', dialogConfig.workItemTypeName);
      }
      
    } catch (error) {
      console.error('StateDiagramDialog: Error loading work item type:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const closeDialog = async () => {
    try {
      const dialogService = await SDK.getService<any>('ms.vss-web.dialog-service');
      await dialogService.closeDialog();
    } catch (error) {
      console.error('StateDiagramDialog: Error closing dialog:', error);
    }
  };

  const handleWorkItemTypeSelected = (workItemType: WorkItemType) => {
    setWorkItemType(workItemType);
  };

  if (!isInitialized) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Loading state diagram...</div>
      </div>
    );
  }

  return (
    <div className="state-diagram-dialog" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {isLoading && (
        <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f5f5f5' }}>
          <div>Loading work item type...</div>
        </div>
      )}
      
      <div style={{ flex: 1, minHeight: 0 }}>
        <StateGraph workItemType={workItemType} />
      </div>
    </div>
  );
};

export default StateDiagramDialog;