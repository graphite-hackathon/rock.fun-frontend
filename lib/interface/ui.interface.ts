import { HTMLMotionProps } from "framer-motion";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  className?: string;
}

export interface MotionButtonProps
extends HTMLMotionProps<'button'>{
  text?: string;
  className?: string;
}

export interface ButtonWrapperProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // text: string;
  className?: string;
}
export interface MotionButtonWrapperProps
  extends HTMLMotionProps<'button'> {
  // text: string;
  className?: string;
}

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  text?: string;
  className?:string;
}

export interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  title?: string;
  className?: string;
}

export interface ViewProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}
export interface DropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: string[];
  className?: string;
}


export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
}
