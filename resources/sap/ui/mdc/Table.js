/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2018 SAP SE. All rights reserved
 */
sap.ui.define(["./ResourceModel",'sap/ui/mdc/XMLComposite','sap/ui/mdc/internal/table/gridtable/GridTable.controller','sap/ui/mdc/internal/table/responsivetable/ResponsiveTable.controller','sap/ui/mdc/internal/field/Field.controller',"sap/m/ListMode",'sap/ui/mdc/Field'],function(R,X,G,a,F,L){"use strict";var b="sap.ui.table.Table",c='sap.m.Table';var T=X.extend("sap.ui.mdc.Table",{metadata:{designtime:"sap/ui/mdc/designtime/Table.designtime",specialSettings:{metadataContexts:{defaultValue:"{ model: 'entitySet', path:'',  name: 'entitySet'},{model: 'sap.fe.deviceModel', path: '/', name: 'sap.fe.deviceModel'}, {model: 'entitySet', path:'./@com.sap.vocabularies.UI.v1.LineItem',  name: 'columns'}"}},properties:{tableBindingPath:{type:"string",invalidate:"template"},type:{type:"string",defaultValue:"ResponsiveTable",invalidate:"template"},interactionType:{type:"string",defaultValue:"Inactive",invalidate:"template"},settingsDialogType:{type:"string",defaultValue:"ViewSettings"},enabled:{type:"boolean",defaultValue:true,invalidate:false},growingThreshold:{type:"string",defaultValue:"50",invalidate:"template"},growingScrollToLoad:{type:"boolean",defaultValue:true,invalidate:false},listBindingName:{type:"string",invalidate:false},demandPopin:{type:"boolean",group:"Misc",defaultValue:false},showToolbar:{type:"boolean",defaultValue:true},selectionMode:{type:"string",defaultValue:'None'}},events:{"itemPress":{},"callAction":{},"showError":{},"selectionChange":{}},publicMethods:[]},fragment:"sap.ui.mdc.internal.table.Table"});var I=function(){if(!this.bInitialized){this.oTableController.setSelectionMode(this.getSelectionMode());this.oTableController.enableDisableActions();this.oTableController.bindTableCount();this.bInitialized=true;this.detachModelContextChange(I);}};T.prototype.init=function(){X.prototype.init.call(this);var i=this.getInnerTable(),C=i.getMetadata().getName();if([b,c].join(" ").indexOf(C)>-1){if(C===b){this.oTableController=new G(this);}else{this.oTableController=new a(this);}this.oFieldController=new F(null,this);this.attachModelContextChange(I);}};T.prototype.getInnerTable=function(){return this.get_content();};T.prototype.handleDataRequested=function(e){this.oTableController.handleDataRequested(e);};T.prototype.handleDataReceived=function(e){this.oTableController.handleDataReceived(e);};T.prototype.handleSelectionChange=function(e){this.oTableController.enableDisableActions();this.fireSelectionChange(e.getParameters());};T.prototype.handleItemPress=function(e){this.fireItemPress({listItem:e.getParameter("listItem")});};T.prototype.handleCallAction=function(e){this.oTableController.handleCallAction(e);};T.prototype.getSelectedContexts=function(){var i=this.getInnerTable();var s=[];if(i.getMetadata().getName()===b){var S=i.getSelectedIndices();for(var d in S){s.push(i.getContextByIndex(d));}}else{s=i.getSelectedContexts();}return s;};T.prototype.getEntitySet=function(){var l=this.getListBinding().getPath();return l.substr(1);};T.prototype.getListBinding=function(){return this.oTableController.getListBinding();};T.prototype.getListBindingInfo=function(){return this.oTableController.getListBindingInfo();};T.prototype.setShowOverlay=function(){this.getInnerTable().setShowOverlay(true);};T.prototype.onStandardActionClick=function(e){this.oTableController.onStandardActionClick(e);};T.prototype.onContactDetails=function(e){this.oFieldController.onContactDetails(e);};T.prototype.onDraftLinkPressed=function(e){this.oFieldController.onDraftLinkPressed(e);};T.prototype.onDataFieldWithIntentBasedNavigationPressed=function(e){this.oFieldController.onDataFieldWithIntentBasedNavigationPressed(e);};T.prototype._updateColumnsPopinFeature=function(){if(!this.getDemandPopin()){return;}var C=this.getInnerTable().getColumns();if(!C){return;}C=C.filter(function(d){return d.getVisible();});C.sort(function(d,e){return d.getOrder()-e.getOrder();});var o,l=C.length;for(var i=0;i<l;i++){o=C[i];if(i<2){o.setDemandPopin(false);o.setMinScreenWidth("1px");}else{o.setDemandPopin(true);if(o.getPopinDisplay()!="WithoutHeader"){o.setPopinDisplay(sap.m.PopinDisplay.Inline);}o.setMinScreenWidth((i+1)*10+"rem");}}};T.prototype._deactivateColumnsPopinFeature=function(){var C=this._oTable.getColumns();if(!C){return;}var o,l=C.length;for(var i=0;i<l;i++){o=C[i];o.setDemandPopin(false);o.setMinScreenWidth("1px");}};T.prototype.setDemandPopin=function(d){var o=this.getDemandPopin();if(o===d){return;}this.setProperty("demandPopin",d,true);if(d){this._updateColumnsPopinFeature();}else{this._deactivateColumnsPopinFeature();}};T._helper={getLineItemCollection:function(C,m){var e,A,E,o,p,s,w;if(typeof C==="string"){throw new Error("Not yet implemented");}else if(C.getModel()instanceof sap.ui.model.json.JSONModel){return C.getObject("/columns");}else{o=C.getObject("/columns");if(o){A=o.getObject("./@sapui.name");E=C.getObject("/entitySet");e=E.getPath()+"/";o=E.oModel.getMetaContext(e+A);if(A.indexOf("@com.sap.vocabularies.UI.v1.LineItem")>=0||o.getObject("$kind")==="EntityType"){return o;}else if(A.indexOf("@com.sap.vocabularies.UI.v1.PresentationVariant")>=0){p=o.getObject();w=T._helper._getVisualization(p,A);return o.oModel.getMetaContext(e+w.lineItemPath);}else if(A.indexOf("@com.sap.vocabularies.UI.v1.SelectionPresentationVariant")>=0){s=o.getObject();w=T._helper._getPresentationVariant(s,A);p=o.getObject(e+w.presentationVariantPath);w=T._helper._getVisualization(p,w.presentationVariantPath);return o.oModel.getContext(e+w.lineItemPath);}}else{E=C.getObject("/entitySet");throw new Error("Not yet implemented");}}},_resolveDataField:function(C){if(C.getObject("$Type").indexOf("com.sap.vocabularies.Common.v1.ValueListParameter")===0){var v=C.getModel();var V=v.getObject("/");return V.$model.getMetaModel().createBindingContext('/'+V.CollectionPath+'/'+C.getObject("ValueListProperty"));}return C;},_getVisualization:function(p,A){var w={};if(p&&p.Visualizations){p.Visualizations.forEach(function(v){if(v.$AnnotationPath.indexOf("@com.sap.vocabularies.UI.v1.LineItem")>-1){w.lineItemPath=A.slice(0,A.indexOf("@com.sap.vocabularies.UI.v1.PresentationVariant"))+v.$AnnotationPath;}if(v.$AnnotationPath.indexOf("@com.sap.vocabularies.UI.v1.Chart")>-1){w.chartPath=A.slice(0,A.indexOf("@com.sap.vocabularies.UI.v1.PresentationVariant"))+v.$AnnotationPath;}});}return w;},_getPresentationVariant:function(s,A){var w={};if(s&&s.PresentationVariant){if(s.PresentationVariant.$Path){w.presentationVariantPath=A.slice(0,A.indexOf("@com.sap.vocabularies.UI.v1.SelectionPresentationVariant"))+s.PresentationVariant.$Path;}else{w.presentationVariantPath=A+"/PresentationVariant";}}return w;},createAggregationBinding:function(i,e,t,l){if(t){return'{'+t+'}';}var E='',m=i.getInterface(0),M=m.getModel(),s=M.getObject(m.getPath()+"@sapui.name"),n=l?"id: '"+l+"', ":'';if(m.getModel().getObject(m.getPath()+"@com.sap.vocabularies.Common.v1.DraftRoot")){E="$expand : 'DraftAdministrativeData'";}return"{ path : '/"+s+"', parameters : { "+n+" $count : true "+(E?',':'')+E+"}, events : {dataRequested : '.handleDataRequested', dataReceived : '.handleDataReceived'} }";},getSelectionMode:function(C,e,w){C=C.getInterface(0);var l=w['@com.sap.vocabularies.UI.v1.LineItem'];for(var i=0;i<l.length;i++){if(l[i].$Type==="com.sap.vocabularies.UI.v1.DataFieldForAction"&&!l[i].Inline){return sap.m.ListMode.MultiSelect;}}return L.None;},getMetaContextPath:function(C){return C.getPath();}};T._helper.getMetaContextPath.requiresIContext=true;T._helper.createAggregationBinding.requiresIContext=true;T._helper.getSelectionMode.requiresIContext=true;return T;},true);
