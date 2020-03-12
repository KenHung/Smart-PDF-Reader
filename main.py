import datetime

import requests
from flask import Flask, request, render_template, jsonify
import wikipedia as wiki

from google.cloud import language
from google.cloud.language import enums, types

app = Flask(__name__)

client = language.LanguageServiceClient()

@app.route('/')
def root():
    # For the sake of example, use static information to inflate the template.
    # This will be replaced with real information in later steps.
    dummy_times = [datetime.datetime(2018, 1, 1, 10, 0, 0),
                   datetime.datetime(2018, 1, 2, 10, 30, 0),
                   datetime.datetime(2018, 1, 3, 11, 0, 0),
                   ]

    return render_template('index.html', times=dummy_times)

@app.route('/info')
def info():
    text = request.args.get('text')

    document = types.Document(
        content=text,
        type=enums.Document.Type.PLAIN_TEXT)

    resp = client.analyze_entities(document=document, encoding_type='UTF32')
    wiki_entities = [e for e in resp.entities if 'wikipedia_url' in e.metadata]

    info_data = []
    for e in wiki_entities:
        full_name = e.metadata['wikipedia_url'].split('/')[-1]
        entity = dict(
            name=e.name,
            image_url=get_primary_image(full_name),
            summary=wiki.summary(full_name, sentences=2))
        print(entity)
        info_data.append(entity)

    # no error at the moment
    return jsonify(status='success', data=info_data)

def get_primary_image(title):
    payload = dict(
        action='query',
        prop='pageimages',
        titles=title,
        pithumbsize=200,
        format='json'
    )
    resp = requests.get('https://en.wikipedia.org/w/api.php', params=payload)
    print('GET ' + resp.url)
    data = resp.json()
    page_info = next(iter(data['query']['pages'].values()))
    return page_info['thumbnail']['source'] if 'thumbnail' in page_info else None

if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.
    # Flask's development server will automatically serve static files in
    # the "static" directory. See:
    # http://flask.pocoo.org/docs/1.0/quickstart/#static-files. Once deployed,
    # App Engine itself will serve those files as configured in app.yaml.
    app.run(host='127.0.0.1', port=8080, debug=True)
