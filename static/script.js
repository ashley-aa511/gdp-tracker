function fetchGDP() {
  const country = document.getElementById('country').value;
  fetch(`/get_gdp?country=${country}`)
    .then(res => res.json())
    .then(data => {
      const resultDiv = document.getElementById('result');
      if (data.error) {
        resultDiv.textContent = `Error: ${data.error}`;
        return;
      }

      resultDiv.textContent = `GDP in ${data.year}: $${Number(data.gdp).toLocaleString()}`;

      // Chart rendering
      const ctx = document.getElementById('chart').getContext('2d');
      if (window.myChart) window.myChart.destroy(); // destroy old chart if exists

      window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [data.year],
          datasets: [{
            label: 'GDP (USD)',
            data: [data.gdp],
            backgroundColor: 'rgba(54, 162, 235, 0.6)'
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    })
    .catch(err => {
      document.getElementById('result').textContent = 'Request failed';
      console.error(err);
    });
}
