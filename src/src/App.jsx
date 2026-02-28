import { useState, useEffect, useRef } from "react";

var navy="#132435",gold="#D0B48F",copper="#C78538",olive="#8C8135",grayBlue="#CBD1DD",cream="#E9E9E2",grayWarm="#808078",white="#fff";
var ft="'Barlow Semi Condensed',sans-serif";

var SCHED={
  "San Isidro":["lunes-18:00","martes-09:30","martes-14:00","martes-18:30","miércoles-18:30","jueves-18:30","viernes-18:00","sábado-10:00"],
  "Palermo":["lunes-10:00","lunes-18:30","martes-14:30","martes-18:30","miércoles-18:30","jueves-10:00","jueves-14:30","jueves-18:30","viernes-10:00","viernes-18:30"]
};
var MAX_CUPO=9;var CLASES_BASE=4;

var DEFAULT_CUOTAS={
  "Palermo":{
    "1x":{efectivo:[{hasta:7,precio:90000},{hasta:14,precio:95000},{hasta:31,precio:101000}],
           transferencia:[{hasta:7,precio:98000},{hasta:14,precio:103000},{hasta:31,precio:108000}]},
    "2x":[{hasta:7,precio:162000},{hasta:14,precio:167000},{hasta:31,precio:173000}]
  },
  "San Isidro":{
    "1x":{efectivo:[{hasta:7,precio:95000},{hasta:14,precio:101000},{hasta:31,precio:108000}],
           transferencia:[{hasta:7,precio:101000},{hasta:14,precio:109000},{hasta:31,precio:114000}]},
    "2x":[{hasta:7,precio:172000},{hasta:14,precio:178000},{hasta:31,precio:188000}]
  }
};
function fmtPrecio(n){return"$"+n.toLocaleString("es-AR")}
function getPrecioHoy(cuotas,sede,freq){
  var day=new Date().getDate();var c=cuotas[sede];if(!c)return null;
  if(freq==="2x"){var arr=c["2x"];for(var i=0;i<arr.length;i++){if(day<=arr[i].hasta)return{precio:arr[i].precio,hasta:arr[i].hasta,next:arr[i+1]||null}}return{precio:arr[arr.length-1].precio,hasta:31,next:null}}
  var ef=c["1x"].efectivo;var tr=c["1x"].transferencia;
  var pe=null,pt=null;
  for(var i=0;i<ef.length;i++){if(day<=ef[i].hasta){pe={precio:ef[i].precio,hasta:ef[i].hasta,next:ef[i+1]||null};break}}
  if(!pe)pe={precio:ef[ef.length-1].precio,hasta:31,next:null};
  for(var i=0;i<tr.length;i++){if(day<=tr[i].hasta){pt={precio:tr[i].precio,hasta:tr[i].hasta,next:tr[i+1]||null};break}}
  if(!pt)pt={precio:tr[tr.length-1].precio,hasta:31,next:null};
  return{efectivo:pe,transferencia:pt}}
var DAYS=["lunes","martes","miércoles","jueves","viernes","sábado","domingo"];
var MN=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];

function parseMes(s){var low=s.toLowerCase();for(var i=0;i<MN.length;i++){if(low.includes(MN[i])){var ym=low.match(/\d{4}/);var y=ym?parseInt(ym[0]):new Date().getFullYear();return{month:i,year:y,key:y+"-"+i}}}return null}
function classesInMonth(day,time,month,year){var tgt=DAYS.indexOf(day);var res=[];var d=new Date(year,month,1);while(d.getMonth()===month){var dow=d.getDay();var idx=dow===0?6:dow-1;if(idx===tgt){var cl=new Date(d);var pp=time.split(":");cl.setHours(parseInt(pp[0]),parseInt(pp[1]),0,0);res.push(cl)}d.setDate(d.getDate()+1)}return res}
function hrsUntil(d){return(d.getTime()-Date.now())/3600000}
function fmtDate(d){var dn=["dom","lun","mar","mié","jue","vie","sáb"];var mn=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];return dn[d.getDay()]+" "+d.getDate()+" "+mn[d.getMonth()]+" · "+String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")}
function parseMk(mk){var p=mk.split("-").map(Number);return{year:p[0],month:p[1]}}

function getSortedPaidMonths(al){
  var keys=Object.keys(al.mp||{});
  keys.sort(function(a,b){var pa=a.split("-").map(Number);var pb=b.split("-").map(Number);return pa[0]!==pb[0]?pa[0]-pb[0]:pa[1]-pb[1]});
  return keys;
}
function getLatestPaidMk(al){var s=getSortedPaidMonths(al);return s.length?s[s.length-1]:null}
function paidMonthToYM(al){var mk=getLatestPaidMk(al);if(!mk)return null;var p=parseMk(mk);return{y:p.year,m:p.month}}

var nextId=60;
function makeInit(){
  var als=[];var id=1;
  function add(nombre,sede,dia,hora,pagado){als.push({id:id++,nombre:nombre,tel:"",email:"",sede:sede,turno:{dia:dia,hora:hora},mp:pagado?{"2026-2":true}:{},hist:pagado?["Alta","Pago marzo 2026"]:["Alta"],ex:[],canc:[],reg:0,pw:null,estado:"activo",pendArrastre:0})}

  add("Lilian Quiroga","Palermo","martes","14:30");
  add("Patricia Bilbao Molina","Palermo","martes","14:30");
  add("Soledad Romera","Palermo","martes","14:30");
  add("Mariana Schammas","Palermo","martes","14:30");
  add("Olivia González Gimenez","Palermo","martes","14:30");
  add("Tia Eve","Palermo","martes","14:30");
  add("Francesca Di Diego","Palermo","martes","14:30");
  add("Claudia Gurisich","Palermo","martes","14:30",true);
  add("Carla Pinto","Palermo","martes","18:30");
  add("Josefina Gaeta","Palermo","martes","18:30");
  add("Paula Fangio","Palermo","martes","18:30");
  add("Soledad Barcia","Palermo","martes","18:30");
  add("Valentina Ortiz","Palermo","martes","18:30");
  add("Tatiana Bauer","Palermo","martes","18:30");
  add("Belén Tambella","Palermo","jueves","10:00");
  add("Francesca Di Diego","Palermo","jueves","10:00");
  add("Paola Mateucci","Palermo","jueves","10:00");
  add("Maia Bayley Bustamante","Palermo","jueves","18:30",true);
  add("Catalina Sanguino","Palermo","jueves","18:30");
  add("Sol Guerra","Palermo","jueves","18:30");
  add("Susana Fernandez","Palermo","viernes","10:00");
  add("Oriana Scotti","Palermo","viernes","10:00");
  add("Florencia Cassareto","Palermo","viernes","10:00");
  add("Maria Eugenia Llanos","Palermo","viernes","10:00");
  add("Florencia Iragui","Palermo","viernes","18:30");
  add("Florencia Testa","Palermo","viernes","18:30");
  add("Stefanía Yailin","Palermo","viernes","18:30");
  add("Graciela Zaleski","Palermo","viernes","18:30");
  add("Mariela Doris Piacenza","Palermo","viernes","18:30");
  add("Sol Acosta","Palermo","viernes","18:30");
  add("Violeta Cattaneo","San Isidro","lunes","18:00");
  add("Nicole Sulzer","San Isidro","lunes","18:00");
  add("Corina Mc Loughlin","San Isidro","lunes","18:00");
  add("Mora Benedit","San Isidro","lunes","18:00");
  add("Fernanda Aun Castels","San Isidro","martes","09:30");
  add("Pilar Paradelo","San Isidro","miércoles","18:30");
  add("Lucia Ferrer","San Isidro","miércoles","18:30");
  add("Rita Ferrer","San Isidro","miércoles","18:30");
  add("Victoria Felgueras","San Isidro","miércoles","18:30");
  add("Andrea Cantoni","San Isidro","miércoles","18:30");
  add("Mariela Llebeili","San Isidro","miércoles","18:30");
  add("Griselda Perez","San Isidro","jueves","18:30");
  add("Sandra Faifman","San Isidro","jueves","18:30");
  add("Francisco Agüero","San Isidro","jueves","18:30");
  add("Camila Pollastrelli","San Isidro","jueves","18:30");
  add("Nahir Alvarez","San Isidro","viernes","18:00");
  add("Jazmin Videla","San Isidro","viernes","18:00");
  add("Katherine Sharpin","San Isidro","sábado","10:00");
  add("Lucila Castellani","San Isidro","sábado","10:00");
  add("Brenda Tasin","San Isidro","sábado","10:00");
  nextId=id;
  return als}var nextProfeId=7;
function makeInitProfes(){
  return[
    {id:1,nombre:"Vero",sedes:["Palermo"],horarios:["martes-14:30","martes-18:30","jueves-10:00","jueves-18:30"],pw:null,encargada:false},
    {id:2,nombre:"Ale",sedes:["Palermo"],horarios:["viernes-10:00"],pw:null,encargada:false},
    {id:3,nombre:"Maca",sedes:["Palermo"],horarios:["viernes-18:30"],pw:null,encargada:false},
    {id:4,nombre:"Agustina",sedes:["San Isidro"],horarios:["lunes-18:00","martes-09:30","martes-14:00","martes-18:30","miércoles-18:30","jueves-18:30"],pw:null,encargada:true},
    {id:5,nombre:"Mila",sedes:["San Isidro"],horarios:["viernes-18:00"],pw:null,encargada:false},
    {id:6,nombre:"Laura",sedes:["San Isidro"],horarios:["sábado-10:00"],pw:null,encargada:false}
  ];
}

function getMonthStats(al,mk){
  var p=mk.split("-").map(Number);var totalInMonth=classesInMonth(al.turno.dia,al.turno.hora,p[1],p[0]).length;
  var is5=totalInMonth===5;var cancTM=(al.canc||[]).filter(function(c){return c.mk===mk});
  var recTM=(al.ex||[]).filter(function(e){return e.mk===mk});
  var cancSinR=cancTM.filter(function(c){return c.noR}).length;var cancConR=cancTM.length-cancSinR;
  var pend=cancConR-recTM.length;if(pend<0)pend=0;
  var efect=CLASES_BASE-cancConR+recTM.length;if(is5&&cancTM.length===0)efect=5;
  return{totalInMonth:totalInMonth,is5:is5,cancTotal:cancTM.length,cancSinRecup:cancSinR,cancConRecup:cancConR,recuperaciones:recTM.length,pendientes:pend,clasesEfectivas:efect,puedeRecuperar:pend>0&&efect<CLASES_BASE};
}

function getCupoForSlot(allAls,sede,dia,hora,fecha){
  var dateStr=fecha.toISOString();var fijos=0;var recups=0;
  allAls.forEach(function(a){if(a.sede!==sede)return;
    if(a.turno.dia===dia&&a.turno.hora===hora){var cancelled=(a.canc||[]).some(function(c){return c.iso===dateStr});if(!cancelled)fijos++}
    (a.ex||[]).forEach(function(e){if(e.date===dateStr)recups++})});
  return{ocupado:fijos+recups,libre:MAX_CUPO-fijos-recups};
}

function AdminChat(props){
  var als=props.als;var setAls=props.setAls;var logs=props.logs;var setLogs=props.setLogs;var setNotif=props.setNotif;
  var profes=props.profes;var setProfes=props.setProfes;var listasReg=props.listasReg;
  var adminNotifs=props.adminNotifs;var setAdminNotifs=props.setAdminNotifs;
  var cuotas=props.cuotas;var setCuotas=props.setCuotas;
  var ref=useRef(null);
  var welcomeMsg="¡Hola! Asistente Eves Pottery ✦\n\nAlumnos:\n• Alta alumno: Nombre / Sede / día hora\n• Baja: Nombre (estado baja)\n• Reactivar: Nombre\n• Suspender: Nombre\n• Reset pw: Nombre\n• Pago recibido: Nombre (mes año)\n• Pagos marzo 2026: nombre1, nombre2…\n• Consulta: Nombre\n• Clase regalo: Nombre\n\nConsultas:\n• Alumnos P hoy / SI martes\n• Pagos pendientes P / SI\n• Notificaciones\n• Ver alumnos P / SI\n• Ver historial P / SI\n• Precios (ver/editar)\n\nProfesoras:\n• Alta profe / Baja profe / Ver profes\n\n(P=Palermo, SI=San Isidro)";
  var _m=useState([{from:"bot",text:welcomeMsg}]);var msgs=_m[0];var setMsgs=_m[1];
  var _i=useState("");var inp=_i[0];var setInp=_i[1];
  useEffect(function(){if(ref.current)ref.current.scrollIntoView({behavior:"smooth"})},[msgs]);
  function addLog(txt){setLogs(function(p){return p.concat({ts:new Date().toLocaleString(),action:txt})})}
  function findA(name){var low=name.toLowerCase().trim();return als.findIndex(function(a){return a.nombre.toLowerCase().includes(low)})}

  function detectSede(t){
    if(/\bsi\b/.test(t)||t.includes("san isidro")||t.includes("isidro"))return"San Isidro";
    if(/\bp\b/.test(t)||/\bpalermo\b/.test(t))return"Palermo";
    return null}

  function filtrarPorSede(list,sede){if(!sede)return list;return list.filter(function(a){return a.sede===sede})}
  function sedeLabel(sede){return sede?" ("+sede+")":""}

  function respond(txt){
    var t=txt.toLowerCase().trim();
    var sede=detectSede(t);

    if(t.includes("notificacion")||t.includes("alertas")||t.includes("listas pendientes")){
      var now=new Date();var pendientes=[];
      profes.forEach(function(pr){
        pr.horarios.forEach(function(h){
          var parts=h.split("-");var dia=parts[0];var hora=parts[1];
          pr.sedes.forEach(function(sede2){
            for(var d=0;d<7;d++){
              var checkDate=new Date(now);checkDate.setDate(checkDate.getDate()-d);
              var dow=checkDate.getDay();var dayIdx=dow===0?6:dow-1;
              if(DAYS[dayIdx]!==dia)continue;
              var slotDate=new Date(checkDate);var tp=hora.split(":");
              slotDate.setHours(parseInt(tp[0]),parseInt(tp[1]),0,0);
              if(slotDate>=now)continue;
              var slotISO=slotDate.toISOString();
              var taken=listasReg.some(function(l){return l.date===slotISO&&l.profe===pr.nombre});
              if(!taken){
                pendientes.push({profe:pr.nombre,sede:sede2,dia:dia,hora:hora,fecha:slotDate})}}})})});

      var r="";
      var pagoClaims=adminNotifs.filter(function(n){return n.type==="pago"});
      if(pagoClaims.length>0){
        r+="💳 Alumnos que dicen haber pagado:\n\n";
        pagoClaims.forEach(function(n){r+="• "+n.nombre+" ("+n.sede+" · "+n.turno+") — "+n.ts+"\n"});
        r+="\n"}

      var pwReqs=adminNotifs.filter(function(n){return n.type==="resetpw"});
      if(pwReqs.length>0){
        r+="🔑 Solicitudes de reset de contraseña:\n\n";
        pwReqs.forEach(function(n){r+="• "+n.nombre+" — "+n.ts+"\n"});
        r+="Usar: reset pw: Nombre\n\n"}

      if(pendientes.length>0){
        pendientes.sort(function(a,b){return a.fecha-b.fecha});
        r+="📋 Listas NO tomadas (últimos 7 días):\n\n";
        pendientes.forEach(function(p){r+="⛔ "+p.profe+" — "+p.sede+" — "+fmtDate(p.fecha)+"\n"});
        r+="\nTotal: "+pendientes.length+" clase"+(pendientes.length>1?"s":"")+" sin lista\n"}

      if(!r)return"✓ Sin notificaciones. ¡Todo al día!";
      return"🔔 Notificaciones:\n\n"+r}

    if(t.includes("pago") && (t.includes("pendiente") || t.includes("falta") || t.includes("deuda") || t.includes("impago"))){
      var now=new Date();var nextM=new Date(now.getFullYear(),now.getMonth()+1,1);
      var checkMonths=[now.getFullYear()+"-"+now.getMonth(),nextM.getFullYear()+"-"+nextM.getMonth()];
      var sinPago=[];
      filtrarPorSede(als,sede).forEach(function(a){var mesesPagados=Object.keys(a.mp||{});
        var falta=checkMonths.filter(function(mk){return!mesesPagados.includes(mk)});
        if(falta.length>0){var faltaNames=falta.map(function(mk){var p=mk.split("-").map(Number);return MN[p[1]]+" "+p[0]});
          sinPago.push({nombre:a.nombre,sede:a.sede,turno:a.turno.dia+" "+a.turno.hora,meses:faltaNames})}});
      if(!sinPago.length)return"✓ Todos los alumnos"+sedeLabel(sede)+" tienen los pagos al día.";
      var r="✦ Pagos pendientes"+sedeLabel(sede)+":\n\n";sinPago.forEach(function(s){r+="• "+s.nombre+(sede?"":" ("+s.sede+")")+" · "+s.turno+"\n  Falta: "+s.meses.join(", ")+"\n\n"});
      r+="Total: "+sinPago.length+" alumno"+(sinPago.length>1?"s":"");return r}

    if(t.includes("ver alumno")||t==="alumnos"||t==="lista"||t==="alumnos p"||t==="alumnos si"){
      var showBajas=t.includes("baja")||t.includes("todo")||t.includes("all");
      var lista=filtrarPorSede(als,sede);
      if(!showBajas)lista=lista.filter(function(a){return a.estado!=="baja"});
      if(!lista.length)return"No hay alumnos"+sedeLabel(sede)+".";
      return"✦ Alumnos"+sedeLabel(sede)+":\n\n"+lista.map(function(a){var meses=Object.keys(a.mp||{}).map(function(k){return MN[parseInt(k.split("-")[1])]}).join(", ")||"—";var est=a.estado==="baja"?" ⛔BAJA":a.estado==="suspendido"?" ⏸SUSP":"";return"• "+a.nombre+est+(sede?"":" — "+a.sede)+" — "+a.turno.dia+" "+a.turno.hora+" — Pagó: "+meses}).join("\n")}

    if(t.includes("historial")||t.includes("log")||t.includes("movimiento")){
      if(!logs.length)return"No hay movimientos aún.";
      var filteredLogs=logs;
      if(sede){filteredLogs=logs.filter(function(l){return l.action.includes(sede)})}
      if(!filteredLogs.length)return"No hay movimientos"+sedeLabel(sede)+".";
      return"✦ Movimientos"+sedeLabel(sede)+":\n\n"+filteredLogs.slice(-15).map(function(l){return"["+l.ts+"] "+l.action}).join("\n")}

    if(t.includes("alumnos de")||t.includes("alumnos del")||t.includes("planilla")||/alumnos\s+(p|si)\s/.test(t)){
      var td=new Date();var label="hoy";
      if(t.includes("mañana")){td=new Date();td.setDate(td.getDate()+1);label="mañana"}
      else{var dm=t.match(/(lunes|martes|miércoles|jueves|viernes|sábado|domingo)/);if(dm){var ti=DAYS.indexOf(dm[1]);var ci=td.getDay();var cx=ci===0?6:ci-1;var diff=ti-cx;if(diff<=0)diff+=7;td=new Date();td.setDate(td.getDate()+diff);label=dm[1]}}
      var dow=td.getDay();var dayN=DAYS[dow===0?6:dow-1];var mk=td.getFullYear()+"-"+td.getMonth();
      var list=[];
      filtrarPorSede(als,sede).forEach(function(a){if(a.estado==="baja")return;if(a.turno.dia!==dayN)return;if(!(a.mp||{})[mk])return;var dateObj=new Date(td);var pp=a.turno.hora.split(":");dateObj.setHours(parseInt(pp[0]),parseInt(pp[1]),0,0);var cancelled=(a.canc||[]).some(function(c){return c.iso===dateObj.toISOString()});if(!cancelled)list.push(a)});
      filtrarPorSede(als,sede).forEach(function(a){if(a.estado==="baja")return;(a.ex||[]).forEach(function(e){var exD=new Date(e.date);if(exD.toDateString()===td.toDateString()&&!list.find(function(x){return x.id===a.id}))list.push(Object.assign({},a,{isRec:true}))})});
      if(!list.length)return"No hay alumnos"+sedeLabel(sede)+" el "+label+" ("+dayN+").";
      var r="✦ "+label+sedeLabel(sede)+" ("+dayN+" "+td.getDate()+"/"+(td.getMonth()+1)+"):\n\n";
      list.sort(function(a,b){return a.turno.hora.localeCompare(b.turno.hora)});
      list.forEach(function(a){r+="• "+a.turno.hora+" — "+a.nombre+(a.isRec?" (recup)":"")+(sede?"":" ("+a.sede+")")+"\n"});
      r+="\nTotal: "+list.length;return r}
    if(t.startsWith("baja")&&!t.includes("profe")){var n=txt.replace(/baja\s*:?\s*/i,"").trim();if(!n)return"Formato: Baja: Nombre";var idx=findA(n);if(idx===-1)return"✗ No encontré ese nombre.";var al=als[idx];
      setAls(function(p){var c=p.slice();var fi=c.findIndex(function(a){return a.id===al.id});c[fi]=Object.assign({},c[fi],{estado:"baja",hist:(c[fi].hist||[]).concat("⛔ Baja")});return c});
      addLog("Baja: "+al.nombre+" — "+al.sede);return"✓ "+al.nombre+" dado de baja (no podrá acceder). Usar 'reactivar: Nombre' para volver a activar."}
    if(t.startsWith("consulta")){
      var n2=txt.replace(/consulta\s*:?\s*/i,"").trim();if(!n2)return"Formato: Consulta: Nombre";var idx2=findA(n2);if(idx2===-1)return"✗ No encontré ese nombre.";var a2=als[idx2];var meses2=Object.keys(a2.mp||{});
      var r2="✦ "+a2.nombre+"\n📍 "+a2.sede+" · "+a2.turno.dia+" "+a2.turno.hora;
      var estadoLabel=a2.estado==="baja"?"⛔ BAJA":a2.estado==="suspendido"?"⏸ SUSPENDIDO":"✅ Activo";
      r2+="\n👤 Estado: "+estadoLabel;
      r2+="\n💳 Pagó: "+(meses2.length?meses2.map(function(k){var p=k.split("-");return MN[parseInt(p[1])]+" "+p[0]}).join(", "):"—");
      r2+="\n🎁 Regalo: "+(a2.reg||0);
      meses2.forEach(function(mk2){var stats=getMonthStats(a2,mk2);var p=mk2.split("-").map(Number);
        r2+="\n\n📅 "+MN[p[1]]+" "+p[0]+":";r2+="\n  Clases en mes: "+stats.totalInMonth+(stats.is5?" (5ta regalo)":"");
        r2+="\n  Cancelaciones: "+stats.cancTotal+(stats.cancSinRecup>0?" ("+stats.cancSinRecup+" sin recup)":"");
        r2+="\n  Recuperaciones: "+stats.recuperaciones;r2+="\n  Pendientes: "+stats.pendientes;r2+="\n  Clases efectivas: "+stats.clasesEfectivas+"/"+CLASES_BASE});
      return r2}
    if(t.includes("clase regalo")||t.includes("regalar clase")){
      var n3=txt.replace(/clase\s*(de\s*)?regalo\s*:?\s*/i,"").replace(/regalar\s*clase\s*:?\s*/i,"").trim();
      if(!n3)return"Formato: Clase regalo: Nombre";var idx3=findA(n3);if(idx3===-1)return"✗ No encontré ese nombre.";var al3=als[idx3];
      setAls(function(p){var c=p.slice();var fi=c.findIndex(function(a){return a.id===al3.id});if(fi===-1)return c;c[fi]=Object.assign({},c[fi],{reg:(c[fi].reg||0)+1,hist:(c[fi].hist||[]).concat("🎁 Regalo")});return c});
      setNotif(function(p){var o=Object.assign({},p);o[al3.id]=(o[al3.id]||[]).concat("🎁 ¡Tenés una clase de regalo!");return o});
      addLog("Regalo: "+al3.nombre);return"✓ Regalo para "+al3.nombre}
    if(t.startsWith("reactivar")){var nR=txt.replace(/reactivar\s*:?\s*/i,"").trim();if(!nR)return"Formato: Reactivar: Nombre";
      var idxR=findA(nR);if(idxR===-1)return"✗ No encontré ese nombre.";var alR=als[idxR];
      setAls(function(p){var c=p.slice();var fi=c.findIndex(function(a){return a.id===alR.id});c[fi]=Object.assign({},c[fi],{estado:"activo",hist:(c[fi].hist||[]).concat("✅ Reactivado")});return c});
      addLog("Reactivar: "+alR.nombre);return"✓ "+alR.nombre+" reactivado/a. Ya puede acceder."}

    if(t.startsWith("suspender")){var nS=txt.replace(/suspender\s*:?\s*/i,"").trim();if(!nS)return"Formato: Suspender: Nombre";
      var idxS=findA(nS);if(idxS===-1)return"✗ No encontré ese nombre.";var alS=als[idxS];
      setAls(function(p){var c=p.slice();var fi=c.findIndex(function(a){return a.id===alS.id});c[fi]=Object.assign({},c[fi],{estado:"suspendido",hist:(c[fi].hist||[]).concat("⏸ Suspendido")});return c});
      addLog("Suspender: "+alS.nombre);return"✓ "+alS.nombre+" suspendido/a."}

    if(t.includes("reset pw")||t.includes("reset contraseña")||t.includes("resetear")){
      var nPW=txt.replace(/reset\s*(pw|contraseña)\s*:?\s*/i,"").replace(/resetear\s*:?\s*/i,"").trim();
      if(!nPW)return"Formato: Reset pw: Nombre";
      var idxPW=findA(nPW);if(idxPW===-1)return"✗ No encontré ese nombre.";var alPW=als[idxPW];
      setAls(function(p){var c=p.slice();var fi=c.findIndex(function(a){return a.id===alPW.id});c[fi]=Object.assign({},c[fi],{pw:null,hist:(c[fi].hist||[]).concat("🔑 Reset pw")});return c});
      addLog("Reset pw: "+alPW.nombre);return"✓ Contraseña de "+alPW.nombre+" reseteada. Le pedirá crear una nueva al entrar."}

    if(t.includes("editar precio")||t.includes("ver precio")||t.includes("precios")){
      if(t.includes("ver")||t==="precios"){
        var r="✦ Precios actuales:\n\n";
        ["Palermo","San Isidro"].forEach(function(s){
          r+="📍 "+s+":\n";
          r+="  1x/sem efectivo: "+cuotas[s]["1x"].efectivo.map(function(p){return"hasta "+p.hasta+": "+fmtPrecio(p.precio)}).join(" · ")+"\n";
          r+="  1x/sem transf: "+cuotas[s]["1x"].transferencia.map(function(p){return"hasta "+p.hasta+": "+fmtPrecio(p.precio)}).join(" · ")+"\n";
          r+="  2x/sem: "+cuotas[s]["2x"].map(function(p){return"hasta "+p.hasta+": "+fmtPrecio(p.precio)}).join(" · ")+"\n\n"});
        r+="Para editar: editar precio Palermo 1x efectivo: 90000, 95000, 101000";
        return r}
      var em=txt.match(/editar\s*precio\s*(palermo|san isidro|isidro)\s*(1x|2x)\s*(efectivo|transferencia|transf)?\s*:?\s*([\d,\s]+)/i);
      if(!em)return"Formato: editar precio Palermo 1x efectivo: 90000, 95000, 101000\n(o: editar precio SI 2x: 172000, 178000, 188000)";
      var sedaE=em[1].toLowerCase().includes("palermo")?"Palermo":"San Isidro";var freqE=em[2];
      var metodo=em[3]?em[3].toLowerCase().replace("transf","transferencia"):null;
      var vals=em[4].split(",").map(function(v){return parseInt(v.trim())}).filter(function(v){return!isNaN(v)});
      if(vals.length!==3)return"Necesito exactamente 3 valores: hasta el 7, hasta el 14, desde el 15";
      var newArr=[{hasta:7,precio:vals[0]},{hasta:14,precio:vals[1]},{hasta:31,precio:vals[2]}];
      setCuotas(function(prev){var c=JSON.parse(JSON.stringify(prev));
        if(freqE==="2x"){c[sedaE]["2x"]=newArr}
        else if(metodo){c[sedaE]["1x"][metodo]=newArr}
        else{return prev}
        return c});
      addLog("Precios: "+sedaE+" "+freqE+(metodo?" "+metodo:"")+" → "+vals.join(", "));
      return"✓ Precios actualizados: "+sedaE+" "+freqE+(metodo?" "+metodo:"")+"\n"+newArr.map(function(p){return"hasta "+p.hasta+": "+fmtPrecio(p.precio)}).join(" · ")}

    if(t.includes("ver profe")||t==="profes"){
      if(!profes.length)return"No hay profesoras aún.";
      return"✦ Profesoras:\n\n"+profes.map(function(p){return"• "+p.nombre+" — "+p.sedes.join(", ")+" — "+p.horarios.map(function(h){return h.replace("-"," ")}).join(", ")}).join("\n")}

    if(t.includes("alta profe")){
      var partsP=txt.replace(/alta\s*profe\s*:?\s*/i,"").split("/").map(function(s){return s.trim()});
      if(partsP.length<3)return"Formato: Alta profe: Nombre / Sede / día hora, día hora";
      var nomP=partsP[0];var sedeP=partsP[1].toLowerCase().includes("palermo")?"Palermo":"San Isidro";
      var horariosRaw=partsP[2].split(",").map(function(s){return s.trim().toLowerCase()});
      var horariosP=[];var errH=[];
      horariosRaw.forEach(function(h){
        var hm=h.match(/(lunes|martes|miércoles|jueves|viernes|sábado)\s+(\d{1,2}:\d{2})/);
        if(!hm){errH.push(h);return}
        var sk=hm[1]+"-"+hm[2];
        if(SCHED[sedeP].indexOf(sk)===-1){errH.push(h+" (no existe en "+sedeP+")");return}
        horariosP.push(sk)});
      if(!horariosP.length)return"No pude interpretar los horarios: "+errH.join(", ");
      var np={id:nextProfeId++,nombre:nomP,sedes:[sedeP],horarios:horariosP,pw:null};
      setProfes(function(p){return p.concat(np)});addLog("Alta profe: "+nomP+" — "+sedeP);
      var r="✓ Profe: "+nomP+" — "+sedeP+"\nHorarios: "+horariosP.map(function(h){return h.replace("-"," ")}).join(", ");
      if(errH.length)r+="\n⚠ No reconocidos: "+errH.join(", ");
      return r}

    if(t.includes("baja profe")){
      var nBP=txt.replace(/baja\s*profe\s*:?\s*/i,"").trim();if(!nBP)return"Formato: Baja profe: Nombre";
      var idxBP=profes.findIndex(function(p){return p.nombre.toLowerCase().includes(nBP.toLowerCase())});
      if(idxBP===-1)return"✗ No encontré esa profesora.";var prBP=profes[idxBP];
      setProfes(function(p){return p.filter(function(_,i){return i!==idxBP})});addLog("Baja profe: "+prBP.nombre);
      return"✓ "+prBP.nombre+" dada de baja."}

    var hasSlashes=txt.includes("/");var looksLikeAlta=t.includes("alta")||(hasSlashes&&(t.includes("palermo")||t.includes("san isidro")||t.includes("isidro")));
    if(looksLikeAlta){
      var parts=txt.split("/").map(function(s){return s.trim()});if(parts.length<3)return"Formato: Nombre / Sede / día hora";
      var nom,tel2="",email2="",sedePart,turnoPart;
      if(parts.length>=5){nom=parts[0].replace(/alta\s*(de\s*)?alumno\s*:?\s*/i,"").trim();tel2=parts[1];email2=parts[2];sedePart=parts[3];turnoPart=parts[4]}
      else if(parts.length===4){nom=parts[0].replace(/alta\s*(de\s*)?alumno\s*:?\s*/i,"").trim();if(parts[1].toLowerCase().includes("palermo")||parts[1].toLowerCase().includes("isidro")){sedePart=parts[1];turnoPart=parts[2]+" "+parts[3]}else{tel2=parts[1];sedePart=parts[2];turnoPart=parts[3]}}
      else{nom=parts[0].replace(/alta\s*(de\s*)?alumno\s*:?\s*/i,"").trim();sedePart=parts[1];turnoPart=parts[2]}
      var sede=sedePart.toLowerCase().includes("palermo")?"Palermo":"San Isidro";
      var tm=turnoPart.toLowerCase().match(/(lunes|martes|miércoles|jueves|viernes|sábado)\s+(\d{1,2}:\d{2})/);
      if(!tm)return"No entendí el turno. Ej: martes 14:30";var sk=tm[1]+"-"+tm[2];
      if(SCHED[sede].indexOf(sk)===-1)return"✗ No existe ese horario en "+sede+".\nDisponibles: "+SCHED[sede].map(function(s){return s.replace("-"," ")}).join(", ");
      var na={id:nextId++,nombre:nom,tel:tel2,email:email2,sede:sede,turno:{dia:tm[1],hora:tm[2]},mp:{},hist:["Alta"],ex:[],canc:[],reg:0,pw:null};
      setAls(function(p){return p.concat(na)});addLog("Alta: "+nom+" — "+sede);return"✓ Alta: "+nom+" — "+sede+" "+tm[1]+" "+tm[2]}
    if(t.includes("pago")){
      var bulkMatch=txt.match(/pagos?\s+([a-záéíóúñ]+\s+\d{4})\s*:\s*(.+)/i);
      if(bulkMatch){
        var parsed=parseMes(bulkMatch[1]);if(!parsed)return"No entendí el mes. Ej: pagos marzo 2026: nombre1, nombre2";
        var nombres=bulkMatch[2].split(",").map(function(s){return s.trim()}).filter(function(s){return s.length>0});
        if(!nombres.length)return"Incluí al menos un nombre después de los dos puntos.";
        var resultados=[];var okCount=0;
        nombres.forEach(function(nom){
          var idx=findA(nom);
          if(idx===-1){resultados.push("✗ "+nom+" — no encontrado");return}
          var alP=als[idx];
          var tc=classesInMonth(alP.turno.dia,alP.turno.hora,parsed.month,parsed.year).length;
          setAls(function(p){var c=p.slice();var fi=c.findIndex(function(a){return a.id===alP.id});if(fi===-1)return c;
            var newMp=Object.assign({},c[fi].mp);newMp[parsed.key]=true;
            c[fi]=Object.assign({},c[fi],{mp:newMp,hist:(c[fi].hist||[]).concat("💳 "+MN[parsed.month]+" "+parsed.year)});return c});
          setNotif(function(p){var o=Object.assign({},p);o[alP.id]=(o[alP.id]||[]).concat("✅ Pago "+MN[parsed.month]+" habilitado.");return o});
          addLog("Pago: "+alP.nombre+" — "+MN[parsed.month]);
          resultados.push("✓ "+alP.nombre+" — "+tc+" clases"+(tc===5?" (5ta regalo)":""));okCount++});
        return"✦ Pagos "+MN[parsed.month]+" "+parsed.year+":\n\n"+resultados.join("\n")+"\n\nProcesados: "+okCount+"/"+nombres.length}

      var match=txt.match(/pago\s*(recibido|confirmado|ok)\s*:?\s*(.+)/i);if(!match)return"Formato:\n• Pago recibido: Nombre (marzo 2026)\n• Pagos marzo 2026: nombre1, nombre2, nombre3";
      var rest=match[2].trim();var mesM=rest.match(/\(([^)]+)\)/);if(!mesM)return"Incluí el mes entre paréntesis.";
      var parsed2=parseMes(mesM[1]);if(!parsed2)return"No entendí el mes.";
      var n5=rest.replace(/\([^)]+\)/,"").trim();var idx5=findA(n5);if(idx5===-1)return"✗ No encontré ese nombre.";var al5=als[idx5];
      var tc2=classesInMonth(al5.turno.dia,al5.turno.hora,parsed2.month,parsed2.year).length;
      var prevPend=0;
      var prevMonths=getSortedPaidMonths(al5);
      prevMonths.forEach(function(mk){prevPend+=getMonthStats(al5,mk).pendientes});
      setAls(function(p){var c=p.slice();var fi=c.findIndex(function(a){return a.id===al5.id});if(fi===-1)return c;
        var newMp=Object.assign({},c[fi].mp);newMp[parsed2.key]=true;
        c[fi]=Object.assign({},c[fi],{mp:newMp,pendArrastre:prevPend,hist:(c[fi].hist||[]).concat("💳 "+MN[parsed2.month]+" "+parsed2.year+(prevPend>0?" (+"+prevPend+" arrastre)":""))});return c});
      setNotif(function(p){var o=Object.assign({},p);o[al5.id]=(o[al5.id]||[]).concat("✅ Pago "+MN[parsed2.month]+" habilitado."+(prevPend>0?" Tenés "+prevPend+" clase(s) del mes anterior para recuperar.":""));return o});addLog("Pago: "+al5.nombre+" — "+MN[parsed2.month]+(prevPend>0?" (+"+prevPend+" arrastre)":""));
      var rPago="✓ "+al5.nombre+" — "+MN[parsed2.month]+" "+parsed2.year+" ("+tc2+" clases"+(tc2===5?" — 5ta regalo":"")+")\nDerecho a "+CLASES_BASE+" clases efectivas.";
      if(prevPend>0)rPago+="\n🔄 +"+prevPend+" clase(s) pendiente(s) del mes anterior arrastradas.";
      return rPago}

    return"No entendí. Probá:\n• ver alumnos P / SI\n• alumnos P hoy / SI martes\n• pagos pendientes P / SI\n• historial P / SI\n• alta, baja, pago recibido, consulta, clase regalo\n• alta profe, baja profe, ver profes"}

  function send(){if(!inp.trim())return;var txt=inp;setMsgs(function(p){return p.concat({from:"user",text:txt},{from:"bot",text:respond(txt)})});setInp("")}
  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%",background:cream}}>
      <div style={{flex:1,overflowY:"auto",padding:16}}>
        {msgs.map(function(m,i){var isBot=m.from==="bot";return(<div key={i} style={{display:"flex",justifyContent:isBot?"flex-start":"flex-end",marginBottom:10}}><div style={{maxWidth:"85%",padding:"11px 15px",borderRadius:isBot?"4px 14px 14px 14px":"14px 4px 14px 14px",background:isBot?white:navy,color:isBot?navy:cream,fontSize:14,lineHeight:1.55,whiteSpace:"pre-wrap",fontFamily:ft,border:isBot?"1px solid "+grayBlue:"none"}}>{m.text}</div></div>)})}<div ref={ref}/></div>
      <div style={{padding:12,borderTop:"1px solid "+grayBlue,display:"flex",gap:8,background:white}}>
        <input value={inp} onChange={function(e){setInp(e.target.value)}} onKeyDown={function(e){if(e.key==="Enter")send()}} placeholder="Escribí un comando..." style={{flex:1,padding:"11px 16px",borderRadius:10,border:"1px solid "+grayBlue,fontSize:14,outline:"none",fontFamily:ft,background:cream}}/>
        <button onClick={send} style={{padding:"11px 22px",borderRadius:10,background:copper,color:white,border:"none",cursor:"pointer",fontWeight:700,fontFamily:ft}}>Enviar</button>
      </div></div>);
}

function AlumnoLogin(props){
  var als=props.als;var setAls=props.setAls;var onLogin=props.onLogin;var setAdminNotifs=props.setAdminNotifs||function(){};
  var _step=useState("login");var step=_step[0];var setStep=_step[1];
  var _nom=useState("");var nom=_nom[0];var setNom=_nom[1];
  var _pw=useState("");var pw=_pw[0];var setPw=_pw[1];
  var _pw2=useState("");var pw2=_pw2[0];var setPw2=_pw2[1];
  var _err=useState("");var err=_err[0];var setErr=_err[1];
  var _found=useState(null);var found=_found[0];var setFound=_found[1];
  function doLogin(){setErr("");var idx=als.findIndex(function(a){return a.nombre.toLowerCase()===nom.toLowerCase().trim()});if(idx===-1){setErr("No encontramos ese nombre.");return}if(als[idx].estado==="baja"){setErr("Tu cuenta fue dada de baja. Contactá al taller.");return}if(als[idx].estado==="suspendido"){setErr("Tu cuenta está suspendida. Contactá al taller.");return}if(!als[idx].pw){setFound(als[idx]);setStep("setup");return}if(als[idx].pw!==pw){setErr("Contraseña incorrecta.");return}onLogin(als[idx])}
  function doSetup(){setErr("");if(pw.length<4){setErr("Mínimo 4 caracteres.");return}if(pw!==pw2){setErr("No coinciden.");return}setAls(function(p){var c=p.slice();var idx=c.findIndex(function(a){return a.id===found.id});c[idx]=Object.assign({},c[idx],{pw:pw});return c});onLogin(Object.assign({},found,{pw:pw}))}
  var iStyle={width:"100%",padding:"12px 16px",borderRadius:10,border:"1px solid "+grayBlue,fontSize:14,fontFamily:ft,background:white,outline:"none",boxSizing:"border-box"};
  var lStyle={fontSize:12,fontWeight:600,color:navy,fontFamily:ft,marginBottom:4,display:"block"};
  return(
    <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:24,background:cream}}>
      <div style={{width:"100%",maxWidth:360}}>
        <div style={{textAlign:"center",marginBottom:28}}><p style={{fontSize:28,fontFamily:"'Instrument Serif',serif",fontWeight:700,color:navy,margin:"0 0 4px"}}>EVES POTTERY</p><p style={{color:grayWarm,fontSize:14,fontFamily:ft,margin:0}}>Accedé a tus clases</p></div>
        {step==="login"?(<div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div><label style={lStyle}>Nombre completo</label><input value={nom} onChange={function(e){setNom(e.target.value)}} onKeyDown={function(e){if(e.key==="Enter")doLogin()}} placeholder="Ej: Claudia Gurisich" style={iStyle}/></div>
          <div><label style={lStyle}>Contraseña</label><input type="password" value={pw} onChange={function(e){setPw(e.target.value)}} onKeyDown={function(e){if(e.key==="Enter")doLogin()}} placeholder="Tu contraseña" style={iStyle}/></div>
          {err?<p style={{color:"#991b1b",fontSize:13,margin:0,fontFamily:ft}}>{err}</p>:null}
          <button onClick={doLogin} style={{padding:"12px",borderRadius:10,background:copper,color:white,border:"none",cursor:"pointer",fontWeight:700,fontFamily:ft,fontSize:14,width:"100%"}}>Entrar</button>
          <p style={{color:grayWarm,fontSize:12,fontFamily:ft,margin:0,textAlign:"center"}}>Primera vez? Ingresá tu nombre y te pedirá crear contraseña.</p>
          <p style={{color:copper,fontSize:12,fontFamily:ft,margin:0,textAlign:"center",cursor:"pointer",textDecoration:"underline"}} onClick={function(){if(!nom.trim()){setErr("Ingresá tu nombre primero.");return}setErr("");setStep("forgot")}}>¿Olvidaste tu contraseña?</p></div>
        ):(step==="forgot"?(<div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{background:"#fdf6ec",borderRadius:10,padding:14,border:"1px solid #e8d4b0"}}><p style={{margin:0,color:"#92651e",fontSize:14,fontFamily:ft}}>{"Solicitando nueva contraseña para: "+nom}</p></div>
          <button onClick={function(){setAdminNotifs(function(p){return p.concat({type:"resetpw",nombre:nom,ts:new Date().toLocaleString()})});setStep("forgot-sent")}} style={{padding:"12px",borderRadius:10,background:copper,color:white,border:"none",cursor:"pointer",fontWeight:700,fontFamily:ft,fontSize:14,width:"100%"}}>Solicitar al taller</button>
          <button onClick={function(){setStep("login");setErr("")}} style={{padding:"12px",borderRadius:10,background:white,color:navy,border:"1px solid "+grayBlue,cursor:"pointer",fontWeight:600,fontFamily:ft,fontSize:14,width:"100%"}}>{"← Volver"}</button></div>
        ):(step==="forgot-sent"?(<div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{background:"#f0f5e8",borderRadius:10,padding:14,border:"1px solid #b5c48a"}}><p style={{margin:0,color:"#5a6a2a",fontSize:14,fontFamily:ft}}>{"✓ Solicitud enviada. El taller te va a resetear la contraseña y te avisarán para que crees una nueva."}</p></div>
          <button onClick={function(){setStep("login");setErr("")}} style={{padding:"12px",borderRadius:10,background:white,color:navy,border:"1px solid "+grayBlue,cursor:"pointer",fontWeight:600,fontFamily:ft,fontSize:14,width:"100%"}}>{"← Volver al login"}</button></div>
        ):(<div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{background:"#f0f5e8",borderRadius:10,padding:14,border:"1px solid #b5c48a"}}><p style={{margin:0,color:"#5a6a2a",fontSize:14,fontFamily:ft}}>{"¡Hola "+found.nombre.split(" ")[0]+"! Creá tu contraseña."}</p></div>
          <div><label style={lStyle}>Contraseña</label><input type="password" value={pw} onChange={function(e){setPw(e.target.value)}} placeholder="Mínimo 4 caracteres" style={iStyle}/></div>
          <div><label style={lStyle}>Repetí</label><input type="password" value={pw2} onChange={function(e){setPw2(e.target.value)}} onKeyDown={function(e){if(e.key==="Enter")doSetup()}} placeholder="Repetí" style={iStyle}/></div>
          {err?<p style={{color:"#991b1b",fontSize:13,margin:0,fontFamily:ft}}>{err}</p>:null}
          <button onClick={doSetup} style={{padding:"12px",borderRadius:10,background:copper,color:white,border:"none",cursor:"pointer",fontWeight:700,fontFamily:ft,fontSize:14,width:"100%"}}>Crear y entrar</button>
          <button onClick={function(){setStep("login");setPw("");setPw2("");setErr("")}} style={{padding:"12px",borderRadius:10,background:white,color:navy,border:"1px solid "+grayBlue,cursor:"pointer",fontWeight:600,fontFamily:ft,fontSize:14,width:"100%"}}>{"← Volver"}</button></div>)}
      </div></div>);
}

function AlumnoCal(props){
  var al=props.al;var cuotas=props.cuotas;
  var pm=getSortedPaidMonths(al);
  var now=new Date();var currentMk=now.getFullYear()+"-"+now.getMonth();
  var displayMonths=pm.length>0?pm:[currentMk];
  var isPaid=pm.length>0;

  var all=[];
  displayMonths.forEach(function(mk){var p=parseMk(mk);var mc=classesInMonth(al.turno.dia,al.turno.hora,p.month,p.year);var cm=(al.canc||[]).filter(function(c){return c.mk===mk});
    mc.forEach(function(d){if(!cm.some(function(c){return c.iso===d.toISOString()}))all.push({date:d,extra:false,tot:mc.length})})});
  (al.ex||[]).forEach(function(e){var isCancelled=(al.canc||[]).some(function(c){return c.iso===e.date&&c.isExtra});if(!isCancelled)all.push({date:new Date(e.date),extra:true,tot:0})});
  all.sort(function(a,b){return a.date-b.date});

  var statsBlocks=isPaid?displayMonths.map(function(mk){var stats=getMonthStats(al,mk);var p=parseMk(mk);return{label:MN[p.month]+" "+p.year,stats:stats,mk:mk}}):[];
  var precioHoy=getPrecioHoy(cuotas,al.sede,"1x");
  var precio2x=getPrecioHoy(cuotas,al.sede,"2x");
  var mesName=MN[now.getMonth()];
  var arrastre=al.pendArrastre||0;

  return(
    <div style={{padding:20}}>
      <h3 style={{margin:"0 0 2px",color:navy,fontFamily:ft,fontWeight:700,fontSize:18}}>Tus clases</h3>
      <p style={{margin:"0 0 14px",color:grayWarm,fontSize:13,fontFamily:ft}}>{al.turno.dia+" "+al.turno.hora+" · "+al.sede}</p>
      {!isPaid?(<div style={{background:"#fdf6ec",borderRadius:12,padding:16,border:"1px solid #e8d4b0",marginBottom:14}}>
        <p style={{margin:0,color:copper,fontWeight:700,fontSize:15,fontFamily:ft}}>{"💳 Tu cuota de "+mesName+" está pendiente"}</p>
        <p style={{margin:"8px 0 0",color:"#92651e",fontSize:14,fontFamily:ft,fontWeight:600}}>{"Precio hoy:"}</p>
        <p style={{margin:"2px 0 0",color:"#92651e",fontSize:13,fontFamily:ft}}>{"• Efectivo: "+fmtPrecio(precioHoy.efectivo.precio)}</p>
        <p style={{margin:"2px 0 0",color:"#92651e",fontSize:13,fontFamily:ft}}>{"• Transferencia: "+fmtPrecio(precioHoy.transferencia.precio)}</p>
        <p style={{margin:"2px 0 0",color:"#92651e",fontSize:13,fontFamily:ft}}>{"• 2 veces/sem: "+fmtPrecio(precio2x.precio)}</p>
        {precioHoy.efectivo.next?(<p style={{margin:"8px 0 0",color:"#991b1b",fontSize:13,fontFamily:ft,fontWeight:600}}>
          {"⚠ Si no abonás antes del "+precioHoy.efectivo.hasta+", la cuota pasa a "+fmtPrecio(precioHoy.efectivo.next.precio)+" (efectivo) / "+fmtPrecio(precioHoy.transferencia.next.precio)+" (transf)"}</p>):null}
        {arrastre>0?(<p style={{margin:"6px 0 0",color:copper,fontSize:13,fontFamily:ft}}>{"🔄 Tenés "+arrastre+" clase(s) pendiente(s) del mes anterior. Pagá para habilitarlas."}</p>):null}
      </div>):null}
      {isPaid?displayMonths.map(function(mk){var stats=getMonthStats(al,mk);var p=parseMk(mk);return(
        <div key={mk} style={{background:"#f8f6f2",borderRadius:10,padding:"12px 14px",marginBottom:14,border:"1px solid "+grayBlue}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <span style={{fontWeight:700,color:navy,fontFamily:ft,fontSize:14}}>{MN[p.month]+" "+p.year}</span>
            <span style={{fontSize:12,color:copper,fontFamily:ft,fontWeight:600}}>{stats.clasesEfectivas+"/"+CLASES_BASE+" clases"}</span></div>
          {arrastre>0?(<div style={{background:"#f0f5e8",borderRadius:8,padding:"6px 10px",fontSize:13,color:"#5a6a2a",fontFamily:ft,border:"1px solid #b5c48a",marginBottom:4}}>{"✦ +"+arrastre+" clase(s) del mes anterior habilitadas"}</div>):null}
          {stats.pendientes>0?(<div style={{background:"#fdf6ec",borderRadius:8,padding:"6px 10px",fontSize:13,color:copper,fontFamily:ft,border:"1px solid #e8d4b0"}}>{"🔄 "+stats.pendientes+" clase(s) pendiente(s) de recuperar"}</div>):null}
          {stats.is5&&stats.cancTotal===0?(<div style={{fontSize:12,color:olive,fontFamily:ft,marginTop:4}}>{"✦ 5ta clase regalo activa (no faltaste a ninguna)"}</div>):null}
        </div>)}):null}
      {al.reg>0?<div style={{background:"#fdf6ec",border:"1px solid #e8d4b0",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:13,color:copper,fontFamily:ft}}>{"🎁 Tenés "+al.reg+" clase(s) de regalo"}</div>:null}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {all.map(function(c,i){var h=hrsUntil(c.date);var past=h<0;return(
          <div key={i} style={{padding:"14px 16px",borderRadius:10,background:past?cream:white,border:"1px solid "+(past?grayBlue:gold),opacity:past?0.45:1}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontWeight:600,color:navy,fontFamily:ft,fontSize:14}}>{fmtDate(c.date)}</span>
              {c.extra?<span style={{fontSize:11,background:olive,color:white,padding:"2px 8px",borderRadius:8,fontFamily:ft}}>recuperación</span>:null}</div>
            {!past&&h<24?<div style={{fontSize:11,color:copper,marginTop:5,fontFamily:ft}}>{"⚠ Menos de 24h"}</div>:null}
          </div>)})}</div></div>);
}

function MonthCalendarPicker(props){
  var sede=props.sede;var allAls=props.allAls;var onSelect=props.onSelect;var onBack=props.onBack;
  var validMonths=props.validMonths;var title=props.title||"Elegí una fecha";var initialMonth=props.initialMonth;
  var now=new Date();
  var _mo=useState(null);var viewMonth=_mo[0];var setViewMonth=_mo[1];
  var _selDate=useState(null);var selDate=_selDate[0];var setSelDate=_selDate[1];
  var effectiveMonth=viewMonth;
  if(!effectiveMonth){
    effectiveMonth=initialMonth||{y:now.getFullYear(),m:now.getMonth()};
  }
  var sched=SCHED[sede]||[];var dayNames=["lun","mar","mié","jue","vie","sáb","dom"];
  var firstDay=new Date(effectiveMonth.y,effectiveMonth.m,1);var lastDay=new Date(effectiveMonth.y,effectiveMonth.m+1,0);
  var startDow=firstDay.getDay();var startIdx=startDow===0?6:startDow-1;var daysInMonth=lastDay.getDate();
  var cells=[];for(var i=0;i<startIdx;i++)cells.push(null);for(var d=1;d<=daysInMonth;d++)cells.push(d);while(cells.length%7!==0)cells.push(null);
  var mk=effectiveMonth.y+"-"+effectiveMonth.m;var isValidMonth=validMonths.some(function(v){return v===mk});

  function getSlotsForDay(dayNum){
    if(!isValidMonth)return[];var date=new Date(effectiveMonth.y,effectiveMonth.m,dayNum);
    var dow=date.getDay();var dayIdx=dow===0?6:dow-1;var dayName=DAYS[dayIdx];var slots=[];
    sched.forEach(function(key){var parts=key.split("-");if(parts[0]!==dayName)return;
      var slotDate=new Date(effectiveMonth.y,effectiveMonth.m,dayNum);var tp=parts[1].split(":");
      slotDate.setHours(parseInt(tp[0]),parseInt(tp[1]),0,0);if(hrsUntil(slotDate)<=24)return;
      var cupo=getCupoForSlot(allAls,sede,parts[0],parts[1],slotDate);
      if(cupo.libre>0)slots.push({date:slotDate,dia:parts[0],hora:parts[1],cupoLibre:cupo.libre,mk:mk})});
    return slots}
  var daySlotCache={};for(var dd=1;dd<=daysInMonth;dd++)daySlotCache[dd]=getSlotsForDay(dd);
  function prevMonth(){setSelDate(null);var c=effectiveMonth;var nm=c.m-1;var ny=c.y;if(nm<0){nm=11;ny--}setViewMonth({y:ny,m:nm})}
  function nextMonth(){setSelDate(null);var c=effectiveMonth;var nm=c.m+1;var ny=c.y;if(nm>11){nm=0;ny++}setViewMonth({y:ny,m:nm})}
  var selectedSlots=selDate?daySlotCache[selDate]||[]:[];

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <p style={{margin:0,color:navy,fontWeight:700,fontFamily:ft,fontSize:15}}>{title}</p>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 4px"}}>
        <button onClick={prevMonth} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:navy,padding:"4px 10px"}}>{"‹"}</button>
        <span style={{fontWeight:700,color:navy,fontFamily:ft,fontSize:15,textTransform:"capitalize"}}>{MN[effectiveMonth.m]+" "+effectiveMonth.y}</span>
        <button onClick={nextMonth} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:navy,padding:"4px 10px"}}>{"›"}</button></div>
      {!isValidMonth?(<div style={{background:"#fdf6ec",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#92651e",fontFamily:ft,border:"1px solid #e8d4b0",textAlign:"center"}}>{"Este mes no está habilitado (no pagado)."}</div>):null}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7, 1fr)",gap:2}}>
        {dayNames.map(function(dn){return <div key={dn} style={{textAlign:"center",fontSize:11,fontWeight:700,color:grayWarm,fontFamily:ft,padding:"4px 0",textTransform:"uppercase"}}>{dn}</div>})}
        {cells.map(function(day,i){
          if(day===null)return <div key={"e"+i}/>;var slots=daySlotCache[day]||[];var hasSlots=slots.length>0;
          var isToday=now.getFullYear()===effectiveMonth.y&&now.getMonth()===effectiveMonth.m&&now.getDate()===day;
          var isPast=new Date(effectiveMonth.y,effectiveMonth.m,day)<new Date(now.getFullYear(),now.getMonth(),now.getDate());
          var isSelected=selDate===day;
          return(<button key={i} onClick={hasSlots?function(){setSelDate(selDate===day?null:day)}:undefined}
            style={{width:"100%",aspectRatio:"1",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
              border:isSelected?"2px solid "+copper:isToday?"2px solid "+gold:"1px solid "+(hasSlots?grayBlue:"transparent"),
              borderRadius:10,background:isSelected?"#fdf6ec":hasSlots?white:"transparent",cursor:hasSlots?"pointer":"default",
              fontFamily:ft,fontSize:14,fontWeight:isToday?700:500,color:isPast&&!hasSlots?"#ccc":hasSlots?navy:grayWarm,
              padding:2,opacity:isPast&&!hasSlots?0.4:1}}>
            <span>{day}</span>{hasSlots?<div style={{width:5,height:5,borderRadius:"50%",background:copper,marginTop:2}}/>:null}
          </button>)})}</div>{selDate!==null?(<div style={{display:"flex",flexDirection:"column",gap:8,marginTop:4}}>
        <p style={{margin:0,color:navy,fontWeight:600,fontFamily:ft,fontSize:13}}>{"Horarios del "+selDate+" de "+MN[effectiveMonth.m]+":"}</p>
        {selectedSlots.length>0?selectedSlots.map(function(s,i){return(
          <button key={i} onClick={function(){onSelect(s)}} style={{padding:"12px 16px",borderRadius:10,background:white,border:"1px solid "+gold,cursor:"pointer",fontFamily:ft,fontSize:14,fontWeight:600,color:navy,textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span>{s.hora+" hs"}</span><span style={{fontSize:12,color:copper,fontWeight:500}}>{s.cupoLibre+" lugar"+(s.cupoLibre>1?"es":"")}</span></button>)}):
          (<p style={{margin:0,color:grayWarm,fontSize:13,fontFamily:ft}}>No hay horarios disponibles este día.</p>)}</div>
      ):isValidMonth?(<p style={{margin:0,color:grayWarm,fontSize:12,fontFamily:ft,textAlign:"center"}}>{"Tocá un día con punto naranja para ver horarios"}</p>):null}
      <button onClick={onBack} style={{padding:"12px 18px",borderRadius:10,background:white,color:navy,border:"1px solid "+grayBlue,cursor:"pointer",fontWeight:600,fontFamily:ft,fontSize:14,width:"100%",textAlign:"left"}}>{"← Volver al menú"}</button>
    </div>);
}

function AlumnoFlow(props){
  var al=props.al;var setAls=props.setAls;var allAls=props.allAls;var setLogs=props.setLogs;var notif=props.notif;var setAdminNotifs=props.setAdminNotifs;var cuotas=props.cuotas;
  var pm=getSortedPaidMonths(al);var paid=pm.length>0;
  var now=new Date();var currentMk=now.getFullYear()+"-"+now.getMonth();
  var activeMonths=paid?pm:[currentMk];
  var _st=useState("menu");var step=_st[0];var setStep=_st[1];
  var _sel=useState(null);var sel=_sel[0];var setSel=_sel[1];
  var _cm=useState("");var cMsg=_cm[0];var setCMsg=_cm[1];
  var _cr=useState(true);var canRec=_cr[0];var setCanRec=_cr[1];
  var _nm=useState([]);var nMsgs=_nm[0];var setNMsgs=_nm[1];
  var pNC=useRef(0);
  useEffect(function(){setStep("menu");setSel(null);setCMsg("");pNC.current=0;setNMsgs([])},[al.id]);
  var aN=notif[al.id]||[];
  useEffect(function(){if(aN.length>pNC.current){setNMsgs(function(p){return p.concat(aN.slice(pNC.current))});pNC.current=aN.length}},[aN.length]);
  function addLog(a){setLogs(function(p){return p.concat({ts:new Date().toLocaleString(),action:a})})}

  var totalPendientes=0;
  activeMonths.forEach(function(mk){totalPendientes+=getMonthStats(al,mk).pendientes});
  if(paid)totalPendientes+=(al.pendArrastre||0);

  function getUp(){
    var cls=[];
    activeMonths.forEach(function(mk){var p=parseMk(mk);var mc=classesInMonth(al.turno.dia,al.turno.hora,p.month,p.year);
      var cm=(al.canc||[]).filter(function(c){return c.mk===mk});
      mc.forEach(function(d){if(hrsUntil(d)>0&&!cm.some(function(c){return c.iso===d.toISOString()}))cls.push({date:d,mk:mk,tot:mc.length,isExtra:false})})});
    (al.ex||[]).forEach(function(e){var exDate=new Date(e.date);if(hrsUntil(exDate)>0){
      var isCancelled=(al.canc||[]).some(function(c){return c.iso===e.date&&c.isExtra});
      if(!isCancelled)cls.push({date:exDate,mk:e.mk,isExtra:true,extraDate:e.date})}});
    return cls.sort(function(a,b){return a.date-b.date})}

  function getRM(){return pm.slice()}

  function getInitialCalMonth(){var ym=paidMonthToYM(al);if(ym)return ym;var now=new Date();return{y:now.getFullYear(),m:now.getMonth()}}

  function doCanc(ci){
    if(ci.isExtra){
      setAls(function(p){var c=p.slice();var idx=c.findIndex(function(a){return a.id===al.id});
        var newEx=(c[idx].ex||[]).filter(function(e){return e.date!==ci.extraDate});
        c[idx]=Object.assign({},c[idx],{ex:newEx,hist:(c[idx].hist||[]).concat("❌🔄 "+fmtDate(ci.date))});return c});
      addLog("Cancel recup: "+al.nombre+" — "+fmtDate(ci.date));setCanRec(true);setCMsg("");return}
    var stats=getMonthStats(al,ci.mk);var noR=stats.is5&&stats.cancTotal===0;
    setAls(function(p){var c=p.slice();var idx=c.findIndex(function(a){return a.id===al.id});
      c[idx]=Object.assign({},c[idx],{canc:(c[idx].canc||[]).concat({iso:ci.date.toISOString(),mk:ci.mk,noR:noR}),hist:(c[idx].hist||[]).concat((noR?"❌(5ta) ":"❌ ")+fmtDate(ci.date))});return c});
    addLog("Cancel: "+al.nombre+" — "+fmtDate(ci.date));
    if(noR){setCanRec(false);setCMsg("¡Gracias por cancelar tu clase! Te comentamos que esta clase no podrías recuperarla ya que era tu 5ta clase, que es de regalo siempre y cuando no faltes a ninguna clase en el mes.\n\nEso sí, si cancelás alguna de tus 4 clases restantes con 24 hs de antelación, podrás recuperarla sin problema.")}
    else{setCanRec(true);setCMsg("")}}

  function doResc(slot,gift){
    setAls(function(p){var c=p.slice();var idx=c.findIndex(function(a){return a.id===al.id});
      var upd={ex:(c[idx].ex||[]).concat({date:slot.date.toISOString(),mk:slot.mk}),hist:(c[idx].hist||[]).concat((gift?"🎁 ":"🔄 ")+fmtDate(slot.date))};
      if(gift)upd.reg=Math.max(0,(c[idx].reg||0)-1);
      c[idx]=Object.assign({},c[idx],upd);return c});
    addLog((gift?"Regalo":"Recup")+": "+al.nombre+" → "+fmtDate(slot.date))}

  function reset(){setStep("menu");setSel(null);setCMsg("");setCanRec(true)}
  var up=getUp();var rm=getRM();

  var bS=function(dis){return{padding:"12px 18px",borderRadius:10,cursor:dis?"default":"pointer",fontSize:14,fontWeight:600,width:"100%",fontFamily:ft,background:dis?cream:white,color:dis?grayWarm:navy,border:"1px solid "+grayBlue,textAlign:"left"}};
  var bD={padding:"12px 18px",borderRadius:10,cursor:"pointer",fontSize:14,fontWeight:600,width:"100%",fontFamily:ft,background:"#fef2f2",color:"#991b1b",border:"1px solid #fca5a5",textAlign:"left"};
  var bG={padding:"12px 18px",borderRadius:10,cursor:"pointer",fontSize:14,fontWeight:600,width:"100%",fontFamily:ft,background:"#fdf6ec",color:copper,border:"1px solid #e8d4b0",textAlign:"left"};
  var bP={padding:"12px 18px",borderRadius:10,cursor:"pointer",fontSize:14,fontWeight:600,width:"100%",fontFamily:ft,background:copper,color:white,border:"none",textAlign:"left"};

  var notifBlock=nMsgs.length>0?(<div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:10}}>{nMsgs.map(function(n,i){return <div key={i} style={{padding:"10px 14px",borderRadius:10,background:"#f0f5e8",border:"1px solid #b5c48a",fontSize:13,color:"#5a6a2a",textAlign:"center",fontFamily:ft}}>{"🔔 "+n}</div>})}</div>):null;

  var precioHoy=getPrecioHoy(cuotas,al.sede,"1x");
  var mesName=MN[new Date().getMonth()];
  var payBanner=!paid?(<div style={{background:"#fdf6ec",borderRadius:12,padding:16,border:"1px solid #e8d4b0",marginBottom:4}}>
    <p style={{margin:0,color:copper,fontWeight:700,fontSize:15,fontFamily:ft}}>{"💳 Tu cuota de "+mesName+" está pendiente"}</p>
    <p style={{margin:"6px 0 0",color:"#92651e",fontSize:13,fontFamily:ft}}>
      {"Precio hoy: Efectivo "+fmtPrecio(precioHoy.efectivo.precio)+" · Transf "+fmtPrecio(precioHoy.transferencia.precio)}</p>
    {precioHoy.efectivo.next?(<p style={{margin:"4px 0 0",color:"#991b1b",fontSize:12,fontFamily:ft,fontWeight:600}}>
      {"⚠ Después del "+precioHoy.efectivo.hasta+" aumenta a "+fmtPrecio(precioHoy.efectivo.next.precio)+" (efect) / "+fmtPrecio(precioHoy.transferencia.next.precio)+" (transf)"}</p>):null}
    <p style={{margin:"8px 0 0",color:"#92651e",fontSize:12,fontFamily:ft,fontStyle:"italic"}}>
      {"Podés ver y cancelar clases, pero para recuperar necesitás tener el pago al día."}</p>
    {step==="ps"?(<div style={{background:"#f0f5e8",borderRadius:10,padding:12,marginTop:10}}><p style={{margin:0,color:"#5a6a2a",fontSize:14,fontFamily:ft}}>{"👍 ¡Gracias! Le avisamos al equipo para habilitarte."}</p></div>
    ):(<button onClick={function(){setStep("ps");setAdminNotifs(function(p){return p.concat({type:"pago",nombre:al.nombre,sede:al.sede,turno:al.turno.dia+" "+al.turno.hora,ts:new Date().toLocaleString()})})}} style={{marginTop:10,padding:"10px 16px",borderRadius:10,background:copper,color:white,border:"none",cursor:"pointer",fontWeight:600,fontFamily:ft,fontSize:13,width:"100%"}}>{"Ya realicé el pago"}</button>)}
  </div>):null;

  var pendBadge=totalPendientes>0?(<div style={{background:"#fdf6ec",borderRadius:10,padding:"10px 14px",border:"1px solid #e8d4b0",marginBottom:4}}><span style={{fontSize:14,color:copper,fontFamily:ft,fontWeight:600}}>{"🔄 "+totalPendientes+" clase(s) pendiente(s) de recuperar"}</span></div>):null;

  return(
    <div style={{padding:18,display:"flex",flexDirection:"column",gap:10,overflowY:"auto",height:"100%"}}>
      {notifBlock}
      {step==="menu"?(<div style={{display:"flex",flexDirection:"column",gap:10}}>
        <p style={{margin:0,color:navy,fontWeight:700,fontSize:17,fontFamily:ft}}>{"Hola "+al.nombre.split(" ")[0]+" ✦"}</p>
        <p style={{margin:"0 0 4px",color:grayWarm,fontSize:14,fontFamily:ft}}>{"¿Qué necesitás?"}</p>
        {payBanner}
        {pendBadge}
        <button onClick={function(){setStep("cp")}} style={bS(false)}>{"❌  Cancelar una clase"}</button>
        {paid&&totalPendientes>0?(<button onClick={function(){setStep("rp")}} style={bS(false)}>{"🔄  Recuperar una clase ("+totalPendientes+" pendiente"+(totalPendientes>1?"s":"")+")"}</button>
        ):paid?(<button disabled style={bS(true)}>{"🔄  Recuperar una clase (0 pendientes)"}</button>
        ):(<button disabled style={bS(true)}>{"🔄  Recuperar (pago pendiente)"}</button>)}
        {paid&&al.reg>0?<button onClick={function(){setStep("go")}} style={bG}>{"🎁  Usar clase de regalo ("+al.reg+")"}</button>:null}
      </div>):null}

      {step==="cp"?(<div style={{display:"flex",flexDirection:"column",gap:10}}>
        <p style={{margin:0,color:navy,fontWeight:700,fontFamily:ft}}>{"¿Qué clase querés cancelar?"}</p>
        <p style={{margin:0,color:grayWarm,fontSize:12,fontFamily:ft}}>Incluye clases regulares y recuperaciones</p>
        {up.map(function(cl,i){var b=hrsUntil(cl.date)<24;return <button key={i} disabled={b} onClick={function(){setSel(cl);setStep("cc")}} style={bS(b)}>{fmtDate(cl.date)+(cl.isExtra?" 🔄":"")+(b?"  ·  ⚠ menos de 24h":"")}</button>})}
        {up.length===0?<p style={{margin:0,color:grayWarm,fontSize:13,fontFamily:ft}}>No tenés clases próximas para cancelar.</p>:null}
        <button onClick={reset} style={bS(false)}>{"← Volver al menú"}</button></div>):null}

      {step==="cc"&&sel?(<div style={{display:"flex",flexDirection:"column",gap:10}}>
        <p style={{margin:0,color:navy,fontWeight:700,fontFamily:ft}}>{"¿Confirmás cancelar?"}</p>
        <div style={{background:"#fdf6ec",borderRadius:10,padding:14,textAlign:"center",fontSize:15,color:copper,fontWeight:600,fontFamily:ft,border:"1px solid #e8d4b0"}}>{fmtDate(sel.date)+(sel.isExtra?" (recuperación)":"")}</div>
        {sel.isExtra?(<div style={{background:"#fdf6ec",borderRadius:10,padding:12,fontSize:13,color:"#92651e",fontFamily:ft,border:"1px solid #e8d4b0",lineHeight:1.5}}>{"ℹ️ Al cancelar esta recuperación, volvés a tener 1 clase pendiente para agendar en otro horario."}</div>
        ):(function(){var stats=getMonthStats(al,sel.mk);return stats.is5&&stats.cancTotal===0?(<div style={{background:"#fdf6ec",borderRadius:10,padding:12,fontSize:13,color:"#92651e",fontFamily:ft,border:"1px solid #e8d4b0",lineHeight:1.5}}>{"⚠ Este mes tiene 5 clases. Si cancelás esta, no podrás recuperarla (5ta regalo)."}</div>):null})()}
        <button onClick={function(){doCanc(sel);setStep("cd")}} style={bD}>{"Sí, cancelar"}</button>
        <button onClick={function(){setStep("cp")}} style={bS(false)}>{"No, volver"}</button></div>):null}

      {step==="cd"?(<div style={{display:"flex",flexDirection:"column",gap:10}}>
        {sel&&sel.isExtra?(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div style={{background:"#f0f5e8",borderRadius:12,padding:20,textAlign:"center",border:"1px solid #b5c48a"}}><p style={{fontSize:36,margin:0}}>{"✓"}</p><p style={{margin:"8px 0 0",color:navy,fontWeight:700,fontFamily:ft,fontSize:16}}>Recuperación cancelada</p><p style={{margin:"4px 0 0",color:grayWarm,fontSize:13,fontFamily:ft}}>Tenés 1 clase pendiente para reagendar</p></div>
            <button onClick={function(){setStep("rp")}} style={bS(false)}>{"🔄 Reagendar ahora"}</button>
            <button onClick={reset} style={bS(false)}>{"Volver al menú"}</button></div>
        ):canRec?(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div style={{background:"#f0f5e8",borderRadius:12,padding:20,textAlign:"center",border:"1px solid #b5c48a"}}><p style={{fontSize:36,margin:0}}>{"✓"}</p><p style={{margin:"8px 0 0",color:navy,fontWeight:700,fontFamily:ft,fontSize:16}}>Clase cancelada</p><p style={{margin:"4px 0 0",color:grayWarm,fontSize:13,fontFamily:ft}}>{"Tenés 1 clase pendiente de recuperar"}</p></div>
            <button onClick={function(){setStep("rp")}} style={bS(false)}>{"🔄 Recuperar ahora"}</button>
            <button onClick={reset} style={bS(false)}>{"No, dejarlo así"}</button></div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div style={{background:"#fdf6ec",borderRadius:12,padding:20,border:"1px solid #e8d4b0"}}><p style={{fontSize:32,margin:0,textAlign:"center"}}>{"ℹ️"}</p><p style={{margin:"10px 0 0",color:navy,fontSize:14,fontFamily:ft,lineHeight:1.6}}>{cMsg}</p></div>
            <button onClick={reset} style={bS(false)}>{"Entendido"}</button></div>
        )}</div>):null}

      {step==="rp"?(<MonthCalendarPicker key="rp" sede={al.sede} allAls={allAls} validMonths={rm} initialMonth={getInitialCalMonth()} title={"🔄 Elegí fecha para recuperar"} onSelect={function(slot){doResc(slot);setTimeout(function(){setStep("rd")},50)}} onBack={reset}/>):null}

      {step==="rd"?(<div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div style={{background:"#f0f5e8",borderRadius:12,padding:20,textAlign:"center",border:"1px solid #b5c48a"}}><p style={{fontSize:36,margin:0}}>{"✓"}</p><p style={{margin:"8px 0 0",color:navy,fontWeight:700,fontFamily:ft,fontSize:16}}>{"¡Clase recuperada!"}</p><p style={{margin:"4px 0 0",color:grayWarm,fontSize:13,fontFamily:ft}}>Ya aparece en tu calendario</p></div>
        <button onClick={reset} style={bS(false)}>{"Volver al menú"}</button></div>):null}

      {step==="go"?(<MonthCalendarPicker key="go" sede={al.sede} allAls={allAls} validMonths={rm} initialMonth={getInitialCalMonth()} title={"🎁 Elegí fecha para tu clase de regalo"} onSelect={function(slot){doResc(slot,true);setTimeout(function(){setStep("gd")},50)}} onBack={reset}/>):null}

      {step==="gd"?(<div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div style={{background:"#fdf6ec",borderRadius:12,padding:20,textAlign:"center",border:"1px solid #e8d4b0"}}><p style={{fontSize:36,margin:0}}>{"🎁"}</p><p style={{margin:"8px 0 0",color:copper,fontWeight:700,fontFamily:ft,fontSize:16}}>{"¡Clase de regalo confirmada!"}</p><p style={{margin:"4px 0 0",color:grayWarm,fontSize:13,fontFamily:ft}}>Ya aparece en tu calendario</p></div>
        <button onClick={reset} style={bS(false)}>{"Volver al menú"}</button></div>):null}
    </div>);
}function ProfeLogin(props){
  var profes=props.profes;var setProfes=props.setProfes;var onLogin=props.onLogin;
  var _step=useState("login");var step=_step[0];var setStep=_step[1];
  var _nom=useState("");var nom=_nom[0];var setNom=_nom[1];
  var _pw=useState("");var pw=_pw[0];var setPw=_pw[1];
  var _pw2=useState("");var pw2=_pw2[0];var setPw2=_pw2[1];
  var _err=useState("");var err=_err[0];var setErr=_err[1];
  var _found=useState(null);var found=_found[0];var setFound=_found[1];
  function doLogin(){setErr("");
    var idx=profes.findIndex(function(p){return p.nombre.toLowerCase()===nom.toLowerCase().trim()});
    if(idx===-1){setErr("No encontramos ese nombre.");return}
    if(!profes[idx].pw){setFound(profes[idx]);setStep("setup");return}
    if(profes[idx].pw!==pw){setErr("Contraseña incorrecta.");return}
    onLogin(profes[idx])}
  function doSetup(){setErr("");
    if(pw.length<4){setErr("Mínimo 4 caracteres.");return}
    if(pw!==pw2){setErr("No coinciden.");return}
    setProfes(function(p){var c=p.slice();var idx=c.findIndex(function(x){return x.id===found.id});c[idx]=Object.assign({},c[idx],{pw:pw});return c});
    onLogin(Object.assign({},found,{pw:pw}))}
  var iStyle={width:"100%",padding:"12px 16px",borderRadius:10,border:"1px solid "+grayBlue,fontSize:14,fontFamily:ft,background:white,outline:"none",boxSizing:"border-box"};
  var lStyle={fontSize:12,fontWeight:600,color:navy,fontFamily:ft,marginBottom:4,display:"block"};
  return(
    <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:24,background:cream}}>
      <div style={{width:"100%",maxWidth:360}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <p style={{fontSize:28,fontFamily:"'Instrument Serif',serif",fontWeight:700,color:navy,margin:"0 0 4px"}}>EVES POTTERY</p>
          <p style={{color:copper,fontSize:14,fontFamily:ft,margin:0}}>Acceso Profesoras</p></div>
        {step==="login"?(<div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div><label style={lStyle}>Nombre</label><input value={nom} onChange={function(e){setNom(e.target.value)}} onKeyDown={function(e){if(e.key==="Enter")doLogin()}} placeholder="Tu nombre" style={iStyle}/></div>
          <div><label style={lStyle}>Contraseña</label><input type="password" value={pw} onChange={function(e){setPw(e.target.value)}} onKeyDown={function(e){if(e.key==="Enter")doLogin()}} placeholder="Tu contraseña" style={iStyle}/></div>
          {err?<p style={{color:"#991b1b",fontSize:13,margin:0,fontFamily:ft}}>{err}</p>:null}
          <button onClick={doLogin} style={{padding:"12px",borderRadius:10,background:copper,color:white,border:"none",cursor:"pointer",fontWeight:700,fontFamily:ft,fontSize:14,width:"100%"}}>Entrar</button>
          <p style={{color:grayWarm,fontSize:12,fontFamily:ft,margin:0,textAlign:"center"}}>Primera vez? Ingresá tu nombre y te pedirá crear contraseña.</p></div>
        ):(<div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{background:"#f0f5e8",borderRadius:10,padding:14,border:"1px solid #b5c48a"}}><p style={{margin:0,color:"#5a6a2a",fontSize:14,fontFamily:ft}}>{"¡Hola "+found.nombre+"! Creá tu contraseña."}</p></div>
          <div><label style={lStyle}>Contraseña</label><input type="password" value={pw} onChange={function(e){setPw(e.target.value)}} placeholder="Mínimo 4 caracteres" style={iStyle}/></div>
          <div><label style={lStyle}>Repetí</label><input type="password" value={pw2} onChange={function(e){setPw2(e.target.value)}} onKeyDown={function(e){if(e.key==="Enter")doSetup()}} placeholder="Repetí" style={iStyle}/></div>
          {err?<p style={{color:"#991b1b",fontSize:13,margin:0,fontFamily:ft}}>{err}</p>:null}
          <button onClick={doSetup} style={{padding:"12px",borderRadius:10,background:copper,color:white,border:"none",cursor:"pointer",fontWeight:700,fontFamily:ft,fontSize:14,width:"100%"}}>Crear y entrar</button>
          <button onClick={function(){setStep("login");setPw("");setPw2("");setErr("")}} style={{padding:"12px",borderRadius:10,background:white,color:navy,border:"1px solid "+grayBlue,cursor:"pointer",fontWeight:600,fontFamily:ft,fontSize:14,width:"100%"}}>{"← Volver"}</button></div>)}
      </div></div>);
}

function ProfeView(props){
  var profe=props.profe;var als=props.als;var setAls=props.setAls;var setLogs=props.setLogs;
  var listasReg=props.listasReg;var setListasReg=props.setListasReg;
  var _step=useState("menu");var step=_step[0];var setStep=_step[1];
  var _selSlot=useState(null);var selSlot=_selSlot[0];var setSelSlot=_selSlot[1];
  var _lista=useState({});var lista=_lista[0];var setLista=_lista[1];
  var _resultado=useState("");var resultado=_resultado[0];var setResultado=_resultado[1];
  var _profeTab=useState("clases");var profeTab=_profeTab[0];var setProfeTab=_profeTab[1];
  var isEncargada=profe.encargada;

  function addLog(a){setLogs(function(p){return p.concat({ts:new Date().toLocaleString(),action:a})})}

  function getExpected(sede,dia,hora,dateObj){
    var dateStr=dateObj.toISOString();var expected=[];
    als.forEach(function(a){
      if(a.sede!==sede)return;
      if(a.turno.dia===dia&&a.turno.hora===hora){
        var mk=dateObj.getFullYear()+"-"+dateObj.getMonth();
        if(!(a.mp||{})[mk])return;
        var cancelled=(a.canc||[]).some(function(c){return c.iso===dateStr});
        if(!cancelled)expected.push({id:a.id,nombre:a.nombre,tipo:"fijo"})}
      (a.ex||[]).forEach(function(e){
        if(e.date===dateStr){
          var isCancelled=(a.canc||[]).some(function(c){return c.iso===e.date&&c.isExtra});
          if(!isCancelled)expected.push({id:a.id,nombre:a.nombre,tipo:"recup"})}})});
    return expected}

  function getSlots(){
    var slots=[];var now=new Date();
    profe.horarios.forEach(function(h){
      var parts=h.split("-");var dia=parts[0];var hora=parts[1];
      profe.sedes.forEach(function(sede){
        for(var d=0;d<7;d++){
          var date=new Date(now);date.setDate(date.getDate()+d);
          var dow=date.getDay();var dayIdx=dow===0?6:dow-1;
          if(DAYS[dayIdx]!==dia)continue;
          var slotDate=new Date(date);var tp=hora.split(":");
          slotDate.setHours(parseInt(tp[0]),parseInt(tp[1]),0,0);
          var expected=getExpected(sede,dia,hora,slotDate);
          slots.push({date:slotDate,dia:dia,hora:hora,sede:sede,expected:expected})}})});
    slots.sort(function(a,b){return a.date-b.date});
    return slots}

  function doLista(){
    if(!selSlot)return;
    var expected=selSlot.expected;
    var sinMarcar=expected.filter(function(e){return!lista[e.id]});
    if(sinMarcar.length>0){return}
    var presentIds=Object.keys(lista).filter(function(k){return lista[k]==="si"});
    var presentNames=presentIds.map(function(id){return als.find(function(a){return a.id===parseInt(id)})}).filter(Boolean);
    var expectedIds=expected.map(function(e){return e.id});
    var resultLines=[];var alertLines=[];
    expected.forEach(function(e){
      var wasPresent=lista[String(e.id)]==="si";
      if(wasPresent){
        resultLines.push("✓ "+e.nombre+(e.tipo==="recup"?" (recup)":""))
      }else{
        resultLines.push("✗ "+e.nombre+" — FALTA SIN AVISO");
        alertLines.push(e.nombre);
        var mk=selSlot.date.getFullYear()+"-"+selSlot.date.getMonth();
        setAls(function(p){var c=p.slice();var idx=c.findIndex(function(a){return a.id===e.id});if(idx===-1)return c;
          c[idx]=Object.assign({},c[idx],{canc:(c[idx].canc||[]).concat({iso:selSlot.date.toISOString(),mk:mk,noR:true,sinAviso:true}),
            hist:(c[idx].hist||[]).concat("⛔ Falta sin aviso "+fmtDate(selSlot.date))});return c});
        addLog("Falta sin aviso: "+e.nombre+" — "+fmtDate(selSlot.date))}});
    presentNames.forEach(function(a){
      if(!expectedIds.includes(a.id)){
        resultLines.push("⚠ "+a.nombre+" — CLASE EXTRA (no estaba anotado/a)");
        var mk=selSlot.date.getFullYear()+"-"+selSlot.date.getMonth();
        setAls(function(p){var c=p.slice();var idx=c.findIndex(function(x){return x.id===a.id});if(idx===-1)return c;
          c[idx]=Object.assign({},c[idx],{
            ex:(c[idx].ex||[]).concat({date:selSlot.date.toISOString(),mk:mk,extraUso:true}),
            hist:(c[idx].hist||[]).concat("📝 Clase extra "+fmtDate(selSlot.date))});return c});
        addLog("Clase extra: "+a.nombre+" — "+fmtDate(selSlot.date))}});
    addLog("Lista: "+profe.nombre+" — "+selSlot.dia+" "+selSlot.hora+" — "+presentIds.length+"/"+expected.length);
    setListasReg(function(p){return p.concat({profe:profe.nombre,sede:selSlot.sede,dia:selSlot.dia,hora:selSlot.hora,date:selSlot.date.toISOString(),ts:new Date().toISOString()})});
    var r="✦ Lista registrada — "+selSlot.dia+" "+selSlot.hora+"\n\n"+resultLines.join("\n");
    r+="\n\nPresentes: "+presentIds.length+" / Esperados: "+expected.length;
    if(alertLines.length)r+="\n\n⛔ Faltaron sin aviso: "+alertLines.join(", ");
    setResultado(r)}

  var slots=getSlots();
  var bS=function(dis){return{padding:"12px 18px",borderRadius:10,cursor:dis?"default":"pointer",fontSize:14,fontWeight:600,width:"100%",fontFamily:ft,background:dis?cream:white,color:dis?grayWarm:navy,border:"1px solid "+grayBlue,textAlign:"left"}};
  var bP={padding:"12px 18px",borderRadius:10,cursor:"pointer",fontSize:14,fontWeight:600,width:"100%",fontFamily:ft,background:copper,color:white,border:"none",textAlign:"left"};

  function getSedeMonth(){
    if(!isEncargada)return[];
    var sedeName=profe.sedes[0];var sched=SCHED[sedeName]||[];
    var now=new Date();var year=now.getFullYear();var month=now.getMonth();
    var latestMk=null;
    als.forEach(function(a){if(a.sede!==sedeName)return;
      Object.keys(a.mp||{}).forEach(function(mk){if(!latestMk||mk>latestMk)latestMk=mk})});
    if(latestMk){var pp=latestMk.split("-").map(Number);year=pp[0];month=pp[1]}
    var result=[];
    sched.forEach(function(key){
      var parts=key.split("-");var dia=parts[0];var hora=parts[1];
      var classes=classesInMonth(dia,hora,month,year);
      classes.forEach(function(d){
        var expected=getExpected(sedeName,dia,hora,d);
        result.push({date:d,dia:dia,hora:hora,sede:sedeName,count:expected.length,expected:expected})})});
    result.sort(function(a,b){return a.date-b.date});
    return result}

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      {isEncargada?(<div style={{display:"flex",borderBottom:"1px solid "+grayBlue}}>
        <button onClick={function(){setProfeTab("clases");setStep("menu")}} style={{flex:1,padding:"11px",border:"none",cursor:"pointer",fontSize:14,fontWeight:600,fontFamily:ft,background:profeTab==="clases"?white:cream,color:profeTab==="clases"?navy:grayWarm,borderBottom:profeTab==="clases"?"2px solid "+copper:"2px solid transparent"}}>{"📋 Mis clases"}</button>
        <button onClick={function(){setProfeTab("sede")}} style={{flex:1,padding:"11px",border:"none",cursor:"pointer",fontSize:14,fontWeight:600,fontFamily:ft,background:profeTab==="sede"?white:cream,color:profeTab==="sede"?navy:grayWarm,borderBottom:profeTab==="sede"?"2px solid "+copper:"2px solid transparent"}}>{"📊 Vista sede"}</button>
      </div>):null}

      {profeTab==="sede"&&isEncargada?(function(){
        var sedeData=getSedeMonth();
        var byDay={};sedeData.forEach(function(s){var dk=fmtDate(s.date).split(" · ")[0];if(!byDay[dk])byDay[dk]={label:dk,slots:[]};byDay[dk].slots.push(s)});
        var days=Object.values(byDay);
        return(
          <div style={{padding:18,overflowY:"auto",flex:1}}>
            <p style={{margin:"0 0 4px",color:navy,fontWeight:700,fontSize:17,fontFamily:ft}}>{"Vista "+profe.sedes[0]+" ✦"}</p>
            <p style={{margin:"0 0 14px",color:grayWarm,fontSize:13,fontFamily:ft}}>Todas las clases del mes con cantidad de alumnos anotados</p>
            {days.map(function(day,i){return(
              <div key={i} style={{marginBottom:12}}>
                <p style={{margin:"0 0 6px",color:navy,fontWeight:700,fontFamily:ft,fontSize:14,textTransform:"capitalize"}}>{day.label}</p>
                {day.slots.map(function(s,j){
                  var isPast=s.date<new Date();
                  var bg=s.count===0?"#fef2f2":s.count<4?"#fdf6ec":"#f0f5e8";
                  var borderC=s.count===0?"#fca5a5":s.count<4?"#e8d4b0":"#b5c48a";
                  var textC=s.count===0?"#991b1b":s.count<4?copper:"#5a6a2a";
                  return(
                    <div key={j} style={{padding:"10px 14px",borderRadius:10,background:bg,border:"1px solid "+borderC,marginBottom:6,opacity:isPast?0.5:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontFamily:ft,fontSize:14,fontWeight:600,color:navy}}>{s.hora+" hs"}</span>
                        <span style={{fontFamily:ft,fontSize:13,fontWeight:700,color:textC}}>{s.count+" alumno"+(s.count!==1?"s":"")}</span></div>
                      {s.count>0?(<div style={{marginTop:4,fontSize:12,color:grayWarm,fontFamily:ft}}>{s.expected.map(function(e){return e.nombre}).join(", ")}</div>):null}
                    </div>)})}</div>)})}
          </div>)})()

      :(<div style={{padding:18,display:"flex",flexDirection:"column",gap:10,overflowY:"auto",flex:1}}>
      <p style={{margin:0,color:navy,fontWeight:700,fontSize:17,fontFamily:ft}}>{"Hola "+profe.nombre+" ✦"}</p>
      <p style={{margin:"0 0 4px",color:grayWarm,fontSize:13,fontFamily:ft}}>{profe.sedes.join(", ")+" · "+profe.horarios.map(function(h){return h.replace("-"," ")}).join(", ")}</p>

      {step==="menu"?(<div style={{display:"flex",flexDirection:"column",gap:10}}>
        <p style={{margin:0,color:navy,fontWeight:600,fontFamily:ft,fontSize:14}}>Tus próximas clases:</p>
        {slots.map(function(s,i){var count=s.expected.length;var isPast=s.date<new Date();
          return <button key={i} disabled={isPast} onClick={function(){setSelSlot(s);setLista({});setResultado("");setStep("detail")}} style={bS(isPast)}>
            {fmtDate(s.date)+" — "+s.sede+" ("+count+" alumno"+(count!==1?"s":"")+")"}</button>})}
        {slots.length===0?<p style={{margin:0,color:grayWarm,fontSize:13,fontFamily:ft}}>No tenés clases próximas.</p>:null}
      </div>):null}

      {step==="detail"&&selSlot?(<div style={{display:"flex",flexDirection:"column",gap:10}}>
        <p style={{margin:0,color:navy,fontWeight:700,fontFamily:ft,fontSize:15}}>{fmtDate(selSlot.date)+" — "+selSlot.sede}</p>

        {selSlot.expected.length<4&&selSlot.sede!=="San Isidro"?(
          <div style={{background:"#fdf6ec",borderRadius:12,padding:16,border:"1px solid #e8d4b0"}}>
            <p style={{margin:0,color:copper,fontSize:14,fontFamily:ft,fontWeight:600}}>{"⚠ Son menos de 4 alumnos ("+selSlot.expected.length+")"}</p>
            <p style={{margin:"8px 0 0",color:"#92651e",fontSize:13,fontFamily:ft,lineHeight:1.5}}>Por favor hacer producción o trabajo de taller de manera paralela. Muchas gracias.</p>
            <p style={{margin:"6px 0 0",color:copper,fontSize:12,fontFamily:ft}}>Recuerda por favor enviarme la lista de presente.</p></div>
        ):(
          <div style={{background:"#f0f5e8",borderRadius:12,padding:16,border:"1px solid #b5c48a"}}>
            <p style={{margin:0,color:"#5a6a2a",fontSize:14,fontFamily:ft,fontWeight:600}}>{"✦ "+selSlot.expected.length+" alumnos — ¡Espero que disfrutes de la clase!"}</p>
            <p style={{margin:"6px 0 0",color:"#5a6a2a",fontSize:12,fontFamily:ft}}>Recuerda por favor enviarme la lista de presente.</p></div>
        )}

        <p style={{margin:"6px 0 0",color:navy,fontWeight:600,fontFamily:ft,fontSize:13}}>Alumnos esperados:</p>
        {selSlot.expected.map(function(e){var val=lista[e.id];var isPresent=val==="si";var isAbsent=val==="no";
          return(
          <div key={e.id} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:10,
            background:isPresent?"#f0f5e8":isAbsent?"#fef2f2":white,
            border:"1px solid "+(isPresent?"#b5c48a":isAbsent?"#fca5a5":grayBlue)}}>
            <button onClick={function(){setLista(function(p){var n=Object.assign({},p);n[e.id]=p[e.id]==="si"?undefined:"si";return n})}}
              style={{width:32,height:32,borderRadius:8,border:isPresent?"2px solid #5a6a2a":"1px solid "+grayBlue,
                background:isPresent?"#5a6a2a":white,color:isPresent?white:grayWarm,fontSize:16,cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{"✓"}</button>
            <button onClick={function(){setLista(function(p){var n=Object.assign({},p);n[e.id]=p[e.id]==="no"?undefined:"no";return n})}}
              style={{width:32,height:32,borderRadius:8,border:isAbsent?"2px solid #991b1b":"1px solid "+grayBlue,
                background:isAbsent?"#991b1b":white,color:isAbsent?white:grayWarm,fontSize:16,cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{"✗"}</button>
            <span style={{fontFamily:ft,fontSize:14,color:navy,fontWeight:500,flex:1}}>{e.nombre}</span>
            {e.tipo==="recup"?<span style={{fontSize:11,background:olive,color:white,padding:"2px 8px",borderRadius:8,fontFamily:ft}}>recup</span>:null}
          </div>)})}

        {(function(){var sinMarcar=selSlot.expected.filter(function(e){return!lista[e.id]});
          return sinMarcar.length>0?(<div style={{background:"#fdf6ec",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#92651e",fontFamily:ft,border:"1px solid #e8d4b0"}}>
            {"⚠ Faltan por marcar: "+sinMarcar.length+" alumno"+(sinMarcar.length>1?"s":"")}</div>):null})()}
        <p style={{margin:"10px 0 0",color:grayWarm,fontWeight:600,fontFamily:ft,fontSize:12}}>{"¿Vino alguien que no está en la lista? Buscalo:"}</p>
        <ProfeExtraSearch als={als} sede={selSlot.sede} expected={selSlot.expected} lista={lista} setLista={setLista}/>

        <button onClick={function(){doLista();var sinM=selSlot.expected.filter(function(e){return!lista[e.id]});if(sinM.length===0)setStep("done")}}
          disabled={selSlot.expected.some(function(e){return!lista[e.id]})}
          style={{padding:"12px 18px",borderRadius:10,cursor:selSlot.expected.some(function(e){return!lista[e.id]})?"default":"pointer",fontSize:14,fontWeight:600,width:"100%",fontFamily:ft,
            background:selSlot.expected.some(function(e){return!lista[e.id]})?cream:copper,
            color:selSlot.expected.some(function(e){return!lista[e.id]})?grayWarm:white,border:"none",textAlign:"left"}}>{"📋 Enviar lista de presentes"}</button>
        <button onClick={function(){setStep("menu")}} style={bS(false)}>{"← Volver"}</button>
      </div>):null}

      {step==="done"?(<div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div style={{background:"#f0f5e8",borderRadius:12,padding:20,border:"1px solid #b5c48a"}}>
          <p style={{fontSize:32,margin:0,textAlign:"center"}}>{"📋"}</p>
          <p style={{margin:"8px 0 0",color:navy,fontSize:14,fontFamily:ft,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{resultado}</p></div>
        <button onClick={function(){setStep("menu");setSelSlot(null);setLista({});setResultado("")}} style={bS(false)}>{"Volver al menú"}</button>
      </div>):null}
    </div>)}
    </div>);
}

function ProfeExtraSearch(props){
  var als=props.als;var sede=props.sede;var expected=props.expected;var lista=props.lista;var setLista=props.setLista;
  var _q=useState("");var q=_q[0];var setQ=_q[1];
  var expectedIds=expected.map(function(e){return e.id});
  var results=q.length>=2?als.filter(function(a){return a.sede===sede&&!expectedIds.includes(a.id)&&a.nombre.toLowerCase().includes(q.toLowerCase())}):[];
  return(
    <div>
      <input value={q} onChange={function(e){setQ(e.target.value)}} placeholder="Buscar alumno por nombre..."
        style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid "+grayBlue,fontSize:13,fontFamily:ft,background:white,outline:"none",boxSizing:"border-box"}}/>
      {results.map(function(a){var isPresent=lista[a.id]==="si";return(
        <div key={a.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px",marginTop:4,borderRadius:10,
          background:isPresent?"#f0f5e8":"#fdf6ec",border:"1px solid "+(isPresent?"#b5c48a":"#e8d4b0")}}>
          <button onClick={function(){setLista(function(p){var n=Object.assign({},p);n[a.id]=p[a.id]==="si"?undefined:"si";return n})}}
            style={{width:32,height:32,borderRadius:8,border:isPresent?"2px solid #5a6a2a":"1px solid "+grayBlue,
              background:isPresent?"#5a6a2a":white,color:isPresent?white:grayWarm,fontSize:16,cursor:"pointer",
              display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{"✓"}</button>
          <span style={{fontFamily:ft,fontSize:13,color:navy}}>{a.nombre}</span>
          <span style={{fontSize:11,color:copper,fontFamily:ft}}>{"("+a.turno.dia+" "+a.turno.hora+")"}</span>
        </div>)})}
    </div>);
}

var ADMIN_URL_KEY="eves2026";
var ADMIN_PASSWORD="pottery2026";
var PROFE_URL_KEY="eves2026";

function AdminGate(props){
  var onSuccess=props.onSuccess;var onBack=props.onBack;var title=props.title||"Acceso Admin";var subtitle=props.subtitle||"Ingresá la contraseña de administración";var password=props.password||ADMIN_PASSWORD;
  var _pw=useState("");var pw=_pw[0];var setPw=_pw[1];
  var _err=useState("");var err=_err[0];var setErr=_err[1];
  function check(){if(pw===password){onSuccess()}else{setErr("Contraseña incorrecta.")}}
  var iStyle={width:"100%",padding:"12px 16px",borderRadius:10,border:"1px solid "+grayBlue,fontSize:14,fontFamily:ft,background:white,outline:"none",boxSizing:"border-box"};
  return(
    <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:24,background:cream}}>
      <div style={{width:"100%",maxWidth:340}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <p style={{fontSize:22,fontFamily:"'Instrument Serif',serif",fontWeight:700,color:navy,margin:"0 0 4px"}}>{title}</p>
          <p style={{color:grayWarm,fontSize:13,fontFamily:ft,margin:0}}>{subtitle}</p></div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <input type="password" value={pw} onChange={function(e){setPw(e.target.value)}} onKeyDown={function(e){if(e.key==="Enter")check()}} placeholder="Contraseña" style={iStyle}/>
          {err?<p style={{color:"#991b1b",fontSize:13,margin:0,fontFamily:ft}}>{err}</p>:null}
          <button onClick={check} style={{padding:"12px",borderRadius:10,background:copper,color:white,border:"none",cursor:"pointer",fontWeight:700,fontFamily:ft,fontSize:14,width:"100%"}}>Entrar</button>
          <button onClick={onBack} style={{padding:"12px",borderRadius:10,background:white,color:navy,border:"1px solid "+grayBlue,cursor:"pointer",fontWeight:600,fontFamily:ft,fontSize:14,width:"100%"}}>{"← Volver"}</button>
        </div></div></div>);
}

export default function App(){
  var _als=useState(makeInit);var als=_als[0];var setAls=_als[1];
  var _profes=useState(makeInitProfes);var profes=_profes[0];var setProfes=_profes[1];
  var _logs=useState([]);var logs=_logs[0];var setLogs=_logs[1];
  var _notif=useState({});var notif=_notif[0];var setNotif=_notif[1];
  var _listasReg=useState([]);var listasReg=_listasReg[0];var setListasReg=_listasReg[1];
  var _adminNotifs=useState([]);var adminNotifs=_adminNotifs[0];var setAdminNotifs=_adminNotifs[1];
  var _cuotas=useState(DEFAULT_CUOTAS);var cuotas=_cuotas[0];var setCuotas=_cuotas[1];
  var _role=useState("alumno");var role=_role[0];var setRole=_role[1];
  var _logged=useState(null);var logged=_logged[0];var setLogged=_logged[1];
  var _loggedProfe=useState(null);var loggedProfe=_loggedProfe[0];var setLoggedProfe=_loggedProfe[1];
  var _tab=useState("cal");var tab=_tab[0];var setTab=_tab[1];
  var _adminAuth=useState(false);var adminAuth=_adminAuth[0];var setAdminAuth=_adminAuth[1];
  var cur=logged?als.find(function(a){return a.id===logged.id}):null;
  var curProfe=loggedProfe?profes.find(function(p){return p.id===loggedProfe.id}):null;

  var canShowAdmin=true;
  var canShowProfe=true;

  function goAdmin(){if(adminAuth){setRole("admin");setLogged(null);setLoggedProfe(null)}else{setRole("admin-gate")}}
  function goProfe(){setRole("profe");setLogged(null);setLoggedProfe(null)}
  function goAlumno(){setRole("alumno");setLogged(null);setLoggedProfe(null)}

  var activeRole=role==="admin"||role==="admin-gate"?"admin":role==="profe"?"profe":"alumno";

  return(
    <div style={{height:"100vh",display:"flex",flexDirection:"column",fontFamily:ft,background:cream}}>
      <div style={{background:navy,color:cream,padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontWeight:700,fontSize:19,letterSpacing:"0.5px",fontFamily:"'Instrument Serif',serif"}}>EVES POTTERY</span>
        <div style={{display:"flex",gap:4,alignItems:"center"}}>
          {(role==="alumno"&&logged)||(role==="profe"&&loggedProfe)?<button onClick={function(){setLogged(null);setLoggedProfe(null);setTab("cal")}} style={{padding:"6px 12px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontFamily:ft,background:"rgba(255,255,255,0.1)",color:grayBlue,marginRight:4}}>Salir</button>:null}
          {canShowAdmin?(<button onClick={goAdmin} style={{padding:"6px 16px",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:ft,background:activeRole==="admin"?gold:"rgba(255,255,255,0.1)",color:activeRole==="admin"?navy:grayBlue}}>Admin</button>):null}
          {canShowProfe?(<button onClick={goProfe} style={{padding:"6px 16px",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:ft,background:activeRole==="profe"?"#b5c48a":"rgba(255,255,255,0.1)",color:activeRole==="profe"?navy:grayBlue}}>Profe</button>):null}
          <button onClick={goAlumno} style={{padding:"6px 16px",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:ft,background:activeRole==="alumno"?gold:"rgba(255,255,255,0.1)",color:activeRole==="alumno"?navy:grayBlue}}>Alumno</button>
        </div></div>

      {role==="admin-gate"?(<AdminGate onSuccess={function(){setAdminAuth(true);setRole("admin");setLogged(null)}} onBack={goAlumno}/>
      ):role==="admin"?(<div style={{flex:1,overflow:"hidden"}}><AdminChat als={als} setAls={setAls} logs={logs} setLogs={setLogs} setNotif={setNotif} profes={profes} setProfes={setProfes} listasReg={listasReg} adminNotifs={adminNotifs} setAdminNotifs={setAdminNotifs} cuotas={cuotas} setCuotas={setCuotas}/></div>

      ):role==="profe"&&!loggedProfe?(<ProfeLogin profes={profes} setProfes={setProfes} onLogin={function(p){setLoggedProfe(p)}}/>
      ):role==="profe"&&curProfe?(<div style={{flex:1,overflow:"auto",background:white}}><ProfeView profe={curProfe} als={als} setAls={setAls} setLogs={setLogs} listasReg={listasReg} setListasReg={setListasReg}/></div>

      ):role==="alumno"&&!logged?(<AlumnoLogin als={als} setAls={setAls} setAdminNotifs={setAdminNotifs} onLogin={function(a){setLogged(a);setTab("cal")}}/>
      ):role==="alumno"&&cur?(<div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{padding:"10px 18px",background:white,borderBottom:"1px solid "+grayBlue}}>
            <p style={{margin:0,fontWeight:700,color:navy,fontFamily:ft,fontSize:15}}>{cur.nombre}</p>
            <p style={{margin:0,color:grayWarm,fontSize:12,fontFamily:ft}}>{cur.sede+" · "+cur.turno.dia+" "+cur.turno.hora}</p></div>
          <div style={{display:"flex",borderBottom:"1px solid "+grayBlue}}>
            <button onClick={function(){setTab("cal")}} style={{flex:1,padding:"11px",border:"none",cursor:"pointer",fontSize:14,fontWeight:600,fontFamily:ft,background:tab==="cal"?white:cream,color:tab==="cal"?navy:grayWarm,borderBottom:tab==="cal"?"2px solid "+copper:"2px solid transparent"}}>{"📅 Mis clases"}</button>
            <button onClick={function(){setTab("gest")}} style={{flex:1,padding:"11px",border:"none",cursor:"pointer",fontSize:14,fontWeight:600,fontFamily:ft,background:tab==="gest"?white:cream,color:tab==="gest"?navy:grayWarm,borderBottom:tab==="gest"?"2px solid "+copper:"2px solid transparent"}}>{"⚡ Gestionar"}</button></div>
          <div style={{flex:1,overflow:"auto",background:white}}>
            {tab==="cal"?<AlumnoCal al={cur} cuotas={cuotas}/>:null}
            {tab==="gest"?<AlumnoFlow al={cur} allAls={als} setAls={setAls} setLogs={setLogs} notif={notif} setAdminNotifs={setAdminNotifs} cuotas={cuotas}/>:null}
          </div></div>
      ):null}
    </div>);
}
