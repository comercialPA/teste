package app.congregacion.elcalafate;

import android.app.Activity;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

public class MainActivity extends Activity {
    private static final String HOME = "file:///android_asset/index.html";

    private WebView webView;
    private LinearLayout browserBar;
    private TextView browserTitle;
    private ProgressBar progressBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.rgb(244, 248, 250));

        browserBar = createBrowserBar();
        browserBar.setVisibility(View.GONE);
        root.addView(browserBar, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, dp(54)));

        progressBar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progressBar.setMax(100);
        progressBar.setProgress(0);
        progressBar.setVisibility(View.GONE);
        root.addView(progressBar, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, dp(3)));

        webView = new WebView(this);
        root.addView(webView, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f));
        setContentView(root);

        configureWebView();
        webView.loadUrl(HOME);
    }

    private LinearLayout createBrowserBar() {
        LinearLayout bar = new LinearLayout(this);
        bar.setOrientation(LinearLayout.HORIZONTAL);
        bar.setGravity(Gravity.CENTER_VERTICAL);
        bar.setPadding(dp(8), 0, dp(8), 0);
        bar.setBackgroundColor(Color.rgb(11, 79, 108));

        TextView back = toolbarButton("‹");
        back.setTextSize(32);
        back.setContentDescription("Volver");
        back.setOnClickListener(v -> goBackInsideApp());
        bar.addView(back, new LinearLayout.LayoutParams(dp(48), LinearLayout.LayoutParams.MATCH_PARENT));

        browserTitle = new TextView(this);
        browserTitle.setText("Contenido");
        browserTitle.setTextColor(Color.WHITE);
        browserTitle.setTextSize(14);
        browserTitle.setMaxLines(1);
        browserTitle.setEllipsize(android.text.TextUtils.TruncateAt.END);
        browserTitle.setGravity(Gravity.CENTER_VERTICAL);
        browserTitle.setPadding(dp(4), 0, dp(4), 0);
        bar.addView(browserTitle, new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.MATCH_PARENT, 1f));

        TextView home = toolbarButton("Inicio");
        home.setTextSize(12);
        home.setContentDescription("Volver al inicio");
        home.setOnClickListener(v -> webView.loadUrl(HOME));
        bar.addView(home, new LinearLayout.LayoutParams(dp(64), LinearLayout.LayoutParams.MATCH_PARENT));

        return bar;
    }

    private TextView toolbarButton(String text) {
        TextView view = new TextView(this);
        view.setText(text);
        view.setTextColor(Color.WHITE);
        view.setGravity(Gravity.CENTER);
        view.setBackgroundColor(Color.TRANSPARENT);
        view.setClickable(true);
        view.setFocusable(true);
        return view;
    }

    private void configureWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        settings.setBuiltInZoomControls(true);
        settings.setDisplayZoomControls(false);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setMediaPlaybackRequiresUserGesture(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            settings.setSafeBrowsingEnabled(true);
        }

        CookieManager.getInstance().setAcceptCookie(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);
        }

        webView.setWebViewClient(new InternalWebViewClient());
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                progressBar.setProgress(newProgress);
                progressBar.setVisibility(newProgress >= 100 ? View.GONE : View.VISIBLE);
            }

            @Override
            public void onReceivedTitle(WebView view, String title) {
                if (!isLocal(view.getUrl()) && title != null && !title.isBlank()) {
                    browserTitle.setText(title);
                }
            }
        });
    }

    private class InternalWebViewClient extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            return handleNavigation(request.getUrl());
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            return handleNavigation(Uri.parse(url));
        }

        @Override
        public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
            updateBrowserChrome(url);
        }

        @Override
        public void onPageFinished(WebView view, String url) {
            updateBrowserChrome(url);
        }
    }

    private boolean handleNavigation(Uri uri) {
        String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase();

        if (scheme.equals("http") || scheme.equals("https") || scheme.equals("file")) {
            return false; // Todo se mantiene dentro de este WebView.
        }

        if (scheme.equals("intent")) {
            try {
                android.content.Intent intent = android.content.Intent.parseUri(uri.toString(), android.content.Intent.URI_INTENT_SCHEME);
                String fallback = intent.getStringExtra("browser_fallback_url");
                if (fallback != null && (fallback.startsWith("https://") || fallback.startsWith("http://"))) {
                    webView.loadUrl(fallback);
                } else {
                    Toast.makeText(this, "Este enlace requiere una aplicación externa.", Toast.LENGTH_SHORT).show();
                }
            } catch (Exception ignored) {
                Toast.makeText(this, "No se pudo abrir este recurso dentro del app.", Toast.LENGTH_SHORT).show();
            }
            return true;
        }

        Toast.makeText(this, "Enlace no compatible dentro del app.", Toast.LENGTH_SHORT).show();
        return true;
    }

    private void updateBrowserChrome(String url) {
        boolean local = isLocal(url);
        browserBar.setVisibility(local ? View.GONE : View.VISIBLE);
        if (!local) {
            String host = "Contenido";
            try {
                Uri uri = Uri.parse(url);
                if (uri.getHost() != null) host = uri.getHost().replace("www.", "");
            } catch (Exception ignored) {}
            browserTitle.setText(host);
        }
    }

    private boolean isLocal(String url) {
        return url == null || url.startsWith("file:///android_asset/");
    }

    private void goBackInsideApp() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            webView.loadUrl(HOME);
        }
    }

    @Override
    public void onBackPressed() {
        if (!isLocal(webView.getUrl())) {
            goBackInsideApp();
        } else if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }
}
