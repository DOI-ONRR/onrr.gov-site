(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["PageNotFound","Page"],{2048:function(t,e,a){"use strict";a.r(e);var n=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",[t.$apollo.loading?a("div",{staticClass:"text-center"},[a("v-progress-circular",{attrs:{value:20}})],1):a("div",{staticClass:"page-wrap"},[a("Breadcrumbs"),t.page.title?a("div",{staticClass:"text-h1 page-title"},[t._v(t._s(t.page.title))]):t._e(),t.page.page_blocks?a("div",{staticClass:"fade-transition"},t._l(t.page.page_blocks,(function(e){return a("div",{key:e.id},[a("LayoutBlock",{attrs:{layout:e.item.block_layout||"one_column",block:e.item}},[a(t.pageBlock(e.item.__typename),{tag:"component",staticClass:"block-component",attrs:{block:e.item}})],1)],1)})),0):t._e()],1)])},i=[],o=(a("d3b7"),a("3ca3"),a("ddb0"),a("ac1f"),a("5319"),a("7db0"),a("0306")),s=a("1b62"),r=function(){return a.e("Breadcrumbs").then(a.bind(null,"cf1b"))},u=function(){return a.e("LayoutBlock").then(a.bind(null,"0b83"))},l={mixins:[s["b"],s["a"]],name:"Page",metaInfo:function(){return{title:this.metaTitle||this.pageTitle,meta:[{name:"description",content:this.metaDescription},{property:"og:title",content:this.metaTitle},{property:"og:site_name",content:"Office of Natural Resources Revenue"},{property:"og:type",content:"website"},{name:"robots",content:"index,follow"}]}},components:{Breadcrumbs:r,LayoutBlock:u},data:function(){return{pages:[],pages_by_id:[],code:"",colCount:1}},apollo:{pages:{query:o["f"],loadingKey:"loading..."},pages_by_id:{query:o["e"],loadingKey:"loading...",variables:function(){return{ID:this.findPageBySlug.id}}}},props:{slug:String},created:function(){this.$apollo.queries.pages_by_id.refetch()},computed:{findPageBySlug:function(){var t,e=this,a=this.$route.path,n=a.replace(/\//g,"");return this.pages&&(t=this.slug?this.pages.find((function(t){return t.slug===e.slug})):this.pages.find((function(t){return t.slug===n}))),t},page:function(){return this.pages_by_id},metaTitle:function(){return this.pages_by_id.meta_title},metaDescription:function(){return this.pages_by_id.meta_description},pageTitle:function(){return this.pages_by_id.title}}},c=l,g=(a("c747"),a("2877")),p=a("6544"),d=a.n(p),f=a("490a"),_=Object(g["a"])(c,n,i,!1,null,"ff3a27be",null);e["default"]=_.exports;d()(_,{VProgressCircular:f["a"]})},6686:function(t,e,a){},"6af2":function(t,e,a){"use strict";a("6686")},8291:function(t,e,a){},a5b5:function(t,e,a){"use strict";a.r(e);var n=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",[t.$apolloData.loading?a("div",[a("div",{staticClass:"text-center"},[a("v-progress-circular",{attrs:{value:20}})],1)]):a("v-container",{staticClass:"page__wrap"},[a("Page",{attrs:{slug:t.pageSlug}})],1)],1)},i=[],o=a("0306"),s=a("2048"),r={name:"PageNotFound",metaInfo:{title:"Page not found"},data:function(){return{page:null}},apollo:{pages_by_id:{query:o["e"],loadingKey:"loading...",variables:function(){return{ID:"53"}},result:function(t){var e=t.data;e&&(this.page=e.pages_by_id)}}},components:{Page:s["default"]},computed:{pageSlug:function(){return this.pages_by_id.slug}}},u=r,l=(a("6af2"),a("2877")),c=a("6544"),g=a.n(c),p=a("a523"),d=a("490a"),f=Object(l["a"])(u,n,i,!1,null,"7f220a16",null);e["default"]=f.exports;g()(f,{VContainer:p["a"],VProgressCircular:d["a"]})},c747:function(t,e,a){"use strict";a("8291")}}]);
//# sourceMappingURL=PageNotFound.209b93e7.js.map