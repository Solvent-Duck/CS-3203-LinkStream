"""
Module implementing get_links function for backend API.
"""


def get_links(db, token="valid_token"):
    """
    Fetch links from the database.

    Args:
        db: Database client / connection object with a query_links method.
        token: Optional auth token string. If empty, request is unauthorized.

    Returns:
        dict: Response object containing 'status' and 'data' or error details.
    """
    if token == "":
        return {"status": 401, "message": "Unauthorized"}
    try:
        data = db.query_links()
        return {"status": 200, "data": data}
    except ConnectionError:
        return {"status": 503, "error": "Database unavailable"}
