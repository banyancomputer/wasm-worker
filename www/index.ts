import { wrap } from 'comlink';
import { State, HashedFile  } from '../pkg/index.js';
import {  HashWorker } from "./worker";

const workerPath = './worker.js';
const fileInput = document.querySelector("#fileInput");
const errorElem = document.querySelector("#error");
const progressElem = document.querySelector("#progress");
const timeElem = document.querySelector("#time");
const resultElem = document.querySelector("#result");
const hashedFilesElem = document.querySelector("#hashedFiles");

class App {
    _state: State;
    _hasherWorkerApi: HashWorker;
    _taskIdCounter: number;
    constructor(hasherWorker: HashWorker) {
        this._state = new State();
        this._hasherWorkerApi = hasherWorker;
        this._taskIdCounter = 0;
        //@ts-ignore
        hashedFilesElem.textContent = 'Hashed files: ' + this._state.files().map((f: Module.HashedFile) => {
            let str = "NAME: " + f.name() + " HASH: " + f.hash(); 
            return str;
        }).join(' || \n\n ');
    }
    
    nextTask() {
        return ++this._taskIdCounter;
    }

    async taskProgress(taskId: number) {
        let res = this._hasherWorkerApi.taskTracker;
        return res.get(taskId) ?? 0.0;
    }
    
    // Hash a file and return a promise that resolves to a HashedFile
    // Associated with the taskId so we can track progress
    async hashFile(file: File, taskId: number): Promise<HashedFile> {
        return await this._hasherWorkerApi.hashFile(file, taskId)
    }

    async hashFileMt(file: File, taskId: number): Promise<HashedFile> {
        return await this._hasherWorkerApi.hashFileMt(file, taskId)
    }

    addFile(file: HashedFile) {
        this._state.addFile(file);
    }

    files() {
        return this._state.files();
    }

    clearState() {
        this._state.clear();
    }

    saveState() {
        this._state.save();
    }
}

(async () => {
    // await init();
    //@ts-ignore
    let handler = await wrap<HashWorker>(new Worker(workerPath)).handler;
    let hasherWorker = new HashWorker();
    let wasmHasher = new App(hasherWorker);
        
    // @ts-ignore
    document.querySelector("#clearStateButton").addEventListener("click", () => {
        wasmHasher.clearState();
        //@ts-ignore
        document.querySelector("#hashedFiles").textContent = 'Hashed files: ';

    });

    //@ts-ignore
    document.querySelector("#hashFileButton").addEventListener("click", () => {
        //@ts-ignore
        if (fileInput.files.length === 0) {
            //@ts-ignore
            errorElem.textContent = 'No file selected.';
            return;
        }

        //@ts-ignore
        const file = fileInput.files[0];

        let taskId = wasmHasher.nextTask(); 

        let interval = setInterval(() => {
            wasmHasher.taskProgress(taskId).then((res: any) => {
                //@ts-ignore
                progressElem.textContent = 'Progress: ' + res + '%';
            });
        }, 500);

        const now = performance.now();
        wasmHasher.hashFile(file, taskId).then((res: HashedFile) => {
            let time = performance.now() - now;
            //@ts-ignore
            timeElem.textContent = 'Time: ' + time + 'ms';
            //@ts-ignore
            resultElem.textContent = 'Hash completed: ' + res.hash();
            wasmHasher.addFile(res);
            wasmHasher.saveState();
            //@ts-ignore
            hashedFilesElem.textContent = 'Hashed files: ' + wasmHasher.files().map((f: Module.HashedFile) => {
                let str = "NAME: " + f.name() + " HASH: " + f.hash(); 
                return str;
            }).join(' || \n\n ');
        })
        .catch((err: any) => {
            //@ts-ignore
            errorElem.textContent = 'Hash failed: ' + err.message;
        })
        .finally(() => {
            //@ts-ignore
            progressElem.textContent = 'Progress: 100%'
            clearInterval(interval);
        });
    });

    //@ts-ignore
    document.querySelector("#hashFileMtButton").addEventListener("click", () => {
        //@ts-ignore
        if (fileInput.files.length === 0) {
            //@ts-ignore
            errorElem.textContent = 'No file selected.';
            return;
        }

        //@ts-ignore
        const file = fileInput.files[0];

        let taskId = wasmHasher.nextTask(); 

        let interval = setInterval(() => {
            wasmHasher.taskProgress(taskId).then((res: any) => {
                //@ts-ignore
                progressElem.textContent = 'Progress: ' + res + '%';
            });
        }, 500);

        const now = performance.now();
        wasmHasher.hashFileMt(file, taskId).then((res: HashedFile) => {
            const time = performance.now() - now;
            //@ts-ignore
            timeElem.textContent = 'Time: ' + time + 'ms';
            
            //@ts-ignore
            resultElem.textContent = 'Hash completed: ' + res.hash();
            wasmHasher.addFile(res);
            wasmHasher.saveState();
            //@ts-ignore
            hashedFilesElem.textContent = 'Hashed files: ' + wasmHasher.files().map((f: Module.HashedFile) => {
                let str = "NAME: " + f.name() + " HASH: " + f.hash(); 
                return str;
            }).join(' || \n\n ');
        })
        .catch((err: any) => {
            //@ts-ignore
            errorElem.textContent = 'Hash failed: ' + err.message;
        })
        .finally(() => {
            //@ts-ignore
            progressElem.textContent = 'Progress: 100%'
            clearInterval(interval);
        });
    });
})();