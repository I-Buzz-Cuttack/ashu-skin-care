import apiClient from "./apiClient";

export const sendChatbotMessage = ({ message, history }) => {
  return apiClient.post("/chatbot/chat", {
    message,
    history,
  }, {
    timeout: 30000,
  });
};
