import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Button,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const cardBg = useColorModeValue('white', 'gray.800')
  const cardHoverBg = useColorModeValue('gray.50', 'gray.700')
  const infoBg = useColorModeValue('blue.50', 'blue.900')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const textColor2 = useColorModeValue('gray.700', 'gray.200')

  return (
    <Container maxW="container.xl" py={8}>
      <Heading size="2xl" mb={4}>Petri Net Simulation</Heading>
      <Text fontSize="lg" mb={8} color={textColor}>
        Welcome to the Petri Net simulation system. Create, edit, and simulate Petri nets for modeling distributed systems.
      </Text>
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} maxW="2xl" mb={8}>
        <Card
          as={Link}
          to="/nets"
          bg={cardBg}
          _hover={{ bg: cardHoverBg, transform: 'translateY(-2px)' }}
          transition="all 0.2s"
          cursor="pointer"
        >
          <CardBody>
            <Heading size="md" mb={2}>View Petri Nets</Heading>
            <Text color={textColor}>Browse and manage your Petri net models</Text>
          </CardBody>
        </Card>
        
        <Card
          as={Link}
          to="/create-net"
          bg={cardBg}
          _hover={{ bg: cardHoverBg, transform: 'translateY(-2px)' }}
          transition="all 0.2s"
          cursor="pointer"
        >
          <CardBody>
            <Heading size="md" mb={2}>Create Petri Net</Heading>
            <Text color={textColor}>Start a new Petri net model from scratch</Text>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card bg={infoBg} borderWidth="1px" borderColor="blue.200">
        <CardBody>
          <Heading size="md" mb={2}>About Petri Nets</Heading>
          <Text color={textColor2} mb={2}>
            Petri nets are a mathematical modeling tool for describing and analyzing distributed systems. 
            They consist of places (circles), transitions (bars), and arcs (arrows) that connect them.
          </Text>
          <Text color={textColor2}>
            Tokens (dots) move through the network as transitions fire, enabling the simulation of concurrent processes.
          </Text>
        </CardBody>
      </Card>
    </Container>
  )
}
