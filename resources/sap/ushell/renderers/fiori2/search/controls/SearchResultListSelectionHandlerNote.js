sap.ui.define(['./SearchResultListSelectionHandler'],function(S){"use strict";return S.extend("sap.ushell.renderers.fiori2.search.controls.SearchResultListSelectionHandlerNote",{isMultiSelectionAvailable:function(d){return true;},actionsForDataSource:function(d){var a=[{text:"Show Selected Items",action:function(s){console.log("Show Selected Items");var m="No Items were selected!";if(s.length>0){m="Following Items were selected:";for(var i=0;i<s.length;i++){m+="\n"+s[i].title;}}sap.m.MessageBox.show(m,{icon:sap.m.MessageBox.Icon.INFORMATION,title:"I'm a Custom Action for testing Multi-Selection",actions:[sap.m.MessageBox.Action.OK]});}}];return a;}});});