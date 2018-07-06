/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2018 SAP SE. All rights reserved
 */

sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/XMLComposite'
], function(jQuery, XMLComposite) {
	"use strict";

	/**
	 * Constructor for a new Panel.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The Panel control is used to show <code>items</code> and <code>mainItem</code>.
	 * @extends sap.ui.code.XMLComposite
	 * @author SAP SE
	 * @version 1.54.6
	 * @constructor
	 * @private
	 * @since 1.54.0
	 * @alias sap.ui.mdc.base.linkinfo.Panel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Panel = XMLComposite.extend("sap.ui.mdc.base.linkinfo.Panel", /** @lends sap.ui.mdc.base.linkinfo.Panel.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			defaultAggregation: "items",
			properties: {
				/**
				 *  Determines whether the personalization button is shown inside the <code>Panel</code> control. Additionally the
				 *  personalization button is only then shown if something can be personalized.
				 */
				enablePersonalization: {
					type: "boolean",
					defaultValue: true
				}
			},
			aggregations: {
				/**
				 * The main item.
				 */
				mainItem: {
					type: "sap.ui.mdc.base.linkinfo.Item",
					multiple: false
				},
				/**
				 * Defines items.
				 */
				items: {
					type: "sap.ui.mdc.base.linkinfo.Item",
					multiple: true,
					singularName: "item"
				},
				/**
				 * In addition to main item and items some additional content can be displayed in the panel.
				 */
				extraContent: {
					type: "sap.ui.core.Control",
					multiple: false,
					forwardTo: {
						targetIdSuffix: "--IDExtraContent",
						targetAggregation: "items",
						forwardBinding: false
					}
				}
			}
		}
	});

	Panel.prototype.init = function() {
		// Create a resource bundle for language specific texts
		this.setModel(new sap.ui.model.resource.ResourceModel({
			bundleUrl: sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").oUrlInfo.url
		}), "i18n");
	};

	// // TODO: ist es möglich hier AggregationProxy zu verwenden?
	// Panel.prototype.setExtraContent = function(oControl) {
	// 	this.setAggregation("extraContent", oControl);
	// 	// TODO: wird das oControl aus 'extraContent' Aggregation entfernt und in die '_content' eingesetzt?
	// 	// Es führt zu rotem UnitTest?
	// 	this.getAggregation("_content").getContent()[1].insertItem(oControl, 0);
	// 	return this;
	// };

	return Panel;

}, /* bExport= */true);
