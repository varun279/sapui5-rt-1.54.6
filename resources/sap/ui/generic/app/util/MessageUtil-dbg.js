/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2018 SAP SE. All rights reserved
 */

sap.ui.getCore().loadLibrary("sap.m");

sap.ui.define(["sap/ui/core/ValueState", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/m/MessageToast"],
	function (ValueState, Filter, FilterOperator, MessageToast) {
		"use strict";

		/**
		 * static Message Util class.
		 * @private
		 * @class This static class contains messages related to transient messages and error handling. There is a
		 * transformation from "transient" to "persistent" in the stack: in the backend messages that are only fired
		 * and returned once are called transient (opposite are state messages that are returned as long as the problem
		 * is not resolved). As the UI needs to take care that those messages are explicitly shown to the user a dialog
		 * is used, once the user closes the dialog the transient messages are removed.
		 * As there's no transient flag yet in the OData message container the target is misused, it's set to
		 * /#TRANSIENT/(target) while (target) contains the real target. The UI5 Message Parser knows this workaround,
		 * removes the /#TRANSIENT/ string, sets/calculates the target correctly and sets this message to persistent.
		 * In the message model this property is not called transient but persistent because the meaning of this
		 * property is that the messages are not automatically be removed from the Message Model (although further data/
		 * messages are read for the same entity type). The messages stay in the model as long as the client removes
		 * them. The methods in this Message connect the term "transient" with the term "persistent" - due to the fact
		 * that the purpose of them is to handle the transient messages from the backend they are still have the term
		 * transient in their names
		 * @author SAP SE
		 * @version 1.54.6
		 * @since 1.30.0
		 * @alias sap.ui.generic.app.util.MessageUtil
		 */

		var httpStatusCodes = {
			badRequest: "400",
			unauthorized: "401",
			forbidden: "403",
			notFound: "404",
			methodNotAllowed: "405",
			preconditionFailed: "428",
			internalServerError: "500",
			notImplemented: "501",
			badGateway: "502",
			serviceUnavailable: "503",
			gatewayTimeout: "504",
			httpVersionNotSupported: "505"
		};

		var operations = {
			callAction: "callAction",
			addEntry: "addEntry",
			saveEntity: "saveEntity",
			deleteEntity: "deleteEntity",
			editEntity: "editEntity",
			modifyEntity: "modifyEntity",
			activateDraftEntity: "activateDraftEntity",
			saveAndPrepareDraftEntity: "saveAndPrepareDraftEntity",
			getCollection: "getCollection"
		};
		var sMessageErrorPath;

		function fnGetTransientMessages(oResponse) {
			var aTransientMessages = [], oMessage;
			var oMessageManager = sap.ui.getCore().getMessageManager();
			var aMessages = oMessageManager.getMessageModel().getData();

			for (var i = 0; i < aMessages.length; i++) {
				oMessage = aMessages[i];
				if (oMessage.getPersistent()) {
					aTransientMessages.push(oMessage);
				}
			}

			// in future we want to return only the transient messages that are returned by the given response
			// this does not work yet due to missing core functionality
			jQuery.noop(oResponse);

			return aTransientMessages;
		}


		/**
			 * Default/example implementation for a dialog fragment provider needed for example in function <code>handleTransientMessages</code>
			 *
			 * @param {sap.ui.core.Control} oParentView The view on which the message dialog depends
			 * @param {string} [sContentDensityClass] The name of the style class
			 *
			 * @return {function} Provider function which requires two input parameters: the name of the fragment and the fragment controller.
			 *
			 * @since 1.40
			 * @private
			 */
		function createDialogFragmentProvider(oParentView, sContentDensityClass) {
			var fnDialogFragmentProvider;

			fnDialogFragmentProvider = function (sName, oFragmentController) {
				var oFragment;
				var oDialogFragmentControllerWrapper = {
					onMessageDialogClose: function () {
						oFragmentController.onMessageDialogClose();
						oFragment.destroy();
					}
				};

				oFragment = sap.ui.xmlfragment(sName, oDialogFragmentControllerWrapper);
				if (sContentDensityClass) {
					jQuery.sap.syncStyleClass(sContentDensityClass, oParentView, oFragment);
				}
				oParentView.addDependent(oParentView);
				return oFragment;
			};

			return fnDialogFragmentProvider;
		}
		
		/**
		 * With this function, all transient messages are taken over from the MessageManager and
		 * displayed. After displaying them, the transient messages are removed automatically from the MessageManager.
		 *
		 * To show the messages, a custom <code>sap.ui.xmlfragment</code> can be provided via a callback function.
		 *
		 * @param {function|map} vMessageDialogData Either a callback <code>function</code> that returns a message dialog fragment or a
		 * property bag that contains the two parameters <code>owner</code> and <code>contentDensityClass</code>
		 * @param {sap.ui.core.Control} [vMessageDialogData.owner] The owner control on which the message dialog depends
		 * @param {string} [vMessageDialogData.contentDensityClass] The density class which controls the display mode
		 * @param {string} sActionLabel A label for the action
		 * @returns <code>false</code> when no transient messages have been processed, in all other cases <code>undefined</code>
		 *
		 * @since 1.38
		 *
		 * @experimental
		 * @public
		 */
		function handleTransientMessages(vMessageDialogData, sActionLabel) {
			var sState, oDialog, oBackBtn, oMessageView;
			var oDialogFragmentController = {
					onMessageDialogClose: function () {
						oBackBtn.setVisible(false);
						oMessageView.navigateBack();
						oDialog.close();
						removeTransientMessages();
					},
					onBackButtonPress: function() {
						oBackBtn.setVisible(false);
						oMessageView.navigateBack();
					},
					onMessageSelect: function() {
						oBackBtn.setVisible(true);
					},
					getGroupName: function(sMessageTarget) {
						var sEntitySet, oEntitySet, oEntityType, oEntity, oHeaderInfo, sGroupName, sTypeName;
						var oModel = oDialog.getModel();
						var oMetaModel = oModel.getMetaModel();

						if (!sMessageTarget) {
							return oLibraryResourceBundle.getText("GENERAL_TITLE");
						}
						if (sMessageTarget.lastIndexOf("/") > 0) {
							sMessageTarget = sMessageTarget.substring(0, sMessageTarget.lastIndexOf("/"));
						}
						sEntitySet = sMessageTarget.substring(1, sMessageTarget.indexOf('('));
						oEntitySet = sEntitySet && oMetaModel.getODataEntitySet(sEntitySet);
						oEntityType = oEntitySet && oMetaModel.getODataEntityType(oEntitySet.entityType);
						oHeaderInfo = oEntityType && oEntityType["com.sap.vocabularies.UI.v1.HeaderInfo"];
						sTypeName = oHeaderInfo && oHeaderInfo.Title && oHeaderInfo.Title.Value && oHeaderInfo.Title.Value.Path;
						oEntity = oModel.getProperty(sMessageTarget);
						sGroupName = oEntity && oEntity[sTypeName];
						return sGroupName ? sGroupName : oLibraryResourceBundle.getText("GENERAL_TITLE");
					}
				};

			//get all the Backend transient message
			var aTransientMessages = fnGetTransientMessages();
			var oLibraryResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.generic.app");

			if (aTransientMessages.length === 0) {
				return false;
			} else if (aTransientMessages.length === 1 && aTransientMessages[0].type === ValueState.Success) {
				MessageToast.show(aTransientMessages[0].message, {
					onClose: removeTransientMessages
				});
			} else {
				if (typeof vMessageDialogData == "function") {
					oDialog = vMessageDialogData("sap.ui.generic.app.fragments.MessageDialog", oDialogFragmentController);

				} else if (typeof vMessageDialogData == "object") {
					oDialog = createDialogFragmentProvider(vMessageDialogData.owner, vMessageDialogData.contentDensityClass)(
						"sap.ui.generic.app.fragments.MessageDialog", oDialogFragmentController);

				} else {
					//assert
					return undefined;
				}

				var oCustomHeader = oDialog.getAggregation("customHeader");
				var oBackBtn = oCustomHeader.getContentLeft()[0];
				var oMessageView = oDialog.getAggregation("content")[0];

				var oMessageModel = sap.ui.getCore().getMessageManager().getMessageModel();
				oDialog.setModel(oMessageModel, "message");
				var oMessageList = oDialog.getContent()[0];
				var oBinding = oMessageList.getBinding("items");
				oBinding.filter(new Filter("persistent", FilterOperator.EQ, true));

				//create a model for button & Text
				var oSettingModel = new sap.ui.model.json.JSONModel();
				oDialog.setModel(oSettingModel, "settings");
				// set close button text, don't use i18n model as the resources would then be loaded every time
				oSettingModel.setProperty("/closeButtonText", oLibraryResourceBundle.getText("DIALOG_CLOSE"));
				// set title according to the severity
				for (var i = 0; i < aTransientMessages.length; i++) {
					var oMessage = aTransientMessages[i];

					if (oMessage.type === sap.ui.core.MessageType.Error) {
						// Error
						sState = sap.ui.core.ValueState.Error;
						break;
					}

					if (oMessage.type === sap.ui.core.MessageType.Warning) {
						// Warning
						sState = sap.ui.core.ValueState.Warning;
						continue;
					}

					if (oMessage.type === sap.ui.core.MessageType.Information || oMessage.type === sap.ui.core.MessageType.None) {
						// information
						sState = sap.ui.core.ValueState.None;
						continue;
					}

					sState = sap.ui.core.ValueState.Success;
				}
				oSettingModel.setProperty("/state", sState);

				//If Action Name is available it will be shown as Dialog Title.
				if (sActionLabel) {
					oSettingModel.setProperty("/title", sActionLabel);
				} else { //Show "Messages" as the dialog title
					oSettingModel.setProperty("/title", oLibraryResourceBundle.getText("DIALOG_TITLE"));
				}
				oDialog.open();
			}
		}

		/**
		 * Remove all transient messages that are currently available in the MessageManager.
		 *
		 * @since 1.38
		 *
		 * @experimental
		 * @public
		 */
		function removeTransientMessages() {
			var oMessageManager = sap.ui.getCore().getMessageManager();
			var aTransientMessages = fnGetTransientMessages();

			if (aTransientMessages.length > 0) {
				oMessageManager.removeMessages(aTransientMessages);
			}
		}

		/**
		 * add a transient error messages to the MessageManager
		 *
		 * @param {string} sMessage Text of the message to add
		 * @param {string} sDescription Long text of the transient message added
		 * 
		 * @since 1.40
		 * @experimental
		 * @public
		 */
		function addTransientErrorMessage(sMessage, sDescription, oModel) {
			// currently still use /#TRANSIENT target, to be replaced with persistent flag
			var oTransientMessage = new sap.ui.core.message.Message({
				message: sMessage,
				description: sDescription,
				type: sap.ui.core.MessageType.Error,
				processor: oModel,
				target: '',
				persistent: true
			});
			sap.ui.getCore().getMessageManager().addMessages(oTransientMessage);
		}

		/**
		 * This function parses an error response and returns information like the status code, leading error text,
		 * description (not yet) and if already transient message exist
		 *
		 * @param {object} oError The error response object
		 *
		 * @since 1.40
		 *
		 * @experimental
		 * @public
		 */
		function parseErrorResponse(oError) {
			var oReturn;

			// BCP 1770144015
			sMessageErrorPath = oError && oError.url;
			if (sMessageErrorPath) {
				sMessageErrorPath = "/" + sMessageErrorPath.substring(0,sMessageErrorPath.indexOf(")") + 1);
			}

			var sMessage = sap.ui.getCore().getLibraryResourceBundle("sap.ui.generic.app").getText("ERROR_UNKNOWN");
			var sHttpStatusCode;

			if (oError instanceof Error) {
				// promise rejection
				if (oError.message) {
					// TODO differentiate between technical errors and business errors in case of promise rejections
					sMessage = oError.message;
				}
			} else if (oError.response) { // odata error
				if (oError.response.message) {
					// TODO differentiate between technical errors and business errors in case of promise rejections
					sMessage = oError.response.message;
				}

				// check http status code
				if (oError.response.statusCode) {
					sHttpStatusCode = oError.response.statusCode;
				}

				// check for content type of response - in case of a runtime error on the backend it is xml
				if (oError.response.headers) {
					for (var sHeader in oError.response.headers) {
						if (sHeader.toLowerCase() === "content-type") {
							var sHeaderValue = oError.response.headers[sHeader];
							if (sHeaderValue.toLowerCase().indexOf("application/json") === 0) {
								if (oError.response.responseText) {
									var oODataError = JSON.parse(oError.response.responseText);
									if (oODataError && oODataError.error && oODataError.error.message && oODataError.error.message.value) {
										sMessage = oODataError.error.message.value;
									}
								}
							} else if (oError.message) {
								sMessage = oError.message;
							}
							break;
						} // if content-type is not application/json it is usually an internal server error (status code 500)
					}
				}
			}

			var aTransientMessages = fnGetTransientMessages(oError);

			oReturn = {
				httpStatusCode: sHttpStatusCode,
				messageText: sMessage,
				description: null, // TODO: get description
				containsTransientMessage: (aTransientMessages.length === 0) ? false : true
			};

			return oReturn;
		}

		return {
			operations: operations,
			httpStatusCodes: httpStatusCodes,
			handleTransientMessages: handleTransientMessages,
			removeTransientMessages: removeTransientMessages,
			addTransientErrorMessage: addTransientErrorMessage,
			parseErrorResponse: parseErrorResponse
		};
	}, true);