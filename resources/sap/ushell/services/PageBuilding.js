// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define([],function(){"use strict";jQuery.sap.require("sap.ui2.srvc.factory");jQuery.sap.require("sap.ui2.srvc.page");function P(a,c){this.getFactory=function(){return a.getFactory();};this.getPage=function(p){return a.getFactory().createPage(p);};this.getPageSet=function(i){var d=new jQuery.Deferred();a.getFactory().createPageSet(i,d.resolve.bind(d),d.reject.bind(d));return d.promise();};};P.hasNoAdapter=false;return P;},true);