# Circular Dependencies Guide

## What are Circular Dependencies?

Circular dependencies occur when two or more modules depend on each other, either directly or indirectly. For example:

\`\`\`javascript
// fileA.js
import { functionB } from './fileB';

export function functionA() {
  return functionB() + 1;
}

// fileB.js
import { functionA } from './fileA';

export function functionB() {
  return functionA() + 1;
}
\`\`\`

This creates an infinite loop of dependencies that can cause:
- Unexpected behavior
- Initialization issues
- Runtime errors
- Harder-to-maintain code

## How to Detect Circular Dependencies

### Using ESLint

We've configured ESLint with the `eslint-plugin-import` to automatically detect circular dependencies:

\`\`\`bash
npm run lint
\`\`\`

### Using Madge

For a visual representation of circular dependencies:

\`\`\`bash
npm run find-cycles
\`\`\`

## How to Fix Circular Dependencies

1. **Extract Shared Logic**: Move shared code to a separate module that both dependent modules can import.

2. **Restructure Modules**: Reorganize your code to follow a clear hierarchy.

3. **Use Dependency Injection**: Pass dependencies as parameters rather than importing them directly.

4. **Interface Segregation**: Split large interfaces into smaller, more focused ones.

5. **Lazy Loading**: In some cases, you can use dynamic imports to break cycles.

## Best Practices for Import Structure

1. **Follow a Clear Hierarchy**:
   - Core utilities (no dependencies)
   - Database adapters (depend on core)
   - Business logic (depends on database and core)
   - UI components (depend on business logic)

2. **Use Consistent Import Patterns**:
   - Within a directory: Use relative imports (`./file-name`)
   - Across directories: Use absolute imports with aliases (`@/directory/file-name`)

3. **Barrel Files Strategy**:
   - Use index files to expose a public API
   - Keep implementation details private
   - Consider submodule barrel files for complex directories
