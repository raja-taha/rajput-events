import { Schema, models, model } from "mongoose";
import { auditFields } from "./_base";
import { INVENTORY_CONDITION, INVENTORY_OWNERSHIP } from "./enums";

const InventoryItemSchema = new Schema(
  {
    itemId: { type: String, required: true, unique: true },
    itemAssetName: String,
    category: String,
    ownership: { type: String, enum: INVENTORY_OWNERSHIP },
    quantityHeld: Number,
    unit: String,
    unitPurchaseCost: Number,
    storageLocation: String,
    currentCondition: { type: String, enum: INVENTORY_CONDITION },
    reorderLevel: Number,
    supplierVendorId: String,
    photoPurchaseEvidence: String,
    notes: String,
    ...auditFields,
  },
  { timestamps: true },
);

InventoryItemSchema.index({ itemId: 1 }, { unique: true });
InventoryItemSchema.index({ supplierVendorId: 1 });

export const InventoryItem =
  models.InventoryItem ||
  model("InventoryItem", InventoryItemSchema, "inventoryItems");
