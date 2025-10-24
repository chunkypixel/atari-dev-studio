"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerialBase = void 0;
class SerialBase {
    constructor(id, name, folderOrPath) {
        this.FolderOrPath = "";
        this.FileName = "";
        this.Id = id;
        this.Name = name;
        this.FolderOrPath = folderOrPath;
    }
    SendGameAsync(fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            // Set
            this.FileName = fileName;
            // Process
            return yield this.ExecuteSerialAsync();
        });
    }
    InitialiseAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:SerialBase.InitialiseAsync');
            // Configuration
            return yield this.LoadConfigurationAsync();
        });
    }
    LoadConfigurationAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:SerialBase.LoadConfigurationAsync');
            // Result
            return true;
        });
    }
}
exports.SerialBase = SerialBase;
//# sourceMappingURL=serialBase.js.map