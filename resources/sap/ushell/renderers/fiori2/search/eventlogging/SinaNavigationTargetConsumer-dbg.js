/* global jQuery, sap */

sap.ui.define([
    'sap/ushell/renderers/fiori2/search/eventlogging/EventConsumer'
], function(EventConsumer) {
    "use strict";

    // =======================================================================
    // declare package
    // =======================================================================
    jQuery.sap.declare('sap.ushell.renderers.fiori2.search.eventlogging.SinaNavigationTargetConsumer');

    // =======================================================================
    // SinaLogConsumer
    // =======================================================================
    var module = sap.ushell.renderers.fiori2.search.eventlogging.SinaNavigationTargetConsumer = function() {
        this.init.apply(this, arguments);
    };

    module.prototype = jQuery.extend(new EventConsumer(), {

        init: function() {},

        logEvent: function(event) {
            if (event.navigationTarget && (event.type === 'ITEM_NAVIGATE' || event.type === 'ITEM_NAVIGATE_RELATED_OBJECT')) {
                event.navigationTarget.trackNavigation();
            }
        }
    });

    return module;
});
