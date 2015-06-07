var SdlCordova = {
	
	listeners: {},
	names: {},
	createProxySuccess: null,
	appName: null,
	
	bind: function(type, f){
		if(typeof f == "function"){
			var listener = {listener: f, once: false, type: type};
			if(this.listeners.hasOwnProperty(type)){
				this.listeners[type].push(listener);
			}else{
				this.listeners[type] = [listener];
			}
			return listener;
		} 
		console.log("Invalid parameters: Not of type function");
		return null;
	},
	
	unbind: function(type){
		if(this.listeners.hasOwnProperty(type))
			delete this.listeners.type;
	},
	
	extend: function(o, d){
		if(typeof o !== "object")
			return d;
		
		for(key in d){
			if(!o.hasOwnProperty(key)){
				o[key] = d[key];
			}
		}
		return o;
	},
	
	toArray: function(o){
		return o instanceof Array ? o : [o];
	},
	
	testPlugin: function(success, fail, resultType){
		return cordova.exec(function(){alert("success");}, 
				function(){alert("failure");}, 
				"SdlCordova", 
				"test", 
				[resultType]);
	},

	createProxy: function(opts){

		opts = this.extend(opts, SdlCordova.defaultOptsCreateProxy);

        this.createProxySuccess = opts.success;
        this.appName = opts.appName;
		this.languageDesired = opts.languageDesired;
		this.appId = opts.appId;
		this.majorVersion = opts.majorVersion;
        this.checkAndUpdateProxyCallback(opts);
		
		
    },
	
	callActionCreateProxy: function(opts){
		var params = {
				appName: opts.appName,
				isMediaApplication: opts.isMediaApplication, //added following 3 parameters
				languageDesired: opts.languageDesired,
				hmiLanguageDesired: opts.hmiLanguageDesired,
				appId : opts.appId
		};		

		cordova.exec(this.iProxyListenerCallback, opts.fail, "SdlCordova", SdlCordova.names.ACTION_CREATE_PROXY, [params]);
	},
	
	checkAndUpdateProxyCallback: function(opts){
		cordova.exec(function(result){
			if(result[SdlCordova.names.PROXY_EXISTS]){
				//proxy exists
				console.log("Proxy exists!");
				cordova.exec(SdlCordova.iProxyListenerCallback, 
						opts.fail, 
						"SdlCordova", 
						SdlCordova.names.ACTION_REGISTER_NEW_CALLBACK_CONTEXT, 
						[null]);				
			}else{
				console.log("Creating Proxy. Does not exist.");
				SdlCordova.callActionCreateProxy(opts);
			}
		}, function(){
			console.log("Failure to communicate with SdlCordova");
		}, "SdlCordova", SdlCordova.names.ACTION_GET_DOES_PROXY_EXIST, [null]);
	},
	
	iProxyListenerCallback: function(json){
		console.log("iProxyListenerCallback is being called");
		/* NOTE: This function is not called within the context of this object */
		if(SdlCordova.createProxySuccess != null)
		{			
			SdlCordova.createProxySuccess(json);
			SdlCordova.createProxySuccess = null;
			
			// ADG : Just return on success of proxy creation
			return;
		}
		//console.log("The Message type is a " + json.MessageType);
		//console.log("The hmiLevel is " + json.JSONData.hmiLevel);
		
	  	console.log(json.FunctionName);
		var funToRun = json.FunctionName;
		if (funToRun == "OnHMIStatus"){
			console.log("printing out HMI Level: " + json.JSONData.hmiLevel);
		}
		if(json != undefined){
			if(SdlCordova.listeners.hasOwnProperty(json.FunctionName)){
				var listeners = SdlCordova.listeners[json.FunctionName];
				//console.log(listeners);
				//SdlCordova.listeners.proxyListener(json);
				for(var i = 0; i < listeners.length; i++){
					//save the listener callback for later because it may remove 
					//itself (using SdlCordova.removeListener) in the callback
					var callback = listeners[i].listener;
					if(listeners[i].once){
						listeners.splice(i, 1);
						i--; //removed an element so decrement back one
					}
					callback(json);
				}
				}
			}else{
				console.log("Undetermined Success Callback Response");
			}
		},

	getPersistentSyncData: function(opts){
		opts = this.extend(opts, SdlCordova.defaultOptsNonRPC);
		return cordova.exec(opts.success, opts.error, "SdlCordova", SdlCordova.names.ACTION_GET_PERSISTENT_SYNC_DATA, [null]);
	},
	
	dispose: function(opts){
		opts = this.extend(opts, SdlCordova.defaultOptsNonRPC);
		
		return cordova.exec(opts.success, opts.error, "SdlCordova", "dispose", [null]);
	},
	
	reset: function(opts){
		opts = this.extend(opts, SdlCordova.defaultOptsNonRPC);
		
		return cordova.exec(opts.success, opts.error, "SdlCordova", "reset", [null]);
	},
	
	sendRPCRequest: function(opts, rpcMessage){
		//for debug
		if(rpcMessage.request.name == "Show")
			console.log("Show Request!!!"); 
		return cordova.exec(opts.success, opts.error, "SdlCordova", SdlCordova.names.ACTION_SEND_RPC_REQUEST, [rpcMessage]);
	},
	
	addCommand: function(correlationId, opts){		
		opts = this.extend(opts, SdlCordova.defaultOpts);
		console.log("enters the addCommand"); 
		// Build the request params
		var rpcRequestParams = {};
		if(opts.cmdID){
			rpcRequestParams[SdlCordova.names.cmdID] = Number(opts.cmdID);
			console.log("enters if#1");
		}
		if(opts.menuName){
			// Build the menuParams
			var menuParams = {};
			
			menuParams[SdlCordova.names.menuName] = opts.menuName;
			
			if(opts.parentID){
				menuParams[SdlCordova.names.parentID] = Number(opts.parentID);
			}
			if(opts.position){
				menuParams[SdlCordova.names.position] = Number(opts.position);
			}
			
			rpcRequestParams[SdlCordova.names.menuParams] = menuParams;
		}
		if(opts.vrCommands){			
			rpcRequestParams[SdlCordova.names.vrCommands] = this.toArray(opts.vrCommands);
		}
		
				
		// Build the request
		var rpcRequest = {};
		rpcRequest[SdlCordova.names.function_name] = SdlCordova.names.function_name_addCommand;
		rpcRequest[SdlCordova.names.correlationID] = Number(correlationId);
		rpcRequest[SdlCordova.names.parameters] = rpcRequestParams;
		
		// Build the message
		var rpcMessage = {};
		rpcMessage[SdlCordova.names.messageTypeRequest] = rpcRequest;
		console.log(rpcMessage);
		return this.sendRPCRequest(opts, rpcMessage);
	},
	
	addSubMenu: function(correlationId, opts){
		opts = this.extend(opts, SdlCordova.defaultOpts);
		
		// Build the request params
		var rpcRequestParams = {};
		if(opts.menuID){
			rpcRequestParams[SdlCordova.names.menuID] = Number(opts.menuID);
		}
		if(opts.menuName){
			rpcRequestParams[SdlCordova.names.menuName] = opts.menuName;
		}
		if(opts.position){
			rpcRequestParams[SdlCordova.names.position] = Number(opts.position);
		}
		
		
		// Build the request
		var rpcRequest = {};
		rpcRequest[SdlCordova.names.function_name] = SdlCordova.names.function_name_addSubMenu;
		rpcRequest[SdlCordova.names.correlationID] = Number(correlationId);
		rpcRequest[SdlCordova.names.parameters] = rpcRequestParams;
		
		// Build the message
		var rpcMessage = {};
		rpcMessage[SdlCordova.names.messageTypeRequest] = rpcRequest;
		
		return this.sendRPCRequest(opts, rpcMessage);
	},

	alert: function(correlationId, opts){
		opts = this.extend(opts, SdlCordova.names.defaultOpts);
		
		// Build the rpcRequestParams
		var rpcRequestParams = {};
		if(opts.ttsText){
			var newTTSChunk = new SdlCordova.TTSChunk(SdlCordova.names.speechCapabilities_TEXT, opts.ttsText);
			rpcRequestParams[SdlCordova.names.ttsChunks] = [newTTSChunk];	// Array of TTSChunk
		}
		if(opts.ttsChunks){
			rpcRequestParams[SdlCordova.names.ttsChunks] = this.toArray(opts.ttsChunks);
		}
		if(opts.alertText1){
			rpcRequestParams[SdlCordova.names.alertText1] = opts.alertText1;
		}
		if(opts.alertText2){
			rpcRequestParams[SdlCordova.names.alertText2] = opts.alertText2;
		}
		if(opts.duration){
			rpcRequestParams[SdlCordova.names.duration] = Number(opts.duration);
		}
		if(opts.playTone){
			rpcRequestParams[SdlCordova.names.playTone] = opts.playTone;
		}
		
		// Build the request
		var rpcRequest = {};
		rpcRequest[SdlCordova.names.function_name] = SdlCordova.names.function_name_alert;
		rpcRequest[SdlCordova.names.correlationID] = Number(correlationId);
		rpcRequest[SdlCordova.names.parameters] = rpcRequestParams;
		
		// Build the message
		var rpcMessage = {};
		rpcMessage[SdlCordova.names.messageTypeRequest] = rpcRequest;
		
		return this.sendRPCRequest(opts, rpcMessage);
	},
	
	createInteractionChoiceSet: function(correlationId, opts){
		opts = this.extend(opts, SdlCordova.defaultOpts);
		
		var rpcRequestParams = {};
		
		if(opts.interactionChoiceSetID){
			rpcRequestParams[SdlCordova.names.interactionChoiceSetID] = Number(opts.interactionChoiceSetID);
		}
		if(opts.choiceSet){
			rpcRequestParams[SdlCordova.names.choiceSet] = this.toArray(opts.choiceSet);
		}
		
		// Build the request
		var rpcRequest = {};
		rpcRequest[SdlCordova.names.function_name] = SdlCordova.names.function_name_createInteractionChoiceSet;
		rpcRequest[SdlCordova.names.correlationID] = Number(correlationId);
		rpcRequest[SdlCordova.names.parameters] = rpcRequestParams;
		
		// Build the message
		var rpcMessage = {};
		rpcMessage[SdlCordova.names.messageTypeRequest] = rpcRequest;
		
		return this.sendRPCRequest(opts, rpcMessage);
	},
	
	deleteCommand: function(correlationId, opts){
		opts = this.extend(opts, SdlCordova.defaultOpts);
		
		var rpcRequestParams = {};
		
		if(opts.cmdID){
			rpcRequestParams[SdlCordova.names.cmdID] = Number(opts.cmdID);
		}
		
		// Build the request
		var rpcRequest = {};
		rpcRequest[SdlCordova.names.function_name] = SdlCordova.names.function_name_deleteCommand;
		rpcRequest[SdlCordova.names.correlationID] = correlationId;
		rpcRequest[SdlCordova.names.parameters] = rpcRequestParams;
		
		// Build the message
		var rpcMessage = {};
		rpcMessage[SdlCordova.names.messageTypeRequest] = rpcRequest;
		
		return this.sendRPCRequest(opts, rpcMessage);
	},
	
	deleteFile: function(correlationId, opts){
		opts = this.extend(opts, SdlCordova.defaultOpts);
		//needs work
	},
	
	deleteInteractionChoiceSet: function(correlationId, opts){
		opts = this.extend(opts, SdlCordova.defaultOpts);
		
		var rpcRequestParams = {};
		
		if(opts.interactionChoiceSetID){
			rpcRequestParams[SdlCordova.names.interactionChoiceSetID] = opts.interactionChoiceSetID;
		}
		
		// Build the request
		var rpcRequest = {};
		rpcRequest[SdlCordova.names.function_name] = SdlCordova.names.function_name_deleteInteractionChoiceSet;
		rpcRequest[SdlCordova.names.correlationID] = correlationId;
		rpcRequest[SdlCordova.names.parameters] = rpcRequestParams;
		
		// Build the message
		var rpcMessage = {};
		rpcMessage[SdlCordova.names.messageTypeRequest] = rpcRequest;
		
		return this.sendRPCRequest(opts, rpcMessage);
	},
	
	deleteSubMenu: function(correlationId, opts){
		opts = this.extend(opts, SdlCordova.defaultOpts);
		
		var rpcRequestParams = {};
		
		if(opts.menuID){
			rpcRequestParams[SdlCordova.names.menuID] = opts.menuID;
		}
		
		// Build the request
		var rpcRequest = {};
		rpcRequest[SdlCordova.names.function_name] = SdlCordova.names.function_name_deleteSubMenu;
		rpcRequest[SdlCordova.names.correlationID] = correlationId;
		rpcRequest[SdlCordova.names.parameters] = rpcRequestParams;
		
		// Build the message
		var rpcMessage = {};
		rpcMessage[SdlCordova.names.messageTypeRequest] = rpcRequest;
		
		return this.sendRPCRequest(opts, rpcMessage);
	},
	
	encodedSyncPData: function(correlationId, opts){
		opts = this.extend(opts, SdlCordova.defaultOpts);
		
		var rpcRequestParams = {};
		if(opts.data){
			rpcRequestParams[SdlCordova.names.data] = this.toArray(opts.data);
		}
		
		// Build the request
		var rpcRequest = {};
		rpcRequest[SdlCordova.names.function_name] = SdlCordova.names.function_name_encodedSyncPData;
		rpcRequest[SdlCordova.names.correlationID] = correlationId;
		rpcRequest[SdlCordova.names.parameters] = rpcRequestParams;
		
		// Build the message
		var rpcMessage = {};
		rpcMessage[SdlCordova.names.messageTypeRequest] = rpcRequest;
		
		return this.sendRPCRequest(opts, rpcMessage);
	},
	
	listFiles: function(correlationId, opts){
		opts = this.extend(opts, SdlCordova.defaultOpts);
		//needs work
	},
	
	performInteraction: function(correlationId, opts){
		opts = this.extend(opts, SdlCordova.defaultOpts);
		
		var rpcRequestParams = {};
		
		if(opts.initialTTSText){
			var ttsChunk = new SdlCordova.TTSChunk(SdlCordova.names.speechCapabilities_TEXT, opts.initialTTSText);
			rpcRequestParams[SdlCordova.names.initialPrompt] = [ttsChunk];		// Array of TTSChunks
		}
		if(opts.initialTTSChunks){
			rpcRequestParams[SdlCordova.names.initialPrompt] = this.toArray(opts.initialTTSChunks);
		}
		if(opts.helpPromptTTSText){
			var ttsChunk = new SdlCordova.TTSChunk(SdlCordova.names.speechCapabilities_TEXT, opts.helpPromptTTSText);
			rpcRequestParams[SdlCordova.names.helpPrompt] = [ttsChunk];		// Array of TTSChunks
		}
		if(opts.helpPromptTTSChunks){
			rpcRequestParams[SdlCordova.names.helpPrompt] = this.toArray(opts.helpPromptTTSChunks);
		}
		if(opts.timeoutPromptTTSText){
			var ttsChunk = new SdlCordova.TTSChunk(SdlCordova.names.speechCapabilities_TEXT, opts.timeoutPromptTTSText);
			rpcRequestParams[SdlCordova.names.timeoutPrompt] = [ttsChunk];		// Array of TTSChunks
		}
		if(opts.timeoutPromptTTSChunks){
			rpcRequestParams[SdlCordova.names.timeoutPrompt] = this.toArray(opts.timeoutPromptTTSChunks);
		}
		if(opts.timeout){
			rpcRequestParams[SdlCordova.names.timeout] = Number(opts.timeout);
		}
		if(opts.interactionMode){
			rpcRequestParams[SdlCordova.names.interactionMode] = opts.interactionMode;
		}
		if(opts.initialText){
			rpcRequestParams[SdlCordova.names.initialText] = opts.initialText;
		}
		if(opts.interactionChoiceSetIDList){
			rpcRequestParams[SdlCordova.names.interactionChoiceSetIDList] = opts.interactionChoiceSetIDList;
		}
			
		// Build the request
		var rpcRequest = {};
		rpcRequest[SdlCordova.names.function_name] = SdlCordova.names.function_name_performInteraction;
		rpcRequest[SdlCordova.names.correlationID] = correlationId;
		rpcRequest[SdlCordova.names.parameters] = rpcRequestParams;
		
		// Build the message
		var rpcMessage = {};
		rpcMessage[SdlCordova.names.messageTypeRequest] = rpcRequest;
		
		return this.sendRPCRequest(opts, rpcMessage);
	},
	
	performAudioPassThru: function(correlationId, opts){
		opts = this.extend(opts, SdlCordova.defaultOpts);
		//needs work
	},
	
	putFile: function(correlationId, opts){
		opts = this.extend(opts, SdlCordova.defaultOpts);
		//needs work
		console.log("putFile function running");
		//Builds the request params
		rpcRequestParams = {};
		
		//Build the request
		rpcRequestParams[SdlCordova.names.sdlFileName] = opts.sdlFileName;
		rpcRequestParams[SdlCordova.names.fileType] = opts.fileType;
		rpcRequestParams[SdlCordova.names.filePath] = opts.filePath;
		
		//Builds the message
		var rpcMessage = {};
		rpcMessage[SdlCordova.names.messageTypeRequest] = rpcRequest;
		
		return this.sendBinaryRPCRequest(opts, rpcMessage);
	},
	
	resetGlobalProperties: function(correlationId, opts){
		opts = this.extend(opts, SdlCordova.defaultOpts);
		
		var rpcRequest = {};
		
		if(opts.properties){
			rpcRequest[SdlCordova.names.properties] = this.toArray(opts.properties);
		}
		
		// Build the request		
		rpcRequest[SdlCordova.names.function_name] = SdlCordova.names.function_name_resetGlobalProperties;
		rpcRequest[SdlCordova.names.correlationID] = correlationId;
		
		// Build the message
		var rpcMessage = {};
		rpcMessage[SdlCordova.names.messageTypeRequest] = rpcRequest;
		
		return this.sendRPCRequest(opts, rpcMessage);
	},
	
	setAppIcon: function(correlationId, opts){
		opts = this.extend(opts, SdlCordova.defaultOpts);
		//needs work
	},
	
	setDisplayLayout: function(correlationId, opts){
		opts = this.extend(opts, SdlCordova.defaultOpts);
		//needs work
	},
		
	setGlobalProperties: function(correlationId, opts){
		opts = this.extend(opts, SdlCordova.defaultOpts);
		
		var rpcRequestParams = {};
		
		if(opts.helpPromptTTSText){
			var ttsChunk = new SdlCordova.TTSChunk(SdlCordova.names.speechCapabilities_TEXT, opts.helpPromptTTSText);
			rpcRequestParams[SdlCordova.names.helpPrompt] = [ttsChunk];		// Array of TTSChunks
		}
		if(opts.helpPromptTTSChunks){
			rpcRequestParams[SdlCordova.names.helpPrompt] = this.toArray(opts.helpPromptTTSChunks);
		}
		if(opts.timeoutPromptTTSText){
			var ttsChunk = new SdlCordova.TTSChunk(SdlCordova.names.speechCapabilities_TEXT, opts.timeoutPromptTTSText);
			rpcRequestParams[SdlCordova.names.timeoutPrompt] = [ttsChunk];		// Array of TTSChunks
		}
		if(opts.timeoutPromptTTSChunks){
			rpcRequestParams[SdlCordova.names.timeoutPrompt] = this.toArray(opts.timeoutPromptTTSChunks);
		}
		
		// Build the request
		var rpcRequest = {};
		rpcRequest[SdlCordova.names.function_name] = SdlCordova.names.function_name_setGlobalProperties;
		rpcRequest[SdlCordova.names.correlationID] = correlationId;
		rpcRequest[SdlCordova.names.parameters] = rpcRequestParams;
		
		// Build the message
		var rpcMessage = {};
		rpcMessage[SdlCordova.names.messageTypeRequest] = rpcRequest;
		
		return this.sendRPCRequest(opts, rpcMessage);
	},
	
	setMediaClockTimer: function(correlationId, opts){
		opts = this.extend(opts, SdlCordova.defaultOpts);
		
		var rpcRequestParams = {};
		
		if(opts.hours >= 0 || opts.minutes >= 0 || opts.seconds >= 0){
			var startTime = {};
			
			startTime[SdlCordova.names.hours] = Number(opts.hours || 0);
			startTime[SdlCordova.names.minutes] = Number(opts.minutes || 0);
			startTime[SdlCordova.names.seconds] = Number(opts.seconds || 0);
			
			rpcRequestParams[SdlCordova.names.startTime] = startTime;
		}
		if(opts.updateMode){
			rpcRequestParams[SdlCordova.names.updateMode] = opts.updateMode;
		}
		
		// Build the request
		var rpcRequest = {};
		rpcRequest[SdlCordova.names.function_name] = SdlCordova.names.function_name_setMediaClockTimer;
		rpcRequest[SdlCordova.names.correlationID] = correlationId;
		rpcRequest[SdlCordova.names.parameters] = rpcRequestParams;
		
		// Build the message
		var rpcMessage = {};
		rpcMessage[SdlCordova.names.messageTypeRequest] = rpcRequest;
		
		return this.sendRPCRequest(opts, rpcMessage);
	},

	show: function(correlationId, opts){
		opts = this.extend(opts, SdlCordova.defaultOpts);
		
		// Build the request params
		var rpcRequestParams = {};
		
		if(opts.mainField1 === "" || opts.mainField1){
			rpcRequestParams[SdlCordova.names.mainField1] = opts.mainField1;
		}
		if(opts.mainField2 === "" || opts.mainField2){
			rpcRequestParams[SdlCordova.names.mainField2] = opts.mainField2;
		}
		if(opts.alignment){
			rpcRequestParams[SdlCordova.names.alignment] = opts.alignment;
		}
		if(opts.statusBar){
			rpcRequestParams[SdlCordova.names.statusBar] = opts.statusBar;
		}
		if(opts.mediaClock){
			rpcRequestParams[SdlCordova.names.mediaClock] = opts.mediaClock;
		}
		if(opts.mediaTrack){
			rpcRequestParams[SdlCordova.names.mediaTrack] = opts.mediaTrack;
		}
	
		// Build the request
		var rpcRequest = {};
		rpcRequest[SdlCordova.names.function_name] = SdlCordova.names.function_name_show;
		rpcRequest[SdlCordova.names.correlationID] = Number(correlationId);
		rpcRequest[SdlCordova.names.parameters] = rpcRequestParams;
		
		// Build the message
		var rpcMessage = {};
		rpcMessage[SdlCordova.names.messageTypeRequest] = rpcRequest;		
		
		return this.sendRPCRequest(opts, rpcMessage);
	},
	
	speakText: function(correlationId, opts){
		opts = this.extend(opts, SdlCordova.defaultOpts);
		
		// Build the request params
		var rpcRequestParams = {};
		if(opts.ttsText){
			// Build simple ttsChunks
			var newTTSChunk = new SdlCordova.TTSChunk(SdlCordova.names.speechCapabilities_TEXT, opts.ttsText);
			rpcRequestParams[SdlCordova.names.ttsChunks] = [newTTSChunk];	// Array of TTSChunk
		}
		if(opts.ttsChunks){
			rpcRequestParams[SdlCordova.names.ttsChunks] = this.toArray(opts.ttsChunks);
		}
		
		// Build the request
		var rpcRequest = {};
		rpcRequest[SdlCordova.names.function_name] = SdlCordova.names.function_name_speak;
		rpcRequest[SdlCordova.names.correlationID] = Number(correlationId);
		rpcRequest[SdlCordova.names.parameters] = rpcRequestParams;
		
		// Build the message
		var rpcMessage = {};
		rpcMessage[SdlCordova.names.messageTypeRequest] = rpcRequest;
		
		
		return this.sendRPCRequest(opts, rpcMessage);
	},
	
	subscribeButton: function(correlationId, opts){
		opts = this.extend(opts, SdlCordova.defaultOpts);
		
		// Build the request params
		var rpcRequestParams = {};
		
		if(opts.buttonName){
			rpcRequestParams[SdlCordova.names.buttonName] = opts.buttonName;
		}
		
		// Build the request
		var rpcRequest = {};
		rpcRequest[SdlCordova.names.function_name] = SdlCordova.names.function_name_subscribeButton;
		rpcRequest[SdlCordova.names.correlationID] = Number(correlationId);
		rpcRequest[SdlCordova.names.parameters] = rpcRequestParams;
		
		// Build the message
		var rpcMessage = {};
		rpcMessage[SdlCordova.names.messageTypeRequest] = rpcRequest;
		
		return this.sendRPCRequest(opts, rpcMessage);
	},
	
	unsubscribeButton: function(correlationId, opts){
		opts = this.extend(opts, SdlCordova.defaultOpts);
		
		// Build the request params
		var rpcRequestParams = {};
		
		if(opts.buttonName){
			rpcRequestParams[SdlCordova.names.buttonName] = opts.buttonName;
		}
		
		// Build the request
		var rpcRequest = {};
		rpcRequest[SdlCordova.names.function_name] = SdlCordova.names.function_name_unsubscribeButton;
		rpcRequest[SdlCordova.names.correlationID] = Number(correlationId);
		rpcRequest[SdlCordova.names.parameters] = rpcRequestParams;
		
		// Build the message
		var rpcMessage = {};
		rpcMessage[SdlCordova.names.messageTypeRequest] = rpcRequest;
		
		return this.sendRPCRequest(opts, rpcMessage);
	},
	
	getButtonCapabilities: function(opts){
		opts = this.extend(opts, SdlCordova.defaultOptsNonRPC);
		
		return cordova.exec(opts.success, opts.error, "SdlCordova", SdlCordova.names.ACTION_GET_BUTTON_CAPABILITIES, [null]);
	},
	
	getDisplayCapabilities: function(opts){
		opts = this.extend(opts, SdlCordova.defaultOptsNonRPC);
		
		return cordova.exec(opts.success, opts.error, "SdlCordova", SdlCordova.names.ACTION_GET_DISPLAY_CAPABILITIES, [null]);
	},
	
	getHMIDisplayLanguage: function(opts){
		opts = this.extend(opts, SdlCordova.defaultOptsNonRPC);
		
		return cordova.exec(opts.success, opts.error, "SdlCordova", SdlCordova.names.ACTION_GET_HMI_DISPLAY_LANGUAGE, [null]);
	},
	
	getHMIZoneCapabilities: function(opts){
		opts = this.extend(opts, SdlCordova.defaultOptsNonRPC);
		
		return cordova.exec(opts.success, opts.error, "SdlCordova", SdlCordova.names.ACTION_GET_HMI_ZONE_CAPABILITIES, [null]);
	},
	
	getPresetBankCapabilities: function(opts){
		opts = this.extend(opts, SdlCordova.defaultOptsNonRPC);
		
		return cordova.exec(opts.success, opts.error, "SdlCordova", SdlCordova.names.ACTION_GET_PRESET_BANK_CAPABILITIES, [null]);
	},

	getSoftButtonCapabilities: function(opts){
		opts = this.extend(opts, SdlCordova.defaultOptsNonRPC);
		
		return cordova.exec(opts.success, opts.error, "SdlCordova", SdlCordova.names.ACTION_GET_SOFT_BUTTON_CAPABILITIES, [null]);
	},

	getSpeechCapabilities: function(opts){
		opts = this.extend(opts, SdlCordova.defaultOptsNonRPC);
		
		return cordova.exec(opts.success, opts.error, "SdlCordova", SdlCordova.names.ACTION_GET_SPEECH_CAPABILITIES, [null]);
	},
	
	getSdlLanguage: function(opts){
		opts = this.extend(opts, SdlCordova.defaultOptsNonRPC);
		
		return cordova.exec(opts.success, opts.error, "SdlCordova", SdlCordova.names.ACTION_GET_SDL_LANGUAGE, [null]);
	},
	
	getSdlMsgVersion: function(opts){
		opts = this.extend(opts, SdlCordova.defaultOptsNonRPC);
		
		return cordova.exec(opts.success, opts.error, "SdlCordova", SdlCordova.names.ACTION_GET_SDL_MSG_VERSION, [null]);
	},
	
	getVehicleType: function(opts){
		opts = this.extend(opts, SdlCordova.defaultOptsNonRPC);
		
		return cordova.exec(opts.success, opts.error, "SdlCordova", SdlCordova.names.ACTION_GET_VEHICLE_TYPE, [null]);
	},
	
	getVRCapabilities: function(opts){
		opts = this.extend(opts, SdlCordova.defaultOptsNonRPC);
		
		return cordova.exec(opts.success, opts.error, "SdlCordova", SdlCordova.names.ACTION_GET_VR_CAPABILITIES, [null]);
	},
	
	getWiProVersion: function(opts){
		opts = this.extend(opts, SdlCordova.defaultOptsNonRPC);
		
		return cordova.exec(opts.success, opts.error, "SdlCordova", SdlCordova.names.ACTION_GET_WIPRO_VERSION, [null]);
	},
	
	disableSiphonDebug: function(opts){
		opts = this.extend(opts, SdlCordova.defaultOptsNonRPC);
		
		return cordova.exec(opts.success, opts.error, "SdlCordova", SdlCordova.names.ACTION_DISABLE_SIPHON_DEBUG, [null]);
	},
	
	enableSiphonDebug: function(opts){
		opts = this.extend(opts, SdlCordova.defaultOptsNonRPC);
		
		return cordova.exec(opts.success, opts.error, "SdlCordova", SdlCordova.names.ACTION_ENABLE_SIPHON_DEBUG, [null]);
	},
	
	disableDebugTool: function(opts){
		opts = this.extend(opts, SdlCordova.defaultOptsNonRPC);
		
		return cordova.exec(opts.success, opts.error, "SdlCordova", SdlCordova.names.ACTION_DISABLE_DEBUG_TOOL, [null]);
	},
	
	enableDebugTool: function(opts){
		opts = this.extend(opts, SdlCordova.defaultOptsNonRPC);
		
		return cordova.exec(opts.success, opts.error, "SdlCordova", SdlCordova.names.ACTION_ENABLE_DEBUG_TOOL, [null]);
	},
	
	/*****************************
	 * Proxy functions
	 *****************************/
	onAddCommandResponse: function(f){
		this.bind(SdlCordova.names.function_name_addCommand, f);
	},

	onAddSubMenuResponse: function(f){
		this.bind(SdlCordova.names.function_name_addSubMenu, f);
	},

	onAlertResponse: function(f){
		this.bind(SdlCordova.names.function_name_alert, f);
	},

	onCreateInteractionChoiceSetResponse: function(f){
		this.bind(SdlCordova.names.function_name_createInteractionChoiceSet, f);
	},
	
	onDeleteCommandResponse: function(f){
		this.bind(SdlCordova.names.function_name_deleteCommand, f);
	},

	onDeleteFileResponse: function(f){
		this.bind(SdlCordova.names.function_name_deleteFile, f);
	},
	
	onDeleteInteractionChoiceSetResponse: function(f){
		this.bind(SdlCordova.names.function_name_deleteInteractionChoiceSet, f);
	},

	onDeleteSubMenuResponse: function(f){
		this.bind(SdlCordova.names.function_name_deleteSubMenu, f);
	},
	
	onListFilesResponse: function(f){
		this.bind(SdlCordova.names.function_name_listFiles, f);
	},
	
	onEncodedSyncPDataResponse: function(f){
		this.bind(SdlCordova.names.function_name_encodedSyncPData, f);
	},

	onPerformAudioPassThruResponse: function(f){
		this.bind(SdlCordova.names.function_name_performAudioPassThru,f);
	},
	
	onPerformInteractionResponse: function(f){
		this.bind(SdlCordova.names.function_name_performInteraction, f);
	},

	onPutFileResponse: function(f){
		this.bind(SdlCordova.names.function_name_putFile, f);
	},
	
	onRegisterAppInterfaceResponse: function(f){
		this.bind(SdlCordova.names.function_name_registerAppInterface, f);
	},

	onSetAppIconResponse: function(f){
		this.bind(SdlCordova.names.function_name_setAppIcon, f);
	},
	
	onSetDisplayLayoutResponse: function(f){
		this.bind(SdlCordova.names.function_name_setDisplayLayout, f);
	},
	
	onSetGlobalPropertiesResponse: function(f){
		this.bind(SdlCordova.names.function_name_setGlobalProperties, f);
	},

	onResetGlobalPropertiesResponse: function(f){
		this.bind(SdlCordova.names.function_name_resetGlobalProperties, f);
	},
	
	onSetMediaClockTimerResponse: function(f){
		this.bind(SdlCordova.names.function_name_setMediaClockTimer, f);
	},

	onShowResponse: function(f){
		this.bind(SdlCordova.names.function_name_show, f);
	},

	onSpeakResponse: function(f){
		this.bind(SdlCordova.names.function_name_speak, f);
	},

	onSubscribeButtonResponse: function(f){
		this.bind(SdlCordova.names.function_name_subscribeButton, f);
	},
	
	onUnregisterAppInterfaceResponse: function(f){
		this.bind(SdlCordova.names.function_name_unregisterAppInterface, f);
	},

	onUnsubscribeButtonResponse: function(f){
		this.bind(SdlCordova.names.function_name_unsubscribeButton, f);
	},

	onOnButtonEvent: function(f){
		this.bind(SdlCordova.names.RPC_NOTIFICATION_onButtonEvent, f);
	},

	onOnButtonPress: function(f){
		this.bind(SdlCordova.names.RPC_NOTIFICATION_onButtonPress, f);
	},

	onOnEncodedSyncPData: function(f){
		this.bind(SdlCordova.names.RPC_NOTIFICATION_onEncodedSyncPData, f);
	},

	onOnTBTClientState: function(f){
		this.bind(SdlCordova.names.RPC_NOTIFICATION_onTBTClientState , f);
	},
	
	onOnDriverDistraction: function(f){
		this.bind(SdlCordova.names.RPC_NOTIFICATION_onDriverDistraction, f);
	},
	
	onOnCommand: function(f){
		try{
		this.bind(SdlCordova.names.RPC_NOTIFICATION_onCommand, f);
		} catch(err) {
			console.log("[ERROR]: " + err);
		}
	},

	onOnHMIStatus: function(f){
		this.bind(SdlCordova.names.RPC_NOTIFICATION_onHMIStatus, f);
	},

	onOnAppInterfaceUnregistered: function(f){
		this.bind(SdlCordova.names.RPC_NOTIFICATION_onAppInterfaceUnregistered, f);
	},

	onGenericResponse: function(f){
		this.bind(SdlCordova.names.function_name_genericResponse, f);
	},

	onError: function(f){
		this.bind(SdlCordova.names.PROXY_EVENT_OnError, f);
	},

	onProxyClosed: function(f){
		this.bind(SdlCordova.names.PROXY_EVENT_OnProxyClosed, f);
	},
	
	onProxyFirstAccess: function(f){
		this.bind(SdlCordova.names.PROXY_EVENT_OnFirstAccess, f);
	},
	
	//************* Other Objects ***********************/
TTSChunk: function(type, text){	
	this[SdlCordova.names.type] = type;
	this[SdlCordova.names.text] = text;
},

Choice: function(choiceId, menuName, vrCommands){
	this[SdlCordova.names.choiceID] = choiceId;
	this[SdlCordova.names.menuName] = menuName;
	this[SdlCordova.names.vrCommands] = vrCommands;
}
};

// Define Static Variables
SdlCordova.names.RPC_MESSAGE_NAME = "rpc_message_name";

// Actions
SdlCordova.names.ACTION_CREATE_PROXY = "createProxy";
SdlCordova.names.ACTION_DISABLE_DEBUG_TOOL = "disableDebugTool";
SdlCordova.names.ACTION_DISABLE_SIPHON_DEBUG = "disableSiphonDebug";
SdlCordova.names.ACTION_ENABLE_DEBUG_TOOL = "enableDebugTool";
SdlCordova.names.ACTION_ENABLE_SIPHON_DEBUG = "enableSiphonDebug";
SdlCordova.names.ACTION_GET_BUTTON_CAPABILITIES = "getButtonCapabilities";
SdlCordova.names.ACTION_GET_DISPLAY_CAPABILITIES = "getDisplayCapabilities";
SdlCordova.names.ACTION_GET_DOES_PROXY_EXIST = "doesProxyExist";
SdlCordova.names.ACTION_GET_HMI_DISPLAY_LANGUAGE = "getHmiDisplayLanguage";
SdlCordova.names.ACTION_GET_HMI_ZONE_CAPABILITIES = "getHmiZoneCapabilities";
SdlCordova.names.ACTION_GET_PERSISTENT_SYNC_DATA = "getPersistentSyncData";
SdlCordova.names.ACTION_GET_PRESET_BANK_CAPABILITIES = "getPresetBankCapabilities";
SdlCordova.names.ACTION_GET_SOFT_BUTTON_CAPABILITIES = "getSoftButtonCapabilities";
SdlCordova.names.ACTION_GET_SPEECH_CAPABILITIES = "getSpeechCapabilities";
SdlCordova.names.ACTION_GET_SDL_LANGUAGE = "getSdlLanguage";
SdlCordova.names.ACTION_GET_SDL_MSG_VERSION = "getSdlMsgVersion";
SdlCordova.names.ACTION_GET_VEHICLE_TYPE = "getVehicleType";
SdlCordova.names.ACTION_GET_VR_CAPABILITIES = "getVrCapabilities";
SdlCordova.names.ACTION_GET_WIPRO_VERSION = "getWiproVersion";
SdlCordova.names.ACTION_REGISTER_NEW_CALLBACK_CONTEXT = "registerNewCallbackContext";
SdlCordova.names.ACTION_SEND_RPC_REQUEST = "sendRpcRequest";

// RPC Parameters
SdlCordova.names.messageTypeRequest = "request";
SdlCordova.names.messageTypeResponse = "response"; // TODO Verfiy
SdlCordova.names.messageTypeNotification = "notification"; // TODO Verfiy
SdlCordova.names.function_name = "name";
SdlCordova.names.parameters = "parameters";
SdlCordova.names.correlationID = "correlationID";
	
	// DoesProxyExist
	SdlCordova.names.PROXY_EXISTS = "proxy_exists";

	// OnHMIStatus
	SdlCordova.names.audioStreamingState = "audioStreamingState";
	SdlCordova.names.hmiLevel = "hmiLevel";
	SdlCordova.names.systemContext = "systemContext";
	
	// AddCommand	
	SdlCordova.names.cmdID = "cmdID";
	SdlCordova.names.menuName = "menuName";
	SdlCordova.names.parentID = "parentID";
	SdlCordova.names.position = "position";
	SdlCordova.names.vrCommands = "vrCommands";
	SdlCordova.names.menuParams = "menuParams";
	
	// AddSubMenu
	SdlCordova.names.menuID = "menuID";
	//SdlCordova.names.menuName = "menuName";
	//SdlCordova.names.position = "position";
	
	// Alert
	SdlCordova.names.ttsText = "ttsText";
	SdlCordova.names.alertText1 = "alertText1";
	SdlCordova.names.alertText2 = "alertText2";
	SdlCordova.names.duration = "duration";
	SdlCordova.names.playTone = "playTone";
	
	// CreateInteraction
	SdlCordova.names.interactionChoiceSetID = "interactionChoiceSetID";
	SdlCordova.names.choiceSet = "choiceSet";
	// ChoiceSet
	SdlCordova.names.choiceID = "choiceID";
	//SdlCordova.names.menuName = "menuName";
	//SdlCordova.names.vrCommands = "vrCommands";
	
	// DeleteCommand
	//SdlCordova.names.cmdID = "cmdID";
	
	// DeleteInteractionChoiceSet
	//SdlCordova.names.interactionChoiceSetID = "interactionChoiceSetID";
	
	// DeleteSubMenu
	//SdlCordova.names.menuID = "menuID";
	
	//EncodedSyncPData
	SdlCordova.names.data = "data";
	
	// PerformInteraction
	SdlCordova.names.initialTTSText = "initialTTSText";
	SdlCordova.names.initialTTSChunks = "initialTTSChunks";
	SdlCordova.names.initialPrompt = "initialPrompt";
	SdlCordova.names.helpPromptTTSText = "helpPromptTTSText";
	SdlCordova.names.helpPromptTTSChunks = "helpPromptTTSChunks";
	SdlCordova.names.helpPrompt = "helpPrompt";
	SdlCordova.names.timeoutPromptTTSText = "timeoutPromptTTSText";
	SdlCordova.names.timeoutPromptTTSChunks = "timeoutPromptTTSChunks";
	SdlCordova.names.timeoutPrompt = "timeoutPrompt";
	SdlCordova.names.timeout = "timeout";
	//SdlCordova.names.choiceSet = "choiceSet";
	SdlCordova.names.initialText = "initialText";
	SdlCordova.names.interactionChoiceSetIDList = "interactionChoiceSetIDList";
	SdlCordova.names.interactionMode = "interactionMode";
	SdlCordova.names.interactionMode_MANUAL_ONLY = "MANUAL_ONLY";
	SdlCordova.names.interactionMode_VR_ONLY = "VR_ONLY";
	SdlCordova.names.interactionMode_BOTH = "BOTH";
	
	// SetGlobalProperties
	//SdlCordova.names.helpPrompt = "helpPrompt";
	//SdlCordova.names.timeoutPrompt = "timeoutPrompt";
	
	// ResetGlobalProperties
	SdlCordova.names.properties = "properties";
	SdlCordova.names.HELP_PROMPT = "HELPPROMPT";
	SdlCordova.names.TIMEOUT_PROMPT = "TIMEOUTPROMPT";
	
	//PutFile
	SdlCordova.names.sdlFileName = "syncFileName";
	SdlCordova.names.fileType = "fileType";
	SdlCordova.names.filePath = "filePath";
	
	// SetMediaClockTimer
	SdlCordova.names.startTime = "startTime";
	SdlCordova.names.hours = "hours";
	SdlCordova.names.minutes = "minutes";
	SdlCordova.names.seconds = "seconds";
	SdlCordova.names.updateMode = "updateMode";
	SdlCordova.names.updateMode_COUNTUP = "COUNTUP";
	SdlCordova.names.updateMode_COUNTDOWN = "COUNTDOWN";
	SdlCordova.names.updateMode_PAUSE = "PAUSE";
	SdlCordova.names.updateMode_RESUME = "RESUME";

	// Show 	
	SdlCordova.names.mainField1 = "mainField1";
	SdlCordova.names.mainField2 = "mainField2";
	SdlCordova.names.alignment = "alignment";
	SdlCordova.names.alignment_left = "LEFT_ALIGNED";
	SdlCordova.names.alignment_right = "RIGHT_ALIGNED";
	SdlCordova.names.alignment_center = "CENTERED";
	SdlCordova.names.statusBar = "statusBar";
	SdlCordova.names.mediaClock = "mediaClock";
	SdlCordova.names.mediaTrack = "mediaTrack";
	
	// Speak	
	//SdlCordova.ttsText = "ttsText";	
	SdlCordova.names.ttsChunks = "ttsChunks";
	// Speak TTSChunks
	SdlCordova.names.text = "text";
	SdlCordova.names.type = "type";
	SdlCordova.names.speechCapabilities_TEXT = "TEXT";
	SdlCordova.names.speechCapabilities_SAPI_PHONEMES = "SAPI_PHONEMES";
	SdlCordova.names.speechCapabilities_LHPLUS_PHONEMES = "LHPLUS_PHONEMES";
	SdlCordova.names.speechCapabilities_PRE_RECORDED = "PRE_RECORDED";
	SdlCordova.names.speechCapabilities_SILENCE = "SILENCE";
	
	// SubscribeButton
	SdlCordova.names.buttonName = "buttonName";
	SdlCordova.names.buttonName_OK = "OK";
	SdlCordova.names.buttonName_SEEKLEFT = "SEEKLEFT";
	SdlCordova.names.buttonName_SEEKRIGHT = "SEEKRIGHT";
	SdlCordova.names.buttonName_TUNEUP = "TUNEUP";
	SdlCordova.names.buttonName_TUNEDOWN = "TUNEDOWN";
	SdlCordova.names.buttonName_PRESET_0 = "PRESET_0";
	SdlCordova.names.buttonName_PRESET_1 = "PRESET_1";
	SdlCordova.names.buttonName_PRESET_2 = "PRESET_2";
	SdlCordova.names.buttonName_PRESET_3 = "PRESET_3";
	SdlCordova.names.buttonName_PRESET_4 = "PRESET_4";
	SdlCordova.names.buttonName_PRESET_5 = "PRESET_5";
	SdlCordova.names.buttonName_PRESET_6 = "PRESET_6";
	SdlCordova.names.buttonName_PRESET_7 = "PRESET_7";
	SdlCordova.names.buttonName_PRESET_8 = "PRESET_8";
	SdlCordova.names.buttonName_PRESET_9 = "PRESET_9";
	
	// UnSubscribeButton
	//SdlCordova.buttonName = "buttonName";
	
	// Function Names	
	SdlCordova.names.function_name_show = "Show";
	SdlCordova.names.function_name_speak = "Speak";
	SdlCordova.names.function_name_alert = "Alert";
	SdlCordova.names.function_name_addCommand = "AddCommand";
	SdlCordova.names.function_name_deleteCommand = "DeleteCommand";	
	SdlCordova.names.function_name_addSubMenu = "AddSubMenu";	
	SdlCordova.names.function_name_deleteSubMenu = "DeleteSubMenu";	
	SdlCordova.names.function_name_doesProxyExist = "doesProxyExist";
	SdlCordova.names.function_name_createInteractionChoiceSet = "CreateInteractionChoiceSet";	
	SdlCordova.names.function_name_deleteInteractionChoiceSet = "DeleteInteractionChoiceSet";
	SdlCordova.names.function_name_performAudioPassThru = "PerformAudioPassThru";
	SdlCordova.names.function_name_performInteraction = "PerformInteraction";	
	SdlCordova.names.function_name_registerAppInterface = "RegisterAppInterface";
	SdlCordova.names.function_name_unregisterAppInterface = "UnregisterAppInterface";
	SdlCordova.names.function_name_dialNumber = "DialNumber";
	SdlCordova.names.function_name_encodedSyncPData = "EncodedSyncPData";
	SdlCordova.names.function_name_subscribeButton = "SubscribeButton";
	SdlCordova.names.function_name_unsubscribeButton = "UnsubscribeButton";
	SdlCordova.names.function_name_subscribeVehicleData = "SubscribeVehicleData";
	SdlCordova.names.function_name_unsubscribeVehicleData = "UnsubscribeVehicleData";
	SdlCordova.names.function_name_setAppIcon = "SetAppIcon";
	SdlCordova.names.function_name_setDisplayLayout = "SetDisplayLayout";
	SdlCordova.names.function_name_setMediaClockTimer = "SetMediaClockTimer";
	SdlCordova.names.function_name_setGlobalProperties = "SetGlobalProperties";
	SdlCordova.names.function_name_genericResponse = "GenericResponse";
	SdlCordova.names.function_name_getDID = "GetDID";
	SdlCordova.names.function_name_getDTCs = "GetDTCs";
	SdlCordova.names.function_name_getFile = "GetFile";
	SdlCordova.names.function_name_putFile = "PutFile";
	SdlCordova.names.function_name_deleteFile = "DeleteFile";
	SdlCordova.names.function_name_listFiles = "ListFiles";
	SdlCordova.names.function_name_endAudioCapture = "EndAudioCapture";
	SdlCordova.names.function_name_getVehicleData = "GetVehicleData";
	SdlCordova.names.function_name_resetGlobalProperties = "ResetGlobalProperties";
	SdlCordova.names.function_name_performAudioCapture = "PerformAudioCapture";
	
	// Notifications
	SdlCordova.names.RPC_NOTIFICATION_onCommand = "OnCommand";
	SdlCordova.names.RPC_NOTIFICATION_onDataPublished = "OnDataPublished";
	SdlCordova.names.RPC_NOTIFICATION_onButtonPress = "OnButtonPress";
	SdlCordova.names.RPC_NOTIFICATION_onButtonEvent = "OnButtonEvent";
	SdlCordova.names.RPC_NOTIFICATION_onHMIStatus = "OnHMIStatus";
	SdlCordova.names.RPC_NOTIFICATION_onTBTClientState = "OnTBTClientState";
	SdlCordova.names.RPC_NOTIFICATION_onEncodedSyncPData = "OnEncodedSyncPData";
	SdlCordova.names.RPC_NOTIFICATION_onDriverDistraction = "OnDriverDistraction";
	SdlCordova.names.RPC_NOTIFICATION_onAppInterfaceUnregistered = "OnAppInterfaceUnregistered";	
	
	// Proxy Events
	SdlCordova.names.PROXY_EVENT_OnProxyClosed = "OnProxyClosed";
	SdlCordova.names.PROXY_EVENT_OnError = "OnError";
	SdlCordova.names.PROXY_EVENT_OnFirstAccess = "OnFirstAccess";

	//Streaming States
	SdlCordova.names.AUDIO_STREAMING_STATE_AUDIBLE = "AUDIBLE";
	SdlCordova.names.AUDIO_STREAMING_STATE_NOT_AUDIBLE = "NOT_AUDIBLE";
	
/*************** Default Parameters *****************/
// Global
SdlCordova.defaultOpts = {
	success: function(){}, 
	error: function(){}
};

SdlCordova.defaultOptsNonRPC = {
	success: function(){},
	error: function(){}
};

SdlCordova.defaultOptsCreateProxy = {
	success: function(){}, 
	fail: function(){
	console.log("opts.fail is called");}, 
	isMediaApplication: true
};

// Show
var showDefaultParams = {};
showDefaultParams[SdlCordova.names.alignment] = SdlCordova.names.alignment_left;


module.exports = SdlCordova;