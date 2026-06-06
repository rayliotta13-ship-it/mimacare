import { useState, useRef, useEffect } from "react";
import { PresenceManager } from "./components/PresenceManager";
import { MedicinesManager } from "./components/MedicinesManager";
import { Modal } from "./components/Modal";
import * as storage from "./data/storage";
import { G, GL, GM, W, BG, T, T2, BD, RE, isFeminineName } from "./utils";
import { SoirChecklist } from "./components/SoirChecklist";

const MSGS = [
  "Tout est à jour aujourd'hui.",
  "Mima a passé une belle journée.",
  "Merci à toute la famille pour sa présence.",
  "Les médicaments et la glycémie sont renseignés.",
];

const TABS = [
  { id: "accueil", emoji: "🏠", label: "Accueil" },
  { id: "glycemie", emoji: "💧", label: "Glycémie" },
  { id: "journal", emoji: "📝", label: "Journal" },
  { id: "medicaments", emoji: "💊", label: "Médicaments" },
  { id: "presence", emoji: "👤", label: "Présence" },
  { id: "soir", emoji: "🌙", label: "Soir" },
];

const TAB_TITLES = {
  accueil: "Tableau de bord familial",
  glycemie: "Glycémie",
  journal: "Journal",
  medicaments: "Médicaments",
  presence: "Présence",
  soir: "Procédure du soir",
};

const AppHeader = ({ onBell, title }) => (
  <div style={{ background: W, borderBottom: `1px solid ${BD}`, flexShrink: 0, padding: "6px 16px 11px" }}>

    {/* Logo centré — cloche en absolu à droite */}
    <div style={{ position: "relative", display: "flex", justifyContent: "center", marginBottom: "5px" }}>
      <img
        src={process.env.PUBLIC_URL + '/mimacare-logo.png'}
        alt="MimaCare"
        style={{ height: "96px", width: "auto", objectFit: "contain", display: "block" }}
      />
     
    </div>

    {/* Titre principal */}
    <div style={{ fontFamily: "system-ui, -apple-system, 'SF Pro Display', 'Segoe UI', sans-serif", fontSize: "15px", fontWeight: "600", color: T, letterSpacing: "-0.3px", marginBottom: "2px" }}>
      {title}
    </div>

    {/* Date */}
    <div style={{ fontFamily: "system-ui, -apple-system, 'SF Pro Text', 'Segoe UI', sans-serif", fontSize: "11px", color: T2, textTransform: "capitalize", letterSpacing: "0px" }}>
      {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
    </div>

  </div>
);

export default function MimaCare() {
  const [activeTab, setActiveTab] = useState("accueil");
  const [present, setPresent] = useState(() => storage.getPresences());
  const [presentSoir, setPresentSoir] = useState(() => storage.getPresentTonight());
  const [medicines, setMedicines] = useState(() => storage.getMedicines());
  const [meds, setMeds] = useState(() => {
    const savedChecked = storage.getMedsChecked();
    return Object.fromEntries(
      Object.entries(medicines).map(([m, list]) => [
        m,
        list.map(x => ({ ...x, checked: savedChecked?.[m]?.[x.id] ?? false })),
      ])
    );
  });
  const [activeMoment, setActiveMoment] = useState("matin");
  const [journalNotes, setJournalNotes] = useState(() => storage.getNotes());
  const [isJournalModalOpen, setJournalModalOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState({ id: null, texte: "", auteur: "", photos: [] });
  const [msg] = useState(MSGS[Math.floor(Math.random() * MSGS.length)]);
  const notePhotoInputRef = useRef(null);
  const [glyHistory, setGlyHistory] = useState(() => storage.getGlycemiaHistory());
  const [isGlyModalOpen, setGlyModalOpen] = useState(false);
  const [glyInput, setGlyInput] = useState("");
  const [glyTime, setGlyTime] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  });
  const [accueilPhoto, setAccueilPhoto] = useState(() => storage.getAccueilPhoto());

useEffect(() => {
  storage.fetchPresencesFromSupabase().then(data => {
  if (data.presentSoir) setPresentSoir(data.presentSoir);
  setPresent({ prenom: data.prenom, heureArrivee: data.heureArrivee, heureDepart: data.heureDepart });
});
  storage.fetchGlycemieFromSupabase().then(data => setGlyHistory([...data]));
  storage.fetchJournalFromSupabase().then(setJournalNotes);
}, []);


// ── TEMPS RÉEL SUPABASE ──────────────────────────────────

  useEffect(() => {
  const sub = storage.subscribeToGlycemie(() => {
    setTimeout(() => {
      storage.fetchGlycemieFromSupabase().then(setGlyHistory);
    }, 1000);
  });
  return () => sub.unsubscribe();
}, []);

  useEffect(() => {
    const sub = storage.subscribeToJournal((newRow) => {
      setJournalNotes(storage.getNotes());
    });
    return () => sub.unsubscribe();
  }, []);

useEffect(() => {
  const sub = storage.subscribeToPresences((payload) => {
    if (payload?.action === "soir") {
      setTimeout(() => {
        storage.fetchPresencesFromSupabase().then(data => {
          if (data.presentSoir) setPresentSoir(data.presentSoir);
        });
      }, 1000);
      return;
    }
    setTimeout(() => {
      storage.fetchPresencesFromSupabase().then(data => {
        setPresent({ prenom: data.prenom, heureArrivee: data.heureArrivee, heureDepart: data.heureDepart });
      });
    }, 1000);
  });
  return () => sub.unsubscribe();
}, []);

useEffect(() => {
  const interval = setInterval(() => {
    storage.fetchPresencesFromSupabase().then(data => {
      setPresent({ prenom: data.prenom, heureArrivee: data.heureArrivee, heureDepart: data.heureDepart });
      if (data.presentSoir) setPresentSoir(data.presentSoir);
    });
    storage.fetchGlycemieFromSupabase().then(setGlyHistory);
    storage.fetchJournalFromSupabase().then(data => setJournalNotes([...data]));
  }, 30000);
  return () => clearInterval(interval);
}, []);


  const localDatetimeToISOString = (localDatetime) => {
    const [date, time] = (localDatetime || "").split("T");
    if (!date || !time) return new Date().toISOString();
    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);
    return new Date(year, month - 1, day, hour, minute).toISOString();
  };

  const toggleMed = (moment, id) => {
    setMeds(p => {
      const updated = { ...p, [moment]: p[moment].map(x => x.id === id ? { ...x, checked: !x.checked } : x) };
      storage.saveMedsChecked(Object.fromEntries(Object.entries(updated).map(([m, list]) => [m, Object.fromEntries(list.map(x => [x.id, x.checked]))])));
      return updated;
    });
  };

  const validerTout = (m) => {
    setMeds(p => {
      const updated = { ...p, [m]: p[m].map(x => ({ ...x, checked: true })) };
      storage.saveMedsChecked(Object.fromEntries(Object.entries(updated).map(([m, list]) => [m, Object.fromEntries(list.map(x => [x.id, x.checked]))])));
      return updated;
    });
  };

  const checkedMatin = meds.matin.filter(m => m.checked && m.enabled !== false).length;
  const checkedMidi = meds.midi.filter(m => m.checked && m.enabled !== false).length;
  const checkedSoir = meds.soir.filter(m => m.checked && m.enabled !== false).length;
  const totalDone = [
    checkedMatin === meds.matin.filter(m => m.enabled !== false).length,
    checkedMidi === meds.midi.filter(m => m.enabled !== false).length,
    checkedSoir === meds.soir.filter(m => m.enabled !== false).length
  ].filter(Boolean).length;

  const openJournalModal = (note = null) => {
    if (note) {
      setNoteDraft({ ...note, photos: note.photos || [] });
    } else {
      setNoteDraft({ id: null, texte: "", auteur: "", photos: [] });
    }
    setJournalModalOpen(true);
  };

  const closeJournalModal = () => {
    setJournalModalOpen(false);
    setNoteDraft({ id: null, texte: "", auteur: "", photos: [] });
  };

  const handleJournalPhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const pictures = await Promise.all(files.map(file => new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve({ id: Date.now() + Math.random(), src: reader.result, name: file.name });
      reader.readAsDataURL(file);
    })));
    setNoteDraft(d => ({ ...d, photos: [...(d.photos || []), ...pictures] }));
    e.target.value = "";
  };

  const saveJournalNote = () => {
    if (!noteDraft.texte.trim()) return;
    try {
      if (noteDraft.id) {
        storage.updateNote(noteDraft.id, {
          texte: noteDraft.texte.trim(),
          auteur: noteDraft.auteur.trim(),
          photos: noteDraft.photos || [],
        });
      } else {
        storage.addNote(noteDraft.texte.trim(), noteDraft.auteur.trim(), noteDraft.photos || []);
      }
      setJournalNotes(storage.getNotes());
      closeJournalModal();
    } catch {
      alert("Espace de stockage insuffisant. Supprimez des photos pour libérer de l'espace.");
    }
  };

  const deleteJournalNote = (id) => {
    if (!window.confirm("Supprimer cette note ?")) return;
    storage.deleteNote(id);
    setJournalNotes(storage.getNotes());
  };

  const removeJournalPhoto = (photoId) => {
    setNoteDraft(d => ({ ...d, photos: (d.photos || []).filter(photo => photo.id !== photoId) }));
  };

  const handleAccueilPhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const photoDataUrl = reader.result;
      try {
        storage.saveAccueilPhoto(photoDataUrl);
        setAccueilPhoto(photoDataUrl);
      } catch {
        alert("Espace de stockage insuffisant. Supprimez des photos pour libérer de l'espace.");
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };


  const Card = ({ children, style }) => (
    <div style={{ background: W, borderRadius: "16px", padding: "16px", marginBottom: "10px", border: `1px solid ${BD}`, ...style }}>{children}</div>
  );

  const Lbl = ({ children }) => (
    <div style={{ fontSize: "11px", fontWeight: "700", color: T2, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>{children}</div>
  );

  const MomRow = ({ label, checked, total, last }) => {
    const all = checked === total && total > 0;
    const some = checked > 0 && !all;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 0", borderBottom: last ? "none" : `1px solid ${BD}` }}>
        <span style={{ fontSize: "16px" }}>{all ? "✅" : some ? "⏳" : "⏰"}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "14px", fontWeight: "600", color: T }}>{label}</div>
          <div style={{ fontSize: "11px", color: all ? G : T2 }}>{all ? "Complété ✓" : some ? `${checked}/${total} pris` : "En attente"}</div>
        </div>
        <span style={{ fontSize: "12px", fontWeight: "700", color: all ? G : T2 }}>{checked}/{total}</span>
      </div>
    );
  };

  const formatGL = (g) => {
    if (g === null || g === undefined || g === "") return "—";
    const value = typeof g === "number" ? g : parseFloat(g.toString().replace(",", "."));
    if (Number.isNaN(value)) return "—";
    return value.toFixed(2).replace(".", ",");
  };

  const formatDate = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch {
      return "";
    }
  };

  const formatTime = (iso) => {
    try {
      return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }).replace(":", "h");
    } catch {
      return "";
    }
  };

  const latestPhotoNote = journalNotes.find(note => note.photos && note.photos.length > 0);
  const latestPhotoSrc = latestPhotoNote?.photos?.[latestPhotoNote.photos.length - 1]?.src;

  const getPresenceStatusLabel = (presence) => {
    if (!presence?.prenom) return "Aucun";
    const feminine = isFeminineName(presence.prenom);
    if (presence.heureDepart) {
      return feminine ? "Partie" : "Parti";
    }
    return feminine ? "Présente" : "Présent";
  };

  const renderAccueil = () => (
    <div style={{ padding: "8px 14px 0" }}>
      {/* Présence + Ce soir côte à côte */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <div style={{ flex: 1, background: W, borderRadius: "16px", padding: "12px", border: `1px solid ${BD}` }}>
          <Lbl>Présence</Lbl>
          <div style={{ fontSize: "16px", fontWeight: "600", color: present.heureDepart ? T2 : G }}>{present.prenom || "Aucune personne"}</div>
          <div style={{ fontSize: "11px", color: T2, lineHeight: "1.6" }}>
            {present.heureArrivee && <div>Arrivée : {present.heureArrivee}</div>}
            {present.heureDepart && <div>Départ : {present.heureDepart}</div>}
          </div>
          <div style={{ marginTop: "6px", display: "inline-flex", alignItems: "center", gap: "4px", background: present.heureDepart ? BG : GL, borderRadius: "12px", padding: "3px 8px" }}>
            <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: present.heureDepart ? T2 : G }} />
            <span style={{ fontSize: "11px", fontWeight: "700", color: present.heureDepart ? T2 : G }}>{getPresenceStatusLabel(present)}</span>
          </div>
        </div>
        <div style={{ flex: 1, background: presentSoir ? W : GL, borderRadius: "16px", padding: "12px", border: `1px solid ${presentSoir ? BD : GM}` }}>
          <Lbl>Ce soir 🌙</Lbl>
          <div style={{ fontSize: "16px", fontWeight: "600", color: presentSoir ? G : T2 }}>{presentSoir || "À définir"}</div>
          {presentSoir && <div style={{ fontSize: "11px", color: T2, marginTop: "2px" }}>prévu ce soir</div>}
        </div>
      </div>

      {/* Moments de vie */}
      <Card style={{ padding: "0", overflow: "hidden" }}>
        <div style={{ position: "relative" }}>
          {accueilPhoto ? (
            <img src={accueilPhoto} alt="Moments de vie" style={{ width: "100%", height: "200px", objectFit: "cover" }} />
          ) : latestPhotoSrc ? (
            <img src={latestPhotoSrc} alt="Moments de vie" style={{ width: "100%", height: "200px", objectFit: "cover" }} />
          ) : (
            <img src={process.env.PUBLIC_URL + '/mima-default.jpg.jpg'} alt="Moments de vie" style={{ width: "100%", height: "200px", objectFit: "cover" }} />
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%)" }} />
          <div style={{ position: "absolute", bottom: "10px", left: "12px", right: "12px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ color: W, fontSize: "13px", fontWeight: "700" }}>📸 Moments de vie</div>
              {latestPhotoNote && (
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "11px" }}>{`Ajouté par ${latestPhotoNote.auteur || "Famille"} · ${latestPhotoNote.date}`}</div>
              )}
            </div>
            <label style={{ background: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.5)", borderRadius: "20px", padding: "5px 10px", color: W, fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
              + Photo
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleAccueilPhotoUpload} />
            </label>
          </div>
        </div>
      </Card>

      {/* Dernière glycémie */}
      <Card style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "18px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: T2, marginBottom: "0" }}>Dernière glycémie</div>
          <span style={{ fontSize: "12px", color: T2 }}>{formatDate(glyHistory[0]?.date)}</span>
        </div>
        {glyHistory.length > 0 ? (
          <>
            <div style={{ fontSize: "32px", fontWeight: "700", color: G }}>{formatGL(glyHistory[0].value_g_l)} g/L</div>
            <div style={{ fontSize: "14px", color: T2 }}>{formatDate(glyHistory[0].date)} - {formatTime(glyHistory[0].date)}</div>
          </>
        ) : (
          <div style={{ fontSize: "14px", color: T2 }}>Aucune mesure enregistrée.</div>
        )}
      </Card>

      {/* Médicaments */}
      <Card style={{ padding: "12px 14px" }}>
        <Lbl>Médicaments aujourd'hui</Lbl>
        <MomRow label="Matin" checked={checkedMatin} total={meds.matin.length} />
        <MomRow label="Midi / 16h" checked={checkedMidi} total={meds.midi.length} />
        <MomRow label="Soir" checked={checkedSoir} total={meds.soir.length} last />
        <div style={{ marginTop: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
            <span style={{ fontSize: "11px", color: T2 }}>Progression</span>
            <span style={{ fontSize: "11px", fontWeight: "700", color: G }}>{totalDone}/3</span>
          </div>
          <div style={{ height: "5px", background: BG, borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(totalDone / 3) * 100}%`, background: G, borderRadius: "3px", transition: "width 0.5s" }} />
          </div>
        </div>
      </Card>

      {/* Message du jour */}
      <div style={{ background: G, borderRadius: "18px", padding: "16px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "24px" }}>💚</span>
        <div style={{ fontSize: "15px", fontWeight: "700", color: W, lineHeight: "1.4" }}>{msg}</div>
      </div>
    </div>
  );

  // ── JOURNAL ─────────────────────────────────────────────
  const renderJournal = () => (
    <div style={{ padding: "14px 14px 0" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
        <button onClick={() => openJournalModal()}
          style={{ width: "34px", height: "34px", background: G, color: W, border: "none", borderRadius: "50%", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          +
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
        {journalNotes.length === 0 ? (
          <div style={{ background: W, borderRadius: "18px", padding: "20px", textAlign: "center", color: T2 }}>Aucune note pour l'instant. Ajoutez une première note.</div>
        ) : journalNotes.map(note => (
          <div key={note.id} style={{ background: W, borderRadius: "16px", padding: "14px", border: `1px solid ${BD}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "12px" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "700", color: G }}>{note.date} {note.time || ""}</div>
                {note.auteur && <div style={{ fontSize: "11px", color: T2, marginTop: "2px" }}>{note.auteur}</div>}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => openJournalModal(note)}
                  style={{ width: "36px", height: "36px", background: GL, border: "none", borderRadius: "12px", cursor: "pointer", fontSize: "16px" }}>
                  ✏️
                </button>
                <button onClick={() => deleteJournalNote(note.id)}
                  style={{ width: "36px", height: "36px", background: "rgba(239, 68, 68, 0.1)", border: "none", borderRadius: "12px", cursor: "pointer", color: RE, fontSize: "16px" }}>
                  🗑️
                </button>
              </div>
            </div>
            <div style={{ fontSize: "14px", color: T, lineHeight: "1.6", whiteSpace: "pre-wrap", marginBottom: note.photos?.length ? "12px" : "0" }}>{note.texte}</div>
            {note.photos?.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px" }}>
                {note.photos.map(photo => (
                  <img key={photo.id} src={photo.src} alt={photo.name} style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "16px" }} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal
        isOpen={isJournalModalOpen}
        title={noteDraft.id ? "Modifier la note" : "Ajouter une note"}
        onClose={closeJournalModal}
        primaryAction={saveJournalNote}
        primaryText={noteDraft.id ? "Modifier" : "Enregistrer"}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input
            type="text"
            value={noteDraft.auteur}
            onChange={(e) => setNoteDraft(d => ({ ...d, auteur: e.target.value }))}
            placeholder="Auteur (optionnel)"
            style={{ width: "100%", padding: "11px 14px", border: `1px solid ${BD}`, borderRadius: "12px", fontSize: "15px", boxSizing: "border-box", outline: "none", fontFamily: "inherit" }}
          />
          <textarea
            value={noteDraft.texte}
            onChange={(e) => setNoteDraft(d => ({ ...d, texte: e.target.value }))}
            placeholder="Écris une note importante sur Mima..."
            style={{ width: "100%", minHeight: "120px", border: `1px solid ${BD}`, borderRadius: "14px", padding: "12px", fontSize: "15px", color: T, resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              onClick={() => notePhotoInputRef.current?.click()}
              style={{ flex: 1, padding: "12px 14px", background: GL, color: G, border: `1px solid ${G}`, borderRadius: "14px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}
            >
              + Ajouter des photos
            </button>
            <span style={{ fontSize: "11px", color: T2 }}>{noteDraft.photos?.length || 0} photo(s)</span>
          </div>
          <input
            ref={notePhotoInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={handleJournalPhotoUpload}
          />
          {noteDraft.photos?.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px" }}>
              {noteDraft.photos.map(photo => (
                <div key={photo.id} style={{ position: "relative" }}>
                  <img src={photo.src} alt={photo.name} style={{ width: "100%", height: "90px", objectFit: "cover", borderRadius: "14px" }} />
                  <button
                    type="button"
                    onClick={() => removeJournalPhoto(photo.id)}
                    style={{ position: "absolute", top: "8px", right: "8px", width: "28px", height: "28px", borderRadius: "10px", background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer", fontSize: "14px" }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );

  // ── GLYCÉMIE ─────────────────────────────────────────────
  const renderGlycemie = () => {
    const history = glyHistory || [];
    const last = history[0];

    const openAddGly = () => {
      setGlyInput("");
      const now = new Date();
      setGlyTime(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
      setGlyModalOpen(true);
    };

    const saveGlyEntry = () => {
      const raw = (glyInput || "").toString().replace(",", ".").trim();
      const parsed = parseFloat(raw);
      if (isNaN(parsed)) return alert("Valeur invalide");
      const value_g_l = parsed;
      const iso = glyTime ? localDatetimeToISOString(glyTime) : new Date().toISOString();
      storage.addGlycemia(value_g_l, iso);
      setGlyHistory(storage.getGlycemiaHistory());
      setGlyModalOpen(false);
    };

    return (
      <div style={{ position: "relative", padding: "12px 14px 90px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <Card>
          <div style={{ fontSize: "11px", fontWeight: "600", color: T2, marginBottom: "8px" }}>Dernière glycémie</div>
          {last ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ fontSize: "34px", fontWeight: "700", color: G }}>{formatGL(last.value_g_l)} g/L</div>
              <div style={{ fontSize: "14px", color: T2 }}>{formatDate(last.date)} - {formatTime(last.date)}</div>
            </div>
          ) : (
            <div style={{ color: T2 }}>Aucune mesure enregistrée.</div>
          )}
        </Card>

        <Card>
          <Lbl>Historique récent</Lbl>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {history.length === 0 ? <div style={{ color: T2 }}>Aucune mesure.</div> : history.map((h, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ color: T2 }}>{formatDate(h.date)} - {formatTime(h.date)}</div>
                <div style={{ fontWeight: "800", color: G }}>{formatGL(h.value_g_l)} g/L</div>
              </div>
            ))}
          </div>
        </Card>

        <button onClick={openAddGly} style={{ position: "absolute", right: "14px", bottom: "22px", width: "56px", height: "56px", borderRadius: "50%", background: G, color: W, border: "none", fontSize: "26px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 16px 28px rgba(45, 122, 79, 0.22)", cursor: "pointer" }} aria-label="Ajouter une glycémie">🧮</button>

        <Modal isOpen={isGlyModalOpen} title="Ajouter une glycémie" onClose={() => setGlyModalOpen(false)} primaryAction={saveGlyEntry} primaryText="Enregistrer">
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input type="text" value={glyInput} onChange={e => setGlyInput(e.target.value)} placeholder="Valeur (ex: 1,18)" style={{ padding: "12px", borderRadius: "10px", border: `1px solid ${BD}`, fontSize: "16px" }} />
            <input type="datetime-local" value={glyTime} onChange={e => setGlyTime(e.target.value)} style={{ padding: "10px", borderRadius: "10px", border: `1px solid ${BD}` }} />
          </div>
        </Modal>
      </div>
    );
  };

  // ── MÉDICAMENTS ──────────────────────────────────────────
  const renderMedicaments = () => {
    const currentMeds = meds[activeMoment];
    const enabledMeds = currentMeds.filter(m => m.enabled !== false);

    return (
      <div style={{ padding: "14px 14px 0" }}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          {["matin","midi","soir"].map(m => (
            <button key={m} onClick={() => setActiveMoment(m)}
              style={{ flex: 1, padding: "8px 10px", borderRadius: "12px", background: activeMoment === m ? G : W, color: activeMoment === m ? W : T, border: "none", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ background: W, borderRadius: "18px", overflow: "hidden", marginBottom: "12px" }}>
          <div style={{ padding: "12px 14px", borderBottom: `1px solid ${BD}`, display: "flex", alignItems: "center", gap: "8px", background: GL }}>
            <span style={{ fontSize: "15px" }}>{activeMoment === "matin" ? "☀️" : activeMoment === "midi" ? "🌤️" : "🌙"}</span>
            <span style={{ fontSize: "14px", fontWeight: "700", color: G }}>
              {activeMoment === "matin" ? "Matin" : activeMoment === "midi" ? "Midi / 16h" : "Soir"}
            </span>
            <span style={{ marginLeft: "auto", fontSize: "13px", fontWeight: "700", color: G }}>
              {enabledMeds.filter(m => m.checked).length}/{enabledMeds.length}
            </span>
          </div>
          {currentMeds.map((med, i, arr) => (
            med.enabled !== false && (
              <div key={med.id} onClick={() => toggleMed(activeMoment, med.id)}
                style={{ display: "flex", alignItems: "center", gap: "12px", padding: "13px 14px", borderBottom: i < arr.length - 1 ? `1px solid ${BD}` : "none", cursor: "pointer", background: med.checked ? "#FAFFFE" : W }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "15px", fontWeight: "600", color: med.checked ? T2 : T, textDecoration: med.checked ? "line-through" : "none" }}>{med.name}</div>
                  <div style={{ fontSize: "11px", color: med.alert ? RE : T2, marginTop: "1px" }}>{med.role} · {med.dose}</div>
                </div>
                <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: med.checked ? G : W, border: `2px solid ${med.checked ? G : med.alert ? RE : BD}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {med.checked && <span style={{ color: W, fontSize: "13px", fontWeight: "900" }}>✓</span>}
                </div>
              </div>
            )
          ))}
        </div>

        <button onClick={() => validerTout(activeMoment)}
          style={{ width: "100%", background: G, color: W, border: "none", borderRadius: "14px", padding: "14px", fontSize: "15px", fontWeight: "700", cursor: "pointer", marginBottom: "20px" }}>
          ✓ Tout valider
        </button>

        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "13px", fontWeight: "700", color: T2, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "12px" }}>
            Gérer les médicaments
          </div>
          <MedicinesManager moment={activeMoment} onSave={() => {
            const freshMeds = storage.getMedicines();
            const savedChecked = storage.getMedsChecked();
            setMedicines(freshMeds);
            setMeds(Object.fromEntries(Object.entries(freshMeds).map(([m, list]) => [
              m,
              list.map(x => ({ ...x, checked: savedChecked?.[m]?.[x.id] ?? false })),
            ])));
          }} />
        </div>
      </div>
    );
  };

  const screens = {
    accueil: renderAccueil,
    glycemie: renderGlycemie,
    journal: renderJournal,
    medicaments: renderMedicaments,
    presence: () => <PresenceManager present={present} setPresent={setPresent} presentSoir={presentSoir} setPresentSoir={setPresentSoir} />,
    soir: () => <SoirChecklist />,
  };

  return (
    <div style={{ fontFamily: "-apple-system, 'Helvetica Neue', sans-serif", background: BG, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppHeader onBell={() => setActiveTab("journal")} title={TAB_TITLES[activeTab]} />

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {screens[activeTab]?.()}
      </div>

      <div style={{ background: W, display: "flex", padding: "8px 0 20px", borderTop: `1px solid ${BD}`, flexShrink: 0 }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", border: "none", background: "none", cursor: "pointer", padding: "8px 1px", minWidth: "60px" }}>
            <span style={{ fontSize: "22px", opacity: activeTab === tab.id ? 1 : 0.25 }}>{tab.emoji}</span>
            <span style={{ fontSize: "10px", fontWeight: "700", color: activeTab === tab.id ? G : T2 }}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
 );
}