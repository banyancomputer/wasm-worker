import("../pkg/index_bg.wasm")
    .then(_wasm => import("./index"))
    .catch(e => console.error("Error importing `index.js`:", e));