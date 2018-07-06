// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(['sap/ui/core/mvc/Controller','sap/ui/core/IconPool','sap/ushell/components/tiles/utils','sap/ushell/components/tiles/utilsRT'],function(C,I,u,a){"use strict";return C.extend("sap.ushell.components.tiles.cdm.applauncher.StaticTile",{onInit:function(){},onPress:function(e){var c=this.getView().getViewData().properties,r={},R=sap.ushell.Container.getRenderer("fiori2");if(e.getSource().getScope&&e.getSource().getScope()===sap.m.GenericTileScope.Display){var t=this._createTargetUrl();if(t.length===0){return;}if(t[0]==='#'){hasher.setHash(t);}else{r.title=c.title;r.appType="App";r.url=c.targetURL;r.appId=c.targetURL;R.logRecentActivity(r);window.open(t,'_blank');}}},updatePropertiesHandler:function(n){var t=this.getView().getContent()[0],T=t.getTileContent()[0];if(typeof n.title!=='undefined'){t.setHeader(n.title);}if(typeof n.subtitle!=='undefined'){t.setSubheader(n.subtitle);}if(typeof n.icon!=='undefined'){T.getContent().setSrc(n.icon);}if(typeof n.info!=='undefined'){T.setFooter(n.info);}},_createTargetUrl:function(){var t=this.getView().getViewData().properties.targetURL,s=this.getView().getViewData().configuration["sap-system"],U,h;if(t&&s){U=sap.ushell.Container.getService("URLParsing");if(U.isIntentUrl(t)){h=U.parseShellHash(t);if(!h.params){h[params]={};}h.params["sap-system"]=s;t="#"+U.constructShellHash(h);}else{t+=((t.indexOf("?")<0)?"?":"&")+"sap-system="+s;}}return t;},_getCurrentProperties:function(){var t=this.getView().getContent()[0],T=t.getTileContent()[0];return{title:t.getHeader(),subtitle:t.getSubheader(),info:T.getFooter(),icon:T.getContent().getSrc()}}});},true);
