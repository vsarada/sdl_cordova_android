function QATestManager(){
	var $this = this;
	
	var tests = {};
	var select = null;
	var labelBuffer = [];
	var finished = false;
	var testTimeout = null;
	var currentTest = null;
	
	/**
	 * @param test Function
	 */
	this.addTest = function(test){
		//console.log("addTest");
		if(test && test.label && test.run){
			tests[test.label] = test;
			
			if(select){
				var options = select.children();
				if(options.length == 0){
					select.append('<option value="' + test.label + '">' + test.label + '</option>');
				}else{
					//find alphabetical position
					var prevOpt;
					while((prevOpt = options.next())){
						if(prevOpt.attr("value") < test.label){
							break;
						}
					}
					prevOpt.after('<option value="' + test.label + '">' + test.label + '</option>');
				}
				
			}else{
				//save the label to be added when the onDomReady event is fired
				labelBuffer.push(test.label);
			}			
		}else{
			console.log("testManager.addTest() Invalid parameters");
		}
	};
	
	/**
	 * @param label String
	 */
	this.removeTest = function(label){
		delete tests[label];
		
		if(select)
			select.remove("option[value=" + label +"]");
	};
	
	/**
	 * @param label String
	 */
	this.runTest = function(label){
		if(label && tests[label]){
			cleanUp(this.runTestAfterCleanup, [label]);
		}else{
			console.log("test does not exist!!");
		}
	};
	
	this.runTestAfterCleanup = function(label){
		console.log("runTestAfterCleanup");
		if(label && tests[label]){
			prependLog("Starting test: " + label);
			
			currentTest = tests[label];
			var errors = currentTest.canRunTest ? currentTest.canRunTest() : null;
			if(errors && errors.length > 0){
				prependLogError("Cannot start test '" + label + "' for reason(s): " + errors.join(", "));
				this.fail();
				return;
			}
			
			//initialize test variables if function is there
			if(typeof currentTest.initializeTestVars == "function"){
				currentTest.initializeTestVars();
			}
			
			$("#testStatus").html("Running...");
			$("#startTestBtn, #tests").attr("disabled", true);
			$("#forceStopBtn").attr("disabled", false);
			finished = false;
			
			if(!isNaN(currentTest.timeout) && currentTest.timeout > 0){
				testTimeout = setTimeout(function(){
					if(!finished){
						$this.stopTest();
						prependLogError("Test Timed out!! Something went really wrong.");
					}
				}, currentTest.timeout);
			}
			
			try{
				currentTest.run();
			}catch(e){
				//catching the exception to fail the test then passing it on to the caught by the browser
				prependLog("Test through an exception!");
				prependLog(e);
				this.fail();
				throw e;
			}	
						
		}else{
			console.log("test does not exist!!");
		}
	};
	
	this.stopTest = function(){
		if(!finished){
			this.fail();
		}
		
		if(currentTest && typeof currentTest.stop == "function")
			currentTest.stop();
	};
	
	this.onDomReady = function(){
		prependLog("QATestManager.onDomReady()");
		select = $("#tests");
		if(labelBuffer.length > 0){
			//labels have been added to the buffer and now can be added to the tests select
			//because the onDomReady event has been called
			labelBuffer = labelBuffer.sort();
			for(var i = 0; i < labelBuffer.length; i++){
				select.append('<option value="' + labelBuffer[i] + '">' + labelBuffer[i] + '</option>');
			}
		}
	};
	
	this.addRPCSendCount = function(){
		rpcCount++;
		$("#rpcCount").html(rpcCount);
	};
	
	this.addRPCSendSuccess = function(){
		rpcSendSuccessCount++;
		$("#rpcSendSuccessCount").html(rpcSendSuccessCount);
	};
	
	this.addRPCSendError = function(){
		rpcSendErrorCount++;
		$("#rpcSendErrorCount").html(rpcSendErrorCount);
	};
	
	this.addRPCResponseCount = function(){
		responseCount++;
		$("#rpcResponseCount").html(responseCount);
	};
	
	this.addRPCResponseError = function(){
		responseErrorCount++;
		$("#rpcErrorCount").html(responseErrorCount);
	};
	
	this.pass = function(){
		prependLog("Test Passed");
		$("#testStatus").html('PASS');
		cleanUpTest();
	};
	
	this.fail = function(){
		prependLogError("Test Failed");
		$("#testStatus").html('<span class="red">FAIL</span>');
		cleanUpTest();
	};
	
	function cleanUpTest(){
		if(testTimeout != null){
			clearTimeout(testTimeout);
			testTimeout = null;
		}
		
		finished = true;
		
		$this.stopTest();
		
		currentTest = null;
		
		$("#startTestBtn, #tests").attr("disabled", false);
		$("#forceStopBtn").attr("disabled", true);
	}
}

/**
 * @param opts Object {tests: Array} 
 */
function TestQueue(opts){
	var tests = opts && opts.tests instanceof Array ? opts.tests : [];
	
	this.start = function(){
		prependLog("starting tests");
		if(tests.length > 0){
			prependLog("Starting first test");
			var t = tests.shift();
			t();
		}else{
			prependLog("No tests!");
		}
	};
	
	this.next = function(){
		prependLog("next test");
		var t = tests.shift();
		if(t){
			t();
		}else{
			prependLog("No more tests!");
		}
	};
	
	/**
	 * @param test Function
	 */
	this.addTest = function(test){
		if(typeof test == "function")
			tests.push(test);
		else
			prependLog("'test' parameter must be a function");
	};
	
	this.hasNext = function(){
		return tests.length > 0;
	};
	
	this.clearQueue = function(){
		tests = [];
	};
};