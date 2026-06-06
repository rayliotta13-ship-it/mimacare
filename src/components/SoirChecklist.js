import { useState, useEffect } from "react";
import { G, W, BG, T, T2, BD } from "../utils";

const ITEMS = [
  { id: "lumières", section: "Avant le repas", label: "Lumières détection mouvement" },
  { id: "eau", section: "Avant le repas", label: "5 bouteilles d'eau dans les toilettes" },
  { id: "glycemie", section: "Avant le repas", label: "Glycémie avant repas contrôlée" },
  { id: "stagid", section: "Avant le repas", label: "Si glycémie basse → pas de Stagid" },
  { id: "medicaments", section: "Avant le repas", label: "Médicaments du soir pris" },
  { id: "repas", section: "Avant le repas", label: "État du repas noté" },
  { id: "tisane", section: "Coucher", label: "Tisane préparée 30 min avant" },
  { id: "table", section: "Coucher", label: "Table de sécurité positionnée" },
  { id: "azarga", section: "Coucher", label: "Gouttes Azarga appliquées" },
  { id: "porte", section: "Coucher", label: "Porte fermée à clé" },
  { id: "bouteille", section: "Table de nuit", label: "Petite bouteille d'eau" },
  { id: "mouchoirs", section: "Table de nuit", label: "Mouchoirs" },
  { id: "telephone", section: "Table de nuit", label: "Téléphone" },
  { id: "lecteur", section: "Table de nuit", label: "Lecteur de glycémie" },
];

const SECTIONS = ["Avant le repas", "Coucher", "Table de nuit"];

const getTodayKey = () => `mimacare_soir_${new Date().toLocaleDateString("fr-FR")}`;

export const SoirChecklist = () => {
  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem(getTodayKey())) || {}; } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem(getTodayKey(), JSON.stringify(checked));
  }, [checked]);

  const toggle = (id) => setChecked(p => ({ ...p, [id]: !p[id] }));

  const resetAll = () => {
    if (window.confirm("Remettre toute la checklist à zéro ?")) setChecked({});
  };

  const total = ITEMS.length;
  const done = ITEMS.filter(i => checked[i.id]).length;

  return (
    <div style={{ padding: "14px 14px 80px" }}>
      {/* Progression */}
      <div style={{ background: W, borderRadius: "16px", padding: "14px", marginBottom: "14px", border: `1px solid ${BD}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ fontSize: "13px", fontWeight: "700", color: T2 }}>Progression ce soir</span>
          <span style={{ fontSize: "13px", fontWeight: "700", color: G }}>{done}/{total}</span>
        </div>
        <div style={{ height: "6px", background: BG, borderRadius: "3px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(done / total) * 100}%`, background: G, borderRadius: "3px", transition: "width 0.4s" }} />
        </div>
        {done === total && (
          <div style={{ marginTop: "10px", color: G, fontWeight: "700", fontSize: "14px" }}>✅ Tout est fait pour ce soir !</div>
        )}
      </div>

      {/* Sections */}
      {SECTIONS.map(section => (
        <div key={section} style={{ marginBottom: "12px" }}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: T2, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px", paddingLeft: "4px" }}>
            {section}
          </div>
          <div style={{ background: W, borderRadius: "16px", overflow: "hidden", border: `1px solid ${BD}` }}>
            {ITEMS.filter(i => i.section === section).map((item, idx, arr) => (
              <div
                key={item.id}
                onClick={() => toggle(item.id)}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "13px 14px",
                  borderBottom: idx < arr.length - 1 ? `1px solid ${BD}` : "none",
                  cursor: "pointer",
                  background: checked[item.id] ? "#FAFFFE" : W,
                }}
              >
                <div style={{
                  width: "24px", height: "24px", borderRadius: "6px", flexShrink: 0,
                  background: checked[item.id] ? G : W,
                  border: `2px solid ${checked[item.id] ? G : BD}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {checked[item.id] && <span style={{ color: W, fontSize: "13px", fontWeight: "900" }}>✓</span>}
                </div>
                <span style={{
                  fontSize: "15px", color: checked[item.id] ? T2 : T,
                  textDecoration: checked[item.id] ? "line-through" : "none",
                  flex: 1,
                }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Reset */}
      <button onClick={resetAll} style={{
        width: "100%", padding: "14px", background: W, color: T2,
        border: `1px solid ${BD}`, borderRadius: "14px",
        fontSize: "14px", fontWeight: "700", cursor: "pointer", marginTop: "4px"
      }}>
        Remettre à zéro
      </button>
    </div>
  );
};