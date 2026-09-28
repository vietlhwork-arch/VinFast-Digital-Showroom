# ============================================
# Multi-Stage Production Dockerfile for Render
# ============================================

# ---- Stage 1: Build React Frontend ----
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci || npm install

COPY frontend/ ./
COPY static/ ./static/

RUN npm run build

# ---- Stage 2: Install Python Dependencies ----
FROM python:3.11-slim AS python-builder
WORKDIR /app

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ---- Stage 3: Production Runtime Container ----
FROM python:3.11-slim AS production
WORKDIR /app

# Copy installed Python virtualenv from builder
COPY --from=python-builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1

# Copy backend application source
COPY . .

# Copy compiled SPA dist from frontend-builder stage
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Security: Create non-root user & ensure directory permissions
RUN useradd -m appuser && \
    mkdir -p /app/data /app/static /app/frontend/public && \
    chown -R appuser:appuser /app

USER appuser

# Render dynamically binds $PORT (default 8000)
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD python -c "import urllib.request, os; port = os.environ.get('PORT', '8000'); urllib.request.urlopen(f'http://localhost:{port}/health')" || exit 1

# Launch Uvicorn with dynamic $PORT support
CMD ["sh", "-c", "uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
