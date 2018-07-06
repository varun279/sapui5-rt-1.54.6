/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2018 SAP SE. All rights reserved
	
 */
sap.ui.define(["jquery.sap.global","sap/ui/comp/library","sap/ui/core/Control","sap/suite/ui/microchart/library","sap/m/ValueColor","sap/ui/comp/smartmicrochart/SmartMicroChartCommons"],function(q,l,C,M,V,S){"use strict";var a=C.extend("sap.ui.comp.smartmicrochart.SmartBulletMicroChart",{metadata:{library:"sap.ui.comp",designtime:"sap/ui/comp/designtime/smartmicrochart/SmartBulletMicroChart.designtime",properties:{entitySet:{type:"string",group:"Misc",defaultValue:null},showLabel:{type:"boolean",group:"Appearance",defaultValue:true},chartType:{type:"string",group:"Misc",defaultValue:"Bullet"},enableAutoBinding:{type:"boolean",group:"Misc",defaultValue:false},chartBindingPath:{type:"string",group:"Misc",defaultValue:null},width:{type:"sap.ui.core.CSSSize",group:"Misc",defaultValue:"164px"},isResponsive:{type:"boolean",group:"Appearance",defaultValue:false}},defaultAggregation:"_chart",aggregations:{_criticalityThresholds:{type:"sap.ui.core.CustomData",multiple:true,visibility:"hidden"},_chart:{type:"sap.suite.ui.microchart.BulletMicroChart",multiple:false,visibility:"hidden"}},associations:{chartTitle:{type:"sap.m.Label",group:"Misc",multiple:false},chartDescription:{type:"sap.m.Label",group:"Misc",multiple:false},unitOfMeasure:{type:"sap.m.Label",group:"Misc",multiple:false}},events:{initialize:{}}}});a._CRITICAL_COLOR=V.Critical;a._ERROR_COLOR=V.Error;a._CHART_TYPE=["Bullet"];a.prototype.init=function(){this._bIsInitialized=false;this._bMetaModelLoadAttached=false;this._bBarColorSet=false;this.setProperty("chartType","Bullet",true);this.setAggregation("_chart",new M.BulletMicroChart({"showValueMarker":true}),true);};a.prototype.setChartType=function(){return this;};a.prototype.setEntitySet=function(e){if(this.getProperty("entitySet")!==e){this.setProperty("entitySet",e,true);S._initializeMetadata.call(this);}return this;};a.prototype.setShowLabel=function(s){if(this.getShowLabel()!==s){this.setProperty("showLabel",s,true);var c=this.getAggregation("_chart");c.setProperty("showActualValue",s,true);c.setProperty("showTargetValue",s,true);c.setProperty("showDeltaValue",s,true);c.setProperty("showValueMarker",s,true);this.invalidate();}return this;};a.prototype.propagateProperties=function(){if(C.prototype.propagateProperties){C.prototype.propagateProperties.apply(this,arguments);}S._initializeMetadata.call(this);};a.prototype.onBeforeRendering=function(){var c=this.getAggregation("_chart");c.setProperty("width",this.getWidth(),true);c.setProperty("isResponsive",this.getIsResponsive(),true);M._passParentContextToChild(this,c);};a.prototype.destroy=function(){S._cleanup.call(this);C.prototype.destroy.apply(this,arguments);};a.prototype._createAndBindInnerChart=function(){this._bindValueProperties();this._bindActualValue();this._bindChartThresholds();S._updateAssociations.call(this);};a.prototype._bindValueProperties=function(){var m,f,i=this.getAggregation("_chart");if(S._hasMember(this,"_oDataPointAnnotations.TargetValue.Path")){i.bindProperty("targetValue",{path:this._oDataPointAnnotations.TargetValue.Path,type:"sap.ui.model.odata.type.Decimal"});var F=S._getLabelNumberFormatter.call(this,this._oDataPointAnnotations.TargetValue.Path);i.bindProperty("targetValueLabel",{path:this._oDataPointAnnotations.TargetValue.Path,formatter:F.format.bind(F)});}if(S._hasMember(this,"_oDataPointAnnotations.ForecastValue.Path")){i.bindProperty("forecastValue",{path:this._oDataPointAnnotations.ForecastValue.Path,type:"sap.ui.model.odata.type.Decimal"});}if(this._oDataPointAnnotations.MaximumValue){if(this._oDataPointAnnotations.MaximumValue.hasOwnProperty("Path")){i.bindProperty("maxValue",{path:this._oDataPointAnnotations.MaximumValue.Path,type:"sap.ui.model.odata.type.Decimal"});}else if(this._oDataPointAnnotations.MaximumValue.hasOwnProperty("Decimal")){m=parseFloat(this._oDataPointAnnotations.MaximumValue.Decimal);i.setMaxValue(m,true);}}if(this._oDataPointAnnotations.MinimumValue){if(this._oDataPointAnnotations.MinimumValue.hasOwnProperty("Path")){i.bindProperty("minValue",{path:this._oDataPointAnnotations.MinimumValue.Path,type:"sap.ui.model.odata.type.Decimal"});}else if(this._oDataPointAnnotations.MinimumValue.hasOwnProperty("Decimal")){f=parseFloat(this._oDataPointAnnotations.MinimumValue.Decimal);i.setMinValue(f,true);}}};a.prototype._bindActualValue=function(){var i=this.getAggregation("_chart"),f=S._getLabelNumberFormatter.call(this,this._oDataPointAnnotations.Value.Path);var c=new M.BulletMicroChartData({value:{path:this._oDataPointAnnotations.Value.Path,type:"sap.ui.model.odata.type.Decimal"},color:{parts:[this._oDataPointAnnotations.Value&&this._oDataPointAnnotations.Value.Path||"",this._oDataPointAnnotations.Criticality&&this._oDataPointAnnotations.Criticality.Path||""],formatter:S._getValueColor.bind(this)}});i.setAggregation("actual",c,true);i.bindProperty("actualValueLabel",{path:this._oDataPointAnnotations.Value.Path,formatter:f.format.bind(f)});};a.prototype._bindChartThresholds=function(){var d,c;if(S._hasMember(this._oDataPointAnnotations,"CriticalityCalculation.ImprovementDirection.EnumMember")){c=this._oDataPointAnnotations.CriticalityCalculation;d=c.ImprovementDirection.EnumMember;if(d!==S._MINIMIZE&&c.DeviationRangeLowValue&&c.DeviationRangeLowValue.Path){this._bindThresholdAggregation(c.DeviationRangeLowValue.Path,a._ERROR_COLOR);}if(d!==S._MINIMIZE&&c.ToleranceRangeLowValue&&c.ToleranceRangeLowValue.Path){this._bindThresholdAggregation(c.ToleranceRangeLowValue.Path,a._CRITICAL_COLOR);}if(d!==S._MAXIMIZE&&c.ToleranceRangeHighValue&&c.ToleranceRangeHighValue.Path){this._bindThresholdAggregation(c.ToleranceRangeHighValue.Path,a._CRITICAL_COLOR);}if(d!==S._MAXIMIZE&&c.DeviationRangeHighValue&&c.DeviationRangeHighValue.Path){this._bindThresholdAggregation(c.DeviationRangeHighValue.Path,a._ERROR_COLOR);}}};a.prototype._bindThresholdAggregation=function(p,c){var t=new M.BulletMicroChartData({value:{path:p,type:"sap.ui.model.odata.type.Decimal"},color:c});this.getAggregation("_chart").addAggregation("thresholds",t,true);};a.prototype.setAssociation=function(A,i,s){if(C.prototype.setAssociation){C.prototype.setAssociation.apply(this,arguments);}S._updateAssociation.call(this,A);return this;};a.prototype._getSupportedChartTypes=function(){return a._CHART_TYPE;};a.prototype.getAccessibilityInfo=function(){return S._getAccessibilityInfo.apply(this);};return a;});
