import { TitleCard } from "../components/TitleCard";
import { SectionDiagram } from "../components/SectionDiagram";
import { CodeBlock } from "../components/CodeBlock";
import { BulletList } from "../components/BulletList";
import { VideoShell } from "../components/VideoShell";
import type { VideoProps } from "../types";

const SCENARIO_EXAMPLE = `Scenario: Create Party with all attributes
  Service: partyCreation
  Priority: L1 (Critical)

  Given: Individual Party with Full Contact Details
  When:  I call partyCreation service
  Then:  200 OK with generated partyId

Scenario: Duplicate Party number
  Service: partyCreation
  Priority: L1 (Critical)

  Given: Party with number 123 already exists
  When:  I create another party with number 123
  Then:  Error PARTY_NUMBER_ALREADY_EXISTS`;

export const V8TestScenarios: React.FC<VideoProps> = ({ scenes }) => {
  return (
    <VideoShell scenes={scenes}>
      <TitleCard videoNumber={8} title="Test Scenarios" subtitle="Building an LLD — Part 8" />
      <SectionDiagram highlightSection={7} />
      <CodeBlock
        title="Given / When / Then"
        code={SCENARIO_EXAMPLE}
        highlightLines={[5, 6, 7, 13, 14, 15]}
      />
      <BulletList
        title="Series Recap"
        items={[
          "Test Scenarios validate everything you've designed",
          "Use Given/When/Then, reference Test Data by name",
          "Prioritize: L1 critical, L2 important, L3 nice-to-have",
          "7 sections: requirements to testable blueprint",
        ]}
      />
    </VideoShell>
  );
};
