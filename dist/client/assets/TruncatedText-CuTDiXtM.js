import{c as l}from"./fetch-9mPfvwwg.js";import{a as t,j as r}from"./main-C4lR1p4u.js";import{b as u,c as d,d as p,e as f}from"./tooltip-Q7iY_GKJ.js";/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=[["path",{d:"M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z",key:"sc7q7i"}]],j=l("funnel",m),b=({text:s})=>{const e=t.useRef(null),[a,i]=t.useState(!1);t.useLayoutEffect(()=>{if(!e.current)return;const c=()=>{e.current&&i(e.current.scrollWidth>e.current.offsetWidth)};c();const o=new ResizeObserver(c);return o.observe(e.current),()=>o.disconnect()},[s]);const n=r.jsx("span",{ref:e,className:"text-sm truncate max-w-52 cursor-default inline-block align-middle",children:s});return a?r.jsx(u,{children:r.jsxs(d,{children:[r.jsx(p,{asChild:!0,children:n}),r.jsx(f,{side:"top",children:r.jsx("p",{className:"capitalize",children:s})})]})}):n};export{j as F,b as T};
