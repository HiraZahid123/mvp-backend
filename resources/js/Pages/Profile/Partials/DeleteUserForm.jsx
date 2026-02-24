import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const { t } = useTranslation();
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`${className} bg-white rounded-[32px] p-8 border border-red-100`}>
            <header className="mb-8">
                <h2 className="text-2xl font-black text-red-600 tracking-tight">
                    {t('Delete Account')}
                </h2>

                <p className="mt-2 text-sm text-gray-muted font-bold">
                    {t('Once your account is deleted, all of its resources and data will be permanently deleted. Before deleting your account, please download any data or information that you wish to retain.')}
                </p>
            </header>

            <DangerButton onClick={confirmUserDeletion}>
                {t('Delete My Account')}
            </DangerButton>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-10 bg-white rounded-[32px]">
                    <h2 className="text-2xl font-black text-oflem-charcoal tracking-tight mb-4 text-center">
                        {t('Are you absolutely sure?')}
                    </h2>

                    <p className="text-sm text-gray-muted font-bold text-center mb-10">
                        {t('This action cannot be undone. Please enter your password to confirm you would like to permanently delete your account.')}
                    </p>

                    <div className="space-y-1.5 max-w-sm mx-auto">
                        <InputLabel htmlFor="password" value={t('Password')} />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="mt-1 block w-full"
                            autoFocus
                            placeholder={t('Enter password to confirm')}
                        />
                        <InputError className="mt-2" message={errors.password} />
                    </div>

                    <div className="mt-10 flex flex-col md:flex-row justify-center gap-4">
                        <SecondaryButton 
                            onClick={closeModal}
                            className="w-full md:w-auto px-10"
                        >
                            {t('No, Cancel')}
                        </SecondaryButton>

                        <DangerButton 
                            type="submit"
                            disabled={processing}
                            className="w-full md:w-auto px-10 shadow-lg shadow-red-200"
                        >
                            {t('Yes, Delete Account')}
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
