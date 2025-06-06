from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_gdp')
def get_gdp():
    country_code = request.args.get('country')
    if not country_code:
        return jsonify({'error': 'No country code provided'}), 400

    url = f"https://api.worldbank.org/v2/country/{country_code}/indicator/NY.GDP.MKTP.CD?format=json&per_page=100"
    response = requests.get(url)

    if response.status_code != 200:
        return jsonify({'error': 'World Bank API error'}), 500

    data = response.json()

    try:
        gdp_entries = data[1]
        # Get last 5 non-null GDP values
        gdp_data = [
            {
                'year': entry['date'],
                'value': entry['value']
            }
            for entry in gdp_entries
            if entry['value'] is not None
        ][:5]

        if not gdp_data:
            return jsonify({'error': 'No valid GDP data found'}), 404

        # Reverse to get oldest -> newest
        gdp_data.reverse()

        summary = summarize_gdp(gdp_data)

        return jsonify({
                'country': gdp_entries[0]['country']['value'],
                'gdp_data': gdp_data,
                'summary': summary
            })
    
    except Exception as e:
            return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

def summarize_gdp(data):
    # data: list of dicts with 'year' and 'value', sorted oldest -> newest
    start = data[0]['value']
    end = data[-1]['value']
    years = len(data) - 1
    if not start or not end or years == 0:
        return "Insufficient data for summary."

    growth = ((end - start) / start) * 100
    avg_growth = growth / years

    trend = "increased 📈" if growth > 0 else "decreased 📉" if growth < 0 else "remained stable ➖"

    summary = (
        f"From {data[0]['year']} to {data[-1]['year']}, GDP {trend} "
        f"by {abs(growth):.2f}%, averaging {abs(avg_growth):.2f}% growth per year."
    )
    return summary

    
if __name__ == '__main__':
        app.run(debug=True)