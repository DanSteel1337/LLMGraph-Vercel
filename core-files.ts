/**
 * Core files to keep in the project
 *
 * MAIN APP FILES:
 * - app/page.tsx (main dashboard)
 * - app/layout.tsx (root layout)
 * - app/error.tsx (error handling)
 * - app/global-error.tsx (global error handling)
 * - app/not-found.tsx (404 page)
 * - app/loading.tsx (loading state)
 *
 * API ROUTES:
 * - app/api/health/route.ts (consolidated health check)
 * - app/api/documents/route.ts (document management)
 * - app/api/documents/[id]/route.ts (document details)
 * - app/api/documents/[id]/chunks/route.ts (document chunks)
 * - app/api/documents/[id]/vectors/route.ts (document vectors)
 * - app/api/search/route.ts (search functionality)
 * - app/api/search/trends/route.ts (search trends)
 * - app/api/stats/route.ts (dashboard stats)
 * - app/api/process-pdf/route.ts (PDF processing)
 *
 * CORE COMPONENTS:
 * - components/dashboard/dashboard-stats.tsx (dashboard statistics)
 * - components/dashboard/category-distribution.tsx (category distribution)
 * - components/dashboard/search-trends.tsx (search trends)
 * - components/dashboard/popular-searches.tsx (popular searches)
 * - components/dashboard/recent-documents.tsx (recent documents)
 * - components/dashboard/system-status.tsx (system status)
 * - components/dashboard/env-var-checker.tsx (environment variable checker)
 * - components/documents/document-management.tsx (document management)
 * - components/documents/document-edit-dialog.tsx (document editing)
 * - components/documents/document-preview-modal.tsx (document preview)
 * - components/search/search-interface.tsx (search interface)
 * - components/search/search-filters.tsx (search filters)
 * - components/search/search-results.tsx (search results)
 * - components/upload/document-upload-form.tsx (document upload)
 * - components/upload/batch-upload.tsx (batch upload)
 * - components/feedback/feedback-management.tsx (feedback management)
 * - components/feedback/feedback-detail-dialog.tsx (feedback details)
 * - components/settings/settings-form.tsx (settings form)
 * - components/diagnostics/database-diagnostics.tsx (database diagnostics)
 *
 * UTILITY FILES:
 * - lib/utils.ts (general utilities)
 * - lib/supabase/client.ts (Supabase client)
 * - lib/supabase/server.ts (Supabase server)
 * - lib/pinecone/client.ts (Pinecone client)
 * - lib/ai/embeddings.ts (AI embeddings)
 * - lib/ai/document-processing.ts (document processing)
 *
 * CONFIGURATION:
 * - next.config.js (Next.js configuration)
 * - tailwind.config.js (Tailwind configuration)
 * - postcss.config.js (PostCSS configuration)
 * - tsconfig.json (TypeScript configuration)
 */
