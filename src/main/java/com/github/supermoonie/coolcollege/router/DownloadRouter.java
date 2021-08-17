package com.github.supermoonie.coolcollege.router;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.TypeReference;
import com.github.supermoonie.coolcollege.App;
import com.github.supermoonie.coolcollege.router.req.DownloadReq;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.cef.browser.CefBrowser;
import org.cef.browser.CefFrame;
import org.cef.browser.CefMessageRouter;
import org.cef.callback.CefQueryCallback;
import org.cef.handler.CefMessageRouterHandlerAdapter;

import java.util.List;

/**
 * @author supermoonie
 * @since 2021/8/18
 */
@Slf4j
public class DownloadRouter extends CefMessageRouterHandlerAdapter {

    private static final String DOWNLOAD_REQ = "DOWNLOAD_REQ:";

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

    private void onDownloadReq(String request, CefQueryCallback callback) {
        App.getInstance().getExecutor().execute(() -> {
            String reqText = request.substring(DOWNLOAD_REQ.length());
            log.info("reqText: {}", reqText);
            List<DownloadReq> downloadReqList = JSON.parseObject(reqText, new TypeReference<List<DownloadReq>>(){});
            callback.success("downloading");
        });
    }
}
