import React, { useState } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import './Modals.css';

export function HighValueModal({ contract, onConfirm, onCancel }) {
  if (!contract) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <div className="modal-title-row">
          <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d97706' }}>
            <AlertTriangle size={18} /> High-Value Approval Confirmation
          </h3>
        </div>
        <p className="modal-body-text">
          Contract <strong>{contract.title}</strong> ({contract.id}) exceeds <strong>₹50,00,000 (₹50 Lakh)</strong> threshold.
          <br /><br />
          Value: <strong>₹{contract.value.toLocaleString('en-IN')}</strong>
        </p>
        <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: 700,
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease'
            }}
          >
            Confirm Approval
          </button>
        </div>
      </div>
    </div>
  );
}

export function ReasonModal({ type, note, setNote, noteError, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <div className="modal-title-row">
          <h3 className="modal-title">{type} Contract</h3>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
        <p className="modal-body-text">
          A note of at least <strong>10 characters</strong> is strictly required for the procurement audit log.
        </p>
        <textarea
          autoFocus
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={`Enter detailed reason for ${type.toLowerCase()}ing...`}
          className="modal-textarea"
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '6px' }}>
          <span style={{ color: note.trim().length >= 10 ? '#059669' : '#94a3b8' }}>
            {note.trim().length} / 10 characters minimum
          </span>
          {noteError && <span style={{ color: '#dc2626', fontWeight: 600 }}>{noteError}</span>}
        </div>
        <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: 700,
              borderRadius: '6px',
              border: 'none',
              backgroundColor: type === 'Reject' ? '#dc2626' : '#d97706',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            Save & {type}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ShortcutsModal({ onClose }) {
  const shortcuts = [
    { key: "J / ↓", desc: "Select next contract" },
    { key: "K / ↑", desc: "Select previous contract" },
    { key: "A", desc: "Approve current contract" },
    { key: "R", desc: "Reject current contract" },
    { key: "B", desc: "Block current contract" },
    { key: "Ctrl + K", desc: "Focus search box" },
    { key: "Esc", desc: "Dismiss modal" },
    { key: "?", desc: "Help shortcuts" }
  ];
  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <div className="modal-title-row">
          <h3 className="modal-title">Reviewer Shortcuts</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {shortcuts.map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#475569' }}>{s.desc}</span>
              <kbd style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AddContractModal({ onAddContract, onClose }) {
  const CATEGORIES = [
    'Supply Chain & Warehousing',
    'Information Technology',
    'Electrical & Plant Infrastructure',
    'Safety & Facilities',
    'Machinery & Power',
    'Corporate & Legal',
    'Professional Services',
    'Logistics'
  ];

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    title: '',
    supplier: '',
    category: 'Supply Chain & Warehousing',
    priority: 'HIGH',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    sla: 'Delivery within 14 business days of PO issue',
    paymentTerms: 'Net 30 days after dock inspection',
    terminationClause: '30 days mutual written notice',
    compliance: 'ISO:9001 / Statutory Standards',
    // Status :"Open"
  });

  const [lineItems, setLineItems] = useState([
    { id: 'li-1', desc: '', unitRate: '', qty: 1 }
  ]);
  const [formError, setFormError] = useState('');

  // Strict text sanitizer: removes all digits 0-9
  const sanitizeTextOnly = (val) => (val || '').replace(/[0-9]/g, '');

  const blockNumberKeys = (e) => {
    if (/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: `li-${Date.now()}`, desc: '', unitRate: '', qty: 1 }
    ]);
  };

  const removeLineItem = (id) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((it) => it.id !== id));
  };

  const updateLineItem = (id, field, value) => {
    if (field === 'desc') {
      value = sanitizeTextOnly(value);
    }
    if (field === 'qty') {
      const cleanQty = String(value).replace(/\D/g, '');
      if (cleanQty.length > 5) return;
      value = cleanQty;
    }
    if (field === 'unitRate') {
      const cleanRate = String(value).replace(/\D/g, '');
      if (cleanRate.length > 9) return;
      value = cleanRate;
    }

    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const totalCalculatedValue = lineItems.reduce((acc, it) => {
    const rate = Number(it.unitRate) || 0;
    const qty = Number(it.qty) || 0;
    return acc + rate * qty;
  }, 0);

  // Single cleanly defined handleSubmit
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    const cleanTitle = formData.title.trim();
    if (cleanTitle.length < 5 || /\d/.test(cleanTitle)) {
      setFormError('Contract Title must be letters only without numbers (min 5 letters).');
      return;
    }

    const cleanSupplier = formData.supplier.trim();
    if (cleanSupplier.length < 3 || /\d/.test(cleanSupplier)) {
      setFormError('Supplier Name must be letters only without numbers (min 3 letters).');
      return;
    }

    if (formData.dueDate < todayStr) {
      setFormError('Due Date cannot be in the past. Select today or a future date.');
      return;
    }

    for (let i = 0; i < lineItems.length; i++) {
      const it = lineItems[i];
      const cleanDesc = it.desc.trim();
      if (cleanDesc.length < 3 || /\d/.test(cleanDesc)) {
        setFormError(`Line Item ${i + 1} Description must contain only text without numbers.`);
        return;
      }
      if (!it.unitRate || Number(it.unitRate) <= 0) {
        setFormError(`Line Item ${i + 1}: Unit Rate must be greater than 0.`);
        return;
      }
      if (!it.qty || Number(it.qty) <= 0) {
        setFormError(`Line Item ${i + 1}: Quantity must be at least 1.`);
        return;
      }
    }

    onAddContract({
      title: cleanTitle,
      supplier: cleanSupplier,
      category: formData.category,
      priority: formData.priority,
      dueDate: formData.dueDate,
      sla: formData.sla.trim(),
      paymentTerms: formData.paymentTerms.trim(),
      terminationClause: formData.terminationClause.trim(),
      compliance: formData.compliance.trim(),
      // Status :"Open",
      lineItems: lineItems.map((it) => ({
        id: it.id,
        desc: it.desc.trim(),
        unitRate: Number(it.unitRate),
        qty: Number(it.qty)
      })),
      value: totalCalculatedValue
    });

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-dialog modal-wide" style={{ maxWidth: '680px', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-title-row">
          <h3 className="modal-title">+ Add Inbound Supplier Contract</h3>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {formError && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '8px 12px', color: '#dc2626', fontSize: '12px', fontWeight: 600, marginBottom: '10px' }}>
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', paddingRight: '4px' }}>
          {/* General Details */}
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
            General Contract Details
          </div>
          <div>
            <label className="modal-label">Contract Title * (Letters Only)</label>
            <input
              type="text"
              required
              className="modal-input"
              placeholder="e.g. Enterprise Cloud Logistics Retainer"
              value={formData.title}
              onKeyDown={blockNumberKeys}
              onChange={(e) => setFormData({ ...formData, title: sanitizeTextOnly(e.target.value) })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="modal-label">Supplier Name * (Letters Only)</label>
              <input
                type="text"
                required
                className="modal-input"
                placeholder="e.g. Godrej Material Handling"
                value={formData.supplier}
                onKeyDown={blockNumberKeys}
                onChange={(e) => setFormData({ ...formData, supplier: sanitizeTextOnly(e.target.value) })}
              />
            </div>
            <div>
              <label className="modal-label">Category *</label>
              <select
                className="modal-input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="modal-label">Priority</label>
              <select
                className="modal-input"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
            <div>
              <label className="modal-label">Due Date *</label>
              <input
                type="date"
                required
                min={todayStr}
                className="modal-input"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          {/* Key Terms */}
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginTop: '6px' }}>
            Key Contractual Terms
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="modal-label">Service Level Agreement (SLA)</label>
              <input
                type="text"
                className="modal-input"
                value={formData.sla}
                onChange={(e) => setFormData({ ...formData, sla: e.target.value })}
              />
            </div>
            <div>
              <label className="modal-label">Payment Terms</label>
              <input
                type="text"
                className="modal-input"
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="modal-label">Termination Clause</label>
              <input
                type="text"
                className="modal-input"
                value={formData.terminationClause}
                onChange={(e) => setFormData({ ...formData, terminationClause: e.target.value })}
              />
            </div>
            <div>
              <label className="modal-label">Regulatory & Standards Compliance</label>
              <input
                type="text"
                className="modal-input"
                value={formData.compliance}
                onChange={(e) => setFormData({ ...formData, compliance: e.target.value })}
              />
            </div>
          </div>

          {/* Line Items & Deliverables */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginTop: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Line Items & Deliverables
            </span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#2563eb' }}>
              Total: ₹{totalCalculatedValue.toLocaleString('en-IN')} ({(totalCalculatedValue / 100000).toFixed(1)} Lakh)
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {lineItems.map((item, index) => (
              <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 0.8fr 32px', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  required
                  placeholder={`Item ${index + 1} Description (Text only)`}
                  className="modal-input"
                  value={item.desc}
                  onKeyDown={blockNumberKeys}
                  onChange={(e) => updateLineItem(item.id, 'desc', e.target.value)}
                />
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Unit Rate (₹)"
                  className="modal-input"
                  value={item.unitRate}
                  onChange={(e) => updateLineItem(item.id, 'unitRate', e.target.value)}
                />
                <input
                  type="number"
                  min="1"
                  max="99999"
                  required
                  placeholder="Qty"
                  className="modal-input"
                  value={item.qty}
                  onChange={(e) => updateLineItem(item.id, 'qty', e.target.value)}
                />
                {lineItems.length > 1 ? (
                  <button type="button" onClick={() => removeLineItem(item.id)} style={{ border: 'none', background: 'none', color: '#dc2626', cursor: 'pointer', padding: '4px' }}>
                    <Trash2 size={16} />
                  </button>
                ) : <div />}
              </div>
            ))}

            <button
              type="button"
              onClick={addLineItem}
              style={{
                alignSelf: 'flex-start',
                padding: '5px 12px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#2563eb',
                backgroundColor: '#eff6ff',
                border: '1px dashed #bfdbfe',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              + Add Line Item
            </button>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 600, borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#334155', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ padding: '8px 20px', fontSize: '13px', fontWeight: 700, borderRadius: '6px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', cursor: 'pointer' }}
            >
              Add to Queue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EditDeliverablesModal({ contract, onSave, onClose }) {
  const [items, setItems] = useState(
    contract?.lineItems ? contract.lineItems.map((item) => ({ ...item })) : []
  );

  const handleQtyChange = (id, valStr) => {
    if (valStr === '') {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, qty: '' } : item))
      );
      return;
    }

    // Numbers only, strictly max 5 digits (1 to 99999)
    const numericStr = String(valStr).replace(/\D/g, '');
    if (numericStr.length > 5) return;

    const cleanNum = parseInt(numericStr, 10);
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty: isNaN(cleanNum) ? '' : cleanNum } : item))
    );
  };

  const handleCompleteSave = () => {
    const cleanedItems = items.map((it) => ({
      ...it,
      qty: Number(it.qty) || 1
    }));
    onSave(contract.id, cleanedItems);
    onClose();
  };

  const currentTotal = items.reduce(
    (acc, it) => acc + (Number(it.unitRate || 0) * (Number(it.qty) || 0)),
    0
  );

  return (
    <div className="modal-overlay">
      <div className="modal-dialog modal-wide" style={{ maxWidth: '580px' }}>
        <div className="modal-title-row">
          <h3 className="modal-title">Edit Line Items & Deliverables</h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
        <p className="modal-body-text" style={{ margin: '0 0 14px 0' }}>
          Adjust quantities below (Max 5 digits). Audit trail will be updated automatically on save.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                backgroundColor: '#f8fafc',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                gap: '10px'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{item.desc}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  Unit Rate: ₹{Number(item.unitRate).toLocaleString('en-IN')}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>Qty:</span>
                <input
                  type="number"
                  min="1"
                  max="99999"
                  value={item.qty}
                  onChange={(e) => handleQtyChange(item.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (['e', 'E', '+', '-'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  style={{
                    width: '75px',
                    padding: '5px 8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    textAlign: 'center',
                    border: '1px solid #cbd5e1',
                    borderRadius: '5px',
                    outline: 'none'
                  }}
                />
              </div>
              <div style={{ minWidth: '95px', textAlign: 'right', fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
                ₹{(Number(item.unitRate || 0) * (Number(item.qty) || 0)).toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>
        <div
          className="modal-actions"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '16px',
            borderTop: '1px solid #f1f5f9',
            paddingTop: '14px'
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#2563eb' }}>
            New Value: ₹{currentTotal.toLocaleString('en-IN')}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{
                height: '36px',
                padding: '0 16px',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCompleteSave}
              style={{
                height: '36px',
                padding: '0 16px',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              Save & Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}