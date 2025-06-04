import Spline from "@splinetool/react-spline/next";
import React from "react";
import { GradientText, Text } from "../ui/text";

export const AboutSection = () => {
  return (
    <section className="w-full desktop:h-fit flex desktop:flex-col-reverse mobile:flex-col-reverse items-center relative desktop:justify-between mobile:px-4" id="about">
      <Spline
        className=" pointer-events-none scale-70 mobile:hidden mt-[-80px]"
        style={{ height: 800, width: "100%" }}
        scene={"/scene (1).splinecode"}
      />
      <Spline
        className=" pointer-events-none desktop:hidden mt-4"
        style={{ height: 400, width: '100%' }}
        scene={"/scene (1).splinecode"}
      />
      <div className=" flex flex-col desktop:w-full items-center mobile:w-full">
        <Text className="desktop:text-6xl mobile:text-5xl ">
          Built against <GradientText className="pb-[0.18rem]">rugpulls</GradientText>.
        </Text>
        <Text className="desktop:text-6xl mobile:text-5xl ">
          Backed with <GradientText className=" font-suisse pb-[0.18rem]">security</GradientText>
          .
        </Text>
        <Text className="font-normal mt-4 desktop:w-[80%] desktop:text-center">
          With the use of Graphite Network, we ensure secure transactions through
          a unique reputation-based system, enhanced Know Your Customer (KYC)
          procedures, and a Proof-of-Authority (PoA) consensus model. This ensures only tokens with known creators are listed
        </Text>
      </div>
    </section>
  );
};
