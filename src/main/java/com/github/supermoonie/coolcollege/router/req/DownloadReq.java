package com.github.supermoonie.coolcollege.router.req;

import lombok.Data;

/**
 * @author supermoonie
 * @since 2021/8/18
 */
@Data
public class DownloadReq {

    private String downloadId;

    private String url;

    private String savePath;

    private String fileName;

    private String extension;
}
