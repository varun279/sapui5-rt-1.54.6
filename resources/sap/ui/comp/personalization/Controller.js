/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2018 SAP SE. All rights reserved
	
 */
sap.ui.define(['jquery.sap.global','sap/ui/base/ManagedObject','./ColumnsController','./FilterController','./GroupController','./SortController','./DimeasureController','./SelectionController','./Util','sap/ui/comp/library','./ChartWrapper','./SelectionWrapper','./ColumnHelper','sap/ui/core/MessageType','sap/m/P13nDialog','./Validator','sap/ui/model/json/JSONModel'],function(q,M,C,F,G,S,D,a,U,b,c,d,e,f,P,V,J){"use strict";var g=M.extend("sap.ui.comp.personalization.Controller",{constructor:function(i,s){M.apply(this,arguments);},metadata:{library:"sap.ui.comp",properties:{setting:{type:"object",defaultValue:{}},resetToInitialTableState:{type:"boolean",defaultValue:true},columnKeys:{type:"string[]",defaultValue:[]}},associations:{table:{type:"object",multiple:false}},events:{beforePotentialTableChange:{},afterPotentialTableChange:{},afterP13nModelDataChange:{parameters:{persistentData:{type:"object"},persistentDataChangeType:{type:"sap.ui.comp.personalization.ChangeType"},runtimeDeltaData:{type:"object"},runtimeDeltaDataChangeType:{type:"sap.ui.comp.personalization.ChangeType"}}},requestColumns:{parameters:{columnKeys:{type:"string"}}},dialogAfterClose:{},dialogAfterOpen:{},dialogConfirmedReset:{}}}});g.prototype.applySettings=function(s){M.prototype.applySettings.apply(this,arguments);this._initialize();};g.prototype._initialize=function(){this._bInitCalled=true;var t=this.getTable();if(!t){throw"The table instance should be passed into constructor.";}this._createSettingCurrent(this.getSetting());var h=t.getColumns();if(!this.getColumnKeys().length){this.setProperty("columnKeys",U.getColumnKeys(h),true);}var m=this._createInternalModel(this.getColumnKeys());this._callControllers(this._oSettingCurrent,"initializeInternalModel",m);this._oColumnHelper=new e({callbackOnSetVisible:this._onSetVisible.bind(this),callbackOnSetSummed:this._onSetSummed.bind(this)});this._oColumnHelper.addColumns(h);this._callControllers(this._oSettingCurrent,"setColumnHelper",this._oColumnHelper);this._callControllers(this._oSettingCurrent,"setTriggerModelChangeOnColumnInvisible");this._callControllers(this._oSettingCurrent,"setTable",t);this._callControllers(this._oSettingCurrent,"setColumnKeys",this.getColumnKeys());this._callControllers(this._oSettingCurrent,"setIgnoreColumnKeys");this._callControllers(this._oSettingCurrent,"checkConsistencyOfIgnoreColumnKeys");this._callControllers(this._oSettingCurrent,"calculateIgnoreData");this._extendModelStructure(Object.keys(this._oColumnHelper.getColumnMap()));this._callControllers(this._oSettingCurrent,"calculateControlData");};g.prototype.init=function(){this._oDialog=null;this._aColumnKeysOfDateType=[];this._aColumnKeysOfBooleanType=[];this._aColumnKeysOfTimeType=[];this._bIsDirty=false;this._bInitCalled=false;this._bSuspend=false;this._bUnconfirmedResetPressed=false;this._oColumnHelper=null;this._oSettingCurrent={};};g.prototype.setSetting=function(s){if(this._bInitCalled){throw"The setting instance should be passed only into constructor.";}s=this.validateProperty("setting",s);this.setProperty("setting",s,true);return this;};g.prototype.setResetToInitialTableState=function(r){if(this._bInitCalled){throw"The resetToInitialTableState property should be passed only into constructor.";}r=this.validateProperty("resetToInitialTableState",r);this.setProperty("resetToInitialTableState",r,true);return this;};g.prototype.setColumnKeys=function(h){if(this._bInitCalled){throw"The columnKeys array should be passed only into constructor.";}h=this.validateProperty("columnKeys",h);this.setProperty("columnKeys",h,true);return this;};g.prototype.setTable=function(t){if(this._bInitCalled){throw"The table instance should be passed only into constructor.";}this.setAssociation("table",t);return this;};g.prototype._createSettingCurrent=function(s){var t=U.getTableType(this.getTable());var h,T;switch(t){case sap.ui.comp.personalization.TableType.ChartWrapper:h=[sap.m.P13nPanelType.dimeasure,sap.m.P13nPanelType.sort,sap.m.P13nPanelType.filter];break;case sap.ui.comp.personalization.TableType.SelectionWrapper:h=[sap.m.P13nPanelType.selection];break;default:h=[sap.m.P13nPanelType.columns,sap.m.P13nPanelType.sort,sap.m.P13nPanelType.filter,sap.m.P13nPanelType.group];}for(T in s){if(s[T].visible===false&&h.indexOf(T)>-1){h.splice(h.indexOf(T),1);}if(s[T].visible===true){h.push(T);}}h.forEach(function(T){this._oSettingCurrent[T]={visible:true,controller:(s[T]&&s[T].controller)?s[T].controller:this._controllerFactory(T),payload:(s[T]&&s[T].payload)?s[T].payload:undefined,ignoreColumnKeys:(s[T]&&s[T].ignoreColumnKeys)?s[T].ignoreColumnKeys:[],triggerModelChangeOnColumnInvisible:(s[T]&&s[T].triggerModelChangeOnColumnInvisible)?s[T].triggerModelChangeOnColumnInvisible:undefined};},this);};g.prototype._mixSetting=function(s,o){if(!o){return s;}for(var t in o){if(o[t].visible===true&&s[t]&&s[t].visible===true){o[t].controller=s[t].controller;o[t].payload=o[t].payload||s[t].payload;}}return o;};g.prototype.openDialog=function(s){this._suspendTable();this._prepareDialogUi();var o=this._mixSetting(this._oSettingCurrent,s);this._oDialog=new P({stretch:sap.ui.Device.system.phone,showReset:(s&&s.showReset!==undefined)?s.showReset:true,showResetEnabled:this._bIsDirty,initialVisiblePanelType:this._oInitialVisiblePanelType,validationExecutor:function(h){var T=U.getTableType(this.getTable());var i=this._oColumnHelper.getColumnMap();var j=this._callControllers(o,"getUnionData",this._getControlDataInitial(),this._getControlDataReduce());return V.checkGroupAndColumns(T,o,h,i,j,[]).then(function(r){return V.checkSaveChanges(T,o,h,r).then(function(r){return r;});});}.bind(this)});this._oDialog.toggleStyleClass("sapUiSizeCompact",!!q(this.getTable().getDomRef()).closest(".sapUiSizeCompact").length);if(s&&s.contentWidth){this._oDialog.setContentWidth(s.contentWidth);}if(s&&s.contentHeight){this._oDialog.setContentHeight(s.contentHeight);}if(s&&s.styleClass){this._oDialog.addStyleClass(s.styleClass);}var p=this._callControllers(o,"getPanel");for(var t in o){if(p[t]){this._oDialog.addPanel(p[t]);}}this._oDialog.attachOk(this._handleDialogOk,this);this._oDialog.attachCancel(this._handleDialogCancel,this);this._oDialog.attachReset(this._handleDialogReset,this);this._oDialog.attachAfterClose(this._handleDialogAfterClose,this);this._oDialog.open();this.fireDialogAfterOpen();};g.prototype.addColumns=function(o){var t=this.getTable();Object.keys(o).forEach(function(s){if(!o[s].getParent()){t.addDependent(o[s]);}});this._oColumnHelper.addColumnMap(o);};g.prototype.getDataSuiteFormatSnapshot=function(){this._callControllers(this._oSettingCurrent,"calculateControlData");var r={};this._callControllers(this._oSettingCurrent,"getDataSuiteFormatSnapshot",r);return r;};g.prototype.setDataSuiteFormatSnapshot=function(r,p){var R=this._callControllers(this._oSettingCurrent,"getDataSuiteFormat2Json",r);this._setRuntimeAndPersonalizationData(R,p);};g.prototype.setPersonalizationDataAsDataSuiteFormat=function(r){var R=this._callControllers(this._oSettingCurrent,"getDataSuiteFormat2Json",r);this._setRuntimeAndPersonalizationData(R,R);};g.prototype.setPersonalizationData=function(p){this._setRuntimeAndPersonalizationData(p,p);};g.prototype.resetPersonalization=function(r){r=this._determineResetType(r);if(r===sap.ui.comp.personalization.ResetType.ResetFull){this._resetFull();}else{this._resetPartial();}this._suspendTable();this._syncTableUi();this._resumeTable(true);this._fireChangeEvent(r);};g.prototype.addToSettingIgnoreColumnKeys=function(h){this._callControllers(this._oSettingCurrent,"setAdditionalIgnoreColumnKeys",h);this._callControllers(this._oSettingCurrent,"calculateIgnoreData");this._requestMissingColumnsWithoutIgnore(this._getControlDataBase());this._suspendTable();this._syncTableUi();this._resumeTable(true);this._fireChangeEvent();return this;};g.prototype._handleDialogReset=function(){this._bUnconfirmedResetPressed=true;var r=this._determineResetType();if(r===sap.ui.comp.personalization.ResetType.ResetFull){this._resetFull();}else{this._resetPartial();}this._syncDialogUi();};g.prototype._handleDialogOk=function(){this._oDialog.detachOk(this._handleDialogOk,this);if(this._bUnconfirmedResetPressed){this.fireDialogConfirmedReset();}setTimeout(function(){this._postDialogUi(this._getControlDataReduce());this._syncTableUi();this._resumeTable(true);this._fireChangeEvent();}.bind(this),0);this._oDialog.close();};g.prototype._handleDialogCancel=function(){this._oDialog.detachCancel(this._handleDialogCancel,this);setTimeout(function(){this._postDialogUi(this._getBeforeOpenData());this._resumeTable(false);}.bind(this),0);this._oDialog.close();};g.prototype._handleDialogAfterClose=function(){this._oInitialVisiblePanelType=this._oDialog.getVisiblePanel()?this._oDialog.getVisiblePanel().getType():this._getInitialVisiblePanelType();this._bUnconfirmedResetPressed=false;if(this._oDialog){this._oDialog.destroy();this._oDialog=null;}this.fireDialogAfterClose();};g.prototype._getInitialVisiblePanelType=function(){for(var t in this._oSettingCurrent){return t;}};g.prototype._suspendTable=function(){if(U.getTableBaseType(this.getTable())===sap.ui.comp.personalization.TableType.Table){this._bSuspend=true;}};g.prototype._resumeTable=function(i){i=(i===undefined)?true:i;var t=this.getTable();if(this._bSuspend){if(t){if(i){t.invalidate();}}this._bSuspend=false;}};g.prototype._requestMissingColumnsWithoutIgnore=function(j){var o=this._callControllers(this._oSettingCurrent,"determineMissingColumnKeys",j);var m=U.getUnionOfColumnKeys(o);if(!m.length){return[];}this.fireRequestColumns({columnKeys:m});return m;};g.prototype._extendModelStructure=function(h){if(!h.length){return;}var j=this._callControllers(this._oSettingCurrent,"createColumnKeysStructure",h);var o=this._callControllers(this._oSettingCurrent,"getTable2Json",j);this._callControllers(this._oSettingCurrent,"extendControlDataInitial",o);this._callControllers(this._oSettingCurrent,"extendVariantDataInitial",o);this._callControllers(this._oSettingCurrent,"extendControlDataBase",o);this._callControllers(this._oSettingCurrent,"extendAlreadyKnownRuntimeData",o);this._callControllers(this._oSettingCurrent,"extendAlreadyKnownPersistentData",o);};g.prototype._setRuntimeAndPersonalizationData=function(r,p){r=(r===null?{}:r);if(!this._sanityCheck(r)){return;}p=(p===null?{}:p);if(!this._sanityCheck(p)){return;}this._setVariantData(p);this._extendModelStructure(this._requestMissingColumnsWithoutIgnore(r));var j=this._callControllers(this._oSettingCurrent,"getUnionData",this._getControlDataInitial(),p);this._callControllers(this._oSettingCurrent,"setVariantDataInitial2Model",j);var R=this._callControllers(this._oSettingCurrent,"getUnionData",this._getControlDataInitial(),r);this._callControllers(this._oSettingCurrent,"fixConflictWithIgnore",R,this._getIgnoreData());this._callControllers(this._oSettingCurrent,"setControlDataBase2Model",R);this._suspendTable();this._syncTableUi();this._resumeTable(true);this._fireChangeEvent();};g.prototype._prepareDialogUi=function(){var j=this._callControllers(this._oSettingCurrent,"createColumnKeysStructure",this.getColumnKeys());this._extendModelStructure(this._requestMissingColumnsWithoutIgnore(j));this._callControllers(this._oSettingCurrent,"setBeforeOpenData2Model",this._getControlDataBase());this._callControllers(this._oSettingCurrent,"calculateControlDataReduce");var o=this._callControllers(this._oSettingCurrent,"getTable2JsonTransient",j);this._callControllers(this._oSettingCurrent,"calculateTransientData",o);};g.prototype._postDialogUi=function(j){this._callControllers(this._oSettingCurrent,"updateControlDataBaseFromJson",j);this._callControllers(this._oSettingCurrent,"setBeforeOpenData2Model",undefined);this._callControllers(this._oSettingCurrent,"setControlDataReduce2Model",undefined);this._callControllers(this._oSettingCurrent,"setTransientData2Model",undefined);};g.prototype._syncDialogUi=function(){this._callControllers(this._oSettingCurrent,"calculateControlDataReduce");};g.prototype._syncTableUi=function(){this._callControllers(this._oSettingCurrent,"calculateControlData");this._callControllers(this._oSettingCurrent,"syncJson2Table",this._getControlData());};g.prototype._resetFull=function(){this._setVariantData(undefined);this._callControllers(this._oSettingCurrent,"setControlDataBase2Model",this._getControlDataInitial());};g.prototype._resetPartial=function(){this._callControllers(this._oSettingCurrent,"setControlDataBase2Model",this._getVariantDataInitial());};g.prototype._fireChangeEvent=function(r){r=this._determineResetType(r);var o={};var h=this._callControllers(this._oSettingCurrent,"getUnionData",this._getControlDataInitial(),this._getControlData());o.runtimeDeltaDataChangeType=this._callControllers(this._oSettingCurrent,"getChangeType",h,this._getAlreadyKnownRuntimeData());var i=this._callControllers(this._oSettingCurrent,"getUnionData",this._getControlDataInitial(),this._getControlDataBase());o.persistentDeltaDataChangeType=this._callControllers(this._oSettingCurrent,"getChangeType",i,this._getAlreadyKnownPersistentData());if(r===sap.ui.comp.personalization.ResetType.ResetFull){o.persistentDataChangeType=this._callControllers(this._oSettingCurrent,"getChangeType",this._getControlDataBase(),this._getControlDataInitial());}else if(r===sap.ui.comp.personalization.ResetType.ResetPartial){o.persistentDataChangeType=this._callControllers(this._oSettingCurrent,"getChangeType",this._getControlDataBase(),this._getVariantDataInitial());}this._bIsDirty=U.hasChangedType(o.persistentDataChangeType);if(!U.hasChangedType(o.runtimeDeltaDataChangeType)&&!U.hasChangedType(o.persistentDeltaDataChangeType)){return;}this._aColumnKeysOfDateType=U.getColumnKeysOfType("date",this._oColumnHelper.getColumnMap());this._aColumnKeysOfTimeType=U.getColumnKeysOfType("time",this._oColumnHelper.getColumnMap());this._aColumnKeysOfBooleanType=U.getColumnKeysOfType("boolean",this._oColumnHelper.getColumnMap());var j=this._callControllers(this._oSettingCurrent,"getChangeData",h,this._getAlreadyKnownRuntimeData());o.runtimeDeltaData=U.removeEmptyProperty(U.copy(j));U.recoverPersonalisationDateData(o.runtimeDeltaData,this._aColumnKeysOfDateType);U.recoverPersonalisationTimeData(o.runtimeDeltaData,this._aColumnKeysOfTimeType);U.recoverPersonalisationBooleanData(o.runtimeDeltaData,this._aColumnKeysOfBooleanType);var p=this._callControllers(this._oSettingCurrent,"getChangeData",this._getControlDataBase(),this._getControlDataInitial());o.persistentData=U.removeEmptyProperty(p);U.recoverPersonalisationDateData(o.persistentData,this._aColumnKeysOfDateType);U.recoverPersonalisationTimeData(o.persistentData,this._aColumnKeysOfTimeType);U.recoverPersonalisationBooleanData(o.persistentData,this._aColumnKeysOfBooleanType);delete o.persistentDeltaDataChangeType;this.fireAfterP13nModelDataChange(o);this._callControllers(this._oSettingCurrent,"setAlreadyKnownRuntimeData2Model",this._getControlData());this._callControllers(this._oSettingCurrent,"setAlreadyKnownPersistentData2Model",this._getControlDataBase());};g.prototype._onSetVisible=function(v,s){if(v){var i=U.getUnionOfAttribute(this._oSettingCurrent,"ignoreColumnKeys");if(i.indexOf(s)>-1){throw"The provided 'ignoreColumnKeys' are inconsistent. No column specified as ignored is allowed to be visible. "+this;}}};g.prototype._onSetSummed=function(i,o){this._oSettingCurrent.columns.controller._onColumnTotal({column:o,isSummed:i});};g.prototype._getArgumentsByType=function(A,t){var r=[],o=null;if(A&&A.length&&t){A.forEach(function(h){if(h&&h[t]&&typeof h[t]!=="function"){o={};o[t]=h[t];r.push(o);}else{r.push(h);}});}return r;};g.prototype._callControllers=function(s,m){var o,h,A;var r={},i=Array.prototype.slice.call(arguments,2);for(var t in s){o=h=A=null;o=s[t];h=o.controller;if(!h||!o.visible||!h[m]){continue;}A=this._getArgumentsByType(i,t);if(m==="getPanel"){A.push(o.payload);}else if(m==="setIgnoreColumnKeys"){A.push(o.ignoreColumnKeys);}else if(m==="setTriggerModelChangeOnColumnInvisible"){A.push(o.triggerModelChangeOnColumnInvisible);}var R=h[m].apply(h,A);if(R!==null&&R!==undefined&&R[t]!==undefined){r[t]=R[t];}else{r[t]=R;}}return r;};g.prototype._sanityCheck=function(j){return true;};g.prototype._createInternalModel=function(h){var m=new J();m.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);if(h.length){m.setSizeLimit(h.length);}this.setModel(m,"$sapuicomppersonalizationBaseController");return m;};g.prototype._getInternalModel=function(){return this.getModel("$sapuicomppersonalizationBaseController");};g.prototype._getInternalModelData=function(s){return this._getInternalModel().getProperty("/"+s);};g.prototype._getControlDataInitial=function(){return this._getInternalModelData("controlDataInitial");};g.prototype._getControlDataBase=function(){return this._getInternalModelData("controlDataBase");};g.prototype._getIgnoreData=function(){return this._getInternalModelData("ignoreData");};g.prototype._getControlData=function(){return this._getInternalModelData("controlData");};g.prototype._getControlDataReduce=function(){return this._getInternalModelData("controlDataReduce");};g.prototype._getTransientData=function(){return this._getInternalModelData("transientData");};g.prototype._getAlreadyKnownRuntimeData=function(){return this._getInternalModelData("alreadyKnownRuntimeData");};g.prototype._getAlreadyKnownPersistentData=function(){return this._getInternalModelData("alreadyKnownPersistentData");};g.prototype._getVariantDataInitial=function(){return this._getInternalModelData("variantDataInitial");};g.prototype._getBeforeOpenData=function(){return this._getInternalModelData("beforeOpenData");};g.prototype._setVariantData=function(j){this._getInternalModel().setProperty("/variantData",j?U.copy(j):undefined);};g.prototype._getVariantData=function(){return this._getInternalModel().getProperty("/variantData");};g.prototype._getControllers=function(){return this._oSettingCurrent;};g.prototype._controllerFactory=function(t){var h=this;switch(t){case sap.m.P13nPanelType.columns:return new C({afterColumnsModelDataChange:function(){h._fireChangeEvent();},beforePotentialTableChange:function(){h.fireBeforePotentialTableChange();},afterPotentialTableChange:function(){h.fireAfterPotentialTableChange();}});case sap.m.P13nPanelType.sort:return new S({afterSortModelDataChange:function(){h._fireChangeEvent();},beforePotentialTableChange:function(){h.fireBeforePotentialTableChange();},afterPotentialTableChange:function(){h.fireAfterPotentialTableChange();}});case sap.m.P13nPanelType.filter:return new F({afterFilterModelDataChange:function(){h._fireChangeEvent();},beforePotentialTableChange:function(){h.fireBeforePotentialTableChange();},afterPotentialTableChange:function(){h.fireAfterPotentialTableChange();}});case sap.m.P13nPanelType.group:return new G({afterGroupModelDataChange:function(){h._fireChangeEvent();},beforePotentialTableChange:function(){h.fireBeforePotentialTableChange();},afterPotentialTableChange:function(){h.fireAfterPotentialTableChange();}});case sap.m.P13nPanelType.dimeasure:return new D({afterDimeasureModelDataChange:function(){h._fireChangeEvent();},beforePotentialTableChange:function(){h.fireBeforePotentialTableChange();},afterPotentialTableChange:function(){h.fireAfterPotentialTableChange();}});case sap.m.P13nPanelType.selection:return new a({afterSelectionModelDataChange:function(){h._fireChangeEvent();},beforePotentialTableChange:function(){h.fireBeforePotentialTableChange();},afterPotentialTableChange:function(){h.fireAfterPotentialTableChange();}});default:throw"Panel type '"+t+"' is not valid";}};g.prototype.getTable=function(){var t=this.getAssociation("table");if(typeof t==="string"){t=sap.ui.getCore().byId(t);}return t;};g.prototype.exit=function(){var t;this._resumeTable(false);if(this._oDialog){this._oDialog.destroy();this._oDialog=null;}this._callControllers(this._oSettingCurrent,"destroy");for(t in this._oSettingCurrent){this._oSettingCurrent[t]=null;}this._oSettingCurrent=null;this._oColumnHelper=null;};g.prototype._determineResetType=function(r){r=r||this.getResetToInitialTableState()?sap.ui.comp.personalization.ResetType.ResetFull:sap.ui.comp.personalization.ResetType.ResetPartial;if(r===sap.ui.comp.personalization.ResetType.ResetFull||this._getVariantData()===undefined){return sap.ui.comp.personalization.ResetType.ResetFull;}return sap.ui.comp.personalization.ResetType.ResetPartial;};g.SyncReason={ResetFull:14,ResetPartial:15,NewModelDataMixedWithVariant:7};return g;},true);
