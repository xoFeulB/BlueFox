// © BlueFoxEnterprise
// https://github.com/xoFeulB

("use strict");
export class AwaitbleWebSocket {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.messagePool = {};
    this.isOpen = false;
    let _resolve_ = () => { };
    let _reject_ = () => { };

    this.socket.addEventListener("open", (event) => {
      this.isOpen = true;
      _resolve_(this);
    });
    this.socket.addEventListener("message", (event) => {
      let data = JSON.parse(event.data);
      if (data.uuid in this.messagePool) {
        this.messagePool[data.uuid](event);
        delete this.messagePool[data.uuid];
      }
    });
    this.socket.addEventListener("close", (event) => {
      this.isOpen = false;
    });
    this.socket.addEventListener("error", (event) => {
      this.isOpen = false;
      _reject_(event);
    });

    return new Promise((resolve, reject) => {
      this.isOpen ? resolve(this) : _resolve_ = resolve;
      _reject_ = reject;
    });
  }

  async send(message) {
    let uuid = crypto.randomUUID();
    this.socket.send(
      JSON.stringify(
        Object.assign(
          {
            message: message,
          },
          {
            uuid: uuid,
          }
        )
      )
    );
    let R = new Promise((resolve, reject) => {
      this.messagePool[uuid] = (_) => {
        resolve(JSON.parse(_.data));
      };
    });
    return R;
  }

  close() {
    this.socket.close();
  }
}