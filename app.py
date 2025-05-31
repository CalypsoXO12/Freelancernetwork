import os
import stripe
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "your-secret-key-here")

# Database configuration
database_url = os.environ.get('DATABASE_URL')
if database_url:
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///freelancer.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Stripe configuration
stripe_key = os.environ.get('STRIPE_SECRET_KEY')
if stripe_key:
    stripe.api_key = stripe_key

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    is_premium = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class NewsletterSubscriber(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    source = db.Column(db.String(50), default='signup')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Create tables
with app.app_context():
    db.create_all()

# Routes
@app.route('/')
def index():
    return render_template('index.html')

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
                subscriber.source = 'premium_signup'
                db.session.add(subscriber)
                db.session.commit()
            flash('Thank you! You will be notified when premium features launch.', 'success')
        except Exception:
            flash('There was an error subscribing. Please try again.', 'danger')
    else:
        flash('Please enter a valid email address.', 'danger')
    return redirect(url_for('premium_features'))

@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    if not stripe_key:
        return "Stripe is not configured", 400
    
    try:
        domain = request.host
        
        checkout_session = stripe.checkout.Session.create(
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': 'Freelance Financial Toolkit Pro',
                        'description': 'Advanced calculators and features',
                    },
                    'unit_amount': 997,
                    'recurring': {'interval': 'month'},
                },
                'quantity': 1,
            }],
            mode='subscription',
            success_url=f'https://{domain}/premium-success?session_id={{CHECKOUT_SESSION_ID}}',
            cancel_url=f'https://{domain}/premium-features?canceled=true',
        )
        return redirect(checkout_session.url or '/premium-features?error=true', code=303)
    except Exception as e:
        return f"Error: {str(e)}", 400

@app.route('/premium-success')
def premium_success():
    return render_template('premium-success.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)