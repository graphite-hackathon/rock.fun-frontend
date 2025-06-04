import { TextProps } from "../../lib/interface/ui.interface";
import { twMerge } from "tailwind-merge";

export const Text: React.FC<TextProps> = ({
  className,
  children,
  text,
  ...props
}) => {
  return (
    <p
      className={twMerge(
        `font-suisse font-normal text-white tracking-tight`,
        className
      )}
      {...props}
    >
      {children ? children : text}
    </p>
  );
};

export const GradientText: React.FC<TextProps> = ({
  className,
  children,
  text,
  ...props
}) => {
  return (
    <p
      className={twMerge(
        `font-suisse font-normal tracking-tight bg-clip-text text-transparent inline-block bg-gradient-to-r from-primary to-primary-dark/50`,
        className
      )}
      {...props}
    >
      {children ? children : text}
    </p>
  );
};
