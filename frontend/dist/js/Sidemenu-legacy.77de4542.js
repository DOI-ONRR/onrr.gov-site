"use strict";(self["webpackChunkonrr_frontend_app_vue"]=self["webpackChunkonrr_frontend_app_vue"]||[]).push([[21],{938:function(t,e,n){n.r(e),n.d(e,{default:function(){return m}});var i=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{ref:"sideMenu",staticClass:"side-menu-wrap"},[n("v-list",{staticClass:"pa-0"},[n("v-list-item-group",{attrs:{color:"primary"}},[n("v-list-item",{attrs:{link:"",exact:"",to:""+t.parentUrl}},[t._v(" "+t._s(t.parentTitle+" Home")+" ")]),t._l(t.sideMenuItems,(function(e){return n("div",{key:e.id},t._l(e.menu_children,(function(e){return n("v-list-item",{key:e.id,attrs:{link:"","active-class":"active",to:""+e.pages_id.url}},[t._v(" "+t._s(e.pages_id.title)+" ")])})),1)}))],2)],1)],1)},r=[],a=(n(4916),n(3123),n(9826),n(1539),n(7327),n(9985)),u={name:"SideMenu",data:function(){return{menus:[],pages:[],parentTitle:null,parentSlug:null}},apollo:{menus:{query:a.id,loadingKey:"loading..."},pages:{query:a.KY,loadingKey:"loading...",result:function(t){var e=t.data;if(e)return e.pages}}},created:function(){this.getParentSlug(),this.getParentPageTitleBySlug()},methods:{getParentSlug:function(){var t=this.$route.fullPath;t.indexOf(1),t.toLowerCase();var e=t.split("/")[1];this.parentSlug=e},getParentPageTitleBySlug:function(){var t=this,e=this.pages.find((function(e){return e.slug===t.parentSlug}));this.parentTitle=e.title,this.parentUrl=e.url}},computed:{sideMenuItems:function(){var t=this;return this.menus.filter((function(e){return"main"===e.menu&&e.link_to_page.slug===t.parentSlug}))}}},l=u,s=n(1001),o=n(3453),p=n.n(o),d=n(1317),c=n(5243),g=n(4674),f=(0,s.Z)(l,i,r,!1,null,"d85fb180",null),m=f.exports;p()(f,{VList:d.Z,VListItem:c.Z,VListItemGroup:g.Z})}}]);
//# sourceMappingURL=Sidemenu-legacy.77de4542.js.map