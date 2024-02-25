(async () => {
    let sendMessage = async (arg) => {
        try {
            return await chrome.runtime.sendMessage(arg);
        } catch (err) {
            log(err);
        }
    };
    {
        let attach_result = await sendMessage({
            type: "Debugger.attach",
        });
        let evaluate_result = await sendMessage({
            type: "Runtime.evaluate",
            object: {
                expression: `(()=>{return "^.,.^ BlueFox";})();`,
                objectGroup: "BlueFox-js-lanch",
                awaitPromise: true,
                returnByValue: true,
            },
        });
        if ("^.,.^ BlueFox" != evaluate_result?.result?.value) {
            location.href = location.href;
        }
    }
})();