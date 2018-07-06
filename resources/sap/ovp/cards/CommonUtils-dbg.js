(function () {
    "use strict";
    jQuery.sap.require("sap.ovp.cards.OVPCardAsAPIUtils");
    jQuery.sap.declare("sap.ovp.cards.CommonUtils");

    sap.ovp.cards.CommonUtils = {
        app : undefined,
        navigationHandler : undefined,

        enable : function(app, oNavHandler) {
            this.app = app;
            this.navigationHandler = oNavHandler;
        },

        getApp : function() {
            return this.app;
        },

        getNavigationHandler : function() {
            return this.navigationHandler;
        },

        createKeyForCB: function (oTabs, oTab) {
            return oTabs.indexOf(oTab) + 1;
        },

        /**
         * Creating OVP Cards for External Libraries
         *
         * @method createCardComponent
         * @param {Object} oView - View where the card's component will be set to a Container
         * @param {Object} oManifest - Manifest settings object
         * @param {String} sContainerId - Container's Id where card's component will be set
         * @param {Object} oSelectionVariant - Selection Variant Object
         * @returns {Promise} - returns a promise on state of card creation
         */
        createCardComponent: function (oView, oManifest, sContainerId, oSelectionVariant) {
            return sap.ovp.cards.OVPCardAsAPIUtils.createCardComponent(oView, oManifest, sContainerId, oSelectionVariant);
        },

        /* Returns column name that contains the unit for the measure */
        getUnitColumn : function (measure, oEntityType, forSubtitleUOM) {
          var tempUnit, properties = oEntityType.property;
          for (var i = 0, len = properties.length; i < len; i++) {
            if (properties[i].name == measure) {
                      if (properties[i].hasOwnProperty("Org.OData.Measures.V1.ISOCurrency")) { //as part of supporting V4 annotation
                          return properties[i]["Org.OData.Measures.V1.ISOCurrency"].Path ? properties[i]["Org.OData.Measures.V1.ISOCurrency"].Path : (forSubtitleUOM ? properties[i]["Org.OData.Measures.V1.ISOCurrency"].String : "");
                      } else if (properties[i].hasOwnProperty("Org.OData.Measures.V1.Unit")) {
                          tempUnit = properties[i]["Org.OData.Measures.V1.Unit"].Path ? properties[i]["Org.OData.Measures.V1.Unit"].Path : (forSubtitleUOM ? properties[i]["Org.OData.Measures.V1.Unit"].String : "");
                          if (tempUnit && tempUnit != "%") {
                              return tempUnit;
                          } else {
                              return null;
                          }
                      } else if (properties[i].hasOwnProperty("sap:unit")) {
                          return properties[i]["sap:unit"];
                      }
              break;
            }
          }
          return null;
        },

        /*
            Hook function for Header Click
         */
        onHeaderClicked: function () {

        },

        /*
            Hook function for Content Click
         */
        onContentClicked: function (oEvent) {

        },

        /**
         * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
         * design mode class should be set, which influences the size appearance of some controls.
         * @public
         * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
         */
        getContentDensityClass: function () {
            if (this._sContentDensityClass === undefined) {
                // check whether FLP has already set the content density class; do nothing in this case
                if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
                    if (jQuery(document.body).hasClass("sapUiSizeCozy") === true) {
                        this._sContentDensityClass = "sapUiSizeCozy";
                    } else if (jQuery(document.body).hasClass("sapUiSizeCompact") === true) {
                        this._sContentDensityClass = "sapUiSizeCompact";
                    } else {
                        this._sContentDensityClass = "";
                    }
                } else if (!sap.ui.Device.support.touch) { // apply "compact" mode if touch is not supported
                    this._sContentDensityClass = "sapUiSizeCompact";
                } else {
                    // "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
                    this._sContentDensityClass = "sapUiSizeCozy";
                }
            }
            return this._sContentDensityClass;
        },

        _setCardpropertyDensityAttribute: function() {
            var sContentDensityClassName = this.getContentDensityClass();
            if (sContentDensityClassName === "sapUiSizeCompact") {
                return "compact";
            } else if (sContentDensityClassName === "sapUiSizeCozy") {
                return "cozy";
            } else if (!sap.ui.Device.support.touch) { // apply "compact" mode if touch is not supported
                return "compact";
            } else {
                // "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
                return "cozy";
            }
        },

        //returns the number of pixel for one rem from the current browser font size
        getPixelPerRem: function() {
            // Returns a number
            var fontSize = parseFloat(
                // of the computed font-size, so in px
                getComputedStyle(
                    // for the root <html> element
                    document.documentElement
                )
                    .fontSize
            );
            return fontSize;
        },

        /**
         * Shows the error messages from the body of an HTTP response.
         *
         * @param {object}
         *            oError an object with error information.
         */
        showODataErrorMessages: function (oError) {
            var aMessages = [], mError, mResponseBody, result = "";
            if (oError && oError.responseText) {
                // It's an error coming in via the requestFailed event of the model
                var sResponse = oError.responseText;
                if (sResponse) {
                    try {
                        mResponseBody = JSON.parse(sResponse);
                    } catch (exception) {
                        jQuery.sap.log.error("Failed parsing response as JSON: " + sResponse);
                    }
                    if (mResponseBody && mResponseBody.error) {
                        mError = mResponseBody.error;
                    }
                }
            }
            // Get messages from error
            if (mError && mError.innererror && mError.innererror.errordetails) {
                aMessages = mError.innererror.errordetails;
            }
            if (mError && mError.message && jQuery.isArray(aMessages)) {
                // Add the root message
                aMessages.unshift({
                    message: mError.message.value,
                    severity: "error"
                });
            }
            // Display the messages
            if (aMessages && aMessages.length > 0) {
                // SAP Gateway is overly cautious here and tends to provide you with the same error message multiple times. So let's keep track of the
                // messages that we've added already to avoid duplicates.
                // So here's the craziest thing: The OData framework does not only multiply messages but sometimes, it feels like it should add a dot
                // ('.') to the end of the message if not already available. This can result in the same message being displayed twice, once with a
                // dot and once without. So when we keep track of the messages that we've already added, we'll ignore the dot.
                var mAddedMessages = {};
                jQuery.each(aMessages, function (iIdx, mMessage) {
                    var sMessageText = mMessage.message;
                    if (jQuery.sap.endsWith(sMessageText, ".")) {
                        sMessageText = sMessageText.substr(0, sMessageText.length - 1);
                    }
                    if (!mAddedMessages[sMessageText]) {
                        mAddedMessages[sMessageText] = true;
                        result = result + sMessageText + " ";
                    }
                });
            }
            return result;
        }
    };
}());
