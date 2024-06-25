import { v } from "convex/values"
import { query, mutation } from "./_generated/server"

// query to read and mutation to write

export const getTasks = query({
    args: {}, // args to take from client
    handler: async (ctx, args) => {
        // ctx later can also be used for authenication
        const tasks = await ctx.db.query("tasks").collect();
        return tasks
    },
})

export const addTask = mutation({
    args: { 
        text : v.string()
    },
    handler: async (ctx, args) => {
        const taskId = await ctx.db.insert("tasks", { text: args.text, completed: false })
        return taskId
    },
})

export const updateTask = mutation({
    args: {
        id: v.id("tasks")
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { completed: true })
    },
}) 

export const deleteTask = mutation({
    args: {
        id: v.id("tasks")
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id)
    },
})