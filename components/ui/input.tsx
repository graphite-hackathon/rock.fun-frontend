import { TextInputProps } from "@lib/interface/ui.interface";
import { twMerge } from "tailwind-merge";


export const TextInput: React.FC<TextInputProps> = ({
  title,
  className,
  ...props
}) => {
  return (
    <div className={twMerge(``, className)}>
      <p className="text-neutral-400 text-sm font-suisse">{title}</p>
      <input
        className="mt-2 px-5 h-14 w-full text-sm placeholder-neutral-600 bg-transparent border-1 border-neutral-200 rounded-2xl focus:outline-primary focus:outline-[0.5px] focus:border-2 duration-200 transition-all ease-in-out"
        {...props}
      ></input>
    </div>
  );
};
