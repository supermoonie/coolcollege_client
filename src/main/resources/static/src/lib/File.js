const File = {
    /**
     * 获取用户家目录
     *
     * @returns {Promise<>}
     */
    userHome: () => {
        return new Promise(((resolve, reject) => {
            window.fileQuery({
                request: "file:user_home",
                onSuccess: res => {
                    resolve(res);
                },
                onFailure: (code, error) => {
                    reject({code: code, error: error});
                }
            });
        }))
    },
    /**
     * 选择目录
     *
     * @param defaultPath
     * @returns {Promise<>}
     */
    folderSelect: (defaultPath) => (
        new Promise((resolve, reject) => {
            window.fileQuery({
                request: "file:folder_select:" + defaultPath,
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
     * 文件/文件夹选择弹框
     * {
     *     "selectType": 1,
     *     "defaultFilePath": null,
     *     "title": "Open",
     *     "isImage": true,
     *     "extensionFilter": [
     *          "|.png;.jpeg;.jpg"
     *     ]
     * }
     * @param req
     * @returns {Promise<>}
     */
    dialog: req => (
        new Promise((resolve, reject) => {
            window.fileQuery({
                request: "file:dialog:" + JSON.stringify(req),
                onSuccess: function (res) {
                    resolve(JSON.parse(res));
                },
                onFailure: (code, error) => {
                    reject({code: code, error: error});
                }
            });
        })
    ),
    openFolder: async path => (
        new Promise(((resolve, reject) => {
            window.fileQuery({
                request: "file:open_directory:" + path,
                onSuccess: res => {
                    resolve(res);
                },
                onFailure: (code, error) => {
                    reject({code: code, error: error});
                }
            });
        }))
    )
};

export default File;