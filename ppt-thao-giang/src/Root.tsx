import React from "react";
import { Composition } from "remotion";
import { MyComposition, TOTAL_FRAMES } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="PPTThaoGiang"
      component={MyComposition}
      durationInFrames={TOTAL_FRAMES}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
