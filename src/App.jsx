import React, { useState, useEffect, useMemo, useRef } from 'react';
import { INITIAL_CONTRACTS } from './data/contracts';
import TopNavbar from './components/TopNavbar';
import QueueList from './components/QueueList';
import DetailPanel from './components/DetailPanel';
import TableView from './components/TableView';
import { HighValueModal, ReasonModal, ShortcutsModal, AddContractModal } from './components/Modals';
import UndoToast from './components/UndoToast';
import './App.css';

// Helper for Exact Date + Time (Format: 19 Oct 2026, 09:35:42 PM)
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
  const [contracts, setContracts] = useState(INITIAL_CONTRACTS);
  const [selectedId, setSelectedId] = useState(INITIAL_CONTRACTS[0]?.id || null);
  const [activeTab, setActiveTab] = useState('Open');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('split');
  const [grayscale, setGrayscale] = useState(false);

  // Loading State for Skeletons
  const [isLoading, setIsLoading] = useState(true);

  // Error State with Safe Retry
  const [hasError, setHasError] = useState(false);

  // Modals state
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [highValueConfirmContract, setHighValueConfirmContract] = useState(null);
  const [reasonModalConfig, setReasonModalConfig] = useState(null);
  const [reasonNote, setReasonNote] = useState('');
  const [reasonError, setReasonError] = useState('');

  // 6-second Undo state
  const [undoSnapshot, setUndoSnapshot] = useState(null);
  const searchInputRef = useRef(null);

  // Initial load simulation for skeleton animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Tab switch with smooth skeleton transition
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setIsLoading(true);
    setHasError(false);
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  };

  // Retry Handler for Error State Recovery
  const handleRetryFetch = () => {
    setHasError(false);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  // Sort function: Overdue first (most overdue top), then priority HIGH -> MED -> LOW, then due date
  const sortContracts = (list) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return [...list].sort((a, b) => {
      const aDue = new Date(a.dueDate);
      const bDue = new Date(b.dueDate);
      const aDays = Math.round((aDue - today) / (1000 * 60 * 60 * 24));
      const bDays = Math.round((bDue - today) / (1000 * 60 * 60 * 24));

      const aOverdue = aDays < 0;
      const bOverdue = bDays < 0;

      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      if (aOverdue && bOverdue) return aDays - bDays;

      const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }

      return aDays - bDays;
    });
  };

  // Filtered contracts according to active tab & search
  const filteredContracts = useMemo(() => {
    let list = contracts;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c =>
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.supplier.toLowerCase().includes(q)
      );
    }

    if (activeTab === 'Open') {
      list = list.filter(c => ['New', 'In Review', 'Blocked'].includes(c.status));
    } else if (activeTab === 'New') {
      list = list.filter(c => c.status === 'New');
    } else if (activeTab === 'In review') {
      list = list.filter(c => c.status === 'In Review');
    } else if (activeTab === 'Blocked') {
      list = list.filter(c => c.status === 'Blocked');
    } else if (activeTab === 'Closed') {
      list = list.filter(c => ['Approved', 'Rejected'].includes(c.status));
    }

    return sortContracts(list);
  }, [contracts, activeTab, searchQuery]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const countMatch = (predicate) => {
      let base = contracts;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        base = base.filter(c =>
          c.id.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.supplier.toLowerCase().includes(q)
        );
      }
      return base.filter(predicate).length;
    };

    return {
      Open: countMatch(c => ['New', 'In Review', 'Blocked'].includes(c.status)),
      New: countMatch(c => c.status === 'New'),
      'In review': countMatch(c => c.status === 'In Review'),
      Blocked: countMatch(c => c.status === 'Blocked'),
      Closed: countMatch(c => ['Approved', 'Rejected'].includes(c.status))
    };
  }, [contracts, searchQuery]);

  // Currently selected contract
  const selectedContract = useMemo(() => {
    return filteredContracts.find(c => c.id === selectedId) || filteredContracts[0] || null;
  }, [filteredContracts, selectedId]);

  // Auto-advance helper
  const autoSelectNext = (currentId) => {
    const idx = filteredContracts.findIndex(c => c.id === currentId);
    if (idx !== -1 && idx + 1 < filteredContracts.length) {
      setSelectedId(filteredContracts[idx + 1].id);
    } else if (filteredContracts.length > 1) {
      setSelectedId(filteredContracts[0].id);
    }
  };

  // Trigger 6-second undo toast
  const triggerUndoableAction = (message, previousContracts) => {
    setUndoSnapshot({
      contracts: previousContracts,
      message,
      secondsRemaining: 6
    });
  };

  // Undo countdown timer
  useEffect(() => {
    if (!undoSnapshot) return;
    if (undoSnapshot.secondsRemaining <= 0) {
      setUndoSnapshot(null);
      return;
    }
    const timer = setTimeout(() => {
      setUndoSnapshot(prev => prev ? { ...prev, secondsRemaining: prev.secondsRemaining - 1 } : null);
    }, 1000);
    return () => clearTimeout(timer);
  }, [undoSnapshot]);

  // Handle Undo
  const handleUndo = () => {
    if (undoSnapshot) {
      setContracts(undoSnapshot.contracts);
      setUndoSnapshot(null);
    }
  };

  // Workflow Handlers with Date + Time
  const handleStartReview = (id) => {
    const prev = JSON.parse(JSON.stringify(contracts));
    setContracts(prevContracts => prevContracts.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: 'In Review',
          audit: [
            { 
              id: `aud-${Date.now()}`, 
              action: 'Review Started', 
              by: 'Priya Raman', 
              timestamp: getCurrentFormattedTimestamp() 
            },
            ...c.audit
          ]
        };
      }
      return c;
    }));
    triggerUndoableAction(`${id} review started.`, prev);
  };

  const handleResumeReview = (id) => {
    const prev = JSON.parse(JSON.stringify(contracts));
    setContracts(prevContracts => prevContracts.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: 'In Review',
          audit: [
            { 
              id: `aud-${Date.now()}`, 
              action: 'Review Resumed', 
              by: 'Priya Raman', 
              timestamp: getCurrentFormattedTimestamp() 
            },
            ...c.audit
          ]
        };
      }
      return c;
    }));
    triggerUndoableAction(`${id} resumed.`, prev);
  };

  const executeApproval = (contract) => {
    const prev = JSON.parse(JSON.stringify(contracts));
    setContracts(prevContracts => prevContracts.map(c => {
      if (c.id === contract.id) {
        return {
          ...c,
          status: 'Approved',
          audit: [
            { 
              id: `aud-${Date.now()}`, 
              action: 'Contract Approved', 
              by: 'Priya Raman', 
              timestamp: getCurrentFormattedTimestamp() 
            },
            ...c.audit
          ]
        };
      }
      return c;
    }));
    setHighValueConfirmContract(null);
    autoSelectNext(contract.id);
    triggerUndoableAction(`${contract.id} approved.`, prev);
  };

  const handleTriggerApprove = (contract) => {
    if (contract.value > 5000000) {
      setHighValueConfirmContract(contract);
    } else {
      executeApproval(contract);
    }
  };

  const handleConfirmReason = () => {
    if (!reasonNote.trim() || reasonNote.trim().length < 10) {
      setReasonError('Note must be at least 10 characters long.');
      return;
    }

    const type = reasonModalConfig.type;
    const contract = selectedContract;
    const newStatus = type === 'Reject' ? 'Rejected' : 'Blocked';
    const prev = JSON.parse(JSON.stringify(contracts));

    setContracts(prevContracts => prevContracts.map(c => {
      if (c.id === contract.id) {
        return {
          ...c,
          status: newStatus,
          audit: [
            {
              id: `aud-${Date.now()}`,
              action: `${type}ed by Priya Raman`,
              by: 'Priya Raman',
              timestamp: getCurrentFormattedTimestamp(),
              note: reasonNote.trim()
            },
            ...c.audit
          ]
        };
      }
      return c;
    }));

    setReasonModalConfig(null);
    setReasonNote('');
    setReasonError('');
    autoSelectNext(contract.id);
    triggerUndoableAction(`${contract.id} ${type.toLowerCase()}ed.`, prev);
  };

  // Editable quantity handler with Live Date + Time in Audit Trail
  const handleUpdateLineItemQty = (contractId, lineItemId, newQty) => {
    setContracts(prev => prev.map(c => {
      if (c.id === contractId) {
        const targetItem = c.lineItems.find(it => it.id === lineItemId);
        const oldQty = targetItem ? targetItem.qty : 0;
        
        const updatedItems = c.lineItems.map(item =>
          item.id === lineItemId ? { ...item, qty: Math.max(1, newQty) } : item
        );
        const newValue = updatedItems.reduce((acc, it) => acc + (it.unitRate * it.qty), 0);
        
        const auditEntry = {
          id: `aud-${Date.now()}`,
          action: `Quantity changed from ${oldQty} to ${newQty} (${targetItem?.desc || 'Line item'})`,
          by: 'Priya Raman',
          timestamp: getCurrentFormattedTimestamp()
        };

        return { 
          ...c, 
          lineItems: updatedItems, 
          value: newValue, 
          audit: [auditEntry, ...c.audit]
        };
      }
      return c;
    }));
  };

  // Add new contract handler
  const handleAddNewContract = (newData) => {
    const newId = `C-${1000 + contracts.length + 1}`;
    const newContract = {
      id: newId,
      supplier: newData.supplier,
      category: newData.category,
      title: newData.title,
      value: newData.value,
      status: 'New',
      priority: newData.priority,
      dueDate: newData.dueDate,
      sla: newData.sla,
      paymentTerms: newData.paymentTerms,
      terminationClause: newData.terminationClause,
      compliance: newData.compliance,
      lineItems: newData.lineItems && newData.lineItems.length > 0 ? newData.lineItems : [
        { id: `li-${Date.now()}`, desc: newData.title, unitRate: newData.value, qty: 1 }
      ],
      audit: [
        { 
          id: `aud-${Date.now()}`, 
          action: 'Created Inbound PO', 
          by: 'Priya Raman', 
          timestamp: getCurrentFormattedTimestamp() 
        }
      ]
    };

    setContracts([newContract, ...contracts]);
    setSelectedId(newId);
  };

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') {
        if (e.key === 'Escape') {
          document.activeElement.blur();
        }
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
        return;
      }

      if (e.key === 'Escape') {
        setShowShortcutsModal(false);
        setShowAddModal(false);
        setHighValueConfirmContract(null);
        setReasonModalConfig(null);
        return;
      }

      if (e.key === 'j' || e.key === 'J' || e.key === 'ArrowDown') {
        e.preventDefault();
        const currIdx = filteredContracts.findIndex(c => c.id === selectedContract?.id);
        if (currIdx !== -1 && currIdx + 1 < filteredContracts.length) {
          setSelectedId(filteredContracts[currIdx + 1].id);
        }
        return;
      }

      if (e.key === 'k' || e.key === 'K' || e.key === 'ArrowUp') {
        e.preventDefault();
        const currIdx = filteredContracts.findIndex(c => c.id === selectedContract?.id);
        if (currIdx > 0) {
          setSelectedId(filteredContracts[currIdx - 1].id);
        }
        return;
      }

      if (selectedContract && selectedContract.status === 'In Review') {
        if (e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          handleTriggerApprove(selectedContract);
        } else if (e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          setReasonModalConfig({ type: 'Reject' });
          setReasonNote('');
          setReasonError('');
        } else if (e.key === 'b' || e.key === 'B') {
          e.preventDefault();
          setReasonModalConfig({ type: 'Block' });
          setReasonNote('');
          setReasonError('');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredContracts, selectedContract]);

  return (
    <div className={`app-container ${grayscale ? 'grayscale-active' : ''}`}>
      <TopNavbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        tabCounts={tabCounts}
        viewMode={viewMode}
        setViewMode={setViewMode}
        grayscale={grayscale}
        setGrayscale={setGrayscale}
        setShowShortcutsModal={setShowShortcutsModal}
        setShowAddModal={setShowAddModal}
        searchInputRef={searchInputRef}
      />

      <div className="app-workspace">
        {viewMode === 'split' ? (
          <>
            <QueueList
              contracts={filteredContracts}
              selectedContract={selectedContract}
              onSelectContract={(c) => setSelectedId(c.id)}
              searchQuery={searchQuery}
              onClearSearch={() => setSearchQuery('')}
              activeTab={activeTab}
              setActiveTab={handleTabChange}
              tabCounts={tabCounts}
              isLoading={isLoading}
              hasError={hasError}
              onRetry={handleRetryFetch}
            />
            <DetailPanel
              contract={selectedContract}
              onStartReview={handleStartReview}
              onTriggerApprove={handleTriggerApprove}
              onOpenReasonModal={(type) => {
                setReasonModalConfig({ type });
                setReasonNote('');
                setReasonError('');
              }}
              onResumeReview={handleResumeReview}
              onUpdateLineItemQty={handleUpdateLineItemQty}
            />
          </>
        ) : (
          <TableView
            contracts={filteredContracts}
            selectedContract={selectedContract}
            isLoading={isLoading}
            onSelectContract={(c) => {
              setSelectedId(c.id);
              setViewMode('split');
            }}
          />
        )}
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