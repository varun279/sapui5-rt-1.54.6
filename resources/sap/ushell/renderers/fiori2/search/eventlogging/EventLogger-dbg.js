/* global jQuery, sap, window */

sap.ui.define([
    'sap/ushell/renderers/fiori2/search/eventlogging/SinaLogConsumer',
    'sap/ushell/renderers/fiori2/search/eventlogging/UsageAnalyticsConsumer',
    'sap/ushell/renderers/fiori2/search/eventlogging/SinaNavigationTargetConsumer',
    'sap/ushell/renderers/fiori2/search/SearchHelper'
], function(SinaLogConsumer, UsageAnalyticsConsumer, SinaNavigationTargetConsumer, SearchHelper) {
    "use strict";

    // =======================================================================
    // declare package
    // =======================================================================
    jQuery.sap.declare('sap.ushell.renderers.fiori2.search.eventlogging.EventLogger');

    // =======================================================================
    // EventLogger (main class for event logging)
    // =======================================================================
    var module = sap.ushell.renderers.fiori2.search.eventlogging.EventLogger = function() {
        this.init.apply(this, arguments);
    };

    module.newInstance = function(properties) {
        var logger = new module();
        logger.addConsumer(new SinaLogConsumer(properties.sinaNext));
        logger.addConsumer(new UsageAnalyticsConsumer());
        // logger.addConsumer(new SinaNavigationTargetConsumer());
        return logger;
    };

    module.prototype = {

        ITEM_NAVIGATE: 'ITEM_NAVIGATE',
        SUGGESTION_SELECT: 'SUGGESTION_SELECT',
        SEARCH_REQUEST: 'SEARCH_REQUEST',
        ITEM_NAVIGATE_RELATED_OBJECT: 'ITEM_NAVIGATE_RELATED_OBJECT',
        SUGGESTION_REQUEST: 'SUGGESTION_REQUEST',
        TILE_NAVIGATE: 'TILE_NAVIGATE',
        SHOW_MORE: 'SHOW_MORE',
        BROWSER_CLOSE: 'BROWSER_CLOSE',
        LEAVE_PAGE: 'LEAVE_PAGE',

        eventMetadata: {

            SESSION_START: {},

            ITEM_NAVIGATE: {
                targetUrl: 'string',
                positionInList: 'integer'
            },

            SUGGESTION_SELECT: {
                suggestionType: 'string',
                suggestionTitle: 'string',
                suggestionTerm: 'string',
                searchTerm: 'string',
                targetUrl: 'string',
                dataSourceKey: 'string'
            },

            SEARCH_REQUEST: {
                searchTerm: 'string',
                dataSourceKey: 'string'
            },

            ITEM_NAVIGATE_RELATED_OBJECT: {
                targetUrl: 'string'
            },

            SUGGESTION_REQUEST: {
                suggestionTerm: 'string',
                dataSourceKey: 'string'
            },

            TILE_NAVIGATE: {
                tileTitle: 'string',
                targetUrl: 'string'
            },

            SHOW_MORE: {},

            LEAVE_PAGE: {},

            BROWSER_CLOSE: {}
        },

        init: function() {
            this.consumers = [];
        },

        addConsumer: function(consumer) {
            this.consumers.push(consumer);
            consumer.eventLogger = this;
        },

        logEvent: function(event) {
            if (!SearchHelper.isLoggingEnabled()) {
                return;
            }

            for (var i = 0; i < this.consumers.length; ++i) {
                var consumer = this.consumers[i];
                try {
                    consumer.logEvent(event);
                } catch (e) {
                    // error in logging shall not break app
                }

            }
        }

    };

    return module;
});
