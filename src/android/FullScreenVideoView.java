import android.content.Context;
import android.media.MediaPlayer;
import android.net.Uri;
import android.view.SurfaceHolder;
import android.view.SurfaceView;

import java.io.IOException;

public class FullScreenVideoView extends SurfaceView implements SurfaceHolder.Callback {

    private MediaPlayer mediaPlayer;
    private Uri videoUri;

    public FullScreenVideoView(Context context, Uri videoUri) {
        super(context);
        this.videoUri = videoUri;

        mediaPlayer = new MediaPlayer();
        mediaPlayer.setLooping(true);

        getHolder().addCallback(this);
    }

    @Override
    public void surfaceCreated(SurfaceHolder holder) {
        mediaPlayer.setDisplay(holder);

        try {
            mediaPlayer.setDataSource(getContext(), videoUri);
            mediaPlayer.prepare();
        } catch (IOException e) {
            e.printStackTrace();
        }

        int videoWidth = mediaPlayer.getVideoWidth();
        int videoHeight = mediaPlayer.getVideoHeight();
        float videoRatio = (float) videoWidth / (float) videoHeight;

        int screenWidth = getWidth();
        int screenHeight = getHeight();
        float screenRatio = (float) screenWidth / (float) screenHeight;

        float scaleX = videoRatio / screenRatio;

        if (scaleX >= 1f) {
            scaleY = 1f / scaleX;
        } else {
            scaleX = 1f;
        }

        setScaleX(scaleX);
        setScaleY(scaleY);

        mediaPlayer.start();
    }

    @Override
    public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {
    }

    @Override
    public void surfaceDestroyed(SurfaceHolder holder) {
        mediaPlayer.release();
    }
}
