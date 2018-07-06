// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/**
 * @fileOverview The Unified Shell's AppStateAdapter for the ABAP
 *               platform.
 *
 * @version 1.54.6
 */
(function () {
    "use strict";
    /*jslint nomen: true*/
    /*global jQuery, sap, setTimeout */
    jQuery.sap.declare("sap.ushell_abap.adapters.abap.AppStateAdapter");
    jQuery.sap.require("sap.ushell.services.Personalization");
    jQuery.sap.require("sap.ui2.srvc.ODataWrapper");

    /**
     * Constructs a new instance of the AppStateAdapter for the ABAP
     * platform
     *
     * @param {object} oSystem
     *   The system served by the adapter
     * @param {string} sParameters
     *   Parameter string, not in use
     * @param {object} oConfig
     *   A potential adapter configuration
     * @class The Unified Shell's AppStateAdapter for the ABAP platform.
     *
     * @constructor
     * @since 1.28.0
     * @private
     */
    sap.ushell_abap.adapters.abap.AppStateAdapter = function (oSystem, sParameters, oConfig) {
        this._oConfig = oConfig && oConfig.config;
        var sAppStateServiceURL = (jQuery.sap.getObject("services.appState.baseUrl", undefined,
                oConfig) || "/sap/opu/odata/UI2/INTEROP") + "/";
        var oODataWrapperSettings = {
            baseUrl:     sAppStateServiceURL,
            'sap-language': sap.ushell.Container.getUser().getLanguage(),
            'sap-client':   sap.ushell.Container.getLogonSystem().getClient()
        };
        this._oWrapper = sap.ui2.srvc.createODataWrapper(oODataWrapperSettings);
        function fnDefaultFailure(oMessage) {
            sap.ui2.srvc.Error(oMessage, "sap.ushell_abap.adapters.abap.AppStateAdapter");
        }
        sap.ui2.srvc.ODataService.call(this, this._oWrapper, fnDefaultFailure);
    };

    /**
     * Save the given data sValue for the given key at the persistence layer
     *
     * @param {string} sKey
     *   The generated key value of the application state to save
     * @param {string} sSessionKey
     *   A generated session key
     *   overwriting/modifying an existing record is only permitted if the
     *   session key matches the key of the initial creation.
     *   It shall be part of the save request, but shall not be returned on reading
     *   (it is not detectable from outside).
     * @param {string} sValue
     *   The value to persist under the given key
     * @param {string} sAppName
     *   The application name (the ui5 component name)
     *   should be stored with the data to allow to identify the data association
     * @param {string} sComponent
     *   A 24 character string representing the application component,
     *   (A sap support component)
     *   may be undefined if not available on the client
     *
     * @returns {object} promise
     *   whose done function's return is empty
     * @private
     */
    sap.ushell_abap.adapters.abap.AppStateAdapter.prototype.saveAppState = function (sKey, sSessionKey,
            sValue, sAppname, sComponent) {
        var oDeferred = new jQuery.Deferred(),
            sRelativeUrl = "GlobalContainers",
            oPayload = {
                "id": sKey,
                "sessionKey": sSessionKey,
                "component": sComponent,
                "appName": sAppname,
                "value": sValue
            };

        this._oWrapper.create(sRelativeUrl, oPayload, function (response) {
            oDeferred.resolve();
        }, function (sErrorMessage) {
            oDeferred.reject(sErrorMessage);
            jQuery.sap.log.error(sErrorMessage);
        });

        return oDeferred.promise();
    };

    /**
     * Read the application state sValue for the given key sKey from the persistence layer
     *
     * @param {string} sKey
     *   Key of the application state (less than 40 characters)
     *
     * @returns {object} promise
     *   whose done function returns the response ID and value as parameter
     * @private
     */
    sap.ushell_abap.adapters.abap.AppStateAdapter.prototype.loadAppState = function (sKey) {
        var oDeferredRead = new jQuery.Deferred(),
            sRelativeUrl = "GlobalContainers(id='" + encodeURIComponent(sKey) + "')";

        if (!sKey) {
            throw new sap.ushell.utils.Error("The sKey is mandatory to read the data from the persistence layer");
        }

        // wrap the read operation into a batch request
        // reason: Hiding of the application state key as part of the URL
        this._oWrapper.openBatchQueue();
        this._oWrapper.read(sRelativeUrl, function (response) {
            oDeferredRead.resolve(response.id, response.value);
        }, function (sErrorMessage) {
            jQuery.sap.log.error(sErrorMessage);
            oDeferredRead.reject(sErrorMessage);
        }, false);
        this._oWrapper.submitBatchQueue(function () { }, function (sErrorMessage) {
            jQuery.sap.log.error(sErrorMessage);
            oDeferredRead.reject(sErrorMessage);
        });

        return oDeferredRead.promise();
    };
}());
