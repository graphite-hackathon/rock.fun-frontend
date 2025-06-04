"use client";
import React from "react";
import { GradientText, Text } from "../ui/text";
import { Image } from "../ui/image";
import { FaXTwitter } from "react-icons/fa6";
import { FaTelegramPlane } from "react-icons/fa";
import { ButtonWrapper } from "../ui/button";

export const TeamSection = () => {
  return (
    <section
      className="w-full desktop:h-fit flex flex-col items-center relative desktop:justify-between mobile:px-4"
      id="team"
    >
      <span className="w-full">
        <Text className="desktop:text-6xl mobile:text-5xl  desktop:text-center">
          We are <GradientText className="pb-[0.18rem]">building</GradientText>{" "}
          something{" "}
          <GradientText className="pb-[0.18rem]">different</GradientText>
        </Text>

        <Text className="font-normal mt-2 desktop:text-center">
          Promoting mass adoption on the Graphite Network where ease and
          security is the frontier
        </Text>
      </span>

      <div className="grid desktop:grid-cols-3 mobile:grid-cols-1 mt-8 gap-x-4 mobile:gap-y-4 mobile:w-full">
        <span className="desktop:w-64 mobile:w-full h-80 flex flex-col items-center justify-center  desktop:hover:border-primary-dark border-1 p-10 rounded-2xl desktop:hover:scale-90 desktop:hover:-skew-x-3 transition-all duration-500 ease-in-out bg-gradient-to-b from-neutral-900  to-neutral-800/40">
          <Image className="w-24 h-24 rounded-full" src={"/greatonical.jpeg"} />

          <GradientText className="text-2xl mt-4">Greatonic</GradientText>

          <Text>Developer</Text>

          <div className="flex flex-row gap-x-4 mt-4">
            <ButtonWrapper
              className="bg-neutral-700 rounded-full p-4"
              onClick={() => {
                window.open("https://x.com/greatonical", "_blank");
              }}
            >
              <FaXTwitter />
            </ButtonWrapper>
            <ButtonWrapper
              className="bg-neutral-700 rounded-full p-4"
              onClick={() => {
                window.open("https://t.me/greatonical", "_blank");
              }}
            >
              <FaTelegramPlane />
            </ButtonWrapper>
          </div>
        </span>
        <span className="desktop:w-64 mobile:w-full h-80 flex flex-col items-center justify-center border-primary desktop:hover:border-primary-dark border-1 p-10 rounded-2xl desktop:hover:scale-90 transition-all duration-500 ease-in-out bg-gradient-to-b from-neutral-900  to-neutral-800/40">
          <Image className="w-24 h-24 rounded-full" src={"/vector.jpg"} />

          <GradientText className="text-2xl mt-4">SVector</GradientText>

          <Text>Product Manager</Text>

          <div className="flex flex-row gap-x-4 mt-4">
            <ButtonWrapper
              className="bg-neutral-700 rounded-full p-4"
              onClick={() => {
                window.open("https://x.com/svector_eth", "_blank");
              }}
            >
              <FaXTwitter />
            </ButtonWrapper>
            <ButtonWrapper
              className="bg-neutral-700 rounded-full p-4"
              onClick={() => {
                window.open("https://t.me/ilumin_a", "_blank");
              }}
            >
              <FaTelegramPlane />
            </ButtonWrapper>
          </div>
        </span>

        <span className="desktop:w-64 mobile:w-full h-80 flex flex-col items-center justify-center border-primary desktop:hover:border-primary-dark border-1 p-10 rounded-2xl desktop:hover:scale-90 desktop:hover:skew-x-3 transition-all duration-500 ease-in-out bg-gradient-to-b from-neutral-900  to-neutral-800/40">
          <Image className="w-24 h-24 rounded-full" src={"/limozeus.jpg"} />

          <GradientText className="text-2xl mt-4">Limozeus</GradientText>

          <Text>Marketer</Text>
          <div className="flex flex-row gap-x-4 mt-4">
            <ButtonWrapper
              className="bg-neutral-700 rounded-full p-4"
              onClick={() => {
                window.open("https://t.me/Limozeus", "_blank");
              }}
            >
              <FaTelegramPlane />
            </ButtonWrapper>
          </div>
        </span>
      </div>
    </section>
  );
};
