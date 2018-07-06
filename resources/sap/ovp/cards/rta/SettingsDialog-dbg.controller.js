sap.ui.define([ 'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    '/sap/ui/fl/descriptorRelated/api/DescriptorChangeFactory',
    '/sap/ui/fl/descriptorRelated/api/DescriptorInlineChangeFactory',
    'sap/ovp/cards/OVPCardAsAPIUtils',
    'sap/ovp/cards/SettingsUtils',
    'sap/ovp/cards/PayLoadUtils',
    'sap/m/Button',
    'sap/m/Dialog',
    'sap/m/Text',
    'sap/ui/comp/valuehelpdialog/ValueHelpDialog',
    'sap/ovp/cards/rta/SettingsDialogConstants',
    'sap/m/MessageBox',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator'
], function(Controller, JSONModel, DescriptorChangeFactory, DescriptorInlineChangeFactory,
            OVPCardAsAPIUtils, settingsUtils, PayLoadUtils, Button, Dialog, Text, ValueHelpDialog, SettingsConstants,
            MessageBox, Filter, FilterOperator) {
    'use strict';

    return Controller.extend('sap.ovp.cards.rta.SettingsDialog', {

        /* To store manifest setting of selected Card*/
        _oCardManifestSettings : {},
        /*To store the elements that do not require refresh when updated*/
        _aRefreshNotRequired : SettingsConstants._aRefreshNotRequired,
        _aRefreshRequired : SettingsConstants._aRefreshRequired,
        oOvpResourceBundle: sap.ui.getCore().getLibraryResourceBundle("sap.ovp"),

        onInit : function() {
            /*Attaching CreateAndSubmitChange button to oSaveButton*/
            settingsUtils.oSaveButton.attachPress(this.onSaveButtonPress,this);
            settingsUtils.oResetButton.attachPress(this.onResetButton,this);
            settingsUtils.oMessagePopOverButton.attachPress(this.handleMessagePopoverPress, this);
        },

        onAfterRendering : function() {
            settingsUtils.dialogBox.addStyleClass("sapOvpSettingsDialogBox");
            this.setEnablePropertyForResetAndSaveButton(false);
            this._oCardManifestSettings = this.getView().getModel().getData();
            this._oOriginalCardManifestSettings = jQuery.extend(true, {}, this._oCardManifestSettings);
            var oView = this.getView(),
                /*oVisibilityModel = oView.getModel("visibility"),*/
                oCardPropertiesModel = oView.getModel(),
                dialogCard = oView.byId("dialogCard");
            if (!dialogCard.getVisible()) {
                dialogCard = oView.byId("dialogCardNoPreview");
            }
            dialogCard.getDomRef().style.minHeight = this._oCardManifestSettings.dialogBoxHeight + 'px';
            /*var oScrollContainerForForm = oView.byId("SettingsDialogScrollContainerForForm");
            if (oScrollContainerForForm) {
                oScrollContainerForForm.getDomRef().style.height =
                    (oVisibilityModel.getProperty("/viewSwitchEnabled")) ? this.getValueInRemString(settingsUtils.iContentHeightForDialogWithViewSwitch)
                        : this.getValueInRemString(settingsUtils.iContentHeightForDialog);
            }*/
            oView.byId("dialogCardOverlay").getDomRef().style.minHeight = this._oCardManifestSettings.dialogBoxHeight + 'px';
            settingsUtils.settingFormWidth(oView, "calc(100% - " + (this._oCardManifestSettings.dialogBoxWidth + 1) + "rem)");
            setTimeout( function(){
                var dialogCard = this.getView().byId("dialogCard");
                if (dialogCard.getVisible()) {
                    dialogCard.setBusy(false);
                }
            }.bind(this), 2000);

            if (this._oCardManifestSettings.staticContent) {
                // Initial error checks for Link title and Static Link
                this.handleErrorHandling(oCardPropertiesModel, "title", "/staticContent");
                this.handleErrorHandling(oCardPropertiesModel, "targetUri", "/staticContent");
            }
        },

        validateInputField: function (oEvent) {
            var oSource = oEvent.getSource();
            var iLength = oSource.getValue().trim().length;
            if (!iLength) {
                oSource.setValue(oSource.getValue().trim());
            }
            this.updateCard(oEvent);
        },
        addView : function(oEvent) {
            //adding Mandatory field as is.
            this.setEnablePropertyForResetAndSaveButton(true);
            var defaultDataPointAnnotationPath,
                oCardManifestSettings = this._oCardManifestSettings,
                oCardPropertiesModel = this.getView().getModel();
            if (oCardManifestSettings.dataPointAnnotationPath && oCardManifestSettings.dataPoint &&
                oCardManifestSettings.dataPoint.length) {
                defaultDataPointAnnotationPath = oCardManifestSettings.dataPoint[0].value;
            }
            if (oCardManifestSettings.tabs && oCardManifestSettings.tabs.length) {
                oCardManifestSettings.newViewCounter++;
                oCardManifestSettings.tabs.push({
                    annotationPath: oCardManifestSettings.lineItem[0].value,
                    dataPointAnnotationPath: defaultDataPointAnnotationPath,
                    value: 'View ' + oCardManifestSettings.newViewCounter
                });
                var selectedKey = oCardManifestSettings.tabs.length;
                oCardManifestSettings.aViews.push({
                    text: 'View ' + oCardManifestSettings.newViewCounter,
                    key: selectedKey,
                    isLaterAddedView: true,
                    isViewResetEnabled: false
                });
                this.selectViewSwitch(oEvent, selectedKey);
            } else {
                oCardManifestSettings.tabs = [{}];
                SettingsConstants.tabFields.forEach(function (tabField) {
                    oCardManifestSettings.tabs[0][tabField] = oCardManifestSettings[tabField];
                });
                oCardManifestSettings.tabs[0].value = "View 1";
                if (oCardManifestSettings.template === "sap.ovp.cards.charts.analytical") {
                    oCardManifestSettings.tabs.push({
                        chartAnnotationPath: oCardManifestSettings.chart[0].value,
                        dataPointAnnotationPath: defaultDataPointAnnotationPath,
                        value: 'View 2'
                    });
                } else {
                    oCardManifestSettings.tabs.push({
                        annotationPath: oCardManifestSettings.lineItem[0].value,
                        dataPointAnnotationPath: defaultDataPointAnnotationPath,
                        value: 'View 2'
                    });
                }

                oCardManifestSettings.selectedKey = 1;
                oCardManifestSettings.defaultViewSelected = 1;
                oCardManifestSettings.aViews = [{
                    text: this.oOvpResourceBundle && this.oOvpResourceBundle.getText('OVP_KEYUSER_LABEL_MAIN_VIEW'),
                    key: 0,
                    isLaterAddedView: false,
                    isViewResetEnabled: false
                }, {
                    text: 'View 1 (Default view)',
                    key: 1,
                    initialSelectedKey: 1,
                    isLaterAddedView: false,
                    isViewResetEnabled: false
                }, {
                    text: 'View 2',
                    key: 2,
                    isLaterAddedView: true,
                    isViewResetEnabled: false
                }];
                oCardManifestSettings.newViewCounter = 2;
                this.selectViewSwitch(oEvent, 1);
            }
            // Handling errors for Link title and Static Link
            this.handleErrorHandling(oCardPropertiesModel, "value", "/tabs");
        },
        deleteView: function(oEvent) {
            this.setEnablePropertyForResetAndSaveButton(true);
            var oCardManifestSettings = this._oCardManifestSettings,
                selectedKey = parseInt(oCardManifestSettings.selectedKey,10),
                oCardPropertiesModel = this.getView().getModel();
            oCardManifestSettings.tabs.splice(selectedKey - 1, 1);
            oCardManifestSettings.aViews.splice(selectedKey, 1);
            if (selectedKey === oCardManifestSettings.defaultViewSelected) {
                oCardManifestSettings.defaultViewSelected = 1;
                oCardManifestSettings.aViews[selectedKey].text = oCardManifestSettings.aViews[selectedKey].text + ' (Default view)';
            }
            oCardManifestSettings.aViews.forEach(function(view,index) {
               if (index >= selectedKey) {
                   view.key--;
               }
            });

            // Handling errors for Link title and Static Link
            this.handleErrorHandling(oCardPropertiesModel, "value", "/tabs");

            if (oCardManifestSettings.tabs.length == 1) {
                SettingsConstants.tabFields.forEach(function (tabField) {
                    oCardManifestSettings[tabField] = oCardManifestSettings.tabs[0][tabField];
                });
                delete oCardManifestSettings.selectedKey;
                delete oCardManifestSettings.defaultViewSelected;
                delete oCardManifestSettings.tabs;
                delete oCardManifestSettings.aViews;
                oCardManifestSettings.aViews = [{
                    text: 'click "+" to add a view',
                    key: 0,
                    initialSelectedKey: 0,
                    isLaterAddedView: false,
                    isViewResetEnabled: false
                }];
                settingsUtils.addManifestSettings(oCardManifestSettings);
                settingsUtils.setVisibilityForFormElements(oCardManifestSettings);
                this.getView().getModel('visibility').refresh();
                this.getView().getModel().refresh();
                this._fCardWithRefresh();
            } else {
                oCardManifestSettings.selectedKey = 1;
                this.selectViewSwitch(oEvent, oCardManifestSettings.selectedKey);
            }
        },
        resetView: function() {
            var oCardManifestSettings = this._oCardManifestSettings,
                oCardPropertiesModel = this.getView().getModel(),
                iSelectedKey = parseInt(oCardManifestSettings.selectedKey,10),
                oSelectedView = oCardManifestSettings.aViews[iSelectedKey],
                iDefaultViewSelected = oCardManifestSettings.defaultViewSelected;
            if (!oSelectedView.isLaterAddedView) {
                var kpiStateOfCurrentCard = oCardManifestSettings.dataPointAnnotationPath ? true : false,
                    kpiStateOfOriginalCard = this._oOriginalCardManifestSettings.dataPointAnnotationPath ? true : false;
                if (iSelectedKey) {
                    var initialSelectedKey = oCardManifestSettings.aViews[iSelectedKey].initialSelectedKey;
                    SettingsConstants.tabFields.forEach(function(field) {
                        if (field !== 'dataPointAnnotationPath' || kpiStateOfCurrentCard) {
                            /* None of the field is of type object hence direct copy is fine.*/
                            if (this._oOriginalCardManifestSettings.tabs && this._oOriginalCardManifestSettings.tabs.length) {
                                oCardManifestSettings[field] = this._oOriginalCardManifestSettings.tabs[initialSelectedKey - 1][field];
                            } else {
                                oCardManifestSettings[field] = this._oOriginalCardManifestSettings[field];
                            }
                            oCardManifestSettings.tabs[iSelectedKey - 1][field] = oCardManifestSettings[field];
                        }
                    }.bind(this));
                    if (!this._oOriginalCardManifestSettings.tabs || !this._oOriginalCardManifestSettings.tabs.length) {
                        oCardManifestSettings.newViewCounter++;
                        oCardManifestSettings.tabs[iSelectedKey - 1].value = "View " + oCardManifestSettings.newViewCounter;
                    }
                    if (iSelectedKey === oCardManifestSettings.defaultViewSelected) {
                        oCardManifestSettings.aViews[iSelectedKey].text = oCardManifestSettings.tabs[iSelectedKey - 1].value + ' (Default view)';
                    } else {
                        oCardManifestSettings.aViews[iSelectedKey].text = oCardManifestSettings.tabs[iSelectedKey - 1].value;
                    }

                } else {
                    SettingsConstants.mainFields.forEach(function(field) {
                        /* None of the field is of type object hence direct copy is fine.*/
                        oCardManifestSettings[field] = this._oOriginalCardManifestSettings[field];
                    }.bind(this));
                    if (kpiStateOfCurrentCard !== kpiStateOfOriginalCard) {
                        if (kpiStateOfOriginalCard) {
                            oCardManifestSettings.tabs.forEach(function (tab) {
                               if (tab.prevDataPointAnnotationPath) {
                                   tab.dataPointAnnotationPath  = tab.prevDataPointAnnotationPath;
                               } else {
                                   tab.dataPointAnnotationPath = oCardManifestSettings.dataPoint[0].value;
                               }
                            });
                            oCardManifestSettings.dataPointAnnotationPath = oCardManifestSettings.tabs[iDefaultViewSelected].dataPointAnnotationPath;
                        } else {
                            oCardManifestSettings.tabs.forEach(function (tab) {
                                tab.prevDataPointAnnotationPath = tab.dataPointAnnotationPath;
                                tab.dataPointAnnotationPath = undefined;
                            });
                        }
                    }
                }
            } else {
                var dataPointAnnotationPath;
                if (oCardManifestSettings.dataPointAnnotationPath) {
                    dataPointAnnotationPath = oCardManifestSettings.dataPoint[0].value;
                }
                oCardManifestSettings.newViewCounter++;
                if (oCardManifestSettings.template === "sap.ovp.cards.charts.analytical") {
                    oCardManifestSettings.tabs[iSelectedKey - 1] = {
                        chartAnnotationPath: oCardManifestSettings.chart[0].value,
                        dataPointAnnotationPath: dataPointAnnotationPath,
                        value: 'View ' + oCardManifestSettings.newViewCounter
                    };
                } else {
                    oCardManifestSettings.tabs[iSelectedKey - 1] = {
                        annotationPath: oCardManifestSettings.lineItem[0].value,
                        dataPointAnnotationPath: dataPointAnnotationPath,
                        value: 'View ' + oCardManifestSettings.newViewCounter
                    };
                }
                if (iSelectedKey === oCardManifestSettings.defaultViewSelected) {
                    oCardManifestSettings.aViews[iSelectedKey].text = 'View ' + oCardManifestSettings.newViewCounter + ' (Default view)';
                } else {
                    oCardManifestSettings.aViews[iSelectedKey].text = 'View ' + oCardManifestSettings.newViewCounter;
                }
                SettingsConstants.tabFields.forEach(function(field) {
                    /* None of the field is of type object hence direct copy is fine.*/
                    oCardManifestSettings[field] = oCardManifestSettings.tabs[iSelectedKey - 1][field];
                });
            }

            // Handling errors for Link title and Static Link
            this.handleErrorHandling(oCardPropertiesModel, "value", "/tabs");

            oCardManifestSettings.isViewResetEnabled = false;
            oCardManifestSettings.aViews[iSelectedKey].isViewResetEnabled = false;
            settingsUtils.addManifestSettings(oCardManifestSettings);
            settingsUtils.setVisibilityForFormElements(oCardManifestSettings);
            this.getView().getModel('visibility').refresh();
            this.getView().getModel().refresh();
            this._fCardWithRefresh();
        },
        selectViewSwitch : function(oEvent, selectedKey) {
            var oCardManifestSettings = this._oCardManifestSettings,
                oCardPropertiesModel = this.getView().getModel();
            if (!selectedKey) {
                selectedKey = oEvent.getSource().getSelectedIndex();
            }
            if (this.defaultViewSwitch) {
                this.defaultViewSwitch.setEnabled(true);
            }
            this.setEnablePropertyForResetAndSaveButton(true);

            //If selectedkey is zero then showMain view else subView
            if (!selectedKey) {
                /*By Default value get set to string zero . Setting it to interger zero*/
                /*Show main veiw with properties of the default view selected*/
                var iDefaultViewSelected = oCardManifestSettings.defaultViewSelected;
                oCardManifestSettings.selectedKey = selectedKey;
                oCardManifestSettings.mainViewSelected = true;
                oCardManifestSettings.isViewResetEnabled = oCardManifestSettings.aViews[selectedKey].isViewResetEnabled;
                SettingsConstants.tabFields.forEach(function (field) {
                   oCardManifestSettings[field] = oCardManifestSettings.tabs[iDefaultViewSelected - 1][field];
                });

                // Handling errors for Link title and Static Link
                this.handleErrorHandling(oCardPropertiesModel, "value", "/tabs");

                settingsUtils.addManifestSettings(oCardManifestSettings);
                settingsUtils.setVisibilityForFormElements(oCardManifestSettings);
                this.getView().getModel('visibility').refresh();
                this.getView().getModel().refresh();
                this._fCardWithRefresh();
            } else {
                oCardManifestSettings.mainViewSelected = false;
                oCardManifestSettings.isViewResetEnabled = oCardManifestSettings.aViews[selectedKey].isViewResetEnabled;
                var dialogCard = this.getView().byId("dialogCard");
                if (dialogCard.getVisible()) {
                    var oRootControl = dialogCard.getComponentInstance().getRootControl();
                    var oController = oRootControl.getController();
                    /*this will set the selectedkey for the manifest settings*/
                    oController.changeSelection(selectedKey, true, oCardManifestSettings);

                    // Handling errors for Link title and Static Link
                    this.handleErrorHandling(oCardPropertiesModel, "value", "/tabs");

                    settingsUtils.addManifestSettings(oCardManifestSettings);
                    settingsUtils.setVisibilityForFormElements(oCardManifestSettings);
                    this.getView().getModel('visibility').refresh();
                    this.getView().getModel().refresh();
                }
            }
        },

        setCurrentActivePageForCarouselCard : function (iIndex) {
            var dialogCard = this.getView().byId("dialogCard");
            if (dialogCard.getVisible()) {
                var oComponent = dialogCard.getComponentInstance(),
                    oRootControl = oComponent.getRootControl(),
                    oCarousel = oRootControl.byId("pictureCarousel");
                if (oCarousel) {
                    var aPages = oCarousel.getPages(),
                        newActivePage = aPages[iIndex];
                    oCarousel.setActivePage(newActivePage);
                }
            }
        },

        onSelectionChange : function (oEvent) {
            var oSource = oEvent.getSource(),
                oModel = oSource.getModel(),
                aStaticContent = oModel.getData().staticContent,
                oSelectedItem = oSource.getSelectedItem(),
                oSelectedItemData = oSelectedItem.getBindingContext().getObject(),
                oVisibilityModel = oSource.getModel("visibility");
            for (var i = 0; i < aStaticContent.length; i++) {
                if (aStaticContent[i].id === oSelectedItemData.id) {
                    oVisibilityModel.setProperty("/moveToTheTop", !(aStaticContent.length === 1 || i === 0));
                    oVisibilityModel.setProperty("/moveUp", !(aStaticContent.length === 1 || i === 0));
                    oVisibilityModel.setProperty("/moveDown", !(aStaticContent.length === 1 || i === (aStaticContent.length - 1)));
                    oVisibilityModel.setProperty("/moveToTheBottom", !(aStaticContent.length === 1 || i === (aStaticContent.length - 1)));
                    oVisibilityModel.setProperty("/delete", true);
                    oModel.setProperty("/selectedItemIndex", i);
                    oVisibilityModel.refresh(true);

                    // Setting the Active Page in Case of Carousel Card
                    if (oEvent.getParameter("listItem")) {
                        this.setCurrentActivePageForCarouselCard(i);
                    }

                    break;
                }
            }
        },

        handleErrorForProperty : function (oCardPropertiesModel, sPath, sContextPath) {
            oCardPropertiesModel.firePropertyChange({
                context: oCardPropertiesModel.getContext(sContextPath ? sContextPath : "/"),
                path: sPath,
                value: oCardPropertiesModel.getProperty(sContextPath ? (sContextPath + "/" + sPath) : sPath),
                reason: sap.ui.model.ChangeReason.Change
            });
        },

        handleErrorHandling : function (oCardPropertiesModel, sPath, sContextPath) {
            var aProperty = oCardPropertiesModel.getProperty(sContextPath);

            // Clean up all the error's for sPath before adding new one's for the same sContextPath
            oCardPropertiesModel.firePropertyChange({
                context: oCardPropertiesModel.getContext(sContextPath),
                path: sContextPath + "," + sPath,
                value: oCardPropertiesModel.getProperty(sContextPath),
                reason: sap.ui.model.ChangeReason.Change
            });

            for (var i = 0; i < aProperty.length; i++) {
                var sCurrentContextPath = sContextPath + "/" + i;
                oCardPropertiesModel.firePropertyChange({
                    context: oCardPropertiesModel.getContext(sCurrentContextPath),
                    path: sPath,
                    value: oCardPropertiesModel.getProperty(sCurrentContextPath + "/" + sPath),
                    reason: sap.ui.model.ChangeReason.Change
                });
            }
        },

        setEnablePropertyForResetAndSaveButton : function (bEnabled) {
            settingsUtils.enableResetButton(bEnabled);
            settingsUtils.enableSaveButton(bEnabled);
        },

        getValueInRemString : function (iValue) {
            return iValue + 'rem';
        },

        _getSelectedItemIndex : function (oModel) {
            return oModel.getProperty("/selectedItemIndex");
        },

        _getLastItemIndex : function (oModel) {
            return this._getStaticContentArray(oModel).length - 1;
        },

        _getStaticContentArray : function (oModel) {
            return oModel.getProperty("/staticContent");
        },

        _setStaticContentArray : function (oModel, aStaticContent) {
            oModel.setProperty("/staticContent", aStaticContent);
        },

        _setSelectedItemAndScrollToElement : function (iIndex, bHaveDelegate) {
            var oView = this.getView(),
                oList = oView.byId("sapOvpStaticLinkListLineItem"),
                oScrollContainer = oView.byId("scrollContainer"),
                oCardPropertiesModel = oView.getModel();

            // Handling errors for Link title and Static Link
            this.handleErrorHandling(oCardPropertiesModel, "title", "/staticContent");
            this.handleErrorHandling(oCardPropertiesModel, "targetUri", "/staticContent");

            var oItem = oList.getItems()[iIndex];
            if (bHaveDelegate) {
                this._oList = oList;
                this._oItem = oItem;
                this._oScrollContainer = oScrollContainer;
                var oDelegateOnAfter = {
                    onAfterRendering: function (oEvent) {
                        this._oList.removeEventDelegate(this._oDelegateOnAfter);
                        this._oScrollContainer.scrollToElement(this._oItem);
                        delete this._oDelegateOnAfter;
                        delete this._oList;
                        delete this._oScrollContainer;
                        delete this._oItem;
                    }
                };
                this._oDelegateOnAfter = oDelegateOnAfter;
                oList.addEventDelegate(oDelegateOnAfter, this);
            } else {
                oScrollContainer.scrollToElement(oItem);
            }
            oList.setSelectedItem(oItem);
            oList.fireSelectionChange();
        },

        _arrangeStaticContent : function (oModel, iFrom, iTo) {
            var aStaticContent = this._getStaticContentArray(oModel);
            // Change Position
            aStaticContent.splice(iTo, 0, aStaticContent.splice(iFrom, 1)[0]);
            this._setStaticContentArray(oModel, aStaticContent);
            this._setSelectedItemAndScrollToElement(iTo);
        },

        _filterTable : function (oEvent, aFields, sId) {
            var sQuery = oEvent.getParameter("query"),
                oGlobalFilter = null,
                aFilters = [];

            for (var i = 0; i < aFields.length; i++) {
                aFilters.push(new Filter(aFields[i], FilterOperator.Contains, sQuery));
            }

            if (sQuery) {
                oGlobalFilter = new Filter(aFilters, false);
            }

            this.getView().byId(sId).getBinding("items").filter(oGlobalFilter, "Application");
        },

        filterLinksTable : function (oEvent) {
            this._filterTable(oEvent, ["name", "value"], "tableFilterLinks");
        },

        filterIconTable : function (oEvent) {
            this._filterTable(oEvent, ["Icon", "Name"], "tableFilter");
        },

        filterImageTable : function (oEvent) {
            this._filterTable(oEvent, ["Name"], "tableFilterImage");
        },

        getIndexFromIdForStaticLinkList : function (sId) {
            var aSplitIds = sId.split("-");
            return aSplitIds[aSplitIds.length - 1];
        },

        _createLabel : function (sHeaderPath) {
            return new sap.m.Label({
                text : sHeaderPath
            });
        },

        _createIcon : function (sContentRowPath) {
            return new sap.ui.core.Icon({
                src : "{" + sContentRowPath + "}"
            });
        },

        _createImage : function (sContentRowPath) {
            return new sap.m.Image({
                src : "{" + sContentRowPath + "}",
                width: "3rem",
                height: "3rem"
            });
        },

        _createText : function (sContentRowPath) {
            return new sap.m.Text({
                text : "{" + sContentRowPath + "}"
            });
        },

        _createColumnHeader : function (sPath) {
            return new sap.m.Column({
                header : [
                    this._createLabel(sPath)
                ]
            });
        },

        _createColumnCells : function (oTable, sPath, sId) {
            var aColumnCells;
            if (sId === "tableFilterImage") {
                aColumnCells = [
                    this._createImage("Image"),
                    this._createText("Name")
                ];
            } else if (sId === "tableFilterLinks") {
                aColumnCells = [
                    this._createText("name"),
                    this._createText("value")
                ];
            } else {
                aColumnCells = [
                    this._createIcon("Icon"),
                    this._createText("Name")
                ];
            }
            oTable.bindItems("/" + sPath, new sap.m.ColumnListItem({
                cells : aColumnCells
            }));
        },

        _addColumnHeader : function (oTable, sId) {
            if (sId === "tableFilterImage") {
                oTable.addColumn(this._createColumnHeader("Image"));
                oTable.addColumn(this._createColumnHeader("Name"));
            } else {
                oTable.addColumn(this._createColumnHeader("Icon"));
                oTable.addColumn(this._createColumnHeader("Name"));
            }
        },

        _getColumnHeader : function (sId) {
            if (sId === "tableFilterImage") {
                return [
                    this._createColumnHeader("Image"),
                    this._createColumnHeader("Name")
                ];
            } else if (sId === "tableFilterLinks") {
                return [
                    this._createColumnHeader("Application Name"),
                    this._createColumnHeader("Technical Name")
                ];
            } else {
                return [
                    this._createColumnHeader("Icon"),
                    this._createColumnHeader("Name")
                ];
            }
        },

        /*Creating the Table*/
        _createTable : function (sId, fSearchHandler) {
            return new sap.m.Table({
                id : this.getView().getId() + "--" + sId,
                mode : sap.m.ListMode.SingleSelectLeft,
                inset : false,
                fixedLayout : false,
                headerToolbar : new sap.m.Toolbar({
                    content: [
                        new sap.m.ToolbarSpacer({
                            width: "60%"
                        }),
                        new sap.m.SearchField({
                            placeholder: "Search",
                            search: fSearchHandler.bind(this)
                        })
                    ]
                }),
                columns :  this._getColumnHeader(sId)
            });
        },

        _getImageData : function () {
            var aImageItemList = [];

            aImageItemList.push({
                'Name': 'AW.png',
                'Image': sap.ovp.cards.linklist.AnnotationHelper.formUrl(this.getView().getModel().getProperty('/baseUrl'), 'img/AW.png')
            });

            return aImageItemList;
        },

        _getIconData : function (sIconUri) {
            var oIconPool = sap.ui.core.IconPool,
                aIcons = oIconPool.getIconNames(),
                aItemList = [];

            if (sIconUri) {
                var sName = sIconUri.split("://")[1],
                    iIndex = aIcons.indexOf(sName);
                aIcons.splice(iIndex, 1);
                aItemList.push({
                    'Name': sName,
                    'Icon': oIconPool.getIconURI(sName)
                });
            }

            for (var i = 0; i < aIcons.length; i++) {
                aItemList.push({
                    'Name': aIcons[i],
                    'Icon': oIconPool.getIconURI(aIcons[i])
                });
            }

            return aItemList;
        },

        _getLinkListItemId : function (oModel, iIndex) {
            return oModel.getProperty("/staticContent/" + iIndex + "/index");
        },

        _makeLinkListItemId : function (iIndex) {
            return "linkListItem--" + iIndex;
        },

        _makeLinkListItemIndex : function (iIndex) {
            return "Index--" + iIndex;
        },

        getIconAndImageDataModel : function (sIconUri) {
            /*Setting model to the table row*/
            return new sap.ui.model.json.JSONModel({
                'Icons': this._getIconData(sIconUri),
                'Images': []
            });
        },

        getSubHeader : function () {
            var oIconTabBar = new sap.m.IconTabBar({
                selectedKey: "ICON",
                select: function (oEvent) {
                    //Code for tab change goes here
                    var sKey = oEvent.getParameter("key");
                    if (sKey === "IMAGE") {
                        this.valueHelpDialog.setTable(this._oTableImage);
                        if (typeof this._oTableImage.getColumns === "function" && this._oTableImage.getColumns().length === 0) {
                            this._addColumnHeader(this._oTableImage, "tableFilterImage");
                        }
                    } else {
                        this.valueHelpDialog.setTable(this._oTable);
                        if (typeof this._oTable.getColumns === "function" && this._oTable.getColumns().length === 0) {
                            this._addColumnHeader(this._oTable, "tableFilter");
                        }
                    }
                }.bind(this)
            });
            var aTabs = ["ICON", "IMAGE"];
            for (var i = 0; i < aTabs.length; i++) {
                var iconTabFilter = new sap.m.IconTabFilter({
                    text: aTabs[i],
                    key: aTabs[i]
                });
                oIconTabBar.addItem(iconTabFilter);
            }
            return new sap.m.Toolbar({
                content: [
                    oIconTabBar
                ]
            });
        },

        destroyTemplatesAndObjects : function () {
            var oView = this.getView();
            var oTableFilterImage = oView.byId("tableFilterImage");
            if (oTableFilterImage) {
                oTableFilterImage.destroy();
            }
            var oTableFilter = oView.byId("tableFilter");
            if (oTableFilter) {
                oTableFilter.destroy();
            }
            var oTableFilterLinks = oView.byId("tableFilterLinks");
            if (oTableFilterLinks) {
                oTableFilterLinks.destroy();
            }
            delete this._oEvent;
            delete this._iCurrentRow;
            delete this._oModel;
            delete this._oVisibilityModel;
        },

        onExternalUrlChange : function (oEvent) {
            this.setEnablePropertyForResetAndSaveButton(true);
        },

        onLinkSourceChange : function (oEvent) {
            var oSource = oEvent.getSource(),
                oModel = oSource.getModel(),
                oVisibilityModel = oSource.getModel("visibility"),
                iIndex = this.getIndexFromIdForStaticLinkList(oSource.getId()),
                iSelectedIndex = oEvent.getParameter("selectedIndex"),
                oStaticLink = oVisibilityModel.getProperty("/staticLink"),
                oLinks = oVisibilityModel.getProperty("/links"),
                sId = this._getLinkListItemId(oModel, parseInt(iIndex, 10));

            if (iSelectedIndex === 0) {
                oStaticLink[sId] = false;
                oLinks[sId] = true;
                oModel.setProperty("/staticContent/" + iIndex + "/targetUri", undefined);
            } else {
                oStaticLink[sId] = true;
                oLinks[sId] = false;
                oModel.setProperty("/staticContent/" + iIndex + "/semanticObject", undefined);
                oModel.setProperty("/staticContent/" + iIndex + "/action", undefined);
                oModel.setProperty("/staticContent/" + iIndex + "/targetUri", "");
            }
            oVisibilityModel.setProperty("/staticLink", oStaticLink);
            oVisibilityModel.setProperty("/links", oLinks);
            oVisibilityModel.refresh(true);
            oModel.refresh(true);
            this.handleErrorForProperty(oModel, "targetUri", "/staticContent/" + iIndex);
            this.setEnablePropertyForResetAndSaveButton(true);
        },

        onRemoveVisualPress : function (oEvent) {
            var oSource = oEvent.getSource(),
                oModel = oSource.getModel(),
                oVisibilityModel = oSource.getModel("visibility"),
                iIndex = this.getIndexFromIdForStaticLinkList(oSource.getId()),
                sId = this._getLinkListItemId(oModel, parseInt(iIndex, 10)),
                oRemoveVisual = oVisibilityModel.getProperty("/removeVisual");

            oRemoveVisual[sId] = false;
            oVisibilityModel.setProperty("/removeVisual", oRemoveVisual);
            oVisibilityModel.refresh(true);
            oModel.setProperty("/staticContent/" + iIndex + "/imageUri", undefined);
            oModel.refresh(true);
            this.updateCard(oEvent, "sapOvpSettingsStaticLinkListRemoveVisual");
        },

        createValueHelpDialogForInternalUrl : function (oEvent) {
            var oSource = oEvent.getSource(),
                oModel = oSource.getModel(),
                oExtraStaticCardPropertiesModel = oSource.getModel("staticCardProperties"),
                oVisibilityModel = oSource.getModel("visibility"),
                iIndex = this.getIndexFromIdForStaticLinkList(oSource.getId());

            this._oEvent = jQuery.extend({}, oEvent);
            this._iCurrentRow = iIndex;
            this._oModel = oModel;
            this._oVisibilityModel = oVisibilityModel;

            /*Creating the Table*/
            var oTable = this._createTable("tableFilterLinks", this.filterLinksTable);

            /*Data to Show in Table*/
            /*Setting model to the table row*/
            oTable.setModel(oExtraStaticCardPropertiesModel);

            this._createColumnCells(oTable, "links", "tableFilterLinks");
            this._oTable = oTable;

            /*Creating the value Help Dialog*/
            this.valueHelpDialog = new ValueHelpDialog({
                title: "Application",
                contentWidth: "100%",
                contentHeight: this.getValueInRemString(settingsUtils.iContentHeightForDialog),
                supportMultiselect: false,
                ok: function (oEvent) {
                    var oSelectedItem = this._oTable.getSelectedItem(),
                        sIntent = oSelectedItem.getBindingContext().getProperty("value"),
                        aIntentParts = sIntent.slice(1).split("-"),
                        sSemanticObject = aIntentParts[0],
                        sAction = aIntentParts[1];

                    this._oModel.setProperty("/staticContent/" + this._iCurrentRow + "/semanticObject", sSemanticObject);
                    this._oModel.setProperty("/staticContent/" + this._iCurrentRow + "/action", sAction);
                    this._oModel.refresh(true);
                    this.setEnablePropertyForResetAndSaveButton(true);
                    this.destroyTemplatesAndObjects();
                    this.valueHelpDialog.close();
                }.bind(this)
            });

            this.valueHelpDialog.addStyleClass("sapOvpSettingsDialogBox");

            this.valueHelpDialog.attachCancel(function() {
                this.destroyTemplatesAndObjects();
                this.valueHelpDialog.close();
            }.bind(this));
            this.valueHelpDialog.setTable(oTable);

            /*Preselecting the table item*/
            oTable.setSelectedItem(oTable.getItems()[0]);

            this.valueHelpDialog.open();
        },

        onChangeVisualPress : function (oEvent) {
            var oSource = oEvent.getSource(),
                oModel = oSource.getModel(),
                oVisibilityModel = oSource.getModel("visibility"),
                iIndex = this.getIndexFromIdForStaticLinkList(oSource.getId()),
                sIconUri = oModel.getProperty("/staticContent/" + iIndex + "/imageUri"),
                bNotIcon = sap.ovp.cards.linklist.AnnotationHelper.isImageUrlStaticData(sIconUri);

            this._oEvent = jQuery.extend({}, oEvent);
            this._iCurrentRow = iIndex;
            this._oModel = oModel;
            this._oVisibilityModel = oVisibilityModel;

            /*Creating the Table*/
            var oTable = this._createTable("tableFilter", this.filterIconTable);

            /*Data to Show in Table*/
            /*Setting model to the table row*/
            var oRowsModel = (bNotIcon) ? this.getIconAndImageDataModel() : this.getIconAndImageDataModel(sIconUri);
            oTable.setModel(oRowsModel);

            this._createColumnCells(oTable, "Icons", "tableFilter");
            this._oTable = oTable;

            //oTable.attachSelectionChange(this.updateTheLineItemSelected.bind(this));

            /*Creating the Table*/
            var oTableImage = this._createTable("tableFilterImage", this.filterImageTable);

            oTableImage.setModel(oRowsModel);

            this._createColumnCells(oTableImage, "Images", "tableFilterImage");
            this._oTableImage = oTableImage;

            // subHeader
            var oToolBar = this.getSubHeader();

            /*Creating the value Help Dialog*/
            this.valueHelpDialog = new ValueHelpDialog({
                title: "Visual",
                contentWidth: "100%",
                contentHeight: this.getValueInRemString(settingsUtils.iContentHeightForDialog),
                supportMultiselect: false,
                ok: function (oEvent) {
                    var oTable, sPropertyName,
                        sId = this._getLinkListItemId(this._oModel, parseInt(this._iCurrentRow, 10)),
                        oRemoveVisual = this._oVisibilityModel.getProperty("/removeVisual");

                    oRemoveVisual[sId] = true;
                    this._oVisibilityModel.setProperty("/removeVisual", oRemoveVisual);
                    this._oVisibilityModel.refresh(true);
                    if (this._sTableName === "tableFilterImage") {
                        oTable = this._oTableImage;
                        sPropertyName = "Image";
                    } else {
                        oTable = this._oTable;
                        sPropertyName = "Icon";
                    }
                    var oSelectedItem = oTable.getSelectedItem(),
                        oSelectedItemContext = oSelectedItem.getBindingContext(),
                        sUri = oSelectedItemContext.getProperty(sPropertyName);
                    this._oModel.setProperty("/staticContent/" + this._iCurrentRow + "/imageUri", sUri);
                    this._oModel.refresh(true);
                    this.updateCard(this._oEvent, "sapOvpSettingsStaticLinkListChangeVisual");
                    this.destroyTemplatesAndObjects();
                    this.valueHelpDialog.close();
                }.bind(this)
            });

            this.valueHelpDialog.attachSelectionChange(function (oEvent) {
                var oTableSelectionParams = oEvent.getParameter("tableSelectionParams");

                if (oTableSelectionParams.id.indexOf("tableFilterImage") === -1) {
                    this._sTableName = "tableFilter";
                } else {
                    this._sTableName = "tableFilterImage";
                }
            }.bind(this));

            this.valueHelpDialog.addStyleClass("sapOvpSettingsDialogBox");

            this.valueHelpDialog.attachCancel(function() {
                this.destroyTemplatesAndObjects();
                this.valueHelpDialog.close();
            }.bind(this));
            this.valueHelpDialog.setTable(oTable);
            this.valueHelpDialog.setSubHeader(oToolBar);

            /*Preselecting the table item*/
            oTable.setSelectedItem(oTable.getItems()[0]);

            this.valueHelpDialog.open();

        },

        handleMessagePopoverPress : function (oEvent) {
            settingsUtils.oMessagePopOver.openBy(oEvent.getSource());
        },

        onShowMorePress : function (oEvent) {
            var oSource = oEvent.getSource(),
                oModel = oSource.getModel(),
                oVisibilityModel = oSource.getModel("visibility"),
                iIndex = this.getIndexFromIdForStaticLinkList(oSource.getId()),
                sId = this._getLinkListItemId(oModel, parseInt(iIndex, 10)),
                bShowMore = oVisibilityModel.getProperty("/showMore/" + sId);

            if (bShowMore) {
                oVisibilityModel.setProperty("/showMore/" + sId, false);
            } else {
                oVisibilityModel.setProperty("/showMore/" + sId, true);
            }
            oVisibilityModel.refresh(true);
        },

        onPressDelete : function (oEvent) {
            this._oEvent = jQuery.extend({}, oEvent);
            MessageBox.confirm(
                "Do you want to delete the Line Item",
                {
                    actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                    icon: MessageBox.Icon.INFORMATION,
                    title: "Information",
                    initialFocus: MessageBox.Action.CANCEL,
                    onClose: function(sAction) {
                        if (sAction === "OK") {
                            var oSource = this._oEvent.getSource(),
                                oVisibilityModel = oSource.getModel("visibility"),
                                oModel = oSource.getModel(),
                                aStaticContent = this._getStaticContentArray(oModel),
                                iIndex = this._getSelectedItemIndex(oModel),
                                sId = this._getLinkListItemId(oModel, iIndex),
                                oStaticLink = oVisibilityModel.getProperty("/staticLink"),
                                oLinks = oVisibilityModel.getProperty("/links"),
                                oRemoveVisual = oVisibilityModel.getProperty("/removeVisual"),
                                oShowMore = oVisibilityModel.getProperty("/showMore");

                            delete oStaticLink[sId];
                            delete oLinks[sId];
                            delete oRemoveVisual[sId];
                            delete oShowMore[sId];
                            oVisibilityModel.setProperty("/staticLink", oStaticLink);
                            oVisibilityModel.setProperty("/links", oLinks);
                            oVisibilityModel.setProperty("/removeVisual", oRemoveVisual);
                            oVisibilityModel.setProperty("/showMore", oShowMore);
                            aStaticContent.splice(iIndex, 1);
                            this._setStaticContentArray(oModel, aStaticContent);
                            oModel.refresh(true);
                            if (aStaticContent.length > 0) {
                                this._setSelectedItemAndScrollToElement(Math.min(parseInt(iIndex, 10), aStaticContent.length - 1), true);
                            }
                            if (aStaticContent.length <= 1) {
                                oVisibilityModel.setProperty("/delete", false);
                            }
                            oVisibilityModel.refresh(true);
                            this.updateCard(this._oEvent, "sapOvpSettingsStaticLinkListDelete");
                        }
                        delete this._oEvent;
                    }.bind(this)
                }
            );
        },

        onPressAdd : function (oEvent) {
            var oSource = oEvent.getSource(),
                oVisibilityModel = oSource.getModel("visibility"),
                oModel = oSource.getModel(),
                aStaticContent = this._getStaticContentArray(oModel),
                iLineItemIdCounter = oModel.getProperty("/lineItemIdCounter"),
                sId = this._makeLinkListItemId(iLineItemIdCounter + 1),
                sIndex = this._makeLinkListItemIndex(iLineItemIdCounter + 1),
                oStaticLink = oVisibilityModel.getProperty("/staticLink"),
                oLinks = oVisibilityModel.getProperty("/links"),
                oRemoveVisual = oVisibilityModel.getProperty("/removeVisual"),
                oShowMore = oVisibilityModel.getProperty("/showMore");

            oModel.setProperty("/lineItemIdCounter", iLineItemIdCounter + 1);
            aStaticContent.unshift({
                "id": sId,
                "index": sIndex,
                "title": "Default Title",
                "subTitle": "Default SubTitle",
                "imageUri": "",
                "imageAltText": "",
                "targetUri": "",
                "openInNewWindow": ""
            });
            oStaticLink[sIndex] = true;
            oLinks[sIndex] = false;
            oRemoveVisual[sIndex] = false;
            oShowMore[sIndex] = false;
            oVisibilityModel.setProperty("/staticLink", oStaticLink);
            oVisibilityModel.setProperty("/links", oLinks);
            oVisibilityModel.setProperty("/removeVisual", oRemoveVisual);
            oVisibilityModel.setProperty("/showMore", oShowMore);
            oVisibilityModel.refresh(true);
            this._setStaticContentArray(oModel, aStaticContent);
            oModel.refresh(true);
            this._setSelectedItemAndScrollToElement(0);
            this.updateCard(oEvent, "sapOvpSettingsStaticLinkListAdd");
        },

        onPressMoveToTheTop : function (oEvent) {
            var oModel = oEvent.getSource().getModel();
            this._arrangeStaticContent(oModel, this._getSelectedItemIndex(oModel), 0);
            this.updateCard(oEvent, "sapOvpSettingsStaticLinkListSort");
        },

        onPressMoveUp : function (oEvent) {
            var oModel = oEvent.getSource().getModel(),
                iIndex = this._getSelectedItemIndex(oModel);
            this._arrangeStaticContent(oModel, iIndex, iIndex - 1);
            this.updateCard(oEvent, "sapOvpSettingsStaticLinkListSort");
        },

        onPressMoveDown : function (oEvent) {
            var oModel = oEvent.getSource().getModel(),
                iIndex = this._getSelectedItemIndex(oModel);
            this._arrangeStaticContent(oModel, iIndex, iIndex + 1);
            this.updateCard(oEvent, "sapOvpSettingsStaticLinkListSort");
        },

        onPressMoveToTheBottom : function (oEvent) {
            var oModel = oEvent.getSource().getModel(),
                iIndexFrom = this._getSelectedItemIndex(oModel),
                iIndexTo = this._getLastItemIndex(oModel);
            this._arrangeStaticContent(oModel, iIndexFrom, iIndexTo);
            this.updateCard(oEvent, "sapOvpSettingsStaticLinkListSort");
        },

        onResetButton : function () {
            this._oCardManifestSettings = jQuery.extend(true, {}, this._oOriginalCardManifestSettings);
            var oCardPropertiesModel = this.getView().getModel();
            oCardPropertiesModel.setProperty("/", this._oCardManifestSettings);
            settingsUtils.setVisibilityForFormElements(this._oCardManifestSettings);
            this.getView().getModel('visibility').refresh();

            // Resetting Error Handling
            settingsUtils.resetErrorHandling();

            this.setEnablePropertyForResetAndSaveButton(false);
            this._fCardWithRefresh();
        },

        onSaveButtonPress : function () {
            if (settingsUtils.bError) {
                settingsUtils.oMessagePopOverButton.firePress();
            } else {
                this.createAndSubmitChange.bind(this)();
            }
        },

        setBusy : function (bBusy) {
            if (bBusy) {
//                this.getView().byId("dialogCard").addStyleClass("componentContainerBusy");
                this.getView().addStyleClass("dialogContainerOverlay");
                var dialogCard = this.getView().byId("dialogCard");
                if (dialogCard.getVisible()) {
                    dialogCard.getComponentInstance().getRootControl().setBusy(bBusy);
                }
            } else {
//                this.getView().byId("dialogCard").removeStyleClass("componentContainerBusy");
                this.getView().removeStyleClass("dialogContainerOverlay");
//                this.getView().byId("dialogCard").setBusy(bBusy);
                setTimeout( function(){
                    var dialogCard = this.getView().byId("dialogCard");
                    if (dialogCard.getVisible()) {
                        dialogCard.getComponentInstance().getRootControl().setBusy(bBusy);
                    }
                }.bind(this), 2000);
            }
            
//            this.getView().byId("dialogCard").setBusy(bBusy);

        },

        _fCardWithoutRefresh : function (oEvent, updatedElementProps) {
            var oView = this.getView(),
                oCardManifestSettings = this._oCardManifestSettings,
                oComponentInstance = oView.byId("dialogCard").getComponentInstance(),
                oRootControl = oComponentInstance.getRootControl(),
                oElement, oManifestModel,
                isViewSwitchEnabled = false,
                iSelectedKey;
            if (oCardManifestSettings.tabs && oCardManifestSettings.tabs.length) {
                isViewSwitchEnabled = true;
                iSelectedKey = parseInt(oCardManifestSettings.selectedKey,10);
            }
            if (updatedElementProps.formElementId === "sapOvpSettingsLineItemTitle" ||
                updatedElementProps.formElementId === "sapOvpSettingsLineItemSubTitle") {
                oElement = oRootControl.byId(updatedElementProps.cardElementId + "--" + oView.getModel().getProperty("/lineItemId"));
            } else {
                oElement = oRootControl.byId(updatedElementProps.cardElementId);
                if (!oElement) {
                    this._fCardWithRefresh(oEvent, updatedElementProps.cardElementId);
                }
            }
            switch (updatedElementProps.formElementId) {
                case "sapOvpSettingsLineItemTitle":
                case "sapOvpSettingsLineItemSubTitle":
                case "sapOvpSettingsTitle" :
                case "sapOvpSettingsValueSelectionInfo" :
                    if (oElement) {
                        oElement.setText(oEvent.getSource().getValue());
                    }
                    break;
                case "sapOvpSettingsSubTitle" :
                    var oCardController = oRootControl.getController(),
                        oCardPropertiesModel = oCardController.getCardPropertiesModel();
                    oCardPropertiesModel.setProperty("/subTitle", oEvent.getSource().getValue());
                    oCardController._setSubTitleWithUnitOfMeasure();
                    break;
                case "sapOvpSettingsViewName":
                    var viewName = oCardManifestSettings.viewName;
                    oManifestModel = oView.getModel();
                    oElement.getItems()[iSelectedKey - 1].setText(viewName);
                    oCardManifestSettings.tabs[iSelectedKey - 1].value = viewName;
                    if (oCardManifestSettings.defaultViewSelected === iSelectedKey) {
                        viewName = viewName + " (Default view)";
                    }
                    oCardManifestSettings.aViews[iSelectedKey].text = viewName;
                    oManifestModel.refresh();
                    break;
                case "sapOvpDefaultViewSwitch":
                    if (oEvent.getSource().getState()) {
                        var defaultSelectedKey = oCardManifestSettings.defaultViewSelected;
                        oManifestModel = oView.getModel();
                        oCardManifestSettings.defaultViewSelected = iSelectedKey;
                        oCardManifestSettings.aViews[defaultSelectedKey].text = oCardManifestSettings.tabs[defaultSelectedKey - 1].value;
                        oCardManifestSettings.aViews[iSelectedKey].text += " (Default view)";
                        oManifestModel.refresh();
                        this.defaultViewSwitch = oEvent.getSource();
                        this.defaultViewSwitch.setEnabled(false);
                    }
                    break;
                case "sapOvpSettingsIdentification" :
                    if (isViewSwitchEnabled) {
                        oCardManifestSettings.tabs[iSelectedKey - 1][updatedElementProps.updateProperty] = oCardManifestSettings[updatedElementProps.updateProperty];
                    }
                    break;
                case "sapOvpSettingsKPIHeaderSwitch" :
                    var oVisibilityModel = oView.getModel("visibility"),
                        oVisibilityData = oVisibilityModel.getData();
                    oVisibilityData.dataPoint = false;
                    oVisibilityData.valueSelectionInfo = false;
                    if (isViewSwitchEnabled) {
                        oCardManifestSettings.tabs.forEach(function(tab) {
                            tab.prevDataPointAnnotationPath = tab.dataPointAnnotationPath;
                            tab.dataPointAnnotationPath = undefined;
                        });
                    } else {
                        var sDataPointAnnotationPath = oCardManifestSettings.dataPointAnnotationPath;
                        if (sDataPointAnnotationPath) {
                            oCardManifestSettings.prevDataPointAnnotationPath = sDataPointAnnotationPath;
                        }
                        oCardManifestSettings.dataPointAnnotationPath = undefined;
                    }
                    oVisibilityModel.refresh(true);
                    oElement.destroy();
                    break;
                default :
                    break;
            }
        },

        _fCardWithRefresh : function (oEvent, updateProperty) {
            var sPrevDataPointAnnotationPath,defaultViewSelected,oView,oVisibilityModel,oVisibilityData,
                oCardManifestSettings = this._oCardManifestSettings,
                oSettingDialog = this.getView(),
                oComponentContainer = oSettingDialog.byId('dialogCard'),
                card = oComponentContainer.getComponentInstance().getComponentData(),
                sCardId = card.cardId,
                modelName = card.manifest.cards[sCardId].model,
                oManifest = {
                    cards: {}
                },
                isViewSwitchEnabled = false,
                iSelectedKey;
            if (oCardManifestSettings.tabs && oCardManifestSettings.tabs.length) {
                isViewSwitchEnabled = true;
                /*selectedKey gets set to string from UI select Box*/
                iSelectedKey = parseInt(oCardManifestSettings.selectedKey,10);
            }

            switch (updateProperty) {
                case "subTitleSwitch" :
                    oView = this.getView();
                    oVisibilityModel = oView.getModel("visibility");
                    if (oEvent.getSource().getState()) {
                        if (isViewSwitchEnabled) {
                            defaultViewSelected = oCardManifestSettings.defaultViewSelected;
                            oCardManifestSettings.tabs.forEach(function (tab) {
                                sPrevDataPointAnnotationPath = tab.prevDynamicSubtitleAnnotationPath;
                                if (sPrevDataPointAnnotationPath) {
                                    tab.dynamicSubtitleAnnotationPath = sPrevDataPointAnnotationPath;
                                } else {
                                    tab.dynamicSubtitleAnnotationPath = oCardManifestSettings.dynamicSubTitle[0].value;
                                }
                            });
                            oCardManifestSettings.dynamicSubtitleAnnotationPath = oCardManifestSettings.tabs[defaultViewSelected - 1].dynamicSubtitleAnnotationPath;
                        } else {
                            sPrevDataPointAnnotationPath = oCardManifestSettings.prevDynamicSubtitleAnnotationPath;
                            if (sPrevDataPointAnnotationPath) {
                                oCardManifestSettings.dynamicSubtitleAnnotationPath = sPrevDataPointAnnotationPath;
                            } else {
                                oCardManifestSettings.dynamicSubtitleAnnotationPath = oCardManifestSettings.dynamicSubTitle[0].value;
                            }
                        }
                        oSettingDialog.byId("sapOvpSettingsDynamicSubTitle").setSelectedKey(oCardManifestSettings.dynamicSubtitleAnnotationPath);
                    } else {
                        if (isViewSwitchEnabled) {
                            oCardManifestSettings.tabs.forEach(function(tab) {
                                tab.prevDynamicSubtitleAnnotationPath = tab.dynamicSubtitleAnnotationPath;
                                tab.dynamicSubtitleAnnotationPath = undefined;
                            });
                            oCardManifestSettings.dynamicSubtitleAnnotationPath = undefined;
                        } else {
                            var sDataPointAnnotationPath = oCardManifestSettings.dynamicSubtitleAnnotationPath;
                            if (sDataPointAnnotationPath) {
                                oCardManifestSettings.prevDynamicSubtitleAnnotationPath = sDataPointAnnotationPath;
                            }
                            oCardManifestSettings.dynamicSubtitleAnnotationPath = undefined;
                        }
                    }
                    oVisibilityModel.setProperty("/subTitle",
                        settingsUtils.getVisibilityOfElement(oCardManifestSettings, 'subTitle', isViewSwitchEnabled));
                    oVisibilityModel.setProperty("/dynamicSubTitle",
                        settingsUtils.getVisibilityOfElement(oCardManifestSettings, 'dynamicSubTitle', isViewSwitchEnabled)
                        && !!oCardManifestSettings["dynamicSubTitle"] && !!oCardManifestSettings["dynamicSubTitle"].length);
                    oVisibilityModel.refresh(true);
                    break;
                case "kpiHeader" :
                    oView = this.getView();
                    oVisibilityModel = oView.getModel("visibility");
                    oVisibilityData = oVisibilityModel.getData();
                    oVisibilityData.valueSelectionInfo = true;
                    oVisibilityData.dataPoint = true;
                    if (oCardManifestSettings.tabs && oCardManifestSettings.tabs.length ) {
                        oVisibilityData.dataPoint = settingsUtils.getVisibilityOfElement(oCardManifestSettings, 'dataPoint', true);
                    }
                    if (!oCardManifestSettings.valueSelectionInfo) {
                        oCardManifestSettings.valueSelectionInfo = " ";
                    }
                    if (isViewSwitchEnabled) {
                        defaultViewSelected = oCardManifestSettings.defaultViewSelected;
                        oCardManifestSettings.tabs.forEach(function (tab) {
                            sPrevDataPointAnnotationPath = tab.prevDataPointAnnotationPath;
                            if (sPrevDataPointAnnotationPath) {
                                tab.dataPointAnnotationPath = sPrevDataPointAnnotationPath;
                            } else {
                                tab.dataPointAnnotationPath = oCardManifestSettings.dataPoint[0].value;
                            }
                        });
                        oCardManifestSettings.dataPointAnnotationPath = oCardManifestSettings.tabs[defaultViewSelected - 1].dataPointAnnotationPath;
                    } else {
                        sPrevDataPointAnnotationPath = oCardManifestSettings.prevDataPointAnnotationPath;
                        if (sPrevDataPointAnnotationPath) {
                            oCardManifestSettings.dataPointAnnotationPath = sPrevDataPointAnnotationPath;
                        } else {
                            oCardManifestSettings.dataPointAnnotationPath = oCardManifestSettings.dataPoint[0].value;
                        }
                    }
                    oVisibilityModel.refresh(true);
                    break;
                case "listType" :
                    oCardManifestSettings[updateProperty] = (oEvent.getSource().getState()) ? "extended" : "condensed";
                    break;
                case "listFlavor" :
                    oCardManifestSettings[updateProperty] = (oEvent.getSource().getState()) ? "bar" : "";
                    break;
                case "sortBy" :
                    oView = this.getView();
                    oVisibilityModel = oView.getModel("visibility");
                    oVisibilityData = oVisibilityModel.getData();
                    if (!!oCardManifestSettings.sortBy !== oVisibilityData.sortOrder ) {
                        oVisibilityData.sortOrder = !!oCardManifestSettings.sortBy;
                        oVisibilityModel.refresh();
                    }
                    break;
                case "listFlavorForLinkList":
                case "sortOrder":
                    break;
                case "annotationPath":
                case "chartAnnotationPath":
                case "presentationAnnotationPath":
                case "selectionAnnotationPath":
                case "dynamicSubtitleAnnotationPath":
                case "dataPointAnnotationPath":
                    if (isViewSwitchEnabled) {
                        oCardManifestSettings.tabs[iSelectedKey - 1][updateProperty] = oCardManifestSettings[updateProperty];
                    }
                    break;
                case "ovpHeaderTitle":
                case "add":
                case "removeVisual":
                case "changeVisual":
                case "sort":
                case "delete":
                    break;
                default :
                    break;
            }
            oManifest.cards[sCardId] = {
                model: modelName,
                template: card.template,
                settings: oCardManifestSettings
            };

            this.setBusy(true);
            var oPromise = OVPCardAsAPIUtils.createCardComponent(oSettingDialog, oManifest, 'dialogCard');
            oPromise.then(function(){
                this.setBusy(false);

                var oList = this.getView().byId("sapOvpStaticLinkListLineItem");
                if (oList) {
                    var oItem = oList.getSelectedItem();
                    if (oItem) {
                        var sId = oItem.getId(),
                            iIndex = this.getIndexFromIdForStaticLinkList(sId);
                        // Setting the Active Page in Case of Carousel Card
                        this.setCurrentActivePageForCarouselCard(iIndex);
                    }
                }
            }.bind(this));
            oPromise.catch(function(){
                this.setBusy(false);
            }.bind(this));
        },

        updateCard : function(oEvent, sId) {
            /*Reset Card Level Button*/
            var oCardManifestSettings = this._oCardManifestSettings,
                dialogCard = this.getView().byId("dialogCard");
            this.setEnablePropertyForResetAndSaveButton(true);
            if (dialogCard.getVisible()) {
                /*Reset View Level Button*/
                if (oCardManifestSettings.tabs && oCardManifestSettings.tabs.length) {
                    /*selectedKey gets set to string from UI select Box*/
                    var iSelectedKey = parseInt(oCardManifestSettings.selectedKey, 10);
                    oCardManifestSettings.isViewResetEnabled = true;
                    oCardManifestSettings.aViews[iSelectedKey].isViewResetEnabled = true;
                }
                var oSource = oEvent.getSource(),
                    sourceElementId = (sId) ? sId : oSource.getId(),
                    bCardWithoutRefresh = false;
                if (sourceElementId.indexOf("sapOvpStaticLinkListLineItem") !== -1) {
                    var oCardPropertiesModel = oSource.getModel(),
                        aStaticContent = oCardPropertiesModel.getData().staticContent,
                        iIndex = this.getIndexFromIdForStaticLinkList(sourceElementId);

                    // Setting the Active Page in Case of Carousel Card
                    this.setCurrentActivePageForCarouselCard(iIndex);

                    oCardPropertiesModel.setProperty("/lineItemId", aStaticContent[iIndex].id);
                    if (sourceElementId.indexOf("sapOvpSettingsLineItemTitle") !== -1) {
                        sourceElementId = "sapOvpSettingsLineItemTitle";
                    } else if (sourceElementId.indexOf("sapOvpSettingsLineItemSubTitle") !== -1) {
                        sourceElementId = "sapOvpSettingsLineItemSubTitle";
                    }
                }
                for (var i = 0; i < this._aRefreshNotRequired.length; i++) {
                    if (sourceElementId.indexOf(this._aRefreshNotRequired[i].formElementId) > -1) {
                        if (this._aRefreshNotRequired[i].isKpiSwitch && oEvent.getSource().getState()) {
                            break;
                        }
                        this._fCardWithoutRefresh(oEvent, this._aRefreshNotRequired[i]);
                        bCardWithoutRefresh = true;
                        break;
                    }
                }
                if (!bCardWithoutRefresh) {
                    for (var j = 0; j < this._aRefreshRequired.length; j++) {
                        if (sourceElementId.indexOf(this._aRefreshRequired[j].formElementId) > -1) {
                            this.setBusy(true);
                            this._fCardWithRefresh(oEvent, this._aRefreshRequired[j].updateProperty);
                            break;
                        }
                    }
                }
            }
        },
        onExit: function () {
            settingsUtils.oSaveButton.detachPress(this.onSaveButtonPress,this);
            settingsUtils.oResetButton.detachPress(this.onResetButton,this);
            settingsUtils.oMessagePopOverButton.detachPress(this.handleMessagePopoverPress, this);
        },
        updateTheLineItemSelected: function (event) {
            /*Getting the Value from the value seleciton info dialog*/
            var selectedItem = event.getSource().getSelectedItem().getBindingContext().getObject().Qualifier,
                oCardManifestSettings = this._oCardManifestSettings,
            /*selectedKey gets set to string from UI select Box*/
                iSelectedKey;
            if (oCardManifestSettings.tabs && oCardManifestSettings.tabs.length) {
                iSelectedKey = parseInt(oCardManifestSettings.selectedKey,10);
            }
            /*Updating the selected values to the Model*/
            oCardManifestSettings.lineItemQualifier = selectedItem;
            oCardManifestSettings.annotationPath = 'com.sap.vocabularies.UI.v1.LineItem#' + selectedItem;
            if (selectedItem === 'Default') {
                oCardManifestSettings.annotationPath = 'com.sap.vocabularies.UI.v1.LineItem';
            }
            if (oCardManifestSettings.tabs && oCardManifestSettings.tabs.length) {
                oCardManifestSettings.tabs[iSelectedKey - 1].annotationPath =
                    oCardManifestSettings.annotationPath;
            }
            /*Updating the Value to lineItem Input*/
            this.getView().byId("sapOvpSettingsLineItem").setValue(selectedItem);

            /*Updating the card view*/
            this._fCardWithRefresh(event,'annotationPath');
            /*Reset Card Level Button*/
            this.setEnablePropertyForResetAndSaveButton(true);
            /*Reset View Level Button*/
            if (oCardManifestSettings.tabs && oCardManifestSettings.tabs.length) {
                oCardManifestSettings.isViewResetEnabled = true;
                oCardManifestSettings.aViews[iSelectedKey].isViewResetEnabled = true;
            }
            this.valueHelpDialog.close();
        },
        getListItems : function() {
            /*Getting the  iContext for sap.ovp.annotationHelper Function*/
            var aItemList = [],
                oCardManifestSettings = this._oCardManifestSettings,
                oSettingDialog = this.getView(),
                oComponentContainer = oSettingDialog.byId('dialogCard'),
                card = oComponentContainer.getComponentInstance().getComponentData(),
                lineItemBindingPath = oCardManifestSettings.entityType.$path + '/' + oCardManifestSettings.annotationPath,
                oModel = card.model.getMetaModel(),
                iContext = oModel.getContext(oModel.resolve(lineItemBindingPath, this.oView.getBindingContext()));

            /*Forming Visible Fields String*/
            ////For Condensed List
            var maxDataFields = 2,
                maxDataPoints = 1,
                noOfDataFieldsReplaceableByDataPoints = 0;
            if (oCardManifestSettings.listFlavor === 'bar') {
                //For Condensed List  Bar Card :- Max Data Fields = 2 and Max DataPoints = 1 and Replaceable fields are 0
                maxDataFields = 1;
                maxDataPoints = 2;
            }

            if (oCardManifestSettings.listType && oCardManifestSettings.listType.toLowerCase() === 'extended') {
                //For Extended List Card :- Max Data Fields = 6 and Max DataPoints =  and Replaceable fields are 0
                maxDataFields = 6;
                maxDataPoints = 3;
                noOfDataFieldsReplaceableByDataPoints = 3;
                if (oCardManifestSettings.listFlavor === 'bar') {
                    //For Extended Bar List Card
                    maxDataFields = 5;
                }
            } else if (oCardManifestSettings.contentFragment === "sap.ovp.cards.table.Table") {
                //For Table Card Max Data :- Fields = 3 and Max DataPoints = 1 and Replaceable fields are 1
                maxDataFields = 3;
                maxDataPoints = 1;
                noOfDataFieldsReplaceableByDataPoints = 1;
            }
            oCardManifestSettings.lineItem.forEach(function (lineItem) {
                var aDataPointsObjects = sap.ovp.cards.AnnotationHelper.getSortedDataPoints(iContext,lineItem.fields),
                    aDataFieldsObjects = sap.ovp.cards.AnnotationHelper.getSortedDataFields(iContext,lineItem.fields),
                    dataFields = [],
                    dataPoints = [];
                aDataPointsObjects.forEach(function (fields) {
                    if (fields.Title) {
                        dataPoints.push(fields.Title.String);
                    }
                });
                aDataFieldsObjects.forEach(function (fields) {
                    if (fields.Label) {
                        dataFields.push(fields.Label.String);
                    }
                });
                var noOfDataPointsUsed = Math.min(dataPoints.length, maxDataPoints),
                    noOfDataPointsOccupyingDataFieldsSpace = Math.min(noOfDataFieldsReplaceableByDataPoints,noOfDataPointsUsed),
                    visibleField = dataFields.slice(0, maxDataFields - noOfDataPointsOccupyingDataFieldsSpace)
                        .concat(dataPoints.slice(0, noOfDataPointsUsed));
                visibleField.map(function(field){
                    return field.charAt(0).toUpperCase() + field.substr(1);
                });
                aItemList.push({
                    Qualifier: lineItem.name,
                    VisibleFields: visibleField.toString()
                });
            });
            return aItemList;
        },
        openLineItemValueHelpDialog: function(oEvent) {
            /*Creating the Table*/
            var oTable = new sap.m.Table({
                mode : sap.m.ListMode.SingleSelectLeft,
                inset : false,
                fixedLayout : false,
                columns : [
                    new sap.m.Column({
                        header :[
                            new sap.m.Label({
                                text : this.oOvpResourceBundle && this.oOvpResourceBundle.getText('OVP_KEYUSER_LINEITEM_QUAL')
                            }) ]
                    }),
                    new sap.m.Column({
                        header :[
                            new sap.m.Label({
                                text : this.oOvpResourceBundle && this.oOvpResourceBundle.getText("OVP_KEYUSER_VISIBLE_FIELDS")
                            }) ]
                    })
                ]
            });
            oTable.bindItems("/", new sap.m.ColumnListItem({
                cells : [ new sap.m.Text({text : "{Qualifier}"}),
                    new sap.m.Text({text : "{VisibleFields}"})
                ]
            }));
            oTable.attachSelectionChange(this.updateTheLineItemSelected.bind(this));


            /*Creating the value Help Dialog*/
            this.valueHelpDialog = new ValueHelpDialog({
                title: this.oOvpResourceBundle && this.oOvpResourceBundle.getText("OVP_KEYUSER_LINEITEM_ANNO"),
                contentWidth: "100%",
                contentHeight: this.getValueInRemString(settingsUtils.iContentHeightForDialog + 0.125),
                supportMultiselect: false
            });
            this.valueHelpDialog.attachCancel(function() {
                this.valueHelpDialog.close();
            }.bind(this));
            this.valueHelpDialog.setTable(oTable);

            this.valueHelpDialog.addStyleClass("sapOvpSettingsDialogBox");

            /*Data to Show in Table*/
            this.aItemList = this.getListItems();

            /*Setting model to the table row*/
            var oRowsModel = new sap.ui.model.json.JSONModel();
            oRowsModel.setData(this.aItemList);
            this.valueHelpDialog.getTable().setModel(oRowsModel);

            /*Preselecting the table item*/
            oTable.getItems().forEach(function(item) {
                if (item.getBindingContext().getObject().Qualifier === this._oCardManifestSettings.lineItemQualifier) {
                    item.setSelected(true);
                }
            }.bind(this));

            this.valueHelpDialog.open();

        },

        createAndSubmitChange : function() {
            var oPayLoad = PayLoadUtils.getPayLoadForEditCard.bind(this)(settingsUtils);
            this.settingsResolve(oPayLoad);
            settingsUtils.dialogBox.close();
        }

    });
});
