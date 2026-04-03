/**
 * Aurevia Estate AI - Typed API client with demo fallback support.
 */

import axios, { AxiosError } from "axios";
import {
  demoApi,
  isDemoFallbackEnabled,
  isDemoForced,
} from "./demo";
import type {
  AISettings,
  AnalyticsEvent,
  AnalyticsSummary,
  ApiErrorShape,
  AppSettings,
  AutomationSettings,
  Conversation,
  Escalation,
  FollowUp,
  IntegrationActionResult,
  IntegrationProvider,
  IntegrationTestSendPayload,
  IntakeResponse,
  KnowledgeActionResult,
  KnowledgeDocument,
  Lead,
  LeadIntakePayload,
  Message,
  PaginatedResponse,
  SettingsCategoryResponse,
} from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000";

export class ApiClientError extends Error {
  status?: number;

  constructor({ message, status }: ApiErrorShape) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

const client = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string }>) => {
    throw new ApiClientError({
      message:
        error.response?.data?.detail ||
        error.message ||
        "Something went wrong while contacting the Aurevia backend.",
      status: error.response?.status,
    });
  },
);

async function unwrap<T>(promise: Promise<{ data: T }>): Promise<T> {
  const response = await promise;
  return response.data;
}

async function resolveData<T>(liveCall: () => Promise<T>, demoCall: () => Promise<T>): Promise<T> {
  if (isDemoForced()) {
    return demoCall();
  }

  try {
    return await liveCall();
  } catch (error) {
    if (!isDemoFallbackEnabled()) {
      throw error;
    }

    return demoCall();
  }
}

export const leadsApi = {
  list: (params?: { skip?: number; limit?: number }) =>
    resolveData(
      () => unwrap<PaginatedResponse<Lead>>(client.get("/leads", { params })),
      () => demoApi.leads.list(params),
    ),

  get: (id: string) =>
    resolveData(() => unwrap<Lead>(client.get(`/leads/${id}`)), () => demoApi.leads.get(id)),

  create: (payload: Partial<Lead>) =>
    resolveData(() => unwrap<Lead>(client.post("/leads", payload)), () => demoApi.leads.create(payload)),

  update: (id: string, payload: Partial<Lead>) =>
    resolveData(
      () => unwrap<Lead>(client.patch(`/leads/${id}`, payload)),
      () => demoApi.leads.update(id, payload),
    ),

  intake: (payload: LeadIntakePayload) =>
    resolveData(
      () => unwrap<IntakeResponse>(client.post("/leads/intake", payload)),
      () => demoApi.leads.intake(payload),
    ),
};

export const conversationsApi = {
  list: (params?: { skip?: number; limit?: number }) =>
    resolveData(
      () => unwrap<PaginatedResponse<Conversation>>(client.get("/conversations", { params })),
      () => demoApi.conversations.list(params),
    ),

  get: (id: string) =>
    resolveData(
      () => unwrap<Conversation>(client.get(`/conversations/${id}`)),
      () => demoApi.conversations.get(id),
    ),

  messages: (conversationId: string, params?: { skip?: number; limit?: number }) =>
    resolveData(
      () => unwrap<PaginatedResponse<Message>>(client.get(`/messages/${conversationId}`, { params })),
      () => demoApi.conversations.messages(conversationId, params),
    ),
};

export const followUpsApi = {
  list: (params?: { skip?: number; limit?: number }) =>
    resolveData(
      () => unwrap<PaginatedResponse<FollowUp>>(client.get("/follow-ups", { params })),
      () => demoApi.followUps.list(params),
    ),

  execute: (id: string) =>
    resolveData(
      () => unwrap<FollowUp>(client.post(`/follow-ups/${id}/execute`)),
      () => demoApi.followUps.execute(id),
    ),
};

export const escalationsApi = {
  list: (params?: { skip?: number; limit?: number }) =>
    resolveData(
      () => unwrap<PaginatedResponse<Escalation>>(client.get("/escalations", { params })),
      () => demoApi.escalations.list(params),
    ),
};

export const knowledgeApi = {
  list: (params?: { skip?: number; limit?: number }) =>
    resolveData(
      () => unwrap<PaginatedResponse<KnowledgeDocument>>(client.get("/knowledge", { params })),
      () => demoApi.knowledge.list(params),
    ),

  get: (id: string) =>
    resolveData(
      () => unwrap<KnowledgeDocument>(client.get(`/knowledge/${id}`)),
      () => demoApi.knowledge.get(id),
    ),

  upload: (file: File, title: string, category: string) => {
    const form = new FormData();
    form.append("file", file);
    form.append("title", title);
    form.append("category", category);

    return resolveData(
      () =>
        unwrap<KnowledgeDocument>(
          client.post("/knowledge/upload", form, {
            headers: { "Content-Type": "multipart/form-data" },
          }),
        ),
      () => demoApi.knowledge.upload(file, title, category),
    );
  },

  index: (id: string) =>
    resolveData(
      () => unwrap<KnowledgeActionResult>(client.post(`/knowledge/${id}/index`)),
      () => demoApi.knowledge.indexAction(id, "index"),
    ),

  reindex: (id: string) =>
    resolveData(
      () => unwrap<KnowledgeActionResult>(client.post(`/knowledge/${id}/reindex`)),
      () => demoApi.knowledge.indexAction(id, "reindex"),
    ),

  retry: (id: string) =>
    resolveData(
      () => unwrap<KnowledgeActionResult>(client.post(`/knowledge/${id}/retry`)),
      () => demoApi.knowledge.indexAction(id, "retry"),
    ),

  delete: (id: string) =>
    resolveData(
      () => unwrap<KnowledgeActionResult>(client.delete(`/knowledge/${id}`)),
      () => demoApi.knowledge.indexAction(id, "delete"),
    ),
};

export const analyticsApi = {
  summary: () =>
    resolveData(
      () => unwrap<AnalyticsSummary>(client.get("/analytics/summary")),
      () => demoApi.analytics.summary(),
    ),

  events: (params?: { skip?: number; limit?: number }) =>
    resolveData(
      () => unwrap<PaginatedResponse<AnalyticsEvent>>(client.get("/analytics/events", { params })),
      () => demoApi.analytics.events(params),
    ),
};

export const integrationsApi = {
  list: () =>
    resolveData(
      () => unwrap<PaginatedResponse<IntegrationProvider>>(client.get("/integrations")),
      () => demoApi.integrations.list(),
    ),

  get: (provider: string) =>
    resolveData(
      () => unwrap<IntegrationProvider>(client.get(`/integrations/${provider}`)),
      () => demoApi.integrations.get(provider),
    ),

  test: (provider: string) =>
    resolveData(
      () => unwrap<IntegrationActionResult>(client.post(`/integrations/${provider}/test`)),
      () => demoApi.integrations.action(provider, "test"),
    ),

  sync: (provider: string) =>
    resolveData(
      () => unwrap<IntegrationActionResult>(client.post(`/integrations/${provider}/sync`)),
      () => demoApi.integrations.action(provider, "sync"),
    ),

  testSendWhatsapp: (payload: IntegrationTestSendPayload) =>
    resolveData(
      () => unwrap<IntegrationActionResult>(client.post("/integrations/whatsapp/test-send", payload)),
      () => demoApi.integrations.send("whatsapp"),
    ),

  testSendEmail: (payload: IntegrationTestSendPayload) =>
    resolveData(
      () => unwrap<IntegrationActionResult>(client.post("/integrations/email/test-send", payload)),
      () => demoApi.integrations.send("email"),
    ),
};

export const settingsApi = {
  get: () =>
    resolveData(
      () => unwrap<AppSettings>(client.get("/settings")),
      () => demoApi.settings.get(),
    ),

  update: (payload: Partial<AppSettings>) =>
    resolveData(
      () => unwrap<AppSettings>(client.put("/settings", payload)),
      () => demoApi.settings.update(payload),
    ),

  getAI: () =>
    resolveData(
      () => unwrap<SettingsCategoryResponse>(client.get("/settings/ai")),
      async () => {
        const settings = await demoApi.settings.get();
        return {
          category: "ai",
          payload: settings.ai as unknown as Record<string, unknown>,
          updated_at: settings.updated_at,
        };
      },
    ),

  updateAI: (payload: AISettings) =>
    resolveData(
      () => unwrap<SettingsCategoryResponse>(client.put("/settings/ai", payload)),
      async () => {
        const settings = await demoApi.settings.update({ ai: payload });
        return {
          category: "ai",
          payload: settings.ai as unknown as Record<string, unknown>,
          updated_at: settings.updated_at,
        };
      },
    ),

  getAutomation: () =>
    resolveData(
      () => unwrap<SettingsCategoryResponse>(client.get("/settings/automation")),
      async () => {
        const settings = await demoApi.settings.get();
        return {
          category: "automation",
          payload: settings.automation as unknown as Record<string, unknown>,
          updated_at: settings.updated_at,
        };
      },
    ),

  updateAutomation: (payload: AutomationSettings) =>
    resolveData(
      () => unwrap<SettingsCategoryResponse>(client.put("/settings/automation", payload)),
      async () => {
        const settings = await demoApi.settings.update({ automation: payload });
        return {
          category: "automation",
          payload: settings.automation as unknown as Record<string, unknown>,
          updated_at: settings.updated_at,
        };
      },
    ),
};

export const healthApi = {
  check: () =>
    resolveData(
      () => unwrap<{ status: string; service: string; version: string }>(client.get("/health")),
      () => demoApi.health.check(),
    ),
};

export default client;
