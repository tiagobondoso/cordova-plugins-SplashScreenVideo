/********* cordova-plugin-splashscreen-video.m Cordova Plugin Implementation *******/

#import <Cordova/CDV.h>

@interface CDVSplashScreenVideo : CDVPlugin

@property (nonatomic, strong) NSString* callbackId;

@end


@implementation CDVSplashScreenVideo

- (void)setCallback:(CDVInvokedUrlCommand*)command
{
    self.callbackId = command.callbackId;
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(videoDidFinish:)
                                                 name:@"videoDidFinish"
                                               object:nil];
}

- (void)videoDidFinish:(NSNotification *)notification
{
    [[NSNotificationCenter defaultCenter] removeObserver:self
                                                name:@"videoDidFinish"
                                              object:nil];
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:self.callbackId];
}


@end
