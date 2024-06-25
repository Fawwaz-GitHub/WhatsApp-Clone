import { defineSchema, defineTable } from "convex/server" // Schema Definer
import { v } from "convex/values" // Type Validator

export default defineSchema({
    tasks: defineTable({ // Create File Same Name As Key 
        text: v.string(),
        completed: v.boolean(),
    }),
    products: defineTable({
        name: v.string(),
        price: v.number(),
    })
})