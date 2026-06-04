/**
 * Composant de gestion des présences avec modal d'ajout
 */
import { useState } from "react";
import { getPassagesHistory, savePresences, getContacts, addContact, savePresentTonight, addPassage, updatePassageDepart, addEveningStay } from "../data/storage";
import { Modal } from "./Modal";
import { G, GL, GM, W, BG, T, T2, BD, isFeminineName } from "../utils";

export const PresenceManager = ({ present, setPresent, presentSoir, setPresentSoir }) => {
  const [contacts, setContacts] = useState(() => getContacts());
  const [passages, setPassages] = useState(() => getPassagesHistory());

  const getPresenceStatusLabel = (presence) => {
    if (!presence?.prenom) return "Aucun";
    const feminine = isFeminineName(presence.prenom);
    if (presence.heureDepart) {
      return feminine ? "Partie" : "Parti";
    }
    return feminine ? "Présente" : "Présent";
  };
  
  const [showPresenceModal, setShowPresenceModal] = useState(false);
  const [showEveningModal, setShowEveningModal] = useState(false);
  const [showAddPersonModal, setShowAddPersonModal] = useState(false);
  
  const [newPersonName, setNewPersonName] = useState("");

  const addRegisteredPerson = (prenom) => {
    const normalizedName = prenom.trim();
    if (!normalizedName) return;
    const exists = contacts.some(c => c.name.toLowerCase() === normalizedName.toLowerCase());
    if (!exists) {
      addContact(normalizedName);
      setContacts(getContacts());
    }
  };

  const handleArrival = (prenom) => {
    const now = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const newPresence = { prenom, heureArrivee: now, heureDepart: null };
    setPresent(newPresence);
    savePresences(newPresence);
    addRegisteredPerson(prenom);
    addPassage(prenom, now);
    setPassages(getPassagesHistory());
    setShowPresenceModal(false);
  };

  const handleAddPerson = () => {
    const name = newPersonName.trim();
    if (!name) return;
    handleArrival(name);
    setNewPersonName("");
    setShowAddPersonModal(false);
  };

  const handleSetEveningPerson = (prenom) => {
    const normalizedName = prenom.trim();
    if (!normalizedName) return;
    addRegisteredPerson(normalizedName);
    setPresentSoir(normalizedName);
    savePresentTonight(normalizedName);
    addEveningStay(normalizedName);
    setShowEveningModal(false);
  };

  // simplified: contact management is available in the modals opened from the cards

  const handleDeparture = () => {
    if (!present?.prenom || present.heureDepart) return;
    const now = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const updated = { ...present, heureDepart: now };
    setPresent(updated);
    savePresences(updated);

    const history = getPassagesHistory();
    const reverseIndex = [...history].reverse().findIndex(p => p.depart === null && p.prenom === present.prenom);
    if (reverseIndex !== -1) {
      const index = history.length - 1 - reverseIndex;
      updatePassageDepart(index, now);
      setPassages(getPassagesHistory());
    }
  };

  return (
    <div style={{ padding: "14px 14px 0" }}>
      {/* Présence actuelle */}
      <div style={{ background: W, borderRadius: "18px", padding: "16px", marginBottom: "10px", border: `1px solid ${BD}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
          <div style={{
            width: "48px",
            height: "48px",
            background: present.heureDepart ? BG : GL,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22px",
            flexShrink: 0
          }}>
            👤
          </div>
          <div>
            <div style={{ fontSize: "13px", color: T2 }}>Présence actuelle</div>
            <div style={{ fontSize: "20px", fontWeight: "800", color: present.heureDepart ? T2 : G }}>
              {present.prenom || "Aucune personne"}
            </div>
            <div style={{ fontSize: "12px", color: T2 }}>
              {present.heureDepart
                ? `${getPresenceStatusLabel(present)} depuis ${present.heureDepart}`
                : present.heureArrivee
                  ? `${getPresenceStatusLabel(present)} depuis ${present.heureArrivee}`
                  : "Aucune arrivée enregistrée"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={() => setShowPresenceModal(true)}
            style={{
              flex: 1,
              background: G,
              color: W,
              border: "none",
              borderRadius: "12px",
              padding: "10px 13px",
              fontSize: "15px",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            Présent
          </button>
          <button
            onClick={handleDeparture}
            disabled={!present?.prenom || present.heureDepart}
            style={{
              flex: 1,
              background: present?.prenom && !present.heureDepart ? W : BG,
              color: present?.prenom && !present.heureDepart ? T : T2,
              border: `1.5px solid ${BD}`,
              borderRadius: "12px",
              padding: "10px 13px",
              fontSize: "15px",
              fontWeight: "700",
              cursor: present?.prenom && !present.heureDepart ? "pointer" : "not-allowed"
            }}
          >
            {isFeminineName(present?.prenom) ? "Partie" : "Parti"}
          </button>
        </div>
      </div>

      {/* Cette nuit avec Mima */}
      <div style={{
        background: GL,
        borderRadius: "18px",
        padding: "14px",
        marginBottom: "14px",
        border: `1px solid ${GM}`
      }}>
        <div style={{ fontSize: "15px", fontWeight: "800", color: G, marginBottom: "10px" }}>
          🌙 Cette nuit avec Mima
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ fontSize: "17px", fontWeight: "800", color: presentSoir ? G : T2 }}>
            {presentSoir || "À définir"}
          </div>
          <button
            onClick={() => setShowEveningModal(true)}
            style={{
              padding: "12px 14px",
              borderRadius: "16px",
              background: W,
              color: T,
              border: `1px solid ${BD}`,
              fontSize: "14px",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            Changer
          </button>
        </div>
        {presentSoir && (
          <div style={{ fontSize: "13px", color: G, fontWeight: "600", marginTop: "10px" }}>
            ✓ {presentSoir} dort chez Mima ce soir
          </div>
        )}
      </div>

      {/* Dernier passage (résumé) */}
      <div style={{ background: W, borderRadius: "18px", padding: "16px", marginBottom: "20px", border: `1px solid ${BD}` }}>
        <div style={{ fontSize: "13px", fontWeight: "700", color: T2, textTransform: "uppercase", marginBottom: "12px" }}>
          Dernier passage
        </div>
        {(passages.slice(-3).reverse()).map((p, i, arr) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 0", borderBottom: i < arr.length - 1 ? `1px solid ${BD}` : "none" }}>
            <div style={{ width: "34px", height: "34px", background: GL, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: G, fontSize: "13px", fontWeight: "800", flexShrink: 0 }}>{p.prenom[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "15px", fontWeight: "700", color: T }}>{p.prenom}</div>
              <div style={{ fontSize: "12px", color: T2 }}>{p.date} · {p.arrivee}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Removed duplicate "Derniers passages" - kept single summarized "Dernier passage" above */}

      {/* Modal: Choisir qui arrive */}
      <Modal
        isOpen={showPresenceModal}
        title="Qui est présent ?"
        onClose={() => setShowPresenceModal(false)}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {contacts.map(c => (
            <button
              key={c.id}
              onClick={() => handleArrival(c.name)}
              style={{
                padding: "12px 14px",
                background: BG,
                color: T,
                border: `1px solid ${BD}`,
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: "700",
                cursor: "pointer",
                textAlign: "left"
              }}
            >
              {c.name}
            </button>
          ))}
          <button
            onClick={() => setShowAddPersonModal(true)}
            style={{
              padding: "12px 14px",
              background: GL,
              color: G,
              border: `1px solid ${GM}`,
              borderRadius: "10px",
              fontSize: "15px",
              fontWeight: "700",
              cursor: "pointer",
              textAlign: "left"
            }}
          >
            + Ajouter une nouvelle personne
          </button>
        </div>
      </Modal>

      {/* Modal: Choisir ce soir */}
      <Modal
        isOpen={showEveningModal}
        title="Cette nuit"
        onClose={() => setShowEveningModal(false)}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {contacts.map(c => (
            <button
              key={c.id}
              onClick={() => handleSetEveningPerson(c.name)}
              style={{
                padding: "12px 14px",
                background: BG,
                color: T,
                border: `1px solid ${BD}`,
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: "700",
                cursor: "pointer",
                textAlign: "left"
              }}
            >
              {c.name}
            </button>
          ))}
          <button
            onClick={() => setShowAddPersonModal(true)}
            style={{
              padding: "12px 14px",
              background: GL,
              color: G,
              border: `1px solid ${GM}`,
              borderRadius: "10px",
              fontSize: "15px",
              fontWeight: "700",
              cursor: "pointer",
              textAlign: "left"
            }}
          >
            + Ajouter une nouvelle personne
          </button>
        </div>
      </Modal>

      {/* Modal: Ajouter une personne */}
      <Modal
        isOpen={showAddPersonModal}
        title="Ajouter une personne"
        onClose={() => setShowAddPersonModal(false)}
        primaryAction={handleAddPerson}
        primaryText="Valider"
      >
        <input
          type="text"
          placeholder="Nom ou prénom"
          value={newPersonName}
          onChange={(e) => setNewPersonName(e.target.value)}
          style={{
            width: "100%",
            padding: "11px 14px",
            border: `1px solid ${BD}`,
            borderRadius: "10px",
            fontSize: "15px",
            boxSizing: "border-box",
            outline: "none",
            fontFamily: "inherit"
          }}
        />
      </Modal>

      {/* Contact form removed: contact management stays in the modals opened from cards */}
    </div>
  );
};
