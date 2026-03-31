import { Composition, Folder, staticFile } from "remotion";
import type { CalculateMetadataFunction } from "remotion";
import { getAudioDuration } from "./get-audio-duration";
import { V1Intro } from "./videos/V1Intro";
import { V2Background } from "./videos/V2Background";
import { V3DataModels } from "./videos/V3DataModels";
import { V4Services } from "./videos/V4Services";
import { V5Flows } from "./videos/V5Flows";
import { V6LPUs } from "./videos/V6LPUs";
import { V7TestData } from "./videos/V7TestData";
import { V8TestScenarios } from "./videos/V8TestScenarios";
import { TitleCard } from "./components/TitleCard";
import { BulletList } from "./components/BulletList";
import { CodeBlock } from "./components/CodeBlock";
import { SectionDiagram } from "./components/SectionDiagram";
import { TableView } from "./components/TableView";
import { TRANSITION_DURATION } from "./components/VideoShell";
import type { VideoProps } from "./types";

const FPS = 30;

type AudioFileConfig = { id: string; audioFile: string };

const safeGetDuration = async (src: string, fallbackSeconds: number): Promise<number> => {
  try {
    return await getAudioDuration(src);
  } catch {
    return fallbackSeconds;
  }
};

const buildCalculateMetadata = (
  audioFiles: AudioFileConfig[],
  fallbackDurations: number[],
): CalculateMetadataFunction<VideoProps> => {
  return async () => {
    const durations = await Promise.all(
      audioFiles.map((s, i) =>
        safeGetDuration(staticFile(s.audioFile), fallbackDurations[i]),
      ),
    );

    const scenes = audioFiles.map((s, i) => ({
      id: s.id,
      audioFile: s.audioFile,
      durationInFrames: Math.ceil(durations[i] * FPS) + FPS,
    }));

    const totalFrames =
      scenes.reduce((sum, s) => sum + s.durationInFrames, 0) -
      TRANSITION_DURATION * (scenes.length - 1);

    return {
      durationInFrames: totalFrames,
      props: { scenes },
    };
  };
};

// Audio file configs per video
const V1_AUDIO = [
  { id: "title", audioFile: "voiceover/v1-intro/scene-01-title.mp3" },
  { id: "what-why", audioFile: "voiceover/v1-intro/scene-02-what-why.mp3" },
  { id: "walkthrough", audioFile: "voiceover/v1-intro/scene-03-walkthrough.mp3" },
  { id: "recap-next", audioFile: "voiceover/v1-intro/scene-04-recap-next.mp3" },
];

const V2_AUDIO = [
  { id: "title", audioFile: "voiceover/v2-background/scene-01-title.mp3" },
  { id: "what-why", audioFile: "voiceover/v2-background/scene-02-what-why.mp3" },
  { id: "walkthrough", audioFile: "voiceover/v2-background/scene-03-walkthrough.mp3" },
  { id: "recap-next", audioFile: "voiceover/v2-background/scene-04-recap-next.mp3" },
];

const V3_AUDIO = [
  { id: "title", audioFile: "voiceover/v3-data-models/scene-01-title.mp3" },
  { id: "what-why", audioFile: "voiceover/v3-data-models/scene-02-what-why.mp3" },
  { id: "walkthrough", audioFile: "voiceover/v3-data-models/scene-03-walkthrough.mp3" },
  { id: "recap-next", audioFile: "voiceover/v3-data-models/scene-04-recap-next.mp3" },
];

const V4_AUDIO = [
  { id: "title", audioFile: "voiceover/v4-services/scene-01-title.mp3" },
  { id: "what-why", audioFile: "voiceover/v4-services/scene-02-what-why.mp3" },
  { id: "walkthrough", audioFile: "voiceover/v4-services/scene-03-walkthrough.mp3" },
  { id: "recap-next", audioFile: "voiceover/v4-services/scene-04-recap-next.mp3" },
];

const V5_AUDIO = [
  { id: "title", audioFile: "voiceover/v5-flows/scene-01-title.mp3" },
  { id: "what-why", audioFile: "voiceover/v5-flows/scene-02-what-why.mp3" },
  { id: "walkthrough", audioFile: "voiceover/v5-flows/scene-03-walkthrough.mp3" },
  { id: "recap-next", audioFile: "voiceover/v5-flows/scene-04-recap-next.mp3" },
];

const V6_AUDIO = [
  { id: "title", audioFile: "voiceover/v6-lpus/scene-01-title.mp3" },
  { id: "what-why", audioFile: "voiceover/v6-lpus/scene-02-what-why.mp3" },
  { id: "walkthrough", audioFile: "voiceover/v6-lpus/scene-03-walkthrough.mp3" },
  { id: "recap-next", audioFile: "voiceover/v6-lpus/scene-04-recap-next.mp3" },
];

const V7_AUDIO = [
  { id: "title", audioFile: "voiceover/v7-test-data/scene-01-title.mp3" },
  { id: "what-why", audioFile: "voiceover/v7-test-data/scene-02-what-why.mp3" },
  { id: "walkthrough", audioFile: "voiceover/v7-test-data/scene-03-walkthrough.mp3" },
  { id: "recap-next", audioFile: "voiceover/v7-test-data/scene-04-recap-next.mp3" },
];

const V8_AUDIO = [
  { id: "title", audioFile: "voiceover/v8-test-scenarios/scene-01-title.mp3" },
  { id: "what-why", audioFile: "voiceover/v8-test-scenarios/scene-02-what-why.mp3" },
  { id: "walkthrough", audioFile: "voiceover/v8-test-scenarios/scene-03-walkthrough.mp3" },
  { id: "recap-next", audioFile: "voiceover/v8-test-scenarios/scene-04-recap-next.mp3" },
];

// Fallback durations (seconds) per scene — used when audio files don't exist yet
const calculateV1 = buildCalculateMetadata(V1_AUDIO, [5, 35, 80, 15]);
const calculateV2 = buildCalculateMetadata(V2_AUDIO, [5, 35, 80, 15]);
const calculateV3 = buildCalculateMetadata(V3_AUDIO, [5, 40, 80, 15]);
const calculateV4 = buildCalculateMetadata(V4_AUDIO, [5, 35, 70, 15]);
const calculateV5 = buildCalculateMetadata(V5_AUDIO, [5, 35, 70, 15]);
const calculateV6 = buildCalculateMetadata(V6_AUDIO, [5, 40, 70, 15]);
const calculateV7 = buildCalculateMetadata(V7_AUDIO, [5, 35, 80, 15]);
const calculateV8 = buildCalculateMetadata(V8_AUDIO, [5, 40, 70, 15]);

export const RemotionRoot = () => (
  <>
    <Folder name="LLD-Guide">
      <Composition
        id="V1Intro"
        component={V1Intro}
        durationInFrames={300}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ scenes: [] }}
        calculateMetadata={calculateV1}
      />
      <Composition
        id="V2Background"
        component={V2Background}
        durationInFrames={300}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ scenes: [] }}
        calculateMetadata={calculateV2}
      />
      <Composition
        id="V3DataModels"
        component={V3DataModels}
        durationInFrames={300}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ scenes: [] }}
        calculateMetadata={calculateV3}
      />
      <Composition
        id="V4Services"
        component={V4Services}
        durationInFrames={300}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ scenes: [] }}
        calculateMetadata={calculateV4}
      />
      <Composition
        id="V5Flows"
        component={V5Flows}
        durationInFrames={300}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ scenes: [] }}
        calculateMetadata={calculateV5}
      />
      <Composition
        id="V6LPUs"
        component={V6LPUs}
        durationInFrames={300}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ scenes: [] }}
        calculateMetadata={calculateV6}
      />
      <Composition
        id="V7TestData"
        component={V7TestData}
        durationInFrames={300}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ scenes: [] }}
        calculateMetadata={calculateV7}
      />
      <Composition
        id="V8TestScenarios"
        component={V8TestScenarios}
        durationInFrames={300}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ scenes: [] }}
        calculateMetadata={calculateV8}
      />
    </Folder>
    <Folder name="Component-Tests">
      <Composition
        id="TitleCardTest"
        component={TitleCard}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          videoNumber: 1,
          title: "What is an LLD?",
          subtitle: "Building an LLD — Part 1",
        }}
      />
      <Composition
        id="BulletListTest"
        component={BulletList}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: "Key Takeaways",
          items: [
            "An LLD is a 7-section blueprint",
            "Each section builds on the others",
            "Start with Background, end with Test Scenarios",
          ],
        }}
      />
      <Composition
        id="CodeBlockTest"
        component={CodeBlock}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: "Agent Configuration",
          code: `agents:
  model_list_extractor:
    prompt: "model-list-extractor"
    output_schema: "model-list.json"
    batch_enabled: false
    tools: ["mer_read_file_tool"]`,
          highlightLines: [2, 3],
        }}
      />
      <Composition
        id="SectionDiagramTest"
        component={SectionDiagram}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ highlightSection: 2 }}
      />
      <Composition
        id="TableViewTest"
        component={TableView}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: "LLD Sections",
          headers: ["Section", "Purpose", "Output"],
          rows: [
            ["Background", "Requirements & context", "Scope definition"],
            ["Data Models", "Entities & DTOs", "Schema definitions"],
            ["Services", "API exposure", "Service contracts"],
          ],
        }}
      />
    </Folder>
  </>
);
