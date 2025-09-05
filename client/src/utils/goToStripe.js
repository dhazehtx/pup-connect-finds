// utils/goToStripe.js
export function goToStripe(url) {
  try {
    // If inside an iframe (like Replit preview), open a new tab
    if (window.top !== window.self) {
      window.open(url, "_blank");
    } else {
      // If running outside an iframe (production), redirect normally
      window.location.href = url;
    }
  } catch (err) {
    console.error("Stripe redirect failed:", err);
    window.open(url, "_blank"); // fallback
  }
}