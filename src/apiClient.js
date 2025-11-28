export async function callAI(type, prompt) {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, prompt })
  });
  const json = await res.json();
  if (!json.success) throw new Error("AI error");
  return json.data;
}
