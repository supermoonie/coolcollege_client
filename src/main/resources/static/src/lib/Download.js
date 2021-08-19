const Download = {
    /**
     * 请求下载
     *
     * [{
     *     downloadId: "",
     *     url: "",
     *     savePath: "",
     *     fileName: "",
     *     extension: ""
     * }]
     * @param req
     * @returns {Promise<>}
     */
    downloadReq: (req) => (
        new Promise((resolve, reject) => {
            window.downloadQuery({
                request: "DOWNLOAD_REQ:" + JSON.stringify(req),
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

export default Download;