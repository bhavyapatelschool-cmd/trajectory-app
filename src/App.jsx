import { useState, useRef, useEffect, useCallback } from "react";

// ─── THEMES ──────────────────────────────────────────────────────────────────
const THEMES = {
  dark:     { bg:"#0c0c0c",sidebar:"#111",surface:"#181818",surface2:"#1e1e1e",border:"rgba(255,255,255,0.07)",borderH:"rgba(255,255,255,0.13)",text:"rgba(255,255,255,0.87)",text2:"rgba(255,255,255,0.42)",text3:"rgba(255,255,255,0.22)",blue:"#5b8ef0",blueBg:"rgba(91,142,240,0.1)",blueBd:"rgba(91,142,240,0.22)",ac:"rgba(255,255,255,0.05)",acH:"rgba(255,255,255,0.08)" },
  midnight: { bg:"#060810",sidebar:"#0a0d16",surface:"#10141f",surface2:"#151a27",border:"rgba(100,140,255,0.1)",borderH:"rgba(100,140,255,0.2)",text:"rgba(220,230,255,0.87)",text2:"rgba(160,180,230,0.45)",text3:"rgba(120,140,200,0.28)",blue:"#7b9fff",blueBg:"rgba(123,159,255,0.1)",blueBd:"rgba(123,159,255,0.22)",ac:"rgba(100,140,255,0.05)",acH:"rgba(100,140,255,0.09)" },
  ash:      { bg:"#141414",sidebar:"#1a1a1a",surface:"#222",surface2:"#282828",border:"rgba(255,255,255,0.08)",borderH:"rgba(255,255,255,0.15)",text:"rgba(245,240,235,0.88)",text2:"rgba(200,190,180,0.45)",text3:"rgba(160,150,140,0.28)",blue:"#d4a96a",blueBg:"rgba(212,169,106,0.1)",blueBd:"rgba(212,169,106,0.22)",ac:"rgba(255,240,220,0.04)",acH:"rgba(255,240,220,0.07)" },
  light:    { bg:"#f8f8f8",sidebar:"#f2f2f2",surface:"#fff",surface2:"#f5f5f5",border:"rgba(0,0,0,0.08)",borderH:"rgba(0,0,0,0.15)",text:"rgba(0,0,0,0.85)",text2:"rgba(0,0,0,0.45)",text3:"rgba(0,0,0,0.28)",blue:"#3b6ff0",blueBg:"rgba(59,111,240,0.08)",blueBd:"rgba(59,111,240,0.2)",ac:"rgba(0,0,0,0.04)",acH:"rgba(0,0,0,0.07)" },
  forest:   { bg:"#0d1210",sidebar:"#111a14",surface:"#161f18",surface2:"#1c2820",border:"rgba(100,200,130,0.08)",borderH:"rgba(100,200,130,0.16)",text:"rgba(220,240,225,0.87)",text2:"rgba(150,190,160,0.5)",text3:"rgba(100,150,115,0.35)",blue:"#5ec97a",blueBg:"rgba(94,201,122,0.1)",blueBd:"rgba(94,201,122,0.2)",ac:"rgba(100,200,130,0.04)",acH:"rgba(100,200,130,0.08)" },
};

// UPDATED MODELS WITH WORKING GROQ MODEL NAMES
const MODELS = [
  { id:"traj1", label:"Traj 1", desc:"Fast · Efficient",  api:"llama-3.1-8b-instant", costMult:0.5 },
  { id:"traj2", label:"Traj 2", desc:"Balanced · Smart",  api:"llama-3.3-70b-versatile",  costMult:1   },
  { id:"traj3", label:"Traj 3", desc:"Advanced · Deep",   api:"mixtral-8x7b-32768",    costMult:2.5 },
];

const LEVELS = [
  { n:"1", name:"Starter",    desc:"Direct answers, clear step-by-step explanations.",         pct:20,
    philosophy:"At Level 1, Trajectory acts as a patient guide. You receive complete, well-structured answers. The goal is clarity — getting you from confusion to understanding as efficiently as possible. There is no shame in starting here. Every expert was once a beginner who needed someone to simply explain things well." },
  { n:"2", name:"Explorer",   desc:"Guided hints before full answers. Light Socratic nudges.",  pct:40,
    philosophy:"Level 2 introduces the first layer of cognitive engagement. Trajectory will offer a guiding question or partial frame before answering. You're encouraged to sit with the problem for a moment before receiving the full picture. This is where the habit of thinking before reaching begins to form." },
  { n:"3", name:"Builder",    desc:"Partial frameworks. AI asks one question before answering.", pct:60,
    philosophy:"At Level 3, Trajectory becomes a thinking partner rather than an answer machine. It will ask you one pointed question before proceeding — not to obstruct, but to surface your existing understanding. What you already know shapes the response you receive. This is calibrated assistance at its most useful." },
  { n:"4", name:"Strategist", desc:"Probing questions first. Answers follow your attempt.",     pct:80,
    philosophy:"Level 4 is where real intellectual work begins. Trajectory will challenge your framing, probe your assumptions, and only answer after you've made a genuine attempt. The discomfort you feel at this level is precisely the point. That tension is where understanding is built." },
  { n:"5", name:"Pro",        desc:"Pure Socratic mode. Every reply challenges your thinking.", pct:100,
    philosophy:"Level 5 is the highest form of the Trajectory philosophy. Trajectory becomes almost entirely Socratic — questioning, challenging, pushing back. Direct answers are rare. What you receive instead are better questions. This is not obstruction. This is the method that produced some of history's sharpest minds." },
];

const CREDIT_MAX = 200000;
const VALID_EMAIL = "bhavyapatelschool@gmail.com";
const VALID_PASS  = "12345678";
const STARTERS = ["Explain a concept","Help me debug code","Write something","Think through a problem","Summarise a topic","Review my writing"];

// ─── SOUND ───────────────────────────────────────────────────────────────────
function playTone(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    const t = ctx.currentTime;
    if (type === "send")    { o.frequency.setValueAtTime(880,t); o.frequency.exponentialRampToValueAtTime(1200,t+.08); g.gain.setValueAtTime(.07,t); g.gain.exponentialRampToValueAtTime(.001,t+.12); o.start(t); o.stop(t+.12); }
    if (type === "receive") { o.type="sine"; o.frequency.setValueAtTime(600,t); o.frequency.exponentialRampToValueAtTime(820,t+.1); g.gain.setValueAtTime(.04,t); g.gain.exponentialRampToValueAtTime(.001,t+.2); o.start(t); o.stop(t+.2); }
    if (type === "click")   { o.type="sine"; o.frequency.setValueAtTime(440,t); g.gain.setValueAtTime(.035,t); g.gain.exponentialRampToValueAtTime(.001,t+.06); o.start(t); o.stop(t+.06); }
  } catch {}
}

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
function buildSystem(level, memory, tone, attachedFiles) {
  const memBlock = memory?.length ? `\n\nUser memory (use this context naturally):\n${memory.map(m=>`- ${m}`).join("\n")}` : "";
  const fileBlock = attachedFiles?.length ? `\n\nUser has attached: ${attachedFiles.map(f=>f.name).join(", ")}. Acknowledge and reference them appropriately.` : "";
  const lvlMap = {
    "1":"Provide complete, direct, well-structured answers. Use markdown naturally for clarity. Be thorough.",
    "2":"Offer a brief guiding question or hint first, then provide the full answer. Light Socratic touch.",
    "3":"Ask ONE clarifying question to surface the user's thinking, then answer clearly and completely.",
    "4":"Begin with a probing question. Push the user to articulate their reasoning before you respond.",
    "5":"Respond almost entirely Socratically. Challenge assumptions. Ask questions that force deeper thinking. Give minimal direct answers.",
  };
  const alfredTone = `\n\nTone: You are Alfred to the user's Bruce Wayne. Wise, composed, precise, occasionally dry. You serve their growth with quiet authority. You are direct without being cold, warm without being sycophantic. You address them as an intelligent adult who is capable of more than they currently believe.`;
  const socratesTone = `\n\nTone: You are Socrates. Relentless, intellectually rigorous, cold precision. You do not comfort — you illuminate. Every answer contains a deeper question. Never let the user settle for their first answer.`;
  return `You are Trajectory, a sharp AI assistant. Format responses with markdown: **bold**, *italic*, \`code\`, lists, headers, code blocks where appropriate. Be precise and genuinely useful.\n\nPhilosophy: Keep the user cognitively engaged. Enhance their thinking — never replace it.\n\nLevel ${level.n} (${level.name}): ${lvlMap[level.n]}${tone==="alfred"?alfredTone:socratesTone}${memBlock}${fileBlock}`;
}

// ─── MARKDOWN ─────────────────────────────────────────────────────────────────
function renderMD(raw) {
  if (!raw) return "";
  const esc = s => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const inline = s => s
    .replace(/`([^`]+)`/g,"<code>$1</code>")
    .replace(/\*\*\*([^*]+)\*\*\*/g,"<strong><em>$1</em></strong>")
    .replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>")
    .replace(/\*([^*\n]+)\*/g,"<em>$1</em>")
    .replace(/~~([^~]+)~~/g,"<s>$1</s>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank">$1</a>');
  const lines = raw.split("\n");
  let out="",inCode=false,codeLang="",codeBlock="",inUl=false,inOl=false;
  const closeUl=()=>{if(inUl){out+="</ul>";inUl=false;}};
  const closeOl=()=>{if(inOl){out+="</ol>";inOl=false;}};
  const closeLists=()=>{closeUl();closeOl();};
  for(let i=0;i<lines.length;i++){
    const l=lines[i];
    if(l.match(/^```/)){
      if(!inCode){closeLists();codeLang=l.slice(3).trim();inCode=true;codeBlock="";}
      else{out+=`<pre><code class="lang-${codeLang}">${esc(codeBlock.trimEnd())}</code></pre>`;inCode=false;codeLang="";}
      continue;
    }
    if(inCode){codeBlock+=l+"\n";continue;}
    if(l.match(/^---+$/)){closeLists();out+="<hr/>";continue;}
    if(l.match(/^#{1,6} /)){closeLists();const lv=l.match(/^(#+)/)[1].length;out+=`<h${lv}>${inline(l.replace(/^#+\s/,""))}</h${lv}>`;continue;}
    if(l.match(/^[-*] /)){closeOl();if(!inUl){out+="<ul>";inUl=true;}out+=`<li>${inline(l.replace(/^[-*] /,""))}</li>`;continue;}
    if(l.match(/^\d+\. /)){closeUl();if(!inOl){out+="<ol>";inOl=true;}out+=`<li>${inline(l.replace(/^\d+\. /,""))}</li>`;continue;}
    if(l.match(/^> /)){closeLists();out+=`<blockquote>${inline(l.slice(2))}</blockquote>`;continue;}
    if(l.trim()===""){closeLists();out+="";continue;}
    closeLists();out+=`<p>${inline(l)}</p>`;
  }
  closeLists();
  if(inCode)out+=`<pre><code>${esc(codeBlock)}</code></pre>`;
  return out;
}

// ─── EXPORT ───────────────────────────────────────────────────────────────────
function exportConv(conv) {
  const lines = [`# ${conv.title}`, `Exported from Trajectory · ${new Date().toLocaleDateString()}`, ""];
  conv.msgs.forEach(m => {
    lines.push(`### ${m.role==="user"?"You":"Trajectory"}`);
    lines.push(m.content);
    lines.push("");
  });
  const blob = new Blob([lines.join("\n")], { type:"text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href=url; a.download=`${conv.title.replace(/[^a-z0-9]/gi,"_")}.md`; a.click();
  URL.revokeObjectURL(url);
}

// ─── CREDIT BAR ───────────────────────────────────────────────────────────────
function CreditBar({ credits }) {
  const [open,setOpen] = useState(false);
  const pct = Math.max(0,Math.min(100,(credits/CREDIT_MAX)*100));
  const color = pct>60?"#4caf7d":pct>25?"#e0a955":"#e05555";
  const fmt = n => n>=1000?`${Math.round(n/1000)}k`:Math.round(n);
  return (
    <div className="cr-wrap" onClick={()=>setOpen(o=>!o)}>
      <span className="cr-lbl">{fmt(credits)}</span>
      <div className="cr-track"><div className="cr-fill" style={{width:`${pct}%`,background:color}}/></div>
      {open&&(
        <div className="cr-pop" onClick={e=>e.stopPropagation()}>
          <div className="cp-r"><span className="cp-l">Remaining</span><span className="cp-v">{Math.round(credits).toLocaleString()}</span></div>
          <div className="cp-r"><span className="cp-l">Used</span><span className="cp-v" style={{color}}>{(100-pct).toFixed(1)}%</span></div>
          <div className="cp-note">+10k credits per hour · Resets to 200k when depleted</div>
        </div>
      )}
    </div>
  );
}

// ─── MODEL SEL ────────────────────────────────────────────────────────────────
function ModelSel({ model, onChange }) {
  const [open,setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(()=>{
    const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};
    document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h);
  },[]);
  return (
    <div className="mdl-sel" ref={ref}>
      <button className="mdl-btn" onClick={()=>setOpen(o=>!o)}>
        <span className="mdl-dot"/>{model.label}
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 6l4 4 4-4" strokeLinecap="round"/></svg>
      </button>
      {open&&(
        <div className="mdl-drop">
          {MODELS.map(m=>(
            <div key={m.id} className={`mdl-opt${model.id===m.id?" sel":""}`} onClick={()=>{onChange(m);setOpen(false);}}>
              <div className="mo-l">{m.label}</div><div className="mo-d">{m.desc}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ICONS ────────────────────────────────────────────────────────────────────
const I = {
  chat:    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M2 2.5h12v8.5H9.5L7 13.5V11H2V2.5z"/></svg>,
  search:  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="7" cy="7" r="4"/><path d="M11 11l2.5 2.5" strokeLinecap="round"/></svg>,
  folder:  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M1.5 4.5h4l1.5 2h7.5v6.5h-13V4.5z"/></svg>,
  levels:  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="2" y="9" width="3" height="5" rx=".5"/><rect x="6.5" y="5.5" width="3" height="8.5" rx=".5"/><rect x="11" y="2" width="3" height="12" rx=".5"/></svg>,
  phil:    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="7" r="4.5"/><path d="M8 2V1M8 13v1M3.1 4.1l-.7-.7M13.6 4.1l.7-.7M1 7H0M16 7h-1" strokeLinecap="round"/></svg>,
  pricing: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="1.5" y="3.5" width="13" height="9" rx="1.5"/><path d="M5 3.5V3a2 2 0 0 1 4 0v.5M6 8.5h4" strokeLinecap="round"/></svg>,
  cog:     <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M2.6 2.6l1.1 1.1M12.3 12.3l1.1 1.1M13.4 2.6l-1.1 1.1M3.7 12.3l-1.1 1.1"/></svg>,
  memory:  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="2" y="4" width="12" height="8" rx="1.5"/><path d="M5 4V2.5M8 4V2M11 4V2.5M5 12v1.5M8 12v2M11 12v1.5"/></svg>,
  clock:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="8" r="5.5"/><path d="M8 5v3.5l2 1.2" strokeLinecap="round"/></svg>,
  plus:    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M8 2v12M2 8h12" strokeLinecap="round"/></svg>,
  left:    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  right:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  send:    <svg viewBox="0 0 16 16" fill="currentColor"><path d="M13.7 7.3 2.7 2.1C2.2 1.9 1.7 2.4 1.9 2.9L3.5 7h5.8c.3 0 .5.2.5.5s-.2.5-.5.5H3.5l-1.6 4.1c-.2.5.3 1 .8.8l11-5.2c.5-.2.5-.7 0-.9z"/></svg>,
  logout:  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M6 3H3v10h3M10 5l3 3-3 3M13 8H7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  trash:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 4h10M5 4V2.5h6V4M6 7v4M10 7v4M4 4l.8 9.5h6.4L12 4"/></svg>,
  mic:     <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="5.5" y="1" width="5" height="8" rx="2.5"/><path d="M2 7.5a6 6 0 0 0 12 0M8 13.5v2" strokeLinecap="round"/></svg>,
  attach:  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M13 7.5l-5.5 5.5a4 4 0 0 1-5.66-5.66l6-6a2.5 2.5 0 0 1 3.54 3.54l-6 6a1 1 0 0 1-1.42-1.42l5.5-5.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  x:       <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round"/></svg>,
  image:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="1.5" y="2.5" width="13" height="11" rx="1.5"/><circle cx="5.5" cy="6" r="1.2"/><path d="M1.5 11l3.5-3.5 2.5 2.5 2-2 4 4"/></svg>,
  doc:     <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 1.5h5l3.5 3.5V14.5H4V1.5z"/><path d="M9 1.5V5h3.5M6 8h4M6 10.5h4M6 6h2"/></svg>,
  download:<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M8 2v8M5 7l3 3 3-3M2 12h12" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  pin:     <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M10 2l4 4-2 2-1-1-4 4v2l-2-2 1-1L5 9 4 8l2-2-1-1 2-2M8 10l-5 5"/></svg>,
  user:    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>,
  capture: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M2 5V3a1 1 0 0 1 1-1h2M11 2h2a1 1 0 0 1 1 1v2M14 11v2a1 1 0 0 1-1 1h-2M5 14H3a1 1 0 0 1-1-1v-2M8 5v6M5 8h6" strokeLinecap="round"/></svg>,
  export2: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M10 2h4v4M14 2l-6 6M6 4H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chevron: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 6l4 4 4-4" strokeLinecap="round"/></svg>,
  check:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 8l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  edit:    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M11 2l3 3-8 8H3v-3l8-8z"/></svg>,
  camera:  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M1 5.5h14v8H1zM10.5 5.5l-1.5-3h-2l-1.5 3"/><circle cx="8" cy="10" r="2.2"/></svg>,
  copy:    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="4" y="4" width="8" height="8" rx="1"/><path d="M6 4V2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5H12" strokeLinecap="round"/></svg>,
  refresh: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M13 2.5v4h-4M3 13.5v-4h4" strokeLinecap="round"/><path d="M13.5 8A5.5 5.5 0 1 1 8 2.5" strokeLinecap="round"/></svg>,
};

// ─── CSS ─────────────────────────────────────────────────────────────────────
const makeCSS = (th, fs, density) => `
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&display=swap');
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
:root{--bg:${th.bg};--sb:${th.sidebar};--sf:${th.surface};--sf2:${th.surface2};--bd:${th.border};--bdh:${th.borderH};--tx:${th.text};--tx2:${th.text2};--tx3:${th.text3};--bl:${th.blue};--blbg:${th.blueBg};--blbd:${th.blueBd};--ac:${th.ac};--ach:${th.acH};--r:8px;--fs:${fs}px;--mp:${density==="compact"?"10px":density==="spacious"?"22px":"16px"};}
html,body,#root{height:100%;overflow:hidden;}
body{background:var(--bg);color:var(--tx);font-family:'Geist',-apple-system,BlinkMacSystemFont,sans-serif;font-size:var(--fs);-webkit-font-smoothing:antialiased;}
::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:var(--bd);border-radius:2px;}
.shell{display:flex;height:100vh;}

/* AUTH */
.auth-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);padding:20px;}
.auth-box{width:100%;max-width:420px;background:var(--sf);border:1px solid var(--bd);border-radius:16px;padding:36px 32px;}
.auth-logo{font-size:18px;font-weight:600;color:var(--tx);margin-bottom:4px;letter-spacing:-.01em;}
.auth-logo span{color:var(--bl);}
.auth-sub{font-size:13px;color:var(--tx2);margin-bottom:28px;line-height:1.5;}
.auth-tabs{display:flex;margin-bottom:24px;background:var(--sf2);border-radius:var(--r);padding:3px;}
.auth-tab{flex:1;padding:8px;border-radius:6px;border:none;background:transparent;font-size:13px;font-weight:500;color:var(--tx2);cursor:pointer;transition:all .15s;font-family:inherit;}
.auth-tab.on{background:var(--sf);color:var(--tx);box-shadow:0 1px 4px rgba(0,0,0,.3);}
.auth-field{margin-bottom:12px;}
.auth-label{font-size:11px;font-weight:500;color:var(--tx2);margin-bottom:5px;letter-spacing:.03em;display:block;}
.auth-input{width:100%;background:var(--sf2);border:1px solid var(--bd);border-radius:var(--r);padding:10px 12px;color:var(--tx);font-size:13px;font-family:inherit;outline:none;transition:border-color .15s;}
.auth-input:focus{border-color:var(--bdh);}
.auth-input::placeholder{color:var(--tx3);}
.auth-btn{width:100%;padding:11px;border-radius:var(--r);background:var(--bl);border:none;color:#fff;font-size:14px;font-weight:500;cursor:pointer;transition:opacity .12s;font-family:inherit;margin-top:6px;}
.auth-btn:hover{opacity:.88;}
.auth-err{font-size:12px;color:#e05555;margin-top:8px;padding:8px 12px;background:rgba(220,60,60,.06);border:1px solid rgba(220,60,60,.15);border-radius:6px;}
.auth-div{display:flex;align-items:center;gap:12px;margin:18px 0;}
.auth-div::before,.auth-div::after{content:'';flex:1;height:1px;background:var(--bd);}
.auth-div span{font-size:11px;color:var(--tx3);}
.auth-social{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.auth-soc-btn{width:100%;padding:9px 12px;border-radius:var(--r);background:transparent;border:1px solid var(--bd);color:var(--tx2);font-size:12px;cursor:pointer;transition:all .12s;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px;}
.auth-soc-btn:hover{border-color:var(--bdh);color:var(--tx);}
.soc-icon{width:15px;height:15px;flex-shrink:0;}

/* MODALS */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;z-index:500;backdrop-filter:blur(4px);animation:fadeIn .15s ease;}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.modal{background:var(--sf);border:1px solid var(--bd);border-radius:16px;padding:32px;width:100%;max-width:500px;box-shadow:0 20px 60px rgba(0,0,0,.5);animation:slideUp .2s ease;}
@keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.modal-title{font-size:18px;font-weight:600;color:var(--tx);margin-bottom:6px;}
.modal-sub{font-size:13px;color:var(--tx2);margin-bottom:24px;line-height:1.6;}
.lvl-pick{display:flex;align-items:center;gap:14px;padding:13px 16px;border-radius:10px;background:var(--sf2);border:1px solid var(--bd);cursor:pointer;transition:all .12s;margin-bottom:8px;}
.lvl-pick:hover{border-color:var(--bdh);background:var(--ach);}
.lvl-n{font-size:18px;font-weight:300;color:var(--tx3);width:20px;text-align:center;flex-shrink:0;}
.lvl-nm{font-size:13px;font-weight:500;color:var(--tx);}
.lvl-ds{font-size:12px;color:var(--tx2);margin-top:2px;line-height:1.5;}

/* SIDEBAR */
.sb{width:240px;flex-shrink:0;background:var(--sb);border-right:1px solid var(--bd);display:flex;flex-direction:column;overflow:hidden;transition:width .2s ease,border-color .2s ease;}
.sb.closed{width:0;border-right-color:transparent;}
.sb-in{width:240px;display:flex;flex-direction:column;height:100%;}
.sb-top{display:flex;align-items:center;justify-content:space-between;padding:12px 12px 10px;border-bottom:1px solid var(--bd);flex-shrink:0;}
.logo{font-size:14px;font-weight:600;letter-spacing:-.01em;color:var(--tx);user-select:none;}
.logo-dot{color:var(--bl);}
.sb-acts{display:flex;gap:2px;}
.ib{width:30px;height:30px;border-radius:var(--r);border:none;background:transparent;color:var(--tx2);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .1s,color .12s;flex-shrink:0;}
.ib:hover{background:var(--ach);color:var(--tx);}
.ib svg{width:15px;height:15px;}
.sb-scroll{flex:1;overflow-y:auto;padding:8px;}
.sb-grp{margin-bottom:4px;}
.sb-lbl{font-size:11px;font-weight:500;color:var(--tx3);padding:8px 8px 4px;letter-spacing:.02em;user-select:none;}
.sr{display:flex;align-items:center;gap:8px;padding:7px 8px;border-radius:var(--r);font-size:13px;font-weight:400;color:var(--tx2);cursor:pointer;transition:background .1s,color .1s;white-space:nowrap;border:1px solid transparent;user-select:none;}
.sr:hover{background:var(--ac);color:var(--tx);}
.sr.on{background:var(--ach);color:var(--tx);border-color:var(--bd);}
.sr svg{width:15px;height:15px;flex-shrink:0;opacity:.65;}
.sr.on svg{opacity:1;}
.sr-txt{overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0;}
.sb-sep{height:1px;background:var(--bd);margin:6px 0;}

/* USER PROFILE PILL */
.user-pill{display:flex;align-items:center;gap:10px;padding:10px 12px;border-top:1px solid var(--bd);cursor:pointer;transition:background .12s;flex-shrink:0;}
.user-pill:hover{background:var(--ac);}
.user-avatar{width:30px;height:30px;border-radius:8px;background:var(--blbg);border:1px solid var(--blbd);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:var(--bl);flex-shrink:0;overflow:hidden;}
.user-avatar img{width:100%;height:100%;object-fit:cover;}
.user-info{flex:1;min-width:0;}
.user-name{font-size:12px;font-weight:500;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.user-plan{font-size:10px;color:var(--tx3);margin-top:1px;}
.level-pill{display:flex;align-items:center;gap:10px;padding:8px 12px;border-top:1px solid var(--bd);cursor:pointer;transition:background .12s;flex-shrink:0;}
.level-pill:hover{background:var(--ac);}
.lbadge{width:24px;height:24px;border-radius:6px;background:var(--blbg);border:1px solid var(--blbd);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:var(--bl);flex-shrink:0;}
.lname3{font-size:12px;font-weight:500;color:var(--tx);}
.lsub3{font-size:10px;color:var(--tx3);margin-top:1px;}
.conv-rename{background:transparent;border:none;outline:none;color:var(--tx);font-size:13px;font-family:inherit;width:100%;padding:0;}

/* TOPBAR */
.topbar{display:flex;align-items:center;gap:8px;padding:10px 16px;border-bottom:1px solid var(--bd);flex-shrink:0;min-height:49px;}
.tb-title{font-size:13px;color:var(--tx2);font-weight:400;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.chip{padding:4px 10px;border-radius:5px;font-size:11px;font-weight:500;color:var(--tx2);border:1px solid var(--bd);background:transparent;cursor:pointer;transition:all .1s;white-space:nowrap;font-family:inherit;}
.chip:hover{border-color:var(--bdh);color:var(--tx);}
.chip.on{border-color:var(--blbd);color:var(--bl);background:var(--blbg);}

/* TONE TOGGLE */
.tone-toggle{display:flex;align-items:center;background:var(--sf2);border:1px solid var(--bd);border-radius:6px;overflow:hidden;}
.tone-btn{padding:4px 10px;font-size:11px;font-weight:500;color:var(--tx3);border:none;background:transparent;cursor:pointer;transition:all .12s;font-family:inherit;white-space:nowrap;}
.tone-btn.on{background:var(--ach);color:var(--tx);box-shadow:inset 0 0 0 1px var(--bd);}

/* MODEL */
.mdl-sel{position:relative;}
.mdl-btn{display:flex;align-items:center;gap:6px;padding:5px 10px;border-radius:6px;border:1px solid var(--bd);background:transparent;color:var(--tx2);font-size:12px;font-weight:500;cursor:pointer;transition:all .12s;font-family:inherit;white-space:nowrap;}
.mdl-btn:hover{border-color:var(--bdh);color:var(--tx);}
.mdl-dot{width:6px;height:6px;border-radius:50%;background:var(--bl);flex-shrink:0;}
.mdl-drop{position:absolute;top:calc(100% + 6px);right:0;background:var(--sf);border:1px solid var(--bd);border-radius:10px;overflow:hidden;z-index:100;min-width:180px;box-shadow:0 8px 24px rgba(0,0,0,.4);}
.mdl-opt{padding:10px 14px;cursor:pointer;transition:background .1s;border-bottom:1px solid var(--bd);}
.mdl-opt:last-child{border-bottom:none;}
.mdl-opt:hover{background:var(--ac);}
.mdl-opt.sel{background:var(--blbg);}
.mo-l{font-size:13px;font-weight:500;color:var(--tx);}
.mo-d{font-size:11px;color:var(--tx3);margin-top:2px;}

/* MAIN */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}

/* PAGES */
.page{flex:1;overflow-y:auto;}
.pb{max-width:660px;margin:0 auto;padding:48px 28px 80px;}
.p-eye{font-size:11px;color:var(--tx3);letter-spacing:.04em;margin-bottom:14px;font-weight:500;}
.p-h{font-size:22px;font-weight:600;color:var(--tx);line-height:1.25;margin-bottom:14px;}
.p-lead{font-size:13px;color:var(--tx2);line-height:1.8;margin-bottom:28px;}
.card{background:var(--sf);border:1px solid var(--bd);border-radius:10px;padding:16px 18px;margin-bottom:8px;transition:border-color .12s;}
.card:hover{border-color:var(--bdh);}
.c-h{font-size:13px;font-weight:500;color:var(--tx);margin-bottom:6px;}
.c-p{font-size:13px;color:var(--tx2);line-height:1.7;}

/* LEVELS PAGE */
.lrow{display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:10px;background:var(--sf);border:1px solid var(--bd);cursor:pointer;transition:all .12s;margin-bottom:8px;}
.lrow:hover{border-color:var(--bdh);}
.lrow.cur{border-color:var(--blbd);background:var(--blbg);}
.lrow.expanded{border-color:var(--bdh);}
.lnum{font-size:18px;font-weight:300;color:var(--tx3);width:20px;text-align:center;flex-shrink:0;}
.lrow.cur .lnum{color:var(--bl);}
.ll{font-size:13px;font-weight:500;color:var(--tx);}
.ld{font-size:12px;color:var(--tx2);margin-top:2px;line-height:1.5;}
.ltag{margin-left:auto;font-size:10px;font-weight:500;color:var(--bl);background:var(--blbg);border:1px solid var(--blbd);padding:3px 9px;border-radius:20px;flex-shrink:0;}
.level-phil{padding:14px 16px 16px 52px;font-size:13px;color:var(--tx2);line-height:1.75;border-top:1px solid var(--bd);animation:slideDown .2s ease;}
@keyframes slideDown{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
.level-set-btn{display:inline-block;margin-top:10px;padding:6px 14px;border-radius:6px;background:var(--bl);border:none;color:#fff;font-size:12px;font-weight:500;cursor:pointer;font-family:inherit;}

/* PROJECTS */
.proj-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:24px;}
.proj-card{background:var(--sf);border:1px solid var(--bd);border-radius:10px;padding:18px;transition:border-color .12s;}
.proj-card:hover{border-color:var(--bdh);}
.proj-card.new-p{border-style:dashed;display:flex;align-items:center;justify-content:center;gap:8px;color:var(--tx2);font-size:13px;cursor:pointer;min-height:100px;}
.proj-card.new-p:hover{color:var(--tx);border-color:var(--bdh);}
.proj-name{font-size:13px;font-weight:500;color:var(--tx);margin-bottom:4px;}
.proj-meta{font-size:11px;color:var(--tx3);margin-bottom:8px;}
.proj-tags{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px;}
.proj-tag{font-size:10px;padding:2px 8px;border-radius:20px;background:var(--blbg);border:1px solid var(--blbd);color:var(--bl);}
.proj-actions{display:flex;gap:6px;}
.pbtn2{padding:5px 12px;border-radius:6px;font-size:11px;font-weight:500;cursor:pointer;transition:all .12s;font-family:inherit;}
.pbtn2.open{background:var(--bl);border:1px solid var(--bl);color:#fff;}
.pbtn2.open:hover{opacity:.88;}
.pbtn2.ghost2{background:transparent;border:1px solid var(--bd);color:var(--tx2);}
.pbtn2.ghost2:hover{border-color:rgba(220,60,60,.3);color:#e05555;}
.proj-inp{width:100%;background:var(--sf2);border:1px solid var(--bd);border-radius:var(--r);padding:9px 12px;color:var(--tx);font-size:13px;font-family:inherit;outline:none;transition:border-color .15s;margin-bottom:10px;}
.proj-inp:focus{border-color:var(--bdh);}
.proj-inp::placeholder{color:var(--tx3);}
.proj-save{padding:8px 20px;border-radius:var(--r);background:var(--bl);border:none;color:#fff;font-size:12px;font-weight:500;cursor:pointer;font-family:inherit;}
/* project detail */
.proj-detail{flex:1;display:flex;flex-direction:column;overflow:hidden;}
.proj-notes-area{width:100%;background:var(--sf2);border:1px solid var(--bd);border-radius:10px;padding:12px 14px;color:var(--tx);font-size:13px;font-family:inherit;outline:none;resize:vertical;line-height:1.7;min-height:120px;transition:border-color .15s;}
.proj-notes-area:focus{border-color:var(--bdh);}
/* context cards */
.ctx-cards{display:flex;flex-direction:column;gap:8px;margin-bottom:20px;}
.ctx-card{background:var(--sf);border:1px solid var(--bd);border-radius:10px;overflow:hidden;transition:border-color .12s;}
.ctx-card.pinned{border-color:var(--blbd);}
.ctx-card-hdr{display:flex;align-items:center;gap:8px;padding:10px 14px;cursor:pointer;}
.ctx-card-hdr:hover{background:var(--ac);}
.ctx-card-title{font-size:12px;font-weight:500;color:var(--tx);flex:1;}
.ctx-card-body{padding:0 14px 12px;font-size:12px;color:var(--tx2);line-height:1.7;border-top:1px solid var(--bd);}
.ctx-card-inp{width:100%;background:transparent;border:none;outline:none;color:var(--tx2);font-size:12px;font-family:inherit;resize:none;line-height:1.7;padding:10px 0;min-height:60px;}

/* MEMORY */
.mem-item{background:var(--sf);border:1px solid var(--bd);border-radius:10px;padding:12px 16px;margin-bottom:8px;display:flex;align-items:flex-start;gap:12px;animation:slideUp .2s ease;}
.mem-txt{font-size:13px;color:var(--tx2);line-height:1.6;flex:1;}
.mem-del{background:none;border:none;color:var(--tx3);cursor:pointer;font-size:16px;flex-shrink:0;transition:color .12s;}
.mem-del:hover{color:#e05555;}
.mem-add-row{display:flex;gap:8px;margin-top:16px;}
.mem-inp{flex:1;background:var(--sf2);border:1px solid var(--bd);border-radius:var(--r);padding:9px 12px;color:var(--tx);font-size:13px;font-family:inherit;outline:none;transition:border-color .15s;}
.mem-inp:focus{border-color:var(--bdh);}
.mem-inp::placeholder{color:var(--tx3);}
.mem-add-btn{padding:9px 16px;border-radius:var(--r);background:var(--bl);border:none;color:#fff;font-size:12px;font-weight:500;cursor:pointer;font-family:inherit;}

/* PHILOSOPHY */
.phil-hero{text-align:center;padding:16px 0 36px;border-bottom:1px solid var(--bd);margin-bottom:32px;}
.phil-quote{font-size:19px;font-weight:300;color:var(--tx);line-height:1.5;font-style:italic;margin-bottom:8px;}
.phil-attr{font-size:12px;color:var(--tx3);}
.phil-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:28px;}
.phil-card{background:var(--sf);border:1px solid var(--bd);border-radius:10px;padding:18px;transition:all .15s;}
.phil-card:hover{border-color:var(--bdh);transform:translateY(-1px);}
.phil-icon{font-size:18px;margin-bottom:10px;}
.phil-ct{font-size:13px;font-weight:500;color:var(--tx);margin-bottom:5px;}
.phil-cb{font-size:12px;color:var(--tx2);line-height:1.7;}
.phil-expand{background:var(--sf);border:1px solid var(--bd);border-radius:10px;overflow:hidden;margin-bottom:8px;}
.phil-hdr{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;cursor:pointer;transition:background .12s;}
.phil-hdr:hover{background:var(--ac);}
.phil-ht{font-size:13px;font-weight:500;color:var(--tx);}
.phil-body{padding:0 18px 14px;font-size:13px;color:var(--tx2);line-height:1.75;}
.chevron{transition:transform .2s;color:var(--tx3);}
.chevron.open{transform:rotate(180deg);}

/* PRICING */
.pgrid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;}
.pcard{background:var(--sf);border:1px solid var(--bd);border-radius:10px;padding:22px 20px;transition:border-color .12s;}
.pcard:hover{border-color:var(--bdh);}
.pcard.hi{border-color:var(--blbd);}
.pplan{font-size:11px;font-weight:500;color:var(--tx2);letter-spacing:.05em;margin-bottom:14px;}
.pamount{font-size:32px;font-weight:300;color:var(--tx);line-height:1;}
.pper{font-size:12px;color:var(--tx3);margin-top:3px;margin-bottom:20px;}
.plist{list-style:none;display:flex;flex-direction:column;gap:7px;}
.plist li{font-size:12px;color:var(--tx2);display:flex;gap:8px;line-height:1.5;}
.plist li::before{content:'–';color:var(--tx3);flex-shrink:0;}
.pbtn{width:100%;margin-top:20px;padding:9px;border-radius:7px;font-size:12px;font-weight:500;cursor:pointer;transition:all .12s;font-family:inherit;}
.pbtn.ghost{background:transparent;border:1px solid var(--bd);color:var(--tx2);}
.pbtn.ghost:hover{border-color:var(--bdh);color:var(--tx);}
.pbtn.fill{background:var(--bl);border:1px solid var(--bl);color:#fff;}
.pbtn.fill:hover{opacity:.88;}

/* CUSTOMIZE */
.th-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:28px;}
.th-card{border-radius:10px;overflow:hidden;cursor:pointer;border:2px solid transparent;transition:all .15s;}
.th-card.active{border-color:var(--bl);}
.th-prev{height:48px;display:flex;overflow:hidden;border-radius:7px;}
.tp-s{width:35%;}
.tp-m{flex:1;}
.th-lbl{font-size:11px;font-weight:500;color:var(--tx2);margin-top:6px;text-align:center;}
.th-card.active .th-lbl{color:var(--bl);}
.cust-h{font-size:13px;font-weight:600;color:var(--tx);margin-bottom:12px;}
.cust-section{margin-bottom:28px;}
.tog-row{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:var(--sf);border:1px solid var(--bd);border-radius:10px;margin-bottom:8px;}
.tr-l{font-size:13px;color:var(--tx);}
.tr-s{font-size:11px;color:var(--tx3);margin-top:2px;}
.tog{width:36px;height:20px;border-radius:20px;background:var(--bd);border:none;cursor:pointer;position:relative;transition:background .15s;flex-shrink:0;}
.tog.on{background:var(--bl);}
.tog::after{content:'';position:absolute;top:3px;left:3px;width:14px;height:14px;border-radius:50%;background:white;transition:transform .15s;}
.tog.on::after{transform:translateX(16px);}
.cust-slider{display:flex;align-items:center;gap:12px;padding:12px 16px;background:var(--sf);border:1px solid var(--bd);border-radius:10px;margin-bottom:8px;}
.cust-slider-label{font-size:13px;color:var(--tx);flex:1;}
.cust-slider input[type=range]{width:100px;accent-color:var(--bl);}
.cust-slider-val{font-size:12px;color:var(--tx3);width:28px;text-align:right;}
.seg-row{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:var(--sf);border:1px solid var(--bd);border-radius:10px;margin-bottom:8px;}
.seg{display:flex;background:var(--sf2);border-radius:6px;padding:2px;gap:2px;}
.seg-btn{padding:4px 10px;border-radius:5px;border:none;background:transparent;font-size:11px;font-weight:500;color:var(--tx3);cursor:pointer;transition:all .12s;font-family:inherit;}
.seg-btn.on{background:var(--ach);color:var(--tx);box-shadow:0 0 0 1px var(--bd);}

/* USER PROFILE PAGE */
.profile-hero{display:flex;align-items:center;gap:20px;margin-bottom:32px;padding-bottom:28px;border-bottom:1px solid var(--bd);}
.profile-avatar-wrap{position:relative;cursor:pointer;}
.profile-avatar{width:64px;height:64px;border-radius:16px;background:var(--blbg);border:1px solid var(--blbd);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:600;color:var(--bl);overflow:hidden;}
.profile-avatar img{width:100%;height:100%;object-fit:cover;}
.profile-avatar-edit{position:absolute;inset:0;border-radius:16px;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .15s;}
.profile-avatar-wrap:hover .profile-avatar-edit{opacity:1;}
.profile-avatar-edit svg{width:16px;height:16px;color:white;}
.profile-info{flex:1;}
.profile-name{font-size:18px;font-weight:600;color:var(--tx);margin-bottom:4px;}
.profile-email{font-size:13px;color:var(--tx2);margin-bottom:8px;}
.profile-plan-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:500;background:var(--blbg);border:1px solid var(--blbd);color:var(--bl);}
.profile-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:24px;}
.stat-card{background:var(--sf);border:1px solid var(--bd);border-radius:10px;padding:16px;text-align:center;}
.stat-val{font-size:24px;font-weight:300;color:var(--tx);line-height:1;margin-bottom:4px;}
.stat-lbl{font-size:11px;color:var(--tx3);}
.profile-field{margin-bottom:12px;}
.profile-label{font-size:11px;font-weight:500;color:var(--tx2);margin-bottom:5px;letter-spacing:.03em;display:block;}
.profile-input{width:100%;background:var(--sf2);border:1px solid var(--bd);border-radius:var(--r);padding:9px 12px;color:var(--tx);font-size:13px;font-family:inherit;outline:none;transition:border-color .15s;}
.profile-input:focus{border-color:var(--bdh);}
.profile-save{padding:9px 22px;border-radius:var(--r);background:var(--bl);border:none;color:#fff;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;transition:opacity .12s;}
.profile-save:hover{opacity:.88;}
.danger-zone{margin-top:32px;padding-top:24px;border-top:1px solid var(--bd);}
.danger-btn{padding:9px 18px;border-radius:var(--r);background:transparent;border:1px solid rgba(220,60,60,.3);color:#e05555;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;transition:all .12s;}
.danger-btn:hover{background:rgba(220,60,60,.08);}

/* CHAT */
.chat{flex:1;display:flex;flex-direction:column;overflow:hidden;}
.msgs{flex:1;overflow-y:auto;}
.empty{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;padding:40px;}
.empty-logo{font-size:15px;font-weight:600;color:var(--tx3);user-select:none;letter-spacing:-.01em;}
.starters{display:flex;flex-wrap:wrap;gap:7px;justify-content:center;max-width:460px;}
.starter{padding:7px 14px;border-radius:7px;border:1px solid var(--bd);background:transparent;font-size:12px;font-weight:400;color:var(--tx2);cursor:pointer;transition:all .12s;font-family:inherit;}
.starter:hover{border-color:var(--bdh);color:var(--tx);background:var(--ac);}

/* NEW: Loading indicator for AI thinking */
.thinking-indicator{display:flex;align-items:center;gap:8px;padding:12px 16px;background:var(--sf2);border-radius:12px;width:fit-content;}
.thinking-dots{display:flex;gap:4px;}
.thinking-dots span{width:6px;height:6px;border-radius:50%;background:var(--tx2);animation:thinkingBounce 1.4s infinite ease-in-out both;}
.thinking-dots span:nth-child(1){animation-delay:-0.32s;}
.thinking-dots span:nth-child(2){animation-delay:-0.16s;}
@keyframes thinkingBounce{0%,80%,100%{transform:scale(0);opacity:0.3;}40%{transform:scale(1);opacity:1;}}
.thinking-text{font-size:12px;color:var(--tx2);}

/* NEW: Message actions (hover effects) */
.message-actions{display:flex;gap:6px;opacity:0;transition:opacity 0.2s ease;margin-top:6px;}
.mrow:hover .message-actions{opacity:1;}
.message-action-btn{background:var(--sf2);border:1px solid var(--bd);border-radius:6px;padding:4px 8px;cursor:pointer;color:var(--tx2);transition:all 0.15s;display:inline-flex;align-items:center;gap:4px;font-size:11px;}
.message-action-btn:hover{background:var(--ach);border-color:var(--bdh);color:var(--tx);}
.message-action-btn svg{width:12px;height:12px;}
.message-action-btn.copied{background:var(--blbg);border-color:var(--blbd);color:var(--bl);}

/* NEW: Toast notification */
.toast{position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:8px 16px;font-size:12px;color:var(--tx);z-index:1000;animation:toastIn 0.3s ease,toastOut 0.3s ease 2s forwards;pointer-events:none;}
@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(20px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}
@keyframes toastOut{to{opacity:0;transform:translateX(-50%) translateY(-20px);}}

/* Regenerate specific button */
.regenerate-btn{padding:4px 8px;background:var(--sf2);border:1px solid var(--bd);border-radius:6px;cursor:pointer;color:var(--tx2);font-size:11px;display:inline-flex;align-items:center;gap:4px;transition:all 0.15s;}
.regenerate-btn:hover{background:var(--blbg);border-color:var(--blbd);color:var(--bl);}
.regenerating{opacity:0.6;pointer-events:none;}

/* Improved loading state */
.loading-dots{display:flex;gap:8px;align-items:center;padding:12px;}
.loading-dots span{width:8px;height:8px;border-radius:50%;background:var(--tx3);animation:loadingWave 1.2s infinite ease-in-out;}
.loading-dots span:nth-child(1){animation-delay:-0.40s;}
.loading-dots span:nth-child(2){animation-delay:-0.20s;}
.loading-dots span:nth-child(3){animation-delay:0s;}
@keyframes loadingWave{0%,60%,100%{transform:scale(0.4);opacity:0.3;}30%{transform:scale(1.2);opacity:1;}}

.mrow{padding:var(--mp) 0;animation:msgIn .2s ease;}
@keyframes msgIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
.mrow-in{max-width:720px;margin:0 auto;padding:0 24px;display:flex;gap:12px;position:relative;}
.mrow.user .mrow-in{flex-direction:row-reverse;}
.av{width:26px;height:26px;border-radius:6px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;margin-top:2px;}
.av.ai{background:var(--sf2);border:1px solid var(--bd);color:var(--tx2);}
.av.user{background:var(--ac);border:1px solid var(--bd);color:var(--tx2);}
.mcol{display:flex;flex-direction:column;gap:4px;min-width:0;max-width:580px;}
.mrow.user .mcol{align-items:flex-end;}
.msender{font-size:11px;font-weight:500;color:var(--tx3);letter-spacing:.02em;}
.mbubble{font-size:var(--fs);font-weight:400;color:var(--tx);line-height:1.75;}
.mrow.user .mbubble{background:var(--sf2);border:1px solid var(--bd);padding:10px 14px;border-radius:10px 3px 10px 10px;display:inline-block;}
.mbubble p{margin-bottom:8px;}.mbubble p:last-child{margin-bottom:0;}
.mbubble h1,.mbubble h2,.mbubble h3{font-weight:600;color:var(--tx);margin:12px 0 6px;}
.mbubble h1{font-size:18px;}.mbubble h2{font-size:16px;}.mbubble h3{font-size:14px;}
.mbubble strong{font-weight:600;color:var(--tx);}
.mbubble em{font-style:italic;}
.mbubble ul,.mbubble ol{padding-left:20px;margin:6px 0;}
.mbubble li{margin-bottom:4px;line-height:1.65;}
.mbubble code{background:var(--sf2);border:1px solid var(--bd);padding:1px 5px;border-radius:4px;font-size:12px;font-family:'SF Mono','Fira Code',monospace;}
.mbubble pre{background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:12px 14px;margin:8px 0;overflow-x:auto;}
.mbubble pre code{background:none;border:none;padding:0;font-size:12px;}
.mbubble blockquote{border-left:3px solid var(--bl);padding-left:12px;margin:8px 0;color:var(--tx2);font-style:italic;}
.mbubble hr{border:none;border-top:1px solid var(--bd);margin:12px 0;}
.mbubble table{width:100%;border-collapse:collapse;margin:8px 0;font-size:13px;}
.mbubble th,.mbubble td{border:1px solid var(--bd);padding:7px 10px;text-align:left;}
.mbubble th{background:var(--sf2);font-weight:500;}
.mbubble a{color:var(--bl);text-decoration:underline;}

/* streaming - seamless char-by-char */
.stream-wrap{display:inline;}
.stream-char{display:inline;opacity:0;animation:cIn .08s ease forwards;}
@keyframes cIn{to{opacity:1}}
.cblink{display:inline-block;width:2px;height:13px;background:var(--tx2);margin-left:1px;vertical-align:middle;animation:cb .65s infinite;}
@keyframes cb{0%,100%{opacity:1}50%{opacity:0}}
.dots{display:flex;gap:4px;align-items:center;padding:2px 0;}
.dots span{width:4px;height:4px;border-radius:50%;background:var(--tx3);animation:pl 1.2s infinite;}
.dots span:nth-child(2){animation-delay:.18s}.dots span:nth-child(3){animation-delay:.36s}
@keyframes pl{0%,80%,100%{opacity:.2}40%{opacity:.8}}

/* ATTACH STRIP */
.file-strip{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;}
.file-chip{display:flex;align-items:center;gap:6px;padding:5px 10px;background:var(--sf2);border:1px solid var(--bd);border-radius:7px;font-size:11px;color:var(--tx2);}
.file-chip svg{width:12px;height:12px;opacity:.7;}
.file-thumb{width:28px;height:28px;border-radius:4px;object-fit:cover;flex-shrink:0;}
.fc-rm{background:none;border:none;cursor:pointer;color:var(--tx3);padding:0;margin-left:2px;display:flex;}
.fc-rm:hover{color:var(--tx);}
.fc-rm svg{width:11px;height:11px;}
/* attach msg chips */
.attach-row{display:flex;flex-wrap:wrap;gap:5px;margin-top:7px;}
.attach-chip{display:flex;align-items:center;gap:4px;padding:4px 9px;background:var(--sf2);border:1px solid var(--bd);border-radius:5px;font-size:11px;color:var(--tx2);}
.attach-chip svg{width:11px;height:11px;}

/* INPUT */
.iw{padding:10px 24px 14px;flex-shrink:0;}
.ic{max-width:720px;margin:0 auto;}
.ibox{display:flex;align-items:flex-end;gap:8px;background:var(--sf);border:1px solid var(--bd);border-radius:10px;padding:10px 12px;transition:border-color .15s,box-shadow .15s;}
.ibox:focus-within{border-color:var(--bdh);}
.ibox textarea{flex:1;background:transparent;border:none;outline:none;color:var(--tx);font-size:var(--fs);font-weight:400;font-family:inherit;resize:none;line-height:1.6;min-height:22px;max-height:160px;}
.ibox textarea::placeholder{color:var(--tx3);}
.send-btn{width:30px;height:30px;border-radius:7px;background:var(--tx);border:none;cursor:pointer;color:var(--bg);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:opacity .12s;}
.send-btn:hover{opacity:.82;}
.send-btn:disabled{background:var(--sf2);border:1px solid var(--bd);color:var(--tx3);cursor:default;opacity:1;}
.send-btn svg{width:14px;height:14px;}
.ifoot{display:flex;align-items:center;gap:6px;margin-top:8px;}
.ichip{padding:3px 9px;border-radius:5px;font-size:11px;font-weight:400;border:1px solid var(--bd);color:var(--tx3);background:transparent;cursor:pointer;transition:all .1s;font-family:inherit;display:flex;align-items:center;gap:4px;}
.ichip svg{width:12px;height:12px;}
.ichip:hover{border-color:var(--bdh);color:var(--tx2);}
.ichip.on{border-color:var(--blbd);color:var(--bl);}
.ichip.rec{border-color:rgba(220,60,60,.4);color:#e05555;animation:rp 1s infinite;}
@keyframes rp{0%,100%{opacity:1}50%{opacity:.5}}

/* CREDITS */
.cr-wrap{margin-left:auto;display:flex;align-items:center;gap:8px;cursor:pointer;position:relative;user-select:none;}
.cr-lbl{font-size:11px;color:var(--tx3);}
.cr-track{width:72px;height:3px;background:var(--bd);border-radius:2px;overflow:hidden;}
.cr-fill{height:100%;border-radius:2px;transition:width .6s ease,background .6s ease;}
.cr-pop{position:absolute;bottom:calc(100% + 10px);right:0;background:var(--sf);border:1px solid var(--bd);border-radius:10px;padding:14px 16px;min-width:230px;box-shadow:0 8px 24px rgba(0,0,0,.5);z-index:200;}
.cp-r{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}
.cp-l{font-size:12px;color:var(--tx2);}
.cp-v{font-size:12px;font-weight:600;color:var(--tx);}
.cp-note{font-size:11px;color:var(--tx3);margin-top:8px;padding-top:8px;border-top:1px solid var(--bd);line-height:1.6;}

/* QUICK CAPTURE */
.qc-btn{position:fixed;bottom:28px;right:28px;width:40px;height:40px;border-radius:50%;background:var(--bl);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,.4);z-index:300;transition:all .15s;}
.qc-btn:hover{transform:scale(1.08);}
.qc-btn svg{width:16px;height:16px;color:white;}
.qc-modal{position:fixed;bottom:78px;right:28px;background:var(--sf);border:1px solid var(--bd);border-radius:12px;padding:16px;width:300px;box-shadow:0 8px 32px rgba(0,0,0,.5);z-index:300;animation:slideUp .18s ease;}
.qc-title{font-size:12px;font-weight:500;color:var(--tx2);margin-bottom:10px;letter-spacing:.04em;}
.qc-inp{width:100%;background:var(--sf2);border:1px solid var(--bd);border-radius:var(--r);padding:9px 12px;color:var(--tx);font-size:13px;font-family:inherit;outline:none;resize:none;min-height:80px;transition:border-color .15s;line-height:1.6;}
.qc-inp:focus{border-color:var(--bdh);}
.qc-inp::placeholder{color:var(--tx3);}
.qc-foot{display:flex;gap:8px;margin-top:10px;}
.qc-save{flex:1;padding:8px;border-radius:6px;background:var(--bl);border:none;color:#fff;font-size:12px;font-weight:500;cursor:pointer;font-family:inherit;}
.qc-cancel{padding:8px 14px;border-radius:6px;background:transparent;border:1px solid var(--bd);color:var(--tx2);font-size:12px;cursor:pointer;font-family:inherit;}

.err{background:rgba(220,60,60,.07);border:1px solid rgba(220,60,60,.18);border-radius:8px;padding:10px 14px;font-size:12px;color:rgba(255,140,140,.85);margin:8px 0;}
.s-inp{width:100%;background:var(--sf);border:1px solid var(--bd);border-radius:var(--r);padding:9px 12px;color:var(--tx);font-size:13px;font-family:inherit;outline:none;transition:border-color .15s;margin-bottom:16px;display:block;}
.s-inp:focus{border-color:var(--bdh);}
.s-inp::placeholder{color:var(--tx3);}
`;

// ─── STREAMING WITH SEAMLESS CHAR ANIMATION ───────────────────────────────────
function StreamingBubble({ text }) {
  const prevLen = useRef(0);
  const chars = text.split("");
  const newStart = prevLen.current;
  useEffect(() => { prevLen.current = text.length; });
  return (
    <div className="mbubble stream-wrap">
      {chars.map((ch, i) => (
        <span key={i} className="stream-char" style={{ animationDelay: i >= newStart ? `${(i - newStart) * 0.008}s` : "0s", opacity: i < newStart ? 1 : undefined }}>
          {ch}
        </span>
      ))}
      <span className="cblink" />
    </div>
  );
}

// ─── TOAST COMPONENT ─────────────────────────────────────────────────────────
function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);
  return <div className="toast">{message}</div>;
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  // THEME & SETTINGS
  const [theme, setTheme]       = useState("dark");
  const [fontSize, setFontSize] = useState(14);
  const [density, setDensity]   = useState("normal");
  const [custToggles, setCustToggles] = useState({ timestamps:false, sounds:false, codeHighlight:true, autoScroll:true });

  // AUTH
  const [authed, setAuthed]     = useState(false);
  const [authTab, setAuthTab]   = useState("signin");
  const [email, setEmail]       = useState("");
  const [pass, setPass]         = useState("");
  const [authErr, setAuthErr]   = useState("");
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [userBio, setUserBio]   = useState("");
  const [userPlan, setUserPlan] = useState("Free");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [userNameEdit, setUserNameEdit] = useState("");
  const [userBioEdit, setUserBioEdit]   = useState("");

  // APP STATE
  const [view, setView]         = useState("chat");
  const [lvl, setLvl]           = useState(1);
  const [model, setModel]       = useState(MODELS[1]);
  const [tone, setTone]         = useState("alfred");
  const [sbOpen, setSb]         = useState(true);
  const [convs, setConvs]       = useState([]);
  const [cid, setCid]           = useState(null);
  const [msgCount, setMsgCount] = useState(0);
  const [inp, setInp]           = useState("");
  const [streaming, setStream]  = useState(false);
  const [streamTxt, setStreamTxt] = useState("");
  const [web, setWeb]           = useState(false);
  const [err, setErr]           = useState("");
  const [renamingId, setRenamingId] = useState(null);
  const [renameVal, setRenameVal]   = useState("");
  const [searchQ, setSearchQ]   = useState("");
  const [projects, setProjects] = useState([]);
  const [newProjName, setNewProjName] = useState("");
  const [openProjId, setOpenProjId]   = useState(null);
  const [projNotes, setProjNotes]     = useState({});
  const [projCtxCards, setProjCtxCards] = useState({});
  const [openCtxCard, setOpenCtxCard]   = useState(null);
  const [credits, setCredits]   = useState(CREDIT_MAX);
  const [memory, setMemory]     = useState([]);
  const [memInp, setMemInp]     = useState("");
  const [showLevelPicker, setShowLevelPicker] = useState(false);
  const [pendingConvId, setPendingConvId]     = useState(null);
  const [expandedLevel, setExpandedLevel]     = useState(null);
  const [attachedFiles, setAttachedFiles]     = useState([]);
  const [recording, setRecording]             = useState(false);
  const [philOpen, setPhilOpen]               = useState(null);
  const [quickCapture, setQuickCapture]       = useState(false);
  const [qcText, setQcText]                   = useState("");
  const [totalConvs, setTotalConvs]           = useState(0);
  const [totalMsgs, setTotalMsgs]             = useState(0);
  
  // NEW: Toast notification state
  const [toast, setToast] = useState(null);
  // NEW: Regenerating state
  const [regenerating, setRegenerating] = useState(false);
  // NEW: Track last user message for regeneration
  const [lastUserMessage, setLastUserMessage] = useState(null);
  const [lastAssistantMessageId, setLastAssistantMessageId] = useState(null);

  const endRef   = useRef(null);
  const taRef    = useRef(null);
  const abortRef = useRef(null);
  const fileRef  = useRef(null);
  const mediaRef = useRef(null);
  const avatarRef = useRef(null);

  const th    = THEMES[theme];
  const level = LEVELS[lvl];
  const conv  = convs.find(c => c.id === cid);
  const msgs  = conv?.msgs ?? [];
  const openProj = projects.find(p => p.id === openProjId);

  const sfx = useCallback((type) => { if (custToggles.sounds) playTone(type); }, [custToggles.sounds]);

  // Helper: Show toast notification
  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }, []);

  // Helper: Copy to clipboard
  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!");
    sfx("click");
  }, [showToast, sfx]);

  useEffect(() => { if (custToggles.autoScroll) endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, streaming, streamTxt, custToggles.autoScroll]);

  useEffect(() => {
    if (!authed) return;
    const id = setInterval(() => {
      setCredits(c => c >= CREDIT_MAX ? CREDIT_MAX : Math.min(CREDIT_MAX, c + 10000/360));
    }, 10000);
    return () => clearInterval(id);
  }, [authed]);

  const updateConv = useCallback((id, fn) => {
    setConvs(cs => cs.map(c => c.id === id ? fn(c) : c));
  }, []);

  const startNew = useCallback(() => {
    const id = Date.now();
    setConvs(cs => [{ id, title:"New conversation", msgs:[], levelIdx:null }, ...cs]);
    setCid(id); setPendingConvId(id);
    setShowLevelPicker(true); setErr(""); setView("chat");
    setTotalConvs(n => n+1);
    setLastUserMessage(null);
    setLastAssistantMessageId(null);
    sfx("click");
  }, [sfx]);

  const confirmLevel = (idx) => {
    setLvl(idx); setShowLevelPicker(false);
    if (pendingConvId) { updateConv(pendingConvId, c => ({ ...c, levelIdx:idx })); setPendingConvId(null); }
    sfx("click");
  };

  // AUTH
  const doAuth = () => {
    setAuthErr("");
    if (!email.trim() || !pass.trim()) { setAuthErr("Please fill in all fields."); return; }
    if (authTab === "signin") {
      if (email.trim() === VALID_EMAIL && pass === VALID_PASS) {
        setAuthed(true); setUserName("Bhavya"); setUserEmail(email.trim());
        setUserNameEdit("Bhavya"); setUserBioEdit("");
      } else setAuthErr("Invalid email or password.");
    } else {
      if (pass.length < 8) { setAuthErr("Password must be at least 8 characters."); return; }
      setAuthed(true);
      const name = email.split("@")[0];
      setUserName(name); setUserEmail(email.trim());
      setUserNameEdit(name); setUserBioEdit("");
    }
  };

  // FILE
  const handleFile = (e) => {
    const files = Array.from(e.target.files||[]);
    if (!files.length) return;
    sfx("click");
    setAttachedFiles(p => [...p, ...files.map(f => ({
      name:f.name, type:f.type, size:f.size,
      url:f.type.startsWith("image/")?URL.createObjectURL(f):null, raw:f
    }))]);
    e.target.value = "";
  };

  // VOICE
  const toggleRec = async () => {
    if (recording) { mediaRef.current?.stop(); setRecording(false); sfx("click"); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
      const rec = new MediaRecorder(stream);
      mediaRef.current = rec;
      const chunks = [];
      rec.ondataavailable = e => chunks.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach(t=>t.stop());
        const blob = new Blob(chunks,{type:"audio/webm"});
        setAttachedFiles(p=>[...p,{name:"voice-note.webm",type:"audio/webm",size:blob.size,url:null,raw:blob}]);
      };
      rec.start(); setRecording(true); sfx("click");
    } catch { setErr("Microphone access denied."); }
  };

  // Core send function (can be called with a custom message, for regeneration)
  const send = async (text, isRegenerate = false, originalUserMessage = null) => {
    const t2 = (text ?? inp).trim();
    if ((!t2 && attachedFiles.length===0 && !isRegenerate) || streaming || regenerating) return;
    if (credits < 5 && !isRegenerate) { setErr("Out of credits. Replenishing shortly."); return; }
    
    if (!isRegenerate) {
      setInp(""); setErr("");
      if (taRef.current) taRef.current.style.height = "auto";
      sfx("send");
    } else {
      setRegenerating(true);
    }

    const fileSnap = [...attachedFiles];
    if (!isRegenerate) setAttachedFiles([]);

    let userMsg, histMsgs;
    
    if (isRegenerate && originalUserMessage) {
      // For regeneration: we need to replace the last assistant message
      userMsg = originalUserMessage;
      histMsgs = [...(conv?.msgs || [])];
      // Remove the last assistant message if it exists
      if (histMsgs.length > 0 && histMsgs[histMsgs.length - 1].role === "assistant") {
        histMsgs.pop();
      }
      // Add the user message back if it's not already the last
      if (histMsgs[histMsgs.length - 1]?.role !== "user") {
        histMsgs.push(userMsg);
      }
    } else {
      userMsg = { role:"user", content:t2||(fileSnap[0]?.name||"File"), files:fileSnap };
      updateConv(cid, c => {
        histMsgs = [...c.msgs, userMsg];
        const title = c.msgs.length===0 ? (t2||fileSnap[0]?.name||"File").slice(0,40)+"…" : c.title;
        return { ...c, msgs:histMsgs, title };
      });
      
      // Store last user message for potential regeneration
      setLastUserMessage(userMsg);
    }

    const newMsgCount = msgCount + 1;
    if (!isRegenerate) {
      setMsgCount(newMsgCount);
      setTotalMsgs(n => n+1);
    }

    if (!isRegenerate) {
      const baseCost = Math.max(800, Math.round(
        (t2.length * 2 + fileSnap.length * 800) * model.costMult * (1 + newMsgCount * 0.15)
      ));
      const clampedCost = Math.min(baseCost, 8000);
      setCredits(c => Math.max(0, c - clampedCost));
    }

    setStream(true); setStreamTxt("");

    try {
      abortRef.current = new AbortController();
      const convLvl = LEVELS[conv?.levelIdx ?? lvl];
      
      const apiMsgs = histMsgs.map(m => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content
      }));

      const systemPrompt = buildSystem(convLvl, memory, tone, fileSnap);
      const fullMessages = [{ role: "system", content: systemPrompt }, ...apiMsgs];

      const response = await fetch("https://trajectorygroq.trajectory-group.workers.dev", {
        method: "POST",
        signal: abortRef.current.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: fullMessages,
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `API error ${response.status}`);
      }

      const data = await response.json();
      const fullResponse = data.choices[0].message.content;

      if (!isRegenerate) {
        const outCost = Math.max(500, Math.round(fullResponse.length * 0.8 * model.costMult));
        setCredits(c => Math.max(0, c - outCost));
      }

      sfx("receive");
      
      if (isRegenerate) {
        // Replace the last message (remove old assistant, add new one)
        updateConv(cid, c => {
          const newMsgs = [...c.msgs];
          // Remove last message if it's assistant
          if (newMsgs.length > 0 && newMsgs[newMsgs.length - 1].role === "assistant") {
            newMsgs.pop();
          }
          return { ...c, msgs: [...newMsgs, { role: "assistant", content: fullResponse }] };
        });
        setRegenerating(false);
        showToast("Response regenerated!");
      } else {
        updateConv(cid, c => ({ ...c, msgs:[...c.msgs,{role:"assistant",content:fullResponse}] }));
        // Store the ID of the new assistant message for regeneration tracking
        setLastAssistantMessageId(Date.now());
      }

    } catch(e) {
      if (e.name !== "AbortError") {
        setErr(e.message || "Something went wrong.");
        showToast("Error: " + (e.message || "Something went wrong"));
      }
      if (isRegenerate) setRegenerating(false);
    } finally {
      setStream(false); 
      setStreamTxt("");
      abortRef.current = null;
      if (!isRegenerate) {
        // Clear attached files after send
        setAttachedFiles([]);
      }
    }
  };

  // Regenerate function
  const regenerate = useCallback(() => {
    if (!lastUserMessage || regenerating || streaming) return;
    send(null, true, lastUserMessage);
  }, [lastUserMessage, regenerating, streaming, send]);

  // AVATAR
  const handleAvatar = (e) => {
    const f = e.target.files?.[0];
    if (f) { setAvatarUrl(URL.createObjectURL(f)); sfx("click"); }
    e.target.value="";
  };

  const SbRow = ({ id, icon, label }) => (
    <div className={`sr ${view===id?"on":""}`} onClick={()=>{ setView(id); sfx("click"); }}>
      {icon}<span className="sr-txt">{label}</span>
    </div>
  );

  const filteredConvs = convs.filter(c => c.msgs.length>0 && c.title.toLowerCase().includes(searchQ.toLowerCase()));
  const initials = (userName?.slice(0,2) || "US").toUpperCase();

  // Message component with actions
  const Message = ({ message, index, isLast }) => {
    const isUser = message.role === "user";
    const [copied, setCopied] = useState(false);
    
    const handleCopy = () => {
      copyToClipboard(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    
    const handleRegenerate = () => {
      if (!isLast && !isUser) return;
      if (isLast && !isUser) {
        regenerate();
      }
    };
    
    return (
      <div className={`mrow ${isUser ? "user" : "ai"}`}>
        <div className="mrow-in">
          <div className={`av ${isUser ? "user" : "ai"}`}>{isUser ? initials.slice(0,1) : "T"}</div>
          <div className="mcol">
            <div className="msender">{isUser ? userName : "Trajectory"}</div>
            {!isUser ? (
              <div className="mbubble" dangerouslySetInnerHTML={{ __html: renderMD(message.content) }} />
            ) : (
              <div className="mbubble">{message.content}</div>
            )}
            {message.files?.length > 0 && (
              <div className="attach-row">
                {message.files.map((f, fi) => (
                  <div key={fi} className="attach-chip">
                    {f.type?.startsWith("image/") ? I.image : I.doc}
                    {f.name.length > 22 ? f.name.slice(0, 20) + "…" : f.name}
                  </div>
                ))}
              </div>
            )}
            {/* Message Actions - only show for assistant messages that are last */}
            {!isUser && isLast && (
              <div className="message-actions">
                <button className={`message-action-btn ${copied ? "copied" : ""}`} onClick={handleCopy} title="Copy response">
                  {I.copy}
                  <span>Copy</span>
                </button>
                <button className="message-action-btn" onClick={handleRegenerate} title="Regenerate response" disabled={regenerating}>
                  {I.refresh}
                  <span>Regenerate</span>
                </button>
              </div>
            )}
            {/* Show actions for user messages too (without regenerate) */}
            {isUser && (
              <div className="message-actions">
                <button className="message-action-btn" onClick={handleCopy} title="Copy message">
                  {I.copy}
                  <span>Copy</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── AUTH SCREEN ───────────────────────────────────────────────────────────────
  if (!authed) {
    const socials = [
      { label:"Google",    svg:<svg className="soc-icon" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> },
      { label:"GitHub",    svg:<svg className="soc-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg> },
      { label:"Apple",     svg:<svg className="soc-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg> },
      { label:"Microsoft", svg:<svg className="soc-icon" viewBox="0 0 24 24"><path fill="#f25022" d="M1 1h10v10H1z"/><path fill="#00a4ef" d="M13 1h10v10H13z"/><path fill="#7fba00" d="M1 13h10v10H1z"/><path fill="#ffb900" d="M13 13h10v10H13z"/></svg> },
      { label:"X / Twitter", svg:<svg className="soc-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
      { label:"LinkedIn",  svg:<svg className="soc-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg> },
    ];
    return (
      <>
        <style>{makeCSS(th,fontSize,density)}</style>
        <div className="auth-wrap">
          <div className="auth-box">
            <div className="auth-logo">Trajectory<span>.</span></div>
            <div className="auth-sub">The AI that keeps you thinking.</div>
            <div className="auth-tabs">
              <button className={`auth-tab${authTab==="signin"?" on":""}`} onClick={()=>{setAuthTab("signin");setAuthErr("");}}>Sign in</button>
              <button className={`auth-tab${authTab==="signup"?" on":""}`} onClick={()=>{setAuthTab("signup");setAuthErr("");}}>Sign up</button>
            </div>
            <div className="auth-field"><label className="auth-label">Email</label>
              <input className="auth-input" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doAuth()}/></div>
            <div className="auth-field"><label className="auth-label">Password</label>
              <input className="auth-input" type="password" placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doAuth()}/></div>
            {authErr&&<div className="auth-err">{authErr}</div>}
            <button className="auth-btn" onClick={doAuth} style={{marginTop:10}}>{authTab==="signin"?"Sign in":"Create account"}</button>
            <div className="auth-div"><span>or continue with</span></div>
            <div className="auth-social">
              {socials.map(s=>(
                <button key={s.label} className="auth-soc-btn" onClick={()=>setAuthed(true)}>{s.svg}{s.label}</button>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── LEVEL PICKER ──────────────────────────────────────────────────────────────
  const LevelPicker = () => (
    <div className="overlay">
      <div className="modal">
        <div className="modal-title">Choose your level</div>
        <div className="modal-sub">Sets how Trajectory engages in this conversation. You can change it anytime.</div>
        {LEVELS.map((l,i)=>(
          <div key={i} className="lvl-pick" onClick={()=>confirmLevel(i)}>
            <div className="lvl-n">{l.n}</div>
            <div><div className="lvl-nm">{l.name}</div><div className="lvl-ds">{l.desc}</div></div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <style>{makeCSS(th,fontSize,density)}</style>
      {showLevelPicker && <LevelPicker />}
      
      {/* Toast Notification */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* QUICK CAPTURE */}
      <button className="qc-btn" onClick={()=>setQuickCapture(o=>!o)} title="Quick capture">{I.capture}</button>
      {quickCapture && (
        <div className="qc-modal">
          <div className="qc-title">QUICK CAPTURE</div>
          <textarea className="qc-inp" placeholder="Capture a thought, idea, or note…" value={qcText} autoFocus
            onChange={e=>setQcText(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&e.metaKey){if(qcText.trim()){setMemory(m=>[...m,qcText.trim()]);setQcText("");setQuickCapture(false);sfx("click");}}}}/>
          <div className="qc-foot">
            <button className="qc-save" onClick={()=>{
              if(qcText.trim()){
                setMemory(m=>[...m,qcText.trim()]);
                setQcText("");
                setQuickCapture(false);
                sfx("click");
              }
            }}>Save to memory</button>
            <button className="qc-cancel" onClick={()=>{setQuickCapture(false);setQcText("");}}>Cancel</button>
          </div>
        </div>
      )}

      <div className="shell">
        {/* SIDEBAR */}
        <aside className={`sb${sbOpen?"":" closed"}`}>
          <div className="sb-in">
            <div className="sb-top">
              <span className="logo">Trajectory<span className="logo-dot">.</span></span>
              <div className="sb-acts">
                <button className="ib" onClick={startNew}>{I.plus}</button>
                <button className="ib" onClick={()=>setSb(false)}>{I.left}</button>
              </div>
            </div>
            <div className="sb-scroll">
              <div className="sb-grp">
                <SbRow id="chat"      icon={I.chat}    label="Chat"       />
                <SbRow id="search"    icon={I.search}  label="Search"     />
                <SbRow id="projects"  icon={I.folder}  label="Projects"   />
                <SbRow id="memory"    icon={I.memory}  label="Memory"     />
                <SbRow id="levels"    icon={I.levels}  label="Levels"     />
                <SbRow id="phil"      icon={I.phil}    label="Philosophy" />
                <SbRow id="pricing"   icon={I.pricing} label="Pricing"    />
                <SbRow id="customize" icon={I.cog}     label="Customize"  />
              </div>
              <div className="sb-sep"/>
              <div className="sb-grp">
                <div className="sb-lbl">Recent</div>
                {convs.filter(c=>c.msgs.length>0).slice(0,10).map(c=>(
                  <div key={c.id} className={`sr ${cid===c.id&&view==="chat"?"on":""}`}
                    onDoubleClick={()=>{setRenamingId(c.id);setRenameVal(c.title);}}>
                    {I.clock}
                    {renamingId===c.id?(
                      <input className="conv-rename" value={renameVal} autoFocus
                        onChange={e=>setRenameVal(e.target.value)}
                        onBlur={()=>{if(renameVal.trim())updateConv(c.id,cv=>({...cv,title:renameVal.trim()}));setRenamingId(null);}}
                        onKeyDown={e=>{if(e.key==="Enter"){if(renameVal.trim())updateConv(c.id,cv=>({...cv,title:renameVal.trim()}));setRenamingId(null);}if(e.key==="Escape")setRenamingId(null);}}
                        onClick={e=>e.stopPropagation()}/>
                    ):(
                      <span className="sr-txt" onClick={()=>{setCid(c.id);setView("chat");}}>{c.title}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* LEVEL PILL */}
            <div className="level-pill" onClick={()=>setView("levels")}>
              <div className="lbadge">{level.n}</div>
              <div style={{flex:1,minWidth:0}}>
                <div className="lname3">{level.name}</div>
                <div className="lsub3">Change level</div>
              </div>
            </div>

            {/* USER PROFILE PILL */}
            <div className="user-pill" onClick={()=>setView("profile")}>
              <div className="user-avatar">
                {avatarUrl ? <img src={avatarUrl} alt="avatar"/> : initials}
              </div>
              <div className="user-info">
                <div className="user-name">{userName}</div>
                <div className="user-plan">{userPlan} plan</div>
              </div>
              <button className="ib" onClick={e=>{e.stopPropagation();setAuthed(false);setConvs([]);setCid(null);setEmail("");setPass("");}} title="Sign out">
                {I.logout}
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main">
          <div className="topbar">
            {!sbOpen&&<button className="ib" onClick={()=>setSb(true)}>{I.right}</button>}
            <span className="tb-title">
              {view==="chat"      ? (conv?.title??"Trajectory")
               :view==="search"  ? "Search"
               :view==="projects"? (openProj?openProj.name:"Projects")
               :view==="memory"  ? "Memory"
               :view==="levels"  ? "Levels"
               :view==="phil"    ? "Philosophy"
               :view==="pricing" ? "Pricing"
               :view==="profile" ? "Profile"
               : "Customize"}
            </span>
            {view==="chat"&&<>
              <ModelSel model={model} onChange={setModel}/>
              {/* TONE TOGGLE */}
              <div className="tone-toggle">
                <button className={`tone-btn${tone==="alfred"?" on":""}`} onClick={()=>setTone("alfred")}>Alfred</button>
                <button className={`tone-btn${tone==="socrates"?" on":""}`} onClick={()=>setTone("socrates")}>Socrates</button>
              </div>
              <button className={`chip${web?" on":""}`} onClick={()=>setWeb(v=>!v)}>Web</button>
              {conv&&<button className="ib" title="Export" onClick={()=>exportConv(conv)}>{I.export2}</button>}
              <button className="ib" onClick={startNew}>{I.plus}</button>
            </>}
            {view==="projects"&&openProj&&(
              <button className="ib" onClick={()=>setOpenProjId(null)}>{I.left}</button>
            )}
          </div>

          {/* ── CHAT ── */}
          {view==="chat"&&(
            <div className="chat">
              <div className="msgs">
                {(!conv||msgs.length===0)&&!streaming?(
                  <div className="empty">
                    <div className="empty-logo">Trajectory.</div>
                    <div className="starters">
                      {STARTERS.map(s=>(
                        <button key={s} className="starter" onClick={()=>{if(!conv)startNew();else send(s);}}>{s}</button>
                      ))}
                    </div>
                  </div>
                ):(
                  <>
                    {msgs.map((m,i)=>(
                      <Message key={i} message={m} index={i} isLast={i === msgs.length - 1 && !streaming} />
                    ))}
                    {streaming&&(
                      <div className="mrow ai">
                        <div className="mrow-in">
                          <div className="av ai">T</div>
                          <div className="mcol">
                            <div className="msender">Trajectory</div>
                            {streamTxt
                              ? <StreamingBubble text={streamTxt}/>
                              : (
                                <div className="thinking-indicator">
                                  <div className="thinking-dots">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                  </div>
                                  <span className="thinking-text">Thinking...</span>
                                </div>
                              )
                            }
                          </div>
                        </div>
                      </div>
                    )}
                    {regenerating && (
                      <div className="mrow ai">
                        <div className="mrow-in">
                          <div className="av ai">T</div>
                          <div className="mcol">
                            <div className="msender">Trajectory</div>
                            <div className="thinking-indicator">
                              <div className="thinking-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                              </div>
                              <span className="thinking-text">Regenerating...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {err&&<div style={{maxWidth:720,margin:"8px auto",padding:"0 24px"}}><div className="err">{err}</div></div>}
                    <div ref={endRef} style={{height:8}}/>
                  </>
                )}
              </div>
              <div className="iw">
                <div className="ic">
                  {attachedFiles.length>0&&(
                    <div className="file-strip">
                      {attachedFiles.map((f,i)=>(
                        <div key={i} className="file-chip">
                          {f.url?<img src={f.url} className="file-thumb" alt=""/>:(f.type?.startsWith("audio/")?I.mic:I.doc)}
                          <span>{f.name.length>18?f.name.slice(0,16)+"…":f.name}</span>
                          <button className="fc-rm" onClick={()=>setAttachedFiles(a=>a.filter((_,j)=>j!==i))}>{I.x}</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="ibox">
                    <textarea ref={taRef} placeholder="Message Trajectory…" value={inp} rows={1}
                      onChange={e=>{setInp(e.target.value);e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,160)+"px";}}
                      onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();if(!conv)startNew();else send();}}}/>
                    <button className="send-btn" onClick={()=>conv?send():startNew()} disabled={(!inp.trim()&&attachedFiles.length===0)||streaming||regenerating}>
                      {I.send}
                    </button>
                  </div>
                  <div className="ifoot">
                    <input type="file" ref={fileRef} style={{display:"none"}} multiple
                      accept="image/*,video/*,.pdf,.doc,.docx,.txt,.csv,.json,.py,.js,.ts,.md"
                      onChange={handleFile}/>
                    <button className="ichip" onClick={()=>fileRef.current?.click()}>{I.attach}Attach</button>
                    <button className={`ichip${recording?" rec":""}`} onClick={toggleRec}>{I.mic}{recording?"Stop":"Voice"}</button>
                    <button className={`ichip${web?" on":""}`} onClick={()=>setWeb(v=>!v)}>{I.search}Search</button>
                    <CreditBar credits={credits}/>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SEARCH ── */}
          {view==="search"&&(
            <div className="page"><div className="pb">
              <div className="p-eye">Search</div>
              <div className="p-h">Find conversations</div>
              <input className="s-inp" placeholder="Search by keyword…" value={searchQ} onChange={e=>setSearchQ(e.target.value)} autoFocus/>
              {filteredConvs.length>0?filteredConvs.map(c=>(
                <div key={c.id} className="card" style={{cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between"}}
                  onClick={()=>{setCid(c.id);setView("chat");}}>
                  <div><div className="c-h">{c.title}</div><div className="c-p">{c.msgs.length} messages</div></div>
                  <button className="ib" onClick={e=>{e.stopPropagation();exportConv(c);}}>{I.export2}</button>
                </div>
              )):searchQ?<div style={{fontSize:13,color:"var(--tx3)",textAlign:"center",paddingTop:32}}>No results for "{searchQ}"</div>
              :<div style={{fontSize:13,color:"var(--tx3)",textAlign:"center",paddingTop:32}}>Start typing to search</div>}
            </div></div>
          )}

          {/* ── PROJECTS ── */}
          {view==="projects"&&(
            openProj?(
              <div className="proj-detail">
                <div className="page"><div className="pb">
                  <div className="p-eye">Project</div>
                  <div className="p-h">{openProj.name}</div>
                  <div style={{marginBottom:20}}>
                    <div className="cust-h" style={{marginBottom:10}}>Context Cards</div>
                    <div className="ctx-cards">
                      {(projCtxCards[openProj.id]||[]).map((card,ci)=>(
                        <div key={ci} className={`ctx-card${card.pinned?" pinned":""}`}>
                          <div className="ctx-card-hdr" onClick={()=>setOpenCtxCard(openCtxCard===ci?null:ci)}>
                            <span style={{fontSize:14,opacity:.6}}>{I.pin}</span>
                            <span className="ctx-card-title">{card.title||"Untitled card"}</span>
                            <button className="ib" onClick={e=>{e.stopPropagation();setProjCtxCards(p=>({...p,[openProj.id]:p[openProj.id].filter((_,j)=>j!==ci)}));}}>{I.x}</button>
                          </div>
                          {openCtxCard===ci&&(
                            <div className="ctx-card-body">
                              <textarea className="ctx-card-inp" value={card.content}
                                placeholder="Add context, notes, constraints…"
                                onChange={e=>{setProjCtxCards(p=>({...p,[openProj.id]:p[openProj.id].map((c2,j)=>j===ci?{...c2,content:e.target.value}:c2)}));}}/>
                            </div>
                          )}
                        </div>
                      ))}
                      <button className="ichip" style={{alignSelf:"flex-start"}} onClick={()=>{
                        const title=window.prompt?window.prompt("Card title:","Context"):"Context";
                        if(title){setProjCtxCards(p=>({...p,[openProj.id]:[...(p[openProj.id]||[]),{title,content:"",pinned:true}]}))}
                      }}>{I.plus}Add context card</button>
                    </div>
                  </div>
                  <div className="cust-h" style={{marginBottom:10}}>Notes</div>
                  <textarea className="proj-notes-area" placeholder="Add notes, ideas, or context for this project…"
                    value={projNotes[openProj.id]||""}
                    onChange={e=>setProjNotes(n=>({...n,[openProj.id]:e.target.value}))} rows={8}/>
                  <div style={{display:"flex",gap:10,marginTop:16}}>
                    <button className="pbtn2 open" onClick={()=>{startNew();}}>Open in Chat →</button>
                    <button className="pbtn2 ghost2" onClick={()=>setOpenProjId(null)}>Back</button>
                  </div>
                </div></div>
              </div>
            ):(
              <div className="page"><div className="pb">
                <div className="p-eye">Projects</div>
                <div className="p-h">Projects</div>
                <div className="p-lead">Focused workspaces. Click a project to open its notes and context.</div>
                <div className="proj-grid">
                  {projects.map(p=>(
                    <div key={p.id} className="proj-card">
                      <div className="proj-name">{p.name}</div>
                      <div className="proj-meta">Created {new Date(p.id).toLocaleDateString()}</div>
                      {(projCtxCards[p.id]||[]).length>0&&(
                        <div className="proj-tags">{(projCtxCards[p.id]||[]).slice(0,3).map((c,i)=><span key={i} className="proj-tag">{c.title}</span>)}</div>
                      )}
                      <div className="proj-actions">
                        <button className="pbtn2 open" onClick={()=>setOpenProjId(p.id)}>Open</button>
                        <button className="pbtn2 ghost2" onClick={()=>{setProjects(ps=>ps.filter(x=>x.id!==p.id));if(openProjId===p.id)setOpenProjId(null);}}>Delete</button>
                      </div>
                    </div>
                  ))}
                  {projects.length===0&&<div style={{fontSize:13,color:"var(--tx3)",gridColumn:"1/-1",padding:"20px 0"}}>No projects yet.</div>}
                  <div className="proj-card new-p" onClick={()=>{
                    const n=prompt("Project name:");
                    if(n?.trim()){setProjects(ps=>[...ps,{id:Date.now(),name:n.trim()}]);sfx("click");}
                  }}>{I.plus}New project</div>
                </div>
                <div className="cust-h" style={{marginBottom:10,marginTop:8}}>Create project</div>
                <input className="proj-inp" placeholder="Project name…" value={newProjName} onChange={e=>setNewProjName(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter"&&newProjName.trim()){setProjects(ps=>[...ps,{id:Date.now(),name:newProjName.trim()}]);setNewProjName("");sfx("click");}}}/>
                <button className="proj-save" onClick={()=>{if(newProjName.trim()){setProjects(ps=>[...ps,{id:Date.now(),name:newProjName.trim()}]);setNewProjName("");sfx("click");}}}>Create</button>
              </div></div>
            )
          )}

          {/* ── MEMORY ── */}
          {view==="memory"&&(
            <div className="page"><div className="pb">
              <div className="p-eye">Memory</div>
              <div className="p-h">What Trajectory remembers</div>
              <div className="p-lead">These are injected into every conversation. Add anything that shapes how you want Trajectory to understand and engage with you.</div>
              {memory.length===0&&<div style={{fontSize:13,color:"var(--tx3)",marginBottom:20}}>No memories yet. Add one below.</div>}
              {memory.map((m,i)=>(
                <div key={i} className="mem-item">
                  <div className="mem-txt">{m}</div>
                  <button className="mem-del" onClick={()=>{setMemory(ms=>ms.filter((_,j)=>j!==i));sfx("click");}}>×</button>
                </div>
              ))}
              <div className="mem-add-row">
                <input className="mem-inp" placeholder="e.g. I prefer concise technical explanations…"
                  value={memInp} onChange={e=>setMemInp(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter"&&memInp.trim()){setMemory(m=>[...m,memInp.trim()]);setMemInp("");sfx("click");}}}/>
                <button className="mem-add-btn" onClick={()=>{if(memInp.trim()){setMemory(m=>[...m,memInp.trim()]);setMemInp("");sfx("click");}}}>Add</button>
              </div>
            </div></div>
          )}

          {/* ── LEVELS ── */}
          {view==="levels"&&(
            <div className="page"><div className="pb">
              <div className="p-eye">System</div>
              <div className="p-h">Cognitive levels</div>
              <div className="p-lead">Every new chat asks you to select a level. Click any level below to read the philosophy behind it, or set it as your default.</div>
              {LEVELS.map((l,i)=>(
                <div key={i} style={{marginBottom:8}}>
                  <div className={`lrow${lvl===i?" cur":""}`} onClick={()=>setExpandedLevel(expandedLevel===i?null:i)}>
                    <div className="lnum">{l.n}</div>
                    <div style={{flex:1}}>
                      <div className="ll">{l.name}</div>
                      <div className="ld">{l.desc}</div>
                    </div>
                    {lvl===i&&<div className="ltag">Default</div>}
                    <span style={{marginLeft:8,color:"var(--tx3)",transition:"transform .2s",transform:expandedLevel===i?"rotate(180deg)":"none",display:"flex"}}>{I.chevron}</span>
                  </div>
                  {expandedLevel===i&&(
                    <div className="level-phil">
                      {l.philosophy}
                      <br/>
                      <button className="level-set-btn" onClick={()=>{setLvl(i);sfx("click");}}>
                        {lvl===i?"Current default":"Set as default"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div></div>
          )}

          {/* ── PHILOSOPHY ── */}
          {view==="phil"&&(
            <div className="page"><div className="pb">
              <div className="p-eye">Philosophy</div>
              <div className="phil-hero">
                <div className="phil-quote">"AI should enhance cognition, not replace it."</div>
                <div className="phil-attr">The principle behind Trajectory</div>
              </div>
              <div className="phil-grid">
                {[
                  {icon:"🧠",title:"Cognitive engagement",body:"Trajectory keeps your brain in the loop. It helps in a way that requires you to think first."},
                  {icon:"📈",title:"Progressive autonomy",body:"As your level rises, Trajectory steps back. The goal is to make the tool less necessary over time."},
                  {icon:"⚖️",title:"Calibrated resistance",body:"The right amount of friction at the right time. Not obstructive — deliberate."},
                  {icon:"🎯",title:"Intentional design",body:"Every interaction is designed to leave you sharper, not more dependent."},
                ].map((c,i)=>(
                  <div key={i} className="phil-card">
                    <div className="phil-icon">{c.icon}</div>
                    <div className="phil-ct">{c.title}</div>
                    <div className="phil-cb">{c.body}</div>
                  </div>
                ))}
              </div>
              {[
                {title:"Why not just give you the answer?",body:"Because retrieval without engagement doesn't build anything. Trajectory introduces deliberate friction — calibrated to your level — so your reasoning stays active."},
                {title:"Is this just a slower AI?",body:"No. At Level 1, Trajectory answers directly and completely. The levels are about engagement style, not speed."},
                {title:"What makes this different?",body:"Most AI optimises for satisfaction — give the answer fast. Trajectory optimises for growth. One leaves you dependent; the other leaves you sharper."},
                {title:"Alfred vs Socrates — what's the difference?",body:"Alfred is warm, precise, and quietly wise — like a trusted mentor who respects your intelligence. Socrates is relentless — cold precision, no comfort, only illumination. Both serve your growth. Pick the one that sharpens you faster."},
              ].map((item,i)=>(
                <div key={i} className="phil-expand">
                  <div className="phil-hdr" onClick={()=>{setPhilOpen(philOpen===i?null:i);sfx("click");}}>
                    <span className="phil-ht">{item.title}</span>
                    <svg className={`chevron${philOpen===i?" open":""}`} width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 6l4 4 4-4" strokeLinecap="round"/></svg>
                  </div>
                  {philOpen===i&&<div className="phil-body">{item.body}</div>}
                </div>
              ))}
            </div></div>
          )}

          {/* ── PRICING ── */}
          {view==="pricing"&&(
            <div className="page"><div className="pb">
              <div className="p-eye">Pricing</div>
              <div className="p-h">Three plans.</div>
              <div className="p-lead">Start free. Upgrade when you're ready.</div>
              <div className="pgrid">
                {[
                  {plan:"FREE",amt:"$0",per:"forever",hi:false,feats:["All 5 levels","200k credits/session","Traj 1 model","Web search","Attach files"],btn:"ghost",bl:"Get started"},
                  {plan:"PRO",amt:"$18",per:"per month",hi:true,feats:["Everything in Free","Traj 1 + Traj 2","Priority speed","Extended memory","Projects workspace"],btn:"fill",bl:"Upgrade to Pro"},
                  {plan:"MAX",amt:"$48",per:"per month",hi:false,feats:["Everything in Pro","All 3 models incl. Traj 3","Unlimited credits","Custom memory rules","Early access features"],btn:"ghost",bl:"Get Max"},
                ].map((p,i)=>(
                  <div key={i} className={`pcard${p.hi?" hi":""}`}>
                    <div className="pplan">{p.plan}</div>
                    <div className="pamount">{p.amt}</div>
                    <div className="pper">{p.per}</div>
                    <ul className="plist">{p.feats.map((f,j)=><li key={j}>{f}</li>)}</ul>
                    <button className={`pbtn ${p.btn}`}>{p.bl}</button>
                  </div>
                ))}
              </div>
            </div></div>
          )}

          {/* ── CUSTOMIZE ── */}
          {view==="customize"&&(
            <div className="page"><div className="pb">
              <div className="p-eye">Customize</div>
              <div className="p-h">Appearance & settings</div>
              <div className="cust-section">
                <div className="cust-h">Theme</div>
                <div className="th-grid">
                  {Object.entries(THEMES).map(([key,tval])=>(
                    <div key={key} className={`th-card${theme===key?" active":""}`} onClick={()=>{setTheme(key);sfx("click");}}>
                      <div className="th-prev">
                        <div className="tp-s" style={{background:tval.sidebar,borderRight:`1px solid ${tval.border}`}}/>
                        <div className="tp-m" style={{background:tval.bg}}/>
                      </div>
                      <div className="th-lbl" style={{color:theme===key?tval.blue:tval.text2}}>{key.charAt(0).toUpperCase()+key.slice(1)}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="cust-section">
                <div className="cust-h">Typography</div>
                <div className="cust-slider">
                  <span className="cust-slider-label">Font size</span>
                  <input type="range" min="12" max="18" step="1" value={fontSize} onChange={e=>setFontSize(Number(e.target.value))}/>
                  <span className="cust-slider-val">{fontSize}px</span>
                </div>
              </div>
              <div className="cust-section">
                <div className="cust-h">Layout</div>
                <div className="seg-row">
                  <span className="tr-l">Message density</span>
                  <div className="seg">
                    {["compact","normal","spacious"].map(d=>(
                      <button key={d} className={`seg-btn${density===d?" on":""}`} onClick={()=>{setDensity(d);sfx("click");}}>{d.charAt(0).toUpperCase()+d.slice(1)}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="cust-section">
                <div className="cust-h">Preferences</div>
                {[
                  {key:"sounds",label:"Sound effects",sub:"Subtle audio on send and receive"},
                  {key:"timestamps",label:"Show timestamps",sub:"Display time on each message"},
                  {key:"codeHighlight",label:"Code highlighting",sub:"Syntax highlight in code blocks"},
                  {key:"autoScroll",label:"Auto-scroll",sub:"Jump to latest message automatically"},
                ].map(row=>(
                  <div className="tog-row" key={row.key}>
                    <div><div className="tr-l">{row.label}</div><div className="tr-s">{row.sub}</div></div>
                    <button className={`tog${custToggles[row.key]?" on":""}`}
                      onClick={()=>{setCustToggles(p=>({...p,[row.key]:!p[row.key]}));sfx("click");}}/>
                  </div>
                ))}
              </div>
            </div></div>
          )}

          {/* ── PROFILE ── */}
          {view==="profile"&&(
            <div className="page"><div className="pb">
              <div className="p-eye">Account</div>
              <div className="p-h">Profile</div>
              <div className="profile-hero">
                <div className="profile-avatar-wrap" onClick={()=>avatarRef.current?.click()}>
                  <div className="profile-avatar">
                    {avatarUrl?<img src={avatarUrl} alt="avatar"/>:initials}
                  </div>
                  <div className="profile-avatar-edit">{I.camera}</div>
                  <input type="file" ref={avatarRef} style={{display:"none"}} accept="image/*" onChange={handleAvatar}/>
                </div>
                <div className="profile-info">
                  <div className="profile-name">{userName}</div>
                  <div className="profile-email">{userEmail}</div>
                  <div className="profile-plan-badge">✦ {userPlan}</div>
                </div>
              </div>
              <div className="profile-stats">
                {[
                  {val:totalConvs,lbl:"Conversations"},
                  {val:totalMsgs,lbl:"Messages sent"},
                  {val:memory.length,lbl:"Memories saved"},
                ].map((s,i)=>(
                  <div key={i} className="stat-card">
                    <div className="stat-val">{s.val}</div>
                    <div className="stat-lbl">{s.lbl}</div>
                  </div>
                ))}
              </div>
              <div className="cust-h" style={{marginBottom:14}}>Edit profile</div>
              <div className="profile-field">
                <label className="profile-label">Display name</label>
                <input className="profile-input" value={userNameEdit} onChange={e=>setUserNameEdit(e.target.value)} placeholder="Your name"/>
              </div>
              <div className="profile-field">
                <label className="profile-label">Email</label>
                <input className="profile-input" value={userEmail} readOnly style={{opacity:.6}}/>
              </div>
              <div className="profile-field">
                <label className="profile-label">Bio</label>
                <input className="profile-input" value={userBioEdit} onChange={e=>setUserBioEdit(e.target.value)} placeholder="A short bio…"/>
              </div>
              <div className="profile-field">
                <label className="profile-label">Default level</label>
                <div className="seg" style={{marginTop:6}}>
                  {LEVELS.map((l,i)=>(
                    <button key={i} className={`seg-btn${lvl===i?" on":""}`} onClick={()=>{setLvl(i);sfx("click");}}>{l.n}</button>
                  ))}
                </div>
              </div>
              <button className="profile-save" onClick={()=>{setUserName(userNameEdit||userName);setUserBio(userBioEdit);sfx("click");}}>Save changes</button>
              <div className="danger-zone">
                <div className="cust-h" style={{marginBottom:12,color:"rgba(220,60,60,.8)"}}>Danger zone</div>
                <button className="danger-btn" onClick={()=>{setAuthed(false);setConvs([]);setCid(null);setEmail("");setPass("");}}>Sign out</button>
              </div>
            </div></div>
          )}

        </main>
      </div>
    </>
  );
}