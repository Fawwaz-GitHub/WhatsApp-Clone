import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";

export const createConversation = mutation({
    args: {
        participants: v.array(v.id("users")),
        isGroup: v.boolean(),
        groupName: v.optional(v.string()),
        groupImage: v.optional(v.id("_storage")),
        admin: v.optional(v.id("users"))
    },
    handler: async ( ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        console.log(identity,"{}")
        if(!identity) throw new ConvexError("Unauthorized");

        const existingParticipants = await ctx.db
            .query("conversations")
            .filter((e) => 
                e.or(
                    e.eq(e.field("participants"), args.participants),
                    e.eq(e.field("participants"), args.participants.reverse())
                )
            )
            .first()

        if(existingParticipants){
            return existingParticipants?._id
        }   

        let groupImage;

        if(args.groupImage){
           groupImage = await ctx.storage.getUrl(args.groupImage) as string; 
        }
            
        const conversation = await ctx.db.insert("conversations",{
            participants: args.participants,
            isGroup: args.isGroup,
            groupName: args.groupName,
            groupImage: groupImage,
            admin: args.admin
        })
        
        return conversation;
    }
})

export const generateUploadUrl = mutation( async (ctx) => {
    return await ctx.storage.generateUploadUrl();
})