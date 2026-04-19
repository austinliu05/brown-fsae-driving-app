import React from 'react'

interface FiltersBaseProps{
    children: React.ReactNode;
}

export default function FiltersBase({children} : FiltersBaseProps){
    return (
        <div className='flex flex-col gap-3 mb-6 sm:gap-4 md:flex-row md:flex-wrap'>
            {children}
        </div>
    )
}