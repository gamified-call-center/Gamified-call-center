'use client';
import AccessControlView from '@/components/AccessControlView';
import withAdminLayout from '@/components/Layouts/GeneralLayout';

const AccessControl = () => {
    return (
        <div>
            <AccessControlView />
        </div>
    )
}

export default withAdminLayout(AccessControl);