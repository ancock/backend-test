// 1) Nach dem Erstellen deines Supabase-Projekts hier eintragen.
const SUPABASE_URL = "";
const SUPABASE_PUBLISHABLE_KEY = "";

const form = document.querySelector("#reservationForm");
const statusBox = document.querySelector("#status");

const supabaseReady =
  SUPABASE_URL &&
  SUPABASE_PUBLISHABLE_KEY &&
  window.supabase;

let supabaseClient = null;

if (supabaseReady) {
  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const reservation = {
    date: document.querySelector("#date").value,
    time: document.querySelector("#time").value,
    guests: Number(document.querySelector("#guests").value),
    name: document.querySelector("#name").value.trim(),
    email: document.querySelector("#email").value.trim()
  };

  if (!supabaseClient) {
    statusBox.textContent =
      "Demo: Supabase ist noch nicht verbunden.";
    return;
  }

  statusBox.textContent = "Speichere Reservierung …";

  const { error } = await supabaseClient
    .from("reservations")
    .insert(reservation);

  if (error) {
    console.error(error);
    statusBox.textContent = "Fehler: " + error.message;
    return;
  }

  statusBox.textContent =
    "Reservierung wurde in der Datenbank gespeichert.";
  form.reset();
});