// src/components/Auth/Login.jsx

import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { FcGoogle } from 'react-icons/fc';
import { LoaderCircle, TreePine } from 'lucide-react';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import '@css/auth/auth-shared.css';
import '@css/auth/login.css';
import logo from '@assets/logo.png';
import tree from '@assets/tree.png';

export default function Login({ status, canResetPassword }) {
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
            <div className="auth-form-header">
                <h2 className="auth-title">Welcome Back</h2>
                <p className="auth-subtitle">
                    <TreePine className="auth-mobile-tree-icon" />
                    Sign in to your account
                </p>
            </div>
            
            {status && (
                <div className="login-status">
                    <strong>✓</strong> {status}
                </div>
            )}

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
                        className={errors.email ? 'error' : ''}
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
                        className={errors.password ? 'error' : ''}
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
                    <Label htmlFor="remember">Keep me signed in</Label>
                </div>

                <Button type="submit" className="auth-btn login-btn" disabled={processing}>
                    {processing && <LoaderCircle className="spinner" />}
                    {processing ? 'Signing in...' : 'Sign In'}
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
                New to Qindred? <TextLink href={route('register')}>Create your family tree</TextLink>
            </div>
        </div>
    );

    return (
        <>
            <Head title="Sign In • Qindred Family Tree" />
            <AuthSplitLayout
                logo={logo}
                image={tree}
                taglineText="Join thousands of families preserving their legacy and connecting with loved ones."
            >
                {formCard}
            </AuthSplitLayout>
        </>
    );
}
