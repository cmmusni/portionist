import { apiUrl } from "./config";

export const getRecipes = async (data: any) => {
  const res = await fetch(apiUrl("/getRecipes"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const saveFavorite = async (data: any) => {
  const res = await fetch(apiUrl("/saveFavorite"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};
