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
import '@css/auth/auth-shared.css';
import '@css/auth/register.css';
import logo from '@assets/logo.png';
import tree from '@assets/tree.png';

export default function Register() {
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
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
        terms: false
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const formCard = (
        <div className="auth-form-card">
            <div className="theme-toggle">
                <button onClick={toggleTheme} aria-label="Toggle theme">
                    {darkMode ? <Sun /> : <Moon />}
                </button>
            </div>
            
            <div className="auth-form-header">
                <h2 className="auth-title">Sign Up for Qindred</h2>
                <p className="auth-subtitle">Create your account and start connecting.</p>
            </div>
            
            <form className="auth-form" onSubmit={submit}>
                <div className="form-row register-name-row">
                    <div className="form-group">
                        <Label htmlFor="first_name" className="input-label">First Name</Label>
                        <Input
                            id="first_name"
                            type="text"
                            required
                            autoFocus
                            placeholder="First Name"
                            value={data.first_name}
                            onChange={(e) => setData('first_name', e.target.value)}
                        />
                        <InputError message={errors.first_name} />
                    </div>
                    
                    <div className="form-group">
                        <Label htmlFor="last_name" className="input-label">Last Name</Label>
                        <Input
                            id="last_name"
                            type="text"
                            required
                            placeholder="Last Name"
                            value={data.last_name}
                            onChange={(e) => setData('last_name', e.target.value)}
                        />
                        <InputError message={errors.last_name} />
                    </div>
                </div>
                
                <div className="form-group">
                    <Label htmlFor="email" className="input-label">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="Email Address"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} />
                </div>
                
                <div className="form-group">
                    <Label htmlFor="password" className="input-label">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        required
                        autoComplete="new-password"
                        placeholder="Password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} />
                    
                </div>
                
                <div className="form-group">
                    <Label htmlFor="password_confirmation" className="input-label">Confirm Password</Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        required
                        autoComplete="new-password"
                        placeholder="Confirm Password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                    />
                    <InputError message={errors.password_confirmation} />

                    {/* Password Strength Bar */}
                    <div className="password-strength">
                        <div className={`strength-bar ${data.password.length > 0 ? 'active' : ''}`}></div>
                        <div className={`strength-bar ${data.password.length >= 6 ? 'active' : ''}`}></div>
                        <div className={`strength-bar ${data.password.length >= 8 ? 'active' : ''}`}></div>
                        <div className={`strength-bar ${data.password.length >= 10 ? 'active' : ''}`}></div>
                        
                        <div className="password-strength-label">
                            <span className={data.password.length === 0 ? '' : 'active'}>
                                {data.password.length === 0 ? 'Password strength' : 
                                data.password.length < 6 ? 'Very weak' :
                                data.password.length < 8 ? 'Weak' :
                                data.password.length < 10 ? 'Good' : 'Strong'}
                            </span>
                        </div>
                    </div>
                    
                    {/* Password Criteria List */}
                    {data.password.length > 0 && (
                        <ul className="password-criteria">
                            <li className={data.password.length >= 8 ? 'met' : ''}>
                                At least 8 characters
                            </li>
                            <li className={/[A-Z]/.test(data.password) ? 'met' : ''}>
                                At least one uppercase letter
                            </li>
                            <li className={/[a-z]/.test(data.password) ? 'met' : ''}>
                                At least one lowercase letter
                            </li>
                            <li className={/[0-9]/.test(data.password) ? 'met' : ''}>
                                At least one number
                            </li>
                        </ul>
                    )}
                </div>
                
                <div className="terms-checkbox register-terms">
                    <Checkbox
                        id="terms"
                        checked={data.terms}
                        onCheckedChange={(checked) => setData('terms', checked)}
                    />
                    <Label htmlFor="terms" className="terms-label">
                        I understand and agree to the <TextLink href="/terms">terms of service</TextLink>
                    </Label>
                    <InputError message={errors.terms} />
                </div>
                
                <Button type="submit" className="auth-btn" disabled={processing}>
                    {processing && <LoaderCircle className="spinner" />}
                    Create Account
                </Button>
                
                <div className="divider">
                    <span>or</span>
                </div>
                
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
                Already have an account? <TextLink href={route('login')}>Log In</TextLink>
            </div>
        </div>
    );

    return (
        <>
            <Head title="Create an account - Qindred" />
            <AuthSplitLayout
                logo={logo}
                image={tree}
            >
                {formCard}
            </AuthSplitLayout>
        </>
    );
}
