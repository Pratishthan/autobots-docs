import { TitleCard } from "../components/TitleCard";
import { SectionDiagram } from "../components/SectionDiagram";
import { BulletList } from "../components/BulletList";
import { VideoShell } from "../components/VideoShell";
import type { VideoProps } from "../types";

export const V1Intro: React.FC<VideoProps> = ({ scenes }) => {
  return (
    <VideoShell scenes={scenes}>
      <TitleCard videoNumber={1} title="What is an LLD?" subtitle="Building an LLD" />
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
