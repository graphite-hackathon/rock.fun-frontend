"use client"
import React, { useEffect, useState } from "react";
import { FaGem } from "react-icons/fa6";
import { Text } from "./text";
import { navLinks } from "@lib/constants/navigation.constants";
import { Button } from "./button";
import Link from 'next/link'
import { scrollToHash, useActiveHashOnScroll } from "@/lib/utils/scroll";

export const Header = () => {
  const [opened] = useState(false);

  useEffect(() => {
    if (opened) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
  }, [opened]);

  const ids = navLinks.map((link) => link.link.replace("#", ""));

    const activeHash = useActiveHashOnScroll(ids);
  console.log(useActiveHashOnScroll(ids))
  return (
    <>
      <header className="w-full h-24 z-40 fixed top-0 px-28 left-0 py-10 backdrop-blur bg-black/10 desktop:flex flex-row items-center mobile:hidden justify-between">
        <span className="flex flex-row items-center gap-x-2">
          <FaGem className="w-8 h-8" color="#D7DEBD" />
          <Text className="font-semibold text-xl">rock.fun</Text>
        </span>

        <ul className="flex flex-row items-center gap-x-10">
          {navLinks.map((item) => (
            <li>
                <Text className={`${activeHash === item.link ? "text-primary": "text-white hover:text-primary"} ease-in-out transition-all duration-500 font-normal cursor-pointer`} onClick={()=>{scrollToHash(item.link)}}>
{item.name}
                </Text>

                </li>
          ))}
        </ul>

   <Link href={"/create"}>
  <Button className="px-4 py-4" text="Get Started"/>
   </Link>
      
      </header>

      {/* Mobile Header */}
      <header className="w-full h-24 z-40 fixed top-0 px-4 left-0 py-10 backdrop-blur bg-black/10 mobile:flex flex-row items-center desktop:hidden justify-between">   <span className="flex flex-row items-center gap-x-2">
          <FaGem className="w-8 h-8" color="#D7DEBD" />
          <Text className="font-semibold text-xl">rock.fun</Text>
        </span></header>
    </>
  );
};
