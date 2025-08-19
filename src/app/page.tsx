'use client'

import {Button} from '@/components/ui/button'

export default function Home() {
  return (
    <main className='mx-auto max-w-3xl p-6 space-y-6'>
      <header className='space-y-1'>
        <h1 className='text-4xl font-bold tracking-tight'>Mantra Tracker</h1>
        <p className='text-muted-foreground'>Cultivate mindfulness and track your spriritual journey</p>
      </header>

      <div className='flex flex-wrap gap-3'>
        <Button onClick={() => console.log('Add Mantra')}>Add Mantra</Button>
        <Button variant='secondary' onClick={() => console.log('Export')}>Export Local</Button>
        <Button variant='secondary' onClick={() => console.log('Import')}>Import Local</Button>
        <Button variant='secondary' onClick={() => console.log('Google Drive')}>Connect Google Drive</Button>
      </div>

      <section className='pt-4'>
        <h2 className='text-lg font-semibold'>Your Journey Begins</h2>
        <p className='text-muted-foreground'>Start by adding your first mantra. Data will be locally saved.</p>
      </section>
    </main>
  )
}