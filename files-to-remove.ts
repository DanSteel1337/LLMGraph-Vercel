/**
 * Files to be removed from the project
 *
 * 1. Duplicate API routes:
 *    - app/api/test-db-connection/route.ts (consolidated into health check)
 *    - app/api/test-supabase/route.ts (consolidated into health check)
 *    - app/api/test-openai/route.ts (consolidated into health check)
 *    - app/api/test-pinecone/route.ts (consolidated into health check)
 *    - app/api/test-embeddings/route.ts (consolidated into health check)
 *    - app/api/health-simple/route.ts (consolidated into health check)
 *
 * 2. Admin routes (now consolidated into main dashboard):
 *    - app/admin/page.tsx
 *    - app/admin/document/[id]/page.tsx
 *    - app/admin/settings/page.tsx
 *    - app/admin/layout.tsx
 *    - components/admin/sidebar.tsx
 *    - components/admin/document-detail-view.tsx
 *    - components/admin/document-preview.tsx
 *    - components/admin/admin-dashboard.tsx
 *    - components/admin/batch-upload.tsx
 *    - components/admin/settings-form.tsx
 *
 * 3. Separate page routes (now consolidated into main dashboard):
 *    - app/documents/page.tsx
 *    - app/search/page.tsx
 *    - app/search/loading.tsx
 *    - app/upload/page.tsx
 *    - app/upload/client-wrapper.tsx
 *    - app/upload/loading.tsx
 *    - app/feedback/page.tsx
 *    - app/dashboard/page.tsx
 *
 * 4. Duplicate utility files:
 *    - lib/pinecone-client.ts (moved to lib/pinecone/client.ts)
 *    - lib/pinecone-setup.ts (consolidated into lib/pinecone/client.ts)
 *    - lib/ai-sdk.ts (split into lib/ai/* files)
 *    - lib/test-embeddings.ts (functionality moved to lib/ai/embeddings.ts)
 *    - lib/document-processor.ts (moved to lib/ai/document-processing.ts)
 *    - lib/server-pdf-processor.ts (consolidated into lib/ai/document-processing.ts)
 *    - lib/env-check.ts (consolidated into lib/utils.ts)
 *    - lib/env-checker.ts (consolidated into lib/utils.ts)
 *    - lib/backend-connection.ts (consolidated into lib/utils.ts)
 *    - lib/db.ts (consolidated into lib/supabase/client.ts)
 *    - lib/supabase/api-client.ts (consolidated into lib/supabase/client.ts)
 *
 * 5. Unused components:
 *    - components/dashboard-layout.tsx (functionality moved to app/page.tsx)
 *    - components/dashboard-layout-container.tsx (functionality moved to app/page.tsx)
 *    - components/dashboard/dashboard-header.tsx (no longer needed with tabbed interface)
 *    - components/dashboard/service-tester.tsx (consolidated into SystemStatus component)
 *    - components/dashboard/upload-button.tsx (functionality available in Upload tab)
 *    - app/not-found-config.js (functionality moved to app/not-found.tsx)
 *    - components/standalone-error-boundary.tsx (replaced by app/error.tsx)
 *    - components/error-boundary.tsx (replaced by app/error.tsx)
 */
