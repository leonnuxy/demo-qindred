// src/components/Auth/ForgotPassword.jsx

import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Mail, ArrowLeft } from 'lucide-react';
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
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    const formCard = (
        <div className="auth-form-card">
            <div className="auth-form-header">
                <h2 className="auth-title">Reset Your Password</h2>
                <p className="auth-subtitle">
                    <Mail className="auth-mobile-tree-icon" />
                    Enter your email and we'll send you a reset link
                </p>
            </div>

            {status && (
                <div className="verification-sent-message">
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

                <Button type="submit" className="auth-btn" disabled={processing}>
                    {processing && <LoaderCircle className="spinner" />}
                    {processing ? 'Sending reset link...' : (
                        <>
                            <Mail size={16} />
                            Send Password Reset
                        </>
                    )}
                </Button>
            </form>

            <div className="login-prompt">
                <ArrowLeft className="auth-mobile-tree-icon" />
                Remember your password? <TextLink href={route('login')}>Sign in instead</TextLink>
            </div>
        </div>
    );

    return (
        <>
            <Head title="Reset Password • Qindred" />
            <AuthSplitLayout
                logo={logo}
                image={tree}
                taglineText="Need help accessing your family tree? We're here to help you get back to preserving your family memories."
            >
                {formCard}
            </AuthSplitLayout>
        </>
    );
}
