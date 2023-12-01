mod utils;

use blake3::Hasher;
use futures::TryStreamExt;
use js_sys::{Function, Promise, Uint8Array};
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::future_to_promise;
use wasm_streams::ReadableStream as Stream;
use web_sys::File;

#[wasm_bindgen]
pub struct WasmHasher;

impl Default for WasmHasher {
    fn default() -> Self {
        Self::new()
    }
}

#[wasm_bindgen]
impl WasmHasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> WasmHasher {
        utils::init();
        utils::log("WasHasher::new");
        Self
    }

    /// Process a file and return a hash of the file
    /// * `file` - The file to hash
    /// * `progress_callback` - A optional callback function to call with progress updates.
    ///                        The callback function should accept a single argument which is the progress percentage.
    #[wasm_bindgen(js_name = hashFile)]
    // pub fn hash_file(&self, file: File, progress_callback: Option<Function>) -> Promise {
    pub fn hash_file(&self, file: File, progress_callback: Option<Function>) -> Promise {
        let progress_callback = progress_callback.clone();
        let mut hasher = Hasher::new();
        future_to_promise(async move {
            let total_size = file.size() as u64;
            let mut offset = 0_u64;
            let mut s = Stream::from_raw(file.stream().unchecked_into()).into_stream();

            while let Some(chunk) = s.try_next().await.unwrap() {
                let chunk = chunk.unchecked_into::<Uint8Array>();
                let chunk_size = chunk.length() as u64;
                hasher.update(&chunk.to_vec());

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
