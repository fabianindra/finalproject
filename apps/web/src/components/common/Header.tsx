import React from 'react';
import { HStack, Heading, Button, Text } from '@chakra-ui/react';
import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <HStack justifyContent={'space-between'} className="sticky px-20 py-8 bg-[#FFFFFF]">
      <HStack>
        <Link href={"/"}>
          <Heading ml={-4} color={'primary'} as="h2" size="lg">
            Hostel
          </Heading>
        </Link>
      </HStack>

      <HStack>
        <Button border={'2px'} borderColor={'gray.300'} borderRadius={50} variant="outline">
          <Text fontWeight={'light'}>Transaction</Text>
        </Button>
        <Link href={"/register"}>
          <Button border={'2px'} borderColor={'gray.300'} borderRadius={50} variant="outline">
            <Text fontWeight={'light'}>Register</Text>
          </Button>
        </Link>
      </HStack>
    </HStack>
  );
};

export default Header;
