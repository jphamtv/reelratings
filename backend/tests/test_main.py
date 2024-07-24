import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient
from unittest.mock import patch
from app.main import app

client = TestClient(app)


def test_trending_movies():
    response = client.get("/api/trending")
    assert response.status_code == 200
    assert "results" in response.json()


def test_search():
    response = client.get("/api/search?query=Inception")
    assert response.status_code == 200
    assert "results" in response.json()


@pytest.mark.asyncio
async def test_title_details():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/details/27205/movie")
    assert response.status_code == 200
    data = response.json()
    assert "tmdb_data" in data
    assert "external_data" in data


def test_director_movies():
    response = client.get("/api/director/138")
    assert response.status_code == 200
    assert "results" in response.json()
