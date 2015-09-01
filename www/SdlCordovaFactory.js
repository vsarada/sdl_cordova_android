var factory = module.exports;

function RPCBase(){
	this.success = function(){};
	this.fail = function(){};
	this.correlationId = null;
	this.functionName = null;
	
	this.setSuccess = function(f){
		this.success = f;
	};
	
	this.setError = function(f){
		this.fail = f;
	};
	
	this.setCorrelationId = function(id){
		this.correlationId = id;
	};
	
	this.getSuccess = function(){
		return this.success;
	};
	
	this.getError = function(){
		return this.fail;
	};
	
	this.getCorrelationId = function(){
		return this.correlationId;
	};
	
	this.sendRequest = function(){
		SdlCordova[this.functionName](this.correlationId, this);
	};
}
factory.RPCBase = RPCBase;

function AddCommand(){
	RPCBase.call(this);
	
	this.functionName = "addCommand";
	this.cmdID = null;
	this.cmdIcon = null; //added
	this.menuName = null;
	this.parentID = null;
	this.position = null;
	//this.vrCommands = [];
	this.vrCommands = null;
	
	this.setCmdId = function(id){
		this.cmdID = id;
	};
	
	this.setMenuName = function(name){
		this.menuName = name;
		
		/*if(this.vrCommands.length == 0){
			this.vrCommands.push(name);
		}*/
		if(this.vrCommands == null)
			this.vrCommands = SdlCordova.toArray(name);
	};
	
	this.setParentMenuId = function(id){
		this.parentID = id;
	};
	
	this.setPosition = function(index){
		this.position = index;
	};
	
	this.setVrCommands = function(arr){
		//this.vrCommands = arr;
		this.vrCommands = arr ? SdlCordova.toArray(arr) : null;
	};
	
	//added
	this.setCmdIcon = function(cmdIcon){
		this.cmdIcon = cmdIcon;
	};
	
	this.addVrCommand = function(cmd){
		//this.vrCommands.push(cmd);
		if(!(this.vrCommands instanceof Array)){
			this.vrCommands = [cmd];
		}else{
			this.vrCommands.push(cmd);
		}
	};
	
	this.getCmdId = function(){
		return this.cmdID;
	};
	
	this.getMenuName = function(){
		return this.menuName;
	};
	
	this.getParentMenuId = function(){
		return this.parentID;
	};
	
	this.getPosition = function(){
		return this.position;
	};
	
	this.getVrCommands = function(){
		return this.vrCommands;
	};
	
	//added
	this.getCmdIcon = function(){
		return this.cmdIcon;
	};
}
AddCommand.prototype = Object.create(RPCBase.prototype);
factory.AddCommand = AddCommand;

function AddSubMenu(){
	RPCBase.call(this);
	
	this.functionName = "addSubMenu";
	this.menuID = null;	
	this.menuName = null;
	this.position = null;
	this.parentID = null;
	
	this.setMenuId = function(id){
		this.menuID = id;
	};
	
	this.setMenuName = function(name){
		this.menuName = name;
	};
	
	this.setPosition = function(index){
		this.position = index;
	};
	
	this.setParentId = function(id){
		this.parentID = id;
	};
	
	this.getMenuId = function(){
		return this.menuID;
	};
	
	this.getMenuName = function(){
		return this.menuName;
	};
	
	this.getPosition = function(){
		return this.position;
	};
	
	this.getParentId = function(){
		return this.parentID;
	};
}
AddSubMenu.prototype = Object.create(RPCBase.prototype);
factory.AddSubMenu = AddSubMenu;

function Alert(){
	RPCBase.call(this);
	
	this.functionName = "alert";
	//this.ttsChunks = [];
	this.ttsChunks = null;
	this.alertText1 = null;
	this.alertText2 = null;
	this.alertText3 = null; //added
	this.playTone = true;
	this.duration = null;
	this.softButtons = null; //added
	
	this.setTTSText = function(text){
		this.ttsChunks = [new SdlCordova.TTSChunk(SdlCordova.names.speechCapabilities_TEXT, text)];
	};
	
	this.setTTSChunks = function(ttsChunkArray){
		//this.ttsChunks = ttsChunkArray;
		this.ttsChunks = ttsChunkArray ? SdlCordova.toArray(ttsChunkArray) : null;
	};
	
	this.addTTSChunk = function(chunk){
		//this.ttsChunks.push(chunk);
		if(this.ttsChunks == null){
			this.ttsChunks = [chunk];
		}else{
			this.ttsChunks.push(chunk);
		}		
	};
	
	// modified
	this.setAlertText = function(line1, line2, line3){
		this.alertText1 = line1;
		this.alertText2 = line2;
		this.alertText3 = line3;
	};
	
	this.setPlayTone = function(playTone){
		this.playTone = playTone;
	};
	
	this.setDuration = function(milliseconds){
		this.duration = milliseconds;
	};
	
	// added
	this.setSoftButtons = function(softButtonArray){
		this.softButtons = softButtonArray ? SdlCordova.toArray(softButtonArray) : null;
	};
	
	this.addSoftButton = function(button){
		if(this.softButtons == null)
			this.softButtons = [button];
		else
			this.softButtons.push(button);
	};
	
	this.getTTSChunks = function(){
		return this.ttsChunks;
	};
	
	// modified
	this.getAlertText = function(){
		return {line1: this.alertText1, line2: this.alertText2, line3: this.alertText3};
	};
	
	this.getPlayTone = function(){
		return this.playTone;
	};
	
	this.getDuration = function(){
		return this.duration;
	};
	
	// added
	this.getSoftButtons = function(){
		return this.softButtons;
	};
}
Alert.prototype = Object.create(RPCBase.prototype);
factory.Alert = Alert;

function CreateInteractionChoiceSet(){
	RPCBase.call(this);	
	
	this.functionName = "createInteractionChoiceSet";
	this.interactionChoiceSetID = null;
	//this.choiceSet = [];
	this.choiceSet = null;
	
	this.setInteractionChoiceSetId = function(id){
		this.interactionChoiceSetID = id;
	};
	
	this.setChoiceSet = function(choiceSet){
		//this.choiceSet = choiceSet;
		this.choiceSet = choiceSet ? SdlCordova.toArray(choiceSet) : null;
	};
	
	//this.addChoice = function(choice, id, vrCommands){
	this.addChoice = function(choice){
		/*if(choice instanceof SdlCordova.Choice){
			this.choiceSet.push(choice);
		}else{
			this.choiceSet.push(new SdlCordova.Choice(id, choice, SdlCordova.toArray(vrCommands)));
		}*/
		if(!(this.choiceSet instanceof Array)){
			this.choiceSet = [choice];
		}else{
			this.choiceSet.push(choice);
		}		
	};
	
	this.getInteractionChoiceSetId = function(){
		return this.interactionChoiceSetID;
	};
	
	this.getChoiceSet = function(){
		return this.choiceSet;
	};
}
CreateInteractionChoiceSet.prototype = Object.create(RPCBase.prototype);
factory.CreateInteractionChoiceSet = CreateInteractionChoiceSet;

function DeleteCommand(){
	RPCBase.call(this);
	
	this.functionName = "deleteCommand";
	this.cmdID = null;
	
	this.setCmdId = function(id){
		this.cmdID = id;
	};
	
	this.getCmdId = function(id){
		return this.cmdID;
	};
}
DeleteCommand.prototype = Object.create(RPCBase.prototype);
factory.DeleteCommand = DeleteCommand;

function DeleteInteractionChoiceSet(){
	RPCBase.call(this);
	
	this.functionName = "deleteInteractionChoiceSet";
	this.interactionChoiceSetID = null;
	
	this.setInteractionChoiceSetId = function(id){
		this.interactionChoiceSetID = id;
	};
	
	this.getInteractionChoiceSetId = function(id){
		return this.interactionChoiceSetID;
	};
}
DeleteInteractionChoiceSet.prototype = Object.create(RPCBase.prototype);
factory.DeleteInteractionChoiceSet = DeleteInteractionChoiceSet;

function DeleteSubMenu(){
	RPCBase.call(this);
	
	this.functionName = "deleteSubMenu";
	this.menuID = null;
	
	this.setMenuId = function(id){
		this.menuID = id;
	};
	
	this.getMenuId = function(id){
		return this.menuID;
	};
}
DeleteSubMenu.prototype = Object.create(RPCBase.prototype);
factory.DeleteSubMenu = DeleteSubMenu;

function PerformInteraction(){
	RPCBase.call(this);
	
	this.functionName = "performInteraction";
	/*this.initialTTSChunks = [];
	this.helpPromptTTSChunks = [];
	this.timeoutPromptTTSChunks = [];*/
	this.initialTTSChunks = null;
	this.helpPromptTTSChunks = null;
	this.timeoutPromptTTSChunks = null;
	this.interactionMode = null;
	this.timeout = null;
	this.initialText = null;
	//this.interactionChoiceSetIDList = [];
	this.interactionChoiceSetIDList = null;
	
	this.setTTSText = function(ttsText, type){
		type = type ? type.toUpperCase() : SdlCordova.names.speechCapabilities_TEXT;
		if(!isValidTTSChunkType(type))
			type = SdlCordova.names.speechCapabilities_TEXT;
		this.initialTTSChunks = [new SdlCordova.TTSChunk(type, ttsText)];
	};
	
	this.setTTSChunks = function(chunks){
		//this.initialTTSChunks = SdlCordova.toArray(chunks);		
		this.initialTTSChunks = chunks ? SdlCordova.toArray(chunks) : null;		
	};
	
	this.addTTSChunk = function(chunk){
		//if(chunk instanceof TTSChunk)
		//	this.initialTTSChunks.push(chunk);
		if(!(this.initialTTSChunks instanceof Array)){
			this.initialTTSChunks = [chunk];
		}else{
			this.initialTTSChunks.push(chunk);
		}	
	};
	
	this.setHelpPromptTTSText = function(ttsText, type){
		type = type ? type.toUpperCase() : SdlCordova.names.speechCapabilities_TEXT;
		if(!isValidTTSChunkType(type))
			type = SdlCordova.names.speechCapabilities_TEXT;
		this.helpPromptTTSChunks = [new SdlCordova.TTSChunk(type, ttsText)];
	};
	
	this.setHelpPromptTTSChunks = function(chunks){
		//this.helpPromptTTSChunks = SdlCordova.toArray(chunks);	
		this.helpPromptTTSChunks = chunks ? SdlCordova.toArray(chunks) : null;	
	};
	
	this.addHelpPromptTTSChunk = function(chunk){
		/*if(chunk instanceof TTSChunk)
			this.helpPromptTTSChunks.push(chunk);*/
		if(!(this.helpPromptTTSChunks instanceof Array)){
			this.helpPromptTTSChunks = [chunk];
		}else{
			this.helpPromptTTSChunks.push(chunk);
		}
	};
	
	this.setTimeoutPromptTTSText = function(ttsText, type){
		type = type ? type.toUpperCase() : SdlCordova.names.speechCapabilities_TEXT;
		if(!isValidTTSChunkType(type))
			type = SdlCordova.names.speechCapabilities_TEXT;
		this.timeoutPromptTTSChunks = [new SdlCordova.TTSChunk(type, ttsText)];
	};
	
	this.setTimeoutPromptTTSChunks = function(chunks){
		//this.timeoutPromptTTSChunks = SdlCordova.toArray(chunks);
		this.timeoutPromptTTSChunks = chunks ? SdlCordova.toArray(chunks) : null;	
	};
	
	this.addTimeoutPromptTTSChunk = function(chunk){
		/*if(chunk instanceof TTSChunk)
			this.timeoutPromptTTSChunks.push(chunk);*/
		if(!(this.timeoutPromptTTSChunks instanceof Array)){
			this.timeoutPromptTTSChunks = [chunk];
		}else{
			this.timeoutPromptTTSChunks.push(chunk);
		}
	};
	
	this.setInteractionMode = function(mode){
		mode = mode.toUpperCase();
		switch(mode){
		case SdlCordova.names.interactionMode_MANUAL_ONLY:
		case SdlCordova.names.interactionMode_VR_ONLY:
		case SdlCordova.names.interactionMode_BOTH:
			break;
		case "MANUAL":
			mode = SdlCordova.names.interactionMode_MANUAL_ONLY;
			break;
		case "VR":
			mode = SdlCordova.names.interactionMode_VR_ONLY;
			break;
		case "BOTH":
		case undefined:
		case null:
			mode = SdlCordova.names.interactionMode_BOTH;
			break;
		}
		this.interactionMode = mode;
	};
	
	this.setTimeout = function(timeout){
		if(Number(timeout))
			this.timeout = timeout;
	};
	
	this.setInitialText = function(text){
		this.initialText = text;
	};
	
	this.setInteractionChoiceSetIDList = function(idArray){
		//this.interactionChoiceSetIDList = SdlCordova.toArray(idArray);
		this.interactionChoiceSetIDList = idArray ? SdlCordova.toArray(idArray) : null;
	};
	
	this.getInitialTTSChunks = function(){
		return this.initialTTSChunks;
	};
	this.getHelpPromptTTSChunks = function(){
		return this.helpPromptTTSChunks;
	};
	this.getTimeoutPromptTTSChunks = function(){
		return this.timeoutPromptTTSChunks;
	};
	this.getInteractionMode = function(){
		return this.interactionMod;
	};
	this.getTimeout = function(){
		return this.timeout;
	};
	this.getInitialText = function(){
		return this.initialText;
	};
	this.getInteractionChoiceSetIDList = function(){
		return this.interactionChoiceSetIDList;
	};
}
PerformInteraction.prototype = Object.create(RPCBase.prototype);
factory.PerformInteraction = PerformInteraction;

function ResetGlobalProperties(){
	RPCBase.call(this);
	
	this.functionName = "resetGlobalProperties";
	//this.properties = [SdlCordova.names.HELP_PROMPT, SdlCordova.names.TIMEOUT_PROMPT];
	this.properties = null;
	
	this.setProperties = function(props){
		//this.properties = SdlCordova.toArray(props);
		this.properties = props ? SdlCordova.toArray(props) : null;
	};
	
	this.addProperty = function(prop){
		/*prop = prop.toUpperCase();
		if(prop == SdlCordova.names.HELP_PROMPT || SdlCordova.names.TIMEOUT_PROMPT){
			if(this.properties.indexOf(prop) == -1)
				this.properties.push(prop);
		}*/
		if(!(this.properties instanceof Array)){
			this.properties = [prop];
		}else if(this.properties.indexOf(prop) == -1){
			this.properties.push(prop);
		}
	};
	
	this.getProperties = function(){
		return this.properties;
	};

}
ResetGlobalProperties.prototype = Object.create(RPCBase.prototype);
factory.ResetGlobalProperties = ResetGlobalProperties;

function SetGlobalProperties(){
	RPCBase.call(this);
	
	this.functionName = "setGlobalProperties";
	/*this.helpPromptTTSChunks = [];
	this.timeoutPromptTTSText = [];*/
	this.helpPromptTTSChunks = null;
	this.timeoutPromptTTSChunks = null;
	this.vrHelpTitle = null; //added
	this.vrHelp = null; //added
	
	this.setHelpPromptTTSText = function(ttsText, type){
		type = type ? type.toUpperCase() : SdlCordova.names.speechCapabilities_TEXT;
		if(!isValidTTSChunkType(type))
			type = SdlCordova.names.speechCapabilities_TEXT;
		this.helpPromptTTSChunks = [new SdlCordova.TTSChunk(type, ttsText)];
	};
	
	this.setHelpPromptTTSChunks = function(chunks){
		//this.helpPromptTTSChunks = SdlCordova.toArray(chunks);		
		this.helpPromptTTSChunks = chunks ? SdlCordova.toArray(chunks) : null;
	};
	
	this.addHelpPromptTTSChunk = function(chunk){
		/*if(chunk instanceof TTSChunk)
			this.helpPromptTTSChunks.push(chunk);*/
		if(!(this.helpPromptTTSChunks instanceof Array)){
			this.helpPromptTTSChunks = [chunk];
		}else{
			this.helpPromptTTSChunks.push(chunk);
		}
	};
	
	this.setTimeoutPromptTTSText = function(ttsText, type){
		type = type ? type.toUpperCase() : SdlCordova.names.speechCapabilities_TEXT;
		if(!isValidTTSChunkType(type))
			type = SdlCordova.names.speechCapabilities_TEXT;
		this.timeoutPromptTTSChunks = [new SdlCordova.TTSChunk(type, ttsText)];
	};
	
	this.setTimeoutPromptTTSChunks = function(chunks){
		//this.timeoutPromptTTSChunks = SdlCordova.toArray(chunks);		
		this.timeoutPromptTTSChunks = chunks ? SdlCordova.toArray(chunks) : null;	
	};
	
	this.addTimeoutPromptTTSChunk = function(chunk){
		/*if(chunk instanceof TTSChunk)
			this.timeoutPromptTTSChunks.push(chunk);*/
		if(!(this.timeoutPromptTTSChunks instanceof Array)){
			this.timeoutPromptTTSChunks = [chunk];
		}else{
			this.timeoutPromptTTSChunks.push(chunk);
		}
	};
	
	// added
	this.setVrHelp = function(vrHelpArray){
		this.vrHelp = vrHelpArray ? SdlCordova.toArray(vrHelpArray) : null;	
	};
	
	this.addVrHelp = function(vrHelp){
		if(this.vrHelp == null)
			this.vrHelp = [vrHelp];
		else
			this.vrHelp.push(vrHelp);
	};
	
	this.setVrHelpTitle = function(vrHelpTitle){
		this.vrHelpTitle = vrHelpTitle;
	};
	
	this.getVrHelpTitle = function(){
		return this.vrHelpTitle;
	};
	
	this.getVrHelp = function(){
		return this.vrHelp;
	};
}
SetGlobalProperties.prototype = Object.create(RPCBase.prototype);
factory.SetGlobalProperties = SetGlobalProperties;

function SetMediaClockTimer(){
	RPCBase.call(this);
	
	this.functionName = "setMediaClockTimer";
	this.hours = null;
	this.minutes = null;
	this.seconds = null;
	this.updateMode = null;
	
	this.setTime = function(h, m, s){
		this.setHours(h);
		this.setMinutes(m);
		this.setSeconds(s);
	};
	
	this.setHours = function(h){
		if(Number(h))
			this.hours = h;
	};
	
	this.setMinutes = function(m){
		if(Number(m))
			this.minutes = m;
	};
	
	this.setSeconds = function(s){
		if(Number(s))
			this.seconds = s;
	};
	
	this.setUpdateMode = function(mode){
		mode = mode.toUpperCase();
		
		switch(mode){
		case SdlCordova.names.updateMode_COUNTUP:
		case SdlCordova.names.updateMode_COUNTDOWN:
		case SdlCordova.names.updateMode_PAUSE:
		case SdlCordova.names.updateMode_RESUME:
			this.updateMode = mode;
			break;
		}
	};
	
	this.getHours = function(){
		return this.hours;
	};
	this.getMinutes = function(){
		return this.minutes;
	};
	this.getSeconds = function(){
		return this.seconds;
	};
	this.getUpdateMode = function(){
		return this.updateMode;
	};
}
SetMediaClockTimer.prototype = Object.create(RPCBase.prototype);
factory.SetMediaClockTimer = SetMediaClockTimer;

function Show(){
	RPCBase.call(this);
	
	this.functionName = "show";
	this.mainField1 = null;
	this.mainField2 = null;
	this.mainField3 = null; //added
	this.mainField4 = null; //added
	this.alignment = null;
	this.statusBar = null;
	this.mediaClock = null;
	this.mediaTrack = null;
	this.softButtons = null; //added
	this.graphic = null; //added
	this.customPresets = null; //added
	
	// modified
	this.setDisplayText = function(line1, line2, line3, line4){
		if(line1 == "" || line1){
			this.mainField1 = line1;
		}
		
		if(line2 == "" || line2){
			this.mainField2 = line2;
		}
		
		if(line3 == "" || line3){
			this.mainField3 = line3;
		}
		
		if(line4 == "" || line4){
			this.mainField4 = line4;
		}
	};
	
	this.setTextAlignment = function(align){
		align = align.toUpperCase();
		switch(align){
		case SdlCordova.names.alignment_left:
		case SdlCordova.names.alignment_right:
		case SdlCordova.names.alignment_center:
			this.alignment = align;
			break;
		case "LEFT":
			this.alignment = SdlCordova.names.alignment_left;
			break;
		case "RIGHT":
			this.alignment = SdlCordova.names.alignment_right;
			break;
		case "CENTER":
			this.alignment = SdlCordova.names.alignment_center;
			break;
		}
	};
	
	this.setStatusBar = function(s){
		this.statusBar = s;
	};
	
	this.setMediaClock = function(h, m, s){
		if(Number(h) && Number(m)){
			this.mediaClock = (h < 9 ? " " + h : h) + ":" + (m < 9 ? "0" + m : m);
		}else if(Number(m) && Number(s)){
			this.mediaClock = (m < 9 ? " " + m : m) + ":" + (s < 9 ? "0" + s : s);
		}
	};
	
	// added
	this.setSoftButtons = function(softButtonArray){
		this.softButtons = softButtonArray ? SdlCordova.toArray(softButtonArray) : null;
	};
	
	this.addSoftButton = function(button){
		if(this.softButtons == null)
			this.softButtons = [button];
		else
			this.softButtons.push(button);
	};
	
	this.setGraphic = function(graphic){
		this.graphic = graphic;
	};
	
	this.setCustomPresets = function(customPresetArray){
		this.customPresets = customPresetArray ? SdlCordova.toArray(customPresetArray) : null;
	};
	
	this.addCustomPreset = function(preset){
		if(this.customPresets == null)
			this.customPresets = [preset];
		else
			this.customPresets.push(preset);
	};

	this.getDisplayLine1 = function(){
		return this.mainField1;
	};
	this.getDisplayLine2 = function(){
		return this.mainField2;
	};
	//added
	this.getDisplayLine3 = function(){
		return this.mainField3;
	};
	this.getDisplayLine3 = function(){
		return this.mainField4;
	};
	this.getTextAlignment = function(){
		return this.textAlignment;
	};
	this.getMediaClock = function(){
		return this.mediaClock;
	};
	this.getMediaTrack = function(){
		return this.mediaTrack;
	};	
	
	// added
	this.getSoftButtons = function(){
		return this.softButtons;
	};
	
	this.getGraphic = function(){
		return this.graphic;
	};
	
	this.getCustomPresets = function(){
		return this.customPresets;
	};
}
Show.prototype = Object.create(RPCBase.prototype);
factory.Show = Show;

function Speak(){
	RPCBase.call(this);	
	
	this.functionName = "speakText";
	this.ttsText = null;
	
	this.setTTSText = function(tts){
		this.ttsText = tts;
	};
	
	this.getTTSText = function(){
		return this.ttsText;
	};	
}
Speak.prototype = Object.create(RPCBase.prototype);
factory.Speak = Speak;

function SubscribeButton(){
	RPCBase.call(this);
	
	this.functionName = "subscribeButton";
	this.buttonName = null;
	
	this.setButtonName = function(btn){
		btn = btn.toUpperCase();
		if(isValidButtonName(btn))
			this.buttonName = btn;
	};
	
	this.getButtonName = function(){
		return this.buttonName;
	};
}
SubscribeButton.prototype = Object.create(RPCBase.prototype);
factory.SubscribeButton = SubscribeButton;

function UnsubscribeButton(){
	RPCBase.call(this);
	
	this.functionName = "unsubscribeButton";
	this.buttonName = null;
	
	this.setButtonName = function(btn){
		btn = btn.toUpperCase();
		if(isValidButtonName(btn))
			this.buttonName = btn;
	};
	
	this.getButtonName = function(){
		return this.buttonName;
	};
}
UnsubscribeButton.prototype = Object.create(RPCBase.prototype);
factory.UnsubscribeButton = UnsubscribeButton;

//added
function PutFile(){
	RPCBase.call(this);
	
	this.functionName = "putFile";
	this.fileData = null;
	this.fileType = null;
	this.length = null;
	this.offset = null;
	this.persistentFile = null;
	this.sdlFileName = null;
	this.systemFile = null;
	
	this.setFileData = function(fileData){
		this.fileData = fileData;
	};
	
	this.setFileType = function(fileType){
		this.fileType = fileType;
	};
	
	this.setLength = function(length){
		this.length = length;
	};
	
	this.setOffset = function(offset){
		this.offset = offset;
	};
	
	this.setPersistentFile = function(persistentFile){
		this.persistentFile = persistentFile;
	};
	
	this.setSdlFileName = function(sdlFileName){
		this.sdlFileName = sdlFileName;
	};
	
	this.setSystemFile = function(systemFile){
		this.systemFile = systemFile;
	};
	
	this.getFileData = function(){
		return this.fileData;
	};
	
	this.getFileType = function(){
		return this.fileType;
	};
	
	this.getLength = function(){
		return this.length;
	};
	
	this.getOffset = function(){
		return this.offset;
	};
	
	this.getPersistentFile = function(){
		return this.persistentFile;
	};
	
	this.getSdlFileName = function(){
		return this.sdlFileName;
	};
	
	this.getSystemFile = function(){
		return this.systemFile;
	};
}
PutFile.prototype = Object.create(RPCBase.prototype);
factory.PutFile = PutFile;

function DeleteFile(){
	RPCBase.call(this);
	
	this.functionName = "deleteFile";
	this.sdlFileName = null;
	
	this.setSdlFileName = function(sdlFileName){
		this.sdlFileName = sdlFileName;
	};
	
	this.getSdlFileName = function(){
		return this.sdlFileName;
	};
}
DeleteFile.prototype = Object.create(RPCBase.prototype);
factory.DeleteFile = DeleteFile;

function ListFiles(){
	RPCBase.call(this);
	
	this.functionName = "listFiles";
}
ListFiles.prototype = Object.create(RPCBase.prototype);
factory.ListFiles = ListFiles;

function PerformAudioPassThru(){
	RPCBase.call(this);
	
	this.functionName = "performAudioPassThru";
	this.maxDuration = null;
	this.audioPassThruDisplayText1 = null;
	this.audioPassThruDisplayText2 = null;
    this.muteAudio = null;
    this.samplingRate = null;
    this.audioType = null;
    this.initialPrompt = null;
    this.bitsPerSample = null;
	
	this.setMaxDuration = function(maxDuration){
		this.maxDuration = maxDuration;
	};
	
	this.setAudioPassThruDisplayText = function(text1, text2){
		this.audioPassThruDisplayText1 = text1;
		this.audioPassThruDisplayText2 = text2;
	};
	
	this.setMuteAudio = function(muteAudio){
		this.muteAudio = muteAudio;
	};
	
	this.setSamplingRate = function(samplingRate){
		this.samplingRate = samplingRate;
	};
	
	this.setAudioType = function(audioType){
		this.audioType = audioType;
	};
	
	this.setInitialText = function(text){
		this.initialPrompt = [new SdlCordova.TTSChunk(SdlCordova.names.speechCapabilities_TEXT, text)];
	};
	
	this.setInitialPrompt = function(ttsChunkArray){
		this.initialPrompt = ttsChunkArray ? SdlCordova.toArray(ttsChunkArray) : null;
	};
	
	this.addInitialPrompt = function(chunk){
		if(this.initialPrompt == null)
			this.initialPrompt = [chunk];
		else
			this.initialPrompt.push(chunk);
	};
	
	this.setBitsPerSample = function(bitsPerSample){
		this.bitsPerSample = bitsPerSample;
	};
	
	this.getMaxDuration = function(){
		return this.maxDuration;
	};
	
	this.getAudioPassThruDisplayText1 = function(){
		return this.audioPassThruDisplayText1;
	};
	
	this.getAudioPassThruDisplayText2 = function(){
		return this.audioPassThruDisplayText2;
	};
	
	this.getMuteAudio = function(){
		return this.muteAudio;
	};
	
	this.getSamplingRate = function(){
		return this.samplingRate;
	};
	
	this.getAudioType = function(){
		return this.audioType;
	};
	
	this.getInitialPrompt = function(){
		return this.initialPrompt;
	};
	
	this.getBitsPerSample = function(){
		return this.bitsPerSample;
	};
}
PerformAudioPassThru.prototype = Object.create(RPCBase.prototype);
factory.PerformAudioPassThru = PerformAudioPassThru;

function EndAudioPassThru(){
	RPCBase.call(this);
	
	this.functionName = "endAudioPassThru";
}
EndAudioPassThru.prototype = Object.create(RPCBase.prototype);
factory.EndAudioPassThru = EndAudioPassThru;

function SubscribeVehicleData(){
	RPCBase.call(this);
	
	this.functionName = "subscribeVehicleData";
	this.rpm = null;
	this.externalTemperature = null;
	this.fuelLevel = null;
	this.prndl = null;
	this.tirePressure = null;
	this.engineTorque = null;
	this.odometer = null;
	this.gps = null;
	this.fuelLevel_State = null;
	this.instantFuelConsumption = null;
	this.beltStatus = null;
	this.bodyInformation = null;
	this.deviceStatus = null;
	this.driverBraking = null;
	this.wiperStatus = null;
	this.headLampStatus = null;
	this.accPedalPosition = null;
	this.steeringWheelAngle = null;
	this.eCallInfo = null;
	this.airbagStatus = null;
	this.emergencyEvent = null;
	this.clusterModeStatus = null;
	this.myKey = null;
	this.speed = null;
	
	this.setRpm = function(rpm){
		this.rpm = rpm;
	};
	
	this.setExternalTemperature = function(externalTemperature){
		this.externalTemperature = externalTemperature;
	};
	
	this.setFuelLevel = function(fuelLevel){
		this.fuelLevel = fuelLevel;
	};
	
	this.setPrndl = function(prndl){
		this.prndl = prndl;
	};
	
	this.setTirePressure = function(tirePressure){
		this.tirePressure = tirePressure;
	};
	
	this.setEngineTorque = function(engineTorque){
		this.engineTorque = engineTorque;
	};
	
	this.setOdometer = function(odometer){
		this.odometer = odometer;
	};
	
	this.setGps = function(gps){
		this.gps = gps;
	};
	
	this.setFuelLevel_State = function(fuelLevel_State){
		this.fuelLevel_State = fuelLevel_State;
	};
	
	this.setInstantFuelConsumption = function(instantFuelConsumption){
		this.instantFuelConsumption = instantFuelConsumption;
	};
	
	this.setBeltStatus = function(beltStatus){
		this.beltStatus = beltStatus;
	};
	
	this.setBodyInformation = function(bodyInformation){
		this.bodyInformation = bodyInformation;
	};
	
	this.setDeviceStatus = function(deviceStatus){
		this.deviceStatus = deviceStatus;
	};
	
	this.setDriverBraking = function(driverBraking){
		this.driverBraking = driverBraking;
	};
	
	this.setWiperStatus = function(wiperStatus){
		this.wiperStatus = wiperStatus;
	};
	
	this.setHeadLampStatus = function(headLampStatus){
		this.headLampStatus = headLampStatus;
	};
	
	this.setAccPedalPosition = function(accPedalPosition){
		this.accPedalPosition = accPedalPosition;
	};
	
	this.setSteeringWheelAngle = function(steeringWheelAngle){
		this.steeringWheelAngle = steeringWheelAngle;
	};
	
	this.setECallInfo = function(eCallInfo){
		this.eCallInfo = eCallInfo;
	};
	
	this.setAirbagStatus = function(airbagStatus){
		this.airbagStatus = airbagStatus;
	};
	
	this.setEmergencyEvent = function(emergencyEvent){
		this.emergencyEvent = emergencyEvent;
	};
	
	this.setClusterModeStatus = function(clusterModeStatus){
		this.clusterModeStatus = clusterModeStatus;
	};
	
	this.setMyKey = function(myKey){
		this.myKey = myKey;
	};
	
	this.setSpeed = function(speed){
		this.speed = speed;
	};
	
	this.getRpm = function(){
		return this.rpm;
	};
	
	this.getExternalTemperature = function(){
		return this.externalTemperature;
	};
	
	this.getFuelLevel = function(){
		return this.fuelLevel;
	};
	
	this.getPrndl = function(){
		return this.prndl;
	};
	
	this.getTirePressure = function(){
		return this.tirePressure;
	};
	
	this.getEngineTorque = function(){
		return this.engineTorque;
	};
	
	this.getOdometer = function(){
		return this.odometer;
	};
	
	this.getGps = function(){
		return this.gps;
	};
	
	this.getFuelLevel_State = function(){
		return this.fuelLevel_State;
	};
	
	this.getInstantFuelConsumption = function(){
		return this.instantFuelConsumption;
	};
	
	this.getBeltStatus = function(){
		return this.beltStatus;
	};
	
	this.getBodyInformation = function(){
		return this.bodyInformation;
	};
	
	this.getDeviceStatus = function(){
		return this.deviceStatus;
	};
	
	this.getDriverBraking = function(){
		return this.driverBraking;
	};
	
	this.getWiperStatus = function(){
		return this.wiperStatus;
	};
	
	this.getHeadLampStatus = function(){
		return this.headLampStatus;
	};
	
	this.getAccPedalPosition = function(){
		return this.accPedalPosition;
	};
	
	this.getSteeringWheelAngle = function(){
		return this.steeringWheelAngle;
	};
	
	this.getECallInfo = function(){
		return this.eCallInfo;
	};
	
	this.getAirbagStatus = function(){
		return this.airbagStatus;
	};
	
	this.getEmergencyEvent = function(){
		return this.emergencyEvent;
	};
	
	this.getClusterModeStatus = function(){
		return this.clusterModeStatus;
	};
	
	this.getMyKey = function(){
		return this.myKey;
	};
	
	this.getSpeed = function(){
		return this.speed;
	};
}
SubscribeVehicleData.prototype = Object.create(RPCBase.prototype);
factory.SubscribeVehicleData = SubscribeVehicleData;

function UnsubscribeVehicleData(){
	RPCBase.call(this);
	
	this.functionName = "unsubscribeVehicleData";
	this.rpm = null;
	this.externalTemperature = null;
	this.fuelLevel = null;
	this.prndl = null;
	this.tirePressure = null;
	this.engineTorque = null;
	this.odometer = null;
	this.gps = null;
	this.fuelLevel_State = null;
	this.instantFuelConsumption = null;
	this.beltStatus = null;
	this.bodyInformation = null;
	this.deviceStatus = null;
	this.driverBraking = null;
	this.wiperStatus = null;
	this.headLampStatus = null;
	this.accPedalPosition = null;
	this.steeringWheelAngle = null;
	this.eCallInfo = null;
	this.airbagStatus = null;
	this.emergencyEvent = null;
	this.clusterModeStatus = null;
	this.myKey = null;
	this.speed = null;
	
	this.setRpm = function(rpm){
		this.rpm = rpm;
	};
	
	this.setExternalTemperature = function(externalTemperature){
		this.externalTemperature = externalTemperature;
	};
	
	this.setFuelLevel = function(fuelLevel){
		this.fuelLevel = fuelLevel;
	};
	
	this.setPrndl = function(prndl){
		this.prndl = prndl;
	};
	
	this.setTirePressure = function(tirePressure){
		this.tirePressure = tirePressure;
	};
	
	this.setEngineTorque = function(engineTorque){
		this.engineTorque = engineTorque;
	};
	
	this.setOdometer = function(odometer){
		this.odometer = odometer;
	};
	
	this.setGps = function(gps){
		this.gps = gps;
	};
	
	this.setFuelLevel_State = function(fuelLevel_State){
		this.fuelLevel_State = fuelLevel_State;
	};
	
	this.setInstantFuelConsumption = function(instantFuelConsumption){
		this.instantFuelConsumption = instantFuelConsumption;
	};
	
	this.setBeltStatus = function(beltStatus){
		this.beltStatus = beltStatus;
	};
	
	this.setBodyInformation = function(bodyInformation){
		this.bodyInformation = bodyInformation;
	};
	
	this.setDeviceStatus = function(deviceStatus){
		this.deviceStatus = deviceStatus;
	};
	
	this.setDriverBraking = function(driverBraking){
		this.driverBraking = driverBraking;
	};
	
	this.setWiperStatus = function(wiperStatus){
		this.wiperStatus = wiperStatus;
	};
	
	this.setHeadLampStatus = function(headLampStatus){
		this.headLampStatus = headLampStatus;
	};
	
	this.setAccPedalPosition = function(accPedalPosition){
		this.accPedalPosition = accPedalPosition;
	};
	
	this.setSteeringWheelAngle = function(steeringWheelAngle){
		this.steeringWheelAngle = steeringWheelAngle;
	};
	
	this.setECallInfo = function(eCallInfo){
		this.eCallInfo = eCallInfo;
	};
	
	this.setAirbagStatus = function(airbagStatus){
		this.airbagStatus = airbagStatus;
	};
	
	this.setEmergencyEvent = function(emergencyEvent){
		this.emergencyEvent = emergencyEvent;
	};
	
	this.setClusterModeStatus = function(clusterModeStatus){
		this.clusterModeStatus = clusterModeStatus;
	};
	
	this.setMyKey = function(myKey){
		this.myKey = myKey;
	};
	
	this.setSpeed = function(speed){
		this.speed = speed;
	};
	
	this.getRpm = function(){
		return this.rpm;
	};
	
	this.getExternalTemperature = function(){
		return this.externalTemperature;
	};
	
	this.getFuelLevel = function(){
		return this.fuelLevel;
	};
	
	this.getPrndl = function(){
		return this.prndl;
	};
	
	this.getTirePressure = function(){
		return this.tirePressure;
	};
	
	this.getEngineTorque = function(){
		return this.engineTorque;
	};
	
	this.getOdometer = function(){
		return this.odometer;
	};
	
	this.getGps = function(){
		return this.gps;
	};
	
	this.getFuelLevel_State = function(){
		return this.fuelLevel_State;
	};
	
	this.getInstantFuelConsumption = function(){
		return this.instantFuelConsumption;
	};
	
	this.getBeltStatus = function(){
		return this.beltStatus;
	};
	
	this.getBodyInformation = function(){
		return this.bodyInformation;
	};
	
	this.getDeviceStatus = function(){
		return this.deviceStatus;
	};
	
	this.getDriverBraking = function(){
		return this.driverBraking;
	};
	
	this.getWiperStatus = function(){
		return this.wiperStatus;
	};
	
	this.getHeadLampStatus = function(){
		return this.headLampStatus;
	};
	
	this.getAccPedalPosition = function(){
		return this.accPedalPosition;
	};
	
	this.getSteeringWheelAngle = function(){
		return this.steeringWheelAngle;
	};
	
	this.getECallInfo = function(){
		return this.eCallInfo;
	};
	
	this.getAirbagStatus = function(){
		return this.airbagStatus;
	};
	
	this.getEmergencyEvent = function(){
		return this.emergencyEvent;
	};
	
	this.getClusterModeStatus = function(){
		return this.clusterModeStatus;
	};
	
	this.getMyKey = function(){
		return this.myKey;
	};
	
	this.getSpeed = function(){
		return this.speed;
	};
}
UnsubscribeVehicleData.prototype = Object.create(RPCBase.prototype);
factory.UnsubscribeVehicleData = UnsubscribeVehicleData;

function GetVehicleData(){
	RPCBase.call(this);
	
	this.functionName = "getVehicleData";
	this.rpm = null;
	this.externalTemperature = null;
	this.fuelLevel = null;
	this.prndl = null;
	this.tirePressure = null;
	this.engineTorque = null;
	this.odometer = null;
	this.gps = null;
	this.fuelLevel_State = null;
	this.instantFuelConsumption = null;
	this.beltStatus = null;
	this.bodyInformation = null;
	this.deviceStatus = null;
	this.driverBraking = null;
	this.wiperStatus = null;
	this.headLampStatus = null;
	this.accPedalPosition = null;
	this.steeringWheelAngle = null;
	this.eCallInfo = null;
	this.airbagStatus = null;
	this.emergencyEvent = null;
	this.clusterModeStatus = null;
	this.myKey = null;
	this.speed = null;
	this.vin = null;
	
	this.setRpm = function(rpm){
		this.rpm = rpm;
	};
	
	this.setExternalTemperature = function(externalTemperature){
		this.externalTemperature = externalTemperature;
	};
	
	this.setFuelLevel = function(fuelLevel){
		this.fuelLevel = fuelLevel;
	};
	
	this.setPrndl = function(prndl){
		this.prndl = prndl;
	};
	
	this.setTirePressure = function(tirePressure){
		this.tirePressure = tirePressure;
	};
	
	this.setEngineTorque = function(engineTorque){
		this.engineTorque = engineTorque;
	};
	
	this.setOdometer = function(odometer){
		this.odometer = odometer;
	};
	
	this.setGps = function(gps){
		this.gps = gps;
	};
	
	this.setFuelLevel_State = function(fuelLevel_State){
		this.fuelLevel_State = fuelLevel_State;
	};
	
	this.setInstantFuelConsumption = function(instantFuelConsumption){
		this.instantFuelConsumption = instantFuelConsumption;
	};
	
	this.setBeltStatus = function(beltStatus){
		this.beltStatus = beltStatus;
	};
	
	this.setBodyInformation = function(bodyInformation){
		this.bodyInformation = bodyInformation;
	};
	
	this.setDeviceStatus = function(deviceStatus){
		this.deviceStatus = deviceStatus;
	};
	
	this.setDriverBraking = function(driverBraking){
		this.driverBraking = driverBraking;
	};
	
	this.setWiperStatus = function(wiperStatus){
		this.wiperStatus = wiperStatus;
	};
	
	this.setHeadLampStatus = function(headLampStatus){
		this.headLampStatus = headLampStatus;
	};
	
	this.setAccPedalPosition = function(accPedalPosition){
		this.accPedalPosition = accPedalPosition;
	};
	
	this.setSteeringWheelAngle = function(steeringWheelAngle){
		this.steeringWheelAngle = steeringWheelAngle;
	};
	
	this.setECallInfo = function(eCallInfo){
		this.eCallInfo = eCallInfo;
	};
	
	this.setAirbagStatus = function(airbagStatus){
		this.airbagStatus = airbagStatus;
	};
	
	this.setEmergencyEvent = function(emergencyEvent){
		this.emergencyEvent = emergencyEvent;
	};
	
	this.setClusterModeStatus = function(clusterModeStatus){
		this.clusterModeStatus = clusterModeStatus;
	};
	
	this.setMyKey = function(myKey){
		this.myKey = myKey;
	};
	
	this.setSpeed = function(speed){
		this.speed = speed;
	};
	
	this.setVin = function(vin){
		this.vin = vin;
	};
	
	this.getRpm = function(){
		return this.rpm;
	};
	
	this.getExternalTemperature = function(){
		return this.externalTemperature;
	};
	
	this.getFuelLevel = function(){
		return this.fuelLevel;
	};
	
	this.getPrndl = function(){
		return this.prndl;
	};
	
	this.getTirePressure = function(){
		return this.tirePressure;
	};
	
	this.getEngineTorque = function(){
		return this.engineTorque;
	};
	
	this.getOdometer = function(){
		return this.odometer;
	};
	
	this.getGps = function(){
		return this.gps;
	};
	
	this.getFuelLevel_State = function(){
		return this.fuelLevel_State;
	};
	
	this.getInstantFuelConsumption = function(){
		return this.instantFuelConsumption;
	};
	
	this.getBeltStatus = function(){
		return this.beltStatus;
	};
	
	this.getBodyInformation = function(){
		return this.bodyInformation;
	};
	
	this.getDeviceStatus = function(){
		return this.deviceStatus;
	};
	
	this.getDriverBraking = function(){
		return this.driverBraking;
	};
	
	this.getWiperStatus = function(){
		return this.wiperStatus;
	};
	
	this.getHeadLampStatus = function(){
		return this.headLampStatus;
	};
	
	this.getAccPedalPosition = function(){
		return this.accPedalPosition;
	};
	
	this.getSteeringWheelAngle = function(){
		return this.steeringWheelAngle;
	};
	
	this.getECallInfo = function(){
		return this.eCallInfo;
	};
	
	this.getAirbagStatus = function(){
		return this.airbagStatus;
	};
	
	this.getEmergencyEvent = function(){
		return this.emergencyEvent;
	};
	
	this.getClusterModeStatus = function(){
		return this.clusterModeStatus;
	};
	
	this.getMyKey = function(){
		return this.myKey;
	};
	
	this.getSpeed = function(){
		return this.speed;
	};
	
	this.getVin = function(){
		return this.vin;
	};
}
GetVehicleData.prototype = Object.create(RPCBase.prototype);
factory.GetVehicleData = GetVehicleData;

function ScrollableMessage(){
	RPCBase.call(this);
	
	this.functionName = "scrollableMessage";
	this.scrollableMessageBody = null;
	this.timeout = null;
	this.softButtons = null;
	
	this.setScrollableMessageBody = function(scrollableMessageBody){
		this.scrollableMessageBody = scrollableMessageBody;
	};
	
	this.setTimeout = function(timeout){
		this.timeout = timeout;
	};
	
	this.setSoftButtons = function(softButtonArray){
		this.softButtons = softButtonArray ? SdlCordova.toArray(softButtonArray) : null;
	};
	
	this.addSoftButton = function(button){
		if(this.softButtons == null)
			this.softButtons = [button];
		else
			this.softButtons.push(button);
	};
	
	this.getScrollableMessageBody = function(){
		return this.scrollableMessageBody;
	};
	
	this.getTimeout = function(){
		return this.timeout;
	};
	
	this.getSoftButtons = function(){
		return this.softButtons;
	};

}
ScrollableMessage.prototype = Object.create(RPCBase.prototype);
factory.ScrollableMessage = ScrollableMessage;

function ChangeRegistration(){
	RPCBase.call(this);
	
	this.functionName = "changeRegistration";
	this.language = null;
    this.hmiDisplayLanguage = null;
    this.appName = null;
    this.ttsName = null;
    this.ngnMediaScreenAppName = null;
    this.vrSynonyms = null;
	
	this.setLanguage = function(language){
		this.language = language;
	};
	
	this.setHmiDisplayLanguage = function(hmiDisplayLanguage){
		this.hmiDisplayLanguage = hmiDisplayLanguage;
	};
	
	this.setAppName = function(appName){
		this.appName = appName;
	};
	
	this.setTtsName = function (ttsChunkArray){
		this.ttsName = ttsChunkArray ? SdlCordova.toArray(ttsChunkArray) : null;
	};
	
	this.addTTSChunk = function(chunk){
		if(this.ttsName == null){
			this.ttsName = [chunk];
		}else{
			this.ttsName.push(chunk);
		}		
	};
	
	this.setNgnMediaScreenAppName = function(ngnMediaScreenAppName){
		this.ngnMediaScreenAppName = ngnMediaScreenAppName;
	};
	
	this.setVrSynonyms = function(vrSynonymsArray){
		this.vrSynonyms = vrSynonymsArray ? SdlCordova.toArray(vrSynonymsArray) : null;
	};
	
	this.addVrSynonyms = function(vrSynonyms){
		if(this.vrSynonyms == null){
			this.vrSynonyms = [vrSynonyms];
		}else{
			this.vrSynonyms.push(vrSynonyms);
		}		
	};
	
	this.getLanguage = function(){
		return this.language;
	};
	
	this.getHmiDisplayLanguage = function(){
		return this.hmiDisplayLanguage;
	};
	
	this.getAppName = function(){
		return this.appName;
	};
	
	this.getTtsName = function (){
		return this.ttsName;
	};
	
	this.getNgnMediaScreenAppName = function(){
		return this.ngnMediaScreenAppName;
	};
	
	this.getVrSynonyms = function(){
		return this.vrSynonyms;
	};
}
ChangeRegistration.prototype = Object.create(RPCBase.prototype);
factory.ChangeRegistration = ChangeRegistration;

function SetAppIcon(){
	RPCBase.call(this);
	
	this.functionName = "setAppIcon";
	this.sdlFileName = null;
	
	this.setSdlFileName = function(sdlFileName){
		this.sdlFileName = sdlFileName;
	};
	
	this.getSdlFileName = function(){
		return this.sdlFileName;
	};
}
SetAppIcon.prototype = Object.create(RPCBase.prototype);
factory.SetAppIcon = SetAppIcon;

function SetDisplayLayout(){
	RPCBase.call(this);
	
	this.functionName = "setDisplayLayout";
	this.displayLayout = null;
	
	this.setDisplayLayout = function(displayLayout){
		this.displayLayout = displayLayout;
	};
	
	this.getDisplayLayout = function(){
		return this.displayLayout;
	};
}
SetDisplayLayout.prototype = Object.create(RPCBase.prototype);
factory.SetDisplayLayout = SetDisplayLayout;

function GetDTCs(){
	RPCBase.call(this);
	
	this.functionName = "getDTCs";
	this.dtcMask = null;
	this.ecuName = null;
	
	this.setDtcMask = function(dtcMask){
		this.dtcMask = dtcMask;
	};
	
	this.setEcuName = function(ecuName){
		this.ecuName = ecuName;
	};
	
	this.getDtcMask = function(){
		return this.dtcMask;
	};
	
	this.getEcuName = function(){
		return this.ecuName;
	};
}
GetDTCs.prototype = Object.create(RPCBase.prototype);
factory.GetDTCs = GetDTCs;

function Slider(){
	RPCBase.call(this);
	
	this.functionName = "slider";
	this.numTicks = null;
	this.sliderHeader = null;
	this.sliderFooter = null; //array
	this.position = null;
	this.timeout = null;
	
	this.setNumTicks = function(numTicks){
		this.numTicks = numTicks;
	};
	
	this.setSliderHeader = function(sliderHeader){
		this.sliderHeader = sliderHeader;
	};
	
	/*this.setSliderFooter = function(sliderFooter){
		this.sliderFooter = sliderFooter;
	};*/
	this.setSliderFooter = function(sliderFooterArray){
		this.sliderFooter = sliderFooterArray ? SdlCordova.toArray(sliderFooterArray) : null;
	};
	
	this.addSliderFooter = function(footer){
		if(this.sliderFooter == null)
			this.sliderFooter = [footer];
		else
			this.sliderFooter.push(footer);
	};
	
	this.setPosition = function(position){
		this.position = position;
	};
	
	this.setTimeout = function(timeout){
		this.timeout = timeout;
	};
	
	this.getNumTicks = function(){
		return this.numTicks;
	};
	
	this.getSliderHeader = function(){
		return this.sliderHeader;
	};
	
	this.getSliderFooter = function(){
		return this.sliderFooter;
	};
	
	this.getPosition = function(){
		return this.position;
	};
	
	this.getTimeout = function(){
		return this.timeout;
	};
	
}
Slider.prototype = Object.create(RPCBase.prototype);
factory.Slider = Slider;

// end added
function isValidTTSChunkType(type){
	switch(type){
	case SdlCordova.names.speechCapabilities_TEXT:
	case SdlCordova.names.speechCapabilities_SAPI_PHONEMES:
	case SdlCordova.names.speechCapabilities_LHPLUS_PHONEMES:
	case SdlCordova.names.speechCapabilities_PRE_RECORDED:
	case SdlCordova.names.speechCapabilities_SILENCE:
		return true;
	default:
		return false;
	}
}
factory.isValidTTSChunkType = isValidTTSChunkType;

function isValidButtonName(btn){
	switch(btn){
	case SdlCordova.names.buttonName_OK:
	case SdlCordova.names.buttonName_SEEKLEFT:
	case SdlCordova.names.buttonName_SEEKRIGHT:
	case SdlCordova.names.buttonName_TUNEUP:
	case SdlCordova.names.buttonName_TUNEDOWN:
	case SdlCordova.names.buttonName_PRESET_0:
	case SdlCordova.names.buttonName_PRESET_1:
	case SdlCordova.names.buttonName_PRESET_2:
	case SdlCordova.names.buttonName_PRESET_3:
	case SdlCordova.names.buttonName_PRESET_4:
	case SdlCordova.names.buttonName_PRESET_5:
	case SdlCordova.names.buttonName_PRESET_6:
	case SdlCordova.names.buttonName_PRESET_7:
	case SdlCordova.names.buttonName_PRESET_8:
	case SdlCordova.names.buttonName_PRESET_9:
		return true;
	}
	return false;
}
factory.isValidButtonName = isValidButtonName;

var onCorrelationIdListeners = {};
var onCommandListeners = {};
var onChoiceIdListeners = {};
var buttonEventListeners = {};
var buttonPressesListeners = {};

function onCorrelationId(corrId, f){
	if(f == null){
		delete onCorrelationIdListeners[corrId];
		return;
	}
	
	if(onCorrelationIdListeners[corrId])
		onCorrelationIdListeners[corrId].push(f);
	else
		onCorrelationIdListeners[corrId] = [f];
}
factory.onCorrelationId = onCorrelationId;

function onCommandId(cmdId, f){
	if(f == null){
		delete onCommandListeners[cmdId];
		return;
	}
	
	if(onCommandListeners[cmdId])
		onCommandListeners[cmdId].push(f);
	else
		onCommandListeners[cmdId] = [f];
}
factory.onCommandId = onCommandId;

//Jiaxi added
function onChoiceId(choiceId, f){
	if(f == null){
		delete onChoiceIdListeners[choiceId];
		return;
	}
	
	if(onChoiceIdListeners[choiceId])
		onChoiceIdListeners[choiceId].push(f);
	else
		onChoiceIdListeners[choiceId] = [f];
}
factory.onChoiceId = onChoiceId;

function onButtonEvent(customButtonID, f){
	if(f == null){
		delete buttonEventListeners[customButtonID];
		return;
	}
	
	if(buttonEventListeners[customButtonID])
		buttonEventListeners[customButtonID].push(f);
	else
		buttonEventListeners[customButtonID] = [f];
}
factory.onButtonEvent = onButtonEvent;

function onButtonPress(customButtonID, f){
	if(f == null){
		delete buttonPressesListeners[customButtonID];
		return;
	}
	
	if(buttonPressesListeners[customButtonID])
		buttonPressesListeners[customButtonID].push(f);
	else
		buttonPressesListeners[customButtonID] = [f];
}
factory.onButtonPress = onButtonPress;
//end 

function proxyListener(info){ //unfinished 
	var fs = null;
	console.log("ProxyListner: "+info.FunctionName);
	console.log("Info detail: "+info);
	if((fs = onCorrelationIdListeners[info.CorrelationID])){
		for(var i = 0; i < fs.length; i++){
			fs[i](info);
		}
	}
	
	//if(info.name == "OnCommand"){
	if(info.FunctionName == "OnCommand"){
		var cmdId = info.JSONData.cmdID;
		var fs = null;
		if((fs = onCommandListeners[cmdId])){
			for(var i = 0; i < fs.length; i++){
				fs[i](info);
			}
		}			
	}
	
	if(info.FunctionName.indexOf("onChoice")>0){
		var choiceId = info.JSONData.choiceId;
		var fs = null;
		if((fs = onChoiceIdListeners[choiceId])){
			for(var i = 0; i < fs.length; i++){
				fs[i](info);
			}
		}		
	}
	
	if(info.FunctionName =="OnButtonEvent"){
		var customButtonID = info.JSONData.customButtonID;
		var fs = null;
		if((fs = buttonEventListeners[customButtonID])){
			for(var i = 0; i < fs.length; i++){
				fs[i](info);
			}
		}		
	}
	
	if(info.FunctionName =="OnButtonPress"){
		var customButtonID = info.JSONData.customButtonID;
		var fs = null;
		if((fs = buttonPressesListeners[customButtonID])){
			for(var i = 0; i < fs.length; i++){
				fs[i](info);
			}
		}		
	}
}
factory.proxyListener = proxyListener;

SdlCordova.onAddCommandResponse(proxyListener);
SdlCordova.onAddSubMenuResponse(proxyListener);
SdlCordova.onAlertResponse(proxyListener);
SdlCordova.onCreateInteractionChoiceSetResponse(proxyListener);
SdlCordova.onDeleteCommandResponse(proxyListener);
SdlCordova.onDeleteInteractionChoiceSetResponse(proxyListener);
SdlCordova.onDeleteSubMenuResponse(proxyListener);
SdlCordova.onEncodedSdlPDataResponse(proxyListener);
SdlCordova.onPerformInteractionResponse(proxyListener);
SdlCordova.onRegisterAppInterfaceResponse(proxyListener);
SdlCordova.onSetGlobalPropertiesResponse(proxyListener);
SdlCordova.onResetGlobalPropertiesResponse(proxyListener);
SdlCordova.onSetMediaClockTimerResponse(proxyListener);
SdlCordova.onShowResponse(proxyListener);
SdlCordova.onSpeakResponse(proxyListener);
SdlCordova.onSubscribeButtonResponse(proxyListener);
SdlCordova.onUnregisterAppInterfaceResponse(proxyListener);
SdlCordova.onUnsubscribeButtonResponse(proxyListener);
SdlCordova.onOnButtonEvent(proxyListener);
SdlCordova.onOnButtonPress(proxyListener);
SdlCordova.onOnEncodedSdlPData(proxyListener);
SdlCordova.onOnTBTClientState(proxyListener);
SdlCordova.onOnDriverDistraction(proxyListener);
SdlCordova.onOnCommand(proxyListener);
SdlCordova.onOnHMIStatus(proxyListener);
SdlCordova.onOnAppInterfaceUnregistered(proxyListener);
SdlCordova.onGenericResponse(proxyListener);
SdlCordova.onError(proxyListener);
SdlCordova.onProxyClosed(proxyListener);
SdlCordova.onProxyFirstAccess(proxyListener);
SdlCordova.onPutFileResponse(proxyListener);
SdlCordova.onDeleteFileResponse(proxyListener);
SdlCordova.onListFilesResponse(proxyListener);
SdlCordova.onPerformAudioPassThruResponse(proxyListener);
SdlCordova.onOnAudioPassThru(proxyListener);
SdlCordova.onEndAudioPassThruResponse(proxyListener);
SdlCordova.onSubscribeVehicleDataResponse(proxyListener);
SdlCordova.onUnsubscribeVehicleDataResponse(proxyListener);
SdlCordova.onOnVehicleData(proxyListener);
SdlCordova.onGetVehicleDataResponse(proxyListener);
SdlCordova.onScrollableMessageResponse(proxyListener);
SdlCordova.onChangeRegistrationResponse(proxyListener);
SdlCordova.onSetAppIconResponse(proxyListener);
SdlCordova.onSetDisplayLayoutResponse(proxyListener);
SdlCordova.onGetDTCsResponse(proxyListener);
SdlCordova.onSliderResponse(proxyListener);