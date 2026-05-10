# TianJi Media Handoff

This file defines who creates each media asset, where every source image lives, and which Seedance 2.0 prompt to use for video generation.

## Responsibility Split

Codex generates and maintains:
- hero source images
- poster images
- OG/social backgrounds
- share-card source backgrounds
- service thumbnail stills
- prompt packages and file naming contracts

You generate in Seedance 2.0:
- hero loop videos
- module card hover preview videos
- optional share-card motion loops
- optional service thumbnail hover loops

Rule: upload the source image listed here to Seedance, paste the matching prompt from `public/assets/video-prompts/seedance-2-home-and-modules.md`, export MP4, then overwrite the target video path.

Windows upload note: paths like `public/assets/**` are repository/web paths. In the Seedance file picker, use the matching absolute local path under `D:/BrainSystem/💼 工作专项/ai占卜/tianji-global/public/assets/**`. In double-image mode, upload the same local source image as both first frame and last frame.

## Global Visual Template

All new images should follow the approved home hero direction:
- ancient celestial machine revealed in deep black space
- low-angle cinematic frame
- low Earth-like horizon
- one controlled antique-gold beam of light
- deep black and violet shadows
- trace cyan horizon rim
- one dominant readable object
- clean left negative space for HTML text
- no text, no logo, no watermark, no UI, no humans

Colors:
- deep black: `#050508`
- violet shadow: `#1a071f` to `#2a0a3a`
- muted antique gold: `#D4AF37`
- trace cyan: `#67E8F9`

## Category A: Main Page Hero Media

Use these for fullscreen page hero videos.

| Section | Codex source image to upload to Seedance | Poster fallback | OG background | Seedance video output | Prompt section |
| --- | --- | --- | --- | --- | --- |
| Home | `public/assets/images/hero/home-hero-master-16x9.jpg` | `public/assets/images/posters/home-hero-poster-16x9.jpg` | `public/assets/images/og/home-og-bg-1200x630.jpg` | `public/assets/videos/hero/home-hero-loop-6s-1080p.mp4` | `Home Hero` |
| Pricing | `public/assets/images/hero/pricing-hero-master-16x9.jpg` | `public/assets/images/posters/pricing-hero-poster-16x9.jpg` | `public/assets/images/og/pricing-og-bg-1200x630.jpg` | `public/assets/videos/hero/pricing-hero-loop-6s-1080p.mp4` | `Pricing Hero` |
| Zi Wei | `public/assets/images/hero/ziwei-hero-master-16x9.jpg` | `public/assets/images/posters/ziwei-hero-poster-16x9.jpg` | `public/assets/images/og/ziwei-og-bg-1200x630.jpg` | `public/assets/videos/hero/ziwei-hero-loop-6s-1080p.mp4` | `Zi Wei Hero` |
| BaZi | `public/assets/images/hero/bazi-hero-master-16x9.jpg` | `public/assets/images/posters/bazi-hero-poster-16x9.jpg` | `public/assets/images/og/bazi-og-bg-1200x630.jpg` | `public/assets/videos/hero/bazi-hero-loop-6s-1080p.mp4` | `BaZi Hero` |
| Yi Jing | `public/assets/images/hero/yijing-hero-master-16x9.jpg` | `public/assets/images/posters/yijing-hero-poster-16x9.jpg` | `public/assets/images/og/yijing-og-bg-1200x630.jpg` | `public/assets/videos/hero/yijing-hero-loop-6s-1080p.mp4` | `Yi Jing Hero` |
| Tarot | `public/assets/images/hero/tarot-hero-master-16x9.jpg` | `public/assets/images/posters/tarot-hero-poster-16x9.jpg` | `public/assets/images/og/tarot-og-bg-1200x630.jpg` | `public/assets/videos/hero/tarot-hero-loop-6s-1080p.mp4` | `Tarot Hero` |
| Western | `public/assets/images/hero/western-hero-master-16x9.jpg` | `public/assets/images/posters/western-hero-poster-16x9.jpg` | `public/assets/images/og/western-og-bg-1200x630.jpg` | `public/assets/videos/hero/western-hero-loop-6s-1080p.mp4` | `Western Hero` |
| Fortune | `public/assets/images/hero/fortune-hero-master-16x9.jpg` | `public/assets/images/posters/fortune-hero-poster-16x9.jpg` | `public/assets/images/og/fortune-og-bg-1200x630.jpg` | `public/assets/videos/hero/fortune-hero-loop-6s-1080p.mp4` | `Fortune Hero` |
| Relationship | `public/assets/images/hero/relationship-hero-master-16x9.jpg` | `public/assets/images/posters/relationship-hero-poster-16x9.jpg` | `public/assets/images/og/relationship-og-bg-1200x630.jpg` | `public/assets/videos/hero/relationship-hero-loop-6s-1080p.mp4` | `Relationship Hero and Share Motion` |

Status note: Relationship source image paths are planned but not currently wired into the redesigned main landing pages. Generate them only when upgrading the relationship page media.

## Category B: Small Module Card Videos

Use these for homepage module-card hover previews. The recommended source is the matching hero master still, because it keeps the same cinematic style across large and small media.

| Module card | Upload this image | Seedance video output | Prompt section |
| --- | --- | --- | --- |
| Zi Wei card | `public/assets/images/hero/ziwei-hero-master-16x9.jpg` | `public/assets/videos/cards/ziwei-card-preview-3s-768p.mp4` | `Zi Wei Hero` / `Card Seedance 2.0 prompt` |
| BaZi card | `public/assets/images/hero/bazi-hero-master-16x9.jpg` | `public/assets/videos/cards/bazi-card-preview-3s-768p.mp4` | `BaZi Hero` / `Card Seedance 2.0 prompt` |
| Yi Jing card | `public/assets/images/hero/yijing-hero-master-16x9.jpg` | `public/assets/videos/cards/yijing-card-preview-3s-768p.mp4` | `Yi Jing Hero` / `Card Seedance 2.0 prompt` |
| Tarot card | `public/assets/images/hero/tarot-hero-master-16x9.jpg` | `public/assets/videos/cards/tarot-card-preview-3s-768p.mp4` | `Tarot Hero` / `Card Seedance 2.0 prompt` |
| Western card | `public/assets/images/hero/western-hero-master-16x9.jpg` | `public/assets/videos/cards/western-card-preview-3s-768p.mp4` | `Western Hero` / `Card Seedance 2.0 prompt` |
| Fortune card | `public/assets/images/hero/fortune-hero-master-16x9.jpg` | `public/assets/videos/cards/fortune-card-preview-3s-768p.mp4` | `Fortune Hero` / `Card Seedance 2.0 prompt` |
| Relationship card | `public/assets/images/hero/relationship-hero-master-16x9.jpg` | `public/assets/videos/cards/relationship-card-preview-3s-768p.mp4` | `Relationship Hero and Share Motion` / `Card Seedance 2.0 prompt` |

## Category C: OG and Share Backgrounds

These are mostly still images. Only animate them if you want motion share cards or social teaser clips.

| Share surface | Source image | Optional video prompt |
| --- | --- | --- |
| Home OG | `public/assets/images/og/home-og-bg-1200x630.jpg` | `Share Background Motion` |
| Zi Wei OG | `public/assets/images/og/ziwei-og-bg-1200x630.jpg` | `Share Background Motion` |
| BaZi OG | `public/assets/images/og/bazi-og-bg-1200x630.jpg` | `Share Background Motion` |
| Yi Jing OG | `public/assets/images/og/yijing-og-bg-1200x630.jpg` | `Share Background Motion` |
| Tarot OG | `public/assets/images/og/tarot-og-bg-1200x630.jpg` | `Share Background Motion` |
| Western OG | `public/assets/images/og/western-og-bg-1200x630.jpg` | `Share Background Motion` |
| Fortune OG | `public/assets/images/og/fortune-og-bg-1200x630.jpg` | `Share Background Motion` |
| Pricing OG | `public/assets/images/og/pricing-og-bg-1200x630.jpg` | `Share Background Motion` |
| AI share card | `public/assets/share/share-ai-card.png` | `Share Background Motion` |
| Fortune share chart | `public/assets/share/share-fortune-chart.png` | `Share Background Motion` |
| Relationship share card | `public/assets/share/share-relationship-card.png` | `Share Background Motion` |
| Zi Wei legacy share | `public/assets/share/ziwei-og.jpg` | `Share Background Motion` |

## Category D: Service Thumbnail Stills

These are small static images used for tool/service surfaces. Codex should regenerate them when we want full visual consistency. Seedance animation is optional unless the UI adds hover video support.

| Service | Static source image | Optional prompt |
| --- | --- | --- |
| Zi Wei | `public/assets/services/ziwei.jpg` | `Service Thumbnail Motion Standard` |
| BaZi | `public/assets/services/bazi.jpg` | `Service Thumbnail Motion Standard` |
| Yi Jing | `public/assets/services/yijing.jpg` | `Service Thumbnail Motion Standard` |
| Tarot | `public/assets/services/tarot.jpg` | `Service Thumbnail Motion Standard` |
| Western | `public/assets/services/western.jpg` | `Service Thumbnail Motion Standard` |
| Synastry | `public/assets/services/synastry.jpg` | `Service Thumbnail Motion Standard` |
| Numerology | `public/assets/services/numerology.jpg` | `Service Thumbnail Motion Standard` |
| Solar Return | `public/assets/services/solar-return.jpg` | `Service Thumbnail Motion Standard` |
| Transit | `public/assets/services/transit.jpg` | `Service Thumbnail Motion Standard` |
| Feng Shui | `public/assets/services/fengshui.jpg` | `Service Thumbnail Motion Standard` |
| Electional | `public/assets/services/electional.jpg` | `Service Thumbnail Motion Standard` |
| Horary | `public/assets/services/horary.jpg` | `Service Thumbnail Motion Standard` |

## Category E: Icons

Icons are static only for now. Codex should regenerate them if we need visual alignment, but they should not go through Seedance unless we explicitly create animated icon states.

Paths:
- `public/assets/icons/icon-ziwei.png`
- `public/assets/icons/icon-bazi.png`
- `public/assets/icons/icon-yijing.png`
- `public/assets/icons/icon-western.png`
- `public/assets/icons/icon-synastry.png`
- `public/assets/icons/icon-tarot.png`
- `public/assets/icons/icon-ai.png`
- `public/assets/icons/icon-solar.png`
- `public/assets/icons/icon-transit.png`
- `public/assets/icons/icon-fengshui.png`
- `public/assets/icons/icon-electional.png`
- `public/assets/icons/icon-trust.png`

## Generation Order

For a full media refresh, use this order:

1. Codex generates hero master stills.
2. Codex derives poster images from hero master stills.
3. Codex derives OG backgrounds as 1200x630 crops.
4. You upload hero master stills to Seedance and render hero loops.
5. You upload hero master stills or service stills to Seedance and render card previews.
6. Replace the MP4 files at the target paths.
7. Run the landing contract test and asset audits.

## Video Render Settings

Hero loops:
- Model: Seedance 2.0 image-to-video
- Duration: 6 seconds
- Aspect ratio: 16:9
- Output: 1080p MP4, H.264
- Motion: slow, restrained, expensive-looking
- Loop: final frame close to first frame

Card previews:
- Model: Seedance 2.0 image-to-video
- Duration: 3 seconds
- Output: 768p MP4, H.264
- Motion: subtle hover loop, readable at small size

## After Seedance Delivery

After you render videos, place them exactly here:

- hero loops: `public/assets/videos/hero/[section]-hero-loop-6s-1080p.mp4`
- card previews: `public/assets/videos/cards/[section]-card-preview-3s-768p.mp4`

Then run:

```bash
npm run test -- src/__tests__/landing-design-contract.test.ts
npm run build
npm run audit:routes
npm run audit:share
```
