"""Translate business errors into HTTP responses in one place."""

from __future__ import annotations

import logging

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

from src.domain.errors import (
    AuthenticationError,
    ConflictError,
    DomainError,
    FileTooLargeError,
    NotFoundError,
    PermissionDeniedError,
    ValidationError,
)

logger = logging.getLogger(__name__)

STATUS_BY_ERROR: tuple[tuple[type[DomainError], int], ...] = (
    (NotFoundError, status.HTTP_404_NOT_FOUND),
    (AuthenticationError, status.HTTP_401_UNAUTHORIZED),
    (PermissionDeniedError, status.HTTP_403_FORBIDDEN),
    (ConflictError, status.HTTP_409_CONFLICT),
    (FileTooLargeError, 413),
    (ValidationError, 422),
)


def status_for(error: DomainError) -> int:
    # Keep specific domain errors mapped before their parent classes.
    for error_type, code in STATUS_BY_ERROR:
        if isinstance(error, error_type):
            return code
    # Unknown domain errors are treated as bad requests by default.
    return status.HTTP_400_BAD_REQUEST


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(DomainError)
    async def handle_domain_error(_: Request, exc: DomainError) -> JSONResponse:
        code = status_for(exc)
        # Bearer clients need this challenge header when authentication fails.
        headers = {"WWW-Authenticate": "Bearer"} if code == status.HTTP_401_UNAUTHORIZED else None
        return JSONResponse(status_code=code, content={"detail": exc.message}, headers=headers)

    @app.exception_handler(Exception)
    async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
        # Log internal details, but keep the response generic to avoid exposing them.
        logger.exception("Unhandled error on %s %s", request.method, request.url.path)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Lỗi hệ thống không mong muốn"},
        )
