let editor;

document.addEventListener('DOMContentLoaded', function() {
    var id = document.getElementById("drawflow");
    editor = new Drawflow(id);
    editor.reroute = true;
    editor.start();

    // Drag and drop functionality
    var dragNodes = document.querySelectorAll('.drag-drawflow');
    dragNodes.forEach(function(dragNode) {
        dragNode.addEventListener('dragstart', function(event) {
            event.dataTransfer.setData('text/plain', event.target.dataset.node || event.target.closest('.drag-drawflow').dataset.node);
        });
    });

    id.addEventListener('dragover', function(event) {
        event.preventDefault();
    });

    id.addEventListener('drop', function(event) {
        event.preventDefault();
        var nodeType = event.dataTransfer.getData('text/plain');
        var rect = id.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;

        // Add node based on type
        switch(nodeType) {
            case 'slack':
                editor.addNode('slack', 1, 1, x, y, 'slack', {}, '<div><div class="title-box"><i class="fab fa-slack"></i> Slack chat message</div></div>');
                break;
            case 'telegram':
                editor.addNode('telegram', 1, 1, x, y, 'telegram', {channel: 'channel_2'}, `
                    <div>
                        <div class="title-box"><i class="fab fa-telegram-plane"></i> Telegram bot</div>
                        <div class="box">
                            <p>Send to telegram</p>
                            <p>select channel</p>
                            <select df-channel>
                                <option value="channel_1">Channel 1</option>
                                <option value="channel_2">Channel 2</option>
                                <option value="channel_3">Channel 3</option>
                                <option value="channel_4">Channel 4</option>
                            </select>
                        </div>
                    </div>
                `);
                break;
            case 'email':
                editor.addNode('email', 1, 1, x, y, 'email', {}, '<div><div class="title-box"><i class="fas fa-at"></i> Send Email </div></div>');
                break;
            case 'github':
                editor.addNode('github', 1, 1, x, y, 'github', {name: 'https://github.com/jerosoler/Drawflow'}, `
                    <div>
                        <div class="title-box"><i class="fab fa-github"></i> Github Stars</div>
                        <div class="box">
                            <p>Enter repository url</p>
                            <input type="text" df-name>
                        </div>
                    </div>
                `);
                break;
            case 'facebook':
                editor.addNode('facebook', 1, 1, x, y, 'facebook', {}, '<div><div class="title-box"><i class="fab fa-facebook"></i> Facebook Message</div></div>');
                break;
            case 'log':
                editor.addNode('log', 1, 1, x, y, 'log', {}, '<div><div class="title-box"><i class="fas fa-file-signature"></i> Save log file </div></div>');
                break;
            case 'template':
                editor.addNode('template', 1, 1, x, y, 'template', {template: 'Write your template'}, `
                    <div>
                        <div class="title-box"><i class="fas fa-code"></i> Template</div>
                        <div class="box">
                            Ger Vars
                            <textarea df-template></textarea>
                            Output template with vars
                        </div>
                    </div>
                `);
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

function changeModule(event) {
    var elements = document.getElementsByClassName('menu')[0].getElementsByTagName('li');
    for (var i = 0; i < elements.length; i++) {
        elements[i].classList.remove('selected');
    }
    event.target.classList.add('selected');
}

function changeMode(mode) {
    if (mode === 'lock') {
        document.getElementById('lock').style.display = 'none';
        document.getElementById('unlock').style.display = 'block';
    } else {
        document.getElementById('lock').style.display = 'block';
        document.getElementById('unlock').style.display = 'none';
    }
}

function exportFlow() {
    var exportData = editor.export();
    console.log('Exported Flow:', exportData);
    Swal.fire({
        title: 'Export',
        html: '<pre><code>'+JSON.stringify(exportData, null, 4)+'</code></pre>'
    });
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
