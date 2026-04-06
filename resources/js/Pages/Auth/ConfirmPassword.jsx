import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import useTranslation from '@/Hooks/useTranslation';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';
import BackButton from '@/Components/BackButton';

export default function ConfirmPassword() {
    const { t } = useTranslation();
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
            heroHeading={t('auth.confirm_password.hero_title')}
            heroSubtext={t('auth.confirm_password.hero_subtitle')}
            bgAccentClass="bg-cream-accent"
        >
            <Head title={t('auth.confirm_password.title')} />

            <div className="mb-8 lg:mb-10 text-center lg:text-left relative">
                <BackButton 
                    href={route('dashboard')} 
                    className="absolute -top-12 left-0" 
                />

                <h2 className="text-lg font-medium text-oflem-charcoal mb-1">{t('common.app_name')}</h2>
                <h1 className="text-[32px] lg:text-[40px] font-black text-oflem-charcoal mb-2 tracking-tight">{t('auth.confirm_password.title')}</h1>
                <p className="text-gray-muted text-sm font-medium">{t('auth.confirm_password.subtitle')}</p>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <div className="space-y-1.5">
                    <InputLabel htmlFor="password" value={t('auth.confirm_password.password_label')} />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder={t('auth.confirm_password.password_placeholder')}
                        required
                        autoFocus
                    />
                    <InputError message={errors.password} />
                </div>

                <div className="pt-4">
                    <PrimaryButton className="w-full" disabled={processing}>
                        {t('auth.confirm_password.button')}
                    </PrimaryButton>
                </div>
            </form>
        </AuthSplitLayout>
    );
}
