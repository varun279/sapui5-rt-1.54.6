/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2018 SAP SE. All rights reserved
 */

sap.ui.define([
	"./ResourceModel",
	'sap/ui/mdc/XMLComposite',
	"sap/ui/mdc/base/ODataSuggestProvider",
	"sap/ui/mdc/base/OperatorSuggestProvider",
	"sap/ui/model/json/JSONModel",
	"sap/ui/mdc/ValueHelpDialog",
	"sap/ui/mdc/internal/common/Helper"
], function(ResourceModel, XMLComposite, ODataSuggestProvider, OperatorSuggestProvider, JSONModel, ValueHelpDialog, CommonHelper) {
	"use strict";
	var FilterField = XMLComposite.extend("sap.ui.mdc.FilterField", {
		metadata: {
			designtime: false,
			specialSettings: {
				metadataContexts: {
					defaultValue: "{ model: 'entitySet', path:'',  name: 'entitySet'}, { model: 'property', path:'',  name: 'property'}"
				}
			},
			properties: {
				withLabel: {
					type: "boolean",
					defaultValue: true,
					invalidate: "template"
				},
				conditionModelName: {
					type: "string",
					defaultValue: "sap.fe.cm",
					invalidate: false
				}
			},
			events: {},
			aggregations: {},
			publicMethods: []
		},
		fragment: "sap.ui.mdc.internal.filterfield.FilterField"
	});

	// TODO: convert to private
	FilterField.prototype.getInnerFilterField = function() {
		var aItems = this.get_content().getItems();
		return aItems[aItems.length - 1];
	};

	FilterField.prototype.init = function() {
		XMLComposite.prototype.init.call(this);

		var oInnerFilterField = this.getInnerFilterField();
		var bSuggest = oInnerFilterField.data("suggest") === 'true',
			bFixedValues = oInnerFilterField.data("fixedValues") === 'true';

		if (bSuggest || bFixedValues) {
			new ODataSuggestProvider({
				fixedValues: bFixedValues,
				control: oInnerFilterField,
				init: this.handleProviderInit.bind(this),
				suggest: this.handleProviderSuggest.bind(this)
			});

			/* according to UX we disable the Operator Suggest Provider for the first delivery */
			//} else {
			//	new OperatorSuggestProvider({control: oFilterField});
		}
	};

	FilterField.prototype.handleProviderInit = function(oProvider, oEvent) {
		/* currently the inner field fires the event - this might change in the future once we agree on a final
		 API in the MDC Filter Field - then we night to change this coding
		 TODO: to be discussed if we access the input field via oInnerFilterField.get_input()
		 */
		var oInnerFilterField = this.getInnerFilterField();
		var sEntitySet = this._getEntitySet();
		var sPropertyPath = this._getPropertyPath();
		var oMetaModel = this.getModel().getMetaModel();
		var bFixedValues = oInnerFilterField.data("fixedValues") === 'true';
		var mBindingParameters = {};

		if (!bFixedValues && oEvent.newValue.trim()) {
			mBindingParameters.$search = oEvent.newValue.trim();
		}


		this.bSuggestionViewCreated = true; // FIXMe: it's a little bit more complex as user might type fast
		oMetaModel.requestValueListInfo('/' + sEntitySet + '/' + sPropertyPath).then(function(mValueListInfo) {
			// call extend
			CommonHelper._extendValueListMetadata(oMetaModel, sEntitySet, sPropertyPath, mValueListInfo);

			// we in case of suggest we are only interested in the unqualified one
			mValueListInfo = mValueListInfo[""];

			if (!mValueListInfo) {
				// without unqualified value list annotation we can't show any suggest list
				return false;
			}

			mValueListInfo.$mdc.SuggestBindingParameters = JSON.stringify(mBindingParameters);

			var oValueListModel = new JSONModel(mValueListInfo);
			var oSuggestionListView = sap.ui.view({
				viewName: "sap.ui.mdc.internal.filterfield.SuggestionList",
				type: "XML",
				async: true,
				preprocessors: {
					xml: {
						bindingContexts: {
							valueList: oValueListModel.createBindingContext("/")
						},
						models: {
							valueList: oValueListModel
						}
					}
				}
			});

			return oSuggestionListView.loaded().then(function() {
				if (mValueListInfo.$mdc) {
					if (mValueListInfo.$mdc.keyPath) {
						oProvider.setKeyPath(mValueListInfo.$mdc.keyPath);
					}
					if (mValueListInfo.$mdc.descriptionPath) {
						oProvider.setDescriptionPath(mValueListInfo.$mdc.descriptionPath);
					}
				}
				var oTable = oSuggestionListView.getContent()[0];
				oTable.setModel(mValueListInfo.$model);
				oProvider.setTable(oTable, oEvent);
			});
		}, function(oError) {
			throw (oError.message);
		});
	};


	FilterField.prototype.handleProviderSuggest = function(oProvider, oEvent) {
		/* currently the inner field fires the event - this might change in the future once we agree on a final
		 API in the MDC Filter Field - then we night to change this coding
		 TODO: to be discussed if we access the input field via oInnerFilterField.get_input()
		 */
		var oInnerFilterField = this.getInnerFilterField();
		var sEntitySet = this._getEntitySet();
		var oMetaModel = this.getModel().getMetaModel();
		var oSearchRestrictions;
		var bFixedValues = oInnerFilterField.data("fixedValues") === 'true';
		var mBindingParameters = {};

		if (!bFixedValues) {
			oSearchRestrictions = oMetaModel.getObject("/" + sEntitySet + "@Org.OData.Capabilities.V1.SearchRestrictions");
			if (!oSearchRestrictions || oSearchRestrictions.Searchable || oSearchRestrictions.Searchable === undefined) {
				// the entity set is searchable - we can use $search
				if (!bFixedValues) {
					mBindingParameters.$search = oEvent.newValue.trim() ? oEvent.newValue.trim() : undefined;
				}
			} else {
				// Suggest Lists entity sets without $search support is not yet supported
				return;
			}

			var oSuggestListBinding = oProvider.getTable().getBinding("items");
			if (oSuggestListBinding) {
				oSuggestListBinding.changeParameters(mBindingParameters);

			}
		}
	};

	FilterField.prototype._getEntitySet = function() {
		// FIXME: workaround
		return this.getInnerFilterField().data("entitySetName");
	};

	FilterField.prototype._getPropertyPath = function() {
		// FIXME: workaround
		return this.getInnerFilterField().getFieldPath().replace(/\*/g, '');
	};

	FilterField.prototype.handleValueHelpRequest = function() {
		// the title shall be the same then the label of the filter field
		var sLabel = this.get_content().getItems()[0].getText();
		if (sLabel.indexOf(":") + 1 === sLabel.length) {
			// in case the label ends with a : we remove this
			sLabel = sLabel.substr(0, sLabel.length - 1);
		}

		this.oValueHelpDialog = new ValueHelpDialog({
			entitySet: this._getEntitySet(),
			fieldPath: this._getPropertyPath(),
			conditionModelName: "sap.ui.mdc.cm",
			title : sLabel
		});

		// why couldn't we add the condition model to the constructor?
		this.oValueHelpDialog.setModel(this.getModel(this.getConditionModelName()), "sap.ui.mdc.cm");
		this.addDependent(this.oValueHelpDialog);

		this.oValueHelpDialog.open();
	};

	// STATIC HELPER FOR CONTROL TEMPLATE//
	FilterField._helper = {
		getFieldPath: function(oInterface, sEntitySet, sFieldPath) {
			var oMetaModel, aSections, oProperty, bToAnyFound;
			oMetaModel = oInterface.getInterface(0).getModel();

			if (typeof sFieldPath !== "string") {
				sFieldPath = oMetaModel.getObject(oInterface.getInterface(1).getPath() + "@sapui.name");
			}

			if (sFieldPath.indexOf('/') > -1) {

				aSections = sFieldPath.split('/');
				for (var i = 0; i < (aSections.length - 1); i++) {
					oProperty = oMetaModel.getObject("/" + sEntitySet + "/" + aSections.slice(0, (i + 1)).join('/'));

					if (oProperty && oProperty["$kind"] === "NavigationProperty" && oProperty["$isCollection"]) {
						aSections[i] = aSections[i] + '*';
						bToAnyFound = true;
					}
				}
				if (bToAnyFound) {
					sFieldPath = aSections.join('/');
				}
			}

			return sFieldPath;
		},

		getValueStatePath: function(oInterface, sEntitySet, sFieldPath) {
			var _sFieldPath = FilterField._helper.getFieldPath(oInterface, sEntitySet, sFieldPath);
			// TODO check condition model name
			return "{sap.fe.cm>/fieldPath/" + _sFieldPath + "/valueState}";
		},

		getValueStateTextPath: function(oInterface, sEntitySet, sFieldPath) {
			var _sFieldPath = FilterField._helper.getFieldPath(oInterface, sEntitySet, sFieldPath);
			// TODO check condition model name
			return "{sap.fe.cm>/fieldPath/" + _sFieldPath + "/valueStateText}";
		},

		isRequiredInFilter: function(path, oDetails) {
			var sEntitySetPath,
				sProperty,
				bIsRequired = false,
				oFilterRestrictions,
				oModel = oDetails.context.getModel(),
				sPropertyPath = oDetails.context.getPath();

			sEntitySetPath = CommonHelper._getEntitySetPath(oModel, sPropertyPath);
			if (typeof path === "string") {
				sProperty = path;
			} else {
				sProperty = oModel.getObject(sPropertyPath + "@sapui.name");
			}
			oFilterRestrictions = oModel.getObject(sEntitySetPath + "@Org.OData.Capabilities.V1.FilterRestrictions");
			if (oFilterRestrictions && oFilterRestrictions.RequiredProperties) {
				bIsRequired = oFilterRestrictions.RequiredProperties.some(function(property) {
					return property.$PropertyPath === sProperty;
				});
			}
			return bIsRequired;
		},

		typeFormatOptions: function(path, oDetails) {
			var oFormatOptions = "{",
				iScale,
				oModel = oDetails.context.getModel(),
				sPropertyPath = oDetails.context.getPath(),
				sType = oModel.getObject(sPropertyPath + "/$Type"),
				oTextAnnotation, oTextArrangement;

			if (sType === "Edm.Date" || sType === "Edm.DateTimeOffset" || sType === "Edm.TimeOfDay") {
				// for date and time types use the short style
				oFormatOptions += "style: 'medium'";
			} else if (sType === "Edm.Decimal") {
				// for decimal type use the scale attribute of the property (metadata)
				iScale = oModel.getObject(sPropertyPath + "/$Scale") || 0;
				switch (iScale) {
					case "floating":
						oFormatOptions += "decimals: " + (oModel.getObject(sPropertyPath + "/$Precision") || 0);
						break;
					case "variable":
						break;
					default:
						oFormatOptions += "decimals: " + iScale;
				}
			}
			oTextAnnotation = oModel.getObject(sPropertyPath + "@com.sap.vocabularies.Common.v1.Text");
			if (oTextAnnotation) {
				oTextArrangement = oModel.getObject(sPropertyPath + "@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement");
				if (oFormatOptions.length > 1) {
					oFormatOptions += ", ";
				}
				if (oTextArrangement && oTextArrangement.$EnumMember) {
					switch (oTextArrangement.$EnumMember) {
						case "com.sap.vocabularies.UI.v1.TextArrangementType/TextLast":
							oFormatOptions += "displayFormat: 'ValueDescription'";
							break;
						case "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly":
							oFormatOptions += "displayFormat: 'Description'";
							break;
						case "com.sap.vocabularies.UI.v1.TextArrangementType/TextSeparate":
							oFormatOptions += "displayFormat: 'Value'";
							break;
						default:
							oFormatOptions += "displayFormat: 'DescriptionValue'";
					}
				} else {
					oFormatOptions += "displayFormat: 'DescriptionValue'";
				}
			}
			return oFormatOptions + "}";
		},

		typeConstraints: function(path, oDetails) {
			var oConstraints = "{",
				iScale, iMaxLength,
				oModel = oDetails.context.getModel(),
				sPropertyPath = oDetails.context.getPath(),
				sType = oModel.getObject(sPropertyPath + "/$Type");

			if (sType === "Edm.Decimal") {
				// for decimal type use the scale attribute of the property (metadata)
				iScale = oModel.getObject(sPropertyPath + "/$Scale") || 0;
				switch (iScale) {
					case "floating":
						oConstraints += "decimals: " + (oModel.getObject(sPropertyPath + "/$Precision") || 0);
						break;
					case "variable":
						break;
					default:
						oConstraints += "decimals: " + iScale;
				}
			} else if (sType === "Edm.String") {
				iMaxLength = oModel.getObject(sPropertyPath + "/$MaxLength");
				if (iMaxLength) {
					oConstraints += "maxLength: " + iMaxLength;
				}
				if (oModel.getObject(sPropertyPath + "@com.sap.vocabularies.Common.v1.IsUpperCase")) {
					if (oConstraints.length > 1) {
						oConstraints += ", ";
					}
					oConstraints += "toUpperCase: true";
				}

			}
			return oConstraints + "}";
		},

		getValueListCollectionEntitySet: function(oValueListContext) {
			var mValueList = oValueListContext.getObject();
			return mValueList.$model.getMetaModel().createBindingContext("/" + mValueList.CollectionPath);
		},

		getValueListProperty: function(oPropertyContext) {
			var oValueListModel = oPropertyContext.getModel();
			var mValueList = oValueListModel.getObject("/");
			return mValueList.$model.getMetaModel().createBindingContext('/' + mValueList.CollectionPath + '/' + oPropertyContext.getObject());
		}
	};

	FilterField._helper.getFieldPath.requiresIContext = true;
	FilterField._helper.getValueStatePath.requiresIContext = true;
	FilterField._helper.getValueStateTextPath.requiresIContext = true;

	FilterField.createInstance = function(mParameters) {
		var sEntitySet = mParameters.entitySet,
			sPropertyPath = mParameters.propertyPath,
			oMetaModel = mParameters.metaModel,
			oParent = mParameters.parent,
			bWithLabel = mParameters.withLabel || false,
			oEntitySetContext = oMetaModel.createBindingContext("/" + sEntitySet),
			oPropertyContext = oMetaModel.createBindingContext("/" + sEntitySet + "/" + sPropertyPath),
			oNewFilterField;


		var oViewProcessor = sap.ui.view({
			viewContent: "<core:View xmlns:core='sap.ui.core' xmlns:mdc='sap.ui.mdc'><mdc:FilterField metadataContexts=\"{ model: 'entitySet', path : '', name: 'entitySet'}, { model: 'property', path : '', name: 'property' }\" withLabel='" + bWithLabel + "'/></core:View>",
			type: "XML",
			async: false, // at least for now
			preprocessors: {
				xml: {
					bindingContexts: {
						entitySet: oEntitySetContext,
						property: oPropertyContext
					},
					models: {
						entitySet: oMetaModel,
						property: oMetaModel
					}
				}
			}
		});

		oNewFilterField = oViewProcessor.getContent()[0];
		oParent.addDependent(oNewFilterField);

		return oNewFilterField;
	};

	return FilterField;

}, /* bExport= */ true);