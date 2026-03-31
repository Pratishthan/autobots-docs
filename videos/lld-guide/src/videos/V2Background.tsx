import { TitleCard } from "../components/TitleCard";
import { SectionDiagram } from "../components/SectionDiagram";
import { TableView } from "../components/TableView";
import { BulletList } from "../components/BulletList";
import { VideoShell } from "../components/VideoShell";
import type { VideoProps } from "../types";

export const V2Background: React.FC<VideoProps> = ({ scenes }) => {
  return (
    <VideoShell scenes={scenes}>
      <TitleCard
        videoNumber={2}
        title="Background & Requirements"
        subtitle="Building an LLD — Part 2"
      />
      <SectionDiagram highlightSection={1} />
      <TableView
        title="Background Sub-sections"
        headers={["Sub-section", "Purpose", "Format"]}
        rows={[
          ["Purpose", "Business problem being solved", "Free-text"],
          ["Functional Overview", "High-level feature summary", "Free-text"],
          ["In Scope / Out of Scope", "Clear boundaries", "Bullet lists"],
          ["Assumptions", "Known constraints", "Bullet list"],
          ["Dependencies", "External services & teams", "Table"],
          ["References", "Source documents", "Table"],
        ]}
      />
      <BulletList
        title="Recap"
        items={[
          "Background is your LLD's foundation",
          "Be specific about the business problem, set clear scope",
          "Next up: Data Models",
        ]}
      />
    </VideoShell>
  );
};
