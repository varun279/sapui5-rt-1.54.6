sap.ui.define(["sap/ui/comp/navpopover/RTAHandler", "sap/ovp/ui/ComponentContainerDesigntimeMetadata"],
    function (RTAHandler, ComponentContainerDesigntimeMetadata) {
        "use strict";
        var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ovp");
        return {
            //actions: {
            //    reveal: {
            //        changeType: "unhideControl"
            //    }
            //},
            aggregations: {
                content: {
                    ignore: true,
                    domRef: ".sapUiComponentContainer",
                    actions: {
                        move: "moveControls",
                        changeOnRelevantContainer: true
                    },
                    propagateMetadata: function (oElement) {
                        var sType = oElement.getMetadata().getName();
                        if (sType === "sap.ui.core.ComponentContainer") {
                            return ComponentContainerDesigntimeMetadata;
                        } else {
                            return {
                                actions: null
                            };
                        }
                    },
                    propagateRelevantContainer: false
                }
            },
            name: {
                singular: oResourceBundle && oResourceBundle.getText("Card"),
                plural: oResourceBundle && oResourceBundle.getText("Cards")
            }
        };
    }, false);
