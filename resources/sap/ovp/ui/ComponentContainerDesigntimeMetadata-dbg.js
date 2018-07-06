/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */

sap.ui.define([
        'jquery.sap.global',
        'sap/ui/fl/changeHandler/JsControlTreeModifier',
        "sap/ovp/cards/CommonUtils",
        "sap/ovp/cards/SettingsUtils",
        "sap/m/Dialog",
        "sap/m/Button"
    ], function (jQuery, JsControlTreeModifier, CommonUtils, SettingsUtils, Dialog, Button) {
        "use strict";
        var oAppMain = CommonUtils.getApp();
        var oResourceBundle = oAppMain && oAppMain._getLibraryResourceBundle();
        oResourceBundle = oResourceBundle || sap.ui.getCore().getLibraryResourceBundle("sap.ovp");
        return {
            name: {
                singular: oResourceBundle.getText("Card"),
                plural: oResourceBundle.getText("Cards")
            },
            actions: {
                remove: {
                    changeType: "hideCardContainer",
                    changeOnRelevantContainer: true
                },
                reveal: {
                    changeType: "unhideCardContainer",
                    changeOnRelevantContainer: true
                },
                settings: function () {
                    return {
                        "EditCard": {
                            name: oResourceBundle.getText("OVP_KEYUSER_MENU_EDIT_CARD"),
                            isEnabled: function (oSelectedElement) {
                                return false;
                            },
                            changeOnRelevantContainer: true,
                            handler: SettingsUtils.fnEditCardHandler
                        },
                        "CloneCard": {
                            name: oResourceBundle.getText("OVP_KEYUSER_MENU_CLONE_CARD"),
                            isEnabled: function (oSelectedElement) {
                                return false;
                            },
                            handler: SettingsUtils.fnCloneCardHandler
                        }/*,
                        "AddCard": {
                            name: oResourceBundle.getText("OVP_KEYUSER_MENU_ADD_CARD"),
                            isEnabled: function (oSelectedElement) {
                                return false; //Disabled as of now
                            },
                            handler: SettingsUtils.fnAddCardHandler
                        }*/
                    };
                }
            }
        };
    },
    /* bExport= */true);
