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
