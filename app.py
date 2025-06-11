from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_economic_data')
def get_economic_data():
    country_code = request.args.get('country')
    indicator = request.args.get('indicator')

    if not country_code or not indicator:
        return jsonify({'error': 'Missing country or indicator parameter'}), 400

    url = f"https://api.worldbank.org/v2/country/{country_code}/indicator/{indicator}?format=json&per_page=100"
    response = requests.get(url)

    if response.status_code != 200:
        return jsonify({'error': 'World Bank API error'}), 500

    data = response.json()

    try:
        entries = data[1]
        # Filter out nulls and keep latest 60 years (or all available)
        clean_data = [
            {'year': entry['date'], 'value': entry['value']}
            for entry in entries if entry['value'] is not None
        ]
        clean_data.reverse()  # So oldest -> newest

        if not clean_data:
            return jsonify({'error': 'No valid data found'}), 404

        summary = summarize(clean_data)

        return jsonify({
            'country': entries[0]['country']['value'],
            'indicator': entries[0]['indicator']['value'],
            'data': clean_data,
            'summary': summary
        })

    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

def summarize(data):
    start = data[0]['value']
    end = data[-1]['value']
    years = len(data) - 1
    if not start or not end or years == 0:
        return "Insufficient data for summary."

    growth = ((end - start) / start) * 100
    avg_growth = growth / years

    trend = "increased 📈" if growth > 0 else "decreased 📉" if growth < 0 else "remained stable ➖"

    summary = (
        f"From {data[0]['year']} to {data[-1]['year']}, this indicator {trend} "
        f"by {abs(growth):.2f}%, averaging {abs(avg_growth):.2f}% per year."
    )
    return summary

if __name__ == '__main__':
    app.run(debug=True)
