//
//  CordovaParameters.h
//  CordovaPluginSdlProxy
//
//  Copyright (c) 2013 Ford Motor Company. All rights reserved.
//
#import <Foundation/Foundation.h>

FOUNDATION_EXPORT NSString * const SDLCDVParametersAppNameKey;
FOUNDATION_EXPORT NSString * const SDLCDVParametersAppId;
FOUNDATION_EXPORT NSString * const SDLCDVParametersIsMediaApplicationKey;
FOUNDATION_EXPORT NSString * const SDLCDVParametersNGNMediaScreenAppNameKey;
FOUNDATION_EXPORT NSString * const SDLCDVParametersVRSynonymsKey;
FOUNDATION_EXPORT NSString * const SDLCDVParametersSyncMsgVersionKey;
FOUNDATION_EXPORT NSString * const SDLCDVParametersMajorVersionKey;
FOUNDATION_EXPORT NSString * const SDLCDVParametersMinorVersionKey;
FOUNDATION_EXPORT NSString * const SDLCDVParametersLanguageKey;
FOUNDATION_EXPORT NSString * const SDLCDVParametersHMILanguageKey;
FOUNDATION_EXPORT NSString * const SDLCDVParametersAutoActivateIDKey;

FOUNDATION_EXPORT NSString * const SDLCDVProxyExistsKey;
FOUNDATION_EXPORT NSString * const SDLCDVRegisterListenerResponseKey;
FOUNDATION_EXPORT NSString * const SDLCDVRegisterListenerInfoKey;

@interface CordovaParameters : NSObject

@end
