/* global define */
sinaDefine(['../core/core', './Suggestion', './SuggestionType'], function (core, Suggestion, SuggestionType) {

    return Suggestion.derive({

        type: SuggestionType.SearchTerm,

        _meta: {
            properties: {
                searchTerm: {
                    required:true
                },
                filter: {
                    required: true
                },
                childSuggestions: {
                    required: false,
                    default: function () { return []; }
                }
            }
        },


    });

});
