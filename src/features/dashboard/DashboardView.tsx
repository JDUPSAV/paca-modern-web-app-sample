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
        title: "Total accounts",
        value: accounts.length.toString(),
        description: "Customer organizations managed across all regions.",
        trendLabel: `+${activeAccounts} engaged`,
        trendDirection: "up" as const,
      },
      {
        title: "Active workstreams",
        value: activeAccounts.toString(),
        description: "Accounts with in-flight delivery or expansion work.",
        trendLabel: `${pendingAccounts} awaiting kickoff`,
        trendDirection: pendingTrendDirection,
      },
      {
        title: "New contacts",
        value: newContacts.toString(),
        description: "Fresh relationships ready for discovery conversations.",
        trendLabel: `+${newContacts} this week`,
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
