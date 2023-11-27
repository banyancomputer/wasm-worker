mod utils;

use gloo::console;
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

/* 
 * This is a simple (empty) struct that we can export to Js
 */
#[wasm_bindgen]
pub struct Client;

/*
 * Here we define method bindings that we want to expose to Js
 */
#[wasm_bindgen]
impl Client {
    /*
     * Here we define a constuctor to initialize a new copy of our struct
     * Note how we use the 'constructor' macro
     */ 
    #[wasm_bindgen(constructor)]
    pub fn new() -> Client {
        utils::set_panic_hook();
        console::log!("hello from wasm");
        Self
    }
}

/*
 * Here we can define things we don't want bound and exported to Js
 */
impl Client {}
