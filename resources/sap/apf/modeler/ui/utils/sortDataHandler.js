/*!
* SAP APF Analysis Path Framework
*
* (c) Copyright 2012-2014 SAP AG. All rights reserved
*/
sap.ui.define(["sap/apf/modeler/ui/utils/constants"],function(m){'use strict';var p=m.propertyTypes;var S=function(P,o,s,t){this.oParentView=P;this.oStepPropertyMetadataHandler=s;this.oParentObject=o;this.oTextReader=t;};function _(s,P,b){var v,V={},o={};o.oConfigurationEditor=s.oParentView.getViewData().oConfigurationEditor;o.oParentObject=s.oParentObject;o.oCoreApi=s.oParentView.getViewData().oCoreApi;o.oConfigurationHandler=s.oParentView.getViewData().oConfigurationHandler;o.oStepPropertyMetadataHandler=s.oStepPropertyMetadataHandler;o.sPropertyType=P;V.oViewDataForPropertyType=o;V.aPropertiesToBeCreated=b;v=new sap.ui.view({viewName:"sap.apf.modeler.ui.view.propertyTypeHandler",type:sap.ui.core.mvc.ViewType.XML,id:s.oParentView.getController().createId("id"+P),viewData:V});s.oParentView.getController().byId("idSortLayout").insertItem(v);s.oParentView.attachEvent(m.events.step.SETTOPNPROPERTIES,v.getController().handleSettingTopNProperties.bind(v.getController()));}function a(s){var P,b=[];s.forEach(function(o){P={};P.sProperty=o.property;P.sContext=o.ascending?"true":"false";b.push(P);});return b;}S.prototype.instantiateRepresentationSortData=function(){var P=a(this.oParentObject.getOrderbySpecifications());if(P.length===0){P=[{sProperty:this.oTextReader("none"),sContext:"true"}];}_(this,p.REPRESENTATIONSORT,P);};S.prototype.instantiateStepSortData=function(){var P=[{sProperty:this.oStepPropertyMetadataHandler.getProperties()[0],sContext:"true"}];this.destroySortData();if(this.oParentObject.getTopN()&&this.oParentObject.getTopN().orderby.length!==0){P=a(this.oParentObject.getTopN().orderby);}_(this,p.STEPSORT,P);};S.prototype.destroySortData=function(){this.oParentView.getController().byId("idSortLayout").destroyItems();};return S;},true);
