'use client';

import TrainingPage from '@/components/Training'
import withAdminLayout from '@/components/Layouts/GeneralLayout';

const Training = () => {
    return (
        <div>
            <TrainingPage />
        </div>
    )
}

export default withAdminLayout(Training);