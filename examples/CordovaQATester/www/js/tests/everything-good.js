testManager.addTest({
	label: "Happy Path",
	canRunTest: function(){
		if(!proxyCreated)
			return ["No proxy created"];
		
		if(!proxyConnected)
			return ["No proxy connection"];
		
		if(!initialized)
			return ["Proxy not opt'ed in"];
		
		if(hmiLevel != "FULL") { //SyncProxyAC.Names.HMILevel.FULL){
			return ["Application must be in HMI Level = FULL"];
		}
		
		return null;
	},
	timeout: 900000, //added one zero for debugging
	run: function(){
		//testing proxy getters
		SyncProxyAC.getButtonCapabilities({
			success: function(data){
				prependLog("getButtonCapabilities response success");
				prependLog(data);
				
				if(!data){
					prependLog("Invalid data from getButtonCapabilities");
					testManager.fail();
				}
			},
			fail: function(e){
				prependLogError("getButtonCapabilities response error: " + e);
				testManager.fail();
			}
		});
		
		SyncProxyAC.getDisplayCapabilities({
			success: function(data){
				prependLog("getDisplayCapabilities response success");
				prependLog(data);
				
				if(!data){
					prependLog("Invalid data from getDisplayCapabilities");
					testManager.fail();
				}
			},
			fail: function(e){
				prependLogError("getDisplayCapabilities response error: " + e);
				testManager.fail();
			}
		});
		
		SyncProxyAC.getHMIZoneCapabilities({
			success: function(data){
				prependLog("getHMIZoneCapabilities response success");
				prependLog(data);
				
				if(!data){
					prependLog("Invalid data from getHMIZoneCapabilities");
					testManager.fail();
				}
			},
			fail: function(e){
				prependLogError("getHMIZoneCapabilities response error: " + e);
				testManager.fail();
			}
		});
		
		SyncProxyAC.getSpeechCapabilities({
			success: function(data){
				prependLog("getSpeechCapabilities response success");
				prependLog(data);
				
				if(!data){
					prependLog("Invalid data from getSpeechCapabilities");
					testManager.fail();
				}
			},
			fail: function(e){
				prependLogError("getSpeechCapabilities response error: " + e);
				testManager.fail();
			}
		});
		
		SyncProxyAC.getSyncMsgVersion({
			success: function(data){
				prependLog("getSyncMsgVersion response success");
				prependLog(data);
				
				if(!data){
					prependLog("Invalid data from getSyncMsgVersion");
					testManager.fail();
				}
			},
			fail: function(e){
				prependLogError("getSyncMsgVersion response error: " + e);
				testManager.fail();
			}
		});
		
		SyncProxyAC.getVRCapabilities({
			success: function(data){
				prependLog("getVRCapabilities response success");
				prependLog(data);
				
				if(!data){
					prependLog("Invalid data from getVRCapabilities");
					testManager.fail();
				}
			},
			fail: function(e){
				prependLogError("getVRCapabilities response error: " + e);
				testManager.fail();
			}
		});
		
		SyncProxyAC.getPersistentSyncData({
			success: function(data){
				prependLog("getPersistentSyncData response success");
				prependLog(data);
				
				if(!data){
					prependLog("Invalid data from getPersistentSyncData");
					testManager.fail();
				}
			},
			fail: function(e){
				prependLogError("getPersistentSyncData response error: " + e);
				testManager.fail();
			}
		});
		
		//Alert
		var alert = new SyncProxyFactory.Alert();
		alert.setCorrelationId(++nextCorrelationId);
		alert.setSuccess(function(){
			prependLog("alert sent successfully " + alert.getCorrelationId());
		});
		alert.setError(function(e){
			prependLogError("alert send error " + e);
		});
		
		alert.setAlertText("Test", "Complete");
		alert.setPlayTone(true);
		//alert.setTTSWithText("Test Complete");
		alert.setTTSText("Test Complete");
		alert.setDuration(8000);
		
		//Show
		var show = new SyncProxyFactory.Show();
		show.setCorrelationId(++nextCorrelationId);
		show.setSuccess(function(){
			prependLog("show sent successfully " + show.getCorrelationId());
		});
		show.setError(function(e){
			prependLogError("show send error" + e);
		});		
		show.setDisplayText("Testing in", "Progress");
		show.setTextAlignment(SyncProxyAC.names.alignment_left);
		//show.setMediaClock(" 1:12"); Deprecated
		sendRPC(show);
		
		//Speak
		var speak = new SyncProxyFactory.Speak();
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
		var subscribeBtn = new SyncProxyFactory.SubscribeButton();
		subscribeBtn.setCorrelationId(++nextCorrelationId);
		subscribeBtn.setSuccess(function(){
			prependLog("subscribeBtn sent successfully " + subscribeBtn.getCorrelationId());
		});
		subscribeBtn.setError(function(e){
			prependLogError("subscribeBtn send error " + e);
		});		
		subscribeBtn.setButtonName(SyncProxyAC.names.buttonName_OK);
		sendRPC(subscribeBtn);
		
		//Subscribe a second button
		var subscribeBtn2 = new SyncProxyFactory.SubscribeButton();
		subscribeBtn2.setCorrelationId(++nextCorrelationId);
		subscribeBtn2.setSuccess(function(){
			prependLog("subscribeBtn2 sent successfully " + subscribeBtn2.getCorrelationId());
		});
		subscribeBtn2.setError(function(e){
			prependLogError("subscribeBtn2 send error " + e);
		});
		subscribeBtn2.setButtonName(SyncProxyAC.names.buttonName_SEEKLEFT);
		sendRPC(subscribeBtn2);
		
		//unsubscribe button 
		var unsubscribeBtn = new SyncProxyFactory.UnsubscribeButton();
		unsubscribeBtn.setCorrelationId(++nextCorrelationId);
		unsubscribeBtn.setSuccess(function(){
			prependLog("unsubscribeBtn sent successfully " + unsubscribeBtn.getCorrelationId());
		});
		unsubscribeBtn.setError(function(e){
			prependLogError("unsubscribeBtn send error " + e);
		});
		unsubscribeBtn.setButtonName(SyncProxyAC.names.buttonName_SEEKLEFT);
		sendRPC(unsubscribeBtn);
		
		//add sub menu
		var subMenu = new SyncProxyFactory.AddSubMenu();
		subMenu.setCorrelationId(++nextCorrelationId);
		subMenu.setSuccess(function(){
			prependLog("subMenu sent successfully " + subMenu.getCorrelationId());
		});
		subMenu.setError(function(e){
			prependLogError("subMenu send error " + e);
		});
		subMenu.setMenuId(10);
		subMenu.setMenuName("#1 - 1st Level");
		//subMenu.setPosition(0);
		sendRPC(subMenu);
		
		//delete #1 sub menu
		var deleteMenu = new SyncProxyFactory.DeleteSubMenu();
		deleteMenu.setCorrelationId(++nextCorrelationId);
		deleteMenu.setSuccess(function(){
			prependLog("deleteMenu sent successfully " + deleteMenu.getCorrelationId());
		});
		deleteMenu.setError(function(e){
			prependLogError("deleteMenu send error " + e);
		});
		deleteMenu.setMenuId(subMenu.getMenuId());
		SyncProxyFactory.onCorrelationId(subMenu.getCorrelationId(), function(){
			sendRPC(deleteMenu);
		});
		//sendRPC(subMenu);
		
		//add second sub menu
		var subMenu2 = new SyncProxyFactory.AddSubMenu();
		subMenu2.setCorrelationId(++nextCorrelationId);
		subMenu2.setSuccess(function(){
			prependLog("subMenu2 sent successfully " + subMenu2.getCorrelationId());
		});
		subMenu2.setError(function(e){
			prependLogError("subMenu2 send error " + e);
		});
		subMenu2.setMenuId(20);
		subMenu2.setMenuName("#2 - 1st Level (First in List)");
		subMenu2.setPosition(0);
		sendRPC(subMenu2);
		
		//add third sub menu
		var subMenu3 = new SyncProxyFactory.AddSubMenu();
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
		var cmd = new SyncProxyFactory.AddCommand();
		cmd.setCorrelationId(++nextCorrelationId);
		cmd.setSuccess(function(){
			prependLog("cmd sent successfully " + cmd.getCorrelationId());
		});
		cmd.setError(function(e){
			prependLogError("cmd send error " + e);
		});
		cmd.setCmdId(100);
		cmd.setMenuName("Test Command");
		cmd.setParentMenuId(20);
		sendRPC(cmd);
		
		SyncProxyFactory.onCorrelationId(cmd.getCorrelationId(), function(info){
			prependLog("cmd 1");
			prependLog(info);
		});
		
		//add second command
		var cmd2 = new SyncProxyFactory.AddCommand();
		cmd2.setCorrelationId(++nextCorrelationId);
		cmd2.setSuccess(function(){
			prependLog("cmd2 sent successfully " + cmd2.getCorrelationId());
		});
		cmd2.setError(function(e){
			prependLogError("cmd2 send error " + e);
		});
		cmd2.setCmdId(101);
		cmd2.setMenuName("Test Command 2 (First in List)");
		cmd2.setParentMenuId(20);
		cmd2.setPosition(0);
		sendRPC(cmd2);
		
		SyncProxyFactory.onCorrelationId(cmd2.getCorrelationId(), function(info){
			prependLog("cmd 2");
			prependLog(info);
		});
		
		//add third command
		var cmd3 = new SyncProxyFactory.AddCommand();
		cmd3.setCorrelationId(++nextCorrelationId);
		cmd3.setSuccess(function(){
			prependLog("cmd3 sent successfully " + cmd3.getCorrelationId());
		});
		cmd3.setError(function(e){
			prependLogError("cmd3 send error " + e);
		});
		cmd3.setCmdId(102);
		cmd3.setMenuName("Test Command 3");
		sendRPC(cmd3);
		
		SyncProxyFactory.onCorrelationId(cmd3.getCorrelationId(), function(info){
			prependLog("cmd 3");
			prependLog(info);
		});
		
		//delete command #3
		var deleteCommand = new SyncProxyFactory.DeleteCommand();
		deleteCommand.setCorrelationId(++nextCorrelationId);
		deleteCommand.setSuccess(function(){
			prependLog("deleteCommand sent successfully " + deleteCommand.getCorrelationId());
		});
		deleteCommand.setError(function(e){
			prependLogError("deleteCommand send error " + e);
		});
		deleteCommand.setCmdId(cmd3.getCmdId());
		SyncProxyFactory.onCorrelationId(cmd3.getCorrelationId(), function(){
			sendRPC(deleteCommand);
		});
			
		//choice set
		var choiceSet = new SyncProxyFactory.CreateInteractionChoiceSet();
		choiceSet.setCorrelationId(++nextCorrelationId);
		choiceSet.setSuccess(function(){
			prependLog("choiceSet sent successfully " + choiceSet.getCorrelationId());
		});
		choiceSet.setError(function(e){
			prependLogError("choiceSet send error " + e);
		});
		choiceSet.setInteractionChoiceSetId(1);
		choiceSet.addChoice(new SyncProxyAC.Choice(1, "choice 1", ["choice 1"]));
		choiceSet.addChoice(new SyncProxyAC.Choice(2, "choice 2", ["choice 2"]));
		choiceSet.addChoice(new SyncProxyAC.Choice(3, "choice 3", ["sandwich", "meatloaf"]));
		sendRPC(choiceSet);
		
		//perform interaction
		var interaction = new SyncProxyFactory.PerformInteraction();
		interaction.setCorrelationId(++nextCorrelationId);
		interaction.setSuccess(function(){
			prependLog("interaction sent successfully " + interaction.getCorrelationId());
		});
		interaction.setError(function(e){
			prependLogError("interaction send error " + e);
		});
		interaction.setInitialText("This is an interaction");
		interaction.setInteractionChoiceSetIDList(1);
		interaction.setInteractionMode(SyncProxyAC.names.interactionMode_BOTH);
		//interaction.setHelpPromptTTSWithText("This is the help text");
		interaction.setHelpPromptTTSText("This is the help text");
		interaction.setTTSText("This is the initial text"); //was added for debug, initialPrompt is required?
		//interaction.setTimeoutPromptTTSWithText("Answer timeout");
		interaction.setTimeoutPromptTTSText("Answer timeout");
		interaction.setTimeout(8000);
		//interaction.setInitialTTSWithText("This is a perform interaction");
		interaction.setInitialText("This is a perform interaction");
		//add interaction after choice set
		SyncProxyFactory.onCorrelationId(choiceSet.getCorrelationId(), function(){
			sendRPC(interaction);
		});
		//send alert after interaction
		SyncProxyFactory.onCorrelationId(interaction.getCorrelationId(), function(){
			sendRPC(alert);
		});	
		
		SyncProxyFactory.onChoiceId(3, function(){
			SyncProxyFactory.onCorrelationId(alert.getCorrelationId(), function(){
				var speak = new SyncProxyFactory.Speak();
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
		var globalProps = new SyncProxyFactory.SetGlobalProperties();
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
		sendRPC(globalProps);
		
		//reset global props
		var resetGlobalProps = new SyncProxyFactory.ResetGlobalProperties();
		resetGlobalProps.setCorrelationId(++nextCorrelationId);
		resetGlobalProps.setSuccess(function(){
			prependLog("resetGlobalProps sent successfully " + resetGlobalProps.getCorrelationId());
		});
		resetGlobalProps.setError(function(e){
			prependLogError("resetGlobalProps send error " + e);
		});
		resetGlobalProps.setProperties([SyncProxyAC.names.HELP_PROMPT, 
		                                SyncProxyAC.names.TIMEOUT_PROMPT]);
		sendRPC(resetGlobalProps);
		
		//set media clock
		var mediaClock = new SyncProxyFactory.SetMediaClockTimer();
		mediaClock.setCorrelationId(++nextCorrelationId);
		mediaClock.setSuccess(function(){
			prependLog("mediaClock sent successfully " + mediaClock.getCorrelationId());
		});
		mediaClock.setError(function(e){
			prependLogError("mediaClock send error " + e);
		});
		mediaClock.setTime(9, 15, 5);
		mediaClock.setUpdateMode(SyncProxyAC.names.updateMode_COUNTDOWN);
		sendRPC(mediaClock);
		
		//Delete choice set
		var deleteChoiceSet = new SyncProxyFactory.DeleteInteractionChoiceSet();
		deleteChoiceSet.setCorrelationId(++nextCorrelationId);
		deleteChoiceSet.setSuccess(function(){
			prependLog("deleteChoiceSet sent successfully " + deleteChoiceSet.getCorrelationId());
		});
		deleteChoiceSet.setError(function(e){
			prependLogError("deleteChoiceSet send error " + e);
		});
		deleteChoiceSet.setInteractionChoiceSetId(choiceSet.getInteractionChoiceSetId());
		SyncProxyFactory.onCorrelationId(interaction.getCorrelationId(), function(){
			sendRPC(deleteChoiceSet);
		});
				
		//reset display	
		//testing SyncProxyFactory having multiple functions for same event
		/* get/set MediaClock is seprecated
		SyncProxyFactory.onCorrelationId(alert.getCorrelationId(), function(){
			var show = new SyncProxyFactory.Show();
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
		
		SyncProxyFactory.onCorrelationId(alert.getCorrelationId(), function(){
			var show2 = new SyncProxyFactory.Show();
			show2.setCorrelationId(++nextCorrelationId);
			show2.setSuccess(function(){
				prependLog("show2 sent successfully " + show2.getCorrelationId());
			});
			show2.setError(function(e){
				prependLogError("show2 send error " + e);
			});			
			show2.setDisplayText("Test", "Complete");
			show2.setTextAlignment(SyncProxyAC.names.alignment_center);		
			sendRPC(show2);
			
			testManager.pass();
		});
	}
});