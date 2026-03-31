import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../styles/theme";
import { fonts } from "../styles/fonts";

type BulletListProps = {
  title?: string;
  items: string[];
  staggerDelaySeconds?: number;
};

export const BulletList: React.FC<BulletListProps> = ({
  title,
  items,
  staggerDelaySeconds = 0.4,
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
            opacity: interpolate(frame, [0, 0.3 * fps], [0, 1], {
              extrapolateRight: "clamp",
            }),
          }}
        >
          {title}
        </div>
      )}
      {items.map((item, i) => {
        const start = (i + 1) * staggerFrames;
        const opacity = interpolate(frame, [start, start + 0.3 * fps], [0, 1], {
          extrapolateRight: "clamp",
          extrapolateLeft: "clamp",
        });
        const x = interpolate(frame, [start, start + 0.3 * fps], [20, 0], {
          extrapolateRight: "clamp",
          extrapolateLeft: "clamp",
        });

        return (
          <div
            key={i}
            style={{
              fontSize: theme.fontSize.body,
              color: theme.colors.text,
              marginBottom: theme.spacing.element,
              opacity,
              transform: `translateX(${x}px)`,
              display: "flex",
              gap: 16,
            }}
          >
            <span style={{ color: theme.colors.accent }}>{">"}</span>
            <span>{item}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
