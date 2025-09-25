# State Diagram Visualization Guide

## Overview
The State Model Visualization extension provides intelligent state diagram rendering with advanced node ranking and multiple layout algorithms to create clear, intuitive visualizations of Azure DevOps work item workflows.

## Node Ranking System

### Ranking Rules
The extension uses **Breadth-First Search (BFS)** to assign hierarchical ranks to states:

- **Rank 1**: Initial state (green dot) - workflow entry point
- **Rank 2**: Direct successors of initial state - first actual workflow states  
- **Rank 3+**: Subsequent levels based on shortest path from initial state
- **Special handling**: Self-transitions ignored, cycles broken by first-path-wins

### Hub Node Detection
States with >3 outgoing transitions are identified as "hub nodes" for special visual treatment, preventing edge clutter in complex workflows.

## Layout Algorithms

### 1. Breadth-First ⭐ **Recommended for Simple Flows**
- **Best for**: ≤6 states, linear workflows, sequential progressions
- **Behavior**: Hierarchical tree starting from initial state
- **Visual**: Clean top-to-bottom or left-to-right flow
- **Use when**: Simple state progressions, sequential workflows

### 2. Concentric ⭐ **Recommended for Complex Workflows**  
- **Best for**: >6 states, hub-and-spoke patterns, complex state machines
- **Behavior**: 
  - Initial state positioned outside on left as entry point
  - Direct successors on left side  
  - Remaining states in concentric circles based on rank
- **Visual**: Initial → First states → Concentric arrangement
- **Use when**: Complex workflows, multiple end states, hub patterns

### 3. Dagre **Traditional Algorithm**
- **Best for**: Complex directed graphs requiring sophisticated edge routing
- **Behavior**: Advanced graph layout with optimized edge positioning
- **Visual**: Traditional directed graph appearance
- **Use when**: Complex state machines, intricate transition patterns

## Smart Defaults

The extension automatically selects the optimal algorithm:
- **≤6 states**: Breadth-First (clean hierarchy)
- **>6 states**: Concentric (handles complexity better)

Users can override the default selection via the dropdown to experiment with different visualizations.

## Visual Design Principles

### Ranking-Based Positioning
- **Consistent hierarchy**: States at same logical distance appear at same visual level
- **Clear flow direction**: Visual progression matches logical state flow
- **Hub node management**: States with many transitions positioned to minimize clutter

### Algorithm-Specific Adaptations
- **Breadth-First**: Adapts spacing based on state count (tighter for ≤3 states)
- **Concentric**: Manual positioning for initial state and direct successors
- **Dagre**: Rank-aware constraints for consistent hierarchy

## Usage Guidelines

### Choose Breadth-First When:
- Simple, linear state progressions
- ≤6 total states
- Clear sequential workflow
- Need predictable, clean layout

### Choose Concentric When:
- Complex state machines (>6 states)
- Multiple parallel paths
- Hub-and-spoke patterns
- Many final states
- Want to emphasize workflow entry point

### Choose Dagre When:
- Complex transition patterns
- Need sophisticated edge routing
- Traditional graph appearance preferred
- Intricate state relationships

## Implementation Notes

- **Ranking calculation**: Performed once per work item type and cached
- **Layout switching**: Real-time algorithm changes without recalculation
- **State management**: User's algorithm choice persists across work item type changes
- **Performance**: Optimized for responsive layout switching