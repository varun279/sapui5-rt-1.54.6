sap.ui.define([
    "jquery.sap.global",
    "./common.boot.path",
    "./common.boot.task",
    "./common.load.launchpad"
], function (jQuery, sBootPath, fnBootTask, fnLoadLaunchpadContent) {
    "use strict";

    return configureUI5Settings;

    /**
     * Given a map of settings, this functions applies UI5 relevant settings.
     *
     * @param {object} oSettings A collection of settings.
     *
     * @private
     */
    function configureUI5Settings(oSettings) {

        var oSAPUIConfig = window["sap-ui-config"] || {},
            sUshellBootstrapPlatform = oSettings && oSettings.platform;

        // resourceroots are evaluated very early - therefore, we have
        // to set the default boot path explicitly
        jQuery.sap.registerModulePath("", sBootPath);

        // TODO: global configuration variable might not be evaluated
        // at this point in time; check if we can use explicit API calls instead
        oSAPUIConfig["libs"] = oSettings.libs.join(); // add dynamic libs from ushell config e.g. ushell_abap
        oSAPUIConfig["preload"] = "async";
        oSAPUIConfig["theme"] = "sap_belize";  // fallback theme if no user-specfic or default theme is defined
        oSAPUIConfig["oninit"] = fnLoadLaunchpadContent;
        oSAPUIConfig["compatversion"] = "1.16";
        oSAPUIConfig["xx-boottask"] = fnBootTask.bind(null, sUshellBootstrapPlatform);
        oSAPUIConfig["bindingsyntax"] = "complex";
    }

});