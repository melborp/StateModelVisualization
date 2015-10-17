/*---------------------------------------------------------------------
// <copyright file="StateModelVisualization.js">
//    This code is licensed under the MIT License.
//    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF 
//    ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
//    TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
//    PARTICULAR PURPOSE AND NONINFRINGEMENT.
// </copyright>
 // <summary>
 //   Part of the State Model Visualization VSO extension by the
 //     ALM Rangers. The main application flow and logic.
 //  </summary>
//---------------------------------------------------------------------*/

define(["require", "exports", "VSS/Controls", "VSS/Controls/TreeView", "VSS/Controls/Menus", "VSS/Controls/Common", "VSS/Service", "TFS/WorkItemTracking/RestClient",
        "Scripts/App/MainMenu", "Scripts/App/StateModelGraph"],
    function (require, exports, Controls, TreeView, Menus, ControlsCommon, VssService, TfsWitRest, MainMenu, StateModelGraph) {
    var StateModelVisualization = (function() {

        var treeView;
        var allWits;
        var graph;
        var mainMenu;

        function StateModelVisualization() {
        }

        StateModelVisualization.prototype.start = function() {
            var self = this;
            var context = VSS.getWebContext();

            mainMenu = Controls.Enhancement.enhance(MainMenu.ItemsView, $(".hub-view"), {});
            graph = StateModelGraph.graph;

            // Get a WIT client to make REST calls to VSO 
            var witClient = VssService.getCollectionClient(TfsWitRest.WorkItemTrackingHttpClient);

            witClient.getWorkItemTypes(context.project.name).then(function(wits) {
                allWits = wits;

                var treeContainer = $(".work-item-type-tree-container");

                function convertToTreeNodes(items) {
                    return $.map(items, function(item) {
                        var node = new TreeView.TreeNode(item.name);
                        node.expanded = true;
                        if (item.children && item.children.length > 0) {
                            node.addRange(convertToTreeNodes(item.children));
                        }
                        return node;
                    });
                }

                var treeViewOptions = { nodes: convertToTreeNodes(wits) };
                treeView = Controls.create(TreeView.TreeView, treeContainer, treeViewOptions);

                // Attach selectionchanged event using a DOM element containing treeview
                treeContainer.bind("selectionchanged", function(e, args) {
                    treeView.TreeNode = args.selectedNode;
                    var selectedNode = args.selectedNode;
                    if (selectedNode) {
                        var data = graph.prepareVisualizationData(selectedNode.text, allWits);
                        graph.create(selectedNode.text, data);
                    }
                });
                
                //show first WIT as default
                var data = graph.prepareVisualizationData(wits[0].name, allWits);
                graph.create(wits[0].name, data);
                treeView.TreeNode = treeViewOptions.nodes[0];
                mainMenu.EnableToolbar();
                $(window).on("resize", graph.resize);
            });
        }
        return StateModelVisualization;
    })();

    exports.smv = new StateModelVisualization();
});