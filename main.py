#!/usr/bin/env python3

import os
import sys
import logging
import traceback
import stripe
from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Set up extensive logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.StreamHandler(sys.stderr)
    ]
)
logger = logging.getLogger(__name__)

print("=" * 80)
print("STARTING FREELANCE FINANCIAL TOOLKIT")
print("=" * 80)
print(f"Python version: {sys.version}")
print(f"Working directory: {os.getcwd()}")
print(f"Files in directory: {os.listdir('.')}")
print(f"Environment variables:")
for key in ['PORT', 'DATABASE_URL', 'SESSION_SECRET', 'STRIPE_SECRET_KEY']:
    value = os.environ.get(key, 'NOT SET')
    if 'SECRET' in key or 'KEY' in key:
        value = '***HIDDEN***' if value != 'NOT SET' else 'NOT SET'
    print(f"  {key}: {value}")
print("=" * 80)

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")

logger.info("Flask app initialized successfully")

# Database configuration for Render
database_url = os.environ.get('DATABASE_URL')
logger.info(f"Database URL configured: {'YES' if database_url else 'NO (using SQLite)'}")

if database_url:
    # Fix postgres:// to postgresql:// for SQLAlchemy 1.4+
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
        logger.info("Fixed postgres:// URL to postgresql://")
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///freelancer.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

try:
    db = SQLAlchemy(app)
    logger.info("SQLAlchemy initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize SQLAlchemy: {e}")
    logger.error(traceback.format_exc())

# Stripe configuration
stripe_key = os.environ.get('STRIPE_SECRET_KEY')
if stripe_key:
    stripe.api_key = stripe_key

# Models
class NewsletterSubscriber(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Routes with extensive debugging
@app.route('/')
def index():
    logger.info("HOME PAGE REQUESTED - Starting index() function")
    try:
        logger.info("Attempting to render index.html template")
        result = render_template('index.html')
        logger.info("Successfully rendered index.html template")
        return result
    except Exception as e:
        logger.error(f"ERROR rendering index.html: {e}")
        logger.error(traceback.format_exc())
        return f"<h1>Error loading homepage</h1><pre>{e}</pre><pre>{traceback.format_exc()}</pre>", 500

@app.route('/hourly-rate-calculator')
def hourly_rate_calculator():
    return render_template('hourly-rate-calculator.html')

@app.route('/project-profit-calculator')
def project_profit_calculator():
    return render_template('project-profit-calculator.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/privacy')
def privacy():
    return render_template('privacy.html')

@app.route('/terms')
def terms():
    return render_template('terms.html')

@app.route('/premium-features')
def premium_features():
    return render_template('premium-features.html')

@app.route('/subscribe-newsletter', methods=['POST'])
def subscribe_newsletter():
    email = request.form.get('email')
    if email:
        try:
            existing = NewsletterSubscriber.query.filter_by(email=email).first()
            if not existing:
                subscriber = NewsletterSubscriber()
                subscriber.email = email
                db.session.add(subscriber)
                db.session.commit()
            flash('Thank you for subscribing!', 'success')
        except:
            flash('Error subscribing. Please try again.', 'danger')
    return redirect(url_for('premium_features'))

@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    if not stripe_key:
        return "Payment processing unavailable", 400
    
    try:
        # Use the correct domain for Render
        domain = 'freelancernetwork.onrender.com'
        
        checkout_session = stripe.checkout.Session.create(
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {'name': 'Freelance Toolkit Pro'},
                    'unit_amount': 997,
                    'recurring': {'interval': 'month'},
                },
                'quantity': 1,
            }],
            mode='subscription',
            success_url=f'https://{domain}/premium-success',
            cancel_url=f'https://{domain}/premium-features',
        )
        return redirect(checkout_session.url or '/premium-features?error=true', code=303)
    except Exception as e:
        return f"Payment error: {str(e)}", 400

@app.route('/premium-success')
def premium_success():
    return render_template('premium-success.html')

# Add a simple health check route
@app.route('/health')
def health_check():
    logger.info("HEALTH CHECK REQUESTED")
    return {"status": "ok", "message": "Freelance Financial Toolkit is running"}, 200

# Add debug route to show all routes
@app.route('/debug/routes')
def debug_routes():
    logger.info("DEBUG ROUTES REQUESTED")
    import urllib.parse
    output = []
    for rule in app.url_map.iter_rules():
        methods = ','.join(sorted(rule.methods))
        line = urllib.parse.unquote("{:50s} {:20s} {}".format(rule.endpoint, methods, rule))
        output.append(line)
    
    return f"<h1>All Routes</h1><pre>{'<br>'.join(output)}</pre>"

# Add 404 handler with debugging
@app.errorhandler(404)
def not_found_error(error):
    logger.error(f"404 ERROR - Path not found: {request.path}")
    logger.error(f"Request method: {request.method}")
    logger.error(f"Request headers: {dict(request.headers)}")
    return f"""
    <h1>404 - Page Not Found</h1>
    <p>The requested URL <strong>{request.path}</strong> was not found on the server.</p>
    <p>Method: {request.method}</p>
    <p><a href="/">Go to Home Page</a></p>
    <p><a href="/debug/routes">See All Routes</a></p>
    <p><a href="/health">Health Check</a></p>
    """, 404

# Add 500 handler with debugging
@app.errorhandler(500)
def internal_error(error):
    logger.error(f"500 ERROR - Internal server error: {error}")
    logger.error(traceback.format_exc())
    return f"""
    <h1>500 - Internal Server Error</h1>
    <p>Something went wrong on the server.</p>
    <pre>{error}</pre>
    <p><a href="/">Go to Home Page</a></p>
    """, 500

# Create tables
try:
    with app.app_context():
        logger.info("Creating database tables...")
        db.create_all()
        logger.info("Database tables created successfully")
except Exception as e:
    logger.error(f"Failed to create database tables: {e}")
    logger.error(traceback.format_exc())

# Before request logging
@app.before_request
def log_request_info():
    logger.info(f"REQUEST: {request.method} {request.path}")
    logger.info(f"Remote IP: {request.remote_addr}")
    logger.info(f"User Agent: {request.headers.get('User-Agent', 'Unknown')}")

# After request logging  
@app.after_request
def log_response_info(response):
    logger.info(f"RESPONSE: {response.status_code} for {request.path}")
    return response

if __name__ == '__main__':
    logger.info("Starting Flask application...")
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"Running on port: {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
