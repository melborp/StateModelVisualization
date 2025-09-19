# State Model Visualization Extension - TODO

## Completed ✅
1. **Export functionality** - PNG export and print dialog
2. **Enhanced rendering** - Smart initial state positioning and layout algorithms  
3. **Hub UI improvements** - Better spacing, responsive design, Azure DevOps UI components
4. **Legacy cleanup** - Removed old folders and code
5. **Bug fixes** - Fixed work item selection hover states

## Remaining Tasks

### 6. **Apply Azure DevOps theming** 🎨
**Scope**: Use Azure DevOps design system colors and components throughout
**Status**: Not Started

### 7. **Filter disabled work item types** 🔍  
**Scope**: Hide disabled work item types by default with opt-in toggle
**API**: `WorkItemType.isDisabled`
**Status**: Not Started

### 8. **Use state colors and categories** 🎨
**Scope**: Apply official state colors to diagram nodes
**API**: `WorkItemStateColor` interface
**Status**: Not Started

### 9. **Display work item type icons and colors** 🎯
**Scope**: Show work item type icons/colors in tree and diagrams
**API**: `WorkItemType.icon` and `WorkItemType.color`
**Status**: Not Started

### 10. **Show transition actions and reasons** ⚡
**Scope**: Display transition requirements on edges or tooltips
**API**: `WorkItemStateTransition.actions`
**Status**: Not Started

### 11. **Add CI/CD pipeline** ⚙️
**Scope**: GitHub Actions for build, package, and publish
**Status**: Not Started

## Additional Tasks
- Callout for Azure DevOps Server feedback - using latest versions of things, unsure
- Callout for trying v2 in azure devops service
- Link to State Visualization Extension v1.3.8 which wont get more updates
- New demo video for the extension
- Update overview.md 
- Cleanup files that arent used by extension anymore e.g. images, css
- Remove UpgradePlan.md

---

**References**: 
- [WorkItemType API](https://learn.microsoft.com/en-us/javascript/api/azure-devops-extension-api/workitemtype)
- [WorkItemStateColor API](https://learn.microsoft.com/en-us/javascript/api/azure-devops-extension-api/workitemstatecolor)
- [WorkItemStateTransition API](https://learn.microsoft.com/en-us/javascript/api/azure-devops-extension-api/workitemstatetransition)