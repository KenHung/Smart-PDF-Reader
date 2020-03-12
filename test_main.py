import pytest

from main import app


@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def test_entities(client):
    resp = client.get(
        '/api/entities?text=愛德華六世（Edward%20%20%20 VI）曾被伯爾內特（Burnet）主教稱為「無與倫比的王子」，他死於1553年7月6日。或許在英國歷史上從未有一個國王像他這樣被人真誠悼念')
    data = resp.get_json()
    edward = data['data'][0]
    assert edward['name'] == '愛德華六世'
    assert edward['full_name'] == 'Edward_VI_of_England'


def test_summary(client):
    resp = client.get('/api/summary/Edward_VI_of_England')
    data = resp.get_json()
    summary = data['data']
    assert summary['image_url'].startswith('https://')
    assert summary['text'] is not None
