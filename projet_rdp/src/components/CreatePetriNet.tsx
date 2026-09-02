import { Link } from "@tanstack/react-router";
import { useState } from "react";
import type { PetriNetCreate } from "#/types/petri";
import { petriApiClient } from "#/lib/api";
import {
  Container,
  Heading,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardBody,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";

export function CreatePetriNet() {
  const [formData, setFormData] = useState<PetriNetCreate>({
    name: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const cardBg = useColorModeValue("white", "gray.800");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const net = await petriApiClient.createNet(formData);
      setSuccess(true);
      // Redirect to the net editor
      window.location.href = `/net/${net.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create Petri net");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <Container maxW="container.md" py={6}>
      <Heading size="2xl" mb={6}>Create Petri Net</Heading>

      <Button
        as={Link}
        to="/nets"
        variant="ghost"
        colorScheme="blue"
        mb={4}
      >
        ← Back to Petri Nets
      </Button>

      {success && (
        <Alert status="success" mb={4}>
          <AlertIcon />
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>Petri net created successfully!</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card bg={cardBg} boxShadow="md">
        <CardBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Production System"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Optional description of the Petri net"
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                isLoading={loading}
                loadingText="Creating..."
                width="full"
              >
                Create Petri Net
              </Button>
            </VStack>
          </form>
        </CardBody>
      </Card>
    </Container>
  );
}