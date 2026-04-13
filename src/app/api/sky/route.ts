import { NextRequest, NextResponse } from 'next/server'
import { CalendarGregorianToJD } from 'astronomia/julian'
import { Planet } from 'astronomia/planetposition'
import { position as moonPosition } from 'astronomia/moonposition'
import earthData from 'astronomia/data/vsop87Bearth'
import mercuryData from 'astronomia/data/vsop87Bmercury'
import venusData from 'astronomia/data/vsop87Bvenus'
import marsData from 'astronomia/data/vsop87Bmars'
import jupiterData from 'astronomia/data/vsop87Bjupiter'
import saturnData from 'astronomia/data/vsop87Bsaturn'
import uranusData from 'astronomia/data/vsop87Buranus'
import neptuneData from 'astronomia/data/vsop87Bneptune'

const ZODIAC_SIGNS = [
  { name: 'Aries', nameZh: '白羊', symbol: '♈' },
  { name: 'Taurus', nameZh: '金牛', symbol: '♉' },
  { name: 'Gemini', nameZh: '双子', symbol: '♊' },
  { name: 'Cancer', nameZh: '巨蟹', symbol: '♋' },
  { name: 'Leo', nameZh: '狮子', symbol: '♌' },
  { name: 'Virgo', nameZh: '处女', symbol: '♍' },
  { name: 'Libra', nameZh: '天秤', symbol: '♎' },
  { name: 'Scorpio', nameZh: '天蝎', symbol: '♏' },
  { name: 'Sagittarius', nameZh: '射手', symbol: '♐' },
  { name: 'Capricorn', nameZh: '摩羯', symbol: '♑' },
  { name: 'Aquarius', nameZh: '水瓶', symbol: '♒' },
  { name: 'Pisces', nameZh: '双鱼', symbol: '♓' },
]

function getZodiacSign(lon: number): { name: string; nameZh: string; symbol: string } {
  const signIndex = Math.floor(((lon % 360) / 360) * 12)
  return ZODIAC_SIGNS[signIndex]
}

function radToDeg(rad: number): number {
  return (rad * 180 / Math.PI + 360) % 360
}

function degToRad(deg: number): number {
  return deg * Math.PI / 180
}

function normalizeAngle(a: number): number {
  a = a % 360
  return a < 0 ? a + 360 : a
}

// Convert ecliptic coordinates (lon, lat in degrees) to horizontal (alt, az in degrees)
// Using standard astronomical transformation
function eclipticToHorizontal(
  eclLon: number, eclLat: number,
  jd: number, lat: number, lng: number
): { alt: number; az: number } {
  // Obliquity of the ecliptic
  const T = (jd - 2451545.0) / 36525
  const eps = (23.439291111 - 0.0130042 * T - 0.00000016 * T * T + 0.000000504 * T * T * T) * Math.PI / 180

  // Ecliptic to equatorial (RA, Dec)
  const lonRad = degToRad(eclLon)
  const latRad = degToRad(eclLat)

  const sinDec = Math.sin(latRad) * Math.cos(eps) - Math.cos(latRad) * Math.sin(eps) * Math.sin(lonRad)
  const dec = Math.asin(sinDec)

  const cosRA = Math.cos(latRad) * Math.cos(lonRad) / Math.cos(dec)
  const sinRA = Math.cos(latRad) * Math.sin(eps) * Math.sin(lonRad) + Math.sin(latRad) * Math.cos(eps)
  const RA = Math.atan2(sinRA, cosRA)

  // Local sidereal time
  const lst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - lng
  const lstRad = degToRad(lst % 360)

  // Hour angle
  const HA = lstRad - RA

  // Horizontal coordinates
  const latRadObs = degToRad(lat)
  const sinAlt = Math.sin(dec) * Math.sin(latRadObs) + Math.cos(dec) * Math.cos(latRadObs) * Math.cos(HA)
  const alt = Math.asin(sinAlt)

  const cosAz = (Math.sin(dec) - Math.sin(alt) * Math.sin(latRadObs)) / (Math.cos(alt) * Math.cos(latRadObs))
  const sinAz = -Math.cos(dec) * Math.sin(HA) / Math.cos(alt)
  let az = Math.atan2(sinAz, cosAz)

  return {
    alt: radToDeg(alt),
    az: normalizeAngle(radToDeg(az)),
  }
}

// Get moon phase (0=new, 0.5=full, returns value 0-1)
function getMoonPhase(jd: number): number {
  try {
    const moon = moonPosition(jd)
    const earth = new Planet(earthData)
    const earthPos = earth.position(jd)
    const sunLon = radToDeg((earthPos.lon + Math.PI) % (2 * Math.PI))
    const moonLon = radToDeg(moon.lon)

    let elongation = moonLon - sunLon
    while (elongation > 180) elongation -= 360
    while (elongation < -180) elongation += 360

    return Math.abs(elongation) / 180
  } catch {
    return 0.5
  }
}

// Planet data setup
const earth = new Planet(earthData)
const mercury = new Planet(mercuryData)
const venus = new Planet(venusData)
const mars = new Planet(marsData)
const jupiter = new Planet(jupiterData)
const saturn = new Planet(saturnData)
const uranus = new Planet(uranusData)
const neptune = new Planet(neptuneData)

const PLANET_DATA: Record<string, { getPosition: (jd: number) => { lon: number; lat: number; distance: number } }> = {
  Sun:     { getPosition: (jd) => { const p = earth.position(jd); return { lon: (p.lon + Math.PI) % (2 * Math.PI), lat: p.lat, distance: p.distance } } },
  Mercury: { getPosition: (jd) => { const p = mercury.position(jd); const e = earth.position(jd); return { lon: (p.lon - e.lon + 2*Math.PI) % (2 * Math.PI), lat: p.lat, distance: p.distance } } },
  Venus:   { getPosition: (jd) => { const p = venus.position(jd); const e = earth.position(jd); return { lon: (p.lon - e.lon + 2*Math.PI) % (2 * Math.PI), lat: p.lat, distance: p.distance } } },
  Mars:    { getPosition: (jd) => { const p = mars.position(jd); const e = earth.position(jd); return { lon: (p.lon - e.lon + 2*Math.PI) % (2 * Math.PI), lat: p.lat, distance: p.distance } } },
  Jupiter: { getPosition: (jd) => { const p = jupiter.position(jd); const e = earth.position(jd); return { lon: (p.lon - e.lon + 2*Math.PI) % (2 * Math.PI), lat: p.lat, distance: p.distance } } },
  Saturn:  { getPosition: (jd) => { const p = saturn.position(jd); const e = earth.position(jd); return { lon: (p.lon - e.lon + 2*Math.PI) % (2 * Math.PI), lat: p.lat, distance: p.distance } } },
  Uranus:  { getPosition: (jd) => { const p = uranus.position(jd); const e = earth.position(jd); return { lon: (p.lon - e.lon + 2*Math.PI) % (2 * Math.PI), lat: p.lat, distance: p.distance } } },
  Neptune: { getPosition: (jd) => { const p = neptune.position(jd); const e = earth.position(jd); return { lon: (p.lon - e.lon + 2*Math.PI) % (2 * Math.PI), lat: p.lat, distance: p.distance } } },
}

function getPlanets(): { id: string; name: string; nameZh: string }[] {
  return [
    { id: 'Mercury', name: 'Mercury', nameZh: '水星' },
    { id: 'Venus', name: 'Venus', nameZh: '金星' },
    { id: 'Mars', name: 'Mars', nameZh: '火星' },
    { id: 'Jupiter', name: 'Jupiter', nameZh: '木星' },
    { id: 'Saturn', name: 'Saturn', nameZh: '土星' },
    { id: 'Uranus', name: 'Uranus', nameZh: '天王星' },
    { id: 'Neptune', name: 'Neptune', nameZh: '海王星' },
  ]
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const dateParam = searchParams.get('date')
  const latParam = searchParams.get('lat')
  const lngParam = searchParams.get('lng')

  // Default to now
  let date = dateParam ? new Date(dateParam) : new Date()
  if (isNaN(date.getTime())) {
    date = new Date()
  }

  const lat = latParam ? parseFloat(latParam) : 35.6762
  const lng = lngParam ? parseFloat(lngParam) : 139.6503

  // Validate lat/lng
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json(
      { error: 'Invalid lat/lng values' },
      { status: 400 }
    )
  }

  const jd = CalendarGregorianToJD(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate() + date.getUTCHours() / 24 + date.getUTCMinutes() / 1440
  )
  const jd_et = jd + 1 / 86400

  // Sun
  const sunPos = earth.position(jd_et)
  const sunLon = radToDeg((sunPos.lon + Math.PI) % (2 * Math.PI))
  const sunHoriz = eclipticToHorizontal(sunLon, radToDeg(sunPos.lat), jd, lat, lng)
  const sunZodiac = getZodiacSign(sunLon)

  // Moon
  const moon = moonPosition(jd_et)
  const moonLon = radToDeg(moon.lon)
  const moonLat = radToDeg(moon.lat)
  const moonHoriz = eclipticToHorizontal(moonLon, moonLat, jd, lat, lng)
  const moonZodiac = getZodiacSign(moonLon)
  const moonPhase = getMoonPhase(jd_et)

  // Planets
  const planets = getPlanets().map((p) => {
    const pd = PLANET_DATA[p.id]
    if (!pd) return { name: p.name, nameZh: p.nameZh, alt: 0, az: 0, sign: '?', signName: 'Unknown' }
    const pos = pd.getPosition(jd_et)
    const lonDeg = radToDeg(pos.lon)
    const latDeg = radToDeg(pos.lat)
    const horiz = eclipticToHorizontal(lonDeg, latDeg, jd, lat, lng)
    const zodiac = getZodiacSign(lonDeg)
    return {
      name: p.name,
      nameZh: p.nameZh,
      alt: parseFloat((horiz.alt || 0).toFixed(2)),
      az: parseFloat((horiz.az || 0).toFixed(2)),
      sign: zodiac.symbol,
      signName: zodiac.name,
    }
  })

  const result = {
    sun: {
      alt: parseFloat((sunHoriz.alt || 0).toFixed(2)),
      az: parseFloat((sunHoriz.az || 0).toFixed(2)),
      sign: sunZodiac.symbol,
      signName: sunZodiac.name,
    },
    moon: {
      alt: parseFloat((moonHoriz.alt || 0).toFixed(2)),
      az: parseFloat((moonHoriz.az || 0).toFixed(2)),
      phase: parseFloat(moonPhase.toFixed(3)),
      sign: moonZodiac.symbol,
      signName: moonZodiac.name,
    },
    planets,
    date: date.toISOString(),
    location: { lat, lng },
  }

  return NextResponse.json(result)
}
