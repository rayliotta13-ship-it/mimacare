/**
 * Composant de gestion dynamique des médicaments
 */
import { useState } from "react";
import { getMedicines, updateMedicine, deleteMedicine, addMedicine } from "../data/storage";
import { Modal } from "./Modal";
import { G, W, BG, T, T2, BD, RE } from "../utils";

export const MedicinesManager = ({ moment, onSave }) => {
  const [medicines, setMedicines] = useState(() => {
    const meds = getMedicines();
    return meds[moment] || [];
  });
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", role: "", dose: "" });

  const handleOpenModal = (med = null) => {
    if (med) {
      setFormData({ name: med.name, role: med.role, dose: med.dose });
      setEditingId(med.id);
    } else {
      setFormData({ name: "", role: "", dose: "" });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;

    if (editingId) {
      updateMedicine(moment, editingId, formData);
      setMedicines(getMedicines()[moment]);
    } else {
      addMedicine(moment, formData);
      setMedicines(getMedicines()[moment]);
    }

    setShowModal(false);
    setFormData({ name: "", role: "", dose: "" });
    onSave?.();
  };

  const handleDelete = (id) => {
    deleteMedicine(moment, id);
    setMedicines(getMedicines()[moment]);
    onSave?.();
  };

  const toggleEnabled = (id) => {
    const med = medicines.find(m => m.id === id);
    if (med) {
      updateMedicine(moment, id, { enabled: !med.enabled });
      setMedicines(getMedicines()[moment]);
      onSave?.();
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <div style={{ fontSize: "13px", fontWeight: "700", color: T2, textTransform: "uppercase" }}>
          {medicines.length} médicament{medicines.length !== 1 ? "s" : ""}
        </div>
        <button
          onClick={() => handleOpenModal()}
          style={{
            width: "28px",
            height: "28px",
            background: G,
            color: W,
            border: "none",
            borderRadius: "50%",
            fontSize: "16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          +
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {medicines.map(med => (
          <div
            key={med.id}
            style={{
              background: W,
              borderRadius: "12px",
              padding: "12px",
              border: `1px solid ${BD}`,
              opacity: med.enabled === false ? 0.5 : 1
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <button
                onClick={() => toggleEnabled(med.id)}
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "6px",
                  border: `2px solid ${med.enabled !== false ? G : BD}`,
                  background: med.enabled !== false ? G : W,
                  color: W,
                  fontSize: "12px",
                  cursor: "pointer",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {med.enabled !== false && "✓"}
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "14px", fontWeight: "700", color: T }}>{med.name}</div>
                {med.role && <div style={{ fontSize: "12px", color: T2 }}>{med.role}</div>}
                {med.dose && <div style={{ fontSize: "12px", color: G, fontWeight: "600" }}>{med.dose}</div>}
                {med.alert && <div style={{ fontSize: "11px", color: RE, marginTop: "3px" }}>⚠ Important</div>}
              </div>
              <button
                onClick={() => handleOpenModal(med)}
                style={{
                  width: "32px",
                  height: "32px",
                  background: BG,
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  flexShrink: 0
                }}
              >
                ✏️
              </button>
              <button
                onClick={() => handleDelete(med.id)}
                style={{
                  width: "32px",
                  height: "32px",
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: RE,
                  flexShrink: 0
                }}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        title={editingId ? "Modifier un médicament" : "Ajouter un médicament"}
        onClose={() => setShowModal(false)}
        primaryAction={handleSave}
        primaryText={editingId ? "Modifier" : "Ajouter"}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={{ fontSize: "13px", fontWeight: "700", color: T2, display: "block", marginBottom: "6px" }}>
              Nom du médicament
            </label>
            <input
              type="text"
              placeholder="Ex: Azarga"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                width: "100%",
                padding: "10px",
                border: `1px solid ${BD}`,
                borderRadius: "10px",
                fontSize: "15px",
                boxSizing: "border-box",
                outline: "none",
                fontFamily: "inherit"
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: "13px", fontWeight: "700", color: T2, display: "block", marginBottom: "6px" }}>
              Rôle / Indication
            </label>
            <input
              type="text"
              placeholder="Ex: gouttes yeux"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              style={{
                width: "100%",
                padding: "10px",
                border: `1px solid ${BD}`,
                borderRadius: "10px",
                fontSize: "15px",
                boxSizing: "border-box",
                outline: "none",
                fontFamily: "inherit"
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: "13px", fontWeight: "700", color: T2, display: "block", marginBottom: "6px" }}>
              Posologie / Dose
            </label>
            <input
              type="text"
              placeholder="Ex: 1 comprimé"
              value={formData.dose}
              onChange={(e) => setFormData({ ...formData, dose: e.target.value })}
              style={{
                width: "100%",
                padding: "10px",
                border: `1px solid ${BD}`,
                borderRadius: "10px",
                fontSize: "15px",
                boxSizing: "border-box",
                outline: "none",
                fontFamily: "inherit"
              }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
