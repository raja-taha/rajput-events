import { Customer } from "@/models/Customer";
import { createResourceByIdHandlers } from "@/lib/admin/resource";

const config = {
  model: Customer,
  idField: "customerId",
  idKey: "customer" as const,
  searchFields: ["customerId", "fullName", "familyOrCompany", "mobileWhatsApp", "email"],
  resource: "customers",
};

export const { GET, PATCH, DELETE } = createResourceByIdHandlers(config);
