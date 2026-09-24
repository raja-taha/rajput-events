import { connectMongo } from "./mongodb";
import { AuditLog } from "@/models/AuditLog";

type AuditInput = {
  action:
    | "create"
    | "update"
    | "archive"
    | "restore"
    | "void"
    | "accept"
    | "login"
    | "logout"
    | "import"
    | "seed";
  resource: string;
  resourceId?: string;
  businessId?: string;
  actor?: string;
  changes?: { before?: unknown; after?: unknown };
  metadata?: Record<string, unknown>;
};

export async function writeAudit(input: AuditInput) {
  try {
    await connectMongo();
    await AuditLog.create({
      ...input,
      actor: input.actor || "env-admin",
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Failed to write audit log", error);
  }
}
