/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2018 SAP SE. All rights reserved
 */

sap.ui.define([
	'sap/ui/core/Element'
], function(Element) {
	"use strict";

	/**
	 * Constructor for a new Item.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Type for <code>items</code> aggregation in <code>InfoBoxPanel</code> control.
	 * @extends sap.ui.core.Element
	 * @version 1.54.6
	 * @constructor
	 * @private
	 * @since 1.54.0
	 * @alias sap.ui.mdc.base.linkinfoItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Item = Element.extend("sap.ui.mdc.base.linkinfoItem", /** @lends sap.ui.mdc.base.linkinfoItem.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Defines text of the item.
				 */
				text: {
					type: "string"
				},
				/**
				 * Defines additional text of the item.
				 */
				description: {
					type: "string"
				},
				/**
				 * Defines href of the item.
				 */
				href: {
					type: "string",
					defaultValue: undefined
				},
				/**
				 * Defines target of a link.
				 */
				target: {
					type: "string",
					defaultValue: undefined
				// },
				// /**
				//  * Defines press handler of a link.
				//  */
				// press: {
				// 	type: "object",
				// 	defaultValue: null
				}
			}
		}
	});

	return Item;

}, /* bExport= */true);
