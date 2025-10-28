import * as React from "react";
import {
  IconBook2,
  IconChartBar,
  IconDashboard,
  IconInnerShadowTop,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navSections = [
  {
    label: "Dashboard",
    items: [
      {
        title: "Dashboard",
        id: "dashboard",
        icon: IconDashboard,
      },
    ],
  },
  {
    label: "Strategic Planning",
    items: [
      {
        title: "Action Plans",
        id: "accounts",
        icon: IconUsers,
      },
      {
        title: "Strategic Actions",
        id: "contacts",
        icon: IconChartBar,
      },
    ],
  },
] as const;

const data = {
  user: {
    name: "J. Duplessis-Savard",
    email: "j.duplessis-savard@laval.ca",
    avatar: "",
  },
  navSections,
  navSecondary: [
    {
      title: "Search",
      icon: IconSearch,
      action: "search" as const,
    },
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
  ],
  documents: [
    {
      name: "Knowledge Base",
      icon: IconBook2,
      id: "reports",
    },
  ],
};

export type NavigationKey = (typeof navSections)[number]["items"][number]["id"];

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  activeItem: NavigationKey;
  onSectionSelect: (key: NavigationKey) => void;
  activeDocument?: string;
  onDocumentSelect?: (key: string) => void;
  onSearch?: () => void;
};

export function AppSidebar({
  activeItem,
  onSectionSelect,
  activeDocument,
  onDocumentSelect,
  onSearch,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Ville de Laval</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          sections={data.navSections}
          activeItem={activeItem}
          onSelect={(id) => onSectionSelect(id as NavigationKey)}
        />
        <NavDocuments
          items={data.documents}
          activeItem={activeDocument}
          onSelect={onDocumentSelect}
        />
        <NavSecondary
          items={data.navSecondary}
          onSearch={onSearch}
          className="mt-auto"
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
