'use client';

import AraDealsView from '@/components/AraComponents/DealsView'
import withAdminLayout from '@/components/Layouts/GeneralLayout';

const Deals = () => {
    return (
        <div>
            <AraDealsView />
        </div>
    )
}

export default withAdminLayout(Deals);