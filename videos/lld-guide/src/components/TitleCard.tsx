import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../styles/theme";
import { fonts } from "../styles/fonts";

type TitleCardProps = {
  videoNumber: number;
  title: string;
  subtitle?: string;
};

export const TitleCard: React.FC<TitleCardProps> = ({ videoNumber, title, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 0.5 * fps], [0, 1], {
    extrapolateRight: "clamp",
  });

  const titleY = interpolate(frame, [0, 0.5 * fps], [30, 0], {
    extrapolateRight: "clamp",
  });

  const subtitleOpacity = interpolate(frame, [0.3 * fps, 0.8 * fps], [0, 1], {
    extrapolateRight: "clamp",
  });

  const numberOpacity = interpolate(frame, [0.1 * fps, 0.4 * fps], [0, 0.3], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: theme.colors.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: fonts.body,
      }}
    >
      <div
        style={{
          position: "absolute",
          fontSize: 300,
          fontWeight: 700,
          color: theme.colors.accent,
          opacity: numberOpacity,
        }}
      >
        {videoNumber}
      </div>
      <div
        style={{
          fontSize: theme.fontSize.title,
          fontWeight: 700,
          color: theme.colors.text,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          zIndex: 1,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            fontSize: theme.fontSize.subtitle,
            color: theme.colors.textMuted,
            opacity: subtitleOpacity,
            marginTop: theme.spacing.element,
            zIndex: 1,
          }}
        >
          {subtitle}
        </div>
      )}
    </AbsoluteFill>
  );
};
