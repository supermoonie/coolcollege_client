package com.github.supermoonie.coolcollege.router;

import com.github.supermoonie.coolcollege.App;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.SystemUtils;
import org.cef.browser.CefBrowser;
import org.cef.browser.CefFrame;
import org.cef.browser.CefMessageRouter;
import org.cef.callback.CefQueryCallback;
import org.cef.handler.CefMessageRouterHandlerAdapter;

/**
 * @author supermoonie
 * @since 2021/8/18
 */
@Slf4j
public class ComputerRouter extends CefMessageRouterHandlerAdapter {

    private static final String CURRENT_OS = "CURRENT_OS";

    @Getter
    private final CefMessageRouter router;
    private static ComputerRouter instance;

    private ComputerRouter() {
        router = CefMessageRouter.create(new CefMessageRouter.CefMessageRouterConfig("computerQuery", "cancelComputerQuery"));
        router.addHandler(this, true);
    }

    public static ComputerRouter getInstance() {
        if (null == instance) {
            synchronized (ComputerRouter.class) {
                if (null == instance) {
                    instance = new ComputerRouter();
                }
            }
        }
        return instance;
    }

    @Override
    public boolean onQuery(CefBrowser browser, CefFrame frame, long queryId, String request, boolean persistent, CefQueryCallback callback) {
        try {
            if (request.equalsIgnoreCase(CURRENT_OS)) {
                onCurrentOs(callback);
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

    private void onCurrentOs(CefQueryCallback callback) {
        App.getInstance().getExecutor().execute(() -> {
            if (SystemUtils.IS_OS_MAC) {
                callback.success("macos");
            } else if (SystemUtils.IS_OS_WINDOWS) {
                callback.success("win");
            } else if (SystemUtils.IS_OS_LINUX) {
                callback.success("linux");
            } else {
                callback.success("unknown");
            }
        });
    }
}
