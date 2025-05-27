// src/components/Auth/ConfirmPassword.jsx

import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Shield, ArrowLeft } from 'lucide-react';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import '@css/auth/auth-shared.css';
import '@css/auth/confirm-password.css';
import logo from '@assets/logo.png';
import tree from '@assets/tree.png';

export default function ConfirmPassword() {
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
        <div className="auth-form-card">
            <div className="auth-form-header">
                <h2 className="auth-title">Confirm Your Password</h2>
                <p className="auth-subtitle">
                    <Shield className="auth-mobile-tree-icon" />
                    Please confirm your password to continue
                </p>
            </div>

            <div className="confirm-password-notice">
                <Shield size={20} />
                <div>
                    <p>
                        <strong>Security Check Required</strong>
                    </p>
                    <p>
                        This is a secure area of your family tree. Please confirm your password to continue protecting your family's information.
                    </p>
                </div>
            </div>

            <form className="auth-form" onSubmit={submit}>
                <div className="form-group">
                    <Label htmlFor="password" className="input-label">Current Password</Label>
                    <Input
                        id="password"
                        type="password"
                        required
                        autoFocus
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={data.password}
                        onChange={e => setData('password', e.target.value)}
                        className={errors.password ? 'error' : ''}
                    />
                    <InputError message={errors.password} />
                </div>

                <Button type="submit" className="auth-btn" disabled={processing}>
                    {processing && <LoaderCircle className="spinner" />}
                    {processing ? 'Confirming...' : (
                        <>
                            <Shield size={16} />
                            Confirm Password
                        </>
                    )}
                </Button>
            </form>

            <div className="login-prompt">
                <ArrowLeft className="auth-mobile-tree-icon" />
                <TextLink href={route('dashboard')}>Return to Family Tree</TextLink>
            </div>
        </div>
    );

    return (
        <>
            <Head title="Confirm Password • Qindred" />
            <AuthSplitLayout
                logo={logo}
                image={tree}
                taglineText="Your family's privacy and security are our top priority. Thank you for helping us keep your information safe."
            >
                {formCard}
            </AuthSplitLayout>
        </>
    );
}
