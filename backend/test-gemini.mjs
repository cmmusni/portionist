import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyCsF63Dje1VuaEw8HMTQUdWTVenbUNpKVM");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

try {
  const result = await model.generateContent("Hello, world!");
  console.log("Success:", result.response.text());
} catch (error) {
  console.log("Error:", error.message || JSON.stringify(error));
}
