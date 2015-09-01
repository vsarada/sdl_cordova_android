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
	
	//
	/*testPlugin: function(success, fail, resultType){
		return cordova.exec(function(){alert("success");}, 
				function(){alert("failure");}, 
				"SdlCordova", 
				"test", 
				[resultType]);
	},*/
	
	siphonLog: function(opts){
		/*if(typeof msg == "string"){
			var temp = msg;
			msg = this.clone(SdlCordova.DefaultOptsLogMessage);
			msg.message = temp;
		}else{*/
			opts = this.extend(opts, SdlCordova.defaultOptsLogMessage);				
		//}
		
		var error = opts.error;
		opts.error = function(){
			if(typeof console == "object" && typeof console.log == "function"){
				console.log("Redirect from Siphon Log: " + opts.message);
				opts.success();
			}else{
				error("Could not log message");
			}
		};
		
		//this.executeAction(opts, SdlCordova.Names.Actions.SIPHON_LOG, [opts.message]);
		cordova.exec(this.iProxyListenerCallback, opts.error, "SdlCordova", SdlCordova.names.SIPHON_LOG, [opts.message]);
	},
	//
	
	createProxy: function(opts){

		opts = this.extend(opts, SdlCordova.defaultOptsCreateProxy);

        this.createProxySuccess = opts.success;
        this.appName = opts.appName;
		this.languageDesired = opts.languageDesired; //hmiDisplayLanguageDesired
		this.hmiLanguageDesired = opts.hmiLanguageDesired; //added
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

		//Jiaxi copied from old file
		// Optional Params
        if(opts.ngnMediaScreenAppName){ //not exist
        	params[SdlCordova.Names.RPCFields.NGN_MEDIA_SCREEN_APP_NAME] = opts.ngnMediaScreenAppName;
        }
        if(opts.vrSynonyms){ //not exist
        	params[SdlCordova.Names.RPCFields.VR_SYNONYMS] = opts.vrSynonyms;
        }
        if(opts.sdlMsgVersion){ //not exist
        	params[SdlCordova.Names.RPCFields.Sdl_MSG_VERSION] = opts.sdlMsgVersion;
        }
       /*if(opts.language){ not needed renamed to languageDesired
        	params[SdlCordova.Names.RPCFields.LANGUAGE] = opts.language;
       }*/
       if(opts.autoActivateID){ //not exist
        	params[SdlCordova.Names.RPCFields.AUTO_ACTIVATE_ID] = opts.autoActivateID;
       }
       //

		cordova.exec(opts.success, opts.fail, "SdlCordova", SdlCordova.names.ACTION_CREATE_PROXY, [params]);
		//TODO cordova.exec(this.iProxyListenerCallback, opts.fail, "SdlCordova", SdlCordova.names.ACTION_CREATE_PROXY, [params]);
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
		console.log("JSON: " + json);
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

	getPersistentSdlData: function(opts){
		opts = this.extend(opts, SdlCordova.defaultOptsNonRPC);
		return cordova.exec(opts.success, opts.error, "SdlCordova", SdlCordova.names.ACTION_GET_PERSISTENT_SDL_DATA, [null]);
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
		if(opts.cmdIcon){
			rpcRequestParams[SdlCordova.names.cmdIcon] = opts.cmdIcon;
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
		// added
		if(opts.alertText3){
			rpcRequestParams[SdlCordova.names.alertText3] = opts.alertText3;
		}
		//
		if(opts.duration){
			rpcRequestParams[SdlCordova.names.duration] = Number(opts.duration);
		}
		if(opts.playTone){
			rpcRequestParams[SdlCordova.names.playTone] = opts.playTone;
		}
		if(opts.softButtons){
			rpcRequestParams[SdlCordova.names.softButtons] = this.toArray(opts.softButtons);
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
		// added
		var rpcRequestParams = {};
		
		if(opts.sdlFileName){
			rpcRequestParams[SdlCordova.names.sdlFileName] = opts.sdlFileName;
		}
		
		// Build the request
		var rpcRequest = {};
		rpcRequest[SdlCordova.names.function_name] = SdlCordova.names.function_name_deleteFile;
		rpcRequest[SdlCordova.names.correlationID] = correlationId;
		rpcRequest[SdlCordova.names.parameters] = rpcRequestParams;
		
		// Build the message
		var rpcMessage = {};
		rpcMessage[SdlCordova.names.messageTypeRequest] = rpcRequest;
		
		return this.sendRPCRequest(opts, rpcMessage);
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
	
	encodedSdlPData: function(correlationId, opts){
		opts = this.extend(opts, SdlCordova.defaultOpts);
		
		var rpcRequestParams = {};
		if(opts.data){
			rpcRequestParams[SdlCordova.names.data] = this.toArray(opts.data);
		}
		
		// Build the request
		var rpcRequest = {};
		rpcRequest[SdlCordova.names.function_name] = SdlCordova.names.function_name_encodedSdlPData;
		rpcRequest[SdlCordova.names.correlationID] = correlationId;
		rpcRequest[SdlCordova.names.parameters] = rpcRequestParams;
		
		// Build the message
		var rpcMessage = {};
		rpcMessage[SdlCordova.names.messageTypeRequest] = rpcRequest;
		
		return this.sendRPCRequest(opts, rpcMessage);
	},
	
	listFiles: function(correlationId, opts){
		opts = this.extend(opts, SdlCordova.defaultOpts);
		
		//added
		var rpcRequestParams = {};
		var rpcRequest = {};
		rpcRequest[SdlCordova.names.function_name] = SdlCordova.names.function_name_listFiles;
		rpcRequest[SdlCordova.names.correlationID] = correlationId;
		rpcRequest[SdlCordova.names.parameters] = rpcRequestParams;
		
		// Build the message
		var rpcMessage = {};
		rpcMessage[SdlCordova.names.messageTypeRequest] = rpcRequest;
		
		return this.sendRPCRequest(opts, rpcMessage);
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
		
		var rpcRequestParams = {};
		
		if(opts.maxDuration){
			rpcRequestParams[SdlCordova.names.maxDuration] = Number(opts.maxDuration);
		}
		if(opts.audioPassThruDisplayText1){
			rpcRequestParams[SdlCordova.names.audioPassThruDisplayText1] = opts.audioPassThruDisplayText1;
		}
		if(opts.audioPassThruDisplayText2){
			rpcRequestParams[SdlCordova.names.audioPassThruDisplayText2] = opts.audioPassThruDisplayText2;
		}
		if(opts.muteAudio){
			rpcRequestParams[SdlCordova.names.muteAudio] = opts.muteAudio;
		}
		if(opts.samplingRate){
			rpcRequestParams[SdlCordova.names.samplingRate] = opts.samplingRate;
		}
		if(opts.audioType){
			rpcRequestParams[SdlCordova.names.audioType] = opts.audioType;
		}
		if(opts.initialPrompt){
			rpcRequestParams[SdlCordova.names.initialPrompt] = this.toArray(opts.initialPrompt);
		}
		if(opts.bitsPerSample){
			rpcRequestParams[SdlCordova.names.bitsPerSample] = opts.bitsPerSample;
		}
		
		// Build the request
		var rpcRequest = {};
		rpcRequest[SdlCordova.names.function_name] = SdlCordova.names.function_name_performAudioPassThru;
		rpcRequest[SdlCordova.names.correlationID] = correlationId;
		rpcRequest[SdlCordova.names.parameters] = rpcRequestParams;
		
		// Build the message
		var rpcMessage = {};
		rpcMessage[SdlCordova.names.messageTypeRequest] = rpcRequest;
		
		return this.sendRPCRequest(opts, rpcMessage);
		
	},
	
	endAudioPassThru: function(correlationId, opts){
		opts = this.extend(opts, SdlCordova.defaultOpts);
		
		//added
		var rpcRequestParams = {};
		var rpcRequest = {};
		rpcRequest[SdlCordova.names.function_name] = SdlCordova.names.function_name_endAudioPassThru;
		rpcRequest[SdlCordova.names.correlationID] = correlationId;
		rpcRequest[SdlCordova.names.parameters] = rpcRequestParams;
		
		// Build the message
		var rpcMessage = {};
		rpcMessage[SdlCordova.names.messageTypeRequest] = rpcRequest;
		
		return this.sendRPCRequest(opts, rpcMessage);
	},
	
	putFile: function(correlationId, opts){
		opts = this.extend(opts, SdlCordova.defaultOpts);
		//needs work
		console.log("putFile function running");
		//Builds the request params
		var rpcRequestParams = {}; //modified
		
		//modified
		if(opts.fileData){
			rpcRequestParams[SdlCordova.names.fileData] = opts.fileData;
		}
		if(opts.fileType){
			rpcRequestParams[SdlCordova.names.fileType] = opts.fileType;
		}
		if(opts.length){
			rpcRequestParams[SdlCordova.names.length] = opts.length;
		}
		if(opts.offset){
			rpcRequestParams[SdlCordova.names.offset] = opts.offset;
		}
		if(opts.persistentFile){
			rpcRequestParams[SdlCordova.names.persistentFile] = opts.persistentFile;
		}
		if(opts.sdlFileName){
			rpcRequestParams[SdlCordova.names.sdlFileName] = opts.sdlFileName;
		}
		if(opts.systemFile){
			rpcRequestParams[SdlCordova.names.systemFile] = opts.systemFile;
		}
		//rpcRequestParams[SdlCordova.names.filePath] = opts.filePath;
		
		// added
		//Build the request
		var rpcRequest = {};
		rpcRequest[SdlCordova.names.function_name] = SdlCordova.names.function_name_putFile;
		rpcRequest[SdlCordova.names.correlationID] = correlationId;
		rpcRequest[SdlCordova.names.parameters] = rpcRequestParams;
		
		//Builds the message
		var rpcMessage = {};
		rpcMessage[SdlCordova.names.messageTypeRequest] = rpcRequest;
		
		return this.sendRPCRequest(opts, rpcMessage);
	},
	
	resetGlobalProperties: function(correlationId, opts){
		opts = this.extend(opts, SdlCordova.defaultOpts);
		
		var rpcRequestParams = {};
		
		if(opts.properties){
			rpcRequestParams[SdlCordova.names.properties] = this.toArray(opts.properties);
		}
		
		// Build the request
		var rpcRequest = {};		
		rpcRequest[SdlCordova.names.function_name] = SdlCordova.names.function_name_resetGlobalProperties;
		rpcRequest[SdlCordova.names.correlationID] = correlationId;
		rpcRequest[SdlCordova.names.parameters] = rpcRequestParams;

		
		// Build the message
		var rpcMessage = {};
		rpcMessage[SdlCordova.names.messageTypeRequest] = rpcRequest;
		
		return this.sendRPCRequest(opts, rpcMessage);
	},
	
	setAppIcon: function(correlationId, opts){
		opts = this.extend(opts, SdlCordova.defaultOpts);
		
		var rpcRequestParams = {};
		
		if(opts.sdlFileName){
			rpcRequestParams[SdlCordova.names.sdlFileName] = opts.sdlFileName;
		}
		
		// Build the request
		var rpcRequest = {};		
		rpcRequest[SdlCordova.names.function_name] = SdlCordova.names.function_name_setAppIcon;
		rpcRequest[SdlCordova.names.correlationID] = correlationId;
		rpcRequest[SdlCordova.names.parameters] = rpcRequestParams;

		
		// Build the message
		var rpcMessage = {};
		rpcMessage[SdlCordova.names.messageTypeRequest] = rpcRequest;
		
		return this.sendRPCRequest(opts, rpcMessage);
	},
	
	setDisplayLayout: function(correlationId, opts){
		opts = this.extend(opts, SdlCordova.defaultOpts);
		
		var rpcRequestParams = {};
		
		if(opts.displayLayout){
			rpcRequestParams[SdlCordova.names.displayLayout] = opts.displayLayout;
		}
		
		// Build the request
		var rpcRequest = {};		
		rpcRequest[SdlCordova.names.function_name] = SdlCordova.names.function_name_setDisplayLayout;
		rpcRequest[SdlCordova.names.correlationID] = correlationId;
		rpcRequest[SdlCordova.names.parameters] = rpcRequestParams;

		
		// Build the message
		var rpcMessage = {};
		rpcMessage[SdlCordova.names.messageTypeRequest] = rpcRequest;
		
		return this.sendRPCRequest(opts, rpcMessage);
	},
		
	setGlobalProperties: function(correlationId, opts){
		opts = this.extend(opts, SdlCordova.defaultOpts);
		
		var rpcRequestParams = {};
		
		/*if(opts.helpPromptTTSText){
			var ttsChunk = new SdlCordova.TTSChunk(SdlCordova.names.speechCapabilities_TEXT, opts.helpPromptTTSText);
			rpcRequestParams[SdlCordova.names.helpPrompt] = [ttsChunk];		// Array of TTSChunks
		}*/
		if(opts.helpPromptTTSChunks){
			rpcRequestParams[SdlCordova.names.helpPrompt] = this.toArray(opts.helpPromptTTSChunks);
		}
		/*if(opts.timeoutPromptTTSText){
			var ttsChunk = new SdlCordova.TTSChunk(SdlCordova.names.speechCapabilities_TEXT, opts.timeoutPromptTTSText);
			rpcRequestParams[SdlCordova.names.timeoutPrompt] = [ttsChunk];		// Array of TTSChunks
		}*/
		if(opts.timeoutPromptTTSChunks){
			rpcRequestParams[SdlCordova.names.timeoutPrompt] = this.toArray(opts.timeoutPromptTTSChunks);
		}
		if(opts.vrHelpTitle){
			rpcRequestParams[SdlCordova.names.vrHelpTitle] = opts.vrHelpTitle;
		}
		if(opts.vrHelp){
			rpcRequestParams[SdlCordova.names.vrHelp] = this.toArray(opts.vrHelp);
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
		// added
		if(opts.mainField3 === "" || opts.mainField3){
			rpcRequestParams[SdlCordova.names.mainField3] = opts.mainField3;
		}
		if(opts.mainField4 === "" || opts.mainField4){
			rpcRequestParams[SdlCordova.names.mainField4] = opts.mainField4;
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
		if(opts.softButtons){
			rpcRequestParams[SdlCordova.names.softButtons] = this.toArray(opts.softButtons);
		}
		if(opts.graphic){
			rpcRequestParams[SdlCordova.names.graphic] = opts.graphic;
		}
		if(opts.customPresets){
			rpcRequestParams[SdlCordova.names.customPresets] = this.toArray(opts.customPresets);
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
	
	// added
	subscribeVehicleData: function(correlationId, opts){
		opts = this.extend(opts, SdlCordova.defaultOpts);
		
		// Build the request params
		var rpcRequestParams = {};
		
		if(opts.rpm){
			rpcRequestParams[SdlCordova.names.rpm] = opts.rpm;
		}
		if(opts.externalTemperature){
			rpcRequestParams[SdlCordova.names.externalTemperature] = opts.externalTemperature;
		}
		if(opts.fuelLevel){
			rpcRequestParams[SdlCordova.names.fuelLevel] = opts.fuelLevel;
		}
		if(opts.prndl){
			rpcRequestParams[SdlCordova.names.prndl] = opts.prndl;
		}
		if(opts.tirePressure){
			rpcRequestParams[SdlCordova.names.tirePressure] = opts.tirePressure;
		}
		if(opts.engineTorque){
			rpcRequestParams[SdlCordova.names.engineTorque] = opts.engineTorque;
		}
		if(opts.odometer){
			rpcRequestParams[SdlCordova.names.odometer] = opts.odometer;
		}
		if(opts.gps){
			rpcRequestParams[SdlCordova.names.gps] = opts.gps;
		}
		if(opts.fuelLevel_State){
			rpcRequestParams[SdlCordova.names.fuelLevel_State] = opts.fuelLevel_State;
		}
		if(opts.instantFuelConsumption){
			rpcRequestParams[SdlCordova.names.instantFuelConsumption] = opts.instantFuelConsumption;
		}
		if(opts.beltStatus){
			rpcRequestParams[SdlCordova.names.beltStatus] = opts.beltStatus;
		}
		if(opts.bodyInformation){
			rpcRequestParams[SdlCordova.names.bodyInformation] = opts.bodyInformation;
		}
		if(opts.deviceStatus){
			rpcRequestParams[SdlCordova.names.deviceStatus] = opts.deviceStatus;
		}
		if(opts.driverBraking){
			rpcRequestParams[SdlCordova.names.driverBraking] = opts.driverBraking;
		}
		if(opts.wiperStatus){
			rpcRequestParams[SdlCordova.names.wiperStatus] = opts.wiperStatus;
		}
		if(opts.headLampStatus){
			rpcRequestParams[SdlCordova.names.headLampStatus] = opts.headLampStatus;
		}
		if(opts.accPedalPosition){
			rpcRequestParams[SdlCordova.names.accPedalPosition] = opts.accPedalPosition;
		}
		if(opts.steeringWheelAngle){
			rpcRequestParams[SdlCordova.names.steeringWheelAngle] = opts.steeringWheelAngle;
		}
		if(opts.eCallInfo){
			rpcRequestParams[SdlCordova.names.eCallInfo] = opts.eCallInfo;
		}
		if(opts.airbagStatus){
			rpcRequestParams[SdlCordova.names.airbagStatus] = opts.airbagStatus;
		}
		if(opts.emergencyEvent){
			rpcRequestParams[SdlCordova.names.emergencyEvent] = opts.emergencyEvent;
		}
		if(opts.clusterModeStatus){
			rpcRequestParams[SdlCordova.names.clusterModeStatus] = opts.clusterModeStatus;
		}
		if(opts.myKey){
			rpcRequestParams[SdlCordova.names.myKey] = opts.myKey;
		}
		if(opts.speed){
			rpcRequestParams[SdlCordova.names.speed] = opts.speed;
		}
		
		// Build the request
		var rpcRequest = {};
		rpcRequest[SdlCordova.names.function_name] = SdlCordova.names.function_name_subscribeVehicleData;
		rpcRequest[SdlCordova.names.correlationID] = Number(correlationId);
		rpcRequest[SdlCordova.names.parameters] = rpcRequestParams;
		
		// Build the message
		var rpcMessage = {};
		rpcMessage[SdlCordova.names.messageTypeRequest] = rpcRequest;
		
		
		return this.sendRPCRequest(opts, rpcMessage);
		
	},
	
	unsubscribeVehicleData: function(correlationId, opts){
		opts = this.extend(opts, SdlCordova.defaultOpts);
		
		// Build the request params
		var rpcRequestParams = {};
		
		if(opts.rpm){
			rpcRequestParams[SdlCordova.names.rpm] = opts.rpm;
		}
		if(opts.externalTemperature){
			rpcRequestParams[SdlCordova.names.externalTemperature] = opts.externalTemperature;
		}
		if(opts.fuelLevel){
			rpcRequestParams[SdlCordova.names.fuelLevel] = opts.fuelLevel;
		}
		if(opts.prndl){
			rpcRequestParams[SdlCordova.names.prndl] = opts.prndl;
		}
		if(opts.tirePressure){
			rpcRequestParams[SdlCordova.names.tirePressure] = opts.tirePressure;
		}
		if(opts.engineTorque){
			rpcRequestParams[SdlCordova.names.engineTorque] = opts.engineTorque;
		}
		if(opts.odometer){
			rpcRequestParams[SdlCordova.names.odometer] = opts.odometer;
		}
		if(opts.gps){
			rpcRequestParams[SdlCordova.names.gps] = opts.gps;
		}
		if(opts.fuelLevel_State){
			rpcRequestParams[SdlCordova.names.fuelLevel_State] = opts.fuelLevel_State;
		}
		if(opts.instantFuelConsumption){
			rpcRequestParams[SdlCordova.names.instantFuelConsumption] = opts.instantFuelConsumption;
		}
		if(opts.beltStatus){
			rpcRequestParams[SdlCordova.names.beltStatus] = opts.beltStatus;
		}
		if(opts.bodyInformation){
			rpcRequestParams[SdlCordova.names.bodyInformation] = opts.bodyInformation;
		}
		if(opts.deviceStatus){
			rpcRequestParams[SdlCordova.names.deviceStatus] = opts.deviceStatus;
		}
		if(opts.driverBraking){
			rpcRequestParams[SdlCordova.names.driverBraking] = opts.driverBraking;
		}
		if(opts.wiperStatus){
			rpcRequestParams[SdlCordova.names.wiperStatus] = opts.wiperStatus;
		}
		if(opts.headLampStatus){
			rpcRequestParams[SdlCordova.names.headLampStatus] = opts.headLampStatus;
		}
		if(opts.accPedalPosition){
			rpcRequestParams[SdlCordova.names.accPedalPosition] = opts.accPedalPosition;
		}
		if(opts.steeringWheelAngle){
			rpcRequestParams[SdlCordova.names.steeringWheelAngle] = opts.steeringWheelAngle;
		}
		if(opts.eCallInfo){
			rpcRequestParams[SdlCordova.names.eCallInfo] = opts.eCallInfo;
		}
		if(opts.airbagStatus){
			rpcRequestParams[SdlCordova.names.airbagStatus] = opts.airbagStatus;
		}
		if(opts.emergencyEvent){
			rpcRequestParams[SdlCordova.names.emergencyEvent] = opts.emergencyEvent;
		}
		if(opts.clusterModeStatus){
			rpcRequestParams[SdlCordova.names.clusterModeStatus] = opts.clusterModeStatus;
		}
		if(opts.myKey){
			rpcRequestParams[SdlCordova.names.myKey] = opts.myKey;
		}
		if(opts.speed){
			rpcRequestParams[SdlCordova.names.speed] = opts.speed;
		}
		
		// Build the request
		var rpcRequest = {};
		rpcRequest[SdlCordova.names.function_name] = SdlCordova.names.function_name_unsubscribeVehicleData;
		rpcRequest[SdlCordova.names.correlationID] = Number(correlationId);
		rpcRequest[SdlCordova.names.parameters] = rpcRequestParams;
		
		// Build the message
		var rpcMessage = {};
		rpcMessage[SdlCordova.names.messageTypeRequest] = rpcRequest;
		
		
		return this.sendRPCRequest(opts, rpcMessage);
	},
	
	getVehicleData: function(correlationId, opts){
		opts = this.extend(opts, SdlCordova.defaultOpts);
		
		// Build the request params
		var rpcRequestParams = {};
		
		if(opts.rpm){
			rpcRequestParams[SdlCordova.names.rpm] = opts.rpm;
		}
		if(opts.externalTemperature){
			rpcRequestParams[SdlCordova.names.externalTemperature] = opts.externalTemperature;
		}
		if(opts.fuelLevel){
			rpcRequestParams[SdlCordova.names.fuelLevel] = opts.fuelLevel;
		}
		if(opts.prndl){
			rpcRequestParams[SdlCordova.names.prndl] = opts.prndl;
		}
		if(opts.tirePressure){
			rpcRequestParams[SdlCordova.names.tirePressure] = opts.tirePressure;
		}
		if(opts.engineTorque){
			rpcRequestParams[SdlCordova.names.engineTorque] = opts.engineTorque;
		}
		if(opts.odometer){
			rpcRequestParams[SdlCordova.names.odometer] = opts.odometer;
		}
		if(opts.gps){
			rpcRequestParams[SdlCordova.names.gps] = opts.gps;
		}
		if(opts.fuelLevel_State){
			rpcRequestParams[SdlCordova.names.fuelLevel_State] = opts.fuelLevel_State;
		}
		if(opts.instantFuelConsumption){
			rpcRequestParams[SdlCordova.names.instantFuelConsumption] = opts.instantFuelConsumption;
		}
		if(opts.beltStatus){
			rpcRequestParams[SdlCordova.names.beltStatus] = opts.beltStatus;
		}
		if(opts.bodyInformation){
			rpcRequestParams[SdlCordova.names.bodyInformation] = opts.bodyInformation;
		}
		if(opts.deviceStatus){
			rpcRequestParams[SdlCordova.names.deviceStatus] = opts.deviceStatus;
		}
		if(opts.driverBraking){
			rpcRequestParams[SdlCordova.names.driverBraking] = opts.driverBraking;
		}
		if(opts.wiperStatus){
			rpcRequestParams[SdlCordova.names.wiperStatus] = opts.wiperStatus;
		}
		if(opts.headLampStatus){
			rpcRequestParams[SdlCordova.names.headLampStatus] = opts.headLampStatus;
		}
		if(opts.accPedalPosition){
			rpcRequestParams[SdlCordova.names.accPedalPosition] = opts.accPedalPosition;
		}
		if(opts.steeringWheelAngle){
			rpcRequestParams[SdlCordova.names.steeringWheelAngle] = opts.steeringWheelAngle;
		}
		if(opts.eCallInfo){
			rpcRequestParams[SdlCordova.names.eCallInfo] = opts.eCallInfo;
		}
		if(opts.airbagStatus){
			rpcRequestParams[SdlCordova.names.airbagStatus] = opts.airbagStatus;
		}
		if(opts.emergencyEvent){
			rpcRequestParams[SdlCordova.names.emergencyEvent] = opts.emergencyEvent;
		}
		if(opts.clusterModeStatus){
			rpcRequestParams[SdlCordova.names.clusterModeStatus] = opts.clusterModeStatus;
		}
		if(opts.myKey){
			rpcRequestParams[SdlCordova.names.myKey] = opts.myKey;
		}
		if(opts.speed){
			rpcRequestParams[SdlCordova.names.speed] = opts.speed;
		}
		if(opts.vin){
			rpcRequestParams[SdlCordova.names.vin] = opts.vin;
		}
		
		// Build the request
		var rpcRequest = {};
		rpcRequest[SdlCordova.names.function_name] = SdlCordova.names.function_name_getVehicleData;
		rpcRequest[SdlCordova.names.correlationID] = Number(correlationId);
		rpcRequest[SdlCordova.names.parameters] = rpcRequestParams;
		
		// Build the message
		var rpcMessage = {};
		rpcMessage[SdlCordova.names.messageTypeRequest] = rpcRequest;
		
		
		return this.sendRPCRequest(opts, rpcMessage);
	},
	
	scrollableMessage: function(correlationId, opts){
		opts = this.extend(opts, SdlCordova.defaultOpts);
		
		// Build the request params
		var rpcRequestParams = {};
		
		if(opts.scrollableMessageBody){
			rpcRequestParams[SdlCordova.names.scrollableMessageBody] = opts.scrollableMessageBody;
		}
		if(opts.timeout){
			rpcRequestParams[SdlCordova.names.timeout] = Number(opts.timeout);
		}
		if(opts.softButtons){
			rpcRequestParams[SdlCordova.names.softButtons] = this.toArray(opts.softButtons);
		}
		
		// Build the request
		var rpcRequest = {};
		rpcRequest[SdlCordova.names.function_name] = SdlCordova.names.function_name_scrollableMessage;
		rpcRequest[SdlCordova.names.correlationID] = Number(correlationId);
		rpcRequest[SdlCordova.names.parameters] = rpcRequestParams;
		
		// Build the message
		var rpcMessage = {};
		rpcMessage[SdlCordova.names.messageTypeRequest] = rpcRequest;
		
		return this.sendRPCRequest(opts, rpcMessage);
	},
	
	changeRegistration: function(correlationId, opts){
		opts = this.extend(opts, SdlCordova.defaultOpts);
		
		// Build the request params
		var rpcRequestParams = {};
		
		if(opts.language){
			rpcRequestParams[SdlCordova.names.language] = opts.language;
		}
		if(opts.hmiDisplayLanguage){
			rpcRequestParams[SdlCordova.names.hmiDisplayLanguage] = opts.hmiDisplayLanguage;
		}
		if(opts.appName){
			rpcRequestParams[SdlCordova.names.appName] = opts.appName;
		}
		if(opts.ttsName){
			rpcRequestParams[SdlCordova.names.ttsName] = this.toArray(opts.ttsName);
		}
		if(opts.ngnMediaScreenAppName){
			rpcRequestParams[SdlCordova.names.ngnMediaScreenAppName] = opts.ngnMediaScreenAppName;
		}
		if(opts.vrSynonyms){
			rpcRequestParams[SdlCordova.names.vrSynonyms] = this.toArray(opts.vrSynonyms);
		}
		
		// Build the request
		var rpcRequest = {};
		rpcRequest[SdlCordova.names.function_name] = SdlCordova.names.function_name_changeRegistration;
		rpcRequest[SdlCordova.names.correlationID] = Number(correlationId);
		rpcRequest[SdlCordova.names.parameters] = rpcRequestParams;
		
		// Build the message
		var rpcMessage = {};
		rpcMessage[SdlCordova.names.messageTypeRequest] = rpcRequest;
		
		return this.sendRPCRequest(opts, rpcMessage);
	},
	
	getDTCs: function(correlationId, opts){
		opts = this.extend(opts, SdlCordova.defaultOpts);
		
		// Build the request params
		var rpcRequestParams = {};
		
		if(opts.dtcMask){
			rpcRequestParams[SdlCordova.names.dtcMask] = Number(opts.dtcMask);
		}
		if(opts.ecuName){
			rpcRequestParams[SdlCordova.names.ecuName] = Number(opts.ecuName);
		}
		
		// Build the request
		var rpcRequest = {};
		rpcRequest[SdlCordova.names.function_name] = SdlCordova.names.function_name_getDTCs;
		rpcRequest[SdlCordova.names.correlationID] = Number(correlationId);
		rpcRequest[SdlCordova.names.parameters] = rpcRequestParams;
		
		// Build the message
		var rpcMessage = {};
		rpcMessage[SdlCordova.names.messageTypeRequest] = rpcRequest;
		
		return this.sendRPCRequest(opts, rpcMessage);
	},
	
	slider: function(correlationId, opts){
		opts = this.extend(opts, SdlCordova.defaultOpts);
		
		// Build the request params
		var rpcRequestParams = {};
		
		if(opts.numTicks){
			rpcRequestParams[SdlCordova.names.numTicks] = Number(opts.numTicks);
		}
		if(opts.sliderHeader){
			rpcRequestParams[SdlCordova.names.sliderHeader] = opts.sliderHeader;
		}
		if(opts.sliderFooter){
			rpcRequestParams[SdlCordova.names.sliderFooter] = this.toArray(opts.sliderFooter);
		}
		if(opts.position){
			rpcRequestParams[SdlCordova.names.position] = Number(opts.position);
		}
		if(opts.timeout){
			rpcRequestParams[SdlCordova.names.timeout] = Number(opts.timeout);
		}
		
		// Build the request
		var rpcRequest = {};
		rpcRequest[SdlCordova.names.function_name] = SdlCordova.names.function_name_slider;
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
	
	onEncodedSdlPDataResponse: function(f){
		this.bind(SdlCordova.names.function_name_encodedSdlPData, f);
	},

	onPerformAudioPassThruResponse: function(f){
		this.bind(SdlCordova.names.function_name_performAudioPassThru,f);
	},
	
	onEndAudioPassThruResponse: function(f){
		this.bind(SdlCordova.names.function_name_endAudioPassThru,f);
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
	
	//added
	onSubscribeVehicleDataResponse: function(f){
		this.bind(SdlCordova.names.function_name_subscribeVehicleData, f);
	},
	
	onUnsubscribeVehicleDataResponse: function(f){
		this.bind(SdlCordova.names.function_name_unsubscribeVehicleData, f);
	},
	
	onGetVehicleDataResponse: function(f){
		this.bind(SdlCordova.names.function_name_getVehicleData, f);
	},
	
	onScrollableMessageResponse: function(f){
		this.bind(SdlCordova.names.function_name_scrollableMessage, f);
	},
	
	onChangeRegistrationResponse: function(f){
		this.bind(SdlCordova.names.function_name_changeRegistration, f);
	},
	
	onGetDTCsResponse: function(f){
		this.bind(SdlCordova.names.function_name_getDTCs, f);
	},
	
	onSliderResponse: function(f){
		this.bind(SdlCordova.names.function_name_slider, f);
	},
	//end
	
	onOnButtonEvent: function(f){
		this.bind(SdlCordova.names.RPC_NOTIFICATION_onButtonEvent, f);
	},

	onOnButtonPress: function(f){
		this.bind(SdlCordova.names.RPC_NOTIFICATION_onButtonPress, f);
	},

	onOnEncodedSdlPData: function(f){
		this.bind(SdlCordova.names.RPC_NOTIFICATION_onEncodedSdlPData, f);
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
	
	//added
	onOnVehicleData: function(f){
		console.log("in onVehicleData");
		this.bind(SdlCordova.names.RPC_NOTIFICATION_onVehicleData, f);
	},
	onOnAudioPassThru: function(f){
		console.log("In onAudioPassThru");
		this.bind(SdlCordova.names.RPC_NOTIFICATION_onAudioPassThru, f);
	},
	//end add
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
},

// added 
Image: function(value, imageType){
	this[SdlCordova.names.value] = value;
	this[SdlCordova.names.imageType] = imageType;
},

SoftButton: function(isHighlighted, softButtonID, systemAction, text, softButtonType, image){
	this[SdlCordova.names.isHighlighted] = isHighlighted;
	this[SdlCordova.names.softButtonID] = softButtonID;
	this[SdlCordova.names.systemAction] = systemAction;
	this[SdlCordova.names.text] = text;
	this[SdlCordova.names.type] = softButtonType ;
	this[SdlCordova.names.image] = image;
},

VrHelpItem: function(position, text, image){
	this[SdlCordova.names.position] = position;
	this[SdlCordova.names.text] = text;
	this[SdlCordova.names.image] = image;
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
SdlCordova.names.ACTION_GET_PERSISTENT_SDL_DATA = "getPersistentSdlData";
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
SdlCordova.names.SIPHON_LOG = "siphonLog"; //added

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
	SdlCordova.names.cmdIcon = "cmdIcon"; //added
	SdlCordova.names.menuName = "menuName";
	SdlCordova.names.parentID = "parentID";
	SdlCordova.names.position = "position";
	SdlCordova.names.vrCommands = "vrCommands";
	SdlCordova.names.menuParams = "menuParams";
	
	// Image (added)
	SdlCordova.names.value = "value";
	SdlCordova.names.imageType = "imageType";
	SdlCordova.names.imagetype_static = "STATIC";
	SdlCordova.names.imagetype_dynamic = "DYNAMIC";
	
	// AddSubMenu
	SdlCordova.names.menuID = "menuID";
	//SdlCordova.names.menuName = "menuName";
	//SdlCordova.names.position = "position";
	
	// Alert
	SdlCordova.names.ttsText = "ttsText";
	SdlCordova.names.alertText1 = "alertText1";
	SdlCordova.names.alertText2 = "alertText2";
	SdlCordova.names.alertText3 = "alertText3"; //added
	SdlCordova.names.duration = "duration";
	SdlCordova.names.playTone = "playTone";
	SdlCordova.names.softButtons = "softButtons"; //added
	
	//SoftButton 
	SdlCordova.names.isHighlighted = "isHighlighted";
	SdlCordova.names.softButtonID = "softButtonID";
	SdlCordova.names.systemAction = "systemAction";
	//SdlCordova.names.text = "text";
	//SdlCordova.names.type = "type";
	SdlCordova.names.image = "image";
	
	
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
	SdlCordova.names.vrHelpTitle = "vrHelpTitle";
	SdlCordova.names.vrHelp = "vrHelp";
	
	// ResetGlobalProperties
	SdlCordova.names.properties = "properties";
	SdlCordova.names.HELP_PROMPT = "HELPPROMPT";
	SdlCordova.names.TIMEOUT_PROMPT = "TIMEOUTPROMPT";
	
	//PutFile modified
	SdlCordova.names.fileData = "fileData";
	SdlCordova.names.fileType = "fileType";
	SdlCordova.names.length = "length";
	SdlCordova.names.offset = "offset";
	SdlCordova.names.persistentFile = "persistentFile";
	SdlCordova.names.sdlFileName = "syncFileName";
	SdlCordova.names.systemFile = "systemFile";
	//SdlCordova.names.filePath = "filePath";
	
	
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
	SdlCordova.names.mainField3 = "mainField3"; //added
	SdlCordova.names.mainField4 = "mainField4"; //added
	SdlCordova.names.alignment = "alignment";
	SdlCordova.names.alignment_left = "LEFT_ALIGNED";
	SdlCordova.names.alignment_right = "RIGHT_ALIGNED";
	SdlCordova.names.alignment_center = "CENTERED";
	SdlCordova.names.statusBar = "statusBar";
	SdlCordova.names.mediaClock = "mediaClock";
	SdlCordova.names.mediaTrack = "mediaTrack";
	SdlCordova.names.graphic = "graphic";
	SdlCordova.names.customPresets = "customPresets";
	
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
	SdlCordova.names.function_name_endAudioPassThru = "EndAudioPassThru";
	SdlCordova.names.function_name_performInteraction = "PerformInteraction";	
	SdlCordova.names.function_name_registerAppInterface = "RegisterAppInterface";
	SdlCordova.names.function_name_unregisterAppInterface = "UnregisterAppInterface";
	SdlCordova.names.function_name_dialNumber = "DialNumber";
	SdlCordova.names.function_name_encodedSdlPData = "EncodedSdlPData";
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
	SdlCordova.names.function_name_scrollableMessage = "ScrollableMessage";
	SdlCordova.names.function_name_changeRegistration = "ChangeRegistration";
	SdlCordova.names.function_name_slider = "Slider";
	
	// Notifications
	SdlCordova.names.RPC_NOTIFICATION_onCommand = "OnCommand";
	SdlCordova.names.RPC_NOTIFICATION_onDataPublished = "OnDataPublished";
	SdlCordova.names.RPC_NOTIFICATION_onButtonPress = "OnButtonPress";
	SdlCordova.names.RPC_NOTIFICATION_onButtonEvent = "OnButtonEvent";
	SdlCordova.names.RPC_NOTIFICATION_onHMIStatus = "OnHMIStatus";
	SdlCordova.names.RPC_NOTIFICATION_onTBTClientState = "OnTBTClientState";
	SdlCordova.names.RPC_NOTIFICATION_onEncodedSdlPData = "OnEncodedSdlPData";
	SdlCordova.names.RPC_NOTIFICATION_onDriverDistraction = "OnDriverDistraction";
	SdlCordova.names.RPC_NOTIFICATION_onAppInterfaceUnregistered = "OnAppInterfaceUnregistered";	
	SdlCordova.names.RPC_NOTIFICATION_onVehicleData = "OnVehicleData";
	SdlCordova.names.RPC_NOTIFICATION_onAudioPassThru = "OnAudioPassThru";
	
	// Proxy Events
	SdlCordova.names.PROXY_EVENT_OnProxyClosed = "OnProxyClosed";
	SdlCordova.names.PROXY_EVENT_OnError = "OnError";
	SdlCordova.names.PROXY_EVENT_OnFirstAccess = "OnFirstAccess";

	//Streaming States
	SdlCordova.names.AUDIO_STREAMING_STATE_AUDIBLE = "AUDIBLE";
	SdlCordova.names.AUDIO_STREAMING_STATE_NOT_AUDIBLE = "NOT_AUDIBLE";
	
	//System action (added)
	SdlCordova.names.action_DEFAULT_ACTION = "DEFAULT_ACTION";
	SdlCordova.names.action_STEAL_FOCUS = "STEAL_FOCUS";
	SdlCordova.names.action_KEEP_CONTEXT = "KEEP_CONTEXT";
	
	//SoftButton Type (added)
	SdlCordova.names.softButtonType_TEXT = "TEXT";
	SdlCordova.names.softButtonType_IMAGE = "IMAGE";
	SdlCordova.names.softButtonType_BOTH = "BOTH";
	
	//PerformAudioPassThru (added)
	SdlCordova.names.maxDuration = "maxDuration";
	SdlCordova.names.audioPassThruDisplayText1 = "audioPassThruDisplayText1";
	SdlCordova.names.audioPassThruDisplayText2 = "audioPassThruDisplayText2";
	SdlCordova.names.muteAudio = "muteAudio";
	SdlCordova.names.samplingRate = "samplingRate";
	SdlCordova.names.audioType = "audioType";
	SdlCordova.names.initialPrompt = "initialPrompt";
	SdlCordova.names.bitsPerSample = "bitsPerSample";
	
	//SubscribeVehicleData (added)
	SdlCordova.names.rpm = "rpm";
	SdlCordova.names.externalTemperature = "externalTemperature";
	SdlCordova.names.fuelLevel = "fuelLevel";
	SdlCordova.names.prndl = "prndl";
	SdlCordova.names.tirePressure = "tirePressure";
	SdlCordova.names.engineTorque = "engineTorque";
	SdlCordova.names.odometer = "odometer";
	SdlCordova.names.gps = "gps";
	SdlCordova.names.fuelLevel_State = "fuelLevel_State";
	SdlCordova.names.instantFuelConsumption = "instantFuelConsumption";
	SdlCordova.names.beltStatus = "beltStatus";
	SdlCordova.names.bodyInformation = "bodyInformation";
	SdlCordova.names.deviceStatus = "deviceStatus";
	SdlCordova.names.driverBraking = "driverBraking";
	SdlCordova.names.wiperStatus = "wiperStatus";
	SdlCordova.names.headLampStatus = "headLampStatus";
	SdlCordova.names.accPedalPosition = "accPedalPosition";
	SdlCordova.names.steeringWheelAngle = "steeringWheelAngle";
	SdlCordova.names.eCallInfo = "eCallInfo";
	SdlCordova.names.airbagStatus = "airbagStatus";
	SdlCordova.names.emergencyEvent = "emergencyEvent";
	SdlCordova.names.clusterModeStatus = "clusterModeStatus";
	SdlCordova.names.myKey = "myKey";
	SdlCordova.names.speed = "speed";
	
	//GetVehicleData
	SdlCordova.names.vin = "vin";
	
	//ScrollableMessage (added)
	SdlCordova.names.scrollableMessageBody = "scrollableMessageBody";
	
	//ChangeRegistration (added)
	SdlCordova.names.language = "language";
    SdlCordova.names.hmiDisplayLanguage = "hmiDisplayLanguage";
    SdlCordova.names.appName = "appName";
    SdlCordova.names.ttsName = "ttsName";
    SdlCordova.names.ngnMediaScreenAppName = "ngnMediaScreenAppName";
    SdlCordova.names.vrSynonyms = "vrSynonyms";
	
	//SetDisplayLayout (added)
	SdlCordova.names.displayLayout = "displayLayout";
	
	//GetDTCs (added)
	SdlCordova.names.dtcMask = "dtcMask";
	SdlCordova.names.ecuName = "ecuName";
	
	//Slider (added)
	SdlCordova.names.numTicks = "numTicks";
	SdlCordova.names.sliderHeader = "sliderHeader";
	SdlCordova.names.sliderFooter = "sliderFooter";
	//SdlCordova.names.position = "position";
	//SdlCordova.names.timeout = "timeout";
	
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

//added
SdlCordova.defaultOptsLogMessage = {
	success: function(){}, 
	error: function(e){
		//do not log! would cause an infinite loop!
	},
	message: ""
};
//

// Show
var showDefaultParams = {};
showDefaultParams[SdlCordova.names.alignment] = SdlCordova.names.alignment_left;


module.exports = SdlCordova;