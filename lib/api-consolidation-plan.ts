/**
 * API Consolidation Plan for UE-RAG Dashboard
 *
 * This file outlines the plan to consolidate and simplify the API structure
 * of the UE-RAG Dashboard application.
 */

export const currentStructure = {
  apiRoutes: {
    analytics: [
      "app/api/analytics/search/route.ts",
      "app/api/analytics/vectors/route.ts",
      "app/api/analytics/track-search/route.ts",
    ],
    auth: ["app/api/auth/callback/route.ts"],
    diagnostics: ["app/api/diagnostics/supabase/route.ts", "app/api/diagnostics/pinecone/route.ts"],
    documents: [
      "app/api/documents/route.ts",
      "app/api/documents/[id]/route.ts",
      "app/api/documents/[id]/chunks/route.ts",
      "app/api/documents/[id]/vectors/route.ts",
    ],
    feedback: [
      "app/api/feedback/route.ts",
      "app/api/feedback/[id]/route.ts",
      "app/api/feedback/submit/route.ts",
      "app/api/feedback/stats/route.ts",
    ],
    health: ["app/api/health/route.ts"],
    processPdf: ["app/api/process-pdf/route.ts"],
    search: ["app/api/search/route.ts", "app/api/search/trends/route.ts"],
    stats: ["app/api/stats/route.ts"],
  },
  pages: [
    "app/documents/page.tsx",
    "app/login/page.tsx",
    "app/upload/page.tsx",
    "app/verify-login/page.tsx",
    "app/page.tsx",
  ],
  errorPages: ["app/error.tsx", "app/global-error.tsx", "app/not-found.tsx", "app/loading.tsx"],
}

export const proposedStructure = {
  apiRoutes: {
    // Consolidated API routes
    documents: [
      "app/api/documents/route.ts", // GET, POST, PUT, DELETE operations
    ],
    search: [
      "app/api/search/route.ts", // All search operations including trends
    ],
    analytics: [
      "app/api/analytics/route.ts", // All analytics operations
    ],
    system: [
      "app/api/system/route.ts", // Health, diagnostics, stats
    ],
    feedback: [
      "app/api/feedback/route.ts", // All feedback operations
    ],
    auth: [
      "app/api/auth/route.ts", // All auth operations including callback
    ],
  },
  pages: [
    "app/page.tsx", // Main dashboard with tabs for all functionality
    "app/login/page.tsx", // Login page
  ],
  errorPages: ["app/error.tsx", "app/not-found.tsx", "app/loading.tsx"],
}

export const consolidationBenefits = [
  "Reduced file count from 30+ to ~10 files",
  "Simplified navigation and maintenance",
  "Centralized error handling and validation",
  "Consistent API patterns across the application",
  "Easier onboarding for new developers",
  "Reduced bundle size and improved performance",
]

export const implementationPlan = [
  "Phase 1: Consolidate API routes by functionality",
  "Phase 2: Implement unified dashboard with tabs",
  "Phase 3: Standardize error handling and validation",
  "Phase 4: Remove redundant files and update imports",
  "Phase 5: Document the new structure and patterns",
]
