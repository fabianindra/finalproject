import {
  Card,
  CardBody,
  HStack,
  Heading,
  CardFooter,
  Box,
  Image,
  Text,
  Button,
  useDisclosure,
} from '@chakra-ui/react';
import { MapPin } from '@phosphor-icons/react';
import { PencilSimple, User } from '@phosphor-icons/react/dist/ssr';
import React from 'react';
import Link from 'next/link';
import ModalEditRoom from './ModalEditRoom';
import ModalDeleteRoom from './ModalDeleteRoom';
import ModalRoomDetail from '../property-detail/ModalRoomDetail';

export default function CustomCardRoom({
  id,
  capacity,
  name,
  price,
  dashboard,
  fetchRooms,
  startDate,
  endDate,
}: {
  id: number;
  capacity: string;
  name: string;
  price: number;
  dashboard: boolean;
  fetchRooms: any;
  startDate: Date | null;
  endDate: Date | null;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenDetail,
    onOpen: onOpenDetail,
    onClose: onCloseDetail,
  } = useDisclosure();

  const formatDate = (date: Date | null): string => {
    return date ? date.toISOString().split('T')[0] : '';
  };

  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);

  return (
    <Card maxW="xs">
      <CardBody>
        <Image
          src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
          alt="Green double couch with wooden legs"
          borderRadius="lg"
        />
        <Link
          href={{
            pathname: `/list-property/${id}`,
            query: { formattedStartDate, formattedEndDate },
          }}
          passHref
        >
          <Heading size="md" mt={4}>
            {name}
          </Heading>
        </Link>
      </CardBody>
      <CardFooter flexDirection={'column'}>
        <HStack justifyContent={'space-between'}>
          <HStack>
            <User size={20} weight="fill" />
            <Text fontSize={'sm'}>{capacity}</Text>
          </HStack>
          <Box>
            <Text fontSize={'md'} fontWeight={'bold'}>
              Rp. {price}
            </Text>
          </Box>
        </HStack>
        <Text
          mt={8}
          fontSize={'sm'}
          className=" text-primary underline cursor-pointer"
          onClick={onOpenDetail}
        >
          See Details
        </Text>
        {dashboard ? (
          <HStack justifyContent={'end'} mb={4} mt={6}>
            <Button
              onClick={onOpen}
              rightIcon={<PencilSimple size={20} />}
              colorScheme="blue"
            >
              Edit
            </Button>
            <ModalDeleteRoom id={id} fetchRooms={fetchRooms} />
          </HStack>
        ) : null}
        <ModalRoomDetail
          isOpen={isOpenDetail}
          onClose={onCloseDetail}
          roomId={id}
          dashboard={dashboard}
          title={name}
          startDate={startDate}
          endDate={endDate}
        />
        <ModalEditRoom
          isOpen={isOpen}
          onClose={onClose}
          roomId={id}
          fetchRooms={fetchRooms}
        />
      </CardFooter>
    </Card>
  );
}
