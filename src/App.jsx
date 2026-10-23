import React, { useState, useEffect, useMemo, useRef } from 'react';
import { INITIAL_CONTRACTS } from './data/contracts';
import TopNavbar from './components/TopNavbar';
import Sidebar from './components/Sidebar';
import QueueList from './components/QueueList';
import DetailPanel from './components/DetailPanel';
import TableView from './components/TableView';
import { HighValueModal, ReasonModal, ShortcutsModal, AddContractModal } from './components/Modals';
import UndoToast from './components/UndoToast';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ReportsPage from './pages/ReportsPage';
import { useTheme } from './context/ThemeContext';
import './App.css';

const getCurrentFormattedTimestamp = () => {
  const now = new Date();
  return now.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

export default function App() {
  const location = useLocation();
  const isQueuePage = location.pathname === '/queue';
  const { activeTheme } = useTheme();
  const isDark = activeTheme === 'dark';

  const [contracts, setContracts] = useState(INITIAL_CONTRACTS);
  const [selectedId, setSelectedId] = useState(INITIAL_CONTRACTS[0]?.id || null);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Persist viewMode across refreshes
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('procureflow_view_mode') || 'split';
  });

  const handleViewModeChange = (newMode) => {
    setViewMode(newMode);
    localStorage.setItem('procureflow_view_mode', newMode);
  };

  const [grayscale, setGrayscale] = useState(false);
  const [startedReviewIds, setStartedReviewIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [highValueConfirmContract, setHighValueConfirmContract] = useState(null);
  const [reasonModalConfig, setReasonModalConfig] = useState(null);
  const [reasonNote, setReasonNote] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [undoSnapshot, setUndoSnapshot] = useState(null);

  const searchInputRef = useRef(null);

  useEffect(() => {
    if (location.pathname === '/queue' && location.state) {
      if (location.state.categoryFilter) {
        setSearchQuery(location.state.categoryFilter);
      } else if (location.state.supplierFilter) {
        setSearchQuery(location.state.supplierFilter);
      } else if (location.state.statusFilter) {
        setActiveTab(location.state.statusFilter);
      }
    }
  }, [location]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setIsLoading(true);
    setHasError(false);
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  const handleRetryFetch = () => {
    setHasError(false);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const sortContracts = (list) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };

    return [...list].sort((a, b) => {
      const aDue = new Date(a.dueDate);
      const bDue = new Date(b.dueDate);
      const aDays = Math.round((aDue - today) / (1000 * 60 * 60 * 24));
      const bDays = Math.round((bDue - today) / (1000 * 60 * 60 * 24));

      const getActionWeight = (status) => {
        if (status === 'New' || status === 'Open' || status === 'In Review') return 1;
        if (status === 'Blocked') return 2;
        return 3;
      };

      const aWeight = getActionWeight(a.status);
      const bWeight = getActionWeight(b.status);

      const aActionableOverdue = aWeight === 1 && aDays < 0;
      const bActionableOverdue = bWeight === 1 && bDays < 0;

      if (aActionableOverdue && !bActionableOverdue) return -1;
      if (!aActionableOverdue && bActionableOverdue) return 1;

      if (aActionableOverdue && bActionableOverdue) {
        if (aDays !== bDays) return aDays - bDays;
      }

      if (aWeight !== bWeight) {
        return aWeight - bWeight;
      }

      const pA = priorityOrder[a.priority] || 4;
      const pB = priorityOrder[b.priority] || 4;
      if (pA !== pB) {
        return pA - pB;
      }

      return aDays - bDays;
    });
  };

  const filteredContracts = useMemo(() => {
    let list = contracts;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((c) =>
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.supplier.toLowerCase().includes(q) ||
        (c.category && c.category.toLowerCase().includes(q))
      );
    }
    if (priorityFilter !== 'All') {
      list = list.filter((c) => c.priority === priorityFilter);
    }
    if (activeTab === 'All') {
      // All contracts
    } else if (activeTab === 'New') {
      list = list.filter((c) => c.status === 'New' || c.status === 'In Review');
    } else if (activeTab === 'Approved') {
      list = list.filter((c) => c.status === 'Approved');
    } else if (activeTab === 'Blocked') {
      list = list.filter((c) => c.status === 'Blocked');
    } else if (activeTab === 'Rejected') {
      list = list.filter((c) => c.status === 'Rejected');
    }
    return sortContracts(list);
  }, [contracts, activeTab, searchQuery, priorityFilter]);

  const tabCounts = useMemo(() => {
    const countMatch = (predicate) => {
      let base = contracts;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        base = base.filter((c) =>
          c.id.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.supplier.toLowerCase().includes(q) ||
          (c.category && c.category.toLowerCase().includes(q))
        );
      }
      if (priorityFilter !== 'All') {
        base = base.filter((c) => c.priority === priorityFilter);
      }
      return base.filter(predicate).length;
    };

    return {
      All: countMatch(() => true),
      Open: countMatch((c) => c.status === 'Open' || c.status === 'In Review'),
      Approved: countMatch((c) => c.status === 'Approved'),
      Blocked: countMatch((c) => c.status === 'Blocked'),
      Rejected: countMatch((c) => c.status === 'Rejected')
    };
  }, [contracts, searchQuery, priorityFilter]);

  const selectedContract = useMemo(() => {
    return filteredContracts.find((c) => c.id === selectedId) || filteredContracts[0] || null;
  }, [filteredContracts, selectedId]);

  const autoSelectNext = (currentId) => {
    const idx = filteredContracts.findIndex((c) => c.id === currentId);
    if (idx !== -1 && idx + 1 < filteredContracts.length) {
      setSelectedId(filteredContracts[idx + 1].id);
    } else if (filteredContracts.length > 1) {
      setSelectedId(filteredContracts[0].id);
    }
  };

  const triggerUndoableAction = (message, previousContracts, previousStartedReviewIds, targetId) => {
    setUndoSnapshot({
      contracts: previousContracts,
      startedReviewIds: previousStartedReviewIds !== undefined ? previousStartedReviewIds : startedReviewIds,
      selectedId: targetId || selectedId,
      message,
      secondsRemaining: 6
    });
  };

  useEffect(() => {
    if (!undoSnapshot) return;
    if (undoSnapshot.secondsRemaining <= 0) {
      setUndoSnapshot(null);
      return;
    }
    const timer = setTimeout(() => {
      setUndoSnapshot((prev) => (prev ? { ...prev, secondsRemaining: prev.secondsRemaining - 1 } : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [undoSnapshot]);

  const handleUndo = () => {
    if (undoSnapshot) {
      setContracts(undoSnapshot.contracts);
      if (undoSnapshot.startedReviewIds !== undefined) {
        setStartedReviewIds(undoSnapshot.startedReviewIds);
      }
      if (undoSnapshot.selectedId) {
        setSelectedId(undoSnapshot.selectedId);
      }
      setUndoSnapshot(null);
    }
  };

  // Review Started Action
  const handleStartReview = (id) => {
    const prevContracts = JSON.parse(JSON.stringify(contracts));
    const prevStarted = [...startedReviewIds];
    const nowStamp = getCurrentFormattedTimestamp();

    setContracts((prevContractsList) =>
      prevContractsList.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            audit: [
              {
                id: `aud-${Date.now()}`,
                action: 'Review Initiated (Verification Active)',
                by: 'Priya Raman',
                timestamp: nowStamp
              },
              ...c.audit
            ]
          };
        }
        return c;
      })
    );

    triggerUndoableAction(`${id} review started.`, prevContracts, prevStarted, id);
  };

  // Resume Review Action
  const handleResumeReview = (id) => {
    const prevContracts = JSON.parse(JSON.stringify(contracts));
    const prevStarted = [...startedReviewIds];
    const nowStamp = getCurrentFormattedTimestamp();

    setContracts((prevContractsList) =>
      prevContractsList.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            status: 'New',
            audit: [
              {
                id: `aud-${Date.now()}`,
                action: 'Review Resumed (Block Lifted)',
                by: 'Priya Raman',
                timestamp: nowStamp
              },
              ...c.audit
            ]
          };
        }
        return c;
      })
    );

    triggerUndoableAction(`${id} resumed.`, prevContracts, prevStarted, id);
  };

  // Execute Approval
  const executeApproval = (contract) => {
    const targetId = contract.id;
    const prevContracts = JSON.parse(JSON.stringify(contracts));
    const prevStarted = [...startedReviewIds];
    const nowStamp = getCurrentFormattedTimestamp();

    setContracts((prevContractsList) =>
      prevContractsList.map((c) => {
        if (c.id === contract.id) {
          return {
            ...c,
            status: 'Approved',
            audit: [
              {
                id: `aud-${Date.now()}`,
                action: `Contract Approved (Final Signed Value: ₹${c.value.toLocaleString('en-IN')})`,
                by: 'Priya Raman',
                timestamp: nowStamp
              },
              ...c.audit
            ]
          };
        }
        return c;
      })
    );

    setHighValueConfirmContract(null);
    autoSelectNext(contract.id);
    triggerUndoableAction(`${targetId} approved.`, prevContracts, prevStarted, targetId);
  };

  const handleTriggerApprove = (contract) => {
    if (contract.value > 5000000) {
      setHighValueConfirmContract(contract);
    } else {
      executeApproval(contract);
    }
  };

  // Reason Modal Confirmation (Reject / Block)
  const handleConfirmReason = () => {
    const trimmed = reasonNote.trim();
    if (!trimmed || trimmed.length < 10) {
      setReasonError('Note must be at least 10 characters long.');
      return;
    }
    if (/\d{7,}/.test(trimmed)) {
      setReasonError('Please avoid long numeric strings. Use explanatory words.');
      return;
    }
    const letterCount = (trimmed.match(/[a-zA-Z]/g) || []).length;
    if (letterCount < 6) {
      setReasonError('Please provide descriptive words along with any numbers.');
      return;
    }

    const type = reasonModalConfig.type;
    const contract = selectedContract;
    const targetId = contract.id;
    const newStatus = type === 'Reject' ? 'Rejected' : 'Blocked';

    const prevContracts = JSON.parse(JSON.stringify(contracts));
    const prevStarted = [...startedReviewIds];
    const nowStamp = getCurrentFormattedTimestamp();

    setContracts((prevContractsList) =>
      prevContractsList.map((c) => {
        if (c.id === contract.id) {
          return {
            ...c,
            status: newStatus,
            audit: [
              {
                id: `aud-${Date.now()}`,
                action: `${type}ed by Priya Raman`,
                by: 'Priya Raman',
                timestamp: nowStamp,
                note: trimmed
              },
              ...c.audit
            ]
          };
        }
        return c;
      })
    );

    setReasonModalConfig(null);
    setReasonNote('');
    setReasonError('');
    autoSelectNext(contract.id);
    triggerUndoableAction(`${targetId} ${type.toLowerCase()}ed.`, prevContracts, prevStarted, targetId);
  };

  const handleUpdateLineItemQty = (contractId, lineItemId, newQty) => {
    const nowStamp = getCurrentFormattedTimestamp();

    setContracts((prev) =>
      prev.map((c) => {
        if (c.id === contractId) {
          const targetItem = c.lineItems.find((it) => it.id === lineItemId);
          const oldQty = targetItem ? targetItem.qty : 0;
          const updatedItems = c.lineItems.map((item) =>
            item.id === lineItemId ? { ...item, qty: Math.max(1, newQty) } : item
          );
          const newValue = updatedItems.reduce((acc, it) => acc + it.unitRate * it.qty, 0);

          const auditEntry = {
            id: `aud-${Date.now()}`,
            action: `Quantity changed from ${oldQty} to ${newQty} (${targetItem?.desc || 'Line item'})`,
            by: 'Priya Raman',
            timestamp: nowStamp
          };

          return {
            ...c,
            lineItems: updatedItems,
            value: newValue,
            audit: [auditEntry, ...c.audit]
          };
        }
        return c;
      })
    );
  };

  // Automatic Deliverables Delta Audit
  const handleSaveAllDeliverables = (contractId, updatedItems) => {
    const nowStamp = getCurrentFormattedTimestamp();

    setContracts((prev) =>
      prev.map((c) => {
        if (c.id !== contractId) return c;

        const changes = [];
        updatedItems.forEach((u) => {
          const old = (c.lineItems || []).find((o) => o.id === u.id);
          if (old && Number(old.qty) !== Number(u.qty)) {
            changes.push(`${old.desc} (${old.qty} → ${u.qty})`);
          }
        });

        if (changes.length === 0) return c;

        const newTotal = updatedItems.reduce(
          (acc, it) => acc + (Number(it.unitRate || 0) * Number(it.qty || 0)),
          0
        );

        const newAuditEntry = {
          id: `aud-${Date.now()}`,
          action: `Deliverables updated: ${changes.join(', ')}`,
          by: 'Priya Raman',
          timestamp: nowStamp
        };

        return {
          ...c,
          lineItems: updatedItems,
          value: newTotal,
          audit: [newAuditEntry, ...c.audit]
        };
      })
    );
  };

  // Automatic Inbound Contract & Audit Trail Creation
  const handleAddNewContract = (newData) => {
    const newId = `C-${1000 + contracts.length + 1}`;
    const nowFormatted = getCurrentFormattedTimestamp();

    const autoIngestAudit = {
      id: `aud-${Date.now()}-1`,
      action: `Contract Ingested via Portal (${newData.lineItems?.length || 1} Deliverables)`,
      by: 'Automated Ingestion Engine',
      timestamp: nowFormatted,
      note: `Total Contract Value locked at ₹${Number(newData.value || 0).toLocaleString('en-IN')}`
    };

    const autoAssignAudit = {
      id: `aud-${Date.now()}-2`,
      action: 'Queued for Operational Review',
      by: 'Priya Raman',
      timestamp: nowFormatted,
      note: `Assigned Priority: ${newData.priority} | Due Date: ${newData.dueDate}`
    };

    const newContract = {
      id: newId,
      supplier: newData.supplier,
      category: newData.category,
      title: newData.title,
      value: newData.value,
      status: 'Open',
      priority: newData.priority,
      dueDate: newData.dueDate,
      sla: newData.sla,
      paymentTerms: newData.paymentTerms,
      terminationClause: newData.terminationClause,
      compliance: newData.compliance,
      lineItems: newData.lineItems,
      audit: [autoAssignAudit, autoIngestAudit]
    };

    setContracts([newContract, ...contracts]);
    setSelectedId(newId);
  };

  // Global Unified Keyboard Listener for Both Table View and Split View
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 1. Search Focus (Ctrl + K / Cmd + K)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      // Ignore single character keys if inside an input/textarea
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') {
        if (e.key === 'Escape') {
          document.activeElement.blur();
        }
        return;
      }

      // Escape key closes open modals
      if (e.key === 'Escape') {
        setShowShortcutsModal(false);
        setShowAddModal(false);
        setHighValueConfirmContract(null);
        setReasonModalConfig(null);
        return;
      }

      // Disable actions when any modal is open
      if (reasonModalConfig || highValueConfirmContract || showShortcutsModal || showAddModal) {
        return;
      }

      // 2. Shortcuts Cheat Sheet (?)
      if (e.key === '?') {
        e.preventDefault();
        setShowShortcutsModal((prev) => !prev);
        return;
      }

      // 3. Move Next (J or ArrowDown)
      if (e.key === 'j' || e.key === 'J' || e.key === 'ArrowDown') {
        e.preventDefault();
        const currIdx = filteredContracts.findIndex((c) => c.id === selectedContract?.id);
        if (currIdx !== -1 && currIdx + 1 < filteredContracts.length) {
          setSelectedId(filteredContracts[currIdx + 1].id);
        } else if (filteredContracts.length > 0 && currIdx === -1) {
          setSelectedId(filteredContracts[0].id);
        }
        return;
      }

      // 4. Move Previous (K or ArrowUp)
      if (e.key === 'k' || e.key === 'K' || e.key === 'ArrowUp') {
        e.preventDefault();
        const currIdx = filteredContracts.findIndex((c) => c.id === selectedContract?.id);
        if (currIdx > 0) {
          setSelectedId(filteredContracts[currIdx - 1].id);
        }
        return;
      }

      if (!selectedContract) return;

      const isClosed = selectedContract.status === 'Approved' || selectedContract.status === 'Rejected';
      const isReviewActive = startedReviewIds.includes(selectedContract.id);
      const isBlocked = selectedContract.status === 'Blocked';

      // Shortcuts A, R, B are active during ongoing review sessions
      if (isClosed || isBlocked || !isReviewActive) return;

      // 5. Approve Shortcut (A)
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleTriggerApprove(selectedContract);
        return;
      }

      // 6. Reject Shortcut (R) -> Opens Reason Modal
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setReasonModalConfig({ type: 'Reject' });
        setReasonNote('');
        setReasonError('');
        return;
      }

      // 7. Block Shortcut (B) -> Opens Reason Modal
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        setReasonModalConfig({ type: 'Block' });
        setReasonNote('');
        setReasonError('');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    filteredContracts,
    selectedContract,
    startedReviewIds,
    reasonModalConfig,
    highValueConfirmContract,
    showShortcutsModal,
    showAddModal
  ]);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflow: 'hidden' }}>
        {isQueuePage && (
          <TopNavbar
            viewMode={viewMode}
            setViewMode={handleViewModeChange}
            grayscale={grayscale}
            setGrayscale={setGrayscale}
            setShowShortcutsModal={setShowShortcutsModal}
            setShowAddModal={setShowAddModal}
          />
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          <Routes>
            <Route path="/" element={<HomePage contracts={contracts} />} />
            <Route path="/reports" element={<ReportsPage contracts={contracts} />} />
            <Route
              path="/queue"
              element={
                <div
                  style={{
                    display: 'flex',
                    flex: 1,
                    height: '100%',
                    overflow: 'hidden',
                    backgroundColor: isDark ? '#0f172a' : '#f8fafc'
                  }}
                >
                  {viewMode === 'split' ? (
                    <>
                      <QueueList
                        contracts={filteredContracts}
                        selectedContract={selectedContract}
                        onSelectContract={(c) => setSelectedId(c.id)}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        priorityFilter={priorityFilter}
                        setPriorityFilter={setPriorityFilter}
                        searchInputRef={searchInputRef}
                        activeTab={activeTab}
                        setActiveTab={handleTabChange}
                        tabCounts={tabCounts}
                        isLoading={isLoading}
                        hasError={hasError}
                        onRetry={handleRetryFetch}
                      />
                      <DetailPanel
                        contract={selectedContract}
                        startedReviewIds={startedReviewIds}
                        setStartedReviewIds={setStartedReviewIds}
                        onStartReview={handleStartReview}
                        onTriggerApprove={handleTriggerApprove}
                        onOpenReasonModal={(type) => {
                          setReasonModalConfig({ type });
                          setReasonNote('');
                          setReasonError('');
                        }}
                        onResumeReview={handleResumeReview}
                        onUpdateLineItemQty={handleUpdateLineItemQty}
                        onSaveAllDeliverables={handleSaveAllDeliverables}
                        isLoading={isLoading}
                        hasError={hasError}
                      />
                    </>
                  ) : (
                    <TableView
                      contracts={filteredContracts}
                      selectedContract={selectedContract}
                      activeTab={activeTab}
                      setActiveTab={handleTabChange}
                      tabCounts={tabCounts}
                      isLoading={isLoading}
                      hasError={hasError}
                      onRetry={handleRetryFetch}
                      onSelectContract={(c) => {
                        setSelectedId(c.id);
                      }}
                      startedReviewIds={startedReviewIds}
                      setStartedReviewIds={setStartedReviewIds}
                      onStartReview={handleStartReview}
                      onTriggerApprove={handleTriggerApprove}
                      onOpenReasonModal={(type) => {
                        setReasonModalConfig({ type });
                        setReasonNote('');
                        setReasonError('');
                      }}
                      onResumeReview={handleResumeReview}
                      onUpdateLineItemQty={handleUpdateLineItemQty}
                      onSaveAllDeliverables={handleSaveAllDeliverables}
                    />
                  )}
                </div>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>

      <UndoToast undoState={undoSnapshot} onUndo={handleUndo} />

      {highValueConfirmContract && (
        <HighValueModal
          contract={highValueConfirmContract}
          onConfirm={() => executeApproval(highValueConfirmContract)}
          onCancel={() => setHighValueConfirmContract(null)}
        />
      )}

      {reasonModalConfig && (
        <ReasonModal
          type={reasonModalConfig.type}
          note={reasonNote}
          setNote={setReasonNote}
          noteError={reasonError}
          onConfirm={handleConfirmReason}
          onCancel={() => {
            setReasonModalConfig(null);
            setReasonNote('');
            setReasonError('');
          }}
        />
      )}

      {showShortcutsModal && (
        <ShortcutsModal onClose={() => setShowShortcutsModal(false)} />
      )}

      {showAddModal && (
        <AddContractModal
          onAddContract={handleAddNewContract}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}