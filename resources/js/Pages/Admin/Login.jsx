import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('admin.login.store'));
    };

    return (
        <>
            <Head title="Admin Login" />

            <div className="min-h-screen bg-off-white-bg flex items-center justify-center p-6">
                <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {/* Brand Branding */}
                    <div className="text-center mb-10">
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-gold-accent block mb-2">Oflem Admin</span>
                        <h1 className="text-4xl font-black text-primary-black tracking-tight leading-none mb-4">
                            Welcome Back
                        </h1>
                        <p className="text-sm font-bold text-gray-muted">Enter administrative credentials to proceed</p>
                    </div>

                    <div className="bg-white rounded-[40px] p-10 border border-gray-border shadow-xl shadow-gold-accent/5">
                        <form className="space-y-6" onSubmit={submit}>
                            {/* Email */}
                            <div className="space-y-1.5">
                                <InputLabel htmlFor="email" value="Admin Email" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="mt-1 block w-full"
                                    placeholder="yourname@oflem.com"
                                />
                                <InputError className="mt-2" message={errors.email} />
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <InputLabel htmlFor="password" value="Secure Password" />
                                <div className="relative">
                                    <TextInput
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="mt-1 block w-full pr-14"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-5 flex items-center text-gray-muted hover:text-gold-accent transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                <InputError className="mt-2" message={errors.password} />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-primary-black text-white font-black py-4 px-6 rounded-full hover:bg-gold-accent hover:text-primary-black transition-all duration-300 shadow-lg shadow-primary-black/10 disabled:opacity-50 mt-4 uppercase tracking-[0.2em] text-[10px]"
                            >
                                {processing ? 'Authenticating...' : 'Secure Access'}
                            </button>
                        </form>
                    </div>

                    {/* Footer Links */}
                    <div className="text-center mt-10">
                        <Link
                            href="/"
                            className="text-sm font-black text-gray-muted hover:text-gold-accent transition-colors flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Back to Oflem Portal
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
