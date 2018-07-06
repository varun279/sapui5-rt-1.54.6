/*
 * This module provides a function that actually initiates loading of the
 * launchpad content.
 */
sap.ui.define([
    "jquery.sap.global",
    "./common.boot.path"
], function (jQuery, sBootPath) {
    "use strict";

    return loadLaunchpadContent;

    function loadLaunchpadContent() {
        var oContent = window.sap.ushell.Container.createRenderer();

        fnConfigureCDMSiteURL();

       jQuery.sap.setIcons({
            "phone": sBootPath + "/sap/ushell/themes/base/img/launchicons/57_iPhone_Desktop_Launch.png",
            "phone@2": sBootPath + "/sap/ushell/themes/base/img/launchicons/114_iPhone-Retina_Web_Clip.png",
            "tablet": sBootPath + "/sap/ushell/themes/base/img/launchicons/72_iPad_Desktop_Launch.png",
            "tablet@2": sBootPath + "/sap/ushell/themes/base/img/launchicons/144_iPad_Retina_Web_Clip.png",
            "favicon": sBootPath + "/sap/ushell/themes/base/img/launchpad_favicon.ico",
            "precomposed": true
        });

        // TODO: Declare dependency.
       jQuery.sap.require("sap.ushell.iconfonts");
       jQuery.sap.require("sap.ushell.services.AppConfiguration");

        window.sap.ushell.iconfonts.registerFiori2IconFont();

       jQuery("#canvas").empty();
        oContent.placeAt("canvas");
    }

    function fnConfigureCDMSiteURL() {
        // TODO: move to adapter implementation; add config switch to disable for productive setups
        var sSiteURL = jQuery.sap.getUriParameters().get("sap-ushell-cdm-site-url");
        var oAdapterConfig = jQuery.sap.getObject("sap-ushell-config.services.CommonDataModel.adapter.config", 0);

        if (sSiteURL) {
            oAdapterConfig.cdmSiteUrl = sSiteURL;
        }
    }

});