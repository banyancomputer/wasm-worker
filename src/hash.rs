use base64::{engine::general_purpose, Engine as _};
use blake3::Hasher;
use futures::StreamExt;
use js_sys::{Function, Promise, Uint8Array};
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::future_to_promise;
use wasm_streams::ReadableStream as Stream;
use web_sys::File;

use crate::hashed_file::HashedFile;
use crate::utils;

/// Process a file and return a hash of the file
/// * `file` - The file to hash
/// * `progress_callback` - A optional callback function to call with progress updates. These are discrete updates
#[wasm_bindgen(js_name = hashFile)]
pub fn hash_file(file: File, progress_callback: Option<Function>) -> Promise {
    utils::log("hash_file");
    let store = utils::storage();
    let progress_callback = progress_callback.clone();
    let name = file.name();
    let job_size = file.size() as u64 * 2;
    let mut count = 0;
    let mut hasher = Hasher::new();
    future_to_promise(async move {
        // Our total job size accounts for both hashing and writing the file to the store
        let s = Stream::from_raw(file.stream().unchecked_into()).into_stream();
        let mut s = s
            .map(|chunk| {
                let chunk = chunk.unwrap().unchecked_into::<Uint8Array>();
                hasher.update(&chunk.to_vec());
                let chunk_size = chunk.length() as u64;
                utils::maybe_do(
                    progress_callback.clone(),
                    &JsValue::from(((chunk_size as f64 / job_size as f64) * 100.0).round()),
                );
                chunk
            })
            .enumerate();
        utils::log("hash_file: writing chunks");
        while let Some(chunk) = s.next().await {
            let (idx, chunk) = chunk;
            count += 1;
            store
                .set_item(
                    &utils::chunk_key(&name, idx),
                    // Encode the chunk as a base64 string
                    &general_purpose::STANDARD_NO_PAD.encode(&chunk.to_vec()),
                )
                .unwrap();
            utils::maybe_do(
                progress_callback.clone(),
                &JsValue::from(((chunk.length() as f64 / job_size as f64) * 100.0).round()),
            );
        }
        let hash = hasher.finalize().to_hex().to_string();
        Ok(JsValue::from(HashedFile::new(name, hash, count)))
    })
}
