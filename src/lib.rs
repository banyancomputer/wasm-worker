mod utils;

use futures_util::StreamExt;
use js_sys::ArrayBuffer;
use js_sys::{Function, Promise};
use wasm_bindgen_futures::future_to_promise;
use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;
use wasm_bindgen::closure::Closure;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use wasm_streams::ReadableStream as Stream;
use web_sys::{Blob, File, FileReader, MessageEvent};

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub struct WasmWorker {
    progress_callbacks: Rc<RefCell<HashMap<u32, Function>>>,
}

#[wasm_bindgen]
impl WasmWorker {
    #[wasm_bindgen(constructor)]
    pub fn new() -> WasmWorker {
        utils::init();
        utils::log("Initializing WasmWorker");
        Self {
            progress_callbacks: Rc::new(RefCell::new(HashMap::new())),
        }
    }

    /// Register a progress callback for a specific task
    pub fn register_progress_callback(&mut self, task_id: u32, callback: &Function) {
        utils::log(&format!(
            "Registering progress callback for task {}",
            task_id
        ));
        self.progress_callbacks
            .borrow_mut()
            .insert(task_id, callback.clone());
    }

    /// Process a file with a given task ID
    pub async fn process_file(&self, task_id: u32, file: File) -> Promise {
        utils::log(&format!("Processing file with task ID {}", task_id));
        let progress_callbacks = self.progress_callbacks.clone();
        future_to_promise(async move {
            let total_size = file.size() as usize;
            let mut offset = 0;
            let file_blob = Blob::from(file);
            let mut stream = Stream::from_raw(file_blob.stream())
                .into_stream()
                .map(|chunk| chunk.map(|chunk| ArrayBuffer::from(chunk)));

            // Read over the stream
            while let Some(Ok(chunk)) = stream.next().await {
                let chunk_size = chunk.byte_length() as usize;

                offset += chunk_size;
                if offset > total_size {
                    offset = total_size;
                }
                let progress = ((offset as f64 / total_size as f64) * 100.0).round();

                if let Some(callback) = progress_callbacks.borrow().get(&task_id) {
                    callback
                        .call1(&JsValue::NULL, &JsValue::from(progress))
                        .unwrap();
                }
            }

            Ok(JsValue::UNDEFINED)
        })
    }
}
