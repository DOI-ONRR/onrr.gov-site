"use strict";(self["webpackChunkonrr_frontend_app_vue"]=self["webpackChunkonrr_frontend_app_vue"]||[]).push([[738],{3594:function(t,e,n){n.r(e),n.d(e,{default:function(){return u}});var a=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{class:[t.textClass,"black--text"],domProps:{innerHTML:t._s(t.content)}})},r=[],l={name:"TextBlock",data(){return{}},props:{block:{type:Object}},computed:{textClass(){let t="",e=`text-${this.block?.tunes?.alignmentTune?.alignment}`||"text-left";switch(this.block.type){case"header":t=`text-h${this.block.data.level} ${e} mt-4 mb-6`;break;case"paragraph":t=`text-body1 ${e}`;break;default:t=`text-body1 ${e}`;break}return t},content(){return this.block.data.text}}},s=l,c=n(1001),o=(0,c.Z)(s,a,r,!1,null,"3bd5ca19",null),u=o.exports}}]);
//# sourceMappingURL=TextBlock.008bba3f.js.map