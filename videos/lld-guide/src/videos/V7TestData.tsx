import { TitleCard } from "../components/TitleCard";
import { SectionDiagram } from "../components/SectionDiagram";
import { TableView } from "../components/TableView";
import { BulletList } from "../components/BulletList";
import { VideoShell } from "../components/VideoShell";
import type { VideoProps } from "../types";

export const V7TestData: React.FC<VideoProps> = ({ scenes }) => {
  return (
    <VideoShell scenes={scenes}>
      <TitleCard videoNumber={7} title="Test Data" subtitle="Building an LLD — Part 7" />
      <SectionDiagram highlightSection={6} />
      <TableView
        title="Test Data Summary"
        headers={["Data Set", "Model", "Base", "Purpose"]}
        rows={[
          ["Individual Full", "Party", "—", "Happy path with all attributes"],
          ["Individual Minimal", "Party", "—", "Mandatory fields only"],
          ["Organization", "Party", "Individual Full", "Override partyType"],
        ]}
      />
      <BulletList
        title="Recap"
        items={[
          "Summary + detail structure with base data and overrides",
          "Handle parent-child models with linked tables",
          "Next up: Test Scenarios — the final section",
        ]}
      />
    </VideoShell>
  );
};
