import { OrganizationSwitcher, SignedIn, SignOutButton } from '@clerk/nextjs'
import Link from 'next/link'
import React from 'react'

const TopBar = () => {
    const isUserLoggedIn = true
    return (
        <nav className='topbar'>
            <Link href='/' className='flex items-center gap-4'>
                <img src='/logo.svg' alt='logo' className='w-8 h-8' />
                <p className='text-heading3-bold text-light-1 max-xs:hidden'>Threads</p>
            </Link>
            <div className='flex items-center gap-1'>
                <div className='block md:hidden'>
                    <SignedIn>
                        <SignOutButton>
                            <div className='flex cursor-pointer'>
                                <img src="/logout.svg" alt="Logout" width={24} height={24} />
                            </div>
                        </SignOutButton>
                    </SignedIn>
                </div>
                <OrganizationSwitcher appearance={{ elements: { organizationSwitcherTrigger: 'py-2 px-4 text-light-1' } }} />
            </div>
        </nav>
    )
}

export default TopBar