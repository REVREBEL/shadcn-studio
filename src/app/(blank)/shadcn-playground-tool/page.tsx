import { Playground } from '@/components/playground/playground'

export default async function Page({
  searchParams
}: {
  searchParams: Promise<{ code?: string; css?: string }>
}) {
  const { code, css } = await searchParams

  const decode = (value?: string) => {
    if (!value) return undefined

    try {
      return Buffer.from(value, 'base64url').toString('utf-8')
    } catch {
      return undefined
    }
  }

  const initialCode = decode(code)
  const initialGlobalCSS = decode(css)

  return (
    <section className='flex h-dvh w-full flex-col overflow-hidden'>
      <div className='min-h-0 h-full flex-1'>
        <Playground initialCode={initialCode} initialGlobalCSS={initialGlobalCSS} />
      </div>
    </section>
  )
}
