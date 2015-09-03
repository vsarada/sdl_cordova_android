testManager.addTest({
	label: "V2 New functions ",
	timeout: 50000,
	canRunTest: function(){
		if(!proxyCreated)
			return ["No proxy created"];
		
		if(!proxyConnected)
			return ["No proxy connection"];
		
		if(!initialized)
			return ["Proxy not opt'ed in"];
		
		if(hmiLevel != "FULL") { //SdlCordova.Names.HMILevel.FULL){
			return ["Application must be in HMI Level = FULL"];
		}
		
		return null;
	},
	run: function(){
	/*
		//Slider
		var slider = new SdlCordovaFactory.Slider();
		slider.setCorrelationId(++nextCorrelationId);
		slider.setSuccess(function(){
			prependLog("slider sent successfully " + slider.getCorrelationId());
		});
		slider.setError(function(e){
			prependLogError("slider send error " + e);
		});
		slider.setNumTicks(2);
		slider.setPosition(1);
		slider.setSliderHeader("Slider Test Header");
		slider.addSliderFooter("Footer1");
		slider.addSliderFooter("Footer2");
		sendRPC(slider);
	
		//GetDTCs
		var dtc = new SdlCordovaFactory.GetDTCs();
		dtc.setCorrelationId(++nextCorrelationId);
		dtc.setSuccess(function(){
			prependLog("dtc sent successfully " + dtc.getCorrelationId());
		});
		dtc.setError(function(e){
			prependLogError("dtc send error " + e);
		});
		//dtc.setDtcMask(1);
		dtc.setEcuName(2000);
		sendRPC(dtc);
	
		
		//SetDisplayLayout
		var layout = new SdlCordovaFactory.SetDisplayLayout();
		layout.setCorrelationId(++nextCorrelationId);
		layout.setSuccess(function(){
			prependLog("layout sent successfully " + layout.getCorrelationId());
		});
		layout.setError(function(e){
			prependLogError("layout send error " + e);
		});
		layout.setDisplayLayout("DEFAULT");
		sendRPC(layout);
	
		//SetAppIcon
		var setAppIcon = new SdlCordovaFactory.SetAppIcon();
		setAppIcon.setCorrelationId(++nextCorrelationId);
		setAppIcon.setSuccess(function(){
			prependLog("setAppIcon sent successfully " + setAppIcon.getCorrelationId());
		});
		setAppIcon.setError(function(e){
			prependLogError("setAppIcon send error " + e);
		});
		setAppIcon.setSdlFileName("action.jpg");
		
	
		//loading image using putfile
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
		function gotFS(fileSystem) {
			fileSystem.root.getFile("action.jpg", null, gotFileEntry, fail);
		}
		function gotFileEntry(fileEntry) {
			fileEntry.file(gotFile, fail);
		}
		function gotFile(file){
			var reader = new FileReader();

				reader.onloadend = function(evt) {
					try{
						var put = new SdlCordovaFactory.PutFile();
						console.log("new putfile created");
						put.setCorrelationId(++nextCorrelationId);
						put.setSuccess(function(){
							prependLog("put sent successfully " + put.getCorrelationId());
						});
						put.setError(function(e){
							prependLogError("put send error " + e);
						});
						put.setSdlFileName("action.jpg");
						put.setFileType("GRAPHIC_JPEG");
						put.setFileData(evt.target.result);
						SdlCordovaFactory.onCorrelationId(put.getCorrelationId(), function(info){
							prependLog(info);
							//prependLog("send deleteFile");
							//sendRPC(deleteFile);
							//prependLog("send listFiles");
							//sendRPC(listFiles);
							//sendRPC(cmd2);
							sendRPC(setAppIcon);
						});
						sendRPC(put);
					} catch(err){
						console.log("[ERROR]: " + err);
					}
				}
				reader.readAsDataURL(file);
		}

		function fail(evt) {
			console.log(evt.target.error.code);
		}
		
		var change = new SdlCordovaFactory.ChangeRegistration();
		change.setCorrelationId(++nextCorrelationId);
		change.setSuccess(function(){
			prependLog("change sent successfully " + change.getCorrelationId());
		});
		change.setError(function(e){
			prependLogError("change send error " + e);
		});
		change.setLanguage("FR-CA");
		change.setHmiDisplayLanguage("FR-CA");
		change.setAppName("CordovaTester2");
		sendRPC(change);
	
		var scroll = new SdlCordovaFactory.ScrollableMessage();
		scroll.setCorrelationId(++nextCorrelationId);
		scroll.setSuccess(function(){
			prependLog("scroll sent successfully " + scroll.getCorrelationId());
		});
		scroll.setError(function(e){
			prependLogError("scroll send error " + e);
		});
		scroll.setScrollableMessageBody("This is a scrollable Message Body!\nThis is a scrollable Message Body!\nThis is a scrollable Message Body! ");
		//scroll.setTimeout(10000);
		scroll.addSoftButton(new SdlCordova.SoftButton(false, 1, SdlCordova.names.action_DEFAULT_ACTION, "Reply", SdlCordova.names.softButtonType_TEXT)); 
		sendRPC(scroll);
		
	
		var subscribe = new SdlCordovaFactory.SubscribeVehicleData();
		subscribe.setCorrelationId(++nextCorrelationId);
		subscribe.setSuccess(function(){
			prependLog("subscribe sent successfully " + subscribe.getCorrelationId());
		});
		subscribe.setError(function(e){
			prependLogError("subscribe send error " + e);
		});
		subscribe.setSpeed(true);
		//sendRPC(subscribe);
		
		var unsubscribe = new SdlCordovaFactory.UnsubscribeVehicleData();
		unsubscribe.setCorrelationId(++nextCorrelationId);
		unsubscribe.setSuccess(function(){
			prependLog("unsubscribe sent successfully " + unsubscribe.getCorrelationId());
		});
		unsubscribe.setError(function(e){
			prependLogError("unsubscribe send error " + e);
		});
		unsubscribe.setSpeed(true);
		SdlCordovaFactory.onCorrelationId(subscribe.getCorrelationId(), function(){
			sendRPC(unsubscribe);
		});	
		sendRPC(subscribe);
		
		var getdata = new SdlCordovaFactory.GetVehicleData();
		getdata.setCorrelationId(++nextCorrelationId);
		getdata.setSuccess(function(){
			prependLog("getdata sent successfully " + getdata.getCorrelationId());
		});
		getdata.setError(function(e){
			prependLogError("getdata send error " + e);
		});
		getdata.setSpeed(true);
		sendRPC(getdata);*/
		
		var alert = new SdlCordovaFactory.Alert();
		alert.setCorrelationId(++nextCorrelationId);
		alert.setSuccess(function(){
			prependLog("alert sent successfully " + alert.getCorrelationId());
		});
		alert.setError(function(e){
			prependLogError("alert send error " + e);
		});
		
		//alert.setAlertText("Test", "Complete");
		alert.setAlertText("Test", "is", "Completed"); //alert has one more new line
		alert.setPlayTone(true);
		//alert.addSoftButton(new SdlCordova.SoftButton(false, 1, SdlCordova.names.action_DEFAULT_ACTION, "Alert", SdlCordova.names.softButtonType_TEXT));
		//alert.addSoftButton(new SdlCordova.SoftButton(true, 2, SdlCordova.names.action_STEAL_FOCUS, "", SdlCordova.names.softButtonType_IMAGE, new SdlCordova.Image("0x62", SdlCordova.names.imagetype_static)));
		alert.setTTSText("Test Complete");
		alert.setDuration(8000);
		
		// EndAudioPassThru
		var endAudio = new SdlCordovaFactory.EndAudioPassThru();
		endAudio.setCorrelationId(++nextCorrelationId);
		endAudio.setSuccess(function(){
			prependLog("endAudio sent successfully " + endAudio.getCorrelationId());
		});
		endAudio.setError(function(e){
			prependLogError("endAudio send error " + e);
		});
		//sendRPC(endAudio);
		
		//PerformAudioPassThru
		var performAudio = new SdlCordovaFactory.PerformAudioPassThru();
		performAudio.setCorrelationId(++nextCorrelationId);
		performAudio.setSuccess(function(){
			prependLog("performAudio sent successfully " + performAudio.getCorrelationId());
		});
		performAudio.setError(function(e){
			prependLogError("performAudio send error" + e);
		});	
		performAudio.setMaxDuration(50000);
		performAudio.setAudioPassThruDisplayText("Test Audio Pass Through", "Second line");
		performAudio.setInitialText("This is PerformAudio initial text.");
		performAudio.setSamplingRate("16KHZ");
		performAudio.setAudioType("PCM");
		performAudio.setBitsPerSample("8_BIT");
		SdlCordovaFactory.onCorrelationId(performAudio.getCorrelationId(), function(info){
			prependLog(info);
			//sendRPC(endAudio);
			//sendRPC(alert);
		});	
		sendRPC(performAudio);
		
		
		SdlCordovaFactory.onCorrelationId(alert.getCorrelationId(), function(){
			var show2 = new SdlCordovaFactory.Show();
			show2.setCorrelationId(++nextCorrelationId);
			show2.setSuccess(function(){
				prependLog("show2 sent successfully " + show2.getCorrelationId());
			});
			show2.setError(function(e){
				prependLogError("show2 send error " + e);
			});			
			//show2.setDisplayText("Test", "Complete");
			show2.setDisplayText("Test", "Complete", "", "");
			show2.setTextAlignment(SdlCordova.names.alignment_center);		
			sendRPC(show2);
			
			testManager.pass();
		});
	}
});