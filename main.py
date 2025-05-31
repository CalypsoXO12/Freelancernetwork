from app import app

# For Gunicorn deployment
application = app

if __name__ == "__main__":
    app.run()
