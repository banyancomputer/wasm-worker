// Initialize the worker
const worker = new Worker("./worker.js");

let button = document.querySelector("#button");
let response = document.querySelector("#response");

worker.addEventListener("message", ev => {
    console.log("browser: received hello event");
    if (ev.data.allGood) {
        response.textContent = ev.data.message;
    } else {
        response.textContent = "Something went wrong!";
    }
});

button.addEventListener("click", _ev => {
    worker.postMessage("browser");
});

