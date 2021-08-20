package com.github.supermoonie.coolcollege.router.req;

import lombok.Data;

import java.util.List;

/**
 * @author supermoonie
 * @since 2021-03-03
 */
@Data
public class FileSelectReq {

    /**
     * 0: files only
     * 1: directories only
     * 2: files and directories
     */
    private Integer selectType;

    private String defaultFilePath;

    private String title;

    private Boolean isImage = false;

    private List<String> extensionFilter;
}
