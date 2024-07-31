import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

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

export const getMyConversations = query({
    args: {},
    handler: async ( ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if(!identity) throw new ConvexError("Unauthorized!")

        const user = await ctx.db
            .query("users")
            .withIndex("by_tokenIdentifier", e => e.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        if(!user) throw new ConvexError("User Not Found!")

        const conversations = await ctx.db.query("conversations").collect();
        
        const myConversations = conversations.filter((c)=>{
            return c.participants.includes(user._id);
        });

        const conversationWithDetails = await Promise.all(
            myConversations.map( async ( conversation ) => {

                let userDetails = {};
                if(!conversation.isGroup){
                    let otherOtherUserId = conversation.participants.find((id) => id !== user._id)
                    let otherUserProfile = await ctx.db
                        .query("users")
                        .filter(q => q.eq(q.field("_id"), otherOtherUserId))
                        .take(1)

                    userDetails = otherUserProfile[0]
                }

                let lastMessage = await ctx.db
                    .query("messages")
                    .filter(q => q.eq(q.field("conversation"), conversation._id))
                    .order("desc")
                    .take(1)

                return {
                    ...userDetails,
                    ...conversation,
                    lastMessage: lastMessage[0] || null
                }    
            })
        )

        return conversationWithDetails;
    }
})

export const generateUploadUrl = mutation( async (ctx) => {
    return await ctx.storage.generateUploadUrl();
})