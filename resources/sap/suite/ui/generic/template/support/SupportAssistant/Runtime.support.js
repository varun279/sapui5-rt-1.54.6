/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
/**
 * Defines support rules for the app configuration.
 */
sap.ui.define([
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
