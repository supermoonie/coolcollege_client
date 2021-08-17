package com.github.supermoonie.coolcollege.scheme;

import com.github.supermoonie.coolcollege.mime.MimeMappings;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.IOUtils;
import org.cef.callback.CefCallback;
import org.cef.handler.CefResourceHandlerAdapter;
import org.cef.misc.IntRef;
import org.cef.misc.StringRef;
import org.cef.network.CefRequest;
import org.cef.network.CefResponse;

import java.io.IOException;
import java.io.InputStream;

/**
 * @author super_w
 * @since 2021/8/12
 */
@Slf4j
public class ClientSchemeHandler extends CefResourceHandlerAdapter {

    private byte[] data;
    private int offset = 0;
    private String mimeType;

    public ClientSchemeHandler() {
        super();
    }

    @Override
    public boolean processRequest(CefRequest request, CefCallback callback) {
        String url = "/static/dist/" + request.getURL().substring("https://a/".length());
        url = url.split("\\?")[0];
        log.info("url: {}", url);
        try (InputStream is = ClientSchemeHandler.class.getResourceAsStream(url)) {
            if (is == null) {
                log.warn("Resource " + url + " NOT found!");
                return false;
            }
            mimeType = null;
            data = null;
            int pos = url.lastIndexOf('.');
            if (pos >= 0 && pos < url.length() - 2) {
                mimeType = MimeMappings.DEFAULT.get(url.substring(pos + 1));
            }
            log.info("mimeType: {}", mimeType);
            data = IOUtils.readFully(is, is.available());
        } catch (IOException e) {
            log.error(e.getMessage(), e);
            return false;
        }
        callback.Continue();
        return true;
    }

    @Override
    public void getResponseHeaders(CefResponse response, IntRef responseLength, StringRef redirectUrl) {
        if (null != data) {
            response.setMimeType(mimeType);
            response.setStatus(200);
            responseLength.set(data.length);
        } else {
            log.warn("data is null");
            response.setStatus(404);
        }

    }

    @Override
    public synchronized boolean readResponse(
            byte[] dataOut, int bytesToRead, IntRef bytesRead, CefCallback callback) {
        boolean hasData = false;

        if (offset < data.length) {
            // Copy the next block of data into the buffer.
            int transferSize = Math.min(bytesToRead, (data.length - offset));
            System.arraycopy(data, offset, dataOut, 0, transferSize);
            offset += transferSize;
            bytesRead.set(transferSize);
            hasData = true;
        } else {
            offset = 0;
            bytesRead.set(0);
        }
        log.info("hasData: {}", hasData);
        return hasData;
    }
}
