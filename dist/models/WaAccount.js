"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaAccount = exports.WaAccountSchema = void 0;
var crypto_1 = require("@/lib/crypto");
var AIChat_1 = require("./AIChat");
var AIAgent_1 = require("./AIAgent");
var mongoose_1 = require("mongoose");
exports.WaAccountSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    phone_number_id: { type: String, required: true },
    waba_id: { type: String, required: true },
    business_id: {
        type: String,
        required: true,
        set: function (value) { return (0, crypto_1.encrypt)(String(value)); },
        get: function (value) { var _a; return (_a = (0, crypto_1.safeDecrypt)(value)) !== null && _a !== void 0 ? _a : ""; },
    },
    permanent_token: {
        type: String,
        required: true,
        set: function (value) { return (0, crypto_1.encrypt)(String(value)); },
        get: function (value) { var _a; return (_a = (0, crypto_1.safeDecrypt)(value)) !== null && _a !== void 0 ? _a : ""; },
    },
    verified_name: String,
    display_phone_number: String,
    quality_rating: String,
    last_onboarded_time: { type: Date },
    code_verification_status: String,
    is_phone_number_registered: Boolean,
    is_app_subscribed: Boolean,
    blockedNumbers: {
        type: [String],
        default: [],
    },
    aiChat: { type: AIChat_1.AIChatSchema },
    aiAgent: { type: AIAgent_1.AIAgentSchema },
}, {
    // _id: true,
    toJSON: { getters: true },
    toObject: { getters: true },
    timestamps: true,
});
exports.WaAccount = mongoose_1.models.WaAccount || (0, mongoose_1.model)("WaAccount", exports.WaAccountSchema);
