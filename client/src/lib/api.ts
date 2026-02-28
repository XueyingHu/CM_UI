import { apiRequest } from "./queryClient";

const SESSION_KEY = "cm_session_id";

export async function getOrCreateSession(): Promise<string> {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (sessionId) return sessionId;

  const res = await apiRequest("POST", "/api/sessions", {});
  const session = await res.json();
  sessionStorage.setItem(SESSION_KEY, session.id);
  return session.id;
}

export function getSessionId(): string | null {
  return sessionStorage.getItem(SESSION_KEY);
}

export async function updateSession(data: Record<string, any>) {
  const sessionId = getSessionId();
  if (!sessionId) return;
  await apiRequest("PATCH", `/api/sessions/${sessionId}`, data);
}

export async function addDocument(doc: { name: string; type: string; status: string; size: string }) {
  const sessionId = await getOrCreateSession();
  const res = await apiRequest("POST", `/api/sessions/${sessionId}/documents`, doc);
  return res.json();
}

export async function getDocuments() {
  const sessionId = getSessionId();
  if (!sessionId) return [];
  const res = await fetch(`/api/sessions/${sessionId}/documents`);
  return res.json();
}

export async function removeDocument(id: string) {
  await apiRequest("DELETE", `/api/documents/${id}`, undefined);
}

export async function getReviewItems(tab: string, phase: string) {
  const sessionId = getSessionId();
  if (!sessionId) return [];
  const res = await fetch(`/api/sessions/${sessionId}/review-items?tab=${tab}&phase=${phase}`);
  return res.json();
}

export async function updateReviewItemAction(id: string, action: string) {
  const res = await apiRequest("PATCH", `/api/review-items/${id}`, { action });
  return res.json();
}

export async function seedReviewItems() {
  const sessionId = await getOrCreateSession();
  const res = await apiRequest("POST", `/api/sessions/${sessionId}/seed-review-items`, {});
  return res.json();
}

export async function getExtractionResults() {
  const sessionId = getSessionId();
  if (!sessionId) return [];
  const res = await fetch(`/api/sessions/${sessionId}/extractions`);
  return res.json();
}

export async function saveExtractionResults(results: any[]) {
  const sessionId = await getOrCreateSession();
  const res = await apiRequest("POST", `/api/sessions/${sessionId}/extractions`, results);
  return res.json();
}

export async function getInsights() {
  const sessionId = getSessionId();
  if (!sessionId) return [];
  const res = await fetch(`/api/sessions/${sessionId}/insights`);
  return res.json();
}

export async function saveInsights(items: any[]) {
  const sessionId = await getOrCreateSession();
  const res = await apiRequest("POST", `/api/sessions/${sessionId}/insights`, items);
  return res.json();
}
