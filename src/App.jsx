import { useState, useEffect, useCallback } from "react";

// ─── STORAGE ADAPTER (localStorage) ──────────────────────────────────────────
const storage = {
  get: async (key) => {
    const v = localStorage.getItem(key);
    if (v === null) throw new Error("not found");
    return { value: v };
  },
  set: async (key, value) => {
    localStorage.setItem(key, value);
    return { value };
  },
  delete: async (key) => {
    localStorage.removeItem(key);
    return { deleted: true };
  },
};


// ─── 48 EQUIPOS ──────────────────────────────────────────────────────────────
const TEAMS_DATA = {
  México:         { fifa:15, valor:390, forma:63, odds:60,  contexto:88, cohesion:72, torneos:75, xGF:1.4, xGA:1.1, cornersF:5.2, cornersA:4.8, bandera:"🇲🇽", grupo:"A" },
  Sudáfrica:      { fifa:38, valor:120, forma:55, odds:100, contexto:50, cohesion:55, torneos:40, xGF:0.9, xGA:1.3, cornersF:4.1, cornersA:5.2, bandera:"🇿🇦", grupo:"A" },
  Corea_del_Sur:  { fifa:22, valor:290, forma:64, odds:72,  contexto:60, cohesion:68, torneos:62, xGF:1.3, xGA:1.0, cornersF:5.0, cornersA:4.5, bandera:"🇰🇷", grupo:"A" },
  Rep_Checa:      { fifa:37, valor:270, forma:60, odds:85,  contexto:48, cohesion:60, torneos:45, xGF:1.1, xGA:1.2, cornersF:4.5, cornersA:4.8, bandera:"🇨🇿", grupo:"A" },
  Canadá:         { fifa:27, valor:280, forma:62, odds:70,  contexto:82, cohesion:65, torneos:38, xGF:1.2, xGA:1.1, cornersF:4.8, cornersA:4.6, bandera:"🇨🇦", grupo:"B" },
  Bosnia:         { fifa:60, valor:145, forma:52, odds:110, contexto:45, cohesion:58, torneos:30, xGF:0.9, xGA:1.4, cornersF:4.0, cornersA:5.0, bandera:"🇧🇦", grupo:"B" },
  Qatar:          { fifa:58, valor:80,  forma:44, odds:150, contexto:42, cohesion:60, torneos:32, xGF:0.8, xGA:1.5, cornersF:3.8, cornersA:5.3, bandera:"🇶🇦", grupo:"B" },
  Suiza:          { fifa:17, valor:340, forma:68, odds:50,  contexto:55, cohesion:70, torneos:60, xGF:1.4, xGA:0.9, cornersF:5.1, cornersA:4.3, bandera:"🇨🇭", grupo:"B" },
  Brasil:         { fifa:5,  valor:980, forma:86, odds:12,  contexto:75, cohesion:78, torneos:90, xGF:2.1, xGA:0.7, cornersF:6.5, cornersA:3.8, bandera:"🇧🇷", grupo:"C" },
  Marruecos:      { fifa:11, valor:360, forma:76, odds:40,  contexto:70, cohesion:74, torneos:72, xGF:1.5, xGA:0.8, cornersF:5.3, cornersA:4.0, bandera:"🇲🇦", grupo:"C" },
  Haití:          { fifa:95, valor:45,  forma:38, odds:200, contexto:35, cohesion:48, torneos:20, xGF:0.7, xGA:1.8, cornersF:3.5, cornersA:5.8, bandera:"🇭🇹", grupo:"C" },
  Escocia:        { fifa:36, valor:265, forma:59, odds:90,  contexto:48, cohesion:65, torneos:42, xGF:1.1, xGA:1.2, cornersF:4.6, cornersA:4.7, bandera:"🏴󠁧󠁢󠁳󠁣󠁴󠁿", grupo:"C" },
  EE_UU:          { fifa:14, valor:410, forma:65, odds:55,  contexto:85, cohesion:67, torneos:65, xGF:1.5, xGA:1.1, cornersF:5.4, cornersA:4.5, bandera:"🇺🇸", grupo:"D" },
  Paraguay:       { fifa:30, valor:180, forma:58, odds:90,  contexto:52, cohesion:62, torneos:50, xGF:1.0, xGA:1.2, cornersF:4.3, cornersA:5.0, bandera:"🇵🇾", grupo:"D" },
  Australia:      { fifa:23, valor:220, forma:60, odds:85,  contexto:55, cohesion:63, torneos:55, xGF:1.1, xGA:1.1, cornersF:4.5, cornersA:4.6, bandera:"🇦🇺", grupo:"D" },
  Turquía:        { fifa:28, valor:300, forma:61, odds:80,  contexto:50, cohesion:61, torneos:48, xGF:1.2, xGA:1.2, cornersF:4.7, cornersA:4.8, bandera:"🇹🇷", grupo:"D" },
  Alemania:       { fifa:7,  valor:820, forma:80, odds:20,  contexto:68, cohesion:74, torneos:85, xGF:1.9, xGA:0.8, cornersF:6.2, cornersA:3.9, bandera:"🇩🇪", grupo:"E" },
  Curazao:        { fifa:82, valor:30,  forma:35, odds:250, contexto:30, cohesion:50, torneos:15, xGF:0.6, xGA:2.0, cornersF:3.2, cornersA:6.0, bandera:"🇨🇼", grupo:"E" },
  Costa_Marfil:   { fifa:32, valor:190, forma:60, odds:88,  contexto:52, cohesion:60, torneos:50, xGF:1.2, xGA:1.2, cornersF:4.5, cornersA:4.8, bandera:"🇨🇮", grupo:"E" },
  Ecuador:        { fifa:39, valor:170, forma:61, odds:80,  contexto:52, cohesion:62, torneos:52, xGF:1.1, xGA:1.1, cornersF:4.4, cornersA:4.7, bandera:"🇪🇨", grupo:"E" },
  Países_Bajos:   { fifa:8,  valor:720, forma:78, odds:25,  contexto:65, cohesion:72, torneos:78, xGF:1.8, xGA:0.9, cornersF:6.0, cornersA:4.0, bandera:"🇳🇱", grupo:"F" },
  Japón:          { fifa:17, valor:320, forma:75, odds:48,  contexto:58, cohesion:75, torneos:65, xGF:1.5, xGA:0.9, cornersF:5.4, cornersA:4.1, bandera:"🇯🇵", grupo:"F" },
  Suecia:         { fifa:24, valor:255, forma:61, odds:88,  contexto:50, cohesion:66, torneos:55, xGF:1.2, xGA:1.1, cornersF:4.8, cornersA:4.6, bandera:"🇸🇪", grupo:"F" },
  Túnez:          { fifa:33, valor:135, forma:56, odds:100, contexto:48, cohesion:62, torneos:45, xGF:0.9, xGA:1.3, cornersF:4.0, cornersA:5.0, bandera:"🇹🇳", grupo:"F" },
  Bélgica:        { fifa:9,  valor:680, forma:72, odds:35,  contexto:55, cohesion:65, torneos:70, xGF:1.7, xGA:1.0, cornersF:5.8, cornersA:4.2, bandera:"🇧🇪", grupo:"G" },
  Egipto:         { fifa:34, valor:140, forma:57, odds:95,  contexto:52, cohesion:60, torneos:48, xGF:1.0, xGA:1.2, cornersF:4.2, cornersA:4.9, bandera:"🇪🇬", grupo:"G" },
  Irán:           { fifa:21, valor:130, forma:56, odds:110, contexto:45, cohesion:65, torneos:50, xGF:0.9, xGA:1.1, cornersF:4.0, cornersA:4.8, bandera:"🇮🇷", grupo:"G" },
  Nueva_Zelanda:  { fifa:93, valor:35,  forma:36, odds:220, contexto:32, cohesion:52, torneos:18, xGF:0.7, xGA:1.9, cornersF:3.4, cornersA:5.7, bandera:"🇳🇿", grupo:"G" },
  España:         { fifa:1,  valor:1050,forma:92, odds:14,  contexto:78, cohesion:88, torneos:92, xGF:2.2, xGA:0.6, cornersF:6.8, cornersA:3.5, bandera:"🇪🇸", grupo:"H" },
  Cabo_Verde:     { fifa:68, valor:65,  forma:48, odds:160, contexto:40, cohesion:58, torneos:28, xGF:0.8, xGA:1.5, cornersF:3.8, cornersA:5.4, bandera:"🇨🇻", grupo:"H" },
  Arabia_Saudita: { fifa:56, valor:110, forma:50, odds:120, contexto:48, cohesion:62, torneos:42, xGF:0.9, xGA:1.3, cornersF:4.0, cornersA:5.1, bandera:"🇸🇦", grupo:"H" },
  Uruguay:        { fifa:16, valor:380, forma:70, odds:42,  contexto:65, cohesion:70, torneos:72, xGF:1.5, xGA:0.9, cornersF:5.2, cornersA:4.2, bandera:"🇺🇾", grupo:"H" },
  Francia:        { fifa:3,  valor:1100,forma:85, odds:13,  contexto:80, cohesion:80, torneos:90, xGF:2.0, xGA:0.7, cornersF:6.5, cornersA:3.7, bandera:"🇫🇷", grupo:"I" },
  Senegal:        { fifa:20, valor:260, forma:66, odds:65,  contexto:55, cohesion:68, torneos:60, xGF:1.3, xGA:1.0, cornersF:4.9, cornersA:4.4, bandera:"🇸🇳", grupo:"I" },
  Irak:           { fifa:57, valor:55,  forma:50, odds:130, contexto:42, cohesion:62, torneos:38, xGF:1.0, xGA:1.2, cornersF:4.1, cornersA:4.9, bandera:"🇮🇶", grupo:"I" },
  Noruega:        { fifa:29, valor:350, forma:69, odds:55,  contexto:48, cohesion:65, torneos:42, xGF:1.6, xGA:1.0, cornersF:5.3, cornersA:4.3, bandera:"🇳🇴", grupo:"I" },
  Argentina:      { fifa:2,  valor:920, forma:90, odds:16,  contexto:88, cohesion:90, torneos:95, xGF:2.1, xGA:0.6, cornersF:6.4, cornersA:3.6, bandera:"🇦🇷", grupo:"J" },
  Argelia:        { fifa:35, valor:160, forma:58, odds:95,  contexto:50, cohesion:62, torneos:45, xGF:1.0, xGA:1.2, cornersF:4.3, cornersA:4.9, bandera:"🇩🇿", grupo:"J" },
  Austria:        { fifa:25, valor:310, forma:65, odds:68,  contexto:50, cohesion:66, torneos:48, xGF:1.3, xGA:1.1, cornersF:4.9, cornersA:4.5, bandera:"🇦🇹", grupo:"J" },
  Jordania:       { fifa:66, valor:50,  forma:42, odds:180, contexto:38, cohesion:55, torneos:25, xGF:0.7, xGA:1.6, cornersF:3.6, cornersA:5.5, bandera:"🇯🇴", grupo:"J" },
  Portugal:       { fifa:6,  valor:870, forma:84, odds:18,  contexto:70, cohesion:76, torneos:80, xGF:2.0, xGA:0.8, cornersF:6.3, cornersA:3.8, bandera:"🇵🇹", grupo:"K" },
  RD_Congo:       { fifa:46, valor:95,  forma:55, odds:115, contexto:45, cohesion:60, torneos:42, xGF:1.1, xGA:1.1, cornersF:4.3, cornersA:4.7, bandera:"🇨🇩", grupo:"K" },
  Uzbekistán:     { fifa:63, valor:70,  forma:45, odds:170, contexto:38, cohesion:58, torneos:22, xGF:0.8, xGA:1.5, cornersF:3.7, cornersA:5.4, bandera:"🇺🇿", grupo:"K" },
  Colombia:       { fifa:13, valor:420, forma:73, odds:38,  contexto:60, cohesion:70, torneos:68, xGF:1.6, xGA:0.9, cornersF:5.5, cornersA:4.1, bandera:"🇨🇴", grupo:"K" },
  Inglaterra:     { fifa:4,  valor:1000,forma:82, odds:15,  contexto:72, cohesion:75, torneos:78, xGF:1.9, xGA:0.8, cornersF:6.1, cornersA:3.9, bandera:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", grupo:"L" },
  Croacia:        { fifa:10, valor:460, forma:74, odds:45,  contexto:72, cohesion:72, torneos:80, xGF:1.5, xGA:0.9, cornersF:5.3, cornersA:4.2, bandera:"🇭🇷", grupo:"L" },
  Ghana:          { fifa:72, valor:105, forma:48, odds:130, contexto:45, cohesion:55, torneos:42, xGF:0.9, xGA:1.4, cornersF:4.1, cornersA:5.1, bandera:"🇬🇭", grupo:"L" },
  Panamá:         { fifa:44, valor:90,  forma:46, odds:145, contexto:42, cohesion:60, torneos:38, xGF:0.8, xGA:1.4, cornersF:3.9, cornersA:5.2, bandera:"🇵🇦", grupo:"L" },
};

// ─── EQUIPOS SOLO PARA SIMULADOR ────────────────────────────────────────────
const SIM_ONLY_TEAMS = {
  Islandia:    { fifa:68,  valor:85,  forma:58, odds:110, contexto:45, cohesion:65, torneos:42, xGF:1.1, xGA:1.1, cornersF:4.5, cornersA:4.8, bandera:"🇮🇸" },
  Irlanda:     { fifa:52,  valor:120, forma:55, odds:115, contexto:42, cohesion:62, torneos:38, xGF:1.0, xGA:1.2, cornersF:4.3, cornersA:4.9, bandera:"🇮🇪" },
  Irlanda_N:   { fifa:74,  valor:70,  forma:50, odds:130, contexto:40, cohesion:60, torneos:30, xGF:0.9, xGA:1.3, cornersF:4.1, cornersA:5.0, bandera:"🇬🇧" },
  Finlandia:   { fifa:55,  valor:95,  forma:52, odds:120, contexto:42, cohesion:60, torneos:32, xGF:0.9, xGA:1.2, cornersF:4.2, cornersA:4.8, bandera:"🇫🇮" },
  Macedonia_N: { fifa:67,  valor:75,  forma:50, odds:125, contexto:40, cohesion:58, torneos:30, xGF:0.9, xGA:1.3, cornersF:4.0, cornersA:5.0, bandera:"🇲🇰" },
  Serbia:      { fifa:33,  valor:310, forma:65, odds:75,  contexto:48, cohesion:64, torneos:50, xGF:1.3, xGA:1.0, cornersF:4.9, cornersA:4.4, bandera:"🇷🇸" },
  Honduras:    { fifa:80,  valor:60,  forma:44, odds:145, contexto:38, cohesion:55, torneos:35, xGF:0.8, xGA:1.5, cornersF:3.8, cornersA:5.3, bandera:"🇭🇳" },
  Costa_Rica:  { fifa:49,  valor:95,  forma:52, odds:118, contexto:42, cohesion:60, torneos:48, xGF:1.0, xGA:1.2, cornersF:4.2, cornersA:4.8, bandera:"🇨🇷" },
  Chile:       { fifa:43,  valor:185, forma:60, odds:88,  contexto:52, cohesion:62, torneos:65, xGF:1.2, xGA:1.1, cornersF:4.7, cornersA:4.5, bandera:"🇨🇱" },
  Bolivia:     { fifa:85,  valor:50,  forma:42, odds:155, contexto:38, cohesion:55, torneos:30, xGF:0.8, xGA:1.6, cornersF:3.7, cornersA:5.4, bandera:"🇧🇴" },
  Peru:        { fifa:77,  valor:110, forma:50, odds:125, contexto:42, cohesion:58, torneos:45, xGF:1.0, xGA:1.3, cornersF:4.2, cornersA:4.9, bandera:"🇵🇪" },
  Venezuela:   { fifa:45,  valor:155, forma:62, odds:95,  contexto:48, cohesion:60, torneos:40, xGF:1.1, xGA:1.1, cornersF:4.4, cornersA:4.6, bandera:"🇻🇪" },
  Guatemala:   { fifa:88,  valor:40,  forma:40, odds:165, contexto:35, cohesion:52, torneos:25, xGF:0.7, xGA:1.6, cornersF:3.6, cornersA:5.5, bandera:"🇬🇹" },
  Nicaragua:   { fifa:120, valor:20,  forma:32, odds:220, contexto:28, cohesion:48, torneos:15, xGF:0.6, xGA:2.0, cornersF:3.2, cornersA:6.0, bandera:"🇳🇮" },
  El_Salvador: { fifa:92,  valor:35,  forma:38, odds:175, contexto:32, cohesion:52, torneos:22, xGF:0.7, xGA:1.7, cornersF:3.5, cornersA:5.6, bandera:"🇸🇻" },
  Nigeria:     { fifa:40,  valor:210, forma:62, odds:90,  contexto:50, cohesion:58, torneos:55, xGF:1.3, xGA:1.1, cornersF:4.8, cornersA:4.5, bandera:"🇳🇬" },
  Madagascar:  { fifa:105, valor:18,  forma:30, odds:240, contexto:25, cohesion:48, torneos:12, xGF:0.5, xGA:2.1, cornersF:3.0, cornersA:6.2, bandera:"🇲🇬" },
  Burundi:     { fifa:115, valor:15,  forma:28, odds:260, contexto:22, cohesion:45, torneos:10, xGF:0.5, xGA:2.2, cornersF:2.9, cornersA:6.3, bandera:"🇧🇮" },
  Trinidad_T:  { fifa:98,  valor:30,  forma:36, odds:190, contexto:30, cohesion:50, torneos:20, xGF:0.7, xGA:1.8, cornersF:3.4, cornersA:5.7, bandera:"🇹🇹" },
  Eslovenia:   { fifa:57,  valor:130, forma:58, odds:108, contexto:44, cohesion:62, torneos:35, xGF:1.1, xGA:1.1, cornersF:4.4, cornersA:4.6, bandera:"🇸🇮" },
  Venezuela:   { fifa:45,  valor:155, forma:62, odds:95,  contexto:48, cohesion:60, torneos:40, xGF:1.1, xGA:1.1, cornersF:4.4, cornersA:4.6, bandera:"🇻🇪" },
};
const ALL_SIM_TEAMS = { ...TEAMS_DATA, ...SIM_ONLY_TEAMS };

const FRIENDLIES_BASE = [
  // ── 26 MAYO ──
  { id:"f00", home:"Marruecos",     away:"Burundí",         date:"26 may", label:"Marruecos vs Burundí" },
  // ── 29 MAYO ──
  { id:"f29a",home:"Bosnia",        away:"Macedonia_N",     date:"29 may", label:"Bosnia vs Macedonia N." },
  // ── 30 MAYO ──
  { id:"f30a",home:"Escocia",       away:"Curazao",         date:"30 may", label:"Escocia vs Curazao" },
  { id:"f30b",home:"Ecuador",       away:"Arabia_Saudita",  date:"30 may", label:"Ecuador vs Arabia Saudita" },
  { id:"f30c",home:"Corea_del_Sur", away:"Trinidad_T",      date:"30 may", label:"Corea del Sur vs Trinidad" },
  { id:"f02", home:"México",        away:"Australia",       date:"30 may", label:"México vs Australia" },
  // ── 31 MAYO ──
  { id:"f08", home:"Japón",         away:"Islandia",        date:"31 may", label:"Japón vs Islandia" },
  { id:"f31b",home:"Suiza",         away:"Jordania",        date:"31 may", label:"Suiza vs Jordania" },
  { id:"f31c",home:"Cabo_Verde",    away:"Serbia",          date:"31 may", label:"Cabo Verde vs Serbia" },
  { id:"f09", home:"Alemania",      away:"Finlandia",       date:"31 may", label:"Alemania vs Finlandia" },
  { id:"f01", home:"EE_UU",         away:"Senegal",         date:"31 may", label:"EE.UU. vs Senegal" },
  { id:"f03", home:"Brasil",        away:"Panamá",          date:"31 may", label:"Brasil vs Panamá" },
  // ── 1 JUNIO ──
  { id:"f13", home:"Noruega",       away:"Suecia",          date:"1 jun",  label:"Noruega vs Suecia" },
  { id:"f1b", home:"Turquía",       away:"Macedonia_N",     date:"1 jun",  label:"Turquía vs Macedonia N." },
  { id:"f1c", home:"Austria",       away:"Túnez",           date:"1 jun",  label:"Austria vs Túnez" },
  { id:"f14", home:"Colombia",      away:"Costa_Rica",      date:"1 jun",  label:"Colombia vs Costa Rica" },
  { id:"f1e", home:"Canadá",        away:"Uzbekistán",      date:"1 jun",  label:"Canadá vs Uzbekistán" },
  // ── 2 JUNIO ──
  { id:"f2a", home:"Croacia",       away:"Bélgica",         date:"2 jun",  label:"Croacia vs Bélgica" },
  { id:"f2b", home:"Marruecos",     away:"Madagascar",      date:"2 jun",  label:"Marruecos vs Madagascar" },
  { id:"f2c", home:"Haití",         away:"Nueva_Zelanda",   date:"2 jun",  label:"Haití vs Nueva Zelanda" },
  // ── 3 JUNIO ──
  { id:"f3a", home:"Países_Bajos",  away:"Argelia",         date:"3 jun",  label:"Países Bajos vs Argelia" },
  { id:"f04", home:"Corea_del_Sur", away:"El_Salvador",     date:"3 jun",  label:"Corea del Sur vs El Salvador" },
  // ── 4 JUNIO ──
  { id:"f05", home:"España",        away:"Irak",            date:"4 jun",  label:"España vs Irak" },
  { id:"f06", home:"Francia",       away:"Costa_Marfil",    date:"4 jun",  label:"Francia vs C. Marfil" },
  { id:"f4c", home:"México",        away:"Serbia",          date:"4 jun",  label:"México vs Serbia" },
  // ── 5 JUNIO ──
  { id:"f5a", home:"Paraguay",      away:"Nicaragua",       date:"5 jun",  label:"Paraguay vs Nicaragua" },
  { id:"f5b", home:"Canadá",        away:"Irlanda",         date:"5 jun",  label:"Canadá vs Irlanda" },
  { id:"f5c", home:"Haití",         away:"Perú",            date:"5 jun",  label:"Haití vs Perú" },
  // ── 6 JUNIO ──
  { id:"f12", home:"Bélgica",       away:"Túnez",           date:"6 jun",  label:"Bélgica vs Túnez" },
  { id:"f15", home:"Portugal",      away:"Chile",           date:"6 jun",  label:"Portugal vs Chile" },
  { id:"f6c", home:"EE_UU",         away:"Alemania",        date:"6 jun",  label:"EE.UU. vs Alemania" },
  { id:"f6d", home:"Suiza",         away:"Australia",       date:"6 jun",  label:"Suiza vs Australia" },
  { id:"f6e", home:"Inglaterra",    away:"Nueva_Zelanda",   date:"6 jun",  label:"Inglaterra vs Nueva Zelanda" },
  { id:"f6f", home:"Brasil",        away:"Egipto",          date:"6 jun",  label:"Brasil vs Egipto" },
  { id:"f6g", home:"Turquía",       away:"Venezuela",       date:"6 jun",  label:"Turquía vs Venezuela" },
  { id:"f11", home:"Argentina",     away:"Honduras",        date:"6 jun",  label:"Argentina vs Honduras" },
  // ── 7 JUNIO ──
  { id:"f7a", home:"Croacia",       away:"Eslovenia",       date:"7 jun",  label:"Croacia vs Eslovenia" },
  { id:"f7b", home:"Marruecos",     away:"Noruega",         date:"7 jun",  label:"Marruecos vs Noruega" },
  { id:"f7c", home:"Ecuador",       away:"Guatemala",       date:"7 jun",  label:"Ecuador vs Guatemala" },
  { id:"f14b",home:"Colombia",      away:"Jordania",        date:"7 jun",  label:"Colombia vs Jordania" },
  // ── 8 JUNIO ──
  { id:"f07", home:"Países_Bajos",  away:"Uzbekistán",      date:"8 jun",  label:"Países Bajos vs Uzbekistán" },
  { id:"f16", home:"Francia",       away:"Irlanda_N",       date:"8 jun",  label:"Francia vs Irlanda N." },
  { id:"f17", home:"España",        away:"Perú",            date:"8 jun",  label:"España vs Perú" },
  // ── 9 JUNIO ──
  { id:"f9a", home:"Arabia_Saudita",away:"Senegal",         date:"9 jun",  label:"Arabia Saudita vs Senegal" },
  { id:"f18", home:"Argentina",     away:"Islandia",        date:"9 jun",  label:"Argentina vs Islandia" },
  { id:"f9c", home:"Irak",          away:"Venezuela",       date:"9 jun",  label:"Irak vs Venezuela" },
  // ── 10 JUNIO ──
  { id:"f10a",home:"Portugal",      away:"Nigeria",         date:"10 jun", label:"Portugal vs Nigeria" },
  { id:"f10b",home:"Inglaterra",    away:"Costa_Rica",      date:"10 jun", label:"Inglaterra vs Costa Rica" },
  { id:"f10c",home:"Austria",       away:"Guatemala",       date:"10 jun", label:"Austria vs Guatemala" },
];

// ─── MODEL ENGINE ────────────────────────────────────────────────────────────
function calcScore(team, adjustments = {}) {
  const t = TEAMS_DATA[team] || SIM_ONLY_TEAMS[team];
  if (!t) return 0;
  const adj = adjustments[team] || {};
  const fifaScore    = Math.max(0, 100 - (t.fifa - 1) * 1.4);
  const valorScore   = Math.min(100, (t.valor / 1100) * 100);
  const formaScore   = Math.min(100, t.forma + (adj.formaBonus || 0));
  const oddsScore    = Math.max(0, 100 - t.odds * 0.65);
  const contextoScore= t.contexto;
  const cohesionScore= t.cohesion;
  const torneosScore = t.torneos;
  return Math.round((
    fifaScore * 0.20 + valorScore * 0.18 + formaScore * 0.20 +
    oddsScore * 0.17 + contextoScore * 0.15 +
    cohesionScore * 0.06 + torneosScore * 0.04
  ) * 10) / 10;
}

function predictMatch(homeKey, awayKey, adjustments = {}) {
  const sh = calcScore(homeKey, adjustments);
  const sa = calcScore(awayKey, adjustments);
  const ht = TEAMS_DATA[homeKey] || SIM_ONLY_TEAMS[homeKey];
  const at = TEAMS_DATA[awayKey] || SIM_ONLY_TEAMS[awayKey];
  const diff = sh - sa;
  const homeAdj = diff + 4;
  const prob_home = Math.min(0.82, Math.max(0.08, 0.5 + homeAdj / 110));
  const prob_away = Math.min(0.82, Math.max(0.08, 0.5 - homeAdj / 110));
  const prob_draw = Math.max(0.10, 1 - prob_home - prob_away);
  const xGHome = ht ? Math.round(((0.7 + (sh/100)*1.5)*0.6 + ht.xGF*0.4)*10)/10 : 1.2;
  const xGAway = at ? Math.round(((0.5 + (sa/100)*1.3)*0.6 + at.xGF*0.4)*10)/10 : 1.0;
  const totalXG = Math.round((xGHome + xGAway)*10)/10;
  const cornH = ht ? Math.round(((3.5+(sh/100)*3)*0.6+ht.cornersF*0.4)*10)/10 : 5.0;
  const cornA = at ? Math.round(((3.0+(sa/100)*2.8)*0.6+at.cornersF*0.4)*10)/10 : 4.5;
  const totalCorners = Math.round((cornH+cornA)*10)/10;
  return {
    prob_home: Math.round(prob_home*100),
    prob_draw:  Math.round(prob_draw*100),
    prob_away: Math.round(prob_away*100),
    xGHome, xGAway, totalXG,
    over25: totalXG > 2.5,
    cornH, cornA, totalCorners,
    predicted_result: homeAdj>10?"1":homeAdj<-10?"2":"X",
  };
}

const teamLabel = (t) => (t||"").replace(/_/g," ");
const flag = (t) => (TEAMS_DATA[t] || SIM_ONLY_TEAMS[t])?.bandera ?? "🏳️";

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("feed");
  const [results, setResults] = useState({});       // { fId: {hG,aG,hC,aC,notes} }
  const [adjustments, setAdjustments] = useState({}); // learned form corrections
  const [expanded, setExpanded] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [aiInsight, setAiInsight] = useState({});   // { fId: { text, loading } }
  const [customH, setCustomH] = useState("España");
  const [customA, setCustomA] = useState("Argentina");
  const [simPred, setSimPred] = useState(null);
  const [simForm, setSimForm] = useState({});
  const [simSubmitted, setSimSubmitted] = useState(false);
  const [simResultData, setSimResultData] = useState(null);
  const [simWebAnalysis, setSimWebAnalysis] = useState(null);
  const [loaded, setLoaded] = useState(false);
  // ── Backup state ──
  const [showBackup, setShowBackup] = useState(false);
  const [backupText, setBackupText] = useState("");
  const [importText, setImportText] = useState("");
  const [backupMode, setBackupMode] = useState("export");
  const [backupMsg, setBackupMsg] = useState("");
  // ── Bracket state ──
  const [groupStandings, setGroupStandings] = useState({}); // { "A": [{team,pts,gf,ga,played},...] }
  const [confirmedQualifiers, setConfirmedQualifiers] = useState({}); // { "A": {first:"X", second:"Y", third:"Z"} }
  const [knockoutMatches, setKnockoutMatches] = useState({}); // { "R16-1": {home,away,hG,aG,hC,aC,notes,confirmed} }
  const [bracketInsight, setBracketInsight] = useState({});
  const [editingGroup, setEditingGroup] = useState(null);
  const [editingKO, setEditingKO] = useState(null);
  const [koForm, setKoForm] = useState({});

  // ── STORAGE: load ──
  useEffect(() => {
    const loadData = async () => {
      try {
        const r = await window.storage.get("mw2026-results");
        if (r) setResults(JSON.parse(r.value));
      } catch(_) {}
      try {
        const a = await window.storage.get("mw2026-adjustments");
        if (a) setAdjustments(JSON.parse(a.value));
      } catch(_) {}
      try {
        const gs = await window.storage.get("mw2026-groupstandings");
        if (gs) setGroupStandings(JSON.parse(gs.value));
      } catch(_) {}
      try {
        const cq = await window.storage.get("mw2026-qualifiers");
        if (cq) setConfirmedQualifiers(JSON.parse(cq.value));
      } catch(_) {}
      try {
        const km = await window.storage.get("mw2026-knockout");
        if (km) setKnockoutMatches(JSON.parse(km.value));
      } catch(_) {}
      setLoaded(true);
    };
    loadData();
  }, []);

  // ── STORAGE: save results ──
  const saveResults = useCallback(async (newR) => {
    try { await window.storage.set("mw2026-results", JSON.stringify(newR)); } catch(_) {}
  }, []);

  // ── STORAGE: save adjustments ──
  const saveAdjustments = useCallback(async (newA) => {
    try { await window.storage.set("mw2026-adjustments", JSON.stringify(newA)); } catch(_) {}
  }, []);

  const saveGroupStandings = async (v) => {
    try { await window.storage.set("mw2026-groupstandings", JSON.stringify(v)); } catch(_) {}
  };
  const saveQualifiers = async (v) => {
    try { await window.storage.set("mw2026-qualifiers", JSON.stringify(v)); } catch(_) {}
  };
  const saveKnockout = async (v) => {
    try { await window.storage.set("mw2026-knockout", JSON.stringify(v)); } catch(_) {}
  };

  // ── Submit real result ──
  // ── AI Insight via Anthropic API ──
  // ── ANÁLISIS LOCAL: genera insights basados en patrones (no requiere API) ──
  const fetchInsight = async (fid, f, entry, pred) => {
    setAiInsight(prev => ({ ...prev, [fid]: { loading: true, text: null } }));
    await new Promise(r => setTimeout(r, 400));

    const teamH = teamLabel(f.home);
    const teamA = teamLabel(f.away);
    const realGoals = entry.hG + entry.aG;
    const realDiff = Math.abs(entry.hG - entry.aG);
    const winner = entry.hG > entry.aG ? teamH : entry.aG > entry.hG ? teamA : null;
    const loser = entry.hG > entry.aG ? teamA : entry.aG > entry.hG ? teamH : null;
    const realResult = entry.hG > entry.aG ? "1" : entry.aG > entry.hG ? "2" : "X";
    const deltaG = entry.deltas.goles;
    const deltaC = entry.deltas.corners;
    const goalsOverPred = pred.totalXG > 2.5;
    const goalsOverReal = realGoals > 2.5;

    const bullets = [];

    if (entry.deltas.resultOk && Math.abs(deltaG) <= 1) {
      bullets.push("• El modelo acertó resultado y goles. Predicción sólida en cuanto a fuerzas relativas — sin ajustes necesarios para este matchup.");
    } else if (!entry.deltas.resultOk && winner) {
      bullets.push(`• El modelo subestimó a ${winner}. Posibles factores no considerados: motivación especial, rotaciones del rival, ventaja táctica del DT o jugadores en gran momento de forma que el modelo aún no captura.`);
    } else if (Math.abs(deltaG) >= 2) {
      const direction = deltaG > 0 ? "más" : "menos";
      bullets.push(`• Se anotaron ${Math.abs(deltaG).toFixed(1)} goles ${direction} de lo previsto. ${realDiff >= 3 ? "Goleada inesperada" : "Partido más " + (deltaG > 0 ? "abierto" : "trabado")} — el modelo no detectó la asimetría real entre ambos equipos en este momento.`);
    } else {
      bullets.push("• Discrepancia moderada. Probablemente influyó algún factor coyuntural (lesiones, rotaciones, intensidad del amistoso) que no impacta tanto en partidos oficiales.");
    }

    if (!entry.deltas.resultOk && winner) {
      bullets.push(`• Subir el peso de la Forma reciente de ${winner} o revisar su valor de plantilla — el modelo lo está subvalorando. Confirmar con datos oficiales antes del Mundial.`);
    } else if (deltaG > 1.5) {
      bullets.push("• El componente xG ofensivo está sesgado hacia abajo. Ajustar al alza la conversión esperada para los equipos top en esta ventana FIFA.");
    } else if (deltaG < -1.5) {
      bullets.push("• El modelo sobreestima goles. Aumentar peso defensivo o reducir xG base — los amistosos pre-Mundial suelen ser más cautos de lo esperado.");
    } else if (deltaC !== null && Math.abs(deltaC) > 3) {
      bullets.push("• Los corners no están bien calibrados. Revisar el estilo de juego (presión alta vs bloqueo bajo) más que la fuerza pura del equipo.");
    } else {
      bullets.push("• Variables principales están bien calibradas. Foco en datos contextuales: condición física, viaje, sede.");
    }

    if (entry.deltas.resultOk && goalsOverPred === goalsOverReal && (deltaC === null || Math.abs(deltaC) <= 2)) {
      bullets.push("• Para el Mundial: confiar en el modelo en partidos similares de fuerza. Patrón validado.");
    } else if (realDiff >= 3) {
      bullets.push("• Para el Mundial: cuidado con asumir partidos cerrados entre equipos de niveles distintos. Las goleadas son más frecuentes de lo que sugiere xG en fases iniciales.");
    } else if (realResult === "X") {
      bullets.push("• Para el Mundial: los empates tienen más probabilidad de la que da el modelo. Considerar inflar la línea de empate en cruces parejos.");
    } else if (!entry.deltas.resultOk) {
      bullets.push(`• Para el Mundial: ${winner} debería tener un score más alto en el ranking. Revisar antes del torneo.`);
    } else {
      bullets.push("• Para el Mundial: ajuste menor. Mantener la metodología y seguir registrando para depurar patrones.");
    }

    if (entry.notes && entry.notes.trim()) {
      bullets.push(`• Nota del partido: ${entry.notes}`);
    }

    const text = bullets.join("\n\n");
    setAiInsight(prev => ({ ...prev, [fid]: { loading: false, text } }));
    try { await window.storage.set(`mw2026-insight-${fid}`, text); } catch(_) {}
  };

  const handleSubmitResult = async (fid) => {
    const f = FRIENDLIES_BASE.find(x=>x.id===fid);
    const hG = parseFloat(editForm.hG);
    const aG = parseFloat(editForm.aG);
    const hC = parseFloat(editForm.hC||0);
    const aC = parseFloat(editForm.aC||0);
    const notes = editForm.notes||"";
    if (isNaN(hG)||isNaN(aG)) return;

    const pred = predictMatch(f.home, f.away, adjustments);
    const realResult = hG>aG?"1":aG>hG?"2":"X";
    const golesReal = hG+aG;
    const cornersReal = hC+aC;
    const deltaGoles = golesReal - pred.totalXG;
    const deltaCorners = hC+aC > 0 ? cornersReal - pred.totalCorners : null;
    const resultOk = realResult === pred.predicted_result;

    const entry = { hG, aG, hC, aC, notes,
      pred: { ...pred, resultadoPred: pred.predicted_result },
      deltas: { goles: Math.round(deltaGoles*10)/10, corners: deltaCorners!==null?Math.round(deltaCorners*10)/10:null, resultOk },
      ts: Date.now(),
    };
    const newR = { ...results, [fid]: entry };
    setResults(newR);
    await saveResults(newR);
    setEditingId(null);
    setEditForm({});

    // Auto-learn: si el xG estuvo muy lejos, ajustar forma del equipo ganador
    if (Math.abs(deltaGoles) > 1.5) {
      const winnerKey = hG>aG ? f.home : aG>hG ? f.away : null;
      if (winnerKey) {
        const newAdj = { ...adjustments };
        if (!newAdj[winnerKey]) newAdj[winnerKey] = {};
        newAdj[winnerKey].formaBonus = Math.min(8, (newAdj[winnerKey].formaBonus||0) + 2);
        setAdjustments(newAdj);
        await saveAdjustments(newAdj);
      }
    }
    // Fetch AI insight
    fetchInsight(fid, f, entry, pred);
  };


  // Load saved insights on mount
  useEffect(() => {
    if (!loaded) return;
    FRIENDLIES_BASE.forEach(async f => {
      try {
        const r = await window.storage.get(`mw2026-insight-${f.id}`);
        if (r) setAiInsight(prev => ({ ...prev, [f.id]: { loading:false, text: r.value } }));
      } catch(_) {}
    });
  }, [loaded]);

  // ── Stats summary — incluye amistosos de lista y simulados ──
  const played = Object.entries(results)
    .filter(([, v]) => v && v.deltas !== undefined)
    .map(([k, v]) => {
      const base = FRIENDLIES_BASE.find(f => f.id === k);
      const homeLabel = base?.home || (v.pred?.home) || "?";
      const awayLabel = base?.away || (v.pred?.away) || "?";
      return { id:k, home:homeLabel, away:awayLabel,
        label: base?.label || teamLabel(homeLabel)+" vs "+teamLabel(awayLabel),
        ...v };
    });
  const resultOks  = played.filter(p => p.deltas?.resultOk).length;
  const avgDeltaG  = played.length ? Math.round(played.reduce((s,p)=>s+Math.abs(p.deltas.goles),0)/played.length*10)/10 : null;
  const cornPlayed = played.filter(p=>p.deltas?.corners!==null && p.deltas?.corners!==undefined);
  const avgDeltaC  = cornPlayed.length ? Math.round(cornPlayed.reduce((s,p)=>s+Math.abs(p.deltas.corners),0)/cornPlayed.length*10)/10 : null;

  const TABS = [
    { id:"feed",      label:"📋 Ingresar" },
    { id:"errors",    label:"📊 Errores" },
    { id:"simulator", label:"🎯 Simular" },
    { id:"ranking",   label:"🏆 Ranking" },
    { id:"bracket",   label:"🗓️ Bracket"  },
  ];

  const inp = (style={}) => ({
    width:"100%", padding:"8px 10px", background:"#0d0d18",
    border:"1px solid rgba(255,107,53,0.4)", borderRadius:7,
    color:"#fff", fontSize:13, boxSizing:"border-box", ...style,
  });

  const scores = Object.keys(TEAMS_DATA)
    .map(k=>({ team:k, score:calcScore(k,adjustments) }))
    .sort((a,b)=>b.score-a.score);


  // ── EXPORT: genera JSON con todos los datos ──
  const handleExport = () => {
    const data = {
      version: "v4",
      exportedAt: new Date().toISOString(),
      results,
      adjustments,
      groupStandings,
      confirmedQualifiers,
      knockoutMatches,
    };
    const json = JSON.stringify(data, null, 2);
    setBackupText(json);
    setBackupMode("export");
    setBackupMsg("");
    setShowBackup(true);
  };

  // ── IMPORT: carga JSON pegado por el usuario ──
  const handleImport = async () => {
    try {
      const data = JSON.parse(importText);
      if (data.results)            { setResults(data.results);                        await saveResults(data.results); }
      if (data.adjustments)        { setAdjustments(data.adjustments);                await saveAdjustments(data.adjustments); }
      if (data.groupStandings)     { setGroupStandings(data.groupStandings);          await saveGroupStandings(data.groupStandings); }
      if (data.confirmedQualifiers){ setConfirmedQualifiers(data.confirmedQualifiers);await saveQualifiers(data.confirmedQualifiers); }
      if (data.knockoutMatches)    { setKnockoutMatches(data.knockoutMatches);        await saveKnockout(data.knockoutMatches); }
      setBackupMsg("✅ Datos restaurados correctamente");
      setImportText("");
      setTimeout(() => { setShowBackup(false); setBackupMsg(""); }, 2000);
    } catch(e) {
      setBackupMsg("❌ Error: el texto no es válido. Revisá que copiaste todo el JSON.");
    }
  };

  // ── ANÁLISIS IA WEB — via Vercel serverless proxy ──
  const fetchSimWebAnalysis = async (homeTeam, awayTeam, prediction) => {
    setSimWebAnalysis({ loading: true, text: null, error: null });
    const prompt = `Eres un analista experto del Mundial 2026. Analizá este partido y dá contexto actual:

Partido: ${teamLabel(homeTeam)} vs ${teamLabel(awayTeam)}
Predicción del modelo:
- Ganador probable: ${prediction.predicted_result==="1"?teamLabel(homeTeam):prediction.predicted_result==="2"?teamLabel(awayTeam):"Empate"}
- Probabilidades: ${teamLabel(homeTeam)} ${prediction.prob_home}% / Empate ${prediction.prob_draw}% / ${teamLabel(awayTeam)} ${prediction.prob_away}%
- Goles esperados: ${prediction.totalXG} total (${prediction.over25?"Over 2.5":"Under 2.5"})
- Corners esperados: ${prediction.totalCorners} total (${prediction.totalCorners>=9?"Over 8.5":"Under 8.5"})

Respondé con 4 secciones cortas en español:
1. 🔍 CONTEXTO ACTUAL: Estado reciente, forma, lesiones conocidas, DT
2. ⚡ FACTORES CLAVE: 3 factores decisivos para este partido
3. 📊 ANÁLISIS DE LA PREDICCIÓN: Si el modelo está bien calibrado o qué podría cambiar
4. 🏆 VEREDICTO FINAL: Tu predicción considerando todo el contexto

Máximo 200 palabras total. Sé conciso y directo.`;

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      const text = data.text;
      if (!text) throw new Error("Sin respuesta");
      setSimWebAnalysis({ loading: false, text, error: null });
    } catch(e) {
      setSimWebAnalysis({ loading: false, text: null, error: e.message });
    }
  };


  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#07080f,#0c1525,#07080f)",
      fontFamily:"'Trebuchet MS','Gill Sans',sans-serif", color:"#e8e0d0", overflowX:"hidden" }}>

      {/* HEADER */}
      <div style={{ background:"linear-gradient(90deg,#130600,#7a1500,#c0300a,#7a1500,#130600)",
        borderBottom:"2px solid #ff6b35", position:"sticky", top:0, zIndex:100,
        boxShadow:"0 4px 28px rgba(200,51,10,0.4)" }}>
        <div style={{ maxWidth:980, margin:"0 auto", padding:"10px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:9, letterSpacing:5, color:"#ff9966", textTransform:"uppercase" }}>Copa del Mundo</div>
            <div style={{ fontSize:18, fontWeight:900, letterSpacing:2, color:"#fff" }}>
              ⚽ MUNDIAL 2026 <span style={{ color:"#ff6b35" }}>PREDICTOR</span>
              <span style={{ fontSize:10, color:"#554433", fontWeight:400, marginLeft:8 }}>v6.0 · IA Gemini</span>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {played.length > 0 && (
              <div style={{ textAlign:"right", fontSize:10 }}>
                <div style={{ color:"#00cc88", fontWeight:700 }}>{resultOks}/{played.length} ✅</div>
              </div>
            )}
            <button onClick={handleExport} style={{
              padding:"8px 14px", background:"rgba(255,220,60,0.2)",
              border:"1px solid rgba(255,220,60,0.6)", borderRadius:8,
              color:"#ffdd44", fontSize:20, cursor:"pointer", fontWeight:900,
              lineHeight:1,
            }}>💾</button>
          </div>
        </div>
        <div style={{ display:"flex", borderTop:"1px solid rgba(255,107,53,0.2)" }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              flex:1, padding:"9px 4px", border:"none", cursor:"pointer",
              background: tab===t.id?"rgba(255,107,53,0.2)":"transparent",
              color: tab===t.id?"#ff6b35":"#887755",
              fontSize:12, fontWeight: tab===t.id?800:400,
              borderBottom: tab===t.id?"2px solid #ff6b35":"2px solid transparent",
              transition:"all 0.2s",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:980, margin:"0 auto", padding:"18px 12px" }}>

        {/* ══════ TAB: FEED RESULTADOS ══════ */}
        {tab==="feed" && (
          <div>
            <div style={{ background:"rgba(255,107,53,0.07)", border:"1px solid rgba(255,107,53,0.3)",
              borderRadius:12, padding:14, marginBottom:18, fontSize:11, color:"#bb9977", lineHeight:1.8 }}>
              <strong style={{ color:"#ff9966" }}>📝 Cómo funciona:</strong> Ingresá el resultado real de cada amistoso.
              El modelo calcula el error, aprende de él y <strong style={{ color:"#fff" }}>ajusta los parámetros automáticamente</strong>.
              El análisis de IA detecta qué factores no consideró y los guarda para futuras predicciones.
              Todo queda <strong style={{ color:"#00cc88" }}>guardado en memoria persistente</strong> — incluso si cerrás el navegador.
            </div>

            {FRIENDLIES_BASE.map(f => {
              const pred  = predictMatch(f.home, f.away, adjustments);
              const res   = results[f.id];
              const isExp = expanded === f.id;
              const isEd  = editingId === f.id;
              const insight = aiInsight[f.id];
              const adj_h = adjustments[f.home]?.formaBonus || 0;
              const adj_a = adjustments[f.away]?.formaBonus || 0;

              return (
                <div key={f.id} style={{
                  marginBottom:10, borderRadius:12,
                  border: res ? "1px solid rgba(0,204,136,0.45)" : "1px solid rgba(255,255,255,0.08)",
                  background: res ? "rgba(0,204,136,0.04)" : "rgba(255,255,255,0.03)",
                  overflow:"hidden",
                }}>
                  {/* Row principal */}
                  <div style={{ display:"flex", alignItems:"center", padding:"12px 14px", gap:10 }}
                    onClick={()=>setExpanded(isExp?null:f.id)} style={{ display:"flex", alignItems:"center", padding:"12px 14px", gap:10, cursor:"pointer" }}>

                    {/* Equipos */}
                    <div style={{ flex:1, display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:22 }}>{flag(f.home)}</span>
                      <div style={{ textAlign:"center", minWidth:60 }}>
                        {res
                          ? <div style={{ fontSize:18, fontWeight:900, color:"#00cc88" }}>{res.hG} – {res.aG}</div>
                          : <div style={{ fontSize:11, color:"#443322" }}>vs</div>}
                        <div style={{ fontSize:9, color:"#ff9966" }}>{f.date}</div>
                      </div>
                      <span style={{ fontSize:22 }}>{flag(f.away)}</span>
                      <div>
                        <div style={{ fontSize:12, fontWeight:600 }}>{f.label}</div>
                        <div style={{ fontSize:9, color:"#554433" }}>
                          Pred: <span style={{ color: pred.predicted_result==="1"?"#4a9eff":pred.predicted_result==="2"?"#ff9966":"#ffdd44" }}>
                            {pred.predicted_result==="1"?teamLabel(f.home):pred.predicted_result==="2"?teamLabel(f.away):"Empate"}
                          </span>
                          {(adj_h||adj_a) && <span style={{ color:"#00cc88", marginLeft:6 }}>⚡adj</span>}
                        </div>
                      </div>
                    </div>

                    {/* Estado */}
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      {res ? (
                        <div>
                          <span style={{ fontSize:10, background: res.deltas.resultOk?"#00cc88":"#cc3322",
                            color:"#000", borderRadius:4, padding:"2px 6px", fontWeight:700 }}>
                            {res.deltas.resultOk?"✅ OK":"❌ Error"}
                          </span>
                          <div style={{ fontSize:9, color:"#665544", marginTop:3 }}>Δ goles:{res.deltas.goles>0?"+":""}{res.deltas.goles}</div>
                        </div>
                      ) : (
                        <button onClick={(e)=>{ e.stopPropagation(); setEditingId(f.id); setEditForm({}); }}
                          style={{ padding:"6px 12px", background:"rgba(255,107,53,0.2)", border:"1px solid rgba(255,107,53,0.5)",
                            borderRadius:7, color:"#ff9966", fontSize:11, cursor:"pointer", fontWeight:700 }}>
                          + Resultado
                        </button>
                      )}
                    </div>
                  </div>

                  {/* FORM de ingreso */}
                  {isEd && !res && (
                    <div style={{ borderTop:"1px solid rgba(255,107,53,0.2)", padding:14, background:"rgba(0,0,0,0.4)" }}>
                      <div style={{ fontSize:11, color:"#ff9966", fontWeight:700, marginBottom:12, letterSpacing:1 }}>
                        INGRESAR RESULTADO REAL
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                        <div>
                          <label style={{ fontSize:10, color:"#887766", display:"block", marginBottom:4 }}>
                            ⚽ Goles {flag(f.home)} {teamLabel(f.home)}
                          </label>
                          <input type="number" min="0" max="20" placeholder="0"
                            value={editForm.hG||""} onChange={e=>setEditForm(p=>({...p,hG:e.target.value}))}
                            style={inp()} />
                        </div>
                        <div>
                          <label style={{ fontSize:10, color:"#887766", display:"block", marginBottom:4 }}>
                            ⚽ Goles {flag(f.away)} {teamLabel(f.away)}
                          </label>
                          <input type="number" min="0" max="20" placeholder="0"
                            value={editForm.aG||""} onChange={e=>setEditForm(p=>({...p,aG:e.target.value}))}
                            style={inp()} />
                        </div>
                        <div>
                          <label style={{ fontSize:10, color:"#887766", display:"block", marginBottom:4 }}>
                            🚩 Corners {teamLabel(f.home)} (opcional)
                          </label>
                          <input type="number" min="0" max="25" placeholder="—"
                            value={editForm.hC||""} onChange={e=>setEditForm(p=>({...p,hC:e.target.value}))}
                            style={inp()} />
                        </div>
                        <div>
                          <label style={{ fontSize:10, color:"#887766", display:"block", marginBottom:4 }}>
                            🚩 Corners {teamLabel(f.away)} (opcional)
                          </label>
                          <input type="number" min="0" max="25" placeholder="—"
                            value={editForm.aC||""} onChange={e=>setEditForm(p=>({...p,aC:e.target.value}))}
                            style={inp()} />
                        </div>
                      </div>
                      <div style={{ marginBottom:12 }}>
                        <label style={{ fontSize:10, color:"#887766", display:"block", marginBottom:4 }}>
                          📝 Notas (lesiones, rotaciones, contexto del partido…)
                        </label>
                        <textarea placeholder="Ej: Messi no jugó, hubo 3 cambios al descanso, lluvia intensa..."
                          value={editForm.notes||""} onChange={e=>setEditForm(p=>({...p,notes:e.target.value}))}
                          style={{ ...inp(), height:60, resize:"vertical" }} />
                      </div>
                      <div style={{ display:"flex", gap:8 }}>
                        <button onClick={()=>handleSubmitResult(f.id)} style={{
                          flex:2, padding:"10px", background:"linear-gradient(90deg,#b02800,#ff6b35)",
                          border:"none", borderRadius:8, color:"#fff", fontSize:13, fontWeight:900, cursor:"pointer",
                        }}>✅ Guardar y Analizar</button>
                        <button onClick={()=>setEditingId(null)} style={{
                          flex:1, padding:"10px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)",
                          borderRadius:8, color:"#887766", fontSize:12, cursor:"pointer",
                        }}>Cancelar</button>
                      </div>
                    </div>
                  )}

                  {/* DETALLE expandido con resultados */}
                  {isExp && res && (
                    <div style={{ borderTop:"1px solid rgba(0,204,136,0.2)", padding:14 }}>
                      {/* Predicciones vs Real */}
                      {(() => {
                        const livePred = predictMatch(f.home, f.away, adjustments);
                        const goalsOver = livePred.totalXG > 2.5;
                        const realGoalsOver = (res.hG+res.aG) > 2.5;
                        const cornersOver = livePred.totalCorners > 8.5;
                        const realCornersOver = res.hC>0 && (res.hC+res.aC) > 8.5;
                        const valItems = [
                          { label:"Resultado",
                            pred: res.pred.resultadoPred==="1"?teamLabel(f.home):res.pred.resultadoPred==="2"?teamLabel(f.away):"Empate",
                            real: res.hG>res.aG?teamLabel(f.home):res.aG>res.hG?teamLabel(f.away):"Empate",
                            ok: res.deltas.resultOk,
                            predLabel: null, realLabel: null },
                          { label:"⚽ Goles (línea 2.5)",
                            pred: livePred.totalXG,
                            real: res.hG+res.aG,
                            delta: res.deltas.goles,
                            ok: goalsOver===realGoalsOver,
                            predLabel: goalsOver?"Over 2.5":"Under 2.5",
                            realLabel: realGoalsOver?"Over 2.5":"Under 2.5" },
                          res.hC>0
                            ? { label:"🚩 Corners (línea 8.5)",
                                pred: livePred.totalCorners,
                                real: res.hC+res.aC,
                                delta: res.deltas.corners,
                                ok: cornersOver===realCornersOver,
                                predLabel: cornersOver?"Over 8.5":"Under 8.5",
                                realLabel: realCornersOver?"Over 8.5":"Under 8.5" }
                            : { label:"🚩 Corners", pred: livePred.totalCorners, real:"No reg.", ok:null, predLabel:null, realLabel:null },
                        ];
                        return (
                          <>
                      <div style={{ fontSize:11, color:"#00cc88", fontWeight:700, marginBottom:10, letterSpacing:1 }}>PREDICCIÓN vs REAL</div>
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:14 }}>
                        {valItems.map((v,i)=>(
                          <div key={i} style={{ background:"rgba(0,0,0,0.4)", borderRadius:9, padding:12,
                            border: v.ok===true?"1px solid rgba(0,204,136,0.3)":v.ok===false?"1px solid rgba(200,50,0,0.3)":"1px solid rgba(255,255,255,0.06)" }}>
                            <div style={{ fontSize:9, color:"#665544", marginBottom:6 }}>{v.label}</div>
                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                              <div>
                                <div style={{ fontSize:9, color:"#665544" }}>Pred</div>
                                <div style={{ fontSize:13, fontWeight:700, color:"#aaa" }}>{v.pred}</div>
                                {v.predLabel && <div style={{ fontSize:10, fontWeight:800, color:v.predLabel.startsWith("Over")?"#ff9966":"#4a9eff" }}>{v.predLabel}</div>}
                              </div>
                              <div style={{ fontSize:20 }}>{v.ok===true?"✅":v.ok===false?"❌":"—"}</div>
                              <div style={{ textAlign:"right" }}>
                                <div style={{ fontSize:9, color:"#665544" }}>Real</div>
                                <div style={{ fontSize:13, fontWeight:700, color:"#fff" }}>{v.real}</div>
                                {v.realLabel && <div style={{ fontSize:10, fontWeight:800, color:v.realLabel.startsWith("Over")?"#ff9966":"#4a9eff" }}>{v.realLabel}</div>}
                              </div>
                            </div>
                            {v.delta!==undefined && (
                              <div style={{ textAlign:"center", fontSize:10, marginTop:6,
                                color: Math.abs(v.delta)<=1?"#00cc88":Math.abs(v.delta)<=2?"#ffaa44":"#cc4422" }}>
                                Δ {v.delta>0?"+":""}{v.delta}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Notas del usuario */}
                      {res.notes && (
                        <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:8, padding:10, marginBottom:12,
                          border:"1px solid rgba(255,255,255,0.07)", fontSize:11, color:"#998877" }}>
                          📝 <em>{res.notes}</em>
                        </div>
                      )}

                      {/* AI Insight */}
                      <div style={{ background:"rgba(74,158,255,0.06)", border:"1px solid rgba(74,158,255,0.25)",
                        borderRadius:10, padding:12 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                          <div style={{ fontSize:11, fontWeight:700, color:"#4a9eff" }}>
                            🤖 ANÁLISIS AUTOMÁTICO
                          </div>
                          <button onClick={()=>{
                            const teamH = teamLabel(f.home), teamA = teamLabel(f.away);
                            const promptText = `Analiza este partido de fútbol y dame 3 insights sobre qué no consideró mi modelo predictivo:\n\nPartido: ${teamH} ${res.hG}-${res.aG} ${teamA} (${f.date})\nMi modelo predijo: ${res.pred.resultadoPred==="1"?teamH:res.pred.resultadoPred==="2"?teamA:"Empate"}, xG total ${res.pred.totalXG}, corners ${res.pred.totalCorners}\nReal: ${res.hG+res.aG} goles, ${res.hC+res.aC||"N/D"} corners\nNotas: ${res.notes||"ninguna"}\n\nDame 3 bullets: 1) Qué factor real influyó (lesiones, formaciones, motivación). 2) Variable a ajustar en mi modelo. 3) Aprendizaje para el Mundial 2026.`;
                            navigator.clipboard?.writeText(promptText).then(()=>{
                              alert("✅ Copiado. Pegalo en Gemini/ChatGPT para análisis profundo.");
                            }).catch(()=>{
                              prompt("Copiá este texto y pegalo en Gemini:", promptText);
                            });
                          }} style={{
                            padding:"4px 10px", background:"rgba(255,220,60,0.15)",
                            border:"1px solid rgba(255,220,60,0.4)", borderRadius:5,
                            color:"#ffdd44", fontSize:10, cursor:"pointer", fontWeight:700,
                          }}>📋 Copiar para Gemini</button>
                        </div>
                        {insight?.loading && (
                          <div style={{ fontSize:11, color:"#665544", fontStyle:"italic" }}>Analizando partido… ⏳</div>
                        )}
                        {insight?.text && !insight.loading && (
                          <div style={{ fontSize:11, color:"#bbb", lineHeight:1.9, whiteSpace:"pre-line" }}>
                            {insight.text}
                          </div>
                        )}
                        {!insight && res && (
                          <div>
                            <div style={{ fontSize:11, color:"#443322", fontStyle:"italic", marginBottom:6 }}>Análisis no disponible para este partido.</div>
                            <button onClick={()=>fetchInsight(f.id, f, res, predictMatch(f.home,f.away,adjustments))} style={{
                              padding:"6px 12px", background:"rgba(74,158,255,0.15)", border:"1px solid rgba(74,158,255,0.4)",
                              borderRadius:6, color:"#4a9eff", fontSize:10, cursor:"pointer", fontWeight:700,
                            }}>🤖 Generar análisis</button>
                          </div>
                        )}
                      </div>

                      {/* Ajuste aprendido */}
                      {(adjustments[f.home]?.formaBonus || adjustments[f.away]?.formaBonus) && (
                        <div style={{ marginTop:10, background:"rgba(0,204,136,0.07)", border:"1px solid rgba(0,204,136,0.25)",
                          borderRadius:8, padding:10, fontSize:10, color:"#00cc88" }}>
                          ⚡ Ajuste aprendido aplicado:
                          {adjustments[f.home]?.formaBonus ? ` ${teamLabel(f.home)} +${adjustments[f.home].formaBonus} forma` : ""}
                          {adjustments[f.away]?.formaBonus ? ` ${teamLabel(f.away)} +${adjustments[f.away].formaBonus} forma` : ""}
                        </div>
                      )}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ══════ TAB: ERRORES / DASHBOARD ══════ */}
        {tab==="errors" && (
          <div>
            <h2 style={{ color:"#ff6b35", fontSize:16, marginBottom:16, letterSpacing:2 }}>DASHBOARD DE ERRORES</h2>

            {played.length === 0 ? (
              <div style={{ textAlign:"center", padding:40, color:"#443322", fontSize:13 }}>
                Aún no ingresaste ningún resultado.<br/>Andá a la tab "Ingresar" para empezar.
              </div>
            ) : (
              <>
                {/* KPIs */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:22 }}>
                  {[
                    { label:"Partidos ingresados", val:played.length, color:"#4a9eff", icon:"📋" },
                    { label:"Resultados correctos", val:`${resultOks}/${played.length}`, color:"#00cc88", icon:"✅",
                      sub:`${Math.round(resultOks/played.length*100)}% accuracy` },
                    { label:"Over/Under 2.5 ⚽", val:played.length?`${played.filter(p=>p.pred?.totalXG!==undefined&&(p.pred.totalXG>2.5)===(p.hG+p.aG>2.5)).length}/${played.length}`:"—", color:"#ff9966", icon:"⚽",
                      sub: played.length?`${Math.round(played.filter(p=>p.pred?.totalXG!==undefined&&(p.pred.totalXG>2.5)===(p.hG+p.aG>2.5)).length/played.length*100)}% acierto linea`:null },
                    { label:"Over/Under 8.5 🚩", val:cornPlayed.length?`${cornPlayed.filter(p=>p.pred?.totalCorners!==undefined&&(p.pred.totalCorners>8.5)===(p.hC+p.aC>8.5)).length}/${cornPlayed.length}`:"—", color:"#cc88ff", icon:"🚩",
                      sub: cornPlayed.length?`${Math.round(cornPlayed.filter(p=>p.pred?.totalCorners!==undefined&&(p.pred.totalCorners>8.5)===(p.hC+p.aC>8.5)).length/cornPlayed.length*100)}% acierto línea`:null },
                  ].map(k=>(
                    <div key={k.label} style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${k.color}33`,
                      borderRadius:11, padding:14, textAlign:"center" }}>
                      <div style={{ fontSize:20 }}>{k.icon}</div>
                      <div style={{ fontSize:22, fontWeight:900, color:k.color, margin:"4px 0" }}>{k.val}</div>
                      <div style={{ fontSize:9, color:"#665544" }}>{k.label}</div>
                      {k.sub && <div style={{ fontSize:9, color:k.color, marginTop:3 }}>{k.sub}</div>}
                    </div>
                  ))}
                </div>

                {/* Tabla de errores por partido */}
                <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:11, overflow:"hidden", marginBottom:20 }}>
                  <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr",
                    padding:"8px 14px", background:"rgba(255,107,53,0.1)",
                    fontSize:9, color:"#ff9966", fontWeight:700, letterSpacing:1, gap:8 }}>
                    <span>PARTIDO</span><span style={{textAlign:"center"}}>REAL</span>
                    <span style={{textAlign:"center"}}>PRED</span>
                    <span style={{textAlign:"center"}}>RES</span>
                    <span style={{textAlign:"center"}}>Δ GOL</span>
                    <span style={{textAlign:"center"}}>Δ CORN</span>
                  </div>
                  {played.map(p=>{
                    const predRes = p.pred?.resultadoPred || p.pred?.predicted_result;
                    const isSimType = p.id.startsWith("sim-");
                    return (
                      <div key={p.id} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr",
                        padding:"9px 14px", borderTop:"1px solid rgba(255,255,255,0.05)",
                        fontSize:11, alignItems:"center", gap:8,
                        background: isSimType ? "rgba(255,220,60,0.03)" : "transparent" }}>
                        <span style={{ fontSize:11 }}>
                          {flag(p.home)} vs {flag(p.away)}
                          {isSimType && <span style={{ fontSize:9, color:"#ffdd44", marginLeft:4 }}>sim</span>}
                        </span>
                        <span style={{ textAlign:"center", fontWeight:700 }}>{p.hG}–{p.aG}</span>
                        <span style={{ textAlign:"center", color:"#887766" }}>
                          {predRes==="1"?flag(p.home):predRes==="2"?flag(p.away):"—"}
                        </span>
                        <span style={{ textAlign:"center" }}>{p.deltas.resultOk?"✅":"❌"}</span>
                        <span style={{ textAlign:"center", color:(p.pred?.totalXG>2.5)===(p.hG+p.aG>2.5)?"#00cc88":"#cc4422" }}>
                          {p.deltas.goles>0?"+":""}{p.deltas.goles}
                          {(p.pred?.totalXG>2.5)===(p.hG+p.aG>2.5)?" ✅":" ❌"}
                        </span>
                        <span style={{ textAlign:"center", color:p.deltas.corners!==null&&p.deltas.corners!==undefined?((p.pred?.totalCorners>8.5)===(p.hC+p.aC>8.5)?"#00cc88":"#cc4422"):"#443322" }}>
                          {p.deltas.corners!==null&&p.deltas.corners!==undefined?(p.deltas.corners>0?"+":"")+p.deltas.corners:"—"}
                          {p.deltas.corners!==null&&p.deltas.corners!==undefined?((p.pred?.totalCorners>8.5)===(p.hC+p.aC>8.5)?" ✅":" ❌"):""}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Ajustes aprendidos */}
                {Object.keys(adjustments).length > 0 && (
                  <div style={{ background:"rgba(0,204,136,0.06)", border:"1px solid rgba(0,204,136,0.25)", borderRadius:11, padding:14 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:"#00cc88", marginBottom:10 }}>
                      ⚡ AJUSTES APRENDIDOS POR EL MODELO
                    </div>
                    {Object.entries(adjustments).map(([team, adj])=>(
                      <div key={team} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0",
                        borderBottom:"1px solid rgba(255,255,255,0.05)", fontSize:11 }}>
                        <span>{flag(team)} {teamLabel(team)}</span>
                        <span style={{ color:"#00cc88" }}>
                          {adj.formaBonus ? `Forma +${adj.formaBonus}` : ""}
                        </span>
                      </div>
                    ))}
                    <div style={{ fontSize:9, color:"#443322", marginTop:8 }}>
                      Estos ajustes se aplican automáticamente en todas las predicciones futuras.
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ══════ TAB: SIMULADOR ══════ */}
        {tab==="simulator" && (
          <div>
            <h2 style={{ color:"#ff6b35", fontSize:16, marginBottom:10, letterSpacing:2 }}>SIMULAR PARTIDO</h2>

            {/* Info banner */}
            <div style={{ background:"rgba(255,107,53,0.07)", border:"1px solid rgba(255,107,53,0.25)",
              borderRadius:10, padding:12, marginBottom:16, fontSize:11, color:"#bb9977", lineHeight:1.7 }}>
              Elegí cualquier par de equipos, predecí el partido y — si ya se jugó —
              <strong style={{ color:"#fff" }}> ingresá el resultado real</strong> para que el modelo aprenda
              igual que con los amistosos de la lista. Todo queda guardado.
            </div>

            {Object.keys(adjustments).length > 0 && (
              <div style={{ background:"rgba(0,204,136,0.07)", border:"1px solid rgba(0,204,136,0.25)",
                borderRadius:9, padding:9, marginBottom:14, fontSize:10, color:"#00cc88" }}>
                ⚡ {Object.keys(adjustments).length} ajuste(s) aprendidos activos en el modelo.
              </div>
            )}

            {/* Selectores */}
            <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,107,53,0.3)",
              borderRadius:13, padding:18, marginBottom:16 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:12, alignItems:"flex-end", marginBottom:14 }}>
                {[
                  { label:"🏠 LOCAL",     val:customH, set:setCustomH },
                  null,
                  { label:"✈️ VISITANTE", val:customA, set:setCustomA },
                ].map((f,i) => f===null
                  ? <div key="vs" style={{ textAlign:"center", fontSize:22, color:"#332211", paddingBottom:6 }}>⚡</div>
                  : (
                    <div key={f.label}>
                      <label style={{ fontSize:9, color:"#ff9966", display:"block", marginBottom:4, letterSpacing:2 }}>{f.label}</label>
                      <select value={f.val} onChange={e=>{ f.set(e.target.value); setSimPred(null); setSimForm({}); setSimSubmitted(false); }}
                        style={{ width:"100%", padding:"8px 10px", background:"#0d0d18",
                          border:"1px solid rgba(255,107,53,0.4)", borderRadius:7, color:"#fff", fontSize:12 }}>
                        {Object.keys(ALL_SIM_TEAMS).sort().map(t=>(
                          <option key={t} value={t}>{ALL_SIM_TEAMS[t]?.bandera||"🏳️"} {teamLabel(t)}</option>
                        ))}
                      </select>
                    </div>
                  )
                )}
              </div>
              <button onClick={()=>{ setSimPred({ home:customH, away:customA, ...predictMatch(customH,customA,adjustments) }); setSimSubmitted(false); setSimForm({}); setSimWebAnalysis(null); }} style={{
                width:"100%", padding:12, background:"linear-gradient(90deg,#b02800,#ff6b35)",
                border:"none", borderRadius:9, color:"#fff", fontSize:14, fontWeight:900, cursor:"pointer",
              }}>🔮 PREDECIR</button>
            </div>

            {/* Resultado de la predicción */}
            {simPred && simPred.home===customH && simPred.away===customA && (
              <div>
                {/* Cabecera */}
                <div style={{ background:"rgba(255,107,53,0.06)", border:"1px solid rgba(255,107,53,0.35)",
                  borderRadius:13, padding:20, marginBottom:14 }}>
                  <div style={{ textAlign:"center", marginBottom:14 }}>
                    <div style={{ fontSize:30 }}>{flag(simPred.home)} vs {flag(simPred.away)}</div>
                    <div style={{ fontSize:14, fontWeight:700 }}>{teamLabel(simPred.home)} vs {teamLabel(simPred.away)}</div>
                    <div style={{ fontSize:10, color:"#554433", marginTop:3 }}>
                      Score: <strong style={{ color:"#4a9eff" }}>{calcScore(simPred.home,adjustments)}</strong>
                      {" "}<span style={{color:"#332211"}}>vs</span>{" "}
                      <strong style={{ color:"#ff9966" }}>{calcScore(simPred.away,adjustments)}</strong>
                    </div>
                  </div>

                  {/* Barra 1X2 */}
                  <div style={{ marginBottom:14 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#776655", marginBottom:4 }}>
                      <span>{simPred.prob_home}% {teamLabel(simPred.home)}</span>
                      <span>{simPred.prob_draw}% X</span>
                      <span>{simPred.prob_away}% {teamLabel(simPred.away)}</span>
                    </div>
                    <div style={{ height:20, display:"flex", borderRadius:10, overflow:"hidden" }}>
                      <div style={{ width:`${simPred.prob_home}%`, background:"#4a9eff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700 }}>{simPred.prob_home}%</div>
                      <div style={{ width:`${simPred.prob_draw}%`,  background:"#ffdd44", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"#000", fontWeight:700 }}>{simPred.prob_draw>8?`${simPred.prob_draw}%`:""}</div>
                      <div style={{ width:`${simPred.prob_away}%`, background:"#ff9966", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700 }}>{simPred.prob_away}%</div>
                    </div>
                  </div>

                  {/* Goles y corners */}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
                    <div style={{ background:"rgba(0,0,0,0.35)", borderRadius:10, padding:14, border:"1px solid rgba(0,204,136,0.3)" }}>
                      <div style={{ fontSize:10, color:"#00cc88", fontWeight:700, marginBottom:8 }}>⚽ GOLES</div>
                      <div style={{ display:"flex", justifyContent:"space-around" }}>
                        <div style={{ textAlign:"center" }}>
                          <div style={{ fontSize:10, color:"#776655" }}>{flag(simPred.home)}</div>
                          <div style={{ fontSize:22, fontWeight:900, color:"#4a9eff" }}>{simPred.xGHome}</div>
                        </div>
                        <div style={{ textAlign:"center" }}>
                          <div style={{ fontSize:10, color:"#776655" }}>TOTAL</div>
                          <div style={{ fontSize:26, fontWeight:900, color:"#00cc88" }}>{simPred.totalXG}</div>
                          <div style={{ fontSize:9, color:simPred.over25?"#00cc88":"#cc6644" }}>{simPred.over25?"Over 2.5":"Under 2.5"}</div>
                        </div>
                        <div style={{ textAlign:"center" }}>
                          <div style={{ fontSize:10, color:"#776655" }}>{flag(simPred.away)}</div>
                          <div style={{ fontSize:22, fontWeight:900, color:"#ff9966" }}>{simPred.xGAway}</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ background:"rgba(0,0,0,0.35)", borderRadius:10, padding:14, border:"1px solid rgba(204,136,255,0.3)" }}>
                      <div style={{ fontSize:10, color:"#cc88ff", fontWeight:700, marginBottom:8 }}>🚩 CORNERS</div>
                      <div style={{ display:"flex", justifyContent:"space-around" }}>
                        <div style={{ textAlign:"center" }}>
                          <div style={{ fontSize:10, color:"#776655" }}>{flag(simPred.home)}</div>
                          <div style={{ fontSize:22, fontWeight:900, color:"#9966ff" }}>{simPred.cornH}</div>
                        </div>
                        <div style={{ textAlign:"center" }}>
                          <div style={{ fontSize:10, color:"#776655" }}>TOTAL</div>
                          <div style={{ fontSize:26, fontWeight:900, color:"#cc88ff" }}>{simPred.totalCorners}</div>
                          <div style={{ fontSize:9, color:"#cc88ff" }}>{simPred.totalCorners>=9?"Over 8.5":simPred.totalCorners>=8?"≈ 8.5":"Under 8.5"}</div>
                        </div>
                        <div style={{ textAlign:"center" }}>
                          <div style={{ fontSize:10, color:"#776655" }}>{flag(simPred.away)}</div>
                          <div style={{ fontSize:22, fontWeight:900, color:"#88aaff" }}>{simPred.cornA}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign:"center", fontSize:14, fontWeight:700, color:"#ff6b35" }}>
                    🏆 Predicción: {simPred.predicted_result==="1"?teamLabel(simPred.home):simPred.predicted_result==="2"?teamLabel(simPred.away):"Empate"}
                  </div>
                </div>

              {/* ── ANÁLISIS IA WEB ── */}
              <div style={{ marginBottom:14 }}>
                <button
                  onClick={()=>fetchSimWebAnalysis(simPred.home, simPred.away, simPred)}
                  disabled={simWebAnalysis?.loading}
                  style={{
                    width:"100%", padding:"13px",
                    background: simWebAnalysis?.loading ? "rgba(255,255,255,0.05)" : "linear-gradient(90deg,#1a3a6a,#4a9eff)",
                    border:"1px solid rgba(74,158,255,0.5)", borderRadius:10,
                    color:"#fff", fontSize:14, fontWeight:900,
                    cursor: simWebAnalysis?.loading ? "not-allowed" : "pointer",
                    letterSpacing:1, transition:"all 0.2s", marginBottom:0,
                  }}>
                  {simWebAnalysis?.loading ? "🔍 Analizando con Gemini..." : "🌐 Análisis IA con Contexto Actual"}
                </button>

                {simWebAnalysis?.loading && (
                  <div style={{ marginTop:8, textAlign:"center", fontSize:11, color:"#4a9eff" }}>
                    Consultando Gemini 2.5 Flash...
                  </div>
                )}

                {simWebAnalysis?.text && (
                  <div style={{ marginTop:12, background:"rgba(74,158,255,0.07)",
                    border:"1px solid rgba(74,158,255,0.35)", borderRadius:12, padding:16 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                      <div style={{ fontSize:12, fontWeight:900, color:"#4a9eff" }}>🌐 ANÁLISIS IA — CONTEXTO ACTUAL</div>
                      <div style={{ fontSize:9, color:"#4a9eff", background:"rgba(74,158,255,0.1)",
                        borderRadius:4, padding:"2px 6px" }}>Gemini 2.5</div>
                    </div>
                    <div style={{ fontSize:12, color:"#ddd", lineHeight:1.9, whiteSpace:"pre-line" }}>
                      {simWebAnalysis.text}
                    </div>
                    <button onClick={()=>setSimWebAnalysis(null)} style={{
                      marginTop:10, padding:"5px 12px", background:"rgba(255,255,255,0.05)",
                      border:"1px solid rgba(255,255,255,0.1)", borderRadius:5,
                      color:"#665544", fontSize:10, cursor:"pointer",
                    }}>✕ Cerrar</button>
                  </div>
                )}

                {simWebAnalysis?.error && (
                  <div style={{ marginTop:10, padding:12, background:"rgba(200,50,0,0.08)",
                    border:"1px solid rgba(200,50,0,0.3)", borderRadius:8,
                    fontSize:11, color:"#cc6644" }}>
                    ❌ {simWebAnalysis.error}
                  </div>
                )}
              </div>

                {/* ── SECCIÓN RESULTADO REAL (si aún no se cargó) ── */}
                {!simSubmitted && (
                  <div style={{ background:"rgba(0,0,0,0.4)", border:"1px solid rgba(255,220,60,0.3)",
                    borderRadius:12, padding:16, marginBottom:14 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:"#ffdd44", marginBottom:12 }}>
                      📝 ¿Ya se jugó? Ingresá el resultado real para alimentar el modelo
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                      <div>
                        <label style={{ fontSize:10, color:"#887766", display:"block", marginBottom:4 }}>
                          ⚽ Goles {flag(simPred.home)} {teamLabel(simPred.home)}
                        </label>
                        <input type="number" min="0" max="20" placeholder="0"
                          value={simForm.hG||""} onChange={e=>setSimForm(p=>({...p,hG:e.target.value}))}
                          style={{ width:"100%", padding:"8px 10px", background:"#0d0d18", border:"1px solid rgba(255,220,60,0.4)", borderRadius:7, color:"#fff", fontSize:13, boxSizing:"border-box" }} />
                      </div>
                      <div>
                        <label style={{ fontSize:10, color:"#887766", display:"block", marginBottom:4 }}>
                          ⚽ Goles {flag(simPred.away)} {teamLabel(simPred.away)}
                        </label>
                        <input type="number" min="0" max="20" placeholder="0"
                          value={simForm.aG||""} onChange={e=>setSimForm(p=>({...p,aG:e.target.value}))}
                          style={{ width:"100%", padding:"8px 10px", background:"#0d0d18", border:"1px solid rgba(255,220,60,0.4)", borderRadius:7, color:"#fff", fontSize:13, boxSizing:"border-box" }} />
                      </div>
                      <div>
                        <label style={{ fontSize:10, color:"#887766", display:"block", marginBottom:4 }}>
                          🚩 Corners {teamLabel(simPred.home)} (opcional)
                        </label>
                        <input type="number" min="0" max="25" placeholder="—"
                          value={simForm.hC||""} onChange={e=>setSimForm(p=>({...p,hC:e.target.value}))}
                          style={{ width:"100%", padding:"8px 10px", background:"#0d0d18", border:"1px solid rgba(255,220,60,0.3)", borderRadius:7, color:"#fff", fontSize:13, boxSizing:"border-box" }} />
                      </div>
                      <div>
                        <label style={{ fontSize:10, color:"#887766", display:"block", marginBottom:4 }}>
                          🚩 Corners {teamLabel(simPred.away)} (opcional)
                        </label>
                        <input type="number" min="0" max="25" placeholder="—"
                          value={simForm.aC||""} onChange={e=>setSimForm(p=>({...p,aC:e.target.value}))}
                          style={{ width:"100%", padding:"8px 10px", background:"#0d0d18", border:"1px solid rgba(255,220,60,0.3)", borderRadius:7, color:"#fff", fontSize:13, boxSizing:"border-box" }} />
                      </div>
                    </div>
                    <div style={{ marginBottom:10 }}>
                      <label style={{ fontSize:10, color:"#887766", display:"block", marginBottom:4 }}>
                        📝 Notas del partido (lesiones, rotaciones, clima…)
                      </label>
                      <textarea placeholder="Ej: Mbappé no jugó, campo pesado por lluvia, DT probó 4-3-3..."
                        value={simForm.notes||""} onChange={e=>setSimForm(p=>({...p,notes:e.target.value}))}
                        style={{ width:"100%", padding:"8px 10px", background:"#0d0d18", border:"1px solid rgba(255,220,60,0.3)",
                          borderRadius:7, color:"#fff", fontSize:12, height:55, resize:"vertical", boxSizing:"border-box" }} />
                    </div>
                    <button
                      onClick={async () => {
                        const hG = parseFloat(simForm.hG);
                        const aG = parseFloat(simForm.aG);
                        if (isNaN(hG)||isNaN(aG)) return;
                        const hC = parseFloat(simForm.hC||0);
                        const aC = parseFloat(simForm.aC||0);
                        const notes = simForm.notes||"";
                        const realResult = hG>aG?"1":aG>hG?"2":"X";
                        const deltaGoles = (hG+aG) - simPred.totalXG;
                        const deltaCorners = simForm.hC ? Math.round(((hC+aC)-simPred.totalCorners)*10)/10 : null;
                        const resultOk = realResult===simPred.predicted_result;
                        const simResultEntry = {
                          hG, aG, hC, aC, notes,
                          pred: { ...simPred },
                          deltas: { goles: Math.round(deltaGoles*10)/10, corners: deltaCorners, resultOk },
                          ts: Date.now(),
                          type: "sim",
                        };
                        // Guardar en results con clave única
                        const simKey = `sim-${simPred.home}-${simPred.away}-${Date.now()}`;
                        const newR = { ...results, [simKey]: simResultEntry };
                        setResults(newR);
                        await saveResults(newR);
                        // Auto-learn igual que en amistosos
                        if (Math.abs(deltaGoles)>1.5) {
                          const winnerKey = hG>aG?simPred.home:aG>hG?simPred.away:null;
                          if (winnerKey) {
                            const newAdj = { ...adjustments };
                            if (!newAdj[winnerKey]) newAdj[winnerKey]={};
                            newAdj[winnerKey].formaBonus = Math.min(8,(newAdj[winnerKey].formaBonus||0)+2);
                            setAdjustments(newAdj);
                            await saveAdjustments(newAdj);
                          }
                        }
                        setSimSubmitted(true);
                        setSimResultData({ ...simResultEntry, key: simKey });
                        // Fetch AI insight
                        const fakeF = { home:simPred.home, away:simPred.away, id: simKey };
                        fetchInsight(simKey, fakeF, simResultEntry, simPred);
                      }}
                      style={{ width:"100%", padding:"10px", background:"linear-gradient(90deg,#7a6000,#ffdd44)",
                        border:"none", borderRadius:8, color:"#000", fontSize:13, fontWeight:900, cursor:"pointer" }}>
                      ✅ Guardar resultado y analizar
                    </button>
                  </div>
                )}

                {/* ── PANEL DE VALIDACIÓN (después de cargar resultado) ── */}
                {simSubmitted && simResultData && (
                  <div>
                    {/* Comparativa pred vs real */}
                    <div style={{ background:"rgba(0,0,0,0.45)", border:"1px solid rgba(0,204,136,0.3)",
                      borderRadius:12, padding:16, marginBottom:12 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:"#00cc88", marginBottom:12 }}>📊 PREDICCIÓN vs REAL</div>
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:10 }}>
                        {[
                          { label:"Resultado",
                            pred: simResultData.pred.predicted_result==="1"?teamLabel(simPred.home):simResultData.pred.predicted_result==="2"?teamLabel(simPred.away):"Empate",
                            real: simResultData.hG>simResultData.aG?teamLabel(simPred.home):simResultData.aG>simResultData.hG?teamLabel(simPred.away):"Empate",
                            ok: simResultData.deltas.resultOk },
                          { label:"⚽ Goles totales",
                            pred: simResultData.pred.totalXG,
                            real: simResultData.hG+simResultData.aG,
                            delta: simResultData.deltas.goles,
                            ok: (simResultData.pred.totalXG>2.5)===(simResultData.hG+simResultData.aG>2.5) },
                          simResultData.hC ? {
                            label:"🚩 Corners totales",
                            pred: simResultData.pred.totalCorners,
                            real: simResultData.hC+simResultData.aC,
                            delta: simResultData.deltas.corners,
                            ok: simResultData.deltas.corners!==null&&(simResultData.pred.totalCorners>8.5)===(simResultData.hC+simResultData.aC>8.5),
                          } : { label:"🚩 Corners", pred: simResultData.pred.totalCorners, real:"No reg.", ok:null },
                        ].map((v,i)=>(
                          <div key={i} style={{ background:"rgba(255,255,255,0.04)", borderRadius:9, padding:12,
                            border: v.ok===true?"1px solid rgba(0,204,136,0.3)":v.ok===false?"1px solid rgba(200,50,0,0.3)":"1px solid rgba(255,255,255,0.06)" }}>
                            <div style={{ fontSize:9, color:"#665544", marginBottom:6 }}>{v.label}</div>
                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                              <div>
                                <div style={{ fontSize:9, color:"#665544" }}>Pred</div>
                                <div style={{ fontSize:14, fontWeight:700, color:"#aaa" }}>{v.pred}</div>
                              </div>
                              <div style={{ fontSize:18 }}>{v.ok===true?"✅":v.ok===false?"❌":"—"}</div>
                              <div style={{ textAlign:"right" }}>
                                <div style={{ fontSize:9, color:"#665544" }}>Real</div>
                                <div style={{ fontSize:14, fontWeight:700, color:"#fff" }}>{v.real}</div>
                              </div>
                            </div>
                            {v.delta!==undefined && (
                              <div style={{ textAlign:"center", fontSize:10, marginTop:5,
                                color: Math.abs(v.delta)<=1?"#00cc88":Math.abs(v.delta)<=2?"#ffaa44":"#cc4422" }}>
                                Δ {v.delta>0?"+":""}{v.delta}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {simResultData.notes && (
                        <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:8, padding:9,
                          border:"1px solid rgba(255,255,255,0.06)", fontSize:11, color:"#998877" }}>
                          📝 <em>{simResultData.notes}</em>
                        </div>
                      )}
                    </div>

                    {/* AI Insight */}
                    <div style={{ background:"rgba(74,158,255,0.06)", border:"1px solid rgba(74,158,255,0.25)",
                      borderRadius:11, padding:14, marginBottom:12 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:"#4a9eff", marginBottom:8 }}>
                        🤖 ANÁLISIS IA — Qué no tomó en cuenta el modelo
                      </div>
                      {aiInsight[simResultData.key]?.loading && (
                        <div style={{ fontSize:11, color:"#665544", fontStyle:"italic" }}>Analizando partido… ⏳</div>
                      )}
                      {aiInsight[simResultData.key]?.text && !aiInsight[simResultData.key]?.loading && (
                        <div style={{ fontSize:11, color:"#bbb", lineHeight:1.9, whiteSpace:"pre-line" }}>
                          {aiInsight[simResultData.key].text}
                        </div>
                      )}
                    </div>

                    {/* Ajuste aprendido */}
                    {(adjustments[simPred.home]?.formaBonus||adjustments[simPred.away]?.formaBonus) && (
                      <div style={{ background:"rgba(0,204,136,0.07)", border:"1px solid rgba(0,204,136,0.25)",
                        borderRadius:9, padding:10, fontSize:10, color:"#00cc88" }}>
                        ⚡ Ajuste aprendido:
                        {adjustments[simPred.home]?.formaBonus?` ${teamLabel(simPred.home)} +${adjustments[simPred.home].formaBonus} forma`:""}
                        {adjustments[simPred.away]?.formaBonus?` ${teamLabel(simPred.away)} +${adjustments[simPred.away].formaBonus} forma`:""}
                      </div>
                    )}

                    {/* Botón para simular otro */}
                    <button onClick={()=>{ setSimPred(null); setSimSubmitted(false); setSimForm({}); setSimResultData(null); }} style={{
                      width:"100%", marginTop:12, padding:10, background:"rgba(255,255,255,0.06)",
                      border:"1px solid rgba(255,255,255,0.1)", borderRadius:9,
                      color:"#887766", fontSize:12, cursor:"pointer",
                    }}>↩ Simular otro partido</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════ TAB: RANKING ══════ */}
        {tab==="ranking" && (
          <div>
            <h2 style={{ color:"#ff6b35", fontSize:16, marginBottom:16, letterSpacing:2 }}>POWER RANKING — 48 EQUIPOS</h2>
            {Object.keys(adjustments).length > 0 && (
              <div style={{ fontSize:10, color:"#00cc88", marginBottom:12 }}>
                ⚡ Incluye {Object.keys(adjustments).length} ajuste(s) aprendidos de amistosos.
              </div>
            )}
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {scores.map(({ team, score },i) => {
                const t = TEAMS_DATA[team];
                const hasAdj = adjustments[team]?.formaBonus;
                return (
                  <div key={team} style={{
                    display:"flex", alignItems:"center", gap:10,
                    background: i<3?"rgba(255,200,0,0.07)":"rgba(255,255,255,0.03)",
                    border: i<3?"1px solid rgba(255,200,0,0.22)":"1px solid rgba(255,255,255,0.06)",
                    borderRadius:9, padding:"9px 13px",
                  }}>
                    <span style={{ width:24, textAlign:"center", fontWeight:900, color:i<3?"#ffd700":"#443322", fontSize:i<3?16:11 }}>
                      {i<3?["🥇","🥈","🥉"][i]:`${i+1}`}
                    </span>
                    <span style={{ fontSize:20 }}>{flag(team)}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:700 }}>
                        {teamLabel(team)}
                        {hasAdj && <span style={{ fontSize:9, color:"#00cc88", marginLeft:5 }}>⚡+{hasAdj}</span>}
                      </div>
                      <div style={{ display:"flex", gap:7, marginTop:2, flexWrap:"wrap" }}>
                        <span style={{ fontSize:9, color:"#4a9eff" }}>FIFA #{t.fifa}</span>
                        <span style={{ fontSize:9, color:"#ffd700" }}>€{t.valor}M</span>
                        <span style={{ fontSize:9, color:"#ff9966" }}>Grp {t.grupo}</span>
                        <span style={{ fontSize:9, color:"#00cc88" }}>xGF:{t.xGF}</span>
                        <span style={{ fontSize:9, color:"#cc88ff" }}>🚩{t.cornersF}</span>
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:19, fontWeight:900, color:`hsl(${score*1.15},65%,58%)` }}>{score}</div>
                      <div style={{ height:3, width:65, background:"rgba(255,255,255,0.07)", borderRadius:2, marginTop:3 }}>
                        <div style={{ height:"100%", width:`${score}%`, background:`hsl(${score*1.15},65%,50%)`, borderRadius:2 }}/>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>


        {/* ══════ TAB: BRACKET ══════ */}
        {tab==="bracket" && (()=>{

          // ── Knockout bracket structure ──
          // R16 slot → [groupA_pos, groupB_pos] based on FIFA 2026 rules
          const R16_SLOTS = [
            { id:"R16-1",  label:"Octavos 1",  slotH:"1A", slotA:"2B" },
            { id:"R16-2",  label:"Octavos 2",  slotH:"1C", slotA:"2D" },
            { id:"R16-3",  label:"Octavos 3",  slotH:"1E", slotA:"2F" },
            { id:"R16-4",  label:"Octavos 4",  slotH:"1G", slotA:"2H" },
            { id:"R16-5",  label:"Octavos 5",  slotH:"1I", slotA:"2J" },
            { id:"R16-6",  label:"Octavos 6",  slotH:"1K", slotA:"2L" },
            { id:"R16-7",  label:"Octavos 7",  slotH:"3ABCD", slotA:"3EFGH" },
            { id:"R16-8",  label:"Octavos 8",  slotH:"3IJKL", slotA:"Mejor 3°" },
            { id:"R16-9",  label:"Octavos 9",  slotH:"2A", slotA:"2C" },
            { id:"R16-10", label:"Octavos 10", slotH:"2E", slotA:"2G" },
            { id:"R16-11", label:"Octavos 11", slotH:"2I", slotA:"2K" },
            { id:"R16-12", label:"Octavos 12", slotH:"1B", slotA:"1D" },
            { id:"R16-13", label:"Octavos 13", slotH:"1F", slotA:"1H" },
            { id:"R16-14", label:"Octavos 14", slotH:"1J", slotA:"1L" },
            { id:"R16-15", label:"Octavos 15", slotH:"3MIX1", slotA:"3MIX2" },
            { id:"R16-16", label:"Octavos 16", slotH:"3MIX3", slotA:"3MIX4" },
          ];
          const QF_SLOTS = [
            { id:"QF-1", label:"Cuartos 1", fromH:"R16-1",  fromA:"R16-2"  },
            { id:"QF-2", label:"Cuartos 2", fromH:"R16-3",  fromA:"R16-4"  },
            { id:"QF-3", label:"Cuartos 3", fromH:"R16-5",  fromA:"R16-6"  },
            { id:"QF-4", label:"Cuartos 4", fromH:"R16-7",  fromA:"R16-8"  },
            { id:"QF-5", label:"Cuartos 5", fromH:"R16-9",  fromA:"R16-10" },
            { id:"QF-6", label:"Cuartos 6", fromH:"R16-11", fromA:"R16-12" },
            { id:"QF-7", label:"Cuartos 7", fromH:"R16-13", fromA:"R16-14" },
            { id:"QF-8", label:"Cuartos 8", fromH:"R16-15", fromA:"R16-16" },
          ];
          const SF_SLOTS = [
            { id:"SF-1", label:"Semifinal 1", fromH:"QF-1", fromA:"QF-2" },
            { id:"SF-2", label:"Semifinal 2", fromH:"QF-3", fromA:"QF-4" },
            { id:"SF-3", label:"Semifinal 3", fromH:"QF-5", fromA:"QF-6" },
            { id:"SF-4", label:"Semifinal 4", fromH:"QF-7", fromA:"QF-8" },
          ];
          const FINAL_SLOTS = [
            { id:"F-1", label:"Final 1", fromH:"SF-1", fromA:"SF-2" },
            { id:"F-2", label:"Final 2", fromH:"SF-3", fromA:"SF-4" },
          ];
          const GRAND_FINAL = { id:"FINAL", label:"⭐ FINAL MUNDIAL", fromH:"F-1", fromA:"F-2" };

          const GRUPOS_LIST = Object.entries({
            A:["México","Sudáfrica","Corea_del_Sur","Rep_Checa"],
            B:["Canadá","Bosnia","Qatar","Suiza"],
            C:["Brasil","Marruecos","Haití","Escocia"],
            D:["EE_UU","Paraguay","Australia","Turquía"],
            E:["Alemania","Curazao","Costa_Marfil","Ecuador"],
            F:["Países_Bajos","Japón","Suecia","Túnez"],
            G:["Bélgica","Egipto","Irán","Nueva_Zelanda"],
            H:["España","Cabo_Verde","Arabia_Saudita","Uruguay"],
            I:["Francia","Senegal","Irak","Noruega"],
            J:["Argentina","Argelia","Austria","Jordania"],
            K:["Portugal","RD_Congo","Uzbekistán","Colombia"],
            L:["Inglaterra","Croacia","Ghana","Panamá"],
          });

          // Get winner of a KO match
          const getKOWinner = (id) => {
            const m = knockoutMatches[id];
            if (!m || !m.confirmed) return null;
            if (m.hG > m.aG) return m.home;
            if (m.aG > m.hG) return m.away;
            return m.penWinner || null; // penalties
          };

          // Get team for a KO slot (from qualifiers or prev round)
          const getSlotTeam = (slot) => {
            // From group qualifiers
            const grpMatch = slot.match(/^([12])([A-L])$/);
            if (grpMatch) {
              const pos = grpMatch[1]==="1"?"first":"second";
              return confirmedQualifiers[grpMatch[2]]?.[pos] || null;
            }
            // Best thirds (free text slots)
            if (slot.startsWith("3") || slot==="Mejor 3°") return confirmedQualifiers["THIRDS"]?.[slot] || null;
            // From previous KO round
            const koMatch = knockoutMatches[slot];
            if (koMatch?.confirmed) {
              if (koMatch.hG > koMatch.aG) return koMatch.home;
              if (koMatch.aG > koMatch.hG) return koMatch.away;
              return koMatch.penWinner || null;
            }
            return null;
          };

          // Suggest qualifier based on model scores
          const suggestQualifiers = (grp, teams) => {
            return [...teams].sort((a,b) => calcScore(b,adjustments) - calcScore(a,adjustments));
          };

          // Editable group table
          const GroupTable = ({ grp, teams }) => {
            const standing = groupStandings[grp] || teams.map(t=>({ team:t, pts:0, gf:0, ga:0, pj:0 }));
            const sorted = [...standing].sort((a,b)=> b.pts-a.pts || (b.gf-b.ga)-(a.gf-a.ga) || b.gf-a.gf);
            const suggested = suggestQualifiers(grp, teams);
            const qual = confirmedQualifiers[grp] || {};
            const isEditing = editingGroup===grp;

            const updateStanding = async (idx, field, val) => {
              const newS = standing.map((r,i) => i===idx ? {...r, [field]: parseFloat(val)||0} : r);
              const newGS = { ...groupStandings, [grp]: newS };
              setGroupStandings(newGS);
              await saveGroupStandings(newGS);
            };

            const confirmQualifiers = async (first, second, third) => {
              const newQ = { ...confirmedQualifiers, [grp]: { first, second, third } };
              setConfirmedQualifiers(newQ);
              await saveQualifiers(newQ);
              setEditingGroup(null);
            };

            return (
              <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${qual.first?"rgba(0,204,136,0.4)":"rgba(255,255,255,0.08)"}`,
                borderRadius:11, overflow:"hidden", marginBottom:12 }}>
                {/* Header */}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                  padding:"10px 14px", background:"rgba(255,107,53,0.1)", borderBottom:"1px solid rgba(255,107,53,0.2)" }}>
                  <div style={{ fontSize:13, fontWeight:900, color:"#ff6b35", letterSpacing:2 }}>GRUPO {grp}</div>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    {qual.first && <span style={{ fontSize:9, color:"#00cc88" }}>✓ Clasificados confirmados</span>}
                    <button onClick={()=>setEditingGroup(isEditing?null:grp)} style={{
                      padding:"4px 10px", background:"rgba(255,107,53,0.2)", border:"1px solid rgba(255,107,53,0.4)",
                      borderRadius:5, color:"#ff9966", fontSize:10, cursor:"pointer", fontWeight:700 }}>
                      {isEditing?"✓ Cerrar":"✏️ Editar"}
                    </button>
                  </div>
                </div>

                {/* Tabla de posiciones */}
                <div>
                  {/* Cabecera */}
                  <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr",
                    padding:"6px 14px", fontSize:9, color:"#665544", fontWeight:700, letterSpacing:1, gap:4 }}>
                    <span>EQUIPO</span>
                    <span style={{textAlign:"center"}}>PJ</span>
                    <span style={{textAlign:"center"}}>PTS</span>
                    <span style={{textAlign:"center"}}>GF</span>
                    <span style={{textAlign:"center"}}>GC</span>
                    <span style={{textAlign:"center"}}>DIF</span>
                  </div>
                  {sorted.map((row, i) => {
                    const origIdx = standing.findIndex(s=>s.team===row.team);
                    const isFirst  = qual.first===row.team;
                    const isSecond = qual.second===row.team;
                    const isThird  = qual.third===row.team;
                    const modelRank = suggested.indexOf(row.team);
                    return (
                      <div key={row.team} style={{
                        display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr",
                        padding:"8px 14px", gap:4, alignItems:"center",
                        borderTop:"1px solid rgba(255,255,255,0.04)",
                        background: isFirst?"rgba(0,204,136,0.08)":isSecond?"rgba(74,158,255,0.06)":isThird?"rgba(255,165,0,0.05)":"transparent",
                      }}>
                        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                          <span style={{ fontSize:10, color: i===0?"#00cc88":i===1?"#4a9eff":i===2?"#ffaa44":"#443322", fontWeight:700, width:14 }}>
                            {i+1}
                          </span>
                          <span style={{ fontSize:18 }}>{flag(row.team)}</span>
                          <div>
                            <div style={{ fontSize:11, fontWeight:600 }}>{teamLabel(row.team)}</div>
                            <div style={{ fontSize:8, color:"#554433" }}>
                              Modelo: #{modelRank+1} · Score:{calcScore(row.team,adjustments)}
                            </div>
                          </div>
                          {isFirst  && <span style={{ fontSize:9, background:"#00cc88", color:"#000", borderRadius:3, padding:"1px 4px", marginLeft:2 }}>1°</span>}
                          {isSecond && <span style={{ fontSize:9, background:"#4a9eff", color:"#000", borderRadius:3, padding:"1px 4px", marginLeft:2 }}>2°</span>}
                          {isThird  && <span style={{ fontSize:9, background:"#ffaa44", color:"#000", borderRadius:3, padding:"1px 4px", marginLeft:2 }}>3°</span>}
                        </div>
                        {/* Stats — editables si está en modo edición */}
                        {["pj","pts","gf","ga"].map(field=>(
                          <div key={field} style={{ textAlign:"center" }}>
                            {isEditing ? (
                              <input type="number" min="0" max="99" value={row[field]}
                                onChange={e=>updateStanding(origIdx, field, e.target.value)}
                                style={{ width:"100%", padding:"4px", background:"#0d0d18", border:"1px solid rgba(255,107,53,0.4)",
                                  borderRadius:5, color:"#fff", fontSize:12, textAlign:"center" }} />
                            ) : (
                              <span style={{ fontSize:13, fontWeight:700, color:field==="pts"?"#ff9966":"#ccc" }}>{row[field]}</span>
                            )}
                          </div>
                        ))}
                        <div style={{ textAlign:"center" }}>
                          <span style={{ fontSize:13, fontWeight:700,
                            color:(row.gf-row.ga)>0?"#00cc88":(row.gf-row.ga)<0?"#cc4422":"#888" }}>
                            {(row.gf-row.ga)>0?"+":""}{row.gf-row.ga}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Panel de confirmación de clasificados */}
                {isEditing && (
                  <div style={{ padding:14, borderTop:"1px solid rgba(255,107,53,0.2)", background:"rgba(0,0,0,0.4)" }}>
                    <div style={{ fontSize:11, color:"#ff9966", fontWeight:700, marginBottom:10 }}>
                      CONFIRMAR CLASIFICADOS — Sugerencia del modelo:
                    </div>
                    {/* Sugerencia */}
                    <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
                      {suggested.slice(0,3).map((t,i)=>(
                        <div key={t} style={{ background:"rgba(255,255,255,0.06)", borderRadius:7, padding:"6px 10px",
                          border:"1px solid rgba(255,107,53,0.2)", fontSize:11 }}>
                          <span style={{ color:i===0?"#00cc88":i===1?"#4a9eff":"#ffaa44", fontWeight:700, marginRight:4 }}>
                            {i===0?"1°":i===1?"2°":"3°"}
                          </span>
                          {flag(t)} {teamLabel(t)}
                          <span style={{ fontSize:9, color:"#554433", marginLeft:4 }}>({calcScore(t,adjustments)})</span>
                        </div>
                      ))}
                    </div>
                    {/* Dropdowns para confirmar */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:10 }}>
                      {[{pos:"first",label:"🥇 1° Clasificado",color:"#00cc88"},
                        {pos:"second",label:"🥈 2° Clasificado",color:"#4a9eff"},
                        {pos:"third",label:"🥉 3° (mejor tercero)",color:"#ffaa44"}].map(({pos,label,color})=>(
                        <div key={pos}>
                          <label style={{ fontSize:9, color, display:"block", marginBottom:4 }}>{label}</label>
                          <select
                            value={confirmedQualifiers[grp]?.[pos]||""}
                            onChange={async e=>{
                              const newQ={...confirmedQualifiers,[grp]:{...confirmedQualifiers[grp],[pos]:e.target.value}};
                              setConfirmedQualifiers(newQ);
                              await saveQualifiers(newQ);
                            }}
                            style={{ width:"100%", padding:"7px 8px", background:"#0d0d18",
                              border:`1px solid ${color}55`, borderRadius:6, color:"#fff", fontSize:11 }}>
                            <option value="">— Seleccionar —</option>
                            {teams.map(t=><option key={t} value={t}>{flag(t)} {teamLabel(t)}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={()=>{
                        const q=confirmedQualifiers[grp]||{};
                        confirmQualifiers(q.first||"",q.second||"",q.third||"");
                      }} style={{ flex:2, padding:"8px", background:"linear-gradient(90deg,#006633,#00cc88)",
                        border:"none", borderRadius:7, color:"#000", fontSize:12, fontWeight:900, cursor:"pointer" }}>
                        ✅ Confirmar y cerrar
                      </button>
                      <button onClick={async()=>{
                        const newQ={...confirmedQualifiers};delete newQ[grp];
                        setConfirmedQualifiers(newQ);await saveQualifiers(newQ);
                      }} style={{ flex:1, padding:"8px", background:"rgba(200,50,0,0.2)",
                        border:"1px solid rgba(200,50,0,0.4)", borderRadius:7, color:"#cc4422", fontSize:11, cursor:"pointer" }}>
                        🗑 Limpiar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          };

          // KO Match Card
          const KOCard = ({ slot, round, fromSlots }) => {
            const m = knockoutMatches[slot.id] || {};
            const isEditing = editingKO===slot.id;
            const teamH = m.home || getSlotTeam(slot.slotH||slot.fromH) || null;
            const teamA = m.away || getSlotTeam(slot.slotA||slot.fromA) || null;
            const confirmed = m.confirmed;
            const winner = confirmed ? (m.hG>m.aG?m.home:m.aG>m.hG?m.away:m.penWinner||null) : null;

            // Model prediction if both teams known
            const pred = (teamH && teamA && TEAMS_DATA[teamH] && TEAMS_DATA[teamA])
              ? predictMatch(teamH, teamA, adjustments) : null;

            const saveKOMatch = async (data) => {
              const newKO = { ...knockoutMatches, [slot.id]: { ...m, ...data } };
              setKnockoutMatches(newKO);
              await saveKnockout(newKO);
            };

            const fetchKOInsight = async (matchData, prediction) => {
              if (!prediction) return;
              setBracketInsight(prev=>({...prev,[slot.id]:{loading:true,text:null}}));
              await new Promise(r=>setTimeout(r,300));
              const winnerTeam = matchData.hG>matchData.aG?matchData.home:matchData.aG>matchData.hG?matchData.away:matchData.penWinner;
              const loserTeam  = matchData.hG>matchData.aG?matchData.away:matchData.aG>matchData.hG?matchData.home:null;
              const predResult = prediction.predicted_result;
              const realResult = matchData.hG>matchData.aG?"1":matchData.aG>matchData.hG?"2":"X";
              const ok = predResult === realResult;
              const realGoals = matchData.hG + matchData.aG;
              const deltaG = realGoals - prediction.totalXG;
              const realDiff = Math.abs(matchData.hG - matchData.aG);

              const bullets = [];

              if (ok && Math.abs(deltaG) <= 1) {
                bullets.push("• Predicción correcta y xG ajustado. El modelo capturó bien la asimetría entre ambos equipos en eliminatoria directa.");
              } else if (!ok && winnerTeam) {
                bullets.push(`• Sorpresa: ${teamLabel(winnerTeam)} eliminó a ${teamLabel(loserTeam)}. Factor probable: motivación, mejor preparación táctica o subvaloración en el ranking del modelo.`);
              } else {
                bullets.push(`• Resultado dentro del rango pero ${deltaG>0?"con más":"con menos"} goles. Intensidad ${deltaG>0?"alta":"controlada"} — típico de eliminatorias.`);
              }

              if (matchData.penWinner) {
                bullets.push(`• Definido por penales: el modelo no tiene en cuenta esta lotería. Considerar experiencia previa en definiciones para cruces parejos.`);
              } else if (realDiff >= 3) {
                bullets.push("• Diferencia amplia inusual en eliminatoria. Revisar desgaste, lesiones clave del perdedor o superioridad táctica decisiva del ganador.");
              } else if (!ok) {
                bullets.push(`• Variable a ajustar: aumentar bonus de forma a ${teamLabel(winnerTeam)} para el resto del bracket.`);
              } else {
                bullets.push("• Variables bien calibradas para esta fase. Mantener metodología en próximos cruces.");
              }

              const remaining = (slot.id.startsWith("R16")?"cuartos":slot.id.startsWith("QF")?"semis":slot.id.startsWith("SF")?"final":"título");
              bullets.push(`• Impacto: ${teamLabel(winnerTeam||"?")} avanza a ${remaining}. Recalcular favoritismo de su próximo rival con esta nueva información.`);

              if (matchData.notes && matchData.notes.trim()) {
                bullets.push(`• Nota: ${matchData.notes}`);
              }

              const text = bullets.join("\n\n");
              setBracketInsight(prev=>({...prev,[slot.id]:{loading:false,text}}));
              try { await window.storage.set(`mw2026-koinsight-${slot.id}`, text); } catch(_) {}
            };

            return (
              <div style={{
                border: confirmed?"1px solid rgba(0,204,136,0.4)":teamH&&teamA?"1px solid rgba(255,107,53,0.3)":"1px solid rgba(255,255,255,0.07)",
                borderRadius:10, overflow:"hidden", marginBottom:8,
                background: confirmed?"rgba(0,204,136,0.04)":"rgba(255,255,255,0.03)",
              }}>
                {/* Match header */}
                <div style={{ padding:"10px 14px" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
                    {/* Teams */}
                    <div style={{ display:"flex", alignItems:"center", gap:8, flex:1 }}>
                      <div style={{ textAlign:"center", minWidth:36 }}>
                        <div style={{ fontSize:20 }}>{teamH?flag(teamH):"❓"}</div>
                        <div style={{ fontSize:9, color: winner===teamH?"#00cc88":"#887766", fontWeight: winner===teamH?700:400 }}>
                          {teamH?teamLabel(teamH):"Por definir"}
                        </div>
                      </div>
                      <div style={{ textAlign:"center", flex:1 }}>
                        {confirmed
                          ? <div style={{ fontSize:18, fontWeight:900, color:"#00cc88" }}>{m.hG} – {m.aG}{m.penWinner?" (p)":""}</div>
                          : <div style={{ fontSize:11, color:"#443322" }}>vs</div>}
                        <div style={{ fontSize:9, color:"#ff9966" }}>{slot.label}</div>
                      </div>
                      <div style={{ textAlign:"center", minWidth:36 }}>
                        <div style={{ fontSize:20 }}>{teamA?flag(teamA):"❓"}</div>
                        <div style={{ fontSize:9, color: winner===teamA?"#00cc88":"#887766", fontWeight: winner===teamA?700:400 }}>
                          {teamA?teamLabel(teamA):"Por definir"}
                        </div>
                      </div>
                    </div>

                    {/* Prediction badge + edit button */}
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      {pred && !confirmed && (
                        <div style={{ fontSize:9, color:"#ff9966", marginBottom:4 }}>
                          Pred: <strong style={{ color: pred.predicted_result==="1"?"#4a9eff":pred.predicted_result==="2"?"#ff9966":"#ffdd44" }}>
                            {pred.predicted_result==="1"?teamLabel(teamH):pred.predicted_result==="2"?teamLabel(teamA):"Empate"}
                          </strong>
                          <span style={{ color:"#443322", marginLeft:4 }}>({pred.prob_home}%/{pred.prob_draw}%/{pred.prob_away}%)</span>
                        </div>
                      )}
                      {teamH && teamA && (
                        <button onClick={()=>{ setEditingKO(isEditing?null:slot.id); setKoForm(m.home?{...m}:{}); }} style={{
                          padding:"4px 10px", background: confirmed?"rgba(0,204,136,0.15)":"rgba(255,107,53,0.2)",
                          border:`1px solid ${confirmed?"rgba(0,204,136,0.4)":"rgba(255,107,53,0.4)"}`,
                          borderRadius:5, color: confirmed?"#00cc88":"#ff9966", fontSize:10, cursor:"pointer", fontWeight:700 }}>
                          {confirmed?"✏️ Editar":"+ Resultado"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Prediction details row */}
                  {pred && !confirmed && (
                    <div style={{ marginTop:8, display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 }}>
                      {[
                        {label:`xG ${flag(teamH)}`,val:pred.xGHome,color:"#4a9eff"},
                        {label:"xG Total",val:pred.totalXG,color:"#00cc88"},
                        {label:`xG ${flag(teamA)}`,val:pred.xGAway,color:"#ff9966"},
                        {label:"🚩 Corners",val:pred.totalCorners,color:"#cc88ff"},
                      ].map(x=>(
                        <div key={x.label} style={{ textAlign:"center", background:"rgba(0,0,0,0.3)", borderRadius:6, padding:"6px 4px" }}>
                          <div style={{ fontSize:14, fontWeight:900, color:x.color }}>{x.val}</div>
                          <div style={{ fontSize:8, color:"#665544" }}>{x.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Form de ingreso */}
                {isEditing && (
                  <div style={{ borderTop:"1px solid rgba(255,107,53,0.2)", padding:14, background:"rgba(0,0,0,0.4)" }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"#ff9966", marginBottom:10 }}>RESULTADO REAL</div>

                    {/* Manual team override if not auto-resolved */}
                    {(!teamH || !teamA) && (
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
                        {[{label:`Equipo Local`,field:"home"},{label:`Equipo Visitante`,field:"away"}].map(f=>(
                          <div key={f.field}>
                            <label style={{ fontSize:9, color:"#887766", display:"block", marginBottom:3 }}>{f.label}</label>
                            <select value={koForm[f.field]||""}
                              onChange={e=>setKoForm(p=>({...p,[f.field]:e.target.value}))}
                              style={{ width:"100%", padding:"7px", background:"#0d0d18", border:"1px solid rgba(255,107,53,0.4)", borderRadius:6, color:"#fff", fontSize:11 }}>
                              <option value="">— Seleccionar —</option>
                              {Object.keys(TEAMS_DATA).map(t=><option key={t} value={t}>{flag(t)} {teamLabel(t)}</option>)}
                            </select>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
                      {[
                        {label:`⚽ Goles ${flag(teamH||koForm.home||"?")} Local`, field:"hG"},
                        {label:`⚽ Goles ${flag(teamA||koForm.away||"?")} Visitante`, field:"aG"},
                        {label:`🚩 Corners Local (opc.)`, field:"hC"},
                        {label:`🚩 Corners Visitante (opc.)`, field:"aC"},
                      ].map(f=>(
                        <div key={f.field}>
                          <label style={{ fontSize:9, color:"#887766", display:"block", marginBottom:3 }}>{f.label}</label>
                          <input type="number" min="0" max="20" placeholder="0"
                            value={koForm[f.field]||""}
                            onChange={e=>setKoForm(p=>({...p,[f.field]:e.target.value}))}
                            style={{ width:"100%", padding:"7px", background:"#0d0d18", border:"1px solid rgba(255,107,53,0.4)", borderRadius:6, color:"#fff", fontSize:12, boxSizing:"border-box" }} />
                        </div>
                      ))}
                    </div>

                    {/* Penalties (if draw) */}
                    {koForm.hG!==undefined && koForm.aG!==undefined && parseFloat(koForm.hG)===parseFloat(koForm.aG) && (
                      <div style={{ marginBottom:8 }}>
                        <label style={{ fontSize:9, color:"#ffdd44", display:"block", marginBottom:3 }}>🎯 Empate — ¿Quién ganó en penales?</label>
                        <select value={koForm.penWinner||""}
                          onChange={e=>setKoForm(p=>({...p,penWinner:e.target.value}))}
                          style={{ width:"100%", padding:"7px", background:"#0d0d18", border:"1px solid rgba(255,220,60,0.4)", borderRadius:6, color:"#fff", fontSize:11 }}>
                          <option value="">— Seleccionar ganador penales —</option>
                          <option value={teamH||koForm.home}>{flag(teamH||koForm.home||"")} {teamLabel(teamH||koForm.home||"Local")}</option>
                          <option value={teamA||koForm.away}>{flag(teamA||koForm.away||"")} {teamLabel(teamA||koForm.away||"Visitante")}</option>
                        </select>
                      </div>
                    )}

                    <div style={{ marginBottom:8 }}>
                      <label style={{ fontSize:9, color:"#887766", display:"block", marginBottom:3 }}>📝 Notas del partido</label>
                      <textarea placeholder="Lesiones, tarjetas, prórrogas, llaves..."
                        value={koForm.notes||""}
                        onChange={e=>setKoForm(p=>({...p,notes:e.target.value}))}
                        style={{ width:"100%", padding:"7px", background:"#0d0d18", border:"1px solid rgba(255,107,53,0.3)", borderRadius:6, color:"#fff", fontSize:11, height:48, resize:"vertical", boxSizing:"border-box" }} />
                    </div>

                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={async()=>{
                        const hG=parseFloat(koForm.hG); const aG=parseFloat(koForm.aG);
                        if(isNaN(hG)||isNaN(aG)) return;
                        const finalHome = teamH||koForm.home; const finalAway = teamA||koForm.away;
                        const data = { home:finalHome, away:finalAway,
                          hG, aG, hC:parseFloat(koForm.hC||0), aC:parseFloat(koForm.aC||0),
                          penWinner:koForm.penWinner||null, notes:koForm.notes||"", confirmed:true };
                        await saveKOMatch(data);
                        // Auto-learn
                        const realResult = hG>aG?"1":aG>hG?"2":"X";
                        if(pred) {
                          const deltaG = (hG+aG)-pred.totalXG;
                          if(Math.abs(deltaG)>1.5) {
                            const winnerK = hG>aG?finalHome:aG>hG?finalAway:koForm.penWinner;
                            if(winnerK) {
                              const newAdj={...adjustments};
                              if(!newAdj[winnerK]) newAdj[winnerK]={};
                              newAdj[winnerK].formaBonus=Math.min(8,(newAdj[winnerK].formaBonus||0)+2);
                              setAdjustments(newAdj); await saveAdjustments(newAdj);
                            }
                          }
                        }
                        setEditingKO(null); setKoForm({});
                        fetchKOInsight(data, pred);
                      }} style={{ flex:2, padding:"9px", background:"linear-gradient(90deg,#006633,#00cc88)",
                        border:"none", borderRadius:7, color:"#000", fontSize:12, fontWeight:900, cursor:"pointer" }}>
                        ✅ Guardar y Analizar
                      </button>
                      <button onClick={async()=>{
                        const newKO={...knockoutMatches}; delete newKO[slot.id];
                        setKnockoutMatches(newKO); await saveKnockout(newKO);
                        setEditingKO(null); setKoForm({});
                      }} style={{ flex:1, padding:"9px", background:"rgba(200,50,0,0.2)", border:"1px solid rgba(200,50,0,0.4)",
                        borderRadius:7, color:"#cc4422", fontSize:11, cursor:"pointer" }}>
                        🗑 Limpiar
                      </button>
                    </div>
                  </div>
                )}

                {/* AI Insight for KO match */}
                {confirmed && bracketInsight[slot.id] && (
                  <div style={{ borderTop:"1px solid rgba(74,158,255,0.2)", padding:"10px 14px",
                    background:"rgba(74,158,255,0.04)" }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"#4a9eff", marginBottom:6 }}>🤖 Análisis IA</div>
                    {bracketInsight[slot.id].loading
                      ? <div style={{ fontSize:10, color:"#554433", fontStyle:"italic" }}>Analizando… ⏳</div>
                      : <div style={{ fontSize:10, color:"#bbb", lineHeight:1.8, whiteSpace:"pre-line" }}>{bracketInsight[slot.id].text}</div>}
                  </div>
                )}
              </div>
            );
          };

          // Section header helper
          const RoundHeader = ({label, sub}) => (
            <div style={{ margin:"20px 0 10px", display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ flex:1, height:1, background:"rgba(255,107,53,0.2)" }}/>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:14, fontWeight:900, color:"#ff6b35", letterSpacing:2 }}>{label}</div>
                {sub && <div style={{ fontSize:9, color:"#554433" }}>{sub}</div>}
              </div>
              <div style={{ flex:1, height:1, background:"rgba(255,107,53,0.2)" }}/>
            </div>
          );

          // Count confirmed qualifiers
          const totalConfirmed = Object.values(confirmedQualifiers)
            .filter(q => q && typeof q === 'object' && !Array.isArray(q))
            .reduce((s, q) => s + (q.first?1:0) + (q.second?1:0), 0);

          return (
            <div>
              {/* Progress bar */}
              <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,107,53,0.2)",
                borderRadius:10, padding:"10px 16px", marginBottom:16, display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#887766", marginBottom:4 }}>
                    <span>Grupos confirmados</span>
                    <span style={{ color:"#00cc88", fontWeight:700 }}>{totalConfirmed}/24 clasificados directos</span>
                  </div>
                  <div style={{ height:5, background:"rgba(255,255,255,0.08)", borderRadius:3 }}>
                    <div style={{ height:"100%", width:`${(totalConfirmed/24)*100}%`, background:"#00cc88", borderRadius:3, transition:"width 0.4s" }}/>
                  </div>
                </div>
                <div style={{ fontSize:9, color:"#554433", textAlign:"right" }}>
                  +8 mejores 3°<br/>= 32 en Octavos
                </div>
              </div>

              {/* ── FASE DE GRUPOS ── */}
              <RoundHeader label="FASE DE GRUPOS" sub="Clasifican: 1° y 2° de cada grupo + 8 mejores terceros" />
              {GRUPOS_LIST.map(([grp, teams]) => (
                <GroupTable key={grp} grp={grp} teams={teams} />
              ))}

              {/* ── OCTAVOS ── */}
              <RoundHeader label="OCTAVOS DE FINAL" sub="32 equipos · 16 partidos" />
              {R16_SLOTS.map(slot => <KOCard key={slot.id} slot={slot} round="R16" />)}

              {/* ── CUARTOS ── */}
              <RoundHeader label="CUARTOS DE FINAL" sub="16 equipos · 8 partidos" />
              {QF_SLOTS.map(slot => <KOCard key={slot.id} slot={slot} round="QF" />)}

              {/* ── SEMIS ── */}
              <RoundHeader label="SEMIFINALES" sub="8 equipos · 4 partidos" />
              {SF_SLOTS.map(slot => <KOCard key={slot.id} slot={slot} round="SF" />)}

              {/* ── FINALES ── */}
              <RoundHeader label="FINALES DE ZONA" sub="4 equipos · 2 partidos" />
              {FINAL_SLOTS.map(slot => <KOCard key={slot.id} slot={slot} round="F" />)}

              {/* ── GRAN FINAL ── */}
              <RoundHeader label="⭐ GRAN FINAL" sub="19 de julio 2026 · MetLife Stadium" />
              <KOCard slot={GRAND_FINAL} round="FINAL" />
            </div>
          );
        })()}

      {/* ── MODAL BACKUP ── */}
      {showBackup && (
        <div style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:999,
          display:"flex", alignItems:"flex-end", justifyContent:"center",
          padding:"0 0 0 0",
        }} onClick={()=>setShowBackup(false)}>
          <div onClick={e=>e.stopPropagation()} style={{
            width:"100%", maxWidth:600,
            background:"#0d1020", border:"1px solid rgba(255,220,60,0.4)",
            borderRadius:"16px 16px 0 0", padding:"20px 16px 32px",
            maxHeight:"85vh", overflowY:"auto",
          }}>
            {/* Header modal */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{ fontSize:15, fontWeight:900, color:"#ffdd44" }}>💾 Guardar / Restaurar datos</div>
              <button onClick={()=>setShowBackup(false)} style={{
                background:"rgba(255,255,255,0.08)", border:"none", borderRadius:6,
                color:"#887766", fontSize:18, cursor:"pointer", padding:"2px 10px",
              }}>✕</button>
            </div>

            {/* Tabs export/import */}
            <div style={{ display:"flex", gap:8, marginBottom:16 }}>
              {[{id:"export",label:"📤 Guardar mis datos"},{id:"import",label:"📥 Restaurar datos"}].map(t=>(
                <button key={t.id} onClick={()=>{ setBackupMode(t.id); setBackupMsg(""); }} style={{
                  flex:1, padding:"10px", border:"none", borderRadius:8, cursor:"pointer",
                  background: backupMode===t.id?"rgba(255,220,60,0.2)":"rgba(255,255,255,0.05)",
                  color: backupMode===t.id?"#ffdd44":"#887766",
                  fontWeight: backupMode===t.id?800:400, fontSize:13,
                  borderBottom: backupMode===t.id?"2px solid #ffdd44":"2px solid transparent",
                }}>{t.label}</button>
              ))}
            </div>

            {/* EXPORT MODE */}
            {backupMode==="export" && (
              <div>
                <div style={{ fontSize:11, color:"#bb9977", lineHeight:1.7, marginBottom:12 }}>
                  <strong style={{ color:"#ffdd44" }}>Cómo guardar:</strong><br/>
                  1. Tocá el texto de abajo para seleccionarlo todo<br/>
                  2. Copialo (mantené presionado → Copiar todo)<br/>
                  3. Pegalo en tus <strong style={{ color:"#fff" }}>Notas del celular</strong> o WhatsApp con vos mismo<br/>
                  4. La próxima vez que abras el modelo, usá <strong style={{ color:"#fff" }}>Restaurar datos</strong>
                </div>
                <textarea
                  readOnly
                  value={backupText}
                  onFocus={e=>e.target.select()}
                  onClick={e=>e.target.select()}
                  style={{
                    width:"100%", height:200, padding:"10px", background:"#070a12",
                    border:"1px solid rgba(255,220,60,0.3)", borderRadius:8,
                    color:"#00cc88", fontSize:10, fontFamily:"monospace",
                    resize:"none", boxSizing:"border-box", lineHeight:1.4,
                  }}
                />
                <div style={{ marginTop:10, fontSize:10, color:"#554433", textAlign:"center" }}>
                  Tocá el cuadro verde → se selecciona solo → copiá
                </div>
              </div>
            )}

            {/* IMPORT MODE */}
            {backupMode==="import" && (
              <div>
                <div style={{ fontSize:11, color:"#bb9977", lineHeight:1.7, marginBottom:12 }}>
                  <strong style={{ color:"#ffdd44" }}>Cómo restaurar:</strong><br/>
                  1. Abrí tus Notas y copiá el texto que guardaste<br/>
                  2. Pegalo en el cuadro de abajo<br/>
                  3. Tocá <strong style={{ color:"#fff" }}>Restaurar</strong>
                </div>
                <textarea
                  placeholder='Pegá acá el texto JSON que guardaste en tus notas...'
                  value={importText}
                  onChange={e=>setImportText(e.target.value)}
                  style={{
                    width:"100%", height:180, padding:"10px", background:"#070a12",
                    border:"1px solid rgba(255,220,60,0.3)", borderRadius:8,
                    color:"#fff", fontSize:10, fontFamily:"monospace",
                    resize:"none", boxSizing:"border-box", lineHeight:1.4,
                  }}
                />
                {backupMsg && (
                  <div style={{ marginTop:10, fontSize:12, fontWeight:700, textAlign:"center",
                    color: backupMsg.startsWith("✅")?"#00cc88":"#cc4422" }}>
                    {backupMsg}
                  </div>
                )}
                <button onClick={handleImport} style={{
                  width:"100%", marginTop:12, padding:"13px",
                  background:"linear-gradient(90deg,#7a6000,#ffdd44)",
                  border:"none", borderRadius:9, color:"#000",
                  fontSize:14, fontWeight:900, cursor:"pointer",
                }}>📥 Restaurar mis datos</button>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ textAlign:"center", padding:"16px", borderTop:"1px solid rgba(255,107,53,0.1)", fontSize:9, color:"#221a11" }}>
        Mundial 2026 Predictor v6.0 · 48+equipos · IA Gemini · Backup manual
      </div>
    </div>
  );
}
