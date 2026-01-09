import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';
import { useRef } from 'react';

export default function UpdatePasswordForm({ className = '' }) {
    const { t } = useTranslation();
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={`${className} bg-white rounded-[32px] p-8 border border-gray-border`}>
            <header className="mb-8">
                <h2 className="text-2xl font-black text-primary-black tracking-tight">
                    {t('Update Password')}
                </h2>

                <p className="mt-2 text-sm text-gray-muted font-bold">
                    {t('Ensure your account is using a long, random password to stay secure.')}
                </p>
            </header>

            <form onSubmit={updatePassword} className="space-y-6">
                <div className="space-y-1.5">
                    <InputLabel htmlFor="current_password" value={t('Current Password')} />
                    <TextInput
                        id="current_password"
                        ref={currentPasswordInput}
                        type="password"
                        className="mt-1 block w-full"
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        autoComplete="current-password"
                        placeholder={t('Enter current password')}
                    />
                    <InputError className="mt-2" message={errors.current_password} />
                </div>

                <div className="space-y-1.5">
                    <InputLabel htmlFor="password" value={t('New Password')} />
                    <TextInput
                        id="password"
                        ref={passwordInput}
                        type="password"
                        className="mt-1 block w-full"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        autoComplete="new-password"
                        placeholder={t('Enter new password')}
                    />
                    <InputError className="mt-2" message={errors.password} />
                </div>

                <div className="space-y-1.5">
                    <InputLabel htmlFor="password_confirmation" value={t('Confirm New Password')} />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        className="mt-1 block w-full"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        autoComplete="new-password"
                        placeholder={t('Confirm new password')}
                    />
                    <InputError className="mt-2" message={errors.password_confirmation} />
                </div>

                <div className="flex items-center gap-4 pt-4">
                    <PrimaryButton disabled={processing} className="px-10">
                        {t('Update Password')}
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-xs font-black text-green-600">
                            {t('Password Updated!')}
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
