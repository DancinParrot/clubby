import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react'
import {
  HamburgerIcon,
  CloseIcon,
} from '@chakra-ui/icons'
import DesktopNav from './nav/desktop-nav'
import { MobileNav } from './nav/mobile-nav'
import type { NavItem } from '~/types/nav'
import { signIn, signOut, useSession } from 'next-auth/react'
import { api } from '~/utils/api'

export default function Header() {
  const { isOpen, onToggle } = useDisclosure()
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.post.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  return (
    <Box>
      <Flex
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.600', 'white')}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align={'center'}>
        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}>
          <IconButton
            onClick={onToggle}
            icon={isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />}
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
          />
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
          <Text
            textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
            fontFamily={'heading'}
            color={useColorModeValue('gray.800', 'white')}>
            Clubby
          </Text>

          <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
            <DesktopNav navItems={NAV_ITEMS} />
          </Flex>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={6}>
          {
            sessionData ? (
              <>

                <Button
                  as={'a'}
                  fontSize={'sm'}
                  fontWeight={400}
                  variant={'link'}
                  href={'#'}
                >
                  {sessionData && <span>Hello, {sessionData.user?.name}</span>}
                </Button>
                <Button
                  as={'a'}
                  display={{ base: 'none', md: 'inline-flex' }}
                  fontSize={'sm'}
                  fontWeight={600}
                  color={'white'}
                  bg={'blue.400'}
                  href={'#'}
                  _hover={{
                    bg: 'blue.300',
                  }}
                  onClick={() => void signOut()}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  as={'a'}
                  fontSize={'sm'}
                  fontWeight={400}
                  variant={'link'}
                  href={'#'}
                  onClick={() => void signIn()}
                >
                  Sign In
                </Button>
                <Button
                  as={'a'}
                  display={{ base: 'none', md: 'inline-flex' }}
                  fontSize={'sm'}
                  fontWeight={600}
                  color={'white'}
                  bg={'blue.400'}
                  href={'#'}
                  _hover={{
                    bg: 'blue.300',
                  }}>
                  Sign Up
                </Button>
              </>
            )
          }
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav navItems={NAV_ITEMS} />
      </Collapse>
    </Box>
  )
}

// function AuthShowcase() {
//   const { data: sessionData } = useSession();
//
//   const { data: secretMessage } = api.post.getSecretMessage.useQuery(
//     undefined, // no input
//     { enabled: sessionData?.user !== undefined }
//   );
//
//   return (
//     <div className={styles.authContainer}>
//       <p className={styles.showcaseText}>
//         {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
//         {secretMessage && <span> - {secretMessage}</span>}
//       </p>
//       <button
//         className={styles.loginButton}
//         onClick={sessionData ? () => void signOut() : () => void signIn()}
//       >
//         {sessionData ? "Sign out" : "Sign in"}
//       </button>
//     </div>
//   );
// }

// TODO: Add real content and remove placeholder
const NAV_ITEMS: Array<NavItem> = [
  {
    label: 'About Us',
    children: [
      {
        label: 'Careers',
        subLabel: 'Join the big family here at Clubby',
        href: '#',
      },
      {
        label: 'Purpose',
        subLabel: 'Explore Clubby\'s vision',
        href: '#',
      },
    ],
  },
  {
    label: 'FAQs',
    href: '#',
  }
]

// const NAV_ITEMS: Array<NavItem> = [
//   {
//     label: 'Inspiration',
//     children: [
//       {
//         label: 'Explore Design Work',
//         subLabel: 'Trending Design to inspire you',
//         href: '#',
//       },
//       {
//         label: 'New & Noteworthy',
//         subLabel: 'Up-and-coming Designers',
//         href: '#',
//       },
//     ],
//   },
//   {
//     label: 'Find Work',
//     children: [
//       {
//         label: 'Job Board',
//         subLabel: 'Find your dream design job',
//         href: '#',
//       },
//       {
//         label: 'Freelance Projects',
//         subLabel: 'An exclusive list for contract work',
//         href: '#',
//       },
//     ],
//   },
//   {
//     label: 'Learn Design',
//     href: '#',
//   },
//   {
//     label: 'Hire Designers',
//     href: '#',
//   },
// ]
