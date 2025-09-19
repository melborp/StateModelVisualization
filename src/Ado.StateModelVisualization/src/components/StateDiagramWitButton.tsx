import React, { useEffect } from 'react';
import * as SDK from 'azure-devops-extension-sdk';
import { IWorkItemFormService, WorkItemTrackingServiceIds } from 'azure-devops-extension-api/WorkItemTracking';

const StateDiagramWitButton: React.FC = () => {
  useEffect(() => {
    // Initialize the extension when component mounts
    initializeButton();
  }, []);

  const initializeButton = async () => {
    try {
      // Initialize SDK
      await SDK.init();
      await SDK.ready();

      // Register the button action
      const buttonAction = {
        execute: async (actionContext: any) => {
          try {
            // Get the current work item to determine its type
            const workItemFormService = await SDK.getService<IWorkItemFormService>(
              WorkItemTrackingServiceIds.WorkItemFormService
            );
            
            // Get more comprehensive work item data
            const workItem = await workItemFormService.getFieldValues([
              'System.WorkItemType', 
              'System.Id', 
              'System.Title',
              'System.State'
            ]);
            
            // Open the state diagram dialog with both work item data and action context
            await openStateDiagramDialog(workItem, actionContext);
            
          } catch (error) {
            console.error('StateDiagramWitButton: Error getting work item:', error);
          }
        }
      };

      // Register the button action with VSS
      SDK.register('state-diagram-work-item-button', buttonAction);
      
    } catch (error) {
      console.error('StateDiagramWitButton: Initialization error:', error);
    }
  };

  const openStateDiagramDialog = async (workItem: any, actionContext: any) => {
    try {
      // Calculate dialog size (75% of screen)
      const widthPercentage = 75;
      const heightPercentage = 85;
      const newWidth = Math.floor((window.screen.width / 100) * widthPercentage);
      const newHeight = Math.floor((window.screen.height / 100) * heightPercentage);

      const dialogOptions = {
        width: newWidth,
        height: newHeight,
        title: `${workItem['System.WorkItemType']} ${workItem['System.Id']} - State Diagram`,
        buttons: null
      };

      const contributionConfig = {
        workItemId: workItem['System.Id'],
        workItemTypeName: workItem['System.WorkItemType'],
        projectId: actionContext.currentProjectGuid
      };

      // Get the extension context to build the dialog contribution ID
      const extensionContext = SDK.getExtensionContext();
      const dialogContributionId = `${extensionContext.id}.work-item-state-diagram-dialog`;

      // Open the dialog using the modern API
      const dialogService = await SDK.getService<any>('ms.vss-web.dialog-service');
      await dialogService.openDialog(dialogContributionId, dialogOptions, contributionConfig);
      
    } catch (error) {
      console.error('StateDiagramWitButton: Error opening dialog:', error);
    }
  };

  // This component doesn't render anything visible - it just registers the button action
  return (
    <div style={{ display: 'none' }}>
      <span>State Diagram Work Item Button Handler</span>
    </div>
  );
};

export default StateDiagramWitButton;