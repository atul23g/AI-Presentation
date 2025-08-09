import { SidebarTrigger } from "@/components/ui/sidebar";
import { User } from "@prisma/client";
import { Separator } from "@radix-ui/react-separator";
import React from "react";
import SearchBar from "./upper-info-searchbar";
import ThemeSwitcher from "../mode-toggle";
import NewProjectButton from "./new-project-button";

type Props = {
  user: User;
  
};

function UpperInforBar({ user }: Props) {
  return (
    <header className="sticky top-0 z-[10] flex shrink-0 flex-wrap items-center gap-2  bg-background p-4 justify-between">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4 mr-2" />

      <div className="w-full max-w-[95%] flex items-center justify-between gap-4 flex-wrap">
        <SearchBar></SearchBar>
        <ThemeSwitcher></ThemeSwitcher>

        <div className="flex flex-wrap gap-4 items-center justify-end ">
          <NewProjectButton user={user}></NewProjectButton>
        </div>
      </div>
    </header>
  );
}

export default UpperInforBar;
