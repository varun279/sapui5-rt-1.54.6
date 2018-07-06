(function() {
	"use strict";
	jQuery.sap.require("sap.ui.comp.smartfield.SmartField");
	jQuery.sap.require("sap.suite.ui.generic.template.extensionAPI.UIMode");
	jQuery.sap.require("sap/ui/model/Context");
	sap.ui.require("sap/suite/ui/generic/template/extensionAPI/UIMode");
	jQuery.sap.declare("sap.suite.ui.generic.template.AnalyticalListPage.util.AnnotationHelper");
	sap.suite.ui.generic.template.AnalyticalListPage.util.AnnotationHelper = {
		getDetailEntitySet: function(oContext) {
			var o = oContext.getObject();
			var oModel = oContext.getModel();
			var oMetaModel = oModel.getProperty("/metaModel");
			return oMetaModel.createBindingContext(oMetaModel.getODataEntitySet(o, true));
		},
		// resolvePresentationVariant: function(oContext) {
		// 	var oParameter = oContext.getObject();
		// 	var oModel = oContext.getModel();
		// 	var oMetaModel = oModel.getProperty("/metaModel");
		// 	var oEntitySet = oMetaModel.getODataEntitySet(oParameter.entitySet);
		// 	var oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);
		// 	var sAnnotationPath = oEntityType.$path + "/com.sap.vocabularies.UI.v1.PresentationVariant"
		// 		+ (oParameter.settings && oParameter.settings.presentationVariantQualifier ? "#" + oParameter.settings.presentationVariantQualifier : "");
		// 	return oMetaModel.createBindingContext(sAnnotationPath);
		// },
		resolveMetaModelPath: function(oContext) {
			var sPath = oContext.getObject();
			var oModel = oContext.getModel();
			var oMetaModel = oModel.getProperty("/metaModel");
			return oMetaModel.createBindingContext(sPath);
		},
		/* The context definition for the ALP:
			1. If there is a SelectionPresentationVariant (SVP) qualifier in the app. descriptor (paramter model)
				yes) Select that SVP
				no) Check if there is an SVP without a qualifier and choose it if exists
			2. Was a SVP found in 1.
				yes) Choose the PresentationVariant (PV) specified in the SVP
				no) Check if there is a PV qualifier in the parameter model
					yes) Choose the PV
					no) Check if there is a default PV and choose if it exists
			3. Was a PV found in 2.
				yes) Follow the Visualizations to LineItem and Chart or use default if not found
				no) use LineItem and Chart default annotations
		*/
		createWorkingContext: function(oContext) {
			var oParameter = oContext.getObject(),
				oSettings = oParameter.settings,
				oModel = oContext.getModel(),
				oMetaModel = oModel.getProperty("/metaModel"),
				oEntitySet = oMetaModel.getODataEntitySet(oParameter.entitySet),
				oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType),
				sAnnotationPath = "",
				oWorkingContext = {};
			/* Find SelectionPresentationVariant */
			sAnnotationPath = oEntityType.$path + "/com.sap.vocabularies.UI.v1.SelectionPresentationVariant" + (oSettings && oSettings.qualifier ? "#" + oSettings.qualifier : "");
			oWorkingContext.selectionPresentationVariant = oMetaModel.getObject(sAnnotationPath);
			oWorkingContext.selectionPresentationVariantQualifier = sAnnotationPath.split("#")[1] || "";
			oWorkingContext.selectionPresentationVariantPath = sAnnotationPath;

			//Tree table : check to add only only required dimension, measure(all) & property supported by tree table, rest into ignore fields
			if (oSettings.tableType === "TreeTable" && oEntityType && oEntityType.hasOwnProperty('property') && oEntityType.property.length) {
				var aIgnoredFields = [],
					sHierarchyParentID = "",
					aProperties = oEntityType.property;
				for (var i = 0; i < aProperties.length; i++) {
					if (aProperties[i].hasOwnProperty('sap:hierarchy-node-for')) {
						sHierarchyParentID = aProperties[i]["sap:hierarchy-node-for"];
						break;
					}
				}
				for (var i = 0; i < aProperties.length; i++) {
					var bIsNameNotEqualToParentTreeNodes = aProperties[i].name !== oSettings.uniqueHierarchyNodeIDForTreeTable && aProperties[i].name !== sHierarchyParentID;
					if (!aProperties[i].hasOwnProperty('com.sap.vocabularies.Analytics.v1.Measure')) {
						if (aProperties[i].hasOwnProperty('sap:attribute-for') && bIsNameNotEqualToParentTreeNodes) {
							if (aProperties[i]['sap:attribute-for'] !== oSettings.uniqueHierarchyNodeIDForTreeTable && aProperties[i]['sap:attribute-for'] !==
								sHierarchyParentID) {
								aIgnoredFields.push(aProperties[i]['name']);
							}
						} else if (bIsNameNotEqualToParentTreeNodes) {
							aIgnoredFields.push(aProperties[i]['name']);
						}
					}
				}
				oWorkingContext.ignoredFields = aIgnoredFields.toString();
			}
			/* Find PresentationVariant */
			if (oWorkingContext.selectionPresentationVariant && oWorkingContext.selectionPresentationVariant.PresentationVariant) {
				sAnnotationPath =
					//Path is specified
					oWorkingContext.selectionPresentationVariant.PresentationVariant.Path ||
					//AnnotationPath is specified (for compatiblity reasons)
					oWorkingContext.selectionPresentationVariant.PresentationVariant.AnnotationPath ||
					//SVP points to PV type directly and NOT via annotation path
					oWorkingContext.selectionPresentationVariantPath + "/PresentationVariant";

				if (sAnnotationPath.indexOf("@") === 0) { // Relative path check, make is absolute path
					sAnnotationPath = oEntityType.$path + "/" + sAnnotationPath.substr(1);
				}
			} else {
				sAnnotationPath = oEntityType.$path + "/com.sap.vocabularies.UI.v1.PresentationVariant" + (oSettings && oSettings.qualifier ? "#" + oSettings.qualifier : "");
			}
			if (typeof sAnnotationPath === "string") {
				/* Referene to PV via annotationPath */
				oWorkingContext.presentationVariant = oMetaModel.getObject(sAnnotationPath);
				oWorkingContext.presentationVariantPath = sAnnotationPath;
				oWorkingContext.presentationVariantQualifier = sAnnotationPath.split("#")[1] || "";
				oWorkingContext.initialExpansionLevel = oWorkingContext.presentationVariant && oWorkingContext.presentationVariant.InitialExpansionLevel && oWorkingContext.presentationVariant.InitialExpansionLevel.Int;
			}
			// If a qualifier was specified but no presentation variant exists for that qualifier or indirectly
			// through the SelectionPresentationVaraiant with qualifier it is a wrong qualifier
			if (oSettings.qualifier && !oWorkingContext.presentationVariant) {
				var e = new Error("Error in manifest.json: Not SelectionPresentationVariant or PresentationVariant found for qualifier: " +
					oSettings.qualifier, "./manifest.json");
				throw e;
			}

			/* Determine LineItem and Chart via PV */
			if (oWorkingContext.presentationVariant && oWorkingContext.presentationVariant.Visualizations) {
				oWorkingContext.presentationVariant.Visualizations.forEach(function(visualization) {
					/* get rid of the @ and put a / in front */
					var sPath = "/" + visualization.AnnotationPath.slice(1);
					if (sPath.indexOf("com.sap.vocabularies.UI.v1.LineItem") > -1) {
						sAnnotationPath = oEntityType.$path + sPath;
						oWorkingContext.lineItem = oMetaModel.getObject(sAnnotationPath);
						oWorkingContext.lineItemPath = sAnnotationPath;
						oWorkingContext.lineItemQualifier = sAnnotationPath.split("#")[1] || "";
						oWorkingContext.lineItemCriticality = sap.suite.ui.generic.template.AnalyticalListPage.util.AnnotationHelper._resolveLineItemCriticality(oWorkingContext.lineItem,oWorkingContext.lineItemQualifier);
					}
					if (!oSettings.chartPresentationQualifier && (sPath.indexOf("com.sap.vocabularies.UI.v1.Chart") > -1)) {
						sAnnotationPath = oEntityType.$path + sPath;
						oWorkingContext.chart = oMetaModel.getObject(sAnnotationPath);
						oWorkingContext.chartPath = sAnnotationPath;
						oWorkingContext.chartQualifier = sAnnotationPath.split("#")[1] || "";
					}
				});
			}

			/* Fall back to defaults without qualifier */
			if (!oWorkingContext.lineItem) {
				sAnnotationPath = oEntityType.$path + "/com.sap.vocabularies.UI.v1.LineItem";
				oWorkingContext.lineItem = oMetaModel.getObject(sAnnotationPath);
				oWorkingContext.lineItemPath = sAnnotationPath;
				oWorkingContext.lineItemQualifier = "";
				oWorkingContext.lineItemCriticality = sap.suite.ui.generic.template.AnalyticalListPage.util.AnnotationHelper._resolveLineItemCriticality(oWorkingContext.lineItem,oWorkingContext.lineItemQualifier);
			}

			if (oSettings && oSettings.chartPresentationQualifier) {
				//Determine chart using presentation variant of chart qualifier
				var chartPVPath = oEntityType.$path + "/com.sap.vocabularies.UI.v1.PresentationVariant" + "#" + oSettings.chartPresentationQualifier;
				var oChartPresentationVariant = oMetaModel.getObject(chartPVPath);
				// If a qualifier was specified but no presentation variant exists for that qualifier or indirectly
				// through the SelectionPresentationVaraiant with qualifier it is a wrong qualifier
				if (!oChartPresentationVariant) {
					var e = new Error("Error in manifest.json: No PresentationVariant found for qualifier: " +
						oSettings.chartPresentationQualifier, "./manifest.json");
					throw e;
				}

				if (oChartPresentationVariant && !oChartPresentationVariant.Visualizations) {
					var e = new Error("Error: No Visualizations found in PresentationVariant for chartPresentationVariantQualifier: " +
						oSettings.chartPresentationQualifier, "./manifest.json");
					throw e;
				} else {
					oChartPresentationVariant.Visualizations.forEach(function(visualization) {
						/* get rid of the @ and put a / in front */
						var sPath = "/" + visualization.AnnotationPath.slice(1);
						if (sPath.indexOf("com.sap.vocabularies.UI.v1.Chart") > -1) {
							sAnnotationPath = oEntityType.$path + sPath;
							oWorkingContext.chart = oMetaModel.getObject(sAnnotationPath);
							oWorkingContext.chartPath = sAnnotationPath;
							oWorkingContext.chartPresentationVariantQualifier = oSettings.chartPresentationQualifier;
							oWorkingContext.chartQualifier = sAnnotationPath.split("#")[1] || "";
						}
					});
					// If a qualifier was specified but no presentation variant exists for that qualifier or indirectly
					// through the SelectionPresentationVaraiant with qualifier it is a wrong qualifier
					if (!oWorkingContext.chart) {
						var e = new Error("Error: No chart annotations found with chartPresentationVariantQualifier " +
							oSettings.chartPresentationQualifier, "./manifest.json");
						throw e;
					}
				}
			}

			/* Fall back to defaults without qualifier */
			if (!oSettings.chartPresentationQualifier && !oWorkingContext.chart) {
				sAnnotationPath = oEntityType.$path + "/com.sap.vocabularies.UI.v1.Chart";
				oWorkingContext.chart = oMetaModel.getObject(sAnnotationPath);
				oWorkingContext.chartPath = sAnnotationPath;
				oWorkingContext.chartQualifier = "";
			}

			oModel.setProperty("/workingContext", oWorkingContext);
			return "/workingContext";
		},
		/**
		 * [hasDeterminingActionsForALP To check if determiningActions are defined in manifest or annotations]
		 * @param  {[String]}  aTableTerm   [Records of table actions from annotations]
		 * @param  {[String]}  aChartTerm   [Records of chart actions from annotations]
		 * @param  {[String]}  sEntitySet   [Entity set Records]
		 * @param  {Object}  oManifestExt [Extensions from manifest]
		 * @return {Boolean}              [Returns status of determining actions to the xml]
		 */
		hasDeterminingActionsForALP: function(aTableTerm, aChartTerm, sEntitySet, oManifestExt) {
			if (sEntitySet && oManifestExt && oManifestExt["sap.suite.ui.generic.template.AnalyticalListPage.view.AnalyticalListPage"] &&
				sap.suite.ui.generic.template.AnalyticalListPage.util.AnnotationHelper._hasCustomDeterminingActionsInALP(sEntitySet, oManifestExt["sap.suite.ui.generic.template.AnalyticalListPage.view.AnalyticalListPage"]["sap.ui.generic.app"])) { //Check for AnalyticalListPage
				return true;
			}
			//To bring determining buttons of table from annotations
			for (var iRecord = 0; iRecord < aTableTerm.length; iRecord++) {
				if ((aTableTerm[iRecord].RecordType === "com.sap.vocabularies.UI.v1.DataFieldForAction" || aTableTerm[iRecord].RecordType === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") &&
					aTableTerm[iRecord].Determining && aTableTerm[iRecord].Determining.Bool === "true") {
					return true;
				}
			}
			//To bring determining buttons of chart from annotations
			for (var iRecord = 0; iRecord < aChartTerm.length; iRecord++) {
				if ((aChartTerm[iRecord].RecordType === "com.sap.vocabularies.UI.v1.DataFieldForAction" || aChartTerm[iRecord].RecordType === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") &&
					aChartTerm[iRecord].Determining && aChartTerm[iRecord].Determining.Bool === "true") {
					return true;
				}
			}
			return false;
		},
		/**
		 * [_hasCustomDeterminingActionsInALP To check if determiningActions are defined in manifest]
		 * @param  {[String]}  sEntitySet [Entity set Records]
		 * @param  {Object}  oManifestExt [Extensions from manifest]
		 * @return {Boolean}              [Returns status of determining actions to the xml]
		 */
		_hasCustomDeterminingActionsInALP: function(sEntitySet, oManifestExt) {
			if (oManifestExt && oManifestExt[sEntitySet]) {
				var oManifestExtEntitySet = oManifestExt[sEntitySet];
				if (oManifestExtEntitySet.Actions) {
					for (var action in oManifestExtEntitySet.Actions) {
						if (oManifestExtEntitySet.Actions[action].determining) {
							return true;
						}
					}
				}
			}
			return false;
		},

		getFilterableKPIs: function(oKPIs){
			var oModel = oKPIs.getModel();
			var kpiContext = {};
			var oKPIObject = oKPIs.getObject();
			kpiContext.filterableKPIs = [];
			kpiContext.globalKPIs = [];
			if (oKPIObject) {
				for (var item = 0; item < Object.keys(oKPIObject).length; item++){
					if (oKPIObject[Object.keys(oKPIObject)[item]]["filterable"]) {
						kpiContext.filterableKPIs.push(oKPIObject[Object.keys(oKPIObject)[item]]);
					}else {
						kpiContext.globalKPIs.push(oKPIObject[Object.keys(oKPIObject)[item]]);
					}
				}
			}
			oModel.setProperty("/kpiContext", kpiContext);
			return "/kpiContext";
		},
		generateKPIToolbarId : function(oKPIs) {
			for (var item = 0; Object.keys(oKPIs).length; item++) {
				if (oKPIs[Object.keys(oKPIs)[item]]["filterable"]) {
					return "template::KPITagContainer::filterableKPIs";
				} else {
					return "template::KPITagContainer::globalKPIs";
				}
			}
		},
		generateKPITagID : function(oKPI) {
			return "template::KPITag::" + oKPI.model + "::" + oKPI.qualifier;
		},
		_resolveLineItemCriticality: function(lineItem,lineItemQualifier) {
			if (lineItem) {
				var criticality;
				if (lineItemQualifier) {
					criticality = lineItem["com.sap.vocabularies.UI.v1.Criticality#" + lineItemQualifier];
				} else {
					criticality = lineItem["com.sap.vocabularies.UI.v1.Criticality"];
				}
				if (!criticality) {
					return "";
				} else {
					// passing objects to _data of a control will not write the value into the DOM , the customData only accepts string
					// escape sequence required for JS variables , otherwise the values will not be written to the DOM
					return criticality.Path ? "\\{\"Path\": \"" + criticality.Path + "\"\\}" : "\\{\"EnumMember\": \"" + criticality.EnumMember + "\"\\}";
				}
			} else {
				jQuery.sap.log.error("Please add LineItem annotation for your application");
				return undefined;
			}
		}
	};
	sap.suite.ui.generic.template.AnalyticalListPage.util.AnnotationHelper.getDetailEntitySet.requiresIContext = true;
})();
