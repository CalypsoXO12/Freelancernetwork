from flask import render_template, request, flash, redirect, url_for
from app import app

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
