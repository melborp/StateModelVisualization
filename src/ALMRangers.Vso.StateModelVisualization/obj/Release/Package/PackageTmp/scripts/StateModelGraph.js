function StateModelGraph(data, container) {
    this.data = data;
    this.container = container;
}

StateModelGraph.prototype.create = function() {

        this.container.cytoscape({
            style: cytoscape.stylesheet()
                .selector('node')
                .css({
                    'content': 'data(name)',
                    'text-valign': 'center',
                    'color': 'black',
                    'width': '25px',
                    'height': '25px',
                    //'text-outline-width': 2,
                    //'text-outline-color': '#888',
                    'background-color': 'rgba(254,199,0,1)',
                    //'background':'rgba(254,199,0,1)',
                    //'background':'-moz-linear-gradient(top, rgba(254,199,0,1) 0%, rgba(255,162,0,1) 100%)',
                    //'background':'-webkit-gradient(left top, left bottom, color-stop(0%, rgba(254,199,0,1)), color-stop(100%, rgba(255,162,0,1)))',
                    //'background':'-webkit-linear-gradient(top, rgba(254,199,0,1) 0%, rgba(255,162,0,1) 100%)',
                    //'background':'-o-linear-gradient(top, rgba(254,199,0,1) 0%, rgba(255,162,0,1) 100%)',
                    //'background':'-ms-linear-gradient(top, rgba(254,199,0,1) 0%, rgba(255,162,0,1) 100%)',
                    //'background':'linear-gradient(to bottom, rgba(254,199,0,1) 0%, rgba(255,162,0,1) 100%)',       
                    'border-color': 'black',
                    'border-width':'0.25px',
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
                nodes: this.data.nodes,
                edges: this.data.edges
            },

            layout: {
                name: 'preset'
                //,positions: data.positions
            },

            // on graph initial layout done (could be async depending on layout...)
            ready: function() {
                window.cy = this;

                // giddy up...
                cy.zoom(3);
                cy.center();

                cy.minZoom(0.2);
                cy.maxZoom(10);
                cy.elements().unselectify();
                cy.userZoomingEnabled(false);
            }
        });
    }
