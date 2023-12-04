import { expose, proxy } from 'comlink';
import init, { hashFile, hashFileMt } from '../pkg/index.js';

export class HashWorker {
    _taskTracker: Map<number, number>;
    constructor() {
        this._taskTracker = new Map<number, number>();
    }

    get taskTracker() {
        return this._taskTracker;
    }

    async hashFile(file: File, taskId: number) {
        console.log("hashFile");
        this._taskTracker.set(taskId, 0.0);
        let callback = (progress: number) => {
            this._taskTracker.set(taskId, (this._taskTracker.get(taskId) ?? 0.0) + progress);
        };
        return await hashFile(file, callback)
    }

    async hashFileMt(file: File, taskId: number) {
        console.log("hashFileMt");
        // await initThreadPool(navigator.hardwareConcurrency);
        this._taskTracker.set(taskId, 0.0);
        let callback = (progress: number) => {
            this._taskTracker.set(taskId, (this._taskTracker.get(taskId) ?? 0.0) + progress);
        };
        return await hashFileMt(file, callback)
        // return await hashFile(file, callback)
    }
}

async function initWorker() {
    await init();
    let handler = new HashWorker();
    return proxy(handler);
};

expose({ handler: initWorker() });