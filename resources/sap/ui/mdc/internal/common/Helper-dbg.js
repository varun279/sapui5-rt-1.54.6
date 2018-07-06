/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2018 SAP SE. All rights reserved
 */
 sap.ui.define([
	"../../ResourceModel"
], function (ResourceModel) {
	"use strict";
	var Helper = {

		replaceSpecialCharsInId: function (sId) {
			if (sId.indexOf(" ") >= 0) {
				jQuery.sap.log.error("Annotation Helper: Spaces are not allowed in ID parts. Please check the annotations, probably something is wrong there.");
			}
			return sId.replace(/@/g, "").replace(/\//g, "::").replace(/#/g, "::");
		},

		formatDraftLockText : function (IsActiveEntity, HasDraftEntity, LockedBy) {
			if (!IsActiveEntity) {
				return sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("draft.DRAFT_OBJECT");
			} else if (HasDraftEntity) {
				if (LockedBy) {
					return ResourceModel.getText("draft.LOCKED_OBJECT");
				} else {
					return ResourceModel.getText("draft.UNSAVED_CHANGES");
				}
			} else {
				return ""; // not visible
			}
		},

		_getEntitySetPath: function (oModel, sPropertyPath) {
			var iLength;
			var sEntitySetPath = sPropertyPath.slice(0, sPropertyPath.indexOf("/", 1));
			if (oModel.getObject(sEntitySetPath + "/$kind") === "EntityContainer") {
				iLength = sEntitySetPath.length + 1;
				sEntitySetPath = sPropertyPath.slice(iLength, sPropertyPath.indexOf("/", iLength));
			}
			return sEntitySetPath;
		},

		_extendValueListMetadata: function (oMetaModel, sEntitySet, sPropertyPath, mValueListInfo) {
			var mParameters;

			var fnFilterExpressionRestriction = function(filterExpressionRestriction){
				return filterExpressionRestriction.Property.$PropertyPath === sPropertyPath;
			};

			var fnMapLocalDataToValueList = function(oParameter) {
				var sType = oParameter.$Type;
				if (sType === "com.sap.vocabularies.Common.v1.ValueListParameterInOut" || sType === "com.sap.vocabularies.Common.v1.ValueListParameterOut") {
					this.oLocalDataToValueListMap[oParameter.LocalDataProperty.$PropertyPath] = oParameter.ValueListProperty;
				}
			};

			for (var p in mValueListInfo) {
				// we store some additional information in an object called $mdc
				mValueListInfo[p].$mdc = {};
				mValueListInfo[p].$mdc.qualifier = p || "default";

				// determine key and description path and store it in the value list info
				mParameters = mValueListInfo[p].Parameters;
				var sLocalDataProperty = oMetaModel.getObject('/' + sEntitySet + '/' + sPropertyPath + "@sapui.name");

				// TODO: don't know why this is added here and not in the template / shouldn't be the selection mode a property of the filter field? to be discussed
				var aFilterExpressionRestrictions = oMetaModel.getObject("/" + sEntitySet + "@Org.OData.Capabilities.V1.FilterRestrictions");
				var oFilterExpressionRestriction = aFilterExpressionRestrictions && aFilterExpressionRestrictions.FilterExpressionRestrictions.filter(fnFilterExpressionRestriction) ;
				//Getting Label for the dialog -> same then above should be not done here but kept it for now
				mValueListInfo[p].sTitle = oMetaModel.getObject("/" + sEntitySet + "/$Type/" + sPropertyPath + "@com.sap.vocabularies.Common.v1.Label");
				if (oFilterExpressionRestriction && (oFilterExpressionRestriction.length > 0) && (oFilterExpressionRestriction[0].AllowedExpressions.indexOf("SingleValue") > -1)) {
					mValueListInfo[p].sSelectionMode = "SingleSelectLeft";
					mValueListInfo[p].sTitle = ResourceModel.getText("valuehelp.SINGLE_ITEM_SELECT") + mValueListInfo[p].sTitle; // ???
					//mValueListInfo[p].sTitle = Library.getText("valuehelp.SINGLE_ITEM_SELECT") + mValueListInfo[""].sTitle;
				} else {
					mValueListInfo[p].sSelectionMode = "MultiSelect";
				}

				// determine the key and the description path
				// TODO: how could we do this better?
				for (var i = 0; i < mParameters.length; i++) {
					if (mParameters[i].LocalDataProperty && mParameters[i].LocalDataProperty.$PropertyPath === sLocalDataProperty) {
						// we store this information into the value list info - we will set this information to the filter field in the future
						mValueListInfo[p].$mdc.keyPath =  mParameters[i].ValueListProperty;
						mValueListInfo[p].$mdc.descriptionPath = mValueListInfo[p].$model.getMetaModel().getObject("/" + mValueListInfo[p].CollectionPath + "/" + mParameters[i].ValueListProperty + "@com.sap.vocabularies.Common.v1.Text/$Path");

						// there should be always only one parameter with the property field path as output
						break;
					}
				}

				// Storing Value list out parameters mapping
				mValueListInfo[p].$mdc.oLocalDataToValueListMap = {};
				mValueListInfo[p].Parameters.forEach(fnMapLocalDataToValueList.bind(mValueListInfo[p].$mdc));

			}

			return mValueListInfo;

		}
	};
	return Helper;
}, /* bExport= */ true);
