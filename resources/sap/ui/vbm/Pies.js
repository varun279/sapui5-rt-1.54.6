/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */
sap.ui.define(['./VoAggregation','./library'],function(V,l){"use strict";var P=V.extend("sap.ui.vbm.Pies",{metadata:{library:"sap.ui.vbm",properties:{posChangeable:{type:"boolean",group:"Misc",defaultValue:true},scaleChangeable:{type:"boolean",group:"Misc",defaultValue:true}},defaultAggregation:"items",aggregations:{items:{type:"sap.ui.vbm.Pie",multiple:true,singularName:"item"}},events:{}}});P.prototype.getBindInfo=function(){var b=V.prototype.getBindInfo.apply(this,arguments);var t=this.getTemplateBindingInfo();b.P=(t)?t.hasOwnProperty("position"):true;b.S=(t)?t.hasOwnProperty("scale"):true;return b;};P.prototype.getTemplateObject=function(){var t=V.prototype.getTemplateObject.apply(this,arguments);var b=this.mBindInfo=this.getBindInfo();var v=(b.hasTemplate)?this.getBindingInfo("items").template:null;t["type"]="{00100000-2012-0004-B001-383477EA1DEB}";if(b.P){t["pos.bind"]=t.id+".P";}else{t.pos=v.getPosition();}if(b.S){t["scale.bind"]=t.id+".S";}else{t.scale=v.getScale();}t["series.bind"]=t.id+".Series";t["text.bind"]=t.id+".Series.T";t["value.bind"]=t.id+".Series.V";t["slicecolor.bind"]=t.id+".Series.C";return t;};P.prototype.getTypeObject=function(){var t=V.prototype.getTypeObject.apply(this,arguments);var b=this.mBindInfo;if(b.P){t.A.push({"changeable":this.getPosChangeable().toString(),"name":"P","alias":"P","type":"vector"});}if(b.S){t.A.push({"changeable":this.getScaleChangeable().toString(),"name":"S","alias":"S","type":"vector"});}t.N={"name":"Series","A":[{"name":"V","alias":"V","type":"float"},{"name":"T","alias":"T","type":"string"},{"name":"C","alias":"C","type":"string"}]};return t;};P.prototype.getActionArray=function(){var a=V.prototype.getActionArray.apply(this,arguments);var i=this.getId();if(this.mEventRegistry["click"]||this.isEventRegistered("click")){a.push({"id":i+"1","name":"click","refScene":"MainScene","refVO":i,"refEvent":"Click","AddActionProperty":[{"name":"pos"}]});}if(this.mEventRegistry["contextMenu"]||this.isEventRegistered("contextMenu")){a.push({"id":i+"2","name":"contextMenu","refScene":"MainScene","refVO":i,"refEvent":"ContextMenu"});}if(this.mEventRegistry["drop"]||this.isEventRegistered("drop")){a.push({"id":i+"3","name":"drop","refScene":"MainScene","refVO":i,"refEvent":"Drop"});}return a;};return P;});
