# 📚 MASTER HANDOVER: Testify SaaS Assessment Platforms (Phases 1-5)

This document is a high-fidelity technical blueprint of the **Testify** platform. It provides subsequent AI engineering teams with complete context on the architecture, phase development history, and core code logic.

---

## 🏗️ 1. Project Architecture & Multi-Tenancy
**Testify** follows a strict **SaaS Multi-Tenant** model. Every entity (User, Exam, Question, Subject) is isolated by a `collegeId`.

### Key Hierarchy:
- **College**: The root tenant.
- **Branch**: Departmental subdivisions (e.g., Computer Science).
- **Batch**: Specific student cohorts within a branch (e.g., Class of 2024).
- **User Roles**: `SUPER_ADMIN`, `ADMIN` (College-level), `TEACHER`, `STUDENT`.

---

## 📑 2. Phase-by-Phase Development History

### Phase 1: Organization Foundation
**Goal**: Build the skeletal structure for multi-tenancy.
- **Achievements**: Implemented CRUD for Colleges, Branches, and Batches.
- **Core Model**: `College`, `Branch`, `Batch` with cascading deletes to maintain clean data.

### Phase 2: Academic Registry & Question Bank
**Goal**: Create a central repository for educational assets.
- **Achievements**:
    - **Subjects**: Mapped to colleges.
    - **Question Bank**: Support for `MCQ_SINGLE`, `MCQ_MULTIPLE`, and `SUBJECTIVE` types.
    - **Asset Search**: Implemented keyword-based filtering across the registry.

### Phase 3: Authentication & Security (RBAC)
**Goal**: Secure the platform with Role-Based Access Control.
- **Achievements**:
    - **JWT Strategy**: Stateless authentication storing `userId`, `role`, and institutional context (`collegeId`, `branchId`).
    - **Middleware**: Guarded routes to ensure students cannot access builder tools and teachers are isolated within their college.

### Phase 4: Exam Engine & Builder
**Goal**: Enable teachers to construct complex assessments.
- **Achievements**:
    - **Exam Model**: Tracks `status` (`DRAFT`, `PUBLISHED`, `ACTIVE`, `COMPLETED`).
    - **The Builder UI**: A drag-and-drop style interface for linking questions from the Registry to a specific Exam.
    - **Scaling**: Integrated `totalMarks` tracking and validation.

### Phase 5: Assessment Lifecycle Stabilization (CURRENT STATE)
**Goal**: Hardening the engine for real-world academic integrity.
- **Achievements**:
    - **Cohort Targeting**: Granular discovery using `ExamAccess`.
    - **Versioned Snapshots**: Asset immutability during live exams.
    - **Hot-Swap Engine**: Transparent asset cloning during edits.

---

## ⚙️ 3. Core Technical Logic (Code Deep-Dive)

### A. The "Copy-on-Write" Asset Cloner
If a teacher edits a question already used in a **LIVE** or **COMPLETED** exam, the system clones it to prevent corrupting historical records.

**Source**: `src/lib/services/question.service.js`
```javascript
// From updateQuestion service
if (isLocked) {
  // CLONE logic: Create a new version for the current interaction
  const { options: oldOptions, ...oldData } = questionRecord;
  const newQuestion = await tx.question.create({
    data: {
      ...oldData,
      ...questionData,
      id: undefined, // let DB generate new UUID
      options: {
        create: options.map(o => ({ text: o.text, label: o.label, isCorrect: o.isCorrect, order: o.order }))
      }
    }
  });

  // HOT-SWAP logic: Immediately redirect the exam to the new version
  if (examId) {
    await tx.examQuestion.update({
      where: { examId_questionId: { examId, questionId: id } },
      data: { questionId: newQuestion.id }
    });
  }
}
```

### B. High-Fidelity Snapshotting
When an exam is **PUBLISHED**, the system generates a "Hard Snapshot" of every question. Students see the snapshot, not the live bank.

**Source**: `src/lib/services/exam.service.js`
```javascript
// From publishExam service
await prisma.$transaction(
  exam.questions.map((eq) => {
    const liveQuestion = eq.question;
    return prisma.examQuestion.update({
      where: { examId_questionId: { examId: eq.examId, questionId: eq.questionId } },
      data: {
        questionTextSnapshot: liveQuestion.text,
        optionsSnapshot: JSON.stringify(liveQuestion.options),
        correctAnswersSnapshot: liveQuestion.options.filter(o => o.isCorrect).map(o => o.label)
      }
    });
  })
);
```

### C. Cohort Discovery (Targeting)
How students "find" their assessments based on their assigned Branch and Batch.

**Source**: `src/lib/services/attempt.service.js`
```javascript
// From getAvailableExams service
where: {
  collegeId: user.collegeId,
  status: 'ACTIVE',
  AND: [
    {
      OR: [
        { access: { some: { OR: [
          { branchId: user.branchId, batchId: null }, // Entire Branch
          { batchId: user.batchId },                  // Specific Batch
          { branchId: null, batchId: null }           // College Wide
        ]}}},
        { access: { none: {} } }                      // Fallback: No targeting set
      ]
    }
  ]
}
```

---

## 📈 4. The Future Path: Phase 6 Roadmap

### Next Task: `grading.service.js`
The next AI must implement the result engine.
1. **Auto-Grader**: Compare `attempt.answers` against `examQuestion.correctAnswersSnapshot`.
2. **Subjective Score API**: Create endpoints for teachers to manually award marks and feedback for written answers.
3. **GPA/Result Processor**: Aggregation logic to populate the `Result` model for students.

---
*Created by Antigravity AI - Handoff Date: 2026-04-05*
