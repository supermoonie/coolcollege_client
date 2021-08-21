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

    private static final String COOL_COLLEGE_GET_SUMMARY_URL = "https://coolapi.coolcollege.cn/enterprise-api/score/getMyScoreSummary?access_token=";
    private static final String COOL_COLLEGE_HOME_URL = "https://pro.coolcollege.cn/?eid=";

    @Override
    public boolean onBeforeResourceLoad(CefBrowser browser, CefFrame frame, CefRequest request) {
        String url = request.getURL();
        if (url.startsWith(COOL_COLLEGE_HOME_URL)) {
            String eid = url.substring(COOL_COLLEGE_HOME_URL.length()).replaceAll("#/home", "");
            App.getPreferences().put("/cool_college/eid", eid);
        } else if (url.startsWith(COOL_COLLEGE_GET_SUMMARY_URL)) {
            final String token = url.substring(COOL_COLLEGE_GET_SUMMARY_URL.length());
            log.info("frame: {}, token: {}", frame.getURL(), token);
            if (frame.getURL().startsWith(PropertiesUtil.getHost())) {
                return super.onBeforeResourceLoad(browser, frame, request);
            }
            SwingUtilities.invokeLater(() -> {
                App.getPreferences().put("/cool_college/token", token);
                String eid = App.getPreferences().get("/cool_college/eid", "");
                String host = PropertiesUtil.getHost();
                App.getInstance().getCefBrowser().loadURL(host + "/index.html?token=" + token + "&eid=" + eid);
            });
        }
        return super.onBeforeResourceLoad(browser, frame, request);
    }
}
