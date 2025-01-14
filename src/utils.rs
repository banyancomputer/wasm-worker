use cfg_if::cfg_if;

cfg_if! {
    // When the `console_error_panic_hook` feature is enabled, we can call the
    // `set_panic_hook` function to get better error messages if we ever panic.
    if #[cfg(feature = "console_error_panic_hook")] {
        use console_error_panic_hook::set_once as set_panic_hook;
    } else {
        #[inline]
        fn set_panic_hook() {}
    }
}

cfg_if! {
    // When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
    // allocator.
    if #[cfg(feature = "wee_alloc")] {
        #[global_allocator]
        static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;
    }
}

pub fn init() {
    set_panic_hook();
}

pub fn log(s: &str) {
    web_sys::console::log_1(&s.into());
}

pub fn storage() -> web_sys::Storage {
    web_sys::window().unwrap().local_storage().unwrap().unwrap()
}

pub fn maybe_do(callback: Option<js_sys::Function>, value: &wasm_bindgen::JsValue) {
    if let Some(callback) = callback {
        callback.call1(&wasm_bindgen::JsValue::NULL, value).unwrap();
    }
}

pub fn chunk_key(name: &str, chunk: usize) -> String {
    format!("{}-{}", name, chunk)
}
