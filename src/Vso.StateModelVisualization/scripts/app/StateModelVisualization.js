/*---------------------------------------------------------------------
// <copyright file="StateModelVisualization.js">
//    This code is licensed under the MIT License.
//    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF 
//    ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
//    TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
//    PARTICULAR PURPOSE AND NONINFRINGEMENT.
// </copyright>
 // <summary>
 //   Part of the State Model Visualization VSTS extension.
 //   The main application flow and logic.
 //  </summary>
//---------------------------------------------------------------------*/

define(["require", "exports", "VSS/Controls", "VSS/Controls/TreeView", "VSS/Controls/Menus", "VSS/Controls/Common", "VSS/Service", "TFS/WorkItemTracking/RestClient",
        "Scripts/App/MainMenu", "Scripts/App/StateModelGraph"],
    function (require, exports, Controls, TreeView, Menus, ControlsCommon, VssService, TfsWitRest, MainMenu, StateModelGraph) {
    var StateModelVisualization = (function() {

        var treeView;
        var allWits;
        var allCategories;
        var graph;
        var mainMenu;

        function StateModelVisualization() {
        }

        StateModelVisualization.prototype.start = function() {
            var self = this;
            var context = VSS.getWebContext();

            mainMenu = Controls.Enhancement.enhance(MainMenu.ItemsView, $(".hub-view"), {});
            graph = StateModelGraph.graph;

            // Get a WIT client to make REST calls to VSTS 
            var witClient = VssService.getCollectionClient(TfsWitRest.WorkItemTrackingHttpClient);

            witClient.getWorkItemTypes(context.project.name).then(function(wits) {
                witClient.getWorkItemTypeCategory(context.project.name).then(function (categories) {
                    allWits = wits;
                    allCategories = categories;

                    var hiddenCategory = categories.value.filter(function (category) { return category.referenceName === "Microsoft.HiddenCategory"; })[0];

                    var treeContainer = $(".work-item-type-tree-container");
                    var firstNode;

                    function convertToTreeNodes(items) {
                        var workItems = new TreeView.TreeNode("Work Items");
                        workItems.expanded = true;
                        var hiddenWorkItems = new TreeView.TreeNode("Hidden Work Items");
                        hiddenWorkItems.expanded = true;

                        items.forEach(function(item) {
                            var node = new TreeView.TreeNode(item.name);
                            //default root
                            var root = workItems;

                            //double loop, not the best, but simplest. 8 items in hidden category.
                            for (var i = 0; i < hiddenCategory.workItemTypes.length; i++) {
                                if (hiddenCategory.workItemTypes[i].name === item.name) {
                                    root = hiddenWorkItems;
                                    break;
                                }
                            }

                            root.add(node);
                            if (item.name === wits[0].name) {
                                firstNode = node;
                            }
                        });

                        var sortChildren = function(a, b) {
                            if (a.text > b.text) {
                                return 1;
                            }
                            if (a.text < b.text) {
                                return -1;
                            }
                            // a must be equal to b
                            return 0;
                        };

                        workItems.children.sort(sortChildren);
                        hiddenWorkItems.children.sort(sortChildren);

                        var result = new Array();
                        result.push(workItems);
                        result.push(hiddenWorkItems);
                        return result;
                    }

                    var treeViewOptions = { nodes: convertToTreeNodes(wits) };
                    treeView = Controls.create(TreeView.TreeView, treeContainer, treeViewOptions);

                    var afterGraphReady = function(callbackData) {
                        var data = graph.prepareVisualizationData(callbackData.name, allWits);
                        for (var i = 0; i < data.length; i++) {
                            graph.addElements(data[i]);
                        }
                    }

                    // Attach selectionchanged event using a DOM element containing treeview
                    treeContainer.bind("selectionchanged", function(e, args) {
                        treeView.TreeNode = args.selectedNode;
                        var selectedNode = args.selectedNode;
                        if (selectedNode && selectedNode.text !== "Work Items" && selectedNode.text !== "Hidden Work Items") {
                            graph.create(selectedNode.text, afterGraphReady, { name: selectedNode.text });
                        }
                    });

                    //show first WIT as default
                    graph.create(wits[0].name, afterGraphReady, { name: wits[0].name });

                    //select treenode
                    treeView.TreeNode = firstNode;
                    //activate toolbar
                    mainMenu.EnableToolbar();
                    //hookup resize with cytoscape
                    $(window).on("resize", graph.resize);
                });
            });
        }
        return StateModelVisualization;
    })();

    exports.smv = new StateModelVisualization();
});