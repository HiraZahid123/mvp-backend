import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';
import BackButton from '@/Components/BackButton';

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

    return (
        <AuthSplitLayout
            heroHeading="Secure Access"
            heroSubtext="Please confirm your password to proceed to this sensitive area."
            bgAccentClass="bg-cream-accent"
        >
            <Head title="Confirm Password" />

            <div className="mb-8 lg:mb-10 text-center lg:text-left relative">
                <BackButton 
                    href={route('dashboard')} 
                    className="absolute -top-12 left-0" 
                />

                <h2 className="text-lg font-medium text-primary-black mb-1">Oflem</h2>
                <h1 className="text-[32px] lg:text-[40px] font-black text-primary-black mb-2 tracking-tight">Confirm Password</h1>
                <p className="text-gray-muted text-sm font-medium">This is a secure area. Please confirm your password before continuing.</p>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <div className="space-y-1.5">
                    <InputLabel htmlFor="password" value="Password" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="Enter your password"
                        required
                        autoFocus
                    />
                    <InputError message={errors.password} />
                </div>

                <div className="pt-4">
                    <PrimaryButton className="w-full" disabled={processing}>
                        Confirm
                    </PrimaryButton>
                </div>
            </form>
        </AuthSplitLayout>
    );
}
