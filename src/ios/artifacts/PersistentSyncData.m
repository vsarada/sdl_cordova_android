//
//  PersistentSyncData.m
//  CordovaPluginSdlProxy
//
//  Copyright (c) 2013, Ford Motor Company All rights reserved.
//
//

#import "PersistentSyncData.h"
#import <SmartDeviceLink/SmartDeviceLink.h>
#import <SmartDeviceLink/SDLNames.h>

static NSString* const COMMANDS = @"commands";
static NSString* const SUB_MENUS = @"subMenus";
static NSString* const CHOICE_SETS = @"choiceSets";
static NSString* const BUTTON_SUBSCRIPTIONS = @"buttonSubscriptions";

@interface PersistentSyncData()

@property (strong, nonatomic) NSMutableDictionary* commands;
@property (strong, nonatomic) NSMutableDictionary* subMenus;
@property (strong, nonatomic) NSMutableDictionary* choiceSets;
@property (strong, nonatomic) NSMutableArray* buttons;

@end

@implementation PersistentSyncData

-(NSMutableDictionary*)commands{
    if (!_commands) _commands = [[NSMutableDictionary alloc] init];
    return _commands;
}

-(NSMutableDictionary*)subMenus{
    if (!_subMenus) _subMenus = [[NSMutableDictionary alloc] init];
    return _subMenus;
}

-(NSMutableDictionary*)choiceSets{
    if (!_choiceSets) _choiceSets = [[NSMutableDictionary alloc] init];
    return _choiceSets;
}

-(NSMutableArray*)buttons{
    if (!_buttons) _buttons = [[NSMutableArray alloc] init];
    return _buttons;
}

-(void)addCommand:(SDLAddCommand*)addCommand{
    if (!addCommand) {
        NSLog(@"Could not add command to persistentSyncData, addCommand was nil");
        return;
    }
    
    //FIXME: Strip out position property
    NSDictionary* rpcParameters = [self rpcParametersFromRPCRequest:addCommand];
    if (rpcParameters) {
        [self.commands setValue:rpcParameters forKey:[NSString stringWithFormat:@"%@", addCommand.cmdID]];        
    }
}

-(void)removeCommand:(SDLDeleteCommand*)deleteCommand{
    
    if (!deleteCommand) {
        NSLog(@"Could not remove command from persistentSyncData, commandId was nil");
        return;
    }
    
    [self.commands removeObjectForKey:[NSString stringWithFormat:@"%@",deleteCommand.cmdID]];
}

-(void)addSubMenu:(SDLAddSubMenu*)addSubMenu{
    if (!addSubMenu) {
        NSLog(@"Could not add subMenu to persistentSyncData, addSubMenu was nil");
        return;
    }
    [self.subMenus setValue:[self rpcParametersFromRPCRequest:addSubMenu] forKey:[NSString stringWithFormat:@"%@",addSubMenu.menuID]];
}

-(void)removeSubMenu:(SDLDeleteSubMenu*)deleteSubMenu{
    if (!deleteSubMenu) {
        NSLog(@"Could not remove subMenu from persistentSyncData, menuId was nil");
        return;
    }
    //FIXME: If this subMenu is a parent of others, remove them as well.
    [self.subMenus removeObjectForKey:[NSString stringWithFormat:@"%@",deleteSubMenu.menuID]];
}

-(void)addChoiceSet:(SDLCreateInteractionChoiceSet*)addChoiceSet{
    if (!addChoiceSet) {
        NSLog(@"Could not add choiceSet to persistentSyncData, addChoiceSet was nil");
        return;
    }
    [self.choiceSets setValue:[self rpcParametersFromRPCRequest:addChoiceSet] forKey:[NSString stringWithFormat:@"%@",addChoiceSet.interactionChoiceSetID]];
}

-(void)removeChoiceSet:(SDLDeleteInteractionChoiceSet*)deleteChoiceSet{
    if (!deleteChoiceSet) {
        NSLog(@"Could not remove choiceSet from persistentSyncData, choiceSetId was nil");
        return;
    }
    [self.choiceSets removeObjectForKey:[NSString stringWithFormat:@"%@",deleteChoiceSet.interactionChoiceSetID]];
}

-(void)addButtonSubscription:(SDLSubscribeButton*)subscribeButton{
    if (!subscribeButton) {
        NSLog(@"Could not add buttonSubscription to persistentSyncData, buttonSubscription was nil");
        return;
    }
    
    NSUInteger oIndex = [self.buttons indexOfObject:subscribeButton.buttonName];
    if (oIndex != NSNotFound) {
        [self.buttons addObject:subscribeButton.buttonName];
    }
}

-(void)removeButtonSubscription:(SDLUnsubscribeButton*)unsubscribeButton{
    if (!unsubscribeButton) {
        NSLog(@"Could not remove buttonSubscription from persistentSyncData, buttonSubscription was nil");
        return;
    }
    [self.buttons removeObject:unsubscribeButton.buttonName];
}

-(NSDictionary*)JSONObject{
    
    NSMutableArray* buttonNames = [[NSMutableArray alloc] init];
    for (SDLButtonName* button in self.buttons) {
        [buttonNames addObject:[button value]];
    }
    
    return @{COMMANDS: [self.commands allValues],
             SUB_MENUS: [self.subMenus allValues],
             CHOICE_SETS: [self.choiceSets allValues],
             BUTTON_SUBSCRIPTIONS: buttonNames};
}

-(NSDictionary*)rpcParametersFromRPCRequest:(SDLRPCRequest*)rpcRequest{

    if (!rpcRequest) {
        return @{};
    }
    
    NSDictionary* rpcJSON = [[rpcRequest serializeAsDictionary:2] copy];
    NSDictionary* requestJSON = [[rpcJSON valueForKey:NAMES_request] copy];

    NSDictionary* rpcParameters = [[requestJSON valueForKey:NAMES_parameters] copy];
    
    if (!rpcParameters) {
        NSLog(@"No parameters building RPCParameters, returning empty NSDictionary");
        rpcParameters = @{};
    }
    return rpcParameters;
}

@end
