"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[392],{4392:function(e,t,r){var i,o=Object.defineProperty,n=Object.getOwnPropertyDescriptor,s=Object.getOwnPropertyNames,a=Object.prototype.hasOwnProperty,l={};((e,t)=>{for(var r in t)o(e,r,{get:t[r],enumerable:!0})})(l,{createBrowserSupabaseClient:()=>_,createClientComponentClient:()=>c,createMiddlewareClient:()=>C,createMiddlewareSupabaseClient:()=>j,createPagesBrowserClient:()=>p,createPagesServerClient:()=>I,createRouteHandlerClient:()=>w,createServerActionClient:()=>A,createServerComponentClient:()=>k,createServerSupabaseClient:()=>J}),e.exports=((e,t,r,i)=>{if(t&&"object"==typeof t||"function"==typeof t)for(let r of s(t))a.call(e,r)||void 0===r||o(e,r,{get:()=>t[r],enumerable:!(i=n(t,r))||i.enumerable});return e})(o({},"__esModule",{value:!0}),l);var u=r(7419);function c({supabaseUrl:e="https://fstynltdfdetpyvbrswr.supabase.co",supabaseKey:t="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzdHlubHRkZmRldHB5dmJyc3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM1MzI1ODcsImV4cCI6MjAzOTEwODU4N30.vzbj7_IjPZPBhJPUHvYLTONpOySASM8npaZIvwUXVG8",options:r,cookieOptions:o,isSingleton:n=!0}={}){if(!e||!t)throw Error("either NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables or supabaseUrl and supabaseKey are required!");let s=()=>{var i;return(0,u.createSupabaseClient)(e,t,{...r,global:{...null==r?void 0:r.global,headers:{...null==(i=null==r?void 0:r.global)?void 0:i.headers,"X-Client-Info":"@supabase/auth-helpers-nextjs@0.10.0"}},auth:{storage:new u.BrowserCookieAuthStorageAdapter(o)}})};if(n){let e=i??s();return"undefined"==typeof window?e:(i||(i=e),i)}return s()}var p=c,d=r(7419),h=r(148),f=class extends d.CookieAuthStorageAdapter{constructor(e,t){super(t),this.context=e}getCookie(e){var t,r,i;return(0,h.splitCookiesString)((null==(r=null==(t=this.context.res)?void 0:t.getHeader("set-cookie"))?void 0:r.toString())??"").map(t=>(0,d.parseCookies)(t)[e]).find(e=>!!e)??(null==(i=this.context.req)?void 0:i.cookies[e])}setCookie(e,t){this._setCookie(e,t)}deleteCookie(e){this._setCookie(e,"",{maxAge:0})}_setCookie(e,t,r){var i;let o=(0,h.splitCookiesString)((null==(i=this.context.res.getHeader("set-cookie"))?void 0:i.toString())??"").filter(t=>!(e in(0,d.parseCookies)(t))),n=(0,d.serializeCookie)(e,t,{...this.cookieOptions,...r,httpOnly:!1});this.context.res.setHeader("set-cookie",[...o,n])}};function I(e,{supabaseUrl:t="https://fstynltdfdetpyvbrswr.supabase.co",supabaseKey:r="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzdHlubHRkZmRldHB5dmJyc3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM1MzI1ODcsImV4cCI6MjAzOTEwODU4N30.vzbj7_IjPZPBhJPUHvYLTONpOySASM8npaZIvwUXVG8",options:i,cookieOptions:o}={}){var n;if(!t||!r)throw Error("either NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables or supabaseUrl and supabaseKey are required!");return(0,d.createSupabaseClient)(t,r,{...i,global:{...null==i?void 0:i.global,headers:{...null==(n=null==i?void 0:i.global)?void 0:n.headers,"X-Client-Info":"@supabase/auth-helpers-nextjs@0.10.0"}},auth:{storage:new f(e,o)}})}var v=r(7419),m=r(148),b=class extends v.CookieAuthStorageAdapter{constructor(e,t){super(t),this.context=e}getCookie(e){var t;return(0,m.splitCookiesString)((null==(t=this.context.res.headers.get("set-cookie"))?void 0:t.toString())??"").map(t=>(0,v.parseCookies)(t)[e]).find(e=>!!e)||(0,v.parseCookies)(this.context.req.headers.get("cookie")??"")[e]}setCookie(e,t){this._setCookie(e,t)}deleteCookie(e){this._setCookie(e,"",{maxAge:0})}_setCookie(e,t,r){let i=(0,v.serializeCookie)(e,t,{...this.cookieOptions,...r,httpOnly:!1});this.context.res.headers&&this.context.res.headers.append("set-cookie",i)}};function C(e,{supabaseUrl:t="https://fstynltdfdetpyvbrswr.supabase.co",supabaseKey:r="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzdHlubHRkZmRldHB5dmJyc3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM1MzI1ODcsImV4cCI6MjAzOTEwODU4N30.vzbj7_IjPZPBhJPUHvYLTONpOySASM8npaZIvwUXVG8",options:i,cookieOptions:o}={}){var n;if(!t||!r)throw Error("either NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables or supabaseUrl and supabaseKey are required!");return(0,v.createSupabaseClient)(t,r,{...i,global:{...null==i?void 0:i.global,headers:{...null==(n=null==i?void 0:i.global)?void 0:n.headers,"X-Client-Info":"@supabase/auth-helpers-nextjs@0.10.0"}},auth:{storage:new b(e,o)}})}var g=r(7419),y=class extends g.CookieAuthStorageAdapter{constructor(e,t){super(t),this.context=e,this.isServer=!0}getCookie(e){var t;return null==(t=this.context.cookies().get(e))?void 0:t.value}setCookie(e,t){}deleteCookie(e){}};function k(e,{supabaseUrl:t="https://fstynltdfdetpyvbrswr.supabase.co",supabaseKey:r="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzdHlubHRkZmRldHB5dmJyc3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM1MzI1ODcsImV4cCI6MjAzOTEwODU4N30.vzbj7_IjPZPBhJPUHvYLTONpOySASM8npaZIvwUXVG8",options:i,cookieOptions:o}={}){var n;if(!t||!r)throw Error("either NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables or supabaseUrl and supabaseKey are required!");return(0,g.createSupabaseClient)(t,r,{...i,global:{...null==i?void 0:i.global,headers:{...null==(n=null==i?void 0:i.global)?void 0:n.headers,"X-Client-Info":"@supabase/auth-helpers-nextjs@0.10.0"}},auth:{storage:new y(e,o)}})}var S=r(7419),O=class extends S.CookieAuthStorageAdapter{constructor(e,t){super(t),this.context=e}getCookie(e){var t;return null==(t=this.context.cookies().get(e))?void 0:t.value}setCookie(e,t){this.context.cookies().set(e,t,this.cookieOptions)}deleteCookie(e){this.context.cookies().set(e,"",{...this.cookieOptions,maxAge:0})}};function w(e,{supabaseUrl:t="https://fstynltdfdetpyvbrswr.supabase.co",supabaseKey:r="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzdHlubHRkZmRldHB5dmJyc3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM1MzI1ODcsImV4cCI6MjAzOTEwODU4N30.vzbj7_IjPZPBhJPUHvYLTONpOySASM8npaZIvwUXVG8",options:i,cookieOptions:o}={}){var n;if(!t||!r)throw Error("either NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables or supabaseUrl and supabaseKey are required!");return(0,S.createSupabaseClient)(t,r,{...i,global:{...null==i?void 0:i.global,headers:{...null==(n=null==i?void 0:i.global)?void 0:n.headers,"X-Client-Info":"@supabase/auth-helpers-nextjs@0.10.0"}},auth:{storage:new O(e,o)}})}var A=w;function _({supabaseUrl:e="https://fstynltdfdetpyvbrswr.supabase.co",supabaseKey:t="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzdHlubHRkZmRldHB5dmJyc3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM1MzI1ODcsImV4cCI6MjAzOTEwODU4N30.vzbj7_IjPZPBhJPUHvYLTONpOySASM8npaZIvwUXVG8",options:r,cookieOptions:i}={}){return console.warn("Please utilize the `createPagesBrowserClient` function instead of the deprecated `createBrowserSupabaseClient` function. Learn more: https://supabase.com/docs/guides/auth/auth-helpers/nextjs-pages"),p({supabaseUrl:e,supabaseKey:t,options:r,cookieOptions:i})}function J(e,{supabaseUrl:t="https://fstynltdfdetpyvbrswr.supabase.co",supabaseKey:r="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzdHlubHRkZmRldHB5dmJyc3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM1MzI1ODcsImV4cCI6MjAzOTEwODU4N30.vzbj7_IjPZPBhJPUHvYLTONpOySASM8npaZIvwUXVG8",options:i,cookieOptions:o}={}){return console.warn("Please utilize the `createPagesServerClient` function instead of the deprecated `createServerSupabaseClient` function. Learn more: https://supabase.com/docs/guides/auth/auth-helpers/nextjs-pages"),I(e,{supabaseUrl:t,supabaseKey:r,options:i,cookieOptions:o})}function j(e,{supabaseUrl:t="https://fstynltdfdetpyvbrswr.supabase.co",supabaseKey:r="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzdHlubHRkZmRldHB5dmJyc3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM1MzI1ODcsImV4cCI6MjAzOTEwODU4N30.vzbj7_IjPZPBhJPUHvYLTONpOySASM8npaZIvwUXVG8",options:i,cookieOptions:o}={}){return console.warn("Please utilize the `createMiddlewareClient` function instead of the deprecated `createMiddlewareSupabaseClient` function. Learn more: https://supabase.com/docs/guides/auth/auth-helpers/nextjs#middleware"),C(e,{supabaseUrl:t,supabaseKey:r,options:i,cookieOptions:o})}},148:function(e){var t={decodeValues:!0,map:!1,silent:!1};function r(e){return"string"==typeof e&&!!e.trim()}function i(e,i){var o,n,s,a,l=e.split(";").filter(r),u=(o=l.shift(),n="",s="",(a=o.split("=")).length>1?(n=a.shift(),s=a.join("=")):s=o,{name:n,value:s}),c=u.name,p=u.value;i=i?Object.assign({},t,i):t;try{p=i.decodeValues?decodeURIComponent(p):p}catch(e){console.error("set-cookie-parser encountered an error while decoding a cookie with value '"+p+"'. Set options.decodeValues to false to disable this feature.",e)}var d={name:c,value:p};return l.forEach(function(e){var t=e.split("="),r=t.shift().trimLeft().toLowerCase(),i=t.join("=");"expires"===r?d.expires=new Date(i):"max-age"===r?d.maxAge=parseInt(i,10):"secure"===r?d.secure=!0:"httponly"===r?d.httpOnly=!0:"samesite"===r?d.sameSite=i:"partitioned"===r?d.partitioned=!0:d[r]=i}),d}function o(e,o){if(o=o?Object.assign({},t,o):t,!e)return o.map?{}:[];if(e.headers){if("function"==typeof e.headers.getSetCookie)e=e.headers.getSetCookie();else if(e.headers["set-cookie"])e=e.headers["set-cookie"];else{var n=e.headers[Object.keys(e.headers).find(function(e){return"set-cookie"===e.toLowerCase()})];n||!e.headers.cookie||o.silent||console.warn("Warning: set-cookie-parser appears to have been called on a request object. It is designed to parse Set-Cookie headers from responses, not Cookie headers from requests. Set the option {silent: true} to suppress this warning."),e=n}}return(Array.isArray(e)||(e=[e]),(o=o?Object.assign({},t,o):t).map)?e.filter(r).reduce(function(e,t){var r=i(t,o);return e[r.name]=r,e},{}):e.filter(r).map(function(e){return i(e,o)})}e.exports=o,e.exports.parse=o,e.exports.parseString=i,e.exports.splitCookiesString=function(e){if(Array.isArray(e))return e;if("string"!=typeof e)return[];var t,r,i,o,n,s=[],a=0;function l(){for(;a<e.length&&/\s/.test(e.charAt(a));)a+=1;return a<e.length}for(;a<e.length;){for(t=a,n=!1;l();)if(","===(r=e.charAt(a))){for(i=a,a+=1,l(),o=a;a<e.length&&"="!==(r=e.charAt(a))&&";"!==r&&","!==r;)a+=1;a<e.length&&"="===e.charAt(a)?(n=!0,a=o,s.push(e.substring(t,i)),t=a):a=i+1}else a+=1;(!n||a>=e.length)&&s.push(e.substring(t,e.length))}return s}},7419:function(e,t,r){let i,o;r.r(t),r.d(t,{BrowserCookieAuthStorageAdapter:function(){return A},CookieAuthStorageAdapter:function(){return w},DEFAULT_COOKIE_OPTIONS:function(){return S},createSupabaseClient:function(){return _},isBrowser:function(){return k},parseCookies:function(){return J},parseSupabaseCookie:function(){return g},serializeCookie:function(){return j},stringifySupabaseSession:function(){return y}}),new TextEncoder;let n=new TextDecoder,s=e=>{let t=atob(e),r=new Uint8Array(t.length);for(let e=0;e<t.length;e++)r[e]=t.charCodeAt(e);return r},a=e=>{let t=e;t instanceof Uint8Array&&(t=n.decode(t)),t=t.replace(/-/g,"+").replace(/_/g,"/").replace(/\s/g,"");try{return s(t)}catch(e){throw TypeError("The input to be decoded is not correctly encoded.")}};var l=r(4593),u=Object.create,c=Object.defineProperty,p=Object.getOwnPropertyDescriptor,d=Object.getOwnPropertyNames,h=Object.getPrototypeOf,f=Object.prototype.hasOwnProperty,I=(e,t,r,i)=>{if(t&&"object"==typeof t||"function"==typeof t)for(let o of d(t))f.call(e,o)||o===r||c(e,o,{get:()=>t[o],enumerable:!(i=p(t,o))||i.enumerable});return e},v=(e,t,r)=>(r=null!=e?u(h(e)):{},I(!t&&e&&e.__esModule?r:c(r,"default",{value:e,enumerable:!0}),e)),m=(i={"../../node_modules/.pnpm/cookie@0.5.0/node_modules/cookie/index.js"(e){e.parse=function(e,t){if("string"!=typeof e)throw TypeError("argument str must be a string");for(var r={},o=(t||{}).decode||i,n=0;n<e.length;){var s=e.indexOf("=",n);if(-1===s)break;var a=e.indexOf(";",n);if(-1===a)a=e.length;else if(a<s){n=e.lastIndexOf(";",s-1)+1;continue}var l=e.slice(n,s).trim();if(void 0===r[l]){var u=e.slice(s+1,a).trim();34===u.charCodeAt(0)&&(u=u.slice(1,-1)),r[l]=function(e,t){try{return t(e)}catch(t){return e}}(u,o)}n=a+1}return r},e.serialize=function(e,i,n){var s=n||{},a=s.encode||o;if("function"!=typeof a)throw TypeError("option encode is invalid");if(!r.test(e))throw TypeError("argument name is invalid");var l=a(i);if(l&&!r.test(l))throw TypeError("argument val is invalid");var u=e+"="+l;if(null!=s.maxAge){var c=s.maxAge-0;if(isNaN(c)||!isFinite(c))throw TypeError("option maxAge is invalid");u+="; Max-Age="+Math.floor(c)}if(s.domain){if(!r.test(s.domain))throw TypeError("option domain is invalid");u+="; Domain="+s.domain}if(s.path){if(!r.test(s.path))throw TypeError("option path is invalid");u+="; Path="+s.path}if(s.expires){var p=s.expires;if("[object Date]"!==t.call(p)&&!(p instanceof Date)||isNaN(p.valueOf()))throw TypeError("option expires is invalid");u+="; Expires="+p.toUTCString()}if(s.httpOnly&&(u+="; HttpOnly"),s.secure&&(u+="; Secure"),s.priority)switch("string"==typeof s.priority?s.priority.toLowerCase():s.priority){case"low":u+="; Priority=Low";break;case"medium":u+="; Priority=Medium";break;case"high":u+="; Priority=High";break;default:throw TypeError("option priority is invalid")}if(s.sameSite)switch("string"==typeof s.sameSite?s.sameSite.toLowerCase():s.sameSite){case!0:case"strict":u+="; SameSite=Strict";break;case"lax":u+="; SameSite=Lax";break;case"none":u+="; SameSite=None";break;default:throw TypeError("option sameSite is invalid")}return u};var t=Object.prototype.toString,r=/^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;function i(e){return -1!==e.indexOf("%")?decodeURIComponent(e):e}function o(e){return encodeURIComponent(e)}}},function(){return o||(0,i[d(i)[0]])((o={exports:{}}).exports,o),o.exports}),b=v(m()),C=v(m());function g(e){if(!e)return null;try{let t=JSON.parse(e);if(!t)return null;if("Object"===t.constructor.name)return t;if("Array"!==t.constructor.name)throw Error(`Unexpected format: ${t.constructor.name}`);let[r,i,o]=t[0].split("."),n=a(i),s=new TextDecoder,{exp:l,sub:u,...c}=JSON.parse(s.decode(n));return{expires_at:l,expires_in:l-Math.round(Date.now()/1e3),token_type:"bearer",access_token:t[0],refresh_token:t[1],provider_token:t[2],provider_refresh_token:t[3],user:{id:u,factors:t[4],...c}}}catch(e){return console.warn("Failed to parse cookie string:",e),null}}function y(e){var t;return JSON.stringify([e.access_token,e.refresh_token,e.provider_token,e.provider_refresh_token,(null==(t=e.user)?void 0:t.factors)??null])}function k(){return"undefined"!=typeof window&&void 0!==window.document}var S={path:"/",sameSite:"lax",maxAge:31536e6},O=RegExp(".{1,3180}","g"),w=class{constructor(e){this.cookieOptions={...S,...e,maxAge:S.maxAge}}getItem(e){let t=this.getCookie(e);if(e.endsWith("-code-verifier")&&t)return t;if(t)return JSON.stringify(g(t));let r=function(e,t=()=>null){let r=[];for(let i=0;;i++){let o=t(`${e}.${i}`);if(!o)break;r.push(o)}return r.length?r.join(""):null}(e,e=>this.getCookie(e));return null!==r?JSON.stringify(g(r)):null}setItem(e,t){if(e.endsWith("-code-verifier")){this.setCookie(e,t);return}(function(e,t,r){if(1===Math.ceil(t.length/((void 0)??3180)))return[{name:e,value:t}];let i=[],o=t.match(O);return null==o||o.forEach((t,r)=>{let o=`${e}.${r}`;i.push({name:o,value:t})}),i})(e,y(JSON.parse(t))).forEach(e=>{this.setCookie(e.name,e.value)})}removeItem(e){this._deleteSingleCookie(e),this._deleteChunkedCookies(e)}_deleteSingleCookie(e){this.getCookie(e)&&this.deleteCookie(e)}_deleteChunkedCookies(e,t=0){for(let r=t;;r++){let t=`${e}.${r}`;if(void 0===this.getCookie(t))break;this.deleteCookie(t)}}},A=class extends w{constructor(e){super(e)}getCookie(e){return k()?(0,b.parse)(document.cookie)[e]:null}setCookie(e,t){if(!k())return null;document.cookie=(0,b.serialize)(e,t,{...this.cookieOptions,httpOnly:!1})}deleteCookie(e){if(!k())return null;document.cookie=(0,b.serialize)(e,"",{...this.cookieOptions,maxAge:0,httpOnly:!1})}};function _(e,t,r){var i;let o=k();return(0,l.eI)(e,t,{...r,auth:{flowType:"pkce",autoRefreshToken:o,detectSessionInUrl:o,persistSession:!0,storage:r.auth.storage,...(null==(i=r.auth)?void 0:i.storageKey)?{storageKey:r.auth.storageKey}:{}}})}var J=C.parse,j=C.serialize;/*! Bundled license information:

cookie/index.js:
  (*!
   * cookie
   * Copyright(c) 2012-2014 Roman Shtylman
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   *)
*/}}]);