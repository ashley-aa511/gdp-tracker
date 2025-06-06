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

let chart; // store reference to chart instance

document.getElementById('countrySelect').addEventListener('change', function () {
    const country = this.value;

    fetch(`/get_gdp?country=${country}`)
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                document.getElementById('result').innerText = `Error: ${data.error}`;
                return;
            }

            const labels = data.gdp_data.map(entry => entry.year);
            const values = data.gdp_data.map(entry => entry.value);

            document.getElementById('result').innerText = 
                `GDP data for ${data.country} (${labels.join(', ')}):`;

            // Destroy previous chart if it exists
            if (chart) chart.destroy();

            const ctx = document.getElementById('gdpChart').getContext('2d');
            chart = new Chart(ctx, {
                type: 'bar', // or 'line'
                data: {
                    labels: labels,
                    datasets: [{
                        label: `GDP (USD)`,
                        data: values,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function (value) {
                                    return '$' + (value / 1e9).toFixed(1) + 'B';
                                }
                            }
                        }
                    }
                }
            });
        });
});
