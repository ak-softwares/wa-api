"use strict";
// /models/AIAgent.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIAgentSchema = void 0;
var mongoose_1 = require("mongoose");
exports.AIAgentSchema = new mongoose_1.Schema({
    prompt: { type: String },
    webhookUrl: {
        type: String,
        required: false,
        default: "",
    },
    isActive: {
        type: Boolean,
        default: false,
    },
}, {
    _id: false, // ✅ keep as subdocument without id
    timestamps: true, // ✅ add createdAt & updatedAt
});
