import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { twMerge } from "tailwind-merge";



interface CustomDropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const Dropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={twMerge("relative text-white w-48", className)} ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="w-full px-4 py-2 bg-[#2C3244] rounded-md flex items-center justify-between font-semibold"
      >
        {value}
        <ChevronDown
          className={`ml-2 w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute mt-2 w-full bg-[#2C3244] rounded-md shadow-lg z-20">
          {options.map((option) => (
            <div
              key={option}
              onClick={() => handleSelect(option)}
              className={twMerge(
                "flex items-center justify-between px-4 py-2 cursor-pointer rounded-md normal-case font-medium",
                option === value
                  ? "text-teal-300 bg-[#3A4257]"
                  : "hover:bg-[#3A4257] text-white"
              )}
            >
              {option}
              {option === value && <Check className="w-5 h-5 font-bold text-white" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};