/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
/**
 * Adds support rules to the core - right now commented out, to activate it you need to remove the underscore
 */
sap.ui.predefine('sap/suite/ui/generic/template/library.support',[	"jquery.sap.global",
				"./support/SupportAssistant/Config.support",
				"./support/SupportAssistant/Runtime.support"],
	function(jQuery, ConfigSupport, RuntimeSupport) {
	"use strict";


	return {

		name: "sap.suite.ui.generic.template",
		niceName: "Fiori Element Library",
		ruleset: [
			ConfigSupport,
			RuntimeSupport
		]
	};

}, true);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
/**
 * Defines support rules for the app configuration.
 */
sap.ui.predefine('sap/suite/ui/generic/template/support/SupportAssistant/Config.support',[
	"jquery.sap.global",
	"sap/ui/support/library"
], function(
	jQuery,
	SupportLib) {
	"use strict";


	// shortcuts
	var Categories = SupportLib.Categories; // Accessibility, Performance, Memory, ...
	var Severity = SupportLib.Severity; // Hint, Warning, Error
	var Audiences = SupportLib.Audiences; // Control, Internal, Application*/

	//**********************************************************
	// Rule Definitions
	//**********************************************************

	/*modelPreloading -> (5.) app descriptor FE change -> preload property check, can be also checked more strict with "preload" === true (Metadata document in parallel to component)*/
	var oModelPreloading = {
		id: "modelPreloadingFioriElements",
		audiences: [Audiences.Application, Audiences.Internal],
		categories: [Categories.Performance],
		enabled: true,
		minversion: "1.38",
		title: "Default Model preloading required for Fiori Elements List Report applications",
		description: "Preloaded models, which load their data from extern locations, can start to load data earlier. This leads to an application performance improvement. For Fiori Elements List Report the default model (\"\") should be set to true.",
		resolution: "Adapt your application descriptor: set the default model (\"\") to \"preload\": true. Note: the \"preload\" attribute requires at least app descriptor version 1.4.0.",
		resolutionurls: [{
			text: 'Manifest Model Preload',
			href: 'https://openui5.hana.ondemand.com/#/topic/26ba6a5c1e5c417f8b21cce1411dba2c'
		}],
		check: function(oIssueManager, oCoreFacade, oScope) {
			//sap.ui5/models: for default model (""), set "preload": true (note: the "preload" attribute requires at least app descriptor version 1.4.0).
			var mComponents = oCoreFacade.getComponents();
			var bRelevantModelsUsed = false;
			var bModelPreload = false;
			var bFioriElementsApp = false;
			var bFioriElementsListReportApp = false;
			Object.keys(mComponents).forEach(function(sComponentId) {
				var oManifest = mComponents[sComponentId].getManifest();
				var mModels = oManifest['sap.ui5'].models || {};
				var mDataSources = oManifest['sap.app'].dataSources;

				var mFioriElements = oManifest && oManifest['sap.ui.generic.app'];
				if (mFioriElements){
					bFioriElementsApp = true;

					if (mFioriElements.pages && mFioriElements.pages instanceof Array){
						//pages is an array
						var oListReport = mFioriElements.pages[0];
						if (oListReport && oListReport.component && oListReport.component.name && oListReport.component.name === "sap.suite.ui.generic.template.ListReport"){
							bFioriElementsListReportApp = true;
						}
					} else {
						//pages structure contains objects
						for (var prop in mFioriElements.pages){
							if (prop.indexOf("ListReport") == 0){
								var oListReport = mFioriElements.pages[prop];
								if (oListReport && oListReport.component && oListReport.component.name && oListReport.component.name === "sap.suite.ui.generic.template.ListReport"){
									bFioriElementsListReportApp = true;
									break;
								}
							}

						}
					}

					if (mModels[""]){ //check only the default model
						var mModel = mModels[""];
						var mDataSource;
						if (mModel.dataSource) {
							mDataSource = mDataSources[mModel.dataSource];
						}
						if ((mModel.type && mModel.type === "sap.ui.model.odata.v2.ODataModel") ||
							mDataSource && mDataSource.type === "OData" && (mDataSource.settings === undefined ||
								(mDataSource.settings && (mDataSource.settings.odataVersion === undefined ||
									mDataSource.settings.odataVersion && mDataSource.settings.odataVersion === "2.0")))) {
							bRelevantModelsUsed = true;
							if (mModel.preload === true) {
								bModelPreload = true;
							}
						}
					}
				}
			});
			if (bFioriElementsApp && bFioriElementsListReportApp && ( !bRelevantModelsUsed || !bModelPreload )) {
				oIssueManager.addIssue({
					severity: Severity.Medium,
					details: "The used V2 ODataModels default model (\"\") doesn't make use of the preloading feature.",
					context: {
						id: "WEBPAGE"
					}
				});
			}
		}
	};

	return [
		oModelPreloading
	];

}, true);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
/**
 * Defines support rules for the app configuration.
 */
sap.ui.predefine('sap/suite/ui/generic/template/support/SupportAssistant/Runtime.support',[
	"jquery.sap.global",
	"sap/ui/support/library"
], function(
		jQuery,
		SupportLib) {
	"use strict";


	// shortcuts
	var Categories = SupportLib.Categories; // Accessibility, Performance, Memory, ...
	var Severity = SupportLib.Severity; // Hint, Warning, Error
	var Audiences = SupportLib.Audiences; // Control, Internal, Application*/

	//**********************************************************
	// Rule Definitions
	//**********************************************************

	var oBusyHandling = {
		id: "busyHandling",
		audiences: [Audiences.Internal],
		categories: [Categories.Functionality],
		enabled: true,
		minversion: "1.52",
		title: "Log and check promises for busy handling",
		description: "This rule helps to find the reason for long running busy indicators from Fiori Elements. Reconstruct the situation and launch the support assistant before the long running busy indicator is shown. When the support assistant is running, all the promises are written into the console log with prefix 'busyHandling'. The analysis checks the logged promises and creates issues for those which are not resolved or rejected. Please note that this rule only checks busy indicators set by Fiori Elements BusyHelper. There are other busy indicators, e.g. from SmartTable, which are not detected.",
		resolution: "Use the issue details to find out the last caller from the call stack, which sets the busy indicator. Find out the reason why its promise is not settled.",
		check: function(oIssueManager, oCoreFacade, oScope) {
			var aEntries, oEntry;

			aEntries = oScope.getLoggedObjects(function(oEntry) {
				return oEntry.supportInfo.type === "sap.suite.generic.template.busyHandling"; //structure: <library>.<id>
			});
			for (var i = 0; i < aEntries.length; i++) {
				oEntry = aEntries[i];
				if (oEntry.supportInfo.promisePending) {
					oIssueManager.addIssue({
						severity: Severity.Medium,
						details: oEntry.message,
						context: {
							id: "WEBPAGE"
						}
					});
				}
			}
		}
	};

	return [
		oBusyHandling
	];

}, true);
//# sourceMappingURL=library-preload.support.js.map