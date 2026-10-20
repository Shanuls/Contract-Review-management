## 6 UI States Implemented

In this project, we added 6 essential UI states to improve user experience and handle edge cases:

### 1. Loading State (Skeleton Screen)
* **What it does:** Shows 5 pulsing grey placeholder cards while data is loading.
* **Why:** Stops the screen from flickering or jumping when switching tabs.
* **File:** `src/components/QueueList.jsx`

### 2. Empty State
* **What it does:** Displays an "All caught up" message with a checkmark icon when no contracts are found.
* **Action:** Has a "Clear Search" / "View All Open" button to reset filters.
* **File:** `src/components/EmptyState.jsx`

### 3. Error State
* **What it does:** Shows an error message if the queue fails to load: *"We couldn't load the queue. Your decisions are saved."*
* **Action:** Includes a blue "Try again" button to retry loading.
* **File:** `src/components/ErrorState.jsx`

### 4. Success State (Undo Toast)
* **What it does:** Shows a dark popup notification at the bottom right when a contract is approved, rejected, or blocked.
* **Action:** Includes an "Undo" button with a 6-second timer to cancel the action.
* **File:** `src/components/UndoToast.jsx`

### 5. Large Data State (Pagination)
* **What it does:** Splits the long contract list into 6 items per page.
* **Controls:** Adds "Previous" and "Next" buttons at the bottom of the list.
* **File:** `src/components/QueueList.jsx`

### 6. Permission State (Role-Based Restriction)
* **What it does:** Disables the "Approve" button for contracts valued over ₹75 Lakh.
* **Message:** Displays: *"Only senior reviewers can approve contracts above ₹75 lakh."*
* **File:** `src/components/DetailPanel.jsx`