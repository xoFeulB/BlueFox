(async () => {
    {
        let attach_result = await chrome.runtime.sendMessage({
            type: "Debugger.attach",
        });
        let evaluate_result = await chrome.runtime.sendMessage({
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