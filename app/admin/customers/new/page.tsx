import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IconArrowLeft } from "@tabler/icons-react";
import { CreateUserForm } from "./create-user-form";

export const metadata = { title: "Create User | Admin | Hobby Bangladesh" };

export default function CreateUserPage() {
  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/customers">
            <IconArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Create User</h2>
          <p className="text-muted-foreground">
            Add a new user account to the system.
          </p>
        </div>
      </div>

      <div className="max-w-xl">
        <CreateUserForm />
      </div>
    </div>
  );
}
