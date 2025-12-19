"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIChatSchema = void 0;
var mongoose_1 = require("mongoose");
exports.AIChatSchema = new mongoose_1.Schema({
    prompt: { type: String },
    isActive: { type: Boolean, default: false },
}, {
    _id: false, // no separate _id for subdoc
    timestamps: true, // adds createdAt & updatedAt
});
