/**
 * DOM API Polyfills for Server Environment
 *
 * This file provides minimal implementations of DOM APIs that might be
 * referenced in server-side code but are only available in browser environments.
 */

// Only apply polyfills in a Node.js environment
if (typeof window === "undefined") {
  // DOMMatrix polyfill
  if (typeof globalThis.DOMMatrix === "undefined") {
    class DOMMatrixPolyfill {
      a = 1
      b = 0
      c = 0
      d = 1
      e = 0
      f = 0
      m11 = 1
      m12 = 0
      m13 = 0
      m14 = 0
      m21 = 0
      m22 = 1
      m23 = 0
      m24 = 0
      m31 = 0
      m32 = 0
      m33 = 1
      m34 = 0
      m41 = 0
      m42 = 0
      m43 = 0
      m44 = 1
      is2D = true
      isIdentity = true

      constructor(transform?: string | number[]) {
        // Simple no-op constructor
      }

      // Add minimal required methods
      translate() {
        return this
      }
      scale() {
        return this
      }
      multiply() {
        return this
      }
      inverse() {
        return this
      }
      transformPoint() {
        return { x: 0, y: 0, z: 0, w: 1 }
      }
    }

    // @ts-ignore - Adding to global
    globalThis.DOMMatrix = DOMMatrixPolyfill
  }

  // Add other DOM polyfills as needed
  if (typeof globalThis.DOMPoint === "undefined") {
    class DOMPointPolyfill {
      x = 0
      y = 0
      z = 0
      w = 1

      constructor(x = 0, y = 0, z = 0, w = 1) {
        this.x = x
        this.y = y
        this.z = z
        this.w = w
      }
    }

    // @ts-ignore - Adding to global
    globalThis.DOMPoint = DOMPointPolyfill
  }
}

// Export a dummy function to make this a valid module
export function ensureDomPolyfills() {
  // This function just ensures the polyfills are applied
  // It doesn't need to do anything as the polyfills are applied when the module is imported
}
