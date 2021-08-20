package com.github.supermoonie.coolcollege.router;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.TypeReference;
import com.github.supermoonie.coolcollege.App;
import com.github.supermoonie.coolcollege.httpclient.CustomHttpClient;
import com.github.supermoonie.coolcollege.router.req.DownloadReq;
import lombok.Data;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.apache.http.HttpEntity;
import org.apache.http.client.ResponseHandler;
import org.apache.http.client.methods.RequestBuilder;
import org.cef.browser.CefBrowser;
import org.cef.browser.CefFrame;
import org.cef.browser.CefMessageRouter;
import org.cef.callback.CefQueryCallback;
import org.cef.handler.CefMessageRouterHandlerAdapter;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author supermoonie
 * @since 2021/8/18
 */
@Slf4j
public class DownloadRouter extends CefMessageRouterHandlerAdapter {

    private static final Map<String, DownloadInfo> DOWNLOADING_MAP = new ConcurrentHashMap<>();

    private static final String DOWNLOAD_REQ = "DOWNLOAD_REQ:";
    private static final String DOWNLOADING_QUERY = "DOWNLOAD_QUERY";

    @Getter
    private final CefMessageRouter router;
    private static DownloadRouter instance;

    private DownloadRouter() {
        router = CefMessageRouter.create(new CefMessageRouter.CefMessageRouterConfig("downloadQuery", "cancelDownloadQuery"));
        router.addHandler(this, true);
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
        App.getInstance().getExecutor().execute(() -> {
            Collection<DownloadInfo> downloadInfos = DOWNLOADING_MAP.values();
            callback.success(JSON.toJSONString(downloadInfos));
        });
    }

    private void onDownloadReq(String request, CefQueryCallback callback) {
        App.getInstance().getExecutor().execute(() -> {
            String reqText = request.substring(DOWNLOAD_REQ.length());
            log.info("reqText: {}", reqText);
            List<DownloadReq> downloadReqList = JSON.parseObject(reqText, new TypeReference<List<DownloadReq>>() {
            });
            final CustomHttpClient httpClient = new CustomHttpClient();
            for (final DownloadReq req : downloadReqList) {
                App.getInstance().getExecutor().submit(() -> {
                    String fileName = req.getFileName() + "." + req.getExtension();
                    File target = new File(req.getSavePath() + File.separator + fileName);
                    setDownloadInfo(req.getDownloadId(), req.getSavePath(), fileName, 0, "waiting", null);
                    try {
                        RequestBuilder requestBuilder = RequestBuilder.get(req.getUrl()).setHeader("User-Agent", App.USER_AGENT);
                        httpClient.execute(requestBuilder.build(), (ResponseHandler<Void>) response -> {
                            HttpEntity entity = response.getEntity();
                            long contentLength = entity.getContentLength();
                            InputStream is = entity.getContent();
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
                                    log.info("{} : {}", req.getFileName(), progress);
                                    if (progress % 2 == 0) {
                                        setDownloadInfo(req.getDownloadId(), req.getSavePath(), fileName, progress.intValue(), "downloading", null);
                                    }
                                }
                                setDownloadInfo(req.getDownloadId(), req.getSavePath(), fileName, 100, "done", null);
                                fos.flush();
                            }
                            return null;
                        });
                    } catch (IOException e) {
                        log.error(e.getMessage(), e);
                        setDownloadInfo(req.getDownloadId(), req.getSavePath(), fileName, 0, "fail", e.getMessage());
                        FileUtils.deleteQuietly(target);
                    }
                });
            }
            callback.success("downloading");
        });
    }

    private void setDownloadInfo(String downloadId, String path, String fileName, int progress, String status, String error) {
        DownloadInfo downloadInfo = DOWNLOADING_MAP.get(downloadId);
        if (null == downloadInfo) {
            downloadInfo = new DownloadInfo();
            downloadInfo.setDownloadId(downloadId);
            downloadInfo.setPath(path);
            downloadInfo.setFileName(fileName);
            downloadInfo.setProgress(progress);
            downloadInfo.setStatus(status);
            downloadInfo.setError(error);
            DOWNLOADING_MAP.put(downloadId, downloadInfo);
        } else {
            downloadInfo.setStatus(status);
            downloadInfo.setError(error);
            downloadInfo.setProgress(progress);
        }
    }

    @Data
    private static class DownloadInfo {

        private String downloadId;

        private String path;

        private String fileName;

        private Integer progress;

        private String status;

        private String error;
    }
}
