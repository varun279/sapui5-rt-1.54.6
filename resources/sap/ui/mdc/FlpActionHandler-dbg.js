/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2018 SAP SE. All rights reserved
 */

sap.ui.define([
	'sap/ui/mdc/base/FieldInfoBase', 'sap/ui/mdc/base/linkinfo/Panel', 'sap/ui/mdc/base/linkinfo/Item', 'sap/m/Link', 'sap/ui/mdc/base/linkinfo/Util', 'sap/ui/model/json/JSONModel', 'sap/ui/core/InvisibleText', 'sap/m/ResponsivePopover', 'sap/ui/mdc/base/linkinfo/Factory'
], function(FieldInfoBase, LinkInfoPanel, LinkInfoItem, Link, Util, JSONModel, InvisibleText, ResponsivePopover, Factory) {
	"use strict";

	/**
	 * Constructor for a new FlpActionHandler.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The <code>FlpActionHandler</code> control shows Fiori Launchpad actions and other additional information, for example, contact details. The <code>Field</code> control uses <code>FlpActionHandler</code>.
	 * @extends sap.ui.mdc.FieldInfoBase
	 * @version 1.54.6
	 * @constructor
	 * @private
	 * @since 1.54.0
	 * @alias sap.ui.mdc.FlpActionHandler
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FlpActionHandler = FieldInfoBase.extend("sap.ui.mdc.FlpActionHandler", /** @lends sap.ui.mdc.FlpActionHandler.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			specialSettings: {
				metadataContexts: {
					provider: "sap/ui/mdc/experimental/provider/control/FlpActionHandler"
				}
			},
			properties: {
				/**
				 * Name of semantic object which is used to determine navigation targets. </br>
				 * Is the property not set initially, the <code>semanticObject</code> is set automatically
				 * to the semantic object which is annotated in the metadata for the property assigned
				 * in <code>metadataContext</code>.
				 */
				semanticObject: {
					type: "string"
				},
				/**
				 * Names of additional semantic objects which are used to determine navigation targets. </br>
				 * Is the property not set initial, the <code>additionalSemanticObjects</code> is set automatically
				 * to the semantic objects which are annotated in the metadata for the property assigned
				 * in <code>metadataContext</code>.
				 */
				additionalSemanticObjects: {
					type: "string[]",
					defaultValue: []
				},
				/**
				 * Navigation property that points from the current to the related entity type where the com.sap.vocabularies.Communication.v1.Contact
				 * annotation is defined, for example, <code>'to_Supplier'</code>. An empty string means that the related entity type is the
				 * current one.
				 */
				contactAnnotationPath: {
					type: "string",
					defaultValue: undefined
				},
				/**
				 *
				 */
				semanticObjectMapping: {
					type: "object",
					defaultValue: {}
				},
				/**
				 * Determines whether the personalization button is shown inside the panel.
				 */
				enablePersonalization: {
					type: "boolean",
					defaultValue: true
				}
			}
		}
	});

	FlpActionHandler.prototype.init = function() {
		// this._oContactDetailsController = new ContactDetailsController();

		var oModel = new JSONModel({
			// Store internally the determined available actions
			availableActions: [],
			// Store internally the determined main action
			mainAction: undefined,
			// Store internally the determined annotation path
			bindingPathOfAnnotation: undefined
		});
		oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
		oModel.setSizeLimit(1000);
		this.setModel(oModel, "$sapuimdcFlpActionHandler");

		this._proxyOnModelContextChange = jQuery.proxy(this._onModelContextChange, this);
		this.attachModelContextChange(this._proxyOnModelContextChange);
	};

	FlpActionHandler.prototype.exit = function() {
		this.detachModelContextChange(this._proxyOnModelContextChange);
	};

	FlpActionHandler.prototype.setContactAnnotationPath = function(sContactAnnotationPath) {
		this.setProperty("contactAnnotationPath", sContactAnnotationPath);
		this._setBindingPath4ContactAnnotation();
		return this;
	};

	FlpActionHandler.prototype.setSemanticObject = function(sSemanticObject) {
		this.setProperty("semanticObject", sSemanticObject);
		this._retrieveNavigationTargets();
		return this;
	};

	// ----------------------- Implementation of abstract methods --------------------------------------------

	FlpActionHandler.prototype.isTriggerable = function() {
		// Extra content should be shown always
		if (this._hasExtraContent()) {
			return true;
		}
		// If only one action exists (independent whether it is visible or not), it should be triggerable.
		// Reason is that the visibility can be personalized. So e.g. if only one action is
		// visible the end user should be able to personalize the actions again. This can the end user
		// only do when the direct navigation is not executed.
		return this._getTriggerableActions().length > 0;
	};
	FlpActionHandler.prototype.getDirectLink = function() {
		// Extra content should be shown always, no direct navigation possible
		if (this._hasExtraContent()) {
			return null;
		}

		// If only one action exists (independent whether it is visible or not), direct navigation is
		// possible. Reason is that the visibility can be personalized. So e.g. if only one action is
		// visible the end user should be able to personalize the actions again. This can the end user
		// only do when the direct navigation is not executed.
		var aActionsTriggerable = this._getTriggerableActions();
		if (aActionsTriggerable.length !== 1) {
			return null;
		}
		return new Link({
			text: aActionsTriggerable[0].text,
			target: aActionsTriggerable[0].target,
			href: aActionsTriggerable[0].href
		});
	};
	FlpActionHandler.prototype.createPopover = function() {
		var oModel = this._getInternalModel();
		var oInvisibleText = new InvisibleText({
			text: oModel.getProperty("/mainAction/text") ? oModel.getProperty("/mainAction/text") : ""
		});

		return this.getPopoverContent().then(function(oPopoverContent) {

			return new ResponsivePopover({
				contentWidth: "380px",
				horizontalScrolling: false,
				showHeader: sap.ui.Device.system.phone,
				placement: sap.m.PlacementType.Auto,
				ariaLabelledBy: oInvisibleText,
				content: [
					oPopoverContent, oInvisibleText
				],
				beforeClose: function() {
					this.destroyContent();
				}
			});
		});
	};
	FlpActionHandler.prototype.getPopoverContent = function() {
		// var that = this;
		var sStableID = this._getNavigationContainerStableId();
		if (!sStableID) {
			jQuery.sap.log.error("FlpActionHandler: Due to undefined stable ID the button of action personalization is set to disabled");
		}

		var oModel = this._getInternalModel();

		var oPanel = new LinkInfoPanel({
			mainItem: new LinkInfoItem({
				// key: "{$sapuimdcFlpActionHandler>key}",
				href: {
					path: "$sapuimdcFlpActionHandler>/mainAction/href"
				},
				text: {
					path: "$sapuimdcFlpActionHandler>/mainAction/text"
				},
				target: {
					path: "$sapuimdcFlpActionHandler>/mainAction/target"
				},
				description: {
					path: /*this.getBindingPath("describedBy") ? this.getBindingPath("describedBy") : */"$sapuimdcFlpActionHandler>/mainAction/description"
				}
			// visible: "{$sapuimdcFlpActionHandler>visible}"
			}),
			items: {
				path: '$sapuimdcFlpActionHandler>/availableActions',
				templateShareable: false,
				template: new LinkInfoItem({
					// key: "{$sapuimdcFlpActionHandler>key}",
					href: "{$sapuimdcFlpActionHandler>href}",
					text: "{$sapuimdcFlpActionHandler>text}",
					target: "{$sapuimdcFlpActionHandler>target}",
					description: "{$sapuimdcFlpActionHandler>description}"
				// visible: "{$sapuimdcFlpActionHandler>visible}"
				})
			},
			// extraContent: aForms.length ? new VBox({
			// 	items: aForms
			// }) : undefined,
			enablePersonalization: this.getEnablePersonalization() && !!sStableID
		});

		// oNavigationContainer._getFlexHandler().setInitialSnapshot(FlexHandler.convertArrayToSnapshot("key", oModel.getProperty("/availableActions")));
		oPanel.setModel(oModel, "$sapuimdcFlpActionHandler");
		return Promise.resolve(oPanel);
	};

	// ----------------------- Private methods --------------------------------------------

	FlpActionHandler.prototype._onModelContextChange = function() {
		if (!this.getBindingContext()) {
			return;
		}
		//ER: now it is done in setter method.
		//this._retrieveNavigationTargets();

		this._setBindingPath4ContactAnnotation();
	};

	FlpActionHandler.prototype._setBindingPath4ContactAnnotation = function() {
		var sBindingPath = this.getBindingContext() ? this.getBindingContext().getPath() : undefined;
		var sContactAssociationPath = this.getContactAnnotationPath();
		if (!this.getModel() || !sBindingPath || sContactAssociationPath === undefined) {
			return;
		}

		// var that = this;
		// var sBindingPathOfAnnotation;
		// var oModel = this._getInternalModel();
		// this._oContactDetailsController.setModel(this.getModel());
		//
		// this._oContactDetailsController.getBindingPath4ContactAnnotation(sBindingPath, sContactAssociationPath, undefined).then(function(sBindingPathOfAnnotation_) {
		// 	sBindingPathOfAnnotation = sBindingPathOfAnnotation_;
		// 	return that._oContactDetailsController.getContactDetailsAnnotation(sBindingPathOfAnnotation);
		// }).then(function(oContactDetailsAnnotation) {
		// 	if (oContactDetailsAnnotation) {
		// 		oModel.setProperty("/bindingPathOfAnnotation", sBindingPathOfAnnotation);
		// 	}
		// 	that.fireDataUpdate();
		// });
	};

	FlpActionHandler.prototype._retrieveNavigationTargets = function() {
		var sSemanticObjectDefault = this.getSemanticObject();
		var aAdditionalSemanticObjects = this.getAdditionalSemanticObjects() || [];
		var sAppStateKey = "";
		var oControl = this.getControl();
		var oComponent = this._getAppComponentForControl(oControl);
		var oSemanticAttributes = this._calculateSemanticAttributes(sSemanticObjectDefault, aAdditionalSemanticObjects, this.getSemanticObjectMapping(), oControl);
		var oModel = this._getInternalModel();

		Util.retrieveNavigationTargets(sSemanticObjectDefault, aAdditionalSemanticObjects, sAppStateKey, oComponent, oSemanticAttributes).then(function(oNavigationTargets) {
			oModel.setProperty("/availableActions", this._updateVisibilityOfAvailableActions(oNavigationTargets.availableActions));
			oModel.setProperty("/mainAction", oNavigationTargets.mainNavigation);

			this.fireDataUpdate();
		}.bind(this));
	};

	FlpActionHandler.prototype._calculateSemanticAttributes = function(sSemanticObjectDefault, aAdditionalSemanticObjects, oSemanticObjectMapping, oControl) {
		var oBindingContext = oControl && oControl.getBindingContext();
		if (!oBindingContext || !oSemanticObjectMapping || (!sSemanticObjectDefault && !(aAdditionalSemanticObjects && aAdditionalSemanticObjects.length))) {
			return {};
		}

		var oResults = {};
		var oContext = oBindingContext.getObject(oBindingContext.getPath());
		var aSemanticObjects = [
			sSemanticObjectDefault
		].concat(aAdditionalSemanticObjects);

		aSemanticObjects.forEach(function(sSemanticObject) {
			oResults[sSemanticObject] = {};
			for ( var sAttributeName in oContext) {
				// Ignore metadata
				if (sAttributeName === "__metadata") {
					continue;
				}
				// Ignore undefined and null values
				if (oContext[sAttributeName] === undefined || oContext[sAttributeName] === null) {
					continue;
				}
				// Ignore plain objects (BCP 1770496639)
				if (jQuery.isPlainObject(oContext[sAttributeName])) {
					continue;
				}

				var sAttributeNameMapped = (oSemanticObjectMapping && oSemanticObjectMapping[sSemanticObject] && oSemanticObjectMapping[sSemanticObject][sAttributeName]) ? oSemanticObjectMapping[sSemanticObject][sAttributeName] : sAttributeName;

				// If more then one local property maps to the same target property (clash situation)
				// we take the value of the last property and write an error log
				if (oResults[sSemanticObject][sAttributeNameMapped]) {
					jQuery.sap.log.error("During the mapping of the attribute " + sAttributeName + " a clash situation is occurred. This can lead to wrong navigation later on.");
				}

				// Copy the value replacing the attribute name by semantic object name
				oResults[sSemanticObject][sAttributeNameMapped] = oContext[sAttributeName];
			}
		});
		return oResults;
	};

	FlpActionHandler.prototype._onAvailableActionsPersonalizationPress = function(oEvent) {
		var that = this;
		var oPanel = oEvent.getSource();

		this.getPopover().setModal(true);
		oPanel.openSelectionDialog(false, true, undefined, true, undefined).then(function() {
			// Note: in the meantime the oPopover could be closed outside of FlpActionHandler, so we have to check if the instance still exists
			if (that.getPopover()) {
				that.getPopover().setModal(false);
			}
		});
	};

	FlpActionHandler.prototype._updateVisibilityOfAvailableActions = function(aMAvailableActions) {
		// TODO
		// if (!this._getEnabledAvailableActionsPersonalizationTotal()) {
		// 	return;
		// }

		// Update the 'visible' attribute only for storable (i.e. actions with filled 'key') availableActions.
		var aMValidAvailableActions = Util.getStorableAvailableActions(aMAvailableActions);
		var bHasSuperiorAction = aMValidAvailableActions.some(function(oMAvailableAction) {
			return !!oMAvailableAction.isSuperiorAction;
		});
		aMValidAvailableActions.forEach(function(oMAvailableAction, iIndex) {
			// Do not show actions as 'Related Apps' in case of many actions. Exception: the action without 'key' which should be shown always.
			if (aMAvailableActions.length > 10) {
				oMAvailableAction.visible = false;
			}
			// If at least one superiorAction exists, do not show other actions
			if (bHasSuperiorAction) {
				oMAvailableAction.visible = false;
			}
			// Show always superiorAction
			if (oMAvailableAction.isSuperiorAction) {
				oMAvailableAction.visible = true;
			}
		});
		return aMAvailableActions;
	};

	FlpActionHandler.prototype._getNavigationContainerStableId = function() {
		var oControl = this.getControl();
		if (!oControl) {
			jQuery.sap.log.error("FlpActionHandler: Stable ID could not be determined because the control is undefined");
			return undefined;
		}
		var oAppComponent = this._getAppComponentForControl(oControl);
		if (!oAppComponent) {
			jQuery.sap.log.error("FlpActionHandler: Stable ID could not be determined because the app component is not defined for control '" + oControl.getId() + "'");
			return undefined;
		}
		var aSemanticObjects = [
			this.getSemanticObject()
		].concat(this.getAdditionalSemanticObjects());
		Util.sortArrayAlphabetical(aSemanticObjects);
		if (!aSemanticObjects.length) {
			jQuery.sap.log.error("FlpActionHandler: Stable ID could not be determined because the property 'persistencyKey' is not defined");
			return undefined;
		}
		return oAppComponent.createId("sapuimdcbaseactionActionHandler---" + aSemanticObjects.join("--"));
	};

	FlpActionHandler.prototype._getTriggerableActions = function() {
		var oModel = this._getInternalModel();
		var aActions = oModel.getProperty('/availableActions').concat(oModel.getProperty('/mainAction') ? oModel.getProperty('/mainAction') : []);
		return aActions.filter(function(oAction) {
			return !!oAction.href;
		});
	};
	FlpActionHandler.prototype._hasExtraContent = function() {
		return this._getInternalModel().getProperty("/bindingPathOfAnnotation");
	};
	FlpActionHandler.prototype._getInternalModel = function() {
		return this.getModel("$sapuimdcFlpActionHandler");
	};
	FlpActionHandler.prototype._getAppComponentForControl = function(oControl) {
		return Factory.getService("FlUtils").getAppComponentForControl(oControl);
	};

	return FlpActionHandler;

}, /* bExport= */true);
