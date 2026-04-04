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
    }
  }
};
