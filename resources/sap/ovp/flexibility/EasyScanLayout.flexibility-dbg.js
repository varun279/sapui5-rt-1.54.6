sap.ui.define([
    "sap/ui/fl/changeHandler/BaseRename",
    "sap/ovp/changeHandler/HideCardContainer",
    "sap/ovp/changeHandler/UnhideCardContainer",
    "sap/ovp/changeHandler/UnhideControl",
    "sap/ui/dt/OverlayRegistry",
    "sap/ui/dt/OverlayUtil"
], function (BaseRename, HideCardContainer, UnhideCardContainer, UnhideControl, OverlayRegistry, OverlayUtil) {
    "use strict";
    return {
        "moveControls": {
            "changeHandler": "default",
            "layers": {
                "CUSTOMER_BASE": false,
                "CUSTOMER": false,
                "USER": false
            }
        },
        "unhideControl": UnhideControl,
        "unhideCardContainer": UnhideCardContainer,
        "hideCardContainer": HideCardContainer,
        "cardSettings": {
            changeHandler: {
                applyChange : function(oChange, oPanel, mPropertyBag){
                    var oMainView = mPropertyBag.appComponent.getRootControl(),
                        oMainController = oMainView.getController(),
                        oCardProperties = oChange.getContent(),
                        oCard = oMainView.byId(oCardProperties.id);

                    if (oCard) {
                        var oComponent = oCard.getComponentInstance();
                        oComponent.destroy();
                    } else {
                        var oNewComponentContainer = new sap.ui.core.ComponentContainer(oMainView.getId() + "--" + oCardProperties.id),
                            oUIModel = oMainController.getUIModel(),
                            aCards = oUIModel.getProperty("/cards"),
                            oMainLayout = oMainController.getLayout();
                        oCardProperties.settings.baseUrl = oMainController._getBaseUrl();
                        oCardProperties.settings.cloneCard = true;
                        var iIndex = -1, i;
                        for (i = 0; i < aCards.length; i++) {
                            if (oCardProperties.id.lastIndexOf("customer." + aCards[i].id, 0) === 0) {
                                iIndex = i;
                                break;
                            }
                        }
                        aCards.splice(iIndex + 1, 0, oCardProperties);
                        oUIModel.setProperty("/cards", aCards);
                        oMainLayout.insertContent(oNewComponentContainer, iIndex + 1);
                        /**
                         *  Inside RTA Mode
                         *  Waiting for the component container to be created
                         *  Cloned card is selected and focused
                         *  Message Toast is shown when the card has been successfully cloned
                         */
                        setTimeout(function () {
                            var sId = document.activeElement.id,
                                oOverLay = OverlayRegistry.getOverlay(sId);
                            oOverLay = OverlayUtil.getNextSiblingOverlay(oOverLay);
                            oOverLay.setSelected(true);
                            oOverLay.focus();
                            sap.m.MessageToast.show(sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("OVP_KEYUSER_TOAST_MESSAGE_FOR_CLONE"),
                                {
                                    duration: 10000
                                });
                        }, 0);
                    }

                    oMainController.recreateRTAClonedCard(oCardProperties);

                    return true;
                },
                completeChangeContent : function(oChange, oSpecificChangeInfo, mPropertyBag) {
                    return;
                }
            },
            layers: {
                "CUSTOMER_BASE": false,
                "CUSTOMER": false,
                "USER": false
            }
        },
        /**
         * Personalization change handlers
         */
        "manageCardsForEasyScanLayout": {
            changeHandler: {
                applyChange : function(oChange, oPanel, mPropertyBag){
                    //store the incoming change to the main controller for user before rendering
                    var oMainController = mPropertyBag.appComponent.getRootControl().getController();
                    oMainController.storeIncomingDeltaChanges(oChange.getContent());
                    return true;
                },
                completeChangeContent : function(oChange, oSpecificChangeInfo, mPropertyBag) {
                    oChange.setContent(oSpecificChangeInfo.content);
                    return;
                }
            },
            layers: {
                "USER": true  // enables personalization which is by default disabled
            }
        },
        "viewSwitch": {
            changeHandler: {
                applyChange: function (oChange, oPanel, mPropertyBag) {
                    var oMainController = mPropertyBag.appComponent.getRootControl().getController();
                    oMainController.appendIncomingDeltaChange(oChange);
                    return true;
                },
                completeChangeContent: function (oChange, oSpecificChangeInfo, mPropertyBag) {
                    return;
                }
            },
            layers: {
                "USER": true  // enables personalization which is by default disabled
            }
        },
        "visibility": {
            changeHandler: {
                applyChange: function (oChange, oPanel, mPropertyBag) {
                    var oMainController = mPropertyBag.appComponent.getRootControl().getController();
                    oMainController.appendIncomingDeltaChange(oChange);
                    return true;
                },
                completeChangeContent: function (oChange, oSpecificChangeInfo, mPropertyBag) {
                    return;
                }
            },
            layers: {
                "USER": true  // enables personalization which is by default disabled
            }
        },
        "position": {
            changeHandler: {
                applyChange: function (oChange, oPanel, mPropertyBag) {
                    var oMainController = mPropertyBag.appComponent.getRootControl().getController();
                    oMainController.appendIncomingDeltaChange(oChange);
                    return true;
                },
                completeChangeContent: function (oChange, oSpecificChangeInfo, mPropertyBag) {
                    return;
                }
            },
            layers: {
                "USER": true  // enables personalization which is by default disabled
            }
        }
    };
}, /* bExport= */true);