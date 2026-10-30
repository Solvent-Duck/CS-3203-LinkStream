import unittest

from resource_search import get_shortcuts, verify_admin_permission


class TestResourceSearch(unittest.TestCase):
    def test_get_shortcuts_returns_available_shortcuts(self):
        shortcuts = get_shortcuts()

        self.assertGreater(len(shortcuts), 0)
        self.assertEqual(shortcuts[0]["name"], "Sprint board")

    def test_get_shortcuts_returns_empty_list_for_empty_input(self):
        self.assertEqual(get_shortcuts([]), [])

    def test_get_shortcuts_supports_a_single_shortcut(self):
        one_shortcut = [{"name": "Handbook", "link": "https://example.com/handbook"}]

        self.assertEqual(get_shortcuts(one_shortcut), one_shortcut)

    def test_get_shortcuts_returns_empty_list_for_invalid_input(self):
        self.assertEqual(get_shortcuts("not a list"), [])

    def test_verify_admin_permission_valid(self):
        self.assertTrue(verify_admin_permission("admin_123"))

    def test_verify_admin_permission_invalid(self):
        self.assertFalse(verify_admin_permission(""))
        self.assertFalse(verify_admin_permission("member_123"))


if __name__ == "__main__":
    unittest.main()
