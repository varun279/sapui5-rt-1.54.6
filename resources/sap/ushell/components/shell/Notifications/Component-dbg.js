// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define([
        'sap/ushell/resources',
        'sap/ui/core/UIComponent',
        'sap/ushell/components/flp/ComponentKeysHandler',
        'sap/ushell/utils'],
    function (resources, UIComponent, ComponentKeysHandler, utils) {

        var oShellCtrl = sap.ushell.Container.getRenderer("fiori2").getShellController(),
            oShellView = oShellCtrl.getView(),
            oShellConfig = (oShellView.getViewData() ? oShellView.getViewData().config : {}) || {},
            oDefConfig = {},
            bIsViewCreated = false;

        /**
         *
         *
         */
        function fnHandleToggleNotificationsView(oEvent, oSource) {

            if (oEvent){
                oSource = oEvent.getSource();
            }

            var oNotificationView,
                oNotificationsService = sap.ushell.Container.getService("Notifications"),
                oNotificationsPreviewContainer = sap.ui.getCore().byId("notifications-preview-container"),
                sAnimationMode = oShellView.getModel().getProperty('/animationMode') || 'full';

            //add notification view
            if (oDefConfig.view && bIsViewCreated == false) {
                oNotificationView = sap.ui.view("notificationsView", {
                    viewName: "sap.ushell.renderers.fiori2.notifications.Notifications",
                    type: 'JS',
                    viewData: {}
                });

                bIsViewCreated = true;

                if (oDefConfig.view.position === "right") {
                    sap.ushell.Container.getRenderer("fiori2").addRightViewPort(oNotificationView);
                } else {
                    sap.ushell.Container.getRenderer("fiori2").addLeftViewPort(oNotificationView);
                }
            }

            oShellCtrl.bMeAreaSelected = false;
            // disable meArea toggle if active
            var oMeAreaButton = sap.ui.getCore().byId("meAreaHeaderButton");
            if (oMeAreaButton) {
                oMeAreaButton.setSelected(false);
                jQuery(oMeAreaButton.getDomRef()).attr("aria-pressed", "false");
            }

            // If button is already selected (pressed)
            oShellCtrl.bNotificationsSelected = oSource.getSelected();
            if (oShellCtrl.bNotificationsSelected) {
                oShellCtrl._switchViewPortStateByControl(oSource, "Center");
            } else {
                oShellView.getModel().setProperty("/notificationsCount", 0);
                //TODO : REMOVE THE CALL FOR THIS CONTROL FROM THE SHELL!!!! (oNotificationsPreviewContainer)
                if (oNotificationsPreviewContainer) {
                    oNotificationsPreviewContainer.setFloatingContainerItemsVisiblity(false);
                    this._switchToNotificationViewWithPreview(oNotificationsPreviewContainer, sAnimationMode, oSource);
                } else {
                    this._switchToNotificationView(oSource);
                }
            }

            oShellCtrl.bNotificationsSelected = !oShellCtrl.bNotificationsSelected;
            oSource.setSelected(oShellCtrl.bNotificationsSelected);

            oNotificationsService.notificationsSeen();
            oShellView.getModel().setProperty("/notificationsCount", 0);
            jQuery(oSource.getDomRef()).attr("aria-pressed", oShellCtrl.bNotificationsSelected);
            jQuery(oSource.getDomRef()).attr("aria-label", sap.ushell.resources.i18n.getText("NotificationToggleButtonCollapsedNoNotifications"));
        };

        /**
         *
         *
         */
        return UIComponent.extend("sap.ushell.components.shell.Notifications.Component", {

            metadata: {
                version: "1.53.0-SNAPSHOT",
                library: "sap.ushell.components.shell.Notifications",
                dependencies: {
                    libs: ["sap.m"]
                }
            },

            /**
             *
             *
             */
            createContent: function () {
                "use strict";

                sap.ui.getCore().getEventBus().subscribe("sap.ushell.services.Notifications", "onNewNotifications", this._handleAlerts, this);

                var oConfig = this.getComponentData().config;
                //We should have a default oConfig
                oDefConfig = {
                    view: {
                        position: "right"
                    },
                    enableHeaderButton: true,
                    enablePreview: true
                };
                var oNotificationToggle,
                    origNotificationsToggleAfterRender;

                if (sap.ushell.Container.getService("Notifications").isEnabled() === true) {
                    oShellCtrl.getModel().setProperty("/enableNotifications", true);
                    sap.ushell.Container.getService("Notifications").init();
                    if (oShellConfig.enableNotificationsUI === true) {
                        oShellCtrl.getModel().setProperty("/enableNotificationsUI", true);
                        sap.ushell.Container.getService("Notifications").registerDependencyNotificationsUpdateCallback(this.notificationsCountUpdateCallback.bind(this), true);
                    }
                }

                //merge the configurtions.
                oDefConfig = jQuery.extend(oDefConfig, oConfig);

                oNotificationToggle = sap.ui.getCore().byId("NotificationsCountButton");
                oNotificationToggle.applySettings({
                        icon: sap.ui.core.IconPool.getIconURI("ui-notifications"),
                        floatingNumber: {
                            parts: ["/notificationsCount"],
                            formatter: function (notificationsCount) {
                                //set aria label
                                var jsButton = this.getDomRef(),
                                    ariaLabelValue = "";

                                if (jsButton) {
                                    if (notificationsCount > 0) {
                                        ariaLabelValue = sap.ushell.resources.i18n.getText("NotificationToggleButtonCollapsed", notificationsCount);
                                    } else {
                                        ariaLabelValue = sap.ushell.resources.i18n.getText("NotificationToggleButtonCollapsedNoNotifications");
                                    }
                                    jsButton.setAttribute("aria-label", ariaLabelValue);
                                }
                                return notificationsCount;
                            }
                        },
                        visible: "{/enableNotifications}",
                        enabled: "{/enableNotifications}",
                        selected: {
                            path: "/currentViewPortState",
                            formatter: function (viewPortState) {
                                if (viewPortState === 'RightCenter') {
                                    return true;
                                }
                                return false;
                            }
                        },
                        press: [fnHandleToggleNotificationsView, this],
                        showSeparator: false,
                        tooltip: sap.ushell.resources.i18n.getText("NotificationToggleButtonExpanded")
                    }).removeStyleClass("sapUshellPlaceHolders");

                origNotificationsToggleAfterRender = oNotificationToggle.onAfterRendering;
                oNotificationToggle.onAfterRendering = function () {
                    if (origNotificationsToggleAfterRender) {
                        origNotificationsToggleAfterRender.apply(this, arguments);
                    }
                    jQuery(this.getDomRef()).attr("aria-pressed", oShellCtrl.bNotificationsSelected);
                    if (this.getDisplayFloatingNumber() > 0) {
                        jQuery(this.getDomRef()).attr("aria-label", sap.ushell.resources.i18n.getText("NotificationToggleButtonCollapsed", this.getDisplayFloatingNumber()));
                    } else {
                        jQuery(this.getDomRef()).attr("aria-label", sap.ushell.resources.i18n.getText("NotificationToggleButtonCollapsedNoNotifications"));
                    }
                };

                oNotificationToggle.addEventDelegate({
                    onsapskipforward: function (oEvent) {
                        sap.ushell.renderers.fiori2.AccessKeysHandler.bForwardNavigation = true;
                        oEvent.preventDefault();
                        jQuery("#sapUshellHeaderAccessibilityHelper").focus();
                    },
                    onsaptabnext: function (oEvent) {
                        sap.ushell.renderers.fiori2.AccessKeysHandler.bForwardNavigation = true;
                        oEvent.preventDefault();
                        jQuery("#sapUshellHeaderAccessibilityHelper").focus();
                    },
                    onsapskipback: function (oEvent) {
                        if (sap.ushell.renderers.fiori2.AccessKeysHandler.getAppKeysHandler()) {
                            oEvent.preventDefault();
                            sap.ushell.renderers.fiori2.AccessKeysHandler.bFocusOnShell = false;
                        }
                    }
                });
                oShellView.aDanglingControls.push(oNotificationToggle);

                if (oShellCtrl.getModel().getProperty("/enableNotificationsUI") === true) {
                    // Add the notifications counter to the shell header
                    //Last arg - bDoNotPropagate is truethy otherwise changes will redundantly applay to other states as well (e.g. - 'embedded-home').
                    sap.ushell.components.applicationIntegration.AppLifeCycle.addHeaderEndItem(["NotificationsCountButton"], false, ["home", "app", "minimal"], true);
                }

                sap.ui.getCore().getEventBus().publish("shell", "notificationsCompLoaded", {delay: 3000});
            },

            /**
             *
             *
             */
            _handleAlerts: function (sChannelId, sEventId, aNewNotifications) {
                var iNotificationsIndex;

                //do not display notifications on Dashboard center view port (home and center) and on RightCenter Notification screen/ This is a hack untill the shell model will handle the viewport.
                if (oShellCtrl.oViewPortContainer.getCurrentState() !== 'RightCenter') {
                    for (iNotificationsIndex = 0; iNotificationsIndex < aNewNotifications.length; iNotificationsIndex++) {
                        this.handleNotification(aNewNotifications[iNotificationsIndex]);
                    }
                }
            },

            /**
             *
             *
             */
            handleNotification: function (oNotification) {
                //create an element of RightFloatingContainer
                var oAlertEntry = sap.ushell.Container.getRenderer("fiori2").addRightFloatingContainerItem(
                    {
                        press: function (oEvent) {
                            var viewPortContainer = sap.ui.getCore().byId('viewPortContainer');

                            if (hasher.getHash() === oNotification.NavigationTargetObject + "-" + oNotification.NavigationTargetAction) {
                                viewPortContainer.switchState("Center");
                            } else {
                                utils.toExternalWithParameters(
                                    oNotification.NavigationTargetObject,
                                    oNotification.NavigationTargetAction,
                                    oNotification.NavigationTargetParams
                                );
                            }
                            sap.ushell.Container.getService("Notifications").markRead(oNotification.Id);
                        },
                        datetime: sap.ushell.resources.i18n.getText("notification_arrival_time_now"),
                        title: oNotification.SensitiveText ? oNotification.SensitiveText : oNotification.Text,
                        description: oNotification.SubTitle,
                        unread: oNotification.IsRead,
                        priority: "High",
                        hideShowMoreButton: true
                    },
                    true,
                    true
                );

                setTimeout(function () {
                    sap.ushell.Container.getRenderer("fiori2").removeRightFloatingContainerItem(oAlertEntry.getId(), true);
                }, 3500);
            },

            /**
             * Notifications count (badge) callback function for notifications update.
             * Called by Notifications service after fetching new notifications data.
             * The update of the badge number depends on the given oDependencyPromise only in case of RightCenter viewport,
             * because in this case we would like to synchronize between badge update and the notifications list
             *
             * @param oDependencyPromise deferred.promise object that can be used for waiting
             *  until some other relevant functionality finishes execution.
             */
            notificationsCountUpdateCallback: function (oDependencyPromise) {
                var that = this,
                    sViewPort = oShellCtrl.oViewPortContainer.getCurrentState(),
                    bIsRightCenterViewPort = sViewPort === "RightCenter" ? true : false;

                if ((oDependencyPromise === undefined) || (!bIsRightCenterViewPort)) {
                    this._updateBadge();
                } else {
                    // Update the badge only after the deferred object of oDependencyPromise is resolved.
                    // this way we sync between the (late) update of the list and the update of the badge
                    oDependencyPromise.done(function () {
                        that._updateBadge();
                    });
                }
            },

            _updateBadge : function () {
                var notificationsCounterValue;

                sap.ushell.Container.getService("Notifications").getUnseenNotificationsCount().done(function (iNumberOfNotifications) {
                    notificationsCounterValue = parseInt(iNumberOfNotifications, 10);
                    oShellView.getModel().setProperty('/notificationsCount', notificationsCounterValue);
                }).fail(function (data) {
                    jQuery.sap.log.error("Shell.controller - call to notificationsService.getCount failed: ", data, "sap.ushell.renderers.lean.Shell");
                });
            },

            /**
             *
             *
             */
            _switchToNotificationView: function (oSource) {
                oShellCtrl.oViewPortContainer.navTo('rightViewPort', "notificationsView", 'show');
                oShellCtrl._switchViewPortStateByControl(oSource, "RightCenter");
                sap.ui.getCore().getEventBus().publish("launchpad", "notificationViewOpened");
            },

            /**
             *
             *
             */
            _switchToNotificationViewWithPreview: function (oNotificationsPreviewContainer, sAnimationMode, oSource) {
                if (sAnimationMode === 'minimal') {
                    this._switchToNotificationView(oSource);
                } else {
                    var itemsCount = oNotificationsPreviewContainer.getFloatingContainerItems().length;

                    setTimeout(function () {
                        this._switchToNotificationView(oSource);
                    }.bind(this), 300 + (itemsCount * 100));
                }
            },

            /**
             *
             *
             */
            exit : function () {
                "use strict";
                sap.ui.getCore().getEventBus().unsubscribe("sap.ushell.services.Notifications", "onNewNotifications", this._handleAlerts, this);

                if (sap.ushell.Container) {
                    if (sap.ushell.Container.getService("Notifications").isEnabled() === true) {
                        sap.ushell.Container.getService("Notifications").destroy();
                    }
                }
            }
        });

    });
