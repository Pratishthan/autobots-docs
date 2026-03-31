import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../styles/theme";
import { fonts } from "../styles/fonts";

type TableViewProps = {
  title?: string;
  headers: string[];
  rows: string[][];
  staggerDelaySeconds?: number;
};

export const TableView: React.FC<TableViewProps> = ({
  title,
  headers,
  rows,
  staggerDelaySeconds = 0.3,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const staggerFrames = staggerDelaySeconds * fps;

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
          background: theme.colors.bgCard,
          borderRadius: 12,
          border: `1px solid ${theme.colors.border}`,
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", background: theme.colors.bgCode, padding: "16px 24px" }}>
          {headers.map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                fontSize: theme.fontSize.small,
                fontWeight: 700,
                color: theme.colors.accent,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {h}
            </div>
          ))}
        </div>
        {rows.map((row, ri) => {
          const start = (ri + 1) * staggerFrames;
          const opacity = interpolate(frame, [start, start + 0.3 * fps], [0, 1], {
            extrapolateRight: "clamp",
            extrapolateLeft: "clamp",
          });

          return (
            <div
              key={ri}
              style={{
                display: "flex",
                padding: "14px 24px",
                opacity,
                borderTop: `1px solid ${theme.colors.border}`,
              }}
            >
              {row.map((cell, ci) => (
                <div
                  key={ci}
                  style={{
                    flex: 1,
                    fontSize: theme.fontSize.code,
                    color: theme.colors.text,
                    fontFamily: ci === 0 ? fonts.code : fonts.body,
                  }}
                >
                  {cell}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
