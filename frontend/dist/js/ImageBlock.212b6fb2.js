(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["ImageBlock"],{"135f":function(t,a,c){},"695c":function(t,a,c){"use strict";c("135f")},c7d7:function(t,a,c){"use strict";c.r(a);var r=function(){var t=this,a=t.$createElement,c=t._self._c||a;return c("v-row",[c("v-col",[c("figure",[c("v-img",{class:["img-block",t.classObj],attrs:{src:t.fileSrc,"lazy-src":t.lazyImg,alt:t.altTag,contain:""},scopedSlots:t._u([{key:"placeholder",fn:function(){return[c("v-row",{staticClass:"fill-height ma-0",attrs:{align:"center",justify:"center"}},[c("v-progress-circular",{attrs:{indeterminate:"",color:"grey lighten-5"}})],1)]},proxy:!0}])}),t.block.data.caption?c("figcaption",[t._v(t._s(t.block.data.caption))]):t._e()],1)])],1)},o=[],e=(c("99af"),{name:"ImageBlock",data:function(){return{}},props:{block:{type:Object}},computed:{fileSrc:function(){return"".concat("https://dev-onrr-cms.app.cloud.gov").concat(this.block.data.file.url)},lazyImg:function(){return"".concat("https://dev-onrr-cms.app.cloud.gov").concat(this.block.data.file.url,"?fit=cover")},width:function(){var t=this.block.data.stretched?"100%":this.block.data.file.width;return t},height:function(){var t=this.block.data.stretched?"auto":this.block.data.file.height;return t},altTag:function(){return this.block.data.file.title},classObj:function(){var t="";return this.block.data.withBorder&&(t+=" img--border"),this.block.data.withBackground&&(t+=" img--background"),t}}}),n=e,i=(c("695c"),c("2877")),l=c("6544"),s=c.n(l),u=c("62ad"),d=c("adda"),f=c("490a"),h=c("0fd9"),g=Object(i["a"])(n,r,o,!1,null,"770c5ed2",null);a["default"]=g.exports;s()(g,{VCol:u["a"],VImg:d["a"],VProgressCircular:f["a"],VRow:h["a"]})}}]);
//# sourceMappingURL=ImageBlock.212b6fb2.js.map