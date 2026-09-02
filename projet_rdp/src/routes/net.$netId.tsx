import { createFileRoute } from '@tanstack/react-router'
import { PetriNetEditor } from '#/components/PetriNetEditor'

export const Route = createFileRoute('/net/$netId')({
  component: PetriNetEditor,
})