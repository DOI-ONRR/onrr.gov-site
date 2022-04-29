"use strict";(self["webpackChunkonrr_frontend_app_vue"]=self["webpackChunkonrr_frontend_app_vue"]||[]).push([[315],{6428:function(){},9391:function(t,e,a){a.d(e,{Z:function(){return o}});var i=a(2238),n=a(2413),s=a(8084),r=a(3553),o=(0,r.Z)(n.Z,s.Z,i.Z).extend({name:"v-card",props:{flat:Boolean,hover:Boolean,img:String,link:Boolean,loaderHeight:{type:[Number,String],default:4},raised:Boolean},computed:{classes(){return{"v-card":!0,...s.Z.options.computed.classes.call(this),"v-card--flat":this.flat,"v-card--hover":this.hover,"v-card--link":this.isClickable,"v-card--loading":this.loading,"v-card--disabled":this.disabled,"v-card--raised":this.raised,...i.Z.options.computed.classes.call(this)}},styles(){const t={...i.Z.options.computed.styles.call(this)};return this.img&&(t.background=`url("${this.img}") center center / cover no-repeat`),t}},methods:{genProgress(){const t=n.Z.options.methods.genProgress.call(this);return t?this.$createElement("div",{staticClass:"v-card__progress",key:"progress"},[t]):null}},render(t){const{tag:e,data:a}=this.generateRouteLink();return a.style=this.styles,this.isClickable&&(a.attrs=a.attrs||{},a.attrs.tabindex=0),t(e,this.setBackgroundColor(this.color,a),[this.genProgress(),this.$slots.default])}})},306:function(t,e,a){a.d(e,{EB:function(){return l},Qq:function(){return r},ZB:function(){return o}});var i=a(9391),n=a(5598);const s=(0,n.Ji)("v-card__actions"),r=(0,n.Ji)("v-card__subtitle"),o=(0,n.Ji)("v-card__text"),l=(0,n.Ji)("v-card__title");i.Z},3121:function(t,e,a){a(6699),a(6428);var i=a(144),n=a(5218),s=a(5598);const r=["sm","md","lg","xl"],o=(()=>r.reduce(((t,e)=>(t[e]={type:[Boolean,String,Number],default:!1},t)),{}))(),l=(()=>r.reduce(((t,e)=>(t["offset"+(0,s.jC)(e)]={type:[String,Number],default:null},t)),{}))(),c=(()=>r.reduce(((t,e)=>(t["order"+(0,s.jC)(e)]={type:[String,Number],default:null},t)),{}))(),u={col:Object.keys(o),offset:Object.keys(l),order:Object.keys(c)};function h(t,e,a){let i=t;if(null!=a&&!1!==a){if(e){const a=e.replace(t,"");i+=`-${a}`}return"col"!==t||""!==a&&!0!==a?(i+=`-${a}`,i.toLowerCase()):i.toLowerCase()}}const d=new Map;e["Z"]=i.Z.extend({name:"v-col",functional:!0,props:{cols:{type:[Boolean,String,Number],default:!1},...o,offset:{type:[String,Number],default:null},...l,order:{type:[String,Number],default:null},...c,alignSelf:{type:String,default:null,validator:t=>["auto","start","end","center","baseline","stretch"].includes(t)},tag:{type:String,default:"div"}},render(t,{props:e,data:a,children:i,parent:s}){let r="";for(const n in e)r+=String(e[n]);let o=d.get(r);if(!o){let t;for(t in o=[],u)u[t].forEach((a=>{const i=e[a],n=h(t,a,i);n&&o.push(n)}));const a=o.some((t=>t.startsWith("col-")));o.push({col:!a||!e.cols,[`col-${e.cols}`]:e.cols,[`offset-${e.offset}`]:e.offset,[`order-${e.order}`]:e.order,[`align-self-${e.alignSelf}`]:e.alignSelf}),d.set(r,o)}return t(e.tag,(0,n.ZP)(a,{class:o}),i)}})},6643:function(t,e,a){a.d(e,{Z:function(){return r}});a(9941),a(6428);var i=a(144);function n(t){return i.Z.extend({name:`v-${t}`,functional:!0,props:{id:String,tag:{type:String,default:"div"}},render(e,{props:a,data:i,children:n}){i.staticClass=`${t} ${i.staticClass||""}`.trim();const{attrs:s}=i;if(s){i.attrs={};const t=Object.keys(s).filter((t=>{if("slot"===t)return!1;const e=s[t];return t.startsWith("data-")?(i.attrs[t]=e,!1):e||"string"===typeof e}));t.length&&(i.staticClass+=` ${t.join(" ")}`)}return a.id&&(i.domProps=i.domProps||{},i.domProps.id=a.id),e(a.tag,i,n)}})}var s=a(5218),r=n("container").extend({name:"v-container",functional:!0,props:{id:String,tag:{type:String,default:"div"},fluid:{type:Boolean,default:!1}},render(t,{props:e,data:a,children:i}){let n;const{attrs:r}=a;return r&&(a.attrs={},n=Object.keys(r).filter((t=>{if("slot"===t)return!1;const e=r[t];return t.startsWith("data-")?(a.attrs[t]=e,!1):e||"string"===typeof e}))),e.id&&(a.domProps=a.domProps||{},a.domProps.id=e.id),t(e.tag,(0,s.ZP)(a,{staticClass:"container",class:Array({"container--fluid":e.fluid}).concat(n||[])}),i)}})},4722:function(t,e,a){a(6699),a(6428);var i=a(144),n=a(5218),s=a(5598);const r=["sm","md","lg","xl"],o=["start","end","center"];function l(t,e){return r.reduce(((a,i)=>(a[t+(0,s.jC)(i)]=e(),a)),{})}const c=t=>[...o,"baseline","stretch"].includes(t),u=l("align",(()=>({type:String,default:null,validator:c}))),h=t=>[...o,"space-between","space-around"].includes(t),d=l("justify",(()=>({type:String,default:null,validator:h}))),p=t=>[...o,"space-between","space-around","stretch"].includes(t),g=l("alignContent",(()=>({type:String,default:null,validator:p}))),f={align:Object.keys(u),justify:Object.keys(d),alignContent:Object.keys(g)},m={align:"align",justify:"justify",alignContent:"align-content"};function v(t,e,a){let i=m[t];if(null!=a){if(e){const a=e.replace(t,"");i+=`-${a}`}return i+=`-${a}`,i.toLowerCase()}}const y=new Map;e["Z"]=i.Z.extend({name:"v-row",functional:!0,props:{tag:{type:String,default:"div"},dense:Boolean,noGutters:Boolean,align:{type:String,default:null,validator:c},...u,justify:{type:String,default:null,validator:h},...d,alignContent:{type:String,default:null,validator:p},...g},render(t,{props:e,data:a,children:i}){let s="";for(const n in e)s+=String(e[n]);let r=y.get(s);if(!r){let t;for(t in r=[],f)f[t].forEach((a=>{const i=e[a],n=v(t,a,i);n&&r.push(n)}));r.push({"no-gutters":e.noGutters,"row--dense":e.dense,[`align-${e.align}`]:e.align,[`justify-${e.justify}`]:e.justify,[`align-content-${e.alignContent}`]:e.alignContent}),y.set(s,r)}return t(e.tag,(0,n.ZP)(a,{staticClass:"row",class:r}),i)}})},6145:function(t,e,a){a.r(e),a.d(e,{default:function(){return Z}});var i=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",[a("v-container",{staticClass:"pa-0 mt-10"},[a("v-row",[a("v-col",{attrs:{cols:"12",sm:"6"}},[a("TextField",{attrs:{fields:t.searchInputField}})],1),t.searchResults?a("v-col",{attrs:{cols:"12",sm:"6"}},[a("SelectField",{attrs:{fields:t.categoriesSelectField},on:{change:t.collectionItems}})],1):t._e()],1),a("v-row",[a("v-col",[a("div",{staticClass:"text-left mt-4"},[t._v(" Displaying "+t._s(t.visibleItems.length)+" of "+t._s(t.collectionItems.length)+" contacts ")])]),a("v-col",[a("div",{staticClass:"text-right mb-4"},[a("v-pagination",{attrs:{color:"secondary",length:Math.ceil(t.collectionItems.length/t.perPage)},model:{value:t.page,callback:function(e){t.page=e},expression:"page"}})],1)])],1)],1),t.visibleItems.length>0?a("div",[a("v-fade-transition",{attrs:{group:"","hide-on-leave":"","leave-absolute":"",origin:"top left"}},t._l(t.visibleItems,(function(e,i){return a("div",{key:i,staticClass:"mb-5"},[a("h2",{staticClass:"collection-category pa-3 mb-3"},[t.searchResults?t._e():a("span",[t._v(" "+t._s(e.header)+" "),null!==e.agency?a("span",[t._v("("+t._s(e.agency)+")")]):t._e(),null!==e.operatorNumber?a("span",[t._v("(Operator #: "+t._s(e.operatorNumber)+")")]):t._e()]),t.searchResults?a("span",[t._v(" "+t._s(e.page)+" "+t._s(e.tab&&"> "+e.tab)+" "+t._s(e.accordion&&"> "+e.accordion)+" "+t._s(e.header&&"> "+e.header)+" "),null!==e.agency?a("span",[t._v("("+t._s(e.agency)+")")]):t._e(),null!==e.operatorNumber?a("span",[t._v("(Operator #: "+t._s(e.operatorNumber)+")")]):t._e()]):t._e()]),a("v-container",{staticClass:"pa-0"},[a("v-row",t._l(e.contacts,(function(e,i){return a("v-col",{key:i,attrs:{cols:"12",sm:"4"}},[e.contact?a("v-card",{staticClass:"text-wrap contact-card",attrs:{elevation:"1"}},[a("v-card-title",{class:[t.formatToSlug(e.role).toLowerCase(),"contact-title"]},[t._v(t._s(e.role))]),a("v-card-text",{staticClass:"pa-4"},[e.contact?a("div",{staticClass:"contact contact-row"},[t._v(t._s(e.contact))]):t._e(),e.email?a("div",{staticClass:"contact-row"},[a("v-icon",{staticClass:"mr-1",attrs:{color:"secondary"}},[t._v("mdi-email")]),a("a",{attrs:{href:"mailto:"+e.email}},[t._v(t._s(e.email))])],1):t._e(),e.phone?a("div",{staticClass:"contact-row"},[a("v-icon",{staticClass:"mr-1",attrs:{color:"secondary"}},[t._v("mdi-phone")]),a("a",{attrs:{href:"tel:"+e.phone}},[t._v(t._s(e.phone))])],1):t._e(),e.fax?a("div",{staticClass:"contact-row"},[a("v-icon",{staticClass:"mr-1",attrs:{color:"secondary"}},[t._v("mdi-fax")]),a("a",{attrs:{href:"tel:"+e.fax}},[t._v(t._s(e.fax))])],1):t._e()])],1):t._e()],1)})),1)],1)],1)})),0)],1):a("div",[t._v("No contacts found.")]),a("v-container",{staticClass:"pa-0"},[a("v-row",[a("v-col",[a("div",{staticClass:"text-left mt-4"},[t._v(" Displaying "+t._s(t.visibleItems.length)+" of "+t._s(t.collectionItems.length)+" contacts ")])]),a("v-col",[a("div",{staticClass:"text-right mb-4"},[a("v-pagination",{attrs:{color:"secondary",length:Math.ceil(t.collectionItems.length/t.perPage)},model:{value:t.page,callback:function(e){t.page=e},expression:"page"}})],1)])],1)],1)],1)},n=[],s=(a(6699),a(8930));const r=()=>a.e(707).then(a.bind(a,392)),o=()=>Promise.all([a.e(921),a.e(248)]).then(a.bind(a,2627));var l={name:"ContactsCollection",data(){return{page:1,perPage:5,searchInputField:{label:"Search contacts",text:null,ref:"searchContactsInput",color:"secondary",icon:"mdi-magnify"},categoriesSelectField:{items:[],label:"All Categories",ref:"categoriesSelectInput",selected:null,color:"secondary",icon:"mdi-chevron-down",params:"category"},filterBy:this.filter,searchResults:!1,contactsByCompanyPage:!1}},props:{collection:[Object,Array],collectionName:String,collectionLayout:String,collectionPage:String,collectionTab:String,collectionAccordion:String,showToolbar:Boolean,filter:String},components:{TextField:r,SelectField:o},methods:{formatToSlug:s.lx,resetPagination(){return this.page=1},findSearchValue(t){return this.searchInputField.text.toLowerCase().split(" ").every((e=>t&&t.toLowerCase().includes(e)))},filterProperties(t){console.log("filteredProperties items: ",t);const e=t.filter((({page:t,letter:e,header:a,operatorNumber:i,companyName:n,agency:s})=>this.findSearchValue(e)||this.findSearchValue(a)||this.findSearchValue(i)||this.findSearchValue(n)||this.findSearchValue(s)||this.findSearchValue(t)));return console.log("filterProperties filteredItems: ",e),e||t},filterContacts(t){const e=t.map((t=>({...t,contacts:t.contacts.filter((t=>{if(null!==t.contact)return this.findSearchValue(t.contact)||this.findSearchValue(t.email)||this.findSearchValue(t.role)}))}))).filter((t=>t.contacts.length>0));return e||t},filterByCategory(t){let e;return"All Categories"!==this.categoriesSelectField.selected&&(e=t.filter((t=>t.page===this.categoriesSelectField.selected||t.tab===this.categoriesSelectField.selected||t.accordion===this.categoriesSelectField.selected))),e||t},searchCategoriesItems(){let t=[];return Array.from(new Set(this.collection&&this.collection.map((e=>{e.page&&t.push(e.page),e.tab&&t.push(e.tab),e.accordion&&t.push(e.accordion)})))),["All Categories",...t.sort(((t,e)=>t<e?-1:1))]},createContactItem(t){let e={};return e.__typename=t.__typename,e.id=t.id,e.status=t.status,e.page=t.page,e.tab=t.tab,e.accordion=t.accordion,e.company=t.company_yn,e.letter=t.letter,e.header=t.header,e.companyName=t.company_name,e.operatorNumber=t.operator_number,e.agency=t.agency,e.contacts=[{contact:t.primary_contact,role:t.primary_role,email:t.email,phone:t.phone,fax:t.fax},{contact:t.contact_2,role:t.role_2,email:t.email_2,phone:t.phone_2},{contact:t.contact_3,role:t.role_3,email:t.email_3,phone:t.phone_3},{contact:t.contact_4,role:t.role_4,email:t.email_4,phone:t.phone_4},{contact:t.contact_5,role:t.role_5,email:t.email_5,phone:t.phone_5},{contact:t.contact_6,role:t.role_6,email:t.email_6,phone:t.phone_6}],e},filterByPage(t){return t.filter((t=>t.page===this.collectionPage))},filterByTab(t){return t.filter((t=>t.tab===this.collectionTab))},filterByAccordion(t){return t.filter((t=>t.accordion===this.collectionAccordion))}},computed:{collectionItems(){let t=[];this.collection&&this.collection.filter((e=>{let a=this.createContactItem(e);t.push(a)}));const e=this.collectionPage?this.filterByPage(this.filterByTab(this.filterByAccordion(t))):this.filterByCategory(t);if(this.searchInputField.text){this.resetPagination();let t=this.filterProperties(e);return 0===t.length?this.filterContacts(e):this.filterProperties(e)}return e},visibleItems(){return this.collectionItems.slice((this.page-1)*this.perPage,this.page*this.perPage)}},watch:{},created(){setTimeout((()=>{this.categoriesSelectField.items=this.searchCategoriesItems(),this.categoriesSelectField.selected=this.$route.query.category?decodeURI(this.$route.query.category):"All Categories"}),500)},mounted(){const t=this.$route.query.category&&decodeURI(this.$route.query.category),e=this.$route.query.q&&decodeURI(this.$route.query.q),a="search-results"===this.$route.params.slug2,i="company-contacts"===this.$route.params.slug2;t&&(this.categoriesSelectField.selected=t),(e||a)&&(this.searchResults=!0,this.searchInputField.text=e),i&&(this.contactsByCompanyPage=!0)}},c=l,u=a(1001),h=a(3453),d=a.n(h),p=a(9391),g=a(306),f=a(3121),m=a(6643),v=a(51),y=a(9639),_=a(3286),b=a(2139),C=a(5505),S=a(8250),x=a(171),$=a(3553),I=(0,$.Z)(C.Z,(0,S.Z)({onVisible:["init"]}),x.Z).extend({name:"v-pagination",directives:{Resize:b.Z},props:{circle:Boolean,disabled:Boolean,length:{type:Number,default:0,validator:t=>t%1===0},nextIcon:{type:String,default:"$next"},prevIcon:{type:String,default:"$prev"},totalVisible:[Number,String],value:{type:Number,default:0},pageAriaLabel:{type:String,default:"$vuetify.pagination.ariaLabel.page"},currentPageAriaLabel:{type:String,default:"$vuetify.pagination.ariaLabel.currentPage"},previousAriaLabel:{type:String,default:"$vuetify.pagination.ariaLabel.previous"},nextAriaLabel:{type:String,default:"$vuetify.pagination.ariaLabel.next"},wrapperAriaLabel:{type:String,default:"$vuetify.pagination.ariaLabel.wrapper"}},data(){return{maxButtons:0,selected:null}},computed:{classes(){return{"v-pagination":!0,"v-pagination--circle":this.circle,"v-pagination--disabled":this.disabled,...this.themeClasses}},items(){const t=parseInt(this.totalVisible,10);if(0===t)return[];const e=Math.min(Math.max(0,t)||this.length,Math.max(0,this.maxButtons)||this.length,this.length);if(this.length<=e)return this.range(1,this.length);const a=e%2===0?1:0,i=Math.floor(e/2),n=this.length-i+1+a;if(this.value>i&&this.value<n){const t=1,e=this.length,n=this.value-i+2,s=this.value+i-2-a,r=n-1===t+1?2:"...",o=s+1===e-1?s+1:"...";return[1,r,...this.range(n,s),o,this.length]}if(this.value===i){const t=this.value+i-1-a;return[...this.range(1,t),"...",this.length]}if(this.value===n){const t=this.value-i+1;return[1,"...",...this.range(t,this.length)]}return[...this.range(1,i),"...",...this.range(n,this.length)]}},watch:{value(){this.init()}},beforeMount(){this.init()},methods:{init(){this.selected=null,this.onResize(),this.$nextTick(this.onResize),setTimeout((()=>this.selected=this.value),100)},onResize(){const t=this.$el&&this.$el.parentElement?this.$el.parentElement.clientWidth:window.innerWidth;this.maxButtons=Math.floor((t-96)/42)},next(t){t.preventDefault(),this.$emit("input",this.value+1),this.$emit("next")},previous(t){t.preventDefault(),this.$emit("input",this.value-1),this.$emit("previous")},range(t,e){const a=[];t=t>0?t:1;for(let i=t;i<=e;i++)a.push(i);return a},genIcon(t,e,a,i,n){return t("li",[t("button",{staticClass:"v-pagination__navigation",class:{"v-pagination__navigation--disabled":a},attrs:{disabled:a,type:"button","aria-label":n},on:a?{}:{click:i}},[t(_.Z,[e])])])},genItem(t,e){const a=e===this.value&&(this.color||"primary"),i=e===this.value,n=i?this.currentPageAriaLabel:this.pageAriaLabel;return t("button",this.setBackgroundColor(a,{staticClass:"v-pagination__item",class:{"v-pagination__item--active":e===this.value},attrs:{type:"button","aria-current":i,"aria-label":this.$vuetify.lang.t(n,e)},on:{click:()=>this.$emit("input",e)}}),[e.toString()])},genItems(t){return this.items.map(((e,a)=>t("li",{key:a},[isNaN(Number(e))?t("span",{class:"v-pagination__more"},[e.toString()]):this.genItem(t,e)])))},genList(t,e){return t("ul",{directives:[{modifiers:{quiet:!0},name:"resize",value:this.onResize}],class:this.classes},e)}},render(t){const e=[this.genIcon(t,this.$vuetify.rtl?this.nextIcon:this.prevIcon,this.value<=1,this.previous,this.$vuetify.lang.t(this.previousAriaLabel)),this.genItems(t),this.genIcon(t,this.$vuetify.rtl?this.prevIcon:this.nextIcon,this.value>=this.length,this.next,this.$vuetify.lang.t(this.nextAriaLabel))];return t("nav",{attrs:{role:"navigation","aria-label":this.$vuetify.lang.t(this.wrapperAriaLabel)}},[this.genList(t,e)])}}),P=a(4722),w=(0,u.Z)(c,i,n,!1,null,"4b4574d6",null),Z=w.exports;d()(w,{VCard:p.Z,VCardText:g.ZB,VCardTitle:g.EB,VCol:f.Z,VContainer:m.Z,VFadeTransition:v.Z5,VIcon:y.Z,VPagination:I,VRow:P.Z})}}]);
//# sourceMappingURL=Contacts.3f47b93c.js.map