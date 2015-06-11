package com.smartdevicelink.cordova.utils;

import java.util.Vector;

import org.json.JSONArray;
import org.json.JSONException;

import android.util.Log;

public class JSONtoJavaClassConverter {
	private static final String logTag = JSONtoJavaClassConverter.class.getSimpleName();
	
	public static Vector<String> jsonArrayOfStringsToVectorOfStrings(JSONArray jsonArray){
		Vector<String> returnString = new Vector<String>();
		
		if(jsonArray != null){
			for(int i=0; i<jsonArray.length(); i++){			
				try {
					Object thisObject = jsonArray.get(i);
	
					if(thisObject instanceof String){
						returnString.add((String)thisObject);
					} else {
						Log.e(logTag, "Object at index: " + i + " is not a string.");
					}
				} catch (JSONException e) {
					Log.e(logTag, "Could not fetch object at index: " + i, e);
				}
			}
		}
		
		return returnString;
	}
}
