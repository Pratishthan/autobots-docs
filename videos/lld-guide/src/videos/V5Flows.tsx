import { TitleCard } from "../components/TitleCard";
import { SectionDiagram } from "../components/SectionDiagram";
import { BulletList } from "../components/BulletList";
import { TableView } from "../components/TableView";
import { VideoShell } from "../components/VideoShell";
import type { VideoProps } from "../types";

export const V5Flows: React.FC<VideoProps> = ({ scenes }) => {
  return (
    <VideoShell scenes={scenes}>
      <TitleCard videoNumber={5} title="Flows" subtitle="Building an LLD — Part 5" />
      <SectionDiagram highlightSection={4} />
      <BulletList
        title="Standard Flow Pattern"
        items={[
          "1. Validate — Input and business rule checks",
          "2. Enrich — Fetch additional data needed",
          "3. Process — Apply business rules and calculations",
          "4. Persist — Store result in database",
          "5. Publish — Notify downstream systems",
        ]}
      />
      <BulletList
        title="Recap"
        items={[
          "Flows orchestrate LPUs in sequence within a service",
          "Follow: Validate → Enrich → Process → Persist → Publish",
          "Next up: Logical Processing Units",
        ]}
      />
    </VideoShell>
  );
};
