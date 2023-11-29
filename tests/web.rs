//! Test suite for the Web and headless browsers.

#![cfg(target_arch = "wasm32")]

extern crate wasm_bindgen_test;
use wasm_bindgen_test::*;

extern crate wasm_hasher;
use wasm_hasher::WasmHasher;

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn new() {
    let _hasher = WasmHasher::new();
}

#[wasm_bindgen_test(async)]
async fn hash_file() {
    let empty_b3_hash = "af1349b9f5f9a1a6a0404dea36dcc9499bcb25c9adc112b7cc9a93cae41f3262";

    let hasher = WasmHasher::new();
    let file =
        web_sys::File::new_with_u8_array_sequence(&js_sys::Array::new(), "test.txt").unwrap();
    let promise = hasher.hash_file(file, None);
    let future = wasm_bindgen_futures::JsFuture::from(promise);
    let result = future.await.unwrap();
    assert_eq!(result.as_string().unwrap(), empty_b3_hash);
}
