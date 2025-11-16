# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables for better Python behavior in containers
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Create a non-root user to run the application
RUN adduser --disabled-password --gecos "" appuser

# Set the working directory in the container
WORKDIR /code

# Copy the requirements.txt into the container at /code
COPY ./requirements.txt /code/requirements.txt

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy the current directory contents into the container at /code/app
COPY ./app /code/app

# Change ownership of the application files to appuser
RUN chown -R appuser:appuser /code

# Switch to the non-root user
USER appuser

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Run Gunicorn when the container launches, set workers timeout to 10 minutes for trending movies process 
CMD ["gunicorn", "app.main:app", "--workers=2", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000", "--timeout", "600"]
