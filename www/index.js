// Where to load the worker from
const workerPath = './worker.js';

// A simple wrapper around the worker to make it easier to use.
// This tracks outgoing tasks and uses listeners to return qualified results to the caller.
class HashWorkerSdk {
    constructor() {
        // Spawn the worker
        this.worker = new Worker(workerPath);
        // Create a counter to track tasks
        this.taskIdCounter = 0;

        // Since this is just a wrapper around a worker, we need to use callback to return results to the caller.
        // We'll use a series of maps to track callbacks for each task.

        // TODO: can we fit multiple types of progress callbacks into a single operation? For example, 
        //     could we return separate progress reports for hashing and then uploading within the same operation?
        //    For now  we'll assume that each operation only has one progress callback type.
        // Progress callbacks are used to return progress updates to the caller.
        // This is a nice utility, but it's not strictly necessary.
        this.progressCallbacks = new Map();

        // Completion callbacks are used to return the result of a task to the caller.
        // This is necessary since the worker can't return results directly.
        // This tracks both resolve and reject callbacks.
        this.completionCallbacks = new Map();

        this._initWorkerListeners();
    }

    // Hash a file using the worker. Return a promise that resolves to the result of the operation.
    hashFile(file, progressCallback) {
        // Generate a unique task id for the caller.
        const taskId = this._generateTaskId();
        if (typeof progressCallback === 'function') {
            this.progressCallbacks.set(taskId, progressCallback);
        } else {
            throw new Error('Invalid progress callback: ' + progressCallback);
        }

        this.worker.postMessage({ type: 'upload', taskId, file });

        return new Promise((resolve, reject) => {
            this._registerCompletionCallback(taskId, resolve, reject);
        });
    }

    // Generate a unique task id for the caller.
    _generateTaskId() {
        return ++this.taskIdCounter;
    }

    _registerCompletionCallback(taskId, resolve, reject) {
        this.completionCallbacks.set(taskId, { resolve, reject });
    }
    
    // Initialize the worker's listeners to interpret incoming messages and use the correct callbacks.
    _initWorkerListeners() {
        this.worker.onmessage = (event) => {

            const { type, taskId, progress, result, error } = event.data;

            switch (type) {
                case 'progress':
                    this._handleProgress(taskId, progress);
                    break;
                case 'completed' || 'error':
                    this._handleCompletion(taskId, error, result);
                    break;
                default:
                    console.error('Found invalid event type: ', type);
                    break;
            }
        };
    }

    _handleProgress(taskId, progress) {
        const callback = this.progressCallbacks.get(taskId);
        if (typeof callback === 'function') {
            callback(progress);
        }
    }

    _handleCompletion(taskId, error, result) {
        const { resolve, reject } = this.completionCallbacks.get(taskId);

        if (error) {
            reject(error);
        }
        if (result) {
            resolve(result);
        }
        else {
            throw new Error('Received neither error nor result for task: ' + taskId);
        }

        this.progressCallbacks.delete(taskId);
        this.completionCallbacks.delete(taskId);
    }
}

// Initialize the SDK with the path to your worker
const hasher = new HashWorkerSdk();

document.querySelector("#uploadButton").addEventListener("click", () => {
    const fileInput = document.querySelector("#fileInput");
    const responseElem = document.querySelector("#response");

    if (fileInput.files.length === 0) {
        responseElem.textContent = 'No file selected.';
        return;
    }

    const file = fileInput.files[0];

    // Upload the file and handle progress updates
    hasher.hashFile(file, (progress) => {
        responseElem.textContent = `Hash progress: ${progress}%`;
    })
    .then(result => {
        responseElem.textContent = 'Hash completed: ' + result;
    })
    .catch(error => {
        responseElem.textContent = 'Hash failed: ' + error.message;
    });
});