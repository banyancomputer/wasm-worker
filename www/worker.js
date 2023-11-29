import * as Module from '../pkg';

// Initialize the wasm module. This will also maintain application state.
const hasher = new Module.WasmHasher();

// Set the worker's onmessage handler to process incoming messages.
self.onmessage = async (event) => {
    // Events are expected to have a 
    // type: string -- the type of event. This needs to be consistent throughout our Js shim.
    // taskId: number -- the id of the task to which this event corresponds. This is used to 
    //                  route the event to the correct caller.
    const { type, taskId } = event.data;
    // Register your worker's methods here.
    switch (type) {
        // Upload a file
        case 'upload':
            const { file } = event.data;
            // Check this is a valid file.
            if (!file || !(file instanceof File)) {
                // Raising an error here won't be seen by the caller, so pass back the error via the worker.
                self.postMessage({ type: 'error', taskId, error: "Invalid file" });
                break;
            }
            try {
                // Define a simple progress callback. The consumer of the worker will need to register a
                // listener for this event to pull out updates on the progress of the task.
                const progressCallback = (progress) => {
                    self.postMessage({ type: 'progress', taskId, progress });
                };
                // Hash the file
                hasher.hashFile(file, progressCallback).then(result => {
                    // Return the result to the caller.
                    self.postMessage({ type: 'completed', taskId, result });
                });
            } catch (error) {
                // Again, raising an error here won't be seen by the caller, so pass back the error via the worker.
                self.postMessage({ type: 'error', taskId, error: error.message });
            }
            break;
        default:
            self.postMessage({ type: 'error', taskId, error: "Invalid event type" });
            break;
    }
};
