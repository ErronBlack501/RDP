import { createFileRoute } from '@tanstack/react-router'
import { PetriNetSimulator } from '#/components/PetriNetSimulator'

export const Route = createFileRoute('/simulate/$netId')({
  component: PetriNetSimulator,
})