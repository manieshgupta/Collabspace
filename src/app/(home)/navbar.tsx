import Link from "next/link";
import Image from "next/image";
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";

import { SearchInput } from "./search-input";

export const Navbar = () => {
  return (
    <nav className="flex items-center justify-between h-full w-full">
      <div className="flex gap-3 items-center shrink-0 pr-6">
        <Link href="/documents">
          <Image src="/logo.svg" alt="CollabSpace" width={36} height={36} />
        </Link>
        <h3 className="text-xl">CollabSpace</h3>
      </div>
      <SearchInput />
      <div className="flex gap-3 items-center pl-6">
        <OrganizationSwitcher
          afterCreateOrganizationUrl="/documents"
          afterLeaveOrganizationUrl="/documents"
          afterSelectOrganizationUrl="/documents"
          afterSelectPersonalUrl="/documents"
        />
        <UserButton afterSignOutUrl="/" />
      </div>
    </nav>
  );
};
