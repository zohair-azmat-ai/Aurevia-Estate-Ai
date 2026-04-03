"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Database,
  FileText,
  Filter,
  Layers,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { EmptyState, ErrorState, ShimmerCard } from "../../components/ui/data-states";
import { PageContainer } from "../../components/dashboard/page-shell";
import { knowledgeApi } from "../../lib/api";
import type { KnowledgeDocument } from "../../lib/types";
import { formatDate } from "../../lib/utils";

// ------------------------------------------------------------------ //
// Helpers                                                               //
// ------------------------------------------------------------------ //

const CATEGORY_LABELS: Record<string, string> = {
  faq: "FAQ",
  area_guide: "Area Guide",
  brochure: "Brochure",
  property_brochure: "Property Brochure",
  pricing: "Pricing",
  rental_rules: "Rental Rules",
  policy: "Policy",
  other: "Other",
};

const CATEGORIES = [
  { value: "all", label: "All categories" },
  { value: "faq", label: "FAQ" },
  { value: "brochure", label: "Brochure" },
  { value: "area_guide", label: "Area Guide" },
  { value: "policy", label: "Policy" },
  { value: "pricing", label: "Pricing" },
  { value: "rental_rules", label: "Rental Rules" },
  { value: "other", label: "Other" },
];

const UPLOAD_CATEGORIES = CATEGORIES.filter((c) => c.value !== "all");

function formatBytes(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type StatusTone = { bg: string; text: string; dot: string; label: string };

function statusTone(status: KnowledgeDocument["status"]): StatusTone {
  switch (status) {
    case "indexed":
      return {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        dot: "bg-emerald-400",
        label: "Indexed",
      };
    case "indexing":
      return {
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        dot: "bg-amber-400",
        label: "Indexing",
      };
    case "uploaded":
    case "pending":
      return {
        bg: "bg-sky-500/10",
        text: "text-sky-400",
        dot: "bg-sky-400",
        label: status === "uploaded" ? "Uploaded" : "Pending",
      };
    case "failed":
      return {
        bg: "bg-rose-500/10",
        text: "text-rose-400",
        dot: "bg-rose-400",
        label: "Failed",
      };
    case "archived":
      return {
        bg: "bg-white/5",
        text: "text-content-muted",
        dot: "bg-content-muted",
        label: "Archived",
      };
    default:
      return {
        bg: "bg-white/5",
        text: "text-content-muted",
        dot: "bg-content-muted",
        label: status,
      };
  }
}

// ------------------------------------------------------------------ //
// Status badge                                                          //
// ------------------------------------------------------------------ //

function StatusBadge({ status }: { status: KnowledgeDocument["status"] }) {
  const tone = statusTone(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${tone.bg} ${tone.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {tone.label}
    </span>
  );
}

// ------------------------------------------------------------------ //
// Upload modal                                                          //
// ------------------------------------------------------------------ //

interface UploadModalProps {
  onClose: () => void;
  onUploaded: (doc: KnowledgeDocument) => void;
}

function UploadModal({ onClose, onUploaded }: UploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("faq");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = (f: File) => {
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, "").replaceAll(/[-_]/g, " "));
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;
    setIsUploading(true);
    setError(null);
    try {
      const doc = await knowledgeApi.upload(file, title.trim(), category);
      onUploaded(doc);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg rounded-[28px] border border-white/10 bg-[#111118] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-gold/20 bg-brand-gold/10 text-brand-gold">
              <Upload className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-brand-gold/70">Upload</p>
              <h2 className="text-base font-semibold text-content-primary">New knowledge asset</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-content-muted transition hover:text-content-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-5">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[20px] border-2 border-dashed p-8 text-center transition ${
              isDragOver
                ? "border-brand-gold/60 bg-brand-gold/5"
                : file
                ? "border-emerald-500/40 bg-emerald-500/5"
                : "border-white/10 bg-white/3 hover:border-brand-gold/30 hover:bg-brand-gold/5"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".txt,.md,.markdown,.csv,.json,.pdf,.docx,.doc"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            {file ? (
              <>
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                <div>
                  <p className="text-sm font-medium text-content-primary">{file.name}</p>
                  <p className="mt-1 text-xs text-content-muted">{formatBytes(file.size)}</p>
                </div>
              </>
            ) : (
              <>
                <FileText className="h-8 w-8 text-brand-gold/60" />
                <div>
                  <p className="text-sm font-medium text-content-primary">
                    Drop file here or click to browse
                  </p>
                  <p className="mt-1 text-xs text-content-muted">
                    TXT, MD, CSV, JSON · PDF and DOCX supported in the demo workflow
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-content-muted">
              Document title
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Dubai Marina FAQ"
              className="w-full rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-content-primary outline-none placeholder:text-content-muted focus:border-brand-gold/40 focus:bg-brand-gold/5 transition"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-content-muted">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-[14px] border border-white/10 bg-[#111118] px-4 py-3 text-sm text-content-primary outline-none focus:border-brand-gold/40 transition"
            >
              {UPLOAD_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value} className="bg-[#111118]">
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-[14px] border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-[14px] border border-white/10 bg-white/5 py-3 text-sm text-content-secondary transition hover:bg-white/8 hover:text-content-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || !title.trim() || isUploading}
              className="flex-1 rounded-[14px] border border-brand-gold/30 bg-brand-gold/15 py-3 text-sm font-medium text-brand-gold transition hover:bg-brand-gold/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading ? "Uploading…" : "Upload document"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ //
// Action button                                                         //
// ------------------------------------------------------------------ //

type ActionKey = "index" | "reindex" | "retry" | "delete";

interface ActionButtonProps {
  label: string;
  icon: React.ReactNode;
  variant?: "default" | "danger" | "gold";
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function ActionButton({ label, icon, variant = "default", loading, disabled, onClick }: ActionButtonProps) {
  const base =
    "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40";
  const styles = {
    default:
      "border-white/10 bg-white/5 text-content-secondary hover:border-white/20 hover:bg-white/8 hover:text-content-primary",
    danger:
      "border-rose-500/20 bg-rose-500/8 text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/15",
    gold: "border-brand-gold/25 bg-brand-gold/10 text-brand-gold hover:border-brand-gold/40 hover:bg-brand-gold/20",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${styles[variant]}`}
    >
      {loading ? (
        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
      ) : (
        icon
      )}
      {label}
    </button>
  );
}

// ------------------------------------------------------------------ //
// Document card                                                         //
// ------------------------------------------------------------------ //

interface DocCardProps {
  doc: KnowledgeDocument;
  selected: boolean;
  onSelect: () => void;
  onAction: (action: ActionKey) => void;
  busyAction: ActionKey | null;
}

function DocCard({ doc, selected, onSelect, onAction, busyAction }: DocCardProps) {
  const tone = statusTone(doc.status);
  const canIndex = doc.status === "uploaded" || doc.status === "pending";
  const canReindex = doc.status === "indexed";
  const canRetry = doc.status === "failed";
  const canDelete = doc.status !== "archived";

  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded-[22px] border p-4 transition ${
        selected
          ? "border-brand-gold/30 bg-brand-gold/8 shadow-[0_0_0_1px_rgba(201,168,76,0.15)]"
          : "border-white/8 bg-black/20 hover:border-white/14 hover:bg-black/30"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-content-primary">{doc.title}</p>
            {selected && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-brand-gold" />}
          </div>
          <p className="mt-0.5 text-xs text-content-muted">
            {CATEGORY_LABELS[doc.category] ?? doc.category}
            {doc.filename && (
              <span className="ml-2 opacity-60">· {doc.filename}</span>
            )}
          </p>
        </div>
        <StatusBadge status={doc.status} />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="uppercase tracking-[0.15em] text-content-muted">Chunks</p>
          <p className="mt-0.5 font-medium text-content-primary">{doc.chunk_count || "—"}</p>
        </div>
        <div>
          <p className="uppercase tracking-[0.15em] text-content-muted">Size</p>
          <p className="mt-0.5 font-medium text-content-primary">{formatBytes(doc.file_size)}</p>
        </div>
        <div>
          <p className="uppercase tracking-[0.15em] text-content-muted">Type</p>
          <p className="mt-0.5 font-medium text-content-primary">
            {doc.file_type ? `.${doc.file_type}` : "—"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div
        className="mt-4 flex flex-wrap items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {canIndex && (
          <ActionButton
            label="Index"
            icon={<Zap className="h-3.5 w-3.5" />}
            variant="gold"
            loading={busyAction === "index"}
            onClick={() => onAction("index")}
          />
        )}
        {canReindex && (
          <ActionButton
            label="Reindex"
            icon={<RefreshCw className="h-3.5 w-3.5" />}
            loading={busyAction === "reindex"}
            onClick={() => onAction("reindex")}
          />
        )}
        {canRetry && (
          <ActionButton
            label="Retry"
            icon={<RefreshCw className="h-3.5 w-3.5" />}
            variant="gold"
            loading={busyAction === "retry"}
            onClick={() => onAction("retry")}
          />
        )}
        {canDelete && (
          <ActionButton
            label="Delete"
            icon={<Trash2 className="h-3.5 w-3.5" />}
            variant="danger"
            loading={busyAction === "delete"}
            onClick={() => onAction("delete")}
          />
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ //
// Detail panel                                                          //
// ------------------------------------------------------------------ //

interface DetailPanelProps {
  doc: KnowledgeDocument;
  busyAction: ActionKey | null;
  onAction: (action: ActionKey) => void;
}

function DetailPanel({ doc, busyAction, onAction }: DetailPanelProps) {
  const tone = statusTone(doc.status);
  const canIndex = doc.status === "uploaded" || doc.status === "pending";
  const canReindex = doc.status === "indexed";
  const canRetry = doc.status === "failed";
  const canDelete = doc.status !== "archived";

  const contentPreview = doc.content
    ? doc.content.slice(0, 400) + (doc.content.length > 400 ? "…" : "")
    : null;

  return (
    <div className="space-y-4">
      {/* Identity */}
      <div className="rounded-[22px] border border-white/8 bg-black/20 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-content-primary">{doc.title}</p>
            {doc.filename && (
              <p className="mt-1 text-xs text-content-muted">{doc.filename}</p>
            )}
          </div>
          <StatusBadge status={doc.status} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="uppercase tracking-[0.15em] text-content-muted">Category</p>
            <p className="mt-1 font-medium text-content-primary">
              {CATEGORY_LABELS[doc.category] ?? doc.category}
            </p>
          </div>
          <div>
            <p className="uppercase tracking-[0.15em] text-content-muted">File type</p>
            <p className="mt-1 font-medium text-content-primary">
              {doc.file_type ? `.${doc.file_type}` : "—"}
            </p>
          </div>
          <div>
            <p className="uppercase tracking-[0.15em] text-content-muted">File size</p>
            <p className="mt-1 font-medium text-content-primary">{formatBytes(doc.file_size)}</p>
          </div>
          <div>
            <p className="uppercase tracking-[0.15em] text-content-muted">Source</p>
            <p className="mt-1 font-medium text-content-primary capitalize">
              {doc.source_type ?? "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Indexing stats */}
      <div className="rounded-[22px] border border-white/8 bg-black/20 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Database className="h-4 w-4 text-brand-gold/70" />
          <p className="text-xs uppercase tracking-[0.2em] text-brand-gold/70">Vector index</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="uppercase tracking-[0.15em] text-content-muted">Chunks</p>
            <p className="mt-1 text-lg font-semibold text-content-primary">{doc.chunk_count || 0}</p>
          </div>
          <div>
            <p className="uppercase tracking-[0.15em] text-content-muted">Last indexed</p>
            <p className="mt-1 font-medium text-content-primary">
              {doc.last_indexed_at ? formatDate(doc.last_indexed_at) : "Never"}
            </p>
          </div>
        </div>
        <div className="mt-4 text-xs">
          <p className="uppercase tracking-[0.15em] text-content-muted">Uploaded</p>
          <p className="mt-1 font-medium text-content-primary">{formatDate(doc.created_at)}</p>
        </div>
      </div>

      {/* Status / error */}
      {doc.status === "failed" && doc.error_message && (
        <div className="rounded-[22px] border border-rose-500/20 bg-rose-500/8 p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-rose-400" />
            <p className="text-xs uppercase tracking-[0.2em] text-rose-400">Indexing failure</p>
          </div>
          <p className="text-xs text-rose-300/80 leading-relaxed">{doc.error_message}</p>
        </div>
      )}

      {doc.status === "indexed" && (
        <div className="rounded-[22px] border border-emerald-500/15 bg-emerald-500/5 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <p className="text-xs text-emerald-400">
              Document is live in the vector index and available for RAG retrieval.
            </p>
          </div>
        </div>
      )}

      {/* Content preview */}
      {contentPreview && (
        <div className="rounded-[22px] border border-dashed border-white/10 bg-black/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="h-4 w-4 text-brand-gold/60" />
            <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Content preview</p>
          </div>
          <p className="text-xs leading-relaxed text-content-secondary font-mono whitespace-pre-wrap line-clamp-6">
            {contentPreview}
          </p>
        </div>
      )}

      {/* Action strip */}
      <div className="flex flex-wrap gap-2 pt-1">
        {canIndex && (
          <ActionButton
            label="Index now"
            icon={<Zap className="h-3.5 w-3.5" />}
            variant="gold"
            loading={busyAction === "index"}
            onClick={() => onAction("index")}
          />
        )}
        {canReindex && (
          <ActionButton
            label="Reindex"
            icon={<RefreshCw className="h-3.5 w-3.5" />}
            loading={busyAction === "reindex"}
            onClick={() => onAction("reindex")}
          />
        )}
        {canRetry && (
          <ActionButton
            label="Retry indexing"
            icon={<RefreshCw className="h-3.5 w-3.5" />}
            variant="gold"
            loading={busyAction === "retry"}
            onClick={() => onAction("retry")}
          />
        )}
        {canDelete && (
          <ActionButton
            label="Delete document"
            icon={<Trash2 className="h-3.5 w-3.5" />}
            variant="danger"
            loading={busyAction === "delete"}
            onClick={() => onAction("delete")}
          />
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ //
// Main page                                                             //
// ------------------------------------------------------------------ //

export function KnowledgePageClient() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [busyMap, setBusyMap] = useState<Record<string, ActionKey | null>>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const loadKnowledge = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await knowledgeApi.list({ limit: 200 });
      setDocuments(response.items);
      if (response.items.length > 0 && !selectedId) {
        setSelectedId(response.items[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load the knowledge library.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    void loadKnowledge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const handleAction = useCallback(
    async (docId: string, action: ActionKey) => {
      setBusyMap((prev) => ({ ...prev, [docId]: action }));
      try {
        let result;
        switch (action) {
          case "index":
            result = await knowledgeApi.index(docId);
            break;
          case "reindex":
            result = await knowledgeApi.reindex(docId);
            break;
          case "retry":
            result = await knowledgeApi.retry(docId);
            break;
          case "delete":
            result = await knowledgeApi.delete(docId);
            break;
        }
        // Refresh document from server
        if (action === "delete") {
          setDocuments((prev) => prev.filter((d) => d.id !== docId));
          if (selectedId === docId) setSelectedId(null);
        } else {
          const updated = await knowledgeApi.get(docId);
          setDocuments((prev) => prev.map((d) => (d.id === docId ? updated : d)));
        }
        showToast(result.message, result.status === "failed" ? "error" : "success");
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Action failed.", "error");
      } finally {
        setBusyMap((prev) => ({ ...prev, [docId]: null }));
      }
    },
    [selectedId, showToast]
  );

  const handleUploaded = useCallback(
    (doc: KnowledgeDocument) => {
      setDocuments((prev) => [doc, ...prev]);
      setSelectedId(doc.id);
      setIsUploadOpen(false);
      showToast(`"${doc.title}" uploaded — ready to index.`);
    },
    [showToast]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return documents.filter((item) => {
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        (item.filename ?? "").toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      const matchesCategory = category === "all" || item.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [category, documents, query]);

  const selectedDoc = useMemo(
    () => documents.find((d) => d.id === selectedId) ?? null,
    [documents, selectedId]
  );

  const indexedCount = documents.filter((d) => d.status === "indexed").length;
  const failedCount = documents.filter((d) => d.status === "failed").length;

  return (
    <>
      {isUploadOpen && (
        <UploadModal onClose={() => setIsUploadOpen(false)} onUploaded={handleUploaded} />
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-[16px] border px-4 py-3 text-sm shadow-xl transition ${
            toast.type === "success"
              ? "border-emerald-500/25 bg-emerald-500/15 text-emerald-300"
              : "border-rose-500/25 bg-rose-500/15 text-rose-300"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {toast.message}
        </div>
      )}

      <PageContainer
        eyebrow="RAG operations"
        title="Knowledge management"
        description="Upload, index, and manage your AI knowledge base. All documents feed directly into the Qdrant vector index powering Aurevia's retrieval layer."
        actions={
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Indexed</p>
              <p className="mt-1 text-lg font-semibold text-content-primary">{indexedCount}</p>
            </div>
            {failedCount > 0 && (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/8 px-4 py-3 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-rose-400/80">Failed</p>
                <p className="mt-1 text-lg font-semibold text-rose-400">{failedCount}</p>
              </div>
            )}
            <div className="rounded-2xl border border-brand-gold/20 bg-brand-gold/10 px-4 py-3 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-brand-gold/80">Total assets</p>
              <p className="mt-1 text-lg font-semibold text-content-primary">{documents.length}</p>
            </div>
          </div>
        }
      >
        <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          {/* -------------------------------------------------------- */}
          {/* Left: Document library                                     */}
          {/* -------------------------------------------------------- */}
          <article className="rounded-[30px] border border-white/8 bg-[linear-gradient(160deg,rgba(201,168,76,0.08),rgba(255,255,255,0.02)_30%,rgba(255,255,255,0.02)_100%)] p-6 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-gold/20 bg-brand-gold/10 text-brand-gold">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="label-caps text-brand-gold/80">Document library</p>
                  <h3 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-content-primary">
                    Knowledge assets
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="flex items-center gap-2 rounded-[14px] border border-brand-gold/30 bg-brand-gold/15 px-4 py-2.5 text-sm font-medium text-brand-gold transition hover:bg-brand-gold/25 active:scale-[0.97]"
              >
                <Upload className="h-4 w-4" />
                Upload
              </button>
            </div>

            {/* Search + filter */}
            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
              <label className="flex h-11 items-center gap-3 rounded-[14px] border border-white/10 bg-white/5 px-4 text-content-secondary">
                <Search className="h-4 w-4 shrink-0 text-brand-gold" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search title, filename, or category…"
                  className="w-full bg-transparent text-sm text-content-primary outline-none placeholder:text-content-muted"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-content-muted hover:text-content-primary">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </label>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 shrink-0 text-brand-gold" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-11 rounded-[14px] border border-white/10 bg-[#111118] px-3 text-sm text-content-primary outline-none focus:border-brand-gold/30"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value} className="bg-[#111118]">
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Refresh */}
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-content-muted">
                {filtered.length} document{filtered.length !== 1 ? "s" : ""}
              </p>
              <button
                onClick={() => void loadKnowledge()}
                className="flex items-center gap-1.5 text-xs text-content-muted transition hover:text-content-primary"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </button>
            </div>

            {/* List */}
            <div className="mt-4">
              {isLoading ? (
                <div className="space-y-3">
                  <ShimmerCard className="h-36 rounded-[22px]" />
                  <ShimmerCard className="h-36 rounded-[22px]" />
                  <ShimmerCard className="h-36 rounded-[22px]" />
                </div>
              ) : error ? (
                <ErrorState
                  title="Knowledge library unavailable"
                  description={error}
                  actionLabel="Retry"
                  onAction={() => void loadKnowledge()}
                />
              ) : filtered.length === 0 ? (
                <EmptyState
                  title={documents.length === 0 ? "No documents yet" : "No documents match"}
                  description={
                    documents.length === 0
                      ? "Upload your first knowledge document to power Aurevia's RAG layer."
                      : "Try adjusting your search or category filter."
                  }
                  actionLabel={documents.length === 0 ? "Upload document" : "Clear filters"}
                  onAction={
                    documents.length === 0
                      ? () => setIsUploadOpen(true)
                      : () => { setQuery(""); setCategory("all"); }
                  }
                />
              ) : (
                <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1 scrollbar-thin">
                  {filtered.map((doc) => (
                    <DocCard
                      key={doc.id}
                      doc={doc}
                      selected={selectedId === doc.id}
                      onSelect={() => setSelectedId(doc.id)}
                      onAction={(action) => void handleAction(doc.id, action)}
                      busyAction={busyMap[doc.id] ?? null}
                    />
                  ))}
                </div>
              )}
            </div>
          </article>

          {/* -------------------------------------------------------- */}
          {/* Right: Detail panel                                        */}
          {/* -------------------------------------------------------- */}
          <article className="rounded-[30px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(201,168,76,0.12),rgba(255,255,255,0.02)_38%,rgba(255,255,255,0.01)_100%)] p-6 shadow-card">
            {selectedDoc ? (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-gold/20 bg-brand-gold/10 text-brand-gold">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="label-caps text-brand-gold/80">Asset detail</p>
                    <h3 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-content-primary">
                      Document inspector
                    </h3>
                  </div>
                </div>
                <DetailPanel
                  doc={selectedDoc}
                  busyAction={busyMap[selectedDoc.id] ?? null}
                  onAction={(action) => void handleAction(selectedDoc.id, action)}
                />
              </>
            ) : (
              <div className="flex min-h-[480px] flex-col items-center justify-center rounded-[26px] border border-dashed border-brand-gold/15 bg-black/20 p-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-gold/15 bg-brand-gold/8 text-brand-gold/60">
                  <BookOpen className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-content-primary">
                  Select a document
                </h3>
                <p className="mt-3 max-w-xs text-sm text-content-secondary">
                  Click any document in the library to inspect its indexing status, metadata, and
                  content preview.
                </p>
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="mt-6 flex items-center gap-2 rounded-[14px] border border-brand-gold/25 bg-brand-gold/10 px-5 py-2.5 text-sm font-medium text-brand-gold transition hover:bg-brand-gold/20"
                >
                  <Upload className="h-4 w-4" />
                  Upload first document
                </button>
              </div>
            )}
          </article>
        </section>
      </PageContainer>
    </>
  );
}
