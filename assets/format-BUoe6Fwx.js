function e(t){if(!t)return"";const r=new Date(t);return Number.isNaN(r.getTime())?String(t):r.toLocaleDateString("ru-RU",{day:"2-digit",month:"long",year:"numeric"})}function i(t){return String(t||"").split(`
`).map(r=>r.trim()).filter(Boolean)}function a(t,r=120){const n=String(t||"");return n.length<=r?n:`${n.slice(0,r-1)}…`}export{e as f,i as p,a as s};
