import { useState, useEffect, useRef } from "react";

const STORE_KEY = "bpc3";
function loadStore() { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || null; } catch { return null; } }
function saveStore(s) { localStorage.setItem(STORE_KEY, JSON.stringify(s)); }

const CATALOGO = [
  {id:"s1",nombre:"Servicio Corte",precio:8,cat:"Servicios"},
  {id:"s2",nombre:"Servicio Instalacion PVC",precio:10,cat:"Servicios"},
  {id:"s3",nombre:"Servicio Instalacion PVC (Cliente Mat)",precio:10,cat:"Servicios"},
  {id:"s4",nombre:"Servicio Domicilio $150",precio:150,cat:"Servicios"},
  {id:"s5",nombre:"Huecos para visgra",precio:20,cat:"Servicios"},
  {id:"m1",nombre:"MDF Natural 2.5 MM",precio:100,cat:"MDF"},
  {id:"m2",nombre:"MDF Natural 4 MM",precio:170,cat:"MDF"},
  {id:"m3",nombre:"MDF Natural 5.5 MM",precio:185,cat:"MDF"},
  {id:"m4",nombre:"MDF Natural 9 MM",precio:300,cat:"MDF"},
  {id:"m5",nombre:"MDF Natural 12 MM",precio:350,cat:"MDF"},
  {id:"m6",nombre:"MDF Natural 15 MM",precio:480,cat:"MDF"},
  {id:"m7",nombre:"MDF Natural 18 MM",precio:510,cat:"MDF"},
  {id:"b1",nombre:"Melamina Blanco 4 MM",precio:330,cat:"Melamina"},
  {id:"b2",nombre:"Melamina Blanco 12 MM",precio:450,cat:"Melamina"},
  {id:"b3",nombre:"Melamina Blanco 15 MM",precio:550,cat:"Melamina"},
  {id:"b4",nombre:"Melamina Blanco 18 MM",precio:620,cat:"Melamina"},
  {id:"b5",nombre:"Melamina Negro 15 MM",precio:650,cat:"Melamina"},
  {id:"e1",nombre:"Cedro Enchapado 12 MM",precio:520,cat:"Enchapado"},
  {id:"e2",nombre:"Cedro Enchapado 15 MM",precio:580,cat:"Enchapado"},
  {id:"e3",nombre:"Cedro Enchapado 18 MM",precio:800,cat:"Enchapado"},
  {id:"e4",nombre:"Okume Enchapado 12 MM",precio:520,cat:"Enchapado"},
  {id:"e5",nombre:"Okume Enchapado 15 MM",precio:580,cat:"Enchapado"},
  {id:"e6",nombre:"Parota Enchapado 15 MM",precio:580,cat:"Enchapado"},
  {id:"n1",nombre:"Nogal Melamina",precio:650,cat:"Melamina"},
  {id:"n2",nombre:"Encino Natural Melamina",precio:650,cat:"Melamina"},
  {id:"n3",nombre:"Monaco Melamina",precio:650,cat:"Melamina"},
  {id:"n4",nombre:"Roble Blanco Melamina",precio:650,cat:"Melamina"},
  {id:"n5",nombre:"Brojar Melamina",precio:650,cat:"Melamina"},
  {id:"n6",nombre:"Alto Brillo Blanco 18MM",precio:2000,cat:"Premium"},
  {id:"p1",nombre:"Blanco PVC",precio:10,cat:"PVC"},
  {id:"p2",nombre:"Nogal PVC",precio:10,cat:"PVC"},
  {id:"p3",nombre:"Encino PVC",precio:10,cat:"PVC"},
  {id:"p4",nombre:"Negro PVC",precio:10,cat:"PVC"},
  {id:"p5",nombre:"Brojar PVC",precio:10,cat:"PVC"},
  {id:"p6",nombre:"Gris Claro PVC",precio:10,cat:"PVC"},
  {id:"x1",nombre:"Espejo",precio:1600,cat:"Especial"},
];
const CATALOGO_MATERIALES = CATALOGO.filter(p => !["Servicios","PVC"].includes(p.cat));

const FLUJO = [
  { id:"cotizacion", label:"Cotización",  icon:"📋", color:"#94a3b8" },
  { id:"confirmada", label:"Confirmada",  icon:"✅", color:"#38bdf8" },
  { id:"surtir",  label:"Surtir Material", icon:"📦", color:"#fb923c" },
  { id:"corte",  label:"Corte",  icon:"✂️", color:"#facc15" },
  { id:"enchape",  label:"Enchape",  icon:"🪵", color:"#a78bfa" },
  { id:"listo",  label:"Listo p/Entrega", icon:"🎯", color:"#34d399" },
  { id:"entregada",  label:"Entregada",  icon:"🚚", color:"#6ee7b7" },
];

const USUARIOS = [
  { id:1, nombre:"Admin",  rol:"admin",  pin:"0000", estacion:null },
  { id:2, nombre:"Carlos V.",  rol:"vendedor", pin:"1111", estacion:null },
  { id:3, nombre:"Ana R.",  rol:"vendedor", pin:"2222", estacion:null },
  { id:4, nombre:"Luis M.",  rol:"almacen",  pin:"3333", estacion:"surtir" },
  { id:5, nombre:"Pedro C.",  rol:"corte",  pin:"4444", estacion:"corte" },
  { id:6, nombre:"Miguel E.",  rol:"enchape",  pin:"5555", estacion:"enchape" },
  { id:7, nombre:"Repartidor", rol:"entrega",  pin:"6666", estacion:"entrega" },
  { id:8, nombre:"Inv. Manager", rol:"inventario", pin:"7777", estacion:null },
];

function flujoIdx(id) { return FLUJO.findIndex(f => f.id === id); }
function flujoInfo(id) { return FLUJO.find(f => f.id === id) || FLUJO[0]; }

const NOMBRES_CORTE  = ["servicio corte","corte"];
const NOMBRES_ENCHAPE = ["servicio instalacion pvc","servicio instalacion","enchape","brojar","huecos para visgra"];
function getNombre(l){ return ((l.prod?l.prod.nombre:"")||l.nombre||"").toLowerCase(); }
function tieneCorte(lineas)  { return lineas.some(l=>NOMBRES_CORTE.some(n=>getNombre(l).includes(n))); }
function tieneEnchape(lineas) { return lineas.some(l=>NOMBRES_ENCHAPE.some(n=>getNombre(l).includes(n))); }
const OPERARIOS_CORTE  = () => USUARIOS.filter(u=>u.estacion==="corte");
const OPERARIOS_ENCHAPE = () => USUARIOS.filter(u=>u.estacion==="enchape");

function siguienteEstadoOrden(estadoActual, lineas) {
  const hayCorte  = tieneCorte(lineas);
  const hayEnchape = tieneEnchape(lineas);
  switch(estadoActual) {
  case "cotizacion": return "confirmada";
  case "confirmada": return "surtir";
  case "surtir":
  if (!hayCorte && !hayEnchape) return "listo";
  if (hayCorte) return "corte";
  return "enchape";
  case "corte":  return hayEnchape ? "enchape" : "listo";
  case "enchape": return "listo";
  case "listo":  return "entregada";
  default:  return estadoActual;
  }
}


function estadoAnterior(venta) {
  const hist = venta.historial;
  if(hist.length < 2) return null;
  return hist[hist.length-2].estado;
}

function puedeRevertir(venta, usuario) {
  const prev = estadoAnterior(venta);
  if(!prev) return false;
  const est = venta.estado;
  if(usuario.rol==="admin") return true;
  if(usuario.rol==="vendedor") return est==="confirmada";
  if(usuario.rol==="almacen") return est==="surtir";
  if(usuario.rol==="corte") return est==="corte";
  if(usuario.rol==="enchape") return est==="enchape";
  if(usuario.rol==="entrega") return est==="listo";
  return false;
}


function ejecutarReversion(venta, usuario) {
  const s = loadStore(); if(!s) return false;
  const prev = estadoAnterior(venta);
  if(!prev) return false;
  const ts = new Date().toISOString();

  let nuevoInv = s.inventario;
  // Si revertimos desde "surtir" → reponer inventario
  if(venta.estado === "surtir") {
    nuevoInv = s.inventario.map(item => {
      const linea = venta.lineas.find(l => l.nombre===item.nombre && !l.clienteMat);
      if(linea) return {...item, stock: item.stock + linea.cant};
      return item;
    });
  }

  const nuevasVentas = s.ventas.map(v => v.folio===venta.folio ? {
    ...v,
    estado: prev,
    recibidoEnPiso: prev==="surtir" ? null : v.recibidoEnPiso,
    historial: [...v.historial, {estado: prev, ts, quien: usuario.nombre+" (revirtió)"}]
  } : v);

  saveStore({...s, ventas: nuevasVentas, inventario: nuevoInv});
  return true;
}

function initStore() {
  const ex = loadStore();
  if (ex) {
  if (!ex.config) ex.config = { razonSocial:"BPC Maderas y Tableros",rfc:"",direccion:"",telefono:"",email:"",web:"",notas:"Precios sujetos a cambio sin previo aviso." };
  if (!ex.recepciones) ex.recepciones = [];
  if (!ex.cierresMes) ex.cierresMes = [];
  if (!ex.preciosCompra) ex.preciosCompra = {};
  return ex;
  }
  const s = {
  ventas:[], folioActual:1000,
  usuarios: USUARIOS.map(u=>({...u})),
  recepciones:[],
  cierresMes:[],
  preciosCompra:{},
  clientes:[
  {id:"c1",nombre:"Zarate",tel:"3312345678",email:"",notas:""},
  {id:"c2",nombre:"Alexis Morgen",tel:"3398765432",email:"",notas:""},
  {id:"c3",nombre:"Laura Villegas",tel:"",email:"",notas:""},
  {id:"c4",nombre:"Carpintería Morlo",tel:"3311112222",email:"",notas:""},
  ],
  inventario: CATALOGO_MATERIALES.map(p=>({id:p.id,nombre:p.nombre,stock:20,minimo:5})),
  config:{razonSocial:"BPC Maderas y Tableros",rfc:"",direccion:"",telefono:"",email:"",web:"",notas:"Precios sujetos a cambio sin previo aviso."},
  };
  saveStore(s); return s;
}

const $$ = n => new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"}).format(n||0);
const fmtFecha = d => new Date(d).toLocaleDateString("es-MX",{day:"2-digit",month:"short",year:"numeric"});
const fmtHora  = d => new Date(d).toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"});

function fmtAging(ts) {
  const mins = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
  if (mins < 1) return { txt: "Justo ahora", color: "#34d399" };
  if (mins < 30) return { txt: mins + " min", color: "#34d399" };
  if (mins < 60) return { txt: mins + " min ⚠️", color: "#facc15" };
  const hrs = Math.floor(mins / 60);
  const m = mins % 60;
  return { txt: hrs + "h " + m + "m 🔴 SIN RECIBIR", color: "#f87171" };
}

function playCashRegister() {
  try {
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const t = ctx.currentTime;
    // "Ka" — golpe inicial metálico (ruido corto y seco)
    const bufKa=ctx.createBuffer(1,Math.floor(ctx.sampleRate*0.04),ctx.sampleRate);
    const dKa=bufKa.getChannelData(0);
    for(let i=0;i<dKa.length;i++) dKa[i]=(Math.random()*2-1)*Math.pow(1-i/dKa.length,4);
    const srcKa=ctx.createBufferSource(),gKa=ctx.createGain();
    srcKa.buffer=bufKa;srcKa.connect(gKa);gKa.connect(ctx.destination);
    gKa.gain.setValueAtTime(0.6,t);
    srcKa.start(t);
    // "Ching" — campanilla metálica aguda con vibración de resorte
    const freqs=[3400,4200,5100,6800];
    freqs.forEach((f,i)=>{
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.connect(g);g.connect(ctx.destination);
      o.type="sine";
      o.frequency.setValueAtTime(f,t+0.02);
      // vibración de resorte: modular frecuencia levemente
      o.frequency.setValueAtTime(f*1.015,t+0.04);
      o.frequency.setValueAtTime(f*0.985,t+0.07);
      o.frequency.setValueAtTime(f*1.008,t+0.10);
      o.frequency.setValueAtTime(f,t+0.13);
      g.gain.setValueAtTime(0,t+0.02);
      g.gain.linearRampToValueAtTime(0.18-i*0.03,t+0.04);
      g.gain.exponentialRampToValueAtTime(0.001,t+0.55+i*0.08);
      o.start(t+0.02);o.stop(t+0.7);
    });
    // Brillo extra — armónico muy agudo y corto
    const oShine=ctx.createOscillator(),gShine=ctx.createGain();
    oShine.connect(gShine);gShine.connect(ctx.destination);
    oShine.type="sine";oShine.frequency.setValueAtTime(8000,t+0.02);
    oShine.frequency.exponentialRampToValueAtTime(6000,t+0.12);
    gShine.gain.setValueAtTime(0.12,t+0.02);gShine.gain.exponentialRampToValueAtTime(0.001,t+0.2);
    oShine.start(t+0.02);oShine.stop(t+0.2);
    setTimeout(()=>ctx.close(),1000);
  } catch(e){}
}

function playProductionSound() {
  try {
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const t = ctx.currentTime;
    // Beep industrial grave
    const o1=ctx.createOscillator(),g1=ctx.createGain();
    o1.connect(g1);g1.connect(ctx.destination);
    o1.type="square";o1.frequency.setValueAtTime(220,t);
    g1.gain.setValueAtTime(0,t);g1.gain.linearRampToValueAtTime(0.15,t+0.02);
    g1.gain.setValueAtTime(0.15,t+0.12);g1.gain.linearRampToValueAtTime(0,t+0.15);
    o1.start(t);o1.stop(t+0.15);
    // Beep industrial 2 (más agudo)
    const o2=ctx.createOscillator(),g2=ctx.createGain();
    o2.connect(g2);g2.connect(ctx.destination);
    o2.type="square";o2.frequency.setValueAtTime(330,t+0.2);
    g2.gain.setValueAtTime(0,t+0.2);g2.gain.linearRampToValueAtTime(0.15,t+0.22);
    g2.gain.setValueAtTime(0.15,t+0.32);g2.gain.linearRampToValueAtTime(0,t+0.35);
    o2.start(t+0.2);o2.stop(t+0.35);
    // Zumbido engranaje arrancando
    const o3=ctx.createOscillator(),g3=ctx.createGain();
    o3.connect(g3);g3.connect(ctx.destination);
    o3.type="sawtooth";
    o3.frequency.setValueAtTime(80,t+0.4);
    o3.frequency.linearRampToValueAtTime(160,t+0.7);
    g3.gain.setValueAtTime(0,t+0.4);g3.gain.linearRampToValueAtTime(0.12,t+0.45);
    g3.gain.exponentialRampToValueAtTime(0.001,t+0.75);
    o3.start(t+0.4);o3.stop(t+0.75);
    setTimeout(()=>ctx.close(),1200);
  } catch(e){}
}

const uid = () => Math.random().toString(36).slice(2)+Date.now();
const hoyStr = () => new Date().toDateString();

const G = { bg:"#0c0a09",surface:"#1c1917",surface2:"#292524",border:"#3d3835",muted:"#78716c",text:"#f5f0eb",accent:"#f59e0b" };
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:${G.bg};color:${G.text};font-family:'Outfit',sans-serif;}
  input,select,textarea,button{font-family:inherit;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
  .fu{animation:fadeUp .25s ease both;}
`;
const inp = {background:G.surface2,border:`1px solid ${G.border}`,color:G.text,borderRadius:8,padding:"8px 12px",fontSize:13,width:"100%",outline:"none"};

function Inp({label,value,onChange,placeholder,type="text",style={}}) {
  const [focus,setFocus]=useState(false);
  return <div style={{display:"flex",flexDirection:"column",gap:4}}>
  {label&&<label style={{fontSize:11,fontWeight:700,color:G.muted,textTransform:"uppercase",letterSpacing:.8}}>{label}</label>}
  <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
  onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}
  style={{...inp,borderColor:focus?G.accent:G.border,...style}}/>
  </div>;
}
function Sel({label,value,onChange,options}) {
  return <div style={{display:"flex",flexDirection:"column",gap:4}}>
  {label&&<label style={{fontSize:11,fontWeight:700,color:G.muted,textTransform:"uppercase",letterSpacing:.8}}>{label}</label>}
  <select value={value} onChange={e=>onChange(e.target.value)} style={inp}>
  <option value="">-- Seleccionar --</option>
  {options.map(o=>typeof o==="string"?<option key={o} value={o}>{o}</option>:<option key={o.v} value={o.v}>{o.l}</option>)}
  </select>
  </div>;
}
function Btn({children,onClick,v="pri",size="md",disabled,full,style={}}) {
  const sz={sm:"5px 11px",md:"8px 16px",lg:"13px 24px"};
  const fz={sm:12,md:13,lg:15};
  const vs={
  pri:{background:G.accent,color:"#1c1917",border:"none"},
  sec:{background:G.surface2,color:"#d6d3d1",border:`1px solid ${G.border}`},
  ghost:{background:"transparent",color:G.muted,border:"none"},
  ok:{background:"#05966920",color:"#34d399",border:"1px solid #05966944"},
  warn:{background:"#dc262620",color:"#f87171",border:"1px solid #dc262644"},
  };
  return <button onClick={disabled?undefined:onClick} disabled={disabled}
  style={{display:"inline-flex",alignItems:"center",gap:6,padding:sz[size],fontSize:fz[size],fontWeight:700,borderRadius:9,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.4:1,transition:"filter .15s",width:full?"100%":undefined,justifyContent:full?"center":undefined,...vs[v],...style}}
  onMouseEnter={e=>!disabled&&(e.currentTarget.style.filter="brightness(1.1)")}
  onMouseLeave={e=>e.currentTarget.style.filter=""}>
  {children}
  </button>;
}
function Card({children,style={},onClick,onMouseEnter,onMouseLeave}) { return <div onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:13,...style}}>{children}</div>; }
function Tag({children,color=G.accent}) { return <span style={{background:color+"25",color,border:`1px solid ${color}44`,borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700,whiteSpace:"nowrap",display:"inline-flex",alignItems:"center",gap:4}}>{children}</span>; }
function Pill({estado}) { const f=flujoInfo(estado); return <Tag color={f.color}>{f.icon} {f.label}</Tag>; }
function Divider() { return <div style={{height:1,background:G.border,margin:"8px 0"}}/>; }

function Modal({title,children,onClose,width=500}) {
  return <div style={{position:"fixed",inset:0,background:"#000a",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
  <div style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:14,width:"100%",maxWidth:width,maxHeight:"90vh",overflow:"auto"}} onClick={e=>e.stopPropagation()}>
  <div style={{padding:"14px 18px",borderBottom:`1px solid ${G.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
  <span style={{fontWeight:700}}>{title}</span>
  <button onClick={onClose} style={{background:"none",border:"none",color:G.muted,cursor:"pointer",fontSize:20}}>×</button>
  </div>
  <div style={{padding:18}}>{children}</div>
  </div>
  </div>;
}
function Confirm({msg,onOk,onCancel,danger}) {
  return <div style={{position:"fixed",inset:0,background:"#000c",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
  <div className="fu" style={{background:G.surface,border:`2px solid ${danger?"#dc2626":G.accent}`,borderRadius:16,padding:28,maxWidth:380,width:"100%",textAlign:"center"}}>
  <div style={{fontSize:44,marginBottom:10}}>{danger?"⚠️":"❓"}</div>
  <p style={{color:"#d6d3d1",lineHeight:1.6,marginBottom:20,fontSize:14,whiteSpace:"pre-line"}}>{msg}</p>
  <div style={{display:"flex",gap:10,justifyContent:"center"}}>
  <Btn v="ghost" onClick={onCancel}>Cancelar</Btn>
  <Btn v={danger?"warn":"pri"} onClick={onOk}>Confirmar</Btn>
  </div>
  </div>
  </div>;
}

function AsignacionSelector({lineas,asigCorte,asigEnchape,onCorte,onEnchape}) {
  const hayCorte  = tieneCorte(lineas);
  const hayEnchape = tieneEnchape(lineas);
  if(!hayCorte&&!hayEnchape) return null;
  const cortadores  = OPERARIOS_CORTE();
  const enchapadores = OPERARIOS_ENCHAPE();
  const flujoOrden  = hayCorte&&hayEnchape?"Corte → Enchape → Listo":hayCorte?"Corte → Listo":"Enchape → Listo";
  return <div style={{display:"flex",flexDirection:"column",gap:8}}>
  <Divider/>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
  <p style={{fontSize:11,fontWeight:700,color:"#facc15",letterSpacing:.8}}>⚡ ASIGNACIÓN DE TRABAJO</p>
  <span style={{fontSize:10,color:G.muted,background:G.surface2,borderRadius:5,padding:"2px 7px"}}>{flujoOrden}</span>
  </div>
  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
  {hayCorte  && <Tag color="#facc15">✂️ Requiere Corte</Tag>}
  {hayEnchape && <Tag color="#a78bfa">🪵 Requiere Enchape</Tag>}
  </div>
  {hayCorte&&<div style={{display:"flex",flexDirection:"column",gap:4}}>
  <label style={{fontSize:11,fontWeight:700,color:"#facc15",textTransform:"uppercase",letterSpacing:.8}}>✂️ ¿Quién corta?</label>
  {cortadores.length>0 ? <select value={asigCorte} onChange={e=>onCorte(e.target.value)} style={{...inp,borderColor:asigCorte?"#facc15":G.border}}><option value="">— Sin asignar (cola general) —</option>{cortadores.map(u=><option key={u.id} value={u.nombre}>{u.nombre}</option>)}</select> : <span style={{fontSize:11,color:G.muted}}>Sin cortadores registrados</span>}
  </div>}
  {hayEnchape&&<div style={{display:"flex",flexDirection:"column",gap:4}}>
  <label style={{fontSize:11,fontWeight:700,color:"#a78bfa",textTransform:"uppercase",letterSpacing:.8}}>🪵 ¿Quién enchapa?</label>
  {enchapadores.length>0 ? <select value={asigEnchape} onChange={e=>onEnchape(e.target.value)} style={{...inp,borderColor:asigEnchape?"#a78bfa":G.border}}><option value="">— Sin asignar (cola general) —</option>{enchapadores.map(u=><option key={u.id} value={u.nombre}>{u.nombre}</option>)}</select> : <span style={{fontSize:11,color:G.muted}}>Sin enchapadores registrados</span>}
  </div>}
  </div>;
}

function AsignacionEditorInline({venta}) {
  const [asigCorte,  setAsigCorteL]  = useState(venta.asigCorte||"");
  const [asigEnchape, setAsigEnchapeL] = useState(venta.asigEnchape||"");
  const hayCorte  = tieneCorte(venta.lineas);
  const hayEnchape = tieneEnchape(venta.lineas);

  if(!hayCorte&&!hayEnchape) return <div style={{background:"#34d39915",border:"1px solid #34d39930",borderRadius:8,padding:"8px 10px",marginBottom:10,fontSize:12,color:"#34d399"}}>
  ✅ Sin servicios de corte/enchape — pasará directo a <b>Listo para Entrega</b>
  </div>;

  function guardar(campo,val){
  const s=loadStore();if(!s)return;
  saveStore({...s,ventas:s.ventas.map(v=>v.folio===venta.folio?{...v,[campo]:val||null}:v)});
  }
  const flujoOrden = hayCorte&&hayEnchape?"Corte → Enchape → Listo":hayCorte?"Corte → Listo":"Enchape → Listo";
  const sinC = hayCorte&&!asigCorte;
  const sinE = hayEnchape&&!asigEnchape;

  return <div style={{background:"#facc1510",border:`1px solid ${sinC||sinE?"#f87171":"#facc15"}40`,borderRadius:8,padding:"10px 12px",marginBottom:10}}>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
  <span style={{fontSize:11,fontWeight:700,color:"#facc15"}}>⚡ ASIGNAR TRABAJO</span>
  <span style={{fontSize:10,color:G.muted,background:G.surface2,borderRadius:5,padding:"2px 7px"}}>{flujoOrden}</span>
  </div>
  <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
  {hayCorte  && <Tag color="#facc15">✂️ Requiere Corte</Tag>}
  {hayEnchape && <Tag color="#a78bfa">🪵 Requiere Enchape</Tag>}
  {hayCorte&&hayEnchape && <span style={{fontSize:10,color:G.muted,alignSelf:"center"}}>← en este orden</span>}
  </div>
  <div style={{display:"flex",flexDirection:"column",gap:8}}>
  {hayCorte&&(OPERARIOS_CORTE().length>0 ? <div><label style={{fontSize:10,fontWeight:700,color:"#facc15",textTransform:"uppercase",letterSpacing:.7,display:"block",marginBottom:3}}>✂️ ¿Quién corta? {sinC&&<span style={{color:"#f87171"}}>← pendiente</span>}</label><select value={asigCorte} onChange={e=>{setAsigCorteL(e.target.value);guardar("asigCorte",e.target.value);}} style={{...inp,fontSize:12,borderColor:asigCorte?"#facc15":sinC?"#f87171":G.border}}><option value="">— Sin asignar (cola general) —</option>{OPERARIOS_CORTE().map(u=><option key={u.id} value={u.nombre}>{u.nombre}</option>)}</select></div> : <div style={{fontSize:11,color:G.muted}}>✂️ Sin cortadores registrados</div>)}
  {hayEnchape&&(OPERARIOS_ENCHAPE().length>0 ? <div><label style={{fontSize:10,fontWeight:700,color:"#a78bfa",textTransform:"uppercase",letterSpacing:.7,display:"block",marginBottom:3}}>🪵 ¿Quién enchapa? {sinE&&<span style={{color:"#f87171"}}>← pendiente</span>}</label><select value={asigEnchape} onChange={e=>{setAsigEnchapeL(e.target.value);guardar("asigEnchape",e.target.value);}} style={{...inp,fontSize:12,borderColor:asigEnchape?"#a78bfa":sinE?"#f87171":G.border}}><option value="">— Sin asignar (cola general) —</option>{OPERARIOS_ENCHAPE().map(u=><option key={u.id} value={u.nombre}>{u.nombre}</option>)}</select></div> : <div style={{fontSize:11,color:G.muted}}>🪵 Sin enchapadores registrados</div>)}
  </div>
  {(sinC||sinE)&&<div style={{marginTop:8,fontSize:11,color:"#f87171"}}>⚠️ Sin asignar pasará a la cola general</div>}
  </div>;
}

function Login({onLogin}) {
  const [pin,setPin]=useState(""); const [err,setErr]=useState(false);
  function press(k){if(k==="⌫"){setPin(p=>p.slice(0,-1));return;}const next=pin+k;if(next.length>4)return;setPin(next);if(next.length===4){const u=USUARIOS.find(u=>u.pin===next);if(u){onLogin(u);}else{setErr(true);setTimeout(()=>{setPin("");setErr(false);},700);}}}
  return <div style={{minHeight:"100vh",background:G.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:28,padding:20}}>
  <style>{globalCSS}</style>
  <div style={{textAlign:"center"}}><div style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:52,color:G.accent,lineHeight:1}}>BPC</div><div style={{color:"#44403c",fontSize:11,letterSpacing:4,marginTop:4}}>SISTEMA DE GESTIÓN</div></div>
  <div style={{display:"flex",gap:10,transition:"transform .08s",transform:err?"translateX(8px)":"none"}}>{[0,1,2,3].map(i=><div key={i} style={{width:13,height:13,borderRadius:"50%",background:i<pin.length?G.accent:G.surface2,border:`1px solid ${i<pin.length?G.accent:G.border}`,transition:"all .15s"}}/>)}</div>
  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,width:220}}>
  {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k,i)=>k===""?<div key={i}/>:
  <button key={i} onClick={()=>press(String(k))} style={{height:58,borderRadius:11,background:G.surface2,border:`1px solid ${G.border}`,color:k==="⌫"?G.muted:G.text,fontSize:20,fontWeight:600,cursor:"pointer",transition:"all .1s"}}
  onMouseDown={e=>{e.currentTarget.style.background=G.accent;e.currentTarget.style.color="#1c1917";}}
  onMouseUp={e=>{e.currentTarget.style.background=G.surface2;e.currentTarget.style.color=k==="⌫"?G.muted:G.text;}}>{k}</button>)}
  </div>
  {err&&<p style={{color:"#f87171",fontSize:13}}>PIN incorrecto</p>}
  <div style={{color:"#3d3835",fontSize:11,textAlign:"center",lineHeight:2}}>{USUARIOS.map(u=><div key={u.id}>{u.nombre} — <span style={{fontFamily:"monospace"}}>{u.pin}</span></div>)}</div>
  </div>;
}

function NuevaCotizacion({store,usuario,onSave,onCancel}) {
  const [clienteId,setClienteId]=useState(""); const [clienteNew,setClienteNew]=useState("");
  const [metodo,setMetodo]=useState(""); const [pagado,setPagado]=useState(false);
  const [proyecto,setProyecto]=useState("");
  const [lineas,setLineas]=useState([{id:uid(),prod:null,cant:1,precio:0,clienteMat:false}]);
  const [buscando,setBuscando]=useState(null); const [query,setQuery]=useState("");
  const defaultEntrega=()=>{const d=new Date();d.setDate(d.getDate()+3);return d.toISOString().slice(0,16);};
  const [fechaEntrega,setFechaEntrega]=useState(defaultEntrega);
  const [asigCorte,setAsigCorte]=useState(""); const [asigEnchape,setAsigEnchape]=useState("");
  const [urgente,setUrgente]=useState(false);
  const clienteNombre=(store.clientes.find(c=>c.id===clienteId)||{nombre:""}).nombre||clienteNew;
  const folio=store.folioActual;
  const resultados=query.length>=2?CATALOGO.filter(p=>p.nombre.toLowerCase().includes(query.toLowerCase())).slice(0,9):[];
  function setL(id,campo,val){setLineas(ls=>ls.map(l=>l.id===id?{...l,[campo]:val}:l));}
  function selProd(lid,prod){setLineas(ls=>ls.map(l=>l.id===lid?{...l,prod,precio:prod.precio,clienteMat:false}:l));setBuscando(null);setQuery("");}
  const sub=lineas.reduce((s,l)=>s+l.cant*l.precio,0); const iva=sub*.16; const total=sub+iva;
  const canSave=clienteNombre&&metodo&&lineas.some(l=>l.prod);
  function guardar(){
  if(!canSave)return;
  onSave({folio,cliente:clienteNombre,clienteId,metodo,pagado,proyecto,fecha:new Date().toISOString(),vendedor:usuario.nombre,
  lineas:lineas.filter(l=>l.prod).map(l=>({nombre:l.prod.nombre,cat:l.prod.cat,cant:l.cant,precio:l.precio,total:l.cant*l.precio,clienteMat:l.clienteMat})),
  subtotal:sub,iva,total,estado:"cotizacion",
  fechaEntrega:fechaEntrega?new Date(fechaEntrega).toISOString():null,
  asigCorte:asigCorte||null,asigEnchape:asigEnchape||null,
  urgente:urgente,
  notaInterna:"",historial:[{estado:"cotizacion",ts:new Date().toISOString(),quien:usuario.nombre}]},clienteNombre,clienteId);
  }
  return <div className="fu" style={{display:"flex",flexDirection:"column",gap:16}}>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
  <div><h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:24}}>Nueva Cotización</h2><span style={{fontFamily:"monospace",color:G.accent,fontSize:13}}>#{folio}</span></div>
  <Btn v="ghost" onClick={onCancel}>✕ Cancelar</Btn>
  </div>
  <div style={{display:"grid",gridTemplateColumns:"240px 1fr",gap:14}}>
  <div style={{display:"flex",flexDirection:"column",gap:10}}>
  <Card style={{padding:14,display:"flex",flexDirection:"column",gap:10}}>
  <Sel label="Cliente" value={clienteId} onChange={v=>{setClienteId(v);setClienteNew("");}} options={store.clientes.map(c=>({v:c.id,l:c.nombre}))}/>
  <Inp label="O nuevo cliente" value={clienteNew} onChange={v=>{setClienteNew(v);setClienteId("");}} placeholder="Nombre..."/>
  <Divider/>
  <Sel label="Método de pago" value={metodo} onChange={setMetodo} options={["Efectivo","Transferencia","Tarjeta","Crédito"]}/>
  <Inp label="Proyecto (opcional)" value={proyecto} onChange={setProyecto} placeholder="Descripción..."/>
  <label style={{display:"flex",gap:8,alignItems:"center",cursor:"pointer",fontSize:13,color:"#d6d3d1"}}>
  <input type="checkbox" checked={pagado} onChange={e=>setPagado(e.target.checked)} style={{accentColor:G.accent,width:16,height:16}}/>Ya está pagado
  </label>
  <Divider/>
  <div style={{display:"flex",flexDirection:"column",gap:4}}>
  <label style={{fontSize:11,fontWeight:700,color:G.muted,textTransform:"uppercase",letterSpacing:.8}}>📅 Fecha compromiso entrega</label>
  <input type="datetime-local" value={fechaEntrega} onChange={e=>setFechaEntrega(e.target.value)} style={{...inp,fontSize:12,colorScheme:"dark"}}/>
  <span style={{fontSize:10,color:G.muted}}>Auto: +3 días desde hoy</span>
  </div>
  <label style={{display:"flex",gap:8,alignItems:"center",cursor:"pointer",padding:"8px 10px",borderRadius:8,background:urgente?"#dc262620":"transparent",border:urgente?"1px solid #dc262660":"1px solid transparent",transition:"all .2s"}}>
  <input type="checkbox" checked={urgente} onChange={e=>setUrgente(e.target.checked)} style={{accentColor:"#f87171",width:18,height:18}}/>
  <span style={{fontWeight:700,color:urgente?"#f87171":"#78716c",fontSize:13}}>🔴 {urgente?"¡URGENTE!":"Marcar como urgente"}</span>
  </label>
  <AsignacionSelector lineas={lineas} asigCorte={asigCorte} asigEnchape={asigEnchape} onCorte={setAsigCorte} onEnchape={setAsigEnchape}/>
  </Card>
  </div>
  <div style={{display:"flex",flexDirection:"column",gap:10}}>
  <Card style={{padding:14}}>
  <p style={{fontSize:11,fontWeight:700,color:G.muted,letterSpacing:.8,marginBottom:10}}>PRODUCTOS / SERVICIOS</p>
  {lineas.map((l,idx)=><div key={l.id} style={{marginBottom:8}}>
  <div style={{display:"flex",gap:6,alignItems:"center"}}>
  <span style={{width:18,textAlign:"right",color:G.muted,fontSize:12,flexShrink:0}}>{idx+1}</span>
  <div style={{flex:1,position:"relative"}}>
  <input value={buscando===l.id?query:((l.prod?l.prod.nombre:"")||"")} onChange={e=>{setQuery(e.target.value);setBuscando(l.id);}}
  onFocus={()=>{setBuscando(l.id);setQuery((l.prod?l.prod.nombre:"")||"");}} onBlur={()=>setTimeout(()=>setBuscando(null),200)}
  placeholder="Buscar producto..." style={{...inp,fontSize:12}}/>
  {buscando===l.id&&resultados.length>0&&<div style={{position:"absolute",top:"calc(100% + 2px)",left:0,right:0,background:G.surface,border:`1px solid ${G.border}`,borderRadius:9,zIndex:50,maxHeight:180,overflow:"auto",boxShadow:"0 8px 24px #000b"}}>
  {resultados.map(p=><div key={p.id} onMouseDown={e=>{e.preventDefault();selProd(l.id,p);}}
  style={{padding:"7px 12px",cursor:"pointer",fontSize:12,display:"flex",justifyContent:"space-between",color:"#d6d3d1"}}
  onMouseEnter={e=>e.currentTarget.style.background=G.surface2} onMouseLeave={e=>e.currentTarget.style.background=""}>
  <span>{p.nombre}</span><span style={{color:G.accent}}>{$$(p.precio)}</span>
  </div>)}
  </div>}
  </div>
  <input type="number" min="0" value={l.cant} onChange={e=>setL(l.id,"cant",parseFloat(e.target.value)||0)} style={{...inp,width:60,textAlign:"center",padding:"8px 6px"}}/>
  <input type="number" min="0" value={l.precio} onChange={e=>setL(l.id,"precio",parseFloat(e.target.value)||0)} style={{...inp,width:86,textAlign:"right",padding:"8px 8px"}}/>
  <span style={{width:88,textAlign:"right",color:"#fbbf24",fontWeight:700,fontSize:13,flexShrink:0}}>{$$(l.cant*l.precio)}</span>
  <button onClick={()=>setLineas(ls=>ls.filter(x=>x.id!==l.id))} style={{background:"none",border:"none",color:G.muted,cursor:"pointer",fontSize:18,padding:"2px 4px"}} onMouseEnter={e=>e.currentTarget.style.color="#f87171"} onMouseLeave={e=>e.currentTarget.style.color=G.muted}>✕</button>
  </div>
  {l.prod&&<label style={{display:"flex",gap:6,alignItems:"center",marginLeft:24,marginTop:4,cursor:"pointer",fontSize:11,color:G.muted}}>
  <input type="checkbox" checked={l.clienteMat} onChange={e=>{const cm=e.target.checked;setL(l.id,"clienteMat",cm);setL(l.id,"precio",cm?0:l.prod.precio);}} style={{accentColor:G.accent}}/>Material del cliente ($0)
  </label>}
  </div>)}
  <button onClick={()=>setLineas(ls=>[...ls,{id:uid(),prod:null,cant:1,precio:0,clienteMat:false}])}
  style={{marginTop:8,width:"100%",padding:"7px",background:"none",border:`1px dashed ${G.border}`,borderRadius:8,color:G.muted,cursor:"pointer",fontSize:12}}
  onMouseEnter={e=>e.currentTarget.style.borderColor=G.accent} onMouseLeave={e=>e.currentTarget.style.borderColor=G.border}>+ Agregar línea</button>
  </Card>
  <Card style={{padding:14}}>
  {[["Subtotal",sub],["IVA 16%",iva]].map(([l,v])=><div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:13,color:G.muted,marginBottom:6}}><span>{l}</span><span>{$$(v)}</span></div>)}
  <Divider/>
  <div style={{display:"flex",justifyContent:"space-between",fontSize:20,fontWeight:800,color:G.accent}}><span>Total</span><span>{$$(total)}</span></div>
  </Card>
  <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><Btn v="sec" onClick={onCancel}>Cancelar</Btn><Btn v="pri" onClick={guardar} disabled={!canSave}>💾 Registrar</Btn></div>
  </div>
  </div>
  </div>;
}


function generarHojaProduccion(venta, notasExtra) {
  const notas = notasExtra || "";
  const tieneClienteMat = venta.lineas.some(l=>l.clienteMat);
  const fmt = d => new Date(d).toLocaleDateString("es-MX",{weekday:"long",day:"2-digit",month:"long",year:"numeric"});
  const fmtHrs = d => new Date(d).toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"});

  const lineasHtml = venta.lineas.map((l,i) => {
    const esMat = !["Servicios"].includes(l.cat);
    const esServicio = l.cat==="Servicios";
    const clienteMatBadge = l.clienteMat
      ? "<span style=\"display:inline-block;margin-left:10px;padding:2px 10px;background:#fef08a;color:#713f12;border:2px solid #ca8a04;border-radius:4px;font-size:13px;font-weight:900;text-decoration:underline;\">★ MATERIAL DEL CLIENTE</span>"
      : "";
    return "<tr style=\"border-bottom:2px solid #e5e7eb;\">"
      +"<td style=\"padding:10px 8px;font-size:13px;color:#6b7280;font-weight:600;\">"+(i+1)+"</td>"
      +"<td style=\"padding:10px 8px;font-size:15px;font-weight:"+(esServicio?"600":"700")+";color:"+(esServicio?"#6b7280":"#111827")+";\">"+l.nombre+clienteMatBadge+"</td>"
      +"<td style=\"padding:10px 8px;text-align:center;\"><span style=\"display:inline-block;min-width:48px;padding:6px 12px;background:#111827;color:#fff;border-radius:8px;font-size:28px;font-weight:900;line-height:1;\">"+l.cant+"</span></td>"
      +"<td style=\"padding:10px 8px;font-size:13px;color:#6b7280;text-align:center;\">"+(esServicio?"SERVICIO":l.cat)+"</td>"
      +"</tr>";
  }).join("");

  const clienteMatAlert = tieneClienteMat
    ? "<div style=\"margin:18px 0;padding:16px 20px;background:#fef9c3;border:3px solid #ca8a04;border-radius:8px;\">"
      +"<div style=\"font-size:22px;font-weight:900;color:#713f12;text-decoration:underline;letter-spacing:1px;\">⚠️ ATENCIÓN: CLIENTE TRAE SU PROPIO MATERIAL</div>"
      +"<div style=\"font-size:14px;color:#92400e;margin-top:6px;font-weight:600;\">Verificar qué líneas están marcadas con ★ MATERIAL DEL CLIENTE antes de sacar stock del almacén.</div>"
      +"</div>"
    : "";

  const asigHtml = (venta.asigCorte||venta.asigEnchape)
    ? "<div style=\"display:flex;gap:16px;flex-wrap:wrap;margin-top:10px;\">"
      +(venta.asigCorte?"<span style=\"padding:5px 14px;background:#fef08a;border:2px solid #ca8a04;border-radius:6px;font-weight:800;font-size:14px;\">✂️ Corte: "+venta.asigCorte+"</span>":"")
      +(venta.asigEnchape?"<span style=\"padding:5px 14px;background:#ede9fe;border:2px solid #7c3aed;border-radius:6px;font-weight:800;font-size:14px;\">🪵 Enchape: "+venta.asigEnchape+"</span>":"")
      +"</div>"
    : "";

  const notasHtml = notas
    ? "<div style=\"margin-top:18px;padding:12px 16px;background:#f0f9ff;border-left:4px solid #0284c7;border-radius:0 8px 8px 0;\">"
      +"<div style=\"font-size:11px;font-weight:700;color:#0284c7;text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;\">Notas de producción</div>"
      +"<div style=\"font-size:15px;color:#0c4a6e;font-weight:600;\">"+notas+"</div>"
      +"</div>"
    : "";

  const html = "<!DOCTYPE html><html lang=\"es\"><head><meta charset=\"UTF-8\"/>"
    +"<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Arial,sans-serif;padding:24px;color:#111827;background:#fff;}"
    +"h1{font-size:28px;font-weight:900;color:#f59e0b;letter-spacing:-1px;margin-bottom:2px;}"
    +".hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:4px solid #111827;padding-bottom:14px;margin-bottom:18px;}"
    +".folio{font-size:36px;font-weight:900;color:#111827;}"
    +".badge{display:inline-block;padding:4px 12px;background:#111827;color:#fff;border-radius:6px;font-size:12px;font-weight:700;letter-spacing:1px;margin-top:4px;}"
    +"table{width:100%;border-collapse:collapse;margin-top:14px;}"
    +"th{background:#111827;color:#fff;padding:10px 8px;text-align:left;font-size:12px;letter-spacing:.5px;}"
    +"th:last-child,td:last-child{text-align:center;}"
    +".firma{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:40px;padding-top:20px;border-top:2px solid #e5e7eb;}"
    +".firma-box{text-align:center;}"
    +".firma-line{height:1px;background:#111827;margin-top:52px;margin-bottom:6px;}"
    +".firma-lbl{font-size:11px;color:#6b7280;}"
    +".noprint{margin-bottom:16px;display:flex;gap:10px;}"
    +"@media print{.noprint{display:none!important;}}"
    +"</style></head><body>"
    +"<div class=\"noprint\"><button onclick=\"window.print()\" style=\"padding:8px 20px;background:#111827;color:#fff;border:none;border-radius:7px;font-weight:700;font-size:14px;cursor:pointer;\">🖨️ Imprimir</button>"
    +"<button onclick=\"window.close()\" style=\"padding:8px 20px;background:#f3f4f6;border:none;border-radius:7px;font-weight:700;font-size:14px;cursor:pointer;\">✕ Cerrar</button></div>"
    +"<div class=\"hdr\">"
    +"<div><h1>BPC TALLER</h1><div style=\"font-size:13px;color:#6b7280;margin-top:2px;\">HOJA DE PRODUCCIÓN — NO CONTIENE PRECIOS</div></div>"
    +"<div style=\"text-align:right;\">"
    +"<div class=\"folio\">#"+venta.folio+"</div>"
    +"<div class=\"badge\">"+new Date(venta.fecha).toLocaleDateString("es-MX")+"</div>"
    +"</div></div>"
    +clienteMatAlert
    +"<div style=\"display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:14px;\">"
    +"<div style=\"padding:12px 14px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;\">"
    +"<div style=\"font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;\">Cliente</div>"
    +"<div style=\"font-size:18px;font-weight:900;\">"+venta.cliente+"</div>"
    +(venta.proyecto?"<div style=\"font-size:13px;color:#6b7280;margin-top:2px;\">📁 "+venta.proyecto+"</div>":"")
    +"</div>"
    +"<div style=\"padding:12px 14px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;\">"
    +"<div style=\"font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;\">Detalles</div>"
    +"<div style=\"font-size:14px;font-weight:600;\">Vendedor: "+venta.vendedor+"</div>"
    +(venta.fechaEntrega?"<div style=\"font-size:14px;font-weight:800;color:#dc2626;margin-top:4px;\">📅 ENTREGAR: "+fmt(venta.fechaEntrega)+" "+fmtHrs(venta.fechaEntrega)+"hrs</div>":"")
    +asigHtml
    +"</div></div>"
    +"<table><thead><tr><th>#</th><th>Producto / Servicio</th><th style=\"text-align:center;\">CANT.</th><th style=\"text-align:center;\">Tipo</th></tr></thead>"
    +"<tbody>"+lineasHtml+"</tbody></table>"
    +notasHtml
    +"<div class=\"firma\">"
    +"<div class=\"firma-box\"><div class=\"firma-line\"></div><div class=\"firma-lbl\">Recibió en taller — Firma y nombre</div></div>"
    +"<div class=\"firma-box\"><div class=\"firma-line\"></div><div class=\"firma-lbl\">Terminado — Firma y nombre</div></div>"
    +"</div>"
    +"<div style=\"margin-top:18px;padding-top:12px;border-top:1px solid #e5e7eb;text-align:center;font-size:10px;color:#9ca3af;\">BPC Maderas y Tableros · Folio #"+venta.folio+" · Generado: "+new Date().toLocaleString("es-MX")+"</div>"
    +"</body></html>";

  const w=window.open("","_blank");
  if(w){w.document.write(html);w.document.close();}
}

function generarPDF(venta,config) {
  const fmt=n=>new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"}).format(n||0);
  const fi=flujoInfo(venta.estado);
  const lineas=venta.lineas.map((l,i)=>"<tr><td>"+(i+1)+"</td><td>"+l.nombre+(l.clienteMat?" (mat.cliente)":"")+"</td><td>"+l.cant+"</td><td>"+fmt(l.precio)+"</td><td>"+fmt(l.total)+"</td></tr>").join("");
  const asig=(venta.asigCorte||venta.asigEnchape)?"<p style='margin:8px 0;padding:6px;background:#fffbeb;border:1px solid #fcd34d;border-radius:4px;font-size:12px;'>"+(venta.asigCorte?"✂️ "+venta.asigCorte+" ":"")+(venta.asigEnchape?"🪵 "+venta.asigEnchape:"")+"</p>":"";
  const firma=venta.firma?"<div style='margin-top:10px;padding:8px;background:#f0fdf4;border:1px solid #86efac;border-radius:6px;'><b style='color:#166534;'>✅ Firmado</b><br/><img src='"+venta.firma+"' style='max-height:60px;margin-top:4px;'/></div>":"";
  const html="<!DOCTYPE html><html><head><meta charset='UTF-8'/><style>body{font-family:Arial,sans-serif;padding:24px;color:#1c1917;}h1{color:#f59e0b;font-size:26px;margin-bottom:4px;}.sub{color:#78716c;font-size:11px;margin-bottom:16px;}table{width:100%;border-collapse:collapse;margin:14px 0;}th{background:#1c1917;color:#fff;padding:7px 10px;text-align:left;font-size:11px;}td{padding:7px 10px;border-bottom:1px solid #e8e5e3;font-size:13px;}.tot{text-align:right;font-size:18px;font-weight:800;margin-top:8px;color:#1c1917;}.btn{margin-bottom:14px;padding:8px 18px;background:#f59e0b;border:none;border-radius:7px;font-weight:700;font-size:13px;cursor:pointer;}@media print{.btn{display:none;}}</style></head><body>"
    +"<button class='btn' onclick='window.print()'>🖨️ Imprimir / PDF</button>"
    +"<h1>"+(config.razonSocial||"BPC")+"</h1>"
    +"<div class='sub'>"+[config.rfc?"RFC: "+config.rfc:"",config.direccion,config.telefono?"Tel: "+config.telefono:"",config.email].filter(Boolean).join(" · ")+"</div>"
    +"<table style='margin-bottom:8px;'><tr><td><b>Cotización #"+venta.folio+"</b></td><td>"+fi.icon+" "+fi.label+"</td><td>"+new Date(venta.fecha).toLocaleDateString("es-MX")+"</td></tr>"
    +"<tr><td><b>Cliente:</b> "+venta.cliente+"</td><td><b>Vendedor:</b> "+venta.vendedor+"</td><td><b>Pago:</b> "+venta.metodo+" "+(venta.pagado?"✓ Pagado":"(pendiente)")+"</td></tr>"
    +(venta.fechaEntrega?"<tr><td colspan='3'>📅 Entrega comprometida: "+new Date(venta.fechaEntrega).toLocaleDateString("es-MX",{weekday:"long",day:"2-digit",month:"long"})+"</td></tr>":"")
    +"</table>"+asig
    +"<table><thead><tr><th>#</th><th>Descripción</th><th>Cant.</th><th>P/Unit</th><th>Total</th></tr></thead><tbody>"+lineas+"</tbody></table>"
    +"<div class='tot'>Subtotal: "+fmt(venta.subtotal)+" &nbsp;·&nbsp; IVA 16%: "+fmt(venta.iva)+" &nbsp;·&nbsp; TOTAL: "+fmt(venta.total)+"</div>"
    +firma
    +(config.notas?"<p style='margin-top:16px;font-size:10px;color:#a8a29e;'>"+config.notas+"</p>":"")
    +"</body></html>";
  const blob=new Blob([html],{type:"text/html;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const win=window.open(url,"_blank");
  if(!win){const a=document.createElement("a");a.href=url;a.download="Cotizacion_"+venta.folio+".html";a.click();}
  setTimeout(()=>URL.revokeObjectURL(url),10000);
}

function HojaProduccionBtn({venta, size="md"}) {
  const [modal,setModal]=useState(false);
  const [notas,setNotas]=useState("");
  function imprimir(){generarHojaProduccion(venta,notas);setModal(false);setNotas("");}
  return <>
    <Btn v="sec" size={size} onClick={()=>setModal(true)} style={{borderColor:"#6366f1",color:"#818cf8"}}>🏭 {size==="sm"?"Prod.":"Hoja Producción"}</Btn>
    {modal&&<div style={{position:"fixed",inset:0,background:"#000c",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
    <div className="fu" style={{background:G.surface,border:"2px solid #6366f1",borderRadius:16,padding:28,maxWidth:460,width:"100%"}}>
    <div style={{fontWeight:800,fontSize:18,marginBottom:4}}>🏭 Hoja de Producción</div>
    <div style={{fontSize:13,color:G.muted,marginBottom:16}}>Orden <b style={{color:G.accent}}>#{venta.folio}</b> — {venta.cliente}</div>
    {venta.lineas.some(l=>l.clienteMat)&&<div style={{background:"#fef9c320",border:"2px solid #ca8a04",borderRadius:8,padding:"10px 14px",marginBottom:14}}>
    <div style={{fontWeight:800,fontSize:14,color:"#fbbf24",textDecoration:"underline"}}>⚠️ Esta orden tiene MATERIAL DEL CLIENTE</div>
    <div style={{fontSize:12,color:"#fcd34d",marginTop:3}}>Se marcará en grande en la hoja impresa.</div>
    </div>}
    <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:16}}>
    <label style={{fontSize:11,fontWeight:700,color:G.muted,textTransform:"uppercase",letterSpacing:.8}}>Notas para el taller (opcional)</label>
    <textarea value={notas} onChange={e=>setNotas(e.target.value)} placeholder="Ej: Enchape en canto largo · Cliente trae herrajes · Urgente..." style={{...inp,height:72,resize:"vertical"}}/>
    </div>
    <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
    <Btn v="ghost" onClick={()=>{setModal(false);setNotas("");}}>Cancelar</Btn>
    <Btn v="pri" onClick={imprimir} style={{background:"#6366f1"}}>🖨️ Generar e imprimir</Btn>
    </div>
    </div>
    </div>}
  </>;
}

function DetalleVenta({venta,onClose,onUpdate,usuario}) {
  const [pagado,setPagado]=useState(venta.pagado);
  const [estado,setEstado]=useState(venta.estado);
  const [asigCorte,setAsigCorte]=useState(venta.asigCorte||"");
  const [asigEnchape,setAsigEnchape]=useState(venta.asigEnchape||"");
  const [notaInterna,setNotaInterna]=useState(venta.notaInterna||"");
  function guardar(){onUpdate({...venta,pagado,estado,notaInterna,asigCorte:asigCorte||null,asigEnchape:asigEnchape||null,historial:[...venta.historial,{estado,ts:new Date().toISOString(),quien:"Admin (edición manual)"}]});}
  function guardarNota(nota){
    const s=loadStore();if(!s)return;
    saveStore({...s,ventas:s.ventas.map(v=>v.folio===venta.folio?{...v,notaInterna:nota}:v)});
    onUpdate({...venta,notaInterna:nota});
  }
  function revertirAdmin(){
    const prev=estadoAnterior(venta);if(!prev)return;
    const s=loadStore();if(!s)return;
    const ts=new Date().toISOString();
    let nuevoInv=s.inventario;
    if(venta.estado==="surtir"){nuevoInv=s.inventario.map(item=>{const linea=venta.lineas.find(l=>l.nombre===item.nombre&&!l.clienteMat);if(linea)return{...item,stock:item.stock+linea.cant};return item;});}
    const updated={...venta,estado:prev,recibidoEnPiso:prev==="surtir"?null:venta.recibidoEnPiso,historial:[...venta.historial,{estado:prev,ts,quien:"Admin (revirtió)"}]};
    saveStore({...s,ventas:s.ventas.map(v=>v.folio===venta.folio?updated:v),inventario:nuevoInv});
    onUpdate(updated);
  }
  return <div className="fu" style={{display:"flex",flexDirection:"column",gap:14}}>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
  <div><h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:22}}>Cotización <span style={{color:G.accent}}>#{venta.folio}</span></h2><span style={{color:G.muted,fontSize:12}}>{fmtFecha(venta.fecha)} · {venta.vendedor}</span></div>
  <div style={{display:"flex",gap:8}}>
  <Btn v="sec" onClick={()=>{const s=loadStore();generarPDF(venta,(s?s.config:{})||{});}}>🖨️ Cotización</Btn>
  <HojaProduccionBtn venta={venta}/>
  <Btn v="ghost" onClick={onClose}>← Volver</Btn>
  </div>
  </div>
  <div style={{display:"grid",gridTemplateColumns:"220px 1fr",gap:14}}>
  <div style={{display:"flex",flexDirection:"column",gap:10}}>
  <Card style={{padding:14,display:"flex",flexDirection:"column",gap:10}}>
  {[["Cliente",venta.cliente],["Método",venta.metodo],["Proyecto",venta.proyecto]].map(([l,v])=>v&&<div key={l}><span style={{fontSize:11,color:G.muted}}>{l}</span><div style={{fontWeight:600,fontSize:14}}>{v}</div></div>)}
  {(venta.asigCorte||venta.asigEnchape)&&<div style={{background:"#facc1510",border:"1px solid #facc1530",borderRadius:7,padding:"6px 10px"}}>
  <div style={{fontSize:11,fontWeight:700,color:"#facc15",marginBottom:3}}>⚡ Asignación actual</div>
  {venta.asigCorte&&<div style={{fontSize:12}}>✂️ Corte: <b>{venta.asigCorte}</b></div>}
  {venta.asigEnchape&&<div style={{fontSize:12}}>🪵 Enchape: <b>{venta.asigEnchape}</b></div>}
  </div>}
  {venta.fechaEntrega&&<div><span style={{fontSize:11,color:G.muted}}>📅 Entrega comprometida</span>
  <div style={{fontWeight:600,fontSize:13,color:"#fb923c"}}>{new Date(venta.fechaEntrega).toLocaleDateString("es-MX",{weekday:"short",day:"2-digit",month:"short",year:"numeric"})} {new Date(venta.fechaEntrega).toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"})}hrs</div>
  </div>}
  <div style={{background:"#1e293b",border:"1px solid #334155",borderRadius:8,padding:10}}>
  <div style={{fontSize:11,fontWeight:700,color:"#94a3b8",marginBottom:6,letterSpacing:.8}}>📝 NOTA INTERNA</div>
  <textarea value={notaInterna} onChange={e=>setNotaInterna(e.target.value)} onBlur={e=>guardarNota(e.target.value)} placeholder="Nota interna... (el cliente llamó, cambió medidas, etc.)" style={{...inp,height:60,resize:"vertical",fontSize:12,background:"#0f172a",borderColor:"#334155"}}/>
  <div style={{fontSize:10,color:"#475569",marginTop:3}}>Solo visible internamente — no aparece en PDF</div>
  </div>
  {venta.firma&&<div style={{background:"#f0fdf420",border:"1px solid #86efac44",borderRadius:8,padding:10}}>
  <div style={{fontSize:11,fontWeight:700,color:"#34d399",marginBottom:6}}>✅ FIRMA DE RECIBIDO</div>
  <img src={venta.firma} style={{maxWidth:"100%",maxHeight:80,borderRadius:4}}/>
  <div style={{fontSize:11,color:"#34d399",marginTop:4}}>{fmtFecha(venta.firmaTs)} {fmtHora(venta.firmaTs)}hrs</div>
  </div>}
  <Divider/>
  <AsignacionSelector lineas={venta.lineas} asigCorte={asigCorte} asigEnchape={asigEnchape} onCorte={setAsigCorte} onEnchape={setAsigEnchape}/>
  <Sel label="Estado" value={estado} onChange={setEstado} options={FLUJO.map(f=>({v:f.id,l:`${f.icon} ${f.label}`}))}/>
  <label style={{display:"flex",gap:8,alignItems:"center",cursor:"pointer",fontSize:13}}><input type="checkbox" checked={pagado} onChange={e=>setPagado(e.target.checked)} style={{accentColor:G.accent,width:16,height:16}}/>Pagado</label>
  <label style={{display:"flex",gap:8,alignItems:"center",cursor:"pointer",padding:"7px 10px",borderRadius:8,background:venta.urgente?"#dc262620":"transparent",border:venta.urgente?"1px solid #dc262660":"1px solid "+G.border}}>
  <input type="checkbox" checked={!!venta.urgente} onChange={e=>{const s=loadStore();if(!s)return;saveStore({...s,ventas:s.ventas.map(v=>v.folio===venta.folio?{...v,urgente:e.target.checked}:v)});onUpdate({...venta,urgente:e.target.checked});}} style={{accentColor:"#f87171",width:16,height:16}}/>
  <span style={{fontWeight:700,color:venta.urgente?"#f87171":"#78716c",fontSize:13}}>🔴 {venta.urgente?"¡URGENTE!":"Marcar urgente"}</span>
  </label>
  <Btn v="pri" onClick={guardar} full>Guardar cambios</Btn>
  {estadoAnterior(venta)&&<Btn v="warn" onClick={revertirAdmin} full>↩ Revertir un paso</Btn>}
  </Card>
  <Card style={{padding:14}}>
  <p style={{fontSize:11,fontWeight:700,color:G.muted,marginBottom:10}}>HISTORIAL</p>
  {venta.historial.map((h,i)=>{const f=flujoInfo(h.estado);return <div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"flex-start"}}>
  <span style={{fontSize:14,marginTop:1}}>{f.icon}</span>
  <div><div style={{fontSize:12,fontWeight:700,color:f.color}}>{f.label}</div><div style={{fontSize:11,color:G.muted}}>{fmtFecha(h.ts)} {fmtHora(h.ts)}</div>{h.quien&&<div style={{fontSize:11,color:"#57534e"}}>{h.quien}</div>}</div>
  </div>;})}
  </Card>
  </div>
  <div style={{display:"flex",flexDirection:"column",gap:10}}>
  <Card><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
  <thead><tr style={{borderBottom:`1px solid ${G.border}`}}>{["Producto","Cant.","P/Unit","Total"].map(h=><th key={h} style={{padding:"9px 13px",textAlign:"left",fontSize:11,fontWeight:700,color:G.muted}}>{h}</th>)}</tr></thead>
  <tbody>{venta.lineas.map((l,i)=><tr key={i} style={{borderBottom:`1px solid ${G.border}50`}}>
  <td style={{padding:"8px 13px"}}>{l.nombre}{l.clienteMat&&<span style={{color:G.muted,fontSize:11,marginLeft:6}}>(cliente mat.)</span>}</td>
  <td style={{padding:"8px 13px",color:G.muted}}>{l.cant}</td>
  <td style={{padding:"8px 13px",color:G.muted}}>{$$(l.precio)}</td>
  <td style={{padding:"8px 13px",fontWeight:700,color:"#fbbf24"}}>{$$(l.total)}</td>
  </tr>)}</tbody>
  </table></Card>
  <Card style={{padding:14}}>
  {[["Subtotal",venta.subtotal],["IVA 16%",venta.iva]].map(([l,v])=><div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:13,color:G.muted,marginBottom:6}}><span>{l}</span><span>{$$(v)}</span></div>)}
  <Divider/>
  <div style={{display:"flex",justifyContent:"space-between",fontSize:20,fontWeight:800,color:G.accent}}><span>Total</span><span>{$$(venta.total)}</span></div>
  </Card>
  </div>
  </div>
  </div>;
}

function ListaVentas({store,onNueva,onVer,onAvanzar,onRevertir,usuario}) {
  const [filtro,setFiltro]=useState(""); const [estFiltro,setEstFiltro]=useState(""); const [confirmRev,setConfirmRev]=useState(null);
  const ventas=store.ventas;
  const filtradas=ventas.filter(v=>(!filtro||v.cliente.toLowerCase().includes(filtro.toLowerCase())||String(v.folio).includes(filtro))&&(!estFiltro||v.estado===estFiltro)).sort((a,b)=>{if(a.urgente&&!b.urgente)return -1;if(!a.urgente&&b.urgente)return 1;return b.folio-a.folio;});
  const hoy=ventas.filter(v=>new Date(v.fecha).toDateString()===hoyStr());
  const totalHoy=hoy.filter(v=>v.pagado).reduce((s,v)=>s+v.total,0);
  return <div className="fu" style={{display:"flex",flexDirection:"column",gap:14}}>
  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
  {[{l:"Ventas hoy",v:$$(totalHoy),i:"💰"},{l:"Cotizaciones hoy",v:hoy.length,i:"📋"},{l:"Sin cobrar",v:ventas.filter(v=>!v.pagado&&v.estado!=="entregada").length,i:"⏳"},{l:"En producción",v:ventas.filter(v=>["surtir","corte","enchape"].includes(v.estado)).length,i:"⚙️"}].map(k=>
  <Card key={k.l} style={{padding:13}}><div style={{fontSize:20,marginBottom:4}}>{k.i}</div><div style={{fontSize:20,fontWeight:800,color:G.accent}}>{k.v}</div><div style={{fontSize:11,color:G.muted}}>{k.l}</div></Card>)}
  </div>
  <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end"}}>
  <div style={{flex:1,minWidth:160}}><Inp value={filtro} onChange={setFiltro} placeholder="Buscar folio o cliente..."/></div>
  <div style={{width:180}}><Sel value={estFiltro} onChange={setEstFiltro} options={FLUJO.map(f=>({v:f.id,l:`${f.icon} ${f.label}`}))}/></div>
  <Btn v="pri" onClick={onNueva}>+ Nueva Cotización</Btn>
  </div>
  <Card>
  {filtradas.length===0?<div style={{padding:48,textAlign:"center",color:"#44403c"}}><div style={{fontSize:36,marginBottom:8}}>📋</div><p>Sin cotizaciones</p><div style={{marginTop:14}}><Btn v="pri" onClick={onNueva}>+ Crear la primera</Btn></div></div>:
  <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
  <thead><tr style={{borderBottom:`1px solid ${G.border}`}}>{["Folio","Cliente","Fecha","Vendedor","Total","Pago","Estado","Asignado a",""].map(h=><th key={h} style={{padding:"9px 13px",textAlign:"left",fontSize:11,fontWeight:700,color:G.muted}}>{h}</th>)}</tr></thead>
  <tbody>{filtradas.map(v=><tr key={v.folio} style={{borderBottom:`1px solid ${G.border}40`,transition:"background .1s"}} onMouseEnter={e=>e.currentTarget.style.background=G.surface2+"80"} onMouseLeave={e=>e.currentTarget.style.background=""}>
  <td style={{padding:"9px 13px",fontFamily:"monospace",color:v.urgente?"#f87171":G.accent,fontWeight:700}}>#{v.folio}{v.urgente&&<span style={{marginLeft:6,fontSize:10,fontWeight:800,color:"#f87171",background:"#dc262620",border:"1px solid #dc262644",borderRadius:4,padding:"1px 5px"}}>🔴 URG</span>}</td>
  <td style={{padding:"9px 13px",fontWeight:v.urgente?800:600,color:v.urgente?"#fca5a5":"inherit"}}>{v.cliente}</td>
  <td style={{padding:"9px 13px",color:G.muted}}>{fmtFecha(v.fecha)}</td>
  <td style={{padding:"9px 13px",color:G.muted}}>{v.vendedor}</td>
  <td style={{padding:"9px 13px",fontWeight:700}}>{$$(v.total)}</td>
  <td style={{padding:"9px 13px"}}><Tag color={v.pagado?"#34d399":"#f87171"}>{v.pagado?"✓ Pagado":"Pendiente"}</Tag></td>
  <td style={{padding:"9px 13px"}}><Pill estado={v.estado}/></td>
  <td style={{padding:"9px 13px"}}>
  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
  {v.asigCorte&&<Tag color="#facc15">✂️ {v.asigCorte.split(" ")[0]}</Tag>}
  {v.asigEnchape&&<Tag color="#a78bfa">🪵 {v.asigEnchape.split(" ")[0]}</Tag>}
  {!v.asigCorte&&!v.asigEnchape&&<span style={{color:"#44403c",fontSize:11}}>—</span>}
  </div>
  </td>
  <td style={{padding:"9px 13px"}}><div style={{display:"flex",gap:6,flexWrap:"wrap"}}><Btn v="sec" size="sm" onClick={()=>onVer(v)}>Ver</Btn><HojaProduccionBtn venta={v} size="sm"/>{v.estado==="cotizacion"&&<Btn v="ok" size="sm" onClick={()=>onAvanzar(v)}>Confirmar ✓</Btn>}{puedeRevertir(v,usuario)&&<Btn v="warn" size="sm" onClick={()=>setConfirmRev(v)}>↩ Revertir</Btn>}</div></td>
  </tr>)}</tbody>
  </table></div>}
  </Card>
  {confirmRev&&<Confirm danger msg={"¿Revertir la orden #"+confirmRev.folio+" de "+confirmRev.cliente+"?\nRegresará a: "+flujoInfo(estadoAnterior(confirmRev)).label+(confirmRev.estado==="surtir"?"\n⚠️ El inventario se repondrá automáticamente.":"")} onOk={()=>{onRevertir(confirmRev);setConfirmRev(null);}} onCancel={()=>setConfirmRev(null)}/>}
  </div>;
}

function Kanban({onAvanzar}) {
  const [ventas,setVentas]=useState(()=>(loadStore()||{ventas:[]}).ventas||[]);
  const [resaltado,setResaltado]=useState(null);
  useEffect(()=>{function refresh(){const s=loadStore();if(s)setVentas([...s.ventas]);}refresh();const iv=setInterval(refresh,2000);return()=>clearInterval(iv);},[]);
  function avanzar(v){onAvanzar(v);setResaltado(v.folio);setTimeout(()=>{const s=loadStore();if(s)setVentas([...s.ventas]);setResaltado(null);},400);}
  return <div className="fu" style={{display:"flex",flexDirection:"column",gap:14}}>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
  <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:24}}>Tablero de Producción</h2>
  <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:8,height:8,borderRadius:"50%",background:"#34d399"}}/><span style={{fontSize:12,color:G.muted}}>En vivo · {ventas.length} órdenes</span></div>
  </div>
  <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:8,alignItems:"flex-start"}}>
  {FLUJO.map(col=>{const ords=ventas.filter(v=>v.estado===col.id);return <div key={col.id} style={{minWidth:210,flexShrink:0}}>
  <div style={{padding:"8px 12px",borderRadius:"10px 10px 0 0",background:col.color+"22",border:`1px solid ${col.color}44`,borderBottom:"none",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
  <span style={{fontWeight:700,fontSize:12,color:col.color}}>{col.icon} {col.label}</span>
  <span style={{background:col.color+"33",color:col.color,borderRadius:20,padding:"1px 9px",fontSize:12,fontWeight:800}}>{ords.length}</span>
  </div>
  <div style={{background:G.surface,border:`1px solid ${col.color}22`,borderTop:"none",borderRadius:"0 0 10px 10px",padding:8,minHeight:80,display:"flex",flexDirection:"column",gap:7}}>
  {ords.length===0&&<div style={{textAlign:"center",padding:"16px 0",color:"#3d3835",fontSize:12}}>—</div>}
  {ords.map(v=><div key={v.folio} style={{background:resaltado===v.folio?col.color+"22":G.surface2,borderRadius:8,padding:10,border:`1px solid ${resaltado===v.folio?col.color+"55":"transparent"}`,transition:"all .3s"}}>
  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
  <span style={{fontFamily:"monospace",color:v.urgente?"#f87171":col.color,fontSize:12,fontWeight:700}}>#{v.folio}{v.urgente&&<span style={{marginLeft:4,fontSize:9,fontWeight:800,color:"#f87171"}}>🔴</span>}</span>
  <Tag color={v.pagado?"#34d399":"#f87171"}>{v.pagado?"✓":"$"}</Tag>
  </div>
  <div style={{fontWeight:600,fontSize:13,marginBottom:1}}>{v.cliente}</div>
  <div style={{color:G.muted,fontSize:11}}>{$$(v.total)}</div>
  {(v.asigCorte||v.asigEnchape)&&<div style={{display:"flex",gap:4,flexWrap:"wrap",margin:"4px 0"}}>
  {v.asigCorte&&<Tag color="#facc15">✂️ {v.asigCorte.split(" ")[0]}</Tag>}
  {v.asigEnchape&&<Tag color="#a78bfa">🪵 {v.asigEnchape.split(" ")[0]}</Tag>}
  </div>}
  {col.id!=="entregada"&&<div style={{marginTop:6}}><Btn v="sec" size="sm" full onClick={()=>avanzar(v)}>{col.id==="listo"?"🚚 Entregar":"Avanzar →"}</Btn></div>}
  </div>)}
  </div>
  </div>;})}
  </div>
  </div>;
}

function TableroVendedor({store,usuario}) {
  const misVentas=store.ventas.filter(v=>v.vendedor===usuario.nombre);
  const activas=misVentas.filter(v=>v.estado!=="entregada");
  const hoy=misVentas.filter(v=>new Date(v.fecha).toDateString()===hoyStr());
  return <div className="fu" style={{display:"flex",flexDirection:"column",gap:16}}>
  <div><h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:24}}>Mis Órdenes</h2><p style={{color:G.muted,fontSize:13}}>{usuario.nombre} · {activas.length} activas</p></div>
  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
  {[{l:"Ventas hoy",v:$$(hoy.filter(v=>v.pagado).reduce((s,v)=>s+v.total,0)),i:"💰"},{l:"Activas",v:activas.length,i:"⚙️"},{l:"Sin cobrar",v:misVentas.filter(v=>!v.pagado&&v.estado!=="entregada").length,i:"⏳"}].map(k=>
  <Card key={k.l} style={{padding:12}}><div style={{fontSize:20,marginBottom:3}}>{k.i}</div><div style={{fontSize:20,fontWeight:800,color:G.accent}}>{k.v}</div><div style={{fontSize:11,color:G.muted}}>{k.l}</div></Card>)}
  </div>
  {activas.length===0?<Card style={{padding:32,textAlign:"center"}}><div style={{fontSize:36,marginBottom:8}}>✅</div><p style={{color:G.muted}}>No tienes órdenes activas</p></Card>:
  activas.sort((a,b)=>b.folio-a.folio).map(v=>{
  const fi=flujoInfo(v.estado);const idx=FLUJO.findIndex(f=>f.id===v.estado);const pct=Math.round((idx/(FLUJO.length-1))*100);
  return <Card key={v.folio} style={{padding:14}}>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
  <div><span style={{fontFamily:"monospace",color:G.accent,fontSize:13,fontWeight:700}}>#{v.folio}</span><span style={{fontWeight:700,fontSize:15,marginLeft:8}}>{v.cliente}</span>
  {v.proyecto&&<span style={{color:G.muted,fontSize:12,marginLeft:8}}>· {v.proyecto}</span>}
  <div style={{color:G.muted,fontSize:11,marginTop:2}}>{fmtFecha(v.fecha)} · {$$(v.total)}</div>
  </div>
  <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",justifyContent:"flex-end"}}>
  <Tag color={v.pagado?"#34d399":"#f87171"}>{v.pagado?"✓ Pagado":"Pendiente"}</Tag>
  <Tag color={fi.color}>{fi.icon} {fi.label}</Tag>
  {v.asigCorte&&<Tag color="#facc15">✂️ {v.asigCorte.split(" ")[0]}</Tag>}
  {v.asigEnchape&&<Tag color="#a78bfa">🪵 {v.asigEnchape.split(" ")[0]}</Tag>}
  </div>
  </div>
  <div style={{marginTop:6}}>
  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
  {FLUJO.map((f,i)=><div key={f.id} style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
  <div style={{width:22,height:22,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,background:i<=idx?f.color:G.surface2,border:`2px solid ${i<=idx?f.color:G.border}`,transition:"all .3s"}}>{i<idx?"✓":i===idx?f.icon:""}</div>
  </div>)}
  </div>
  <div style={{height:3,background:G.surface2,borderRadius:3,margin:"0 11px"}}><div style={{height:"100%",width:`${pct}%`,background:fi.color,borderRadius:3,transition:"width .5s"}}/></div>
  </div>
  </Card>;
  })}
  </div>;
}

function CanvasFirma({onGuardar,onCancelar}) {
  const canvasRef=useRef(null);const drawing=useRef(false);const [hasFirma,setHasFirma]=useState(false);
  function getPos(e,c){const r=c.getBoundingClientRect();const s=e.touches?e.touches[0]:e;return{x:s.clientX-r.left,y:s.clientY-r.top};}
  function startDraw(e){e.preventDefault();const c=canvasRef.current;const ctx=c.getContext("2d");const{x,y}=getPos(e,c);ctx.beginPath();ctx.moveTo(x,y);drawing.current=true;}
  function draw(e){if(!drawing.current)return;e.preventDefault();const c=canvasRef.current;const ctx=c.getContext("2d");ctx.lineWidth=3;ctx.lineCap="round";ctx.strokeStyle="#1c1917";const{x,y}=getPos(e,c);ctx.lineTo(x,y);ctx.stroke();ctx.beginPath();ctx.moveTo(x,y);setHasFirma(true);}
  function endDraw(e){e.preventDefault();drawing.current=false;}
  function limpiar(){const c=canvasRef.current;c.getContext("2d").clearRect(0,0,c.width,c.height);setHasFirma(false);}
  return <div style={{position:"fixed",inset:0,background:"#000d",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
  <div style={{background:"#fff",borderRadius:16,padding:20,width:"100%",maxWidth:440,display:"flex",flexDirection:"column",gap:12}}>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontWeight:800,fontSize:16,color:"#1c1917"}}>✍️ Firma de recibido</div><div style={{fontSize:12,color:"#78716c"}}>El cliente firma aquí</div></div><button onClick={onCancelar} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#78716c"}}>×</button></div>
  <div style={{background:"#f9f7f5",border:"2px solid #e8e5e3",borderRadius:10,touchAction:"none",userSelect:"none"}}>
  <canvas ref={canvasRef} width={400} height={180} style={{display:"block",width:"100%",height:180,cursor:"crosshair",borderRadius:8}}
  onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
  onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}/>
  </div>
  <div style={{fontSize:11,color:"#a8a29e",textAlign:"center"}}>Firma con el dedo o mouse dentro del recuadro</div>
  <div style={{display:"flex",gap:10}}>
  <button onClick={limpiar} style={{flex:1,padding:11,background:"#f5f5f4",border:"1px solid #e8e5e3",borderRadius:9,fontWeight:700,fontSize:13,cursor:"pointer"}}>🔄 Limpiar</button>
  <button onClick={()=>onGuardar(canvasRef.current.toDataURL("image/png"))} disabled={!hasFirma} style={{flex:2,padding:11,background:hasFirma?"#059669":"#a8a29e",border:"none",borderRadius:9,fontWeight:800,fontSize:14,color:"white",cursor:hasFirma?"pointer":"not-allowed"}}>✅ Confirmar firma</button>
  </div>
  </div>
  </div>;
}

function PantallaEntrega({usuario,onLogout}) {
  const [ventas,setVentas]=useState([]);const [confirm,setConfirm]=useState(null);const [firmaModal,setFirmaModal]=useState(null);const [cobradoTemp,setCobradoTemp]=useState(false);
  function refresh(){const s=loadStore();if(s)setVentas(s.ventas.filter(v=>v.estado==="listo"));}
  useEffect(()=>{refresh();const iv=setInterval(refresh,2000);return()=>clearInterval(iv);},[]);
  function iniciarEntrega(venta,cobrado){setCobradoTemp(cobrado);setConfirm(null);setFirmaModal(venta);}
  function guardarFirma(dataUrl){const s=loadStore();if(!s)return;const ts=new Date().toISOString();saveStore({...s,ventas:s.ventas.map(v=>v.folio===firmaModal.folio?{...v,estado:"entregada",pagado:cobradoTemp||v.pagado,firma:dataUrl,firmaTs:ts,historial:[...v.historial,{estado:"entregada",ts,quien:usuario.nombre}]}:v)});setFirmaModal(null);refresh();}
  return <div style={{minHeight:"100vh",background:G.bg,display:"flex",flexDirection:"column"}}>
  <style>{globalCSS}</style>
  <div style={{background:G.surface,borderBottom:`1px solid ${G.border}`,padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
  <div><div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:"#6ee7b7"}}>🚚 Entregas</div><div style={{fontSize:12,color:G.muted}}>{usuario.nombre}</div></div>
  <div style={{display:"flex",gap:12,alignItems:"center"}}><div style={{textAlign:"right"}}><div style={{fontSize:28,fontWeight:800,color:"#6ee7b7"}}>{ventas.length}</div><div style={{fontSize:11,color:G.muted}}>listas para entregar</div></div><Btn v="ghost" size="sm" onClick={onLogout}>Salir</Btn></div>
  </div>
  <div style={{flex:1,padding:16,display:"flex",flexDirection:"column",gap:12,overflowY:"auto"}}>
  {ventas.length===0?<div style={{paddingTop:60,textAlign:"center",color:"#44403c"}}><div style={{fontSize:52,marginBottom:10}}>📭</div><p style={{fontSize:16,fontWeight:700,color:"#6ee7b7"}}>Sin entregas pendientes</p></div>:
  ventas.map(v=><Card key={v.folio} className="fu" style={{padding:16,borderColor:"#6ee7b744"}}>
  <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><div><span style={{fontFamily:"monospace",color:"#6ee7b7",fontSize:15,fontWeight:700}}>#{v.folio}</span><span style={{fontWeight:700,fontSize:17,marginLeft:10}}>{v.cliente}</span>{v.proyecto&&<div style={{color:G.muted,fontSize:12}}>📁 {v.proyecto}</div>}</div><Tag color={v.pagado?"#34d399":"#f87171"}>{v.pagado?"✓ Pagado":"Pendiente"}</Tag></div>
  {v.fechaEntrega&&<div style={{background:"#fb923c15",border:"1px solid #fb923c44",borderRadius:7,padding:"6px 10px",marginBottom:10,fontSize:12}}>📅 <b style={{color:"#fb923c"}}>{new Date(v.fechaEntrega).toLocaleDateString("es-MX",{weekday:"short",day:"2-digit",month:"short"})} {new Date(v.fechaEntrega).toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"})}hrs</b>{new Date()>new Date(v.fechaEntrega)&&<span style={{color:"#f87171",marginLeft:8,fontWeight:700}}>⚠️ Vencida</span>}</div>}
  <div style={{background:G.surface2,borderRadius:8,padding:"8px 12px",marginBottom:14}}>
  {v.lineas.map((l,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:i<v.lineas.length-1?`1px solid ${G.border}30`:"none",fontSize:13}}><span style={{color:"#d6d3d1"}}>{l.nombre}</span><span style={{color:G.muted,fontWeight:600}}>{l.cant} uds</span></div>)}
  <div style={{display:"flex",justifyContent:"space-between",marginTop:8,paddingTop:8,borderTop:`1px solid ${G.border}`,fontWeight:800,fontSize:14}}><span style={{color:G.muted}}>Total</span><span style={{color:G.accent}}>{$$(v.total)}</span></div>
  </div>
  <div style={{display:"flex",gap:10}}>
  {!v.pagado&&<button onClick={()=>setConfirm({venta:v,cobrado:true})} style={{flex:1,padding:13,background:"#059669",border:"none",borderRadius:11,fontSize:14,fontWeight:800,color:"white",cursor:"pointer",fontFamily:"inherit"}}>💰 Entregada y cobrada</button>}
  <button onClick={()=>setConfirm({venta:v,cobrado:false})} style={{flex:1,padding:13,background:"#6ee7b7",border:"none",borderRadius:11,fontSize:14,fontWeight:800,color:"#1c1917",cursor:"pointer",fontFamily:"inherit"}}>🚚 {v.pagado?"Confirmar entrega":"Entregada (ya pagó)"}</button>
  </div>
  </Card>)}
  </div>
  {confirm&&<Confirm msg={`¿Confirmas la entrega de la orden #${confirm.venta.folio} a ${confirm.venta.cliente}?\nEl cliente deberá firmar.${confirm.cobrado?" Se marcará como pagada.":""}`} onOk={()=>iniciarEntrega(confirm.venta,confirm.cobrado)} onCancel={()=>setConfirm(null)}/>}
  {firmaModal&&<CanvasFirma onGuardar={guardarFirma} onCancelar={()=>setFirmaModal(null)}/>}
  </div>;
}

function PantallaOperario({usuario,onLogout}) {
  const [tab,setTab]=useState("recibir");
  const [porRecibir,setPorRecibir]=useState([]);
  const [enProceso,setEnProceso]=useState([]);
  const [confirm,setConfirm]=useState(null);
  const [checks,setChecks]=useState({});
  const estacion=usuario.estacion; const fi=flujoInfo(estacion);

  useEffect(()=>{
    function refresh(){
      const s=loadStore(); if(!s)return;
      const campo=estacion==="corte"?"asigCorte":"asigEnchape";
      // "Por Recibir": órdenes en "surtir" que me tocan (asignadas a mí o sin asignar)
      const enSurtir=s.ventas.filter(v=>v.estado==="surtir");
      const porRec=enSurtir.filter(v=>{
        const sig=siguienteEstadoOrden("surtir",v.lineas);
        // Solo me interesan las que el siguiente paso es mi estación
        if(estacion==="corte" && sig!=="corte") return false;
        if(estacion==="enchape" && sig!=="enchape") return false;
        return v[campo]===usuario.nombre||!v[campo];
      });
      // "En Proceso": órdenes ya en mi estación con recibidoEnPiso
      const enMiEstacion=s.ventas.filter(v=>v.estado===estacion);
      const enProc=enMiEstacion.filter(v=>v[campo]===usuario.nombre||!v[campo]);
      setPorRecibir(porRec.filter(v=>!v.recibidoEnPiso).sort((a,b)=>b.urgente?1:-1));
      setEnProceso(enProc.sort((a,b)=>b.urgente?1:-1));
    }
    refresh(); const iv=setInterval(refresh,2000); return()=>clearInterval(iv);
  },[estacion,usuario.nombre]);

  function aceptarRecibo(venta){
    const s=loadStore(); if(!s)return;
    const ts=new Date().toISOString();
    // Avanzar la orden a mi estación y marcar recibidoEnPiso
    saveStore({...s,ventas:s.ventas.map(v=>v.folio===venta.folio?{...v,
      estado:estacion,
      recibidoEnPiso:ts,
      historial:[...v.historial,{estado:estacion,ts,quien:usuario.nombre+" (aceptó material)"}]
    }:v)});
    setTab("proceso");
  }

  function terminar(venta){
    const s=loadStore(); if(!s)return;
    const sig=siguienteEstadoOrden(venta.estado,venta.lineas);
    saveStore({...s,ventas:s.ventas.map(v=>v.folio===venta.folio?{...v,estado:sig,historial:[...v.historial,{estado:sig,ts:new Date().toISOString(),quien:usuario.nombre}]}:v)});
    setConfirm(null);
  }

  return <div style={{minHeight:"100vh",background:G.bg,display:"flex",flexDirection:"column"}}>
  <style>{globalCSS}</style>
  <div style={{background:G.surface,borderBottom:"1px solid "+G.border,padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
  <div><div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:fi.color}}>{fi.icon} {fi.label}</div><div style={{fontSize:12,color:G.muted}}>{usuario.nombre}</div></div>
  <div style={{display:"flex",gap:12,alignItems:"center"}}>
  <div style={{textAlign:"right"}}>
  <div style={{fontSize:16,fontWeight:800,color:"#fb923c"}}>{porRecibir.length} <span style={{fontSize:12,color:G.muted}}>por recibir</span></div>
  <div style={{fontSize:16,fontWeight:800,color:fi.color}}>{enProceso.length} <span style={{fontSize:12,color:G.muted}}>en proceso</span></div>
  </div>
  <Btn v="ghost" size="sm" onClick={onLogout}>Salir</Btn>
  </div>
  </div>

  <div style={{display:"flex",borderBottom:"1px solid "+G.border,background:G.surface}}>
  {[{id:"recibir",label:"📥 Por Recibir ("+porRecibir.length+")",color:"#fb923c"},{id:"proceso",label:"🔨 En Proceso ("+enProceso.length+")",color:fi.color}].map(t=>
  <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"11px 20px",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,color:tab===t.id?t.color:G.muted,borderBottom:tab===t.id?"2px solid "+t.color:"2px solid transparent",transition:"all .15s"}}>{t.label}</button>)}
  </div>

  <div style={{flex:1,padding:16,display:"flex",flexDirection:"column",gap:12,overflowY:"auto"}}>

  {tab==="recibir"&&(porRecibir.length===0
  ? <div style={{paddingTop:60,textAlign:"center",color:"#44403c"}}><div style={{fontSize:52,marginBottom:10}}>📭</div><p style={{fontSize:16,fontWeight:700,color:"#fb923c"}}>Sin material por recibir</p></div> : porRecibir.map(v=>{
    const matLineas=v.lineas.filter(l=>!["Servicios","PVC"].includes(l.cat));
    const misChecks=checks[v.folio]||{};
    const totalItems=matLineas.length;
    const checkedItems=Object.values(misChecks).filter(Boolean).length;
    const sinMaterial=totalItems===0;
    const todoChecked=sinMaterial||checkedItems===totalItems;
    const ag=fmtAging(v.historial[v.historial.length-1].ts);
    return <Card key={v.folio} className="fu" style={{padding:16,borderColor:"#fb923c44"}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
    <div>
  {v.urgente&&<div style={{background:"#dc262620",border:"1px solid #dc2626",borderRadius:6,padding:"3px 10px",marginBottom:6,fontSize:12,fontWeight:800,color:"#f87171",display:"inline-block"}}>🔴 URGENTE</div>}
  <span style={{fontFamily:"monospace",color:v.urgente?"#f87171":"#fb923c",fontSize:15,fontWeight:700}}>#{v.folio}</span><span style={{fontWeight:700,fontSize:16,marginLeft:10}}>{v.cliente}</span>{v.proyecto&&<div style={{color:G.muted,fontSize:12}}>📁 {v.proyecto}</div>}</div>
    {(()=>{const campo=estacion==="corte"?"asigCorte":"asigEnchape";return v[campo]?<Tag color="#facc15">👤 {v[campo]}</Tag>:<Tag color="#57534e">Cola general</Tag>;})()}
    </div>
    <div style={{background:ag.color+"15",border:"1px solid "+ag.color+"40",borderRadius:7,padding:"5px 10px",marginBottom:10,fontSize:12}}>
    <span style={{color:ag.color,fontWeight:700}}>⏱️ Material enviado hace: {ag.txt}</span>
    </div>
    <div style={{background:G.surface2,borderRadius:8,padding:"10px 12px",marginBottom:12}}>
    <div style={{fontSize:11,fontWeight:700,color:G.muted,marginBottom:8}}>VERIFICAR MATERIAL RECIBIDO</div>
    {matLineas.length===0
    ? <p style={{fontSize:12,color:G.muted}}>Solo servicios — sin material físico</p> : matLineas.map((l,i)=><label key={i} style={{display:"flex",gap:12,alignItems:"center",padding:"12px 0",borderBottom:i<matLineas.length-1?"1px solid "+G.border+"40":"none",cursor:"pointer"}}>
    <input type="checkbox" checked={!!(misChecks[i])} onChange={e=>setChecks(prev=>({...prev,[v.folio]:{...(prev[v.folio]||{}),[i]:e.target.checked}}))} style={{accentColor:"#34d399",width:24,height:24,flexShrink:0}}/>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flex:1}}>
    <span style={{fontSize:15,fontWeight:600,color:misChecks[i]?"#34d399":"#d6d3d1",textDecoration:misChecks[i]?"line-through":"none"}}>{l.nombre}</span>
    <span style={{fontSize:16,fontWeight:800,color:misChecks[i]?"#34d399":"#f59e0b",background:misChecks[i]?"#34d39920":"#f59e0b20",padding:"3px 12px",borderRadius:8,flexShrink:0}}>×{l.cant}</span>
    </div>
    </label>)}
    </div>
    {sinMaterial ? <div style={{fontSize:12,color:"#34d399",marginBottom:10,textAlign:"center",fontWeight:600}}>✓ Sin material físico — puedes aceptar directo</div> : <div style={{fontSize:12,color:todoChecked?"#34d399":"#facc15",marginBottom:10,textAlign:"center",fontWeight:600}}>{todoChecked?"✓ Todo verificado":"Verificado "+checkedItems+"/"+totalItems+" — palomea todo para continuar"}</div>}
    <button onClick={()=>aceptarRecibo(v)} disabled={!todoChecked} style={{width:"100%",padding:14,background:todoChecked?"#059669":"#292524",border:"1px solid "+(todoChecked?"#059669":G.border),borderRadius:11,fontSize:15,fontWeight:800,color:todoChecked?"white":"#57534e",cursor:todoChecked?"pointer":"not-allowed",fontFamily:"inherit",transition:"all .2s"}}>
    {todoChecked?"✅ Aceptar recibo — Empezar a trabajar":"🔒 Palomea el material para continuar"}
    </button>
    </Card>;
  })
  )}

  {tab==="proceso"&&(enProceso.length===0
  ? <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,paddingTop:60}}><div style={{fontSize:60}}>✅</div><p style={{fontSize:20,fontWeight:700,color:"#34d399"}}>¡Todo al corriente!</p></div> : enProceso.map(v=><Card key={v.folio} className="fu" style={{padding:16}}>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
  <div><span style={{fontFamily:"monospace",color:fi.color,fontSize:15,fontWeight:700}}>#{v.folio}</span><span style={{fontWeight:700,fontSize:17,marginLeft:10}}>{v.cliente}</span>{v.proyecto&&<div style={{color:G.muted,fontSize:12,marginTop:2}}>📁 {v.proyecto}</div>}</div>
  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
  <Tag color={fi.color}>{fi.icon} En proceso</Tag>
  <span style={{fontSize:10,color:G.muted}}>→ {flujoInfo(siguienteEstadoOrden(estacion,v.lineas)).label}</span>
  </div>
  </div>
  <div style={{background:G.surface2,borderRadius:8,padding:"8px 12px",marginBottom:14}}>
  {v.lineas.map((l,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:i<v.lineas.length-1?"1px solid "+G.border+"30":"none",fontSize:13}}><span style={{color:"#d6d3d1"}}>{l.nombre}{l.clienteMat&&<span style={{color:G.muted,fontSize:11}}> (cliente mat.)</span>}</span><span style={{color:G.muted,fontWeight:600}}>{l.cant} uds</span></div>)}
  </div>
  <div style={{display:"flex",gap:8}}>
  <button onClick={()=>setConfirm(v)} style={{flex:1,padding:14,background:fi.color,border:"none",borderRadius:11,fontSize:15,fontWeight:800,color:"#1c1917",cursor:"pointer",fontFamily:"inherit"}} onMouseEnter={e=>e.currentTarget.style.filter="brightness(1.1)"} onMouseLeave={e=>e.currentTarget.style.filter=""}>✅ Terminé esta orden</button>
  {estadoAnterior(v)&&<button onClick={()=>setConfirmRev(v)} style={{padding:"14px 16px",background:"#292524",border:"1px solid #dc262644",borderRadius:11,fontSize:14,fontWeight:700,color:"#f87171",cursor:"pointer",fontFamily:"inherit"}}>↩ Revertir</button>}
  </div>
  </Card>)
  )}

  </div>
  {confirm&&<Confirm msg={"¿Confirmas que terminaste la orden #"+confirm.folio+" de "+confirm.cliente+"?\n\nPasará a: "+flujoInfo(siguienteEstadoOrden(estacion,confirm.lineas)).label} onOk={()=>terminar(confirm)} onCancel={()=>setConfirm(null)}/>}
  {confirmRev&&estadoAnterior(confirmRev)&&<Confirm danger msg={"¿Revertir la orden #"+confirmRev.folio+"?\nRegresará a: "+flujoInfo(estadoAnterior(confirmRev)).label} onOk={()=>{ejecutarReversion(confirmRev,usuario);setConfirmRev(null);}} onCancel={()=>setConfirmRev(null)}/>}
  </div>;
}

function PantallaSurtido({usuario,onLogout}) {
  const [tab,setTab]=useState("pendientes");
  const [verAprobaciones,setVerAprobaciones]=useState(false);
  const [ventasPend,setVentasPend]=useState([]);const [ventasSurt,setVentasSurt]=useState([]);const [inv,setInv]=useState([]);
  const [storeSnap,setStoreSnap]=useState(()=>loadStore()||{ventas:[],inventario:[],recepciones:[],cierresMes:[]});
  const [confirmSurtir,setConfirmSurtir]=useState(null);
  const [confirmRev,setConfirmRev]=useState(null);
  function refresh(){const s=loadStore();if(!s)return;const sortUrg=(a,b)=>a.urgente&&!b.urgente?-1:!a.urgente&&b.urgente?1:0;setVentasPend(s.ventas.filter(v=>v.estado==="confirmada").sort(sortUrg));setVentasSurt(s.ventas.filter(v=>v.estado==="surtir").sort(sortUrg));setInv(s.inventario);setStoreSnap(s);}
  useEffect(()=>{refresh();const iv=setInterval(refresh,2000);return()=>clearInterval(iv);});
  const pendAprobaciones=storeSnap?(storeSnap.recepciones||[]).filter(r=>r.aprobaciones>=1&&!r.aproboSurtidor&&r.estado!=="aplicado"&&r.estado!=="rechazado").length:0;
  function marcarSurtido(venta){const s=loadStore();if(!s)return;const nuevoInv=s.inventario.map(item=>{const linea=venta.lineas.find(l=>l.nombre===item.nombre&&!l.clienteMat);if(linea)return{...item,stock:Math.max(0,item.stock-linea.cant)};return item;});saveStore({...s,ventas:s.ventas.map(v=>v.folio===venta.folio?{...v,estado:"surtir",historial:[...v.historial,{estado:"surtir",ts:new Date().toISOString(),quien:usuario.nombre+" (surtió)"}]}:v),inventario:nuevoInv});refresh();setConfirmSurtir(null);}

  return <div style={{minHeight:"100vh",background:G.bg,display:"flex",flexDirection:"column"}}>
  <style>{globalCSS}</style>
  <div style={{background:G.surface,borderBottom:`1px solid ${G.border}`,padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
  <div><div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:"#fb923c"}}>📦 Almacén / Surtido</div><div style={{fontSize:12,color:G.muted}}>{usuario.nombre}</div></div>
  <div style={{display:"flex",gap:10,alignItems:"center"}}>
  <button onClick={()=>setVerAprobaciones(true)} style={{padding:"7px 14px",background:pendAprobaciones>0?"#dc262620":G.surface2,border:"1px solid "+(pendAprobaciones>0?"#dc2626":G.border),borderRadius:9,color:pendAprobaciones>0?"#f87171":"#34d399",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}>
  ✅ Aprobaciones{pendAprobaciones>0&&<span style={{background:"#dc2626",color:"white",borderRadius:10,padding:"1px 8px",fontSize:11,fontWeight:800}}>{pendAprobaciones}</span>}
  </button>
  <div style={{textAlign:"right"}}><div style={{fontSize:18,fontWeight:800,color:"#fb923c"}}>{ventasPend.length} <span style={{fontSize:13,color:G.muted}}>por surtir</span></div><div style={{fontSize:14,fontWeight:700,color:"#facc15"}}>{ventasSurt.length} <span style={{fontSize:12,color:G.muted}}>esperando recibo</span></div></div>
  <Btn v="ghost" size="sm" onClick={onLogout}>Salir</Btn>
  </div>
  </div>
  <div style={{display:"flex",borderBottom:`1px solid ${G.border}`,background:G.surface}}>
  {[{id:"pendientes",label:`📋 Por Surtir (${ventasPend.length})`,color:"#fb923c"},{id:"surtidas",label:`🔄 Esperando Recibo (${ventasSurt.length})`,color:"#facc15"}].map(t=>
  <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"11px 20px",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,color:tab===t.id?t.color:G.muted,borderBottom:tab===t.id?`2px solid ${t.color}`:"2px solid transparent",transition:"all .15s"}}>{t.label}</button>)}
  </div>
  <div style={{flex:1,padding:16,display:"flex",flexDirection:"column",gap:12,overflowY:"auto"}}>
  {tab==="pendientes"&&(ventasPend.length===0 ? <div style={{paddingTop:60,textAlign:"center",color:"#44403c"}}><div style={{fontSize:48,marginBottom:10}}>📭</div><p style={{fontSize:16,fontWeight:700,color:"#fb923c"}}>Sin órdenes por surtir</p></div> : ventasPend.map(v=><Card key={v.folio} className="fu" style={{padding:16}}>
  <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><div>{v.urgente&&<div style={{background:"#dc262620",border:"1px solid #dc2626",borderRadius:6,padding:"2px 10px",marginBottom:4,fontSize:12,fontWeight:800,color:"#f87171",display:"inline-block"}}>🔴 URGENTE</div>}<br style={{display:v.urgente?"block":"none"}}/><span style={{fontFamily:"monospace",color:v.urgente?"#f87171":"#fb923c",fontSize:15,fontWeight:700}}>#{v.folio}</span><span style={{fontWeight:700,fontSize:16,marginLeft:10}}>{v.cliente}</span>{v.proyecto&&<div style={{color:G.muted,fontSize:12}}>📁 {v.proyecto}</div>}</div><Tag color="#38bdf8">✅ Confirmada</Tag></div>
  <div style={{background:G.surface2,borderRadius:8,padding:"8px 12px",marginBottom:12}}>
  <div style={{fontSize:11,fontWeight:700,color:G.muted,marginBottom:6}}>MATERIAL A SURTIR</div>
  {v.lineas.filter(l=>!["Servicios"].includes(l.cat)).map((l,i)=>{const item=inv.find(p=>p.nombre===l.nombre);const ok=!item||item.stock>=l.cant;return <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${G.border}30`,fontSize:13,alignItems:"center"}}><span style={{color:"#d6d3d1"}}>{l.nombre}{l.clienteMat&&<span style={{color:G.muted,fontSize:11}}> ★cliente</span>}</span><div style={{display:"flex",gap:12,alignItems:"center"}}><span style={{color:G.muted}}>Cant: <b style={{color:G.text}}>{l.cant}</b></span>{item&&<span style={{fontSize:11,color:ok?"#34d399":"#f87171"}}>Stock: {item.stock}</span>}</div></div>;})}
  </div>
  <AsignacionEditorInline venta={v}/>
  <button onClick={()=>setConfirmSurtir(v)} style={{width:"100%",padding:14,background:"#fb923c",border:"none",borderRadius:11,fontSize:15,fontWeight:800,color:"#1c1917",cursor:"pointer",fontFamily:"inherit"}}>📦 Ya saqué el material</button>
  </Card>)
  )}
  {tab==="surtidas"&&(ventasSurt.length===0 ? <div style={{paddingTop:60,textAlign:"center",color:"#44403c"}}><div style={{fontSize:48,marginBottom:10}}>✅</div><p style={{fontSize:16,fontWeight:700,color:"#facc15"}}>Nada esperando recibo</p></div> : ventasSurt.map(v=><Card key={v.folio} className="fu" style={{padding:16,borderColor:"#facc1544"}}>
  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><div><span style={{fontFamily:"monospace",color:"#facc15",fontSize:15,fontWeight:700}}>#{v.folio}</span><span style={{fontWeight:700,fontSize:16,marginLeft:10}}>{v.cliente}</span></div><Tag color="#facc15">📦 Material surtido</Tag></div>
  {(()=>{const ag=fmtAging(v.historial[v.historial.length-1].ts);return <div style={{background:ag.color+"15",border:"1px solid "+ag.color+"40",borderRadius:7,padding:"5px 10px",marginBottom:8,display:"flex",alignItems:"center",gap:6,fontSize:12}}><span style={{color:ag.color,fontWeight:700}}>⏱️ Esperando recibo: {ag.txt}</span></div>;})()} 
  <div style={{background:G.surface2,borderRadius:8,padding:"8px 12px",marginBottom:12}}>
  {v.lineas.filter(l=>!["Servicios"].includes(l.cat)).map((l,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${G.border}30`,fontSize:13}}><span style={{color:"#d6d3d1"}}>{l.nombre}</span><span style={{color:G.muted,fontWeight:600}}>{l.cant} uds</span></div>)}
  </div>
  <AsignacionEditorInline venta={v}/>
  <div style={{background:"#facc1510",border:"1px solid #facc1530",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#facc15",textAlign:"center",marginBottom:8}}>
  ⏳ Esperando que el operario acepte el material en piso
  </div>
  <button onClick={()=>setConfirmRev(v)} style={{width:"100%",padding:10,background:"#292524",border:"1px solid #dc262644",borderRadius:9,fontSize:13,fontWeight:700,color:"#f87171",cursor:"pointer",fontFamily:"inherit"}}>↩ Revertir — Regresar a Confirmada</button>
  </Card>)
  )}
  </div>
  {confirmSurtir&&<Confirm msg={`¿Confirmas que ya sacaste el material de la orden #${confirmSurtir.folio}?\nSe descontará del inventario.`} onOk={()=>marcarSurtido(confirmSurtir)} onCancel={()=>setConfirmSurtir(null)}/>
  }{confirmRev&&<Confirm danger msg={"¿Revertir la orden #"+confirmRev.folio+" de "+confirmRev.cliente+"?\nRegresará a Confirmada y se repondrá el inventario automáticamente."} onOk={()=>{ejecutarReversion(confirmRev,usuario);setConfirmRev(null);}} onCancel={()=>setConfirmRev(null)}/>}}
  {verAprobaciones&&<div style={{position:"fixed",inset:0,background:"#000c",zIndex:999,display:"flex",alignItems:"flex-start",justifyContent:"flex-end"}} onClick={()=>setVerAprobaciones(false)}>
  <div style={{background:G.surface,borderLeft:"1px solid "+G.border,height:"100vh",width:"100%",maxWidth:520,overflow:"auto",padding:20}} onClick={e=>e.stopPropagation()}>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
  <span style={{fontFamily:"'DM Serif Display',serif",fontSize:20}}>✅ Aprobaciones</span>
  <button onClick={()=>setVerAprobaciones(false)} style={{background:"none",border:"none",color:G.muted,cursor:"pointer",fontSize:22}}>×</button>
  </div>
  <Aprobaciones store={storeSnap} usuario={usuario} onUpdate={()=>{refresh();}}/>
  </div>
  </div>}
  </div>;
}

function Clientes({store,onUpdate}) {
  const [modal,setModal]=useState(false);const [edit,setEdit]=useState(null);const [busq,setBusq]=useState("");const [detalle,setDet]=useState(null);const [form,setForm]=useState({nombre:"",tel:"",email:"",notas:""});
  function guardar(){if(!form.nombre)return;const c={...form,id:(edit&&edit.id?edit.id:null)||uid()};onUpdate(edit?store.clientes.map(x=>x.id===c.id?c:x):[...store.clientes,c]);setModal(false);}
  const vdc=nombre=>store.ventas.filter(v=>v.cliente===nombre);const totalC=nombre=>vdc(nombre).reduce((s,v)=>s+v.total,0);
  const filtrados=store.clientes.filter(c=>!busq||c.nombre.toLowerCase().includes(busq.toLowerCase()));
  if(detalle){const vc=vdc(detalle.nombre);return <div className="fu" style={{display:"flex",flexDirection:"column",gap:14}}>
  <div style={{display:"flex",gap:10,alignItems:"center"}}><Btn v="ghost" onClick={()=>setDet(null)}>← Volver</Btn><h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:22}}>{detalle.nombre}</h2></div>
  <div style={{display:"grid",gridTemplateColumns:"220px 1fr",gap:14}}>
  <Card style={{padding:14,display:"flex",flexDirection:"column",gap:10}}>
  {detalle.tel&&<div><span style={{fontSize:11,color:G.muted}}>Teléfono</span><div style={{fontWeight:600}}>{detalle.tel}</div></div>}
  {detalle.email&&<div><span style={{fontSize:11,color:G.muted}}>Email</span><div style={{fontWeight:600}}>{detalle.email}</div></div>}
  {detalle.notas&&<div><span style={{fontSize:11,color:G.muted}}>Notas</span><div style={{fontSize:13,color:"#a8a29e"}}>{detalle.notas}</div></div>}
  <Divider/><div style={{fontSize:22,fontWeight:800,color:G.accent}}>{$$(totalC(detalle.nombre))}</div><div style={{fontSize:11,color:G.muted}}>{vc.length} órdenes</div>
  <Btn v="sec" size="sm" onClick={()=>{setForm({nombre:detalle.nombre,tel:detalle.tel,email:detalle.email,notas:detalle.notas});setEdit(detalle);setModal(true);}}>✏️ Editar</Btn>
  </Card>
  <Card><div style={{padding:"10px 14px",borderBottom:`1px solid ${G.border}`,fontSize:11,fontWeight:700,color:G.muted}}>HISTORIAL</div>
  {vc.length===0?<p style={{padding:24,textAlign:"center",color:"#44403c"}}>Sin compras</p>:vc.sort((a,b)=>b.folio-a.folio).map(v=><div key={v.folio} style={{padding:"10px 14px",borderBottom:`1px solid ${G.border}40`,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><span style={{fontFamily:"monospace",color:G.accent,fontSize:12}}>#{v.folio}</span><span style={{color:G.muted,fontSize:12,marginLeft:8}}>{fmtFecha(v.fecha)}</span></div><div style={{display:"flex",gap:10,alignItems:"center"}}><span style={{fontWeight:700}}>{$$(v.total)}</span><Pill estado={v.estado}/></div></div>)}
  </Card>
  </div>
  {modal&&<Modal title="Editar cliente" onClose={()=>setModal(false)}><div style={{display:"flex",flexDirection:"column",gap:12}}><Inp label="Nombre" value={form.nombre} onChange={v=>setForm(f=>({...f,nombre:v}))} placeholder="Nombre"/><Inp label="Teléfono" value={form.tel} onChange={v=>setForm(f=>({...f,tel:v}))} placeholder="33 1234 5678"/><Inp label="Email" value={form.email} onChange={v=>setForm(f=>({...f,email:v}))} type="email"/><div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><Btn v="ghost" onClick={()=>setModal(false)}>Cancelar</Btn><Btn v="pri" onClick={guardar}>Guardar</Btn></div></div></Modal>}
  </div>;}
  return <div className="fu" style={{display:"flex",flexDirection:"column",gap:14}}>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:24}}>Clientes</h2><Btn v="pri" onClick={()=>{setForm({nombre:"",tel:"",email:"",notas:""});setEdit(null);setModal(true);}}>+ Nuevo cliente</Btn></div>
  <Inp value={busq} onChange={setBusq} placeholder="Buscar..."/>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:10}}>
  {filtrados.map(c=><Card key={c.id} style={{padding:14,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.borderColor=G.accent+"60"} onMouseLeave={e=>e.currentTarget.style.borderColor=G.border} onClick={()=>setDet(c)}>
  <div style={{fontWeight:700,fontSize:15,marginBottom:3}}>{c.nombre}</div>{c.tel&&<div style={{fontSize:12,color:G.muted}}>📱 {c.tel}</div>}
  <div style={{marginTop:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{color:G.accent,fontWeight:700}}>{$$(totalC(c.nombre))}</span><span style={{color:"#57534e",fontSize:11}}>{vdc(c.nombre).length} órdenes</span></div>
  </Card>)}
  </div>
  {modal&&<Modal title={edit?"Editar cliente":"Nuevo cliente"} onClose={()=>setModal(false)}><div style={{display:"flex",flexDirection:"column",gap:12}}><Inp label="Nombre *" value={form.nombre} onChange={v=>setForm(f=>({...f,nombre:v}))} placeholder="Nombre completo"/><Inp label="Teléfono" value={form.tel} onChange={v=>setForm(f=>({...f,tel:v}))} placeholder="33 1234 5678"/><Inp label="Email" value={form.email} onChange={v=>setForm(f=>({...f,email:v}))} type="email"/><div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:11,fontWeight:700,color:G.muted,textTransform:"uppercase",letterSpacing:.8}}>Notas</label><textarea value={form.notas} onChange={e=>setForm(f=>({...f,notas:e.target.value}))} style={{...inp,height:64,resize:"vertical"}}/></div><div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><Btn v="ghost" onClick={()=>setModal(false)}>Cancelar</Btn><Btn v="pri" onClick={guardar} disabled={!form.nombre}>{edit?"Guardar":"Dar de alta"}</Btn></div></div></Modal>}
  </div>;
}

function imprimirCierreCaja(fechaSel, store, byMetodo, totalSis, delDia) {
  const fmtN = n => new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"}).format(n||0);
  const fechaLabel = new Date(fechaSel+"T12:00").toLocaleDateString("es-MX",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  const filas = delDia.sort((a,b)=>new Date(a.fecha)-new Date(b.fecha)).map((v,i)=>
    "<tr><td>"+(i+1)+"</td><td style='font-family:monospace'>#"+v.folio+"</td><td>"+v.cliente+"</td><td>"+new Date(v.fecha).toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"})+"</td><td>"+v.metodo+"</td><td style='text-align:right'>"+fmtN(v.total)+"</td></tr>"
  ).join("");
  const metodos = ["Efectivo","Transferencia","Tarjeta","Crédito"].filter(m=>byMetodo[m]>0).map(m=>
    "<tr><td>"+m+"</td><td style='text-align:right;font-weight:700'>"+fmtN(byMetodo[m])+"</td></tr>"
  ).join("");
  const html = "<!DOCTYPE html><html><head><meta charset='UTF-8'/><style>"+
    "body{font-family:Arial,sans-serif;padding:28px;color:#111;}"+
    "h1{font-size:22px;margin-bottom:2px;}"+
    ".sub{color:#666;font-size:12px;margin-bottom:20px;}"+
    "table{width:100%;border-collapse:collapse;margin:12px 0;font-size:13px;}"+
    "th{background:#111;color:#fff;padding:7px 10px;text-align:left;}"+
    "td{padding:7px 10px;border-bottom:1px solid #e5e7eb;}"+
    ".total{font-size:20px;font-weight:900;text-align:right;margin:10px 0;padding:10px;background:#f9fafb;border-radius:6px;}"+
    ".firma-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:40px;margin-top:50px;padding-top:20px;border-top:2px solid #111;}"+
    ".firma-box{text-align:center;}"+
    ".firma-line{height:1px;background:#111;margin-bottom:6px;margin-top:60px;}"+
    ".firma-lbl{font-size:11px;color:#666;}"+
    ".btn{margin-bottom:16px;padding:8px 20px;background:#111;color:#fff;border:none;border-radius:6px;font-size:13px;cursor:pointer;}"+
    "@media print{.btn{display:none;}}</style></head><body>"+
    "<button class='btn' onclick='window.print()'>🖨️ Imprimir</button>"+
    "<h1>BPC — Cierre de Caja</h1>"+
    "<div class='sub'>"+fechaLabel+" · Generado: "+new Date().toLocaleString("es-MX")+"</div>"+
    "<table><thead><tr><th>Método</th><th style='text-align:right'>Monto</th></tr></thead><tbody>"+metodos+"</tbody></table>"+
    "<div class='total'>TOTAL DEL DÍA: "+fmtN(totalSis)+"</div>"+
    "<table><thead><tr><th>#</th><th>Folio</th><th>Cliente</th><th>Hora</th><th>Método</th><th style='text-align:right'>Total</th></tr></thead><tbody>"+filas+"</tbody></table>"+
    "<div class='firma-grid'>"+
    "<div class='firma-box'><div class='firma-line'></div><div class='firma-lbl'>Vendedor 1 — Nombre y firma</div></div>"+
    "<div class='firma-box'><div class='firma-line'></div><div class='firma-lbl'>Vendedor 2 — Nombre y firma</div></div>"+
    "<div class='firma-box'><div class='firma-line'></div><div class='firma-lbl'>Admin — Nombre y firma</div></div>"+
    "</div>"+
    "</body></html>";
  const w=window.open("","_blank");
  if(w){w.document.write(html);w.document.close();}
}

function CierreCaja({store}) {
  const [fechaSel,setFechaSel]=useState(new Date().toISOString().slice(0,10));const [fisico,setFisico]=useState("");
  const ventas=store.ventas;const delDia=ventas.filter(v=>v.pagado&&new Date(v.fecha).toISOString().slice(0,10)===fechaSel);
  const byMetodo=["Efectivo","Transferencia","Tarjeta","Crédito"].reduce((acc,m)=>({...acc,[m]:delDia.filter(v=>v.metodo===m).reduce((s,v)=>s+v.total,0)}),{});
  const totalSis=delDia.reduce((s,v)=>s+v.total,0);const efectivo=byMetodo["Efectivo"]||0;const fisicoN=parseFloat(fisico)||0;const diff=fisicoN-efectivo;
  return <div className="fu" style={{display:"flex",flexDirection:"column",gap:14}}>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
  <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:24}}>Cierre de Caja</h2>
  <Btn v="sec" onClick={()=>imprimirCierreCaja(fechaSel,store,byMetodo,totalSis,delDia)}>🖨️ Imprimir / PDF</Btn>
  </div>
  <div style={{display:"grid",gridTemplateColumns:"230px 1fr",gap:14,alignItems:"start"}}>
  <div style={{display:"flex",flexDirection:"column",gap:10}}>
  <Card style={{padding:14,display:"flex",flexDirection:"column",gap:10}}>
  <Inp label="Fecha" type="date" value={fechaSel} onChange={setFechaSel}/><Divider/>
  <p style={{fontSize:11,fontWeight:700,color:G.muted}}>POR MÉTODO</p>
  {Object.entries(byMetodo).map(([m,v])=><div key={m} style={{display:"flex",justifyContent:"space-between",fontSize:14}}><span style={{color:"#a8a29e"}}>{m}</span><span style={{fontWeight:700,color:v>0?G.text:"#44403c"}}>{$$(v)}</span></div>)}
  <Divider/><div style={{display:"flex",justifyContent:"space-between",fontSize:18,fontWeight:800,color:G.accent}}><span>Total</span><span>{$$(totalSis)}</span></div>
  </Card>
  <Card style={{padding:14,display:"flex",flexDirection:"column",gap:10}}>
  <Inp label="Efectivo físico en caja" type="number" value={fisico} onChange={setFisico} placeholder="0.00"/>
  <div style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span style={{color:G.muted}}>Sistema</span><span>{$$(efectivo)}</span></div>
  <div style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span style={{color:G.muted}}>Físico</span><span>{$$(fisicoN)}</span></div><Divider/>
  <div style={{display:"flex",justifyContent:"space-between",fontSize:17,fontWeight:800,color:fisicoN===0?G.muted:Math.abs(diff)<1?"#34d399":diff>0?"#60a5fa":"#f87171"}}><span>Diferencia</span><span>{diff>0?"+":""}{$$(diff)}</span></div>
  {fisicoN>0&&Math.abs(diff)<1&&<Tag color="#34d399">✓ Caja cuadrada</Tag>}
  {fisicoN>0&&Math.abs(diff)>=1&&<Tag color="#f87171">⚠️ Diferencia de {$$(Math.abs(diff))}</Tag>}
  </Card>
  </div>
  <Card>
  <div style={{padding:"10px 14px",borderBottom:`1px solid ${G.border}`,fontSize:11,fontWeight:700,color:G.muted}}>DETALLE — {new Date(fechaSel+"T12:00").toLocaleDateString("es-MX",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
  {delDia.length===0?<p style={{padding:32,textAlign:"center",color:"#44403c"}}>Sin cobros para esta fecha</p>:
  <><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
  <thead><tr style={{borderBottom:`1px solid ${G.border}`}}>{["Folio","Cliente","Hora","Método","Subtotal","IVA","Total"].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:11,fontWeight:700,color:G.muted}}>{h}</th>)}</tr></thead>
  <tbody>{delDia.sort((a,b)=>new Date(a.fecha)-new Date(b.fecha)).map(v=><tr key={v.folio} style={{borderBottom:`1px solid ${G.border}40`}}>
  <td style={{padding:"8px 12px",fontFamily:"monospace",color:G.accent}}>#{v.folio}</td>
  <td style={{padding:"8px 12px",fontWeight:600}}>{v.cliente}</td>
  <td style={{padding:"8px 12px",color:G.muted}}>{fmtHora(v.fecha)}</td>
  <td style={{padding:"8px 12px"}}><Tag color="#60a5fa">{v.metodo}</Tag></td>
  <td style={{padding:"8px 12px",color:G.muted}}>{$$(v.subtotal)}</td>
  <td style={{padding:"8px 12px",color:G.muted}}>{$$(v.iva)}</td>
  <td style={{padding:"8px 12px",fontWeight:700,color:G.accent}}>{$$(v.total)}</td>
  </tr>)}</tbody>
  </table></div>
  <div style={{padding:"9px 14px",borderTop:`1px solid ${G.border}`,display:"flex",justifyContent:"space-between",fontSize:13,color:G.muted}}><span>{delDia.length} transacciones</span><span style={{fontWeight:800,color:G.accent}}>{$$(totalSis)}</span></div></>}
  </Card>
  </div>
  </div>;
}

function Inventario({store,onUpdate}) {
  const [tab,setTab]=useState("stock");
  const [busq,setBusq]=useState("");const [edit,setEdit]=useState(null);const [delta,setDelta]=useState("");const [tipo,setTipo]=useState("entrada");
  const [repFecha,setRepFecha]=useState(()=>new Date().toISOString().slice(0,7));
  const inv=store.inventario;
  const pronostico=calcularPronostico(store);
  const filtrado=inv.filter(p=>!busq||p.nombre.toLowerCase().includes(busq.toLowerCase()));
  const filtradoPron=pronostico.filter(p=>!busq||p.nombre.toLowerCase().includes(busq.toLowerCase()));
  function aplicar(){const d=parseInt(delta)||0;if(!d)return;onUpdate(inv.map(p=>p.id===edit.id?{...p,stock:Math.max(0,p.stock+(tipo==="entrada"?d:-d))}:p));setEdit(null);setDelta("");}
  const urgente=pronostico.filter(p=>p.diasRestantes!==null&&p.diasRestantes<=7);
  return <div className="fu" style={{display:"flex",flexDirection:"column",gap:14}}>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:24}}>📦 Inventario</h2>
  <div style={{display:"flex",gap:8}}><Tag color="#fb923c">⚠️ {inv.filter(p=>p.stock<=p.minimo).length} en mínimo</Tag>{urgente.length>0&&<Tag color="#f87171">🔴 {urgente.length} con &lt;7 días</Tag>}</div>
  </div>
  <div style={{display:"flex",borderBottom:"1px solid "+G.border,marginBottom:4}}>
  {[{id:"stock",l:"📦 Stock actual"},{id:"pronostico",l:"🔮 Pronóstico"},{id:"movimientos",l:"📋 Movimientos"}].map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"9px 16px",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,color:tab===t.id?G.accent:G.muted,borderBottom:tab===t.id?"2px solid "+G.accent:"2px solid transparent"}}>{t.l}</button>)}
  </div>
  <Inp value={busq} onChange={setBusq} placeholder="Buscar producto..."/>
  {edit&&<Card style={{padding:14,borderColor:G.accent+"60"}}><div style={{fontWeight:700,color:G.accent,marginBottom:10}}>{edit.nombre} — Stock: <b>{edit.stock}</b></div>
  <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end"}}>
  <div style={{display:"flex",gap:6}}>{["entrada","salida"].map(t=><button key={t} onClick={()=>setTipo(t)} style={{padding:"6px 14px",borderRadius:8,border:"none",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit",background:tipo===t?(t==="entrada"?"#059669":"#dc2626"):"#292524",color:tipo===t?"white":"#78716c"}}>{t==="entrada"?"▲ Entrada":"▼ Salida"}</button>)}</div>
  <div style={{width:90}}><Inp label="Cantidad" type="number" value={delta} onChange={setDelta}/></div>
  <Btn v="pri" onClick={aplicar}>Aplicar</Btn><Btn v="ghost" onClick={()=>setEdit(null)}>Cancelar</Btn>
  </div>
  </Card>}
  <Card><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
  <thead><tr style={{borderBottom:`1px solid ${G.border}`}}>{["Producto","Stock","Mínimo","Estado",""].map(h=><th key={h} style={{padding:"9px 13px",textAlign:"left",fontSize:11,fontWeight:700,color:G.muted}}>{h}</th>)}</tr></thead>
  <tbody>{filtrado.map(p=>{const critico=p.stock<=p.minimo;return <tr key={p.id} style={{borderBottom:`1px solid ${G.border}40`,background:critico?"#dc262606":""}}>
  <td style={{padding:"9px 13px",fontWeight:critico?700:400}}>{p.nombre}</td>
  <td style={{padding:"9px 13px",fontSize:17,fontWeight:800,color:p.stock===0?"#f87171":critico?"#fb923c":G.text}}>{p.stock}</td>
  <td style={{padding:"9px 13px",color:G.muted}}>{p.minimo}</td>
  <td style={{padding:"9px 13px"}}><Tag color={p.stock===0?"#f87171":critico?"#fb923c":"#34d399"}>{p.stock===0?"Agotado":critico?"Mínimo":"OK"}</Tag></td>
  <td style={{padding:"9px 13px"}}><Btn v="sec" size="sm" onClick={()=>{setEdit(p);setDelta("");}}>Ajustar</Btn></td>
  </tr>;})}</tbody>
  </table></div></Card>
  {tab==="movimientos"&&(()=>{
  const s=loadStore()||{ventas:[],recepciones:[],inventario:[]};
  const [anio,mes]=repFecha.split("-");
  const inicio=new Date(parseInt(anio),parseInt(mes)-1,1).getTime();
  const fin=new Date(parseInt(anio),parseInt(mes),1).getTime();
  // Salidas: órdenes surtidas en el período
  const salidas=[];
  s.ventas.forEach(v=>{
    const surtido=v.historial.find(h=>h.estado==="surtir");
    if(!surtido) return;
    const ts=new Date(surtido.ts).getTime();
    if(ts<inicio||ts>=fin) return;
    v.lineas.filter(l=>!l.clienteMat&&!["Servicios","PVC"].includes(l.cat)).forEach(l=>{
      salidas.push({tipo:"Salida",fecha:surtido.ts,folio:"#"+v.folio,cliente:v.cliente,producto:l.nombre,cant:-l.cant,quien:surtido.quien||v.vendedor});
    });
  });
  // Entradas: recepciones aplicadas en el período
  const entradas=[];
  (s.recepciones||[]).filter(r=>r.estado==="aplicado").forEach(r=>{
    const ts=new Date(r.fecha).getTime();
    if(ts<inicio||ts>=fin) return;
    r.lineas.forEach(l=>{
      entradas.push({tipo:"Entrada",fecha:r.fecha,folio:"Recibo",cliente:r.proveedor||"—",producto:l.prodNombre,cant:+l.cant,quien:r.creadoPor});
    });
  });
  const movs=[...entradas,...salidas].sort((a,b)=>new Date(b.fecha)-new Date(a.fecha));
  const resumen={};
  movs.forEach(m=>{if(!resumen[m.producto])resumen[m.producto]={entradas:0,salidas:0};if(m.cant>0)resumen[m.producto].entradas+=m.cant;else resumen[m.producto].salidas+=Math.abs(m.cant);});
  function exportMovs(){descargarCSV(movs.map(m=>({Tipo:m.tipo,Fecha:new Date(m.fecha).toLocaleDateString("es-MX"),Folio:m.folio,Cliente:m.cliente,Producto:m.producto,Cantidad:m.cant,Quien:m.quien})),"BPC_Movimientos_"+repFecha+".csv");}
  return <div style={{display:"flex",flexDirection:"column",gap:12}}>
  <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
  <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:11,fontWeight:700,color:G.muted,textTransform:"uppercase",letterSpacing:.8}}>Período</label><input type="month" value={repFecha} onChange={e=>setRepFecha(e.target.value)} style={{...inp,width:160,fontSize:13,colorScheme:"dark"}}/></div>
  <div style={{marginTop:16}}><Btn v="sec" onClick={exportMovs}>⬇️ Exportar CSV</Btn></div>
  <div style={{marginTop:16,display:"flex",gap:12}}>
  <Tag color="#34d399">📥 {entradas.length} entradas</Tag>
  <Tag color="#f87171">📤 {salidas.length} salidas</Tag>
  </div>
  </div>
  <Card><div style={{padding:"10px 14px",borderBottom:"1px solid "+G.border,fontSize:11,fontWeight:700,color:G.muted}}>RESUMEN POR PRODUCTO</div>
  <div style={{overflowX:"auto",maxHeight:200,overflowY:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
  <thead><tr style={{background:G.surface2}}>{["Producto","Entradas","Salidas","Neto"].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:11,fontWeight:700,color:G.muted}}>{h}</th>)}</tr></thead>
  <tbody>{Object.entries(resumen).map(([prod,{entradas:ent,salidas:sal}])=><tr key={prod} style={{borderBottom:"1px solid "+G.border+"30"}}>
  <td style={{padding:"7px 12px",fontWeight:600}}>{prod}</td>
  <td style={{padding:"7px 12px",color:"#34d399",fontWeight:700}}>+{ent}</td>
  <td style={{padding:"7px 12px",color:"#f87171",fontWeight:700}}>-{sal}</td>
  <td style={{padding:"7px 12px",fontWeight:700,color:ent-sal>=0?"#34d399":"#f87171"}}>{ent-sal>=0?"+":""}{ent-sal}</td>
  </tr>)}</tbody></table></div></Card>
  <Card><div style={{padding:"10px 14px",borderBottom:"1px solid "+G.border,fontSize:11,fontWeight:700,color:G.muted}}>DETALLE DE MOVIMIENTOS ({movs.length})</div>
  <div style={{overflowX:"auto",maxHeight:320,overflowY:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
  <thead><tr style={{background:G.surface2}}>{["Tipo","Fecha","Folio","Cliente/Prov.","Producto","Cant.","Quién"].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:11,fontWeight:700,color:G.muted}}>{h}</th>)}</tr></thead>
  <tbody>{movs.length===0?<tr><td colSpan={7} style={{padding:24,textAlign:"center",color:"#44403c"}}>Sin movimientos en este período</td></tr>:movs.map((m,i)=><tr key={i} style={{borderBottom:"1px solid "+G.border+"30",background:m.cant>0?"#34d39908":"#f8717108"}}>
  <td style={{padding:"7px 12px"}}><Tag color={m.cant>0?"#34d399":"#f87171"}>{m.tipo}</Tag></td>
  <td style={{padding:"7px 12px",color:G.muted,fontSize:12}}>{new Date(m.fecha).toLocaleDateString("es-MX")}</td>
  <td style={{padding:"7px 12px",fontFamily:"monospace",color:G.accent}}>{m.folio}</td>
  <td style={{padding:"7px 12px",color:G.muted,fontSize:12}}>{m.cliente}</td>
  <td style={{padding:"7px 12px"}}>{m.producto}</td>
  <td style={{padding:"7px 12px",fontWeight:700,color:m.cant>0?"#34d399":"#f87171"}}>{m.cant>0?"+":""}{m.cant}</td>
  <td style={{padding:"7px 12px",color:G.muted,fontSize:12}}>{m.quien}</td>
  </tr>)}</tbody></table></div></Card>
  </div>;
  })()}
  {tab==="pronostico"&&<Card><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
  <thead><tr style={{background:G.surface2}}>{["Producto","Stock","Consumo 30d","Por día","Días restantes","Acción"].map(h=><th key={h} style={{padding:"9px 13px",textAlign:"left",fontSize:11,fontWeight:700,color:G.muted}}>{h}</th>)}</tr></thead>
  <tbody>{filtradoPron.sort((a,b)=>(a.diasRestantes===null?9999:a.diasRestantes)-(b.diasRestantes===null?9999:b.diasRestantes)).map(p=>{
  const d=p.diasRestantes;
  const sem=d===null?"⚪":d<=0?"💀":d<=7?"🔴":d<=15?"🟡":"🟢";
  const semC=d===null?G.muted:d<=0?"#dc2626":d<=7?"#f87171":d<=15?"#facc15":"#34d399";
  const label=d===null?"Sin consumo":d<=0?"AGOTADO":d+" días";
  return <tr key={p.id} style={{borderBottom:"1px solid "+G.border+"40",background:d!==null&&d<=7?"#dc262608":""}}>
  <td style={{padding:"8px 13px",fontWeight:600}}>{p.nombre}</td>
  <td style={{padding:"8px 13px",fontWeight:700,color:p.stock===0?"#f87171":p.stock<=p.minimo?"#fb923c":G.text}}>{p.stock}</td>
  <td style={{padding:"8px 13px",color:G.muted}}>{p.consumo30>0?p.consumo30+" uds":"—"}</td>
  <td style={{padding:"8px 13px",color:G.muted}}>{p.consumoDiario>0?p.consumoDiario.toFixed(1):"-"}</td>
  <td style={{padding:"8px 13px",fontWeight:700,color:semC}}>{sem} {label}</td>
  <td style={{padding:"8px 13px"}}>{d!==null&&d<=7 ? <Tag color={d<=0?"#dc2626":"#f87171"}>{d<=0?"COMPRAR YA":"COMPRAR PRONTO"}</Tag> : <span style={{color:"#44403c",fontSize:11}}>—</span>}</td>
  </tr>;})}
  </tbody></table></div></Card>}
  </div>;
}

function MiniBar({value,max,color}){
  const pct=max>0?Math.min(100,(value/max)*100):0;
  return <div style={{height:6,background:G.surface2,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:pct+"%",background:color,borderRadius:3,transition:"width .5s"}}/></div>;
}

function Dashboard({store,usuario}) {
  const [periodo,setPeriodo]=useState("semana");
  const ventas=store.ventas;
  const hoy=ventas.filter(v=>new Date(v.fecha).toDateString()===hoyStr());
  const ahora=Date.now();
  const dias={semana:7,mes:30,trimestre:90}[periodo]||7;
  const desde=ahora-dias*24*60*60*1000;
  const vPer=ventas.filter(v=>v.pagado&&new Date(v.fecha).getTime()>desde);
  const totalPer=vPer.reduce((s,v)=>s+v.total,0);
  const COLS=["#f59e0b","#38bdf8","#a78bfa","#34d399","#f87171","#fb923c"];
  const kpis=[
    {l:"Ventas hoy",v:$$(hoy.filter(v=>v.pagado).reduce((s,v)=>s+v.total,0)),i:"💰",c:"#f59e0b"},
    {l:"Órdenes hoy",v:hoy.length,i:"📋",c:"#38bdf8"},
    {l:"En producción",v:ventas.filter(v=>["surtir","corte","enchape"].includes(v.estado)).length,i:"⚙️",c:"#a78bfa"},
    {l:"Listas p/entregar",v:ventas.filter(v=>v.estado==="listo").length,i:"🎯",c:"#34d399"},
    {l:"Sin cobrar",v:$$(ventas.filter(v=>!v.pagado&&v.estado!=="entregada").reduce((s,v)=>s+v.total,0)),i:"⏳",c:"#f87171"},
    {l:"Stock crítico",v:store.inventario.filter(p=>p.stock<=p.minimo).length,i:"⚠️",c:"#fb923c"}
  ];
  const ventasDia=[];
  for(let i=dias-1;i>=0;i--){
    const d=new Date(ahora-i*24*60*60*1000);
    const lbl=d.toLocaleDateString("es-MX",{day:"2-digit",month:"short"});
    const tot=ventas.filter(v=>v.pagado&&new Date(v.fecha).toDateString()===d.toDateString()).reduce((s,v)=>s+v.total,0);
    ventasDia.push({lbl,tot});
  }
  const maxDia=Math.max(...ventasDia.map(x=>x.tot),1);
  const porVend={};vPer.forEach(v=>{porVend[v.vendedor]=(porVend[v.vendedor]||0)+v.total;});
  const vends=Object.entries(porVend).sort((a,b)=>b[1]-a[1]);
  const maxVend=Math.max(...vends.map(x=>x[1]),1);
  const porCat={};vPer.forEach(v=>v.lineas.forEach(l=>{if(l.cat&&l.cat!=="Servicios")porCat[l.cat]=(porCat[l.cat]||0)+l.total;}));
  const cats=Object.entries(porCat).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const maxCat=Math.max(...cats.map(x=>x[1]),1);
  const porProd={};vPer.forEach(v=>v.lineas.forEach(l=>{if(l.cat!=="Servicios")porProd[l.nombre]=(porProd[l.nombre]||0)+l.cant;}));
  const prods=Object.entries(porProd).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const maxProd=Math.max(...prods.map(x=>x[1]),1);

  return <div className="fu" style={{display:"flex",flexDirection:"column",gap:18}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div><h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:28}}>Buen día, {usuario.nombre} 👋</h2><p style={{color:G.muted,fontSize:13}}>{new Date().toLocaleDateString("es-MX",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p></div>
      <div style={{display:"flex",gap:4,background:G.surface2,borderRadius:9,padding:3}}>
        {[["semana","7D"],["mes","30D"],["trimestre","90D"]].map(([k,l])=><button key={k} onClick={()=>setPeriodo(k)} style={{padding:"5px 14px",borderRadius:7,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit",background:periodo===k?G.accent:"transparent",color:periodo===k?"#1c1917":G.muted}}>{l}</button>)}
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>{kpis.map(k=><Card key={k.l} style={{padding:14}}><div style={{fontSize:20,marginBottom:3}}>{k.i}</div><div style={{fontSize:20,fontWeight:800,color:k.c}}>{k.v}</div><div style={{fontSize:11,color:G.muted}}>{k.l}</div></Card>)}</div>
    <Card style={{padding:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <p style={{fontSize:13,fontWeight:700,color:G.muted}}>📈 VENTAS POR DÍA</p>
        <span style={{fontWeight:800,color:G.accent}}>{$$(totalPer)} en {dias}d</span>
      </div>
      <div style={{display:"flex",alignItems:"flex-end",gap:2,height:80,paddingBottom:4}}>
        {ventasDia.map((d,i)=>{const h=Math.max(3,(d.tot/maxDia)*76);return <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
          <div title={$$(d.tot)+" — "+d.lbl} style={{width:"100%",height:h,background:d.tot>0?G.accent:G.surface2,borderRadius:"3px 3px 0 0",cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.opacity=".7"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}/>
          {dias<=14&&<span style={{fontSize:8,color:G.muted}}>{d.lbl.split(" ")[0]}</span>}
        </div>;})}
      </div>
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <Card style={{padding:14}}>
        <p style={{fontSize:11,fontWeight:700,color:G.muted,marginBottom:12,letterSpacing:.8}}>👔 POR VENDEDOR</p>
        {vends.length===0?<p style={{color:"#44403c",fontSize:13}}>Sin ventas</p>:vends.map(([nom,tot],i)=><div key={nom} style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}><span style={{color:"#d6d3d1",fontWeight:600}}>{nom}</span><span style={{fontWeight:700,color:COLS[i%6]}}>{$$(tot)}</span></div>
          <MiniBar value={tot} max={maxVend} color={COLS[i%6]}/>
        </div>)}
      </Card>
      <Card style={{padding:14}}>
        <p style={{fontSize:11,fontWeight:700,color:G.muted,marginBottom:12,letterSpacing:.8}}>📦 POR CATEGORÍA</p>
        {cats.length===0?<p style={{color:"#44403c",fontSize:13}}>Sin ventas</p>:cats.map(([cat,tot],i)=><div key={cat} style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}><span style={{color:"#d6d3d1",fontWeight:600}}>{cat}</span><span style={{fontWeight:700,color:COLS[i%6]}}>{$$(tot)}</span></div>
          <MiniBar value={tot} max={maxCat} color={COLS[i%6]}/>
        </div>)}
      </Card>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <Card style={{padding:14}}>
        <p style={{fontSize:11,fontWeight:700,color:G.muted,marginBottom:12,letterSpacing:.8}}>🏆 TOP PRODUCTOS</p>
        {prods.length===0?<p style={{color:"#44403c",fontSize:13}}>Sin ventas</p>:prods.map(([prod,cant],i)=><div key={prod} style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}><span style={{color:"#d6d3d1",fontWeight:600,fontSize:11}}>{prod.length>28?prod.slice(0,26)+"…":prod}</span><span style={{fontWeight:700,color:COLS[i%6]}}>{cant} uds</span></div>
          <MiniBar value={cant} max={maxProd} color={COLS[i%6]}/>
        </div>)}
      </Card>
      <Card style={{padding:14}}>
        <p style={{fontSize:11,fontWeight:700,color:G.muted,marginBottom:12,letterSpacing:.8}}>🔄 FLUJO ACTUAL</p>
        {FLUJO.map(f=>{const n=ventas.filter(v=>v.estado===f.id).length;const mx=Math.max(...FLUJO.map(ff=>ventas.filter(v=>v.estado===ff.id).length),1);return <div key={f.id} style={{marginBottom:9}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}><span style={{color:"#a8a29e"}}>{f.icon} {f.label}</span><span style={{fontWeight:700,color:f.color}}>{n}</span></div>
          <MiniBar value={n} max={mx} color={f.color}/>
        </div>;})}
      </Card>
    </div>
  </div>;
}



function Configuracion({store,onUpdate}) {
  const [form,setForm]=useState({...store.config});const [saved,setSaved]=useState(false);const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  function guardar(){onUpdate(form);setSaved(true);setTimeout(()=>setSaved(false),2500);}
  return <div className="fu" style={{display:"flex",flexDirection:"column",gap:14}}>
  <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:24}}>Configuración del Negocio</h2>
  <p style={{color:G.muted,fontSize:13}}>Estos datos aparecen en todos los PDFs de cotización.</p>
  <Card style={{padding:18,display:"flex",flexDirection:"column",gap:12,maxWidth:600}}>
  <Inp label="Razón Social *" value={form.razonSocial||""} onChange={v=>set("razonSocial",v)} placeholder="BPC Maderas y Tableros S.A. de C.V."/>
  <Inp label="RFC *" value={form.rfc||""} onChange={v=>set("rfc",v)} placeholder="BPC000000XXX"/>
  <Inp label="Dirección fiscal" value={form.direccion||""} onChange={v=>set("direccion",v)} placeholder="Calle, Col., Ciudad, Estado, CP"/>
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><Inp label="Teléfono" value={form.telefono||""} onChange={v=>set("telefono",v)} placeholder="33 1234 5678"/><Inp label="Email" value={form.email||""} onChange={v=>set("email",v)} placeholder="ventas@empresa.mx"/></div>
  <Inp label="Sitio web (opcional)" value={form.web||""} onChange={v=>set("web",v)} placeholder="www.empresa.mx"/>
  <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:11,fontWeight:700,color:G.muted,textTransform:"uppercase",letterSpacing:.8}}>Nota al pie del PDF</label><textarea value={form.notas||""} onChange={e=>set("notas",e.target.value)} placeholder="Precios sujetos a cambio sin previo aviso." style={{background:G.surface2,border:`1px solid ${G.border}`,color:G.text,borderRadius:8,padding:"8px 12px",fontSize:13,resize:"vertical",height:72,fontFamily:"inherit"}}/></div>
  <div style={{display:"flex",gap:10,alignItems:"center",marginTop:4}}><Btn v="pri" onClick={guardar}>💾 Guardar configuración</Btn>{saved&&<span style={{color:"#34d399",fontSize:13,fontWeight:600}}>✓ Guardado</span>}</div>
  </Card>
  <div><p style={{fontSize:11,fontWeight:700,color:G.muted,letterSpacing:.8,marginBottom:8}}>VISTA PREVIA EN PDF</p>
  <div style={{background:"white",borderRadius:10,padding:20,maxWidth:500,color:"#1c1917",border:`1px solid ${G.border}`}}>
  <div style={{fontSize:22,fontWeight:900,color:"#f59e0b",fontFamily:"Georgia,serif",marginBottom:4}}>{form.razonSocial||"BPC"}</div>
  {form.rfc&&<div style={{fontSize:11,color:"#78716c"}}>RFC: {form.rfc}</div>}
  {form.direccion&&<div style={{fontSize:11,color:"#78716c"}}>{form.direccion}</div>}
  <div style={{fontSize:11,color:"#78716c"}}>{[form.telefono&&"Tel: "+form.telefono,form.email,form.web].filter(Boolean).join(" · ")}</div>
  </div>
  </div>
  </div>;
}


// ── Helpers CSV/Backup ───────────────────────────────────────────────

// ── Helpers Excel/CSV para carga masiva ──────────────────────────────
function descargarPlantillaExcel(filas, nombre) {
  const cols = Object.keys(filas[0]);
  const bom = "\uFEFF";
  const csv = bom + [cols.join(","), ...filas.map(f=>cols.map(col=>{
    const v = String(f[col]==null?"":f[col]);
    return v.includes(",")||v.includes('"')||v.includes("\n") ? '"'+v.replace(/"/g,'""')+'"' : v;
  }).join(","))].join("\n");
  const a = document.createElement("a");
  a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  a.download = nombre;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

function parsearCSV(texto) {
  const lineas = texto.trim().split("\n").map(l=>l.replace(/\r/g,""));
  if(lineas.length<2) return [];
  const cols = lineas[0].split(",").map(c=>c.replace(/^"|"$/g,"").trim());
  return lineas.slice(1).map(linea=>{
    const vals=[]; let cur="", inQ=false;
    for(let i=0;i<linea.length;i++){
      const ch=linea[i];
      if(ch==='"'){inQ=!inQ;}
      else if(ch===","&&!inQ){vals.push(cur.trim());cur="";}
      else{cur+=ch;}
    }
    vals.push(cur.trim());
    const obj={};
    cols.forEach((c,i)=>obj[c]=vals[i]||"");
    return obj;
  });
}

function leerArchivoCSV(file, onDone) {
  const r = new FileReader();
  r.onload = e => onDone(parsearCSV(e.target.result));
  r.readAsText(file, "UTF-8");
}

function descargarCSV(filas, nombre) {
  if(!filas.length){alert("Sin datos para exportar.");return;}
  const cols=Object.keys(filas[0]);
  const bom="﻿";
  const csv=bom+[cols.join(","),...filas.map(f=>cols.map(col=>{
    const v=String(f[col]==null?"":f[col]);
    return v.includes(",")||v.includes('"')||v.includes("\n")?'"'+v.replace(/"/g,'""')+'"':v;
  }).join(","))].join("\n");
  const a=document.createElement("a");
  a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);
  a.download=nombre;document.body.appendChild(a);a.click();document.body.removeChild(a);
}

const ROLES=[
  {rol:"admin",estacion:null,label:"Admin"},
  {rol:"vendedor",estacion:null,label:"Vendedor"},
  {rol:"almacen",estacion:"surtir",label:"Almacén/Surtido"},
  {rol:"corte",estacion:"corte",label:"Cortador"},
  {rol:"enchape",estacion:"enchape",label:"Enchapador"},
  {rol:"entrega",estacion:"entrega",label:"Repartidor"},
  {rol:"inventario",estacion:null,label:"Encargado de Inventario"},
];
const ESTACIONES_POR_ROL={almacen:["surtir","confirmada"],corte:["corte"],enchape:["enchape"]};

function loadUsuarios(){
  const s=loadStore();
  if(s&&s.usuarios) return s.usuarios;
  return USUARIOS.map(u=>({...u}));
}
function saveUsuarios(usuarios){
  const s=loadStore();if(!s)return;
  saveStore({...s,usuarios});
}



// ── DetalleOrdenConsulta: vista de solo lectura para vendedor ─────────
function DetalleOrdenConsulta({venta, onClose}) {
  const s = loadStore();
  const config = s ? s.config : {};
  const fi = flujoInfo(venta.estado);
  return <div className="fu" style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div>
        <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:22}}>Orden <span style={{color:G.accent}}>#{venta.folio}</span></h2>
        <span style={{color:G.muted,fontSize:12}}>{fmtFecha(venta.fecha)} · {venta.vendedor}</span>
      </div>
      <div style={{display:"flex",gap:8}}>
        <Btn v="sec" onClick={()=>generarPDF(venta,config)}>🖨️ Cotización</Btn>
        <HojaProduccionBtn venta={venta}/>
        <Btn v="ghost" onClick={onClose}>← Volver</Btn>
      </div>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"220px 1fr",gap:14}}>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <Card style={{padding:14,display:"flex",flexDirection:"column",gap:10}}>
          {[["Cliente",venta.cliente],["Método de pago",venta.metodo],["Proyecto",venta.proyecto],["Vendedor",venta.vendedor]].map(([l,v])=>v&&<div key={l}><span style={{fontSize:11,color:G.muted}}>{l}</span><div style={{fontWeight:600,fontSize:14}}>{v}</div></div>)}
          <Divider/>
          <div><span style={{fontSize:11,color:G.muted}}>Estado</span><div style={{marginTop:4}}><Pill estado={venta.estado}/></div></div>
          <div><span style={{fontSize:11,color:G.muted}}>Pago</span><div style={{marginTop:4}}><Tag color={venta.pagado?"#34d399":"#f87171"}>{venta.pagado?"✓ Pagado":"Pendiente"}</Tag></div></div>
          {venta.urgente&&<Tag color="#f87171">🔴 URGENTE</Tag>}
          {venta.fechaEntrega&&<div><span style={{fontSize:11,color:G.muted}}>📅 Entrega comprometida</span><div style={{fontWeight:700,fontSize:13,color:"#fb923c",marginTop:2}}>{new Date(venta.fechaEntrega).toLocaleDateString("es-MX",{weekday:"short",day:"2-digit",month:"short"})} {new Date(venta.fechaEntrega).toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"})}hrs</div></div>}
          {(venta.asigCorte||venta.asigEnchape)&&<div style={{background:"#facc1510",border:"1px solid #facc1530",borderRadius:7,padding:"8px 10px"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#facc15",marginBottom:4}}>⚡ Asignación</div>
            {venta.asigCorte&&<div style={{fontSize:12}}>✂️ {venta.asigCorte}</div>}
            {venta.asigEnchape&&<div style={{fontSize:12}}>🪵 {venta.asigEnchape}</div>}
          </div>}
          {venta.firma&&<div style={{background:"#f0fdf420",border:"1px solid #86efac44",borderRadius:8,padding:10}}>
            <div style={{fontSize:11,fontWeight:700,color:"#34d399",marginBottom:6}}>✅ FIRMA DE RECIBIDO</div>
            <img src={venta.firma} style={{maxWidth:"100%",maxHeight:80,borderRadius:4}}/>
            <div style={{fontSize:11,color:"#34d399",marginTop:4}}>{fmtFecha(venta.firmaTs)} {fmtHora(venta.firmaTs)}hrs</div>
          </div>}
        </Card>
        <Card style={{padding:14}}>
          <p style={{fontSize:11,fontWeight:700,color:G.muted,marginBottom:10}}>HISTORIAL</p>
          {venta.historial.map((h,i)=>{const f=flujoInfo(h.estado);return <div key={i} style={{display:"flex",gap:8,marginBottom:8}}>
            <span style={{fontSize:14}}>{f.icon}</span>
            <div><div style={{fontSize:12,fontWeight:700,color:f.color}}>{f.label}</div>
            <div style={{fontSize:11,color:G.muted}}>{fmtFecha(h.ts)} {fmtHora(h.ts)}</div>
            {h.quien&&<div style={{fontSize:11,color:"#57534e"}}>{h.quien}</div>}
            </div>
          </div>;})}
        </Card>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <Card><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{borderBottom:"1px solid "+G.border}}>{["Producto","Cant.","P/Unit","Total"].map(h=><th key={h} style={{padding:"9px 13px",textAlign:"left",fontSize:11,fontWeight:700,color:G.muted}}>{h}</th>)}</tr></thead>
          <tbody>{venta.lineas.map((l,i)=><tr key={i} style={{borderBottom:"1px solid "+G.border+"50"}}>
            <td style={{padding:"8px 13px"}}>{l.nombre}{l.clienteMat&&<span style={{color:G.muted,fontSize:11,marginLeft:6}}>(cliente mat.)</span>}</td>
            <td style={{padding:"8px 13px",color:G.muted}}>{l.cant}</td>
            <td style={{padding:"8px 13px",color:G.muted}}>{$$(l.precio)}</td>
            <td style={{padding:"8px 13px",fontWeight:700,color:"#fbbf24"}}>{$$(l.total)}</td>
          </tr>)}</tbody>
        </table></Card>
        <Card style={{padding:14}}>
          {[["Subtotal",venta.subtotal],["IVA 16%",venta.iva]].map(([l,v])=><div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:13,color:G.muted,marginBottom:6}}><span>{l}</span><span>{$$(v)}</span></div>)}
          <Divider/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:20,fontWeight:800,color:G.accent}}><span>Total</span><span>{$$(venta.total)}</span></div>
          {(!usuario||usuario.rol==="admin")&&(()=>{
            const s=loadStore();
            const precios=s?s.preciosCompra||{}:{};
            const costoTotal=venta.lineas.reduce((sum,l)=>{
              const prod=CATALOGO.find(p=>p.nombre===l.nombre);
              const pc=prod?precios[prod.id]||0:0;
              return sum+(pc*l.cant);
            },0);
            if(!costoTotal) return null;
            const margen=venta.subtotal-costoTotal;
            const pct=venta.subtotal>0?Math.round((margen/venta.subtotal)*100):0;
            return <div style={{marginTop:10,padding:"10px 12px",background:"#05966915",border:"1px solid #05966930",borderRadius:8}}>
              <div style={{fontSize:11,fontWeight:700,color:G.muted,marginBottom:6,letterSpacing:.8}}>💰 MARGEN (solo Admin)</div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}><span style={{color:G.muted}}>Costo materiales</span><span style={{color:"#f87171"}}>{$$(costoTotal)}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:15,fontWeight:800}}><span>Margen bruto</span><span style={{color:margen>=0?"#34d399":"#f87171"}}>{$$(margen)} ({pct}%)</span></div>
            </div>;
          })()}
        </Card>
      </div>
    </div>
  </div>;
}

// ── ClientesVendedor: clientes con historial completo ─────────────────
function ClientesVendedor({store, usuario}) {
  const [busq,setBusq]=useState("");
  const [detalle,setDet]=useState(null);
  const [ordenVer,setOrdenVer]=useState(null);
  const [filtroEst,setFiltroEst]=useState("");

  if(ordenVer) return <DetalleOrdenConsulta venta={ordenVer} onClose={()=>setOrdenVer(null)}/>;

  const vdc = nombre => store.ventas.filter(v=>v.cliente===nombre);
  const totalC = nombre => vdc(nombre).reduce((s,v)=>s+v.total,0);
  const filtrados = store.clientes.filter(c=>!busq||c.nombre.toLowerCase().includes(busq.toLowerCase()));

  if(detalle) {
    const vc = vdc(detalle.nombre).sort((a,b)=>b.folio-a.folio);
    const filtVc = vc.filter(v=>!filtroEst||v.estado===filtroEst);
    const totalPagado = vc.filter(v=>v.pagado).reduce((s,v)=>s+v.total,0);
    const totalPend = vc.filter(v=>!v.pagado&&v.estado!=="cotizacion").reduce((s,v)=>s+v.total,0);
    return <div className="fu" style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",gap:10,alignItems:"center"}}>
        <Btn v="ghost" onClick={()=>{setDet(null);setFiltroEst("");}}>← Clientes</Btn>
        <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:22}}>{detalle.nombre}</h2>
        {detalle.tel&&<span style={{color:G.muted,fontSize:13}}>📱 {detalle.tel}</span>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        {[{l:"Total histórico",v:$$(totalC(detalle.nombre)),c:G.accent,i:"💰"},{l:"Pagado",v:$$(totalPagado),c:"#34d399",i:"✓"},{l:"Por cobrar",v:$$(totalPend),c:totalPend>0?"#f87171":G.muted,i:"⏳"}].map(k=>
          <Card key={k.l} style={{padding:12}}><div style={{fontSize:18,marginBottom:2}}>{k.i}</div><div style={{fontSize:18,fontWeight:800,color:k.c}}>{k.v}</div><div style={{fontSize:11,color:G.muted}}>{k.l}</div></Card>
        )}
      </div>
      <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
        <span style={{fontSize:13,color:G.muted}}>{vc.length} órdenes en total</span>
        <div style={{width:180}}><Sel value={filtroEst} onChange={setFiltroEst} options={FLUJO.map(f=>({v:f.id,l:f.icon+" "+f.label}))}/></div>
      </div>
      <Card>
        {filtVc.length===0
          ?<div style={{padding:32,textAlign:"center",color:"#44403c"}}>Sin órdenes{filtroEst?" en este estado":""}</div> : filtVc.map(v=>{const fi=flujoInfo(v.estado);return <div key={v.folio} style={{padding:"12px 16px",borderBottom:"1px solid "+G.border+"40",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}} onClick={()=>setOrdenVer(v)} onMouseEnter={e=>e.currentTarget.style.background=G.surface2} onMouseLeave={e=>e.currentTarget.style.background=""}>
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              <span style={{fontFamily:"monospace",color:v.urgente?"#f87171":G.accent,fontWeight:700,fontSize:13}}>#{v.folio}</span>
              <span style={{color:G.muted,fontSize:12}}>{fmtFecha(v.fecha)}</span>
              {v.urgente&&<Tag color="#f87171">🔴</Tag>}
            </div>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <span style={{fontWeight:700}}>{$$(v.total)}</span>
              <Tag color={v.pagado?"#34d399":"#f87171"}>{v.pagado?"✓ Pagado":"Pendiente"}</Tag>
              <Pill estado={v.estado}/>
              {v.firma&&<Tag color="#34d399">✍️ Firmada</Tag>}
              <span style={{color:G.muted,fontSize:12}}>Ver →</span>
            </div>
          </div>;})}
      </Card>
    </div>;
  }

  return <div className="fu" style={{display:"flex",flexDirection:"column",gap:14}}>
    <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:24}}>Clientes</h2>
    <Inp value={busq} onChange={setBusq} placeholder="Buscar cliente..."/>
    {filtrados.length===0
      ?<Card style={{padding:32,textAlign:"center",color:"#44403c"}}>Sin clientes</Card> : <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:10}}>
        {filtrados.map(c=><Card key={c.id} style={{padding:14,cursor:"pointer"}} onClick={()=>setDet(c)} onMouseEnter={e=>e.currentTarget.style.borderColor=G.accent+"60"} onMouseLeave={e=>e.currentTarget.style.borderColor=G.border}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:3}}>{c.nombre}</div>
          {c.tel&&<div style={{fontSize:12,color:G.muted}}>📱 {c.tel}</div>}
          {c.email&&<div style={{fontSize:12,color:G.muted}}>✉️ {c.email}</div>}
          <div style={{marginTop:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{color:G.accent,fontWeight:700}}>{$$(totalC(c.nombre))}</span>
            <span style={{color:"#57534e",fontSize:11}}>{vdc(c.nombre).length} órdenes</span>
          </div>
        </Card>)}
      </div>}
  </div>;
}

// ── BuscadorOrdenes: buscador para vendedor ───────────────────────────
function BuscadorOrdenes({store, usuario}) {
  const [query,setQuery]=useState("");
  const [filtroEst,setFiltroEst]=useState("");
  const [filtroPago,setFiltroPago]=useState("");
  const [ordenVer,setOrdenVer]=useState(null);

  if(ordenVer) return <DetalleOrdenConsulta venta={ordenVer} onClose={()=>setOrdenVer(null)}/>;

  const esAdmin = usuario.rol==="admin";
  const base = esAdmin ? store.ventas : store.ventas.filter(v=>v.vendedor===usuario.nombre);

  const resultados = base.filter(v=>{
    const q=query.toLowerCase();
    const matchQ=!q||String(v.folio).includes(q)||v.cliente.toLowerCase().includes(q)||(v.proyecto&&v.proyecto.toLowerCase().includes(q));
    const matchEst=!filtroEst||v.estado===filtroEst;
    const matchPago=!filtroPago||(filtroPago==="pagado"?v.pagado:!v.pagado);
    return matchQ&&matchEst&&matchPago;
  }).sort((a,b)=>b.folio-a.folio);

  return <div className="fu" style={{display:"flex",flexDirection:"column",gap:14}}>
    <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:24}}>🔍 Buscar Órdenes</h2>
    <Card style={{padding:14}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 180px 160px",gap:10,alignItems:"end"}}>
        <Inp value={query} onChange={setQuery} placeholder="Buscar por folio, cliente o proyecto..."/>
        <Sel value={filtroEst} onChange={setFiltroEst} options={FLUJO.map(f=>({v:f.id,l:f.icon+" "+f.label}))}/>
        <Sel value={filtroPago} onChange={setFiltroPago} options={[{v:"pagado",l:"✓ Pagadas"},{v:"pendiente",l:"⏳ Pendientes"}]}/>
      </div>
      {(query||filtroEst||filtroPago)&&<div style={{marginTop:8,fontSize:12,color:G.muted}}>{resultados.length} resultado{resultados.length!==1?"s":""}</div>}
    </Card>

    {!query&&!filtroEst&&!filtroPago
      ?<div style={{padding:48,textAlign:"center",color:"#44403c"}}><div style={{fontSize:40,marginBottom:10}}>🔍</div><p>Escribe un folio, nombre de cliente o proyecto para buscar</p></div> : resultados.length===0 ? <Card style={{padding:32,textAlign:"center",color:"#44403c"}}>Sin resultados</Card> : <Card><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
        <thead><tr style={{borderBottom:"1px solid "+G.border}}>{["Folio","Cliente","Fecha","Total","Pago","Estado",""].map(h=><th key={h} style={{padding:"9px 13px",textAlign:"left",fontSize:11,fontWeight:700,color:G.muted}}>{h}</th>)}</tr></thead>
        <tbody>{resultados.map(v=><tr key={v.folio} style={{borderBottom:"1px solid "+G.border+"40",cursor:"pointer"}} onClick={()=>setOrdenVer(v)} onMouseEnter={e=>e.currentTarget.style.background=G.surface2+"80"} onMouseLeave={e=>e.currentTarget.style.background=""}>
          <td style={{padding:"9px 13px",fontFamily:"monospace",color:v.urgente?"#f87171":G.accent,fontWeight:700}}>
            #{v.folio}{v.urgente&&<span style={{marginLeft:4,fontSize:10,color:"#f87171"}}>🔴</span>}
          </td>
          <td style={{padding:"9px 13px",fontWeight:600}}>{v.cliente}{v.proyecto&&<span style={{color:G.muted,fontSize:11,marginLeft:6}}>· {v.proyecto}</span>}</td>
          <td style={{padding:"9px 13px",color:G.muted}}>{fmtFecha(v.fecha)}</td>
          <td style={{padding:"9px 13px",fontWeight:700}}>{$$(v.total)}</td>
          <td style={{padding:"9px 13px"}}><Tag color={v.pagado?"#34d399":"#f87171"}>{v.pagado?"✓ Pagado":"Pendiente"}</Tag></td>
          <td style={{padding:"9px 13px"}}><Pill estado={v.estado}/></td>
          <td style={{padding:"9px 13px"}}>
            <div style={{display:"flex",gap:6}}>
              {v.firma&&<Tag color="#34d399">✍️</Tag>}
              <span style={{color:G.muted,fontSize:12}}>Ver →</span>
            </div>
          </td>
        </tr>)}</tbody>
      </table></div></Card>}
  </div>;
}


// ── Recepciones de inventario ─────────────────────────────────────────
function Recepciones({store, usuario, onUpdate}) {
  const [tab, setTab] = useState("nueva");
  const [lineas, setLineas] = useState([{id:uid(),prodId:"",prodNombre:"",cant:1}]);
  const [proveedor, setProveedor] = useState("");
  const [notas, setNotas] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [saved, setSaved] = useState("");
  const [buscando, setBuscando] = useState(null);
  const [query, setQuery] = useState("");

  const esAdmin = usuario.rol==="admin";
  const esVendedor = usuario.rol==="vendedor";
  const esAlmacen = usuario.rol==="almacen"||usuario.rol==="inventario";

  const recepciones = store.recepciones||[];
  const pendientes = recepciones.filter(r=>r.estado!=="aplicado");
  const misPendientes = recepciones.filter(r=>{
    if(esVendedor) return r.estado==="esperando_vendedor"&&!r.aproboVendedor;
    if(esAlmacen) return r.aprobaciones>=1&&r.estado==="esperando_surtidor"&&!r.aproboSurtidor;
    return false;
  });

  function addLinea(){setLineas(ls=>[...ls,{id:uid(),prodId:"",prodNombre:"",cant:1}]);}
  function setL(id,campo,val){setLineas(ls=>ls.map(l=>l.id===id?{...l,[campo]:val}:l));}
  function selProd(lid,prod){setLineas(ls=>ls.map(l=>l.id===lid?{...l,prodId:prod.id,prodNombre:prod.nombre}:l));setBuscando(null);setQuery("");}

  function crearRecibo(){
    const lineasValidas = lineas.filter(l=>l.prodId&&l.cant>0);
    if(!lineasValidas.length){alert("Agrega al menos un producto.");return;}
    const recibo = {
      id:uid(), fecha:new Date().toISOString(), creadoPor:usuario.nombre,
      proveedor:proveedor||null, notas:notas||null,
      lineas:lineasValidas, estado:"esperando_vendedor",
      aproboVendedor:null, aproboVendedorTs:null,
      aproboSurtidor:null, aproboSurtidorTs:null, aprobaciones:0
    };
    const s=loadStore();if(!s)return;
    const recepsActuales=s.recepciones||[];
    saveStore({...s, recepciones:[...recepsActuales,recibo]});
    onUpdate();
    setLineas([{id:uid(),prodId:"",prodNombre:"",cant:1}]);
    setProveedor("");setNotas("");
    setSaved("ok");setTimeout(()=>setSaved(""),2500);
    setTab("historial");
  }

  function aprobar(recibo){
    const s=loadStore();if(!s)return;
    if(!s.recepciones) s.recepciones=[];
    const ts=new Date().toISOString();
    const updated=s.recepciones.map(r=>{
      if(r.id!==recibo.id) return r;
      if(esVendedor&&!r.aproboVendedor){
        const aprobaciones=r.aprobaciones+1;
        const listo=aprobaciones>=2;
        return{...r,aproboVendedor:usuario.nombre,aproboVendedorTs:ts,aprobaciones,
          estado:listo?"listo_aplicar":"esperando_surtidor"};
      }
      if(esAlmacen&&!r.aproboSurtidor){
        const aprobaciones=r.aprobaciones+1;
        const listo=aprobaciones>=2;
        return{...r,aproboSurtidor:usuario.nombre,aproboSurtidorTs:ts,aprobaciones,
          estado:listo?"listo_aplicar":"esperando_vendedor"};
      }
      return r;
    });
    // Si ya tiene 2 aprobaciones, aplicar al inventario
    const rec=updated.find(r=>r.id===recibo.id);
    let nuevoInv=s.inventario;
    if(rec.aprobaciones>=2){
      nuevoInv=s.inventario.map(item=>{
        const linea=rec.lineas.find(l=>l.prodId===item.id);
        if(linea) return{...item,stock:item.stock+Number(linea.cant)};
        return item;
      });
      updated.forEach(r=>{if(r.id===recibo.id)r.estado="aplicado";});
    }
    saveStore({...s,recepciones:updated,inventario:nuevoInv});
    onUpdate();setConfirm(null);
  }

  function rechazar(recibo){
    const s=loadStore();if(!s)return;
    const recs=s.recepciones||[];
    saveStore({...s,recepciones:recs.map(r=>r.id===recibo.id?{...r,estado:"rechazado"}:r)});
    onUpdate();setConfirm(null);
  }

  const estadoLabel={esperando_vendedor:"⏳ Esperando vendedor",esperando_surtidor:"⏳ Esperando surtidor",listo_aplicar:"✅ Listo",aplicado:"✅ Aplicado",rechazado:"❌ Rechazado"};
  const estadoColor={esperando_vendedor:"#facc15",esperando_surtidor:"#fb923c",listo_aplicar:"#34d399",aplicado:"#34d399",rechazado:"#f87171"};

  return <div className="fu" style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:24}}>📥 Recepciones de Inventario</h2>
      {misPendientes.length>0&&<Tag color="#f87171">🔔 {misPendientes.length} pendiente{misPendientes.length>1?"s":""} de aprobar</Tag>}
    </div>

    <div style={{display:"flex",borderBottom:"1px solid "+G.border}}>
      {(esAlmacen?[{id:"nueva",l:"+ Nueva recepción"},{id:"historial",l:"Historial"}]:[{id:"historial",l:"Historial"}]).map(t=>
        <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"10px 18px",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,color:tab===t.id?G.accent:G.muted,borderBottom:tab===t.id?"2px solid "+G.accent:"2px solid transparent"}}>{t.l}</button>
      )}
    </div>

    {tab==="nueva"&&esAlmacen&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
      {saved==="ok"&&<div style={{background:"#34d39920",border:"1px solid #34d39944",borderRadius:8,padding:"10px 14px",color:"#34d399",fontWeight:700}}>✅ Recibo creado — pendiente de aprobación</div>}
      <Card style={{padding:14,display:"flex",flexDirection:"column",gap:10}}>
        <p style={{fontSize:11,fontWeight:700,color:G.muted,letterSpacing:.8}}>PRODUCTOS RECIBIDOS</p>
        {lineas.map((l,idx)=><div key={l.id} style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
          <span style={{width:20,color:G.muted,fontSize:12,flexShrink:0}}>{idx+1}</span>
          <div style={{flex:1,position:"relative"}}>
            <input
              value={buscando===l.id ? query : l.prodNombre||""}
              onChange={e=>{setQuery(e.target.value);setBuscando(l.id);}}
              onFocus={()=>{setBuscando(l.id);setQuery(l.prodNombre||"");}}
              onBlur={()=>setTimeout(()=>setBuscando(null),200)}
              placeholder="Buscar producto..."
              style={{...inp,fontSize:12,width:"100%"}}
            />
            {buscando===l.id&&<div style={{position:"absolute",top:"calc(100% + 2px)",left:0,right:0,background:G.surface,border:"1px solid "+G.border,borderRadius:9,zIndex:50,maxHeight:200,overflow:"auto",boxShadow:"0 8px 24px #000b"}}>
              {(query.length>=1
                ? CATALOGO.filter(p=>!["Servicios","PVC"].includes(p.cat)&&p.nombre.toLowerCase().includes(query.toLowerCase()))
                : CATALOGO.filter(p=>!["Servicios","PVC"].includes(p.cat))
              ).slice(0,10).map(p=><div key={p.id} onMouseDown={e=>{e.preventDefault();selProd(l.id,p);}}
                style={{padding:"8px 12px",cursor:"pointer",fontSize:13,display:"flex",justifyContent:"space-between",color:"#d6d3d1",borderBottom:"1px solid "+G.border+"30"}}
                onMouseEnter={e=>e.currentTarget.style.background=G.surface2}
                onMouseLeave={e=>e.currentTarget.style.background=""}>
                <span>{p.nombre}</span><span style={{color:G.muted,fontSize:11}}>{p.cat}</span>
              </div>)}
              {(query.length>=1 && CATALOGO.filter(p=>!["Servicios","PVC"].includes(p.cat)&&p.nombre.toLowerCase().includes(query.toLowerCase())).length===0) &&
                <div style={{padding:"10px 12px",fontSize:12,color:G.muted}}>Sin resultados</div>}
            </div>}
          </div>
          <input type="number" min="1" value={l.cant} onChange={e=>setL(l.id,"cant",e.target.value)} style={{...inp,width:80,textAlign:"center"}} placeholder="Cant."/>
          <button onClick={()=>setLineas(ls=>ls.filter(x=>x.id!==l.id))} style={{background:"none",border:"none",color:G.muted,cursor:"pointer",fontSize:18}}>✕</button>
        </div>)}
        <button onClick={addLinea} style={{padding:"7px",background:"none",border:"1px dashed "+G.border,borderRadius:8,color:G.muted,cursor:"pointer",fontSize:12,width:"100%"}} onMouseEnter={e=>e.currentTarget.style.borderColor=G.accent} onMouseLeave={e=>e.currentTarget.style.borderColor=G.border}>+ Agregar línea</button>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Inp label="Proveedor (opcional)" value={proveedor} onChange={setProveedor} placeholder="Nombre del proveedor"/>
        <Inp label="Notas (opcional)" value={notas} onChange={setNotas} placeholder="Observaciones..."/>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end"}}>
        <Btn v="pri" onClick={crearRecibo} disabled={!lineas.some(l=>l.prodId&&l.cant>0)}>📤 Enviar a aprobación</Btn>
      </div>
    </div>}

    {tab==="historial"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
      {recepciones.length===0&&<Card style={{padding:32,textAlign:"center",color:"#44403c"}}>Sin recepciones registradas</Card>}
      {recepciones.sort((a,b)=>new Date(b.fecha)-new Date(a.fecha)).map(r=>{
        const puedoAprobar=(esVendedor&&!r.aproboVendedor&&r.estado!=="aplicado"&&r.estado!=="rechazado")||(esAlmacen&&!r.aproboSurtidor&&r.aprobaciones>=1&&r.estado!=="aplicado"&&r.estado!=="rechazado");
        return <Card key={r.id} style={{padding:14,borderColor:puedoAprobar?G.accent+"60":G.border}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div>
              <div style={{fontWeight:700,fontSize:14}}>{fmtFecha(r.fecha)} <span style={{color:G.muted,fontSize:12}}>{fmtHora(r.fecha)}hrs</span></div>
              <div style={{fontSize:12,color:G.muted,marginTop:2}}>Creado por {r.creadoPor}{r.proveedor?" · "+r.proveedor:""}</div>
            </div>
            <Tag color={estadoColor[r.estado]||G.muted}>{estadoLabel[r.estado]||r.estado}</Tag>
          </div>
          <div style={{background:G.surface2,borderRadius:8,padding:"8px 12px",marginBottom:10}}>
            {r.lineas.map((l,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:i<r.lineas.length-1?"1px solid "+G.border+"30":"none",fontSize:13}}>
              <span style={{color:"#d6d3d1"}}>{l.prodNombre}</span>
              <span style={{fontWeight:700,color:G.accent}}>+{l.cant} uds</span>
            </div>)}
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:puedoAprobar?10:0,fontSize:12}}>
            {r.aproboVendedor&&<Tag color="#34d399">✓ Vendedor: {r.aproboVendedor}</Tag>}
            {r.aproboSurtidor&&<Tag color="#34d399">✓ Surtidor: {r.aproboSurtidor}</Tag>}
            {!r.aproboVendedor&&r.estado!=="rechazado"&&<Tag color="#facc15">⏳ Falta vendedor</Tag>}
            {!r.aproboSurtidor&&r.estado!=="rechazado"&&<Tag color="#fb923c">⏳ Falta surtidor</Tag>}
          </div>
          {puedoAprobar&&<div style={{display:"flex",gap:8}}>
            <Btn v="ok" onClick={()=>setConfirm({tipo:"aprobar",recibo:r})} full>✅ Aprobar este recibo</Btn>
            <Btn v="warn" size="sm" onClick={()=>setConfirm({tipo:"rechazar",recibo:r})}>✕ Rechazar</Btn>
          </div>}
        </Card>;
      })}
    </div>}

    {confirm&&<Confirm
      msg={confirm.tipo==="aprobar"?"¿Confirmas la aprobación de este recibo?\n"+(confirm.recibo.aprobaciones>=1?"✅ Con tu aprobación el inventario se actualizará automáticamente.":"Se necesita una aprobación más para aplicarlo."):"¿Rechazar este recibo? No se aplicará al inventario."}
      danger={confirm.tipo==="rechazar"}
      onOk={()=>confirm.tipo==="aprobar"?aprobar(confirm.recibo):rechazar(confirm.recibo)}
      onCancel={()=>setConfirm(null)}
    />}
  </div>;
}


// ── Cierre de Mes ─────────────────────────────────────────────────────
function CierreMes({store, usuario, onUpdate}) {
  const [tab, setTab] = useState("nuevo");
  const [conteos, setConteos] = useState(()=>store.inventario.map(p=>({...p,fisico:"",diff:0})));
  const [confirm, setConfirm] = useState(null);
  const esAdmin = usuario.rol==="admin";
  const esAlmacen = usuario.rol==="almacen"||usuario.rol==="inventario";
  const cierres = store.cierresMes||[];

  function setFisico(id,val){
    setConteos(cs=>cs.map(c=>{
      if(c.id!==id) return c;
      const fisico=parseFloat(val)||0;
      return {...c,fisico:val,diff:fisico-c.stock};
    }));
  }

  function enviarCierre(){
    const lineas=conteos.filter(c=>c.fisico!=="").map(c=>({
      id:c.id,nombre:c.nombre,sistemaStock:c.stock,
      fisicoContado:parseFloat(c.fisico)||0,
      diferencia:(parseFloat(c.fisico)||0)-c.stock
    }));
    if(!lineas.length){alert("Captura al menos un producto.");return;}
    const cierre={
      id:uid(),fecha:new Date().toISOString(),creadoPor:usuario.nombre,
      estado:"pendiente_admin",lineas,
      ajustesAdmin:null,aprobadoPor:null,aprobadoTs:null
    };
    const s=loadStore();if(!s)return;
    const cierresActuales=s.cierresMes||[];
    saveStore({...s,cierresMes:[...cierresActuales,cierre]});
    onUpdate();
    setTab("historial");
  }

  function aprobarCierre(cierre,lineasAjustadas){
    const s=loadStore();if(!s)return;
    const ts=new Date().toISOString();
    // Ajustar inventario
    const nuevoInv=s.inventario.map(item=>{
      const linea=lineasAjustadas.find(l=>l.id===item.id);
      if(linea) return{...item,stock:linea.fisicoFinal};
      return item;
    });
    const updated=s.cierresMes.map(c=>c.id===cierre.id?{...c,estado:"aprobado",ajustesAdmin:lineasAjustadas,aprobadoPor:usuario.nombre,aprobadoTs:ts}:c);
    saveStore({...s,cierresMes:updated,inventario:nuevoInv});
    onUpdate();setConfirm(null);
  }

  return <div className="fu" style={{display:"flex",flexDirection:"column",gap:14}}>
    <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:24}}>📊 Cierre de Mes</h2>
    <div style={{display:"flex",borderBottom:"1px solid "+G.border}}>
      {[{id:"nuevo",l:"📋 Nuevo conteo",show:esAlmacen},{id:"historial",l:"📁 Historial",show:true}].filter(t=>t.show).map(t=>
        <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"10px 18px",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,color:tab===t.id?G.accent:G.muted,borderBottom:tab===t.id?"2px solid "+G.accent:"2px solid transparent"}}>{t.l}</button>
      )}
    </div>

    {tab==="nuevo"&&esAlmacen&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
      <div style={{background:"#38bdf820",border:"1px solid #38bdf840",borderRadius:8,padding:"10px 14px",fontSize:13,color:"#38bdf8"}}>
        📋 Captura las cantidades físicas que contaste en el almacén. Solo llena los productos que contaste.
      </div>
      <Card><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
        <thead><tr style={{background:G.surface2}}>{["Producto","Stock sistema","Conteo físico","Diferencia"].map(h=><th key={h} style={{padding:"9px 13px",textAlign:"left",fontSize:11,fontWeight:700,color:G.muted}}>{h}</th>)}</tr></thead>
        <tbody>{conteos.map(c=>{
          const diff=c.fisico!==""?(parseFloat(c.fisico)||0)-c.stock:null;
          return <tr key={c.id} style={{borderBottom:"1px solid "+G.border+"40",background:diff!==null&&diff!==0?"#dc262608":""}}>
            <td style={{padding:"8px 13px",fontWeight:600}}>{c.nombre}</td>
            <td style={{padding:"8px 13px",color:G.muted}}>{c.stock}</td>
            <td style={{padding:"8px 13px"}}>
              <input type="number" min="0" value={c.fisico} onChange={e=>setFisico(c.id,e.target.value)} placeholder="—" style={{...inp,width:80,textAlign:"center",fontSize:13,padding:"5px 8px"}}/>
            </td>
            <td style={{padding:"8px 13px",fontWeight:700,color:diff===null?"#44403c":diff>0?"#34d399":diff<0?"#f87171":"#34d399"}}>
              {diff===null?"—":diff>0?"+"+diff:diff===0?"✓":diff}
            </td>
          </tr>;
        })}</tbody>
      </table></div></Card>
      <div style={{display:"flex",justifyContent:"flex-end"}}>
        <Btn v="pri" onClick={enviarCierre}>📤 Enviar al Admin para revisión</Btn>
      </div>
    </div>}

    {tab==="historial"&&<CierreHistorial cierres={cierres} esAdmin={esAdmin} usuario={usuario} onAprobar={aprobarCierre} onUpdate={onUpdate}/>}
  </div>;
}

function CierreHistorial({cierres, esAdmin, usuario, onAprobar}) {
  const [revisando,setRevisando]=useState(null);
  const [lineasEdit,setLineasEdit]=useState([]);

  function abrirRevision(cierre){
    setLineasEdit(cierre.lineas.map(l=>({...l,fisicoFinal:l.fisicoContado})));
    setRevisando(cierre);
  }

  if(revisando&&esAdmin){
    const conDiff=lineasEdit.filter(l=>l.diferencia!==0);
    return <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",gap:10,alignItems:"center"}}>
        <Btn v="ghost" onClick={()=>setRevisando(null)}>← Volver</Btn>
        <h3 style={{fontFamily:"'DM Serif Display',serif",fontSize:20}}>Revisión de cierre — {fmtFecha(revisando.fecha)}</h3>
      </div>
      <div style={{background:"#facc1520",border:"1px solid #facc1540",borderRadius:8,padding:"10px 14px",fontSize:13,color:"#facc15"}}>
        ✏️ Puedes ajustar las cantidades finales antes de aprobar. El inventario se actualizará con los valores de "Final".
      </div>
      <Card><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
        <thead><tr style={{background:G.surface2}}>{["Producto","Sistema","Contado","Diferencia","Final (editable)"].map(h=><th key={h} style={{padding:"9px 13px",textAlign:"left",fontSize:11,fontWeight:700,color:G.muted}}>{h}</th>)}</tr></thead>
        <tbody>{lineasEdit.map((l,i)=><tr key={l.id} style={{borderBottom:"1px solid "+G.border+"40",background:l.diferencia!==0?"#dc262608":""}}>
          <td style={{padding:"8px 13px",fontWeight:600}}>{l.nombre}</td>
          <td style={{padding:"8px 13px",color:G.muted}}>{l.sistemaStock}</td>
          <td style={{padding:"8px 13px"}}>{l.fisicoContado}</td>
          <td style={{padding:"8px 13px",fontWeight:700,color:l.diferencia>0?"#34d399":l.diferencia<0?"#f87171":"#34d399"}}>{l.diferencia>0?"+":""}{l.diferencia}</td>
          <td style={{padding:"8px 13px"}}>
            <input type="number" min="0" value={l.fisicoFinal} onChange={e=>setLineasEdit(ls=>ls.map((x,j)=>j===i?{...x,fisicoFinal:parseFloat(e.target.value)||0}:x))} style={{...inp,width:80,textAlign:"center",fontSize:13,padding:"5px 8px"}}/>
          </td>
        </tr>)}</tbody>
      </table></div></Card>
      {conDiff.length>0&&<Card style={{padding:12,borderColor:"#f8717140"}}>
        <p style={{fontSize:11,fontWeight:700,color:"#f87171",marginBottom:8}}>⚠️ DISCREPANCIAS ({conDiff.length} productos)</p>
        {conDiff.map(l=><div key={l.id} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"3px 0",color:G.muted}}>
          <span>{l.nombre}</span><span style={{color:l.diferencia<0?"#f87171":"#34d399",fontWeight:700}}>{l.diferencia>0?"+":""}{l.diferencia} uds</span>
        </div>)}
      </Card>}
      <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
        <Btn v="ghost" onClick={()=>setRevisando(null)}>Cancelar</Btn>
        <Btn v="pri" onClick={()=>onAprobar(revisando,lineasEdit)}>✅ Aprobar y ajustar inventario</Btn>
      </div>
    </div>;
  }

  if(!cierres.length) return <Card style={{padding:32,textAlign:"center",color:"#44403c"}}>Sin cierres registrados</Card>;

  return <div style={{display:"flex",flexDirection:"column",gap:10}}>
    {cierres.sort((a,b)=>new Date(b.fecha)-new Date(a.fecha)).map(c=>{
      const pendiente=c.estado==="pendiente_admin"&&esAdmin;
      const conDiff=c.lineas.filter(l=>l.diferencia!==0).length;
      return <Card key={c.id} style={{padding:14,borderColor:pendiente?G.accent+"60":G.border}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div>
            <div style={{fontWeight:700}}>{fmtFecha(c.fecha)} <span style={{color:G.muted,fontSize:12}}>{fmtHora(c.fecha)}hrs</span></div>
            <div style={{fontSize:12,color:G.muted}}>Conteo por {c.creadoPor} · {c.lineas.length} productos{conDiff>0?" · "+conDiff+" discrepancias":""}</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <Tag color={c.estado==="aprobado"?"#34d399":"#facc15"}>{c.estado==="aprobado"?"✅ Aprobado":"⏳ Pendiente Admin"}</Tag>
            {pendiente&&<Btn v="pri" size="sm" onClick={()=>abrirRevision(c)}>Revisar</Btn>}
          </div>
        </div>
        {c.aprobadoPor&&<div style={{fontSize:11,color:G.muted}}>Aprobado por {c.aprobadoPor} el {fmtFecha(c.aprobadoTs)}</div>}
      </Card>;
    })}
  </div>;
}


// ── Centro de Aprobaciones ─────────────────────────────────────────────
function contarPendientes(store, usuario) {
  const recepciones = store.recepciones||[];
  const cierres = store.cierresMes||[];
  let n = 0;
  if(usuario.rol==="vendedor") n += recepciones.filter(r=>!r.aproboVendedor&&r.estado!=="aplicado"&&r.estado!=="rechazado").length;
  if(usuario.rol==="almacen") n += recepciones.filter(r=>r.aprobaciones>=1&&!r.aproboSurtidor&&r.estado!=="aplicado"&&r.estado!=="rechazado").length;
  if(usuario.rol==="admin") n += cierres.filter(c=>c.estado==="pendiente_admin").length;
  if(usuario.rol==="inventario") n += recepciones.filter(r=>!r.aproboSurtidor&&r.aprobaciones>=1&&r.estado!=="aplicado"&&r.estado!=="rechazado").length;
  return n;
}

function Aprobaciones({store, usuario, onUpdate}) {
  const recepciones = store.recepciones||[];
  const cierres = store.cierresMes||[];
  const esAdmin = usuario.rol==="admin";
  const esVendedor = usuario.rol==="vendedor";
  const esAlmacen = usuario.rol==="almacen"||usuario.rol==="inventario";
  const [confirm,setConfirm]=useState(null);

  const misRecepciones = recepciones.filter(r=>{
    if(r.estado==="aplicado"||r.estado==="rechazado") return false;
    if(esVendedor) return !r.aproboVendedor;
    if(esAlmacen) return r.aprobaciones>=1&&!r.aproboSurtidor;
    return false;
  });
  const misCierres = esAdmin ? cierres.filter(c=>c.estado==="pendiente_admin") : [];
  const total = misRecepciones.length+misCierres.length;

  function aprobarRecibo(r){
    const s=loadStore();if(!s)return;
    if(!s.recepciones) s.recepciones=[];
    const ts=new Date().toISOString();
    const updated=s.recepciones.map(rec=>{
      if(rec.id!==r.id) return rec;
      if(esVendedor&&!rec.aproboVendedor){
        const aprobaciones=rec.aprobaciones+1;
        return{...rec,aproboVendedor:usuario.nombre,aproboVendedorTs:ts,aprobaciones,estado:aprobaciones>=2?"listo_aplicar":"esperando_surtidor"};
      }
      if(esAlmacen&&!rec.aproboSurtidor){
        const aprobaciones=rec.aprobaciones+1;
        const listo=aprobaciones>=2;
        const upd={...rec,aproboSurtidor:usuario.nombre,aproboSurtidorTs:ts,aprobaciones,estado:listo?"aplicado":"esperando_vendedor"};
        if(listo){
          s.inventario=s.inventario.map(item=>{
            const linea=rec.lineas.find(l=>l.prodId===item.id);
            if(linea) return{...item,stock:item.stock+Number(linea.cant)};
            return item;
          });
        }
        return upd;
      }
      return rec;
    });
    saveStore({...s,recepciones:updated});
    onUpdate();setConfirm(null);
  }

  function rechazarRecibo(r){
    const s=loadStore();if(!s)return;
    const recs=s.recepciones||[];
    saveStore({...s,recepciones:recs.map(rec=>rec.id===r.id?{...rec,estado:"rechazado"}:rec)});
    onUpdate();setConfirm(null);
  }

  return <div className="fu" style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:24}}>✅ Aprobaciones</h2>
      {total>0 ? <Tag color="#f87171">🔔 {total} pendiente{total>1?"s":""}</Tag> : <Tag color="#34d399">✓ Todo al día</Tag>}
    </div>

    {total===0&&<Card style={{padding:48,textAlign:"center"}}>
      <div style={{fontSize:48,marginBottom:10}}>✅</div>
      <p style={{color:"#34d399",fontWeight:700,fontSize:16}}>¡Sin pendientes!</p>
      <p style={{color:G.muted,fontSize:13,marginTop:4}}>No tienes nada que aprobar en este momento.</p>
    </Card>}

    {misRecepciones.length>0&&<div style={{display:"flex",flexDirection:"column",gap:8}}>
      <p style={{fontSize:11,fontWeight:700,color:G.muted,letterSpacing:.8}}>📥 RECEPCIONES PENDIENTES ({misRecepciones.length})</p>
      {misRecepciones.map(r=><Card key={r.id} style={{padding:14,borderColor:G.accent+"60"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
          <div>
            <div style={{fontWeight:700}}>Recibo del {fmtFecha(r.fecha)}</div>
            <div style={{fontSize:12,color:G.muted}}>Creado por {r.creadoPor}{r.proveedor?" · "+r.proveedor:""}</div>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {r.aproboVendedor?<Tag color="#34d399">✓ Vendedor</Tag>:<Tag color="#facc15">⏳ Vendedor</Tag>}
            {r.aproboSurtidor?<Tag color="#34d399">✓ Surtidor</Tag>:<Tag color="#fb923c">⏳ Surtidor</Tag>}
          </div>
        </div>
        <div style={{background:G.surface2,borderRadius:8,padding:"8px 12px",marginBottom:10}}>
          {r.lineas.map((l,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:13,borderBottom:i<r.lineas.length-1?"1px solid "+G.border+"30":"none"}}>
            <span style={{color:"#d6d3d1"}}>{l.prodNombre}</span>
            <span style={{fontWeight:700,color:"#34d399"}}>+{l.cant} uds</span>
          </div>)}
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn v="ok" onClick={()=>setConfirm({tipo:"aprobar",recibo:r})} full>✅ Aprobar</Btn>
          <Btn v="warn" size="sm" onClick={()=>setConfirm({tipo:"rechazar",recibo:r})}>✕ Rechazar</Btn>
        </div>
      </Card>)}
    </div>}

    {misCierres.length>0&&<div style={{display:"flex",flexDirection:"column",gap:8}}>
      <p style={{fontSize:11,fontWeight:700,color:G.muted,letterSpacing:.8}}>📊 CIERRES DE MES PENDIENTES</p>
      {misCierres.map(c=><Card key={c.id} style={{padding:14,borderColor:"#facc1560"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontWeight:700}}>Cierre del {fmtFecha(c.fecha)}</div>
            <div style={{fontSize:12,color:G.muted}}>Por {c.creadoPor} · {c.lineas.length} productos · {c.lineas.filter(l=>l.diferencia!==0).length} discrepancias</div>
          </div>
          <Btn v="pri" size="sm" onClick={()=>{}}>Ir a Cierre de Mes →</Btn>
        </div>
      </Card>)}
    </div>}

    {confirm&&<Confirm
      danger={confirm.tipo==="rechazar"}
      msg={confirm.tipo==="aprobar"?"¿Confirmas la aprobación de este recibo de inventario?":"¿Rechazar este recibo? El stock NO se modificará."}
      onOk={()=>confirm.tipo==="aprobar"?aprobarRecibo(confirm.recibo):rechazarRecibo(confirm.recibo)}
      onCancel={()=>setConfirm(null)}
    />}
  </div>;
}


// ── Pronóstico de inventario ──────────────────────────────────────────
function calcularPronostico(store) {
  const hace30 = Date.now() - 30*24*60*60*1000;
  const ordenesRecientes = store.ventas.filter(v=>v.estado!=="cotizacion"&&new Date(v.fecha).getTime()>hace30);
  const consumo = {};
  ordenesRecientes.forEach(v=>{
    v.lineas.forEach(l=>{
      if(!l.clienteMat&&!["Servicios","PVC"].includes(l.cat)){
        consumo[l.nombre]=(consumo[l.nombre]||0)+l.cant;
      }
    });
  });
  return store.inventario.map(p=>{
    const consumo30=consumo[p.nombre]||0;
    const consumoDiario=consumo30/30;
    const diasRestantes=consumoDiario>0?Math.floor(p.stock/consumoDiario):null;
    return{...p,consumo30,consumoDiario,diasRestantes};
  });
}


// ── Precios de Compra (solo Admin) ────────────────────────────────────
function CentroMando({store, usuario}) {
  const [ahora, setAhora] = useState(Date.now());
  useEffect(()=>{const iv=setInterval(()=>setAhora(Date.now()),30000);return()=>clearInterval(iv);},[]);

  const esAdmin = usuario.rol==="admin";
  const ventas = store.ventas;
  const activas = ventas.filter(v=>!["entregada","cotizacion"].includes(v.estado));
  const misActivas = esAdmin ? activas : activas.filter(v=>v.vendedor===usuario.nombre);

  // ── Helpers ──────────────────────────────────────────────────────
  function minsDiff(ts){ return Math.floor((ahora - new Date(ts).getTime())/60000); }
  function fmtAge(mins){
    if(mins<60) return mins+"min";
    const h=Math.floor(mins/60),m=mins%60;
    return h+"h"+(m>0?" "+m+"min":"");
  }
  function ageSemaforo(mins){
    if(mins<120) return {icon:"🟢",color:"#34d399",label:"Al día"};
    if(mins<480) return {icon:"🟡",color:"#facc15",label:"Cargado"};
    if(mins<1440) return {icon:"🔴",color:"#f87171",label:"Atrasado"};
    return {icon:"💀",color:"#dc2626",label:"CRÍTICO"};
  }
  function tiempoEnEstado(venta){
    const hist=venta.historial;
    const last=hist[hist.length-1];
    return minsDiff(last.ts);
  }
  function tiempoTotal(venta){
    return minsDiff(venta.historial[0].ts);
  }

  // ── Aging principal ───────────────────────────────────────────────
  const ordenesConAging = misActivas.map(v=>({
    ...v,
    minsEnEstado: tiempoEnEstado(v),
    minsTotal: tiempoTotal(v),
    responsable: (()=>{
      const est=v.estado;
      if(est==="surtir"||est==="confirmada") return "Luis M.";
      if(est==="corte") return v.asigCorte||"Cola Corte";
      if(est==="enchape") return v.asigEnchape||"Cola Enchape";
      if(est==="listo") return "Repartidor";
      return v.vendedor;
    })()
  })).sort((a,b)=>b.minsEnEstado-a.minsEnEstado);

  // ── Sin movimiento >4h ─────────────────────────────────────────────
  const sinMovimiento = ordenesConAging.filter(v=>v.minsEnEstado>=240&&!["cotizacion","entregada"].includes(v.estado));

  // ── Compromisos en riesgo ─────────────────────────────────────────
  const comprometidas = misActivas.filter(v=>v.fechaEntrega&&v.estado!=="entregada").map(v=>({
    ...v,
    minsParaEntrega: Math.floor((new Date(v.fechaEntrega).getTime()-ahora)/60000)
  })).filter(v=>v.minsParaEntrega<480).sort((a,b)=>a.minsParaEntrega-b.minsParaEntrega);

  // ── Carga por persona (solo admin) ───────────────────────────────
  const cargaPersonas = USUARIOS.filter(u=>["almacen","corte","enchape","entrega","vendedor"].includes(u.rol)).map(u=>{
    let ordenes=[];
    if(u.rol==="almacen") ordenes=activas.filter(v=>["confirmada","surtir"].includes(v.estado));
    else if(u.rol==="corte") ordenes=activas.filter(v=>v.estado==="corte"&&(v.asigCorte===u.nombre||!v.asigCorte));
    else if(u.rol==="enchape") ordenes=activas.filter(v=>v.estado==="enchape"&&(v.asigEnchape===u.nombre||!v.asigEnchape));
    else if(u.rol==="entrega") ordenes=activas.filter(v=>v.estado==="listo");
    else ordenes=activas.filter(v=>v.vendedor===u.nombre);
    const n=ordenes.length;
    const sem=n<=2?"🟢":n<=4?"🟡":"🔴";
    const semColor=n<=2?"#34d399":n<=4?"#facc15":"#f87171";
    return {usuario:u,ordenes,n,sem,semColor};
  });

  // ── Velocidad taller (últimos 7 días) ─────────────────────────────
  const hace7dias=ahora-7*24*60*60*1000;
  const entregadas7=ventas.filter(v=>v.estado==="entregada"&&new Date(v.historial[v.historial.length-1].ts).getTime()>hace7dias);
  const velocidadProm=entregadas7.length>0
    ? Math.round(entregadas7.reduce((s,v)=>s+tiempoTotal(v),0)/entregadas7.length)
    : null;

  // ── Cuello de botella ─────────────────────────────────────────────
  const porEstado=FLUJO.filter(f=>!["cotizacion","entregada"].includes(f.id)).map(f=>({
    ...f, n:activas.filter(v=>v.estado===f.id).length
  }));
  const maxN=Math.max(...porEstado.map(x=>x.n),1);

  // ── Pendientes de cobro ───────────────────────────────────────────
  const sinCobrar=ventas.filter(v=>v.estado==="entregada"&&!v.pagado).map(v=>({
    ...v, diasSinCobrar: Math.floor(minsDiff(v.historial[v.historial.length-1].ts)/60/24)
  })).sort((a,b)=>b.diasSinCobrar-a.diasSinCobrar);

  // ── Alertas activas ───────────────────────────────────────────────
  const alertas=[];
  comprometidas.filter(v=>v.minsParaEntrega<0).forEach(v=>alertas.push({tipo:"vencida",venta:v,msg:"Entrega vencida: #"+v.folio+" "+v.cliente}));
  misActivas.filter(v=>v.urgente&&v.minsEnEstado>=120).forEach(v=>alertas.push({tipo:"urgente",venta:v,msg:"Urgente parada "+fmtAge(tiempoEnEstado(v))+": #"+v.folio+" "+v.cliente}));
  sinMovimiento.slice(0,3).forEach(v=>alertas.push({tipo:"atascada",venta:v,msg:"Sin movimiento "+fmtAge(v.minsEnEstado)+": #"+v.folio+" en "+flujoInfo(v.estado).label}));

  const StatBox=({icon,label,value,color="#f59e0b",sub})=>(
    <div style={{background:G.surface2,borderRadius:10,padding:"12px 16px",flex:1,minWidth:120}}>
      <div style={{fontSize:20,marginBottom:2}}>{icon}</div>
      <div style={{fontSize:22,fontWeight:800,color}}>{value}</div>
      <div style={{fontSize:11,color:G.muted,marginTop:1}}>{label}</div>
      {sub&&<div style={{fontSize:11,color:G.muted,marginTop:2}}>{sub}</div>}
    </div>
  );

  return <div className="fu" style={{display:"flex",flexDirection:"column",gap:18}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div>
        <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:26}}>📊 Centro de Mando</h2>
        <span style={{fontSize:12,color:G.muted}}>Actualiza cada 30 seg · {new Date(ahora).toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"})}hrs</span>
      </div>
      {alertas.length>0&&<div style={{background:"#dc262620",border:"1px solid #dc262660",borderRadius:8,padding:"6px 14px",fontSize:13,fontWeight:700,color:"#f87171"}}>⚠️ {alertas.length} alerta{alertas.length>1?"s":""} activa{alertas.length>1?"s":""}</div>}
    </div>

    {/* ALERTAS */}
    {alertas.length>0&&<Card style={{padding:14,borderColor:"#dc262640"}}>
      <p style={{fontSize:11,fontWeight:700,color:"#f87171",marginBottom:10,letterSpacing:.8}}>🚨 ALERTAS ACTIVAS</p>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {alertas.map((a,i)=><div key={i} style={{display:"flex",gap:10,alignItems:"center",padding:"6px 10px",background:"#dc262615",borderRadius:7,fontSize:13}}>
          <span>{a.tipo==="vencida"?"💀":a.tipo==="urgente"?"🔴":"⏸️"}</span>
          <span style={{color:"#fca5a5",fontWeight:600}}>{a.msg}</span>
        </div>)}
      </div>
    </Card>}

    {/* STATS RÁPIDOS */}
    <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
      <StatBox icon="⚙️" label="En producción" value={misActivas.length} color="#a78bfa"/>
      <StatBox icon="🔴" label="Urgentes" value={misActivas.filter(v=>v.urgente).length} color="#f87171"/>
      <StatBox icon="⏸️" label="Sin movimiento +4h" value={sinMovimiento.length} color="#fb923c"/>
      <StatBox icon="⚠️" label="Entregas en riesgo" value={comprometidas.length} color="#facc15"/>
      {esAdmin&&<StatBox icon="💸" label="Sin cobrar" value={sinCobrar.length} color="#f87171" sub={sinCobrar.length>0?"$"+sinCobrar.reduce((s,v)=>s+v.total,0).toLocaleString("es-MX"):""}/>}
      {esAdmin&&velocidadProm&&<StatBox icon="📈" label="Velocidad prom. 7d" value={fmtAge(velocidadProm)} color="#34d399" sub="por orden"/>}
    </div>

    {/* AGING PRINCIPAL */}
    <Card>
      <div style={{padding:"12px 16px",borderBottom:"1px solid "+G.border,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:13,fontWeight:700,color:G.muted}}>⏱️ AGING DE ÓRDENES ACTIVAS ({ordenesConAging.length})</span>
        <div style={{display:"flex",gap:12,fontSize:11}}>
          {[["🟢","<2h"],["🟡","2-8h"],["🔴","8-24h"],["💀","+24h"]].map(([ic,lb])=><span key={lb} style={{color:G.muted}}>{ic} {lb}</span>)}
        </div>
      </div>
      {ordenesConAging.length===0
        ?<div style={{padding:32,textAlign:"center",color:"#44403c"}}>✅ Sin órdenes activas</div> : <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:G.surface2}}>{["","Folio","Cliente","Estado","Responsable","En estado","Total","Fecha compromiso"].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:11,fontWeight:700,color:G.muted,whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
          <tbody>{ordenesConAging.map(v=>{
            const ag=ageSemaforo(v.minsEnEstado);
            const fi=flujoInfo(v.estado);
            const vencePresto=v.fechaEntrega&&new Date(v.fechaEntrega).getTime()-ahora<480*60000;
            return <tr key={v.folio} style={{borderBottom:"1px solid "+G.border+"40",background:v.urgente?"#dc262608":""}}>
              <td style={{padding:"8px 12px",fontSize:16}}>{ag.icon}{v.urgente?"🔴":""}</td>
              <td style={{padding:"8px 12px",fontFamily:"monospace",color:v.urgente?"#f87171":G.accent,fontWeight:700}}>#{v.folio}</td>
              <td style={{padding:"8px 12px",fontWeight:600}}>{v.cliente}</td>
              <td style={{padding:"8px 12px"}}><Tag color={fi.color}>{fi.icon} {fi.label}</Tag></td>
              <td style={{padding:"8px 12px",color:G.muted}}>{v.responsable}</td>
              <td style={{padding:"8px 12px",fontWeight:700,color:ag.color}}>{fmtAge(v.minsEnEstado)}</td>
              <td style={{padding:"8px 12px",color:G.muted}}>{fmtAge(v.minsTotal)}</td>
              <td style={{padding:"8px 12px"}}>{v.fechaEntrega ? <span style={{color:vencePresto?"#f87171":"#34d399",fontWeight:vencePresto?700:400}}>{vencePresto?"⚠️ ":""}{new Date(v.fechaEntrega).toLocaleDateString("es-MX",{day:"2-digit",month:"short"})} {new Date(v.fechaEntrega).toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"})}</span> : <span style={{color:"#44403c"}}>—</span>}</td>
            </tr>;
          })}</tbody>
        </table></div>}
    </Card>

    {/* COMPROMISOS EN RIESGO */}
    {comprometidas.length>0&&<Card style={{borderColor:"#facc1540"}}>
      <div style={{padding:"12px 16px",borderBottom:"1px solid "+G.border,fontSize:13,fontWeight:700,color:"#facc15"}}>📅 COMPROMISOS DE ENTREGA EN RIESGO ({comprometidas.length})</div>
      <div style={{display:"flex",flexDirection:"column",gap:0}}>
        {comprometidas.map(v=>{
          const vencida=v.minsParaEntrega<0;
          const fi=flujoInfo(v.estado);
          return <div key={v.folio} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 16px",borderBottom:"1px solid "+G.border+"30"}}>
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              <span style={{fontSize:16}}>{vencida?"💀":"⚠️"}</span>
              <div>
                <span style={{fontFamily:"monospace",color:G.accent,fontWeight:700,marginRight:8}}>#{v.folio}</span>
                <span style={{fontWeight:600}}>{v.cliente}</span>
                {v.urgente&&<Tag color="#f87171" style={{marginLeft:8}}>URGENTE</Tag>}
              </div>
            </div>
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              <Tag color={fi.color}>{fi.icon} {fi.label}</Tag>
              <span style={{fontWeight:700,color:vencida?"#f87171":"#facc15",fontSize:13}}>
                {vencida?"Venció hace "+fmtAge(-v.minsParaEntrega):"Vence en "+fmtAge(v.minsParaEntrega)}
              </span>
            </div>
          </div>;
        })}
      </div>
    </Card>}

    {/* CARGA POR PERSONA — solo admin */}
    {esAdmin&&<div>
      <p style={{fontSize:11,fontWeight:700,color:G.muted,letterSpacing:.8,marginBottom:10}}>👷 CARGA POR PERSONA</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
        {cargaPersonas.map(({usuario:u,n,sem,semColor,ordenes})=><Card key={u.id} style={{padding:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
            <div>
              <div style={{fontWeight:700,fontSize:14}}>{u.nombre}</div>
              <div style={{fontSize:11,color:G.muted}}>{u.rol}</div>
            </div>
            <span style={{fontSize:22}}>{sem}</span>
          </div>
          <div style={{fontSize:24,fontWeight:800,color:semColor,marginBottom:4}}>{n}</div>
          <div style={{fontSize:11,color:G.muted,marginBottom:8}}>orden{n!==1?"es":""} activa{n!==1?"s":""}</div>
          <div style={{height:4,background:G.surface2,borderRadius:4}}>
            <div style={{height:"100%",width:Math.min(100,n*20)+"%",background:semColor,borderRadius:4,transition:"width .5s"}}/>
          </div>
          {ordenes.filter(v=>v.urgente).length>0&&<div style={{marginTop:6,fontSize:11,color:"#f87171",fontWeight:700}}>🔴 {ordenes.filter(v=>v.urgente).length} urgente{ordenes.filter(v=>v.urgente).length>1?"s":""}</div>}
        </Card>)}
      </div>
    </div>}

    {/* CUELLO DE BOTELLA — solo admin */}
    {esAdmin&&<Card style={{padding:14}}>
      <p style={{fontSize:11,fontWeight:700,color:G.muted,marginBottom:12,letterSpacing:.8}}>🔧 CUELLO DE BOTELLA — ÓRDENES POR ESTADO</p>
      {porEstado.map(f=><div key={f.id} style={{marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}>
          <span style={{color:"#d6d3d1"}}>{f.icon} {f.label}</span>
          <span style={{fontWeight:700,color:f.n>=5?"#f87171":f.n>=3?"#facc15":f.color}}>{f.n} orden{f.n!==1?"es":""}{f.n>=5?" ⚠️":""}</span>
        </div>
        <div style={{height:6,background:G.surface2,borderRadius:4}}>
          <div style={{height:"100%",width:(f.n/maxN*100)+"%",background:f.n>=5?"#f87171":f.n>=3?"#facc15":f.color,borderRadius:4,transition:"width .5s"}}/>
        </div>
      </div>)}
    </Card>}

    {/* VELOCIDAD DEL TALLER — solo admin */}
    {esAdmin&&<Card style={{padding:14}}>
      <p style={{fontSize:11,fontWeight:700,color:G.muted,marginBottom:12,letterSpacing:.8}}>📈 VELOCIDAD DEL TALLER — ÚLTIMOS 7 DÍAS</p>
      {entregadas7.length===0
        ?<p style={{color:"#44403c",fontSize:13}}>Sin órdenes entregadas en los últimos 7 días</p> : <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
          <div style={{background:G.surface2,borderRadius:10,padding:"12px 20px"}}>
            <div style={{fontSize:28,fontWeight:800,color:"#34d399"}}>{fmtAge(velocidadProm)}</div>
            <div style={{fontSize:11,color:G.muted,marginTop:2}}>Tiempo promedio por orden</div>
          </div>
          <div style={{background:G.surface2,borderRadius:10,padding:"12px 20px"}}>
            <div style={{fontSize:28,fontWeight:800,color:G.accent}}>{entregadas7.length}</div>
            <div style={{fontSize:11,color:G.muted,marginTop:2}}>Órdenes completadas</div>
          </div>
          <div style={{background:G.surface2,borderRadius:10,padding:"12px 20px"}}>
            <div style={{fontSize:28,fontWeight:800,color:"#a78bfa"}}>{fmtAge(Math.min(...entregadas7.map(v=>tiempoTotal(v))))}</div>
            <div style={{fontSize:11,color:G.muted,marginTop:2}}>Orden más rápida</div>
          </div>
        </div>}
    </Card>}

    {/* PENDIENTES DE COBRO — solo admin */}
    {esAdmin&&sinCobrar.length>0&&<Card style={{borderColor:"#f8717140"}}>
      <div style={{padding:"12px 16px",borderBottom:"1px solid "+G.border,fontSize:13,fontWeight:700,color:"#f87171"}}>
        💸 PENDIENTES DE COBRO ({sinCobrar.length}) — Total: ${sinCobrar.reduce((s,v)=>s+v.total,0).toLocaleString("es-MX",{minimumFractionDigits:2})}
      </div>
      {sinCobrar.map(v=><div key={v.folio} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 16px",borderBottom:"1px solid "+G.border+"30"}}>
        <div>
          <span style={{fontFamily:"monospace",color:G.accent,fontWeight:700,marginRight:8}}>#{v.folio}</span>
          <span style={{fontWeight:600}}>{v.cliente}</span>
          <span style={{color:G.muted,fontSize:12,marginLeft:8}}>{v.vendedor}</span>
        </div>
        <div style={{display:"flex",gap:16,alignItems:"center"}}>
          <span style={{fontWeight:700,color:G.accent}}>${v.total.toLocaleString("es-MX",{minimumFractionDigits:2})}</span>
          <span style={{fontSize:12,color:v.diasSinCobrar>=3?"#f87171":"#facc15",fontWeight:700}}>{v.diasSinCobrar===0?"Hoy":v.diasSinCobrar+"d sin cobrar"}</span>
        </div>
      </div>)}
    </Card>}

  </div>;
}

function AdminTools({store,onUpdateStore}) {
  const [tab,setTab]=useState("exportar");
  const [usrs,setUsrs]=useState(()=>loadUsuarios());
  const [catItems,setCatItems]=useState(()=>CATALOGO.map(p=>({...p})));
  const [editCat,setEditCat]=useState(null);
  const [formCat,setFormCat]=useState({nombre:"",precio:"",cat:"MDF"});
  const [editU,setEditU]=useState(null);
  const [formU,setFormU]=useState({nombre:"",pin:"",rol:"vendedor",estacion:null});
  const [warn,setWarn]=useState(null);
  const [saved,setSaved]=useState("");
  const [precEdits,setPrecEdits]=useState({});
  const [precGuardado,setPrecGuardado]=useState(false);
  const preciosCompra=(loadStore()||{preciosCompra:{}}).preciosCompra||{};
  const CATS=["MDF","Melamina","Enchapado","Premium","Especial","Servicios","PVC"];

  function flash(k){setSaved(k);setTimeout(()=>setSaved(""),2000);}

  // ── EXPORTAR ──────────────────────────────────────────────────────
  function exportVentas(){
    const filas=[];
    store.ventas.sort((a,b)=>a.folio-b.folio).forEach(v=>{v.lineas.forEach(l=>{
      filas.push({"Folio":v.folio,"Fecha":new Date(v.fecha).toLocaleDateString("es-MX"),"Hora":new Date(v.fecha).toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"}),"Cliente":v.cliente,"Vendedor":v.vendedor,"Método":v.metodo,"Pagado":v.pagado?"Sí":"No","Estado":flujoInfo(v.estado).label,"Cortador":v.asigCorte||"","Enchapador":v.asigEnchape||"","Producto":l.nombre,"Categoría":l.cat||"","Cantidad":l.cant,"Precio":l.precio,"Total Línea":l.total,"Subtotal Orden":v.subtotal,"IVA":v.iva,"Total Orden":v.total});
    });});
    descargarCSV(filas,"BPC_Ventas_"+new Date().toISOString().slice(0,10)+".csv");
  }
  function exportCatalogo(){descargarCSV(CATALOGO.map(p=>({"ID":p.id,"Nombre":p.nombre,"Categoría":p.cat,"Precio":p.precio})),"BPC_Catalogo.csv");}
  function exportInventario(){descargarCSV(store.inventario.map(p=>({...p,Estado:p.stock===0?"Agotado":p.stock<=p.minimo?"Mínimo":"OK"})),"BPC_Inventario_"+new Date().toISOString().slice(0,10)+".csv");}
  function exportClientes(){
    descargarCSV(store.clientes.map(c=>{const vds=store.ventas.filter(v=>v.cliente===c.nombre);return{"Nombre":c.nombre,"Teléfono":c.tel||"","Email":c.email||"","Órdenes":vds.length,"Total":vds.reduce((s,v)=>s+v.total,0).toFixed(2)};}), "BPC_Clientes.csv");
  }
  function backupJSON(){
    const json=JSON.stringify(loadStore(),null,2);
    const a=document.createElement("a");
    a.href="data:application/json;charset=utf-8,"+encodeURIComponent(json);
    a.download="BPC_Backup_"+new Date().toISOString().slice(0,10)+".json";
    document.body.appendChild(a);a.click();document.body.removeChild(a);
  }
  function restaurarBackup(e){
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{try{saveStore(JSON.parse(ev.target.result));alert("✅ Backup restaurado. Recarga la página.");}catch{alert("❌ Archivo inválido.");}};
    reader.readAsText(file);e.target.value="";
  }

  // ── CATÁLOGO ──────────────────────────────────────────────────────
  function guardarProducto(){
    if(!formCat.nombre||!formCat.precio)return;
    if(editCat){
      const idx=CATALOGO.findIndex(p=>p.id===editCat);
      if(idx>=0) CATALOGO[idx]={...CATALOGO[idx],nombre:formCat.nombre,precio:parseFloat(formCat.precio),cat:formCat.cat};
    } else {
      CATALOGO.push({id:"c"+uid(),nombre:formCat.nombre,precio:parseFloat(formCat.precio),cat:formCat.cat});
    }
    setCatItems(CATALOGO.map(p=>({...p})));
    setEditCat(null);setFormCat({nombre:"",precio:"",cat:"MDF"});flash("cat");
  }

  // ── CATÁLOGO MASIVO ───────────────────────────────────────────────
  function descargarCatalogo(){
    const filas=CATALOGO.map(p=>({"ID":p.id,"Nombre":p.nombre,"Categoría":p.cat,"Precio":p.precio}));
    descargarCSV(filas,"BPC_Catalogo.csv");
  }
  function cargarCatalogo(e){
    const file=e.target.files[0];if(!file)return;
    leerArchivoCSV(file,filas=>{
      let nuevos=0,actualizados=0,errores=0;
      filas.forEach(f=>{
        const nombre=(f["Nombre"]||"").trim();
        const precio=parseFloat(f["Precio"]);
        const cat=(f["Categoría"]||f["Categoria"]||"MDF").trim();
        if(!nombre||isNaN(precio)){errores++;return;}
        const idx=CATALOGO.findIndex(p=>p.nombre.toLowerCase()===nombre.toLowerCase());
        if(idx>=0){
          CATALOGO[idx]={...CATALOGO[idx],precio,cat};
          actualizados++;
        } else {
          CATALOGO.push({id:"csv_"+uid(),nombre,precio,cat});
          nuevos++;
        }
      });
      setCatItems(CATALOGO.map(p=>({...p})));
      flash("cat");
      alert("✅ Catálogo actualizado:\n• "+actualizados+" productos actualizados\n• "+nuevos+" productos nuevos\n• "+errores+" filas con error");
      e.target.value="";
    });
  }

  // ── USUARIOS ──────────────────────────────────────────────────────
  function ordenesActivasDeRol(rolViejo){
    const estados=ESTACIONES_POR_ROL[rolViejo];
    if(!estados) return [];
    return store.ventas.filter(v=>estados.includes(v.estado));
  }
  function abrirEditU(u){
    setEditU(u?{...u}:null);
    setFormU(u?{nombre:u.nombre,pin:u.pin,rol:u.rol,estacion:u.estacion}:{nombre:"",pin:"",rol:"vendedor",estacion:null});
    setWarn(null);
  }
  function guardarUsuario(){
    const rolInfo=ROLES.find(r=>r.rol===formU.rol)||ROLES[0];
    const nuevoU={...formU,estacion:rolInfo.estacion};
    if(editU){
      // Check if rol changed and has active orders
      if(editU.rol!==formU.rol){
        const activas=ordenesActivasDeRol(editU.rol);
        if(activas.length>0){
          setWarn({msg:"⚠️ "+editU.nombre+" tiene "+activas.length+" orden(es) activa(s) en su estación actual. Ciérralas antes de cambiar el rol.",folios:activas.map(v=>v.folio)});
          return;
        }
      }
      const nuevos=usrs.map(u=>u.id===editU.id?{...u,...nuevoU}:u);
      // Also update USUARIOS array in memory
      const idx=USUARIOS.findIndex(u=>u.id===editU.id);
      if(idx>=0) Object.assign(USUARIOS[idx],nuevoU);
      setUsrs(nuevos);saveUsuarios(nuevos);
    } else {
      if(!formU.nombre||formU.pin.length!==4){alert("Nombre y PIN de 4 dígitos requeridos.");return;}
      const newU={id:Date.now(),...nuevoU};
      const nuevos=[...usrs,newU];
      USUARIOS.push(newU);
      setUsrs(nuevos);saveUsuarios(nuevos);
    }
    setEditU(undefined);setWarn(null);flash("usr");
  }
  function eliminarUsuario(u){
    if(!confirm("¿Eliminar a "+u.nombre+"? Esta acción no se puede deshacer.")) return;
    const activas=ordenesActivasDeRol(u.rol);
    if(activas.length>0){alert("No puedes eliminar a "+u.nombre+" — tiene "+activas.length+" orden(es) activa(s).");return;}
    const nuevos=usrs.filter(x=>x.id!==u.id);
    const idx=USUARIOS.findIndex(x=>x.id===u.id);
    if(idx>=0) USUARIOS.splice(idx,1);
    setUsrs(nuevos);saveUsuarios(nuevos);flash("usr");
  }

  const tabs=[{id:"exportar",l:"📤 Exportar"},{id:"catalogo",l:"📦 Catálogo"},{id:"usuarios",l:"👤 Usuarios"},{id:"precios",l:"💰 Precios Compra"},{id:"backup",l:"💾 Backup"}];

  return <div className="fu" style={{display:"flex",flexDirection:"column",gap:14}}>
  <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:24}}>⚙️ Administración</h2>
  <div style={{display:"flex",borderBottom:"1px solid "+G.border,background:G.surface,borderRadius:"10px 10px 0 0",overflow:"hidden"}}>
  {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"11px 18px",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,color:tab===t.id?G.accent:G.muted,borderBottom:tab===t.id?"2px solid "+G.accent:"2px solid transparent",flex:1}}>{t.l}</button>)}
  </div>

  {tab==="exportar"&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
  <p style={{color:G.muted,fontSize:13}}>Descarga tus datos en formato CSV — abre directo en Excel.</p>
  <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
  {[{i:"🧾",t:"Historial de Ventas",d:"Todas las órdenes con detalle de líneas.",fn:exportVentas,c:"#f59e0b"},
    {i:"📦",t:"Catálogo de Productos",d:"Productos con categoría y precio actual.",fn:exportCatalogo,c:"#38bdf8"},
    {i:"🗃️",t:"Inventario Actual",d:"Stock actual vs mínimo por producto.",fn:exportInventario,c:"#34d399"},
    {i:"👥",t:"Clientes",d:"Lista con total histórico comprado.",fn:exportClientes,c:"#a78bfa"},
  ].map(item=><Card key={item.t} style={{padding:18}}>
    <div style={{fontSize:28,marginBottom:8}}>{item.i}</div>
    <div style={{fontWeight:700,fontSize:15,marginBottom:4,color:item.c}}>{item.t}</div>
    <div style={{fontSize:12,color:G.muted,marginBottom:14,lineHeight:1.5}}>{item.d}</div>
    <Btn v="sec" onClick={item.fn} full>⬇️ Descargar</Btn>
  </Card>)}
  </div>
  </div>}

  {tab==="catalogo"&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
  <Card style={{padding:14}}>
  <p style={{fontSize:11,fontWeight:700,color:G.muted,marginBottom:10}}>{editCat?"EDITAR PRODUCTO":"AGREGAR PRODUCTO NUEVO"}</p>
  <div style={{display:"grid",gridTemplateColumns:"1fr 110px 130px",gap:10,alignItems:"end"}}>
  <Inp label="Nombre" value={formCat.nombre} onChange={v=>setFormCat(f=>({...f,nombre:v}))} placeholder="Ej: Triplay Pino 18MM"/>
  <Inp label="Precio $" type="number" value={formCat.precio} onChange={v=>setFormCat(f=>({...f,precio:v}))} placeholder="0"/>
  <Sel label="Categoría" value={formCat.cat} onChange={v=>setFormCat(f=>({...f,cat:v}))} options={CATS}/>
  </div>
  <div style={{display:"flex",gap:8,marginTop:10,alignItems:"center"}}>
  <Btn v="pri" onClick={guardarProducto} disabled={!formCat.nombre||!formCat.precio}>{editCat?"💾 Guardar cambios":"➕ Agregar"}</Btn>
  {editCat&&<Btn v="ghost" onClick={()=>{setEditCat(null);setFormCat({nombre:"",precio:"",cat:"MDF"});}}>Cancelar</Btn>}
  {saved==="cat"&&<span style={{color:"#34d399",fontWeight:600,fontSize:13}}>✓ Guardado</span>}
  </div>
  </Card>
  <Card style={{padding:14,borderColor:"#38bdf840"}}>
  <p style={{fontSize:11,fontWeight:700,color:G.muted,marginBottom:10,letterSpacing:.8}}>📥 CARGA MASIVA — EXCEL/CSV</p>
  <div style={{display:"flex",gap:10,alignItems:"flex-start",flexWrap:"wrap"}}>
  <Btn v="sec" onClick={descargarCatalogo}>⬇️ Descargar catálogo actual</Btn>
  <div style={{display:"flex",flexDirection:"column",gap:6}}>
  <label style={{fontSize:12,color:G.muted}}>Sube el CSV editado para actualizar precios o agregar productos:</label>
  <input type="file" accept=".csv" onChange={cargarCatalogo} style={{color:G.text,fontSize:13,cursor:"pointer"}}/>
  </div>
  </div>
  <div style={{marginTop:8,fontSize:11,color:"#57534e",lineHeight:1.6}}>💡 Descarga → edita en Excel → guarda como CSV → sube aquí. Los existentes se actualizan, los nuevos se agregan.</div>
  </Card>
  <Card>
  <div style={{padding:"10px 14px",borderBottom:"1px solid "+G.border,fontSize:11,fontWeight:700,color:G.muted}}>CATÁLOGO ({catItems.length} productos)</div>
  <div style={{overflowX:"auto",maxHeight:420,overflowY:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
  <thead style={{position:"sticky",top:0,zIndex:1}}><tr style={{background:G.surface2}}>
  {["Nombre","Categoría","Precio",""].map(h=><th key={h} style={{padding:"9px 13px",textAlign:"left",fontSize:11,fontWeight:700,color:G.muted}}>{h}</th>)}
  </tr></thead>
  <tbody>{catItems.map(p=>{
    const editing=editCat===p.id;
    const CATS=["MDF","Melamina","Enchapado","Premium","Especial","Servicios","PVC"];
    return <tr key={p.id} style={{borderBottom:"1px solid "+G.border+"40",background:editing?G.accent+"15":""}}>
    <td style={{padding:"8px 13px"}}>
      {editing
        ? <input value={formCat.nombre} onChange={e=>setFormCat(f=>({...f,nombre:e.target.value}))} style={{...inp,fontSize:12,padding:"5px 8px"}}/> : <span style={{fontWeight:600}}>{p.nombre}</span>}
    </td>
    <td style={{padding:"8px 13px"}}>
      {editing
        ? <select value={formCat.cat} onChange={e=>setFormCat(f=>({...f,cat:e.target.value}))} style={{...inp,fontSize:12,padding:"5px 8px",width:"auto"}}>{CATS.map(cat=><option key={cat} value={cat}>{cat}</option>)}</select> : <Tag color="#38bdf8">{p.cat}</Tag>}
    </td>
    <td style={{padding:"8px 13px"}}>
      {editing
        ? <input type="number" value={formCat.precio} onChange={e=>setFormCat(f=>({...f,precio:e.target.value}))} style={{...inp,fontSize:12,padding:"5px 8px",width:100,textAlign:"right"}}/> : <span style={{fontWeight:700,color:G.accent}}>{$$(p.precio)}</span>}
    </td>
    <td style={{padding:"8px 13px"}}>
      <div style={{display:"flex",gap:6}}>
      {editing ? <>
        <Btn v="ok" size="sm" onClick={guardarProducto}>💾 Guardar</Btn>
        <Btn v="ghost" size="sm" onClick={()=>{setEditCat(null);setFormCat({nombre:"",precio:"",cat:"MDF"});}}>✕</Btn>
      </> : <>
        <Btn v="sec" size="sm" onClick={()=>{setEditCat(p.id);setFormCat({nombre:p.nombre,precio:String(p.precio),cat:p.cat});}}>✏️ Editar</Btn>
        <Btn v="warn" size="sm" onClick={()=>{if(window.confirm("¿Eliminar "+p.nombre+"?")){{const idx=CATALOGO.findIndex(x=>x.id===p.id);if(idx>=0)CATALOGO.splice(idx,1);setCatItems(CATALOGO.map(x=>({...x})));flash("cat");}}}}>🗑️</Btn>
      </>}
      </div>
    </td>
    </tr>;
  })}</tbody>
  </table></div>
  {saved==="cat"&&<div style={{padding:"8px 14px",borderTop:"1px solid "+G.border,fontSize:12,color:"#34d399",fontWeight:600}}>✓ Cambios guardados</div>}
  </Card>
  </div>}

  {tab==="usuarios"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
  {warn&&<div style={{background:"#dc262620",border:"1px solid #dc262644",borderRadius:10,padding:14}}>
  <div style={{fontWeight:700,color:"#f87171",marginBottom:6}}>{warn.msg}</div>
  <div style={{fontSize:12,color:G.muted}}>Folios activos: {warn.folios.join(", ")}</div>
  <Btn v="ghost" size="sm" onClick={()=>setWarn(null)} style={{marginTop:8}}>Entendido</Btn>
  </div>}
  {saved==="usr"&&<div style={{background:"#34d39920",border:"1px solid #34d39944",borderRadius:8,padding:"8px 14px",fontSize:13,color:"#34d399",fontWeight:600}}>✓ Usuario guardado</div>}
  <Card style={{padding:14}}>
  <p style={{fontSize:11,fontWeight:700,color:G.muted,marginBottom:10}}>{editU===null?"NUEVO USUARIO":editU?"EDITAR USUARIO":""}</p>
  {(editU===null||editU)&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
  <div style={{display:"grid",gridTemplateColumns:"1fr 110px",gap:10}}>
  <Inp label="Nombre" value={formU.nombre} onChange={v=>setFormU(f=>({...f,nombre:v}))} placeholder="Nombre del usuario"/>
  <Inp label="PIN (4 dígitos)" type="number" value={formU.pin} onChange={v=>setFormU(f=>({...f,pin:v.slice(0,4)}))} placeholder="0000"/>
  </div>
  <Sel label="Rol" value={formU.rol} onChange={v=>setFormU(f=>({...f,rol:v}))} options={ROLES.map(r=>({v:r.rol,l:r.label}))}/>
  <div style={{display:"flex",gap:8,alignItems:"center"}}>
  <Btn v="pri" onClick={guardarUsuario} disabled={!formU.nombre||formU.pin.length!==4}>{editU?"💾 Guardar cambios":"➕ Agregar usuario"}</Btn>
  <Btn v="ghost" onClick={()=>abrirEditU(undefined)}>Cancelar</Btn>
  </div>
  </div>}
  {editU===undefined&&<Btn v="ok" onClick={()=>abrirEditU(null)}>+ Nuevo usuario</Btn>}
  </Card>
  {usrs.map(u=>{
  const activas=ordenesActivasDeRol(u.rol).length;
  return <Card key={u.id} style={{padding:14,borderColor:editU&&editU.id===u.id?G.accent+"60":G.border}}>
  <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
  <div style={{flex:1,minWidth:140}}>
  <div style={{fontWeight:700,fontSize:15}}>{u.nombre}</div>
  <div style={{fontSize:12,color:G.muted}}>{(ROLES.find(r=>r.rol===u.rol)||{label:u.rol}).label} {u.estacion?"· "+u.estacion:""}</div>
  {activas>0&&<Tag color="#f87171" style={{marginTop:4}}>{activas} orden(es) activa(s)</Tag>}
  </div>
  <div style={{fontFamily:"monospace",background:G.surface2,padding:"6px 14px",borderRadius:8,fontSize:16,letterSpacing:4,color:G.accent}}>{u.pin}</div>
  <div style={{display:"flex",gap:6}}>
  <Btn v="sec" size="sm" onClick={()=>abrirEditU(u)}>✏️ Editar</Btn>
  {u.rol!=="admin"&&<Btn v="warn" size="sm" onClick={()=>eliminarUsuario(u)}>🗑️</Btn>}
  </div>
  </div>
  </Card>;
  })}
  </div>}

  {tab==="precios"&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
  <p style={{fontSize:12,color:"#f87171",fontWeight:600}}>🔒 Información confidencial — solo Admin</p>
  <Card style={{padding:14}}>
    <p style={{fontSize:11,fontWeight:700,color:G.muted,marginBottom:10,letterSpacing:.8}}>CARGA MASIVA CSV</p>
    <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
      <Btn v="sec" onClick={()=>{const filas=(store.inventario||[]).map(p=>({ID:p.id,Nombre:p.nombre,PrecioCompra:preciosCompra[p.id]||""}));descargarCSV(filas,"BPC_PreciosCompra.csv");}}>⬇️ Descargar plantilla</Btn>
      <div>
        <div style={{fontSize:12,color:G.muted,marginBottom:4}}>Sube CSV con precios llenados:</div>
        <input type="file" accept=".csv" onChange={e=>{const file=e.target.files[0];if(!file)return;leerArchivoCSV(file,filas=>{const s=loadStore();if(!s)return;const np={...(s.preciosCompra||{})};let n=0;filas.forEach(f=>{const id=(f["ID"]||"").trim();const v=parseFloat(f["PrecioCompra"]);if(id&&!isNaN(v)&&v>=0){np[id]=v;n++;}});saveStore({...s,preciosCompra:np});alert("Actualizados: "+n+" precios");e.target.value="";});}} style={{color:G.text,fontSize:13}}/>
      </div>
    </div>
  </Card>
  <Card>
    <div style={{padding:"10px 14px",borderBottom:"1px solid "+G.border,fontSize:11,fontWeight:700,color:G.muted}}>PRECIOS DE COMPRA</div>
    <div style={{overflowX:"auto",maxHeight:400,overflowY:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
      <thead><tr style={{background:G.surface2}}><th style={{padding:"8px 13px",textAlign:"left",fontSize:11,fontWeight:700,color:G.muted}}>Producto</th><th style={{padding:"8px 13px",textAlign:"left",fontSize:11,fontWeight:700,color:G.muted}}>P.Venta</th><th style={{padding:"8px 13px",textAlign:"left",fontSize:11,fontWeight:700,color:G.muted}}>P.Compra</th><th style={{padding:"8px 13px",textAlign:"left",fontSize:11,fontWeight:700,color:G.muted}}>Margen</th></tr></thead>
      <tbody>{(store.inventario||[]).map(p=>{
        const cat=CATALOGO.find(x=>x.id===p.id);
        const pv=cat?cat.precio:0;
        const pc=precEdits[p.id]!==undefined?parseFloat(precEdits[p.id])||0:(preciosCompra[p.id]||0);
        const mg=pc>0&&pv>0?Math.round(((pv-pc)/pv)*100):null;
        return <tr key={p.id} style={{borderBottom:"1px solid "+G.border+"40"}}>
          <td style={{padding:"7px 13px",fontWeight:600,fontSize:12}}>{p.nombre}</td>
          <td style={{padding:"7px 13px",color:G.accent,fontWeight:700}}>{$$(pv)}</td>
          <td style={{padding:"7px 13px"}}><input type="number" min="0" value={precEdits[p.id]!==undefined?precEdits[p.id]:(preciosCompra[p.id]||"")} onChange={e=>setPrecEdits(prev=>({...prev,[p.id]:e.target.value}))} placeholder="0" style={{...inp,width:90,fontSize:12,padding:"4px 7px",textAlign:"right"}}/></td>
          <td style={{padding:"7px 13px"}}>{mg!==null?<Tag color={mg>=40?"#34d399":mg>=20?"#facc15":"#f87171"}>{mg}%</Tag>:<span style={{color:"#44403c"}}>—</span>}</td>
        </tr>;
      })}</tbody>
    </table></div>
    {Object.keys(precEdits).length>0&&<div style={{padding:"10px 14px",borderTop:"1px solid "+G.border,display:"flex",gap:8,justifyContent:"flex-end",alignItems:"center"}}>
      {precGuardado&&<Tag color="#34d399">✓ Guardado</Tag>}
      <Btn v="pri" onClick={()=>{const s=loadStore();if(!s)return;const np={...(s.preciosCompra||{})};Object.keys(precEdits).forEach(id=>{const v=parseFloat(precEdits[id]);if(!isNaN(v)&&v>=0)np[id]=v;});saveStore({...s,preciosCompra:np});setPrecEdits({});setPrecGuardado(true);setTimeout(()=>setPrecGuardado(false),2000);}}>💾 Guardar</Btn>
    </div>}
  </Card>
  </div>}
  {tab==="backup"&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
  <Card style={{padding:18}}>
  <div style={{fontSize:28,marginBottom:8}}>💾</div>
  <div style={{fontWeight:700,fontSize:15,color:"#34d399",marginBottom:4}}>Backup completo (JSON)</div>
  <div style={{fontSize:13,color:G.muted,marginBottom:14,lineHeight:1.6}}>Descarga todos tus datos — ventas, clientes, inventario, usuarios y configuración.</div>
  <Btn v="ok" onClick={backupJSON}>⬇️ Descargar backup</Btn>
  </Card>
  <Card style={{padding:18}}>
  <div style={{fontSize:28,marginBottom:8}}>📂</div>
  <div style={{fontWeight:700,fontSize:15,color:"#f87171",marginBottom:4}}>Restaurar backup</div>
  <div style={{fontSize:13,color:G.muted,marginBottom:14,lineHeight:1.6}}>⚠️ Reemplazará TODOS los datos actuales. Solo usar si perdiste datos.</div>
  <input type="file" accept=".json" onChange={restaurarBackup} style={{color:G.text,fontSize:13,cursor:"pointer"}}/>
  </Card>
  </div>}

  </div>;
}




function PantallaInventario({usuario, onLogout}) {
  const [seccion, setSeccion] = useState("inventario");
  const [store, setStore] = useState(()=>loadStore()||{ventas:[],inventario:[],recepciones:[],cierresMes:[],preciosCompra:{}});

  useEffect(()=>{
    function refresh(){ const s=loadStore(); if(s) setStore(s); }
    refresh();
    const iv = setInterval(refresh, 2000);
    return ()=>clearInterval(iv);
  },[]);

  const pendAprobaciones = contarPendientes(store, usuario);

  const navItems = [
    {id:"inventario", l:"📦 Inventario", color:"#fb923c"},
    {id:"recepciones", l:"📥 Recepciones", color:"#38bdf8"},
    {id:"cierre", l:"📊 Cierre de Mes", color:G.accent},
    {id:"aprobaciones", l:"✅ Aprobaciones", color:"#34d399"},
  ];

  function renderSeccion(){
    switch(seccion){
      case "inventario":  return <Inventario store={store} onUpdate={inv=>{ const s=loadStore();if(s){saveStore({...s,inventario:inv});setStore({...s,inventario:inv});} }}/>;
      case "recepciones": return <Recepciones store={store} usuario={usuario} onUpdate={()=>setStore(loadStore())}/>;
      case "cierre":      return <CierreMes store={store} usuario={usuario} onUpdate={()=>setStore(loadStore())}/>;
      case "aprobaciones":return <Aprobaciones store={store} usuario={usuario} onUpdate={()=>setStore(loadStore())}/>;
      default: return null;
    }
  }

  return <div style={{minHeight:"100vh",background:G.bg,display:"flex"}}>
    <style>{globalCSS}</style>
    <aside style={{width:200,background:G.surface,borderRight:"1px solid "+G.border,display:"flex",flexDirection:"column",padding:14,gap:4,flexShrink:0}}>
      <div style={{padding:"6px 6px 14px"}}>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:26,color:G.accent,lineHeight:1}}>BPC</div>
        <div style={{fontSize:10,color:"#44403c",letterSpacing:3,marginTop:2}}>INVENTARIO</div>
      </div>
      {navItems.map(n=>{
        const active = seccion===n.id;
        const badge = n.id==="aprobaciones" && pendAprobaciones>0 ? pendAprobaciones : 0;
        return <button key={n.id} onClick={()=>setSeccion(n.id)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"inherit",background:active?n.color+"22":"transparent",color:active?n.color:G.muted,borderLeft:active?"3px solid "+n.color:"3px solid transparent",transition:"all .15s"}}>
          <span>{n.l}</span>
          {badge>0&&!active&&<span style={{background:"#dc2626",color:"white",borderRadius:10,padding:"1px 7px",fontSize:11,fontWeight:800}}>{badge}</span>}
        </button>;
      })}
      <div style={{marginTop:"auto",paddingTop:12,borderTop:"1px solid "+G.border}}>
        <div style={{fontSize:12,color:G.muted,padding:"0 6px",marginBottom:4}}>{usuario.nombre}</div>
        <button onClick={onLogout} style={{background:"none",border:"none",color:"#44403c",fontSize:12,cursor:"pointer",padding:"4px 6px",fontFamily:"inherit",width:"100%",textAlign:"left"}} onMouseEnter={e=>e.currentTarget.style.color=G.muted} onMouseLeave={e=>e.currentTarget.style.color="#44403c"}>Cerrar sesión →</button>
      </div>
    </aside>
    <main style={{flex:1,overflow:"auto",padding:22}}>
      <div style={{maxWidth:1080,margin:"0 auto"}}>{renderSeccion()}</div>
    </main>
  </div>;
}

export default function App() {
  const [usuario,setUsuario]=useState(null);const [store,setStore]=useState(null);const [seccion,setSeccion]=useState("dashboard");const [ventaAct,setVA]=useState(null);const [modoNew,setNew]=useState(false);
  useEffect(()=>{setStore(initStore());},[]);
  useEffect(()=>{if(!usuario)return;const iv=setInterval(()=>{const s=loadStore();if(s)setStore(s);},2000);return()=>clearInterval(iv);},[usuario]);
  function mutate(fn){setStore(prev=>{const next=fn(prev);saveStore(next);return next;});}
  function onLogin(u){setUsuario(u);const defaults={admin:"dashboard",vendedor:"ventas",almacen:"inventario"};setSeccion(defaults[u.rol]||"dashboard");setVA(null);setNew(false);}
  function onNuevaVenta(venta,clienteNombre,clienteId){playCashRegister();mutate(s=>{const nuevasVentas=[...s.ventas,venta];const yaExiste=s.clientes.find(c=>c.id===clienteId||c.nombre===clienteNombre);const nuevosClientes=yaExiste?s.clientes:[...s.clientes,{id:uid(),nombre:clienteNombre,tel:"",email:"",notas:""}];return{...s,ventas:nuevasVentas,clientes:nuevosClientes,folioActual:s.folioActual+1};});setNew(false);setSeccion("ventas");}
  function onUpdateVenta(venta){mutate(s=>({...s,ventas:s.ventas.map(v=>v.folio===venta.folio?venta:v)}));setVA(venta);}
  function onAvanzar(venta){if(venta.estado==="cotizacion")playProductionSound();mutate(s=>{const sig=siguienteEstadoOrden(venta.estado,venta.lineas);const updated={...venta,estado:sig,historial:[...venta.historial,{estado:sig,ts:new Date().toISOString(),quien:usuario.nombre}]};return{...s,ventas:s.ventas.map(v=>v.folio===venta.folio?updated:v)};});}
  function onRevertir(venta){
    const s=loadStore();if(!s)return;
    const prev=estadoAnterior(venta);if(!prev)return;
    const ts=new Date().toISOString();
    let nuevoInv=s.inventario;
    if(venta.estado==="surtir"){
      nuevoInv=s.inventario.map(item=>{const linea=venta.lineas.find(l=>l.nombre===item.nombre&&!l.clienteMat);if(linea)return{...item,stock:item.stock+linea.cant};return item;});
    }
    const nuevasVentas=s.ventas.map(v=>v.folio===venta.folio?{...v,estado:prev,recibidoEnPiso:prev==="surtir"?null:v.recibidoEnPiso,historial:[...v.historial,{estado:prev,ts,quien:usuario.nombre+" (revirtió)"}]}:v);
    mutate(()=>({...s,ventas:nuevasVentas,inventario:nuevoInv}));
  }
  function onUpdateClientes(clts){mutate(s=>({...s,clientes:clts}));}
  function onUpdateInv(inv){mutate(s=>({...s,inventario:inv}));}
  function onUpdateConfig(cfg){mutate(s=>({...s,config:cfg}));}

  if(!store)return <div style={{minHeight:"100vh",background:"#0c0a09"}}/>;
  if(!usuario)return <Login onLogin={onLogin}/>;
  if(usuario.estacion==="surtir")return <PantallaSurtido usuario={usuario} onLogout={()=>setUsuario(null)}/>;
  if(usuario.estacion==="corte"||usuario.estacion==="enchape")return <PantallaOperario usuario={usuario} onLogout={()=>setUsuario(null)}/>;
  if(usuario.estacion==="entrega")return <PantallaEntrega usuario={usuario} onLogout={()=>setUsuario(null)}/>;
  if(usuario.rol==="inventario")return <PantallaInventario usuario={usuario} onLogout={()=>setUsuario(null)}/>;

  const NAV={
    admin:[{id:"dashboard",l:"Dashboard",i:"📊"},{id:"ventas",l:"Ventas",i:"🧾"},{id:"kanban",l:"Tablero",i:"🗂️"},{id:"clientes",l:"Clientes",i:"👤"},{id:"caja",l:"Caja",i:"💰"},{id:"inventario",l:"Inventario",i:"📦"},{id:"config",l:"Configuración",i:"⚙️"},{id:"admin_tools",l:"Administración",i:"🔧"},{id:"aprobaciones",l:"Aprobaciones",i:"✅"},{id:"recepciones",l:"Recepciones",i:"📥"},{id:"cierre_mes",l:"Cierre de Mes",i:"📊"},{id:"mando",l:"Centro de Mando",i:"📊"}],
    vendedor:[{id:"ventas",l:"Ventas",i:"🧾"},{id:"tablero",l:"Mis Órdenes",i:"📍"},{id:"clientes",l:"Clientes",i:"👤"},{id:"caja",l:"Caja",i:"💰"},{id:"buscador",l:"Buscar Órdenes",i:"🔍"},{id:"aprobaciones",l:"Aprobaciones",i:"✅"},{id:"mando",l:"Centro de Mando",i:"📊"}],
    almacen:[{id:"inventario",l:"Inventario",i:"📦"},{id:"recepciones",l:"Recepciones",i:"📥"},{id:"cierre_mes",l:"Cierre de Mes",i:"📊"},{id:"aprobaciones",l:"Aprobaciones",i:"✅"}],
  };
  const navItems=NAV[usuario.rol]||[];

  function renderMain(){
    if(modoNew)return <NuevaCotizacion store={store} usuario={usuario} onSave={onNuevaVenta} onCancel={()=>setNew(false)}/>;
    if(ventaAct)return <DetalleVenta venta={ventaAct} onClose={()=>setVA(null)} onUpdate={onUpdateVenta} usuario={usuario}/>;
    switch(seccion){
      case "dashboard":   return <Dashboard store={store} usuario={usuario}/>;
      case "ventas":      return <ListaVentas store={store} onNueva={()=>{setVA(null);setNew(true);}} onVer={v=>{setVA(v);setNew(false);}} onAvanzar={onAvanzar} onRevertir={onRevertir} usuario={usuario}/>;
      case "kanban":      return <Kanban onAvanzar={onAvanzar}/>;
      case "tablero":     return <TableroVendedor store={store} usuario={usuario}/>;
      case "clientes":    return usuario.rol==="admin" ? <Clientes store={store} onUpdate={onUpdateClientes}/> : <ClientesVendedor store={store} usuario={usuario}/>;
      case "caja":        return <CierreCaja store={store}/>;
      case "buscador":    return <BuscadorOrdenes store={store} usuario={usuario}/>;
      case "inventario":  return <Inventario store={store} onUpdate={onUpdateInv}/>;
      case "recepciones": return <Recepciones store={store} usuario={usuario} onUpdate={()=>setStore(loadStore())}/>;
      case "cierre_mes":  return <CierreMes store={store} usuario={usuario} onUpdate={()=>setStore(loadStore())}/>;
      case "aprobaciones":return <Aprobaciones store={store} usuario={usuario} onUpdate={()=>setStore(loadStore())}/>;
      case "config":      return <Configuracion store={store} onUpdate={onUpdateConfig}/>;
      case "admin_tools": return <AdminTools store={store} onUpdateStore={()=>setStore(loadStore())}/>
      case "mando":       return <CentroMando store={store} usuario={usuario}/>;
      default: return null;
    }
  }

  return <div style={{minHeight:"100vh",background:G.bg,display:"flex"}}>
  <style>{globalCSS}</style>
  <aside style={{width:190,background:G.surface,borderRight:"1px solid "+G.border,display:"flex",flexDirection:"column",padding:14,gap:3,flexShrink:0}}>
  <div style={{padding:"6px 6px 14px"}}><div style={{fontFamily:"'DM Serif Display',serif",fontSize:28,color:G.accent,lineHeight:1}}>BPC</div><div style={{fontSize:10,color:"#44403c",letterSpacing:3,marginTop:2}}>ERP v3</div></div>
  {navItems.map(n=>{const active=seccion===n.id&&!ventaAct&&!modoNew;const badge=n.id==="aprobaciones"?contarPendientes(store,usuario):0;return <button key={n.id} onClick={()=>{setSeccion(n.id);setVA(null);setNew(false);}} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 11px",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit",textAlign:"left",transition:"all .15s",background:active?G.accent:"transparent",color:active?"#1c1917":G.muted,width:"100%",justifyContent:"space-between"}}><span>{n.i} {n.l}</span>{badge>0&&!active&&<span style={{background:"#dc2626",color:"white",borderRadius:10,padding:"1px 7px",fontSize:11,fontWeight:800}}>{badge}</span>}</button>;})}
  <div style={{marginTop:"auto",paddingTop:12,borderTop:"1px solid "+G.border}}>
  <div style={{fontSize:12,color:G.muted,padding:"0 6px"}}>{usuario.nombre}</div>
  <button onClick={()=>setUsuario(null)} style={{background:"none",border:"none",color:"#44403c",fontSize:12,cursor:"pointer",padding:"4px 6px",fontFamily:"inherit",width:"100%",textAlign:"left",marginTop:4}} onMouseEnter={e=>e.currentTarget.style.color=G.muted} onMouseLeave={e=>e.currentTarget.style.color="#44403c"}>Cerrar sesión →</button>
  </div>
  </aside>
  <main style={{flex:1,overflow:"auto",padding:22}}><div style={{maxWidth:1080,margin:"0 auto"}}>{renderMain()}</div></main>
  </div>;
}
