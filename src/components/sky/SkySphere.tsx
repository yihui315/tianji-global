'use client'
import { useEffect, useRef, useCallback, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// Zodiac signs with colors and symbols
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

// Aspect definitions (degree, orb tolerance, color, name)
const ASPECTS = [
  { degree: 0, orb: 10, color: 0xFFFF00, name: 'Conjunction', symbol: '☌' },
  { degree: 60, orb: 6, color: 0x00FF00, name: 'Sextile', symbol: '⚹' },
  { degree: 90, orb: 8, color: 0xFF0000, name: 'Square', symbol: '□' },
  { degree: 120, orb: 8, color: 0x00FF00, name: 'Trine', symbol: '△' },
  { degree: 180, orb: 10, color: 0xFF00FF, name: 'Opposition', symbol: '☍' },
]

interface PlanetData {
  name: string
  nameZh?: string
  alt: number
  az: number
  sign?: string
  signName?: string
  absPos?: number // absolute zodiac position (0-360)
}

interface SkyData {
  sun: { alt: number; az: number; sign: string; signName: string; absPos?: number }
  moon: { alt: number; az: number; phase: number; sign: string; signName: string; absPos?: number }
  planets: PlanetData[]
}

interface Aspect {
  p1: string
  p2: string
  type: string
  degree: number
  orb: number
  color: number
  symbol: string
}

interface SkySphereProps {
  skyData: SkyData
  date: Date
  onShare?: (dataUrl: string) => void
}

function altAzToVector3(alt: number, az: number, radius: number): THREE.Vector3 {
  const altRad = (alt * Math.PI) / 180
  const azRad = (az * Math.PI) / 180
  const x = radius * Math.cos(altRad) * Math.sin(azRad)
  const y = radius * Math.sin(altRad)
  const z = radius * Math.cos(altRad) * Math.cos(azRad)
  return new THREE.Vector3(x, y, z)
}

// Calculate aspects between all planets
function calculateAspects(bodies: { name: string; absPos: number }[]): Aspect[] {
  const aspects: Aspect[] = []

  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const p1 = bodies[i]
      const p2 = bodies[j]

      // Calculate angular distance (0-180)
      let diff = Math.abs(p1.absPos - p2.absPos)
      if (diff > 180) diff = 360 - diff

      for (const asp of ASPECTS) {
        if (Math.abs(diff - asp.degree) <= asp.orb) {
          aspects.push({
            p1: p1.name,
            p2: p2.name,
            type: asp.name,
            degree: asp.degree,
            orb: Math.abs(diff - asp.degree),
            color: asp.color,
            symbol: asp.symbol,
          })
          break
        }
      }
    }
  }

  return aspects
}

// Convert zodiac position to 3D position on the zodiac ring
function zodiacPosToVector3(absPos: number, radius: number): THREE.Vector3 {
  // Convert zodiac position (0-360) to azimuth for the ring
  // Aries 0° starts at a specific point, we align it with the celestial coordinate system
  const azRad = ((absPos - 90) * Math.PI) / 180 // Rotate so Aries is at top
  const alt = 0 // On the equatorial plane for the zodiac ring
  return altAzToVector3(alt, azRad, radius)
}

function createStarTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)')
  gradient.addColorStop(0.5, 'rgba(200,220,255,0.3)')
  gradient.addColorStop(1, 'rgba(100,150,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(canvas)
}

function createGlowTexture(color: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  gradient.addColorStop(0, color)
  gradient.addColorStop(0.3, color.replace('1)', '0.6)'))
  gradient.addColorStop(0.7, color.replace('1)', '0.2)'))
  gradient.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(canvas)
}

// Create a zodiac ring with 12 segments
function createZodiacRing(): THREE.Group {
  const group = new THREE.Group()
  const radius = 45
  const tubeRadius = 1.5

  // Main ring torus
  const torusGeo = new THREE.TorusGeometry(radius, tubeRadius, 16, 100)
  const torusMat = new THREE.MeshBasicMaterial({
    color: 0x334455,
    transparent: true,
    opacity: 0.6,
  })
  const torus = new THREE.Mesh(torusGeo, torusMat)
  group.add(torus)

  // Add zodiac sign markers at 30° intervals
  for (let i = 0; i < 12; i++) {
    const sign = ZODIAC_SIGNS[i]
    const angle = (i * 30 - 90) * (Math.PI / 180) // Start from top (Aries)
    const x = radius * Math.cos(angle)
    const z = radius * Math.sin(angle)

    // Sign marker (small sphere)
    const markerGeo = new THREE.SphereGeometry(0.8, 16, 16)
    const markerMat = new THREE.MeshBasicMaterial({ color: parseInt(sign.color.slice(1), 16) })
    const marker = new THREE.Mesh(markerGeo, markerMat)
    marker.position.set(x, 0, z)
    group.add(marker)
  }

  // Degree markers every 10 degrees
  for (let i = 0; i < 36; i++) {
    const angle = (i * 10 - 90) * (Math.PI / 180)
    const x = radius * Math.cos(angle)
    const z = radius * Math.sin(angle)

    const tickGeo = new THREE.BoxGeometry(0.1, 0.3, 0.1)
    const tickMat = new THREE.MeshBasicMaterial({ color: 0x556677, transparent: true, opacity: 0.5 })
    const tick = new THREE.Mesh(tickGeo, tickMat)
    tick.position.set(x, 0, z)
    tick.rotation.y = -angle + Math.PI / 2
    group.add(tick)
  }

  return group
}

// Create aspect lines between planets
function createAspectLines(
  aspects: Aspect[],
  bodyPositions: Map<string, THREE.Vector3>,
  scene: THREE.Scene
): THREE.Group[] {
  const lines: THREE.Group[] = []

  aspects.forEach((aspect) => {
    const pos1 = bodyPositions.get(aspect.p1)
    const pos2 = bodyPositions.get(aspect.p2)

    if (!pos1 || !pos2) return

    const points = [pos1.clone(), pos2.clone()]
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points)
    const lineMat = new THREE.LineBasicMaterial({
      color: aspect.color,
      transparent: true,
      opacity: 0.6,
      linewidth: 2,
    })
    const line = new THREE.Line(lineGeo, lineMat)
    lines.push(new THREE.Group())
    scene.add(line)
    lines[lines.length - 1].add(line)
  })

  return lines
}

export default function SkySphere({ skyData, date, onShare }: SkySphereProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const frameRef = useRef<number>(0)
  const celestialBodiesRef = useRef<{ mesh: THREE.Mesh; label: string; isSun?: boolean; name: string }[]>([])
  const zodiacRingRef = useRef<THREE.Group | null>(null)
  const aspectLinesRef = useRef<THREE.Group[]>([])
  const labelsRef = useRef<Map<string, HTMLDivElement>>(new Map())
  const [aspects, setAspects] = useState<Aspect[]>([])

  // Calculate zodiac position from sign name (e.g., "Aries" -> 0-30)
  const getZodiacPosition = (signName: string, index: number): number => {
    const signIndex = ZODIAC_SIGNS.findIndex((s) => s.name === signName)
    if (signIndex === -1) return index * 30
    return signIndex * 30 + (index % 30)
  }

  const updateCelestialBodies = useCallback(
    (data: SkyData) => {
      if (!sceneRef.current) return
      const scene = sceneRef.current

      // Remove old bodies
      celestialBodiesRef.current.forEach(({ mesh }) => {
        scene.remove(mesh)
        if (mesh.geometry) mesh.geometry.dispose()
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshBasicMaterial
          if (mat.map) mat.map.dispose()
          ;(mesh.material as THREE.Material).dispose()
        }
      })
      celestialBodiesRef.current = []

      // Remove old aspect lines
      aspectLinesRef.current.forEach((group) => {
        scene.remove(group)
      })
      aspectLinesRef.current = []

      // Clear old labels
      labelsRef.current.forEach((el) => el.remove())
      labelsRef.current.clear()

      const bodies: { mesh: THREE.Mesh; label: string; isSun?: boolean; name: string }[] = []
      const bodyPositions = new Map<string, THREE.Vector3>()
      const allBodies: { name: string; absPos: number }[] = []

      // Sun
      if (data.sun) {
        const sunPos = altAzToVector3(data.sun.alt, data.sun.az, 50)
        const sunGeo = new THREE.SphereGeometry(2.5, 32, 32)
        const sunMat = new THREE.MeshBasicMaterial({
          color: 0xFFDD44,
          transparent: true,
        })
        const sunMesh = new THREE.Mesh(sunGeo, sunMat)
        sunMesh.position.copy(sunPos)

        // Sun glow
        const sunGlowGeo = new THREE.SphereGeometry(3.5, 32, 32)
        const sunGlowMat = new THREE.MeshBasicMaterial({
          color: 0xFFAA00,
          transparent: true,
          opacity: 0.3,
        })
        const sunGlow = new THREE.Mesh(sunGlowGeo, sunGlowMat)
        sunMesh.add(sunGlow)

        scene.add(sunMesh)
        bodies.push({ mesh: sunMesh, label: `☀️ Sun ${data.sun.sign || ''}`, isSun: true, name: 'Sun' })
        bodyPositions.set('Sun', sunPos)

        const absPos = data.sun.absPos ?? getZodiacPosition(data.sun.signName || 'Aries', 15)
        allBodies.push({ name: 'Sun', absPos })
      }

      // Moon
      if (data.moon) {
        const moonPos = altAzToVector3(data.moon.alt, data.moon.az, 50)
        const moonGeo = new THREE.SphereGeometry(1.2, 32, 32)
        const moonMat = new THREE.MeshBasicMaterial({ color: 0xCCCCCC })
        const moonMesh = new THREE.Mesh(moonGeo, moonMat)
        moonMesh.position.copy(moonPos)
        scene.add(moonMesh)
        bodies.push({ mesh: moonMesh, label: `🌙 Moon ${data.moon.sign || ''}`, name: 'Moon' })
        bodyPositions.set('Moon', moonPos)

        const absPos = data.moon.absPos ?? getZodiacPosition(data.moon.signName || 'Cancer', 20)
        allBodies.push({ name: 'Moon', absPos })
      }

      // Planets
      const planetColors: Record<string, number> = {
        Mercury: 0xAAAAAA,
        Venus: 0xFFCCAA,
        Mars: 0xFF6644,
        Jupiter: 0xCCAA77,
        Saturn: 0xDDCC88,
        Uranus: 0x88CCDD,
        Neptune: 0x4466CC,
        Pluto: 0x884488,
      }

      data.planets?.forEach((planet) => {
        const pos = altAzToVector3(planet.alt, planet.az, 50)
        const geo = new THREE.SphereGeometry(0.8, 16, 16)
        const mat = new THREE.MeshBasicMaterial({
          color: planetColors[planet.name] || 0xFFFFFF,
        })
        const mesh = new THREE.Mesh(geo, mat)
        mesh.position.copy(pos)
        scene.add(mesh)

        const labelText = `${planet.nameZh || planet.name} ${planet.sign || ''}`
        bodies.push({ mesh, label: `🔮 ${labelText}`, name: planet.name })
        bodyPositions.set(planet.name, pos)

        const absPos = planet.absPos ?? getZodiacPosition(planet.signName || 'Aries', 15)
        allBodies.push({ name: planet.name, absPos })
      })

      celestialBodiesRef.current = bodies

      // Calculate and store aspects
      const calculatedAspects = calculateAspects(allBodies)
      setAspects(calculatedAspects)

      // Create aspect lines
      const aspectGroups = createAspectLines(calculatedAspects, bodyPositions, scene)
      aspectLinesRef.current = aspectGroups
    },
    []
  )

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000011)
    scene.fog = new THREE.FogExp2(0x000011, 0.003)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 10, 60)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 20
    controls.maxDistance = 150
    controls.enablePan = false
    controlsRef.current = controls

    // Stars - particle field with varying sizes
    const starCount = 10000
    const starPositions = new Float32Array(starCount * 3)
    const starSizes = new Float32Array(starCount)
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 80 + Math.random() * 20
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      starPositions[i * 3 + 2] = r * Math.cos(phi)
      starSizes[i] = 0.1 + Math.random() * 0.4
    }
    const starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    starGeo.setAttribute('size', new THREE.BufferAttribute(starSizes, 1))
    const starMat = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: 0.3,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
    })
    const stars = new THREE.Points(starGeo, starMat)
    scene.add(stars)

    // Brighter stars (fewer, bigger) - using PointsMaterial
    const brightCount = 800
    const brightPositions = new Float32Array(brightCount * 3)
    const brightSizes = new Float32Array(brightCount)
    for (let i = 0; i < brightCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 80 + Math.random() * 20
      brightPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      brightPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      brightPositions[i * 3 + 2] = r * Math.cos(phi)
      brightSizes[i] = 0.8 + Math.random() * 2.0
    }
    const brightGeo = new THREE.BufferGeometry()
    brightGeo.setAttribute('position', new THREE.BufferAttribute(brightPositions, 3))
    brightGeo.setAttribute('size', new THREE.BufferAttribute(brightSizes, 1))
    const brightMat = new THREE.PointsMaterial({
      color: 0xFFFAF0,
      size: 1.2,
      sizeAttenuation: true,
      transparent: true,
      opacity: 1,
    })
    const brightStars = new THREE.Points(brightGeo, brightMat)
    scene.add(brightStars)

    // Zodiac ring
    const zodiacRing = createZodiacRing()
    zodiacRingRef.current = zodiacRing
    scene.add(zodiacRing)

    // Grid lines (equator and meridians)
    const gridHelper = new THREE.Group()

    // Equator
    const equatorGeo = new THREE.BufferGeometry()
    const equatorPoints: number[] = []
    for (let i = 0; i <= 360; i += 2) {
      const rad = (i * Math.PI) / 180
      equatorPoints.push(80 * Math.cos(rad), 0, 80 * Math.sin(rad))
    }
    equatorGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(equatorPoints), 3))
    const equatorLine = new THREE.Line(
      equatorGeo,
      new THREE.LineBasicMaterial({ color: 0x223355, transparent: true, opacity: 0.3 })
    )
    gridHelper.add(equatorLine)

    // Meridian
    const meridGeo = new THREE.BufferGeometry()
    const meridPoints: number[] = []
    for (let i = 0; i <= 180; i += 2) {
      const rad = (i * Math.PI) / 180
      meridPoints.push(0, 80 * Math.cos(rad) - 80, 80 * Math.sin(rad))
    }
    meridGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(meridPoints), 3))
    const meridLine = new THREE.Line(
      meridGeo,
      new THREE.LineBasicMaterial({ color: 0x223355, transparent: true, opacity: 0.3 })
    )
    gridHelper.add(meridLine)

    scene.add(gridHelper)

    // Initial sky data
    if (skyData) {
      updateCelestialBodies(skyData)
    }

    // Animation loop
    let lastTime = 0
    const animate = (time: number) => {
      frameRef.current = requestAnimationFrame(animate)
      const delta = (time - lastTime) / 1000
      lastTime = time

      // Slow rotation of the entire sphere
      scene.rotation.y += 0.0001

      // Update label positions
      celestialBodiesRef.current.forEach((body) => {
        const labelEl = labelsRef.current.get(body.name)
        if (labelEl && cameraRef.current && rendererRef.current) {
          const canvas = rendererRef.current.domElement
          const vector = body.mesh.position.clone()
          vector.project(cameraRef.current)

          const x = ((vector.x + 1) / 2) * canvas.clientWidth
          const y = ((-vector.y + 1) / 2) * canvas.clientHeight

          labelEl.style.left = `${x}px`
          labelEl.style.top = `${y}px`
          labelEl.style.opacity = '1'
        }
      })

      controls.update()
      renderer.render(scene, camera)
    }
    frameRef.current = requestAnimationFrame(animate)

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return
      const w = containerRef.current.clientWidth
      const h = containerRef.current.clientHeight
      cameraRef.current.aspect = w / h
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', handleResize)
      controls.dispose()
      renderer.dispose()
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [updateCelestialBodies])

  // Update celestial bodies when skyData changes
  useEffect(() => {
    if (skyData) {
      updateCelestialBodies(skyData)
    }
  }, [skyData, updateCelestialBodies])

  // Share function
  const handleShare = useCallback(() => {
    if (rendererRef.current && onShare) {
      const dataUrl = rendererRef.current.domElement.toDataURL('image/png')
      onShare(dataUrl)
    }
  }, [onShare])

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      {/* Celestial body labels */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {celestialBodiesRef.current.map((body) => (
          <div
            key={body.name}
            ref={(el) => {
              if (el) labelsRef.current.set(body.name, el)
            }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 px-2 py-1 bg-black/60 text-white text-xs rounded whitespace-nowrap pointer-events-none"
            style={{ opacity: 0 }}
          >
            {body.label}
          </div>
        ))}
      </div>
      {/* Aspect legend */}
      {aspects.length > 0 && (
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md rounded-lg p-3 text-xs max-w-xs">
          <h4 className="text-white font-bold mb-2">🔗 Aspects ({aspects.length})</h4>
          <div className="space-y-1">
            {aspects.slice(0, 5).map((asp, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-300">
                <span style={{ color: `#${asp.color.toString(16).padStart(6, '0')}` }}>
                  {asp.symbol}
                </span>
                <span>
                  {asp.p1} {asp.type} {asp.p2}
                </span>
                <span className="text-slate-500">({asp.orb.toFixed(1)}°)</span>
              </div>
            ))}
            {aspects.length > 5 && (
              <div className="text-slate-500">+{aspects.length - 5} more aspects</div>
            )}
          </div>
        </div>
      )}
      {/* Share button */}
      <button
        onClick={handleShare}
        className="absolute top-4 right-4 px-4 py-2 bg-indigo-900/80 text-white rounded-lg text-sm hover:bg-indigo-800/80 transition-colors"
      >
        📸 Share
      </button>
    </div>
  )
}
