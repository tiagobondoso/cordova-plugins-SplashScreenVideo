package com.cordova.plugin.splashscreenvideo;

import android.content.Context;
import android.util.AttributeSet;
import android.widget.VideoView;

public class FullScreenVideoView extends VideoView {

    public FullScreenVideoView(Context context) {
        super(context);
    }

    public FullScreenVideoView(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public FullScreenVideoView(Context context, AttributeSet attrs, int defStyle) {
        super(context, attrs, defStyle);
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        int width = getDefaultSize(getSuggestedMinimumWidth(), widthMeasureSpec);
        int height = getDefaultSize(getSuggestedMinimumHeight(), heightMeasureSpec);
        if (width > 0) {
            int widthWithoutPadding = width - getPaddingLeft() - getPaddingRight();
            int heightWithoutPadding = height - getPaddingTop() - getPaddingBottom();

            if (widthWithoutPadding > heightWithoutPadding) {
                width = heightWithoutPadding;
            } else {
                height = widthWithoutPadding;
            }
        }
        setMeasuredDimension(width, height);
    }
}
