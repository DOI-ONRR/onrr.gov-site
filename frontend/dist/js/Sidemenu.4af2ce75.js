(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["Sidemenu"],{"2ac3":function(t,e,n){},"640b":function(t,e,n){"use strict";n.r(e);var i=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{ref:"sideMenu",staticClass:"side-menu-wrap"},[n("v-list",{staticClass:"pa-0"},[n("v-list-item-group",{attrs:{color:"primary"}},[n("v-list-item",{attrs:{link:"",exact:"",to:""+t.parentUrl}},[t._v(" "+t._s(t.parentTitle+" Home")+" ")]),t._l(t.sideMenuItems,(function(e){return n("div",{key:e.id},t._l(e.menu_children,(function(e){return n("v-list-item",{key:e.id,attrs:{link:"","active-class":"active",to:""+e.pages_id.url}},[t._v(" "+t._s(e.pages_id.title)+" ")])})),1)}))],2)],1)],1)},a=[],r=(n("ac1f"),n("1276"),n("7db0"),n("d3b7"),n("4de4"),n("0306")),s={name:"SideMenu",data:function(){return{menus:[],pages:[],parentTitle:null,parentSlug:null}},apollo:{menus:{query:r["d"],loadingKey:"loading..."},pages:{query:r["g"],loadingKey:"loading...",result:function(t){var e=t.data;if(e)return e.pages}}},created:function(){this.getParentSlug(),this.getParentPageTitleBySlug()},methods:{getParentSlug:function(){var t=this.$route.fullPath;t.indexOf(1),t.toLowerCase();var e=t.split("/")[1];this.parentSlug=e},getParentPageTitleBySlug:function(){var t=this,e=this.pages.find((function(e){return e.slug===t.parentSlug}));this.parentTitle=e.title,this.parentUrl=e.url}},computed:{sideMenuItems:function(){var t=this;return this.menus.filter((function(e){return"main"===e.menu&&e.link_to_page.slug===t.parentSlug}))}}},u=s,l=(n("9af0"),n("2877")),o=n("6544"),c=n.n(o),d=n("8860"),p=n("da13"),g=n("1baa"),f=Object(l["a"])(u,i,a,!1,null,"0539ccf6",null);e["default"]=f.exports;c()(f,{VList:d["a"],VListItem:p["a"],VListItemGroup:g["a"]})},"9af0":function(t,e,n){"use strict";n("2ac3")}}]);
//# sourceMappingURL=Sidemenu.4af2ce75.js.map