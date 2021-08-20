package com.github.supermoonie.coolcollege;

import com.formdev.flatlaf.FlatDarkLaf;
import com.formdev.flatlaf.FlatLightLaf;
import com.formdev.flatlaf.extras.FlatSVGUtils;
import com.github.supermoonie.coolcollege.handler.AppHandler;
import com.github.supermoonie.coolcollege.handler.DisplayHandler;
import com.github.supermoonie.coolcollege.handler.FocusHandler;
import com.github.supermoonie.coolcollege.handler.ResourceRequestHandler;
import com.github.supermoonie.coolcollege.router.*;
import com.github.supermoonie.coolcollege.ui.MenuBar;
import com.github.supermoonie.coolcollege.utils.Folders;
import com.github.supermoonie.coolcollege.utils.PropertiesUtil;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.SystemUtils;
import org.apache.commons.lang3.concurrent.BasicThreadFactory;
import org.cef.CefApp;
import org.cef.CefClient;
import org.cef.CefSettings;
import org.cef.JCefLoader;
import org.cef.browser.CefBrowser;
import org.cef.browser.CefFrame;
import org.cef.handler.CefRequestHandlerAdapter;
import org.cef.handler.CefResourceRequestHandler;
import org.cef.misc.BoolRef;
import org.cef.network.CefRequest;

import javax.swing.*;
import java.awt.*;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;
import java.io.File;
import java.util.List;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.prefs.Preferences;

/**
 * @author super_w
 * @since 2021/8/17
 */
@Slf4j
public class App extends JFrame {

    public static final String USER_AGENT = SystemUtils.IS_OS_WINDOWS ?
            "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36"
            :
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.164 Safari/537.36";

    @Getter
    private static App instance;
    @Getter
    private final CefApp cefApp;
    @Getter
    private final CefClient client;
    @Getter
    private final CefBrowser cefBrowser;
    @Getter
    private final ScheduledExecutorService executor;
    @Getter
    private static Preferences preferences;

    public App(String[] args, Color bgColor) throws Exception {
        // init executor
        executor = new ScheduledThreadPoolExecutor(
                10,
                new BasicThreadFactory.Builder()
                        .namingPattern("schedule-exec-%d")
                        .daemon(false)
                        .uncaughtExceptionHandler((thread, throwable) -> {
                            String error = String.format("thread: %s, error: %s", thread.toString(), throwable.getMessage());
                            log.error(error, throwable);
                        }).build(), (r, executor) -> log.warn("Thread: {} reject by {}", r.toString(), executor.toString()));
        List<Image> icons = FlatSVGUtils.createWindowIconImages("/Tools.svg");
        setIconImages(icons);
        File cefPath = Folders.createTempFolder(".coolcollege", ".cef");
        CefSettings settings = new CefSettings();
        settings.windowless_rendering_enabled = false;
        settings.cache_path = cefPath.getAbsolutePath();
        String debugLogPath = cefPath.getAbsolutePath() + File.separator + "debug.log";
        settings.log_file = debugLogPath;
        new File(debugLogPath).deleteOnExit();
        settings.persist_session_cookies = true;
        settings.user_agent = USER_AGENT;
        settings.background_color = settings.new ColorType(bgColor.getAlpha(), bgColor.getRed(), bgColor.getGreen(), bgColor.getBlue());
        CefApp.addAppHandler(new AppHandler(args));
        cefApp = JCefLoader.installAndLoadCef(settings);
        client = cefApp.createClient();
        String indexUrl = "https://pro.coolcollege.cn/#/index-auth-login-new?source=ding";
        String eid = preferences.get("/cool_college/eid", null);
        if (StringUtils.isNotEmpty(eid)) {
            indexUrl = String.format("https://pro.coolcollege.cn/?eid=%s#/home", eid);
        }
        log.info("indexUrl: {}", indexUrl);
        cefBrowser = client.createBrowser(indexUrl, false, false);
        client.addFocusHandler(new FocusHandler());
        client.addDisplayHandler(new DisplayHandler());
        client.addRequestHandler(new CefRequestHandlerAdapter() {
            @Override
            public CefResourceRequestHandler getResourceRequestHandler(CefBrowser browser, CefFrame frame, CefRequest request, boolean isNavigation, boolean isDownload, String requestInitiator, BoolRef disableDefaultHandling) {
                return new ResourceRequestHandler();
            }
        });
        Component uiComponent = cefBrowser.getUIComponent();
        getContentPane().add(uiComponent, BorderLayout.CENTER);
        if (!PropertiesUtil.isRelease()) {
            MenuBar menuBar = new MenuBar(this, cefBrowser);
            setJMenuBar(menuBar);
        }
        addRouter();
        addWindowListener(new WindowAdapter() {

            @Override
            public void windowClosing(WindowEvent e) {
                client.dispose();
                App.this.dispose();
                executor.shutdown();
                try {
                    boolean ignore = executor.awaitTermination(5, TimeUnit.SECONDS);
                    log.info("ignore: {}", ignore);
                } catch (InterruptedException ex) {
                    log.error(ex.getMessage(), ex);
                }
                System.exit(0);
            }
        });
        Dimension screenSize = Toolkit.getDefaultToolkit().getScreenSize();
        setLocation(screenSize.width / 2 - 1000 / 2, screenSize.height / 2 - 800 / 2);
        setMinimumSize(new Dimension(1000, 800));
        setExtendedState(JFrame.MAXIMIZED_BOTH);
        setResizable(true);
        setFocusable(true);
        setAutoRequestFocus(true);
        setVisible(true);
    }

    private void addRouter() {
        client.addMessageRouter(ThemeRouter.getInstance().getRouter());
        client.addMessageRouter(SystemRouter.getInstance().getRouter());
        client.addMessageRouter(PreferencesRouter.getInstance().getRouter());
        client.addMessageRouter(DownloadRouter.getInstance().getRouter());
        client.addMessageRouter(ClipboardRouter.getInstance().getRouter());
        client.addMessageRouter(FileRouter.getInstance().getRouter());
    }

    public static void main(String[] args) {
        try {
            java.awt.Toolkit.getDefaultToolkit();
            JFrame.setDefaultLookAndFeelDecorated(true);
            JDialog.setDefaultLookAndFeelDecorated(true);
            if (SystemUtils.IS_OS_MAC) {
                System.setProperty("apple.laf.useScreenMenuBar", "true");
                System.setProperty("apple.awt.UIElement", "true");
            }
            preferences = Preferences.userRoot().node("/coolcollege");
            String themeName = preferences.get("/theme", FlatDarkLaf.class.getName());
            log.info("current theme: {}", themeName);
            FlatLightLaf.setup();
            FlatDarkLaf.setup();
            UIManager.setLookAndFeel(themeName);
            Color bgColor = themeName.equals(FlatDarkLaf.class.getName()) ?
                    new Color(48, 48, 48, 255) :
                    new Color(250, 250, 250, 255);
            instance = new App(args, bgColor);
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            System.exit(0);
        }

    }
}
