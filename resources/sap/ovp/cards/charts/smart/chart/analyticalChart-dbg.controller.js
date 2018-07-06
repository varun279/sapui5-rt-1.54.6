(function () {
	"use strict";
	/*global sap, jQuery */

	sap.ui.controller("sap.ovp.cards.charts.smart.chart.analyticalChart", {
		onInit: function () {
				sap.ovp.cards.charts.VizAnnotationManager.formatChartAxes();
				this.bFlag = true;
				
				var smartChart = this.getView().byId("analyticalChart2");
				if (smartChart) {
		           /* smartChart.setShowDrillButtons(false);
		            //smartChart.setShowDrillBreadcrumbs(false);
		            smartChart.setShowDetailsButton(true);
					smartChart.setShowZoomButtons(false);
					smartChart.setShowLegendButton(false);
					smartChart.setShowFullScreenButton(false);
					smartChart.setShowSemanticNavigationButton(false);
					smartChart.setUseChartPersonalisation(false);
					smartChart.setUseListForChartTypeSelection(false);
					smartChart.setShowChartTypeSelectionButton(false);*/
				
					if (smartChart.getHeader() === "") {
						smartChart.setHeader("Dummy");
					}
	            }

				var MetadataAnalyser = sap.ui.comp.odata.MetadataAnalyser;
				var enrichChartAnnotation = MetadataAnalyser.prototype._enrichChartAnnotation;
				var iLen, i, oObj;
				MetadataAnalyser.prototype._enrichChartAnnotation = function(oAnnotation, oAnnotationData) {
					if ( oAnnotationData ) {
						
						if ( !oAnnotationData.Measures ) {
							oAnnotationData.Measures = [];
							if (oAnnotationData.MeasureAttributes) {
								iLen = oAnnotationData.MeasureAttributes.length;
								for (i = 0; i < iLen; i++) {
									oObj = oAnnotationData.MeasureAttributes[i];
									oAnnotationData.Measures.push({ "PropertyPath" : oObj.Measure.PropertyPath });
								}
							}
						}
						
						if ( !oAnnotationData.Dimensions ) {
							oAnnotationData.Dimensions = [];
							if (oAnnotationData.DimensionAttributes ) {
								iLen = oAnnotationData.DimensionAttributes.length;
								for (i = 0; i < iLen; i++) {
									oObj = oAnnotationData.DimensionAttributes[i];
									oAnnotationData.Dimensions.push({ "PropertyPath" : oObj.Dimension.PropertyPath });
								}
							}
						}
						
					}
					
					enrichChartAnnotation.apply(this,arguments);
				};
		},
		onBeforeRendering : function() {
			var smartChart = this.getView().byId("analyticalChart2");
			var vizFrame = smartChart._getVizFrame();
			//var chartTitle = this.getView().byId("ovpCT1");
			this.vizFrame = vizFrame;
			
			var analyticalChart = smartChart.getChart();
			analyticalChart.setProperty("enableScalingFactor", true);
			//var config = this.getConfig();
			//sap.ovp.cards.charts.SmartAnnotationManager.buildSmartAttributes(smartChart,chartTitle);//,config);
			sap.ovp.cards.charts.SmartAnnotationManager.getSelectedDataPoint(vizFrame, this);
			sap.ovp.cards.charts.SmartAnnotationManager.attachDataReceived(smartChart, this);
		},
		
		onAfterRendering: function () {
           /* var smartChart = this.getView().byId("analyticalChart2");
            var smartChartViz = smartChart._getVizFrame();
            smartChartViz.setHeight("400px");*/
            //Setting the height of viz container
            //Since we do not want the toolbar, we remove it using jQuery
			/*var aToolbar = jQuery(".ovpSmartChart").find(".sapUiCompSmartChartToolbar");
			aToolbar.remove();*/
            var oCompData = this.getOwnerComponent().getComponentData();
            if (this.getCardPropertiesModel().getProperty("/layoutDetail") === "resizable" && oCompData.appComponent) {
                var oDashboardLayoutUtil = oCompData.appComponent.getDashboardLayoutUtil();
                var sCardId = oDashboardLayoutUtil.getCardDomId(oCompData.cardId);
                var oCard = oDashboardLayoutUtil.dashboardLayoutModel.getCardById(oCompData.cardId);
                var element = document.getElementById(sCardId);
                //.sapOvpCardContentContainer where border-top is 1px
                element.getElementsByClassName('sapOvpWrapper')[0].style.height =
                    oCard.dashboardLayout.rowSpan * oDashboardLayoutUtil.ROW_HEIGHT_PX + 1 - (oCard.dashboardLayout.headerHeight + 2 * oDashboardLayoutUtil.CARD_BORDER_PX) + "px";
                var cardSpan = Math.round((oCard.dashboardLayout.headerHeight + 2 * oDashboardLayoutUtil.CARD_BORDER_PX) / oDashboardLayoutUtil.ROW_HEIGHT_PX);
                if (oCard.dashboardLayout.rowSpan <= cardSpan) {
                    element.classList.add("sapOvpMinHeightContainer");
                }
            }
            
            var smartChart = this.getView().byId("analyticalChart2");
            var analyticalChart = smartChart.getChart();
            var oVizFrame = smartChart._getVizFrame();
            analyticalChart.addEventDelegate({
                onAfterRendering : function () {
                    var sDisplayText = "in";
                    if (oVizFrame && oVizFrame._states() && oVizFrame._states()["dynamicScale"]) {
                        //var dynamicScaleFactorText = this.getView().byId("ovpUoMTitle");
                            var oScalingFactor = analyticalChart.getScalingFactor();
                            var sScale = oScalingFactor && oScalingFactor.primaryValues && oScalingFactor.primaryValues.scalingFactor;
                            if (sScale != undefined) {
                                sDisplayText = sDisplayText + " " + sScale;
                            }
                            var sUnit = oScalingFactor && oScalingFactor.primaryValues && oScalingFactor.primaryValues.unit;
                            if (sUnit) {
                                //sDisplayText = sDisplayText + " " + sUnit;
                                sDisplayText = sap.ui.getCore().getLibraryResourceBundle("sap.ovp").getText("IN_NO_SCALE",[sUnit]);
                                //dynamicScaleFactorText.setText(sDisplayText);
                                var headerText = smartChart.getHeader();
                                headerText += sDisplayText;
                                smartChart.setHeader(headerText);
                            }
                    }
                }
            });
            
		},

        beforeRebindSmartChart: function (oEvent) {
            var chart = this.getView().byId("analyticalChart2"),
                oChartObj = sap.ovp.cards.charts.SmartAnnotationManager.getMaxItems(chart),
                colSpanOffset = +this.getCardPropertiesModel().getProperty("/cardLayout/colSpan") - 1;
            chart.attachBeforeRebindChart(jQuery.proxy(this.beforeRebindSmartChart, this));
            var mBindingParams = oEvent.getParameter("bindingParams");

            if (this.getCardPropertiesModel().getProperty('/layoutDetail') === 'resizable') {
                this.dataLength = oChartObj.itemsLength + colSpanOffset * oChartObj.dataStep;
            } else {
                this.dataLength = oChartObj.itemsLength;
            }
            mBindingParams.length = this.dataLength;
			
            var aFilters = mBindingParams.filters;
            //var f = new sap.ui.model.Filter({ "path" : "Country" , "operator" : sap.ui.model.FilterOperator.EQ , "value1" : "IN" });
            //aFilters.push(f);
//            mBindingParams.parameters.custom = { "top" : 3};
            
            var oCardPropertiesModel = this.getCardPropertiesModel();
            var cardData = oCardPropertiesModel.getData();
            var oSelectionVariant = cardData.entityType[cardData.selectionAnnotationPath];
            var bFilter = oSelectionVariant && oSelectionVariant.SelectOptions;
            var dataModel = this.getModel();
            var oEntitySet = this.getEntitySet();
            var oMetadata = sap.ovp.cards.charts.SmartAnnotationManager.getMetadata(this.getModel(), cardData.entitySet);

            if ( bFilter ) {
				jQuery.each(oSelectionVariant.SelectOptions, function() {
					var prop = this.PropertyName.PropertyPath;
					jQuery.each(this.Ranges, function() {
						if (this.Sign.EnumMember === "com.sap.vocabularies.UI.v1.SelectionRangeSignType/I") {
							var filtervalue = sap.ovp.cards.charts.SmartAnnotationManager.getPrimitiveValue(this.Low);
							var filtervaueHigh = this.High && this.High.String;
							filtervalue = sap.ovp.cards.charts.SmartAnnotationManager.formatByType(oMetadata, prop, filtervalue);
							var filter = {
									path : prop,
									operator : this.Option.EnumMember.split("/")[1],
									value1 : filtervalue
							};
							if (filtervaueHigh) {
								filter.value2 = sap.ovp.cards.charts.SmartAnnotationManager.formatByType(oMetadata, prop, filtervaueHigh);
							}
							aFilters.push(new sap.ui.model.Filter(filter));
						}
					});
				});
            }

			var chartPath = "";//"/SalesOrderParameters(P_Currency=%27USD%27,P_CountryCode=%27US%27)/Results";
			
			var bParams = oSelectionVariant && oSelectionVariant.Parameters,
                aParameters = oCardPropertiesModel.getProperty('/parameters');

            bParams = bParams || !!aParameters;
			if (bParams) {
                chartPath = sap.ovp.cards.AnnotationHelper.resolveParameterizedEntitySet(dataModel, oEntitySet, oSelectionVariant, aParameters);
			} else {
				chartPath = "/" + oEntitySet.name;
			}

            chart.setChartBindingPath(chartPath);
		},

        resizeCard: function (newCardLayout, $card) {
            var oCardPropertiesModel = this.getCardPropertiesModel(),
                oSmartChart = this.getView().byId("analyticalChart2"),
                oCardLayout = this.getCardPropertiesModel().getProperty("/cardLayout");
            oCardPropertiesModel.setProperty("/cardLayout/rowSpan", newCardLayout.rowSpan);
            oCardPropertiesModel.setProperty("/cardLayout/colSpan", newCardLayout.colSpan);
            jQuery(this.getView().$()).find(".sapOvpWrapper").css({
                height: (newCardLayout.rowSpan * oCardLayout.iRowHeightPx) - (oCardLayout.headerHeight + 2 * oCardLayout.iCardBorderPx) + "px"
            });
            if (oSmartChart) {
                oSmartChart.rebindChart();
                oSmartChart._getVizFrame().setHeight(this._calculateVizFrameHeight() + "px");
            }
        },
        /**
         * Method to calculate viz frame height
         *
         * @method _calculateVizFrameHeight
         * @return {Integer} iVizFrameHeight - Calculated height of the viz frame
         *                                      For Fixed layout - 480 px
         *                                      For resizable layout - Calculated according to the rowspan
         */
        _calculateVizFrameHeight: function () {
			var iVizFrameHeight,
			oCardLayout = this.getCardPropertiesModel().getProperty("/cardLayout");
         //For resizable layout calculate height of vizframe
         if (oCardLayout && oCardLayout.rowSpan) {
             var oGenCardCtrl = this.getView().getController();
             var iDropDownHeight = this.getItemHeight(oGenCardCtrl, 'toolbar');
             var bubbleText = this.getView().byId("bubbleText");
             var iChartTextHeight = this.getView().byId("ovpCT") ? 20 : 0;
             var iBubbleTextHeight = bubbleText && bubbleText.getVisible() ? 70 : 20;
             //Viz container height = Card Container height + Border top of OvpCardContainer[1px--.sapOvpCardContentContainer] - (Header height + Card padding top and bottom{16px} +
             //                          View switch toolbar height + Height of the Chart text(if present) + Height of bubble chart text +
             //                          Padding top to  the card container[0.875rem -- .ovpChartTitleVBox] + Margin top to viz frame[1rem .ovpViz])
             iVizFrameHeight = oCardLayout.rowSpan * oCardLayout.iRowHeightPx + 1 - (oCardLayout.headerHeight + 2 * oCardLayout.iCardBorderPx + iDropDownHeight + iChartTextHeight + iBubbleTextHeight + 30);
         }
         return iVizFrameHeight;
        }
     });
})();
