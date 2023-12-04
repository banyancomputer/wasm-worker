# Wasm Hasher
This repository is a simple example of implementing and calling a Web Worker from Wasmable Rust to Browser Javascript 
It serves as a simple playground to test out working with Web Workers and Wasm and record my findings

# Pre Requisites
- yarn
- cargo
- wasm-pack

# Run Web Example

## Install Dependencies

`yarn install`

## Run Dev Server

`yarn dev`

# Tools and Libs

- [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)
- [wasm-bindgen](https://rustwasm.github.io/docs/wasm-bindgen/)
- [wasm-bindgen-futures](https://rustwasm.github.io/docs/wasm-bindgen/examples/futures.html)
- [comlink](https://github.com/GoogleChromeLabs/comlink)
  - comlink is a great library for implementing a web worker. 
  - It's much more ergonomic than attempting to do so with web_sys and gloo, which are less mature and thoroughly documented
  - It makes it easy to break up your code into more bespoke javascript modules wrapped around performant rust code in web workers
  - It also makes it easy to pass complex data structures between the worker and the main thread using both messages and shared memory
  - WORKING
- [wasm-rs-shared-channel](https://docs.rs/wasm-rs-shared-channel/latest/wasm_rs_shared_channel/)
  - this is a great library for creating a shared channel between a Web Worker and the main thread
  - You can use it to bypass transferring state between the worker and the main thread, which can be expensive
  - WORKING
- [wasm-bindgen-rayon](https://github.com/GoogleChromeLabs/wasm-bindgen-rayon/tree/main)
  - web worker based parallelism for using the rayon library in wasm
  - also serves as a great example for packaging worker code with wasm-pack. This is more limited than comlink, but can be more lite weight and less verbose for simple use cases.
  - NOT WORKING, SOME ISSUE WITH COMPILING

# Functionality to Implement
- [x] Implement a simple web worker in wasm
- [x] 2 stage process with a web worker with progress updates
- [x] Implement a simple web worker in wasm with a shared channel
- [ ] Parallelize a simple task with rayon in wasm, maybe the writing of the hash chunks
  

# Example Projects
- https://julien-decharentenay.medium.com/rust-webassembly-sharing-data-between-webworkers-f156ba65d141
- https://github.com/Ngalstyan4/mandelbrot-wasm-rust-rayon
- https://github.com/wasm-rs/shared-channel/tree/master/example
- https://github.com/GoogleChromeLabs/wasm-bindgen-rayon/tree/main/demo

# Questions
- How much overhead is associated with transferring data between the js ans wasm, especially with callbacks? Should we be relying more on shared memory?

