
import React from 'react';
import { Play, Check, X, ShieldAlert, RotateCcw, AlertCircle, Clock, ShieldCheck } from 'lucide-react';
import './DetailPanel.css';

export default function DetailPanel({
  contract,
  onStartReview,
  onTriggerApprove,
  onOpenReasonModal,
  onResumeReview,
  onUpdateLineItemQty
}) {
  if (!contract) {
    return (
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <p style={{ color: '#64748b', fontSize: '13px' }}>Select a contract to review. Tip: press J to start.</p>
      </main>
    );
  }

  const formatINR = (val) => `₹${Number(val).toLocaleString('en-IN')}`;
  const formatLakhs = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lakh`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const getDueDays = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dueDate);
    target.setHours(0, 0, 0, 0);
    return Math.round((target - today) / (1000 * 60 * 60 * 24));
  };

  const diffDays = getDueDays(contract.dueDate);
  const isOverdue = diffDays < 0;

  return (
    <main className="detail-container">
      {/* Header Info & Action */}
      <div className="detail-card detail-header-card">
        <div>
          <div className="detail-title-group">
            <span className="detail-id-badge">{contract.id}</span>
            <span style={{ color: '#94a3b8' }}>•</span>
            <h2 className="detail-main-title">{contract.title}</h2>
          </div>
          <div className="detail-meta-line">{contract.supplier} • {contract.category}</div>
        </div>

        <div className="detail-actions-cluster">
          {contract.status === 'New' && (
            <button onClick={() => onStartReview(contract.id)} className="btn-approve">
              <Play size={14} /> Start review
            </button>
          )}

          {contract.status === 'In Review' && (
            <>
              <button onClick={() => onTriggerApprove(contract)} className="btn-approve">
                <Check size={14} /> Approve (A)
              </button>
              <button onClick={() => onOpenReasonModal('Reject')} className="btn-reject">
                <X size={14} /> Reject (R)
              </button>
              <button onClick={() => onOpenReasonModal('Block')} className="btn-block">
                <ShieldAlert size={14} /> Block (B)
              </button>
            </>
          )}

          {contract.status === 'Blocked' && (
            <button onClick={() => onResumeReview(contract.id)} className="btn-approve" style={{ backgroundColor: '#d97706' }}>
              <RotateCcw size={14} /> Resume review
            </button>
          )}

          {(contract.status === 'Approved' || contract.status === 'Rejected') && (
            <span style={{ fontWeight: 700, fontSize: '12px', color: contract.status === 'Approved' ? '#059669' : '#dc2626' }}>
              Contract {contract.status}
            </span>
          )}
        </div>
      </div>

      {/* 4 Stat Boxes */}
      <div className="stat-cards-grid">
        <div className="stat-box">
          <div className="stat-label">Total Value</div>
          <div className="stat-val-main">{formatINR(contract.value)}</div>
          <div className="stat-val-sub">{formatLakhs(contract.value)}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Status</div>
          <div className="stat-val-main" style={{ fontSize: '14px', marginTop: '8px' }}>{contract.status}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Priority</div>
          <div className="stat-val-main" style={{ fontSize: '14px', marginTop: '8px' }}>↑ {contract.priority}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Due Condition</div>
          <div className="stat-val-main" style={{ fontSize: '13px', marginTop: '8px', color: isOverdue ? '#dc2626' : '#1e293b' }}>
            {isOverdue ? `Overdue by ${Math.abs(diffDays)} days` : `Due in ${diffDays} days`}
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="detail-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
          <strong style={{ fontSize: '12px', textTransform: 'uppercase', color: '#475569' }}>Key Contractual Terms</strong>
          <span style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} /> Verified by Procurement Ops
          </span>
        </div>
        <div className="terms-grid">
          <div>
            <div className="terms-field-label">Service Level Agreement (SLA)</div>
            <div className="terms-field-val">{contract.sla}</div>
          </div>
          <div>
            <div className="terms-field-label">Payment Terms</div>
            <div className="terms-field-val">{contract.paymentTerms}</div>
          </div>
          <div>
            <div className="terms-field-label">Termination Clause</div>
            <div className="terms-field-val">{contract.terminationClause}</div>
          </div>
          <div>
            <div className="terms-field-label">Regulatory & Standards Compliance</div>
            <div className="terms-field-val">{contract.compliance}</div>
          </div>
        </div>
      </div>

      {/* Line items with editable QTY */}
      <div className="detail-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
          <strong style={{ fontSize: '12px', textTransform: 'uppercase', color: '#475569' }}>Line Items & Deliverables</strong>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Editable Quantity recalculates total</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Item Description</th>
              <th style={{ textAlign: 'right' }}>Unit Rate</th>
              <th style={{ textAlign: 'center' }}>Quantity (Edit)</th>
              <th style={{ textAlign: 'right' }}>Line Total</th>
            </tr>
          </thead>
          <tbody>
            {contract.lineItems?.map((li) => (
              <tr key={li.id}>
                <td style={{ fontWeight: 600 }}>{li.desc}</td>
                <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{formatINR(li.unitRate)}</td>
                <td style={{ textAlign: 'center' }}>
                  <input
                    type="number"
                    min="1"
                    value={li.qty}
                    onChange={(e) => onUpdateLineItemQty(contract.id, li.id, parseInt(e.target.value) || 0)}
                    className="qty-input"
                  />
                </td>
                <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'monospace' }}>
                  {formatINR(li.unitRate * li.qty)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Audit Trail & Activity Log */}
      <div className="detail-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', marginBottom: '14px' }}>
          <strong style={{ fontSize: '12px', textTransform: 'uppercase', color: '#475569' }}>
            Audit Trail & Activity Log
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            Total entries: {contract.audit?.length || 0}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {contract.audit?.map((aud) => (
            <div key={aud.id} className="audit-entry" style={{ alignItems: 'flex-start' }}>
              <div className="audit-dot" style={{ marginTop: '6px' }}></div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                  <strong style={{ color: '#0f172a', fontSize: '12px' }}>{aud.action}</strong>
                  {/* Exact Date & Time badge */}
                  <span style={{ 
                    color: '#475569', 
                    fontSize: '11px', 
                    fontFamily: 'monospace', 
                    backgroundColor: '#f1f5f9', 
                    padding: '2px 8px', 
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontWeight: 600
                  }}>
                    🕒 {aud.timestamp}
                  </span>
                </div>
                
                <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>
                  By: <strong style={{ color: '#334155' }}>{aud.by}</strong>
                </div>

                {aud.note && (
                  <div style={{ marginTop: '6px', fontStyle: 'italic', backgroundColor: '#f8fafc', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#334155', fontSize: '11px' }}>
                    "{aud.note}"
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}