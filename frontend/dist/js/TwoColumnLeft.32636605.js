(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["TwoColumnLeft"],{"0bc6":function(t,e,n){},1466:function(t,e,n){"use strict";n("6923")},"42b1":function(t,e,n){"use strict";n.r(e);var a=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",[t.$apolloData.loading?n("div",[n("div",{staticClass:"text-center"},[n("v-progress-circular",{attrs:{value:20}})],1)]):n("div",[t.page&&t.pages_by_id?n("HeroImage",{attrs:{title:t.page.title,image:t.API_URL+"/assets/"+(t.pages_by_id.hero_image?t.pages_by_id.hero_image.id:"36cdee7e-e6e8-435f-850c-05636e551723")+"?fit=cover&quality=80",isHome:!1}}):t._e(),n("v-container",[n("v-row",[n("v-col",{attrs:{sm:"12",md:"3"}},[n("SideMenu")],1),n("v-col",{attrs:{sm:"12",md:"9"}},[n("router-view")],1)],1)],1)],1)])},i=[],s=(n("ac1f"),n("1276"),n("7db0"),n("0306")),r=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"side-menu-wrap"},[n("v-list",[n("v-subheader",[t._v(t._s(t.parentTitle+" Home"))]),t._l(t.menuItems,(function(e){return n("v-list-item-group",{key:e.key.id,attrs:{color:"primary"}},t._l(e.data,(function(a){return n("v-list-item",{key:a.id},[n("v-list-item-content",[n("router-link",{attrs:{to:"/"+e.key.link_to_page.slug+"/"+a.link_to_page.slug}},[t._v(" "+t._s(a.menu_label)+" ")])],1)],1)})),1)}))],2)],1)},u=[],l=n("2909"),o=(n("4de4"),n("d81d"),{name:"SideMenu",data:function(){return{menuItems:[],pages:[],parentTitle:null,parentSlug:null}},apollo:{menu_items:{query:s["d"],loadingKey:"loading...",result:function(t){var e=this,n=t.data,a=[];if(n){var i=n.menu_items.filter((function(t){return"main"===t.menu&&null!==t.parent&&t.parent.link_to_page.slug===e.parentSlug}));n.menu_items.filter((function(t){return"main"===t.menu})).map((function(t){null===t.parent&&a.push({key:t,data:Object(l["a"])(i.filter((function(e){return e.parent.id===t.id})))})}))}this.menuItems=a}},pages:{query:s["f"],loadingKey:"loading...",result:function(t){var e=t.data;if(e)return e.pages}}},created:function(){this.getParentSlug(),this.getParentPageTitleBySlug()},methods:{getParentSlug:function(){var t=this.$route.fullPath;t.indexOf(1),t.toLowerCase();var e=t.split("/")[1];this.parentSlug=e},getParentPageTitleBySlug:function(){var t=this,e=this.pages.find((function(e){return e.slug===t.parentSlug}));this.parentTitle=e.title}}}),d=o,c=(n("1466"),n("2877")),g=n("6544"),p=n.n(g),f=n("8860"),h=n("da13"),m=n("5d23"),v=n("1baa"),_=n("e0c7"),b=Object(c["a"])(d,r,u,!1,null,"28ac5d7e",null),y=b.exports;p()(b,{VList:f["a"],VListItem:h["a"],VListItemContent:m["a"],VListItemGroup:v["a"],VSubheader:_["a"]});var S=n("70fe"),I={name:"TwoColumnLeft",data:function(){return{page:null,pages:[],API_URL:Object({NODE_ENV:"production",BASE_URL:"/"}).VUE_APP_API_URL,pageId:null}},apollo:{pages:{query:s["f"],loadingKey:"loading...",result:function(t){var e=this,n=t.data;if(n){var a=this.$route.path,i=a.split("/"),s=this.slug?n.pages.find((function(t){return t.slug===e.slug})):this.pages.find((function(t){return t.slug===i[i.length-1]}));this.page=s,this.pageId=s.id}}},pages_by_id:{query:s["e"],loadingKey:"loading...",variables:function(){return{ID:this.pageId}}}},components:{HeroImage:S["a"],SideMenu:y},props:{slug:{type:String}},created:function(){this.findPageBySlug()},methods:{findPageBySlug:function(){var t,e=this,n=this.$route.path,a=n.split("/");return this.pages&&(t=void 0!==this.slug?this.pages.find((function(t){return t.slug===e.slug})):this.pages.find((function(t){return t.slug===a[a.length-1]}))),this.page=t,t}}},P=I,w=(n("629c"),n("62ad")),k=n("a523"),C=n("490a"),L=n("0fd9"),V=Object(c["a"])(P,a,i,!1,null,"ca301fa8",null);e["default"]=V.exports;p()(V,{VCol:w["a"],VContainer:k["a"],VProgressCircular:C["a"],VRow:L["a"]})},"629c":function(t,e,n){"use strict";n("93af")},6923:function(t,e,n){},"93af":function(t,e,n){},e0c7:function(t,e,n){"use strict";var a=n("5530"),i=(n("0bc6"),n("7560")),s=n("58df");e["a"]=Object(s["a"])(i["a"]).extend({name:"v-subheader",props:{inset:Boolean},render:function(t){return t("div",{staticClass:"v-subheader",class:Object(a["a"])({"v-subheader--inset":this.inset},this.themeClasses),attrs:this.$attrs,on:this.$listeners},this.$slots.default)}})}}]);
//# sourceMappingURL=TwoColumnLeft.32636605.js.map