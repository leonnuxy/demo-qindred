import React from 'react';


export default function WelcomeStep({ form, onNext }) {
    return (
        <div className="welcome-step">
            
            <h2 className="setup-step-title">
                Welcome to Qindred{form.firstName ? `, ${form.firstName}` : '!'}
            </h2>
            <p className="setup-text setup-text-mb-8">
                Let's set up your account and start building your family tree. This will only take a few minutes.
            </p>
            
            <div className="welcome-features">
                <div className="welcome-feature">
                    <div className="welcome-feature-icon">
                        <svg className="checkmark-icon" viewBox="0 0 24 24">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="welcome-feature-text">
                        <h4 className="welcome-feature-title">Update your personal details</h4>
                        <p className="welcome-feature-description">Complete your profile with personal information</p>
                    </div>
                </div>
                
                <div className="welcome-feature">
                    <div className="welcome-feature-icon">
                        <svg className="checkmark-icon" viewBox="0 0 24 24">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="welcome-feature-text">
                        <h4 className="welcome-feature-title">Create your first family tree</h4>
                        <p className="welcome-feature-description">Set up the foundation for your family connections</p>
                    </div>
                </div>
                
                <div className="welcome-feature">
                    <div className="welcome-feature-icon">
                        <svg className="checkmark-icon" viewBox="0 0 24 24">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="welcome-feature-text">
                        <h4 className="welcome-feature-title">Add family members</h4>
                        <p className="welcome-feature-description">Invite relatives or add their information directly</p>
                    </div>
                </div>
            </div>
            
            <div className="setup-button-wrapper">
                <button
                    type="button"
                    onClick={onNext}
                    className="setup-button setup-button-next setup-button-large-padding"
                >
                    Get Started
                </button>
            </div>
        </div>
    );
}
