(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["NYMEXCollection"],{"4ec9":function(t,e,n){"use strict";var r=n("6d61"),o=n("6566");r("Map",(function(t){return function(){return t(this,arguments.length?arguments[0]:void 0)}}),o)},6062:function(t,e,n){"use strict";var r=n("6d61"),o=n("6566");r("Set",(function(t){return function(){return t(this,arguments.length?arguments[0]:void 0)}}),o)},6566:function(t,e,n){"use strict";var r=n("9bf2").f,o=n("7c73"),i=n("e2cc"),a=n("0366"),s=n("19aa"),u=n("2266"),c=n("7dd0"),l=n("2626"),d=n("83ab"),f=n("f183").fastKey,v=n("69f3"),h=v.set,p=v.getterFor;t.exports={getConstructor:function(t,e,n,c){var l=t((function(t,r){s(t,v),h(t,{type:e,index:o(null),first:void 0,last:void 0,size:0}),d||(t.size=0),void 0!=r&&u(r,t[c],{that:t,AS_ENTRIES:n})})),v=l.prototype,x=p(e),y=function(t,e,n){var r,o,i=x(t),a=g(t,e);return a?a.value=n:(i.last=a={index:o=f(e,!0),key:e,value:n,previous:r=i.last,next:void 0,removed:!1},i.first||(i.first=a),r&&(r.next=a),d?i.size++:t.size++,"F"!==o&&(i.index[o]=a)),t},g=function(t,e){var n,r=x(t),o=f(e);if("F"!==o)return r.index[o];for(n=r.first;n;n=n.next)if(n.key==e)return n};return i(v,{clear:function(){var t=this,e=x(t),n=e.index,r=e.first;while(r)r.removed=!0,r.previous&&(r.previous=r.previous.next=void 0),delete n[r.index],r=r.next;e.first=e.last=void 0,d?e.size=0:t.size=0},delete:function(t){var e=this,n=x(e),r=g(e,t);if(r){var o=r.next,i=r.previous;delete n.index[r.index],r.removed=!0,i&&(i.next=o),o&&(o.previous=i),n.first==r&&(n.first=o),n.last==r&&(n.last=i),d?n.size--:e.size--}return!!r},forEach:function(t){var e,n=x(this),r=a(t,arguments.length>1?arguments[1]:void 0);while(e=e?e.next:n.first){r(e.value,e.key,this);while(e&&e.removed)e=e.previous}},has:function(t){return!!g(this,t)}}),i(v,n?{get:function(t){var e=g(this,t);return e&&e.value},set:function(t,e){return y(this,0===t?0:t,e)}}:{add:function(t){return y(this,t=0===t?0:t,t)}}),d&&r(v,"size",{get:function(){return x(this).size}}),l},setStrong:function(t,e,n){var r=e+" Iterator",o=p(e),i=p(r);c(t,e,(function(t,e){h(this,{type:r,target:t,state:o(t),kind:e,last:void 0})}),(function(){var t=i(this),e=t.kind,n=t.last;while(n&&n.removed)n=n.previous;return t.target&&(t.last=n=n?n.next:t.state.first)?"keys"==e?{value:n.key,done:!1}:"values"==e?{value:n.value,done:!1}:{value:[n.key,n.value],done:!1}:(t.target=void 0,{value:void 0,done:!0})}),n?"entries":"values",!n,!0),l(e)}}},"6d61":function(t,e,n){"use strict";var r=n("23e7"),o=n("da84"),i=n("e330"),a=n("94ca"),s=n("6eeb"),u=n("f183"),c=n("2266"),l=n("19aa"),d=n("1626"),f=n("861d"),v=n("d039"),h=n("1c7e"),p=n("d44e"),x=n("7156");t.exports=function(t,e,n){var y=-1!==t.indexOf("Map"),g=-1!==t.indexOf("Weak"),b=y?"set":"add",m=o[t],w=m&&m.prototype,S=m,_={},k=function(t){var e=i(w[t]);s(w,t,"add"==t?function(t){return e(this,0===t?0:t),this}:"delete"==t?function(t){return!(g&&!f(t))&&e(this,0===t?0:t)}:"get"==t?function(t){return g&&!f(t)?void 0:e(this,0===t?0:t)}:"has"==t?function(t){return!(g&&!f(t))&&e(this,0===t?0:t)}:function(t,n){return e(this,0===t?0:t,n),this})},C=a(t,!d(m)||!(g||w.forEach&&!v((function(){(new m).entries().next()}))));if(C)S=n.getConstructor(e,t,y,b),u.enable();else if(a(t,!0)){var Y=new S,E=Y[b](g?{}:-0,1)!=Y,z=v((function(){Y.has(1)})),M=h((function(t){new m(t)})),F=!g&&v((function(){var t=new m,e=5;while(e--)t[b](e,e);return!t.has(-0)}));M||(S=e((function(t,e){l(t,w);var n=x(new m,t,S);return void 0!=e&&c(e,n[b],{that:n,AS_ENTRIES:y}),n})),S.prototype=w,w.constructor=S),(z||F)&&(k("delete"),k("has"),y&&k("get")),(F||E)&&k(b),g&&w.clear&&delete w.clear}return _[t]=S,r({global:!0,forced:S!=m},_),p(S,t),g||n.setStrong(S,t,y),S}},a14a:function(t,e,n){"use strict";n.r(e);var r=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",[n("v-select",{attrs:{items:t.years,value:t.maxYear,label:"Year",outlined:""},on:{change:function(e){return t.onUpdateStore("year",e)}}}),n("v-simple-table",{scopedSlots:t._u([{key:"default",fn:function(){return[n("thead",[n("tr",[n("th",{staticClass:"text-left"},[t._v(" Month ")]),n("th",{staticClass:"text-left"},[t._v(" Calendar Month Avg. ")]),n("th",{staticClass:"text-left"},[t._v(" NYMEX Roll ")]),n("th",{staticClass:"text-left"},[t._v(" Excel File ")])])]),n("tbody",t._l(t.filteredCollection,(function(e){return n("tr",{key:e.id},[n("td",[t._v(t._s(t.getMonth(e.date,"long")))]),n("td",[t._v("$"+t._s(t.roundHalfUp(e.average,2)))]),n("td",[t._v("$"+t._s(t.roundHalfUp(e.roll,2)))]),n("td",[n("div",[n("a",{attrs:{href:t.fileLink(e.Spreadsheet.filename_download)}},[t._v("Download")]),n("v-icon",{attrs:{color:"secondary"}},[t._v("mdi-file-xlsx-box")])],1)])])})),0)]},proxy:!0}])})],1)},o=[],i=n("2909"),a=(n("99af"),n("b680"),n("a9e3"),n("4e827"),n("d3b7"),n("6062"),n("3ca3"),n("ddb0"),n("d81d"),n("4de4"),n("25f0"),n("c0d6")),s=n("9944"),u={name:"NYMEXCollection",data:function(){return{items:[],API:"https://dev-onrr-frontend.app.cloud.gov"}},props:{collection:[Object,Array],collectionName:String,collectionLayout:String,showToolbar:Boolean},components:{},methods:{fileLink:function(t){var e="".concat(this.API,"/document/").concat(t);return e},getDay:s["c"],getMonth:s["e"],getFullDate:s["d"],getYear:s["f"],year:function(){return a["b"].collections.year>this.maxYear||!a["b"].collections.year?this.maxYear:a["b"].collections.year},onUpdateStore:function(t,e){a["a"].updateCollections(t,e)},roundHalfUp:function(t,e){return Number(Math.round(t+"e"+e)+"e-"+e).toFixed(e)}},computed:{search:function(){return a["b"].collections.searchQuery},maxYear:function(){var t=this;if(this.collection){var e=Object(i["a"])(new Set(this.collection.map((function(e){return t.getYear(e.date)})))).sort((function(t,e){return t-e})).pop();return e}return 2022},years:function(){var t=this;if(this.collection){var e=Object(i["a"])(new Set(this.collection.map((function(e){return t.getYear(e.date)})))).sort((function(t,e){return e-t}));return e}return[]},filteredCollection:function(){var t=this;if(this.collection){var e=this.year(),n=this.collection&&this.collection.filter((function(n){return t.getYear(n.date)===e.toString()})).sort((function(t,e){return new Date(t.date)-new Date(e.date)}));return n}return[]},searchResults:function(){var t=this,e=this.collection.filter((function(e){return parseInt(t.getYear(e.date))===t.year})).sort((function(t,e){return e.date-t.date}));return e}}},c=u,l=n("2877"),d=n("6544"),f=n.n(d),v=n("132d"),h=n("b974"),p=n("1f4f"),x=Object(l["a"])(c,r,o,!1,null,null,null);e["default"]=x.exports;f()(x,{VIcon:v["a"],VSelect:h["a"],VSimpleTable:p["a"]})},c0d6:function(t,e,n){"use strict";n.d(e,"b",(function(){return o})),n.d(e,"a",(function(){return i}));var r=n("2b0e"),o=r["a"].observable({collections:{searchQuery:"",year:(new Date).getFullYear(),queryParams:{}},queryParams:{tabs:[],panel:""}}),i={updateCollections:function(t,e){console.log("updateCollectionsSearchQuery --------\x3e ",e),o.collections[t]=e},updateQueryParams:function(t,e){console.log("updateQueryParams --------\x3e ",e),o.queryParams[t]=e}}}}]);
//# sourceMappingURL=NYMEXCollection.d0be8c26.js.map