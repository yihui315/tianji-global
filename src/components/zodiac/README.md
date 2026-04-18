# ZodiacChart Component

星盘 SVG 可视化组件

## Usage

```tsx
import { ZodiacChart, Planet, Aspect } from '@/components/zodiac';

const planets: Planet[] = [
  { name: 'Sun', sign: 'Leo', degree: 23, house: 10, isRetrograde: false, speed: 1.01, longitude: 122 },
  { name: 'Moon', sign: 'Scorpio', degree: 8, house: 4, isRetrograde: false, speed: 13 },
  // ...
];

<ZodiacChart
  planets={planets}
  aspects={aspects}
  houseCusps={houseCusps}
  size={800}
  theme="dark"
  language="zh"
  showAspects={true}
  showHouseCusps={true}
  onPlanetClick={(planet) => console.log(planet)}
/>
```

## Status

- ✅ Types defined
- ✅ Constants defined
- ✅ Utility functions implemented
- ✅ Basic SVG structure with placeholder rendering
- ⏳ Full SVG rendering (zodiac arcs, house cusps, aspect lines)

## Next Steps

1. Implement full zodiac ring rendering with sign arcs
2. Implement house cusp lines
3. Implement aspect line drawing
4. Add tooltip component
5. Add PNG export functionality
6. Add collision resolution visualization
