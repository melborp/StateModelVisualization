# State Model Visualization Extension for Azure DevOps

## Overview
Modern Azure DevOps extension to visualize work item type state transitions and workflows in interactive diagrams. Built with React, TypeScript, and modern Azure DevOps APIs.

**📦 [Install from Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=taavi-koosaar.StateModelVisualization)**

## Features
- **Interactive state diagrams** - Visualize work item state models with transitions
- **Multiple layout algorithms** - Choose between breadthfirst, concentric, and dagre layouts
- **Smart positioning** - Advanced node ranking system for optimal visual hierarchy
- **Manual repositioning** - Drag nodes to customize layout before exporting or printing
- **Export & print** - Save diagrams as PNG images or print via Azure DevOps dialog
- **Work item integration** - Access state diagrams directly from work item toolbar
- **Responsive design** - Clean, modern UI with Azure DevOps theming

## Version Information

### Current Version (v2.x)
This is the **modern version** built with:
- React 16.14 + TypeScript 4.9
- Azure DevOps Extension SDK 4.0
- Modern Azure DevOps UI components
- Advanced layout algorithms with node ranking

### Legacy Version (v1.3.8)
The legacy JavaScript version is available at [releases/v1.3.8](../../tree/releases/v1.3.8) branch.
- **⚠️ No longer maintained** - v1.3.8 will not receive updates
- **Deprecated** - Use v2.x for new installations

## Technology Stack
- React & TypeScript
- Azure DevOps Extension SDK & API
- Cytoscape.js with Dagre layout
- Azure DevOps UI components
- Webpack build system
