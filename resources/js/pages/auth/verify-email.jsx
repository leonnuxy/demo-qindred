// src/components/Auth/VerifyEmail.jsx

import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle, Mail, CheckCircle, RefreshCw } from 'lucide-react';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import { Button } from '@/components/ui/button';
import '@css/auth/auth-shared.css';
import '@css/auth/verify-email.css';
import logo from '@assets/logo.png';
import tree from '@assets/tree.png';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    const formCard = (
        <div className="auth-form-card">
            <div className="auth-form-header">
                <h2 className="auth-title">Verify Your Email</h2>
                <p className="auth-subtitle">
                    <Mail className="auth-mobile-tree-icon" />
                    Check your inbox to activate your family tree account
                </p>
            </div>

            {status === 'verification-link-sent' && (
                <div className="verification-sent-message">
                    <CheckCircle size={16} />
                    <strong>Verification link sent!</strong> Check your email inbox and click the link to verify your account.
                </div>
            )}

            <div className="verification-content">
                <div className="verification-steps">
                    <h3>What's next?</h3>
                    <ol>
                        <li>
                            <Mail size={14} />
                            Check your email inbox (and spam folder)
                        </li>
                        <li>
                            <CheckCircle size={14} />
                            Click the verification link in the email
                        </li>
                        <li>
                            <span className="tree-emoji">🌳</span>
                            Start building your family tree!
                        </li>
                    </ol>
                </div>

                <form onSubmit={submit}>
                    <Button type="submit" className="auth-btn" disabled={processing}>
                        {processing && <LoaderCircle className="spinner" />}
                        {processing ? 'Sending...' : (
                            <>
                                <RefreshCw size={16} />
                                Resend Verification Email
                            </>
                        )}
                    </Button>
                </form>

                <div className="verification-help">
                    <p>
                        <strong>Didn't receive the email?</strong>
                    </p>
                    <ul>
                        <li>Check your spam or junk mail folder</li>
                        <li>Make sure you entered the correct email address</li>
                        <li>Wait a few minutes and try resending</li>
                    </ul>
                </div>
            </div>

            <div className="login-prompt">
                Need to use a different email?{' '}
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="logout-link"
                >
                    Sign out and try again
                </Link>
            </div>
        </div>
    );

    return (
        <>
            <Head title="Verify Email • Qindred" />
            <AuthSplitLayout
                logo={logo}
                image={tree}
                taglineText="You're almost ready to start your family tree journey! Just one quick verification step remains."
            >
                {formCard}
            </AuthSplitLayout>
        </>
    );
}
