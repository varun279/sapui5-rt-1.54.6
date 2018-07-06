/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2018 SAP SE. All rights reserved
	
 */
sap.ui.define(['jquery.sap.global','sap/ui/base/ManagedObject','./Util','./ColumnWrapper'],function(q,M,U,C){"use strict";var a=M.extend("sap.ui.comp.personalization.ColumnHelper",{constructor:function(i,s){M.apply(this,arguments);},metadata:{properties:{callbackOnSetVisible:{type:"object",defaultValue:null},callbackOnSetSummed:{type:"object",defaultValue:null}}}});a.prototype.init=function(){this._oColumnKey2ColumnMap={};this._oColumnKeyIsMonkeyPatched={};};a.prototype.exit=function(){this._oColumnKey2ColumnMap=null;this._oColumnKeyIsMonkeyPatched=null;};a.prototype.addColumns=function(c){if(!c){return;}c.forEach(function(o){this._addColumnToMap(U.getColumnKey(o),o);},this);this._checkConsistencyOfColumns(this._oColumnKey2ColumnMap);};a.prototype.addColumnMap=function(c){if(!c){return;}for(var s in c){this._addColumnToMap(s,c[s]);}this._checkConsistencyOfColumns(this._oColumnKey2ColumnMap);};a.prototype.getColumnMap=function(){return this._oColumnKey2ColumnMap;};a.prototype._checkConsistencyOfColumns=function(c){if(q.isEmptyObject(c)){return;}var s=Object.keys(c)[0];var h=!!U._getCustomProperty(c[s],"columnKey");for(var b in c){if(h!==!!U._getCustomProperty(c[b],"columnKey")){throw"The table instance provided contains some columns for which a columnKey is provided, some for which a columnKey is not provided.";}}};a.prototype._addColumnToMap=function(c,o){if(this._oColumnKey2ColumnMap[c]){throw"Duplicate 'columnKey': The column '"+o.getId()+"' and column '"+this._oColumnKey2ColumnMap[c]+"' have same 'columnKey' "+c;}if(!this._oColumnKey2ColumnMap[c]){this._oColumnKey2ColumnMap[c]=o;this._monkeyPatchColumn(o,c);}};a.prototype._monkeyPatchColumn=function(c,s){if(c instanceof C){return;}if(this._oColumnKeyIsMonkeyPatched[s]){return;}this._oColumnKeyIsMonkeyPatched[s]=true;var f=this.getCallbackOnSetVisible();var S=c.setVisible.bind(c);var b=function(v){if(f){f(v,s);}S(v);};c.setVisible=b;if(c.setSummed){var d=this.getCallbackOnSetSummed();var e=c.setSummed.bind(c);var g=function(i){if(d){d(i,c);}e(i);};c.setSummed=g;}};return a;},true);
