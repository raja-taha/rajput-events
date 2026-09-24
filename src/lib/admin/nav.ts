export type NavItem = {
  label: string;
  href: string;
  icon: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const ADMIN_NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/admin", icon: "LayoutDashboard" }],
  },
  {
    label: "CRM & Sales",
    items: [
      { label: "Customers", href: "/admin/customers", icon: "Users" },
      { label: "Enquiries", href: "/admin/enquiries", icon: "MessageSquare" },
      { label: "Quotes", href: "/admin/quotes", icon: "Receipt" },
      { label: "Services & Packages", href: "/admin/services", icon: "Package" },
    ],
  },
  {
    label: "Events",
    items: [
      { label: "Bookings / Events", href: "/admin/bookings", icon: "CalendarDays" },
      { label: "Event Briefs", href: "/admin/event-briefs", icon: "FileText" },
      { label: "Change Orders", href: "/admin/changes", icon: "GitBranch" },
      { label: "Feedback & Consent", href: "/admin/feedback", icon: "Star" },
      { label: "Tasks / Run Sheet", href: "/admin/tasks", icon: "CheckSquare" },
    ],
  },
  {
    label: "Vendors & Logistics",
    items: [
      { label: "Vendors", href: "/admin/vendors", icon: "Store" },
      { label: "Vendor Orders", href: "/admin/vendor-orders", icon: "ClipboardList" },
      { label: "Venues", href: "/admin/venues", icon: "MapPin" },
      { label: "Inventory", href: "/admin/inventory", icon: "Boxes" },
      { label: "Handovers", href: "/admin/handovers", icon: "ArrowLeftRight" },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Event Accounts", href: "/admin/event-accounts", icon: "PieChart" },
      { label: "Invoices", href: "/admin/invoices", icon: "FileSpreadsheet" },
      { label: "Payments", href: "/admin/payments", icon: "Wallet" },
      { label: "Expenses", href: "/admin/expenses", icon: "Banknote" },
    ],
  },
  {
    label: "Content & Compliance",
    items: [
      { label: "Documents", href: "/admin/documents", icon: "FolderOpen" },
      { label: "Marketing", href: "/admin/marketing", icon: "Megaphone" },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Settings", href: "/admin/settings", icon: "Settings" },
      { label: "Profile", href: "/admin/profile", icon: "UserCircle" },
      { label: "Guide", href: "/admin/guide", icon: "BookOpen" },
    ],
  },
];
