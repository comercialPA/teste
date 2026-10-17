package app.congregacion.elcalafate;

import android.app.Activity;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.Base64;
import android.view.Gravity;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.TreeSet;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MainActivity extends Activity {
    private static final String HOME = "file:///android_asset/index.html";
    private static final int MAX_DOWNLOAD_BYTES = 6_000_000;

    private static final Set<String> ALLOWED_SHEETS = new HashSet<>(Arrays.asList(
            "1gLPJ8AXiADvFoztBJC0Wf-umVAS4GpN9RF0fGXlE7kk",
            "1SfJQfHRblwVM891QvDnu6fbZewb_l1gx0iYoHIU5YNg",
            "1K4BowT0kvU1zlbMw0M9cFA8ToMp9CaTHSqag64x7UWc",
            "1tnW0uSGdfcsO2ldEyyUpLAMO2mI9ttABnzmgSQc2OUE",
            "1SjYd-8pDMTshIQATZaYapMhhavhrNJ5tj7PKt7bu0NA",
            "1AamlWyb8Kuh1Ou4ib0cxD-E740x-v8_VjMCcwEOmf0c",
            "1F9U5PgnoCBr50g_3rRDPbQExzMdNKhepFIjz67XaoNc",
            "1MjKoX4IHKKarkk0wl7IHCITY9mDIzqvQTZhO_DE6rlk",
            "1BD346D9zBPeKGC4cyV0dkzv3e6BBwYaVYN_Hs3Xe9KQ"
    ));

    private WebView webView;
    private LinearLayout browserBar;
    private TextView browserTitle;
    private ProgressBar progressBar;
    private final ExecutorService networkExecutor = Executors.newFixedThreadPool(3);
    private volatile long lastStreetFetch = 0L;

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
        webView.addJavascriptInterface(new AppBridge(), "AndroidBridge");
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

    public final class AppBridge {
        @JavascriptInterface
        public void loadSheet(String resourceId, String spreadsheetId) {
            if (!safeResourceId(resourceId) || !ALLOWED_SHEETS.contains(spreadsheetId)) {
                sendSheetError(resourceId, "Planilla no autorizada dentro de esta aplicación.");
                return;
            }
            networkExecutor.execute(() -> {
                try {
                    String csv = fetchSheetCsv(spreadsheetId);
                    String payload = Base64.encodeToString(csv.getBytes(StandardCharsets.UTF_8), Base64.NO_WRAP);
                    sendJs("window.__cecReceiveSheet(" + JSONObject.quote(resourceId) + "," + JSONObject.quote(payload) + ");");
                } catch (Exception e) {
                    sendSheetError(resourceId, "No se pudo leer la planilla. Verificá la conexión o la visibilidad pública del archivo.");
                }
            });
        }

        @JavascriptInterface
        public void loadElCalafateStreets() {
            long now = System.currentTimeMillis();
            if (now - lastStreetFetch < 10_000L) return;
            lastStreetFetch = now;
            networkExecutor.execute(() -> {
                try {
                    String query = "[out:json][timeout:25];way[\"highway\"][\"name\"](-50.40,-72.38,-50.27,-72.16);out tags;";
                    String endpoint = "https://overpass-api.de/api/interpreter?data=" + URLEncoder.encode(query, StandardCharsets.UTF_8.name());
                    JSONObject root = new JSONObject(fetchText(endpoint));
                    JSONArray elements = root.optJSONArray("elements");
                    TreeSet<String> names = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
                    if (elements != null) {
                        for (int i = 0; i < elements.length(); i++) {
                            JSONObject tags = elements.optJSONObject(i) == null ? null : elements.optJSONObject(i).optJSONObject("tags");
                            if (tags == null) continue;
                            String name = tags.optString("name", "").trim();
                            if (!name.isEmpty() && name.length() <= 120) names.add(name);
                        }
                    }
                    JSONArray out = new JSONArray();
                    for (String name : names) out.put(name);
                    sendJs("window.__cecReceiveStreetCatalog(" + JSONObject.quote(out.toString()) + ");");
                } catch (Exception e) {
                    sendJs("window.__cecStreetCatalogError(" + JSONObject.quote("No se pudieron cargar las calles desde OpenStreetMap.") + ");");
                }
            });
        }
    }

    private String fetchSheetCsv(String spreadsheetId) throws Exception {
        String gviz = "https://docs.google.com/spreadsheets/d/" + spreadsheetId + "/gviz/tq?tqx=out:csv&headers=1";
        String csv = fetchText(gviz);
        if (looksLikeHtml(csv)) {
            String fallback = "https://docs.google.com/spreadsheets/d/" + spreadsheetId + "/export?format=csv";
            csv = fetchText(fallback);
        }
        if (looksLikeHtml(csv)) throw new IllegalStateException("Google returned HTML instead of CSV");
        return csv;
    }

    private boolean looksLikeHtml(String text) {
        if (text == null) return true;
        String t = text.trim().toLowerCase();
        return t.startsWith("<!doctype html") || t.startsWith("<html") || t.contains("accounts.google.com");
    }

    private String fetchText(String address) throws Exception {
        HttpURLConnection conn = (HttpURLConnection) new URL(address).openConnection();
        conn.setConnectTimeout(15_000);
        conn.setReadTimeout(30_000);
        conn.setInstanceFollowRedirects(true);
        conn.setRequestProperty("User-Agent", "CongElCalafate/1.3 Android");
        conn.setRequestProperty("Accept", "text/csv,text/plain,application/json,*/*");

        int status = conn.getResponseCode();
        if (status < 200 || status >= 300) {
            conn.disconnect();
            throw new IllegalStateException("HTTP " + status);
        }

        try (InputStream in = conn.getInputStream(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[8192];
            int read;
            int total = 0;
            while ((read = in.read(buffer)) != -1) {
                total += read;
                if (total > MAX_DOWNLOAD_BYTES) throw new IllegalStateException("Response too large");
                out.write(buffer, 0, read);
            }
            return out.toString(StandardCharsets.UTF_8.name());
        } finally {
            conn.disconnect();
        }
    }

    private boolean safeResourceId(String id) {
        return id != null && id.length() <= 80 && id.matches("[A-Za-z0-9_-]+");
    }

    private void sendSheetError(String resourceId, String message) {
        String id = resourceId == null ? "" : resourceId;
        sendJs("window.__cecSheetError(" + JSONObject.quote(id) + "," + JSONObject.quote(message) + ");");
    }

    private void sendJs(String script) {
        runOnUiThread(() -> {
            if (webView != null) webView.evaluateJavascript(script, null);
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
        if (webView.canGoBack()) webView.goBack();
        else webView.loadUrl(HOME);
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

    @Override
    protected void onDestroy() {
        networkExecutor.shutdownNow();
        if (webView != null) {
            webView.removeJavascriptInterface("AndroidBridge");
            webView.destroy();
        }
        super.onDestroy();
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }
}
