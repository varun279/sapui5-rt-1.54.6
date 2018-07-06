jQuery.sap.registerPreloadedModules({
"name":"Component-preload",
"version":"2.0",
"modules":{
	"sap/ushell/components/shell/ShellElements/Component.js":function(){// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define([
        'sap/ushell/resources',
        'sap/ui/core/UIComponent',
        'sap/ushell/components/flp/ComponentKeysHandler',
        'sap/ushell/utils'],
    function (resources, UIComponent, ComponentKeysHandler, utils) {

        var oShellCtrl = sap.ushell.Container.getRenderer("fiori2").getShellController(),
            oShellView = oShellCtrl.getView();

        return UIComponent.extend("sap.ushell.components.shell.ShellElements.Component", {

            metadata: {
                version: "1.53.0-SNAPSHOT",
                library: "sap.ushell.components.shell.ShellElements",
                dependencies: {
                    libs: ["sap.m"]
                }
            },

            createContent: function () {
                "use strict";

                var oConfig = this.getComponentData().config;
                //We should have a default oConfig
                this.oDefConfig = {
                };
                this.oDefConfig = jQuery.extend(this.oDefConfig, oConfig);

                sap.ui.getCore().getEventBus().subscribe("shell", "notificationsCompLoaded", this._handleNotificationsCompLoaded, this);
                sap.ui.getCore().getEventBus().subscribe("shell", "userImageCompLoaded", this._handleUserImageCompLoaded, this);
                sap.ui.getCore().getEventBus().subscribe("shell", "meAreaCompLoaded", this._handleNMeAreaCompLoaded, this);

                this._startComponentLoadSequence();
            },

            _startComponentLoadSequence: function() {
                if (this._notificationsEnabled()) {
                    sap.ui.getCore().getEventBus().publish("shell", "loadNotificationsComponent");
                }
                else {
                    this._handleNotificationsCompLoaded(undefined, undefined, {delay: 0});
                }
            },

            _notificationsEnabled: function() {
                var sapUshellConfig = window["sap-ushell-config"],
                    bLoadNotificationsComponent = false;

                if (sapUshellConfig)
                {
                    if (sapUshellConfig.services &&
                        sapUshellConfig.services.Notifications &&
                        sapUshellConfig.services.Notifications.config &&
                        sapUshellConfig.services.Notifications.config.enabled &&
                        sapUshellConfig.services.Notifications.config.enabled === true) {
                        bLoadNotificationsComponent = true;
                    }
                }

                return bLoadNotificationsComponent;
            },

            _handleNotificationsCompLoaded: function(sChannelId, sEventId, oData) {

                function getCurrentStateName() {
                    return oShellView.getModel().getProperty('/currentState/stateName');
                }

                function isUserImageEnabled() {
                    var oViewData = oShellView.getViewData() || {},
                        oConfig = oViewData.config || {};

                    return oConfig.enableUserImage && getCurrentStateName() !== "headerless";
                }

                if (isUserImageEnabled()) {
                    if (!oData || oData.delay <= 0) {
                        sap.ui.getCore().getEventBus().publish("shell", "loadUserImageComponent");
                    }
                    else {
                        setTimeout(function () {
                            sap.ui.getCore().getEventBus().publish("shell", "loadUserImageComponent");
                        }, oData.delay);
                    }
                }
                else {
                    this._handleUserImageCompLoaded(undefined, undefined, {delay: 0});
                }
            },

            _handleUserImageCompLoaded: function(sChannelId, sEventId, oData) {
                var currentStateName = oShellView.getModel().getProperty('/currentState/stateName'),
                    bLoadMeAreaComponent = true;

                if (currentStateName === "headerless") {
                    bLoadMeAreaComponent = false;
                }

                if (bLoadMeAreaComponent) {
                    if (!oData || oData.delay <= 0) {
                        sap.ui.getCore().getEventBus().publish("shell", "loadMeAreaComponent");
                    }
                    else {
                        setTimeout(function () {
                            sap.ui.getCore().getEventBus().publish("shell", "loadMeAreaComponent");
                        }, oData.delay);
                    }
                }
                else {
                    this._handleNMeAreaCompLoaded(undefined, undefined, {delay: 0});
                }
            },

            _handleNMeAreaCompLoaded: function(sChannelId, sEventId, oData) {
                //no next component yet
            },

            exit : function () {
                "use strict";

                sap.ui.getCore().getEventBus().unsubscribe("shell", "notificationsCompLoaded", this._handleNotificationsCompLoaded, this);
                sap.ui.getCore().getEventBus().unsubscribe("shell", "userImageCompLoaded", this._handleUserImageCompLoaded, this);
                sap.ui.getCore().getEventBus().unsubscribe("shell", "meAreaCompLoaded", this._handleNMeAreaCompLoaded, this);
            }
        });

    });
}
}});
