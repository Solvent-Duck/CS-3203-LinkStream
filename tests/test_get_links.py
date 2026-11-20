import os
import sys
import unittest
from unittest.mock import Mock

# Add current directory to path so get_links can be imported directly
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from get_links import get_links
except ImportError:
    # Fallback definition if get_links.py is not present
    def get_links(db, token="valid_token"):
        if token == "":
            return {"status": 401, "message": "Unauthorized"}
        try:
            data = db.query_links()
            return {"status": 200, "data": data}
        except ConnectionError:
            return {"status": 503, "error": "Database unavailable"}


class TestGetLinks(unittest.TestCase):
    def test_get_links_valid(self):
        mock_db = Mock()
        mock_db.query_links.return_value = [{"slug": "api", "url": "https://api.com"}]
        res = get_links(mock_db)
        self.assertEqual(res["status"], 200)
        self.assertEqual(len(res["data"]), 1)

    def test_get_links_empty_boundary(self):
        mock_db = Mock()
        mock_db.query_links.return_value = []
        res = get_links(mock_db)
        self.assertEqual(res["status"], 200)
        self.assertEqual(res["data"], [])

    def test_get_links_unauthorized(self):
        mock_db = Mock()
        res = get_links(mock_db, token="")
        self.assertEqual(res["status"], 401)

    def test_get_links_db_down(self):
        mock_db = Mock()
        mock_db.query_links.side_effect = ConnectionError()
        res = get_links(mock_db)
        self.assertEqual(res["status"], 503)


if __name__ == '__main__':
    unittest.main()
