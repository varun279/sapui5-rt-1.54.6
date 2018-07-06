sap.ui.define("sap/fe/MicroChart", [
		'jquery.sap.global',
		'sap/ui/mdc/XMLComposite',
		'sap/ui/base/ManagedObject',
		'sap/ui/Device',
		'sap/fe/controls/_MicroChart/bulletMicroChart/BulletMicroChart.controller',
		'sap/fe/controls/_MicroChart/radialMicroChart/RadialMicroChart.controller',
		'sap/fe/controls/_MicroChart/harveyBallMicroChart/HarveyBallMicroChart.controller',
		'sap/fe/controls/_MicroChart/deltaMicroChart/DeltaMicroChart.controller',
		'sap/fe/controls/_MicroChart/stackedBarMicroChart/StackedBarMicroChart.controller',
		'sap/m/ValueColor'
	], function (jQuery, XMLComposite, ManagedObject, Device, BulletMicroChartController, RadialMicroChartController, HarveyBallMicroChartController, DeltaMicroChartController, StackedBarMicroChartController, ValueColor) {
		"use strict";
		var BulletMicroChartName = "sap.suite.ui.microchart.BulletMicroChart",
			RadialMicroChartName = "sap.suite.ui.microchart.RadialMicroChart",
			HarveyBallMicroChartName = "sap.suite.ui.microchart.HarveyBallMicroChart",
			DeltaMicroChartName = "sap.suite.ui.microchart.DeltaMicroChart",
			StackedBarMicroChartName = "sap.suite.ui.microchart.StackedBarMicroChart";

		var MicroChart = XMLComposite.extend("sap.fe.MicroChart", {
			metadata: {
				designTime: true,
				specialSettings: {
					metadataContexts: {
						defaultValue: "{ model: 'chartAnnotationModel', path:'',name: 'chartAnnotation'}"
					}
				},
				properties: {
					title: {
						type: "any",
						invalidate: "template"
					}
				},
				events: {},
				aggregations: {},
				publicMethods: []
			},
			alias: "this",
			fragment: "sap.fe.controls._MicroChart.MicroChart"
		});

		MicroChart.prototype.init = function () {
			XMLComposite.prototype.init.call(this);
			var oInnerChart = this.getInnerMicroChart(),
				sControlName = oInnerChart.getMetadata().getName();
			if ([BulletMicroChartName, RadialMicroChartName, HarveyBallMicroChartName, DeltaMicroChartName, StackedBarMicroChartName].join(" ").indexOf(sControlName) > -1) {
				if (sControlName === BulletMicroChartName) {
					this.oMicroChartController = new BulletMicroChartController(this);
				} else if (sControlName === RadialMicroChartName) {
					this.oMicroChartController = new RadialMicroChartController(this);
				} else if (sControlName === HarveyBallMicroChartName) {
					this.oMicroChartController = new HarveyBallMicroChartController(this);
				}else if (sControlName === DeltaMicroChartName) {
					this.oMicroChartController = new DeltaMicroChartController(this);
				} else if (sControlName === StackedBarMicroChartName) {
					this.oMicroChartController = new StackedBarMicroChartController(this);
				}
			}
		};
		MicroChart.prototype.getInnerMicroChart = function () {
			/*
			 get access to the rendered chart - currently it's the second one in the layout. whenever we change the
			 layout we need to adapt this coding. Going upwards to the the view and to access it via ID would take
			 much longer. Any other ideas are welcome
			 */
			return this.get_content();
		};
		MicroChart._helper = {
		};

		return MicroChart;

	}, /* bExport= */true
);
