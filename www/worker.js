import("../pkg").then(wasm => {
    let client = new wasm.Client();
    self.addEventListener("message", ev => {
        console.log("worker: received hello event");
        let name = ev.data;
        // Make sure the name is a string
        if (typeof name !== "string") {
            name = "stranger";
        }
        self.postMessage({ allGood: true, message: client.hello(name) });
    });
  });