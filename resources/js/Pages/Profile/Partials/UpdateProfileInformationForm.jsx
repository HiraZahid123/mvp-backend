import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';
import { useState, useRef } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;
    const { t } = useTranslation();
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(user.avatar);

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            avatar: null,
            _method: 'PATCH',
        });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('avatar', file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const submit = (e) => {
        e.preventDefault();

        post(route('profile.update'));
    };

    return (
        <section className={`${className} bg-white rounded-[32px] p-8 border border-gray-border`}>
            <header className="mb-8">
                <h2 className="text-2xl font-black text-primary-black tracking-tight">
                    {t('Profile Information')}
                </h2>

                <p className="mt-2 text-sm text-gray-muted font-bold">
                    {t("Update your account's profile information and email address.")}
                </p>
            </header>

            <div className="mb-6 flex items-center gap-4">
                 <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gray-100 border border-gray-border overflow-hidden flex items-center justify-center">
                         {preview ? (
                            <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-2xl font-black text-gray-400">{user.name.charAt(0)}</span>
                        )}
                    </div>
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-border hover:bg-gold-accent transition-colors"
                    >
                         <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </div>
                <div>
                     <button 
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className="text-sm font-black text-primary-black hover:text-gold-accent transition-colors"
                    >
                        Change Photo
                    </button>
                    <p className="text-xs text-gray-muted font-bold">JPG, GIF or PNG. Max 1MB.</p>
                </div>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <div className="space-y-1.5">
                    <InputLabel htmlFor="name" value={t('Full Name')} />
                    <TextInput
                        id="name"
                        type="text"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoFocus
                        autoComplete="name"
                        placeholder="Enter your full name"
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div className="space-y-1.5">
                    <InputLabel htmlFor="email" value={t('Email Address')} />
                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                        placeholder="Enter your email address"
                    />
                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="p-4 bg-cream-accent rounded-[16px] border border-gold-accent/20">
                        <p className="text-sm text-primary-black font-bold">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="ml-2 font-black text-gold-accent hover:underline focus:outline-none"
                            >
                                Click here to re-send.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-xs font-black text-green-600">
                                A new verification link has been sent!
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4 pt-4">
                    <PrimaryButton disabled={processing} className="px-10">
                        {t('Save Changes')}
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-xs font-black text-green-600">
                            Saved Successfully!
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
