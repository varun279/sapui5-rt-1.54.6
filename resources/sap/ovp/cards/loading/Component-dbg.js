sap.ui.define(["sap/ovp/cards/generic/Component", "sap/ovp/cards/loading/State"],

    function (CardComponent, LoadingState) {
        "use strict";

        var oLoadingComponent = CardComponent.extend("sap.ovp.cards.loading.Component", {
            // use inline declaration instead of component.json to save 1 round trip
            metadata: {
                properties: {
                    "footerFragment": {
                        "type": "string",
                        "defaultValue": "sap.ovp.cards.loading.LoadingFooter"
                    },
                    "state": {
                        "type": "string",
                        "defaultValue": LoadingState.LOADING
                    }
                },

                version: "1.54.4",

                library: "sap.ovp",
                customizing: {
                    "sap.ui.controllerExtensions": {
                        "sap.ovp.cards.generic.Card": {
                            controllerName: "sap.ovp.cards.loading.Loading"
                        }
                    }
                }

            }

        });

        return oLoadingComponent;
    });

