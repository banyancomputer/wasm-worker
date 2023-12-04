import { wrap } from 'comlink';
import * as Module from "../pkg";
import {  HashWorker } from "./worker";

const workerPath = './worker.js';
let hasherWorker: HashWorker | null = null;
let wasmHasher: App | null = null;
wrap<HashWorker>(new Worker(workerPath));
const initWorker = async () => {
    const _hasherWorker = new HashWorker();
    hasherWorker = _hasherWorker;
}

class App {
    _state: any;
    _hasherWorkerApi: HashWorker;
    _taskIdCounter: number;
    constructor() {
        this._state = new Module.State();
        this._hasherWorkerApi = hasherWorker as HashWorker;
        this._taskIdCounter = 0;
    }
    
    nextTask() {
        return ++this._taskIdCounter;
    }

    async taskProgress(taskId: number) {
        let res = await this._hasherWorkerApi.taskTracker;
        console.log(res);
        return res.get(taskId) ?? 0.0;
    }

    async hashFile(file: File, taskId: number): Promise<Module.HashedFile> {
        return await this._hasherWorkerApi.hashFile(file, taskId)
    }

    async hashFileWithChannel(file: File, int: number, cb: any): Promise<Module.HashedFile> {
        return await this._hasherWorkerApi.hashFileWithChannel(file)
            .then((res: [Module.Channel, Promise<Module.HashedFile>]) => {
                res[0].run(int, cb);
                return res[1];
            });
    }

    addFile(file: Module.HashedFile) {
        this._state.addFile(file);
    }

    files() {
        return this._state.files();
    }

    clearState() {
        this._state.clear();
    }
}

initWorker().then(
    (_res) => {
        wasmHasher = new App();
    }
);

// @ts-ignore
document.querySelector("#clearStateButton").addEventListener("click", () => {
    wasmHasher?.clearState();
    //@ts-ignore
    document.querySelector("#hashedFiles").textContent = 'Hashed files: ';

});

//@ts-ignore
document.querySelector("#hashFileButton").addEventListener("click", () => {
    const fileInput = document.querySelector("#fileInput");
    const errorElem = document.querySelector("#error");
    const progressElem = document.querySelector("#progress");
    const resultElem = document.querySelector("#result");
    const hashedFilesElem = document.querySelector("#hashedFiles");
   
    //@ts-ignore
    if (fileInput.files.length === 0) {
        //@ts-ignore
        errorElem.textContent = 'No file selected.';
        return;
    }

    if (!wasmHasher) {
        //@ts-ignore
        errorElem.textContent = 'Worker still initializing';
        return;
    }

    //@ts-ignore
    const file = fileInput.files[0];

    let taskId = wasmHasher.nextTask(); 

    let interval = setInterval(() => {
        wasmHasher?.taskProgress(taskId).then((res: any) => {
            //@ts-ignore
            progressElem.textContent = 'Progress: ' + res + '%';
        });
    }, 500);

    wasmHasher?.hashFile(file, taskId).then((res: Module.HashedFile) => {
        //@ts-ignore
        resultElem.textContent = 'Hash completed: ' + res.hash();
        wasmHasher?.addFile(res);
        if (wasmHasher?.files().length > 0) {
            //@ts-ignore
            hashedFilesElem.textContent = 'Hashed files: ' + wasmHasher.files().map((f: Module.HashedFile) => f.name()).join(', ');
        }
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
document.querySelector("#hashFileWithChannelButton").addEventListener("click", () => {
    const fileInput = document.querySelector("#fileInput");
    const errorElem = document.querySelector("#error");
    const progressElem = document.querySelector("#progress");
    const resultElem = document.querySelector("#result");
    const hashedFilesElem = document.querySelector("#hashedFiles");
   
    //@ts-ignore
    if (fileInput.files.length === 0) {
        //@ts-ignore
        errorElem.textContent = 'No file selected.';
        return;
    }

    if (!wasmHasher) {
        //@ts-ignore
        errorElem.textContent = 'Worker still initializing';
        return;
    }

    //@ts-ignore
    const file = fileInput.files[0];

    wasmHasher?.hashFileWithChannel(
        file,
        1,
        (progress: number) => {
            //@ts-ignore
            progressElem.textContent = 'Progress: ' + progress + '%';
        }
    ).then((res: Module.HashedFile) => {
        //@ts-ignore
        resultElem.textContent = 'Hash completed: ' + res.hash();
        wasmHasher?.addFile(res);
        if (wasmHasher?.files().length > 0) {
            //@ts-ignore
            hashedFilesElem.textContent = 'Hashed files: ' + wasmHasher.files().map((f: Module.HashedFile) => f.name()).join(', ');
        }
    })
    .catch((err: any) => {
        //@ts-ignore
        errorElem.textContent = 'Hash failed: ' + err.message;
    })
    .finally(() => {
        //@ts-ignore
        progressElem.textContent = 'Progress: 100%'
    });
});