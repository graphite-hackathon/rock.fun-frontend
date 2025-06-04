import React from 'react'
import { FaGem } from "react-icons/fa6";
import { Text } from "./text";

export const Footer = () => {
  return (
    <footer className='flex mobile:flex-col desktop:flex-row desktop:justify-between items-center pb-24'>
          <span className="flex flex-row items-center gap-x-2">
                  <FaGem className="w-5 h-5" color="#D7DEBD" />
                  <Text className="font-semibold text-lg">rock.fun</Text>
                </span>

                <Text className='text-neutral-500'>
                    © 2025 rock.fun
                </Text>
    </footer>
  )
}
