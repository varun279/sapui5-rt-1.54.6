/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["jquery.sap.global","sap/ui/base/ManagedObject"],function(q,M){"use strict";var C=M.extend("sap.ui.vk.Camera",{metadata:{publicMethods:["getCameraRef"],properties:{"position":{type:"float[]"},"targetDirection":{type:"float[]"},"upDirection":{type:"float[]"},"nearClipPlane":{type:"float"},"farClipPlane":{type:"float"}}}});C.prototype.getCameraRef=function(){return null;};return C;});
