sinaDefine(['../../core/core','../../core/util'],function(c,u){return c.defineClass({_init:function(p){this.provider=p;this.sina=p.sina;},getActiveResult:function(r){for(var i=0;i<r.length;++i){var a=r[i];if(a.IsCurrentQuery){return a;}}return null;},parse:function(d){var n={success:false,description:''};if(!d||!d.ResultList||!d.ResultList.NLQQueries||!d.ResultList.NLQQueries.results){return n;}var r=d.ResultList.NLQQueries.results;var a=this.getActiveResult(r);if(!a){return n;}n.success=true;n.description=a.Description;return n;}});});
