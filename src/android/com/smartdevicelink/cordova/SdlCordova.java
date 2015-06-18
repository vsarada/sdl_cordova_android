package com.smartdevicelink.cordova;

import java.util.Hashtable;
import java.util.Vector;
import java.util.List;
import java.util.Arrays;
import java.io.UnsupportedEncodingException;


// Pre Cordova 3.0 Imports
//import org.apache.cordova.api.CallbackContext;
//import org.apache.cordova.api.CordovaPlugin;
//import org.apache.cordova.api.PluginResult;

//Post Cordova 3.0 Imports
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.PluginResult;

// Generic Cordova Import
//import org.apache.cordova.*;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.app.Activity;
import android.content.Context;
import android.util.Base64;
import android.util.Log;
import android.util.SparseArray;

import com.smartdevicelink.cordova.artifacts.PersistentSdlData;
import com.smartdevicelink.cordova.constants.Actions;
import com.smartdevicelink.cordova.constants.CordovaParameters;
import com.smartdevicelink.cordova.constants.LogStrings;
import com.smartdevicelink.cordova.constants.ProxyEvents;
import com.smartdevicelink.cordova.utils.JSONtoJavaClassConverter;
import com.smartdevicelink.exception.SdlException;
import com.smartdevicelink.marshal.JsonRPCMarshaller;
import com.smartdevicelink.proxy.RPCMessage;
import com.smartdevicelink.proxy.RPCRequest;
import com.smartdevicelink.proxy.RPCResponse;
import com.smartdevicelink.proxy.SdlProxyALM;
import com.smartdevicelink.proxy.constants.Names;
import com.smartdevicelink.proxy.interfaces.IProxyListenerALM;
import com.smartdevicelink.proxy.rpc.AddCommand;
import com.smartdevicelink.proxy.rpc.AddCommandResponse;
import com.smartdevicelink.proxy.rpc.AddSubMenu;
import com.smartdevicelink.proxy.rpc.AddSubMenuResponse;
//import com.smartdevicelink.proxy.rpc.AlertManeuverResponse; 
import com.smartdevicelink.proxy.rpc.AlertResponse;
import com.smartdevicelink.proxy.rpc.ButtonCapabilities;
import com.smartdevicelink.proxy.rpc.ChangeRegistrationResponse;
import com.smartdevicelink.proxy.rpc.CreateInteractionChoiceSet;
import com.smartdevicelink.proxy.rpc.CreateInteractionChoiceSetResponse;
import com.smartdevicelink.proxy.rpc.DeleteCommand;
import com.smartdevicelink.proxy.rpc.DeleteCommandResponse;
import com.smartdevicelink.proxy.rpc.DeleteFileResponse;
import com.smartdevicelink.proxy.rpc.DeleteInteractionChoiceSet;
import com.smartdevicelink.proxy.rpc.DeleteInteractionChoiceSetResponse;
import com.smartdevicelink.proxy.rpc.DeleteSubMenu;
import com.smartdevicelink.proxy.rpc.DeleteSubMenuResponse;
//import com.smartdevicelink.proxy.rpc.DialNumberResponse;  //removed for gen3
import com.smartdevicelink.proxy.rpc.DiagnosticMessageResponse; //added import
import com.smartdevicelink.proxy.rpc.DisplayCapabilities;
import com.smartdevicelink.proxy.rpc.EndAudioPassThruResponse;
import com.smartdevicelink.proxy.rpc.GenericResponse;
import com.smartdevicelink.proxy.rpc.GetDTCsResponse;
import com.smartdevicelink.proxy.rpc.GetVehicleDataResponse;
import com.smartdevicelink.proxy.rpc.ListFilesResponse;
import com.smartdevicelink.proxy.rpc.OnAudioPassThru;
import com.smartdevicelink.proxy.rpc.OnButtonEvent;
import com.smartdevicelink.proxy.rpc.OnButtonPress;
import com.smartdevicelink.proxy.rpc.OnCommand;
import com.smartdevicelink.proxy.rpc.OnDriverDistraction;
//import com.smartdevicelink.proxy.rpc.OnEncodedSyncPData;  //removed for gen3
import com.smartdevicelink.proxy.rpc.OnHMIStatus;
import com.smartdevicelink.proxy.rpc.OnHashChange; //added to gen3
import com.smartdevicelink.proxy.rpc.OnKeyboardInput; //added to gen3
import com.smartdevicelink.proxy.rpc.OnLanguageChange;
import com.smartdevicelink.proxy.rpc.OnLockScreenStatus;
//import com.smartdevicelink.proxy.rpc.OnLockScreenStatus; //removed for gen3
import com.smartdevicelink.proxy.rpc.OnPermissionsChange;
import com.smartdevicelink.proxy.rpc.OnSystemRequest;
import com.smartdevicelink.proxy.rpc.OnTBTClientState;
import com.smartdevicelink.proxy.rpc.OnTouchEvent; //added for gen3
import com.smartdevicelink.proxy.rpc.OnVehicleData;
import com.smartdevicelink.proxy.rpc.PerformAudioPassThruResponse;
import com.smartdevicelink.proxy.rpc.PerformInteractionResponse;
import com.smartdevicelink.proxy.rpc.PutFileResponse;
import com.smartdevicelink.proxy.rpc.ReadDIDResponse;
import com.smartdevicelink.proxy.rpc.ResetGlobalPropertiesResponse;
import com.smartdevicelink.proxy.rpc.ScrollableMessageResponse;
import com.smartdevicelink.proxy.rpc.SetAppIconResponse;
import com.smartdevicelink.proxy.rpc.SetDisplayLayoutResponse;
import com.smartdevicelink.proxy.rpc.SetGlobalPropertiesResponse;
import com.smartdevicelink.proxy.rpc.SetMediaClockTimerResponse;
//import com.smartdevicelink.proxy.rpc.ShowConstantTbtResponse; 
import com.smartdevicelink.proxy.rpc.ShowResponse;
import com.smartdevicelink.proxy.rpc.SliderResponse;
import com.smartdevicelink.proxy.rpc.SpeakResponse;
import com.smartdevicelink.proxy.rpc.SubscribeButton;
import com.smartdevicelink.proxy.rpc.SubscribeButtonResponse;
import com.smartdevicelink.proxy.rpc.SubscribeVehicleDataResponse;
import com.smartdevicelink.proxy.rpc.SdlMsgVersion;
import com.smartdevicelink.proxy.rpc.SystemRequestResponse;
import com.smartdevicelink.proxy.rpc.UnsubscribeButton;
import com.smartdevicelink.proxy.rpc.UnsubscribeButtonResponse;
import com.smartdevicelink.proxy.rpc.UnsubscribeVehicleDataResponse;
//import com.smartdevicelink.proxy.rpc.UpdateTurnListResponse; 
import com.smartdevicelink.proxy.rpc.SendLocationResponse; //added
import com.smartdevicelink.proxy.rpc.DialNumberResponse; //added
import com.smartdevicelink.proxy.rpc.StreamRPCResponse; //added
import com.smartdevicelink.proxy.rpc.OnStreamRPC; //added
import com.smartdevicelink.proxy.rpc.enums.HMILevel;
import com.smartdevicelink.proxy.rpc.enums.HmiZoneCapabilities;
import com.smartdevicelink.proxy.rpc.enums.Language;
import com.smartdevicelink.proxy.rpc.enums.SpeechCapabilities;
import com.smartdevicelink.proxy.rpc.enums.SdlDisconnectedReason;
import com.smartdevicelink.proxy.rpc.enums.VrCapabilities;
import com.smartdevicelink.transport.SiphonServer;
import com.smartdevicelink.util.DebugTool; 



public class SdlCordova extends CordovaPlugin {

	private static final String logTag = SdlCordova.class.getSimpleName();

	// JavaScript iProxyListener CallbackContext (set by "createProxy")
	private static CallbackContext iProxyListenerCallbackContext = null;

	// SdlProxy
	private static SdlProxyALM sdlProxy = null;
	private static OnHMIStatus currentHMIStatusNotification = null;
	private static PersistentSdlData persistentSdlData = new PersistentSdlData();
	private static boolean haveRecievedFirstNonNoneHMI = false;

	// Pending Proxies
	private static SparseArray<RPCRequest> pendingRPCRequests = new SparseArray<RPCRequest>();

	/**
	 * Executes the request.
	 * 
	 * This method is called from the WebView thread. To do a non-trivial amount
	 * of work, use: cordova.getThreadPool().execute(runnable);
	 * 
	 * To run on the UI thread, use:
	 * cordova.getActivity().runOnUiThread(runnable);
	 * 
	 * @param action
	 *            The action to execute.
	 * @param args
	 *            The exec() arguments.
	 * @param callbackContext
	 *            The callback context used when calling back into JavaScript.
	 * @return Whether the action was valid.
	 */
	@Override
	public boolean execute(String action, JSONArray args,
			CallbackContext callbackContext) throws JSONException {
		/** CORE METHODS **/
		try {
			Log.i("Message", "Execute Function Running");
			Actions actionNew = Actions.valueForString(action);
			// Handle the case where action string was not found
			if (actionNew == null) {
				actionNew = Actions.ACTION_NOT_FOUND;
			}

			switch (actionNew) {
			case sendRpcRequest:
				sendRPCRequest(args, callbackContext);
				return true;
			case createProxy:
				createProxy(args, callbackContext);
				return true;
			case registerNewCallbackContext:
				registerNewListener(callbackContext);
				return true;
			case doesProxyExist:
				doesProxyExist(callbackContext);
				return true;
			case getPersistentSdlData:
				getPersistentSdlData(callbackContext);
				return true;
			case dispose:
				dispose(callbackContext);
				return true;
			case reset:
				reset(callbackContext);
				return true;

				/** END CORE METHODS **/
			case getButtonCapabilities:
				getButtonCapabilities(callbackContext);
				return true;
			case getDisplayCapabilities:
				getDisplayCapabilities(callbackContext);
				return true;
			case getHmiDisplayLanguage:
				getHmiDisplayLanguage(callbackContext);
				return true;
			case getHmiZoneCapabilities:
				getHmiZoneCapabilities(callbackContext);
				return true;
			case getPresetBankCapabilities:
				getPresetBankCapabilities(callbackContext);
				return true;
			case getSoftButtonCapabilities:
				getSoftButtonCapabilities(callbackContext);
				return true;
			case getSpeechCapabilities:
				getSpeechCapabilities(callbackContext);
				return true;
			case getSdlLanguage:
				getSdlLanguage(callbackContext);
				return true;
			case getSdlMsgVersion:
				getSdlMsgVersion(callbackContext);
				return true;
			case getVehicleType:
				getVehicleType(callbackContext);
				return true;
			case getVrCapabilities:
				getVrCapabilities(callbackContext);
				return true;
			case getWiproVersion:
				getWiProVersion(callbackContext);
				return true;
			case enableSiphonDebug:
				enableSiphonDebug();
				return true;
			case disableSiphonDebug:
				disableSiphonDebug();
				return true;
			case siphonLog:
				siphonLog(args, callbackContext);
				return true;
			/*case putFile:
				putFile(args, callbackContext);*/
			default:
				// Could not determine type of request
				String errorString = "The action string, " + action
						+ " is not a recognized action string.";
				if (callbackContext != null) {
					callbackContext.error(errorString);
				} else {
					Log.e(logTag, LogStrings.callbackContextMissing);
					Log.e(logTag, errorString);
				}
			}
		} catch (Exception e) {
			Log.e(logTag, "Uncaught exception when calling execute in Java.", e);
		}

		return false;
	}

	private static void resetLifecycleVariables() {
		// Clear all lifecycle data
		currentHMIStatusNotification = null;
		persistentSdlData = new PersistentSdlData();
		haveRecievedFirstNonNoneHMI = false;
	}

	/***** Start RPC Command Helpers *****/

	private void createProxy(JSONArray args, CallbackContext callbackContext) {
		// CallbackContext must be valid
		Log.i("msg", "Entering create proxy");
		if (callbackContext == null) {
			Log.e(logTag, "CallbackContext is null. This action "
					+ Actions.createProxy.name()
					+ " cannot be called without a valid CallbackContext.");
			return;
		}
		Log.i("Message", "Reaches the create proxy java function");
		// Store the callback context to be used as the iProxyListener
		iProxyListenerCallbackContext = callbackContext;

		// Send error if proxy already created
		if (sdlProxy != null) {
			String errorString = "SdlProxy already created. Use "
					+ Actions.registerNewCallbackContext.name()
					+ " to attach another listener.";
			callbackContext.sendPluginResult(createRegisterListenerResponse(
					PluginResult.Status.ERROR, errorString));
			return;
		}

		String argsFormat = "{" + Names.appName + ": String, "
				+ Names.isMediaApplication + ": boolean, (Optional)"
				+ Names.ngnMediaScreenAppName + ": String, (Optional)"
				+ Names.sdlMsgVersion + ": SdlMsgVersionObject, (Optional)"
				+ Names.languageDesired + ": String, (Optional)"
				+ Names.autoActivateID + ": String}";

		// Arguments defaults
		String appName = null;
		boolean isMediaApp = false;
		// New
		String ngnMediaScreenAppName = null;
		Vector<String> vrSynonyms = null;
		SdlMsgVersion sdlMsgVersion = null;
		Language languageDesired = null;
		String autoActivateID = null;
		// Future
		Language hmiLanguageDesired = null;
		String appId = null; // V2 - null until V2
		// TransportType transportType = null; // V2
		// BaseTransportConfig transportConfig = null; // V2

		// Get args from array
		try {
			if (args == null || args.length() != 1) {
				throw new JSONException("Not all arguments were present.");
			}

			JSONObject argumentsObject = args.getJSONObject(0);

			// Required parameters
			appName = argumentsObject.getString(CordovaParameters.appName);
			isMediaApp = argumentsObject
					.getBoolean(CordovaParameters.isMediaApplication);
			languageDesired = Language.valueOf(argumentsObject
					.getString(CordovaParameters.languageDesired));
			hmiLanguageDesired = Language.valueOf(argumentsObject
					.getString(CordovaParameters.hmiLanguageDesired));
			appId = argumentsObject.getString(CordovaParameters.appId);
			
			// Optional parameters
			if (argumentsObject.has(CordovaParameters.ngnMediaScreenAppName)) {
				ngnMediaScreenAppName = argumentsObject
						.getString(CordovaParameters.ngnMediaScreenAppName);
			}
			if (argumentsObject.has(CordovaParameters.vrSynonyms)) {
				vrSynonyms = JSONtoJavaClassConverter
						.jsonArrayOfStringsToVectorOfStrings(argumentsObject
								.getJSONArray(CordovaParameters.vrSynonyms));
			}
			if (argumentsObject.has(CordovaParameters.sdlMsgVersion)) {
				JSONObject sdlMsgVersionJSON = argumentsObject
						.getJSONObject(CordovaParameters.sdlMsgVersion);

				sdlMsgVersion = new SdlMsgVersion();
				if (sdlMsgVersionJSON.has(CordovaParameters.majorVersion)) {
					sdlMsgVersion.setMajorVersion(sdlMsgVersionJSON
							.getInt(CordovaParameters.majorVersion));
					Log.i("SdlVersion",String.valueOf(sdlMsgVersionJSON
							.getInt(CordovaParameters.majorVersion)));
				}
				if (sdlMsgVersionJSON.has(CordovaParameters.minorVersion)) {
					sdlMsgVersion.setMinorVersion(sdlMsgVersionJSON
							.getInt(CordovaParameters.minorVersion));
				}
			}
			if (argumentsObject.has(CordovaParameters.language)) {
				String languageDesiredString = argumentsObject
						.getString(CordovaParameters.language);
				if (languageDesiredString != null) {
					languageDesired = Language
							.valueForString(languageDesiredString);
				}
			}
			if (argumentsObject.has(CordovaParameters.autoActivateID)) {
				autoActivateID = argumentsObject
						.getString(CordovaParameters.autoActivateID);
			}
		} catch (JSONException e) {
			String errorString = Actions.createProxy.name()
					+ " args not in correct format. Format = " + argsFormat
					+ ". " + e.getMessage();
			callbackContext.sendPluginResult(createRegisterListenerResponse(
					PluginResult.Status.ERROR, errorString));
			return;
		}

		try {
			Log.i("Message", "Trying to create SdlProxy with appname:"
					+ appName + " isMediaApp: " + isMediaApp
					+ " languageDesired: " + languageDesired
					+ " hmiLanguageDesired: " + hmiLanguageDesired + " appID: "
					+ appId);
			
			// Create SdlProxy with minimal parameters..
			sdlProxy = new SdlProxyALM(proxyListener, appName, ngnMediaScreenAppName, vrSynonyms, isMediaApp, sdlMsgVersion,
					languageDesired, hmiLanguageDesired, appId, autoActivateID);
			
		} catch (SdlException e) {
			String errorString = Actions.createProxy.name()
					+ " could not create SdlProxyALM. " + e.getMessage();
			Log.e("ProxyStatusMessage", errorString);
			callbackContext.sendPluginResult(createRegisterListenerResponse(
					PluginResult.Status.ERROR, errorString));
			return;
		}

		// Keep the callbackContext alive since the callbackContext will be used
		// for all iProxyListener callbacks
		String infoString = "Proxy created successfully.";
		Log.i("ProxyStatusMessage", infoString);
		callbackContext.sendPluginResult(createRegisterListenerResponse(
				PluginResult.Status.OK, infoString));
	}

	private static void registerNewListener(CallbackContext callbackContext) {
		// CallbackContext must be valid
		if (callbackContext == null) {
			Log.e(logTag, "CallbackContext is null. This action "
					+ Actions.registerNewCallbackContext.name()
					+ " cannot be called without a valid CallbackContext.");
			return;
		}

		if (sdlProxy == null) {
			String errorString = "Could not execute command, "
					+ Actions.registerNewCallbackContext.name()
					+ ". No SdlProxy object has been instanciated. Call "
					+ Actions.createProxy.name() + " first.";
			callbackContext.sendPluginResult(createRegisterListenerResponse(
					PluginResult.Status.ERROR, errorString));
			return;
		}

		// Store the callback context to be used as the iProxyListener
		iProxyListenerCallbackContext = callbackContext;

		// Keep the callbackContext alive since the callbackContext will be used
		// for all iProxyListener callbacks
		String infoString = "Callback registered successfully.";
		callbackContext.sendPluginResult(createRegisterListenerResponse(
				PluginResult.Status.OK, infoString));

		// Send current HMIStatus to new iProxyListenerCallbackContext
		if (currentHMIStatusNotification != null && proxyListener != null) {
			proxyListener.onOnHMIStatus(currentHMIStatusNotification);
		}
	}

	// Get the persistent data on Sdl
	private static void getPersistentSdlData(CallbackContext callbackContext) {

		// CallbackContext must be valid
		if (callbackContext == null) {
			Log.e(logTag, "CallbackContext is null. This action "
					+ Actions.getPersistentSdlData.name()
					+ " cannot be called without a valid CallbackContext.");
			return;
		}

		if (sdlProxy == null) {
			String errorString = "Could not execute command, "
					+ Actions.getPersistentSdlData.name()
					+ ". No SdlProxy object has been instanciated. Call "
					+ Actions.createProxy.name() + " first.";
			callbackContext.error(errorString);
			return;
		}

		if (persistentSdlData == null) {
			String errorString = "persistentSdlData is null. Cannot retrieve persistentSdlData";
			callbackContext.error(errorString);
			return;
		}

		JSONObject persistentSdlDataJSON = new JSONObject();
		try {
			persistentSdlDataJSON = persistentSdlData.toJSONObject();
		} catch (JSONException e) {
			callbackContext
					.error("persistentSdlData is in incorrect format. Could not retrieve.");
			return;
		}
		callbackContext.success(persistentSdlDataJSON);
	}

	private static void doesProxyExist(CallbackContext callbackContext) {

		// CallbackContext must be valid
		if (callbackContext == null) {
			Log.e(logTag, "CallbackContext is null. This action "
					+ Actions.doesProxyExist.name()
					+ " cannot be called without a valid CallbackContext.");
			return;
		}

		boolean doesProxyExist = sdlProxy != null;

		// Format the answer
		JSONObject jsonReturnArgs = new JSONObject();
		try {
			jsonReturnArgs.put(CordovaParameters.PROXY_EXISTS, doesProxyExist);
		} catch (JSONException e) {
			String errorString = Actions.doesProxyExist.name()
					+ " could not convert value to JSON. " + e.getMessage();
			callbackContext.error(errorString);
			return;
		}

		callbackContext.success(jsonReturnArgs);
	}

	// FIXME Remove before production, only used for browser
	public static boolean shouldDisposeProxy() {
		return (sdlProxy != null);
	}

	// Must do extra checking as this is a public static method
	// FIXME this should not be static in production code, only static for the
	// AppLink Web Browser
	public static void dispose(CallbackContext callbackContext) {
		if (sdlProxy == null) {
			String errorString = "Could not execute command, "
					+ Actions.dispose.name()
					+ ". No SdlProxy object has been instanciated. Call "
					+ Actions.createProxy.name() + " first.";

			if (callbackContext != null) {
				callbackContext.error(errorString);
			} else {
				Log.e(logTag, LogStrings.callbackContextMissing);
				Log.w(logTag, errorString);
			}

			return;
		}

		try {
			sdlProxy.dispose();
			sdlProxy = null;

			// Clear all lifecycle data
			resetLifecycleVariables();
		} catch (SdlException e) {
			// on error, set SdlProxy to null
			sdlProxy = null;

			// Clear all lifecycle data
			resetLifecycleVariables();

			String errorString = Actions.dispose.name()
					+ " could not complete. " + e.getMessage();
			if (callbackContext != null) {
				callbackContext.error(errorString);
			} else {
				Log.e(logTag, LogStrings.callbackContextMissing);
				Log.e(logTag, errorString, e);
			}
			return;
		}

		// Send successful callback
		if (callbackContext != null) {
			callbackContext.success();
		}
	}

	private static void reset(CallbackContext callbackContext) {

		if (sdlProxy == null) {
			String errorString = "Could not execute command, "
					+ Actions.reset.name()
					+ ". No SdlProxy object has been instanciated. Call "
					+ Actions.createProxy.name() + " first.";
			if (callbackContext != null) {
				callbackContext.error(errorString);
			} else {
				Log.e(logTag, LogStrings.callbackContextMissing);
				Log.e(logTag, errorString);
			}
			return;
		}

		try {
			sdlProxy.resetProxy();

			// Clear all lifecycle data
			resetLifecycleVariables();
		} catch (SdlException e) {
			// Clear all lifecycle data
			resetLifecycleVariables();

			String errorString = Actions.reset.name() + " could not complete. "
					+ e.getMessage();
			if (callbackContext != null) {
				callbackContext.error(errorString);
			} else {
				Log.e(logTag, LogStrings.callbackContextMissing);
				Log.e(logTag, errorString, e);
			}
			return;
		}

		// Send successful callback
		if (callbackContext != null) {
			callbackContext.success();
		}
	}

	private static void getButtonCapabilities(CallbackContext callbackContext) {

		// CallbackContext must be valid
		if (callbackContext == null) {
			Log.e(logTag, "CallbackContext is null. This action "
					+ Actions.getButtonCapabilities.name()
					+ " cannot be called without a valid CallbackContext.");
			return;
		}

		if (sdlProxy == null) {
			String errorString = "Could not execute command, "
					+ Actions.getButtonCapabilities.name()
					+ ". No SdlProxy object has been instanciated. Call "
					+ Actions.createProxy.name() + " first.";
			callbackContext.error(errorString);
			return;
		}

		JSONArray buttonCapabilitiesJSON = new JSONArray();

		try {
			// Get the ButtonCapabilities Vector
			List<ButtonCapabilities> buttonCapabilitiesList = sdlProxy
					.getButtonCapabilities();

			if (buttonCapabilitiesList == null) {
				String errorString = "No value returned by call: "
						+ Actions.getButtonCapabilities.name();
				callbackContext.error(errorString);
				return;
			} else {
				for (ButtonCapabilities buttonCapabilities : buttonCapabilitiesList) {
					buttonCapabilitiesJSON.put(buttonCapabilities
							.serializeJSON());
				}
			}
		} catch (SdlException e) {
			String errorString = Actions.getButtonCapabilities.name()
					+ " could not complete. " + e.getMessage();
			callbackContext.error(errorString);
			return;
		} catch (JSONException e) {
			String errorString = Actions.getButtonCapabilities.name()
					+ " could not complete. " + e.getMessage();
			callbackContext.error(errorString);
			return;
		}

		callbackContext.success(buttonCapabilitiesJSON);
	}

	private static void getDisplayCapabilities(CallbackContext callbackContext) {
		// CallbackContext must be valid
		if (callbackContext == null) {
			Log.e(logTag, "CallbackContext is null. This action "
					+ Actions.getDisplayCapabilities.name()
					+ " cannot be called without a valid CallbackContext.");
			return;
		}

		if (sdlProxy == null) {
			String errorString = "Could not execute command, "
					+ Actions.getDisplayCapabilities.name()
					+ ". No SdlProxy object has been instanciated. Call "
					+ Actions.createProxy.name() + " first.";
			callbackContext.error(errorString);
			return;
		}

		JSONObject displayCapabilitiesJSON = new JSONObject();

		try {
			// Get the ButtonCapabilities Vector
			DisplayCapabilities displayCapabilities = sdlProxy
					.getDisplayCapabilities();

			if (displayCapabilities == null) {
				String errorString = "No value returned by call: "
						+ Actions.getDisplayCapabilities.name();
				callbackContext.error(errorString);
				return;
			} else {
				displayCapabilitiesJSON = displayCapabilities.serializeJSON();
			}
		} catch (SdlException e) {
			String errorString = Actions.getDisplayCapabilities.name()
					+ " could not complete. " + e.getMessage();
			callbackContext.error(errorString);
			return;
		} catch (JSONException e) {
			String errorString = Actions.getDisplayCapabilities.name()
					+ " could not complete. " + e.getMessage();
			callbackContext.error(errorString);
			return;
		}

		callbackContext.success(displayCapabilitiesJSON);
	}

	private static void getHmiDisplayLanguage(CallbackContext callbackContext) {
		// Currently unsupported, will be implemented in AppLink V2

		// CallbackContext must be valid
		if (callbackContext == null) {
			Log.e(logTag, "CallbackContext is null. This action "
					+ Actions.getHmiDisplayLanguage.name()
					+ " cannot be called without a valid CallbackContext.");
			return;
		}

		String errorString = Actions.getHmiDisplayLanguage.name()
				+ " method currently unsupported.";
		callbackContext.error(errorString);
	}

	private static void getHmiZoneCapabilities(CallbackContext callbackContext) {

		// CallbackContext must be valid
		if (callbackContext == null) {
			Log.e(logTag, "CallbackContext is null. This action "
					+ Actions.getHmiZoneCapabilities.name()
					+ " cannot be called without a valid CallbackContext.");
			return;
		}

		if (sdlProxy == null) {
			String errorString = "Could not execute command, "
					+ Actions.getHmiZoneCapabilities.name()
					+ ". No SdlProxy object has been instanciated. Call "
					+ Actions.createProxy.name() + " first.";
			callbackContext.error(errorString);
			return;
		}

		JSONArray hmiZoneCapabilitiesJSONArray = new JSONArray();

		try {
			// Get the ButtonCapabilities Vector
			List<HmiZoneCapabilities> hmiZoneCapabilitiesList = sdlProxy
					.getHmiZoneCapabilities();

			if (hmiZoneCapabilitiesList == null) {
				String errorString = "No value returned by call: "
						+ Actions.getHmiZoneCapabilities.name();
				callbackContext.error(errorString);
				return;
			} else {
				for (HmiZoneCapabilities hmiZoneCapabilities : hmiZoneCapabilitiesList) {
					hmiZoneCapabilitiesJSONArray.put(hmiZoneCapabilities
							.toString());
				}
			}
		} catch (SdlException e) {
			String errorString = Actions.getHmiZoneCapabilities.name()
					+ " could not complete. " + e.getMessage();
			callbackContext.error(errorString);
			return;
		}

		callbackContext.success(hmiZoneCapabilitiesJSONArray);
	}

	private static void getPresetBankCapabilities(
			CallbackContext callbackContext) {
		// Currently unsupported, will be implemented in AppLink V2

		// CallbackContext must be valid
		if (callbackContext == null) {
			Log.e(logTag, "CallbackContext is null. This action "
					+ Actions.getPresetBankCapabilities.name()
					+ " cannot be called without a valid CallbackContext.");
			return;
		}

		String errorString = Actions.getPresetBankCapabilities.name()
				+ " method currently unsupported.";
		callbackContext.error(errorString);
	}

	private static void getSoftButtonCapabilities(
			CallbackContext callbackContext) {
		// Currently unsupported, will be implemented in AppLink V2

		// CallbackContext must be valid
		if (callbackContext == null) {
			Log.e(logTag, "CallbackContext is null. This action "
					+ Actions.getSoftButtonCapabilities.name()
					+ " cannot be called without a valid CallbackContext.");
			return;
		}

		String errorString = Actions.getSoftButtonCapabilities.name()
				+ " method currently unsupported.";
		callbackContext.error(errorString);
	}

	private static void getSpeechCapabilities(CallbackContext callbackContext) {

		// CallbackContext must be valid
		if (callbackContext == null) {
			Log.e(logTag, "CallbackContext is null. This action "
					+ Actions.getSpeechCapabilities.name()
					+ " cannot be called without a valid CallbackContext.");
			return;
		}

		if (sdlProxy == null) {
			String errorString = "Could not execute command, "
					+ Actions.getSpeechCapabilities.name()
					+ ". No SdlProxy object has been instanciated. Call "
					+ Actions.createProxy.name() + " first.";
			callbackContext.error(errorString);
			return;
		}

		JSONArray speechCapabilitiesJSONArray = new JSONArray();

		try {
			// Get the ButtonCapabilities Vector
			List<SpeechCapabilities> speechCapabilitiesList = sdlProxy
					.getSpeechCapabilities();

			if (speechCapabilitiesList == null) {
				String errorString = "No value returned by call: "
						+ Actions.getSpeechCapabilities.name();
				callbackContext.error(errorString);

				return;
			} else {
				for (SpeechCapabilities speechCapabilities : speechCapabilitiesList) {
					speechCapabilitiesJSONArray.put(speechCapabilities
							.toString());
				}
			}
		} catch (SdlException e) {
			String errorString = Actions.getSpeechCapabilities.name()
					+ " could not complete. " + e.getMessage();
			callbackContext.error(errorString);

			return;
		}

		callbackContext.success(speechCapabilitiesJSONArray);
	}

	private static void getSdlLanguage(CallbackContext callbackContext) {
		// Currently unsupported, will be implemented in AppLink V2

		// CallbackContext must be valid
		if (callbackContext == null) {
			Log.e(logTag, "CallbackContext is null. This action "
					+ Actions.getSdlLanguage.name()
					+ " cannot be called without a valid CallbackContext.");
			return;
		}

		String errorString = "Method currently unspported.";
		callbackContext.error(errorString);
	}

	private static void getSdlMsgVersion(CallbackContext callbackContext) {

		// CallbackContext must be valid
		if (callbackContext == null) {
			Log.e(logTag, "CallbackContext is null. This action "
					+ Actions.getSdlMsgVersion.name()
					+ " cannot be called without a valid CallbackContext.");
			return;
		}

		if (sdlProxy == null) {
			String errorString = "Could not execute command, "
					+ Actions.getSdlMsgVersion.name()
					+ ". No SdlProxy object has been instanciated. Call "
					+ Actions.createProxy.name() + " first.";
			callbackContext.error(errorString);

			return;
		}

		JSONObject sdlMsgVersionJSON = new JSONObject();

		try {
			// Get the ButtonCapabilities Vector
			SdlMsgVersion sdlMsgVersion = sdlProxy.getSdlMsgVersion();

			if (sdlMsgVersion == null) {
				String errorString = "No value returned by call: "
						+ Actions.getSdlMsgVersion.name();
				callbackContext.error(errorString);

				return;
			} else {
				sdlMsgVersionJSON = sdlMsgVersion.serializeJSON();
			}
		} catch (SdlException e) {
			String errorString = Actions.getSdlMsgVersion.name()
					+ " could not complete. " + e.getMessage();
			callbackContext.error(errorString);

			return;
		} catch (JSONException e) {
			String errorString = Actions.getSdlMsgVersion.name()
					+ " could not complete. " + e.getMessage();
			callbackContext.error(errorString);

			return;
		}

		callbackContext.success(sdlMsgVersionJSON);
	}

	private static void getVehicleType(CallbackContext callbackContext) {
		// Currently unsupported, will be implemented in AppLink V2

		// CallbackContext must be valid
		if (callbackContext == null) {
			Log.e(logTag, "CallbackContext is null. This action "
					+ Actions.getVehicleType.name()
					+ " cannot be called without a valid CallbackContext.");
			return;
		}

		String errorString = Actions.getVehicleType.name()
				+ " method currently unsupported.";
		callbackContext.error(errorString);
	}

	private static void getVrCapabilities(CallbackContext callbackContext) {

		// CallbackContext must be valid
		if (callbackContext == null) {
			Log.e(logTag, "CallbackContext is null. This action "
					+ Actions.getVrCapabilities.name()
					+ " cannot be called without a valid CallbackContext.");
			return;
		}

		if (sdlProxy == null) {
			String errorString = "Could not execute command, "
					+ Actions.getVrCapabilities.name()
					+ ". No SdlProxy object has been instanciated. Call "
					+ Actions.createProxy.name() + " first.";
			callbackContext.error(errorString);

			return;
		}

		JSONArray vrCapabilitiesJSONArray = new JSONArray();

		try {
			// Get the ButtonCapabilities Vector
			List<VrCapabilities> vrCapabilitiesList = sdlProxy
					.getVrCapabilities();

			if (vrCapabilitiesList == null) {
				String errorString = "No value returned by call: "
						+ Actions.getVrCapabilities.name();
				callbackContext.error(errorString);

				return;
			} else {
				for (VrCapabilities vrCapabilities : vrCapabilitiesList) {
					vrCapabilitiesJSONArray.put(vrCapabilities.toString());
				}
			}
		} catch (SdlException e) {
			String errorString = Actions.getVrCapabilities.name()
					+ " could not complete. " + e.getMessage();
			callbackContext.error(errorString);

			return;
		}

		callbackContext.success(vrCapabilitiesJSONArray);
	}

	private static void getWiProVersion(CallbackContext callbackContext) {
		// Currently unsupported, will be implemented in AppLink V2

		// CallbackContext must be valid
		if (callbackContext == null) {
			Log.e(logTag, "CallbackContext is null. This action "
					+ Actions.getWiproVersion.name()
					+ " cannot be called without a valid CallbackContext.");
			return;
		}

		String errorString = Actions.getWiproVersion.name()
				+ " method currently unsupported.";
		callbackContext.error(errorString);
	}

	private static void enableSiphonDebug() {
		//SdlProxyALM.enableSiphonDebug();  non-static function
	}

	private static void disableSiphonDebug() {
		//SdlProxyALM.disableSiphonDebug(); non-static function
	}
	
	private static void putFile(JSONArray args, CallbackContext callbackContext) {
		 //insert Function Definition
		 Log.i("PutFileStatusMsg", "Java putFile() Running");
	 }

	private static void siphonLog(JSONArray args,
			CallbackContext callbackContext) {

		String argsFormat = "[String stringToLog]";

		// Arguments defaults
		String stringToLog = null;
		try {
			if (args == null || args.length() != 1) {
				throw new JSONException("Not all arguments were present.");
			}

			stringToLog = args.getString(0);
		} catch (JSONException e) {
			String errorString = Actions.siphonLog.name()
					+ " args not in correct format. Format = " + argsFormat
					+ ". " + e.getMessage();
			if (callbackContext != null) {
				callbackContext.error(errorString);
			} else {
				Log.e(logTag, errorString, e);
			}
			return;
		}

		// Log to Siphon
		boolean success = SiphonServer.sendSiphonLogData(stringToLog);

		// Send successful callback
		if (callbackContext != null) {
			if (success) {
				callbackContext.success();
			} else {
				callbackContext
						.error("Siphon failed to send log message. Ensure Siphon is enabled and connected.");
			}
		}
	}

	private static void sendRPCRequest(JSONArray args,
			CallbackContext callbackContext) {

		if (sdlProxy == null) {
			String errorString = "Could not execute action "
					+ Actions.sendRpcRequest.name()
					+ ". No SdlProxy object has been instanciated. Call "
					+ Actions.sendRpcRequest.name() + " first.";
			if (callbackContext != null) {
				callbackContext.error(errorString);
			} else {
				Log.e(logTag, LogStrings.callbackContextMissing);
				Log.e(logTag, errorString);
			}

			return;
		}

		String argsFormat = "[JSONObject rpcRequestJson]";

		RPCRequest rpcRequest = null;

		// Arguments defaults
		JSONObject rpcRequestJSON = null;
		try {
			if (args == null || args.length() != 1) {
				throw new JSONException("Not all arguments were present.");
			}

			rpcRequestJSON = args.getJSONObject(0);
		} catch (JSONException e) {
			String errorString = Actions.sendRpcRequest.name()
					+ " args not in correct format. Format = " + argsFormat
					+ ". " + e.getMessage();
			if (callbackContext != null) {
				callbackContext.error(errorString);
			} else {
				Log.e(logTag, LogStrings.callbackContextMissing);
				Log.e(logTag, errorString, e);
			}

			return;
		}

		// FIXME: Remove once bugs in RPCRequest() constructor are fixed
		if (rpcRequestJSON == null || rpcRequestJSON.length() == 0) {
			// Sad path
			// No parameters were given, to compensate for bug in SdlProxy,
			// create RPCMessage with no params
			rpcRequest = new RPCRequest("");
		} else {

			// Normal Happy Path:
			// Convert the rpcRequestJSON to an rpcRequest
			try {
				Hashtable<String, Object> hash = JsonRPCMarshaller
						.deserializeJSONObject(rpcRequestJSON);
						
				//added for PutFile
				byte[] code = null;
				Hashtable<String, Object> function = (Hashtable<String, Object>) hash.get("request"); //name, correlationId, parameters
				if((String.valueOf(function.get("name"))).equals(Names.PutFile)){
					Hashtable<String, Object> parameters = (Hashtable<String, Object>)function.get("parameters"); //fileType, syncFileName, fileData
					String temp = (String)parameters.get("fileData");
					// take out header
					temp = temp.substring(temp.indexOf(",")+1);
					code = Base64.decode(temp, Base64.DEFAULT);
					//parameters.put("bulkData", Base64.decode(temp, Base64.DEFAULT));
				}
				
				rpcRequest = new RPCRequest(hash);
				if(code !=null)
					rpcRequest.setBulkData(code);
				
			} catch (JSONException e) {
				String errorString = Actions.sendRpcRequest.name()
						+ " could not convert JSON rpcRequest to a hashtable.";
				if (callbackContext != null) {
					callbackContext.error(errorString);
				} else {
					Log.e(logTag, LogStrings.callbackContextMissing);
					Log.e(logTag, errorString, e);
				}

				return;
			}  catch (IllegalArgumentException e){
			// to do
			}

		}

		// If rpcRequest stores persistent data on SYNC, save the info
		try {
			if (rpcRequest.getFunctionName() == null) {
				Log.w(logTag,
						"Could not determine RPC funtion name. Could not save to persistentSdlData.");
			} else {
				if (rpcRequest.getFunctionName().equals(Names.AddCommand)
						|| rpcRequest.getFunctionName().equals(
								Names.DeleteCommand)
						|| rpcRequest.getFunctionName()
								.equals(Names.AddSubMenu)
						|| rpcRequest.getFunctionName().equals(
								Names.DeleteSubMenu)
						|| rpcRequest.getFunctionName().equals(
								Names.CreateInteractionChoiceSet)
						|| rpcRequest.getFunctionName().equals(
								Names.DeleteInteractionChoiceSet)
						|| rpcRequest.getFunctionName().equals(
								Names.SubscribeButton)
						|| rpcRequest.getFunctionName().equals(
								Names.UnsubscribeButton)
						|| rpcRequest.getFunctionName().equals(
								Names.PutFile)) {

					// Ensure that correlationID is not null and
					// pendingRPCRequests does not have an entry for this
					// correlation ID
					if (rpcRequest.getCorrelationID() != null
							&& pendingRPCRequests.get(rpcRequest
									.getCorrelationID()) == null) {
						pendingRPCRequests.append(
								rpcRequest.getCorrelationID(), rpcRequest);
					} else {
						Log.w(logTag,
								"CorrelationID is null, could not persist to persistentSdlData.");
					}
				}
			}
		} catch (ClassCastException e) { // FIXME Caused by bug in SdlProxy RPC
											// layer. Remove when fixed.
			Log.w(logTag,
					"RPC Layer of the proxy threw an exception, could not persist to persistentSdlData.");
		} catch (NullPointerException e) {
		
			// to do
		}

		try {
			sdlProxy.sendRPCRequest(rpcRequest);
		} catch (SdlException e) {
			String errorString = Actions.sendRpcRequest.name()
					+ " could not send RPC request. " + e.getMessage();
			if (callbackContext != null) {
				callbackContext.error(errorString);
			} else {
				Log.e(logTag, LogStrings.callbackContextMissing);
				Log.e(logTag, errorString, e);
			}
			return;
		} catch (ClassCastException e) { // FIXME CSSO Notified, remove when
											// fixed (CorrelationID not an int)
			if (callbackContext != null) {
				callbackContext
						.error("SdlProxy threw a ClassCast exception. The correlationID may not be in the correct format.");
			} else {
				Log.e(logTag, LogStrings.callbackContextMissing);
				Log.e(logTag, "ClassCastException: " + e.getMessage(), e);
			}
			return;
		} catch (Exception e) { // Remove when fixed
								// (CorrelationID null);
			if (callbackContext != null) {
				callbackContext.error("SdlProxy threw an uncaught exception.");
			} else {
				Log.e(logTag, LogStrings.callbackContextMissing);
				Log.e(logTag, "Uncaught exception: " + e.getMessage(), e);
			}
			return;
		}

		// Send successful callback
		if (callbackContext != null) {
			callbackContext.success();
		}
	}

	/************** IProxyListener Helpers ***************/
	// Get RPC Info from incoming RPC Message
	private static JSONObject getRPCInfo(RPCMessage rpc) {

		if (rpc == null) {
			Log.e(logTag, "RPCMessage is null. Cannot get RPCInfo.");
			return null;
		}
		String funcName = rpc.getFunctionName();
		JSONObject params = null;
		try {
			params = rpc.serializeJSON((byte)2);
			Log.i("Immediate Params Print", params.toString());
		} catch (JSONException e1) {
			e1.printStackTrace();
		}
		byte[] binaryData = rpc.getBulkData();
		String msgType = rpc.getMessageType();
		
		
		//encode Binary Data to base 64
		//String encodedBinaryData = Base64.encode(binaryData);
		
		JSONObject obj = new JSONObject();
		try {
			obj.put("FunctionName", funcName);
			obj.put("JSONData", params);
			obj.put("MessageType", msgType);
			obj.put("BinaryData", binaryData);
			if(rpc instanceof RPCResponse)
				obj.put("CorrelationID", ((RPCResponse)rpc).getCorrelationID());
		} catch (JSONException e) {
			e.printStackTrace();
			Log.e("RPC JSON MSG", "Error creating rpc json msg");
		}

		/*
		 * try { Log.d("Binary Data Msg", "Binary Data: " +
		 * binaryData.toString()); } catch(Exception e) {
		 * Log.e("Binary Data Msg", "Failed to print binary string"); if
		 * (binaryData == null) { Log.e("Binary Data Msg",
		 * "binary data is null"); } }
		 */
		
		//int dataLength = binaryData.length;
		//Log.i("Binary Data Message", String.valueOf(dataLength));
		Log.d("RPCInfoStatus", "Successfully created RPC info JSONObject");
		Log.d("JSON RPC Object: ", obj.toString());
		return obj;

	}


	// Send the callback to the javascript
	private static void sendRPCCallback(JSONObject info) {
		if (info == null) {
			Log.e(logTag, "Could not send RPCCallback. RPC info is null.");
			return;
		}
		Log.d("RPCInfoStatus", "Valid RPC info, trying to send RPCCallback ...");
		if (iProxyListenerCallbackContext != null) {
			PluginResult result = new PluginResult(PluginResult.Status.OK, info);
			result.setKeepCallback(true);
			iProxyListenerCallbackContext.sendPluginResult(result);
			Log.d("RPCStatusMessage", "RPC sent to javascript");
		} else {
			Log.e(logTag, "iProxyListenerCallbackContext is null. Cannot send callback to javascript.");
		}
	}

	private static JSONObject createProxyEvent(JSONObject content)
			throws JSONException {
		JSONObject proxyEventJSON = new JSONObject();

		proxyEventJSON.put(ProxyEvents.PROXY_EVENT, content);

		return proxyEventJSON;
	}

	private static JSONObject createProxyEventFirstAccess()
			throws JSONException {
		// Create firstRunObject
		JSONObject firstAccessJSON = new JSONObject();
		firstAccessJSON.put(ProxyEvents.EVENT_NAME, ProxyEvents.EVENT_OnFirstAccess);

		return firstAccessJSON;
	}

	private static JSONObject createProxyEventWithException(
			String proxyEventName, String info, Exception e)
			throws JSONException {
		// Create proxyEventWithException JSON
		JSONObject proxyEventWithExceptionJSON = new JSONObject();

		// Create parameters array
		JSONObject parametersObject = new JSONObject();
		if (info != null) {
			parametersObject.put(ProxyEvents.EVENT_PARAMETERS_INFO, info);
		}
		if (e != null) {
			parametersObject.put(ProxyEvents.EVENT_PARAMETERS_EXCEPTION, e.getMessage());
		}

		// Add parameters to object
		proxyEventWithExceptionJSON.put(ProxyEvents.EVENT_PARAMETERS, parametersObject);

		// Add name to object
		proxyEventWithExceptionJSON.put(ProxyEvents.EVENT_NAME, proxyEventName);

		return proxyEventWithExceptionJSON;
	}

	/************* End IProxyListener Helpers *************/

	private static PluginResult createRegisterListenerResponse(
			PluginResult.Status statusCode, String info) {

		// Create parameters object
		JSONObject parametersObject = new JSONObject();
		// Create register listener response event
		JSONObject registerListenerJSON = new JSONObject();

		try {
			// Add parameters
			parametersObject
					.put(CordovaParameters.REGISTER_LISTENER_INFO, info);
			// Wrap parameters in
			registerListenerJSON.put(
					CordovaParameters.REGISTER_LISTENER_RESPONSE,
					parametersObject);
		} catch (JSONException e) {
			Log.w(logTag, "Could not put parameters into registerListenerResponse object.", e);
		}

		// Create PluginResult
		PluginResult returnPluginResult = new PluginResult(statusCode,
				registerListenerJSON);
		if (statusCode == PluginResult.Status.OK) {
			returnPluginResult.setKeepCallback(true);
		}

		return returnPluginResult;
	}

	/********************* Helper for Persistent Sync Data ******************************/
	private static RPCRequest getPendingRPCRequest(RPCResponse response) {
		RPCRequest returnRPCRequest = null;

		if (response == null) {
			Log.e(logTag,
					"RPCResponse is null. Could not commit to persistent SYNC Data.");
		} else {
			if (response.getCorrelationID() != null) {
				if (response.getSuccess()) {
					// Fetch corresponding RPCRequest
					returnRPCRequest = pendingRPCRequests.get(response.getCorrelationID());
				} else {
					Log.e(logTag, "Response to " + response.getFunctionName() 
							+ " request unsuccessful. Cannot add to persistentSdlData.");
				}

				// Remove pending RPCRequest
				pendingRPCRequests.remove(response.getCorrelationID());
			} else {
				Log.e(logTag, "CorrelationID of " + response.getFunctionName() 
						+ " is null. Could not add to persistent SYNC Data.");
			}
		}

		return returnRPCRequest;
	}

	/********************* END Helper for Persistent Sync Data **************************/

	private static IProxyListenerALM proxyListener = new IProxyListenerALM() {

		/********************** IProxyListenerALM Callbacks ********************/
		public void onAddCommandResponse(AddCommandResponse response) {

			RPCRequest pendingRPCRequest = getPendingRPCRequest(response);
			if (pendingRPCRequest == null) {
				Log.e(logTag, LogStrings.pendingRPCRequestNotFound);
			} else {
				try {
					persistentSdlData.addCommand(new AddCommand(
							JsonRPCMarshaller
									.deserializeJSONObject(pendingRPCRequest
											.serializeJSON())));
				} catch (JSONException e) {
					Log.e(logTag, LogStrings.couldNotModifyPersistentSdlData, e);
				}
			}

			sendRPCCallback(getRPCInfo(response));
		}

		public void onAddSubMenuResponse(AddSubMenuResponse response) {

			RPCRequest pendingRPCRequest = getPendingRPCRequest(response);
			if (pendingRPCRequest == null) {
				Log.e(logTag, LogStrings.pendingRPCRequestNotFound);
			} else {
				try {
					persistentSdlData.addSubMenu(new AddSubMenu(
							JsonRPCMarshaller
									.deserializeJSONObject(pendingRPCRequest
											.serializeJSON())));
				} catch (JSONException e) {
					Log.e(logTag, LogStrings.couldNotModifyPersistentSdlData, e);
				}
			}

			sendRPCCallback(getRPCInfo(response));
		}

		public void onAlertResponse(AlertResponse response) {
			sendRPCCallback(getRPCInfo(response));
		}

		public void onCreateInteractionChoiceSetResponse(
				CreateInteractionChoiceSetResponse response) {

			RPCRequest pendingRPCRequest = getPendingRPCRequest(response);
			if (pendingRPCRequest == null) {
				Log.e(logTag, LogStrings.pendingRPCRequestNotFound);
			} else {
				try {
					persistentSdlData
							.addInteractionChoiceSet(new CreateInteractionChoiceSet(
									JsonRPCMarshaller
											.deserializeJSONObject(pendingRPCRequest
													.serializeJSON())));
				} catch (JSONException e) {
					Log.e(logTag, LogStrings.couldNotModifyPersistentSdlData, e);
				}
			}

			sendRPCCallback(getRPCInfo(response));
		}

		public void onDeleteCommandResponse(DeleteCommandResponse response) {

			RPCRequest pendingRPCRequest = getPendingRPCRequest(response);
			if (pendingRPCRequest == null) {
				Log.e(logTag, LogStrings.pendingRPCRequestNotFound);
			} else {
				try {
					persistentSdlData.removeCommand(new DeleteCommand(
							JsonRPCMarshaller
									.deserializeJSONObject(pendingRPCRequest
											.serializeJSON())));
				} catch (JSONException e) {
					Log.e(logTag, LogStrings.couldNotModifyPersistentSdlData, e);
				}
			}

			sendRPCCallback(getRPCInfo(response));
		}

		public void onDeleteInteractionChoiceSetResponse(
				DeleteInteractionChoiceSetResponse response) {

			RPCRequest pendingRPCRequest = getPendingRPCRequest(response);
			if (pendingRPCRequest == null) {
				Log.e(logTag, LogStrings.pendingRPCRequestNotFound);
			} else {
				try {
					persistentSdlData
							.removeInteractionChoiceSet(new DeleteInteractionChoiceSet(
									JsonRPCMarshaller
											.deserializeJSONObject(pendingRPCRequest
													.serializeJSON())));
				} catch (JSONException e) {
					Log.e(logTag, LogStrings.couldNotModifyPersistentSdlData, e);
				}
			}

			sendRPCCallback(getRPCInfo(response));
		}

		public void onDeleteSubMenuResponse(DeleteSubMenuResponse response) {

			RPCRequest pendingRPCRequest = getPendingRPCRequest(response);
			if (pendingRPCRequest == null) {
				Log.e(logTag, LogStrings.pendingRPCRequestNotFound);
			} else {
				try {
					persistentSdlData.removeSubMenu(new DeleteSubMenu(
							JsonRPCMarshaller
									.deserializeJSONObject(pendingRPCRequest
											.serializeJSON())));
				} catch (JSONException e) {
					Log.e(logTag, LogStrings.couldNotModifyPersistentSdlData, e);
				}
			}

			sendRPCCallback(getRPCInfo(response));
		}

		public void onError(String msg, Exception ex) {
			try {
				sendRPCCallback(createProxyEvent(createProxyEventWithException(
						ProxyEvents.EVENT_OnError, msg, ex)));
				Log.e("onError", msg + " ex string: " + ex.toString() + "stack trace: ");
				ex.printStackTrace();
			} catch (JSONException e) {
				Log.e(logTag, "Could not send 'onError' callback.", e);
			}
		}

		public void onGenericResponse(GenericResponse response) {
			sendRPCCallback(getRPCInfo(response));
			Log.e("onGenericResponse","Response " + response);
		}

		public void onOnButtonEvent(OnButtonEvent notification) {
			sendRPCCallback(getRPCInfo(notification));
		}

		public void onOnButtonPress(OnButtonPress notification) {
			sendRPCCallback(getRPCInfo(notification));
		}

		public void onOnCommand(OnCommand notification) {
			sendRPCCallback(getRPCInfo(notification));
		}

		public void onOnHMIStatus(OnHMIStatus notification) {
			// Test and set haveRecievedFirstNonNoneHMI
			Log.i("ProgramLocationMsg", "onOnHMIStatus Java is running");
			if (haveRecievedFirstNonNoneHMI == false) {
				if (notification != null && notification.getHmiLevel() != null) {
					if (notification.getHmiLevel().equals(HMILevel.HMI_NONE) == false) {
						haveRecievedFirstNonNoneHMI = true;

						// Call onProxyFirstAccess
						onProxyFirstAccess();
					}
				} else {
					Log.e(logTag, "Malformed OnHMIStatus notification. Could not record HMI Level.");
				}
			}

			// Save the new HMIStatus notification
			currentHMIStatusNotification = notification;
			
			sendRPCCallback(getRPCInfo(notification));
		}

		public void onPerformInteractionResponse(
				PerformInteractionResponse response) {
			sendRPCCallback(getRPCInfo(response));
		}

		public void onProxyClosed(String msg, Exception ex, SdlDisconnectedReason reason) {
			// Clear lifecycle variables
			resetLifecycleVariables();
			Log.d("onProxyClosed","Lifecycle Variables reset");
			try {
				sendRPCCallback(createProxyEvent(createProxyEventWithException(
						ProxyEvents.EVENT_OnProxyClosed, msg + " reason: " + reason, ex)));
			} catch (JSONException e) {
				Log.e(logTag, "Could not send 'onError' callback.", e);
			}
		}

		public void onResetGlobalPropertiesResponse(
				ResetGlobalPropertiesResponse response) {
			sendRPCCallback(getRPCInfo(response));
		}

		public void onSetGlobalPropertiesResponse(
				SetGlobalPropertiesResponse response) {
			sendRPCCallback(getRPCInfo(response));
		}

		public void onSetMediaClockTimerResponse(
				SetMediaClockTimerResponse response) {
			sendRPCCallback(getRPCInfo(response));
		}

		public void onShowResponse(ShowResponse response) {
			sendRPCCallback(getRPCInfo(response));
		}

		public void onSpeakResponse(SpeakResponse response) {
			sendRPCCallback(getRPCInfo(response));
		}

		public void onSubscribeButtonResponse(SubscribeButtonResponse response) {

			RPCRequest pendingRPCRequest = getPendingRPCRequest(response);
			if (pendingRPCRequest == null) {
				Log.e(logTag, LogStrings.pendingRPCRequestNotFound);
			} else {
				try {
					persistentSdlData
							.addButtonSubscription(new SubscribeButton(
									JsonRPCMarshaller
											.deserializeJSONObject(pendingRPCRequest
													.serializeJSON())));
				} catch (JSONException e) {
					Log.e(logTag, LogStrings.couldNotModifyPersistentSdlData, e);
				}
			}

			sendRPCCallback(getRPCInfo(response));
		}

		public void onUnsubscribeButtonResponse(
				UnsubscribeButtonResponse response) {

			RPCRequest pendingRPCRequest = getPendingRPCRequest(response);
			if (pendingRPCRequest == null) {
				Log.e(logTag, LogStrings.pendingRPCRequestNotFound);
			} else {
				try {
					persistentSdlData
							.removeButtonSubscription(new UnsubscribeButton(
									JsonRPCMarshaller
											.deserializeJSONObject(pendingRPCRequest
													.serializeJSON())));
				} catch (JSONException e) {
					Log.e(logTag, LogStrings.couldNotModifyPersistentSdlData, e);
				}
			}

			sendRPCCallback(getRPCInfo(response));
		}

		public void onOnDriverDistraction(OnDriverDistraction notification) {
			sendRPCCallback(getRPCInfo(notification));
		}

		public void onOnTBTClientState(OnTBTClientState notification) {
			sendRPCCallback(getRPCInfo(notification));
		}

		/******************** End IProxyListenerALM Callbacks ******************/

		/**************** Start NEW IProxyListenerALM Callbacks ****************/
		/*Not used anymore
		public void onAlertManeuverResponse(AlertManeuverResponse response) {
			sendRPCCallback(getRPCInfo(response));
		}*/

		public void onChangeRegistrationResponse(
				ChangeRegistrationResponse response) {
			sendRPCCallback(getRPCInfo(response));	
		}

		public void onDeleteFileResponse(DeleteFileResponse response) {
			sendRPCCallback(getRPCInfo(response));
		}

		public void onEndAudioPassThruResponse(EndAudioPassThruResponse response) {
			sendRPCCallback(getRPCInfo(response));
		}

		public void onGetDTCsResponse(GetDTCsResponse response) {
			sendRPCCallback(getRPCInfo(response));
		}

		public void onGetVehicleDataResponse(GetVehicleDataResponse response) {
			sendRPCCallback(getRPCInfo(response));
		}

		public void onListFilesResponse(ListFilesResponse response) {
			sendRPCCallback(getRPCInfo(response));
		}

		public void onOnAudioPassThru(OnAudioPassThru notification) {
			sendRPCCallback(getRPCInfo(notification));
		}

		public void onOnLanguageChange(OnLanguageChange notification) {
			sendRPCCallback(getRPCInfo(notification));
		}

		public void onOnPermissionsChange(OnPermissionsChange notification) {
			sendRPCCallback(getRPCInfo(notification));
		}

		public void onOnVehicleData(OnVehicleData notification) {
			sendRPCCallback(getRPCInfo(notification));
		}

		public void onPerformAudioPassThruResponse(
				PerformAudioPassThruResponse response) {
			sendRPCCallback(getRPCInfo(response));
		}

		public void onPutFileResponse(PutFileResponse response) {
			sendRPCCallback(getRPCInfo(response));
		}

		public void onReadDIDResponse(ReadDIDResponse response) {
			sendRPCCallback(getRPCInfo(response));
		}

		public void onScrollableMessageResponse(
				ScrollableMessageResponse response) {
			sendRPCCallback(getRPCInfo(response));
		}

		public void onSetAppIconResponse(SetAppIconResponse response) {
			sendRPCCallback(getRPCInfo(response));
		}

		public void onSetDisplayLayoutResponse(SetDisplayLayoutResponse response) {
			sendRPCCallback(getRPCInfo(response));
		}

        /*
		public void onShowConstantTbtResponse(ShowConstantTbtResponse response) {
			sendRPCCallback(getRPCInfo(response));
		}*/

		public void onSliderResponse(SliderResponse response) {
			sendRPCCallback(getRPCInfo(response));
		}

		public void onSubscribeVehicleDataResponse(
				SubscribeVehicleDataResponse response) {
			sendRPCCallback(getRPCInfo(response));
		}

		public void onUnsubscribeVehicleDataResponse(
				UnsubscribeVehicleDataResponse response) {
			sendRPCCallback(getRPCInfo(response));
		}

        /*
		public void onUpdateTurnListResponse(UpdateTurnListResponse response) {
			sendRPCCallback(getRPCInfo(response));
		}*/

		/***************** End NEW IProxyListenerALM Callbacks *****************/

		/********************* Simulated Callbacks *****************************/
		private void onProxyFirstAccess() {
			try {
				sendRPCCallback(createProxyEvent(createProxyEventFirstAccess()));
				Log.i("Logger", "Ran onProxyFirstAccess");
			} catch (JSONException e) {
				Log.e(logTag, "Could not send 'onProxyFirstAccess' callback.", e);
			}
		}

		/********************* End Simulated Callbacks *************************/

		@Override
		public void onDiagnosticMessageResponse(DiagnosticMessageResponse arg0) {
			// TODO Auto-generated method stub

		}

		@Override
		public void onOnHashChange(OnHashChange arg0) {
			// TODO Auto-generated method stub

		}

		@Override
		public void onOnKeyboardInput(OnKeyboardInput arg0) {
			// TODO Auto-generated method stub

		}

		@Override
		public void onOnLockScreenNotification(OnLockScreenStatus arg0) {
			// TODO Auto-generated method stub

		}

		@Override
		public void onOnSystemRequest(OnSystemRequest arg0) {
			// TODO Auto-generated method stub

		}

		@Override
		public void onOnTouchEvent(OnTouchEvent arg0) {
			// TODO Auto-generated method stub

		}
		public void onSystemRequestResponse(SystemRequestResponse arg0) {
			// TODO Auto-generated method stub

		}
		
		//added
		public void onSendLocationResponse(SendLocationResponse arg0) {
			// TODO
		}
		
		public void onDialNumberResponse(DialNumberResponse arg0) {
			// TODO
		}
		
		public void onStreamRPCResponse(StreamRPCResponse arg0) {
			// TODO
		}
		
		public void onOnStreamRPC(OnStreamRPC arg0) {
			// TODO
		}

	};
}