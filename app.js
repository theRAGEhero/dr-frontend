document.addEventListener('DOMContentLoaded', function() {
    var id = document.getElementById("drawflow");
    const editor = new Drawflow(id);
    editor.start();

    // Enable drag and drop of nodes
    var dragNodes = document.querySelectorAll('.drag-node');
    dragNodes.forEach(function(dragNode) {
        dragNode.addEventListener('dragstart', function(event) {
            event.dataTransfer.setData('text/plain', event.target.dataset.node);
        });
    });

    // Handle node drop in drawflow
    id.addEventListener('dragover', function(event) {
        event.preventDefault();
    });

    id.addEventListener('drop', function(event) {
        event.preventDefault();
        var nodeType = event.dataTransfer.getData('text/plain');
        var rect = event.target.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;

        // Add node based on type
        switch(nodeType) {
            case 'input':
                editor.addNode('input', 0, 1, x, y, 'input-node', {}, 'Input Node');
                break;
            case 'process':
                editor.addNode('process', 1, 1, x, y, 'process-node', {}, 'Process Node');
                break;
            case 'output':
                editor.addNode('output', 1, 0, x, y, 'output-node', {}, 'Output Node');
                break;
        }
    });

    // Optional: Add some events
    editor.on('nodeCreated', function(id) {
        console.log("Node created: " + id);
    });

    editor.on('connectionCreated', function(connection) {
        console.log("Connection created", connection);
    });
});
