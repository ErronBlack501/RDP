import { createFileRoute } from '@tanstack/react-router'
import { PetriNetList } from '#/components/PetriNetList'

export const Route = createFileRoute('/sessions')({
  component: PetriNetList,
})