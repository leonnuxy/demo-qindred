import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Sun, Moon } from 'lucide-react';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import '@css/auth-shared.css';
import '@css/confirm-password.css';
import logo from '@assets/logo.png';
import tree from '@assets/tree.png';
export default function ConfirmPassword() {
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
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    const formCard = (
        <div className="auth-form-card confirm-password-card">
            <div className="theme-toggle">
                <button onClick={toggleTheme} aria-label="Toggle theme">
                    {darkMode ? <Sun /> : <Moon />}
                </button>
            </div>
            
            <div className="auth-form-header confirm-password-header">
                <h2 className="auth-title">Confirm Password</h2>
                <p className="auth-subtitle confirm-password-info">
                    This is a secure area of the application. Please confirm your password before continuing.
                </p>
            </div>
            
            <form className="auth-form confirm-password-form" onSubmit={submit}>
                <div className="form-group">
                    <Label htmlFor="password" className="input-label">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={data.password}
                        autoFocus
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} />
                </div>
                
                <Button type="submit" className="auth-btn confirm-password-btn" disabled={processing}>
                    {processing && <LoaderCircle className="spinner" />}
                    Confirm Password
                </Button>
                
                <TextLink 
                    href={route('dashboard')} 
                    className="cancel-link"
                >
                    Cancel
                </TextLink>
            </form>
        </div>
    );

    return (
        <>
            <Head title="Confirm Password - Qindred" />
            <AuthSplitLayout
                logo={logo}
                image={tree}
            >
                {formCard}
            </AuthSplitLayout>
        </>
    );
}
