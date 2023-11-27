//! Test suite for the Web and headless browsers.

#![cfg(target_arch = "wasm32")]

extern crate wasm_bindgen_test;
use wasm_bindgen_test::*;

extern crate wasm_playground;
use wasm_playground::Client;

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn new() {
    Client::new();
}
