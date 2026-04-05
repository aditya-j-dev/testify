# 🧪 PHASE 5 TESTING PROTOCOL: Assessment Lifecycle & Stabilization

Follow these structured steps to verify the stability and integrity of the **Testify** Exam Engine.

---

## Test 1: Cohort-Based Targeting (Discovery)
**Goal**: Verify that exams are only visible to the intended student audience.

1.  **Teacher Setup**: Create a new Exam. Go to **Config** and set:
    *   `Target Branch`: Select your test branch (e.g., Computer Science).
    *   `Target Batch`: Select "All Students in Branch" OR a specific Batch (e.g., 2024).
2.  **Activate**: Add 2-3 questions and click **Activate Exam** (Go Live).
3.  **Student Verification (Match)**: Log in as a student in that same Branch/Batch.
    *   *Result*: The exam **must** appear in "Active Now".
4.  **Student Verification (Mismatch)**: Log in as a student in a **different** Branch or Batch.
    *   *Result*: The exam **must not** be visible.
5.  **College-Wide Check**: As a Teacher, remove targeting (set both to null).
    *   *Result*: All students in that college **must** now see the exam.

---

## Test 2: Copy-on-Write Asset Versioning (Cloner)
**Goal**: Verify that editing a question doesn't corrupt live assessment data.

1.  **Preparation**: Identify a question that is part of an **ACTIVE** or **COMPLETED** exam.
2.  **Execution**: Open that question in the **Academic Registry** (Left Panel) or the **Exam Builder**.
3.  **Modification**: Change the question text or options and click **Save**.
4.  **Verification (Bank)**: Check the Academic Registry. 
    *   *Result*: You should now see **two** versions of the question (or use the search to find the new one).
5.  **Verification (Exam)**: check the Exam Builder for the active exam.
    *   *Result*: The exam **must** still show the **original** question content (snapshots). The global bank's "original" question remains untouched for that exam.

---

## Test 3: High-Fidelity Snapshotting
**Goal**: Ensure content is frozen at the moment of Publication.

1.  **Draft Phase**: Create an exam and add Question A.
2.  **Publish Phase**: Click **Finalize Builder** (Move to `PUBLISHED` status).
3.  **The Edit**: Go to the **Academic Registry** and edit Question A (e.g., fix a typo).
4.  **The Check**: Return to the Exam Builder for the published exam.
    *   *Result*: The builder **must** still show the text from Question A **before** the typo fix. This confirms the snapshot was taken correctly.

---

## Test 4: Post-Publication Structural Flexibility
**Goal**: Allow last-minute adjustments before activation.

1.  **Status**: Set an exam to `PUBLISHED` status.
2.  **Action**: Try to **Add** a new question from the Registry.
3.  **Action**: Try to **Remove** an existing question from the Structure.
    *   *Result*: Both actions **must** be permitted. 
4.  **Activation**: Click **Activate Exam**.
    *   *Result*: Once `ACTIVE`, the Add/Remove/Edit buttons **must** disappear (UI lockdown).

---

## Test 5: Deletion Safeguards (Asset Purge)
**Goal**: Prevent "Orphan" records in historical data.

1.  **Case A (Safe)**: Find a question not used in any exam. Click **Purge from Repository** (Solid Trash Icon).
    *   *Result*: Question is deleted successfully.
2.  **Case B (Locked)**: Find a question linked to an **ACTIVE** or **COMPLETED** exam.
    *   *Result*: The "Purge" button **must** be hidden or disabled. Try to delete via API (if technical). 
    *   *Result*: The server **must** reject with "Cannot delete a question used in an active assessment."

---
**Standard Pass Criteria**: All 5 tests succeed without runtime errors (`map` crashes, etc.) and identity labels (Branch/Batch) correctly reflect the institutional state.
