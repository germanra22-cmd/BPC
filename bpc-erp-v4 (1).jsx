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
];

function flujoIdx(id) { return FLUJO.findIndex(f => f.id === id); }
function flujoInfo(id) { return FLUJO.find(f => f.id === id) || FLUJO[0]; }

const NOMBRES_CORTE  = ["servicio corte","corte"];
const NOMBRES_ENCHAPE = ["servicio instalacion pvc","servicio instalacion","enchape","brojar","huecos para visgra"];
function getNombre(l){ return (l.prod?.nombre||l.nombre||"").toLowerCase(); }
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

function initStore() {
  const ex = loadStore();
  if (ex) {
  if (!ex.config) ex.config = { razonSocial:"BPC Maderas y Tableros",rfc:"",direccion:"",telefono:"",email:"",web:"",notas:"Precios sujetos a cambio sin previo aviso." };
  return ex;
  }
  const s = {
  ventas:[], folioActual:1000,
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
  style={{display:"inline-flex",alignItems:"center",gap:6,padding:sz[size],fontSize:fz[size],fontWeight:700,borderRadius:9,cursor:disabled?"not-allowed":"pointer",opacity:disabled?.4:1,transition:"filter .15s",width:full?"100%":undefined,justifyContent:full?"center":undefined,...vs[v],...style}}
  onMouseEnter={e=>!disabled&&(e.currentTarget.style.filter="brightness(1.1)")}
  onMouseLeave={e=>e.currentTarget.style.filter=""}>
  {children}
  </button>;
}
function Card({children,style={}}) { return <div style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:13,...style}}>{children}</div>; }
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
  const clienteNombre=store.clientes.find(c=>c.id===clienteId)?.nombre||clienteNew;
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
  historial:[{estado:"cotizacion",ts:new Date().toISOString(),quien:usuario.nombre}]},clienteNombre,clienteId);
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
  <input value={buscando===l.id?query:(l.prod?.nombre||"")} onChange={e=>{setQuery(e.target.value);setBuscando(l.id);}}
  onFocus={()=>{setBuscando(l.id);setQuery(l.prod?.nombre||"");}} onBlur={()=>setTimeout(()=>setBuscando(null),200)}
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
function DetalleVenta({venta,onClose,onUpdate}) {
  const [pagado,setPagado]=useState(venta.pagado);
  const [estado,setEstado]=useState(venta.estado);
  const [asigCorte,setAsigCorte]=useState(venta.asigCorte||"");
  const [asigEnchape,setAsigEnchape]=useState(venta.asigEnchape||"");
  function guardar(){onUpdate({...venta,pagado,estado,asigCorte:asigCorte||null,asigEnchape:asigEnchape||null,historial:[...venta.historial,{estado,ts:new Date().toISOString(),quien:"Admin (edición manual)"}]});}
  return <div className="fu" style={{display:"flex",flexDirection:"column",gap:14}}>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
  <div><h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:22}}>Cotización <span style={{color:G.accent}}>#{venta.folio}</span></h2><span style={{color:G.muted,fontSize:12}}>{fmtFecha(venta.fecha)} · {venta.vendedor}</span></div>
  <div style={{display:"flex",gap:8}}>
  <Btn v="sec" onClick={()=>{const s=loadStore();generarPDF(venta,s?.config||{});}}>🖨️ PDF</Btn>
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
  {venta.firma&&<div style={{background:"#f0fdf420",border:"1px solid #86efac44",borderRadius:8,padding:10}}>
  <div style={{fontSize:11,fontWeight:700,color:"#34d399",marginBottom:6}}>✅ FIRMA DE RECIBIDO</div>
  <img src={venta.firma} style={{maxWidth:"100%",maxHeight:80,borderRadius:4}}/>
  <div style={{fontSize:11,color:"#34d399",marginTop:4}}>{fmtFecha(venta.firmaTs)} {fmtHora(venta.firmaTs)}hrs</div>
  </div>}
  <Divider/>
  <AsignacionSelector lineas={venta.lineas} asigCorte={asigCorte} asigEnchape={asigEnchape} onCorte={setAsigCorte} onEnchape={setAsigEnchape}/>
  <Sel label="Estado" value={estado} onChange={setEstado} options={FLUJO.map(f=>({v:f.id,l:`${f.icon} ${f.label}`}))}/>
  <label style={{display:"flex",gap:8,alignItems:"center",cursor:"pointer",fontSize:13}}><input type="checkbox" checked={pagado} onChange={e=>setPagado(e.target.checked)} style={{accentColor:G.accent,width:16,height:16}}/>Pagado</label>
  <Btn v="pri" onClick={guardar} full>Guardar cambios</Btn>
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

function ListaVentas({store,onNueva,onVer,onAvanzar}) {
  const [filtro,setFiltro]=useState(""); const [estFiltro,setEstFiltro]=useState("");
  const ventas=store.ventas;
  const filtradas=ventas.filter(v=>(!filtro||v.cliente.toLowerCase().includes(filtro.toLowerCase())||String(v.folio).includes(filtro))&&(!estFiltro||v.estado===estFiltro)).sort((a,b)=>b.folio-a.folio);
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
  <td style={{padding:"9px 13px",fontFamily:"monospace",color:G.accent,fontWeight:700}}>#{v.folio}</td>
  <td style={{padding:"9px 13px",fontWeight:600}}>{v.cliente}</td>
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
  <td style={{padding:"9px 13px"}}><div style={{display:"flex",gap:6}}><Btn v="sec" size="sm" onClick={()=>onVer(v)}>Ver</Btn>{v.estado==="cotizacion"&&<Btn v="ok" size="sm" onClick={()=>onAvanzar(v)}>Confirmar ✓</Btn>}</div></td>
  </tr>)}</tbody>
  </table></div>}
  </Card>
  </div>;
}

function Kanban({onAvanzar}) {
  const [ventas,setVentas]=useState(()=>loadStore()?.ventas||[]);
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
  <span style={{fontFamily:"monospace",color:col.color,fontSize:12,fontWeight:700}}>#{v.folio}</span>
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
  const [ventas,setVentas]=useState([]);const [confirm,setConfirm]=useState(null);
  const estacion=usuario.estacion;const fi=flujoInfo(estacion);
  useEffect(()=>{
  function refresh(){
  const s=loadStore();if(!s)return;
  const todas=s.ventas.filter(v=>v.estado===estacion);
  const campo=estacion==="corte"?"asigCorte":"asigEnchape";
  const mias=todas.filter(v=>v[campo]===usuario.nombre);
  const sinAsig=todas.filter(v=>!v[campo]);
  setVentas([...mias,...sinAsig.filter(v=>!mias.find(m=>m.folio===v.folio))]);
  }
  refresh();const iv=setInterval(refresh,2000);return()=>clearInterval(iv);
  },[estacion,usuario.nombre]);
  function terminar(venta){
  const s=loadStore();if(!s)return;
  const sig=siguienteEstadoOrden(venta.estado,venta.lineas);
  saveStore({...s,ventas:s.ventas.map(v=>v.folio===venta.folio?{...v,estado:sig,historial:[...v.historial,{estado:sig,ts:new Date().toISOString(),quien:usuario.nombre}]}:v)});
  setVentas(prev=>prev.filter(v=>v.folio!==venta.folio));setConfirm(null);
  }
  return <div style={{minHeight:"100vh",background:G.bg,display:"flex",flexDirection:"column"}}>
  <style>{globalCSS}</style>
  <div style={{background:G.surface,borderBottom:`1px solid ${G.border}`,padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
  <div><div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:fi.color}}>{fi.icon} {fi.label}</div><div style={{fontSize:12,color:G.muted}}>{usuario.nombre}</div></div>
  <div style={{display:"flex",gap:12,alignItems:"center"}}><div style={{textAlign:"right"}}><div style={{fontSize:28,fontWeight:800,color:fi.color}}>{ventas.length}</div><div style={{fontSize:11,color:G.muted}}>pendientes</div></div><Btn v="ghost" size="sm" onClick={onLogout}>Salir</Btn></div>
  </div>
  <div style={{flex:1,padding:16,display:"flex",flexDirection:"column",gap:12,overflowY:"auto"}}>
  {ventas.length===0?<div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,paddingTop:60}}><div style={{fontSize:60}}>✅</div><p style={{fontSize:20,fontWeight:700,color:"#34d399"}}>¡Todo al corriente!</p><p style={{color:G.muted,fontSize:13}}>No hay órdenes en tu estación.</p></div>:
  ventas.map(v=><Card key={v.folio} className="fu" style={{padding:16}}>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
  <div><span style={{fontFamily:"monospace",color:fi.color,fontSize:15,fontWeight:700}}>#{v.folio}</span><span style={{fontWeight:700,fontSize:17,marginLeft:10}}>{v.cliente}</span>{v.proyecto&&<div style={{color:G.muted,fontSize:12,marginTop:2}}>📁 {v.proyecto}</div>}</div>
  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
  <Tag color={fi.color}>{fi.icon} {fi.label}</Tag>
  {(()=>{const campo=estacion==="corte"?"asigCorte":"asigEnchape";return v[campo]?<Tag color="#facc15">👤 {v[campo]}</Tag>:<Tag color="#57534e">Cola general</Tag>;})()}
  <span style={{fontSize:10,color:G.muted}}>→ {flujoInfo(siguienteEstadoOrden(estacion,v.lineas)).label}</span>
  </div>
  </div>
  <div style={{background:G.surface2,borderRadius:8,padding:"8px 12px",marginBottom:14}}>
  {v.lineas.map((l,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:i<v.lineas.length-1?`1px solid ${G.border}30`:"none",fontSize:13}}><span style={{color:"#d6d3d1"}}>{l.nombre}{l.clienteMat&&<span style={{color:G.muted,fontSize:11}}> (cliente mat.)</span>}</span><span style={{color:G.muted,fontWeight:600}}>{l.cant} uds</span></div>)}
  </div>
  <button onClick={()=>setConfirm(v)} style={{width:"100%",padding:16,background:fi.color,border:"none",borderRadius:11,fontSize:16,fontWeight:800,color:"#1c1917",cursor:"pointer",fontFamily:"inherit"}} onMouseEnter={e=>e.currentTarget.style.filter="brightness(1.1)"} onMouseLeave={e=>e.currentTarget.style.filter=""}>✅ Terminé esta orden</button>
  </Card>)}
  </div>
  {confirm&&<Confirm msg={`¿Confirmas que terminaste la orden #${confirm.folio} de ${confirm.cliente}?\n\nPasará a: ${flujoInfo(siguienteEstadoOrden(estacion,confirm.lineas)).label}`} onOk={()=>terminar(confirm)} onCancel={()=>setConfirm(null)}/>}
  </div>;
}

function PantallaSurtido({usuario,onLogout}) {
  const [tab,setTab]=useState("pendientes");
  const [ventasPend,setVentasPend]=useState([]);const [ventasSurt,setVentasSurt]=useState([]);const [inv,setInv]=useState([]);
  const [confirmSurtir,setConfirmSurtir]=useState(null);const [confirmRecibir,setConfirmRecibir]=useState(null);
  function refresh(){const s=loadStore();if(!s)return;setVentasPend(s.ventas.filter(v=>v.estado==="confirmada"));setVentasSurt(s.ventas.filter(v=>v.estado==="surtir"));setInv(s.inventario);}
  useEffect(()=>{refresh();const iv=setInterval(refresh,2000);return()=>clearInterval(iv);},[]);
  function marcarSurtido(venta){const s=loadStore();if(!s)return;const nuevoInv=s.inventario.map(item=>{const linea=venta.lineas.find(l=>l.nombre===item.nombre&&!l.clienteMat);if(linea)return{...item,stock:Math.max(0,item.stock-linea.cant)};return item;});saveStore({...s,ventas:s.ventas.map(v=>v.folio===venta.folio?{...v,estado:"surtir",historial:[...v.historial,{estado:"surtir",ts:new Date().toISOString(),quien:usuario.nombre+" (surtió)"}]}:v),inventario:nuevoInv});refresh();setConfirmSurtir(null);}
  function recibirEnPiso(venta){const s=loadStore();if(!s)return;const sig=siguienteEstadoOrden("surtir",venta.lineas);saveStore({...s,ventas:s.ventas.map(v=>v.folio===venta.folio?{...v,estado:sig,historial:[...v.historial,{estado:sig,ts:new Date().toISOString(),quien:usuario.nombre+" (recibió en piso)"}]}:v)});refresh();setConfirmRecibir(null);}
  return <div style={{minHeight:"100vh",background:G.bg,display:"flex",flexDirection:"column"}}>
  <style>{globalCSS}</style>
  <div style={{background:G.surface,borderBottom:`1px solid ${G.border}`,padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
  <div><div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:"#fb923c"}}>📦 Almacén / Surtido</div><div style={{fontSize:12,color:G.muted}}>{usuario.nombre}</div></div>
  <div style={{display:"flex",gap:12,alignItems:"center"}}><div style={{textAlign:"right"}}><div style={{fontSize:18,fontWeight:800,color:"#fb923c"}}>{ventasPend.length} <span style={{fontSize:13,color:G.muted}}>por surtir</span></div><div style={{fontSize:14,fontWeight:700,color:"#facc15"}}>{ventasSurt.length} <span style={{fontSize:12,color:G.muted}}>esperando recibo</span></div></div><Btn v="ghost" size="sm" onClick={onLogout}>Salir</Btn></div>
  </div>
  <div style={{display:"flex",borderBottom:`1px solid ${G.border}`,background:G.surface}}>
  {[{id:"pendientes",label:`📋 Por Surtir (${ventasPend.length})`,color:"#fb923c"},{id:"surtidas",label:`🔄 Esperando Recibo (${ventasSurt.length})`,color:"#facc15"}].map(t=>
  <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"11px 20px",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,color:tab===t.id?t.color:G.muted,borderBottom:tab===t.id?`2px solid ${t.color}`:"2px solid transparent",transition:"all .15s"}}>{t.label}</button>)}
  </div>
  <div style={{flex:1,padding:16,display:"flex",flexDirection:"column",gap:12,overflowY:"auto"}}>
  {tab==="pendientes"&&(ventasPend.length===0 ? <div style={{paddingTop:60,textAlign:"center",color:"#44403c"}}><div style={{fontSize:48,marginBottom:10}}>📭</div><p style={{fontSize:16,fontWeight:700,color:"#fb923c"}}>Sin órdenes por surtir</p></div> : ventasPend.map(v=><Card key={v.folio} className="fu" style={{padding:16}}>
  <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><div><span style={{fontFamily:"monospace",color:"#fb923c",fontSize:15,fontWeight:700}}>#{v.folio}</span><span style={{fontWeight:700,fontSize:16,marginLeft:10}}>{v.cliente}</span>{v.proyecto&&<div style={{color:G.muted,fontSize:12}}>📁 {v.proyecto}</div>}</div><Tag color="#38bdf8">✅ Confirmada</Tag></div>
  <div style={{background:G.surface2,borderRadius:8,padding:"8px 12px",marginBottom:12}}>
  <div style={{fontSize:11,fontWeight:700,color:G.muted,marginBottom:6}}>MATERIAL A SURTIR</div>
  {v.lineas.filter(l=>!["Servicios"].includes(l.cat)).map((l,i)=>{const item=inv.find(p=>p.nombre===l.nombre);const ok=!item||item.stock>=l.cant;return <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${G.border}30`,fontSize:13,alignItems:"center"}}><span style={{color:"#d6d3d1"}}>{l.nombre}{l.clienteMat&&<span style={{color:G.muted,fontSize:11}}> ★cliente</span>}</span><div style={{display:"flex",gap:12,alignItems:"center"}}><span style={{color:G.muted}}>Cant: <b style={{color:G.text}}>{l.cant}</b></span>{item&&<span style={{fontSize:11,color:ok?"#34d399":"#f87171"}}>Stock: {item.stock}</span>}</div></div>;})}
  </div>
  <AsignacionEditorInline venta={v}/>
  <button onClick={()=>setConfirmSurtir(v)} style={{width:"100%",padding:14,background:"#fb923c",border:"none",borderRadius:11,fontSize:15,fontWeight:800,color:"#1c1917",cursor:"pointer",fontFamily:"inherit"}}>📦 Ya saqué el material</button>
  </Card>)
  )}
  {tab==="surtidas"&&(ventasSurt.length===0 ? <div style={{paddingTop:60,textAlign:"center",color:"#44403c"}}><div style={{fontSize:48,marginBottom:10}}>✅</div><p style={{fontSize:16,fontWeight:700,color:"#facc15"}}>Nada esperando recibo</p></div> : ventasSurt.map(v=><Card key={v.folio} className="fu" style={{padding:16,borderColor:"#facc1544"}}>
  <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><div><span style={{fontFamily:"monospace",color:"#facc15",fontSize:15,fontWeight:700}}>#{v.folio}</span><span style={{fontWeight:700,fontSize:16,marginLeft:10}}>{v.cliente}</span></div><Tag color="#facc15">📦 Material surtido</Tag></div>
  <div style={{background:G.surface2,borderRadius:8,padding:"8px 12px",marginBottom:12}}>
  {v.lineas.filter(l=>!["Servicios"].includes(l.cat)).map((l,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${G.border}30`,fontSize:13}}><span style={{color:"#d6d3d1"}}>{l.nombre}</span><span style={{color:G.muted,fontWeight:600}}>{l.cant} uds</span></div>)}
  </div>
  <AsignacionEditorInline venta={v}/>
  <button onClick={()=>setConfirmRecibir(v)} style={{width:"100%",padding:14,background:"#facc15",border:"none",borderRadius:11,fontSize:15,fontWeight:800,color:"#1c1917",cursor:"pointer",fontFamily:"inherit"}}>✅ Recibí el material — Pasar a producción</button>
  </Card>)
  )}
  </div>
  {confirmSurtir&&<Confirm msg={`¿Confirmas que ya sacaste el material de la orden #${confirmSurtir.folio}?\nSe descontará del inventario.`} onOk={()=>marcarSurtido(confirmSurtir)} onCancel={()=>setConfirmSurtir(null)}/>}
  {confirmRecibir&&<Confirm msg={`¿Confirmas que el material de la orden #${confirmRecibir.folio} ya fue recibido en piso?\nPasará a: ${flujoInfo(siguienteEstadoOrden("surtir",confirmRecibir.lineas)).label}`} onOk={()=>recibirEnPiso(confirmRecibir)} onCancel={()=>setConfirmRecibir(null)}/>}
  </div>;
}

function Clientes({store,onUpdate}) {
  const [modal,setModal]=useState(false);const [edit,setEdit]=useState(null);const [busq,setBusq]=useState("");const [detalle,setDet]=useState(null);const [form,setForm]=useState({nombre:"",tel:"",email:"",notas:""});
  function guardar(){if(!form.nombre)return;const c={...form,id:edit?.id||uid()};onUpdate(edit?store.clientes.map(x=>x.id===c.id?c:x):[...store.clientes,c]);setModal(false);}
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

function CierreCaja({store}) {
  const [fechaSel,setFechaSel]=useState(new Date().toISOString().slice(0,10));const [fisico,setFisico]=useState("");
  const ventas=store.ventas;const delDia=ventas.filter(v=>v.pagado&&new Date(v.fecha).toISOString().slice(0,10)===fechaSel);
  const byMetodo=["Efectivo","Transferencia","Tarjeta","Crédito"].reduce((acc,m)=>({...acc,[m]:delDia.filter(v=>v.metodo===m).reduce((s,v)=>s+v.total,0)}),{});
  const totalSis=delDia.reduce((s,v)=>s+v.total,0);const efectivo=byMetodo["Efectivo"]||0;const fisicoN=parseFloat(fisico)||0;const diff=fisicoN-efectivo;
  return <div className="fu" style={{display:"flex",flexDirection:"column",gap:14}}>
  <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:24}}>Cierre de Caja</h2>
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
  const [busq,setBusq]=useState("");const [edit,setEdit]=useState(null);const [delta,setDelta]=useState("");const [tipo,setTipo]=useState("entrada");
  const inv=store.inventario;const filtrado=inv.filter(p=>!busq||p.nombre.toLowerCase().includes(busq.toLowerCase()));
  function aplicar(){const d=parseInt(delta)||0;if(!d)return;onUpdate(inv.map(p=>p.id===edit.id?{...p,stock:Math.max(0,p.stock+(tipo==="entrada"?d:-d))}:p));setEdit(null);setDelta("");}
  return <div className="fu" style={{display:"flex",flexDirection:"column",gap:14}}>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:24}}>Inventario</h2><Tag color="#fb923c">⚠️ {inv.filter(p=>p.stock<=p.minimo).length} en mínimo</Tag></div>
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
  </div>;
}

function Dashboard({store,usuario}) {
  const ventas=store.ventas;const hoy=ventas.filter(v=>new Date(v.fecha).toDateString()===hoyStr());
  const kpis=[{l:"Ventas hoy",v:$$(hoy.filter(v=>v.pagado).reduce((s,v)=>s+v.total,0)),i:"💰",c:"#f59e0b"},{l:"Órdenes hoy",v:hoy.length,i:"📋",c:"#38bdf8"},{l:"En producción",v:ventas.filter(v=>["surtir","corte","enchape"].includes(v.estado)).length,i:"⚙️",c:"#a78bfa"},{l:"Listas p/entregar",v:ventas.filter(v=>v.estado==="listo").length,i:"🎯",c:"#34d399"},{l:"Sin cobrar",v:$$(ventas.filter(v=>!v.pagado&&v.estado!=="entregada").reduce((s,v)=>s+v.total,0)),i:"⏳",c:"#f87171"},{l:"Stock crítico",v:store.inventario.filter(p=>p.stock<=p.minimo).length,i:"⚠️",c:"#fb923c"}];
  return <div className="fu" style={{display:"flex",flexDirection:"column",gap:18}}>
  <div><h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:28}}>Buen día, {usuario.nombre} 👋</h2><p style={{color:G.muted,fontSize:13}}>{new Date().toLocaleDateString("es-MX",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p></div>
  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>{kpis.map(k=><Card key={k.l} style={{padding:14}}><div style={{fontSize:22,marginBottom:4}}>{k.i}</div><div style={{fontSize:22,fontWeight:800,color:k.c}}>{k.v}</div><div style={{fontSize:11,color:G.muted}}>{k.l}</div></Card>)}</div>
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
  <Card style={{padding:14}}><p style={{fontSize:11,fontWeight:700,color:G.muted,marginBottom:12}}>FLUJO DE ÓRDENES</p>
  {FLUJO.map(f=>{const n=ventas.filter(v=>v.estado===f.id).length;const pct=ventas.length?(n/ventas.length*100):0;return <div key={f.id} style={{marginBottom:9}}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}><span style={{color:"#a8a29e"}}>{f.icon} {f.label}</span><span style={{fontWeight:700,color:f.color}}>{n}</span></div><div style={{height:4,background:G.surface2,borderRadius:4}}><div style={{height:"100%",width:`${pct}%`,background:f.color,borderRadius:4,transition:"width .5s"}}/></div></div>;})}
  </Card>
  <Card style={{padding:14}}><p style={{fontSize:11,fontWeight:700,color:G.muted,marginBottom:12}}>ÚLTIMAS ÓRDENES</p>
  {ventas.length===0?<p style={{color:"#44403c",textAlign:"center",fontSize:13,paddingTop:20}}>Sin datos</p>:ventas.slice().sort((a,b)=>b.folio-a.folio).slice(0,7).map(v=><div key={v.folio} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${G.border}40`}}>
  <div><span style={{fontFamily:"monospace",color:G.accent,fontSize:12}}>#{v.folio}</span><span style={{fontSize:13,fontWeight:600,marginLeft:8}}>{v.cliente}</span></div>
  <div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:13,fontWeight:700}}>{$$(v.total)}</span><Pill estado={v.estado}/></div>
  </div>)}
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

export default function App() {
  const [usuario,setUsuario]=useState(null);const [store,setStore]=useState(null);const [seccion,setSeccion]=useState("dashboard");const [ventaAct,setVA]=useState(null);const [modoNew,setNew]=useState(false);
  useEffect(()=>{setStore(initStore());},[]);
  useEffect(()=>{if(!usuario)return;const iv=setInterval(()=>{const s=loadStore();if(s)setStore(s);},2000);return()=>clearInterval(iv);},[usuario]);
  function mutate(fn){setStore(prev=>{const next=fn(prev);saveStore(next);return next;});}
  function onLogin(u){setUsuario(u);const defaults={admin:"dashboard",vendedor:"ventas",almacen:"inventario"};setSeccion(defaults[u.rol]||"dashboard");setVA(null);setNew(false);}
  function onNuevaVenta(venta,clienteNombre,clienteId){mutate(s=>{const nuevasVentas=[...s.ventas,venta];const yaExiste=s.clientes.find(c=>c.id===clienteId||c.nombre===clienteNombre);const nuevosClientes=yaExiste?s.clientes:[...s.clientes,{id:uid(),nombre:clienteNombre,tel:"",email:"",notas:""}];return{...s,ventas:nuevasVentas,clientes:nuevosClientes,folioActual:s.folioActual+1};});setNew(false);setSeccion("ventas");}
  function onUpdateVenta(venta){mutate(s=>({...s,ventas:s.ventas.map(v=>v.folio===venta.folio?venta:v)}));setVA(venta);}
  function onAvanzar(venta){mutate(s=>{const sig=siguienteEstadoOrden(venta.estado,venta.lineas);const updated={...venta,estado:sig,historial:[...venta.historial,{estado:sig,ts:new Date().toISOString(),quien:usuario.nombre}]};return{...s,ventas:s.ventas.map(v=>v.folio===venta.folio?updated:v)};});}
  function onUpdateClientes(c){mutate(s=>({...s,clientes:c}));}
  function onUpdateInv(i){mutate(s=>({...s,inventario:i}));}
  function onUpdateConfig(c){mutate(s=>({...s,config:c}));}

  if(!store)return <div style={{minHeight:"100vh",background:"#0c0a09"}}/>;
  if(!usuario)return <Login onLogin={onLogin}/>;
  if(usuario.estacion==="surtir")return <PantallaSurtido usuario={usuario} onLogout={()=>setUsuario(null)}/>;
  if(usuario.estacion==="corte"||usuario.estacion==="enchape")return <PantallaOperario usuario={usuario} onLogout={()=>setUsuario(null)}/>;
  if(usuario.estacion==="entrega")return <PantallaEntrega usuario={usuario} onLogout={()=>setUsuario(null)}/>;

  const NAV={
  admin:[{id:"dashboard",l:"Dashboard",i:"📊"},{id:"ventas",l:"Ventas",i:"🧾"},{id:"kanban",l:"Tablero",i:"🗂️"},{id:"clientes",l:"Clientes",i:"👤"},{id:"caja",l:"Caja",i:"💰"},{id:"inventario",l:"Inventario",i:"📦"},{id:"config",l:"Configuración",i:"⚙️"}],
  vendedor:[{id:"ventas",l:"Ventas",i:"🧾"},{id:"tablero",l:"Mis Órdenes",i:"📍"},{id:"clientes",l:"Clientes",i:"👤"},{id:"caja",l:"Caja",i:"💰"}],
  almacen:[{id:"inventario",l:"Inventario",i:"📦"}],
  };
  const navItems=NAV[usuario.rol]||[];

  function renderMain(){
  if(modoNew)return <NuevaCotizacion store={store} usuario={usuario} onSave={onNuevaVenta} onCancel={()=>setNew(false)}/>;
  if(ventaAct)return <DetalleVenta venta={ventaAct} onClose={()=>setVA(null)} onUpdate={onUpdateVenta}/>;
  switch(seccion){
  case "dashboard":  return <Dashboard store={store} usuario={usuario}/>;
  case "ventas":  return <ListaVentas store={store} onNueva={()=>{setVA(null);setNew(true);}} onVer={v=>{setVA(v);setNew(false);}} onAvanzar={onAvanzar}/>;
  case "kanban":  return <Kanban onAvanzar={onAvanzar}/>;
  case "tablero":  return <TableroVendedor store={store} usuario={usuario}/>;
  case "clientes":  return <Clientes store={store} onUpdate={onUpdateClientes}/>;
  case "caja":  return <CierreCaja store={store}/>;
  case "inventario": return <Inventario store={store} onUpdate={onUpdateInv}/>;
  case "reporte":  return <ReporteExcel store={store}/>;
  case "config":  return <Configuracion store={store} onUpdate={onUpdateConfig}/>;
  default: return null;
  }
  }

  return <div style={{minHeight:"100vh",background:G.bg,display:"flex"}}>
  <style>{globalCSS}</style>
  <aside style={{width:190,background:G.surface,borderRight:`1px solid ${G.border}`,display:"flex",flexDirection:"column",padding:14,gap:3,flexShrink:0}}>
  <div style={{padding:"6px 6px 14px"}}><div style={{fontFamily:"'DM Serif Display',serif",fontSize:28,color:G.accent,lineHeight:1}}>BPC</div><div style={{fontSize:10,color:"#44403c",letterSpacing:3,marginTop:2}}>ERP v3</div></div>
  {navItems.map(n=>{const active=seccion===n.id&&!ventaAct&&!modoNew;return <button key={n.id} onClick={()=>{setSeccion(n.id);setVA(null);setNew(false);}} style={{display:"flex",alignItems:"center",gap:10,padding:"9px11px",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit",textAlign:"left",transition:"all.15s",background:active?G.accent:"transparent",color:active?"#1c1917":G.muted}}>{n.i} {n.l}</button>;})}
  <div style={{marginTop:"auto",paddingTop:12,borderTop:`1px solid ${G.border}`}}>
  <div style={{fontSize:12,color:G.muted,padding:"0 6px"}}>{usuario.nombre}</div>
  <button onClick={()=>setUsuario(null)} style={{background:"none",border:"none",color:"#44403c",fontSize:12,cursor:"pointer",padding:"4px 6px",fontFamily:"inherit",width:"100%",textAlign:"left",marginTop:4}} onMouseEnter={e=>e.currentTarget.style.color=G.muted} onMouseLeave={e=>e.currentTarget.style.color="#44403c"}>Cerrar sesión →</button>
  </div>
  </aside>
  <main style={{flex:1,overflow:"auto",padding:22}}><div style={{maxWidth:1080,margin:"0 auto"}}>{renderMain()}</div></main>
  </div>;
}
