import React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select'
import { countries } from '@/utils/countryUtils'

export default function PersonalInfoStep({ form, setForm, onBack, onNext }) {
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSelectChange = (name, value) => {
        setForm(prev => ({
            ...prev,
            [name]: value,
        }))
    }

    return (
        <div>
            <h2 className="setup-step-title mb-1">Personal Information</h2>
            <p className="setup-text mb-3">
                Tell us a bit about yourself so we can personalize your experience.
            </p>

            <div className="setup-form-container space-y-3">
                {/* First and Last Name */}
                <div className="setup-form-section-grid grid grid-cols-2 gap-3">
                    <div className="form-group">
                        <label htmlFor="firstName" className="setup-form-label text-sm">
                            First Name
                        </label>
                        <Input
                            id="firstName"
                            name="firstName"
                            value={form.firstName || ''}
                            onChange={handleInputChange}
                            className="setup-form-input mt-0.5"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="lastName" className="setup-form-label text-sm">
                            Last Name
                        </label>
                        <Input
                            id="lastName"
                            name="lastName"
                            value={form.lastName || ''}
                            onChange={handleInputChange}
                            className="setup-form-input mt-0.5"
                            required
                        />
                    </div>
                </div>

                {/* Date of Birth + Gender */}
                <div className="setup-form-section-grid grid grid-cols-2 gap-3">
                    <div className="form-group">
                        <label htmlFor="birthDate" className="setup-form-label text-sm">
                            Date of Birth
                        </label>
                        <Input
                            type="date"
                            id="birthDate"
                            name="birthDate"
                            value={form.birthDate || ''}
                            onChange={handleInputChange}
                            className="setup-form-input mt-0.5"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="gender" className="setup-form-label text-sm">
                            Gender
                        </label>
                        <Select
                            value={form.gender || ''}
                            onValueChange={(val) => handleSelectChange('gender', val)}
                        >
                            <SelectTrigger id="gender" className="setup-form-input w-full mt-0.5">
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                                <SelectItem value="prefer_not_to_say">
                                    Prefer not to say
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Country */}
                <div className="form-group">
                    <label htmlFor="country" className="setup-form-label text-sm">
                        Country (Optional)
                    </label>
                    <Select
                        value={form.country || ''}
                        onValueChange={(val) => handleSelectChange('country', val)}
                    >
                        <SelectTrigger id="country" className="setup-form-input w-full mt-0.5">
                            <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                        <SelectContent>
                            {countries.map((c) => (
                                <SelectItem key={c.code} value={c.code}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* City + State */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="form-group">
                        <label htmlFor="city" className="setup-form-label text-sm">
                            City (Optional)
                        </label>
                        <Input
                            id="city"
                            name="city"
                            value={form.city || ''}
                            onChange={handleInputChange}
                            className="setup-form-input mt-0.5"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="state" className="setup-form-label text-sm">
                            State/Province (Optional)
                        </label>
                        <Input
                            id="state"
                            name="state"
                            value={form.state || ''}
                            onChange={handleInputChange}
                            className="setup-form-input mt-0.5"
                        />
                    </div>
                </div>

                {/* Phone Hidden for Now */}
                {/* <div className="form-group">
          <label htmlFor="phone" className="setup-form-label text-sm">
            Phone Number (Optional)
          </label>
          <Input
            id="phone"
            name="phone"
            value={form.phone || ''}
            onChange={handleInputChange}
            className="setup-form-input mt-0.5"
          />
        </div> */}

                {/* Bio */}
                <div className="form-group">
                    <label htmlFor="bio" className="setup-form-label text-sm">
                        Bio (Optional)
                    </label>
                    <textarea
                        id="bio"
                        name="bio"
                        rows={2}
                        value={form.bio || ''}
                        onChange={handleInputChange}
                        className="setup-form-input w-full rounded-md border border-gray-300 px-3 py-1.5 mt-0.5"
                        placeholder="Tell us a little about yourself"
                    />
                </div>
            </div>

            {/* Navigation */}
            <div className="setup-button-container mt-5">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    className="setup-button setup-button-back"
                >
                    Back
                </Button>
                <Button
                    type="button"
                    onClick={onNext}
                    className="setup-button setup-button-next"
                >
                    Next
                </Button>
            </div>
        </div>
    )
}
