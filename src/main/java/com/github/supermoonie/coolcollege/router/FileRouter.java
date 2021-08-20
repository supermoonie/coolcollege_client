package com.github.supermoonie.coolcollege.router;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.TypeReference;
import com.github.supermoonie.coolcollege.App;
import com.github.supermoonie.coolcollege.router.req.FileMoveReq;
import com.github.supermoonie.coolcollege.router.req.FileSaveTextReq;
import com.github.supermoonie.coolcollege.router.req.FileSelectReq;
import com.github.supermoonie.coolcollege.router.res.FileSelectRes;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.SystemUtils;
import org.cef.browser.CefBrowser;
import org.cef.browser.CefFrame;
import org.cef.browser.CefMessageRouter;
import org.cef.callback.CefQueryCallback;
import org.cef.callback.CefRunFileDialogCallback;
import org.cef.handler.CefDialogHandler;
import org.cef.handler.CefMessageRouterHandlerAdapter;

import javax.imageio.ImageIO;
import javax.swing.*;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Vector;
import java.util.stream.Collectors;

/**
 * @author supermoonie
 * @since 2021/3/3
 */
@Slf4j
public class FileRouter extends CefMessageRouterHandlerAdapter {

    private static final String FILE_FOLDER_SELECT = "file:folder_select:";
    private static final String FILE_DIALOG = "file:dialog:";
    private static final String FILE_USER_HOME = "file:user_home";
    private static final String FILE_OPEN_DIRECTORY = "file:open_directory:";
    private static final String FILE_MOVE = "file:move:";
    private static final String FILE_READ_TEXT = "file:read:text:";
    private static final String FILE_SAVE_TEXT = "file:save:text:";

    @Getter
    private final CefMessageRouter router;
    private static FileRouter instance;

    private FileRouter() {
        router = CefMessageRouter.create(new CefMessageRouter.CefMessageRouterConfig("fileQuery", "cancelFileQuery"));
        router.addHandler(this, true);
    }

    public static FileRouter getInstance() {
        if (null == instance) {
            synchronized (FileRouter.class) {
                if (null == instance) {
                    instance = new FileRouter();
                }
            }
        }
        return instance;
    }

    @Override
    public boolean onQuery(CefBrowser browser,
                           CefFrame frame,
                           long queryId,
                           String request,
                           boolean persistent,
                           CefQueryCallback callback) {
        try {
            if (request.equals(FILE_USER_HOME)) {
                String userHome = SystemUtils.getHostName();
                callback.success(userHome);
                return true;
            } else if (request.startsWith(FILE_DIALOG)) {
                onDialog(request, callback);
                return true;
            } else if (request.startsWith(FILE_OPEN_DIRECTORY)) {
                onOpenDirectory(request, callback);
                return true;
            } else if (request.startsWith(FILE_FOLDER_SELECT)) {
                onFolderSelect(request, callback);
                return true;
            } else if (request.startsWith(FILE_MOVE)) {
                onFileMove(request, callback);
                return true;
            } else if (request.startsWith(FILE_READ_TEXT)) {
                onFileReadText(request, callback);
                return true;
            } else if (request.startsWith(FILE_SAVE_TEXT)) {
                onFileSaveText(request, callback);
                return true;
            }
            callback.failure(404, "no cmd found");
            return false;
        } catch (Exception e) {
            e.printStackTrace();
            callback.failure(500, e.getMessage());
            return false;
        }
    }

    private void onFileSaveText(String request, CefQueryCallback callback) {
        String req = request.replace(FILE_SAVE_TEXT, "");
        if (StringUtils.isEmpty(req)) {
            callback.failure(405, "cmd: " + FILE_SAVE_TEXT + " args is empty!");
            return;
        }
        App.getInstance().getExecutor().execute(() -> {
            try {
                FileSaveTextReq saveTextRequest = JSON.parseObject(req, FileSaveTextReq.class);
                String path = saveTextRequest.getPath().replace("file://", "");
                File file = new File(path);
                FileUtils.writeStringToFile(file, saveTextRequest.getText(), StandardCharsets.UTF_8);
                callback.success(path);
            } catch (Exception e) {
                log.error(e.getMessage(), e);
                callback.failure(500, e.getMessage());
            }
        });
    }

    private void onFileReadText(String request, CefQueryCallback callback) {
        String req = request.replace(FILE_READ_TEXT, "");
        if (StringUtils.isEmpty(req)) {
            callback.failure(405, "cmd: " + FILE_READ_TEXT + " args is empty!");
            return;
        }
        App.getInstance().getExecutor().execute(() -> {
            try {
                String path = req.replace("file://", "");
                File srcFile = new File(path);
                String text = FileUtils.readLines(srcFile, StandardCharsets.UTF_8)
                        .stream().filter(StringUtils::isNotEmpty)
                        .collect(Collectors.joining("\n"));
                callback.success(text);
            } catch (Exception e) {
                log.error(e.getMessage(), e);
                callback.failure(500, e.getMessage());
            }
        });
    }

    private void onFileMove(String request, CefQueryCallback callback) {
        String req = request.replace(FILE_MOVE, "");
        if (StringUtils.isEmpty(req)) {
            callback.failure(405, "cmd: " + FILE_MOVE + " args is empty!");
            return;
        }
        SwingUtilities.invokeLater(() -> {
            try {
                List<FileMoveReq> moveRequestList = JSONObject.parseObject(req, new TypeReference<List<FileMoveReq>>() {
                });
                List<String> targetList = new ArrayList<>();
                for (FileMoveReq moveRequest : moveRequestList) {
                    File src = new File(moveRequest.getFrom().replace("file://", ""));
                    if (!src.exists()) {
                        targetList.add("");
                        continue;
                    }
                    File target = new File(moveRequest.getTo().replace("file://", ""));
                    if (target.exists() && !target.delete()) {
                        throw new RuntimeException(target.getAbsolutePath() + " delete fail");
                    }
                    FileUtils.moveFile(src, target);
                    targetList.add(target.getAbsolutePath());
                }
                callback.success(JSON.toJSONString(targetList));
            } catch (Exception e) {
                log.error(e.getMessage(), e);
                callback.failure(500, e.getMessage());
            }
        });

    }

    private void onFolderSelect(String request, CefQueryCallback callback) {
        SwingUtilities.invokeLater(() -> {
            JFileChooser fileChooser = new JFileChooser();
            fileChooser.setFileSelectionMode(JFileChooser.DIRECTORIES_ONLY);
            fileChooser.setDialogTitle("选择目录");
            fileChooser.setApproveButtonText("选择目录");
            fileChooser.setControlButtonsAreShown(true);
            fileChooser.setDialogType(JFileChooser.OPEN_DIALOG);
            String req = request.replace(FILE_FOLDER_SELECT, "");
            if (StringUtils.isNotEmpty(req)) {
                File folder = new File(req);
                if (folder.exists() && folder.isDirectory()) {
                    fileChooser.setSelectedFile(folder);
                }
            }
            if (JFileChooser.APPROVE_OPTION == fileChooser.showOpenDialog(App.getInstance())) {
                File folder = fileChooser.getSelectedFile();
                callback.success(folder.getAbsolutePath());
            } else {
                callback.success(null);
            }
        });
    }

    private void onOpenDirectory(String request, CefQueryCallback callback) {
        SwingUtilities.invokeLater(() -> {
            try {
                String req = request.replace(FILE_OPEN_DIRECTORY, "");
                if (StringUtils.isEmpty(req)) {
                    callback.failure(405, "cmd: " + FILE_OPEN_DIRECTORY + " args is empty!");
                    return;
                }
                File file = new File(req.replace("file://", ""));
                Desktop.getDesktop().open(file);
                callback.success("success");
            } catch (Exception e) {
                log.error(e.getMessage(), e);
                callback.failure(500, e.getMessage());
            }

        });

    }

    private void onDialog(String request, CefQueryCallback callback) {
        SwingUtilities.invokeLater(() -> {
            String req = request.replace(FILE_DIALOG, "");
            if (StringUtils.isEmpty(req)) {
                callback.failure(405, "cmd: " + FILE_DIALOG + " args is empty!");
                return;
            }
            final FileSelectReq fileSelectRequest = JSONObject.parseObject(req, FileSelectReq.class);
            CefRunFileDialogCallback dialogCallBack = (selectedAcceptFilter, filePaths) -> {
                if (filePaths.size() == 0) {
                    callback.success("[]");
                    return;
                }
                List<FileSelectRes> responseList = new ArrayList<>();
                for (String path : filePaths) {
                    File file = new File(path);
                    FileSelectRes res = new FileSelectRes();
                    res.setPath("file://" + path);
                    res.setFileName(file.getName());
                    res.setSize(file.length());
                    res.setModifyDate(file.lastModified());
                    if (2 != fileSelectRequest.getSelectType() && fileSelectRequest.getIsImage()) {
                        try {
                            BufferedImage image = ImageIO.read(file);
                            res.setWidth(image.getWidth());
                            res.setHeight(image.getHeight());
                        } catch (Exception ignore) {
                        }
                    }
                    responseList.add(res);
                }
                callback.success(JSON.toJSONString(responseList));
            };
            CefDialogHandler.FileDialogMode mode;
            if (1 == fileSelectRequest.getSelectType()) {
                mode = CefDialogHandler.FileDialogMode.FILE_DIALOG_OPEN_MULTIPLE;
            } else if (2 == fileSelectRequest.getSelectType()) {
                mode = CefDialogHandler.FileDialogMode.FILE_DIALOG_SAVE;
            } else {
                mode = CefDialogHandler.FileDialogMode.FILE_DIALOG_OPEN;
            }
            Vector<String> acceptFilters = null;
            if (null != fileSelectRequest.getExtensionFilter() && !fileSelectRequest.getExtensionFilter().isEmpty()) {
                acceptFilters = new Vector<>(fileSelectRequest.getExtensionFilter());
            }
            App.getInstance().getCefBrowser().runFileDialog(mode, fileSelectRequest.getTitle(), fileSelectRequest.getDefaultFilePath(), acceptFilters, 0, dialogCallBack);
        });

    }
}
