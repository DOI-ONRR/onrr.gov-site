(self["webpackChunkonrr_frontend_app_vue"]=self["webpackChunkonrr_frontend_app_vue"]||[]).push([[184],{2420:function(t,e,i){var n=i(2109),s=i(4310);n({target:"Math",stat:!0},{sign:s})},546:function(t,e,i){"use strict";var n=i(2774);e["Z"]=n.Z},9391:function(t,e,i){"use strict";i.d(e,{Z:function(){return l}});var n=i(4254),s=(i(9653),i(4944),i(3792),i(2238)),r=i(2413),o=i(8084),a=i(3553),l=(0,a.Z)(r.Z,o.Z,s.Z).extend({name:"v-card",props:{flat:Boolean,hover:Boolean,img:String,link:Boolean,loaderHeight:{type:[Number,String],default:4},raised:Boolean},computed:{classes:function(){return(0,n.Z)((0,n.Z)({"v-card":!0},o.Z.options.computed.classes.call(this)),{},{"v-card--flat":this.flat,"v-card--hover":this.hover,"v-card--link":this.isClickable,"v-card--loading":this.loading,"v-card--disabled":this.disabled,"v-card--raised":this.raised},s.Z.options.computed.classes.call(this))},styles:function(){var t=(0,n.Z)({},s.Z.options.computed.styles.call(this));return this.img&&(t.background='url("'.concat(this.img,'") center center / cover no-repeat')),t}},methods:{genProgress:function(){var t=r.Z.options.methods.genProgress.call(this);return t?this.$createElement("div",{staticClass:"v-card__progress",key:"progress"},[t]):null}},render:function(t){var e=this.generateRouteLink(),i=e.tag,n=e.data;return n.style=this.styles,this.isClickable&&(n.attrs=n.attrs||{},n.attrs.tabindex=0),t(i,this.setBackgroundColor(this.color,n),[this.genProgress(),this.$slots.default])}})},306:function(t,e,i){"use strict";i.d(e,{EB:function(){return l},Qq:function(){return o},ZB:function(){return a}});var n=i(9391),s=i(5598),r=(0,s.Ji)("v-card__actions"),o=(0,s.Ji)("v-card__subtitle"),a=(0,s.Ji)("v-card__text"),l=(0,s.Ji)("v-card__title");n.Z},2478:function(t,e,i){"use strict";i.d(e,{P:function(){return r},h:function(){return s}});var n=i(144),s=n.Z.observable({collections:{searchQuery:"",year:(new Date).getFullYear(),queryParams:{}},queryParams:{tabs:[],panel:""}}),r={updateCollections:function(t,e){console.log("updateCollectionsSearchQuery --------\x3e ",e),s.collections[t]=e},updateQueryParams:function(t,e){console.log("updateQueryParams --------\x3e ",e),s.queryParams[t]=e}}},5751:function(t,e,i){"use strict";i.r(e),i.d(e,{default:function(){return Q}});var n=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"v-tabs__wrap"},[i("v-tabs",{attrs:{dark:"",color:"white","background-color":"white","show-arrows":""},on:{change:function(e){return t.getSelectedTabs(e)},input:function(e){return t.onTabUpdate()}},model:{value:t.tab,callback:function(e){t.tab=e},expression:"tab"}},t._l(t.tabItems,(function(e,n){return i("v-tab",{key:n,ref:"tab_label_"+t.formattedLabel(e.item.tab_block_label),refInFor:!0,attrs:{href:"#"+t.formattedLabel(e.item.tab_block_label),transition:!1},on:{click:function(e){return t.handleClick()}}},[i("span",{domProps:{innerHTML:t._s(e.item.tab_block_label)}})])})),1),i("v-tabs-items",{key:t.componentKey,model:{value:t.tab,callback:function(e){t.tab=e},expression:"tab"}},t._l(t.tabItems,(function(e,n){return i("v-tab-item",{key:n,attrs:{value:t.formattedLabel(e.item.tab_block_label),transition:"fade-transition"}},[i("v-card",{attrs:{text:"",elevation:"0"}},[i("v-card-text",{staticClass:"pl-1 pr-1 pt-4 pb-4 text-body-1 tab-content",staticStyle:{"white-space":"pre-line"}},[i("LayoutBlock",{attrs:{layoutBlocks:e.tabBlocks}})],1)],1)],1)})),1)],1)},s=[],r=i(4254),o=(i(1539),i(8783),i(3948),i(1249),i(1038),i(9714),i(4747),i(4916),i(3123),i(2478),i(8930)),a=i(5183),l=function(){return Promise.all([i.e(343),i.e(496)]).then(i.bind(i,1058))},c={mixins:[a.jH,a.hN],name:"TabsBlock",data:function(){return{model:"",tab:"",nestedTab:"",componentKey:0}},props:{block:[Array,Object]},components:{LayoutBlock:l},methods:{getSelectedTabs:function(){var t=this;setTimeout((function(){var e=document.querySelectorAll(".v-tabs .v-tab--active"),i=document.querySelectorAll(".v-tabs-items .v-window-item--active .v-tab--active"),n=Array.from(e).map((function(e){return t.formattedLabel(e.innerText)}))[0],s=Array.from(i).map((function(e){return t.formattedLabel(e.innerText)}))[0],o=s?[n,s].toString():n;console.log("getSelectedTabs selectedTabs, selectedNestedTabs: ",e,i);var a=(0,r.Z)((0,r.Z)({path:t.$route.fullPath},t.$route.query),{},{query:{tabs:o}});t.$router.push(a).catch((function(){}))}),0)},onTabUpdate:function(t){this.$emit("tab yo!",t)},formattedLabel:function(t){return(0,o.lx)(t)},forceRerender:function(){return this.componentKey+=1},handleClick:function(){}},computed:{tabItems:function(){var t=this.block.item.tab_blocks,e=[];return t&&t.forEach((function(t){null!==t.item&&("tab_block_label"===t.item.__typename?e.push((0,r.Z)((0,r.Z)({},t),{},{tabBlocks:[]})):e[e.length-1].tabBlocks.push(t))})),e}},watch:{tab:function(){this.$emit("tab",this.tab)}},created:function(){var t=this.$route.query.tabs&&this.$route.query.tabs.split(",")[0];this.tab=t||this.formattedLabel(this.tabItems[0].item.tab_block_label)},mounted:function(){var t=this;console.log("TabsBlock mounted!"),setTimeout((function(){var e=t.$route.query.tabs&&t.$route.query.tabs.split(",");if(e&&e.length>1){var i="tab_label_".concat(e[1]);t.$refs[i]&&t.$refs[i][0].$el.click()}}),0)}},h=c,u=i(1001),d=i(3453),f=i.n(d),v=i(9391),p=i(306),m=(i(5306),i(2543)),g=i(8084),b=i(171),w=i(5598),y=i(3553),x=(0,y.Z)(g.Z,(0,m.d)("tabsBar"),b.Z),$=x.extend().extend().extend({name:"v-tab",props:{ripple:{type:[Boolean,Object],default:!0}},data:function(){return{proxyClass:"v-tab--active"}},computed:{classes:function(){return(0,r.Z)((0,r.Z)({"v-tab":!0},g.Z.options.computed.classes.call(this)),{},{"v-tab--disabled":this.disabled},this.groupClasses)},value:function(){var t=this.to||this.href;if(null==t)return t;if(this.$router&&this.to===Object(this.to)){var e=this.$router.resolve(this.to,this.$route,this.append);t=e.href}return t.replace("#","")}},methods:{click:function(t){this.disabled?t.preventDefault():(this.href&&this.href.indexOf("#")>-1&&t.preventDefault(),t.detail&&this.$el.blur(),this.$emit("click",t),this.to||this.toggle())},toggle:function(){this.isActive&&(this.tabsBar.mandatory||this.to)||this.$emit("change")}},render:function(t){var e=this,i=this.generateRouteLink(),n=i.tag,s=i.data;return s.attrs=(0,r.Z)((0,r.Z)({},s.attrs),{},{"aria-selected":String(this.isActive),role:"tab",tabindex:this.disabled?-1:0}),s.on=(0,r.Z)((0,r.Z)({},s.on),{},{keydown:function(t){t.keyCode===w.Do.enter&&e.click(t),e.$emit("keydown",t)}}),t(n,s,this.$slots.default)}}),k=i(2083),T=i(9727),C=(0,y.Z)(k.Z,(0,m.d)("windowGroup","v-window-item","v-window")),S=C.extend().extend().extend({name:"v-window-item",directives:{Touch:T.Z},props:{disabled:Boolean,reverseTransition:{type:[Boolean,String],default:void 0},transition:{type:[Boolean,String],default:void 0},value:{required:!1}},data:function(){return{isActive:!1,inTransition:!1}},computed:{classes:function(){return this.groupClasses},computedTransition:function(){return this.windowGroup.internalReverse?"undefined"!==typeof this.reverseTransition?this.reverseTransition||"":this.windowGroup.computedTransition:"undefined"!==typeof this.transition?this.transition||"":this.windowGroup.computedTransition}},methods:{genDefaultSlot:function(){return this.$slots.default},genWindowItem:function(){return this.$createElement("div",{staticClass:"v-window-item",class:this.classes,directives:[{name:"show",value:this.isActive}],on:this.$listeners},this.genDefaultSlot())},onAfterTransition:function(){this.inTransition&&(this.inTransition=!1,this.windowGroup.transitionCount>0&&(this.windowGroup.transitionCount--,0===this.windowGroup.transitionCount&&(this.windowGroup.transitionHeight=void 0)))},onBeforeTransition:function(){this.inTransition||(this.inTransition=!0,0===this.windowGroup.transitionCount&&(this.windowGroup.transitionHeight=(0,w.kb)(this.windowGroup.$el.clientHeight)),this.windowGroup.transitionCount++)},onTransitionCancelled:function(){this.onAfterTransition()},onEnter:function(t){var e=this;this.inTransition&&this.$nextTick((function(){e.computedTransition&&e.inTransition&&(e.windowGroup.transitionHeight=(0,w.kb)(t.clientHeight))}))}},render:function(t){var e=this;return t("transition",{props:{name:this.computedTransition},on:{beforeEnter:this.onBeforeTransition,afterEnter:this.onAfterTransition,enterCancelled:this.onTransitionCancelled,beforeLeave:this.onBeforeTransition,afterLeave:this.onAfterTransition,leaveCancelled:this.onTransitionCancelled,enter:this.onEnter}},this.showLazyContent((function(){return[e.genWindowItem()]})))}}),_=S.extend({name:"v-tab-item",props:{id:String},methods:{genWindowItem:function(){var t=S.options.methods.genWindowItem.call(this);return t.data.domProps=t.data.domProps||{},t.data.domProps.id=this.id||this.value,t}}}),Z=(i(9653),i(8309),i(5051)),B=(i(2420),i(6699),i(2222),i(7042),i(3286)),I=i(51),A=i(5143),O=i(2644),P=i(2139);function R(t){var e=.501,i=Math.abs(t);return Math.sign(t)*(i/((1/e-2)*(1-i)+1))}function E(t,e,i,n){var s=t.clientWidth,r=i?e.content-t.offsetLeft-s:t.offsetLeft;i&&(n=-n);var o=e.wrapper+n,a=s+r,l=.4*s;return r<=n?n=Math.max(r-l,0):o<=a&&(n=Math.min(n-(o-a-l),e.content-e.wrapper)),i?-n:n}function L(t,e,i){var n=t.offsetLeft,s=t.clientWidth;if(i){var r=e.content-n-s/2-e.wrapper/2;return-Math.min(e.content-e.wrapper,Math.max(0,r))}var o=n+s/2-e.wrapper/2;return Math.min(e.content-e.wrapper,Math.max(0,o))}var M=(0,y.Z)(A.y,O.Z).extend({name:"base-slide-group",directives:{Resize:P.Z,Touch:T.Z},props:{activeClass:{type:String,default:"v-slide-item--active"},centerActive:Boolean,nextIcon:{type:String,default:"$next"},prevIcon:{type:String,default:"$prev"},showArrows:{type:[Boolean,String],validator:function(t){return"boolean"===typeof t||["always","desktop","mobile"].includes(t)}}},data:function(){return{internalItemsLength:0,isOverflowing:!1,resizeTimeout:0,startX:0,isSwipingHorizontal:!1,isSwiping:!1,scrollOffset:0,widths:{content:0,wrapper:0}}},computed:{canTouch:function(){return"undefined"!==typeof window},__cachedNext:function(){return this.genTransition("next")},__cachedPrev:function(){return this.genTransition("prev")},classes:function(){return(0,r.Z)((0,r.Z)({},A.y.options.computed.classes.call(this)),{},{"v-slide-group":!0,"v-slide-group--has-affixes":this.hasAffixes,"v-slide-group--is-overflowing":this.isOverflowing})},hasAffixes:function(){switch(this.showArrows){case"always":return!0;case"desktop":return!this.isMobile;case!0:return this.isOverflowing||Math.abs(this.scrollOffset)>0;case"mobile":return this.isMobile||this.isOverflowing||Math.abs(this.scrollOffset)>0;default:return!this.isMobile&&(this.isOverflowing||Math.abs(this.scrollOffset)>0)}},hasNext:function(){if(!this.hasAffixes)return!1;var t=this.widths,e=t.content,i=t.wrapper;return e>Math.abs(this.scrollOffset)+i},hasPrev:function(){return this.hasAffixes&&0!==this.scrollOffset}},watch:{internalValue:"setWidths",isOverflowing:"setWidths",scrollOffset:function(t){this.$vuetify.rtl&&(t=-t);var e=t<=0?R(-t):t>this.widths.content-this.widths.wrapper?-(this.widths.content-this.widths.wrapper)+R(this.widths.content-this.widths.wrapper-t):-t;this.$vuetify.rtl&&(e=-e),this.$refs.content.style.transform="translateX(".concat(e,"px)")}},beforeUpdate:function(){this.internalItemsLength=(this.$children||[]).length},updated:function(){this.internalItemsLength!==(this.$children||[]).length&&this.setWidths()},methods:{onScroll:function(){this.$refs.wrapper.scrollLeft=0},onFocusin:function(t){if(this.isOverflowing){var e,i=(0,Z.Z)((0,w.iZ)(t));try{for(i.s();!(e=i.n()).done;){var n,s=e.value,r=(0,Z.Z)(this.items);try{for(r.s();!(n=r.n()).done;){var o=n.value;if(o.$el===s)return void(this.scrollOffset=E(o.$el,this.widths,this.$vuetify.rtl,this.scrollOffset))}}catch(a){r.e(a)}finally{r.f()}}}catch(a){i.e(a)}finally{i.f()}}},genNext:function(){var t=this,e=this.$scopedSlots.next?this.$scopedSlots.next({}):this.$slots.next||this.__cachedNext;return this.$createElement("div",{staticClass:"v-slide-group__next",class:{"v-slide-group__next--disabled":!this.hasNext},on:{click:function(){return t.onAffixClick("next")}},key:"next"},[e])},genContent:function(){return this.$createElement("div",{staticClass:"v-slide-group__content",ref:"content",on:{focusin:this.onFocusin}},this.$slots.default)},genData:function(){return{class:this.classes,directives:[{name:"resize",value:this.onResize}]}},genIcon:function(t){var e=t;this.$vuetify.rtl&&"prev"===t?e="next":this.$vuetify.rtl&&"next"===t&&(e="prev");var i="".concat(t[0].toUpperCase()).concat(t.slice(1)),n=this["has".concat(i)];return this.showArrows||n?this.$createElement(B.Z,{props:{disabled:!n}},this["".concat(e,"Icon")]):null},genPrev:function(){var t=this,e=this.$scopedSlots.prev?this.$scopedSlots.prev({}):this.$slots.prev||this.__cachedPrev;return this.$createElement("div",{staticClass:"v-slide-group__prev",class:{"v-slide-group__prev--disabled":!this.hasPrev},on:{click:function(){return t.onAffixClick("prev")}},key:"prev"},[e])},genTransition:function(t){return this.$createElement(I.Z5,[this.genIcon(t)])},genWrapper:function(){var t=this;return this.$createElement("div",{staticClass:"v-slide-group__wrapper",directives:[{name:"touch",value:{start:function(e){return t.overflowCheck(e,t.onTouchStart)},move:function(e){return t.overflowCheck(e,t.onTouchMove)},end:function(e){return t.overflowCheck(e,t.onTouchEnd)}}}],ref:"wrapper",on:{scroll:this.onScroll}},[this.genContent()])},calculateNewOffset:function(t,e,i,n){var s=i?-1:1,r=s*n+("prev"===t?-1:1)*e.wrapper;return s*Math.max(Math.min(r,e.content-e.wrapper),0)},onAffixClick:function(t){this.$emit("click:".concat(t)),this.scrollTo(t)},onResize:function(){this._isDestroyed||this.setWidths()},onTouchStart:function(t){var e=this.$refs.content;this.startX=this.scrollOffset+t.touchstartX,e.style.setProperty("transition","none"),e.style.setProperty("willChange","transform")},onTouchMove:function(t){if(this.canTouch){if(!this.isSwiping){var e=t.touchmoveX-t.touchstartX,i=t.touchmoveY-t.touchstartY;this.isSwipingHorizontal=Math.abs(e)>Math.abs(i),this.isSwiping=!0}this.isSwipingHorizontal&&(this.scrollOffset=this.startX-t.touchmoveX,document.documentElement.style.overflowY="hidden")}},onTouchEnd:function(){if(this.canTouch){var t=this.$refs,e=t.content,i=t.wrapper,n=e.clientWidth-i.clientWidth;e.style.setProperty("transition",null),e.style.setProperty("willChange",null),this.$vuetify.rtl?this.scrollOffset>0||!this.isOverflowing?this.scrollOffset=0:this.scrollOffset<=-n&&(this.scrollOffset=-n):this.scrollOffset<0||!this.isOverflowing?this.scrollOffset=0:this.scrollOffset>=n&&(this.scrollOffset=n),this.isSwiping=!1,document.documentElement.style.removeProperty("overflow-y")}},overflowCheck:function(t,e){t.stopPropagation(),this.isOverflowing&&e(t)},scrollIntoView:function(){if(!this.selectedItem&&this.items.length){var t=this.items[this.items.length-1].$el.getBoundingClientRect(),e=this.$refs.wrapper.getBoundingClientRect();(this.$vuetify.rtl&&e.right<t.right||!this.$vuetify.rtl&&e.left>t.left)&&this.scrollTo("prev")}this.selectedItem&&(0===this.selectedIndex||!this.centerActive&&!this.isOverflowing?this.scrollOffset=0:this.centerActive?this.scrollOffset=L(this.selectedItem.$el,this.widths,this.$vuetify.rtl):this.isOverflowing&&(this.scrollOffset=E(this.selectedItem.$el,this.widths,this.$vuetify.rtl,this.scrollOffset)))},scrollTo:function(t){this.scrollOffset=this.calculateNewOffset(t,{content:this.$refs.content?this.$refs.content.clientWidth:0,wrapper:this.$refs.wrapper?this.$refs.wrapper.clientWidth:0},this.$vuetify.rtl,this.scrollOffset)},setWidths:function(){var t=this;window.requestAnimationFrame((function(){if(!t._isDestroyed){var e=t.$refs,i=e.content,n=e.wrapper;t.widths={content:i?i.clientWidth:0,wrapper:n?n.clientWidth:0},t.isOverflowing=t.widths.wrapper+1<t.widths.content,t.scrollIntoView()}}))}},render:function(t){return t("div",this.genData(),[this.genPrev(),this.genWrapper(),this.genNext()])}}),N=(M.extend({name:"v-slide-group",provide:function(){return{slideGroup:this}}}),i(905)),W=(0,y.Z)(M,N.Z,b.Z).extend({name:"v-tabs-bar",provide:function(){return{tabsBar:this}},computed:{classes:function(){return(0,r.Z)((0,r.Z)({},M.options.computed.classes.call(this)),{},{"v-tabs-bar":!0,"v-tabs-bar--is-mobile":this.isMobile,"v-tabs-bar--show-arrows":this.showArrows},this.themeClasses)}},watch:{items:"callSlider",internalValue:"callSlider",$route:"onRouteChange"},methods:{callSlider:function(){this.isBooted&&this.$emit("call:slider")},genContent:function(){var t=M.options.methods.genContent.call(this);return t.data=t.data||{},t.data.staticClass+=" v-tabs-bar__content",t},onRouteChange:function(t,e){if(!this.mandatory){var i,n=this.items,s=t.path,r=e.path,o=!1,a=!1,l=(0,Z.Z)(n);try{for(l.s();!(i=l.n()).done;){var c=i.value;if(c.to===r?a=!0:c.to===s&&(o=!0),o&&a)break}}catch(h){l.e(h)}finally{l.f()}!o&&a&&(this.internalValue=void 0)}}},render:function(t){var e=M.options.render.call(this,t);return e.data.attrs={role:"tablist"},e}}),V=(i(9826),i(4553),i(546)),z=A.y.extend({name:"v-window",directives:{Touch:T.Z},provide:function(){return{windowGroup:this}},props:{activeClass:{type:String,default:"v-window-item--active"},continuous:Boolean,mandatory:{type:Boolean,default:!0},nextIcon:{type:[Boolean,String],default:"$next"},prevIcon:{type:[Boolean,String],default:"$prev"},reverse:Boolean,showArrows:Boolean,showArrowsOnHover:Boolean,touch:Object,touchless:Boolean,value:{required:!1},vertical:Boolean},data:function(){return{changedByDelimiters:!1,internalHeight:void 0,transitionHeight:void 0,transitionCount:0,isBooted:!1,isReverse:!1}},computed:{isActive:function(){return this.transitionCount>0},classes:function(){return(0,r.Z)((0,r.Z)({},A.y.options.computed.classes.call(this)),{},{"v-window--show-arrows-on-hover":this.showArrowsOnHover})},computedTransition:function(){if(!this.isBooted)return"";var t=this.vertical?"y":"x",e=this.internalReverse?!this.isReverse:this.isReverse,i=e?"-reverse":"";return"v-window-".concat(t).concat(i,"-transition")},hasActiveItems:function(){return Boolean(this.items.find((function(t){return!t.disabled})))},hasNext:function(){return this.continuous||this.internalIndex<this.items.length-1},hasPrev:function(){return this.continuous||this.internalIndex>0},internalIndex:function(){var t=this;return this.items.findIndex((function(e,i){return t.internalValue===t.getValue(e,i)}))},internalReverse:function(){return this.$vuetify.rtl?!this.reverse:this.reverse}},watch:{internalIndex:function(t,e){this.isReverse=this.updateReverse(t,e)}},mounted:function(){var t=this;window.requestAnimationFrame((function(){return t.isBooted=!0}))},methods:{genDefaultSlot:function(){return this.$slots.default},genContainer:function(){var t=[this.genDefaultSlot()];return this.showArrows&&t.push(this.genControlIcons()),this.$createElement("div",{staticClass:"v-window__container",class:{"v-window__container--is-active":this.isActive},style:{height:this.internalHeight||this.transitionHeight}},t)},genIcon:function(t,e,i){var n,s,r,o=this,a={click:function(t){t.stopPropagation(),o.changedByDelimiters=!0,i()}},l={"aria-label":this.$vuetify.lang.t("$vuetify.carousel.".concat(t))},c=null!=(n=null==(s=(r=this.$scopedSlots)[t])?void 0:s.call(r,{on:a,attrs:l}))?n:[this.$createElement(V.Z,{props:{icon:!0},attrs:l,on:a},[this.$createElement(B.Z,{props:{large:!0}},e)])];return this.$createElement("div",{staticClass:"v-window__".concat(t)},c)},genControlIcons:function(){var t=[],e=this.$vuetify.rtl?this.nextIcon:this.prevIcon;if(this.hasPrev&&e&&"string"===typeof e){var i=this.genIcon("prev",e,this.prev);i&&t.push(i)}var n=this.$vuetify.rtl?this.prevIcon:this.nextIcon;if(this.hasNext&&n&&"string"===typeof n){var s=this.genIcon("next",n,this.next);s&&t.push(s)}return t},getNextIndex:function(t){var e=(t+1)%this.items.length,i=this.items[e];return i.disabled?this.getNextIndex(e):e},getPrevIndex:function(t){var e=(t+this.items.length-1)%this.items.length,i=this.items[e];return i.disabled?this.getPrevIndex(e):e},next:function(){if(this.hasActiveItems&&this.hasNext){var t=this.getNextIndex(this.internalIndex),e=this.items[t];this.internalValue=this.getValue(e,t)}},prev:function(){if(this.hasActiveItems&&this.hasPrev){var t=this.getPrevIndex(this.internalIndex),e=this.items[t];this.internalValue=this.getValue(e,t)}},updateReverse:function(t,e){var i=this.items.length,n=i-1;return i<=2?t<e:t===n&&0===e||(0!==t||e!==n)&&t<e}},render:function(t){var e=this,i={staticClass:"v-window",class:this.classes,directives:[]};if(!this.touchless){var n=this.touch||{left:function(){e.$vuetify.rtl?e.prev():e.next()},right:function(){e.$vuetify.rtl?e.next():e.prev()},end:function(t){t.stopPropagation()},start:function(t){t.stopPropagation()}};i.directives.push({name:"touch",value:n})}return t("div",i,[this.genContainer()])}}),D=z.extend({name:"v-tabs-items",props:{mandatory:{type:Boolean,default:!1}},computed:{classes:function(){return(0,r.Z)((0,r.Z)({},z.options.computed.classes.call(this)),{},{"v-tabs-items":!0})},isDark:function(){return this.rootIsDark}},methods:{getValue:function(t,e){return t.id||A.y.options.methods.getValue.call(this,t,e)}}}),H=i(5505),q=(0,y.Z)(H.Z).extend({name:"v-tabs-slider",render:function(t){return t("div",this.setBackgroundColor(this.color,{staticClass:"v-tabs-slider"}))}}),G=i(9301),X=(0,y.Z)(H.Z,G.Z,b.Z),F=X.extend().extend({name:"v-tabs",directives:{Resize:P.Z},props:{activeClass:{type:String,default:""},alignWithTitle:Boolean,backgroundColor:String,centerActive:Boolean,centered:Boolean,fixedTabs:Boolean,grow:Boolean,height:{type:[Number,String],default:void 0},hideSlider:Boolean,iconsAndText:Boolean,mobileBreakpoint:[String,Number],nextIcon:{type:String,default:"$next"},optional:Boolean,prevIcon:{type:String,default:"$prev"},right:Boolean,showArrows:[Boolean,String],sliderColor:String,sliderSize:{type:[Number,String],default:2},vertical:Boolean},data:function(){return{resizeTimeout:0,slider:{height:null,left:null,right:null,top:null,width:null},transitionTime:300}},computed:{classes:function(){return(0,r.Z)({"v-tabs--align-with-title":this.alignWithTitle,"v-tabs--centered":this.centered,"v-tabs--fixed-tabs":this.fixedTabs,"v-tabs--grow":this.grow,"v-tabs--icons-and-text":this.iconsAndText,"v-tabs--right":this.right,"v-tabs--vertical":this.vertical},this.themeClasses)},isReversed:function(){return this.$vuetify.rtl&&this.vertical},sliderStyles:function(){return{height:(0,w.kb)(this.slider.height),left:this.isReversed?void 0:(0,w.kb)(this.slider.left),right:this.isReversed?(0,w.kb)(this.slider.right):void 0,top:this.vertical?(0,w.kb)(this.slider.top):void 0,transition:null!=this.slider.left?null:"none",width:(0,w.kb)(this.slider.width)}},computedColor:function(){return this.color?this.color:this.isDark&&!this.appIsDark?"white":"primary"}},watch:{alignWithTitle:"callSlider",centered:"callSlider",centerActive:"callSlider",fixedTabs:"callSlider",grow:"callSlider",iconsAndText:"callSlider",right:"callSlider",showArrows:"callSlider",vertical:"callSlider","$vuetify.application.left":"onResize","$vuetify.application.right":"onResize","$vuetify.rtl":"onResize"},mounted:function(){var t=this;this.$nextTick((function(){window.setTimeout(t.callSlider,30)}))},methods:{callSlider:function(){var t=this;return!this.hideSlider&&this.$refs.items&&this.$refs.items.selectedItems.length?(this.$nextTick((function(){var e=t.$refs.items.selectedItems[0];if(!e||!e.$el)return t.slider.width=0,void(t.slider.left=0);var i=e.$el;t.slider={height:t.vertical?i.scrollHeight:Number(t.sliderSize),left:t.vertical?0:i.offsetLeft,right:t.vertical?0:i.offsetLeft+i.offsetWidth,top:i.offsetTop,width:t.vertical?Number(t.sliderSize):i.scrollWidth}})),!0):(this.slider.width=0,!1)},genBar:function(t,e){var i=this,n={style:{height:(0,w.kb)(this.height)},props:{activeClass:this.activeClass,centerActive:this.centerActive,dark:this.dark,light:this.light,mandatory:!this.optional,mobileBreakpoint:this.mobileBreakpoint,nextIcon:this.nextIcon,prevIcon:this.prevIcon,showArrows:this.showArrows,value:this.internalValue},on:{"call:slider":this.callSlider,change:function(t){i.internalValue=t}},ref:"items"};return this.setTextColor(this.computedColor,n),this.setBackgroundColor(this.backgroundColor,n),this.$createElement(W,n,[this.genSlider(e),t])},genItems:function(t,e){var i=this;return t||(e.length?this.$createElement(D,{props:{value:this.internalValue},on:{change:function(t){i.internalValue=t}}},e):null)},genSlider:function(t){return this.hideSlider?null:(t||(t=this.$createElement(q,{props:{color:this.sliderColor}})),this.$createElement("div",{staticClass:"v-tabs-slider-wrapper",style:this.sliderStyles},[t]))},onResize:function(){this._isDestroyed||(clearTimeout(this.resizeTimeout),this.resizeTimeout=window.setTimeout(this.callSlider,0))},parseNodes:function(){for(var t=null,e=null,i=[],n=[],s=this.$slots.default||[],r=s.length,o=0;o<r;o++){var a=s[o];if(a.componentOptions)switch(a.componentOptions.Ctor.options.name){case"v-tabs-slider":e=a;break;case"v-tabs-items":t=a;break;case"v-tab-item":i.push(a);break;default:n.push(a)}else n.push(a)}return{tab:n,slider:e,items:t,item:i}}},render:function(t){var e=this.parseNodes(),i=e.tab,n=e.slider,s=e.items,r=e.item;return t("div",{staticClass:"v-tabs",class:this.classes,directives:[{name:"resize",modifiers:{quiet:!0},value:this.onResize}]},[this.genBar(i,n),this.genItems(s,r)])}}),j=(0,u.Z)(h,n,s,!1,null,"6d8ccdcf",null),Q=j.exports;f()(j,{VCard:v.Z,VCardText:p.ZB,VTab:$,VTabItem:_,VTabs:F,VTabsItems:D})}}]);
//# sourceMappingURL=TabsBlock-legacy.7bb623cf.js.map