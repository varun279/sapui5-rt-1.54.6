/*
 * This module provides the task to be executed after the UI5 library has loaded.
 */
sap.ui.define([
    "jquery.sap.global",
    "./common.constants",
    "../common/common.configure.ui5language",
    "../common/common.configure.ui5theme",
    "../common/common.configure.ui5datetimeformat",
    "../common/common.configure.xhrlogon",
    "../common/common.load.xhrlogon"
], function (jQuery, oConstants, fnConfigureUI5Language, fnConfigureUI5Theme, fnConfigureUI5DateTimeFormat, fnConfigureXhrLogon, oXhrLogonLib) {
    "use strict";

    return bootTask;

    /**
     * This function should be called after the UI5 library has loaded.
     *
     * @param {string} sUshellBootstrapPlatform The current platform (could be CDM for instance).
     * @param {function} fnContinueUI5Boot The function to execute to continue booting the UI5 framework.
     *
     * @returns {Promise|jQuery.Deferred} A promise to exectute the boot task.
     *
     * @private
     */
    function bootTask(sUshellBootstrapPlatform, fnContinueUI5Boot) {
        var oUshellConfig = window[oConstants.ushellConfigNamespace];

        jQuery.sap.require("sap.ushell.services.Container");

        // We need to set the langauge first in order to evaluate it when
        // setting the theme as we need to identify the RTL relvevant langauges then
        // Therefore the following sequence needs to be kept.
        fnConfigureUI5Language(oUshellConfig);
        fnConfigureUI5Theme(oUshellConfig);
        fnConfigureUI5DateTimeFormat(oUshellConfig);

        window.sap.ushell.bootstrap(sUshellBootstrapPlatform)
            .then(function () { // make sap.ushell.Container available
                fnConfigureXhrLogon(sap.ushell.Container, oXhrLogonLib);
            })
            .then(fnContinueUI5Boot);
    }
});
