// src/components/Auth/Register.jsx

import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { FcGoogle } from 'react-icons/fc';
import { LoaderCircle, Users, TreePine, Heart } from 'lucide-react';
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
    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
        terms: false,
    });

    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordCriteria, setPasswordCriteria] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
    });

    const checkPasswordStrength = (password) => {
        const criteria = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        };
        
        setPasswordCriteria(criteria);
        
        const strength = Object.values(criteria).filter(Boolean).length;
        setPasswordStrength(strength);
    };

    const handlePasswordChange = (e) => {
        const password = e.target.value;
        setData('password', password);
        checkPasswordStrength(password);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const getStrengthLabel = () => {
        switch (passwordStrength) {
            case 0:
            case 1:
                return 'Very Weak';
            case 2:
                return 'Weak';
            case 3:
                return 'Good';
            case 4:
            case 5:
                return 'Strong';
            default:
                return '';
        }
    };

    const formCard = (
        <div className="auth-form-card">
            <div className="auth-form-header">
                <h2 className="auth-title">Start Your Family Tree</h2>
                <p className="auth-subtitle">
                    <Users className="auth-mobile-tree-icon" />
                    Create your account and begin connecting generations
                </p>
            </div>

            <form className="auth-form" onSubmit={submit}>
                <div className="register-name-row">
                    <div className="form-group">
                        <Label htmlFor="first_name" className="input-label">First name</Label>
                        <Input
                            id="first_name"
                            type="text"
                            required
                            autoFocus
                            autoComplete="given-name"
                            placeholder="John"
                            value={data.first_name}
                            onChange={e => setData('first_name', e.target.value)}
                            className={errors.first_name ? 'error' : ''}
                        />
                        <InputError message={errors.first_name} />
                    </div>

                    <div className="form-group">
                        <Label htmlFor="last_name" className="input-label">Last name</Label>
                        <Input
                            id="last_name"
                            type="text"
                            required
                            autoComplete="family-name"
                            placeholder="Doe"
                            value={data.last_name}
                            onChange={e => setData('last_name', e.target.value)}
                            className={errors.last_name ? 'error' : ''}
                        />
                        <InputError message={errors.last_name} />
                    </div>
                </div>

                <div className="form-group">
                    <Label htmlFor="email" className="input-label">Email address</Label>
                    <Input
                        id="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={data.email}
                        onChange={e => setData('email', e.target.value)}
                        className={errors.email ? 'error' : ''}
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
                        placeholder="Create a strong password"
                        value={data.password}
                        onChange={handlePasswordChange}
                        className={errors.password ? 'error' : ''}
                    />
                    <InputError message={errors.password} />
                    
                    {data.password && (
                        <>
                            <div className="password-strength">
                                {[1, 2, 3, 4].map(i => (
                                    <div
                                        key={i}
                                        className={`strength-bar ${i <= passwordStrength ? 'active' : ''}`}
                                    />
                                ))}
                            </div>
                            <div className="password-strength-label">
                                <span className={passwordStrength > 0 ? 'active' : ''}>
                                    Password strength: {getStrengthLabel()}
                                </span>
                            </div>
                            <ul className="password-criteria">
                                <li className={passwordCriteria.length ? 'met' : ''}>
                                    At least 8 characters
                                </li>
                                <li className={passwordCriteria.uppercase ? 'met' : ''}>
                                    One uppercase letter
                                </li>
                                <li className={passwordCriteria.lowercase ? 'met' : ''}>
                                    One lowercase letter
                                </li>
                                <li className={passwordCriteria.number ? 'met' : ''}>
                                    One number
                                </li>
                                <li className={passwordCriteria.special ? 'met' : ''}>
                                    One special character
                                </li>
                            </ul>
                        </>
                    )}
                </div>

                <div className="form-group">
                    <Label htmlFor="password_confirmation" className="input-label">Confirm password</Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        required
                        autoComplete="new-password"
                        placeholder="Confirm your password"
                        value={data.password_confirmation}
                        onChange={e => setData('password_confirmation', e.target.value)}
                        className={errors.password_confirmation ? 'error' : ''}
                    />
                    <InputError message={errors.password_confirmation} />
                </div>

                <div className="register-terms">
                    <Checkbox
                        id="terms"
                        required
                        checked={data.terms}
                        onCheckedChange={checked => setData('terms', checked)}
                        className={errors.terms ? 'error' : ''}
                    />
                    <Label htmlFor="terms" className="terms-label">
                        I agree to the{' '}
                        <TextLink href="#" target="_blank">Terms of Service</TextLink>
                        {' '}and{' '}
                        <TextLink href="#" target="_blank">Privacy Policy</TextLink>.
                    </Label>
                    <InputError message={errors.terms} />
                </div>

                <Button type="submit" className="auth-btn register-btn" disabled={processing || !data.terms}>
                    {processing && <LoaderCircle className="spinner" />}
                    {processing ? 'Creating your account...' : (
                        <>
                            <TreePine size={16} />
                            Create My Family Tree
                        </>
                    )}
                </Button>

                <div className="divider">
                    <span>or continue with</span>
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
                <Heart className="auth-mobile-tree-icon" />
                Already have an account? <TextLink href={route('login')}>Sign in here</TextLink>
            </div>
        </div>
    );

    return (
        <>
            <Head title="Create Your Family Tree • Qindred" />
            <AuthSplitLayout
                logo={logo}
                image={tree}
                taglineText="Start building your family legacy today. Connect with relatives, preserve memories, and discover your roots."
            >
                {formCard}
            </AuthSplitLayout>
        </>
    );
}
