// src/components/Auth/Login.jsx

import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { FcGoogle } from 'react-icons/fc';
import { LoaderCircle, Sun, Moon } from 'lucide-react';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import '@css/auth-shared.css';
import '@css/login.css';
import logo from '@assets/logo.png';
import tree from '@assets/tree.png';

export default function Login({ status, canResetPassword }) {
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

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = e => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    const formCard = (
        <div className="auth-form-card">
            <div className="theme-toggle">
                <button onClick={toggleTheme} aria-label="Toggle theme">
                    {darkMode ? <Sun /> : <Moon />}
                </button>
            </div>
            
            <div className="auth-form-header">
                <h2 className="auth-title">Sign In to Qindred</h2>
                <p className="auth-subtitle">Access your account</p>
            </div>
            
            {status && <div className="login-status">{status}</div>}
            <form className="auth-form" onSubmit={submit}>
                <div className="form-group">
                    <Label htmlFor="email" className="input-label">Email address</Label>
                    <Input
                        id="email"
                        type="email"
                        required
                        autoFocus
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={data.email}
                        onChange={e => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} />
                </div>
                <div className="form-group">
                    <div className="form-group-header">
                        <Label htmlFor="password" className="input-label">Password</Label>
                        {canResetPassword && (
                            <TextLink href={route('password.request')} className="forgot-link">
                                Forgot password?
                            </TextLink>
                        )}
                    </div>
                    <Input
                        id="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={data.password}
                        onChange={e => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} />
                </div>
                <div className="remember-row">
                    <Checkbox
                        id="remember"
                        name="remember"
                        checked={data.remember}
                        onCheckedChange={checked => setData('remember', checked)}
                    />
                    <Label htmlFor="remember">Remember me</Label>
                </div>
                <Button type="submit" className="auth-btn login-btn" disabled={processing}>
                    {processing && <LoaderCircle className="spinner" />}
                    Log in
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    className="auth-google-btn"
                    onClick={() => (window.location.href = route('auth.google', {}, false))}
                >
                    <FcGoogle />
                    Continue with Google
                </Button>
            </form>
            <div className="login-prompt">
                Don't have an account? <TextLink href={route('register')}>Sign Up</TextLink>
            </div>
        </div>
    );

    return (
        <>
            <Head title="Log in to Qindred" />
            <AuthSplitLayout
                logo={logo}
                image={tree}
            >
                {formCard}
            </AuthSplitLayout>
        </>
    );
}
