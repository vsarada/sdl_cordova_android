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
@property (strong, nonatomic) SDLRegisterAppInterfaceResponse* raiResponse;

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
 //   [SDLDebugTool logInfo:[NSString stringWithFormat:@" in Class: %@, Method: %@", NSStringFromClass([self class]), NSStringFromSelector(_cmd)]];
    

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
  //  [SDLDebugTool logInfo:[NSString stringWithFormat:@"out of Class: %@, Method: %@", NSStringFromClass([self class]), NSStringFromSelector(_cmd)]];
    
    return pluginResult;
}

-(void)createProxy:(CDVInvokedUrlCommand*)command{
    
    //NSLog(@"SdlCordova createProxy");
    
//    [SDLDebugTool logInfo:[NSString stringWithFormat:@"Class: %@, Method: %@", NSStringFromClass([self class]), NSStringFromSelector(_cmd)]];
    
    
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
    
      // [SDLDebugTool logInfo:[NSString stringWithFormat:@"End of 2nd try block of  Class: %@, Method: %@", NSStringFromClass([self class]), NSStringFromSelector(_cmd)]];
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

-(void)getPersistentSdlData:(CDVInvokedUrlCommand*)command{
    
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
    //[SDLDebugTool logInfo:[NSString stringWithFormat:@" In Class: %@, Method: %@", NSStringFromClass([self class]), NSStringFromSelector(_cmd)]];
    
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
        || [rpcRequest.name isEqualToString:NAMES_DeleteCommand]
        || [rpcRequest.name isEqualToString:NAMES_AddSubMenu]
        || [rpcRequest.name isEqualToString:NAMES_DeleteSubMenu]
        || [rpcRequest.name isEqualToString:NAMES_CreateInteractionChoiceSet]
        || [rpcRequest.name isEqualToString:NAMES_DeleteInteractionChoiceSet]
        || [rpcRequest.name isEqualToString:NAMES_SubscribeButton]
        || [rpcRequest.name isEqualToString:NAMES_UnsubscribeButton]
        ) {
        if (![self.pendingRPCRequests valueForKey:[NSString stringWithFormat:@"%@", rpcRequest.correlationID]]) {
            [self.pendingRPCRequests setValue:rpcRequest forKey:[NSString stringWithFormat:@"%@", rpcRequest.correlationID]];
        }
    }
    
    
    //Added by vivek .. putfile code...
    //Check for request and requestName. extract, decode and assign the file to bulkData.
  
if( [rpcRequest.name isEqualToString:@"PutFile"])
{
       
      // NSLog(@"Inside Put File menu");
     //  NSString *funcName =  rpcRequest.getFunctionName;
      // NSData* binaryData =  rpcRequest.bulkData;
       NSString *msgType =   rpcRequest.messageType;
       
   if ( [msgType isEqualToString:@"request"])
   {
        //  NSLog(@"Inside request!. going in value param and buld data values");
       NSDictionary* params  = [[rpcRequest serializeAsDictionary:2] copy];
       
       NSString* data1 = [params objectForKey:(@"fileData")] ;
       NSArray *data = [data1  componentsSeparatedByString:@","];
       int data_count =  (int)[data count];
      
  //  for (id x in data) NSLog(@"%@",x);
       
       if (data_count > 1) {
           NSString *base64String =  data[1];
           NSData *decodedData = [[NSData alloc] initWithBase64EncodedString:base64String options:0];
       //    NSString *decodedString = [[NSString alloc] initWithData:decodedData encoding:NSUTF8StringEncoding];

           rpcRequest.bulkData = decodedData;
           //NSLog(@"BulkData values have been set as follows %@",  rpcRequest.bulkData);
       }
       
       else { NSLog(@"No file data Found!");
       }
   }
} //end of request..
   
    

    //TODO: if happy path fails. && rpcRequest == SDLPutFileRequest, print description to include bulkData size
    
 
    [self.sdlProxy sendRPCRequest:rpcRequest];
    
    if (self.commandDelegate) {
        CDVPluginResult* successPluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:successPluginResult callbackId:command.callbackId];
    }
    else{
        NSLog(@"Could not execute command %@. No command Delegate.", NSStringFromSelector(_cmd));
    }
 //   [SDLDebugTool logInfo:[NSString stringWithFormat:@"out of Class: %@, Method: %@", NSStringFromClass([self class]), NSStringFromSelector(_cmd)]];
    

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
    
  //  [SDLDebugTool logInfo:[NSString stringWithFormat:@"Class: %@, Method: %@", NSStringFromClass([self class]), NSStringFromSelector(_cmd)]];
    
    
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
//Added byvivek ..

//-(void)getSdlMsgVersion:(CDVInvokedUrlCommand*)command;
// vivek..

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
    for (SDLVRCapabilities* vrCapabilities in vrCapabilitesArray) {
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
    
  //  [SDLDebugTool logInfo:[NSString stringWithFormat:@"Class: %@, Method: %@", NSStringFromClass([self class]), NSStringFromSelector(_cmd)]];
    [SDLProxyALM enableSiphonDebug];
    
    if (self.commandDelegate) {
        CDVPluginResult* successPluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:successPluginResult callbackId:command.callbackId];
    }
}

-(void)disableSiphonDebug:(CDVInvokedUrlCommand*)command{

   // [SDLDebugTool logInfo:[NSString stringWithFormat:@"Class: %@, Method: %@", NSStringFromClass([self class]), NSStringFromSelector(_cmd)]];
    
    [SDLProxyALM disableSiphonDebug];

    if (self.commandDelegate) {
        CDVPluginResult* successPluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:successPluginResult callbackId:command.callbackId];
    }
}


-(NSDictionary*)jsonFromRPC:(SDLRPCMessage*)rpc{
    // need to do from java code
    // return [[rpc serializeAsDictionary:2] copy];
    //  [SDLDebugTool logInfo:[NSString stringWithFormat:@"Json fromRPC Class: %@, Method: %@", NSStringFromClass([self class]), NSStringFromSelector(_cmd)]];
    NSLog(@"In jsonFfomRPCmethod");
    
    
    if (!rpc)  {
        NSLog(@"RPCMessage is null. Cannot get RPCInfo.");
       return nil;
    }
    
    NSString *funcName = rpc.getFunctionName;
    NSData* binaryData =  rpc.bulkData;
    NSString *msgType = rpc.messageType;
    
    // JSONObject params = null;
    //TODO: Should this be a hardcoded 2?
   // NSInteger version = [self.raiResponse.syncMsgVersion.majorVersion integerValue];
   //[SDLDebugTool logInfo:[NSString stringWithFormat:@" vivek check - version = %li", (long)version]];
   // NSDictionary* params  = [[rpc serializeAsDictionary:version] copy]; //rpc.serializeJSON((byte)2);
    NSDictionary* params  = [[rpc serializeAsDictionary:2] copy];
    // NSLog(@"Immediate Params Print", params.toString());
    
    //NSLog(@"Just before creating the NSdictionary !");
    NSMutableDictionary* obj = [NSMutableDictionary new];
    if (funcName) {
        obj[@"FunctionName"] = funcName;
    }
    if (params) {
        obj[@"JSONData"] = params;
    }
    if (msgType) {
        obj[@"MessageType"] = msgType;
    }
    if (binaryData) {
        obj[@"BinaryData"] = binaryData;
    }
    
    if ([rpc isKindOfClass:[SDLRPCResponse class]] ) {
        obj[@"CorrelationID"] = ((SDLRPCResponse*)rpc).correlationID;
    }
    
    return obj;
    //encode Binary Data to base 64
    //String encodedBinaryData = Base64.encode(binaryData);
    
//    
//    JSONObject *obj = new JSONObject();
//    try {
//        obj.put("FunctionName", funcName);
//        obj.put("JSONData", params);
//        obj.put("MessageType", msgType);
//        obj.put("BinaryData", binaryData);
//    } catch (JSONException e) {
//        e.printStackTrace();
//        Log.e("RPC JSON MSG", "Error creating rpc json msg");
//    }
//    */
    /*
     //int dataLength = binaryData.length;
     //Log.i("Binary Data Message", String.valueOf(dataLength));
     Log.d("RPCInfoStatus", "Successfully created RPC info JSONObject");
     Log.d("JSON RPC Object: ", obj.toString());
     return obj;
     
     }
     
     */
}


-(void)sendRPCCallback:(NSDictionary*)info{
    
    
    // [SDLDebugTool logInfo:[NSString stringWithFormat:@"Class: %@, Method: %@", NSStringFromClass([self class]), NSStringFromSelector(_cmd)]];
    if (!proxyCallbackDelegate) {
        NSLog(@"Could not execute command %@. No command Delegate.", NSStringFromSelector(_cmd));
        return;
    }
    
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:info];
  //  [SDLDebugTool logInfo:[NSString stringWithFormat:@"CDVPluginResult argumentsAsJSON: %@", [result argumentsAsJSON]]]
    ;
   
    [result setKeepCallbackAsBool:YES];
   /*
    if (proxyCallbackDelegate != nil) {
        
        [SDLDebugTool logInfo:@"proxyCallbackDelegate is not nil. All is well."];
    }
    else{
        [SDLDebugTool logInfo:@"proxyCallbackDelegate is nil. This should not happen."];
    }

    
    [SDLDebugTool logInfo:[NSString stringWithFormat:@" Calling sendPluginResult - value of result:  status: %@,  id: %@,  keepCallBack: %@,  Associatedid:%@ ", [NSString stringWithFormat:@"%@", [result status]], (NSString*)[result message],[NSString stringWithFormat:@"%@", [result keepCallback]] , (NSString*)[result associatedObject]]];

    
    */
    //[SDLDebugTool logInfo:[NSString stringWithFormat:@"sendPluginResult - proxyCallbackDelegate=%@, callbackId=%@", proxyCallbackDelegate, proxyCommandCallbackId]];
    
    
    //TODO: This is not calling into JS. Check result & info objects for completeness.
      [proxyCallbackDelegate sendPluginResult:result callbackId:proxyCommandCallbackId];
    
    
    
  //  [SDLDebugTool logInfo:[NSString stringWithFormat:@"out of Class: %@, Method: %@", NSStringFromClass([self class]), NSStringFromSelector(_cmd)]];
    
    
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

-(void)onRegisterAppInterfaceResponse:(SDLRegisterAppInterfaceResponse *)response{
  //  [SDLDebugTool logInfo:[NSString stringWithFormat:@" In begin of onRegisterAppInterfaceResponse : %@, Method: %@", NSStringFromClass([self class]), NSStringFromSelector(_cmd)]];
    self.raiResponse = response;
}

-(void) onOnHMIStatus:(SDLOnHMIStatus*) notification{
    
    // [SDLDebugTool logInfo:[NSString stringWithFormat:@" In begin of onONHMIStatus : %@, Method: %@", NSStringFromClass([self class]), NSStringFromSelector(_cmd)]];
    if (!self.receivedFirstNonNoneHMI) {
        if (notification.hmiLevel != SDLHMILevel.NONE) {
            self.receivedFirstNonNoneHMI = YES;
            [self onProxyFirstAccess];
        }
    }
       //  [SDLDebugTool logInfo:[NSString stringWithFormat:@" In pasing of oONHMIStatus : %@, Method: %@ , status :%@", NSStringFromClass([self class]), NSStringFromSelector(_cmd), notification.hmiLevel.value]];
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
        SDLAddCommand* addCommand = [[SDLAddCommand alloc] initWithDictionary:[pendingRPCRequest serializeAsDictionary:1]];
        [self.persistentSyncData addCommand:addCommand];
    }
    
    [self sendRPCCallback:[self jsonFromRPC:response]];
}

-(void) onAddSubMenuResponse:(SDLAddSubMenuResponse*) response{
    
    SDLRPCRequest* pendingRPCRequest = [self pendingRPCRequestFromRPCResponse:response];
    
    if(!pendingRPCRequest){
        NSLog(@"No pending rpc request found. Could not add to persistant SYNC Data.");
    } else {
        SDLAddSubMenu* subMenu = [[SDLAddSubMenu alloc] initWithDictionary:[pendingRPCRequest serializeAsDictionary:1]];  // TODO Check that VERSION can be hardcoded]];
        [self.persistentSyncData addSubMenu:subMenu];
    }
    
    [self sendRPCCallback:[self jsonFromRPC:response]];
}

-(void) onAlertResponse:(SDLAlertResponse*) response{
    [self sendRPCCallback:[self jsonFromRPC:response]];
}

-(void) onCreateInteractionChoiceSetResponse:(SDLCreateInteractionChoiceSetResponse*) response{
    
//[SDLDebugTool logInfo:[NSString stringWithFormat:@"Class: %@, Method: %@", NSStringFromClass([self class]), NSStringFromSelector(_cmd)]];
    
    
    SDLRPCRequest* pendingRPCRequest = [self pendingRPCRequestFromRPCResponse:response];
  //  NSLog(@"pendingRPCRequest : %@", [pendingRPCRequest description]);
    
    if(!pendingRPCRequest){
        
        NSLog(@"No pending rpc request found. Could not add to persistant SYNC Data.");
    } else {
        //     [SDLDebugTool logInfo:[NSString stringWithFormat:@"Class: %@, Method: %@ - in else condition ", NSStringFromClass([self class]), NSStringFromSelector(_cmd)]];

        
        //TODO: This will return nil if something went wrong.
        NSMutableDictionary* pendingRPCRequestDictionary = [pendingRPCRequest serializeAsDictionary:1];
     //   NSLog(@"pendingRPCRequestDictionary : %@", [pendingRPCRequestDictionary description]);
        
        SDLCreateInteractionChoiceSet* addChoiceSet = [[SDLCreateInteractionChoiceSet alloc] initWithDictionary:pendingRPCRequestDictionary];  // TODO Check that VERSION can be hardcoded]];
       
        [self.persistentSyncData addChoiceSet:addChoiceSet];
    }
    
    [self sendRPCCallback:[self jsonFromRPC:response]];
}

-(void) onDeleteCommandResponse:(SDLDeleteCommandResponse*) response{
    
    SDLRPCRequest* pendingRPCRequest = [self pendingRPCRequestFromRPCResponse:response];
    
    if(!pendingRPCRequest){
        NSLog(@"No pending rpc request found. Could not add to persistant SYNC Data.");
    } else {
        SDLDeleteCommand* deleteCommand = [[SDLDeleteCommand alloc] initWithDictionary:[pendingRPCRequest serializeAsDictionary:1]];  // TODO Check that VERSION can be hardcoded]];
        [self.persistentSyncData removeCommand:deleteCommand];
    }
        
    [self sendRPCCallback:[self jsonFromRPC:response]];
}

-(void) onDeleteInteractionChoiceSetResponse:(SDLDeleteInteractionChoiceSetResponse*) response{
    
    SDLRPCRequest* pendingRPCRequest = [self pendingRPCRequestFromRPCResponse:response];
    
    if(!pendingRPCRequest){
        NSLog(@"No pending rpc request found. Could not add to persistant SYNC Data.");
    } else {
        SDLDeleteInteractionChoiceSet* deleteICS = [[SDLDeleteInteractionChoiceSet alloc] initWithDictionary:[pendingRPCRequest serializeAsDictionary:1]];  // TODO Check that VERSION can be hardcoded]];
        [self.persistentSyncData removeChoiceSet:deleteICS];
    }
        
    [self sendRPCCallback:[self jsonFromRPC:response]];
}

-(void) onDeleteSubMenuResponse:(SDLDeleteSubMenuResponse*) response{
    
    SDLRPCRequest* pendingRPCRequest = [self pendingRPCRequestFromRPCResponse:response];
    
    if(!pendingRPCRequest){
        NSLog(@"No pending rpc request found. Could not add to persistant SYNC Data.");
    } else {
        SDLDeleteSubMenu* deleteSubMenu = [[SDLDeleteSubMenu alloc] initWithDictionary:[pendingRPCRequest serializeAsDictionary:1]];  // TODO Check that VERSION can be hardcoded]];
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
        
       SDLSubscribeButton* subscribeButton = [[SDLSubscribeButton alloc] initWithDictionary:[pendingRPCRequest serializeAsDictionary:1]];  //TODO: Check that VERSION can be hardcoded]];
        [self.persistentSyncData addButtonSubscription:subscribeButton];
    }
    
    [self sendRPCCallback:[self jsonFromRPC:response]];
}

-(void) onUnsubscribeButtonResponse:(SDLUnsubscribeButtonResponse*) response{
    
    SDLRPCRequest* pendingRPCRequest = [self pendingRPCRequestFromRPCResponse:response];
    
    if(!pendingRPCRequest){
        NSLog(@"No pending rpc request found. Could not add to persistant SYNC Data.");
    } else {
        SDLUnsubscribeButton* unsubscribeButton = [[SDLUnsubscribeButton alloc] initWithDictionary:[pendingRPCRequest serializeAsDictionary:1]];  // TODO Check that VERSION can be hardcoded]];
        [self.persistentSyncData removeButtonSubscription:unsubscribeButton];
    }
    
    [self sendRPCCallback:[self jsonFromRPC:response]];
}

-(void) onGenericResponse:(SDLGenericResponse*) response{
    // print all details...vivek
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


// Added by vivek.... after speaking with kevin .. missing methods ...

// Not sure what to do ...

/* -(void) onProxyClosed{



    (NSString*)message = [NSString "a"];
[onProxyClosedWithMessage:message];
  //  [self resetLifecycleVariables];
   // [self sendRPCCallback:[self createProxyEvent:[self createProxyEvent:SDLCDVProxyEventOnProxyClosedKey withInfo:message withError:nil]]];
}

-(void) onErrorWithMessage:(NSString*)message withException:(NSException*) e{
    [self sendRPCCallback:[self createProxyEvent:[self createProxyEvent:SDLCDVProxyEventOnErrorKey withInfo:message withError:nil]]];
}
*/

//-(void) onProxyOpened;
// -(void) onError:(NSException*) e;

-(void) onChangeRegistrationResponse:(SDLChangeRegistrationResponse*) response
    {[self sendRPCCallback:[self jsonFromRPC:response]];
};

-(void) onDeleteFileResponse:(SDLDeleteFileResponse*) response{
    [self sendRPCCallback:[self jsonFromRPC:response]];
}



-(void) onDiagnosticMessageResponse:(SDLDiagnosticMessageResponse*) response{
    [self sendRPCCallback:[self jsonFromRPC:response]];
}


-(void) onEndAudioPassThruResponse:(SDLEndAudioPassThruResponse*) response{
    [self sendRPCCallback:[self jsonFromRPC:response]];
}



-(void) onGetDTCsResponse:(SDLGetDTCsResponse*) response{
    [self sendRPCCallback:[self jsonFromRPC:response]];
}

-(void) onGetVehicleDataResponse:(SDLGetVehicleDataResponse*) response{
    [self sendRPCCallback:[self jsonFromRPC:response]];
}


-(void) onListFilesResponse:(SDLListFilesResponse*) response{
    [self sendRPCCallback:[self jsonFromRPC:response]];
}

-(void) onOnAppInterfaceUnregistered:(SDLOnAppInterfaceUnregistered*) notification{
       [self sendRPCCallback:[self jsonFromRPC:notification]];
}

-(void) onOnAudioPassThru:(SDLOnAudioPassThru*) notification{
       [self sendRPCCallback:[self jsonFromRPC:notification]];
}


-(void) onOnHashChange:(SDLOnHashChange*) notification{
       [self sendRPCCallback:[self jsonFromRPC:notification]];
}

-(void) onOnLanguageChange:(SDLOnLanguageChange*) notification{
   [self sendRPCCallback:[self jsonFromRPC:notification]];
}

-(void) onOnLockScreenNotification:(SDLLockScreenStatus*) notification{
   [self sendRPCCallback:[self jsonFromRPC:(SDLRPCMessage *)notification]];
}

-(void) onOnPermissionsChange:(SDLOnPermissionsChange*) notification{
      [self sendRPCCallback:[self jsonFromRPC:notification]];
}

-(void) onOnSyncPData:(SDLOnSyncPData*) notification{
    [self sendRPCCallback:[self jsonFromRPC:notification]];
}

-(void) onOnSystemRequest:(SDLOnSystemRequest*) notification{
   [self sendRPCCallback:[self jsonFromRPC:notification]];
}

-(void) onOnTouchEvent:(SDLOnTouchEvent*) notification{
       [self sendRPCCallback:[self jsonFromRPC:notification]];
}

-(void) onOnVehicleData:(SDLOnVehicleData*) notification{
       [self sendRPCCallback:[self jsonFromRPC:notification]];
}

-(void) onPerformAudioPassThruResponse:(SDLPerformAudioPassThruResponse*) response{
    [self sendRPCCallback:[self jsonFromRPC:response]];
}


-(void) onPutFileResponse:(SDLPutFileResponse*) response{
    [self sendRPCCallback:[self jsonFromRPC:response]];
}
-(void) onReadDIDResponse:(SDLReadDIDResponse*) response{
    [self sendRPCCallback:[self jsonFromRPC:response]];
}

-(void) onScrollableMessageResponse:(SDLScrollableMessageResponse*) response{
    [self sendRPCCallback:[self jsonFromRPC:response]];
}

-(void) onSetAppIconResponse:(SDLSetAppIconResponse*) response{
    [self sendRPCCallback:[self jsonFromRPC:response]];
}
-(void) onSetDisplayLayoutResponse:(SDLSetDisplayLayoutResponse*) response{
    [self sendRPCCallback:[self jsonFromRPC:response]];
}



-(void) onShowConstantTBTResponse:(SDLShowConstantTBTResponse*) response{[self sendRPCCallback:[self jsonFromRPC:response]];}
-(void) onSliderResponse:(SDLSliderResponse*) response{[self sendRPCCallback:[self jsonFromRPC:response]];}

-(void) onSubscribeVehicleDataResponse:(SDLSubscribeVehicleDataResponse*) response{[self sendRPCCallback:[self jsonFromRPC:response]];}
-(void) onSyncPDataResponse:(SDLSyncPDataResponse*) response{[self sendRPCCallback:[self jsonFromRPC:response]];}
-(void) onUpdateTurnListResponse:(SDLUpdateTurnListResponse*) response {[self sendRPCCallback:[self jsonFromRPC:response]];}

-(void) onUnregisterAppInterfaceResponse:(SDLUnregisterAppInterfaceResponse*) response{[self sendRPCCallback:[self jsonFromRPC:response]];}
-(void) onUnsubscribeVehicleDataResponse:(SDLUnsubscribeVehicleDataResponse*) response{[self sendRPCCallback:[self jsonFromRPC:response]];}





//-(void) onShowResponse:(SDLShowResponse*) response;
//-(void) onRegisterAppInterfaceResponse:(SDLRegisterAppInterfaceResponse*) response;
//-(void) onResetGlobalPropertiesResponse:(SDLResetGlobalPropertiesResponse*) response{[self sendRPCCallback:[self jsonFromRPC:response]]};
//-(void) onSetGlobalPropertiesResponse:(SDLSetGlobalPropertiesResponse*) response;
//-(void) onPerformInteractionResponse:(SDLPerformInteractionResponse*) response{[self sendRPCCallback:[self jsonFromRPC:response]]};
//-(void) onDeleteInteractionChoiceSetResponse:(SDLDeleteInteractionChoiceSetResponse*) response{[self sendRPCCallback:[self jsonFromRPC:response]]};
//-(void) onOnButtonEvent:(SDLOnButtonEvent*) notification{void}
//-(void) onEncodedSyncPDataResponse:(SDLEncodedSyncPDataResponse*) response{[self sendRPCCallback:[self jsonFromRPC:response]]};



//-(void) onSpeakResponse:(SDLSpeakResponse*) response;
//-(void) onSubscribeButtonResponse:(SDLSubscribeButtonResponse*) response;
 
//-(void) onUnsubscribeButtonResponse:(SDLUnsubscribeButtonResponse*) response;



@end