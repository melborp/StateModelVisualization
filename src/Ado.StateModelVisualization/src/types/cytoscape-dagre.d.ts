declare module 'cytoscape-dagre' {
  import { Core, Ext } from 'cytoscape';
  
  interface DagreLayoutOptions {
    name: 'dagre';
    rankDir?: 'TB' | 'BT' | 'LR' | 'RL';
    align?: 'UL' | 'UR' | 'DL' | 'DR';
    nodeSep?: number;
    edgeSep?: number;
    rankSep?: number;
    marginX?: number;
    marginY?: number;
    acyclicer?: 'greedy' | undefined;
    ranker?: 'network-simplex' | 'tight-tree' | 'longest-path';
    padding?: number;
  }

  function cytoscapeDagre(cytoscape: any, dagre: any): void;

  export = cytoscapeDagre;
}

declare module 'cytoscape' {
  interface LayoutOptions extends DagreLayoutOptions {}
}