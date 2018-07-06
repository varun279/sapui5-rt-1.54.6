sap.ui.define([], function() {
    "use strict";
    return {
        aVariantNames : [ {
                sVariant : ".SelectionVariant",
                sPath : "selectionVariant"
            }, {
                sVariant : ".PresentationVariant",
                sPath : "presentationVariant"
            }, {
                sVariant : ".Identification",
                sPath : "identification"
            }, {
                sVariant : ".DataPoint",
                sPath : "dataPoint",
                isMandatoryField : true
            }, {
                sVariant : ".Chart",
                sPath : "chart",
                isMandatoryField : true
            }, {
                sVariant: ".LineItem",
                sPath: "lineItem",
                isMandatoryField : true
            }, {
                sVariant: ".HeaderInfo",
                sPath: "dynamicSubTitle",
                isMandatoryField : true
            } ],
        tabFields : [
            'dynamicSubtitleAnnotationPath',
            'annotationPath',
            'selectionAnnotationPath',
            'presentationAnnotationPath',
            'identificationAnnotationPath',
            'dataPointAnnotationPath',
            'chartAnnotationPath',
            'value'
        ],
        mainFields : [
            'title',
            'subTitle',
            'valueSelectionInfo',
            'listType',
            'listFlavor',
            'sortOrder',
            'sortBy'
        ],
        allTexts : [
            'title',
            'subTitle',
            'valueSelectionInfo',
            'value'
        ],
        cardSettingsArrayLevel : {
            "staticContent": {
                "text": [
                    'title',
                    'subTitle'
                ],
                "settings": [
                    'imageUri',
                    'imageAltText',
                    'targetUri',
                    'openInNewWindow',
                    'semanticObject',
                    'action'
                ]
            },
            "tabs": {
                "text": [
                    'value'
                ],
                "settings": [
                    'dynamicSubtitleAnnotationPath',
                    'annotationPath',
                    'selectionAnnotationPath',
                    'presentationAnnotationPath',
                    'identificationAnnotationPath',
                    'dataPointAnnotationPath',
                    'chartAnnotationPath',
                    'colorPalette',
                    'ChartProperties',
                    'selectionPresentationAnnotationPath',
                    'kpiAnnotationPath'
                ],
                "onlyTabLevelProps": [
                    'value'
                ]
            }
        },
        cardSettingsForComplex : {
            "text": [
                'title',
                'subTitle',
                'valueSelectionInfo'
            ],
            "settings": [
                'listType',
                'listFlavor',
                'sortOrder',
                'sortBy'
            ]
        },
        cardSettings : {
            "text": [
                'title',
                'subTitle',
                'valueSelectionInfo'
            ],
            "settings": [
                'listType',
                'listFlavor',
                'sortOrder',
                'sortBy',
                'dynamicSubtitleAnnotationPath',
                'annotationPath',
                'selectionAnnotationPath',
                'presentationAnnotationPath',
                'identificationAnnotationPath',
                'dataPointAnnotationPath',
                'chartAnnotationPath'
            ]
        },
        cardSettingsWithText : [
            'title',
            'subTitle',
            'valueSelectionInfo',
            {
                'staticContent': [
                    'title',
                    'subTitle'
                ]
            },
            {
                'tabs': [
                    'value'
                ]
            }
        ],
        oVisibility: {
            "cardPreview": true,
            "title": true,
            "dynamicSwitchStateSubTitle": false,
            "dynamicSwitchSubTitle": false,
            "dynamicSubTitle": false,
            "subTitle": true,
            "kpiHeader": true,
            "valueSelectionInfo": true,
            "listType": true,
            "listFlavor": true,
            "sortOrder": true,
            "sortBy": true,
            "selectionVariant": true,
            "presentationVariant": true,
            "lineItem": true,
            "identification": true,
            "dataPoint": true,
            "chart": true,
            "links": false,
            "lineItemTitle": false,
            "lineItemSubTitle": false,
            "staticLink": false,
            "viewSwitch": false,
            "moveToTheTop": false,
            "moveUp": false,
            "moveDown": false,
            "moveToTheBottom": false,
            "delete": false,
            "showMore": true,
            "removeVisual": false
        },
        _aRefreshNotRequired : [{
                "formElementId" : "sapOvpSettingsTitle",
                "cardElementId" : "ovpHeaderTitle"
            },
            {
                "formElementId" : "sapOvpSettingsViewName",
                "cardElementId" : "ovp_card_dropdown"
            },
            {
                "formElementId" : "sapOvpDefaultViewSwitch",
                "cardElementId" : ""
            },
            {
                "formElementId" : "sapOvpSettingsSubTitle",
                "cardElementId" : "SubTitle-Text"
            },
            {
                "formElementId" : "sapOvpSettingsLineItemTitle",
                "cardElementId" : "linkListTitleLabel"
            },
            {
                "formElementId" : "sapOvpSettingsLineItemSubTitle",
                "cardElementId" : "linkListSubTitleLabel"
            },
            {
                "formElementId" : "sapOvpSettingsValueSelectionInfo",
                "cardElementId" : "ovpValueSelectionInfo"
            },
            {
                "formElementId" : "sapOvpSettingsIdentification",
                "cardElementId" : "",
                "updateProperty" : "identificationAnnotationPath"
            },
            {
                "formElementId" : "sapOvpSettingsKPIHeaderSwitch",
                "cardElementId" : "kpiHeader",
                "isKpiSwitch" : true //If it's a switch, update without refresh only if state = true
            }],
        _aRefreshRequired : [
            {
                "formElementId" : "sapOvpSettingsKPIHeaderSwitch",
                "updateProperty" : "kpiHeader"
            },
            {
                "formElementId" : "sapOvpSettingsSwitchSubTitle",
                "updateProperty" : "subTitleSwitch"
            },
            {
                "formElementId" : "sapOvpSettingsListType",
                "updateProperty" : "listType"
            },
            {
                "formElementId" : "sapOvpSettingsListFlavorForList",
                "updateProperty" : "listFlavor"
            },
            {
                "formElementId" : "sapOvpSettingsListFlavorForLinkList",
                "updateProperty" : "listFlavorForLinkList"
            },
            {
                "formElementId" : "sapOvpSettingsSortOrder",
                "updateProperty" : "sortOrder"
            },
            {
                "formElementId" : "sapOvpSettingsSortBy",
                "updateProperty" : "sortBy"
            },
            {
                "formElementId" : "sapOvpSettingsDynamicSubTitle",
                "updateProperty" : "dynamicSubtitleAnnotationPath"
            },
            {
                "formElementId" : "sapOvpSettingsFilterBy",
                "updateProperty" : "selectionAnnotationPath"
            },
            {
                "formElementId" : "sapOvpSettingsPresentedBy",
                "updateProperty" : "presentationAnnotationPath"
            },
            {
                "formElementId" : "sapOvpSettingsDataPoint",
                "updateProperty" : "dataPointAnnotationPath"
            },
            {
                "formElementId" : "sapOvpSettingsChart",
                "updateProperty" : "chartAnnotationPath"
            },
            {
                "formElementId" : "sapOvpSettingsLineItem",
                "updateProperty" : "annotationPath"
            },
            {
                "formElementId" : "sapOvpSettingsStaticLinkListDelete",
                "updateProperty" : "delete"
            },
            {
                "formElementId" : "sapOvpSettingsStaticLinkListAdd",
                "updateProperty" : "add"
            },
            {
                "formElementId" : "sapOvpSettingsStaticLinkListSort",
                "updateProperty" : "sort"
            },
            {
                "formElementId" : "sapOvpSettingsStaticLinkListChangeVisual",
                "updateProperty" : "changeVisual"
            },
            {
                "formElementId" : "sapOvpSettingsStaticLinkListRemoveVisual",
                "updateProperty" : "removeVisual"
            }
        ]
    };
},/* bExport= */true);