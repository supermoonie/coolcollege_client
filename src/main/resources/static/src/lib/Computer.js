const Computer = {
    /**
     * 获取当前系统
     *
     * @returns {Promise<>}
     */
    currentOs: () => (
        new Promise((resolve, reject) => {
            window.computerQuery({
                request: "CURRENT_OS",
                onSuccess: res => {
                    resolve(res);
                },
                onFailure: (code, error) => {
                    reject({code: code, error: error});
                }
            });
        })
    )
};

export default Computer;