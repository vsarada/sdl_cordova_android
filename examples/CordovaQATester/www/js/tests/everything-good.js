testManager.addTest({
	label: "Happy Path",
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
	timeout: 900000, //added one zero for debugging
	run: function(){
		//testing proxy getters
		SdlCordova.getButtonCapabilities({
			success: function(data){
				prependLog("getButtonCapabilities response success");
				prependLog(data);
				
				if(!data){
					prependLog("Invalid data from getButtonCapabilities");
					testManager.fail();
				}
			},
			error: function(e){
				prependLogError("getButtonCapabilities response error: " + e);
				testManager.fail();
			}
		});
		
		SdlCordova.getDisplayCapabilities({
			success: function(data){
				prependLog("getDisplayCapabilities response success");
				prependLog(data);
				
				if(!data){
					prependLog("Invalid data from getDisplayCapabilities");
					testManager.fail();
				}
			},
			error: function(e){
				prependLogError("getDisplayCapabilities response error: " + e);
				testManager.fail();
			}
		});
		
		SdlCordova.getHMIZoneCapabilities({
			success: function(data){
				prependLog("getHMIZoneCapabilities response success");
				prependLog(data);
				
				if(!data){
					prependLog("Invalid data from getHMIZoneCapabilities");
					testManager.fail();
				}
			},
			error: function(e){
				prependLogError("getHMIZoneCapabilities response error: " + e);
				testManager.fail();
			}
		});
		
		SdlCordova.getSpeechCapabilities({
			success: function(data){
				prependLog("getSpeechCapabilities response success");
				prependLog(data);
				
				if(!data){
					prependLog("Invalid data from getSpeechCapabilities");
					testManager.fail();
				}
			},
			error: function(e){
				prependLogError("getSpeechCapabilities response error: " + e);
				testManager.fail();
			}
		});
		
		SdlCordova.getSdlMsgVersion({
			success: function(data){
				prependLog("getSdlMsgVersion response success");
				prependLog(data);
				
				if(!data){
					prependLog("Invalid data from getSdlMsgVersion");
					testManager.fail();
				}
			},
			error: function(e){
				prependLogError("getSdlMsgVersion response error: " + e);
				testManager.fail();
			}
		});
		
		SdlCordova.getVRCapabilities({
			success: function(data){
				prependLog("getVRCapabilities response success");
				prependLog(data);
				
				if(!data){
					prependLog("Invalid data from getVRCapabilities");
					testManager.fail();
				}
			},
			error: function(e){
				prependLogError("getVRCapabilities response error: " + e);
				testManager.fail();
			}
		});
		
		SdlCordova.getPersistentSdlData({
			success: function(data){
				prependLog("getPersistentSdlData response success");
				prependLog(data);
				
				if(!data){
					prependLog("Invalid data from getPersistentSdlData");
					testManager.fail();
				}
			},
			error: function(e){
				prependLogError("getPersistentSdlData response error: " + e);
				testManager.fail();
			}
		});
		
		//Alert
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
		//alert.setTTSWithText("Test Complete");
		alert.addSoftButton(new SdlCordova.SoftButton(false, 1, SdlCordova.names.action_DEFAULT_ACTION, "Alert", SdlCordova.names.softButtonType_TEXT));
		alert.addSoftButton(new SdlCordova.SoftButton(true, 2, SdlCordova.names.action_STEAL_FOCUS, "", SdlCordova.names.softButtonType_IMAGE, new SdlCordova.Image("0x62", SdlCordova.names.imagetype_static)));
		alert.setTTSText("Test Complete");
		alert.setDuration(8000);
		
		//Show
		var show = new SdlCordovaFactory.Show();
		show.setCorrelationId(++nextCorrelationId);
		show.setSuccess(function(){
			prependLog("show sent successfully " + show.getCorrelationId());
		});
		show.setError(function(e){
			prependLogError("show send error" + e);
		});		
		//show.setDisplayText("Testing in", "Progress");
		show.setDisplayText("Testing in", "Progress", "Testing", "new lines"); //show has two more lines
		show.setTextAlignment(SdlCordova.names.alignment_left);
		//show.setMediaClock(" 1:12"); Deprecated
		show.addSoftButton(new SdlCordova.SoftButton(false, 1, SdlCordova.names.action_DEFAULT_ACTION, "Show", SdlCordova.names.softButtonType_TEXT));
		show.addSoftButton(new SdlCordova.SoftButton(true, 2, SdlCordova.names.action_STEAL_FOCUS, "", SdlCordova.names.softButtonType_IMAGE, new SdlCordova.Image("0x62", SdlCordova.names.imagetype_static)));
		show.setGraphic(new SdlCordova.Image("0x62", SdlCordova.names.imagetype_static));
		show.setCustomPresets(["Show 1", "Show 2"]);
		sendRPC(show);
		
		//Speak
		var speak = new SdlCordovaFactory.Speak();
		speak.setCorrelationId(++nextCorrelationId);
		speak.setSuccess(function(){
			prependLog("speak sent successfully " + speak.getCorrelationId());
		});
		speak.setError(function(e){
			prependLogError("speak send error " + e);
		});
		//speak.setTTSWithText("Let's start the test!");
		speak.setTTSText("Let's start the test!");
		sendRPC(speak);
		
		//Subscribe button
		var subscribeBtn = new SdlCordovaFactory.SubscribeButton();
		subscribeBtn.setCorrelationId(++nextCorrelationId);
		subscribeBtn.setSuccess(function(){
			prependLog("subscribeBtn sent successfully " + subscribeBtn.getCorrelationId());
		});
		subscribeBtn.setError(function(e){
			prependLogError("subscribeBtn send error " + e);
		});		
		subscribeBtn.setButtonName(SdlCordova.names.buttonName_OK);
		sendRPC(subscribeBtn);
		
		//Subscribe a second button
		var subscribeBtn2 = new SdlCordovaFactory.SubscribeButton();
		subscribeBtn2.setCorrelationId(++nextCorrelationId);
		subscribeBtn2.setSuccess(function(){
			prependLog("subscribeBtn2 sent successfully " + subscribeBtn2.getCorrelationId());
		});
		subscribeBtn2.setError(function(e){
			prependLogError("subscribeBtn2 send error " + e);
		});
		subscribeBtn2.setButtonName(SdlCordova.names.buttonName_SEEKLEFT);
		sendRPC(subscribeBtn2);
		
		//unsubscribe button 
		var unsubscribeBtn = new SdlCordovaFactory.UnsubscribeButton();
		unsubscribeBtn.setCorrelationId(++nextCorrelationId);
		unsubscribeBtn.setSuccess(function(){
			prependLog("unsubscribeBtn sent successfully " + unsubscribeBtn.getCorrelationId());
		});
		unsubscribeBtn.setError(function(e){
			prependLogError("unsubscribeBtn send error " + e);
		});
		unsubscribeBtn.setButtonName(SdlCordova.names.buttonName_SEEKLEFT);
		sendRPC(unsubscribeBtn);
		
		//add sub menu
		var subMenu = new SdlCordovaFactory.AddSubMenu();
		subMenu.setCorrelationId(++nextCorrelationId);
		subMenu.setSuccess(function(){
			prependLog("subMenu sent successfully " + subMenu.getCorrelationId());
		});
		subMenu.setError(function(e){
			prependLogError("subMenu send error " + e);
		});
		subMenu.setMenuId(1);
		subMenu.setMenuName("#1 - 1st Level");
		subMenu.setPosition(0);
		//sendRPC(subMenu);
		
		//delete #1 sub menu
		var deleteMenu = new SdlCordovaFactory.DeleteSubMenu();
		deleteMenu.setCorrelationId(++nextCorrelationId);
		deleteMenu.setSuccess(function(){
			prependLog("deleteMenu sent successfully " + deleteMenu.getCorrelationId());
		});
		deleteMenu.setError(function(e){
			prependLogError("deleteMenu send error " + e);
		});
		deleteMenu.setMenuId(subMenu.getMenuId());
		SdlCordovaFactory.onCorrelationId(subMenu.getCorrelationId(), function(){
			sendRPC(deleteMenu);
		});
		sendRPC(subMenu);
		
		//add second sub menu
		var subMenu2 = new SdlCordovaFactory.AddSubMenu();
		subMenu2.setCorrelationId(++nextCorrelationId);
		subMenu2.setSuccess(function(){
			prependLog("subMenu2 sent successfully " + subMenu2.getCorrelationId());
		});
		subMenu2.setError(function(e){
			prependLogError("subMenu2 send error " + e);
		});
		subMenu2.setMenuId(2);
		subMenu2.setMenuName("#2 - 1st Level (First in List)");
		subMenu2.setPosition(0);
		//sendRPC(subMenu2);
		
		//add third sub menu
		var subMenu3 = new SdlCordovaFactory.AddSubMenu();
		subMenu3.setCorrelationId(++nextCorrelationId);
		subMenu3.setSuccess(function(){
			prependLog("subMenu3 sent successfully " + subMenu3.getCorrelationId());
		});
		subMenu3.setError(function(e){
			prependLogError("subMenu3 send error " + e);
		});
		subMenu3.setMenuId(3);
		subMenu3.setMenuName("#3 - 1st Level (First in List)");
		subMenu3.setPosition(0);
		sendRPC(subMenu3);
		
		//add command
		var cmd = new SdlCordovaFactory.AddCommand();
		cmd.setCorrelationId(++nextCorrelationId);
		cmd.setSuccess(function(){
			prependLog("cmd sent successfully " + cmd.getCorrelationId());
		});
		cmd.setError(function(e){
			prependLogError("cmd send error " + e);
		});
		cmd.setCmdId(100);
		cmd.setMenuName("Test Command");
		cmd.setParentMenuId(2);
		SdlCordovaFactory.onCorrelationId(subMenu2.getCorrelationId(), function(){
			sendRPC(cmd);
		});
		sendRPC(subMenu2);
		
		SdlCordovaFactory.onCorrelationId(cmd.getCorrelationId(), function(info){
			prependLog("cmd 1");
			prependLog(info);
		});
		
		//add second command
		var cmd2 = new SdlCordovaFactory.AddCommand();
		cmd2.setCorrelationId(++nextCorrelationId);
		cmd2.setSuccess(function(){
			prependLog("cmd2 sent successfully " + cmd2.getCorrelationId());
		});
		cmd2.setError(function(e){
			prependLogError("cmd2 send error " + e);
		});
		cmd2.setCmdId(101);
		cmd2.setMenuName("Test Command 2 (First in List)");
		//cmd2.setParentMenuId(2);
		//cmd2.setCmdIcon(new SdlCordova.Image("0x62", SdlCordova.names.imagetype_static));
		cmd2.setCmdIcon(new SdlCordova.Image("action.jpg", SdlCordova.names.imagetype_dynamic));
		cmd2.setPosition(0);
		//sendRPC(cmd2);
		
		SdlCordovaFactory.onCorrelationId(cmd2.getCorrelationId(), function(info){
			prependLog("cmd 2");
			prependLog(info);
		});
		
		//delete file
		var deleteFile = new SdlCordovaFactory.DeleteFile();
		deleteFile.setCorrelationId(++nextCorrelationId);
		deleteFile.setSuccess(function(){
			prependLog("deleteFile sent successfully " + deleteFile.getCorrelationId());
		});
		deleteFile.setError(function(e){
			prependLogError("deleteFile send error " + e);
		});
		deleteFile.setSdlFileName("action.jpg");
		
		// list files
		var listFiles = new SdlCordovaFactory.ListFiles();
		listFiles.setCorrelationId(++nextCorrelationId);
		listFiles.setSuccess(function(){
			prependLog("listFiles sent successfully " + listFiles.getCorrelationId());
		});
		listFiles.setError(function(e){
			prependLogError("listFiles send error " + e);
		});
		
		//add putfile
		if(deviceType == "Android"){
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
			function gotFS(fileSystem) {
				fileSystem.root.getFile("action.jpg", null, gotFileEntry, failLocalFile);
			}
		}
		else if(deviceType == "iPhone" || deviceType == "iPad"){
			window.resolveLocalFileSystemURL(cordova.file.applicationDirectory + "www/img/action.jpg", gotFileEntry, failLocalFile);
		}
		else{ //platform not supported
		}

		function gotFileEntry(fileEntry) {
			fileEntry.file(gotFile, failFileEntry);
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
						//var finalstring = evt.target.result.substring(evt.target.result.indexOf(",")+1);
						put.setFileData(evt.target.result);
						SdlCordovaFactory.onCorrelationId(put.getCorrelationId(), function(info){
							prependLog(info);
							//prependLog("send deleteFile");
							//sendRPC(deleteFile);
							//prependLog("send listFiles");
							//sendRPC(listFiles);
							prependLog("send add command 2");
							sendRPC(cmd2);
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
		function failLocalFile(evt){
			console.log("[ERROR]: Fail Local File");
			console.log(evt.target.error.code);
		}
		function failFileEntry(evt){
			console.log("[ERROR]: Fail File Entry");
			console.log(evt.target.error.code);
		}
		
		
		
		//add third command
		var cmd3 = new SdlCordovaFactory.AddCommand();
		cmd3.setCorrelationId(++nextCorrelationId);
		cmd3.setSuccess(function(){
			prependLog("cmd3 sent successfully " + cmd3.getCorrelationId());
		});
		cmd3.setError(function(e){
			prependLogError("cmd3 send error " + e);
		});
		cmd3.setCmdId(102);
		cmd3.setMenuName("Test Command 3");
		cmd3.setCmdIcon(new SdlCordova.Image("0x62", SdlCordova.names.imagetype_static));
		sendRPC(cmd3);
		
		SdlCordovaFactory.onCorrelationId(cmd3.getCorrelationId(), function(info){
			prependLog("cmd 3");
			prependLog(info);
		});
		
		//delete command #3
		var deleteCommand = new SdlCordovaFactory.DeleteCommand();
		deleteCommand.setCorrelationId(++nextCorrelationId);
		deleteCommand.setSuccess(function(){
			prependLog("deleteCommand sent successfully " + deleteCommand.getCorrelationId());
		});
		deleteCommand.setError(function(e){
			prependLogError("deleteCommand send error " + e);
		});
		deleteCommand.setCmdId(cmd3.getCmdId());
		SdlCordovaFactory.onCorrelationId(cmd3.getCorrelationId(), function(){
			sendRPC(deleteCommand);
		});
			
		//choice set
		var choiceSet = new SdlCordovaFactory.CreateInteractionChoiceSet();
		choiceSet.setCorrelationId(++nextCorrelationId);
		choiceSet.setSuccess(function(){
			prependLog("choiceSet sent successfully " + choiceSet.getCorrelationId());
		});
		choiceSet.setError(function(e){
			prependLogError("choiceSet send error " + e);
		});
		choiceSet.setInteractionChoiceSetId(1);
		choiceSet.addChoice(new SdlCordova.Choice(1, "choice 1", ["choice 1"]));
		choiceSet.addChoice(new SdlCordova.Choice(2, "choice 2", ["choice 2"]));
		choiceSet.addChoice(new SdlCordova.Choice(3, "choice 3", ["sandwich", "meatloaf"]));
		sendRPC(choiceSet);
		
		//perform interaction
		var interaction = new SdlCordovaFactory.PerformInteraction();
		interaction.setCorrelationId(++nextCorrelationId);
		interaction.setSuccess(function(){
			prependLog("interaction sent successfully " + interaction.getCorrelationId());
		});
		interaction.setError(function(e){
			prependLogError("interaction send error " + e);
		});
		interaction.setInitialText("This is an interaction");
		interaction.setInteractionChoiceSetIDList(1);
		interaction.setInteractionMode(SdlCordova.names.interactionMode_BOTH);
		//interaction.setHelpPromptTTSWithText("This is the help text");
		interaction.setHelpPromptTTSText("This is the help text");
		interaction.setTTSText("This is the initial text"); //was added for debug, initialPrompt is required?
		//interaction.setTimeoutPromptTTSWithText("Answer timeout");
		interaction.setTimeoutPromptTTSText("Answer timeout");
		interaction.setTimeout(8000);
		//interaction.setInitialTTSWithText("This is a perform interaction");
		interaction.setInitialText("This is a perform interaction");
		//add interaction after choice set
		SdlCordovaFactory.onCorrelationId(choiceSet.getCorrelationId(), function(){
			sendRPC(interaction);
		});
		//send alert after interaction
		SdlCordovaFactory.onCorrelationId(interaction.getCorrelationId(), function(){
			sendRPC(alert);
		});	
		
		SdlCordovaFactory.onChoiceId(3, function(){
			SdlCordovaFactory.onCorrelationId(alert.getCorrelationId(), function(){
				var speak = new SdlCordovaFactory.Speak();
				speak.setCorrelationId(++nextCorrelationId);
				speak.setSuccess(function(){
					prependLog("Easter Egg speak sent successfully " + speak.getCorrelationId());
				});
				speak.setError(function(e){
					prependLogError("Easter Egg speak send error " + e);
				});
				speak.setTTSWithText("beef, its what's for dinner");			
				sendRPC(speak);
			});		
		});
		
		//set global props
		var globalProps = new SdlCordovaFactory.SetGlobalProperties();
		globalProps.setCorrelationId(++nextCorrelationId);
		globalProps.setSuccess(function(){
			prependLog("globalProps sent successfully " + globalProps.getCorrelationId());
		});
		globalProps.setError(function(e){
			prependLogError("globalProps send error " + e);
		});
		//globalProps.setHelpPromptTTSWithText("This is the global help text");
		globalProps.setHelpPromptTTSText("This is the global help text");
		//globalProps.setTimeoutPromptTTSWithText("this is the global timeout text");
		globalProps.setTimeoutPromptTTSText("this is the global timeout text");
		globalProps.setVrHelpTitle("This is global VR help");
		globalProps.addVrHelp(new SdlCordova.VrHelpItem(1, "VR Help Item1", new SdlCordova.Image("0x62", SdlCordova.names.imagetype_static)));
		sendRPC(globalProps);
		
		//reset global props
		var resetGlobalProps = new SdlCordovaFactory.ResetGlobalProperties();
		resetGlobalProps.setCorrelationId(++nextCorrelationId);
		resetGlobalProps.setSuccess(function(){
			prependLog("resetGlobalProps sent successfully " + resetGlobalProps.getCorrelationId());
		});
		resetGlobalProps.setError(function(e){
			prependLogError("resetGlobalProps send error " + e);
		});
		resetGlobalProps.setProperties([SdlCordova.names.HELP_PROMPT, 
		                                SdlCordova.names.TIMEOUT_PROMPT]);
		sendRPC(resetGlobalProps);
		
		//set media clock
		var mediaClock = new SdlCordovaFactory.SetMediaClockTimer();
		mediaClock.setCorrelationId(++nextCorrelationId);
		mediaClock.setSuccess(function(){
			prependLog("mediaClock sent successfully " + mediaClock.getCorrelationId());
		});
		mediaClock.setError(function(e){
			prependLogError("mediaClock send error " + e);
		});
		mediaClock.setTime(9, 15, 5);
		mediaClock.setUpdateMode(SdlCordova.names.updateMode_COUNTDOWN);
		sendRPC(mediaClock);
		
		//Delete choice set
		var deleteChoiceSet = new SdlCordovaFactory.DeleteInteractionChoiceSet();
		deleteChoiceSet.setCorrelationId(++nextCorrelationId);
		deleteChoiceSet.setSuccess(function(){
			prependLog("deleteChoiceSet sent successfully " + deleteChoiceSet.getCorrelationId());
		});
		deleteChoiceSet.setError(function(e){
			prependLogError("deleteChoiceSet send error " + e);
		});
		deleteChoiceSet.setInteractionChoiceSetId(choiceSet.getInteractionChoiceSetId());
		SdlCordovaFactory.onCorrelationId(interaction.getCorrelationId(), function(){
			sendRPC(deleteChoiceSet);
		});
				
		//reset display	
		//testing SdlCordovaFactory having multiple functions for same event
		/* get/set MediaClock is seprecated
		SdlCordovaFactory.onCorrelationId(alert.getCorrelationId(), function(){
			var show = new SdlCordovaFactory.Show();
			show.setMediaClock("     ");
			show.setCorrelationId(++nextCorrelationId);
			show.setSuccess(function(){
				prependLog("show (to clear clock) sent successfully " + show.getCorrelationId());
			});
			show.setError(function(e){
				prependLogError("show (to clear clock) send error " + e);
			});
			sendRPC(show);
		});	*/
		
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