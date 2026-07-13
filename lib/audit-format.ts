interface AuditLogEntry {
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown> | null;
}

export function formatAuditDetails(entry: AuditLogEntry): string {
  const { action, resource_type, details } = entry;

  if (!details) return "—";

  switch (action) {
    case "create":
      if (resource_type === "product")
        return `Created product "${details.name ?? "unknown"}"`;
      if (resource_type === "category")
        return `Created category "${details.name ?? "unknown"}"`;
      if (resource_type === "coupon")
        return `Created coupon ${details.code ?? ""} (${details.discount_type ?? ""}: ${details.discount_value ?? ""})`;
      if (resource_type === "user")
        return `Created user ${details.email ?? ""} (${details.role ?? "customer"})`;
      return `Created ${resource_type}`;

    case "update":
      if (resource_type === "product")
        return `Updated product "${details.name ?? "unknown"}"`;
      if (resource_type === "category")
        return `Updated category "${details.name ?? "unknown"}"`;
      if (resource_type === "coupon")
        return `Updated coupon ${details.code ?? ""}`;
      if (resource_type === "settings")
        return `Updated ${details.key ?? "settings"} (${details.name ?? details.code ?? ""})`.trim();
      if (resource_type === "user")
        return `Updated profile: ${details.name ?? ""} ${details.phone ?? ""}`.trim();
      return `Updated ${resource_type}`;

    case "delete":
      return `Deleted ${resource_type}`;

    case "update_status":
      return `Status changed to ${details.newStatus ?? "unknown"}`;

    case "update_payment":
      return `Payment status changed to ${details.paymentStatus ?? "unknown"}`;

    case "update_role":
      return `Role changed to ${details.role ?? "unknown"}`;

    case "toggle":
      if (resource_type === "category")
        return details.is_active ? "Activated category" : "Deactivated category";
      if (resource_type === "coupon")
        return details.is_active ? "Activated coupon" : "Deactivated coupon";
      if (resource_type === "review")
        return details.is_approved ? "Approved review" : "Unapproved review";
      return `Toggled ${resource_type}`;

    case "reorder":
      return `Reordered ${details.count ?? 0} ${resource_type}s`;

    case "login":
      return `Logged in${details.email ? ` as ${details.email}` : ""}`;

    case "logout":
      return "Logged out";

    case "denied_access":
      return `Denied access to ${details.path ?? "protected route"}`;

    default:
      return JSON.stringify(details);
  }
}

export function formatAuditAction(action: string): string {
  const labels: Record<string, string> = {
    create: "Created",
    update: "Updated",
    delete: "Deleted",
    update_status: "Status",
    update_payment: "Payment",
    update_role: "Role",
    toggle: "Toggled",
    reorder: "Reordered",
    login: "Login",
    logout: "Logout",
    denied_access: "Denied",
  };
  return labels[action] ?? action;
}

export function getActionColor(
  action: string
): "default" | "secondary" | "destructive" {
  const colors: Record<string, "default" | "secondary" | "destructive"> = {
    create: "default",
    update: "secondary",
    delete: "destructive",
    update_status: "secondary",
    update_payment: "default",
    update_role: "default",
    toggle: "secondary",
    reorder: "secondary",
    login: "default",
    logout: "secondary",
    denied_access: "destructive",
  };
  return colors[action] ?? "secondary";
}

export function getActionDotColor(action: string): string {
  const colors: Record<string, string> = {
    create: "bg-green-500",
    update: "bg-blue-500",
    delete: "bg-red-500",
    update_status: "bg-blue-500",
    update_payment: "bg-emerald-500",
    update_role: "bg-purple-500",
    toggle: "bg-amber-500",
    reorder: "bg-amber-500",
    login: "bg-green-500",
    logout: "bg-gray-400",
    denied_access: "bg-red-500",
  };
  return colors[action] ?? "bg-gray-400";
}