(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["Contact","Breadcrumbs"],{"0bc6":function(t,e,a){},"4eb2":function(t,e,a){},"90a5":function(t,e,a){"use strict";a("4eb2")},9944:function(t,e,a){"use strict";a.d(e,"a",(function(){return r})),a.d(e,"b",(function(){return s}));a("ac1f"),a("1276"),a("d81d"),a("159b"),a("fb6a"),a("5319");var r=function(t){var e=new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(t);return e},s=function(t){return t.replace(/\w\S*/g,(function(t){return t.charAt(0).toUpperCase()+t.substr(1).toLowerCase()}))}},abd3:function(t,e,a){},b8fa:function(t,e,a){"use strict";a.r(e);var r=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"contacts-wrap"},[a("Breadcrumbs"),t._l(t.contacts,(function(e){return a("v-card",{key:e.id,staticClass:"mx-auto v-card",attrs:{"max-width":"100%"}},[a("v-list",[a("v-subheader",[t._v(" Category: Paying > Federal accounts receivable, billing, and finance > Company Contact ")]),a("v-list-item",[a("v-list-item-content",[a("v-list-item-title",{domProps:{textContent:t._s(e.primary_contact)}},[t._v(t._s(e.primary_contact))])],1),e.primary_email?a("v-list-item-icon",[a("v-icon",[t._v(" mdi-email ")]),a("span",{staticStyle:{"margin-left":"8px"}},[t._v(t._s(e.primary_email))])],1):t._e(),e.primary_phone?a("v-list-item-icon",[a("v-icon",[t._v(" mdi-phone ")]),a("span",{staticStyle:{"margin-left":"8px"}},[t._v(t._s(e.primary_phone))])],1):t._e()],1)],1)],1)}))],2)},s=[],n=a("0306"),i=a("cf1b"),c={name:"Contact",metaInfo:{title:"Contact"},data:function(){return{contacts:[]}},components:{Breadcrumbs:i["default"]},apollo:{contacts:{query:n["b"],loadingKey:"loading...",result:function(t){var e=t.data;e&&(console.log("contacts data yo-------\x3e ",e),this.contacts=e.contacts)}}}},u=c,o=(a("90a5"),a("2877")),d=a("6544"),l=a.n(d),m=a("b0af"),b=a("132d"),h=a("8860"),f=a("da13"),p=a("5d23"),v=a("34c3"),g=a("e0c7"),y=Object(o["a"])(u,r,s,!1,null,"d4bc0b60",null);e["default"]=y.exports;l()(y,{VCard:m["a"],VIcon:b["a"],VList:h["a"],VListItem:f["a"],VListItemContent:p["a"],VListItemIcon:v["a"],VListItemTitle:p["b"],VSubheader:g["a"]})},cf1b:function(t,e,a){"use strict";a.r(e);var r=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("v-breadcrumbs",{attrs:{divider:"|",items:t.breadcrumbs},scopedSlots:t._u([{key:"breadcrumb",fn:function(e){var r=e.breadcrumb;return[a("v-breadcrumbs-item",[t._v(" "+t._s(r)+" ")])]}}])})},s=[],n=(a("ac1f"),a("5319"),a("7db0"),a("1276"),a("99af"),a("0306")),i=a("9944"),c={name:"Breadcrumbs",data:function(){return{pages:[]}},apollo:{pages:{query:n["f"],loadingKey:"loading..."}},methods:{prettyBreadcrumb:function(t){var e=t.replace(/-/g," ").replace(/^./,(function(t){return t.toUpperCase()}));return Object(i["b"])(e)},getPageTitleBySlug:function(t){var e=this.pages.find((function(e){return e.slug===t}));return e.title}},computed:{breadcrumbs:function(){var t=this.$route.path.split("/");t.shift();for(var e=[],a="",r=0,s=0;s<t.length;++s)a="".concat(a,"/").concat(t[s]),this.$route.matched[s]&&Object.hasOwnProperty.call(this.$route.matched[s],"meta")&&Object.hasOwnProperty.call(this.$route.matched[s].meta,"breadcrumb")&&(e.push({href:0!==s&&t[s-(s-r)]?"/"+t[s-(s-r)]+a:a,disabled:s+1===t.length,text:this.$route.matched[s].meta.breadcrumb||this.getPageTitleBySlug(t[s])}),r=s,a="");var n={href:"/",disabled:!1,text:"Home"};return e.unshift(n),e}}},u=c,o=a("2877"),d=a("6544"),l=a.n(d),m=a("5530"),b=(a("a15b"),a("abd3"),a("ade3")),h=a("1c87"),f=a("58df"),p=Object(f["a"])(h["a"]).extend({name:"v-breadcrumbs-item",props:{activeClass:{type:String,default:"v-breadcrumbs__item--disabled"},ripple:{type:[Boolean,Object],default:!1}},computed:{classes:function(){return Object(b["a"])({"v-breadcrumbs__item":!0},this.activeClass,this.disabled)}},render:function(t){var e=this.generateRouteLink(),a=e.tag,r=e.data;return t("li",[t(a,Object(m["a"])(Object(m["a"])({},r),{},{attrs:Object(m["a"])(Object(m["a"])({},r.attrs),{},{"aria-current":this.isActive&&this.isLink?"page":void 0})}),this.$slots.default)])}}),v=a("80d2"),g=Object(v["g"])("v-breadcrumbs__divider","li"),y=a("7560"),_=Object(f["a"])(y["a"]).extend({name:"v-breadcrumbs",props:{divider:{type:String,default:"/"},items:{type:Array,default:function(){return[]}},large:Boolean},computed:{classes:function(){return Object(m["a"])({"v-breadcrumbs--large":this.large},this.themeClasses)}},methods:{genDivider:function(){return this.$createElement(g,this.$slots.divider?this.$slots.divider:this.divider)},genItems:function(){for(var t=[],e=!!this.$scopedSlots.item,a=[],r=0;r<this.items.length;r++){var s=this.items[r];a.push(s.text),e?t.push(this.$scopedSlots.item({item:s})):t.push(this.$createElement(p,{key:a.join("."),props:s},[s.text])),r<this.items.length-1&&t.push(this.genDivider())}return t}},render:function(t){var e=this.$slots.default||this.genItems();return t("ul",{staticClass:"v-breadcrumbs",class:this.classes},e)}}),C=Object(o["a"])(u,r,s,!1,null,null,null);e["default"]=C.exports;l()(C,{VBreadcrumbs:_,VBreadcrumbsItem:p})},e0c7:function(t,e,a){"use strict";var r=a("5530"),s=(a("0bc6"),a("7560")),n=a("58df");e["a"]=Object(n["a"])(s["a"]).extend({name:"v-subheader",props:{inset:Boolean},render:function(t){return t("div",{staticClass:"v-subheader",class:Object(r["a"])({"v-subheader--inset":this.inset},this.themeClasses),attrs:this.$attrs,on:this.$listeners},this.$slots.default)}})}}]);
//# sourceMappingURL=Contact.380d23cb.js.map