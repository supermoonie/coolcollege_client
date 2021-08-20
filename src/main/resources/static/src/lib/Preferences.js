let Preferences = {
    getString: (key) => {
        return new Promise(((resolve, reject) => {
            window.preferencesQuery({
                request: "preferences:get:string:" + key,
                onSuccess: res => {
                    resolve(res);
                },
                onFailure: (code, error) => {
                    reject({code: code, error: error});
                }
            });
        }))
    },
    setString: (key, value) => {
        return new Promise(((resolve, reject) => {
            window.preferencesQuery({
                request: "preferences:set:string:" + JSON.stringify({
                    "key": key,
                    "value": value
                }),
                onSuccess: res => {
                    resolve(res);
                },
                onFailure: (code, error) => {
                    reject({code: code, error: error});
                }
            });
        }))
    }
}

export default Preferences;