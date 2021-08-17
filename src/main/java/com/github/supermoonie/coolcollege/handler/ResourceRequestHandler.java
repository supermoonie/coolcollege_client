package com.github.supermoonie.coolcollege.handler;

import com.github.supermoonie.coolcollege.App;
import com.github.supermoonie.coolcollege.utils.PropertiesUtil;
import lombok.extern.slf4j.Slf4j;
import org.cef.browser.CefBrowser;
import org.cef.browser.CefFrame;
import org.cef.handler.CefResourceRequestHandlerAdapter;
import org.cef.network.CefRequest;

import javax.swing.*;

/**
 * @author supermoonie
 * @since 2021/8/17
 */
@Slf4j
public class ResourceRequestHandler extends CefResourceRequestHandlerAdapter {

    private static final String COOL_COLLEGE_URL = "https://coolapi.coolcollege.cn/enterprise-api/score/getMyScoreSummary?access_token=";

    @Override
    public boolean onBeforeResourceLoad(CefBrowser browser, CefFrame frame, CefRequest request) {
        String url = request.getURL();
        if (url.startsWith(COOL_COLLEGE_URL)) {
            final String token = url.substring(COOL_COLLEGE_URL.length());
            log.info("token: {}", token);
            SwingUtilities.invokeLater(() -> {
                String host = PropertiesUtil.getHost();
                App.getInstance().getCefBrowser().loadURL(host + "/index.html?token=" + token);
            });
        }
        return super.onBeforeResourceLoad(browser, frame, request);
    }
}
