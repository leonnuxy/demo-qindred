import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Sun, Moon } from 'lucide-react';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import '@css/auth/auth-shared.css';
import '@css/auth/forgot-password.css';
import logo from '@assets/logo.png';
import tree from '@assets/tree.png';
export default function ForgotPassword({ status }) {
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

    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    const formCard = (
        <div className="auth-form-card forgot-password-card">
            <div className="theme-toggle">
                <button onClick={toggleTheme} aria-label="Toggle theme">
                    {darkMode ? <Sun /> : <Moon />}
                </button>
            </div>
            
            <div className="auth-form-header forgot-password-header">
                <h2 className="auth-title">Forgot Password</h2>
                <p className="auth-subtitle">Enter your email to receive a password reset link</p>
            </div>
            
            {status && <div className="forgot-password-status">{status}</div>}
            
            <form className="auth-form forgot-password-form" onSubmit={submit}>
                <div className="form-group">
                    <Label htmlFor="email" className="input-label">Email address</Label>
                    <Input
                        id="email"
                        type="email"
                        required
                        autoFocus
                        autoComplete="email"
                        placeholder="email@example.com"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} />
                </div>
                
                <Button type="submit" className="auth-btn forgot-password-btn" disabled={processing}>
                    {processing && <LoaderCircle className="spinner" />}
                    Send Password Reset Link
                </Button>
            </form>
            
            <TextLink href={route('login')} className="back-to-login">
                Back to Login
            </TextLink>
        </div>
    );

    return (
        <>
            <Head title="Forgot Password - Qindred" />
            <AuthSplitLayout
                logo={logo}
                image={tree}
            >
                {formCard}
            </AuthSplitLayout>
        </>
    );
}
