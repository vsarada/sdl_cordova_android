testManager.addTest({
	testVariables: {
		testSteps: new TestQueue()
	},
	label: "Bad RPC Requests",
	timeout: 30000,
	canRunTest: function(){
		if(!initialized)
			return ["Proxy not initialized"];
		
		if(hmiLevel != "FULL"){//SyncProxyAC.Names.HMILevel.FULL){
			return ["Application must be in HMI Level = FULL"];
		}
		
		return null;
	},
	stop: function(){
		this.testVariables.testSteps.clearQueue();
	},
	run: function(){
		var steps = this.testVariables.testSteps;
		var doneSending = false;
		//var atLeastOneFailed = false;
		
		var onCorrelationIdResponse = function(info){
			testManager.addRPCResponseCount();	
			if(info.parameters && info.parameters.success === false){
				prependLog(info.name + " " + info.correlationID + " response error");
				testManager.addRPCResponseError();
				steps.next();
				
				//check that all RPCs from this test have been sent and the number of
				//sent RPCs equals the number of RPC responses
				prependLog(doneSending + " && " + rpcCount + " == " + responseCount);
				if(doneSending && rpcSendSuccessCount == responseCount){
					testManager.pass();
				}
			}else{
				prependLog(info.name + " " + info.correlationID + " response success");				
				testManager.fail();
			}
		};
		
		var correlationId;
		nextCorrelationId = 0;
		/**
		 * Add Command:
		 * Invalid command Id
		 */
		steps.addTest(function(){
			correlationId = ++nextCorrelationId;
			SyncProxyFactory.onCorrelationId(correlationId, onCorrelationIdResponse);
			SyncProxyAC.addCommand(correlationId, {
				success: function(){
					prependLog("Add Command " + correlationId + " success sent");
					testManager.addRPCSendSuccess();
				},
				error: function(){
					prependLog("Add Command " + correlationId + " error sent");
					testManager.addRPCSendError();
					testManager.fail();
				},
				cmdID: -1,
				menuName: "Bad Command ID",
				vrCommands: ["Bad Command ID"]
			});
			rpcCount++;
		});
		
		/**
		 * Add Sub Menu:
		 * Invalid menuID
		 */
		steps.addTest(function(){
			correlationId = ++nextCorrelationId;
			SyncProxyFactory.onCorrelationId(correlationId, onCorrelationIdResponse);
			SyncProxyAC.addSubMenu(correlationId, {
				success: function(){
					prependLog("Add Sub Menu " + correlationId + " success sent");
					testManager.addRPCSendSuccess();
				},
				error: function(){
					prependLog("Add Sub Menu " + correlationId + " error sent");
					testManager.addRPCSendError();
					testManager.fail();
				},
				menuID: -1,
				menuName: "Test Menu"
			});
			rpcCount++;
		});
		
		/**
		 * Alert:
		 * Invalid duration
		 * No playTone
		 * No alertText2
		 */
		steps.addTest(function(){
			correlationId = ++nextCorrelationId;
			SyncProxyFactory.onCorrelationId(correlationId, onCorrelationIdResponse);
			SyncProxyAC.alert(correlationId, {
				success: function(){
					prependLog("Alert " + correlationId + " success sent");
					testManager.addRPCSendSuccess();
				},
				error: function(){
					prependLog("Alert " + correlationId + " error sent");
					testManager.addRPCSendError();
					testManager.fail();
				},
				ttsText: "This is an alert message",
				alertText1: "Alert Message",
				duration: 11000
			});
			rpcCount++;
		});
		
		/**
		 * Create Interaction Choice Set:
		 * Invalid interaction choice set ID
		 * valid choice set
		 */
		steps.addTest(function(){
			correlationId = ++nextCorrelationId;
			SyncProxyFactory.onCorrelationId(correlationId, onCorrelationIdResponse);
			SyncProxyAC.createInteractionChoiceSet(correlationId, {
				success: function(){
					prependLog("Create Interaction Choice Set " + correlationId + " success sent");
					testManager.addRPCSendSuccess();
				},
				error: function(){
					prependLog("Create Interaction Choice Set " + correlationId + " error sent");
					testManager.addRPCSendError();
					testManager.fail();
				},
				interactionChoiceSetID: -1,
				choiceSet: [new Choice(1, "Choice 1", ["Choice 1"])]
			});
			rpcCount++;
		});
		
		/**
		 * Delete Command:
		 * invalid cmdID
		 */
		steps.addTest(function(){
			correlationId = ++nextCorrelationId;
			SyncProxyFactory.onCorrelationId(correlationId, onCorrelationIdResponse);
			SyncProxyAC.deleteCommand(correlationId, {
				success: function(){
					prependLog("Delete Command Choice Set " + correlationId + " success sent");
					testManager.addRPCSendSuccess();
				},
				error: function(){
					prependLog("Delete Command Choice Set " + correlationId + " error sent");
					testManager.addRPCSendError();
					testManager.fail();
				},
				cmdID: -1
			});
			rpcCount++;
		});
		
		/**
		 * Delete Interaction Choice Set:
		 * invalid interactionChoiceSetID
		 */
		steps.addTest(function(){
			correlationId = ++nextCorrelationId;
			SyncProxyFactory.onCorrelationId(correlationId, onCorrelationIdResponse);
			SyncProxyAC.deleteInteractionChoiceSet(correlationId, {
				success: function(){
					prependLog("Delete Interaction Choice Set " + correlationId + " success sent");
					testManager.addRPCSendSuccess();
				},
				error: function(){
					prependLog("Delete Interaction Choice Set " + correlationId + " error sent");
					testManager.addRPCSendError();
					testManager.fail();
				},
				interactionChoiceSetID: -1
			});
			rpcCount++;
		});
		
		/**
		 * Delete Sub Menu:
		 * invalid menuID
		 */
		steps.addTest(function(){
			correlationId = ++nextCorrelationId;
			SyncProxyFactory.onCorrelationId(correlationId, onCorrelationIdResponse);
			SyncProxyAC.deleteSubMenu(correlationId, {
				success: function(){
					prependLog("Delete Sub Menu " + correlationId + " success sent");
					testManager.addRPCSendSuccess();
				},
				error: function(){
					prependLog("Delete Sub Menu " + correlationId + " error sent");
					testManager.addRPCSendError();
					testManager.fail();
				},
				menuID: -1
			});
			rpcCount++;
		});
		
		/**
		 * Encoded SyncP Data:
		 * empty data array
		 */
		steps.addTest(function(){
			correlationId = ++nextCorrelationId;
			SyncProxyFactory.onCorrelationId(correlationId, onCorrelationIdResponse);
			SyncProxyAC.encodedSyncPData(correlationId, {
				success: function(){
					prependLog("Encoded SyncP Data " + correlationId + " success sent");
					testManager.addRPCSendSuccess();
				},
				error: function(){
					prependLog("Encoded SyncP Data " + correlationId + " error sent");
					testManager.addRPCSendError();
					testManager.fail();
				},
				data: []
			});
			rpcCount++;
		});
		
		/**
		 * Perform Interaction:
		 * invalid interaction choice set id
		 * no timeout prompt
		 * no help prompt
		 */
		steps.addTest(function(){
			correlationId = ++nextCorrelationId;
			SyncProxyFactory.onCorrelationId(correlationId, onCorrelationIdResponse);
			SyncProxyAC.performInteraction(correlationId, {
				success: function(){
					prependLog("Perform Interaction " + correlationId + " success sent");
					testManager.addRPCSendSuccess();
				},
				error: function(){
					prependLog("Perform Interaction " + correlationId + " error sent");
					testManager.addRPCSendError();
					testManager.fail();
				},
				interactionChoiceSetIDList: [100],
				initialText: "Perform Interaction",
				initialTTSText: "Perform Interaction"
			});
			rpcCount++;
		});
		
		/**
		 * Reset Global Properties:
		 * empty properties array
		 */
		steps.addTest(function(){
			correlationId = ++nextCorrelationId;
			SyncProxyFactory.onCorrelationId(correlationId, onCorrelationIdResponse);
			SyncProxyAC.resetGlobalProperties(correlationId, {
				success: function(){
					prependLog("Reset Global Properties " + correlationId + " success sent");
					testManager.addRPCSendSuccess();
				},
				error: function(){
					prependLog("Reset Global Properties " + correlationId + " error sent");
					testManager.addRPCSendError();
					testManager.fail();
				},
				properties: []
			});
			rpcCount++;
		});
		
		/**
		 * Set Global Properties:
		 * empty properties array
		 */
		steps.addTest(function(){
			correlationId = ++nextCorrelationId;
			SyncProxyFactory.onCorrelationId(correlationId, onCorrelationIdResponse);
			SyncProxyAC.setGlobalProperties(correlationId, {
				success: function(){
					prependLog("Reset Global Properties " + correlationId + " success sent");
					testManager.addRPCSendSuccess();
				},
				error: function(){
					prependLog("Reset Global Properties " + correlationId + " error sent");
					testManager.addRPCSendError();
					testManager.fail();
				},
				properties: []
			});
			rpcCount++;
		});
		
		/**
		 * Set Media Clock Timer:
		 * bad hours value
		 */
		steps.addTest(function(){
			correlationId = ++nextCorrelationId;
			SyncProxyFactory.onCorrelationId(correlationId, onCorrelationIdResponse);
			SyncProxyAC.setMediaClockTimer(correlationId, {
				success: function(){
					prependLog("Set Media Clock Timer " + correlationId + " success sent");
					testManager.addRPCSendSuccess();
				},
				error: function(){
					prependLog("Set Media Clock Timer " + correlationId + " error sent");
					testManager.addRPCSendError();
					testManager.fail();
				},
				hours: -1,
				minutes: 0,
				seconds: 0,
				updateMode: SyncProxyAC.Names.UpdateMode.PAUSE
			});
			rpcCount++;
		});
		
		/**
		 * Speak:
		 * empty tts chunks array
		 */
		steps.addTest(function(){
			correlationId = ++nextCorrelationId;
			SyncProxyFactory.onCorrelationId(correlationId, onCorrelationIdResponse);
			SyncProxyAC.speak(correlationId, {
				success: function(){
					prependLog("Speak Text " + correlationId + " success sent");
					testManager.addRPCSendSuccess();
				},
				error: function(){
					prependLog("Speak Text " + correlationId + " error sent");
					testManager.addRPCSendError();
					testManager.fail();
				},
				ttsChunks: []
			});
			rpcCount++;
		});
		
		/**
		 * Subscribe Button:
		 * no button name
		 */
		steps.addTest(function(){
			correlationId = ++nextCorrelationId;
			SyncProxyFactory.onCorrelationId(correlationId, onCorrelationIdResponse);
			SyncProxyAC.subscribeButton(correlationId, {
				success: function(){
					prependLog("Subscribe Button " + correlationId + " success sent");
					testManager.addRPCSendSuccess();
				},
				error: function(){
					prependLog("Subscribe Button " + correlationId + " error sent");
					testManager.addRPCSendError();
					testManager.fail();
				}
			});
			rpcCount++;
		});
		
		/**
		 * Unsubscribe Button:
		 * no button name
		 */
		steps.addTest(function(){
			doneSending = true;
			correlationId = ++nextCorrelationId;			
			SyncProxyFactory.onCorrelationId(correlationId, onCorrelationIdResponse);
			SyncProxyAC.unsubscribeButton(correlationId, {
				success: function(){
					prependLog("Unsubscribe Button " + correlationId + " success sent");
					testManager.addRPCSendSuccess();
				},
				error: function(){
					prependLog("Unsubscribe Button " + correlationId + " error sent");
					testManager.addRPCSendError();
					testManager.fail();
				}
			});
			rpcCount++;
		});
		
		steps.start();
	}
});