import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import BackButton from '@/Components/BackButton';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout header="Profile Settings">
            <Head title="Profile" />

            <div className="mb-6">
                <BackButton href={route('dashboard')} />
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
                <UpdateProfileInformationForm
                    mustVerifyEmail={mustVerifyEmail}
                    status={status}
                />

                <UpdatePasswordForm />

                <DeleteUserForm />
            </div>
        </AuthenticatedLayout>
    );
}
