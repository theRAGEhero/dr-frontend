let editor;

document.addEventListener('DOMContentLoaded', function() {
    var id = document.getElementById("drawflow");
    editor = new Drawflow(id);
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
            case 'slack':
                editor.addNode('slack', 1, 1, x, y, 'slack-node', {
                    channel: 'Select Channel'
                }, 'Slack Chat Message');
                break;
            case 'telegram':
                editor.addNode('telegram', 1, 1, x, y, 'telegram-node', {
                    bot: 'Select Bot'
                }, 'Telegram Bot');
                break;
            case 'email':
                editor.addNode('email', 1, 1, x, y, 'email-node', {
                    template: 'Email Template'
                }, 'Send Email');
                break;
            case 'github':
                editor.addNode('github', 1, 1, x, y, 'github-node', {
                    repo: 'Enter Repository URL'
                }, 'Github Stars');
                break;
            case 'facebook':
                editor.addNode('facebook', 1, 1, x, y, 'facebook-node', {}, 'Facebook Message');
                break;
            case 'log':
                editor.addNode('log', 1, 0, x, y, 'log-node', {}, 'Save Log File');
                break;
        }
    });

    // Events
    editor.on('nodeCreated', function(id) {
        console.log("Node created: " + id);
    });

    editor.on('connectionCreated', function(connection) {
        console.log("Connection created", connection);
    });
});

function exportFlow() {
    var exportData = editor.export();
    console.log('Exported Flow:', exportData);
    alert('Flow exported to console. Check browser developer tools.');
}

function clearFlow() {
    editor.clear();
}

// Optional: Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Delete selected node with Delete key
    if (e.key === 'Delete') {
        editor.removeNodeSelected();
    }
});
