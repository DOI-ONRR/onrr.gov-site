(function(){"use strict";var e={9985:function(e,t,n){n.d(t,{qH:function(){return p},Qs:function(){return y},OI:function(){return O},Ig:function(){return L},xT:function(){return v},yk:function(){return Z},jI:function(){return P},M4:function(){return F},if:function(){return E},q9:function(){return x},id:function(){return f},tv:function(){return C},sI:function(){return h},KY:function(){return b},$S:function(){return g},eg:function(){return N},dw:function(){return I},um:function(){return T},KT:function(){return w},Yn:function(){return q},Nm:function(){return B},NH:function(){return S},cR:function(){return k}});var o=n(9989);const a=o.ZP`
  fragment contentBlocks on content_blocks {
    content
  }
`,r=o.ZP`
  fragment contentBlockFields on content_blocks {
    id
    block_label
    block_v_col
    block_content
    equal_col_height
  }
`,i=o.ZP`
  fragment layoutColumnBlockFields on layout_column_blocks {
    id
    layoutCol: block_v_col
  }
`,l=o.ZP`
  fragment cardBlockFields on card_blocks {
    id
    block_color
    block_label
    block_v_col
    block_icon
    block_content
    equal_col_height
    card_content_blocks {
      id
      item {
        ...contentBlockFields
      }
    }
  }
`,s=o.ZP`
  fragment tabBlockLabelFields on tab_block_label {
    id
    tab_block_label
  }
`,c=(o.ZP`
  fragment sectionHeadingBlocks on section_heading_blocks {
    section_heading
    section_heading_type
  }
`,o.ZP`
  fragment expansionPanelBlockLabel on expansion_panel_block_label {
    id
    block_label
  }
`),u=o.ZP`
  ${c}
  ${r}
  ${l}
  fragment expansionPanelBlockFields on expansion_panels {
    id
    block_label
    open_by_default {
      id
    }
    expansion_panel_blocks {
      id
      item {
        __typename
        ...expansionPanelBlockLabel
        ...contentBlockFields
        ...cardBlockFields
      }
    }
  }
`,d=o.ZP`
  ${s}
  ${r}
  ${l}
  ${u}
  ${i}
  fragment nestedNestedTabBlockFields on tab_blocks {
    id
    tab_blocks {
        id
        item {
          __typename
          ...tabBlockLabelFields
          ...contentBlockFields
          ...cardBlockFields
          ...expansionPanelBlockFields
          ...layoutColumnBlockFields
        }
    }
  }
`,A=o.ZP`
  ${s}
  ${r}
  ${l}
  ${d}
  ${i}
  fragment nestedTabBlockFields on tab_blocks {
    id
    tab_blocks {
        id
        item {
          __typename
          ...tabBlockLabelFields
          ...contentBlockFields
          ...cardBlockFields
          ...nestedNestedTabBlockFields
          ...expansionPanelBlockFields
          ...layoutColumnBlockFields
        }
    }
  }
`,m=o.ZP`
  ${s}
  ${r}
  ${l}
  ${A}
  ${u}
  ${i}
  fragment tabBlockFields on tab_blocks {
    id
    tab_blocks {
      id
      item {
        __typename
        ...tabBlockLabelFields
        ...contentBlockFields
        ...cardBlockFields
        ...nestedTabBlockFields
        ...expansionPanelBlockFields
        ...layoutColumnBlockFields
      }
    }
  }
`,_=o.ZP`
 ${r}
 ${m}
 ${l}
 ${u}
 ${i}
  fragment pageFields on pages {
    id
    title
    production
    slug
    hero_image {
      id
      description
    }
    hero_title
    page_blocks {
      id
      item {
        __typename
        ...contentBlockFields
        ...tabBlockFields
        ...cardBlockFields
        ...expansionPanelBlockFields
        ...layoutColumnBlockFields
      }
    }
    meta_title
    meta_description
  }
`,f=(o.ZP`
  ${a}
  fragment cardBlocks on card_blocks {
    card_title
    card_subtitle
    card_content_block {
      item {
        __typename
        ...contentBlocks
      }
    }
  }
`,o.ZP`
  fragment fileCollectionFields on reporter_letters {
    id
    title
    date
    file {
        id
    }
  }
`,o.ZP`query {
  menus {
    id
    custom_url
    link_to_page {
      id
      slug
      url
    }
    menu
    menu_children {
      pages_id {
        id
        title
        url
      }
    }
    menu_icon
    menu_label
  }
}`),p=o.ZP`query {
  announcements {
    id
    title 
    content
    status
  }
}`,b=o.ZP`
query {
  pages(limit: -1) {
    id
    slug
    title
    production
    url
    template
    parent {
      id
    }
  }
}`,g=(o.ZP`
query {
  redirects(limit: -1) {
    id
    old_url
    new_url
  }  
}
`,o.ZP`
query {
  pages(limit: -1 ) {
    id
    slug
    title
    url
  }
  redirects(limit: -1) {
    id
    old_url
    new_url
  }  
}
`),h=o.ZP`
${_}
query PagesById($ID: ID!) {
  pages_by_id (id: $ID) {
    ...pageFields
  }
}`,v=o.ZP`
${_}
query PagesById($ID: ID!) {
  pages_by_id (id: $ID) {
    ...pageFields
    sidebar_blocks
  }
}`,k=(o.ZP`
  query {
    files {
      id
      storage
      filename_disk
      title
      filesize
      location
      folder {
        id 
        name
      }
    }
    folders {
      id
      name
    }
  }
`,o.ZP`
  query {
    revenue_fiscal_years: period(
      distinct_on: fiscal_year, 
      where: {revenues: {revenue: {_is_null: false}, period: {period: {_eq: "Fiscal Year"}}}}, 
      order_by: {fiscal_year: asc}) {
        fiscal_year
    }

    disbursement_fiscal_years: period(
      distinct_on: fiscal_year, 
      where: {disbursements: {disbursement: {_is_null: false}, period: {period: {_eq: "Fiscal Year"}}}}, 
      order_by: {fiscal_year: asc}) {
        fiscal_year
    }
    total_yearly_fiscal_revenue(where: {year: {_eq: 2020}}) {
      sum
    }

    total_yearly_fiscal_disbursement(where: {year: {_eq: 2020}}) {
      sum
    }
    disbursement_gomesa: disbursement_source_summary(
      where: {fiscal_year: {_eq: "2020"}, source: {_eq: "GOMESA offshore"}, state_or_area: {_eq: "NF"}}, 
      order_by: {fiscal_year: asc, total: desc}
      ) {
      source
      sum: total
    }
  }
`),y=o.ZP`
  query {
    contacts(sort: ["header", "letter"], limit: -1) {
      id
      status
      page
      tab
      accordion
      company_yn
      letter
      header
      company_name
      operator_number
      agency
      primary_contact
      primary_role
      email
      phone
      fax
      contact_2
      role_2
      email_2
      phone_2
      contact_3
      role_3
      email_3
      phone_3
      contact_4
      role_4
      email_4
      phone_4
      contact_5
      role_5
      email_5
      phone_5
      contact_6
      role_6
      email_6
      phone_6
    }
  }   
`,C=o.ZP`
  query {
    NYMEX(limit: -1) {
      id
      status
      date
      average
      roll
      Spreadsheet {
        id,
        filename_download
      }
    }
  }
`,I=o.ZP`
  query {
    press_releases(limit: -1) {
      id
      title
      date
      file {
        id
        filename_download
        title
      }
      link
      excerpt
      status
    }
  }
`,w=o.ZP`
  query {
    reporter_letters(limit: -1) {
      id
      title
      date
      file {
        id
        filename_download
        title
        type
      }
      accessible_file {
        id
        filename_download
        title
        type
      }
      link
      status
      topics
    }
  }
`,B=o.ZP`
  query {
    rulemakings {
      id
      status
      final_publication_date
      rin
      rule_title
      informal_title
      commodity_subject_matter
      webpage_link
    }
  }
`,P=o.ZP`
  query {
    index_zones(sort: ["sort", "-date"], limit: -1) {
      id
      status
      date
      spreadsheet {
        id
        filename_download
        type
        title
      }
      index_zones
    }
  }
`,Z=o.ZP`
  query {
    ibmp(sort: ["sort", "-date"], limit: -1) {
      id
      status
      date
      spreadsheet {
          id
      }
      ibmp_line_items
    }
  }
`,F=o.ZP`
  query {
    indian_gas_major_portion(sort: ["sort", "-date"], limit: -1) {
      id
      status
      date
      spreadsheet {
        id
      }
      index_zones
    }
  }
`,E=o.ZP`
  query {
    Interest_Oil_and_Gas(sort: ["sort", "-sort"], limit: -1) {
      id
      sort
      status
      Period
      Indian_Late_and_Underpayments
      Federal_Late_and_Underpayments
      Federal_Overpayments
    }
  }
`,x=o.ZP`
  query {
    Interest_Solids(sort: ["sort", "-sort"], limit: -1) {
      id
      sort
      status
      Period
      Federal_and_Indian_Late_and_Underpayments
    }
  }
`,S=o.ZP`
  query {
    solid_minerals_handbook(limit: -1) {
      id
      status
      chapter
      section
      title
      actual_page
      toc_page
      url
    }
  }
`,T=o.ZP`
  query {
    production_handbook(limit: -1) {
      id
      status
      chapter
      section
      title
      actual_page
      toc_page
      url
    }
  }
`,q=o.ZP`
  query {
    revenue_handbook(limit: -1) {
      id
      status
      chapter
      section
      title
      actual_page
      toc_page
      url
    }
  }
`,O=o.ZP`
  query {
    geothermal_class_1(limit: -1) {
      id
      status
      chapter
      section
      title
      actual_page
      toc_page
      url
    }
  }
`,L=o.ZP`
  query {
    geothermal_class_2_3(limit: -1) {
      id
      status
      chapter
      section
      title
      actual_page
      toc_page
      url
    }
  }
`,N=o.ZP`
  query {
    plant_specific_ucas {
      id
      status
      transportation_system_or_gas_plant
      file {
        id
        filename_download
        type
        title
      }
      type
      operator
      location 
      doc_date
    }
  }
`},824:function(e,t,n){n.d(t,{l:function(){return Te}});var o=n(144),a=n(7356),r=(n(6699),n(8345)),i=n(9985);o.Z.use(r.Z);const l=[{path:"/",name:"Home",component:()=>n.e(268).then(n.bind(n,1776)),meta:{breadcrumb:"Home"},props:!0},{path:"/404",name:"PageNotFound",component:()=>n.e(892).then(n.bind(n,7290)),meta:{breadcrumb:"Page Not Found"}},{path:"/:slug",name:"TwoColumnLeft",component:()=>n.e(21).then(n.bind(n,1224)),props:!0,meta:{breadcrumb:""},children:[{path:"/",component:()=>n.e(439).then(n.bind(n,5028))},{path:":slug1",component:()=>n.e(439).then(n.bind(n,5028)),props:!0,meta:{breadcrumb:""},children:[{path:":slug2",component:()=>n.e(439).then(n.bind(n,5028)),props:!0,meta:{breadcrumb:""},children:[{path:":slug3",component:()=>n.e(439).then(n.bind(n,5028)),props:!0,meta:{breadcrumb:""},children:[{path:":slug4",component:()=>n.e(439).then(n.bind(n,5028)),props:!0,meta:{breadcrumb:""},children:[{path:":slug5",component:()=>n.e(439).then(n.bind(n,5028)),props:!0,meta:{breadcrumb:""}}]}]}]}]}]},{path:"/:catchAll(.*)",redirect:"/404"}],s=new r.Z({mode:"history",linkExactActiveClass:"nav-active-class",routes:l,scrollBehavior(e,t,n){return e.hash?{selector:e.hash,behavior:"smooth"}:n||void 0}});function c(e){return!!Object.keys(e.query).length}function u(){return Te.query({query:i.$S})}s.beforeEach((async(e,t,n)=>{const o=await u(),a=location.origin,r=location.pathname.toString(),i=decodeURI(r);let l,s,d;if(o&&(l=o.data.pages,s=o.data.redirects,d=s.find((e=>e.old_url===i))),d){const e=d.new_url.includes("?")?d.new_url.split("?")[0]:d.new_url.split("#")[0],t=l.find((t=>t.url===e)),n=e.includes(".")?e.split(".").pop():void 0;t?window.location.href=`${a}${d.new_url}`:n?(window.open(`${a}${d.new_url}`,"_blank","noopener noreferrer"),history.back()):location.href="/404"}else{const o=l.find((e=>e.url===r));o?!c(e)&&c(t)?n({name:e.name,query:t.query}):n():location.href="/404"}!c(e)&&c(t)?n({name:e.name,query:t.query}):n()}));var d=s,A=n(2489),m=n(6495),_=n(5543),f=n(4153),p=n(3300),b=n.n(p),g=n(443);o.Z.use(g.Z);var h=new g.Z({theme:{themes:{dark:{primary:"#121212",secondary:"#19642a9",anchor:"#0076a3"},light:{primary:{base:"#1a227e",lighten9:"#e8eaf5",lighten8:"#c5c9e8",lighten7:"#9ea7d8",lighten6:"#7885c8",lighten5:"#5b6abc",lighten4:"#3f50b1",lighten3:"#3948a7",lighten2:"#303e9b",lighten1:"#28348f",darken1:"#000051"},secondary:{base:"#0076a3",lighten8:"#e1f4f9",lighten7:"#b3e4f0",lighten6:"#83d2e7",lighten5:"#57c0de",lighten4:"#38b3da",lighten3:"#19a6d6",lighten2:"#0f98c9",lighten1:"#0086b6",darken1:"#005682"},anchor:"#0076a3",accent:"#534aae",black:"#000000",green:{base:"#097d4d",lighten1:"#4aad79",darken1:"#005024"},purple:{base:"#650d79",lighten1:"#960d79",lighten2:"#dfdcef",darken1:"#36004c"},yellow:{base:"#b6890f",lighten1:"#ecb947",darken1:"#825c10"},white:"#ffffff",neutrals:{base:"#262431",lighten1:"#484554",lighten2:"#ebebed",lighten3:"#fafafa"},expansionPanel:"#ebebed"}},options:{customProperties:!0}}}),v=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("v-app",[n("AppToolbar"),n("v-main",[n("router-view",{key:e.$route.path})],1),n("Footer")],1)},k=[],y=function(){var e=this,t=e.$createElement,o=e._self._c||t;return o("div",[o("v-system-bar",{staticClass:"system-bar",class:{"hidden-system-bar":!e.showSystemBar},attrs:{app:"",height:"30"}},[o("div",{staticClass:"banner-wrap"},[o("v-img",{staticClass:"shrink mr-2",attrs:{alt:"U.S. Flag",contain:"",src:n(7838),transition:"scale-transition",width:"20"}}),e._v(" An official website of the U.S. government ")],1)]),o("v-app-bar",{staticClass:"v-app-bar-wrap",class:{"hidden-system-bar":!e.showSystemBar},attrs:{app:"",color:"primary darken-1",dark:"",height:e.showSystemBar?"80px":"60px"},scopedSlots:e._u([e.isMobile?null:{key:"extension",fn:function(){return[o("div",{staticClass:"d-none d-lg-block"},[o("MainMenu")],1)]},proxy:!0}],null,!0)},[o("div",{staticClass:"d-flex logo"},[o("router-link",{attrs:{to:"/"}},[o("v-img",{staticClass:"logo shrink mr-2",attrs:{alt:"Office of Natural Resources and Revenue (ONRR) Logo",contain:"",src:n(9271),transition:"scale-transition"}})],1),o("router-link",{attrs:{to:"/"}},[o("v-toolbar-title",[o("div",{staticClass:"logo-content"},[o("span",[e._v("U.S. Department of the Interior")]),o("span",[e._v("Office of Natural")]),o("span",[e._v("Resources Revenue (ONRR)")])])])],1)],1),o("v-spacer"),o("HeaderMenu"),o("div",{staticClass:"d-lg-none"},[o("v-app-bar-nav-icon",{on:{click:function(t){t.stopPropagation(),e.drawer=!e.drawer}}})],1)],1),o("v-navigation-drawer",{attrs:{app:"",temporary:"",right:"",dark:""},model:{value:e.drawer,callback:function(t){e.drawer=t},expression:"drawer"}},[o("v-list",{attrs:{dense:""}},[o("v-subheader",[e._v("Menu")]),o("v-list-item-group",[o("v-list-item",{attrs:{to:"/"}},[o("v-list-item-title",[e._v("Home")])],1),e._l(e.menuItems,(function(t){return o("v-list-item",{key:t.id,attrs:{to:""+(t.custom_url||t.link_to_page.url)}},[o("v-list-item-title",{domProps:{textContent:e._s(t.menu_label)}})],1)}))],2)],1),o("hr"),o("v-list",{attrs:{dense:""}},[o("v-list-item-group",[o("v-list-item",{attrs:{to:"/search-results"}},[o("v-list-item-icon",[o("v-icon",[e._v("mdi-magnify")])],1),o("v-list-item-title",[e._v("Search")])],1),e._l(e.utilityItems,(function(t){return o("v-list-item",{key:t.id,attrs:{to:""+(t.custom_url||t.link_to_page.url)}},[o("v-list-item-icon",[o("v-icon",{domProps:{textContent:e._s(t.menu_icon)}})],1),o("v-list-item-title",{domProps:{textContent:e._s(t.menu_label)}})],1)}))],2)],1)],1),o("v-btn",{directives:[{name:"scroll",rawName:"v-scroll",value:e.onScroll,expression:"onScroll"},{name:"show",rawName:"v-show",value:e.fab,expression:"fab"}],attrs:{color:"primary",dark:"",fab:"",fixed:"",bottom:"",left:"",elevation:"2"},on:{click:e.toTop}},[o("v-icon",{attrs:{color:"white"}},[e._v("mdi-chevron-up")])],1)],1)},C=[],I=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"d-none d-lg-block header-menu"},[e._l(e.menuItems,(function(t){return n("v-btn",{key:t.id,staticClass:"no-btn-hover",attrs:{to:t.link_to_page&&t.link_to_page.url,href:t.custom_url&&t.custom_url,text:"",dark:"",target:t.custom_url&&t.custom_url?"_blank":"_self"}},["Revenue Data"===t.menu_label?n("span",{staticClass:"v-btn__content-btn"},[n("v-btn",{staticClass:"mb-1",attrs:{color:"primary"}},[t.menu_icon?n("v-icon",{staticClass:"mr-1",attrs:{color:"white"}},[e._v(e._s(t.menu_icon))]):e._e(),t.menu_label?n("span",{staticClass:"mr-2"},[e._v(e._s(t.menu_label))]):e._e()],1)],1):n("span",{staticClass:"v-btn__content"},[t.menu_icon?n("v-icon",{staticClass:"mr-1",attrs:{color:"white"}},[e._v(e._s(t.menu_icon))]):e._e(),t.menu_label?n("span",{staticClass:"mr-2"},[e._v(e._s(t.menu_label))]):e._e()],1)])})),"localhost"===e.hostname||"192.168.0.22"===e.hostname?n("v-btn",{attrs:{plain:""}},[n("v-switch",{attrs:{flat:"",color:"anchor",label:""},model:{value:e.themeSwitch,callback:function(t){e.themeSwitch=t},expression:"themeSwitch"}})],1):e._e()],2)},w=[],B={name:"HeaderMenu",data(){return{hostname:location.hostname,menus:[],themeSwitch:!1}},apollo:{menus:{query:i.id,loadingKey:"loading..."}},computed:{menuItems(){return this.menus.filter((e=>"header"===e.menu))}},watch:{themeSwitch(){this.$vuetify.theme.dark=!this.$vuetify.theme.dark}}},P=B,Z=n(1001),F=n(3453),E=n.n(F),x=n(2774),S=n(9639),T=n(9342),q=(0,Z.Z)(P,I,w,!1,null,"f7253402",null),O=q.exports;E()(q,{VBtn:x.Z,VIcon:S.Z,VSwitch:T.Z});var L=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[e.$apollo.loading?n("label",{attrs:{text:""}}):n("nav",{staticClass:"primary",attrs:{id:"main-menu"}},[n("ul",[e._l(e.menuItems,(function(t){return n("li",{key:t.id},[n("v-menu",{attrs:{"open-on-hover":"","offset-y":""},scopedSlots:e._u([{key:"activator",fn:function(o){var a=o.on,r=o.attrs;return[n("v-btn",e._g(e._b({staticClass:"menu-btn",attrs:{color:"white",text:"",dark:""}},"v-btn",r,!1),a),[n("v-list-item-content",[n("v-list-item-title",{attrs:{id:r["aria-labelledby"]},domProps:{textContent:e._s(t.menu_label)}})],1)],1)]}}],null,!0)},[n("v-list",[n("v-list-item",{staticClass:"menu-btn",attrs:{to:t.link_to_page.url}},[e._v(" "+e._s(t.menu_label+" Home")+" ")]),e._l(t.menu_children,(function(t,o){return n("v-list-item",{key:o,staticClass:"menu-btn",attrs:{link:"",to:""+t.pages_id.url}},[e._v(" "+e._s(t.pages_id.title)+" ")])}))],2)],1)],1)})),n("li",[n("form",{attrs:{id:"search_form",action:"https://search.usa.gov/search","accept-charset":"UTF-8",method:"get"}},[n("input",{attrs:{type:"hidden",name:"affiliate",id:"affiliate",value:"onrr.gov",autocomplete:"off"}}),n("v-text-field",{staticClass:"search-input",attrs:{"solo-inverted":"",name:"query",dense:"",label:"Search","prepend-inner-icon":"mdi-magnify"}})],1)])],2)])])},N=[],V={name:"MainMenu",data(){return{menus:[],cItems:[]}},apollo:{menus:{query:i.id,loadingKey:"loading..."}},methods:{onClick:function(e){e&&console.debug(`You clicked ${e}`)},childItems(e){this.cItems=this.menus&&this.menus.filter((t=>t.id===e))[0].menu_children}},computed:{menuItems(){return this.menus.filter((e=>"main"===e.menu))}}},Q=V,$=n(1317),R=n(5243),H=n(1033),M=n(3346),j=n(4690),U=(0,Z.Z)(Q,L,N,!1,null,"2bc94b3c",null),G=U.exports;E()(U,{VBtn:x.Z,VList:$.Z,VListItem:R.Z,VListItemContent:H.km,VListItemTitle:H.V9,VMenu:M.Z,VTextField:j.Z});const K=30,z=150;var X={name:"AppToolbar",data(){return{showSystemBar:!0,lastScrollPosition:0,scrollValue:0,drawer:!1,group:null,isMobile:!1,fab:!1,menus:[]}},apollo:{menus:{query:i.id,loadingKey:"loading..."}},components:{HeaderMenu:O,MainMenu:G},beforeDestroy(){window.removeEventListener("scroll",this.onScroll),"undefined"!==typeof window&&window.removeEventListener("resize",this.onResize,{passive:!0})},mounted(){this.lastScrollPosition=window.pageYOffset,window.addEventListener("scroll",this.onScroll);const e=document.createElement("meta");e.name="viewport",e.content="width=device-width, initial-scale=1",document.head.appendChild(e),this.onResize(),window.addEventListener("resize",this.onResize,{passive:!0})},watch:{group(){this.drawer=!1}},methods:{toggleTheme(){this.$vuetify.theme.dark=!this.$vuetify.theme.dark},onScroll(e){if("undefined"===typeof window)return;const t=window.pageYOffset||e.target.scrollTop||0;this.fab=t>z,window.pageYOffset<0||Math.abs(window.pageYOffset-this.lastScrollPosition)<K||(this.showSystemBar=window.pageYOffset<this.lastScrollPosition,this.lastScrollPosition=window.pageYOffset)},toTop(){this.$vuetify.goTo(0)},onResize(){this.isMobile=window.innerWidth<1264}},computed:{menuItems(){return this.menus.filter((e=>"main"===e.menu))},utilityItems(){return this.menus.filter((e=>"header"===e.menu))},height(){switch(this.$vuetify.breakpoint.name){case"lg":return 50;default:return 50}}}},D=X,W=n(4977),Y=n(4549),J=n(9253),ee=n(4674),te=n(9565),ne=n(8151),oe=n(1453),ae=n(5042),re=n(4078),ie=n(3201),le=n(6392),se=n.n(le),ce=n(1638),ue=(0,Z.Z)(D,y,C,!1,null,"098c1111",null),de=ue.exports;E()(ue,{VAppBar:W.Z,VAppBarNavIcon:Y.Z,VBtn:x.Z,VIcon:S.Z,VImg:J.Z,VList:$.Z,VListItem:R.Z,VListItemGroup:ee.Z,VListItemIcon:te.Z,VListItemTitle:H.V9,VNavigationDrawer:ne.Z,VSpacer:oe.Z,VSubheader:ae.Z,VSystemBar:re.Z,VToolbarTitle:ie.qW}),se()(ue,{Scroll:ce.Z});var Ae=function(){var e=this,t=e.$createElement,o=e._self._c||t;return o("v-footer",{staticClass:"footer",attrs:{padless:""}},[o("v-toolbar",{staticClass:"top",attrs:{tag:"div",dense:"",elevation:"0"}},[o("v-toolbar-items",e._l(e.menuItemsTop,(function(t){return o("v-btn",{key:t.id,attrs:{to:t.link_to_page&&t.link_to_page.url,href:t.custom_url&&t.custom_url,target:t.custom_url?"_blank":"_self",plain:"",color:"white"}},[e._v(" "+e._s(t.menu_label)+" ")])})),1)],1),o("v-toolbar",{staticClass:"bottom",attrs:{dense:"",elevation:"0",tag:"div"}},[o("v-toolbar-items",e._l(e.menuItemsBottom,(function(t){return o("v-btn",{key:t.id,attrs:{to:t.link_to_page&&t.link_to_page.url,href:t.custom_url&&t.custom_url,target:t.custom_url?"_blank":"_self",plain:"",color:"white"}},[e._v(" "+e._s(t.menu_label)+" ")])})),1)],1),o("v-toolbar",{staticClass:"abs-bottom",attrs:{tag:"div",height:"120px",elevation:"0"}},[o("v-toolbar-title",[o("div",{staticClass:"footer-logo-wrap"},[o("router-link",{attrs:{to:"/"}},[o("v-img",{staticClass:"shrink mr-2",attrs:{alt:"ONNR Logo",contain:"",src:n(9271),transition:"scale-transition",width:"70"}})],1),o("router-link",{attrs:{to:"/"}},[o("div",{staticClass:"logo-content"},[o("span",[e._v("U.S. Department of the Interior")]),o("span",[e._v("Office of Natural")]),o("span",[e._v("Resources Revenue (ONRR)")])])])],1)]),o("v-spacer"),o("v-toolbar-items",{staticClass:"social-menu"},e._l(e.socialMenuItems,(function(t){return o("v-btn",{key:t.id,staticClass:"no-btn-hover",attrs:{to:t.link_to_page&&t.link_to_page.url,href:t.custom_url&&t.custom_url,text:"",dark:"",target:t.custom_url?"_blank":"_self"}},[o("span",{staticClass:"v-btn__content"},[t.menu_icon?o("v-icon",{attrs:{color:"white"}},[e._v(e._s(t.menu_icon))]):e._e(),"Contact Us"===t.menu_label?o("span",{staticClass:"mr-2",staticStyle:{color:"white"}},[e._v(e._s(t.menu_label))]):e._e()],1)])})),1)],1)],1)},me=[],_e={name:"FooterNav",data(){return{menus:[]}},apollo:{menus:{query:i.id,loadingKey:"loading..."}},computed:{menuItemsTop:function(){const e=this.menus.filter((e=>"footer"===e.menu));return e.filter(((e,t)=>t<5))},menuItemsBottom:function(){const e=this.menus.filter((e=>"footer"===e.menu));return e.filter(((e,t)=>t>4))},socialMenuItems:function(){return this.menus.filter((e=>"social"===e.menu))}}},fe=_e,pe=n(2022),be=n(5666),ge=(0,Z.Z)(fe,Ae,me,!1,null,"134e8c9e",null),he=ge.exports;E()(ge,{VBtn:x.Z,VFooter:pe.Z,VIcon:S.Z,VImg:J.Z,VSpacer:oe.Z,VToolbar:be.Z,VToolbarItems:ie.lj,VToolbarTitle:ie.qW});var ve={name:"App",metaInfo(){return{title:"Office of Natural Resources Revenue",titleTemplate:"%s | Office of Natual Resources Revenue",meta:[{property:"og:site_name",content:"Office of Natural Resources Revenue"},{property:"og:type",content:"website"},{name:"robots",content:"index,follow"}]}},components:{AppToolbar:de,Footer:he},data:()=>({}),created(){}},ke=ve,ye=n(4819),Ce=n(213),Ie=(0,Z.Z)(ke,v,k,!1,null,null,null),we=Ie.exports;E()(Ie,{VApp:ye.Z,VMain:Ce.Z});var Be=JSON.parse('{"card_blocks_card_content_blocks_item_union":["content_blocks"],"expansion_panels_expansion_panel_blocks_item_union":["card_blocks","content_blocks","expansion_panel_block_label"],"pages_page_blocks_item_union":["content_blocks","tab_blocks","card_blocks","expansion_panels","layout_column_blocks"],"tab_blocks_tab_blocks_item_union":["card_blocks","content_blocks","tab_blocks","tab_block_label","expansion_panels","layout_column_blocks"]}'),Pe=n(5527),Ze=n.n(Pe);const Fe=new m.h({possibleTypes:Be}),Ee=(0,_.L)({uri:"https://preview-onrr-frontend.app.cloud.gov/graphql"}),xe=(0,_.L)({uri:"https://preview-onrr-frontend.app.cloud.gov/graphql/system"}),Se=(0,_.L)({uri:"https://hasura-dev.app.cloud.gov/v1/graphql"}),Te=new f.f({fetch:b(),link:Ee,cache:Fe,resolvers:{}}),qe=new f.f({fetch:b(),link:xe,cache:Fe,resolvers:{}}),Oe=new f.f({fetch:b(),link:Se,cache:Fe,resolvers:{}}),Le=new A.ZP({defaultClient:Te,clients:{a:qe,b:Oe}});o.Z.config.productionTip=!1,o.Z.use(A.ZP),o.Z.use(a.Z),o.Z.use(Ze(),{id:"UA-33523145-1",router:d}),new o.Z({vuetify:h,apolloProvider:Le,router:d,render:e=>e(we)}).$mount("#app")},7838:function(e){e.exports="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAEBCAYAAABWhfMqAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABolJREFUeNrs2L9rlVcYwPFzwrWaQq6lgWIqBByEEKU4GGr6ay3tJiWD3WI79C9wLHGrLWTVResuIYv9CyoodHBSK8HJ6FZCU4iF4j2977V2ckgkz+G9r58P3He8h+c973m/yU0JAF5Dbi4zJ2+W6IUmJnL8NIPSiU0ZVNj03IU5ch5+Ytf4dnItfXNoLXSN5+XFZ/xfJvFDlApPbs4V5ig5dcGEhgIgIAAICAACAoCAAICAACAgAAgIAAICgIAAgIAAICAACAgAAgKAgACAgAAgIAAICAACAoCAAICAACAgALRCr1ZFblw9E77G0vLt0O8/MddPKxfmQ9e493A7rVy6H7rG/HCOizXm+OlB7IaX5lNCl3j786/Te2eX48foyAslp/gtN0fLAlLD4ul3x/5m9acOpMWF6bGf43CNOXKuM0zwSewdmU0HTx33pya8gp+wABAQAAQEAAEBQEAAQEAAEBAABAQAAQFAQABAQAAQEAAEBAABAUBAAEBAABAQAAQEAAEBQEAAQEAA2He9WgutXt6IXyTn0K/ffPosfI7NJzvht6lZo8ocJXqS8AXS33dvpa3r68FjlCqz0DJ57I/HixGOnrzZjad3IsevMXDQ3yTLk+ujT/RJL2VQ4V1VgqfIHphd/60b/x4pJX4//IQFgIAAICAACAgAAgIAAgKAgAAgIAAICAACAgACAoCAACAgAAgIAAICAAICgIAAICAACAgAAgIAAgLAvuuNrrnCSiV+icXT06Hfv/3XP+negz9D1+hPHUgn5vrxc/y+PfZzbD59lh4/3Yk9IEdm0+Sxj4OPRqlyQHLwGqXKi6Qr4u9Wjf34LyDxCw1K/AG5cfXD0O+//dsfaen8ndA1mpfujWtnwuf4KniO+QpzrF7ZSKuXN0LXmPryXJr57nvvO3gFP2EBICAACAgAAgKAgACAgAAgIAAICAACAoCAAICAACAgAAgIAAICgIAAgIAAICAACAgAAgKAgACAgAAgIAC0Q24uRz/4pUQvNBiEL9GZGg4qbHqu8WTl4FWaR6rEPlfLk+ujT/iOl/hdjz6BOZdOnL9Swk9Hhd1ojkf8HP4DAUBAABAQAAQEAAEBAAEBQEAAEBAABAQAAQEAAQFAQAAQEAAEBAABAQABAUBAABAQAAQEAAEBAAEBQEAAaIfe6FpK+EJr186Er7F0/k7o95+Y66eVC/Oha9x7uJ1WLt0PXWN+OMfFGnP8eD94x/PwT6AcusLUF+fS+2eXg+eIP3/xK/y/I2OvK/eqxhy9WistLkyP/YPVnzrQiTkO15qjjPkJbA7IzGw6dOq4PzXhFfyEBYCAACAgAAgIAAICAAICgIAAICAACAgAAgIAAgKAgAAgIAAICAACAgACAoCAACAgAAgIAAICAAICwL7rNZdSYaHVyxvha0TP8fjJTvgczRpdmGNzuEaqsOOl5NAVnt29lbaur433g/tSTt2Yg9YYPVIzJ2+Gb32Nf3UGFW5WNkdrlArvrPOTa6NP9I6U4EFyjn/DR8ec9vETFgACAoCAACAgAAgIAAgIAAICgIAAICAACAgACAgAAgKAgAAgIAAICAAICAACAoCAACAgAAgIAAgIAPuu11w+WpgOXyhXGKZUWMMc7VHjPh07OJcm3/okeI46u5GD71jpxFPFnt8jZcitAGAv/IQFgIAAICAACAgAAgIAAgKAgAAgIAAICAACAgACAoCAACAgAAgIAAICAAICgIAAICAACAgAAgIAAgKAgADQDr3m8uizd9yJXckp5+jmluHnefgkpWTb2ZanKr/c99hnt5ToOYrn9g27V/4DAUBAABAQAAQEAAEBAAEBQEAAEBAABAQAAQEAAQFAQAAQEAAEBAABAQABAUBAABAQAAQEAAEBAAEBQEAAaIfcXHbu/lrcit3esFxhlTLG385rH8QO7HlX5nCv9jBDGXKEAdgLP2EBICAACAgAAgKAgACAgAAgIAAICAACAoCAAICAACAgAAgIAAICgIAAgIAAICAACAgAAgKAgACAgACw73rNZevnH7oxTQ7+/lJrjuCul1JxGHu+qyFytudvlBp7Pqhz/B592g9/skr4SW/2I/6AlJLDtyRHB6R5kZTn4tGWiIz2O37PS4UXCrt9V02EP8Clwhn3ExYAAgKAgAAgIAAICAAICAACAoCAACAgAAgIAAgIAAICgIAAICAACAgACAgAAgKAgAAgIAAICAAICAACAkA7/CvAAGI1JmFxxmizAAAAAElFTkSuQmCC"},9271:function(e,t,n){e.exports=n.p+"img/ONRR-mark-200x200.9b6d4ee1.png"}},t={};function n(o){var a=t[o];if(void 0!==a)return a.exports;var r=t[o]={exports:{}};return e[o].call(r.exports,r,r.exports,n),r.exports}n.m=e,function(){var e=[];n.O=function(t,o,a,r){if(!o){var i=1/0;for(u=0;u<e.length;u++){o=e[u][0],a=e[u][1],r=e[u][2];for(var l=!0,s=0;s<o.length;s++)(!1&r||i>=r)&&Object.keys(n.O).every((function(e){return n.O[e](o[s])}))?o.splice(s--,1):(l=!1,r<i&&(i=r));if(l){e.splice(u--,1);var c=a();void 0!==c&&(t=c)}}return t}r=r||0;for(var u=e.length;u>0&&e[u-1][2]>r;u--)e[u]=e[u-1];e[u]=[o,a,r]}}(),function(){n.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return n.d(t,{a:t}),t}}(),function(){n.d=function(e,t){for(var o in t)n.o(t,o)&&!n.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})}}(),function(){n.f={},n.e=function(e){return Promise.all(Object.keys(n.f).reduce((function(t,o){return n.f[o](e,t),t}),[]))}}(),function(){n.u=function(e){return"js/"+({0:"PlantSpecificUCAsCollection",21:"TwoColumnLeft",51:"SideMenu",62:"NYMEXCollection",124:"AnnouncementsCollection",156:"Breadcrumbs",167:"CompaniesCollection",169:"HorizontalRuleBlock",184:"TabsBlock",188:"InterestOilGas",229:"TableBlock",248:"SelectField",266:"ExpansionPanelBlock",268:"Home",315:"Contacts",345:"CodeBlock",364:"CollectionFilterToolbar",409:"ContentBlock",429:"ListBlock",439:"Page",441:"ImageBlock",486:"MultipleSelectField",495:"EventsCollection",496:"LayoutBlock",505:"CollectionBlock",520:"Rulemakings",567:"IndexZones",669:"EditorBlock",674:"CardBlock",675:"ContactsSearch",707:"TextField",738:"TextBlock",758:"IndianGasMajorPortion",793:"ReporterLettersCollection",795:"HeroImage",824:"CustomBlock",883:"IBMPCollection",892:"PageNotFound",911:"InterestSolids",943:"ContactsSearchResults",952:"SolidMineralsReporterHandbook"}[e]||e)+"."+{0:"ae550228",21:"80655b2a",51:"437016e1",58:"46384ba6",62:"84cc20f1",124:"8bf9f312",156:"3761fa29",167:"45a23e53",169:"19aacebe",174:"ec5447fe",184:"36b07c9a",188:"344ccde3",229:"3223a3cf",248:"347f410b",266:"fd2f0e32",268:"b8af600b",315:"78718ac7",345:"1115be4d",354:"ea20dbb8",364:"315deed6",409:"67217704",429:"941d125a",439:"a9d30fbe",441:"9fc31d32",486:"7f2cb53c",495:"268e2872",496:"c59e5290",505:"2de96972",520:"75e9d71d",567:"b6cf2f2d",669:"b6dbf8c6",674:"74bce7ec",675:"bc64ac45",707:"640720ec",738:"8c9af0f2",758:"77b643c8",793:"19dba06c",795:"ad80d855",824:"883afda0",860:"92573c23",883:"7b499e2a",892:"3867671e",911:"16a2ab5a",943:"b7995a4c",952:"4d49570c"}[e]+".js"}}(),function(){n.miniCssF=function(e){return"css/"+({0:"PlantSpecificUCAsCollection",21:"TwoColumnLeft",51:"SideMenu",62:"NYMEXCollection",124:"AnnouncementsCollection",156:"Breadcrumbs",184:"TabsBlock",229:"TableBlock",248:"SelectField",266:"ExpansionPanelBlock",268:"Home",315:"Contacts",409:"ContentBlock",439:"Page",441:"ImageBlock",496:"LayoutBlock",520:"Rulemakings",567:"IndexZones",669:"EditorBlock",674:"CardBlock",675:"ContactsSearch",738:"TextBlock",758:"IndianGasMajorPortion",793:"ReporterLettersCollection",795:"HeroImage",883:"IBMPCollection",892:"PageNotFound",952:"SolidMineralsReporterHandbook"}[e]||e)+"."+{0:"1ecf3cab",21:"fe4c5b97",51:"25fb7f6b",58:"b6d454c9",62:"1ecf3cab",124:"9abd241d",156:"79a7979b",174:"cddf072f",184:"a194c0dc",229:"f2282e42",248:"0b5718b4",266:"1f4466ac",268:"d5ab0c93",315:"1be6e4f5",354:"12f2cce6",409:"a61247d1",439:"d551d3b3",441:"7e912d80",496:"c7f410d8",520:"1ecf3cab",567:"1ecf3cab",669:"e8e8d45b",674:"9bfb981b",675:"00a0b468",738:"4fd666bc",758:"1ecf3cab",793:"9b9aec51",795:"0c7d6d63",883:"1ecf3cab",892:"db148cb4",952:"1ecf3cab"}[e]+".css"}}(),function(){n.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()}(),function(){n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)}}(),function(){var e={},t="onrr-frontend-app-vue:";n.l=function(o,a,r,i){if(e[o])e[o].push(a);else{var l,s;if(void 0!==r)for(var c=document.getElementsByTagName("script"),u=0;u<c.length;u++){var d=c[u];if(d.getAttribute("src")==o||d.getAttribute("data-webpack")==t+r){l=d;break}}l||(s=!0,l=document.createElement("script"),l.charset="utf-8",l.timeout=120,n.nc&&l.setAttribute("nonce",n.nc),l.setAttribute("data-webpack",t+r),l.src=o),e[o]=[a];var A=function(t,n){l.onerror=l.onload=null,clearTimeout(m);var a=e[o];if(delete e[o],l.parentNode&&l.parentNode.removeChild(l),a&&a.forEach((function(e){return e(n)})),t)return t(n)},m=setTimeout(A.bind(null,void 0,{type:"timeout",target:l}),12e4);l.onerror=A.bind(null,l.onerror),l.onload=A.bind(null,l.onload),s&&document.head.appendChild(l)}}}(),function(){n.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}}(),function(){n.p="/"}(),function(){var e=function(e,t,n,o){var a=document.createElement("link");a.rel="stylesheet",a.type="text/css";var r=function(r){if(a.onerror=a.onload=null,"load"===r.type)n();else{var i=r&&("load"===r.type?"missing":r.type),l=r&&r.target&&r.target.href||t,s=new Error("Loading CSS chunk "+e+" failed.\n("+l+")");s.code="CSS_CHUNK_LOAD_FAILED",s.type=i,s.request=l,a.parentNode.removeChild(a),o(s)}};return a.onerror=a.onload=r,a.href=t,document.head.appendChild(a),a},t=function(e,t){for(var n=document.getElementsByTagName("link"),o=0;o<n.length;o++){var a=n[o],r=a.getAttribute("data-href")||a.getAttribute("href");if("stylesheet"===a.rel&&(r===e||r===t))return a}var i=document.getElementsByTagName("style");for(o=0;o<i.length;o++){a=i[o],r=a.getAttribute("data-href");if(r===e||r===t)return a}},o=function(o){return new Promise((function(a,r){var i=n.miniCssF(o),l=n.p+i;if(t(i,l))return a();e(o,l,a,r)}))},a={143:0};n.f.miniCss=function(e,t){var n={0:1,21:1,51:1,58:1,62:1,124:1,156:1,174:1,184:1,229:1,248:1,266:1,268:1,315:1,354:1,409:1,439:1,441:1,496:1,520:1,567:1,669:1,674:1,675:1,738:1,758:1,793:1,795:1,883:1,892:1,952:1};a[e]?t.push(a[e]):0!==a[e]&&n[e]&&t.push(a[e]=o(e).then((function(){a[e]=0}),(function(t){throw delete a[e],t})))}}(),function(){var e={143:0};n.f.j=function(t,o){var a=n.o(e,t)?e[t]:void 0;if(0!==a)if(a)o.push(a[2]);else{var r=new Promise((function(n,o){a=e[t]=[n,o]}));o.push(a[2]=r);var i=n.p+n.u(t),l=new Error,s=function(o){if(n.o(e,t)&&(a=e[t],0!==a&&(e[t]=void 0),a)){var r=o&&("load"===o.type?"missing":o.type),i=o&&o.target&&o.target.src;l.message="Loading chunk "+t+" failed.\n("+r+": "+i+")",l.name="ChunkLoadError",l.type=r,l.request=i,a[1](l)}};n.l(i,s,"chunk-"+t,t)}},n.O.j=function(t){return 0===e[t]};var t=function(t,o){var a,r,i=o[0],l=o[1],s=o[2],c=0;if(i.some((function(t){return 0!==e[t]}))){for(a in l)n.o(l,a)&&(n.m[a]=l[a]);if(s)var u=s(n)}for(t&&t(o);c<i.length;c++)r=i[c],n.o(e,r)&&e[r]&&e[r][0](),e[r]=0;return n.O(u)},o=self["webpackChunkonrr_frontend_app_vue"]=self["webpackChunkonrr_frontend_app_vue"]||[];o.forEach(t.bind(null,0)),o.push=t.bind(null,o.push.bind(o))}();var o=n.O(void 0,[998],(function(){return n(824)}));o=n.O(o)})();
//# sourceMappingURL=app.c048e74f.js.map