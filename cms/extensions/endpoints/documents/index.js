"use strict";const e=require("node-fetch"),o=require("fs"),t=async(t,s)=>{console.log("------------------------------------------------------------------------------------"),console.log("                                                                    "),console.log("url:  ",s),console.log("                                                                    "),console.log("------------------------------------------------------------------------------------");let c=((e,t)=>new Promise(((s,c)=>{const n=o.createWriteStream(t);e.pipe(n).on("finish",s).on("error",c)})))((await e(s)).body,t);return c};module.exports=(e,{services:o,exceptions:s})=>{const{ItemsService:c}=o,{ServiceUnavailableException:n}=s;e.get("/:file",((e,o,s)=>{const r=new c("links",{schema:e.schema,accountability:e.accountability}),a=e.params.file;r.readByQuery({fields:["*"],filter:{target:{_eq:a}}}).then((async e=>{const s="/tmp/"+a,c=e[0].url;return await t(s,"https://dev-onrr-cms.app.cloud.gov"+c),o.download(s)})).catch((e=>s(new n(e.message))))}))};