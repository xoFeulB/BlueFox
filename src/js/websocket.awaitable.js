// © BlueFoxEnterprise
// https://github.com/xoFeulB

("use strict");
export class AwaitbleWebSocket {
    constructor(url) {
        this.socket = new WebSocket(url);
        this.messagePool = {};
        this.isOpen = false;

        this.socket.addEventListener("open", (event) => {
            this.isOpen = true;
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
        });

        return new Promise((resolve, reject) => {
            let interval_id = setInterval(() => {
                if (this.isOpen) {
                    resolve(this);
                    clearInterval(interval_id);
                }
            }, 10);
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
}