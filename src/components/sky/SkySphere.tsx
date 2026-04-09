'use client'
import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

interface PlanetData {
  name: string
  alt: number
  az: number
  sign?: string
}

interface SkyData {
  sun: { alt: number; az: number }
  moon: { alt: number; az: number; phase: number }
  planets: PlanetData[]
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

export default function SkySphere({ skyData, date, onShare }: SkySphereProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const frameRef = useRef<number>(0)
  const celestialBodiesRef = useRef<{ mesh: THREE.Mesh; label: string; isSun?: boolean }[]>([])

  const updateCelestialBodies = useCallback((data: SkyData) => {
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

    const bodies: { mesh: THREE.Mesh; label: string; isSun?: boolean }[] = []

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
      bodies.push({ mesh: sunMesh, label: '☀️ Sun', isSun: true })
    }

    // Moon
    if (data.moon) {
      const moonPos = altAzToVector3(data.moon.alt, data.moon.az, 50)
      const moonGeo = new THREE.SphereGeometry(1.2, 32, 32)
      const moonMat = new THREE.MeshBasicMaterial({ color: 0xCCCCCC })
      const moonMesh = new THREE.Mesh(moonGeo, moonMat)
      moonMesh.position.copy(moonPos)
      scene.add(moonMesh)
      bodies.push({ mesh: moonMesh, label: '🌙 Moon' })
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
      bodies.push({ mesh, label: `🔮 ${planet.name}` })
    })

    celestialBodiesRef.current = bodies
  }, [])

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

    // Stars - particle field
    const starCount = 8000
    const starPositions = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 80 + Math.random() * 20
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      starPositions[i * 3 + 2] = r * Math.cos(phi)
    }
    const starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    const starMat = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: 0.3,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
    })
    const stars = new THREE.Points(starGeo, starMat)
    scene.add(stars)

    // Brighter stars (fewer, bigger)
    const brightCount = 500
    const brightPositions = new Float32Array(brightCount * 3)
    const brightSizes = new Float32Array(brightCount)
    for (let i = 0; i < brightCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 80 + Math.random() * 20
      brightPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      brightPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      brightPositions[i * 3 + 2] = r * Math.cos(phi)
      brightSizes[i] = 0.5 + Math.random() * 1.5
    }
    const brightGeo = new THREE.BufferGeometry()
    brightGeo.setAttribute('position', new THREE.BufferAttribute(brightPositions, 3))
    brightGeo.setAttribute('size', new THREE.BufferAttribute(brightSizes, 1))
    const brightMat = new THREE.PointsMaterial({
      color: 0xFFFAF0,
      size: 0.8,
      sizeAttenuation: true,
      transparent: true,
      opacity: 1,
    })
    const brightStars = new THREE.Points(brightGeo, brightMat)
    scene.add(brightStars)

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
    const equatorLine = new THREE.Line(equatorGeo, new THREE.LineBasicMaterial({ color: 0x223355, transparent: true, opacity: 0.3 }))
    gridHelper.add(equatorLine)

    // Meridian
    const meridGeo = new THREE.BufferGeometry()
    const meridPoints: number[] = []
    for (let i = 0; i <= 180; i += 2) {
      const rad = (i * Math.PI) / 180
      meridPoints.push(0, 80 * Math.cos(rad) - 80, 80 * Math.sin(rad))
    }
    meridGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(meridPoints), 3))
    const meridLine = new THREE.Line(meridGeo, new THREE.LineBasicMaterial({ color: 0x223355, transparent: true, opacity: 0.3 }))
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
        {celestialBodiesRef.current.map((body, i) => (
          <CelestialLabel key={i} body={body} camera={cameraRef.current} renderer={rendererRef.current} />
        ))}
      </div>
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

function CelestialLabel({
  body,
  camera,
  renderer,
}: {
  body: { mesh: THREE.Mesh; label: string; isSun?: boolean }
  camera: THREE.PerspectiveCamera | null
  renderer: THREE.WebGLRenderer | null
}) {
  const labelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!camera || !renderer || !labelRef.current) return

    const updatePosition = () => {
      if (!labelRef.current || !camera || !renderer) return
      const canvas = renderer.domElement
      const vector = body.mesh.position.clone()
      vector.project(camera)

      const x = ((vector.x + 1) / 2) * canvas.clientWidth
      const y = ((-vector.y + 1) / 2) * canvas.clientHeight

      labelRef.current.style.left = `${x}px`
      labelRef.current.style.top = `${y}px`
      labelRef.current.style.opacity = '1'
    }

    const frame = requestAnimationFrame(function tick() {
      updatePosition()
      requestAnimationFrame(tick)
    })

    return () => cancelAnimationFrame(frame)
  }, [camera, renderer, body])

  return (
    <div
      ref={labelRef}
      className="absolute transform -translate-x-1/2 -translate-y-1/2 px-2 py-1 bg-black/60 text-white text-xs rounded whitespace-nowrap pointer-events-none"
      style={{ opacity: 0 }}
    >
      {body.label}
    </div>
  )
}
