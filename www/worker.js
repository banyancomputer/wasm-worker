// // self.addEventListener("message", event => {
// //     // Extract the resolver_id and the actual message
// //     let [resolver_id, message] = event.data.split(":");
// //     // Process the message and prepare a response
// //     let response = `Processed: ${message}`;
// //     // Send back the resolver_id with the response
// //     self.postMessage(`${resolver_id}:${response}`);
// // });

// self.addEventListener('message', (event) => {
//     const { id, type, payload } = event.data;
//     let result = "done";

//     // ... perform the task based on the type

//     self.postMessage({ id, result });
// });

// importScripts('path/to/your_compiled_wasm_module.js');

import * as Module from '../pkg';

const wasmWorker = new Module.WasmWorker();

self.onmessage = async (event) => {
    const { type, taskId, file } = event.data;

    if (type === 'upload' && file) {
        try {
            const progressCallback = (progress) => {
                self.postMessage({ type: 'progress', taskId, progress });
            };
            wasmWorker.register_progress_callback(taskId, progressCallback);

            wasmWorker.process_file(taskId, file).then(_result => {
                self.postMessage({ type: 'completed', taskId, result: "Complete" });
            }).catch(error => {
                self.postMessage({ type: 'error', taskId, error: error.message });
            });
        } catch (error) {
            self.postMessage({ type: 'error', taskId, error: error.message });
        }
    }
};
