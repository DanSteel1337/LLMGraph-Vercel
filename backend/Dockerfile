FROM python:3.11-slim

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create necessary directories
RUN mkdir -p data/documents

# Copy application code
COPY . .

# Expose the port
EXPOSE 8000

# Run the application
CMD ["python", "run.py"]
