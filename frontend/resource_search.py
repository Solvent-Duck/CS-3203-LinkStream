"""Simple resource-search helpers for the LinkStream frontend prototype."""

SHORTCUTS = [
    {"name": "Sprint board", "link": "https://example.com/sprint"},
    {"name": "API docs", "link": "https://example.com/api-docs"},
]

ADMIN_IDS = {"admin_123"}


def get_shortcuts():
    """Return the available resource shortcuts without exposing the source list."""
    return SHORTCUTS.copy()


def verify_admin_permission(user_id):
    """Return whether a non-empty user ID belongs to an administrator."""
    return bool(user_id) and user_id in ADMIN_IDS
