"""Simple resource-search helpers for the LinkStream frontend prototype."""

DEFAULT_SHORTCUTS = [
    {"name": "Sprint board", "link": "https://example.com/sprint"},
    {"name": "API docs", "link": "https://example.com/api-docs"},
]

ADMIN_IDS = {"admin_123"}


def get_shortcuts(shortcuts=None):
    """Return a copy of valid shortcuts, including an empty or one-item list."""
    source = DEFAULT_SHORTCUTS if shortcuts is None else shortcuts
    if not isinstance(source, list):
        return []

    return source.copy()


def verify_admin_permission(user_id):
    """Return whether a non-empty user ID belongs to an administrator."""
    return bool(user_id) and user_id in ADMIN_IDS
