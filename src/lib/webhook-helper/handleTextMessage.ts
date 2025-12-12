// --------------------------------------
// HANDLE TEXT MESSAGE
// --------------------------------------
async function handleTextMessage({
  msg,
  from,
  chat,
  user,
  wa,
  phone_number_id,
  sender_name,
  change
}: any) {

  const messageText = msg.text?.body || "";
  const waMessageId = msg.id;

  // Save incoming text message
  const newMessage = await Message.create({
    userId: user._id,
    chatId: chat._id,
    to: phone_number_id,
    from,
    message: messageText,
    waMessageId,
    status: MessageStatus.Received,
    type: MessageType.TEXT,
    context: msg.context || null
  });

  // Update chat
  chat.lastMessage = messageText;
  chat.lastMessageAt = new Date();
  chat.unreadCount = (chat.unreadCount || 0) + 1;
  await chat.save();

  // Push message to UI
  await sendPusherNotification({
    userId: user._id.toString(),
    event: "new-message",
    chat,
    message: newMessage,
  });

  // AI handling --------------------------------
  if (wa.aiAgent?.isActive && wa.aiAgent?.webhookUrl) {
    await sendToAIAgent({
      webhookUrl: wa.aiAgent.webhookUrl,
      payload: change,
      prompt: wa.aiAgent.prompt,
      user_name: sender_name
    });
  } 
  else if (wa.aiChat?.isActive) {
    const { aiGeneratedReply, aiUsageId } = await getAIReply({
      userId: user._id.toString(),
      prompt: wa.aiChat?.prompt ?? "",
      chat,
      phone_number_id,
      user_name: sender_name
    });

    if (aiGeneratedReply) {
      const { newMessage: aiMessage, waMessageId } = await sendWhatsAppMessage({
        userId: user._id.toString(),
        chatId: chat._id,
        phone_number_id,
        permanent_token: wa.permanent_token,
        to: from,
        message: aiGeneratedReply,
        tag: "aichat",
        aiUsageId,
      });

      if (waMessageId) {
        await sendPusherNotification({
          userId: user._id.toString(),
          event: "new-message",
          chat,
          message: aiMessage,
        });
      }
    }
  }
}
