/*---------------------------------------------------------------------
// <copyright file="StateModelGraph.js">
//    This code is licensed under the MIT License.
//    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF 
//    ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
//    TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
//    PARTICULAR PURPOSE AND NONINFRINGEMENT.
// </copyright>
 // <summary>
 //   Part of the State Model Visualization VSO extension by the
 //     ALM Rangers.  This file defines the State Model Graph logic tied to Cytoscape.js.
 //  </summary>
//---------------------------------------------------------------------*/

define(["require", "exports"], function (require, exports) {
    var StateModelGraph = (function() {

        var zoomStepSize = 0.1;
        var zoom100 = 2.5;

        function StateModelGraph(container, cytoscape) {
            this.container = container;
            this.cy = null;
            this.currentWitType = "";
            this.cytoscape = cytoscape;
        }

        StateModelGraph.prototype.create = function(witTypeName, data) {
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
                        'width': '25px',
                        'height': '25px',
                        'background-color': 'rgba(254,199,0,1)',    
                        'border-color': 'black',
                        'border-width': '0.25px',
                        'font-size': '5px',
                        'font-family': 'Segoe UI'
                    })
                    .selector('node#Initial')
                    .css({
                        'width': '3px',
                        'height': '3px'
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
                //.selector('.faded')
                //  .css({
                //      'opacity': 0.25,
                //      'text-opacity': 0
                //  }),

                elements: {
                    nodes: data.nodes,
                    edges: data.edges
                },

                layout: {
                    name: 'preset'
                    //,positions: data.positions
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

                    //$(window).on("resize", resizeGraphViewport);
                }
            });
        }

        StateModelGraph.prototype.fitTo = function () {
            this.cy.fit();
        }

        StateModelGraph.prototype.zoomIn = function () {
            var currentZoom = this.cy.zoom();
            this.cy.zoom(currentZoom + zoomStepSize);
        }

        StateModelGraph.prototype.zoomOut = function () {
            var currentZoom = this.cy.zoom();
            this.cy.zoom(currentZoom - zoomStepSize);
        }

        StateModelGraph.prototype.zoomTo100 = function () {
            this.cy.zoom(zoom100);
        }
        StateModelGraph.prototype.exportImage = function () {
            var self = this;
            var png64 = self.cy.png({ full: true });
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
                var nodes = new Array();
                var edges = new Array();
                var newState;


                for (state in selectedWit.transitions) {
                    if (state === "") {
                        newState = state;
                    }
                    states.push(state);
                }
                var stateCount = states.length;
                var currentX = 150, currentY = 125;//default placement on 3rd row and in case state count 2 or 3, place in one line.
                var initialX = 150; //default, where state count is 2 or 3 (initial + new + done)

                if ((stateCount - 2) > 1) {
                    initialX = ((stateCount - 2) * 100) / 2;
                    currentX = 50;
                }

                for (state in selectedWit.transitions) {
                    var newNode;
                    if (state === "") {
                        newNode = { data: { id: 'Initial', name: '' }, position: { x: initialX, y: 0 } };
                    } else {
                        var position = { x: currentX, y: currentY };
                        //Where the state is the state that starts from Initial, position it close to initial
                        if (state === selectedWit.transitions[newState][0].to) {
                            position = { x: initialX, y: 50 };
                        } else {
                            currentX += 100;
                        }

                        newNode = { data: { id: state, name: state }, position: position };
                    }

                    nodes.push(newNode);

                    var transitions = selectedWit.transitions[state];

                    for (var j = 0; j < transitions.length; j++) {
                        if (newNode.data.id === transitions[j].to)
                            continue;
                        //Check if the TO state is the State array, sometimes there's TO transitions into states that dont exist. not sure why.
                        if ($.inArray(transitions[j].to, states) === -1)
                            continue;

                        var edge = { data: { source: newNode.data.id, target: transitions[j].to } };
                        edges.push(edge);
                    }
                }
                var data = { nodes: nodes, edges: edges };
                return data;
        }
        
        return StateModelGraph;
    })();
    exports.graph = new StateModelGraph($("#cy"), cytoscape);
});