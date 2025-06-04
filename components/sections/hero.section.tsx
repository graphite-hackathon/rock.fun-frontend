import React from "react";
import Spline from "@splinetool/react-spline/next";
import { GradientText, Text } from "../ui/text";
import { Button, OutlinedButton } from "../ui/button";
import Link from 'next/link'

export const HeroSection = () => {
    
  return (
    <section className="w-full flex desktop:flex-row mobile:flex-col desktop:justify-between items-center h-screen  mobile:pt-10">
     
         <div className="text-wrap flex flex-col">
    <Text className="desktop:text-6xl mobile:text-5xl ">
        Find secured <GradientText className="pb-[0.17rem]">gems</GradientText>.
    </Text>
    <Text className="desktop:text-6xl mobile:text-5xl mobile:mt-1">
        Create your dream<br/>coin on <GradientText className=" font-suisse">Graphite</GradientText>.
    </Text>

<span className="flex flex-row mt-6 gap-x-4">
  <Link href={"https://atgraphite.com/"} target="_blank">
   <OutlinedButton className="w-44" text="About Graphite" />
  </Link>
   
   <Link href={"/dashboard"}>
      <Button className="w-44" text="Launch App"/>
   </Link>

 
</span>


</div>

      <Spline className="desktop:scale-125 mobile:scale-90 desktop:mt-20 mobile:mt-0 pointer-events-none " style={{width:500, height:500}}  scene={"/scene.splinecode"} />
    </section>
  );
};
