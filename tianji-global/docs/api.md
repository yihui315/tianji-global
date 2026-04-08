# TianJi Global — API Reference

Base URL: `https://api.tianji.global/api/v1`

---

## Health Check

### `GET /health`

Returns the service status.

**Response:**
```json
{
  "status": "ok",
  "service": "TianJi Global API",
  "version": "1.0.0"
}
```

---

## BaZi (八字) — Four Pillars of Destiny

### `POST /bazi`

Calculate a full BaZi chart from birth data.

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `birthDate` | `string` | ✅ | ISO date — `YYYY-MM-DD` |
| `birthTime` | `string` | ✅ | `HH:MM` (24-hour) |
| `birthPlace` | `string` | ❌ | City / timezone (future use) |
| `gender` | `string` | ❌ | `male` / `female` |
| `language` | `string` | ❌ | `en` (default) / `zh` |

**Example Request:**
```json
{
  "birthDate": "1990-05-15",
  "birthTime": "08:30",
  "birthPlace": "Shanghai, China",
  "gender": "male",
  "language": "en"
}
```

**Example Response:**
```json
{
  "chart": {
    "year":  { "heavenlyStem": "庚", "earthlyBranch": "午", "element": "Metal" },
    "month": { "heavenlyStem": "辛", "earthlyBranch": "巳", "element": "Metal" },
    "day":   { "heavenlyStem": "壬", "earthlyBranch": "戌", "element": "Water" },
    "hour":  { "heavenlyStem": "甲", "earthlyBranch": "辰", "element": "Wood" },
    "dayMasterElement": "Water"
  },
  "gender": "male",
  "language": "en",
  "interpretation": "Your Day Master is 壬 (Water). This suggests a water-type personality...",
  "meta": { "platform": "TianJi Global | 天机全球", "version": "1.0.0" }
}
```

---

## Zi Wei Dou Shu (紫微斗数) — Purple Star Astrology

### `POST /ziwei`

Generate a Zi Wei Dou Shu twelve-palace chart.

**Request Body:**
| Field | Type | Required |
|-------|------|----------|
| `birthDate` | `string` | ✅ |
| `birthTime` | `string` | ✅ |
| `gender` | `string` | ✅ |
| `language` | `string` | ❌ |

---

## Yi Jing (易经) — I Ching Oracle

### `GET /yijing/cast`

Cast a random hexagram using the three-coins method.

**Example Response:**
```json
{
  "hexagram": {
    "number": 1,
    "name": "乾",
    "pinyin": "Qián",
    "english": "The Creative",
    "judgment": "Supreme success. Perseverance furthers."
  },
  "lines": [7, 9, 8, 7, 8, 9],
  "hasChangingLines": true,
  "meta": { "platform": "TianJi Global | 天机全球", "version": "1.0.0" }
}
```

### `GET /yijing/:number`

Retrieve a specific hexagram by its traditional number (1–64).

---

*Full interactive API docs available at https://docs.tianji.global/api*
