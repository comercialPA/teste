package com.perlaandina.citytouraudio;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.res.AssetFileDescriptor;
import android.graphics.Color;
import android.graphics.Typeface;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.SeekBar;
import android.widget.TextView;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends Activity {

    private static final String PREFS = "city_tour_player";
    private static final String PREF_TRACK = "track_index";
    private static final String PREF_POSITION = "track_position";

    private static final class Track {
        final String title;
        final String subtitle;
        final String assetName;

        Track(String title, String subtitle, String assetName) {
            this.title = title;
            this.subtitle = subtitle;
            this.assetName = assetName;
        }
    }

    private final List<Track> tracks = new ArrayList<Track>();
    private final List<TextView> trackRows = new ArrayList<TextView>();
    private final Handler handler = new Handler(Looper.getMainLooper());

    private MediaPlayer mediaPlayer;
    private AudioManager audioManager;
    private int currentIndex = 0;
    private boolean userSeeking = false;

    private TextView nowPlayingTitle;
    private TextView nowPlayingMeta;
    private TextView timeCurrent;
    private TextView timeTotal;
    private SeekBar progress;
    private Button playPause;

    private final Runnable progressUpdater = new Runnable() {
        @Override
        public void run() {
            updateProgressUi();
            handler.postDelayed(this, 300);
        }
    };

    private final AudioManager.OnAudioFocusChangeListener focusChangeListener =
            new AudioManager.OnAudioFocusChangeListener() {
                @Override
                public void onAudioFocusChange(int focusChange) {
                    if (mediaPlayer == null) return;
                    if (focusChange == AudioManager.AUDIOFOCUS_LOSS ||
                            focusChange == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT) {
                        if (mediaPlayer.isPlaying()) pausePlayback();
                    } else if (focusChange == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK) {
                        mediaPlayer.setVolume(0.25f, 0.25f);
                    } else if (focusChange == AudioManager.AUDIOFOCUS_GAIN) {
                        mediaPlayer.setVolume(1f, 1f);
                    }
                }
            };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        setVolumeControlStream(AudioManager.STREAM_MUSIC);

        loadTrackCatalog();
        buildUi();

        SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        int savedTrack = prefs.getInt(PREF_TRACK, 0);
        int savedPosition = prefs.getInt(PREF_POSITION, 0);
        if (savedTrack < 0 || savedTrack >= tracks.size()) savedTrack = 0;
        prepareTrack(savedTrack, false, savedPosition);
        handler.post(progressUpdater);
    }

    private void loadTrackCatalog() {
        tracks.add(new Track("1 · Salida City Tour", "01:19", "audio/audio_01_salida_city_tour.mp3"));
        tracks.add(new Track("2 · Alto Calafate", "01:22", "audio/audio_02_alto_calafate.mp3"));
        tracks.add(new Track("3 · Cuevas del Walichu", "01:25", "audio/audio_03_cuevas_del_walichu.mp3"));
        tracks.add(new Track("3.1 · Entre Cuevas y Laguna", "02:23", "audio/audio_031_entre_cuevas_y_laguna.mp3"));
        tracks.add(new Track("3.2 · Entre cuevas y Laguna Nimez", "01:39", "audio/audio_032_entre_cuevas_y_laguna_nimez.mp3"));
        tracks.add(new Track("4 · Laguna Nimez", "01:06", "audio/audio_04_laguna_nimez.mp3"));
        tracks.add(new Track("5 · Cartel El Calafate", "01:25", "audio/audio_05_cartel_el_calafate.mp3"));
        tracks.add(new Track("5.1 · Entre cartel y Punta Soberana", "02:14", "audio/audio_051_entre_cartel_y_punta_soberana.mp3"));
        tracks.add(new Track("6 · Punta Soberana", "01:02", "audio/audio_06_punta_soberana.mp3"));
        tracks.add(new Track("6.1 · Perito Pascacio Moreno", "01:59", "audio/audio_061_perito_pascacio_moreno.mp3"));
        tracks.add(new Track("El Azul Antiguo", "02:51", "audio/audio_07_el_azul_antiguo.mp3"));
        tracks.add(new Track("Palabra del Sur (Poesía Hablada)", "02:58", "audio/audio_08_palabra_del_sur_poesia_hablada.mp3"));
        tracks.add(new Track("Lago Argentino (Chacarera)", "03:42", "audio/audio_09_lago_argentino_chacarera.mp3"));
        tracks.add(new Track("Gente del Chaltén (Ancestral Folk)", "03:45", "audio/audio_10_gente_del_chalten_ancestral_folk.mp3"));
        tracks.add(new Track("Humo de Pedra (Loncomeo Mix)", "03:10", "audio/audio_11_humo_de_pedra_loncomeo_mix.mp3"));
        tracks.add(new Track("Cancha Carrera (Folk Rock Fusion)", "02:45", "audio/audio_12_cancha_carrera_folk_rock_fusion.mp3"));
        tracks.add(new Track("Darwin - Poesía Hablada (Voz Priorizada)", "03:09", "audio/audio_13_darwin_poesia_hablada_voz_priorizada.mp3"));
    }

    private void buildUi() {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(18), dp(16), dp(18), dp(16));
        root.setBackgroundColor(Color.rgb(12, 17, 24));

        TextView appTitle = text("CITY TOUR", 24, Color.rgb(244, 247, 250), true);
        TextView version = text("OFFLINE · v1.0.2 PERLA ANDINA", 11, Color.rgb(142, 200, 242), true);
        version.setLetterSpacing(0.12f);
        root.addView(appTitle);
        root.addView(version, marginTop(dp(2)));

        TextView libraryLabel = text("Roteiro", 14, Color.rgb(170, 183, 196), true);
        root.addView(libraryLabel, marginTop(dp(18)));

        ScrollView scroll = new ScrollView(this);
        LinearLayout list = new LinearLayout(this);
        list.setOrientation(LinearLayout.VERTICAL);
        scroll.addView(list);

        for (int i = 0; i < tracks.size(); i++) {
            final int index = i;
            Track t = tracks.get(i);
            TextView row = text(t.title + "\n" + t.subtitle, 16, Color.rgb(244, 247, 250), false);
            row.setLineSpacing(0f, 1.15f);
            row.setPadding(dp(14), dp(12), dp(14), dp(12));
            row.setBackgroundColor(Color.rgb(20, 28, 38));
            row.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    prepareTrack(index, true, 0);
                }
            });
            trackRows.add(row);
            list.addView(row, marginTop(dp(8)));
        }

        LinearLayout.LayoutParams scrollParams = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f);
        scrollParams.topMargin = dp(6);
        root.addView(scroll, scrollParams);

        LinearLayout playerCard = new LinearLayout(this);
        playerCard.setOrientation(LinearLayout.VERTICAL);
        playerCard.setPadding(dp(16), dp(14), dp(16), dp(14));
        playerCard.setBackgroundColor(Color.rgb(20, 28, 38));

        nowPlayingMeta = text("AGORA REPRODUZINDO", 10, Color.rgb(142, 200, 242), true);
        nowPlayingMeta.setLetterSpacing(0.08f);
        nowPlayingTitle = text("", 17, Color.rgb(244, 247, 250), true);
        playerCard.addView(nowPlayingMeta);
        playerCard.addView(nowPlayingTitle, marginTop(dp(4)));

        progress = new SeekBar(this);
        progress.setMax(1000);
        progress.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override public void onProgressChanged(SeekBar seekBar, int value, boolean fromUser) {}
            @Override public void onStartTrackingTouch(SeekBar seekBar) { userSeeking = true; }
            @Override public void onStopTrackingTouch(SeekBar seekBar) {
                if (mediaPlayer != null && mediaPlayer.getDuration() > 0) {
                    int target = (int) ((seekBar.getProgress() / 1000f) * mediaPlayer.getDuration());
                    mediaPlayer.seekTo(target);
                }
                userSeeking = false;
            }
        });
        playerCard.addView(progress, marginTop(dp(8)));

        LinearLayout times = new LinearLayout(this);
        times.setOrientation(LinearLayout.HORIZONTAL);
        timeCurrent = text("00:00", 11, Color.rgb(170, 183, 196), false);
        timeTotal = text("00:00", 11, Color.rgb(170, 183, 196), false);
        times.addView(timeCurrent, new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f));
        LinearLayout.LayoutParams rightTime = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f);
        timeTotal.setGravity(Gravity.END);
        times.addView(timeTotal, rightTime);
        playerCard.addView(times);

        LinearLayout controls = new LinearLayout(this);
        controls.setOrientation(LinearLayout.HORIZONTAL);
        controls.setGravity(Gravity.CENTER);

        Button prev = button("◀◀");
        playPause = button("▶");
        Button next = button("▶▶");

        prev.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) { playPrevious(); }
        });
        playPause.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) { togglePlayPause(); }
        });
        next.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) { playNext(); }
        });

        controls.addView(prev, controlParams());
        controls.addView(playPause, controlParams());
        controls.addView(next, controlParams());
        playerCard.addView(controls, marginTop(dp(8)));

        root.addView(playerCard, marginTop(dp(12)));
        setContentView(root);
    }

    private void prepareTrack(int index, boolean autoplay, int initialPositionMs) {
        if (index < 0 || index >= tracks.size()) return;

        boolean wasPlaying = mediaPlayer != null && mediaPlayer.isPlaying();
        releasePlayerOnly();
        currentIndex = index;
        Track track = tracks.get(currentIndex);

        AssetFileDescriptor audioFile = null;
        try {
            audioFile = getAssets().openFd(track.assetName);
            mediaPlayer = new MediaPlayer();
            mediaPlayer.setDataSource(
                    audioFile.getFileDescriptor(),
                    audioFile.getStartOffset(),
                    audioFile.getLength());
            mediaPlayer.prepare();
        } catch (Exception error) {
            releasePlayerOnly();
            nowPlayingTitle.setText("Falha ao abrir o áudio");
            return;
        } finally {
            if (audioFile != null) {
                try { audioFile.close(); } catch (Exception ignored) {}
            }
        }

        mediaPlayer.setOnCompletionListener(new MediaPlayer.OnCompletionListener() {
            @Override
            public void onCompletion(MediaPlayer mp) {
                playNext();
            }
        });

        if (initialPositionMs > 0 && initialPositionMs < mediaPlayer.getDuration() - 1000) {
            mediaPlayer.seekTo(initialPositionMs);
        }

        nowPlayingTitle.setText(track.title);
        timeTotal.setText(formatTime(mediaPlayer.getDuration()));
        refreshTrackHighlight();
        updateProgressUi();

        if (autoplay || wasPlaying) {
            startPlayback();
        } else {
            playPause.setText("▶");
        }
        saveState();
    }

    private void togglePlayPause() {
        if (mediaPlayer == null) {
            prepareTrack(currentIndex, true, 0);
            return;
        }
        if (mediaPlayer.isPlaying()) pausePlayback();
        else startPlayback();
    }

    private void startPlayback() {
        if (mediaPlayer == null) return;
        int result = audioManager.requestAudioFocus(
                focusChangeListener,
                AudioManager.STREAM_MUSIC,
                AudioManager.AUDIOFOCUS_GAIN);
        if (result == AudioManager.AUDIOFOCUS_REQUEST_GRANTED) {
            mediaPlayer.setVolume(1f, 1f);
            mediaPlayer.start();
            playPause.setText("❚❚");
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        }
    }

    private void pausePlayback() {
        if (mediaPlayer != null && mediaPlayer.isPlaying()) mediaPlayer.pause();
        if (playPause != null) playPause.setText("▶");
        getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        saveState();
    }

    private void playNext() {
        int next = currentIndex + 1;
        if (next >= tracks.size()) next = 0;
        prepareTrack(next, true, 0);
    }

    private void playPrevious() {
        if (mediaPlayer != null && mediaPlayer.getCurrentPosition() > 5000) {
            mediaPlayer.seekTo(0);
            updateProgressUi();
            saveState();
            return;
        }
        int previous = currentIndex - 1;
        if (previous < 0) previous = tracks.size() - 1;
        prepareTrack(previous, true, 0);
    }

    private void updateProgressUi() {
        if (mediaPlayer == null || progress == null) return;
        int duration = mediaPlayer.getDuration();
        int position = mediaPlayer.getCurrentPosition();
        if (duration > 0 && !userSeeking) {
            progress.setProgress((int) ((position * 1000L) / duration));
        }
        timeCurrent.setText(formatTime(position));
        timeTotal.setText(formatTime(duration));
    }

    private void refreshTrackHighlight() {
        for (int i = 0; i < trackRows.size(); i++) {
            TextView row = trackRows.get(i);
            if (i == currentIndex) {
                row.setBackgroundColor(Color.rgb(32, 50, 72));
                row.setTextColor(Color.rgb(244, 247, 250));
            } else {
                row.setBackgroundColor(Color.rgb(20, 28, 38));
                row.setTextColor(Color.rgb(244, 247, 250));
            }
        }
    }

    private void saveState() {
        int position = 0;
        if (mediaPlayer != null) position = Math.max(0, mediaPlayer.getCurrentPosition());
        getSharedPreferences(PREFS, MODE_PRIVATE)
                .edit()
                .putInt(PREF_TRACK, currentIndex)
                .putInt(PREF_POSITION, position)
                .apply();
    }

    private void releasePlayerOnly() {
        if (mediaPlayer != null) {
            try { mediaPlayer.stop(); } catch (Exception ignored) {}
            mediaPlayer.release();
            mediaPlayer = null;
        }
    }

    @Override
    protected void onStop() {
        super.onStop();
        saveState();
    }

    @Override
    protected void onDestroy() {
        handler.removeCallbacks(progressUpdater);
        saveState();
        releasePlayerOnly();
        if (audioManager != null) audioManager.abandonAudioFocus(focusChangeListener);
        super.onDestroy();
    }

    private TextView text(String value, int sp, int color, boolean bold) {
        TextView t = new TextView(this);
        t.setText(value);
        t.setTextSize(sp);
        t.setTextColor(color);
        if (bold) t.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        return t;
    }

    private Button button(String label) {
        Button b = new Button(this);
        b.setText(label);
        b.setTextSize(20);
        b.setTextColor(Color.WHITE);
        b.setBackgroundColor(Color.TRANSPARENT);
        b.setAllCaps(false);
        return b;
    }

    private LinearLayout.LayoutParams controlParams() {
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(0, dp(52), 1f);
        p.leftMargin = dp(4);
        p.rightMargin = dp(4);
        return p;
    }

    private LinearLayout.LayoutParams marginTop(int top) {
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT);
        p.topMargin = top;
        return p;
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private String formatTime(int ms) {
        int totalSeconds = Math.max(0, ms / 1000);
        int minutes = totalSeconds / 60;
        int seconds = totalSeconds % 60;
        return String.format(java.util.Locale.US, "%02d:%02d", minutes, seconds);
    }
}
