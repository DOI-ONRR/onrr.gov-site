"use strict";(self["webpackChunkonrr_frontend_app_vue"]=self["webpackChunkonrr_frontend_app_vue"]||[]).push([[505],{8121:function(e,t,n){n.r(t),n.d(t,{default:function(){return g}});var o=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[n("keep-alive",[n(e.collectionBlock(e.collection),{tag:"component",attrs:{collection:e.items,collectionName:e.collection,collectionLayout:e.collectionLayout,collectionPage:e.collectionPage,collectionTab:e.collectionTab,collectionAccordion:e.collectionAccordion}})],1)],1)},c=[],l=(n(1539),n(8783),n(3948),n(7327),n(9985)),i=function(){return Promise.all([n.e(343),n.e(921),n.e(472),n.e(502),n.e(793)]).then(n.bind(n,9789))},r=function(){return Promise.all([n.e(343),n.e(921),n.e(472),n.e(502),n.e(793)]).then(n.bind(n,5684))},a=function(){return n.e(124).then(n.bind(n,1629))},s=function(){return n.e(495).then(n.bind(n,9333))},u=function(){return n.e(167).then(n.bind(n,3985))},b=function(){return Promise.all([n.e(343),n.e(315)]).then(n.bind(n,6145))},d=function(){return Promise.all([n.e(921),n.e(62)]).then(n.bind(n,7025))},f=function(){return Promise.all([n.e(343),n.e(921),n.e(472),n.e(502),n.e(520)]).then(n.bind(n,8878))},k=function(){return Promise.all([n.e(343),n.e(921),n.e(472),n.e(502),n.e(567)]).then(n.bind(n,7305))},h=function(){return Promise.all([n.e(343),n.e(921),n.e(472),n.e(502),n.e(883)]).then(n.bind(n,749))},m=function(){return Promise.all([n.e(343),n.e(921),n.e(472),n.e(502),n.e(758)]).then(n.bind(n,9742))},p={name:"CollectionBlock",props:{block:[Array,Object,String]},apollo:{collectionItems:{query:function(){if("reporter_letters"===this.block.data.collection)return l.KT;if("press_releases"===this.block.data.collection)return l.dw;if("announcements"===this.block.data.collection)return l.qH;if("events"===this.block.data.collection);else if("companies"===this.block.data.collection);else{if("contacts"===this.block.data.collection)return l.Qs;if("NYMEX"===this.block.data.collection)return l.tv;if("rulemakings"===this.block.data.collection)return l.Nm;if("index_zones"===this.block.data.collection)return l.jI;if("ibmp"===this.block.data.collection)return l.yk;if("indian_gas_major_portion"===this.block.data.collection)return l.M4}},update:function(e){return e}}},methods:{collectionBlock:function(e){var t;switch(e){case"reporter_letters":t=i;break;case"press_releases":t=r;break;case"announcements":t=a;break;case"events":t=s;break;case"companies":t=u;break;case"contacts":t=b;break;case"NYMEX":t=d;break;case"rulemakings":t=f;break;case"index_zones":t=k;break;case"ibmp":t=h;break;case"indian_gas_major_portion":t=m;break;default:console.warn("No collection block found."),t=void 0;break}return t}},computed:{collection:function(){return this.block.data.collection},collectionLayout:function(){return this.block.data.layout},collectionPage:function(){return this.block.data.page},collectionTab:function(){return this.block.data.tab||null},collectionAccordion:function(){return this.block.data.accordion||null},items:function(){var e=this,t=this.collectionItems&&this.collectionItems[this.block.data.collection].filter((function(t){return t.status===e.block.data.status}));return t}}},_=p,v=n(1001),P=(0,v.Z)(_,o,c,!1,null,null,null),g=P.exports}}]);
//# sourceMappingURL=CollectionBlock-legacy.88760fe7.js.map