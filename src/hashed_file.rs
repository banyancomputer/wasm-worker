use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Serialize, Deserialize, Clone)]
pub struct HashedFile {
    name: String,
    hash: String,
    count: u32,
}

#[wasm_bindgen]
impl HashedFile {
    #[wasm_bindgen(constructor)]
    #[allow(clippy::new_without_default)]
    pub fn new(name: String, hash: String, count: u32) -> HashedFile {
        HashedFile { name, hash, count }
    }

    pub fn name(&self) -> String {
        self.name.clone()
    }

    pub fn hash(&self) -> String {
        self.hash.clone()
    }

    pub fn count(&self) -> u32 {
        self.count
    }
}
