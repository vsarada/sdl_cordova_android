package com.smartdevicelink.cordova;

public class rpcInfo{
	
	@SuppressWarnings("unused")
	private String functionName = null;
	@SuppressWarnings("unused")
	private Object parameters = null;
	@SuppressWarnings("unused")
	private byte[] binaryData = null;
	
	public rpcInfo(String functionName, Object parameters, byte[] binaryData) {
		this.functionName=functionName;
		this.parameters=parameters;
		this.binaryData = binaryData;
	}
}