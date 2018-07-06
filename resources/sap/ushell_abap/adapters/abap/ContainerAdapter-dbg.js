// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/**
 * @fileOverview The Unified Shell's container adapter for the ABAP platform.
 *
 * @version 1.54.6
 */
/**
 * @namespace Default namespace for Unified Shell adapters for the ABAP platform. They can usually
 * be placed directly into this namespace, e.g.
 * <code>sap.ushell_abap.adapters.abap.ContainerAdapter</code>.
 *
 * @name sap.ushell_abap.adapters.abap
 * @see sap.ushell_abap.adapters.abap.ContainerAdapter
 * @since 1.11.0
 * @private
 */
(function () {
    "use strict";
    /*global document, jQuery, location, sap, window, URI, OData*/
    /*jslint nomen:true*/
    jQuery.sap.declare("sap.ushell_abap.adapters.abap.ContainerAdapter");

    jQuery.sap.require("sap.ushell.System");
    jQuery.sap.require("sap.ushell.User");

    /**
     * This method MUST be called by the Unified Shell's container only, others MUST call
     * <code>sap.ushell.services.initializeContainer("abap")</code>.
     * Constructs a new instance of the container adapter for the ABAP platform.
     *
     * @param {sap.ushell.System} oSystem
     *     the logon system (alias, platform, base URL)
     *
     * @class The Unified Shell's container adapter which does the bootstrap for the ABAP platform.
     *
     * @constructor
     * @see sap.ushell.services.initializeContainer
     * @since 1.11.0
     * @private
     */
    sap.ushell_abap.adapters.abap.ContainerAdapter = function (oSystem, sParameter, oProperties) {
        var oUser,
            that = this,
            S_LOGOFF_URL = "/sap/public/bc/icf/logoff";

        /**
         * Performs a logout to a remote system by adding a hidden IFRAME with an image pointing
         * to the logout URL. Resolves the Deferred when the image has been loaded (e.g. the logout
         * URL has been requested and the cookies processed).
         *
         * @param {object} oDeferred
         *   the deferred object of the logout
         * @param {string} sUrl
         *   the logout URL
         */
        sap.ui2.srvc.testPublishAt(that);
        function logoutViaHiddenIFrame(oDeferred, sUrl) {
            var oFrame = document.createElement("iframe"),
                sSafeUrl = sUrl.replace(/"/g, '\\"'); //TODO jQuery.sap.encodeJS

            window.addEventListener("message", function (oEvent) {
                if (oEvent.data === sUrl) {
                    oDeferred.resolve();
                }
            });

            oFrame.style.visibility = "hidden";
            document.body.appendChild(oFrame);
            // <html>
            // <body>
            // <script>
            //     function loaded() {
            //         parent.postMessage("http://remote.host/path/to/logout", "*");
            //     }
            //
            //     var element = document.createElement("img");
            //     element.src = "http://remote.host/path/to/logout";
            //     element.addEventListener("load", loaded);
            //     element.addEventListener("error", loaded);
            //     document.body.appendChild(element);
            // </script>
            // </body>
            // </html>
            oFrame.contentWindow.document.write('<html><body>\n'
                + '<script>function l(){parent.postMessage("' + sSafeUrl
                + '", "*");}\nvar e=document.createElement("img");e.src ="' + sSafeUrl
                + '";e.addEventListener("load",l);e.addEventListener("error",l);'
                + 'document.body.appendChild(e);<\/script><\/body><\/html>');
        }

        /**
         * Returns the logon system.
         *
         * @returns {sap.ushell.System}
         *     object providing information about the system where the container is logged in
         *
         * @since 1.11.0
         */
        this.getSystem = function () {
            return oSystem;
        };

        /**
         * Returns the logged-in user.
         *
         * @returns {sap.ushell.User}
         *      object providing information about the logged-in user
         *
         * @since 1.11.0
         */
        this.getUser = function () {
            return oUser;
        };

        sap.ui2.srvc.testPublishAt(that);
        function determineAccessibility(oStartupResult) {
            var vAccesibilityUrl = sap.ushell.utils.getParameterValueBoolean("sap-accessibility");
            if (vAccesibilityUrl !== undefined) {
                return vAccesibilityUrl;
            }
            vAccesibilityUrl = oStartupResult.accessibility;
            if (vAccesibilityUrl !== undefined) {
                return vAccesibilityUrl;
            }
            // as sap.ui.getCore().getConfiguration().getAccessibility(); //always true
            return false;
        }

        // propagate a) THEME editstate;
        //           b) ACCESSIBLITY and ACCESSIBLITY editstate to other properties of the
        // startup result (modified!)
        this._setThemeAccessibilityFlags = function (oStartupResult) {
            if (oStartupResult.userProfile && oStartupResult.userProfile.length) {
                var oUserProfileDataTheme,
                    oUserProfileDataAccessibility;
                oUserProfileDataTheme = oStartupResult.userProfile.filter(function (profileProperty) {
                    return profileProperty.id && profileProperty.id === 'THEME';
                })[0];
                // Theme
                if (oUserProfileDataTheme && oUserProfileDataTheme.value) {
                    oStartupResult.setThemePermitted = (oUserProfileDataTheme.editState === 3);
                    // it is not a good idea to disable theme editing when a url parameter is present
                    // if one has applied a messed up theme which corrupts the dialoge to set the theme,
                    // there is no non-expert easy way to get rid of the setting
                    //&& !(jQuery.sap.getUriParameters().get("sap-theme"));
                } else {
                    oStartupResult.oUserProfileDataTheme = false;
                }
                // AccessibilityPermitted: Note: we only register whether editing the Accessibility is allowed on the
                // ABAP Platform, we don't test whether accessibility is available!
                oUserProfileDataAccessibility = oStartupResult.userProfile.filter(function (profileProperty) {
                    return profileProperty.id && profileProperty.id === 'ACCESSIBILITY';
                })[0];
                if (oUserProfileDataAccessibility && oUserProfileDataAccessibility.id) {
                    oStartupResult.setAccessibilityPermitted = (oUserProfileDataAccessibility.editState === 3);
                } else {
                    oStartupResult.setAccessibilityPermitted = false;
                }
                if (oUserProfileDataAccessibility && oUserProfileDataAccessibility.value === "true") {
                    oStartupResult.accessibility = true;
                }
                if (oUserProfileDataAccessibility && oUserProfileDataAccessibility.value === "false") {
                    oStartupResult.accessibility = false;
                }
                // else present accessibility is retained!
                // set accessibility itself, respecting url parameters
                // note that currently sap.ui.getCore().getConfiguration().getAccessiblity() is always true per default
                oStartupResult.accessiblity = determineAccessibility(oStartupResult);
            }
        };

        /**
         * Propagates editState of profile properties
         * -> For further implementations please use this method instead of _setThemeAccessibilityFlags
         * -> should also fill the userProfile if some of the properties are missing e.g. 'value'
         * @param {object} oStartupResult
         *     Data which comes from Startup Service
         *
         * @private
         *
         * @since 1.30.0
         */
        this._setUserProfileFlags = function (oStartupResult) {

            if (oStartupResult.userProfile && oStartupResult.userProfile.length && jQuery.isArray(oStartupResult.userProfile)) {
                var oUserProfileIdHistory = {};
                //Initialize setContentDensityPermitted with a default value
                oStartupResult.setContentDensityPermitted = false;
                // ContentDensityPermitted: Note: we only register whether editing the ContentDensity is allowed on the
                // ABAP Platform, we don't test whether ContentDensity is available!
                oStartupResult.userProfile.forEach( function (oUserProfileParameter) {
                    //to avoid the treatment of duplicates -> so the first one will be used
                    if ((oUserProfileParameter.id in oUserProfileIdHistory)) {
                        return;
                    }
                    oUserProfileIdHistory[oUserProfileParameter.id] = oUserProfileParameter.id;
                    if (oUserProfileParameter.id === "CONTENT_DENSITY") {
                        oStartupResult.contentDensity = oUserProfileParameter.value;
                        oStartupResult.setContentDensityPermitted = (
                                oUserProfileParameter &&
                                oUserProfileParameter.editState === 3
                            ) || false;
                    }
                    if (oUserProfileParameter.id === "TRACKING_USAGE_ANALYTICS") {
                        if (typeof oUserProfileParameter.value === "string") {
                            //check if string is 'true' OR 'false' -> if 'yes' set the explicit boolean value
                            if (oUserProfileParameter.value.toLowerCase() === "true" || oUserProfileParameter.value.toLowerCase() === "false") {
                                oUserProfileParameter.value = (oUserProfileParameter.value.toLowerCase() === "true") || false;
                            } else {
                                oUserProfileParameter.value = undefined;
                            }
                        }

                        if (typeof oUserProfileParameter.value === "undefined" || typeof oUserProfileParameter.value === "boolean") {
                            oStartupResult.trackUsageAnalytics = oUserProfileParameter.value;
                        } else {
                            oStartupResult.trackUsageAnalytics = undefined;
                        }
                    }
                });
            }
        };

        /**
         * Does the bootstrap for the ABAP platform (and loads the container's configuration).
         *
         * @returns {jQuery.Promise}
         *     a promise that is resolved once the bootstrap is done
         *
         * @since 1.11.0
         */
        this.load = function () {
            var oDeferred = new jQuery.Deferred(),
                oStartupResult = oProperties.config;

            // recreate the system object as the oStartupResult contains more system
            // related information than oSystem
            oStartupResult.alias = oSystem.getAlias();
            oStartupResult.platform = oSystem.getPlatform();
            oSystem = new sap.ushell.System(oStartupResult);

            // Remove once oStartupResult is retrieved with 'setAccessibilityPermitted' & 'setThemePermitted' flags.
            this._setThemeAccessibilityFlags(oStartupResult);
            this._setUserProfileFlags(oStartupResult);
            oUser = new sap.ushell.User(oStartupResult);
            // set the SAP Language on the ODataWrapper,
            // if supplied, this will propagated to a sap-language header
            // assuring a consistent window language
            jQuery.sap.require("sap.ui2.srvc.ODataWrapper");
            sap.ui2.srvc.ODataWrapper["sap-language"] = oStartupResult.language;
            sap.ui2.srvc.ODataWrapper["sap-client"] = oStartupResult.client;

            if (oStartupResult.target) {
                // cache information about initial application resolution
                sap.ushell_abap.adapters.abap.ContainerAdapter.startUpApplication = {
                    adjustedInitialTarget: oStartupResult.adjustedInitialTarget, // "output"
                    target: oStartupResult.target // "input"
                };
            }

            // TODO: remove this from startup sequence
            this._setUserImage(oUser);

            return oDeferred.resolve().promise();
        };

        /**
         * Add further remote systems to be logged out
         *
         * @returns {jQuery.Promise}
         *      a <code>jQuery.Deferred</code> object's promise to be resolved
         *      after further remote systems are added in to local storage
         * @since 1.19.0
         */
        this.addFurtherRemoteSystems = function () {
            var oDeferredReadCatalogs = new jQuery.Deferred(),
                oPbs;

            oPbs = sap.ushell.Container.getService("PageBuilding").getFactory().
                getPageBuildingService();

            oPbs.readAllCatalogsForUser("type eq 'H' or type eq 'REMOTE'",
                function (oData) { //success handler
                    var aCatalogs = oData.results,
                        sSocialMediaUrl = "/sap/opu/odata/sap/SM_CATALOG_SRV/";
                    if (aCatalogs) {
                        aCatalogs.forEach(function (oCatalog) {
                            var bIsHANAUrl = /^\/sap\/hba\//.test(oCatalog.baseUrl);
                            if (oCatalog.type === 'H'
                                    || oCatalog.baseUrl === sSocialMediaUrl
                                    || bIsHANAUrl) {
                                sap.ushell.Container.addRemoteSystem(new sap.ushell.System({
                                    alias : oCatalog.systemAlias,
                                    platform: (bIsHANAUrl || oCatalog.type === 'H')
                                        ? "hana" : "abap",
                                    baseUrl: oCatalog.type === 'H' ? "" : ";o="
                                }));
                            }
                        });
                    }
                    oDeferredReadCatalogs.resolve();
                },
                function (sError) {//error handler
                    jQuery.sap.log.error("Reading REMOTE catalogs failed: "
                        + sError, null,
                        "sap.ushell_abap.adapters.abap.ContainerAdapter");
                    oDeferredReadCatalogs.reject();
                });
            return oDeferredReadCatalogs.promise();
        };

        /**
         * Returns the current URL. Mainly defined to ease testability.
         *
         * @returns {string}
         *    the URL displayed currently in the address bar
         *
         * @private
         */
        this.getCurrentUrl = function () {
            return window.location.href;
        };

        /**
         * Logs out the current user from this adapter's systems backend system.
         *
         * @param {boolean} bLogonSystem
         *      <code>true</code> if this system is the logon system
         * @returns {jQuery.Deferred}
         *      a <code>jQuery.Deferred</code> object's promise to be resolved when logout is
         *      finished, even when it failed
         * @since 1.11.0
         */
        this.logout = function (bLogonSystem) {
            var oDeferred = new jQuery.Deferred(),
                sUrl;

            if (bLogonSystem) {
                if (sap.ushell.utils.hasNativeLogoutCapability()) {
                    var sFullLogOffUrl = (new URI(S_LOGOFF_URL))
                        .absoluteTo(this.getCurrentUrl())
                        .search("")  // NOTE: remove query parameters
                        .toString();
                    window.external.getPrivateEpcm().doLogOff(sFullLogOffUrl);
                } else {
                    this.logoutRedirect();
                }
                jQuery.sap.log.info("ABAP system logged out: " + oSystem.getAlias(), null,
                    "sap.ushell_abap.adapters.abap.ContainerAdapter");
                oDeferred.resolve();
            } else {
                // construct fully qualified logoff URL (potentially adds scheme, authority, origin, sap-client)
                sUrl = oSystem.adjustUrl(S_LOGOFF_URL);

                // always logout via hidden iframe; this avoids implicit XHR re-logon in case the
                // logoff URL triggers a redirect (see BCP 0020079747 0000863255 2015)
                jQuery.sap.log.info("Logging out from system '" + oSystem.getAlias() + "' via hidden iframe");
                logoutViaHiddenIFrame(oDeferred, sUrl);
            }
            return oDeferred.promise();
        };

        /**
         * Does necessary url adjustments and triggers the technical
         * redirect to the logoff page
         *
         * @since 1.19.0
         */
        this.logoutRedirect = function () {
            var sUrl = oSystem.adjustUrl(S_LOGOFF_URL);
            this._setDocumentLocation(sUrl);
        };

        /**
         * Updates the document location forcing a redirect
         *
         * (Note: This functionality needs to be encapsulated
         * into an own helper function as it needs to be stubbed
         * in unit tests avoiding redirection to different locations)
         *
         * @param {string} sLocation
         * @private
         */
        this._setDocumentLocation = function (sLocation) {
            document.location = sLocation;
        };

        /**
         * Retrieves the user profile picture URL from Jam and sets it in the user object.
         *
         * TODO: this functionality should be moved out of the Container Adapter completely
         * and called lazily by the FLP shell, ideally by invoking a plug-in. Then the
         * configuration of the profile picture is also correctly accessed only in the shell
         * controller. But for now, we keep the logic here but evaluate the configruation
         * setting - to omit the odata call completely if profile picture is switched off and
         * to really ensure that it is not loaded (user image URL not set).
         *
         * Image is requested and set asynchronously, failures are only logged.
         *
         * @param {object} oUser
         * @private
         */
        this._setUserImage = function (oUser) {

            function isUserImageEnabled() {
                // just as quick workaround, we read the renderer configuration directly
                // will be removed later
                var oConfig = window["sap-ushell-config"],
                    vUserImageEnabled = jQuery.sap.getObject(
                        "renderers.fiori2.componentData.config.enableUserImage",
                        undefined,
                        oConfig)

                return !!vUserImageEnabled;
            }

            if (isUserImageEnabled() && oUser && oUser.isJamActive && oUser.isJamActive()) {
                OData.read('/sap/bc/ui2/smi/rest_tunnel/Jam/api/v1/OData/Self?$format=json',
                    function (oResponseData) {
                        var sJamUserId = oResponseData.results.Id,
                            sJamUserImageUrl = "/sap/bc/ui2/smi/rest_tunnel/Jam/api/v1/OData/Members('" + sJamUserId + "')/ProfilePhoto/$value";

                        oUser.setImage(sJamUserImageUrl);
                    },
                    function (message) {
                        jQuery.sap.log.error("Could not recieve JAM user data");
                    });
            }
        };

    };
}());
