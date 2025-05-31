from app import app
import routes  # This imports all the route definitions

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
