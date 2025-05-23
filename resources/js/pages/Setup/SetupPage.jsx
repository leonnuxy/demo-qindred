import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useToast } from '@/components/ui/use-toast';
import WelcomeStep from '@/features/Setup/components/WelcomeStep';
import PersonalInfoStep from '@/features/Setup/components/PersonalInfoStep';
import FamilySetupStep from '@/features/Setup/components/FamilySetupStep';
import VerificationStep from '@/features/Setup/components/VerificationStep';
import CompleteStep from '@/features/Setup/components/CompleteStep';
import AppLogoIcon from '@/components/app-logo-icon';


// Import CSS for wizard
import '@css/setup/wizard.css';

export default function SetupPage() {
    const { user, relationshipTypes } = usePage().props;
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        { title: 'Welcome', component: WelcomeStep },
        { title: 'Personal Info', component: PersonalInfoStep },
        { title: 'Family Setup', component: FamilySetupStep },
        { title: 'Verification', component: VerificationStep },
        { title: 'Complete', component: CompleteStep },
    ];

    // Rename `data` -> `form`, `setData` -> `setForm`
    const {
        data: form,
        setData: setForm,
        post,
        processing,
        errors,
    } = useForm({
        firstName: user?.first_name || '',
        lastName: user?.last_name || '',
        email: user?.email || '',
        birthDate: user?.date_of_birth || '',
        gender: '',
        phone: '',
        country: '',
        city: '',
        state: '',
        bio: '',
        familyName: '',
        familyRole: '',
        familyDescription: '',
        membersToAdd: [],
    });

    // Next/back handlers
    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(s => s + 1);
            window.scrollTo(0, 0);
        }
    };
    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(s => s - 1);
            window.scrollTo(0, 0);
        }
    };

    // Final submission
    const handleComplete = () => {
        // Create a sanitized copy of the form data
        const sanitizedFormData = { ...form };
        
        // Sanitize membersToAdd for direct_add members without emails
        if (Array.isArray(sanitizedFormData.membersToAdd) && sanitizedFormData.membersToAdd.length > 0) {
            sanitizedFormData.membersToAdd = sanitizedFormData.membersToAdd.map(member => {
                if (member.type === 'direct_add') {
                    // Keep the email if it's valid, otherwise set to empty
                    // The backend will handle this appropriately
                    if (!member.email || member.email.trim() === '') {
                        return { ...member, email: '' };
                    }
                }
                return member;
            });
        }
        
        console.log('Submitting form data:', sanitizedFormData);
        
        post(route('setup.complete'), {
            data: sanitizedFormData,
            // Don't preserve state or scroll position for a clean redirect
            preserveState: false,
            preserveScroll: false,
            // Use replace: true to avoid browser history accumulation
            replace: true,
            onSuccess: () => {
                // Force a hard redirect to the dashboard to ensure proper page load
                window.location.href = route('dashboard');
            },
            onError: (errors) => {
                console.error('Setup completion errors:', errors);
                toast({
                    title: 'Error',
                    description: 'There was an error completing your setup. Please try again.',
                    variant: 'destructive',
                });
            },
        });
    };

    // Show any validation errors as toast
    useEffect(() => {
        if (Object.keys(errors).length) {
            const msg = Object.values(errors).flat().join(', ');
            toast({ title: 'Form Error', description: msg, variant: 'destructive' });
        }
    }, [errors, toast]);

    const progressPercent = ((currentStep + 1) / steps.length) * 100;
    const isCompleteStep = currentStep === steps.length - 1;
    const CurrentStepComponent = steps[currentStep].component;
    const logoText = 'Qindred';

    return (
        <>
            <Head title={`Setup — ${steps[currentStep].title}`} />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
                <div className="mx-auto max-w-3xl px-4">
                    <div className="setup-logo-container">
                        <AppLogoIcon className="setup-logo-icon" />
                        <span className="setup-logo-text">{logoText}</span>
                    </div>
                    {/* Header + Progress */}
                    {!isCompleteStep && (
                        <header className="mb-8">
                            <h1 className="text-3xl font-bold mb-2 text-center pt-10">Set Up Your Qindred Account</h1>
                            <p className="text-gray-600 mb-4">
                                Step {currentStep + 1} of {steps.length - 1}: {steps[currentStep].title}
                            </p>
                            <div className="setup-progress-bar">
                                <div
                                    className="setup-progress-indicator"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </header>
                    )}

                    {/* Step Indicators */}
                    {!isCompleteStep && (
                        <nav className="flex justify-between mb-8">
                            {steps.map((s, i) => (
                                <div key={s.title} className="flex flex-col items-center">
                                    <div
                                        className={`setup-step-indicator ${
                                            i <= currentStep
                                                ? 'setup-step-indicator-active'
                                                : 'setup-step-indicator-inactive'
                                        }`}
                                    >
                                        {i < currentStep ? (
                                            <CheckIcon className="w-5 h-5" />
                                        ) : (
                                            <span>{i + 1}</span>
                                        )}
                                    </div>
                                    <span className="mt-1 text-sm">{s.title}</span>
                                </div>
                            ))}
                        </nav>
                    )}

                    {/* Active Step */}
                    <CurrentStepComponent
                        user={user}
                        form={form}
                        setForm={setForm}
                        relationshipTypes={relationshipTypes}
                        onNext={handleNext}
                        onBack={handleBack}
                        onComplete={handleComplete}
                        processing={processing}
                        errors={errors}
                    />
                </div>
            </div>
        </>
    );
}

// Simple checkmark SVG
function CheckIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
            <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
            />
        </svg>
    );
}
