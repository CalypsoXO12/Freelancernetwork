import os
import stripe
from flask import render_template, request, flash, redirect, url_for, session, jsonify
from app import app, db
from models import User, SavedCalculation, NewsletterSubscriber

# Configure Stripe
if os.environ.get('STRIPE_SECRET_KEY'):
    stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        message = request.form.get('message')
        
        # Placeholder for contact form handling
        # In production, this would send an email or save to database
        flash('Thank you for your message! We will get back to you soon.', 'success')
        return redirect(url_for('contact'))
    
    return render_template('contact.html')

@app.route('/privacy')
def privacy():
    return render_template('privacy.html')

@app.route('/terms')
def terms():
    return render_template('terms.html')

@app.route('/hourly-rate-calculator')
def hourly_rate_calculator():
    return render_template('hourly-rate-calculator.html')

@app.route('/project-profit-calculator')
def project_profit_calculator():
    return render_template('project-profit-calculator.html')

@app.route('/premium-features')
def premium_features():
    return render_template('premium-features.html')

@app.route('/subscribe-newsletter', methods=['POST'])
def subscribe_newsletter():
    email = request.form.get('email')
    if email and db:
        try:
            # Check if already subscribed
            existing = NewsletterSubscriber.query.filter_by(email=email).first()
            if not existing:
                subscriber = NewsletterSubscriber()
                subscriber.email = email
                subscriber.source = 'premium_signup'
                db.session.add(subscriber)
                db.session.commit()
            
            flash('Thank you! You\'ll be notified when premium features launch.', 'success')
        except Exception as e:
            flash('There was an error subscribing to the newsletter. Please try again.', 'danger')
    else:
        flash('Please enter a valid email address.', 'danger')
    
    return redirect(url_for('premium_features'))

@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    try:
        # Get domain for redirect URLs - Render compatible
        domain = request.host
        
        checkout_session = stripe.checkout.Session.create(
            line_items=[
                {
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': 'Freelance Financial Toolkit Pro',
                            'description': 'Advanced calculators, saved calculations, PDF exports, and ad-free experience',
                        },
                        'unit_amount': 997,  # $9.97 per month
                        'recurring': {
                            'interval': 'month',
                        },
                    },
                    'quantity': 1,
                },
            ],
            mode='subscription',
            success_url=f'https://{domain}/premium-success?session_id={{CHECKOUT_SESSION_ID}}',
            cancel_url=f'https://{domain}/premium-features?canceled=true',
            automatic_tax={'enabled': True},
        )
    except Exception as e:
        return str(e)
    
    return redirect(checkout_session.url or '/premium-features?error=true', code=303)

@app.route('/premium-success')
def premium_success():
    session_id = request.args.get('session_id')
    if session_id:
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            # Here you would typically create a user account and subscription record
            flash('Welcome to Premium! Your subscription is now active.', 'success')
        except Exception as e:
            flash('There was an issue processing your subscription. Please contact support.', 'danger')
    
    return render_template('premium-success.html')