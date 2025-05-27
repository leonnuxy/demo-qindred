import { Head, Link, usePage } from '@inertiajs/react';
import { TreePine, Users, Heart, Shield } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import '@css/pages/welcome.css';

export default function Welcome() {
    const { auth } = usePage().props;
    
    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net"/>
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet"/>
            </Head>
            
            <div className="welcome-container">
                <header className="welcome-header">
                    <nav className="welcome-nav">
                        <Link href={route('home')} className="welcome-nav__logo">
                            <AppLogoIcon variant="auth" className="welcome-nav__logo-icon" />
                            <span className="welcome-nav__logo-text">Qindred</span>
                        </Link>
                    </nav>
                </header>

                <main className="welcome-main">
                    {/* Hero Section */}
                    <section className="welcome-hero">
                        <div className="welcome-hero__logo">
                            <AppLogoIcon variant="auth" className="welcome-hero__logo-icon" />
                        </div>
                        
                        <h1 className="welcome-hero__title">
                            Welcome to Qindred
                        </h1>
                        
                        <p className="welcome-hero__subtitle">
                            Discover your roots, build your tree, and connect with your family heritage. 
                            Create a beautiful, interactive family tree that brings generations together.
                        </p>
                        
                        <div className="welcome-hero__cta">
                            {auth.user ? (
                                <Link 
                                    href={route('dashboard')} 
                                    className="welcome-hero__cta-button welcome-hero__cta-button--primary"
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link 
                                        href={route('register')} 
                                        className="welcome-hero__cta-button welcome-hero__cta-button--primary"
                                    >
                                        Start Your Tree
                                    </Link>
                                    <Link 
                                        href={route('login')} 
                                        className="welcome-hero__cta-button welcome-hero__cta-button--secondary"
                                    >
                                        Sign In
                                    </Link>
                                </>
                            )}
                        </div>
                    </section>

                    {/* Features Section */}
                    <section className="welcome-features">
                        <h2 className="welcome-features__title">
                            Build Your Family Legacy
                        </h2>
                        <p className="welcome-features__subtitle">
                            Everything you need to create, explore, and share your family history
                        </p>
                        
                        <div className="welcome-features__grid">
                            <div className="welcome-features__card">
                                <div className="welcome-features__card-icon">
                                    <TreePine />
                                </div>
                                <h3 className="welcome-features__card-title">
                                    Interactive Family Trees
                                </h3>
                                <p className="welcome-features__card-description">
                                    Create beautiful, interactive family trees that showcase your lineage. 
                                    Add photos, stories, and connect relationships with ease.
                                </p>
                            </div>
                            
                            <div className="welcome-features__card">
                                <div className="welcome-features__card-icon">
                                    <Users />
                                </div>
                                <h3 className="welcome-features__card-title">
                                    Collaborate Together
                                </h3>
                                <p className="welcome-features__card-description">
                                    Invite family members to contribute and build your tree together. 
                                    Share memories, photos, and stories across generations.
                                </p>
                            </div>
                            
                            <div className="welcome-features__card">
                                <div className="welcome-features__card-icon">
                                    <Heart />
                                </div>
                                <h3 className="welcome-features__card-title">
                                    Preserve Memories
                                </h3>
                                <p className="welcome-features__card-description">
                                    Keep family memories alive with photos, documents, and stories. 
                                    Create a lasting legacy for future generations to discover.
                                </p>
                            </div>
                            
                            <div className="welcome-features__card">
                                <div className="welcome-features__card-icon">
                                    <Shield />
                                </div>
                                <h3 className="welcome-features__card-title">
                                    Private & Secure
                                </h3>
                                <p className="welcome-features__card-description">
                                    Your family data is protected with enterprise-grade security. 
                                    Control who sees what with granular privacy settings.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Social Proof Section */}
                    <section className="welcome-social-proof">
                        <h2 className="welcome-social-proof__title">
                            Join Families Worldwide
                        </h2>
                        
                        <div className="welcome-social-proof__stats">
                            <div className="welcome-social-proof__stat">
                                <span className="welcome-social-proof__stat-number">10,000+</span>
                                <span className="welcome-social-proof__stat-label">Family Trees</span>
                            </div>
                            <div className="welcome-social-proof__stat">
                                <span className="welcome-social-proof__stat-number">50,000+</span>
                                <span className="welcome-social-proof__stat-label">Members Added</span>
                            </div>
                            <div className="welcome-social-proof__stat">
                                <span className="welcome-social-proof__stat-number">100,000+</span>
                                <span className="welcome-social-proof__stat-label">Photos Shared</span>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
