// © BlueFoxEnterprise
// https://github.com/xoFeulB

("use strict");

export class AwaitbleWebSocket {
    constructor(url) {
        this.socket = new WebSocket(url);
        this.socket.addEventListener("open", this.onOpen);
        this.socket.addEventListener("message", this.onMessage);
        this.socket.addEventListener("close", this.onClose);
        this.socket.addEventListener("error", this.onError);
        this.socket.messagePool = {};

        return new Promise((resolve, reject) => {
            let interval_id = setInterval(() => {
                if (this.socket.isOpen) {
                    resolve(this);
                    clearInterval(interval_id);
                }
            }, 10);
        });
    }

    async send(message) {
        let uuid = crypto.randomUUID();
        this.socket.send(
            JSON.stringify(Object.assign({ "message": message }, { uuid: uuid }))
        );
        let R = new Promise((resolve, reject) => {
            this.socket.messagePool[uuid] = (_) => {
                resolve(JSON.parse(_.data));
            };
        });
        return R;
    }

    onOpen(event) {
        // this -> this.socket
        this.isOpen = true;
    }
    onMessage(event) {
        // this -> this.socket
        let data = JSON.parse(event.data);
        if (Object.keys(this.messagePool).includes(data.uuid)) {
            this.messagePool[data.uuid](event);
            delete this.messagePool[data.uuid];
        }
    }
    onClose(event) {
        // this -> this.socket
        this.isOpen = false;
    }
    onError(event) {
        // this -> this.socket
        this.isOpen = false;
    }

}