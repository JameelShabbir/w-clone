import OpenAI from "openai";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey });

export const chat = action({
	args: {
		messageBody: v.string(),
		conversation: v.id("conversations"),
	},
	handler: async (ctx, args) => {
		const res = await openai.chat.completions.create({
			model: "gpt-4o-mini", // "gpt-4" also works, but is so slow!
			messages: [
				{
					role: "system",
					content: "You are a terse bot in a group chat responding to questions with 1-sentence answers",
				},
				{
					role: "user",
					content: args.messageBody,
				},
			],
		});

		const messageContent = res.choices[0].message.content;
		await ctx.runMutation(api.messages.sendChatGPTMessage, {
			content: messageContent ?? "I'm sorry, I don't have a response for that",
			conversation: args.conversation,
			messageType: "text",
		});
	},
});

// export const chat = action({
// 	args: {
// 		messageBody: v.string(),
// 		conversation: v.id("conversations"),
// 	},
// 	handler: async (ctx, args) => {
// 		console.log("GPT Action Triggered:", args.messageBody);

// 		try {
// 			if (!apiKey) {
// 				throw new Error("🚨 OpenAI API key is missing!");
// 			}

// 			console.log("🔄 Sending request to OpenAI...");
// 			const res = await openai.chat.completions.create({
// 				model: "gpt-3.5-turbo",
// 				messages: [
// 					{ role: "system", content: "You are a terse bot..." },
// 					{ role: "user", content: args.messageBody },
// 				],
// 			});

// 			console.log("✅ OpenAI Response:", JSON.stringify(res, null, 2));

// 			if (!res.choices || res.choices.length === 0) {
// 				throw new Error("⚠️ OpenAI returned an empty response");
// 			}

// 			const messageContent = res.choices[0].message.content;
// 			await ctx.runMutation(api.messages.sendChatGPTMessage, {
// 				content: messageContent ?? "I'm sorry, I don't have a response for that.",
// 				conversation: args.conversation,
// 				messageType: "text",
// 			});
// 		} catch (error) {
// 			console.error("❌ Error in GPT Chat Action:", error);
// 		}
// 	},
// });



export const dall_e = action({
	args: {
		conversation: v.id("conversations"),
		messageBody: v.string(),
	},
	handler: async (ctx, args) => {
		const res = await openai.images.generate({
			model: "dall-e-3",
			prompt: args.messageBody,
			n: 1,
			size: "1024x1024",
		});

		const imageUrl = res.data[0].url;
		await ctx.runMutation(api.messages.sendChatGPTMessage, {
			content: imageUrl ?? "/poopenai.png",
			conversation: args.conversation,
			messageType: "image",
		});
	},
});

// export const dall_e = action({
// 	args: {
// 		conversation: v.id("conversations"),
// 		messageBody: v.string(),
// 	},
// 	handler: async (ctx, args) => {
// 		try {
// 			if (!apiKey) {
// 				throw new Error("🚨 OpenAI API key is missing!");
// 			}

// 			console.log("🔄 Sending request to DALL·E...");
// 			const res = await openai.images.generate({
// 				model: "dall-e-3",
// 				prompt: args.messageBody,
// 				n: 1,
// 				size: "1024x1024",
// 			});

// 			console.log("✅ DALL·E Response:", JSON.stringify(res, null, 2));

// 			if (!res.data || res.data.length === 0) {
// 				throw new Error("⚠️ DALL·E returned an empty response");
// 			}

// 			const imageUrl = res.data[0].url;
// 			await ctx.runMutation(api.messages.sendChatGPTMessage, {
// 				content: imageUrl ?? "/poopenai.png",
// 				conversation: args.conversation,
// 				messageType: "image",
// 			});
// 		} catch (error) {
// 			console.error("❌ Error in DALL·E Action:", error);
// 		}
// 	},
// });




// 1 token ~= 4 chars in English
// 1 token ~= ¾ words
// 100 tokens ~= 75 words
// Or
// 1-2 sentence ~= 30 tokens
// 1 paragraph ~= 100 tokens
// 1,500 words ~= 2048 tokens

// 1 image will cost $0,04(4 cents) => dall-e-3
// 1 image will cost $0,02(2 cents) => dall-e-2
