"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EmulatorBase {
    constructor(id, name, folderOrPath) {
        this.CustomFolderOrPath = false;
        this.FolderOrPath = "";
        this.Args = "";
        this.Id = id;
        this.Name = name;
        this.DefaultFolderOrPath = folderOrPath;
    }
    dispose() {
        console.log('debugger:EmulatorBase.dispose');
    }
}
exports.EmulatorBase = EmulatorBase;
//# sourceMappingURL=emulatorBase.js.map