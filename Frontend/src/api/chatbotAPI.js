import apiClient from "./apiClient";

export const sendChatbotMessage = ({ message, history, pendingAction }) => {
  return apiClient.post("/chatbot/chat", {
    message,
    history,
    pendingAction,
  }, {
    timeout: 30000,
  });
};
