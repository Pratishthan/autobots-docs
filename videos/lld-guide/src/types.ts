export type SceneConfig = {
  id: string;
  audioFile: string;
  durationInFrames: number;
};

export type VideoProps = {
  scenes: SceneConfig[];
};
