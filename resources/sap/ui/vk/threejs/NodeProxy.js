/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["jquery.sap.global","../library","../NodeProxy"],function(q,l,N){"use strict";var a=N.extend("sap.ui.vk.threejs.NodeProxy",{metadata:{},constructor:function(n,o){N.call(this);this._object3D=o;}});a.prototype.destroy=function(){this._object3D=null;N.prototype.destroy.call(this);};a.prototype.getNodeRef=function(){return this._object3D;};a.prototype.getNodeId=function(){return this._object3D;};a.prototype.getVeIds=function(){return this._object3D.userData.veIds;};a.prototype.getMaterialId=function(){if(this._object3D.material!==undefined&&this._object3D.material.userData!==undefined&&this._object3D.material.userData.materialId!==undefined){return this._object3D.material.userData.materialId;}else if(this._object3D.userData.originalMaterial!==undefined&&this._object3D.userData.originalMaterial.userData!==undefined&&this._object3D.userData.originalMaterial.userData.materialId!==undefined){return this._object3D.userData.originalMaterial.userData.materialId;}return undefined;};a.prototype.getName=function(){return this._object3D.name||("<"+this._object3D.type+">");};a.prototype._updateAncestorsBoundingBox=function(){var p=this._object3D.parent;while(p){if(p.userData.boundingBox!==undefined){p._calculateObjectOrientedBoundingBox();}p=p.parent;}};a.prototype.getLocalMatrix=function(){return sap.ui.vk.TransformationMatrix.convertTo4x3(this._object3D.matrix.elements);};a.prototype.setLocalMatrix=function(v){if(v){var o=this._object3D;o.matrix.fromArray(sap.ui.vk.TransformationMatrix.convertTo4x4(v));o.matrix.decompose(o.position,o.quaternion,o.scale);o.matrixWorldNeedsUpdate=true;this._updateAncestorsBoundingBox();}this.setProperty("localMatrix",v,true);return this;};a.prototype.getWorldMatrix=function(){return sap.ui.vk.TransformationMatrix.convertTo4x3(this._object3D.matrixWorld.elements);};a.prototype.setWorldMatrix=function(v){if(v){var o=this._object3D;o.matrixWorld.fromArray(sap.ui.vk.TransformationMatrix.convertTo4x4(v));if(o.parent){o.matrix.multiplyMatrices(new THREE.Matrix4().getInverse(o.parent.matrixWorld),o.matrixWorld);}else{o.matrix.copy(o.matrixWorld);}o.matrix.decompose(o.position,o.quaternion,o.scale);this._updateAncestorsBoundingBox();}this.setProperty("worldMatrix",v,true);return this;};a.prototype.getOpacity=function(){return this._object3D.userData.opacity;};a.prototype.setOpacity=function(v){this._object3D.userData.opacity=v;this.setProperty("opacity",v,true);return this;};a.prototype.getTintColorABGR=function(){return this._object3D.userData.tintColor;};a.prototype.setTintColorABGR=function(v){this._object3D.userData.tintColor=v;this.setProperty("tintColorABGR",v,true);this.setProperty("tintColor",sap.ui.vk.colorToCSSColor(sap.ui.vk.abgrToColor(v)),true);return this;};a.prototype.getTintColor=function(){return sap.ui.vk.colorToCSSColor(sap.ui.vk.abgrToColor(this._object3D.userData.tintColor));};a.prototype.setTintColor=function(v){var b=sap.ui.vk.colorToABGR(sap.ui.vk.cssColorToColor(v));this._object3D.userData.tintColor=b;this.setProperty("tintColorABGR",b,true);this.setProperty("tintColor",v,true);return this;};a.prototype.getNodeMetadata=function(){return this._object3D.userData.metadata;};a.prototype.getHasChildren=function(){return this._object3D.children.length>0;};a.prototype.getClosed=function(){return!!this._object3D.userData.closed;};return a;});
