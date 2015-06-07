//
//  PersistentSyncData.h
//  CordovaPluginSdlProxy
//
//  Copyright (c) 2013, Ford Motor Company All rights reserved.
//
//

#import <Foundation/Foundation.h>
#import <SmartDeviceLink/SDLRPCRequestFactory.h>

@interface PersistentSyncData : NSObject

-(void)addCommand:(SDLAddCommand*)addCommand;
-(void)removeCommand:(SDLDeleteCommand*)deleteCommand;

-(void)addSubMenu:(SDLAddSubMenu*)addSubMenu;
-(void)removeSubMenu:(SDLDeleteSubMenu*)deleteSubMenu;

-(void)addChoiceSet:(SDLCreateInteractionChoiceSet*)addChoiceSet;
-(void)removeChoiceSet:(SDLDeleteInteractionChoiceSet*)deleteChoiceSet;

-(void)addButtonSubscription:(SDLSubscribeButton*)subscribeButton;
-(void)removeButtonSubscription:(SDLUnsubscribeButton*)unsubscribeButton;

-(NSDictionary*)JSONObject;

@end
