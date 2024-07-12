import { ConvexError, v } from "convex/values"
import { internalMutation, query } from "./_generated/server"


export const createUser = internalMutation({
    args: {
        name: v.string(),
        email: v.string(),
        image: v.string(),
        tokenIdentifier: v.string()
    },
    handler: async ( ctx, args) => {
        await ctx.db.insert("users",{
            name: args.name,
            email: args.email,
            image: args.image,
            tokenIdentifier: args.tokenIdentifier,
            isOnline: false
        })
    } 
})

export const updateUser = internalMutation({
    args: {
        tokenIdentifier: v.string(),
        image: v.string()
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_tokenIdentifier", (e) => e.eq("tokenIdentifier", args.tokenIdentifier))
            .unique()

        if(!user){
            throw new ConvexError("User Not Found!")
        }

        await ctx.db.patch(user._id, { image: args.image })
    }
})

export const setUserOnline = internalMutation({
    args: {
        tokenIdentifier: v.string()
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_tokenIdentifier", (e) => e.eq("tokenIdentifier", args.tokenIdentifier))
            .unique()

        if(!user){
            throw new ConvexError("User Not Found!")
        }

        await ctx.db.patch(user._id, { isOnline: true })
    }
})

export const setUserOffline = internalMutation({
    args: {
        tokenIdentifier: v.string()
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_tokenIdentifier", (e) => e.eq("tokenIdentifier", args.tokenIdentifier))
            .unique()

        if(!user){
            throw new ConvexError("User Not Found!")
        }

        await ctx.db.patch(user._id, { isOnline: false })
    }
})

export const getUsers = query({
    args: {},
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if(!identity){
            throw new Error("Unauthorized")
        }

        const users = await ctx.db.query("users").collect();
        return users
    }
})

export const getMe = query({
    args: {},
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if(!identity){
            throw new Error("Unauthorized")
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_tokenIdentifier", (e) => e.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique()

        if(!user){
            throw new Error("User Not Found!")
        }    

        return user
    }
})