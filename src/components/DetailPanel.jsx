import React, { useState } from 'react';
import { Check, X, ShieldAlert, Play, CheckCircle2, ShieldOff, ChevronDown } from 'lucide-react';
import { EditDeliverablesModal } from './Modals';
import { useTheme } from '../context/ThemeContext';

export default function DetailPanel({
  contract,
  startedReviewIds = [],
  setStartedReviewIds,
  onStartReview,
  onTriggerApprove,
  onOpenReasonModal,
  onResumeReview,
  onUpdateLineItemQty,
  onSaveAllDeliverables,
  isLoading = false,
  hasError = false,
  currentUserRole = 'Reviewer'
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false); // <-- Accordion State (default closed/open)
  const { activeTheme } = useTheme();
  const isDark = activeTheme === 'dark';

  const theme = {
    bg: isDark ? '#0b0f19' : '#ffffff',
    cardBg: isDark ? '#111827' : '#ffffff',
    subtleBg: isDark ? '#1e293b' : '#f8fafc',
    border: isDark ? '#1e293b' : '#e2e8f0',
    borderLight: isDark ? '#1e293b' : '#f1f5f9',
    textMain: isDark ? '#94a3b8' : '#0f172a',
    textMuted: isDark ? '#64748b' : '#64748b',
    auditRowBg: isDark ? '#0f172a' : '#f8fafc'
  };

  const priorityColors = {
    HIGH: {
      bg: isDark ? '#451a1a' : '#fef2f2',
      color: isDark ? '#f87171' : '#b91c1c',
      border: isDark ? '#7f1d1d' : '#fecaca'
    },
    MEDIUM: {
      bg: isDark ? '#422006' : '#fffbeb',
      color: isDark ? '#fb923c' : '#b45309',
      border: isDark ? '#78350f' : '#fde68a'
    },
    LOW: {
      bg: isDark ? '#172554' : '#eff6ff',
      color: isDark ? '#60a5fa' : '#1d4ed8',
      border: isDark ? '#1e3a8a' : '#bfdbfe'
    }
  };

  const statusColors = {
    'New': { bg: isDark ? '#1e293b' : '#eff6ff', color: isDark ? '#60a5fa' : '#1d4ed8', border: isDark ? '#334155' : '#bfdbfe' },
    'Open': { bg: isDark ? '#1e293b' : '#eff6ff', color: isDark ? '#60a5fa' : '#1d4ed8', border: isDark ? '#334155' : '#bfdbfe' },
    'Approved': { bg: isDark ? '#064e3b' : '#ecfdf5', color: isDark ? '#34d399' : '#047857', border: isDark ? '#065f46' : '#a7f3d0' },
    'Blocked': { bg: isDark ? '#451a1a' : '#fef2f2', color: isDark ? '#f87171' : '#b91c1c', border: isDark ? '#7f1d1d' : '#fecaca' },
    'Rejected': { bg: isDark ? '#4c0519' : '#fff1f2', color: isDark ? '#fb7185' : '#be123c', border: isDark ? '#881337' : '#fecdd3' }
  };

  if (isLoading) {
    return (
      <div
        style={{
          flex: 1,
          backgroundColor: theme.bg,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div style={{ height: '24px', width: '40%', backgroundColor: isDark ? '#1f1f1f' : '#e2e8f0', borderRadius: '4px' }} />
        <div style={{ height: '14px', width: '25%', backgroundColor: isDark ? '#141414' : '#f1f5f9', borderRadius: '4px' }} />
        <div style={{ height: '90px', width: '100%', backgroundColor: theme.cardBg, borderRadius: '8px', border: `1px solid ${theme.border}` }} />
        <div style={{ height: '140px', width: '100%', backgroundColor: theme.cardBg, borderRadius: '8px', border: `1px solid ${theme.border}` }} />
      </div>
    );
  }

  if (hasError) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.textMuted,
          fontSize: '13px',
          backgroundColor: theme.bg,
          padding: '24px',
          textAlign: 'center'
        }}
      >
        <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: '4px' }}>
          Contract details unavailable
        </div>
        <div>We couldn't load the queue. Your decisions are saved. Try again.</div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.textMuted,
          fontSize: '13px',
          backgroundColor: theme.bg,
          padding: '24px',
          textAlign: 'center'
        }}
      >
        All caught up. No contracts are waiting for review.
      </div>
    );
  }

  const isClosed = contract.status === 'Approved' || contract.status === 'Rejected';
  const isBlocked = contract.status === 'Blocked';
  const isReviewActive = startedReviewIds.includes(contract.id);
  const isHighTier = contract.value > 7500000;
  const isPermittedToApprove = !isHighTier || currentUserRole === 'Senior Reviewer';

  const handleStartReviewClick = () => {
    setStartedReviewIds((prev) => [...prev, contract.id]);
    onStartReview(contract.id);
  };

  const sStyle = statusColors[contract.status] || { bg: isDark ? '#1e293b' : '#f1f5f9', color: isDark ? '#cbd5e1' : '#475569', border: isDark ? '#334155' : '#e2e8f0' };
  const pStyle = priorityColors[contract.priority] || priorityColors.LOW;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDateObj = new Date(contract.dueDate);
  dueDateObj.setHours(0, 0, 0, 0);
  const diffDays = Math.round((dueDateObj - today) / (1000 * 60 * 60 * 24));
  const isOverdue = diffDays < 0;

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: theme.bg,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '16px 24px',
        boxSizing: 'border-box',
        minWidth: 0
      }}
    >
      {isHighTier && !isPermittedToApprove && (
        <div
          style={{
            backgroundColor: isDark ? '#422006' : '#fffbeb',
            border: `1px solid ${isDark ? '#78350f' : '#fde68a'}`,
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '11px',
            color: isDark ? '#fb923c' : '#b45309',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '10px'
          }}
        >
          <ShieldOff size={14} />
          <span><strong>Permission Notice:</strong> Only senior reviewers can approve contracts above ₹ 75 lakh.</span>
        </div>
      )}

      {/* 1. Header Section */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          borderBottom: `1px solid ${theme.borderLight}`,
          paddingBottom: '14px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                backgroundColor: isDark ? '#172554' : '#eff6ff',
                color: '#3b82f6',
                fontSize: '12px',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '6px',
                border: `1px solid ${isDark ? '#1e3a8a' : '#bfdbfe'}`,
                whiteSpace: 'nowrap'
              }}
            >
              {contract.id}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {!isClosed && !isBlocked && !isReviewActive && (
              <button
                type="button"
                onClick={handleStartReviewClick}
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '7px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <Play size={14} /> Start Review
              </button>
            )}
            {isBlocked && (
              <button
                type="button"
                onClick={() => {
                  setStartedReviewIds((prev) => [...prev, contract.id]);
                  onResumeReview(contract.id);
                }}
                style={{
                  backgroundColor: isDark ? '#172554' : '#eff6ff',
                  color: '#3b82f6',
                  border: `1px solid ${isDark ? '#1e3a8a' : '#bfdbfe'}`,
                  borderRadius: '6px',
                  padding: '7px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Resume Review
              </button>
            )}
            {!isClosed && isReviewActive && !isBlocked && (
              <>
                <button
                  type="button"
                  onClick={() => onTriggerApprove(contract)}
                  disabled={!isPermittedToApprove}
                  title={!isPermittedToApprove ? "Only senior reviewers can approve contracts above ₹ 75 lakh." : ""}
                  style={{
                    backgroundColor: isPermittedToApprove ? '#2563eb' : (isDark ? '#334155' : '#94a3b8'),
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '7px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: isPermittedToApprove ? 'pointer' : 'not-allowed',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Check size={14} /> Approve (A)
                </button>
                <button
                  type="button"
                  onClick={() => onOpenReasonModal('Reject')}
                  style={{
                    backgroundColor: theme.cardBg,
                    color: '#f87171',
                    border: `1px solid ${isDark ? '#7f1d1d' : '#fecaca'}`,
                    borderRadius: '6px',
                    padding: '7px 10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <X size={14} /> Reject (R)
                </button>
                <button
                  type="button"
                  onClick={() => onOpenReasonModal('Block')}
                  style={{
                    backgroundColor: theme.cardBg,
                    color: '#fb923c',
                    border: `1px solid ${isDark ? '#78350f' : '#fde68a'}`,
                    borderRadius: '6px',
                    padding: '7px 10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <ShieldAlert size={14} /> Block (B)
                </button>
              </>
            )}
            {isClosed && (
              <span
                style={{
                  backgroundColor: sStyle.bg,
                  color: sStyle.color,
                  border: `1px solid ${sStyle.border}`,
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap'
                }}
              >
                {contract.status}
              </span>
            )}
          </div>
        </div>

        <div>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 800,
              color: theme.textMain,
              margin: '2px 0 0',
              lineHeight: '1.35',
              wordBreak: 'break-word'
            }}
          >
            {contract.title}
          </h2>
        </div>

        <div style={{ fontSize: '12px', color: theme.textMuted }}>
          {contract.supplier} • {contract.category}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: theme.subtleBg,
              border: `1px solid ${theme.border}`,
              padding: '3px 8px',
              borderRadius: '6px'
            }}
          >
            <span style={{ fontWeight: 800, color: theme.textMain, fontSize: '12px' }}>
              ₹ {contract.value.toLocaleString('en-IN')}
            </span>
            <span style={{ color: '#3b82f6', fontSize: '11px', fontWeight: 700 }}>
              ({(contract.value / 100000).toFixed(1)} Lakh)
            </span>
          </div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              backgroundColor: pStyle.bg,
              color: pStyle.color,
              border: `1px solid ${pStyle.border}`,
              padding: '3px 8px',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '11px'
            }}
          >
            {contract.priority}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: isOverdue ? (isDark ? '#451a1a' : '#fef2f2') : theme.subtleBg,
              color: isOverdue ? '#f87171' : theme.textMuted,
              border: isOverdue ? `1px solid ${isDark ? '#7f1d1d' : '#fecaca'}` : `1px solid ${theme.border}`,
              padding: '3px 8px',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '11px'
            }}
          >
            {isOverdue 
              ? `Overdue by ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'day' : 'days'}`
              : `Due in ${diffDays} ${diffDays === 1 ? 'day' : 'days'}`}
          </span>
        </div>
      </div>

      {/* 2. Key Contractual Terms */}
      <div style={{ marginTop: '14px', border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '14px 18px', backgroundColor: theme.cardBg, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 700, color: theme.textMain, margin: 0, letterSpacing: '0.02em' }}>
            KEY CONTRACTUAL TERMS
          </h3>
          <span style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <CheckCircle2 size={13} /> Verified by Procurement Ops
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 28px', minWidth: 0 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '11px', color: theme.textMuted }}>Service Level Agreement (SLA)</div>
            <div style={{ fontSize: '12px', color: theme.textMain, fontWeight: 600, marginTop: '2px', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{contract.sla}</div>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '11px', color: theme.textMuted }}>Payment Terms</div>
            <div style={{ fontSize: '12px', color: theme.textMain, fontWeight: 600, marginTop: '2px', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{contract.paymentTerms}</div>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '11px', color: theme.textMuted }}>Termination Clause</div>
            <div style={{ fontSize: '12px', color: theme.textMain, fontWeight: 600, marginTop: '2px', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{contract.terminationClause}</div>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '11px', color: theme.textMuted }}>Regulatory & Standards Compliance</div>
            <div style={{ fontSize: '12px', color: theme.textMain, fontWeight: 600, marginTop: '2px', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{contract.compliance}</div>
          </div>
        </div>
      </div>

      {/* 3. Line Items & Deliverables */}
      <div style={{ marginTop: '14px', border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '14px 18px', backgroundColor: theme.cardBg, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 700, color: theme.textMain, margin: 0 }}>LINE ITEMS & DELIVERABLES</h3>
          
          {!isClosed && isReviewActive && !isBlocked && (
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '6px',
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.subtleBg,
                color: '#3b82f6',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Edit Deliverables
            </button>
          )}
        </div>
        <div style={{ borderTop: `1px solid ${theme.borderLight}`, paddingTop: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) 1fr 1fr 1fr', fontSize: '11px', fontWeight: 700, color: theme.textMuted, paddingBottom: '6px' }}>
            <span>ITEM DESCRIPTION</span>
            <span style={{ textAlign: 'right' }}>UNIT RATE</span>
            <span style={{ textAlign: 'center' }}>QUANTITY</span>
            <span style={{ textAlign: 'right' }}>LINE TOTAL</span>
          </div>
          {contract.lineItems?.map((item) => (
            <div key={item.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) 1fr 1fr 1fr', alignItems: 'center', padding: '7px 0', borderTop: `1px solid ${theme.borderLight}`, fontSize: '12px' }}>
              <span style={{ color: theme.textMain, fontWeight: 600, wordBreak: 'break-word', overflowWrap: 'anywhere', paddingRight: '8px' }}>{item.desc}</span>
              <span style={{ textAlign: 'right', color: theme.textMuted }}>₹ {item.unitRate.toLocaleString('en-IN')}</span>
              <span style={{ textAlign: 'center', fontWeight: 700, color: theme.textMain }}>
                {item.qty}
              </span>
              <span style={{ textAlign: 'right', fontWeight: 700, color: theme.textMain }}>
                ₹ {(item.unitRate * item.qty).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Smooth Accordion: Audit Trail & Activity Log */}
      <div
        style={{
          marginTop: '14px',
          border: `1px solid ${theme.border}`,
          borderRadius: '8px',
          backgroundColor: theme.cardBg,
          marginBottom: '14px',
          overflow: 'hidden',
          transition: 'border-color 0.2s ease'
        }}
      >
        {/* Accordion Clickable Header */}
        <button
          type="button"
          onClick={() => setIsAuditOpen((prev) => !prev)}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 18px',
            backgroundColor: theme.cardBg,
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 700, color: theme.textMain, margin: 0 }}>
              AUDIT TRAIL & ACTIVITY LOG
            </h3>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#3b82f6',
                backgroundColor: isDark ? '#172554' : '#eff6ff',
                padding: '2px 7px',
                borderRadius: '10px',
                border: `1px solid ${isDark ? '#1e3a8a' : '#bfdbfe'}`
              }}
            >
              {contract.audit?.length || 0}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: theme.textMuted }}>
              {isAuditOpen ? 'Hide History' : 'View History'}
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: isAuditOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                color: theme.textMuted
              }}
            >
              <ChevronDown size={16} />
            </div>
          </div>
        </button>

        {/* Smooth CSS Grid Expanding Wrapper */}
        <div
          style={{
            display: 'grid',
            gridTemplateRows: isAuditOpen ? '1fr' : '0fr',
            transition: 'grid-template-rows 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <div style={{ overflow: 'hidden' }}>
            <div
              style={{
                padding: '0 18px 16px',
                borderTop: `1px solid ${theme.borderLight}`,
                paddingTop: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              {contract.audit && contract.audit.length > 0 ? (
                contract.audit.map((log) => (
                  <div
                    key={log.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '11px',
                      padding: '8px 12px',
                      backgroundColor: theme.auditRowBg,
                      borderRadius: '6px',
                      minWidth: 0,
                      gap: '10px'
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                      <span style={{ fontWeight: 700, color: theme.textMain }}>{log.action}</span>
                      <span style={{ color: theme.textMuted, marginLeft: '8px' }}>By: {log.by}</span>
                      {log.note && (
                        <div style={{ fontSize: '11px', color: '#f87171', marginTop: '2px', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                          Note: {log.note}
                        </div>
                      )}
                    </div>
                    <span style={{ color: theme.textMuted, fontSize: '11px', flexShrink: 0 }}>{log.timestamp}</span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '11px', color: theme.textMuted, padding: '8px 0' }}>
                  No audit trail recorded.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Edit Deliverables Modal */}
      {isEditModalOpen && (
        <EditDeliverablesModal
          contract={contract}
          onClose={() => setIsEditModalOpen(false)}
          onSave={onSaveAllDeliverables || onUpdateLineItemQty}
        />
      )}
    </div>
  );
}