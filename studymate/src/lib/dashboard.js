export async function getStats() {
  const res = await fetch("http://127.0.0.1:8000/api/dashboard/stats");
  return res.json();
}

export async function getActivity() {
  const res = await fetch("http://127.0.0.1:8000/api/dashboard/activity");
  return res.json();
}
