/*!
 * (c) Copyright 2010-2018 SAP SE or an SAP affiliate company.
 */
sap.ui.predefine('sap/zen/commons/library',['jquery.sap.global','sap/ui/base/DataType','sap/ui/core/library','sap/ui/layout/library'],function(q,D){"use strict";sap.ui.getCore().initLibrary({name:"sap.zen.commons",version:"1.54.6",dependencies:["sap.ui.core","sap.ui.layout"],types:["sap.zen.commons.layout.BackgroundDesign","sap.zen.commons.layout.HAlign","sap.zen.commons.layout.Padding","sap.zen.commons.layout.Separation","sap.zen.commons.layout.VAlign"],interfaces:[],controls:["sap.zen.commons.layout.AbsoluteLayout","sap.zen.commons.layout.MatrixLayout",],elements:["sap.zen.commons.layout.MatrixLayoutCell","sap.zen.commons.layout.MatrixLayoutRow","sap.zen.commons.layout.PositionContainer"]});sap.zen.commons.layout=sap.zen.commons.layout||{};sap.zen.commons.layout.BackgroundDesign={Border:"Border",Fill1:"Fill1",Fill2:"Fill2",Fill3:"Fill3",Header:"Header",Plain:"Plain",Transparent:"Transparent"};sap.zen.commons.layout.HAlign={Begin:"Begin",Center:"Center",End:"End",Left:"Left",Right:"Right"};sap.zen.commons.layout.Padding={None:"None",Begin:"Begin",End:"End",Both:"Both",Neither:"Neither"};sap.zen.commons.layout.Separation={None:"None",Small:"Small",SmallWithLine:"SmallWithLine",Medium:"Medium",MediumWithLine:"MediumWithLine",Large:"Large",LargeWithLine:"LargeWithLine"};sap.zen.commons.layout.VAlign={Bottom:"Bottom",Middle:"Middle",Top:"Top"};return sap.zen.commons;});
/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.predefine('sap/zen/commons/layout/AbsoluteLayout',['jquery.sap.global','./PositionContainer','sap/zen/commons/library','sap/ui/core/Control'],function(q,P,l,C){"use strict";
var A=C.extend("sap.zen.commons.layout.AbsoluteLayout",{metadata:{library:"sap.zen.commons",properties:{width:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:'100%'},height:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:'100%'},verticalScrolling:{type:"sap.ui.core.Scrolling",group:"Behavior",defaultValue:sap.ui.core.Scrolling.Hidden},horizontalScrolling:{type:"sap.ui.core.Scrolling",group:"Behavior",defaultValue:sap.ui.core.Scrolling.Hidden}},defaultAggregation:"positions",aggregations:{positions:{type:"sap.zen.commons.layout.PositionContainer",multiple:true,singularName:"position"}}}});
(function(){
A.prototype.setWidth=function(w){return s(this,"width",w,"LYT_SIZE");};
A.prototype.setHeight=function(h){return s(this,"height",h,"LYT_SIZE");};
A.prototype.setVerticalScrolling=function(v){return s(this,"verticalScrolling",v,"LYT_SCROLL");};
A.prototype.setHorizontalScrolling=function(h){return s(this,"horizontalScrolling",h,"LYT_SCROLL");};
A.prototype.insertPosition=function(p,i){var h=!!this.getDomRef();this.insertAggregation("positions",p,i,h);if(h&&p&&p.getControl()){this.contentChanged(p,"CTRL_ADD");}return this;};
A.prototype.addPosition=function(p){var h=!!this.getDomRef();this.addAggregation("positions",p,h);if(h&&p&&p.getControl()){this.contentChanged(p,"CTRL_ADD");}return this;};
A.prototype.removePosition=function(p){var h=!!this.getDomRef();var r=this.removeAggregation("positions",p,h);if(r){c([r]);this.contentChanged(r,"CTRL_REMOVE");}return r;};
A.prototype.removeAllPositions=function(){c(this.getPositions());var h=!!this.getDomRef();var r=this.removeAllAggregation("positions",h);if(h){this.contentChanged(r,"CTRL_REMOVE_ALL");}return r;};
A.prototype.destroyPositions=function(){c(this.getPositions());var h=!!this.getDomRef();this.destroyAggregation("positions",h);if(h){this.contentChanged(null,"CTRL_REMOVE_ALL");}return this;};
A.prototype.getContent=function(){var d=[];var p=this.getPositions();for(var i=0;i<p.length;i++){d.push(p[i].getControl());}return d;};
A.prototype.addContent=function(o,p){var d=P.createPosition(o,p);this.addPosition(d);return this;};
A.prototype.insertContent=function(o,i,p){var d=P.createPosition(o,p);this.insertPosition(d,i);return this;};
A.prototype.removeContent=function(v){var i=v;if(typeof(v)=="string"){v=sap.ui.getCore().byId(v);}if(typeof(v)=="object"){i=this.indexOfContent(v);}if(i>=0&&i<this.getContent().length){this.removePosition(i);return v;}return null;};
A.prototype.removeAllContent=function(){var d=this.getContent();this.removeAllPositions();return d;};
A.prototype.indexOfContent=function(o){var d=this.getContent();for(var i=0;i<d.length;i++){if(o===d[i]){return i;}}return-1;};
A.prototype.destroyContent=function(){this.destroyPositions();return this;};
A.prototype.setPositionOfChild=function(o,p){var i=this.indexOfContent(o);if(i>=0){var d=this.getPositions()[i];d.updatePosition(p);return true;}return false;};
A.prototype.getPositionOfChild=function(o){var i=this.indexOfContent(o);if(i>=0){var p=this.getPositions()[i];return p.getComputedPosition();}return{};};
A.prototype.exit=function(){c(this.getPositions());};
A.prototype.doBeforeRendering=function(){var p=this.getPositions();if(!p||p.length==0){return;}for(var i=0;i<p.length;i++){var o=p[i];o.reinitializeEventHandlers(true);a(o,true);}};
A.prototype.onAfterRendering=function(){var p=this.getPositions();if(!p||p.length==0){return;}for(var i=0;i<p.length;i++){p[i].reinitializeEventHandlers();}};
A.cleanUpControl=function(o){if(o&&o[S]){o.removeDelegate(o[S]);o[S]=undefined;}};
A.prototype.contentChanged=function(p,d){switch(d){case"CTRL_POS":sap.zen.commons.layout.AbsoluteLayoutRenderer.updatePositionStyles(p);a(p);p.reinitializeEventHandlers();break;case"CTRL_CHANGE":a(p,true);sap.zen.commons.layout.AbsoluteLayoutRenderer.updatePositionedControl(p);p.reinitializeEventHandlers();break;case"CTRL_REMOVE":sap.zen.commons.layout.AbsoluteLayoutRenderer.removePosition(p);p.reinitializeEventHandlers(true);break;case"CTRL_REMOVE_ALL":sap.zen.commons.layout.AbsoluteLayoutRenderer.removeAllPositions(this);var e=p;if(e){for(var i=0;i<e.length;i++){e[i].reinitializeEventHandlers(true);}}break;case"CTRL_ADD":a(p,true);sap.zen.commons.layout.AbsoluteLayoutRenderer.insertPosition(this,p);p.reinitializeEventHandlers();break;case"LYT_SCROLL":sap.zen.commons.layout.AbsoluteLayoutRenderer.updateLayoutScolling(this);break;case"LYT_SIZE":sap.zen.commons.layout.AbsoluteLayoutRenderer.updateLayoutSize(this);break;}};
var S="__absolutelayout__delegator";var c=function(p){for(var i=0;i<p.length;i++){var o=p[i];var d=o.getControl();if(d){A.cleanUpControl(d);}}};var a=function(p,r){var o=p.getControl();if(o){A.cleanUpControl(o);if(!r){b(o);}var d=(function(e){return{onAfterRendering:function(){b(e);}};}(o));o[S]=d;o.addDelegate(d,true);}};var b=function(o){var d=false;if(o.getParent()&&o.getParent().getComputedPosition){var p=o.getParent().getComputedPosition();if(p.top&&p.bottom||p.height){q(o.getDomRef()).css("height","100%");d=true;}if(p.left&&p.right||p.width){q(o.getDomRef()).css("width","100%");d=true;}if(d){sap.zen.commons.layout.AbsoluteLayoutRenderer.updatePositionStyles(o.getParent());}}return d;};var s=function(t,p,v,d){var h=!!t.getDomRef();t.setProperty(p,v,h);if(h){t.contentChanged(null,d);}return t;};}());return A;},true);
sap.ui.predefine('sap/zen/commons/layout/AbsoluteLayoutRenderer',['jquery.sap.global'],function(q){"use strict";var A={};(function(){
A.render=function(r,c){var a=r;c.doBeforeRendering();a.write("<div");a.writeControlData(c);a.addClass("sapUiLayoutAbs");a.addClass("sapUiLayoutAbsOvrflwY"+c.getVerticalScrolling());a.addClass("sapUiLayoutAbsOvrflwX"+c.getHorizontalScrolling());a.writeClasses();var s="width:"+c.getWidth()+";height:"+c.getHeight()+";";a.writeAttribute("style",s);var t=c.getTooltip_AsString();if(t){a.writeAttributeEscaped("title",t);}a.write(">");var p=c.getPositions();if(p&&p.length>0){for(var i=0;i<p.length;i++){var P=p[i];var C=P.getControl();if(C){a.write("<div");a.writeElementData(P);a.writeAttribute("class","sapUiLayoutAbsPos");a.writeAttribute("style",g(P));t=P.getTooltip_AsString();if(t){a.writeAttributeEscaped("title",t);}a.write(">");a.renderControl(C);a.write("</div>");}}}a.write("</div>");};
A.updateLayoutSize=function(l){q(l.getDomRef()).css("width",l.getWidth()).css("height",l.getHeight());};
A.updateLayoutScolling=function(l){var L=q(l.getDomRef());for(var s in sap.ui.core.Scrolling){L.removeClass("sapUiLayoutAbsOvrflwY"+s).removeClass("sapUiLayoutAbsOvrflwX"+s);}L.addClass("sapUiLayoutAbsOvrflwY"+l.getVerticalScrolling()).addClass("sapUiLayoutAbsOvrflwX"+l.getHorizontalScrolling());};
A.updatePositionStyles=function(p){q(p.getDomRef()).attr("style",g(p));};
A.removePosition=function(p){q(p.getDomRef()).remove();};
A.removeAllPositions=function(l){q(l.getDomRef()).html("");};
A.updatePositionedControl=function(p){A.updatePositionStyles(p);var r=sap.ui.getCore().createRenderManager();r.renderControl(p.getControl());r.flush(p.getDomRef());r.destroy();};
A.insertPosition=function(l,p){var i=l.indexOfPosition(p);var P=l.getPositions();var o=null;while(i>0){i--;if(P[i].getDomRef()){o=P[i];break;}}var h="<div id=\""+p.getId()+"\" data-sap-ui=\""+p.getId()+"\" class=\"sapUiLayoutAbsPos\"></div>";if(!o){q(l.getDomRef()).prepend(h);}else{q(o.getDomRef()).after(h);}A.updatePositionedControl(p);};
var g=function(p){var P=p.getComputedPosition();var a=function(p,b,s,v){if(v){b.push(s+":"+v+";");}};var b=[];a(p,b,"top",P.top);a(p,b,"bottom",P.bottom);a(p,b,"left",P.left);a(p,b,"right",P.right);a(p,b,"width",P.width);a(p,b,"height",P.height);return b.join("");};}());return A;},true);
sap.ui.predefine('sap/zen/commons/layout/MatrixLayout',['jquery.sap.global','./MatrixLayoutCell','./MatrixLayoutRow','sap/zen/commons/library','sap/ui/core/Control','sap/ui/core/EnabledPropagator'],function(q,M,a,l,C,E){"use strict";
var b=C.extend("sap.zen.commons.layout.MatrixLayout",{metadata:{library:"sap.zen.commons",properties:{width:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:null},height:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:null},layoutFixed:{type:"boolean",group:"Appearance",defaultValue:true},columns:{type:"int",group:"Appearance",defaultValue:null},widths:{type:"sap.ui.core.CSSSize[]",group:"Appearance",defaultValue:null}},defaultAggregation:"rows",aggregations:{rows:{type:"sap.zen.commons.layout.MatrixLayoutRow",multiple:true,singularName:"row"}}}});
E.call(b.prototype,true,true);
b.prototype.createRow=function(){var r=new a();this.addRow(r);for(var i=0;i<arguments.length;i++){var c=arguments[i];var o;if(c instanceof M){o=c;}else if(c instanceof C){o=new M({content:c});}else if(c instanceof Object&&c.height){r.setHeight(c.height);}else{var t=c?c.toString():"";o=new M({content:new sap.zen.commons.TextView({text:t})});}r.addCell(o);}return this;};
b.prototype.setWidths=function(w){var s;if(!q.isArray(w)){s=q.makeArray(arguments);}else{s=w;}for(var i=0;i<s.length;i++){if(s[i]==""||!s[i]){s[i]="auto";}}this.setProperty("widths",s);return this;};
return b;},true);
sap.ui.predefine('sap/zen/commons/layout/MatrixLayoutCell',['jquery.sap.global','sap/zen/commons/library','sap/ui/core/CustomStyleClassSupport','sap/ui/core/Element'],function(q,l,C,E){"use strict";
var M=E.extend("sap.zen.commons.layout.MatrixLayoutCell",{metadata:{library:"sap.zen.commons",aggregatingType:"MatrixLayoutRow",properties:{backgroundDesign:{type:"sap.zen.commons.layout.BackgroundDesign",defaultValue:'Transparent'},colSpan:{type:"int",defaultValue:1},hAlign:{type:"sap.zen.commons.layout.HAlign",defaultValue:'Begin'},padding:{type:"sap.zen.commons.layout.Padding",defaultValue:'End'},rowSpan:{type:"int",defaultValue:1},separation:{type:"sap.zen.commons.layout.Separation",defaultValue:'None'},vAlign:{type:"sap.zen.commons.layout.VAlign",defaultValue:'Middle'}},defaultAggregation:"content",aggregations:{content:{type:"sap.ui.core.Control",multiple:true,singularName:"content"}}}});
C.apply(M.prototype);return M;},true);
sap.ui.predefine('sap/zen/commons/layout/MatrixLayoutRenderer',['jquery.sap.global'],function(q){"use strict";var M={};
M.render=function(R,m){var a=R;var r=M;var b=sap.ui.getCore().getConfiguration().getRTL();var i=0;var j=0;var c=0;var l=0;var o;var C;var d;var e;var f;var s;var v;a.write("<TABLE role=\"presentation\"");a.writeControlData(m);a.write(" cellpadding=\"0\" cellspacing=\"0\"");a.addStyle("border-collapse","collapse");var g=m.getWidth();if(g){a.addStyle("width",g);}var h=m.getHeight();if(h&&h!='auto'){a.addStyle("height",h);e=r.getValueUnit(h);}if(m.getLayoutFixed()){a.addStyle("table-layout","fixed");if(!g){a.addStyle("width","100%");}}a.addClass("sapUiMlt");a.writeStyles();a.writeClasses();if(m.getTooltip_AsString()){a.writeAttributeEscaped('title',m.getTooltip_AsString());}a.write('>');var k=m.getRows();var n=m.getColumns();if(n<1){for(i=0;i<k.length;i++){o=k[i];C=o.getCells();if(n<C.length){n=C.length;}}}if(n>0){var w=m.getWidths();a.write("<colgroup>");for(j=0;j<n;j++){a.write("<col");if(w&&w[j]&&w[j]!="auto"){a.addStyle('width',w[j]);a.writeStyles();}a.write("></col>");}a.write("</colgroup>");}var D=true;var p=false;a.write('<TBODY style="width: 100%; height: 100%">');for(i=0;i<k.length;i++){o=k[i];var t=o.getHeight();if(t=="auto"){t="";}if(t&&e){f=r.getValueUnit(t);if(f.Unit=='%'&&e.Unit!='%'){t=(e.Value*f.Value/100)+e.Unit;}}a.write("<tr");a.writeElementData(o);a.writeClasses(o);if(o.getTooltip_AsString()){a.writeAttributeEscaped('title',o.getTooltip_AsString());}if(sap.ui.Device.browser.internet_explorer&&sap.ui.Device.browser.version>=9&&t){a.addStyle("height",t);a.writeStyles();}a.write(">");C=o.getCells();var u=n;if(n<1){u=C.length;}p=false;var y=0;if(!o.RowSpanCells){o.RowSpanCells=0;}else{p=true;}for(j=0;j<u;j++){if(j>=(u-y-o.RowSpanCells)){break;}var z=C[j];a.write("<td");if(t&&(!z||z.getRowSpan()==1)){a.addStyle("height",t);}if(z){a.writeElementData(z);if(z.getTooltip_AsString()){a.writeAttributeEscaped('title',z.getTooltip_AsString());}if(m.getLayoutFixed()&&z.getContent().length>0){a.addStyle("overflow","hidden");}var H=r.getHAlignClass(z.getHAlign(),b);if(H){a.addClass(H);}v=r.getVAlign(z.getVAlign());if(v){a.addStyle("vertical-align",v);}if(z.getColSpan()>1){a.writeAttribute("colspan",z.getColSpan());y=y+z.getColSpan()-1;p=true;}if(z.getRowSpan()>1){a.writeAttribute("rowspan",z.getRowSpan());var V=0;var U="";for(var x=0;x<z.getRowSpan();x++){var A=k[i+x];if(!A){U=false;break;}if(!A.RowSpanCells){A.RowSpanCells=0;}if(x>0){A.RowSpanCells=A.RowSpanCells+z.getColSpan();}var B=A.getHeight();if(!B||B=="auto"){U=false;}else{var E=r.getValueUnit(B);if(E.Unit=='%'&&e.Unit!='%'){E.Value=(e.Value*f.Value/100);E.Unit=e.Unit;}if(U==""){U=E.Unit;}else if(U!=E.Unit){U=false;}V=V+E.Value;}}if(U!=false){s=V+U;a.addStyle("height",s);}}a.addClass(r.getBackgroundClass(z.getBackgroundDesign()));a.addClass(r.getSeparationClass(z.getSeparation()));if(!m.getLayoutFixed()||!t){a.addClass(r.getPaddingClass(z.getPadding()));a.addClass("sapUiMltCell");}else{a.addStyle("white-space","nowrap");}a.writeClasses(z);}a.writeStyles();a.write(">");if(z){if(m.getLayoutFixed()&&t){a.write('<div');if(z.getRowSpan()!=1&&s&&s.search('%')==-1){a.addStyle("height",s);}else if(t.search('%')!=-1||(z.getRowSpan()!=1&&!s)){a.addStyle("height",'100%');}else{a.addStyle("height",t);}a.addStyle("display","inline-block");if(v){a.addStyle("vertical-align",v);}a.writeStyles();a.writeClasses(false);a.write("></div>");a.write('<div');a.addStyle("display","inline-block");if(v){a.addStyle("vertical-align",v);}if(z.getRowSpan()!=1&&s&&s.search('%')==-1){a.addStyle("max-height",s);}else if(t.search('%')!=-1||(z.getRowSpan()!=1&&!s)){a.addStyle("max-height",'100%');}else{a.addStyle("max-height",t);}var F="0";var G="";var I="0";d=z.getContent();for(c=0,l=d.length;c<l;c++){if(d[c].getHeight&&d[c].getHeight()!=""){var J=r.getValueUnit(d[c].getHeight());if(J){if(G==""){G=J.Unit;}if(G!=J.Unit){G="%";F="100";break;}if(J.Unit=="%"){if(parseFloat(F)<parseFloat(J.Value)){F=J.Value;if(F!="100"){I=10000/parseFloat(F);}}}}}}if(F!="0"){a.addStyle("height",F+G);}a.addStyle("white-space","normal");a.addStyle("width","100%");a.writeStyles();a.writeClasses(false);a.write("><div");a.addStyle("overflow","hidden");a.addStyle("text-overflow","inherit");if(F!="0"){if(I!="0"){a.addStyle("height",I+"%");}else{a.addStyle("height","100%");}}a.addClass("sapUiMltCell");a.addClass(r.getPaddingClass(z.getPadding()));a.writeStyles();a.writeClasses(false);a.write(">");}d=z.getContent();for(c=0,l=d.length;c<l;c++){R.renderControl(d[c]);}if(m.getLayoutFixed()&&t){a.write("</div></div>");}}a.write("</td>");}a.write("</tr>");o.RowSpanCells=undefined;if(!p){D=false;}}if(D&&sap.ui.Device.browser.internet_explorer&&sap.ui.Device.browser.version>=9){a.write("<tr style='height:0;'>");for(i=0;i<n;i++){a.write("<td></td>");}a.write("</tr>");}a.write("</TBODY></TABLE>");};
M.getHAlignClass=function(h,r){var c="sapUiMltCellHAlign";switch(h){case sap.zen.commons.layout.HAlign.Begin:return null;case sap.zen.commons.layout.HAlign.Center:return c+"Center";case sap.zen.commons.layout.HAlign.End:return c+(r?"Left":"Right");case sap.zen.commons.layout.HAlign.Left:return r?c+"Left":null;case sap.zen.commons.layout.HAlign.Right:return r?null:c+"Right";default:return null;}};
M.getVAlign=function(v){switch(v){case sap.zen.commons.layout.VAlign.Bottom:return"bottom";case sap.zen.commons.layout.VAlign.Middle:return"middle";case sap.zen.commons.layout.VAlign.Top:return"top";default:return null;}};
M.getBackgroundClass=function(b){switch(b){case sap.zen.commons.layout.BackgroundDesign.Border:return"sapUiMltBgBorder";case sap.zen.commons.layout.BackgroundDesign.Fill1:return"sapUiMltBgFill1";case sap.zen.commons.layout.BackgroundDesign.Fill2:return"sapUiMltBgFill2";case sap.zen.commons.layout.BackgroundDesign.Fill3:return"sapUiMltBgFill3";case sap.zen.commons.layout.BackgroundDesign.Header:return"sapUiMltBgHeader";case sap.zen.commons.layout.BackgroundDesign.Plain:return"sapUiMltBgPlain";case sap.zen.commons.layout.BackgroundDesign.Transparent:return null;default:return null;}};
M.getPaddingClass=function(p){switch(p){case sap.zen.commons.layout.Padding.None:return"sapUiMltPadNone";case sap.zen.commons.layout.Padding.Begin:return"sapUiMltPadLeft";case sap.zen.commons.layout.Padding.End:return"sapUiMltPadRight";case sap.zen.commons.layout.Padding.Both:return"sapUiMltPadBoth";case sap.zen.commons.layout.Padding.Neither:return"sapUiMltPadNeither";default:return null;}};
M.getSeparationClass=function(s){switch(s){case sap.zen.commons.layout.Separation.None:return null;case sap.zen.commons.layout.Separation.Small:return"sapUiMltSepS";case sap.zen.commons.layout.Separation.SmallWithLine:return"sapUiMltSepSWL";case sap.zen.commons.layout.Separation.Medium:return"sapUiMltSepM";case sap.zen.commons.layout.Separation.MediumWithLine:return"sapUiMltSepMWL";case sap.zen.commons.layout.Separation.Large:return"sapUiMltSepL";case sap.zen.commons.layout.Separation.LargeWithLine:return"sapUiMltSepLWL";default:return null;}};
M.getValueUnit=function(s){var v=0;var u="";var p=s.search('px');if(p>-1){u="px";v=parseInt(s.slice(0,p),10);return({Value:v,Unit:u});}p=s.search('pt');if(p>-1){u="pt";v=parseFloat(s.slice(0,p));return({Value:v,Unit:u});}p=s.search('in');if(p>-1){u="in";v=parseFloat(s.slice(0,p));return({Value:v,Unit:u});}p=s.search('mm');if(p>-1){u="mm";v=parseFloat(s.slice(0,p));return({Value:v,Unit:u});}p=s.search('cm');if(p>-1){u="cm";v=parseFloat(s.slice(0,p));return({Value:v,Unit:u});}p=s.search('em');if(p>-1){u="em";v=parseFloat(s.slice(0,p));return({Value:v,Unit:u});}p=s.search('ex');if(p>-1){u="ex";v=parseFloat(s.slice(0,p));return({Value:v,Unit:u});}p=s.search('%');if(p>-1){u="%";v=parseFloat(s.slice(0,p));return({Value:v,Unit:u});}};
return M;},true);
sap.ui.predefine('sap/zen/commons/layout/MatrixLayoutRow',['jquery.sap.global','sap/zen/commons/library','sap/ui/core/CustomStyleClassSupport','sap/ui/core/Element'],function(q,l,C,E){"use strict";
var M=E.extend("sap.zen.commons.layout.MatrixLayoutRow",{metadata:{library:"sap.zen.commons",aggregatingType:"MatrixLayout",properties:{height:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:null}},defaultAggregation:"cells",aggregations:{cells:{type:"sap.zen.commons.layout.MatrixLayoutCell",multiple:true,singularName:"cell"}}}});
C.apply(M.prototype);return M;},true);
sap.ui.predefine('sap/zen/commons/layout/PositionContainer',['jquery.sap.global','sap/zen/commons/library','sap/ui/core/Element'],function(q,l,E){"use strict";
var P=E.extend("sap.zen.commons.layout.PositionContainer",{metadata:{library:"sap.zen.commons",properties:{top:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:null},bottom:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:null},left:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:null},right:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:null},centerHorizontally:{type:"boolean",group:"Dimension",defaultValue:false},centerVertically:{type:"boolean",group:"Dimension",defaultValue:false}},defaultAggregation:"control",aggregations:{control:{type:"sap.ui.core.Control",multiple:false}}}});
(function(){
P.prototype.setControl=function(C){c(this);if(this.getDomRef()){this.setAggregation("control",C,true);n(this,C?"CTRL_CHANGE":"CTRL_REMOVE");}else{if(this.getParent()&&this.getParent().getDomRef()){this.setAggregation("control",C,true);if(C){n(this,"CTRL_ADD");}}else{this.setAggregation("control",C);}}if(C){C.attachEvent("_change",o,this);}return this;};
P.prototype.destroyControl=function(){c(this);var S=!!this.getDomRef();this.destroyAggregation("control",S);if(S){n(this,"CTRL_REMOVE");}return this;};
P.prototype.setTop=function(t){s(this,"top",t,true);return this;};
P.prototype.setBottom=function(B){s(this,"bottom",B,true);return this;};
P.prototype.setLeft=function(L){s(this,"left",L,true);return this;};
P.prototype.setRight=function(r){s(this,"right",r,true);return this;};
P.prototype.setCenterHorizontally=function(C){s(this,"centerHorizontally",C,true);return this;};
P.prototype.setCenterVertically=function(C){s(this,"centerVertically",C,true);return this;};
P.prototype.updatePosition=function(p){if(!p){p={};}s(this,"centerHorizontally",p.centerHorizontally?p.centerHorizontally:null);s(this,"centerVertically",p.centerVertically?p.centerVertically:null);s(this,"left",p.left?p.left:null);s(this,"right",p.right?p.right:null);s(this,"top",p.top?p.top:null);var N=s(this,"bottom",p.bottom?p.bottom:null);if(N){n(this,"CTRL_POS");}};
P.prototype.getComputedPosition=function(){var t=this.getTop();var B=this.getBottom();var L=this.getLeft();var r=this.getRight();var w=null;var h=null;var C=this.getControl();if(C){if(this.getCenterHorizontally()){L="50%";r=null;}else{if(!a(this,C,"width","left",L,"right",r)){r=undefined;}if(!L&&!r){L="0px";}}if(this.getCenterVertically()){t="50%";B=null;}else{if(!a(this,C,"height","top",t,"bottom",B)){B=undefined;}if(!t&&!B){t="0px";}}w=b(C,"width");h=b(C,"height");}return{top:t,bottom:B,left:L,right:r,width:w,height:h};};
P.createPosition=function(C,p){var d=new P();d.setControl(C);if(p){if(p.left){d.setLeft(p.left);}if(p.right){d.setRight(p.right);}if(p.top){d.setTop(p.top);}if(p.bottom){d.setBottom(p.bottom);}if(p.centerHorizontally){d.setCenterHorizontally(p.centerHorizontally);}if(p.centerVertically){d.setCenterVertically(p.centerVertically);}}return d;};
P.prototype.reinitializeEventHandlers=function(C){if(this._sResizeListenerId){sap.ui.core.ResizeHandler.deregister(this._sResizeListenerId);this._sResizeListenerId=null;}if(!C&&this.getDomRef()&&(this.getCenterHorizontally()||this.getCenterVertically())){var t=this;var d=function(){var r=q(t.getDomRef());if(t.getCenterHorizontally()){r.css("margin-left","-"+r.children().outerWidth()/2+"px");}if(t.getCenterVertically()){r.css("margin-top","-"+r.children().outerHeight()/2+"px");}};this._sResizeListenerId=sap.ui.core.ResizeHandler.register(this.getDomRef(),d);d();}};
P.prototype.exit=function(p){this.reinitializeEventHandlers(true);};
P.prototype.init=function(){this._disableWidthCheck=true;this._disableHeightCheck=false;};
var s=function(t,p,v,N){var S=!!t.getDomRef();t.setProperty(p,v,S);if(S&&N){n(t,"CTRL_POS");}return S;};var n=function(t,C){var L=t.getParent();if(L){L.contentChanged(t,C);}};var c=function(t){var C=t.getControl();if(C){sap.zen.commons.layout.AbsoluteLayout.cleanUpControl(C);C.detachEvent("_change",o,t);}};var a=function(p,C,d,e,v,f,V){if(v&&V){var L=p.getParent();var h=g(C,d);if(h){var i=C[h._sGetter]();if(!(!i||i==""||i=="auto"||i=="inherit")){q.sap.log.warning("Position "+f+"="+V+" ignored, because child control "+C.getId()+" has fixed "+d+" ("+i+").","","AbsoluteLayout '"+(L?L.getId():"_undefined")+"'");return false;}}else{if((d==="width"&&!p._disableWidthCheck)||(d==="height"&&!p._disableHeightCheck)){q.sap.log.warning("Position "+f+"="+V+" ignored, because child control "+C.getId()+" not resizable.","","AbsoluteLayout '"+(L?L.getId():"_undefined")+"'");return false;}}}return true;};var g=function(C,p){var d=C.getMetadata().getProperty(p);if(d&&d.type==='sap.ui.core.CSSSize'){return d;}return null;};var b=function(C,d){var p=g(C,d);if(p){var v=C[p._sGetter]();if(v&&q.sap.endsWith(v,"%")){return v;}}return null;};var o=function(e){var p=e.getParameter("name");var d=this.getParent();if((p==="width"||p==="height")&&d&&d.getDomRef()){n(this,"CTRL_POS");}};}());return P;},true);
jQuery.sap.registerPreloadedModules({
"name":"sap/zen/commons/library-preload",
"version":"2.0",
"modules":{
	"sap/zen/commons/manifest.json":'{"_version":"1.9.0","sap.app":{"id":"sap.zen.commons","type":"library","embeds":[],"applicationVersion":{"version":"1.54.6"},"title":"Layout components used by Design Studio.","description":"Layout components used by Design Studio.  NOT INTENDED FOR STANDALONE USAGE.","ach":"BI-RA-AD-EA","resources":"resources.json","offline":true},"sap.ui":{"technology":"UI5","supportedThemes":["base","sap_belize","sap_belize_hcb","sap_belize_hcw","sap_belize_plus","sap_bluecrystal","sap_hcb"]},"sap.ui5":{"dependencies":{"minUI5Version":"1.54","libs":{"sap.ui.core":{"minVersion":"1.54.0"},"sap.ui.layout":{"minVersion":"1.54.0"}}},"library":{"i18n":false,"content":{"controls":["sap.zen.commons.layout.AbsoluteLayout","sap.zen.commons.layout.MatrixLayout"],"elements":["sap.zen.commons.layout.MatrixLayoutCell","sap.zen.commons.layout.MatrixLayoutRow","sap.zen.commons.layout.PositionContainer"],"types":["sap.zen.commons.layout.BackgroundDesign","sap.zen.commons.layout.HAlign","sap.zen.commons.layout.Padding","sap.zen.commons.layout.Separation","sap.zen.commons.layout.VAlign"],"interfaces":[]}}}}'
}});
//# sourceMappingURL=library-preload.js.map