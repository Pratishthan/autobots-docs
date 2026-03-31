import React from "react";
import { AbsoluteFill, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import type { SceneConfig } from "../types";

type VideoShellProps = {
  scenes: SceneConfig[];
  children: React.ReactNode[];
};

const TRANSITION_FRAMES = 15;

export const VideoShell: React.FC<VideoShellProps> = ({ scenes, children }) => {
  return (
    <AbsoluteFill>
      <TransitionSeries>
        {children.flatMap((child, i) => {
          const scene = scenes[i];
          const elements: React.ReactNode[] = [];

          if (i > 0) {
            elements.push(
              <TransitionSeries.Transition
                key={`t-${i}`}
                presentation={fade()}
                timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
              />,
            );
          }

          elements.push(
            <TransitionSeries.Sequence key={scene.id} durationInFrames={scene.durationInFrames}>
              {child}
              <Audio src={staticFile(scene.audioFile)} />
            </TransitionSeries.Sequence>,
          );

          return elements;
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};

export const TRANSITION_DURATION = TRANSITION_FRAMES;
