import { Stack, useColorModeValue } from "@chakra-ui/react";
import { MobileNavItem } from "./mobile-nav-item";
import type { NavItem } from "~/types/nav";

interface Props {
  navItems: NavItem[];
}

export function MobileNav({ navItems }: Props) {
  return (
    <Stack bg={useColorModeValue('white', 'gray.800')} p={4} display={{ md: 'none' }}>
      {navItems.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  )
}
