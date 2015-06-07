//
//  ProxyEvents.h
//  CordovaPluginSdlProxy
//
//  Copyright (c) 2013, Ford Motor Company All rights reserved.
//
//

#import <Foundation/Foundation.h>

FOUNDATION_EXPORT NSString * const SDLCDVProxyEventProxyEventKey;

FOUNDATION_EXPORT NSString * const SDLCDVProxyEventNameKey;
FOUNDATION_EXPORT NSString * const SDLCDVProxyEventOnFirstAccessKey;
FOUNDATION_EXPORT NSString * const SDLCDVProxyEventInfoKey;
FOUNDATION_EXPORT NSString * const SDLCDVProxyEventExceptionKey;
FOUNDATION_EXPORT NSString * const SDLCDVProxyEventParametersKey;
FOUNDATION_EXPORT NSString * const SDLCDVProxyEventOnProxyClosedKey;
FOUNDATION_EXPORT NSString * const SDLCDVProxyEventOnErrorKey;

@interface ProxyEvents : NSObject

@end
