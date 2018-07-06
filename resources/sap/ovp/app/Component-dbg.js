sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/model/odata/AnnotationHelper", "sap/ovp/cards/rta/SettingsDialogConstants",
        "sap/ui/rta/RuntimeAuthoring"],

    function (UIComponent, AnnotationHelper, SettingsDialogConstants) {
        "use strict";
        // We need to require RuntimeAuthoring 'sap.ui.rta.RuntimeAuthoring' in the very beginning to be able to personalize.
        // Without RuntimeAuthoring at this point or maybe a little later but not too late, for instance, in Main controller,
        // the change handler will not be called by sap.ui.fl

        return UIComponent.extend("sap.ovp.app.Component", {

            // use inline declaration instead of component.json to save 1 round trip
            metadata: {
                routing: {
                    config: {
                        routerClass: sap.ui.core.routing.Router
                    },
                    targets: {},
                    routes: []
                },

                properties: {
                    "cardContainerFragment": {
                        "type": "string",
                        "defaultValue": "sap.ovp.app.CardContainer"
                    },
                    "dashboardLayoutUtil": {
                        "type": "sap.ovp.ui.DashboardLayoutUtil"
                    }
                },

                version: "1.54.4",

                library: "sap.ovp.app",

                dependencies: {
                    libs: [],
                    components: []
                },
                config: {
                    fullWidth: true,
                    hideLightBackground: true
                }
            },

            _addModelsMeasurements: function () {
                var oModels = this.oModels;
                var oModel, sModel;
                for (sModel in oModels) {
                    oModel = this.getModel(sModel);
                    if (oModel.getMetaModel()) {
                        this._addModelMeasurements(oModel, sModel);
                    }
                }
            },

            _addModelMeasurements: function (oModel, sModel) {
                var sId = "ovp:ModelLoading-" + sModel;
                var sIdBatch = "ovp:ModelBatchCall-" + sModel + ":";
                jQuery.sap.measure.start(sId, "Component createContent -> MetaData loaded", "ovp");
                var getMetaModelPromise = oModel.getMetaModel().loaded();
                getMetaModelPromise.then(function () {
                    jQuery.sap.measure.end(sId);
                });
                oModel.attachBatchRequestSent(function (oEvent) {
                    jQuery.sap.measure.start(sIdBatch + oEvent.getParameter("ID"), "BatchRequestSent -> BatchRequestCompleted", "ovp");
                });
                oModel.attachBatchRequestCompleted(function (oEvent) {
                    jQuery.sap.measure.end(sIdBatch + oEvent.getParameter("ID"));
                });
            },

            /**
             * @param {string} sCardId - Id of the card for which config is needed
             * @returns {object} - Configuration of card for named sCardId
             */
            _getOvpCardOriginalConfig: function (sCardId) {
                var oOvpConfig = this.getOvpConfig();
                return oOvpConfig.cards[sCardId];
            },

            /**
             * get the merged sap.ovp section from all component hierarchy
             * @returns merged sap.ovp section from manifes files
             */
            getOvpConfig: function () {
                var oOvpConfig;
                var aExtendArgs = [];
                var oManifest = this.getMetadata();
                //loop over the manifest hierarchy till we reach the current generic component
                while (oManifest && oManifest.getComponentName() !== "sap.ovp.app") {
                    oOvpConfig = oManifest.getManifestEntry("sap.ovp");
                    if (oOvpConfig) {
                        //as the last object is the dominant one we use unshift and not push
                        aExtendArgs.unshift(oOvpConfig);
                    }
                    oManifest = oManifest.getParent();
                }
                //add an empty object for the merged config as we don't whant to change the actual manifest objects
                aExtendArgs.unshift({});
                //add deep flag so the merge would be recurcive
                aExtendArgs.unshift(true);
                oOvpConfig = jQuery.extend.apply(jQuery, aExtendArgs);
                return oOvpConfig;
            },

            /**
             *  Returns true if it is a text property and false otherwise
             *
             *  @param {string} sPropertyName - Property Name
             *  @returns {boolean} - returns true or false
             *  @private
             */
            _checkIfTextProperty: function (sPropertyName) {
                var aAllTexts = SettingsDialogConstants.allTexts,
                    bFlag = false;
                /**
                 *  Looping through all the text properties
                 */
                for (var i = 0; i < aAllTexts.length; i++) {
                    /**
                     *  If it is a text property
                     *  Then return true
                     */
                    if (aAllTexts[i] === sPropertyName) {
                        bFlag = true;
                        break;
                    }
                }

                return bFlag;
            },

            /**
             *  Returns true if objects are identical and false otherwise
             *
             *  @param {object} oObject1 - First Object
             *  @param {object} oObject2 - Second Object
             *  @returns {boolean} - returns true or false
             *  @private
             */
            _isEquivalent: function (oObject1, oObject2) {
                var bFlag = true;

                if ((!oObject1 && oObject2) || (oObject1 && !oObject2)) {
                    return false;
                }

                for (var prop in oObject1) {
                    if (oObject1.hasOwnProperty(prop)) {
                        var val = oObject1[prop];
                        if (typeof val == "object") { // this also applies to arrays or null!
                            bFlag = bFlag && this._isEquivalent(val, oObject2[prop]);
                        } else {
                            /**
                             *  Assumption that Vendor/App developer does not
                             *  delivery a card with just text changes in manifest
                             */
                            bFlag = bFlag && ((oObject2[prop] == val) || this._checkIfTextProperty(prop));
                        }
                    }
                }

                return bFlag;
            },

            /**
             *  Removing extra array elements in oSettings array
             *
             *  @param {object} oSettings - Original Manifest settings
             *  @param {object} oCustomerSettings - Customer Modified settings
             *  @private
             */
            _removeExtraArrayElements: function (oSettings, oCustomerSettings) {
                var aSetStaCon = oSettings["staticContent"],
                    aCusSetStaCon = oCustomerSettings["staticContent"],
                    aSetTabs = oSettings["tabs"],
                    aCusSetTabs = oCustomerSettings["tabs"];
                /**
                 *  Checking if there is staticContent Array
                 */
                if (aSetStaCon && aCusSetStaCon) {
                    /**
                     *  Checking if oSettings Array length is greater than oCustomerSettings
                     */
                    if (aSetStaCon.length > aCusSetStaCon.length) {
                        oSettings["staticContent"].splice(aCusSetStaCon.length, aSetStaCon.length - aCusSetStaCon.length);
                    }
                }

                /**
                 *  Checking if there is tabs Array
                 */
                if (aSetTabs && aCusSetTabs) {
                    /**
                     *  Checking if oSettings Array length is greater than oCustomerSettings
                     */
                    if (aSetTabs.length > aCusSetTabs.length) {
                        oSettings["tabs"].splice(aCusSetTabs.length, aSetTabs.length - aCusSetTabs.length);
                    }
                }
            },

            /**
             *  Emptying all array elements in oSettings array
             *
             *  @param {object} oSettings - Original Manifest settings
             *  @private
             */
            _emptyAllArrayElements: function (oSettings) {
                var aSetStaCon = oSettings["staticContent"],
                    aSetTabs = oSettings["tabs"], i;
                /**
                 *  Checking if there is staticContent Array
                 */
                if (aSetStaCon) {
                    /**
                     *  Emptying all array elements in staticContent array
                     */
                    for (i = 0; i < aSetStaCon.length; i++) {
                        oSettings["staticContent"][i] = {};
                    }
                }

                /**
                 *  Checking if there is tabs Array
                 */
                if (aSetTabs) {
                    /**
                     *  Emptying all array elements in tabs array
                     */
                    for (i = 0; i < aSetTabs.length; i++) {
                        oSettings["tabs"][i] = {};
                    }
                }
            },

            /**
             *  Returns an object after merging oObject2 inside oObject1
             *
             *  @param {object} oObject1 - First Object
             *  @param {object} oObject2 - Second Object
             *  @returns {object} - Merged Object
             *  @private
             */
            _mergeObjects: function (oObject1, oObject2) {
                for (var prop in oObject2) {
                    if (oObject2.hasOwnProperty(prop)) {
                        var val = oObject2[prop];
                        if (typeof val == "object" && oObject1[prop]) { // this also applies to arrays or null!
                            if (val.operation === "DELETE") {
                                delete oObject1[prop];
                            } else {
                                this._mergeObjects(oObject1[prop], val);
                            }
                        } else {
                            oObject1[prop] = val;
                        }
                    }
                }

                return oObject1;
            },

            /**
             *  Returns the card descriptor fully merged with Key User Changes
             *
             *  @param {object} oCard - Card descriptor
             *  @returns {object} - final card descriptor
             *  @private
             */
            _mergeKeyUserChanges: function (oCard) {
                if (!(oCard.hasOwnProperty("customer.settings") && oCard.hasOwnProperty("vendor.settings"))) {
                    return oCard;
                }

                if (!this._isEquivalent(oCard["settings"], oCard["vendor.settings"])) {
                    delete oCard["customer.settings"];
                    delete oCard["vendor.settings"];
                    return oCard;
                }

                var oSettings = jQuery.extend(true, {}, oCard["settings"]),
                    oCustomerSettings = jQuery.extend(true, {}, oCard["customer.settings"]);

                /**
                 *  Handling case where oSettings has an array whose length
                 *  is greater than length of a similar array in oCustomerSettings
                 *
                 *  Here we delete extra elements from oSettings array
                 */
                this._removeExtraArrayElements(oSettings, oCustomerSettings);

                /**
                 *  Emptying all the array elements in oSettings to
                 *  remove unnecessary properties getting merged in final settings
                 */
                this._emptyAllArrayElements(oSettings);

                oCard["settings"] = this._mergeObjects(oSettings, oCustomerSettings);

                return oCard;
            },

            /**
             * Returns the fully qualified name of an entity which is e.g. "com.sap.GL.ZAF.GL_ACCOUNT" from the specified type name.
             *
             * @param {string} sEntityTypeName - the entity Type name which needs to be converted
             * @returns {string} - the fully qualified name for this entity
             * @private
             */
            _getFullyQualifiedNameForEntity: function (sEntityTypeName, oFilterMetaModel) {
                var sNamespace, sResult;
                if (!sEntityTypeName) {
                    return "";
                }
                // if entity type name already has a ".", this means namespace is already there, just return it
                if (sEntityTypeName.indexOf(".") > -1) {
                    return sEntityTypeName;
                }

                //There can be multiple schemas each having a different namespace in a particular metadata, in such a scenario,
                //the below code will populate namespace from default entity container
                var oDefaultEntityContainer = oFilterMetaModel && oFilterMetaModel.getODataEntityContainer();

                sNamespace = oDefaultEntityContainer && oDefaultEntityContainer.namespace;
                if (sNamespace && !(sEntityTypeName.indexOf(sNamespace) > -1)) {
                    sResult = sNamespace + "." + sEntityTypeName;
                } else {
                    sResult = sEntityTypeName;
                }
                return sResult;
            },

            createXMLView: function (ovpConfig) {
                jQuery.sap.measure.start("ovp:AppCreateContent", "OVP app Component createContent", "ovp");
                this._addModelsMeasurements();

                if (this.getRouter()) {
                    this.getRouter().initialize();
                }
                var appConfig = this.getMetadata().getManifestEntry("sap.app");
                var uiConfig = this.getMetadata().getManifestEntry("sap.ui");
                var sIcon = jQuery.sap.getObject("icons.icon", undefined, uiConfig);

                var sComponentName = this.getMetadata().getComponentName();
                ovpConfig.baseUrl = jQuery.sap.getModulePath(sComponentName);
                if (ovpConfig.smartVariantRequired === undefined || ovpConfig.smartVariantRequired === null) {
                    ovpConfig.smartVariantRequired = true;
                }
                if (ovpConfig.enableLiveFilter === undefined || ovpConfig.enableLiveFilter === null) {
                    ovpConfig.enableLiveFilter = true;
                }
                if (ovpConfig.showDateInRelativeFormat === undefined || ovpConfig.showDateInRelativeFormat === null) {
                    ovpConfig.showDateInRelativeFormat = true;
                }
                if (ovpConfig.useDateRangeType || ovpConfig.useDateRangeType === undefined || ovpConfig.useDateRangeType === null) {
                    ovpConfig.useDateRangeType = false;
                }

                var oFilterModel = this.getModel(ovpConfig.globalFilterModel);
                var oFilterMetaModel = oFilterModel && oFilterModel.getMetaModel();
                this.setModel(oFilterModel);

                //If global filter entity set is provided, then populate entity type using that entity set
                if (ovpConfig.globalFilterEntitySet && ovpConfig.globalFilterEntitySet !== " ") {
                    var oEntitySet = oFilterMetaModel && oFilterMetaModel.getODataEntitySet(ovpConfig.globalFilterEntitySet);
                    ovpConfig.globalFilterEntityType = oEntitySet && oEntitySet.entityType;
                }

                //Get fully-qualified and non-qualified entity type name
                if (ovpConfig.globalFilterEntityType && ovpConfig.globalFilterEntityType !== " " &&
                    ovpConfig.globalFilterEntityType.length > 0) {
                    ovpConfig.globalFilterEntityType = this._getFullyQualifiedNameForEntity(
                        ovpConfig.globalFilterEntityType, oFilterMetaModel);
                    ovpConfig.globalFilterEntityTypeNQ = ovpConfig.globalFilterEntityType.split(".").pop();
                }
                var uiModel = new sap.ui.model.json.JSONModel(ovpConfig);

                uiModel.setProperty("/applicationId", jQuery.sap.getObject("id", undefined, appConfig));
                uiModel.setProperty("/title", jQuery.sap.getObject("title", undefined, appConfig));
                uiModel.setProperty("/description", jQuery.sap.getObject("description", undefined, appConfig));

                if (sIcon) {
                    if (sIcon.indexOf("sap-icon") < 0 && sIcon.charAt(0) !== '/') {
                        sIcon = ovpConfig.baseUrl + "/" + sIcon;
                    }
                    uiModel.setProperty("/icon", sIcon);
                }

                //convert cards object into sorted array
                var oCards = ovpConfig.cards;
                var aCards = [];
                var oCard;
                for (var cardKey in oCards) {
                    if (oCards.hasOwnProperty(cardKey) && oCards[cardKey]) {
                        oCard = this._mergeKeyUserChanges(oCards[cardKey]);
                        oCard.id = cardKey;
                        aCards.push(oCard);
                    }
                }

                aCards.sort(function (card1, card2) {
                    if (card1.id < card2.id) {
                        return -1;
                    } else if (card1.id > card2.id) {
                        return 1;
                    } else {
                        return 0;
                    }
                });

                uiModel.setProperty("/cards", aCards);
                if (this.inResizableTestMode() === true) {
                    ovpConfig.containerLayout = "resizable";
                }

                // Layout switch: read 'containerLayout' property from manifest
                if (ovpConfig.containerLayout && ovpConfig.containerLayout === "resizable") {
                    jQuery.sap.require("sap.ovp.ui.DashboardLayoutUtil");
                    uiModel.setProperty("/cardContainerFragment", "sap.ovp.app.DashboardCardContainer");
                    //Read all the property "/resizableLayout" from the manifest and set it to "/dashboardLayout" property
                    uiModel.setProperty("/dashboardLayout", ovpConfig.resizableLayout);
                    var oDblUtil = new sap.ovp.ui.DashboardLayoutUtil(uiModel);
                    this.setDashboardLayoutUtil(oDblUtil);
                } else {
                    // default + compatibility --> EasyScanLayout
                    uiModel.setProperty("/cardContainerFragment", this.getCardContainerFragment());
                }

                var oValueHelpEntityMap = this.createMapForValueHelpEntity(ovpConfig);
                uiModel.setProperty("/ValueHelpEntityMap", oValueHelpEntityMap);
                this.setModel(uiModel, "ui");

                /* What: Using Resource Bundle to get strings to display on error page. */
                var ovplibResourceBundle = this._getOvpLibResourceBundle();
                this.setModel(ovplibResourceBundle, "ovplibResourceBundle");
                var oEntityType = oFilterMetaModel && oFilterMetaModel.getODataEntityType(ovpConfig.globalFilterEntityType, true);
                /**
                 * power user
                 * temp
                 */
                var oView = sap.ui.view("mainView", {
                    height: "100%",
                    preprocessors: {
                        xml: {
                            bindingContexts: {
                                ui: uiModel.createBindingContext("/"),
                                meta: oFilterMetaModel.createBindingContext(oEntityType)
                            },
                            models: {
                                ui: uiModel,
                                meta: oFilterMetaModel
                            }
                        }
                    },
                    type: sap.ui.core.mvc.ViewType.XML,
                    viewName: "sap.ovp.app.Main"
                });
                /**
                 * end
                 */

                jQuery.sap.measure.end("ovp:AppCreateContent");

                return oView;
            },

            _showErrorPage: function () {
                /* About: this function
                 *  When: If error occurs and getMetaModel.loaded() promise gets rejected
                 *  How: Loads Error Page into the Root Container and sets Aggregation
                 */
                var oView = sap.ui.view({
                    height: "100%",
                    type: sap.ui.core.mvc.ViewType.XML,
                    viewName: "sap.ovp.app.Error"
                });
                /* What: Using Resource Bundle to get strings to display on error page. */
                var ovplibResourceBundle = this._getOvpLibResourceBundle();
                oView.setModel(ovplibResourceBundle, "ovplibResourceBundle");
                this.setAggregation("rootControl", oView);
                this.oContainer.invalidate();
            },

            _formParamString: function (oParams) {
                var aKeys = Object.keys(oParams);
                var index;
                var sParams = "?";
                for (index = 0; index < aKeys.length; index++) {
                    sParams = sParams + aKeys[index] + "=" + oParams[aKeys[index]] + "&";
                }
                return sParams.slice(0, -1);
            },

            _checkForAuthorizationForLineItems: function () {
                return new Promise(function (resolve, reject) {
                    var aAllIntents = [],
                        oCardsWithStaticContent = [];
                    var oOvpConfig = this.getOvpConfig();
                    var oCards = oOvpConfig["cards"];
                    for (var sCard in oCards) {
                        if (oCards.hasOwnProperty(sCard) && oCards[sCard]) {
                            var card = oCards[sCard];
                            var oSettings = card.settings;
                            if (card.template === "sap.ovp.cards.linklist" && oSettings.listFlavor === "standard" && oSettings.staticContent) {
                                var aStaticContent = oSettings.staticContent;
                                for (var i = 0; i < aStaticContent.length; i++) {
                                    if (aStaticContent[i].semanticObject || aStaticContent[i].action) {
                                        var sIntent = "#" + aStaticContent[i].semanticObject + "-" + aStaticContent[i].action;
                                        if (aStaticContent[i].params) {
                                            var sParams = this._formParamString(aStaticContent[i].params);
                                            sIntent = sIntent + sParams;
                                        }
                                        if (oCardsWithStaticContent.indexOf(sCard) === -1) {
                                            oCardsWithStaticContent.push(sCard);
                                        }
                                        if (aAllIntents.indexOf(sIntent) === -1) {
                                            aAllIntents.push(sIntent);
                                        }
                                    }
                                }
                            }
                        }
                    }

                    this._oCardsWithStaticContent = oCardsWithStaticContent;

                    // Checks for the supported Intents for the user
                    sap.ushell.Container.getService('CrossApplicationNavigation').isIntentSupported(aAllIntents)
                        .done(function (oResponse) {
                            var oOvpConfig = this.getOvpConfig();
                            for (var key in oResponse) {
                                if (oResponse.hasOwnProperty(key) && oResponse[key].supported === false) {
                                    for (var i = 0; i < this._oCardsWithStaticContent.length; i++) {
                                        var aStaticContent = oOvpConfig["cards"][this._oCardsWithStaticContent[i]].settings.staticContent;

                                        for (var j = aStaticContent.length - 1; j >= 0; j--) {
                                            var sIntent = "#" + aStaticContent[j].semanticObject + "-" + aStaticContent[j].action;
                                            if (aStaticContent[j].params) {
                                                var sParams = this._formParamString(aStaticContent[j].params);
                                                sIntent = sIntent + sParams;
                                            }
                                            if (key === sIntent) {
                                                aStaticContent.splice(j, 1);
                                            }
                                        }
                                        oOvpConfig["cards"][this._oCardsWithStaticContent[i]].settings.staticContent = aStaticContent;
                                    }
                                }
                            }

                            delete this._oCardsWithStaticContent;

                            resolve(oOvpConfig);
                        }.bind(this))
                        .fail(function (oError) {
                            jQuery.sap.log.error(oError);
                        });
                }.bind(this));
            },

            setContainer: function () {
                var ovpConfig = this.getOvpConfig();
                var oFilterModel = this.getModel(ovpConfig.globalFilterModel);
                // call overwritten setContainer (sets this.oContainer)
                UIComponent.prototype.setContainer.apply(this, arguments);

                if (oFilterModel && !this.getAggregation("rootControl")) {
                    Promise.all([
                        oFilterModel.getMetaModel().loaded(),
                        this._checkForAuthorizationForLineItems(ovpConfig)
                    ]).then(function (aResponse) {
                        this.oOvpConfig = aResponse[1];
                        // Do the templating once the metamodel is loaded
                        this.runAsOwner(function () {
                            var oView = this.createXMLView(this.oOvpConfig);
                            this.setAggregation("rootControl", oView);
                            this.oContainer.invalidate();
                        }.bind(this));
                    }.bind(this));
                    oFilterModel.attachMetadataFailed(function () {
                        /*To show error page if metadata Model doesn't get loaded*/
                        this._showErrorPage();
                    }.bind(this));
                }
            },
            _getOvpLibResourceBundle: function () {
                if (!this.ovplibResourceBundle) {
                    var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ovp");
                    this.ovplibResourceBundle = oResourceBundle ? new sap.ui.model.resource.ResourceModel({
                        bundleUrl: oResourceBundle.oUrlInfo.url,
                        bundle: oResourceBundle  //Reuse created bundle to stop extra network calls
                    }) : null;
                }
                return this.ovplibResourceBundle;
            },

            createMapForEntityContainer: function (oEntityContainer) {
                var oEntitySetMap = {};
                var oEntitySets = oEntityContainer.entitySet;
                for (var i = 0; i < oEntitySets.length; i++) {
                    oEntitySetMap[oEntitySets[i].name] = oEntitySets[i].entityType;
                }
                return oEntitySetMap;

            },

            createMapForValueHelpEntity: function (oOvpConfig) {
                var oFilterModel = this.getModel(oOvpConfig.globalFilterModel);
                var oValueHelpEntityMap = [];
                var oFilterEntityType = oFilterModel.getMetaModel().getODataEntityType(oOvpConfig.globalFilterEntityType);
                if (!oFilterEntityType) {
                    return oValueHelpEntityMap;
                }
                var oEntityCollection = [];
                oEntityCollection.push(oFilterEntityType);
                var counter = 0;
                var bNavigationProperty = false;
                var oEntitySetMap = this.createMapForEntityContainer(oFilterModel.getMetaModel().getODataEntityContainer());
                if (oFilterEntityType.navigationProperty) {
                    bNavigationProperty = true;
                }
                while (oEntityCollection.length != 0) {
                    var oEntityType = oEntityCollection.shift();
                    for (var i = 0; i < oEntityType.property.length; i++) {
                        var oProp = oEntityType.property[i];
                        if (oProp["com.sap.vocabularies.Common.v1.ValueList"]) {
                            oValueHelpEntityMap.push(oEntitySetMap[oProp["com.sap.vocabularies.Common.v1.ValueList"].CollectionPath.String]);
                        }
                    }
                    if (!bNavigationProperty || !(oFilterEntityType.navigationProperty[counter])) {
                        break;
                    }
                    //get association
                    var sAssociationEntity = oFilterModel.getMetaModel().getODataAssociationEnd(oFilterEntityType, oFilterEntityType.navigationProperty[counter].name).type;
                    var oNavigationEntityType = oFilterModel.getMetaModel().getODataEntityType(sAssociationEntity);
                    oEntityCollection.push(oNavigationEntityType);
                    counter++;
                }
                return oValueHelpEntityMap;
            },

            //Changes to test the Resizable layout in running applications
            inResizableTestMode: function () {
                // get the URL parameter from the parent frame
                return this._getQueryParamUpToTop('resizableTest') == 'true';
            },

            _getQueryParamUpToTop: function (name) {
                var win = window;
                var val = this.getQueryParam(win.location.search, name);
                if (val != null) {
                    return val;
                }
                if (win == win.parent) {
                    return null;
                }
                win = win.parent;
                return null;
            },

            getQueryParam: function (query, name) {
                var val = null;
                if (!query) {
                    return val;
                }
                if (query.indexOf('?') != -1) {
                    query = query.substring(query.indexOf('?'));
                }
                if (query.length > 1 && query.indexOf(name) != -1) {
                    query = query.substring(1); // remove '?'
                    var params = query.split('&');
                    for (var i = 0; i < params.length; i++) {
                        var nameVal = params[i].split('=');
                        if (nameVal[0] == name) {
                            val = nameVal[1];
                            break;
                        }
                    }
                }
                return val;
            }
        });
    }
);