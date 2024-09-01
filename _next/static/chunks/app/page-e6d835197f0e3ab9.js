(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[931],{1093:function(e,t,s){Promise.resolve().then(s.bind(s,8192))},8192:function(e,t,s){"use strict";s.r(t),s.d(t,{default:function(){return z}});var l=s(7437),a=s(2265),r=s(7138),n=s(8030);/**
 * @license lucide-react v0.435.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,n.Z)("Book",[["path",{d:"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20",key:"k3hazp"}]]),c=(0,n.Z)("MapPin",[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]),d=(0,n.Z)("ChartNoAxesColumn",[["line",{x1:"18",x2:"18",y1:"20",y2:"10",key:"1xfpm4"}],["line",{x1:"12",x2:"12",y1:"20",y2:"4",key:"be30l9"}],["line",{x1:"6",x2:"6",y1:"20",y2:"14",key:"1r4le6"}]]),x=(0,n.Z)("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]]);var o=s(861),h=s(495),m=s(996),u=e=>{let{className:t}=e;return(0,l.jsx)("header",{className:"bg-white text-gray-900 p-4 shadow-sm w-full z-50 ".concat(t),children:(0,l.jsxs)("div",{className:"container mx-auto flex justify-between items-center",children:[(0,l.jsxs)(r.default,{href:"/",className:"text-2xl font-bold flex items-center",children:[(0,l.jsx)(m.Z,{className:"mr-2 text-blue-600"}),(0,l.jsx)("span",{className:"font-sans tracking-wider",children:"Flight Training LMS"})]}),(0,l.jsxs)("nav",{className:"hidden md:flex space-x-6",children:[(0,l.jsx)(r.default,{href:"/",className:"hover:text-blue-600 transition-colors text-sm font-medium",children:"ホーム"}),(0,l.jsx)(r.default,{href:"/lms",className:"hover:text-blue-600 transition-colors text-sm font-medium",children:"LMS"}),(0,l.jsx)(r.default,{href:"/planner",className:"hover:text-blue-600 transition-colors text-sm font-medium",children:"飛行計画"})]}),(0,l.jsx)(r.default,{href:"/login",children:(0,l.jsx)(h.z,{className:"bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full shadow-md transition-all duration-300 ease-in-out",children:"ログイン"})})]})})},f=s(6463);let j=e=>{let{className:t,children:s}=e;return(0,l.jsx)("div",{className:"h-8 w-8 rounded-full ".concat(t),children:s})},g=e=>{let{src:t,alt:s}=e;return(0,l.jsx)("img",{src:t,alt:s,className:"h-8 w-8 rounded-full"})},b=e=>{let{children:t}=e;return(0,l.jsx)("div",{className:"h-8 w-8 rounded-full flex justify-center items-center",children:t})},p=e=>{let{children:t}=e,[s,r]=(0,a.useState)(!1);return(0,l.jsx)("div",{className:"relative inline-block text-left",children:a.Children.map(t,e=>a.isValidElement(e)?a.cloneElement(e,{isOpen:s,setIsOpen:r}):e)})},N=e=>{let{children:t,align:s,forceMount:a}=e;return(0,l.jsx)("div",{className:"absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 ".concat("end"===s?"origin-top-right right-0":"origin-top-left left-0"),children:(0,l.jsx)("div",{className:"py-1",role:"menu","aria-orientation":"vertical","aria-labelledby":"options-menu",children:t})})},v=e=>{let{children:t,onClick:s}=e;return(0,l.jsx)("a",{href:"#",className:"block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900",role:"menuitem",onClick:e=>{e.preventDefault(),s&&s()},children:t})},y=e=>{let{children:t,isOpen:s,setIsOpen:a}=e;return(0,l.jsxs)("div",{className:"dropdown-menu-trigger",onClick:()=>a&&a(!s),children:[t,s&&(0,l.jsx)("div",{className:"fixed inset-0 z-10",onClick:()=>a&&a(!1)})]})};var w=s(4392);let k=()=>({user:{name:"John Doe",email:"john@example.com",image:"/placeholder.svg?height=32&width=32"}});function M(){let{user:e}=k(),t=(0,f.useRouter)(),s=(0,w.createClientComponentClient)(),a=async()=>{await s.auth.signOut(),t.push("/")};return(0,l.jsx)("header",{className:"bg-white shadow-sm fixed w-full z-50",children:(0,l.jsxs)("div",{className:"container mx-auto px-4 py-4 flex justify-between items-center",children:[(0,l.jsxs)(r.default,{href:"/",className:"text-2xl font-bold flex items-center",children:[(0,l.jsx)(m.Z,{className:"mr-2 text-blue-600"}),(0,l.jsx)("span",{className:"font-sans tracking-wider",children:"Flight Training LMS"})]}),(0,l.jsx)("nav",{children:(0,l.jsxs)("ul",{className:"flex space-x-6",children:[(0,l.jsx)("li",{children:(0,l.jsx)(r.default,{href:"/",className:"text-gray-600 hover:text-blue-600",children:"ホーム"})}),(0,l.jsx)("li",{children:(0,l.jsx)(r.default,{href:"/lms",className:"text-gray-600 hover:text-blue-600",children:"LMS"})}),(0,l.jsx)("li",{children:(0,l.jsx)(r.default,{href:"/planner",className:"text-gray-600 hover:text-blue-600",children:"飛行計画"})})]})}),(0,l.jsxs)(p,{children:[(0,l.jsx)(y,{children:(0,l.jsx)(h.z,{className:"relative h-8 w-8 rounded-full",children:(0,l.jsxs)(j,{className:"h-8 w-8",children:[(0,l.jsx)(g,{src:e.image,alt:e.name}),(0,l.jsx)(b,{children:e.name.charAt(0)})]})})}),(0,l.jsxs)(N,{align:"end",forceMount:!0,children:[(0,l.jsxs)(v,{children:[(0,l.jsx)("div",{className:"font-medium",children:e.name}),(0,l.jsx)("div",{className:"text-xs text-gray-500",children:e.email})]}),(0,l.jsx)(v,{children:(0,l.jsx)(r.default,{href:"/profile",children:"プロフィール"})}),(0,l.jsx)(v,{children:(0,l.jsx)(r.default,{href:"/settings",children:"設定"})}),(0,l.jsx)(v,{children:(0,l.jsx)("button",{onClick:a,children:"ログアウト"})})]})]})]})})}var I=s(1810);s(8877);var C=s(1180);let S=e=>{let{children:t,className:s="",...a}=e;return(0,l.jsx)("button",{className:"bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full shadow-md transition-all duration-300 ease-in-out ".concat(s),...a,children:t})},Z=e=>{let{icon:t,title:s,description:a}=e;return(0,l.jsxs)("div",{className:"feature-card bg-white p-6 rounded-lg shadow-md",children:[t,(0,l.jsx)("h3",{className:"feature-card__title text-xl font-semibold mt-4 mb-2",children:s}),(0,l.jsx)("p",{className:"feature-card__description text-gray-600",children:a})]})};function z(){let[e,t]=(0,a.useState)(!1);return(0,a.useEffect)(()=>{(async()=>{let{data:{user:e}}=await C.O.auth.getUser();t(!!e)})();let{data:e}=C.O.auth.onAuthStateChange((e,s)=>{t(!!s)});return()=>{e.subscription.unsubscribe()}},[C.O.auth]),(0,l.jsxs)("div",{className:"flex flex-col min-h-screen bg-white text-gray-900",children:[(0,l.jsx)("div",{className:"sticky top-0 z-50 w-full",children:e?(0,l.jsx)(M,{}):(0,l.jsx)(u,{})}),(0,l.jsx)(o.Z,{children:(0,l.jsxs)("main",{className:"flex-grow pt-16",children:[(0,l.jsxs)("div",{className:"flex flex-col md:flex-row justify-center",children:[(0,l.jsx)(O,{image:"/f16.png",title:"Excellence in Flight",gradient:"to-r"}),(0,l.jsx)(O,{image:"/f2.png",title:"TECHで最高の学びを",subtitle:"ともに学び、成長するためのパイロットのコミュニティー",gradient:"to-l"})]}),(0,l.jsx)("section",{className:"py-20 bg-gray-50",children:(0,l.jsxs)("div",{className:"container mx-auto px-4",children:[(0,l.jsx)("h2",{className:"text-3xl font-bold mb-12 text-center",children:"Feature"}),(0,l.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8",children:[(0,l.jsx)(Z,{icon:(0,l.jsx)(i,{}),title:"LMS（学習管理システム）",description:"個人最適化された学習で、理論を効率的に習得"}),(0,l.jsx)(Z,{icon:(0,l.jsx)(c,{}),title:"飛行計画システム",description:"ＧＩＳ（地理情報システム）を活用した、効率的な飛行計画"}),(0,l.jsx)(Z,{icon:(0,l.jsx)(d,{}),title:"ダッシュボード",description:"個人パフォーマンスをリアルタイムで分析"}),(0,l.jsx)(Z,{icon:(0,l.jsx)(x,{}),title:"コミュニティ",description:"パイロット間の交流"})]})]})}),(0,l.jsx)("section",{className:"py-20",children:(0,l.jsx)("div",{className:"container mx-auto px-4 flex flex-col md:flex-row items-center",children:(0,l.jsxs)("div",{className:"md:w-1/2 mb-8 md:mb-0 md:pr-12",children:[(0,l.jsx)("h2",{className:"text-3xl font-bold mb-6",children:"LMS"}),(0,l.jsxs)("p",{className:"mb-6 text-gray-600",children:["最新の学習理論を取り入れた学習管理で、あなたの学習体験を変革します。",(0,l.jsx)("br",{}),"あなたの回答データを分析してダッシュボードに表示するとともに、いつ、何を学習すべきなのかを学習理論に基づいて最適なタイミングで提案します。"]}),(0,l.jsx)(S,{children:"機能を体験する"})]})})}),(0,l.jsx)("section",{className:"py-20 bg-gray-50",children:(0,l.jsx)("div",{className:"container mx-auto px-4 flex flex-col md:flex-row-reverse items-center",children:(0,l.jsxs)("div",{className:"md:w-1/2 mb-8 md:mb-0 md:pl-12",children:[(0,l.jsx)("h2",{className:"text-3xl font-bold mb-6",children:"飛行計画システム"}),(0,l.jsxs)("p",{className:"mb-6 text-gray-600",children:["ＧＩＳを駆使し、直感的な操作で飛行計画の作成をサポートします。",(0,l.jsx)("br",{}),"気象データ、ウェイポイント、飛行場情報などを統合し、最適な計画を効率的に立案できます。"]}),(0,l.jsx)(S,{children:"機能を体験する"})]})})}),(0,l.jsx)("section",{className:"py-20 bg-blue-600 text-white",children:(0,l.jsxs)("div",{className:"container mx-auto px-4 text-center",children:[(0,l.jsx)("h2",{className:"text-3xl font-bold mb-6",children:"さあ、ともに夢への第一歩を踏み出そう"}),(0,l.jsx)(r.default,{href:"/signup",children:(0,l.jsx)(S,{className:"bg-white text-blue-600 hover:bg-gray-100 hover:text-blue-700",children:"登録する"})})]})})]})}),(0,l.jsx)(I.Z,{className:"footer"})]})}let O=e=>{let{image:t,title:s,subtitle:a,gradient:r}=e;return(0,l.jsxs)("section",{className:"w-full md:w-1/2 h-[50vh] md:h-screen bg-cover bg-center relative overflow-hidden group",children:[(0,l.jsx)("div",{className:"absolute inset-0 bg-cover bg-center transition-transform duration-10000 ease-in-out group-hover:scale-110",style:{backgroundImage:"url('".concat(t,"')")}}),(0,l.jsx)("div",{className:"absolute inset-0 bg-gradient-".concat(r," from-black via-black/90 to-transparent opacity-80")}),(0,l.jsx)("div",{className:"absolute inset-0 flex items-center justify-center",children:(0,l.jsxs)("div",{className:"text-center",children:[(0,l.jsx)("h2",{className:"text-4xl font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500",children:s}),a&&(0,l.jsx)("p",{className:"text-xl mt-4 max-w-2xl mx-auto text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500",children:a})]})})]})}},1810:function(e,t,s){"use strict";var l=s(7437);t.Z=e=>{let{className:t,...s}=e;return(0,l.jsx)("footer",{className:"bg-gray-50 py-6 px-4 text-center",children:(0,l.jsx)("p",{className:"text-gray-600",children:"\xa9 2024 Flight Training LMS. All rights reserved."})})}},861:function(e,t,s){"use strict";s.d(t,{Z:function(){return n}});var l=s(7437),a=s(7138);function r(){return(0,l.jsx)("nav",{className:"bg-blue-500 text-white p-4",children:(0,l.jsxs)("div",{className:"container mx-auto flex justify-between items-center",children:[(0,l.jsx)(a.default,{href:"/",className:"text-2xl font-bold",children:"Flight LMS"}),(0,l.jsxs)("ul",{className:"flex space-x-4",children:[(0,l.jsx)("li",{children:(0,l.jsx)(a.default,{href:"/",className:"hover:underline",children:"Home"})}),(0,l.jsx)("li",{children:(0,l.jsx)(a.default,{href:"/lms",className:"hover:underline",children:"LMS Dashboard"})})]})]})})}function n(e){let{children:t}=e;return(0,l.jsxs)("div",{className:"min-h-screen bg-gray-100",children:[(0,l.jsx)(r,{}),(0,l.jsx)("main",{className:"container mx-auto px-4 py-8",children:t})]})}},495:function(e,t,s){"use strict";s.d(t,{z:function(){return a}});var l=s(7437);s(2265);let a=e=>{let{children:t,...s}=e;return(0,l.jsx)("button",{...s,children:t})}},1180:function(e,t,s){"use strict";s.d(t,{O:function(){return n}});var l=s(4593);let a="https://fstynltdfdetpyvbrswr.supabase.co",r="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzdHlubHRkZmRldHB5dmJyc3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM1MzI1ODcsImV4cCI6MjAzOTEwODU4N30.vzbj7_IjPZPBhJPUHvYLTONpOySASM8npaZIvwUXVG8";if(!a||!r)throw Error("Missing Supabase environment variables");let n=(0,l.eI)(a,r)},8877:function(){}},function(e){e.O(0,[404,593,845,392,971,23,744],function(){return e(e.s=1093)}),_N_E=e.O()}]);