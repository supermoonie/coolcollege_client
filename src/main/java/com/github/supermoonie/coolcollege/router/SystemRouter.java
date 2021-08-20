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

import java.io.File;

/**
 * @author supermoonie
 * @since 2021/8/18
 */
@Slf4j
public class SystemRouter extends CefMessageRouterHandlerAdapter {

    private static final String CURRENT_OS = "CURRENT_OS";
    private static final String DEFAULT_DOWNLOAD_FOLDER = "DEFAULT_DOWNLOAD_FOLDER";

    @Getter
    private final CefMessageRouter router;
    private static SystemRouter instance;

    private SystemRouter() {
        router = CefMessageRouter.create(new CefMessageRouter.CefMessageRouterConfig("systemQuery", "cancelSystemQuery"));
        router.addHandler(this, true);
    }

    public static SystemRouter getInstance() {
        if (null == instance) {
            synchronized (SystemRouter.class) {
                if (null == instance) {
                    instance = new SystemRouter();
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
            } else if (request.equalsIgnoreCase(DEFAULT_DOWNLOAD_FOLDER)) {
                onDefaultDownloadFolder(callback);
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

    private void onDefaultDownloadFolder(CefQueryCallback callback) {
        App.getInstance().getExecutor().execute(() -> {
            String userHome = SystemUtils.getUserHome().getAbsolutePath();
            String downloadFolder = userHome + File.separator + "Downloads";
            File folder = new File(downloadFolder);
            if (folder.exists() && folder.isDirectory()) {
                callback.success(downloadFolder);
                return;
            }
            downloadFolder = userHome + File.separator + "Download";
            folder = new File(downloadFolder);
            if (folder.exists() && folder.isDirectory()) {
                callback.success(downloadFolder);
                return;
            }
            downloadFolder = userHome + File.separator + "Desktop";
            folder = new File(downloadFolder);
            if (folder.exists() && folder.isDirectory()) {
                callback.success(downloadFolder);
                return;
            }
            callback.success(userHome);
        });
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
