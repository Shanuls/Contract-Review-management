// import React, { useState } from 'react';
// import { X, AlertTriangle, AlertCircle } from 'lucide-react';
// import './Modals.css';

// export function HighValueModal({ contract, onConfirm, onCancel }) {
//   if (!contract) return null;
//   return (
//     <div className="modal-overlay">
//       <div className="modal-dialog">
//         <div className="modal-title-row">
//           <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d97706' }}>
//             <AlertTriangle size={18} /> High-Value Approval Confirmation
//           </h3>
//         </div>
//         <p className="modal-body-text">
//           Contract <strong>{contract.title}</strong> ({contract.id}) exceeds <strong>₹50,00,000 (₹50 Lakh)</strong> threshold.
//           <br /><br />
//           Value: <strong>₹{contract.value.toLocaleString('en-IN')}</strong>
//         </p>
//         <div className="modal-actions">
//           <button onClick={onCancel} className="btn-secondary">Cancel</button>
//           <button onClick={onConfirm} className="btn-primary-action">Confirm Approval</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export function ReasonModal({ type, note, setNote, noteError, onConfirm, onCancel }) {
//   return (
//     <div className="modal-overlay">
//       <div className="modal-dialog">
//         <div className="modal-title-row">
//           <h3 className="modal-title">{type} Contract</h3>
//           <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
//         </div>
//         <p className="modal-body-text">
//           A note of at least <strong>10 characters</strong> is strictly required for the procurement audit log.
//         </p>
//         <textarea
//           autoFocus
//           rows={4}
//           value={note}
//           onChange={(e) => setNote(e.target.value)}
//           placeholder={`Enter detailed reason for ${type.toLowerCase()}ing...`}
//           className="modal-textarea"
//         />
//         <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '6px' }}>
//           <span style={{ color: note.trim().length >= 10 ? '#059669' : '#94a3b8' }}>
//             {note.trim().length} / 10 characters minimum
//           </span>
//           {noteError && <span style={{ color: '#dc2626', fontWeight: 600 }}>{noteError}</span>}
//         </div>
//         <div className="modal-actions">
//           <button onClick={onCancel} className="btn-secondary">Cancel</button>
//           <button onClick={onConfirm} className={type === 'Reject' ? 'btn-danger' : 'btn-primary-action'}>
//             Save & {type}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export function ShortcutsModal({ onClose }) {
//   const shortcuts = [
//     { key: "J / ↓", desc: "Select next contract" },
//     { key: "K / ↑", desc: "Select previous contract" },
//     { key: "A", desc: "Approve current contract" },
//     { key: "R", desc: "Reject current contract" },
//     { key: "B", desc: "Block current contract" },
//     { key: "/", desc: "Focus search" },
//     { key: "Esc", desc: "Dismiss modal" },
//     { key: "?", desc: "Help shortcuts" }
//   ];

//   return (
//     <div className="modal-overlay">
//       <div className="modal-dialog">
//         <div className="modal-title-row">
//           <h3 className="modal-title">Reviewer Shortcuts</h3>
//           <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
//         </div>
//         <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
//           {shortcuts.map((s, i) => (
//             <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
//               <span style={{ color: '#475569' }}>{s.desc}</span>
//               <kbd style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>{s.key}</kbd>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// export function AddContractModal({ onAddContract, onClose }) {
//   const [formData, setFormData] = useState({
//     title: '',
//     supplier: '',
//     category: 'Supply Chain & Logistics',
//     value: '',
//     priority: 'HIGH',
//     dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]
//   });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!formData.title || !formData.supplier || !formData.value) return;
//     onAddContract({
//       title: formData.title,
//       supplier: formData.supplier,
//       category: formData.category,
//       value: parseFloat(formData.value) || 100000,
//       priority: formData.priority,
//       dueDate: formData.dueDate
//     });
//     onClose();
//   };

//   return (
//     <div className="modal-overlay">
//       <div className="modal-dialog">
//         <div className="modal-title-row">
//           <h3 className="modal-title">+ Add Inbound Contract</h3>
//           <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
//         </div>
//         <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
//           <div>
//             <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Title</label>
//             <input
//               type="text"
//               required
//               className="modal-textarea"
//               style={{ padding: '8px' }}
//               value={formData.title}
//               onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//             />
//           </div>
//           <div>
//             <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Supplier</label>
//             <input
//               type="text"
//               required
//               className="modal-textarea"
//               style={{ padding: '8px' }}
//               value={formData.supplier}
//               onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
//             />
//           </div>
//           <div>
//             <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Value (₹)</label>
//             <input
//               type="number"
//               required
//               className="modal-textarea"
//               style={{ padding: '8px' }}
//               value={formData.value}
//               onChange={(e) => setFormData({ ...formData, value: e.target.value })}
//             />
//           </div>
//           <div className="modal-actions">
//             <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
//             <button type="submit" className="btn-primary-action">Add Contract</button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }



import React, { useState } from 'react';
import { X, AlertTriangle, AlertCircle, Plus, Trash2 } from 'lucide-react';
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
        <div className="modal-actions">
          <button onClick={onCancel} className="btn-secondary">Cancel</button>
          <button onClick={onConfirm} className="btn-primary-action">Confirm Approval</button>
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
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
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
        <div className="modal-actions">
          <button onClick={onCancel} className="btn-secondary">Cancel</button>
          <button onClick={onConfirm} className={type === 'Reject' ? 'btn-danger' : 'btn-primary-action'}>
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
    { key: "/", desc: "Focus search" },
    { key: "Esc", desc: "Dismiss modal" },
    { key: "?", desc: "Help shortcuts" }
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <div className="modal-title-row">
          <h3 className="modal-title">Reviewer Shortcuts</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
        </div>
        <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {shortcuts.map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#475569' }}>{s.desc}</span>
              <kbd style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>{s.key}</kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AddContractModal({ onAddContract, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    supplier: '',
    category: 'Supply Chain & Warehousing',
    priority: 'HIGH',
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    sla: 'Delivery within 14 business days of PO issue',
    paymentTerms: 'Net 30 days after dock inspection',
    terminationClause: '30 days mutual written notice',
    compliance: 'ISO:9001 / Statutory Standards'
  });

  const [lineItems, setLineItems] = useState([
    { id: 'li-new-1', desc: '', unitRate: 0, qty: 1 }
  ]);

  const addLineItem = () => {
    setLineItems([...lineItems, { id: `li-new-${Date.now()}`, desc: '', unitRate: 0, qty: 1 }]);
  };

  const removeLineItem = (id) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateLineItem = (id, field, val) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        return { ...item, [field]: val };
      }
      return item;
    }));
  };

  // Calculate live contract total value
  const totalCalculatedValue = lineItems.reduce((acc, item) => acc + ((Number(item.unitRate) || 0) * (Number(item.qty) || 0)), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.supplier) return;

    onAddContract({
      title: formData.title,
      supplier: formData.supplier,
      category: formData.category,
      priority: formData.priority,
      dueDate: formData.dueDate,
      sla: formData.sla,
      paymentTerms: formData.paymentTerms,
      terminationClause: formData.terminationClause,
      compliance: formData.compliance,
      lineItems: lineItems.map(it => ({
        id: it.id,
        desc: it.desc || formData.title,
        unitRate: Number(it.unitRate) || 0,
        qty: Number(it.qty) || 1
      })),
      value: totalCalculatedValue > 0 ? totalCalculatedValue : 100000
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-dialog modal-wide">
        <div className="modal-title-row">
          <h3 className="modal-title">+ Add Inbound Supplier Contract</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-scrollable-form">
          {/* General Info */}
          <div className="form-section-title">General Contract Details</div>
          <div>
            <label className="modal-label">Contract Title / Project Description *</label>
            <input
              type="text"
              required
              className="modal-input"
              placeholder="e.g. High-Density Logistics Pallets & Automated Racks"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-grid-2">
            <div>
              <label className="modal-label">Supplier Name *</label>
              <input
                type="text"
                required
                className="modal-input"
                placeholder="e.g. Godrej Material Handling Ltd"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              />
            </div>
            <div>
              <label className="modal-label">Category</label>
              <input
                type="text"
                className="modal-input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div>
              <label className="modal-label">Priority</label>
              <select
                className="modal-input"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="HIGH">HIGH (Urgent)</option>
                <option value="MEDIUM">MEDIUM (Standard)</option>
                <option value="LOW">LOW (Routine)</option>
              </select>
            </div>
            <div>
              <label className="modal-label">Due Date *</label>
              <input
                type="date"
                required
                className="modal-input"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          {/* Key Terms */}
          <div className="form-section-title">Key Contractual Terms</div>
          <div className="form-grid-2">
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

          <div className="form-grid-2">
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
          <div className="form-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Line Items & Deliverables</span>
            <span style={{ color: '#2563eb', fontWeight: 700 }}>
              Calculated Total: ₹{totalCalculatedValue.toLocaleString('en-IN')}
            </span>
          </div>

          <div>
            {lineItems.map((item, index) => (
              <div key={item.id} className="line-item-row">
                <input
                  type="text"
                  required
                  placeholder={`Item ${index + 1} Description`}
                  className="modal-input"
                  value={item.desc}
                  onChange={(e) => updateLineItem(item.id, 'desc', e.target.value)}
                />
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="Rate (₹)"
                  className="modal-input"
                  value={item.unitRate || ''}
                  onChange={(e) => updateLineItem(item.id, 'unitRate', parseFloat(e.target.value) || 0)}
                />
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Qty"
                  className="modal-input"
                  value={item.qty}
                  onChange={(e) => updateLineItem(item.id, 'qty', parseInt(e.target.value) || 1)}
                />
                {lineItems.length > 1 ? (
                  <button type="button" onClick={() => removeLineItem(item.id)} className="btn-remove-row">
                    <Trash2 size={15} />
                  </button>
                ) : <div />}
              </div>
            ))}

            <button type="button" onClick={addLineItem} className="btn-add-line" style={{ marginTop: '6px' }}>
              + Add Line Item
            </button>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary-action">Add to Queue</button>
          </div>
        </form>
      </div>
    </div>
  );
}