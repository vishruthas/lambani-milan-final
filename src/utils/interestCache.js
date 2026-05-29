export function getSentInterestIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem("sent_interests") || "[]"));
  } catch {
    return new Set();
  }
}

export function addSentInterest(userId) {
  const list = getSentInterestIds();
  list.add(userId);
  localStorage.setItem("sent_interests", JSON.stringify([...list]));
}
