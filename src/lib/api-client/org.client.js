/**
 * API Client for Organization Foundation (Phase 1)
 */

export const orgClient = {
  // --- Colleges ---
  colleges: {
    async list() {
      const res = await fetch("/api/org/college");
      return res.json();
    },
    async create(data) {
      const res = await fetch("/api/org/college", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    async getById(id) {
      const res = await fetch(`/api/org/college/${id}`);
      return res.json();
    },
    async update(id, data) {
      const res = await fetch(`/api/org/college/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    async createAdmin(id, adminData) {
      const res = await fetch(`/api/org/college/${id}/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminData),
      });
      return res.json();
    }
  },

  // --- Users (Faculty/Students) ---
  users: {
    async list(role = "TEACHER", batchId = null) {
      const url = batchId 
        ? `/api/org/users?role=${role}&batchId=${batchId}`
        : `/api/org/users?role=${role}`;
      const res = await fetch(url);
      return res.json();
    },
    async create(userData) {
      const res = await fetch("/api/org/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      return res.json();
    },
    async delete(id) {
      const res = await fetch(`/api/org/users/${id}`, { method: "DELETE" });
      return res.json();
    },
    async batchUpload(file, role = "TEACHER") {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("role", role);
      const res = await fetch("/api/org/users/batch", {
        method: "POST",
        body: formData,
      });
      return res.json();
    }
  },

  // --- Branches ---
  branches: {

    async list(collegeId) {
      const res = await fetch(`/api/org/branch?collegeId=${collegeId}`);
      return res.json();
    },
    async create(data) {
      const res = await fetch("/api/org/branch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    async update(id, data) {
      const res = await fetch(`/api/org/branch/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    async delete(id) {
      const res = await fetch(`/api/org/branch/${id}`, { method: "DELETE" });
      return res.json();
    }
  },

  // --- Batches ---
  batches: {
    async list(branchId) {
      const res = await fetch(`/api/org/batch?branchId=${branchId}`);
      return res.json();
    },
    async create(data) {
      const res = await fetch("/api/org/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    async update(id, data) {
      const res = await fetch(`/api/org/batch/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    async delete(id) {
       const res = await fetch(`/api/org/batch/${id}`, { method: "DELETE" });
       return res.json();
    },
    async performMaintenance(collegeId) {
       const res = await fetch(`/api/org/batch/maintenance?collegeId=${collegeId}`, { method: "POST" });
       return res.json();
    },
    async getYears(collegeId) {
       const res = await fetch(`/api/org/batch/years?collegeId=${collegeId}`);
       return res.json();
    }
  },

  // --- Subjects ---
  subjects: {
    async list(collegeId) {
      const res = await fetch(`/api/org/subjects?collegeId=${collegeId}`);
      return res.json();
    },
    async create(data) {
      const res = await fetch("/api/org/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    async update(id, data) {
      const res = await fetch(`/api/org/subjects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    async delete(id) {
       const res = await fetch(`/api/org/subjects/${id}`, { method: "DELETE" });
       return res.json();
    },
    async batchCreate(data) {
      const res = await fetch("/api/org/subjects/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    async batchUpload(file) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/org/subjects/batch", {
        method: "POST",
        body: formData,
      });
      return res.json();
    }
  },

  // --- Questions (Bank) ---
  questions: {
    async list(filters = {}) {
      const params = new URLSearchParams(filters);
      const res = await fetch(`/api/org/questions?${params}`);
      return res.json();
    },
    async create(data) {
      const res = await fetch("/api/org/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    async delete(id) {
       const res = await fetch(`/api/org/questions/${id}`, { method: "DELETE" });
       return res.json();
    },
    async update(id, data) {
       const res = await fetch(`/api/org/questions/${id}`, {
         method: "PATCH",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(data),
       });
       return res.json();
    }
  },

  // --- Exams (Engine) ---
  exams: {
    async list(filters = {}) {
      const params = new URLSearchParams(filters);
      const res = await fetch(`/api/org/exams?${params}`);
      return res.json();
    },
    async create(data) {
      const res = await fetch("/api/org/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    async getById(id) {
       const res = await fetch(`/api/org/exams/${id}`);
       return res.json();
    },
    async update(id, data) {
       const res = await fetch(`/api/org/exams/${id}`, {
         method: "PATCH",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(data),
       });
       return res.json();
    },
    async delete(id) {
       const res = await fetch(`/api/org/exams/${id}`, { method: "DELETE" });
       return res.json();
    },
    async addQuestion(id, data) {
       const res = await fetch(`/api/org/exams/${id}/questions`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(data),
       });
       return res.json();
    },
    async removeQuestion(id, questionId) {
       const res = await fetch(`/api/org/exams/${id}/questions?questionId=${questionId}`, { method: "DELETE" });
       return res.json();
    },
    async publish(id, data) {
       const res = await fetch(`/api/org/exams/${id}/publish`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(data),
       });
       return res.json();
    },
    async start(id) {
       const res = await fetch(`/api/org/exams/${id}/start`, { method: "POST" });
       return res.json();
    },
    async complete(id) {
       const res = await fetch(`/api/org/exams/${id}/complete`, { method: "POST" });
       return res.json();
    },
    async reorderQuestions(id, orderedIds) {
       const res = await fetch(`/api/org/exams/${id}/questions`, {
         method: "PATCH",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ orderedIds }),
       });
       return res.json();
    }
  }
};
