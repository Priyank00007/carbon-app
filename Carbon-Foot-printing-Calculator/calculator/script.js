console.log(JSON.parse(localStorage.getItem("user")).Email);
async function generateReport() {
  const response = await fetch("/generate_report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transport: document.getElementById("transport").value,
      electricity: document.getElementById("electricity").value,
      food: document.getElementById("food").value,
      waste: document.getElementById("waste").value,
      email: JSON.parse(localStorage.getItem("user")).Email,
    }),
  });

  const data = await response.json();
  document.getElementById(
    "report"
  ).innerText = `Total Carbon Footprint: ${data.total.toFixed(2)} kg CO₂`;

  // Update chart
  updateChart(data.breakdown);
}

// Initialize and update the chart
let chartInstance = null;
function updateChart(breakdown) {
  const ctx = document.getElementById("carbonChart").getContext("2d");

  if (chartInstance) {
    chartInstance.destroy(); // Destroy previous instance to update data
  }

  chartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Transport", "Electricity", "Food Fuel", "Waste"],
      datasets: [
        {
          data: [
            breakdown.transport,
            breakdown.electricity,
            breakdown.food,
            breakdown.waste,
          ],
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4B6"],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
}
