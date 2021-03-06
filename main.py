import requests
from flask import Flask, request, send_from_directory, jsonify
import wikipedia as wiki

from google.cloud import language
from google.cloud.language import enums, types

app = Flask(__name__)

client = language.LanguageServiceClient()


@app.route('/')
def root():
    return send_from_directory('templates', 'index.html')


@app.route('/api/analyzeEntities', methods=['POST'])
def entities():
    """get all entities in text using Google NLP API, 
    only entities with wikipedia entries are returned
    """
    text = request.get_json().get('text')

    document = types.Document(
        content=text,
        type=enums.Document.Type.PLAIN_TEXT)

    resp = client.analyze_entities(document=document, encoding_type='UTF32')
    # bypass non-English entities or entities without wiki entry
    wiki_entities = [e for e in resp.entities if e.metadata.get(
        'wikipedia_url', '').startswith('https://en')]

    info_data = []
    for e in wiki_entities:
        full_name = e.metadata['wikipedia_url'].split('/')[-1]
        entity = dict(
            name=e.name,
            full_name=full_name)
        print(entity)
        info_data.append(entity)

    # no error at the moment
    return jsonify(status='success', data=info_data)


@app.route('/api/summary/<entity>')
def summary(entity):
    """get summary data from Wikipedia, mainly text and primary image url"""
    rm = requests.get(
        f'https://en.wikipedia.org/api/rest_v1/page/metadata/{entity}')
    metadata = rm.json()
    zh = next(
        (link for link in metadata['language_links'] if link['lang'] == 'zh'), None)
    if zh is not None:
        summary_url = zh['summary_url']
    else:
        summary_url = f'https://en.wikipedia.org/api/rest_v1/page/summary/{entity}'

    resp = requests.get(summary_url)
    print('GET ' + resp.url)
    data = resp.json()
    summary_data = {
        'name': entity,
        'image_url': data['thumbnail']['source'] if 'thumbnail' in data else None,
        'text': data.get('extract'),
        'wiki': data['content_urls']['desktop']['page']
    }
    return jsonify(status='success', data=summary_data)


if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.
    # Flask's development server will automatically serve static files in
    # the "static" directory. See:
    # http://flask.pocoo.org/docs/1.0/quickstart/#static-files. Once deployed,
    # App Engine itself will serve those files as configured in app.yaml.
    app.run(host='127.0.0.1', port=8080, debug=True)
