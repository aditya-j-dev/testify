# 🧪 PHASE 5 TESTING PROTOCOL: Assessment Lifecycle & Stabilization

Follow these structured steps to fully validate the Testify Exam Engine. All tests assume `npm run dev` is running.

---

## ✅ Test 1: Cohort-Based Targeting (Student Discovery)
**Goal**: Verify exams are only visible to the correct audience.

**Setup:**
1. Log in as a **Teacher**. Create a new exam.
2. In the **Create Exam form**, set `Target Branch` = CS and `Target Batch` = Batch 2025.
3. Add 2 questions and click **Activate Exam** (Go Live).

**Verification (Correct Student):**
4. Log in as a student in **CS / Batch 2025**.
5. Go to `Student Dashboard → Assessments`.
   - ✅ The exam **must appear** in "Active Now".

**Verification (Wrong Student):**
6. Log in as a student in **CS / Batch 2026** (or a different branch entirely).
   - ✅ The exam **must NOT appear**. "No Active Sessions" should show.

**College-Wide Fallback:**
7. Create another exam with **no branch/batch set** (leave both as "All Branches").
8. Log in as **any student** in that college.
   - ✅ This exam **must appear** for all of them.

---

## ✅ Test 2: Copy-on-Write Versioning (Owner Edits Locked Question)
**Goal**: Verify editing a question in an ACTIVE exam creates a fork.

1. Find a question that is part of an **ACTIVE** exam.
2. Open it in the **Academic Registry** (Question Repository page) and edit the question text. Save.
3. **Check the Registry**: A new question with your edited text should appear (clone).
4. **Check the Exam Builder**: The active exam's question list should still show the **original** text (the snapshot is preserved for live students).

---

## ✅ Test 3: Cross-Teacher Fork (New Feature)
**Goal**: Verify that editing another teacher's question creates a fork, not an error.

1. Log in as **Teacher A**. Create a question "What is Newton's 2nd law?".
2. Log in as **Teacher B**. Go to the Question Repository and find Teacher A's question.
3. Click the **Edit (pencil) icon** on it and change the text. Save.
   - ✅ **Before fix**: Got `{"success":false,"message":"Unauthorized: You do not own this question"}`.
   - ✅ **After fix**: Save succeeds. A new question appears in the registry owned by **Teacher B** with the edited text. Teacher A's original is **untouched**.
4. If done from inside an **Exam Builder**, verify the exam now links to Teacher B's forked copy.

---

## ✅ Test 4: High-Fidelity Snapshotting
**Goal**: Content is frozen at publication — bank edits don't affect live exams.

1. Create an exam with Question A. Click **Finalize Builder** (→ `PUBLISHED` status).
2. Go to the Academic Registry and edit Question A (change the text).
3. Return to the Exam Builder for the published exam.
   - ✅ The builder **must** still show the **pre-edit** text — the snapshot was taken at publish.

---

## ✅ Test 5: Post-Publication Structural Flexibility
**Goal**: Questions can be added/removed after publish but before activation.

1. Set an exam to `PUBLISHED` status.
2. Try to **Add** a question from the registry.
   - ✅ Must succeed.
3. Try to **Remove** an existing question.
   - ✅ Must succeed.
4. Now click **Activate Exam** (→ `ACTIVE`).
5. Check: The Add/Remove buttons must be **gone** (UI lockdown for live session).

---

## ✅ Test 6: Deletion Safeguards
**Goal**: Questions in active/completed exams cannot be deleted.

1. **Safe case**: Find a question not used in any exam. Click the **Trash icon**.
   - ✅ Deleted successfully. Toast confirms.
2. **Locked case**: Find a question linked to an `ACTIVE` or `COMPLETED` exam.
   - ✅ The trash icon should be **hidden/disabled** in the UI — no delete option shown.
   - ✅ If you try the API directly: `{"message":"Cannot delete a question used in an active or completed assessment."}`.

---

## ✅ Test 7: Exam Name Badge (Registry Traceability)
**Goal**: Questions display the name of any exam they're part of.

1. Go to the **Question Repository**.
2. Find a question that has been added to at least one exam.
   - ✅ At the **bottom-right of its card**, you should see an indigo pill badge showing the exam name (e.g., `Mid Sem Physics`).
3. A question not in any exam should show **no badge** (clean card footer).

---

## ✅ Test 8: Toast Notifications
**Goal**: All errors and confirmations use toast, not `alert()`.

1. Try to edit a question you don't own (while logged in as a different teacher from a non-exam context should now fork — see Test 3).
2. Try to publish an exam with 0 questions.
   - ✅ All error messages appear as **toast popups** in the bottom-right corner.
3. Add a question to an exam successfully.
   - ✅ Green success toast: "Question added to exam".

---

## 📋 Standard Pass Criteria
- All 8 tests pass with no runtime errors.
- No `Cannot read properties of undefined` crashes in the UI.
- Student discovery is cohort-strict (Batch 26 ≠ Batch 27).
- Snapshots remain frozen after publication regardless of bank changes.
