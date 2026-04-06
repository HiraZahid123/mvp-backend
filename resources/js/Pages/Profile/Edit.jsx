import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import BackButton from '@/Components/BackButton';

export default function Edit({ mustVerifyEmail, status }) {
    const { t } = useTranslation();

    return (
        <DashboardLayout
            header={t('Profile Settings')}
        >
            <Head title={t('Profile')} />

            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">
                <UpdateProfileInformationForm
                    mustVerifyEmail={mustVerifyEmail}
                    status={status}
                />

                <UpdatePasswordForm />

                <DeleteUserForm />
            </div>
        </DashboardLayout>
    );
}
