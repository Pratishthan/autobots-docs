# LLD Video Guide Series — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an 8-video series using Remotion that teaches new team members how to write LLD documents, with AI-generated voiceover narration.

**Architecture:** Script-first pipeline — narration scripts drive TTS audio generation, audio durations drive Remotion composition lengths via `calculateMetadata`. Reusable React components (TitleCard, CodeBlock, BulletList, SectionDiagram, TableView) are shared across all 8 videos. Each video uses `<TransitionSeries>` with fade transitions between 4 scenes.

**Tech Stack:** Remotion 4.x, React 19, TypeScript, @remotion/transitions, @remotion/google-fonts, @remotion/media, mediabunny, ElevenLabs TTS API

**Design Spec:** `docs/superpowers/specs/2026-03-31-lld-video-guide-design.md` (or see `.claude/plans/reflective-coalescing-kahan.md`)

---

## File Structure

```
autobots-docs/videos/lld-guide/
├── package.json
├── tsconfig.json
├── generate-voiceover.ts           # ElevenLabs TTS script
├── src/
│   ├── Root.tsx                    # All 8 Compositions registered
│   ├── get-audio-duration.ts       # Mediabunny audio duration helper
│   ├── types.ts                    # Shared types (SceneConfig, VideoProps)
│   ├── styles/
│   │   ├── theme.ts                # Dark palette, sizing constants
│   │   └── fonts.ts                # Inter + JetBrains Mono loading
│   ├── components/
│   │   ├── TitleCard.tsx
│   │   ├── SectionDiagram.tsx
│   │   ├── CodeBlock.tsx
│   │   ├── BulletList.tsx
│   │   ├── TableView.tsx
│   │   └── VideoShell.tsx          # TransitionSeries shell for 4-scene videos
│   ├── videos/
│   │   ├── V1Intro.tsx
│   │   ├── V2Background.tsx
│   │   ├── V3DataModels.tsx
│   │   ├── V4Services.tsx
│   │   ├── V5Flows.tsx
│   │   ├── V6LPUs.tsx
│   │   ├── V7TestData.tsx
│   │   └── V8TestScenarios.tsx
│   └── scripts/
│       ├── v1-intro.md
│       ├── v2-background.md
│       ├── v3-data-models.md
│       ├── v4-services.md
│       ├── v5-flows.md
│       ├── v6-lpus.md
│       ├── v7-test-data.md
│       └── v8-test-scenarios.md
└── public/
    ├── voiceover/                  # Generated TTS MP3s
    └── assets/                     # Static images
```

---

## Task 1: Scaffold Remotion Project

**Files:**
- Create: `autobots-docs/videos/lld-guide/package.json`
- Create: `autobots-docs/videos/lld-guide/tsconfig.json`
- Create: `autobots-docs/videos/lld-guide/src/Root.tsx`
- Create: `autobots-docs/videos/lld-guide/src/types.ts`

- [ ] **Step 1: Initialize Remotion project**

```bash
cd autobots-docs/videos
npx create-video@latest lld-guide --template blank
cd lld-guide
```

- [ ] **Step 2: Install additional dependencies**

```bash
npx remotion add @remotion/transitions
npx remotion add @remotion/google-fonts
npx remotion add @remotion/media
npm install mediabunny
```

- [ ] **Step 3: Create shared types file**

Create `src/types.ts`:

```typescript
export type SceneConfig = {
  id: string;
  audioFile: string;
  durationInFrames: number;
};

export type VideoProps = {
  scenes: SceneConfig[];
};
```

- [ ] **Step 4: Create audio duration helper**

Create `src/get-audio-duration.ts`:

```typescript
import { Input, ALL_FORMATS, UrlSource } from "mediabunny";

export const getAudioDuration = async (src: string) => {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new UrlSource(src, {
      getRetryDelay: () => null,
    }),
  });

  const durationInSeconds = await input.computeDuration();
  return durationInSeconds;
};
```

- [ ] **Step 5: Create placeholder Root.tsx**

Create `src/Root.tsx` with a single placeholder composition:

```tsx
import { Composition } from "remotion";

const Placeholder = () => <div style={{ background: "#1a1a2e", width: "100%", height: "100%" }} />;

export const RemotionRoot = () => {
  return (
    <Composition
      id="Placeholder"
      component={Placeholder}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
```

- [ ] **Step 6: Verify studio launches**

```bash
npx remotion studio
```

Expected: Browser opens at localhost:3000 showing the dark placeholder composition.

- [ ] **Step 7: Commit**

```bash
git add autobots-docs/videos/lld-guide/
git commit -m "feat: scaffold Remotion project for LLD video guide"
```

---

## Task 2: Theme and Font Setup

**Files:**
- Create: `autobots-docs/videos/lld-guide/src/styles/theme.ts`
- Create: `autobots-docs/videos/lld-guide/src/styles/fonts.ts`

- [ ] **Step 1: Create theme.ts**

```typescript
export const theme = {
  colors: {
    bg: "#0d1117",
    bgCard: "#161b22",
    bgCode: "#1c2128",
    text: "#e6edf3",
    textMuted: "#8b949e",
    accent: "#58a6ff",
    accentGreen: "#3fb950",
    accentOrange: "#d29922",
    accentRed: "#f85149",
    border: "#30363d",
    highlight: "#1f6feb33",
  },
  spacing: {
    page: 80,
    section: 40,
    element: 20,
  },
  fontSize: {
    title: 72,
    subtitle: 40,
    heading: 36,
    body: 28,
    code: 24,
    small: 20,
  },
} as const;
```

- [ ] **Step 2: Create fonts.ts**

```typescript
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadJetBrains } from "@remotion/google-fonts/JetBrainsMono";

const { fontFamily: interFamily } = loadInter("normal", {
  weights: ["400", "600", "700"],
  subsets: ["latin"],
});

const { fontFamily: jetbrainsFamily } = loadJetBrains("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});

export const fonts = {
  body: interFamily,
  code: jetbrainsFamily,
} as const;
```

- [ ] **Step 3: Verify fonts load in studio**

Update `Root.tsx` placeholder to use fonts and theme:

```tsx
import { Composition } from "remotion";
import { theme } from "./styles/theme";
import { fonts } from "./styles/fonts";

const Placeholder = () => (
  <div style={{
    background: theme.colors.bg,
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: fonts.body,
    color: theme.colors.text,
    fontSize: theme.fontSize.title,
  }}>
    LLD Guide
  </div>
);

export const RemotionRoot = () => (
  <Composition
    id="Placeholder"
    component={Placeholder}
    durationInFrames={150}
    fps={30}
    width={1920}
    height={1080}
  />
);
```

```bash
npx remotion studio
```

Expected: "LLD Guide" text in Inter font on dark background.

- [ ] **Step 4: Commit**

```bash
git add autobots-docs/videos/lld-guide/src/styles/
git commit -m "feat: add dark theme and font configuration"
```

---

## Task 3: Build TitleCard Component

**Files:**
- Create: `autobots-docs/videos/lld-guide/src/components/TitleCard.tsx`

- [ ] **Step 1: Create TitleCard component**

```tsx
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../styles/theme";
import { fonts } from "../styles/fonts";

type TitleCardProps = {
  videoNumber: number;
  title: string;
  subtitle?: string;
};

export const TitleCard: React.FC<TitleCardProps> = ({ videoNumber, title, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 0.5 * fps], [0, 1], {
    extrapolateRight: "clamp",
  });

  const titleY = interpolate(frame, [0, 0.5 * fps], [30, 0], {
    extrapolateRight: "clamp",
  });

  const subtitleOpacity = interpolate(frame, [0.3 * fps, 0.8 * fps], [0, 1], {
    extrapolateRight: "clamp",
  });

  const numberOpacity = interpolate(frame, [0.1 * fps, 0.4 * fps], [0, 0.3], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: theme.colors.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: fonts.body,
      }}
    >
      <div
        style={{
          position: "absolute",
          fontSize: 300,
          fontWeight: 700,
          color: theme.colors.accent,
          opacity: numberOpacity,
        }}
      >
        {videoNumber}
      </div>
      <div
        style={{
          fontSize: theme.fontSize.title,
          fontWeight: 700,
          color: theme.colors.text,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          zIndex: 1,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            fontSize: theme.fontSize.subtitle,
            color: theme.colors.textMuted,
            opacity: subtitleOpacity,
            marginTop: theme.spacing.element,
            zIndex: 1,
          }}
        >
          {subtitle}
        </div>
      )}
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Add test composition to Root.tsx**

Add a `TitleCardTest` composition to Root.tsx to preview it:

```tsx
import { TitleCard } from "./components/TitleCard";

// Add inside RemotionRoot:
<Composition
  id="TitleCardTest"
  component={TitleCard}
  durationInFrames={150}
  fps={30}
  width={1920}
  height={1080}
  defaultProps={{ videoNumber: 1, title: "What is an LLD?", subtitle: "Building an LLD — Part 1" }}
/>
```

- [ ] **Step 3: Preview in studio**

```bash
npx remotion studio
```

Expected: Title fades in with number watermark behind it.

- [ ] **Step 4: Commit**

```bash
git add autobots-docs/videos/lld-guide/src/components/TitleCard.tsx
git commit -m "feat: add TitleCard component with fade-in animation"
```

---

## Task 4: Build BulletList Component

**Files:**
- Create: `autobots-docs/videos/lld-guide/src/components/BulletList.tsx`

- [ ] **Step 1: Create BulletList component**

```tsx
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../styles/theme";
import { fonts } from "../styles/fonts";

type BulletListProps = {
  title?: string;
  items: string[];
  staggerDelaySeconds?: number;
};

export const BulletList: React.FC<BulletListProps> = ({
  title,
  items,
  staggerDelaySeconds = 0.4,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const staggerFrames = staggerDelaySeconds * fps;

  return (
    <AbsoluteFill
      style={{
        background: theme.colors.bg,
        padding: theme.spacing.page,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        fontFamily: fonts.body,
      }}
    >
      {title && (
        <div
          style={{
            fontSize: theme.fontSize.heading,
            fontWeight: 700,
            color: theme.colors.accent,
            marginBottom: theme.spacing.section,
            opacity: interpolate(frame, [0, 0.3 * fps], [0, 1], {
              extrapolateRight: "clamp",
            }),
          }}
        >
          {title}
        </div>
      )}
      {items.map((item, i) => {
        const start = (i + 1) * staggerFrames;
        const opacity = interpolate(frame, [start, start + 0.3 * fps], [0, 1], {
          extrapolateRight: "clamp",
          extrapolateLeft: "clamp",
        });
        const x = interpolate(frame, [start, start + 0.3 * fps], [20, 0], {
          extrapolateRight: "clamp",
          extrapolateLeft: "clamp",
        });

        return (
          <div
            key={i}
            style={{
              fontSize: theme.fontSize.body,
              color: theme.colors.text,
              marginBottom: theme.spacing.element,
              opacity,
              transform: `translateX(${x}px)`,
              display: "flex",
              gap: 16,
            }}
          >
            <span style={{ color: theme.colors.accent }}>{">"}</span>
            <span>{item}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Preview with test composition**

Add `BulletListTest` composition to Root.tsx with sample items. Run `npx remotion studio`.

Expected: Bullets appear one by one with staggered fade + slide.

- [ ] **Step 3: Commit**

```bash
git add autobots-docs/videos/lld-guide/src/components/BulletList.tsx
git commit -m "feat: add BulletList component with staggered reveal"
```

---

## Task 5: Build CodeBlock Component

**Files:**
- Create: `autobots-docs/videos/lld-guide/src/components/CodeBlock.tsx`

- [ ] **Step 1: Create CodeBlock component**

```tsx
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../styles/theme";
import { fonts } from "../styles/fonts";

type CodeBlockProps = {
  title?: string;
  code: string;
  highlightLines?: number[];
  revealPerLine?: boolean;
};

export const CodeBlock: React.FC<CodeBlockProps> = ({
  title,
  code,
  highlightLines = [],
  revealPerLine = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lines = code.split("\n");
  const lineDelay = 0.15 * fps;

  return (
    <AbsoluteFill
      style={{
        background: theme.colors.bg,
        padding: theme.spacing.page,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        fontFamily: fonts.body,
      }}
    >
      {title && (
        <div
          style={{
            fontSize: theme.fontSize.heading,
            fontWeight: 700,
            color: theme.colors.accent,
            marginBottom: theme.spacing.section,
          }}
        >
          {title}
        </div>
      )}
      <div
        style={{
          background: theme.colors.bgCode,
          borderRadius: 12,
          border: `1px solid ${theme.colors.border}`,
          padding: 32,
          overflow: "hidden",
        }}
      >
        {lines.map((line, i) => {
          const start = revealPerLine ? i * lineDelay : 0;
          const opacity = interpolate(frame, [start, start + 0.2 * fps], [0, 1], {
            extrapolateRight: "clamp",
            extrapolateLeft: "clamp",
          });
          const isHighlighted = highlightLines.includes(i + 1);

          return (
            <div
              key={i}
              style={{
                fontFamily: fonts.code,
                fontSize: theme.fontSize.code,
                color: theme.colors.text,
                opacity,
                padding: "4px 8px",
                background: isHighlighted ? theme.colors.highlight : "transparent",
                borderRadius: 4,
                whiteSpace: "pre",
                lineHeight: 1.6,
              }}
            >
              <span style={{ color: theme.colors.textMuted, marginRight: 24, userSelect: "none" }}>
                {String(i + 1).padStart(2, " ")}
              </span>
              {line}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Preview with test composition**

Add `CodeBlockTest` composition with sample YAML content and `highlightLines: [2, 3]`. Run `npx remotion studio`.

Expected: Code lines reveal one at a time with line numbers, highlighted lines have blue background.

- [ ] **Step 3: Commit**

```bash
git add autobots-docs/videos/lld-guide/src/components/CodeBlock.tsx
git commit -m "feat: add CodeBlock component with line-by-line reveal"
```

---

## Task 6: Build SectionDiagram Component

**Files:**
- Create: `autobots-docs/videos/lld-guide/src/components/SectionDiagram.tsx`

- [ ] **Step 1: Create SectionDiagram component**

This renders the 7-section LLD structure as a vertical flow with the current section highlighted.

```tsx
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../styles/theme";
import { fonts } from "../styles/fonts";

const SECTIONS = [
  { num: 1, name: "Background", desc: "Requirements & context" },
  { num: 2, name: "Data Models", desc: "Entities, DTOs, messages" },
  { num: 3, name: "Services", desc: "APIs & exposure" },
  { num: 4, name: "Flows", desc: "LPU orchestration" },
  { num: 5, name: "LPUs", desc: "Atomic operations" },
  { num: 6, name: "Test Data", desc: "Reusable payloads" },
  { num: 7, name: "Test Scenarios", desc: "Given/When/Then cases" },
];

type SectionDiagramProps = {
  highlightSection?: number;
};

export const SectionDiagram: React.FC<SectionDiagramProps> = ({ highlightSection }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: theme.colors.bg,
        padding: theme.spacing.page,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: fonts.body,
        gap: 8,
      }}
    >
      {SECTIONS.map((section, i) => {
        const start = i * 0.15 * fps;
        const opacity = interpolate(frame, [start, start + 0.3 * fps], [0, 1], {
          extrapolateRight: "clamp",
          extrapolateLeft: "clamp",
        });
        const isHighlighted = highlightSection === section.num;
        const scale = isHighlighted
          ? interpolate(frame, [start + 0.3 * fps, start + 0.6 * fps], [1, 1.05], {
              extrapolateRight: "clamp",
              extrapolateLeft: "clamp",
            })
          : 1;

        return (
          <div key={section.num} style={{ opacity, width: "100%", maxWidth: 800 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: "16px 24px",
                borderRadius: 8,
                border: `2px solid ${isHighlighted ? theme.colors.accent : theme.colors.border}`,
                background: isHighlighted ? theme.colors.highlight : theme.colors.bgCard,
                transform: `scale(${scale})`,
              }}
            >
              <div
                style={{
                  fontSize: theme.fontSize.heading,
                  fontWeight: 700,
                  color: isHighlighted ? theme.colors.accent : theme.colors.textMuted,
                  minWidth: 40,
                }}
              >
                {section.num}
              </div>
              <div>
                <div
                  style={{
                    fontSize: theme.fontSize.body,
                    fontWeight: 600,
                    color: isHighlighted ? theme.colors.text : theme.colors.textMuted,
                  }}
                >
                  {section.name}
                </div>
                <div style={{ fontSize: theme.fontSize.small, color: theme.colors.textMuted }}>
                  {section.desc}
                </div>
              </div>
            </div>
            {i < SECTIONS.length - 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  color: theme.colors.textMuted,
                  fontSize: 20,
                }}
              >
                |
              </div>
            )}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Preview with `highlightSection={2}` and verify**

```bash
npx remotion studio
```

Expected: 7 sections in a vertical flow, section 2 highlighted with blue border and scale.

- [ ] **Step 3: Commit**

```bash
git add autobots-docs/videos/lld-guide/src/components/SectionDiagram.tsx
git commit -m "feat: add SectionDiagram component with highlight animation"
```

---

## Task 7: Build TableView Component

**Files:**
- Create: `autobots-docs/videos/lld-guide/src/components/TableView.tsx`

- [ ] **Step 1: Create TableView component**

```tsx
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../styles/theme";
import { fonts } from "../styles/fonts";

type TableViewProps = {
  title?: string;
  headers: string[];
  rows: string[][];
  staggerDelaySeconds?: number;
};

export const TableView: React.FC<TableViewProps> = ({
  title,
  headers,
  rows,
  staggerDelaySeconds = 0.3,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const staggerFrames = staggerDelaySeconds * fps;

  return (
    <AbsoluteFill
      style={{
        background: theme.colors.bg,
        padding: theme.spacing.page,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        fontFamily: fonts.body,
      }}
    >
      {title && (
        <div
          style={{
            fontSize: theme.fontSize.heading,
            fontWeight: 700,
            color: theme.colors.accent,
            marginBottom: theme.spacing.section,
          }}
        >
          {title}
        </div>
      )}
      <div
        style={{
          background: theme.colors.bgCard,
          borderRadius: 12,
          border: `1px solid ${theme.colors.border}`,
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", background: theme.colors.bgCode, padding: "16px 24px" }}>
          {headers.map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                fontSize: theme.fontSize.small,
                fontWeight: 700,
                color: theme.colors.accent,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {h}
            </div>
          ))}
        </div>
        {rows.map((row, ri) => {
          const start = (ri + 1) * staggerFrames;
          const opacity = interpolate(frame, [start, start + 0.3 * fps], [0, 1], {
            extrapolateRight: "clamp",
            extrapolateLeft: "clamp",
          });

          return (
            <div
              key={ri}
              style={{
                display: "flex",
                padding: "14px 24px",
                opacity,
                borderTop: `1px solid ${theme.colors.border}`,
              }}
            >
              {row.map((cell, ci) => (
                <div
                  key={ci}
                  style={{
                    flex: 1,
                    fontSize: theme.fontSize.code,
                    color: theme.colors.text,
                    fontFamily: ci === 0 ? fonts.code : fonts.body,
                  }}
                >
                  {cell}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Preview with LLD section summary table data**

Expected: Header row visible immediately, data rows appear one by one.

- [ ] **Step 3: Commit**

```bash
git add autobots-docs/videos/lld-guide/src/components/TableView.tsx
git commit -m "feat: add TableView component with row reveal animation"
```

---

## Task 8: Build VideoShell Component

**Files:**
- Create: `autobots-docs/videos/lld-guide/src/components/VideoShell.tsx`

- [ ] **Step 1: Create VideoShell — the TransitionSeries wrapper**

This is the reusable shell that every video uses. It takes 4 scene components and their audio files, wiring them with fade transitions.

```tsx
import { AbsoluteFill } from "remotion";
import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { staticFile } from "remotion";
import type { SceneConfig } from "../types";

type VideoShellProps = {
  scenes: SceneConfig[];
  children: React.ReactNode[];
};

const TRANSITION_FRAMES = 15;

export const VideoShell: React.FC<VideoShellProps> = ({ scenes, children }) => {
  return (
    <AbsoluteFill>
      <TransitionSeries>
        {children.map((child, i) => {
          const scene = scenes[i];
          return [
            i > 0 && (
              <TransitionSeries.Transition
                key={`t-${i}`}
                presentation={fade()}
                timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
              />
            ),
            <TransitionSeries.Sequence
              key={scene.id}
              durationInFrames={scene.durationInFrames}
            >
              {child}
              <Audio src={staticFile(scene.audioFile)} />
            </TransitionSeries.Sequence>,
          ];
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};

export const TRANSITION_DURATION = TRANSITION_FRAMES;
```

- [ ] **Step 2: Preview by wiring TitleCard and BulletList in a test composition**

Create a `VideoShellTest` composition with 2 scenes, hardcoded durations, and no audio (comment out `<Audio>` for now). Verify fade transition between scenes.

- [ ] **Step 3: Commit**

```bash
git add autobots-docs/videos/lld-guide/src/components/VideoShell.tsx
git commit -m "feat: add VideoShell component with TransitionSeries + fade"
```

---

## Task 9: Write V1 Narration Script

**Files:**
- Create: `autobots-docs/videos/lld-guide/src/scripts/v1-intro.md`

- [ ] **Step 1: Write v1-intro.md**

Derive narration from `autobots-docs/docs/building-an-lld/lld-structure-overview.md`. Follow the 4-scene format:

```markdown
# V1: What is an LLD?

## Scene: Title (~5s)
[Visual: TitleCard with number 1, title "What is an LLD?", subtitle "Building an LLD"]
"Welcome to the LLD guide series. In this first video, we'll cover what a Low-Level Design document is and how its seven sections work together."

## Scene: What & Why (~35s)
[Visual: SectionDiagram with no highlight — all 7 sections visible]
"A Low-Level Design document captures everything a developer needs to implement a feature. It bridges the gap between requirements and code. An LLD has seven sections: Background, Data Models, Services, Flows, Logical Processing Units, Test Data, and Test Scenarios. Each section builds on the ones before it, creating a complete blueprint for implementation."

## Scene: Walkthrough (~80s)
[Visual: SectionDiagram cycling highlights 1 through 7; then TableView with section summary]
"Let's walk through how these sections connect. Background provides the 'what' and 'why' — the functional requirements and business context that inform everything else. Data Models define your structures — tables, entities, DTOs, and messages. Services describe how functionality is exposed to consumers — REST APIs, async streams, or batch operations. Flows stitch together Logical Processing Units in a specific sequence to implement each service operation. LPUs are the atomic business operations — validation, enrichment, processing, persistence. Test Data creates reusable payloads for your test cases. And Test Scenarios validate your services end-to-end using Given, When, Then format."

## Scene: Recap + Next (~15s)
[Visual: BulletList with 3 key takeaways]
"To recap: an LLD is a seven-section blueprint that takes you from requirements to code. Each section has a clear purpose and builds on the others. In the next video, we'll dive into the Background section — where every LLD begins."
```

- [ ] **Step 2: Commit**

```bash
git add autobots-docs/videos/lld-guide/src/scripts/v1-intro.md
git commit -m "feat: add V1 intro narration script"
```

---

## Task 10: Generate V1 TTS Audio

**Files:**
- Create: `autobots-docs/videos/lld-guide/generate-voiceover.ts`
- Create: `autobots-docs/videos/lld-guide/public/voiceover/v1-intro/*.mp3`

- [ ] **Step 1: Create generate-voiceover.ts**

```typescript
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
if (!ELEVENLABS_API_KEY) {
  console.error("Set ELEVENLABS_API_KEY environment variable");
  process.exit(1);
}

const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel — change to preferred voice

type SceneScript = {
  id: string;
  narration: string;
};

function parseScript(filePath: string): SceneScript[] {
  const content = readFileSync(filePath, "utf-8");
  const scenes: SceneScript[] = [];
  const sceneRegex = /## Scene: (\w[\w\s&]*)\s*\(.*?\)\n\[Visual:.*?\]\n"([\s\S]*?)"/g;
  let match;

  while ((match = sceneRegex.exec(content)) !== null) {
    const id = match[1].toLowerCase().replace(/[\s&]+/g, "-");
    const narration = match[2].replace(/\n/g, " ").trim();
    scenes.push({ id, narration });
  }

  return scenes;
}

async function generateAudio(text: string, outputPath: string): Promise<void> {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY!,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.3,
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.status} ${await response.text()}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(outputPath, audioBuffer);
  console.log(`  Written: ${outputPath}`);
}

async function processScript(scriptFile: string, videoId: string): Promise<void> {
  const scriptPath = join("src", "scripts", scriptFile);
  const outputDir = join("public", "voiceover", videoId);

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const scenes = parseScript(scriptPath);
  console.log(`\nProcessing ${scriptFile} (${scenes.length} scenes)`);

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const filename = `scene-${String(i + 1).padStart(2, "0")}-${scene.id}.mp3`;
    const outputPath = join(outputDir, filename);

    if (existsSync(outputPath)) {
      console.log(`  Skipping (exists): ${outputPath}`);
      continue;
    }

    await generateAudio(scene.narration, outputPath);
  }
}

// Process specific scripts or all
const args = process.argv.slice(2);
const scripts: Array<[string, string]> = [
  ["v1-intro.md", "v1-intro"],
  ["v2-background.md", "v2-background"],
  ["v3-data-models.md", "v3-data-models"],
  ["v4-services.md", "v4-services"],
  ["v5-flows.md", "v5-flows"],
  ["v6-lpus.md", "v6-lpus"],
  ["v7-test-data.md", "v7-test-data"],
  ["v8-test-scenarios.md", "v8-test-scenarios"],
];

const toProcess = args.length > 0
  ? scripts.filter(([file]) => args.some((a) => file.includes(a)))
  : scripts.filter(([file]) => existsSync(join("src", "scripts", file)));

for (const [file, id] of toProcess) {
  await processScript(file, id);
}

console.log("\nDone!");
```

- [ ] **Step 2: Generate V1 audio**

```bash
cd autobots-docs/videos/lld-guide
export ELEVENLABS_API_KEY=<your-key>
node --strip-types generate-voiceover.ts v1
```

Expected: 4 MP3 files in `public/voiceover/v1-intro/`.

- [ ] **Step 3: Commit** (exclude MP3s from git if large — add to `.gitignore`)

```bash
echo "public/voiceover/" >> .gitignore
git add generate-voiceover.ts .gitignore
git commit -m "feat: add TTS voiceover generation script"
```

---

## Task 11: Build V1 Intro Video Composition

**Files:**
- Create: `autobots-docs/videos/lld-guide/src/videos/V1Intro.tsx`
- Modify: `autobots-docs/videos/lld-guide/src/Root.tsx`

- [ ] **Step 1: Create V1Intro.tsx**

```tsx
import { TitleCard } from "../components/TitleCard";
import { SectionDiagram } from "../components/SectionDiagram";
import { BulletList } from "../components/BulletList";
import { VideoShell } from "../components/VideoShell";
import type { VideoProps } from "../types";

export const V1Intro: React.FC<VideoProps> = ({ scenes }) => {
  return (
    <VideoShell scenes={scenes}>
      <TitleCard
        videoNumber={1}
        title="What is an LLD?"
        subtitle="Building an LLD"
      />
      <SectionDiagram />
      <SectionDiagram highlightSection={1} />
      <BulletList
        title="Recap"
        items={[
          "An LLD is a 7-section blueprint: requirements to code",
          "Each section has a clear purpose and builds on the others",
          "Next up: the Background section",
        ]}
      />
    </VideoShell>
  );
};
```

- [ ] **Step 2: Wire V1 into Root.tsx with calculateMetadata**

```tsx
import { Composition, Folder, CalculateMetadataFunction, staticFile } from "remotion";
import { getAudioDuration } from "./get-audio-duration";
import { V1Intro } from "./videos/V1Intro";
import type { VideoProps } from "./types";
import { TRANSITION_DURATION } from "./components/VideoShell";

const FPS = 30;

const V1_AUDIO_FILES = [
  { id: "title", audioFile: "voiceover/v1-intro/scene-01-title.mp3" },
  { id: "what-why", audioFile: "voiceover/v1-intro/scene-02-what-why.mp3" },
  { id: "walkthrough", audioFile: "voiceover/v1-intro/scene-03-walkthrough.mp3" },
  { id: "recap", audioFile: "voiceover/v1-intro/scene-04-recap.mp3" },
];

const calculateV1Metadata: CalculateMetadataFunction<VideoProps> = async () => {
  const durations = await Promise.all(
    V1_AUDIO_FILES.map((s) => getAudioDuration(staticFile(s.audioFile))),
  );

  const scenes = V1_AUDIO_FILES.map((s, i) => ({
    id: s.id,
    audioFile: s.audioFile,
    durationInFrames: Math.ceil(durations[i] * FPS) + FPS, // +1s padding
  }));

  const totalFrames = scenes.reduce((sum, s) => sum + s.durationInFrames, 0)
    - TRANSITION_DURATION * (scenes.length - 1);

  return {
    durationInFrames: totalFrames,
    props: { scenes },
  };
};

export const RemotionRoot = () => (
  <Folder name="LLD-Guide">
    <Composition
      id="V1Intro"
      component={V1Intro}
      durationInFrames={300}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={{ scenes: [] }}
      calculateMetadata={calculateV1Metadata}
    />
  </Folder>
);
```

- [ ] **Step 3: Preview V1 end-to-end**

```bash
npx remotion studio
```

Expected: V1Intro plays with all 4 scenes, audio synced, fade transitions between scenes.

- [ ] **Step 4: Render V1**

```bash
mkdir -p out
npx remotion render V1Intro out/v1-intro.mp4
```

Expected: MP4 file at `out/v1-intro.mp4`.

- [ ] **Step 5: Commit**

```bash
git add src/videos/V1Intro.tsx src/Root.tsx
git commit -m "feat: add V1 Intro composition with audio-driven duration"
```

---

## Task 12: Write V2-V8 Narration Scripts

**Files:**
- Create: `src/scripts/v2-background.md` through `src/scripts/v8-test-scenarios.md`

- [ ] **Step 1: Write v2-background.md**

Derive from `autobots-docs/docs/building-an-lld/lld-background.md`. Follow same 4-scene format. Cover: Purpose, Functional Overview, Scope, Assumptions, Dependencies, References.

- [ ] **Step 2: Write v3-data-models.md**

Derive from `lld-data-models.md`. Cover: data-at-rest vs in-motion vs API boundary, entities, DTOs, messages, enums, schema definitions.

- [ ] **Step 3: Write v4-services.md**

Derive from `lld-services.md`. Cover: service identity, I/O, sync REST / async streaming / batch exposure.

- [ ] **Step 4: Write v5-flows.md**

Derive from `lld-flows.md`. Cover: LPU orchestration, state transitions, transactional boundaries.

- [ ] **Step 5: Write v6-lpus.md**

Derive from `lld-logical-processing-units.md`. Cover: Manual/LLM Assisted/Standard types, 8 sub-types (Validation, Enrichment, etc.), input/output data models.

- [ ] **Step 6: Write v7-test-data.md**

Derive from `lld-test-data.md`. Cover: summary tables, detail tables, base data + overrides, parent-child.

- [ ] **Step 7: Write v8-test-scenarios.md**

Derive from `lld-test-scenarios.md`. Cover: Given/When/Then, 4 scenario types, 3 priority levels.

- [ ] **Step 8: Commit all scripts**

```bash
git add src/scripts/
git commit -m "feat: add V2-V8 narration scripts"
```

---

## Task 13: Generate V2-V8 TTS Audio

- [ ] **Step 1: Batch generate all remaining audio**

```bash
cd autobots-docs/videos/lld-guide
node --strip-types generate-voiceover.ts
```

Expected: MP3 files in `public/voiceover/v2-background/` through `public/voiceover/v8-test-scenarios/`.

- [ ] **Step 2: Spot-check audio quality**

Listen to at least one scene from each video. Re-generate any that sound off.

---

## Task 14: Build V2-V8 Video Compositions

**Files:**
- Create: `src/videos/V2Background.tsx` through `src/videos/V8TestScenarios.tsx`
- Modify: `src/Root.tsx` — add all 8 compositions

- [ ] **Step 1: Create V2Background.tsx**

Uses: TitleCard(2, "Background & Requirements"), SectionDiagram(highlight=1), TableView (sub-sections table), BulletList (tips).

- [ ] **Step 2: Create V3DataModels.tsx**

Uses: TitleCard(3, "Data Models"), SectionDiagram(highlight=2), CodeBlock (entity YAML example), TableView (3 data model types).

- [ ] **Step 3: Create V4Services.tsx**

Uses: TitleCard(4, "Services"), SectionDiagram(highlight=3), TableView (service identity fields), CodeBlock (service I/O example).

- [ ] **Step 4: Create V5Flows.tsx**

Uses: TitleCard(5, "Flows"), SectionDiagram(highlight=4), BulletList (flow pattern: Validate → Enrich → Process → Persist → Publish).

- [ ] **Step 5: Create V6LPUs.tsx**

Uses: TitleCard(6, "Logical Processing Units"), SectionDiagram(highlight=5), TableView (8 sub-types), CodeBlock (LPU definition example).

- [ ] **Step 6: Create V7TestData.tsx**

Uses: TitleCard(7, "Test Data"), SectionDiagram(highlight=6), TableView (summary table example), CodeBlock (base + override pattern).

- [ ] **Step 7: Create V8TestScenarios.tsx**

Uses: TitleCard(8, "Test Scenarios"), SectionDiagram(highlight=7), CodeBlock (Given/When/Then example), TableView (scenario types + priorities).

- [ ] **Step 8: Register all compositions in Root.tsx**

Add `calculateMetadata` functions for V2-V8, following the same pattern as V1. Use `<Folder name="LLD-Guide">`.

- [ ] **Step 9: Preview all 8 videos**

```bash
npx remotion studio
```

Walk through each composition in the studio. Verify timing, transitions, and audio sync.

- [ ] **Step 10: Commit**

```bash
git add src/videos/ src/Root.tsx
git commit -m "feat: add V2-V8 video compositions"
```

---

## Task 15: Final Render and Review

- [ ] **Step 1: Render all videos**

```bash
for i in 1 2 3 4 5 6 7 8; do
  npx remotion render "V${i}*" "out/v${i}.mp4"
done
```

Or use Remotion's batch render if composition IDs are predictable.

- [ ] **Step 2: Watch all 8 videos end-to-end**

Check for: audio/visual sync, transition smoothness, text readability, content accuracy against source docs.

- [ ] **Step 3: Fix any issues and re-render affected videos**

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "feat: complete LLD video guide series — 8 videos"
```

---

## Verification

1. **Studio preview**: `npx remotion studio` — all 8 compositions visible under LLD-Guide folder
2. **Audio sync**: Each scene's visuals align with narration timing
3. **Content accuracy**: Compare narration scripts against source docs in `docs/building-an-lld/`
4. **Render output**: 8 MP4 files in `out/`, each 2-3 minutes, 1920x1080 @ 30fps
5. **Font rendering**: Inter and JetBrains Mono render correctly (no fallback fonts)
