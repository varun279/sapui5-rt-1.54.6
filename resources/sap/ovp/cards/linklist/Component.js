sap.ui.define(["sap/ovp/cards/generic/Component","sap/ovp/cards/linklist/AnnotationHelper"],function(C,A){"use strict";return C.extend("sap.ovp.cards.linklist.Component",{metadata:{properties:{"contentFragment":{"type":"string","defaultValue":"sap.ovp.cards.linklist.LinkList"},"communicationPath":{"type":"string","defaultValue":"com.sap.vocabularies.Communication.v1.Contact"},"headerAnnotationPath":{"type":"string","defaultValue":"com.sap.vocabularies.UI.v1.HeaderInfo"},"identificationAnnotationPath":{"type":"string","defaultValue":"com.sap.vocabularies.UI.v1.Identification"}},version:"1.54.4",library:"sap.ovp",includes:[],dependencies:{libs:[],components:[]},config:{},customizing:{"sap.ui.controllerExtensions":{"sap.ovp.cards.generic.Card":{controllerName:"sap.ovp.cards.linklist.LinkList"}}}},getCustomPreprocessor:function(){}});});
