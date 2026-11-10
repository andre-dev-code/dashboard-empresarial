import type { ReactNode } from "react";

import { LogoutButton } from "@/components/logout-button";

export default function MfaLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex justify-end p-4">
        <LogoutButton />
      </div>
      {children}
    </div>
  );
}
