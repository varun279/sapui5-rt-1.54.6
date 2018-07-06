/* global jQuery, sap, window */

sap.ui.define([
    'sap/ushell/renderers/fiori2/search/SearchHelper',
    'sap/ushell/renderers/fiori2/search/SearchResultListFormatter',
    'sap/ui/core/util/Export',
    'sap/ui/core/util/ExportTypeCSV',
    'sap/ushell/renderers/fiori2/search/SearchNavigationObject'
], function(SearchHelper, SearchResultListFormatter, Export, ExportTypeCSV, SearchNavigationObject) {
    "use strict";

    return sap.m.Table.extend('sap.ushell.renderers.fiori2.search.controls.SearchResultTable', {

        renderer: 'sap.m.TableRenderer',

        onAfterRendering: function() {
            SearchHelper.attachEventHandlersForTooltip(this.getDomRef());
        },

        onDataExport: sap.m.Table.prototype.exportData || function() {

            var that = this;

            // deactivate download button, when download button is clicked
            sap.ui.getCore().byId('dataExportButton').setEnabled(false);

            // new Export
            that.oExport = new Export({
                exportType: new ExportTypeCSV(),
                models: this.getModel(),
                rows: {
                    path: "/exportRows"
                }
            });

            // modify seperator
            if (sap.ui.getCore().getConfiguration().getLanguage().toUpperCase() === "DE") {
                that.oExport.getExportType().setSeparatorChar(";")
            } else {
                that.oExport.getExportType().setSeparatorChar(",")
            }

            // search query
            var exportQuery = that.getModel().query.clone();
            exportQuery.setCalculateFacets(false);
            exportQuery.setTop(1000);

            // success handler
            var successHandler = function(searchResultSet) {
                var formatter = new SearchResultListFormatter();
                var newResults = formatter.format(searchResultSet, exportQuery.filter.searchTerm, {
                    suppressHighlightedValues: true
                });

                // set export columns
                var exportColumns = that.parseColumns();
                exportColumns.forEach(function(exportColumn) {
                    var column = new sap.ui.core.util.ExportColumn({
                        name: exportColumn.name,
                        template: {
                            content: "{" + exportColumn.originalKey + "}"
                        }
                    });
                    that.oExport.addColumn(column);
                });

                // set export rows
                var exportRows = that.parseRows(newResults, exportColumns);
                that.getModel().setProperty("/exportRows", exportRows);

                that.doExport();
            };

            // error handler
            var errorHandler = function(error) {
                that.getModel().normalSearchErrorHandling(error);
                // activate download button, when fetch data fails
                sap.ui.getCore().byId('dataExportButton').setEnabled(true);
            };

            // fire search
            if (that.getModel().getProperty("/boCount") > 1000) {
                sap.m.MessageBox.information(sap.ushell.resources.i18n.getText("exportDataInfo"), {
                    actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                    onClose: function(oAction) {
                        if (oAction == sap.m.MessageBox.Action.OK) {
                            exportQuery.getResultSetAsync().then(successHandler, errorHandler);
                        }
                        if (oAction == sap.m.MessageBox.Action.CANCEL) {
                            // activate download button, when download is canceled  
                            sap.ui.getCore().byId('dataExportButton').setEnabled(true);
                        }
                    }
                });
            } else {
                exportQuery.getResultSetAsync().then(successHandler, errorHandler);
            }
        },

        parseColumns: function() {
            var that = this;
            var modelColumns = that.getModel().getProperty("/tableColumns");
            var exportColums = [];

            // in table view -> export all visible table columns
            // in other view -> export first 12 columns
            if (that.getModel().getProperty("/resultToDisplay") === "searchResultTable") {
                // get visible columns
                var uiColumns = that.getColumns();
                modelColumns.forEach(function(modelColumn) {
                    uiColumns.forEach(function(uiColumn) {
                        if (modelColumn.key === uiColumn.sId && uiColumn.getVisible()) {
                            exportColums.push(modelColumn);
                        }
                    });
                });
                // sort columns
                exportColums.sort(function(a, b) {
                    if (a.persoOrder < b.persoOrder)
                        return -1;
                    if (a.persoOrder > b.persoOrder)
                        return 1;
                    return 0;
                });
            } else {
                var i = 0;
                modelColumns.forEach(function(modelColumn) {
                    if (i <= 12) {
                        exportColums.push(modelColumn);
                        i++;
                    }
                });
            }
            return exportColums;
        },

        parseRows: function(searchResults, exportColumns) {
            var exportedRows = [];

            searchResults.forEach(function(row) {
                var attributes = row.itemattributes;
                var exportedRow = {};
                // set value for the title column
                exportedRow["DATASOURCE_AS_COLUMN_KEY"] = row.title;
                // set value for the other attribte columns
                exportColumns.forEach(function(column) {
                    attributes.forEach(function(attribute) {
                        if (attribute.key === column.originalKey) {
                            exportedRow[column.originalKey] = attribute.value;
                        }
                    })
                });
                exportedRows.push(exportedRow);
            });
            return exportedRows;
        },

        doExport: function() {
            var that = this;

            that.oExport.saveFile().catch(function(oError) {
                that.getModel().pushError({
                    type: "error",
                    title: sap.ushell.resources.i18n.getText("exportDataError"),
                    description: JSON.stringify(oError)
                });
            }).then(function() {
                that.oExport.destroy();
                that.getModel().setProperty("/exportRows", []);
                // activate download button, when download csv is prepared and downlaod file directory pops over
                sap.ui.getCore().byId('dataExportButton').setEnabled(true);
            });
        }

    });
});
