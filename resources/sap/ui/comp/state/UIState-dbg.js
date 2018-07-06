/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2018 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/base/ManagedObject", 'sap/ui/comp/odata/MetadataAnalyser', 'sap/ui/model/odata/AnnotationHelper', 'sap/ui/model/Context'
], function(ManagedObject, MetadataAnalyser, AnnotationHelper, Context) {
	"use strict";

	/**
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Creates a new instance of an UIState class.
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version 1.54.6
	 * @constructor
	 * @public
	 * @since 1.50
	 * @alias sap.ui.comp.state.UIState
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var UIState = ManagedObject.extend("sap.ui.comp.state.UIState", /** @lends sap.ui.comp.state.UIState */
	{
		metadata: {
			library: "sap.ui.comp",
			properties: {
				/**
				 * Object representing the presentation variant. The structure looks like:
				 *
				 * <pre><code>
				 * {
				 * 	ContextUrl: {string},
				 * 	MaxItems: {int},
				 *  SortOrder: [],
				 * 	GroupBy: [],
				 * 	Total: [],
				 * 	RequestAtLeast: [],
				 * 	Visualizations: []
				 * }
				 * </code></pre>
				 *
				 * <b>Note:</b>
				 * <ul>
				 * <li> <code>PresentationVariantID</code> property is not provided</li>
				 * <li> <code>Text</code> property is not provided because it is translated text</li>
				 * <li> <code>TotalBy</code> is not supported yet</li>
				 * <li> <code>IncludeGrandTotal</code> is not supported yet</li>
				 * <li> <code>InitialExpansionLevel</code> is not supported yet</li>
				 * <li> <code>Title</code> of <code>Visualizations.Content</code> property is not provided because it is translated text</li>
				 * <li> <code>Description</code> of <code>Visualizations.Content</code> property is not provided because it is translated text</li>
				 * <li> <code>VariantName</code> property is not part of specified DataSuiteFormat yet
				 * </ul>
				 */
				presentationVariant: {
					type: "object"
				},
				/**
				 * Object representing the selection variant. The structure looks like:
				 *
				 * <pre><code>
				 * {
				 *  SelectionVariant: {
				 *      SelectionVariantID: {string},
				 * 		Parameters: [],
				 * 		SelectOptions: []
				 * }
				 * </code></pre>
				 */
				selectionVariant: {
					type: "object"
				},

				/**
				 * Variant name.
				 */
				variantName: {
					type: "string"
				},

				/**
				 * Structure containing filter value keys and its corresponding descriptions.
				 *
				 * <pre><code>
				 * {
				 * 	Texts: [
				 * 		{
				 * 			Language: string,
				 * 			ContextUrl: string,
				 * 			PropertyTexts: [
				 * 				{
				 * 					PropertyName: string,
				 * 					ValueTexts: [
				 * 						{
				 * 							PropertyValue: string,
				 * 							Text: string
				 * 						}
				 * 					]
				 * 				}
				 * 			]
				 * 		}
				 * 	]
				 * }
				 * </code></pre>
				 */
				valueTexts: {
					type: "object"
				}
			}
		}
	});

	/**
	 * Constructs the value state out of a given selection variant and the current model data
	 * @protected
	 * @param {object} oSelectionVariant selection variant object
	 * @param {map} mData the filter provider model data
	 * @returns {object} the values texts format
	 */
	UIState.calculateValueTexts = function(oSelectionVariant, mData) {
		var oValueTexts = null;

		var fAddEntry = function(sPropertyName, oEntry) {

			var oPropTextEntry = null;

			if (!oValueTexts) {
				oValueTexts = {
					"Texts": [
						{
							"ContextUrl": "",
							"Language": sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale().getLanguage(),
							"PropertyTexts": []
						}
					]
				};

			}

			oValueTexts.Texts[0].PropertyTexts.some(function(oItem) {
				if (oItem.PropertyName === sPropertyName) {
					oPropTextEntry = oItem;
				}

				return !oPropTextEntry;
			});

			if (!oPropTextEntry) {
				oPropTextEntry = {
					"PropertyName": sPropertyName,
					ValueTexts: []
				};
				oValueTexts.Texts[0].PropertyTexts.push(oPropTextEntry);
			}

			oPropTextEntry.ValueTexts.push({
				"PropertyValue": oEntry.key,
				"Text": oEntry.text
			});

		};

		if (mData && oSelectionVariant && oSelectionVariant.SelectOptions) {
			oSelectionVariant.SelectOptions.forEach(function(oSelectOption) {
				// check for type ?
				if (mData[oSelectOption.PropertyName]) {

					if (mData[oSelectOption.PropertyName].ranges) {
						mData[oSelectOption.PropertyName].ranges.forEach(function(oEntry) {
							if (oEntry.hasOwnProperty("text")) {
								fAddEntry(oSelectOption.PropertyName, oEntry);
							}
						});
					}

					if (mData[oSelectOption.PropertyName].items) {
						mData[oSelectOption.PropertyName].items.forEach(function(oEntry) {
							if (oEntry.hasOwnProperty("text")) {
								fAddEntry(oSelectOption.PropertyName, oEntry);
							}
						});
					}
				}
			});
		}

		return oValueTexts;
	};

	/**
	 * Enriches the internal filter bar value format with the information from the value state.
	 * @protected
	 * @param {string} sPayload the filter bar inner data format
	 * @param {object} oValueTexts the value texts format containing the eventual descriptions.
	 * @returns {string} enriched the filter bar inner data format
	 */
	UIState.enrichWithValueTexts = function(sPayload, oValueTexts) {
		var bEnriched = false, oTextEntry, sLanguage, oPayload, sEnrichedPayload = sPayload;

		sLanguage = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale().getLanguage().toLowerCase();

		if (oValueTexts && oValueTexts.Texts) {

			oValueTexts.Texts.some(function(oEntry) {
				if (oEntry.Language && oEntry.Language.toLowerCase() === sLanguage) {
					oTextEntry = oEntry;
				}

				return oTextEntry !== null;
			});

			if (oTextEntry && oTextEntry.PropertyTexts) {

				if (!oPayload) {
					oPayload = JSON.parse(sPayload);
				}

				oTextEntry.PropertyTexts.forEach(function(oProperty) {
					var oPayloadProperty = oPayload[oProperty.PropertyName];
					if (oPayloadProperty && oPayloadProperty.ranges && oProperty.ValueTexts) {
						oProperty.ValueTexts.forEach(function(oValueEntry) {
							var oPayloadValue = null, nIdx = -1;
							if (oValueEntry.Text) {
								oPayloadProperty.ranges.some(function(oVEntry, index) {
									if (!oVEntry.exclude && (oVEntry.operation === "EQ") && (oVEntry.value1 === oValueEntry.PropertyValue)) {
										oPayloadValue = oVEntry;
										nIdx = index;
									}

									return (oPayloadValue != null);
								});
							}

							if (oPayloadValue) {
								bEnriched = true;

								if (!oPayloadProperty.items) {
									oPayloadProperty.items = [];
								}

								oPayloadProperty.items.push({
									key: oValueEntry.PropertyValue,
									text: oValueEntry.Text
								});

								oPayload[oProperty.PropertyName].ranges.splice(nIdx, 1);
							}
						});
					}
				});

				if (bEnriched) {
					sEnrichedPayload = JSON.stringify(oPayload);
				}
			}
		}

		return sEnrichedPayload;

	};

	/**
	 * Converts PresentationVariant annotation to UIState object.
	 * @param {string} sVariantName Name of the variant
	 * @param {object} oSelectionVariantAnnotation Object representing the com.sap.vocabularies.UI.v1.SelectionVariant annotation provided by MetadataAnalyser
	 * @param {object} oPresentationVariantAnnotation Object representing the com.sap.vocabularies.UI.v1.PresentationVariant annotation provided by MetadataAnalyser
	 * @returns {sap.ui.comp.state.UIState} UIState object containing converted parts of SelectionVariant and PresentationVariant annotations
	 * @protected
	 */
	UIState.createFromSelectionAndPresentationVariantAnnotation = function(sVariantName, oSelectionVariantAnnotation, oPresentationVariantAnnotation) {
		var oSelectionVariant = {};
		if (oSelectionVariantAnnotation && oSelectionVariantAnnotation.SelectOptions && oSelectionVariantAnnotation.SelectOptions.length) {
			// Convert 'SelectOptions.Ranges'
			oSelectionVariant.SelectOptions = oSelectionVariantAnnotation.SelectOptions.map(function(oSelectOptionAnnotation) {
				return {
					PropertyName: oSelectOptionAnnotation.PropertyName.PropertyPath,
					Ranges: oSelectOptionAnnotation.Ranges.map(function(oRangeAnnotation) {
						var oModelContext = new Context(null, "/");
						return {
							Sign: MetadataAnalyser.getSelectionRangeSignType([
								oRangeAnnotation.Sign.EnumMember
							]),
							Option: MetadataAnalyser.getSelectionRangeOptionType([
								oRangeAnnotation.Option.EnumMember
							]),
							// actually if annotation does not contain 'Low' parameter we should not create one with value null. 'null' could be a valid value.
							Low: oRangeAnnotation.Low && AnnotationHelper.format(oModelContext, oRangeAnnotation.Low) || undefined,
							// actually if annotation does not contain 'High' parameter we should not create one with value null. 'null' could be a valid value.
							High: oRangeAnnotation.High && AnnotationHelper.format(oModelContext, oRangeAnnotation.High) || undefined
						};
					})
				};
			});
		}
		var oPresentationVariant = {};
		// PresentationVariantID: jQuery.sap.uid()
		// ContextUrl: ""
		// Total: oUIStateP13n ? oUIStateP13n.Total : []
		if (oPresentationVariantAnnotation && oPresentationVariantAnnotation.chartAnnotation) {
			oPresentationVariant.Visualizations = [
				{
					Type: "Chart",
					Content: {
						// Title:""
						// Description:""
						ChartType: oPresentationVariantAnnotation.chartAnnotation.chartType,
						Measures: oPresentationVariantAnnotation.chartAnnotation.measureFields,
						MeasureAttributes: Object.keys(oPresentationVariantAnnotation.chartAnnotation.measureAttributes).map(function(sAttribute) {
							return {
								Measure: sAttribute,
								Role: oPresentationVariantAnnotation.chartAnnotation.measureAttributes[sAttribute].role
							};
						}),
						Dimensions: oPresentationVariantAnnotation.chartAnnotation.dimensionFields,
						DimensionAttributes: Object.keys(oPresentationVariantAnnotation.chartAnnotation.dimensionAttributes).map(function(sAttribute) {
							return {
								Dimension: sAttribute,
								Role: oPresentationVariantAnnotation.chartAnnotation.dimensionAttributes[sAttribute].role
							};
						})
					}
				}
			];
		}
		if (oPresentationVariantAnnotation && oPresentationVariantAnnotation.maxItems) {
			oPresentationVariant.MaxItems = parseInt(oPresentationVariantAnnotation.maxItems, 10);
		}
		if (oPresentationVariantAnnotation && oPresentationVariantAnnotation.sortOrderFields) {
			oPresentationVariant.SortOrder = oPresentationVariantAnnotation.sortOrderFields.map(function(oField) {
				return {
					Property: oField.name,
					Descending: oField.descending
				};
			});
		}
		if (oPresentationVariantAnnotation && oPresentationVariantAnnotation.groupByFields) {
			oPresentationVariant.GroupBy = oPresentationVariantAnnotation.groupByFields;
		}
		if (oPresentationVariantAnnotation && oPresentationVariantAnnotation.requestAtLeastFields) {
			oPresentationVariant.RequestAtLeast = oPresentationVariantAnnotation.requestAtLeastFields;
		}
		return new UIState({
			presentationVariant: !jQuery.isEmptyObject(oPresentationVariant) ? oPresentationVariant : undefined,
			selectionVariant: !jQuery.isEmptyObject(oSelectionVariant) ? oSelectionVariant : undefined,
			variantName: sVariantName ? sVariantName : undefined
		});
	};

	return UIState;
}, /* bExport= */true);
