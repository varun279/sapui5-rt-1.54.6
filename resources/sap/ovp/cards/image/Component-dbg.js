sap.ui.define(["sap/ovp/cards/generic/Component"],

    function (CardComponent) {
        "use strict";

        return CardComponent.extend("sap.ovp.cards.image.Component", {
            // use inline declaration instead of component.json to save 1 round trip
            metadata: {
                properties: {
                    "contentFragment": {
                        "type": "string",
                        "defaultValue": "sap.ovp.cards.image.Image"
                    }
                },

                version: "1.54.4",

                library: "sap.ovp",

                includes: [],

                dependencies: {
                    libs: [],
                    components: []
                },
                config: {},
                customizing: {
                    "sap.ui.controllerExtensions": {
                        "sap.ovp.cards.generic.Card": {
                            controllerName: "sap.ovp.cards.image.Image"
                        }
                    }
                }
            }
        });
    }
);
