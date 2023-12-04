import { expose } from 'comlink';
import * as Module from '../pkg';

export class HashWorker {
    _taskTracker: Map<number, number>;
    constructor(_init = 0) {
        this._taskTracker = new Map<number, number>();
    }

    get taskTracker() {
        return this._taskTracker;
    }

    async hashFile(file: File, taskId: number) {
        this._taskTracker.set(taskId, 0.0);
        let callback = (progress: number) => {
            this._taskTracker.set(taskId, (this._taskTracker.get(taskId) ?? 0.0) + progress);
        };
        return await Module.hashFile(file, callback)
    }

    async hashFileWithChannel(file: File): Promise<[Module.Channel, Promise<Module.HashedFile>]> {
        let channel = new Module.Channel();
        let sender = channel.sender();
        let callback = (progress: number) => {
            sender.update(progress);
        };
        return [channel, Module.hashFile(file, callback)];
    }

  
}

expose(HashWorker);