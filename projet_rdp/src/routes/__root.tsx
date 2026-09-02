import { Outlet, createRootRoute, Link } from '@tanstack/react-router'

import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import {
  Box,
  Flex,
  Heading,
  Button,
  Container,
  useColorModeValue,
} from '@chakra-ui/react'

import '../styles.css'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const bg = useColorModeValue('blue.600', 'blue.800')
  const hoverBg = useColorModeValue('blue.700', 'blue.900')

  return (
    <>
      <Box bg={bg} color="white" py={4} boxShadow="md">
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <Heading size="lg">Petri Net Simulation</Heading>
            <Flex gap={4}>
              <Button
                as={Link}
                to="/"
                variant="ghost"
                color="white"
                _hover={{ bg: hoverBg }}
              >
                Home
              </Button>
              <Button
                as={Link}
                to="/nets"
                variant="ghost"
                color="white"
                _hover={{ bg: hoverBg }}
              >
                Petri Nets
              </Button>
              <Button
                as={Link}
                to="/create-net"
                variant="ghost"
                color="white"
                _hover={{ bg: hoverBg }}
              >
                Create Net
              </Button>
            </Flex>
          </Flex>
        </Container>
      </Box>
      <Outlet />
      <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'TanStack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </>
  )
}
