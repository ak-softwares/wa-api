"use client";

import { useRef } from "react";
import { Plus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  variables: string[];
}

export function VariableInput({
  value,
  onChange,
  placeholder,
  variables,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const insertVariable = (variable: string) => {
    const input = inputRef.current;
    if (!input) return;

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;

    const newValue =
      value.slice(0, start) +
      `{{${variable}}}` +
      value.slice(end);

    onChange(newValue);

    // keep cursor after inserted text
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(
        start + variable.length + 4,
        start + variable.length + 4
      );
    }, 0);
  };

  return (
    <div className="relative w-full">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pr-10"
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="dark:bg-[#161717] min-w-[180px] rounded-xl p-1"
        >
          {variables.map((v) => (
            <DropdownMenuItem
              key={v}
              onClick={() => insertVariable(v)}
              className="cursor-pointer dark:hover:bg-[#2A2A2A]"
            >
              {`{{${v}}}`}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
