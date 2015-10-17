var prepareVisualization = function(witName, allWits) {
    var selectedWit;
    //Find the selected wit
    for (var i = 0; i < allWits.length; i++) {
        if (allWits[i].name === witName) {
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
}; // on dom ready

var showGraph = function(data) {
    ////destroy the previous graph and unbind events
    //destroyGraph();
    unbindToolbarEvents();

    var container = $('#cy');
    var smv = new StateModelGraph(data, container);
    smv.create();
    bindToolbarEvents();
}

var bindToolbarEvents = function () {
    //Zoom in by one step
    $(".toolbar").on("click", "#ZoomIn", zoomInGraph);

    //Fit the diagram to the full screen
    $(".toolbar").on("click", "#FitTo",fitToGraph);

    //Zoom out by one step
    $(".toolbar").on("click", "#ZoomOut", zoomOutGraph);

    $(window).on("resize", resizeGraphViewport);

    if ($("#ZoomIn").hasClass("disabled")) {
        $("#ZoomIn").toggleClass("disabled");
        $("#ZoomOut").toggleClass("disabled");
        $("#FitTo").toggleClass("disabled");
    }
}

var unbindToolbarEvents = function() {
    //Zoom in by one step
    $(".toolbar").off("click", "#ZoomIn", zoomInGraph);

    //Fit the diagram to the full screen
    $(".toolbar").off("click", "#FitTo", fitToGraph);

    //Zoom out by one step
    $(".toolbar").off("click", "#ZoomOut", zoomOutGraph);

    $(window).off("resize", resizeGraphViewport);
}

var zoomInGraph = function(e) {
    e.preventDefault();
    if (!$("#ZoomIn").hasClass("disabled")) {
        var currentZoom = window.cy.zoom();
        window.cy.zoom(currentZoom + 0.2);
        window.cy.center();
    }
}

var zoomOutGraph = function(e) {
    e.preventDefault();
    if (!$("#ZoomOut").hasClass("disabled")) {
        var currentZoom = window.cy.zoom();
        window.cy.zoom(currentZoom - 0.2);
        window.cy.center();
    }
}

var fitToGraph = function(e) {
    e.preventDefault();
    if (!$("#FitTo").hasClass("disabled")) {
        window.cy.zoom(3);
        window.cy.center();
    }
}

var resizeGraphViewport = function(e) {
    e.preventDefault();
    window.cy.resize();
    window.cy.center();
}

var destroyGraph = function() {
    if (window.cy != undefined && window.cy != null) {
        window.cy.destroy();
        unbindToolbarEvents();
    }
}

var showTestGraph = function () {
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
    var container = $('#cy');
    var smv = new StateModelGraph(data, container);
    smv.create();
}