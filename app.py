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

    # Ask for 100 entries to get more historical GDP values
    url = f"https://api.worldbank.org/v2/country/{country_code}/indicator/NY.GDP.MKTP.CD?format=json&per_page=100"
    response = requests.get(url)

    if response.status_code != 200:
        return jsonify({'error': 'World Bank API error'}), 500

    data = response.json()

    try:
        gdp_entries = data[1]
        # Loop through and find the first non-null GDP
        for entry in gdp_entries:
            if entry['value'] is not None:
                return jsonify({
                    'gdp': entry['value'],
                    'year': entry['date'],
                    'country': entry['country']['value']
                })
        return jsonify({'error': 'No non-null GDP data found'}), 404
    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500
if __name__ == '__main__':
    app.run(debug=True)
