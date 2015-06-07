//
//  SdlCordova.m
//  CordovaPluginSdlProxy
//
//  Copyright (c) 2013, Ford Motor Company All rights reserved.
//
//

#import "SdlCordova.h"
#import <SmartDeviceLink/SmartDeviceLink.h>
#import <SmartDeviceLink/SDLNames.h>
#import <SmartDeviceLink/SDLProxyALM.h>

#import "Actions.h"
#import "ProxyEvents.h"
#import <SmartDeviceLink/SDLProxyALM.h>
#import "CordovaParameters.h"
#import "PersistentSyncData.h"
#import "CordovaParameters.h"

static id<CDVCommandDelegate> proxyCallbackDelegate;
static NSString* proxyCommandCallbackId;

@interface SdlCordova()<SDLProxyListener>


@property (strong, nonatomic) SDLProxyALM* sdlProxy;
@property (strong, nonatomic) SDLOnHMIStatus* currentHMIStatusNotification;
@property (strong, nonatomic) PersistentSyncData* persistentSyncData;
@property (strong, nonatomic) NSMutableDictionary* pendingRPCRequests;
@property (nonatomic) BOOL receivedFirstNonNoneHMI;

@end

@implementation SdlCordova

-(PersistentSyncData*)persistentSyncData{
    if (!_persistentSyncData) _persistentSyncData = [[PersistentSyncData alloc] init];
    return _persistentSyncData;
}

-(NSMutableDictionary*)pendingRPCRequests{
    if (!_pendingRPCRequests) _pendingRPCRequests = [[NSMutableDictionary alloc] init];
    return _pendingRPCRequests;
}

+(CDVPluginResult*)createRegisterListenerResponseWithStatusCode:(CDVCommandStatus)statusCode info:(NSString*)info{
    NSMutableDictionary* parametersObject = [[NSMutableDictionary alloc] init];
    NSMutableDictionary* registerListenerJSON = [[NSMutableDictionary alloc] init];
    
    CDVPluginResult* pluginResult;
    
    if (info) {
        [parametersObject setValue:info forKey:SDLCDVRegisterListenerInfoKey];
        [registerListenerJSON setValue:parametersObject forKey:SDLCDVRegisterListenerResponseKey];
        pluginResult = [CDVPluginResult resultWithStatus:statusCode messageAsDictionary:registerListenerJSON];
        if (statusCode == CDVCommandStatus_OK) {
            [pluginResult setKeepCallbackAsBool:YES];
        }
    }
    
    return pluginResult;
}

-(void)createProxy:(CDVInvokedUrlCommand*)command{
    
    [SDLDebugTool logInfo:[NSString stringWithFormat:@"Class: %@, Method: %@", NSStringFromClass([self class]), NSStringFromSelector(_cmd)]];
    
    
    if (!self.commandDelegate) {
        NSLog(@"Could not execute command %@. No command Delegate.", NSStringFromSelector(_cmd));
        return;
    }
    
    if (self.sdlProxy) {
        NSString* errorString = @"SdlProxy already created. User registerNewListener to attach another listener";
        [self.commandDelegate sendPluginResult:[SdlCordova createRegisterListenerResponseWithStatusCode:CDVCommandStatus_ERROR info:errorString] callbackId:command.callbackId];
        return;
    }
    
    if (!command) {
        NSString* errorString = [NSString stringWithFormat:@"Cordova command was nil. Ignoring %@ call", NSStringFromSelector(_cmd)];
        [self.commandDelegate sendPluginResult:[SdlCordova createRegisterListenerResponseWithStatusCode:CDVCommandStatus_ERROR info:errorString] callbackId:command.callbackId];
        return;
    }
    
    NSDictionary* argumentsObject = command.arguments[0];
    
    if (![argumentsObject isKindOfClass:[NSDictionary class]]) {
        NSString* errorString = [NSString stringWithFormat:@"Error: Command argument type at index 0, %@, is not the correct.  Expected NSDictionary.", [command.arguments[0] class]];
        [self.commandDelegate sendPluginResult:[SdlCordova createRegisterListenerResponseWithStatusCode:CDVCommandStatus_ERROR info:errorString] callbackId:command.callbackId];
        return;
    }
    
    NSString* appName;
    NSNumber* isMediaApp;
    NSString* ngnMediaScreenAppName;
    SDLLanguage* hmiLanguageDesired;
    NSString* appId;
    SDLLanguage* languageDesired;
    SDLSyncMsgVersion* syncMsgVersion;
    NSString* autoActivateID;
    NSArray* vrSynonyms;
    SDLProxyALMOptions* proxyOptions = [[SDLProxyALMOptions alloc] init];
    
    @try {
        
        //Initialize SDLSdlProxyALM parameters
        appName = argumentsObject[SDLCDVParametersAppNameKey];
        appId = argumentsObject[SDLCDVParametersAppId];
        
        if (argumentsObject[SDLCDVParametersIsMediaApplicationKey]) {
            isMediaApp = @([argumentsObject[SDLCDVParametersIsMediaApplicationKey] boolValue]);
        }
                
        ngnMediaScreenAppName = argumentsObject[SDLCDVParametersNGNMediaScreenAppNameKey];
        vrSynonyms = argumentsObject[SDLCDVParametersVRSynonymsKey];
        
        NSDictionary* syncMsgVersionJSON = argumentsObject[SDLCDVParametersSyncMsgVersionKey];
        
        if (syncMsgVersionJSON) {
            syncMsgVersion = [[SDLSyncMsgVersion alloc] init];
            syncMsgVersion.majorVersion = syncMsgVersionJSON[SDLCDVParametersMajorVersionKey];
            syncMsgVersion.minorVersion = syncMsgVersionJSON[SDLCDVParametersMinorVersionKey];            
        }
        
        NSString* languageDesiredString = argumentsObject[SDLCDVParametersLanguageKey];
        

        if (languageDesiredString) {
            languageDesired =  [SDLLanguage EN_US];
            proxyOptions.languageDesired = languageDesired;
        }
        
        NSString* hmiLanguageDesiredString = argumentsObject[SDLCDVParametersHMILanguageKey];
        
        if (hmiLanguageDesiredString) {
            hmiLanguageDesired = [SDLLanguage EN_US];//[SDLLanguage valueOf: hmiLanguageDesiredString];
            proxyOptions.hmiDisplayLanguageDesired = hmiLanguageDesired;
        }
        
        autoActivateID = argumentsObject[SDLCDVParametersAutoActivateIDKey];
    }
    @catch (NSException *exception) {
        
        NSString* argsFormat = [NSString stringWithFormat:@"{ %@: String, %@: boolean}", NAMES_appName, NAMES_isMediaApplication];
        NSString* errorString = [NSString stringWithFormat:@"%@ args not in correct format.  Format = %@. %@", SDLCDVActionCreateProxy, argsFormat, [exception reason]];
        
        [self.commandDelegate sendPluginResult:[SdlCordova createRegisterListenerResponseWithStatusCode:CDVCommandStatus_ERROR info:errorString] callbackId:command.callbackId];
        return;
    }
    @try {
           [SDLDebugTool logInfo:[NSString stringWithFormat:@"Inside 2nd try ..Class: %@, Method: %@", NSStringFromClass([self class]), NSStringFromSelector(_cmd)]];
       
        [SDLDebugTool logInfo:[NSString stringWithFormat:@" AppName : %@ , AppID = %@", appName, appId]];
        
        self.sdlProxy = [[SDLProxyALM alloc] initWithProxyDelegate:self
                                                               appName:appName
                                                            isMediaApp:isMediaApp
//                                                 ngnMediaScreenAppName:ngnMediaScreenAppName
//                                                            vrSynonyms:vrSynonyms
//                                                        syncMsgVersion:syncMsgVersion
//                                                       languageDesired:languageDesired
//                                                    hmiLanguageDesired:hmiLanguageDesired
//                                                        autoActivateID:autoActivateID
                                                                 appID:appId
                                                            options:proxyOptions];
           [SDLDebugTool logInfo:[NSString stringWithFormat:@" After setting sdl proxy...Class: %@, Method: %@", NSStringFromClass([self class]), NSStringFromSelector(_cmd)]];
    }
    @catch (NSException *exception) {
        NSString* errorString = [NSString stringWithFormat:@"%@ could not create SDLProxyALM.", NSStringFromSelector(_cmd)];
        [SDLDebugTool logInfo:[NSString stringWithFormat:@" After setting sdl proxy...Class: %@, Method: %@", NSStringFromClass([self class]), NSStringFromSelector(_cmd)]];
        [self.commandDelegate sendPluginResult:[SdlCordova createRegisterListenerResponseWithStatusCode:CDVCommandStatus_ERROR info:errorString] callbackId:command.callbackId];
        return;
    }
    
    if (!self.sdlProxy) {
        NSString* errorString = [NSString stringWithFormat:@"%@ could not create SDLProxyALM.", NSStringFromSelector(_cmd)];
        [self.commandDelegate sendPluginResult:[SdlCordova createRegisterListenerResponseWithStatusCode:CDVCommandStatus_ERROR info:errorString] callbackId:command.callbackId];
        return;
    }
    
    proxyCallbackDelegate = self.commandDelegate;
    proxyCommandCallbackId = command.callbackId;
    
    [self.commandDelegate sendPluginResult:[SdlCordova createRegisterListenerResponseWithStatusCode:CDVCommandStatus_OK info:@"Callback registered successfully."] callbackId:command.callbackId];
    
       [SDLDebugTool logInfo:[NSString stringWithFormat:@"ENd of 2nd try ..Class: %@, Method: %@", NSStringFromClass([self class]), NSStringFromSelector(_cmd)]];
}

-(void)registerNewCallbackContext:(CDVInvokedUrlCommand*)command{
    
    if (!self.commandDelegate) {
        NSLog(@"Could not execute command %@. No command Delegate.", NSStringFromSelector(_cmd));
        return;
    }

    if (!self.sdlProxy) {
        NSString* errorString = [NSString stringWithFormat:@"Could not execute command, %@. No SdlProxy object has been instantiated. Call %@ first.", NSStringFromSelector(_cmd), SDLCDVActionCreateProxy];
        [self.commandDelegate sendPluginResult:[SdlCordova createRegisterListenerResponseWithStatusCode:CDVCommandStatus_ERROR info:errorString] callbackId:command.callbackId];
        return;
    }
    
    proxyCallbackDelegate = self.commandDelegate;
    proxyCommandCallbackId = command.callbackId;
    
    [self.commandDelegate sendPluginResult:[SdlCordova createRegisterListenerResponseWithStatusCode:CDVCommandStatus_OK info:@"Callback registered successfully."] callbackId:command.callbackId];
    
    if (self.currentHMIStatusNotification) {
        [self onOnHMIStatus:self.currentHMIStatusNotification];
    }
}

-(void)doesProxyExist:(CDVInvokedUrlCommand*)command{
    
    if (!self.commandDelegate) {
        NSLog(@"Could not execute command %@. No command Delegate.", NSStringFromSelector(_cmd));
        return;
    }
    
    BOOL doesProxyExist = NO;

    if (self.sdlProxy) {
        doesProxyExist = YES;
    }
    
    NSMutableDictionary* jsonReturnArgs = [[NSMutableDictionary alloc] init];
    [jsonReturnArgs setValue:@(doesProxyExist) forKey:SDLCDVProxyExistsKey];
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:[jsonReturnArgs copy]];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

-(void)getPersistentSyncData:(CDVInvokedUrlCommand*)command{
    
    if (!self.commandDelegate) {
        NSLog(@"Could not execute command %@. No command Delegate.", NSStringFromSelector(_cmd));
        return;
    }
    
    if (!self.sdlProxy) {
        NSString* errorString = [NSString stringWithFormat:@"Could not execute command, %@. No SdlProxy object has been instantiated. Call %@ first.", NSStringFromSelector(_cmd), SDLCDVActionCreateProxy];
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:errorString];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        return;
    }
    
    NSDictionary* json = [self.persistentSyncData JSONObject];
    
    if (!json) {
        NSString* jsonErrorString = [NSString stringWithFormat:@"Could not return %@.  Empty JSON object.", NSStringFromSelector(_cmd)];
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:jsonErrorString];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        return;
    }
        
    CDVPluginResult* returnPluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:json];
    [self.commandDelegate sendPluginResult:returnPluginResult callbackId:command.callbackId];
}

-(void)sendRpcRequest:(CDVInvokedUrlCommand*)command{
    
    if (!self.sdlProxy) {
        NSString* errorString = [NSString stringWithFormat:@"Could not execute command. No SdlProxy object has been instanciated. Call %@ first.", SDLCDVActionCreateProxy];
        CDVPluginResult* returnPluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:errorString];
        if (self.commandDelegate) {
            [self.commandDelegate sendPluginResult:returnPluginResult callbackId:command.callbackId];
        }
        else{
            NSLog(@"Could not execute command %@. No command Delegate.", NSStringFromSelector(_cmd));
        }
        return;
    }
    
    SDLRPCRequest* rpcRequest;
    NSMutableDictionary* rpcRequestJSON;
    
    if ([command.arguments count] != 1) {
        NSString* errorString = @"Not all arguments were present";
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:errorString];
        if (self.commandDelegate) {
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        }
        else{
            NSLog(@"Could not execute command %@. No command Delegate.", NSStringFromSelector(_cmd));
        }
        return;
    }
    
    rpcRequestJSON = command.arguments[0];
    @try {
        rpcRequest = [[SDLRPCRequest alloc] initWithDictionary:rpcRequestJSON];
    }
    @catch (NSException *exception) {
        //[SDLRPCRequest initWithDictionary] throws exception
        NSString* errorString = [NSString stringWithFormat:@"%@ args not in correct format. Format = %@. %@", NSStringFromSelector(_cmd), @"[JSONObject rpcRequestJson", [exception reason]];
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:errorString];
        if (self.commandDelegate) {
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        }
        else{
            NSLog(@"Could not execute command %@. No command Delegate.", NSStringFromSelector(_cmd));
        }
        return;
    }
    
    if (!rpcRequest) {
        NSString* errorString = @"Could not create RPCRequest. Check RPC parameters.";
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:errorString];
        
        if (self.commandDelegate) {
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        }
        else{
            NSLog(@"Could not execute command %@. No command Delegate.", NSStringFromSelector(_cmd));
        }
        return;
    }
    
    if ([rpcRequest.name isEqualToString:NAMES_AddCommand]
        || [rpcRequest.name isEqualToString:NAMES_CreateInteractionChoiceSet]
        || [rpcRequest.name isEqualToString:NAMES_SubscribeButton]
        || [rpcRequest.name isEqualToString:NAMES_AddSubMenu]
        ) {
        if (![self.pendingRPCRequests valueForKey:[NSString stringWithFormat:@"%@", rpcRequest.correlationID]]) {
            [self.pendingRPCRequests setValue:rpcRequest forKey:[NSString stringWithFormat:@"%@", rpcRequest.correlationID]];
        }
    }
    
    [self.sdlProxy sendRPCRequest:rpcRequest];
    
    if (self.commandDelegate) {
        CDVPluginResult* successPluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:successPluginResult callbackId:command.callbackId];
    }
    else{
        NSLog(@"Could not execute command %@. No command Delegate.", NSStringFromSelector(_cmd));
    }
}

-(void)dispose:(CDVInvokedUrlCommand*)command{
    
    if (!self.sdlProxy) {
        NSString* errorString = [NSString stringWithFormat:@"Could not execute command, %@. No SdlProxy object has been instantiated. Call %@ first.", NSStringFromSelector(_cmd), SDLCDVActionCreateProxy];
        
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:errorString];
        if (self.commandDelegate) {
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        }
        else{
            NSLog(@"Could not execute command %@. No command Delegate.", NSStringFromSelector(_cmd));
        }
        return;
    }
    
    [self.sdlProxy dispose];
    self.sdlProxy = nil;
    [self resetLifecycleVariables];
    
    CDVPluginResult* successPluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    if (self.commandDelegate) {
        [self.commandDelegate sendPluginResult:successPluginResult callbackId:command.callbackId];
    }
    else{
        NSLog(@"Could not execute command %@. No command Delegate.", NSStringFromSelector(_cmd));
    }
}

-(void)resetLifecycleVariables{
    self.currentHMIStatusNotification = nil;
    self.persistentSyncData = nil;
    self.receivedFirstNonNoneHMI = NO;
}

-(void)reset:(CDVInvokedUrlCommand*)command{
    
    [SDLDebugTool logInfo:[NSString stringWithFormat:@"Class: %@, Method: %@", NSStringFromClass([self class]), NSStringFromSelector(_cmd)]];
    
    
    if (!self.sdlProxy) {
        NSString* errorString = [NSString stringWithFormat:@"Could not execute command, %@. No SdlProxy object has been instantiated. Call %@ first.", NSStringFromSelector(_cmd), SDLCDVActionCreateProxy];
        
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:errorString];
        if (self.commandDelegate) {
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        }
        else{
            NSLog(@"Could not execute command %@. No command Delegate.", NSStringFromSelector(_cmd));
        }
        return;
    }
    
    [self.sdlProxy resetProxy];
    [self resetLifecycleVariables];
    
    CDVPluginResult* successPluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    if (self.commandDelegate) {
        [self.commandDelegate sendPluginResult:successPluginResult callbackId:command.callbackId];
    }
    else{
        NSLog(@"Could not execute command %@. No command Delegate.", NSStringFromSelector(_cmd));
    }
}

-(void)getButtonCapabilities:(CDVInvokedUrlCommand*)command{
    
    if (!self.commandDelegate) {
        NSLog(@"Could not execute command %@. No command Delegate.", NSStringFromSelector(_cmd));
        return;
    }
    
    if (!self.sdlProxy) {
        NSString* errorString = [NSString stringWithFormat:@"Could not execute command, %@. No SdlProxy object has been instantiated. Call %@ first.", NSStringFromSelector(_cmd), SDLCDVActionCreateProxy];
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:errorString];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        return;
    }
    
    NSArray* buttonCapabilitiesArray = self.sdlProxy.buttonCapabilities;
    
    if (!buttonCapabilitiesArray) {
        NSString* errorString = [NSString stringWithFormat:@"No value returned by call: %@", NSStringFromSelector(_cmd)];
        
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:errorString];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        return;
    }
    
    NSMutableArray* buttonCapabilitesJSONArray = [[NSMutableArray alloc] init];
    for (SDLButtonCapabilities* buttonCapabilities in buttonCapabilitiesArray) {
        [buttonCapabilitesJSONArray addObject:[buttonCapabilities serializeAsDictionary:2]];  // TODO Check that VERSION can be hardcoded
    }
    
    CDVPluginResult* successPluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray:[buttonCapabilitesJSONArray copy]];
    [self.commandDelegate sendPluginResult:successPluginResult callbackId:command.callbackId];
}

-(void)getDisplayCapabilities:(CDVInvokedUrlCommand*)command{
    
    if (!self.commandDelegate) {
        NSLog(@"Could not execute command %@. No command Delegate.", NSStringFromSelector(_cmd));
        return;
    }
    
    if (!self.sdlProxy) {
        NSString* errorString = [NSString stringWithFormat:@"Could not execute command, %@. No SdlProxy object has been instantiated. Call %@ first.", NSStringFromSelector(_cmd), SDLCDVActionCreateProxy];
        
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:errorString];
            
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        return;
    }
    
    SDLDisplayCapabilities* displayCapabilities = self.sdlProxy.displayCapabilities;
    
    if (!displayCapabilities) {
        NSString* errorString = [NSString stringWithFormat:@"No value returned by call: %@", NSStringFromSelector(_cmd)];
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:errorString];
            
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        return;
    }
    
    NSDictionary* displayCapabilitesJSON = [[displayCapabilities serializeAsDictionary:2] copy];
    
    CDVPluginResult* successPluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:displayCapabilitesJSON];
    [self.commandDelegate sendPluginResult:successPluginResult callbackId:command.callbackId];
}

-(void)getHmiDisplayLanguage:(CDVInvokedUrlCommand*)command{
    
    if (!self.commandDelegate) {
        NSLog(@"Could not execute command %@. No command Delegate.", NSStringFromSelector(_cmd));
        return;
    }
    
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[NSString stringWithFormat:@"%@ currently unsupported.", NSStringFromSelector(_cmd)]];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

-(void)getHmiZoneCapabilities:(CDVInvokedUrlCommand*)command{
    
    if (!self.commandDelegate) {
        NSLog(@"Could not execute command %@. No command Delegate.", NSStringFromSelector(_cmd));
        return;
    }
    
    if (!self.sdlProxy) {
        NSString* errorString = [NSString stringWithFormat:@"Could not execute command, %@. No SdlProxy object has been instantiated. Call %@ first.", NSStringFromSelector(_cmd), SDLCDVActionCreateProxy];
        
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:errorString];
            
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        return;
    }
    
    NSArray* hmiZoneCapabilitiesArray = self.sdlProxy.hmiZoneCapabilities;
    if (!hmiZoneCapabilitiesArray) {
        NSString* errorString = [NSString stringWithFormat:@"No value returned by call: %@", NSStringFromSelector(_cmd)];
        
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:errorString];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        return;
    }
    
    NSMutableArray* hmiZoneCapabilitiesJSONArray = [[NSMutableArray alloc] init];
    for (SDLHMIZoneCapabilities* hmiZoneCapabilities in hmiZoneCapabilitiesArray) {
        [hmiZoneCapabilitiesJSONArray addObject:[hmiZoneCapabilities value]];
    }
    
    CDVPluginResult* successPluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray:[hmiZoneCapabilitiesJSONArray copy]];
    [self.commandDelegate sendPluginResult:successPluginResult callbackId:command.callbackId];
}

-(void)getPresetBankCapabilities:(CDVInvokedUrlCommand*)command{
    
    if (!self.commandDelegate) {
        NSLog(@"Could not execute command %@. No command Delegate.", NSStringFromSelector(_cmd));
        return;
    }
    
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[NSString stringWithFormat:@"%@ currently unsupported.", NSStringFromSelector(_cmd)]];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

-(void)getSoftButtonCapabilities:(CDVInvokedUrlCommand*)command{
    
    if (!self.commandDelegate) {
        NSLog(@"Could not execute command %@. No command Delegate.", NSStringFromSelector(_cmd));
        return;
    }
    
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[NSString stringWithFormat:@"%@ currently unsupported.", NSStringFromSelector(_cmd)]];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

-(void)getSpeechCapabilities:(CDVInvokedUrlCommand*)command{
    
    if (!self.commandDelegate) {
        NSLog(@"Could not execute command %@. No command Delegate.", NSStringFromSelector(_cmd));
        return;
    }
    
    if (!self.sdlProxy) {
        NSString* errorString = [NSString stringWithFormat:@"Could not execute command, %@. No SdlProxy object has been instantiated. Call %@ first.", NSStringFromSelector(_cmd), SDLCDVActionCreateProxy];
        
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:errorString];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        return;
    }
    
    NSArray* speechCapabilitiesArray = self.sdlProxy.speechCapabilities;
    
    if (!speechCapabilitiesArray) {
        NSString* errorString = [NSString stringWithFormat:@"No value returned by call: %@", NSStringFromSelector(_cmd)];
        
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:errorString];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        return;
    }
    
    NSMutableArray* speechCapabilitiesJSONArray = [[NSMutableArray alloc] init];
    for (SDLSpeechCapabilities* speechCapabilities in speechCapabilitiesArray) {
        [speechCapabilitiesJSONArray addObject:[speechCapabilities value]];
    }
    
    CDVPluginResult* successPluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray:[speechCapabilitiesJSONArray copy]];
    [self.commandDelegate sendPluginResult:successPluginResult callbackId:command.callbackId];
}

-(void)getSyncLanguage:(CDVInvokedUrlCommand*)command{
    
    if (!self.commandDelegate) {
        NSLog(@"Could not execute command %@. No command Delegate.", NSStringFromSelector(_cmd));
        return;
    }
    
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[NSString stringWithFormat:@"%@ currently unsupported.", NSStringFromSelector(_cmd)]];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

-(void)getSyncMsgVersion:(CDVInvokedUrlCommand*)command{

    if (!self.commandDelegate) {
        NSLog(@"Could not execute command %@. No command Delegate.", NSStringFromSelector(_cmd));
        return;
    }
    
    if (!self.sdlProxy) {
        NSString* errorString = [NSString stringWithFormat:@"Could not execute command, %@. No SdlProxy object has been instantiated. Call %@ first.", NSStringFromSelector(_cmd), SDLCDVActionCreateProxy];
        
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:errorString];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        return;
    }
    
    SDLSyncMsgVersion* syncMsgVersion = self.sdlProxy.sdlSyncMsgVersion;
    
    if (!syncMsgVersion) {
        NSString* errorString = [NSString stringWithFormat:@"No value returned by call: %@", NSStringFromSelector(_cmd)];
        
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:errorString];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        return;
    }
    
    NSDictionary* syncMsgVersionJSON = [[syncMsgVersion serializeAsDictionary:2] copy];
    
    CDVPluginResult* successPluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:syncMsgVersionJSON];
    [self.commandDelegate sendPluginResult:successPluginResult callbackId:command.callbackId];
}

-(void)getVehicleType:(CDVInvokedUrlCommand*)command{
    
    if (!self.commandDelegate) {
        NSLog(@"Could not execute command %@. No command Delegate.", NSStringFromSelector(_cmd));
        return;
    }
    
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[NSString stringWithFormat:@"%@ currently unsupported.", NSStringFromSelector(_cmd)]];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

-(void)getVrCapabilities:(CDVInvokedUrlCommand*)command{
    
    if (!self.commandDelegate) {
        NSLog(@"Could not execute command %@. No command Delegate.", NSStringFromSelector(_cmd));
        return;
    }
    
    if (!self.sdlProxy) {
        NSString* errorString = [NSString stringWithFormat:@"Could not execute command, %@. No SdlProxy object has been instantiated. Call %@ first.", NSStringFromSelector(_cmd), SDLCDVActionCreateProxy];
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:errorString];
            
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        return;
    }
    
    NSArray* vrCapabilitesArray = self.sdlProxy.vrCapabilities;
    
    if (!vrCapabilitesArray) {
        NSString* errorString = [NSString stringWithFormat:@"No value returned by call: %@", NSStringFromSelector(_cmd)];
        
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:errorString];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        return;
    }
    
    NSMutableArray* vrCapabilitiesJSONArray = [[NSMutableArray alloc] init];
    for (SDLVrCapabilities* vrCapabilities in vrCapabilitesArray) {
        [vrCapabilitiesJSONArray addObject:[vrCapabilities value]];
    }

    CDVPluginResult* successPluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray:[vrCapabilitiesJSONArray copy]];
    [self.commandDelegate sendPluginResult:successPluginResult callbackId:command.callbackId];
}

-(void)getWiproVersion:(CDVInvokedUrlCommand*)command{
    
    if (!self.commandDelegate) {
        NSLog(@"Could not execute command %@. No command Delegate.", NSStringFromSelector(_cmd));
        return;
    }
    
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[NSString stringWithFormat:@"%@ currently unsupported.", NSStringFromSelector(_cmd)]];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

-(void)enableSiphonDebug:(CDVInvokedUrlCommand*)command{
    
    [SDLProxyALM enableSiphonDebug];
    
    [SDLDebugTool logInfo:[NSString stringWithFormat:@"Class: %@, Method: %@", NSStringFromClass([self class]), NSStringFromSelector(_cmd)]];
    
    
    if (self.commandDelegate) {
        CDVPluginResult* successPluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:successPluginResult callbackId:command.callbackId];
    }
}

-(void)disableSiphonDebug:(CDVInvokedUrlCommand*)command{

    [SDLProxyALM disableSiphonDebug];

    if (self.commandDelegate) {
        CDVPluginResult* successPluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:successPluginResult callbackId:command.callbackId];
    }
}

-(void)sendRPCCallback:(NSDictionary*)info{
    
    if (!proxyCallbackDelegate) {
        NSLog(@"Could not execute command %@. No command Delegate.", NSStringFromSelector(_cmd));
        return;
    }
    
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:info];
    [result setKeepCallbackAsBool:YES];
    [proxyCallbackDelegate sendPluginResult:result callbackId:proxyCommandCallbackId];
}

-(void)siphonLog:(CDVInvokedUrlCommand*)command{
    id message = command.arguments[0];
    
    if ([message isKindOfClass:[NSString class]]) {
        bool didSiphonLog = [SDLSiphonServer _siphonNSLogData:message];
        if (self.commandDelegate) {
            if (didSiphonLog) {
                CDVPluginResult* successPluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
                [self.commandDelegate sendPluginResult:successPluginResult callbackId:command.callbackId];
            }
            else{
                CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Siphon failed to send log message. Ensure Siphon is enabled and connected."];
                [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
            }
        }
    }
    else{
        if (self.commandDelegate) {
            CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Could not log message.  Parameter type not valid."];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        }
    }
}

#pragma mark ProxyALMDelegate Methods

-(void) onOnHMIStatus:(SDLOnHMIStatus*) notification{
    if (!self.receivedFirstNonNoneHMI) {
        if (notification.hmiLevel != SDLHMILevel.HMI_NONE) {
            self.receivedFirstNonNoneHMI = YES;
            [self onProxyFirstAccess];
        }
    }

    self.currentHMIStatusNotification = notification;
    [self sendRPCCallback:[self jsonFromRPC:notification]];
}

-(void) onOnEncodedSyncPData:(SDLOnEncodedSyncPData*) notification{
    [self sendRPCCallback:[self jsonFromRPC:notification]];
}

-(void) onOnTBTClientState:(SDLOnTBTClientState*) notification{
    [self sendRPCCallback:[self jsonFromRPC:notification]];
}

-(void) onOnDriverDistraction:(SDLOnDriverDistraction*) notification{
    [self sendRPCCallback:[self jsonFromRPC:notification]];
}

-(void) onOnButtonEvent:(SDLOnButtonEvent*) notification{
    [self sendRPCCallback:[self jsonFromRPC:notification]];
}

-(void) onOnButtonPress:(SDLOnButtonPress*) notification{
    [self sendRPCCallback:[self jsonFromRPC:notification]];
}

-(void) onOnCommand:(SDLOnCommand*) notification{
    [self sendRPCCallback:[self jsonFromRPC:notification]];
}

-(void) onAddCommandResponse:(SDLAddCommandResponse*) response{
    
    SDLRPCRequest* pendingRPCRequest = [self pendingRPCRequestFromRPCResponse:response];
    
    if(!pendingRPCRequest){
        NSLog(@"No pending rpc request found. Could not add to persistant SYNC Data.");
    } else {
        SDLAddCommand* addCommand = [[SDLAddCommand alloc] initWithDictionary:[pendingRPCRequest serializeAsDictionary:2]];
        [self.persistentSyncData addCommand:addCommand];
    }
    
    [self sendRPCCallback:[self jsonFromRPC:response]];
}

-(void) onAddSubMenuResponse:(SDLAddSubMenuResponse*) response{
    
    SDLRPCRequest* pendingRPCRequest = [self pendingRPCRequestFromRPCResponse:response];
    
    if(!pendingRPCRequest){
        NSLog(@"No pending rpc request found. Could not add to persistant SYNC Data.");
    } else {
        SDLAddSubMenu* subMenu = [[SDLAddSubMenu alloc] initWithDictionary:[pendingRPCRequest serializeAsDictionary:2]];  // TODO Check that VERSION can be hardcoded]];
        [self.persistentSyncData addSubMenu:subMenu];
    }
    
    [self sendRPCCallback:[self jsonFromRPC:response]];
}

-(void) onAlertResponse:(SDLAlertResponse*) response{
    [self sendRPCCallback:[self jsonFromRPC:response]];
}

-(void) onCreateInteractionChoiceSetResponse:(SDLCreateInteractionChoiceSetResponse*) response{
    
    SDLRPCRequest* pendingRPCRequest = [self pendingRPCRequestFromRPCResponse:response];
    
    if(!pendingRPCRequest){
        NSLog(@"No pending rpc request found. Could not add to persistant SYNC Data.");
    } else {
        SDLCreateInteractionChoiceSet* addChoiceSet = [[SDLCreateInteractionChoiceSet alloc] initWithDictionary:[pendingRPCRequest serializeAsDictionary:2]];  // TODO Check that VERSION can be hardcoded]];
        [self.persistentSyncData addChoiceSet:addChoiceSet];
    }
    
    [self sendRPCCallback:[self jsonFromRPC:response]];
}

-(void) onDeleteCommandResponse:(SDLDeleteCommandResponse*) response{
    
    SDLRPCRequest* pendingRPCRequest = [self pendingRPCRequestFromRPCResponse:response];
    
    if(!pendingRPCRequest){
        NSLog(@"No pending rpc request found. Could not add to persistant SYNC Data.");
    } else {
        SDLDeleteCommand* deleteCommand = [[SDLDeleteCommand alloc] initWithDictionary:[pendingRPCRequest serializeAsDictionary:2]];  // TODO Check that VERSION can be hardcoded]];
        [self.persistentSyncData removeCommand:deleteCommand];
    }
        
    [self sendRPCCallback:[self jsonFromRPC:response]];
}

-(void) onDeleteInteractionChoiceSetResponse:(SDLDeleteInteractionChoiceSetResponse*) response{
    
    SDLRPCRequest* pendingRPCRequest = [self pendingRPCRequestFromRPCResponse:response];
    
    if(!pendingRPCRequest){
        NSLog(@"No pending rpc request found. Could not add to persistant SYNC Data.");
    } else {
        SDLDeleteInteractionChoiceSet* deleteICS = [[SDLDeleteInteractionChoiceSet alloc] initWithDictionary:[pendingRPCRequest serializeAsDictionary:2]];  // TODO Check that VERSION can be hardcoded]];
        [self.persistentSyncData removeChoiceSet:deleteICS];
    }
        
    [self sendRPCCallback:[self jsonFromRPC:response]];
}

-(void) onDeleteSubMenuResponse:(SDLDeleteSubMenuResponse*) response{
    
    SDLRPCRequest* pendingRPCRequest = [self pendingRPCRequestFromRPCResponse:response];
    
    if(!pendingRPCRequest){
        NSLog(@"No pending rpc request found. Could not add to persistant SYNC Data.");
    } else {
        SDLDeleteSubMenu* deleteSubMenu = [[SDLDeleteSubMenu alloc] initWithDictionary:[pendingRPCRequest serializeAsDictionary:2]];  // TODO Check that VERSION can be hardcoded]];
        [self.persistentSyncData removeSubMenu:deleteSubMenu];
    }
    
    [self sendRPCCallback:[self jsonFromRPC:response]];
}

-(void) onEncodedSyncPDataResponse:(SDLEncodedSyncPDataResponse*) response{
    [self sendRPCCallback:[self jsonFromRPC:response]];
}

-(void) onPerformInteractionResponse:(SDLPerformInteractionResponse*) response{
    [self sendRPCCallback:[self jsonFromRPC:response]];
}

-(void) onSetGlobalPropertiesResponse:(SDLSetGlobalPropertiesResponse*) response{
    [self sendRPCCallback:[self jsonFromRPC:response]];
}

-(void) onResetGlobalPropertiesResponse:(SDLResetGlobalPropertiesResponse*) response{
    [self sendRPCCallback:[self jsonFromRPC:response]];
}

-(void) onSetMediaClockTimerResponse:(SDLSetMediaClockTimerResponse*) response{
    [self sendRPCCallback:[self jsonFromRPC:response]];
}

-(void) onShowResponse:(SDLShowResponse*) response{
    [self sendRPCCallback:[self jsonFromRPC:response]];
}

-(void) onSpeakResponse:(SDLSpeakResponse*) response{
    [self sendRPCCallback:[self jsonFromRPC:response]];
}

-(void) onSubscribeButtonResponse:(SDLSubscribeButtonResponse*) response{
    
    SDLRPCRequest* pendingRPCRequest = [self pendingRPCRequestFromRPCResponse:response];
    
    if(!pendingRPCRequest){
        NSLog(@"No pending rpc request found. Could not add to persistant SYNC Data.");
    } else {
        SDLSubscribeButton* subscribeButton = [[SDLSubscribeButton alloc] initWithDictionary:[pendingRPCRequest serializeAsDictionary:2]];  // TODO Check that VERSION can be hardcoded]];
        [self.persistentSyncData addButtonSubscription:subscribeButton];
    }
    
    [self sendRPCCallback:[self jsonFromRPC:response]];
}

-(void) onUnsubscribeButtonResponse:(SDLUnsubscribeButtonResponse*) response{
    
    SDLRPCRequest* pendingRPCRequest = [self pendingRPCRequestFromRPCResponse:response];
    
    if(!pendingRPCRequest){
        NSLog(@"No pending rpc request found. Could not add to persistant SYNC Data.");
    } else {
        SDLUnsubscribeButton* unsubscribeButton = [[SDLUnsubscribeButton alloc] initWithDictionary:[pendingRPCRequest serializeAsDictionary:2]];  // TODO Check that VERSION can be hardcoded]];
        [self.persistentSyncData removeButtonSubscription:unsubscribeButton];
    }
    
    [self sendRPCCallback:[self jsonFromRPC:response]];
}

-(void) onGenericResponse:(SDLGenericResponse*) response{
    [self sendRPCCallback:[self jsonFromRPC:response]];
}

-(void) onProxyClosedWithMessage:(NSString*)message{
    [self resetLifecycleVariables];
    [self sendRPCCallback:[self createProxyEvent:[self createProxyEvent:SDLCDVProxyEventOnProxyClosedKey withInfo:message withError:nil]]];
}

-(void) onErrorWithMessage:(NSString*)message withException:(NSException*) e{
    [self sendRPCCallback:[self createProxyEvent:[self createProxyEvent:SDLCDVProxyEventOnErrorKey withInfo:message withError:nil]]];
}

-(void)onProxyFirstAccess{
    [self sendRPCCallback:[self createProxyEvent:[self createProxyEventFirstAccess]]];
}

#pragma mark SdlCordova Helper Methods

-(SDLRPCRequest*)pendingRPCRequestFromRPCResponse:(SDLRPCResponse*)response{
    SDLRPCRequest* request;
    if (!response) {
        NSLog(@"RPCResponse is null. Could not commit to persistent SYNC Data.");
    }else{
        if(response.correlationID){
            if(![response.success boolValue]){
                NSLog(@"Response to %@ request unsuccessful.  Could not add to persistant SYNC Data.", response.name);
            } else {
                // Fetch corresponding RPCRequest
                request = [self.pendingRPCRequests valueForKey:[NSString stringWithFormat:@"%@", response.correlationID]];
            }
            // Remove pending RPCRequest
            [self.pendingRPCRequests removeObjectForKey:[NSString stringWithFormat:@"%@", response.correlationID]];
        } else {
            NSLog(@"CorrelationID of response is nil. Could not add to persistant SYNC Data.");
        }
    }
    
    return request;
}

-(NSDictionary*)jsonFromRPC:(SDLRPCMessage*)rpc{
    return [[rpc serializeAsDictionary:2] copy];
}

-(NSDictionary*)createProxyEvent:(NSDictionary*)event{
    return @{SDLCDVProxyEventProxyEventKey: event};
}

-(NSDictionary*)createProxyEventFirstAccess{
    return @{SDLCDVProxyEventNameKey: SDLCDVProxyEventOnFirstAccessKey};
}

-(NSDictionary*)createProxyEvent:(NSString*)proxyEventName withInfo:(NSString*)info withError:(NSException*)exception{
    
    NSMutableDictionary* proxyEventJSON = [[NSMutableDictionary alloc] init];
    NSMutableDictionary* parametersDictionary = [[NSMutableDictionary alloc] init];
    
    if (info) {
        parametersDictionary[SDLCDVProxyEventInfoKey] = info;
    }
    if (exception) {
        parametersDictionary[SDLCDVProxyEventExceptionKey] = [exception reason];
    }
    
    proxyEventJSON[SDLCDVProxyEventParametersKey] = [parametersDictionary copy];
    proxyEventJSON[SDLCDVProxyEventNameKey] = proxyEventName;
    
    return [proxyEventJSON copy];
}

@end