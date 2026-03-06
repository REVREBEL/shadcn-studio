// React Imports
import type { ReactNode } from 'react'

// Component Imports
import ScrollToTop from '@/components/layout/ScrollToTop'

const FrontContent = ({ children }: { children: ReactNode }) => {
  return (
    <main className='flex min-h-0 flex-1 flex-col'>
      <div className='mx-auto flex min-h-0 w-full flex-1 max-w-[1400px] border-dashed min-[1400px]:border-x min-[1800px]:max-w-[1536px]'>
        {children}
      </div>
      <ScrollToTop />
    </main>
  )
}

export default FrontContent
