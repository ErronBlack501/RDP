import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "@tanstack/react-router";
import type { PetriNet, Place, Transition, Arc, Position } from "#/types/petri";
import { petriApiClient } from "#/lib/api";
import {
  Container,
  Heading,
  Button,
  Flex,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardBody,
  HStack,
  ButtonGroup,
  Text,
  useColorModeValue,
  Box,
  VStack,
  UnorderedList,
  ListItem,
  Spinner,
} from "@chakra-ui/react";

export function PetriNetEditor() {
  const { netId } = useParams({ from: "/net/$netId" });
  const [net, setNet] = useState<PetriNet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"select" | "place" | "transition" | "arc">("select");
  const [selectedElement, setSelectedElement] = useState<{ type: "place" | "transition" | "arc"; id: string } | null>(null);
  const [arcSource, setArcSource] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const cardBg = useColorModeValue("white", "gray.800");
  const toolbarBg = useColorModeValue("gray.100", "gray.700");
  const canvasBg = useColorModeValue("white", "gray.900");
  const infoBg = useColorModeValue("gray.100", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const textColor2 = useColorModeValue("gray.700", "gray.200");

  useEffect(() => {
    loadNet();
  }, [netId]);

  const loadNet = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await petriApiClient.getNet(netId);
      setNet(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Petri net");
    } finally {
      setLoading(false);
    }
  };

  const handleCanvasClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current || !net) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === "place") {
      try {
        const place = await petriApiClient.addPlace(net.id, {
          name: `P${net.places.length + 1}`,
          position: { x, y },
          tokens: 0,
        });
        setNet({ ...net, places: [...net.places, place] });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add place");
      }
    } else if (mode === "transition") {
      try {
        const transition = await petriApiClient.addTransition(net.id, {
          name: `T${net.transitions.length + 1}`,
          position: { x, y },
        });
        setNet({ ...net, transitions: [...net.transitions, transition] });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add transition");
      }
    }
  };

  const handleElementClick = (e: React.MouseEvent, type: "place" | "transition", id: string) => {
    e.stopPropagation();
    
    if (mode === "arc") {
      if (!arcSource) {
        setArcSource(id);
      } else if (arcSource !== id) {
        // Create arc
        createArc(arcSource, id);
        setArcSource(null);
      }
    } else {
      setSelectedElement({ type, id });
    }
  };

  const createArc = async (sourceId: string, targetId: string) => {
    if (!net) return;

    try {
      // Determine arc type based on element types
      const sourcePlace = net.places.find(p => p.id === sourceId);
      const targetPlace = net.places.find(p => p.id === targetId);
      const sourceTransition = net.transitions.find(t => t.id === sourceId);
      const targetTransition = net.transitions.find(t => t.id === targetId);

      let arcType: "input" | "output";
      if (sourcePlace && targetTransition) {
        arcType = "input";
      } else if (sourceTransition && targetPlace) {
        arcType = "output";
      } else {
        setError("Invalid arc: must connect place to transition or vice versa");
        return;
      }

      const arc = await petriApiClient.addArc(net.id, {
        source_id: sourceId,
        target_id: targetId,
        arc_type: arcType,
        weight: 1,
      });
      setNet({ ...net, arcs: [...net.arcs, arc] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add arc");
    }
  };

  const handleTokensChange = async (placeId: string, delta: number) => {
    if (!net) return;

    const place = net.places.find(p => p.id === placeId);
    if (!place) return;

    const newTokens = Math.max(0, place.tokens + delta);
    
    // Update locally first for responsiveness
    const updatedPlaces = net.places.map(p => 
      p.id === placeId ? { ...p, tokens: newTokens } : p
    );
    setNet({ ...net, places: updatedPlaces });

    // You might want to sync this with the backend
  };

  const handleDeleteElement = async () => {
    if (!selectedElement || !net) return;

    try {
      if (selectedElement.type === "place") {
        const updatedPlaces = net.places.filter(p => p.id !== selectedElement.id);
        const updatedArcs = net.arcs.filter(a => a.source_id !== selectedElement.id && a.target_id !== selectedElement.id);
        setNet({ ...net, places: updatedPlaces, arcs: updatedArcs });
      } else if (selectedElement.type === "transition") {
        const updatedTransitions = net.transitions.filter(t => t.id !== selectedElement.id);
        const updatedArcs = net.arcs.filter(a => a.source_id !== selectedElement.id && a.target_id !== selectedElement.id);
        setNet({ ...net, transitions: updatedTransitions, arcs: updatedArcs });
      }
      setSelectedElement(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete element");
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!net) {
    return (
      <Container maxW="container.xl" py={6}>
        <Text color="red.500" fontSize="lg">Petri net not found</Text>
        <Button
          as={Link}
          to="/nets"
          colorScheme="blue"
          mt={4}
        >
          Back to Petri nets
        </Button>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={6}>
      <Flex justify="space-between" align="start" mb={6}>
        <Box>
          <Button
            as={Link}
            to="/nets"
            variant="ghost"
            colorScheme="blue"
            mb={2}
          >
            ← Back to Petri Nets
          </Button>
          <Heading size="2xl">{net.name}</Heading>
          {net.description && <Text color={textColor}>{net.description}</Text>}
        </Box>
        <Button
          as={Link}
          to="/simulate/$netId"
          params={{ netId: net.id }}
          colorScheme="purple"
        >
          Simulate
        </Button>
      </Flex>

      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Toolbar */}
      <Card bg={toolbarBg} mb={4}>
        <CardBody>
          <HStack spacing={2} flexWrap="wrap">
            <Button
              onClick={() => setMode("select")}
              colorScheme={mode === "select" ? "blue" : "gray"}
              size="sm"
            >
              Select
            </Button>
            <Button
              onClick={() => setMode("place")}
              colorScheme={mode === "place" ? "blue" : "gray"}
              size="sm"
            >
              Add Place
            </Button>
            <Button
              onClick={() => setMode("transition")}
              colorScheme={mode === "transition" ? "blue" : "gray"}
              size="sm"
            >
              Add Transition
            </Button>
            <Button
              onClick={() => setMode("arc")}
              colorScheme={mode === "arc" ? "blue" : "gray"}
              size="sm"
            >
              Add Arc
            </Button>
            {selectedElement && (
              <Button
                onClick={handleDeleteElement}
                colorScheme="red"
                size="sm"
              >
                Delete Selected
              </Button>
            )}
            {arcSource && (
              <Text color={textColor} fontSize="sm">
                Select target for arc...
              </Text>
            )}
          </HStack>
        </CardBody>
      </Card>

      {/* Canvas */}
      <Box
        ref={canvasRef}
        border="2px"
        borderStyle="dashed"
        borderColor="gray.300"
        borderRadius="md"
        bg={canvasBg}
        position="relative"
        h="600px"
        cursor={mode === "select" ? "default" : "crosshair"}
        onClick={handleCanvasClick}
        mb={4}
      >
        {/* Render arcs */}
        <Box position="absolute" inset={0} pointerEvents="none">
          <svg width="100%" height="100%">
            {net.arcs.map((arc) => {
              const source = [...net.places, ...net.transitions].find(n => n.id === arc.source_id);
              const target = [...net.places, ...net.transitions].find(n => n.id === arc.target_id);
              if (!source || !target) return null;

              return (
                <line
                  key={arc.id}
                  x1={source.position.x}
                  y1={source.position.y}
                  x2={target.position.x}
                  y2={target.position.y}
                  stroke={arc.arc_type === "input" ? "#3B82F6" : "#10B981"}
                  strokeWidth="2"
                  markerEnd={arc.arc_type === "input" ? "url(#arrowhead-input)" : "url(#arrowhead-output)"}
                />
              );
            })}
            <defs>
              <marker id="arrowhead-input" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#3B82F6" />
              </marker>
              <marker id="arrowhead-output" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#10B981" />
              </marker>
            </defs>
          </svg>
        </Box>

        {/* Render places */}
        {net.places.map((place) => (
          <Box
            key={place.id}
            position="absolute"
            transform="translate(-50%, -50%)"
            cursor="pointer"
            left={`${place.position.x}px`}
            top={`${place.position.y}px`}
            onClick={(e) => handleElementClick(e, "place", place.id)}
            ring={selectedElement?.type === "place" && selectedElement.id === place.id ? "2px solid blue" : arcSource === place.id ? "2px solid yellow" : "none"}
          >
            <Box
              w="64px"
              h="64px"
              borderRadius="full"
              border="4px"
              borderColor="gray.800"
              bg="white"
              display="flex"
              alignItems="center"
              justifyContent="center"
              position="relative"
            >
              <Text fontWeight="bold">{place.tokens}</Text>
              <Box
                position="absolute"
                bottom="-24px"
                left="50%"
                transform="translateX(-50%)"
                fontSize="xs"
                whiteSpace="nowrap"
              >
                {place.name}
              </Box>
            </Box>
            {selectedElement?.type === "place" && selectedElement.id === place.id && (
              <HStack position="absolute" top="-32px" left="50%" transform="translateX(-50%)" gap={1}>
                <Button
                  size="xs"
                  colorScheme="red"
                  onClick={(e) => { e.stopPropagation(); handleTokensChange(place.id, -1); }}
                >
                  -
                </Button>
                <Button
                  size="xs"
                  colorScheme="green"
                  onClick={(e) => { e.stopPropagation(); handleTokensChange(place.id, 1); }}
                >
                  +
                </Button>
              </HStack>
            )}
          </Box>
        ))}

        {/* Render transitions */}
        {net.transitions.map((transition) => (
          <Box
            key={transition.id}
            position="absolute"
            transform="translate(-50%, -50%)"
            cursor="pointer"
            left={`${transition.position.x}px`}
            top={`${transition.position.y}px`}
            onClick={(e) => handleElementClick(e, "transition", transition.id)}
            ring={selectedElement?.type === "transition" && selectedElement.id === transition.id ? "2px solid blue" : arcSource === transition.id ? "2px solid yellow" : "none"}
          >
            <Box
              w="48px"
              h="48px"
              bg="gray.800"
              display="flex"
              alignItems="center"
              justifyContent="center"
              position="relative"
            >
              <Box w="4px" h="32px" bg="white" />
              <Box
                position="absolute"
                bottom="-24px"
                left="50%"
                transform="translateX(-50%)"
                fontSize="xs"
                whiteSpace="nowrap"
              >
                {transition.name}
              </Box>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Info panel */}
      <Card bg={infoBg}>
        <CardBody>
          <Heading size="md" mb={2}>Instructions:</Heading>
          <UnorderedList spacing={1} fontSize="sm">
            <ListItem>Select "Add Place" and click on canvas to add places</ListItem>
            <ListItem>Select "Add Transition" and click on canvas to add transitions</ListItem>
            <ListItem>Select "Add Arc", click source, then click target to connect</ListItem>
            <ListItem>Click on places to select and adjust token count</ListItem>
            <ListItem>Use "Delete Selected" to remove elements</ListItem>
          </UnorderedList>
        </CardBody>
      </Card>
    </Container>
  );
}