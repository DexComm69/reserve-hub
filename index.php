<?php
// index.php
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ReserveHub | Savor the Moment</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-color: #fdfbf7; /* warm cream */
            --text-color: #2b2b2b; /* deep slate */
            --accent-color: #d35400; /* warm terracotta */
            --accent-hover: #e67e22; 
            --card-bg: #ffffff;
            --shadow-color: rgba(43, 43, 43, 0.08);
            --font-family: 'Inter', sans-serif;
            --gap-md: 2rem;
            --gap-lg: 4rem;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: var(--font-family);
            background-color: var(--bg-color);
            color: var(--text-color);
            line-height: 1.6;
        }

        a {
            text-decoration: none;
            color: inherit;
        }

        ul {
            list-style: none;
        }

        /* Nav */
        .navbar {
            position: sticky;
            top: 0;
            background: rgba(253, 251, 247, 0.95);
            backdrop-filter: blur(10px);
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem 5%;
            z-index: 1000;
            border-bottom: 1px solid rgba(0,0,0,0.05);
        }

        .nav-brand {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--accent-color);
        }

        .nav-links {
            display: flex;
            gap: 2rem;
            align-items: center;
        }

        .nav-link {
            font-weight: 500;
            transition: color 0.2s;
        }

        .nav-link:hover {
            color: var(--accent-color);
        }

        .btn-cta {
            background-color: var(--accent-color);
            color: #fff;
            padding: 0.75rem 1.5rem;
            border-radius: 50px;
            font-weight: 600;
            transition: background-color 0.3s, transform 0.2s, box-shadow 0.3s;
        }

        .btn-cta:hover, .btn-cta:focus-visible {
            background-color: var(--accent-hover);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(211, 84, 0, 0.3);
            outline: 2px solid var(--accent-hover);
            outline-offset: 2px;
        }

        /* Animations */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes pulseGlow {
            0% {
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(211, 84, 0, 0.4);
            }
            50% {
                transform: scale(1.05);
                box-shadow: 0 0 15px 5px rgba(211, 84, 0, 0);
            }
            100% {
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(211, 84, 0, 0);
            }
        }

        /* Hero */
        .hero {
            padding: 8rem 5% 6rem;
            text-align: center;
            max-width: 1000px;
            margin: 0 auto;
        }

        .hero h1 {
            font-size: 3.5rem;
            line-height: 1.2;
            margin-bottom: 1.5rem;
            opacity: 0;
            animation: fadeInUp 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
            animation-delay: 0.1s;
        }

        .hero p {
            font-size: 1.2rem;
            color: #555;
            margin-bottom: 3rem;
            opacity: 0;
            animation: fadeInUp 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
            animation-delay: 0.2s;
        }

        .search-bar {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            background: var(--card-bg);
            padding: 1rem;
            border-radius: 50px;
            box-shadow: 0 8px 24px var(--shadow-color);
            opacity: 0;
            animation: fadeInUp 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
            animation-delay: 0.3s;
            justify-content: center;
            align-items: center;
        }

        .search-input {
            flex: 1;
            min-width: 200px;
            padding: 0.8rem 1.5rem;
            border: 1px solid #ddd;
            border-radius: 30px;
            font-size: 1rem;
            outline: none;
            font-family: inherit;
        }
        .search-input:focus {
            border-color: var(--accent-color);
        }

        .search-btn {
            background-color: var(--accent-color);
            color: #fff;
            border: none;
            padding: 0.8rem 2rem;
            border-radius: 30px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.3s, transform 0.2s;
        }

        .search-btn:hover, .search-btn:focus-visible {
            background-color: var(--accent-hover);
            transform: scale(1.02);
            outline: 2px solid var(--accent-hover);
            outline-offset: 2px;
        }

        /* Sections common */
        .section {
            padding: var(--gap-lg) 5%;
            max-width: 1200px;
            margin: 0 auto;
        }

        .section-title {
            text-align: center;
            font-size: 2.5rem;
            margin-bottom: 3rem;
        }

        /* Featured Grid */
        .grid-3 {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: var(--gap-md);
        }

        .card {
            background: var(--card-bg);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 12px var(--shadow-color);
            transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.3s ease;
            display: block;
        }

        .card:hover, .card:focus-visible {
            transform: scale(1.02) translateY(-5px);
            box-shadow: 0 12px 30px rgba(43,43,43,0.15);
            outline: none;
        }

        .card-img {
            width: 100%;
            height: 200px;
            background-color: #eee;
            object-fit: cover;
        }

        .card-content {
            padding: 1.5rem;
        }

        .ambiance-tag {
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: var(--accent-color);
            font-weight: 700;
            display: block;
            margin-bottom: 0.5rem;
        }

        .card-title {
            font-size: 1.25rem;
            margin-bottom: 1rem;
        }

        .card-meta {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #666;
            font-size: 0.9rem;
        }

        /* How it works */
        .steps {
            display: flex;
            justify-content: space-around;
            text-align: center;
            flex-wrap: wrap;
            gap: 2rem;
        }

        .step {
            flex: 1;
            min-width: 200px;
        }

        .step-icon {
            width: 80px;
            height: 80px;
            background-color: #fff;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 2rem;
            color: var(--accent-color);
            margin: 0 auto 1.5rem;
            box-shadow: 0 4px 12px var(--shadow-color);
            animation: pulseGlow 3s infinite;
        }

        .step h3 {
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
        }

        /* CTA */
        .cta-banner {
            background-color: var(--accent-color);
            color: #fff;
            text-align: center;
            padding: 5rem 5%;
            margin-top: 4rem;
        }
        
        .cta-banner h2 {
            font-size: 2.5rem;
            margin-bottom: 1.5rem;
        }
        
        .cta-banner p {
            font-size: 1.2rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }
        
        .btn-cta-alt {
            background-color: #fff;
            color: var(--accent-color);
            padding: 1rem 2rem;
            border-radius: 50px;
            font-size: 1.1rem;
            font-weight: 700;
            display: inline-block;
            transition: transform 0.2s, box-shadow 0.3s;
        }
        
        .btn-cta-alt:hover, .btn-cta-alt:focus-visible {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
            outline: 2px solid #fff;
            outline-offset: 2px;
        }

        /* Footer */
        .footer {
            background-color: #1a1a1a;
            color: #ccc;
            padding: 4rem 5% 2rem;
        }

        .footer-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 2rem;
            max-width: 1200px;
            margin: 0 auto;
            border-bottom: 1px solid #333;
            padding-bottom: 2rem;
            margin-bottom: 2rem;
        }
        
        .footer-brand {
            color: #fff;
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
        }

        .footer-links li {
            margin-bottom: 0.5rem;
        }

        .footer-links a:hover {
            color: #fff;
        }

        .footer-bottom {
            text-align: center;
            font-size: 0.9rem;
        }

        @media (max-width: 768px) {
            .nav-links {
                display: none;
            }
            .hero h1 {
                font-size: 2.5rem;
            }
            .search-bar {
                flex-direction: column;
                border-radius: 16px;
                padding: 1.5rem;
            }
            .search-input, .search-btn {
                width: 100%;
                border-radius: 8px;
            }
        }
    </style>
</head>
<body>

    <!-- Nav -->
    <nav class="navbar">
        <div class="nav-brand">ReserveHub</div>
        <ul class="nav-links">
            <li><a href="#explore" class="nav-link">Explore Restaurants</a></li>
            <li><a href="#menus" class="nav-link">Special Menus</a></li>
            <li><a href="#how-it-works" class="nav-link">How It Works</a></li>
        </ul>
        <a href="html/login-signup.html" class="btn-cta">Book a Table</a>
    </nav>

    <!-- Hero -->
    <section class="hero">
        <h1>Savor the Moment.<br>Reserve Your Table in Seconds.</h1>
        <p>Discover hand-picked dining spaces tailored for every occasion.</p>
        
        <form class="search-bar" action="html/search.html">
            <input type="text" class="search-input" name="q" placeholder="Cuisine or Restaurant Name" required>
            <input type="date" class="search-input" name="date" required>
            <input type="time" class="search-input" name="time" required>
            <div style="position: relative; flex:1; min-width: 150px;">
                <input type="number" class="search-input" name="guests" placeholder="Guests" min="1" required style="width: 100%; padding-right: 40px;">
                <i class="fas fa-users" style="position:absolute; right:15px; top:50%; transform:translateY(-50%); color:#aaa;"></i>
            </div>
            <button type="submit" class="search-btn">Search</button>
        </form>
    </section>

    <!-- Featured -->
    <section class="section" id="explore">
        <h2 class="section-title">Featured Dining Spaces</h2>
        <div class="grid-3">
            <a href="#" class="card">
                <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80" alt="Cozy Booth" class="card-img">
                <div class="card-content">
                    <span class="ambiance-tag">Cozy Indoor</span>
                    <h3 class="card-title">The Velvet Booth</h3>
                    <div class="card-meta">
                        <i class="fas fa-chair"></i> 2-4 Seats Available
                    </div>
                </div>
            </a>
            <a href="#" class="card">
                <img src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=600&q=80" alt="Outdoor Terrace" class="card-img">
                <div class="card-content">
                    <span class="ambiance-tag">Vibrant Terrace</span>
                    <h3 class="card-title">Skyline Sunset Deck</h3>
                    <div class="card-meta">
                        <i class="fas fa-chair"></i> Up to 8 Seats
                    </div>
                </div>
            </a>
            <a href="#" class="card">
                <img src="https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&w=600&q=80" alt="Private Room" class="card-img">
                <div class="card-content">
                    <span class="ambiance-tag">Private Family</span>
                    <h3 class="card-title">The Heritage Room</h3>
                    <div class="card-meta">
                        <i class="fas fa-chair"></i> 10-15 Seats
                    </div>
                </div>
            </a>
        </div>
    </section>

    <!-- How it works -->
    <section class="section" id="how-it-works">
        <h2 class="section-title">The Experience</h2>
        <div class="steps">
            <div class="step">
                <div class="step-icon"><i class="fas fa-utensils"></i></div>
                <h3>1. Discover</h3>
                <p>Browse curated spaces that match your vibe.</p>
            </div>
            <div class="step">
                <div class="step-icon"><i class="fas fa-clock"></i></div>
                <h3>2. Schedule</h3>
                <p>Pick your date, time, and party size in seconds.</p>
            </div>
            <div class="step">
                <div class="step-icon"><i class="fas fa-glass-cheers"></i></div>
                <h3>3. Dine</h3>
                <p>Arrive and enjoy a seamless dining experience.</p>
            </div>
        </div>
    </section>

    <!-- CTA -->
    <section class="cta-banner">
        <h2>Instant Booking Confirmations</h2>
        <p>Create an account to save your favorite spots and manage reservations.</p>
        <a href="html/login-signup.html" class="btn-cta-alt">Join ReserveHub</a>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="footer-grid">
            <div>
                <div class="footer-brand">ReserveHub</div>
                <p>Savor the moment, leave the booking to us.</p>
            </div>
            <div>
                <h3>Explore</h3>
                <ul class="footer-links">
                    <li><a href="#">Top Rated</a></li>
                    <li><a href="#">New Additions</a></li>
                    <li><a href="#">Special Events</a></li>
                </ul>
            </div>
            <div>
                <h3>Company</h3>
                <ul class="footer-links">
                    <li><a href="#">About Us</a></li>
                    <li><a href="#">Partner With Us</a></li>
                    <li><a href="#">Careers</a></li>
                </ul>
            </div>
            <div>
                <h3>Legal</h3>
                <ul class="footer-links">
                    <li><a href="#">Privacy Policy</a></li>
                    <li><a href="#">Terms of Service</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            &copy; <?php echo date("Y"); ?> ReserveHub. All rights reserved.
        </div>
    </footer>

</body>
</html>
