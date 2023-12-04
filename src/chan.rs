use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;
use wasm_rs_shared_channel::spsc;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Request {
    Update { progress: f64 },
    Done,
}

#[wasm_bindgen]
pub struct Channel {
    sender: Option<spsc::Sender<Request>>,
    receiver: spsc::Receiver<Request>,
}

#[wasm_bindgen]
impl Channel {
    #[wasm_bindgen(constructor)]
    #[allow(clippy::new_without_default)]
    pub fn new() -> Channel {
        let (sender, receiver) = spsc::channel::<Request>(1024).split();
        Channel {
            sender: Some(sender),
            receiver,
        }
    }
    pub fn from(val: JsValue) -> Self {
        let (sender, receiver) = spsc::SharedChannel::from(val).split();
        Channel {
            sender: Some(sender),
            receiver,
        }
    }

    pub fn replica(&self) -> JsValue {
        self.receiver.0.clone().into()
    }

    pub fn run(&mut self, interval_secs: usize, callback: js_sys::Function) -> Result<(), JsValue> {
        console_error_panic_hook::set_once();
        loop {
            let res = self
                .receiver
                .recv(Some(std::time::Duration::from_secs(interval_secs as u64)));

            match res {
                Ok(request) => if let Some(request) = request {
                    match request {
                        Request::Update { progress } => {
                            callback.call1(&JsValue::NULL, &JsValue::from(progress))?;
                        }
                        Request::Done => {
                            break;
                        }
                    }
                },
                Err(_) => {
                    break;
                }
            }
        }
        Ok(())
    }

    pub fn sender(&mut self) -> Result<Sender, JsValue> {
        match self.sender.take() {
            Some(sender) => Ok(Sender(sender)),
            None => Err("sender is already taken".to_string().into()),
        }
    }
}

#[wasm_bindgen]
pub struct Sender(spsc::Sender<Request>);

#[wasm_bindgen]
impl Sender {
    pub fn update(&self, progress: f64) -> Result<(), JsValue> {
        self.0.send(&Request::Update { progress })
    }

    pub fn close(&self) -> Result<(), JsValue> {
        self.0.send(&Request::Done)
    }
}
