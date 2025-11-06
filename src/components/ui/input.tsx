import * as React from "react"

import { cn } from "@/lib/utils"
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { Phone } from "lucide-react" 
import { useEffect, useState } from "react"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

function ShadcnPhoneInput({ value, onChange }: { value: string; onChange: (phone: string) => void }) {

  const [countryCode, setCountryCode] = useState("us"); // fallback

  useEffect(() => {
    // ✅ Only auto-detect if no phone yet
    if (!value) {
      fetch("https://ipapi.co/json/")
        .then((res) => res.json())
        .then((data) => {
          if (data?.country_code) {
            setCountryCode(data.country_code.toLowerCase());
          }
        })
        .catch(() => setCountryCode("in")); // fallback on error
    }
  }, [value]);

  return (
    <div className="w-full relative">
      <PhoneInput
        country={countryCode}
        value={value}
        onChange={onChange}
        inputClass={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
          "flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          "!w-full !border-input !bg-background !text-foreground", // ✅ enforce shadcn input style
          "dark:!bg-input/30 dark:!text-foreground dark:!placeholder:text-muted-foreground", // ✅ force dark mode
        )}
        preferredCountries={["in", "us"]}
        enableSearch={true}
        disableSearchIcon={true}
        buttonClass="!bg-transparent !border-input !hover:bg-accent/50"
        containerClass="!w-full"
        dropdownClass="!bg-background !text-foreground !border !rounded-md !shadow-md"
      />
      {value && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <Phone className="h-4 w-4 text-gray-400" />
        </div>
      )}
    </div>
  )
}

export { Input, ShadcnPhoneInput }
