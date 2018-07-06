jQuery.sap.registerPreloadedModules({
"name":"Component-preload",
"version":"2.0",
"modules":{
	"sap/ushell/components/shell/UserImage/Component.js":function(){// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define([
        'sap/ushell/resources',
        'sap/ui/core/UIComponent',
        'sap/ushell/components/flp/ComponentKeysHandler',
        'sap/ushell/utils',
        'sap/m/Dialog',
        'sap/m/Button',
        'sap/m/Text'],
function (resources, UIComponent, ComponentKeysHandler, utils, Dialog, Button, Text) {

    var oShellCtrl = sap.ushell.Container.getRenderer("fiori2").getShellController(),
        oShellView = oShellCtrl.getView(),
        oShellConfig = (oShellView.getViewData() ? oShellView.getViewData().config : {}) || {},
        oDefConfig = {},
        bIsViewCreated = false;
    var sPREFIX = "sap.ushell.components.shell.userImage.";


    /**
     *
     *
     */
    return UIComponent.extend("sap.ushell.components.shell.UserImage.Component", {

        metadata: {
            version: "1.53.0-SNAPSHOT",
            library: "sap.ushell.components.shell.UserImage",
            dependencies: {
                libs: ["sap.m"]
            },
        },

        createContent: function () {
            var oShellCtrl = sap.ushell.Container.getRenderer("fiori2").getShellController(),
                oShellView = oShellCtrl.getView(),
                oShellConfig = (oShellView.getViewData() ? oShellView.getViewData().config : {}) || {};
            "use strict";
            this.loadUserImage();
            var that = this;
            var oUser = sap.ushell.Container.getUser();
            if(oShellConfig.enableUserImgConsent == true && oUser.getImageConsent() == undefined)
            {
                this._showUserConsentPopup();
            }

            sap.ui.getCore().getEventBus().publish("shell", "userImageCompLoaded", {delay: 0});
        },

        _showUserConsentPopup : function (){
            var that = this;
            var sTextAlign = sap.ui.getCore().getConfiguration().getRTL() ? 'Right' : 'Left';
            var sEnableLabelWidth = sap.ui.Device.system.phone ? "auto" : "14rem";
            var sStatusLabelWidth = sap.ui.Device.system.phone ? "auto" : "10rem";

            var yesButton = new sap.m.Button('yesButton', {
                text: sap.ushell.resources.i18n.getText("DisplayImg"),
                type: "Emphasized",
                press: function () {
                    that.updateUserImage(true);
                    dialog.close();
                }
            });

            var noButton = new sap.m.Button('noButton', {
                text: sap.ushell.resources.i18n.getText("DontDisplayImg"),
                press: function () {
                    that.updateUserImage(false);
                    dialog.close();
                }
            });

            var consentText = new sap.m.Text({
                text: sap.ushell.resources.i18n.getText("userImageConsentText"),
                textAlign: sTextAlign
            }).addStyleClass('sapUshellUserConsentDialogText');
            var useOfTermsLink = new sap.m.Link({
                text: sap.ushell.resources.i18n.getText("userImageConsentDialogShowTermsOfUse"),
                textAlign: sTextAlign,
                press : function (){
                    var isTermsOfUseVisilble = fboxUserConsentItem3.getVisible();
                    if(isTermsOfUseVisilble){
                        fboxUserConsentItem3.setVisible(false);
                        useOfTermsLink.setText(sap.ushell.resources.i18n.getText("userImageConsentDialogShowTermsOfUse"));
                    }else{
                        useOfTermsLink.setText(sap.ushell.resources.i18n.getText("userImageConsentDialogHideTermsOfUse"));
                        fboxUserConsentItem3.setVisible(true);
                    }

                }.bind(this)
            }).addAriaLabelledBy(consentText);
            var useOfTermsText = new sap.m.Text({
                text: sap.ushell.resources.i18n.getText("userImageConsentDialogTermsOfUse"),
            }).addStyleClass('sapUshellUserConsentDialogTerms');

            var fboxUserConsentItem1 = new sap.m.FlexBox({
                alignItems: 'Center',
                direction: 'Row',
                items: [
                    consentText,
                ]
            }).addStyleClass('sapUshellUserConsentDialogBox');

            var fboxUserConsentItem2 = new sap.m.FlexBox({
                alignItems: 'Center',
                direction: 'Row',
                items: [
                    useOfTermsLink
                ]
            }).addStyleClass('sapUshellUserConsentDialogBox').addStyleClass('sapUshellUserConsentDialogLink');

            var fboxUserConsentItem3 = new sap.m.FlexBox({
                alignItems: 'Center',
                direction: 'Row',
                items: [
                    useOfTermsText
                ]
            }).addStyleClass('ushellUserImgConsentTermsOfUseFlexBox');
            fboxUserConsentItem3.setVisible(false);

            var layout = new sap.ui.layout.VerticalLayout('userConsentDialogLayout', {
                content: [fboxUserConsentItem1,fboxUserConsentItem2,fboxUserConsentItem3]
            });

            var dialog = new sap.m.Dialog("userConsentDialog",{
                title: sap.ushell.resources.i18n.getText("userImageConsentDialogTitle"),
                modal: true,
                stretch: sap.ui.Device.system.phone,
                buttons: [yesButton, noButton],
                afterClose: function() {
                    dialog.destroy();
                }
            }).addStyleClass('sapUshellUserConsentDialog');
            dialog.addContent(layout);
            dialog.open();
        },

        loadUserImage: function() {

                var oUser = sap.ushell.Container.getUser(),
                    imageURI = oUser.getImage();

                if (imageURI) {
                    this._setUserImage(imageURI);
                }
                oUser.attachOnSetImage(this._setUserImage.bind(this));

        },

        /*
        * Changing the property of userImage in the model, which is binded to actionsBtn and meAreaHeaderButton
        * */
        _setUserImage: function(param) {
            var sUrl = (typeof param) === 'string' ? param : param.mParameters,
                isEmptyUrl = true;

            if((typeof sUrl) === 'string'){
                if(sUrl){
                    isEmptyUrl = false;
                }
            }
            else{
                if(!jQuery.isEmptyObject(sUrl)){
                    isEmptyUrl = false;
                }
            }

            var personPlaceHolder = sap.ui.core.IconPool.getIconURI("person-placeholder"),
                account = sap.ui.core.IconPool.getIconURI("account");

            oHeaders = {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            };

            if(!isEmptyUrl) {
                //Using jQuery.ajax instead of jQuery.get in-order to be able to control the caching.
                jQuery.ajax({
                    url: sUrl,
                    //"cache: false" didn't work as expected hence, turning off the cache vie explicit headers.
                    headers: oHeaders,
                    success: function () {
                        //if there's a url for the image, set the model's property - userImage to its url
                        oShellView.getModel().setProperty("/userImage/personPlaceHolder", sUrl);
                        oShellView.getModel().setProperty("/userImage/account", sUrl);
                    },
                    error: function () {
                        jQuery.sap.log.error("Could not load user image from: " + sUrl, "", "sap.ushell.renderers.fiori2.Shell.view");
                        var oUser = sap.ushell.Container.getUser();
                        oUser.setImage("");
                    }
                });
            }
            else {
                oShellView.getModel().setProperty("/userImage/personPlaceHolder", personPlaceHolder);
                oShellView.getModel().setProperty("/userImage/account", account);
            }


        },

        updateUserImage: function (isImageConsent){

            var oUser = sap.ushell.Container.getUser();
            this.userInfoService = sap.ushell.Container.getService("UserInfo");
            var deferred = jQuery.Deferred();
            var oUserPreferencesPromise;

            if(isImageConsent != undefined){
                oUser.setImageConsent(isImageConsent);
                oUserPreferencesPromise = this.userInfoService.updateUserPreferences(oUser);
                oUserPreferencesPromise.done(function () {
                    oUser.resetChangedProperties();
                    //the adapter already called setImage on the user, which in turn called _setUserImage
                    //(we attached _setUserImage to an event that's fired from setImage)
                    deferred.resolve();
                }.bind(this));
            }
            else {
                    deferred.reject(isImageConsent + "is undefined");
                }
        },
        /**
         *
         *
         */
        exit : function () {
            "use strict";
        }
    });

});
}
}});
