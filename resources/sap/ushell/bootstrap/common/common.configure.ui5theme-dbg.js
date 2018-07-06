sap.ui.define([
    "jquery.sap.global",
    "sap/ushell/bootstrap/common/common.boot.path"
], function (jQuery, bootPath) {
    "use strict";

    return configureUi5Theme;

    /**
     * Configures UI5 theme based on the shell configuration.
     *
     * @param {object} oUshellConfig The ushell configuration.
     *
     * @private
     */
    function configureUi5Theme(oUshellConfig) {

        function getValidTheme(sPersonalizedTheme, sDefaultTheme, oRangeTheme) {
            if (oRangeTheme) {
                // Range of themes contains boot theme
                if (Object.keys(oRangeTheme).indexOf(sPersonalizedTheme) > -1) {
                    var oPersonalizedTheme = oRangeTheme[sPersonalizedTheme] || {};
                    return { theme: sPersonalizedTheme, root: oPersonalizedTheme.themeRoot };
                } else {
                    // return DefaultTheme
                    var oDefaultTheme = oRangeTheme[sDefaultTheme] || {};
                    return {
                        theme: sDefaultTheme,
                        root: oDefaultTheme.themeRoot
                    };
                }
            } else {
                // stay compatible
                var sAppliedTheme = sPersonalizedTheme || sDefaultTheme;
                return {
                    theme: sAppliedTheme, root: ""
                };
            }
        }

        var oContainerAdapterConfig = jQuery.sap.getObject('services.Container.adapter.config', NaN, oUshellConfig),
            sDefaultTheme = jQuery.sap.getObject('userProfile.defaults.theme', NaN, oContainerAdapterConfig),
            sPersonalizedTheme = jQuery.sap.getObject('userProfilePersonalization.theme', NaN, oContainerAdapterConfig),
            oRangesTheme = jQuery.sap.getObject('userProfile.metadata.ranges.theme', NaN, oContainerAdapterConfig);

        function setThemesInUserInfoAdapter(oUshellConfig) {
            var oThemeRange = jQuery.sap.getObject('services.Container.adapter.config.userProfile.metadata.ranges.theme', NaN, oUshellConfig);
            if (!oThemeRange) {
                return;
            }
            // creates path
            jQuery.sap.getObject('services.UserInfo.adapter.config.themes', 0, oUshellConfig);

            oUshellConfig.services.UserInfo.adapter.config.themes = Object.keys(oThemeRange).map(function (key) {
                return {
                    "id": key,
                    "name": oThemeRange[key].displayName,
                    "root": oThemeRange[key].themeRoot
                };
            });
        }
        setThemesInUserInfoAdapter(oUshellConfig);

        var oValidTheme = getValidTheme(sPersonalizedTheme, sDefaultTheme, oRangesTheme),
            oSAPUIConfig = window["sap-ui-config"] || {};
        // does personalized or standard theme exists
        if (oValidTheme.theme) {
            loadStartupServiceTheme(oValidTheme);
            oContainerAdapterConfig.userProfile.defaults.bootTheme = oValidTheme;
            if (oValidTheme.root) {
                sap.ui.getCore().applyTheme(oValidTheme.theme, oValidTheme.root + '/UI5/');
            } else {
                if(oSAPUIConfig["theme"] !== oValidTheme.theme) {
                    sap.ui.getCore().applyTheme(oValidTheme.theme);
                }
            }
            jQuery.sap.log.debug("theme set: theme = '" + oValidTheme.theme +
                "' theme root = '" + oValidTheme.root + "'", null,
                "common.configure.ui5theme"
            );
        } else {
            jQuery.sap.log.error("no theme set: personalizedTheme = '" + sPersonalizedTheme +
                "' default theme = '" + sDefaultTheme + "'", null,
                "common.configure.ui5theme"
            );
        }
    }

    function loadStartupServiceTheme(oStartupTheme) {
        var sLanguage = sap.ui.getCore().getConfiguration()
                .getLanguage(),
            bIsRTL = isRTLLocale(sLanguage),
            sThemeBaseUrl,
            sFileName,
            oLink;

        if (oStartupTheme && oStartupTheme.theme) {
            oLink = window.document.createElement('link');
            sFileName = bIsRTL ? "library-RTL.css" : "library.css";
            if (oStartupTheme.root) {
                sThemeBaseUrl = oStartupTheme.root + "/UI5/sap/fiori/themes/";
            } else {
                sThemeBaseUrl = bootPath + "/sap/fiori/themes/";
            }
            if (sThemeBaseUrl) {
                oLink.setAttribute('href', sThemeBaseUrl + oStartupTheme.theme + "/" + sFileName);
                oLink.setAttribute('rel', 'stylesheet');
                oLink.setAttribute('id', 'sap-ui-theme-sap.fiori');
                window.document.head.appendChild(oLink);
            }
        }
    }

    function isRTLLocale(sLocale) {
        //a list of RTL locales ('iw' is an old code for 'he')
        var aRTL_LOCALES = ['ar', 'fa', 'he', 'iw'];

        //remove the region part of the locale if it exists
        sLocale = sLocale.toLowerCase().substring(0, 2);
        return aRTL_LOCALES.indexOf(sLocale) >= 0;
    }

});
