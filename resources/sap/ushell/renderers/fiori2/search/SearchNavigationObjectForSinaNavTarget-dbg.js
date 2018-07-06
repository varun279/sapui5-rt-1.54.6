/* global jQuery, sap, window, document, console */

sap.ui.define([
    'sap/ushell/renderers/fiori2/search/SearchNavigationObject'
], function(SearchNavigationObject) {
    "use strict";

    return SearchNavigationObject.extend("sap.ushell.renderers.fiori2.search.SearchNavigationObjectForSinaNavTarget", {

        constructor: function(sinaNavigationTarget) {
            SearchNavigationObject.prototype.constructor.apply(this, arguments);
            this._sinaNavigationTarget = sinaNavigationTarget;
            this.setHref(sinaNavigationTarget.targetUrl);
            this.setText(sinaNavigationTarget.label);
            this.setTarget(sinaNavigationTarget.target);
        },

        performNavigation: function(properties) {
            this._sinaNavigationTarget.performNavigation(properties);
        },

        trackNavigation: function(properties) {}
    });
});
