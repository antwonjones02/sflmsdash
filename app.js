
const supabaseUrl = "https://zmlnokldugvrijkmfobv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptbG5va2xkdWd2cmlqa21mb2J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4ODk5ODcsImV4cCI6MjA2NDQ2NTk4N30.ogiBSe0Oy7y13GeXgt0crijNZdGHjGCPgVoqVuf-KVE";
const client = window.supabase.createClient(supabaseUrl, supabaseKey);

// Pagination
let currentPage = 1;
const itemsPerPage = 25;

async function loadFeaturesFromSupabase(page = 1) {
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const { data: features, error } = await client
        .from("feature_releases")
        .select("*")
        .range(from, to);

    if (error) {
        console.error("Supabase error:", error.message);
        return;
    }

    console.log("Data loaded from Supabase:", features);

    const tableBody = document.querySelector("#features-table tbody");
    if (!tableBody) {
        console.error("Features table body not found");
        return;
    }

    tableBody.innerHTML = features
        .map((f) => `
            <tr>
                <td>${f.title || ""}</td>
                <td>${f["reference_number"] || ""}</td>
                <td>${f.description || ""}</td>
                <td>${f["software_version"] || ""}</td>
                <td>${f.module || ""}</td>
                <td>${f.lifecycle || ""}</td>
                <td>${f.enablement || ""}</td>
                <td>${f.status || ""}</td>
            </tr>
        `)
        .join("");
}

document.addEventListener("DOMContentLoaded", function () {
    loadFeaturesFromSupabase();
});
