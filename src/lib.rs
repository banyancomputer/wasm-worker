mod utils;

use futures_util::StreamExt;
use js_sys::ArrayBuffer;
use js_sys::{Function, Promise};
use wasm_bindgen_futures::future_to_promise;
use wasm_bindgen::prelude::*;
use wasm_streams::ReadableStream as Stream;
use web_sys::{Blob, File};
use blake3::Hasher;

#[wasm_bindgen]
pub struct WasmHasher;

#[wasm_bindgen]
impl WasmHasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> WasmHasher {
        utils::init();
        utils::log("Initializing WasmWorker");
        Self
    }

    /// Process a file and return a hash of the file
    /// * `file` - The file to hash
    /// * `progress_callback` - A optional callback function to call with progress updates. 
    ///                        The callback function should accept a single argument which is the progress percentage.
    #[wasm_bindgen(js_name = hashFile)]
    pub async fn hash_file(&self, file: File, progress_callback: Option<Function>) -> Promise {
        let progress_callback = progress_callback.clone();
        let mut hasher = Hasher::new();
        future_to_promise(async move {
            let total_size = file.size() as u64;
            let mut offset = 0 as u64;
            let file_blob = Blob::from(file);
            let mut stream = Stream::from_raw(file_blob.stream())
                .into_stream()
                .map(|chunk| chunk.map(|chunk| ArrayBuffer::from(chunk)));

            while let Some(Ok(chunk)) = stream.next().await {
                let chunk_size = chunk.byte_length() as u64;

                let chunk_bytes = js_sys::Uint8Array::new(&chunk).to_vec();
                hasher.update(&chunk_bytes);

                offset += chunk_size;
                if offset > total_size {
                    offset = total_size;
                }
                let progress = ((offset as f64 / total_size as f64) * 100.0).round();

                if let Some(callback) = &progress_callback {
                    callback
                        .call1(&JsValue::NULL, &JsValue::from(progress))
                        .unwrap();
                }
            }
            let hash = hasher.finalize().to_hex().to_string();
            Ok(JsValue::from(hash))
        })
    }
}
