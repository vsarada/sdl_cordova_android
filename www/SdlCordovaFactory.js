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
	this.playTone = true;
	this.duration = null;
	
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
	
	this.setAlertText = function(line1, line2){
		this.alertText1 = line1;
		this.alertText2 = line2;
	};
	
	this.setPlayTone = function(playTone){
		this.playTone = playTone;
	};
	
	this.setDuration = function(milliseconds){
		this.duration = milliseconds;
	};
	
	this.getTTSChunks = function(){
		return this.ttsChunks;
	};
	
	this.getAlertText = function(){
		return {line1: this.alertText1, line2: this.alertText2};
	};
	
	this.getPlayTone = function(){
		return this.playTone;
	};
	
	this.getDuration = function(){
		return this.duration;
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
	this.alignment = null;
	this.statusBar = null;
	this.mediaClock = null;
	this.mediaTrack = null;
	
	this.setDisplayText = function(line1, line2){
		if(line1){
			this.mainField1 = line1;
		}
		
		if(line2){
			this.mainField2 = line2;
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

	this.getDisplayLine1 = function(){
		return this.mainField1;
	};
	this.getDisplayLine2 = function(){
		return this.mainField2;
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

function onButtonEvent(btnId, f){
	if(f == null){
		delete buttonEventListeners[btnId];
		return;
	}
	
	if(buttonEventListeners[btnId])
		buttonEventListeners[btnId].push(f);
	else
		buttonEventListeners[btnId] = [f];
}
factory.onButtonEvent = onButtonEvent;

function onButtonPress(btnId, f){
	if(f == null){
		delete buttonPressesListeners[btnId];
		return;
	}
	
	if(buttonPressesListeners[btnId])
		buttonPressesListeners[btnId].push(f);
	else
		buttonPressesListeners[btnId] = [f];
}
factory.onButtonPress = onButtonPress;
//end 

function proxyListener(info){ //unfinished 
	var fs = null;
	console.log("inside proxy listener");
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
}
factory.proxyListener = proxyListener;

SdlCordova.onAddCommandResponse(proxyListener);
SdlCordova.onAddSubMenuResponse(proxyListener);
SdlCordova.onAlertResponse(proxyListener);
SdlCordova.onCreateInteractionChoiceSetResponse(proxyListener);
SdlCordova.onDeleteCommandResponse(proxyListener);
SdlCordova.onDeleteInteractionChoiceSetResponse(proxyListener);
SdlCordova.onDeleteSubMenuResponse(proxyListener);
SdlCordova.onEncodedSyncPDataResponse(proxyListener);
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
SdlCordova.onOnEncodedSyncPData(proxyListener);
SdlCordova.onOnTBTClientState(proxyListener);
SdlCordova.onOnDriverDistraction(proxyListener);
SdlCordova.onOnCommand(proxyListener);
SdlCordova.onOnHMIStatus(proxyListener);
SdlCordova.onOnAppInterfaceUnregistered(proxyListener);
SdlCordova.onGenericResponse(proxyListener);
SdlCordova.onError(proxyListener);
SdlCordova.onProxyClosed(proxyListener);
SdlCordova.onProxyFirstAccess(proxyListener);