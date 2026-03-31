import { TitleCard } from "../components/TitleCard";
import { SectionDiagram } from "../components/SectionDiagram";
import { CodeBlock } from "../components/CodeBlock";
import { BulletList } from "../components/BulletList";
import { VideoShell } from "../components/VideoShell";
import type { VideoProps } from "../types";

const ENTITY_EXAMPLE = `Model: Party
  Type: Hybrid (Entity + DTO)
  Is New: True
  PK Strategy: UUID

  Attributes:
    partyNumber    String   [Y]  Business Key
    partyName      String   [Y]  Full name
    partyTypeCode  Enum     [Y]  INDIVIDUAL | ORGANIZATION
    dobOrDateOfInc LocalDate [N]  Date of birth or incorporation`;

export const V3DataModels: React.FC<VideoProps> = ({ scenes }) => {
  return (
    <VideoShell scenes={scenes}>
      <TitleCard videoNumber={3} title="Data Models" subtitle="Building an LLD — Part 3" />
      <SectionDiagram highlightSection={2} />
      <CodeBlock
        title="Entity Definition Example"
        code={ENTITY_EXAMPLE}
        highlightLines={[2, 3, 4]}
      />
      <BulletList
        title="Recap"
        items={[
          "Three categories: at rest, in motion, API boundary",
          "Each model needs schema + business metadata",
          "Next up: Services",
        ]}
      />
    </VideoShell>
  );
};
