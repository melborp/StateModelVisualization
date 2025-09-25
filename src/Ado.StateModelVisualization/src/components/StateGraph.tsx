import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { WorkItemType } from 'azure-devops-extension-api/WorkItemTracking';
import * as SDK from 'azure-devops-extension-sdk';
import { Button } from "azure-devops-ui/Button";
import { ButtonGroup } from "azure-devops-ui/ButtonGroup";
import { Tooltip } from "azure-devops-ui/TooltipEx";
import { Icon, IconSize } from "azure-devops-ui/Icon";
import { Dropdown } from "azure-devops-ui/Dropdown";
import { IListBoxItem } from "azure-devops-ui/ListBox";

// Use require for Cytoscape libraries due to TypeScript/webpack compatibility issues
const cytoscape = require('cytoscape');
const dagre = require('dagre');
const cytoscapeDagre = require('cytoscape-dagre');

// Register the dagre layout extension
try {
  cytoscapeDagre(cytoscape, dagre);
} catch (error) {
  console.error('StateGraph: Failed to register cytoscape-dagre extension:', error);
}

/**
 * ADVANCED NODE RANKING SYSTEM FOR STATE DIAGRAMS
 * 
 * Ranking Rules:
 * - Rank 1: Initial state (green dot) - always the starting point
 * - Rank 2: Direct successors of initial state - first level of actual states
 * - Rank 3+: Subsequent levels based on shortest path from initial state
 * 
 * Special Cases:
 * - Hub nodes (states with >3 outgoing transitions): Get special treatment to avoid visual clutter
 * - Self-transitions: Ignored for ranking purposes
 * - Cycles: Broken by using shortest path from initial state
 * 
 * Visual Impact:
 * - Better visual hierarchy and flow
 * - Cleaner edge routing
 * - More intuitive state progression understanding
 */

interface NodeRankInfo {
  nodeId: string;
  rank: number;
  isHubNode: boolean;
  outgoingCount: number;
}

type LayoutAlgorithm = 'breadthfirst' | 'concentric' | 'dagre';

interface LayoutOption {
  id: LayoutAlgorithm;
  text: string;
  description: string;
  iconName: string;
}

const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    id: 'breadthfirst',
    text: 'Breadth-First',
    description: 'Hierarchical tree layout starting from initial state (best for simple flows)',
    iconName: 'BranchMerge'
  },
  {
    id: 'concentric',
    text: 'Concentric',
    description: 'Circular layout with ranks as levels (good for complex hub patterns)',
    iconName: 'CircleRing'
  },
  {
    id: 'dagre',
    text: 'Dagre',
    description: 'Advanced directed graph layout (traditional algorithm)',
    iconName: 'Workflow'
  }
];

const calculateNodeRanking = (transitions: any, initialNodeId: string = 'Initial'): Map<string, NodeRankInfo> => {
  const rankMap = new Map<string, NodeRankInfo>();
  const visited = new Set<string>();
  const queue: Array<{nodeId: string, rank: number}> = [];
  
  // Step 1: Initialize initial node (Rank 1)
  rankMap.set(initialNodeId, {
    nodeId: initialNodeId,
    rank: 1,
    isHubNode: false,
    outgoingCount: 0
  });
  queue.push({nodeId: initialNodeId, rank: 1});
  visited.add(initialNodeId);
  
  // Step 2: BFS to assign ranks based on shortest path from initial
  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentTransitions = transitions[current.nodeId === 'Initial' ? '' : current.nodeId] || [];
    
    for (const transition of currentTransitions) {
      const targetId = transition.to;
      
      // Skip self-transitions
      if (targetId === current.nodeId) continue;
      
      // Only assign rank if not visited (shortest path wins)
      if (!visited.has(targetId)) {
        const outgoingCount = (transitions[targetId] || []).filter((t: any) => t.to !== targetId).length;
        const isHubNode = outgoingCount > 3;
        
        rankMap.set(targetId, {
          nodeId: targetId,
          rank: current.rank + 1,
          isHubNode,
          outgoingCount
        });
        
        queue.push({nodeId: targetId, rank: current.rank + 1});
        visited.add(targetId);
      }
    }
  }
  
  // Step 3: Handle any unconnected nodes (shouldn't happen in valid state diagrams)
  for (const state in transitions) {
    const stateId = state === '' ? 'Initial' : state;
    if (!rankMap.has(stateId)) {
      const outgoingCount = (transitions[state] || []).filter((t: any) => t.to !== stateId).length;
      rankMap.set(stateId, {
        nodeId: stateId,
        rank: 999, // Put orphaned nodes at the end
        isHubNode: outgoingCount > 3,
        outgoingCount
      });
    }
  }
  
  return rankMap;
};

// Get recommended layout algorithm based on state count
const getRecommendedLayout = (stateCount: number): LayoutAlgorithm => {
  if (stateCount <= 6) {
    return 'breadthfirst'; // Perfect hierarchy for simple flows
  } else {
    return 'concentric'; // Better for complex hub patterns
  }
};

// Get layout configuration for a specific algorithm
const getLayoutConfig = (algorithm: LayoutAlgorithm, stateCount: number, nodeRanking?: Map<string, NodeRankInfo>): any => {
  switch (algorithm) {
    case 'breadthfirst':
      return {
        name: 'breadthfirst',
        directed: true,
        roots: '#Initial', // Start from our initial state
        padding: 40,
        spacingFactor: stateCount <= 3 ? 2.0 : 1.5,
        avoidOverlap: true,
        nodeDimensionsIncludeLabels: true,
        animate: false
      } as any;

    case 'concentric':
      return {
        name: 'concentric',
        fit: false, // We'll position manually
        concentric: function(node: any) {
          const rank = node.data('rank') || 1;
          const nodeId = node.id();

          // Exclude Initial state and its direct successors from concentric layout - they will be positioned manually
          if (nodeId === 'Initial') {
            console.log(`nodeId: ${nodeId}, initial rank: ${rank}, excluded from concentric (Initial)`);
            return 999; // Push Initial state out of the concentric calculation
          }
          
          // Also exclude rank 2 nodes (direct successors of Initial) for manual positioning
          if (rank === 2) {
            console.log(`nodeId: ${nodeId}, initial rank: ${rank}, excluded from concentric (rank 2)`);
            return 998; // Push rank 2 nodes out of concentric calculation
          }
          
          // For other states (rank 3+), use their rank with small variations
          const actualRank = Math.max(3, rank); // Start from rank 3 for concentric layout
          const idHash = nodeId.split('').reduce((hash: number, char: string) => hash + char.charCodeAt(0), 0);
          const variation = (idHash % 50) / 1000;
          console.log(`nodeId: ${nodeId}, initial rank: ${rank}, actualRank: ${actualRank}, actual+variation: ${actualRank + variation}`);
          return actualRank + variation;
        },
        levelWidth: function(nodes: any) {
          // Increase level width for better spacing between concentric rings
          return Math.max(2, Math.ceil(nodes.length / 2));
        },
        minNodeSpacing: 20, // Increased minimum spacing between nodes
        padding: 20, // Increased padding for more space
        startAngle: Math.PI, // Start from left side (9 o'clock)
        sweep: Math.PI * 1.5, // Only use 3/4 of the circle
        clockwise: true,
        equidistant: false, // Use equidistant for more even spacing
        animate: false,
        avoidOverlap: true,
        spacingFactor: 1.2 // Increased spacing factor for larger gaps between concentric levels
      } as any;

    case 'dagre':
      return {
        name: 'dagre',
        nodeSep: stateCount <= 3 ? 50 : 40,
        rankSep: stateCount <= 3 ? 100 : 80,
        padding: stateCount <= 3 ? 40 : 30,
        ranker: 'tight-tree',
        rankDir: stateCount <= 3 ? 'TB' : 'LR'
      } as any;

    default:
      return getLayoutConfig('breadthfirst', stateCount, nodeRanking);
  }
};

interface StateGraphProps {
  workItemType: WorkItemType | null;
}

interface GraphNode {
  group: 'nodes';
  data: {
    id: string;
    name: string;
    rank?: number;
    isHubNode?: boolean;
  };
}

interface GraphEdge {
  group: 'edges';
  data: {
    id: string;
    source: string;
    target: string;
  };
}

export const StateGraph: React.FC<StateGraphProps> = ({ workItemType }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState<LayoutAlgorithm>('breadthfirst');
  
  // Simple state: store the prepared graph data and ranking once per work item type
  const [graphData, setGraphData] = useState<(GraphNode | GraphEdge)[]>([]);
  const [nodeRanking, setNodeRanking] = useState<Map<string, NodeRankInfo>>(new Map());

  // Effect to handle work item type changes - prepare data once
  useEffect(() => {
    if (workItemType) {
      console.log('Work item type changed, preparing graph data:', workItemType.name);
      const newGraphData = prepareVisualizationData(workItemType);
      setGraphData(newGraphData);
      
      // Extract and cache node ranking from the prepared data
      const nodes = newGraphData.filter(element => element.group === 'nodes') as GraphNode[];
      const newNodeRanking = new Map<string, NodeRankInfo>();
      
      nodes.forEach(node => {
        if (node.data.rank !== undefined) {
          newNodeRanking.set(node.data.id, {
            nodeId: node.data.id,
            rank: node.data.rank,
            isHubNode: node.data.isHubNode || false,
            outgoingCount: 0
          });
        }
      });
      
      setNodeRanking(newNodeRanking);
      
      // Set recommended layout only if no layout is currently selected
      const recommendedLayout = getRecommendedLayout(nodes.length);
      if (!selectedLayout) {
        setSelectedLayout(recommendedLayout);
      }
      
      console.log('Graph data prepared with', nodes.length, 'nodes, recommended layout:', recommendedLayout, 'current selection:', selectedLayout);
    } else {
      setGraphData([]);
      setNodeRanking(new Map());
    }
  }, [workItemType]);

  // Effect to render graph when data or layout changes
  useEffect(() => {
    if (containerRef.current && graphData.length > 0) {
      renderGraph();
    }
  }, [graphData, selectedLayout]);

  // Effect to initialize cytoscape instance
  useEffect(() => {
    if (containerRef.current) {
      initializeGraph();
    }

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, []);

  const initializeGraph = () => {
    if (!containerRef.current) {
      console.error('StateGraph: Container ref is null');
      return;
    }

    // Destroy existing graph if it exists
    if (cyRef.current) {
      cyRef.current.destroy();
    }
    
    try {
      cyRef.current = cytoscape({
        container: containerRef.current,
        style: [
        {
          selector: 'node',
          style: {
            'content': 'data(name)',
            'text-valign': 'center',
            'text-wrap': 'wrap',
            'color': 'black',
            'width': '75px',
            'height': '75px',
            'background-color': 'rgba(254,199,0,1)',
            'border-color': 'black',
            'border-width': '0.25px',
            'font-size': '12px',
            'font-family': 'Segoe UI,Tahoma,Arial,Verdana'
          }
        },
        {
          selector: 'node#Initial',
          style: {
            'background-color': 'rgba(0,151,50,1)',
            'width': '15px',
            'height': '15px',
            'content': ''
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'arrow-scale': 1.5
          }
        }
      ],
      layout: getLayoutConfig('breadthfirst', 1) // Will be updated when rendering graph
    });
    
    } catch (error) {
      console.error('StateGraph: Failed to create cytoscape instance:', error);
      return;
    }

    // Add resize handler
    const handleResize = () => {
      if (cyRef.current) {
        cyRef.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  };

  const renderGraph = () => {
    if (!cyRef.current || graphData.length === 0) {
      console.log('Cannot render graph: cytoscape not ready or no data');
      return;
    }

    console.log('Rendering graph with layout:', selectedLayout, 'and', graphData.length, 'elements');
    setIsLoading(true);

    try {
      // Clear existing elements
      cyRef.current.elements().remove();
      
      // Add new elements
      cyRef.current.add(graphData);
      
      // Set ranking data on all nodes for layout algorithms to use
      cyRef.current.nodes().forEach((node: any) => {
        const nodeId = node.id();
        const rankInfo = nodeRanking.get(nodeId);
        if (rankInfo) {
          node.data('rank', rankInfo.rank);
          node.data('isHubNode', rankInfo.isHubNode);
        }
      });
      
      // Get layout configuration and apply it
      const nodes = graphData.filter(element => element.group === 'nodes') as GraphNode[];
      const layoutConfig = getLayoutConfig(selectedLayout, nodes.length, nodeRanking);
      
      console.log('Applying layout config:', layoutConfig);
      
      const layout = cyRef.current.layout(layoutConfig);
      
      layout.one('layoutstop', () => {
        console.log('Layout completed, fitting graph');
        
        // For concentric layout, manually position the Initial state and rank 2 nodes on the left
        if (layoutConfig.name === 'concentric') {
          // Find nodes in concentric layout (rank 3+) for positioning reference
          const concentricNodes = cyRef.current.nodes().filter((node: any) => {
            const rank = node.data('rank') || 1;
            return rank >= 3;
          });
          
          if (concentricNodes.length > 0) {
            const concentricBoundingBox = concentricNodes.boundingBox();
            const leftmostX = concentricBoundingBox.x1;
            const centerY = (concentricBoundingBox.y1 + concentricBoundingBox.y2) / 2;
            
            // Position Initial state (rank 1) 
            const initialNode = cyRef.current.getElementById('Initial');
            if (initialNode.length > 0) {
              initialNode.position({
                x: leftmostX - 200, // Far left
                y: centerY
              });
              console.log('Positioned Initial state at:', leftmostX - 200, centerY);
            }
            
            // Position rank 2 nodes (direct successors of Initial) between Initial and concentric layout
            const rank2Nodes = cyRef.current.nodes().filter((node: any) => {
              const rank = node.data('rank') || 1;
              return rank === 2;
            });
            
            rank2Nodes.forEach((node: any, index: number) => {
              const nodeId = node.id();
              const yOffset = (index - (rank2Nodes.length - 1) / 2) * 80; // Spread them vertically if multiple
              node.position({
                x: leftmostX - 100, // Between Initial and concentric layout
                y: centerY + yOffset
              });
              console.log(`Positioned rank 2 node ${nodeId} at:`, leftmostX - 100, centerY + yOffset);
            });
          }
        }
        
        setTimeout(() => {
          if (cyRef.current) {
            cyRef.current.fit();
            cyRef.current.center();
          }
          setIsLoading(false);
        }, 50);
      });
      
      layout.run();

    } catch (error) {
      console.error('Failed to render graph:', error);
      setIsLoading(false);
    }
  };

  const prepareVisualizationData = (wit: WorkItemType): (GraphNode | GraphEdge)[] => {
    if (!wit.transitions) {
      console.warn('StateGraph: No transitions in work item type');
      return [];
    }

    const states: string[] = [];
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    // Collect all states
    for (const state in wit.transitions) {
      states.push(state);
    }

    const initialNodeId = 'Initial';
    
    // Calculate node rankings for better visual hierarchy
    const nodeRanking = calculateNodeRanking(wit.transitions, initialNodeId);

    // Create nodes and edges
    for (const state in wit.transitions) {
      let newNode: GraphNode;
      const nodeId = state === "" ? initialNodeId : state;
      const rankInfo = nodeRanking.get(nodeId);
      
      if (state === "") {
        // Empty string represents the initial state
        newNode = {
          group: 'nodes',
          data: { 
            id: initialNodeId, 
            name: 'Initial',
            rank: rankInfo?.rank || 1,
            isHubNode: false
          }
        };
      } else {
        newNode = {
          group: 'nodes',
          data: { 
            id: state, 
            name: state,
            rank: rankInfo?.rank || 999,
            isHubNode: rankInfo?.isHubNode || false
          }
        };
      }

      nodes.push(newNode);

      const transitions = wit.transitions[state];
      if (transitions) {
        for (const transition of transitions) {
          // Skip self-transitions
          if (newNode.data.id === transition.to) {
            continue;
          }

          // Check if the target state exists
          if (!states.includes(transition.to)) {
            console.warn('StateGraph: Target state not found, skipping transition:', transition);
            continue;
          }

          const edge: GraphEdge = {
            group: 'edges',
            data: {
              id: `${newNode.data.id}-${transition.to}`,
              source: newNode.data.id,
              target: transition.to
            }
          };

          edges.push(edge);
        }
      }
    }

    return [...nodes, ...edges];
  };

  const handleZoomIn = () => {
    if (cyRef.current) {
      const currentZoom = cyRef.current.zoom();
      cyRef.current.zoom(currentZoom * 1.2);
    }
  };

  const handleZoomOut = () => {
    if (cyRef.current) {
      const currentZoom = cyRef.current.zoom();
      cyRef.current.zoom(currentZoom * 0.8);
    }
  };

  const handleFitToScreen = () => {
    if (cyRef.current) {
      cyRef.current.fit();
      cyRef.current.center();
    }
  };

  const handleExportImage = () => {
    if (cyRef.current && workItemType) {
      const png64 = cyRef.current.png({ full: true, scale: 2 });
      
      // Create download link
      const link = document.createElement('a');
      link.download = `${workItemType.name}-state-diagram.png`;
      link.href = png64;
      link.click();
    }
  };

  const handleLayoutChange = (event: React.SyntheticEvent<HTMLElement>, item: IListBoxItem<{}>) => {
    const newLayout = item.id as LayoutAlgorithm;
    console.log('Layout change requested:', newLayout);
    setSelectedLayout(newLayout);
    // The useEffect will handle re-rendering the graph with the new layout
  };

  const getSelectedLayoutItem = () => {
    if (!selectedLayout) return undefined;
    return LAYOUT_OPTIONS.find(o => o.id === selectedLayout);
  };

  const handlePrintGraph = async () => {
    if (cyRef.current && workItemType) {
      try {
        const png64 = cyRef.current.png({ full: true, scale: 2 });
        
        // Prepare data for the print dialog
        const printConfig = {
          imageData: png64,
          workItemTypeName: workItemType.name,
          generatedDate: new Date().toLocaleDateString(),
          generatedTime: new Date().toLocaleTimeString()
        };

        const dialogTitle = `Print State Diagram - ${workItemType.name}`;
        // Calculate full-screen dialog size
        const dialogOptions = {
          width: Math.floor(window.screen.width * 0.9),
          height: Math.floor(window.screen.height * 0.9),
          title: dialogTitle,
          okText: "",
          cancelText: "Close"
        };

        // Get the extension context to build the dialog contribution ID
        const extensionContext = SDK.getExtensionContext();
        const dialogContributionId = `${extensionContext.id}.state-diagram-visualization-print-graph-dialog`;

        // Open the print dialog using the dialog service
        //TODO: Should be IHostDialogService
        const dialogService = await SDK.getService<any>('ms.vss-web.dialog-service');
        await dialogService.openDialog(dialogContributionId, dialogOptions, printConfig);
        
      } catch (error) {
        console.error('Failed to open print dialog:', error);
      }
    }
  };

  return (
    <div className="state-graph" style={{ width: '100%', height: '100%' }}>
      <div className="graph-toolbar">
        {/* Layout Algorithm Selector */}
        <div style={{ marginRight: '16px', width: '200px' }}>
          <Tooltip text="Choose layout algorithm for state diagram visualization">
            <Dropdown
              placeholder={selectedLayout ? getSelectedLayoutItem()?.text || "Layout Algorithm" : "Layout Algorithm"}
              items={LAYOUT_OPTIONS.map(option => ({
                id: option.id,
                text: option.text,
                iconProps: { iconName: option.iconName }
              }))}
              onSelect={handleLayoutChange}
              width={200}
            />
          </Tooltip>
        </div>

        <ButtonGroup>
          <Tooltip text="Zoom In">
            <Button
              onClick={handleZoomIn}
              iconProps={{ iconName: "ZoomIn" }}
              subtle={true}
            />
          </Tooltip>
          <Tooltip text="Zoom Out">
            <Button
              onClick={handleZoomOut}
              iconProps={{ iconName: "ZoomOut" }}
              subtle={true}
            />
          </Tooltip>
          <Tooltip text="Fit to Screen">
            <Button
              onClick={handleFitToScreen}
              iconProps={{ iconName: "BackToWindow" }}
              subtle={true}
            />
          </Tooltip>
          <Tooltip text="Export as Image">
            <Button
              onClick={handleExportImage}
              iconProps={{ iconName: "Save" }}
              subtle={true}
            />
          </Tooltip>
          <Tooltip text="Print Diagram">
            <Button
              onClick={handlePrintGraph}
              iconProps={{ iconName: "Print" }}
              subtle={true}
            />
          </Tooltip>
        </ButtonGroup>
      </div>
      
      <div 
        ref={containerRef}
        className="graph-container"
        style={{ 
          width: '100%', 
          height: 'calc(100% - 48px)', // Account for toolbar height
          position: 'relative',
          border: '1px solid #d1d7dc',
          minHeight: '400px', // Ensure minimum height
          backgroundColor: '#ffffff' // Clean white background
        }}
      >
        {isLoading && (
          <div className="graph-loading" style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)' 
          }}>
            Loading state diagram...
          </div>
        )}
        {!isLoading && !workItemType && (
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            color: '#666'
          }}>
            Select a work item type to view its state diagram
          </div>
        )}
      </div>
    </div>
  );
};

export default StateGraph;