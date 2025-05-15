/**
 * Files to be removed from the project
 *
 * DUPLICATE API ROUTES:
 * - app/api/test-db-connection/route.ts (redundant with health check)
 * - app/api/test-supabase/route.ts (redundant with health check)
 * - app/api/test-openai/route.ts (redundant with health check)
 * - app/api/test-pinecone/route.ts (redundant with health check)
 * - app/api/test-embeddings/route.ts (redundant with health check)
 * - app/api/health-simple/route.ts (redundant with main health check)
 *
 * ADMIN ROUTES (duplicated functionality):
 * - app/admin/page.tsx (functionality available in main dashboard)
 * - app/admin/document/[id]/page.tsx (can be handled via modal in main dashboard)
 * - app/admin/settings/page.tsx (can be consolidated into settings tab)
 * - app/admin/layout.tsx (unnecessary with consolidated dashboard)
 * - components/admin/sidebar.tsx (unnecessary with consolidated dashboard)
 * - components/admin/document-detail-view.tsx (can be handled via modal)
 * - components/admin/document-preview.tsx (duplicates functionality)
 * - components/admin/admin-dashboard.tsx (redundant with main dashboard)
 * - components/admin/batch-upload.tsx (can be consolidated into upload tab)
 * - components/admin/settings-form.tsx (can be consolidated into settings tab)
 *
 * SEPARATE PAGE ROUTES (now consolidated):
 * - app/documents/page.tsx (can be a tab in main dashboard)
 * - app/search/page.tsx (can be a tab in main dashboard)
 * - app/search/loading.tsx (unnecessary with consolidated dashboard)
 * - app/upload/page.tsx (can be a tab in main dashboard)
 * - app/upload/client-wrapper.tsx (unnecessary wrapper)
 * - app/upload/loading.tsx (unnecessary with consolidated dashboard)
 * - app/feedback/page.tsx (can be a tab in main dashboard)
 * - app/dashboard/page.tsx (redundant with main page)
 *
 * DUPLICATE UTILITY FILES:
 * - lib/pinecone-client.ts (consolidate into one pinecone utility)
 * - lib/pinecone-setup.ts (consolidate into one pinecone utility)
 * - lib/ai-sdk.ts (consolidate AI functionality)
 * - lib/test-embeddings.ts (unnecessary test file)
 * - lib/document-processor.ts (consolidate document processing)
 * - lib/server-pdf-processor.ts (consolidate document processing)
 * - lib/env-check.ts (redundant environment checking)
 * - lib/env-checker.ts (redundant environment checking)
 * - lib/backend-connection.ts (unnecessary abstraction)
 * - lib/db.ts (redundant with supabase client)
 * - lib/supabase/api-client.ts (redundant with supabase client)
 *
 * UNUSED COMPONENTS:
 * - components/dashboard-layout.tsx (unnecessary with consolidated dashboard)
 * - components/dashboard-layout-container.tsx (unnecessary with consolidated dashboard)
 * - components/dashboard/dashboard-header.tsx (unnecessary with consolidated dashboard)
 * - components/dashboard/service-tester.tsx (functionality in system status)
 * - components/dashboard/upload-button.tsx (functionality in upload tab)
 * - app/not-found-config.js (unnecessary configuration)
 * - components/standalone-error-boundary.tsx (redundant error handling)
 * - components/error-boundary.tsx (redundant error handling)
 * - project-structure.ts (meta file, not needed in production)
 * - files-to-remove.ts (meta file, not needed in production)
 */
