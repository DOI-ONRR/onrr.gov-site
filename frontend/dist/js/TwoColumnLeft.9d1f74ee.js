(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["TwoColumnLeft"],{"0d16":function(e,t,i){},"42b1":function(e,t,i){"use strict";i.r(t);var s=function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("div",[e.$apolloData.loading?i("div",[i("div",{staticClass:"text-center"},[i("v-progress-circular",{attrs:{value:20}})],1)]):i("div",[e.page&&e.pages_by_id?i("HeroImage",{attrs:{title:e.page.hero_title,image:e.API_URL+"/assets/"+(e.pages_by_id.hero_image?e.pages_by_id.hero_image.id:"36cdee7e-e6e8-435f-850c-05636e551723")+"?fit=cover&quality=80",isHome:!1}}):e._e(),i("v-container",[i("v-row",[i("v-col",{attrs:{sm:"12",md:"3"}},[i("SideMenu")],1),i("v-col",{attrs:{sm:"12",md:"9"}},[i("router-view")],1)],1)],1)],1)])},n=[],a=(i("d3b7"),i("3ca3"),i("ddb0"),i("ac1f"),i("1276"),i("caad"),i("2532"),i("7db0"),i("0306")),u=function(){return i.e("Sidemenu").then(i.bind(null,"640b"))},l=function(){return i.e("HeroImage").then(i.bind(null,"70fe"))},o={name:"TwoColumnLeft",data:function(){return{page:null,pages:[],API_URL:"https://dev-onrr-cms.app.cloud.gov",pageId:null}},apollo:{pages:{query:a["g"],loadingKey:"loading...",result:function(e){var t=e.data;if(t){var i=this.$route.path,s=i.split("/");console.log("whats this -----------\x3e ",this.slug);var n=this.slug&&void 0!==this.slug.includes("?")?this.slug.split("?")[0]:this.slug,a=n?t.pages.find((function(e){return e.slug===n})):this.pages.find((function(e){return e.slug===s[s.length-1]}));this.page=a,this.pageId=a.id}}},pages_by_id:{query:a["f"],loadingKey:"loading...",variables:function(){return{ID:this.pageId}}}},components:{HeroImage:l,SideMenu:u},props:{slug:{type:String}},created:function(){this.findPageBySlug()},methods:{findPageBySlug:function(){var e=this.$route.path,t=e.split("/");console.log("whats this -----------\x3e ",this.slug.includes("?"));var i,s=this.slug&&void 0!==this.slug.includes("?")?this.slug.split("?")[0]:this.slug;return this.pages&&(i=void 0!==s?this.pages.find((function(e){return e.slug===s})):this.pages.find((function(e){return e.slug===t[t.length-1]}))||!1),this.page=i,i},getPageBySlug:function(e){console.log("whats this -----------\x3e ",e.includes("?"));var t=e&&void 0!==e.includes("?")?e.split("?")[0]:e,i=this.pages.find((function(e){return e.url===t}));return i}}},r=o,g=(i("84ec"),i("2877")),d=i("6544"),c=i.n(d),p=i("62ad"),h=i("a523"),f=i("490a"),v=i("0fd9"),m=Object(g["a"])(r,s,n,!1,null,"ba7756ec",null);t["default"]=m.exports;c()(m,{VCol:p["a"],VContainer:h["a"],VProgressCircular:f["a"],VRow:v["a"]})},"84ec":function(e,t,i){"use strict";i("0d16")}}]);
//# sourceMappingURL=TwoColumnLeft.9d1f74ee.js.map