let chart;

document.getElementById('getGdpBtn').addEventListener('click', () => {
  const country = document.getElementById('countrySelect').value;
  const resultDiv = document.getElementById('result');
  const summaryDiv = document.getElementById('summary'); // Add this in your HTML

  fetch(`/get_gdp?country=${country}`)
    .then(res => res.json())
    .then(data => {  
      if (data.error) {
        resultDiv.innerHTML = `<p style="color: red;">Error: ${data.error}</p>`;
        summaryDiv.innerHTML = ''; // clear summary on error
        if (chart) chart.destroy();
        return;
      }

      const labels = data.gdp_data.map(entry => entry.year);
      const values = data.gdp_data.map(entry => entry.value);

      resultDiv.innerHTML = `<h3>GDP for ${data.country}</h3><p>${labels.join(', ')}</p>`;
      summaryDiv.innerHTML = `<em>${data.summary || ''}</em>`; // display summary

      if (chart) chart.destroy();

      const ctx = document.getElementById('gdpChart').getContext('2d');
      chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'GDP (USD)',
            data: values,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: false,
              ticks: {
  callback: function (value) {
    if (value >= 1e12) {
      return '$' + (value / 1e12).toFixed(2) + 'T';
    } else {
      return '$' + (value / 1e9).toFixed(1) + 'B';
    }
  }
}            }
          },
          plugins: {
            legend: {
              display: true,
              position: 'top'
            },
            title: {
              display: true,
              text: `GDP of ${data.country} Over Time`
            }
          }
        } 
      });
    })
    .catch(err => {
      console.error('Fetch failed:', err);
      resultDiv.innerHTML = `<p style="color: red;">Request failed</p>`;
      summaryDiv.innerHTML = '';
      if (chart) chart.destroy();
    });
});
