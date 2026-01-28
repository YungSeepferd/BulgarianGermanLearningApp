const s={tick:s=>requestAnimationFrame(s),now:()=>performance.now(),tasks:new Set};function t(){const e=s.now();s.tasks.forEach(t=>{t.c(e)||(s.tasks.delete(t),t.f())}),0!==s.tasks.size&&s.tick(t)}function e(e){let a;return 0===s.tasks.size&&s.tick(t),{promise:new Promise(t=>{s.tasks.add(a={c:e,f:t})}),abort(){s.tasks.delete(a)}}}export{e as l,s as r};
//# sourceMappingURL=DhgH0pN2.js.map
