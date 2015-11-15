/*---------------------------------------------------------------------
// <copyright file="StateModelGraph.js">
//    This code is licensed under the MIT License.
//    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF 
//    ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
//    TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
//    PARTICULAR PURPOSE AND NONINFRINGEMENT.
// </copyright>
 // <summary>
 //   Part of the State Model Visualization VSO extension.
 //   This file defines the State Model Graph logic tied to Cytoscape.js.
 //  </summary>
//---------------------------------------------------------------------*/

define(["require", "exports"], function (require, exports) {
    var StateModelGraph = (function() {

        var zoomStepSize = 0.1;
        var zoom100 = 1;

        function StateModelGraph(container, cytoscape) {
            this.container = container;
            this.cy = null;
            this.currentWitType = "";
            this.cytoscape = cytoscape;
        }

        StateModelGraph.prototype.create = function(witTypeName, callback, callbackData) {
            var self = this;
            self.currentWitType = witTypeName;
            self.cytoscape({
                container : self.container[0],
                style: self.cytoscape.stylesheet()
                    .selector('node')
                    .css({
                        'content': 'data(name)',
                        'text-valign': 'center',
                        'color': 'black',
                        'width': '75px',
                        'height': '75px',
                        'background-color': 'rgba(254,199,0,1)',    
                        'border-color': 'black',
                        'border-width': '0.25px',
                        'font-size': '12px',
                        'font-family': 'Segoe UI,Tahoma,Arial,Verdana'
                    })
                    .selector('node#Initial')
                    .css({
                        'width': '8px',
                        'height': '8px',
                        'background-color': '#000000',
                        'border-color': 'black',
                        'border-width': '0.25px',
                    })
                    .selector('edge')
                    .css({
                        'target-arrow-shape': 'triangle'
                    })
                    .selector(':selected')
                    .css({
                        'background-color': 'black',
                        'line-color': 'black',
                        'target-arrow-color': 'black',
                        'source-arrow-color': 'black'
                    }),

                layout: {
                    name: 'dagre',
                    fit: false,
                    rankDir: 'TB'
                },

                // on graph initial layout done (could be async depending on layout...)
                ready: function() {
                    window.cy = this;
                    self.cy = this;

                    // giddy up...
                    cy.zoom(zoom100);
                    cy.center();

                    cy.minZoom(zoomStepSize);
                    cy.maxZoom(10);
                    cy.elements().unselectify();
                    cy.userZoomingEnabled(false);

                    callback(callbackData);
                }
            });
        }

        StateModelGraph.prototype.fitTo = function () {
            this.cy.fit();
        }

        StateModelGraph.prototype.zoomIn = function () {
            var currentZoom = this.cy.zoom();
            this.cy.zoom(currentZoom + zoomStepSize);
            //this.cy.center();
        }

        StateModelGraph.prototype.zoomOut = function () {
            var currentZoom = this.cy.zoom();
            this.cy.zoom(currentZoom - zoomStepSize);
            //this.cy.center();
        }

        StateModelGraph.prototype.zoomTo100 = function () {
            this.cy.zoom(zoom100);
            //this.cy.center();
        }
        StateModelGraph.prototype.exportImage = function () {
            var self = this;
            var png64 = self.cy.png({ full: true, scale : 2});
            return png64;
        }
        StateModelGraph.prototype.resize = function () {
            var self = this;
            if (self.cy == null)
                return;
            self.cy.resize();
        }

        StateModelGraph.prototype.getTestGrahpData = function() {
            var data = {
                nodes: [
                { data: { id: 'Initial', name: '' }, position: { x: 150, y: 0 } },
                { data: { id: 'a', name: 'To Do' }, position: { x: 150, y: 50 } },
                { data: { id: 'b', name: 'In Progress' }, position: { x: 75, y: 125 } },
                { data: { id: 'c', name: 'Done' }, position: { x: 150, y: 125 } },
                { data: { id: 'd', name: 'Removed' }, position: { x: 225, y: 125 } }
                ],
                edges: [
                    { data: { source: 'Initial', target: 'a' } },
                    { data: { source: 'a', target: 'b' } },
                    { data: { source: 'a', target: 'c' } },
                    { data: { source: 'a', target: 'd' } },
                    { data: { source: 'b', target: 'a' } },
                    { data: { source: 'b', target: 'c' } },
                    { data: { source: 'b', target: 'd' } },
                    { data: { source: 'c', target: 'a' } },
                    { data: { source: 'c', target: 'b' } },
                    { data: { source: 'd', target: 'a' } }
                ]
            };
            return data;
        }

        StateModelGraph.prototype.prepareVisualizationData = function(selectedWitName, allWits)
        {
                var selectedWit;
                //Find the selected wit
                for (var i = 0; i < allWits.length; i++) {
                    if (allWits[i].name === selectedWitName) {
                        selectedWit = allWits[i];
                    }
                }

                if (selectedWit == undefined)
                    return null;

                //Create nodes and edges for graph
                var states = new Array();

                var rank1Elements = new Array();
                var rank2Elements = new Array();
                var rank3Elements = new Array();
            
                var rankedArray = new Array();

                for (state in selectedWit.transitions) {
                    states.push(state);
                }

            var initialNodeId = 'Initial';
            var initialNodeTargetId;
            var nodes = new Array();
            for (state in selectedWit.transitions) {
                var newNode;
                if (state === "") {
                    newNode = { group: 'nodes', data: { id: initialNodeId, name: '' } };
                } else {
                    newNode = { group: 'nodes', data: { id: state, name: state } };
                }

                nodes.push(newNode);

                var transitions = selectedWit.transitions[state];

                for (var j = 0; j < transitions.length; j++) {
                    if (newNode.data.id === transitions[j].to)
                        continue;
                    //Check if the TO state is the State array, sometimes there's TO transitions into states that dont exist. not sure why.
                    if ($.inArray(transitions[j].to, states) === -1)
                        continue;

                    var edge = { group: 'edges', data: { id: newNode.data.id + "-" + transitions[j].to, source: newNode.data.id, target: transitions[j].to } };

                    if (newNode.data.id === initialNodeId) {
                        initialNodeTargetId = transitions[j].to;
                        rank2Elements.push(edge);//the edge connected to initial is ranked 2
                    } else {
                        rank3Elements.push(edge);//the other edges are ranked 3
                    }
                }
            }

            //rank nodes
            nodes.forEach(function(node) {
                if (node.data.id === "Initial") {
                    rank1Elements.push(node);
                }
                else if (initialNodeTargetId === node.data.id) {//the node connected to initial is ranked 2
                    rank2Elements.push(node);
                } else {
                    rank3Elements.push(node); //the other nodes are ranked 3
                }
            });

            rankedArray.push(rank1Elements);
            rankedArray.push(rank2Elements);
            rankedArray.push(rank3Elements);

            return rankedArray;
        }

        StateModelGraph.prototype.addElements = function (elements) {
            var self = this;
            var newElements = self.cy.collection();

            if (elements.length > 0) {
                newElements = self.cy.add(elements);
                self.refreshLayout();
            }
            return newElements;
        }

        StateModelGraph.prototype.refreshLayout = function () {
            var self = this;
            self.cy.layout(
                    {
                        name: 'dagre',
                        rankDir: 'TB',
                        //padding: 50,
                        fit: true,
                        minLen: 2,
                        stop: function () { self.zoomTo100(); }
                    });
        }
        
        return StateModelGraph;
    })();
    exports.graph = new StateModelGraph($("#cy"), cytoscape);
});