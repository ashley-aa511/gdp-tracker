let chart;

// Economic fun facts list
const facts = [
  "The world's richest country by GDP per capita is Luxembourg.",
  "Kenya’s economy is the largest in East Africa.",
  "Hyperinflation in Zimbabwe once reached 79.6 billion percent in November 2008.",
  "The United States has had the world’s largest GDP since the 19th century.",
  "GDP doesn't measure happiness or well-being.",
  "China overtook Japan as the world’s second-largest economy in 2010.",
  "GDP per capita is often used as a proxy for living standards.",
  "Ethiopia was one of the fastest-growing economies in the 2010s.",
  "The concept of GDP was introduced in the 1930s during the Great Depression.",
  "High inflation can destabilize an entire economy, not just prices."
];

// Utility to pick a random fact
function getRandomFact() {
  const index = Math.floor(Math.random() * facts.length);
  return facts[index];
}

function updateDidYouKnow() {
  const factText = document.getElementById('factText');
  if (factText) {
    factText.textContent = getRandomFact();
  }
}

// Main data fetch + chart render logic
document.getElementById('getDataBtn').addEventListener('click', () => {
  const country = document.getElementById('countrySelect').value;
  const indicator = document.getElementById('indicatorSelect').value;
  const resultDiv = document.getElementById('result');
  const summaryDiv = document.getElementById('summary');

  fetch(`/get_economic_data?country=${country}&indicator=${indicator}`)
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        resultDiv.innerHTML = `<p style="color: red;">Error: ${data.error}</p>`;
        summaryDiv.innerHTML = '';
        if (chart) chart.destroy();
        return;
      }

      const labels = data.data.map(entry => entry.year);
      const values = data.data.map(entry => entry.value);

      resultDiv.innerHTML = `<h3>${data.indicator} for ${data.country}</h3>`;
      summaryDiv.innerHTML = `<em>${data.summary || ''}</em>`;

      if (chart) chart.destroy();

      const ctx = document.getElementById('gdpChart').getContext('2d');
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: data.indicator,
            data: values,
            backgroundColor: 'rgba(75, 192, 192, 0.3)',
            borderColor: 'rgba(75, 192, 192, 1)',
            fill: true,
            tension: 0.2
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: false,
              ticks: {
                callback: function (value) {
                  if (value >= 1e12) return '$' + (value / 1e12).toFixed(2) + 'T';
                  if (value >= 1e9) return '$' + (value / 1e9).toFixed(1) + 'B';
                  if (value >= 1e6) return '$' + (value / 1e6).toFixed(1) + 'M';
                  return value;
                }
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: `${data.indicator} for ${data.country} (1960–Present)`
            }
          }
        }
      });

      // Show a random fun fact
      updateDidYouKnow();
    })
    .catch(err => {
      console.error('Fetch failed:', err);
      resultDiv.innerHTML = `<p style="color: red;">Request failed</p>`;
      summaryDiv.innerHTML = '';
      if (chart) chart.destroy();
    });
    // Handle the "Refresh Fact" button
document.getElementById('refreshFactBtn').addEventListener('click', () => {
  updateDidYouKnow();
});

});
