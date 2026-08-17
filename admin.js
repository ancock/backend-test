// Admin-Dashboard
// Voraussetzung: js/supabase.js erstellt einen Supabase-Client namens "supabaseClient".

const loadingEl = document.getElementById("admin-loading");
const errorEl = document.getElementById("admin-error");
const containerEl = document.getElementById("reservations-container");
const bodyEl = document.getElementById("reservations-body");
const refreshBtn = document.getElementById("refresh-btn");
const logoutBtn = document.getElementById("logout-btn");

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
}

function hideError() {
  errorEl.hidden = true;
  errorEl.textContent = "";
}

function formatDate(dateString) {
  if (!dateString) return "–";
  return new Date(dateString).toLocaleDateString("de-DE");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function checkAdminAndLoad() {
  loadingEl.hidden = false;
  containerEl.hidden = true;
  hideError();

  if (typeof supabaseClient === "undefined") {
    loadingEl.hidden = true;
    showError(
      "Der Supabase-Client wurde nicht gefunden. Bitte prüfe deine vorhandene js/supabase.js."
    );
    return;
  }

  const { data: { user }, error: userError } =
    await supabaseClient.auth.getUser();

  if (userError || !user) {
    window.location.href = "login.html";
    return;
  }

  await loadReservations();
}

async function loadReservations() {
  loadingEl.hidden = false;
  hideError();

  const { data, error } = await supabaseClient
    .from("reservations")
    .select("*")
    .order("date", { ascending: true })
    .order("time", { ascending: true });

  loadingEl.hidden = true;

  if (error) {
    showError("Reservierungen konnten nicht geladen werden: " + error.message);
    return;
  }

  bodyEl.innerHTML = "";

  if (!data || data.length === 0) {
    bodyEl.innerHTML = `
      <tr>
        <td colspan="7">Noch keine Reservierungen vorhanden.</td>
      </tr>
    `;
  } else {
    for (const reservation of data) {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${escapeHtml(formatDate(reservation.date))}</td>
        <td>${escapeHtml(reservation.time || "–")}</td>
        <td>${escapeHtml(reservation.name || "–")}</td>
        <td>${escapeHtml(reservation.guests ?? "–")}</td>
        <td>${escapeHtml(reservation.email || "–")}</td>
        <td>${escapeHtml(reservation.phone || "–")}</td>
        <td>${escapeHtml(reservation.status || "pending")}</td>
      `;

      bodyEl.appendChild(row);
    }
  }

  containerEl.hidden = false;
}

refreshBtn.addEventListener("click", loadReservations);

logoutBtn.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
});

checkAdminAndLoad();
