import { CreateBraaiForm } from '@/components/braai/create-braai-form'

export default function CreateBraaiPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create a Braai</h1>
        <p className="text-muted-foreground">
          Fill in the details and share the invite link with your mates.
        </p>
      </div>
      <CreateBraaiForm />
    </div>
  )
}
