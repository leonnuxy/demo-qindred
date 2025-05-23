import { useForm } from '@inertiajs/react';
import { router } from '@inertiajs/react';

export default function useSetupForm() {
    const { data, setData, post, processing, errors, reset } = useForm({
        firstName: '',
        lastName: '',
        birthDate: '',
        gender: '',
        phone: '',
        country: '',
        bio: '',
        familyName: '',
        familyDescription: '',
        membersToAdd: []
    });

    const setForm = (updates) => {
        setData((prev) => ({
            ...prev,
            ...updates
        }));
    };

    const submit = () => {
        post(route('setup.complete'), {
            onSuccess: () => {
                reset();
            }
        });
    };

    const addFamilyMember = (member) => {
        setData('membersToAdd', [...data.membersToAdd, member]);
    };

    const removeFamilyMember = (index) => {
        setData('membersToAdd', 
            data.membersToAdd.filter((_, i) => i !== index)
        );
    };

    const updateFamilyMember = (index, updates) => {
        setData('membersToAdd', 
            data.membersToAdd.map((member, i) => 
                i === index ? { ...member, ...updates } : member
            )
        );
    };

    return {
        form: data,
        setForm,
        submit,
        processing,
        errors,
        addFamilyMember,
        removeFamilyMember,
        updateFamilyMember
    };
}
