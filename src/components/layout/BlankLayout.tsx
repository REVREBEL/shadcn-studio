// React Imports
import type { ReactNode } from 'react'

const BlankLayout = ({ children }: { children: ReactNode }) => {
  return <div className='h-dvh w-full overflow-hidden'>{children}</div>
}

export default BlankLayout
