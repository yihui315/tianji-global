import { NextRequest, NextResponse } from 'next/server'
import sw from 'sweph'
const { utc_to_jd, calc, azalt, pheno, constants } = sw

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

function jdToDate(jd: number): Date {
  const z = Math.floor(jd + 0.5)
  const f = jd + 0.5 - z
  let a: number
  if (z < 2299161) {
    a = z
  } else {
    const alpha = Math.floor((z - 1867216.25) / 36524.25)
    a = z + 1 + alpha - Math.floor(alpha / 4)
  }
  const b = a + 1524
  const c = Math.floor((b - 122.1) / 365.25)
  const d = Math.floor(365.25 * c)
  const e = Math.floor((b - d) / 30.6001)
  const day = b - d - Math.floor(30.6001 * e) + f
  const month = e < 14 ? e - 1 : e - 13
  const year = month > 2 ? c - 4716 : c - 4715
  const hours = (day % 1) * 24
  const minutes = (hours % 1) * 60
  const seconds = (minutes % 1) * 60
  return new Date(
    year,
    month - 1,
    Math.floor(day),
    Math.floor(hours),
    Math.floor(minutes),
    Math.floor(seconds)
  )
}

function getPlanets(): { id: number; name: string; nameZh: string }[] {
  return [
    { id: constants.SE_MERCURY, name: 'Mercury', nameZh: '水星' },
    { id: constants.SE_VENUS, name: 'Venus', nameZh: '金星' },
    { id: constants.SE_MARS, name: 'Mars', nameZh: '火星' },
    { id: constants.SE_JUPITER, name: 'Jupiter', nameZh: '木星' },
    { id: constants.SE_SATURN, name: 'Saturn', nameZh: '土星' },
    { id: constants.SE_URANUS, name: 'Uranus', nameZh: '天王星' },
    { id: constants.SE_NEPTUNE, name: 'Neptune', nameZh: '海王星' },
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

  const flags = constants.SEFLG_SWIEPH
  const jd = utc_to_jd(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    constants.SE_GREG_CAL
  )

  if (jd.flag !== constants.OK) {
    return NextResponse.json({ error: jd.error }, { status: 500 })
  }

  const [jd_et, jd_ut] = jd.data
  const geopos: [number, number, number] = [lng, lat, 0]
  const atpress = 1013.25
  const attemp = 15.0

  // Sun
  const sunCalc = calc(jd_et, constants.SE_SUN, flags)
  const sunAzAlt = azalt(jd_ut, constants.SE_ECL2HOR, geopos, atpress, attemp, [
    sunCalc.data[0],
    sunCalc.data[1],
    sunCalc.data[2],
  ])
  const sunZodiac = getZodiacSign(sunCalc.data[0])

  // Moon
  const moonCalc = calc(jd_et, constants.SE_MOON, flags)
  const moonAzAlt = azalt(jd_ut, constants.SE_ECL2HOR, geopos, atpress, attemp, [
    moonCalc.data[0],
    moonCalc.data[1],
    moonCalc.data[2],
  ])
  const moonPheno = pheno(jd_et, constants.SE_MOON, flags)
  const moonZodiac = getZodiacSign(moonCalc.data[0])
  const moonPhase = moonPheno.flag === constants.OK ? moonPheno.data[1] : 0.5

  // Planets
  const planets = getPlanets().map((p) => {
    const planetCalc = calc(jd_et, p.id, flags)
    const planetAzAlt = azalt(jd_ut, constants.SE_ECL2HOR, geopos, atpress, attemp, [
      planetCalc.data[0],
      planetCalc.data[1],
      planetCalc.data[2],
    ])
    const planetZodiac = getZodiacSign(planetCalc.data[0])
    return {
      name: p.name,
      nameZh: p.nameZh,
      alt: parseFloat((planetAzAlt[1] || 0).toFixed(2)),
      az: parseFloat((planetAzAlt[0] || 0).toFixed(2)),
      sign: planetZodiac.symbol,
      signName: planetZodiac.name,
    }
  })

  const result = {
    sun: {
      alt: parseFloat((sunAzAlt[1] || 0).toFixed(2)),
      az: parseFloat((sunAzAlt[0] || 0).toFixed(2)),
      sign: sunZodiac.symbol,
      signName: sunZodiac.name,
    },
    moon: {
      alt: parseFloat((moonAzAlt[1] || 0).toFixed(2)),
      az: parseFloat((moonAzAlt[0] || 0).toFixed(2)),
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
