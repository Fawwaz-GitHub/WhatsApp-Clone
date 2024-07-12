import { defineSchema, defineTable } from "convex/server" // Schema Definer
import { v } from "convex/values" // Type Validator

// Schema Key Name <-> Create File Same Name As Key
export default defineSchema({
    users: defineTable({
        name: v.optional(v.string()),
        email: v.string(),
        image: v.string(),
        tokenIdentifier: v.string(),
        isOnline: v.boolean()
    }).index("by_tokenIdentifier", ["tokenIdentifier"]) // Define Index For Better VLOOKUP
})