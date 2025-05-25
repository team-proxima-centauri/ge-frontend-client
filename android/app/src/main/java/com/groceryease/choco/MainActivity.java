package com.groceryease.choco;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WebView webView = new WebView(this);
        webView.getSettings().setJavaScriptEnabled(true);
        WebView.setWebContentsDebuggingEnabled(true);
        webView.setWebViewClient(new WebViewClient());
        setContentView(webView);

        // 👇 Replace with your local IP or hosted site
        webView.loadUrl("http://192.168.1.9:3000");
    }
}
