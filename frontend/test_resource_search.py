import unittest

from resource_search import get_shortcuts, verify_admin_permission


class TestResourceSearch(unittest.TestCase):
    def test_get_shortcuts_success(self):
        shortcuts = get_shortcuts()
        self.assertIsNotNone(shortcuts)

    def test_verify_admin_permission_valid(self):
        self.assertTrue(verify_admin_permission("admin_123"))

    def test_verify_admin_permission_invalid(self):
        self.assertFalse(verify_admin_permission(""))


if __name__ == "__main__":
    unittest.main()
