let Clipboard = {
    copyText: (req) => {
        return new Promise(((resolve, reject) => {
            window.clipboardQuery({
                request: "clipboard:copy:text:" + req,
                onSuccess: res => {
                    resolve(undefined);
                },
                onFailure: (code, error) => {
                    reject({code: code, error: error});
                }
            });
        }))
    },
}

export default Clipboard;