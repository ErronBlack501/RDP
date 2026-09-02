import { createFileRoute } from '@tanstack/react-router'
import { CreatePetriNet } from '#/components/CreatePetriNet'

export const Route = createFileRoute('/create-session')({
  component: CreatePetriNet,
})