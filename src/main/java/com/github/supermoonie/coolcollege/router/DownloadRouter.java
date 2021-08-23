package com.github.supermoonie.coolcollege.router;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.TypeReference;
import com.github.supermoonie.coolcollege.App;
import com.github.supermoonie.coolcollege.httpclient.CustomHttpClient;
import com.github.supermoonie.coolcollege.router.req.DownloadReq;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.http.HttpEntity;
import org.apache.http.client.ResponseHandler;
import org.apache.http.client.methods.RequestBuilder;
import org.cef.browser.CefBrowser;
import org.cef.browser.CefFrame;
import org.cef.browser.CefMessageRouter;
import org.cef.callback.CefQueryCallback;
import org.cef.handler.CefMessageRouterHandlerAdapter;

import javax.swing.*;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.LinkedBlockingDeque;
import java.util.concurrent.TimeUnit;

/**
 * @author supermoonie
 * @since 2021/8/18
 */
@Slf4j
public class DownloadRouter extends CefMessageRouterHandlerAdapter {

    private static final Map<String, DownloadInfo> DOWNLOADING_MAP = new ConcurrentHashMap<>();
    private static final Queue<DownloadInfo> PROGRESS_QUEUE = new LinkedBlockingDeque<>();

    private static final String DOWNLOAD_REQ = "DOWNLOAD_REQ:";
    private static final String DOWNLOADING_QUERY = "DOWNLOAD_QUERY";

    @Getter
    private final CefMessageRouter router;
    private static DownloadRouter instance;

    private DownloadRouter() {
        router = CefMessageRouter.create(new CefMessageRouter.CefMessageRouterConfig("downloadQuery", "cancelDownloadQuery"));
        router.addHandler(this, true);
        App.getInstance().getScheduledExecutor().scheduleAtFixedRate(() -> {
            int limit = 100;
            for (int i = 0; i < limit; i++) {
                DownloadInfo info = PROGRESS_QUEUE.poll();
                if (null == info) {
                    continue;
                }
                DOWNLOADING_MAP.put(info.getDownloadId(), info);
            }
        }, 500, 500, TimeUnit.MILLISECONDS);
    }

    public static DownloadRouter getInstance() {
        if (null == instance) {
            synchronized (DownloadRouter.class) {
                if (null == instance) {
                    instance = new DownloadRouter();
                }
            }
        }
        return instance;
    }

    @Override
    public boolean onQuery(CefBrowser browser, CefFrame frame, long queryId, String request, boolean persistent, CefQueryCallback callback) {
        try {
            if (request.startsWith(DOWNLOAD_REQ)) {
                onDownloadReq(request, callback);
            } else if (request.startsWith(DOWNLOADING_QUERY)) {
                onDownloadQuery(callback);
            } else {
                callback.failure(404, "no cmd found");
                return false;
            }
            return true;
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            callback.failure(500, e.getMessage());
            return true;
        }
    }

    private void onDownloadQuery(CefQueryCallback callback) {
        App.getInstance().getScheduledExecutor().execute(() -> callback.success(JSON.toJSONString(DOWNLOADING_MAP.values())));
    }

    private void onDownloadReq(String request, CefQueryCallback callback) {
        SwingUtilities.invokeLater(() -> {
            String reqText = request.substring(DOWNLOAD_REQ.length());
            log.info("reqText: {}", reqText);
            List<DownloadReq> downloadReqList = JSON.parseObject(reqText, new TypeReference<List<DownloadReq>>() {
            });
            final CustomHttpClient httpClient = new CustomHttpClient();
            for (final DownloadReq req : downloadReqList) {
                String fileName = req.getFileName() + "." + req.getExtension();
                log.info("add {}", fileName);
                File target = new File(req.getSavePath() + File.separator + fileName);
                DownloadInfo waitingInfo = buildDownloadInfo(req.getDownloadId(), req.getSavePath(), fileName, 0, "waiting", null);
                PROGRESS_QUEUE.add(waitingInfo);
                App.getInstance().getExecutor().submit(() -> {
                    try {
                        log.info("downloading {}", fileName);
                        RequestBuilder requestBuilder = RequestBuilder.get(req.getUrl()).setHeader("User-Agent", App.USER_AGENT);
                        httpClient.execute(requestBuilder.build(), (ResponseHandler<Void>) response -> {
                            HttpEntity entity = response.getEntity();
                            long contentLength = entity.getContentLength();
                            InputStream is = entity.getContent();
                            if (-1 == contentLength) {
                                try (FileOutputStream fos = new FileOutputStream(target)) {
                                    byte[] buffer = new byte[is.available()];
                                    IOUtils.readFully(is, buffer);
                                    IOUtils.write(buffer, fos);
                                }
                                DownloadInfo doneInfo = buildDownloadInfo(req.getDownloadId(), req.getSavePath(), fileName, 100, "done", null);
                                PROGRESS_QUEUE.add(doneInfo);
                                return null;
                            }
                            byte[] buf = new byte[1024];
                            long readSize = 0;
                            int size;
                            try (FileOutputStream fos = new FileOutputStream(target)) {
                                List<Long> send = new ArrayList<>();
                                while ((size = is.read(buf)) != -1) {
                                    fos.write(buf, 0, size);
                                    readSize = readSize + size;
                                    Long progress = ((readSize * 100) / contentLength);
                                    if (send.contains(progress)) {
                                        continue;
                                    }
                                    send.add(progress);
//                                    log.info("{}, {} : {}, {}", req.getDownloadId(), req.getFileName() + "." + req.getExtension(), contentLength, progress);
                                    if (progress % 2 == 0) {
                                        DownloadInfo downloadingInfo = buildDownloadInfo(req.getDownloadId(), req.getSavePath(), fileName, progress.intValue(), "downloading", null);
                                        PROGRESS_QUEUE.add(downloadingInfo);
                                    }
                                }
                                DownloadInfo doneInfo = buildDownloadInfo(req.getDownloadId(), req.getSavePath(), fileName, 100, "done", null);
                                PROGRESS_QUEUE.add(doneInfo);
                                fos.flush();
                            }
                            return null;
                        });
                    } catch (IOException e) {
                        log.error(e.getMessage(), e);
                        DownloadInfo failInfo = buildDownloadInfo(req.getDownloadId(), req.getSavePath(), fileName, 0, "fail", e.getMessage());
                        PROGRESS_QUEUE.add(failInfo);
                        FileUtils.deleteQuietly(target);
                    }
                });
            }
            callback.success("downloading");
        });
    }

    private DownloadInfo buildDownloadInfo(String downloadId, String path, String fileName, int progress, String status, String error) {
        DownloadInfo downloadInfo = new DownloadInfo();
        downloadInfo.setDownloadId(downloadId);
        downloadInfo.setPath(path);
        downloadInfo.setFileName(fileName);
        downloadInfo.setProgress(progress);
        downloadInfo.setStatus(status);
        downloadInfo.setError(error);
        return downloadInfo;
    }

    @Data
    @EqualsAndHashCode
    private static class DownloadInfo {

        @EqualsAndHashCode.Include
        private String downloadId;

        @EqualsAndHashCode.Exclude
        private String path;

        @EqualsAndHashCode.Exclude
        private String fileName;

        @EqualsAndHashCode.Exclude
        private Integer progress;

        @EqualsAndHashCode.Exclude
        private String status;

        @EqualsAndHashCode.Exclude
        private String error;
    }
}
