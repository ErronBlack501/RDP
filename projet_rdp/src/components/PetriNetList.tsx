import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import type { PetriNet } from "#/types/petri";
import { petriApiClient } from "#/lib/api";
import {
  Box,
  Container,
  Heading,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  Text,
  Flex,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  useColorModeValue,
  HStack,
  Badge,
} from "@chakra-ui/react";

export function PetriNetList() {
  const [nets, setNets] = useState<PetriNet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cardBg = useColorModeValue("white", "gray.800");
  const cardHoverBg = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const textColor2 = useColorModeValue("gray.700", "gray.200");

  const loadNets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await petriApiClient.getAllNets();
      setNets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Petri nets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNets();
  }, []);

  const handleDelete = async (netId: string) => {
    if (!confirm("Are you sure you want to delete this Petri net?")) return;
    
    try {
      await petriApiClient.deleteNet(netId);
      setNets(nets.filter((n) => n.id !== netId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete net");
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Container maxW="container.xl" py={6}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="2xl">Petri Nets</Heading>
        <Button
          as={Link}
          to="/create-net"
          colorScheme="blue"
        >
          Create New Net
        </Button>
      </Flex>

      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {nets.length === 0 ? (
          <Box gridColumn="1 / -1" textAlign="center" py={8}>
            <Text color={textColor} fontSize="lg">
              No Petri nets found. Create your first one!
            </Text>
          </Box>
        ) : (
          nets.map((net) => (
            <Card
              key={net.id}
              bg={cardBg}
              _hover={{ bg: cardHoverBg, transform: "translateY(-2px)" }}
              transition="all 0.2s"
              boxShadow="sm"
              _hover={{ boxShadow: "md" }}
            >
              <CardBody>
                <Flex justify="space-between" align="start" mb={3}>
                  <Heading size="md">{net.name}</Heading>
                  <Badge colorScheme="blue" fontSize="xs">
                    {new Date(net.created_at).toLocaleDateString()}
                  </Badge>
                </Flex>

                {net.description && (
                  <Text color={textColor} mb={3} noOfLines={2}>
                    {net.description}
                  </Text>
                )}

                <HStack spacing={4} mb={4}>
                  <Text fontSize="sm" color={textColor}>
                    <strong>Places:</strong> {net.places.length}
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    <strong>Transitions:</strong> {net.transitions.length}
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    <strong>Arcs:</strong> {net.arcs.length}
                  </Text>
                </HStack>

                <Flex gap={2} wrap="wrap">
                  <Button
                    as={Link}
                    to="/net/$netId"
                    params={{ netId: net.id }}
                    size="sm"
                    colorScheme="green"
                    flex={1}
                  >
                    View & Edit
                  </Button>
                  <Button
                    as={Link}
                    to="/simulate/$netId"
                    params={{ netId: net.id }}
                    size="sm"
                    colorScheme="purple"
                    flex={1}
                  >
                    Simulate
                  </Button>
                  <Button
                    onClick={() => handleDelete(net.id)}
                    size="sm"
                    colorScheme="red"
                  >
                    Delete
                  </Button>
                </Flex>
              </CardBody>
            </Card>
          ))
        )}
      </SimpleGrid>
    </Container>
  );
}