"use strict";(self["webpackChunkonrr_frontend_app_vue"]=self["webpackChunkonrr_frontend_app_vue"]||[]).push([[121],{6643:function(t,e,r){r.d(e,{Z:function(){return o}});r(7327),r(1539),r(7941),r(6755),r(2222),r(9941),r(6428),r(3210),r(9600);var n=r(144);function a(t){return n.Z.extend({name:"v-".concat(t),functional:!0,props:{id:String,tag:{type:String,default:"div"}},render:function(e,r){var n=r.props,a=r.data,i=r.children;a.staticClass="".concat(t," ").concat(a.staticClass||"").trim();var o=a.attrs;if(o){a.attrs={};var s=Object.keys(o).filter((function(t){if("slot"===t)return!1;var e=o[t];return t.startsWith("data-")?(a.attrs[t]=e,!1):e||"string"===typeof e}));s.length&&(a.staticClass+=" ".concat(s.join(" ")))}return n.id&&(a.domProps=a.domProps||{},a.domProps.id=n.id),e(n.tag,a,i)}})}var i=r(9312),o=a("container").extend({name:"v-container",functional:!0,props:{id:String,tag:{type:String,default:"div"},fluid:{type:Boolean,default:!1}},render:function(t,e){var r,n=e.props,a=e.data,o=e.children,s=a.attrs;return s&&(a.attrs={},r=Object.keys(s).filter((function(t){if("slot"===t)return!1;var e=s[t];return t.startsWith("data-")?(a.attrs[t]=e,!1):e||"string"===typeof e}))),n.id&&(a.domProps=a.domProps||{},a.domProps.id=n.id),t(n.tag,(0,i.ZP)(a,{staticClass:"container",class:Array({"container--fluid":n.fluid}).concat(r||[])}),o)}})},2648:function(t,e,r){r.r(e),r.d(e,{default:function(){return _}});var n=function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("div",[t.$apolloData.loading?r("div",[r("div",{staticClass:"text-center"},[r("v-progress-circular",{attrs:{value:20}})],1)]):r("div",[t.page&&t.pages_by_id?r("HeroImage",{attrs:{title:t.page.hero_title,image:t.API_URL+"/assets/"+(t.pages_by_id.hero_image?t.pages_by_id.hero_image.id:"36cdee7e-e6e8-435f-850c-05636e551723")+"?fit=cover&quality=80",isHome:!1}}):t._e(),r("v-container",[r("v-row",[r("v-col",{attrs:{sm:"12",md:"3"}},[r("SideMenu")],1),r("v-col",{attrs:{sm:"12",md:"9"}},[r("router-view")],1)],1)],1)],1)])},a=[],i=(r(1539),r(8783),r(3948),r(9826),r(9985)),o=function(){return r.e(21).then(r.bind(r,938))},s=function(){return r.e(795).then(r.bind(r,7271))},d={name:"TwoColumnLeft",data:function(){return{page:null,pages:[],API_URL:"https://dev-onrr-frontend.app.cloud.gov",pageId:null}},apollo:{pages:{query:i.KY,loadingKey:"loading...",result:function(t){var e=this,r=t.data;if(r){var n=r.pages.find((function(t){return t.url===e.$route.path}));this.page=n,this.pageId=n.id}}},pages_by_id:{query:i.sI,loadingKey:"loading...",variables:function(){return{ID:this.pageId}}}},components:{HeroImage:s,SideMenu:o},props:{slug:{type:String}},created:function(){this.findPageByUrl()},methods:{findPageByUrl:function(){var t,e=this;return this.pages&&(t=this.pages.find((function(t){return t.url===e.$route.path}))),this.page=t,t}}},u=d,c=r(1001),l=r(3453),p=r.n(l),f=r(3121),g=r(6643),v=r(4955),h=r(4722),m=(0,c.Z)(u,n,a,!1,null,"ac82a1a8",null),_=m.exports;p()(m,{VCol:f.Z,VContainer:g.Z,VProgressCircular:v.Z,VRow:h.Z})}}]);
//# sourceMappingURL=TwoColumnLeft-legacy.5ea0474b.js.map