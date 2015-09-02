/**
 * Globals
 */
var deviceReady = false;
var domReady = false;
var creatingProxy = false;
var proxyCreated = false;
var proxyConnected = false;
var initialized = false; //has opted in
var nextCorrelationId = 0;
var hasRun = false;
var hmiLevel = "NONE"; //SdlCordova.Names.HMILevel.NONE;
var siphoning = false;

var rpcCount = 0;
var rpcSendSuccessCount = 0;
var rpcSendErrorCount = 0;
var responseCount = 0;
var responseErrorCount = 0;

var choiceId = 0;

var testManager = new QATestManager();

var LogType = {
	ERROR: "error",
	DEBUG: "debug"
};
/**
 * End Globals
 */

/**
 * End Sync Proxy Bindings
 */
var deviceType = (navigator.userAgent.match(/iPad/i))  == "iPad" ? "iPad" : (navigator.userAgent.match(/iPhone/i))  == "iPhone" ? "iPhone" : (navigator.userAgent.match(/Android/i)) == "Android" ? "Android" : (navigator.userAgent.match(/BlackBerry/i)) == "BlackBerry" ? "BlackBerry" : "null";

console.log(deviceType);

document.addEventListener("deviceready", function(){
	prependLog("deviceready");
	deviceReady = true;
	
	if(!creatingProxy && domReady){
		createProxy();
	}
	
	/**
 	* Sync Proxy Bindings
 	*/
	SdlCordova.onOnHMIStatus(function(info){
		prependLog(info);
		//hmiLevel = info.parameters.hmiLevel;
		hmiLevel = info.JSONData.hmiLevel;
		$("#hmiStatus").html(hmiLevel);
		
		if(hmiLevel != "NONE"  /*SdlCordova.Names.HMILevel.NONE*/ && !initialized){
			initialize();
		}
		
		if(!proxyConnected){
			updateConnectionStatus(true);
		}
	});
	
	SdlCordova.onProxyFirstAccess(function(){
		initialize();
	});
	
	SdlCordova.onProxyClosed(function(){
		//SdlCordova.onOnHMIStatus({parameters: {hmiLevel: null}});
		prependLog("Proxy Closed");
		updateConnectionStatus(false);
		updateInitializedStatus(false);
	});
	
	SdlCordova.onGenericResponse(function(info){
		prependLogError("onGenericResponse");
		prependLogError(info);
	});
	
	SdlCordova.onError(function(info){
		prependLogError("onError");
		prependLog(info);
	});
	
	// added
	/*SdlCordova.onOnAudioPassThru(function(info){
		prependLog("onOnAudioPassThru");
		prependLog(info);
	});*/
}, false);  // end of ondeviceready

function toggleSiphon(status){
	if(typeof status == "boolean"){
		siphoning = !status;
	}
	
	if(siphoning){
		prependLog("Disabling Siphon Server");
		SdlCordova.disableSiphonDebug();
		siphoning = false;
		sessionStorage.siphoning = false;
		$("#siphonToggleBtn").html("Enable Siphon");
		$("#siphonStatus").html("false");
	}else{
		prependLog("Enabling Siphon Server");
		SdlCordova.enableSiphonDebug();
		siphoning = true;
		sessionStorage.siphoning = true;
		$("#siphonToggleBtn").html("Disable Siphon");
		$("#siphonStatus").html("true");
	}
}

function clearLog(){
	$("#log").empty().html("<div></div>");
}

function initialize(){
	if(initialized)
		return;
	updateInitializedStatus(true);
	
	var show = new SdlCordovaFactory.Show();
	show.setCorrelationId(++nextCorrelationId);
	show.setDisplayText("QA Test", "Select a Test");
	show.setTextAlignment(SdlCordova.names.alignment_center);
	show.setMediaClock("     ");
	show.sendRequest();
}

function createProxy(success, error){
	prependLog("createProxy");
	
	if(creatingProxy){
		return false;
	}
	creatingProxy = true;
	
	if(!deviceReady){
		prependLog("Device not ready! Cannot create proxy!");
		return false;
	}
	
	if(typeof sessionStorage.siphoning == "string"){
		toggleSiphon(sessionStorage.siphoning == "true" ? true : false);
	}else{
		toggleSiphon(false);
	}
	
	updateProxyStatus(false);
	updateConnectionStatus(false);
	updateInitializedStatus(false);	
	
	SdlCordova.createProxy({
		success: function(json){
			prependLog("Proxy Created");
			updateProxyStatus(true);
			
			if(success){
				success();
			}
			
			creatingProxy = false;
		},
		fail: function(e){
			prependLog("failed to start proxy! " + e);
			updateProxyStatus(false);
			
			if(error){
				error();
			}
			
			creatingProxy = false;
		},			
		appName: "CordovaSyncProxyTester",
		isMediaApplication: true , 
		languageDesired: "EN_US",
		hmiLanguageDesired: "EN_US",
		//appId : "584421907",
		appId : "2239664629", //changed the id for debug
		majorVersion : "2",
		minorVersion : "0"	
	});
	
	return true;
}

function prependLogError(text){
	text = toJSON(text);
	$("#log").prepend('<div class="red">' + toJSON(text) + "</div>");
	console.log(text);
	if(siphoning) {
	    //SdlCordova.siphonLog(text);
	}
}

function prependLog(text){
	text = toJSON(text);
	$("#log").prepend("<div>" + text + "</div>");
	console.log(text);
	if(siphoning) {
	    //SdlCordova.siphonLog(text);
	}
}

function toJSON(o){
	var type = typeof o;
	if(type == "object"){
		var comma = "";
		if(o instanceof Array){
			var json = "[";
			for(key in o){
				json += comma + toJSON(o[key]);
				comma = ", ";
			}
			return json + "]";
		}else if(o == null){
			return "null";
		}else{
			var json = "{";
			for(key in o){
				json += comma + '"' + key + '": ' + toJSON(o[key]);
				comma = ", ";
			}
			return json + "}";
		}
	}else{
		switch(type){
		case "number": return o;
		case "string": return '"' + o + '"';
		case "boolean": return (o ? "true" : "false");
		case null: return "null";
		case "function": return "function()";
		case "undefined": return "undefined";
		default: return o;
		}
	}
}

function sendRPC(rpc, ignoreResponse){
	if(!(rpc instanceof SdlCordovaFactory.RPCBase)){
		prependLogError("Not a valid RPC");
		prependLogError(rpc);
		testManager.addRPCSendError();
		return;
	}
	
	prependLog("Sending " + rpc.functionName + " Request");
	
	var success = rpc.getSuccess();
	rpc.setSuccess(function(){
		success();
		testManager.addRPCSendSuccess();
	});
	
	var error = rpc.getError();
	rpc.setError(function(e){
		error(e);
		testManager.addRPCSendError();
	});
	
	if(ignoreResponse !== true){
		SdlCordovaFactory.onCorrelationId(rpc.getCorrelationId(), rpcResponseCheck);
	}
	
	rpc.sendRequest();
	
	testManager.addRPCSendCount();
}

function rpcResponseCheck(info){
	testManager.addRPCResponseCount();	
	
	/*if(info.parameters && info.parameters.success === true){
		prependLog("RPC Response Success " + info.correlationID);
	}else if(info.name == SdlCordova.Names.Functions.PERFORM_INTERACTION
			&& info.parameters && info.parameters.resultCode == SdlCordova.Names.ResultCode.ABORTED){
		prependLog("RPC Response Aborted " + info.correlationID);
	}else{
		prependLogError("RPC Request Error " + info.correlationID);
		prependLogError(info);
		testManager.addRPCResponseError();
		testManager.fail();
	}*/
	
	if(info.JSONData && info.JSONData.success === true){
		prependLog("RPC Response Success " + info.CorrelationID);
	}else if(info.FunctionName == SdlCordova.names.function_name_performInteraction
			&& info.JSONData && info.JSONData.resultCode == "ABORTED"){
		prependLog("RPC Response Aborted " + info.CorrelationID);
	}else{
		prependLogError("RPC Request Error " + info.CorrelationID);
		prependLogError(info);
		testManager.addRPCResponseError();
		testManager.fail();
	}
}

function cleanUp(callback, args){
	console.log("cleanUp");
	rpcCount = 0;
	rpcSendSuccessCount = 0;
	rpcSendErrorCount = 0;
	responseCount = 0;
	responseErrorCount = 0;
	$("#rpcCount, #rpcSendSuccessCount, #rpcSendErrorCount, #rpcResponseCount, #rpcErrorCount").html("0");
	$("#testStatus").html("");
	
	SdlCordovaFactory.onCorrelationIdListeners = {};
	SdlCordovaFactory.onChoiceIdListeners = {};
	SdlCordovaFactory.onCommandListeners = {};
	SdlCordovaFactory.buttonEventListeners = {};
	SdlCordovaFactory.buttonPressesListeners = {};
	
	$("#log").html("<div></div>");
	if(proxyCreated){
		var sent = 0;
		var responses = 0;
		var done = false;
		
		var waitCheck = function(){
			responses++;
			if(done && sent == responses){
				callback.apply(callback, args);
			}
		};
		
		SdlCordova.getPersistentSdlData({
			success: function(data){
				//delete commands
				//prependLog(data.commands.length + " commands");
				for(var i = 0; i < data.commands.length; i++){
					var cmdId = data.commands[i].cmdID;
					console.log("delete cmd id = " + cmdId);
					if(typeof cmdId == "number" && cmdId >= 0){
						var deleteCommand = new SdlCordovaFactory.DeleteCommand();
						deleteCommand.setSuccess(function(){
							sent++;
						});
						deleteCommand.setCorrelationId(++nextCorrelationId);
						deleteCommand.setCmdId(cmdId);
						deleteCommand.sendRequest();
						
						SdlCordovaFactory.onCorrelationId(deleteCommand.getCorrelationId(), waitCheck);
					}else{
						console.log("Invalid Command ID");
					}
				}
				
				//delete sub menus
				//prependLog(data.subMenus.length + " sub menus");
				for(var i = 0; i < data.subMenus.length; i++){
					var menuId = data.subMenus[i].menuID;
					console.log("delete sub menu id = " + menuId);
					if(typeof menuId == "number" && menuId >= 0){
						var deleteMenu = new SdlCordovaFactory.DeleteSubMenu();
						deleteMenu.setCorrelationId(++nextCorrelationId);
						deleteMenu.setSuccess(function(){
							sent++;
						});
						deleteMenu.setMenuId(menuId);
						deleteMenu.sendRequest();
						SdlCordovaFactory.onCorrelationId(deleteMenu.getCorrelationId(), waitCheck);
					}else{
						console.log("Invalid Sub Menu ID");
					}
				}
				
				//delete interaction choice sets
				//prependLog(data.choiceSets.length + " choice sets");
				for(var i = 0; i < data.choiceSets.length; i++){
					var id = data.choiceSets[i].interactionChoiceSetID;
					console.log("delete choice set id = " + id);
					if(typeof id == "number" && id >= 0){
						var deleteChoiceSet = new SdlCordovaFactory.DeleteInteractionChoiceSet();
						deleteChoiceSet.setSuccess(function(){
							sent++;
						});
						deleteChoiceSet.setCorrelationId(++nextCorrelationId);
						deleteChoiceSet.setInteractionChoiceSetId(id);
						deleteChoiceSet.sendRequest();
						SdlCordovaFactory.onCorrelationId(deleteChoiceSet.getCorrelationId(), waitCheck);
					}else{
						console.log("Invalid Interaction Choice Set ID");
					}				
				}
				
				//unsubscribe button
				//prependLog(data.buttonSubscriptions.length + " button subscriptions");
				for(var i = 0; i < data.buttonSubscriptions.length; i++){
					var btnName = data.buttonSubscriptions[i];
					prependLog("unsubscribe button  = " + btnName);
					if(typeof btnName == "string"){
						var unsubscribeButton = new SdlCordovaFactory.UnsubscribeButton();
						unsubscribeButton.setSuccess(function(){
							sent++;
						});
						unsubscribeButton.setCorrelationId(++nextCorrelationId);
						unsubscribeButton.setButtonName(btnName);
						unsubscribeButton.sendRequest();
						SdlCordovaFactory.onCorrelationId(unsubscribeButton.getCorrelationId(), waitCheck);
					}else{
						console.log("Invalid button name");
					}
				}
				
				done = true;
				if(sent == 0){
					callback.apply(callback, args);
				}
			},
			error: function(e){
				prependLog("getPersistentSdlData failed! Could not clean up! " + e);
			}
		});
	}else{
		console.log("no proxy created, no need to clean up");
		callback.apply(callback, args);
	}
}

function runTest(){
	console.log("run test " + $("#tests").val());
	testManager.runTest($("#tests").val());
}

function forceStopTest(){
	prependLog("Force Stopping Test");
	testManager.stopTest();
}

$(document).ready(function(){
	prependLog("document ready");
	domReady = true;
	testManager.onDomReady();
	
	if(!creatingProxy && deviceReady){
		createProxy();
	}
	
	$("#createDispose").click(function(){
		if(proxyCreated){
			disposeProxy();
		}else{
			createProxy();
		}
	});
});

function disposeProxy(success, error){
	SdlCordova.dispose({
		success: function(){
			prependLog("Proxy Disposed");
			updateProxyStatus(false);
			updateConnectionStatus(false);
			updateInitializedStatus(false);
			$("#hmiStatus").html("");
			
			if(typeof success == "function")
				success();
		},
		fail: function(e){
			console.log("well crap... dispose errored");
			updateProxyStatus(false);
			updateConnectionStatus(false);
			updateInitializedStatus(false);
			$("#hmiStatus").html("");
			
			if(typeof error == "function")
				error(e);
		}
	});
}

function resetProxy(success, error){
	SdlCordova.reset({
		success: function(){
			prependLog("Proxy Reset");
			updateProxyStatus(true);
			updateConnectionStatus(false);
			updateInitializedStatus(false);
			$("#hmiStatus").html("");
			
			if(typeof success == "function")
				success();
		},
		fail: function(e){
			console.log("well crap... reset errored");
			updateProxyStatus(false);
			updateConnectionStatus(false);
			updateInitializedStatus(false);
			$("#hmiStatus").html("");
			
			if(typeof error == "function")
				error(e);
		}
	});
}

function updateProxyStatus(status){
	proxyCreated = status;
	$("#proxyCreatedStatus").html("" + status);
	updateDisposeButton(status ? "dispose" : "create");
}

function updateInitializedStatus(status){
	initialized = status;
	$("#initializedStatus").html("" + status);
}

function updateConnectionStatus(status){
	proxyConnected = status;
	$("#connectionStatus").html("" + status);
}

function updateDisposeButton(type){
	var btn = $("#createDispose");
	if(type == "create"){
		btn.html("Create");
	}else if(type == "dispose"){
		btn.html("Dispose");
	}
}

console.log(testManager);

function createLargeChoiceSet(){
	var choiceSet = [];
	
	for(var i = 0; i < 100; i++){
		var id = choiceId++;
		choiceSet.push(new SdlCordova.Choice(id, "choice " + id, ["choice " + id]));
	}
	
	return choiceSet;
}
