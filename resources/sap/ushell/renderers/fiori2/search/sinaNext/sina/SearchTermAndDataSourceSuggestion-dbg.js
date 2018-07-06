/* global define */
sinaDefine(['../core/core', './SearchTermSuggestion', './SuggestionType'], function (core, SearchTermSuggestion, SuggestionType) {

    return SearchTermSuggestion.derive({

        type: SuggestionType.SearchTermAndDataSource,

        _meta: {
            properties: {
                dataSource: { required: true }
            }
        }

    });

});
