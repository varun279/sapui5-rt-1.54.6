/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2018 SAP AG. All rights reserved
 */

sap.ui.define(['sap/apf/core/utils/checkForTimeout', 'sap/ui/model/odata/ODataUtils'],
		function(checkForTimeout, ODataUtils) {
	'use strict';

	/**
	 * @memberOf sap.apf.core
	 * @description Wraps a jQuery (jQuery.ajax) request in order to handle a server time-out.
	 * @param {object} settingsAndInject Configuration of the jQuery.ajax request plus additional settingsAndInjects.  One settingsAndInject is the
	 * ajax, that shall be used, and the message handler.
         * @param {boolean} settingsAndInject.suppressSapSystem directive, that the sap system parameter shall not be set
	 * @returns {object} jqXHR
	 */
	function _ajax(settingsAndInject) {
		var messageHandler = settingsAndInject.instances && settingsAndInject.instances.messageHandler;
		var oAjaxSettings = jQuery.extend(true, {}, settingsAndInject);
		if (oAjaxSettings.functions && oAjaxSettings.functions.ajax) {
			delete oAjaxSettings.functions.ajax;
		}
		if (oAjaxSettings.functions && oAjaxSettings.functions.getSapSystem) {
			delete oAjaxSettings.functions.getSapSystem;
		}
		if (oAjaxSettings.instances && oAjaxSettings.instances.messageHandler) {
			delete oAjaxSettings.instances.messageHandler;
		}
		if (oAjaxSettings.suppressSapSystem){
			delete oAjaxSettings.suppressSapSystem;
		}
		var fnBeforeSend = oAjaxSettings.beforeSend;
		var fnSuccess = oAjaxSettings.success;
		var fnError = oAjaxSettings.error;
		var originalError;
		var result;

		oAjaxSettings.beforeSend = function(jqXHR, settings) {
			if (fnBeforeSend) {
				fnBeforeSend(jqXHR, settings);
			}
		};
		oAjaxSettings.success = function(data, textStatus, jqXHR) {
			var oMessage;
			try {
				oMessage = sap.apf.core.utils.checkForTimeout(jqXHR);

				if (oMessage) {
					fnError(data, "error", undefined, oMessage);
				} else {
					fnSuccess(data, textStatus, jqXHR);
				}
			} catch(error) {
				defaultErrorHandling(error);
			}
		};
		oAjaxSettings.error = function(jqXHR, textStatus, errorThrown) {
			var oMessage;
			try {
				oMessage = sap.apf.core.utils.checkForTimeout(jqXHR);
				if (oMessage) {
					fnError(jqXHR, textStatus, errorThrown, oMessage);
				} else {
					fnError(jqXHR, textStatus, errorThrown);
				}
			} catch(error) {
				defaultErrorHandling(error);
			}
		};
		if ((settingsAndInject.functions && settingsAndInject.functions.getSapSystem &&
			settingsAndInject.functions.getSapSystem()) && !settingsAndInject.suppressSapSystem) {

			oAjaxSettings.url = sap.ui.model.odata.ODataUtils.setOrigin(oAjaxSettings.url,
					{ force : true, alias : settingsAndInject.functions.getSapSystem()});
		}
		if (settingsAndInject.functions && settingsAndInject.functions.ajax) {
			result = settingsAndInject.functions.ajax(oAjaxSettings);
		} else {
			result = jQuery.ajax(oAjaxSettings);
		}
		//propagate error from synchronous processing
		if (oAjaxSettings.async !== undefined && oAjaxSettings.async === false && messageHandler && messageHandler.isOwnException(originalError)) {
			throw new Error(originalError && originalError.message || "");
		}
		return result;

		function defaultErrorHandling(error) {
			var messageText;
			var oMessage;
			originalError = error;
			if (!messageHandler.isOwnException(error)) {
				messageText = error && error.message || "";
				oMessage = messageHandler.createMessageObject({
					code : "5042",
					aParameters : [ messageText ]
				});
				messageHandler.putMessage(oMessage);
			}
		}
	}
	/*BEGIN_COMPATIBILITY*/
	sap.apf.core = sap.apf.core || {};
	sap.apf.core.ajax = _ajax;
	/*END_COMPATIBILITY*/
	return _ajax;
}, true /*GLOBAL_EXPORT*/);