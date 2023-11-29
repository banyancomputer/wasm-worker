// FileUploaderSDK.js

export default class FileUploaderSDK {
    constructor(workerPath) {
        this.worker = new Worker(workerPath);
        this.taskIdCounter = 0;
        this.progressCallbacks = new Map();
        this.completionCallbacks = new Map();
        this._initWorkerListeners();
    }

    uploadFile(file, progressCallback) {
        const taskId = this._generateTaskId();
        if (typeof progressCallback === 'function') {
            this.progressCallbacks.set(taskId, progressCallback);
        } else {
            console.warn('Progress callback is not a function.');
        }

        this.worker.postMessage({ type: 'upload', taskId, file });

        return new Promise((resolve, reject) => {
            this._registerCompletionCallback(taskId, resolve, reject);
        });
    }

    _generateTaskId() {
        return ++this.taskIdCounter;
    }

    _initWorkerListeners() {
        this.worker.onmessage = (event) => {

            const { type, taskId, progress, result, error } = event.data;

            switch (type) {
                case 'progress':
                    this._handleProgress(taskId, progress);
                    break;
                case 'completed':
                    this._handleCompletion(taskId, result);
                    break;
                case 'error':
                    this._handleError(taskId, error);
                    break;
            }
        };
    }

    _handleProgress(taskId, progress) {
        const callback = this.progressCallbacks.get(taskId);
        if (typeof callback === 'function') {
            console.log('progress', taskId, progress);
            callback(progress);
        }
    }

    _registerCompletionCallback(taskId, resolve, reject) {
        this.completionCallbacks.set(taskId, { resolve, reject });
    }

    _handleCompletion(taskId, result) {
        const { resolve } = this.completionCallbacks.get(taskId);
        if (resolve) {
            resolve(result);
        }
        this.progressCallbacks.delete(taskId);
        this.completionCallbacks.delete(taskId);
    }

    _handleError(taskId, error) {
        const { reject } = this.progressCallbacks.get(taskId);
        if (reject) {
            reject(error);
        }
        this.progressCallbacks.delete(taskId);
    }
}

// Initialize the SDK with the path to your worker
const uploader = new FileUploaderSDK('./worker.js');

document.querySelector("#uploadButton").addEventListener("click", () => {
    const fileInput = document.querySelector("#fileInput");
    const responseElem = document.querySelector("#response");

    if (fileInput.files.length === 0) {
        responseElem.textContent = 'No file selected.';
        return;
    }

    const file = fileInput.files[0];
    responseElem.textContent = 'Uploading...';

    // Upload the file and handle progress updates
    uploader.uploadFile(file, (progress) => {
        responseElem.textContent = `Upload progress: ${progress}%`;
    })
    .then(result => {
        responseElem.textContent = 'Upload completed: ' + result;
    })
    .catch(error => {
        responseElem.textContent = 'Upload failed: ' + error.message;
    });
});