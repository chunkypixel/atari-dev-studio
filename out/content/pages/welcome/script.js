(function () {
    // Access vscode
    const vscode = acquireVsCodeApi();

    // Capture all command elements on page
    let commandElements = document.querySelectorAll("#command");
    commandElements.forEach(function(e) {
        e.addEventListener('click', _postCommand);
    });

    // Disable popup menu
    // NOTE: Doesn't work
    //window.addEventListener("contextmenu", e => e.preventDefault());

    // Post back to vscode
    function _postCommand() {
        var command = this.dataset.command;
        vscode.postMessage({command: command});
        //alert(command);
    }

}());