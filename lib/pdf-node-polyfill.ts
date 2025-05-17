// PDF.js Node.js polyfill
// This file provides polyfills for browser APIs used by PDF.js in Node.js environment

// Polyfill for DOMMatrix
if (typeof global !== "undefined" && typeof global.DOMMatrix === "undefined") {
  // Simple DOMMatrix polyfill for Node.js
  class DOMMatrixPolyfill {
    a: number
    b: number
    c: number
    d: number
    e: number
    f: number
    m11: number
    m12: number
    m13: number
    m14: number
    m21: number
    m22: number
    m23: number
    m24: number
    m31: number
    m32: number
    m33: number
    m34: number
    m41: number
    m42: number
    m43: number
    m44: number
    is2D: boolean
    isIdentity: boolean

    constructor(init?: string | number[]) {
      // Initialize with identity matrix
      this.a = 1
      this.b = 0
      this.c = 0
      this.d = 1
      this.e = 0
      this.f = 0
      this.m11 = 1
      this.m12 = 0
      this.m13 = 0
      this.m14 = 0
      this.m21 = 0
      this.m22 = 1
      this.m23 = 0
      this.m24 = 0
      this.m31 = 0
      this.m32 = 0
      this.m33 = 1
      this.m34 = 0
      this.m41 = 0
      this.m42 = 0
      this.m43 = 0
      this.m44 = 1
      this.is2D = true
      this.isIdentity = true

      // Handle initialization if provided
      if (init) {
        if (typeof init === "string") {
          // Parse string initialization (simplified)
          console.warn("DOMMatrix string initialization not fully implemented in polyfill")
        } else if (Array.isArray(init)) {
          // Handle array initialization
          if (init.length === 6) {
            // 2D matrix
            ;[this.a, this.b, this.c, this.d, this.e, this.f] = init
            this.m11 = this.a
            this.m12 = this.b
            this.m21 = this.c
            this.m22 = this.d
            this.m41 = this.e
            this.m42 = this.f
            this.is2D = true
            this.isIdentity = false
          } else if (init.length === 16) {
            // 3D matrix
            ;[
              this.m11,
              this.m12,
              this.m13,
              this.m14,
              this.m21,
              this.m22,
              this.m23,
              this.m24,
              this.m31,
              this.m32,
              this.m33,
              this.m34,
              this.m41,
              this.m42,
              this.m43,
              this.m44,
            ] = init
            this.a = this.m11
            this.b = this.m12
            this.c = this.m21
            this.d = this.m22
            this.e = this.m41
            this.f = this.m42
            this.is2D = false
            this.isIdentity = false
          }
        }
      }
    }

    // Add minimal required methods
    multiply(other: DOMMatrixPolyfill): DOMMatrixPolyfill {
      // Simplified implementation
      console.warn("DOMMatrix multiply not fully implemented in polyfill")
      return new DOMMatrixPolyfill()
    }

    inverse(): DOMMatrixPolyfill {
      // Simplified implementation
      console.warn("DOMMatrix inverse not fully implemented in polyfill")
      return new DOMMatrixPolyfill()
    }

    translate(tx: number, ty: number, tz = 0): DOMMatrixPolyfill {
      // Simplified implementation
      console.warn("DOMMatrix translate not fully implemented in polyfill")
      return new DOMMatrixPolyfill()
    }

    scale(sx: number, sy: number = sx, sz = 1): DOMMatrixPolyfill {
      // Simplified implementation
      console.warn("DOMMatrix scale not fully implemented in polyfill")
      return new DOMMatrixPolyfill()
    }

    rotate(angle: number): DOMMatrixPolyfill {
      // Simplified implementation
      console.warn("DOMMatrix rotate not fully implemented in polyfill")
      return new DOMMatrixPolyfill()
    }

    transformPoint(point: { x: number; y: number; z?: number }): { x: number; y: number; z: number } {
      // Simplified implementation
      console.warn("DOMMatrix transformPoint not fully implemented in polyfill")
      return { x: point.x, y: point.y, z: point.z || 0 }
    }
  }
  // Assign the polyfill to global
  ;(global as any).DOMMatrix = DOMMatrixPolyfill
}

// Add other browser API polyfills as needed
// For example: DOMRect, Path2D, etc.

export {} // Make this a module
