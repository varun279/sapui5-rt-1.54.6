/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2018 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/fl/changeHandler/MoveControls"
], function (
	MoveControls
) {
	"use strict";

	/**
	 * Change handler for moving of fields within/between groups.
	 * @alias sap.ui.comp.smartform.flexibility.changes.MoveFields
	 * @author SAP SE
	 * @version 1.54.6
	 * @experimental Since 1.27.0
	 */
	var MoveFields = jQuery.extend({}, MoveControls);

	/**
	 * Moves field(s) within a group or between groups.
	 *
	 * @param {object} oChange change object with instructions to be applied on the control
	 * @param {object} oControl Smart form group instance which is referred to in change selector section
	 * @param {object} mPropertyBag - map of properties
	 * @param {object} mPropertyBag.view - view object or xml element representing an ui5 view
	 * @param {sap.ui.fl.changeHandler.BaseTreeModifier} mPropertyBag.modifier - modifier for the controls
	 * @param {sap.ui.core.UIComponent} mPropertyBag.appComponent - component in which the change should be applied
	 * @public
	 * @function
	 * @returns {boolean} true - if change could be applied
	 * @name sap.ui.comp.smartform.flexibility.changes.MoveFields#applyChange
	 */
	MoveFields.applyChange = function(oChange, oControl, mPropertyBag) {
		mPropertyBag.targetAggregation = "groupElements";
		mPropertyBag.sourceAggregation = "groupElements";
		return MoveControls.applyChange.call(this, oChange, oControl, mPropertyBag);
	};

	return MoveFields;
},
/* bExport= */true);
