"use strict";const e=require("node-fetch"),s=require("fs"),o=async(o,t)=>{console.log("------------------------------------------------------------------------------------"),console.log("                                                                    "),console.log("url:  ",t),console.log("                                                                    "),console.log("------------------------------------------------------------------------------------");let c=((e,o)=>new Promise(((t,c)=>{const n=s.createWriteStream(o);e.pipe(n).on("finish",t).on("error",c)})))((await e(t)).body,o);return c};module.exports=(e,{services:s,exceptions:t})=>{const{ItemsService:c}=s,{ServiceUnavailableException:n}=t;e.get("/:file",((e,s,t)=>{const i=new c("links",{schema:e.schema,accountability:e.accountability}),r=e.params.file;i.readByQuery({fields:["*"],filter:{target:{_eq:r}}}).then((async e=>{const t="/tmp/"+r,c="/assets/"+e[0].directus_files_id;return await o(t,"https://dev-onrr-cms.app.cloud.gov"+c),s.sendFile(t)})).catch((e=>t(new n(e.message))))}))};