import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient
from app.main import app
import re

client = TestClient(app)


def test_search():
    response = client.get("/api/search?query=Inception")
    assert response.status_code == 200
    assert "results" in response.json()


@pytest.mark.asyncio
async def test_title_details():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/details/27205/Movie")

    if response.status_code != 200:
        print(f"Error response: {response.text}")

    assert (
        response.status_code == 200
    ), f"Expected 200, got {response.status_code}. Response: {response.text}"
    data = response.json()

    assert "details" in data, f"Response missing 'details'. Full response: {data}"
    assert (
        "additional_info" in data
    ), f"Response missing 'additional_info'. Full response: {data}"
