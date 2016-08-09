/*---------------------------------------------------------------------
// <copyright file="MainMenu.js">
//    This code is licensed under the MIT License.
//    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF
//    ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
//    TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
//    PARTICULAR PURPOSE AND NONINFRINGEMENT.
// </copyright>
// <summary>
//   Part of the State Model Visualization VSTS extension.
//   This class defines the MainMenu creation in the VSTS Hub.
//  </summary>
//---------------------------------------------------------------------*/

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

define(["require", "exports", "VSS/Utils/Core",
    "VSS/Controls", "VSS/Controls/Menus", "scripts/app/StateModelGraph", "scripts/app/TelemetryClient"],
    function (require, exports, Core, Controls, MenuControls, StateModelGraph, TelemetryClient) {

    var ItemsView = (function (_super) {
        __extends(ItemsView, _super);

        function ItemsView(options) {
            _super.call(this, options);
            this._menu = null;
            this._graph = StateModelGraph.graph;
        }


        /*
         *   Initialize will be called when this control is created.  This will setup the UI,
         *   attach to events, etc.
         */
        ItemsView.prototype.initialize = function () {
            _super.prototype.initialize.call(this);

            this._createToolbar();
        };

        ItemsView.prototype._createToolbar = function () {
            this._menu = Controls.BaseControl.createIn(MenuControls.MenuBar, this._element.find(".hub-pivot-toolbar"), {
                items: this._createToolbarItems()
            });
            MenuControls.menuManager.attachExecuteCommand(Core.delegate(this, this._onToolbarItemClick));
        };

        /*
         *  Create the actual toolbar items
         */
        ItemsView.prototype._createToolbarItems = function () {
            var items = [];

            items.push({ id: "zoom-in", text: "Zoom In", title: "Zoom In", showText: false, icon: "icon-zoom-in-smv", disabled: true });
            items.push({ id: "zoom-out", text: "Zoom Out", title: "Zoom Out", showText: false, icon: "icon-zoom-out-smv", disabled: true });
            items.push({ id: "zoom-100", text: "Zoom 100%", title: "Zoom to 100%", showText: false, icon: "icon-zoom-100-smv", disabled: true });
            items.push({ id: "fit-to", text: "Fit to screen", title: "Fit to screen", showText: false, icon: "icon-fit-to-smv", disabled: true });

            items.push({ separator: true });

            items.push({ id: "export-graph", text: "Export Graph", title: "Export Graph", showText: false, icon: "icon-export-smv", disabled: true });

            return items;
        };

        /*
         *  Fit the graph to the current window size
         */
        ItemsView.prototype._fitTo = function () {
            TelemetryClient.getClient().trackEvent("Menu.FitTo");
            if (!$("#fit-to").hasClass("disabled")) {
                this._graph.fitTo();
            }
        };

        /*
         *  Zoom the diagram in one unit
         */
        ItemsView.prototype._zoomIn = function () {
            TelemetryClient.getClient().trackEvent("Menu.ZoomIn");
            if (!$("#zoom-in").hasClass("disabled")) {
                this._graph.zoomIn();
            }
        };

        /*
         *  Zoom the diagram out one unit
         */
        ItemsView.prototype._zoomOut = function () {
            TelemetryClient.getClient().trackEvent("Menu.ZoomOut");
            if (!$("#zoom-out").hasClass("disabled")) {
                this._graph.zoomOut();
            }
        };

        /*
         *  Set the diagram to 100%
         */
        ItemsView.prototype._zoom100 = function () {
            TelemetryClient.getClient().trackEvent("Menu.ZoomTo100");
            if (!$("#zoom-100").hasClass("disabled")) {
                this._graph.zoomTo100();
            }
        };

        /*
         *  Handle a button click on the toolbar
         */
        ItemsView.prototype._onToolbarItemClick = function (sender, args) {
            var command = args.get_commandName(), commandArgument = args.get_commandArgument(), that = this, result = false;
            switch (command) {
                case "zoom-in":
                    this._zoomIn();
                    break;
                case "zoom-out":
                    this._zoomOut();
                    break;
                case "zoom-100":
                    this._zoom100();
                    break;
                case "fit-to":
                    this._fitTo();
                    break;
                case "export-graph":
                    this._exportGraph();
                    break;
                default:
                    result = true;
                    break;
            }
            return result;
        };

        ItemsView.prototype._exportGraph = function () {
            TelemetryClient.getClient().trackEvent("Menu.ExportGraph");
            var png = this._graph.exportImage();
            var self = this;

            VSS.getService(VSS.ServiceIds.Dialog).then(function (dlg) {
                var printGraphDialog;

                //TODO: later make dialog same size as window and offer full screen option
                var opts = {
                    width: window.screen.width,
                    height: window.screen.height,
                    title: "Export State Diagram Visualization",
                    buttons: null
                };

                dlg.openDialog(VSS.getExtensionContext().publisherId + "." + VSS.getExtensionContext().extensionId + ".state-diagram-visualization-print-graph-dialog", opts).then(function (dialog) {
                    dialog.getContributionInstance("state-diagram-visualization-print-graph-dialog").then(function (ci) {
                        printGraphDialog = ci;
                        printGraphDialog.start(png, self._graph.currentWitType);
                    }, function (err) {
                        alert(err.message);
                    });
                });
            });
        };

        /*
         *  Enables the toolbar menu items - to be called after the work item diagram is set initially
         */
        ItemsView.prototype.EnableToolbar = function() {
            this._menu.updateCommandStates([
                { id: "zoom-in", disabled: false },
                { id: "zoom-out", disabled: false },
                { id: "zoom-100", disabled: false },
                { id: "fit-to", disabled: false },
                { id: "export-graph", disabled: false }
            ]);
        }


        return ItemsView;
    })(Controls.BaseControl);
    exports.ItemsView = ItemsView;

    Controls.Enhancement.registerEnhancement(ItemsView, ".hub-view");
});