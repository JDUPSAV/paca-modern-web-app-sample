import { useMemo } from "react";

import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import type { AccountRecord } from "@/features/accounts/AccountsView";
import type { ContactRecord } from "@/features/contacts/ContactsView";

type DashboardViewProps = {
  accounts: AccountRecord[];
  contacts: ContactRecord[];
};

export function DashboardView({ accounts, contacts }: DashboardViewProps) {
  const cards = useMemo(() => {
    const activeAccounts = accounts.filter(
      (account) => account.status === "Active"
    ).length;
    const pendingAccounts = accounts.filter(
      (account) => account.status === "Pending"
    ).length;
    const newContacts = contacts.filter(
      (contact) => contact.status === "New"
    ).length;
    const qualifiedContacts = contacts.filter(
      (contact) => contact.status === "Qualified"
    ).length;

    const pendingTrendDirection: "up" | "down" =
      pendingAccounts > activeAccounts ? "down" : "up";

    return [
      {
        title: "Total Action Plans",
        value: accounts.length.toString(),
        description: "Strategic initiatives across all departments.",
        trendLabel: `+${activeAccounts} in progress`,
        trendDirection: "up" as const,
      },
      {
        title: "Active Projects",
        value: activeAccounts.toString(),
        description: "Strategic actions currently being implemented.",
        trendLabel: `${pendingAccounts} pending approval`,
        trendDirection: pendingTrendDirection,
      },
      {
        title: "New Actions",
        value: newContacts.toString(),
        description: "Recently added strategic actions ready for review.",
        trendLabel: `+${newContacts} this month`,
        trendDirection: "up" as const,
      },
      {
        title: "Qualified contacts",
        value: qualifiedContacts.toString(),
        description: "Decision makers aligned on solution scope and value.",
        trendLabel: `${qualifiedContacts} ready to hand off`,
        trendDirection: "up" as const,
      },
    ];
  }, [accounts, contacts]);

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards items={cards} />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
    </div>
  );
}
