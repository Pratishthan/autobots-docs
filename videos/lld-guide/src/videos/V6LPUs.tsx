import { TitleCard } from "../components/TitleCard";
import { SectionDiagram } from "../components/SectionDiagram";
import { TableView } from "../components/TableView";
import { CodeBlock } from "../components/CodeBlock";
import { VideoShell } from "../components/VideoShell";
import type { VideoProps } from "../types";

const LPU_EXAMPLE = `Unit: validateParty
  Type: LLM Assisted
  Sub-Type: Validation
  Input: Party
  Output: Party (validated)

  Business Logic:
    1. Check if partyNumber exists in database
    2. If exists → throw PARTY_NUMBER_ALREADY_EXISTS
    3. If not → pass validation`;

export const V6LPUs: React.FC<VideoProps> = ({ scenes }) => {
  return (
    <VideoShell scenes={scenes}>
      <TitleCard
        videoNumber={6}
        title="Logical Processing Units"
        subtitle="Building an LLD — Part 6"
      />
      <SectionDiagram highlightSection={5} />
      <TableView
        title="LPU Sub-Types"
        headers={["Sub-Type", "Purpose"]}
        rows={[
          ["Validation", "Input and business rule checks"],
          ["Enrichment", "Fetching additional data"],
          ["Host Call", "Calling external systems"],
          ["Processing", "Core business logic"],
          ["Persistence", "Writing to data store"],
          ["SetDefaults", "Applying default values"],
          ["Transformation", "Converting data formats"],
          ["Complete", "Finalising or aggregating"],
        ]}
      />
      <CodeBlock title="LPU Definition Example" code={LPU_EXAMPLE} highlightLines={[2, 3]} />
    </VideoShell>
  );
};
