const System = {
    /**
     * 获取当前系统
     *
     * @returns {Promise<>}
     */
    os: () => (
        new Promise((resolve, reject) => {
            window.systemQuery({
                request: "CURRENT_OS",
                onSuccess: res => {
                    resolve(res);
                },
                onFailure: (code, error) => {
                    reject({code: code, error: error});
                }
            });
        })
    ),
    /**
     * 获取默认的下载目录
     *
     * @returns {Promise<>}
     */
    defaultDownloadFolder: () => (
        new Promise((resolve, reject) => {
            window.systemQuery({
                request: "DEFAULT_DOWNLOAD_FOLDER",
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

export default System;