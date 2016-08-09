## Visualize work item type states and transitions##

[![Demo](images/wvizdemo.png)](https://channel9.msdn.com/Series/Visual-Studio-ALM-Rangers-Demos/VS-Team-Services-State-Model-Visualization-Extension) Every work item type in Visual Studio Team Services has a states, transitions and reasons defined. With this extension you can visualize those states and transitions for regular and hidden work item types.

![Visualize](images/Screen1-small.png)

### Export for offline viewing ###

Export your chart visualization for offline viewing or printing.

![Export](images/Screen2-small.png)

## Quick steps to get started ##

- **Visualize**
	1. Navigate to your team project.
	1. Select **WORK** hub group.
	1. Navigate to a **State Visualizer** hub.
	1. Use the left tree view to select work item type and the states and transitions are visualized on the right side.
	1. Click on `Zoom In`, `Zoom Out`, `Zoom to original size` or `Fit To icons` on the toolbar to re-size.
- **State Diagram from Work Item**
	1. Open any work item
		- If you are using the classic WI item form, select `State Diagram` on the toolbar.
		- Otherwise click on `...` and select `State Diagram`.
		- State Diagram Visualization dialog will open up for the selected work item type.
- **Export**
	1. Export the visualization in any browser.


## Planned features ##

- Showing reasons for transitions.


## Feedback ##

If you like this extension, please leave a review and feedback. If you'd have suggestions or an issue, please [file an issue to give me a chance to fix it](https://github.com/melborp/StateModelVisualization/issues).

## Release History ##

### v1.3 ###

- **Bug fixes**

	1. Fixed issue with exporting visualization on TFS on-premis (#12)
	1. Fixed issue where Fit To Screen didnt quite fit (#11)
    1. Moved extension to Plan and Track category, added application insight, upgraded VSS SDK (#14, #10, #8)
    1. Fixed script paths to be same everywhere (case sensitive in CDN) (#7)

## Learn more ##

The source to this extension is available on GitHub: [StateModelVisualization](https://github.com/melborp/StateModelVisualization). 

To learn more about developing an extension for Visual Studio Team Services, see the [overview of extensions](https://www.visualstudio.com/en-us/integrate/extensions/overview).

[Third Party Notice](https://marketplace.visualstudio.com/_apis/public/gallery/publisher/taavi-koosaar/extension/StateModelVisualization/latest/assetbyname/ThirdPartyNotice.txt).
