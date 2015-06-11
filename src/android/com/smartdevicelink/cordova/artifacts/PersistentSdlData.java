package com.smartdevicelink.cordova.artifacts;

import java.util.ArrayList;
import java.util.HashMap;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.annotation.SuppressLint;
import android.util.Log;

import com.smartdevicelink.proxy.RPCRequest;
import com.smartdevicelink.proxy.constants.Names;
import com.smartdevicelink.proxy.rpc.AddCommand;
import com.smartdevicelink.proxy.rpc.AddSubMenu;
import com.smartdevicelink.proxy.rpc.CreateInteractionChoiceSet;
import com.smartdevicelink.proxy.rpc.DeleteCommand;
import com.smartdevicelink.proxy.rpc.DeleteInteractionChoiceSet;
import com.smartdevicelink.proxy.rpc.DeleteSubMenu;
import com.smartdevicelink.proxy.rpc.SubscribeButton;
import com.smartdevicelink.proxy.rpc.UnsubscribeButton;
import com.smartdevicelink.proxy.rpc.enums.ButtonName;

public class PersistentSdlData {
	private final static String logTag = "PersistentSdlData";
	
	private static final String	COMMANDS = "commands",
							    SUB_MENUS = "subMenus",
							    CHOICE_SETS = "choiceSets",
							    BUTTON_SUBSCRIPTIONS = "buttonSubscriptions";
	
	
	// Save the artifacts by unique identifiers
	@SuppressLint("UseSparseArrays")
	private HashMap<Integer, JSONObject> commands = new HashMap<Integer, JSONObject>();
	@SuppressLint("UseSparseArrays")
	private HashMap<Integer, JSONObject> subMenus = new HashMap<Integer, JSONObject>();
	@SuppressLint("UseSparseArrays")
	private HashMap<Integer, JSONObject> choiceSets = new HashMap<Integer, JSONObject>();
	private ArrayList<ButtonName> buttons = new ArrayList<ButtonName>();
	
	/********** Commands ***********/
	public void addCommand(AddCommand addCommand) throws JSONException{
		if(addCommand == null){
			Log.w(logTag, "No corresponding addCommand found.");
			return;
		}
		
		commands.put(addCommand.getCmdID(), getRPCParameters(addCommand));
		
		// FIXME Strip position information? Could change/become useless with subsequent addcommands/submenus
	}
	
	public void removeCommand(DeleteCommand deleteCommand){
		// Check for null values
		if(deleteCommand == null || commands.remove(deleteCommand.getCmdID()) == null){
			Log.w(logTag, "No corresponding DeleteCommand found.");
			return;
		}
	}
	/********** End Commands ***********/
	
	
	/********** SubMenus ***********/
	public void addSubMenu(AddSubMenu subMenu) throws JSONException{
		if(subMenu == null){
			Log.w(logTag, "No corresponding AddSubMenu found.");
			return;
		}
		
		subMenus.put(subMenu.getMenuID(), getRPCParameters(subMenu));
		
		// FIXME Strip position information? Could change/become useless with subsequent addcommands/submenus
	}
	
	public void removeSubMenu(DeleteSubMenu deleteSubMenu){
		if(deleteSubMenu == null || subMenus.remove(deleteSubMenu.getMenuID()) == null){
			Log.w(logTag, "No corresponding DeleteSubMenu found.");
			return;
		}
		
		// FIXME Remove associated commands
	}
	/********** End SubMenus ***********/
	
	
	
	/********** InteractionChoiceSets ***********/
	public void addInteractionChoiceSet(CreateInteractionChoiceSet createInteractionChoiceSet) throws JSONException{		
		if(createInteractionChoiceSet == null){
			Log.w(logTag, "No corresponding CreateInteractionChoiceSet found.");
			return;
		}
		
		choiceSets.put(createInteractionChoiceSet.getInteractionChoiceSetID(), getRPCParameters(createInteractionChoiceSet));
	}
	
	public void removeInteractionChoiceSet(DeleteInteractionChoiceSet deleteInteractionChoiceSet){
		if(deleteInteractionChoiceSet == null || choiceSets.remove(deleteInteractionChoiceSet.getInteractionChoiceSetID()) == null){
			Log.w(logTag, "No corresponding DeleteInteractionChoiceSet found.");
			return;
		}
	}
	/********** End InteractionChoiceSets ***********/
	
	
	
	/********** SubscribeButtons ***********/
	public void addButtonSubscription(SubscribeButton subscribeButton){
		if(subscribeButton == null){
			Log.w(logTag, "No corresponding SubscribeButton found.");
			return;
		}
		
		if(buttons.contains(subscribeButton.getButtonName()) == false){
			buttons.add(subscribeButton.getButtonName());
		}
	}
	
	public void removeButtonSubscription(UnsubscribeButton unsubscribeButton){
		if(unsubscribeButton == null || buttons.remove(unsubscribeButton.getButtonName()) == false){
			Log.w(logTag, "No corresponding UnsubscribeButton found.");
			return;
		}
	}
	/********** End SubscribeButtons ***********/
	
	
	
	public JSONObject toJSONObject() throws JSONException{
		JSONObject returnJSON = new JSONObject();		
		
		// Get JSONArray of Commands
		JSONArray commandArray = new JSONArray(commands.values());
		
		// Get JSONArray of SubMenus
		JSONArray subMenuArray = new JSONArray(subMenus.values());		
		
		// Get JSONArray of ChoiceSets
		JSONArray choiceSetArray = new JSONArray(choiceSets.values());
		
		// Get ButtonRegistrations
		JSONArray buttonSubscriptionArray = new JSONArray(buttons);
		
		returnJSON.put(COMMANDS, commandArray);
		returnJSON.put(SUB_MENUS, subMenuArray);
		returnJSON.put(CHOICE_SETS, choiceSetArray);
		returnJSON.put(BUTTON_SUBSCRIPTIONS, buttonSubscriptionArray);
		
		return returnJSON;
	}
	
	public static JSONObject getRPCParameters(RPCRequest rpcRequest) throws JSONException{
		JSONObject returnJSONObject = new JSONObject();
		
		// Get RPC JSON
		if(rpcRequest != null){
			JSONObject rpcJSON = rpcRequest.serializeJSON();
		
			// Get Request JSON
			JSONObject requestJSON = rpcJSON.getJSONObject(Names.request);
			
			// Get Parameters JSON
			Object parametersObject = requestJSON.get(Names.parameters);
			if(parametersObject instanceof JSONObject){
				returnJSONObject = (JSONObject)parametersObject;
			}
		}
		
		return returnJSONObject;
	}
}
