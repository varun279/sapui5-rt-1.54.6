sinaDefine(['../../core/core','./typeConverter'],function(c,t){return c.defineClass({_init:function(p){this.provider=p;this.sina=p.sina;},fillMetadataBuffer:function(d,a){if(d.attributesMetadata[0].id!=='dummy'){return;}d.attributesMetadata=[];d.attributeMetadataMap={};for(var i=0;i<a.length;++i){var b=a[i];this.fillPublicMetadataBuffer(d,b);}},fillPublicMetadataBuffer:function(d,a){var b=a.Displayed&&a.DisplayOrder?a.DisplayOrder:-1;var p=this.sina._createAttributeMetadata({id:a.Id,label:a.Name!==""?a.Name:a.Id,isKey:a.Key,isSortable:a.Sortable,usage:a.UIAreas?this.parseUsage(a,b):{},type:this.parseAttributeType(a),matchingStrategy:this.parseMatchingStrategy(a),isEmailAddress:(a.Semantics=="EMAIL.ADDRESS"),isPhoneNr:(a.Semantics=="TELEPHONE.TYPE"),isCurrency:(a.Semantics=="CURRENCYCODE"),isUnitOfMeasure:(a.Semantics=="UNITOFMEASURE"),isQuantity:(a.Semantics=="QUANTITY.UNITOFMEASURE")});if(a.Semantics=="QUANTITY.UNITOFMEASURE"||a.Semantics=="AMOUNT.CURRENCYCODE"){p.unitOfMeasureAttribute=a.UnitAttribute;}p.semanticObjectType=a.SemanticObjectTypeId;d.attributesMetadata.push(p);d.attributeMetadataMap[p.id]=p;},parseIsSortable:function(a){if(typeof a.IsSortable==='undefined'){return false;}return a.IsSortable;},parseMatchingStrategy:function(a){if(a.TextIndexed){return this.sina.MatchingStrategy.Text;}else{return this.sina.MatchingStrategy.Exact;}},parseAttributeType:function(a){for(var i=0;i<a.UIAreas.results.length;i++){var p=a.UIAreas.results[i];var b=p.Id;switch(b){case'SUMMARY':continue;case'DETAILS':continue;case'TITLE':continue;case'#HIDDEN':continue;case'FACTSHEET':continue;case'DETAILIMAGE':case'PREVIEWIMAGE':return this.sina.AttributeType.ImageUrl;case'LONGTEXT':return this.sina.AttributeType.Longtext;default:throw new c.Exception('Unknown presentation usage '+p);}}switch(a.EDMType){case'Edm.String':case'Edm.Binary':case'Edm.Boolean':case'Edm.Byte':case'Edm.Guid':return this.sina.AttributeType.String;case'Edm.Double':case'Edm.Decimal':case'Edm.Float':return this.sina.AttributeType.Double;case'Edm.Int16':case'Edm.Int32':case'Edm.Int64':return this.sina.AttributeType.Integer;case'Edm.Time':return this.sina.AttributeType.Time;case'Edm.DateTime':if(a.TypeLength>8){return this.sina.AttributeType.Timestamp;}else{return this.sina.AttributeType.Date;}case'GeoJson':return this.sina.AttributeType.GeoJson;default:throw new c.Exception('Unknown data type '+a.EDMType);}},parseUsage:function(a,d){var u=a.UIAreas.results;var b=a.Facet;var e={};u.forEach(function(f){var i=f.Id;if(i==="TITLE"){e.Title={displayOrder:d};}if(i==="SUMMARY"||i==="DETAILS"||i==="FACTSHEET"||i==="DETAILIMAGE"||i==="PREVIEWIMAGE"||i==="LONGTEXT"){e.Detail={displayOrder:d};}});if(b){e.AdvancedSearch={displayOrder:d};}return e;}});});
