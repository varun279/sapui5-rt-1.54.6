/*!
* SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
*/
sap.ui.define(["jquery.sap.global","sap/ui/core/Element","../ContentConnector","../ViewStateManagerBase"],function(q,E,C,V){"use strict";var a;var b=V.extend("sap.ui.vk.threejs.ViewStateManager",{metadata:{publicMethods:["enumerateSelection","getNodeHierarchy","getOpacity","getSelectionState","getTintColor","getVisibilityChanges","getVisibilityState","setOpacity","setSelectionState","setTintColor","setVisibilityState","setShowSelectionBoundingBox","getShowSelectionBoundingBox"]}});var c=b.getMetadata().getParent().getClass().prototype;b.prototype.init=function(){if(c.init){c.init.call(this);}this._nodeHierarchy=null;this._nodeStates=new Map();this._selectedNodes=new Set();this._visibilityTracker=new a();this._showSelectionBoundingBox=true;this._boundingBoxesScene=new THREE.Scene();this.setHighlightColor("rgba(255, 0, 0, 1.0)");};b.prototype._setContent=function(d){var s=null;if(d&&d instanceof sap.ui.vk.threejs.Scene){s=d;}this._setScene(s);};b.prototype._onAfterUpdateContentConnector=function(){this._setContent(this._contentConnector.getContent());};b.prototype._onBeforeClearContentConnector=function(){this._setScene(null);};b.prototype._handleContentReplaced=function(e){var d=e.getParameter("newContent");this._setContent(d);};b.prototype._setScene=function(s){this._boundingBoxesScene=new THREE.Scene();this._setNodeHierarchy(s?s.getDefaultNodeHierarchy():null);return this;};b.prototype._setNodeHierarchy=function(n){var o=this._nodeHierarchy;if(this._nodeHierarchy){this._nodeHierarchy=null;this._nodeStates.clear();this._selectedNodes.clear();this._visibilityTracker.clear();}if(n){this._nodeHierarchy=n;var v=[],h=[];var d=n.findNodesByName();d.forEach(function(e){(e.visible?v:h).push(e);});this.fireVisibilityChanged({visible:v,hidden:h});}if(n!==o){this.fireNodeHierarchyReplaced({oldNodeHierarchy:o,newNodeHierarchy:n});}return this;};b.prototype.getNodeHierarchy=function(){return this._nodeHierarchy;};b.prototype.getVisibilityChanges=function(){return this.getShouldTrackVisibilityChanges()?this._visibilityTracker.getInfo(this.getNodeHierarchy()):null;};b.prototype.getVisibilityComplete=function(){var n=this.getNodeHierarchy(),d=n.findNodesByName(),v=[],h=[];d.forEach(function(e){var f=n.createNodeProxy(e),g=q.grep(f.getVeIds(),function(g){return g.type==="VE_LOCATOR";})[0].fields[0].value;n.destroyNodeProxy(f);if(this.getVisibilityState(e)){v.push(g);}else{h.push(g);}},this);return{visible:v,hidden:h};};b.prototype.getVisibilityState=function(n){return Array.isArray(n)?n.map(function(d){return d.visible;}):n.visible;};b.prototype.setVisibilityState=function(n,v,r){if(!Array.isArray(n)){n=[n];}n=(r?this._collectNodesRecursively(n):n).filter(function(e,i,s){return s.indexOf(e)===i;});var d=n.filter(function(e){return e.visible!=v;},this);if(d.length>0){d.forEach(function(e){e.visible=v;},this);if(this.getShouldTrackVisibilityChanges()){d.forEach(this._visibilityTracker.trackNodeRef,this._visibilityTracker);}this.fireVisibilityChanged({visible:v?d:[],hidden:v?[]:d});}return this;};b.prototype.enumerateSelection=function(d){this._selectedNodes.forEach(d);return this;};b.prototype.getSelectionState=function(n){var s=this._selectedNodes;function i(d){return s.has(d);}return Array.isArray(n)?n.map(i):i(n);};b.prototype._applyColor=function(n,d){if(n&&n.material){if(!n.userData.originalMaterial){n.userData.originalMaterial=n.material;}if(n.userData.originalMaterial){n.material=n.userData.originalMaterial.clone();}var e=sap.ui.vk.abgrToColor(d);if(n.material.color){n.material.color.r=e.red/255.0;n.material.color.g=e.green/255.0;n.material.color.b=e.blue/255.0;n.material.opacity=e.alpha;}if(Math.abs(e.alpha-1.0)>0.0001){n.material.transparent=true;}}};b.prototype._applyOpacity=function(n,o){if(n&&n.material){if(!n.userData.originalMaterial){n.userData.originalMaterial=n.material;}if(n.userData.originalMaterial===n.material){n.material=n.userData.originalMaterial.clone();}n.material.opacity=o;if(Math.abs(o-1.0)>0.0001){n.material.transparent=true;}else{n.material.transparent=false;}}};b.prototype._resetColor=function(n){if(n&&n.material){if(typeof n.userData.beHighlighted=="undefined"){if(n.userData.tintColorABGR){this._applyColor(n,n.userData.tintColorABGR);}else if(n.userData.originalMaterial){n.material=n.userData.originalMaterial;}}if(n.userData.opacity){this._applyOpacity(n,n.userData.opacity);}else if(n.userData.beHighlighted){this._applyColor(n,this._highlightColorABGR);}}};b.prototype._isAChild=function(d,n){var e=d.parent;while(e){if(n.has(e)){return true;}e=e.parent;}return false;};b.prototype._ApplyHighlightingColor=function(n){this._applyColor(n,this._highlightColorABGR);if(n.userData.opacity){this._applyOpacity(n,n.userData.opacity);}n.userData.beHighlighted=true;var d=this._nodeHierarchy.getChildren(n);var e;for(e=0;e<d.length;e++){this._ApplyHighlightingColor(d[e]);}};b.prototype._RemoveHighlightingColor=function(n){if(!this._selectedNodes.has(n)){delete n.userData.beHighlighted;this._resetColor(n);var d=this._nodeHierarchy.getChildren(n);var e;for(e=0;e<d.length;e++){this._RemoveHighlightingColor(d[e]);}}};THREE.Object3D.prototype._calculateObjectOrientedBoundingBox=function(){var p=this.parent,m=this.matrix.clone(),d=this.matrixAutoUpdate;this.parent=null;this.matrix.identity();this.matrixAutoUpdate=false;this.userData.boundingBox=new THREE.Box3().setFromObject(this);this.matrixAutoUpdate=d;this.matrix.copy(m);this.parent=p;this.updateMatrixWorld(true);if(this.userData.boxHelper!==undefined){this.userData.boxHelper.update(this.userData.boundingBox);}};b.prototype._AddBoundingBox=function(n){if(n.userData.boundingBox===undefined){n._calculateObjectOrientedBoundingBox();}if(this._boundingBoxesScene&&n.userData.boxHelper===undefined){var d=new THREE.BoxHelper(n.userData.boundingBox,0xffff00);d.matrixWorld.copy(n.matrixWorld);d.matrix.copy(n.matrixWorld);d.matrixAutoUpdate=false;n.userData.boxHelper=d;this._boundingBoxesScene.add(d);}};b.prototype._RemoveBoundingBox=function(n){if(n.userData.boundingBox!==undefined){delete n.userData.boundingBox;}if(n.userData.boxHelper!==undefined){n.userData.boxHelper.parent.remove(n.userData.boxHelper);delete n.userData.boxHelper;}};b.prototype._updateBoundingBoxesTransformation=function(){this._selectedNodes.forEach(function(n){var d=n.userData.boxHelper;if(d!==undefined){n.updateMatrixWorld();d.matrixWorld.copy(n.matrixWorld);d.matrix.copy(n.matrixWorld);}});};b.prototype._updateBoundingBoxesIfNeeded=function(){var u=new Set();this._selectedNodes.forEach(function(n){var p=n.parent;while(p){if(this._selectedNodes.has(p)){u.add(p);}p=p.parent;}}.bind(this));u.forEach(function(n){n._calculateObjectOrientedBoundingBox();});};b.prototype.setShowSelectionBoundingBox=function(v){this._showSelectionBoundingBox=v;if(this._showSelectionBoundingBox){this._selectedNodes.forEach(function(n){this._AddBoundingBox(n);}.bind(this));}else{this._selectedNodes.forEach(function(n){this._RemoveBoundingBox(n);}.bind(this));}this.fireSelectionChanged({selected:this._selectedNodes,unselected:[]});};b.prototype.getShowSelectionBoundingBox=function(){return this._showSelectionBoundingBox;};b.prototype.setSelectionState=function(n,s,r){if(!Array.isArray(n)){n=[n];}n=(r?this._collectNodesRecursively(n):n).filter(function(v,i,h){return h.indexOf(v)===i;});var d=n.filter(function(h){return this._selectedNodes.has(h)!==s;},this);if(d.length>0){d.forEach(function(h){this._selectedNodes[s?"add":"delete"](h);},this);var e,f;var g=[];for(e=0;e<d.length;e++){if(!this._isAChild(d[e],this._selectedNodes)){g.push(d[e]);}}for(e=0;e<g.length;e++){if(s){this._ApplyHighlightingColor(g[e]);}else{this._RemoveHighlightingColor(g[e]);}}for(f=0;f<d.length;f++){if(s){if(this._showSelectionBoundingBox){this._AddBoundingBox(d[f]);}}else{this._RemoveBoundingBox(d[f]);}}this.fireSelectionChanged({selected:s?d:[],unselected:s?[]:d});}return this;};b.prototype._collectNodesRecursively=function(n){var r=[],t=this;n.forEach(function collectChildNodes(d){r.push(d);t._nodeHierarchy.enumerateChildren(d,collectChildNodes,false,true);});return r;};b.prototype._getOpacity=function(n){return n.userData&&n.userData.opacity?n.userData.opacity:null;};b.prototype.getOpacity=function(n){if(Array.isArray(n)){return n.map(this._getOpacity,this);}else{return this._getOpacity(n);}};b.prototype.setOpacity=function(n,o,r){if(!Array.isArray(n)){n=[n];}n=(r?this._collectNodesRecursively(n):n).filter(function(v,i,s){return s.indexOf(v)===i;});var d=n.filter(function(e){return this._getOpacity(e)!==o;},this);if(d.length>0){d.forEach(function(e){if(o){e.userData.opacity=o;}else{delete e.userData.opacity;}},this);d.forEach(function(e){this._resetColor(e);},this);this.fireOpacityChanged({changed:d,opacity:o});}return this;};b.prototype._getTintColorABGR=function(n){return n.userData&&n.userData.tintColorABGR?n.userData.tintColorABGR:null;};b.prototype._getTintColor=function(n){return n.userData&&n.userData.tintColorABGR?sap.ui.vk.colorToCSSColor(sap.ui.vk.abgrToColor(n.userData.tintColorABGR)):null;};b.prototype.getTintColor=function(n,i){var g=i?"_getTintColorABGR":"_getTintColor";if(Array.isArray(n)){return n.map(this[g],this);}else{return this[g](n);}};b.prototype.setTintColor=function(n,t,r){if(!Array.isArray(n)){n=[n];}var d=null;switch(typeof t){case"number":d=t;break;case"string":if(sap.ui.core.CSSColor.isValid(t)){d=sap.ui.vk.colorToABGR(sap.ui.vk.cssColorToColor(t));}break;default:t=null;break;}n=(r?this._collectNodesRecursively(n):n).filter(function(v,i,s){return s.indexOf(v)===i;});var e=n.filter(function(f){return this._getTintColorABGR(f)!==d;},this);if(e.length>0){e.forEach(function(f){if(d){f.userData.tintColorABGR=d;}else if(f.userData&&f.userData.tintColorABGR){delete f.userData.tintColorABGR;}},this);e.forEach(function(f){this._resetColor(f);},this);this.fireTintColorChanged({changed:e,tintColor:t,tintColorABGR:d});}return this;};b.prototype.setHighlightColor=function(d){switch(typeof d){case"number":this._highlightColorABGR=d;break;case"string":if(sap.ui.core.CSSColor.isValid(d)){this._highlightColorABGR=sap.ui.vk.colorToABGR(sap.ui.vk.cssColorToColor(d));}break;default:return this;}if(this._selectedNodes.size>0){this._selectedNodes.forEach(function(e){this._resetColor(e);},this);var s=Array.from(this._selectedNodes);for(var n=0;n<s.length;n++){this._ApplyHighlightingColor(s[n]);}this.fireHighlightColorChanged({highlightColor:sap.ui.vk.colorToCSSColor(sap.ui.vk.abgrToColor(this._highlightColorABGR)),highlightColorABGR:this._highlightColorABGR});}return this;};b.prototype.getHighlightColor=function(i){return i?this._highlightColorABGR:sap.ui.vk.colorToCSSColor(sap.ui.vk.abgrToColor(this._highlightColorABGR));};a=function(){this._visibilityChanges=new Set();};a.prototype.getInfo=function(n){var f=function(v){return v.type==="VE_LOCATOR";};var d=[];this._visibilityChanges.forEach(function(e){var g=n.createNodeProxy(e);var i=g.getVeIds();var v=q.grep(i,f)[0].fields[0].value;n.destroyNodeProxy(g);d.push(v);});return d;};a.prototype.clear=function(){this._visibilityChanges.clear();};a.prototype.trackNodeRef=function(n){if(this._visibilityChanges.has(n)){this._visibilityChanges.delete(n);}else{this._visibilityChanges.add(n);}};C.injectMethodsIntoClass(b);return b;});
