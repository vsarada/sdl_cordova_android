testManager.addTest({
	label: "Callback Rebinding",
	timeout: 5000,
	canRunTest: function(){
		if(!proxyCreated)
			return ["No proxy created"];
	},
	run: function(){
		createProxy(function(){
			prependLog("Rebind success");
			testManager.pass();
		}, function(e){
			prependLog("Rebind success failed: " + e);
			testManager.fail();
		});
	}
});

testManager.addTest({
	label: "Create Two Proxies",
	timeout: 60000,
	canRunTest: function(){
		return null;
	},
	run: function(){
		//close the current connection
		disposeProxy();
		
		var finalNotification = function(){
			var msg = "Select \"Find New Applications\" on Sync and look for app named \"Create Two\". " 
				+ "Press OK when found. Press CANCEL to stop.";
			
			navigator.notification.confirm(msg, function(index){
				disposeProxy();
				if(index == 1)
					testManager.pass();
				else
					testManager.fail();
			});
		};
		
		var createSecondProxy = function(){
			var msg = "Select \"Find New Applications\" on Sync and look for app named \"Create One\". " 
				+ "Press OK when found. Press CANCEL to stop.";
			
			navigator.notification.confirm(msg, function(index){
				disposeProxy();
				if(index == 1){					
					setTimeout(function(){
						testManager.addRPCSendCount();
						SyncProxyAC.createProxy({
							success: function(){
								prependLog("Second Proxy Created");
								testManager.addRPCSendSuccess();
								finalNotification();
								updateProxyStatus(true);
							},
							error: function(e){
								prependLog("Second Proxy failed to created: " + e);
								testManager.addRPCSendError();
								testManager.fail();
								updateProxyStatus(false);
							},
							appName: "Create Two"
						});						
					}, 5000);
				}else{
					testManager.fail();
				}				
			}, "Testing...");
		};
		
		//give it some time
		setTimeout(function(){
			testManager.addRPCSendCount();
			SyncProxyAC.createProxy({
				success: function(){
					prependLog("First Proxy Created");
					testManager.addRPCSendSuccess();
					createSecondProxy();
					updateProxyStatus(true);
				},
				error: function(e){
					prependLog("First Proxy failed to created: " + e);
					testManager.addRPCSendError();
					testManager.fail();
					updateProxyStatus(false);
				},
				appName: "Create One"
			});
		}, 5000);		
	}
});

testManager.addTest({
	label: "Duplicate In-Flight RPC Correlation IDs",
	timeout: 15000,
	canRunTest: function(){
		if(!proxyCreated){
			return ["No proxy created"];
		}
		
		if(!proxyConnected){
			return ["No proxy connection"];
		}
		
		if(hmiLevel != SyncProxyAC.Names.HMILevel.FULL){
			return ["Application must be in HMI Level = FULL"];
		}
		
		return null;
	},
	run: function(){
		var speak1 = new Speak();
		speak1.setCorrelationId(1);
		speak1.setSuccess(function(){
			prependLog("Speak 1 success sent");
		});
		speak1.setError(function(e){
			prependLog("Speak 1 error sent: " + e);
			testManager.fail();
		});
		speak1.setTTSWithText("testing testing testing testing");
		
		var speak2 = new Speak();
		speak2.setCorrelationId(1);
		speak2.setSuccess(function(){
			prependLog("Speak 2 success sent");
		});
		speak2.setError(function(e){
			prependLog("Speak 2 error sent: " + e);
			testManager.fail();
		});
		speak2.setTTSWithText("testing 2 testing 2 testing 2 testing 2");
		
		RequestFactory.onCorrelationId(1, function(info){
			prependLog(info);
			if(info.parameters && info.parameters.success === false){
				if(info.parameters.resultCode == SyncProxyAC.Names.ResultCode.INVALID_ID){
					testManager.pass();
				}else{
					testManager.fail();
				}
			}			
		});
		
		sendRPC(speak1, true);
		sendRPC(speak2, true);
	}
});

testManager.addTest({
	label: "Handle RPC Requests While in HMI None",
	timeout: 5000,
	canRunTest: function(){
		if(!proxyCreated){
			return ["No proxy created"];
		}
		
		if(!proxyConnected){
			return ["No proxy connection"];
		}
		
		if(hmiLevel != SyncProxyAC.Names.HMILevel.NONE){
			return ["Application must be in HMI Level = NONE"];
		}
		
		return null;
	},
	run: function(){
		var show = new Show();
		show.setCorrelationId(++nextCorrelationId);
		show.setSuccess(function(){
			prependLog("Show " + show.getCorrelationId() + " success sent");
		});
		show.setError(function(e){
			prependLog("Show " + show.getCorrelationId() + " error sent: " + e);
			testManager.fail();
		});
		show.setDisplayText("Show", "" + show.getCorrelationId());
		show.setTextAlignment(SyncProxyAC.Names.Alignment.CENTER);
		
		RequestFactory.onCorrelationId(show.getCorrelationId(), function(info){
			if(info.parameters && info.parameters.resultCode == SyncProxyAC.Names.ResultCode.REJECTED){
				testManager.pass();
			}else{
				testManager.fail();
			}			
		});
		
		sendRPC(show, true);
	}
});

testManager.addTest({
	testVariables:{
		stop: false
	},
	initializeTestVars: function(){
		this.testVariables.stop = false;
	},
	label: "Handle Spamming of RPC Requests in HMI None",
	timeout: 30000,
	canRunTest: function(){
		if(!proxyCreated){
			return ["No proxy created"];
		}
		
		if(!proxyConnected){
			return ["No proxy connection"];
		}
		
		if(hmiLevel != SyncProxyAC.Names.HMILevel.NONE){
			return ["Application must be in HMI Level = NONE"];
		}
		
		return null;
	},
	run: function(){
		var id = 1;
		var testVars = this.testVariables;
		function sendNextShow(){
			prependLog("Trying to send show");
			if(testVars.stop){
				prependLog("Stopping test");
				return;
			}
			
			var show = new Show();
			show.setCorrelationId(id++);
			show.setSuccess(function(){
				prependLog("Show " + show.getCorrelationId() + " success sent");
				setTimeout(sendNextShow, 500);
			});
			show.setError(function(e){
				prependLog("Show " + show.getCorrelationId() + " error sent: " + e);				
				if(!testVars.stop){
					testManager.fail();
				}
			});
			show.setDisplayText("Show", "" + show.getCorrelationId());
			show.setTextAlignment(SyncProxyAC.Names.Alignment.CENTER);
			
			RequestFactory.onCorrelationId(show.getCorrelationId(), function(info){
				prependLog(info);
			});
			
			sendRPC(show, true);
		}
		
		SyncProxyAC.onProxyClosed(function(){
			testManager.pass();
			testVars.stop = true;
			SyncProxyAC.unbind(SyncProxyAC.Names.ProxyEvent.ON_PROXY_CLOSED);
		});
		
		sendNextShow();
	},
	stop: function(){
		this.testVariables.stop = true;
	}
});

testManager.addTest({
	testVariables: {
		stop: false
	},
	initializeTestVars: function(){
		this.testVariables.stop = false;
	},
	label: "Handle Spamming of RPC Requests",
	timeout: 60000,
	canRunTest: function(){
		if(!proxyCreated){
			return ["No proxy created"];
		}
		
		if(!proxyConnected){
			return ["No proxy connection"];
		}
		
		if(hmiLevel != SyncProxyAC.Names.HMILevel.FULL){
			return ["Application must be in HMI Level = FULL"];
		}
		
		return null;
	},
	run: function(){
		var testVars = this.testVariables;
		var id = 0, cId = 1;
		function sendNextRPC(){
			if(testVars.stop){
				prependLog("Stopping test");
				return;
			}
			
			var choiceSet = new CreateInteractionChoiceSet();
			choiceSet.setCorrelationId(cId++);
			choiceSet.setSuccess(function(){
				prependLog("choiceSet " + choiceSet.getCorrelationId() + " sent");
				setTimeout(sendNextRPC, 200);
			});
			choiceSet.setError(function(e){
				prependLogError("choiceSet " + choiceSet.getCorrelationId() + " error sent: " + e);
				testManager.fail();
			});
			choiceSet.setInteractionChoiceSetId(id++);
			choiceSet.setChoiceSet(createLargeChoiceSet());
			
			RequestFactory.onCorrelationId(choiceSet.getCorrelationId(), function(info){
				prependLog("recieved " + info.correlationID);
				if(info.parameters){
					if(info.parameters.success === false){
						if(info.parameters.resultCode == SyncProxyAC.Names.ResultCode.TOO_MANY_PENDING_REQUESTS){
							testManager.pass();
							testVars.stop = true;
						}else{
							testManager.fail();
							testVars.stop = true;
						}					
					}//else true, don't care
				}else{
					testManager.fail();
				}				
			});
			
			sendRPC(choiceSet, true);
		}
		
		SyncProxyAC.onProxyClosedOnce(function(){
			RequestFactory.clearCorrelationIdListeners();
			testManager.pass();
			testVars.stop = true;
		});
		
		sendNextRPC();
	},
	stop: function(){
		//set the flag to stop the loop
		this.testVariables.stop = true;
	}
});

testManager.addTest({
	label: "Interaction Based RPC Messages in HMI Background",
	timeout: 5000,
	canRunTest: function(){
		if(!proxyCreated){
			return ["No proxy created"];
		}
		
		if(!proxyConnected){
			return ["No proxy connection"];
		}
		
		if(hmiLevel != SyncProxyAC.Names.HMILevel.BACKGROUND){
			return ["Application must be in HMI Level = BACKGROUND"];
		}
		
		return null;
	},
	run: function(){
		var alert = new Alert();
		alert.setCorrelationId(++nextCorrelationId);
		alert.setSuccess(function(){
			prependLog("Show " + show.getCorrelationId() + " success sent");
		});
		alert.setError(function(e){
			prependLog("Show " + show.getCorrelationId() + " error sent: " + e);
			testManager.fail();
		});
		alert.setAlertText("Alert", "Alert");
		alert.setTTSWithText("This is an Alert");
		
		RequestFactory.onCorrelationId(alert.getCorrelationId(), function(info){
			prependLog(info);
			if(info.parameters && info.parameters.success === false 
					&& info.parameters.resultCode == SyncProxyAC.Names.ResultCode.REJECTED){
				testManager.pass();
			}else{
				testManager.fail();
			}
		});
		
		sendRPC(alert, true);
	}
});

testManager.addTest({
	label: "Sending RPC after Dispose",
	timeout: 10000,
	canRunTest: function(){
		return null;
	},
	run: function(){
		var sendShow = function(){
			var show = new Show();
			show.setCorrelationId(++nextCorrelationId);
			show.setSuccess(function(){
				prependLog("Show " + show.getCorrelationId() + " success sent");
				testManager.fail();
			});
			show.setError(function(e){
				prependLog("Show " + show.getCorrelationId() + " error sent: " + e);
				testManager.pass();
			});
			show.setDisplayText("Show", "" + show.getCorrelationId());
			show.setTextAlignment(SyncProxyAC.Names.Alignment.CENTER);
			
			sendRPC(show);
		};
				
		if(proxyCreated){
			disposeProxy(function(){
				sendShow();
			}, function(){
				testManager.fail();
			});
		}else{
			sendShow();
		}
	}
});

testManager.addTest({
	label: "Sending RPC after Reset",
	timeout: 10000,
	canRunTest: function(){
		if(!proxyCreated){
			return ["Proxy must be created"];
		}
		return null;
	},
	run: function(){
		var success = function(){
			var show = new Show();
			show.setCorrelationId(++nextCorrelationId);
			show.setSuccess(function(){
				prependLog("Show " + show.getCorrelationId() + " success sent");
				testManager.fail();
			});
			show.setError(function(e){
				prependLog("Show " + show.getCorrelationId() + " error sent: " + e);
				testManager.pass();
			});
			show.setDisplayText("Show", "" + show.getCorrelationId());
			show.setTextAlignment(SyncProxyAC.Names.Alignment.CENTER);
			
			sendRPC(show);
		};
		
		var error = function(e){
			prependErrorLog("Error resetting proxy: " + e);
			testManager.fail();
		};

		resetProxy(success, error);
	}
});

testManager.addTest({
	label: "Dispose Proxy before Proxy Creation",
	timeout: 10000,
	canRunTest: function(){
		return null;
	},
	run: function(){
		function callDispose(){
			disposeProxy(function(){
				testManager.fail();
			}, function(e){
				prependLog("Error: " + e);
				testManager.pass();
			});
		}
		
		if(!proxyCreated){
			//not created
			callDispose();
		}else{
			//created
			disposeProxy(function(){
				callDispose();
			}, function(e){
				prependLog("Error: " + e);
				testManager.fail();
			});
		}
	}
});

testManager.addTest({
	label: "Reset Proxy before Proxy Creation",
	timeout: 10000,
	canRunTest: function(){
		return null;
	},
	run: function(){
		function callReset(){
			resetProxy(function(){
				testManager.fail();
			}, function(e){
				prependLog("Error: " + e);
				testManager.pass();				
			});
		}
		
		if(!proxyCreated){
			//not created
			callReset();
		}else{
			//created
			disposeProxy(function(){
				callReset();
			}, function(e){
				callReset();
			});
		}
	}
});

testManager.addTest({
	label: "Call proxy 'getters' before Create",
	timeout: 10000,
	canRunTest: function(){
		return null;
	},
	run: function(){
		var steps = new TestQueue();
		
		var getters = ["getButtonCapabilities", "getDisplayCapabilities", "getHMIZoneCapabilities", 
		               "getSpeechCapabilities", "getSyncMsgVersion", "getVRCapabilities", "getPersistentSyncData"];
		
		for(var i = 0; i < getters.length; i++){
			testManager.addRPCSendCount();
			var methodName = getters[i];
			
			steps.addTest(function(){
				prependLog('calling SyncProxyAC["' + methodName + '"]');
				SyncProxyAC[methodName]({
					success: function(data){
						prependLog(methodName + " did not fail!");
						testManager.addRPCSendSuccess();
						testManager.fail();
					},
					error: function(e){
						prependLog(methodName + " Error: " + e);
						testManager.addRPCSendError();
						if(steps.hasNext())
							steps.next();
						else
							testManager.pass();
					}
				});
			});			
		}
		
		if(!proxyCreated){
			//not created
			steps.start();
		}else{
			//created
			disposeProxy(function(){
				steps.start();
			}, function(e){
				prependLog("Error: " + e);
				testManager.fail();
			});	
		}
	}
});

testManager.addTest({
	label: "Register New Callback Context before Proxy Creation",
	timeout: 10000,
	canRunTest: function(){
		return null;
	},
	run: function(){
		function callRebindCallback(){
			var success = function(){
				testManager.fail();
			};
			
			var error = function(){
				testManager.pass();
			};
			
			cordova.exec(success, error, "SyncProxyAC", SyncProxyAC.Names.Actions.REGISTER_NEW_CALLBACK_CONTEXT, []);
		}
		
		if(!proxyCreated){
			//not created
			callRebindCallback();
		}else{
			//created
			disposeProxy(function(){
				callRebindCallback();
			}, function(e){
				prependLog("Error: " + e);
				testManager.fail();
			});			
		}
	}
});

testManager.addTest({
	label: "Null Correlation ID (Native and JS)",
	timeout: 10000,
	canRunTest: function(){
		if(!proxyCreated){
			return ["No proxy created"];
		}
		
		if(!proxyConnected){
			return ["No proxy connection"];
		}
		
		if(hmiLevel != SyncProxyAC.Names.HMILevel.FULL)
			return ["Application must be HMI = FULL"];
		
		return null;
	},
	run: function(){
		var tests = new TestQueue();		
		
		//test JS
		tests.addTest(function(){
			SyncProxyAC.show(null, {
				success: function(){
					tests.next();
				},
				error: function(e){
					prependLog("Error: " + e);
					testManager.fail();
				},
				mainField1: "Null",
				mainField2: "Correlation ID"
			});
		});
		
		//test native
		tests.addTest(function(){
			// Build the request params
			var rpcRequestParams = {};
			rpcRequestParams[SyncProxyAC.Names.RPCFields.MAIN_FIELD_1] = "Testing";
			rpcRequestParams[SyncProxyAC.Names.RPCFields.MAIN_FIELD_2] = "Show";
		
			// Build the request
			var rpcRequest = {};
			rpcRequest[SyncProxyAC.Names.RPCFields.FUNCTION_NAME] = SyncProxyAC.Names.Functions.SHOW;
			rpcRequest[SyncProxyAC.Names.RPCFields.CORRELATION_ID] = null;
			rpcRequest[SyncProxyAC.Names.RPCFields.PARAMETERS] = rpcRequestParams;
			
			// Build the message
			var rpcMessage = {};
			rpcMessage[SyncProxyAC.Names.RPCFields.MESSAGE_TYPE_REQUEST] = rpcRequest;	
			
			cordova.exec(function(){
				prependLog("RPC sent successfully");
				testManager.pass();
			}, function(e){
				prependLogError("Error: " + e);
				testManager.fail();
			}, "SyncProxyAC", SyncProxyAC.Names.Actions.SEND_RPC_REQUEST, [rpcMessage]);
		});
		
		tests.start();
	}
});

testManager.addTest({
	label: "Undefined Correlation ID (Native and JS)",
	timeout: 10000,
	canRunTest: function(){
		if(!proxyCreated){
			return ["No proxy created"];
		}
		
		if(!proxyConnected){
			return ["No proxy connection"];
		}
		
		if(hmiLevel != SyncProxyAC.Names.HMILevel.FULL)
			return ["Application must be HMI = FULL"];
		
		return null;
	},
	run: function(){
		var tests = new TestQueue();		
		
		//test JS
		tests.addTest(function(){
			SyncProxyAC.show(undefined, {
				success: function(){
					tests.next();					
				},
				error: function(e){
					prependLog("Error: " + e);
					testManager.fail();
				},
				mainField1: "Undefined",
				mainField2: "Correlation ID"
			});
		});

		//test native
		tests.addTest(function(){
			// Build the request params
			var rpcRequestParams = {};
			rpcRequestParams[SyncProxyAC.Names.RPCFields.MAIN_FIELD_1] = "Testing";
			rpcRequestParams[SyncProxyAC.Names.RPCFields.MAIN_FIELD_2] = "Show";
		
			// Build the request
			var rpcRequest = {};
			rpcRequest[SyncProxyAC.Names.RPCFields.FUNCTION_NAME] = SyncProxyAC.Names.Functions.SHOW;
			rpcRequest[SyncProxyAC.Names.RPCFields.CORRELATION_ID] = undefined;
			rpcRequest[SyncProxyAC.Names.RPCFields.PARAMETERS] = rpcRequestParams;
			
			// Build the message
			var rpcMessage = {};
			rpcMessage[SyncProxyAC.Names.RPCFields.MESSAGE_TYPE_REQUEST] = rpcRequest;	
			
			cordova.exec(function(){
				prependLog("RPC sent successfully.");
				testManager.pass();
			}, function(e){
				prependLogError("Error: " + e);
				testManager.fail();
			}, "SyncProxyAC", SyncProxyAC.Names.Actions.SEND_RPC_REQUEST, [rpcMessage]);
		});
		
		tests.start();
	}
});

testManager.addTest({
	label: "Missing Correlation ID",
	timeout: 10000,
	canRunTest: function(){
		if(!proxyCreated){
			return ["No proxy created"];
		}
		
		if(!proxyConnected){
			return ["No proxy connection"];
		}
		
		if(hmiLevel != SyncProxyAC.Names.HMILevel.FULL)
			return ["Application must be HMI = FULL"];
		
		return null;
	},
	run: function(){
		// Build the request params
		var rpcRequestParams = {};
		rpcRequestParams[SyncProxyAC.Names.RPCFields.MAIN_FIELD_1] = "Testing";
		rpcRequestParams[SyncProxyAC.Names.RPCFields.MAIN_FIELD_2] = "Show";
	
		// Build the request
		var rpcRequest = {};
		rpcRequest[SyncProxyAC.Names.RPCFields.FUNCTION_NAME] = SyncProxyAC.Names.Functions.SHOW;
		rpcRequest[SyncProxyAC.Names.RPCFields.PARAMETERS] = rpcRequestParams;
		
		// Build the message
		var rpcMessage = {};
		rpcMessage[SyncProxyAC.Names.RPCFields.MESSAGE_TYPE_REQUEST] = rpcRequest;	
		
		cordova.exec(function(){
			prependLog("RPC sent successfully.");
			testManager.pass();
		}, function(e){
			prependLogError("Error: " + e);
			testManager.fail();
		}, "SyncProxyAC", SyncProxyAC.Names.Actions.SEND_RPC_REQUEST, [rpcMessage]);
	}
});

testManager.addTest({
	label: "Out of Range Correlation ID",
	timeout: 10000,
	canRunTest: function(){
		if(!proxyCreated){
			return ["No proxy created"];
		}
		
		if(!proxyConnected){
			return ["No proxy connection"];
		}
		
		if(hmiLevel != SyncProxyAC.Names.HMILevel.FULL)
			return ["Application must be HMI = FULL"];
		
		return null;
	},
	run: function(){		
		SyncProxyAC.show(543210987654321, {
			success: function(){
				prependLog("RPC sent successfully.");
				testManager.pass();		
			},
			error: function(e){
				prependLog("Error: " + e);
				testManager.fail();
			},
			mainField1: "Out of Range",
			mainField2: "Correlation ID"
		});		
	}
});


testManager.addTest({
	label: "Null Callbacks",
	timeout: 10000,
	canRunTest: function(){
		if(!proxyCreated)
			return ["No Proxy Created"];
		
		return null;
	},
	run: function(){
		try{
			//always success callback
			cordova.exec(null, null, "SyncProxyAC", SyncProxyAC.Names.Actions.GET_PERSISTENT_SYNC_DATA, []);
		}catch(e){
			prependLogError("An Exception was thrown calling 'success' callback!");
			prependLogError(e);
			testManager.fail();
			return;
		}
		
		try{
			//always error callback
			cordova.exec(null, null, "SyncProxyAC", SyncProxyAC.Names.Actions.SEND_RPC_REQUEST, []);			
			testManager.pass();
		}catch(e){
			prependLogError("An Exception was thrown calling 'error' callback!");
			prependLogError(e);
			testManager.fail();
			return;
		}		
	}
});

testManager.addTest({
	testVariables: {
		steps: new TestQueue()
	},
	initializeTestVars: function(){
		this.testVariables.steps = new TestQueue();
	},
	label: "Missing/Null/Undefined App Name",
	timeout: 10000,
	canRunTest: function(){
		return null;
	},
	run: function(){
		var steps = this.testVariables.steps;
		
		//missing appName
		steps.addTest(function(){
			function create(){
				prependLog("missing appName");
				SyncProxyAC.createProxy({
					success: function(){
						updateProxyStatus(true);
						testManager.fail();
					},
					error: function(e){
						prependLog(e);
						steps.next();
					}
				});
			}
			
			if(proxyCreated){
				disposeProxy(function(){
					create();
				}, function(e){
					prependLog(e);
					create();
				});
			}else{
				create();
			}
		});
		
		//null appName
		/*steps.addTest(function(){
			function create(){
				prependLog("null appName");
				SyncProxyAC.createProxy({
					success: function(){
						updateProxyStatus(true);
						testManager.fail();
					},
					error: function(e){
						prependLog(e);
						steps.next();
					},
					appName: null
				});
			}
			
			if(proxyCreated){
				disposeProxy(function(){
					create();
				}, function(e){
					prependLog(e);
					create();
				});
			}else{
				create();
			}
		});*/
		
		//undefined appName
		steps.addTest(function(){
			function create(){
				prependLog("undefined appName");
				SyncProxyAC.createProxy({
					success: function(){
						updateProxyStatus(true);
						testManager.fail();
					},
					error: function(e){
						prependLog(e);
						testManager.pass();
						disposeProxy();
					}
				});
			}
			
			if(proxyCreated){
				disposeProxy(function(){
					create();
				}, function(e){
					prependLog(e);
					create();
				});
			}else{
				create();
			}
		});
		
		if(proxyCreated){
			disposeProxy(function(){
				steps.start();
			}, function(e){
				prependLog("Error disposing Proxy: " + e);
				steps.start();
			});
		}else{
			steps.start();
		}
		
	},
	stop: function(){
		this.testVariables.steps.clearQueue();
	}
});

testManager.addTest({
	testVariables: {
		steps: new TestQueue()
	},
	initializeTestVars: function(){
		this.testVariables.steps = new TestQueue();
	},
	label: "Missing/Null/Undefined isMediaApplication",
	timeout: 10000,
	canRunTest: function(){
		return null;
	},
	run: function(){
		var steps = this.testVariables.steps;
		
		steps.addTest(function(){
			function create(){
				var success = function(){
					prependLogError("Proxy Created. Shouldn't have happened.");
					testManager.fail();
					updateProxyStatus(true);
				};
				
				var error = function(e){
					prependLog(e);
					steps.next();
				};
				
				var opts = {appName: "isMediaApplication Test"};
				cordova.exec(success, error, "SyncProxyAC", SyncProxyAC.Names.Actions.CREATE_PROXY, [opts]);
			}
			
			if(proxyCreated){
				disposeProxy(function(){
					create();
				}, function(e){
					prependLog(e);
					create();
				});
			}else{
				create();
			}
		});
		
		steps.addTest(function(){
			function create(){
				var success = function(){
					prependLogError("Proxy Created. Shouldn't have happened.");
					testManager.fail();
					updateProxyStatus(true);
				};
				
				var error = function(e){
					prependLog(e);
					steps.next();
				};
				
				var opts = {appName: "isMediaApplication Test", isMediaApplication: null};
				cordova.exec(success, error, "SyncProxyAC", SyncProxyAC.Names.Actions.CREATE_PROXY, [opts]);
			}
			
			if(proxyCreated){
				disposeProxy(function(){
					create();
				}, function(e){					
					prependLog(e);
					create();
				});
			}else{
				create();
			}
		});
		
		steps.addTest(function(){
			function create(){
				var success = function(){
					prependLogError("Proxy Created. Shouldn't have happened.");
					testManager.fail();
					updateProxyStatus(true);
				};
				
				var error = function(e){
					prependLog(e);
					testManager.pass();
				};
				
				var opts = {appName: "isMediaApplication Test", isMediaApplication: undefined};
				cordova.exec(success, error, "SyncProxyAC", SyncProxyAC.Names.Actions.CREATE_PROXY, [opts]);
			}
			
			if(proxyCreated){
				disposeProxy(function(){
					create();
				}, function(e){
					prependLog(e);
					create();
				});
			}else{
				create();
			}
		});
		
		steps.start();		
	},
	stop: function(){
		this.testVariables.steps.clearQueue();
	}
});

testManager.addTest({
	label: "Force Create Proxy Twice",
	timeout: 10000,
	canRunTest: function(){
		return null;
	},
	run: function(){
		function create(){
			var opts = {appName: "Twice Test", isMediaApplication: false};
			cordova.exec(function(){
				//success
				prependLog("First proxy created");
				cordova.exec(function(){
					//success
					prependLogError("Second proxy created");
					testManager.fail();
				}, function(e){
					//error
					prependLog("Second proxy NOT created");
					prependLog(e);
					testManager.pass();
				}, "SyncProxyAC", SyncProxyAC.Names.Actions.CREATE_PROXY, [opts]);
			}, function(e){
				//error
				prependLogError("First proxy NOT created: " + e);
				testManager.fail();
			}, "SyncProxyAC", SyncProxyAC.Names.Actions.CREATE_PROXY, [opts]);
		}		
		
		SyncProxyAC.dispose();
		updateProxyStatus(false);
		
		if(proxyCreated){
			disposeProxy(function(){
				create();
			}, function(e){
				prependLog(e);
				testManager.fail();
			});
		}else{
			create();
		}
	}
});

testManager.addTest({
	label: "Calling an Action that does not exist in the native code",
	timeout: 10000,
	canRunTest: function(){
		return null;
	},
	run: function(){
		cordova.exec(function(){
			testManager.fail();
		}, function(e){
			prependLog(e);
			testManager.pass();
		}, "SyncProxyAC", "thisdoesnotexist", []);
	}
});

testManager.addTest({
	label: "Invalid Parameter Array",
	timeout: 10000,
	canRunTest: function(){
		if(!proxyCreated){
			return ["No Proxy Created!"];
		}
		return null;
	},
	run: function(){
		var steps = new TestQueue();
		
		//multiple parameters
		steps.addTest(function(){
			cordova.exec(function(){
				testManager.fail();
			}, function(e){
				prependLog(e);
				steps.next();
			}, "SyncProxyAC", SyncProxyAC.Names.Actions.SEND_RPC_REQUEST, [true, {}, "sadfasdfas"]);
		});
		
		//one parameter, invalid type
		steps.addTest(function(){
			cordova.exec(function(){
				testManager.fail();
			}, function(e){
				prependLog(e);
				steps.next();
			}, "SyncProxyAC", SyncProxyAC.Names.Actions.SEND_RPC_REQUEST, [true]);
		});
		
		//one parameter, invalid object, send rpc
		steps.addTest(function(){
			cordova.exec(function(){
				testManager.pass();	
			}, function(e){
				prependLogError(e);
				testManager.fail();				
			}, "SyncProxyAC", SyncProxyAC.Names.Actions.SEND_RPC_REQUEST, [{}]);
		});
				
		steps.start();
	}
});

testManager.addTest({
	label: "Null Correlation ID for Persistent RPC",
	timeout: 10000,
	canRunTest: function(){
		if(!proxyCreated){
			return ["No proxy created"];
		}
		
		if(!proxyConnected){
			return ["No proxy connection"];
		}
		
		if(hmiLevel != SyncProxyAC.Names.HMILevel.FULL)
			return ["Application must be HMI = FULL"];
		
		return null;
	},
	run: function(){
		// Build the request params
		var rpcRequestParams = {};
		rpcRequestParams[SyncProxyAC.Names.RPCFields.CMD_ID] = 1;
		rpcRequestParams[SyncProxyAC.Names.RPCFields.MENU_NAME] = "Test Command";
	
		// Build the request
		var rpcRequest = {};
		rpcRequest[SyncProxyAC.Names.RPCFields.FUNCTION_NAME] = SyncProxyAC.Names.Functions.ADD_COMMAND;
		rpcRequest[SyncProxyAC.Names.RPCFields.CORRELATION_ID] = null;
		rpcRequest[SyncProxyAC.Names.RPCFields.PARAMETERS] = rpcRequestParams;
		
		// Build the message
		var rpcMessage = {};
		rpcMessage[SyncProxyAC.Names.RPCFields.MESSAGE_TYPE_REQUEST] = rpcRequest;	
		
		cordova.exec(function(){
			prependLog("RPC sent successfully.");
			testManager.pass();
		}, function(e){
			prependLogError("Error: " + e);
			testManager.fail();
		}, "SyncProxyAC", SyncProxyAC.Names.Actions.SEND_RPC_REQUEST, [rpcMessage]);
	}
});


testManager.addTest({
	testVariables: {
		appName: "NGN Test",
		ngnMediaScreenAppName: "NGNT",
		vrSynonyms: ["NGN Test", "NGN Tester"],
		languageDesired: "EN_US"
	},
	label: "Ensure NGN Compatibility",
	canRunTest: function(){
		return null;
	},
	run: function(){
		var testVars = this.testVariables;
		function checkDisplayNotification(){					
			var msg = "Select 'Find New Application' on the module and opt into the app with name '" 
				+ testVars.appName + "'.  Check to make sure that the NGN Media Screen App Name is"
				+ " displayed as '" + testVars.ngnMediaScreenAppName + "' and the VR Synonyms '" 
				+ testVars.vrSynonyms.join("', '") + "' work";   
			navigator.notification.confirm(msg, function(index){
				if(index == 1){					
					testManager.pass();
					disposeProxy();
				}else{
					testManager.fail();
					disposeProxy();
				}
			});
		}
		
		function create(){
			var opts = {
				success: function(){
					prependLog("Proxy Created!");
					checkDisplayNotification();
				},
				error: function(e){
					prependLogError("Failed to create proxy: " + e);
					testManager.fail();
				},
				appName: testVars.appName,
				isMediaApplication: true,
				ngnMediaScreenAppName: testVars.ngnMediaScreenAppName,
				vrSynonyms: testVars.vrSynonyms,
				languageDesired: testVars.languageDesired,
				autoActivateID: 10001
			};
			prependLog(opts);
			SyncProxyAC.createProxy(opts);
		}
		
		disposeProxy(create, create);
	}
});