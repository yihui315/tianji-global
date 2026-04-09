'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import dynamic from 'next/dynamic'

const SkySphere = dynamic(() => import('@/components/sky/SkySphere'), { ssr: false })

interface PlanetData {
  name: string
  nameZh: string
  alt: number
  az: number
  sign?: string
  signName?: string
}

interface SkyData {
  sun: { alt: number; az: number; sign: string; signName: string }
  moon: { alt: number; az: number; phase: number; sign: string; signName: string }
  planets: PlanetData[]
  date: string
  location: { lat: number; lng: number }
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 16)
}

function DateTimeInputs({
  date,
  setDate,
}: {
  date: Date
  setDate: (d: Date) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-slate-400">Date & Time</label>
      <input
        type="datetime-local"
        value={formatDate(date)}
        onChange={(e) => setDate(new Date(e.target.value))}
        className="bg-slate-800 border border-slate-600 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-indigo-500"
      />
    </div>
  )
}

function LocationInputs({
  lat,
  lng,
  setLat,
  setLng,
}: {
  lat: string
  lng: string
  setLat: (v: string) => void
  setLng: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-slate-400">Location (Lat, Lng)</label>
      <div className="flex gap-2">
        <input
          type="number"
          step="0.0001"
          min="-90"
          max="90"
          placeholder="Latitude"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          className="w-28 bg-slate-800 border border-slate-600 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-indigo-500"
        />
        <input
          type="number"
          step="0.0001"
          min="-180"
          max="180"
          placeholder="Longitude"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          className="w-28 bg-slate-800 border border-slate-600 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-indigo-500"
        />
      </div>
    </div>
  )
}

function PresetLocations({
  onSelect,
}: {
  onSelect: (lat: string, lng: string) => void
}) {
  const presets = [
    { name: 'Tokyo', lat: '35.6762', lng: '139.6503' },
    { name: 'Beijing', lat: '39.9042', lng: '116.4074' },
    { name: 'New York', lat: '40.7128', lng: '-74.0060' },
    { name: 'London', lat: '51.5074', lng: '-0.1278' },
    { name: 'Sydney', lat: '-33.8688', lng: '151.2093' },
  ]
  return (
    <div className="flex flex-wrap gap-1">
      {presets.map((p) => (
        <button
          key={p.name}
          onClick={() => onSelect(p.lat, p.lng)}
          className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
        >
          {p.name}
        </button>
      ))}
    </div>
  )
}

export default function SkyChartPage() {
  const [date, setDate] = useState(new Date())
  const [lat, setLat] = useState('35.6762')
  const [lng, setLng] = useState('139.6503')
  const [skyData, setSkyData] = useState<SkyData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [showInfo, setShowInfo] = useState(true)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const fetchSkyData = useCallback(async (d: Date, la: string, ln: string) => {
    setLoading(true)
    setError(null)
    try {
      const dateStr = d.toISOString()
      const res = await fetch(`/api/sky?date=${encodeURIComponent(dateStr)}&lat=${la}&lng=${ln}`)
      if (!res.ok) {
        throw new Error('Failed to fetch sky data')
      }
      const data: SkyData = await res.json()
      setSkyData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSkyData(date, lat, lng)
  }, [])

  const handleViewSky = () => {
    fetchSkyData(date, lat, lng)
  }

  const handleRealTime = () => {
    setDate(new Date())
    fetchSkyData(new Date(), lat, lng)
  }

  const handleShare = (dataUrl: string) => {
    setImageUrl(dataUrl)
    setShareUrl(dataUrl)
  }

  const handlePreset = (la: string, ln: string) => {
    setLat(la)
    setLng(ln)
    fetchSkyData(date, la, ln)
  }

  return (
    <div className="min-h-screen bg-[#000011] flex flex-col relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌌</span>
          <div>
            <h1 className="text-white text-lg font-bold">实时星空</h1>
            <p className="text-slate-400 text-xs">Sky Chart · Celestial Sphere</p>
          </div>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="px-3 py-1 bg-slate-800/80 text-slate-300 text-sm rounded hover:bg-slate-700/80 transition-colors"
        >
          {showInfo ? 'Hide Info' : 'Show Info'}
        </button>
      </div>

      {/* 3D Sky Visualization */}
      <div className="flex-1 relative">
        {loading && !skyData && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-white text-lg">Loading sky data...</div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-red-400 bg-red-900/50 px-4 py-2 rounded-lg">{error}</div>
          </div>
        )}
        {skyData && (
          <Suspense fallback={
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-lg">Loading 3D sphere...</div>
            </div>
          }>
            <SkySphere skyData={skyData} date={date} onShare={handleShare} />
          </Suspense>
        )}
      </div>

      {/* Info Overlay */}
      {showInfo && skyData && (
        <div className="absolute bottom-40 left-4 right-4 md:left-auto md:right-auto md:w-80 md:absolute md:bottom-32 md:left-4 z-10 bg-black/70 backdrop-blur-md rounded-xl p-4 border border-slate-700/50">
          <h3 className="text-white text-sm font-bold mb-3 flex items-center gap-2">
            🌟 Celestial Positions
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span>☀️ Sun</span>
              <span>Alt: {skyData.sun.alt}° | Az: {skyData.sun.az}°</span>
              <span className="text-indigo-300">{skyData.sun.sign}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>🌙 Moon</span>
              <span>Alt: {skyData.moon.alt}° | Az: {skyData.moon.az}°</span>
              <span className="text-indigo-300">{skyData.moon.sign} ({Math.round(skyData.moon.phase * 100)}%)</span>
            </div>
            {skyData.planets.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-slate-300">
                <span>🔮 {p.nameZh}</span>
                <span>Alt: {p.alt}° | Az: {p.az}°</span>
                <span className="text-indigo-300">{p.sign}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t border-slate-700/50 text-xs text-slate-500">
            📍 {skyData.location.lat.toFixed(4)}, {skyData.location.lng.toFixed(4)} · {new Date(skyData.date).toLocaleString()}
          </div>
        </div>
      )}

      {/* Control Panel */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/80 backdrop-blur-md border-t border-slate-800 p-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-3 items-end md:items-center">
          <DateTimeInputs date={date} setDate={setDate} />
          <LocationInputs lat={lat} lng={lng} setLat={setLat} setLng={setLng} />
          <button
            onClick={handleViewSky}
            disabled={loading}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white text-sm rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            {loading ? 'Loading...' : '🔭 View Sky'}
          </button>
          <button
            onClick={handleRealTime}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-sm rounded-lg transition-colors whitespace-nowrap"
          >
            ⚡ Real-time
          </button>
          <div className="w-full md:w-auto">
            <PresetLocations onSelect={handlePreset} />
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {shareUrl && imageUrl && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80">
          <div className="bg-slate-900 rounded-xl p-6 max-w-lg w-full mx-4 border border-slate-700">
            <h3 className="text-white text-lg font-bold mb-4">📸 Sky Screenshot</h3>
            <img src={imageUrl} alt="Sky chart" className="w-full rounded-lg mb-4" />
            <div className="flex gap-3">
              <a
                href={imageUrl}
                download="sky-chart.png"
                className="flex-1 text-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors"
              >
                Download
              </a>
              <button
                onClick={() => setShareUrl(null)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
