// Components
import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Sun, Moon } from 'lucide-react';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import '@css/auth/auth-shared.css';
import '@css/auth/verify-email.css'; // Add a specific CSS file for verify-email
import logo from '@assets/logo.png';
import tree from '@assets/tree.png';

export default function VerifyEmail({ status }) {
    const [darkMode, setDarkMode] = useState(
        () => localStorage.getItem('theme') === 'dark'
    );

    useEffect(() => {
        const root = document.documentElement;
        if (darkMode) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    const toggleTheme = () => setDarkMode(prev => !prev);

    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    const formCard = (
        <div className="auth-form-card verify-email-card">
            <div className="theme-toggle">
                <button onClick={toggleTheme} aria-label="Toggle theme">
                    {darkMode ? <Sun /> : <Moon />}
                </button>
            </div>
            
            <div className="auth-form-header verify-email-header">
                <h2 className="auth-title">Verify Your Email</h2>
                <p className="auth-subtitle">Please verify your email address by clicking on the link we just emailed to you.</p>
            </div>
            
            {status === 'verification-link-sent' && (
                <div className="verification-sent-message">
                    A new verification link has been sent to the email address you provided during registration.
                </div>
            )}
            
            <form className="auth-form verify-email-form" onSubmit={submit}>
                <Button 
                    type="submit" 
                    className="auth-btn verify-email-btn" 
                    disabled={processing}
                >
                    {processing && <LoaderCircle className="spinner" />}
                    Resend Verification Email
                </Button>
                
                <div className="verify-email-divider">
                    <span>or</span>
                </div>
                
                <TextLink 
                    href={route('logout')} 
                    method="post" 
                    className="logout-link"
                >
                    Log Out
                </TextLink>
            </form>
        </div>
    );

    return (
        <>
            <Head title="Verify Email - Qindred" />
            <AuthSplitLayout
                logo={logo}
                image={tree}
            >
                {formCard}
            </AuthSplitLayout>
        </>
    );
}
