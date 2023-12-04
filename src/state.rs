use wasm_bindgen::prelude::*;

use crate::hashed_file::HashedFile;
use crate::utils;

#[wasm_bindgen]
pub struct State {
    files: Vec<HashedFile>,
}

const HASHED_FILES_KEY: &str = "hashed-files";

#[wasm_bindgen]
impl State {
    #[wasm_bindgen(constructor)]
    #[allow(clippy::new_without_default)]
    pub fn new() -> State {
        utils::init();
        utils::log("state_new");
        utils::storage()
            .get_item(HASHED_FILES_KEY)
            .unwrap()
            .map_or_else(
                || State { files: Vec::new() },
                |files| State {
                    files: serde_json::from_str(&files).unwrap(),
                },
            )
    }

    pub fn files(&self) -> Vec<HashedFile> {
        self.files.clone()
    }

    #[wasm_bindgen(js_name = addFile)]
    pub fn add_file(&mut self, file: HashedFile) {
        self.files.push(file);
    }

    pub fn save(&self) {
        utils::storage()
            .set_item(
                HASHED_FILES_KEY,
                &serde_json::to_string(&self.files).unwrap(),
            )
            .unwrap();
    }

    pub fn clear(&mut self) {
        // Iterate over the files and remove them from the store
        for file in &self.files {
            for i in 0..file.count() {
                utils::storage()
                    .remove_item(&utils::chunk_key(&file.name(), i as usize))
                    .unwrap();
            }
        }
        self.files.clear();
        utils::storage().remove_item(HASHED_FILES_KEY).unwrap();
    }
}
