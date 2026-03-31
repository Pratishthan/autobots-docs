import { TitleCard } from "../components/TitleCard";
import { SectionDiagram } from "../components/SectionDiagram";
import { TableView } from "../components/TableView";
import { BulletList } from "../components/BulletList";
import { VideoShell } from "../components/VideoShell";
import type { VideoProps } from "../types";

export const V4Services: React.FC<VideoProps> = ({ scenes }) => {
  return (
    <VideoShell scenes={scenes}>
      <TitleCard videoNumber={4} title="Services" subtitle="Building an LLD — Part 4" />
      <SectionDiagram highlightSection={3} />
      <TableView
        title="Service Identity & I/O"
        headers={["Service", "Operation", "Invocation", "Input", "Output"]}
        rows={[
          ["partyCreation", "CREATE", "Sync + Async", "Party", "Party"],
          ["partyModification", "UPDATE BY ID", "Sync", "Party", "Party"],
          ["fetchPartyById", "FETCH BY ID", "Sync", "—", "Party"],
        ]}
      />
      <BulletList
        title="Recap"
        items={[
          "Services expose functionality: sync, async, or batch",
          "Separate identity from I/O for clarity",
          "Next up: Flows",
        ]}
      />
    </VideoShell>
  );
};
