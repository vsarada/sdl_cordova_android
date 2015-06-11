package com.smartdevicelink.cordova.constants;

import java.util.EnumSet;

public enum Actions {
	sendRpcRequest,
	createProxy,
	registerNewCallbackContext,
	doesProxyExist,
	getPersistentSdlData,
	dispose,
	reset,
	disableDebugTool,
	enableDebugTool,
	getButtonCapabilities,
	getDisplayCapabilities,
	getHmiDisplayLanguage,
	getHmiZoneCapabilities,
	getPresetBankCapabilities,
	getSoftButtonCapabilities,
	getSpeechCapabilities,
	getSdlLanguage,
	getSdlMsgVersion,
	getVehicleType,
	getVrCapabilities,
	getWiproVersion,
	enableSiphonDebug,
	disableSiphonDebug,
	putFile,
	siphonLog,
	ACTION_NOT_FOUND;
	
	public static Actions valueForString(String value){
		for(Actions anEnum:EnumSet.allOf(Actions.class)){
			if(anEnum.toString().equals(value)){
				return anEnum;
			}
		}
		
		// Return null if anEnum doesn't exist
		return null;
	}
}
