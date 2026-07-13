"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerialBase = void 0;
class SerialBase {
    Id;
    Name;
    FolderOrPath = "";
    FileName = "";
    constructor(id, name, folderOrPath) {
        this.Id = id;
        this.Name = name;
        this.FolderOrPath = folderOrPath;
    }
    async SendGameAsync(fileName) {
        // Set
        this.FileName = fileName;
        // Process
        return await this.ExecuteSerialAsync();
    }
    async InitialiseAsync() {
        console.log('debugger:SerialBase.InitialiseAsync');
        // Configuration
        return await this.LoadConfigurationAsync();
    }
    async LoadConfigurationAsync() {
        console.log('debugger:SerialBase.LoadConfigurationAsync');
        // Result
        return true;
    }
}
exports.SerialBase = SerialBase;
