(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["TwoColumnLeft"],{"0052":function(t,e,a){},"42b1":function(t,e,a){"use strict";a.r(e);var r=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",[t.$apolloData.loading?a("div",[a("div",{staticClass:"text-center"},[a("v-progress-circular",{attrs:{value:20}})],1)]):a("div",[t.page&&t.pages_by_id?a("HeroImage",{attrs:{title:t.page.hero_title,image:t.API_URL+"/assets/"+(t.pages_by_id.hero_image?t.pages_by_id.hero_image.id:"36cdee7e-e6e8-435f-850c-05636e551723")+"?fit=cover&quality=80",isHome:!1}}):t._e(),a("v-container",[a("v-row",[a("v-col",{attrs:{sm:"12",md:"3"}},[a("SideMenu")],1),a("v-col",{attrs:{sm:"12",md:"9"}},[a("router-view")],1)],1)],1)],1)])},n=[],i=(a("d3b7"),a("3ca3"),a("ddb0"),a("7db0"),a("0306")),o=function(){return a.e("Sidemenu").then(a.bind(null,"640b"))},s=function(){return a.e("HeroImage").then(a.bind(null,"70fe"))},d={name:"TwoColumnLeft",data:function(){return{page:null,pages:[],API_URL:"https://dev-onrr-cms.app.cloud.gov",pageId:null}},apollo:{pages:{query:i["j"],loadingKey:"loading...",result:function(t){var e=this,a=t.data;if(a){var r=a.pages.find((function(t){return t.url===e.$route.path}));this.page=r,this.pageId=r.id}}},pages_by_id:{query:i["i"],loadingKey:"loading...",variables:function(){return{ID:this.pageId}}}},components:{HeroImage:s,SideMenu:o},props:{slug:{type:String}},created:function(){this.findPageByUrl()},methods:{findPageByUrl:function(){var t,e=this;return this.pages&&(t=this.pages.find((function(t){return t.url===e.$route.path}))),this.page=t,t}}},c=d,u=(a("b1cb"),a("2877")),l=a("6544"),p=a.n(l),f=a("62ad"),g=a("a523"),v=a("490a"),b=a("0fd9"),m=Object(u["a"])(c,r,n,!1,null,"ac82a1a8",null);e["default"]=m.exports;p()(m,{VCol:f["a"],VContainer:g["a"],VProgressCircular:v["a"],VRow:b["a"]})},a523:function(t,e,a){"use strict";a("4de4"),a("d3b7"),a("b64b"),a("2ca0"),a("99af"),a("20f6"),a("4b85"),a("498a"),a("a15b");var r=a("2b0e");function n(t){return r["a"].extend({name:"v-".concat(t),functional:!0,props:{id:String,tag:{type:String,default:"div"}},render:function(e,a){var r=a.props,n=a.data,i=a.children;n.staticClass="".concat(t," ").concat(n.staticClass||"").trim();var o=n.attrs;if(o){n.attrs={};var s=Object.keys(o).filter((function(t){if("slot"===t)return!1;var e=o[t];return t.startsWith("data-")?(n.attrs[t]=e,!1):e||"string"===typeof e}));s.length&&(n.staticClass+=" ".concat(s.join(" ")))}return r.id&&(n.domProps=n.domProps||{},n.domProps.id=r.id),e(r.tag,n,i)}})}var i=a("d9f7");e["a"]=n("container").extend({name:"v-container",functional:!0,props:{id:String,tag:{type:String,default:"div"},fluid:{type:Boolean,default:!1}},render:function(t,e){var a,r=e.props,n=e.data,o=e.children,s=n.attrs;return s&&(n.attrs={},a=Object.keys(s).filter((function(t){if("slot"===t)return!1;var e=s[t];return t.startsWith("data-")?(n.attrs[t]=e,!1):e||"string"===typeof e}))),r.id&&(n.domProps=n.domProps||{},n.domProps.id=r.id),t(r.tag,Object(i["a"])(n,{staticClass:"container",class:Array({"container--fluid":r.fluid}).concat(a||[])}),o)}})},b1cb:function(t,e,a){"use strict";a("0052")}}]);
//# sourceMappingURL=TwoColumnLeft.55febaf4.js.map