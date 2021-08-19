package com.github.supermoonie.coolcollege.router;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.TypeReference;
import com.github.supermoonie.coolcollege.App;
import com.github.supermoonie.coolcollege.httpclient.CustomHttpClient;
import com.github.supermoonie.coolcollege.router.req.DownloadReq;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author supermoonie
 * @since 2021/8/18
 */
@Slf4j
public class DownloadRouter extends CefMessageRouterHandlerAdapter {

    private static final Map<String, Integer> DOWNLOADING_MAP = new ConcurrentHashMap<>();

    private static final String DOWNLOAD_REQ = "DOWNLOAD_REQ:";
    private static final String DOWNLOADING_QUERY = "DOWNLOADING_QUERY:";

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
                onDownloadingQuery(request, callback);
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

    private void onDownloadingQuery(String request, CefQueryCallback callback) {
        App.getInstance().getExecutor().execute(() -> {
            String reqText = request.substring(DOWNLOADING_QUERY.length());
            List<String> idList = JSON.parseObject(reqText, new TypeReference<List<String>>() {
            });
            Map<String, Integer> map = new HashMap<>();
            for (String id : idList) {
                Integer progress = DOWNLOADING_MAP.getOrDefault(id, -2);
                map.put(id, progress);
            }
            callback.success(JSON.toJSONString(map));
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
                    File target = new File(req.getSavePath() + File.separator + req.getFileName() + "." + req.getExtension());
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
                                        DOWNLOADING_MAP.put(req.getDownloadId(), progress.intValue());
                                    }
                                }
                                DOWNLOADING_MAP.put(req.getDownloadId(), 100);
                                fos.flush();
                            }
                            return null;
                        });
                    } catch (IOException e) {
                        log.error(e.getMessage(), e);
                        DOWNLOADING_MAP.put(req.getDownloadId(), -1);
                        FileUtils.deleteQuietly(target);
                    }
                });
            }
            callback.success("downloading");
        });
    }
}
