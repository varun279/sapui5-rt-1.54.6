sap.ui.define("sap/fe/MicroChart",['jquery.sap.global','sap/ui/mdc/XMLComposite','sap/ui/base/ManagedObject','sap/ui/Device','sap/fe/controls/_MicroChart/bulletMicroChart/BulletMicroChart.controller','sap/fe/controls/_MicroChart/radialMicroChart/RadialMicroChart.controller','sap/fe/controls/_MicroChart/harveyBallMicroChart/HarveyBallMicroChart.controller','sap/fe/controls/_MicroChart/deltaMicroChart/DeltaMicroChart.controller','sap/fe/controls/_MicroChart/stackedBarMicroChart/StackedBarMicroChart.controller','sap/m/ValueColor'],function(q,X,M,D,B,R,H,a,S,V){"use strict";var b="sap.suite.ui.microchart.BulletMicroChart",c="sap.suite.ui.microchart.RadialMicroChart",d="sap.suite.ui.microchart.HarveyBallMicroChart",e="sap.suite.ui.microchart.DeltaMicroChart",f="sap.suite.ui.microchart.StackedBarMicroChart";var g=X.extend("sap.fe.MicroChart",{metadata:{designTime:true,specialSettings:{metadataContexts:{defaultValue:"{ model: 'chartAnnotationModel', path:'',name: 'chartAnnotation'}"}},properties:{title:{type:"any",invalidate:"template"}},events:{},aggregations:{},publicMethods:[]},alias:"this",fragment:"sap.fe.controls._MicroChart.MicroChart"});g.prototype.init=function(){X.prototype.init.call(this);var i=this.getInnerMicroChart(),C=i.getMetadata().getName();if([b,c,d,e,f].join(" ").indexOf(C)>-1){if(C===b){this.oMicroChartController=new B(this);}else if(C===c){this.oMicroChartController=new R(this);}else if(C===d){this.oMicroChartController=new H(this);}else if(C===e){this.oMicroChartController=new a(this);}else if(C===f){this.oMicroChartController=new S(this);}}};g.prototype.getInnerMicroChart=function(){return this.get_content();};g._helper={};return g;},true);
