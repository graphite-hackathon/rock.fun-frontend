"use client"
import React from "react";
import {
  ButtonProps,
  MotionButtonProps,
  MotionButtonWrapperProps,
} from "../../lib/interface/ui.interface";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";

export const Button: React.FC<MotionButtonProps> = ({
  text,
  children,
  className,
  onClick,
  ...props
}) => {
  return (
    <motion.button
      // whileTap={{ opacity: 0.5 }}
      className={twMerge(
        `bg-primary desktop:hover:bg-primary-dark flex flex-col items-center justify-center transition-all duration-500 ease-in-out text-black font-suisse font-medium px-7 py-5 rounded-2xl cursor-pointer`,
        className
      )}
      onClick={(event) => {
        if (onClick) {
          onClick(event);
        }
      }}
      {...props}
    >
      {text ? text : children}
      {/* <div className="text-center w-full">(Beta Version)</div> */}
    </motion.button>
  );
};

export const GradientButton: React.FC<MotionButtonProps> = ({
  text,
  children,
  className,
  onClick,
  ...props
}) => {
  return (
    <motion.button
      // whileTap={{ opacity: 0.5 }}
      className={twMerge(
        `bg-gradient-to-r from-primary to-primary-dark/50 desktop:hover:bg-primary-dark flex flex-col items-center justify-center transition-all duration-500 ease-in-out text-black font-suisse font-medium px-7 py-5 rounded-2xl cursor-pointer`,
        className
      )}
      onClick={(event) => {
        if (onClick) {
          onClick(event);
        }
      }}
      {...props}
    >
      {text ? text : children}
      {/* <div className="text-center w-full">(Beta Version)</div> */}
    </motion.button>
  );
};

export const CustomButton: React.FC<ButtonProps> = ({
  text,
  className,
  children,
  onClick,
  ...props
}) => {
  return (
    <button
      className={twMerge(
        `bg-accent hover:bg-gradient-to-br from-healthcare-accent to-cyan-400 text-white text-sm font-brandon-black w-fit h-10 px-7  rounded-lg`,
        className
      )}
      onClick={(event) => {
        if (onClick) {
          onClick(event);
        }
      }}
      {...props}
    >
      {children ? children : text}
    </button>
  );
};

export const OutlinedButton: React.FC<ButtonProps> = ({
  text,
  className,
  ...props
}) => {
  return (
    <button
     
      className={twMerge(
        `border-primary border-2 px-7 py-5  text-primary desktop:hover:bg-primary-dark desktop:hover:text-black hover:border-0 font-suisse font-medium rounded-2xl cursor-pointer ease-in-out duration-500`,
        className
      )}
      {...props}
    >
      {text}
    </button>
  );
};

export const ButtonWrapper: React.FC<MotionButtonWrapperProps> = ({
  className,
  onClick,
  ...props
}) => {
  return (
    <motion.button
      whileTap={{ opacity: 0.5 }}
      className={`transition-all cursor-pointer ${className}`}
      onClick={(event) => {
        if (onClick) {
          onClick(event);
        }
      }}
      {...props}
    >
      {props.children}
    </motion.button>
  );
};
