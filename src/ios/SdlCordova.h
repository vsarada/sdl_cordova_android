//
//  SdlCordova.h
//  CordovaPluginSyncProxy
//
//  Copyright (c) 2013, Ford Motor Company All rights reserved.
//
//

//#import <Cordova/CDV.h>
#import <Cordova/CDVPlugin.h>
#import <Cordova/NSData+Base64.h>

@interface SdlCordova : CDVPlugin

-(void)createProxy:(CDVInvokedUrlCommand*)command;
-(void)registerNewCallbackContext:(CDVInvokedUrlCommand*)command;
-(void)doesProxyExist:(CDVInvokedUrlCommand*)command;
-(void)getPersistentSyncData:(CDVInvokedUrlCommand*)command;
-(void)sendRpcRequest:(CDVInvokedUrlCommand*)command;
-(void)dispose:(CDVInvokedUrlCommand*)command;
-(void)reset:(CDVInvokedUrlCommand*)command;
-(void)getButtonCapabilities:(CDVInvokedUrlCommand*)command;
-(void)getDisplayCapabilities:(CDVInvokedUrlCommand*)command;
-(void)getHmiDisplayLanguage:(CDVInvokedUrlCommand*)command;
-(void)getHmiZoneCapabilities:(CDVInvokedUrlCommand*)command;
-(void)getPresetBankCapabilities:(CDVInvokedUrlCommand*)command;
-(void)getSoftButtonCapabilities:(CDVInvokedUrlCommand*)command;
-(void)getSpeechCapabilities:(CDVInvokedUrlCommand*)command;
-(void)getSyncLanguage:(CDVInvokedUrlCommand*)command;
-(void)getSyncMsgVersion:(CDVInvokedUrlCommand*)command;
-(void)getVehicleType:(CDVInvokedUrlCommand*)command;
-(void)getVrCapabilities:(CDVInvokedUrlCommand*)command;
-(void)getWiproVersion:(CDVInvokedUrlCommand*)command;
-(void)enableSiphonDebug:(CDVInvokedUrlCommand*)command;
-(void)disableSiphonDebug:(CDVInvokedUrlCommand*)command;
-(void)siphonLog:(CDVInvokedUrlCommand*)command;

@end

