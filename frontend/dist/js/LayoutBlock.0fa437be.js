(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["LayoutBlock","chunk-d19ab21a"],{"0b83":function(e,n,t){"use strict";t.r(n);var o=function(){var e=this,n=e.$createElement,t=e._self._c||n;return t("div",[t("v-row",e._l(e.layoutItems,(function(n){return t("v-col",{key:n.id,class:["layout-block-container",n.item.__typename,n.item.equal_col_height?"flex":"no-flex"],attrs:{cols:"12",sm:"12",md:n.item.layoutCol}},[t("v-row",e._l(n.nestedBlocks,(function(n){return t("v-col",{key:n.id,class:["nested-block-container",n.item.__typename,n.item.equal_col_height?"flex":"no-flex"],attrs:{sm:"12",md:n.item.block_v_col}},[t(e.pageBlock(n.item.__typename),{tag:"component",staticClass:"block-component",attrs:{block:n}})],1)})),1)],1)})),1)],1)},a=[],c=t("5530"),r=(t("d3b7"),t("159b"),t("1b62")),l={mixins:[r["b"],r["d"]],name:"LayoutBlock",data:function(){return{columnLayouBlockPresent:!1}},props:{layoutBlocks:Array},computed:{layoutItems:function(){var e=this.layoutBlocks&&this.layoutBlocks.some((function(e){return"layout_column_blocks"===e.item.__typename})),n=this.layoutBlocks,t=[{item:{block_v_col:"12"},nestedBlocks:[]}];return e?n&&n.forEach((function(e){null!==e.item&&("layout_column_blocks"===e.item.__typename?t.push(Object(c["a"])(Object(c["a"])({},e),{},{nestedBlocks:[]})):t[t.length-1].nestedBlocks.push(e))})):n&&n.forEach((function(e){null!==e.item&&t[t.length-1].nestedBlocks.push(e)})),t}}},i=l,u=(t("2dda"),t("2877")),s=t("6544"),d=t.n(s),f=t("62ad"),h=t("0fd9"),b=Object(u["a"])(i,o,a,!1,null,"fd3d71da",null);n["default"]=b.exports;d()(b,{VCol:f["a"],VRow:h["a"]})},"1b62":function(e,n,t){"use strict";t.d(n,"d",(function(){return o["a"]})),t.d(n,"b",(function(){return c})),t.d(n,"c",(function(){return r})),t.d(n,"a",(function(){return i}));var o=t("c68d"),a=(t("d3b7"),t("3ca3"),t("ddb0"),function(){return t.e("EditorBlock").then(t.bind(null,"1fdb"))}),c={props:{block:Object},components:{EditorBlock:a}},r=(t("99af"),t("9911"),t("fb6a"),{data:function(){return{BASE_URL:"https://preview-onrr-cms.app.cloud.gov"}},props:{collection:[Array,Object],collectionName:String,collectionLayout:String},methods:{fileLink:function(e,n){var t;return n.file?t="".concat(e).concat(n.file.filename_download):n.link&&(t=n.link),t},accessibleFileLink:function(e,n){var t;return n.accessible_file&&(t="".concat(e).concat(n.accessible_file.filename_download)),t}},computed:{slicedCollection:function(){var e=this.collection&&this.collection.slice(0,5);return e}}}),l=t("9944"),i={methods:{getFullDate:l["d"],getYear:l["f"],getMonth:l["e"],getDay:l["c"],formatNiceDate:function(e){return"".concat(Object(l["e"])(e,"numeric"),"/").concat(Object(l["c"])(e,"numeric"),"/").concat(Object(l["f"])(e))}}}},"2dda":function(e,n,t){"use strict";t("94e6")},3666:function(e,n,t){(function(n,t,o){e.exports=o(),e.exports["default"]=o()})(0,0,(function(){var e=JSON.parse('{"$":"dollar","%":"percent","&":"and","<":"less",">":"greater","|":"or","¢":"cent","£":"pound","¤":"currency","¥":"yen","©":"(c)","ª":"a","®":"(r)","º":"o","À":"A","Á":"A","Â":"A","Ã":"A","Ä":"A","Å":"A","Æ":"AE","Ç":"C","È":"E","É":"E","Ê":"E","Ë":"E","Ì":"I","Í":"I","Î":"I","Ï":"I","Ð":"D","Ñ":"N","Ò":"O","Ó":"O","Ô":"O","Õ":"O","Ö":"O","Ø":"O","Ù":"U","Ú":"U","Û":"U","Ü":"U","Ý":"Y","Þ":"TH","ß":"ss","à":"a","á":"a","â":"a","ã":"a","ä":"a","å":"a","æ":"ae","ç":"c","è":"e","é":"e","ê":"e","ë":"e","ì":"i","í":"i","î":"i","ï":"i","ð":"d","ñ":"n","ò":"o","ó":"o","ô":"o","õ":"o","ö":"o","ø":"o","ù":"u","ú":"u","û":"u","ü":"u","ý":"y","þ":"th","ÿ":"y","Ā":"A","ā":"a","Ă":"A","ă":"a","Ą":"A","ą":"a","Ć":"C","ć":"c","Č":"C","č":"c","Ď":"D","ď":"d","Đ":"DJ","đ":"dj","Ē":"E","ē":"e","Ė":"E","ė":"e","Ę":"e","ę":"e","Ě":"E","ě":"e","Ğ":"G","ğ":"g","Ģ":"G","ģ":"g","Ĩ":"I","ĩ":"i","Ī":"i","ī":"i","Į":"I","į":"i","İ":"I","ı":"i","Ķ":"k","ķ":"k","Ļ":"L","ļ":"l","Ľ":"L","ľ":"l","Ł":"L","ł":"l","Ń":"N","ń":"n","Ņ":"N","ņ":"n","Ň":"N","ň":"n","Ō":"O","ō":"o","Ő":"O","ő":"o","Œ":"OE","œ":"oe","Ŕ":"R","ŕ":"r","Ř":"R","ř":"r","Ś":"S","ś":"s","Ş":"S","ş":"s","Š":"S","š":"s","Ţ":"T","ţ":"t","Ť":"T","ť":"t","Ũ":"U","ũ":"u","Ū":"u","ū":"u","Ů":"U","ů":"u","Ű":"U","ű":"u","Ų":"U","ų":"u","Ŵ":"W","ŵ":"w","Ŷ":"Y","ŷ":"y","Ÿ":"Y","Ź":"Z","ź":"z","Ż":"Z","ż":"z","Ž":"Z","ž":"z","Ə":"E","ƒ":"f","Ơ":"O","ơ":"o","Ư":"U","ư":"u","ǈ":"LJ","ǉ":"lj","ǋ":"NJ","ǌ":"nj","Ș":"S","ș":"s","Ț":"T","ț":"t","ə":"e","˚":"o","Ά":"A","Έ":"E","Ή":"H","Ί":"I","Ό":"O","Ύ":"Y","Ώ":"W","ΐ":"i","Α":"A","Β":"B","Γ":"G","Δ":"D","Ε":"E","Ζ":"Z","Η":"H","Θ":"8","Ι":"I","Κ":"K","Λ":"L","Μ":"M","Ν":"N","Ξ":"3","Ο":"O","Π":"P","Ρ":"R","Σ":"S","Τ":"T","Υ":"Y","Φ":"F","Χ":"X","Ψ":"PS","Ω":"W","Ϊ":"I","Ϋ":"Y","ά":"a","έ":"e","ή":"h","ί":"i","ΰ":"y","α":"a","β":"b","γ":"g","δ":"d","ε":"e","ζ":"z","η":"h","θ":"8","ι":"i","κ":"k","λ":"l","μ":"m","ν":"n","ξ":"3","ο":"o","π":"p","ρ":"r","ς":"s","σ":"s","τ":"t","υ":"y","φ":"f","χ":"x","ψ":"ps","ω":"w","ϊ":"i","ϋ":"y","ό":"o","ύ":"y","ώ":"w","Ё":"Yo","Ђ":"DJ","Є":"Ye","І":"I","Ї":"Yi","Ј":"J","Љ":"LJ","Њ":"NJ","Ћ":"C","Џ":"DZ","А":"A","Б":"B","В":"V","Г":"G","Д":"D","Е":"E","Ж":"Zh","З":"Z","И":"I","Й":"J","К":"K","Л":"L","М":"M","Н":"N","О":"O","П":"P","Р":"R","С":"S","Т":"T","У":"U","Ф":"F","Х":"H","Ц":"C","Ч":"Ch","Ш":"Sh","Щ":"Sh","Ъ":"U","Ы":"Y","Ь":"","Э":"E","Ю":"Yu","Я":"Ya","а":"a","б":"b","в":"v","г":"g","д":"d","е":"e","ж":"zh","з":"z","и":"i","й":"j","к":"k","л":"l","м":"m","н":"n","о":"o","п":"p","р":"r","с":"s","т":"t","у":"u","ф":"f","х":"h","ц":"c","ч":"ch","ш":"sh","щ":"sh","ъ":"u","ы":"y","ь":"","э":"e","ю":"yu","я":"ya","ё":"yo","ђ":"dj","є":"ye","і":"i","ї":"yi","ј":"j","љ":"lj","њ":"nj","ћ":"c","ѝ":"u","џ":"dz","Ґ":"G","ґ":"g","Ғ":"GH","ғ":"gh","Қ":"KH","қ":"kh","Ң":"NG","ң":"ng","Ү":"UE","ү":"ue","Ұ":"U","ұ":"u","Һ":"H","һ":"h","Ә":"AE","ә":"ae","Ө":"OE","ө":"oe","Ա":"A","Բ":"B","Գ":"G","Դ":"D","Ե":"E","Զ":"Z","Է":"E\'","Ը":"Y\'","Թ":"T\'","Ժ":"JH","Ի":"I","Լ":"L","Խ":"X","Ծ":"C\'","Կ":"K","Հ":"H","Ձ":"D\'","Ղ":"GH","Ճ":"TW","Մ":"M","Յ":"Y","Ն":"N","Շ":"SH","Չ":"CH","Պ":"P","Ջ":"J","Ռ":"R\'","Ս":"S","Վ":"V","Տ":"T","Ր":"R","Ց":"C","Փ":"P\'","Ք":"Q\'","Օ":"O\'\'","Ֆ":"F","և":"EV","ء":"a","آ":"aa","أ":"a","ؤ":"u","إ":"i","ئ":"e","ا":"a","ب":"b","ة":"h","ت":"t","ث":"th","ج":"j","ح":"h","خ":"kh","د":"d","ذ":"th","ر":"r","ز":"z","س":"s","ش":"sh","ص":"s","ض":"dh","ط":"t","ظ":"z","ع":"a","غ":"gh","ف":"f","ق":"q","ك":"k","ل":"l","م":"m","ن":"n","ه":"h","و":"w","ى":"a","ي":"y","ً":"an","ٌ":"on","ٍ":"en","َ":"a","ُ":"u","ِ":"e","ْ":"","٠":"0","١":"1","٢":"2","٣":"3","٤":"4","٥":"5","٦":"6","٧":"7","٨":"8","٩":"9","پ":"p","چ":"ch","ژ":"zh","ک":"k","گ":"g","ی":"y","۰":"0","۱":"1","۲":"2","۳":"3","۴":"4","۵":"5","۶":"6","۷":"7","۸":"8","۹":"9","฿":"baht","ა":"a","ბ":"b","გ":"g","დ":"d","ე":"e","ვ":"v","ზ":"z","თ":"t","ი":"i","კ":"k","ლ":"l","მ":"m","ნ":"n","ო":"o","პ":"p","ჟ":"zh","რ":"r","ს":"s","ტ":"t","უ":"u","ფ":"f","ქ":"k","ღ":"gh","ყ":"q","შ":"sh","ჩ":"ch","ც":"ts","ძ":"dz","წ":"ts","ჭ":"ch","ხ":"kh","ჯ":"j","ჰ":"h","Ẁ":"W","ẁ":"w","Ẃ":"W","ẃ":"w","Ẅ":"W","ẅ":"w","ẞ":"SS","Ạ":"A","ạ":"a","Ả":"A","ả":"a","Ấ":"A","ấ":"a","Ầ":"A","ầ":"a","Ẩ":"A","ẩ":"a","Ẫ":"A","ẫ":"a","Ậ":"A","ậ":"a","Ắ":"A","ắ":"a","Ằ":"A","ằ":"a","Ẳ":"A","ẳ":"a","Ẵ":"A","ẵ":"a","Ặ":"A","ặ":"a","Ẹ":"E","ẹ":"e","Ẻ":"E","ẻ":"e","Ẽ":"E","ẽ":"e","Ế":"E","ế":"e","Ề":"E","ề":"e","Ể":"E","ể":"e","Ễ":"E","ễ":"e","Ệ":"E","ệ":"e","Ỉ":"I","ỉ":"i","Ị":"I","ị":"i","Ọ":"O","ọ":"o","Ỏ":"O","ỏ":"o","Ố":"O","ố":"o","Ồ":"O","ồ":"o","Ổ":"O","ổ":"o","Ỗ":"O","ỗ":"o","Ộ":"O","ộ":"o","Ớ":"O","ớ":"o","Ờ":"O","ờ":"o","Ở":"O","ở":"o","Ỡ":"O","ỡ":"o","Ợ":"O","ợ":"o","Ụ":"U","ụ":"u","Ủ":"U","ủ":"u","Ứ":"U","ứ":"u","Ừ":"U","ừ":"u","Ử":"U","ử":"u","Ữ":"U","ữ":"u","Ự":"U","ự":"u","Ỳ":"Y","ỳ":"y","Ỵ":"Y","ỵ":"y","Ỷ":"Y","ỷ":"y","Ỹ":"Y","ỹ":"y","–":"-","‘":"\'","’":"\'","“":"\\"","”":"\\"","„":"\\"","†":"+","•":"*","…":"...","₠":"ecu","₢":"cruzeiro","₣":"french franc","₤":"lira","₥":"mill","₦":"naira","₧":"peseta","₨":"rupee","₩":"won","₪":"new shequel","₫":"dong","€":"euro","₭":"kip","₮":"tugrik","₯":"drachma","₰":"penny","₱":"peso","₲":"guarani","₳":"austral","₴":"hryvnia","₵":"cedi","₸":"kazakhstani tenge","₹":"indian rupee","₺":"turkish lira","₽":"russian ruble","₿":"bitcoin","℠":"sm","™":"tm","∂":"d","∆":"delta","∑":"sum","∞":"infinity","♥":"love","元":"yuan","円":"yen","﷼":"rial","ﻵ":"laa","ﻷ":"laa","ﻹ":"lai","ﻻ":"la"}'),n=JSON.parse('{"bg":{"Й":"Y","Ц":"Ts","Щ":"Sht","Ъ":"A","Ь":"Y","й":"y","ц":"ts","щ":"sht","ъ":"a","ь":"y"},"de":{"Ä":"AE","ä":"ae","Ö":"OE","ö":"oe","Ü":"UE","ü":"ue","ß":"ss","%":"prozent","&":"und","|":"oder","∑":"summe","∞":"unendlich","♥":"liebe"},"es":{"%":"por ciento","&":"y","<":"menor que",">":"mayor que","|":"o","¢":"centavos","£":"libras","¤":"moneda","₣":"francos","∑":"suma","∞":"infinito","♥":"amor"},"fr":{"%":"pourcent","&":"et","<":"plus petit",">":"plus grand","|":"ou","¢":"centime","£":"livre","¤":"devise","₣":"franc","∑":"somme","∞":"infini","♥":"amour"},"pt":{"%":"porcento","&":"e","<":"menor",">":"maior","|":"ou","¢":"centavo","∑":"soma","£":"libra","∞":"infinito","♥":"amor"},"uk":{"И":"Y","и":"y","Й":"Y","й":"y","Ц":"Ts","ц":"ts","Х":"Kh","х":"kh","Щ":"Shch","щ":"shch","Г":"H","г":"h"},"vi":{"Đ":"D","đ":"d"},"da":{"Ø":"OE","ø":"oe","Å":"AA","å":"aa","%":"procent","&":"og","|":"eller","$":"dollar","<":"mindre end",">":"større end"},"nb":{"&":"og"},"it":{"&":"e"},"nl":{"&":"en"},"sv":{"&":"och"}}');function t(t,o){if("string"!==typeof t)throw new Error("slugify: string argument expected");o="string"===typeof o?{replacement:o}:o||{};var a=n[o.locale]||{},c=void 0===o.replacement?"-":o.replacement,r=void 0===o.trim||o.trim,l=t.normalize().split("").reduce((function(n,t){return n+(a[t]||e[t]||(t===c?" ":t)).replace(o.remove||/[^\w\s$*_+~.()'"!\-:@]+/g,"")}),"");return o.strict&&(l=l.replace(/[^A-Za-z0-9\s]/g,"")),r&&(l=l.trim()),l=l.replace(/\s+/g,c),o.lower&&(l=l.toLowerCase()),l}return t.extend=function(n){Object.assign(e,n)},t}))},"94e6":function(e,n,t){},9944:function(e,n,t){"use strict";t.d(n,"a",(function(){return c})),t.d(n,"g",(function(){return r})),t.d(n,"c",(function(){return l})),t.d(n,"e",(function(){return i})),t.d(n,"d",(function(){return u})),t.d(n,"f",(function(){return s})),t.d(n,"b",(function(){return d}));t("d3b7"),t("ac1f"),t("1276"),t("d81d"),t("159b"),t("fb6a"),t("5319"),t("a15b"),t("b64b");var o=t("3666"),a=t.n(o),c=function(e){var n=new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(e);return n},r=function(e){return e.replace(/\w\S*/g,(function(e){return e.charAt(0).toUpperCase()+e.substr(1).toLowerCase()}))},l=function(e,n){10==e.length&&(e+="T00:00:00");var t=new Date(e);return t.toLocaleString("en-us",{day:n})},i=function(e,n){10==e.length&&(e+="T00:00:00");var t=new Date(e);return t.toLocaleString("en-us",{month:n,timeZone:"America/New_York"})},u=function(e){10==e.length&&(e+="T00:00:00");var n=new Date(e),t={weekday:"long",year:"numeric",month:"long",day:"numeric"};return n.toLocaleString("en-US",t)},s=function(e){10==e.length&&(e+="T00:00:00");var n=new Date(e);return n.toLocaleString("en-us",{year:"numeric"})},d=function(e){return a()(e,{lower:!0,remove:/[$*_+~.()'"!\:@,?]/g}).replace("-and-","-")}},c68d:function(e,n,t){"use strict";t.d(n,"a",(function(){return b}));t("d3b7"),t("3ca3"),t("ddb0");var o=function(){return t.e("TextBlock").then(t.bind(null,"30d2"))},a=function(){return t.e("TabsBlock").then(t.bind(null,"712c"))},c=function(){return t.e("ContentBlock").then(t.bind(null,"7d38"))},r=function(){return t.e("ListBlock").then(t.bind(null,"b134"))},l=function(){return t.e("TableBlock").then(t.bind(null,"6229"))},i=function(){return t.e("CodeBlock").then(t.bind(null,"11d9"))},u=function(){return t.e("ImageBlock").then(t.bind(null,"c7d7"))},s=function(){return t.e("CardBlock").then(t.bind(null,"f8bd"))},d=function(){return t.e("CollectionBlock").then(t.bind(null,"1ae4"))},f=function(){return t.e("HorizontalRuleBlock").then(t.bind(null,"77ae"))},h=function(){return t.e("ExpansionPanelBlock").then(t.bind(null,"afb5"))},b={data:function(){return{content:[]}},props:{blockContent:[Array,Object]},components:{TextBlock:o,TabsBlock:a,ListBlock:r,TableBlock:l,CodeBlock:i,ImageBlock:u,ContentBlock:c,CardBlock:s,CollectionBlock:d,HorizontalRuleBlock:f,ExpansionPanelBlock:h},created:function(){},methods:{pageBlock:function(e){var n;switch(e){case"tab_blocks":n=a;break;case"content_blocks":n=c;break;case"card_blocks":n=s;break;case"header":case"paragraph":n=o;break;case"list":n=r;break;case"table":n=l;break;case"code":n=i;break;case"image":n=u;break;case"collection":n=d;break;case"horizontalrule":n=f;break;case"expansion_panels":n=h;break;default:console.warn("pageBlock not found!",e),n=c;break}return n}},computed:{}}}}]);
//# sourceMappingURL=LayoutBlock.0fa437be.js.map