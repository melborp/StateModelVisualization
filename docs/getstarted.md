# Getting Started with State Model Visualization

Welcome to the State Model Visualization extension! This guide will walk you through all the features and help you create beautiful state diagrams for your Azure DevOps work item types.

## 🚀 Quick Start: Two Ways to Access

### Method 1: From the Main Hub
1. **Navigate to Boards** → **State Visualizer** in your Azure DevOps project
2. Browse and select any work item type from the tree view
3. The state diagram will automatically load with the recommended layout

### Method 2: From a Work Item  
1. Open any work item in Azure DevOps
2. Click the **"..."** (more actions) button in the toolbar
3. Select **"State Diagram"** from the dropdown menu
4. The diagram opens in a full-screen dialog with the work item's type pre-selected

---

## 📊 Understanding Your State Diagram

Once your diagram loads, you'll see:
- **🟢 Green circle** = Initial state (where work items start)
- **Yellow circles** = Other states in the workflow  
- **➡️ Arrows** = Valid transitions between states
- **Labels** = State names

---

## 🎨 Choosing the Perfect Layout

The extension offers three layout algorithms, each optimized for different scenarios:

### 1. **Breadthfirst** (Recommended for most cases)
- **Best for**: Simple workflows with clear progression
- **Layout**: Organized in levels from initial state outward
- **When to use**: Most work item types, especially linear workflows

### 2. **Dagre** (Best for complex workflows)
- **Best for**: Complex workflows with many states and transitions
- **Layout**: Hierarchical with smart node positioning
- **When to use**: Work item types with hub states or complex branching

### 3. **Concentric** (Best for hub-based workflows)
- **Best for**: Workflows with central "hub" states
- **Layout**: Important states in center, others arranged in circles
- **When to use**: Work item types where certain states connect to many others

### How to Switch Layouts:
1. Look for the **"Layout Algorithm"** dropdown in the toolbar
2. Click to see all three options with smart recommendations
3. Select any algorithm - the diagram updates instantly!

---

## ✋ Manual Node Positioning

Sometimes you need to customize the layout for documentation or clarity:

### Moving Nodes:
1. **Click and hold** any state node (circle)
2. **Drag** it to your desired position
3. **Release** to place the node
4. Other nodes and connections automatically adjust

### Tips for Better Layouts:
- **Spread out crowded areas** by dragging nodes apart
- **Align related states** vertically or horizontally  
- **Position important states** prominently for documentation
- **Create clear paths** by arranging states in logical flows

---

## 🔍 Navigation and Viewing

### Zoom Controls:
- **Zoom In**: Click the **🔍+** button or mouse wheel up
- **Zoom Out**: Click the **🔍-** button or mouse wheel down  
- **Fit to Screen**: Click the **🪟** button to see the entire diagram

### Mouse Navigation:
- **Pan**: Click and drag on empty space to move the view
- **Zoom**: Use mouse wheel to zoom in/out at cursor position

---

## 📤 Export and Print

### Export as PNG Image:
1. **Arrange your diagram** - Move nodes to optimal positions
2. Click the **📤 Export** button in the toolbar
3. The PNG file automatically saves to your Downloads folder

### Print Diagram:
1. **Perfect your layout** - Position nodes for best print appearance
2. Click the **🖨️ Print** button in the toolbar  
3. **Print dialog opens** with optimized formatting
4. **Tip**: Use landscape orientation for wider diagrams

### Best Practices for Export/Print:
- **Position nodes clearly** - Avoid overlapping labels
- **Use appropriate zoom** - Not too cramped, not too spread out
- **Consider your audience** - Arrange for easy reading
- **Test different layouts** - Try algorithms before manual adjustments

---

**Need help?** [Report issues on GitHub](https://github.com/melborp/StateModelVisualization/issues).

**Happy diagramming!** 🎨✨