(function () {
    "use strict";
    /*global sap, jQuery */
    jQuery.sap.require("sap.ovp.cards.LoadingUtils");

    sap.ui.controller("sap.ovp.cards.loading.Loading", {

        onInit: function () {

        },

        onAfterRendering: function() {
            /*
             *  If bPageAndCardLoading flag is set to true then it will
             *  run the page and card loading
             *  This will be removed in the next wave
             */
            var oView = this.getView();
            oView.addStyleClass("sapOvpLoadingCard");
            var sState = this.getCardPropertiesModel().getProperty("/state");
            var that = this;
            if (sap.ovp.cards.LoadingUtils.bPageAndCardLoading) {
                if (sState !== sap.ovp.cards.loading.State.ERROR) {
                    var oCanvas = oView.byId("sapOvpLoadingCanvas").getDomRef();
                    var sHeight = "30rem";
                    oCanvas.style.width = '100%';
                    oCanvas.style.height = sHeight;
                    var oParent = oCanvas.parentNode;
                    oParent.style.width = '100%';
                    oParent.style.position = 'absolute';
                    oParent.style.top = '0px';
                    var oDiv = oView.byId("ovpCardContentContainer").getDomRef();
                    oDiv.style.position = 'absolute';
                    oDiv.style.zIndex = '-3';

                    sap.ovp.cards.LoadingUtils.aCanvas.push(oCanvas);
                    setTimeout(function () {
                        /**
                         * Start of busy indicator earlier before loading cards were redesigned.
                         */
                    }, 6000);
                    setTimeout(function () {
                        sap.ovp.cards.LoadingUtils.bAnimationStop = true;
                        that.setErrorState();
                    }, 9000);
                }
                setTimeout(function () {
                    if (!sap.ovp.cards.LoadingUtils.bAnimationStarted) {
                        sap.ovp.cards.LoadingUtils.startAnimation();
                        sap.ovp.cards.LoadingUtils.bAnimationStarted = true;
                    }
                }, 0);
            } else {
                var loadingFooter = oView.byId("ovpLoadingFooter");
                if (sState === sap.ovp.cards.loading.State.ERROR) {
                    loadingFooter.setText(sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("cannotLoadCard"));
                } else {
                    //sState === sap.ovp.cards.loading.State.LOADING
                    setTimeout(function () {
                        loadingFooter.setBusy(true);
                    }, 6000);

                    setTimeout(function () {
                        loadingFooter.setBusy(false);
                        loadingFooter.setText(sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("cannotLoadCard"));
                    }, 9000);
                }
            }
        }
    });
})();
