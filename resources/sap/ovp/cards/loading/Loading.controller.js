(function(){"use strict";jQuery.sap.require("sap.ovp.cards.LoadingUtils");sap.ui.controller("sap.ovp.cards.loading.Loading",{onInit:function(){},onAfterRendering:function(){var v=this.getView();v.addStyleClass("sapOvpLoadingCard");var s=this.getCardPropertiesModel().getProperty("/state");var t=this;if(sap.ovp.cards.LoadingUtils.bPageAndCardLoading){if(s!==sap.ovp.cards.loading.State.ERROR){var c=v.byId("sapOvpLoadingCanvas").getDomRef();var h="30rem";c.style.width='100%';c.style.height=h;var p=c.parentNode;p.style.width='100%';p.style.position='absolute';p.style.top='0px';var d=v.byId("ovpCardContentContainer").getDomRef();d.style.position='absolute';d.style.zIndex='-3';sap.ovp.cards.LoadingUtils.aCanvas.push(c);setTimeout(function(){},6000);setTimeout(function(){sap.ovp.cards.LoadingUtils.bAnimationStop=true;t.setErrorState();},9000);}setTimeout(function(){if(!sap.ovp.cards.LoadingUtils.bAnimationStarted){sap.ovp.cards.LoadingUtils.startAnimation();sap.ovp.cards.LoadingUtils.bAnimationStarted=true;}},0);}else{var l=v.byId("ovpLoadingFooter");if(s===sap.ovp.cards.loading.State.ERROR){l.setText(sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("cannotLoadCard"));}else{setTimeout(function(){l.setBusy(true);},6000);setTimeout(function(){l.setBusy(false);l.setText(sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("cannotLoadCard"));},9000);}}}});})();
