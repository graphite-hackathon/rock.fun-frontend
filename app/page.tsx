import { Header } from "@components/ui/header";
import { HeroSection } from "@components/sections/hero.section";
import { AboutSection } from "@components/sections/about.section";
import { TeamSection } from "@/components/sections/team.section";
import { FeaturesSection } from "@/components/sections/features.section";
import { Footer } from "@/components/ui/footer";

export default function Home() {
  return (
    <main
      className="w-screen desktop:max-w-[2000px] h-screen flex flex-col overflow-x-clip overscroll-y-scroll pb-0 scrollbar-none desktop:px-28 mobile:px-4 pt-20 relative mobile:gap-y-52 desktop:gap-y-52"
      id="home"
    >
      <Header/>
      <HeroSection/>
      <AboutSection/>
      <FeaturesSection/>
      <TeamSection/>
      <Footer/>
    </main>
  );
}
