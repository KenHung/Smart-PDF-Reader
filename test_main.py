import pytest

from main import app


@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_info(client):
    res = client.get('/info?text=愛德華六世（Edward%20%20%20 VI）曾被伯爾內特（Burnet）主教稱為「無與倫比的王子」，他死於1553年7月6日。或許在英國歷史上從未有一個國王像他這樣被人真誠悼念')
    json_data = res.get_json()
    edward = json_data['data'][0]
    assert edward.name == '愛德華六世'