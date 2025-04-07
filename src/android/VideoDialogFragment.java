package com.cordova.plugin.splashscreenvideo;

import android.app.Activity;
import android.app.Dialog;
import android.net.Uri;
import android.os.Bundle;

import androidx.fragment.app.DialogFragment;

import androidx.media3.common.MediaItem;
import androidx.media3.common.Player;
import androidx.media3.exoplayer.ExoPlayer;
import androidx.media3.ui.PlayerView;
import androidx.media3.ui.AspectRatioFrameLayout;

import APP_ID_PLACEHOLDER.R;

public class VideoDialogFragment extends DialogFragment {

    @Override
    public Dialog onCreateDialog(Bundle savedInstanceState) {
        Dialog dialog = new Dialog(getActivity(), android.R.style.Theme_Black_NoTitleBar_Fullscreen);

        dialog.setContentView(R.layout.activity_splash_screen_video);

        PlayerView playerView = dialog.findViewById(R.id.playerView);
        playerView.setResizeMode(AspectRatioFrameLayout.RESIZE_MODE_ZOOM);

        ExoPlayer player = new ExoPlayer.Builder(getActivity()).build();
        playerView.setPlayer(player);

        Uri videoUri = Uri.parse("android.resource://" + getActivity().getPackageName() + "/" + R.raw.splashscreen);
        MediaItem mediaItem = MediaItem.fromUri(videoUri);
        player.setMediaItem(mediaItem);
        player.prepare();
        player.play();

        player.addListener(new Player.Listener() {
            @Override
            public void onPlaybackStateChanged(int state) {
                if (state == Player.STATE_ENDED) {
                    dismiss();
                }
            }
        });

        return dialog;
    }
}
