import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyBO3IHCtcL7nuQt5VcnSqH20t9ZyRj7q_8");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

try {
  const result = await model.generateContent("Hello, world!");
  console.log("Success:", result.response.text());
} catch (error) {
  console.log("Error:", error.message || JSON.stringify(error));
}
