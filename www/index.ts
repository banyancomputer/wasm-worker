import { wrap } from 'comlink';
import * as Module from "../pkg";
import { HashWorker } from "./worker.js";
let wasmHasher = new Module.WasmHasher();

const workerPath = './worker.js';
const hasherWorkerApi = wrap<HashWorker>(new Worker(workerPath));

const taskCounter = {
    taskIdCounter: 0,

    next() {
        return ++taskCounter.taskIdCounter;
    }
}

//@ts-ignore
document.querySelector("#uploadButton").addEventListener("click", () => {
    const fileInput = document.querySelector("#fileInput");
    const responseElem0 = document.querySelector("#response_0");
    const responseElem1 = document.querySelector("#response_1");
    const responseElem2 = document.querySelector("#response_2");
    const responseElem3 = document.querySelector("#response_3");
    const responseElem4 = document.querySelector("#response_4");

   //@ts-ignore
    if (fileInput.files.length === 0) {
        //@ts-ignore
        responseElem2.textContent = 'No file selected.';
        return;
    }

    //@ts-ignore
    const file = fileInput.files[0];

    let taskId = taskCounter.next();

    setInterval(() => {
        //@ts-ignore
        hasherWorkerApi.taskTracker.then((res) => {
            let progress = res.get(taskId);
            //@ts-ignore
            responseElem0.textContent = 'Worker 1 Hash progress: ' + progress + '%';
        });
    }, 500);

    let hash1 = hasherWorkerApi.hashFile(file, taskId);

    taskId = taskCounter.next();

    setInterval(() => {
        //@ts-ignore
        hasherWorkerApi.taskTracker.then((res) => {
            let progress = res.get(taskId);
            //@ts-ignore
            responseElem1.textContent = 'Worker 2 Hash progress: ' + progress + '%';
        });
    }, 500); 

    let hash2 = hasherWorkerApi.hashFile(file, taskId);

    let hash3 = wasmHasher.hashFile(file, (progress: number) => {
        //@ts-ignore
        responseElem2.textContent = 'Main thread Hash progress: ' + progress + '%';
    });

     

    let all_hashes = Promise.all([hash1, hash2, hash3]);

    all_hashes.then(result => {
        let hash1 = result[0];
        let hash2 = result[1];
        let hash3 = result[2];
        if (hash1 !== hash2) {
            console.error("hashes don't match");
            //@ts-ignore
            responseElem3.textContent = "Failed! hashes don't match";
            return;
        }
        //@ts-ignore
        responseElem3.textContent = 'Workers Hash completed: ' + hash1;
        //@ts-ignore
        responseElem4.textContent = 'Main Hash completed: ' + hash3;

    })
    .catch(error => {
        //@ts-ignore
        responseElem3.textContent = 'Hash failed: ' + error.message;
    });
});