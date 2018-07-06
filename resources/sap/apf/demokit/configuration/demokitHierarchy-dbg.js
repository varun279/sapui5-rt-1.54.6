/*global sap*/
sap.ui.define([], function () {
	'use strict';
	return {
		"analyticalConfigurationName": "APF Hierarchy Demo",
		"applicationTitle": {
			"type": "label",
			"kind": "text",
			"key": "14822380843323382109646873064048"
		},
		"steps": [
			{
				"type": "step",
				"description": "Revenue by Country (with Hierarchy Service)",
				"request": "request-for-Step-2",
				"binding": "binding-for-Step-2",
				"id": "Step-2",
				"title": {
					"type": "label",
					"kind": "text",
					"key": "14822374389411352084979829313687"
				},
				"navigationTargets": []
			},
			{
				"type": "step",
				"description": "Revenue by Country (with normal Service)",
				"request": "request-for-Step-3",
				"binding": "binding-for-Step-3",
				"id": "Step-3",
				"title": {
					"type": "label",
					"kind": "text",
					"key": "14822374366121819634218359677717"
				},
				"navigationTargets": []
			},
			{
				"type": "hierarchicalStep",
				"description": "Revenue by Customer",
				"request": "request-for-Step-1",
				"binding": "binding-for-Step-1",
				"id": "Step-1",
				"title": {
					"type": "label",
					"kind": "text",
					"key": "57FCA515C3D350DEE10000000A442AF5"
				},
				"navigationTargets": [],
				"hierarchyProperty": "Customer"
			}
		],
		"requests": [
			{
				"type": "request",
				"id": "request-for-Step-2",
				"service": "/tmp/demokit/hierarchy.xsodata",
				"entitySet": "RevenueHryQuery",
				"selectProperties": [
					"Country",
					"CountryName",
					"Revenue",
					"Currency"
				]
			},
			{
				"type": "request",
				"id": "request-for-Step-3",
				"service": "/tmp/demokit/demokit.xsodata",
				"entitySet": "RevenueQuery",
				"selectProperties": [
					"Country",
					"CountryName",
					"Revenue",
					"Currency"
				]
			},
			{
				"type": "request",
				"id": "request-for-Step-1",
				"service": "/tmp/demokit/hierarchy.xsodata",
				"entitySet": "RevenueHryQuery",
				"selectProperties": [
					"Currency",
					"Customer_NodeText",
					"Revenue"
				]
			},
			{
				"type": "request",
				"id": "ValueHelp-request-for-FacetFilter-2",
				"service": "/tmp/demokit/demokit.xsodata",
				"entitySet": "RevenueQuery",
				"selectProperties": [
					"Country",
					"CountryName"
				]
			}
		],
		"bindings": [
			{
				"type": "binding",
				"id": "binding-for-Step-2",
				"stepDescription": "Revenue by Country (with Hierarchy Service)",
				"requiredFilters": [
					"Country"
				],
				"requiredFilterOptions": {
					"labelDisplayOption": "text",
					"fieldDesc": {
						"type": "label",
						"kind": "text",
						"key": "15053049815106687677930186500838"
					}
				},
				"representations": [
					{
						"id": "Step-2-Representation-1",
						"representationTypeId": "ColumnChart",
						"parameter": {
							"dimensions": [
								{
									"fieldName": "Country",
									"kind": "xAxis",
									"fieldDesc": {
										"type": "label",
										"kind": "text",
										"key": "14998654696299888808200129512867"
									},
									"labelDisplayOption": "keyAndText"
								}
							],
							"measures": [
								{
									"fieldName": "Revenue",
									"kind": "yAxis",
									"fieldDesc": {
										"type": "label",
										"kind": "text",
										"key": "14998652326179777222480117701560"
									}
								}
							],
							"properties": [],
							"hierarchicalProperty": [
								{}
							],
							"alternateRepresentationTypeId": "TableRepresentation",
							"width": {}
						}
					}
				]
			},
			{
				"type": "binding",
				"id": "binding-for-Step-3",
				"stepDescription": "Revenue by Country (with normal Service)",
				"requiredFilters": [
					"Country"
				],
				"requiredFilterOptions": {
					"labelDisplayOption": "text",
					"fieldDesc": {
						"type": "label",
						"kind": "text",
						"key": "15053049815106687677930186500838"
					}
				},
				"representations": [
					{
						"id": "Step-3-Representation-1",
						"representationTypeId": "ColumnChart",
						"parameter": {
							"dimensions": [
								{
									"fieldName": "Country",
									"kind": "xAxis",
									"fieldDesc": {
										"type": "label",
										"kind": "text",
										"key": "14998654696299888808200129512867"
									},
									"labelDisplayOption": "keyAndText"
								}
							],
							"measures": [
								{
									"fieldName": "Revenue",
									"kind": "yAxis",
									"fieldDesc": {
										"type": "label",
										"kind": "text",
										"key": "14998652326179777222480117701560"
									}
								}
							],
							"properties": [],
							"hierarchicalProperty": [
								{}
							],
							"alternateRepresentationTypeId": "TableRepresentation",
							"width": {}
						}
					}
				]
			},
			{
				"type": "binding",
				"id": "binding-for-Step-1",
				"stepDescription": "Revenue by Customer",
				"requiredFilters": [
					"Customer_NodeID"
				],
				"requiredFilterOptions": {
					"labelDisplayOption": "keyAndText",
					"fieldDesc": {
						"type": "label",
						"kind": "text",
						"key": "15053050151301676919357480678764"
					}
				},
				"representations": [
					{
						"id": "Step-1-Representation-1",
						"representationTypeId": "TreeTableRepresentation",
						"parameter": {
							"dimensions": [],
							"measures": [],
							"properties": [
								{
									"fieldName": "Currency",
									"kind": "column",
									"fieldDesc": {
										"type": "label",
										"kind": "text",
										"key": "14998653507209401435790398465730"
									}
								},
								{
									"fieldName": "Revenue",
									"kind": "column",
									"fieldDesc": {
										"type": "label",
										"kind": "text",
										"key": "14998652326179777222480117701560"
									}
								}
							],
							"hierarchicalProperty": [
								{
									"fieldName": "Customer",
									"kind": "hierarchicalColumn",
									"fieldDesc": {
										"type": "label",
										"kind": "text",
										"key": "14998652293709247139600212095455"
									},
									"labelDisplayOption": "text"
								}
							],
							"width": {}
						}
					}
				]
			}
		],
		"representationTypes": [],
		"categories": [
			{
				"type": "category",
				"description": "All Steps",
				"id": "Category-1",
				"label": {
					"type": "label",
					"kind": "text",
					"key": "582CF273286D6BFFE10000000A442AF5"
				},
				"steps": [
					{
						"type": "step",
						"id": "Step-1"
					},
					{
						"type": "step",
						"id": "Step-2"
					},
					{
						"type": "step",
						"id": "Step-3"
					}
				]
			}
		],
		"navigationTargets": [],
		"facetFilters": [
			{
				"type": "facetFilter",
				"description": "Currency",
				"id": "FacetFilter-1",
				"property": "P_Currency",
				"multiSelection": "false",
				"preselectionDefaults": [
					"USD"
				],
				"valueList": [
					"EUR",
					"USD"
				],
				"label": {
					"type": "label",
					"kind": "text",
					"key": "57FCA395C3D350DEE10000000A442AF5"
				},
				"invisible": false,
				"hasAutomaticSelection": "false",
				"useSameRequestForValueHelpAndFilterResolution": "false"
			},
			{
				"type": "facetFilter",
				"description": "Country",
				"id": "FacetFilter-2",
				"alias": "Country",
				"property": "Country",
				"multiSelection": "true",
				"preselectionDefaults": [],
				"label": {
					"type": "label",
					"kind": "text",
					"key": "57FCA4F1C3D350DEE10000000A442AF5"
				},
				"invisible": false,
				"valueHelpRequest": "ValueHelp-request-for-FacetFilter-2",
				"hasAutomaticSelection": "true",
				"useSameRequestForValueHelpAndFilterResolution": "false"
			}
		],
		"configHeader": {
			"Application": "57FCA36EC3D350DEE10000000A442AF5",
			"ApplicationName": "APF Demo Kit Application",
			"SemanticObject": "FioriApplication",
			"AnalyticalConfiguration": "57FCA36EC3D350DEE10000000A442AF6",
			"AnalyticalConfigurationName": "APF Hierarchy Demo",
			"UI5Version": "1.51.0-SNAPSHOT",
			"CreationUTCDateTime": null,
			"LastChangeUTCDateTime": null
		}
	};
});