import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../styles/theme";
import { fonts } from "../styles/fonts";

type CodeBlockProps = {
  title?: string;
  code: string;
  highlightLines?: number[];
  revealPerLine?: boolean;
};

export const CodeBlock: React.FC<CodeBlockProps> = ({
  title,
  code,
  highlightLines = [],
  revealPerLine = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lines = code.split("\n");
  const lineDelay = 0.15 * fps;

  return (
    <AbsoluteFill
      style={{
        background: theme.colors.bg,
        padding: theme.spacing.page,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        fontFamily: fonts.body,
      }}
    >
      {title && (
        <div
          style={{
            fontSize: theme.fontSize.heading,
            fontWeight: 700,
            color: theme.colors.accent,
            marginBottom: theme.spacing.section,
          }}
        >
          {title}
        </div>
      )}
      <div
        style={{
          background: theme.colors.bgCode,
          borderRadius: 12,
          border: `1px solid ${theme.colors.border}`,
          padding: 32,
          overflow: "hidden",
        }}
      >
        {lines.map((line, i) => {
          const start = revealPerLine ? i * lineDelay : 0;
          const opacity = interpolate(frame, [start, start + 0.2 * fps], [0, 1], {
            extrapolateRight: "clamp",
            extrapolateLeft: "clamp",
          });
          const isHighlighted = highlightLines.includes(i + 1);

          return (
            <div
              key={i}
              style={{
                fontFamily: fonts.code,
                fontSize: theme.fontSize.code,
                color: theme.colors.text,
                opacity,
                padding: "4px 8px",
                background: isHighlighted ? theme.colors.highlight : "transparent",
                borderRadius: 4,
                whiteSpace: "pre",
                lineHeight: 1.6,
              }}
            >
              <span style={{ color: theme.colors.textMuted, marginRight: 24, userSelect: "none" }}>
                {String(i + 1).padStart(2, " ")}
              </span>
              {line}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
