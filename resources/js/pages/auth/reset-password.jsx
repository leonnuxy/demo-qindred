import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Sun, Moon } from 'lucide-react';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import '@css/auth/auth-shared.css';
import '@css/auth/reset-password.css';
import logo from '@assets/logo.png';
import tree from '@assets/tree.png';
export default function ResetPassword({ token, email }) {
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
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const formCard = (
        <div className="auth-form-card reset-password-card">
            <div className="theme-toggle">
                <button onClick={toggleTheme} aria-label="Toggle theme">
                    {darkMode ? <Sun /> : <Moon />}
                </button>
            </div>
            
            <div className="auth-form-header reset-password-header">
                <h2 className="auth-title">Reset Password</h2>
                <p className="auth-subtitle">Please enter your new password below</p>
            </div>
            
            <form className="auth-form reset-password-form" onSubmit={submit}>
                <div className="form-group">
                    <Label htmlFor="email" className="input-label">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        value={data.email}
                        readOnly
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} />
                </div>

                <div className="form-group reset-password-section">
                    <Label htmlFor="password" className="input-label">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        autoComplete="new-password"
                        value={data.password}
                        autoFocus
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="Password"
                    />
                    <InputError message={errors.password} />
                    
                    {/* Password Strength Bar */}
                    <div className="reset-password-strength">
                        <div className={`reset-strength-bar ${data.password.length > 0 ? 'active' : ''}`}></div>
                        <div className={`reset-strength-bar ${data.password.length >= 6 ? 'active' : ''}`}></div>
                        <div className={`reset-strength-bar ${data.password.length >= 8 ? 'active' : ''}`}></div>
                        <div className={`reset-strength-bar ${data.password.length >= 10 ? 'active' : ''}`}></div>
                    </div>
                </div>

                <div className="form-group">
                    <Label htmlFor="password_confirmation" className="input-label">Confirm Password</Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        autoComplete="new-password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        placeholder="Confirm Password"
                    />
                    <InputError message={errors.password_confirmation} />
                </div>
                
                <Button type="submit" className="auth-btn reset-password-btn" disabled={processing}>
                    {processing && <LoaderCircle className="spinner" />}
                    Reset Password
                </Button>
            </form>
        </div>
    );

    return (
        <>
            <Head title="Reset Password - Qindred" />
            <AuthSplitLayout
                logo={logo}
                image={tree}
            >
                {formCard}
            </AuthSplitLayout>
        </>
    );
}
