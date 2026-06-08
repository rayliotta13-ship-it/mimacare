/**
 * Système de persistance MimaCare
 * localStorage (local) + Supabase (sync famille)
 */

import { supabase } from '../supabase';

const KEYS = {
  medicines: "mimacare_medicines",
  contacts: "mimacare_contacts",
  presences: "mimacare_presences",
  presentTonight: "mimacare_present_tonight",
  eveningHistory: "mimacare_evening_history",
  history: "mimacare_history",
  glycemias: "mimacare_glycemias",
  glycemiaHistory: "mimacare_glycemia_history",
  notes: "mimacare_notes",
  medsChecked: "mimacare_meds_checked",
};

// ─── MÉDICAMENTS ────────────────────────────────────────────
export const getMedicines = () => {
  const stored = localStorage.getItem(KEYS.medicines);
  if (!stored) return initializeMedicines();
  try { return JSON.parse(stored); } catch { return initializeMedicines(); }
};

export const initializeMedicines = () => {
  const defaultMeds = {
    matin: [
      { id: 1, name: "AZARGA", role: "gouttes yeux", dose: "avant petit-déjeuner", enabled: true, alert: true },
      { id: 2, name: "Bisoprolol 2,5mg", role: "ralentit le cœur", dose: "1 comprimé", enabled: true },
      { id: 3, name: "Forxiga", role: "diabète", dose: "1 comprimé", enabled: true },
      { id: 4, name: "Spironolactone / Altizide", role: "diurétique", dose: "½ comprimé", enabled: true },
      { id: 5, name: "Eliquis 2,5mg", role: "fluidifie le sang", dose: "1 comprimé", enabled: true },
      { id: 6, name: "Stagid 700mg", role: "diabète", dose: "1 comprimé", enabled: true },
      { id: 7, name: "Diffu-K 600mg", role: "potassium", dose: "1 gélule", enabled: true },
    ],
    midi: [
      { id: 8, name: "Boisson protéinée", role: "nutrition", dose: "1 bouteille", enabled: true },
      { id: 9, name: "Stagid 700mg", role: "diabète", dose: "1 comprimé", enabled: true },
      { id: 10, name: "Kardégic 75mg", role: "fluidifie le sang", dose: "1 sachet", enabled: true },
      { id: 11, name: "Diffu-K 600mg", role: "potassium", dose: "1 gélule", enabled: true },
      { id: 12, name: "Borax / Acide borique", role: "yeux", dose: "1 unidose", enabled: true },
    ],
    soir: [
      { id: 13, name: "AZARGA", role: "gouttes yeux", dose: "22h30 après dîner", enabled: true, alert: true },
      { id: 14, name: "Stagid 700mg", role: "diabète — si glycémie OK", dose: "1 comprimé", enabled: true, alert: true },
      { id: 15, name: "Eliquis 2,5mg", role: "fluidifie le sang", dose: "1 comprimé", enabled: true },
      { id: 16, name: "Rosuvastatine 10mg", role: "cholestérol", dose: "1 comprimé", enabled: true },
      { id: 17, name: "Diffu-K 600mg", role: "potassium", dose: "1 gélule", enabled: true },
    ],
  };
  saveMedicines(defaultMeds);
  return defaultMeds;
};

export const saveMedicines = (medicines) => {
  localStorage.setItem(KEYS.medicines, JSON.stringify(medicines));
};

export const addMedicine = (moment, medicine) => {
  const meds = getMedicines();
  const newId = Math.max(...Object.values(meds).flatMap(m => m.map(x => x.id || 0)), 0) + 1;
  meds[moment] = [...(meds[moment] || []), { ...medicine, id: newId, enabled: true }];
  saveMedicines(meds);
  return newId;
};

export const updateMedicine = (moment, id, updates) => {
  const meds = getMedicines();
  meds[moment] = (meds[moment] || []).map(m => m.id === id ? { ...m, ...updates } : m);
  saveMedicines(meds);
};

export const deleteMedicine = (moment, id) => {
  const meds = getMedicines();
  meds[moment] = (meds[moment] || []).filter(m => m.id !== id);
  saveMedicines(meds);
};

// ─── CONTACTS ───────────────────────────────────────────────
export const getContacts = () => {
  const stored = localStorage.getItem(KEYS.contacts);
  if (!stored) return initializeContacts();
  try { return JSON.parse(stored); } catch { return initializeContacts(); }
};

export const initializeContacts = () => {
  const defaultContacts = [
    { id: 1, name: "Choukri", phone: "", createdAt: new Date().toISOString() },
    { id: 2, name: "Fawzi", phone: "", createdAt: new Date().toISOString() },
    { id: 3, name: "Djamila", phone: "", createdAt: new Date().toISOString() },
    { id: 4, name: "Fouad", phone: "", createdAt: new Date().toISOString() },
  ];
  saveContacts(defaultContacts);
  return defaultContacts;
};

export const saveContacts = (contacts) => {
  localStorage.setItem(KEYS.contacts, JSON.stringify(contacts));
};

export const addContact = (name, phone = "") => {
  const contacts = getContacts();
  const newId = Math.max(...contacts.map(c => c.id || 0), 0) + 1;
  const newContact = { id: newId, name, phone, createdAt: new Date().toISOString() };
  contacts.push(newContact);
  saveContacts(contacts);
  return newContact;
};

export const updateContact = (id, updates) => {
  const contacts = getContacts();
  const idx = contacts.findIndex(c => c.id === id);
  if (idx !== -1) { contacts[idx] = { ...contacts[idx], ...updates }; saveContacts(contacts); }
};

export const deleteContact = (id) => {
  saveContacts(getContacts().filter(c => c.id !== id));
};

// ─── PRÉSENCES — LOCAL + SUPABASE ───────────────────────────
export const getPresences = () => {
  const stored = localStorage.getItem(KEYS.presences);
  if (!stored) return { prenom: "Djamila", heureArrivee: "19:00", heureDepart: null };
  try { return JSON.parse(stored); } catch { return { prenom: "Djamila", heureArrivee: "19:00", heureDepart: null }; }
};

export const savePresences = (presence) => {
  localStorage.setItem(KEYS.presences, JSON.stringify(presence));
  // Sync Supabase
  supabase.from("presences").insert([{
    qui: presence.prenom,
    action: presence.heureDepart ? "depart" : "arrivee",
    horodatage: new Date().toISOString(),
  }]).then(({ error }) => { if (error) console.warn("Supabase présence:", error.message); });
};

export const subscribeToPresences = (callback) => {
  return supabase
    .channel("presences-channel")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "presences" }, (payload) => {
      callback(payload.new);
    })
    .subscribe();
};


// ─── HISTORIQUE PASSAGES ────────────────────────────────────
export const getPassagesHistory = () => {
  const stored = localStorage.getItem(KEYS.history);
  if (!stored) return initializePassagesHistory();
  try { return JSON.parse(stored); } catch { return initializePassagesHistory(); }
};

export const initializePassagesHistory = () => {
  const defaultPassages = [
    { date: "30 mai 2026", prenom: "Fouad", arrivee: "09h00", depart: "12h15" },
    { date: "30 mai 2026", prenom: "Choukri", arrivee: "12h30", depart: "18h45" },
    { date: "30 mai 2026", prenom: "Djamila", arrivee: "19h00", depart: null },
  ];
  savePassagesHistory(defaultPassages);
  return defaultPassages;
};

export const savePassagesHistory = (passages) => {
  localStorage.setItem(KEYS.history, JSON.stringify(passages));
};

export const addPassage = (prenom, arrivee, depart = null) => {
  const today = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const passages = getPassagesHistory();
  passages.push({ date: today, prenom, arrivee, depart });
  savePassagesHistory(passages);
};

export const updatePassageDepart = (index, depart) => {
  const passages = getPassagesHistory();
  if (passages[index]) { passages[index].depart = depart; savePassagesHistory(passages); }
};

// ─── PRÉSENCE SOIR ──────────────────────────────────────────
export const getPresentTonight = () => {
  const stored = localStorage.getItem(KEYS.presentTonight);
  return stored ? JSON.parse(stored) : "Djamila";
};

export const savePresentTonight = (prenom) => {
  localStorage.setItem(KEYS.presentTonight, JSON.stringify(prenom));
  supabase.from("presences").insert([{
    qui: prenom,
    action: "soir",
    horodatage: new Date().toISOString(),
  }]).then(({ error }) => { if (error) console.warn("Supabase soir:", error.message); });
};

export const getEveningHistory = () => {
  const stored = localStorage.getItem(KEYS.eveningHistory);
  if (!stored) return initializeEveningHistory();
  try { return JSON.parse(stored); } catch { return initializeEveningHistory(); }
};

export const initializeEveningHistory = () => {
  saveEveningHistory([]);
  return [];
};

export const saveEveningHistory = (history) => {
  localStorage.setItem(KEYS.eveningHistory, JSON.stringify(history));
};

export const addEveningStay = (prenom) => {
  const today = new Date();
  const date = today.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const time = today.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const history = getEveningHistory();
  history.push({ date, time, prenom });
  saveEveningHistory(history);
};

// ─── GLYCÉMIE — LOCAL + SUPABASE ────────────────────────────
export const getGlycemias = () => {
  const stored = localStorage.getItem(KEYS.glycemias);
  if (!stored) return { petitdej: "1,28", dejeuner: "", diner: "" };
  try { return JSON.parse(stored); } catch { return { petitdej: "1,28", dejeuner: "", diner: "" }; }
};

export const saveGlycemias = (glycemias) => {
  localStorage.setItem(KEYS.glycemias, JSON.stringify(glycemias));
};

export const getGlycemiaHistory = () => {
  const stored = localStorage.getItem(KEYS.glycemiaHistory);
  if (!stored) return initializeGlycemiaHistory();
  try { return JSON.parse(stored); } catch { return initializeGlycemiaHistory(); }
};

export const initializeGlycemiaHistory = () => {
  const now = new Date();
  const defaultHistory = [
    { date: new Date(now.getTime() - 86400000).toISOString(), value_g_l: 1.26 },
    { date: new Date(now.getTime() - 36 * 3600000).toISOString(), value_g_l: 1.14 },
    { date: now.toISOString(), value_g_l: 1.18 },
  ];
  saveGlycemiaHistory(defaultHistory);
  return defaultHistory;
};

export const saveGlycemiaHistory = (history) => {
  localStorage.setItem(KEYS.glycemiaHistory, JSON.stringify(history));
};

export const addGlycemia = (value_g_l, isoDate) => {
  const history = getGlycemiaHistory();
  const entry = { date: isoDate || new Date().toISOString(), value_g_l: parseFloat(value_g_l) };
  history.unshift(entry);
  saveGlycemiaHistory(history);
  // Sync Supabase
  supabase.from("glycemie").insert([{
    valeur: parseFloat(value_g_l),
    moment: new Date(isoDate || new Date()).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    saisie_par: "famille",
  }]).then(({ error }) => { if (error) console.warn("Supabase glycémie:", error.message); });
};

export const subscribeToGlycemie = (callback) => {
  return supabase
    .channel("glycemie-channel")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "glycemie" }, (payload) => {
      callback(payload.new);
    })
    .subscribe();
};

// ─── JOURNAL — LOCAL + SUPABASE ─────────────────────────────
export const getNotes = () => {
  const stored = localStorage.getItem(KEYS.notes);
  if (!stored) return initializeNotes();
  try {
    const parsed = JSON.parse(stored);
    return parsed.map((note, index) => ({
      id: note.id || index + 1,
      date: note.date || new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long" }),
      time: note.time || "",
      texte: note.texte || "",
      auteur: note.auteur || "",
      photos: note.photos || [],
    }));
  } catch { return initializeNotes(); }
};

export const initializeNotes = () => {
  saveNotes([]);
  return [];
};

export const saveNotes = (notes) => {
  localStorage.setItem(KEYS.notes, JSON.stringify(notes));
};

export const addNote = (texte, auteur, photos = []) => {
  const now = new Date();
  const date = now.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  const time = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const notes = getNotes();
  const newId = Math.max(...notes.map(n => n.id || 0), 0) + 1;
  notes.unshift({ id: newId, date, time, texte, auteur, photos });
  saveNotes(notes);
  // Sync Supabase (texte uniquement, pas les photos)
  supabase.from("journal").insert([{
    auteur: auteur || "Famille",
    contenu: texte,
    date_note: now.toISOString(),
  }]).then(({ error }) => { if (error) console.warn("Supabase journal:", error.message); });
};

export const updateNote = (id, updates) => {
  const notes = getNotes().map(note => note.id === id ? { ...note, ...updates } : note);
  saveNotes(notes);
};

export const deleteNote = (id) => {
  saveNotes(getNotes().filter(note => note.id !== id));
};

export const subscribeToJournal = (callback) => {
  return supabase
    .channel("journal-channel")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "journal" }, (payload) => {
      callback(payload.new);
    })
    .subscribe();
};

// ─── PHOTO D'ACCUEIL ─────────────────────────────────────────
export const getAccueilPhoto = () => {
  const stored = localStorage.getItem("mimacare_accueil_photo");
  return stored ? JSON.parse(stored) : null;
};

export const saveAccueilPhoto = (photoDataUrl) => {
  if (photoDataUrl) {
    localStorage.setItem("mimacare_accueil_photo", JSON.stringify(photoDataUrl));
  } else {
    localStorage.removeItem("mimacare_accueil_photo");
  }
};

// ─── MÉDICAMENTS COCHÉS ──────────────────────────────────────
export const getMedsChecked = () => {
  const stored = localStorage.getItem(KEYS.medsChecked);
  if (!stored) return null;
  try {
    const { date, checked } = JSON.parse(stored);
    if (date === new Date().toLocaleDateString("fr-FR")) return checked;
    return null;
  } catch { return null; }
};

export const saveMedsChecked = (checked) => {
  localStorage.setItem(KEYS.medsChecked, JSON.stringify({
    date: new Date().toLocaleDateString("fr-FR"),
    checked,
  }));
};

// ─── LECTURE DEPUIS SUPABASE ─────────────────────────────
export const fetchPresencesFromSupabase = async () => {
  const { data, error } = await supabase
    .from("presences")
    .select("*")
    .order("horodatage", { ascending: false })
    .limit(20);
  if (error || !data || data.length === 0) return { ...getPresences(), presentSoir: getPresentTonight() };
  const presenceData = data.filter(r => r.action !== "soir");
  const soirData = data.filter(r => r.action === "soir");
  const derniere = presenceData[0];
  const soir = soirData[0];
  return {
    prenom: derniere?.qui || null,
    heureArrivee: derniere?.action === "arrivee" ? new Date(derniere.horodatage).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : null,
    heureDepart: derniere?.action === "depart" ? new Date(derniere.horodatage).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : null,
    presentSoir: soir?.qui || null,
  };
};

export const fetchGlycemieFromSupabase = async () => {
  const { data, error } = await supabase
    .from("glycemie")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);
  console.log("Fetch glycemie:", data, error);
  if (error || !data || data.length === 0) return getGlycemiaHistory();
  return data.map(row => ({
    date: row.created_at,
    value_g_l: row.valeur,
  }));
};

export const fetchJournalFromSupabase = async () => {
  const { data, error } = await supabase
    .from("journal")
    .select("*")
    .order("date_note", { ascending: false })
    .limit(50);
  if (error || !data || data.length === 0) return getNotes();
  return data.map((row, i) => ({
    id: row.id,
    date: new Date(row.date_note).toLocaleDateString("fr-FR", { day: "numeric", month: "long" }),
    time: new Date(row.date_note).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    texte: row.contenu,
    auteur: row.auteur,
    photos: [],
  }));
};