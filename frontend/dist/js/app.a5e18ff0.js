(function(e){function n(n){for(var o,a,c=n[0],i=n[1],s=n[2],u=0,d=[];u<c.length;u++)a=c[u],Object.prototype.hasOwnProperty.call(l,a)&&l[a]&&d.push(l[a][0]),l[a]=0;for(o in i)Object.prototype.hasOwnProperty.call(i,o)&&(e[o]=i[o]);m&&m(n);while(d.length)d.shift()();return r.push.apply(r,s||[]),t()}function t(){for(var e,n=0;n<r.length;n++){for(var t=r[n],o=!0,a=1;a<t.length;a++){var c=t[a];0!==l[c]&&(o=!1)}o&&(r.splice(n--,1),e=i(i.s=t[0]))}return e}var o={},a={app:0},l={app:0},r=[];function c(e){return i.p+"js/"+({CardBlock:"CardBlock",CodeBlock:"CodeBlock",CollectionBlock:"CollectionBlock",ContentBlock:"ContentBlock",EditorBlock:"EditorBlock",ExpansionPanelBlock:"ExpansionPanelBlock",HeroImage:"HeroImage",HorizontalRuleBlock:"HorizontalRuleBlock",ImageBlock:"ImageBlock",LayoutBlock:"LayoutBlock",ListBlock:"ListBlock",Page:"Page",PageNotFound:"PageNotFound",TableBlock:"TableBlock",TabsBlock:"TabsBlock",TextBlock:"TextBlock",TwoColumnLeft:"TwoColumnLeft",AnnouncementsCollection:"AnnouncementsCollection",CompaniesCollection:"CompaniesCollection",ContactsCollection:"ContactsCollection","CustomInput~NYMEXCollection~ReporterLetters":"CustomInput~NYMEXCollection~ReporterLetters",NYMEXCollection:"NYMEXCollection",EventsCollection:"EventsCollection",FilesCollection:"FilesCollection",Breadcrumbs:"Breadcrumbs",Sidemenu:"Sidemenu",CollectionFilterToolbar:"CollectionFilterToolbar",ReporterLetters:"ReporterLetters",CustomInput:"CustomInput"}[e]||e)+"."+{CardBlock:"fb7d5178",CodeBlock:"441aba45",CollectionBlock:"0eb6377f",ContentBlock:"cd1d28ba",EditorBlock:"61c9ed07",ExpansionPanelBlock:"8368d738",HeroImage:"36e9ec56",HorizontalRuleBlock:"68b8d4f5",ImageBlock:"212b6fb2",LayoutBlock:"c77fc763",ListBlock:"2653b85b",Page:"6c080f65",PageNotFound:"c912a778",TableBlock:"a2b123cf",TabsBlock:"2332bdb3",TextBlock:"5240936b",TwoColumnLeft:"9d1f74ee","chunk-4e8ec65f":"1496ed66",AnnouncementsCollection:"732e668e",CompaniesCollection:"b2941576",ContactsCollection:"412a708e","CustomInput~NYMEXCollection~ReporterLetters":"f0c86d5a",NYMEXCollection:"06bf3292",EventsCollection:"d5a18d21",FilesCollection:"778c5848",Breadcrumbs:"589d2161",Sidemenu:"4af2ce75",CollectionFilterToolbar:"b9b06cc8",ReporterLetters:"d33f1fdb",CustomInput:"ce80f532"}[e]+".js"}function i(n){if(o[n])return o[n].exports;var t=o[n]={i:n,l:!1,exports:{}};return e[n].call(t.exports,t,t.exports,i),t.l=!0,t.exports}i.e=function(e){var n=[],t={CardBlock:1,ContentBlock:1,EditorBlock:1,ExpansionPanelBlock:1,HeroImage:1,ImageBlock:1,LayoutBlock:1,Page:1,PageNotFound:1,TableBlock:1,TabsBlock:1,TextBlock:1,TwoColumnLeft:1,"chunk-4e8ec65f":1,AnnouncementsCollection:1,ContactsCollection:1,"CustomInput~NYMEXCollection~ReporterLetters":1,NYMEXCollection:1,FilesCollection:1,Breadcrumbs:1,Sidemenu:1,ReporterLetters:1};a[e]?n.push(a[e]):0!==a[e]&&t[e]&&n.push(a[e]=new Promise((function(n,t){for(var o="css/"+({CardBlock:"CardBlock",CodeBlock:"CodeBlock",CollectionBlock:"CollectionBlock",ContentBlock:"ContentBlock",EditorBlock:"EditorBlock",ExpansionPanelBlock:"ExpansionPanelBlock",HeroImage:"HeroImage",HorizontalRuleBlock:"HorizontalRuleBlock",ImageBlock:"ImageBlock",LayoutBlock:"LayoutBlock",ListBlock:"ListBlock",Page:"Page",PageNotFound:"PageNotFound",TableBlock:"TableBlock",TabsBlock:"TabsBlock",TextBlock:"TextBlock",TwoColumnLeft:"TwoColumnLeft",AnnouncementsCollection:"AnnouncementsCollection",CompaniesCollection:"CompaniesCollection",ContactsCollection:"ContactsCollection","CustomInput~NYMEXCollection~ReporterLetters":"CustomInput~NYMEXCollection~ReporterLetters",NYMEXCollection:"NYMEXCollection",EventsCollection:"EventsCollection",FilesCollection:"FilesCollection",Breadcrumbs:"Breadcrumbs",Sidemenu:"Sidemenu",CollectionFilterToolbar:"CollectionFilterToolbar",ReporterLetters:"ReporterLetters",CustomInput:"CustomInput"}[e]||e)+"."+{CardBlock:"9d8cddc0",CodeBlock:"31d6cfe0",CollectionBlock:"31d6cfe0",ContentBlock:"3830cf32",EditorBlock:"9a3c5f13",ExpansionPanelBlock:"61dfc1b6",HeroImage:"ec363d6d",HorizontalRuleBlock:"31d6cfe0",ImageBlock:"77df7434",LayoutBlock:"65728e26",ListBlock:"31d6cfe0",Page:"dacd2b7b",PageNotFound:"6773d31e",TableBlock:"67646f75",TabsBlock:"39c64600",TextBlock:"d8581ddf",TwoColumnLeft:"2ef069f4","chunk-4e8ec65f":"c3c9cc6b",AnnouncementsCollection:"d441057b",CompaniesCollection:"31d6cfe0",ContactsCollection:"5c8076a7","CustomInput~NYMEXCollection~ReporterLetters":"619eb347",NYMEXCollection:"b274c79d",EventsCollection:"31d6cfe0",FilesCollection:"cab59e1c",Breadcrumbs:"07d42331",Sidemenu:"bfb84ce1",CollectionFilterToolbar:"31d6cfe0",ReporterLetters:"d253099c",CustomInput:"31d6cfe0"}[e]+".css",l=i.p+o,r=document.getElementsByTagName("link"),c=0;c<r.length;c++){var s=r[c],u=s.getAttribute("data-href")||s.getAttribute("href");if("stylesheet"===s.rel&&(u===o||u===l))return n()}var d=document.getElementsByTagName("style");for(c=0;c<d.length;c++){s=d[c],u=s.getAttribute("data-href");if(u===o||u===l)return n()}var m=document.createElement("link");m.rel="stylesheet",m.type="text/css",m.onload=n,m.onerror=function(n){var o=n&&n.target&&n.target.src||l,r=new Error("Loading CSS chunk "+e+" failed.\n("+o+")");r.code="CSS_CHUNK_LOAD_FAILED",r.request=o,delete a[e],m.parentNode.removeChild(m),t(r)},m.href=l;var b=document.getElementsByTagName("head")[0];b.appendChild(m)})).then((function(){a[e]=0})));var o=l[e];if(0!==o)if(o)n.push(o[2]);else{var r=new Promise((function(n,t){o=l[e]=[n,t]}));n.push(o[2]=r);var s,u=document.createElement("script");u.charset="utf-8",u.timeout=120,i.nc&&u.setAttribute("nonce",i.nc),u.src=c(e);var d=new Error;s=function(n){u.onerror=u.onload=null,clearTimeout(m);var t=l[e];if(0!==t){if(t){var o=n&&("load"===n.type?"missing":n.type),a=n&&n.target&&n.target.src;d.message="Loading chunk "+e+" failed.\n("+o+": "+a+")",d.name="ChunkLoadError",d.type=o,d.request=a,t[1](d)}l[e]=void 0}};var m=setTimeout((function(){s({type:"timeout",target:u})}),12e4);u.onerror=u.onload=s,document.head.appendChild(u)}return Promise.all(n)},i.m=e,i.c=o,i.d=function(e,n,t){i.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:t})},i.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(e,n){if(1&n&&(e=i(e)),8&n)return e;if(4&n&&"object"===typeof e&&e&&e.__esModule)return e;var t=Object.create(null);if(i.r(t),Object.defineProperty(t,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var o in e)i.d(t,o,function(n){return e[n]}.bind(null,o));return t},i.n=function(e){var n=e&&e.__esModule?function(){return e["default"]}:function(){return e};return i.d(n,"a",n),n},i.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},i.p="/",i.oe=function(e){throw console.error(e),e};var s=window["webpackJsonp"]=window["webpackJsonp"]||[],u=s.push.bind(s);s.push=n,s=s.slice();for(var d=0;d<s.length;d++)n(s[d]);var m=u;r.push([0,"chunk-vendors"]),t()})({0:function(e,n,t){e.exports=t("56d7")},"0306":function(e,n,t){"use strict";t.d(n,"d",(function(){return H})),t.d(n,"a",(function(){return Q})),t.d(n,"g",(function(){return q})),t.d(n,"h",(function(){return M})),t.d(n,"f",(function(){return X})),t.d(n,"c",(function(){return z})),t.d(n,"k",(function(){return Y})),t.d(n,"b",(function(){return K})),t.d(n,"e",(function(){return D})),t.d(n,"i",(function(){return G})),t.d(n,"j",(function(){return U}));var o,a,l,r,c,i,s,u,d,m,b,f,A,p,g,h,C,k,_,v,B,y,I,w,E,O=t("8785"),P=t("5184"),T=Object(P["b"])(o||(o=Object(O["a"])(["\n  fragment contentBlocks on content_blocks {\n    content\n  }\n"]))),L=Object(P["b"])(a||(a=Object(O["a"])(["\n  fragment contentBlockFields on content_blocks {\n    id\n    block_label\n    block_v_col\n    block_content\n  }\n"]))),x=Object(P["b"])(l||(l=Object(O["a"])(["\n  fragment cardBlockFields on card_blocks {\n    id\n    block_color\n    block_label\n    block_v_col\n    block_content\n    card_content_blocks {\n      id\n      item {\n        ...contentBlockFields\n      }\n    }\n  }\n"]))),j=Object(P["b"])(r||(r=Object(O["a"])(["\n  fragment tabBlockLabelFields on tab_block_label {\n    id\n    tab_block_label\n  }\n"]))),F=(Object(P["b"])(c||(c=Object(O["a"])(["\n  fragment sectionHeadingBlocks on section_heading_blocks {\n    section_heading\n    section_heading_type\n  }\n"]))),Object(P["b"])(i||(i=Object(O["a"])(["\n  ","\n  ","\n  ","\n  fragment nestedTabBlockFields on tab_blocks {\n    id\n    tab_blocks {\n        id\n        item {\n          __typename\n          ...tabBlockLabelFields\n          ...contentBlockFields\n          ...cardBlockFields\n        }\n    }\n  }\n"])),j,L,x)),N=Object(P["b"])(s||(s=Object(O["a"])(["\n  fragment expansionPanelBlockLabel on expansion_panel_block_label {\n    id\n    block_label\n  }\n"]))),R=Object(P["b"])(u||(u=Object(O["a"])(["\n  ","\n  ","\n  ","\n  fragment expansionPanelBlockFields on expansion_panels {\n    id\n    block_label\n    open_by_default {\n      id\n    }\n    expansion_panel_blocks {\n      id\n      item {\n        __typename\n        ...expansionPanelBlockLabel\n        ...contentBlockFields\n        ...cardBlockFields\n      }\n    }\n  }\n"])),N,L,x),S=Object(P["b"])(d||(d=Object(O["a"])(["\n  ","\n  ","\n  ","\n  ","\n  ","\n  fragment tabBlockFields on tab_blocks {\n    id\n    tab_blocks {\n        id\n        item {\n          __typename\n          ...tabBlockLabelFields\n          ...contentBlockFields\n          ...cardBlockFields\n          ...nestedTabBlockFields\n          ...expansionPanelBlockFields\n        }\n    }\n  }\n"])),j,L,x,F,R),V=Object(P["b"])(m||(m=Object(O["a"])(["\n ","\n ","\n ","\n ","\n  fragment pageFields on pages {\n    id\n    title\n    slug\n    hero_image {\n      id\n    }\n    hero_title\n    page_blocks {\n      id\n      item {\n        __typename\n        ...contentBlockFields\n        ...tabBlockFields\n        ...cardBlockFields\n        ...expansionPanelBlockFields\n      }\n    }\n    # page_builder\n    meta_title\n    meta_description\n  }\n"])),L,S,x,R),H=(Object(P["b"])(b||(b=Object(O["a"])(["\n  ","\n  fragment cardBlocks on card_blocks {\n    card_title\n    card_subtitle\n    card_content_block {\n      item {\n        __typename\n        ...contentBlocks\n      }\n    }\n  }\n"])),T),Object(P["b"])(f||(f=Object(O["a"])(["\n  fragment fileCollectionFields on reporter_letters {\n    id\n    title\n    date\n    file {\n        id\n    }\n  }\n"]))),Object(P["a"])(A||(A=Object(O["a"])(["query {\n  menus {\n    id\n    custom_url\n    link_to_page {\n      id\n      slug\n      url\n    }\n    menu\n    menu_children {\n      pages_id {\n        id\n        title\n        url\n      }\n    }\n    menu_icon\n    menu_label\n  }\n}"])))),Q=Object(P["a"])(p||(p=Object(O["a"])(["query {\n  announcements {\n    id\n    title \n    content\n    status\n  }\n}"]))),q=Object(P["a"])(g||(g=Object(O["a"])(["\nquery {\n  pages(limit: -1) {\n    id\n    slug\n    title\n    url\n  }\n}"]))),M=(Object(P["a"])(h||(h=Object(O["a"])(["\nquery {\n  redirects {\n    id\n    from \n    to\n  }  \n}\n"]))),Object(P["a"])(C||(C=Object(O["a"])(["\nquery {\n  pages(limit: -1) {\n    id\n    slug\n    title\n    url\n  }\n  redirects {\n    id\n    from \n    to\n  }  \n}\n"])))),X=Object(P["a"])(k||(k=Object(O["a"])(["\n","\nquery PagesById($ID: ID!) {\n  pages_by_id (id: $ID) {\n    ...pageFields\n  }\n}"])),V),z=Object(P["a"])(_||(_=Object(O["a"])(["\n","\nquery PagesById($ID: ID!) {\n  pages_by_id (id: $ID) {\n    ...pageFields\n    sidebar_blocks\n  }\n}"])),V),Y=(Object(P["a"])(v||(v=Object(O["a"])(["\n  query {\n    files {\n      id\n      storage\n      filename_disk\n      title\n      filesize\n      location\n      folder {\n        id \n        name\n      }\n    }\n    folders {\n      id\n      name\n    }\n  }\n"]))),Object(P["a"])(B||(B=Object(O["a"])(['\n  query {\n    revenue_fiscal_years: period(\n      distinct_on: fiscal_year, \n      where: {revenues: {revenue: {_is_null: false}, period: {period: {_eq: "Fiscal Year"}}}}, \n      order_by: {fiscal_year: asc}) {\n        fiscal_year\n    }\n\n    disbursement_fiscal_years: period(\n      distinct_on: fiscal_year, \n      where: {disbursements: {disbursement: {_is_null: false}, period: {period: {_eq: "Fiscal Year"}}}}, \n      order_by: {fiscal_year: asc}) {\n        fiscal_year\n    }\n    total_yearly_fiscal_revenue(where: {year: {_eq: 2020}}) {\n      sum\n    }\n\n    total_yearly_fiscal_disbursement(where: {year: {_eq: 2020}}) {\n      sum\n    }\n    disbursement_gomesa: disbursement_source_summary(\n      where: {fiscal_year: {_eq: "2020"}, source: {_eq: "GOMESA offshore"}, state_or_area: {_eq: "NF"}}, \n      order_by: {fiscal_year: asc, total: desc}\n      ) {\n      source\n      sum: total\n    }\n  }\n'])))),K=Object(P["a"])(y||(y=Object(O["a"])(["\n  query {\n    contacts {\n      id\n      status\n      primary_contact\n      primary_email\n      primary_phone\n    }\n  }\n"]))),D=Object(P["a"])(I||(I=Object(O["a"])(["\n  query {\n    NYMEX {\n      id\n      status\n      date\n      average\n      roll\n      Spreadsheet {\n        id\n      }\n    }\n  }\n"]))),G=Object(P["a"])(w||(w=Object(O["a"])(["\n  query {\n    press_releases(limit: -1) {\n      id\n      title\n      date\n      file {\n        id\n      }\n      link\n      excerpt\n      status\n    }\n  }\n"]))),U=Object(P["a"])(E||(E=Object(O["a"])(["\n  query {\n    reporter_letters(limit: -1) {\n      id\n      title\n      date\n      file {\n        id\n      }\n      accessible_file {\n        id\n      }\n      link\n      status\n    }\n  }\n"])))},"034f":function(e,n,t){"use strict";t("85ec")},"0399":function(e,n,t){"use strict";t("5ad5")},"15f2":function(e,n,t){},"1b62":function(e,n,t){"use strict";t.d(n,"b",(function(){return o["a"]})),t.d(n,"a",(function(){return l}));var o=t("c68d"),a=(t("d3b7"),t("3ca3"),t("ddb0"),function(){return t.e("EditorBlock").then(t.bind(null,"1fdb"))}),l={props:{block:Object},components:{EditorBlock:a}}},"3ce1":function(e,n,t){"use strict";t("bad7")},"419f":function(e,n,t){"use strict";t("53f6")},"53f6":function(e,n,t){},"56d7":function(e,n,t){"use strict";t.r(n),t.d(n,"apolloClient",(function(){return Qe}));t("e260"),t("e6cf"),t("cca6"),t("a79d");var o=t("2b0e"),a=t("58ca"),l=(t("d3b7"),t("3ca3"),t("ddb0"),t("159b"),t("b64b"),t("25f0"),t("caad"),t("2532"),t("ac1f"),t("1276"),t("7db0"),t("b0c0"),t("8c4f")),r=t("0306"),c=function(){var e=this,n=e.$createElement,t=e._self._c||n;return t("div",{staticClass:"home__wrap"},[e.$apollo.loading?t("div",{staticClass:"text-center"},[t("v-progress-circular",{attrs:{value:20}})],1):t("div",[e.pages_by_id?t("HeroImage",{attrs:{title:e.pages_by_id.hero_title,image:e.API_URL+"/assets/"+e.pages_by_id.hero_image.id+"?fit=cover&quality=80",isHome:!0}}):e._e(),t("v-container",{staticClass:"home-content"},[t("v-row",[t("v-col",{staticClass:"pt-6",attrs:{cols:"12",xs:"12",sm:"8"}},[t("LayoutBlock",{attrs:{layoutBlocks:e.page.page_blocks}}),t("v-row",{staticClass:"revenue-row"},[t("v-col",{attrs:{cols:"12",xs:"12",md:"12"}},[t("v-card",{staticClass:"card",attrs:{outlined:"",elevation:"0"}},[t("RevenueBlock",{attrs:{title:"Revenue Statistics"}})],1)],1)],1)],1),t("v-col",{attrs:{cols:"12",xs:"12",sm:"4"}},e._l(e.page.sidebar_blocks.blocks,(function(n){return t("div",{key:n.id},[t(e.pageBlock(n.type),{tag:"component",staticClass:"block-component",attrs:{block:n}})],1)})),0)],1)],1)],1)])},i=[],s=(t("18a5"),t("1b62")),u=function(){return t.e("chunk-4e8ec65f").then(t.bind(null,"6e63"))},d=function(){return t.e("HeroImage").then(t.bind(null,"70fe"))},m=function(){return t.e("LayoutBlock").then(t.bind(null,"0b83"))},b={mixins:[s["b"]],name:"Home",metaInfo:{title:"Home"},data:function(){return{API_URL:"https://dev-onrr-cms.app.cloud.gov"}},apollo:{pages_by_id:{query:r["c"],loadingKey:"loading...",variables:function(){return{ID:1}},result:function(e){var n=e.data;n&&console.log("contentBlocks data: ",n)},fetchPolicy:"cache-and-network"}},components:{RevenueBlock:u,HeroImage:d,LayoutBlock:m},created:function(){console.log("view vuetify obj---------\x3e",this.$vuetify)},mounted:function(){console.log("breakpoint-------\x3e ",this.$vuetify.breakpoint.width)},methods:{},computed:{cssProps:function(){return{"--anchor-color":this.$vuetify.theme.themes.dark.anchor}},page:function(){return this.pages_by_id}}},f=b,A=(t("b704"),t("2877")),p=t("6544"),g=t.n(p),h=t("b0af"),C=t("62ad"),k=t("a523"),_=t("490a"),v=t("0fd9"),B=Object(A["a"])(f,c,i,!1,null,"6ef83f7a",null),y=B.exports;g()(B,{VCard:h["a"],VCol:C["a"],VContainer:k["a"],VProgressCircular:_["a"],VRow:v["a"]}),o["a"].use(l["a"]);var I=[{path:"/",name:"Home",components:{default:y},meta:{breadcrumb:"Home"},props:!0},{path:"/getting-started",props:!0,component:function(){return t.e("TwoColumnLeft").then(t.bind(null,"42b1"))},children:[{path:"/",component:function(){return t.e("Page").then(t.bind(null,"2048"))}},{path:":slug",component:function(){return t.e("Page").then(t.bind(null,"2048"))},props:!0,meta:{breadcrumb:""},children:[{path:":slug",name:"TwoColumnLeft",component:function(){return t.e("Page").then(t.bind(null,"2048"))},props:!0,meta:{breadcrumb:""}}]}],meta:{breadcrumb:"Getting Started"}},{path:"/reporting",name:"TwoColumnLeft",props:!0,component:function(){return t.e("TwoColumnLeft").then(t.bind(null,"42b1"))},children:[{path:"/",component:function(){return t.e("Page").then(t.bind(null,"2048"))}},{path:":slug",name:"TwoColumnLeft",component:function(){return t.e("Page").then(t.bind(null,"2048"))},props:!0,meta:{breadcrumb:""},children:[{path:":slug",name:"TwoColumnLeft",component:function(){return t.e("Page").then(t.bind(null,"2048"))},props:!0,meta:{breadcrumb:""}}]}],meta:{breadcrumb:"Reporting"}},{path:"/references",name:"TwoColumnLeft",props:!0,component:function(){return t.e("TwoColumnLeft").then(t.bind(null,"42b1"))},children:[{path:"/",component:function(){return t.e("Page").then(t.bind(null,"2048"))}},{path:":slug",name:"TwoColumnLeft",component:function(){return t.e("Page").then(t.bind(null,"2048"))},props:!0,meta:{breadcrumb:""},children:[{path:":slug",name:"TwoColumnLeft",component:function(){return t.e("Page").then(t.bind(null,"2048"))},props:!0,meta:{breadcrumb:""}}]}],meta:{breadcrumb:"References"}},{path:"/paying",name:"TwoColumnLeft",props:!0,component:function(){return t.e("TwoColumnLeft").then(t.bind(null,"42b1"))},children:[{path:"/",component:function(){return t.e("Page").then(t.bind(null,"2048"))}},{path:":slug",name:"TwoColumnLeft",component:function(){return t.e("Page").then(t.bind(null,"2048"))},props:!0,meta:{breadcrumb:""},children:[{path:":slug",name:"TwoColumnLeft",component:function(){return t.e("Page").then(t.bind(null,"2048"))},props:!0,meta:{breadcrumb:""}}]}],meta:{breadcrumb:"Paying"}},{path:"/compliance-enforcement",name:"TwoColumnLeft",props:!0,component:function(){return t.e("TwoColumnLeft").then(t.bind(null,"42b1"))},children:[{path:"/",component:function(){return t.e("Page").then(t.bind(null,"2048"))}},{path:":slug",name:"TwoColumnLeft",component:function(){return t.e("Page").then(t.bind(null,"2048"))},props:!0,meta:{breadcrumb:""},children:[{path:":slug",name:"TwoColumnLeft",component:function(){return t.e("Page").then(t.bind(null,"2048"))},props:!0,meta:{breadcrumb:""}}]}],meta:{breadcrumb:"Compliance Enforcement"}},{path:"/indian",name:"TwoColumnLeft",props:!0,component:function(){return t.e("TwoColumnLeft").then(t.bind(null,"42b1"))},children:[{path:"/",component:function(){return t.e("Page").then(t.bind(null,"2048"))}},{path:":slug",name:"TwoColumnLeft",component:function(){return t.e("Page").then(t.bind(null,"2048"))},props:!0,meta:{breadcrumb:""},children:[{path:":slug",name:"TwoColumnLeft",component:function(){return t.e("Page").then(t.bind(null,"2048"))},props:!0,meta:{breadcrumb:""}}]}],meta:{breadcrumb:"Indian Resources"}},{path:"/about",name:"TwoColumnLeft",props:!0,component:function(){return t.e("TwoColumnLeft").then(t.bind(null,"42b1"))},children:[{path:"",component:function(){return t.e("Page").then(t.bind(null,"2048"))}},{path:":slug",component:function(){return t.e("Page").then(t.bind(null,"2048"))},props:!0,meta:{breadcrumb:""},children:[{path:":slug",name:"TwoColumnLeft",component:function(){return t.e("Page").then(t.bind(null,"2048"))},props:!0,meta:{breadcrumb:""}}]}],meta:{breadcrumb:"About ONRR"}},{path:"/404",name:"PageNotFound",component:function(){return t.e("PageNotFound").then(t.bind(null,"a5b5"))},meta:{breadcrumb:"Page Not Found"}},{path:":catchAll(.*)",redirect:"/404"}],w=new l["a"]({mode:"history",linkExactActiveClass:"nav-active-class",routes:I});function E(e){setTimeout((function(){e.forEach((function(e){var n={};n.path=e.from,n.redirect=e.to,n.children=[{path:":slug",redirect:e.to}],w.addRoute(n)}))}),1e3)}function O(e){return!!Object.keys(e.query).length}w.beforeEach((function(e,n,t){Qe.query({query:r["h"]}).then((function(n){if(null!==n&&void 0!==n&&n.data){var o=n.data.pages,a=n.data.redirects;E(a);var l=location.pathname.toString(),r=e.fullPath.includes("?")?e.fullPath.split("?")[0]:e.fullPath,c=o.find((function(e){return e.url===r})),i=a.find((function(e){return e.from===l}));i?t():(void 0===c&&t({name:"PageNotFound"}),c&&t())}})).catch((function(e){return console.err(e)})),!O(e)&&O(n)?t({name:e.name,query:n.query}):t()}));var P=w,T=t("522d"),L=t("2c82"),x=t("957f"),j=t("a18f"),F=t.n(j),N=t("f309");o["a"].use(N["a"]);var R=new N["a"]({theme:{themes:{dark:{primary:"#121212",secondary:"#19642a9",anchor:"#0076a3"},light:{primary:{base:"#1a227e",lighten9:"#e8eaf5",lighten8:"#c5c9e8",lighten7:"#9ea7d8",lighten6:"#7885c8",lighten5:"#5b6abc",lighten4:"#3f50b1",lighten3:"#3948a7",lighten2:"#303e9b",lighten1:"#28348f",darken1:"#000051"},secondary:{base:"#0076a3",lighten8:"#e1f4f9",lighten7:"#b3e4f0",lighten6:"#83d2e7",lighten5:"#57c0de",lighten4:"#38b3da",lighten3:"#19a6d6",lighten2:"#0f98c9",lighten1:"#0086b6",darken1:"#005682"},anchor:"#0076a3",accent:"#534aae",green:{base:"#097d4d",lighten1:"#4aad79",darken1:"#005024"},purple:{base:"#650d79",lighten1:"#960d79",darken1:"#36004c"},yellow:{base:"#b6890f",lighten1:"#ecb947",darken1:"#825c100"},neutrals:{base:"#262431",lighten1:"#484554",lighten2:"#ebebed"},expansionPanel:"#ebebed"}},options:{customProperties:!0}}}),S=function(){var e=this,n=e.$createElement,t=e._self._c||n;return t("v-app",[t("AppToolbar"),t("v-main",[t("router-view",{key:e.$route.path})],1),t("Footer")],1)},V=[],H=function(){var e=this,n=e.$createElement,o=e._self._c||n;return o("div",[o("v-system-bar",{staticClass:"system-bar",class:{"hidden-system-bar":!e.showSystemBar},attrs:{app:"",height:"30"}},[o("div",{staticClass:"banner-wrap"},[o("v-img",{staticClass:"shrink mr-2",attrs:{alt:"U.S. Flag",contain:"",src:t("fb35"),transition:"scale-transition",width:"20"}}),e._v(" An official website of the U.S. government ")],1)]),o("v-app-bar",{staticClass:"v-app-bar-wrap",class:{"hidden-system-bar":!e.showSystemBar},attrs:{app:"",color:"primary darken-1",dark:"",height:e.showSystemBar?"80px":"60px"},scopedSlots:e._u([e.isMobile?null:{key:"extension",fn:function(){return[o("div",{staticClass:"d-none d-lg-block"},[o("MainMenu")],1)]},proxy:!0}],null,!0)},[o("div",{staticClass:"d-flex logo"},[o("router-link",{attrs:{to:"/"}},[o("v-img",{staticClass:"logo shrink mr-2",attrs:{alt:"Office of Natural Resources and Revenue (ONRR) Logo",contain:"",src:t("a4e7"),transition:"scale-transition"}})],1),o("router-link",{attrs:{to:"/"}},[o("v-toolbar-title",[o("div",{staticClass:"logo-content"},[o("span",[e._v("U.S. Department of the Interior")]),o("span",[e._v("Office of Natural")]),o("span",[e._v("Resources Revenue (ONRR)")])])])],1)],1),o("v-spacer"),o("HeaderMenu"),o("div",{staticClass:"d-lg-none"},[o("v-app-bar-nav-icon",{on:{click:function(n){n.stopPropagation(),e.drawer=!e.drawer}}})],1)],1),o("v-navigation-drawer",{attrs:{app:"",absolute:"",right:"",temporary:""},model:{value:e.drawer,callback:function(n){e.drawer=n},expression:"drawer"}},[o("v-list",e._l(e.menuItems,(function(n){return o("v-list-group",{key:n.id,attrs:{"no-action":""},scopedSlots:e._u([{key:"activator",fn:function(){return[o("v-list-item-content",[o("v-list-item-title",{domProps:{textContent:e._s(n.menu_label)}})],1)]},proxy:!0}],null,!0)},[o("v-list",[o("v-list-item",{staticClass:"child-item",attrs:{to:"/"+n.link_to_page.url}},[e._v(" "+e._s(n.menu_label+" Home")+" ")]),e._l(n.menu_children,(function(n){return o("v-list-item",{key:n.id,staticClass:"child-item",attrs:{to:n.pages_id.url}},[o("v-list-item-content",[o("v-list-item-title",{domProps:{textContent:e._s(n.menu_label)}})],1)],1)}))],2)],1)})),1)],1),o("v-btn",{directives:[{name:"scroll",rawName:"v-scroll",value:e.onScroll,expression:"onScroll"},{name:"show",rawName:"v-show",value:e.fab,expression:"fab"}],attrs:{color:"primary",dark:"",fab:"",fixed:"",bottom:"",left:"",elevation:"2"},on:{click:e.toTop}},[o("v-icon",{attrs:{color:"white"}},[e._v("mdi-chevron-up")])],1)],1)},Q=[],q=(t("4de4"),function(){var e=this,n=e.$createElement,t=e._self._c||n;return t("div",{staticClass:"d-none d-lg-block"},[e._l(e.menuItems,(function(n){return t("v-btn",{key:n.id,staticClass:"no-btn-hover",attrs:{to:n.link_to_page&&n.link_to_page.url,href:n.custom_url&&n.custom_url,text:"",dark:""}},[t("span",{staticClass:"v-btn__content"},[n.menu_icon?t("v-icon",{attrs:{color:"white"}},[e._v(e._s(n.menu_icon))]):e._e(),n.menu_label?t("span",{staticClass:"mr-2"},[e._v(e._s(n.menu_label))]):e._e()],1)])})),"localhost"===e.hostname||"192.168.0.22"===e.hostname?t("v-btn",{attrs:{plain:""}},[t("v-switch",{attrs:{flat:"",color:"anchor",label:""},model:{value:e.themeSwitch,callback:function(n){e.themeSwitch=n},expression:"themeSwitch"}})],1):e._e()],2)}),M=[],X={name:"HeaderMenu",data:function(){return{hostname:location.hostname,menus:[],themeSwitch:!1}},apollo:{menus:{query:r["d"],loadingKey:"loading..."}},computed:{menuItems:function(){return this.menus.filter((function(e){return"header"===e.menu}))}},watch:{themeSwitch:function(){this.$vuetify.theme.dark=!this.$vuetify.theme.dark}}},z=X,Y=(t("3ce1"),t("8336")),K=t("132d"),D=t("b73d"),G=Object(A["a"])(z,q,M,!1,null,"1349326a",null),U=G.exports;g()(G,{VBtn:Y["a"],VIcon:K["a"],VSwitch:D["a"]});var J=function(){var e=this,n=e.$createElement,t=e._self._c||n;return t("div",[e.$apollo.loading?t("label",{attrs:{text:""}}):t("nav",{staticClass:"primary",attrs:{id:"main-menu"}},[t("ul",[e._l(e.menuItems,(function(n){return t("li",{key:n.id},[t("v-menu",{attrs:{"open-on-hover":"","offset-y":""},scopedSlots:e._u([{key:"activator",fn:function(o){var a=o.on,l=o.attrs;return[t("v-btn",e._g(e._b({staticClass:"menu-btn",attrs:{color:"white",text:"",dark:""}},"v-btn",l,!1),a),[e._v(" "+e._s(n.menu_label)+" ")])]}}],null,!0)},[t("v-list",[t("v-list-item",{staticClass:"menu-btn",attrs:{to:n.link_to_page.url}},[e._v(" "+e._s(n.menu_label+" Home")+" ")]),e._l(n.menu_children,(function(n,o){return t("v-list-item",{key:o,staticClass:"menu-btn",attrs:{href:""+n.pages_id.url}},[e._v(" "+e._s(n.pages_id.title)+" ")])}))],2)],1)],1)})),t("li",[t("v-text-field",{staticClass:"search-input",attrs:{"solo-inverted":"",dense:"",label:"Search","prepend-inner-icon":"mdi-magnify",color:"white"}})],1)],2)])])},W=[],$={name:"MainMenu",data:function(){return{menus:[],cItems:[]}},apollo:{menus:{query:r["d"],loadingKey:"loading..."}},methods:{onClick:function(e){e&&console.debug("You clicked ".concat(e))},childItems:function(e){this.cItems=this.menus&&this.menus.filter((function(n){return n.id===e}))[0].menu_children}},computed:{menuItems:function(){return this.menus.filter((function(e){return"main"===e.menu}))}}},Z=$,ee=(t("0399"),t("8860")),ne=t("da13"),te=t("e449"),oe=t("8654"),ae=Object(A["a"])(Z,J,W,!1,null,"6a7929be",null),le=ae.exports;g()(ae,{VBtn:Y["a"],VList:ee["a"],VListItem:ne["a"],VMenu:te["a"],VTextField:oe["a"]});var re=30,ce=150,ie={name:"AppToolbar",data:function(){return{showSystemBar:!0,lastScrollPosition:0,scrollValue:0,drawer:!1,group:null,isMobile:!1,fab:!1,menus:[]}},apollo:{menus:{query:r["d"],loadingKey:"loading..."}},components:{HeaderMenu:U,MainMenu:le},beforeDestroy:function(){window.removeEventListener("scroll",this.onScroll),"undefined"!==typeof window&&window.removeEventListener("resize",this.onResize,{passive:!0})},mounted:function(){this.lastScrollPosition=window.pageYOffset,window.addEventListener("scroll",this.onScroll);var e=document.createElement("meta");e.name="viewport",e.content="width=device-width, initial-scale=1",document.head.appendChild(e),this.onResize(),window.addEventListener("resize",this.onResize,{passive:!0})},watch:{group:function(){this.drawer=!1}},methods:{toggleTheme:function(){this.$vuetify.theme.dark=!this.$vuetify.theme.dark},onScroll:function(e){if("undefined"!==typeof window){var n=window.pageYOffset||e.target.scrollTop||0;this.fab=n>ce,window.pageYOffset<0||Math.abs(window.pageYOffset-this.lastScrollPosition)<re||(this.showSystemBar=window.pageYOffset<this.lastScrollPosition,this.lastScrollPosition=window.pageYOffset)}},toTop:function(){this.$vuetify.goTo(0)},onResize:function(){this.isMobile=window.innerWidth<1264}},computed:{menuItems:function(){return this.menus.filter((function(e){return"main"===e.menu}))},height:function(){switch(this.$vuetify.breakpoint.name){case"lg":return 50;default:return 50}}}},se=ie,ue=(t("abdb"),t("40dc")),de=t("5bc1"),me=t("adda"),be=t("56b0"),fe=t("5d23"),Ae=t("f774"),pe=t("2fa4"),ge=t("afd9"),he=t("2a7f"),Ce=t("269a"),ke=t.n(Ce),_e=t("f977"),ve=Object(A["a"])(se,H,Q,!1,null,"09bb42ba",null),Be=ve.exports;g()(ve,{VAppBar:ue["a"],VAppBarNavIcon:de["a"],VBtn:Y["a"],VIcon:K["a"],VImg:me["a"],VList:ee["a"],VListGroup:be["a"],VListItem:ne["a"],VListItemContent:fe["a"],VListItemTitle:fe["c"],VNavigationDrawer:Ae["a"],VSpacer:pe["a"],VSystemBar:ge["a"],VToolbarTitle:he["b"]}),ke()(ve,{Scroll:_e["b"]});var ye=function(){var e=this,n=e.$createElement,o=e._self._c||n;return o("v-footer",{staticClass:"footer",attrs:{padless:""}},[o("v-toolbar",{staticClass:"top",attrs:{tag:"div",dense:"",elevation:"0"}},[o("v-toolbar-items",e._l(e.menuItemsTop,(function(n){return o("v-btn",{key:n.id,attrs:{href:n.custom_url?n.custom_url:n.link_to_page,plain:"",color:"white"}},[e._v(" "+e._s(n.menu_label)+" ")])})),1)],1),o("v-toolbar",{staticClass:"bottom",attrs:{dense:"",elevation:"0",tag:"div"}},[o("v-toolbar-items",e._l(e.menuItemsBottom,(function(n){return o("v-btn",{key:n.id,attrs:{href:n.custom_url?n.custom_url:n.link_to_page,plain:"",color:"white"}},[e._v(" "+e._s(n.menu_label)+" ")])})),1)],1),o("v-toolbar",{staticClass:"abs-bottom",attrs:{tag:"div",height:"120px",elevation:"0"}},[o("v-toolbar-title",[o("div",{staticClass:"footer-logo-wrap"},[o("router-link",{attrs:{to:"/"}},[o("v-img",{staticClass:"shrink mr-2",attrs:{alt:"ONNR Logo",contain:"",src:t("a4e7"),transition:"scale-transition",width:"70"}})],1),o("router-link",{attrs:{to:"/"}},[o("div",{staticClass:"logo-content"},[o("span",[e._v("U.S. Department of the Interior")]),o("span",[e._v("Office of Natural")]),o("span",[e._v("Resources Revenue (ONRR)")])])])],1)]),o("v-spacer"),o("v-toolbar-items",{staticClass:"social-menu"},e._l(e.socialMenuItems,(function(n){return o("v-btn",{key:n.id,staticClass:"no-btn-hover",attrs:{to:n.slug,text:"",dark:""}},[o("span",{staticClass:"v-btn__content"},[n.menu_icon?o("v-icon",{attrs:{color:"white"}},[e._v(e._s(n.menu_icon))]):e._e(),"Contact Us"===n.menu_label?o("span",{staticClass:"mr-2",staticStyle:{color:"white"}},[e._v(e._s(n.menu_label))]):e._e()],1)])})),1)],1)],1)},Ie=[],we={name:"Footer",data:function(){return{menus:[]}},apollo:{menus:{query:r["d"],loadingKey:"loading..."}},computed:{menuItemsTop:function(){var e=this.menus.filter((function(e){return"footer"===e.menu}));return e.filter((function(e,n){return n<5}))},menuItemsBottom:function(){var e=this.menus.filter((function(e){return"footer"===e.menu}));return e.filter((function(e,n){return n>4}))},socialMenuItems:function(){return this.menus.filter((function(e){return"social"===e.menu}))}}},Ee=we,Oe=(t("419f"),t("553a")),Pe=t("71d9"),Te=Object(A["a"])(Ee,ye,Ie,!1,null,"ac2b48f2",null),Le=Te.exports;g()(Te,{VBtn:Y["a"],VFooter:Oe["a"],VIcon:K["a"],VImg:me["a"],VSpacer:pe["a"],VToolbar:Pe["a"],VToolbarItems:he["a"],VToolbarTitle:he["b"]});var xe={name:"App",metaInfo:function(){return{title:"Office of Natural Resources Revenue",titleTemplate:"%s | Office of Natual Resources Revenue",meta:[{property:"og:site_name",content:"Office of Natural Resources Revenue"},{property:"og:type",content:"website"},{name:"robots",content:"index,follow"}]}},components:{AppToolbar:Be,Footer:Le},data:function(){return{}},created:function(){console.log("this.$route.fullPath --------------------\x3e ",this.$route.fullPath)}},je=xe,Fe=(t("034f"),t("7496")),Ne=t("f6c4"),Re=Object(A["a"])(je,S,V,!1,null,null,null),Se=Re.exports;g()(Re,{VApp:Fe["a"],VMain:Ne["a"]});var Ve=t("f83c"),He=new x["a"]({introspectionQueryResultData:Ve}),Qe=new L["a"]({fetch:F.a,uri:"".concat("https://dev-onrr-cms.app.cloud.gov","/graphql"),cache:He}),qe=new L["a"]({fetch:F.a,uri:"".concat("https://dev-onrr-cms.app.cloud.gov","/graphql/system"),cache:He}),Me=new L["a"]({fetch:F.a,uri:"".concat("https://hasura-dev.app.cloud.gov","/v1/graphql"),cache:He}),Xe=new T["a"]({defaultClient:Qe,clients:{a:qe,b:Me}});o["a"].config.productionTip=!1,o["a"].use(T["a"]),o["a"].use(a["a"]),new o["a"]({vuetify:R,apolloProvider:Xe,router:P,render:function(e){return e(Se)}}).$mount("#app")},"5ad5":function(e,n,t){},"85ec":function(e,n,t){},"97d3":function(e,n,t){},a4e7:function(e,n,t){e.exports=t.p+"img/ONRR-mark-200x200.aa1c41f6.png"},abdb:function(e,n,t){"use strict";t("97d3")},b704:function(e,n,t){"use strict";t("15f2")},bad7:function(e,n,t){},c68d:function(e,n,t){"use strict";t.d(n,"a",(function(){return f}));t("d3b7"),t("3ca3"),t("ddb0");var o=function(){return t.e("TextBlock").then(t.bind(null,"30d2"))},a=function(){return t.e("TabsBlock").then(t.bind(null,"712c"))},l=function(){return t.e("ContentBlock").then(t.bind(null,"7d38"))},r=function(){return t.e("ListBlock").then(t.bind(null,"b134"))},c=function(){return t.e("TableBlock").then(t.bind(null,"6229"))},i=function(){return t.e("CodeBlock").then(t.bind(null,"11d9"))},s=function(){return t.e("ImageBlock").then(t.bind(null,"c7d7"))},u=function(){return t.e("CardBlock").then(t.bind(null,"f8bd"))},d=function(){return t.e("CollectionBlock").then(t.bind(null,"1ae4"))},m=function(){return t.e("HorizontalRuleBlock").then(t.bind(null,"77ae"))},b=function(){return t.e("ExpansionPanelBlock").then(t.bind(null,"afb5"))},f={data:function(){return{content:[]}},props:{blockContent:[Array,Object]},components:{TextBlock:o,TabsBlock:a,ListBlock:r,TableBlock:c,CodeBlock:i,ImageBlock:s,ContentBlock:l,CardBlock:u,CollectionBlock:d,HorizontalRuleBlock:m,ExpansionPanelBlock:b},created:function(){console.log("Hello from the pageBlockMixin!")},methods:{pageBlock:function(e){var n;switch(console.log("pageBlockMixin pageBlock type: ",e),e){case"tab_blocks":n=a;break;case"content_blocks":n=l;break;case"card_blocks":n=u;break;case"header":case"paragraph":n=o;break;case"list":n=r;break;case"table":n=c;break;case"code":n=i;break;case"image":n=s;break;case"collection":n=d;break;case"horizontalrule":n=m;break;case"expansion_panels":n=b;break;default:console.warn("pageBlock not found!",e),n=l;break}return n}},computed:{}}},f83c:function(e){e.exports=JSON.parse('{"__schema":{"types":[{"kind":"OBJECT","name":"UNION","possibleTypes":[{"name":"section_heading_blocks"},{"name":"text_blocks"},{"name":"tab_blocks"},{"name":"content_blocks"}]},{"kind":"UNION","name":"tab_blocks_tab_block_item_union","possibleTypes":[{"name":"tab_blocks_contents"},{"name":"content_blocks"}]}]}}')},fb35:function(e,n){e.exports="data:image/png;base64,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"}});
//# sourceMappingURL=app.a5e18ff0.js.map