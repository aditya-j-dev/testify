export const studentClient = {
  exams: {
    async list() {
      const res = await fetch("/api/student/exams");
      return res.json();
    },
    async start(id) {
      const res = await fetch(`/api/student/exams/${id}/attempt`, { method: "POST" });
      return res.json();
    }
  },
  attempts: {
    async sync(id, answers) {
      const res = await fetch(`/api/student/attempts/${id}/sync`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers })
      });
      return res.json();
    },
    async submit(id) {
      const res = await fetch(`/api/student/attempts/${id}/submit`, { method: "POST" });
      return res.json();
    }
  }
};
