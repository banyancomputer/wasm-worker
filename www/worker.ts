import { expose } from 'comlink';
import * as Module from '../pkg';

const obj = {
    hasher: new Module.WasmHasher(),
    taskTracker: new Map<number, number>(),

    hashFile: (file: File, taskId: number) => {
        console.log("hashFile");
        console.log(file);

        obj.taskTracker.set(taskId, 0.0);
        let callback = (progress: number) => {
            obj.taskTracker.set(taskId, progress);
        };
        
        let res = obj.hasher.hashFile(file, callback).then((res) => {
            return res;
        });

        return res;
    },
};

export type HashWorker = typeof obj;

  
expose(obj);