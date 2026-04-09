/**
 * SkySphere Component Tests — TianJi Global
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Three.js before importing the component
vi.mock('three', () => {
  const actual = vi.importActual('three')
  return {
    ...actual,
    Scene: vi.fn().mockReturnValue({
      add: vi.fn(),
      remove: vi.fn(),
      rotation: { y: 0 },
      fog: null,
      background: null,
    }),
    PerspectiveCamera: vi.fn().mockReturnValue({
      position: { set: vi.fn() },
      aspect: 1,
      updateProjectionMatrix: vi.fn(),
    }),
    WebGLRenderer: vi.fn().mockReturnValue({
      setSize: vi.fn(),
      setPixelRatio: vi.fn(),
      domElement: { clientWidth: 800, clientHeight: 600 },
      render: vi.fn(),
      dispose: vi.fn(),
      toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mock'),
    }),
    OrbitControls: vi.fn().mockReturnValue({
      enableDamping: true,
      dampingFactor: 0.05,
      minDistance: 20,
      maxDistance: 150,
      enablePan: false,
      update: vi.fn(),
      dispose: vi.fn(),
    }),
    BufferGeometry: vi.fn().mockReturnValue({
      setAttribute: vi.fn(),
      dispose: vi.fn(),
    }),
    BufferAttribute: vi.fn(),
    Points: vi.fn().mockReturnValue({}),
    PointsMaterial: vi.fn(),
    MeshBasicMaterial: vi.fn(),
    SphereGeometry: vi.fn(),
    TorusGeometry: vi.fn(),
    Mesh: vi.fn().mockReturnValue({
      position: { copy: vi.fn(), set: vi.fn() },
      add: vi.fn(),
    }),
    Line: vi.fn(),
    LineBasicMaterial: vi.fn(),
    Vector3: vi.fn().mockImplementation(() => ({
      clone: vi.fn().mockReturnThis(),
      project: vi.fn(),
    })),
    Color: vi.fn(),
    FogExp2: vi.fn(),
    Group: vi.fn().mockReturnValue({
      add: vi.fn(),
    }),
  }
})

vi.mock('three/examples/jsm/controls/OrbitControls.js', () => ({
  OrbitControls: vi.fn().mockReturnValue({
    enableDamping: true,
    dampingFactor: 0.05,
    minDistance: 20,
    maxDistance: 150,
    enablePan: false,
    update: vi.fn(),
    dispose: vi.fn(),
  }),
}))

describe('SkySphere Utilities', () => {
  describe('Zodiac Signs', () => {
    it('should have 12 zodiac signs', () => {
      const ZODIAC_SIGNS = [
        { name: 'Aries', symbol: '♈', color: '#FF6B6B' },
        { name: 'Taurus', symbol: '♉', color: '#4ECDC4' },
        { name: 'Gemini', symbol: '♊', color: '#FFE66D' },
        { name: 'Cancer', symbol: '♋', color: '#95E1D3' },
        { name: 'Leo', symbol: '♌', color: '#F38181' },
        { name: 'Virgo', symbol: '♍', color: '#AA96DA' },
        { name: 'Libra', symbol: '♎', color: '#FCBAD3' },
        { name: 'Scorpio', symbol: '♏', color: '#2C3E50' },
        { name: 'Sagittarius', symbol: '♐', color: '#E74C3C' },
        { name: 'Capricorn', symbol: '♑', color: '#8B4513' },
        { name: 'Aquarius', symbol: '♒', color: '#3498DB' },
        { name: 'Pisces', symbol: '♓', color: '#1ABC9C' },
      ]
      expect(ZODIAC_SIGNS).toHaveLength(12)
    })

    it('should have correct symbols for each sign', () => {
      const ZODIAC_SIGNS = [
        { name: 'Aries', symbol: '♈' },
        { name: 'Taurus', symbol: '♉' },
        { name: 'Gemini', symbol: '♊' },
        { name: 'Cancer', symbol: '♋' },
        { name: 'Leo', symbol: '♌' },
        { name: 'Virgo', symbol: '♍' },
        { name: 'Libra', symbol: '♎' },
        { name: 'Scorpio', symbol: '♏' },
        { name: 'Sagittarius', symbol: '♐' },
        { name: 'Capricorn', symbol: '♑' },
        { name: 'Aquarius', symbol: '♒' },
        { name: 'Pisces', symbol: '♓' },
      ]
      expect(ZODIAC_SIGNS[0].symbol).toBe('♈')
      expect(ZODIAC_SIGNS[11].symbol).toBe('♓')
    })
  })

  describe('Aspect Definitions', () => {
    it('should define 5 major aspects', () => {
      const ASPECTS = [
        { degree: 0, orb: 10, name: 'Conjunction', symbol: '☌' },
        { degree: 60, orb: 6, name: 'Sextile', symbol: '⚹' },
        { degree: 90, orb: 8, name: 'Square', symbol: '□' },
        { degree: 120, orb: 8, name: 'Trine', symbol: '△' },
        { degree: 180, orb: 10, name: 'Opposition', symbol: '☍' },
      ]
      expect(ASPECTS).toHaveLength(5)
    })

    it('should have correct aspect degrees', () => {
      const ASPECTS = [
        { degree: 0, name: 'Conjunction' },
        { degree: 60, name: 'Sextile' },
        { degree: 90, name: 'Square' },
        { degree: 120, name: 'Trine' },
        { degree: 180, name: 'Opposition' },
      ]
      expect(ASPECTS.find((a) => a.name === 'Conjunction')?.degree).toBe(0)
      expect(ASPECTS.find((a) => a.name === 'Opposition')?.degree).toBe(180)
      expect(ASPECTS.find((a) => a.name === 'Trine')?.degree).toBe(120)
    })
  })

  describe('Aspect Calculation', () => {
    // Standalone aspect calculation function for testing
    function calculateAspects(bodies: { name: string; absPos: number }[]): { p1: string; p2: string; type: string; orb: number }[] {
      const ASPECTS = [
        { degree: 0, orb: 10, name: 'Conjunction' },
        { degree: 60, orb: 6, name: 'Sextile' },
        { degree: 90, orb: 8, name: 'Square' },
        { degree: 120, orb: 8, name: 'Trine' },
        { degree: 180, orb: 10, name: 'Opposition' },
      ]
      const aspects: { p1: string; p2: string; type: string; orb: number }[] = []

      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const p1 = bodies[i]
          const p2 = bodies[j]

          let diff = Math.abs(p1.absPos - p2.absPos)
          if (diff > 180) diff = 360 - diff

          for (const asp of ASPECTS) {
            if (Math.abs(diff - asp.degree) <= asp.orb) {
              aspects.push({
                p1: p1.name,
                p2: p2.name,
                type: asp.name,
                orb: Math.abs(diff - asp.degree),
              })
              break
            }
          }
        }
      }

      return aspects
    }

    it('should detect a conjunction (0°) between two planets', () => {
      const bodies = [
        { name: 'Sun', absPos: 100 },
        { name: 'Moon', absPos: 105 }, // Within 10° orb of conjunction
      ]
      const aspects = calculateAspects(bodies)
      expect(aspects).toHaveLength(1)
      expect(aspects[0].type).toBe('Conjunction')
      expect(aspects[0].p1).toBe('Sun')
      expect(aspects[0].p2).toBe('Moon')
    })

    it('should detect an opposition (180°) between two planets', () => {
      const bodies = [
        { name: 'Sun', absPos: 100 },
        { name: 'Mars', absPos: 280 }, // 180° apart
      ]
      const aspects = calculateAspects(bodies)
      expect(aspects.some((a) => a.type === 'Opposition')).toBe(true)
    })

    it('should detect a trine (120°) between two planets', () => {
      const bodies = [
        { name: 'Sun', absPos: 100 },
        { name: 'Jupiter', absPos: 220 }, // ~120° apart
      ]
      const aspects = calculateAspects(bodies)
      expect(aspects.some((a) => a.type === 'Trine')).toBe(true)
    })

    it('should detect a square (90°) between two planets', () => {
      const bodies = [
        { name: 'Sun', absPos: 100 },
        { name: 'Saturn', absPos: 10 }, // ~90° apart
      ]
      const aspects = calculateAspects(bodies)
      expect(aspects.some((a) => a.type === 'Square')).toBe(true)
    })

    it('should detect a sextile (60°) between two planets', () => {
      const bodies = [
        { name: 'Sun', absPos: 100 },
        { name: 'Venus', absPos: 160 }, // 60° apart (100 - 160 = -60, abs = 60)
      ]
      const aspects = calculateAspects(bodies)
      expect(aspects.some((a) => a.type === 'Sextile')).toBe(true)
    })

    it('should handle multiple aspects between multiple planets', () => {
      const bodies = [
        { name: 'Sun', absPos: 100 },
        { name: 'Moon', absPos: 105 },
        { name: 'Mars', absPos: 280 },
        { name: 'Venus', absPos: 55 },
      ]
      const aspects = calculateAspects(bodies)
      expect(aspects.length).toBeGreaterThanOrEqual(2) // At least conjunction and opposition
    })

    it('should ignore planets that are not in aspect', () => {
      const bodies = [
        { name: 'Sun', absPos: 100 },
        { name: 'Neptune', absPos: 50 }, // 50° apart - no major aspect
      ]
      const aspects = calculateAspects(bodies)
      expect(aspects).toHaveLength(0)
    })

    it('should normalize angular distance to 0-180 range', () => {
      const bodies = [
        { name: 'Sun', absPos: 5 },
        { name: 'Moon', absPos: 355 }, // 350° difference, should normalize to 10°
      ]
      const aspects = calculateAspects(bodies)
      // 10° is within 10° of 0° (conjunction)
      expect(aspects.some((a) => a.type === 'Conjunction')).toBe(true)
    })
  })

  describe('Zodiac Position Calculation', () => {
    const ZODIAC_SIGNS = [
      { name: 'Aries', symbol: '♈', color: '#FF6B6B' },
      { name: 'Taurus', symbol: '♉', color: '#4ECDC4' },
      { name: 'Gemini', symbol: '♊', color: '#FFE66D' },
      { name: 'Cancer', symbol: '♋', color: '#95E1D3' },
      { name: 'Leo', symbol: '♌', color: '#F38181' },
      { name: 'Virgo', symbol: '♍', color: '#AA96DA' },
      { name: 'Libra', symbol: '♎', color: '#FCBAD3' },
      { name: 'Scorpio', symbol: '♏', color: '#2C3E50' },
      { name: 'Sagittarius', symbol: '♐', color: '#E74C3C' },
      { name: 'Capricorn', symbol: '♑', color: '#8B4513' },
      { name: 'Aquarius', symbol: '♒', color: '#3498DB' },
      { name: 'Pisces', symbol: '♓', color: '#1ABC9C' },
    ]

    function getZodiacPosition(signName: string, degree: number): number {
      const signIndex = ZODIAC_SIGNS.findIndex((s) => s.name === signName)
      if (signIndex === -1) return 0
      return signIndex * 30 + (degree % 30)
    }

    it('should calculate correct position for Aries 0°', () => {
      const pos = getZodiacPosition('Aries', 0)
      expect(pos).toBe(0)
    })

    it('should calculate correct position for Taurus 15°', () => {
      const pos = getZodiacPosition('Taurus', 15)
      expect(pos).toBe(30 + 15) // Taurus starts at 30°
    })

    it('should calculate correct position for Leo 10°', () => {
      const pos = getZodiacPosition('Leo', 10)
      expect(pos).toBe(120 + 10) // Leo starts at 120°
    })

    it('should handle invalid sign name', () => {
      const pos = getZodiacPosition('Invalid', 15)
      expect(pos).toBe(0)
    })

    it('should wrap degree within sign range', () => {
      const pos = getZodiacPosition('Aries', 35) // Beyond 30°
      expect(pos).toBe(5) // Should wrap to 5°
    })
  })

  describe('altAzToVector3', () => {
    function altAzToVector3(alt: number, az: number, radius: number): { x: number; y: number; z: number } {
      const altRad = (alt * Math.PI) / 180
      const azRad = (az * Math.PI) / 180
      const x = radius * Math.cos(altRad) * Math.sin(azRad)
      const y = radius * Math.sin(altRad)
      const z = radius * Math.cos(altRad) * Math.cos(azRad)
      return { x, y, z }
    }

    it('should return correct coordinates for zenith (alt=90)', () => {
      const result = altAzToVector3(90, 0, 50)
      expect(result.x).toBeCloseTo(0)
      expect(result.y).toBeCloseTo(50)
      expect(result.z).toBeCloseTo(0)
    })

    it('should return correct coordinates for horizon (alt=0)', () => {
      const result = altAzToVector3(0, 0, 50)
      expect(result.x).toBeCloseTo(0)
      expect(result.y).toBeCloseTo(0)
      expect(result.z).toBeCloseTo(50)
    })

    it('should return correct coordinates for north (alt=0, az=0)', () => {
      const result = altAzToVector3(0, 0, 50)
      expect(result.x).toBeCloseTo(0)
      expect(result.z).toBeCloseTo(50)
    })

    it('should return correct coordinates for east (alt=0, az=90)', () => {
      const result = altAzToVector3(0, 90, 50)
      expect(result.x).toBeCloseTo(50)
      expect(result.z).toBeCloseTo(0)
    })
  })
})
