(function () {
    "use strict";
    /*global sap, jQuery */
    jQuery.sap.require("sap.ovp.cards.ActionUtils");
    jQuery.sap.require("sap.ui.generic.app.navigation.service.NavigationHandler");
    jQuery.sap.require("sap.ui.generic.app.navigation.service.PresentationVariant");
    jQuery.sap.require("sap.ovp.cards.CommonUtils");
    jQuery.sap.require("sap.ovp.cards.OVPCardAsAPIUtils");

    var ActionUtils = sap.ovp.cards.ActionUtils;

    sap.ui.controller("sap.ovp.cards.generic.Card", {

        onInit: function () {

            this.oCardComponent = this.getOwnerComponent();
            this.oCardComponentData = this.oCardComponent && this.oCardComponent.getComponentData();
            this.oMainComponent = this.oCardComponentData && this.oCardComponentData.mainComponent;
            this.sCardId = this.oCardComponentData.cardId;
            /**
             *If the state is 'Loading' or 'Error', we do not render the header. Hence, this is no oHeader.
             */
            var sState = this.getView().mPreprocessors.xml[0].ovpCardProperties.oData.state;
            if (sState !== "Loading" && sState !== "Error") {
                var oHeader = this.getView().byId("ovpCardHeader");
                if (!!oHeader) {
                    oHeader.attachBrowserEvent("click", this.onHeaderClick.bind(this));
                    oHeader.addEventDelegate({
                        onkeydown: function (oEvent) {
                            if (!oEvent.shiftKey && (oEvent.keyCode == 13 || oEvent.keyCode == 32)) {
                                oEvent.preventDefault();
                                this.onHeaderClick();
                            }
                        }.bind(this)
                    });
                }
            }
            var oNumericControl = this.getView().byId("kpiNumberValue");
            if (oNumericControl) {
                oNumericControl.addEventDelegate({
                    onAfterRendering: function () {
                        var $numericControl = oNumericControl.$();
                        var $number = $numericControl.find(".sapMNCValueScr");
                        var $scale = $numericControl.find(".sapMNCScale");
                        $number.attr("aria-label", $number.text());
                        $scale.attr("aria-label", $scale.text());
                        /*
                         For restricting target and deviation in KPI Header to move towards the right
                         */
                        var $header = this.getView().byId("ovpCardHeader").getDomRef();
                        var oCompData = this.getOwnerComponent().getComponentData();
                        if (!!oCompData && !!oCompData.appComponent) {
                            var oAppComponent = oCompData.appComponent;
                            if (!!oAppComponent.getModel("ui")) {
                                var oUiModel = oAppComponent.getModel("ui");
                                if (!!oUiModel.getProperty("/containerLayout") && oUiModel.getProperty("/containerLayout") === "resizable") {
                                    var oDashboardLayoutUtil = oCompData.appComponent.getDashboardLayoutUtil();
                                    if (!!oDashboardLayoutUtil) {
                                        oDashboardLayoutUtil.setKpiNumericContentWidth($header);
                                    }
                                }
                            }
                        }
                    }.bind(this)
                });
            }
            var oOvpTableCard = this.getView().byId("ovpTable");
            if (oOvpTableCard) {
                oOvpTableCard.addEventDelegate({
                    onAfterRendering: function () {
                        var oOvpTableCardControl = this.getView().byId("ovpTable");
                        var $tableControl = oOvpTableCardControl.$();
                        var $smartLinks = $tableControl.find(".ovpTableSmartLink");
                        if ($smartLinks.length > 0) {
                            $smartLinks.removeAttr("aria-labelledby");
                        }
                    }.bind(this)
                });
            }
        },

        exit: function () {
            //de-register event handler
            if (this.resizeHandlerId) {
                sap.ui.core.ResizeHandler.deregister(this.resizeHandlerId);
            }
        },

        onAfterRendering: function () {
            var oCardPropertiesModel = this.getCardPropertiesModel();
            //Flag added to enable click on header/line item
            this.enableClick  = true;
            var sContentFragment = oCardPropertiesModel.getProperty("/contentFragment");
            var oCompData = this.getOwnerComponent().getComponentData();
            this._handleCountHeader();
            this._handleKPIHeader();
            var sSelectedKey = oCardPropertiesModel.getProperty("/selectedKey");
            if (sSelectedKey && oCardPropertiesModel.getProperty("/state") !== 'Loading') {
                var oDropDown = this.getView().byId("ovp_card_dropdown");
                if (oDropDown) {
                    oDropDown.setSelectedKey(sSelectedKey);
                }
            }

            //if this card is owned by a Resizable card layout, check if autoSpan is required and register event handler
            try {
                var oCompData = this.getOwnerComponent().getComponentData();
                if (oCompData && oCompData.appComponent) {
                    var oAppComponent = oCompData.appComponent;
                    if (oAppComponent.getModel('ui')) {
                        var oUiModel = oAppComponent.getModel('ui');
                        //Check Added for Resizable card layout
                        if (oUiModel.getProperty('/containerLayout') === 'resizable') {
                            var oDashboardLayoutUtil = oAppComponent.getDashboardLayoutUtil();
                            if (oDashboardLayoutUtil) {
                                this.oDashboardLayoutUtil = oDashboardLayoutUtil;
                                this.cardId = oCompData.cardId;
                                if (oDashboardLayoutUtil.isCardAutoSpan(oCompData.cardId)) {
                                    this.resizeHandlerId = sap.ui.core.ResizeHandler.register(this.getView(), function (oEvent) {
                                        jQuery.sap.log.info('DashboardLayout autoSize:' + oEvent.target.id + ' -> ' + oEvent.size.height);
                                        oDashboardLayoutUtil.setAutoCardSpanHeight(oEvent);
                                    });
                                }
                            }
                        }
                    }
                }
            } catch (err) {
                jQuery.sap.log.error("DashboardLayout autoSpan check failed.");
            }

            //Resizable card layout: autoSpan cards - size card wrapper to card height
            if (this.oDashboardLayoutUtil && this.oDashboardLayoutUtil.isCardAutoSpan(this.cardId)) {
                var $wrapper = jQuery("#" + this.oDashboardLayoutUtil.getCardDomId(this.cardId));
                if (this.oView.$().outerHeight() > $wrapper.innerHeight()) {
                    this.oDashboardLayoutUtil.setAutoCardSpanHeight(null, this.cardId, this.oView.$().height());
                }
            }

            var bIsNavigable = 0;
            if (oCompData && oCompData.mainComponent) {
                var oMainComponent = oCompData.mainComponent;
                //Flag bGlobalFilterLoaded is set only when the oGlobalFilterLodedPromise is resolved
                if (oMainComponent.bGlobalFilterLoaded) {
                    bIsNavigable = this.checkNavigation();
                }
            } else if (sap.ovp.cards.OVPCardAsAPIUtils.checkIfAPIIsUsed(this)) {
                bIsNavigable = this.checkNavigation();
            }

            // checking if header is non navigable then removing the view all link from the stack card
            var oCardPropertyModel = this.getCardPropertiesModel();
            var sState = oCardPropertyModel.getProperty("/state");
            if (sState !== "Loading" && sState !== "Error") {
              var cardType = oCardPropertyModel.getProperty("/template");
              if (cardType === "sap.ovp.cards.stack") {
                if (!bIsNavigable) {
                  var viewAllLink = this.getView().byId('ViewAll');
                  if (viewAllLink) {
                    viewAllLink = viewAllLink.getDomRef();
                    jQuery(viewAllLink).remove();
                  }
                }
              }
            }

            //var sContentFragment = this.getCardPropertiesModel().getProperty("/contentFragment");
            if (bIsNavigable) {
                /**
                 * If it's a Quickview card, it should not have "cursor: pointer" set.
                 * Only the header and footer action items of Quickview card are navigable.
                 */
                if (sContentFragment ? sContentFragment !== "sap.ovp.cards.quickview.Quickview" : true) {
                  if (sContentFragment === "sap.ovp.cards.stack.Stack") {
                    var oCardRef = this.getView().getDomRef();
                    var stackContainer = jQuery(oCardRef).find('.sapOvpCardContentRightHeader');
                    if (stackContainer.length !== 0) {
                      stackContainer.addClass('sapOvpCardNavigable');
                    }
                  } else {
                    this.getView().addStyleClass("sapOvpCardNavigable");
                  }
                }
                if (sContentFragment && sContentFragment === "sap.ovp.cards.quickview.Quickview") {
                    var oHeader = this.byId("ovpCardHeader");
                    if (oHeader) {
                        oHeader.addStyleClass("sapOvpCardNavigable");
                    }
                }
            } else {
                if (sContentFragment) {
                    this.getView().addStyleClass("ovpNonNavigableItem");
                    // removing the role=button if the navigation for the header is not available
                    var oHeader = this.byId("ovpCardHeader");
                    if (oHeader) {
                        oHeader.$().removeAttr('role');
                        oHeader.addStyleClass('ovpNonNavigableItem');
                    }

                    var bIsLineItemNavigable = this.checkLineItemNavigation();
                    if (!bIsLineItemNavigable) {
                        // setting the list item to inactive if the navigation is not available for the card.
                        switch (sContentFragment) {
                            case "sap.ovp.cards.list.List" :
                                var listItem = this.getView().byId("listItem");
                                if (listItem) {
                                    listItem.setType("Inactive");
                                }
                                break;
                            case "sap.ovp.cards.table.Table" :
                                var listItem = this.getView().byId("tableItem");
                                if (listItem) {
                                    listItem.setType("Inactive");
                                }
                                break;
                            case "sap.ovp.cards.linklist.LinkList" :
                                if (!this.checkNavigationForLinkedList()) {
                                    var listItem = this.getView().byId("ovpCLI");
                                    if (listItem) {
                                        listItem.setType("Inactive");
                                    }
                                }
                                break;
                        }
                    }
                }
            }

            var dropDown = this.getView().byId("ovp_card_dropdown");
            var toolBar = this.getView().byId("toolbar");
            if (toolBar) {
                var toolBarDomRef = toolBar.getDomRef();
                //jQuery(toolBarDomRef).attr("aria-label", dropDown.getValue());
                jQuery(toolBarDomRef).attr("aria-label", dropDown.getSelectedItem().getText());
            }

        },

        checkNavigation: function () {
            var oCardPropsModel = this.getCardPropertiesModel();
            var oEntityType = this.getEntityType();
            if (oEntityType) {
                if (oCardPropsModel) {
                    var sIdentificationAnnotationPath = oCardPropsModel.getProperty("/identificationAnnotationPath");
                    var sAnnotationPath = sIdentificationAnnotationPath;
                    /* In case of Stack Card, there can be two entries for the identification annotation path
                    When more than one IdentificationAnnotationPath exists, they need to be split and assigned accordingly to Stack and Quickview Cards */
                    var sContentFragment = oCardPropsModel.getProperty("/contentFragment");
                    if (sContentFragment && (sContentFragment === "sap.ovp.cards.stack.Stack" || sContentFragment === "sap.ovp.cards.quickview.Quickview")){
                        var aAnnotationPath = (sIdentificationAnnotationPath) ? sIdentificationAnnotationPath.split(",") : [];
                        if (aAnnotationPath && aAnnotationPath.length > 1) {
                            if (sContentFragment === "sap.ovp.cards.stack.Stack"){
                                sAnnotationPath = aAnnotationPath[0];
                            } else {
                                sAnnotationPath = aAnnotationPath[1];
                            }
                        }
                    }
                    // if we have an array object e.g. we have records
                    var aRecords = oEntityType[sAnnotationPath];
                    if (this.isNavigationInAnnotation(aRecords)) {
                        return 1;
                    }

                    if (oCardPropsModel && oCardPropsModel.getProperty("/template") === "sap.ovp.cards.charts.analytical") {
                        var sKpiAnnotationPath = oCardPropsModel.getProperty("/kpiAnnotationPath");
                        if (oEntityType && sKpiAnnotationPath) {
                            var oRecord = oEntityType[sKpiAnnotationPath];
                            var sSemanticObject = oRecord.Detail && oRecord.Detail.SemanticObject && oRecord.Detail.SemanticObject.String;
                            var sAction = oRecord.Detail && oRecord.Detail.Action && oRecord.Detail.Action.String;
                            if (sSemanticObject && sAction) {
                                return 1;
                            }
                        }
                    }

                }
            } else if (oCardPropsModel && oCardPropsModel.getProperty("/template") === "sap.ovp.cards.linklist" &&
                oCardPropsModel.getProperty("/staticContent") &&
                oCardPropsModel.getProperty("/targetUri")) {
                return 1;
            }
            return 0;
        },

        checkNavigationForLinkedList : function () {
            if (this.getEntityType()) {
                var oEntityType = this.getEntityType();
                var oLineItemRecords = oEntityType['com.sap.vocabularies.UI.v1.LineItem'];
                if (oLineItemRecords && (oLineItemRecords[0].RecordType === "com.sap.vocabularies.UI.v1.DataFieldForAction" ||
                    oLineItemRecords[0].RecordType === "com.sap.vocabularies.UI.v1.DataFieldWithUrl")) {
                    return true;
                }
                //commented because in case contact annotation only title should be clickable to show quick view popover
                //return oEntityType.hasOwnProperty('com.sap.vocabularies.Communication.v1.Contact');
            }
            return false;
        },

        checkLineItemNavigation: function () {
            if (this.getEntityType()) {
                var oEntityType = this.getEntityType();
                var oCardPropsModel = this.getCardPropertiesModel();
                if (oCardPropsModel) {
                    var sAnnotationPath = oCardPropsModel.getProperty("/annotationPath");
                    var aRecords = oEntityType[sAnnotationPath];
                    return this.isNavigationInAnnotation(aRecords);
                }
            }
        },

        isNavigationInAnnotation : function(aRecords) {
            if (aRecords && aRecords.length) {
                for (var i = 0; i < aRecords.length; i++) {
                    var oItem = aRecords[i];
                    if (oItem.RecordType === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" ||
                        oItem.RecordType === "com.sap.vocabularies.UI.v1.DataFieldForAction" ||
                        oItem.RecordType === "com.sap.vocabularies.UI.v1.DataFieldWithUrl") {
                        return 1;
                    }
                }
            }
            return 0;
        },

        onHeaderClick: function () {
            /*
                On Header click of OVP Cards used as an API in other Applications
             */
            if (sap.ovp.cards.OVPCardAsAPIUtils.checkIfAPIIsUsed(this)) {
                sap.ovp.cards.CommonUtils.onHeaderClicked();
            } else {
                //Only for static linklist cards, the navigation destination is the URL specified as the targetUri property's value in the manifest.
                var oCardPropertiesModel = this.getCardPropertiesModel();
                var template = oCardPropertiesModel.getProperty("/template");
                var sTargetUrl = oCardPropertiesModel.getProperty("/targetUri");

                if (template == "sap.ovp.cards.linklist" && oCardPropertiesModel.getProperty("/staticContent") !== undefined && sTargetUrl) {
                    window.location.href = sTargetUrl;
                } else if (oCardPropertiesModel.getProperty("/staticContent") !== undefined && sTargetUrl === "") {
                    return;
                } else {
                    //call the navigation with the binded context to support single object cards such as quickview card
                    this.doNavigation(this.getView().getBindingContext());
                }
            }
        },

        resizeCard: function (cardSpan) {
            jQuery.sap.log.info(cardSpan);
            //card was manually resized --> de-register handler
            if (this.resizeHandlerId) {
                sap.ui.core.ResizeHandler.deregister(this.resizeHandlerId);
                this.resizeHandlerId = null;
            }
        },
        /*_handleCountFooter: function () {
            var countFooter = this.getView().byId("ovpCountFooter");

            if (countFooter) {
                var countFooterParent = countFooter.$().parent();
                countFooterParent.addClass("sapOvpCardFooterBorder");
            }

            if (countFooter) {
                //Gets the card items binding object
                var oItemsBinding = this.getCardItemsBinding();
                if (oItemsBinding) {
                    oItemsBinding.attachDataReceived(function () {
                        var iTotal = oItemsBinding.getLength();
                        var iCurrent = oItemsBinding.getCurrentContexts().length;
                        var countFooterText = sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("Count_Zero_Footer");
                        if (iTotal !== 0) {
                            countFooterText = sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("Count_Footer", [iCurrent, iTotal]);
                        }
                        countFooter.setText(countFooterText);
                        var countFooterDomRef = countFooter.$();
                        countFooterDomRef.attr("aria-label", countFooterText);
                    });
                }
            }
        },*/
        //Function to display header counter
        _handleCountHeader: function() {
            var countFooter = this.getView().byId("ovpCountHeader");
            if (countFooter) {
                //Gets the card items binding object
                var oItemsBinding = this.getCardItemsBinding();
                if (oItemsBinding) {
                    /*There have been instances when the data is received before attaching the event "attachDataReceived"
                      is made.As a result, no counter comes in the header on intital load.Therefore, an explicit
                      call is made to set the header counter.*/
                    this.setHeaderCounter(oItemsBinding, countFooter);
                    oItemsBinding.attachDataReceived(function() {
                        this.setHeaderCounter(oItemsBinding, countFooter);
                    }.bind(this));
                    oItemsBinding.attachChange(function() {
                        this.setHeaderCounter(oItemsBinding, countFooter);
                    }.bind(this));
                }
            }

        },

        setHeaderCounter: function(oItemsBinding, countFooter) {
            var iTotal = oItemsBinding.getLength();
            var iCurrent = oItemsBinding.getCurrentContexts().length;
            var oCard, countFooterText = "";
            var numberFormat = sap.ui.core.format.NumberFormat.getIntegerInstance({
                minFractionDigits: 0,
                maxFractionDigits: 1,
                decimalSeparator: ".",
                style: "short"
            });
            iCurrent = parseFloat(iCurrent, 10);
            var oCompData = this.getOwnerComponent().getComponentData();
            //Check Added for Fixed card layout
            if (oCompData && oCompData.appComponent) {
                var oAppComponent = oCompData.appComponent;
                if (oAppComponent.getModel('ui')) {
                    var oUiModel = oAppComponent.getModel('ui');
                    //Check Added for Resizable card layout
                    if (oUiModel.getProperty('/containerLayout') !== 'resizable') {
                        if (iTotal !== 0) {
                            iTotal = numberFormat.format(Number(iTotal));
                        }
                        if (iCurrent !== 0) {
                            iCurrent = numberFormat.format(Number(iCurrent));
                        }
                    } else {
                        oCard = oAppComponent.getDashboardLayoutUtil().dashboardLayoutModel.getCardById(oCompData.cardId);
                    }
                }
            }
            /*Set counter in header if
             * (i)   All the items are not displayed
             * (ii) Card is resized to its header
             */
            if (iCurrent === 0) {
                countFooterText = "";
            } else if (oCard && oCard.dashboardLayout.showOnlyHeader) {
                //Display only total indication in case the card is resized to its header
                countFooterText = sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("Count_Header_Total", [iTotal]);
            } else if (iTotal != iCurrent) {
                //Display both current and total indication in the other scenarios
                countFooterText = sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("Count_Header", [iCurrent, iTotal]);
            }
            countFooter.setText(countFooterText);
            var countFooterDomRef = countFooter.$();
            countFooterDomRef.attr("aria-label", countFooterText);
        },

        /*
         *   Hide the KPI Header when there is no Data to be displayed
         */
        _handleKPIHeader: function () {
            var kpiHeader, subTitle;
            if (this.getView() && this.getView().getDomRef()) {
                kpiHeader = this.getView().getDomRef().getElementsByClassName("numericContentHbox");
                subTitle = this.getView().getDomRef().getElementsByClassName("noDataSubtitle");
            } else {
                return;
            }
            if (kpiHeader || subTitle) {
                var oItemsBinding = this.getCardItemsBinding();
                if (oItemsBinding) {
                    oItemsBinding.attachDataReceived(function () {
                        this._setSubTitleWithUnitOfMeasure(oItemsBinding);
                        var iTotal = oItemsBinding.getLength();
                        if (kpiHeader[0]) {
                            kpiHeader[0].style.visibility = null;
                            if (iTotal === 0) {
                                kpiHeader[0].style.visibility = 'hidden';
                            }
                        }
                        if (subTitle.length !== 0) {
                            subTitle[0].style.display = "none";
                            if (iTotal === 0) {
                                subTitle[0].style.display = "flex";
                            }
                        }
                    }.bind(this));
                }
            }
        },
        /*
        *  SubTitle with unit of measure
        */
        _setSubTitleWithUnitOfMeasure: function (oItemsBinding) {
            var oCardPropertiesModel = this.getCardPropertiesModel();
            if (!!oCardPropertiesModel) {
                var oData = oCardPropertiesModel.getData();
                var oSubtitleTextView = this.getView().byId("SubTitle-Text");
                if (!!oSubtitleTextView) {
                    oSubtitleTextView.setText(oData.subTitle);
                    if (!!oData && !!oData.entityType && !!oData.dataPointAnnotationPath) {
                        var oEntityType = oCardPropertiesModel.getData().entityType;
                        var oDataPoint = oEntityType[oData.dataPointAnnotationPath];
                        var measure;
                        if (oDataPoint && oDataPoint.Value && oDataPoint.Value.Path) {
                            measure = oDataPoint.Value.Path;
                        } else if (oDataPoint && oDataPoint.Description && oDataPoint.Description.Value && oDataPoint.Description.Value.Path) {
                            measure = oDataPoint.Description.Value.Path;
                        }
                        if (!!measure) {
                            var sPath = sap.ovp.cards.CommonUtils.getUnitColumn(measure, oEntityType);
                            var kpiHeader = this.byId("kpiHeader");
                            if (!!kpiHeader) {
                                var oAggregationItems = kpiHeader.getAggregation("items")[0];
                                if (!!oAggregationItems) {
                                    var item = oAggregationItems.getItems()[0];
                                    if (!!item) {
                                        var sContextPath = item.getBindingContext().getPath();
                                        if (!!sContextPath) {
                                            var unitOfMeasure;
                                            var oModel = this.getModel();
                                            var oContext = oModel.getContext(sContextPath);
                                            if (!!sPath && !!oContext) {
                                                unitOfMeasure = oContext.getProperty(sPath);
                                            } else {
                                                unitOfMeasure = sap.ovp.cards.CommonUtils.getUnitColumn(measure, oEntityType, true);
                                            }
                                            var subTitleInText = sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("SubTitle_IN");
                                            if (!!oData.subTitle && !!subTitleInText && !!unitOfMeasure) {
                                                oSubtitleTextView.setText(oData.subTitle + " " + subTitleInText + " " + unitOfMeasure);
                                                var oCustomData = oSubtitleTextView.getAggregation("customData");
                                                if (!!oCustomData && !!oCustomData[0]) {
                                                    oCustomData[0].setValue(oData.subTitle + " " + subTitleInText + " " + unitOfMeasure);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },

        /**
         * default empty implementation for the count footer
         */
        getCardItemsBinding: function () {
        },

        onActionPress: function (oEvent) {
            var sourceObject = oEvent.getSource(),
                oCustomData = this._getActionObject(sourceObject),
                context = sourceObject.getBindingContext();
            if (oCustomData.type.indexOf("DataFieldForAction") !== -1) {
                this.doAction(context, oCustomData);
            } else {
                this.doNavigation(context, oCustomData);
            }
        },
        _getActionObject: function (sourceObject) {
            var aCustomData = sourceObject.getCustomData();
            var oCustomData = {};
            for (var i = 0; i < aCustomData.length; i++) {
                oCustomData[aCustomData[i].getKey()] = aCustomData[i].getValue();
            }
            return oCustomData;
        },

        doNavigation: function (oContext, oNavigationField) {
            //handle multiple clicks of line item/header
            if (!this.enableClick){
                return;
             }
            this.enableClick = false;
            setTimeout(function(){this.enableClick = true; }.bind(this), 1000);
            if (!oNavigationField) {
                oNavigationField = this.getEntityNavigationEntries(oContext)[0];
            }

            //Create copy of objects so that they are not altered from extension function
            var oContextCopy = jQuery.extend(true, {}, oContext);
            var oNavigationFieldCopy = jQuery.extend(true, {}, oNavigationField);

            //Get custom navigation entry from extension controller
            //Custom navigation entry should be object with properties {type, semanticObject, action, url, label}
            //url property to be used for type DataFieldWithUrl else semanticObject & action can be used
            var oCustomNavigationEntry = this.oMainComponent && this.oMainComponent.doCustomNavigation &&
                this.oMainComponent.doCustomNavigation(this.sCardId, oContextCopy, oNavigationFieldCopy);

            //If custom navigation is defined in extension, then override standard navigation with custom
            if (oCustomNavigationEntry) {
                var sType = oCustomNavigationEntry.type;
                if (sType && typeof sType === "string" && sType.length > 0) {
                    //Refine any inconsistent value coming from custom method
                    sType = sType.split(".").pop().split("/").pop().toLowerCase();
                    switch (sType) {
                        case "datafieldwithurl":
                            oCustomNavigationEntry.type = "com.sap.vocabularies.UI.v1.DataFieldWithUrl";
                            break;
                        case "datafieldforintentbasednavigation":
                            oCustomNavigationEntry.type = "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation";
                            break;
                    }
                    oNavigationField = oCustomNavigationEntry;
                }
            }

            if (oNavigationField) {
                switch (oNavigationField.type) {
                    case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
                        this.doNavigationWithUrl(oContext, oNavigationField);
                        break;
                    case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
                        this.doIntentBasedNavigation(oContext, oNavigationField, false);
                        break;
                    case "com.sap.vocabularies.UI.v1.KPIDetailType":
                        this.doIntentBasedNavigation(oContext, oNavigationField, false);
                        break;
                }
            }
        },

        doNavigationWithUrl: function (oContext, oNavigationField) {

            //Container comes from FLP. For apps without FLP, the container will be missing
            if (!sap.ushell.Container) {
                return;
            }
            var oParsingSerivce = sap.ushell.Container.getService("URLParsing");

            //Checking if navigation is external or IntentBasedNav with paramters
            //If Not a internal navigation, navigate in a new window
            if (!(oParsingSerivce.isIntentUrl(oNavigationField.url))) {
                window.open(oNavigationField.url);
            } else {
                var oParsedShellHash = oParsingSerivce.parseShellHash(oNavigationField.url);
            //Url can also contain an intent based navigation with route, route can be static or dynamic with paramters
                this.doIntentBasedNavigation(oContext, oParsedShellHash, true);
            }
        },

        fnHandleError: function (oError) {
            if (oError instanceof sap.ui.generic.app.navigation.service.NavError) {
                if (oError.getErrorCode() === "NavigationHandler.isIntentSupported.notSupported") {
                    sap.m.MessageBox.show(sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("OVP_NAV_ERROR_NOT_AUTHORIZED_DESC"), {
                        title: sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("OVP_GENERIC_ERROR_TITLE")
                    });
                } else {
                    sap.m.MessageBox.show(oError.getErrorCode(), {
                        title: sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("OVP_GENERIC_ERROR_TITLE")
                    });
                }
            }
        },

        doCrossApplicationNavigation: function (oIntent, oNavArguments) {
            var sIntent = "#" + oIntent.semanticObject + '-' + oIntent.action;
            if (oIntent.params) {
                var oComponentData = this.oCardComponent && this.oCardComponent.getComponentData();
                var oAppComponent = oComponentData && oComponentData.appComponent;
                if (oAppComponent) {
                    var sParams = oAppComponent._formParamString(oIntent.params);
                    sIntent = sIntent + sParams;
                }
            }
            var that = this;
            //Container comes from FLP. For apps without FLP, the container will be missing
            if (!sap.ushell.Container) {
                return;
            }
            sap.ushell.Container.getService("CrossApplicationNavigation").isIntentSupported([sIntent])
                .done(function (oResponse) {
                    if (oResponse[sIntent].supported === true) {
                        // enable link
                        if (!!oNavArguments.params) {
                            if (typeof oNavArguments.params == 'string') {
                                try {
                                    oNavArguments.params = JSON.parse(oNavArguments.params);
                                } catch (err) {
                                    jQuery.sap.log.error("Could not parse the Navigation parameters");
                                    return;
                                }
                            }
                        }
                        /*
                         Adding Global filters to Navigation Parameters
                         */
                        var oComponentData = that.getOwnerComponent().getComponentData();
                        var oGlobalFilter = oComponentData ? oComponentData.globalFilter : undefined;
                        var oUiState = oGlobalFilter && oGlobalFilter.getUiState({
                                allFilters: false
                            });
                        var sSelectionVariant = oUiState ? JSON.stringify(oUiState.getSelectionVariant()) : "{}";
                        oGlobalFilter = jQuery.parseJSON(sSelectionVariant);
                        if (!oNavArguments.params) {
                            oNavArguments.params = {};
                        }
                        if (!!oGlobalFilter && !!oGlobalFilter.SelectOptions) {
                            for (var i = 0; i < oGlobalFilter.SelectOptions.length; i++) {
                                var oGlobalFilterValues = oGlobalFilter.SelectOptions[i].Ranges;
                                if (!!oGlobalFilterValues) {
                                    var values = [];
                                    for (var j = 0; j < oGlobalFilterValues.length; j++) {
                                        if (oGlobalFilterValues[j].Sign === "I" && oGlobalFilterValues[j].Option === "EQ") {
                                            values.push(oGlobalFilterValues[j].Low);
                                        }
                                    }
                                    oNavArguments.params[oGlobalFilter.SelectOptions[i].PropertyName] = values;
                                }
                            }
                        }
                        sap.ushell.Container.getService("CrossApplicationNavigation").toExternal(oNavArguments);
                    } else {
                        var oError = new sap.ui.generic.app.navigation.service.NavError("NavigationHandler.isIntentSupported.notSupported");
                        that.fnHandleError(oError);
                    }
                })
                .fail(function () {
                    jQuery.sap.log.error("Could not get authorization from isIntentSupported");
                });
        },

        doIntentBasedNavigation: function (oContext, oIntent, oUrlWithIntent) {

            //Navigation handler constructor uses ushell container to retrieve app
            //services, without container the instance creation will fall with error
            if (!sap.ushell.Container) {
                return;
            }
            var oParameters,
                oNavArguments,
                oEntity = oContext ? oContext.getObject() : null;

            if (oEntity && oEntity.__metadata) {
                delete oEntity.__metadata;
            }

            var oNavigationHandler = sap.ovp.cards.CommonUtils.getNavigationHandler();

            if (oNavigationHandler) {
                if (oIntent) {
                    oParameters = this._getEntityNavigationParameters(oEntity);
                    oNavArguments = {
                        target: {
                            semanticObject: oIntent.semanticObject,
                            action: oIntent.action
                        },
                        appSpecificRoute: oIntent.appSpecificRoute,
                        params: oParameters.newSelectionVariant
                    };

                    var oCustomData, oMain = null;
                    if (this.getOwnerComponent() && this.getOwnerComponent().getComponentData()) {
                        oMain = this.getOwnerComponent().getComponentData().mainComponent;
                        if (!!oMain) {
                            oCustomData = oMain._getCustomAppState();
                            //var oGlobalFilter = oMain.getView().byId("ovpGlobalFilter");
                        }
                    }

                    var oAppInnerData = {
                        selectionVariant: oParameters.oldSelectionVariant,
                        presentationVariant : oParameters.newPresentationVariant,
                        customData: oCustomData
                    };

                    if (oUrlWithIntent) {
                        if (oIntent && oIntent.semanticObject && oIntent.action) {
                            var oParams = this.getCardPropertiesModel().getProperty("/staticParameters");
                            oNavArguments.params = (!!oParams) ? oParams : {};
                            this.doCrossApplicationNavigation(oIntent, oNavArguments);
                        }
                    } else {
                        oNavigationHandler.navigate(oNavArguments.target.semanticObject, oNavArguments.target.action, oNavArguments.params,
                            oAppInnerData, this.fnHandleError);
                    }
                }
            }
        },

        doAction: function (oContext, action) {
            this.actionData = ActionUtils.getActionInfo(oContext, action, this.getEntityType());
            if (this.actionData.allParameters.length > 0) {
                this._loadParametersForm();
            } else {
                this._callFunction();
            }
        },

        getEntityNavigationEntries: function (oContext, sAnnotationPath) {
            var aNavigationFields = [];
            var oEntityType = this.getEntityType();
            var oCardPropsModel = this.getCardPropertiesModel();

            if (!oEntityType) {
                return aNavigationFields;
            }
            /**
            * In the case where oContext and sAnnotationPath are undefined, then it is the case of header navigation
             * We check if the card is analytical in this case and check if the relevant semantic object
             * and action are present as part of the KPI annotation and assign it to the navigation fields.
             */
            if (!sAnnotationPath && !oContext) {
                var kpiAnnotationPath = oCardPropsModel.getProperty("/kpiAnnotationPath");
                var sCardType = oCardPropsModel.getProperty("/template");
                if (kpiAnnotationPath && sCardType === "sap.ovp.cards.charts.analytical") {
                    sAnnotationPath = kpiAnnotationPath;
                    var oRecord = oEntityType[sAnnotationPath];
                    var oDetail = oRecord && oRecord.Detail;
                    if (oDetail.RecordType === "com.sap.vocabularies.UI.v1.KPIDetailType") {
                        aNavigationFields.push({
                            type: oDetail.RecordType,
                            semanticObject: oDetail.SemanticObject.String,
                            action: oDetail.Action.String,
                            label: ""
                        });
                    }
                }
            }
            if (!sAnnotationPath) {
                    var sIdentificationAnnotationPath = oCardPropsModel.getProperty("/identificationAnnotationPath");
                    /**
                     * In the case of stack card there can be 2 entries for the identification annotation path.
                     * The second entry corresponds to the object stream, so we avoid this entry (it is processed separately).
                     */
                    var aAnnotationPath = (sIdentificationAnnotationPath) ? sIdentificationAnnotationPath.split(",") : [];
                    if (aAnnotationPath && aAnnotationPath.length > 1) {
                        sAnnotationPath = aAnnotationPath[0];
                    } else {
                        sAnnotationPath = sIdentificationAnnotationPath;
                    }
            }
            // if we have an array object e.g. we have records
            var aRecords = oEntityType[sAnnotationPath];
            if (Array.isArray(aRecords)) {

                // sort the records by Importance - before we initialize the navigation-actions of the card
                aRecords = sap.ovp.cards.AnnotationHelper.sortCollectionByImportance(aRecords);

                for (var i = 0; i < aRecords.length; i++) {
                    if (aRecords[i].RecordType === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
                        aNavigationFields.push({
                            type: aRecords[i].RecordType,
                            semanticObject: aRecords[i].SemanticObject.String,
                            action: aRecords[i].Action.String,
                            label: aRecords[i].Label ? aRecords[i].Label.String : null
                        });
                    }
                    if (aRecords[i].RecordType === "com.sap.vocabularies.UI.v1.DataFieldWithUrl" && !aRecords[i].Url.UrlRef) {

                        var oModel = this.getView().getModel();
                        var oMetaData = oModel.oMetaModel;
                        var oEntityBindingContext = oMetaData.createBindingContext(oEntityType.$path);
                        var sBindingString = sap.ui.model.odata.AnnotationHelper.format(oEntityBindingContext, aRecords[i].Url);
                        var oCustomData = new sap.ui.core.CustomData({
                            key: "url",
                            value: sBindingString
                        });
                        oCustomData.setModel(oModel);
                        oCustomData.setBindingContext(oContext);
                        var oUrl = oCustomData.getValue();

                        aNavigationFields.push({
                            type: aRecords[i].RecordType,
                            url: oUrl,
                            value: aRecords[i].Value.String,
                            label: aRecords[i].Label ? aRecords[i].Label.String : null
                        });
                    }
                }
            }
            return aNavigationFields;
        },

        getModel: function () {
            return this.getView().getModel();
        },

        getMetaModel: function () {
            if (this.getModel()) {
                return this.getModel().getMetaModel();
            }
        },

        getCardPropertiesModel: function () {
            if (!this.oCardPropertiesModel || jQuery.isEmptyObject(this.oCardPropertiesModel)) {
                this.oCardPropertiesModel = this.getView().getModel("ovpCardProperties");
            }
            return this.oCardPropertiesModel;
        },

        getEntitySet: function () {
            if (!this.entitySet) {
                var sEntitySet = this.getCardPropertiesModel().getProperty("/entitySet");
                this.entitySet = this.getMetaModel().getODataEntitySet(sEntitySet);
            }

            return this.entitySet;
        },

        getEntityType: function () {
            if (!this.entityType) {
                if (this.getMetaModel() && this.getEntitySet()) {
                    this.entityType = this.getMetaModel().getODataEntityType(this.getEntitySet().entityType);
                }
            }

            return this.entityType;
        },

        getCardContentContainer: function () {
            if (!this.cardContentContainer) {
                this.cardContentContainer = this.getView().byId("ovpCardContentContainer");
            }
            return this.cardContentContainer;
        },

        //_saveAppState: function(sFilterDataSuiteFormat) {
        //	var oDeferred = jQuery.Deferred();
        //	var oAppState = sap.ushell.Container.getService("CrossApplicationNavigation").createEmptyAppState(this.getOwnerComponent());
        //	var sAppStateKey = oAppState.getKey();
        //	var oAppDataForSave = {
        //		selectionVariant: sFilterDataSuiteFormat
        //	};
        //	oAppState.setData(oAppDataForSave);
        //	var oSavePromise = oAppState.save();
        //
        //	oSavePromise.done(function() {
        //       oDeferred.resolve(sAppStateKey,oAppDataForSave);
        //	});
        //
        //	return oDeferred.promise();
        //},

        /**
         * This function connects to custom functions and evaluates custom navigation parameters
         * @private
         * @returns boolean
         */
        _processCustomParameters: function (oContextData, oSelectionData) {
            var oCardPropertiesModel = this.getCardPropertiesModel();
            if (!this.oMainComponent || !oCardPropertiesModel) {
                return;
            }
            var sCustomParams = oCardPropertiesModel.getProperty("/customParams");
            //If custom params settings not provided in descriptor or if custom param function
            //not defined in extension, then return without processing
            if (!sCustomParams || !this.oMainComponent.onCustomParams) {
                return;
            }
            //The custom extension function onCustomParams should return a custom function
            //based on the descriptor setting sCustomParams
            var fnGetParameters = this.oMainComponent.onCustomParams(sCustomParams);
            if (!fnGetParameters || !jQuery.isFunction(fnGetParameters)) {
                return;
            }
            //Create Copy of input objects so that they are not modified by extension
            var oContextDataCopy = jQuery.extend(true, {}, oContextData);
            var oSelectionDataCopy = jQuery.extend(true, {}, oSelectionData);
            var oCustomParams = fnGetParameters(oContextDataCopy, oSelectionDataCopy);

            //Type of oCustomParams should be either object or array
            if (!oCustomParams || (!jQuery.isArray(oCustomParams) && !jQuery.isPlainObject(oCustomParams))) {
                return;
            }
            //If oCustomParams is object with no properties, then stop processing
            var bIsObject = jQuery.isPlainObject(oCustomParams);
            if (bIsObject && jQuery.isEmptyObject(oCustomParams)) {
                return;
            }
            //From 1.54, ignoreEmptyString and selectionVariant are deprecated
            //From 1.54, Use bIgnoreEmptyString and aSelectionVariant
            var bIgnoreEmptyString = bIsObject && (oCustomParams.bIgnoreEmptyString || oCustomParams.ignoreEmptyString);
            var aCustomSelectionVariant = bIsObject ? (oCustomParams.aSelectionVariant || oCustomParams.selectionVariant) : oCustomParams;
            //aCustomSelectionVariant should always be an array of selection variants
            if (!jQuery.isArray(aCustomSelectionVariant)) {
                return;
            }
            //Process the custom selection variants
            var i, iLength, oCustomSelectionVariant, sPath, sValue1, sValue2;
            iLength = aCustomSelectionVariant.length;
            for (i = 0; i < iLength; i++) {
                oCustomSelectionVariant = aCustomSelectionVariant[i];
                if (!oCustomSelectionVariant) {
                    continue;
                }
                sPath = oCustomSelectionVariant.path;
                sValue1 = oCustomSelectionVariant.value1;
                sValue2 = oCustomSelectionVariant.value2;
                //Property path is mandatory
                if (!sPath || typeof sPath !== "string" || sPath === "") {
                    jQuery.sap.log.error("Custom Variant property path '" + sPath + "' should be valid string");
                    continue;
                }
                //Value1 is mandatory except when ignore is set explicitly.
                //0 is allowed, "" is allowed with ignore flag set 
                if (!(sValue1 || sValue1 === 0 || (sValue1 === "" && bIgnoreEmptyString))) {
                    continue;
                }
                sValue1 = sValue1.toString();
                sValue2 = sValue2 && sValue2.toString();
                //Update oSelectionData and oContextData. Since they are object references, they will also get
                //updated in calling function
                if (sValue1 === "" && bIgnoreEmptyString) {
                    oSelectionData.removeSelectOption(sPath);
                }
                delete oContextData[sPath];
                oSelectionData.addSelectOption(sPath, oCustomSelectionVariant.sign, oCustomSelectionVariant.operator,
                    sValue1, sValue2);
            }
            //Remove selections with empty strings in value field, object reference is passed so object is modified directly
            //Only oSelectionData is modified, oContextData will be taken care later by function mixAttributesAndSelectionVariant
            if (bIgnoreEmptyString) {
                this._removeEmptyStringsFromSelectionVariant(oSelectionData);
            }
            return bIgnoreEmptyString;
        },

        /**
         * Retrieve entity parameters (if exists) and add xAppState from oComponentData.appStateKeyFunc function (if exists)
         * @param oEntity
         * @returns {*}
         * @private
         */
        _getEntityNavigationParameters: function (oEntity) {
            var oContextParameters = {};
            var oComponentData = this.getOwnerComponent().getComponentData();
            var oGlobalFilter = oComponentData ? oComponentData.globalFilter : undefined;
            var oCardSelections = sap.ovp.cards.AnnotationHelper.getCardSelections(this.getCardPropertiesModel());

            var aCardFilters = oCardSelections.filters;
            var aCardParameters = oCardSelections.parameters;

            var oCardPropertiesModel = this.getCardPropertiesModel();
            var oEntityType = this.getEntityType();


            //When filters are passed as navigation params, '/' should be replaced with '.'
            //Eg. to_abc/xyz should be to_abc.xyz
            aCardFilters && aCardFilters.forEach(function(oCardFilter) {
                oCardFilter.path = oCardFilter.path.replace("/", ".");

                // NE operator is not supported by selction variant
                // so we are changing it to exclude with EQ operator.
                // Contains operator is not supported by selection variant
                // so we are changing it to CP operator
                switch (oCardFilter.operator) {
                    case sap.ui.model.FilterOperator.NE:
                        oCardFilter.operator = sap.ui.model.FilterOperator.EQ;
                        oCardFilter.sign = "E";
                        break;
                    case sap.ui.model.FilterOperator.Contains:
                        oCardFilter.operator = "CP";
                        var sValue = oCardFilter.value1;
                        oCardFilter.value1 = "*" + sValue + "*";
                        break;
                    case sap.ui.model.FilterOperator.EndsWith:
                        oCardFilter.operator = "CP";
                        var sValue = oCardFilter.value1;
                        oCardFilter.value1 = "*" + sValue;
                        break;
                    case sap.ui.model.FilterOperator.StartsWith:
                        oCardFilter.operator = "CP";
                        var sValue = oCardFilter.value1;
                        oCardFilter.value1 = sValue + "*";
                }

            });
            oCardSelections.filters = aCardFilters;

            aCardParameters && aCardParameters.forEach(function(oCardParameter) {
                oCardParameter.path = oCardParameter.path.replace("/", ".");
            });
            oCardSelections.parameters = aCardParameters;

            var oCardSorters = sap.ovp.cards.AnnotationHelper.getCardSorters(this.getCardPropertiesModel());
            var oSelectionVariant, oGlobalSelectionVariant, oPresentationVariant;

            // Build result object of card parameters
            if (oEntity) {
                var key;
                for (var i = 0; oEntityType.property && i < oEntityType.property.length; i++) {
                    key = oEntityType.property[i].name;
                    var vAttributeValue = oEntity[key];

                    if (oEntity.hasOwnProperty(key)) {
                        if (window.Array.isArray(oEntity[key]) && oEntity[key].length === 1) {
                            oContextParameters[key] = oEntity[key][0];
                        } else if (jQuery.type(vAttributeValue) !== "object") {
                            oContextParameters[key] = vAttributeValue;
                        }
                    }
                }
            }


            // add the KPI ID to the navigation parameters if it's present
            var sKpiAnnotationPath = oCardPropertiesModel && oCardPropertiesModel.getProperty("/kpiAnnotationPath");
            var sCardType = oCardPropertiesModel && oCardPropertiesModel.getProperty("/template");

            if (sKpiAnnotationPath && sCardType === "sap.ovp.cards.charts.analytical") {
                var oRecord = oEntityType[sKpiAnnotationPath];
                var oDetail = oRecord && oRecord.Detail;
                if (oDetail && oDetail.RecordType === "com.sap.vocabularies.UI.v1.KPIDetailType") {
                    oContextParameters["kpiID"] = oRecord.ID.String;
                }
            }

            //Build selection variant object from global filter, card filter and card parameters
            var oUiState = oGlobalFilter && oGlobalFilter.getUiState({
                    allFilters: false
                });
            var sSelectionVariant = oUiState ? JSON.stringify(oUiState.getSelectionVariant()) : "{}";
            oGlobalSelectionVariant = new sap.ui.generic.app.navigation.service.SelectionVariant(sSelectionVariant);
            oPresentationVariant = oCardSorters && new sap.ui.generic.app.navigation.service.PresentationVariant(oCardSorters);
            oSelectionVariant = this._buildSelectionVariant(oGlobalFilter, oCardSelections);

            //Process Custom parameters
            var bIgnoreEmptyString = this._processCustomParameters(oContextParameters, oSelectionVariant);
            var iSuppressionBehavior = bIgnoreEmptyString ? sap.ui.generic.app.navigation.service.SuppressionBehavior.ignoreEmptyString : undefined;

            //If there is a clash of static parameters with context or selection parameters, then static
            //parameters get lowest priority
            //If any value for oContextParameters[key] is already set, static parameter should not overwrite it
            var oStaticParameters = oCardPropertiesModel && oCardPropertiesModel.getProperty("/staticParameters");
            if (oStaticParameters) {
                for (var key in oStaticParameters) {
                    if (!oContextParameters.hasOwnProperty(key)) {
                        oContextParameters[key] = oStaticParameters[key];
                    }
                }
            }
            var oNavigationHandler = sap.ovp.cards.CommonUtils.getNavigationHandler();
            var oNewSelectionVariant = oNavigationHandler &&
                oNavigationHandler.mixAttributesAndSelectionVariant(oContextParameters, oSelectionVariant.toJSONString(), iSuppressionBehavior);

            return {
                oldSelectionVariant: oGlobalSelectionVariant ? oGlobalSelectionVariant.toJSONString() : null,
                newSelectionVariant: oNewSelectionVariant ? oNewSelectionVariant.toJSONString() : null,
                newPresentationVariant: oPresentationVariant ? oPresentationVariant.toJSONString() : null
            };
        },

        _removeEmptyStringsFromSelectionVariant: function (oSelectionVariant) {
            //remove parameters that have empty string
            var aParameters = oSelectionVariant.getParameterNames();
            for (var i = 0; i < aParameters.length; i++) {
                if (oSelectionVariant.getParameter(aParameters[i]) === "") {
                    oSelectionVariant.removeParameter(aParameters[i]);
                }
            }

            //remove selOptions that have empty string
            var aSelOptionNames =  oSelectionVariant.getSelectOptionsPropertyNames();
            for (i = 0; i < aSelOptionNames.length; i++) {
                var aSelectOption = oSelectionVariant.getSelectOption(aSelOptionNames[i]);
                //remove every range in the current select option having empty string
                for (var j = 0; j < aSelectOption.length; j++) {
                    if (aSelectOption[j].Low === "" && !aSelectOption[j].High) {
                        aSelectOption.splice(j, 1);
                        j--;
                    }
                }
                //remove selOption if there are no ranges in it
                if (aSelectOption.length === 0) {
                    oSelectionVariant.removeSelectOption(aSelOptionNames[i]);
                }
            }

            return oSelectionVariant;
        },

        _buildSelectionVariant: function (oGlobalFilter, oCardSelections) {
            var oUiState = oGlobalFilter && oGlobalFilter.getUiState({
                allFilters: false
            });
            var sSelectionVariant = oUiState ? JSON.stringify(oUiState.getSelectionVariant()) : "{}";
            var oSelectionVariant = new sap.ui.generic.app.navigation.service.SelectionVariant(sSelectionVariant);
            var oFilter, sValue1, sValue2, oParameter;

            var aCardFilters = oCardSelections.filters;
            var aCardParameters = oCardSelections.parameters;

            // Add card filters to selection variant
            for (var i = 0; i < aCardFilters.length; i++) {
                oFilter = aCardFilters[i];
                //value1 might be typeof number, hence we check not typeof undefined
                if (oFilter.path && oFilter.operator && typeof oFilter.value1 !== "undefined") {
                    //value2 is optional, hence we check it separately
                    sValue1 = oFilter.value1.toString();
                    sValue2 = (typeof oFilter.value2 !== "undefined") ? oFilter.value2.toString() : undefined;
                    oSelectionVariant.addSelectOption(oFilter.path, oFilter.sign, oFilter.operator, sValue1, sValue2);
                }
            }
            // Add card parameters to selection variant
            var sName, sNameWithPrefix, sNameWithoutPrefix;
            for (var j = 0; j < aCardParameters.length; j++) {
                oParameter = aCardParameters[j];
                //If parameter name or value is missing, then ignore
                if (!oParameter.path || !oParameter.value) {
                    continue;
                }
                sName = oParameter.path.split("/").pop();
                sName = sName.split(".").pop();
                //P_ParameterName and ParameterName should be treated as same
                if (sName.indexOf("P_") === 0) {
                    sNameWithPrefix = sName;
                    sNameWithoutPrefix = sName.substr(2); // remove P_ prefix
                } else {
                    sNameWithPrefix = "P_" + sName;
                    sNameWithoutPrefix = sName;
                }

                //If parameter already part of selection variant, this means same parameter came from global
                //filter and we should not send card parameter again, because parameter will always contain
                //single value, multiple parameter values will confuse target application
                if (oSelectionVariant.getParameter(sNameWithPrefix)) {
                    continue;
                }
                if (oSelectionVariant.getParameter(sNameWithoutPrefix)) {
                    continue;
                }
                oSelectionVariant.addParameter(sName, oParameter.value);
            }
            return oSelectionVariant;
        },

        _loadParametersForm: function () {
            var oParameterModel = new sap.ui.model.json.JSONModel();
            oParameterModel.setData(this.actionData.parameterData);
            var that = this;

            // first create dialog
            var oParameterDialog = new sap.m.Dialog('ovpCardActionDialog', {
                title: this.actionData.sFunctionLabel,
                afterClose: function () {
                    oParameterDialog.destroy();
                }
            }).addStyleClass("sapUiNoContentPadding");

            // action button (e.g. BeginButton)
            var actionButton = new sap.m.Button({
                text: this.actionData.sFunctionLabel,
                press: function (oEvent) {
                    var mParameters = ActionUtils.getParameters(oEvent.getSource().getModel(), that.actionData.oFunctionImport);
                    oParameterDialog.close();
                    that._callFunction(mParameters, that.actionData.sFunctionLabel);
                }
            });

            // cancel button (e.g. EndButton)
            var cancelButton = new sap.m.Button({
                text: "Cancel",
                press: function () {
                    oParameterDialog.close();
                }
            });
            // assign the buttons to the dialog
            oParameterDialog.setBeginButton(actionButton);
            oParameterDialog.setEndButton(cancelButton);

            // preparing a callback function which will be invoked on the Form's Fields-change
            var onFieldChangeCB = function (oEvent) {
                var missingMandatory = ActionUtils.mandatoryParamsMissing(oEvent.getSource().getModel(), that.actionData.oFunctionImport);
                actionButton.setEnabled(!missingMandatory);
            };

            // get the form assign it the Dialog and open it
            var oForm = ActionUtils.buildParametersForm(this.actionData, onFieldChangeCB);

            oParameterDialog.addContent(oForm);
            oParameterDialog.setModel(oParameterModel);
            oParameterDialog.open();
        },

        _callFunction: function (mUrlParameters, actionText) {
            var mParameters = {
                batchGroupId: "Changes",
                changeSetId: "Changes",
                urlParameters: mUrlParameters,
                forceSubmit: true,
                context: this.actionData.oContext,
                functionImport: this.actionData.oFunctionImport
            };
            var that = this;
            var oPromise = new Promise(function (resolve, reject) {
                var model = that.actionData.oContext.getModel();
                var sFunctionImport;
                sFunctionImport = "/" + mParameters.functionImport.name;
                model.callFunction(sFunctionImport, {
                    method: mParameters.functionImport.httpMethod,
                    urlParameters: mParameters.urlParameters,
                    batchGroupId: mParameters.batchGroupId,
                    changeSetId: mParameters.changeSetId,
                    headers: mParameters.headers,
                    success: function (oData, oResponse) {
                        resolve(oResponse);
                    },
                    error: function (oResponse) {
                        oResponse.actionText = actionText;
                        reject(oResponse);
                    }
                });
            });
            //Todo: call translation on message toast
            oPromise.then(function (oResponse) {
                return sap.m.MessageToast.show(sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("Toast_Action_Success"), {
                    duration: 1000
                });
            }, function (oError) {
                var errorMessage = sap.ovp.cards.CommonUtils.showODataErrorMessages(oError);
                if (errorMessage === "" && oError.actionText) {
                    errorMessage = sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("Toast_Action_Error") + ' "' + oError.actionText + '"' + ".";
                }
                return sap.m.MessageBox.error(errorMessage, {
                    title: sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("OVP_GENERIC_ERROR_TITLE"),
                    onClose: null,
                    styleClass: "",
                    initialFocus: null,
                    textDirection: sap.ui.core.TextDirection.Inherit
                });
            });
        },

        /**
         * In case of error card implementation can call this method to display
         * card error state.
         * Current instance of the card will be destroied and instead loading card
         * will be presenetd with the 'Cannot load card' meassage
         */
        setErrorState: function () {
            //get the current card component
            var oCurrentCard = this.getOwnerComponent();
            //If oCurrentCard is undefined, it means the original card has been created and the loading card
            //has been destroyed.
            //Thus, there is no need of creating an error card on top of the loading card.
            if (!oCurrentCard || !oCurrentCard.oContainer) {
                return;
            }
            //get the component container
            var oComponentContainer = oCurrentCard.oContainer;
            //prepare card configuration, i.e. category, title, description and entitySet
            //which are required for the loading card. in addition set the card state to error
            //so no loading indicator will be presented
            var oCardPropertiesModel = this.getCardPropertiesModel();
            var oComponentConfig = {
                name: "sap.ovp.cards.loading",
                componentData: {
                    model: this.getView().getModel(),
                    settings: {
                        category: oCardPropertiesModel.getProperty("/category"),
                        title: oCardPropertiesModel.getProperty("/title"),
                        description: oCardPropertiesModel.getProperty("/description"),
                        entitySet: oCardPropertiesModel.getProperty("/entitySet"),
                        state: sap.ovp.cards.loading.State.ERROR,
                        template: oCardPropertiesModel.getProperty("/template")
                    }
                }
            };
            //create the loading card
            var oLoadingCard = sap.ui.component(oComponentConfig);
            //set the loading card in the container
            oComponentContainer.setComponent(oLoadingCard);
            //destroy the current card
            setTimeout(function () {
                oCurrentCard.destroy();
            }, 0);
        },

        changeSelection: function (selectedKey, bAdaptUIMode, oCardProperties) {
            //Selected key will be provided for bAdaptUIMode= true case.
            //get the index of the combo box
            if (!bAdaptUIMode) {
                var oDropdown = this.getView().byId("ovp_card_dropdown");
                selectedKey = parseInt(oDropdown.getSelectedKey(), 10);
            }

            var oTabValue = {};
            if (!bAdaptUIMode) {
                //update the card properties
                oTabValue = this.getCardPropertiesModel().getProperty("/tabs")[selectedKey - 1];
            } else {
                oTabValue = oCardProperties.tabs[selectedKey - 1];
            }
            var oUpdatedCardProperties = {
                cardId: this.getOwnerComponent().getComponentData().cardId,
                selectedKey: selectedKey
            };
            for (var prop in oTabValue) {
                oUpdatedCardProperties[prop] = oTabValue[prop];
            }

            if (sap.ovp.cards.OVPCardAsAPIUtils.checkIfAPIIsUsed(this)) {
                sap.ovp.cards.OVPCardAsAPIUtils.recreateCard(oUpdatedCardProperties, this.getOwnerComponent().getComponentData());
            } else {
                this.getOwnerComponent().getComponentData().mainComponent.recreateCard(oUpdatedCardProperties);
            }
        },

        /**
         * Calculate the offset height of any card component(e.g- header, footer, container, toolbar or each item)
         *
         * @method getItemHeight
         * @param {Object} oGenCardCtrl - Card controller
         * @param {String} sCardComponentId - Component id which height is to be calculated
         * @return {Object} iHeight- Height of the component
         */
        getItemHeight: function (oGenCardCtrl, sCardComponentId, bFlag) {
            if (!!oGenCardCtrl) {
                var aAggregation = oGenCardCtrl.getView().byId(sCardComponentId);
                var iHeight = 0;
                //Null check as some cards does not contain toolbar or footer.
                if (!!aAggregation) {
                    if (bFlag) {
                        //if the height is going to be calculated for any item like <li> in List or <tr> in Table card
                        if (aAggregation.getItems()[0] && aAggregation.getItems()[0].getDomRef()) {
                            iHeight = jQuery(aAggregation.getItems()[0].getDomRef()).outerHeight(true);
                        }
                    } else {
                        if (aAggregation.getDomRef()) {
                            iHeight = jQuery(aAggregation.getDomRef()).outerHeight(true);
                        }
                    }
                }
                return iHeight;
            }
        },

        /**
         * Method to return the height of the header component
         *
         * @method getHeaderHeight
         * @return {Integer} iHeaderHeight - Height of the header component
         */
        getHeaderHeight: function () {
            var iHeight = this.getItemHeight(this, 'ovpCardHeader');
            var oCompData = this.getOwnerComponent() ? this.getOwnerComponent().getComponentData() : null;
            if (oCompData) {
                var oCard = this.oDashboardLayoutUtil.dashboardLayoutModel.getCardById(oCompData.cardId);
                return iHeight === 0 ? oCard.dashboardLayout.headerHeight : iHeight;
            } else {
                return iHeight;
            }
        }

    });
})();