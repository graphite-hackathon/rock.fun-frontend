"use client";
import React from "react";
import {
  FaShieldAlt,
  FaHandshake,
  FaPuzzlePiece,
  FaRocket,
  FaCogs,
  FaCoins,
} from "react-icons/fa";
import { Button } from "../ui/button";
import { GradientText, Text } from "../ui/text";

const features = [
  {
    title: "Security",
    description:
      "Robust protection with blockchain-native cryptography and security protocols to keep users and assets safe.",
    icon: <FaShieldAlt size={32} color="#D7DEBD" />,
  },
  {
    title: "Trust",
    description:
      "Transparent and verifiable smart contract logic builds trust between all participants.",
    icon: <FaHandshake size={32} color="#D7DEBD" />,
  },
  {
    title: "Interoperability",
    description:
      "Easily connect and exchange data between different blockchains with seamless cross-chain support.",
    icon: <FaPuzzlePiece size={32} color="#D7DEBD" />,
  },
  {
    title: "Ease of Use",
    description:
      "Streamlined interface and smooth user experience tailored for developers and end-users alike.",
    icon: <FaRocket size={32} color="#D7DEBD" />,
  },
  {
    title: "Token Deployment",
    description:
      "Deploy your own tokens effortlessly using pre-built templates and automated workflows.",
    icon: <FaCogs size={32} color="#D7DEBD" />,
  },
  {
    title: "Low Gas Fee",
    description:
      "Enjoy minimal transaction costs with efficient Layer 2 scaling built for affordability.",
    icon: <FaCoins size={32} color="#D7DEBD" />,
  },
];

export const FeaturesSection = () => {
  return (
    <section
      className="w-full desktop:h-fit flex flex-col items-center relative desktop:justify-between mobile:px-4"
      id="features"
    >
      <Text className="desktop:text-6xl mobile:text-5xl mobile:text-start  desktop:text-center">
        Core{" "}
        <GradientText className="pb-[0.18rem]"> Features</GradientText>
      </Text>
   

        <Text className="font-normal mt-2 desktop:text-center">
         Using Graphite Network, we pride ourselves on offering a suite of core features 
        designed to elevate <br className="mobile:hidden"/> your experience in the decentralized landscape.
        </Text>
      <div className="grid mobile:grid-cols-1 desktop:grid-cols-3 desktop:gap-4 mobile:gap-y-4 mt-5">
        {features.map((feature, index) => (
          <div
            key={index}
            className="rounded-2xl bg-gradient-to-b from-neutral-900  to-neutral-800 border-primary desktop:hover:border-primary-dark border-1  px-6 py-10 text-left hover:shadow-lg transition-all backdrop-blur"
          >
            <div className="mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-400 text-sm">{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <Button text="Read more →" className="px-6 py-4" onClick={()=>{window.open("https://atgraphite.com/", "_blank")}} />
      </div>
    </section>
  );
};
