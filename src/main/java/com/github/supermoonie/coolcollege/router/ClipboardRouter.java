package com.github.supermoonie.coolcollege.router;

import com.github.supermoonie.coolcollege.App;
import com.github.supermoonie.coolcollege.utils.ClipboardUtil;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.cef.browser.CefBrowser;
import org.cef.browser.CefFrame;
import org.cef.browser.CefMessageRouter;
import org.cef.callback.CefQueryCallback;
import org.cef.handler.CefMessageRouterHandlerAdapter;

/**
 * @author super_w
 * @since 2021/7/10
 */
@Slf4j
public class ClipboardRouter extends CefMessageRouterHandlerAdapter {

    private static final String CLIPBOARD_COPY_TEXT = "clipboard:copy:text:";

    @Getter
    private final CefMessageRouter router;
    private static ClipboardRouter instance;

    private ClipboardRouter() {
        router = CefMessageRouter.create(new CefMessageRouter.CefMessageRouterConfig("clipboardQuery", "cancelClipboardQuery"));
        router.addHandler(this, true);
    }

    public static ClipboardRouter getInstance() {
        if (null == instance) {
            synchronized (ClipboardRouter.class) {
                if (null == instance) {
                    instance = new ClipboardRouter();
                }
            }
        }
        return instance;
    }

    @Override
    public boolean onQuery(CefBrowser browser, CefFrame frame, long queryId, String request, boolean persistent, CefQueryCallback callback) {
        try {
            if (request.startsWith(CLIPBOARD_COPY_TEXT)) {
                copyText(request, callback);
            } else {
                callback.failure(404, "no cmd found");
                return false;
            }
            return true;
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            callback.failure(500, e.getMessage());
            return false;
        }
    }

    private void copyText(String request, CefQueryCallback callback) {
        String req = request.replace(CLIPBOARD_COPY_TEXT, "");
        if (StringUtils.isEmpty(req)) {
            callback.failure(405, "cmd: " + CLIPBOARD_COPY_TEXT + " args is empty!");
            return;
        }
        App.getInstance().getExecutor().execute(() -> {
            try {
                ClipboardUtil.copyText(req);
                callback.success("");
            } catch (Exception e) {
                log.error(e.getMessage(), e);
                callback.failure(500, e.getMessage());
            }
        });
    }
}
