import React, { useState, useEffect, useCallback } from 'react';
import * as SDK from 'azure-devops-extension-sdk';
import { WorkItemTrackingRestClient } from 'azure-devops-extension-api/WorkItemTracking';
import { WorkItemType, WorkItemTypeCategory } from 'azure-devops-extension-api/WorkItemTracking';
import { getClient, CommonServiceIds, IProjectPageService } from 'azure-devops-extension-api';
import { Spinner, SpinnerSize } from 'azure-devops-ui/Spinner';
import { MessageCard, MessageCardSeverity } from 'azure-devops-ui/MessageCard';

import StateGraph from './StateGraph';

interface TreeNode {
  id: string;
  text: string;
  expanded?: boolean;
  children?: TreeNode[];
  workItemType?: WorkItemType;
}

export const StateVisualizationTab: React.FC = () => {
  const [workItemTypes, setWorkItemTypes] = useState<WorkItemType[]>([]);
  const [categories, setCategories] = useState<WorkItemTypeCategory[]>([]);
  const [selectedWorkItemType, setSelectedWorkItemType] = useState<WorkItemType | null>(null);
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // SDK is already initialized in App.tsx, so we can directly load data
    loadWorkItemTypes();
  }, []);

  const loadWorkItemTypes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use ProjectPageService like Microsoft sample
      const projectService = await SDK.getService<IProjectPageService>('ms.vss-tfs-web.tfs-page-data-service');//Change to CommonServiceIds.ProjectPageService
      const project = await projectService.getProject();
      
      if (!project) {
        throw new Error('No project context available');
      }

      // Get WIT client
      const client = getClient(WorkItemTrackingRestClient);
      
      // Load work item types
      const wits = await client.getWorkItemTypes(project.name);
      
      // Load categories with fallback
      let cats: WorkItemTypeCategory[] = [];
      try {
        cats = await client.getWorkItemTypeCategories(project.name);
      } catch (catError) {
        console.warn('Failed to load categories, continuing without them:', catError);
      }

      setWorkItemTypes(wits);
      setCategories(cats);
      
      // Create tree data
      const treeItems = createTreeItems(wits, cats);
      setTreeNodes(treeItems);
      
      // Select first work item type by default
      if (wits.length > 0) {
        setSelectedWorkItemType(wits[0]);
      }
      
    } catch (err) {
      console.error('Failed to load work item types:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Failed to load work item types: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createTreeItems = (wits: WorkItemType[], cats: WorkItemTypeCategory[]): TreeNode[] => {
    // Find hidden category
    const hiddenCategory = cats.find(cat => cat.referenceName === 'Microsoft.HiddenCategory');
    const hiddenWitNames = hiddenCategory?.workItemTypes?.map(wit => wit.name) || [];

    // Separate visible and hidden work item types
    const visibleWits = wits.filter(wit => !hiddenWitNames.includes(wit.name));
    const hiddenWits = wits.filter(wit => hiddenWitNames.includes(wit.name));

    const treeItems: TreeNode[] = [];

    // Add visible work items group
    if (visibleWits.length > 0) {
      treeItems.push({
        id: 'visible-group',
        text: 'Work Items',
        expanded: true,
        children: visibleWits.sort((a, b) => a.name.localeCompare(b.name)).map(wit => ({
          id: `wit-${wit.name}`,
          text: wit.name,
          workItemType: wit
        }))
      });
    }

    // Add hidden work items group
    if (hiddenWits.length > 0) {
      treeItems.push({
        id: 'hidden-group',
        text: 'Hidden Work Items',
        expanded: true,
        children: hiddenWits.sort((a, b) => a.name.localeCompare(b.name)).map(wit => ({
          id: `wit-${wit.name}`,
          text: wit.name,
          workItemType: wit
        }))
      });
    }

    return treeItems;
  };

  const onTreeItemSelected = useCallback((node: TreeNode) => {
    if (node.workItemType) {
      setSelectedWorkItemType(node.workItemType);
    }
  }, []);

  const renderTreeNode = (node: TreeNode, level: number = 0): React.ReactNode => {
    const isSelected = selectedWorkItemType?.name === node.workItemType?.name;
    const isGroup = !node.workItemType;
    
    return (
      <div key={node.id} style={{ marginLeft: level * 16 }}>
        <div 
          onClick={() => onTreeItemSelected(node)}
          className={`tree-node ${isGroup ? 'tree-group' : 'tree-item'} ${isSelected ? 'selected' : ''}`}
          style={{ 
            // Enhanced group styling
            ...(isGroup ? {
              padding: '8px 12px',
              cursor: 'default',
              fontSize: '14px',
              fontWeight: '600',
              color: '#24292f',
              backgroundColor: 'transparent',
              borderRadius: '4px',
              margin: '4px 0',
              borderLeft: '3px solid #0969da'
            } : {
              // Enhanced selectable item styling
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '400',
              backgroundColor: isSelected ? '#0969da' : 'transparent',
              color: isSelected ? 'white' : '#24292f',
              borderRadius: '4px',
              margin: '2px 0',
              border: '1px solid transparent',
              transition: 'all 0.2s ease'
            })
          }}
        >
          {/* Add icon for groups */}
          {isGroup && (
            <span style={{ 
              marginRight: '8px', 
              fontSize: '12px',
              opacity: 0.7 
            }}>
              📁
            </span>
          )}
          {node.text}
        </div>
        {node.children && node.expanded && (
          <div style={{ 
            borderLeft: level === 0 ? '2px solid #e1e5e9' : 'none',
            marginLeft: level === 0 ? '8px' : '0',
            paddingLeft: level === 0 ? '8px' : '0'
          }}>
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Spinner size={SpinnerSize.large} label="Loading work item types..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <MessageCard
          severity={MessageCardSeverity.Error}
          onDismiss={() => setError(null)}
        >
          {error}
          <br />
          <button onClick={loadWorkItemTypes} style={{ marginTop: '10px' }}>
            Retry
          </button>
        </MessageCard>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      height: '100%', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      gap: '12px' 
    }}>
      {/* Enhanced Sidebar */}
      <div style={{ 
        width: '320px', 
        backgroundColor: '#ffffff', 
        border: '1px solid #d1d7dc',
        borderRadius: '6px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden'
      }}>
        <div style={{ 
          padding: '20px',
          borderBottom: '1px solid #e1e5e9',
          backgroundColor: '#f8f9fa'
        }}>
          <h3 style={{ 
            margin: '0', 
            fontSize: '16px',
            fontWeight: '600',
            color: '#24292f'
          }}>Work Item Types</h3>
        </div>
        <div style={{ 
          padding: '16px',
          maxHeight: 'calc(100% - 70px)',
          overflowY: 'auto'
        }}>
          {treeNodes.map(node => renderTreeNode(node))}
        </div>
      </div>
      
      {/* Enhanced Main content */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        border: '1px solid #d1d7dc',
        borderRadius: '6px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden'
      }}>
        <div style={{ 
          padding: '16px 20px', 
          backgroundColor: '#f8f9fa', 
          borderBottom: '1px solid #e1e5e9',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {selectedWorkItemType ? (
            <span style={{ color: '#24292f' }}>
              State diagram for: <strong style={{ color: '#0969da' }}>{selectedWorkItemType.name}</strong>
            </span>
          ) : (
            <span style={{ color: '#656d76' }}>Select a work item type to view its state diagram</span>
          )}
        </div>
        
        <div style={{ 
          flex: 1, 
          position: 'relative',
          minHeight: '400px'
        }}>
          <StateGraph workItemType={selectedWorkItemType} />
        </div>
      </div>
    </div>
  );
};