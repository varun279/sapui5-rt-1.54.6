/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
jQuery.sap.declare("sap.apf.core.textResourceHandler");jQuery.sap.require("sap.apf.utils.hashtable");jQuery.sap.require("jquery.sap.resources");(function(){'use strict';sap.apf.core.TextResourceHandler=function(I){var m=I.instances.messageHandler;var r;var h=new sap.apf.utils.Hashtable(m);var H=new sap.apf.utils.Hashtable(m);var o=new sap.apf.utils.Hashtable(m);var a={};var R=(I.constructors&&I.constructors.ResourceModel)||sap.ui.model.resource.ResourceModel;var b;this.getTextNotHtmlEncoded=function(l,p){var t;var d;var k;if(typeof l==="string"){d=l;}else{m.check((l!==undefined&&l.kind!==undefined&&l.kind==="text"&&l.key!==undefined),"Error - oLabel is not compatible");d=l.key;}k=JSON.stringify({textKey:d,parameters:p});if(h.hasItem(k)){return h.getItem(k);}t=c(d,p);h.setItem(k,t);return t;};this.getTextHtmlEncoded=function(l,p){return jQuery.sap.encodeHTML(this.getTextNotHtmlEncoded(l,p));};this.getMessageText=function(s,p){return g(s,p,false);};this.loadTextElements=function(t){var i,l;l=t.length;for(i=0;i<l;i++){H.setItem(t[i].TextElement,t[i].TextElementDescription);}};this.registerTextWithKey=function(k,t){a[k]=t;};this.loadResourceModelAsPromise=function(A,s,d){var e=jQuery.Deferred();b=new R({bundleUrl:A,async:true});if(s!==undefined&&s!==""){b.enhance({bundleUrl:s,async:true}).then(function(){if(d!==undefined&&d!==""){b.enhance({bundleUrl:d,async:true}).then(function(){b.getResourceBundle().then(function(f){r=f;e.resolve();});});}else{b.getResourceBundle().then(function(f){r=f;e.resolve();});}});}else if(d!==undefined&&d!==""){b.enhance({bundleUrl:d,async:true}).then(function(){b.getResourceBundle().then(function(f){r=f;e.resolve();});});}else{b.getResourceBundle().then(function(f){r=f;e.resolve();});}return e.promise();};function g(k,p,C){if(p&&p.length===0){return r.getText(k,undefined,C);}return r.getText(k,p,C);}function c(k,p){var t;if(k===sap.apf.core.constants.textKeyForInitialText){return"";}else if(a[k]){if(p&&p.length>0){return jQuery.sap.formatMessage(a[k],p);}return a[k];}else if(H.hasItem(k)){t=g(k,p,true);if(typeof t!=="string"||t===k){return H.getItem(k);}return t;}else if(o.hasItem(k)){return o.getItem(k);}t=g(k,p,true);if(typeof t==="string"){return t;}m.putMessage(m.createMessageObject({code:"3001",aParameters:[k],oCallingObject:this}));var e="# text not available: "+k;o.setItem(k,e);return e;}};}());
